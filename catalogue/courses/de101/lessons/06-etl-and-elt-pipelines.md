---
lesson_id: de101-06
course_id: de101
pathway: data-engineer
title: ETL and ELT Pipelines
order: 6
kind: lesson
competency_ids:
  - D1-S1-C01
objectives:
  - Explain the difference between ETL and ELT and when each is appropriate
---

## What a pipeline is

A data pipeline is a repeatable process that moves data from one or more sources to one or more destinations, changing its shape along the way. The word doing the work in that sentence is **repeatable**. A one-off script that a person runs by hand and babysits is not a pipeline; it is a chore. A pipeline runs on a schedule or a trigger, survives the failure of any single run, and produces the same result whether it runs once or three times.

Every pipeline decomposes into three activities, and the two acronyms in this lesson's title are just two orderings of the same three letters.

**Extract** — read data out of a source without damaging it. Sources are files, APIs, databases, message queues, and vendor exports. Extraction is mostly a problem of access, pagination, rate limits, and knowing what changed since last time. The next lesson is devoted to it.

**Transform** — convert raw data into something usable: cast types, standardize values, deduplicate, join, aggregate, apply business rules, and reshape into the target model.

**Load** — write the result into the destination so consumers can use it, without ever leaving that destination in a half-written state.

The interesting question is not what the three letters mean. It is **where the transform happens and when**.

## ETL: transform before you load

In the ETL ordering, data is extracted from the source, transformed in a separate processing environment, and only the finished result is written to the destination.

```text
source  ->  extract  ->  [ transform in a separate engine ]  ->  load  ->  warehouse
```

This was the dominant pattern for decades, and the reason is economic. Storage used to be expensive, so you did not keep anything you were not going to use. The destination — a data warehouse appliance — was the most expensive machine in the building, sold by capacity, so you did not waste its cycles on cleanup work. A separate transformation tier, running on cheap commodity servers, did the heavy lifting and delivered a tidy result.

What ETL gives you:

- **Only clean data reaches the warehouse.** Consumers never see raw mess, which matters when the destination is directly exposed to business users.
- **Sensitive fields can be dropped or masked before they land**, which is sometimes a hard requirement rather than a preference.
- **Transformation cost is decoupled from the destination**, so an expensive destination is used only for serving.
- **Volume reaching the destination is reduced**, which matters when the destination is small or the connection is slow.

What ETL costs you:

- **Anything you did not keep is gone.** If the business changes a definition, you cannot recompute history you never loaded — you have to re-extract from a source that may no longer have it.
- **A separate processing tier to build and operate**, with its own scaling, failure modes, and skill requirements.
- **The transformation logic lives somewhere other than the data**, often in a tool with weaker version control and testing than plain code or SQL.

## ELT: load first, transform in place

In the ELT ordering, raw data is extracted and loaded into the destination essentially as-is, and transformation happens afterwards, inside that destination, usually as SQL.

```text
source  ->  extract  ->  load raw  ->  warehouse  ->  [ transform in SQL ]  ->  curated tables
```

This ordering became dominant because the economics inverted. Storage became cheap enough that keeping everything is a rounding error. Modern analytical databases separate storage from compute and scale compute elastically, so running a large transformation in the warehouse is no longer stealing capacity from serving. And SQL turned out to be a better language for expressing transformations than most purpose-built tools, because everyone on the team can read it and it version-controls like any other code.

![Two pipeline diagrams compared: ETL transforms data in a separate engine before loading only curated output, while ELT loads raw data into the warehouse and transforms it there into curated tables](./img/etl-vs-elt.png)

What ELT gives you:

- **Raw history is preserved.** When a definition changes, you rebuild the curated layer from raw rather than re-extracting. This single property is worth more than most teams expect, and it is the strongest argument for ELT.
- **A simpler extraction step.** Extraction becomes a dumb copy, which means fewer things to get wrong and faster onboarding of a new source.
- **Transformations in SQL**, reviewable by analysts, testable, and diffable.
- **Elastic compute** — a heavy backfill can borrow capacity and give it back.

What ELT costs you:

- **Raw, unvalidated data lives in the destination**, so access control and clear layer naming become essential rather than optional.
- **Compute is metered.** A careless transformation that rescans everything nightly turns into a bill someone will ask you about.
- **Sensitive data lands before it is masked**, which may be unacceptable depending on what the data is.
- **The destination must be capable.** ELT assumes an analytical engine that can chew through large transformations; a small operational database cannot.

## Choosing between them

| Question | Points to ETL | Points to ELT |
| --- | --- | --- |
| Can the destination handle heavy transformation? | No | Yes |
| Is storing raw data acceptable and affordable? | No | Yes |
| Are business definitions stable? | Yes | No — they will change |
| Must sensitive fields never land in the destination? | Yes | No |
| Is the destination an operational or embedded system? | Yes | No |
| Who owns the transformation logic? | A dedicated engineering tier | Engineers and analysts together |
| Is the transformation expressible in SQL? | No, it needs custom code | Yes |

Two honest caveats. First, this is not a fashion contest. ETL is the right answer whenever the destination cannot do the work, whenever the raw data legally or contractually must not land, or whenever the transformation needs something SQL cannot express. Loading a curated extract into a small reporting database is ETL and is entirely correct.

Second, real pipelines are usually **both**. A typical modern design does light transformation during extraction — decoding, deduplicating a batch, dropping a forbidden column — then lands the result, then does the substantial modeling work in the warehouse. That is sometimes written EtLT, with the small `t` for the light in-flight work. Do not force a design into one acronym; describe what actually happens.

## Layering the destination

Whichever ordering you choose, resist the temptation to write one job that reads from the source and produces the final consumer-facing table. Layers are what make a pipeline debuggable.

**Raw (or landing).** Data exactly as received, with as little interpretation as possible: original column names, everything as text if that is what arrived, plus a few metadata columns you add — the source name, the extraction timestamp, the run id, and the source file or endpoint. **Never edit this layer.** It is append-only and it is your ability to reconstruct anything.

**Staging.** One step of interpretation: types cast, columns renamed to your conventions, obvious junk filtered, deduplicated to one row per business key. Still one staging table per source table, no joins across sources. This layer is where "what did the source send?" ends and "what do we believe?" begins.

**Curated (or marts).** The models from lesson 3 — facts, dimensions, and aggregates built for consumption. Joins across sources happen here. Business definitions live here, in one place, so "revenue" means one thing.

When a number is wrong, layering lets you bisect: is it wrong in curated but right in staging? Then the bug is in your business logic. Wrong in staging but right in raw? A casting or dedup bug. Wrong in raw? The source sent it that way, and now you have proof, which is a much better conversation to have with an upstream team than an accusation.

## Making a pipeline safe to re-run

This is the section that separates a script from a pipeline. Assume every run will fail at some point, at the worst possible moment, and be re-run by a tired person at 3 a.m.

### Idempotency

**A pipeline is idempotent when running it twice produces the same result as running it once.** Without this property, every failure becomes an investigation into what partially happened.

The non-idempotent pattern is a bare append:

```sql
INSERT INTO fact_orders SELECT ... FROM staging_orders;
```

Run that twice and every row is duplicated. Three safe patterns instead:

**Delete-and-insert by partition.** Decide the unit of work — usually a day — delete it, insert it, in one transaction.

```sql
BEGIN;
DELETE FROM fact_orders WHERE order_date = DATE '2024-03-17';
INSERT INTO fact_orders (order_date, order_id, customer_key, order_total)
SELECT order_date, order_id, customer_key, order_total
FROM   staging_orders
WHERE  order_date = DATE '2024-03-17';
COMMIT;
```

**Merge (upsert) on a key.** Update rows that exist, insert those that do not.

```sql
MERGE INTO dim_customer AS tgt
USING staging_customer AS src
  ON tgt.customer_id = src.customer_id
WHEN MATCHED THEN UPDATE SET
  full_name = src.full_name,
  email     = src.email,
  state_code = src.state_code
WHEN NOT MATCHED THEN INSERT (customer_id, full_name, email, state_code)
  VALUES (src.customer_id, src.full_name, src.email, src.state_code);
```

**Full rebuild into a swap table.** Build the whole table under a temporary name, then swap it in atomically. Simple, always correct, and viable until the table gets large enough that the cost hurts. Do not dismiss it — for small tables it is the cheapest correctness you will ever buy.

### Full versus incremental loads

A **full load** reads everything from the source every run. It is simple, self-healing (a bad run is fixed by the next one), and it stops being viable somewhere between a few million and a few hundred million rows depending on your budget.

An **incremental load** reads only what changed. It needs a **watermark** — a high-water mark recorded from the previous successful run, usually the maximum `updated_at` seen:

```text
run n:    extract WHERE updated_at > '2024-03-17 02:00:00'
          ... on success, record max(updated_at) as the new watermark
```

Three details that make the difference between a working incremental load and a silently lossy one:

- **Overlap slightly.** Read from `watermark - 1 hour` rather than exactly the watermark. Clock skew and transactions that commit out of timestamp order will otherwise drop rows. Overlap is safe precisely because your load is idempotent.
- **Advance the watermark only after the load succeeds**, and store it durably. A watermark advanced on a failed run creates a permanent hole.
- **Deletes are invisible.** A row deleted at the source has no `updated_at` change to detect, so it lingers in your destination forever. Either require soft deletes upstream, or periodically reconcile with a full key comparison.

### Backfills

A backfill re-processes history — because you added a column, fixed a bug, or onboarded a source that has two years of past data. Design for it from day one:

- **Parameterize the pipeline by date range** rather than hard-coding "yesterday." A pipeline that can only process yesterday cannot be backfilled without editing it, and editing code under pressure is how outages get worse.
- **Process in chunks**, one day or one month at a time, so a failure halfway through costs one chunk rather than the whole run.
- **Make the backfill use the same code path as the normal run.** A separate backfill script drifts from the real one and will eventually produce different numbers.

### Failure handling

- **Fail loudly and stop.** A pipeline that catches every exception and continues produces silently incomplete data, which is worse than no data because people trust it.
- **Retry only what is worth retrying.** Network timeouts and rate limits are transient — retry with exponential backoff. A schema mismatch or a validation failure is not transient; retrying it just wastes time before the same alert fires.
- **Quarantine bad records rather than dropping them.** Route rows that fail validation to a side table with the reason attached. Dropping them means nobody ever finds out; failing the whole run on one bad row out of a million is usually too brittle. The quarantine table is the middle path, and it should be monitored — a quarantine nobody reads is a delete with extra steps.
- **Record every run.** A small run-log table with the run id, pipeline name, parameters, start and end time, row counts in and out, and status turns "did last night work?" into a query instead of an archaeology project.

## Efficiency and scale

The competency behind this lesson asks for pipelines that are efficient and scalable, so a few principles that hold regardless of tooling:

**Move less data.** The cheapest transformation is the one that never touches a row. Filter and project at the source — select the six columns you need, not all forty; ask the source for the date range, do not fetch everything and discard. Incremental beats full whenever it is safe.

**Push work to where the data already is.** If a database can do the filter, aggregation, or join, let it, rather than pulling raw rows across a network to do the same work in application memory. This is the single biggest performance lever available to a junior engineer and it costs nothing.

**Do not process row by row.** A loop that issues one `INSERT` per record spends nearly all of its time on round trips. Batch the writes — a few thousand rows per statement — and the same job finishes in a fraction of the time.

**Stream rather than accumulate.** Reading a 4 GB file into a list exhausts memory on a small worker. Process in chunks and hold only what you need.

**Partition the destination** by the column you filter on, usually a date. Partitioning is what lets delete-and-insert touch one day instead of rewriting a table, and what lets a query for one month skip eleven twelfths of the data.

**Make the unit of work small.** A pipeline built as many small, independently re-runnable steps recovers from failure cheaply. One monolithic job that takes six hours and must restart from zero is a scaling problem long before the data volume is.

A closing note on scope: everything above is about pipeline *design*. Scheduling many pipelines, expressing dependencies between them, and managing retries centrally is the job of an orchestrator, and that is a later course in this pathway. Do the design work by hand first — the tools make far more sense once you have felt the problems they solve.

## Practice

**1. Design the same pipeline both ways.** A retailer has a transactional database of orders (the schema from lesson 3), a daily CSV of store inventory counts dropped on an SFTP server, and a marketing platform's API of email campaign results. The business wants a daily dashboard of revenue by category and region, plus the ability to answer new questions about the last two years without re-extracting.

Produce two designs, one ETL and one ELT. For each, write: the sequence of steps, where the transform runs, exactly what lands in the destination, how the raw data (if any) is retained, and how a definition change to "revenue" six months from now would be handled. Then write a 200-word recommendation choosing one, naming the requirement that decides it.

**2. Make a load idempotent.** Here is a real-shaped bad job. Rewrite it so that running it twice in a row produces the identical table, and so that a failure midway leaves the destination untouched. State which of the three safe patterns you chose and why.

```sql
INSERT INTO daily_revenue (order_date, category_name, revenue)
SELECT DATE(o.placed_at), c.category_name, SUM(ol.quantity * ol.unit_price)
FROM orders o
JOIN order_lines ol ON ol.order_id = o.order_id
JOIN products p ON p.product_id = ol.product_id
JOIN categories c ON c.category_id = p.category_id
WHERE DATE(o.placed_at) = CURRENT_DATE - 1
GROUP BY DATE(o.placed_at), c.category_name;
```

**3. Trace an incremental load's failure modes.** Assume the job above becomes incremental on `orders.updated_at` with a stored watermark. Write down what happens, concretely, in each of these situations, and what you would change to prevent it: (a) the job fails after inserting rows but before recording the watermark; (b) a transaction at the source commits at 02:00:05 with an `updated_at` of 01:59:58, one second after your run read up to 02:00:00; (c) an order is hard-deleted at the source; (d) someone re-runs the job for a date already loaded.

**4. Layer an existing mess.** Take the query from exercise 2 and split it into raw, staging, and curated layers. Define the tables at each layer, state each table's grain, and say which layer you would look at first for each of these three symptoms: revenue is double what it should be; a category is missing entirely; yesterday's data is absent.

**5. Cost a design.** For your chosen design in exercise 1, estimate the data volume moved per day and per year given 5,000 orders and 15,000 order lines a day. Then identify the two most expensive operations in your pipeline and describe one change to each that reduces work without changing the result.
