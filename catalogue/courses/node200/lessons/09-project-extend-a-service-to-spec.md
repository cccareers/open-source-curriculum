---
lesson_id: node200-09
course_id: node200
pathway: software-developer
title: 'Project: Extend a Service to Spec'
order: 9
kind: project
competency_ids:
  - D2-S1-C04
  - D4-S1-C02
objectives: []
---

## The goal

Take the events board service you have built across this course and extend it to meet a specification you did not write, then prove the extension works and close a defect that has already been reported against it.

That is the whole deliverable, and the shape of it is deliberate. Up to now you have decided what to build. Here the requirements arrive as a document, in someone else's words, with the ambiguities they happened to leave in it. Your job is to read it accurately, record what it asks for, plan the work, build it inside the module boundaries you already have, demonstrate with tests that each requirement is met, and handle a defect the way a team handles one — tracked, fixed, re-tested, and reported.

Budget six hours. If you are three hours in and nothing is passing, stop and read the hints section rather than pushing on.

## What you start from

The events board as it stands at the end of lesson 08:

- A layered Express application: `createApp()` in `app.js`, routers per resource, services holding the rules, repositories holding the SQL, and configuration read once from the environment.
- PostgreSQL through Knex, with committed migrations and seeds for `organizers`/`accounts`, `events`, `registrations`, and `user_sessions`.
- Registration with a transactional capacity check, a row lock, and a unique constraint on the event and attendee pair.
- Session authentication with argon2 hashes, `httpOnly` cookies, `requireAuth`, CSRF tokens on state-changing forms, and ownership checks in the services.
- Zod validation at the edge, a typed error hierarchy, and one error handler producing a consistent body with a request id.
- A `node:test` suite with unit and integration levels, factories, and a test database.
- Structured `pino` logging with request ids and split liveness and readiness checks.

If any of that is missing or half-finished, fix it first. Building a new feature on top of a broken foundation means every failure has two possible causes.

## The specification

This is the document you build against. Read it the way lesson 03 taught you to: literally, looking for what it does not say.

```text
SRS 4.7 — Waitlist and Cancellation                       (version 1.0)

Purpose
  Popular events fill quickly and attendees frequently cancel. Organizers
  report that seats freed by cancellations go unused because there is no way
  for an attendee to express continued interest after an event fills.

Definitions
  Confirmed registration — a registration holding a seat.
  Waitlisted registration — a registration holding a position in a queue, with
    no seat, that may later become confirmed.
  Position — an attendee's place in the waitlist queue for one event, counted
    from 1, with 1 being the next to be promoted.

4.7.1  When an attendee registers for an event that has reached capacity, the
       system shall create a waitlisted registration rather than rejecting the
       request.
4.7.2  Waitlist position shall be determined by the time the waitlisted
       registration was created, earliest first.
4.7.3  An attendee shall not hold more than one registration of any status for
       the same event.
4.7.4  An attendee shall be able to cancel their own registration for an event
       at any time before the event starts.
4.7.5  An attendee shall not be able to cancel a registration for an event that
       has already started.
4.7.6  When a confirmed registration is cancelled, the system shall promote the
       waitlisted registration with position 1 for that event to confirmed.
4.7.7  When a waitlisted registration is cancelled, no promotion shall occur and
       the positions of later waitlisted registrations shall move up by one.
4.7.8  An attendee viewing an event for which they hold a waitlisted
       registration shall be shown their current position.
4.7.9  The event detail page shall show the number of confirmed places remaining
       and, when the event is full, the number of attendees waitlisted.
4.7.10 An organizer shall be able to view, for their own events only, the list
       of confirmed attendees and the list of waitlisted attendees in position
       order.
4.7.11 Cancellation and promotion shall be recorded such that an organizer can
       later determine when each registration changed status.
4.7.12 An attendee should be notified when they are promoted from the waitlist.

Non-functional
4.7.13 Promotion shall occur within the same request that processes the
       cancellation.
4.7.14 No event shall ever hold more confirmed registrations than its capacity,
       under any sequence of concurrent requests.
4.7.15 The event detail page shall render in under 800ms at the 95th percentile
       with 5,000 registrations on the event.

Out of scope for this release
  Organizer-initiated cancellation of an attendee's registration.
  Any change to how events are created or edited.
  Email delivery infrastructure.
```

Read that twice before you write anything. There are at least four places where two requirements interact in a way neither states alone, at least two places where the wording is genuinely ambiguous, and one requirement whose priority word does not match its cost. Finding them is part of the assessment.

## The reported defect

Support has raised this against the current release. It is real, it is reproducible, and it must be closed as part of this project.

```markdown
**DEF-204 — Event detail page shows the wrong number of places remaining**

Severity: Medium
Environment: staging, v2.5.0
Reported by: K. Osei (support), 2026-06-20, from 2 organizer reports

Steps to reproduce
1. Create an event with capacity 10.
2. Register 4 attendees.
3. Cancel 2 of those registrations.
4. Load the event detail page.

Expected: "8 places remaining".
Actual:   "6 places remaining".

Notes: organizers say the number "never goes back up". The attendee list on the
organizer page shows the correct 2 attendees, so the data looks right and the
count looks wrong.
```

Do not fix this by guessing. Track it, reproduce it with a failing test first, then fix it, then show the test passing. The report tells you the symptom, not the cause, and the cause is your job to establish.

## Requirements for your deliverable

These are numbered so a reviewer can grade them one at a time. Each states what must be true, not how to type it.

**D1 — A requirements register exists.** `docs/requirements/waitlist.md` contains a register covering every clause of SRS 4.7, in the lesson 03 format: id, source clause, actor, requirement, priority, verified-by, status. One behaviour per row. Every row cites its clause. Implied requirements — including any prohibition the document only implies — appear as their own rows, marked as implied.

**D2 — Ambiguities are recorded, not silently resolved.** An open-questions table lists at least four genuine ambiguities or gaps in SRS 4.7, each classified as blocking, design-shaping, or gap-filling, and each carrying the answer you propose. An assumptions log records every gap you proceeded past, what you assumed, and what it would cost if the assumption is wrong. A reviewer must be able to disagree with an assumption without reading your code.

**D3 — A work plan exists and was followed.** A bottom-up work plan in the lesson 02 table format: layer, change, dependency, estimate. Committed before the implementation begins, and updated — not rewritten — as reality changes it. Where an estimate was wrong, the row shows both the original and the actual.

**D4 — The schema change is a migration.** Any new column, table, index, or constraint arrives as a new migration file that runs forward and back cleanly. No existing migration is edited. `npm run db:reset` rebuilds a working database from nothing.

**D5 — The feature works within the existing boundaries.** No SQL in a route or a service. No `req` or `res` in a service. No business rule in a route handler. No repository imported by a router. Your layer-check script still passes.

**D6 — Capacity holds under concurrency.** 4.7.14 is absolute. Whatever you build must keep the confirmed count at or under capacity when many requests arrive at once, including the case where cancellations and registrations interleave. State in your design note which mechanism guarantees it and why.

**D7 — Every mandatory requirement has a test that names it.** Each 4.7 clause marked `shall` has at least one automated test whose name contains its clause number, and the test fails if the behaviour is removed. Unit tests cover the rules; integration tests cover the endpoints through `createApp()`.

**D8 — Authorization is enforced and tested.** 4.7.10 restricts organizers to their own events, and 4.7.4 restricts cancellation to the attendee's own registration. Both are enforced in the service, both return the correct status, and both have a test that asserts the forbidden operation *did not take effect* in the database — not merely that the status code was right.

**D9 — Validation and errors follow the existing model.** New inputs are validated at the edge with a schema. Failures use the existing typed errors and the existing response shape with a request id. No new error format is introduced.

**D10 — A quality risk register covers the feature.** `docs/quality/waitlist-risks.md` with at least six scored rows, each with a named control and a verified-by. At least two rows must trace to non-functional requirements 4.7.13 to 4.7.15. At least one accepted risk with no control, marked as accepted.

**D11 — DEF-204 is tracked, fixed, and re-tested.** A defect record in `docs/quality/def-204.md` containing: your reproduction, the root cause you established and the evidence for it, the fix, the test that failed before it and passes after, and a statement of whether the same cause exists anywhere else in the codebase. The failing test must be committed *before* the fix, in its own commit, so the history shows the order.

**D12 — A test run report exists.** `docs/quality/test-run-<date>.md` in the lesson 07 format: command, totals, duration, commit, a per-requirement table covering every 4.7 clause, and honest rows for anything not started or deferred.

**D13 — The service is diagnosable.** Promotion and cancellation each emit one structured log line at the decision point, carrying the request id, the event id, the registration id, and the values the decision was made from. No secret appears in any log line.

**D14 — A change note records what must not change.** A short section in `docs/design-notes.md` listing the behaviour other code now depends on — response field names, status codes for each outcome, the meaning of each status value — so the next person knows what is a breaking change.

## Constraints

- **Extend, do not rewrite.** The existing structure, stack, and conventions stay. Postgres through Knex, `node:test` with supertest, sessions in cookies, zod at the edge. A rewrite is an automatic fail regardless of how good the result is.
- **The specification is the authority, not your preference.** Where you disagree with 4.7, record the disagreement in the open-questions table and build what it says. Where it is silent, state the assumption and proceed.
- **No new dependency without a written reason.** If you add one, one sentence in the design note on what it does that the existing stack cannot.
- **Every commit leaves the suite green,** except the single commit that deliberately introduces the failing test for DEF-204, whose message must say so.
- **No secrets, no credentials, no real personal data** in the repository or the logs.
- **Work on a branch** off your lesson 08 state, and keep commits small enough to review one at a time.

## Definition of done

You are done when all of the following are true, checked in this order:

1. From a clean clone: `npm ci`, `cp .env.example .env`, `npm run db:reset`, `npm run dev` produces a working service, using only the steps in your README.
2. `npm test` passes from a clean checkout against a freshly migrated test database, with no test skipped that is not explicitly marked deferred in the run report.
3. Every `shall` clause in SRS 4.7 appears in your requirements register with a status, and every mandatory one has a passing named test.
4. `grep -rn "4.7." test/` reconstructs your traceability matrix without opening a file.
5. The concurrency test for 4.7.14 fails when you remove the mechanism protecting it, and passes when you restore it. You have seen both.
6. DEF-204's test fails on the commit before the fix and passes on the commit after. The history shows it.
7. The layer-check script passes and no route imports a repository.
8. A peer can read your open-questions table and tell you which of your assumptions they would challenge — and you have recorded their answer.
9. All twelve document deliverables named above are committed under `docs/`.
10. `git log --oneline` reads as a sequence someone could review, not one commit called "waitlist".

## Hints

**Start with the register, not the code.** An hour spent on D1 and D2 saves two on rework. The ambiguities are the point of the exercise, and you will find most of them by writing each clause out as a row and trying to state its acceptance criterion.

**Look for the interactions.** 4.7.3 and 4.7.4 together raise a question about re-registering after cancelling. 4.7.6 and 4.7.14 together are a concurrency problem, because promotion is a write that increases the confirmed count. 4.7.2 and 4.7.7 together determine whether position is stored or derived. 4.7.9 and 4.7.15 together are a performance constraint on how you count. None of those is stated in any single clause.

**Think hard about how position is represented.** Storing an integer position on each row means every cancellation rewrites many rows and invites drift. Deriving position from creation time at read time means no rewrites at all. One of those makes 4.7.7 nearly free. Whichever you pick, write down why in the design note — a reviewer will ask.

**Status is probably not a boolean.** You have `confirmed` and `waitlisted` already. Cancellation needs a third state, and 4.7.11 wants the change recorded in time. Deleting the row loses the history the requirement asks for.

**Promotion is the risky operation.** It reads the queue, picks one, and writes — while a registration request may be doing the same thing. Whatever guaranteed capacity in lesson 04 is the tool you need again, applied to the whole cancel-and-promote sequence, not to each half.

**Write the concurrency test early.** It is the test most likely to change your design, and finding that out on hour five is expensive. Fire cancellations and registrations at one event simultaneously, not just registrations.

**For DEF-204, reproduce before you theorise.** The report gives you exact steps; turn them into a failing integration test first. The note that the attendee list is right while the count is wrong is a strong clue about where to look — one of those two reads a different thing from the other. Then ask the question the report does not: is the same mistake made anywhere else?

**Reuse the lesson 08 method on anything that surprises you.** Symptom, observation, hypothesis, test. If the concurrency test fails intermittently, the log line from D13 with the confirmed count and capacity at the decision point will tell you more than reading the service will.

**Do not build 4.7.12.** It is the only `should` in the document and it needs infrastructure that is explicitly out of scope. Record it as deferred with a reason, and note the mismatch between its priority word and its cost — that observation is worth marks.

**Leave time for the documents.** D10 to D14 are half the assessment and they are the half people run out of time for. If you are short, a complete register, risk assessment, defect record, and run report with a smaller feature beats a complete feature with no paperwork.

## How this is assessed

Two competencies are being judged, and they are separable.

The first is whether you can **build a working feature to a specification**: it does what 4.7 says, inside the existing structure, with the concurrency and authorization properties holding, and with tests that would catch a regression. A feature that works but has no test proving 4.7.14 has not demonstrated it.

The second is whether you can **take a reported issue through to closure with the team**: reproduce it, establish the cause with evidence rather than assertion, fix it, prove the fix with a test that failed first, check whether the same cause exists elsewhere, and report it clearly enough that a senior engineer could verify your work without repeating it.

Getting the waitlist working satisfies the first and not the second. Both are graded.
