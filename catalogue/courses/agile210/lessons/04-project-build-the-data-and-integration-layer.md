---
lesson_id: agile210-04
course_id: agile210
pathway: prompt-engineer
title: "Project: Build the Data and Integration Layer"
order: 4
kind: project
competency_ids:
  - D5-S1-C01
  - D5-S1-C02
  - D2-S1-C03
objectives:
  - Build the capstone's data and integration layer, connecting the sources and
    stores the solution depends on
---

## Goal

This is stage 3 of 7 of your capstone. Same build, next pass; this pass produces the layer everything else sits on.

Build the **data and integration layer**: the parts of your capstone that get real data in, hold it in a store you control, move it between the tools your design named, and get results back out. At the end of this stage, real input flows from its real source into your store, gets validated on the way in, and leaves through your integrations — with **no AI step involved yet**. Where the AI workflow will go, you put a stub.

That constraint is the whole point of putting this stage before stage 05. An AI step with no real input can only be demonstrated on fixtures, and a capstone demonstrated on fixtures is not a capstone. By the end of this stage you will know what your data actually looks like — including the third of records that are missing a field you assumed was always present — and stage 05 gets to build a prompt against reality rather than against your hopes.

## What you inherit from stage 03

- **The component map** names every source, store, integration point, and trigger. Build exactly those. If the map has a component you now think is unnecessary, say so at the checkpoint rather than silently dropping it.
- **The component table's "reads" and "writes" columns** are your first draft of the schema.
- **The requirement trace** tells you which criteria this layer owns. Typically the speed and coverage criteria live here.
- **The prototype finding** may already have told you something painful about the data. Act on it.
- **Section 6 of the brief** listed the access you need. Anything still unconfirmed is now blocking, not pending.

## Requirements

Six deliverables, in build order. Get one record through end to end before you make any part of it good.

### 1. Source inventory

Before you connect anything, write down what you are connecting to. One row per source:

| Source | Structured or unstructured | Access method | Auth | Volume | Refresh | Owner |
| --- | --- | --- | --- | --- | --- | --- |
| Accounts inbox | Unstructured (email bodies, PDF attachments) | Platform connector | OAuth, my account | ~40/week | Continuous | Office manager |
| Supplier list | Structured | No-code database table | API key | 34 rows | Manual, monthly | Me |
| Currency rates | Structured | REST API, GET /latest | API key in header | 1 call/run | Daily | Third party |

Then, for each source, attach a **real sample**: at least ten actual records or documents, with personal data redacted, saved where you can re-run against them. These samples are the raw material for every later stage, and stage 07 will test against them.

For each **unstructured** source, add a short note on the shape of the mess: what varies between examples, what is sometimes missing, what encodings or formats show up. Do this by reading twenty examples, not by assuming.

### 2. The data model

Design and create the store your capstone owns. It can be a relational database, a no-code database, a document store, or a spreadsheet-style table — whichever your design named and whichever fits the data. What matters is that it is a real store with a real schema, not values passed between automation steps and then forgotten.

Your schema must include, at minimum:

```json
{
  "record_id": "internally generated, unique, never reused",
  "natural_key": "the value that identifies this thing in the outside world",
  "source": "which source this came from",
  "received_at": "timestamp of arrival",
  "raw_payload": "the original input, preserved verbatim",
  "status": "where this record is in the process",
  "status_changed_at": "timestamp of the last transition",
  "validation_result": "pass, or the rule that failed",
  "attempt_count": "how many times processing has been tried",
  "last_error": "the most recent failure message, or null"
}
```

Plus your domain fields — the things this record actually is. Write a short data dictionary: field name, type, whether it is required, allowed values where the vocabulary is closed, and where the value comes from.

Two decisions to make explicitly and record:

- **The natural key.** What makes two arrivals the same thing? Supplier plus invoice number; email message id; form submission id plus timestamp. Pick one, write it down, and enforce it.
- **The status vocabulary.** List every status, and which transitions are legal. Include at least a received state, a validated state, a quarantined state for input that failed validation, a state for waiting on the AI step, a state for human review, a terminal success state, and a terminal failed state. Stage 05 will hang the AI workflow off these states, and stage 07 will count records in each of them.

Reserve one field or state for the AI results now, even though nothing fills it yet. Retrofitting it in stage 05 costs more than reserving it today.

### 3. Ingestion, with validation and quarantine

Wire the real trigger from your design to the real store.

- **Preserve the raw payload** before you touch it. Every downstream defect you will chase in stage 07 is easier to diagnose when the original input is still there.
- **Validate at the front door.** Required fields present, types correct, values inside their allowed vocabulary, dates parseable, numbers actually numeric. Every rule you check should be written down as a rule, not implied by a step that happens to fail.
- **Quarantine, do not drop.** Input that fails validation is stored anyway, marked with the exact rule it failed, and visible in a view somebody could work through. Silent drops are the defect you cannot see, and they will invalidate every count you report later.
- **Deduplicate on the natural key.** Re-running the same input must not create a second record. Prove it by running the same payload five times.
- **Normalise on the way in.** Trim whitespace, standardise casing on keys, parse dates into one format, convert currency and units to one representation. Normalisation belongs at the boundary; doing it later means doing it in six places.

### 4. Integrations: APIs and webhooks

Build every integration point the component map showed. At least one of them must be a genuine cross-tool integration you configured yourself rather than a one-click connector — a REST call you constructed, or a webhook you receive and parse.

For each integration, deliver:

- **A written contract**: endpoint or webhook URL, method, auth method, the request shape, the response shape, and the fields you actually use.
- **Credential handling that is not a pasted secret.** Keys live in the platform's credential store or environment configuration, never in a step's visible parameters, never in a spreadsheet cell, never in your submitted document. Redact them in every screenshot.
- **Error handling per call.** What happens on a 4xx (usually: your request is wrong, do not retry blindly), on a 5xx or a timeout (retry with a delay, bounded attempts), and on a rate limit (back off and respect the retry hint). Record the failure in `last_error` and increment `attempt_count`.
- **Bounded retries and a dead-letter state.** After the last attempt, the record lands in a failed state a person can see. A record that retries forever is a record nobody ever looks at.
- **Outbound idempotency.** Before any call that causes a side effect — creating a row, sending a message, writing to a client system — check whether you have already done it for this record, using a stored external id. A replay must not act twice.

If you receive a webhook, also handle: an unexpected payload shape, a duplicate delivery, and an out-of-order delivery. Webhook senders retry, and they do not promise order.

### 5. The AI stub

Where stage 05's AI workflow will go, put a deterministic placeholder: a step that writes a fixed or trivially derived result into the reserved field and moves the record to the next status. The stub exists so the whole pipeline can run end to end today, and so stage 05 is a swap rather than a re-plumb.

Keep the stub's output in **exactly the shape** the real step will produce — same field names, same types, same closed vocabulary, a confidence value in the same place. If you cannot write down that shape yet, that is stage 05's first job, but the schema decision belongs here.

### 6. Evidence run

Run at least **25 real records** through the layer, deliberately including bad ones: a missing required field, a duplicate, an oversized or empty payload, one that trips your integration's error path.

Produce a reconciliation count:

```text
received            25
validated           21
quarantined          4   (3 missing supplier ref, 1 unparseable date)
duplicates skipped   3
integration failures 2   (1 timeout, retried and succeeded; 1 permanent 404)
in terminal state   25
```

Read those counts as a funnel, not a list. Of the 25 received, 4 were quarantined at validation; of the 21 that validated, 3 were duplicates of records already held. That leaves 18 unique records, which went through enrichment and output, and one of them hit a permanent 404 and landed in the failed state. So the 25 terminal states are 17 completed, 1 failed, 4 quarantined, and 3 duplicate-skipped — and 17 + 1 + 4 + 3 = 25.

The numbers must balance: everything received ends somewhere countable. If they do not balance, you have a silent drop, and finding it is part of the work.

## Choosing where the record lives

Your stage-03 design named a store. Before you build it, sanity-check the choice against what this capstone actually needs, because changing it later is the most expensive re-work available in the remaining stages.

| If your data is… | And you need… | A reasonable choice |
| --- | --- | --- |
| Uniform records with a fixed field set | Counts, joins to a reference table, constraints enforced by the store | A relational table |
| Records whose shape varies by source or type | Flexibility, nested payloads, few joins | A document-style store |
| Modest volume, humans working the queue directly | A usable interface for review out of the box | A no-code database table |
| High volume, mostly append, rarely re-read | Cheap writes | Whatever your platform makes cheapest, with an index on the natural key |

Three properties matter more than the category:

- **Can the store enforce uniqueness on your natural key?** If it can, your deduplication is guaranteed rather than hopeful. If it cannot, you must enforce it in the workflow and you must test the race where two records arrive together.
- **Can a human look at it and work a queue?** Stage 05's review gate and stage 07's reconciliation both need a view a person can filter and sort. A store nobody can look into makes both stages harder than they need to be.
- **Can you index the identifier you will be asked about?** In stage 06 you will need to find every record concerning one individual. If that requires a full scan of unstructured payloads, the privacy procedure becomes impossible to honour.

Whatever you choose, keep the raw payload separable from the parsed fields. It is the largest and most sensitive thing you hold, and stage 06 will very likely ask you to shorten its retention independently of everything else.

## Reading unstructured sources properly

Structured sources are mostly a wiring exercise. Unstructured sources — emails, documents, notes, transcripts, form free-text — are where the real variance lives, and this is the stage where you find it rather than the stage where you discover it during a demo.

Work through this for each unstructured source:

**Get the text out deterministically first.** Whatever your platform's extraction step is for the format you are handling — text from a document, body from a message, fields from an attachment — run it on twenty real examples and look at the output, not at the success indicator. Documents that "extracted successfully" and produced two lines of garbled text are the ones that will look like a model failure in stage 05 when they are actually an input failure here.

**Catalogue the variance.** For each example, note: which sections are present, what order they appear in, what is missing, what is duplicated. Twenty examples is usually enough to see the three or four shapes your source actually produces.

**Find the boilerplate.** Signatures, disclaimers, quoted reply chains, headers, footers, page furniture. Strip it deterministically at ingest. This is one of the highest-value things you can do for stage 05: a prompt that receives four paragraphs of legal disclaimer before the content will spend attention on the disclaimer, and you will pay for those tokens on every record.

**Record what is unreadable.** Some inputs genuinely cannot be handled: photographs of documents, encrypted attachments, formats your tooling does not read. Count them as a proportion of your sample. If it is 2%, route them to the escape hatch and move on. If it is 30%, that is a brief-level finding and it goes to your instructor at the checkpoint.

**Keep the extracted text on the record.** Not just the original. When stage 07 asks why record 14 was wrong, the answer is usually visible in the text the model actually received.

## A worked ingestion trace

It is worth walking one record through the layer in your head — and then in reality — before you build the whole thing. A typical trace, with the decision at each point:

1. **Arrival.** The trigger fires. The very first action is to write a record with the raw payload, the source, and `received_at`, in status `received`. Nothing is parsed yet. If everything downstream fails, you still have the input.
2. **Normalisation.** Trim, case-standardise keys, parse dates to one format, convert units. Store the normalised fields alongside the raw payload, never over it.
3. **Validation.** Run the named rules. On failure, status becomes `quarantined`, `validation_result` names the rule, and the record stops. It is now visible in the quarantine view, and it is counted.
4. **Deduplication.** Compute the natural key and check. If a record with that key already exists, this one becomes `duplicate_skipped` — recorded, not deleted, because "how many duplicates arrive?" is a question your client will ask.
5. **Enrichment.** Any integration call that adds context: a supplier lookup, a rate, a customer record. Each with its own error path, bounded retries, and `last_error` written on failure.
6. **Hand-off to the AI step.** Status becomes `awaiting_ai`. In this stage, the stub picks it up, writes a placeholder into the reserved field with a placeholder confidence, and advances the status.
7. **Output.** The integration that writes the result, guarded by the stored external id so a replay cannot write twice. Status becomes terminal.

Every arrow in that list is a status transition you can count, and every terminal state is a row in your reconciliation. That is the whole reason for building the layer this way.

## Common data-layer failures

**The happy-path connector.** It works on the message you sent yourself and fails on the first real one, because real messages have attachments, reply chains, and encodings yours did not.

**State living in the workflow.** Values passed step to step, nothing persisted. It appears to work until a run fails halfway and there is no way to resume, no way to count, and nothing to show for the records that vanished.

**Deduplication by "it hasn't happened yet".** No natural key, no constraint. Then the source re-sends a batch overnight and the client's tracking sheet has every invoice twice.

**Retry without idempotency.** The retry succeeds, and so did the original call that timed out on the response rather than the request. Two side effects, one record.

**Validation that throws instead of quarantining.** An invalid record errors the run, the run is marked failed, and the record is nowhere — not processed, not quarantined, not counted.

**Secrets in plain sight.** A key pasted into a step's parameters because it was quicker, then screenshotted into the write-up. This is a stage-06 failure that is free to avoid today.

## Constraints

- **No AI step in this stage.** Prompting, chaining, and model calls are stage 05. A stub stands in. Building the model call early is the most common way this stage overruns and the surest way to end up with a prompt tuned to fixtures.
- **No new tools.** Use the data sources, database, and integration techniques from db305 and ai102. If your design needs a platform you have never used, redesign rather than learn a new tool inside a forty-hour build.
- **Real sources, real records.** Test fixtures are for automated tests, not for proving a data layer works. If a source genuinely cannot be connected, connect to a realistic stand-in you did not author yourself and say so plainly at the checkpoint.
- **Personal data gets redacted or minimised now.** Do not pull fields you do not need. Redact names, contact details, and identifiers in samples and screenshots. Stage 06 audits this properly, but you do not get to import a pile of personal data today and think about it later.
- **Credentials never appear in the artefact.** Not in screenshots, not in exported configuration, not in the write-up. One visible key is a failed stage regardless of everything else.
- **No writes into a client's live system.** Read from real sources where you have permission; write into stores you own. If the design ends with a write into the client's system, demonstrate it against a copy or a sandbox record and document the intended production write.
- **No silent drops, anywhere.** Every record ends in a state you can count.
- **Seven hours.** A defensible split: one hour on the inventory and samples, one and a half on the data model, two on ingestion and validation, two on integrations, half an hour on the stub, and the rest on the evidence run. If you overrun, cut a source rather than cutting validation.

## Definition of done

**Sources**

- Every source in the component map is inventoried with access method, auth, volume, refresh, and owner.
- At least ten real, redacted samples are saved per source.
- Each unstructured source has a written note on what varies and what is missing, based on reading at least twenty examples.

**Store**

- The store exists, with the schema fields listed above plus the domain fields.
- A data dictionary names every field's type, requiredness, allowed values, and origin.
- The natural key is stated and enforced.
- The status vocabulary is documented with its legal transitions, and every status is reachable.
- A field or state is reserved for the AI result, with its shape defined.

**Ingestion**

- The real trigger fires from the real source into the store.
- The raw payload is preserved verbatim on every record.
- Validation rules are written down, and each quarantined record names the rule it failed.
- Quarantined records are visible in a view, not just in a log.
- The same payload submitted five times produces one record and four skips.
- Normalisation happens at the boundary and is documented.

**Integrations**

- Every integration point in the map is built and working.
- At least one is a REST call or webhook you configured yourself, with a written contract.
- Credentials are stored in a credential store and appear nowhere in the artefact.
- 4xx, 5xx or timeout, and rate-limit paths are each implemented and each has been triggered on purpose at least once.
- Retries are bounded and exhausted records land in a visible failed state.
- Outbound idempotency is proven: a deliberate replay causes no second side effect.
- Webhook receivers handle an unexpected shape, a duplicate delivery, and an out-of-order delivery.

**End to end**

- The stub is in place and the pipeline runs from real trigger to terminal state without manual intervention.
- 25 real records have been run, including at least four deliberately bad ones.
- Reconciliation counts balance and are submitted.
- Every requirement this layer owns in the stage-03 trace table has evidence attached, or an explicit note of what is still missing and when it lands.

## Rubric

| Criterion | Not yet | Meets | Strong |
| --- | --- | --- | --- |
| Source handling | Connected to one clean source; samples invented | All mapped sources connected with real samples and a written note on the mess | Data shape findings changed the schema or the validation rules, visibly |
| Data model | Fields passed between steps, no real store, no status | Store with full schema, data dictionary, natural key, documented statuses | Status model is genuinely minimal and every state is justified |
| Validation and quarantine | Bad input errors the run or disappears | Written rules, quarantine with named failing rule, visible queue | Rules derived from real observed defects, with counts |
| Integrations | One-click connector only, secrets visible | Self-configured call or webhook, contract, credential store, full error paths | Idempotency and retry behaviour demonstrated under deliberate failure |
| Evidence | A screenshot of one successful run | 25 real records, four bad ones, balancing reconciliation | Counts used to find and fix a real defect, documented |

## Hints

**Get one record through before you improve anything.** The single most reliable way to lose this stage is to perfect the validation rules on a pipeline that has never once run end to end. Ugly and complete beats elegant and half-connected.

**Read twenty real inputs with your own eyes.** Not five. Twenty is roughly where the "oh, some of them do *that*" cases start appearing, and every one you find now is an hour you do not lose in stage 07.

**Decide the natural key early and enforce it in the store, not in the workflow.** A uniqueness constraint the store enforces cannot be bypassed by a workflow branch you forgot about.

**Put the status field in on day one.** Almost every hard problem in the remaining stages — replays, stuck records, the review queue, the reconciliation counts, the monitoring in stage 07 — is easy if records have a proper status and miserable if they do not.

**Preserve the raw payload even when it feels wasteful.** When something goes wrong in stage 07, the difference between five minutes and two hours of diagnosis is whether you can see what actually arrived.

**Treat validation rules as a written artefact.** A list of rules with names lets you say "this record failed `supplier_ref_present`" instead of "it errored". Stage 06 and stage 07 both consume that vocabulary.

**Break each integration on purpose today.** Point it at a wrong URL, revoke the key for a minute, send a malformed payload. Watching your error path run while you are calm is worth more than reading it. You will need these deliberate failures again in stage 07.

**Respect the rate limit before you hit it.** Look up the limit for each API you call, and make sure your retry backs off rather than hammering. A locked-out key at hour thirty is an expensive lesson.

**Keep the stub honest.** A stub that returns a perfect answer every time will hide the branches your real AI step needs — the low-confidence path, the malformed-output path. Have the stub occasionally return a low-confidence result so those branches exist before stage 05 needs them.

**Write the reconciliation query early.** It takes ten minutes and it finds the bug you would otherwise demonstrate to your instructor.

**Redact as you collect.** Redacting a sample set retrospectively is tedious and error-prone. Do it at collection time and you will not be doing it under deadline in stage 06.

## Checkpoint questions

Bring the running pipeline, not slides. Expect to be asked to do things, not to describe them.

- Submit the same input twice while I watch. What happened, and where can I see the skipped one?
- Show me a quarantined record and tell me which rule it failed.
- Show me what happens when I take the credential away.
- What is the largest and the weirdest real input you have run through this?
- What fraction of your real samples are unhandleable, and where do they go?
- If I asked you to delete everything about one person, what would you do?
- Where is your stub, and what shape does it write?
- Do your counts balance? Show me.

The last question is the one that most often exposes a silent drop. If the numbers do not balance yet, say so and bring the discrepancy — a known unexplained gap is a legitimate checkpoint outcome; an unnoticed one is not.

## Hand in

1. The source inventory table, plus the redacted real sample sets.
2. The data-shape note for each unstructured source.
3. The schema and data dictionary, with the natural key and status model and its legal transitions.
4. The validation rule list, with names.
5. The integration contracts, one per integration point, with error and retry behaviour described. No credentials.
6. Screenshots or an export of the working pipeline, credentials redacted.
7. Evidence of the deduplication test (same payload five times) and the idempotency test (deliberate replay).
8. Evidence of each error path being triggered on purpose.
9. The 25-record run: record list, terminal states, and the balancing reconciliation counts.
10. A short note of anything found in the real data that changes the design or the brief, and what you propose to do about it.

## Check your understanding

1. Why write the record with its raw payload before parsing anything? *So that if every later step fails, the original input still exists to diagnose and reprocess.*
2. The same invoice arrives five times. What should your store contain? *One processed record and four records in a duplicate-skipped state, enforced by a uniqueness rule on the natural key.*
3. Your reconciliation shows 25 received and 24 in terminal states. What does that mean? *A silent drop or a stuck record exists; finding it is part of the stage's work.*
