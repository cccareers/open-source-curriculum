---
course_id: de210
title: "Data Pipeline Automation & ETL Best Practices — Enhancement Review"
reviewed_lessons: 9
status: draft
---

## Summary

A mature, opinionated course that teaches orchestration as a set of guarantees (intervals, idempotency, gates, observability, lineage) rather than as a tool tour, with one running pipeline (`orders_daily`: orders API, `partner_x` drop, orders DB, dbt marts) extended lesson by lesson. The biggest risks are version drift — the course is written for Airflow 2.x and dbt pre-1.8 conventions while Airflow 3 and newer dbt are current — and a correctness bug in the event-driven dedupe sketch. The biggest opportunity is a fully local reference stack so learners without cloud access can complete every practice item.

## Clarity issues

| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| de210-03 | "Tasks and the TaskFlow API" | `extract_orders` calls `json.dumps` without importing `json`. | Added `import json`. | Applied |
| de210-08 | "Serverless functions" | Dedupe record written *before* the trigger: a failed trigger is then skipped on retry, silently losing the event. Also `raise_for_status()` on the expected 409 duplicate would push duplicates to the DLQ, contradicting the text. | Remove the processed-event gate before the trigger, treat 409 as success in code, and explain the ordering trap. | Applied |
| de210-07 | "Instrumenting the pipeline" (callbacks) | `sla` is an Airflow 2 feature removed in Airflow 3. | Version note added. | Applied |
| de210-03 | Throughout | Lesson states "Airflow 2.x"; Airflow 3 (2025) changed authoring imports (`airflow.sdk`), the REST API path (`/api/v2`), and the backfill CLI. | Add a short "If you are on Airflow 3" callout listing the three differences. | Proposed (verify against the program's Airflow version) |
| de210-05 / 06 | YAML test blocks | dbt 1.8+ prefers `data_tests:` (and adds unit tests); `tests:` still works but emits deprecation guidance in newer versions. | Add one sentence noting the newer key. | Proposed (verify against pinned dbt version) |
| de210-04 | "Source one: a REST API" | On 429 the loop `continue`s without incrementing `page`, so a permanently rate-limited endpoint loops forever despite the "hard loop cap". | Count 429 attempts or move the cap to total requests. | Proposed |
| de210-08 | "Serverless functions" | Airflow REST URL uses `/api/v1`, which is Airflow 2 only. | Covered by the Airflow 3 callout above. | Proposed |

## Depth and coverage gaps

- **No local reference stack.** Practice in lessons 3-9 assumes an Airflow environment and a warehouse. A documented Airflow standalone + dbt-duckdb + DuckDB setup lets every learner complete the work offline. Drafted as project x01. Objective: "Build an Airflow DAG with dependencies, retries, and idempotent tasks".
- **DAG tests are mentioned, not shown.** Lesson 3 recommends a DagBag pytest; x01 provides one. Worth inlining a 10-line version in the lesson.
- **Event-driven practice requires cloud.** A local emulation (MinIO bucket notifications to a local queue, or a filesystem watcher plus SQLite queue) would make lesson 8 doable without an account. Objective: "Trigger pipeline work from cloud events instead of a fixed schedule".
- **Monitoring practice lacks a seed failure set.** A provided set of injected failures (credential, timeout, schema change) with expected log lines would make lesson 7 item 9 comparable across learners. Objective: "Instrument a pipeline so that a failed or late run is detected and diagnosed quickly".
- **Column-level lineage tooling** is described but no tool is named for hands-on use; consider naming an open-source option and marking it optional. Objective: "Publish lineage and documentation that lets a consumer trace a column back to its source".

## Proposed additional projects

- **x01 orders_daily on a Laptop: Airflow + dbt + DuckDB with a Circuit Breaker** (drafted) — lessons 03-06.
- **x02 Event-Triggered partner_x Ingest with a Sweep, Locally** (drafted) — lessons 07-08; filesystem events, SQLite queue with DLQ, derived run ids, sweep DAG, pytest for duplicate and poison-message handling.
- The Wednesday Question: given a seeded change in `net_revenue`, produce the full trace (column, table, file, run, git sha). Not drafted.
- Alert routing tabletop: classify 20 signals into page/ticket/dashboard and write runbooks. Not drafted.

## Video and animation opportunities

- **Runs are named after the past** (de210-02/03) — hybrid. *Drafted: media/video-01-runs-are-named-after-the-past.md.*
- **Debugging a failed run in seven steps** (de210-07) — screencast. *Drafted: media/video-02-debugging-a-failed-run.md.*
- **Build, gate, swap** (de210-06) — explainer animation. *Drafted: media/animation-01-circuit-breaker-publish.md.*
- At-least-once delivery and derived run ids (de210-08) — explainer animation, pairs with `event-triggered-batch-flow.png`. Not drafted.
- Incremental model and the late-arriving record (de210-05) — explainer animation of `_ingested_at` vs `created_at`. Not drafted.
- Critical path in a model graph (de210-07/09) — animation. Not drafted.

## Assessment ideas

- "Find the now()" code review: five snippets, learner identifies interval violations.
- Idempotency proof: learner submits two runs' hashes for the same interval.
- Gate-consequence matrix: for ten checks, choose block / quarantine / warn / circuit-break and justify.
- Lineage trace rubric: column → model → source → file → run → commit, timed.

## Changes applied in this pass

- `03-building-dags-with-apache-airflow.md`, "Tasks and the TaskFlow API": added missing `import json`.
- `07-monitoring-alerting-and-debugging-runs.md`, "Instrumenting the pipeline": Airflow 2 vs 3 SLA note.
- `08-cloud-native-and-event-driven-pipelines.md`, "Serverless functions": handler removes the unsafe processed-event gate and treats HTTP 409 as a duplicate; added paragraph on 409 handling and the dedupe-before-trigger ordering trap.

## Open questions for the course owner

- Which Airflow major version will learners use? If 3.x, lessons 3, 7 and 8 need a version callout (imports, REST API, backfill CLI, SLA replacement).
- Which dbt version is pinned? Determines `tests:` vs `data_tests:` guidance and availability of unit tests.
- Which warehouse is the program's reference (lesson 5 examples mix Snowflake `payload:` syntax and BigQuery `partition_by`)? A single reference would reduce learner confusion.
- Confirm `cron-vs-orchestrator.png`, `dbt-model-layers.png`, and `event-triggered-batch-flow.png` exist in `img/`.
