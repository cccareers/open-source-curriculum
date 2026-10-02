---
lesson_id: db305-08
course_id: db305
pathway: prompt-engineer
title: Monitoring and Optimizing AI Performance
order: 8
kind: lesson
competency_ids:
  - D5-S1-C05
objectives:
  - Monitor a deployed AI workflow's accuracy, latency, and cost, and act on
    what the monitoring shows
---

## The three numbers, and why opinions fill the gap

Ask a team how their AI workflow is performing and you usually get an anecdote: someone remembers a bad output last Tuesday, someone else says it has been fine. That happens because nobody wrote anything down. Monitoring replaces the anecdote with three numbers you can defend — **is it right, is it fast enough, and what does it cost** — and, crucially, with the ability to tell whether a change made any of them better.

None of this works retrospectively. You cannot compute last month's accuracy from a workflow that logged nothing, and you cannot prove an optimization helped without a baseline recorded before you touched it. Instrumentation comes first.

## Log one record per run

Every AI step should write one record, whether it succeeded or not. This is the raw material for everything else in the lesson.

```json
{
  "run_id": "6b1f5b1e-8f1a-4c33-9d02-4a6f2b0f1c77",
  "occurred_at": "2026-03-11T14:07:11Z",
  "workflow": "order-note-extraction",
  "workflow_version": "2026-03-09",
  "prompt_version": "extract-notes-v4",
  "deployment": "orders-extractor-prod",
  "model": "gpt-4o-mini",
  "model_version": "2024-07-18",
  "source_record_id": "ORD-1041",
  "input_chars": 214,
  "prompt_tokens": 212,
  "completion_tokens": 24,
  "latency_ms": 940,
  "attempts": 1,
  "status": "ok",
  "validation_result": "validated_ok",
  "self_reported_confidence": 0.91,
  "routed_to": "auto_apply",
  "human_reviewed": false,
  "human_verdict": null,
  "cost_usd": 0.000046
}
```

Every field on that record earns its place. `prompt_version` and `model_version` are what let you attribute a change in quality to a cause — without them you have a graph that moved and no idea why. `attempts` separates "worked" from "worked on the third try", which is the difference between a healthy step and one that is quietly costing triple. `validation_result` carries forward the checks from lesson 06, so a parse failure is a countable event rather than an exception someone swallowed. And `human_verdict` is the field that makes accuracy measurable at all.

Store these in a table you can query. If your platform's run history is your only record, you have logs you can read one at a time and no way to compute a rate.

Two cautions. Do not log prompt or response content containing personal data unless retention and access have been decided — the redaction decision from lesson 06 applies here too. And log the failures with the same care as the successes; a monitoring table containing only successful runs will tell you everything is fine.

## Accuracy: build an evaluation set

Accuracy needs a fixed yardstick. Build one before you need it.

An **evaluation set** is a collection of real inputs with correct outputs attached, agreed by a person who knows the domain. Thirty to a hundred cases is enough to be useful. Compose it deliberately:

- Roughly 60 percent ordinary cases, representative of typical traffic.
- Roughly 25 percent hard-but-legitimate cases — ambiguous phrasing, missing fields, unusual formats.
- Roughly 15 percent cases that should fail or escape: an empty note, a note in another language, one that should return all nulls.

That last group matters most. A workflow that never returns "I could not determine this" is not confident, it is fabricating, and only a set containing genuine non-answers will reveal it.

Grade per field, not per record, because "the record was wrong" hides which field is the problem.

| Field | Correct | Wrong | Missed | Notes |
| --- | --- | --- | --- | --- |
| `call_ahead` | 47 | 1 | 2 | Both misses were implicit phrasing |
| `access_code` | 43 | 5 | 2 | 4 of 5 wrong were transcription slips on digits |
| `special_equipment` | 44 | 2 | 4 | Misses concentrated on "hiab" phrasing |
| `earliest_time` | 46 | 0 | 4 | Misses were notes with no stated time |

The distinction between **wrong** and **missed** drives different fixes. A missed field usually means the prompt is too conservative or the phrasing is not covered. A wrong field means the model asserted something false, which is more serious and is where confident fabrication lives. Track "wrong while reporting confidence above 0.8" as its own number; that is the population that will reach production unreviewed.

Freeze the set and re-run it after every change. Its whole value is being the same yardstick over time.

## Accuracy in production

The evaluation set tells you about the cases you chose. Production tells you about the cases you got. Three mechanisms keep it honest.

**Sample and review.** Pull a fixed random sample every week — 20 to 50 runs — and have a person grade them the same way. Random, not "the ones that look odd", or you measure your own suspicions.

**Mine the human overrides.** Wherever a person can correct the workflow's output, that correction is a free label. `human_verdict` on the run record turns into an ongoing accuracy signal at no extra cost, and the corrected records are the best possible additions to your evaluation set.

**Check the calibration of self-reported confidence.** Bucket runs by the confidence the model reported and compute the actual accuracy in each bucket:

```text
confidence 0.9-1.0  ->  actual accuracy 0.94   (well calibrated)
confidence 0.7-0.9  ->  actual accuracy 0.88   (slightly under-confident)
confidence 0.5-0.7  ->  actual accuracy 0.55   (roughly honest)
confidence 0.0-0.5  ->  actual accuracy 0.41   (honest)
```

That is a healthy picture, and it justifies an auto-apply threshold somewhere around 0.9. If instead the 0.9-plus bucket is only 70 percent accurate, the confidence number is decorative and must not be used as a routing threshold until the prompt is fixed.

Two proxy signals are worth watching daily because they need no human at all: the **quarantine rate** from your validation checks, and the **escalation rate** to human review. Both moving without a deployment on your side means something upstream changed.

## Latency and cost

Report latency as percentiles, never as an average. One 40-second run hides in a mean and dominates a p99.

```sql
select date_trunc('day', occurred_at) as day,
       count(*)                                                            as runs,
       percentile_cont(0.50) within group (order by latency_ms)            as p50_ms,
       percentile_cont(0.95) within group (order by latency_ms)            as p95_ms,
       percentile_cont(0.99) within group (order by latency_ms)            as p99_ms,
       avg(prompt_tokens + completion_tokens)                              as avg_tokens,
       sum(cost_usd)                                                       as daily_cost,
       avg(case when status = 'ok' then 1.0 else 0.0 end)                  as success_rate
from ai_run_log
where workflow = 'order-note-extraction'
  and occurred_at >= now() - interval '30 days'
group by 1
order by 1;
```

p50 is the typical experience, p95 is what a noticeable minority get, p99 is where timeouts hide. The useful question is which target matters: for an overnight batch, throughput matters and p99 rarely does; for a step a person waits on, p95 is the number that decides whether the tool feels usable.

When latency is too high, find where the time actually goes before changing anything. Model time is only one component; retries, a slow database query, a large document fetch, and platform queueing all sit in the same total. A step that averages four seconds because it retries once every third run has a reliability problem, not a speed problem.

For cost, the metric to steer by is **cost per successful outcome**, not cost per call.

```text
cost per call            $0.000046
calls per record          1.4      (retries and re-extractions included)
records needing rework    6%
cost per usable record   $0.000069
```

That last number is the one to compare against the manual process, and it is the one that makes the argument for a fix. A cheaper model that needs twice the retries and doubles the human review time is more expensive, and only this metric shows it.

## A dashboard and three alerts

Put the numbers somewhere people look. A weekly view of runs, success rate, p95 latency, quarantine rate, escalation rate, cost per day, and cost per usable record is sufficient — and a simple table beats a beautiful chart nobody opens.

Alerts are different from dashboards. Alert on conditions that require action within hours, and nothing else, or they will be ignored:

1. **Error rate above threshold** — failures exceed, say, 5 percent of runs over 15 minutes. Something is broken now.
2. **Volume anomaly** — runs today are far above or below the expected band. A stuck trigger and a runaway loop both show up here first, and the loop is also a cost incident.
3. **Spend anomaly** — daily cost exceeds its budget. Set this at the account level as well as in your own dashboard.

Everything else — a gradual accuracy decline, a slow latency creep, a rising quarantine rate — belongs in a weekly review, because those need judgement rather than a page at 3am.

## Optimizing, cheapest lever first

When a number needs to move, work down this list. It is ordered by effort and risk, and most problems are solved in the first three.

**Fix the prompt.** Most accuracy failures are instruction failures. Add the missing case, tighten the null policy, close a vocabulary, add two examples of the phrasing that is being missed. Cheapest change available, and it needs no deployment.

**Trim the input.** Long inputs cost tokens, add latency, and dilute attention. Send the three fields the task needs instead of the whole record; strip boilerplate headers and signatures; chunk on structure as in lesson 02. Cutting a 4,000-token prompt to 900 often improves accuracy as well as cost.

**Cache.** If the same input can recur, hash it and store the result. In document processing, duplicate submissions are common and a cache eliminates them entirely. Many providers also offer prompt caching for a long, stable system prompt, which reduces the cost of the repeated portion — check whether yours does before optimizing the wrong end.

**Batch.** Where the task allows several items per call — classifying twenty short notes rather than one — you amortize the system prompt across them. Keep batches small enough that one bad item does not spoil the whole response, and always return an item id per result so you can map outputs back.

**Route by difficulty.** Send everything to a small, cheap model first, and escalate to a larger one only when confidence is low or validation fails. If 85 percent of traffic is handled by the cheap model, the blended cost is close to the cheap model's, and the hard cases still get the better one.

**Change the model.** A newer or smaller model may be better on your task, and the only way to know is your evaluation set. Downgrading is a legitimate optimization: many extraction tasks run at full accuracy on a much smaller model, and the saving is often an order of magnitude.

**Adjust request parameters.** `temperature: 0` for anything with one right answer. A `max_tokens` that fits the expected output but does not truncate it — remembering from lesson 07 that a truncated JSON response is a `finish_reason` of `length`, not a prompt problem.

**Tune retries and timeouts.** Retrying a 400 wastes money and time. Retrying a genuinely transient 503 is essential. A timeout longer than your platform's step limit means the platform kills the run before you can handle the failure.

Two things that are not optimizations: raising the auto-apply confidence threshold to reduce human review without evidence that the model is calibrated at the new threshold, and turning off validation because quarantines are annoying. Both improve a metric by hiding the problem it was measuring.

## Change one thing, and prove it

Optimization without measurement is redecoration. The discipline is short and non-negotiable.

```text
1. Record the baseline: accuracy per field on the frozen set, p50/p95 latency,
   cost per usable record, quarantine rate, escalation rate.
2. Change exactly ONE thing. Bump the prompt version or the model version, never both.
3. Re-run the same frozen evaluation set.
4. Compare field by field. Note regressions, not just the headline.
5. If it is better, ship to dev, then promote as in lesson 07.
6. Watch production for a week against the same numbers.
7. Write down what changed, what moved, and the date.
```

Step 4 is where most improvements are found out. A prompt change that raises `access_code` accuracy from 86 to 94 percent while dropping `special_equipment` from 88 to 71 percent is a net loss disguised as a win, and only per-field comparison shows it.

Keep the change log next to the configuration sheet from the previous lesson. Six months later, when someone asks why the extractor behaves differently from the documentation, that log is the only thing that will answer them.

## Practice

Instrument a workflow you have already built — the extraction workflow from earlier in this course is ideal — and improve it with evidence.

1. **Log every run.** Implement the run record above, written to a queryable table, for both successful and failed runs. Confirm you can query it and that failures are present.
2. **Build the evaluation set.** Assemble 40 real inputs with correct outputs agreed by a person, composed to the 60 / 25 / 15 split, including at least five cases whose correct answer is "not stated". Freeze it.
3. **Baseline it.** Run the set and produce the per-field correct / wrong / missed table, plus p50 and p95 latency, cost per call, calls per record, and cost per usable record. Save it as the baseline, dated.
4. **Check calibration.** Bucket production runs by self-reported confidence and compute actual accuracy per bucket against your reviewed sample. State whether the confidence field is safe to use as a routing threshold, and justify the threshold you choose.
5. **Build the dashboard.** Produce the weekly view — runs, success rate, p95, quarantine rate, escalation rate, daily cost, cost per usable record — and show it to someone who did not build it. Their first question tells you what is missing.
6. **Set the three alerts** with explicit thresholds and a stated owner. Trigger the volume anomaly deliberately and confirm it fires.
7. **Make one optimization** from the menu, changing exactly one variable. Re-run the frozen set and produce a side-by-side comparison of every field plus latency and cost.
8. **Report honestly.** Write a short note: what you changed, which numbers improved, which regressed, whether you would ship it, and what you would try next. A change you decided not to ship, with the evidence for that decision, is a complete and successful answer to this exercise.
