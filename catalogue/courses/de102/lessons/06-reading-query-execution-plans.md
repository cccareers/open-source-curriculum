---
lesson_id: de102-06
course_id: de102
pathway: data-engineer
title: Reading Query Execution Plans
order: 6
kind: lesson
competency_ids:
  - D3-S1-C03
  - D5-S2-C01
objectives:
  - Read an execution plan and name the operator responsible for a slow query
---

## The plan is the ground truth

Up to now you have been reasoning about what the database *should* do. An execution plan tells you what it actually did. Every performance conversation that stays at the level of "this query feels slow" is guesswork; every one that starts from a plan is engineering.

PostgreSQL's planner is a cost-based optimizer. It enumerates candidate plans, estimates each one's cost from table statistics, and picks the cheapest. Two consequences follow, and they are the two root causes of nearly every bad plan you will ever debug: the plan depends on **statistics**, which can be stale or too coarse; and it depends on a **cost model** whose parameters may not match your hardware.

## `EXPLAIN` versus `EXPLAIN ANALYZE`

`EXPLAIN` shows the chosen plan with *estimates*, without running the query. `EXPLAIN ANALYZE` runs it and adds *actual* timings and row counts. The gap between estimated and actual is where the diagnosis lives.

```sql
EXPLAIN (ANALYZE, BUFFERS, VERBOSE, SETTINGS)
SELECT c.display_name, count(*) AS orders
FROM   customer c
JOIN   sales_order o ON o.customer_id = c.customer_id
WHERE  o.ordered_at >= date '2026-01-01'
GROUP  BY c.display_name;
```

Always add `BUFFERS`. It reports pages read from cache (`shared hit`) versus from disk (`shared read`) versus written, and it converts "slow" into "slow because it read 400,000 pages". Add `SETTINGS` to catch a session with a non-default planner knob. Two warnings: `EXPLAIN ANALYZE` genuinely executes the statement, so wrap a write in a transaction you roll back; and on some systems the per-row timing instrumentation itself inflates the numbers — check with `EXPLAIN (ANALYZE, TIMING OFF)` if the totals look implausible.

## Reading the output

A plan is a tree, printed with children indented under their parent. Data flows **upward**: the innermost, most-indented nodes run first and feed their parents. Read a plan bottom-up to follow the data, top-down to understand the intent.

A node line looks like this:

```text
Hash Join  (cost=1043.00..12876.42 rows=48219 width=36)
           (actual time=8.412..112.774 rows=51022 loops=1)
```

- `cost=1043.00..12876.42` — startup cost, then total cost, in arbitrary units where 1.0 is conventionally one sequential page read. Startup cost is what must happen before the first row can be emitted; a sort or a hash build has a high startup cost, a sequential scan has almost none. This matters for `LIMIT`: a plan with high startup cost is a bad choice for a query that wants ten rows.
- `rows=48219` is the **estimate**; `rows=51022` in the actual section is the truth. Close enough here.
- `actual time=8.412..112.774` — milliseconds to first row, then to last row. **These are cumulative**: a node's time includes all its children's time. To find the time a node itself spent, subtract its children.
- `loops=1` — how many times the node was executed. **Actual time and rows are per loop.** A node showing `actual time=0.021 rows=1 loops=250000` did not take 0.021ms; it took roughly 5.2 seconds. Missing this is the most common misreading of a Postgres plan.

## The node types you must recognise

**Scans — how rows leave a table.**

- `Seq Scan` reads every page. Correct for small tables and for predicates that keep a large fraction of rows; a red flag only when the predicate is selective and an index exists.
- `Index Scan` walks the index and fetches each matching row from the heap. Best when few rows match and you need columns not in the index.
- `Index Only Scan` answers entirely from the index. Watch the `Heap Fetches:` line — a high number means the visibility map is stale and the scan is not really index-only.
- `Bitmap Index Scan` + `Bitmap Heap Scan` is the middle gear from the last lesson: collect matching pages into a bitmap, then read the heap in physical order. On the heap node, `Recheck Cond` and especially `Rows Removed by Filter` tell you how much work was wasted. If you see `lossy=` in the `Heap Blocks:` line, `work_mem` was too small to hold the exact bitmap and the engine fell back to page granularity.

**Joins — how two inputs combine.**

- `Nested Loop`: for each outer row, probe the inner side. Excellent when the outer side is tiny and the inner side has an index; catastrophic when the outer side turns out to be 500,000 rows instead of the estimated 20. Almost every "the plan was fine yesterday" incident is a nested loop over a misestimated outer input.
- `Hash Join`: build a hash table from the smaller input, then stream the larger one through it. The standard choice for large equality joins. Check `Buckets`, `Batches`, and `Memory Usage` on the `Hash` node — `Batches: 8` means it did not fit in `work_mem` and spilled to disk.
- `Merge Join`: both inputs arrive sorted on the join key and are walked in step. Great when the sort is free (both sides come off indexes in the right order), expensive when it is not.

**Aggregation and ordering.**

- `HashAggregate` builds a hash table of groups; `GroupAggregate` requires sorted input and streams. A `HashAggregate` that underestimated its group count can exceed `work_mem` and, in modern versions, spill — visible as `Disk Usage`.
- `Sort` reports its method: `Sort Method: quicksort Memory: 25kB` is fine; `Sort Method: external merge Disk: 94208kB` means it spilled to disk and raising `work_mem` for that session may be the entire fix.
- `Incremental Sort` exploits partially-sorted input, common when an index provides the first sort column.

**Structural nodes.** `Materialize` caches a subplan's output for repeated scanning. `Memoize` caches inner-side results in a nested loop keyed by parameter — very effective on skewed joins. `Gather` / `Gather Merge` collect rows from parallel workers; note `Workers Planned` versus `Workers Launched`, since a busy server may launch fewer than planned, and remember that under a `Gather`, per-worker row counts are averaged. `SubPlan` marks a correlated subquery — check its `loops`. `CTE Scan` appears when a CTE was materialised rather than inlined.

## Finding the culprit

A disciplined reading takes four passes.

**One: find the misestimate.** Scan every node comparing estimated `rows` to actual `rows`. Find the *deepest* node where they diverge by more than about an order of magnitude — everything above it inherited a bad number, so the deepest one is the cause, not the symptom. A ten-thousandfold overestimate above a correct scan means the planner's assumptions about a filter or a join are wrong.

**Two: find the time.** Subtract child time from parent time to get each node's own cost, and watch for the `loops` multiplier. Rank the nodes by self-time.

**Three: find the wasted work.** `Rows Removed by Filter` says the engine read rows only to throw them away — an index opportunity. `Rows Removed by Join Filter` says the join condition is doing work the index could have. `Heap Fetches` says visibility, not indexing, is your problem. High `shared read` with low `shared hit` says you are I/O bound and probably reading more than you need.

**Four: find the spills.** `external merge Disk`, `Batches: > 1`, and hash aggregate `Disk Usage` all mean memory pressure. These are often a one-line fix.

## Why estimates go wrong, and how to fix them

Estimates come from statistics collected by `ANALYZE` into `pg_statistic`: a most-common-values list, a histogram, the fraction of nulls, and the number of distinct values.

**Stale statistics.** After a bulk load or a large delete, run `ANALYZE tablename`. Autovacuum does this eventually; "eventually" is not a plan for a table you just loaded.

**Too few buckets.** `default_statistics_target` defaults to 100. On a column with high cardinality and heavy skew, raise it for that column and re-analyze:

```sql
ALTER TABLE sales_order ALTER COLUMN customer_id SET STATISTICS 1000;
ANALYZE sales_order;
```

**Correlated columns.** The planner assumes independence, so `WHERE city = 'Boston' AND state = 'MA'` gets estimated as the product of two selectivities — wildly too low, because the two are almost perfectly dependent. Extended statistics fix this:

```sql
CREATE STATISTICS sales_order_geo (dependencies, ndistinct)
  ON city, state FROM sales_order;
ANALYZE sales_order;
```

**Expressions the planner cannot see through.** `WHERE lower(email) = $1` gets a default guess unless an expression index exists to carry statistics for it.

Two cost-model parameters deserve a mention because their defaults date from spinning disks. `random_page_cost` defaults to 4.0, four times `seq_page_cost`; on SSDs, something between 1.0 and 2.0 reflects reality and makes the planner correctly willing to use index scans. `effective_cache_size` tells the planner how much memory the OS is likely caching with — it allocates nothing, it only informs estimates, and leaving it at the default on a large server biases against index scans.

Resist the urge to reach for `SET enable_nestloop = off`. It is a superb *diagnostic* — force the alternative, see whether it really is faster, and learn what the planner got wrong — and a terrible fix, because it is global and permanent while your data is not.

## MySQL plans

MySQL's `EXPLAIN` is a table, one row per accessed table, and `EXPLAIN ANALYZE` (8.0.18+) gives an iterator tree much closer to Postgres's format. `EXPLAIN FORMAT=JSON` gives cost details.

The columns that matter: `type` is the access method, ordered roughly best to worst as `const`, `eq_ref`, `ref`, `range`, `index`, `ALL` — `ALL` is a full table scan and `index` is a full index scan, which is not much better. `key` names the index actually chosen and `possible_keys` those considered; a populated `possible_keys` with a null `key` is the planner rejecting your index. `rows` is the estimate, `filtered` is the percentage expected to survive the `WHERE` after access. `Extra` carries the diagnosis: `Using index` is a covering index (good), `Using where` means rows were filtered after fetching, `Using filesort` means an explicit sort, and `Using temporary` means an internal temp table — the last two together on a `GROUP BY` are a familiar sign of a missing index. Refresh estimates with `ANALYZE TABLE`, and note that MySQL's optimizer trace (`SET optimizer_trace='enabled=on'`) is its equivalent of the reasoning Postgres hides.

## Practice

Use the two-million-row table from the previous lesson, or rebuild one.

1. **Baseline.** Run `EXPLAIN (ANALYZE, BUFFERS)` on a three-table join with a date filter and a `GROUP BY`. Save the output to a file. Identify the top-level node, the node with the greatest self-time, and the total shared-buffer reads.
2. **Node zoo.** Produce, and save, a plan containing each of: `Seq Scan`, `Index Scan`, `Index Only Scan`, `Bitmap Heap Scan`, `Nested Loop`, `Hash Join`, `Merge Join`, `Sort`, and `HashAggregate`. Use `enable_*` toggles to force the ones you cannot get naturally, and note what each toggle cost you in runtime.
3. **The loops trap.** Construct a query whose plan has a nested loop with `loops` in the tens of thousands. Compute the inner node's true total time by hand from `actual time` and `loops`, then confirm it against the parent's cumulative time.
4. **Break the statistics.** Insert 500,000 rows without running `ANALYZE` and capture the plan; note the estimate-versus-actual gap on the scan. Run `ANALYZE` and capture it again. Report both plans and the runtime difference.
5. **Correlated columns.** Add correlated `city`/`state` columns, write a query filtering on both, and record the row estimate. Create extended statistics, re-analyze, and record the new estimate and any plan change.
6. **Force a spill.** Set `work_mem` low for your session and run a large `ORDER BY` until the plan reports `Sort Method: external merge Disk`. Raise `work_mem` until it becomes `quicksort Memory`, and report the runtime at each setting.
7. **Name the culprit.** Take one genuinely slow query of your own devising and write a short paragraph that names the single operator responsible, cites the specific line of plan output that proves it, and states the one change you would make. That paragraph is the deliverable — the fix is secondary.
