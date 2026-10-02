---
lesson_id: de210-07
course_id: de210
pathway: data-engineer
title: Monitoring, Alerting, and Debugging Runs
order: 7
kind: lesson
competency_ids:
  - D5-S2-C03
  - D1-S1-C03
objectives:
  - Instrument a pipeline so that a failed or late run is detected and diagnosed quickly
---

## The two questions monitoring has to answer

Your pipeline now ingests on a schedule, transforms in layers, and refuses to publish data that fails its gates. It is still missing the part that makes it operable: the ability to tell you, without you asking, that something is wrong — and then to tell you enough to fix it.

Those are two separate jobs and they need two different kinds of instrumentation. **Detection** answers *is something wrong right now?* and must be cheap, automatic, and reliable enough to be trusted. **Diagnosis** answers *what exactly is wrong and where?* and must be rich, queryable, and available after the fact. Teams routinely build one and not the other. A pipeline with detection and no diagnosis pages you at 3 a.m. and leaves you reading logs for an hour. A pipeline with diagnosis and no detection has beautiful dashboards nobody opens until a stakeholder complains.

Note what monitoring is not. The previous lesson's gates check the *data*. This lesson checks the *pipeline*: whether it ran, when, how long it took, how much it cost, and whether it will still fit in its window next quarter. Both are necessary — a run can succeed with wrong data, and a run can be blocked while the data is perfect.

## What to measure

Five families of signal cover almost everything worth alerting on.

**Liveness.** Did the run start? A run that never began produces no failure, no log, and no alert — it is the quietest and nastiest outage there is. Detect it with a heartbeat: a check that asserts a successful run exists for each interval, running independently of the pipeline itself.

**Outcome.** State per task and per run: success, failed, upstream-failed, skipped, up-for-retry. The *retry rate* deserves its own attention. A task that succeeds on its third attempt every night is a failing task with a safety net, and the safety net will eventually be too short.

**Timeliness.** Two different clocks. **Duration** is how long the run took; **lag** (or freshness) is how old the newest data is. Lag is the one your consumers actually feel, and it is the right basis for a service-level objective: "orders data is never more than four hours old during business hours" is a promise a stakeholder understands, where "the DAG succeeds" is not.

**Throughput and cost.** Rows in and out per task, bytes scanned, warehouse credits or slot time consumed, per run and per model. Cost is a monitoring signal, not an accounting afterthought — an unpruned join added on Tuesday shows up here on Wednesday rather than in next month's invoice.

**Resource pressure.** Queue depth, worker slot utilisation, pool saturation, and time spent queued rather than running. When queue time starts growing, you are out of capacity, and this is the signal that drives the scaling work later in the lesson.

For each of these, the useful comparison is against the metric's own history rather than an absolute number. "The run took 90 minutes" means nothing; "the run took 90 minutes against a 28-day median of 35" is an incident.

## Instrumenting the pipeline

Your orchestrator already records most of the outcome and duration data — that persisted run history was one of the guarantees that distinguished it from cron. The work is to get the rest emitted and all of it somewhere you can query.

**Structured logs.** Log JSON, not prose, and put the identifying fields in every line. A log message you cannot filter by run is a log message you will read linearly at 3 a.m.

```python
log.info(json.dumps({
    "event": "extract_complete",
    "dag_id": context["dag"].dag_id,
    "task_id": context["task"].task_id,
    "run_id": context["run_id"],
    "data_interval": str(context["data_interval_start"].date()),
    "attempt": context["ti"].try_number,
    "rows": rows_written,
    "bytes": bytes_written,
    "duration_s": round(elapsed, 2),
    "source": "orders_api",
}))
```

**A run-metadata table.** The single highest-value piece of instrumentation you can add, and it is a dozen lines of code. Every task writes one row when it finishes:

```sql
CREATE TABLE ops.pipeline_runs (
    dag_id          STRING,
    task_id         STRING,
    run_id          STRING,
    data_interval   DATE,
    attempt         INT,
    state           STRING,
    started_at      TIMESTAMP,
    ended_at        TIMESTAMP,
    duration_s      NUMERIC,
    rows_in         BIGINT,
    rows_out        BIGINT,
    bytes_scanned   BIGINT,
    error_class     STRING
);
```

Because it lives in the warehouse, every question about the pipeline becomes SQL you already know how to write: which task is slowest, which fails most, how duration has trended over ninety days, which model costs the most per run. It is also what the next lesson's run history builds on.

**Callbacks.** Attach handlers rather than sprinkling try/except through your task bodies:

```python
default_args = {
    "on_failure_callback": notify_and_record,
    "on_retry_callback": record_retry,
    "sla": timedelta(hours=2),
}
```

An SLA is a per-task promise about elapsed time from the interval's start; missing it fires a notification while the task is still running, which is the difference between finding out at 06:00 that the run is late and finding out at 09:00 that it never finished.

**Metrics.** Where a metrics backend exists, emit counters and timers alongside the logs so dashboards and alert rules can be built without querying the warehouse. Airflow exposes its own scheduler and task metrics for the platform team; your job as an author is to emit the pipeline-specific ones — rows, lag, cost — that nobody else can know.

## Alerting people would not mute

An alert is a claim that a human should act. Anything that does not meet that bar belongs on a dashboard or in a report.

Sort every alert into one of three routes and be strict about it. A **page** interrupts someone immediately and is reserved for a consumer-visible breach that will not fix itself: the daily mart will miss its publication deadline, the pipeline has been failing for three consecutive intervals, a reconciliation gate has blocked publication. A **ticket** goes to the team queue for the next working day: a single failed run that a retry recovered, a warning-severity data check, a cost anomaly. A **dashboard** entry is everything else — trends, distributions, per-task durations.

Four rules keep the routing honest.

**Alert on symptoms, not causes.** "Orders data is 6 hours stale" is actionable and stable. "The API extract task failed" is one of thirty ways that symptom occurs, and alerting on all thirty is how you get thirty alerts for one incident.

**Alert once per incident.** Deduplicate and group. A failure that cascades into fourteen upstream-failed tasks is one alert, not fifteen. Backfilling ninety intervals must not send ninety notifications.

**Every alert names its runbook.** The message should carry the DAG, the interval, the failing task, the error class, a direct link to the log, and a link to a short document that says what this alert means and the first three things to check. Writing the runbook when you create the alert costs ten minutes; not writing it costs an hour on every occurrence, forever.

**Prune ruthlessly.** Review firing alerts monthly. Any alert whose usual resolution is "no action" is either mis-thresholded or should be a dashboard. Alert fatigue is not a personal failing; it is an inevitable consequence of a noisy alert set, and the fix is deleting alerts.

Underneath the routing, define what you are actually promising. Pick an SLO per dataset — availability ("29 of 30 daily runs publish successfully") and timeliness ("published by 07:00 on 95% of business days") — and measure it from the run-metadata table. The point is not ceremony: it converts arguments about whether the pipeline is "reliable" into a number, and it tells you when to stop adding features and go fix reliability instead.

## Automating the response

Once a signal is reliable, the next step is to let the pipeline act on it before a human does. Three tiers, in increasing order of ambition.

**Self-healing on transient failure.** Already partly built: retries with exponential backoff, timeouts so a hung task fails rather than hangs, and sensors with limits. Add automatic recovery of a missed interval — a scheduled reconciliation DAG that queries the run-metadata table for intervals with no successful run in the last week and triggers them — so that a short outage does not leave a permanent gap waiting for someone to notice.

**Automated scaling.** Both of your major resources can be scaled from a signal rather than by hand.

*Warehouse compute.* Managed warehouses expose a size or capacity setting and, usually, an auto-suspend and auto-resume policy. The engineering pattern is to match capacity to the shape of the workload: size up for the heavy nightly build, size down for the light hourly refreshes, and suspend when nothing is running. Because a warehouse's cost is usually roughly linear in size while a well-parallelised query's runtime is roughly inversely proportional, doubling the size of a large batch job is often close to cost-neutral and finishes in half the time — while doubling it for a workload that cannot parallelise simply doubles the bill. Test rather than assume, then encode the winning configuration as a task in the DAG:

```python
    resize_up   = SQLExecuteQueryOperator(
        task_id="resize_up",
        sql="ALTER WAREHOUSE transform_wh SET WAREHOUSE_SIZE = 'LARGE'")
    resize_down = SQLExecuteQueryOperator(
        task_id="resize_down",
        sql="ALTER WAREHOUSE transform_wh SET WAREHOUSE_SIZE = 'SMALL'",
        trigger_rule="all_done")            # runs even if the build failed

    resize_up >> dbt_build_marts >> resize_down
```

The `all_done` trigger rule on the way back down is not a detail — without it, a failed build leaves an oversized warehouse running until someone notices the invoice.

*Worker capacity.* Where the orchestrator's workers autoscale, the signal to scale on is **queue time**, not CPU. Tasks waiting in a queue while workers sit idle means a concurrency limit is the constraint; tasks waiting while workers are busy means you need more workers. Scale up on sustained queue depth, scale down after a sustained idle period, and set a maximum so a runaway backfill cannot scale to the moon.

**Automated guardrails.** Cost budgets that alert or block at a threshold, a maximum-bytes-scanned setting on ad-hoc queries, and a scheduled job that suspends idle compute. These are cheap, and they turn a bad Tuesday into a small one.

Two cautions. Automation that is not observable is worse than none — every automatic action must log what it did and why, or your next incident includes a mystery. And every automated response needs a cap: a retry limit, a scaling ceiling, a budget stop. Unbounded automation converts a small failure into a large bill.

## Debugging a run, methodically

When something does fail, work the same loop every time. Improvising is what makes a twenty-minute fix take three hours.

**1. Establish the blast radius.** Which DAG, which task, which intervals, and is it still failing or was it a single blip? Check whether it is one interval or every interval since a deployment; the answer immediately separates "bad data day" from "someone shipped a bug".

**2. Classify the failure.** Read the error, not the summary. Most fall into a handful of classes, and the class tells you where to look next: *connection or auth* (the source or a credential), *timeout* (volume, contention, or a hung dependency), *out of memory* (a task pulling too much into one process), *permission denied* (a change in the environment), *data-shape error* such as a key or type failure (the source changed), *validation failure* (the previous lesson's loop, not this one's).

**3. Read the right log.** Go to the failed attempt of the failed task — not the DAG's summary, and not attempt 1 when attempt 3 is the interesting one. Note the timestamp of the last successful step before the error; that is where the story ends.

**4. Reproduce narrowly.** Re-run just that task for just that interval, in isolation:

```bash
airflow tasks test orders_daily extract_orders_api 2024-03-05
```

This runs the real code with the real context and writes no run state, so you can iterate. If it fails here, you have a code or data problem you can debug locally. If it *succeeds* here but fails in the scheduled run, the difference is environmental — concurrency, permissions, resources, or a race with another task — and that is where to look next.

**5. Trace upstream.** Use the audit columns and the run-metadata table to locate the input that caused it. `_source_file` and `_run_id` on the offending rows convert "the transform broke" into "the transform broke on the file the 03:00 partner drop delivered".

**6. Fix, then reprocess.** Repair the cause, clear the failed task and its downstream dependents, and let the affected intervals rebuild. Again this is idempotency paying for itself.

**7. Leave a trace.** Note what failed, why, and what fixed it, and add the check or the alert that would have caught it sooner.

For diagnosing *slowness* rather than failure, the run-metadata table is the right instrument. Compare each task's duration against its own recent median to find what changed, then look at the run's task timeline: the **critical path** is the longest chain of dependent tasks, and it is the only thing whose improvement shortens the run. A task that is slow but off the critical path is a cost problem, not a latency one — worth fixing, but not first.

## Making the pipeline faster and steadier

Optimisation follows measurement, in that order. Once the metadata table tells you where the time goes, these are the levers, roughly in order of payoff.

**Shorten the critical path.** Split a long serial task into independent tasks that can run in parallel, or move work off the critical path entirely. The classic win is a chain of ten sequential model builds that actually has only three real dependencies.

**Raise real parallelism.** Fan out per source, per table, or per partition rather than looping inside one task. Check that pool sizes and `max_active_tasks` are not silently serialising a fan-out you thought was parallel — a five-way fan-out through a two-slot pool is not five-way.

**Right-size task granularity.** Too coarse and a failure re-runs an hour of work; too fine and scheduling overhead dominates. Aim for tasks whose runtime is comfortably longer than the seconds of overhead each one carries, and whose failure you would be content to retry whole.

**Stop waiting expensively.** Sensors in `reschedule` mode, or deferrable operators where they exist, free the worker slot while waiting. Poking sensors are a common and invisible cause of a saturated cluster.

**Do less work.** Incremental instead of full rebuild, filter before joining, project only the columns needed, and make sure partition pruning is actually happening. In a warehouse-centred pipeline this dominates everything else on the list.

**Tune the retry policy.** More retries improve reliability up to the point where they merely delay the alert. Three attempts with exponential backoff is a good default; a task that regularly needs all three has a problem retries are hiding.

**Reduce coupling.** A DAG that fails wholesale because one of eight sources is down is less reliable than one where the seven healthy sources still publish. Trigger rules, per-source tasks, and partial publication buy availability — where the data model permits it.

Re-measure after every change, and record the before and after in the metadata table. Optimisation you did not measure is a story, not a result.

## Practice

Instrument the pipeline you have been building, then break it deliberately and practise the loop.

1. **Build the metadata table.** Create `ops.pipeline_runs` and write a callback or wrapper that records one row per task attempt with state, timings, attempt number, row counts, and an error class. Run the DAG several times, including at least one failure and one retry, and confirm the table reflects reality.

2. **Answer five questions in SQL.** From that table alone, write queries for: the slowest task by median duration over the last 30 days; the task with the highest retry rate; the trend in total run duration week over week; the number of intervals with no successful run; and the longest gap between a run's scheduled start and its actual start.

3. **Add structured logging.** Convert your task logs to JSON with run id, interval, task, attempt, and row counts on every line. Then, given only a run id, retrieve every log line for that run and describe how long it took compared with reading the UI logs by hand.

4. **Detect a run that never started.** Write an independent heartbeat check that asserts a successful run exists for each expected interval, and alert if one is missing. Disable your DAG's schedule for two intervals and confirm the check fires. Explain why this cannot be implemented inside the DAG it monitors.

5. **Set and measure an SLO.** Define a timeliness SLO for one published dataset in terms of data lag, add a task SLA that fires before the deadline, and compute your last 30 days of compliance from the metadata table. State whether you met it and what you would change if you did not.

6. **Route three alerts.** Implement one page-level, one ticket-level, and one dashboard-level signal. For each, write the alert message with DAG, interval, task, error class, and log link, and a five-line runbook. Then trigger each one and time how long it takes you to reach the root cause using only what the alert told you.

7. **Automate a scaling response.** Add resize-up and resize-down tasks around your heaviest build, with the resize-down on an `all_done` trigger rule. Run the build at two capacities, record duration and cost for each, and state whether the larger size was worth it. Then force a failure mid-build and confirm the capacity still came back down.

8. **Automate a recovery.** Write a reconciliation DAG that finds intervals with no successful run in the last seven days and triggers them, with a cap on how many it will trigger at once. Create a gap by disabling the schedule, then show the recovery DAG closing it and logging what it did.

9. **Work three failures end to end.** Inject a credential error, a timeout on an oversized query, and a source schema change. For each, work steps 1 through 7 of the debugging loop and record: time to detect, time to classify, the log line that gave it away, the fix, the intervals reprocessed, and the alert or check you added afterwards.

10. **Find and shorten the critical path.** From the metadata table, reconstruct one run's task timeline and identify the critical path. Make one structural change — a split, a fan-out, a sensor-mode change, or an incremental conversion — and re-measure. Report the before and after durations and whether the critical path moved to a different chain.
