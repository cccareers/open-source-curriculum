---
lesson_id: de210-08
course_id: de210
pathway: data-engineer
title: Cloud-Native and Event-Driven Pipelines
order: 8
kind: lesson
competency_ids:
  - D6-S1-C02
  - D6-S2-C03
objectives:
  - Trigger pipeline work from cloud events instead of a fixed schedule
---

## When the clock is the wrong trigger

Every pipeline you have built so far starts because a time arrived. That is the right design when the source produces data on its own schedule and you can predict when it is ready. It is the wrong design in three common situations.

**The data arrives unpredictably.** A partner uploads a file somewhere between 04:00 and 09:00. A scheduled pipeline either starts early and waits — burning a sensor slot for hours, and failing on the days the file is late — or starts late and wastes the hours between arrival and processing.

**The data arrives frequently and in pieces.** A hundred small files land through the day. A daily schedule makes every consumer wait until tomorrow; a five-minute schedule runs two hundred and eighty-eight times a day, mostly to discover there is nothing to do.

**The trigger is an action, not a time.** A user requests an export. An upstream team publishes a corrected dataset. A model finishes training. There is no clock reading that corresponds to any of these.

The alternative is to let the *event* start the work: an object is created in storage, a message lands on a queue, a webhook fires, an upstream job announces completion. The pipeline reacts.

One boundary before going further. This lesson is about **event-triggered batch** work: a discrete event causes a batch run to start, and that run processes a bounded set of data and ends. It is not about continuous stream processing — a job that runs forever consuming a topic, with windowing and state — which you met in the previous course. The distinction is the unit of work: a batch run that happens to be started by an event is still a batch run, with the same idempotency, validation, and observability requirements as its scheduled cousin.

The infrastructure below is also assumed to exist. Provisioning cloud resources, writing infrastructure-as-code, and managing accounts and networking belong to a later course; here you are designing and wiring pipeline behaviour on top of resources that are already there.

## The event-driven vocabulary, vendor-neutrally

Four building blocks appear on every cloud platform under different names.

**An event source** emits a notification when something happens. Object storage emitting an "object created" event is the workhorse for data engineering; others include database change feeds, application webhooks, and job-completion notifications.

**An event router** receives events and decides where they go: filtering by prefix or suffix, fanning one event out to several consumers, and transforming the payload. Routing rules are what stop every consumer from receiving every event.

**A queue or topic** buffers between producer and consumer. This is the component that makes the architecture robust: it absorbs bursts, retries delivery, holds messages while a consumer is down, and hands failures to a dead-letter queue after a set number of attempts. An event-driven pipeline without a buffer is a pipeline that loses events whenever the consumer hiccups.

**A compute target** does something with the event: a serverless function for small glue work, a container job for real processing, or an API call that triggers an orchestrated DAG.

| Role | AWS | Google Cloud | Azure |
| --- | --- | --- | --- |
| Object storage events | S3 Event Notifications | Cloud Storage notifications | Blob Storage events |
| Event router | EventBridge | Eventarc | Event Grid |
| Queue | SQS | Pub/Sub | Service Bus / Storage Queues |
| Serverless function | Lambda | Cloud Run functions | Azure Functions |
| Container job | ECS / Fargate, Batch | Cloud Run jobs | Container Apps jobs |
| Managed scheduler | EventBridge Scheduler | Cloud Scheduler | Logic Apps / Scheduler |

The names differ; the shapes do not. Learn the shape, and moving between providers is a matter of documentation rather than re-learning.

## The delivery semantics you must design for

Event systems make weaker promises than a scheduler, and the weaknesses are load-bearing. Design for all four of these or your pipeline will be wrong intermittently, which is the hardest kind of wrong to debug.

**At-least-once delivery.** Nearly every managed queue guarantees a message is delivered *at least* once, not exactly once. Duplicates are normal — a network timeout after the consumer succeeded, a visibility timeout that expired mid-processing, a router retry. The consumer must therefore be idempotent, which by now should sound familiar: the same event processed twice must leave the same state as processing it once. In practice this means keying the work by something in the event (the object key, an event id) and either replacing that key's output or checking a dedupe table before doing the work.

```python
def already_processed(event_id: str) -> bool:
    return db.execute(
        "INSERT INTO ops.processed_events (event_id, seen_at) "
        "VALUES (%s, now()) ON CONFLICT (event_id) DO NOTHING",
        (event_id,),
    ).rowcount == 0
```

**No ordering guarantee.** Unless you have specifically chosen an ordered queue, events can arrive out of order, and two events for the same entity can be processed concurrently by two consumers. If ordering matters, either use an ordering key so related events serialise, or make the work order-independent — for example, by writing the *latest* version by timestamp rather than the last one to arrive.

**Poison messages.** An event whose processing always fails will be retried until the queue gives up, at which point it should land in a **dead-letter queue**. A DLQ that nobody monitors is a silent data-loss channel; alert on its depth, and treat a non-empty DLQ as a real incident with the same triage loop as any other failure.

**Burstiness.** Events do not arrive evenly. A partner uploading four thousand files in ten minutes will invoke your consumer four thousand times, which will happily overwhelm a warehouse, a rate-limited API, or an orchestrator. Two defences: cap the consumer's concurrency, and **coalesce** — buffer events over a short window and start one run for the batch rather than one run per file. Coalescing is usually the right answer for data work, because a warehouse would rather do one merge of four thousand files than four thousand merges.

## Serverless functions: small, stateless glue

A serverless function runs your code in response to an event without you managing a server. Its constraints are the whole story: a hard execution timeout measured in minutes, a memory ceiling, no local state that survives an invocation, a limited deployment package, and a cold start on the first request after idleness.

Those constraints make functions excellent at some jobs and terrible at others.

**Good uses:** validating and filtering an incoming event; writing a record of the arrival; deciding whether the arrival completes a batch; calling an orchestrator's API to trigger a DAG; performing a tiny transformation on a small object; sending a notification. In short, glue — decide and delegate.

**Bad uses:** heavy transformations, anything that must run for an hour, anything needing a large dependency set such as a full data-science stack, and anything that would be easier to reason about with a proper task graph. A function that has grown retries, branching, and multiple steps is an orchestrator that someone wrote by accident.

The idiomatic data-engineering pattern is therefore *function decides, orchestrator does*:

```python
def handler(event, context):
    """Triggered by a queue message describing a new object in the lake."""
    for record in event["Records"]:
        body = json.loads(record["body"])
        key = body["detail"]["object"]["key"]          # incoming/orders/2024-03-05/part-3.csv

        if not key.endswith("/_SUCCESS"):              # ignore data files
            continue
        if already_processed(record["messageId"]):
            continue

        prefix = key.rsplit("/", 1)[0]
        resp = requests.post(
            f"{AIRFLOW_URL}/api/v1/dags/orders_event_ingest/dagRuns",
            json={
                "dag_run_id": f"evt__{prefix.replace('/', '_')}",
                "conf": {"prefix": prefix, "source": "partner_x"},
            },
            auth=airflow_auth(),
            timeout=10,
        )
        if resp.status_code == 409:      # run id already exists: a duplicate delivery, already triggered
            continue
        resp.raise_for_status()
```

Two details carry most of the reliability. The function reacts to the `_SUCCESS` marker rather than to each data file, so it fires once per complete delivery instead of once per part. And the DAG run id is **derived from the event** rather than random — so if the same event is delivered twice, the second request collides with an existing run id and is rejected, which turns at-least-once delivery into exactly-once triggering for free. Notice that the function treats that rejection (HTTP 409 Conflict) as success; if it raised instead, the duplicate message would be retried until it landed in the dead-letter queue.

One ordering trap in this sketch is worth seeing clearly. `already_processed` records the event *before* the DAG is triggered. If the trigger call then fails, the message is retried, but the retry finds the event already recorded and skips it — the delivery is lost with no error. Either record the event only after the trigger succeeds, or, as here, let the derived run id carry the deduplication and use the processed-events table for the sweep described later in this lesson rather than as a gate in front of the trigger.

On the DAG side, the payload arrives in `params` or `dag_run.conf`, and the DAG is defined with `schedule=None` because its trigger is external:

```python
@dag(dag_id="orders_event_ingest", schedule=None, start_date=datetime(2024, 1, 1),
     catchup=False, params={"prefix": "", "source": ""})
def orders_event_ingest():

    @task
    def load_prefix(params=None) -> int:
        return warehouse.copy_from(params["prefix"])
```

Everything you learned about idempotency, validation gates, and instrumentation applies unchanged to this DAG. An event-triggered run is not a lesser citizen; it needs its checks and its metadata row exactly as much.

![Object storage event flowing through a router and a queue to a serverless function, which deduplicates and triggers an orchestrated batch run, with a dead-letter queue on the side](./img/event-triggered-batch-flow.png)

## Containerised tasks: the same code everywhere

Serverless handles the glue. The processing itself increasingly runs as a **container**: your code plus its exact dependencies in an immutable image, executed by a container service or by a task in your DAG.

The reasons are practical rather than fashionable. **Dependency isolation** — a task needing a specific library version no longer forces that version onto every other pipeline sharing the orchestrator's environment. **Reproducibility** — the image that runs in production is byte-identical to the one you ran locally, which removes the largest category of "works on my machine". **Portability** — the same image runs on your laptop, in CI, in a container job service, and from an orchestrator task. **Resource isolation** — memory and CPU are requested per task, so one greedy job cannot starve the rest.

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY src/ ./src/
ENTRYPOINT ["python", "-m", "src.ingest"]
```

```python
    run_ingest = DockerOperator(
        task_id="run_ingest",
        image="registry.example.com/orders-ingest:1.4.2",
        command=[
            "--prefix", "{{ params.prefix }}",
            "--interval-start", "{{ data_interval_start }}",
        ],
        environment={"WAREHOUSE_URI": "{{ conn.warehouse.get_uri() }}"},
        auto_remove=True,
    )
```

Four habits make containerised tasks behave. **Pin the tag** to an immutable version — `:latest` means you cannot say what ran last night, and cannot reproduce it. **Pass configuration as arguments and environment**, never baked into the image, so the same image serves dev and prod. **Inject secrets at run time** from the orchestrator's connections or a secret manager; a credential in an image layer is a credential you have published. And **keep the container stateless**: read inputs from object storage or the warehouse and write outputs back, because the filesystem disappears when the task ends.

The same image is what a managed container job service runs when an event triggers it directly, without an orchestrator in the middle — appropriate for a single self-contained step, and not appropriate the moment there are dependencies between steps, at which point you are back to needing a DAG.

## Managed schedulers, and choosing between the four triggers

Cloud platforms also offer a **managed scheduler**: cron as a service, which fires an HTTP request, a queue message, or a job on a schedule, with no server to keep alive. It is a good fit for triggering a single job, for firing the daily "kick off the DAG" call from outside the orchestrator, and for lightweight housekeeping. It is still a trigger, not an orchestrator — it gives you no dependency graph, no per-task retries, and no run history beyond its own invocation log.

So you now have four ways to start work, and choosing well is the actual skill:

- **Orchestrator schedule** — the default for anything with dependencies, a data interval, and a need for backfill. Nearly all recurring pipeline work belongs here.
- **Event trigger** — when arrival time is unpredictable, when latency matters, or when the trigger is genuinely an action rather than a time.
- **Managed scheduler** — a single self-contained job with no dependents, or the external clock that pokes an orchestrator.
- **Manual trigger with parameters** — reprocessing, one-off exports, operator-initiated work.

Mixed designs are normal and usually best: an event-triggered DAG that lands and validates arrivals as they come, plus a scheduled DAG that builds marts once a day from whatever landed, plus a scheduled reconciliation DAG that catches anything the events missed. That last one deserves emphasis — **always keep a scheduled sweep behind an event-driven ingest**. Events get lost, filters get mis-configured, and a notification that never fires produces no error anywhere. A cheap daily job that lists the source and processes anything with no corresponding processed-event record turns a silent gap into a self-healing one.

## Cost, latency, and the honest trade-offs

Event-driven designs are not free improvements.

*In their favour:* latency drops from "the next scheduled run" to seconds; you pay only for invocations rather than for polling; and the pipeline naturally scales with the load it is given.

*Against:* the flow is harder to see — the path from event to work lives across a router, a queue, and a function rather than in one DAG file; local reproduction is harder; failures fragment across several services' logs; per-event pricing can exceed the cost of one batch job when volume is high; and the debugging story requires you to correlate a request id across three systems. Diagnosing "the file arrived but nothing happened" means checking the notification configuration, the router rule, the queue, the DLQ, the function log, and the orchestrator — a materially longer loop than reading one task's log.

The practical mitigations are the ones already introduced: coalesce events into batches so that per-event cost and per-event debugging both shrink; propagate one correlation id from the event through every hop and into your run-metadata table; and keep the actual work inside orchestrated DAGs where you already have history, retries, and visibility. Use the event machinery to decide *when* to run, not to reimplement *how* to run.

## Practice

Use whichever cloud account you have access to; the shapes translate. Where you cannot use a cloud service, a local object-storage emulator and a local queue will exercise the same design.

1. **Wire an object-storage trigger.** Configure a notification on a bucket prefix so that creating a `_SUCCESS` marker emits an event, routed to a queue. Drop a complete delivery and confirm exactly one message appears; drop three data files without the marker and confirm no message appears. Write down the filter you used.

2. **Trigger a DAG from a function.** Write a serverless function that consumes the queue, derives a run id from the event, and calls your orchestrator's API to start a parameterised DAG run. Confirm that the DAG receives the prefix in its configuration and loads the right files.

3. **Prove duplicate safety.** Re-deliver the same event three times, by replaying the message or re-creating the marker. Show that only one DAG run exists and that the target data is identical to a single-delivery run. Then remove the derived run id, repeat, and record exactly what went wrong.

4. **Handle a poison event.** Send an event referencing an object that does not exist. Confirm the function retries and the message reaches a dead-letter queue after the configured attempts. Add an alert on DLQ depth, then write a five-line runbook for what an on-call engineer should do when it fires.

5. **Coalesce a burst.** Drop forty files in one minute. First, run with one invocation per file and record the number of runs, total duration, and warehouse cost. Then implement coalescing — a debounce window, or a scheduled drain of the queue that batches everything waiting — and record the same three numbers. State which design you would ship and why.

6. **Containerise a task.** Package one of your ingestion tasks as an image with pinned dependencies and a version tag, taking the interval and prefix as arguments and reading secrets from the environment. Run it locally, then run the identical image tag from your DAG, and confirm the outputs match. Change one dependency version, rebuild as a new tag, and describe how you would roll back.

7. **Compare the four triggers.** For each of four pieces of work in your pipeline — daily mart build, partner file ingest, an on-demand export, and a nightly cleanup — choose one of the four trigger types, and justify the choice in two sentences naming the deciding property. Implement whichever one you do not already have.

8. **Add the safety net.** Write a scheduled sweep DAG that lists the source location, compares it against your processed-events table, and processes anything missing. Break the event path deliberately — disable the notification for a day — and demonstrate the sweep closing the gap without duplicating anything the event path already handled.

9. **Trace one event end to end.** Attach a correlation id at the event router and carry it through the function, the DAG run configuration, and your run-metadata table. Then, given only a file name, produce the full history: when it arrived, which event id, which function invocation, which DAG run, which rows it produced. Time how long that took, and note which hop was hardest.
