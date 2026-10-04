---
course_id: ai201
media_id: ai201-v01
type: video-script
title: "Five Deliveries, One Case: Dedupe and the Status Gate"
format: screencast
target_runtime: "7 min"
related_lessons:
  - ai201-03
  - ai201-11
objectives:
  - Design a workflow's triggers, actions, and state so it runs correctly across systems and repeated executions
competency_ids:
  - D3-S1-C01
---

## Purpose

After watching, the learner can make an intake workflow idempotent with a natural-key check and a status gate, and can prove it by replaying the same payload five times.

## Audience and prerequisites

Apprentices who have finished ai102 and lesson ai201-03 up to "Idempotency and dedupe". They can already build a trigger-plus-actions scenario on their platform. The demo is deliberately platform-neutral: it uses a record table (shown as an Airtable-style grid) and a generic scenario canvas. The editor should film it on whichever platform the cohort used in ai102 and keep the narration as written. Narration refers to "the record table" and "the scenario", not to vendor menu names.

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Cold open. Record table with five identical rows for `sub_20260311_0142`, all `status: received`. A customer email preview shows the same quote acknowledgement five times. | "This is what at-least-once delivery looks like when nobody designed for it. One form submission from Dana Reyes at Northwind Freight, five rows, five acknowledgement emails. The platform did nothing wrong. We did." |
| 0:20 | Title card: "Five Deliveries, One Case". | "In the next seven minutes we'll make that impossible, and then we'll prove it." |
| 0:28 | The trigger payload from lesson 03 on screen, with `event_id` and `submission_id` highlighted in different outline styles (solid box and dashed box). | "Start with the payload. Two IDs. `event_id` identifies the delivery. `submission_id` identifies the thing that happened. If the sender retries, you get a new delivery of the same submission. Those two deliveries are a duplicate, and we ignore the second one. If Dana submits the form twice, that's two submissions, which means two real cases. So the natural key is `submission_id`, not `event_id`." |
| 1:05 | Record table schema view. Cursor adds fields: `source_submission_id` (text), `status` (single select), `status_changed_at`, `attempt_count`, `last_error`, `raw_payload`. | "Before any steps, the record. Business fields plus the six architecture fields from the lesson. The one doing the work today is `source_submission_id`. If your platform supports a unique constraint on a field, turn it on here. Most no-code tables don't, so we'll enforce it in the workflow and plan for the occasional race." |
| 1:40 | Scenario canvas. Step 1: trigger. Step 2: validation filter. | "Step one is the trigger. Step two is front-door validation: email present, request type in the allowed list. If it fails, the record goes to quarantine with the raw payload. We covered that in lesson 03, so I'll skip past it." |
| 2:00 | Step 3 added: "Search records where `source_submission_id` = `{{data.submission_id}}`". | "Step three is the dedupe check. Search the record table for the natural key. This has to come before anything that writes or sends." |
| 2:15 | Router with two branches labeled "Found" and "Not found". | "Two branches. Not found means this is new: create the record with `status: received`, the raw payload, and `attempt_count` of one, then carry on. Found means we've seen it before. A beginner exits here, and that's almost right." |
| 2:40 | "Found" branch expands into: read `status`; if `received` or `validated`, resume; otherwise exit with log note "duplicate delivery, status = X". | "Almost right, because a duplicate might arrive while the first run is half done, or after it died. So the found branch reads the record's status. If the record stopped early, resume from that status. If it's already further along, exit quietly and write a log line saying why. Resume or exit. Never start over." |
| 3:10 | Send step appears at the end of the flow. Gate step before it: "Re-read record. Continue only if `status = approved` and `sent_message_id` is empty." | "Now the side effect. The acknowledgement email in our cold open. Two checks go in front of it, and both read the record fresh rather than trusting what we read eight steps ago. First, the status must be exactly the one this step expects. Second, `sent_message_id` must be empty. After the send succeeds, write the message ID back immediately." |
| 3:45 | Split screen: two runs side by side reading the same record, both seeing `approved`. | "Here's the case the gate is for. Two runs reach the send step at the same moment. Both read `approved`. To stop both sending, the first one to act moves the status to `sending`, and the send only happens if that move succeeded. On platforms without atomic updates you can't close this race completely. Lesson 03 asks you to name it and add a nightly sweep, and that's what we do." |
| 4:20 | Replay tool or "run with same data" five times in a row. Execution history fills with five runs. | "Now the proof. Same payload, five times. Watch the execution history." |
| 4:40 | Execution history: run 1 green through all steps; runs 2 to 5 green but ending at step 3 with the note "duplicate delivery". Record table: one row. Sent folder: one email. | "Run one does all the work. Runs two to five stop at the dedupe step and log why. One record. `attempt_count` is still one, because a duplicate delivery isn't a retry. One email. Screenshot this execution history. It's your evidence for practice step 4." |
| 5:10 | Record table: cursor manually sets the record's status to `rejected`. | "Second proof: the status gate. I'll set this record to `rejected` by hand, like a reviewer would." |
| 5:20 | Replay a payload that would normally advance the record to `approved`. Execution shows the run exiting at the gate with "expected awaiting_review, found rejected". | "Then replay a run that would normally advance it to approved. It reads the status, sees rejected, and exits without changing anything. A rejected case stays rejected. If your run overwrote it, the gate is checking the wrong thing or reading a stale value." |
| 5:50 | Lesson 11 tie-in: a query on screen, `status = failed AND received_at > '2026-03-14'`, returning 37 rows. | "This pays off again in lesson 11. When you fix a bug and have to replay 37 failed records, these same checks are why the replay is safe. Without them, a backfill re-sends three weeks of email." |
| 6:15 | Checklist overlay: natural key chosen; dedupe before writes; resume-or-exit; gate re-reads status; external ID stored; five-replay proof. | "Recap. Pick the key that identifies the thing, not the delivery. Check it before you write anything. On a duplicate, resume or exit, and never start over. Gate every side effect on a fresh read of status and stored external ID. Then prove it with five replays." |
| 6:45 | End card: "Practice: lesson ai201-03, steps 4 and 5". | "Your turn. Lesson 03, practice steps 4 and 5. Bring the execution history." |

## On-screen assets and B-roll

- Lesson 03 trigger payload JSON and record JSON, typeset for screen (large monospace, 20pt minimum).
- A record table pre-seeded with the five-duplicate "before" state for the cold open, plus a clean copy for the build.
- A mock email client sent folder showing five, then one, acknowledgement.
- Two-run race split-screen, which can be a simple motion graphic rather than a live capture.
- Checklist overlay for the recap.

## Accessibility

- Burned-in captions plus a separate caption file. Read every code token aloud the first time it appears (for example, "source underscore submission underscore ID").
- `event_id` and `submission_id` are told apart by outline style (solid and dashed) and by label, not by color alone.
- Describe execution-history results in narration ("runs two to five stop at step three"), so the outcome does not depend on seeing green and red icons.
- Zoom to at least 150% on the canvas and table. Keep the cursor visible, and pause for two seconds on each new step.
- Provide a transcript with the scenario steps as a numbered list.

## Check for understanding

1. A sender retries a webhook and you receive two deliveries with different `event_id`s and the same `submission_id`. How many records should exist? **Answer:** One. The natural key is the submission, and the second delivery is a duplicate.
2. A duplicate arrives and the existing record is at `received` because the first run died after creating it. What should the duplicate run do? **Answer:** Resume from `received`. It should not exit and it should not start over, because the record holds the state.
3. Why does the send step re-read the record instead of using the status read at step 3? **Answer:** Another run or a reviewer may have changed it since then. Acting on a stale read is how two runs both send, or how a rejected case gets sent.
