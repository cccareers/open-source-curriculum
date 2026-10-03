---
course_id: de102
project_id: de102-x01
title: "Slow Dashboard Query Clinic"
kind: supplementary-project
status: draft
hours_estimate: 8
difficulty: core
related_lessons:
  - de102-05
  - de102-06
  - de102-07
objectives:
  - Choose an index type and column order that a given query can actually use
  - Read an execution plan and name the operator responsible for a slow query
  - Partition a large table so that queries prune the partitions they do not need
competency_ids:
  - D3-S1-C03
  - D5-S2-C01
  - D5-S2-C02
---

## Scenario

The analytics team has three dashboard tiles backed by the `sales_order` / `order_line` / `customer` schema used throughout this course. Each tile's query has started taking several seconds, and the team lead has asked you to run a "query clinic": diagnose each one from its plan, fix it with the smallest defensible change, and prove the fix with numbers and an automated test so it cannot quietly regress.

## What you will build / produce

- `docker-compose.yml` running PostgreSQL 16 locally.
- `seed.sql` — deterministic data generation with `generate_series` (below).
- `fixes.sql` — your indexes, statistics, and partitioning changes, each with a comment naming the query it serves.
- `CLINIC.md` — for each tile: the slow plan excerpt, the named culprit operator with the line that proves it, the fix, and before/after `EXPLAIN (ANALYZE, BUFFERS)` numbers.
- `test_plans.py` — the pytest suite below, passing.

## Before you start (prerequisites, starter files or data)

- Docker, Python 3.10+, `pip install pytest "psycopg[binary]"`.
- `docker run -d --name clinic -e POSTGRES_PASSWORD=clinic -p 5432:5432 postgres:16`
- **Seed data** (`seed.sql`, deterministic via `setseed`):

```sql
SELECT setseed(0.42);
CREATE TABLE customer (
  customer_id  bigint PRIMARY KEY,
  display_name text NOT NULL,
  city         text NOT NULL,
  state        char(2) NOT NULL
);
INSERT INTO customer
SELECT g, 'Customer ' || g,
       (ARRAY['Columbus','Cleveland','Austin','Dallas','Fresno'])[1 + (g % 5)],
       (ARRAY['OH','OH','TX','TX','CA'])[1 + (g % 5)]      -- city and state correlated on purpose
FROM generate_series(1, 50000) g;

CREATE TABLE sales_order (
  order_id    bigint NOT NULL,
  customer_id bigint NOT NULL,
  ordered_at  timestamptz NOT NULL,
  status      text NOT NULL,
  total       numeric(12,2) NOT NULL
);
INSERT INTO sales_order
SELECT g,
       -- skew: 20% of orders come from 1% of customers
       CASE WHEN random() < 0.2 THEN 1 + floor(random() * 500) ELSE 1 + floor(random() * 50000) END,
       timestamptz '2024-01-01' + (random() * interval '730 days'),
       CASE WHEN random() < 0.95 THEN 'complete' WHEN random() < 0.5 THEN 'pending' ELSE 'cancelled' END,
       round((5 + random() * 300)::numeric, 2)
FROM generate_series(1, 2000000) g;
-- Deliberately: no indexes beyond what you add, and no ANALYZE yet.
```

- **The three tiles:**
  - **T1 Customer history:** `SELECT order_id, ordered_at, total FROM sales_order WHERE customer_id = $1 AND ordered_at >= now() - interval '90 days' ORDER BY ordered_at DESC LIMIT 50;`
  - **T2 Pending queue:** `SELECT count(*) FROM sales_order WHERE status = 'pending' AND date_trunc('day', ordered_at) = current_date - 1;`
  - **T3 Monthly revenue by state:** `SELECT c.state, sum(o.total) FROM sales_order o JOIN customer c USING (customer_id) WHERE o.ordered_at >= '2025-06-01' AND o.ordered_at < '2025-07-01' AND c.city = 'Austin' AND c.state = 'TX' GROUP BY c.state;`

## Milestones

1. **Baseline.** Run each tile with `EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)` and save the output. Record runtime and shared buffers read+hit.
2. **Name the culprit.** For each tile, write one paragraph naming the single operator responsible (lesson 6 "Finding the culprit" four passes), quoting the exact plan line.
3. **T1 — composite index.** Choose column order using equality-then-range/sort (lesson 5). Consider `INCLUDE` for an index-only scan. Explain why `(ordered_at, customer_id)` would be worse.
4. **T2 — sargability and partial index.** Rewrite the predicate as a half-open range, then build a partial index on pending rows. Compare the partial index size to a full index on `ordered_at` with `pg_relation_size`.
5. **T3 — statistics and partitioning.** First fix the city/state misestimate with `CREATE STATISTICS` and record the estimate change. Then convert `sales_order` to monthly range partitions (`sales_order_p`) with a legal primary key, reload, and prove T3 scans exactly one partition.
6. **Write cost.** Insert 100,000 rows with and without your indexes; report the ratio and justify each index you keep.
7. **Regression tests.** Make `test_plans.py` pass.

## Acceptance criteria

- [ ] `docker compose up -d && psql -f seed.sql && psql -f fixes.sql && pytest -q` passes from scratch.
- [ ] Every index in `fixes.sql` names the tile it serves; no redundant index (`(a)` alongside `(a, b)`).
- [ ] T1 plan uses an index on `sales_order` with no `Sort` node.
- [ ] T2 query text contains no function wrapped around `ordered_at`.
- [ ] T3 plan on the partitioned table touches exactly one partition.
- [ ] `CLINIC.md` quotes, for each tile, the plan line that proves the culprit, and before/after runtime and buffers.

## Automated checks (coding courses) / Evidence checklist (non-coding)

```python
# test_plans.py -- requires the clinic container from "Before you start".
import json
import os

import psycopg
import pytest

DSN = os.environ.get("CLINIC_DSN", "postgresql://postgres:clinic@localhost:5432/postgres")

T1 = """SELECT order_id, ordered_at, total FROM sales_order
        WHERE customer_id = 42 AND ordered_at >= now() - interval '90 days'
        ORDER BY ordered_at DESC LIMIT 50"""
T2 = """SELECT count(*) FROM sales_order
        WHERE status = 'pending'
          AND ordered_at >= current_date - 1 AND ordered_at < current_date"""
T3 = """SELECT c.state, sum(o.total) FROM sales_order_p o JOIN customer c USING (customer_id)
        WHERE o.ordered_at >= '2025-06-01' AND o.ordered_at < '2025-07-01'
          AND c.city = 'Austin' AND c.state = 'TX' GROUP BY c.state"""


@pytest.fixture(scope="module")
def conn():
    with psycopg.connect(DSN) as c:
        c.execute("ANALYZE")
        yield c


def plan(conn, sql):
    row = conn.execute("EXPLAIN (FORMAT JSON) " + sql).fetchone()[0]
    return row[0]["Plan"] if isinstance(row, list) else json.loads(row)[0]["Plan"]


def nodes(p):
    yield p
    for child in p.get("Plans", []):
        yield from nodes(child)


def test_t1_uses_index_without_sort(conn):
    types = [n["Node Type"] for n in nodes(plan(conn, T1))]
    assert any(t in ("Index Scan", "Index Only Scan") for t in types), types
    assert "Sort" not in types, f"T1 still sorts: {types}"
    assert "Seq Scan" not in types


def test_t2_partial_index_exists_and_is_used(conn):
    idx = conn.execute("""
        SELECT indexdef FROM pg_indexes
        WHERE tablename = 'sales_order' AND indexdef ILIKE '%WHERE%pending%'""").fetchall()
    assert idx, "expected a partial index on pending orders"
    used = {n.get("Index Name") for n in nodes(plan(conn, T2))} - {None}
    assert used, "T2 should use an index"


def test_t3_prunes_to_one_partition(conn):
    scanned = [n["Relation Name"] for n in nodes(plan(conn, T3))
               if n.get("Relation Name", "").startswith("sales_order_p")]
    assert len(scanned) == 1, f"expected one partition, got {scanned}"


def test_t3_extended_statistics_exist(conn):
    n = conn.execute("""
        SELECT count(*) FROM pg_statistic_ext
        WHERE stxrelid = 'customer'::regclass""").fetchone()[0]
    assert n >= 1


def test_partitioned_pk_includes_partition_key(conn):
    cols = conn.execute("""
        SELECT a.attname FROM pg_index i
        JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
        WHERE i.indrelid = 'sales_order_p'::regclass AND i.indisprimary""").fetchall()
    assert "ordered_at" in {c[0] for c in cols}


def test_no_redundant_single_column_index_on_customer_id(conn):
    defs = [r[0] for r in conn.execute(
        "SELECT indexdef FROM pg_indexes WHERE tablename = 'sales_order'").fetchall()]
    single = [d for d in defs if d.rstrip().endswith("(customer_id)")]
    composite = [d for d in defs if "(customer_id, " in d]
    assert not (single and composite), "single-column index is covered by the composite"
```

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Diagnosis | "It does a seq scan" | Names the operator and quotes the proving line (rows, loops, buffers) | Identifies the deepest misestimate and explains why the planner chose wrongly |
| Index design | Indexes every column | Column order justified by equality/range/sort; partial and covering used where they pay | Quantifies write cost and drops an index that does not earn its keep |
| Partitioning | Partitions but pruning unverified | Pruning proven with plan; legal PK | Demonstrates run-time pruning with a bind parameter |
| Evidence | Runtimes only | Runtime and buffers before/after for each tile | Repeated runs with median and variance |

## Stretch goals

- Repeat T1 in MySQL 8 and compare `EXPLAIN FORMAT=TREE` output and the clustered-index effect of the primary key.
- Add `pg_stat_statements` and rank tiles by total time rather than per-call time.

## Reflection prompts

- Which fix had the biggest effect per byte of index added?
- Which of your changes would you be nervous about shipping on a write-heavy table, and why?

## Instructor notes (common pitfalls, how to adapt for time)

- The first run after seeding has no statistics; insist that learners capture that plan before `ANALYZE` — it is the best teaching artifact in the project.
- `now()` in T1 makes timing slightly non-deterministic; fine for plan-shape assertions.
- On laptops with little RAM, cut `sales_order` to 500,000 rows; plan shapes stay the same.
- Plan choices can differ across PostgreSQL minor versions; tests assert shapes, not costs, for this reason.
