---
lesson_id: ai201-13
course_id: ai201
pathway: prompt-engineer
title: 'Project: Automate a Business Process End to End'
order: 13
kind: project
competency_ids:
  - D3-S1-C01
  - D3-S1-C02
  - D3-S1-C03
  - D3-S1-C04
  - D3-S1-C05
objectives:
  - Deliver an end-to-end automated business process with monitoring, escalation, and a rollback path
---

## Goal

Deliver one complete business process, automated end to end, and hand it over as something another person could operate without you.

The word that matters is *complete*. Not the happy path, not a demo that works on the file you prepared — a process that ingests real-shaped work at its real entry point, moves it through AI-assisted steps under a human review gate, lands the result in the system that actually holds it, tells you when it breaks, escalates what it should not handle, and can be turned off and reverted in under five minutes.

Deliberately choose a **narrow** process. This is a four-hour project because the pathway's real capstone comes later; you are proving one process works properly, not building a solution. A single request type from one queue, done thoroughly, beats three request types done partially. If your first sketch has more than about eight steps before the review gate, cut scope.

## Requirements

Your submission has two halves: a running workflow and a handover package. Both are graded; a working automation with no runbook is an unfinished project.

### 1. Process brief

A short version of the lesson 02 deliverable for the process you chose:

- The step inventory of the current manual process, with handling time, volume, and exception rate.
- The **baseline metrics**: annual labor hours, median and 90th-percentile cycle time, and a stated error rate with how you estimated it. You will be comparing against these later, so record the sample and the date.
- The **boundary contract**: entry condition, exit condition, out-of-scope list, human checkpoints, and the escape hatch for cases the workflow cannot handle.
- One paragraph naming which steps you automated and, for at least one step you deliberately left manual, why.

### 2. Architecture note

One page, written before you build:

- Trigger type and the reason for it, including any secondary sweeper trigger.
- The **natural key** you deduplicate on.
- The record schema, as a JSON block, including `case_id`, the natural key, `status`, `status_changed_at`, `attempt_count`, `last_error`, and the raw payload.
- The **status state machine**: every status, the legal transitions, and which one is the human review gate.
- Which system is authoritative for each field the workflow reads or writes, and your write pattern (read-only, dedicated field, or operational field).

### 3. The running workflow

It must contain all of the following, working:

- **Ingest** at a realistic entry point — a form, an inbox, a file drop, or an API pull — with the raw payload preserved.
- **Front-door validation** with a quarantine path. Invalid records are preserved, labeled with the rule they failed, and visible in a view, never dropped.
- **Deduplication** on the natural key, proven idempotent.
- **At least one AI step** producing strict, schema-bound JSON with a closed vocabulary and a confidence value, whose output is validated before use. Choose the application that fits your process: classification and routing, document extraction, document generation, or report narration.
- **Rule-based routing** expressed as a readable table, including a low-confidence row and a default row with an owner and an SLA.
- **A human review gate** implemented as a real status with a queue, an owner, and an age you can measure. Nothing customer-facing leaves the workflow without a person approving it, and your submission must demonstrate that no path bypasses it.
- **An escalation path** with a warm handoff payload containing the escalation reason, what the automation already did, and what the customer or requester has already been told.
- **Outbound idempotency**: a stored external ID checked before any side effect, so a replayed run cannot act twice.
- **A dead-letter path**: exhausted retries land in a `failed` status that a person sees.

### 4. Monitoring

Three detectors, all working, all tested by triggering them:

- **Failure alerting.** A failed run notifies a named recipient with enough context to start diagnosing.
- **Absence alerting.** A drop in run volume against the normal daily count notifies someone. A workflow that stops running is the failure no error message will report.
- **Silent-failure detection.** At least one of: output assertions after your consequential steps, a funnel reconciliation count per batch that must balance, or a scheduled human sample of successful runs. State which you chose and what it would catch.

Plus a queue-age check: the oldest item in the review queue past its SLA raises a notification.

### 5. Runbook and rollback

The one-page runbook from lesson 10, with every section filled: purpose, owners, schedule, dependencies, what normal looks like, monitoring, common issues, manual fallback, kill switch, rollback, change log.

Two of those must be **tested, not described**:

- **The kill switch** — a flag the workflow checks at its first step, flippable by someone other than you, in under two minutes, without editing the workflow. Demonstrate it, and state what happens to work already in flight.
- **The manual fallback** — the process run by hand, from the runbook, by someone who did not build it, for at least two cases.

The **rollback path** must state what reverts and how: which written fields are undone or ignored, what happens to records created during the automated period, and how the team returns to the previous way of working. If your write pattern is dedicated fields, rollback is cheap and you should say so; if you write to operational fields, spell out the repair.

### 6. Evidence of operation

Run it on at least **25 real or realistic cases**, including deliberately awkward ones, and submit:

- The run log or execution history for the batch.
- Reconciliation counts: received, validated, quarantined, duplicate, routed, reviewed, completed, failed — balancing.
- A before-and-after comparison against your baseline on cycle time, with the sample size for each.
- One incident you hit while building, written as a five-section postmortem: incident, impact, cause, detection, fix, follow-up. You will hit one. If you genuinely did not, stage one and diagnose it under the method.

## Constraints

- **Human-in-the-loop is not negotiable.** Every message, document, or decision that reaches a customer, a vendor, or anyone outside your team passes a human review gate first. Design it as a status with a queue, not as a habit.
- **The model never does arithmetic and never invents facts.** All computation happens in the workflow. All facts in generated text come from data you supplied in that run. Where a fact is missing, the output carries a visible placeholder or the case escalates.
- **No AI step without validated, schema-bound output.** Free-text output consumed directly by a later step is a defect.
- **No silent drops.** Every record ends in a terminal status somebody can see and count. If your reconciliation does not balance, the project is not finished.
- **Stay inside the course's scope.** No agentic multi-step planners, no screen-scraping or desktop RPA, no telephony or voice channels. Continue on the tools you already know from ai102 rather than adopting a new platform for this project.
- **Use real or realistic data, safely.** Redact personal data before it enters a workflow you built for a course, and do not connect a course project to a production system that moves money or contacts customers without explicit permission from whoever owns it.
- **Four hours is the budget.** Scope to fit. A narrow process fully instrumented is the assignment; a broad process with no monitoring is a fail regardless of how impressive the diagram looks.

## Definition of done

Work through this as a checklist. Every line must be demonstrable, not asserted.

**Correctness**

- Running the same trigger payload five times produces exactly one case, four early exits, and no duplicate side effect.
- A record manually set to a rejected or terminal status is not advanced by a replayed run.
- Every one of the 25 cases ends in a terminal status, and the reconciliation counts balance.
- The AI step's output is validated against its schema, and a deliberately malformed response is quarantined with the raw output attached rather than passed downstream.

**Safety**

- No path in the workflow can send anything externally without a `status = approved` transition performed by a person. You can point at the gate in the workflow and explain why there is no way around it.
- Low-confidence and rule-check-failed cases escalate rather than proceeding.
- The escalation payload contains the reason, the automation's actions so far, and what the requester was already told.
- Quarantined and failed records are visible in a view with the failing rule named.

**Operability**

- Failure, absence, and queue-age alerts have each been triggered on purpose and observed arriving.
- Your silent-failure detector has been tested by introducing a silent fault and confirming it surfaced. Report the detection lag.
- The kill switch has been thrown by someone other than you, from the runbook, in under two minutes.
- The manual fallback has been executed by someone other than you for two cases, and every question they had to ask you has been folded back into the runbook.

**Evidence**

- Baseline and post-automation cycle time reported with sample sizes, honestly, including the case where the number did not improve.
- One postmortem written, with a real detection-lag figure and at least two assigned follow-ups.
- The handover package is complete: process brief, architecture note, runbook, routing table, prompts with their validation rules, and the run evidence.

## Suggested process candidates

If you do not have a process in hand, these are narrow enough to finish and rich enough to exercise every requirement. Each one has a natural entry point, a defensible AI step, and an obvious review gate.

- **Inbound quote or enquiry triage.** A shared inbox or form; classify, extract the entities, route to a queue, draft an acknowledgement for review. Exercises classification, routing, and the review gate most directly.
- **Supplier invoice intake.** Attachment capture, extraction into structured fields, arithmetic and duplicate-invoice validation, confidence routing into a light or full review queue, then a write into a tracking record. Strong on extraction and validation.
- **Weekly operations report.** Scheduled assembly of computed figures, a constrained narrative step, threshold evaluation, and delivery — with review before anything goes outside the team. Lightest build, so raise the bar on monitoring and metric definitions.
- **Internal request desk.** IT, facilities, or HR requests: classify, check preconditions with rules, draft a response, escalate anything outside the allowed-action list. The safest place to practise escalation design because the requesters are colleagues.
- **New-client onboarding packet.** Structured intake data generates a document set with conditional clauses and one AI-written section, routed to an approver by value. Strong on generation and the approval tiering.

Avoid, for a four-hour project: anything that moves money without a second control, anything touching regulated records you are not authorized to process, and anything whose input arrives in a format you have not yet seen a sample of.

## A workable four-hour shape

The most common way this project overruns is spending three hours on the build and running out of time for the monitoring and handover, which are half the grade. A defensible split:

1. **Roughly 45 minutes — decide and design.** Process choice, brief, boundary contract, architecture note, status state machine. Written before anything is built.
2. **Roughly 90 minutes — build the spine.** Ingest, validation with quarantine, dedupe, the record and its statuses, the AI step with output validation, routing, the review gate. Get one case through end to end before adding anything.
3. **Roughly 45 minutes — make it operable.** Escalation path, dead-letter path, the three alerts, the silent-failure detector, the kill switch. Trigger each one on purpose.
4. **Roughly 30 minutes — run and measure.** The 25-case batch, the reconciliation counts, the before-and-after comparison.
5. **Roughly 30 minutes — hand over.** Runbook, rollback path, postmortem, package assembly. Then hand the runbook to someone else and watch them try to use it.

If you are behind at the end of step 2, cut scope from the process rather than from steps 3 to 5. A single request type with full monitoring is a pass; three request types with no alerts is not.

## Hints

**Choose the process on evidence, not on interest.** Look for high volume, low judgement, structured-enough input, and a cheap, visible failure mode. An internal process is a far better first project than a customer-facing one — the review gate is easier to staff and a mistake costs an apology rather than a customer.

**Build the state machine before the steps.** Almost every hard problem you will hit in this project — duplicates, replays, stuck cases, the review gate — is easier if the record has a proper status from the first hour. Retrofitting it is miserable, and you will run out of your four hours doing it.

**Write the reconciliation counts on day one.** They are ten minutes of work and they will find the bug you would otherwise ship. When the numbers stop balancing, you have a defect, and you have it early.

**Make the ugly cases first-class.** Collect your awkward inputs before you build: the empty field, the duplicate, the forwarded message, the scanned document, the record that arrives twice from two channels. Building against clean input and adding the mess later means rebuilding.

**Give the reviewer a good screen.** The review gate is only a safety control if the reviewer can actually judge. Show the source beside the output, highlight the AI-generated portion, surface the confidence and the failed checks at the top, and offer reject and escalate — not just approve. A reviewer with only an approve button is a rubber stamp with a job title.

**Capture reviewer edits.** They are your best signal about a bad prompt, and reading ten of them will teach you more than another hour of prompt tuning.

**Test the kill switch before you need it.** Throw it on day one, while nothing depends on it. A kill switch first exercised during an incident is a kill switch you are debugging during an incident.

**Prefer boring determinism.** Every place you can replace an AI step with a rule, do it. Rules are faster, cheaper, auditable, and they do not drift. Save the model for the steps that genuinely require reading unstructured text.

**Do not hide the disappointing number.** If cycle time did not improve, or the classifier is 82% and you hoped for 95%, report it plainly with the reason. The credibility of every other number you present depends on that one, and a project that honestly documents a shortfall is more useful to the business than one that quietly omits it.
