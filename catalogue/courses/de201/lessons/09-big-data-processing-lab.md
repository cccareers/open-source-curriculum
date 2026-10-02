---
lesson_id: de201-09
course_id: de201
pathway: data-engineer
title: Big Data Processing Lab
order: 9
kind: project
competency_ids:
  - D4-S1-C01
  - D4-S1-C03
  - D2-S1-C02
objectives: []
---

## Goal

Build one Spark pipeline that takes a raw, messy, multi-gigabyte dataset and turns it into a documented, well-laid-out feature table — and be able to explain, from evidence, why it is as fast as it is.

This is the only place in the course where all three big-data competencies are exercised together: using a distributed framework (D4-S1-C01), designing a solution that stays fast as the data grows (D4-S1-C03), and engineering analytical features through data transformation (D2-S1-C02). Each is assessed on the artefact you produce and the reasoning you can show behind it.

Budget three hours. This is an in-course exercise, not a portfolio piece — the pathway's portfolio artefact comes later, in agile310. Finish something end to end rather than perfecting one stage.

## The scenario

You are handed a raw event dataset in a landing zone. It is text (CSV or newline-delimited JSON), it is several gigabytes, and it has the defects real landing zones have: duplicate records from retried deliveries, nulls in columns that should not have them, timestamps stored as strings, a categorical column with a long tail of near-junk values, and at least one key value that is wildly over-represented.

An analytics team wants a **feature table**: one row per entity per as-of date, with behavioural features they can query directly. They will filter it by date constantly and by entity occasionally. They do not want to run Spark themselves — they want a table that is already fast.

Use whichever dataset your instructor provides. If you are sourcing your own, any public event dataset with an entity id, a timestamp, a numeric measure, and a category works — trip records, transaction logs, web clickstream. Generate additional volume if what you find is too small; three or four gigabytes is the minimum for the measurements to mean anything.

## Requirements

Deliver five things.

**1. An ingestion and cleaning stage.** Read the raw text with an explicit schema — no inference. Handle bad records with a mode you chose deliberately and can defend. Normalise the entity key and the categorical column, cast the timestamp to a real timestamp type, cast money to `decimal`, and deduplicate on the business key keeping the newest version. Write the cleaned data as Parquet. Record how many rows entered, how many were dropped, and why.

**2. A feature table.** From the cleaned data, produce one row per entity per as-of date with at least eight features spanning three families:

- *Aggregates*: lifetime count and sum, average, and one approximate statistic (a median or a distinct count).
- *Windowed*: at least two trailing-window features over different horizons, plus one recency feature such as days since the previous event.
- *Derived*: at least one ratio or share, with the denominator guarded, and one enrichment column joined from a dimension table.

Every feature must be computed with distributed operations. No `collect()`, no `toPandas()`, and no Python loop over data values anywhere in the pipeline.

**3. A deliberate storage layout.** Write the feature table as Parquet, partitioned by a column you justify, with a compression codec you justify, and files sized to a target you state. Sort within partitions on whatever column consumers filter by most, if that helps. Your justification must reference the consumers' stated query pattern.

**4. A performance report.** A short document — a page is plenty — containing:

- The stage-level metrics for your final run: duration, task count, shuffle read and write, and disk spill per stage.
- At least one optimisation you made, with the before and after numbers for the same metric. A change with no measurement behind it does not count.
- A statement of where the job spends most of its time and why that is or is not reasonable.
- One paragraph on how the job would behave at ten times the data volume, and what you would change first.

**5. A runnable, parameterised script.** The pipeline runs as a single `spark-submit` invocation taking the as-of date as an argument. Running it twice with the same argument produces the same output.

## Constraints

- **PySpark and the DataFrame API.** RDD operations only where you can justify that no DataFrame equivalent exists.
- **No MLlib and no modelling.** Features are a data transformation deliverable. Nothing here trains anything.
- **Nothing comes to the driver except bounded inspection.** A `show()` of twenty rows is fine. A `collect()` of a result set is a failed requirement, even if it happens to run.
- **No `current_timestamp()` or unseeded randomness in feature logic.** The as-of date is a parameter. Reproducibility is a graded property.
- **No point-in-time leakage.** Every feature attached to an as-of date must be computed only from records at or before it. Assume a reviewer will test this on one entity and one early date.
- **Use the cluster you are given.** Provisioning, autoscaling policy, and managed cloud Spark services are out of scope; tune the job to the cluster, not the other way round.
- **Orchestration is out of scope.** One script you can run, not a scheduled DAG.

## Definition of done

You are finished when all of the following are true and you can demonstrate each.

- The pipeline runs start to finish with `spark-submit` on the full dataset and produces the feature table without manual intervention.
- Running it twice with the same as-of date produces byte-identical output, or output you can show differs only in file naming.
- The output has the expected number of rows: one per entity per as-of date, with no duplicates. You can produce the query that proves it.
- Every feature column has a name that states the entity, the measure, and the window, and there is a short data dictionary listing each column, its meaning, and its window.
- No `collect()`, `toPandas()`, or driver-side loop appears anywhere in the source. A grep for them comes back clean.
- A leakage check on one entity and an early as-of date shows the feature values reflect only prior records.
- `explain(mode="formatted")` on the main query shows column pruning and pushed filters on the Parquet reads, and you can point to both in the output.
- The number of exchanges in the plan matches the number you predicted before running it, or you can explain the discrepancy.
- The output directory has a defensible file count and file size, and you can state the target you were aiming for.
- The performance report exists, contains real before-and-after numbers for at least one optimisation, and names the dominant stage.

## Hints

**Predict before you measure.** Before the first run, write down the number of stages you expect, which operations will shuffle, and roughly how long the job should take. Being wrong is useful; not having a prediction is not.

**Convert to Parquet first, then iterate.** Do the text-parsing stage once and write cleaned Parquet. Every subsequent experiment reads that instead of re-parsing gigabytes of text, and your iteration loop gets minutes shorter.

**Develop on a sample, run on the whole.** Build the logic against a fraction of the data with a fast turnaround, then run the full set. Watch for logic that only works because the sample was small.

**Filter and project as early as possible.** Every column you drop and row you discard before a shuffle is data the shuffle does not move. This one habit outperforms most configuration changes.

**Reach for conditional aggregation.** `F.sum(F.when(cond, 1).otherwise(0))` computes a filtered count in the same pass as the unfiltered one. It will save you at least one join.

**Broadcast the dimension.** Your enrichment table is small. Say so explicitly with `F.broadcast(...)` rather than hoping the optimiser's statistics are current, and confirm in the plan that you got a broadcast join.

**Check row counts around every join.** Count before, count after. A duplicate key in the dimension inflates every downstream number silently, and it is far cheaper to catch here than in the report.

**Expect the skew.** The dataset has an over-represented key on purpose. Diagnose it from the stage summary metrics — compare max task duration and max shuffle read against the medians — before deciding what to do. Then check whether the hot key is a real entity or a placeholder, because that determines whether the right fix is salting or filtering.

**Get `rangeBetween` and `rowsBetween` right.** Trailing *time* windows need a range frame over a timestamp cast to a long. A rows frame gives you the last N events, which is a different feature and an easy silent bug.

**Match `repartition` to `partitionBy` before writing.** Without it, every task writes into every output directory and you get a file explosion. With it, each directory gets one file per task.

**Keep every measurement as you go.** The performance report is much harder to write from memory than from a running log. Note the stage metrics after each run, alongside what you changed.

**If you run short on time**, prioritise in this order: a working end-to-end pipeline, correctness of the features, the storage layout decision, then the performance report. A correct slow pipeline you have measured beats a fast one whose numbers you cannot explain.
