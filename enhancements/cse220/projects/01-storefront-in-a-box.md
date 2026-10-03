---
course_id: cse220
project_id: cse220-x01
title: "Storefront in a Box: Signals, Dashboard, and Tested Alerts"
kind: supplementary-project
status: draft
hours_estimate: 8
difficulty: core
related_lessons:
  - cse220-03
  - cse220-05
  - cse220-06
objectives:
  - Configure monitoring and log collection for a cloud service
  - Build a dashboard that answers whether a service is healthy at a glance
  - Define alerts with thresholds that page a human only when action is required
competency_ids:
  - D6-S1-C01
  - D6-S1-C03
  - D6-S1-C04
---

## Scenario

The storefront you have used since lesson 02 needs a monitoring baseline before the team's first on-call rotation. Cloud budget is zero this quarter, so you will build a miniature, fully local version: a small checkout service with a fake database dependency and a fake payment provider, a load generator, Prometheus for metrics and alert rules, Grafana for the triage dashboard, and fault toggles so you can prove each alert fires when — and only when — it should. Everything runs in Docker on a laptop. The skills transfer directly to any managed cloud monitoring service; the lesson tables map each piece.

## What you will build / produce

- `docker-compose.yml` running: `storefront` (Python, instrumented), `loadgen`, `prometheus`, `grafana`, `alertmanager` (optional).
- `storefront/app.py` exposing `/checkout`, `/healthz`, `/metrics`, `/admin/fault` with the six instruments below, and JSON logs to stdout.
- `prometheus/rules.yml` — at least four alert rules (two symptom pages, one loss-of-visibility, one ticket).
- `prometheus/rules_test.yml` — `promtool` unit tests proving each rule fires and does not fire.
- `grafana/triage.json` — the five-row triage dashboard exported as code.
- `SIGNALS.md` — the lesson 02 inventory for this service (≥10 rows, all seven columns).
- `VERIFY.md` — the lesson 03 existence/freshness/fidelity/continuity checks with commands and results.

## Before you start (prerequisites, starter files or data)

- Docker with Compose v2, Python 3.10+, and `promtool` (ships in the Prometheus image: `docker run --rm --entrypoint promtool prom/prometheus ...`).
- Starter instrumentation (uses `prometheus_client` and Flask):

```python
import json, os, random, sys, time
from flask import Flask, jsonify, request
from prometheus_client import Counter, Gauge, Histogram, generate_latest, CONTENT_TYPE_LATEST

app = Flask(__name__)
FAULT = {"db_delay_ms": 0, "pay_error_ratio": 0.0, "pool_size": 20}

REQS = Counter("http_requests_total", "Requests", ["route", "method", "status_class"])
DUR = Histogram("http_request_duration_seconds", "Latency", ["route", "method"],
                buckets=[0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 0.7, 1, 2.5, 5])
DOWN = Histogram("downstream_call_duration_seconds", "Dependency latency", ["downstream"],
                 buckets=[0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5])
POOL_IN_USE = Gauge("db_pool_connections_in_use", "Pool in use")
POOL_SIZE = Gauge("db_pool_size", "Pool size")
HEARTBEAT = Gauge("storefront_heartbeat_timestamp_seconds", "Last heartbeat")

def log(**fields):
    fields.setdefault("timestamp", time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime()) + "Z")
    fields.setdefault("service", "storefront")
    print(json.dumps(fields), file=sys.stdout, flush=True)

def call(downstream, base_ms, extra_ms=0, error_ratio=0.0):
    start = time.time()
    time.sleep((base_ms + extra_ms) / 1000)
    ok = random.random() >= error_ratio
    DOWN.labels(downstream).observe(time.time() - start)
    log(event="downstream_call", downstream=downstream,
        duration_ms=round((time.time() - start) * 1000), outcome="ok" if ok else "error")
    return ok

@app.post("/checkout")
def checkout():
    start, status = time.time(), 200
    POOL_SIZE.set(FAULT["pool_size"])
    POOL_IN_USE.set(min(FAULT["pool_size"], int(FAULT["db_delay_ms"] / 50) + random.randint(2, 6)))
    try:
        call("orders-db", 20, FAULT["db_delay_ms"])
        if not call("payment-gateway", 120, 0, FAULT["pay_error_ratio"]):
            status = 502
        return jsonify(ok=status == 200), status
    finally:
        DUR.labels("/checkout", "POST").observe(time.time() - start)
        REQS.labels("/checkout", "POST", f"{status // 100}xx").inc()
        log(event="request_completed", route="/checkout", status=status,
            duration_ms=round((time.time() - start) * 1000))

@app.get("/healthz")
def healthz():
    return jsonify(status="ok")

@app.get("/metrics")
def metrics():
    HEARTBEAT.set(time.time())
    return generate_latest(), 200, {"Content-Type": CONTENT_TYPE_LATEST}

@app.post("/admin/fault")
def fault():
    FAULT.update(request.get_json(force=True))
    log(event="fault_changed", **FAULT)
    return jsonify(FAULT)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", "8080")), threaded=True)
```

- `loadgen` can be a shell loop that fires each request in the background so the pace does not depend on how fast checkout answers: `while true; do curl -s -o /dev/null --max-time 10 -X POST http://storefront:8080/checkout & sleep 0.05; done` (≈20 rps; a little under, because of loop overhead). Without the `&`, each iteration waits for the ~140 ms checkout to finish and you get about 5 rps — and far fewer once you inject the slow-DB fault, which would hide the very latency you are trying to see.
- Faults: `curl -X POST localhost:8080/admin/fault -d '{"db_delay_ms":900}'` (slow DB), `'{"pay_error_ratio":0.3}'` (payment errors), `docker compose stop storefront` (loss of visibility).

## Milestones

1. **Inventory first.** Write `SIGNALS.md` for this service before running anything; mark symptom vs cause.
2. **Stack up.** Compose file; Prometheus scrapes `storefront:8080/metrics` every 15 s; Grafana provisioned with Prometheus as a data source.
3. **Verify collection.** Run the four checks from lesson 03 and record them. Fidelity test: send exactly 50 requests with load stopped and show `increase(http_requests_total[5m])` moved by 50 (allow for scrape timing).
4. **Triage dashboard.** Five rows exactly as lesson 05 specifies, ≤14 panels, titles phrased as questions, threshold lines matching your alert rules, a "collection freshness" panel using `time() - storefront_heartbeat_timestamp_seconds`. Export to `grafana/triage.json`.
5. **Baseline.** Run load for 30 minutes; record p50/p95/p99 checkout latency and the error ratio. Derive thresholds with the six-step method; write the reasoning into each rule's `baseline` annotation.
6. **Rules.** `CheckoutLatencyHigh` (p95 > threshold for 5m), `CheckoutErrorRatioHigh` (ratio with a minimum-volume guard), `StorefrontTelemetryMissing` (`absent(up{job="storefront"} == 1)` or heartbeat age), and one ticket-severity degradation rule. Full annotation block on each.
7. **Unit tests.** `rules_test.yml` with at least one firing and one non-firing case per rule; `promtool test rules rules_test.yml` passes.
8. **Fault drills.** Inject the three faults one at a time; for each, screenshot the dashboard, record time-to-fire, and confirm the right alert (and only it) fires.
9. **Teardown.** `docker compose down -v`.

## Acceptance criteria

- [ ] `promtool check rules prometheus/rules.yml` passes.
- [ ] `promtool test rules prometheus/rules_test.yml` passes with ≥8 test cases.
- [ ] Every rule has `for`, severity, team, summary, impact, baseline, runbook, and first_checks.
- [ ] The error-ratio rule does not fire on 1 error in 4 requests (tested).
- [ ] Stopping the storefront fires the telemetry-missing alert, and the dashboard's freshness panel visibly differs from "healthy".
- [ ] Dashboard JSON committed; five rows; thresholds drawn.
- [ ] Each fault drill shows the expected alert and dashboard row.

## Automated checks (coding courses) / Evidence checklist (non-coding)

Sample rule and its unit test — learners extend to all rules:

```yaml
# prometheus/rules.yml
groups:
- name: storefront
  rules:
  - alert: CheckoutErrorRatioHigh
    expr: |
      (
        sum(rate(http_requests_total{route="/checkout",status_class="5xx"}[5m]))
        / sum(rate(http_requests_total{route="/checkout"}[5m]))
      ) > 0.02
      and sum(rate(http_requests_total{route="/checkout"}[5m])) > 1
    for: 3m
    labels: {severity: page, team: storefront-oncall}
    annotations:
      summary: "Checkout 5xx ratio above 2% for 3 minutes"
      impact: "Customers cannot complete purchases"
      baseline: "Normal ratio <0.1% over 30-minute baseline"
      runbook: "runbooks/checkout-errors.md"
      first_checks: "Dashboard row 3: payment-gateway errors? Row 5: recent deploy?"
```

```yaml
# prometheus/rules_test.yml
rule_files: [rules.yml]
evaluation_interval: 1m
tests:
- interval: 1m
  input_series:
  # 10 rps total, 3 rps errors -> 30% error ratio
  - series: 'http_requests_total{route="/checkout",status_class="2xx"}'
    values: '0+420x10'
  - series: 'http_requests_total{route="/checkout",status_class="5xx"}'
    values: '0+180x10'
  alert_rule_test:
  - eval_time: 2m
    alertname: CheckoutErrorRatioHigh
    exp_alerts: []                      # still inside the 3m 'for' window
  - eval_time: 9m
    alertname: CheckoutErrorRatioHigh
    exp_alerts:
    - exp_labels: {severity: page, team: storefront-oncall}
      exp_annotations:
        summary: "Checkout 5xx ratio above 2% for 3 minutes"
        impact: "Customers cannot complete purchases"
        baseline: "Normal ratio <0.1% over 30-minute baseline"
        runbook: "runbooks/checkout-errors.md"
        first_checks: "Dashboard row 3: payment-gateway errors? Row 5: recent deploy?"
- interval: 1m
  input_series:
  # Low traffic: 1 error in 4 requests per minute -> must NOT fire (volume guard)
  - series: 'http_requests_total{route="/checkout",status_class="2xx"}'
    values: '0+3x10'
  - series: 'http_requests_total{route="/checkout",status_class="5xx"}'
    values: '0+1x10'
  alert_rule_test:
  - eval_time: 9m
    alertname: CheckoutErrorRatioHigh
    exp_alerts: []
```

Run: `docker run --rm -v "$PWD/prometheus:/p" -w /p --entrypoint promtool prom/prometheus test rules rules_test.yml`.

## Rubric
| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Signal choice | Mostly cause signals | Inventory complete with symptom/cause split and justified "what bad looks like" | Cardinality estimated per metric; three cut signals justified |
| Collection | Data present but unverified | Four verification checks recorded with results | Fidelity test automated in a script |
| Dashboard | Default panel titles, no thresholds | Five rows, question titles, threshold lines, freshness panel | Passed a timed 30-second test with a peer, with changes recorded |
| Alerts | Thresholds guessed; no tests | Thresholds derived from baseline; all rules unit-tested | Hysteresis and inhibition demonstrated (Alertmanager) |
| Fault drills | One fault tried | All three faults fire exactly the expected alert | Time-to-detect measured and compared with the `for` clauses |

## Stretch goals
- Add Alertmanager with an inhibition rule so `StorefrontTelemetryMissing` suppresses the symptom alerts.
- Ship the JSON logs to Loki and add a log-derived panel for `downstream_call` errors.
- Add a time-to-exhaustion rule using `predict_linear` on a simulated disk gauge.

## Reflection prompts
- Which threshold was hardest to choose, and what business input would have made it easier?
- Did any alert fire that you would not want at 03:00? What did you change?
- What would change if this ran on a managed cloud monitoring service instead of Prometheus?

## Instructor notes (common pitfalls, how to adapt for time)
- Counters in `promtool` tests need cumulative values (`0+420x10`), not per-minute values — the most common test bug.
- `rate()` needs at least two samples in the window; very short test series produce empty results.
- Learners forget the volume guard and get flapping at low load; the second test case catches this.
- The starter's fake pool gauge is deliberately crude; it exists to give row 4 something to show. Better learners replace it.
- Short on time: skip Grafana provisioning and build the dashboard by hand, exporting JSON at the end.
