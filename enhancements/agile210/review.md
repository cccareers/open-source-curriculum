---
course_id: agile210
title: "Capstone Project — Enhancement Review"
reviewed_lessons: 8
status: draft
---

## Summary
agile210 is a well-built capstone: one build in seven passes, each stage with inherited artifacts, requirements, constraints, a definition of done, a rubric, hints, and checkpoint questions. The supplier-invoice example (office manager, 41-minute baseline, accounts inbox, top-eight suppliers, 34-row supplier list, SC-1/SC-2/SB-3) runs consistently from scoping to handover. The biggest opportunities are (1) a recurring stage-numbering ambiguity ("stage 2 of 7" vs "stage 03"), (2) a handful of worked examples whose numbers or rows do not quite match the rules the lesson states (reconciliation counts, the routing table's missing default row, hold-out size), and (3) small, runnable practice that lets a learner rehearse the data-layer and routing/evaluation mechanics before spending capstone hours on them.

## Clarity issues
| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| agile210-01, -03..-08 | "Goal" in each project lesson | Stages are called "stage 2 of 7" … "stage 7 of 7" in each Goal, but everywhere else they are referred to by lesson number ("stage 03", "stage-02 checkpoint", "stage 07"). Learners will read "stage 07" as the seventh stage, which is lesson 08. | Added a one-sentence naming convention to the overview and to the lesson 03 Goal (first time the "of 7" count appears). | Applied |
| agile210-03 | "1. Component map" | Image `./img/capstone-solution-architecture.png` does not exist in the repo; renders broken. | Asset needs producing (see animation-01, whose final frame can double as the static diagram) or the line removed. Not edited: removing it would delete content. | Proposed |
| agile210-04 | "6. Evidence run" | Reconciliation example does not show how the numbers balance: validated 21 + quarantined 4 = 25, but duplicates (3) and integration failures (2) are listed without saying which bucket they come from, and "in terminal state 25" is not broken down. | Added a short breakdown showing the terminal states summing to 25. | Applied |
| agile210-05 | "4. Decision and routing logic" | The rules say "There is a default row", but the worked table has none. | Added a default row ("No other row matches → human review queue"). | Applied |
| agile210-05 | "Constraints" ("Do not tune on your test set") | Says keep "a handful" of records aside; stage 07 requires at least 20 unseen hold-out records. Learners who hold back five will have to collect fresh records in stage 07. | Changed to "at least 20" with a pointer to stage 07. | Applied |
| agile210-07 | "2. Set the thresholds from evidence" | "at 0.85, you catch nine of the eleven errors" — the evaluation table above has 9 wrong fields across 7 records, not 11 errors, so the numbers read as inconsistent. | Marked the sentence as an illustrative example. | Applied |
| agile210-02..08 | End of lesson | No self-check. The checkpoint questions serve a similar purpose for the instructor, but learners have nothing to check themselves against before the checkpoint. | Added "Check your understanding" to 02 (the only taught lesson) and to 04, 05, 07. Project lessons 03, 06, 08 already have extensive checkpoint questions; left as is. | Applied |

## Depth and coverage gaps
- **No rehearsal of the data-layer mechanics before the capstone clock is running** (objective: "Build the capstone's data and integration layer, connecting the sources and stores the solution depends on"). Status model, natural-key dedup, quarantine, and reconciliation are described carefully but never practised in isolation. Drafted as project agile210-x01 with an 11-test suite.
- **Routing and threshold-setting are prose-only** (objectives: "Build the capstone's AI workflow, with prompts, chaining, and automation logic that meet the brief" and "Test, troubleshoot, and harden the capstone until it survives realistic use"). "Confidence laundering" and the threshold trade-off are the two ideas learners most often get wrong; both are now testable in agile210-x02.
- **Stage 06 hostile-input test** gives a one-line payload; ai350-02 has a richer worked example. A cross-reference would deepen the stage without new content.
- **Feedback session (stage 08)** would benefit from a filled-in example observation log of 5–6 rows showing how severity is judged; currently two rows.
- **Webhook ordering** (stage 04) is required ("out-of-order delivery") but no technique is given (compare a source timestamp or sequence number before overwriting). One sentence would close it.
- **Misconception worth naming explicitly** (stage 07): a higher threshold is always safer. The x02 suite shows a case where a lower threshold catches the same errors with fewer unnecessary reviews.

## Proposed additional projects
- **agile210-x01 Invoice Intake Kata: Status Model, Dedup, and a Balanced Reconciliation** (drafted) — Python + SQLite rehearsal of stage 04; 11 tests.
- **agile210-x02 Routing Table and Hold-Out Evaluation Harness** (drafted) — route with default row and minimum-confidence carry-forward; field-level and segmented accuracy; threshold trade-off; 14 tests.
- Alternative capstone scenario pack (not drafted): two instructor-assigned scenarios (e.g. a training-provider enquiries inbox; a maintenance-request form) each with 20 redacted sample inputs, a stakeholder role sheet, and a hidden hold-out of 20.
- Handover pack swap (not drafted): learners exchange operations packs and must perform the manual fallback and kill switch for each other's build, logging every question.
- Mock checkpoint (not drafted): a peer runs the stage-05 checkpoint questions against your build with a 20-minute timer.

## Video and animation opportunities
- **Writing a brief that can fail** — agile210-02 — soft goals vs metric/baseline/target/method/owner; talking head with on-screen rewrites. **Drafted: media/video-01-writing-a-brief-that-can-fail.md**
- **Following one invoice through the pipeline** — agile210-04/05 — every status transition shown on a real record; screencast. **Drafted: media/video-02-one-invoice-end-to-end.md**
- **Records flowing through statuses and the reconciliation that must balance** — agile210-04 — invisible state made visible; explainer animation. **Drafted: media/animation-01-every-record-ends-somewhere.md**
- Confidence laundering through a chain (agile210-05) — explainer animation. Not drafted.
- The threshold slider: errors caught vs unnecessary reviews (agile210-07) — interactive. Not drafted.
- Watching a user, not helping (agile210-08) — talking head with a reenacted session clip. Not drafted.

## Assessment ideas
- Brief critique (02): three sample briefs; learners mark which criteria are unfalsifiable and rewrite one.
- Trace-table gap hunt (03): a component map and a brief with two untraced requirements and one orphan component.
- Reconciliation puzzle (04): counts that do not balance; find the silent drop.
- Chain-table review (05): spot the model step that should be a rule.
- Findings severity calibration (06): ten findings, assign severity and decision, compare with a model answer.
- Scorecard read-out (07/08): given evaluation numbers, write the two-sentence honest summary for a demo.

## Changes applied in this pass
- `01-course-overview.md` — "Description": added the stage-naming convention (stages are referred to by lesson number).
- `02-scoping-the-capstone-client-problem-and-solution-brief.md` — end: added "Check your understanding".
- `03-project-solution-design-and-prototype-plan.md` — "Goal": clarified "stage 2 of 7" vs "stage 03" naming.
- `04-project-build-the-data-and-integration-layer.md` — "6. Evidence run": added a terminal-state breakdown so the example reconciliation visibly balances.
- `04-project-build-the-data-and-integration-layer.md` — end: added "Check your understanding".
- `05-project-build-the-ai-workflow.md` — "4. Decision and routing logic": added the missing default row to the worked routing table.
- `05-project-build-the-ai-workflow.md` — "Constraints": hold-out size aligned with stage 07 (at least 20 records).
- `05-project-build-the-ai-workflow.md` — end: added "Check your understanding".
- `07-project-test-troubleshoot-and-harden.md` — "2. Set the thresholds from evidence": marked the 0.85 trade-off sentence as illustrative.
- `07-project-test-troubleshoot-and-harden.md` — end: added "Check your understanding".

## Open questions for the course owner
- The missing image in agile210-03 (`./img/capstone-solution-architecture.png`): produce it (animation-01's final frame is designed to double as this diagram) or remove the reference?
- Prerequisites list "ai101, ai102, ai201, db305, ai210, and ai350"; stage 04 also cites ai102 techniques. Confirm ai102 exists in the catalogue and in this pathway.
- Stage 06 asks learners to look up vendor retention and training terms; these change often. Learners should date-stamp their evidence (as ai350-03 requires). Add that instruction?
- The supplementary projects assume Python 3.10+ and pytest. The capstone itself is platform-agnostic (often no-code). Keep the projects as optional rehearsals, or provide no-code variants as the primary path? Each brief includes a no-code variant.
- Hours: stage budgets sum to 6 + 7 + 8 + 5 + 4 + 4 = 34 build hours plus scoping; consistent with "roughly thirty-five hours of build time" in lesson 02. No change needed, noted for completeness.
