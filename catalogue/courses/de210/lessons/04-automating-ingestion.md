---
lesson_id: de210-04
course_id: de210
pathway: data-engineer
title: Automating Ingestion
order: 4
kind: lesson
competency_ids:
  - D1-S1-C02
objectives:
  - Automate scheduled ingestion from an API, a file drop, and a source database
---

## Ingestion is the layer that breaks

Every source you ingest from is a system you do not control. It changes its schema without telling you, rate-limits you at the worst moment, returns 200 with an error body, backdates records, deletes rows you already copied, and goes down during your maintenance window rather than its own. Ingestion is where pipelines fail most often, and the discipline of the layer is a direct response to that.

Three rules govern everything in this lesson.

**Land raw, transform later.** The ingest task's only job is to get a faithful copy of the source into storage you control. No joins, no cleaning, no business logic, no dropped columns. When the transformation logic turns out to be wrong — and it will — you fix it against the raw copy instead of re-extracting from a source that may no longer have the data.

**Every extract is keyed by its data interval.** Same rule as the previous lesson, applied here: the task receives the window it is responsible for, filters the source by that window, and writes to a location named for it. That is what makes a re-run reproduce rather than duplicate.

**Never trust the source's promises.** Assume records arrive late, assume `updated_at` is sometimes null, assume the file is sometimes half-written, assume the API's page 3 is occasionally page 2 again. Design so that these produce a caught failure or a harmless duplicate, not a silent hole.

The landing layout that follows from these rules is boringly consistent, and consistency is the point:

```text
s3://lake/raw/<source>/<entity>/dt=<YYYY-MM-DD>/part-*.jsonl.gz
                                              /_SUCCESS
```

Partitioned by interval, compressed, one directory per run, and a `_SUCCESS` marker written last so that any reader — a sensor, a warehouse external table, a human — can tell a complete directory from one still being written.

## Source one: a REST API

APIs are the most common and the most fiddly source. Six concerns recur; handle all of them and most APIs become routine.

**Authentication.** Credentials come from a secret store or an orchestrator connection, never from the DAG file or an environment file in the repository. Token-based schemes usually need a refresh step; do it inside the task, and treat a 401 as a retryable failure exactly once, so an expired token recovers but a revoked one is reported.

**Pagination.** Read the API's documentation for which of the three schemes it uses. *Offset/limit* is simplest and least reliable — if rows are inserted while you page, you will skip or duplicate records. *Cursor/token* is the sturdiest: the server hands you an opaque pointer to resume from. *Link headers* are the same idea in HTTP clothing. Whichever it is, always cap the loop, or one malformed response that keeps returning the same cursor will page forever.

**Rate limits.** Respect `429` and the `Retry-After` header, and back off exponentially with a little jitter on 5xx. Two clients backing off in lockstep re-collide on every attempt, which is what jitter prevents.

**Incremental windows.** Filter server-side on the interval whenever the API supports it. Where it does not, you may have to pull a fuller set and filter locally — record that fact in the code as a comment and in your head as a cost.

**Partial failure.** If the extract dies on page 40 of 60, the run must not publish a directory that looks complete. Write pages to a temporary prefix and publish the `_SUCCESS` marker only after the last page, so an interrupted run leaves an obviously unfinished directory.

**Schema drift.** Store the raw JSON payload rather than a flattened, hand-picked set of fields. New fields then arrive for free and old fields disappearing becomes a downstream problem you can see rather than a silent null.

```python
@task(retries=3, retry_delay=timedelta(minutes=2))
def extract_orders_api(data_interval_start=None, data_interval_end=None) -> str:
    import gzip, json, time, requests

    conn = BaseHook.get_connection("orders_api")
    session = requests.Session()
    session.headers["Authorization"] = f"Bearer {conn.password}"

    prefix = f"raw/orders_api/dt={data_interval_start:%Y-%m-%d}"
    cursor, page, rows_written = None, 0, 0
    buffer = []

    while page < 500:                                  # hard loop cap
        resp = session.get(
            f"{conn.host}/v1/orders",
            params={
                "updated_after": data_interval_start.isoformat(),
                "updated_before": data_interval_end.isoformat(),
                "cursor": cursor,
                "limit": 1000,
            },
            timeout=30,
        )
        if resp.status_code == 429:
            time.sleep(int(resp.headers.get("Retry-After", 30)))
            continue
        resp.raise_for_status()

        body = resp.json()
        buffer.extend(body["data"])
        rows_written += len(body["data"])
        cursor = body.get("next_cursor")
        page += 1
        if not cursor:
            break
    else:
        raise RuntimeError("pagination exceeded 500 pages — cursor may not advance")

    payload = gzip.compress(
        "\n".join(json.dumps(r) for r in buffer).encode()
    )
    s3.put(f"{prefix}/part-0000.jsonl.gz", payload)     # staged content
    s3.put(f"{prefix}/_SUCCESS", b"")                   # published last
    return prefix
```

Note what the code does *not* do: it does not rename columns, parse dates, drop nulls, or decide what a valid order looks like. All of that belongs downstream, where it can be changed without re-hitting the API.

For very large extracts the in-memory buffer becomes the constraint; the fix is to flush every N records to `part-NNNN.jsonl.gz` as you go and still publish `_SUCCESS` last. The pattern is unchanged.

## Source two: a file drop

A file drop is a directory — object storage, SFTP, a mounted share — that a partner or upstream system writes into on a schedule you do not control. The engineering problems are different from an API's and equally predictable.

**Is the file complete?** A large upload is visible long before it is finished. Never trigger on the data file's existence alone. Trigger on the marker file the producer writes last, on a manifest that lists expected files and checksums, or as a last resort on a size that has been stable for several minutes. If the producer offers none of these, negotiate for one — it is a five-minute change on their side and a permanent class of corruption on yours.

**Which files have I already processed?** File drops rarely align cleanly to intervals. Producers re-upload, name files inconsistently, and occasionally send yesterday's file twice. Keep a small **processed-files registry** — a table of file path, size, checksum, first-seen time, and the run that processed it — and skip anything already recorded. This is the file-drop equivalent of a merge key, and it makes reprocessing safe.

**What if it does not arrive?** A missing file is an event, not a non-event. The sensor waits with a timeout, and the timeout fires an alert. Silence is the failure mode you are engineering against.

**What about the ones that arrive late?** Decide a policy: either a late file is picked up by the next run and reprocesses its target partition, or it is dropped and reported. Both are defensible; an undecided policy is not.

```python
wait_for_drop = S3KeySensor(
    task_id="wait_for_drop",
    bucket_key="incoming/partner_x/{{ ds }}/_MANIFEST.json",
    poke_interval=600,
    timeout=60 * 60 * 6,
    mode="reschedule",
)

@task
def ingest_dropped_files(ds=None) -> int:
    manifest = json.loads(s3.get(f"incoming/partner_x/{ds}/_MANIFEST.json"))
    seen = registry.checksums_for_source("partner_x")
    ingested = 0

    for entry in manifest["files"]:
        blob = s3.get(f"incoming/partner_x/{ds}/{entry['name']}")
        checksum = hashlib.sha256(blob).hexdigest()

        if checksum != entry["sha256"]:
            raise ValueError(f"checksum mismatch for {entry['name']}")
        if checksum in seen:
            log.info("skipping already-ingested file %s", entry["name"])
            continue

        s3.put(f"raw/partner_x/dt={ds}/{entry['name']}", blob)
        registry.record("partner_x", entry["name"], checksum, ds)
        ingested += 1

    s3.put(f"raw/partner_x/dt={ds}/_SUCCESS", b"")
    return ingested
```

Two further habits pay off. **Archive, do not delete** what you have consumed — move it to a processed prefix so that a mistake is recoverable, and expire it on a lifecycle rule rather than by hand. And **quarantine rather than crash** on a file you cannot parse: move it to a rejected prefix, record why, and let the rest of the batch proceed if the pipeline's policy allows it.

## Source three: an operational database

Pulling from a production database has one constraint the other sources do not: your extract shares resources with the application that is serving customers. A query that scans a hundred-million-row table during the evening peak is an outage you caused.

**Read from a replica** wherever one exists, and if it does not, say so in the DAG's documentation and schedule accordingly. **Select only the columns you need** — wide `SELECT *` extracts on tables with large text or blob columns are needlessly expensive. **Chunk the read** by primary-key range or by time window so that no single query holds resources for minutes, and so a failure resumes near where it stopped. **Set a statement timeout**, so a runaway extract is killed by the database rather than by your patience.

The substance of database ingestion, though, is change detection. There are four options and the choice determines everything downstream.

**Full snapshot.** Copy the whole table every run. Correct, self-healing, trivially idempotent, and the right answer for small dimension tables — a fifty-thousand-row `customers` table costs nothing to copy nightly, and copying it eliminates a whole class of bugs.

**High-water-mark incremental.** Select rows where a monotonically increasing column has advanced past the last value you saw: `WHERE updated_at >= :interval_start AND updated_at < :interval_end`. This is the workhorse. Its three failure modes are worth memorising. *Missing updates* — if the application updates a row without touching `updated_at`, you never see the change. *Boundary races* — a transaction that starts before your interval end and commits after it can be missed entirely, which is why you overlap the window by a small margin and rely on a merge to absorb the duplicates. *Hard deletes* — a deleted row simply stops existing, and no `updated_at` filter can find it, so incremental targets drift unless you periodically reconcile against a full key list or the source uses soft deletes.

**Log-based change capture.** Read the database's transaction log to get inserts, updates, and deletes exactly as they happened. It is the most complete and lowest-impact option, and it requires source-side configuration and usually a dedicated tool. Know it exists and what it solves; adopting one is a project of its own.

**Snapshot for history.** Where you need to keep a record of how a row looked over time rather than only its current state, capture each version with validity timestamps. The mechanics of doing this inside the warehouse belong to the next lesson.

```python
@task
def extract_orders_db(data_interval_start=None, data_interval_end=None) -> str:
    hook = PostgresHook(postgres_conn_id="app_replica")
    overlap = data_interval_start - timedelta(minutes=15)   # boundary safety

    sql = """
        SELECT order_id, customer_id, status, amount, currency,
               created_at, updated_at
        FROM   orders
        WHERE  updated_at >= %(start)s AND updated_at < %(end)s
        ORDER  BY updated_at, order_id
    """
    prefix = f"raw/orders_db/dt={data_interval_start:%Y-%m-%d}"
    chunk = 0
    with hook.get_conn() as conn:
        with conn.cursor(name="orders_stream") as cur:     # server-side cursor
            cur.itersize = 50_000
            cur.execute(sql, {"start": overlap, "end": data_interval_end})
            while rows := cur.fetchmany(50_000):
                s3.put(f"{prefix}/part-{chunk:04d}.parquet", to_parquet(rows))
                chunk += 1

    s3.put(f"{prefix}/_SUCCESS", b"")
    return prefix
```

The fifteen-minute overlap deliberately re-reads some rows. That is safe precisely because the load into the warehouse merges on `order_id` rather than appending — the duplicates collapse. Overlap plus merge is the standard defence against boundary races, and it is much cheaper than trying to reason about the source's transaction timing.

## Landing the raw data consistently

Whatever the source, the ingest task's contract with the rest of the pipeline should be identical: a directory named by interval, containing complete data, marked done, and described by a few audit columns added at load time.

```sql
CREATE TABLE raw.orders (
    payload         VARIANT,          -- or JSONB / STRUCT, per warehouse
    _source         STRING,           -- 'orders_api' | 'partner_x' | 'orders_db'
    _source_file    STRING,
    _ingested_at    TIMESTAMP,
    _data_interval  DATE,
    _run_id         STRING
);
```

Those five underscore-prefixed columns cost almost nothing and answer, later, the two questions you will be asked most: *where did this row come from* and *which run put it here*. They are also the seed of the lineage work at the end of the course.

The load from landing zone to warehouse should itself be idempotent, and the pattern is the one from the previous lesson: delete the interval's partition and re-insert, or merge on the business key.

```sql
MERGE INTO raw.orders AS t
USING staged_orders AS s
   ON t.payload:order_id = s.payload:order_id
 WHEN MATCHED AND s._ingested_at > t._ingested_at THEN UPDATE SET ...
 WHEN NOT MATCHED THEN INSERT ...;
```

## Scheduling and running the three together

The three extracts have no dependency on one another, so they run in parallel and converge on a load step. In practice you will want an ingestion DAG that looks roughly like this:

```python
    with TaskGroup("extract") as extract:
        api = extract_orders_api()
        drop = wait_for_drop >> ingest_dropped_files()
        db = extract_orders_db()

    extract >> load_raw() >> mark_ingest_complete()
```

Choose the schedule from the slowest constraint, not the fastest: if the partner file lands by 05:00 and the API is rate-limited to a rate that takes ninety minutes, a 04:00 start with a sensor is right and a 04:00 start without one is a daily failure. Assign the API extract to a small pool so a backfill cannot exhaust its rate limit. Give the database extract a longer `execution_timeout` than the others and a schedule outside the source's peak. And keep the three extracts as separate tasks so that a partner's bad morning does not force you to re-hit the API.

## Practice

Extend the DAG you built in the previous lesson. Use any public API, any directory you can write files into, and any database you can point at — the patterns matter more than the specific systems.

1. **Automate an API extract.** Write a task that pulls a paginated endpoint filtered by the run's data interval, handles `429` with `Retry-After`, backs off with jitter on 5xx, caps its page loop, writes gzipped JSON lines to an interval-partitioned prefix, and publishes `_SUCCESS` last. Run it for two different past intervals and confirm the two outputs differ and each is stable across repeat runs.

2. **Prove partial-failure safety.** Kill the extract task deliberately partway through pagination. Inspect the output prefix and state precisely how a downstream reader can tell the directory is incomplete. If it cannot, fix the publish order and repeat.

3. **Automate a file drop.** Create a sensor that waits on a manifest or `_SUCCESS` marker with `mode="reschedule"` and a timeout, then a task that verifies each file's checksum against the manifest, skips files already in a processed-files registry, copies the rest into the raw zone, and archives the originals. Re-run it against the same drop and show that nothing is ingested twice.

4. **Handle a bad file.** Add a deliberately corrupt file to the drop. Implement quarantine-and-continue: the bad file lands in a rejected prefix with a recorded reason, the good files still load, and the task's return value reports both counts. Then write two sentences on when this pipeline should instead fail closed.

5. **Automate a database extract.** Write a high-water-mark extract with a server-side or key-range chunked read, a statement timeout, an explicit column list, and a small overlap on the lower bound. Load it into the warehouse with a `MERGE` on the business key. Run two adjacent intervals and confirm the overlapping rows appear exactly once.

6. **Find the hard-delete drift.** Delete a row directly in the source table, then run your incremental extract. Show that the row still exists in the warehouse. Propose and implement one reconciliation strategy — a periodic full key comparison, a soft-delete flag, or a scheduled full snapshot — and demonstrate that it removes the drift.

7. **Survive schema drift.** Add a new column to the source and re-run all three extracts. Report, for each, whether the new field reached the raw layer automatically and what would have to change for it to reach a consumer. Then remove a column the pipeline reads and record how each extract behaved.

8. **Tie the three together.** Wire all three extracts into one DAG that fans out in parallel and converges on a single load task. Put the API extract in a two-slot pool, give the whole DAG `max_active_runs=1`, and backfill three days. Confirm from run history that the pool held, that all three days produced complete raw partitions, and that a repeat backfill of the same three days changed nothing.
