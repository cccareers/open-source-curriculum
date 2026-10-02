---
lesson_id: agile200-03
course_id: agile200
pathway: quality-assurance-software-engineer
title: Project Management Tooling and the Sprint Board
order: 3
kind: lesson
competency_ids:
  - D1-S1-C02
  - D2-S1-C04
  - D5-S1-C04
objectives:
  - Run a sprint board in project management software and keep it truthful
---

## A board is a promise, not a decoration

A sprint board is only useful if it tells the truth about the state of the work. A board that says "In Progress" on a ticket nobody has touched in four days is worse than no board at all, because it actively misleads anyone who looks at it — including you, three days from now, trying to remember what's actually left. This lesson is about setting one up correctly and, more importantly, about the discipline of keeping it honest for three weeks straight.

You will use whatever project management software your cohort has access to — an issue tracker with a kanban-style board is the general shape; the specific product does not matter for this lesson. What matters is the structure you put on top of it.

## Setting up the board

Create one board for your capstone project. At minimum, it needs these columns:

```text
Backlog -> Ready -> In Progress -> In Review -> Testing -> Done
```

- **Backlog** — everything you might do, unrefined.
- **Ready** — refined enough to start: it has acceptance criteria and someone could pick it up without asking clarifying questions first.
- **In Progress** — someone is actively working it. If two people are working the same ticket, it should be two tickets or one ticket assigned to a pair.
- **In Review** — code is written and is waiting on a teammate to look at it, per your team's source-control workflow.
- **Testing** — reviewed code that is being checked against its acceptance criteria and the story-level definition of done from Lesson 02.
- **Done** — cleared the definition of done, full stop.

Add a **WIP (work-in-progress) limit** to "In Progress" and "In Review" — a maximum number of tickets allowed in that column at once. A reasonable starting limit is roughly one to two tickets per active team member. WIP limits exist because a board full of half-started work hides problems; a board where everyone finishes one thing before starting the next surfaces blockers immediately, because a stalled ticket is visibly stuck rather than lost in a pile.

## Writing tickets that mean something

Every ticket on the board should be small enough to finish in one to three days and should carry, at minimum:

- A **title** stated as an outcome, not a task: "Login form rejects invalid email" rather than "Fix login."
- **Acceptance criteria** — the specific, checkable conditions that make the ticket Done. These should read like a short test plan already: "Given an invalid email, the form shows an inline error and does not submit."
- A **size or estimate**, however rough — even a T-shirt size (S/M/L) is enough to notice when a ticket is bigger than it looks.
- A **link to the source-control branch or pull request** once work starts, so the ticket and the code stay connected.

Break your charter's in-scope items (from Lesson 02) into tickets now. A charter item like "users can reset their password" should become several tickets: the request form, the email/token flow, the reset form, and the tests for each. If you cannot picture the acceptance criteria for a ticket, it is not ready — leave it in Backlog until it is.

## Running the sprint

Structure your three-week capstone as three one-week sprints, each with the same rhythm:

1. **Sprint planning** (start of week): move tickets from Backlog to Ready to In Progress, matched to the team's real capacity for that week — not the capacity you wish you had.
2. **Daily check-in**: a short standup, even if it's just you and a notes doc when working solo — what moved, what's blocked, what's next.
3. **Sprint review** (end of week): walk through what reached Done and demo it if there's something demoable.
4. **Sprint retrospective** (end of week, brief version now — the full retrospective format is in Lesson 10): one thing that worked, one thing that didn't, one change for next week.

## Keeping the board truthful

This is the part that separates a board that helps from a board that decorates a wall. Three habits keep it honest:

- **Move tickets the moment status changes**, not at the end of the day from memory. A ticket that sits in "In Progress" after you've stopped for the day should move back to Ready or get a note explaining the blocker.
- **Never let "Done" mean "I think it's done."** Done means the definition of done from Lesson 02 is met, full stop — including the testing checkbox. A ticket that passed code review but has no test coverage is not Done; it belongs in Testing.
- **Track outcomes, not just movement.** At the end of each sprint, record how many tickets were planned versus completed, and — once defects start appearing from Lesson 07 onward — how many defects were opened against work from that sprint and how many were resolved by sprint's end. This is what monitoring bug-resolution efforts and tracking outcomes actually looks like day to day: not a single end-of-project count, but a running log you can point to at any moment and say, accurately, "here's where we stand."

A simple weekly outcomes log, kept in a spreadsheet alongside the board, is enough:

| Sprint | Planned | Completed | Defects opened | Defects resolved | Carryover |
| --- | --- | --- | --- | --- | --- |
| 1 | 8 | 6 | 0 | 0 | 2 |
| 2 | 9 | 7 | 4 | 2 | 3 |
| 3 | 6 | 6 | 3 | 5 | 0 |

Carryover from one sprint becomes part of the next sprint's planning capacity — do not silently drop it or silently double-book the week.

## Working across roles

If you are on a team, your board is the shared surface where a developer, a tester, and whoever plays product-owner-for-the-week coordinate without needing a meeting for every handoff. That coordination is the point of D5-S1-C04: collaborating with people doing different work toward the same delivery. Make sure the board reflects that everyone can see what everyone else is doing — a developer should be able to look at Testing and see what's blocking a release; a tester should be able to look at Ready and see what's coming. If you are working solo, simulate this by explicitly noting, in each ticket, which "hat" you're wearing (developer, tester, reviewer) when you move it — it keeps the handoffs deliberate instead of invisible, and it is good practice for the real cross-functional work ahead.

## Practice

Set up your capstone's sprint board in your cohort's project management software with the six columns above and a WIP limit on "In Progress." Break at least eight of your charter's in-scope items into tickets with acceptance criteria and rough sizes, and move at least three of them through Ready and In Progress by the end of this lesson's session. Create the weekly outcomes log as a spreadsheet with the columns shown above, and fill in a Sprint 1 row with your planned ticket count.
