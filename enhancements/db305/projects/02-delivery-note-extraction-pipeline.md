---
course_id: db305
project_id: db305-x02
title: "Delivery-Note Extraction Pipeline with Validation and a Run Log"
kind: supplementary-project
status: draft
hours_estimate: 8
difficulty: stretch
related_lessons:
  - db305-02
  - db305-06
  - db305-08
objectives:
  - Apply validation, transformation, and storage practices that keep workflow data trustworthy
  - Monitor a deployed AI workflow's accuracy, latency, and cost, and act on what the monitoring shows
competency_ids:
  - D5-S1-C03
  - D5-S1-C05
---

## Scenario
The freight team's delivery-note extractor (the contract from db305-02, deployed as `orders-extractor-prod` in db305-07) has been writing straight to the database with no checks. Two drivers turned up with gate code 4471 when the note said 4417, and finance found order totals stored as text. You will rebuild the pipeline around it: canonical transforms for the order rows, the eight model-output checks from db305-06, retry-once-then-quarantine, idempotent storage, and the per-run log from db305-08 that makes cost per usable record a number instead of a guess.

## What you will build / produce
A module `pipeline.py` with:
- `init_db(conn)` — creates `order_notes(order_id text primary key, note text, extracted text, updated_at text)`, `quarantine(order_id text, error text, raw_model_text text)`, and `ai_run_log(source_record_id text, attempts int, validation_result text, prompt_version text, model_version text, prompt_tokens int, completion_tokens int, latency_ms int)`.
- `canonicalize(raw)` — turns a CSV-style row (`id`, `ordered_at`, `total`, `state`) into `{order_id, placed_at, total_minor, currency, status}`. Prefix bare ids with `ORD-`. Accept ISO dates and the carrier's documented US `MM/DD/YYYY` format; emit `YYYY-MM-DDT00:00:00Z`. Strip `$`, `£`, and separators and convert to integer minor units **without using float**. Map status through a synonym table (`Confirmed`, `CONF` → `confirmed`). Default `currency` to `GBP`. On failure raise `ValidationError` whose `.field` names the failed field. Empty and `N/A` totals are failures, not zero.
- `validate_extraction(text, note)` — runs the eight checks from db305-06 in order and raises `ExtractionError` whose `.check` is one of `empty`, `parse`, `required`, `type`, `vocabulary`, `range`, `cross_field`, `grounding`. Strips a ```` ```json ```` fence. `special_equipment` must be exactly `tail_lift`, `forklift`, `none`, or null. `earliest_time` must not be after `latest_time`. A non-null `access_code` must appear verbatim in the note.
- `process_note(conn, order_id, note, call_model, model_version, prompt_version)` — calls the model; on a failed check retries once with the failed check's name appended to the prompt; after a second failure writes the raw model text to `quarantine`. Upserts successes into `order_notes`. Writes one `ai_run_log` row for every run, success or failure. Returns `validated_ok`, `validated_after_retry`, or `quarantined`.
- `cost_per_usable_record(conn, input_per_m, output_per_m)` — total token cost across all runs divided by the number of non-quarantined runs.

Plus a half-page **baseline note** (db305-08 style): validation-result ratio, cost per usable record, and one change you would test next. Change one thing only.

## Before you start (prerequisites, starter files or data)
- Python 3.10+, `pytest`. No API key: the tests use `ScriptedModel`, a fake that returns scripted replies and records the prompts it receives.
- The extraction contract from db305-02 and the eight checks from db305-06 open beside you.
- Optional real run: write a `call_model(prompt)` adapter for your own deployment that returns `{"text", "prompt_tokens", "completion_tokens", "latency_ms"}` and run 20 real notes through `process_note`.

## Milestones
1. **Transforms (90 min).** `canonicalize`, using `decimal.Decimal` for money. Pass `-k canonicalize or money or bad_rows`.
2. **Eight checks (90 min).** `validate_extraction`. Each check must fail with its own name.
3. **Retry and quarantine (60 min).** `process_note` without storage first, then add the quarantine write.
4. **Idempotent storage and run log (60 min).** Upsert and one log row per run.
5. **Cost per usable record (30 min).**
6. **Optional real run and baseline note (90 min).**

## Acceptance criteria
- [ ] `python -m pytest -q` reports `21 passed`.
- [ ] No float arithmetic touches money; `8.81` becomes `881`.
- [ ] A capitalised `"Tail Lift"` is rejected, not normalised.
- [ ] An `access_code` not present in the note is rejected by the grounding check.
- [ ] Quarantined records keep the raw model text.
- [ ] Every run, including failures, has exactly one `ai_run_log` row with prompt and model versions.
- [ ] Baseline note states numbers, not impressions.

## Automated checks (coding courses) / Evidence checklist (non-coding)
Save as `tests/test_pipeline.py`; run `python -m pytest -q`.

```python
# tests/test_pipeline.py  -- run with:  python -m pytest -q
# The model is replaced by a scripted fake so the suite runs offline and
# deterministically. SQLite in memory stands in for the database.
import json
import sqlite3
import pytest
from pipeline import (init_db, canonicalize, validate_extraction, process_note,
                      ValidationError, ExtractionError, cost_per_usable_record)

NOTE = "Driver must call ahead. Gate code 4417. Tail lift needed, deliver 08:00-12:00."

def extraction(**kw):
    base = {"call_ahead": True, "access_code": "4417", "earliest_time": "08:00",
            "latest_time": "12:00", "special_equipment": "tail_lift", "confidence": 0.91}
    base.update(kw)
    return json.dumps(base)

class ScriptedModel:
    """Returns the scripted replies in order; records every prompt it was sent."""
    def __init__(self, *replies):
        self.replies, self.prompts = list(replies), []
    def __call__(self, prompt):
        self.prompts.append(prompt)
        text = self.replies.pop(0)
        return {"text": text, "prompt_tokens": 210, "completion_tokens": 40, "latency_ms": 900}

@pytest.fixture
def conn():
    c = sqlite3.connect(":memory:")
    init_db(c)
    yield c
    c.close()

# --- Transformation to one canonical shape (lesson 06) --------------------------
def test_canonicalize_messy_csv_rows():
    a = canonicalize({"id": "1041", "ordered_at": "2026-03-11", "total": "1,240.00", "state": "Confirmed"})
    b = canonicalize({"id": "1042", "ordered_at": "03/11/2026", "total": "$980", "state": "CONF"})
    assert a == {"order_id": "ORD-1041", "placed_at": "2026-03-11T00:00:00Z",
                 "total_minor": 124000, "currency": "GBP", "status": "confirmed"}
    # the carrier documents US month/day order for slash dates
    assert b["placed_at"] == "2026-03-11T00:00:00Z"
    assert b["total_minor"] == 98000 and b["status"] == "confirmed"

def test_money_never_goes_through_float():
    assert canonicalize({"id": "7", "ordered_at": "2026-03-12", "total": "8.81", "state": "draft"})["total_minor"] == 881

@pytest.mark.parametrize("raw, rule", [
    ({"id": "1043", "ordered_at": "2026-03-12", "total": "", "state": "draft"}, "total"),          # empty is not zero
    ({"id": "1044", "ordered_at": "2026-03-12", "total": "N/A", "state": "draft"}, "total"),
    ({"id": "1045", "ordered_at": "2026-03-12", "total": "10", "state": "pending_review"}, "status"),  # unmapped enum
    ({"id": "1046", "ordered_at": "11th March", "total": "10", "state": "draft"}, "placed_at"),
])
def test_bad_rows_raise_named_validation_errors(raw, rule):
    with pytest.raises(ValidationError) as err:
        canonicalize(raw)
    assert err.value.field == rule

# --- Validating what the model returned (lesson 06, eight checks) ----------------
def test_valid_extraction_passes_and_strips_fence():
    out = validate_extraction("```json\n" + extraction() + "\n```", NOTE)
    assert out["access_code"] == "4417"

@pytest.mark.parametrize("reply, check", [
    ("", "empty"),
    ("Sure! The driver should call.", "parse"),
    (json.dumps({"call_ahead": True}), "required"),
    (extraction(confidence="0.9"), "type"),
    (extraction(special_equipment="Tail Lift"), "vocabulary"),     # not normalised away
    (extraction(confidence=1.4), "range"),
    (extraction(earliest_time="13:00", latest_time="12:00"), "cross_field"),
    (extraction(access_code="4471"), "grounding"),                 # digits not in the note
])
def test_each_check_fails_with_its_name(reply, check):
    with pytest.raises(ExtractionError) as err:
        validate_extraction(reply, NOTE)
    assert err.value.check == check

def test_null_access_code_is_allowed_when_note_has_none():
    out = validate_extraction(extraction(access_code=None), "Please call ahead.")
    assert out["access_code"] is None

# --- Retry once, then quarantine; idempotent storage; run log (lessons 06, 08) ---
def test_retry_once_with_error_appended(conn):
    model = ScriptedModel("not json", extraction())
    result = process_note(conn, "ORD-1041", NOTE, model, model_version="chat-model-mini-2026-01-15",
                          prompt_version="extract-notes-v4")
    assert result == "validated_after_retry"
    assert "parse" in model.prompts[1]
    assert conn.execute("select count(*) from order_notes").fetchone()[0] == 1

def test_second_failure_quarantines_with_raw_text(conn):
    model = ScriptedModel("not json", extraction(access_code="9999"))
    assert process_note(conn, "ORD-1041", NOTE, model, "chat-model-mini-2026-01-15", "extract-notes-v4") == "quarantined"
    raw = conn.execute("select raw_model_text from quarantine where order_id='ORD-1041'").fetchone()[0]
    assert "9999" in raw
    assert conn.execute("select count(*) from order_notes").fetchone()[0] == 0

def test_running_twice_keeps_one_row(conn):
    for _ in range(2):
        process_note(conn, "ORD-1041", NOTE, ScriptedModel(extraction()), "chat-model-mini-2026-01-15", "extract-notes-v4")
    assert conn.execute("select count(*) from order_notes").fetchone()[0] == 1

def test_every_run_is_logged_including_failures(conn):
    process_note(conn, "ORD-1041", NOTE, ScriptedModel(extraction()), "chat-model-mini-2026-01-15", "extract-notes-v4")
    process_note(conn, "ORD-1042", NOTE, ScriptedModel("x", "y"), "chat-model-mini-2026-01-15", "extract-notes-v4")
    rows = conn.execute("select source_record_id, attempts, validation_result, prompt_version, model_version "
                        "from ai_run_log order by source_record_id").fetchall()
    assert rows == [("ORD-1041", 1, "validated_ok", "extract-notes-v4", "chat-model-mini-2026-01-15"),
                    ("ORD-1042", 2, "quarantined", "extract-notes-v4", "chat-model-mini-2026-01-15")]

def test_cost_per_usable_record(conn):
    # price: $0.15 per million input tokens, $0.60 per million output (illustrative)
    for i in range(3):
        process_note(conn, f"ORD-{i}", NOTE, ScriptedModel(extraction()), "m", "p")
    process_note(conn, "ORD-9", NOTE, ScriptedModel("x", "y"), "m", "p")
    per_call = (210 * 0.15 + 40 * 0.60) / 1_000_000
    # 5 calls in total, 3 usable records
    assert cost_per_usable_record(conn, input_per_m=0.15, output_per_m=0.60) == pytest.approx(per_call * 5 / 3)
```

## Rubric
| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Transforms | Some fields canonical; float money | All fields canonical, Decimal money, named failures | Transform table written as data and replayable over stored raw payloads |
| Model-output validation | Parse and required keys only | All eight checks, each named | Adds a check that `confidence` is reported per field, and documents why it chose not to normalise case |
| Failure handling | Failures dropped or stored | Retry once with named error; quarantine with raw text | Quarantine queue includes the failed check, attempt count, and a link back to the run log row |
| Storage | Duplicates on re-run | Idempotent upsert keyed on order id | Stores `model_version`, `prompt_version`, and `extracted_at` with each extraction (db305-06 "Derived artifacts") |
| Monitoring | No run log | One row per run including failures; cost per usable record | Baseline note compares two prompt versions on the same notes, field by field |

## Stretch goals
- Add `finish_reason` to the fake and treat `"length"` as its own failure (db305-07), separate from `parse`.
- Add per-field grading against a 20-note evaluation set and produce the correct / wrong / missed table from db305-08.
- Write the daily p50 and p95 latency query from db305-08 against `ai_run_log` (SQLite lacks `percentile_cont`; compute in Python or use an ordered `limit/offset`).

## Reflection prompts
- Which of the eight checks would have stopped the 4471/4417 gate-code incident? Why did nothing catch it before?
- Why is `validated_after_retry` worth tracking separately from `validated_ok`?
- What would make cost per usable record go up even if cost per call went down?

## Instructor notes (common pitfalls, how to adapt for time)
- `float("8.81") * 100` is `881.0000000000001`; learners who use `round()` pass the test but miss the point. Ask them to explain why `Decimal` is safer.
- `isinstance(True, int)` is `True` in Python; a confidence check that only tests for numbers will accept a boolean. The suite does not test this; ask learners to add a test.
- Short on time: provide `canonicalize` and focus on the eight checks, retry, and run log (about 5 hours).
- No-code variant: implement the checks as filter/router steps with a quarantine table and a run-log table in Airtable; evidence is run-history screenshots for each of the eight failure types.
