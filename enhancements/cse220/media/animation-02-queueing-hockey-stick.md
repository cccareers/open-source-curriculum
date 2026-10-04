---
course_id: cse220
media_id: cse220-a02
type: animation-storyboard
title: "The Queueing Hockey Stick"
target_runtime: "60 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - cse220-04
  - cse220-07
objectives:
  - Analyze logs and metrics to locate a performance bottleneck
competency_ids:
  - D1-S1-C03
---

## Concept and misconception it fixes
"CPU is only at 85 percent, that's fine." The animation shows a single server (a checkout counter) with requests arriving; as utilization rises, the queue — and therefore waiting time — grows non-linearly, matching the `u/(1−u)` factor added to lesson 04.

## Visual language (shapes, colors with color-blind-safe palette, labels)
- Server: a counter with one clerk icon; a busy/idle lamp labelled "busy" or "idle".
- Requests: small circles queueing left of the counter.
- Right panel: graph of wait factor vs utilization (x: 0–100%, y: wait factor), curve drawn #0072B2, current point a #E69F00 diamond with its value printed.

## Scenes
| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 8s | Utilization 50%. Requests arrive sparsely; queue rarely >1. Point at (50%, 1). | Steady arrivals. | "Half busy: requests rarely wait." |
| 2 | 8s | 80%. Queue fluctuates 2–5. Point at (80%, 4). | Arrival rate increases. | "Eighty percent: four times the waiting." |
| 3 | 8s | 90%. Queue 5–12. Point at (90%, 9). | Faster arrivals. | "Ninety percent: nine times." |
| 4 | 10s | 95%. Queue swells to ~20 with bursts. Point at (95%, 19); curve shoots upward. | Queue stretches off-screen. | "Ninety-five: nineteen times. The last ten points cost more than the first ninety." |
| 5 | 12s | Overlay of a dashboard: CPU 85% (looks "fine"), p99 latency climbing. Arrow linking CPU point on curve to the latency rise. | Arrow draws. | "That's why saturation moves before latency — and why 'only 85 percent' isn't fine." |
| 6 | 14s | Second counter opens (scale-out): utilization drops to 45%, queue drains. | Queue splits across two counters. | "Relieve the binding resource and the queue collapses. Relieve anything else and nothing changes." |

## Interaction variant (optional)
A utilization slider with live queue simulation (simple M/M/1 random arrivals) and the curve point; learners find the utilization where p99 crosses a stated target.

## Production notes
- Label the curve "simplest queueing model (M/M/1) — real systems vary, the shape holds".
- Keep the checkout counter metaphor consistent with lesson 09 of cse101 ("extra checkout lanes").
