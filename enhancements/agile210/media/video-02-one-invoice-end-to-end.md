---
course_id: agile210
media_id: agile210-v02
type: video-script
title: "One Invoice, End to End: Following a Record Through Every Status"
format: screencast
target_runtime: "8 min"
related_lessons:
  - agile210-04
  - agile210-05
objectives:
  - Build the capstone's data and integration layer, connecting the sources and stores the solution depends on
  - Build the capstone's AI workflow, with prompts, chaining, and automation logic that meet the brief
competency_ids:
  - D5-S1-C01
  - D5-S1-C02
  - D1-S1-C02
  - D2-S1-C02
---

## Purpose
After watching, the learner can trace one record through raw-first ingestion, normalisation, validation, dedup, the AI step, routing, review, and output, and explain what each status transition buys them in stage 07.

## Audience and prerequisites
Learners starting stage 04 or 05. Uses the supplementary kata (agile210-x01) code, but the concepts apply to any platform.

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Split screen: left, an email in the accounts inbox with a PDF "INV-20931.pdf"; right, an empty `records` table in a SQLite browser. | "One invoice from Harbour Office Supplies has just arrived. We're going to follow it all the way to the tracking sheet, and watch the status column at every step. If you understand this one record, you understand the capstone's architecture." |
| 0:25 | Table: new row, status `received`, `raw_payload` populated with `" SUP-014 "`, `"inv-20931"`, `"03/03/2026"`, `"£1,240.00"`. | "Step one, before anything else: write the record with the raw payload exactly as it arrived. Look at it: a supplier ref with spaces, a lowercase invoice number, a UK date, a currency string. Ugly. That's the point. If everything downstream fails, we still have what arrived." |
| 1:00 | Same row: `supplier_ref` = `SUP-014`, `invoice_number` = `INV-20931`, `invoice_date` = `2026-03-03`, `total_minor` = `124000`. | "Normalise at the boundary, into separate fields, never over the raw payload. One date format, money in pence, keys trimmed and upper-cased. Do it here once, not in six places later." |
| 1:30 | Code panel: four named rules `supplier_ref_present`, `invoice_number_present`, `invoice_date_parseable`, `total_numeric`. A second row appears with total `"see attached"` → status `quarantined`, `validation_result` = `total_numeric`. | "Validate with named rules. Here's a second email where the total says 'see attached'. It doesn't error the run and it doesn't vanish. It's quarantined, it says which rule it failed, and someone can work it from a view." |
| 2:05 | Third row: same invoice re-sent → status `duplicate_skipped`. | "The supplier re-sends the same invoice. Natural key: supplier plus invoice number. It's recorded as a duplicate, not deleted, because 'how many duplicates arrive?' is a question your client will ask." |
| 2:30 | First row → `awaiting_ai`. Workflow canvas: chain table from agile210-05 (format gate, extraction, arithmetic check, categorisation, summary). | "Our record moves to awaiting_ai. In stage 04 a stub picks it up. In stage 05, the real chain does: a format gate rule, a model extraction, an arithmetic check rule, a model categorisation, and a summary line." |
| 3:05 | Prompt panel: the agile210-05 extraction prompt; highlight `<document>` markers and "Never infer, complete, or calculate a value." | "The extraction prompt follows the skeleton. The document sits between named markers and is never an instruction. And the model is told never to calculate: arithmetic is the next step's job, done by a rule." |
| 3:40 | JSON output: `supplier_name`, `invoice_number`, `invoice_date`, `currency`, `total`, `line_item_count`, `document_type: "invoice"`, `confidence: 0.93`. Validation tick marks appear by each field. | "The output is validated before anything uses it: it parses, the fields exist, document_type is one of four values. If it failed, one repair attempt, then quarantine with the raw output kept." |
| 4:15 | Arithmetic check: line items sum vs total → `totals_match: true`. Categorisation: `stationery`, confidence 0.97. | "The rule checks the arithmetic. The model picks a category from a closed list." |
| 4:40 | Routing table with the default row; a callout "min(0.93, 0.97) = 0.93 ≥ 0.85". | "Now the routing table decides, not the model. And it reads the lowest confidence across the chain, not just the last step's. Otherwise a shaky extraction followed by a confident categorisation leaves looking confident. That's confidence laundering." |
| 5:20 | Record status → `ready_for_output`. Then a second record shown with confidence 0.4 → `human_review`; review screen with source PDF left, extracted fields right, "AI-generated" label, buttons Approve / Edit / Reject / Escalate. | "This one goes straight to output. Here's one that didn't: confidence point four, so it lands in the review queue. The reviewer sees the source and the output side by side, the generated part is labelled, and they can edit, reject, or escalate, not just approve." |
| 6:05 | Tracking sheet gets one new row; `external_id` stored on the record; replay shown → no second row. | "Output: one row in the tracking sheet, and its row id stored on the record. When the workflow retries after a timeout, it checks that id first. No double write." |
| 6:35 | SQL: `select status, count(*) from records group by status;` → completed 1, human_review 1, quarantined 1, duplicate_skipped 1. Total 4 = 4 received. | "And here's why we did all of this with statuses. Four emails arrived; four records exist; every one is in a state we can count. That balance is your stage-04 evidence and your stage-07 drift check." |
| 7:10 | Checklist slide. | "Raw first. Normalise at the boundary. Quarantine, never drop. Dedup on a natural key. Validate every model output. Route on the minimum confidence with a default row. Guard every side effect. Count everything." |

## On-screen assets and B-roll
- `invoice_layer.py` from agile210-x01 and a SQLite browser (DB Browser for SQLite or the `sqlite3` CLI).
- A redacted, invented invoice PDF for "Harbour Office Supplies" (fictional).
- The extraction prompt and chain table from agile210-05, verbatim.
- A simple review-screen mock (can reuse the learner's stage-03 interface sketch format).

## Accessibility
- Captions and transcript, with each status name spelled out.
- Status changes are announced in narration and shown as text in a status column, not by row color.
- Zoom database and code views to at least 150%.

## Check for understanding
1. Why is the raw payload written before any parsing? *Answer: so the original input survives any downstream failure and every later defect can be diagnosed against what actually arrived.*
2. A duplicate arrives. Why record it as `duplicate_skipped` instead of discarding it? *Answer: so counts balance (no silent drop) and the client can see how many duplicates arrive.*
3. What is confidence laundering, and how does routing prevent it? *Answer: an unsure early step followed by a confident later step makes the record look confident; routing on the minimum confidence across steps prevents it.*
