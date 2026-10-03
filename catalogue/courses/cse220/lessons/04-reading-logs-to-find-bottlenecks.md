---
lesson_id: cse220-04
course_id: cse220
pathway: cloud-support-engineer
title: Reading Logs to Find Bottlenecks
order: 4
kind: lesson
competency_ids:
  - D1-S1-C03
objectives:
  - Analyze logs and metrics to locate a performance bottleneck
---

## What a bottleneck actually is

A bottleneck is the one resource that, if you relieved it, would make the system faster — and nothing else would. That definition sounds pedantic until you watch a team spend a day adding instances to a service whose real constraint was a single-threaded lock, and end the day with the same latency and a bigger bill.

Systems have exactly one bottleneck at a time. There may be several tight spots, but one is tightest, and work spent anywhere else is wasted. So the job in this lesson is not "make it faster." The job is **locate the constraint and prove it**, using the metrics and logs you arranged to collect in lesson 03. You will hand that finding to someone who fixes it — sometimes yourself, often another team, which is lesson 09's subject.

Two ideas make the search tractable.

The first is **queueing**. Latency is service time plus waiting time. Service time is how long the work takes when a resource is free; waiting time is how long the request sat in line. As a resource approaches full utilization, waiting time does not rise gently — it rises hyperbolically. Going from 70 to 80 percent utilization roughly doubles queueing delay; going from 90 to 95 doubles it again. The simplest queueing model makes the shape concrete: average waiting time is proportional to `u / (1 − u)`, where `u` is utilization. At 50 percent that factor is 1; at 80 percent it is 4; at 90 percent, 9; at 95 percent, 19. The last ten points of utilization cost more waiting than the first ninety. This is why "CPU is only at 85 percent, that's fine" is wrong, and why saturation signals move before latency does. The shape of the curve is the single most useful thing to have in your head during a performance investigation.

The second is **the tail**. When a slow subset exists — one bad instance, one unindexed query, one cold cache path — the mean barely moves and the high percentiles move a lot. So you always look at the distribution, and when the distribution has spread out, your next question is always "spread out for *which* requests?" That question is the entire method.

## The investigation loop

Work this loop deliberately. It stops you from tinkering, which is what a performance investigation degenerates into when it has no structure.

**1. State the symptom precisely.** Not "it's slow." Which operation, seen by whom, how slow compared to what, since when. "The p95 of `/checkout` rose from 220 ms to 3.4 s starting at 14:05 today, for all regions, while p50 stayed at 190 ms." That sentence took a few queries to write and it has already ruled out several causes: it is a tail problem, not a whole-service problem, and it started abruptly.

**2. Confirm it in the data.** Do not investigate a symptom you have not reproduced in the telemetry. Sometimes the report is wrong, or it is about a different route, or the clock in the report is in a different timezone. Confirming costs two minutes and saves hours.

**3. Establish the baseline.** Same query, same time window, seven days earlier. "Slow" only means anything relative to normal, and same-hour-last-week is a far better comparison than an hour ago, because it controls for daily and weekly traffic patterns.

**4. Bound it in time.** Find the change point as tightly as you can, then list every event near it: deployments, configuration changes, scaling actions, dependency incidents, traffic shifts, scheduled jobs. Most performance regressions are changes, and most changes are recent. This is the highest-yield step in the loop and people skip it because it feels like cheating.

**5. Split by dimension until the population splits.** Group the slow measurement by every label you have — route, instance, availability zone, customer tier, status class, dependency — and look for a grouping where one bucket is bad and the others are fine. Each split either localizes the problem or eliminates a hypothesis. This is bisection, and it is the core technique.

**6. Follow the time.** Once you have the smallest population that is slow, pull individual slow events and account for their duration. Where did the milliseconds go? Downstream calls, lock waits, garbage collection, queueing before the handler ever started?

**7. Corroborate with a saturation signal.** A cause you cannot see in a resource metric is a hypothesis, not a finding. If you claim the connection pool is exhausted, show the pool-in-use gauge pinned at its ceiling for the same window.

**8. Write the finding.** One paragraph: symptom, scope, evidence, most likely constraint, confidence, and what would confirm or refute it. Write it as you go, not at the end.

## Query patterns you will use constantly

Every log query language does the same four things in the same order: **filter, parse, aggregate, sort**. Learn the shape and the syntax becomes a lookup.

```text
source <stream>
| filter <predicate>
| parse <extract fields from text>          # only for unstructured lines
| stats <aggregations> by <grouping fields>
| sort <field> desc
| limit <n>
```

Here it is against the storefront's structured application log, in a neutral pipeline syntax. The comments are the point — the pattern, not the punctuation.

```text
# 1. Where is the time going, by route?
source storefront-app
| filter environment = "production" and event = "request_completed"
| stats count() as n,
        pct(duration_ms, 50) as p50,
        pct(duration_ms, 95) as p95,
        pct(duration_ms, 99) as p99,
        max(duration_ms) as worst
  by route
| sort p95 desc
```

```text
# 2. Is one instance responsible? (the single most useful split)
source storefront-app
| filter route = "/checkout" and event = "request_completed"
| stats count() as n, pct(duration_ms, 95) as p95 by instance_id
| sort p95 desc
```

```text
# 3. When did it change? (bucket by time to find the change point)
source storefront-app
| filter route = "/checkout" and event = "request_completed"
| stats pct(duration_ms, 95) as p95, count() as rps_proxy by bin(1m)
| sort bin asc
```

```text
# 4. Which downstream call is eating the request?
source storefront-app
| filter event = "downstream_call" and trace_id in (<slow trace ids>)
| stats count() as calls, sum(duration_ms) as total_ms, pct(duration_ms,95) as p95
  by downstream
| sort total_ms desc
```

```text
# 5. Error ratio, expressed as a ratio (never a raw count)
source storefront-app
| filter event = "request_completed"
| stats count() as total,
        countif(status_class = "5xx") as errors
  by bin(1m), route
| eval error_ratio = errors / total
| sort error_ratio desc
```

On the metric side, the same questions in a generic PromQL-style syntax:

```promql
# p95 latency by route, from a histogram, computed correctly across instances
histogram_quantile(
  0.95,
  sum by (route, le) (rate(http_request_duration_seconds_bucket[5m]))
)

# error ratio by route
sum by (route) (rate(http_requests_total{status_class="5xx"}[5m]))
  / sum by (route) (rate(http_requests_total[5m]))

# connection pool saturation, as a fraction of capacity
max by (instance) (db_pool_connections_in_use) / max by (instance) (db_pool_size)

# is one instance the outlier? mean latency per instance, side by side
sum by (instance) (rate(http_request_duration_seconds_sum[5m]))
  / sum by (instance) (rate(http_request_duration_seconds_count[5m]))

# ...and the same thing divided by the fleet median, so the outlier reads as "3.2x"
(sum by (instance) (rate(http_request_duration_seconds_sum[5m]))
  / sum by (instance) (rate(http_request_duration_seconds_count[5m])))
/ scalar(quantile(0.5,
    sum by (instance) (rate(http_request_duration_seconds_sum[5m]))
  / sum by (instance) (rate(http_request_duration_seconds_count[5m]))))
```

Four habits that separate a fast investigation from a slow one. **Always bound the time window** — an unbounded query over a log store is slow and expensive and you rarely need it. **Filter before you aggregate**, on the most selective field first, so the engine discards early. **Count before you look** — run a `count() by` grouping before pulling raw lines, so you know whether you are about to read 12 lines or 12 million. And **save the query that worked**, with a comment saying what it answered; the same investigation recurs, and a saved query library is the most undervalued artifact in support work.

## Reading resource saturation

Once the log queries have localized the problem, resource metrics tell you which constraint is binding. Know the tells.

**CPU.** Utilization alone is not enough; you need the split. High `user` time is your code doing work. High `system` time is syscall or network overhead. High `iowait` means the CPU is idle waiting on storage — chase the disk, not the CPU. High `steal` means the hypervisor is not giving you the cycles, which on a burstable instance type usually means you exhausted your credit balance and the whole class is now throttled. Run-queue length above the core count means threads are waiting for a CPU, and that is the saturation signal; utilization near 100 percent with a run queue of zero is a fully-used machine keeping up fine.

**Memory.** The number that matters is *available*, not *free* — page cache is reported as used and is reclaimable. Watch for a steady climb that never falls back, which is a leak, and for a working set that no longer fits, which shows up as a collapsing cache hit rate and rising read traffic to disk. On a container, memory pressure ends abruptly: the runtime kills the process and the evidence is an out-of-memory kill event, not a graceful error in your log. Restart counts are a memory signal.

**Disk.** Throughput and IOPS tell you how much work is happening; **average wait time and queue depth** tell you whether the device is keeping up. A managed volume has a provisioned ceiling, and some volume types run on burst credits that deplete after sustained load — a service that is fine for three hours and then falls off a cliff with no code change is very often a depleted burst balance. Also check free space and free inodes; both produce failures that read as application bugs.

**Network.** Bytes in and out against the instance-size bandwidth ceiling. Then the error counters: dropped packets, interface errors, and TCP retransmissions. A retransmission rate that rises with load is a real signal. Connection tracking tables and ephemeral port exhaustion are the two limits that produce the most confusing symptoms, because they present as intermittent connection failures with no error anywhere in the application.

**The application's own queues.** Thread pools, connection pools, work queues, and the accept backlog. These are where queueing shows up first and most legibly. A connection pool at its ceiling with requests waiting is not a subtle diagnosis — it is the answer, and it is the most common one in a service that talks to a database.

## Is it us or them?

Half of all support performance investigations end in "the dependency was slow." Proving it takes one habit, which lesson 03 asked you to adopt: log every outbound call with its target, duration, outcome, and attempt number.

With that, the arithmetic is simple. For a sample of slow requests, sum the downstream durations and compare with the total request duration. If a 3.4-second checkout contains 3.1 seconds of payment-gateway call, your service is fine and you have an escalation to write. If it contains 200 milliseconds of downstream calls and 3.2 seconds unaccounted for, the time is being spent inside your process or waiting to get into it.

Three traps here. **Timeouts and retries multiply.** A 1-second timeout with three retries is a 3-second floor, and the log will show three `downstream_call` lines for one request — count attempts, not calls. **Retries under load make things worse**, because the dependency that is struggling now receives triple the traffic; a sudden rise in the retry rate is itself a signal. And **queueing before your handler is invisible** unless you measure it: if the load balancer holds a request for two seconds before an instance accepts it, your application's own timer starts late and reports a fast request while the customer waited. Compare load-balancer-observed latency to application-observed latency; the gap is queue time, and a large gap points at capacity, not code.

## A worked investigation

A support ticket at 14:40: "Checkout has been taking forever since about two o'clock. Some orders go through fine."

**State it.** Query 3 above, on `/checkout`, bucketed by minute over four hours. The p95 is flat at 210 ms until 14:05, then steps to 3.2 s and stays there. The p50 rises only from 190 ms to 240 ms. Traffic is unchanged. So: a tail problem, sharply beginning at 14:05, affecting a minority of requests. "Some orders go through fine" is consistent and is now a data point rather than a vague remark.

**Baseline.** Same window last Tuesday: flat 210 ms. Not a weekly pattern.

**Bound it.** The deployment log shows a release at 13:58. That is seven minutes before the change point — suspicious, and worth noting, but not proof. Nothing else changed.

**Split.** By instance: all six instances show the same p95. Not one bad node. By availability zone: identical. By status class: the slow requests are overwhelmingly `2xx` — they succeed, just late. By customer tier: identical. By downstream, using query 4 on a sample of slow trace ids: the `payment-gateway` calls are 180 ms at p95, unchanged; the `orders-db` calls are 2.9 s at p95, up from 40 ms.

The population has split. It is the database path.

**Follow the time.** Pull twenty individual slow requests and read them end to end. Each shows one `downstream_call` to `orders-db` with `duration_ms` around 2,900, `attempt: 1`, outcome success. So it is not retries and not a timeout — one query is genuinely taking three seconds.

**Corroborate.** Database CPU is at 96 percent, up from 30. Disk read throughput on the database volume is up fivefold. The connection pool gauge on the application instances is pinned at its ceiling of 20 with a non-zero wait count — which explains why the *median* also moved a little: even fast requests now sometimes wait for a connection. The database's slow-query log shows a new query shape appearing at 14:04 doing a full table scan on `orders`.

**The finding.** A query shape introduced in the 13:58 release scans the `orders` table without an index. Each execution takes about 2.9 seconds and saturates database CPU and disk reads. The application connection pool then fills, adding a smaller delay to unrelated requests. Constraint: database read capacity, caused by a missing index. Confidence: high. Confirmation: the query shape appears in the slow-query log starting at 14:04 and does not appear before the release; adding the index or reverting the release should return p95 to about 210 ms.

Notice what that paragraph does *not* do. It does not add database capacity, and it does not raise the connection pool size — both would have made the graph look slightly better and left the constraint in place. It also does not blame anybody. It names a change, states the evidence, and offers a falsifiable prediction. That is a finding, and it is what a fix owner or an escalation needs.

## Common wrong turns

**Confirming the first hypothesis.** You think it is the cache, you query the cache, you find something that looks odd, you stop. Run the split that would *disprove* it. If the cache is the cause, non-cached routes should be unaffected; check.

**Chasing a correlated metric.** CPU rose at the same time as latency. In a saturating system, everything rises together. Direction of causation comes from ordering in time and from the queueing story, not from co-movement.

**Averaging a percentile.** Taking the mean of per-instance p99s is not the fleet p99. Aggregate the histogram.

**Using too wide a window.** A five-minute event vanishes in a one-hour bucket. When hunting a change point, narrow to one-minute or ten-second buckets.

**Ignoring the fast half.** If p50 moved a little and p99 moved a lot, both facts are evidence. In the worked example, the small p50 rise is what pointed at the shared connection pool.

**Fixing before you have finished.** Restarting the instances at 14:20 would have cleared the pool, produced ten minutes of improvement, destroyed the evidence, and taught everyone the wrong lesson.

## Practice

Use the storefront, its signal inventory from lesson 02, and its collection setup from lesson 03.

**Exercise 1 — Build the query library.** Write the six queries above against your own field names, in the pipeline style, plus three more of your own: one that finds the slowest single requests with their trace ids; one that counts distinct error classes per hour; and one that compares load-balancer-observed latency with application-observed latency to expose queue time. Save them with a one-line comment each saying what question they answer.

**Exercise 2 — Read a distribution.** Given these hourly figures for `/checkout`, write a two-sentence interpretation of each hour and say which hours you would investigate and why.

| Hour | Requests | p50 (ms) | p95 (ms) | p99 (ms) | 5xx ratio |
| --- | --- | --- | --- | --- | --- |
| 09:00 | 84,000 | 190 | 240 | 310 | 0.1% |
| 10:00 | 96,000 | 195 | 250 | 320 | 0.1% |
| 11:00 | 91,000 | 192 | 1,900 | 4,100 | 0.1% |
| 12:00 | 88,000 | 610 | 2,400 | 4,600 | 0.2% |
| 13:00 | 44,000 | 180 | 220 | 290 | 6.1% |
| 14:00 | 92,000 | 205 | 265 | 340 | 0.1% |

**Exercise 3 — Work a case to a finding.** A report arrives: "the storefront is slow every afternoon between 16:00 and 17:00, and it has been for a week." You have all the telemetry from lesson 03. Write the investigation as a numbered plan following the eight-step loop, giving the exact query you would run at each step and, for each, the two possible results and what each would rule in or out. Then, for the three most plausible causes, state which saturation signal would corroborate it.

**Exercise 4 — Is it us or them.** Given a sample of 50 slow requests, describe the exact procedure that decides whether the time is inside your service or in a dependency, including how you handle retries and how you detect queue time before the handler. Then write the one-paragraph finding for each of the two outcomes.

**Exercise 5 — Write the finding.** For the worked example above, or for a real investigation of your own, write the finding paragraph: symptom, scope, evidence with specific numbers, most likely constraint, confidence, and the check that would confirm or refute it. Keep it under 200 words. Then delete every sentence that is not evidence or inference and see what survives — that is the version you would send.

**Exercise 6 — Falsify yourself.** Take your favourite hypothesis from exercise 3 and write the single query most likely to prove it wrong. Getting comfortable running that query is the difference between an investigator and a guesser.
