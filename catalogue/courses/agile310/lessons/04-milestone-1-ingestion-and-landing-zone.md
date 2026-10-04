---
lesson_id: agile310-04
course_id: agile310
pathway: data-engineer
title: "Milestone 1: Ingestion and Landing Zone"
order: 4
kind: project
competency_ids:
  - D1-S1-C02
  - D6-S1-C01
objectives:
  - Ingest source data into a landing zone reliably and repeatably
---

## Goal

Get your capstone's source data into your cloud landing zone, automatically, from at least two different kinds of source, in a way that produces the same result whether it runs once or five times.

This is the first of three graded milestones on one continuous project. Everything you land here is what Milestone 2 models and what Milestone 3 schedules, so the bar is not "I have the data" — it is "a job I did not touch this week put the data there, and I can prove what it did."

Two competencies are assessed. Automating ingestion from multiple sources (D1-S1-C02) is the substance of the work. Deploying and managing a cloud data solution (D6-S1-C01) is how it is judged: the job runs in your cloud account, as a workload identity, against the environment you built in lesson 3 — not on your laptop against a local folder.

Budget seven hours. Spend the first hour reading source documentation and the last hour on the run log, and you will be fine.

## The scenario

You are the only data engineer on this. An analyst is waiting on the answer to the question in your design document, and they will start querying whatever you produce as soon as it exists. Your sources are outside your control: one of them will change a column name at some point, one will rate-limit you, and both will occasionally return the same record twice.

Your job in this milestone is to build the layer that absorbs all of that — a landing zone that is a faithful, dated, immutable record of what each source actually sent, plus a job that keeps it current without anyone watching.

## Requirements

Deliver six things.

**1. At least two sources, of different kinds.** The pair must include at least one bulk source (a file drop, a bulk download, a database extract) and at least one request-based source (an HTTP API, a paginated endpoint, a service SDK). Both must be on the program-approved list and both must be public or synthetic. If a source needs credentials, they come from your secret manager at runtime.

**2. An immutable, partitioned landing zone.** Raw records land in object storage, in the source's own shape, under a path that carries the entity and the ingestion date — for example `raw/trips/ingest_date=2026-03-01/`. Landed objects are never edited or overwritten in place by any later stage. Compress where the format allows it.

**3. Incremental ingestion with a watermark.** The job asks each source only for what changed since the last successful run, using a high-water mark it persists somewhere durable — an object, a small table, a parameter store entry. A full re-fetch every run is not incremental, no matter how fast it is. For a file-drop source that has no "changed since" filter, the watermark is the record of which files you have already processed: file name, size, and checksum in a small registry, so a re-run skips files it has landed and picks up only new ones (the processed-files registry from de210).

**4. Idempotent behaviour.** Running the job twice for the same logical window leaves the landing zone in the same state as running it once — same effective record set, no duplicated partitions, no silently doubled counts downstream. Decide and document how you achieve this: a deterministic object key, a manifest that suppresses reprocessing, or an atomic partition replace. Any of the three is acceptable; not having chosen one is not.

**5. A run manifest.** Every run appends a structured record capturing, at minimum: run id, source name, logical window, start and end time, records read, records written, bytes written, object paths written, status, and error text where it failed. JSON lines in the landing bucket is entirely sufficient. This is the evidence base for the rest of the course — Milestone 3's monitoring reads it, and your final presentation quotes it.

**6. Deployed and runnable in the cloud.** The job runs as a container task or serverless function in your account, as a dedicated workload identity, invoked with a single command or console action. The shape you chose in lesson 3 is the shape you deploy. It must not require your personal credentials.

**Governance acceptance criteria.** These come from ds320 and they are graded here as part of the milestone, not separately:

- No real personal or customer data enters the account. If your source has fields that look personal even in a public dataset, list them and state your handling — dropped at ingest, retained raw with restricted access, or masked in staging.
- The landing prefix is writable only by the ingestion identity; every other identity has read at most. Show the grant.
- Each landed object carries provenance: the source name, the fetch timestamp, and the source's own identifier or file name, either in the path, in the object metadata, or as columns added to each record.
- The run manifest is your lineage record for this layer. It must be possible to take any landed object and say which run produced it and from which source window.

## Constraints

- **Land raw, transform later.** No cleaning, no type casting, no deduplication of business records, no filtering during ingestion. Adding provenance columns is allowed; changing what the source sent is not. Cleaning belongs to Milestone 2, and a landing zone that has been "helpfully" tidied cannot be used to rebuild from.
- **No manual steps.** No file you download by hand, no credential typed at a prompt, no notebook cell you run to make it work. If a human has to do something, it is not done.
- **Secrets from the secret manager only.** Nothing sensitive in the repository, the image, or a log line.
- **Respect the source.** Honour rate limits, set a request timeout, use backoff on retry, and identify your client honestly in a user-agent string. Getting your program blocked from a public dataset is a failure of this milestone.
- **Bounded retries.** A capped retry count with exponential backoff, and a maximum run duration. An unbounded retry loop is both a reliability bug and a cost bug.
- **Streaming is optional.** Batch on a schedule is the expected shape. If your question needs continuous ingestion and you have hours to spare, propose the trade in review first — de201 already assessed streaming, and it must not come out of the modelling milestone's budget.
- **Orchestration is out of scope here.** One invocable job with parameters. Scheduling, dependencies, and alerting arrive in Milestone 3.

## Definition of done

You are finished when every one of these is true and you can demonstrate it live.

- One command or console action runs the job in the cloud for a given logical window, with no local credentials involved, and it completes without intervention.
- Both sources land data on that run, and you can navigate to the objects and open one.
- Running the job twice for the same window leaves the landing zone in a state you can show is equivalent to running it once. You can produce the object listing or count that proves it.
- A run with no new data at the source completes successfully and writes a manifest entry showing zero records, rather than failing or writing an empty partition that later breaks a reader.
- The watermark advances only after a successful write. Killing the job mid-run and restarting it re-fetches the interrupted window rather than skipping it — demonstrate this by killing a run.
- A forced failure on one source (bad credential, or a URL you break on purpose) produces a manifest entry with status failed and a readable error, and does not corrupt or half-write a partition.
- Backfilling an earlier window works: pick a date before your first run, run the job for it, and show the partition appearing in the right place without disturbing existing partitions.
- Every landed record or object can be traced to a source, a fetch time, and a run id.
- The ingestion identity's grants are visible and narrow; an attempt to write to the landing prefix with the transform identity is denied, and you can show the denial.
- Your repository contains the job source, the container or function definition, the deploy step, and a README section stating how to run it for an arbitrary window.
- The run manifest contains entries from at least five real runs, including at least one failure and one zero-record run.
- Row counts are reconciled at least once: for one window, the source's own count and your landed count agree, or you can explain the difference.

## Hints

**Write the manifest first.** It feels backwards, but a job that logs a structured record before it fetches anything gives you a debugging surface from the first minute. Everything else in this milestone gets easier once runs are self-describing.

**Make the window a parameter, always.** The job takes a start and end, or a single date. Never `today()` computed inside the job — a job that cannot be pointed at last Tuesday cannot be backfilled or tested, and every milestone after this one depends on it.

**Prefer replace-partition to append.** Writing a whole `ingest_date` partition as a unit, replacing anything already there, gives you idempotency almost for free and avoids the half-written state that append-plus-crash leaves behind. Write to a temporary prefix, then move or commit.

**Persist the watermark after the write, never before.** The ordering is the whole trick: fetch, write, verify, then advance. Advance it first and a crash silently loses a window, which is the kind of bug you find three weeks later in a chart.

**Store the watermark per source.** One source failing should not roll back the other's progress.

**Handle pagination as an iterator.** Yield batches rather than accumulating the full result in memory. You practised this shape in de101; it is what stops a large backfill from exhausting a small container.

**Expect the API to lie about ordering.** Do not assume records come back sorted by update time, and do not assume the last page is the newest data. Take the maximum of the timestamps you actually saw.

**Overlap your windows slightly.** Re-request a few minutes or an hour before the watermark. Sources that stamp records with commit time rather than event time will otherwise drop records that arrived late, and your idempotency guarantee means the overlap costs nothing.

**Test the failure paths deliberately.** Revoke the secret, point at a nonexistent path, kill the task mid-run. Three deliberate failures now will save you more time than any amount of happy-path polish, and two of them appear directly in the definition of done.

**Log counts at every boundary.** Records read from the source, records written to the object, objects written to the partition. When numbers disagree later, you will know which boundary lost them.

**Keep the container small and pinned.** A slim base image with pinned dependencies starts faster and stops working less often. You will rebuild this image many times.

**If you run short on time**, prioritise in this order: both sources landing at all, then idempotency, then the watermark, then the manifest's completeness, then backfill. A single-source pipeline that is genuinely idempotent is worth more than a two-source one that duplicates data every run — but two sources is a requirement, so get the second one landing even crudely before you polish the first.
