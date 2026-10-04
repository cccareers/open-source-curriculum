---
course_id: de210
project_id: de210-x01
title: "orders_daily on a Laptop: Airflow + dbt + DuckDB with a Circuit Breaker"
kind: supplementary-project
status: draft
hours_estimate: 10
difficulty: core
related_lessons:
  - de210-03
  - de210-04
  - de210-05
  - de210-06
objectives:
  - Build an Airflow DAG with dependencies, retries, and idempotent tasks
  - Implement layered dbt models with tests and documentation
  - Add validation gates that stop bad data before it reaches a consumer
competency_ids:
  - D1-S1-C01
  - D1-S1-C02
  - D6-S1-C03
  - D2-S1-C03
---

## Scenario

You are building the course's running pipeline, `orders_daily`, end to end on your own machine before the team moves it to the cloud warehouse. It pulls the orders API, picks up the `partner_x` file drop, lands both raw and interval-partitioned, builds staging/intermediate/mart models with dbt, and publishes `fct_orders` only if quality gates pass — otherwise consumers keep yesterday's good table. Finance reads `fct_orders` every morning; a wrong number is worse than a late one.

DuckDB stands in for the warehouse: it is a single file, needs no server, and dbt supports it through the `dbt-duckdb` adapter. Every concept transfers to Snowflake, BigQuery, or Redshift.

## What you will build / produce

```text
orders-daily/
├── dags/orders_daily.py
├── fake_sources/api.py          # tiny local HTTP API (stdlib http.server)
├── fake_sources/drop.py         # writes partner_x files + _MANIFEST.json
├── ingest/                       # plain Python called by tasks (testable without Airflow)
├── analytics/                    # dbt project (dbt-duckdb)
├── tests/test_dag.py
├── tests/test_ingest.py
└── RUNBOOK.md
```

## Before you start (prerequisites, starter files or data)

- Python 3.11, `pip install "apache-airflow==2.10.*" dbt-duckdb duckdb pytest requests` (use Airflow's published constraints file for your Python version). Run Airflow with `airflow standalone`. This project targets Airflow 2.x to match lesson 3; see the instructor notes for Airflow 3.
- **Synthetic orders API** (`fake_sources/api.py`): serves `GET /v1/orders?updated_after=&updated_before=&cursor=&limit=` from an in-memory list of 5,000 orders generated with `random.seed(11)`:
  - fields `order_id` (`O-00001`...), `customer_id` (`C-001`...`C-400`), `status` in `pending|paid|shipped|cancelled` with 2% `Paid ` / `canceled` variants, `amount_usd` (string, 5.00-400.00), `created_at`, `updated_at` across 2024-03-01..2024-03-14;
  - cursor pagination at 200 per page; returns HTTP 429 with `Retry-After: 1` on every 7th request.
- **Partner file drop** (`fake_sources/drop.py --ds 2024-03-05 --root incoming/`): writes 3 CSV files of refunds (`order_id,refund_amount,refunded_at`) into `incoming/partner_x/<ds>/` and a `_MANIFEST.json` with SHA-256 checksums. `--root` defaults to `incoming/`. A `--corrupt` flag writes one file whose checksum does not match.

## Milestones

1. **Ingest as plain functions.** In `ingest/`, write `extract_orders(start, end, out_root) -> Path` and `ingest_drop(ds, in_root, out_root, registry_path) -> dict`. Both write to `raw/<source>/dt=<ds>/`, publish `_SUCCESS` last, and are idempotent: re-running for the same interval replaces, never appends. `ingest_drop` verifies checksums, skips files already in the registry, and quarantines bad files to `rejected/` with a reason.
2. **Wire the DAG.** `orders_daily` with `schedule="0 2 * * *"`, fixed `start_date=datetime(2024, 3, 1)`, `catchup=False`, `max_active_runs=1`, retries 3 with exponential backoff, 30-minute `execution_timeout`. Extract tasks run in parallel inside a `TaskGroup("extract")`; the API task is in a pool `orders_api` of size 2. Tasks receive `data_interval_start` / `data_interval_end` and never call `now()`.
3. **dbt layers.** `stg_orders` (view: cast, lowercase/trim status, map `canceled`→`cancelled`), `stg_refunds`, `int_orders_enriched` (dedupe latest per `order_id`, join refunds), `fct_orders` (incremental, `unique_key='order_id'`, filter on `_ingested_at`). Sources declare freshness on `_ingested_at`. Set `_ingested_at` deterministically from the supplied interval end, so extracts and backfills do not need a wall-clock call and retain identical bytes.
4. **Gates and the circuit breaker.** Build `fct_orders` into schema `candidate` (set the dbt target schema to `candidate`; a model `+schema: candidate` alone normally appends a suffix to the target schema), run `dbt build` tests plus a volume check against a 7-day baseline and a reconciliation check (sum of `amount_usd` vs the API's own total for the interval). A `publish_swap` task replaces `marts.fct_orders` with the candidate only if every gate passed, including a blocking check that `ingest_drop["rejected"] == 0` for this exercise (DuckDB: `CREATE OR REPLACE TABLE marts.fct_orders AS SELECT * FROM candidate.fct_orders` inside a transaction).
5. **Break it on purpose.** Run `drop.py --corrupt` and a day where the API returns 50% fewer rows. Show the gate fail, `marts.fct_orders` unchanged, and the rejected file with its reason.
6. **Backfill and prove idempotency.** `airflow dags backfill orders_daily -s 2024-03-02 -e 2024-03-06`, then backfill the same range again. Row counts and a full-table hash of `marts.fct_orders` must be identical.
7. **Runbook.** One page: what each alert means, the first three checks, how to clear and reprocess an interval.

## Acceptance criteria

- [ ] `pytest -q` passes with no Airflow scheduler running and no network beyond `localhost`.
- [ ] `airflow dags list-import-errors` is empty.
- [ ] No `datetime.now`, `today()`, `CURRENT_DATE`, or `now()` appears in `dags/`, `ingest/`, or `analytics/models/` (grep evidence in the README).
- [ ] Two backfills of the same range produce byte-identical `marts.fct_orders` (hash shown).
- [ ] A failed gate leaves `marts.fct_orders` at its previous content (row count and hash shown before/after).
- [ ] `dbt docs generate` succeeds and every `fct_orders` column has a description stating unit and derivation.

## Automated checks (coding courses) / Evidence checklist (non-coding)

```python
# tests/test_dag.py -- parses the DAG without running a scheduler.
from airflow.models import DagBag


def test_dag_loads_cleanly():
    bag = DagBag(dag_folder="dags", include_examples=False)
    assert bag.import_errors == {}
    assert "orders_daily" in bag.dags


def test_dag_policy():
    dag = DagBag(dag_folder="dags", include_examples=False).get_dag("orders_daily")
    assert dag.catchup is False
    assert dag.max_active_runs == 1
    for t in dag.tasks:
        assert t.retries >= 2, f"{t.task_id} has no retries"
        assert t.execution_timeout is not None, f"{t.task_id} has no timeout"


def test_extracts_are_parallel_and_gate_precedes_publish():
    dag = DagBag(dag_folder="dags", include_examples=False).get_dag("orders_daily")
    api = dag.get_task("extract.extract_orders")
    drop = dag.get_task("extract.ingest_drop")
    assert drop.task_id not in api.get_flat_relative_ids(upstream=False)
    publish = dag.get_task("publish_swap")
    assert "run_quality_gates" in publish.get_flat_relative_ids(upstream=True)


def test_api_task_uses_pool():
    dag = DagBag(dag_folder="dags", include_examples=False).get_dag("orders_daily")
    assert dag.get_task("extract.extract_orders").pool == "orders_api"
```

```python
# tests/test_ingest.py -- exercises plain functions against the fake sources.
import datetime as dt
import hashlib
import subprocess
import sys
import time
from pathlib import Path

import pytest

from ingest import extract_orders, ingest_drop

START = dt.datetime(2024, 3, 5, tzinfo=dt.timezone.utc)
END = START + dt.timedelta(days=1)


@pytest.fixture(scope="module", autouse=True)
def api():
    proc = subprocess.Popen([sys.executable, "fake_sources/api.py", "--port", "8765"])
    time.sleep(1.0)
    yield
    proc.terminate()


def digest(folder: Path) -> str:
    h = hashlib.sha256()
    for p in sorted(folder.rglob("*")):
        if p.is_file():
            h.update(p.name.encode()); h.update(p.read_bytes())
    return h.hexdigest()


def test_extract_is_idempotent_and_marked(tmp_path):
    out1 = extract_orders(START, END, tmp_path)
    first = digest(out1)
    out2 = extract_orders(START, END, tmp_path)
    assert out1 == out2
    assert digest(out2) == first
    assert (out1 / "_SUCCESS").exists()


def test_different_intervals_differ(tmp_path):
    a = extract_orders(START, END, tmp_path)
    b = extract_orders(START - dt.timedelta(days=1), START, tmp_path)
    assert a != b and digest(a) != digest(b)


def test_drop_skips_already_ingested(tmp_path):
    subprocess.run([sys.executable, "fake_sources/drop.py", "--ds", "2024-03-05",
                    "--root", str(tmp_path / "incoming")], check=True)
    reg = tmp_path / "registry.json"
    first = ingest_drop("2024-03-05", tmp_path / "incoming", tmp_path / "raw", reg)
    second = ingest_drop("2024-03-05", tmp_path / "incoming", tmp_path / "raw", reg)
    assert first["ingested"] == 3
    assert second["ingested"] == 0


def test_corrupt_file_is_quarantined(tmp_path):
    subprocess.run([sys.executable, "fake_sources/drop.py", "--ds", "2024-03-06", "--corrupt",
                    "--root", str(tmp_path / "incoming")], check=True)
    result = ingest_drop("2024-03-06", tmp_path / "incoming", tmp_path / "raw",
                         tmp_path / "registry.json")
    assert result["rejected"] == 1
    assert len(result["rejected_paths"]) == 1
    assert Path(result["rejected_paths"][0]).exists()
```

Plus the dbt side: `dbt build` must pass on clean data, and a singular test `tests/assert_amount_reconciles.sql` must return rows for the half-volume day.

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Idempotency | Re-run duplicates rows | Interval-keyed overwrite or merge everywhere; backfill hashes match | Demonstrates and documents the overlap window for the API extract |
| DAG design | Linear chain | Parallel extracts, pool, retries, timeouts, no `now()` | Branch for full refresh vs incremental with correct trigger rule |
| dbt layering | One big model | Staging/intermediate/mart with `ref`/`source`, incremental fact | Snapshot for customer history; exposures declared |
| Gates | Tests only warn | Blocking tests + volume + reconciliation; circuit breaker proven | Quarantine threshold escalates to block; incident note written |
| Operability | No runbook | Runbook with clear/reprocess steps | Run-metadata table populated by callbacks |

## Stretch goals

- Add `ops.pipeline_runs` via `on_success_callback` / `on_failure_callback` (lesson 7) and query the slowest task.
- Swap DuckDB for a free-tier cloud warehouse; record which dbt configs had to change.

## Reflection prompts

- Which of your tasks would have silently duplicated data before you made it idempotent, and how did you prove it no longer does?
- When the reconciliation gate failed, who should be told, and what should the message say?

## Instructor notes (common pitfalls, how to adapt for time)

- Airflow 3 changed imports (`airflow.sdk`), the REST API version, and the backfill CLI. If the program is on Airflow 3, adjust the install line, `test_dag.py` imports, and milestone 6 command; the design is unchanged. Verify before use.
- DuckDB allows one writer at a time; run dbt and the publish step sequentially (the DAG shape already does).
- `ingest_drop` must return a dict with `ingested`, `rejected`, and `rejected_paths` (list of quarantined file paths); state this contract in the starter README.
- Short on time: skip the partner drop and the reconciliation gate; keep the circuit breaker, which is the core idea.
