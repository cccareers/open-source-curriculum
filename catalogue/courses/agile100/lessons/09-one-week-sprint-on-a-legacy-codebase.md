---
lesson_id: agile100-09
course_id: agile100
pathway: quality-assurance-software-engineer
title: One-Week Sprint on a Legacy Codebase
order: 9
kind: project
competency_ids:
  - D1-S1-C04
  - D2-S1-C01
  - D2-S1-C04
  - D4-S1-C01
  - D4-S1-C03
  - D5-S1-C04
objectives: []
---

## Goal

Working as the QA engineer on a small team (three to five people), run one full one-week Scrum-style sprint against an existing, unfamiliar codebase supplied for this project. By the end of the week, your team will have planned, built, tested, and demoed a small increment of work — and you will have produced a complete, real record of your QA contribution across every ceremony from Lessons 02 through 08.

This project is a rehearsal, at full scale, of everything the course has taught in sequence: orient in the codebase, turn stories into checks, plan testing against the delivery date, collaborate and escalate daily, triage and track defects to closure, and report honestly in review.

## Team setup

- 3–5 learners per team, assigned a shared legacy codebase (an existing small-to-medium JavaScript/Node application, supplied by your instructor or program).
- Roles rotate or are assigned per team norms, but **at least one person per team must hold the QA engineer seat for the full week** — that is the role this project assesses.
- The sprint runs Monday through Friday (or your program's equivalent five working days), with a fixed sprint goal agreed on Day 1 and a review/demo on Day 5.

## Requirements

Your team's sprint must include, at minimum:

1. **Orientation** (Day 1, before planning). Every team member — QA included — completes an orientation pass on the codebase: get it running locally, map the structure, trace one feature end to end, and note anything the documentation gets wrong. QA specifically produces at least one documentation-gap note in the format from Lesson 03.

2. **Backlog refinement and sprint planning** (Day 1). The team refines 3–5 candidate stories against the legacy codebase (new small features, bug fixes, or both — your instructor may supply the initial backlog, or your team may propose it from real gaps found during orientation). As QA, you review each story's acceptance criteria for testability before it's committed, and flag/rewrite any that fail the Lesson 04 testability check. The team then commits to a sprint scope in planning.

3. **A written sprint test plan** (Day 1, due before Day 2 work starts), covering scope, approach, environment/data, schedule, and risks, following the Lesson 05 skeleton, sized against the sprint's five-day delivery window.

4. **Version control discipline** (throughout). All work — code and QA artifacts alike — goes through the team's agreed branch and commit conventions (Lesson 03): no direct commits to the trunk branch, pull requests for merges, commit messages that follow the team's chosen convention.

5. **Daily standups** (every day). QA gives a standup update each day following the Lesson 06 structure (Yesterday/Today/Blocking). At least one standup update during the week must include a real escalation — a blocking defect or risk — using the four-part escalation structure (impact, reproduction, scope/severity, specific ask). If nothing genuinely blocking comes up organically, use the most severe defect you found and escalate it properly regardless of whether it truly blocked the team.

6. **A defect record for every bug found.** Every defect discovered during testing gets filed in your team's tracker (or a shared spreadsheet standing in for one, if no tracker is provided) using the full template from Lesson 07: title, steps to reproduce, expected/actual, environment, severity, priority. Track each through its full lifecycle — at minimum, every filed defect must reach either Verified/Closed or a documented, justified deferral (not left in "New" with no disposition).

7. **A change-validation pass before any story is marked ready for review.** For each story built this sprint, run a regression/smoke check confirming the change works as intended and did not break adjacent functionality — the Lesson 07 "verify, don't just trust the label" habit, applied at the story level, not only the defect level (D4-S1-C03).

8. **Sprint review** (Day 5). Your team demos the sprint's work to an audience (instructor, other teams, or both). As QA, you deliver the structured verification report from Lesson 08 — what's built, what's verified, what's not — as a spoken presentation, not a read-aloud document.

9. **Retrospective** (Day 5, team-only). Contribute at least one specific, evidence-based retrospective note about how testing went this sprint, paired with one concrete suggestion for next time (Lesson 08's format).

## Constraints

- The sprint is one week. Testing time must be planned into that window, not treated as an unbounded extension past Day 5.
- You are working against **existing** code you did not write. Do not rewrite large sections of it "to make it cleaner" — the sprint goal is delivering the committed stories, not refactoring the codebase.
- Every QA artifact (test cases, test plan, defect records, standup notes, review report, retro notes) must be a real, saved document your team can hand to an instructor at the end of the week — not reconstructed from memory afterward.
- Escalations must be genuine attempts to follow the Lesson 06 structure, not a token line added for compliance — a reviewer should be able to read your escalation and understand, without asking you, exactly what was wrong and what you needed.

## Definition of done

Your team's sprint is complete when all of the following exist and are handed in together:

- [ ] Orientation notes, including at least one documentation-gap finding (QA-authored)
- [ ] Sprint test plan (all five sections filled in, dated to the actual sprint window)
- [ ] Test cases traced to acceptance criteria for every committed story
- [ ] At least one defect record per bug found, each carried to Verified/Closed or a documented deferral
- [ ] A daily standup log for QA covering all five days, with at least one properly structured escalation
- [ ] Version-control history showing branch-and-PR discipline for QA artifacts and any QA-authored fixes/tests
- [ ] A change-validation (regression/smoke) note for each story marked ready for review
- [ ] A sprint review verification report (built/verified/not-verified, per story) and evidence it was delivered as a spoken presentation (notes, recording, or instructor sign-off)
- [ ] At least one retrospective note with a paired improvement suggestion

## Hints

- Don't wait until Day 4 to start testing anything — schedule testing against whichever story becomes ready first, exactly as the Lesson 05 worked example did with the smallest bug fix.
- Keep your defect titles and standup language specific from the start; retrofitting vague notes into detailed reports at the end of the week is much harder than writing them clearly the first time.
- If a story's acceptance criteria turn out to be untestable once you're deep into it, don't silently work around the gap — raise it in standup the same day, the way Lesson 06 describes.
- Use the templates from Lessons 04, 05, and 07 directly rather than inventing new formats under time pressure — they exist so you're not designing a process while also running one.
- If your team finishes early, use the extra time to widen regression coverage or deepen retrospective notes, not to add unplanned scope to the sprint.
