---
lesson_id: agile100-02
course_id: agile100
pathway: quality-assurance-software-engineer
title: Agile Values, Frameworks, and the QA Role
order: 2
kind: lesson
competency_ids:
  - D1-S1-C01
  - D5-S1-C04
objectives:
  - Explain Agile values and the QA engineer's role in each ceremony
---

## Why Agile, and why it matters to QA

Agile is a family of ways to build software in short, repeatable cycles instead of one long plan-then-build phase. The four values from the Agile Manifesto set the tone for everything else in this course:

- Individuals and interactions over processes and tools
- Working software over comprehensive documentation
- Customer collaboration over contract negotiation
- Responding to change over following a plan

Notice what this means for a QA engineer specifically. "Working software over comprehensive documentation" does not mean documentation doesn't matter — you'll see in Lesson 03 that stale docs are a real risk you're expected to catch. It means the team's proof of progress is a feature that actually works, verified, not a status report that says it's done. Your job exists precisely at that gap between "the developer says it's done" and "it's actually verified."

Most teams running short, fixed-length cycles use **Scrum**, and that's the framework this course teaches, because a one-week sprint — fixed length, a defined goal, a demo at the end — is a Scrum pattern. **Kanban** is worth knowing about by name: instead of fixed-length sprints, work flows continuously through columns (like To Do → In Progress → Done) with a limit on how much can be "in progress" at once. Kanban suits teams with a steady stream of unpredictable requests, like a support queue. This course doesn't use it, but you'll hear it mentioned, so know the contrast: Scrum batches work into a sprint with a defined goal and a demo; Kanban never stops the belt.

## Scrum roles, briefly

- **Product Owner (PO)** — owns the backlog and decides what gets built and in what order, based on business value.
- **Scrum Master** — protects the team's process, removes blockers, and facilitates ceremonies. Not a manager of people.
- **Development Team** — everyone who builds and verifies the increment: developers, and QA. On a small team, "developer" and "QA" are often overlapping people wearing different hats in different ceremonies. This course treats QA as a first-class member of that team, not an outside gate.

There is no separate "QA role" box in Scrum's org chart. That's deliberate — quality is the whole team's job. But within that shared responsibility, the QA engineer has a distinct **contribution** in every ceremony, and that's what the rest of this lesson — and this course — walks through.

## The sprint cycle and the QA touchpoint in each ceremony

![One sprint cycle with the QA touchpoints marked: refinement, planning, daily standup, testing and triage, review and demo, retrospective](./img/sprint-cycle.png)

A one-week sprint runs through five ceremonies, in this order:

1. **Backlog refinement** — the team looks at upcoming stories before they're planned into a sprint. The QA engineer's job here (covered in full in Lesson 04) is to read each story's acceptance criteria and ask: is this testable as written? A criterion like "the form should work well" isn't; "submitting the form with an empty required field shows an inline error and does not submit" is. Catching untestable criteria here is far cheaper than catching them after the code is built.

2. **Sprint planning** — the team commits to a set of stories for the sprint and breaks them into tasks. The QA engineer's job (Lesson 05) is to size the *testing* work alongside the *building* work — test environments, test data, how much of this needs manual verification versus can lean on existing checks — and make sure that testing effort fits inside the sprint's delivery date, not tacked on after.

3. **Daily standup** — a short (10–15 minute), synchronous check-in: what I did yesterday, what I'm doing today, what's blocking me. The QA engineer's job (Lesson 06) is to surface defects and blockers with enough clarity that the right person can act on them immediately, not bury a release-blocking bug in a vague "found some issues."

4. **Testing and triage, through the sprint** — as developers finish stories, the QA engineer verifies them against the acceptance criteria, files defects for what fails, and tracks each defect through to a verified fix (Lesson 07). This isn't a single ceremony with a fixed time slot — it's continuous work that runs alongside the sprint.

5. **Sprint review (demo) and retrospective** — at the sprint's end, the team demonstrates what was built to stakeholders, and separately, privately reflects on how the sprint went. The QA engineer's job in review (Lesson 08) is to report, precisely, what was verified and what was not — never let "it's built" get presented as "it's tested" when it wasn't. In retrospective, the QA engineer raises what made testing harder or easier this sprint.

## Working across roles, not just alongside them

D5-S1-C04 is about collaborating with cross-functional teams during design and implementation — and Agile ceremonies are exactly where that collaboration happens on a schedule. A QA engineer who only shows up at the end of a sprint to "test the build" has missed most of the value they could add. The earlier you're in the room — refinement, planning — the earlier a problem gets caught, and the cheaper it is to fix. This is sometimes called "shifting left": moving quality activities earlier in the process instead of stacking them all at the end.

Practically, this means: read stories before they're built, not after; ask questions in planning instead of assuming; say something in standup the moment you find a blocker, not at end of day; and treat the retrospective as a real input channel, not a formality. Each of those habits is a small act of professional communication (D1-S1-C01) — describing what you found, to the right person, in a form they can act on — repeated across a sprint's five ceremonies.

## A one-sprint ceremony map, worked example

| Ceremony | When | QA engineer's contribution |
| --- | --- | --- |
| Refinement | Before sprint start | Flag untestable acceptance criteria |
| Planning | Day 1 | Size testing work against the sprint's delivery date |
| Daily standup | Every day | Report status, escalate blockers |
| Testing & triage | Continuous | Verify stories, file and track defects |
| Review / demo | Last day | Report what's verified vs. not |
| Retrospective | Last day | Raise process friction that affected quality |

Keep this table in mind as you move through the rest of the course — each remaining lesson is one row of it, in depth.

## Practice

Pick a ceremony from the table above other than daily standup. Write three to five sentences, addressed to a new teammate, explaining specifically what a QA engineer does in that ceremony and why it matters to the team's outcome — not a general definition of the ceremony, but what *you* would contribute if you were in the room. Then write one sentence naming which Agile value (from the four at the top of this lesson) that contribution most directly serves.
