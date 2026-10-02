---
lesson_id: cse220-02
course_id: cse220
pathway: cloud-support-engineer
title: Signals, Metrics, and Logs
order: 2
kind: lesson
competency_ids:
  - D6-S1-C01
objectives:
  - Choose the signals that tell you whether a cloud service is healthy
---

## Monitoring starts with a decision, not a tool

Every monitoring console you will ever open is happy to show you a thousand things. Instance count, CPU percentage, disk reads per second, garbage collection pauses, thread pool depth, bytes on the wire. Each of those numbers is true. Almost none of them, on its own, answers the question a customer actually asked, which is some version of "is your service working for me right now?"

The gap between "I have data" and "I know whether it is healthy" is the whole subject of this lesson. Before you configure a single agent — that is the next lesson — you have to decide what is worth collecting, and you have to be able to defend the list. A monitoring stack pointed at the wrong things is not neutral. It is worse than nothing, because it produces confident graphs that are all green while your users are timing out, and it teaches the team to distrust the graphs, which is the hardest damage to undo.

So: a **signal** is a measurement you have decided is evidence about the health of a service. The word "decided" is doing the work. CPU utilization becomes a signal when you can say what it would mean for it to be high on this particular service. Until then it is just a number you are collecting because the console offered it.

## The three kinds of telemetry

Almost everything you will collect falls into three shapes, and knowing which shape you need for a given question saves an enormous amount of time.

**Metrics** are numbers measured over time, at a regular interval, with a small set of labels attached. `http_requests_total` with labels for method, route, and status. `disk_used_bytes` with a label for mount point. Metrics are cheap to store because a measurement is a timestamp and a number, they are cheap to aggregate, and they are what you graph and alert on. What they cannot do is tell you about one specific request. A metric has already thrown away the individual events that produced it.

**Logs** are timestamped records of individual events, usually with text and structured fields. One line per request, per error, per state change. Logs answer "what happened to *this* customer's order at 14:32" — the question a metric can never answer. They cost far more per unit of information, they arrive with variable delay, and searching them at volume is slow compared with reading a metric.

**Traces** are records of one request's journey across multiple services, with timing for each hop. When a request touches five services and takes four seconds, a trace tells you which of the five spent the four seconds. Traces are the newest of the three and the least uniformly available; in support work you will often have them for some services and not others.

The practical rule: **metrics tell you that something is wrong and roughly where; logs and traces tell you why.** You alert on metrics, you investigate with logs, and you use traces when the boundary between services is the thing in question. Trying to alert on logs directly is a common beginner move and it is usually a mistake — it is slow, expensive, and noisy. What you do instead is derive a metric *from* logs (count of lines matching an error pattern, per minute) and alert on that. You will build one in lesson 03.

Alongside these three sit **events**: discrete, low-volume records of things that changed. A deployment. A configuration change. A scaling action. A failover. Events are not really telemetry about performance, but they are the single most valuable overlay you can put on a graph, because the answer to "why did the graph change shape at 14:07" is very often "because something was deployed at 14:06."

## The four signals that describe almost any service

There is a well-worn shortlist that works for essentially any request-serving system, and it is the right starting point for a signal inventory. Different traditions name them slightly differently, but the four are:

**Latency** — how long a request takes. Measured as a distribution, never as an average, for reasons below. Crucially, you should measure the latency of successful requests separately from failed ones, because a service that fails fast will show a *falling* average latency while it is breaking.

**Traffic** — how much demand is arriving. Requests per second, messages consumed per second, connections opened per second. Traffic is rarely a problem by itself, but nearly every other signal is uninterpretable without it. A 100-millisecond latency increase means one thing at 10 requests per second and something entirely different at 10,000.

**Errors** — the rate of requests that failed. Explicit failures like a 500 response, and implicit ones like a 200 response containing an error payload, or a response that arrived after the caller had already given up. Express this as a *ratio* of total traffic, not as a raw count, or every traffic spike will look like an incident.

**Saturation** — how full the most constrained resource is. Memory in use against memory available, queue depth against queue capacity, connection pool in use against pool size, disk against its provisioned throughput. Saturation is the leading indicator of the other three: it moves *before* latency and errors do, which is what makes it worth the trouble.

For resources rather than request handlers — a disk, a network interface, a CPU, a connection pool — a parallel shortlist applies: **utilization** (fraction of time busy), **saturation** (how much work is waiting), and **errors** (how many operations failed outright). A disk at 100 percent utilization with an empty queue is fine, it is simply always busy; a disk at 80 percent utilization with a queue depth of 40 is a bottleneck. Utilization alone will mislead you. Saturation is the one to watch.

## Symptoms and causes

Sort every candidate signal into one of two buckets before you do anything else with it.

A **symptom** signal describes what the user experiences: checkout latency, error ratio on the public API, successful logins per minute. A **cause** signal describes internal machinery: CPU on node 3, heap after garbage collection, replication lag, queue depth.

Both are worth collecting. They are not worth treating the same way. Symptoms are what you alert on and what belongs at the top of a dashboard, because a symptom is by definition user-visible and therefore worth someone's attention. Causes are what you investigate with, and they belong further down the screen. High CPU is not an incident. High CPU plus rising checkout latency is an incident with a lead.

This distinction is the single most effective noise filter available to you, and it comes back in lesson 06 when you design alerts. A team that alerts on causes gets paged for every busy node and eventually ignores the pager. A team that alerts on symptoms gets paged when users are affected, which is the whole point.

## Reading a distribution honestly

Latency is a distribution, and reducing a distribution to its average destroys the information you needed.

Consider a thousand requests. Nine hundred and ninety take 50 milliseconds. Ten take 8 seconds. The mean is about 130 milliseconds, which looks entirely acceptable and would sit calmly under most thresholds anyone would set. Meanwhile one customer in a hundred waited eight seconds, and if that customer's page makes twenty such calls to render, the odds that *they* saw at least one 8-second wait are close to certain.

So work in percentiles. The p50 (median) tells you the typical experience. The p90 and p95 tell you the experience of a meaningfully unlucky user. The p99 and p99.9 tell you about the tail, which is where saturation, retries, lock contention, and cold starts live. A useful habit is to watch p50 and p99 side by side: p50 flat with p99 climbing means a subset of requests is suffering — a shard, an instance, a cache miss path. Both climbing together usually means a shared resource is saturated.

Two cautions. First, percentiles do not average. If you have p99 latency per instance, the mean of those numbers is not the fleet p99 and can be wildly wrong; you need the underlying histogram to aggregate correctly, which is why histogram-type metrics exist. Second, a percentile over a long window hides short events. A p99 computed over 24 hours will barely move for a 5-minute disaster.

## Labels, cardinality, and the bill

Metrics carry labels — sometimes called dimensions or tags — that let you slice by route, region, instance, or status. Labels are what make a metric answer "which one?" instead of only "how much?"

The cost is **cardinality**: the number of distinct label-value combinations. Every combination is a separate time series to store, index, and query. Ten routes times five status codes times three regions is 150 series, which is nothing. Add a label for customer id with 50,000 values and you have 7.5 million series, a query engine that times out, and a bill that gets someone's attention.

The rule is: **label with things that have a small, bounded set of values, and that you would actually group by.** Route, method, status class, region, availability zone, environment, service name, instance — all fine. User id, request id, session id, full URL with query string, error message text, timestamp — never. Those belong in logs, which are built to hold high-cardinality detail, and which you can search by exactly those fields when you need one specific event.

## Coverage: the things people forget

Once you have the four signals for your own service, walk outward. A support engineer's inventory should also include:

- **Dependencies.** For every service, database, cache, queue, and third-party API you call: latency, error rate, and traffic *as seen by you, the caller*. The provider's own status page is not a substitute. You want to know what your calls experienced.
- **Capacity limits and quotas.** Cloud resources have ceilings — provisioned IOPS, network throughput per instance size, API request quotas, connection limits, burst credit balances. Each ceiling is a saturation signal, and hitting one produces symptoms that look nothing like a ceiling if you are not measuring it.
- **Certificate and credential expiry.** Days remaining is a signal. Certificate expiry is the most predictable outage in computing and it still happens constantly.
- **Backup and job success.** Batch jobs, backups, and scheduled tasks need a signal for "did it run, did it succeed, how long did it take." A job that silently stops running produces no error at all — the absence of a success signal is the signal.
- **Deployments and configuration changes.** As events, overlaid on everything else.
- **The monitoring system itself.** If collection stops, every graph goes flat and calm. Flat and calm looks exactly like healthy. You need a heartbeat.

That last one deserves a moment. "No data" and "no problems" render identically on most dashboards, and confusing them has ruined a lot of nights. Decide now, for every signal, what missing data means and how you would notice it.

## Where these ideas land in the major clouds

The concepts above are portable. The vocabulary is not. Here is the same set of ideas in the three large providers, so you can recognize what you are looking at whichever console you are dropped into.

| Concept | Amazon CloudWatch | Azure Monitor | Google Cloud Monitoring |
| --- | --- | --- | --- |
| Numeric time series | Metric | Metric | Metric |
| Grouping key on a series | Dimension | Dimension | Label |
| Namespace for related metrics | Namespace (`AWS/EC2`) | Metric namespace | Metric type (`compute.googleapis.com/...`) |
| Log destination | Log group and log stream | Log Analytics workspace, table | Log bucket and log view |
| Log query language | Logs Insights query syntax | Kusto Query Language | Logging query language |
| Metric derived from log lines | Metric filter | Log-based alert or custom metric rule | Log-based metric |
| Percentile support | Extended statistics on metrics | Percentile aggregation | Distribution-valued metrics |
| Distributed traces | X-Ray | Application Insights | Cloud Trace |
| Custom application metric | Custom metric via PutMetricData | Custom metric | Custom or user-defined metric |

Note the pattern: all three have a numeric-series store, a text-log store, a way to turn log lines into a numeric series, and a query language for each. When you meet a fourth provider, or a self-hosted stack, look for those four things and you will be productive quickly.

## Writing the signal inventory

The deliverable that comes out of this thinking is a short table, one row per signal, and it is worth insisting on the columns because each one forces a decision you would otherwise skip.

| Signal | Type | Symptom or cause | Source | Labels | Why it matters | What "bad" looks like |
| --- | --- | --- | --- | --- | --- | --- |
| Checkout request latency p99 | Metric | Symptom | App instrumentation | route, region | Users abandon slow checkouts | Above 1.5s for 5 minutes |
| Checkout error ratio | Metric | Symptom | App instrumentation | route, status class | Failed purchases lose revenue directly | Above 1% of requests |
| Requests per second | Metric | Context | Load balancer | route | Makes the other two interpretable | No threshold; context only |
| Payment API call latency p95 | Metric | Cause | Client-side timer | dependency | Slow dependency is our top cause | Above 800ms |
| Database connection pool in use | Metric | Cause (saturation) | App instrumentation | instance | Pool exhaustion stalls all requests | Above 85% of pool |
| Order-processing exceptions | Log-derived metric | Cause | Application log | error class | Names the failing code path | Any sustained non-zero rate |
| Nightly reconciliation job success | Event | Symptom | Job runner | job name | Silent failure is invisible otherwise | No success event by 06:00 |
| Collection heartbeat | Metric | Meta | Monitoring agent | host | Distinguishes "no data" from "no problem" | Missing for 10 minutes |

The last two columns are the ones people leave blank, and they are the ones that matter most. "Why it matters" is what you will be asked in review, and a signal you cannot justify should be dropped. "What bad looks like" is the first draft of an alert threshold — you will refine it against observed baselines in lesson 06, but writing a guess down now tells you whether the signal is even actionable.

A signal that fails both columns is collection for its own sake. Cut it. Every signal has an ongoing cost in storage, in query time, and in the attention of whoever is looking at the screen, and attention is the scarcest of the three.

## Practice

Pick one real service you can describe concretely. If you have one running from cse203, use it. If not, use this: a public web storefront running on a group of virtual machines behind a load balancer, reading and writing a managed relational database, caching sessions in a managed in-memory store, calling an external payment provider synchronously during checkout, and running a nightly batch job that reconciles orders against the payment provider's records.

**Exercise 1 — Draw the request path.** In plain text or on paper, write the path a checkout request takes, naming every component it touches in order, including the external payment provider. Mark each hop where a failure would be visible to the customer. You will need this map again in lesson 07; keep it.

**Exercise 2 — Build the signal inventory.** Produce a table with the seven columns shown above and at least fourteen rows. It must include, at minimum: all four of latency, traffic, errors, and saturation for the storefront itself; at least one signal for every dependency in your path from exercise 1, measured from the caller's side; at least one capacity or quota limit; the batch job; and a collection heartbeat. For every row, fill in "why it matters" and "what bad looks like" in one sentence each.

**Exercise 3 — Justify and cut.** Now add three signals you believe should *not* be collected for this service, and write one sentence each explaining why they would cost more attention than they return. Real candidates: per-customer request counts, average latency alongside the percentiles you already have, per-container CPU on an autoscaled tier.

**Exercise 4 — Cardinality check.** For each metric row in your table, multiply out the plausible number of values for each label to estimate its series count. Flag any row exceeding roughly 1,000 series and either bound the label or move that detail to logs. State which you chose and why.

**Exercise 5 — Symptom and cause split.** Reorganize your table into two lists. Then answer in writing: if you were allowed to alert on only three of these signals, which three, and what does that tell you about the difference between the two lists?

Keep the finished inventory. Lesson 03 configures collection for exactly these signals, and lesson 05 puts the symptom half of the list on a screen.
