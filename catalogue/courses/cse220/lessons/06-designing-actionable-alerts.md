---
lesson_id: cse220-06
course_id: cse220
pathway: cloud-support-engineer
title: Designing Actionable Alerts
order: 6
kind: lesson
competency_ids:
  - D6-S1-C04
objectives:
  - Define alerts with thresholds that page a human only when action is required
---

## The hardest thing about alerting is restraint

A dashboard is pulled. Someone is already worried and goes looking. An alert is pushed: it interrupts a person who was doing something else, possibly asleep, and demands attention on your say-so. That asymmetry is why alert design is a harder discipline than dashboard design, and why the failure mode is so specific.

The failure mode is **alert fatigue**, and it does not look like a disaster. It looks like a channel with forty notifications a day that everyone has muted, a pager that fires twice a night and is acknowledged without being read, and a real outage that ran for fifty minutes because the alert that fired at minute two looked exactly like the eleven that had fired that week and meant nothing. Every one of those useless alerts was added by a reasonable person trying to be careful. That is what makes this hard: the pressure is always toward more.

So adopt a rule and defend it. **Every alert that reaches a human must be actionable, urgent, and novel.**

*Actionable* means there is something a person can do about it right now. If the response is "acknowledge and wait," it is not an alert; it is a status.

*Urgent* means it cannot wait until business hours. If it can, it belongs in a ticket queue, not on a pager.

*Novel* means it tells you something you did not already know. Four alerts firing for the same root cause are three alerts too many.

An alert that fails any of the three is noise, and noise is not a neutral cost. It actively destroys the value of the alerts that are correct.

## Alert on symptoms

The single highest-leverage decision in alert design is the one from lesson 02: **alert on symptoms, investigate with causes.**

High CPU on an instance is not worth waking anyone. It might mean the service is working hard and succeeding. Meanwhile a service can be completely broken with unremarkable CPU. Alert on the fact that customers cannot check out; discover the CPU during the investigation.

The practical test: for each candidate alert, finish the sentence "a human should be woken up because…". If the ending is "…a resource is at 85 percent," you have a cause alert and you should demote it. If the ending is "…customers are receiving errors on checkout," you have a symptom alert. Symptom alerts are also durable — they keep working when the architecture changes underneath them, whereas cause alerts are tied to a particular implementation and quietly become wrong.

There are three legitimate exceptions where a cause alert earns a page:

**Predictable exhaustion.** Disk will be full in four hours. Certificate expires in seven days. Quota will be reached at the current rate before Monday. These are urgent and actionable precisely *because* no symptom has appeared yet, and acting now avoids the outage entirely. Alert on time-to-exhaustion, not on the current level — "disk 85 percent full" fires constantly on a healthy volume that always sits at 85 percent, while "disk will be full in under four hours at the current fill rate" fires only when it matters.

**Loss of redundancy.** One of two replicas is down. The service is fine and one more failure ends it. This is urgent and invisible in every symptom signal.

**Loss of visibility.** The heartbeat from lesson 03 has stopped. You are blind, and blindness must never be silent, because a stopped collector produces the same flat, calm graphs as perfect health.

## Where the number comes from

"Alert when latency is high" requires a number, and pulling one out of the air is how you get an alert that fires every Monday at nine. Derive it from what the service actually does.

**Step 1 — Measure the baseline.** Take the signal over at least two full weeks, ideally four, so you capture the daily and weekly shape. Record the p50, p95, and p99 by hour of day and by day of week. Note the peak hour and the quiet hour. You cannot say "abnormal" without this.

**Step 2 — Find the normal ceiling.** For each signal, find the value it stays under during ordinary operation, including its busiest normal hour. A workable rule is the 99th percentile of the observed values over the baseline window — the level exceeded only during genuinely unusual periods.

**Step 3 — Ask what the user can tolerate.** This is a business input and it is not always the same as the technical one. A checkout that normally takes 200 ms might be perfectly tolerable at 800 ms and abandoned at 3 s. Where such a number exists, get it in writing from whoever owns the customer relationship.

**Step 4 — Set the threshold between them.** Above the normal ceiling, so ordinary operation never fires it. Below the tolerance limit, so you hear about it before customers do. If the two overlap — if normal already exceeds what customers tolerate — you do not have an alerting problem, you have a performance problem, and setting a threshold above the tolerance limit to keep the pager quiet is the worst available response.

**Step 5 — Backtest.** Replay the threshold against the last month of history. Count how many times it would have fired, and for each, decide whether that firing would have been welcome. If it would have fired thirty times and you would have wanted three of them, the threshold or the duration is wrong. This step takes fifteen minutes and it is the difference between an engineered alert and a guess.

**Step 6 — Review after real use.** Every alert gets revisited after it fires. Was it right? Was it early enough? Did the responder have to do anything? Alerts are not set-and-forget; a threshold that was correct at 200 requests per second may be wrong at 2,000.

A worked example. Checkout latency baseline over four weeks: p95 sits at 210–260 ms through the day, rises to 340 ms in the 19:00–21:00 peak, with a 99th percentile of observed p95 values at 380 ms. The business says customers begin abandoning around 2 s and tolerate 1 s comfortably. Normal ceiling 380 ms, tolerance 1,000 ms. Threshold at 700 ms — comfortably above every normal reading including peak, comfortably below the abandonment point. Backtest over the last month: it would have fired four times, three of which were real incidents and one of which was a five-minute blip during a deploy. Add a duration requirement (below) and the blip disappears.

## Duration, direction, and the shape of a rule

A threshold alone is not a rule. Four more parameters turn it into one.

**The evaluation window.** How much data each check considers. Too short and normal variance trips it; too long and you are slow to detect. Five minutes is a reasonable default for a request-serving symptom signal.

**The duration, sometimes called the "for" clause.** How long the condition must hold before firing. This is your primary noise control, and it is more effective than raising the threshold. "p95 above 700 ms" fires on any transient blip; "p95 above 700 ms continuously for 5 minutes" fires on a problem. The cost is detection time, so trade explicitly: a fast-moving total outage deserves a short duration, a gradual degradation deserves a long one.

**Hysteresis.** The condition to *clear* should be slightly stricter than the condition to fire — clear at 600 ms rather than 700 — or a signal sitting exactly on the boundary will flap, producing a firing and resolving notification every few minutes, which is the most demoralizing kind of noise.

**Missing-data behaviour.** Every alerting system asks what to do when the series has no data, and the default is usually the wrong choice for you. Decide per alert. For a symptom alert on a service that always has traffic, no data means broken and should fire. For a nightly job's success signal, no data during the day is expected. Getting this wrong in the safe-looking direction — treat missing as OK — is how a total collection failure becomes an all-green console.

Written out, a rule looks like this in neutral form:

```yaml
alert: CheckoutLatencyHigh
severity: page
expression: |
  histogram_quantile(0.95,
    sum by (le) (rate(http_request_duration_seconds_bucket{
      service="storefront", route="/checkout", environment="production"}[5m]))
  ) > 0.7
for: 5m
clear_below: 0.6
no_data: notify
labels:
  service: storefront
  team: storefront-oncall
annotations:
  summary: "Checkout p95 latency above 700ms for 5 minutes"
  impact: "Customers experience slow checkouts; abandonment rises above ~2s."
  baseline: "Normal p95 is 210-340ms; threshold set above observed 99th percentile of 380ms."
  runbook: "runbooks/storefront/checkout-latency"
  dashboard: "dashboards/storefront-triage"
  first_checks: |
    1. Dashboard row 3 - is a dependency slow?
    2. Dashboard row 4 - is the DB connection pool at its ceiling?
    3. Deployment annotations - was there a release in the last 30 minutes?
```

And the same idea as a ratio alert, which is what most error alerting should be:

```yaml
alert: CheckoutErrorRatioHigh
severity: page
expression: |
  sum(rate(http_requests_total{service="storefront", route="/checkout",
                               status_class="5xx"}[5m]))
  / sum(rate(http_requests_total{service="storefront", route="/checkout"}[5m]))
  > 0.02
for: 3m
no_data: notify
```

Note the ratio in the expression and the low-traffic hazard it implies: at three in the morning with four requests in the window, one error is a 25 percent error rate. Guard it with a minimum-volume condition, or lengthen the window overnight, or accept that this alert only means something above some traffic floor and say so in the annotation.

## Severity, routing, and who gets woken

Not everything that is true deserves the same delivery. Three tiers cover almost every case.

**Page.** Wakes a human immediately, any hour. Reserved for customer-visible symptom breaches and the three cause exceptions. If your service generates more than roughly one or two of these a week, something is wrong with either the service or the alerts.

**Ticket.** Creates work in a queue for business hours. Degradations, predictable exhaustion with days of runway, single-node problems on a redundant tier, anomalies worth a look.

**Log or informational.** Recorded, visible on a dashboard, notifies nobody. Deployments, scaling actions, routine events.

Everything must have a tier, and the default when you cannot decide is ticket, not page.

**Routing** is the second half. An alert delivered to the wrong team is worse than one delivered nowhere, because it consumes attention and creates a false sense that it is handled. Put an owning team label on every alert rule, derived from the service label, and route on it. Every alert must have exactly one owner who is expected to act. "The whole channel" is not an owner.

Then reduce the volume that reaches the person:

**Grouping.** Twenty instances breaching one condition is one notification listing twenty instances, not twenty notifications.

**Deduplication.** The same condition firing repeatedly is one open alert until it clears, not a message every evaluation cycle.

**Inhibition.** When a higher-severity alert is firing, suppress the lower-severity ones it obviously causes. "Entire service down" should silence "checkout latency high" and every per-instance alert underneath it. This is what stops the alert storm where one failure produces forty notifications and buries the one that names the actual problem.

**Maintenance windows.** Planned work suppresses alerts for the affected scope, for a bounded time, with an automatic expiry. A silence with no expiry is how an alert disappears for a year.

Two rules about scheduling: on-call rotation tooling, escalation timers, and who is on the rota this week are employer-specific and out of scope for this course. What is in scope is that your alert carries an owning-team label and that you know which queue or rotation that label maps to.

## The annotation is half the alert

An alert that says `CheckoutLatencyHigh` and nothing else forces the responder to rebuild the context from scratch at the worst possible moment. The annotation block above is not decoration; it is the deliverable.

At minimum, every alert must carry: **what is happening** in plain language with the actual number; **what the impact is** on customers, so the responder can judge severity independently; **why this threshold** — the baseline sentence — so a responder who thinks it fired wrongly can evaluate that claim; **a runbook link**; **a dashboard link**; and **the first two or three things to check**.

A useful discipline: no alert reaches page severity without a runbook, and the runbook must contain at least one action. Writing the runbook is often what reveals that the alert is not actionable, which is a cheap way to discover it. Lesson 09 covers writing those runbooks and knowledge-base articles properly.

## Measuring the alerts themselves

Alerts are a system and they need their own review. Track, per month:

- **Volume** by severity and by service, and the trend.
- **Actionability rate** — what fraction of pages resulted in a human doing something. Below about 70 percent, the responders have already started ignoring the pager.
- **Time to acknowledge**, and whether it is growing. A rising acknowledgement time is the clearest measurable symptom of fatigue.
- **Missed incidents** — outages found by a customer rather than by an alert. Each one is a gap and each deserves a new or adjusted rule.
- **Top offenders** — the three noisiest rules. There is nearly always a small number producing most of the noise, and fixing them fixes most of the problem.

Then run a standing review, monthly or after each incident, with three permitted outcomes for every rule: keep it, tune it, or **delete it**. Deleting alerts must be normal and unremarkable. Teams that can only add rules end up ignoring all of them, which is the same as having none, but with more infrastructure.

A note on what this lesson deliberately does not cover: formally defining a service level objective and an error budget, and deriving alert thresholds from the rate at which that budget is being consumed, is the more rigorous version of step 4 above. It is a distinct practice with its own vocabulary, and it is not part of this course. Thresholds derived from observed baselines and a stated tolerance are defensible, portable, and enough to do the job.

## Where alerts live in the major clouds

| Concept | Amazon CloudWatch | Azure Monitor | Google Cloud Monitoring |
| --- | --- | --- | --- |
| Rule object | Alarm | Alert rule | Alerting policy |
| Condition on a metric | Metric alarm with statistic and period | Metric alert rule with aggregation | Metric-threshold condition |
| Condition on log content | Metric filter, then alarm | Log alert rule | Log-based metric, then policy |
| Duration requirement | Datapoints-to-alarm out of evaluation periods | Aggregation granularity and frequency | Duration on the condition |
| Missing data handling | Treat missing data as breaching, ignoring, or good | Alert on no-data setting | Missing-data policy on the condition |
| Combining several conditions | Composite alarm | Alert processing and multi-signal rules | Multi-condition policy |
| Delivery target | SNS topic | Action group | Notification channel |
| Suppression | Composite alarm suppressor | Alert processing rule, suppression | Snooze and notification rules |

The shape is identical everywhere: a condition, a duration, a missing-data policy, a severity, a routing target, and a suppression mechanism. Learn those six and you can configure alerting on any platform.

## Practice

Use the storefront's signal inventory from lesson 02 and the dashboard from lesson 05.

**Exercise 1 — Derive thresholds from a baseline.** Given this four-week baseline for the storefront, produce a threshold for each signal using the six-step method, showing your reasoning in one or two sentences each. Business input: checkout abandonment rises sharply above 2 s, and any error ratio above 1 percent is considered customer-visible.

| Signal | Quiet-hour typical | Peak-hour typical | 99th pct observed | Worst normal value |
| --- | --- | --- | --- | --- |
| Checkout p95 latency | 210 ms | 340 ms | 380 ms | 520 ms (during deploys) |
| Checkout 5xx ratio | 0.05% | 0.09% | 0.4% | 0.8% (one dependency blip) |
| DB pool in use (of 20) | 4 | 14 | 17 | 19 |
| Disk used on app volume | 62% | 62% | 64% | 71% (log burst) |
| Payment gateway p95 | 180 ms | 260 ms | 310 ms | 900 ms |

**Exercise 2 — Write six complete rules.** In the neutral YAML form above, write six alerts: three symptom-based page-severity rules, one predictable-exhaustion rule expressed as time to exhaustion rather than a level, one loss-of-visibility rule using the heartbeat metric, and one ticket-severity degradation rule. Each must include expression, duration, clear condition, missing-data behaviour, severity, owning team, and the full annotation block including the baseline justification and first checks.

**Exercise 3 — Backtest.** For each of your six rules, state how many times it would have fired over the last month given the baseline table, and for each firing say whether you would have wanted it. Adjust any rule whose useful fraction is below about three quarters, and record what you changed and why.

**Exercise 4 — Kill four alerts.** Here are six existing rules on this service. For each, decide keep, tune, or delete, and justify in one sentence. At least four should not survive in their current form.

1. `CPUAbove80Percent` on every instance, page severity, no duration.
2. `AnyErrorLogged` — fires on each ERROR line, page severity.
3. `DiskUsedAbove60Percent`, ticket severity, on a volume that normally sits at 62 percent.
4. `InstanceUnhealthy` on a single instance in an autoscaling group of six, page severity.
5. `NightlyReconciliationNoSuccessBy0600`, ticket severity.
6. `CheckoutLatencyAbove250ms`, page severity, no duration.

**Exercise 5 — Design the storm suppression.** The database becomes unreachable. List every alert from your set that would fire, in the order they would fire. Then write the inhibition rules that reduce that to one notification naming the real problem, and state what a responder loses by suppressing the rest.

**Exercise 6 — Write one runbook.** For your highest-severity alert, write the runbook it links to: what the alert means, who is affected, the first three checks with the exact query or dashboard panel for each, at least two possible causes with the action for each, what to do if none apply, and who to escalate to. Keep it to one page. Then answer honestly: if the answer to "what does the responder do" is "look at it and wait," should this rule be page severity at all?
