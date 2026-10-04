---
course_id: de101
project_id: de101-x02
title: "Three-Source Ingestion: Inventory Files, a Flaky Campaigns API, and the Orders Database"
kind: supplementary-project
status: draft
hours_estimate: 7
difficulty: core
related_lessons:
  - de101-06
  - de101-07
objectives:
  - Build a repeatable ingestion job that reads from a file, an HTTP API, and a database
  - Explain the difference between ETL and ELT and when each is appropriate
competency_ids:
  - D1-S1-C02
  - D1-S1-C01
---

## Scenario

The retailer from lesson 6's practice wants its three sources landed nightly: store inventory CSVs dropped in a folder, the marketing platform's campaigns API, and the `orders` table in the e-commerce database from lesson 4. Last quarter a hand-run script double-loaded a week of orders after someone re-ran it, and an API outage left a silent gap nobody noticed for nine days. You are asked to build the ingestion job from lesson 7 properly — and to prove, with tests, that it is safe to re-run, survives the API's rate limiting, and never advances its watermark past data it did not land.

Everything runs locally with the Python standard library, `requests`, `sqlite3`, and `pytest`. The "API" is a tiny local server you run yourself.

## What you will build / produce

- `fake_api.py` — a local HTTP server serving 2,000 synthetic campaign records with cursor pagination, an `updated_since` filter, and HTTP 429 on roughly one request in ten.
- `ingest/` — the `Source` protocol, `CsvFileSource`, `ApiSource`, `DatabaseSource`, `land()`, a JSON-file `WatermarkStore`, and `run()` from lesson 7.
- `sources.yaml` — config for all three sources; credentials referenced by environment variable name only.
- `tests/test_ingest.py` — the suite below, passing.
- `DESIGN.md` — 300 words: is this pipeline ETL, ELT, or EtLT? Name what happens where, and how a change to the definition of "active campaign" six months from now would be handled.

## Before you start (prerequisites, starter files or data)

- Python 3.10+, `pip install requests sqlalchemy pyyaml pytest`.
- **Inventory files** (generate three days into `fixtures/inventory/`): `inventory_2024-03-15.csv` etc. with `store_id,sku,count_date,on_hand`; 500 rows each. Give one file a UTF-8 byte-order mark and one a `sku` value containing a quoted comma (`"BK-119, blue"`).
- **Campaigns API** (`fake_api.py --port 8799 --seed 3`): records `{campaign_id, name, channel, sent, opened, clicked, updated_at}`; `GET /campaigns?limit=&updated_since=` returns `{"data": [...], "next_page_url": "..."}`; returns `429` with `Retry-After: 0.1` every 10th request (deterministic counter so tests are stable); requires header `Authorization: Bearer <token>` matching env `CAMPAIGNS_API_TOKEN`.
- **Database**: `shop.db` from lesson 4 (or de101-x01's generator) with `orders` carrying `updated_at`.

## Milestones

1. **Readers.** Implement the three sources as streaming iterators that yield `Batch` objects; nothing loads a whole source into memory. The CSV reader uses `utf-8-sig` and `csv.DictReader` and adds `_source_file`.
2. **Landing.** `land()` writes gzipped JSONL under `landing/<source>/ingest_date=YYYY-MM-DD/<run_id>-<uuid>.jsonl.gz` with `_source`, `_run_id`, `_ingested_at`, `_payload`.
3. **Retry and pagination.** `ApiSource._get` honours `Retry-After`, backs off exponentially up to a cap, retries 429/5xx only, never 4xx, has a timeout, and stops after a hard maximum page count.
4. **Watermarks.** Per-source watermarks in `state/watermarks.json`, ISO-8601 text, written only after the loop completes; a one-hour overlap on read.
5. **Run log and alerting.** Append a run-log row per source per run (run id, start/end, rows, files, status). Flag "succeeded with zero rows" when the previous five runs averaged more than 100 rows.
6. **Downstream dedup.** A small SQL step loads landed orders into `staging_orders` with a merge on `order_id` (SQLite `INSERT ... ON CONFLICT DO UPDATE`), so the overlap window never creates duplicates.
7. **Design note.** Write `DESIGN.md`.

## Acceptance criteria

- [ ] `pytest -q` passes with `fake_api.py` started by the test fixture.
- [ ] No credential value appears in any file; `sources.yaml` holds only `token_env: CAMPAIGNS_API_TOKEN`.
- [ ] Running the job twice in a row lands only the overlap window the second time, and `staging_orders` row count is unchanged.
- [ ] Killing the run mid-database-source (simulated by an exception after the first batch) leaves the watermark unchanged.
- [ ] The run log shows the number of 429 retries handled.
- [ ] `DESIGN.md` names the layer where each transformation happens and explains why raw history makes the definition change cheap.

## Automated checks (coding courses) / Evidence checklist (non-coding)

```python
# tests/test_ingest.py
import gzip
import json
import os
import sqlite3
import subprocess
import sys
import time
from pathlib import Path

import pytest

from ingest import ApiSource, CsvFileSource, DatabaseSource, JsonWatermarkStore, run

TOKEN = "test-token-not-secret"


@pytest.fixture(scope="session", autouse=True)
def api():
    env = dict(os.environ, CAMPAIGNS_API_TOKEN=TOKEN)
    p = subprocess.Popen([sys.executable, "fake_api.py", "--port", "8799", "--seed", "3"], env=env)
    time.sleep(1.0)
    yield "http://localhost:8799"
    p.terminate()


def landed_records(root: Path, source: str):
    out = []
    for f in sorted((root / source).rglob("*.jsonl.gz")):
        with gzip.open(f, "rt", encoding="utf-8") as fh:
            out.extend(json.loads(line) for line in fh)
    return out


def test_csv_handles_bom_and_quoted_comma(tmp_path):
    src = CsvFileSource(Path("fixtures/inventory"), "inventory_*.csv", batch_size=100)
    rows = [r for b in src.read(None) for r in b.records]
    assert "store_id" in rows[0], "BOM leaked into the first column name"
    assert any(r["sku"] == "BK-119, blue" for r in rows)
    assert all("_source_file" in r for r in rows)


def test_api_survives_429_and_paginates(api, tmp_path):
    src = ApiSource(api, TOKEN, page_size=100)
    records = [r for b in src.read(None) for r in b.records]
    assert len(records) == 2000
    assert src.retries >= 1, "expected at least one 429 retry to be recorded"


def test_api_does_not_retry_auth_errors(api):
    src = ApiSource(api, "wrong-token", page_size=100)
    with pytest.raises(Exception):
        list(src.read(None))
    assert src.retries == 0


def test_second_run_lands_only_overlap(api, tmp_path):
    store = JsonWatermarkStore(tmp_path / "wm.json")
    src = ApiSource(api, TOKEN, page_size=100)
    first = run(src, store, tmp_path / "landing")
    second = run(src, store, tmp_path / "landing")
    assert first["rows"] == 2000
    assert second["rows"] < first["rows"]


def test_watermark_not_advanced_on_failure(tmp_path):
    class Exploding(DatabaseSource):
        def read(self, since):
            it = super().read(since)
            yield next(it)
            raise RuntimeError("simulated crash")

    store = JsonWatermarkStore(tmp_path / "wm.json")
    src = Exploding("sqlite:///shop.db", batch_size=50)
    with pytest.raises(RuntimeError):
        run(src, store, tmp_path / "landing")
    assert store.get(src.name) is None


def test_watermarks_are_iso_text(api, tmp_path):
    store = JsonWatermarkStore(tmp_path / "wm.json")
    run(DatabaseSource("sqlite:///shop.db", batch_size=500), store, tmp_path / "landing")
    wm = store.get("orders_db")
    assert "T" in wm, f"watermark {wm!r} is not ISO-8601 with a T separator"


def test_merge_absorbs_overlap(tmp_path):
    from ingest.staging import load_orders
    store = JsonWatermarkStore(tmp_path / "wm.json")
    db_src = DatabaseSource("sqlite:///shop.db", batch_size=500)
    run(db_src, store, tmp_path / "landing")
    run(db_src, store, tmp_path / "landing")
    con = sqlite3.connect(tmp_path / "staging.db")
    load_orders(con, tmp_path / "landing")
    n = con.execute("SELECT COUNT(*) FROM staging_orders").fetchone()[0]
    distinct = con.execute("SELECT COUNT(DISTINCT order_id) FROM staging_orders").fetchone()[0]
    assert n == distinct


def test_no_secrets_in_config():
    text = Path("sources.yaml").read_text()
    assert TOKEN not in text and "Bearer" not in text
```

Note: `ApiSource` must expose a `retries` counter, and `DatabaseSource` must accept a SQLAlchemy-style DSN (`sqlite:///shop.db`). Put both in the starter README.

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Repeatability | Re-run duplicates data | Overlap + merge proven; watermark after success | Backfill by date range through the same code path |
| Resilience | Retries everything or nothing | 429/5xx retried with backoff, 4xx not, timeout and page cap | Jitter added and justified |
| Observability | Print statements | Run log with rows, files, retries, status; zero-rows flag | Run log queried to show last five runs as evidence |
| ETL/ELT reasoning | Acronym only | Names what happens in each layer and why | Shows how a definition change is rebuilt from raw without re-extracting |

## Stretch goals

- Replace the JSON watermark store with a SQLite table and make `set` transactional.
- Add a fourth source (any free public API) using only your operations note, as lesson 7 practice 5 suggests.

## Reflection prompts

- Which line of your runner makes the job safe to re-run, and what breaks if you move it?
- Where does your pipeline sit on the ETL/ELT spectrum, and what single requirement would push it the other way?

## Instructor notes (common pitfalls, how to adapt for time)

- Watermark format mismatches (space vs `T`) are the most common silent bug; `test_watermarks_are_iso_text` targets it (see the lesson 7 note added in this pass).
- Learners often retry 401s; `test_api_does_not_retry_auth_errors` catches it.
- Provide `fake_api.py` if time is short; the learning is in the client.
