---
course_id: agile200
title: "Agile Project Implementation — Enhancement Review"
reviewed_lessons: 11
status: draft
---

## Summary
A well-structured QA capstone: each lesson produces an artifact the next one depends on (charter and DoD, board, environment, strategy, suite, defect database, release), and the recurring examples (signup duplicate email, blank-password login, password reset, the outcomes log) are consistent. Technical content is light by design, and that is where the few errors were: an E2E snippet that looks like Playwright but would not work in it, an npm flag that doesn't exist, and a test helper that invites flaky collisions. Biggest opportunity: a concrete, runnable reference suite so learners can practice "real bug or changed on purpose" before the live capstone.

## Clarity issues
| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| agile200-06 | "Writing at each level" | E2E example used `page.fill("Email", ...)` and `page.click("Log in")`; in Playwright (which the `getByText`/`toBeVisible` calls imply) those take CSS selectors, so the snippet would fail and contradicts the "target by label and role" advice. | Rewrote with `getByLabel` and `getByRole` and labelled it as Playwright syntax. | Applied |
| agile200-06 | "Building a small test utility" | `makeTestUser` uses `Date.now()`, which collides for two calls in the same millisecond, a flakiness source the same lesson warns about. | Added a caution and a counter-based alternative. | Applied |
| agile200-04 | "Installing and configuring the recreation" | `<package manager> install --frozen-lockfile` doesn't exist for npm (`npm ci` is the equivalent). | Added the per-package-manager commands. | Applied |
| agile200-07 | "What a defect record needs" | Severity scale (Blocker/Critical/Major/Minor/Trivial) differs from ops100 lesson 08's four-level scale (Critical/High/Medium/Low) used earlier in the pathway. | Proposed: add one sentence mapping the two scales, or align them. | Proposed |
| agile200-05 | "Test levels, and what each one is for" | Image `./img/test-strategy-levels.png` missing (no course has an `img/` folder yet). | Proposed: export from animation a01 scene 1. | Proposed |
| agile200-11 | "Requirements" item 5 | "Demonstrably maintained at least twice" doesn't say what counts as maintenance; learners may count adding new tests. | Proposed: "updated or removed an existing test in response to a code change, in the same commit". | Proposed |
| agile200-08 | "Starting from the org, not just the ticket" | The org-structure part of D1-S1-C01 is mentioned but has no worked example (who to tell, in what order). | Proposed: add a two-line example routing a stakeholder vs a user report. | Proposed |

## Depth and coverage gaps
- "Write and maintain automated test scripts as the code changes": no runnable example of the "real bug vs changed on purpose" decision; project x01 and video v01 provide one with a verified suite.
- "Keep a defect database a team can actually use": no example of a defect that *reopens*, which is the most useful signal the lesson describes; project x01 milestone 5 and video v01 cover a reopen.
- "Write a test strategy that matches the project's risk and timeline": no guidance on estimating suite run time or setting a smoke-test time budget; animation a01 addresses why it matters.
- "Stand up a test environment that represents how the project will really run": no example seed script; a 15-line example in Node would make "repeatable" concrete.
- "Verify a release and hand it over with accurate documentation": rollback plan is a checklist item with no example of what one looks like for a small static or Node app.
- "Present finished work and run a retrospective": strong; examples are grounded in numbers.
- Added "Check your understanding" to lessons 02 to 10.

## Proposed additional projects
- x01 Signup Regression Guard: From Defect Record to Maintained Test (drafted; `node --test` suite verified: starter fails exactly the two DEF tests, reference fix passes 7/7).
- Triage table-top: a stack of 12 realistic defect reports (some duplicates, some unreproducible, some usability gaps) to triage as a team in 30 minutes, with a facilitator answer key. Not drafted.
- Release go/no-go case file: a release checklist with two red items and a stakeholder pushing to ship; learner writes the conclusion and the risk-acceptance note. Not drafted.
- User-report interview role-play with scripted "user" cards that withhold the key step until asked. Not drafted.

## Video and animation opportunities
- Red test: real bug or changed on purpose (lessons 06 to 07, screencast). Drafted: `media/video-01-red-test-bug-or-changed-behavior.md`.
- Pyramid vs ice-cream cone across three sprint weeks (lessons 05 to 06, explainer animation). Drafted: `media/animation-01-pyramid-vs-ice-cream-cone.md`.
- Structured user-report interview, good vs bad (lesson 08, talking head with role-play). Not drafted.
- Release checklist walkthrough ending in a documented no-go (lesson 09, screencast). Not drafted.
- Board truthfulness: a week of tickets moving, with a stale "In Progress" card exposed (lesson 03, explainer animation). Not drafted.

## Assessment ideas
- Severity vs priority sorting exercise with justification.
- "Bug or changed on purpose?" scenario cards (ticket context plus a failing test diff).
- Rubric for the test strategy document: scope, levels, risk table, schedule, entry/exit, limitations.
- Retrospective quality check: every item must cite an outcomes-log or defect-database number.

## Changes applied in this pass
- `catalogue/courses/agile200/lessons/04-building-the-test-environment.md`, "Installing and configuring the recreation": added the correct lockfile-install command per package manager.
- `catalogue/courses/agile200/lessons/06-writing-and-maintaining-automated-test-scripts.md`, "Writing at each level": corrected the E2E example to label/role locators in Playwright syntax.
- `catalogue/courses/agile200/lessons/06-writing-and-maintaining-automated-test-scripts.md`, "Building a small test utility": added the `Date.now()` collision caution and a counter alternative.
- Lessons 02 to 10: appended a "Check your understanding" block with answers.

## Open questions for the course owner
- Which browser automation library should the course name, if any? The lesson stays tool-neutral, but its example is now explicitly Playwright-style.
- Should agile200 align its defect severity scale with ops100's, since learners meet both?
- The only second video and second project for this course were not drafted in this pass (time); candidates are listed above.
