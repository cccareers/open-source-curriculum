---
course_id: cse270
media_id: cse270-a01
type: animation-storyboard
title: "At-Least-Once: The Duplicate Invocation"
target_runtime: "70 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - cse270-08
  - cse270-09
objectives:
  - Trigger operational work from events and schedules using serverless functions
competency_ids:
  - D4-S1-C04
---

## Concept and misconception it fixes
Learners assume one event means one invocation. The animation shows a lost acknowledgement causing a redelivery, compares a non-idempotent handler (two tickets opened, two tags written, counter double-incremented) with a state-checking handler, and ends on the dead-letter path for a poison event.

## Visual language (shapes, colors with color-blind-safe palette, labels)
- Event: envelope labelled with an event id (`evt-41a7`).
- Event platform: a rounded box "event bus"; function: a lambda-shaped box "handler"; resource: server icon with a tag label.
- Acknowledgement: a small checkmark flying back; lost ack shown as checkmark fading with "ack lost".
- Non-idempotent path: dashed outline + #D55E00; idempotent path: solid outline + #009E73. Every path also labelled "unsafe" / "safe".
- Dead-letter queue: a tray labelled "DLQ".

## Scenes
| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 8s | Instance launches; bus emits `evt-41a7` to handler. | Envelope travels. | "An instance launches without an owner tag. The bus sends an event." |
| 2 | 8s | Handler tags instance `review=pending`, sends ack; ack fades mid-flight. | Checkmark dissolves. | "The handler does its job. Its acknowledgement is lost on the way back." |
| 3 | 8s | Bus, seeing no ack, re-sends `evt-41a7`. Label: "at-least-once". | Second envelope with same id. | "So the platform delivers it again. This is in the contract — at least once, not exactly once." |
| 4 | 12s | Split screen. Left (unsafe): handler opens a second ticket; ticket counter shows 2. Right (safe): handler reads tags, sees `review=pending`, logs "nothing to do". | Left counter ticks; right shows a skip arrow. | "An unconditional handler does it twice. A handler that checks state first does nothing the second time." |
| 5 | 12s | Right side zoom: for a side effect that can't be state-checked (a charge), handler passes `evt-41a7` to the payment API as its idempotency key; the API returns the original result on the repeat. Small inset: a separate "processed ids" table labelled "best effort" with a crash bolt between "charge" and "record id". | Key travels with the request; inset bolt flashes. | "When you can't read the result back — a message, a charge — use the event id as an idempotency key, so the provider itself refuses the duplicate. A separate table of handled ids is only best effort: crash between the side effect and the write, and the retry does it again." |
| 6 | 14s | New event `evt-90c2` with a missing field. Handler fails; bus retries twice (counter 1/3, 2/3, 3/3); envelope drops into DLQ tray. | Envelope bounces then drops. | "A malformed event fails every time. After the retry budget, it lands in the dead-letter queue — where you can see it. Without one, it just vanishes." |
| 7 | 10s | Summary card: "Expect duplicates. Check state. Idempotency keys for side effects. Configure a DLQ." | Fade in. | "Expect duplicates, check state, key your side effects, and give failures somewhere to land." |

## Interaction variant (optional)
A toggle "ack lost" and a toggle "handler checks state"; learners trigger events and watch the resource and counters. A third toggle drops the DLQ to show the event disappearing.

## Production notes
- Keep event ids visible on every envelope; they are the key to scene 5.
- Ties directly to project cse270-x02's `test_second_stop_is_a_no_op`.
