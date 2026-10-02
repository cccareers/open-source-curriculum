---
lesson_id: de102-03
course_id: de102
pathway: data-engineer
title: "Advanced SQL: Joins, Subqueries, and Window Functions"
order: 3
kind: lesson
competency_ids:
  - D3-S1-C02
objectives:
  - Write analytical SQL using joins, subqueries, common table expressions, and
    window functions
---

## Thinking in sets

The single biggest jump from beginner SQL to working SQL is giving up the loop. You do not fetch rows and process them one at a time; you describe the set you want and let the engine assemble it. Every construct in this lesson — joins, subqueries, CTEs, window functions — is a different way of describing a set in terms of other sets.

We will build everything against a small sales schema: `customer`, `sales_order`, `order_line`, `product`, and `product_category`. Assume `sales_order` has `order_id`, `customer_id`, `ordered_at`, `status`; `order_line` has `order_id`, `line_number`, `product_id`, `quantity`, `unit_price`.

## Joins, all five of them

A join produces a row for every pair of input rows that satisfies the join condition. The variations differ only in what happens to rows with no partner.

```sql
SELECT c.display_name, o.order_id, o.ordered_at
FROM   customer c
JOIN   sales_order o ON o.customer_id = c.customer_id;
```

That is an **inner join**: only matched pairs survive. A customer with no orders vanishes, and so does an order with no customer (which a foreign key should have made impossible).

```sql
SELECT c.display_name, o.order_id
FROM   customer c
LEFT JOIN sales_order o ON o.customer_id = c.customer_id;
```

A **left outer join** keeps every left row, filling the right side with nulls where there was no match. `RIGHT JOIN` is the mirror image; most teams normalise everything to `LEFT` for readability. `FULL OUTER JOIN` keeps unmatched rows from both sides — useful for reconciliation, when you want to see what is in one system and not the other. MySQL has no `FULL OUTER JOIN`; you emulate it with `LEFT JOIN` `UNION` `RIGHT JOIN`.

`CROSS JOIN` produces the Cartesian product. It is deliberate and useful for generating scaffolds — every customer crossed with every month, so that months with no activity still appear as rows.

The classic mistake with outer joins is putting a filter on the outer table in `WHERE`:

```sql
-- Wrong: silently becomes an inner join
SELECT c.display_name, o.order_id
FROM   customer c
LEFT JOIN sales_order o ON o.customer_id = c.customer_id
WHERE  o.status = 'shipped';
```

`WHERE` runs after the join, and a null `status` from an unmatched customer fails `= 'shipped'`, so those customers disappear. If the condition belongs to the optional side, it belongs in `ON`:

```sql
SELECT c.display_name, o.order_id
FROM   customer c
LEFT JOIN sales_order o
       ON o.customer_id = c.customer_id
      AND o.status = 'shipped';
```

The other classic mistake is join fan-out. Join `sales_order` to `order_line` and each order appears once per line; `SUM(o.freight_charge)` now counts the freight once per line rather than once per order. Whenever you join a one-to-many relationship and then aggregate, ask what the grain of the result is. Aggregating in a subquery first, or using `SUM(DISTINCT ...)` on a per-order value, avoids the double count.

PostgreSQL adds `LATERAL`, a join whose right side may reference the left side. It is the clean way to express "top N per group":

```sql
SELECT c.display_name, recent.order_id, recent.ordered_at
FROM   customer c
CROSS JOIN LATERAL (
  SELECT o.order_id, o.ordered_at
  FROM   sales_order o
  WHERE  o.customer_id = c.customer_id
  ORDER  BY o.ordered_at DESC
  LIMIT  3
) AS recent;
```

MySQL 8.0.14 and later support `LATERAL` with the same semantics.

## Subqueries: scalar, correlated, and set-valued

A **scalar subquery** returns one row and one column and can stand anywhere a value can:

```sql
SELECT o.order_id,
       (SELECT SUM(l.quantity * l.unit_price)
        FROM   order_line l
        WHERE  l.order_id = o.order_id) AS order_total
FROM   sales_order o;
```

That one is **correlated**: it references `o` from the outer query, so conceptually it runs per outer row. Modern planners often rewrite correlated subqueries into joins, but not always, and a correlated subquery inside a `SELECT` list over a large table is a common source of slowness.

**Semi-joins and anti-joins** are the ones worth naming, because they are the intent behind most `IN`/`EXISTS` usage. A semi-join asks "does at least one match exist?" without multiplying rows:

```sql
-- customers who have ordered at least once
SELECT c.display_name
FROM   customer c
WHERE  EXISTS (SELECT 1 FROM sales_order o WHERE o.customer_id = c.customer_id);
```

An anti-join asks the opposite:

```sql
SELECT c.display_name
FROM   customer c
WHERE  NOT EXISTS (SELECT 1 FROM sales_order o WHERE o.customer_id = c.customer_id);
```

Prefer `NOT EXISTS` over `NOT IN` for anti-joins. If the subquery returns even one null, `NOT IN` evaluates to unknown for every row and the result is empty — a silent wrong answer rather than an error. This is the single most expensive null trap in SQL.

Set operators are the other way to combine result sets: `UNION` (deduplicating), `UNION ALL` (not, and therefore cheaper — use it whenever you know there are no duplicates), `INTERSECT`, and `EXCEPT` (`MINUS` in some dialects). `EXCEPT` is excellent for reconciliation tests: if `a EXCEPT b` and `b EXCEPT a` are both empty, the sets are equal.

## Aggregation beyond `GROUP BY`

`GROUP BY` collapses rows; `HAVING` filters the collapsed groups; `WHERE` filters before collapsing. Filtering in `WHERE` when you can is both clearer and faster.

PostgreSQL's `FILTER` clause lets one pass compute several conditional aggregates:

```sql
SELECT date_trunc('month', o.ordered_at) AS month,
       count(*)                                   AS orders,
       count(*) FILTER (WHERE o.status = 'cancelled') AS cancelled,
       sum(l.quantity * l.unit_price) FILTER (WHERE o.status <> 'cancelled')
         AS net_revenue
FROM   sales_order o
JOIN   order_line l USING (order_id)
GROUP  BY 1
ORDER  BY 1;
```

MySQL has no `FILTER`; the portable equivalent is `SUM(CASE WHEN ... THEN 1 ELSE 0 END)`.

`GROUPING SETS`, `ROLLUP`, and `CUBE` compute several grouping levels in one pass — a per-category total and a grand total in the same result, with `GROUPING()` telling you which rows are subtotals.

## Common table expressions

A CTE names a subquery so a query can be read top to bottom instead of inside out:

```sql
WITH order_totals AS (
  SELECT l.order_id,
         sum(l.quantity * l.unit_price) AS total
  FROM   order_line l
  GROUP  BY l.order_id
),
ranked AS (
  SELECT o.customer_id, t.order_id, t.total,
         row_number() OVER (PARTITION BY o.customer_id ORDER BY t.total DESC) AS rn
  FROM   order_totals t
  JOIN   sales_order o USING (order_id)
)
SELECT customer_id, order_id, total
FROM   ranked
WHERE  rn = 1;
```

One historical caution: before version 12, PostgreSQL always materialised CTEs — it computed them fully and could not push a filter down into them, so a CTE could be dramatically slower than the same subquery inlined. Version 12 inlines CTEs that are referenced once and have no side effects, and gives you `MATERIALIZED` / `NOT MATERIALIZED` to force either behaviour. Knowing this explains a lot of old advice you will find online.

**Recursive CTEs** walk hierarchies and graphs:

```sql
WITH RECURSIVE subtree AS (
  SELECT category_id, parent_id, name, 1 AS depth
  FROM   product_category
  WHERE  parent_id IS NULL

  UNION ALL

  SELECT c.category_id, c.parent_id, c.name, s.depth + 1
  FROM   product_category c
  JOIN   subtree s ON c.parent_id = s.category_id
)
SELECT * FROM subtree ORDER BY depth, name;
```

The anchor term runs once; the recursive term runs repeatedly against the rows produced by the previous iteration until it produces none. If your data can contain a cycle, carry a path array and add `WHERE NOT c.category_id = ANY(s.path)`, or the query will not terminate.

## Window functions

A window function computes across a set of rows related to the current row **without collapsing them**. That is the whole idea: aggregate values alongside detail rows.

```sql
SELECT o.order_id,
       o.customer_id,
       o.ordered_at,
       t.total,
       sum(t.total)  OVER (PARTITION BY o.customer_id ORDER BY o.ordered_at)
         AS running_customer_total,
       lag(t.total)  OVER (PARTITION BY o.customer_id ORDER BY o.ordered_at)
         AS previous_order_total,
       rank()        OVER (PARTITION BY o.customer_id ORDER BY t.total DESC)
         AS size_rank
FROM   sales_order o
JOIN   order_totals t USING (order_id);
```

`PARTITION BY` divides rows into independent groups; `ORDER BY` inside `OVER` gives them an order, which is what makes running totals and `lag`/`lead` meaningful.

The ranking family differs in how it handles ties: `row_number()` never ties and assigns 1,2,3,4; `rank()` ties and skips, giving 1,1,3; `dense_rank()` ties without skipping, giving 1,1,2. Pick deliberately — "top 3" computed with `row_number()` silently drops a genuine tie.

`ntile(n)` buckets rows into n roughly equal groups (quartiles, deciles). `first_value`, `last_value`, and `nth_value` read across the frame. `lag(col, 1)` and `lead(col, 1)` reach backward and forward, which is how you compute period-over-period change without a self-join.

**Frames** are where people get surprised. When you write `ORDER BY` in a window without a frame clause, the default frame is `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`, and `RANGE` means *peer rows* — rows with the same `ORDER BY` value — are all included at once. So a running total over a day with ties includes the whole day's ties at each row. If you want strict row-by-row accumulation, say so:

```sql
sum(amount) OVER (ORDER BY ordered_at
                  ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)
```

Moving averages use a bounded frame: `ROWS BETWEEN 6 PRECEDING AND CURRENT ROW` gives a seven-row trailing average.

Naming a window once keeps long queries readable:

```sql
SELECT customer_id, ordered_at,
       sum(total) OVER w AS running_total,
       avg(total) OVER w AS running_avg
FROM   order_totals JOIN sales_order USING (order_id)
WINDOW w AS (PARTITION BY customer_id ORDER BY ordered_at
             ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW);
```

Because window functions are evaluated after `WHERE` and `GROUP BY` but before `ORDER BY` and `LIMIT`, you cannot filter on a window result in `WHERE`. Wrap the query in a CTE or subquery and filter outside it — that is why the "top order per customer" example above has two levels.

Dialect note: window functions and CTEs both arrived in MySQL 8.0. On MySQL 5.7 neither exists, and the workarounds (user variables for running totals, self-joins for ranking) are fragile enough that upgrading is the real answer.

PostgreSQL also offers `DISTINCT ON`, a non-standard shortcut for "one row per group, chosen by an order":

```sql
SELECT DISTINCT ON (customer_id) customer_id, order_id, ordered_at
FROM   sales_order
ORDER  BY customer_id, ordered_at DESC;
```

## Practice

Load a dataset with at least a few hundred thousand rows across related tables — generate one with `generate_series` if you have none handy — and write real queries against it.

1. **Outer join semantics.** Write a query listing every customer together with their shipped-order count, including customers with zero. Then deliberately write the broken version that filters `status` in `WHERE`, run both, and explain the row-count difference in one sentence.
2. **Fan-out.** Write a query that joins orders to order lines and sums an order-level value, producing a wrong total. Then fix it two different ways: by pre-aggregating lines in a CTE, and by aggregating at the order grain in a subquery. Confirm both agree.
3. **Anti-join trap.** Find products never ordered, using `NOT EXISTS`. Now write the `NOT IN` version, insert one row with a null `product_id` into the referenced set, and observe the result collapse to zero rows. Write down why.
4. **Recursion.** Build a self-referencing category table four levels deep and write a recursive CTE that returns each category with its depth and its full path as a text breadcrumb. Add a deliberate cycle and make your query survive it.
5. **Windows.** For each customer, produce: their running spend over time, the change from their previous order, their decile by lifetime spend, and a flag marking their single largest order. Do it in one query. Then answer "which customers' largest order was also their most recent?" — which requires filtering on a window result, so mind where the filter can legally go.
6. **Frames.** Compute a seven-day trailing average of daily revenue twice: once with the default `RANGE` frame and once with an explicit `ROWS` frame. Construct data with tied timestamps so the two differ, and explain the difference.
