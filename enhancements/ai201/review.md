---
course_id: ai201
title: "AI-Powered Automation & Workflows — Enhancement Review"
reviewed_lessons: 13
status: draft
---

## Summary

ai201 is an unusually strong course. The lessons are concrete, consistently platform-neutral, and organized around a few running examples: Northwind Freight quote intake, the vendor-invoice AP process, and the weekly ops report. The human-review-gate principle runs through all of them. Most problems are internal inconsistencies rather than conceptual gaps: arithmetic that does not match its own table, counts that do not match their lists ("five stages", "twelve sections", "five-section postmortem"), and one worked AI narrative that breaks the rules it is meant to demonstrate. The biggest opportunity is automated, learner-runnable checks. The course asks for many "prove it" steps but provides no test harness, and the two supplementary projects drafted here fill that gap for triage and extraction.

## Clarity issues

| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| ai201-02 | "The step inventory" | Says elapsed time is "over three days", but the table's wait times sum to 58 hours (about 2.4 days). | State 58 hours / nearly two and a half days. | Applied |
| ai201-02 | "Deciding what is worth automating" | Says `annual hours x (1 + exception_rate)` "penalizes" exception-heavy steps, but the formula raises their score. | Reworded: the formula weights up existing rework, and banding and anti-patterns still govern difficulty. | Applied |
| ai201-03 | "Three parts, and only one of them is obvious" | Typo: "twentieth thousand run". | "twenty-thousandth run". | Applied |
| ai201-04 | "The shape of a data pipeline" | "five small ones", but the pipeline has six stages. | "six". | Applied |
| ai201-04 | "Normalize: one shape per field" | Mapping target `requested_at` is inconsistent with `received_at` used in validation and in the lesson 03 record. | Renamed to `received_at`. | Applied |
| ai201-04 | "Route: rules over the enriched record" | Under first-match evaluation, the `confidence < 0.75` row (placed after the category rows) never fires for a categorized record, which contradicts "low confidence routes to a human regardless of category". | Moved the confidence row to the top and stated first-match-wins, matching lesson 08's ordered table. | Applied |
| ai201-04 | "Validate: quarantine, do not discard" | "Those six numbers must add up" without saying how; the six counts are not all additive. | Added the identity `received = quarantined + duplicate + routed` and how `valid` relates. | Applied |
| ai201-05 | "Narrate: the constrained AI step" (worked output) | Bullet 1 asserts a cause ("Quotes queue p90 ... drove the overall p90") and a per-queue p90 that the metrics object does not contain, breaking the lesson's own no-causes rule. Bullet 3 says quotes "opened the period with 201 received", but those are in-period counts. Owner names appear with no source. | Rewrote both bullets using only object figures, and explained that owners come from the joined routing table. | Applied |
| ai201-05 | Number-check guard paragraph | A naive digit regex passes invented figures because digits in names (`p90`, `W11`) enter the allowed set, and comma-formatted figures split. | Added a short paragraph on the two tokenizing traps and the digits-only prompt rule. | Applied |
| ai201-06 | "Template structure and clause selection" | The assertion uses `rate`, but the data contract has no rate field. | Added a note to add `rate` and showed 160 h x 525.00 = 84,000.00. | Applied |
| ai201-08 | Practice step 5 | Asks for a message that satisfies rows 1, 3, and 6, which is impossible because rows 3 and 6 are different categories. | Changed to rows 1, 2, and 6, with the reason. | Applied |
| ai201-09 | "Setting the thresholds with evidence" | The global tier rule (escalate below 0.70) conflicts with per-category assisted bands that go down to 0.60, and the relationship is not stated. | Added a sentence saying per-category floors replace the placeholders and escalate-wins stays global. | Applied |
| ai201-10 | Practice step 6 | "all twelve sections", but the runbook template has eleven. | "eleven". | Applied |
| ai201-11 | "The postmortem" and practice step 7 | "Five short sections", but the template has six (INCIDENT, IMPACT, CAUSE, DETECTION, FIX, FOLLOW-UP). | "Six". | Applied |
| ai201-12 | "The trap: never trade quality silently" | The `cost/case incl. review` column is internally inconsistent: A and D have the same review rate and near-identical model cost, yet differ by $0.27, and the implied review cost varies from $6.02 to $7.45 per reviewed case. | Recomputed with a stated assumption ($2.40 per review: 4 minutes at a loaded $36/h). The conclusion is unchanged (C is worst, D best). | Applied |
| ai201-12 | "Instrument before you touch anything" | "A 300ms step running 900 times per case" is an implausible illustration. | Suggest "running 20 times per case" (6 s total against 3 s). The author should confirm the intent. | Proposed |
| ai201-13 | "6. Evidence of operation" | "five-section postmortem" lists six sections. | "six-section". | Applied |
| ai201-03 | "Status as a state machine" | The ASCII diagram places `rejected` under `awaiting_review` and `failed` under `approved`, but the text never says whether `quarantined` is terminal or can be re-validated after a human fix. | State that quarantined records re-enter at `received` after correction. | Proposed |
| ai201-07 | "Confidence routing" | The `auto_post` row says "nobody, sampled at 5%". Posting to a tracking record is internal, but in lesson 02 the workflow continues to a money-moving approval. A sentence confirming that payment approval stays human would remove ambiguity against the course's human-in-the-loop principle. | Add one clarifying sentence. | Proposed |

## Depth and coverage gaps

- **No runnable verification harness** (all build objectives). Practice steps repeatedly say "prove" (idempotency, first-match routing, number guard, evidence checks), but learners on no-code platforms have no regression suite. Projects x01 and x02 address this for "Build an email triage workflow that classifies, routes, and drafts responses under human review" and "Extract and summarize the contents of inbound documents into structured fields a workflow can act on".
- **Concurrency race on the review gate** (Design a workflow's triggers, actions, and state so it runs correctly across systems and repeated executions). Lesson 03 names the race but gives no concrete pattern for platforms without atomic updates. An intermediate `sending` status claimed before the side effect is worth one worked example. Video v01 demonstrates it.
- **Calibration worked example** (Design a customer-service automation with explicit confidence thresholds and escalation to a person). Lesson 09 gives the 46%/2% versus 68%/9% outcome but not the table that produced it. A small worked calibration table (four thresholds x volume share x wrong rate) would make practice step 5 much easier to start.
- **Misconceptions not named**: "model confidence is probability of correctness" (lessons 07 and 09 touch on it) and "green runs mean healthy" (lesson 11). Animation a02 targets the second.
- **Report delivery under review** (Produce an automated report that assembles data, adds AI-generated narrative, and delivers on a schedule). The client-facing report review state is described but not shown. A short example of the review record would help.
- **Rollback depth** (Deliver an end-to-end automated business process with monitoring, escalation, and a rollback path). Lesson 13 requires a rollback path, but no lesson shows a worked rollback for the operational-field write pattern. Lesson 10's runbook entry is one line.
- **Accessibility of reviewer screens**: lessons 06 to 09 specify reviewer UIs (highlighting, side by side) without mentioning keyboard operation or non-color highlighting. That is a small addition for the integration lesson.

## Proposed additional projects

- **x01 Northwind Freight Shared-Inbox Triage Harness** (drafted, `projects/01-shared-inbox-triage-harness.md`). Python control layer plus a 25-test offline pytest suite with a golden set and a stubbed classifier.
- **x02 Vendor Invoice Extraction Checker** (drafted, `projects/02-vendor-invoice-extraction-checker.md`). Four validation layers, lesson 07 routing, and field-level accuracy, with an 18-test offline pytest suite fed by recorded extraction output.
- Weekly ops report number guard and fallback (lesson 05). Could be extended from the video v02 listings into a full project with an empty-period and a broken-source fixture.
- Document generator clause-drift audit (lesson 06). Generate 10 documents from fixtures and diff every fixed block against a clause library, with a test that no prompt payload contains clause text.
- Incident replay drill (lesson 11). An instructor-staged broken workflow export plus a log bundle, where learners produce the six-section postmortem and a regression set.
- Calibration notebook (lesson 09). Given a 150-row labeled shadow-run CSV, compute volume share and wrong rate per threshold per category and write the threshold record.

## Video and animation opportunities

- **Dedupe and the status gate**, ai201-03 (and replay in ai201-11). Screencast. Motion shows five deliveries collapsing to one case. Drafted: `media/video-01-five-deliveries-one-case.md`.
- **Report number-check guard**, ai201-05. Hybrid screencast. Shows the tokenizing traps live. Drafted: `media/video-02-every-number-traceable.md`.
- **Escalate wins, not averaged**, ai201-09. Explainer animation. Gate ordering is a dynamic process that a still diagram undersells. Drafted: `media/animation-01-escalate-wins.md`.
- **The funnel must balance**, ai201-04 and ai201-11. Explainer animation. Silent drops are invisible without motion and counts. Drafted: `media/animation-02-the-funnel-must-balance.md`.
- Process mapping walk-through, ai201-02. Whiteboard. Building the step inventory from an observed case and showing where the 58 hours sit. Not drafted.
- Reviewer screen tour, ai201-06/08. Screencast of a well-designed review queue (highlighted AI text, evidence beside fields, three to four actions). Not drafted.
- Shadow, suggest, assist ladder, ai201-10. Short explainer. Not drafted.

## Assessment ideas

- Quick checks were added to lessons 02, 04, 05, and 09. Similar three-question blocks would suit 03 (natural key versus delivery ID), 07 (evidence check, null over guess), and 11 (401 versus 403, loud versus silent).
- A "spot the defect" item bank built from this review's findings, for example "this routing table has the confidence row last; which records misroute?" or "this narrative asserts a cause; rewrite it."
- Lesson 13 rubric: the Definition of done is a strong checklist. Convert it into a three-level rubric (Developing / Meets / Exceeds) per section so peer reviewers grade consistently.
- An arithmetic-integrity item: give a cost table like lesson 12's and ask learners to recompute the cost-per-case column and find the inconsistent row.

## Changes applied in this pass

- `02-mapping-a-business-process-for-automation.md`, "The step inventory": corrected elapsed time to 58 hours (about two and a half days).
- `02-mapping-a-business-process-for-automation.md`, "Deciding what is worth automating": reworded the description of the suitability score so it matches what the formula does.
- `02-mapping-a-business-process-for-automation.md`, end: added "Check your understanding" (3 questions).
- `03-workflow-architecture-triggers-actions-and-state.md`, "Three parts, and only one of them is obvious": fixed "twentieth thousand" to "twenty-thousandth".
- `04-data-processing-workflows.md`, "The shape of a data pipeline": "five small ones" changed to "six small ones".
- `04-data-processing-workflows.md`, "Normalize: one shape per field": `requested_at` changed to `received_at` in the mapping table.
- `04-data-processing-workflows.md`, "Validate: quarantine, do not discard": added the reconciliation identity.
- `04-data-processing-workflows.md`, "Route: rules over the enriched record": moved the confidence row to the top and stated first-match-wins evaluation.
- `04-data-processing-workflows.md`, end: added "Check your understanding".
- `05-automated-reporting-and-decision-support.md`, "Narrate: the constrained AI step": fixed two worked-narrative bullets (removed the asserted cause and the unsupported per-queue p90, corrected "opened the period"), explained where owners come from, and added the tokenizing-traps paragraph to the number-check guard.
- `05-automated-reporting-and-decision-support.md`, end: added "Check your understanding".
- `06-document-generation-and-assembly.md`, "Template structure and clause selection": added the missing `rate` field note with a reconciling worked figure.
- `08-intelligent-email-triage-and-routing.md`, Practice step 5: replaced the impossible "rows 1, 3, and 6" test with "rows 1, 2, and 6".
- `09-customer-service-automation-and-escalation.md`, "Setting the thresholds with evidence": clarified how per-category floors replace the tier-rule placeholders.
- `09-customer-service-automation-and-escalation.md`, end: added "Check your understanding".
- `10-integrating-ai-into-existing-operations.md`, Practice step 6: "twelve sections" changed to "eleven sections".
- `11-troubleshooting-automation-failures.md`, "The postmortem" and Practice step 7: "five" changed to "six" sections.
- `12-refining-workflows-for-performance-and-cost.md`, "The trap: never trade quality silently": recomputed the cost-per-case column and stated the review-cost assumption.
- `13-project-automate-a-business-process-end-to-end.md`, "6. Evidence of operation": "five-section" changed to "six-section" postmortem.

Lesson frontmatter was verified byte-identical before and after editing for all 13 files.

Independent verification: each lesson was diffed against the pre-edit copies. Exactly 11 lesson files changed (02, 03, 04, 05, 06, 08, 09, 10, 11, 12, 13); 01 and 07 are untouched. Every changed hunk is listed above. The recomputed lesson 12 column was re-checked by hand: model cost per case plus review rate x $2.40 gives A $0.45, B $0.46, C $0.82, D $0.44. One consequence of the new numbers: B is now $0.01 per case more expensive than A, and the owner should confirm that is acceptable (see Open questions).

## Open questions for the course owner

- **Lesson 12 cost table**: the recomputed column assumes $2.40 per review (4 min at a loaded $36/h). With that assumption, variant B is $0.01 per case *more* expensive than A once review is included, because its review rate is 19% against 18%, while the refinement note keeps B. That is defensible (the difference is within noise), but you may prefer a different review cost or to say so explicitly in the note.
- **Lesson 12 "300ms step running 900 times per case"**: was 900 intended? (See Proposed fix.)
- **Model naming and pricing**: the course deliberately avoids vendor model names and prices, using "large" and "small" plus illustrative dollar figures. Those figures (for example $18.40 per 1k cases) are not tied to any current price list. Keep them clearly illustrative and do not update them to a vendor's pricing.
- **Prompt caching (lesson 12)**: "use whatever caching your provider offers for repeated prefixes" is accurate in general, but provider mechanics and minimum prefix sizes change. Re-check against the platforms used in ai102 at each cohort.
- **Email header list (lesson 08)**: `Auto-Submitted`, `X-Auto-Response-Suppress`, `List-*`, and `Precedence: bulk` are standard, but `Auto-Submitted: no` means a human sent the message. Consider adding that nuance so learners do not filter on the header's mere presence.
- **Airtable as "the common choice" (lesson 03)**: this depends on the ai102 platform choice. Confirm it still matches what the cohort uses.
- **Proposed competency** in course.json (human-in-the-loop checkpoints) is not yet in the framework. The supplementary materials cite only existing D3-S1-C01 to C05.
- **Projects x01/x02 use Python** for the acceptance tests, although the course is otherwise no-code. Confirm learners in this pathway are expected to run a small Python test suite (the ai-developer pathway would be; prompt-engineer apprentices may need a short setup guide).
