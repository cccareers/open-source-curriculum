---
course_id: de101
media_id: de101-v01
type: video-script
title: "The Grain Trap: Why Your Revenue Tripled"
format: screencast
target_runtime: "7 min"
related_lessons:
  - de101-03
  - de101-04
objectives:
  - Write SQL that joins, filters, and aggregates data across several tables
competency_ids:
  - D3-S1-C02
---

## Purpose

After watching, the learner can state the grain of any join result before aggregating and can fix an inflated sum by aggregating the many side first in a CTE.

## Audience and prerequisites

de101 learners who have finished lesson 3 (grain) and the "Joining across tables" section of lesson 4. They have a local database with the e-commerce schema.

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Cold open: a bar chart titled "Q1 revenue" with a value of $312,480, then a finance spreadsheet beside it showing $104,160. | "Two numbers for the same quarter. One is from finance, one is from a dashboard you built. The dashboard is exactly three times too high. Nothing errored. Let's find out why." |
| 0:20 | Editor with a tiny seed script. Three tables shown: `orders` (2 rows), `order_lines` (5 rows). | "To see the bug, we shrink the data until we can count it by hand. Two orders. Order 1001 has three lines, order 1002 has two." |
| 0:35 | Run: `ALTER TABLE orders ADD COLUMN order_total NUMERIC(12,2);` then `UPDATE orders SET order_total = 60 WHERE order_id = 1001; UPDATE orders SET order_total = 40 WHERE order_id = 1002;` | "Imagine the application stores a header total on each order. Order 1001 totals sixty dollars, order 1002 totals forty. True revenue: one hundred." |
| 1:00 | Type and run: `SELECT SUM(o.order_total) FROM orders o JOIN order_lines ol ON ol.order_id = o.order_id;` Result: 260. | "Now the innocent-looking query. Join orders to their lines, sum the order total. Two hundred and sixty." |
| 1:20 | Run the same join without SUM: `SELECT o.order_id, o.order_total, ol.line_number FROM orders o JOIN order_lines ol ON ol.order_id = o.order_id;` Five rows; highlight 60 repeating three times, 40 twice. | "Drop the SUM and look at the rows. Sixty appears three times, forty appears twice. The join changed the grain from one row per order to one row per order line, and the header total came along for every line." |
| 1:50 | Lower-third text: "After every join: what does one row mean now?" | "This is the habit from lesson 4. After every join, say out loud what one row now means. Here, one row is one order line. A header-level number summed at line grain is multiplied by the line count." |
| 2:15 | Diagram: a 1-to-N arrow from orders to order_lines, with the "1" side fanning out. | "The rule is mechanical. Joining from the one side to the many side repeats the one side. Any measure that lives on the one side is now unsafe to sum." |
| 2:40 | Fix 1 on screen: `SELECT SUM(order_total) FROM orders;` Result 100. | "Fix one: sum the measure at its own grain. If you only need order totals, do not join to lines at all." |
| 3:00 | Fix 2: CTE. `WITH order_totals AS (SELECT order_id, SUM(quantity * unit_price) AS order_total FROM order_lines GROUP BY order_id) SELECT c.state_code, SUM(t.order_total) FROM orders o JOIN order_totals t ON t.order_id = o.order_id JOIN customers c ON c.customer_id = o.customer_id GROUP BY c.state_code;` | "Fix two, for when you need line detail and order-level context together. Collapse the many side to one row per order first, in a CTE, then join. `order_totals` has order grain, so joining it to orders does not multiply anything." |
| 3:40 | Side-by-side: the wrong query vs the CTE query, both against the full practice dataset. Wrong: 312,480. Right: 104,160. | "Back on the full dataset. Same filter, same period. The CTE version matches finance to the cent." |
| 4:05 | A third query: `SELECT COUNT(*), COUNT(DISTINCT o.order_id) FROM orders o JOIN order_lines ol ON ol.order_id = o.order_id;` | "A quick detector you can run any time: compare COUNT(*) with COUNT(DISTINCT) of the key you think defines the grain. If they differ, rows were multiplied." |
| 4:30 | Show the lesson 3 fact table DDL; highlight the comment "grain: one row per product line on an order". | "This is why lesson 3 asked you to write the grain above every table. In a dimensional model, the fact table's grain tells you which columns are additive. `extended_price` is safe to sum. `unit_price` is not." |
| 5:00 | Run: `SELECT AVG(unit_price) FROM order_lines;` vs `SELECT SUM(quantity*unit_price)/SUM(quantity) FROM order_lines;` Two different values. | "Same trap, different shape: averaging a rate. The plain average treats a one-unit line and a hundred-unit line equally. The weighted average is what finance means by average price paid." |
| 5:40 | Checklist card: 1. State the grain. 2. Check COUNT vs COUNT DISTINCT. 3. Aggregate the many side first. 4. Never sum a rate. | "Four habits. State the grain. Check for multiplication. Aggregate the many side first. Never sum or plain-average a rate." |
| 6:10 | Back to the opening chart, now showing $104,160 and a green check beside finance. | "No error message will ever catch this for you. The defence is the habit. Pause here and run the deliberate-error exercise at the end of lesson 4 on your own data." |

## On-screen assets and B-roll

- Seed script (two orders, five lines) and the full practice dataset from lesson 4.
- Simple 1:N fan-out diagram (reuse the `star-schema-vs-normalized.png` style).
- Checklist end card.

## Accessibility

- Burned-in or sidecar captions; all SQL also provided as a text file.
- Repeated values (60, 60, 60) are highlighted with a box outline and a "x3" label, not color alone.
- Narration reads every numeric result aloud.
- Editor font at least 18 pt; no reliance on mouse hover.

## Check for understanding

1. You join `customers` (one row per customer) to `orders` and `SUM(customers.lifetime_value)`. What goes wrong? *Answer: lifetime value is repeated once per order, so the sum is inflated by each customer's order count.*
2. `COUNT(*)` returns 1,200 and `COUNT(DISTINCT order_id)` returns 400 on your join result. What is the grain? *Answer: not order; most likely order line, about three lines per order.*
3. Name the standard fix that keeps both line detail and an order-level measure correct. *Answer: aggregate the many side to the one side's grain in a CTE, then join.*
