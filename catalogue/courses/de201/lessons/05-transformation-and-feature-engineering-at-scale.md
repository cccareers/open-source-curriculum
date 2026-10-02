---
lesson_id: de201-05
course_id: de201
pathway: data-engineer
title: Transformation and Feature Engineering at Scale
order: 5
kind: lesson
competency_ids:
  - D2-S1-C02
objectives:
  - Engineer analytical features over a distributed dataset without collecting it to one machine
---

## Features are a data transformation problem

A **feature** is a column that describes an entity in a form an analysis or a model can consume: a customer's spend over the last 30 days, the number of days since their previous order, the ratio of their weekend orders to their weekday orders, the city they most often order from. The entity might be a customer, a device, a ride, or an account-day.

Building features is a data engineering job, not a modelling one. Nothing in this lesson trains a model or touches Spark's MLlib; the deliverable is a **feature table** — one row per entity (or per entity per time period), with correct, reproducible, well-named columns — written to storage for someone else to use. What makes this hard at scale is not the arithmetic. It is that the obvious single-machine formulation of almost every feature ("sort the customer's events by time and walk them") does not survive contact with a dataset spread over a hundred machines.

The discipline this lesson teaches is expressing that same intent in operations Spark can execute in parallel, without ever pulling the dataset onto one machine.

## The rule: nothing comes back to the driver

Before anything else, internalise the boundary. These operations move distributed data into the driver process, and every one of them is a bug in a feature pipeline over a large dataset:

- `collect()` and `toPandas()` — the whole result, into one heap
- `count()` inside a loop over categories — one full job per iteration
- Reading a lookup table with plain Python and iterating it row by row
- Any pattern of the shape "pull the distinct values, then loop over them"

That last pattern is the seductive one, because it works perfectly on a sample:

```python
# Anti-pattern: one full job per city, all coordinated by the driver
cities = [r.city for r in df.select("city").distinct().collect()]
frames = []
for c in cities:
    frames.append(df.filter(F.col("city") == c).agg(F.avg("fare")).withColumn("city", F.lit(c)))
result = reduce(lambda a, b: a.union(b), frames)
```

With 400 cities this launches 400 jobs, each rescanning the input. The correct version is one job and one scan:

```python
result = df.groupBy("city").agg(F.avg("fare").alias("avg_fare"))
```

The general principle: **express the feature as a set-oriented operation over the whole dataset**, and let the engine partition it. If you find yourself writing a Python loop over data values, stop and look for the grouping, window, or join that expresses the same thing.

Two operations *are* legitimate and small: bringing a genuinely tiny lookup back to the driver to broadcast it, and pulling a handful of rows with `show()` or `limit(20).toPandas()` for inspection. Both are bounded by construction. Everything else stays distributed.

## Cleaning first, because features inherit their inputs

A feature computed over dirty data is a confidently wrong number. Do the cleanup as explicit, inspectable steps.

```python
from pyspark.sql import functions as F

clean = (
    raw
    .withColumn("customer_id", F.trim(F.col("customer_id")))
    .withColumn("city", F.lower(F.trim(F.col("city"))))
    .withColumn("amount", F.col("amount").cast("decimal(12,2)"))
    .withColumn("ordered_at", F.to_timestamp("ordered_at"))
    .where(F.col("customer_id").isNotNull() & (F.length("customer_id") > 0))
    .where(F.col("amount").isNotNull() & (F.col("amount") >= 0))
)
```

Three habits are worth arguing for.

**Cast money to `decimal`, never `double`.** Floating point sums of currency drift, and the drift is proportional to how many rows you summed — which at this scale is a lot.

**Decide what a null means per column, and encode the decision.** A null `amount` on a cancelled order is not the same as a missing measurement. `fillna(0)` applied blindly turns "we do not know" into "zero", which then propagates into averages as a real value. Prefer either filtering the row, or filling *and* emitting a companion indicator column such as `amount_was_missing`.

**Deduplicate deliberately.** Distributed sources deliver duplicates routinely — retried writes, replayed batches, overlapping backfills. `dropDuplicates()` on every column is rarely what you want, because a genuine correction differs in one field. Deduplicate on the business key and keep the newest version:

```python
from pyspark.sql.window import Window

newest = Window.partitionBy("order_id").orderBy(F.col("updated_at").desc())

deduped = (
    clean.withColumn("rn", F.row_number().over(newest))
         .where(F.col("rn") == 1)
         .drop("rn")
)
```

That is a shuffle by `order_id` and it is worth it. Ties on `updated_at` make `row_number` non-deterministic, so add a stable tiebreaker column to the `orderBy` when exactness matters.

## Aggregate features

The workhorse. One group-by, many features, one shuffle.

```python
customer_features = (
    deduped.groupBy("customer_id")
    .agg(
        F.count("*").alias("orders_all_time"),
        F.sum("amount").alias("spend_all_time"),
        F.avg("amount").alias("avg_order_value"),
        F.stddev_samp("amount").alias("order_value_stddev"),
        F.min("ordered_at").alias("first_order_at"),
        F.max("ordered_at").alias("last_order_at"),
        F.countDistinct("city").alias("distinct_cities"),
        F.expr("percentile_approx(amount, 0.5)").alias("median_order_value"),
        F.sum(F.when(F.col("channel") == "mobile", 1).otherwise(0)).alias("mobile_orders"),
    )
)
```

Two techniques inside that block earn their keep everywhere.

**Conditional aggregation** — `F.sum(F.when(condition, 1).otherwise(0))` — computes a filtered count in the *same pass* as the unfiltered one. The alternative, filtering into a second DataFrame and joining it back, costs an extra scan and an extra shuffle for the same answer. The same trick gives you conditional sums, conditional averages, and pivots.

**Approximate aggregates** trade a bounded error for an enormous cost reduction. Exact `countDistinct` must gather every distinct value for a key; `approx_count_distinct` uses a HyperLogLog sketch of a few kilobytes per group and is typically within a couple of percent. Exact percentiles require a full sort; `percentile_approx` does not. For features feeding an analysis, approximate is nearly always the right call — but say so in the column name or documentation, because a downstream consumer will otherwise assume exactness.

Ratios and rates are best computed **after** the aggregation, so the arithmetic runs once per group rather than once per row, and guard the denominator:

```python
customer_features = customer_features.withColumn(
    "mobile_share",
    F.when(F.col("orders_all_time") > 0,
           F.col("mobile_orders") / F.col("orders_all_time")).otherwise(None),
)
```

## Window features

Windows compute a value for each row from a set of related rows, without collapsing the dataset. They are how you express "compared to this customer's own history" — the richest family of features there is.

```python
by_customer_time = Window.partitionBy("customer_id").orderBy("ordered_at")

with_history = (
    deduped
    .withColumn("prev_ordered_at", F.lag("ordered_at").over(by_customer_time))
    .withColumn("order_seq", F.row_number().over(by_customer_time))
    .withColumn("running_spend", F.sum("amount").over(by_customer_time))
    .withColumn(
        "days_since_prev",
        F.datediff(F.col("ordered_at"), F.col("prev_ordered_at")),
    )
)
```

`partitionBy` decides which rows share a window; `orderBy` decides their order within it. Both together produce one shuffle on the partition key — and, importantly, all rows of one window must fit on one executor, so a window partitioned by a low-cardinality column such as `country` is a skew hazard. Partition windows by the entity key, not by a category.

**Frames** control which rows in the window a function sees. The default when you specify `orderBy` is all rows from the start of the partition up to the current row, which is what makes `running_spend` cumulative. A rolling window over time is expressed with a range frame in seconds:

```python
last_30d = (
    Window.partitionBy("customer_id")
    .orderBy(F.col("ordered_at").cast("long"))
    .rangeBetween(-30 * 86400, 0)
)

rolling = (
    with_history
    .withColumn("spend_30d", F.sum("amount").over(last_30d))
    .withColumn("orders_30d", F.count("*").over(last_30d))
)
```

`rangeBetween` measures in *values* of the ordering column — here seconds, because the timestamp was cast to a long. `rowsBetween` measures in *rows*. Confusing the two is the most common window bug: `rowsBetween(-29, 0)` gives you the last thirty orders, not the last thirty days, and on an irregular customer that can span years.

## Enrichment joins, done safely

Features often come from another dataset: a customer's segment, a city's population, a product's category.

```python
segments = spark.read.parquet("/data/dim/customer_segments")   # small

enriched = customer_features.join(F.broadcast(segments), on="customer_id", how="left")
```

Use a `left` join for enrichment so unmatched entities survive with nulls rather than silently vanishing — an `inner` join that quietly drops 8% of your customers is a data-loss bug that no error message will report. Broadcast the small side to skip the shuffle. And always verify cardinality: if the dimension has duplicate keys, the join multiplies your fact rows and every downstream aggregate is inflated.

```python
before = customer_features.count()
after = enriched.count()
# assert before == after, or find out why not
```

Two counts is a cheap check next to a wrong feature table shipped to three teams.

## Categorical columns, as a data transformation

Turning categories into numbers is usually described as a modelling step; the part that belongs to you is the data transformation that makes it safe at scale.

**Cardinality reduction** is the first move. A `city` column with 40,000 values, most appearing twice, is noise. Compute frequencies and collapse the long tail:

```python
freq = deduped.groupBy("city").agg(F.count("*").alias("city_count"))
top = freq.where(F.col("city_count") >= 1000).select("city")

folded = (
    deduped.join(F.broadcast(top), on="city", how="left_semi")
           .withColumn("city_grouped", F.col("city"))
           .unionByName(
               deduped.join(F.broadcast(top), on="city", how="left_anti")
                      .withColumn("city_grouped", F.lit("__other__")),
               allowMissingColumns=True,
           )
)
```

**Frequency encoding** — replacing a category with how often it occurs — is a straight join of the frequency table back onto the rows and is entirely a transformation.

**Binning** a numeric column into ordered buckets is a `when` chain or a `Bucketizer`-style expression; prefer explicit business-meaningful edges over quantiles computed on the fly, because quantile edges recomputed each run make yesterday's `band_3` mean something different from today's.

What matters most is **stability**: an encoding whose mapping is recomputed from the current data every run produces features that are not comparable across runs. If a mapping must be learned from data, write it out as its own dated table and join it, rather than recomputing it inline.

## Time correctness

The most damaging feature bug is invisible in the output: a feature that used information from after the moment it claims to describe. Sum a customer's *entire* spend and attach it to an event from January, and the January row now knows about December. Any analysis built on it will look brilliant and fail in production.

The fix is structural. Define, for every feature row, an **as-of timestamp**, and construct every feature from records strictly at or before it. The window frames above do this naturally when ordered by event time — `rangeBetween(-30 * 86400, 0)` cannot see the future because the frame ends at the current row. Trouble arrives with joins to dimension tables that hold only current values: joining today's customer segment onto a two-year-old event silently imports the future. Where history matters, keep dimensions versioned with validity ranges and join on the range.

Second, make features **reproducible**. Rerunning the pipeline over the same input must produce the same output. That rules out `current_timestamp()` and `now()` inside feature logic — pass the run date in as a parameter instead — and it rules out unseeded randomness and non-deterministic tiebreakers.

```python
RUN_DATE = F.lit("2026-07-01").cast("date")     # parameter, not now()

point_in_time = (
    events.where(F.col("ordered_at") < RUN_DATE)
          .groupBy("customer_id")
          .agg(F.sum("amount").alias("spend_to_date"))
          .withColumn("as_of_date", RUN_DATE)
)
```

## Custom logic: built-ins, then pandas UDFs, then Python UDFs

Sometimes no built-in expresses what you need. The order of preference is fixed by how each option executes.

**Built-in functions and `F.expr`** run inside the JVM with generated code and are visible to Catalyst. Always first choice, and the library is much larger than people assume — regex extraction, JSON parsing, date arithmetic, array and map functions, `higher-order` functions such as `transform` and `filter` over array columns.

**Pandas UDFs** (vectorised UDFs) hand each partition to Python as an Arrow batch, so the per-row serialisation cost disappears and you can use pandas or NumPy on the batch. Typically several times faster than a plain Python UDF.

```python
from pyspark.sql.functions import pandas_udf
import pandas as pd

@pandas_udf("double")
def zscore_within_batch(values: pd.Series) -> pd.Series:
    return (values - values.mean()) / values.std(ddof=0)
```

Note the trap in that example: it standardises within whatever Arrow batch arrives, which is *not* the whole dataset. Statistics that must be global have to be computed globally — as an aggregate — and then applied, usually via a broadcast join. A vectorised UDF only sees its own slice.

**Plain Python UDFs** serialise every row to a Python worker and back, are opaque to the optimiser, and block predicate pushdown through them. Use them when nothing else fits, keep them small, and never put one where a filter could have run first.

## Writing the feature table

```python
(
    feature_table
    .repartition("as_of_date")
    .write
    .mode("overwrite")
    .partitionBy("as_of_date")
    .parquet("/data/features/customer_daily")
)
```

Name columns so that the entity, the measure, and the window are all legible: `spend_30d` and `orders_7d` beat `f1` and `feat_b`. Keep the as-of column in the data, not only in the path. Layout and format decisions — why Parquet, how to size the files, which columns to partition on — are lesson 6's subject, and the choices there apply directly to this output.

## Practice

Use a transactional dataset with an entity key, a timestamp, a numeric amount, and at least one categorical column; tens of millions of rows or more.

1. **Build a feature table.** Produce one row per entity per as-of date containing at least: lifetime order count and spend, average and median order value, spend over the trailing 7 and 30 days, days since previous order, distinct categories used, and the share of orders in one channel. Write it as Parquet partitioned by `as_of_date`. The script must contain no `collect()` or `toPandas()` and must run as a single `spark-submit` job.

2. **Rewrite a driver loop.** Start from the anti-pattern in this lesson (collect distinct keys, loop, union). Time it on your data, then rewrite it as one grouped aggregation and time that. Report both wall-clock times and the number of Spark jobs each version launched.

3. **Rolling window, done right.** Compute `spend_30d` twice: once with `rowsBetween(-29, 0)` and once with a 30-day `rangeBetween`. Find three entities whose values differ, show their raw event timestamps, and explain exactly why the two definitions disagree.

4. **Catch a leak.** Deliberately build one feature that uses the full history regardless of the as-of date. Then compare, for a single entity and an early as-of date, that feature against its correctly bounded version. Show the two numbers and write two sentences on how this would mislead a downstream analysis.

5. **Approximate versus exact.** Compute `countDistinct` and `approx_count_distinct` on the same high-cardinality column, and `percentile_approx` against an exact median. Record the runtimes, the shuffle volumes, and the relative error, then state which you would ship and how you would communicate the choice.

6. **Make a join safe.** Join your feature table to a dimension table that you have seeded with a duplicate key. Show the row count before and after, explain the inflation, and fix it two ways — by deduplicating the dimension, and by aggregating it to one row per key — noting when each fix is the right one.

7. **Beat a UDF.** Write a plain Python UDF for a non-trivial string or date transformation and time the job. Replace it with built-in functions, or a pandas UDF if no built-in exists, and time it again. Report the speedup and explain, in terms of where the code executes, why it happened.
