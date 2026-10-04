---
lesson_id: de201-07
course_id: de201
pathway: data-engineer
title: Tuning Spark Jobs for Scale
order: 7
kind: lesson
competency_ids:
  - D4-S1-C03
  - D4-S1-C02
objectives:
  - Diagnose a slow or failing Spark job from its execution metrics and fix the root cause
---

## Measure, localise, fix — in that order

Tuning has a reputation as a bag of configuration tricks. It is not. It is diagnosis: read the job's own metrics, find the one stage that is costing you, identify which of a small number of failure modes it exhibits, and apply the fix that mode calls for.

The discipline that separates engineers who can do this from engineers who cannot is refusing to change anything before measuring. Doubling executor memory because a job is slow is a guess; if the job is slow because one task holds 40% of the data, more memory buys nothing and you have merely made the job more expensive. Every fix in this lesson is attached to the evidence that justifies it.

The workflow is always the same:

1. Find the **slowest stage** — usually one stage is most of the wall clock.
2. Read that stage's **task-level metrics** — duration distribution, input, shuffle read and write, spill, GC time.
3. Match the pattern to a **root cause**.
4. Apply the matching fix, re-run, and compare the same metrics.

## Reading the Spark UI

The UI is at port 4040 while a job runs, and in the history server afterwards. Four views carry almost all the diagnostic value.

**Jobs** lists one entry per action, with duration and stage counts. It tells you which action is expensive and whether the job count is a surprise — many small jobs where you expected one usually means an accidental loop or repeated actions on an uncached frame.

**Stages** is where you live. For each stage: duration, task count, input size, output size, shuffle read, shuffle write, and spill. Sort by duration and open the top entry. Confirm the task count matches the partition count you expected, and compare shuffle read to input — a stage shuffling far more than it read is doing something you did not intend.

**The stage detail's summary metrics table** is the single most valuable panel in Spark. It shows the min, 25th percentile, median, 75th percentile, and max for every task metric. Read it as a distribution, never as an average:

- **Duration:** max close to median means healthy. Max at 50 times the median means skew or a straggler.
- **Input / shuffle read size:** an uneven distribution here is skew in the *data*; an even distribution with uneven durations points at a slow node instead.
- **Spill (memory) and Spill (disk):** any non-zero disk spill means partitions did not fit in memory and were written out and read back.
- **GC time:** more than about 10% of task time in garbage collection means memory pressure.

**SQL / DataFrame** shows the query plan as a diagram annotated with actual row counts per operator. This is where you catch an optimiser assumption that was wrong — an estimate of 1,000 rows on an operator that produced 400 million usually explains a bad join strategy.

## The failure modes

### Skew

**Symptom.** One or a few tasks run vastly longer than the median in a shuffle stage; the max input or shuffle-read size for the stage is many times the median; toward the end of the stage the cluster is nearly idle with one task still running.

**Cause.** Lesson 3's arithmetic: hash partitioning distributes keys evenly, not records. A key holding a disproportionate share of rows — `user_id = 0` for anonymous traffic, `country = 'US'`, a null join key, a default sentinel — lands its entire volume on one task.

**Diagnose it directly:**

```python
(
    df.groupBy("join_key")
      .count()
      .orderBy(F.col("count").desc())
      .show(20, truncate=False)
)
```

If the top key is orders of magnitude above the rest, you have your answer.

**Fixes, in order of preference.**

*Enable adaptive skew handling.* Spark's Adaptive Query Execution can split an oversized shuffle partition automatically:

```python
spark.conf.set("spark.sql.adaptive.enabled", "true")
spark.conf.set("spark.sql.adaptive.skewJoin.enabled", "true")
```

This handles the common case with no code change and should be on by default on any modern Spark.

*Filter the sentinel out.* If the hot key is null or a placeholder, it usually is not a real join at all. Split the dataset, handle those rows separately, and union the results.

*Broadcast the small side.* A broadcast join has no shuffle, so it has no skew. If the other side fits, this dissolves the problem entirely.

*Salt the key.* When the skew is genuine and both sides are large, add a random suffix to spread one key across `n` partitions, join against a dimension replicated `n` times, then aggregate away the salt:

```python
N = 32
fact_salted = df.withColumn("salt", (F.rand() * N).cast("int"))
dim_expanded = (
    dim.withColumn("salt", F.explode(F.array([F.lit(i) for i in range(N)])))
)
joined = fact_salted.join(dim_expanded, on=["join_key", "salt"], how="inner").drop("salt")
```

Salting is powerful and it is a genuine cost — the dimension is replicated `N` times — so reach for it only after the first three options fail.

### Wrong partition count

**Symptom, too few.** Tasks run for many minutes each, disk spill is large, the task count is well below the cluster's core count, and executors show memory pressure.

**Symptom, too many.** Thousands of tasks each finishing in tens of milliseconds; total scheduler time rivals task execution time; the stage is mostly overhead.

**Fix.** Size post-shuffle partitions to roughly 100–200 MB. Set `spark.sql.shuffle.partitions` accordingly, or better, let AQE coalesce them for you:

```python
spark.conf.set("spark.sql.adaptive.enabled", "true")
spark.conf.set("spark.sql.adaptive.coalescePartitions.enabled", "true")
```

AQE reads real shuffle-output statistics at runtime and merges undersized partitions, which is strictly better than a static guess for jobs whose data volume varies by day. Set the static value as a sane ceiling and let AQE come down from it.

On the read side, too few partitions usually traces back to lesson 6: a non-splittable compressed file, or one enormous file. Fix the layout, not the config.

### Spill

**Symptom.** Non-zero disk spill in the stage summary; the ratio of spill to shuffle read tells you how badly.

**Cause.** A task's working set — the sort buffer, the hash map for an aggregation, or the build side of a hash join — did not fit in its share of executor memory, so Spark wrote it to local disk and read it back.

**Fix, in order.** Increase the partition count so each task handles less data; this is the cheapest fix and usually sufficient. Increase executor memory. Reduce the data entering the shuffle — filter and project *before* the shuffle, never after. Some spill on a large job is acceptable; spill several times the size of shuffle read means the partitioning is wrong.

### Out of memory

Read the message carefully, because there are three distinct failures wearing the same name.

*Executor OOM in the JVM heap.* A single task's working set is too large. Fix with more partitions, then more memory per executor. Note that fewer, fatter executors are not always better — a 64 GB heap has painful garbage-collection pauses. Executors of 4–5 cores and 8–16 GB are a good default shape.

*"Container killed by YARN for exceeding memory limits."* The container exceeded its *total* limit, heap plus off-heap. Raise `spark.executor.memoryOverhead` (default is roughly 10% of executor memory, and PySpark needs more because the Python worker processes live outside the JVM).

*Driver OOM.* Almost always `collect()`, `toPandas()`, a huge broadcast, or an enormous number of tasks whose bookkeeping the driver must hold. The fix is nearly never more driver memory; it is to stop moving data to the driver.

### The wrong join strategy

**Symptom.** A join stage shuffles hundreds of gigabytes when one input is small; the plan shows `SortMergeJoin` where you expected `BroadcastHashJoin`.

**Cause.** Spark chooses broadcast when it *estimates* one side under `spark.sql.autoBroadcastJoinThreshold` (10 MB default). Estimates come from statistics, and statistics are missing or stale on raw file-based tables, or the small side is the result of upstream operations whose output size the optimiser guessed badly.

**Fix.** Hint explicitly with `F.broadcast(small_df)` when you know the size. Raise the threshold if your dimensions are genuinely tens of megabytes — but remember every executor holds a full copy, and an over-large broadcast produces driver OOM or executor memory pressure. Enable AQE, which can convert a sort-merge join into a broadcast join at runtime once it has seen actual shuffle sizes. And keep table statistics current where you use a catalog:

```sql
ANALYZE TABLE events COMPUTE STATISTICS FOR ALL COLUMNS;
```

### Caching mistakes

Both directions cost you. Not caching a DataFrame consumed by several actions means recomputing the whole lineage each time — visible as the same stages appearing repeatedly in the Jobs list. Caching everything fills executor memory, evicts blocks, and forces recomputation anyway while having stolen memory from execution. Cache what is expensive to produce *and* reused, materialise it once, and `unpersist` it when finished. Check the Storage tab: a cached DataFrame showing 40% cached fraction is giving you almost nothing while occupying memory.

### Stragglers and unhealthy nodes

**Symptom.** A slow task whose *input size* matches the median — the data is even, the machine is not. Often the same host appears in slow tasks across several stages.

**Fix.** Speculative execution launches a duplicate of an unusually slow task and takes whichever finishes first:

```python
spark.conf.set("spark.speculation", "true")
```

It costs duplicated work, so enable it for jobs on flaky hardware rather than everywhere. Persistent slowness on one host is an operations problem — a failing disk, a noisy neighbour — worth reporting rather than tuning around.

## Sizing executors

Start from the cluster, not from folklore.

Pick **4–5 cores per executor**. More than that and HDFS or object-store throughput per executor stops scaling, and garbage collection worsens. Then executors per machine is the machine's usable cores divided by that, leaving one core and about 1 GB for the operating system and the node daemon. Executor memory is usable machine memory divided by executors per machine, minus roughly 10% for overhead — more for PySpark, whose Python workers are off-heap.

Total concurrent tasks is `num_executors × executor_cores`. Aim for a partition count of two to four times that number, so tasks queue smoothly and a late straggler does not leave the cluster idle.

Dynamic allocation lets the job return idle executors and request more under load, which is the right default on a shared cluster:

```bash
--conf spark.dynamicAllocation.enabled=true \
--conf spark.dynamicAllocation.minExecutors=4 \
--conf spark.dynamicAllocation.maxExecutors=40 \
--conf spark.shuffle.service.enabled=true
```

The external shuffle service matters here: without it, removing an executor also removes the shuffle files it was serving, forcing recomputation. On Kubernetes, where an external shuffle service is usually not available, Spark 3.0 and later offer `spark.dynamicAllocation.shuffleTracking.enabled=true` instead: executors holding live shuffle data are kept until that data is no longer needed.

Provisioning the underlying cluster and choosing instance types is out of scope for this course — assume the cluster you are given and tune the job to fit it.

## Adaptive Query Execution

AQE deserves its own paragraph because it makes several of the fixes above automatic. With it on, Spark re-optimises the plan at each shuffle boundary using *actual* statistics rather than estimates. It coalesces undersized post-shuffle partitions, converts sort-merge joins into broadcast joins when the measured side turns out to be small, and splits skewed partitions on skew joins.

```python
spark.conf.set("spark.sql.adaptive.enabled", "true")
spark.conf.set("spark.sql.adaptive.coalescePartitions.enabled", "true")
spark.conf.set("spark.sql.adaptive.skewJoin.enabled", "true")
spark.conf.set("spark.sql.adaptive.advisoryPartitionSizeInBytes", "134217728")
```

It is on by default in recent Spark versions; confirm rather than assume. AQE does not excuse you from understanding the failure modes — it fixes the easy instances of three of them and leaves the rest, and you still have to read the metrics to know which case you are in.

## A worked diagnosis

A nightly job that took 20 minutes now takes 3 hours. The Jobs page shows one job; the Stages page shows one stage consuming 2 hours 40 minutes of it. Open it.

The stage has 200 tasks. Summary metrics: median duration 45 seconds, max 2.6 hours. Median shuffle read 180 MB, max 96 GB. Disk spill on the max task, 60 GB. GC time on that task, 22 minutes.

Read it off: even task count, even-ish median, one catastrophic outlier in *data volume*. That is skew, not a slow node — a slow node would show a normal input size. Confirm with a `groupBy` count on the join key: one key holds 34% of rows, and it is the string `"unknown"`, written by an upstream system that started emitting a placeholder for missing ids three weeks ago.

The fix is not salting and not more memory. Those rows do not join to anything meaningful, so filter them out before the join, route them to a quarantine path for the upstream team, and join the rest. Re-run: the stage's max task duration drops to 71 seconds, spill goes to zero, and the job finishes in 18 minutes.

Note the order — the metrics named the mode, the mode narrowed the candidates, and the data told you which candidate was real. Any of the tempting first moves (more memory, more partitions, more executors) would have cost money and fixed nothing.

## Practice

Use a job large enough to run for several minutes, with the Spark UI or history server available.

1. **Build a baseline.** Run your feature or aggregation pipeline from an earlier lesson and record, for each stage: duration, task count, input, shuffle read and write, disk spill, and the median and max task duration. This table is what every later exercise compares against.

2. **Diagnose an injected skew.** Rewrite one join key so a single value holds about 30% of rows. Run the job, then produce evidence from the stage summary metrics that the problem is skew rather than an undersized cluster — quote the median and max for both duration and shuffle read. Fix it two ways (AQE skew join, and salting), reporting the metrics after each and which you would ship.

3. **Find the partition sweet spot.** Run the same shuffle-heavy job with `spark.sql.shuffle.partitions` at 20, 200, and 2000, with AQE disabled. Record wall-clock time, average post-shuffle partition size, and spill for each. Then enable AQE coalescing, re-run from the 2000 setting, and report what AQE actually did to the partition count.

4. **Force a bad join plan, then repair it.** Join a large table to a dimension of roughly 50 MB and confirm from `explain` that Spark chose a sort-merge join. Record the shuffle volume. Then force a broadcast with `F.broadcast(...)` and re-measure. Report the shuffle volume in both runs and state the threshold change you would make permanent, plus the risk that change carries.

5. **Turn spill on and off.** Produce a stage with substantial disk spill by using too few partitions. Record the spill figures. Fix it by increasing partitions rather than memory, and show the spill going to zero. Then explain why raising executor memory would have hidden the symptom without addressing the cause.

6. **Cost the caching decision.** Take a pipeline where one intermediate feeds three outputs. Measure the total runtime uncached, then cached. Check the Storage tab for the cached fraction. Report both runtimes, the memory consumed, and whether you would keep the cache.

7. **Write the runbook.** Produce a one-page diagnostic checklist a teammate could follow on an unfamiliar slow job: what to open first, which three numbers to read, what each pattern implies, and the first fix to try for each. Test it by handing it to a peer and having them diagnose one of your broken jobs without your help.
