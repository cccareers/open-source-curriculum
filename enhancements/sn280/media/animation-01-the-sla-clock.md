---
course_id: sn280
media_id: sn280-a01
type: animation-storyboard
title: "The SLA Clock: Start, Pause, Stop, Breach"
target_runtime: "90 sec"
suggested_tool: "Manim"
related_lessons:
  - sn280-08
objectives:
  - Define SLAs, OLAs, and schedules that measure the commitment the business actually made
competency_ids:
  - D2-S1-C04
---

## Concept and misconception it fixes
An SLA is a timer whose behaviour depends on a schedule and on pause conditions, and nothing about that is visible on an incident form. Misconceptions: "eight hours means eight hours from now," "a breach stops the clock," "any On Hold should pause it," and "business and actual elapsed time are the same number." The animation runs the lesson 8 worked example — a P2 logged at 16:00 on Friday against an 08:00–18:00 schedule — and then a P1 with a pause.

## Visual language (shapes, colors with color-blind-safe palette, labels)
- A horizontal **calendar strip** Friday → Monday, with working spans as solid blocks (blue `#0072B2`, label "in schedule") and non-working time hatched grey (`#999999`, diagonal hatch, label "outside schedule").
- Two progress bars beneath: **Business elapsed** (blue, solid) and **Actual elapsed** (orange `#E69F00`, dotted outline).
- Pause intervals: vertical striped band (reddish purple `#CC79A7`, pause icon ⏸, label "Paused: Awaiting Caller").
- Breach marker: vermillion `#D55E00` flag with "BREACH" text; warning markers at 50%/75% as small bell icons with percentage text.
- All states carry icon + text; no information by color alone.

## Scenes
| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 0–8s | Incident card "P2 · logged Fri 16:00". Text: "Resolve within 1 business day." | Card slides in. | "The contract says one business day. When is this one actually due?" |
| 2 | 8–22s | Calendar strip appears: Fri 08–18 blue, Fri 18:00–Mon 08:00 hatched, Mon 08–18 blue. A playhead starts at Fri 16:00. | Playhead moves; business bar fills only over blue; actual bar fills continuously. At Fri 18:00 business bar shows "2 h". | "The SLA counts only time inside the schedule. Two hours on Friday afternoon…" |
| 3 | 22–34s | Playhead crosses the weekend; business bar frozen at 2 h; actual bar keeps growing to "64 h". | Fast-forward effect over hatched area. | "…nothing over the weekend — while the actual clock keeps running…" |
| 4 | 34–44s | Monday: business bar continues from 2 h to 8 h at Mon 14:00; due marker drops at 14:00. | Due flag plants. | "…and six more hours on Monday. Due at two p.m. Monday. That's the number the customer must sign off on." |
| 5 | 44–52s | Reset. New card "P1 · 4 h · 24x7". Calendar now all blue. | Wipe transition. | "Now a P1: four hours, around the clock." |
| 6 | 52–66s | Playhead runs; at +1 h, a pause band "Awaiting Caller" for 1 h; business bar halts, actual continues. Then a second hold "Awaiting Vendor" — no pause band; business bar keeps filling, label "not your caller's clock? still counts". | Bars diverge during pause; continue together after. | "Waiting on the caller pauses the clock. Waiting on a vendor does not — that's still Northwind's commitment." |
| 7 | 66–76s | Bells at 50% (2 h business) and 75% (3 h). | Bells ring with captions "notify assignee", "notify group manager". | "Warnings fire while a human can still change the outcome." |
| 8 | 76–86s | Business bar hits 4 h; breach flag; bars keep growing past it; label "still running". | Flag plants, bars continue, final stop at Resolved "4 h 40 m business". | "At four business hours it breaches — and keeps counting, so you know how late it was. It stops at Resolved." |
| 9 | 86–90s | Summary: "Schedule decides what counts · Pause only on reasons that aren't your clock · Breach doesn't stop the timer · Report both elapsed times". | Lines appear. | "Four rules behind every SLA number." |

## Interaction variant (optional)
Scrubbable widget: learner picks a start time, schedule (24x7 / business hours / with holiday), and inserts pause intervals by dragging; the due time and both elapsed values update live. Can be built as a small web component and embedded next to lesson 8 practice 3.

## Production notes
- Numbers must match lesson 8: 08:00–18:00 schedule, P2 = 8 business hours, Friday 16:00 → Monday 14:00.
- State explicitly in a caption that holidays would also be hatched (link to schedule exclusion).
- Provide SRT captions and a text transcript; describe the bar divergence in words for screen-reader users.
- Export a still of scene 4 for the lesson's worked example.
