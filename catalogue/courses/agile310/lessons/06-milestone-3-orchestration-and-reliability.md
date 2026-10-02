---
lesson_id: agile310-06
course_id: agile310
pathway: data-engineer
title: "Milestone 3: Orchestration and Reliability"
order: 6
kind: project
competency_ids:
  - D1-S1-C03
  - D6-S1-C02
objectives:
  - Orchestrate, monitor, and harden the pipeline so it survives a bad run
---

## Goal

Make your pipeline run itself. By the end of this milestone the ingestion job and the transformation from Milestones 1 and 2 are stages in one scheduled workflow that runs unattended, tells you when it breaks, recovers from a bad run without a human reconstructing state, and is measurably faster or cheaper than it was when you started.

This is the last build milestone, and it is the one that separates a demo from a system. A pipeline that only works when you are watching it is not finished; it is rehearsed.

Two competencies are assessed. Optimising data workflows for performance and reliability (D1-S1-C03) is the substance: the failure handling, the recovery path, and the measured improvement. Implementing serverless and containerised data workflows (D6-S1-C02) is the execution model: the stages run as functions or container tasks under a managed orchestrator, with the shapes you justified in lesson 3.

Budget seven hours. Roughly half of it belongs to deliberate failure testing, and that half is where the grade is.

## The scenario

You are going on leave for a week. The pipeline has to keep running, and when something goes wrong — a source is down for three hours, a schema changes, a run takes four times as long as usual — the person covering for you must be able to tell within minutes what failed, whether the data is trustworthy, and what to do. They have your repository and your runbook. They do not have you.

Everything in this brief follows from that scenario. If a requirement seems fussy, ask what your stand-in would need in order not to phone you.

## Requirements

Deliver seven things.

**1. One orchestrated workflow.** A managed orchestrator runs the pipeline as a directed graph of stages with real dependencies: ingest each source, then stage, then build the warehouse layer, then run the tests, then publish serving. Stages that do not depend on each other may run in parallel, and you should say which those are and why. Stages execute as serverless functions, container tasks, or warehouse jobs — the shapes from your lesson 3 table.

**2. A schedule with a run window parameter.** The workflow runs on a schedule, and the logical window flows into every stage from the orchestrator. Triggering the same schedule manually for an arbitrary past window must work identically to the scheduled run.

**3. Failure handling per stage.** Each stage has an explicit retry policy (bounded count, exponential backoff), a timeout, and a defined behaviour on final failure: which downstream stages are skipped, whether partial output is cleaned up, and whether the run is marked failed. A transient network error must not require human intervention; a schema change must not silently publish bad data.

**4. Monitoring and alerting.** At minimum: an alert when the workflow fails, an alert when it has not succeeded within its expected window (a missed run is invisible without this), and an alert when a data test fails. Alerts go somewhere a human actually reads. Each alert message names the run id, the stage, the window, and where to look next.

**5. Run observability.** A single place — a table, a view, or a dashboard over your run manifest — that answers, for the last thirty runs: did it succeed, how long did it take, how many rows moved, what did it cost or scan. This is what your stand-in opens first.

**6. A recovery path you have exercised.** A documented, tested procedure for reprocessing a window after a failure or a logic fix, that leaves the warehouse in a state indistinguishable from the window having succeeded the first time. Backfilling a range of consecutive windows must also work, with a stated limit on how many can run concurrently so a backfill cannot exhaust your budget.

**7. A measured optimisation.** Pick the slowest or most expensive stage, improve it, and record the same metric before and after with the same input. Duration, bytes scanned, or cost per run — any is acceptable, as long as it is the same one on both sides and the input is genuinely comparable. Explain the mechanism of the improvement, not just the number.

**Governance acceptance criteria**, carried forward from ds320 and graded here:

- Each stage runs as its own workload identity with the narrow grants from lesson 3. The orchestrator invokes stages; it does not hold data access itself.
- Logs and alert messages contain no secrets and no sensitive field values. Check this explicitly — error handlers that dump a full request or a failing row are the usual offender.
- The run history is retained for the remainder of the course and is the audit record for what ran, when, over which window, producing what.
- The pipeline has a stated freshness expectation ("warehouse data is never more than 26 hours old"), and the missed-run alert enforces it.

## Constraints

- **The orchestrator orchestrates; it does not transform.** No business logic in the workflow definition, no data passing through the orchestrator's own memory. Stages do work; the graph sequences them.
- **Every stage is idempotent.** This was true of Milestones 1 and 2 individually; it must remain true when the orchestrator retries a stage mid-workflow. A retry that runs a stage twice must be harmless.
- **No manual state.** Nothing that requires a human to reset a flag, delete a file, or remember which window was in flight. If recovery needs a person to remember something, it is not a recovery path.
- **Bounded everything.** Retry counts, timeouts, backfill concurrency, and a maximum runtime for the workflow. Cost bugs and reliability bugs are the same bug here.
- **One environment.** Promotion between environments stays out of scope, as established in lesson 3.
- **Streaming remains optional.** A batch workflow on a schedule fully satisfies this milestone. If you built streaming ingestion earlier, monitoring it counts, but do not add it now.
- **Alert fatigue counts against you.** An alert that fires on every run trains its reader to ignore it. Fewer, more meaningful alerts score better than more.

## Definition of done

You are finished when all of these are true and you can demonstrate each live.

- The workflow has completed successfully on its real schedule, unattended, at least three consecutive times, and the run history shows it.
- Triggering the workflow for an arbitrary past window produces correct output for that window and does not disturb any other window's data.
- Killing a stage mid-run leaves no partial data visible in the warehouse or serving layer, and the retry or re-run completes cleanly. You can demonstrate this by killing one.
- A forced transient failure (a source endpoint you break for one attempt) is absorbed by the retry policy without human intervention, and the run still succeeds.
- A forced hard failure (a bad credential, or a deliberately failing data test) stops the workflow before the serving layer is published, marks the run failed, and produces an alert you can show arriving.
- The missed-run alert fires when you disable the schedule past its window — demonstrate this, do not assert it.
- No alert message or log line contains a secret or a sensitive field value; you have grepped for the obvious cases.
- The run observability view shows the last thirty runs with status, duration, rows, and cost or bytes, and you can point at a slow run and say why it was slow.
- The backfill procedure runs a range of at least five consecutive windows, respects the concurrency limit, and produces results identical to those windows having run on schedule.
- Your optimisation has before-and-after numbers for the same metric on comparable input, and you can name the mechanism that produced the change.
- The runbook exists in the repository and contains: how to trigger a run, how to read the run history, the three or four failure modes you have actually seen with their diagnosis and fix, how to backfill, the freshness expectation, and who owns the pipeline.
- A peer can follow your runbook, without asking you anything, to diagnose a failure you caused deliberately and re-run the affected window successfully. Have someone actually do this.

## Hints

**Get the graph running with stub stages first.** Wire the orchestrator end to end with stages that do nothing but log and exit, prove the dependencies and the window parameter flow, then drop in the real work. Debugging orchestration and logic at the same time is the slowest possible order.

**Pass the window, never compute it.** The orchestrator owns the logical window and passes it down. A stage that derives its own date cannot be backfilled and will disagree with its siblings at midnight boundaries.

**Separate transient from permanent failures.** Retry network timeouts, rate limits, and transient service errors. Do not retry authentication failures, malformed input, or failing data tests — retrying those wastes budget and delays the alert. Have your stages exit with distinguishable codes so the orchestrator can tell the two apart.

**Fail before you publish, not after.** Put the data tests between the warehouse build and the serving publish. That single ordering choice is what makes "bad data never reaches the analyst" true rather than aspirational.

**Make the timeout smaller than you think.** A stage that normally takes four minutes should not have a two-hour timeout; a hung run then costs two hours of compute and delays the alert by the same. Ten times the normal duration is a reasonable ceiling.

**Alert on the absence of success, not just on failure.** The worst outage is the one where nothing failed because nothing ran. A freshness or missed-run check is the only thing that catches a disabled schedule, a deleted trigger, or an orchestrator that never fired.

**Put the run id in everything.** Every log line, every manifest row, every alert, every temporary object path. Correlating a failure across three services without a shared run id is an hour you will not get back.

**Cap backfill concurrency explicitly.** Ten windows in parallel against a rate-limited API, or a warehouse billed by scan, is the classic way to consume a month's budget in an afternoon. Two or three at a time.

**Break it on purpose, on a schedule.** Set aside a block specifically for failure injection: revoke a permission, corrupt a landed file, change a column type in staging, kill a task. Four deliberate breaks will teach you more about your pipeline than forty successful runs, and half of the definition of done is written in terms of them.

**Write the runbook while breaking it.** Each failure you inject becomes a runbook entry the same hour, while the symptom and the fix are still fresh. A runbook written at the end from memory is generic and useless.

**Measure before you optimise.** Look at the stage durations across your last ten runs before deciding what to improve. The stage you assume is slowest is frequently not, and optimising the wrong one produces a true number that proves nothing.

**If you run short on time**, prioritise in this order: the scheduled workflow succeeding end to end, then failure alerting, then the recovery and backfill path, then observability, then the optimisation. A pipeline that runs and shouts when it breaks is worth more than a fast one that fails silently.
