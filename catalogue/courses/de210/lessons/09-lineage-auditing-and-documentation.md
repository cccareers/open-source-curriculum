---
lesson_id: de210-09
course_id: de210
pathway: data-engineer
title: Lineage, Auditing, and Documentation
order: 9
kind: lesson
competency_ids:
  - D5-S1-C03
  - D1-S1-C03
objectives:
  - Publish lineage and documentation that lets a consumer trace a column back to its source
---

## The question you cannot answer yet

An analyst opens a dashboard and asks: "Why did last Wednesday's `net_revenue` change after I looked at it on Thursday?"

You now have every ingredient of an answer scattered across the pipeline. The raw files carry `_source_file` and `_ingested_at`. The orchestrator holds run history. dbt knows which model built the column and which models it depends on. Your metadata table records durations and row counts. What you do not have is any way to *walk* from the number back through those pieces — and until you do, that question takes an afternoon and the answer is a shrug.

**Lineage** is the connective tissue that makes the walk possible: a recorded map of what came from what. This lesson treats it as an engineering artifact — provenance you build, store, and query in order to trace, debug, scope, and optimise. Later in the pathway you will meet lineage again as a governance and audit obligation, with stewardship, retention, and regulatory framing on top; the mechanics you build here are what that treatment assumes exists.

## Three granularities, three different questions

Lineage is not one thing. Be precise about which of the three you mean, because they cost different amounts to capture and answer different questions.

**Table-level lineage** records that `fct_orders` is built from `stg_orders` and `dim_customers`. It is cheap — dbt gives it to you free from `ref()` — and it answers the two most common operational questions: *what breaks if I change this?* (walk downstream) and *what could have caused this?* (walk upstream).

**Column-level lineage** records that `fct_orders.net_revenue` derives from `stg_orders.amount_usd` and `stg_refunds.refund_amount`. It is more expensive, because deriving it requires parsing the SQL rather than reading a dependency list. It answers the question a consumer actually asks: *where does this number come from, and what would change it?* Table-level lineage on a hundred-column mart tells an analyst that the whole table depends on nine upstream tables — technically true and practically useless.

**Row- and run-level lineage** records that *these specific rows* were produced by *that specific run* from *that specific file*. It answers "which run introduced this?" and it is the one that makes the Wednesday question tractable. This is what your audit columns have been quietly accumulating.

A complete trace uses all three:

```text
dashboard tile "Net revenue, W12"
  └─ marts.fct_orders.net_revenue                    (column lineage)
       ├─ stg_orders.amount_usd
       │    └─ raw.orders.payload:amount             (table lineage)
       │         └─ _source_file = partner_x/2024-03-05/orders_003.csv
       │              └─ _run_id = manual__2024-03-06T09:14  (run lineage)
       └─ stg_refunds.refund_amount
            └─ raw.refunds.payload:amount
```

The last two lines are the answer to the analyst's question: someone re-ran the 5th on the 6th, a corrected partner file was reprocessed, and the number moved. Two minutes instead of an afternoon.

## Capturing lineage without writing it by hand

Hand-maintained lineage documents are wrong within a month. Three automatic capture mechanisms cover the ground, and you should use all three.

**Static capture from the code.** `ref()` and `source()` are a dependency declaration, so dbt's `manifest.json` already contains the full table-level graph, every model's compiled SQL, its configuration, its tests, and its descriptions. `dbt docs generate` renders it; `dbt ls` queries it. Because it comes from the code, it is always current with the code — and because it comes from the code, it describes what *should* run rather than what did.

**Runtime capture from the orchestrator.** Every task run has inputs and outputs, and emitting a small event per run — job name, run id, input datasets, output datasets, start, end, state, and row counts — builds a graph of what actually happened, including the steps that live outside dbt. **OpenLineage** is the open standard for these events, with integrations for common orchestrators and engines; where you cannot adopt it, emitting your own equivalent rows into the metadata table gets you most of the value. Runtime lineage is what catches the pipeline that quietly stopped writing a table, which static lineage cannot see.

**Data-level capture in the rows.** The audit columns from the ingestion lesson, carried forward rather than dropped at the first join:

```sql
select
    o.order_id,
    o.amount_usd - coalesce(r.refund_amount, 0) as net_revenue,
    o._source_file,
    o._run_id,
    o._ingested_at,
    '{{ invocation_id }}'                       as _built_by_invocation,
    current_timestamp()                         as _built_at
from {{ ref('stg_orders') }} o
left join {{ ref('stg_refunds') }} r using (order_id)
```

Carrying provenance through is a discipline, not a feature. The first aggregation destroys it — a `GROUP BY` cannot preserve a per-row source file — so decide deliberately where provenance stops: keep it through staging and intermediate models, and on facts at their natural grain, and accept its loss in aggregates, where the fact table below is the trace.

Two additions make run-level lineage genuinely auditable. Record the **code version** — the Git commit that built the run — so you can reproduce it, and persist dbt's `manifest.json` and `run_results.json` per run to a dated location, so you can reconstruct exactly what the graph looked like and how long each model took on any past day.

```sql
CREATE TABLE ops.model_runs (
    invocation_id   STRING,
    git_sha         STRING,
    model_name      STRING,
    materialization STRING,
    status          STRING,
    rows_affected   BIGINT,
    execution_s     NUMERIC,
    data_interval   DATE,
    built_at        TIMESTAMP
);
```

## Using the graph to work faster

Lineage earns its keep in four everyday tasks, and each one is a query rather than an investigation.

**Impact analysis, before you change something.** You are about to rename a column in a staging model. Walk downstream and you have the exact list of models, tests, and published datasets affected. In dbt this is a selector:

```bash
dbt ls --select stg_orders+ --resource-type model     # everything downstream
dbt build --select stg_orders+                        # rebuild exactly that
```

Doing this before a change converts "we think it's safe" into a list, and it is the difference between a refactor and an incident.

**Root-cause tracing, after something breaks.** A mart's test failed. Walk upstream (`dbt ls --select +fct_orders`), take the models that were rebuilt in this run from your model-run table, intersect the two, and you have a short list of suspects rather than the whole project.

**Scoping a backfill.** A bug in an intermediate model has been live for four days. The set to reprocess is that model and everything downstream, for those intervals — `dbt build --select int_orders_enriched+ --vars '{"start_date": ...}'` — rather than a full rebuild of the project, which on a real warehouse is the difference between twenty minutes and six hours.

**Answering a consumer.** The trace at the top of this lesson, produced on demand, is the most valuable thing lineage does for trust. A consumer who can see where a number comes from stops asking whether to believe it.

## Reading the graph as a reliability signal

The lineage graph is also a picture of your pipeline's structure, and structural problems are visible in it. This is where lineage feeds directly back into making workflows faster and more reliable.

**The critical path through the model graph.** Join `ops.model_runs` to the dependency graph and compute the longest chain by cumulative execution time. That chain, not the slowest single model, determines when your marts are ready. Optimising anything off it does not move the finish time.

**Over-connected models.** A model with thirty downstream dependents is a single point of failure and a rebuild bottleneck; it is often a "utility" model that accumulated unrelated responsibilities and should be split.

**Long serial chains.** Seven layers of models each depending only on the previous one usually contains real parallelism that was lost to convenience. Look for chains that could be flattened.

**Orphans.** Models with no downstream dependents, no exposure, and no consumer queries against them are dead code you are paying to rebuild every night. Cross-reference the graph against your warehouse's query history and delete what nothing reads — one of the highest-return, lowest-risk optimisations available.

**Fan-out multiplication.** A model rebuilt once but referenced by twelve views is doing its work thirteen times unless it is materialized. Lineage plus materialization plus run counts tells you where to add a table.

**Rebuild scope.** If a one-column change forces a full-project rebuild, the graph is too tightly coupled. Measuring "average number of models rebuilt per change" over time is a good, cheap health metric.

## Publishing documentation people will actually use

Documentation is the human-readable face of the same graph, and it lives with the code for the same reason lineage is generated rather than drawn: anything maintained separately drifts.

Your dbt project already carries descriptions. Two more constructs complete the picture. **Exposures** declare the downstream consumers that live outside the warehouse, so the lineage graph does not stop at your last table:

```yaml
version: 2
exposures:
  - name: revenue_dashboard
    type: dashboard
    maturity: high
    url: https://bi.example.com/dashboards/17
    owner:
      name: Finance Analytics
      email: fin-analytics@example.com
    depends_on:
      - ref('fct_orders')
      - ref('dim_customers')
    description: >
      Weekly revenue and refunds by region. Read by the Monday finance review.
```

With exposures declared, `dbt ls --select +exposure:revenue_dashboard` answers "what feeds the finance dashboard?", and the impact analysis of a staging change now names the dashboard that will break, which is the sentence that gets a change reviewed properly.

**Metadata on models and columns** should answer the questions you are actually asked. For each published dataset, state the **grain** in one sentence, the **owner** and where to ask questions, the **refresh cadence and expected freshness**, the **known caveats and exclusions**, and for each column the **unit, currency, and derivation** in plain words — "gross amount minus refunds, in USD, at the order's booking rate" tells an analyst everything that `net_revenue` does not.

Publishing is then `dbt docs generate` plus hosting the output where consumers can reach it, ideally regenerated by the pipeline itself after every production build so the site can never be stale. Two habits keep it honest: review descriptions in the same pull request as the code, so a changed definition and its documentation move together; and mark deprecated models explicitly, with a replacement and a removal date, rather than deleting them under their users.

The measure of success is not the existence of a docs site. It is whether a consumer who has never met you can answer, unaided: what is this column, how fresh is it, where did it come from, who owns it, and what will break if it changes.

## Practice

These exercises close out the pipeline you have built across the course. Work them against your real project.

1. **Publish the graph.** Ensure every model uses `ref()` and `source()` with no hard-coded table names — grep for the schema name to be sure. Run `dbt docs generate` and serve it, then have someone who has not seen the project try to find which source feeds one of your marts. Note anything they could not answer.

2. **Trace one column end to end.** Pick a derived column in a mart. Produce a written trace from that column to its raw source columns, to the specific file or extract that supplied the values, to the run that loaded it. Record the queries you ran and how long the whole trace took.

3. **Carry provenance forward.** Extend `_source_file`, `_run_id`, and `_ingested_at` through staging and into at least one fact table, plus a `_built_by_invocation` and `_built_at` on the model. Then, for a single row in the fact table, state which file and which run produced it. Document where in your graph provenance is necessarily lost and why.

4. **Record model runs.** Load dbt's `run_results.json` into `ops.model_runs` after every build, including the Git commit. Then answer in SQL: which model has the longest median execution time; which model failed most often in the last month; and which commit was live for last Wednesday's build.

5. **Do an impact analysis.** Choose a staging column you would like to rename. Before changing anything, produce the complete list of downstream models, tests, and exposures affected, using selectors. Then make the change on a branch and confirm that exactly the predicted set broke or rebuilt. Report any surprises.

6. **Scope a backfill with lineage.** Introduce a deliberate bug in an intermediate model and let it run for three intervals. Then use the graph to determine the minimal rebuild set, reprocess only that set for only those intervals, and verify correctness. Compare the runtime against a full-project rebuild and state the ratio.

7. **Find the model-graph critical path.** Join your dependency graph to `ops.model_runs` and compute the longest cumulative-time chain. Identify the top three contributors, make one structural or materialization change, and re-measure. Report whether the critical path moved.

8. **Find and remove dead models.** Cross-reference your models against your warehouse's query history and your declared exposures. List every model with no downstream model, no exposure, and no consumer queries in the last 90 days. Remove or deprecate at least one, and record the build time saved.

9. **Declare the exposures.** Add exposures for every real consumer of your marts — dashboards, extracts, downstream jobs — with owner and description. Then run an impact analysis on a mart change and confirm the affected exposures are named in the output.

10. **Write the consumer-facing documentation.** For one published mart, document grain, owner, refresh cadence, expected freshness, caveats, and every column's unit and derivation. Then hand the docs site to someone unfamiliar with the project and ask them the five questions at the end of this lesson. Record which ones they could not answer and fix those first.
