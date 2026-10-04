---
course_id: de201
media_id: de201-a01
type: animation-storyboard
title: "Inside a Shuffle, and Why One Hot Key Stalls the Cluster"
target_runtime: "100 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - de201-03
  - de201-07
objectives:
  - Predict which operations in a job will trigger a shuffle and why that matters
  - Diagnose a slow or failing Spark job from its execution metrics and fix the root cause
competency_ids:
  - D4-S1-C02
  - D4-S1-C03
---

## Concept and misconception it fixes

Two misconceptions: (1) "a shuffle is just sending data over the network" — it is also serialization, a full write to local disk, an all-to-all fetch, and a barrier; (2) "more executors will fix a slow stage" — when hash partitioning sends one hot key's records to one task, adding machines changes nothing, because keys are spread evenly, not records.

## Visual language (shapes, colors with color-blind-safe palette, labels)

- Four map tasks on the left as tall boxes; four reduce tasks on the right.
- Records as small circles labelled with a city (`aus`, `dal`, `col`, `fre`) — label text is the primary cue; fill color is secondary (Okabe-Ito palette: #0072B2, #E69F00, #009E73, #CC79A7).
- The `unknown` key as circles with a question-mark glyph in grey (#999999) with a thick outline.
- Local disk under each map task as a small cylinder icon; network as dotted lines.
- Barrier as a vertical dashed wall labelled "BARRIER".
- A progress bar under each reduce task, plus a clock in the top right.

## Scenes

| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 10s | Four map tasks each holding a jumble of city circles. | Circles jiggle in place. | "Before a group-by on city, every partition holds every city, mixed together." |
| 2 | 12s | Inside map task 1, a function box "hash(city) mod 4" sorts circles into four labelled bins. | Circles fly into bins 0-3. | "Each map task runs the partitioner. Same key, same bin, on every machine — no coordination needed." |
| 3 | 10s | Bins serialize into bytes (circles flatten into bars) and drop into the disk cylinder. | Flatten, then drop. | "Records are serialized and written in full to local disk. That's the map side." |
| 4 | 8s | Barrier wall slides down between map and reduce sides. One map task is still writing. | Reduce tasks wait; clock ticks. | "Nothing on the reduce side starts until every map task has finished. One slow writer holds everyone." |
| 5 | 14s | Barrier lifts. Each reduce task draws dotted lines to all four disks and pulls its bin. 16 lines appear. | Lines animate in; bars travel; reassemble into circles. | "Then every reduce task fetches its slice from every map task. Four by four is sixteen transfers; a thousand by a thousand is a million." |
| 6 | 8s | Reduce tasks aggregate; progress bars fill evenly and finish together. Clock reads 20s. | Bars fill in sync. | "With evenly spread data, reduce tasks finish together. Twenty seconds." |
| 7 | 12s | Replay scene 2 with 30% of circles now `unknown`. All `unknown` circles land in bin 2. | Big pile in bin 2. | "Now thirty percent of rows carry the key 'unknown'. Hash partitioning spreads keys evenly, not records. Every 'unknown' lands in the same bin." |
| 8 | 10s | Reduce task 2 receives a mountain; three tasks finish at 20s; task 2's bar crawls. Clock spins to 40 min. | Three bars done; one bar slow. | "Three tasks finish in twenty seconds. One runs for forty minutes. The stage takes as long as its slowest task." |
| 9 | 8s | Add four more executors on the right; bin 2 still goes to one task. | New boxes appear idle. | "Add machines? The hot key still hashes to one task. The new executors sit idle." |
| 10 | 8s | Filter funnel removes `unknown` circles before the partitioner, routing them to a "quarantine" box; rerun finishes evenly. | Funnel animation, bars sync. | "The fix depends on the key. A placeholder like 'unknown' should be filtered and quarantined before the shuffle. A genuinely hot real key calls for AQE skew handling, broadcast, or salting." |

## Interaction variant (optional)

A slider for "share of rows on one key" (0-50%) and another for "number of reduce tasks". The animation recomputes per-task load and stage time, showing that more tasks reduce time only until one task holds the hot key. Pair with a mock Spark UI summary-metrics table (min / median / max duration and shuffle read) that updates live, so learners practise reading the max-vs-median signal from lesson 7.

## Production notes

- Mirror the exact Spark UI vocabulary ("Shuffle Write", "Shuffle Read", "Spill (Disk)") in on-screen labels for scenes 3, 5 and 8.
- Scene 10 should name the de201-07 worked diagnosis (`"unknown"` placeholder) so learners connect the animation to the lesson text.
- Keep circle labels at least 24 px; never rely on fill color alone to identify a city.
