---
course_id: de201
project_id: de201-x01
title: "Rides Feature Table on a Laptop: Point-in-Time Features with Tests"
kind: supplementary-project
status: draft
hours_estimate: 7
difficulty: core
related_lessons:
  - de201-04
  - de201-05
  - de201-06
objectives:
  - Write Spark DataFrame code that reads, transforms, and writes a large dataset
  - Engineer analytical features over a distributed dataset without collecting it to one machine
  - Choose a file format, partition layout, and compression codec for a given query pattern
competency_ids:
  - D4-S1-C01
  - D2-S1-C02
  - D5-S2-C02
---

## Scenario

The rides dataset from lesson 4 (`ride_id`, `city`, `distance_km`, `started_at`) belongs to a city bike-and-scooter operator. The pricing analytics team wants a **rider feature table**: one row per rider per as-of date, with trailing-window behaviour features, refreshed daily and queried by date. They have been burned before by a feature that "knew the future", so they want automated proof of point-in-time correctness.

You do not need a cluster. Spark's `local[*]` mode runs the same DataFrame API, the same planner, and the same shuffles on your laptop's cores. The habits and the tests transfer unchanged to the de201-09 lab and to a real cluster.

## What you will build / produce

- `generate.py` — writes a synthetic raw landing zone of newline-delimited JSON (schema below).
- `features.py` — a `spark-submit`-able job with a `build(spark, raw_path, out_path, as_of)` function.
- `test_features.py` — the pytest suite below, passing.
- `LAYOUT.md` — half a page justifying format, partition column, codec, and target file size against the team's query pattern, with `explain` excerpts showing `ReadSchema` and `PushedFilters`.

## Before you start (prerequisites, starter files or data)

- Python 3.10+, Java 17, `pip install pyspark==3.5.* pytest`. (Verify the Java version against the PySpark release you install.)
- **Synthetic data** (`generate.py`, `random.seed(7)`), about 2 million rows by default with a `--rows` flag so you can scale down to 50,000 for tests:

| Field | Type in file | Rule |
|---|---|---|
| `ride_id` | string | `R` + zero-padded integer; 1% of rides emitted twice (retried delivery), the second copy with a later `updated_at` and a corrected `fare` |
| `rider_id` | string | 20,000 riders, Zipf-ish popularity; **30% of rows carry `"unknown"`** (logged-out rides) |
| `city` | string | 6 real cities with inconsistent casing and whitespace (`" Austin"`, `"AUSTIN"`) plus a long tail of 300 junk values each under 10 rows |
| `fare` | string | `"12.40"` style; 0.5% null; 0.1% negative |
| `distance_km` | number | 0.2–40 |
| `started_at` | string | ISO-8601 within 2026-01-01 to 2026-06-30 |
| `updated_at` | string | `started_at` plus 0–3 days |
| `channel` | string | `app` 80%, `kiosk` 20% |

- A tiny dimension `dim_city.csv` with `city,region,population` for the six real cities.

## Milestones

1. **Ingest with a schema.** Read the JSON with an explicit `StructType` (no inference) and `mode=PERMISSIVE` plus a `_corrupt_record` column. Write `clean/` as Parquet after: trimming/lowercasing `city`, folding cities with fewer than 1,000 rows into `__other__`, casting `fare` to `decimal(10,2)`, dropping negative fares, for each requested `as_of`, filtering versions to `updated_at < as_of` before deduplicating on `ride_id` keeping the latest eligible `updated_at` (break equal timestamps with a stable payload hash, since every version shares its `ride_id`). Print rows in, rows dropped by reason, rows out.
2. **Separate the placeholder.** Route `rider_id = "unknown"` rows to `quarantine/unknown_rider/`; they are not a real entity (lesson 7, worked diagnosis).
3. **Features as of a parameter.** For a given `as_of` date, compute one row per rider with: `rides_all_time`, `fare_all_time`, `fare_avg`, `distance_median_approx`, `rides_7d`, `fare_30d`, `days_since_prev_ride`, `kiosk_share` (denominator guarded), and `region` from a broadcast join to `dim_city` on the rider's most frequent city (break frequency ties by city name). Use a left join and an explicit unknown-region value for `__other__`, so rare-city riders in the tiny tests are retained. Use only rows with both `started_at < as_of` and `updated_at < as_of`; a correction not yet available at the cutoff must not replace the historical version. No `collect()`, `toPandas()`, or Python loops over data values.
4. **Lay it out.** Write the feature table as Parquet, partitioned by `as_of_date`, zstd codec, `repartition` before `partitionBy`. Record file count and sizes.
5. **Predict, then explain.** Before running, write the number of `Exchange` nodes you expect in the feature query. Run `explain(mode="formatted")`, count, and reconcile in `LAYOUT.md`.
6. **Test.** Make `test_features.py` pass on a 50,000-row dataset.

## Acceptance criteria

- [ ] `python generate.py --rows 50000 --out /tmp/raw && pytest -q` passes.
- [ ] `grep -nE "collect\(|toPandas\(" features.py` returns nothing.
- [ ] Output has exactly one row per (`rider_id`, `as_of_date`); no `unknown` rider appears.
- [ ] Running the job twice for the same `as_of` produces identical data (row-level comparison with `exceptAll` both ways is empty).
- [ ] `rides_7d` uses a time-range frame (`rangeBetween`), not `rowsBetween`.
- [ ] The feature query's physical plan shows a `BroadcastHashJoin` for `dim_city`.
- [ ] `LAYOUT.md` cites the team's "filter by date constantly, by rider occasionally" pattern for every layout choice.

## Automated checks (coding courses) / Evidence checklist (non-coding)

```python
# test_features.py -- run: python generate.py --rows 50000 --out /tmp/raw && pytest -q
import datetime as dt

import pytest
from pyspark.sql import SparkSession, functions as F

import features

RAW = "/tmp/raw"
AS_OF = "2026-04-01"


@pytest.fixture(scope="session")
def spark():
    s = (SparkSession.builder.master("local[2]")
         .config("spark.sql.shuffle.partitions", "4")
         .config("spark.sql.session.timeZone", "UTC")
         .getOrCreate())
    yield s
    s.stop()


@pytest.fixture(scope="session")
def out(spark, tmp_path_factory):
    path = str(tmp_path_factory.mktemp("features"))
    features.build(spark, RAW, path, AS_OF)
    return spark.read.parquet(path)


def test_one_row_per_rider_and_date(out):
    dupes = out.groupBy("rider_id", "as_of_date").count().where("count > 1").count()
    assert dupes == 0


def test_placeholder_rider_excluded(out):
    assert out.where(F.col("rider_id") == "unknown").count() == 0


def test_no_future_leakage(spark, out):
    # Light invariant check; extend it by recomputing one rider from your clean/ output (see notes).
    sample = out.orderBy("rider_id").limit(5)
    for row in sample.toLocalIterator():           # bounded: 5 rows, inspection only
        assert row["as_of_date"] == dt.date.fromisoformat(AS_OF)
        assert row["rides_7d"] <= row["rides_all_time"]


def test_rides_7d_bounded_by_time_not_rows(spark, tmp_path):
    # Hand-built rider: rides 40, 20, 3 and 1 days before AS_OF. Correct rides_7d = 2.
    as_of = dt.datetime(2026, 4, 1)
    rows = [
        {"ride_id": f"T{i}", "rider_id": "rT", "city": "austin", "fare": "10.00",
         "distance_km": 3.0, "started_at": (as_of - dt.timedelta(days=d)).isoformat(),
         "updated_at": (as_of - dt.timedelta(days=d)).isoformat(), "channel": "app"}
        for i, d in enumerate([40, 20, 3, 1])
    ]
    raw = tmp_path / "raw"
    spark.createDataFrame(rows).write.json(str(raw))
    out_path = str(tmp_path / "out")
    features.build(spark, str(raw), out_path, AS_OF)
    r = spark.read.parquet(out_path).where("rider_id = 'rT'").first()
    assert r["rides_7d"] == 2
    assert r["rides_all_time"] == 4
    assert r["days_since_prev_ride"] == 1


def test_rides_on_as_of_date_are_excluded(spark, tmp_path):
    rows = [{"ride_id": "X1", "rider_id": "rX", "city": "austin", "fare": "5.00",
             "distance_km": 1.0, "started_at": f"{AS_OF}T08:00:00",
             "updated_at": f"{AS_OF}T08:00:00", "channel": "app"},
            {"ride_id": "X0", "rider_id": "rX", "city": "austin", "fare": "5.00",
             "distance_km": 1.0, "started_at": "2026-03-30T08:00:00",
             "updated_at": "2026-03-30T08:00:00", "channel": "kiosk"}]
    raw = tmp_path / "raw"
    spark.createDataFrame(rows).write.json(str(raw))
    out_path = str(tmp_path / "out")
    features.build(spark, str(raw), out_path, AS_OF)
    r = spark.read.parquet(out_path).where("rider_id = 'rX'").first()
    assert r["rides_all_time"] == 1
    assert r["kiosk_share"] == pytest.approx(1.0)


def test_future_correction_does_not_leak(spark, tmp_path):
    base = {"ride_id": "V1", "rider_id": "rV", "city": "austin", "fare": "5.00",
            "distance_km": 1.0, "started_at": "2026-03-30T08:00:00",
            "updated_at": "2026-03-30T08:00:00", "channel": "app"}
    corrected = dict(base, fare="500.00", updated_at="2026-04-02T08:00:00")
    raw, target = str(tmp_path / "raw"), str(tmp_path / "out")
    spark.createDataFrame([base, corrected]).write.json(raw)
    features.build(spark, raw, target, AS_OF)
    row = spark.read.parquet(target).where("rider_id = 'rV'").first()
    assert row["rides_all_time"] == 1
    assert row["fare_all_time"] == 5


def test_rerun_is_identical(spark, tmp_path):
    a, b = str(tmp_path / "a"), str(tmp_path / "b")
    features.build(spark, RAW, a, AS_OF)
    features.build(spark, RAW, b, AS_OF)
    da, db = spark.read.parquet(a), spark.read.parquet(b)
    assert da.exceptAll(db).count() == 0 and db.exceptAll(da).count() == 0


def test_dim_join_is_broadcast(spark):
    plan = features.feature_query(spark, RAW, AS_OF)._jdf.queryExecution().executedPlan().toString()
    assert "BroadcastHashJoin" in plan or "BroadcastExchange" in plan


def test_fare_is_decimal(out):
    assert dict(out.dtypes)["fare_all_time"].startswith("decimal")
```

Notes: `features.feature_query(spark, raw, as_of)` must return the final DataFrame before writing, so the plan test can inspect it. `test_no_future_leakage` is intentionally light; extend it by recomputing one rider's counts from your `clean/` output with a filter on `started_at < AS_OF` and comparing.

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Distributed discipline | A `collect()` or driver loop remains | None; all features set-oriented | Explains each shuffle in the plan and removed one |
| Point-in-time correctness | Uses full history | All features bounded by `as_of`; tests pass | Adds a versioned `dim_city` and joins on validity range |
| Cleaning | Silent drops | Counts by drop reason; quarantine for placeholder | Profiles the long-tail city values and documents the fold threshold |
| Layout | Default write | Partition, codec, file size justified against query pattern | Measures bytes read for a date-filtered query vs an unpartitioned copy |

## Stretch goals

- Scale to 20 million rows and record the stage summary metrics; identify the dominant stage.
- Replace the "most frequent city" logic with a window over counts and compare the plan.

## Reflection prompts

- Which feature was easiest to get subtly wrong, and which test caught (or would have caught) it?
- Why does treating `unknown` as a rider break both correctness and performance?

## Instructor notes (common pitfalls, how to adapt for time)

- The commonest bug is `rowsBetween(-6, 0)` for `rides_7d`; `test_rides_7d_bounded_by_time_not_rows` exists to catch it.
- Learners often set `as_of` with `current_date()`; the rerun test plus the parameter rule push back.
- Timezone surprises: the fixture pins the session timezone to UTC; make learners do the same in `features.py`.
- `test_dim_join_is_broadcast` uses an internal JVM accessor (`_jdf`); if it breaks on a future PySpark version, replace with `explain` captured to a string.
- Short on time: provide `generate.py` and the cleaning step; learners write only the features.
