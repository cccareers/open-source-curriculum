---
lesson_id: de102-05
course_id: de102
pathway: data-engineer
title: Indexing Strategies
order: 5
kind: lesson
competency_ids:
  - D3-S1-C03
objectives:
  - Choose an index type and column order that a given query can actually use
---

## What an index is

An index is a redundant, automatically maintained data structure that lets the engine find rows without reading the whole table. That definition contains the whole trade: **redundant** means storage, **automatically maintained** means every insert, update, and delete pays for it, and **without reading the whole table** means reads can get orders of magnitude faster.

Indexes are therefore not free and not always right. A table that is written constantly and queried rarely wants few indexes. A table queried in a hundred shapes wants indexes for the shapes that matter, not for all hundred.

This lesson is about choosing them: which type, which columns, in which order, and how to tell whether a query can actually use the one you built.

## The B-tree, in the amount of detail that changes decisions

The default index in both PostgreSQL and MySQL is a B-tree — specifically a B+tree, where all keys live in leaf pages and the leaves are linked in order.

![A B-tree index traversal from root through internal pages to a linked leaf page, then a lookup into the table heap](./img/btree-index-lookup.png)

Two properties of that shape explain almost everything about B-tree behaviour:

**Lookups are logarithmic.** Each page holds hundreds of keys, so three or four page reads reach any leaf in a table of millions of rows. This is why an equality lookup on an indexed column is fast almost regardless of table size.

**The leaves are sorted and linked.** That is what makes a B-tree good at range scans (`BETWEEN`, `>`, `LIKE 'abc%'`) and at satisfying `ORDER BY` without a sort step. A hash structure would beat it on pure equality and be useless for both.

The one number that decides whether the engine bothers is **selectivity**: the fraction of rows a predicate keeps. A predicate matching 0.1% of rows is worth an index scan. A predicate matching 40% is not — following 40% of the rows back to the table in index order means jumping around the heap, and reading the table sequentially is cheaper. A planner that ignores your index on `status = 'active'` when 90% of rows are active is making the right call.

PostgreSQL has a middle gear here: a **bitmap scan**. It reads the index, builds a bitmap of matching heap pages, sorts it, and then reads the table in physical order. That makes medium-selectivity predicates viable, and it is why Postgres can combine two separate single-column indexes for `WHERE a = 1 AND b = 2` by ANDing their bitmaps. This works, but it is usually slower than one well-chosen composite index.

## Composite indexes and why column order decides everything

A composite index sorts by the first column, then by the second within equal firsts, and so on — like a phone book sorted by last name then first name.

```sql
CREATE INDEX ON sales_order (customer_id, ordered_at, status);
```

That index serves:

- `WHERE customer_id = 7`
- `WHERE customer_id = 7 AND ordered_at >= '2026-01-01'`
- `WHERE customer_id = 7 ORDER BY ordered_at`
- `WHERE customer_id = 7 AND ordered_at = '...' AND status = 'shipped'`

It does **not** efficiently serve `WHERE ordered_at >= '2026-01-01'` alone. You cannot use the phone book to find everyone named "Maria" without a last name. This is the **leftmost prefix rule**, and it is the single most useful indexing fact there is.

The other half of the rule concerns ranges: **columns after the first range predicate can only filter, not seek.** In `(customer_id, ordered_at, status)`, once `ordered_at` is used with `>=`, the index is being scanned across many `ordered_at` values, so `status` cannot narrow the seek — it just discards rows as they come off the index. So order composite columns as **equality predicates first, then the range or sort column, then anything you only want along for the ride.**

Among the equality columns, order by what your queries actually filter on, not by cardinality folklore. An index whose leading column is missing from a query's `WHERE` clause is dead weight for that query no matter how selective it is.

## Indexes that carry the answer

If every column a query needs is in the index, the engine never has to visit the table at all. PostgreSQL calls this an **index-only scan**; MySQL calls it a covering index and shows `Using index` in `EXPLAIN`.

PostgreSQL lets you attach payload columns that are stored in the leaves but not part of the sort key:

```sql
CREATE INDEX ON sales_order (customer_id, ordered_at) INCLUDE (status, total_amount);
```

`INCLUDE` columns cannot be used for seeking or ordering, but they make the index cover more queries without widening the key. One caveat specific to Postgres: index-only scans still need to confirm row visibility via the visibility map, so a table with heavy recent write churn may not get a fully index-only scan until it has been vacuumed.

MySQL has no `INCLUDE`, but it has something structurally similar for free. InnoDB tables are **clustered** on the primary key — the table *is* the primary key's B-tree — and every secondary index stores the primary key as its row pointer. So `(customer_id, ordered_at)` in InnoDB implicitly covers the primary key columns too, and a lookup by secondary index is a two-step: find the PK in the secondary index, then find the row in the clustered index. This is why an enormous primary key in InnoDB inflates every secondary index on the table.

## Specialized indexes: matching the type to the question

B-trees answer "equal, less, greater, between, prefix". Other questions need other structures.

**Hash** (`USING hash`) supports only equality but is compact. Rarely worth it over a B-tree; useful for very wide keys where you only ever test equality.

**GIN** — generalized inverted index — indexes the *elements inside* a value. This is the index for `jsonb` containment, arrays, and full-text search:

```sql
CREATE INDEX ON device_reading USING gin (payload jsonb_path_ops);
-- serves: WHERE payload @> '{"firmware": "2.1.4"}'

CREATE INDEX ON article USING gin (to_tsvector('english', body));
-- serves: WHERE to_tsvector('english', body) @@ plainto_tsquery('english', 'index tuning')
```

`jsonb_path_ops` is a smaller, faster variant that supports only the containment operator — usually what you want. GIN indexes are expensive to update; the `fastupdate` pending-list mechanism batches that cost.

**GiST** is a framework for indexing things where "overlaps" or "is near" is the question: geometric types, ranges, and the exclusion constraint you wrote in lesson 2. **SP-GiST** suits non-balanced partitioned structures such as quadtrees and IP prefix trees.

**BRIN** — block range index — stores only the min and max value per block range. It is minuscule (kilobytes for a table of hundreds of millions of rows) and only works when the table's physical order correlates with the indexed column, which is exactly the case for an append-only time-series table indexed on its timestamp. When the correlation is there, BRIN gives most of the benefit at a tiny fraction of the size and write cost. When it is not, BRIN is useless.

MySQL 8's equivalents are thinner: `FULLTEXT` indexes for text search, `SPATIAL` for geometry, and multi-valued indexes on JSON arrays. There is no BRIN and no general GIN.

## Narrowing the index itself

**Partial indexes** (PostgreSQL) index only rows matching a predicate:

```sql
CREATE INDEX ON sales_order (ordered_at)
WHERE status = 'pending';
```

If 0.5% of orders are pending and your dashboards only ever query pending ones, this index is 200 times smaller than the full one, is cached far more effectively, and costs nothing when non-pending rows are written. Partial indexes are also the clean way to enforce conditional uniqueness — "only one active subscription per customer" — via a partial unique index.

**Expression indexes** index the result of a function:

```sql
CREATE INDEX ON customer (lower(email));
-- serves: WHERE lower(email) = lower($1)
```

MySQL 8 has functional indexes with similar effect and no partial-index equivalent; it does have **prefix indexes** (`INDEX (url(64))`) for long strings, which Postgres does not need because of its larger index key limits and expression indexes.

## Sargability: why the index you built is being ignored

A predicate is *sargable* if the engine can turn it into an index seek. Common ways to destroy sargability:

- **Wrapping the column in a function.** `WHERE date_trunc('day', ordered_at) = '2026-03-01'` cannot use an index on `ordered_at`. Rewrite as a range: `WHERE ordered_at >= '2026-03-01' AND ordered_at < '2026-03-02'`. Or build the matching expression index.
- **Leading wildcards.** `LIKE '%widget'` cannot use a B-tree; `LIKE 'widget%'` can. For the former you need a trigram index (`pg_trgm` with GIN) or full-text search.
- **Type mismatches and implicit casts.** Comparing a `bigint` column to a text parameter can force a cast on the column side. Match your parameter types.
- **`OR` across different columns.** `WHERE a = 1 OR b = 2` cannot use a single composite index. Postgres may bitmap-OR two indexes; otherwise rewrite as a `UNION`.
- **Collation for prefix matching.** In a non-C collation, a default B-tree on `text` will not serve `LIKE 'abc%'`. Build it with `text_pattern_ops` for that use.
- **`NULL` handling.** `IS NULL` is indexable in Postgres B-trees; `<> value` generally is not selective enough to be worth a seek.

## Paying for indexes, and maintaining them

Every index multiplies write cost: an insert writes one heap row and one entry per index. Updates in PostgreSQL are cheaper than they look thanks to HOT updates — if no indexed column changed and the new version fits on the same page, no index entry is written at all — which is a concrete argument for not indexing frequently-updated columns you do not query on.

Build indexes on live tables without blocking writes:

```sql
CREATE INDEX CONCURRENTLY idx_sales_order_customer_time
  ON sales_order (customer_id, ordered_at);
```

`CONCURRENTLY` takes longer, cannot run inside a transaction block, and can leave an `INVALID` index behind if it fails — check `pg_index.indisvalid` and drop-and-retry if so. `REINDEX CONCURRENTLY` rebuilds a bloated index the same way. MySQL 8 does most index builds online by default.

Find the indexes nobody uses:

```sql
SELECT relname, indexrelname, idx_scan, pg_size_pretty(pg_relation_size(indexrelid))
FROM   pg_stat_user_indexes
ORDER  BY idx_scan, pg_relation_size(indexrelid) DESC;
```

An index with `idx_scan = 0` after a full business cycle is pure write tax — but check it is not backing a constraint before you drop it. Also look for **redundant indexes**: `(a)` is fully covered by `(a, b)` and can usually go.

## Practice

Use a table with at least a million rows. `EXPLAIN` appears below only as a yes/no check that an index was used; reading plans properly is the next lesson.

1. **Build the table.** Generate a `sales_order`-shaped table of 2,000,000 rows with a skewed `customer_id`, a timestamp spread over three years, and a `status` where 95% of rows are `'complete'`. Run `ANALYZE`.
2. **Selectivity.** Index `status` alone. Query for `status = 'complete'` and then for a rare status, checking with `EXPLAIN` which one uses the index. Explain the planner's reasoning in one sentence.
3. **Column order.** Create `(customer_id, ordered_at)`. Confirm it serves a query filtering on both, and a query filtering on `customer_id` and ordering by `ordered_at`. Then confirm it does *not* serve a query filtering on `ordered_at` alone. Create the reverse-order index and show the situation invert.
4. **Covering.** Write a query returning three columns for one customer in a date range. Add an `INCLUDE` clause so the plan reports an index-only scan, and compare the reported buffer counts before and after with `EXPLAIN (ANALYZE, BUFFERS)`.
5. **Partial.** Build a partial index on the rare status and compare its size against the full index using `pg_size_pretty(pg_relation_size(...))`. Then use a partial unique index to enforce "at most one open order per customer" and prove it fires.
6. **Expression and sargability.** Time a query using `date_trunc('day', ordered_at) = ...`. Rewrite it as a half-open range and time it again. Then create the expression index that makes the original form fast, and decide which of the two you would actually ship, with a reason.
7. **`jsonb`.** Add a `jsonb` payload column, populate it, and query with the containment operator. Measure before and after adding a GIN index with `jsonb_path_ops`.
8. **Write cost.** Time a bulk insert of 100,000 rows into the table with all your indexes present, then drop every non-constraint index and repeat. Report the ratio, and state which of your indexes you would keep given the numbers.
