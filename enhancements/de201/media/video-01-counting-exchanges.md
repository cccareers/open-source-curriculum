---
course_id: de201
media_id: de201-v01
type: video-script
title: "Count the Exchanges: Predicting Shuffles Before You Run"
format: screencast
target_runtime: "7 min"
related_lessons:
  - de201-03
  - de201-04
objectives:
  - Predict which operations in a job will trigger a shuffle and why that matters
competency_ids:
  - D4-S1-C02
---

## Purpose

After watching, the learner can look at a chain of DataFrame operations, predict the number and keys of shuffles, and confirm the prediction by counting `Exchange` nodes in `explain(mode="formatted")` and stages in the Spark UI.

## Audience and prerequisites

de201 learners who have read lesson 3 ("Which operations shuffle") and can start a local PySpark session.

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Split screen: left, five lines of PySpark; right, a blank notepad titled "Prediction". | "Before you run a Spark job, you should be able to say how many times it will shuffle. Let's practise on the rides data." |
| 0:15 | Code: `spark = SparkSession.builder.master("local[4]").config("spark.sql.adaptive.enabled","false").getOrCreate()` | "Local mode, four cores. I'm turning adaptive execution off for this demo so the plan you see is the plan that runs. We'll turn it back on at the end." |
| 0:35 | Code block A: `rides.filter("distance_km > 25").select("city","fare")`. Notepad: "A: 0 shuffles - filter and select are narrow." | "Prediction one. Filter, then select. Each output partition needs exactly one input partition. Narrow. Zero shuffles." |
| 0:55 | Run `A.explain(mode="formatted")`. Highlight: `FileScan parquet`, `Filter`, `Project`. No Exchange. | "Confirmed. FileScan, Filter, Project. No Exchange node anywhere." |
| 1:15 | Code block B: `rides.groupBy("city").agg(F.sum("fare"))`. Notepad: "B: 1 shuffle on city." | "Group by city. Every city's rows are scattered across every input partition, so they must be regrouped. One shuffle, keyed on city." |
| 1:35 | Explain output; highlight `HashAggregate (partial)`, `Exchange hashpartitioning(city, 200)`, `HashAggregate (final)`. | "There it is: Exchange hashpartitioning on city, two hundred partitions. And notice the HashAggregate on both sides of it. The first is partial aggregation: each task sums its own rows first, so the shuffle carries one partial sum per city per partition, not every ride." |
| 2:10 | Code block C: `rides.join(riders, "rider_id").groupBy("region").count()` (both large). Notepad: "C: 3 exchanges - rider_id on each side, then region." | "Join two large tables, then group by a different column. Both sides redistribute by rider_id. That's two exchanges. Then the group by region needs another. Three." |
| 2:40 | Explain; highlight two `Exchange hashpartitioning(rider_id, 200)` under `SortMergeJoin`, then `Exchange hashpartitioning(region, 200)`. | "Three Exchange nodes. Sort-merge join, fed by two shuffles on the join key, then a third for the region regrouping." |
| 3:05 | Code block D: same as C but `F.broadcast(dim_city)` joined on city instead. Notepad: "D: BroadcastExchange (not a shuffle) + 1 on region." | "Now join to a small dimension, and say so with broadcast. The large side doesn't move at all." |
| 3:25 | Explain; highlight `BroadcastExchange` and `BroadcastHashJoin`, then one `Exchange hashpartitioning(region, ...)`. | "BroadcastExchange ships one small copy to every executor. It is a different kind of node: no all-to-all redistribution, no barrier on the big side. The only true shuffle left is the group by." |
| 3:55 | Code block E: `rides.union(late_rides).dropDuplicates(["ride_id"])`. Notepad: "E: union 0, dropDuplicates 1 on ride_id." | "Union just concatenates partition lists. Free. dropDuplicates is a group-by in disguise. One shuffle on ride_id." |
| 4:15 | Explain confirms one Exchange on ride_id. | "One Exchange. Prediction holds." |
| 4:30 | Run block C with `.write.mode("overwrite").parquet("/tmp/c")`; open Spark UI at localhost:4040, Jobs -> Stages. Show 4 stages. | "Now confirm at runtime. Stages are cut at every shuffle boundary, so three exchanges should give four stages. The UI shows four." |
| 5:00 | Stage detail: task count 200 on a post-shuffle stage; summary metrics show tasks of a few milliseconds. | "And each post-shuffle stage has two hundred tasks, the default shuffle partitions. On this small dataset each task processes almost nothing. That overhead is lesson 7's problem, but you can already see it here." |
| 5:25 | Re-enable AQE: `spark.conf.set("spark.sql.adaptive.enabled","true")`; rerun C; plan shows `AdaptiveSparkPlan isFinalPlan=true`, `AQEShuffleRead coalesced`. | "Turn adaptive execution back on and rerun. Same exchanges, but AQE has coalesced those tiny partitions after measuring them. And if one side had turned out small, it could have switched the join to broadcast at runtime. AQE changes partition counts and join strategies; it does not change which operations need a regrouping." |
| 6:10 | Summary card: Narrow = free. Group/distinct/join/orderBy/window = Exchange. Broadcast = no shuffle of big side. Stages = exchanges + 1. | "Narrow work is free per byte. Grouping, deduplicating, joining two large sides, global sorting, and partitioned windows each cost an Exchange. Broadcast avoids the shuffle of the big side. And stages equal exchanges plus one." |
| 6:40 | End card: "Practice 1 in lesson 3: write your predictions first." | "Do lesson 3's first practice exercise the same way: prediction on paper first, then explain, then the UI." |

## On-screen assets and B-roll

- A small local rides Parquet dataset (generate with the de201-x01 `generate.py --rows 200000`), plus `riders` and `dim_city`.
- Prediction notepad overlay updated as each block is predicted.

## Accessibility

- Captions; every code block and plan excerpt provided as text.
- Exchange nodes highlighted with a box and the label "SHUFFLE" in text, not color alone.
- Spark UI zoomed so table text is at least 16 px equivalent; narration reads stage and task counts aloud.

## Check for understanding

1. How many shuffles does `df.select("a","b").where("b > 0").groupBy("a").count().orderBy("count")` cause? *Answer: two - one for the groupBy on `a`, one for the global orderBy (a range-partitioned exchange).*
2. Is `BroadcastExchange` a shuffle? *Answer: no; it copies the small side to every executor and leaves the large side in place, so there is no all-to-all redistribution and no barrier on the large side.*
3. A job has 3 Exchange nodes. How many stages do you expect? *Answer: four (exchanges plus one), assuming a single action and no reused exchanges.*
