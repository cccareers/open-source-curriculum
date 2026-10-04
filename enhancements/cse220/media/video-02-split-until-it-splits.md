---
course_id: cse220
media_id: cse220-v02
type: video-script
title: "Split Until the Population Splits"
format: screencast
target_runtime: "8 min"
related_lessons:
  - cse220-04
objectives:
  - Analyze logs and metrics to locate a performance bottleneck
competency_ids:
  - D1-S1-C03
---

## Purpose
After watching, the learner can use time bucketing and group-by splits on structured logs to localize a latency regression to a specific downstream, and corroborate it with a saturation signal.

## Audience and prerequisites
Apprentices in lesson 04. Uses the `storefront.jsonl` dataset from project cse220-x02 and DuckDB in a terminal (the same filter → aggregate → sort pattern as the lesson's pipeline syntax).

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Ticket: "Storefront slow every afternoon 16:00–17:00." | "A vague ticket. We're going to turn it into a finding with five queries and no guessing." |
| 0:15 | DuckDB prompt. Query: `SELECT strftime(ts,'%H:%M') m, quantile_cont(duration_ms,0.95) p95, count(*) n FROM r WHERE route='/checkout' GROUP BY m ORDER BY m;` (with `r` a view over `read_json_auto` filtered to `request_completed`, `ts` cast from timestamp). Output scrolls: ~290 ms until 15:59, ~3,500 at 16:00, back at 17:00. | "Step one: state the symptom precisely. p95 for checkout, per minute. Flat at about 290 milliseconds, then a cliff at exactly 16:00, recovery at 17:00. Traffic, the n column, unchanged. So: a sharp start, not a surge." |
| 1:10 | Same query, `quantile_cont(...,0.5)` alongside. p50 rises much less. | "Median moves a little, p95 moves a lot. That's a tail problem — a subset of requests is suffering. The question is always: *which* subset?" |
| 1:40 | `GROUP BY route` for 16:00–17:00. `/checkout` and `/cart` slow; `/product/:id` normal. | "Split by route. Checkout and cart are slow. Product pages are fine. That's huge: product pages are a control group. Whatever this is, product pages don't touch it." |
| 2:20 | `GROUP BY instance_id`. All six similar. Text overlay "NOT one bad instance". | "Split by instance. All six the same. Not one bad node — write that down as a NOT line. Negative results are evidence." |
| 2:50 | Downstream query: `SELECT downstream, quantile_cont(duration_ms,0.95) FROM calls WHERE hour=16 GROUP BY 1` vs hour 14. orders-db p95 up to roughly a second; payment-gateway unchanged. | "Split by downstream, using the outbound call lines. Payment gateway: unchanged. Not them. Orders database: slower too — around a second at p95 — but that doesn't add up to three and a half seconds." |
| 3:40 | Pick 20 slow checkout requests; table: duration_ms, db_ms, pay_ms, db_pool_wait_ms. Pool wait dominates. | "So where did the time go? Follow it. Twenty slow requests, account for every millisecond. Database call: about thirty-five milliseconds on most of them. Payment: 180. Pool wait: the largest share. Requests are queueing *for a connection* before they ever reach the database." |
| 4:40 | Query: `SELECT strftime(ts,'%H') h, quantile_cont(db_pool_wait_ms,0.95) FROM r GROUP BY h`. Zero except hour 16. | "Corroborate with a saturation signal. Pool wait, by hour: zero all day, large at 16:00. That's the constraint — and it explains why product pages are fine. They don't use the pool." |
| 5:20 | Query: `SELECT * FROM read_json_auto('storefront.jsonl') WHERE event NOT IN ('request_completed','downstream_call');` → one row: `job_started sales-report owner_team analytics 16:00:00.0xx`. | "Last step: what changed? Search for anything that isn't a request. One line: the sales-report job starts at 16:00, owned by analytics. It's holding database connections for an hour." |
| 6:00 | Finding paragraph typed into FINDING.md. | "The finding: checkout and cart p95 rises from 290 ms to 3.5 s from 16:00 to 17:00 daily. All instances equally; product pages unaffected; payment unchanged. Requests wait for database connections while the sales-report job runs. Constraint: connection pool. Confidence: high. Check: move the job or give it its own pool — p95 should return to baseline." |
| 6:50 | On screen: "Falsify it: run the 16:00 window on a day the job didn't run." | "And before you send it, run the query that could prove you wrong. If p95 rises on a day the job didn't run, you're wrong." |
| 7:20 | Recap: State → Baseline → Bound → Split → Follow the time → Corroborate → Write. | "State it, baseline it, bound it, split it until it splits, follow the time, corroborate, write it down." |

## On-screen assets and B-roll
- DuckDB CLI, 18pt; prepared views `r` (request_completed) and `calls` (downstream_call) so queries fit on screen.
- Small table overlay for the 20-request duration accounting.

## Accessibility
- Captions; every result number is spoken.
- Query output tables are also provided as CSV.
- No colour-only encoding: slow rows are marked with an asterisk column in overlays.

## Check for understanding
1. Why is `/product/:id` valuable even though it's healthy? *Answer: It is a control group — it shares most of the stack but not the pool, so its health narrows the cause.*
2. Database call latency rose only slightly, yet requests got 3 s slower. Where did the time go? *Answer: Waiting for a pool connection before the call started.*
3. What single query would most likely disprove the hypothesis? *Answer: The same 16:00 window on a day the job did not run; if latency still rises, the job is not the cause.*
