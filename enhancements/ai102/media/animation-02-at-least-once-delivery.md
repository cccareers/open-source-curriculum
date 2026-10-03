---
course_id: ai102
media_id: ai102-a02
type: animation-storyboard
title: "At-Least-Once: How a Slow Answer Becomes a Duplicate"
target_runtime: "70 sec"
suggested_tool: "Excalidraw+screen recording"
related_lessons:
  - ai102-10
objectives:
  - Receive and send events with webhooks, including verifying and shaping an inbound payload
competency_ids:
  - D2-S1-C03
---

## Concept and misconception it fixes

The misconception: "if a booking shows up twice, the sender has a bug." Webhook delivery is at-least-once. A sender that doesn't get a fast 2xx assumes the delivery failed and retries, so a slow receiver creates its own duplicates. The animation runs the same event twice, first with a slow receiver and then with the ack-first, dedupe-by-event-id design from lesson 10. It can also serve as the source for the course asset `webhook-handshake.png`, which the lesson references and which doesn't exist yet (see review.md).

## Visual language (shapes, colors with color-blind-safe palette, labels)

- Two vertical lifelines (sequence-diagram style): "Booking system (sender)" on the left, "Your scenario (receiver)" on the right. A third lifeline, "Bookings table", appears at far right in scene 4.
- The event is an envelope labelled `evt_01HZ8P2K4M`.
- Timer: a ring around the sender that fills clockwise, labelled "timeout".
- Status: `200` in a box with a check glyph; timeout shown as a broken line with an "X" glyph and the word "timed out".
- Colours (Okabe-Ito): sender blue `#0072B2`, receiver vermillion `#D55E00`, table rows bluish green `#009E73`, duplicate highlight yellow `#F0E442` with a hatched fill so it reads without colour.
- Hand-drawn Excalidraw style, recorded with step-by-step reveals.

## Scenes

| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 0:00-0:07 | Empty lifelines. Title: "One booking, two records?" | Title writes on. | "One booking was created. Two records showed up. Who's to blame?" |
| 2 | 0:07-0:20 | Envelope travels sender -> receiver. Timer ring starts filling. Receiver shows a stack of work: "call model", "write records", "post message". | Work items tick off slowly; ring fills completely before the third tick. | "The sender posts the event and starts a timer. The receiver does all its work before it answers." |
| 3 | 0:20-0:30 | Ring completes: broken return line, "timed out". Sender emits a second envelope with the **same** id. | Second envelope travels across; receiver repeats the work stack. | "The timer runs out. The sender assumes it failed and sends the same event again. That's what it's supposed to do." |
| 4 | 0:30-0:38 | Bookings table appears with two identical rows, the second hatched yellow and labelled "duplicate". | Rows drop in one after the other. | "Two records. Nobody had a bug. A slow receiver plus at-least-once delivery adds up to a duplicate." |
| 5 | 0:38-0:42 | Wipe/rewind effect. Caption card: "Same event. Better receiver." | Reverse playback for 1 s. | "Run it again with the lesson 10 design." |
| 6 | 0:42-0:52 | Envelope arrives; receiver immediately returns `200` with a check. Ring stops a quarter full. Work stack moves to a lane labelled "after acknowledgement". | Return arrow is fast (0.3 s). | "Acknowledge first. The sender is satisfied straight away, and the work happens afterwards." |
| 7 | 0:52-1:04 | A small `ProcessedEvents` table sits beside the receiver. First envelope: lookup "not found", work runs, id written. Then a manual "Resend" button on the sender is pressed: same envelope arrives, lookup "found", flow stops at a filter icon labelled "already processed". Bookings table shows one row. | Lookup arrows pulse. Stop icon appears on the second pass. | "Duplicates still happen, from retries or a resend button. So check the event id against ProcessedEvents. Already seen? Stop. One booking." |
| 8 | 1:04-1:10 | Summary card: "Delivery is at-least-once. Ack fast. Dedupe on the event id." | Fade. | "Delivery is at-least-once. Acknowledge fast. Deduplicate on the event id." |

## Interaction variant (optional)

A step-through (H5P "Image Sequencing" or a simple web stepper) with two toggles: "ack first" on/off and "dedupe" on/off. The learner predicts the number of Bookings rows for each of the four combinations before revealing it (expected: off/off = 2, ack/off = 1 in this run but 2 after a manual resend, off/dedupe = 1, ack/dedupe = 1). That leads into the follow-up question: why do you need dedupe even when you acknowledge first?

## Production notes

- Timeouts vary by sender. Keep the ring unlabelled with a number and say "a timer" in the VO. Lesson 10 gives "between 3 and 30 seconds" as typical, and that range shouldn't be stated as a rule.
- Export a still of scene 7 (with the scene 2-3 path faded in the background) as `webhook-handshake.png` if the course owner wants it to fill the missing lesson asset. The asset description in course.json asks for "acknowledges with 200 immediately, then processes asynchronously; a failed or slow acknowledgement causes the sender to retry, producing a duplicate", which scenes 2-7 cover.
- The race condition (two copies passing the lookup at once) is deliberately left out to keep this to 70 seconds. It's covered in video ai102-v01.
