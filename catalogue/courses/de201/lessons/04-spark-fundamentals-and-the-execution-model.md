---
lesson_id: de201-04
course_id: de201
pathway: data-engineer
title: Spark Fundamentals and the Execution Model
order: 4
kind: lesson
competency_ids:
  - D4-S1-C01
  - D4-S1-C02
objectives:
  - Write Spark DataFrame code that reads, transforms, and writes a large dataset
---

## What Spark is, and what it replaced

Apache Spark is a distributed compute engine. You hand it a description of a computation over a dataset; it works out how to split that computation into tasks, schedules them onto machines near the data, runs them, retries the ones that fail, and gives you back a result or writes one to storage.

It won out over MapReduce for two reasons that are worth stating plainly, because they shape everything below. First, MapReduce materialised intermediate results to the distributed file system between every pair of phases, so a five-step pipeline wrote and re-read the whole dataset five times; Spark keeps intermediates in executor memory and chains many steps into one job. Second, MapReduce ran exactly what you wrote, whereas Spark's DataFrame API is *declarative* — you describe the result, and an optimiser rewrites your description into a better plan before a single record is read.

You will write PySpark in this course. The Scala API is the same set of concepts with different syntax; the DataFrame API performs identically from either language, which is precisely why it is the API to learn.

## The runtime: driver, executors, cluster manager

Three kinds of process cooperate on every job.

The **driver** is the process running your program. It holds the `SparkSession`, builds the logical plan as your code runs, hands the plan to the optimiser, splits the resulting physical plan into stages and tasks, schedules those tasks, tracks their completion, and collects any results you explicitly ask for. There is exactly one driver, it is not distributed, and it is a single point of failure for the job. Anything that pulls data *to* the driver — `collect()`, `toPandas()`, a large `take()` — is pulling a distributed dataset into one process's heap. That is the most common way to kill an otherwise healthy job.

**Executors** are JVM processes on worker machines. Each has a fixed number of cores and a fixed heap. Each core runs one task at a time, so an executor with 4 cores runs 4 tasks concurrently. Executors also hold cached data and serve shuffle files to other executors. They are where all the real work happens.

The **cluster manager** — YARN from lesson 2, or Kubernetes, or Spark's own standalone manager — grants the containers that executors run inside. Which manager you use changes the submission flags and nothing about the programming model.

```python
from pyspark.sql import SparkSession

spark = (
    SparkSession.builder
    .appName("rides-etl")
    .config("spark.sql.shuffle.partitions", "400")
    .getOrCreate()
)
```

In a notebook or `pyspark` shell a session already exists as `spark`. In a script submitted with `spark-submit`, you create it as above; `getOrCreate` returns the existing one if there is any.

## Lazy evaluation, and why it pays

Spark's API divides into **transformations** and **actions**, and the divide is the reason the optimiser can do anything useful.

A transformation — `select`, `filter`, `withColumn`, `join`, `groupBy().agg()`, `orderBy` — returns a new DataFrame describing a computation. It runs nothing. It reads nothing. You can chain forty of them and the cluster stays idle.

An action — `write`, `count`, `collect`, `show`, `take`, `foreach` — demands a result. Only then does Spark optimise the accumulated plan and execute it.

```python
df = spark.read.parquet("/data/rides")          # nothing read yet
long_trips = df.filter(df.distance_km > 25)     # still nothing
by_city = long_trips.groupBy("city").count()    # still nothing
by_city.show()                                  # NOW the cluster works
```

Laziness buys real optimisations. Because Spark sees the filter before it reads, it can push that predicate down into the Parquet reader and skip whole files. Because it sees which columns you ultimately use, it reads only those columns. Because it sees the whole chain, it fuses the narrow operations into one pass instead of materialising each step.

It also has a consequence people trip over: **each action re-executes the plan from the source**. Calling `show()` and then `count()` on the same DataFrame reads and computes twice. If you need a result more than once, cache it or write it out.

## From your code to tasks

Four representations sit between your program and the running cluster.

1. **Unresolved logical plan** — the operator tree built from your calls, with column and table names not yet checked.
2. **Analyzed logical plan** — names resolved against the catalog and schemas; this is where "column not found" surfaces.
3. **Optimized logical plan** — the **Catalyst** optimiser applies rule-based rewrites: predicate pushdown, projection pruning, constant folding, filter reordering, collapsing adjacent projections, simplifying boolean expressions, and eliminating subqueries. Cost-based rules use table statistics to pick join orders and join strategies.
4. **Physical plan** — concrete operators (`FileScan`, `HashAggregate`, `SortMergeJoin`, `BroadcastHashJoin`, `Exchange`), from which Spark generates Java bytecode at runtime through **whole-stage code generation**, collapsing a chain of operators into a single tight loop over rows held in the compact off-heap **Tungsten** format rather than as JVM objects.

Execution then breaks down as follows. Each action creates a **job**. The scheduler cuts the job into **stages** at every shuffle boundary — the `Exchange` operators you learned to count in lesson 3 — because a shuffle is a barrier. Within a stage, every partition is one **task**, and all tasks in a stage run the identical code on different data. A job with two shuffles has three stages; if the last stage has 400 partitions, the stage is 400 tasks.

Every number in that chain was defined in lesson 3, which is why it was taught first: `job → stages (one per shuffle boundary) → tasks (one per partition)`.

Fault tolerance falls out of the same structure. A DataFrame knows its **lineage** — the deterministic chain of operations that produced it from immutable source data — so when a task dies, Spark reruns just that task from its inputs rather than restarting the job. Lost shuffle output is recomputed the same way. This is why user functions must be deterministic and free of side effects: a task can and will run more than once.

## RDDs, DataFrames, and what to use

The **RDD** is Spark's original abstraction: an immutable, partitioned collection of arbitrary objects with functional operators. It is fully general and completely opaque to the optimiser — Spark cannot see inside a Python lambda, so it cannot push it down, reorder it, or generate code for it.

The **DataFrame** is a distributed table with a known schema, expressed with columns and built-in functions. Because the plan is data rather than code, Catalyst can rewrite it, and in PySpark the work executes in the JVM rather than shipping every row into a Python worker process.

That last point is the practical one: a PySpark job written with built-in column expressions runs at Scala speed, while the same logic in a Python lambda over an RDD can be several times slower purely from serialisation between the JVM and Python. **Default to DataFrames.** Reach for RDDs only for genuinely unstructured data or fine-grained partition control. (The typed `Dataset` API is Scala and Java only; in Python, `DataFrame` is all there is, and it is enough.)

## Reading data

```python
from pyspark.sql import functions as F
from pyspark.sql.types import StructType, StructField, StringType, DoubleType, TimestampType

rides = spark.read.parquet("/data/rides/")

schema = StructType([
    StructField("ride_id", StringType(), nullable=False),
    StructField("city", StringType(), nullable=True),
    StructField("distance_km", DoubleType(), nullable=True),
    StructField("started_at", TimestampType(), nullable=True),
])

raw = (
    spark.read
    .schema(schema)                 # never infer on a large CSV
    .option("header", "true")
    .option("mode", "PERMISSIVE")
    .csv("/data/raw/rides/")
)
```

Three habits from the start. **Always supply a schema for text formats.** Inference costs an extra pass over the data and can guess differently between runs, turning an integer column into a string the day a null appears. **Read directories, not single files** — a path ending in a directory reads every file under it in parallel, which is how you get partition counts above one. **Know your bad-record mode**: `PERMISSIVE` nulls out unparseable fields, `DROPMALFORMED` discards those rows silently, `FAILFAST` aborts the job. Silent data loss is worse than a failed job, so choose deliberately.

## Transforming

```python
clean = (
    raw
    .where(F.col("distance_km").isNotNull() & (F.col("distance_km") > 0))
    .withColumn("city", F.trim(F.lower(F.col("city"))))
    .withColumn("started_date", F.to_date("started_at"))
    .withColumn(
        "distance_band",
        F.when(F.col("distance_km") < 2, "short")
         .when(F.col("distance_km") < 15, "medium")
         .otherwise("long"),
    )
    .drop("raw_payload")
)
```

Every DataFrame is immutable; each call returns a new one. `withColumn` adds or replaces a single column and is fine a few times in a row, but chaining thirty of them builds a deep plan that is slow to analyse — use one `select` with many expressions when you are producing many columns at once.

Aggregation and joins:

```python
per_city_day = (
    clean.groupBy("city", "started_date")
         .agg(
             F.count("*").alias("rides"),
             F.sum("distance_km").alias("total_km"),
             F.avg("distance_km").alias("avg_km"),
             F.expr("percentile_approx(distance_km, 0.5)").alias("median_km"),
         )
)

cities = spark.read.parquet("/data/dim_cities")      # small dimension table

enriched = per_city_day.join(F.broadcast(cities), on="city", how="left")
```

Two things to internalise here. Aggregation with built-in functions gets **partial aggregation** automatically — each task combines locally before the shuffle — so the shuffle carries partial results, not raw rows. And `F.broadcast(...)` states explicitly that the right side is small enough to copy to every executor, converting a two-sided shuffle into no shuffle at all. Spark will often choose a broadcast on its own when statistics say the side is under `spark.sql.autoBroadcastJoinThreshold` (10 MB by default), but stale or missing statistics defeat that, so an explicit hint on a known-small dimension is good practice.

Join types behave as they do in SQL — `inner`, `left`, `right`, `full`, `left_semi`, `left_anti`. Watch for two hazards: joining on a column present in both frames under different names leaves you with ambiguous references, and a key with duplicates on both sides multiplies rows. Check row counts before and after any join you are not certain about.

You can also register a DataFrame and use SQL, which produces the identical plan:

```python
clean.createOrReplaceTempView("rides")
spark.sql("""
    SELECT city, count(*) AS rides
    FROM rides
    WHERE started_date = DATE '2026-07-01'
    GROUP BY city
""").show(20, truncate=False)
```

Neither API is faster. Use whichever makes the transformation clearer to the next reader.

## Caching

Persisting a DataFrame keeps its computed partitions in executor memory (spilling to disk when needed) so later actions reuse them instead of recomputing from source.

```python
clean.cache()          # alias for persist(StorageLevel.MEMORY_AND_DISK)
clean.count()          # materialises it — cache() alone is lazy
# ... several downstream actions reuse the cached partitions ...
clean.unpersist()
```

Cache when a DataFrame is expensive to produce *and* used by more than one action — an iterative loop, or a shared intermediate feeding several outputs. Do not cache a frame used once; you pay memory and eviction cost for nothing, and evicting cached blocks can push out data another job needs. Always `unpersist` when done.

## Writing

```python
(
    per_city_day
    .repartition("started_date")
    .write
    .mode("overwrite")
    .partitionBy("started_date")
    .parquet("/data/marts/rides_per_city_day")
)
```

`mode` takes `overwrite`, `append`, `error` (the default), or `ignore`. `partitionBy` writes one directory per value of the named columns, which lets later readers skip whole directories — the layout decisions behind that belong to lesson 6. The `repartition` before the write matches Spark's partitions to the output directories so each directory receives one file per task rather than one file from every task; without it, 400 tasks writing 30 dates produce 12,000 small files.

The write is an action, so it triggers the whole plan. It is also the only action in most production jobs, which is exactly as it should be.

## Submitting a job

```bash
spark-submit \
  --master yarn \
  --deploy-mode cluster \
  --num-executors 20 \
  --executor-cores 4 \
  --executor-memory 8g \
  --driver-memory 4g \
  --conf spark.sql.shuffle.partitions=400 \
  rides_etl.py --date 2026-07-01
```

That request is 20 executors × 4 cores = 80 concurrent tasks, and 20 × 8 GB = 160 GB of executor heap. `--deploy-mode cluster` runs the driver inside the cluster (right for scheduled jobs); `client` mode keeps the driver on your machine (right for interactive work). Sizing these numbers well is lesson 7's subject; running a job at all is this lesson's.

## Reading the plan and the UI

`explain(mode="formatted")` prints the physical plan. Read it bottom-up: `FileScan` at the leaves shows which files, which columns (`ReadSchema`), and which predicates were pushed down (`PushedFilters`) — if a filter you wrote is not listed there, it is being applied after reading rather than during it. `Exchange` nodes mark stage boundaries. Join operators name the strategy chosen.

The Spark UI, on port 4040 while a job runs, shows the same structure as it executes: a job list, the stage DAG, and per-stage task tables. For now, use it to confirm three things — that the stage count matches the exchange count you predicted, that the task count matches the partition count you expected, and that tasks within a stage take similar times. Turning those observations into fixes is lesson 7.

## Practice

Use a dataset of at least a few gigabytes with a natural key, a numeric measure, and a timestamp.

1. **Build the pipeline end to end.** Write a PySpark script that reads a raw CSV or JSON dataset with an explicit schema, cleans it (drop invalid rows, normalise a string key, derive a date column), aggregates it by two dimensions, joins a small dimension table, and writes Parquet partitioned by date. Run it with `spark-submit`, not a notebook. It must run start to finish with no `collect()` anywhere.

2. **Prove laziness.** Insert timing around the transformation chain and around the first action. Report how long the transformations took versus the action, and explain the difference in one sentence.

3. **Read the plan against your prediction.** Before running, predict the number of stages your job will have. Then run `explain(mode="formatted")` and count the `Exchange` nodes. Confirm in the Spark UI that stages equal exchanges plus one, and record any mismatch and its cause.

4. **Demonstrate predicate pushdown.** Run the same filtered aggregation twice: once reading the Parquet output of exercise 1, once reading the raw CSV source. Compare the bytes read reported for each scan and locate the `PushedFilters` entry in the Parquet plan. Explain why the CSV read moved so much more data.

5. **Measure recomputation, then fix it.** Take an expensive intermediate DataFrame and call three separate actions on it, timing the total. Then `cache()` it, materialise it with one `count()`, repeat the three actions, and time again. Report both totals and state the rule you would use for deciding when caching is worth it.

6. **Trigger and diagnose a driver failure — safely.** On a dataset far larger than the driver heap, call `collect()` and observe the failure. Then rewrite the intent (inspecting a sample of results) two ways that do not endanger the driver, and explain what each one moves and what it does not.
