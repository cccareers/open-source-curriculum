---
lesson_id: de210-05
course_id: de210
pathway: data-engineer
title: Transformations with dbt
order: 5
kind: lesson
competency_ids:
  - D1-S1-C01
  - D6-S1-C03
objectives:
  - Implement layered dbt models with tests and documentation
---

## The transformation layer, and why it is SQL again

Your raw zone now fills itself. Everything after that point — cleaning up column names, conforming types, joining entities, deriving metrics, building the tables a dashboard reads — is transformation, and in a modern stack it happens *inside the warehouse*, in SQL, on hardware that is very good at exactly this.

That is a genuine reversal from the previous course. In Spark you controlled partitions, shuffles, and memory yourself because the engine handed you those levers. A cloud data warehouse hides them behind a query planner and rents you compute by the second. The engineering skill moves from tuning execution to structuring the *set of tables* — what depends on what, what is rebuilt versus updated, what is tested, and what it costs.

**dbt** (data build tool) is the standard way to do that structuring. Its premise is small: you write `SELECT` statements, and dbt handles the DDL, the dependency graph, the environments, the tests, and the documentation. It does not move data and it has no execution engine of its own — the warehouse does all the work. This lesson uses **dbt Core**, the open-source command-line tool, which is what you run from an orchestrator. dbt Cloud is a hosted scheduler and IDE around the same core; nothing here requires it.

## Warehouse-native, and what that means for your SQL

Before the first model, know the machine you are writing for. BigQuery, Redshift, and Snowflake differ in surface detail but share the architecture that matters: **storage and compute are separated**, data is held in a compressed columnar format, and queries are executed by a scaling pool of workers that read only the columns and partitions they need.

Three consequences shape every model you write.

**Columns are cheap; scans are not.** Reading three columns from a wide table costs roughly three columns' worth of I/O. `SELECT *` in a model is not a style complaint — it is a bill. Project the columns you need and no more.

**Pruning is the main optimisation available to you.** All three warehouses skip data they can prove is irrelevant, and all three need you to give them the means: BigQuery uses partitioning (usually by a date column) plus clustering; Snowflake maintains micro-partitions automatically and takes a cluster key on large tables; Redshift uses sort keys and distribution keys. Whichever you are on, a large fact table should be organised by the column your filters use — almost always the event or load date — and a `WHERE` clause on that column should be present in every query that does not genuinely need all of history.

**You are billed for the work, one way or another.** BigQuery's default model charges per byte scanned; Snowflake and Redshift charge for warehouse or cluster time. Either way, the same behaviours cost money: unpruned scans, rebuilding an entire table when a day changed, joining before filtering, and leaving a warehouse running while nothing queries it. Cost awareness is not an optional extra in this layer; it is the main difference between a junior and a senior model.

dbt exposes the warehouse-specific knobs through model configuration, so the ideas above are one config block away:

```sql
{{ config(
    materialized = 'incremental',
    unique_key   = 'order_id',
    partition_by = {'field': 'order_date', 'data_type': 'date'},
    cluster_by   = ['customer_id']
) }}
```

On Snowflake or Redshift the keys change name (`cluster_by`, `sort`, `dist`) but the intent is identical, and dbt's adapter translates it into the right DDL. Write the intent; let the adapter deal with the dialect.

## A dbt project, minimally

```text
analytics/
├── dbt_project.yml        # project name, model paths, default configs
├── profiles.yml           # warehouse connection (kept outside the repo)
├── models/
│   ├── staging/
│   │   ├── _sources.yml   # declares raw tables + freshness
│   │   ├── _models.yml    # descriptions + tests for this folder
│   │   └── stg_orders.sql
│   ├── intermediate/
│   │   └── int_orders_enriched.sql
│   └── marts/
│       ├── _models.yml
│       └── fct_orders.sql
├── macros/
├── seeds/
├── snapshots/
└── tests/
```

A **model** is a `.sql` file containing one `SELECT`. Its filename is the name of the relation dbt creates. There is no `CREATE TABLE`, no `DROP`, no `INSERT` — dbt writes the DDL around your select according to the model's materialization.

The two functions that make it a graph rather than a folder of scripts are `source()` and `ref()`.

```sql
-- models/staging/stg_orders.sql
select
    payload:order_id::string        as order_id,
    payload:customer_id::string     as customer_id,
    lower(payload:status::string)   as status,
    payload:amount::numeric(18, 2)  as amount_usd,
    payload:created_at::timestamp   as created_at,
    _ingested_at,
    _run_id
from {{ source('raw', 'orders') }}
where payload:order_id is not null
```

```sql
-- models/marts/fct_orders.sql
select
    o.order_id,
    o.customer_id,
    c.customer_segment,
    o.amount_usd,
    date(o.created_at) as order_date
from {{ ref('stg_orders') }} o
left join {{ ref('dim_customers') }} c using (customer_id)
```

`ref()` does two jobs at once: it resolves to the correct schema-qualified name for whichever environment you are running in, and it declares an edge in the dependency graph. dbt topologically sorts those edges, so `dbt run` builds staging before marts without you specifying an order. Hard-coding a table name instead of using `ref()` is the one unforgivable mistake in a dbt project — it silently removes the model from the graph, and it will be built in the wrong order or not at all.

`source()` names the raw tables your ingestion lands, declared once in YAML:

```yaml
version: 2
sources:
  - name: raw
    schema: raw
    tables:
      - name: orders
        loaded_at_field: _ingested_at
        freshness:
          warn_after:  {count: 6,  period: hour}
          error_after: {count: 24, period: hour}
```

`dbt source freshness` then checks whether ingestion is actually keeping up — a cheap, high-value check that catches "the pipeline succeeded but the data is three days old".

## Layering: staging, intermediate, marts

The three-layer convention is the single most useful thing dbt brings, and it is a convention rather than a feature — nothing enforces it but your discipline.

**Staging** is one model per source table, and it does exactly four things: rename columns to your standards, cast types, apply trivial coercions such as lowercasing a status, and filter out records that are structurally unusable. No joins, no aggregation, no business logic. Staging models are usually materialized as views, because they are cheap and always current, and because their job is to give every downstream model one canonical way to refer to a source. One-to-one with the source, always.

**Intermediate** models hold the awkward middle: a join that three marts all need, a de-duplication, a pivot, a window function that assigns a sequence. Their purpose is to keep a single complicated idea in one place instead of copy-pasted across marts. They are named for what they do (`int_orders_enriched`), are not exposed to consumers, and are often ephemeral — inlined as a CTE into whatever references them rather than materialized at all.

**Marts** are what consumers query: facts (event-grained, additive measures) and dimensions (entity-grained, descriptive attributes). They are materialized as tables because consumers query them repeatedly and expect speed. Names here are business names, and columns here are the ones you are willing to support.

![The three dbt model layers, showing a source table flowing through one staging view, a shared intermediate model, and two mart tables consumed by a dashboard](./img/dbt-model-layers.png)

Why bother? Because the alternative — one enormous query that goes from raw to dashboard — cannot be tested at any intermediate point, cannot share a subquery with its neighbour, cannot be re-run in part, and cannot be read by a new team member. Layering buys you testability, reuse, and a graph you can debug.

## Materializations, and the incremental one that matters

A **materialization** is dbt's strategy for turning your `SELECT` into an object in the warehouse.

- `view` — a view is created; no storage, always fresh, computation happens at query time. Default for staging.
- `table` — dropped and rebuilt in full on each run. Simple, always correct, cost proportional to total history.
- `ephemeral` — not built at all; the SQL is injected as a CTE into dependent models. Good for small helpers, invisible in the warehouse, awkward to debug.
- `incremental` — built fully the first time, and afterwards only processes new or changed rows.

Incremental is where the money is, and it needs care:

```sql
{{ config(
    materialized  = 'incremental',
    unique_key    = 'order_id',
    incremental_strategy = 'merge',
    partition_by  = {'field': 'order_date', 'data_type': 'date'}
) }}

select
    order_id,
    customer_id,
    amount_usd,
    date(created_at) as order_date,
    _ingested_at
from {{ ref('stg_orders') }}

{% if is_incremental() %}
where _ingested_at > (select coalesce(max(_ingested_at), '1900-01-01') from {{ this }})
{% endif %}
```

Three parts to read. `is_incremental()` is true only when the model already exists and you have not asked for a full refresh, so the `WHERE` clause is absent on the first build and present thereafter. `{{ this }}` is the model's own existing relation — filtering against its own maximum load timestamp is the standard way to find what is new. `unique_key` plus the `merge` strategy tells dbt to update matching rows rather than append them, which is what makes a re-run harmless.

Filter on the **ingestion** timestamp rather than the business timestamp where you can. A record for last Tuesday that arrived today has a `created_at` of last Tuesday and an `_ingested_at` of today; filtering on `created_at` would miss it entirely. This is the most common incremental bug in production, and it produces quiet, permanent gaps.

Incremental models drift. Deletes at the source, a bug in the logic, a change in the definition — all leave the table subtly wrong in a way a fresh build would not be. The answer is a scheduled `dbt run --full-refresh --select fct_orders`, weekly or monthly, treated as routine maintenance rather than an emergency.

Two further building blocks are worth knowing. **Seeds** are small CSVs in the repository (`dbt seed`) — the right home for a country-code lookup or a category mapping, and the wrong home for anything that changes often or is large. **Snapshots** capture how a row looked over time, using dbt's `check` or `timestamp` strategy to write validity ranges — this is how you keep history for a source table that only ever shows you the present.

## Jinja and macros, in moderation

Every dbt model is a Jinja template compiled before it is sent to the warehouse, which is what makes `ref`, `source`, `is_incremental`, and configuration possible. You can also write your own macros:

```sql
{% macro cents_to_usd(column_name, decimals=2) %}
    round( {{ column_name }} / 100.0, {{ decimals }} )
{% endmacro %}
```

```sql
select order_id, {{ cents_to_usd('amount_cents') }} as amount_usd
from {{ ref('stg_orders') }}
```

Use macros for genuine repetition — a currency conversion used in nine models, a surrogate key, a standard set of audit columns. Resist the urge to build a templating framework: dbt code whose SQL cannot be read without mentally executing the Jinja is worse than the repetition it replaced. Run `dbt compile` and read `target/compiled/...` whenever a template stops being obvious; that is the SQL the warehouse actually receives.

Two features you will reach for repeatedly: `{{ var('start_date') }}` for values passed in at run time (`dbt run --vars '{"start_date": "2024-03-05"}'`), which is how an orchestrator hands a model its data interval, and `dbt_utils`, an installed package of well-tested macros for surrogate keys, date spines, and pivots.

## Tests: the models' own contract

dbt tests are `SELECT` statements that are expected to return zero rows. If a test query returns rows, those rows *are* the failure, which makes debugging immediate.

**Generic tests** are declared in YAML and are the ones you will write ninety percent of the time:

```yaml
version: 2
models:
  - name: fct_orders
    description: >
      One row per order, at the point the order was last updated. The grain is
      order_id. Cancelled orders are retained with status = 'cancelled'.
    columns:
      - name: order_id
        description: Natural key from the source system's orders table.
        tests: [unique, not_null]
      - name: customer_id
        description: FK to dim_customers.
        tests:
          - not_null
          - relationships:
              to: ref('dim_customers')
              field: customer_id
      - name: status
        tests:
          - accepted_values:
              values: ['pending', 'paid', 'shipped', 'cancelled']
      - name: amount_usd
        description: Order total in USD, converted at the order's booking rate.
        tests:
          - not_null:
              config:
                severity: warn
```

Four built-ins — `unique`, `not_null`, `accepted_values`, `relationships` — cover the structural properties that keep a mart trustworthy: the grain is what you claim, the keys join, and the enumerated columns contain what downstream code expects. Adding them to every mart's key columns is the minimum bar.

**Singular tests** are one-off SQL files in `tests/` for assertions that are specific to your business:

```sql
-- tests/assert_no_future_orders.sql
select order_id, order_date
from {{ ref('fct_orders') }}
where order_date > current_date
```

**Severity** is the lever that decides consequences: `error` fails the run, `warn` reports and continues. Set severity by what you would actually do at 3 a.m. — a broken primary key is an error, a slightly elevated null rate in an optional column is a warning. You can also set `error_if`/`warn_if` thresholds so a test tolerates a handful of rows but not a flood.

Testing here is about the *models* keeping their own promises. Designing enforcement gates that stop bad data from reaching a consumer at all — quarantine, circuit-breakers, freshness and volume anomaly checks — is the next lesson's work, and it builds directly on these tests.

## Documentation as an output, not a chore

Every `description` you write in YAML becomes part of a generated site:

```bash
dbt docs generate
dbt docs serve
```

The site carries each model's description, every column's description and tests, the compiled SQL, and an interactive dependency graph from source to mart. Because the descriptions live next to the code and are reviewed in the same pull request, they stay true far longer than a wiki page does.

Write the descriptions that answer real questions rather than restating the column name. Useful ones state the **grain** ("one row per order per shipment"), the **unit and currency**, the **exclusions** ("test accounts are filtered out in staging"), and the **known caveats** ("refunds appear as negative rows from 2023-06 onwards"). "The order id" tells a reader nothing they could not guess; "natural key from the source system, unique after de-duplication in staging" tells them something they need.

## Running dbt from the orchestrator

In production dbt is not run by a human at a terminal. The command sequence a scheduled task executes is conventionally:

```bash
dbt deps                 # install packages
dbt source freshness     # is ingestion actually current?
dbt build --select state:modified+ --target prod
```

`dbt build` runs models and their tests interleaved in dependency order, so a failing test stops its dependents from being built on top of bad data — which is exactly the behaviour you want, and the reason to prefer it over `dbt run` followed by `dbt test`.

Node selection is worth learning properly, because it is how you avoid rebuilding the world: `--select stg_orders+` builds a model and everything downstream, `+fct_orders` builds it and everything upstream, `tag:daily` selects by tag, and `state:modified+` builds only what changed relative to a stored manifest.

The other production concern is **environments**. A dbt target names a connection and a schema, so the same code builds into `dev_yourname` on your laptop and `analytics` in production, with no branching in the SQL. Run against dev, review, merge, and let the orchestrator run production. A useful CI check is `dbt build --select state:modified+` against a pull request, which tests exactly the models the change can affect.

Wiring it into the DAG you have been building is then one task per logical group, sequenced after ingestion:

```python
    ingest_complete >> dbt_source_freshness >> dbt_build_staging >> dbt_build_marts
```

## Practice

Work against any warehouse you can reach — a free-tier BigQuery or Snowflake account, or a local Postgres via the Postgres adapter. Point dbt at the raw tables your ingestion DAG produced.

1. **Stand up the project.** Initialise a dbt project, configure a profile with a dev target, declare your raw tables as a source with `loaded_at_field` and freshness thresholds, and confirm `dbt debug` and `dbt source freshness` both succeed.

2. **Build the three layers.** Write at least one staging model per raw table (renamed, cast, filtered, materialized as a view), one intermediate model that performs a join or de-duplication used by more than one mart, and two marts: a fact at event grain and a dimension at entity grain. Use `ref()` and `source()` everywhere. Run `dbt run` and confirm from the log that dbt built them in dependency order without you specifying one.

3. **Make the fact incremental.** Convert the fact table to `materialized='incremental'` with a `unique_key` and the `merge` strategy, filtering on `_ingested_at` against `{{ this }}`. Run it, add new raw rows for a fresh interval, run again, and confirm only the new rows were processed and the row count is right. Then update one existing source row, re-run, and confirm the mart shows the update rather than a duplicate.

4. **Reproduce the late-arriving bug.** Change the incremental filter to use the business timestamp instead of the ingestion timestamp. Insert a raw record whose business date is a week old, run the model, and show that the record never appears. Restore the correct filter and confirm it does.

5. **Add and use pruning.** Configure a partition or cluster/sort key on the fact table appropriate to your warehouse. Run one query filtered on that column and one that is not, and record the bytes scanned or the elapsed time for each. Write a sentence explaining the difference to a teammate who has only used Postgres.

6. **Test the contracts.** Add `unique` and `not_null` on every mart's key, `relationships` from your fact to your dimension, and `accepted_values` on a status column. Write one singular test that encodes a business rule of your own. Deliberately break each one and record the exact failing rows dbt reports. Set at least one test to `severity: warn` and justify the choice in a comment.

7. **Prove that `build` protects downstream.** Introduce a duplicate key in staging, then run `dbt build`. Confirm the mart that depends on it was not built. Then run `dbt run` followed by `dbt test` on the same broken data and describe the difference in outcome.

8. **Document and publish.** Write descriptions for both marts and every column in them, stating grain, units, and any exclusions. Run `dbt docs generate` and `dbt docs serve`, then trace one mart column back to its source table in the lineage graph and write down the path it took.

9. **Run it from the DAG.** Add tasks to your Airflow DAG that run `dbt deps`, `dbt source freshness`, and `dbt build`, sequenced after ingestion completes, passing the run's data interval in with `--vars`. Trigger the DAG for one interval and confirm the models built and the tests ran.
