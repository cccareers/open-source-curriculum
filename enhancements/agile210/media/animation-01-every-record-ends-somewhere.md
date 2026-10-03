---
course_id: agile210
media_id: agile210-a01
type: animation-storyboard
title: "Every Record Ends Somewhere"
target_runtime: "80 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - agile210-04
  - agile210-07
objectives:
  - Build the capstone's data and integration layer, connecting the sources and stores the solution depends on
  - Test, troubleshoot, and harden the capstone until it survives realistic use
competency_ids:
  - D5-S1-C01
  - D5-S1-C05
---

## Concept and misconception it fixes
Misconception: "If the run didn't error, everything was processed." Records can silently vanish (validation that throws, state held only in the workflow, retries that loop forever). Modelling the pipeline as status transitions, where every record lands in a countable state, makes silent drops visible and makes the reconciliation balance the hardening check for stage 07.

## Visual language (shapes, colors with color-blind-safe palette, labels)
- Records are envelope icons labelled with invoice numbers.
- Statuses are labelled lanes left to right: `received` → `awaiting_ai` → `human_review` / `ready_for_output` → `completed`; side bins `quarantined`, `duplicate_skipped`, `failed`.
- Okabe–Ito palette: normal flow blue (#0072B2), quarantine orange (#E69F00), duplicate gray (#999999) with "x2" badge, failed vermillion (#D55E00) with "!" glyph, completed bluish green (#009E73) with a check. Every color is paired with a text label and glyph.
- A counter panel at the right shows counts per status and a "received" total, with a balance indicator showing "=" or "≠".

## Scenes
| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 8s | A workflow drawn as one long arrow with no lanes. Eight envelopes enter; six exit to "tracking sheet". Counter: in 8, out 6. | Two envelopes fade mid-arrow with no trace. | "A workflow with no state. Eight invoices in, six out. Where are the other two? Nothing errored. Nobody knows." |
| 2 | 6s | The arrow rebuilds into labelled lanes. | Lanes slide into place. | "Now give every record a status, and make every step a transition." |
| 3 | 8s | Eight envelopes drop into `received`. Counter: received 8. | Drop with small bounce. | "First action on arrival: write the record. Received: eight." |
| 4 | 8s | One envelope ("total: see attached") moves to `quarantined` with tag `total_numeric`. | Slide down into orange bin. | "One fails a named rule. It isn't dropped; it's quarantined, and it says why." |
| 5 | 6s | One envelope matches an existing key and moves to `duplicate_skipped` ("x2"). | Slide into gray bin. | "One is a re-send. Recorded as a duplicate, not deleted." |
| 6 | 8s | Six envelopes move to `awaiting_ai`, then split: four to `ready_for_output`, two to `human_review` (badge "conf 0.4", "totals mismatch"). | Fan-out. | "Six reach the AI step. Four are confident and clean. Two go to a person." |
| 7 | 8s | Reviewer icon approves one (→ `ready_for_output`), rejects one to `failed` with "!". | Hand icon taps. | "The reviewer approves one and rejects one." |
| 8 | 8s | Five envelopes move to `completed`; tracking sheet gains five rows. | Rows tick in. | "Five completed." |
| 9 | 10s | Counter panel: completed 5, quarantined 1, duplicate_skipped 1, failed 1 = 8; received 8. Balance indicator "=". | Numbers count up; "=" stamps in. | "Five plus one plus one plus one is eight. Every record ended somewhere you can count. That's a balanced reconciliation." |
| 10 | 10s | Replay with a bug: an envelope stops between `awaiting_ai` and nowhere (a retry loop icon spinning). Counter shows 7 vs 8; indicator "≠" flashes; an "absence/stuck" alert bell rings. | Spinner, then bell. | "If the numbers don't balance, you've found a silent drop or a stuck record, before your client did. In stage 07 this check becomes an alert." |

## Interaction variant (optional)
A step-through where learners drag each of eight envelopes into a status bin based on a one-line description, then the counter checks the balance. Implementable in H5P "Drag and Drop".

## Production notes
- Use the stage-04 status vocabulary from agile210-04 ("received", "quarantined", "duplicate_skipped", "awaiting_ai", "human_review", terminal success, terminal failed); `ready_for_output` and `completed` follow the x01 kata.
- The final frame of scene 9 (lanes, bins, counter) is designed to double as the missing static diagram referenced in agile210-03 (`capstone-solution-architecture.png`) if the course owner wants a single asset; add trigger and monitoring boxes for that use.
- WebVTT captions; audio description reads each counter value aloud in scene 9 and the "not equal" state in scene 10.
