---
course_id: cse203
media_id: cse203-a02
type: animation-storyboard
title: "The Autoscaling Lag"
target_runtime: "75 sec"
suggested_tool: "Manim"
related_lessons:
  - cse203-07
objectives:
  - Right-size and autoscale provisioned resources against demand and cost
competency_ids:
  - D4-S1-C04
---

## Concept and misconception it fixes
Learners think autoscaling responds instantly. The animation lays the scale-out pipeline (metric period → evaluation → launch → boot → app start → health check) against a demand curve, showing why a short spike is missed, why cooldowns prevent thrashing, and why scheduled scaling wins for the Monday-morning peak at Riverside.

## Visual language (shapes, colors with color-blind-safe palette, labels)
- X axis: time in minutes. Y axis: requests per second.
- Demand: solid black line. Capacity: stepped line #0072B2 with square markers at each step. Shortfall area hatched (diagonal lines) labelled "users waiting".
- Pipeline stages as labelled boxes along the bottom, each with a duration: "metric 1 min", "evaluate 2 min", "launch 0.5 min", "boot + app 1.5 min", "health check 0.5 min".
- Instances as small server icons labelled "i-1", "i-2", … ; booting instances are outlined only.

## Scenes
| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 8s | Flat demand at 40 rps; capacity steps at 2 instances covering 60 rps. | Lines draw left to right. | "Two instances, quiet weekday." |
| 2 | 12s | Demand spikes to 110 rps at minute 3 for 90 seconds then falls. Pipeline boxes light up one by one beneath. | Hatched shortfall fills during spike; new instance icon appears at minute 8.5 — after the spike ended. | "A ninety-second spike. The pipeline takes about five and a half minutes. The new instance arrives after everyone has left." |
| 3 | 10s | Text: "Autoscaling can't absorb spikes shorter than its lag." | Fade in. | "Autoscaling cannot absorb a spike shorter than its own lag." |
| 4 | 14s | Sustained rise from 40 to 140 rps over 20 minutes. Without cooldown: capacity overshoots to 8, then crashes to 2, then climbs again (sawtooth). | Sawtooth draws, coins icon spills. | "Without a cooldown, the metric is still high while new instances boot, so the policy keeps adding. Then it overcorrects down. Oscillation costs more than no scaling." |
| 5 | 10s | Same rise with warm-up/cooldown: capacity steps smoothly 2→3→4→5. | Smooth steps. | "With warm-up and cooldown, each step has time to affect the metric before the next decision." |
| 6 | 12s | Monday 08:00 login rush: demand jumps to 120 rps at 08:00. A scheduled action at 07:45 raises desired to 4; capacity is ready before demand. Shortfall area is empty. | Clock icon at 07:45 triggers step. | "For a peak you can see on the calendar, don't wait for the metric. Schedule capacity fifteen minutes ahead." |
| 7 | 9s | Summary: three tools — "target tracking: drift", "scheduled: calendar", "serverless/warm buffer: seconds-long spikes". | Icons appear. | "Track the drift, schedule the calendar, and buffer the spikes." |

## Interaction variant (optional)
A scrubbable chart where the learner sets grace period, cooldown, and scheduled time; the shortfall area and a running cost counter update. Setting grace period below boot time triggers the "kill loop" warning from lesson 07.

## Production notes
- All durations illustrative; label "typical; measure your own" on screen.
- Keep the Riverside framing (30 staff, Monday peak) consistent with lesson 08.
- Manim: demand and capacity as `ValueTracker`-driven graphs; reuse pipeline boxes across scenes.
