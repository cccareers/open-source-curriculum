---
course_id: de201
title: "Big Data Processing with Spark & Hadoop — Enhancement Review"
reviewed_lessons: 9
status: draft
---

## Summary

An excellent, tightly sequenced course: storage, shuffle, execution model, features, layout, tuning, streaming, each building on the last, with a capstone lab that exercises all three big-data competencies. The two biggest opportunities are (1) access to practice data and compute — every practice section assumes multi-gigabyte datasets and a cluster, with no local-mode path or shared generator — and (2) a few code samples that contradict their own surrounding guidance (compaction overwriting its own input, Delta-only options on a Parquet writer).

## Clarity issues

| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| de201-06 | "File sizing and compaction" | Code reads and overwrites the same path, immediately followed by a warning never to do that. | Code now writes to a staging path, with a swap comment. | Applied |
| de201-08 | "Delivery semantics" | `txnAppId` / `txnVersion` are Delta Lake writer options and are ignored by `format("parquet")`; the example implies they provide idempotency. | Added a paragraph explaining where idempotency actually comes from and the DB-sink equivalent. | Applied |
| de201-07 | "Sizing executors" | Dynamic allocation advice assumes an external shuffle service, which Kubernetes deployments typically lack. | Added `shuffleTracking` alternative (Spark 3.0+). | Applied |
| de201-03 / 04 / 05 | Practice intros | "Tens of millions of rows", "a few gigabytes", but no named dataset or generator. | Point to a shared synthetic rides generator (de201-x01) with a `--rows` flag and local-mode instructions. | Proposed |
| de201-05 | "Window features" | `running_spend` uses the default frame, which with `orderBy` is a RANGE frame: ties on `ordered_at` are summed together, unlike a strict row-by-row running total. de102-03 explains this; de201 does not. | One sentence plus `rowsBetween(Window.unboundedPreceding, Window.currentRow)` alternative. | Proposed |
| de201-04 | "Caching" | `cache()` default storage level has changed across Spark versions (MEMORY_AND_DISK vs MEMORY_AND_DISK_DESER for Datasets in 3.x). | Verify against pinned Spark version; soften to "a memory-and-disk storage level". | Proposed (unverified) |
| de201-02 | "The rest of the ecosystem" | "Consistency and cost models differ" — S3 has been strongly read-after-write consistent since Dec 2020; learners may read old advice about eventual consistency. | Add a clause that major object stores are now strongly consistent for single objects but listing/rename semantics still differ. | Proposed |

## Depth and coverage gaps

- **No local path to practice.** Many apprentices will not have a cluster. Spark `local[*]` reproduces stages, exchanges, AQE, and skew symptoms at small scale. Objective: "Write Spark DataFrame code that reads, transforms, and writes a large dataset".
- **No automated feature-correctness checks.** Lesson 5 explains leakage and reproducibility well but practice relies on manual inspection. Project x01 adds pytest checks for point-in-time correctness and rerun identity. Objective: "Engineer analytical features over a distributed dataset without collecting it to one machine".
- **Streaming lacks a runnable local stack.** A `docker-compose.yml` with a single Kafka broker (KRaft mode) and a producer script would remove the main barrier to lesson 8 practice. Project x02 provides it. Objective: "Build a streaming job that consumes from Kafka and writes results continuously".
- **Tuning practice needs a reproducible broken job.** Lesson 7's practice asks learners to inject skew; a provided "broken" script with known pathologies (skew, too few partitions, missing broadcast) would make diagnosis practice comparable across learners. Objective: "Diagnose a slow or failing Spark job from its execution metrics and fix the root cause".
- **Lesson 9 lab** has a clear definition of done but no automated checks; reuse the x01 test patterns (one-row-per-key, no `collect`, rerun identity, broadcast in plan).

## Proposed additional projects

- **x01 Rides Feature Table on a Laptop** (drafted) — lessons 04–06; PySpark local mode, synthetic data, pytest.
- **x02 Five-Minute City Revenue from Kafka** (drafted) — lesson 08; Docker Kafka, producer with late events, Structured Streaming with watermark and checkpoint, restart and lateness tests.
- "Broken job clinic": three provided jobs each with one pathology; learner submits UI evidence and fix. Not drafted.
- HDFS sandbox exploration with `fsck` (lesson 2) using a single-node Docker Hadoop image. Not drafted.

## Video and animation opportunities

- **Count the exchanges** (de201-03/04) — screencast. *Drafted: media/video-01-counting-exchanges.md.*
- **Reading the stage summary metrics table** (de201-07) — screencast walking the worked diagnosis. *Drafted: media/video-02-reading-stage-summary-metrics.md.*
- **Inside a shuffle and the hot key** (de201-03/07) — explainer animation. *Drafted: media/animation-01-shuffle-and-the-hot-key.md.*
- HDFS write pipeline and rack-aware placement (de201-02) — explainer animation; pairs with `hdfs-block-replication.png`. Not drafted.
- Watermark and late data in event-time windows (de201-08) — explainer animation. Not drafted.
- Parquet row-group skipping with sorted vs unsorted data (de201-06) — explainer animation. Not drafted.

## Assessment ideas

- Exchange prediction quiz: ten DataFrame chains, learner predicts exchange count and key.
- Stage summary metrics cards: five metric tables, learner names the failure mode (skew, spill, too many partitions, straggler, wrong join).
- Layout decision memo graded on whether every choice cites the query pattern.
- Watermark scenarios: given event times and a watermark, mark which records are counted or dropped.

## Changes applied in this pass

- `06-storage-formats-and-compression.md`, "File sizing and compaction": compaction example now writes to a staging path.
- `07-tuning-spark-jobs-for-scale.md`, "Sizing executors": added Kubernetes `shuffleTracking` note.
- `08-streaming-with-kafka-and-structured-streaming.md`, "Delivery semantics": explained Delta-only `txn` options and where idempotency comes from.

## Open questions for the course owner

- Which Spark version is pinned (3.5? 4.0?) and which cluster manager will learners use? Affects caching defaults, AQE defaults, and Python/Java requirements.
- Will the program supply a cluster, or should local mode be the official practice path with cluster runs optional?
- Confirm `hdfs-block-replication.png`, `shuffle-map-reduce.png`, and `parquet-file-layout.png` exist in `img/`.
- Lesson 9 says "Budget three hours" for a multi-gigabyte end-to-end lab with a performance report; that seems short. Confirm.
