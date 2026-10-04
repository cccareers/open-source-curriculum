---
course_id: de102
media_id: de102-v01
type: video-script
title: "Reading a Plan: The Loops Trap and the Deepest Misestimate"
format: screencast
target_runtime: "8 min"
related_lessons:
  - de102-06
objectives:
  - Read an execution plan and name the operator responsible for a slow query
competency_ids:
  - D3-S1-C03
  - D5-S2-C01
---

## Purpose

After watching, the learner can multiply per-loop timings correctly, find the deepest estimate-versus-actual divergence, and write one sentence naming the culprit operator with the plan line that proves it.

## Audience and prerequisites

de102 learners who have finished lessons 5 and 6 and have the two-million-row `sales_order` table locally.

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Terminal: a query taking 6.1 seconds. Plan output scrolls past. | "This query used to take 40 milliseconds. Today it takes six seconds. The plan is right there. Most people read it wrong. Let's read it right." |
| 0:15 | The query on screen: `SELECT c.display_name, sum(o.total) FROM customer c JOIN sales_order o ON o.customer_id = c.customer_id WHERE c.state = 'TX' AND c.city = 'Austin' AND o.ordered_at >= '2025-06-01' GROUP BY 1;` | "Customers in Austin, Texas, and their June-onward revenue. Two tables, an index on `sales_order (customer_id, ordered_at)`." |
| 0:30 | `EXPLAIN (ANALYZE, BUFFERS)` output, zoomed. Highlight the tree indentation. | "A plan is a tree. Data flows up from the most indented nodes. Top-down tells you intent; bottom-up tells you what happened." |
| 1:00 | Highlight the line `-> Index Scan using sales_order_customer_id_ordered_at_idx ... (actual time=0.020..0.570 rows=4 loops=10000)` | "Here's the line people skip past. Point-five-seven milliseconds. Looks harmless. But read to the end: loops equals ten thousand." |
| 1:25 | Calculator overlay: 0.570 ms x 10,000 = 5,700 ms. | "Actual time and rows are per loop. Point-five-seven times ten thousand is five point seven seconds. That's nearly the whole runtime, hiding in a line that looks like half a millisecond." |
| 1:50 | Highlight the parent: `Nested Loop (actual time=... rows=40000 loops=1)` | "The parent is a Nested Loop. For every row from the outer side, it probes the index once. So the question becomes: why are there ten thousand outer rows?" |
| 2:15 | Highlight `Seq Scan on customer c (cost=... rows=200 ...) (actual ... rows=10000 loops=1)` and `Filter: ((city = 'Austin') AND (state = 'TX'))` | "Pass one of the four: find the misestimate. The planner expected two hundred customers. It got ten thousand. Fifty times off." |
| 2:45 | Whiteboard overlay (demo dataset: 4,000,000 customers, 400 cities spread evenly over 50 states): P(city=Austin) = 1/400, P(state=TX) = 1/50; independence assumed: 1/400 x 1/50 x 4,000,000 = 200 rows. But Austin implies TX, so the true count is 1/400 x 4,000,000 = 10,000. | "Why? The planner assumes columns are independent. It multiplies the selectivity of city by the selectivity of state. But every Austin is in Texas. The columns are correlated, so the product underestimates." |
| 3:20 | Back to plan. Arrow from the customer scan up to the Nested Loop. | "This is the deepest node where estimate and actual diverge. Everything above inherited a bad number. Nested Loop was a great choice for two hundred rows. It's a terrible choice for ten thousand." |
| 3:45 | Type: `CREATE STATISTICS customer_geo (dependencies) ON city, state FROM customer; ANALYZE customer;` | "The fix targets the cause, not the symptom. Extended statistics tell the planner city and state move together." |
| 4:10 | Re-run EXPLAIN ANALYZE. Customer scan now `rows=10000` estimate vs `rows=10000` actual. Join node is now `Hash Join`. Runtime 180 ms. | "Estimate now matches actual. With a correct row count, the planner picks a Hash Join: build a hash of ten thousand customers once, stream orders through it. One hundred eighty milliseconds." |
| 4:40 | Split screen: `SET enable_nestloop = off;` on the left with a red "diagnostic only" label. | "You could have forced this with enable_nestloop off. That's a great experiment and a terrible fix. It's global, and your data changes. Fix the statistics, not the planner." |
| 5:05 | Highlight `Buffers: shared hit=31204 read=88412` on the old plan vs `shared hit=2104 read=11950` on the new. | "Pass three: wasted work. Buffers tell the I/O story. The old plan read eighty-eight thousand pages from disk. The new one reads under twelve thousand." |
| 5:30 | Write-up template on screen: "Culprit: ___ node. Proof: ___ line. Cause: ___. Fix: ___." Filled in: "Culprit: Nested Loop driven by Seq Scan on customer. Proof: rows=40 estimated vs rows=10000 actual; inner Index Scan loops=10000 x 0.57 ms = 5.7 s. Cause: correlated city/state. Fix: CREATE STATISTICS (dependencies)." | "This is the deliverable from practice item 7. One sentence each: the culprit, the proving line, the cause, the fix." |
| 6:15 | Recap card: 1. Multiply by loops. 2. Find the deepest misestimate. 3. Check buffers. 4. Check for spills. | "Four passes. Multiply by loops. Find the deepest misestimate. Look for wasted work in buffers and rows removed. Look for spills. Then write the sentence." |
| 6:45 | End card pointing to the de102-x01 Slow Dashboard Query Clinic project. | "The query clinic project gives you three more plans to diagnose. Use this exact template." |

## On-screen assets and B-roll

- Two saved plans (before/after) as text files, shown with line highlighting.
- Calculator overlay; independence-assumption whiteboard.
- Demo dataset: a 4,000,000-row `customer` table with 400 cities evenly spread over 50 states (each city in exactly one state), joined to the lesson 5 `sales_order` table. Build it with `generate_series`; the de102-x01 seed uses the same correlation at smaller scale.

## Accessibility

- Captions; full plans provided as downloadable text.
- Highlights use a box outline plus an arrow, never color alone.
- Every number on screen is read aloud.
- Monospace font at 18 pt minimum; zoom on every plan line discussed.

## Check for understanding

1. A node shows `actual time=0.05..0.08 rows=2 loops=40000`. Roughly how long did it take in total? *Answer: about 0.08 ms x 40,000 = 3.2 seconds.*
2. Why fix the deepest misestimate rather than the slowest node? *Answer: nodes above it inherit its bad row count; the slow node is the symptom of a plan chosen on a wrong number.*
3. Why is `SET enable_nestloop = off` a poor permanent fix? *Answer: it is global to the session or server and does not adapt as data changes; it hides the cause rather than correcting the estimate.*
