---
lesson_id: ai201-03
course_id: ai201
pathway: prompt-engineer
title: 'Workflow Architecture: Triggers, Actions, and State'
order: 3
kind: lesson
competency_ids:
  - D3-S1-C01
objectives:
  - Design a workflow's triggers, actions, and state so it runs correctly across systems and repeated executions
---

## Three parts, and only one of them is obvious

You already know how to add a step to a scenario. Architecture is the part that decides whether the twenty-thousandth run behaves like the first one. A workflow has exactly three moving parts, and most production incidents come from the one people design last.

**Triggers** decide when a run happens and what it starts with. **Actions** do the work of one run. **State** is everything the workflow knows that outlives a single run. Beginners design triggers and actions and let state emerge accidentally — usually as a spreadsheet column somebody adds during an incident. This lesson designs all three deliberately, starting from a boundary contract like the one you produced in the previous lesson.

The reason state matters so much is that automation platforms give you the weakest possible guarantee: **at least once**. A run may fire twice for the same event. A run may fail halfway and be replayed. Two runs may execute at the same moment against the same record. None of that is a bug in the platform; it is the cost of a distributed system that never loses work. Your architecture makes those events harmless.

## Triggers: four kinds, different failure modes

**Webhook.** An external system posts to a URL you own the moment something happens. Lowest latency, one run per event, and the payload is whatever the sender chose to include. Failure modes: the sender retries and you get duplicates; the sender changes its payload shape without telling you; your endpoint is down and the event is gone forever unless the sender queues.

**Polling.** The platform asks a source "anything new?" on an interval. Simple and resilient — if a poll fails, the next one picks the record up. Failure modes: latency equal to the poll interval; the "new since" cursor is usually a timestamp or an ID, and records that arrive out of order or get edited without changing the cursor are silently skipped.

**Schedule.** Runs at a fixed time regardless of events. Right for reports, reconciliation, and batch work. Failure modes: timezone and daylight-saving drift, and the empty-run case nobody handles ("no data this week" should be a decision, not a crash).

**Manual or form.** A person starts it. Right for anything expensive, irreversible, or rare. Failure modes: the person starts it twice.

Pick by asking two questions. *How fast must this be?* Under a minute means webhook. *What happens if one event is missed entirely?* If the answer is "a customer waits forever," add a scheduled sweeper that finds unprocessed records regardless of the primary trigger. Belt-and-braces triggering — a webhook for speed plus a nightly poll for completeness — is standard for anything customer-visible, and it is only safe if your dedupe works, which is the next section.

A trigger payload is a contract you do not control. Capture the raw payload before you touch it:

```json
{
  "event_id": "evt_9f31b0c4",
  "event_type": "form.submitted",
  "occurred_at": "2026-03-11T14:02:55Z",
  "data": {
    "submission_id": "sub_20260311_0142",
    "email": "  Dana.Reyes@Example.com ",
    "company": "Northwind Freight",
    "request_type": "quote",
    "message": "Need pricing for 12 pallets, Tue pickup",
    "attachments": []
  }
}
```

Note `event_id` and `submission_id`. One identifies the delivery, the other identifies the thing. You need both, and they mean different things: two deliveries of the same submission are a duplicate you should ignore; two submissions from the same person are two real cases.

## Actions: one run, one job

Inside a run, keep each step doing one thing that you can name. The temptation on no-code platforms is to build a single enormous scenario with fifteen branches. It works until it doesn't, and then no one can tell which branch failed.

Three architectural habits that pay for themselves:

**Validate at the front door.** The first action after the trigger checks that the payload has what the rest of the run assumes. Missing required field, unparseable date, unknown enum value — stop here, write the case to a quarantine location with the raw payload, and exit cleanly. A run that gets to step nine before discovering the email address was blank has already done eight steps of damage.

**Separate reads, decisions, and writes.** Gather everything you need, decide, then write. Interleaved reads and writes are what make partial failures unrecoverable: if the run dies after write two of four, you cannot tell from the outside how far it got.

**Make writes idempotent.** Every write should be expressible as "make this record match this state," not "add one to this thing." `set status = extracted` is safe to run twice. `append a row` is not, unless the row has a key you check first.

Split a large process into more than one workflow when a step waits for a human or an external event. A workflow that ends by writing `status: awaiting_review` and a second workflow that triggers when the status changes to `approved` is far easier to reason about, retry, and debug than one scenario trying to hold a run open across a two-day approval.

## State: the part you have to design

State is anything that must be true between runs. Three places it can live, and you should be deliberate about which:

- **Run scope.** Variables inside a single execution. Free, fast, gone when the run ends. Never store anything you would need to answer "did we already handle this?"
- **The record store.** A table — Airtable is the common choice on these platforms — holding one row per case, with the fields the process needs and a status. This is where nearly all durable state belongs.
- **The system of record.** The CRM, ERP, or ticketing system that the business already treats as authoritative. Read from it; write back to it only the fields your process genuinely owns, and never duplicate a field it owns into your table as anything other than a cached copy with a timestamp.

Design the record before you design the steps. For the quote-request process above:

```json
{
  "case_id": "CASE-2026-0311-0142",
  "source_submission_id": "sub_20260311_0142",
  "received_at": "2026-03-11T14:02:55Z",
  "requester_email": "dana.reyes@example.com",
  "company": "Northwind Freight",
  "request_type": "quote",
  "status": "awaiting_review",
  "status_changed_at": "2026-03-11T14:03:07Z",
  "ai_classification": "freight_quote",
  "ai_confidence": 0.82,
  "assigned_to": "quotes_queue",
  "draft_response_id": "draft_7781",
  "reviewed_by": null,
  "attempt_count": 1,
  "last_error": null,
  "raw_payload": "{...}"
}
```

Six of those fields are pure architecture rather than business data: `case_id`, `source_submission_id`, `status`, `status_changed_at`, `attempt_count`, and `last_error`. They exist so the workflow can be replayed, resumed, and debugged. Include them from day one; retrofitting them into a live table is miserable.

## Status as a state machine

Give the record a `status` field with a small, closed set of values and legal transitions. Not "a checkbox for each thing that happened" — an actual state machine, because a checkbox model lets a record be simultaneously approved and rejected and nobody notices for a month.

A workable set for an AI workflow with a review gate:

```text
received -> validated -> enriched -> awaiting_review -> approved -> completed
                |            |             |                |
                v            v             v                v
            quarantined   failed        rejected          failed
```

Rules that make it real:

- **A run may only advance a record from the status it expects.** The step that sends the response checks `status = approved` before sending, and exits quietly otherwise. This one check absorbs most duplicate-run damage.
- **Every status change stamps `status_changed_at`.** You cannot measure cycle time or find stuck records without it.
- **`awaiting_review` is a first-class state, not a pause.** Human review is part of the process, so it gets a status, a queue, an owner, and an age you can alert on. Every customer-facing branch in the workflows you build in this course ends in a review state before anything leaves the building.
- **Terminal states are terminal.** Nothing transitions out of `completed`. Reopening means a new case with a link to the old one.

![Status state machine for an AI workflow showing the review gate and failure branches](./img/workflow-state-machine.png)

## Idempotency and dedupe

Idempotency means running the same thing twice produces the same result as running it once. It is achieved with a key and a check, not with hope.

**Pick a natural key from the source.** `source_submission_id`, the invoice number, the message ID, the external record ID. If the source gives you nothing stable, build one deterministically from immutable content: a hash of sender plus timestamp plus subject. Never use "now" or a random value — a random key makes every duplicate look new.

**Check before you create.** The second action in the run searches the record store for the key. Found means this event is already known; exit or resume from the record's current status. Not found means create the record, then continue. On platforms without a real unique constraint you will occasionally lose a race and create two rows; a nightly sweep that merges rows sharing a natural key is the pragmatic fix.

**Make outbound side effects keyed too.** Sending an email, creating a ticket, posting a payment — store the resulting external ID on the record as soon as you get it. Before sending, check whether the ID already exists. That check is what stops a replayed run from emailing a customer twice.

Concurrency deserves one specific warning. Two runs touching the same record at the same moment will both read the old status, both decide to act, and both write. If a step matters — sending money, sending a customer message — gate it on a status transition that only one run can win, and re-read the record immediately before the side effect rather than trusting a value read eight steps ago.

## Retries, failures, and the dead-letter path

Distinguish transient from permanent before you decide to retry. A `429` or `503` from an API is transient: retry with increasing delay, three attempts, then stop. A `400` or a validation error is permanent: retrying identical bad input a hundred times just burns operations and fills your logs.

Increment `attempt_count` on every retry and write the error text to `last_error`. When attempts are exhausted, set `status: failed` and route the case to a location a human checks — a view filtered to `status = failed`, plus a notification. That is a dead-letter queue, and having one is the difference between "we found out on Tuesday" and "the customer found out for us."

Finally, version and name things so a stranger can navigate them. Name workflows `<process>-<stage>-<verb>`, for example `quote-intake-classify` and `quote-intake-send`. Keep a short header note in each scenario describing the trigger, the record it owns, and the statuses it moves between. When you return to this in five months during an incident, that note is worth more than the diagram.

## Running correctly across systems

A workflow that spans three systems has a fourth problem: the systems disagree, and one of them was down when you wrote.

**Nothing is transactional across systems.** If your run writes to your record table, then creates a ticket, then updates the CRM, a failure between the second and third leaves you in a state no single system can describe. Design for it: write your own record *first* with a status that says how far you got (`ticket_created`, `crm_pending`), so a resumed run can read the record and continue from there rather than starting over. Your record table is the only place that knows the whole truth of a run.

**Store external IDs the moment you get them.** The ticket ID, the message ID, the document ID. They are how a resumed run distinguishes "I have not done this yet" from "I did this and did not get to write it down." Without them, resumption is guesswork.

**Read the state you are about to act on, not the state you read earlier.** A run that fetched a record at step two and writes at step eleven is acting on a nine-step-old belief. Re-read immediately before any consequential write.

**Assume every external call can fail, time out, or succeed slowly.** A timeout is the worst case, because the call may have succeeded. This is precisely why outbound side effects need an idempotency key checked before the call and an external ID stored after it — a timeout followed by a retry must not create a second ticket.

**Separate environments where you can.** A test record store, test credentials, and a way to point the workflow at a sandbox is worth the setup time. Where the platform makes it awkward, at minimum add a `test_mode` flag on the record that suppresses outbound side effects, so you can exercise the whole path safely. Building against production because it was faster is how a course exercise emails a real customer.

Finally, build a small set of fixture payloads and keep them: a normal case, a duplicate, a missing-field case, one with an unexpected extra field, and one with a value at a boundary. Re-run them after every change. Five fixtures take ten minutes to assemble and will catch most of what you would otherwise discover in production.

## Practice

Take the boundary contract from your process brief and turn it into a working skeleton. Use whichever platform you worked in during ai102; the design is what is being assessed, not the vendor.

1. **Write the architecture note first**, before building. One page: trigger type and why, the natural key you will dedupe on, the record schema as a JSON block, the status list with legal transitions, and which step is the human review gate.
2. **Create the record table** with your business fields plus the six architecture fields (`case_id`, natural key, `status`, `status_changed_at`, `attempt_count`, `last_error`) and a raw-payload field.
3. **Build the intake workflow**: trigger, front-door validation, dedupe check against the natural key, create-or-resume, then advance the status to `validated`. Do not add any AI step; this exercise is about control flow.
4. **Prove idempotency.** Fire the exact same trigger payload five times in a row. Success is exactly one record, `attempt_count` unchanged, and four runs that exit early on the dedupe check. Capture the execution history as evidence.
5. **Prove the state gate.** Manually set a record to `rejected`, then replay a run that would have advanced it to `approved`. The run must exit without changing anything. Fix your gate if it does not.
6. **Build the failure path.** Point one action at a deliberately bad endpoint or supply input that will fail validation. Confirm the run retries only if the error is transient, increments `attempt_count`, writes `last_error`, sets `status: failed`, and lands in a view a human would actually see.
7. **Write down one race condition** your design could still lose, and the check you would add to close it. Not every race is worth fixing; naming it is what separates a design from a guess.
