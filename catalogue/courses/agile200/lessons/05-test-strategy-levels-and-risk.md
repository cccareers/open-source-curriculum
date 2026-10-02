---
lesson_id: agile200-05
course_id: agile200
pathway: quality-assurance-software-engineer
title: Test Strategy, Levels, and Risk
order: 5
kind: lesson
competency_ids:
  - D4-S1-C03
  - D4-S1-C04
objectives:
  - Write a test strategy that matches the project's risk and timeline
---

## A strategy is a set of choices, not a wish list

"Test everything" is not a strategy — it is the absence of one, and it is also impossible in three weeks. A test strategy is the short document that says, deliberately: given this project's scope, this project's risk, and these three weeks, here is what we will test, at what level, how often, and what we will accept leaving untested. Writing it down forces the choices to happen on purpose instead of by accident on a rushed Friday.

Your environment from Lesson 04 gives you somewhere to run tests. This lesson gives you the plan for what to run there.

## Test levels, and what each one is for

Most projects test at three levels, and each catches different kinds of problems at a different cost:

- **Unit tests** — check one function or component in isolation, with everything around it faked or stubbed. Cheap to write, fast to run, precise about what broke when they fail. They cannot tell you the pieces work *together*.
- **Integration tests** — check that two or more real pieces of your system work together correctly (your code talking to a real database, for instance). More expensive than unit tests, slower to run, but they catch the seams unit tests can't see.
- **End-to-end (E2E) tests** — drive the application the way a real user would, through the actual interface, against the full running system. The most expensive and slowest to write and run, but the closest to "does this actually work."

![Test levels from unit through integration to end-to-end, showing the trade-off between how many tests run at each level and what each one costs to write and maintain](./img/test-strategy-levels.png)

The shape in that diagram is the point: you want *many* fast, cheap unit tests, a *moderate* number of integration tests around the seams that actually matter, and *few*, carefully chosen end-to-end tests around your most important user paths. A strategy that inverts this — mostly slow E2E tests, few unit tests — will be accurate but too slow and brittle to run every day, which for a three-week sprint means it stops getting run at all.

## Risk: deciding what deserves the most testing

You cannot test every path equally in three weeks, so risk is what decides where your limited time goes. For each major feature or user path in your charter, ask two questions:

1. **How likely is this to break?** New, complex, or fiddly code is more likely to break than a simple, stable path.
2. **How bad is it if it breaks?** Something on your project's single most-important path (the one you wrote down in Lesson 02) is worse to break than something cosmetic.

Score each path roughly high/medium/low on both, and let the combination set your testing depth:

| Path | Likelihood | Impact | Testing depth |
| --- | --- | --- | --- |
| User login | Medium | High | Unit + integration + E2E |
| Password reset email | Medium | Medium | Unit + integration |
| Profile avatar upload | Low | Low | Unit only, or manual spot-check |

A path that is low-likelihood and low-impact is a legitimate place to under-test on purpose — write that decision down instead of leaving it unspoken, so nobody mistakes "we chose not to" for "we forgot."

## Regression and smoke testing

Two terms you need precisely, because Lesson 09 depends on them:

- **Smoke testing** — a small, fast set of checks run after almost any change, confirming the application still starts and its most basic paths still work at all. It answers "did we break the build?" in minutes, not "did we break everything?"
- **Regression testing** — re-running your test suite (or a meaningful subset of it) to confirm that a *new* change didn't break *existing*, previously-working behavior. This is how you test system modifications before they go live: you are not just checking that the new thing works, you are checking that the old things still do.

Plan for both explicitly: smoke tests run on every merge, a fuller regression pass runs before each weekly release checkpoint from your Lesson 02 timeline.

## The test strategy skeleton

Write your strategy as a short document — not a chapter, a page or two — using this skeleton:

```text
Test Strategy: <project name>

1. Scope
   In scope for testing: <list, matches charter in-scope items>
   Out of scope: <list, and why>

2. Test levels
   Unit: <what gets unit-tested, what tooling>
   Integration: <what seams, what tooling>
   End-to-end: <which user paths, what tooling>

3. Risk-based priorities
   <table like the one above>

4. Schedule
   Week 1: <e.g., unit tests alongside new code; environment finalized>
   Week 2: <e.g., integration + E2E for high-risk paths; smoke test on every merge>
   Week 3: <e.g., full regression pass; release verification>

5. Entry / exit criteria
   Entry: <what must be true before testing a feature starts, e.g. code reviewed>
   Exit: <what must be true to call testing done, e.g. no open blocker defects>

6. Known limitations
   <what you are deliberately not testing, and the risk you're accepting>
```

Fill this in against your Lesson 02 charter and timeline, and your Lesson 04 environment and tooling. The "Known limitations" section matters as much as any other — a strategy that pretends to cover everything is less trustworthy than one that names its gaps.

## Practice

Write your capstone's test strategy using the skeleton above. Score at least five features or user paths from your charter on likelihood and impact, and assign each a testing depth. Define your project's smoke test (the specific handful of checks that run on every merge) and your regression pass cadence, and slot both into the week-by-week schedule alongside your Lesson 02 timeline. Have a teammate or your instructor read the "Known limitations" section specifically and tell you whether any listed gap concerns them — revise the strategy based on that feedback.
