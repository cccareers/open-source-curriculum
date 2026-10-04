---
lesson_id: agile200-02
course_id: agile200
pathway: quality-assurance-software-engineer
title: Scoping a Capstone and Defining Done
order: 2
kind: lesson
competency_ids:
  - D1-S1-C02
  - D4-S1-C04
  - D5-S1-C03
objectives:
  - Scope a capstone project and write a definition of done the team agrees on
---

## Why scope comes before anything else

Every lesson after this one assumes a project exists that is small enough to finish in three weeks and specific enough to test. If the scope is vague, the test strategy in Lesson 05 has nothing to attach to, the automated tests in Lesson 06 have no stable target, and the release call in Lesson 09 has no criteria to check against. Scoping is the first QA act of the capstone, even though it does not look like testing yet: a QA engineer who cannot say what "finished" means cannot say what "passing" means either.

Your job this lesson is to produce two documents your team (or, if you are working solo, you and your instructor) actually agree on: a **project charter** and a **definition of done**. Both are ordinary office documents — the same kind you have produced in earlier courses — but the discipline of writing them precisely is a QA skill in its own right.

## Choosing a capstone project

A good capstone project for this course has four properties:

1. **It produces a running application**, however small — a web app, an API, a CLI tool. You cannot build a test environment (Lesson 04) or automated tests (Lesson 06) around something that does not run.
2. **It has a codebase that will keep changing** for the full three weeks. A project that is "basically done" on day one gives you nothing to regression-test.
3. **It has at least one real, reachable user** — a classmate, an instructor, a community member — who can report an actual problem in Lesson 08. A project with no real user turns that lesson into fiction.
4. **It fits inside three weeks of part-time-equivalent effort.** Err toward smaller. A project that is too big produces rushed tests and a shaky release; a project that is too small produces an easy release and nothing to regression-test against. When in doubt, cut a feature, not the testing.

Write down, in one or two sentences each: what the product does, who it is for, and the single most important thing it must do correctly. That most-important thing becomes the anchor for your test strategy later — keep it visible.

## The project charter

A charter is a short document — one page is plenty — that a stakeholder (your instructor, a product owner, a client) can read and sign off on before work starts. Use whatever office tool you have available (a word processor or a shared document) to produce it in a clean, shareable format; that itself satisfies the "produce a correct workplace document" competency this lesson tags. A charter should contain:

- **Project name and one-sentence purpose.**
- **In scope** — a short bullet list of what the team will build.
- **Out of scope** — an equally short list of what the team will explicitly *not* build. This list is not optional. Every project you have seen slip a deadline slipped it because "out of scope" was never written down.
- **Milestones** — three weekly checkpoints matching the sprint structure you will use starting in Lesson 03.
- **Roles** — who owns what, even on a solo project (you still wear more than one hat: developer, tester, release manager).

## Writing a definition of done

A definition of done (DoD) is the checklist that turns "I think it's finished" into "we can verify it's finished." It applies at two levels, and conflating them is the most common mistake:

- A **story-level DoD** — the bar every individual feature or ticket must clear before it moves to "done" on the board (Lesson 03 covers the board itself).
- A **release-level DoD** — the bar the whole project must clear before you call the capstone shipped (Lesson 09 covers verifying against it).

A workable story-level DoD template looks like this:

```text
A story is Done when:
- [ ] Acceptance criteria in the ticket are met
- [ ] Code is merged following the team's source-control workflow
- [ ] At least one automated test covers the new behavior
- [ ] Manual smoke test passed in the test environment
- [ ] No known defect above "minor" severity is open against it
- [ ] Any user-facing change is reflected in the documentation
```

A release-level DoD adds project-wide criteria: every "in scope" charter item is done, the regression suite passes, the defect database has no open blocker or critical defect, and the handoff documentation (Lesson 09) exists. Write both now, even in draft form — you will revise the release-level DoD once your test strategy (Lesson 05) tells you what "risk" actually means for this project, but a draft written today is what makes that later revision possible instead of starting from nothing.

## Feeding the schedule: a first-pass test timeline

You are not writing the full test strategy yet — that is Lesson 05 — but D4-S1-C04 asks you to plan test schedules and strategies against project scope and delivery dates, and that planning has to start when the scope does, not two weeks in. Right now, produce a rough weekly skeleton, in a spreadsheet or table, that blocks out when testing activities will happen relative to development:

| Week | Development focus | Testing focus |
| --- | --- | --- |
| 1 | Core feature(s), environment setup | Environment stood up, test strategy drafted |
| 2 | Remaining features, integration | Automated tests written alongside code, defects logged |
| 3 | Stabilization, bug fixes | Regression pass, release verification, handoff |

This table is deliberately coarse. Its job is to make sure testing is never an afterthought squeezed into the last two days — a mistake almost every first-time capstone team makes.

## Getting input before you lock scope

Before you finalize the charter and DoD, put them in front of someone else — a teammate, your instructor, a peer reviewer — and walk them through it. This is a small, low-stakes design review, and giving and receiving that kind of input is the skill D5-S1-C03 names: participating in a design review by contributing to requirements, schedule, or risk before commitments harden. Come prepared with two or three specific questions rather than "does this look okay?" — for example, "is three weeks realistic for this scope?" or "did I miss an out-of-scope item that's actually risky?" Useful review input is specific enough that the presenter can act on it immediately; vague praise or vague worry does not count.

## Practice

Produce your capstone's project charter and story-level definition of done as a shareable document (word processor or equivalent), plus a one-week-per-row testing timeline as a spreadsheet or table. Then schedule a 15-minute review with a teammate or your instructor: present the charter and DoD, ask at least two specific scoping questions, and record their feedback as a short list of concrete revisions you will make before Lesson 03. Bring the revised charter, DoD, and timeline forward — you will use them for the rest of the course.

## Check your understanding

1. Why is the "Out of scope" list not optional in a charter?
2. A ticket passed code review but has no automated test. Under the story-level DoD template above, is it Done?
3. What is the difference between a story-level and a release-level definition of done?

*Answers:* (1) Without it, scope quietly grows and deadlines slip; writing it down makes "no" a recorded decision. (2) No: "At least one automated test covers the new behavior" is unchecked. (3) Story-level applies to each ticket; release-level applies to the whole project (all in-scope items done, regression passing, no open blocker or critical defects, handoff docs).
