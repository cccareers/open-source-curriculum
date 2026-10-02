---
lesson_id: de101-04
course_id: de101
pathway: data-engineer
title: Relational Databases and SQL
order: 4
kind: lesson
competency_ids:
  - D3-S1-C01
  - D3-S1-C02
objectives:
  - Write SQL that joins, filters, and aggregates data across several tables
---

## The relational database, briefly

A relational database stores data as tables of rows and columns, enforces rules about that data, and lets you retrieve it by describing *what* you want rather than *how* to fetch it. The last part is what makes SQL worth learning once and using everywhere: you write a description of the result set, and the database's query planner decides how to produce it.

Three properties of relational systems matter to you as a data engineer.

**The schema is enforced.** A column typed `INTEGER` cannot hold `"N/A"`. A `NOT NULL` column cannot be empty. A foreign key cannot point at a row that does not exist. These are guarantees you get for free, and they are the reason a relational store is still the default for data that must be correct.

**Transactions are atomic.** A group of statements wrapped in a transaction either all take effect or none do. The usual shorthand is ACID: **atomicity** (all or nothing), **consistency** (constraints hold before and after), **isolation** (concurrent transactions do not see each other's half-finished work), and **durability** (once committed, it survives a crash). When you write a load that deletes yesterday's rows and inserts today's, wrapping both in one transaction is the difference between a brief failure and an empty table in production.

**Indexes change the cost of a query without changing its meaning.** An index is an auxiliary structure that lets the database find rows matching a condition without scanning every row. Filtering or joining on an indexed column is typically fast; doing it on an unindexed column in a large table is typically slow. Indexes cost storage and slow down writes, so they are added deliberately. You will go much deeper into performance in the next course; for now, the working knowledge you need is that *joins and filters on keys are cheap because keys are indexed*, and that wrapping a column in a function — `WHERE UPPER(email) = '...'` — usually prevents the index from being used.

The examples below use the e-commerce schema from the previous lesson: `customers`, `addresses`, `categories`, `products`, `orders`, and `order_lines`.

## Reading one table

Every query starts with the same skeleton.

```sql
SELECT
  order_id,
  customer_id,
  order_status,
  placed_at
FROM orders
WHERE placed_at >= DATE '2024-01-01'
  AND order_status <> 'cancelled'
ORDER BY placed_at DESC
LIMIT 20;
```

`SELECT` names the columns, `FROM` names the table, `WHERE` filters rows, `ORDER BY` sorts, `LIMIT` truncates. Avoid `SELECT *` in anything you save: it hides which columns you actually depend on, and it breaks silently when the source adds or reorders columns.

### Filtering precisely

The operators you will use constantly:

```sql
WHERE order_status IN ('paid', 'shipped')          -- set membership
  AND placed_at BETWEEN DATE '2024-03-01'
                    AND DATE '2024-03-31'          -- inclusive on both ends
  AND email LIKE '%@example.com'                   -- pattern match
  AND shipping_address_id IS NOT NULL              -- null test
```

`AND` binds tighter than `OR`, so any condition mixing them needs parentheses. `WHERE a = 1 AND b = 2 OR c = 3` does not mean what a casual reader assumes; write `WHERE a = 1 AND (b = 2 OR c = 3)` and remove the ambiguity.

### Nulls will bite you

`NULL` means *unknown*, not zero and not empty string, and it propagates through everything it touches. `NULL = NULL` is not true — it is unknown — which is why you must write `IS NULL` and `IS NOT NULL`. Arithmetic involving `NULL` yields `NULL`. A `WHERE` clause keeps a row only when the condition evaluates to true, so `WHERE state_code <> 'OH'` silently drops every row where `state_code` is null.

```sql
-- Assume order_lines also carries a nullable discount_amount column.
-- Treat a missing discount as zero for the calculation only.
SELECT
  order_id,
  unit_price * quantity - COALESCE(discount_amount, 0) AS net_amount
FROM order_lines;
```

`COALESCE` returns its first non-null argument. Use it when a null genuinely means zero — and *do not* use it when the null means "we never received this value," because filling that in with a zero fabricates data. Deciding which is which is a data quality judgement, and the last lesson of this course is about making those judgements deliberately.

### Derived columns and CASE

```sql
SELECT
  order_id,
  placed_at,
  CASE
    WHEN order_status = 'cancelled'          THEN 'lost'
    WHEN placed_at >= CURRENT_DATE - 30      THEN 'recent'
    ELSE                                          'historic'
  END AS order_bucket
FROM orders;
```

`CASE` evaluates top to bottom and stops at the first match, so order the branches from most specific to least. Always give a derived column an explicit alias — an unnamed expression column arrives downstream with a database-generated name that differs between engines.

## Joining across tables

A join combines rows from two tables using a condition, almost always an equality between a foreign key and the primary key it points at.

### Inner join

Keeps only rows with a match on both sides.

```sql
SELECT
  o.order_id,
  o.placed_at,
  c.full_name,
  c.email
FROM orders AS o
JOIN customers AS c ON c.customer_id = o.customer_id
WHERE o.placed_at >= DATE '2024-01-01';
```

Table aliases (`o`, `c`) are not decoration; once four tables are in play, unqualified column names become ambiguous and unreadable. Qualify every column with its alias.

### Left join

Keeps every row from the left table, filling the right side with nulls where there is no match. This is how you ask "and how many had none?"

```sql
SELECT
  c.customer_id,
  c.full_name,
  o.order_id
FROM customers AS c
LEFT JOIN orders AS o ON o.customer_id = c.customer_id
WHERE o.order_id IS NULL;   -- customers who have never ordered
```

There is one trap here that catches nearly everyone. A condition on the *right* table belongs in the `ON` clause, not the `WHERE` clause. Putting it in `WHERE` filters out the null-filled rows and silently converts your left join back into an inner join:

```sql
-- WRONG: behaves like an inner join
LEFT JOIN orders AS o ON o.customer_id = c.customer_id
WHERE o.order_status = 'paid'

-- RIGHT: keeps customers with no paid orders, showing nulls
LEFT JOIN orders AS o ON o.customer_id = c.customer_id
                     AND o.order_status = 'paid'
```

`RIGHT JOIN` is the mirror image and is rarely used — flip the table order and use `LEFT` instead, so every join in a query reads the same direction. `FULL OUTER JOIN` keeps unmatched rows from both sides, and is genuinely useful when reconciling two systems that are supposed to agree. `CROSS JOIN` produces every combination of rows; it is occasionally deliberate (generating a complete date-by-store grid) and is otherwise the accidental result of forgetting a join condition.

### Multi-table joins and the grain trap

```sql
SELECT
  o.order_id,
  c.full_name,
  p.product_name,
  cat.category_name,
  ol.quantity,
  ol.unit_price
FROM orders      AS o
JOIN customers   AS c   ON c.customer_id  = o.customer_id
JOIN order_lines AS ol  ON ol.order_id    = o.order_id
JOIN products    AS p   ON p.product_id   = ol.product_id
JOIN categories  AS cat ON cat.category_id = p.category_id
WHERE o.order_status <> 'cancelled';
```

Read the grain of that result: **one row per order line**, not one row per order. Joining a one-to-many relationship multiplies rows on the "one" side. If `orders` had an `order_total` column and you wrote `SUM(o.order_total)` against this result, you would count each order's total once per line it contains and overstate revenue, sometimes by a factor of three.

This is the single most common correctness bug in analytical SQL, and the defence is a habit: after every join, say out loud what one row now means. If a join changed the grain and you did not intend it, either aggregate the many side first or move the measure to the level where it belongs.

## Aggregating

```sql
SELECT
  cat.category_name,
  COUNT(*)                          AS line_count,
  COUNT(DISTINCT o.order_id)        AS order_count,
  SUM(ol.quantity)                  AS units_sold,
  SUM(ol.quantity * ol.unit_price)  AS revenue,
  AVG(ol.unit_price)                AS avg_unit_price
FROM orders      AS o
JOIN order_lines AS ol  ON ol.order_id    = o.order_id
JOIN products    AS p   ON p.product_id   = ol.product_id
JOIN categories  AS cat ON cat.category_id = p.category_id
WHERE o.order_status <> 'cancelled'
  AND o.placed_at >= DATE '2024-01-01'
GROUP BY cat.category_name
HAVING SUM(ol.quantity * ol.unit_price) > 10000
ORDER BY revenue DESC;
```

Rules to internalize:

- Every non-aggregated column in the `SELECT` list must appear in `GROUP BY`. Some engines are lenient about this; do not rely on it.
- `WHERE` filters **rows before grouping**; `HAVING` filters **groups after aggregating**. Push every condition you can into `WHERE` — it removes rows before the expensive work.
- `COUNT(*)` counts rows including nulls. `COUNT(column)` counts non-null values of that column. `COUNT(DISTINCT column)` counts distinct non-null values. These three regularly return three different numbers from the same query, and picking the wrong one is a quiet defect.
- `SUM`, `AVG`, `MIN`, and `MAX` ignore nulls entirely. `AVG` over a column with nulls averages only the rows that had a value, which may or may not be what the business means by "average."

### Grouping by a derived value

Monthly rollups are the most common analytical request you will receive:

```sql
SELECT
  DATE_TRUNC('month', o.placed_at) AS order_month,
  COUNT(DISTINCT o.order_id)       AS orders,
  SUM(ol.quantity * ol.unit_price) AS revenue
FROM orders      AS o
JOIN order_lines AS ol ON ol.order_id = o.order_id
WHERE o.order_status <> 'cancelled'
GROUP BY DATE_TRUNC('month', o.placed_at)
ORDER BY order_month;
```

Date function names vary between engines (`DATE_TRUNC` in PostgreSQL, `DATE_FORMAT` in MySQL, `DATE_TRUNC` in most warehouses). The concept is portable; the spelling is not. Check the documentation for the engine you are actually on rather than assuming.

## Structuring a query so a human can read it

### Common table expressions

A CTE names an intermediate result so the final query reads as a sequence of steps.

```sql
WITH valid_orders AS (
  SELECT order_id, customer_id, shipping_address_id, placed_at
  FROM orders
  WHERE order_status <> 'cancelled'
),
order_totals AS (
  SELECT
    ol.order_id,
    SUM(ol.quantity * ol.unit_price) AS order_total
  FROM order_lines AS ol
  GROUP BY ol.order_id
)
SELECT
  a.state_code,
  COUNT(*)           AS orders,
  SUM(t.order_total) AS revenue
FROM valid_orders  AS v
JOIN order_totals  AS t ON t.order_id   = v.order_id
JOIN addresses     AS a ON a.address_id = v.shipping_address_id
GROUP BY a.state_code
ORDER BY revenue DESC;
```

Notice what `order_totals` accomplishes: it collapses the many side to one row per order *before* joining, so the final aggregate cannot double-count. Aggregating first and joining second is the standard cure for the grain trap, and CTEs are what make it readable.

### Subqueries

A subquery in `WHERE` filters against another result set:

```sql
SELECT customer_id, full_name
FROM customers
WHERE customer_id IN (
  SELECT customer_id
  FROM orders
  WHERE placed_at >= CURRENT_DATE - 90
);
```

`EXISTS` expresses the same idea and often reads better for "has at least one":

```sql
SELECT c.customer_id, c.full_name
FROM customers AS c
WHERE EXISTS (
  SELECT 1 FROM orders AS o
  WHERE o.customer_id = c.customer_id
    AND o.placed_at >= CURRENT_DATE - 90
);
```

One caution: `NOT IN` returns no rows at all if the subquery produces even a single `NULL`, because "is this value not equal to unknown?" is unknown. `NOT EXISTS` does not have this problem. Prefer it.

### The order the database evaluates things

SQL is written in an order that does not match the order it runs in. Logically, the engine processes `FROM` and joins, then `WHERE`, then `GROUP BY`, then `HAVING`, then `SELECT`, then `ORDER BY`, then `LIMIT`. That explains two things beginners find arbitrary: you cannot reference a `SELECT` alias in `WHERE` (the alias does not exist yet), but you usually *can* reference it in `ORDER BY` (by then it does).

## Creating and constraining tables

You will write DDL as part of every pipeline, because the destination has to exist.

```sql
CREATE TABLE order_summary (
  order_id     BIGINT       PRIMARY KEY,
  customer_id  BIGINT       NOT NULL REFERENCES customers(customer_id),
  order_month  DATE         NOT NULL,
  line_count   INT          NOT NULL CHECK (line_count > 0),
  order_total  NUMERIC(12,2) NOT NULL,
  loaded_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_summary_month ON order_summary (order_month);
```

Use `NUMERIC`/`DECIMAL` for money, never `FLOAT` — binary floating point cannot represent `0.10` exactly, and the rounding error accumulates across millions of rows into a discrepancy someone will eventually make you explain. Constraints (`NOT NULL`, `CHECK`, `UNIQUE`, foreign keys) are validation you get from the database at no ongoing cost; declare them rather than hoping your pipeline never has a bug.

And wrap multi-statement loads in a transaction:

```sql
BEGIN;
DELETE FROM order_summary WHERE order_month = DATE '2024-03-01';
INSERT INTO order_summary (order_id, customer_id, order_month, line_count, order_total)
SELECT /* ... */ ;
COMMIT;
```

If the insert fails, the delete is rolled back with it and nobody ever sees a table missing a month.

## Practice

Set up a local relational database (PostgreSQL, MySQL, or SQLite — any of them is fine) and create the e-commerce schema from the previous lesson. Populate it with at least 20 customers, 30 products across 5 categories, 100 orders, and 300 order lines. Generate the data however you like: a Python script with random values is quickest, and deliberately include some messiness — a handful of cancelled orders, a few customers with no orders at all, and some null `state_code` values.

Then write and run a query for each of the following. For every one, write a one-sentence statement of the result's grain above the query as a comment, and record the row count you got.

1. All orders placed in the most recent full month, with the customer's name and email, newest first.
2. Every customer, with the number of orders they have placed — including customers with zero, shown as `0` rather than omitted.
3. Revenue by category for the last 90 days, excluding cancelled orders, sorted highest first, showing only categories above a threshold you choose.
4. Monthly order count and revenue for the whole dataset, with one row per month.
5. The top five products by units sold, with their category name and their share of total units.
6. Customers who have ordered from more than one category, with the count of distinct categories.
7. Orders whose header count of lines disagrees with the number of `order_lines` rows actually present — a reconciliation query that should return zero rows against clean data.
8. Average order value by customer state, treating a null state as its own group labelled `unknown`.

**Deliberate-error exercise.** Write the revenue-by-category query a second time, this time joining `orders` to `order_lines` and summing an order-level total instead of a line-level one. Run both. Report the two numbers, explain precisely why they differ, and state the rule you will use in future to catch this before it reaches a dashboard.

**Refactor exercise.** Take your longest query from the list above and rewrite it using CTEs so that each step has a name and the final `SELECT` fits in fewer than ten lines. Confirm both versions return identical results, then write two sentences on which one you would rather inherit from a departing colleague.
