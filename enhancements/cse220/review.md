---
course_id: cse220
title: "Monitoring, Troubleshooting, & Incident Response — Enhancement Review"
reviewed_lessons: 10
status: draft
---

## Summary
An excellent, coherent course built around one running example (the storefront checkout path) that carries from signal inventory to postmortem. The method content — symptom vs cause, percentile reading, bisection, mitigate-first, blameless postmortems — is accurate and practical. The biggest opportunity is a **ready-made, free lab environment**: every practice section assumes a monitored storefront with traffic, and the capstone needs fault injection, but learners are left to assemble that themselves. A docker-compose "storefront in a box" with Prometheus/Grafana and fault toggles, plus offline log case files, would make every exercise runnable and testable. A handful of factual slips were fixed.

## Clarity issues
| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| cse220-04 | "Query patterns" PromQL block | Comment said "compare each to the fleet median" but the query only computed mean latency per instance (using `max by`, which hid the arithmetic). | Replaced with a `sum by` per-instance mean, plus a second query dividing by the fleet median via `quantile`/`scalar`. | Applied |
| cse220-04 | "What a bottleneck actually is" | Queueing claim ("70→80 doubles") had no model behind it. | Added the `u/(1−u)` factor with four worked values. | Applied |
| cse220-07 | "Flow logs" provider table | Listed Azure "NSG on subnet" and Google "Hierarchical firewall policy" as subnet-level filters beside a heading about stateless ACLs; Azure NSGs are stateful and Google has no subnet ACL. | Corrected cells with statefulness and scope. | Applied |
| cse220-07 | "Storage layer" — object storage | "Eventual-consistency surprises on listings" contradicts cse101-05 (major object stores are now strongly consistent). | Replaced with stale content from caches/CDNs in front of a bucket. | Applied |
| cse220-08 | "Declare early" sample message | "22% … roughly 1 in 4 customers" — 22% is closer to 1 in 5, and it is attempts, not customers. | "roughly 1 in 5 checkout attempts is failing". | Applied |
| cse220-09 | "The postmortem" — contributing causes | Listed "a disk alert set at a static level" as a cause of the checkout/index incident; that belongs to lesson 07's disk incident. | Replaced with a cause that fits (staging too small to expose the full scan). | Applied |
| cse220-04 | "A worked investigation" vs cse220-09 record | Lesson 04 says slow checkout requests were "overwhelmingly 2xx"; lessons 08–09 describe the same incident as 22% 5xx. Plausible (pool exhaustion turns slow into errors) but unexplained. | Add one sentence in lesson 08 linking them: as the pool stayed pinned, request timeouts turned the slow tail into 500s. | Proposed |
| cse220-06 | "Where alerts live" table | Azure duration mapping ("aggregation granularity and frequency") omits the "number of violations" / evaluation-period setting that is the true duration analogue. | Verify current Azure Monitor terminology and adjust. | Proposed |

## Depth and coverage gaps
- **Runnable lab** ("Configure monitoring and log collection for a cloud service"; "Build a dashboard that answers whether a service is healthy at a glance"; "Define alerts with thresholds that page a human only when action is required"). No lesson supplies a service to monitor. Drafted as project x01 with `promtool test rules` as the automated acceptance check for alert logic.
- **Practice data for log analysis** ("Analyze logs and metrics to locate a performance bottleneck"). Exercise 2 in lesson 04 has one table; there is no raw log set to query. Drafted as project x02 (synthetic JSON logs with a hidden 16:00 bottleneck, answers checked by pytest).
- **Histogram bucket worked example** ("Configure monitoring and log collection for a cloud service"). Lesson 03 warns that coarse buckets make percentiles lie; a two-line numeric example (p95 reported as "≤1 s" when true value is 120 ms) would make it stick.
- **Alert unit testing** ("Define alerts with thresholds that page a human only when action is required"). Backtesting is described manually; Prometheus-style rule unit tests are a concrete, transferable way to do step 5 and are used in x01.
- **Escalation packet quality rubric** ("Document troubleshooting steps and escalate an unresolved issue to the right team"). Lesson 09 has a superb template; a checklist rubric (seven blocks, explicit ask, mitigation status first) would make peer review consistent.

## Proposed additional projects
- **x01 — Storefront in a Box: Signals, Dashboard, and Tested Alerts** (drafted).
- **x02 — Case File: The 16:00 Slowdown** (drafted).
- Flow-log case file: synthetic VPC flow log CSV with a subnet ACL that blocks return traffic; learner proves it with queries.
- Status-page writing drill with timed injects (tabletop, no infrastructure).
- KB article usability test exchange between cohorts.

## Video and animation opportunities
- **The first five minutes of an outage** — lesson 08; hybrid; tone, role announcements, and pacing are best modelled live. *Drafted: media/video-01-the-first-five-minutes.md.*
- **Split until the population splits** — lesson 04; screencast; the bisection queries on real data. *Drafted: media/video-02-split-until-it-splits.md.*
- **Why the average lies** — lessons 02/04; explainer animation; percentiles, tails, and why percentiles do not average. *Drafted: media/animation-01-why-the-average-lies.md.*
- **The queueing hockey stick** — lesson 04; explainer animation; utilization vs wait time. *Drafted: media/animation-02-queueing-hockey-stick.md.*
- Alert storm and inhibition — lesson 06; animation; not drafted.
- Flow log REJECT vs missing return flow — lesson 07; whiteboard; not drafted.

## Assessment ideas
- Percentile reading quiz using lesson 04 exercise 2 style tables with model answers.
- "Keep, tune, delete" alert triage set of ten rules with rationale key.
- Timed declaration drill: alert text in, declaration message out in 3 minutes, scored on the five required facts.
- Postmortem blamelessness check: highlight-and-rewrite exercise on a sample with five blaming sentences.

## Changes applied in this pass
- `04-reading-logs-to-find-bottlenecks.md`, "What a bottleneck actually is": added the `u/(1−u)` queueing factor.
- `04-reading-logs-to-find-bottlenecks.md`, "Query patterns you will use constantly": corrected the outlier PromQL and its comment.
- `07-troubleshooting-across-the-stack.md`, "Storage layer": replaced eventual-consistency claim.
- `07-troubleshooting-across-the-stack.md`, "Flow logs" table: corrected subnet-level filtering row.
- `08-responding-to-an-outage.md`, "Declare early" message: corrected impact phrasing.
- `09-documentation-escalation-and-postmortems.md`, "The postmortem": replaced the mismatched contributing cause.
- `02-signals-metrics-and-logs.md`: appended "Check your understanding".
- `06-designing-actionable-alerts.md`: appended "Check your understanding".

## Open questions for the course owner
- **Unverified**: current Azure Monitor naming for alert duration settings and for "VNet flow logs" (NSG flow logs are being retired in favour of VNet flow logs — confirm retirement date before stating it); Google Cloud Monitoring's current name for log-based alerting.
- Project x01 uses Prometheus, Grafana, and Alertmanager as the vendor-neutral stack. Confirm this is acceptable given the course's "generic strategies" framing; the lesson's PromQL-style syntax already leans this way.
- The capstone requires a sandbox with traffic; would you accept x01's compose stack as the official capstone environment? It would standardise grading and remove cloud cost entirely.
