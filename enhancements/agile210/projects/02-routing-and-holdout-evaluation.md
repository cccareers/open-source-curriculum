---
course_id: agile210
project_id: agile210-x02
title: "Routing Table and Hold-Out Evaluation Harness"
kind: supplementary-project
status: draft
hours_estimate: 4
difficulty: core
related_lessons:
  - agile210-05
  - agile210-07
objectives:
  - Build the capstone's AI workflow, with prompts, chaining, and automation logic that meet the brief
  - Test, troubleshoot, and harden the capstone until it survives realistic use
competency_ids:
  - D2-S1-C02
  - D3-S1-C01
  - D1-S1-C04
  - D3-S1-C05
---

## Scenario
The invoice capstone's stage-05 routing table decides what the office manager sees, and stage 07 asks you to set its threshold from evidence. Both are easy to get subtly wrong: a routing table with no default row drops records, a chain that only reads the last step's confidence launders an unsure extraction into a confident record, and a threshold picked "because it sounded right" either floods the review queue or lets errors through. You will build both as small, tested functions so the logic in your real workflow can be checked against them.

## What you will build / produce
`routing_eval.py` with:
- `route(record, categories, threshold) -> {"route", "owner", "target"}` implementing the stage-05 table in this order: format gate rejected → `escape_hatch`; any step failed after retries → `failed_alert`; arithmetic check failed → `review_flagged`; category not in the closed list → `review_flagged`; **minimum** of `step_confidences` below threshold → `review`; everything passed and confident → `auto_complete`; anything else (the default row) → `review`. Owners and target times as in the lesson (office manager, 1 working day, and so on).
- `field_accuracy(labels, outputs, fields) -> (correct, total)` — field-level accuracy with its denominator.
- `segment_accuracy(labels, outputs, fields, segment_fn) -> {segment: (correct, total)}` — the stage-07 bias check with numbers.
- `threshold_tradeoff(results, threshold) -> {"errors_total", "errors_caught", "unnecessary_reviews"}` where `results` is a list of `(confidence, was_correct)`.
- `choose_threshold(results, candidates, max_missed_errors)` — the lowest candidate that lets no more than `max_missed_errors` wrong outputs through unreviewed, or `None`.

Plus a half-page **threshold memo** in the stage-07 style: "At X, we catch N of M errors and send K correct records to review unnecessarily", with the brief's tolerance and your recommendation.

## Before you start (prerequisites, starter files or data)
- Python 3.10+, `pytest`.
- Copy the suite below to `tests/test_routing_eval.py`. The labels use invented supplier names that match the course's running example; replace them with your own redacted hold-out when you reuse the harness in stage 07.

## Milestones
1. **Write the routing table as data first (30 min).** A list of (condition, route, owner, target) rows, including the default row.
2. **Implement `route` (45 min).** Make the confidence-laundering test pass by carrying the minimum confidence forward.
3. **Evaluation functions (45 min).** Field accuracy and segmentation.
4. **Threshold trade-off (45 min).** Then read the `choose_threshold` test carefully: why is 0.75 the right answer for a budget of two missed errors, not 0.85?
5. **Threshold memo (30 min).**
6. **Optional (60 min).** Export your real stage-05 development results as `(confidence, correct)` pairs and run `threshold_tradeoff` across 0.5–0.95.

## Acceptance criteria
- [ ] `python -m pytest -q` reports `14 passed`.
- [ ] A record missing every expected key still gets a route (the default row).
- [ ] An unsure step anywhere in the chain sends the record to review.
- [ ] Every accuracy figure is reported with its denominator.
- [ ] The memo states the trade-off with numbers and names the tolerance it was chosen against.

## Automated checks (coding courses) / Evidence checklist (non-coding)
Save as `tests/test_routing_eval.py`; run `python -m pytest -q`.

```python
# tests/test_routing_eval.py  -- run with:  python -m pytest -q
import pytest
from routing_eval import (route, field_accuracy, segment_accuracy,
                          threshold_tradeoff, choose_threshold)

CATEGORIES = {"stationery", "furniture", "it_equipment", "cleaning", "catering", "services"}

def rec(**kw):
    base = {"handleable": True, "steps_failed": False, "totals_match": True,
            "category": "stationery", "step_confidences": [0.95, 0.92]}
    base.update(kw)
    return base

# --- Routing table from stage 05, with a default row --------------------------
@pytest.mark.parametrize("record, expected", [
    (rec(), "auto_complete"),
    (rec(handleable=False), "escape_hatch"),
    (rec(steps_failed=True), "failed_alert"),
    (rec(totals_match=False), "review_flagged"),
    (rec(category="office_party"), "review_flagged"),          # off-vocabulary
    (rec(step_confidences=[0.95, 0.60]), "review"),
])
def test_routing_rows(record, expected):
    assert route(record, CATEGORIES, threshold=0.85)["route"] == expected

def test_confidence_laundering_is_blocked():
    # extraction was unsure (0.4); categorisation was sure (0.97) -> still review
    assert route(rec(step_confidences=[0.4, 0.97]), CATEGORIES, 0.85)["route"] == "review"

def test_every_route_has_an_owner_and_target():
    for r in [rec(), rec(handleable=False), rec(steps_failed=True), rec(totals_match=False)]:
        out = route(r, CATEGORIES, 0.85)
        assert out["owner"] and out["target"]

def test_unexpected_record_hits_default_row_not_nothing():
    weird = {"handleable": True}          # missing keys entirely
    assert route(weird, CATEGORIES, 0.85)["route"] == "review"

# --- Evaluation on the hold-out (stage 07) -------------------------------------
FIELDS = ["supplier_name", "invoice_number", "invoice_date", "total"]
LABELS = {
    "H01": {"supplier_name": "Harbour Office Supplies", "invoice_number": "INV-20931", "invoice_date": "2026-03-03", "total": "1240.00", "_supplier_group": "top8"},
    "H02": {"supplier_name": "Kestrel Cleaning", "invoice_number": "KC-551", "invoice_date": "2026-03-04", "total": "88.20", "_supplier_group": "other"},
    "H03": {"supplier_name": "Northgate IT", "invoice_number": "NG/0042", "invoice_date": "2026-03-05", "total": "612.00", "_supplier_group": "top8"},
}
OUTPUTS = {
    "H01": {"supplier_name": "Harbour Office Supplies", "invoice_number": "INV-20931", "invoice_date": "2026-03-03", "total": "1240.00"},
    "H02": {"supplier_name": "Kestrel Cleaning", "invoice_number": "KC-551", "invoice_date": "2026-03-01", "total": None},
    "H03": {"supplier_name": "Northgate IT", "invoice_number": "NG/0042", "invoice_date": "2026-03-05", "total": "612.00"},
}

def test_field_level_accuracy_reports_numerator_and_denominator():
    assert field_accuracy(LABELS, OUTPUTS, FIELDS) == (10, 12)

def test_segmented_accuracy_exposes_a_gap():
    seg = segment_accuracy(LABELS, OUTPUTS, FIELDS, lambda label: label["_supplier_group"])
    assert seg == {"top8": (8, 8), "other": (2, 4)}

# --- Thresholds from evidence ---------------------------------------------------
RESULTS = ([(0.95, True)] * 10 + [(0.90, True)] * 4 + [(0.80, True)] * 4
           + [(0.88, False)] * 2 + [(0.70, False)] * 7 + [(0.40, False)] * 2)

def test_tradeoff_at_085():
    t = threshold_tradeoff(RESULTS, 0.85)
    assert t == {"errors_total": 11, "errors_caught": 9, "unnecessary_reviews": 4}

def test_choose_lowest_threshold_meeting_the_error_budget():
    # brief can live with at most 2 errors slipping through unreviewed.
    # 0.75 already catches 9 of 11 and sends no correct record to review, so
    # raising it to 0.85 would only add 4 unnecessary reviews.
    assert choose_threshold(RESULTS, [0.6, 0.75, 0.85, 0.9], max_missed_errors=2) == 0.75
    assert choose_threshold(RESULTS, [0.6, 0.75, 0.85, 0.9], max_missed_errors=0) == 0.9

def test_no_threshold_works_returns_none():
    assert choose_threshold([(0.99, False)], [0.5, 0.9], max_missed_errors=0) is None
```

## Rubric
| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Routing | Nested conditions, no default | Table-ordered rules, default row, owners and targets | Rules expressed as data and printed into the hand-in as the routing table |
| Confidence handling | Last step's confidence only | Minimum across steps | Explains when a different combination (e.g. per-field confidence) would be better |
| Evaluation | Percentages without denominators | Counts and denominators, segmented | Adds records-fully-correct alongside field-level, as in the stage-07 table |
| Threshold | Picked by feel | Chosen from trade-off against a stated tolerance | Shows the confidence separation and says honestly if it is weak |
| Memo | Missing numbers | One paragraph with the trade-off and recommendation | Includes what would make you revisit the threshold |

## Stretch goals
- Add `confidence_separation(results)` that returns mean confidence for correct vs incorrect outputs, and flag when the gap is under 0.1.
- Produce the stage-07 evaluation table automatically from labels and outputs.
- Add a test for a record whose category is `None` and decide whether that is off-vocabulary or the default row.

## Reflection prompts
- Which row of your real routing table has no owner today?
- Did a lower threshold ever do better than a higher one on your data? What does that say about the confidence value?
- Which segment would you expect to perform worst on your capstone's real inputs?

## Instructor notes (common pitfalls, how to adapt for time)
- Many learners assume a higher threshold is always safer. The fixture shows 0.75 catching the same nine errors as 0.85 with no unnecessary reviews. Discuss why 0.85 is still chosen when the error budget is tighter.
- Python's `None not in categories` is `True`, so a missing category falls into `review_flagged` unless learners check for the key first; the default-row test covers the missing-key case.
- Best used between stages 05 and 07; the harness is then reused on the real hold-out.
- No-code variant: implement the routing table as a router step with explicit fallback branch, and do the threshold trade-off in a spreadsheet with a COUNTIFS per candidate threshold.
