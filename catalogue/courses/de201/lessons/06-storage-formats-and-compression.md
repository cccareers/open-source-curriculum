---
lesson_id: de201-06
course_id: de201
pathway: data-engineer
title: Storage Formats and Compression
order: 6
kind: lesson
competency_ids:
  - D5-S2-C02
  - D4-S1-C03
objectives:
  - Choose a file format, partition layout, and compression codec for a given query pattern
---

## Layout is the cheapest optimisation you have

The fastest way to process a byte is not to read it. Everything in this lesson follows from that sentence.

A job that scans 4 TB of CSV and a job that scans 40 GB of well-laid-out Parquet can return the identical answer, and the second one finishes in a hundredth of the time on the same cluster. No configuration change, no extra machines, and no cleverer code will close that gap, because the gap is I/O the second job never performed. This is why layout comes before tuning in this course: the most common fix for a slow job is a storage decision, not a config flag.

Three decisions do nearly all the work, and they compose:

1. **Format** — how records are arranged inside a file, which determines whether you can read one column without the others.
2. **Partition layout** — how files are arranged in directories, which determines whether you can skip whole files without opening them.
3. **Compression** — how bytes are encoded, which trades CPU against I/O and, critically, against splittability.

Get all three right for your dominant query pattern and the cluster stops being the bottleneck.

## Row formats and column formats

A **row-oriented** file stores record 1 completely, then record 2, and so on. CSV, JSON, and Avro work this way. To read one column of a billion-row file you must still traverse every byte, because the values you want are interleaved with the ones you do not.

A **columnar** file stores all values of column A together, then all values of column B. Parquet and ORC work this way. Reading two columns out of eighty touches roughly a fortieth of the bytes.

Analytical work — the aggregations, feature tables, and scans this whole course is about — reads few columns from very wide tables, which is exactly the case columnar formats are built for. Columnar storage also compresses far better, because a column holds values of one type with similar magnitudes and heavy repetition, and compressors love that.

Row formats keep two legitimate niches: streaming and record-at-a-time ingestion, where you append single records and cannot rewrite a column block, and full-record retrieval, where you always want every field of one record.

The formats you will meet:

- **CSV** — universal, human-readable, and bad at everything else. No types, no schema, ambiguous nulls, quoting bugs, and no way to skip a column. Acceptable as an interchange boundary, never as a processing layer.
- **JSON** (newline-delimited) — self-describing and flexible; enormously verbose, because every record repeats every key name, and slow to parse. Fine for raw landing zones.
- **Avro** — a binary *row* format with a real schema stored in the file, strong schema-evolution rules, and good splittability. The standard choice for streaming payloads and for record-oriented storage.
- **ORC** — columnar, originating in the Hive world, with strong built-in indexes. Excellent; ubiquitous where Hive is.
- **Parquet** — columnar, the de facto standard across Spark and the wider ecosystem. This is your default.

## Inside a Parquet file

Understanding Parquet's internal structure is what turns "use Parquet" from a slogan into a set of decisions.

A file is divided into **row groups**, each holding a horizontal slice of rows (commonly 128 MB of data). Within a row group, each column's values for those rows are stored contiguously as a **column chunk**, and each chunk is divided into **pages**, the unit of compression and encoding. A **footer** at the end of the file holds the schema plus, for every column chunk, its minimum, maximum, null count, and byte offset.

![A Parquet file divided into row groups, each holding one column chunk per column, with min/max statistics recorded in the footer](./img/parquet-file-layout.png)

That structure buys three things.

**Column pruning.** The reader consults the footer, seeks straight to the byte offsets of the columns in your `select`, and never touches the rest. `SELECT city, amount` on an eighty-column table reads two column chunks per row group.

**Predicate pushdown via statistics.** For `WHERE amount > 500`, the reader checks each row group's recorded maximum for `amount`. If the maximum is 120, the entire row group is skipped without decompressing a single page. On sorted or naturally clustered data this eliminates most of the file; on randomly ordered data every row group contains both large and small values and nothing can be skipped — which is why *sorting data on your common filter column before writing* is a real optimisation, not a nicety.

**Cheap encodings before compression.** Parquet applies dictionary encoding to low-cardinality columns (store each distinct string once and reference it by a small integer), run-length encoding to repeated values, and bit-packing to small integers. A `country` column with 200 distinct values across a billion rows collapses to almost nothing. These encodings often save more than the compression codec that runs afterwards.

Verify it rather than trusting it. In the physical plan, `FileScan parquet` reports `ReadSchema` (proof of column pruning) and `PushedFilters` (proof of predicate pushdown). A filter absent from `PushedFilters` is being applied after reading — usually because it is wrapped in a UDF, or applied to a column produced by an expression rather than to the stored column itself.

## Compression codecs

Compression applies within a file, page by page, and the choice is a three-way trade between ratio, CPU cost, and splittability.

| Codec | Ratio | Compress / decompress speed | Splittable on its own | Typical use |
| --- | --- | --- | --- | --- |
| **Snappy** | modest | very fast both ways | no (fine inside Parquet) | default for hot analytical data |
| **Zstd** | good, tunable by level | fast decompress, moderate compress | no (fine inside Parquet) | best general default on modern clusters |
| **Gzip** | good | slow compress, slow decompress | **no** | archival; a trap for raw text |
| **LZ4** | modest | fastest | no (fine inside Parquet) | shuffle and cache compression |
| **Bzip2** | high | very slow | **yes** | rarely worth it |

**Splittability is the concept to carry away.** A file is splittable when a reader can start decoding from the middle. Lesson 3 said parallelism is capped by partition count; a non-splittable file is exactly one partition. A single 20 GB gzipped CSV is processed by *one core*, no matter how large your cluster, and this is one of the most common causes of an inexplicably slow job.

The crucial nuance: **inside Parquet, splittability comes from the container, not the codec.** Parquet compresses each page independently and records offsets in the footer, so a Snappy-compressed Parquet file is perfectly splittable at row-group boundaries. "Gzip is not splittable" is a statement about raw `.csv.gz` and `.json.gz` files, not about `.parquet` with gzip pages.

Choosing: use **Snappy or Zstd** for data you query often — decompression speed matters more than a few percent of ratio, and Zstd typically gives both better ratio and comparable speed on current hardware. Use a **high Zstd level or gzip** for cold archives read rarely. For raw text landing zones that must stay compressed, prefer **many moderate files over one huge one**, since each file is then a split even if the codec is not.

## Partition layout

Partitioning writes data into directories named by column value, so the reader can skip directories entirely by path:

```
/data/events/event_date=2026-07-01/part-00000.snappy.parquet
/data/events/event_date=2026-07-01/part-00001.snappy.parquet
/data/events/event_date=2026-07-02/part-00000.snappy.parquet
```

```python
(
    df.repartition("event_date")
      .write
      .mode("overwrite")
      .partitionBy("event_date")
      .parquet("/data/events")
)
```

A query filtering `event_date = '2026-07-02'` lists only that directory. This is **partition pruning**, and unlike statistics-based skipping it costs nothing at all — the files are never opened. It is the single biggest lever in the lesson.

The rules for choosing partition columns:

**Partition on what you filter on, almost always time.** If every query has a date range, partition by date. Partitioning on a column nobody filters by buys nothing and costs directory sprawl.

**Watch cardinality from both ends.** Too few partitions and pruning barely helps: partitioning by `country` when 70% of rows are one country still reads 70% of the data. Too many and you drown in tiny files: partitioning by `user_id` with ten million users creates ten million directories, and the *listing* alone will cost more than the scan — a fatal pattern on object storage, where listing is a paged network call.

**Aim for partitions of roughly 0.5 GB to a few GB.** If daily partitions are 20 MB, partition monthly. If daily partitions are 500 GB, add a second level such as `event_date` then `region` — but keep nesting shallow; two levels is usually the practical limit.

**Never partition on a high-cardinality key.** The correct tool for a high-cardinality join or filter key is **bucketing**: a fixed number of files determined by `hash(key) mod n`, written once and reused. Bucketing keeps file counts bounded, and two tables bucketed identically on the same key can be joined with no shuffle at all, because the matching records already sit in corresponding buckets.

```python
(
    df.write
      .mode("overwrite")
      .bucketBy(256, "customer_id")
      .sortBy("customer_id")
      .saveAsTable("events_bucketed")
)
```

Bucketing requires a table in a catalog rather than a bare path, and both sides of a join must share the bucket count and key to get the benefit.

Finally, do not confuse the two senses of "partition". A **Spark partition** is a slice of data in memory processed by one task; a **storage partition** is a directory on disk. `repartition()` changes the first, `partitionBy()` the second. Matching them at write time — `repartition("event_date")` before `partitionBy("event_date")` — is what keeps each directory to one file per task instead of one file from every task.

## File sizing and compaction

Inside each partition directory, target files of roughly **128 MB to 1 GB**. Below that, per-file overhead (open, read the footer, schedule a task) starts to dominate the useful work, and the NameNode or object store metadata cost from lesson 2 comes back. Above a few GB, you lose scheduling flexibility and a single failed task has to redo a lot.

Small files accumulate for structural reasons, not careless ones: a streaming job writing every minute produces 1,440 files a day per partition; an hourly batch job with 200 shuffle partitions writes 200 files per hour. The routine repair is **compaction** — read a partition, coalesce it to a sensible file count, write it back:

```python
target_files = 8
(
    spark.read.parquet("/data/events/event_date=2026-07-01")
    .repartition(target_files)
    .write.mode("overwrite")
    .parquet("/data/events/event_date=2026-07-01")
)
```

Two warnings. Never read and overwrite the same path in one job unless the framework supports it explicitly — write to a staging path and swap, or you can destroy the input mid-read. And decide `target_files` from actual size: measure the directory, divide by your target file size, round up.

Scheduling compaction to run automatically is orchestration, which belongs to de210. Knowing *why* and *to what size* is this lesson's job.

## Schema evolution

Datasets change: a column is added, a type widens, a field is dropped. How gracefully that goes is a property of the format.

Parquet and ORC store the schema per file, and readers **merge by column name**. A file written before a column existed simply yields nulls for it. Adding a nullable column is therefore safe and requires no rewrite. Dropping a column is safe for readers that do not reference it. Renaming is *not* safe — to a name-matching reader, a rename is a drop plus an add, and the old data disappears from the new column.

Type changes are the sharp edge. Widening `int` to `long` is usually tolerated; changing `string` to `int`, or `double` to `decimal`, will fail at read time or produce nulls depending on settings. Avro's evolution rules are the most explicit of the formats, with reader and writer schemas resolved against declared defaults, which is why it dominates message payloads.

Spark can reconcile differing files with `.option("mergeSchema", "true")`, but this reads every file's footer to build the union and is expensive on large datasets. Treat it as a diagnostic, not a production setting.

## Table formats, in one paragraph

You will hear about **Delta Lake**, **Apache Iceberg**, and **Apache Hudi**. They are not new file formats — they still store Parquet — but a transaction log and manifest layered on top, which buys atomic commits, snapshot isolation, time travel to an earlier version, row-level updates and deletes, and schema evolution that includes safe renames. They also solve the small-file and listing problems more systematically than manual compaction does. Know what they are and what problem they solve; everything in this lesson about formats, codecs, layout, and file sizing applies unchanged underneath them.

## Choosing, on purpose

Work from the dominant query pattern backwards.

- *Daily aggregations over a wide event table, always filtered by date:* Parquet, Zstd or Snappy, partitioned by `event_date`, files around 256 MB, sorted on the secondary filter column before writing.
- *Raw landing zone from an external feed:* keep the source format for fidelity (often JSON or CSV), compressed as many moderate files rather than one huge one, and convert to Parquet in the first processing step.
- *Streaming sink written every minute:* Avro or Parquet with frequent small files accepted at write time and a compaction pass consolidating them afterwards.
- *A fact table joined constantly on one high-cardinality key:* Parquet, bucketed on that key, partitioned by date.
- *Cold archive, read once a year for compliance:* Parquet with a high Zstd level; ratio is what matters and read latency does not.

## Practice

Start from a raw dataset of at least a few GB in CSV or JSON, with a timestamp and at least fifteen columns.

1. **Measure the format gap.** Write the dataset as (a) uncompressed CSV, (b) gzipped CSV, (c) Snappy Parquet, (d) Zstd Parquet. Record total size on disk for each. Then run the identical aggregation over two of the columns against each layout, recording wall-clock time and the bytes read reported in the Spark UI. Present all four results in a table and explain the size and time ordering.

2. **Prove the pushdown.** Against the Parquet copy, run a query with a selective filter and `explain(mode="formatted")`. Locate `ReadSchema` and `PushedFilters` and quote them. Then wrap the same filter condition in a Python UDF, re-run `explain`, and show what disappeared from the plan and what it cost in bytes read.

3. **Make sorting pay.** Write the same Parquet data twice — once in arbitrary order, once sorted by your main filter column. Run an identical selective query against both and compare bytes read and runtime. Explain the result in terms of row-group min/max statistics.

4. **Demonstrate the splittability trap.** Write the dataset as one large `.csv.gz` file and, separately, as sixteen smaller `.csv.gz` files of the same total size. For each, report `df.rdd.getNumPartitions()`, the task count in the scan stage, and the wall-clock time for a full aggregation. Explain the numbers.

5. **Choose and defend a partition layout.** Compute the row count and byte size per candidate partition column (date, month, region). Pick a layout, write the data with it, and demonstrate pruning by running a filtered query and reporting the number of files read versus the total. Justify in a short paragraph why you rejected the other candidates, citing partition sizes.

6. **Break it deliberately, then repair it.** Partition the same dataset by a high-cardinality column and record how many directories and files result, how long a simple `count()` takes, and how long merely listing the dataset takes. Then compact into a sensible layout, re-measure, and state the rule of thumb you would give a teammate for maximum acceptable partition cardinality.

7. **Evolve the schema.** Append a new batch that adds one nullable column and drops another. Read the whole dataset back and show what the reader returns for both columns across old and new files. Then attempt a column *rename* in a new batch, read again, and explain exactly what was lost and why name-based resolution caused it.
