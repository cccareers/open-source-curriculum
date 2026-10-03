---
course_id: ai201
project_id: ai201-x01
title: "Northwind Freight Shared-Inbox Triage Harness"
kind: supplementary-project
status: draft
hours_estimate: 6
difficulty: core
related_lessons:
  - ai201-03
  - ai201-08
  - ai201-09
objectives:
  - Build an email triage workflow that classifies, routes, and drafts responses under human review
  - Design a workflow's triggers, actions, and state so it runs correctly across systems and repeated executions
competency_ids:
  - D3-S1-C03
  - D3-S1-C01
---

## Scenario

The freight services company from lessons 03 and 08 receives every customer email in one shared inbox. Your ops lead has agreed to a triage pilot on the condition that you prove, before anything touches live mail, that the control logic is right: automated mail never reaches the model, redeliveries never create a second case, a `requires_human` message always reaches the service lead, and nothing is sent to a customer without an approved status.

On a no-code platform these properties are hard to test except by hand. In this project you write the deterministic parts of the triage workflow as a small Python module, the "control layer", and pin them down with an automated test suite that runs offline. The model call is a function you pass in; the tests replace it with a stub that replays recorded outputs. When you rebuild the workflow on your platform, the module and the golden set become your specification and your regression set.

## What you will build / produce

- `triage.py`: intake filtering, quoted-history stripping, `Message-ID` dedupe, strict parsing of the classifier JSON, the keyword pre-screen OR-ed with the model's `requires_human`, the ordered routing table from lesson 08, and a send gate with outbound idempotency.
- `tests/golden.json`: a labeled golden set of messages with a recorded classifier output and the expected queue and draft mode for each. Start from the ten cases below and grow it to at least 30.
- A one-page note mapping each function to the step it becomes in your no-code workflow.

## Before you start (prerequisites, starter files or data)

- Lessons ai201-03 (idempotency, status gating) and ai201-08 (taxonomy, classification prompt, ordered routing) completed.
- Python 3.8 or newer and `pytest` (`python -m pip install pytest`).
- Create a project folder with `triage.py` (empty to begin with) and a `tests/` folder holding the two files below.
- No API key is needed. If you later want to record real model outputs into the golden set, write a separate script for that; the tests themselves must never call a live model.

The interface the tests expect (Python 3.8 compatible):

| Name | Contract |
| --- | --- |
| `ClassificationError`, `SendBlocked` | Exception classes |
| `strip_quoted(body) -> str` | Cuts at the first `On <date>, <name> wrote:` line or `-----Original Message-----` |
| `parse_classification(raw) -> dict` | Parses the JSON and enforces the closed vocabulary for `category` and `priority`, a 0-1 `category_confidence`, and a boolean `requires_human`; raises `ClassificationError` otherwise |
| `route(cls) -> dict` | First-match-wins ordered table from lesson 08; returns `rule`, `queue`, `sla_hours`, `draft_mode` |
| `triage(msg, classify, store) -> dict` | Dedupe on `msg["message_id"]` against `store`, drop automated mail (`status: ignored_automated`), strip quotes, call `classify(clean_body, subject, message_id, error_hint=None)`, one retry with the parse error as `error_hint`, otherwise `status: quarantined` with `raw_model_output`; on success, OR in the keyword pre-screen, route, and set `status: awaiting_review` |
| `unresolved_placeholders(text) -> list` | Every bracketed upper-case placeholder such as `[CONFIRM PICKUP DATE]` |
| `send_approved(record, outbox) -> str` | Returns the stored `sent_message_id` if one exists; otherwise refuses unless `status == "approved"` and no placeholders remain; appends exactly one message to `outbox` and stores its ID |

## Milestones

1. **Golden set first.** Read the ten golden cases and, before writing any code, write down the routing row you expect each to hit. Disagreements between you and the file are taxonomy questions; resolve them using the category definitions in lesson 08.
2. **Intake filters.** Implement automation-header and no-reply filtering and quoted-history stripping. Make the intake tests pass, and confirm the stub records zero model calls for filtered mail.
3. **Dedupe and state.** Implement `triage` with the `store` dict standing in for your record table. Pass the redelivery test: five deliveries, one record, one model call.
4. **Strict parsing and retry.** Implement `parse_classification` and the retry-then-quarantine path.
5. **Routing table as data.** Implement the ten rows from lesson 08 as a list, not nested `if` statements. Pass the golden set and the first-match test.
6. **Two detectors, OR-ed.** Add the keyword pre-screen. Golden case `g06` (a model that missed "legal action") must still route to `service_lead` with no draft.
7. **Send gate.** Implement `send_approved` and pass the three gate tests.
8. **Grow the golden set** to at least 30 cases including 3 forwards, 2 auto-replies, 1 bounce, 3 true `other` messages, and 2 that must trip `requires_human`, mirroring the lesson 08 corpus mix. Every new case gets a recorded output and an expected route.
9. **Map back to the platform.** For each function, name the module or step it becomes in your ai102 platform and the record field it reads or writes.

## Acceptance criteria

- [ ] `python -m pytest -q` passes with no network access.
- [ ] Filtered and duplicate messages never invoke the classifier (proved by the stub's call count).
- [ ] The routing table is a single ordered data structure, and the default row has an owner queue and an SLA.
- [ ] A malformed model response is retried once with the error, then quarantined with the raw output preserved.
- [ ] `requires_human` is the OR of the model flag and an independent keyword pre-screen.
- [ ] No code path appends to `outbox` unless `status == "approved"` and no placeholders remain, and a replayed send produces exactly one outbound message.
- [ ] The golden set has at least 30 cases, each with a one-line justification for its expected route.

## Automated checks (coding courses) / Evidence checklist (non-coding)

Save as `tests/golden.json` (starter golden set; extend it):

```json
[
  {"id": "g01",
   "message": {"message_id": "<a1@northwind.example>", "from": "dana.reyes@example.com", "subject": "Pricing for 12 pallets",
               "headers": {}, "body": "Hi, can you quote 12 pallets Columbus to Detroit, pickup Tuesday?"},
   "recorded_output": "{\"category\": \"quote_request\", \"category_confidence\": 0.93, \"priority\": \"normal\", \"priority_reason\": \"no deadline\", \"sentiment\": \"neutral\", \"entities\": {\"order_reference\": null, \"invoice_number\": null, \"requested_date\": null, \"company\": null}, \"requires_human\": false, \"rationale\": \"Asks for pricing on new pallets.\"}",
   "expected": {"queue": "quotes", "draft_mode": "full"}},
  {"id": "g02",
   "message": {"message_id": "<a2@northwind.example>", "from": "dana.reyes@example.com", "subject": "URGENT quote needed by tomorrow",
               "headers": {}, "body": "Need a price for 4 pallets to Toledo, must ship tomorrow."},
   "recorded_output": "{\"category\": \"quote_request\", \"category_confidence\": 0.91, \"priority\": \"high\", \"priority_reason\": \"deadline within 48h\", \"sentiment\": \"neutral\", \"entities\": {\"order_reference\": null, \"invoice_number\": null, \"requested_date\": null, \"company\": null}, \"requires_human\": false, \"rationale\": \"Pricing request with next-day deadline.\"}",
   "expected": {"queue": "quotes_priority", "draft_mode": "full"}},
  {"id": "g03",
   "message": {"message_id": "<a3@acme.example>", "from": "ap@acme.example", "subject": "Where is order NW-4471?",
               "headers": {}, "body": "Can you tell me where order NW-4471 is?\n\nOn Mon, Mar 9, 2026, Quotes Team wrote:\n> Your order is booked."},
   "recorded_output": "{\"category\": \"order_status\", \"category_confidence\": 0.95, \"priority\": \"normal\", \"priority_reason\": \"routine\", \"sentiment\": \"neutral\", \"entities\": {\"order_reference\": \"NW-4471\", \"invoice_number\": null, \"requested_date\": null, \"company\": null}, \"requires_human\": false, \"rationale\": \"Asks about booked order NW-4471.\"}",
   "expected": {"queue": "ops", "draft_mode": "full"}},
  {"id": "g04",
   "message": {"message_id": "<a4@acme.example>", "from": "ap@acme.example", "subject": "Order update?",
               "headers": {}, "body": "Any update on our shipment?"},
   "recorded_output": "{\"category\": \"order_status\", \"category_confidence\": 0.88, \"priority\": \"normal\", \"priority_reason\": \"routine\", \"sentiment\": \"neutral\", \"entities\": {\"order_reference\": null, \"invoice_number\": null, \"requested_date\": null, \"company\": null}, \"requires_human\": false, \"rationale\": \"Asks about an existing shipment without a reference.\"}",
   "expected": {"queue": "ops", "draft_mode": "clarify"}},
  {"id": "g05",
   "message": {"message_id": "<a5@acme.example>", "from": "ap@acme.example", "subject": "Damaged pallets",
               "headers": {}, "body": "Two pallets arrived crushed. This is the second time this month."},
   "recorded_output": "{\"category\": \"complaint\", \"category_confidence\": 0.97, \"priority\": \"high\", \"priority_reason\": \"complaint\", \"sentiment\": \"negative\", \"entities\": {\"order_reference\": null, \"invoice_number\": null, \"requested_date\": null, \"company\": null}, \"requires_human\": false, \"rationale\": \"Reports damaged delivery.\"}",
   "expected": {"queue": "service_lead", "draft_mode": "acknowledge_only"}},
  {"id": "g06",
   "message": {"message_id": "<a6@acme.example>", "from": "ap@acme.example", "subject": "Invoice question",
               "headers": {}, "body": "Our lawyer says invoice INV-2209 is wrong and we may take legal action."},
   "recorded_output": "{\"category\": \"billing_question\", \"category_confidence\": 0.92, \"priority\": \"normal\", \"priority_reason\": \"routine\", \"sentiment\": \"negative\", \"entities\": {\"order_reference\": null, \"invoice_number\": \"INV-2209\", \"requested_date\": null, \"company\": null}, \"requires_human\": false, \"rationale\": \"Disputes invoice INV-2209.\"}",
   "expected": {"queue": "service_lead", "draft_mode": "none"}},
  {"id": "g07",
   "message": {"message_id": "<a7@vendor.example>", "from": "sales@vendor.example", "subject": "Partnership opportunity",
               "headers": {}, "body": "We help logistics firms grow. Can we book 15 minutes?"},
   "recorded_output": "{\"category\": \"vendor_or_sales\", \"category_confidence\": 0.96, \"priority\": \"low\", \"priority_reason\": \"sales\", \"sentiment\": \"positive\", \"entities\": {\"order_reference\": null, \"invoice_number\": null, \"requested_date\": null, \"company\": null}, \"requires_human\": false, \"rationale\": \"Inbound sales pitch.\"}",
   "expected": {"queue": "archive", "draft_mode": "none"}},
  {"id": "g08",
   "message": {"message_id": "<a8@acme.example>", "from": "ap@acme.example", "subject": "Question",
               "headers": {}, "body": "Do you also store containers?"},
   "recorded_output": "{\"category\": \"other\", \"category_confidence\": 0.41, \"priority\": \"low\", \"priority_reason\": \"none\", \"sentiment\": \"neutral\", \"entities\": {\"order_reference\": null, \"invoice_number\": null, \"requested_date\": null, \"company\": null}, \"requires_human\": false, \"rationale\": \"Asks about storage, not a listed category.\"}",
   "expected": {"queue": "triage_review", "draft_mode": "none"}},
  {"id": "g09",
   "message": {"message_id": "<a9@acme.example>", "from": "ap@acme.example", "subject": "Statement attached",
               "headers": {}, "body": "Please see our statement for March."},
   "recorded_output": "{\"category\": \"billing_question\", \"category_confidence\": 0.81, \"priority\": \"normal\", \"priority_reason\": \"routine\", \"sentiment\": \"neutral\", \"entities\": {\"order_reference\": null, \"invoice_number\": null, \"requested_date\": null, \"company\": null}, \"requires_human\": false, \"rationale\": \"Sends a statement.\"}",
   "expected": {"queue": "billing", "draft_mode": "full"}},
  {"id": "g10",
   "message": {"message_id": "<a10@acme.example>", "from": "ap@acme.example", "subject": "Booking",
               "headers": {}, "body": "Book the usual run for Friday please."},
   "recorded_output": "{\"category\": \"quote_request\", \"category_confidence\": 0.55, \"priority\": \"normal\", \"priority_reason\": \"routine\", \"sentiment\": \"neutral\", \"entities\": {\"order_reference\": null, \"invoice_number\": null, \"requested_date\": null, \"company\": null}, \"requires_human\": false, \"rationale\": \"Unclear whether new work or existing booking.\"}",
   "expected": {"queue": "triage_review", "draft_mode": "none"}}
]
```

Save as `tests/test_triage.py`:

```python
"""Acceptance tests for the shared-inbox triage harness (ai201-x01).

Runs fully offline: the model call is replaced by a stub that replays
recorded classifier outputs from tests/golden.json.
Run with:  python -m pytest -q
"""
import json
import pathlib

import pytest

import triage

GOLDEN = json.loads((pathlib.Path(__file__).parent / "golden.json").read_text())
RECORDED = {case["message"]["message_id"]: case["recorded_output"] for case in GOLDEN}


class StubClassifier:
    """Replays recorded model output. Counts calls so tests can prove
    that filtered or duplicate messages never reach the model."""

    def __init__(self, outputs=None):
        self.outputs = outputs  # optional list of raw strings returned in order
        self.calls = []

    def __call__(self, clean_body, subject, message_id, error_hint=None):
        self.calls.append({"body": clean_body, "error_hint": error_hint})
        if self.outputs is not None:
            return self.outputs[len(self.calls) - 1]
        return RECORDED[message_id]


def msg(**overrides):
    base = {"message_id": "<t1@test>", "from": "dana.reyes@example.com",
            "subject": "Pricing for 12 pallets", "headers": {},
            "body": "Hi, can you quote 12 pallets Columbus to Detroit?"}
    base.update(overrides)
    return base


# 1. Golden set: every recorded case lands in the expected queue and draft mode.
@pytest.mark.parametrize("case", GOLDEN, ids=[c["id"] for c in GOLDEN])
def test_golden_routing(case):
    record = triage.triage(case["message"], StubClassifier(), store={})
    assert record["status"] == "awaiting_review"
    assert record["queue"] == case["expected"]["queue"]
    assert record["draft_mode"] == case["expected"]["draft_mode"]


# 2. Intake filters run before any model call.
@pytest.mark.parametrize("headers,sender", [
    ({"Auto-Submitted": "auto-replied"}, "dana.reyes@example.com"),
    ({"Precedence": "bulk"}, "news@example.com"),
    ({"List-Unsubscribe": "<mailto:x@example.com>"}, "news@example.com"),
    ({}, "MAILER-DAEMON@mail.example.com"),
    ({}, "no-reply@carrier.example"),
])
def test_automated_mail_never_reaches_model(headers, sender):
    stub = StubClassifier(outputs=[])
    record = triage.triage(msg(headers=headers, **{"from": sender}), stub, store={})
    assert record["status"] == "ignored_automated"
    assert stub.calls == []


def test_quoted_history_is_stripped_before_classification():
    body = "Where is NW-4471?\n\nOn Mon, Mar 9, 2026, Quotes Team wrote:\n> We quoted $900."
    assert triage.strip_quoted(body).strip() == "Where is NW-4471?"
    body2 = "FYI see below\n-----Original Message-----\nFrom: someone"
    assert triage.strip_quoted(body2).strip() == "FYI see below"


# 3. Dedupe on Message-ID: a redelivery is one case and one model call.
def test_redelivery_is_deduplicated():
    store, stub = {}, StubClassifier()
    first = triage.triage(GOLDEN[0]["message"], stub, store)
    for _ in range(4):
        again = triage.triage(GOLDEN[0]["message"], stub, store)
        assert again is first or again == first
    assert len(store) == 1
    assert len(stub.calls) == 1


# 4. Output validation: closed vocabulary, one retry with the error, then quarantine.
def test_parse_rejects_out_of_vocabulary_category():
    bad = json.loads(RECORDED["<a1@northwind.example>"])
    bad["category"] = "quote request"
    with pytest.raises(triage.ClassificationError):
        triage.parse_classification(json.dumps(bad))


def test_one_retry_with_error_hint_then_success():
    good = RECORDED["<a1@northwind.example>"]
    stub = StubClassifier(outputs=["Here is the JSON you requested: {", good])
    record = triage.triage(msg(), stub, store={})
    assert record["status"] == "awaiting_review"
    assert len(stub.calls) == 2
    assert stub.calls[1]["error_hint"]  # the parse error was passed back


def test_two_failures_quarantine_with_raw_output():
    stub = StubClassifier(outputs=["not json", "still not json"])
    record = triage.triage(msg(), stub, store={})
    assert record["status"] == "quarantined"
    assert record["raw_model_output"] == "still not json"
    assert "queue" not in record or record["queue"] is None


# 5. Two independent requires_human detectors, OR-ed.
def test_keyword_prescreen_overrides_model():
    case = next(c for c in GOLDEN if c["id"] == "g06")  # model said requires_human false
    record = triage.triage(case["message"], StubClassifier(), store={})
    assert record["requires_human"] is True
    assert record["queue"] == "service_lead"
    assert record["draft_mode"] == "none"


# 6. Ordered routing table: first match wins, overrides first.
def test_first_match_wins():
    cls = json.loads(RECORDED["<a2@northwind.example>"])  # quote_request, high
    cls.update(requires_human=True, category_confidence=0.5)  # also satisfies rows 1 and 2
    assert triage.route(cls)["queue"] == "service_lead"
    cls["requires_human"] = False
    assert triage.route(cls)["queue"] == "triage_review"


# 7. Review gate and outbound idempotency.
def test_unapproved_record_cannot_send():
    outbox = []
    record = {"case_id": "CASE-1", "status": "awaiting_review", "draft": "Thanks, we will reply.",
              "sent_message_id": None}
    with pytest.raises(triage.SendBlocked):
        triage.send_approved(record, outbox)
    assert outbox == []


def test_unresolved_placeholder_blocks_send():
    outbox = []
    record = {"case_id": "CASE-2", "status": "approved",
              "draft": "Your pickup is booked for [CONFIRM PICKUP DATE].", "sent_message_id": None}
    assert triage.unresolved_placeholders(record["draft"]) == ["[CONFIRM PICKUP DATE]"]
    with pytest.raises(triage.SendBlocked):
        triage.send_approved(record, outbox)
    assert outbox == []


def test_replayed_send_is_idempotent():
    outbox = []
    record = {"case_id": "CASE-3", "status": "approved",
              "draft": "Your order NW-4471 left Columbus this morning.", "sent_message_id": None}
    first_id = triage.send_approved(record, outbox)
    second_id = triage.send_approved(record, outbox)
    assert first_id == second_id
    assert len(outbox) == 1
```

Run from the project folder with `python -m pytest -q`. The `python -m` form puts the project folder on the import path so `import triage` resolves.

## Rubric

| Criterion | Developing | Meets | Exceeds |
| --- | --- | --- | --- |
| Intake safety | Some automated mail reaches the classifier | All header and address filters work and are tested before any model call | Adds thread matching on `In-Reply-To` with its own tests |
| State and idempotency | Duplicates create extra records or calls | One record and one call per `Message-ID`; send is idempotent | Simulates a crash between send and record write and shows the stored ID prevents a resend |
| Output validation | Model output used without parsing checks | Closed vocabulary enforced; retry then quarantine | Adds per-field checks (rationale length, entity date format) with tests |
| Routing | Branching logic hard to read | Ordered table as data; first-match proven | Table loaded from a CSV a non-engineer can edit, with a test that every category reaches a row |
| Golden set quality | Fewer than 30 cases or mostly happy path | 30+ cases covering the lesson 08 corpus mix | Includes second-labeler agreement figure for the cases |

## Stretch goals

- Add a `reclassify(record, new_category)` reviewer action that re-runs routing and drafting and logs the change, with tests.
- Add an outbound hard cap per thread per day (lesson 08's auto-reply loop defence) and test it.
- Record live outputs for the golden set with your own classification prompt, then report per-category accuracy and the worst confusion pair.

## Reflection prompts

- Which golden case did you expect to route differently from the file, and what does that tell you about your taxonomy definitions?
- Where in your no-code platform would the `store` lookup and the `sent_message_id` check live, and what happens if two runs reach them at the same moment?
- The keyword pre-screen will produce false positives. What does a false positive cost here compared to a false negative?

## Instructor notes (common pitfalls, how to adapt for time)

- Learners often lower-case and substring-match `"auto"` in headers; `Auto-Submitted: no` is a legitimate header meaning a human sent it. The provided tests do not cover this case, so add one if you want to push on it.
- The most common failure is putting the confidence check after the category rows, so low-confidence quote requests get a full draft. The first-match test catches it.
- If learners want to send a reply in a test, steer them back: the send gate tests use an in-memory `outbox` list on purpose.
- For a 3-hour version, supply `strip_quoted` and `is_automated` and assess milestones 3 to 7 only.
- A reference solution was used to check that these tests run (25 passing on Python 3.8 with pytest 6). It is not included here, so learners write their own.
