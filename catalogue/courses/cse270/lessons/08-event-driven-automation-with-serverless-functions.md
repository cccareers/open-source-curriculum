---
lesson_id: cse270-08
course_id: cse270
pathway: cloud-support-engineer
title: Event-Driven Automation with Serverless Functions
order: 8
kind: lesson
competency_ids:
  - D4-S1-C04
objectives:
  - Trigger operational work from events and schedules using serverless functions
---

## Removing the last human trigger

Your pipeline still waits for something a person did. Somebody opened a pull request, somebody merged it, and the pipeline responded. That is the right model for changing code, and it is the wrong model for operational work that has nothing to do with a commit.

Consider the work that actually fills an operations week. A volume is created without an owner tag and should be flagged within the hour. Development instances should stop at seven in the evening and start at eight in the morning, because they cost the same overnight as they do at noon and nobody is using them. A file lands in a storage bucket and something has to validate it. A queue of remediation requests builds up and needs draining. None of these have a commit to hang off, and all of them are currently somebody remembering.

A **serverless function** is a piece of code the provider runs for you in response to an event. You supply a handler and a runtime; the platform supplies the machine, starts it when an event arrives, runs your handler, and takes the machine away afterwards. You do not patch it, size it for peak, or pay for it while it sits idle.

That last property is why this lesson carries the cost angle. A virtual machine that exists to run a five-second job every hour is billed for all 3,595 idle seconds. A function is billed for the five, at a granularity of milliseconds, and costs literally nothing between invocations. **Scale to zero** is the single largest cost lever in operational automation, and it is available precisely because the work is bursty and short.

## The shape of a function

Every provider's function looks like this, whatever they call it:

```python
import json
import logging
import os

log = logging.getLogger()
log.setLevel(os.environ.get("LOG_LEVEL", "INFO"))


def handler(event, context):
    """Entry point. `event` is the trigger payload; `context` is runtime metadata."""
    log.info("invoked: request_id=%s event_keys=%s",
             getattr(context, "request_id", "unknown"), sorted(event.keys()))
    ...
    return {"status": "ok", "processed": 1}
```

Three things are supplied to you and three are not.

You are given the **event**: a dictionary describing what happened, whose shape depends entirely on the trigger. You are given a **context** object with the invocation's request id, the time remaining before timeout, and the memory allocation. And you are given a **runtime** with your language and any dependencies you packaged with the function.

You are not given a persistent filesystem, a guarantee that the next invocation runs on the same machine, or unbounded time. Everything a function needs to remember between invocations lives somewhere else — a storage object, a table, a tag on a resource.

The handler returns quickly and it returns a value the platform can record. Beyond that it is ordinary Python, and everything from lesson 04 still applies: read fields with `.get()`, paginate every list, use timezone-aware UTC, never swallow an exception silently.

## Triggers

Four trigger types cover nearly all operations work.

**Schedule.** A cron expression fires the function on a timetable. This is the direct replacement for a crontab on a machine somebody has to maintain, and it is the trigger for anything periodic — nightly pruning, the evening scale-down, an hourly compliance sweep. Write the expression in UTC and say so in a comment; a schedule that drifts by an hour twice a year because it was written in local time is a genuinely annoying bug to find.

**Resource event.** The provider emits an event when something in the account changes — an instance launched, a storage object created, a configuration rule evaluated as non-compliant. The function receives a description of the change and can act within seconds. This is what makes "flagged within the hour" into "flagged immediately".

**Message.** A queue or topic delivers a message; the function processes it. This decouples the thing asking for work from the thing doing it, and lets a burst of requests drain at whatever rate the function can manage.

**HTTP request.** The function is reachable at a URL. Useful for a webhook from another system; be careful, because a public URL is a public URL and it needs authentication.

A schedule trigger in the generic YAML your pipeline already uses looks like this — note the shape is the same as the pipeline triggers you have seen:

```yaml
function:
  name: stop-dev-instances
  runtime: python3.12
  handler: main.handler
  timeout_seconds: 300
  memory_mb: 512
  environment:
    TARGET_TAG: "env=dev"
    DRY_RUN: "true"
  triggers:
    - schedule: "cron(0 19 * * ? *)"   # 19:00 UTC, every day (six-field AWS-style syntax; standard five-field cron is "0 19 * * *")
```

## Developing against an event you cannot see

The first practical obstacle is that you do not know what is in `event`. Do not guess from documentation alone — the examples in provider docs are frequently abridged.

Deploy a handler whose entire body logs the event and returns, trigger it once for real, and read the log:

```python
def handler(event, context):
    log.info("event: %s", json.dumps(event, default=str))
    return {"status": "ok"}
```

Save that output to a file in your repository. It becomes your local fixture, and now the function is testable on your laptop without deploying anything:

```python
if __name__ == "__main__":
    with open("fixtures/instance-launched.json") as fh:
        print(handler(json.load(fh), None))
```

Keep the handler thin and put the logic in a plain function that takes ordinary arguments. The handler's job is to unpack the event and call it:

```python
def handler(event, context):
    instance_id = event["detail"]["instance-id"]
    return audit_instance(instance_id, dry_run=os.environ.get("DRY_RUN") == "true")
```

Now `audit_instance` is a normal function you can run and reason about, and the untestable part is three lines.

## At-least-once delivery makes idempotency mandatory

Here is the property that catches everyone. Event platforms guarantee **at-least-once** delivery, not exactly-once. Your function will occasionally be invoked twice for the same event: the platform did not receive your acknowledgement, a retry fired, an upstream service emitted a duplicate.

You have already met the fix. Check state and act on the difference:

```python
def audit_instance(instance_id: str, dry_run: bool) -> dict:
    instance = describe_instance(instance_id)
    if instance.get("tags", {}).get("owner"):
        log.info("instance %s already has an owner tag; nothing to do", instance_id)
        return {"status": "ok", "changed": 0}
    if dry_run:
        log.info("DRY RUN: would tag %s with review=pending", instance_id)
        return {"status": "ok", "changed": 0}
    set_tag(instance_id, "review", "pending")
    return {"status": "ok", "changed": 1}
```

In lesson 02 idempotency was good practice. Here it is a correctness requirement, because the duplicate invocation is not hypothetical — it is in the platform's own contract. If your function sends a message, opens a ticket, or charges something, record the event id somewhere durable and skip an id you have already handled.

Two related behaviours to configure rather than discover. **Retries**: a failed invocation is usually retried automatically, so a function that fails permanently on a bad input will be retried and fail again on a schedule. **Dead-letter destinations**: after the retry budget is exhausted, the event goes to a queue you can inspect instead of vanishing. Configure one. Without it, a poison event is invisible — it fails forever and the only symptom is work quietly not happening.

## Timeouts, memory, and cost

Three settings control both whether your function works and what it costs.

**Timeout** is the wall-clock limit per invocation. Set it to a little more than the slowest realistic run, not to the maximum. A too-generous timeout means a hung network call burns the full budget before failing, and it delays the retry. Use the context object's remaining-time value to bail out cleanly before the platform kills you mid-write:

```python
# Method name varies by provider; on AWS Lambda it is context.get_remaining_time_in_millis().
if context.remaining_time_ms() < 5000:
    log.warning("running out of time; stopping after %d of %d", done, total)
    return {"status": "partial", "processed": done}
```

**Memory** is the setting people get wrong in the expensive direction. On most platforms CPU is allocated in proportion to memory, so a function that is compute-bound often runs *cheaper* at a higher memory setting because it finishes proportionally faster. Cost is memory multiplied by duration; if doubling the memory more than halves the duration, you pay less. Measure two or three settings against a real workload rather than assuming the smallest is cheapest.

**Concurrency** is how many copies run at once. The platform scales this automatically with the arrival rate, and that autoscaling is the whole point — a hundred simultaneous events get a hundred workers with nothing to provision. But the copies are real callers of your cloud API, and a hundred of them will hit a rate limit and may exhaust a downstream connection pool. Set a concurrency ceiling for any function that talks to something with a fixed capacity, and set a floor of provisioned instances only if cold starts genuinely hurt — a floor costs money continuously and undoes scale to zero.

A **cold start** is the extra latency when the platform has to create a new execution environment. It is measured in hundreds of milliseconds to a couple of seconds, it happens to the first invocation and to each new concurrent copy, and for operations work it is almost always irrelevant. Do not pay to remove it for a nightly cleanup job.

## Fitting demand and cost

Serverless is one of two answers to matching capacity to demand, and knowing which to reach for is part of this competency.

Use a **function** when the work is short, bursty, event-shaped, and idle most of the time. The cost model rewards exactly that pattern: nothing between invocations, milliseconds when there is work.

Use **autoscaling on a fleet** when the work is a continuously running service whose load rises and falls — a scaling policy adds instances when a utilisation metric crosses a threshold and removes them when it falls back. The function does not replace this; it complements it. The most common operational use of a scheduled function is precisely to drive scaling that a reactive policy cannot: reducing a non-production fleet's minimum size to zero at seven in the evening and restoring it at eight in the morning, because no utilisation metric can predict "the team went home".

And use **neither** when the job is long-running or steady. A function is a poor fit for anything that must run for an hour, hold a large working set in memory, or maintain a persistent connection. Reaching for a function there means fighting the timeout, and the right answer is a scheduled container or a small always-on worker.

The judgement being taught is a cost one: pay for capacity in the shape the demand actually has. A fleet sized for peak and running at peak all night is the default failure, and both a scheduled scale-down and a scale-to-zero function are ways to stop paying for time nobody used.

## Identity, configuration, and output

A function has **its own identity**, separate from yours and from the pipeline's. Grant it exactly the permissions its handler needs — if it tags instances, it needs describe and tag on instances and nothing else. This is the strongest permission boundary you will get for free anywhere in this course, and the temptation to attach a broad administrative role to get past a permission error is exactly the wrong move: read the denial, find the missing action, add that one.

Configuration comes from **environment variables** set on the function: the target tag, the dry-run flag, the retention threshold. Anything you would have passed as a command-line argument to a script becomes an environment variable here, because there is no command line. Keep the dry-run switch — a function you can deploy in observe-only mode and watch for a week before letting it act is how you build confidence in unattended automation.

Secrets go in the provider's secret store and are fetched at run time or injected by the platform, never baked into the deployment package.

Output is **whatever you log**, and that is all. Nobody is watching an invocation. Log the parameters and the event id on entry, one line per resource acted on, and a summary with counts on exit — the same discipline as every previous lesson, now load-bearing, because these lines are the only record that the run happened at all. Return a small structured value too; the platform records it, and it makes a failed invocation legible in the console. What you do with those logs afterwards — dashboards, alerts, on-call routing — is the subject of a different course, and it starts with the logs being worth reading.

## Practice

Use the account you used in cse203 and the tagging logic from your lesson 05 script. Deploy through your provider's console or CLI; a pipeline-driven deployment is the next project, not this one.

1. **Deploy a function that does nothing.** A handler that logs the event as JSON and returns a status. Give it a five-minute timeout and 512 MB. Invoke it once manually and find the log output and the request id.

2. **Add a schedule.** Attach a cron trigger that fires every five minutes, in UTC. Wait for three invocations and confirm each has a distinct request id. Then capture one real event payload from the log into `fixtures/` and add an `if __name__` block that runs your handler against it locally.

3. **Do real work, in observe mode.** Move your lesson 05 policy check into a plain function called by the handler, reading its configuration from environment variables including `DRY_RUN`. Deploy with `DRY_RUN=true` and confirm from the logs that it evaluates real resources and changes nothing.

4. **Scope the permissions down.** Start from whatever role you deployed with, remove permissions until the function fails, read the denial, and grant back exactly the actions named. Record the final permission list in your notes with one line per action explaining why it is needed.

5. **Let it act, and prove it is safe twice.** Set `DRY_RUN=false`. Invoke it, then invoke it again immediately with the same input. The second invocation must report zero changes. If it does not, you are acting unconditionally — fix it before going further.

6. **Add an event trigger.** Configure a resource-change trigger — an instance launched, or an object created in a bucket — and have the function act on just the resource named in the event. Create one resource and watch the function fire without a schedule.

7. **Break it deliberately.** Send an event whose expected field is missing. Confirm the invocation fails, observe the automatic retry, and then configure a dedicated dead-letter queue for this exercise — not one shared with other workloads — and confirm the failed event lands there. Write two sentences on what would have happened without one.

8. **Tune for cost.** Run the same workload at two memory settings and record duration and invocation cost for each. Then write a short paragraph deciding whether this workload belongs in a function at all, or whether a scheduled change to a fleet's minimum size would fit the demand better — and say what it is about *this* workload's shape that decides it.

9. **Clean up.** Remove the five-minute schedule from step 2 (or slow it to the cadence you actually need), delete any test resources you created in step 6, and empty the dedicated dead-letter queue from step 7. A practice schedule left firing every five minutes is roughly 8,600 invocations a month, each of which calls your cloud API — small in cost, but noise in every log and audit trail you will read later.

## Check your understanding

1. Why is idempotency a correctness requirement for a function rather than good practice? *(The asynchronous, queue, and event-bus triggers used for automation deliver at least once, so duplicate invocations are part of the contract. Exact retry behaviour varies by platform and trigger type, which is why you design for duplicates rather than rely on the details.)*
2. A compute-bound function runs 800 ms at 512 MB and 300 ms at 1,024 MB. Which is cheaper? *(1,024 MB: 0.3 GB-s vs 0.4 GB-s, before per-request charges.)*
3. What happens to a poison event with no dead-letter destination? *(On an asynchronous trigger it is retried until the platform's retry budget is exhausted and then discarded — work silently does not happen. Other trigger types differ: a synchronous caller simply gets the error, and a stream source may keep retrying and hold up the events behind it.)*
