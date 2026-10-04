---
course_id: de101
project_id: de101-x01
title: "Retailer Orders: Profile, Clean, and Gate a Messy Export"
kind: supplementary-project
status: draft
hours_estimate: 6
difficulty: core
related_lessons:
  - de101-04
  - de101-08
objectives:
  - Write SQL that joins, filters, and aggregates data across several tables
  - Apply profiling and quality checks to a raw dataset before it is used downstream
competency_ids:
  - D3-S1-C02
  - D2-S1-C01
---

## Scenario

The retailer from lessons 3 and 4 (the `customers` / `orders` / `order_lines` / `products` / `categories` schema) wants a nightly "orders with customer" extract handed to the analytics team. Last month a version of this extract went out with duplicate orders and a `-999` sentinel in `order_total`, and the revenue chart jumped 11% overnight. Your lead asks you to put a **quality gate** between the raw export and the staging table: profile it, clean it with written decisions, quarantine what cannot be cleaned, and block publication when the data is unsafe.

Everything runs locally with Python's built-in `sqlite3` module and `pytest`. No server, no cloud account.

## What you will build / produce

- `generate.py` — creates `shop.db` (the lesson 4 schema, seeded) and a deliberately corrupted `raw_orders.csv`.
- `pipeline.py` — exposes four functions: `load_raw`, `profile`, `build_staging`, `validate`.
- `test_pipeline.py` — the acceptance suite below, passing.
- `QUALITY_REPORT.md` — the one-page analyst-facing report from lesson 8, practice item 6.

## Before you start (prerequisites, starter files or data)

- Python 3.10+ and `pip install pytest`. `sqlite3` and `csv` are in the standard library.
- **Data generation (write this yourself in `generate.py`, seeded with `random.seed(42)` so results are reproducible):**

| Table | Rows | Columns and rules |
|---|---|---|
| `customers` | 50 | `customer_id` 1–50, `email`, `full_name`, `state_code` (pick from OH, TX, CA, NY, or NULL for 5 rows) |
| `orders` | 400 | `order_id` 1001–1400, `customer_id` 1–50, `order_status` in pending/paid/shipped/cancelled, `placed_at` within the last 120 days, `updated_at` >= `placed_at` |
| `order_lines` | ~1,200 | 1–5 lines per order, `quantity` 1–4, `unit_price` 2.00–80.00 |

- `raw_orders.csv` is `orders` joined to `customers`, with an `order_total` column computed as `SUM(quantity * unit_price)` from `order_lines` (the lesson 4 schema has no `order_total` on `orders`, so you compute it for the export). Then inject, at fixed positions so tests are stable:
  - 12 duplicate `order_id` rows, 6 of them with a later `updated_at` and a different `order_status`;
  - `order_status` variants: `Paid`, `PAID `, `canceled`, `payment_received`;
  - 8 `order_total` values written as text like `"$1,204.50"`; 3 values of `-999`;
  - 10 emails with leading/trailing spaces;
  - 4 `customer_id` values (e.g. 9001–9004) that exist in no customer row;
  - one `placed_at` of `2087-01-01`.

## Milestones

1. **Generate and load raw.** `load_raw(conn, csv_path)` creates `raw_orders` with **every column as TEXT** plus `_run_id` and `_source_file`. Nothing is cast or cleaned (lesson 7, "Land records raw").
2. **Profile blind.** `profile(conn, table) -> list[dict]` returns one dict per column with `column`, `rows`, `nulls`, `distinct`, `min`, `max`, `top_values`. Write your findings memo *before* opening `generate.py` again.
3. **Decide, then clean.** Write a decision table (standardize / impute / flag / reject / escalate, one sentence of why) for every anomaly. Then `build_staging(conn, run_id)` creates `staging_orders` and `quarantine_orders` from `raw_orders`:
   - trims and lowercases email; maps status variants through an explicit `CASE` with `ELSE 'unknown'`;
   - parses `"$1,204.50"` to `1204.50`; routes `-999` totals to quarantine with reason `sentinel_total`;
   - keeps the latest `updated_at` per `order_id`;
   - routes orphan `customer_id` rows to quarantine with reason `orphan_customer` (use a `LEFT JOIN ... WHERE c.customer_id IS NULL` against `customers`);
   - routes future `placed_at` to quarantine with reason `future_date`.
4. **Validate with severities.** `validate(conn) -> list[dict]` returns failures with `check`, `severity` (`blocking` / `quarantine` / `warn`), `detail`. At least ten checks across schema, key integrity, domain, cross-field, volume, freshness.
5. **Reconcile.** Write a SQL query proving `rows_in = rows_staged + rows_quarantined + rows_deduplicated`. Print the four numbers.
6. **Report.** Write `QUALITY_REPORT.md` for an analyst who never saw your code.

## Acceptance criteria

- [ ] `python generate.py && python -m pytest -q` passes from a clean folder.
- [ ] `raw_orders` is byte-for-byte the CSV contents: no casts, no trims.
- [ ] `staging_orders.order_id` is unique and non-null; every `order_status` is in `{pending, paid, shipped, cancelled, unknown}`.
- [ ] No row is silently dropped: the reconciliation identity holds.
- [ ] Re-running `build_staging` with the same `run_id` produces identical row counts (idempotent).
- [ ] Every cleaning decision appears in the decision table with a reason.
- [ ] Revenue by category for the last 90 days (lesson 4 practice query 3), run against staging-joined tables, differs from the raw-based number, and the report explains why.

## Automated checks (coding courses) / Evidence checklist (non-coding)

```python
# test_pipeline.py -- run: python generate.py && python -m pytest -q
import csv
import sqlite3

import pytest

import pipeline

ALLOWED_STATUS = {"pending", "paid", "shipped", "cancelled", "unknown"}


@pytest.fixture()
def conn(tmp_path):
    src = sqlite3.connect("shop.db")
    db = sqlite3.connect(tmp_path / "work.db")
    src.backup(db)           # fresh copy of the seeded schema per test
    src.close()
    pipeline.load_raw(db, "raw_orders.csv")
    yield db
    db.close()


def scalar(conn, sql):
    return conn.execute(sql).fetchone()[0]


def test_raw_is_untouched(conn):
    with open("raw_orders.csv", newline="", encoding="utf-8-sig") as fh:
        n_csv = sum(1 for _ in csv.DictReader(fh))
    assert scalar(conn, "SELECT COUNT(*) FROM raw_orders") == n_csv
    # whitespace in emails must still be present in raw
    assert scalar(conn, "SELECT COUNT(*) FROM raw_orders WHERE email <> TRIM(email)") >= 10


def test_profile_flags_duplicates_and_sentinel(conn):
    prof = {p["column"]: p for p in pipeline.profile(conn, "raw_orders")}
    assert prof["order_id"]["distinct"] < prof["order_id"]["rows"]
    assert "-999" in str(prof["order_total"]["min"]) or "-999" in prof["order_total"]["top_values"]


def test_staging_keys_and_domain(conn):
    pipeline.build_staging(conn, run_id="r1")
    assert scalar(conn, "SELECT COUNT(*) - COUNT(DISTINCT order_id) FROM staging_orders") == 0
    assert scalar(conn, "SELECT COUNT(*) FROM staging_orders WHERE order_id IS NULL") == 0
    statuses = {r[0] for r in conn.execute("SELECT DISTINCT order_status FROM staging_orders")}
    assert statuses <= ALLOWED_STATUS
    assert scalar(conn, "SELECT COUNT(*) FROM staging_orders WHERE email <> LOWER(TRIM(email))") == 0
    assert scalar(conn, "SELECT MIN(order_total) FROM staging_orders") >= 0


def test_dedup_keeps_latest_version(conn):
    pipeline.build_staging(conn, run_id="r1")
    rows = conn.execute("""
        SELECT r.order_id, MAX(r.updated_at) AS latest, s.updated_at
        FROM raw_orders r JOIN staging_orders s ON s.order_id = CAST(r.order_id AS INTEGER)
        GROUP BY r.order_id HAVING COUNT(*) > 1
    """).fetchall()
    assert rows, "expected injected duplicates"
    for _, latest, kept in rows:
        assert str(kept) == latest


def test_quarantine_reasons_and_payload(conn):
    pipeline.build_staging(conn, run_id="r1")
    reasons = {r[0] for r in conn.execute("SELECT DISTINCT reason FROM quarantine_orders")}
    assert {"sentinel_total", "orphan_customer", "future_date"} <= reasons
    assert scalar(conn, "SELECT COUNT(*) FROM quarantine_orders WHERE payload IS NULL") == 0


def test_nothing_silently_dropped(conn):
    pipeline.build_staging(conn, run_id="r1")
    raw = scalar(conn, "SELECT COUNT(*) FROM raw_orders")
    staged = scalar(conn, "SELECT COUNT(*) FROM staging_orders")
    quarantined = scalar(conn, "SELECT COUNT(*) FROM quarantine_orders")
    dupes = scalar(conn, "SELECT COUNT(*) - COUNT(DISTINCT order_id) FROM raw_orders")
    assert raw == staged + quarantined + dupes


def test_rerun_is_idempotent(conn):
    pipeline.build_staging(conn, run_id="r1")
    first = scalar(conn, "SELECT COUNT(*) FROM staging_orders")
    pipeline.build_staging(conn, run_id="r1")
    assert scalar(conn, "SELECT COUNT(*) FROM staging_orders") == first


def test_validate_has_severities_and_passes_on_clean(conn):
    pipeline.build_staging(conn, run_id="r1")
    failures = pipeline.validate(conn)
    assert all(f["severity"] in {"blocking", "quarantine", "warn"} for f in failures)
    assert not [f for f in failures if f["severity"] == "blocking"]
```

Note for the instructor: `test_nothing_silently_dropped` assumes a duplicate row is never also a quarantined row. If a learner's injection overlaps (a duplicate of an orphan), have them adjust the identity and explain it in the report — that is a good conversation, not a failure.

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Profiling | Row counts only | Every column profiled; memo lists most injected anomalies | Memo also predicts causes and drafts upstream questions |
| Cleaning decisions | Code with no stated reasons | Decision table covers every anomaly with a reason | Distinguishes "means zero" vs "unknown" nulls explicitly, per column |
| Quarantine | Rows deleted | Rows quarantined with reason and payload | Replays three repaired rows without duplicates |
| Checks | Fewer than ten, no severity | Ten+ checks with justified severities | History table of check results across three runs |
| SQL correctness | Grain errors in revenue | Revenue by category correct at line grain | Shows the raw vs staged revenue delta and attributes it to specific anomalies |

## Stretch goals

- Write check results to `check_history` and alert when a null rate moves more than 3 standard deviations from its last 10 runs.
- Port the pipeline to DuckDB (`pip install duckdb`) and compare the SQL you had to change.

## Reflection prompts

- Which anomaly would you push upstream to the source owner first, and what is the one-line message you would send?
- Where did you choose `unknown` over `NULL`, and why does the difference matter to an analyst counting statuses?

## Instructor notes (common pitfalls, how to adapt for time)

- Learners often clean during `load_raw`. Point them back to lesson 7: raw is evidence.
- SQLite has no `REGEXP_REPLACE` by default; `REPLACE(REPLACE(total, '$', ''), ',', '')` is fine here.
- SQLite comparisons of `placed_at` work only if dates are ISO-8601 text; require that in the generator.
- Short on time: provide `generate.py` and have learners write only `build_staging` and `validate`.
