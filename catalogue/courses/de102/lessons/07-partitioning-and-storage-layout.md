---
lesson_id: de102-07
course_id: de102
pathway: data-engineer
title: Partitioning and Storage Layout
order: 7
kind: lesson
competency_ids:
  - D3-S1-C03
  - D5-S2-C02
objectives:
  - Partition a large table so that queries prune the partitions they do not need
---

## When one table stops being one table

Indexes make a large table findable. They do not make it manageable. Past a certain size — and the threshold is more about operations than about rows — a single table starts to hurt in ways no index fixes: deleting last year's data takes hours and leaves bloat behind, vacuum or `OPTIMIZE TABLE` never finishes, an index no longer fits in cache, and every query pays for data it will never look at.

**Partitioning** splits one logical table into many physical ones by a key you choose. The engine keeps presenting one table to your SQL, and the planner gets a new superpower: it can prove at plan time or run time that certain partitions cannot contain matching rows and skip them entirely. That is **partition pruning**, and it is the whole point.

![A range-partitioned orders table where a date-filtered query touches only two of twelve monthly partitions](./img/range-partition-pruning.png)

Partitioning is not a general speed-up. If your queries do not filter on the partition key, you have made things slower — every query now scans every partition, plus planning overhead. Choose the key from the access pattern, not from the data model.

## Declarative partitioning in PostgreSQL

PostgreSQL 10 introduced declarative partitioning; version 12 and later made it fast enough to use freely. Three strategies:

**Range** — the common case, almost always time.

```sql
CREATE TABLE sales_order (
  order_id    bigint      NOT NULL,
  customer_id bigint      NOT NULL,
  ordered_at  timestamptz NOT NULL,
  status      text        NOT NULL,
  total       numeric(12,2) NOT NULL,
  PRIMARY KEY (order_id, ordered_at)
) PARTITION BY RANGE (ordered_at);

CREATE TABLE sales_order_2026_01 PARTITION OF sales_order
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE sales_order_2026_02 PARTITION OF sales_order
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
```

Bounds are inclusive of the lower and **exclusive** of the upper, so adjacent months meet without gap or overlap. A row that matches no partition raises an error unless you have created a `DEFAULT` partition — and a default partition blocks adding new partitions that would overlap rows already in it, so it is a safety net, not a strategy.

**List** — partition by a discrete value such as region or tenant, when a handful of values dominate and each is queried separately.

**Hash** — spread rows evenly across N partitions by a hash of the key. This gives you no pruning for range queries and only helps when you need to break up contention or parallelise maintenance on a key with no natural grouping.

Note the primary key in the example: `(order_id, ordered_at)`. **Every unique or primary key on a partitioned table must include all partition key columns.** The engine enforces uniqueness per partition and cannot enforce it globally without that. This is the constraint that most often forces a redesign, so check it before you commit to a key.

## Pruning, and confirming it happens

There are two prunings. **Plan-time pruning** happens when the partition key is compared against a constant, and the excluded partitions never appear in the plan at all. **Run-time pruning** (`enable_partition_pruning`, on by default) handles the case where the value is a parameter or comes from the other side of a join; the plan shows all partitions but reports `Partitions removed: 10` when it executes.

Verify it. Do not assume it:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT count(*) FROM sales_order
WHERE ordered_at >= '2026-02-01' AND ordered_at < '2026-03-01';
```

The plan should show one `Append` over a single partition. The most common reason it does not is a predicate the planner cannot match to the bounds — for example filtering on `ordered_at::date` instead of on `ordered_at`, or comparing a `timestamptz` column against a value whose type forces a cast on the column side. Sargability applies to partition keys exactly as it applies to indexes.

Two further planner behaviours are worth turning on and knowing about. `enable_partitionwise_join` lets Postgres join two identically-partitioned tables partition by partition rather than appending everything first, and `enable_partitionwise_aggregate` does the same for grouping. Both are off by default because they raise planning cost; on a warehouse-shaped workload with matching partition layouts they are frequently the single biggest win available.

## The operational payoff: attach and detach

The reason experienced engineers partition by time is rarely query speed. It is this:

```sql
ALTER TABLE sales_order DETACH PARTITION sales_order_2024_01 CONCURRENTLY;
DROP TABLE sales_order_2024_01;
```

Dropping a partition is a metadata operation followed by an unlink. Deleting the same rows with `DELETE` would write a dead version of every row, generate write-ahead log traffic proportional to the data, leave the table bloated, and require a vacuum to reclaim anything. A retention policy expressed as "drop the oldest partition monthly" is orders of magnitude cheaper than one expressed as a `DELETE`.

The same works in reverse for loading. Build next month's partition as a standalone table, load and index it at full speed with no concurrent readers, then `ATTACH` it. Add a `CHECK` constraint matching the intended bounds *before* attaching and Postgres skips the validation scan that `ATTACH` would otherwise run while holding a lock.

Indexes on a partitioned parent are **partitioned indexes**: creating one on the parent creates a matching index on every partition and on every partition attached later. You cannot use `CREATE INDEX CONCURRENTLY` on the parent, so the online recipe is to build the index concurrently on each partition individually and then create the parent index, which will adopt the existing ones.

## How many partitions, and what goes wrong

Planning and execution cost scale with partition count. Modern Postgres handles a few thousand partitions, but every partition carries relation metadata, its own indexes, its own autovacuum attention, and a lock acquisition per query that touches it. Aim for partitions in the range of tens of gigabytes rather than tens of megabytes, and prefer monthly over daily unless your retention or query granularity genuinely demands daily.

The failure modes to watch for: a query with no partition-key predicate, which now scans everything; sub-partitioning that multiplies counts into the tens of thousands; forgetting to create next month's partition, so inserts start failing at midnight on the first — automate creation ahead of time; and unique-constraint requirements you discovered too late.

MySQL's partitioning is older and thinner. `PARTITION BY RANGE (TO_DAYS(ordered_at))`, `LIST`, `HASH`, and `KEY` all exist, and pruning works, but the restriction is the same and stricter: every unique key must contain every partition-key column, foreign keys are not supported on partitioned InnoDB tables at all, and there is no partition-wise join. Detach-style operations are done with `ALTER TABLE ... EXCHANGE PARTITION`.

## Storage layout inside a partition

Partitioning decides which rows live in which file. Layout decides how efficiently the rows sit inside it — and since almost all query time on a large table is spent moving pages, bytes on a page translate directly into query time.

**Pages and tuples.** PostgreSQL stores rows in 8kB pages with a header and a line pointer per tuple. `fillfactor` reserves free space on each page at build time; lowering it below 100 on an update-heavy table leaves room for new row versions on the same page, which enables HOT updates and avoids index writes. On an append-only table, leave it at 100.

**Column order matters.** Fixed-width types are aligned to their size, so a table declared `(bool, bigint, bool, bigint)` pads each `bool` out to eight bytes. Declaring wider fixed-width columns first, then narrow ones, then variable-length ones, can cut row width by a noticeable fraction on wide tables with no semantic change at all. Free bytes are worth taking.

**TOAST and compression.** Values too large for a page are compressed and moved to a side table automatically. PostgreSQL 14 and later let you choose the algorithm: `default_toast_compression = lz4` is meaningfully faster than the legacy `pglz` at similar ratios, and per-column control is available:

```sql
ALTER TABLE article ALTER COLUMN body SET COMPRESSION lz4;
ALTER TABLE article ALTER COLUMN body SET STORAGE EXTERNAL;  -- store out-of-line, uncompressed
```

`EXTERNAL` is right when you frequently read only a prefix or substring of a large value, because an uncompressed TOAST value can be sliced without decompressing the whole thing.

**Physical clustering.** `CLUSTER table USING index` physically reorders a table to match an index. It is a one-time operation that takes an exclusive lock and is not maintained afterwards, but on an analytic table it improves the correlation statistic, makes range scans sequential, and is what makes a BRIN index viable. A time-partitioned table gets much of this for free, since rows arrive roughly in key order.

MySQL's layout knobs differ: InnoDB tables are clustered on the primary key by construction, which means a monotonically increasing PK gives you time-ordered physical layout automatically and a UUID PK gives you page splits and fragmentation. `ROW_FORMAT=COMPRESSED` with `KEY_BLOCK_SIZE` compresses pages in the buffer pool as well as on disk, which trades CPU for both I/O and memory; the newer transparent page compression is usually the better choice on a filesystem that supports sparse files.

**Archived partitions and columnar formats.** A detached partition does not have to stay in the database. Data engineering teams routinely export cold partitions to a columnar file format — Parquet or ORC — where per-column encoding (dictionary, run-length, delta) plus a block codec typically reduces size by five to ten times against the equivalent row storage, and where a reader can skip whole row groups using the footer statistics. The codec choice is the familiar trade: `snappy` and `lz4` decompress fastest, `zstd` gives materially better ratios at a modest CPU cost and is the sensible default for archival, `gzip` is slower for no advantage over `zstd`. What you *query* those files with belongs to a later course; what matters here is that the export target is a storage-layout decision continuous with the ones above, and that choosing partition boundaries that match your archival granularity is what makes the export a file copy instead of a query.

## Practice

Work in PostgreSQL with a table of at least ten million rows spanning two years.

1. **Convert.** Build a range-partitioned `sales_order` by month, with a primary key that is legal under partitioning. Load your ten million rows and record the load time. Note in a comment which primary key you originally wanted and why you could not have it.
2. **Prove pruning.** Run `EXPLAIN (ANALYZE, BUFFERS)` for a single-month query and confirm only one partition is scanned. Compare buffer reads against the same query on an unpartitioned copy of the table.
3. **Break pruning.** Write three variants of that query that defeat pruning: one wrapping the partition key in a function, one comparing against a mismatched type, and one filtering on a non-key column only. For each, show the plan touching every partition and state the fix.
4. **Run-time pruning.** Write a query where the partition-key value arrives as a bind parameter or from a join. Confirm the plan lists all partitions but reports `Partitions removed` at execution.
5. **Retention.** Time deleting one month of data two ways: `DELETE FROM ... WHERE ordered_at < ...` on the unpartitioned copy, versus `DETACH` plus `DROP` on the partitioned one. Report both durations, the write-ahead log volume generated, and the table size afterwards.
6. **Load by attach.** Build a new month as a standalone table, index it, add a matching `CHECK` constraint, and `ATTACH` it. Then repeat without the `CHECK` constraint and compare how long `ATTACH` holds its lock.
7. **Layout.** Create two tables holding identical data, one with columns ordered to minimise alignment padding and one deliberately interleaving narrow and wide fixed-width types. Compare `pg_total_relation_size` and the buffer count of a full scan of each.
8. **Compression.** Load a table of large text values with `pglz` and again with `lz4`, comparing total size and the time to read a thousand rows. Then export one detached partition to Parquet with `snappy` and with `zstd`, and report the three file sizes against the original partition's on-disk size.
