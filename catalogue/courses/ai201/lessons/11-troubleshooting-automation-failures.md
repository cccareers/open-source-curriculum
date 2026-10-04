---
lesson_id: ai201-11
course_id: ai201
pathway: prompt-engineer
title: Troubleshooting Automation Failures
order: 11
kind: lesson
competency_ids:
  - D3-S1-C05
objectives:
  - Diagnose an automation failure from logs and execution history and repair the underlying cause
---

## Two kinds of broken

Automations fail loudly or quietly, and the loud ones are the good news.

A **loud failure** stops a run, colours a line red in the execution history, and often sends you a notification. You know it happened, you know when, and the platform kept the payload. Loud failures are inconvenient.

A **silent failure** produces a run marked successful that did the wrong thing. A filter that excludes 40% of records because a field name changed. A model that returned a plausible category for a message it did not understand. A date parsed with the wrong convention, writing valid-looking wrong dates for three weeks. Silent failures are the ones that cost money, and no notification will ever tell you about them. You find them by asserting on outputs and by reconciling counts — which means detection has to be designed in advance, before you need it.

This lesson covers both: a repeatable diagnostic method for loud failures, and the detection machinery for quiet ones. Throughout, the discipline is the same — **read the actual data before forming a theory.** The most expensive hour in troubleshooting is the one spent fixing the problem you assumed you had.

## Reading execution history properly

Every platform records runs. Learn to read yours precisely, because the difference between a five-minute fix and an afternoon is usually knowing where to look.

For a failed run, get four things:

1. **Which step failed**, and its position. A failure at step 2 means bad input; a failure at step 9 means the input was fine and something downstream changed.
2. **The exact input to that step** — not what you expect it to be, the actual bundle. Copy it out. Nine times in ten, the bug is visible in this payload and nowhere else.
3. **The exact error text**, in full. Truncated error messages hide the useful half.
4. **The outputs of the steps before it.** Where did the value go wrong? Trace it backwards until you find the step whose output is already incorrect.

For the wider picture, get three more: how many runs failed and over what window, whether they all failed at the same step, and what changed around the time failures started — a deploy, a credential rotation, a vendor release, a spike in volume, a date boundary such as month end.

That last question is the highest-yield one in troubleshooting. Systems that worked yesterday and fail today usually had something change. Find the change.

## A repeatable method

Work the steps in order. The order exists to stop you skipping to a fix.

**1. Establish scope and blast radius.** Every run, or some? Since when? Which records are affected? Answer this first, because it determines urgency and it tells you where to look. Every run failing at the same step from 14:02 onward is a change. Some runs failing scattered across days is a data-dependent problem.

**2. Reproduce.** Take the exact payload from a failed run and replay it. If it fails identically, you have a deterministic bug and a fast feedback loop. If it succeeds, you have a transient, a race, or something environmental — and the failed payload becomes evidence rather than a reproducer.

**3. Isolate the step.** Run only the failing step with the captured input. Strip it down until it either fails minimally or starts working; the last thing you removed is your suspect.

**4. Compare actual against expected.** Put the actual input beside the shape your step assumes. Field name, nesting, type, null, empty array versus missing key, string `"12"` versus number `12`. This comparison finds the majority of loud failures on its own.

**5. Form one hypothesis and state it falsifiably.** "The vendor changed `customer.email` to `customer.contact.email`, so the mapping resolves to null." Not "the API is being weird."

**6. Test the smallest change.** One change, then re-test. Changing three things and seeing green teaches you nothing and leaves two changes you cannot justify.

**7. Fix at the right layer**, which is the next section.

**8. Verify on the real failures**, not on a happy-path sample. Replay a batch of the actual failed payloads.

**9. Prevent recurrence.** A guard, an alert, a validation rule, or a note in the runbook. A fix with no prevention is a fix you will make again.

## The common failure catalogue

Recognizing the shape of an error saves the first three steps.

**Trigger did not fire.** No runs at all — the emptiest and most confusing symptom. Check in this order: is the workflow on; did the source event actually happen; is the webhook URL still registered on the sender's side; did the polling cursor advance past the records (a common consequence of a records-edited-without-timestamp-change bug); is a filter immediately after the trigger silently dropping everything. A filter dropping 100% of records looks exactly like a trigger that never fired unless your platform shows filtered runs.

**Authentication.** A `401` means the credential is invalid or revoked; a `403` means it is valid but not permitted. Rotation is the usual culprit for the first, a changed permission scope for the second. Both fail every run from a precise moment — a sharp cliff in the failure graph is nearly always a credential.

```json
{"status": 401, "body": {"error": {"type": "authentication_error", "message": "invalid api key"}}}
```

**Rate limiting.** `429`, often with a `Retry-After` header. Caused by volume growth, a retry storm, or a backfill you started and forgot. The fix is backoff and concurrency limits, not a bigger plan — a retry storm on a rate-limited endpoint makes itself worse.

```json
{"status": 429, "headers": {"retry-after": "30"}, "body": {"error": "rate_limit_exceeded"}}
```

**Schema drift.** The source changed its payload. Symptom: a field that used to have a value is null, or a step fails on a missing key. Diff a recent raw payload against an old one — this is why you stored raw payloads. Fix by updating the mapping and adding a front-door validation rule that fails loudly on the missing field rather than propagating a null.

**Timeout.** A step exceeded its limit. Look at the input size first; a document that grew from 4 to 400 pages will time out an extraction call that was fine for a year. Fix with chunking, batching, or moving the work to an asynchronous pattern — raising the timeout only moves the cliff.

**Malformed model output.** The parse step fails because the model returned prose around the JSON, a trailing comma, or a code fence. Fix at three levels: tighten the prompt ("return only the JSON object, no prose, no code fence"), strip fences and leading text before parsing, and retry once with the parse error appended. Then, if it still fails, quarantine with the raw output attached — never let a parse failure fall through to an empty object that downstream steps treat as valid.

```json
{"error": "Unexpected token 'H' at position 0", "raw": "Here is the JSON you requested:\n```json\n{\"category\": \"quote\"}\n```"}
```

**Downstream rejection.** Your workflow ran fine and the destination refused the write: validation error, required field, duplicate key, record locked. Read the destination's error, which is usually specific. A `422` naming a field is a gift.

**Silent wrong output.** The dangerous class, covered next.

## Catching silent failures

You cannot troubleshoot what you cannot see. Build three detectors, and build them before the incident.

**Output assertions.** After every consequential step, assert what must be true and fail the run when it is not. The category is in the allowed set. The total is greater than zero. The date is within the last five years. The extracted line items sum to the stated total. Assertions convert silent failures into loud ones, which is the entire trick. Each assertion costs a step and repays it the first time it fires.

**Reconciliation counts.** For every batch or day, log the funnel: received, validated, quarantined, enriched, routed, completed. Those numbers must balance, and the shape of the funnel should be stable. A step that suddenly passes 60% of what it used to pass is a bug even when every run is green. Chart the funnel weekly; the eye catches a shape change faster than any threshold.

**Sampling.** Have a human check a fixed share of successful runs — 2 to 5% — on a schedule. This is the only detector that catches "the output is well-formed, plausible, and wrong," and it is the reason the sampling requirement exists in the customer-service design. Track what the sample finds over time; a rising escape rate is an emergency even when the dashboard is green.

Add two more habits. **Alert on absence**: a workflow that normally runs 200 times a day and ran 3 today should notify someone, and no platform will tell you this unless you ask it to. And **alert on queue age**: the oldest item in a review queue exceeding its SLA is often the first visible symptom of an upstream break.

## Fixing at the right layer

The same symptom has fixes at different depths, and choosing badly is how workflows accumulate scar tissue.

Consider a run failing because `customer.email` is null. Four candidate fixes:

- *Add a null check and skip the record.* Fast, and it hides the problem. Now records vanish silently — you have converted a loud failure into a silent one, which is backwards.
- *Add a null check and quarantine the record.* Correct as a guard: the record is preserved, visible, and countable.
- *Fix the mapping* because the source moved the field. Correct if that is the actual cause.
- *Fix the upstream form* that stopped requiring email. Correct at the source, slowest, and the only one that stops the problem existing.

Usually you do the guard immediately and the root fix properly, in that order, and you write down that you did both. What you must not do is only the first and call it resolved.

Two more layer questions. **Retry or guard?** Retry transient errors only — `429`, `503`, timeouts, connection resets. Retrying a `400` is a loop with extra steps. **Patch or contract?** If a source keeps drifting, the fix is a conversation about a stable contract, not an ever-growing pile of defensive mappings.

## Replay and backfill

Once fixed, repair the damaged records. This is where lesson 03's idempotency stops being theoretical.

**Identify the affected set precisely** by time window and symptom — `status = failed AND last_error CONTAINS 'customer.email' AND received_at > '2026-03-14'`. Count them before you touch them, and write the count down.

**Replay in small batches**, ten records first. Verify those ten by hand. Then widen. A backfill that runs to completion before anyone checks it is a second incident.

**Rely on the natural key, not on hope.** If your dedupe works, replay is safe. If you are not certain it works, prove it on one record before running a thousand.

**Suppress outbound side effects during backfill.** A replay that re-sends three weeks of customer emails is the classic career-defining incident. Either check the stored outbound message ID before sending, or run the backfill with sending disabled and reconcile afterwards.

**Reconcile at the end.** Records repaired plus records still failed should equal the affected count you wrote down. If it does not, find the difference.

## The postmortem

Write it for every incident that affected output, even small ones. Six short sections, no blame:

```text
INCIDENT   quote-intake-classify, 2026-03-14 09:20 to 2026-03-15 11:05
IMPACT     412 quote requests classified as "other" and routed to triage_review.
           Median first response 5.4h -> 19h. No customer received a wrong answer.
CAUSE      Source form renamed request_type to request_category. Mapping resolved to
           null; the classifier received an empty field and fell back to "other".
DETECTION  Found by the ops lead noticing triage_review queue depth, 26h after onset.
           Funnel reconciliation would have caught it within one day; no alert existed.
FIX        (1) Mapping updated to the new field name. (2) Front-door validation now
           fails loudly on a missing request_type. (3) Alert added on triage_review
           share exceeding 25% of daily volume. (4) 412 records replayed, 412 repaired.
FOLLOW-UP  Ask the form owner for change notice. Add a raw-payload schema diff check
           to the weekly review. Both assigned, due 2026-03-29.
```

The `DETECTION` section is the one people skip and the one that improves the system. Twenty-six hours of detection lag is the actual defect; the field rename was just weather.

Then add a regression case. Take the payload that broke it, add it to your test set, and run it whenever you change the workflow. A test set assembled from real incidents is the most valuable artifact a mature automation has, because every case in it is a bug that actually happened.

## Practice

Work on a real automation — ideally your own from earlier lessons — and break it deliberately, then fix it under the method.

1. **Instrument first.** Add output assertions after your three most consequential steps, funnel reconciliation counts per batch, an alert on run-count absence, and an alert on review-queue age. You cannot do the rest of this exercise without them.
2. **Stage five failures**, one at a time, without looking at your own notes on how you staged them if you can arrange for a peer to do it: (a) rename a field in the source payload; (b) revoke or corrupt a credential; (c) make the model return prose around its JSON; (d) feed an input large enough to time out a step; (e) introduce a silent one — a filter condition that excludes a third of valid records while every run stays green.
3. **Diagnose each using the nine-step method**, writing down at each stage the scope, the exact failing payload, your single falsifiable hypothesis, and the smallest change you tested. The written trail is the deliverable; a correct fix with no trail does not count.
4. **Time the silent one.** Record how long it took your detectors to surface failure (e), from onset to notice. If your instrumentation never caught it, that is the finding, and adding the detector that would have caught it is the fix.
5. **Fix each at the right layer**, and for at least two of them implement both the immediate guard and the root cause fix. State explicitly, for each, which layer you chose and what you rejected.
6. **Replay and backfill** the records damaged by failure (a). Identify the set by query, count them first, replay ten and verify by hand, then complete. Prove no duplicate outbound side effect occurred.
7. **Write one postmortem** in the six-section format for the failure that surprised you most, with an honest detection-lag number and at least two assigned follow-ups.
8. **Build the regression set** from all five payloads and run it against your workflow. Confirm every one now fails safely or passes correctly, and add the set to your runbook.
