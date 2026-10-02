---
lesson_id: agile200-11
course_id: agile200
pathway: quality-assurance-software-engineer
title: Capstone Sprint Over Three Weeks
order: 11
kind: project
competency_ids:
  - D1-S1-C04
  - D2-S1-C04
  - D3-S1-C04
  - D4-S1-C03
  - D5-S1-C02
  - D5-S1-C04
objectives: []
---

## Goal

Run your capstone project as a real, three-week agile sprint from first commit to verified release, and be graded on the QA artifacts it produces: the test environment, the test strategy, the automated test suite, the defect database, and the verified, documented release — not the feature list. This project re-runs, for real and under time pressure, everything the course has taught: scoping, board discipline, environment building, strategy, automated testing and its maintenance, defect tracking, real-user diagnosis, release verification, and a closing demo and retrospective.

## Requirements

By the end of three weeks, you must produce and be able to walk through:

1. **A scoped project with an agreed definition of done** (Lesson 02), reviewed by a teammate or your instructor before work began in earnest.
2. **A sprint board** (Lesson 03) in your cohort's project management software, run across three weekly sprints, with a weekly outcomes log showing planned versus completed tickets and, from week 2 onward, defects opened versus resolved.
3. **A representative test environment** (Lesson 04), documented well enough that someone else can rebuild it from your instructions alone.
4. **A written test strategy** (Lesson 05) with risk-based priorities, a smoke test definition, and a regression cadence, followed for the duration of the sprint — not written once and ignored.
5. **An automated test suite** (Lesson 06) spanning at least unit and integration levels (end-to-end if your project has a UI), demonstrably maintained at least twice across the three weeks in response to real code changes — meaning you can point to a specific commit where a test was updated, not just written once and left alone.
6. **A defect database** (Lesson 07) with a real, non-trivial history: multiple defects filed with reproducible steps, triaged for severity and priority, tracked through to verified closure, with at least one Major-or-higher defect resulting in a regression test that guards against it recurring.
7. **At least one diagnosed problem from a real user or stakeholder** outside your immediate team (Lesson 08), captured with the structured interview approach and either filed as a reproducible defect or written up as a concrete usability recommendation.
8. **A verified, released build** (Lesson 09) with a completed release checklist, a version-control tag, a documentation review pass, and a handoff package.
9. **A demo and retrospective** (Lesson 10): a rehearsed live presentation of the working product and a completed four-part retrospective grounded in your outcomes log and defect database.

Throughout, work with whatever collaborators are available to you — teammates if you're on a team, or your instructor and peers standing in for stakeholders if you're solo — the same cross-functional coordination from Lesson 03 and Lesson 05's design-review habits, sustained for three full weeks rather than a single session.

## Constraints

- **Three weeks, structured as three one-week sprints**, each with its own planning, daily check-ins, review, and end-of-week retro touchpoint (the full retrospective happens once, at the end, per Requirement 9).
- **The codebase must keep changing throughout.** A project that's feature-complete in week one with nothing left to build gives your test suite nothing to maintain against — if that happens, add scope rather than coast.
- **The real-user diagnosis (Requirement 7) needs a genuine outside person**, not a teammate role-playing a user. Arrange this early — do not leave it to the last few days, when nobody has time to actually try your product.
- **No specific commercial tool is mandated.** Use whatever issue tracker, test runner, and browser automation library your cohort already has access to.
- **Stay inside your Lesson 02 scope boundaries** unless you explicitly revise and re-review them. Scope creep in week two is the most common reason capstones arrive at week three with an unverifiable release.

## Definition of done

The capstone is done when every item in Requirements 1–9 exists, is current (not a stale artifact from week one), and you can walk a reviewer through each one with specific evidence — a real defect ID, a real commit where a test was updated, a real outcomes-log number — rather than a general description of what you intended to do. A release that has not been verified against the Lesson 09 checklist is not done, regardless of whether the software technically runs.

## Hints

- **Start the environment and board in week one, not "when there's time."** Everything downstream depends on both existing early.
- **Recruit your real user in week one.** Confirming someone's availability for week three, in week three, is too late.
- **Update tests in the same sitting you change the code they cover.** Letting test maintenance pile up is the single fastest way to lose the "keep them current" competency this project is built around.
- **Triage defects on a fixed schedule** (twice a week, same days each week) rather than reactively — it's the difference between a defect database and a pile of unread tickets.
- **Write your release verification conclusion and retrospective as you go**, in short notes, rather than trying to reconstruct three weeks of evidence from memory on the last day.
- **If something in your Lesson 05 strategy turns out to be wrong** — a risk you underrated, a level you skipped that turns out to matter — say so explicitly in your retrospective rather than quietly working around it. A revised judgment, explained, is stronger evidence of QA skill than a plan that happened to be right.
