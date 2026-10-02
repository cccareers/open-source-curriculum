---
lesson_id: agile310-05
course_id: agile310
pathway: data-engineer
title: "Milestone 2: Transformation and Warehouse Modeling"
order: 5
kind: project
competency_ids:
  - D1-S1-C01
  - D6-S1-C03
objectives:
  - Model ingested data into a warehouse layer that answers the business question
---

## Goal

Turn the raw data you landed in Milestone 1 into a modelled warehouse layer that answers your capstone's business question — and make the transformation efficient enough, and repeatable enough, that running it every day is unremarkable.

This is the milestone with the most assessment weight in the course, and it is the one that most directly resembles the work. Landing data is plumbing. Deciding what a row means, at what grain, joined to what, tested how — that is the part an analyst will live with.

Two competencies are assessed. Building efficient, scalable ETL processes (D1-S1-C01) covers the transformation itself: incremental, correct, and measurably not wasteful. Using a cloud-native data-warehouse service (D6-S1-C03) covers where it runs and how you use the platform — partitioning, clustering, cost, and the layer boundaries you chose in lesson 2.

Budget eight hours. This is the largest single block in the course; do not spend it on the staging layer.

## The scenario

The landing zone is filling up daily. It contains exactly what the sources sent, which means it contains string timestamps, duplicated records from retried deliveries, categorical values with three spellings of the same thing, and at least one column whose meaning is not what its name suggests.

An analyst wants to answer your business question by writing ordinary SQL. They do not want to know which source a column came from, they do not want to deduplicate anything, and they will filter by date constantly. What you owe them is a small number of well-named tables with a stated grain, documented columns, and query performance that does not embarrass either of you.

## Requirements

Deliver seven things.

**1. A staging layer.** One table or view per source entity, sitting directly on the landed data. Its job is conformance and nothing else: real types instead of strings, consistent column names, trimmed and normalised categorical values, business-key deduplication keeping the newest version of each record, and the provenance columns carried through. No business logic, no joins across sources, no aggregation.

**2. A dimensional model in the warehouse.** At least one fact table and at least two dimensions, in a cloud-native warehouse service. Every table's grain is stated explicitly in its documentation, in the form "one row per X per Y". The fact table's grain must match the unit and time grain of the business question from your design document — if they disagree, one of them is wrong and you should say which in review.

**3. A serving layer that answers the question.** One view or small table per question your presentation will answer, built on the dimensional model. Three is a good number. These are the objects you will demo, and they should be readable enough that a stakeholder could follow the SQL with you narrating.

**4. Incremental transformation.** The transformation processes one window at a time and re-runs safely for a given window. A full rebuild from all history must also be possible — you need it when logic changes — but it is not what the daily run does. State the strategy you chose: partition overwrite, merge on a business key, or insert-with-delete-of-window.

**5. Deliberate physical design.** Fact tables are partitioned on the date column consumers filter by, and clustered or sorted on the next most common filter or join key if the platform supports it. Every choice is justified in one line, referencing the analyst's query pattern rather than a general principle.

**6. Data tests that run with the pipeline.** At minimum, and executed as part of the transformation rather than by hand: primary key uniqueness on every fact and dimension, not-null on every key and every column the question depends on, referential integrity from fact to each dimension, an accepted-values check on at least one categorical column, and one row-count or sum reconciliation between staging and the fact table. A failing test fails the run.

**7. A cost and performance record.** For your main daily transformation: bytes scanned or slot time, wall-clock duration, and output row count. Then at least one optimisation you made, with the same metric measured before and after. A change with no number behind it does not count.

**Governance acceptance criteria**, carried forward from ds320 and graded as part of this milestone:

- Any field you identified as sensitive in Milestone 1 is handled here as you said it would be — dropped, masked, or access-restricted — and the handling is visible in the SQL or the grants.
- Analyst-facing identities can read the warehouse and serving layers and cannot read the landing zone. The layer boundary is enforced by grants, not by convention.
- Every warehouse table has a description and every column in the fact table and dimensions has a one-line definition, held in the catalog or in a committed data dictionary.
- Lineage is documented at least as a diagram or table: for each warehouse table, which staging tables it is built from and which raw sources those came from.

## Constraints

- **Transform where the data is.** SQL executed in the warehouse is the default. If you pull data out to a container or a function to transform it and write it back, you must justify the choice against the alternative in your document. "It was easier in pandas" is not a justification at this scale, and it will not survive the volume the fact table reaches by the end of the course.
- **Do not modify the landing zone.** Staging reads it; nothing writes to it but ingestion. The rebuild path depends on this.
- **The transformation is a parameterised, committed artefact.** SQL files in the repository, run by a script or a transformation tool, taking the window as a parameter. Not statements pasted into a console.
- **Deterministic logic only.** No `CURRENT_DATE` inside transformation logic, no unseeded randomness. The window is a parameter, so the same input and the same window produce the same output.
- **No point-in-time leakage.** A row attributed to a date must be computed only from records at or before it.
- **Two sources must actually meet.** At least one fact or dimension joins data from both ingestion sources. A model where the sources never touch has skipped the hard part.
- **Machine learning is out of scope.** This is a modelling milestone in the data-warehouse sense, not the statistical one. No models are trained here.
- **Orchestration is still out of scope.** One runnable transformation with a window parameter. Scheduling and alerting are Milestone 3.

## Definition of done

You are finished when all of these are true and you can demonstrate each.

- A single command runs the full transformation for a named window and produces the warehouse and serving layers, with tests passing, and no manual steps.
- Running it twice for the same window changes no row counts and no values in any output table. You can produce the before-and-after query proving it.
- A full rebuild from all landed history completes and produces the same result as the accumulated incremental runs, or you can explain and defend each difference.
- Every fact and dimension has a documented grain, and a `GROUP BY` on the stated key columns returns no group with more than one row.
- The referential integrity test passes: no fact row has a dimension key absent from its dimension.
- All data tests run as part of the transformation, and you can show a deliberately broken run failing on the right test rather than producing bad data.
- The serving layer answers your business question, and you can run the query live and read the result aloud in one sentence.
- The fact table is partitioned, and a single-day query against it scans materially less than the same query against an unpartitioned copy. You have both numbers.
- Your optimisation has before-and-after figures for the same metric, and you can say what caused the improvement.
- Analyst-role credentials can query the serving layer and are denied on the landing zone; you can show both.
- The data dictionary exists, covers every column in the fact table and dimensions, and matches what the tables actually contain.
- The lineage diagram or table is committed and current.
- One reconciliation is documented: for a chosen window, the staging row count and the fact table's total agree, or the difference is explained by a rule you can name.

## Hints

**Write the grain statement before the SQL.** One sentence: "one row per zone per calendar day." If you cannot write it, the model is not ready to build, and if you write it and the primary key test then fails, the model is wrong in a way that is far cheaper to find now.

**Deduplicate exactly once, in staging.** Window by the business key ordered by the source's update timestamp, keep the first row. Do it anywhere else and you will do it twice, inconsistently.

**Build the serving query first, then work backwards.** Write the SQL that answers the question against staging, however ugly. It tells you precisely which columns and joins the model needs, and it stops you from building three dimensions nobody queries.

**Load the date dimension from a generator, not a source.** A calendar table with day, week, month, quarter, weekday flag, and whatever seasonal attribute your question needs is twenty lines of SQL and it removes date arithmetic from every downstream query.

**Count rows around every join.** Before and after. A duplicated key in a dimension inflates every fact downstream silently, and the reconciliation requirement exists precisely to catch it.

**Watch the partition filter survive the join.** A filter on a fact table's partition column can stop being pushed down when the fact is joined to a view. Read the query plan and confirm the partition pruning you expect actually happened; the bytes-scanned figure will tell you immediately.

**Cluster on what people filter by second.** Partition takes the date; clustering takes the id or category that appears in the next most common `WHERE` clause. Do not cluster on a high-cardinality key nobody filters on.

**Make the incremental window overwrite, not append.** Deleting and rewriting one partition is simpler to reason about than merging, and at capstone volumes it costs almost nothing. Reach for merge only if late-arriving updates make overwrite genuinely wrong.

**Test the boring things.** Uniqueness and not-null catch more real bugs than any clever assertion. Add the clever ones after the boring ones pass.

**Name columns for the reader, not the source.** `trips_cancelled_7d` beats `cnc_ct_7`. The analyst is the customer, and column names are the interface.

**Record every measurement as you take it.** Bytes scanned and duration after each significant run, with a note on what changed. Writing the performance section from memory in week six is much harder than writing it from a log.

**If you run short on time**, prioritise in this order: a fact table at the right grain, then the tests, then incrementality, then partitioning, then the optimisation write-up. One correct fact table with passing tests beats a star schema whose keys do not join.
