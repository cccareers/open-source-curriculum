---
course_id: de201
media_id: de201-v02
type: video-script
title: "Read the Distribution, Not the Average: Diagnosing a Slow Spark Stage"
format: screencast
target_runtime: "8 min"
related_lessons:
  - de201-07
objectives:
  - Diagnose a slow or failing Spark job from its execution metrics and fix the root cause
competency_ids:
  - D4-S1-C03
  - D4-S1-C02
---

## Purpose

After watching, the learner can open the Spark UI, find the dominant stage, read the summary metrics table as a distribution, distinguish skew from a slow node or too-few partitions, and confirm the diagnosis with data before choosing a fix.

## Audience and prerequisites

de201 learners who have read lesson 7 and can run a local PySpark job with the UI on port 4040.

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | A terminal shows `rides_features.py` finishing in 11 min 40 s; a note: "yesterday: 1 min 50 s". | "This job took under two minutes yesterday. Today it took nearly twelve. The tempting fix is more memory. Let's not guess." |
| 0:15 | Spark UI, Jobs tab: one job dominates. Click into it. | "Lesson 7's workflow: find the slowest stage first. One job, and inside it..." |
| 0:30 | Stages tab sorted by duration: Stage 7 at 10 min 55 s; others under 20 s. Shuffle read 2.1 GB. | "...one stage is almost all of the wall clock. Stage seven, a shuffle stage. Everything else is noise." |
| 0:50 | Stage 7 detail: summary metrics table. Highlight Duration row: min 0.4 s, 25th 1.1 s, median 1.3 s, 75th 1.6 s, max 10.6 min. | "The summary metrics table. Read it as a distribution. Median task: 1.3 seconds. Max: over ten minutes. That's a ratio of about five hundred." |
| 1:20 | Highlight Shuffle Read Size row: median 9 MB, max 690 MB. | "Now the deciding row: shuffle read size. Median nine megabytes, max six hundred ninety. The slow task isn't slow because of its machine. It got seventy-five times more data." |
| 1:45 | Card: "Uneven input + uneven time = skew in the data. Even input + uneven time = slow node." | "That's the fork in the road. If input sizes were even and one task was still slow, suspect the host. Uneven input means skew in the data itself." |
| 2:10 | Highlight Spill (Disk) for the max task: 1.4 GB; GC Time: 2.1 min. | "The outlier also spilled to disk and spent two minutes in garbage collection. Those are symptoms of the skew, not separate problems. More memory would treat the symptoms." |
| 2:35 | SQL / DataFrame tab: plan diagram; the `SortMergeJoin` on `rider_id`; Exchange row counts show one partition with 6.2 M rows. | "The SQL tab tells us which operator: a sort-merge join on rider id." |
| 3:00 | Notebook: `rides.groupBy("rider_id").count().orderBy(F.desc("count")).show(5)`. Top row: `unknown` 6,204,118; next 412. | "Confirm with data, exactly as lesson 7 shows. Count by the join key. One value holds six million rows: the string 'unknown'." |
| 3:25 | Card: "Is the hot key a real entity or a placeholder?" | "Before choosing a fix, ask whether the hot key is real. 'unknown' is a placeholder: logged-out rides. It doesn't join to any rider." |
| 3:45 | Code diff: `known = rides.where(F.col("rider_id") != "unknown")`; `unknown_rides.write.parquet("quarantine/unknown_rider")`; join only `known`. | "So the fix is not salting and not memory. Filter the placeholder out before the join, route it to quarantine for the upstream team, join the rest." |
| 4:15 | Rerun. Stage 7 now: median 1.2 s, max 3.1 s; shuffle read max 14 MB; spill 0. Job 1 min 46 s. | "Rerun. Max task three seconds, no spill, the job back under two minutes." |
| 4:40 | Side-by-side table of before/after metrics. | "Write down the before and after of the same metrics. That's your evidence, and it's what lesson 7's runbook exercise asks for." |
| 5:00 | Second example: a different stage with Duration median 4 min, max 4.5 min, Shuffle Read median 3.8 GB, Spill (Disk) median 2.9 GB, task count 8. | "A different job, a different shape. Here every task is slow, inputs are huge but even, every task spills, and there are only eight tasks. That's not skew. That's too few partitions." |
| 5:35 | Fix: `spark.conf.set("spark.sql.shuffle.partitions", "200")` with AQE coalescing on. Rerun: median 6 s, no spill. | "Fix: more partitions, aiming for one to two hundred megabytes each, and let adaptive execution coalesce them back down if they turn out small." |
| 6:05 | Third example: Duration skewed but Shuffle Read even; Executors tab shows all slow tasks on `host-3`. | "And a third shape: uneven durations with even input, all on one host. That's a straggler. Speculative execution can route around it; the real fix is reporting the host." |
| 6:35 | Summary card: three rows — Skew / Too few partitions / Slow node — with the two numbers that distinguish them. | "Three common shapes, told apart by two rows of one table: duration and shuffle read. Read those before you touch a config." |
| 7:05 | End card: lesson 7 practice items 2 and 7. | "Now inject skew into your own job, diagnose it from the UI alone, and write the runbook entry." |

## On-screen assets and B-roll

- The rides dataset from de201-x01 with `rider_id = "unknown"` on ~30% of rows (the generator's default); a second dataset/config for the too-few-partitions example. Exact metric values will differ by machine; re-record numbers from the reference run.
- Before/after metrics table template.

## Accessibility

- Captions; every metric read aloud with its unit.
- Highlights use outlines and labels ("median", "max"), not color alone.
- Spark UI zoomed to at least 150%.

## Check for understanding

1. Median task duration is 2 s and max is 9 min, but shuffle read median and max are both ~120 MB. Skew or slow node? *Answer: likely a slow node or straggler, because the data is even but one task's time is not.*
2. Why is "add executor memory" usually the wrong first fix for skew? *Answer: the hot key still lands on one task; memory may reduce spill but the stage still waits on that task, so the cost goes up without fixing the cause.*
3. When is salting the right fix instead of filtering? *Answer: when the hot key is a genuine entity that must be joined and neither AQE skew handling nor a broadcast join is sufficient.*
