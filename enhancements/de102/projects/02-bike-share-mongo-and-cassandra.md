---
course_id: de102
project_id: de102-x02
title: "Bike-Share Trips in MongoDB and Cassandra: Model for the Query, Then Prove It"
kind: supplementary-project
status: draft
hours_estimate: 9
difficulty: stretch
related_lessons:
  - de102-08
  - de102-09
objectives:
  - Design a MongoDB document model and a Cassandra table around their access patterns
  - Diagnose and reduce read and write latency in a NoSQL deployment
competency_ids:
  - D3-S1-C01
  - D3-S1-C02
  - D5-S2-C01
  - D5-S2-C02
---

## Scenario

The bicycle-share system from lesson 8's practice needs two stores: MongoDB behind the rider app (station pages, a rider's trip history) and Cassandra for the high-volume dock telemetry feed. The product team has given you five access patterns and a latency target for each. Your job is to design both models from those patterns, load realistic synthetic data, measure, tune, and leave behind tests that fail if someone later breaks the model (for example, by reintroducing an unbounded array or a query that needs `ALLOW FILTERING`).

## What you will build / produce

- `docker-compose.yml` with `mongo:7` and `cassandra:5` (single node; set `MAX_HEAP_SIZE=1G` on laptops).
- `generate.py` — synthetic stations, riders, trips, and dock readings (below).
- `mongo_model.md` and `cassandra_model.md` — each access pattern mapped to its collection/table, keys, and indexes, with the embed/reference or partition/clustering decision and the pattern it optimises.
- `load.py`, `queries.py` — loaders and one function per access pattern.
- `tests/test_models.py` — the suite below, passing.
- `TUNING.md` — before/after numbers for at least two changes (one per store).

## Before you start (prerequisites, starter files or data)

- Docker, Python 3.10+, `pip install pymongo cassandra-driver pytest`. (Verify `cassandra-driver` supports your Python version; if not, use Python 3.11.)
- **Synthetic data** (`generate.py --scale small`, `random.seed(5)`):
  - 300 stations (`station_id`, `name`, `lat`, `lon`, `capacity`, `borough` (five fixed borough labels, including every station in the tiny dataset)), 20,000 riders.
  - 500,000 trips over 2026-01-01 through 2026-03-31: `trip_id`, `rider_id`, `start_station_id`, `end_station_id`, `started_at`, `duration_sec`, `fare`. Station popularity is skewed: 10 stations take 25% of trips.
  - 2,000,000 dock readings: `station_id`, `observed_at` (every 5 min; include 2026-01-15 at both scales), `bikes_available`, `docks_available`.
  - `--scale tiny` (10,000 trips) for tests.

**Access patterns (with targets on the small scale, local laptop):**

| # | Pattern | Store | Target p95 |
|---|---|---|---|
| A1 | Station page: station details + 5 most recent trips starting there | MongoDB | < 20 ms |
| A2 | Rider history: a rider's trips in a date range, newest first, 20 per page | MongoDB | < 20 ms |
| A3 | Top 10 stations by trip count in a date range, with names | MongoDB aggregation | < 500 ms |
| A4 | Dock readings for one station for one day, newest first | Cassandra | < 10 ms |
| A5 | Latest reading for every station in one borough (dashboard) | Cassandra | < 50 ms |

## Milestones

1. **Design on paper.** For each pattern, write the query first, then the model. MongoDB: decide embed vs reference for station → recent trips (subset pattern), rider → trips (reference; unbounded), and any computed fields. Cassandra: choose partition key, clustering columns, clustering order, and a bucket that bounds partition size for A4; design a second table for A5 rather than an index.
2. **Validate the shape.** Add `$jsonSchema` validation to `trip` and `station`. Demonstrate one rejected insert.
3. **Load.** `bulkWrite` / `insert_many(ordered=False)` for MongoDB; prepared statements and concurrent execution for Cassandra (no multi-partition batches).
4. **Measure.** For each pattern, record p50/p95 over 200 runs, plus `explain("executionStats")` for MongoDB (`totalDocsExamined` vs `nReturned`) and `TRACING ON` output for one Cassandra query.
5. **Tune.** At least one ESR-ordered or covering index in MongoDB with before/after, and one Cassandra change (bucket size, compaction strategy to TWCS with TTL, or consistency level) with before/after.
6. **Guardrails as tests.** Make the suite pass.

## Acceptance criteria

- [ ] Every access pattern is served by exactly one query; A3 may join station names with `$lookup` after limiting to ten stations, while A1/A2 use one collection without `$lookup` and without `ALLOW FILTERING` anywhere.
- [ ] No MongoDB document contains an array that grows without bound with traffic (recent-trips subset capped with `$push` + `$slice`).
- [ ] No Cassandra partition in `readings_by_station_day` exceeds 100,000 rows at the small scale (show `nodetool tablestats` max partition size).
- [ ] `TUNING.md` contains before/after p95 and the examined/returned ratio (MongoDB) or trace step timings (Cassandra) for two changes.
- [ ] `pytest -q` passes against the tiny dataset.

## Automated checks (coding courses) / Evidence checklist (non-coding)

```python
# tests/test_models.py -- requires the compose stack and `python generate.py --scale tiny && python load.py`.
import datetime as dt

import pytest
from cassandra.cluster import Cluster
from cassandra.protocol import InvalidRequest
from pymongo import MongoClient
from pymongo.errors import WriteError

import queries


@pytest.fixture(scope="module")
def mdb():
    return MongoClient("mongodb://localhost:27017")["bikeshare"]


@pytest.fixture(scope="module")
def cs():
    session = Cluster(["127.0.0.1"]).connect("bikeshare")
    yield session
    session.shutdown()


def test_station_page_is_one_read_with_bounded_subset(mdb):
    st = mdb.station.find_one({}, {"recent_trips": 1})
    assert len(st.get("recent_trips", [])) <= 5


def test_rider_history_uses_index_efficiently(mdb):
    rider = mdb.trip.find_one()["rider_id"]
    plan = queries.rider_history_cursor(mdb, rider, dt.datetime(2026, 1, 1), dt.datetime(2026, 4, 1)) \
        .explain()["executionStats"]
    assert plan["totalDocsExamined"] <= max(plan["nReturned"], 1) * 2
    stages = str(plan["executionStages"])
    assert "COLLSCAN" not in stages
    assert "'stage': 'SORT'" not in stages, "in-memory sort: index order does not match the query"


def test_schema_validation_rejects_bad_trip(mdb):
    with pytest.raises(WriteError):
        mdb.trip.insert_one({"trip_id": "bad", "duration_sec": "ten minutes"})


def test_top_stations_pipeline_matches_before_lookup(mdb):
    stages = queries.top_stations_pipeline(dt.datetime(2026, 1, 1), dt.datetime(2026, 2, 1))
    names = [list(s.keys())[0] for s in stages]
    assert names[0] == "$match"
    assert names.index("$lookup") > names.index("$limit"), "$lookup must run after $limit"


def test_readings_query_names_full_partition_key(cs):
    rows = list(queries.readings_for_station_day(cs, station_id=1, day=dt.date(2026, 1, 15)))
    assert rows, "expected readings"
    assert rows[0].observed_at >= rows[-1].observed_at, "clustering order should be newest first"


def test_unbucketed_query_is_rejected(cs):
    with pytest.raises(InvalidRequest):
        cs.execute("SELECT * FROM readings_by_station_day WHERE station_id = 1")


def test_no_allow_filtering_in_code():
    src = open("queries.py").read().upper()
    assert "ALLOW FILTERING" not in src


def test_dashboard_has_its_own_table(cs):
    tables = {r.table_name for r in cs.execute(
        "SELECT table_name FROM system_schema.tables WHERE keyspace_name = 'bikeshare'")}
    assert "latest_reading_by_borough" in tables
```

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Access-pattern-first design | Entities first, queries bolted on | Every pattern has one designed path with stated keys | Write-path consistency for duplicated Cassandra tables documented, including partial-failure handling |
| MongoDB | Unbounded arrays, `$lookup` early | Subset/bucket patterns, ESR index, validation | Covered query for A2 proven by absence of `FETCH` |
| Cassandra | `ALLOW FILTERING` | Bucketed partition key, query-per-table, TTL | TWCS + TTL with tombstone evidence from tracing |
| Measurement | Single timings | p50/p95 before/after for two changes | Consistency-level trade-off measured and argued |

## Stretch goals

- Run a three-node Cassandra cluster in Compose and compare `ONE` vs `QUORUM` p99.
- Compare `snappy` vs `zstd` block compression for the `trip` collection (lesson 9 practice 6).

## Reflection prompts

- Which access pattern would you add next quarter that your current model cannot serve, and what would you have to build?
- Where did duplication buy you a read, and what does it cost on the write path?

## Instructor notes (common pitfalls, how to adapt for time)

- Cassandra on laptops: set heap limits or use `--scale tiny` throughout.
- The `test_rider_history_uses_index_efficiently` check is version-sensitive in how explain output is nested; adjust the `SORT` detection if your MongoDB version reports differently.
- Short on time: do MongoDB only (A1-A3) and treat Cassandra as a paper design.
