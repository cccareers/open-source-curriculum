---
course_id: de102
title: "SQL & NoSQL Databases — Enhancement Review"
reviewed_lessons: 9
status: draft
---

## Summary

Technically deep and unusually precise about engine differences (PostgreSQL vs MySQL, MongoDB vs Cassandra), with practice sections that make learners observe behaviour rather than read about it. The main opportunities are (1) a handful of technical inaccuracies or version-dependent claims, now mostly fixed, and (2) practice that is heavy on scale (10M-row tables, 5M rows in two NoSQL stores) with no acceptance criteria, which will stall learners on laptops and leaves "done" undefined.

## Clarity issues

| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| de102-02 | "Tables, columns, and choosing types" | Said MySQL 8 "understands the standard-ish GENERATED syntax"; MySQL has no identity-column syntax, `GENERATED ALWAYS AS (expr)` is for computed columns. | Corrected sentence. | Applied |
| de102-02 | "Changing a schema that is already in use" | Implied `NOT NULL` can be added `NOT VALID`; only CHECK/FK constraints support that. | Added the CHECK-then-SET NOT NULL recipe (PG12+). | Applied |
| de102-03 | "Joins, all five of them" (fan-out) | Recommended `SUM(DISTINCT ...)` to fix fan-out; that collapses equal values across different orders and is wrong. | Replaced with pre-aggregation and an explicit warning. | Applied |
| de102-03 | "Window functions" | Example references `order_totals` with no `WITH` clause in scope. | Inline comment pointing to the CTE. | Applied |
| de102-07 | "The operational payoff" | `DETACH ... CONCURRENTLY` presented without its version and DEFAULT-partition restrictions. | Added parenthetical. | Applied |
| de102-09 | "MongoDB: reading the explain output" | "Aborts sorts exceeding 100MB" is pre-6.0 behaviour; 6.0+ spills by default. | Version-qualified the claim. | Applied |
| de102-03 | Practice intro | Schema for practice data (row counts, distributions) is unspecified. | Add a shared `generate_series` seed (see de102-x01) referenced by lessons 3, 5, 6, 7. | Proposed |
| de102-09 | "Compaction strategy mismatch" | Cassandra 5.0 introduces Unified Compaction Strategy; lesson lists only STCS/LCS/TWCS. | Add one sentence noting UCS and that the lesson's trade-offs still explain it. | Proposed (verify against the Cassandra version the program uses) |
| de102-04 | "The four levels" | MySQL `LOCK IN SHARE MODE` is the legacy spelling; 8.0 prefers `FOR SHARE`. | Mention both. | Proposed |

## Depth and coverage gaps

- **No shared dataset.** Lessons 3, 5, 6, 7 each ask learners to generate data differently. One deterministic seed script would keep the running `sales_order` example identical and make plans comparable between learners. Objective: "Read an execution plan and name the operator responsible for a slow query".
- **Scale vs. hardware.** 10M rows (lesson 7) and 5M rows in both Mongo and Cassandra (lesson 9) will exhaust many learner laptops; give a "small mode" row count that preserves the behaviour. Objective: "Diagnose and reduce read and write latency in a NoSQL deployment".
- **Isolation lesson lacks a scripted demo.** The two-terminal exercises are excellent but easy to mis-sequence; a timed step table (A does X, then B does Y) would help. Drafted as video-02. Objective: "Explain how an isolation level changes what a concurrent transaction can observe".
- **Schema naming differs from de101** (`sales_order`/`order_line`, singular, vs de101's `orders`/`order_lines`). Defensible, but a one-line note in lesson 2 would prevent confusion for learners coming straight from de101.
- **MongoDB modelling practice** jumps from design to measurement; a worked bike-share document model would anchor it. Project x02 supplies one. Objective: "Design a MongoDB document model and a Cassandra table around their access patterns".

## Proposed additional projects

- **x01 Slow Dashboard Query Clinic** (drafted) — lessons 05–07; PostgreSQL in Docker, pytest asserting plan shapes.
- **x02 Bike-Share Trips in MongoDB and Cassandra** (drafted) — lessons 08–09; access-pattern-first models, measured tuning, pytest + pymongo/cassandra-driver.
- Isolation lab harness: a Python script that runs scripted A/B sessions and asserts which anomalies appear at each level. Not drafted.
- Library-lending schema "constraint gauntlet" (lesson 2 practice) as an auto-graded test suite of rejected inserts. Not drafted.

## Video and animation opportunities

- **The loops trap and the deepest misestimate** (de102-06) — screencast. *Drafted: media/video-01-the-loops-trap.md.*
- **Write skew in two terminals** (de102-04) — split-screen screencast. *Drafted: media/video-02-write-skew-in-two-terminals.md.*
- **Composite index leftmost prefix** (de102-05) — explainer animation. *Drafted: media/animation-01-composite-index-leftmost-prefix.md.*
- MVCC row versions and snapshots (de102-04) — explainer animation of tuple versions and xmin/xmax visibility. Not drafted.
- Cassandra read path: memtable, SSTables, bloom filters, tombstones (de102-09) — explainer animation. Not drafted.
- Partition pruning with plan-time vs run-time (de102-07) — could reuse `range-partition-pruning.png`. Not drafted.

## Assessment ideas

- Plan-reading quiz: five saved plans, learner names the culprit node and the proving line.
- Index-design cards: given a query, pick the column order and justify with equality/range/sort.
- Anomaly matrix: given an isolation level and engine, mark which anomalies are possible.
- Cassandra "will it run?" drill: ten CQL queries against one table; predict accept / reject / ALLOW FILTERING.

## Changes applied in this pass

- `02-relational-modeling-in-postgresql-and-mysql.md`, "Tables, columns, and choosing types": corrected MySQL identity/generated-column claim.
- `02-relational-modeling-in-postgresql-and-mysql.md`, "Changing a schema that is already in use": added the CHECK `NOT VALID` → `SET NOT NULL` recipe.
- `03-advanced-sql-joins-subqueries-and-window-functions.md`, "Joins, all five of them": replaced the `SUM(DISTINCT)` fan-out advice with pre-aggregation and a warning.
- `03-advanced-sql-joins-subqueries-and-window-functions.md`, "Window functions": comment that `order_totals` is the earlier CTE.
- `07-partitioning-and-storage-layout.md`, "The operational payoff": version and restriction note for `DETACH ... CONCURRENTLY`.
- `09-tuning-nosql-reads-and-writes.md`, "MongoDB: reading the explain output": version-qualified the 100MB sort behaviour.

## Open questions for the course owner

- Which PostgreSQL, MySQL, MongoDB, and Cassandra versions does the program pin? Several claims (MERGE, DETACH CONCURRENTLY, allowDiskUse default, UCS) are version-dependent.
- Is a "small mode" acceptable for learners without 16 GB RAM, or should the program provide a hosted lab?
- Confirm `btree-index-lookup.png` and `range-partition-pruning.png` exist in `img/`.
