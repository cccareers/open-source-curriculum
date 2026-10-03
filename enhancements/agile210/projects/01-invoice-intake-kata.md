---
course_id: agile210
project_id: agile210-x01
title: "Invoice Intake Kata: Status Model, Dedup, and a Balanced Reconciliation"
kind: supplementary-project
status: draft
hours_estimate: 4
difficulty: warm-up
related_lessons:
  - agile210-04
  - agile210-07
objectives:
  - Build the capstone's data and integration layer, connecting the sources and stores the solution depends on
  - Test, troubleshoot, and harden the capstone until it survives realistic use
competency_ids:
  - D5-S1-C01
  - D5-S1-C02
  - D2-S1-C03
---

## Scenario
Before you spend seven capstone hours on stage 04, rehearse its hardest parts on the running example: the office manager's supplier invoices arriving in the accounts inbox. You will build the data layer in miniature, with SQLite as the store, a Python list standing in for the client's tracking sheet, and the stage-04 stub standing in for the AI step. It is the "rough, ugly version in one day" from lesson 02, but for the layer everything else sits on.

## What you will build / produce
`invoice_layer.py` with:
- `init_db(conn)` — a `records` table with the minimum schema from stage 04 (`record_id`, `natural_key`, `source`, `received_at`, `raw_payload`, `status`, `status_changed_at`, `validation_result`, `attempt_count`, `last_error`) plus domain fields `supplier_ref`, `invoice_number`, `invoice_date`, `total_minor`, `currency`, the reserved `ai_result`, and `external_id`.
- `ingest(conn, payload) -> record_id` — writes the record first, in status `received`, with the raw payload verbatim; normalises (trim and upper-case `supplier_ref` and `invoice_number`; parse `invoice_date` as ISO or the UK suppliers' documented `DD/MM/YYYY` into `YYYY-MM-DD`; convert `total` such as `"£1,240.00"` to integer pence); validates with named rules `supplier_ref_present`, `invoice_number_present`, `invoice_date_parseable`, `total_numeric`; quarantines failures with the rule name; deduplicates on the natural key `supplier_ref|invoice_number` (status `duplicate_skipped`, recorded not deleted); otherwise moves to `awaiting_ai`.
- `transition(conn, record_id, new_status)` — enforces the legal transitions you document, raising `IllegalTransition` otherwise.
- `run_stub(conn, confidence_for)` — for every `awaiting_ai` record writes `ai_result` in exactly the real step's shape (`document_type`, `category`, `confidence`, `notes`) and routes to `ready_for_output` (confidence ≥ 0.85) or `human_review`.
- `write_output(conn, record_id, sheet)` — appends one row to the sheet, stores its `row_id` as `external_id`, marks the record `completed`; a replay must not append again.
- `reconcile(conn)` — returns `{"received", "by_status", "balanced"}`.

Plus a status diagram (boxes and arrows, any tool) and a one-paragraph note on what you would change in your real stage-04 schema after doing this.

## Before you start (prerequisites, starter files or data)
- Python 3.10+, `pytest`. No accounts or API keys.
- Copy the suite below to `tests/test_invoice_layer.py`.
- Lesson agile210-04, sections "2. The data model", "3. Ingestion, with validation and quarantine", and "A worked ingestion trace", open beside you.

## Milestones
1. **Status diagram (20 min).** List every status and legal transition before writing code.
2. **Schema and `ingest` happy path (45 min).** Raw payload first, then normalise.
3. **Validation and quarantine (40 min).** Four named rules.
4. **Dedup on the natural key (30 min).** Enforce it in the store (a unique index) as well as in code, as the stage-04 hints recommend.
5. **Stub and transitions (40 min).**
6. **Outbound idempotency and reconciliation (40 min).**
7. **Reflection note (15 min).**

## Acceptance criteria
- [ ] `python -m pytest -q` reports `11 passed`.
- [ ] The raw payload is never modified after it is written.
- [ ] No input disappears: every call to `ingest` leaves exactly one row.
- [ ] Five identical submissions produce one record and four `duplicate_skipped` rows.
- [ ] A replayed `write_output` causes no second sheet row.
- [ ] Status diagram matches the transitions your code enforces.

## Automated checks (coding courses) / Evidence checklist (non-coding)
Save as `tests/test_invoice_layer.py`; run `python -m pytest -q`.

```python
# tests/test_invoice_layer.py  -- run with:  python -m pytest -q
# Offline: in-memory SQLite is the store, a Python list is the client's
# tracking sheet, and the AI step is the stage-04 stub.
import json
import sqlite3
import pytest
from invoice_layer import (init_db, ingest, run_stub, transition, write_output,
                           reconcile, IllegalTransition)

def invoice(**kw):
    base = {"supplier_ref": " SUP-014 ", "invoice_number": "inv-20931",
            "invoice_date": "03/03/2026", "total": "£1,240.00",
            "currency": "GBP", "text": "Harbour Office Supplies Ltd ... Total due £1,240.00"}
    base.update(kw)
    return base

@pytest.fixture
def conn():
    c = sqlite3.connect(":memory:")
    init_db(c)
    yield c
    c.close()

def row(conn, record_id):
    cur = conn.execute("select * from records where record_id = ?", (record_id,))
    cols = [d[0] for d in cur.description]
    return dict(zip(cols, cur.fetchone()))

# --- Raw payload preserved, normalisation at the boundary --------------------
def test_raw_payload_is_preserved_verbatim_and_fields_normalised(conn):
    rid = ingest(conn, invoice())
    r = row(conn, rid)
    assert json.loads(r["raw_payload"])["supplier_ref"] == " SUP-014 "      # untouched
    assert r["supplier_ref"] == "SUP-014"
    assert r["invoice_number"] == "INV-20931"
    assert r["invoice_date"] == "2026-03-03"          # UK supplier: DD/MM/YYYY, documented
    assert r["total_minor"] == 124000
    assert r["status"] == "awaiting_ai"
    assert r["received_at"] and r["status_changed_at"]

# --- Validation quarantines, never drops --------------------------------------
@pytest.mark.parametrize("bad, rule", [
    (invoice(supplier_ref=""), "supplier_ref_present"),
    (invoice(invoice_number=None), "invoice_number_present"),
    (invoice(invoice_date="31/31/2026"), "invoice_date_parseable"),
    (invoice(total="see attached"), "total_numeric"),
])
def test_invalid_input_is_quarantined_with_named_rule(conn, bad, rule):
    rid = ingest(conn, bad)
    r = row(conn, rid)
    assert r["status"] == "quarantined"
    assert r["validation_result"] == rule
    assert r["raw_payload"]                              # still there to diagnose

# --- Deduplication on the natural key -----------------------------------------
def test_same_payload_five_times_gives_one_record_and_four_skips(conn):
    for _ in range(5):
        ingest(conn, invoice())
    counts = dict(conn.execute("select status, count(*) from records group by status").fetchall())
    assert counts == {"awaiting_ai": 1, "duplicate_skipped": 4}

def test_natural_key_ignores_cosmetic_differences(conn):
    ingest(conn, invoice())
    rid = ingest(conn, invoice(supplier_ref="sup-014", invoice_number=" INV-20931"))
    assert row(conn, rid)["status"] == "duplicate_skipped"

# --- Status model ---------------------------------------------------------------
def test_illegal_transition_is_refused(conn):
    rid = ingest(conn, invoice())
    with pytest.raises(IllegalTransition):
        transition(conn, rid, "completed")               # cannot skip the AI step and review

def test_stub_writes_the_real_output_shape_and_routes_low_confidence(conn):
    a = ingest(conn, invoice())
    b = ingest(conn, invoice(invoice_number="INV-20932"))
    run_stub(conn, confidence_for=lambda rec: 0.95 if rec["invoice_number"] == "INV-20931" else 0.4)
    ra, rb = row(conn, a), row(conn, b)
    result = json.loads(ra["ai_result"])
    assert set(result) == {"document_type", "category", "confidence", "notes"}
    assert result["document_type"] in {"invoice", "credit_note", "statement", "unknown"}
    assert ra["status"] == "ready_for_output"
    assert rb["status"] == "human_review"

# --- Outbound idempotency -------------------------------------------------------
def test_replayed_output_does_not_append_twice(conn):
    rid = ingest(conn, invoice())
    run_stub(conn, confidence_for=lambda rec: 0.95)
    sheet = []
    write_output(conn, rid, sheet)
    write_output(conn, rid, sheet)                       # replay after a timeout
    assert len(sheet) == 1
    assert row(conn, rid)["status"] == "completed"
    assert row(conn, rid)["external_id"] == sheet[0]["row_id"]

# --- Reconciliation balances ----------------------------------------------------
def test_reconciliation_counts_balance(conn):
    payloads = ([invoice(invoice_number=f"INV-{n}") for n in range(30000, 30018)]
                + [invoice()] * 3                                    # 1 new + 2 duplicates
                + [invoice(invoice_number=None), invoice(total="TBC"),
                   invoice(supplier_ref=""), invoice(invoice_date="yesterday")])
    for p in payloads:
        ingest(conn, p)
    run_stub(conn, confidence_for=lambda rec: 0.95)
    summary = reconcile(conn)
    assert summary["received"] == 25
    assert summary["by_status"]["quarantined"] == 4
    assert summary["by_status"]["duplicate_skipped"] == 2
    assert summary["by_status"]["ready_for_output"] == 19
    assert summary["balanced"] is True
```

## Rubric
| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Raw-first ingestion | Raw payload missing or overwritten | Raw payload stored verbatim before any parsing | Raw payload stored separately so retention can be shortened independently (stage 06) |
| Validation | Errors thrown, records lost | Four named rules, quarantined with names | Rules listed as data and reused in a quarantine view query |
| Dedup | Workflow-only check | Natural key enforced by the store and tested | Handles the race of two identical arrivals (explain how) |
| Status model | Free-text statuses | Documented legal transitions, illegal ones refused | Every status reachable and justified as minimal |
| Idempotency and reconciliation | Replays double-write; counts unchecked | No double write; counts balance | Reconciliation query reused as the stage-07 drift check |

## Stretch goals
- Add `attempt_count` and `last_error` handling to `write_output` with a simulated timeout and bounded retries, ending in `failed`.
- Add a 30-day purge of `raw_payload` for completed records and a test (previews stage 06).
- Port the schema to the no-code database you will use in the real capstone and re-run the same 25 payloads by hand.

## Reflection prompts
- Which status did you add or remove after writing the tests? Why?
- What is the natural key for your real capstone, and what cosmetic differences must it ignore?
- Where would a silent drop hide in your real platform?

## Instructor notes (common pitfalls, how to adapt for time)
- Learners often set the natural key before checking for a duplicate and trip their own unique index; the test for five identical submissions exposes it.
- `DD/MM/YYYY` vs `MM/DD/YYYY` is a deliberate trap; the date in the fixture (03/03) is unambiguous, but the rule must be documented, not guessed.
- Use as a warm-up in the first hour of stage 04, or as homework before it. It does not replace the stage-04 evidence run on real records.
- No-code variant: build the same statuses and dedup in Airtable or Make, submit screenshots of five identical submissions and the reconciliation view.
