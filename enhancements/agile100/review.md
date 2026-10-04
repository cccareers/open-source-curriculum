---
course_id: agile100
title: "Introduction to Agile Projects — Enhancement Review"
reviewed_lessons: 9
status: draft
---

## Summary
A strong, coherent course: every lesson is taught from the QA seat, the running storefront example (STORY-101 wishlist, STORY-104 out-of-stock, STORY-108 search index fix, BUG-142/150/151/155/160) threads cleanly from refinement to review, and each lesson ships a usable template. The main weaknesses were a few Scrum-terminology inaccuracies relative to the 2020 Scrum Guide, several undefined terms (increment, ADR, CI, regression, smoke test, happy path), an outdated Node error string, and no "Check your understanding" blocks. The biggest opportunity is guided practice that strings the templates together on one story and one incident, which the two new projects provide.

## Clarity issues
| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| agile100-02 | "Scrum roles, briefly" | "Increment" used without definition; "Development Team" is the pre-2020 Scrum Guide term | Defined increment inline; noted the 2020 guide's "Developers" term | Applied |
| agile100-02 | "The sprint cycle and the QA touchpoint in each ceremony" | Says "five ceremonies", but the list includes continuous testing/triage and omits that refinement is not a formal Scrum event; the table then lists six rows | Reworded to "five QA touchpoints" and stated the formal Scrum events | Applied |
| agile100-02 | Same section, item 3 | "10-15 minute" standup; Scrum Guide time-box is 15 minutes max | Changed to "15 minutes at most" | Applied |
| agile100-02 | Same section, item 5 | Retrospective described as "privately", which is vague about who attends | "without outside stakeholders" | Applied |
| agile100-03 | "A repeatable orientation pass" step 3 | "ADRs" used without definition | One-sentence definition added | Applied |
| agile100-03 | "Using logs, config, and code..." worked example | `ECONNREFUSED` is only one of several errors a decommissioned host produces; `.ts` file in a "JavaScript" course is unexplained | Parenthetical noting ENOTFOUND/ETIMEDOUT; note on TypeScript | Applied |
| agile100-03 | "Source-control best practices..." | "CI" used without definition | Inline definition | Applied |
| agile100-04 | "Edge cases the AC doesn't say out loud" | "Happy path" undefined; edge-case advice had no worked rows | Defined happy path; added TC-04 to TC-06 example rows with rationale | Applied |
| agile100-05 | "Building the sprint test plan" | "Regression" and "smoke test" used in the skeleton without definition | Defined both in the Approach item | Applied |
| agile100-05 | "Capacity: how much testing actually fits" | 60-70% rule had no worked numbers | Added a worked calculation against the lesson's sprint | Applied |
| agile100-06 | "The daily standup" | Presents the three questions as how standup works; 2020 Scrum Guide dropped them | Added a note that they're a convention, not a requirement | Applied |
| agile100-07 | "Worked example" (defect record) | `TypeError: cannot read property 'id' of undefined` is the pre-Node-16.9 message | Updated to `Cannot read properties of undefined (reading 'id')` | Applied |
| agile100-07 | "Tracking through resolution" | Where a reopened defect goes next was implicit | Stated Reopened returns to In Progress | Applied |
| agile100-08 | "Two ceremonies, two very different audiences" | "The team, alone" ambiguous about PO and Scrum Master attendance | Named attendees | Applied |
| agile100-09 | "Requirements" item 5 | Instruction to escalate a non-blocking defect "regardless" conflicts with Lesson 06's "don't cry wolf" guidance | Added: state real severity honestly and label it a practice escalation | Applied |
| agile100-02 | Image `./img/sprint-cycle.png` | Referenced image doesn't exist in `lessons/img/` (listed in course.json `assets` as to-be-drawn) | Produce the asset (animation-01 storyboard visual language could be reused) | Proposed |
| agile100-02 to 08 | Body text | Competency codes (e.g. "D5-S1-C04 is about...") appear in learner-facing prose; meaningful to staff, opaque to learners | Consider replacing codes with plain-language names, or moving them to a footnote | Proposed |

## Depth and coverage gaps
- **No self-checks anywhere.** Lessons 02-08 ended with a Practice task only. Added a short "Check your understanding" block with answers to each (all objectives).
- **Edge-case thinking was told, not shown** (Lesson 04): now has three worked QA-added rows; objective "Turn a user story's acceptance criteria into testable checks".
- **Mid-sprint replanning** (Lesson 05) is described in one paragraph but never worked through. Project x01 milestone 3 makes learners write a dated replan; objective "Plan a sprint's testing work against scope and delivery dates".
- **Reopened defects** (Lesson 07) appear in the state diagram but no example walks one through. Animation a01 does; objective "Track defects from discovery through verified closure".
- **Duplicate vs related defects** (Lesson 07 practice Q3) has no worked example of the reasoning. Worth one short example; same objective.
- **Documentation review compliance dimension** (Lesson 03) has a single example; a second example (e.g. a security or accessibility claim in docs) would help; objective "Orient yourself in an unfamiliar legacy codebase and its documentation".
- **Lesson 03 practice** depends on the learner finding a suitable repo; project x02 supplies a self-contained starter repo with deliberate doc gaps.
- **Retrospective facilitation formats** beyond went-well/didn't/try (e.g. start-stop-continue) are not mentioned; a one-line mention would help learners recognise them on a real team; objective "Demonstrate completed work and give useful retrospective input".

## Proposed additional projects
- **Drafted: x01 "Case File: STORY-104 From Refinement to Review"** — one story's full QA artifact trail, including a dependency slip, BUG-160 lifecycle, and an ambiguous out-of-scope finding (`projects/01-out-of-stock-story-case-file.md`).
- **Drafted: x02 "The Search Index Outage: Orient, Diagnose, Escalate, Record"** — role-play plus a runnable `node:test` suite that checks docs against config (`projects/02-search-index-outage-orientation.md`). The test file was run on Node 24: 3/3 fail on the starter, 3/3 pass after the fix.
- Not drafted: "Sprint Review Dry Run" — learners present a verification report to a panel that pushes back with "so is it done or not?" questions; scored on D1-S1-C03.
- Not drafted: "Known-Defects Cleanup" — given a messy 30-row tracker export with duplicates and undocumented deferrals, learners merge, link, and annotate it (D3-S1-C05).
- Not drafted: "Async Standup Week" — five written standups for a distributed team spanning time zones, including one escalation, reviewed for "could a reader act without replying?".

## Video and animation opportunities
- **Drafted: v01 "Escalating a Blocker in Standup"** (Lesson 06/07, hybrid) — hearing a weak vs strong escalation aloud is more convincing than reading them.
- **Drafted: v02 "From Acceptance Criteria to Test Cases"** (Lesson 04, screencast) — shows the live rewrite and spreadsheet build.
- **Drafted: a01 "The Defect Lifecycle: Why Fixed Is Not Closed"** (Lesson 07, explainer animation) — state changes over time and the Reopened loop are dynamic.
- Not drafted: "Config, Logs, Code: Cheapest First" (Lesson 03, explainer animation) — a search funnel narrowing from "somewhere in the app" to one line.
- Not drafted: "Sprint Week Timeline" (Lesson 05, animation) — stories becoming testable on different days, with test hours filling a capacity bar; makes the 60-70% rule visible.
- Not drafted: "Built vs Verified vs Not Verified" (Lesson 08, talking head) — a mock review with and without the QA verification report.

## Assessment ideas
- Ten-item AC triage quiz: learners mark each criterion observable/specific/bounded and rewrite the failures.
- Severity/priority sorting exercise: 8 defect cards placed on a 2x2 grid with justifications.
- Escalation rubric (4 parts x 3 levels) usable by peers during the Lesson 09 sprint's daily standups.
- Defect-record checklist (all Lesson 07 fields present, repro reproducible by a peer in under 2 minutes).
- Review-report audit: given a demo transcript, learners flag every place "built" was presented as "verified".

## Changes applied in this pass
- `02-agile-values-frameworks-and-the-qa-role.md`, "Scrum roles, briefly": defined "increment"; noted the 2020 Scrum Guide term "Developers".
- `02-agile-values-frameworks-and-the-qa-role.md`, "The sprint cycle and the QA touchpoint in each ceremony": reframed "five ceremonies" as five QA touchpoints and named the formal Scrum events; standup time-box now "15 minutes at most"; retrospective attendance clarified.
- `02-agile-values-frameworks-and-the-qa-role.md`, new "Check your understanding" at end (3 questions with answers).
- `03-reading-a-legacy-codebase-and-its-documentation.md`, "A repeatable orientation pass": defined ADR.
- `03-reading-a-legacy-codebase-and-its-documentation.md`, "Using logs, config, and code to locate a breakdown": noted ENOTFOUND/ETIMEDOUT alternatives and explained the `.ts` extension.
- `03-reading-a-legacy-codebase-and-its-documentation.md`, "Source-control best practices you inherit on day one": defined CI.
- `03-reading-a-legacy-codebase-and-its-documentation.md`, new "Check your understanding" at end.
- `04-backlog-user-stories-and-acceptance-criteria.md`, "Edge cases the AC doesn't say out loud": defined happy path; added worked rows TC-04 to TC-06 with rationale.
- `04-backlog-user-stories-and-acceptance-criteria.md`, new "Check your understanding" at end.
- `05-sprint-planning-and-the-sprint-test-plan.md`, "Building the sprint test plan": defined regression check and smoke test.
- `05-sprint-planning-and-the-sprint-test-plan.md`, "Capacity: how much testing actually fits": added worked capacity calculation (40h nominal, ~26h real, ~15-16h in Days 3-5).
- `05-sprint-planning-and-the-sprint-test-plan.md`, new "Check your understanding" at end.
- `06-daily-standups-collaboration-and-escalation.md`, "The daily standup": noted the three questions are a convention the 2020 Scrum Guide no longer requires.
- `06-daily-standups-collaboration-and-escalation.md`, new "Check your understanding" at end.
- `07-bug-triage-and-tracking-through-the-sprint.md`, "Worked example": updated the TypeError message to the current V8/Node wording.
- `07-bug-triage-and-tracking-through-the-sprint.md`, "Tracking through resolution": stated that Reopened returns to In Progress.
- `07-bug-triage-and-tracking-through-the-sprint.md`, new "Check your understanding" at end.
- `08-sprint-review-demo-and-retrospective.md`, "Two ceremonies, two very different audiences": named retrospective attendees.
- `08-sprint-review-demo-and-retrospective.md`, new "Check your understanding" at end.
- `09-one-week-sprint-on-a-legacy-codebase.md`, "Requirements" item 5: added honesty guidance for practice escalations.
- No changes to `01-course-overview.md`, any frontmatter, or `course.json`.

## Open questions for the course owner
- `./img/sprint-cycle.png` is referenced in Lesson 02 but not present in `lessons/img/`. Is the asset in progress elsewhere?
- Should learner-facing prose keep competency codes (D5-S1-C04 etc.), or should they be replaced with plain-language names?
- The Scrum terminology edits follow the 2020 Scrum Guide. If the program deliberately teaches older terminology (Development Team, three standup questions), the notes can be softened.
- The "60-70% of nominal hours" capacity rule in Lesson 05 is presented as a rule of thumb without a source; I kept it, but it's a heuristic, not a published standard.
- The Google Sheets and Excel freeze-row menu paths and the Chrome DevTools throttling presets in v02 should be checked against current UIs at recording time.
- Project x02's note about `node --test test/` failing was observed on Node 24.18.0 only; behaviour on Node 18/20 was not tested.
- The x01 cart-checkout finding is intentionally ambiguous (missing AC vs defect). Confirm that's the desired teaching choice.
- The course `description` in course.json is truncated ("ap"); out of scope for this pass, but worth fixing at the source.
