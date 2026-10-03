---
lesson_id: de102-09
course_id: de102
pathway: data-engineer
title: Tuning NoSQL Reads and Writes
order: 9
kind: lesson
competency_ids:
  - D5-S2-C01
  - D5-S2-C02
objectives:
  - Diagnose and reduce read and write latency in a NoSQL deployment
---

## Measure, then change

The instincts you built reading PostgreSQL plans transfer directly here. A slow NoSQL query has a plan, or something that serves as one, and the work is the same: find where the time goes, find the misestimate or the wasted read, change one thing, measure again.

What differs is the failure catalogue. Relational tuning is mostly about the planner choosing badly. Document and wide-column tuning is mostly about **the model making an expensive read unavoidable** — the storage layout was fixed when you designed the key, and no amount of tuning rescues a query that has to touch every node. So a fair share of the diagnoses in this lesson end in "change the model", and that is a legitimate outcome, not a cop-out.

## MongoDB: reading the explain output

`explain("executionStats")` is the tool.

```javascript
db.trip.find({ station_id: 42, started_at: { $gte: ISODate("2026-07-01") } })
       .sort({ started_at: -1 })
       .explain("executionStats");
```

The fields that matter:

- **`winningPlan.stage`** — `COLLSCAN` means every document was examined; `IXSCAN` means an index was used; `FETCH` above an `IXSCAN` means documents were retrieved from disk after the index matched; `PROJECTION_COVERED` means the query was answered from the index alone.
- **`totalDocsExamined` versus `nReturned`** — this ratio is the single most useful number in the output. Examining 400,000 documents to return 20 says the index is not selective enough or is missing.
- **`totalKeysExamined` versus `nReturned`** — a large gap here means the index is being scanned rather than seeked; usually a column-order problem.
- **`SORT` in the plan** — an in-memory sort. MongoDB limits an in-memory sort to 100MB; older versions abort beyond that unless `allowDiskUse` is set, and from 6.0 the server spills to disk by default instead (`allowDiskUseByDefault`), which avoids the error but not the cost — and an in-memory sort of any size is work an index could have done for free.
- **`executionTimeMillis`** and, per stage, how much of it each consumed.

Target ratio: `totalDocsExamined` should approach `nReturned`. Every document examined and discarded is I/O you paid for and did not use.

## Index design for MongoDB

The rule for compound index column order is **ESR — Equality, Sort, Range**:

```javascript
db.trip.createIndex({ station_id: 1, started_at: -1, duration_sec: 1 });
```

Equality-matched fields first, then the field you sort on, then range-filtered fields. The reason is the same as for a B-tree composite index in lesson 5: once the scan is crossing a range of values, subsequent fields can only filter, not seek — and if the sort field comes after a range field, the index cannot deliver rows in order and MongoDB adds a blocking `SORT` stage. Getting E, S, and R in the wrong order is the most common reason a "correct-looking" index does not help.

Sort direction matters for compound sorts: an index on `{a: 1, b: -1}` serves `sort({a: 1, b: -1})` and its exact inverse, but not `sort({a: 1, b: 1})`.

**Covered queries** avoid the `FETCH` entirely when every field in the filter, the sort, and the projection is in the index — and you must exclude `_id` explicitly in the projection unless `_id` is in the index. On a hot read path this halves the I/O.

Other index types worth knowing: **multikey** indexes are created automatically over array fields, and index one entry per element, so an index over a 500-element array writes 500 keys per document — another reason unbounded arrays hurt. **Partial** indexes (`partialFilterExpression`) index only matching documents, exactly like a PostgreSQL partial index and for the same savings. **TTL** indexes expire documents on a date field, which is retention with no delete job. **Wildcard** indexes cover unpredictable field names and should be a last resort, since they are large and unselective.

Find what to fix with the **database profiler**, which logs slow operations to a collection you can query:

```javascript
db.setProfilingLevel(1, { slowms: 100 });
db.system.profile.find().sort({ millis: -1 }).limit(10);
```

`$indexStats` shows which indexes are actually being used, so unused ones can be dropped — every index slows every write and consumes cache.

## MongoDB: memory, writes, and storage

**The working set must fit in cache.** WiredTiger caches uncompressed pages in its own cache (about half of available RAM by default) and relies on the filesystem cache beneath it. When the frequently-touched documents and index pages no longer fit, read latency does not degrade gracefully — it steps off a cliff into disk I/O. Watch `wiredTiger.cache` in `serverStatus` for `bytes read into cache` and, critically, for eviction pressure. The fixes, in order of preference: make documents smaller, index more selectively so fewer pages are touched, or add memory.

**Write path.** `insertMany` and `bulkWrite` amortise round trips and are commonly 10–50 times faster than a loop of single inserts; use `ordered: false` when the operations are independent so one failure does not stop the batch. **Write concern** is the latency knob: `w: 1` acknowledges after the primary applies, `w: "majority"` waits for durable acknowledgement from a majority, and `j: true` waits for the journal flush. Each step is safer and slower, and choosing per-operation — strict for financial writes, relaxed for telemetry — is normal. **Read concern** and **read preference** are the mirror pair on reads.

**Storage format and compression.** WiredTiger compresses collection data blocks with `snappy` by default; `zstd` typically gives noticeably better compression at higher CPU cost, and `none` is occasionally right for tiny hot collections. Indexes use prefix compression, which is why short field names and short key values matter more than they would elsewhere — field names are stored in every document, so `started_at` versus `sa` is a real difference across a billion documents, though readability usually wins the argument for anything but the largest collections.

```javascript
db.createCollection("trip", {
  storageEngine: { wiredTiger: { configString: "block_compressor=zstd" } }
});
```

Compression trades CPU for I/O and, indirectly, for cache: better compression means more data per cached page, which on an I/O-bound workload can make the "slower" codec faster end to end. Measure both.

## Cassandra: where the time goes

To tune Cassandra you need its two paths in mind.

**The write path** is deliberately cheap: append to the commit log, insert into an in-memory memtable, acknowledge. Periodically the memtable flushes to an immutable **SSTable** on disk. Nothing is read, nothing is updated in place, nothing seeks. This is why Cassandra absorbs write volume that would flatten a B-tree engine.

**The read path** pays for that.  A read must consult the memtable plus every SSTable that might hold the partition. A **bloom filter** per SSTable cheaply excludes most of them; a partition index locates the offset within those that remain; results are merged by timestamp, newest wins. So read cost scales with **how many SSTables the partition is spread across**, and that is the number tuning targets.

Use `nodetool tablehistograms keyspace.table` — it reports the SSTable count per read as a distribution alongside read and write latency percentiles. A median of one or two is healthy; a p99 in the double digits explains your tail latency by itself. `nodetool tablestats` adds partition size distribution, bloom filter false-positive ratio, and compression ratio. For a single query, CQL `TRACING ON` prints every step the coordinator took with microsecond timings.

## Cassandra: the four things that actually hurt

**Large partitions.** `nodetool tablestats` reports the maximum partition size. Anything approaching 100MB is a problem, and a partition in the gigabytes will cause timeouts and heap pressure. There is no tuning fix; add a bucket to the partition key and migrate.

**Hot partitions.** An evenly-sized but unevenly-*accessed* key concentrates all traffic on one replica set while the rest of the cluster idles. Symptom: one node's latency far exceeds the others'. Fix by adding entropy to the partition key — a bucket, or a small hashed suffix that the client fans out across.

**Tombstones.** A delete writes a marker, not an absence, and that marker must be read and merged on every subsequent read of the partition until it is compacted away after `gc_grace_seconds`. Delete-heavy workloads, collections overwritten wholesale, and rows written with a null value all generate them. Reading a partition containing tens of thousands of tombstones is slow, and past `tombstone_failure_threshold` the query is refused outright. The real fix is a model that expires data with **TTL** and a compaction strategy that drops whole expired SSTables, rather than one that deletes.

**Compaction strategy mismatch.** Compaction merges SSTables, and choosing the wrong strategy is a standing tax:

- **SizeTieredCompactionStrategy** — the default. Merges similarly-sized SSTables. Cheap for write-heavy workloads, but a row updated over time can be spread across many SSTables, so reads suffer.
- **LeveledCompactionStrategy** — maintains non-overlapping levels so a read usually touches one SSTable per level. Much better read latency and space efficiency for read-heavy, update-heavy tables, at roughly twice the write amplification.
- **TimeWindowCompactionStrategy** — buckets SSTables by time window and compacts only within a window. The correct choice for time series with TTL, because an entire expired window is dropped as a file rather than merged row by row.

```sql
ALTER TABLE reading_by_device
  WITH compaction = { 'class': 'TimeWindowCompactionStrategy',
                      'compaction_window_unit': 'DAYS',
                      'compaction_window_size': 1 }
   AND default_time_to_live = 2592000;
```

## Cassandra: consistency, compression, and the small knobs

**Consistency level is a latency dial.** `ONE` returns as soon as one replica answers and is fastest; `QUORUM` waits for a majority and costs the latency of the slowest of those. `LOCAL_QUORUM` keeps the wait within one datacenter. Setting it per statement — strong for reads that must not be stale, weak for telemetry — is normal and is usually the cheapest latency improvement available. **Speculative retry** (`speculative_retry = '99p'`) reissues a read to another replica when the first is slower than the 99th percentile, which trims tail latency at the cost of extra load.

**Compression** is configured per table, and the chunk length is the interesting parameter:

```sql
ALTER TABLE reading_by_device
  WITH compression = { 'class': 'ZstdCompressor', 'chunk_length_in_kb': 16 };
```

Every read decompresses at least one whole chunk, so a large chunk gives better ratios and wastes more work on small point reads, while a small chunk suits random access at some cost in space. `LZ4Compressor` is the fast default; `ZstdCompressor` compresses substantially better for archival or scan-heavy tables. `nodetool tablestats` reports the achieved ratio so you can compare rather than guess.

Two more worth knowing: the **key cache** is on by default and cheap; the **row cache** is off by default and is only worth enabling for a small set of genuinely hot, read-mostly, rarely-updated partitions, because an update invalidates the cached row and a large row cache steals heap from everything else. And batches are not a performance feature in Cassandra — an unlogged batch across many partitions makes one coordinator do work that concurrent individual writes would have spread across the cluster. Batch only within a single partition.

## Practice

Run MongoDB and a local Cassandra (a single node is enough; a three-node Docker cluster is better). Load at least five million rows into each. Every step below requires a measured before and after.

1. **Baseline.** Pick three queries per system. Record `executionTimeMillis`, `totalDocsExamined`, and `nReturned` for the Mongo ones, and `nodetool tablehistograms` percentiles plus a `TRACING ON` capture for the Cassandra ones.
2. **Force a `COLLSCAN`.** Run a Mongo query with no usable index and record the document-examined ratio. Add an index following ESR, re-measure, and report both numbers. Then deliberately build the same index with the sort field after the range field and show the `SORT` stage reappear.
3. **Cover it.** Take one high-frequency query and make it fully covered, verifying the `FETCH` stage disappears. Report the change in `totalDocsExamined` and in latency.
4. **Profile.** Enable the profiler at 50ms, drive a mixed workload for several minutes, then produce a ranked list of your five slowest operation shapes and a one-line diagnosis for each.
5. **Bulk writes and write concern.** Insert 100,000 documents one at a time, then with `bulkWrite` at `ordered: false`. Then repeat the bulk insert at `w: 1`, `w: "majority"`, and `w: "majority", j: true`. Report all four timings in a small table.
6. **Compression.** Create two identical collections with `snappy` and `zstd`, load the same data, and compare `storageSize`, `totalIndexSize`, and the latency of a scan-heavy query. State which you would ship and why.
7. **Large partitions.** Build a Cassandra table with no bucketing and write until `nodetool tablestats` shows a partition over 100MB. Measure read latency, then rebuild with a time bucket in the partition key and measure again.
8. **Tombstones.** Delete 30% of the rows in a partition, then read it and capture the tombstone count from tracing. Rebuild the table using TTL plus `TimeWindowCompactionStrategy` and demonstrate that expired data leaves without generating read-time tombstone scans.
9. **Compaction strategy.** Take an update-heavy table under `SizeTieredCompactionStrategy` and record the SSTables-per-read distribution. Switch to `LeveledCompactionStrategy`, let compaction settle, and record it again along with any change in write latency.
10. **Consistency.** Run the same read at `ONE` and at `QUORUM` a thousand times each and report p50 and p99 for both. Then write one paragraph stating which consistency level you would use for this table and what correctness risk you are accepting.
