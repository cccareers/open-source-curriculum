---
course_id: se305
title: "Data-Driven Selling & Analytics — Enhancement Review"
reviewed_lessons: 6
status: draft
---

## Summary

A rigorous, internally consistent analytics course: one Meridian Freight dataset carries Lessons 2–5, every derived figure reconciles (I re-checked the cohort, weighted pipeline, priced leaks, source mix, loss-reason weighting, and the capstone tables), and the capstone uses a fresh territory with a different answer. Two sentences needed correction. The biggest opportunity is practice in *saying* the analysis to a manager — the course's real-world endpoint — plus visual explanations of the snapshot-vs-cohort distinction that learners most often get wrong.

## Clarity issues

| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| se305-02 | "Pipeline coverage" | "Most teams ask for 3x on top of a 33% win rate, or roughly 1.2 to 1.5 times break-even" is self-contradictory: at a 33% win rate, 3x *is* break-even (1/0.33). | Rewrote: targets are ~1.2–1.5× break-even, i.e. 3.6x–4.5x for a 33% win rate. | Applied |
| se305-03 | "Reading the report for coverage" | "One basis point under the line" — 3.97x vs. 4.0x is not a basis point. | Changed to "a hair under the line — 3.97x against 4.0x." | Applied |
| se305-02 | "The data you will use" | "30 September, the start of the last month of Q4," plus "dates that expired in July" and "an opportunity created on 15 November is a Q1 deal," only work if the fiscal year ends 31 October. Never stated. | Add "(Meridian's fiscal year ends 31 October)". | Proposed |
| se305-02 | "Putting the five together" — Cycle only | "28 / 24 = 1.169x" — 28/24 is 1.167; 1.169 comes from 28.07/24. | Write "28.07 / 24 = 1.17x". | Proposed |
| se305-06 | "The territory" | Dana Okafor's capstone uses "Meridian Freight Software" — the same company as the class data, which is fine — but "Dana" and "Meridian" recur across five courses in different roles. | Consider distinct names. | Proposed |
| All lessons | End of lesson | No self-check. | Added "Check your understanding" to se305-02 through se305-05. | Applied |

## Depth and coverage gaps

- **Communicating the analysis.** Every lesson ends in a sentence for a manager, but nobody practices delivering it under challenge. Drafted se305-x01 (Rep C one-on-one) for "Diagnose where a personal funnel is leaking and name the likely cause" and "Turn an analysis of sales data into a changed plan with a measurable target".
- **Snapshot vs. cohort.** The single most important conceptual point in Lesson 3 is explained in text only. Drafted se305-a01 for "Read a pipeline report for conversion, velocity, and coverage, and say what it implies".
- **Cycle-driven diagnosis has no worked example.** Lesson 4 works a conversion problem in full; the cycle cause appears only in the triage table (Rep C). se305-x01 supplies a worked dataset.
- **Building the report in a CRM.** Lesson 5 specifies tiles but gives no click-path guidance for any platform; a short appendix mapping each tile to a native report type in Salesforce/HubSpot/GoHighLevel would support "Build a CRM dashboard that answers a stated question rather than displaying everything" (vendor UIs must be verified).
- **Spreadsheet scaffold.** Learners recompute many figures; a starter workbook with the Meridian tables would reduce arithmetic errors without removing the analysis.

## Proposed additional projects

- **Drafted — se305-x01** `projects/01-funnel-diagnosis-manager-one-on-one.md`: cycle-cause diagnosis for Rep C with a manager role-play.
- Not yet drafted — **Dashboard teardown**: given a 14-tile "everything" dashboard, cut to six tiles with full specs and a gaming test for each.
- Idea: **Rep A deal-size diagnosis** — a second triage rep (high volume, small deals) with segment data, mirroring the capstone's segment table.

## Video and animation opportunities

- **Drafted — se305-v01** "3.97x or 2.70x?" (se305-03, se305-05), hybrid two-take pipeline review.
- **Drafted — se305-a01** "Snapshot vs. Cohort" (se305-03), Motion Canvas.
- Not yet drafted — whiteboard: "Pricing a Leak" walking the 13 extra opportunities through 62.1% → 83.3% → 80.0% to $153,330 (se305-04).
- Idea: animation of the velocity formula's four levers, showing why cutting cycle 20% raises velocity 25% (se305-02).

## Assessment ideas

- Parameterized auto-graded items for win rate, coverage, break-even, and velocity.
- "Which report is this?" quiz: ten report descriptions labeled snapshot / cohort / flow.
- Tile-spec rubric: six links present, filter reproducible by a second person, action tied to threshold.

## Changes applied in this pass

- `catalogue/courses/se305/lessons/02-the-metrics-that-drive-decisions.md`, "Pipeline coverage": corrected the coverage-target sentence.
- `catalogue/courses/se305/lessons/03-reading-a-pipeline-report.md`, "Reading the report for coverage, and finding the lie": replaced "one basis point."
- Added "Check your understanding" to `02-the-metrics-that-drive-decisions.md`, `03-reading-a-pipeline-report.md`, `04-diagnosing-your-own-funnel.md`, `05-dashboards-and-reporting.md`.

## Open questions for the course owner

- Confirm Meridian's fiscal-year end (31 October is implied).
- The "1.2 to 1.5 times break-even" coverage convention is a common rule of thumb but unsourced; keep as stated or cite?
- se305-06 has `objectives` on a project-kind lesson while other courses' project lessons have none — intentional? (Not changed.)
