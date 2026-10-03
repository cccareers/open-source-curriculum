---
course_id: de201
project_id: de201-x02
title: "Five-Minute City Revenue from Kafka: Watermarks, Checkpoints, and Late Rides"
kind: supplementary-project
status: draft
hours_estimate: 7
difficulty: stretch
related_lessons:
  - de201-08
objectives:
  - Build a streaming job that consumes from Kafka and writes results continuously
competency_ids:
  - D6-S2-C01
  - D6-S2-C02
---

## Scenario

The operator's pricing team wants rides and revenue per city in five-minute event-time windows, landed as Parquet so the rider feature job (de201-x01) can join them. Phones go offline in tunnels, so some ride events arrive minutes late and a few arrive very late. You will build the Structured Streaming job from lesson 8 on a single local Kafka broker, and prove with tests that it (1) counts moderately late events, (2) drops events past the watermark, (3) resumes after a kill without gaps or duplicates, and (4) keeps state bounded.

## What you will build / produce

- `docker-compose.yml` — one Kafka broker in KRaft mode (e.g., the `apache/kafka` image; verify the current tag and environment variables in its documentation).
- `producer.py` — a deterministic ride-event producer with controllable lateness.
- `stream_job.py` — `build_query(spark, bootstrap, topic, out_path, checkpoint, trigger)` returning a started `StreamingQuery`.
- `tests/test_stream.py` — the suite below, passing, using `trigger(availableNow=True)` so tests finish.
- `OPERATIONS.md` — consumer-lag command, the alert you would set, and what happens if the checkpoint is deleted.

## Before you start (prerequisites, starter files or data)

- Docker, Java 17, Python 3.10+, `pip install pyspark==3.5.* kafka-python-ng pytest pyarrow`. Spark needs the Kafka connector: start sessions with `spark.jars.packages=org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.1` (match your Spark and Scala versions).
- **Event schema** (JSON value, key = `city`): `ride_id` (string), `city` (one of `austin`, `dallas`, `columbus`, `fresno`), `fare` (double), `event_time` (ISO-8601 UTC).
- **Producer** (`producer.py --topic rides --start 2026-07-01T10:00:00Z --minutes 30 --late-mode none|mixed|late-only`): emits 20 rides per city per minute of event time, in event-time order. `--late-mode mixed` additionally emits, at the end (and `late-only` emits only these, relative to the stream's current max event time), 10 rides with event time 5 minutes before the max (should count) and 10 with event time 40 minutes before the max (should be dropped with a 15-minute watermark). Ride ids are deterministic so duplicates are detectable.

## Milestones

1. **Topic and producer.** Create `rides` with 6 partitions. Produce 30 minutes of clean events. Inspect with `kafka-topics.sh --describe`.
2. **Parse with a schema.** `readStream` from Kafka, `from_json` with an explicit schema, filter null/invalid rows, keep `partition` and `offset` for provenance.
3. **Window and watermark.** `withWatermark("event_time", "15 minutes")`, `groupBy(window(event_time, "5 minutes"), city)`, `count` and `sum(fare)`; append mode to Parquet with a checkpoint.
4. **Late data.** Run the mixed producer; show which late events were counted and which dropped, and connect each to the watermark arithmetic.
5. **Kill and resume.** Run, kill mid-stream, restart from the same checkpoint; prove no gaps and no duplicates by reconciling window counts against the producer's own totals.
6. **State bounds.** Record `stateOperators[0].numRowsTotal` from `lastProgress` across batches with and without the watermark.

## Acceptance criteria

- [ ] `pytest -q` passes with the Compose broker running.
- [ ] Output windows reconcile exactly with the producer's expected counts for the clean run.
- [ ] Moderately late events change their window's count; very late events do not appear anywhere in the output.
- [ ] A restart from the same checkpoint produces the same final output as an uninterrupted run.
- [ ] `OPERATIONS.md` explains consumer lag, gives the exact command, and proposes an alert threshold with reasoning.

## Automated checks (coding courses) / Evidence checklist (non-coding)

```python
# tests/test_stream.py -- requires the Kafka broker from docker-compose.yml on localhost:9092.
import subprocess
import sys
import uuid

import pytest
from pyspark.sql import SparkSession, functions as F

import stream_job

BOOTSTRAP = "localhost:9092"
PKG = "org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.1"


@pytest.fixture(scope="session")
def spark():
    s = (SparkSession.builder.master("local[2]")
         .config("spark.jars.packages", PKG)
         .config("spark.sql.shuffle.partitions", "4")
         .config("spark.sql.session.timeZone", "UTC")
         .getOrCreate())
    yield s
    s.stop()


def produce(topic, late_mode="none", minutes=30):
    subprocess.run([sys.executable, "producer.py", "--topic", topic, "--bootstrap", BOOTSTRAP,
                    "--start", "2026-07-01T10:00:00Z", "--minutes", str(minutes),
                    "--late-mode", late_mode], check=True)


def run_available_now(spark, topic, out, ckpt):
    q = stream_job.build_query(spark, BOOTSTRAP, topic, out, ckpt, trigger={"availableNow": True})
    q.awaitTermination()
    return q


def test_clean_run_reconciles(spark, tmp_path):
    topic = f"rides_{uuid.uuid4().hex[:8]}"
    produce(topic)
    run_available_now(spark, topic, str(tmp_path / "out"), str(tmp_path / "ckpt"))
    out = spark.read.parquet(str(tmp_path / "out"))
    # Windows close only once the watermark passes them; the last ~15 minutes stay open in append mode.
    closed = out.where(F.col("window_end") <= F.lit("2026-07-01 10:15:00").cast("timestamp"))
    per_window = {r["rides"] for r in closed.collect()}
    assert per_window == {100}, per_window          # 20 rides/min x 5 min per city


def test_late_events_counted_or_dropped(spark, tmp_path):
    topic = f"rides_{uuid.uuid4().hex[:8]}"
    produce(topic, minutes=60)                       # phase 1: on-time data advances the watermark
    run_available_now(spark, topic, str(tmp_path / "out"), str(tmp_path / "ckpt"))
    produce(topic, late_mode="late-only", minutes=0)  # phase 2: only the late events, in a later batch
    run_available_now(spark, topic, str(tmp_path / "out"), str(tmp_path / "ckpt"))
    out = spark.read.parquet(str(tmp_path / "out"))
    very_late_window = "2026-07-01 10:15:00"        # 40 minutes before max event time 10:59
    row = out.where(F.col("window_start") == F.lit(very_late_window).cast("timestamp")) \
             .agg(F.sum("rides")).first()[0]
    assert row == 400, "very late events must not be added to a finalised window"


def test_restart_from_checkpoint_has_no_duplicates(spark, tmp_path):
    topic = f"rides_{uuid.uuid4().hex[:8]}"
    produce(topic, minutes=20)
    run_available_now(spark, topic, str(tmp_path / "out"), str(tmp_path / "ckpt"))
    produce(topic, minutes=20)                       # producer continues the same deterministic stream
    run_available_now(spark, topic, str(tmp_path / "out"), str(tmp_path / "ckpt"))
    out = spark.read.parquet(str(tmp_path / "out"))
    dupes = out.groupBy("window_start", "city").count().where("count > 1").count()
    assert dupes == 0


def test_state_is_bounded_with_watermark(spark, tmp_path):
    topic = f"rides_{uuid.uuid4().hex[:8]}"
    produce(topic, minutes=60)
    q = run_available_now(spark, topic, str(tmp_path / "out"), str(tmp_path / "ckpt"))
    state_rows = q.lastProgress["stateOperators"][0]["numRowsTotal"]
    assert state_rows <= 4 * 4, f"state holds {state_rows} rows; expected only open windows"
```

Notes: `build_query` must select `window.start AS window_start`, `window.end AS window_end`. The producer's `--minutes` continuation must resume event time where the previous call stopped (store its cursor in a small state file). Expected numbers assume the default producer rates; recompute them if you change rates.

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Correctness | Counts by processing time | Event-time windows reconcile with producer | Explains every boundary case in the late-data run |
| Fault tolerance | Restart duplicates or skips | Checkpoint resume proven; delete-checkpoint consequence documented | `foreachBatch` idempotent sink keyed by window and city |
| State management | No watermark | Watermark bounds state; numbers shown | Compares 15-minute vs 2-hour watermark on state and completeness |
| Operations | None | Lag command and alert threshold | Lag recovery demonstrated by throttling `maxOffsetsPerTrigger` |

## Stretch goals

- Add a stream-static broadcast join to `dim_city` and confirm no shuffle of the stream in the plan.
- Switch to `update` mode writing to a SQLite upsert sink via `foreachBatch`.

## Reflection prompts

- Who should choose the watermark threshold, and what is the business cost of each extra minute?
- What exactly would you lose if someone deleted the checkpoint in production?

## Instructor notes (common pitfalls, how to adapt for time)

- Append mode emits a window only after the watermark passes its end, so the newest windows are absent at the end of an `availableNow` run; learners often think data is missing. The first test accounts for this.
- Connector version must match Spark; mismatches surface as `ClassNotFoundException`.
- Late events must arrive in a *later* micro-batch than the data that advanced the watermark; a single batch containing both will not drop anything. That is why the late-data test produces in two phases. Whether `availableNow` runs a final no-data batch that emits newly closed windows depends on Spark version and settings; confirm with a reference run before relying on exact window counts.
- The state-row bound in the last test is approximate and depends on how many windows remain open; adjust after one reference run.
- Short on time: skip the restart test and do milestone 5 by hand.
