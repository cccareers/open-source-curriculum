---
course_id: de210
media_id: de210-v01
type: video-script
title: "Runs Are Named After the Past: Data Intervals and Safe Backfills"
format: hybrid
target_runtime: "7 min"
related_lessons:
  - de210-02
  - de210-03
objectives:
  - Describe what an orchestrator guarantees that a cron job does not
  - Build an Airflow DAG with dependencies, retries, and idempotent tasks
competency_ids:
  - D1-S1-C01
  - D1-S1-C02
---

## Purpose

After watching, the learner can explain why a run executing at 02:00 on the 6th is labelled the 5th, rewrite a `now()`-based extract to use the injected data interval, and prove a task is idempotent before backfilling.

## Audience and prerequisites

de210 learners who have read lesson 2 and have the `orders_daily` DAG from lesson 3 running locally.

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Talking head, then a calendar graphic: March 5 shaded, a clock at 02:00 on March 6. | "Your daily pipeline runs at 2 a.m. on the sixth. Which day's data is it responsible for? If your answer is 'the sixth', this video will save you from corrupting history." |
| 0:20 | Calendar animates: the 5th's 24 hours fill with order dots; at midnight the interval closes; at 02:00 a run starts and a label "data interval: 2024-03-05" attaches. | "The fifth's data isn't complete until the fifth is over. So the run that starts on the sixth processes the fifth. Airflow labels the run with the interval it's responsible for, not with when it executed." |
| 0:50 | Screen: Airflow UI grid view for `orders_daily`, hover on a run showing `Data interval start: 2024-03-05 00:00`, `end: 2024-03-06 00:00`, `Run after: 2024-03-06 02:00`. | "Here it is in the UI. Data interval start, data interval end, and separately, when it actually ran." |
| 1:15 | Editor: the broken extract with `updated_after = datetime.now() - timedelta(days=1)`. | "Now the bug. This extract asks for 'the last day' using now(). On a normal night it happens to work." |
| 1:35 | Terminal: `airflow tasks test orders_daily extract_orders 2024-02-20`; output shows rows with `updated_at` today, written to `dt=2024-02-20`. | "Watch what happens when we re-run an old interval: February the twentieth. The task fetches today's data and writes it into February's folder. Nothing errored. History is now wrong." |
| 2:05 | Diagram: a backfill of 30 days, each folder filled with the same "today" data, labelled with 30 different dates. | "Backfill a month like this and you get thirty copies of today, each stamped with a different date. This is why the lesson says never use now() inside a task." |
| 2:25 | Editor: corrected function signature `def extract_orders(data_interval_start=None, data_interval_end=None)` and params using them. | "The fix: let Airflow inject the interval. The task becomes a pure function of its interval." |
| 2:45 | Terminal: same `tasks test` for 2024-02-20; output rows all within Feb 20; path `dt=2024-02-20`. | "Run February twentieth again. Now we get February twentieth's orders, in February twentieth's folder." |
| 3:05 | Talking head. | "Correct intervals are half the story. The other half is idempotency: running a task twice for the same interval must leave the same result as running it once." |
| 3:20 | Editor: the write uses a path keyed by interval, `.tmp` then `replace`. Then SQL load: `DELETE FROM staging.orders WHERE order_date = '{{ ds }}'; INSERT ...`. | "Two patterns from lesson 3. Write files to an interval-keyed path and atomically replace. Load tables by deleting the interval's slice and inserting it, inside one transaction." |
| 3:50 | Terminal: run `airflow tasks test` twice for 2024-03-05, then `duckdb warehouse.db "select count(*), sum(amount_usd) from staging.orders where order_date='2024-03-05'"` after each. Same numbers. | "Prove it before you trust it. Run the same interval twice and compare. Same count, same sum." |
| 4:15 | Contrast: an `INSERT`-only version run twice; count doubles. | "And here's the version that only inserts. Twice the rows. One retry at 3 a.m. and finance sees double revenue." |
| 4:35 | Terminal: `airflow dags backfill orders_daily --start-date 2024-03-01 --end-date 2024-03-07`; grid view fills green. | "Now backfilling is safe. Seven intervals, each a pure function of its own window, each replacing its own slice." |
| 5:00 | Terminal: run the backfill again; table hash before and after identical. | "Run the backfill again. The hash of the table doesn't change. That's the property you want before you ever backfill production." |
| 5:20 | Graphic: cron vs orchestrator column with the row "Parameterisation by time window" highlighted. | "This is the guarantee from lesson 2 that cron can't give you. Cron only knows now. An orchestrator hands every run the window it owns, and that's what makes reprocessing possible at all." |
| 5:45 | Checklist card: 1. Use injected interval. 2. Key outputs by interval. 3. Replace, don't append. 4. Run twice and compare before backfilling. 5. catchup=False; backfill on purpose. | "Five habits. Use the injected interval. Key every output by it. Replace, never append. Run twice and compare. And keep catchup off, so you backfill on purpose." |
| 6:20 | Talking head close. | "Next, do practice exercises 2 and 3 in lesson 3: prove idempotency, then break the interval on purpose so you recognise the symptom in the wild." |

## On-screen assets and B-roll

- `orders_daily` DAG and the de210-x01 fake orders API (so learners can reproduce the demo).
- Calendar/interval animation (scenes 0:00-0:50).
- DuckDB CLI for counts and a table hash (`select md5(string_agg(t::varchar, '' order by order_id)) from staging.orders t`).

## Accessibility

- Captions; all commands and code shown are provided as a text file.
- Calendar graphic uses labels ("data interval", "run after") as well as shading.
- Terminal font 18 pt; narration reads every count and date aloud.
- Version note on screen at 0:50: "UI shown: Airflow 2.x; labels differ slightly in Airflow 3."

## Check for understanding

1. A daily DAG's run executes at 02:00 on 2024-03-10. What is its data interval? *Answer: 2024-03-09 00:00 to 2024-03-10 00:00.*
2. Why does `WHERE created_at >= CURRENT_DATE - 1` break backfills? *Answer: a re-run of an old interval fetches the window relative to today, so it writes today's data under the old interval's label.*
3. What simple test should pass before you backfill a range? *Answer: run one interval twice and confirm the output (row counts, sums, or a hash) is identical to running it once.*
