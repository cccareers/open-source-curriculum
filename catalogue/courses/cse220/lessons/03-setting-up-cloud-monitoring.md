---
lesson_id: cse220-03
course_id: cse220
pathway: cloud-support-engineer
title: Setting Up Cloud Monitoring
order: 3
kind: lesson
competency_ids:
  - D6-S1-C01
objectives:
  - Configure monitoring and log collection for a cloud service
---

## From a list of signals to data on disk

You finished lesson 02 with an inventory: a table of signals, each one justified, each one with a rough idea of what bad looks like. That table is a specification. This lesson turns it into a working collection setup, which means answering four questions for every row — where does the measurement originate, what moves it off the machine, where does it land, and how long does it stay?

Getting this right is unglamorous and it is where most monitoring projects quietly fail. Not with an error, but with a gap: a service that was never instrumented, an agent that was installed but never given permission to publish, a log file that rotates faster than it ships, a retention setting that deletes the evidence three days before anyone goes looking for it. Every one of those is invisible until the moment you need the data, and at that moment it is too late to fix.

## The pipeline every provider builds

Whatever the product names, telemetry moves through the same five stages.

![How metrics, logs, and traces travel from a cloud workload through collection and storage to dashboards and alert routing](./img/telemetry-pipeline.png)

**Instrumentation** is where a measurement comes into existence. Three sources, in increasing order of effort and value: the platform emits some metrics about its own resources with no work from you; an agent installed on or beside the workload reads the operating system and any log files; and the application itself is instrumented in code to emit what only it knows.

**Collection** is the mechanism that gets a measurement from where it was produced to where it is stored. Two families here. In a **push** model the workload or its agent sends data outward on its own schedule — this is what nearly all managed cloud monitoring uses, because it works for ephemeral instances that appear and disappear and it does not require anything to be able to reach into your network. In a **pull** (or scrape) model the collector connects to each target on an interval and reads an endpoint — common in self-hosted metric stacks, and it needs service discovery to know what to scrape.

**Processing** is anything that happens in flight: parsing unstructured text into fields, dropping noisy lines, sampling, redacting secrets, adding resource labels, and turning log lines into counters.

**Storage** is the backend, and there are always at least two of them because metrics and logs have completely different shapes. A metric store is a time-series database optimized for range queries over numbers. A log store is an indexed document or text store optimized for search.

**Consumption** is dashboards, alert rules, ad hoc queries, and exports. Lessons 04, 05, and 06 all live here.

Draw this pipeline for your own service before you configure anything. Every gap you find on the diagram is a gap you would otherwise find during an incident.

## Platform metrics: free, and not enough

Every cloud emits metrics about the resources it manages, at no configuration cost. Instance CPU, network bytes, disk operations, load balancer request counts and response codes, managed database connections and replication lag, queue depth, storage bucket request rates.

Take all of it. It costs nothing and it is the substrate of every saturation signal you listed. But understand its two limits precisely, because misunderstanding them is a classic support failure.

The first limit is **resolution and delay**. Default platform metrics are typically aggregated at one-minute or five-minute granularity and land with a delay of a minute or more. A 40-second CPU spike that stalled every request may not appear at all in a five-minute average. When you are troubleshooting something short and sharp, this is exactly the thing that makes you say "the graphs look fine" while the customer is telling you it is not fine. Most providers offer higher-resolution collection at extra cost; decide which handful of metrics justify it rather than turning it on everywhere.

The second limit is **the hypervisor boundary**. The platform sees the outside of your virtual machine. It knows CPU and network and disk operations because it provides them. It does *not* know memory in use, disk space free, process state, or anything happening inside the guest — those require an agent. Learners routinely spend an hour looking for a memory graph that was never going to exist. Memory is an agent metric on every major cloud.

## Agents: what runs on the box

An agent is a small process running on the instance, or beside the container, that collects what the platform cannot see and ships it out. One agent typically does both jobs: host metrics and log files.

Configuration is provider-specific in syntax and identical in structure. Here is the shape, in a neutral form:

```yaml
metrics:
  interval: 60s
  collect:
    - cpu:    [user, system, iowait, steal]
    - memory: [used_percent, available_bytes]
    - disk:   [used_percent, inodes_used_percent]
      mounts: ["/", "/var/lib/app"]
    - diskio: [read_time, write_time, io_time, iops_in_progress]
    - net:    [bytes_sent, bytes_recv, err_in, err_out, drop_in, drop_out]
    - tcp:    [established, time_wait, retransmits]
  resource_labels:
    service: storefront
    environment: production
    region: "${REGION}"
    instance_id: "${INSTANCE_ID}"

logs:
  sources:
    - path: /var/log/app/application.log
      format: json
      destination: storefront-app
    - path: /var/log/nginx/access.log
      format: text
      parser: combined
      destination: storefront-access
  buffer:
    max_disk_bytes: 512MB
    retry: exponential
```

Every clause there earns its place, and the ones people omit are the ones that hurt.

`iowait` and `steal` are the two CPU sub-states worth calling out. High `iowait` means the CPU is idle because it is waiting for storage — a disk problem wearing a CPU costume. High `steal` means the hypervisor gave your cycles to somebody else, which is a noisy-neighbour or credit-exhaustion problem you cannot fix from inside the guest. Collecting only aggregate CPU percentage throws away both diagnoses. You will use them in lesson 07.

Disk metrics need explicit mount points. The default configuration on most agents collects the root filesystem and nothing else, so the data volume that actually fills up is unmonitored. `inodes_used_percent` matters as much as bytes: a filesystem with free space but no free inodes fails writes, and the error message never mentions inodes.

`io_time` and `iops_in_progress` are your storage saturation signals — how much of the interval the device was busy, and how deep the queue was. Read and write byte counts alone tell you throughput, not pressure.

The buffer clause is the one nobody configures until they have been burned. When the network path to the backend fails, an unbuffered agent drops everything, and you lose telemetry for exactly the period you most want to read. Give it disk buffer and a retry policy.

**Resource labels are the most consequential lines in the file.** These attach to every metric and every log line the agent ships, and they are what let you ask "show me this for the production storefront in this region" later. Getting them consistent across every workload is worth more than any individual metric. Agree the label set once — service, environment, region, availability zone, instance, version — and use exactly those names everywhere, including in your application code. The most common cause of an unanswerable query at three in the morning is one team writing `env: prod` and another writing `environment: production`.

For containers, the same agent exists as a sidecar or a per-node daemon, and the resource labels are usually populated automatically from orchestrator metadata. For serverless functions, there is no box to put an agent on: the platform captures whatever the function writes to standard output and standard error, plus invocation-level metrics. This is why writing structured lines to standard output is the most portable logging decision available.

## Instrumenting the application

Platform and agent metrics describe the machinery. They cannot tell you the checkout error ratio, because only your code knows what a checkout is. The symptom signals from lesson 02 — the ones you will actually alert on — almost all come from the application.

Three instrument types cover nearly everything:

A **counter** only goes up. Requests served, errors, messages processed, retries attempted. You never graph a counter directly; you graph its rate of change.

A **gauge** goes up and down and represents a current value. Connection pool in use, queue depth, active sessions, cache entries.

A **histogram** records a distribution by counting observations into buckets. Request duration, response size, batch size. This is the one that makes correct percentiles possible across many instances, because buckets add up and percentiles do not.

In a neutral form:

```python
requests_total = counter(
    "http_requests_total",
    labels=["route", "method", "status_class"],
)
request_duration = histogram(
    "http_request_duration_seconds",
    labels=["route", "method"],
    buckets=[0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
)
pool_in_use = gauge("db_pool_connections_in_use", labels=["instance"])

def handle(request):
    start = now()
    try:
        response = route(request)
        return response
    finally:
        requests_total.inc(
            route=request.route_pattern,
            method=request.method,
            status_class=f"{response.status // 100}xx",
        )
        request_duration.observe(now() - start,
                                 route=request.route_pattern,
                                 method=request.method)
```

Two details to internalize. The route label is the *pattern* (`/orders/:id`), never the concrete path (`/orders/8837291`) — concrete paths are unbounded cardinality and will destroy your metric store. And the status label is a class (`2xx`, `4xx`, `5xx`), not the exact code, unless you have a specific reason to need the code.

Choose histogram buckets deliberately. Buckets are fixed at definition time and you cannot compute a percentile more precisely than the bucket boundaries allow. If your service normally answers in 40 milliseconds and your lowest bucket is 1 second, every percentile you compute is a lie. Set boundaries around the range you actually care about, and put one well above your worst tolerable latency so you can see the overflow.

## Logs that a machine can read

Unstructured log lines were designed to be read by a person scrolling a terminal. You will be reading them with a query engine across millions of lines, and the difference matters enormously.

Compare:

```text
2026-03-14 14:32:07 ERROR Payment failed for order 8837291 after 3 tries (gateway timeout, 8104ms)
```

with:

```json
{"timestamp":"2026-03-14T14:32:07.412Z","level":"ERROR","service":"storefront","environment":"production","region":"us-east","instance_id":"i-0af2","trace_id":"4c1e9b7a","request_id":"req-77213","route":"/checkout","event":"payment_failed","order_id":"8837291","attempt":3,"duration_ms":8104,"downstream":"payment-gateway","error_class":"GatewayTimeout"}
```

Both contain the same facts. Only the second lets you ask, in one query, for the p95 of `duration_ms` grouped by `downstream` for `error_class = "GatewayTimeout"` over the last hour. The first requires a regular expression that will break the first time someone edits the message string.

Rules worth adopting as habits:

- **One event per line, valid JSON, no multi-line messages.** Stack traces are the exception and they need explicit multi-line handling in the agent config, keyed on a start pattern, or every frame arrives as a separate event.
- **Timestamps in ISO 8601 with a timezone, ideally UTC, with milliseconds.** Correlating two services whose clocks disagree, or whose logs are in local time, is a special kind of misery. Make sure time sync is running on every host; clock skew silently reorders your evidence.
- **Carry a request id and a trace id on every line.** This is what turns a pile of lines into a story. Generate one at the edge if the caller did not supply it, put it in the response headers, and propagate it to every downstream call.
- **Log levels mean something.** ERROR means a human should look. WARN means it is degraded but handled. INFO is the normal narrative. DEBUG is off in production except when you turn it on deliberately, for a bounded time, with a plan to turn it off.
- **Never log secrets, tokens, card numbers, or personal data.** Redact at the point of logging, not in the pipeline, because the pipeline is not the only reader. Assume anything logged is readable by everyone with console access.
- **Log the boundaries.** Every outbound call to a dependency should produce a line with the target, the duration, the outcome, and the attempt number. This single habit resolves more "is it us or them" arguments than any other.

## Turning logs into metrics

You do not alert on logs. You alert on metrics derived from logs, and every provider supports this under a different name.

The pattern is: define a filter that matches lines of interest, emit a counter each time a line matches, optionally extract a numeric field as the value and some low-cardinality fields as labels.

```yaml
log_derived_metric:
  name: payment_gateway_timeouts_total
  source: storefront-app
  filter: level = "ERROR" AND error_class = "GatewayTimeout"
  type: counter
  labels:
    downstream: $.downstream
    route: $.route
```

Now `payment_gateway_timeouts_total` is a normal metric. You can graph its rate, alert on it, and put it on a dashboard, and none of that requires scanning the log store. Two constraints: label fields must be low-cardinality just like any metric, and matching only applies to lines that arrive after the rule exists — a log-derived metric cannot see the past.

## Retention, sampling, and the bill

Telemetry cost is dominated by log volume, and log volume grows with traffic whether or not anyone reads it. Three levers, in the order you should reach for them:

**Retention tiers.** Metrics are small; keep them for a long time, usually with progressively coarser granularity as they age — full resolution for a week or two, five-minute rollups for a few months, hourly for a year or more. This is what makes "was this normal last quarter" answerable. Logs are large; the common split is 7 to 30 days in hot searchable storage and a longer archive in cheap object storage for compliance. Set retention deliberately per log stream. Debug logs at seven days and audit logs at seven years is a perfectly sane pair, and a single global setting cannot express it.

**Drop at the source.** Health-check requests from the load balancer can be 90 percent of your access log lines and contain no information. Filter them out in the agent, before they cross the network. Anything you drop at the source costs nothing in transit, storage, or query time.

**Sample the boring parts.** Keep 100 percent of errors and warnings, and a fraction of successful requests — 1 in 10, 1 in 100 — with the sampling rate recorded on each line so counts can be scaled back up. Never sample errors. Never sample audit records.

Set a budget before you turn collection on, and put your own telemetry spend on a dashboard. A monitoring bill that surprises the business is the fastest way to have your monitoring cut.

## Permissions, and the failure that looks like silence

An agent that cannot authenticate to the backend does not crash. It writes a line to its own log, on the box, that nobody is watching, and stops shipping. The dashboard goes flat and green.

So: attach an identity to the workload — an instance role, a managed identity, a service account — with permission to publish metrics and write logs, and nothing else. Do not put static credentials in the agent configuration file; every provider offers a workload identity mechanism precisely so you do not have to. Then verify from the console side, not the agent side, that data is arriving.

## Where this lands in the major clouds

| Task | Amazon CloudWatch | Azure Monitor | Google Cloud Monitoring |
| --- | --- | --- | --- |
| Host agent | CloudWatch agent | Azure Monitor agent | Ops Agent |
| What the agent config is called | Agent configuration JSON | Data collection rule | Ops Agent YAML |
| Log destination | Log group and stream | Log Analytics workspace table | Log bucket |
| Publish a custom metric | PutMetricData | Custom metrics API | Metric descriptor and time series write |
| Log to metric | Metric filter | Custom log-based rule | Log-based metric |
| Higher-resolution metrics | Detailed monitoring, 1-second custom metrics | Platform metric granularity setting | Custom metric sample period |
| Retention control | Per log group retention | Per table retention and archive | Per bucket retention |
| Workload identity | Instance profile IAM role | Managed identity | Service account |
| Route logs to cheap archive | Subscription filter to object storage | Diagnostic setting to storage account | Log sink to object storage |

Same five pipeline stages, three vocabularies. When you are asked to configure monitoring on a cloud you have not used, find the agent, the log destination, the custom metric API, the log-to-metric feature, and the retention control, and you have the whole map.

## Verifying, which is the actual job

Configuration is not collection. The work is finished when you have proven data is arriving, and there are four checks.

**Existence.** For every row in your lesson 02 inventory, run a query that returns a non-empty result over the last 15 minutes. A row that returns nothing is a gap, and this is the single most valuable half hour in the whole setup.

**Freshness.** Look at the newest timestamp for each stream. If it is ten minutes old, something is buffering or broken. Note the normal delay for each source so you know what abnormal looks like.

**Fidelity.** Generate a known event and find it. Send exactly 50 requests to a test route, then confirm the counter moved by 50. Force one error and find that specific line by its request id. Fill a scratch file to move disk-used-percent and watch it move. Until you have done this once, you do not know your pipeline works — you know it has not obviously failed.

**Continuity.** Emit a heartbeat metric on a fixed interval from every workload, and know how you would notice it stopping. This is the signal that distinguishes "healthy" from "blind," and lesson 06 turns it into an alert.

## Practice

Continue with the storefront from lesson 02 — virtual machines behind a load balancer, a managed relational database, a managed cache, a synchronous external payment provider, and a nightly reconciliation job.

**Exercise 1 — Map the pipeline.** For each of the five stages, list what plays that role for your service, with a separate row for platform metrics, agent metrics, application metrics, application logs, access logs, and job logs. Mark every stage you cannot fill in; those are your gaps.

**Exercise 2 — Write the agent configuration.** Produce a complete agent config in the neutral YAML style above, covering host metrics (including `iowait`, `steal`, memory, both filesystems, inodes, disk queue depth, and network errors), both log sources, buffering, and the full resource label set. State your collection interval and justify it in one sentence.

**Exercise 3 — Instrument the application.** Write the declarations for at least six application metrics covering the four golden signals plus connection pool saturation plus one business event. Use the correct instrument type for each, give explicit histogram buckets for latency, and list the label set for each metric with an estimated series count. Then write the checkout handler's instrumentation, including its outbound call to the payment provider.

**Exercise 4 — Redesign a log line.** Take this line and rewrite it as structured JSON with every field you would want, including correlation identifiers:

```text
2026-03-14 14:32:07 ERROR Payment failed for order 8837291 after 3 tries (gateway timeout, 8104ms)
```

Then write the log-derived metric definition that counts these by downstream and route, and say what the alert on it would look like in words.

**Exercise 5 — Retention and cost.** Assume 400 requests per second at peak, one access log line per request averaging 400 bytes, and application logs at 10 percent of access log volume. Estimate daily log volume. Then propose a retention policy per stream, one filter to drop at source, one sampling rule, and estimate the volume after both. Show your arithmetic.

**Exercise 6 — Write the verification plan.** For each of the four checks, write the exact query or command you would run and the result that would satisfy you. Include the deliberate-error test: how you will generate one known failure and locate that exact line by request id. Then answer in writing: if the agent lost permission to publish at 02:00, which of your four checks would catch it, and how long would it take?

Keep the configuration and the verification plan. Lesson 04 queries the logs you have just arranged to collect.
