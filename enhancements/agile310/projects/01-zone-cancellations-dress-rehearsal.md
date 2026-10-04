---
course_id: agile310
project_id: agile310-x01
title: "Zone Cancellations Dress Rehearsal: Milestones 1-2 Locally, with Tests"
kind: supplementary-project
status: draft
hours_estimate: 8
difficulty: core
related_lessons:
  - agile310-02
  - agile310-04
  - agile310-05
objectives:
  - Scope an end-to-end pipeline against a stated business question and document the architecture
  - Ingest source data into a landing zone reliably and repeatably
  - Model ingested data into a warehouse layer that answers the business question
competency_ids:
  - D7-S1-C02
  - D1-S1-C02
  - D1-S1-C01
  - D6-S1-C03
---

## Scenario

Before you spend your cloud budget, rehearse the hardest parts of the capstone on your laptop using the course's own worked example from lesson 2: **"Which three pickup zones have the worst late-night trip cancellation rate, and is it getting worse?"** You will build a two-source landing zone (a bulk file drop of trips and a paginated zones API), a staging layer, and a dimensional model whose grain matches the question — with automated tests for the properties the milestone reviews will ask you to demonstrate live: idempotency, watermark ordering, backfill, grain, and reconciliation.

This does **not** replace the graded milestones, which must run in your cloud account (lesson 4: "not on your laptop against a local folder"). It is a dress rehearsal: the same code shape, the same tests, a fraction of the cost. When you move to the cloud, swap the local folder for object storage and DuckDB for your warehouse; the tests become your acceptance checklist.

## What you will build / produce

- `docs/design.md` — the nine-section, two-page design document from lesson 2, for the zone-cancellations question.
- `fake_sources/` — `make_trips.py` (bulk JSONL drop) and `zones_api.py` (local paginated HTTP API).
- `ingest/` — `run_ingest(source, window_start, window_end, landing_root)` with a per-source watermark and a JSONL run manifest.
- `transform/` — SQL files for `stg_trips`, `stg_zones`, `dim_zone`, `dim_date`, `fct_trip_daily`, `vw_cancellation_rate_by_zone_day`, run by `transform.py --window YYYY-MM-DD` against DuckDB.
- `tests/` — the pytest suite below, passing.

## Before you start (prerequisites, starter files or data)

- Python 3.11, `pip install duckdb pytest requests`.
- **Synthetic trips** (`make_trips.py --date 2026-03-01 --root landing_drop/`, `random.seed` from the date so each day is reproducible):
  - ~20,000 trips/day: `trip_id` (unique per day, `T-20260301-000001`), `pickup_zone_id` 1-60, `requested_at` (ISO, local time), `status` in `completed|cancelled_by_rider|cancelled_by_driver` (with 1% `Cancelled_By_Rider` spelling variant), `fare` string, `updated_at`.
  - Late-night (22:00-04:00) cancellation probability rises 0.5 percentage points per week in zones 7, 23, 41 so the "getting worse" answer exists.
  - 1% of trips re-emitted in the next day's file with a later `updated_at` (retried delivery).
- **Zones API** (`zones_api.py --port 8766`): `GET /zones?page=N` returns 25 zones per page (`zone_id`, `zone_name`, `borough`, `updated_at`), `next_page` link, HTTP 429 with `Retry-After: 1` on every 5th request, and a `zone_name` rename for zone 41 starting 2026-03-08 (schema-drift practice).

## Milestones

Define the daily fact measures `trips`, `cancellations`, `late_night_trips`, and `late_night_cancellations`. Late night means local hour >= 22 or < 4, attributed to the request's calendar date. The serving view exposes daily all-trip and late-night rows with `is_late_night` and computes each rate from its corresponding counts; the fact remains one row per zone/day. Seed zones 7, 23, 41 with a clearly higher baseline late-night cancellation probability (for example 30% versus 5%) as well as the weekly trend, so the small 14-day fixture can distinguish them.

1. **Design first.** Write `docs/design.md`: question, decision and stakeholder, both sources, the layer table, grain of every table ("`fct_trip_daily`: one row per pickup zone per calendar day"), four non-goals (including streaming), five risks with trigger/response, milestone plan, open questions. Get a peer to run lesson 2's six critical questions against it.
2. **Land raw, idempotently.** `run_ingest` writes to `landing/<source>/ingest_date=<date>/` via a temporary folder then an atomic rename (replace-partition), adds provenance (`_source`, `_fetched_at`, `_run_id`, source file name) without altering source fields, and appends a manifest line with every field lesson 4 requires.
3. **Watermark after write.** Persist the watermark per source in `state/watermarks.json`, advanced only after the partition is committed. Simulate a crash between write and advance (an env var `CRASH_AFTER_WRITE=1`) and show the next run re-fetches the window.
4. **Stage and model.** Staging casts types, normalises status, deduplicates on `trip_id` keeping the newest `updated_at`. `dim_date` is generated, not sourced. `fct_trip_daily` is built per window with delete-then-insert of that window; it joins both sources (zone borough onto trips) so the two sources actually meet.
5. **Answer the question.** `vw_cancellation_rate_by_zone_day` and a query returning the top three late-night zones over the last 28 days and their week-over-week trend. Read the answer aloud in one sentence.
6. **Test.** Make the suite pass. Then break things on purpose (duplicate a zone row, crash mid-run, rerun a window) and watch the right test fail.

## Acceptance criteria

- [ ] `pytest -q` passes from a clean checkout after `python make_trips.py --date ...` for 14 consecutive days.
- [ ] Running ingest twice for the same window leaves an identical landing listing and manifest shows two runs.
- [ ] A zero-record window writes a manifest entry with `records_written = 0` and status `succeeded`, and no empty partition that breaks readers.
- [ ] `fct_trip_daily` has exactly one row per (`zone_id`, `trip_date`); a rerun of a window changes no values.
- [ ] Staging-to-fact reconciliation for one window is documented (counts agree or the rule explaining the difference is named).
- [ ] `docs/design.md` is at most two pages and states the grain of every table it names.

## Automated checks (coding courses) / Evidence checklist (non-coding)

```python
# tests/test_rehearsal.py
import json
import os
import subprocess
import sys
import time
from pathlib import Path

import duckdb
import pytest

from ingest import run_ingest
import transform

DAYS = [f"2026-03-{d:02d}" for d in range(1, 15)]


@pytest.fixture(scope="session", autouse=True)
def zones_api():
    p = subprocess.Popen([sys.executable, "fake_sources/zones_api.py", "--port", "8766"])
    time.sleep(1.0)
    yield
    p.terminate()


@pytest.fixture()
def env(tmp_path):
    for d in DAYS:
        subprocess.run([sys.executable, "fake_sources/make_trips.py", "--date", d,
                        "--root", str(tmp_path / "drop")], check=True)
    return tmp_path


def listing(root: Path):
    return sorted((str(p.relative_to(root)), p.stat().st_size)
                  for p in root.rglob("*") if p.is_file() and "manifest" not in p.name)


def manifest(root: Path):
    return [json.loads(l) for l in (root / "manifest.jsonl").read_text().splitlines()]


def test_ingest_is_idempotent(env):
    root = env / "landing"
    run_ingest("trips", "2026-03-01", "2026-03-02", root, drop=env / "drop")
    first = listing(root)
    run_ingest("trips", "2026-03-01", "2026-03-02", root, drop=env / "drop")
    assert listing(root) == first
    assert len([m for m in manifest(root) if m["source"] == "trips"]) == 2


def test_manifest_has_required_fields(env):
    root = env / "landing"
    run_ingest("zones", "2026-03-01", "2026-03-02", root)
    m = manifest(root)[-1]
    for key in ["run_id", "source", "window_start", "window_end", "started_at", "ended_at",
                "records_read", "records_written", "bytes_written", "paths", "status"]:
        assert key in m, key


def test_watermark_not_advanced_on_crash(env, monkeypatch):
    root = env / "landing"
    state = env / "state" / "watermarks.json"
    monkeypatch.setenv("CRASH_AFTER_WRITE", "1")
    with pytest.raises(Exception):
        run_ingest("trips", "2026-03-02", "2026-03-03", root, drop=env / "drop", state=state)
    wm = json.loads(state.read_text()).get("trips") if state.exists() else None
    assert wm is None or wm < "2026-03-03"


def test_zero_record_window_succeeds(env):
    root = env / "landing"
    run_ingest("trips", "2026-04-01", "2026-04-02", root, drop=env / "drop")
    m = manifest(root)[-1]
    assert m["status"] == "succeeded" and m["records_written"] == 0


def build_all(env):
    root = env / "landing"
    db = env / "wh.duckdb"
    for i, d in enumerate(DAYS):
        nxt = DAYS[i + 1] if i + 1 < len(DAYS) else "2026-03-15"
        run_ingest("trips", d, nxt, root, drop=env / "drop")
        run_ingest("zones", d, nxt, root)
        transform.run(db_path=db, landing_root=root, window=d)
    return duckdb.connect(str(db))


def test_fact_grain_and_rerun(env):
    con = build_all(env)
    dupes = con.execute("""SELECT count(*) FROM (SELECT zone_id, trip_date, count(*) c
                           FROM fct_trip_daily GROUP BY 1, 2 HAVING c > 1)""").fetchone()[0]
    assert dupes == 0
    before = con.execute("SELECT sum(trips), sum(cancellations) FROM fct_trip_daily").fetchone()
    con.close()
    transform.run(db_path=env / "wh.duckdb", landing_root=env / "landing", window="2026-03-05")
    con = duckdb.connect(str(env / "wh.duckdb"))
    assert con.execute("SELECT sum(trips), sum(cancellations) FROM fct_trip_daily").fetchone() == before


def test_referential_integrity_and_reconciliation(env):
    con = build_all(env)
    orphans = con.execute("""SELECT count(*) FROM fct_trip_daily f
                             LEFT JOIN dim_zone z USING (zone_id) WHERE z.zone_id IS NULL""").fetchone()[0]
    assert orphans == 0
    stg = con.execute("SELECT count(*) FROM stg_trips WHERE CAST(requested_at AS DATE) = '2026-03-05'").fetchone()[0]
    fct = con.execute("SELECT sum(trips) FROM fct_trip_daily WHERE trip_date = '2026-03-05'").fetchone()[0]
    assert stg == fct


def test_question_is_answerable(env):
    con = build_all(env)
    top = con.execute("""SELECT zone_id FROM vw_cancellation_rate_by_zone_day
                         WHERE is_late_night GROUP BY zone_id
                         ORDER BY avg(cancellation_rate) DESC LIMIT 3""").fetchall()
    assert {z[0] for z in top} == {7, 23, 41}
```

Function signatures used by the tests (`run_ingest(source, start, end, root, drop=None, state=None)`, `transform.run(db_path, landing_root, window)`) are part of the brief; publish them in the starter README.

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Design document | Dataset-first, no grain | Nine sections, grain everywhere, non-goals with reasons | Peer review comments addressed and recorded as a decision record |
| Landing zone | Overwrites or appends blindly | Replace-partition, provenance, manifest, watermark after write | Schema drift on zone 41 detected and noted in manifest |
| Model | Single wide table | Staging + `dim_zone` + `dim_date` + `fct_trip_daily` at stated grain; both sources meet | Late-night flag and trend computed in serving with documented definition |
| Evidence | Claims only | Tests pass; break-it demonstrations captured | Reconciliation and rerun proofs written up as they would be shown in review |

## Stretch goals

- Deploy the same ingest code as a container task in your capstone account and point the tests at object storage (this is Milestone 1 itself).
- Add a missed-run check that reads the manifest and fails if no successful run exists for yesterday (Milestone 3 rehearsal).

## Reflection prompts

- Which of lesson 4's definition-of-done items would you have been unable to demonstrate live without this rehearsal?
- Which non-goal in your design document saved you the most time, and what did it cost?

## Instructor notes (common pitfalls, how to adapt for time)

- Learners compute the window from `today()`; the backfill-style test loop over 14 days exposes it immediately.
- `test_question_is_answerable` depends on the generator's injected trend; if learners change the generator, have them change the expected zones and explain why.
- Local time vs UTC for "late night" is a genuine definitional decision; require it in the design document.
- Short on time: provide `fake_sources/`; learners write ingest, transform, and design doc.
