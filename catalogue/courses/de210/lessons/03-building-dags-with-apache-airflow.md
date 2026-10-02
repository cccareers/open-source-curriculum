---
lesson_id: de210-03
course_id: de210
pathway: data-engineer
title: Building DAGs with Apache Airflow
order: 3
kind: lesson
competency_ids:
  - D1-S1-C01
  - D1-S1-C02
objectives:
  - Build an Airflow DAG with dependencies, retries, and idempotent tasks
---

## What you are and are not learning here

Airflow is the most widely deployed open-source orchestrator, and in this lesson you learn it the way most engineers actually use it: as a **DAG author**. You write Python that declares work and dependencies, you test it locally, you read run history in the UI, and you re-run what needs re-running.

You are not learning to operate the platform. Choosing an executor, deploying to Kubernetes, sizing the metadata database, and upgrading Airflow are a platform team's responsibilities and are out of scope. Where an operational setting affects what you can write — task concurrency, for instance — it is introduced from the author's side only.

Assume a working Airflow environment: a scheduler, a web UI on `localhost:8080`, and a folder your DAG files are read from (`AIRFLOW_HOME/dags` by default). Everything below is Airflow 2.x with the TaskFlow API, which is the current authoring style.

## The DAG file

A DAG file is ordinary Python that the scheduler imports on a loop — every thirty seconds or so by default. Importing it must be fast and side-effect free: no API calls, no queries, no heavy imports at module scope. Module-level code runs on every parse, in the scheduler process, for every DAG in the folder. Work belongs inside tasks, which run later, elsewhere.

```python
from datetime import datetime, timedelta
from airflow.decorators import dag, task

@dag(
    dag_id="orders_daily",
    schedule="0 2 * * *",
    start_date=datetime(2024, 1, 1),
    catchup=False,
    max_active_runs=1,
    default_args={
        "retries": 3,
        "retry_delay": timedelta(minutes=5),
        "retry_exponential_backoff": True,
        "execution_timeout": timedelta(minutes=30),
        "owner": "data-eng",
    },
    tags=["orders", "daily"],
)
def orders_daily():
    ...

orders_daily()
```

Read the arguments carefully, because each one is a decision you were asked to make in the previous lesson.

`schedule` accepts a cron expression, a `timedelta`, one of the presets (`"@daily"`, `"@hourly"`), or `None` for a DAG that is only ever triggered manually or by another DAG. `start_date` is the beginning of the first data interval the DAG is responsible for — it is a data boundary, not a deployment date, and it must be a fixed timestamp rather than `datetime.now()`, which would make the DAG's identity change every parse.

`catchup` decides what happens for intervals between `start_date` and now that have never run. With `catchup=True`, the scheduler queues them all; with `catchup=False`, it starts from the most recent one and you backfill deliberately when you want to. Default to `False` and backfill on purpose — a DAG with a two-year-old start date and catchup enabled will attempt seven hundred runs the moment you deploy it.

`max_active_runs=1` prevents a run that overruns its schedule from being lapped by the next one. For any DAG that writes to a shared target, this is the safe setting.

`default_args` applies to every task unless overridden. Retries and `execution_timeout` belong here almost always: a task with no timeout can hang forever holding a slot, and a task with no retries turns every transient blip into a page.

## Tasks and the TaskFlow API

A task is one retryable unit of work. Under the TaskFlow API you write a plain Python function and decorate it:

```python
    @task
    def extract_orders(data_interval_start=None, data_interval_end=None) -> str:
        import requests
        from pathlib import Path

        params = {
            "updated_after": data_interval_start.isoformat(),
            "updated_before": data_interval_end.isoformat(),
        }
        rows = requests.get(API_URL, params=params, timeout=30).json()["data"]

        out = Path(f"/data/raw/orders/dt={data_interval_start:%Y-%m-%d}/orders.json")
        out.parent.mkdir(parents=True, exist_ok=True)
        tmp = out.with_suffix(".tmp")
        tmp.write_text(json.dumps(rows))
        tmp.replace(out)          # atomic publish
        return str(out)
```

Three things in that small function matter more than the syntax.

**The interval is injected.** `data_interval_start` and `data_interval_end` are supplied by Airflow from the run's context, so the task is a pure function of its interval. Re-running the run for 5 March next year re-fetches 5 March's window and rewrites 5 March's file. Had the code said `updated_after=datetime.now() - timedelta(days=1)`, that same re-run would have fetched next year's data and stamped it with an old date.

**The write is idempotent and atomic.** The path is keyed by the interval, so a second execution replaces the same file rather than adding another. Writing to `.tmp` and renaming means a crash mid-write leaves no half-file for a downstream task to read.

**The return value is small.** TaskFlow return values travel through **XCom**, which is stored in Airflow's metadata database. XCom is for coordination — a path, an ID, a row count — not for data. Returning a DataFrame will bloat the database and eventually break it. Pass a *pointer* and let the next task read the bytes from storage.

Wiring tasks together is then just calling them:

```python
    raw_path = extract_orders()
    staged = load_to_warehouse(raw_path)
    transform_orders(staged)
```

Passing one task's output into another creates the dependency edge. For tasks with no data to pass, use the explicit operators:

```python
    check_source >> [extract_orders_us, extract_orders_eu] >> merge_regions
```

The list form fans out and back in: both extracts run in parallel after the check, and the merge waits for both.

## Operators, hooks, and when to write plain Python

Not everything should be a Python function. Airflow ships **operators** — pre-built task types — and **hooks**, the connection-aware clients underneath them.

- `PythonOperator` (or `@task`) for arbitrary Python.
- `BashOperator` for shell commands.
- `SQLExecuteQueryOperator` and its warehouse-specific relatives for running SQL against a connection.
- Transfer operators for common source-to-sink moves.
- `EmptyOperator` as a structural join or marker node.
- `TriggerDagRunOperator` to start another DAG, and `ExternalTaskSensor` to wait on one.

The rule of thumb: use an operator when one exists and it does what you want, because it already handles connection management, logging, and templating. Drop to `@task` plus a hook when your logic is genuinely custom.

Credentials never belong in DAG code. Airflow **Connections** hold host, credentials, and extras under a name; **Variables** hold configuration values. Both are referenced by ID:

```python
    from airflow.providers.postgres.hooks.postgres import PostgresHook

    @task
    def row_count(table: str) -> int:
        hook = PostgresHook(postgres_conn_id="warehouse")
        return hook.get_first(f"SELECT count(*) FROM {table}")[0]
```

One caution about Variables: `Variable.get()` at module scope hits the metadata database on every DAG parse, for every DAG. Fetch inside the task, or use the templated form.

## Templating and the run context

Any templated field can use Jinja with the run context. The frequently used variables are `{{ data_interval_start }}`, `{{ data_interval_end }}`, `{{ ds }}` (the logical date as `YYYY-MM-DD`), `{{ run_id }}`, and `{{ params.* }}`.

```python
    load = SQLExecuteQueryOperator(
        task_id="load_staging",
        conn_id="warehouse",
        sql="""
            DELETE FROM staging.orders WHERE order_date = '{{ ds }}';
            INSERT INTO staging.orders
            SELECT * FROM external.orders_raw WHERE order_date = '{{ ds }}';
        """,
    )
```

That delete-then-insert pair is the canonical idempotent SQL load: the task removes exactly its own slice before writing it, so any number of executions leaves exactly one copy. Where the target supports it, `MERGE` on a business key does the same job when rows can be updated as well as added.

`params` lets you declare run-time inputs with defaults, which the UI exposes when a run is triggered manually — the clean way to build a DAG that normally runs on a schedule but can be pointed at a specific customer or date range on demand.

## Sensors: waiting without wasting

A **sensor** is a task that waits for a condition — a file to appear, a partition to exist, another DAG's task to succeed — and only then succeeds itself.

```python
    from airflow.providers.amazon.aws.sensors.s3 import S3KeySensor

    wait_for_drop = S3KeySensor(
        task_id="wait_for_drop",
        bucket_key="incoming/orders/{{ ds }}/_SUCCESS",
        poke_interval=300,
        timeout=60 * 60 * 4,
        mode="reschedule",
    )
```

Two settings decide whether a sensor is a good citizen. `mode="reschedule"` releases the worker slot between checks instead of holding it for hours — always prefer it for anything that waits longer than a few minutes; the alternative, `mode="poke"`, occupies a slot the entire time and a handful of them can deadlock a small deployment. And `timeout` must always be set, because a sensor that waits forever hides an upstream outage instead of reporting it. Where a provider offers a **deferrable** version of an operator or sensor, it is better still: it suspends and consumes no worker slot at all while waiting.

Notice the sensor waits on `_SUCCESS`, not on the data file. Waiting for the marker the producer writes *last* is how you avoid reading a file that is still being uploaded.

## Trigger rules, branching, and structure

By default a task runs when **all** its upstream tasks have succeeded. `trigger_rule` changes that: `all_done` runs regardless of upstream outcome (right for cleanup tasks), `one_success` runs as soon as any upstream succeeds, `none_failed_min_one_success` is the rule you want after a branch, and `all_failed` is occasionally useful for fallbacks.

Branching picks a path at run time:

```python
    @task.branch
    def choose_load(row_count: int) -> str:
        return "full_refresh" if row_count > 1_000_000 else "incremental_merge"
```

The returned task ID runs; its siblings are marked *skipped*, and skips propagate downstream — which is exactly why the join task after a branch needs `none_failed_min_one_success`, or it will skip too.

As DAGs grow, group related tasks so the graph stays readable:

```python
    from airflow.utils.task_group import TaskGroup

    with TaskGroup("ingest") as ingest:
        extract_api()
        extract_files()
        extract_db()
```

A task group is a visual and namespacing device, not an execution unit — it does not make its members atomic.

Two authoring habits keep DAGs maintainable. **Size tasks by retry blast radius**: a task should be the smallest chunk you would want to re-run on its own, but not so small that a hundred of them each spend more time on scheduling overhead than on work. **Generate repetitive DAGs from configuration** — a loop over a list of tables that creates one task per table is idiomatic, and far better than fifty copy-pasted blocks, as long as the loop reads from a static list or file rather than querying a database at parse time.

## Concurrency, from the author's side

Even without touching deployment settings, you control how much of the cluster your DAG can consume. `max_active_runs` caps simultaneous runs of the DAG; `max_active_tasks` caps simultaneous tasks within it; `max_active_tis_per_dag` on a single task caps that task across runs. **Pools** are named slot buckets — assign every task that hits a fragile source API to a pool of size two and no amount of backfill parallelism can overwhelm it. `priority_weight` decides who gets a free slot first when there is contention.

These are the levers that keep a backfill of ninety days from taking the production database down, so decide them when you write the DAG rather than during the incident.

## Testing, running, and re-running

Author-side testing has three levels and you should use all three.

```bash
# 1. Does it parse? Are there import errors or cycles?
python dags/orders_daily.py
airflow dags list-import-errors

# 2. Run a single task for a specific interval, in-process.
airflow tasks test orders_daily extract_orders 2024-03-05

# 3. Execute the whole DAG for one interval.
airflow dags test orders_daily 2024-03-05
```

`airflow tasks test` is the fastest feedback loop in Airflow: it runs the real task code with a real context and does not write run state, so you can iterate freely. Add a plain `pytest` file that imports the DAG bag and asserts there are no import errors, that every task has retries configured, and that the task IDs are what you expect — these catch a surprising share of mistakes before deployment.

When a run has failed and you have fixed the cause, **clear** the failed task in the UI (or with `airflow tasks clear`). Clearing resets the task and, with the downstream option, its dependents, so the scheduler re-runs exactly the affected subgraph. To reprocess a past range deliberately:

```bash
airflow dags backfill orders_daily \
  --start-date 2024-03-01 --end-date 2024-03-07
```

Backfilling is safe only to the degree your tasks are idempotent — which is why idempotency was the first thing this lesson insisted on, and why it is worth verifying by running one interval twice and diffing the output before you ever backfill a week.

## Practice

Build one DAG and keep extending it; later lessons assume it exists.

1. **Author a three-task DAG.** Create `orders_daily` with an extract task, a load task, and a transform task, wired by TaskFlow return values. Set a daily schedule, a fixed `start_date`, `catchup=False`, `max_active_runs=1`, and `default_args` with three retries, a five-minute delay, exponential backoff, and a thirty-minute execution timeout. Verify it parses with `airflow dags list-import-errors`.

2. **Prove idempotency.** Run `airflow tasks test` for the same interval twice, then count rows or list output files. If the second execution changed the result, rewrite the write step as delete-then-insert or an overwrite of an interval-keyed path, and repeat until two executions and one execution are indistinguishable. Write down the exact key you replace on.

3. **Break the interval, then fix it.** Deliberately change the extract to filter on `now() - 1 day`. Run the task for an interval a week in the past and inspect the output. Explain in writing what data you actually got and what a backfill of the last month would have produced. Then restore the injected-interval version.

4. **Fan out and join.** Split the extract into three parallel tasks pulling three sources, followed by a single merge task. Confirm in the UI that the three ran concurrently. Now make one of them fail and record what the scheduler did to the merge task and to everything downstream of it.

5. **Add a sensor with limits.** Put a file or partition sensor in front of the extract, using `mode="reschedule"`, a sensible `poke_interval`, and a timeout well under the point at which the pipeline would be considered late. Test it against a condition that is never satisfied and confirm it times out and fails rather than waiting indefinitely.

6. **Branch, then join.** Add a `@task.branch` that selects a full-refresh path or an incremental path based on a row count from a preceding task. Give the join task the correct trigger rule. Force both branches in separate test runs and confirm the join executes in each case; then set the trigger rule back to the default and record exactly what happens.

7. **Constrain the blast radius, then backfill.** Assign your extract tasks to a pool with two slots. Backfill five days and observe from the run history that no more than two extracts ran at once. Then compare the output of one backfilled day against the same day produced by its original scheduled run, and confirm they are identical.
