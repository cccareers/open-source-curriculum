---
course_id: node200
media_id: node200-a01
type: animation-storyboard
title: "The Last Seat Race"
target_runtime: "90 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - node200-04
  - node200-07
objectives:
  - Separate data access from request handling in a service
  - Test a service at unit and integration level and report progress
competency_ids:
  - D2-S1-C04
  - D4-S1-C04
---

## Concept and misconception it fixes

Learners believe a transaction alone prevents overselling: "it's inside `db.transaction`, so it's safe." In fact two transactions can both read "4 confirmed, capacity 5", both pass the capacity check, and both insert. `SELECT ... FOR UPDATE` (Knex `forUpdate()`) makes the second transaction wait at the read until the first commits. The animation shows both timelines with and without the lock, and why a single-user test can never reveal the difference.

## Visual language (shapes, colors with color-blind-safe palette, labels)

- Two horizontal swim lanes, "Request A" (solid outline) and "Request B" (dashed outline), sharing a central `events` row card for "Cleanup — capacity 5" and a `registrations` stack showing the confirmed count.
- Okabe-Ito palette: Request A **blue #0072B2**, Request B **orange #E69F00**; lock icon **black** with the text "locked by A"; oversell state **vermillion #D55E00** with a "6 / 5" badge and the word "OVERSOLD".
- Every step is labeled with its code line (`findByIdForUpdate`, `countConfirmed`, `insert`, `COMMIT`), so the animation maps directly to lesson 04's `register` function.

## Scenes

| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 8s | Event card: "Cleanup, capacity 5, confirmed 4". Two attendees tap "Register" at the same moment. | Both requests enter their lanes. | "One seat left. Two people press Register in the same instant." |
| 2 | 15s | **Without the lock.** Both lanes: `BEGIN` → `findById` → `countConfirmed = 4`. | Both read arrows hit the event card at the same time; both show "4 < 5 ✓". | "Without a lock, both transactions read the same count: four. Both pass the capacity check." |
| 3 | 12s | Both lanes: `insert` → `COMMIT`. | The confirmed stack grows to 6; the badge flips to "6 / 5 OVERSOLD". | "Both insert. Both commit. Six people confirmed for five places. Both transactions were valid on their own." |
| 4 | 8s | Text card: "A transaction makes A's steps all-or-nothing. It doesn't stop B from reading at the same time." | Fade. | "A transaction makes each request's steps all-or-nothing. It doesn't make B wait for A." |
| 5 | 18s | **With `forUpdate()`.** A reaches `findByIdForUpdate` first; a lock icon snaps onto the event card, labeled "locked by A". B reaches the same line and stops; a "waiting…" timer ticks. | B's lane pauses visibly. | "With FOR UPDATE, A locks the event row as it reads it. B reaches the same line and waits." |
| 6 | 12s | A: `countConfirmed = 4` → `insert` → `COMMIT`. The lock releases. | The stack goes to 5; the lock icon lifts off. | "A takes the last seat and commits. Only now is the lock released." |
| 7 | 10s | B resumes: reads `countConfirmed = 5` → "5 < 5 ✗" → throws `CapacityError` → `ROLLBACK` → HTTP 409. | B's lane ends with "409 Event full". | "B finally reads the count: five. The check fails, B rolls back, and the attendee gets a clear 409." |
| 8 | 7s | Split screen: a single-user test (one lane only) passes in both versions. | Both show ✓. | "And this is why a test with one request can't catch it. The bug only exists when two requests overlap. Lesson 07's concurrency test fires twenty at once for that reason." |

## Interaction variant (optional)

A two-lane stepper with "Step A" and "Step B" buttons so learners choose the interleaving themselves. A toggle turns `forUpdate()` on or off. With the lock on, "Step B" is disabled while A holds it and the button explains why. This turns the race into something learners can cause, not just watch.

## Production notes

- Code labels must match lesson 04's names exactly: `findByIdForUpdate`, `countConfirmed`, `register`, and the transaction wrapper `db.transaction(async (trx) => …)`.
- Scene 8 ties to lesson 07's QA-1 test ("never oversells capacity under concurrency") and the instruction to remove `forUpdate()` and watch it fail.
- Note for editors: the lock is per event row, so registrations for different events don't wait on each other. Mention it in the caption track if scene time allows.
