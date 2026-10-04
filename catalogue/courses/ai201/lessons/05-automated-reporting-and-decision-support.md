---
lesson_id: ai201-05
course_id: ai201
pathway: prompt-engineer
title: Automated Reporting and Decision Support
order: 5
kind: lesson
competency_ids:
  - D3-S1-C01
objectives:
  - Produce an automated report that assembles data, adds AI-generated narrative, and delivers on a schedule
---

## A report is a decision, not a document

Before you build anything, answer one question: what decision does this report support, and who makes it? If nobody can name a decision, you are about to automate the production of something nobody reads — which is worse than the manual version, because the manual version at least stopped when the person got busy.

Good answers sound like: "the operations lead decides on Monday which queues need extra staffing this week," or "the account manager decides which accounts to call before they churn." Those answers tell you the audience, the cadence, the grain of the data, and what belongs at the top of the page. A report supporting a Monday staffing decision leads with queue backlogs by team, not with a chart of cumulative volume since January.

The architecture of an automated report is four stages, and the split between them is the whole lesson:

```text
schedule -> assemble (deterministic) -> narrate (AI, numbers-in-only) -> deliver
```

**Everything numeric happens before the model sees anything.** The model's job is to explain figures it is given, never to produce them. That single boundary is what makes an AI-written report trustworthy enough to send.

## Choosing metrics that survive contact with a spreadsheet

Before the pipeline, settle the definitions. An automated report runs unattended for months, and any ambiguity in a metric definition becomes an argument at exactly the moment the number matters.

**Write the definition down, in words, with the edge case resolved.** "Cycle time is the elapsed hours from `received_at` to the first transition into a terminal status, counting all hours including nights and weekends, excluding cases that were merged into another case." Every clause in that sentence is there because someone would otherwise have assumed differently. Store the definitions next to the workflow and put a link to them in the report footer.

**Prefer counts and durations you can trace to rows.** A metric a reader can drill into is a metric they will trust. If your report says 14 SLA breaches, someone will eventually ask which 14, and "the query said so" is not an answer. Attach the identifiers, or at least make the same filter reproducible.

**Separate leading from lagging measures.** Requests closed is lagging — it tells you what happened. Queue depth and the age of the oldest open item are leading — they tell you what is about to happen. A staffing decision needs the leading pair; a quarterly review needs the lagging one. Reports that mix them without labeling produce meetings where people argue past each other.

**Pick the grain deliberately.** Per queue, per team, per customer segment, per day. The grain should match the decision: a staffing decision is per queue per day, an account-health decision is per customer per month. Rolling up finer data is easy; you cannot split a total you never collected at the finer grain, so store the detail and aggregate at render time.

**Resist metric sprawl.** Every figure on the page costs the reader attention and costs you a definition to maintain. If a metric has never changed a decision in three months of reports, remove it and see whether anybody notices.

## Assemble: compute deterministically

Do the arithmetic in your workflow, your database, or your spreadsheet — anywhere with real number types and repeatable behaviour. Language models are not calculators, and a report whose totals are model output is a report that will eventually be confidently wrong in a way no reader can detect.

Produce a single metrics object that is the report's complete factual content:

```json
{
  "report_id": "ops-weekly-2026-W11",
  "period": {"start": "2026-03-09", "end": "2026-03-15", "timezone": "UTC"},
  "generated_at": "2026-03-16T06:00:00Z",
  "headline": {
    "requests_received": 412,
    "requests_closed": 388,
    "open_at_period_end": 96,
    "median_cycle_hours": 5.4,
    "p90_cycle_hours": 31.2
  },
  "comparison": {
    "prior_period": {
      "requests_received": 366,
      "requests_closed": 371,
      "median_cycle_hours": 4.9,
      "p90_cycle_hours": 22.8
    },
    "deltas": {
      "requests_received_pct": 12.6,
      "requests_closed_pct": 4.6,
      "median_cycle_hours_pct": 10.2,
      "p90_cycle_hours_pct": 36.8
    }
  },
  "by_queue": [
    {"queue": "quotes", "received": 201, "closed": 178, "open": 61, "median_cycle_hours": 7.9, "sla_breaches": 14},
    {"queue": "support", "received": 143, "closed": 149, "open": 21, "median_cycle_hours": 3.1, "sla_breaches": 2},
    {"queue": "billing", "received": 68, "closed": 61, "open": 14, "median_cycle_hours": 6.0, "sla_breaches": 5}
  ],
  "thresholds_breached": [
    {"metric": "p90_cycle_hours", "value": 31.2, "threshold": 24, "queue": "all"},
    {"metric": "sla_breaches", "value": 14, "threshold": 10, "queue": "quotes"}
  ],
  "data_quality": {
    "records_scanned": 412,
    "records_excluded": 3,
    "exclusion_reason": "missing closed_at timestamp",
    "sources_complete": true
  }
}
```

Four parts of that object deserve attention.

**Comparison is computed, not implied.** If you want the narrative to say "up 13%," compute the percentage yourself and hand it over. Asking a model to compute a delta from two numbers is asking for a coin flip on the arithmetic and a certainty on the wording.

**Thresholds are evaluated in code.** "Is this bad?" is a business rule with a number attached. Encode it: `p90 > 24 hours`, `sla_breaches > 10`. The model then explains a breach that your rules already detected, rather than deciding for itself what counts as alarming — which drifts week to week.

**Data quality travels with the numbers.** `records_excluded` and `sources_complete` are how a reader knows whether to trust the page. If a source failed to load, the report must say so on its face, and it must not quietly report a smaller number as if it were the whole picture.

**Everything is period-stamped and timezone-explicit.** A weekly report generated at 06:00 UTC that reads "this week" is unreadable three weeks later. Put the literal date range in the object and in the output.

## Narrate: the constrained AI step

Now the model gets exactly one input — the metrics object — and a tightly bounded job. It may interpret, group, prioritize, and phrase. It may not introduce a number that is not in the object, and it may not assert a cause it was not given.

```text
You write the narrative section of an internal weekly operations report.

You will receive a JSON metrics object. Write for an operations lead who will decide
staffing for the coming week. Be direct and specific. No greeting, no sign-off.

Structure your output as exactly these three parts, each labeled:
SUMMARY: two sentences on what happened overall.
ATTENTION: 2-4 bullets, each naming a queue or metric that needs a decision, with the
figure that justifies it.
WATCH: one bullet on something that is not yet a problem but is trending.

Hard rules:
- Every number you write must appear verbatim in the metrics object. Never compute,
  round differently, estimate, or extrapolate.
- Never state a cause. You may say "quotes p90 rose to 31.2 hours"; you may not say
  "because of the holiday" or "due to staffing".
- If thresholds_breached is empty, say so plainly rather than manufacturing concern.
- If data_quality.sources_complete is false, your first sentence must state that the
  figures are incomplete.
- Do not recommend an action. Describe what needs a decision and who owns the queue.

Metrics object:
{{metrics_json}}
```

Two of those rules do the heavy lifting. **No causes** stops the most seductive failure mode, in which the model invents a plausible explanation and the reader repeats it in a meeting as fact. **No recommendations** keeps the report on the decision-support side of the line: it surfaces what needs deciding, a person decides. A report that says "add two people to quotes" is making a staffing decision with no knowledge of budget, holidays, or the hire starting Monday.

Then verify the output before it goes anywhere. A cheap, effective check: extract every number-like token from the generated narrative and assert that each one appears in the metrics JSON. Any token that does not match is a hallucinated figure — fail the run, log the narrative, and either retry once or fall back to a numbers-only report with a note that the narrative was withheld. Sending a report with a fabricated figure is worse than sending a bare table.

Two tokenizing details decide whether this guard actually works. Digits inside names, such as `p90` or the `W11` in a report ID, must not count as figures on either side; otherwise `90` lands in the allowed set and a narrative that invents "90 open" passes. And strip thousands separators before matching, or `1,412` splits into `1` and `412` and slips through. Also add a prompt rule that every figure is written as digits, because the guard cannot see "roughly two hundred".

```text
narrative numbers: [412, 388, 5.4, 31.2, 24, 14, 10]
metrics tokens:    [412, 388, 96, 5.4, 31.2, 366, ... 24, 14, 10, ...]
unmatched:         []   -> pass
```

Here is what the narrate step produces from the metrics object above, and it is worth reading closely because everything in it is traceable:

```text
SUMMARY: The team received 412 requests and closed 388, ending the period with 96 open.
Median cycle time was 5.4 hours against 4.9 in the prior period.

ATTENTION:
- Overall p90 cycle time reached 31.2 hours, above the 24-hour threshold.
  Owner: Operations lead.
- Quotes recorded 14 SLA breaches against a threshold of 10. Owner: Quotes lead.
- Quotes received 201 requests and closed 178, ending the period with 61 open —
  the largest open balance of the three queues. Owner: Quotes team.

WATCH:
- Requests received rose 12.6% while closed rose 4.6%; if the gap persists the open
  balance will keep growing.
```

Every figure in that output — 412, 388, 96, 5.4, 4.9, 31.2, 24, 14, 10, 201, 178, 61, 12.6, 4.6 — appears verbatim in the metrics object. The owners come from the routing table, joined onto the metrics object before the narrate step, so they are inputs too. No cause is asserted anywhere — the overall p90 breach is reported as a fact, not attributed to the quotes queue, because the object holds no per-queue p90 to support that claim — and the WATCH bullet describes an arithmetic relationship between two given deltas rather than explaining it. And no action is recommended, though the reader now knows exactly which two decisions are theirs to make. That is the shape you are aiming for.

## Deliver: schedule, format, and the empty case

Delivery is where automated reports quietly break, usually in one of four ways.

**Timezone and cadence.** Schedule in a stated timezone and account for the reporting period being closed. A Monday 06:00 report covering "last week" must not run before the last of Sunday's records has landed. If a source system posts data with a lag, build the lag into the period boundary rather than pretending it is not there.

**Format follows channel.** A chat message wants a headline plus three bullets and a link. An email wants the narrative plus a compact table. A document wants the full breakdown and an appendix. Generate the metrics object once and render it per channel; do not run the model three times to say the same thing three ways.

**The empty and the broken cases.** Decide, in advance, what happens when the period had no activity, and when a source failed. "No requests received this period" is a legitimate report and should still be sent — silence is indistinguishable from a broken scheduler. A source failure should send a report that leads with the failure, not a report with a hole in it.

**Distribution and sensitivity.** Anything leaving the company, or containing customer-identifying data, gets a human reviewer before it goes. Internal operational reporting can deliver automatically; a report to a client is a customer-facing communication and follows the same rule as every other one in this course — a person reads it before it is sent. Build that as a real review state on the report record, with the rendered draft attached, not as an informal habit.

Keep every generated report. Store the metrics object, the narrative, and the rendered output with the `report_id`. When someone asks in June why the March figure was different, the answer has to be retrievable, and regenerating from live data will not reproduce it.

## Making it decision support rather than a wall of numbers

Three habits separate a report people use from one they archive unread.

**One headline, one number.** Lead with the single figure that maps to the decision. Everything else is supporting evidence, and it goes below the fold.

**Exceptions before aggregates.** The reader's attention should land on the two queues that breached, not on the total that hid them. Sort the tables by the thing that needs action.

**Every item has an owner.** An attention bullet naming a queue with no owner produces a meeting. Naming the owner produces a decision. Your routing table from the data-processing lesson already holds owners — join to it.

## Practice

Build a scheduled weekly report over the pipeline you built in the previous lesson, or over any dataset with at least four weeks of dated records.

1. **Write the decision statement** in one sentence: who decides what, when, using this report. Everything else follows from it. If you cannot write it, pick a different report.
2. **Build the assemble step** to produce a metrics object containing headline figures, a prior-period comparison with computed deltas, at least one grouped breakdown, an evaluated `thresholds_breached` array, and a `data_quality` block. All arithmetic must be in the workflow, not the model. Include the literal period dates and timezone.
3. **Prove the arithmetic.** Compute the same headline figures by hand or in a spreadsheet for one period and confirm they match to the decimal. Record both.
4. **Build the narrate step** with a prompt enforcing the no-new-numbers, no-causes, no-recommendations rules and the labeled three-part structure.
5. **Build the number-check guard.** Extract numeric tokens from the narrative, compare against the metrics object, and make the run fail loudly on any unmatched token. Then deliberately break it: hand the model a metrics object with a missing field and see whether it invents a figure. Report what happened.
6. **Handle the empty period.** Run the report over a date range with no records. It must produce and deliver a coherent report, not an error and not a blank.
7. **Handle the broken source.** Simulate one source failing. Confirm `sources_complete` is false and that the narrative's first sentence says the figures are incomplete.
8. **Deliver on a schedule** to a real channel, archive the metrics object and narrative under the `report_id`, and let it run for at least two consecutive periods. Bring both outputs and one paragraph on what you would change after seeing them side by side.

## Check your understanding

1. Your narrative says "requests rose 13%". The metrics object holds `requests_received_pct: 12.6`. Which rule was broken, and what should catch it? *Answer: the no-new-numbers rule. The model rounded instead of copying. The number-check guard should flag 13 as unmatched and fail the run.*
2. Why is "quotes p90 rose because of the holiday" not allowed even if it is true? *Answer: the model was not given the cause. An invented but plausible cause gets repeated as fact. The report states what happened, and people supply the why.*
3. A source failed to load before Monday's run. What should go out? *Answer: a report whose first sentence says the figures are incomplete, with `sources_complete: false`. It should not quietly report smaller totals, and it should not send nothing.*
