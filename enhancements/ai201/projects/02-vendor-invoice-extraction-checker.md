---
course_id: ai201
project_id: ai201-x02
title: "Vendor Invoice Extraction Checker"
kind: supplementary-project
status: draft
hours_estimate: 6
difficulty: core
related_lessons:
  - ai201-02
  - ai201-07
  - ai201-11
objectives:
  - Extract and summarize the contents of inbound documents into structured fields a workflow can act on
competency_ids:
  - D3-S1-C02
---

## Scenario

The accounts-payable team from lesson 02 receives about 900 vendor invoices a month in `ap@`, and the clerk spends roughly four minutes per invoice re-keying vendor, total, and PO number into a tracking sheet. Your process brief recommended automating extraction, with a human review gate before anything is written to the tracking record.

The extraction prompt from lesson 07 returns a value, evidence, page, and confidence for every field. That output is untrusted. Before the AP lead lets the workflow post anything, they want proof that the checking code catches what lesson 07 warns about: fabricated evidence, OCR digit errors that break the arithmetic, duplicate invoices, multi-document scans, and low-confidence required fields. You will build that checking layer as a small Python module and prove it with an offline test suite fed by recorded extraction outputs.

## What you will build / produce

- `extract_check.py`: structural parsing, evidence-consistency checks, arithmetic reconciliation, business lookups (known vendor, duplicate invoice, plausible date), the lesson 07 confidence routing table, and field-level accuracy scoring.
- A gold set of at least 15 hand-keyed invoices (public samples or redacted real ones) with recorded extraction outputs from your own prompt.
- A one-page accuracy report: correct / wrong / correctly-null / missed per field, the worst field, one targeted change, and the re-measured number.

## Before you start (prerequisites, starter files or data)

- Lessons ai201-02 (the vendor-invoice step inventory) and ai201-07 (schema, extraction prompt, validation layers, routing) completed.
- Python 3.8 or newer and `pytest`.
- Create `extract_check.py` (empty to begin with) and `tests/test_extraction.py` from the listing below.

The interface the tests expect:

| Name | Contract |
| --- | --- |
| `ExtractionError` | Exception class |
| `parse_extraction(raw) -> dict` | Parses JSON, requires every schema field with `value`, `evidence`, `confidence`, numeric types for `subtotal`/`tax`/`total`, `currency` in `USD/CAD/EUR/GBP`, and a `document_notes` block |
| `extract_document(text, model) -> dict` | Calls `model(text, error_hint=None)`, one retry with the parse error, then `status: quarantined` with `raw_model_output` |
| `evidence_failures(result, text) -> list` | Names every non-null field whose evidence is not in the document text or does not support the value: compare text case-insensitively and numbers with Decimal after stripping currency symbols and separators; check each line item against the full item evidence; currency must be an explicit ISO code in the evidence, not inferred from an ambiguous `$` symbol |
| `arithmetic_failures(fields) -> list` | Messages naming both figures when line items do not sum to subtotal, or subtotal + tax does not equal total (tolerance 0.01) |
| `route_document(result, text, po_lookup, known_vendors, seen_invoices, floor, today) -> dict` | Returns `route` (`exception`, `full_review`, `light_review`, `auto_post`, checked in that order), `failed_checks`, `untrusted_fields` |
| `field_accuracy(predictions, gold) -> dict` | Per field: `correct`, `wrong`, `correctly_null`, `missed` |

## Milestones

1. **Key the gold set first.** Gather at least 15 invoices including 3 scans, 1 multi-invoice PDF, and 1 with an ambiguous date. Key every field by hand. This is the slow part; budget for it.
2. **Structural layer.** Implement `parse_extraction` and `extract_document`; pass the structural and retry tests.
3. **Evidence layer.** Implement `evidence_failures`. It is pure string work, with no model call.
4. **Arithmetic layer.** Implement `arithmetic_failures` so that each message names both figures, for example `line items do not sum to subtotal (2431.00 vs 2400.00)`.
5. **Business layer.** Known vendor, duplicate `(vendor, invoice_number)`, and an invoice date that is not in the future or more than two years old.
6. **Routing.** Implement the four-tier table from lesson 07. A field is trusted only when its confidence is at or above the floor, its evidence check passes, and no business rule on it failed.
7. **Measure.** Run your real extraction prompt over the gold set, save the outputs, and compute `field_accuracy`. Name the worst field, make one change (prompt, schema, or chunking), and re-measure that field.
8. **Calibrate the floor.** Tabulate accuracy above and below three candidate floors and choose one, stating the review rate it implies.

## Acceptance criteria

- [ ] `python -m pytest -q` passes offline.
- [ ] Every routing outcome in lesson 07's table is reachable and tested.
- [ ] Failed checks are recorded by rule name with the figures involved, not as a generic warning.
- [ ] A multi-document file routes to `exception` even when its fields look valid.
- [ ] A duplicate invoice never auto-posts.
- [ ] The accuracy report separates wrong from missed, and the confidence floor is justified with a measured table.

## Automated checks (coding courses) / Evidence checklist (non-coding)

Save as `tests/test_extraction.py`:

```python
"""Acceptance tests for the vendor-invoice extraction checker (ai201-x02).

Offline: the model is never called. Tests feed recorded extraction
outputs (the JSON your prompt returns) into your validation and routing code.
Run with:  python -m pytest -q
"""
import json

import pytest

import extract_check as ec

DOC_A = """LAKESHORE PALLET SUPPLY
Invoice No: LPS-10422
Invoice Date: 2026-03-02
PO Number: PO-7781
Description            Qty   Unit Price   Amount
GMA pallets 48x40      200   9.50         1,900.00
Heat treatment         200   2.50         500.00
Subtotal: 2,400.00
Tax: 37.00
Total: USD $2,437.00"""

PO_LOOKUP = {"PO-7781": 2437.00}
KNOWN_VENDORS = {"Lakeshore Pallet Supply"}
TODAY = "2026-03-11"


def f(value, evidence, confidence=0.97, page=1):
    return {"value": value, "evidence": evidence, "page": page, "confidence": confidence}


def result_a(**overrides):
    fields = {
        "vendor_name": f("Lakeshore Pallet Supply", "LAKESHORE PALLET SUPPLY"),
        "vendor_tax_id": f(None, None, 0),
        "invoice_number": f("LPS-10422", "Invoice No: LPS-10422"),
        "invoice_date": f("2026-03-02", "Invoice Date: 2026-03-02"),
        "due_date": f(None, None, 0),
        "po_number": f("PO-7781", "PO Number: PO-7781"),
        "currency": f("USD", "Total: USD $2,437.00", 0.9),
        "subtotal": f(2400.00, "Subtotal: 2,400.00"),
        "tax": f(37.00, "Tax: 37.00"),
        "total": f(2437.00, "Total: USD $2,437.00"),
        "line_items": f([
            {"description": "GMA pallets 48x40", "quantity": 200, "unit_price": 9.50, "amount": 1900.00},
            {"description": "Heat treatment", "quantity": 200, "unit_price": 2.50, "amount": 500.00},
        ], "GMA pallets 48x40      200   9.50         1,900.00\nHeat treatment         200   2.50         500.00"),
    }
    fields.update(overrides)
    return {"fields": fields,
            "document_notes": {"appears_to_be": "invoice", "contains_multiple_documents": False,
                               "legibility": "clean"}}


def route(result, text=DOC_A, seen=frozenset(), floor=0.9):
    return ec.route_document(result, text, po_lookup=PO_LOOKUP, known_vendors=KNOWN_VENDORS,
                             seen_invoices=set(seen), floor=floor, today=TODAY)


# 1. Structural validation
def test_structural_accepts_good_output():
    assert ec.parse_extraction(json.dumps(result_a()))["fields"]["total"]["value"] == 2437.00


@pytest.mark.parametrize("raw", [
    "Here is the JSON: {",                                                         # not JSON
    json.dumps({"fields": {}}),                                                     # missing keys
    json.dumps(result_a(currency=f("US Dollars", "Total: USD $2,437.00"))),            # enum violation
    json.dumps(result_a(total=f("2,437.00", "Total: USD $2,437.00"))),                 # wrong type
])
def test_structural_rejects_bad_output(raw):
    with pytest.raises(ec.ExtractionError):
        ec.parse_extraction(raw)


def test_one_retry_then_quarantine():
    calls = []

    def fake_model(text, error_hint=None):
        calls.append(error_hint)
        return "not json"

    record = ec.extract_document(DOC_A, fake_model)
    assert record["status"] == "quarantined"
    assert record["raw_model_output"] == "not json"
    assert len(calls) == 2 and calls[0] is None and calls[1]


# 2. Evidence consistency: evidence must be in the document and contain the value
def test_fabricated_evidence_is_caught():
    bad = result_a(invoice_number=f("LPS-10423", "Invoice No: LPS-10423"))
    assert "invoice_number" in ec.evidence_failures(bad, DOC_A)


def test_value_not_in_evidence_is_caught():
    bad = result_a(total=f(2473.00, "Total: USD $2,437.00"))
    assert "total" in ec.evidence_failures(bad, DOC_A)


def test_clean_extraction_has_no_evidence_failures():
    assert ec.evidence_failures(result_a(), DOC_A) == []


# 3. Arithmetic
def test_line_items_must_sum_to_subtotal():
    ocr_damaged = result_a(line_items=f([
        {"description": "GMA pallets 48x40", "quantity": 200, "unit_price": 9.50, "amount": 1960.00},
        {"description": "Heat treatment", "quantity": 200, "unit_price": 2.50, "amount": 500.00},
    ], "GMA pallets 48x40      200   9.50         1,900.00"))
    failures = ec.arithmetic_failures(ocr_damaged["fields"])
    assert any("subtotal" in msg for msg in failures)


def test_subtotal_plus_tax_must_equal_total():
    bad = result_a(tax=f(73.00, "Tax: 37.00"))
    assert any("total" in msg for msg in ec.arithmetic_failures(bad["fields"]))


# 4. Routing table from lesson ai201-07, checked in order
def test_clean_matched_invoice_auto_posts():
    assert route(result_a())["route"] == "auto_post"


def test_unmatched_po_goes_to_light_review():
    text = DOC_A.replace("PO-7781", "PO-9999")
    r = result_a(po_number=f("PO-9999", "PO Number: PO-9999"))
    assert route(r, text=text)["route"] == "light_review"


def test_low_confidence_required_field_goes_to_full_review():
    r = result_a(total=f(2437.00, "Total: USD $2,437.00", confidence=0.62))
    decision = route(r)
    assert decision["route"] == "full_review"
    assert "total" in decision["untrusted_fields"]


def test_duplicate_invoice_goes_to_full_review():
    decision = route(result_a(), seen={("Lakeshore Pallet Supply", "LPS-10422")})
    assert decision["route"] == "full_review"
    assert any("duplicate" in c for c in decision["failed_checks"])


def test_multi_document_file_is_an_exception_even_if_fields_look_fine():
    r = result_a()
    r["document_notes"]["contains_multiple_documents"] = True
    assert route(r)["route"] == "exception"


def test_failed_checks_are_named_with_figures():
    r = result_a(subtotal=f(2431.00, "Subtotal: 2,400.00"))
    decision = route(r)
    assert decision["route"] == "full_review"
    assert any("2431.00" in c and "2400.00" in c for c in decision["failed_checks"])


# 5. Field-level accuracy against a gold set
def test_field_accuracy_counts_wrong_separately_from_null():
    gold = [{"total": 2437.00, "due_date": None, "po_number": "PO-7781"},
            {"total": 980.00, "due_date": "2026-04-01", "po_number": None}]
    pred = [{"total": 2437.00, "due_date": None, "po_number": "PO-7781"},
            {"total": 98.00, "due_date": None, "po_number": None}]
    acc = ec.field_accuracy(pred, gold)
    assert acc["total"] == {"correct": 1, "wrong": 1, "correctly_null": 0, "missed": 0}
    assert acc["due_date"] == {"correct": 0, "wrong": 0, "correctly_null": 1, "missed": 1}
    assert acc["po_number"] == {"correct": 1, "wrong": 0, "correctly_null": 1, "missed": 0}
```

Run with `python -m pytest -q`. Once your module passes, add one test per real failure you see in your gold set run, using the recorded output as the fixture. This is the regression habit from lesson 11.

## Rubric

| Criterion | Developing | Meets | Exceeds |
| --- | --- | --- | --- |
| Validation layers | One or two layers implemented | All four layers, each tested | Adds a cross-field check (due date after invoice date) and a PO-amount tolerance with tests |
| Routing correctness | Routes on model confidence alone | Composite trust rule; four tiers in the right order | Adds a per-vendor floor driven by measured accuracy |
| Reviewer usefulness | Generic failure flags | Named rules with figures | Produces a reviewer payload listing untrusted fields first with evidence spans |
| Measurement | No gold set or document-level only | Field-level report with worst field and one re-measured change | Plots accuracy against confidence and shows the chosen floor's escape and review rates |

## Stretch goals

- Add the chunk-merge rule from lesson 07: take the highest-confidence non-null value per field and flag disagreements between chunks.
- Add an `ambiguous_date` check that rejects a non-null date whose evidence matches `\d{2}/\d{2}/\d{4}` with both parts at 12 or below.
- Feed `route_document` outcomes into a weekly review-rate and escape-rate summary.

## Reflection prompts

- Which of the four layers caught the most problems in your gold set run? Was that what you predicted?
- Your test suite feeds recorded outputs, so it cannot tell you whether the model got better or worse. What does it tell you, and what does the gold-set measurement tell you that the tests cannot?
- The AP clerk's re-keying step was 4 minutes. With your measured review rate, what is the realistic annual hours saving against the lesson 02 baseline?

## Instructor notes (common pitfalls, how to adapt for time)

- Learners frequently compare `"2,437.00"` to `2437.0` as strings. The evidence tests force numeric comparison.
- Watch for routing on model confidence alone. The low-confidence and duplicate-invoice tests are there to catch it.
- `date.fromisoformat` exists from Python 3.7 onward, so it is safe on 3.8.
- For a shorter version, provide `parse_extraction` and `field_accuracy` and assess milestones 3 to 6.
- These tests were checked against a reference implementation (18 passing on Python 3.8 with pytest 6). The reference is not included.
