---
course_id: de210
media_id: de210-v02
type: video-script
title: "A Failed Run at 06:10: The Seven-Step Debugging Loop, Live"
format: screencast
target_runtime: "8 min"
related_lessons:
  - de210-07
objectives:
  - Instrument a pipeline so that a failed or late run is detected and diagnosed quickly
competency_ids:
  - D5-S2-C03
  - D1-S1-C03
---

## Purpose

After watching, the learner can work a failed Airflow run through lesson 7's seven steps — blast radius, classify, right log, reproduce narrowly, trace upstream, fix and reprocess, leave a trace — using the run-metadata table and audit columns rather than guesswork.

## Audience and prerequisites

de210 learners who have built `orders_daily` with `ops.pipeline_runs` (lesson 7 practice 1) and structured logging.

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Phone notification: "PAGE orders_daily: fct_orders not published by 06:00 (interval 2024-03-05). Task: transform.stg_orders. Error class: data_shape. Log: <link>. Runbook: §3." | "06:10. A page. Notice what it already tells us: the DAG, the interval, the task, an error class, a log link and a runbook section. That's the alert design from lesson 7 paying off." |
| 0:25 | Step 1 card "Blast radius". SQL: `SELECT data_interval, state FROM ops.pipeline_runs WHERE task_id='stg_orders' ORDER BY data_interval DESC LIMIT 5;` → 03-05 failed; 03-04, 03-03 success. | "Step one: blast radius. One interval or every interval since a deploy? Only the fifth failed. That points at bad data on one day, not a code change." |
| 0:55 | Same table: `SELECT git_sha FROM ops.model_runs WHERE data_interval IN ('2024-03-04','2024-03-05')` → same sha. | "Confirm: the same commit ran on the fourth and the fifth. Nobody shipped anything." |
| 1:15 | Step 2 "Classify". Airflow UI → task instance → attempt 3 log. Error: `Conversion Error: Could not convert string '12,40' to DECIMAL(18,2)`. | "Step two: classify. Read the error, and read attempt three, not attempt one. A type conversion failure: data-shape. The source sent something new." |
| 1:40 | Step 3 "Right log". Show the last successful structured log line before the error: `{"event":"extract_complete","source":"partner_x","rows":18240,...}` | "Step three: the last good line before the error. Extraction finished fine; staging choked on its input." |
| 2:00 | Step 4 "Reproduce narrowly". Terminal: `airflow tasks test orders_daily transform.stg_orders 2024-03-05` → same error. | "Step four: reproduce just this task for just this interval. It fails the same way locally, so it's data or code, not the environment." |
| 2:25 | Step 5 "Trace upstream". SQL on raw: `SELECT _source_file, _run_id, count(*) FROM raw.refunds WHERE _data_interval='2024-03-05' AND payload->>'refund_amount' LIKE '%,%' GROUP BY 1,2;` → `partner_x/2024-03-05/refunds_002.csv`, 14 rows. | "Step five: trace upstream with the audit columns. Fourteen rows, all from one partner file, written with a decimal comma: twelve comma forty. A locale change on their side." |
| 2:55 | Card: "Fix at the right level." Three options listed: ask partner to fix; handle locale in staging; loosen the check. | "Step six: fix at the right level. The source is the real cause, so we tell the partner with specifics. But finance needs today's numbers, so we also make staging tolerant — explicitly, for this source." |
| 3:25 | Code diff in `stg_refunds.sql`: replace `cast(refund_amount as decimal)` with a `case when refund_amount like '%,%' and refund_amount not like '%.%' then replace(...)` plus a dbt test `accepted_range` and a comment linking the incident. | "A targeted rule, a test that would have caught it, and a comment pointing at the incident note. No manual UPDATE on the mart; that would be undone by the next run and invisible to everyone." |
| 4:05 | Terminal: `airflow tasks clear orders_daily -t "transform\..*" -s 2024-03-05 -e 2024-03-05 --downstream --yes`. Grid view: tasks rerun green; publish swap succeeds. | "Clear the failed task and everything downstream for that interval. Because every task replaces its own slice, the rerun produces exactly what a clean run would have." |
| 4:35 | Query: `SELECT count(*), sum(refund_amount) FROM marts.fct_refunds WHERE refund_date='2024-03-05';` vs partner manifest total. Match. | "Reconcile against the source's own total before calling it fixed." |
| 4:55 | Step 7 "Leave a trace". Incident note template filled: what fired, cause, fix, intervals reprocessed, check added, partner contacted. | "Step seven: ten minutes on an incident note, and one new check. That's how the suite grows by one rule per incident." |
| 5:25 | Second, shorter case: run succeeds when reproduced locally but fails in the schedule. `ops.pipeline_runs` shows `error_class = timeout` and queued time 41 min; pool `orders_api` saturated by a backfill. | "A contrasting case. This one passes in `tasks test` but fails on schedule. That means environment: here a backfill saturated the API pool, the task queued for forty minutes and hit its timeout." |
| 6:00 | Fix: backfill pool slots and `max_active_runs`, plus a ticket-level alert on queue time. | "Different class, different fix: concurrency limits on the backfill, and a ticket-level alert on queue time so it's visible before it pages." |
| 6:30 | Summary card listing the seven steps and the one query or command used for each. | "Seven steps, one query or command each. The value isn't cleverness; it's doing them in order every time." |
| 7:00 | End card: lesson 7 practice item 9. | "Now inject three failures of your own and time each step." |

## On-screen assets and B-roll

- `orders_daily` from de210-x01 with `ops.pipeline_runs` and `ops.model_runs` populated; the partner drop generator modified to emit decimal commas for one file.
- Incident note template.

## Accessibility

- Captions; all SQL and commands provided as text.
- Step cards numbered and titled in text; failed/success states labelled, not color-only.
- Terminal and UI zoomed; every result read aloud.

## Check for understanding

1. The same task failed for the last six intervals starting the day of a deploy. What does that suggest? *Answer: a code or configuration change, not a one-day data problem; compare the git sha before and after.*
2. A task fails on schedule but passes with `airflow tasks test`. Where do you look? *Answer: environmental differences: concurrency, pools, permissions, resources, or races with other tasks.*
3. Why not fix the bad rows with a manual `UPDATE` on the mart? *Answer: the next run would overwrite it, it leaves no trace in code, and the cause upstream remains.*
