---
lesson_id: ai201-12
course_id: ai201
pathway: prompt-engineer
title: Refining Workflows for Performance and Cost
order: 12
kind: lesson
competency_ids:
  - D3-S1-C05
objectives:
  - Refine a working automation for reliability, latency, and cost, and prove the improvement
---

## Measure, change one thing, prove it

Refinement is the discipline of making a working automation better without making it wrong. It has three dimensions that trade against each other — **reliability**, **latency**, and **cost** — plus a fourth, **quality**, that is not a dimension you optimize but a constraint you must not breach. Every change in this lesson is judged the same way: measured before, one variable changed, measured after, on the same data, with quality checked in both directions.

The reason for that formality is that intuition about workflow performance is reliably wrong. The step everyone blames is rarely the slow one. The change that "obviously" saves money often adds retries that cost more. And the cheapest model is a bargain right up until its extra errors put 20% more cases into a human review queue, at which point it is the most expensive thing in the system.

## Instrument before you touch anything

You cannot refine what you have not measured, and platform dashboards do not measure what you need. Add a run-log record per execution:

```json
{
  "run_id": "run_2026_0402_11431",
  "workflow": "quote-intake-classify",
  "started_at": "2026-04-02T11:43:01.220Z",
  "ended_at": "2026-04-02T11:43:09.870Z",
  "duration_ms": 8650,
  "outcome": "success",
  "step_durations_ms": {
    "trigger": 40, "dedupe_lookup": 610, "fetch_customer": 2380,
    "retrieve_policy": 1420, "classify_llm": 3210, "draft_llm": 0, "write_record": 590
  },
  "platform_operations": 11,
  "llm_calls": 1,
  "llm_input_tokens": 2840,
  "llm_output_tokens": 190,
  "retries": 0,
  "cache_hit": false,
  "case_id": "CASE-2026-0402-0088"
}
```

From a few thousand of those you get everything you need:

- **Reliability**: success rate, failure rate by cause, retry rate, dead-letter rate.
- **Latency**: end-to-end p50 and p95, plus p50 and p95 *per step*. Always percentiles, never averages — the average hides the tail, and the tail is what people complain about.
- **Cost**: platform operations per run, model calls per run, tokens in and out per run. Multiply by volume for a monthly figure, and divide by outcomes for the number that actually matters: **cost per completed case**, including the cost of human review time.
- **Quality**: your accuracy or wrong-rate measure from the relevant earlier lesson, over a fixed evaluation set.

Then rank by *total* contribution, not per-run duration. A 300ms step running 900 times per case beats a 3-second step running once. Compute `p50_duration x invocations_per_case` for every step and sort. The answer is frequently a lookup nobody thought about.

## Reliability first

Reliability comes first because latency and cost improvements on an unreliable workflow are wasted, and because most reliability work also reduces cost.

**Filter early.** Move every exclusion as close to the trigger as possible. A run that does six steps before discovering the record is out of scope has spent six steps of operations and latency on nothing. Reordering filters is the single highest-return change available in most no-code workflows, and it costs nothing.

**Retry only what is retryable, with backoff.** Transient errors (`429`, `503`, timeouts, connection resets) get three attempts with increasing delay and jitter. Permanent errors (`400`, `401`, `422`, validation failures) get zero. Retrying everything the same number of times both wastes operations and delays the dead-letter routing that would have got a human involved sooner.

**Add a circuit breaker on flaky dependencies.** When a dependency has failed N times in M minutes, stop calling it, route new cases to a holding status, and alert. Hammering a struggling service turns a partial outage into a full one and burns your operation budget while doing it.

**Make the dead-letter path real.** Anything that exhausts retries lands in a `failed` status, visible in a view, with an alert. A failure nobody sees is a reliability problem that never gets fixed.

**Guard with validation rather than with hope.** Front-door validation converts a class of mid-run failures into clean, cheap early exits.

## Latency

Attack the ranked step list, in this order of usual payoff.

**Remove polling from the critical path.** A five-minute poll interval contributes an average of 2.5 minutes of pure latency. If the source can send a webhook, switch — this is often a bigger win than every other latency change combined.

**Parallelize independent work.** Fetching customer data and retrieving policy snippets do not depend on each other. If your platform supports parallel branches or a single batched request, run them together. In the run log above, that saves roughly 1.4 seconds of the 8.65 immediately.

**Cut round trips.** Three sequential lookups against the same table become one query with an `OR` filter. Reading a record you already have in run scope is a habit worth breaking.

**Cache what does not change.** Policy snippets, rate tables, category definitions, and vendor records change daily at most. Cache them in a table with a refresh timestamp rather than fetching per run. Cache invalidation must be explicit: a stated maximum age, plus a manual bust, plus a flag on the reviewer's screen if the cache is stale.

**Avoid the model call when a rule suffices.** The largest single latency item in most AI workflows is the model call. Every case a deterministic rule can settle is a call you do not make. If 30% of your inbound is a known form with a fixed structure, route it around the classifier entirely.

**Split the human wait out of the measurement.** End-to-end latency that includes a two-hour review queue is not a technical measure. Report machine latency and queue latency separately, or you will optimize the wrong one — and queue latency is usually reduced by staffing, batching, or notification changes rather than by anything in the workflow.

## Cost

Three cost pools, and you should know the size of each before you optimize any.

**Platform operations.** Most no-code platforms bill per step executed. Runs that fail late are the worst offenders, because they pay for every step before the failure. Filtering early, exiting on dedupe immediately, and collapsing three mapping steps into one all reduce the count directly. Count operations per successful case and track it as a metric.

**Model spend.** Driven by calls per case, input tokens per call, and model tier. In that order — an unnecessary call costs more than a verbose prompt.

**Human time.** Usually the largest pool and the one nobody puts in the spreadsheet. If a change raises the review rate from 20% to 35%, and review takes four minutes, you have added real cost that dwarfs a token saving. Always include it.

Concrete model-cost levers, most effective first:

- **Fewer calls.** Do not call the model to do something a rule can do. Do not call it twice for the same content. Do not call it on records you are about to reject — validate first, enrich second.
- **Tier by need.** A short classification into six categories does not need your most capable model; a nuanced customer draft might. Test the smaller model on your evaluation set and keep it only if quality holds.
- **Shorter input.** Send the relevant chunk, not the whole document. Trim quoted email history. Send retrieved snippets, not the whole knowledge base. Input tokens usually dominate, and they are usually where the waste is.
- **Cache repeated context.** Where the same large instruction block precedes every call, use whatever caching your provider offers for repeated prefixes, and keep the stable part at the front.
- **Batch where latency allows.** Overnight enrichment of 400 records can go in batches; a customer-facing classification cannot wait.
- **Structured output reduces retries.** Every malformed response is a wasted call plus a retry. Tightening the output contract is a cost optimization as much as a correctness one.

## The trap: never trade quality silently

Every cost and latency change is a candidate quality regression. A cheaper model, a shorter prompt, an aggressive filter, a stale cache — each can improve your dashboard while making the output worse.

So hold a fixed **evaluation set** and re-run it on every change. It is the labeled set from lesson 07 or 09, or the regression set from lesson 11. Report quality alongside cost, always:

| variant | model | tokens in | cost/1k cases | p95 latency | accuracy | review rate | cost/case incl. review |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A (baseline) | large | 2,840 | $18.40 | 9.2s | 94.1% | 18% | $1.36 |
| B (trimmed prompt) | large | 1,190 | $8.10 | 7.8s | 93.8% | 19% | $1.28 |
| C (smaller model) | small | 1,190 | $1.90 | 4.1s | 88.2% | 34% | $2.14 |
| D (rules first + B) | large | 1,190 | $5.60 | 5.3s | 94.0% | 18% | $1.09 |

Variant C is the lesson. It cut model spend by 90% and made the process more expensive, because a 6-point accuracy drop pushed review rate from 18% to 34% and human minutes cost more than tokens. Without the last two columns, C looks like the obvious winner and someone ships it.

Variant D is the right answer, and note what it is: two independent changes, each measured separately first, then combined and re-measured. That is the method.

## Proving the improvement

An improvement claim needs four things, or it is an anecdote.

**A defined baseline.** The same metrics, from before the change, over a stated window with a stated sample size. Written down before you started.

**The same data.** Compare on the same evaluation set, or on the same period of the week. Comparing Monday's latency to Sunday's proves nothing about your change.

**One variable.** If you changed the model and the prompt together, you cannot attribute the result. Do them in sequence.

**Enough volume that the difference is real.** Two runs are not evidence. For latency, a few hundred runs per variant; for accuracy, your full evaluation set. If the difference is within the noise of your sample, say so rather than claiming a win.

Then write the refinement note and keep it with the runbook:

```text
CHANGE      Trim quoted history and retrieved snippets from classifier input (variant B).
DATE        2026-04-08
BASELINE    2,840 input tokens/case; p95 9.2s; accuracy 94.1% (n=220 eval set);
            review rate 18%; $18.40/1k cases; measured 2026-03-25 to 2026-04-01.
AFTER       1,190 input tokens/case; p95 7.8s; accuracy 93.8% (same eval set);
            review rate 19%; $8.10/1k cases; measured 2026-04-08 to 2026-04-15.
VERDICT     56% model-cost reduction, 1.4s p95 improvement, accuracy change within
            sample noise (n=220). Keep.
RISK        Trimming history could lose context on long reply threads. Mitigation:
            threads with more than 4 messages keep the last 2 quoted blocks.
ROLLBACK    Revert step 4 mapping to full body. One-line change, no data effect.
```

The `RISK` and `ROLLBACK` lines are what make this a change record rather than a boast. And when a change does not work, keep the note anyway — a documented negative result stops the next person repeating it.

## Knowing when to stop

Refinement has diminishing returns, and there is a point where further effort is worth less than the effort itself. Stop when the workflow meets its agreed reliability and latency targets, when cost per case is no longer material against the value of the process, and when the remaining improvements are smaller than your measurement noise. Write down where you stopped and why, so the next person does not re-litigate it from scratch.

## Practice

Profile and refine an automation you built earlier in this course. Aim for at least 200 runs of real or replayed data per measurement.

1. **Instrument.** Implement the run-log record with per-step durations, operation count, model calls, tokens in and out, retries, and outcome. Every measurement below comes from it.
2. **Establish the baseline.** Report success rate, retry rate, p50 and p95 end-to-end, p50 and p95 per step, operations per run, model cost per 1,000 cases, and accuracy on a fixed evaluation set of at least 50 cases. State the window and the sample size.
3. **Rank the steps** by `p50_duration x invocations_per_case` and by contribution to operation count. Name your top three targets and predict, in writing, how much each will save. Comparing your prediction to the result afterwards is part of the exercise.
4. **Make one reliability change** — early filtering, selective retry with backoff, a circuit breaker, or a real dead-letter path. Measure success rate and retry rate before and after.
5. **Make one latency change** — parallelize two independent steps, cache a repeated lookup, remove a poll, or route a rule-satisfiable subset around the model. Measure p50 and p95 before and after.
6. **Make one cost change** — trim input, drop an unnecessary call, or tier the model. Measure tokens, cost per 1,000 cases, and accuracy.
7. **Build the comparison table** with at least four variants including the baseline, and include both quality and review-rate columns plus a cost-per-case figure that includes human review time. Make at least one variant a deliberate quality trade so the table shows the trap.
8. **Write one refinement note** in the format above, including the risk and the rollback, for the change you are keeping. Write a second short note for a change you tried and rejected, with the number that made you reject it.
9. **State your stopping point.** Name the targets the workflow now meets, the next improvement you considered, and why it is not worth doing.
