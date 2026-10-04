---
lesson_id: de201-08
course_id: de201
pathway: data-engineer
title: Streaming with Kafka and Structured Streaming
order: 8
kind: lesson
competency_ids:
  - D6-S2-C01
  - D6-S2-C02
objectives:
  - Build a streaming job that consumes from Kafka and writes results continuously
---

## A stream is a table that never stops growing

Everything so far has been batch: a dataset that exists, is read once, and is finished. Streaming changes exactly one assumption — the input is **unbounded**. New records keep arriving, the job never reaches the end of its input, and results must be produced continuously rather than once.

Structured Streaming's central idea is that this needs almost no new programming model. Treat the stream as a table to which rows are appended forever. Your query is written against that table exactly as if it were static. The engine runs it incrementally: each time new data arrives, it computes what the query's result *would* be over everything received so far and emits the change.

That is why streaming comes last in this course. The DataFrame operations, the shuffle behaviour, the partitioning, and the tuning instincts all carry over unchanged. What you add here is a source that never ends, a notion of time, and a way to remember state between batches.

## Kafka, in the terms you need

Apache Kafka is the transport almost every streaming pipeline sits on. It is best understood as a distributed, durable, replayable log.

A **topic** is a named stream of records. Each topic is split into **partitions**, and a partition is an append-only ordered log. Every record in a partition has a monotonically increasing **offset**. Records are key/value byte pairs with a timestamp and optional headers.

**Producers** append records. If a record carries a key, Kafka hashes it to choose a partition, so all records for one key land in one partition and stay in relative order. Records without a key are spread round-robin. Kafka guarantees ordering **within a partition only** — there is no global order across a topic, and designing as if there were is a common and painful mistake.

**Consumers** read forward from an offset and commit their position. A **consumer group** shares out a topic's partitions among its members, so one partition is consumed by exactly one member of a group at a time. This makes Kafka partitions the unit of consumer parallelism, exactly as file splits were the unit of reader parallelism in batch.

Two properties make Kafka more than a queue. Records are **retained** for a configured period or size regardless of whether anyone read them, so a consumer can rewind and replay history — which is what makes reprocessing after a bug possible. And partitions are **replicated** across brokers with a leader and followers, so a broker failure does not lose data.

```bash
# Inspect a topic's partitions, leaders, and replicas
kafka-topics.sh --bootstrap-server localhost:9092 --describe --topic rides

# See how far behind a consumer group is, per partition
kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
  --describe --group rides-aggregator
```

That second command prints `CURRENT-OFFSET`, `LOG-END-OFFSET`, and `LAG` for each partition. **Consumer lag is the single most important health metric for a streaming pipeline**: stable lag means you are keeping up, steadily growing lag means you are not, and no amount of dashboard elsewhere substitutes for it.

Designing topics, keys, and event contracts across a system is event-driven architecture and belongs to de210. Here, Kafka is a source and a sink.

## Reading a stream

```python
from pyspark.sql import functions as F
from pyspark.sql.types import StructType, StructField, StringType, DoubleType, TimestampType

raw = (
    spark.readStream
    .format("kafka")
    .option("kafka.bootstrap.servers", "broker1:9092,broker2:9092")
    .option("subscribe", "rides")
    .option("startingOffsets", "latest")
    .option("maxOffsetsPerTrigger", 500000)
    .load()
)
```

`readStream` instead of `read` is the whole API difference. What comes back has a fixed schema: `key`, `value`, `topic`, `partition`, `offset`, `timestamp`, `timestampType`. Both `key` and `value` are binary, so parsing is yours to do:

```python
schema = StructType([
    StructField("ride_id", StringType()),
    StructField("city", StringType()),
    StructField("fare", DoubleType()),
    StructField("event_time", TimestampType()),
])

rides = (
    raw.select(
        F.col("key").cast("string").alias("kafka_key"),
        F.from_json(F.col("value").cast("string"), schema).alias("d"),
        F.col("timestamp").alias("ingest_time"),
        F.col("partition"),
        F.col("offset"),
    )
    .select("kafka_key", "d.*", "ingest_time", "partition", "offset")
)
```

Two options above deserve attention. `startingOffsets` is `latest` (only new records) or `earliest` (replay everything retained) — and it applies only on the *first* run, because after that the checkpoint decides. `maxOffsetsPerTrigger` caps how much one batch consumes, which is what stops a job that starts from `earliest` on a month of history from trying to process it all in a single enormous batch.

## Event time, processing time, and watermarks

Batch work rarely forces you to distinguish two clocks. Streaming does.

**Event time** is when the thing happened, recorded in the record by the producer. **Processing time** is when your job saw it. They differ, sometimes by seconds and sometimes by hours: a mobile app was offline, a broker retried, a partition was backed up.

Correct aggregation uses event time. "Rides per city per five minutes" must mean five minutes of the world, not five minutes of your job's uptime, or the same input replayed later produces different answers.

Which raises the hard question: if you are aggregating the 10:00–10:05 window and a record with event time 10:03 arrives at 10:47, do you accept it? You cannot wait forever, because holding every window's state forever exhausts memory. You cannot close immediately, because you would drop legitimate late data.

A **watermark** is your answer, declared explicitly: *I will accept data up to this late, and no later.*

```python
windowed = (
    rides
    .withWatermark("event_time", "15 minutes")
    .groupBy(
        F.window(F.col("event_time"), "5 minutes"),
        F.col("city"),
    )
    .agg(
        F.count("*").alias("rides"),
        F.sum("fare").alias("revenue"),
    )
)
```

The engine tracks the maximum event time it has seen and subtracts the threshold. Windows ending before that point are finalised and their state dropped; records older than it are discarded. The threshold is a business decision expressed as a config: 15 minutes trades a little completeness for bounded memory; 24 hours holds a day of window state in exchange for tolerating a day of delay.

Watermarks matter beyond memory. **Without a watermark, any streaming aggregation accumulates state without limit**, and the job will eventually die — often days after it looked healthy in testing. Sliding and session windows work the same way:

```python
F.window(F.col("event_time"), "10 minutes", "5 minutes")   # sliding: 10-min windows every 5
F.session_window(F.col("event_time"), "30 minutes")        # session: gap-based
```

## Output modes

A streaming query has to say *what* it emits each time it runs.

**Append** emits only rows that are final and will never change. It is the only mode allowed for a query with no aggregation, and for an aggregation it requires a watermark — the window's rows are emitted once the watermark has passed its end. Use it for anything writing to files.

**Update** emits rows whose value changed since the last batch. Good for a key-value sink or a dashboard store where you can upsert.

**Complete** emits the entire result table every batch. Only viable for aggregations with a bounded number of groups, since the whole result is rewritten each time, and it requires holding all state forever.

Mode, sink, and aggregation are coupled: file sinks accept append only; the console sink accepts all three; `foreachBatch` gives you whatever your code implements. Choosing complete mode on an unbounded grouping key is a slow-motion memory failure.

## Writing, triggers, and checkpoints

```python
query = (
    windowed
    .select(
        F.col("window.start").alias("window_start"),
        F.col("window.end").alias("window_end"),
        "city", "rides", "revenue",
    )
    .writeStream
    .format("parquet")
    .outputMode("append")
    .option("path", "/data/marts/rides_5min")
    .option("checkpointLocation", "/checkpoints/rides_5min")
    .partitionBy("city")
    .trigger(processingTime="1 minute")
    .start()
)

query.awaitTermination()
```

**The checkpoint is not optional.** It stores the offsets consumed, the aggregation state, and a write-ahead log of what has been committed. It is what lets a killed job restart exactly where it left off instead of reprocessing or skipping. One checkpoint location per query, never shared, never deleted casually — deleting it resets the job's memory of where it was.

**Triggers** control batch cadence. `processingTime="1 minute"` starts a batch every minute. The default fires a new batch as soon as the previous one finishes, which minimises latency and maximises small-file production. `availableNow=True` processes everything currently available and stops, which is the modern way to run a streaming pipeline on a schedule — same code, batch economics.

Structured Streaming is fundamentally **micro-batch**: each trigger runs a small, ordinary Spark job. That is why every batch lesson transfers. It also sets the latency floor at hundreds of milliseconds to seconds, which is fine for analytics and wrong for sub-millisecond needs.

**Small files are the streaming tax.** A one-minute trigger with 50 partitions produces 72,000 files a day. Coalesce before writing, use a longer trigger where latency allows, and schedule compaction as covered in lesson 6.

## Delivery semantics

The guarantee available is **end-to-end exactly-once**, and it requires the engine and the sink to cooperate. Spark contributes replayable offsets in the checkpoint and deterministic recomputation. The sink must contribute either idempotent writes or transactional commits — a sink that appends blindly will duplicate records after a restart, because Spark will legitimately reprocess an uncommitted batch.

File sinks achieve this with a commit log listing exactly which files belong to which batch, so files from a failed batch are ignored. For an external system, `foreachBatch` gives you a normal batch DataFrame and a batch id, which is the hook for an idempotent upsert:

```python
def upsert_batch(batch_df, batch_id):
    (
        batch_df.write
        .mode("overwrite")
        .option("txnAppId", "rides_5min")
        .option("txnVersion", batch_id)
        .format("parquet")
        .save(f"/data/marts/rides_5min/batch={batch_id}")
    )

query = (
    windowed.writeStream
    .foreachBatch(upsert_batch)
    .option("checkpointLocation", "/checkpoints/rides_5min_fb")
    .trigger(processingTime="2 minutes")
    .start()
)
```

A caution on the two `txn` options: `txnAppId` and `txnVersion` are understood by the Delta Lake writer, which uses them to skip a batch it has already committed. A plain Parquet writer ignores them. In this example the idempotency actually comes from the path — each batch overwrites its own `batch={batch_id}` directory, so a replayed batch replaces its earlier output rather than adding to it. For a database sink, the equivalent is a `MERGE` keyed on the window and city, or a delete-then-insert of that batch's keys inside one transaction.

`foreachBatch` also unlocks operations Structured Streaming does not support directly on a stream, since inside it you hold an ordinary DataFrame.

## Joins

**Stream-static** joins are the common enrichment case and are cheap: the static side is re-read (or broadcast) each batch and joined to the incoming rows. Ideal for dimension lookups.

```python
cities = spark.read.parquet("/data/dim/cities")
enriched = rides.join(F.broadcast(cities), on="city", how="left")
```

**Stream-stream** joins are genuinely harder, because a matching record on the other side may not have arrived yet. Both sides must be buffered, so both need watermarks *and* a time constraint bounding how far apart matching events can be:

```python
clicks = clicks.withWatermark("click_time", "10 minutes")
impressions = impressions.withWatermark("impression_time", "30 minutes")

attributed = impressions.join(
    clicks,
    F.expr("""
        impression_id = click_impression_id AND
        click_time >= impression_time AND
        click_time <= impression_time + interval 20 minutes
    """),
    "leftOuter",
)
```

Without the time bound, state grows forever. Outer joins additionally wait until the watermark proves no match can still arrive before emitting a null-padded row, which means outer results are delayed by design.

## Operating the job

Streaming jobs run for weeks, so operability is part of the build.

`query.lastProgress` returns per-batch metrics as a dictionary: `inputRowsPerSecond`, `processedRowsPerSecond`, `batchDuration`, `numInputRows`, and state-store row counts. The two numbers to alert on are **processed versus input rate** — if processing is slower than arrival, lag grows without bound — and **batch duration versus trigger interval**; a two-minute batch on a one-minute trigger means the job never catches up.

Watch state store size across batches. Growth that never plateaus means a missing or overlong watermark, or an unbounded grouping key, and it will end in an out-of-memory failure.

Plan for restarts. Code changes that alter the aggregation's state schema are generally not compatible with an existing checkpoint; expect to start a new checkpoint and backfill the gap from Kafka's retained history, which is precisely why replayability is worth paying for. Scheduling, retries, alerting, and dependency management belong to de210; what belongs here is emitting the metrics that make those possible.

## The alternatives, briefly

Structured Streaming is not the only tool for this competency, and you should be able to say when another fits.

**Kafka Streams** is a Java or Scala *library* you embed in an application. There is no cluster to run — parallelism comes from running more instances of your app in a consumer group. Ideal for per-event transformation and enrichment inside a service, and it is Kafka-to-Kafka by nature.

**Apache Flink** is a true event-at-a-time engine with sophisticated state management, event-time handling, and genuinely low latency. Where Structured Streaming batches and Flink streams, Flink wins on latency and on complex stateful patterns; Structured Streaming wins on sharing exactly one API, one codebase, and one skill set with your batch work.

Choose Structured Streaming when the team already runs Spark and latency in seconds is acceptable — which covers most analytical streaming. Choose Kafka Streams for lightweight in-application processing. Choose Flink when sub-second latency or elaborate stateful logic is the requirement.

## Practice

You need a reachable Kafka cluster (a single-broker local instance is fine) and a producer script generating records with an `event_time` field.

1. **Get end to end.** Create a topic with 6 partitions, produce a continuous stream of JSON ride events, and build a Structured Streaming job that reads it, parses the JSON with an explicit schema, filters invalid records, and writes Parquet with a checkpoint. Let it run for ten minutes and confirm records are landing.

2. **Prove the checkpoint works.** With the job running, kill it. Note the last offsets in the checkpoint. Restart it and show — from output row counts and Kafka offsets — that it resumed without gaps and without duplicates. Then delete the checkpoint, restart, and describe exactly what changed and why that is dangerous.

3. **Window on event time.** Add a five-minute tumbling windowed aggregation per city with a 15-minute watermark, output mode append, writing to Parquet. Then modify your producer to emit some records with event times 5 minutes late and some 40 minutes late. Show which were counted, which were dropped, and connect each outcome to the watermark.

4. **Watch state grow, then bound it.** Run the same windowed aggregation with the watermark removed. Record the state-store row count from `lastProgress` every batch for several minutes and plot or tabulate it. Re-add the watermark and repeat. Explain the difference in one paragraph and state how you would have caught this before production.

5. **Compare output modes.** Run the aggregation in append, update, and complete modes against sinks each supports. Record what each emitted for the same input, and explain which mode you would choose for (a) a Parquet mart, (b) a live dashboard backed by a key-value store, and (c) a small fixed set of counters.

6. **Enrich from a static table.** Add a stream-static broadcast join to a city dimension. Confirm from the plan that no shuffle of the stream occurs, then update the dimension file on disk and describe when the running query picks up the change.

7. **Measure and interpret lag.** While the job runs, use `kafka-consumer-groups.sh` to record lag per partition each minute. Then reduce `maxOffsetsPerTrigger` sharply so the job falls behind. Show lag growing, restore the setting, and show it recovering. Write two sentences on what alert you would set and at what threshold.

8. **Argue the tool choice.** For each of three scenarios — enriching every order inside a Java microservice; producing five-minute analytics marts on an existing Spark platform; fraud detection needing sub-200 ms decisions — name the tool you would choose from Structured Streaming, Kafka Streams, and Flink, and give the deciding reason in one sentence each.
