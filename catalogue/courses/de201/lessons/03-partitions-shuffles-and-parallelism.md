---
lesson_id: de201-03
course_id: de201
pathway: data-engineer
title: Partitions, Shuffles, and Parallelism
order: 3
kind: lesson
competency_ids:
  - D4-S1-C02
objectives:
  - Predict which operations in a job will trigger a shuffle and why that matters
---

## The partition is the unit of parallelism

Lesson 2 left you with a dataset spread across a cluster as blocks. Compute engines take that layout and turn it into **partitions**: disjoint slices of the dataset, each processed by exactly one task, on one core, at one moment in time.

The relationship is deliberately simple. When a job reads a splittable file, the engine asks the file system for the file's splits — usually one per block — and creates one partition per split. Two hundred blocks of 128 MB become two hundred partitions, and if the cluster has fifty free cores the engine runs fifty tasks at a time in four waves. Change nothing but the cluster size and the same job runs in fewer or more waves. That is the whole promise of horizontal scaling, and partitions are the currency it is denominated in.

Two consequences follow immediately, and both matter more than they look.

**You cannot be more parallel than you have partitions.** A job with four partitions uses four cores no matter how big the cluster is. This is the most common reason a "big data" job runs at laptop speed on a hundred-node cluster: someone read a single non-splittable file, or filtered down to a handful of partitions early, and the rest of the cluster sat idle.

**A job is as slow as its slowest partition.** Tasks within a wave run concurrently, so wall-clock time is set by the longest one, not the average. If 199 partitions hold 500 MB each and one holds 40 GB, the job takes as long as that one task — and adding machines does not help at all. That is **skew**, and you will meet it repeatedly.

Both consequences are just Amdahl's law in working clothes: the speedup you get from parallelism is capped by the part of the work that cannot be split.

## Narrow and wide dependencies

Ask of any operation: *to produce one output partition, how many input partitions must I look at?*

If the answer is "exactly one," the dependency is **narrow**. Filtering rows, projecting columns, computing a new column from existing ones, casting a type — each output partition depends on precisely one input partition, so the work can run wherever that input already is, with no coordination and no network traffic. Narrow operations chain together for free: filter then map then filter runs as a single pass over each partition, one record at a time, never materialising the intermediate results.

If the answer is "potentially all of them," the dependency is **wide**. To compute the total revenue per customer, a task responsible for customers whose id hashes to bucket 7 must see every record for those customers — and those records start out scattered across every input partition, because nothing arranged the input by customer. Producing that output requires redistributing records across the cluster by key. That redistribution is the **shuffle**.

The distinction is the single most useful lens you have for predicting a job's cost, because narrow work is roughly free per byte and shuffles are not.

## What actually happens during a shuffle

A shuffle has a write side and a read side, and the boundary between them is a hard barrier: no reader can start until every writer for that shuffle has finished.

**Map side.** Each task processing an input partition runs its records through a **partitioner** that assigns each record to an output partition. The default is hash partitioning: `partition = hash(key) mod numOutputPartitions` — sometimes called the modulo trick — which guarantees that identical keys always land in the same output partition, everywhere in the cluster, without any node consulting another. Records are buffered in memory, sorted or grouped by target partition, and **written to local disk** as a shuffle file, along with an index describing where each target partition's bytes begin. When memory fills before the task is done, the buffer **spills** to disk and the spills are merged at the end.

**Reduce side.** Each task on the far side of the barrier is responsible for one output partition. It contacts every machine that ran a map task, requests its slice of each shuffle file, and pulls those bytes across the network. Once it has all of them, it has every record for its keys and can aggregate, join, or sort them locally.

![A shuffle redistributes records from every input partition to every output partition through local shuffle files and a network fetch](./img/shuffle-map-reduce.png)

Now count the costs, because they explain every tuning decision later in the course.

- **Serialization.** Every shuffled record is converted to bytes on the way out and back to objects on the way in. This is CPU work proportional to volume.
- **Disk.** Map output is written to local disk in full, then read back. A shuffle of 500 GB writes 500 GB and reads 500 GB, on top of whatever the source read cost.
- **Network.** With `m` map tasks and `r` reduce tasks there are up to `m × r` fetch connections. 1,000 by 1,000 is a million transfers, and this all-to-all pattern is why shuffle-heavy jobs saturate networks that scans never trouble.
- **The barrier.** Nothing downstream proceeds until the slowest map task finishes. One straggler stalls the entire cluster.
- **Fragility.** Shuffle data lives on the machine that produced it. If that machine dies after writing, its output must be recomputed, not just refetched.

A useful rule of thumb: a shuffle costs roughly an order of magnitude more per byte than a narrow pass over the same data. It is not something to avoid at all costs — most useful analytics require a regrouping somewhere — but it is something to do *once*, over the *smallest* data you can arrange, rather than three times over the raw input.

## Which operations shuffle

Learn this list well enough to predict a job's stage count before you run it.

**Always shuffle.**

- Grouped aggregation: `groupBy(...).agg(...)`, `reduceByKey`, `aggregateByKey`
- `distinct` and `dropDuplicates` — deduplication is a group-by in disguise
- Most joins: sort-merge and shuffle-hash joins redistribute *both* sides by the join key
- Global ordering: `orderBy` / `sort` across the whole dataset
- Window functions with a `partitionBy` clause, which must gather each window's rows together
- `repartition(n)` and `repartitionByRange(...)` — an explicit, deliberate shuffle
- Set operations that deduplicate, such as `intersect` and `union` followed by `distinct`

**Never shuffle.**

- `select`, `filter` / `where`, `withColumn`, `cast`, `drop`
- Row-wise user functions and most SQL expressions
- `union` on its own — it concatenates partition lists and does no data movement
- `limit` on a single partition, and `coalesce(n)` when `n` is smaller than the current count

**Shuffle only sometimes — and this is where the money is.**

- A **broadcast join** avoids the shuffle entirely: when one side is small enough, the engine ships a full copy of it to every executor and each task joins its partition locally. No redistribution of the large side, no barrier. This is the single highest-leverage optimisation in the catalogue, and it applies constantly, because joining a billion-row fact table to a ten-thousand-row dimension table is the most common operation in analytics.
- A **pre-partitioned or bucketed input** whose layout already matches the required key can skip the shuffle for that key, because the records are already colocated correctly.
- An aggregation with a **partial (map-side) pre-aggregation** still shuffles, but shuffles far less: each map task combines its own records first and ships one partial result per key instead of every record.

That last point deserves an example, because it is the classic distributed-computing mistake.

```python
# Anti-pattern: ships every single record across the network
counts = rdd.groupByKey().mapValues(len)

# Better: combines locally first, ships one partial count per key per partition
counts = rdd.mapValues(lambda _: 1).reduceByKey(lambda a, b: a + b)
```

With a billion records and a thousand distinct keys, `groupByKey` shuffles a billion records; `reduceByKey` shuffles at most a thousand partial counts per input partition. Same answer, a shuffle volume smaller by orders of magnitude. The DataFrame API applies this optimisation for you on built-in aggregate functions — another reason to prefer built-ins to hand-rolled RDD code.

## Controlling partition count

Three knobs, each with a distinct job.

**Read-time partitioning** comes from the input layout: number of splittable files, block size, and whether the format can be split at all. A 5 GB gzip file produces exactly one partition, because gzip cannot be decoded from the middle — a fact that turns a large cluster into a single-threaded machine. Formats and splittability are lesson 6's subject; note the symptom here.

**`repartition(n)`** performs a full shuffle to produce exactly `n` roughly even partitions, and can repartition by column (`repartition("customer_id")`) to colocate keys. Use it to increase parallelism, or to fix badly uneven partitions, and accept that you are paying for a shuffle to do so.

**`coalesce(n)`** merges existing partitions without a shuffle, by having some tasks read several upstream partitions. It only reduces the count, and it can produce uneven results. Its classic use is right before a write, to avoid emitting hundreds of tiny output files. Its classic trap: `coalesce` propagates *backwards* into the preceding narrow stage, so `df.filter(...).coalesce(1).write(...)` runs the filter itself with a single task. When you need both full parallelism upstream and few output files, `repartition(1)` is the correct, more expensive choice.

**Shuffle width** is set by configuration rather than by the operator. Spark's `spark.sql.shuffle.partitions` defaults to 200: every shuffle produces 200 output partitions unless told otherwise. That default is wrong in both directions — far too many for a 500 MB job, where you get 200 tasks each processing 2.5 MB and the scheduling overhead dwarfs the work, and far too few for a 5 TB job, where each task must handle 25 GB and spills to disk. A reasonable starting target is partitions sized between 100 MB and 200 MB after the shuffle.

## Sizing and skew

Partition sizing is a balance between two failure modes. Partitions that are too large spill to disk, cause garbage-collection pressure, and can exhaust an executor's memory. Partitions that are too small waste time on per-task overhead — task launch, deserialisation, and result bookkeeping cost roughly a few milliseconds to tens of milliseconds each, which is invisible at 200 tasks and dominant at 200,000. Aim for tasks that run for seconds, not milliseconds and not many minutes.

Skew is the other half. Hash partitioning distributes *keys* evenly, not *records*. If 30% of your events carry `user_id = 0` because that is what the upstream system writes for logged-out traffic, then whichever partition owns the hash of `0` receives 30% of the dataset regardless of how many partitions you request. The symptom is unmistakable once you know it: 199 tasks finish in 20 seconds and one runs for 40 minutes.

Recognise the shape now — a single key, or a small set of keys, holding a disproportionate share of records, always at a shuffle boundary. Diagnosing it from execution metrics and repairing it is lesson 7's work.

## Reading a plan for shuffles

You do not have to guess. Ask the engine to explain the plan and count the exchanges.

```python
orders = spark.read.parquet("/data/orders")
customers = spark.read.parquet("/data/customers")

result = (
    orders.filter("status = 'complete'")
          .join(customers, "customer_id")
          .groupBy("region")
          .sum("amount")
)

result.explain(mode="formatted")
```

In the physical plan, every node named `Exchange` is a shuffle. `Exchange hashpartitioning(customer_id, 200)` is a redistribution by join key; `Exchange hashpartitioning(region, 200)` is the aggregation's regrouping. A `BroadcastExchange` is different in kind — it ships one small side everywhere rather than redistributing both, and it is cheap by comparison. Counting exchanges before you run a job, and confirming afterwards that the count matched your prediction, is the fastest way to build reliable intuition.

## Practice

Use a dataset large enough that timings are meaningful — tens of millions of rows at minimum. Record every prediction *before* you run anything; the point of the exercise is calibration, not the numbers themselves.

1. **Predict the exchanges.** For each of the following, write down how many shuffles you expect and on which key, then confirm with `explain(mode="formatted")`: (a) filter then select; (b) `groupBy("country").count()`; (c) a join of two large tables followed by a group-by on a *different* column; (d) the same join where the right side is 2 MB; (e) `union` of two frames followed by `dropDuplicates`. Note every case where you were wrong and why.

2. **Find the parallelism floor.** Read a large dataset and print `df.rdd.getNumPartitions()`. Then apply a highly selective filter and print it again. Explain why the number did not change, what that means for the tasks after the filter, and which operator you would insert to fix it.

3. **Measure `reduceByKey` against `groupByKey`.** Build an RDD of at least 50 million key/value pairs over about 1,000 distinct keys. Compute per-key sums both ways, timing each and recording the shuffle read and write volumes reported for each stage. Explain the ratio between the two shuffle volumes in terms of the number of distinct keys.

4. **Break a job with skew, then measure it.** Take an evenly distributed dataset and rewrite one key so that it accounts for roughly a third of all rows. Group by that key and compare the maximum task duration to the median for the shuffle stage. State the ratio, and explain why adding twice as many executors would not improve it.

5. **Tune the shuffle width.** Run one aggregation job three times with `spark.sql.shuffle.partitions` set to 8, 200, and 4000. Record wall-clock time, task count, and any spill for each. Then compute the average post-shuffle partition size in each run and explain which run was closest to the 100–200 MB guideline and whether the timings agree with the guideline.

6. **Choose the right narrowing operator.** Write a filtered result to disk twice, once with `coalesce(1)` and once with `repartition(1)`, timing both and inspecting how many tasks ran in the filter stage each time. Explain the difference in task counts, and state the rule you would give a teammate for choosing between the two.
