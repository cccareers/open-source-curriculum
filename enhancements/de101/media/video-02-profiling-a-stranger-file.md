---
course_id: de101
media_id: de101-v02
type: video-script
title: "Profiling a File You Have Never Seen"
format: screencast
target_runtime: "7 min"
related_lessons:
  - de101-08
objectives:
  - Apply profiling and quality checks to a raw dataset before it is used downstream
competency_ids:
  - D2-S1-C01
---

## Purpose

After watching, the learner can profile an unfamiliar CSV in ten minutes, read the profile for the warning signs in lesson 8's table, and turn each finding into a decision (standardize, impute, flag, reject, escalate) before writing any transformation.

## Audience and prerequisites

de101 learners who have read lesson 8 through "Reading a profile", with Python, pandas, and SQLite available.

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | A file explorer showing `orders_export.csv`, 41,206 rows. A Slack-style message: "can you load this for the revenue dashboard by Friday?" | "Someone hands you a file and a deadline. The tempting move is to start writing the load. The professional move is ten minutes of profiling first." |
| 0:20 | Terminal: `head -3 orders_export.csv`. The first column header shows as `﻿order_id` when printed with `repr`. | "First, just look. Even three lines tell us something: there's a byte-order mark glued to the first header. If we'd split on commas and indexed by name, every lookup would have failed." |
| 0:45 | Notebook: `df = pd.read_csv("orders_export.csv", dtype=str, encoding="utf-8-sig")` | "Read everything as text, with utf-8-sig. Profiling describes what arrived, not what we wish arrived. Casting comes later." |
| 1:05 | Paste the `profile()` function from lesson 8; run `profile(df)`. Table appears. | "This is the profiler from lesson 8. One row per column: nulls, distinct values, min and max, lengths, top values." |
| 1:25 | Highlight `order_id`: rows 41,206, distinct 40,980. | "Order id isn't unique: two hundred and twenty-six extra rows. Before deciding what to do, we need to know if they're exact copies or two versions of a changing record." |
| 1:50 | Run `df[df.order_id.duplicated(keep=False)].sort_values("order_id").head(6)`. Pairs differ only in `order_status` and `updated_at`. | "Same order, different status, later updated_at. These are versions, not junk. The rule from lesson 8: keep the most recent per key, and count what you remove." |
| 2:15 | Highlight `order_status` top values: `paid=18,002; shipped=11,940; Paid=3,110; cancelled=2,004; canceled=611; PAID =87; payment_received=52; (empty)=9`. | "Now the ten-second query that pays for the whole lesson: what values does status actually take? Eight, not four. Three are capitalisation, one is spelling, one is a synonym, one is empty." |
| 2:45 | Write decision row: "order_status: standardize via explicit CASE; ELSE 'unknown'; escalate empty to source owner". | "Each finding becomes a decision, written down before any code. Status gets an explicit mapping, with unknown as the fallback so new values are countable, not invisible." |
| 3:10 | Highlight `order_total`: dtype object; min `"$1,004.20"`; max `"999.00"`; top value `-999`=37. | "Order total: text with dollar signs and thousands separators, which is why min and max look absurd — they're sorted as strings. And thirty-seven rows of minus nine nine nine." |
| 3:35 | Card: "-999 is a sentinel, not a refund." | "That's a sentinel: a stand-in for missing. Averaged in, it would drag revenue down and nobody would notice for a quarter. Decision: reject to quarantine, and ask the source what it means." |
| 4:00 | Highlight `placed_at`: max `2087-01-01`; a monthly count shows one row in 2087 and a cluster of rows exactly at `00:00:00`. | "Placed at: one order from 2087, and a suspicious number at exactly midnight. Midnight-for-everything usually means a time component was thrown away somewhere upstream." |
| 4:25 | Highlight `customer_id`; run SQL in SQLite after loading raw: `SELECT COUNT(*) FROM raw_orders r LEFT JOIN customers c ON c.customer_id = r.customer_id WHERE c.customer_id IS NULL;` returns 4. | "Relationships: four orders point at customers who don't exist. That number is a fact about the source, and the source owner should hear it." |
| 4:50 | Highlight `email`: `min_len` 9, `max_len` 41; `(df.email != df.email.str.strip()).sum()` = 212. | "Two hundred twelve emails with stray whitespace. That's the kind of thing that breaks a join and never throws an error." |
| 5:10 | Decision table on screen with 7 rows: column, finding, decision, reason, question for source owner. | "Seven findings, seven decisions, each with a reason. This table is the deliverable. The code that implements it is the easy part." |
| 5:45 | Findings memo draft: one page, three questions for the source owner. | "And three questions for the source owner: what does minus nine nine nine mean, why is there an order from 2087, and why do four orders reference unknown customers?" |
| 6:15 | Recap card: 1. Read as text. 2. Run the profiler. 3. GROUP BY every low-cardinality column. 4. Hunt sentinels and future dates. 5. Check keys and relationships. 6. Write decisions before code. | "Six steps, ten minutes. Then build the staging transformation from the decisions, not from the data." |
| 6:40 | End card linking to de101-x01. | "Project x01 gives you a file corrupted on purpose. Profile it blind first, then check what you missed." |

## On-screen assets and B-roll

- `orders_export.csv` produced by the de101-x01 generator with the injected faults (counts shown are illustrative; regenerate and update before recording).
- The lesson 8 `profile()` function and the decision-table template.

## Accessibility

- Captions; code and output provided as a notebook file.
- Highlights use outlined boxes with text labels ("duplicate", "sentinel"), not color alone.
- All counts read aloud; font size 18 pt minimum.

## Check for understanding

1. Why read every column as text when profiling? *Answer: so the profile shows what the source actually sent; casting first can hide or crash on bad values like "$1,004.20".*
2. A numeric column's most frequent value is `0` on an amount field. What should you suspect? *Answer: a sentinel standing in for missing data; confirm with the source before treating it as a real zero.*
3. Why map unknown status values to `'unknown'` instead of `NULL`? *Answer: so new or unexpected values stay countable and show up as a rising number rather than disappearing.*
