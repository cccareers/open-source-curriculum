---
lesson_id: de101-07
course_id: de101
pathway: data-engineer
title: Ingesting Data from Multiple Sources
order: 7
kind: lesson
competency_ids:
  - D1-S1-C02
objectives:
  - Build a repeatable ingestion job that reads from a file, an HTTP API, and a database
---

## Ingestion is the part that runs unattended

Ingestion is the act of getting data out of a system you do not control and into one you do. It is where most pipeline failures happen, because it is the only stage that depends on somebody else's uptime, somebody else's schema, and somebody else's idea of what a date looks like.

The goal of this lesson is a job you can put on a schedule and forget about for a month. That means three properties, and every technique below serves one of them:

- **Automated.** No manual step, no credentials typed at a prompt, no "then I download the file."
- **Repeatable.** Two runs over the same window produce the same landed data.
- **Observable.** When it fails, the failure is visible, attributable, and diagnosable from what the job recorded.

The examples are Python, which this pathway assumes as the ingestion language. The patterns transfer directly to any other language.

## A shape that holds up

Before the source-specific detail, here is the structure the whole job hangs on. Every source, whatever its type, becomes a reader that yields batches of records; a single writer lands them; a single runner ties them together and records what happened.

```python
from dataclasses import dataclass
from typing import Iterator, Protocol

@dataclass(frozen=True)
class Batch:
    source: str
    records: list[dict]
    watermark: str | None = None   # highest updated_at seen in this batch

class Source(Protocol):
    name: str
    def read(self, since: str | None) -> Iterator[Batch]:
        """Yield batches of raw records changed since `since`."""
```

Three things this buys you. Every new source is a new class rather than a new script, so the retry, logging, and landing logic is written once. The runner can be tested with a fake source that yields canned batches, with no network involved. And `Iterator` rather than a returned list means a source can yield a thousand records at a time from a stream of ten million without the process ever holding them all.

Land records raw. Resist the urge to clean during ingestion — cast a type here and you have thrown away the evidence of what the source actually sent. Ingestion's job is faithful capture; cleaning is the next lesson.

## Reading files

Files arrive by SFTP drop, shared object storage, or an operations person emailing a spreadsheet. They are the simplest source and still generate a steady supply of surprises.

```python
import csv
from pathlib import Path

class CsvFileSource:
    def __init__(self, directory: Path, pattern: str, batch_size: int = 5_000):
        self.name = "orders_csv"
        self.directory = directory
        self.pattern = pattern
        self.batch_size = batch_size

    def read(self, since: str | None) -> Iterator[Batch]:
        for path in sorted(self.directory.glob(self.pattern)):
            with path.open(newline="", encoding="utf-8-sig") as fh:
                reader = csv.DictReader(fh)
                batch: list[dict] = []
                for row in reader:
                    row["_source_file"] = path.name
                    batch.append(row)
                    if len(batch) >= self.batch_size:
                        yield Batch(self.name, batch)
                        batch = []
                if batch:
                    yield Batch(self.name, batch)
```

The details that matter:

**Encoding.** `utf-8-sig` strips the byte-order mark that a certain very popular spreadsheet program writes at the start of exported CSVs. Without it your first column is named something invisible-plus-`order_id` and every lookup fails for reasons nothing in the error message explains. If the file is not UTF-8 at all, find out what it is and say so explicitly rather than guessing per run.

**Use a real CSV parser.** Splitting on commas is wrong the first time a value contains a comma inside quotes, and it will. `csv.DictReader` handles quoting, embedded newlines, and escapes.

**Read as text and keep it as text.** Let the type casting happen downstream where it can be tested and where a failure does not stop the ingest.

**Never delete or overwrite the source file.** Move it to an archive folder after a successful load, or record which files you have already processed in a small ledger. Deleting removes your ability to replay.

**Handle the partial file.** A file being uploaded while you read it gives you half a file and no error. The conventional fix is to require the producer to upload under a temporary name and rename on completion, since rename is atomic; failing that, wait for the size to stop changing, or require a sidecar `.done` marker file.

**Record the filename on every row.** `_source_file` costs nothing and turns "where did this bad row come from?" into a `WHERE` clause.

Other formats behave similarly. JSON Lines — one JSON object per line — is the friendliest interchange format for pipelines because it streams; a single giant JSON array does not, and has to be read whole. Columnar formats such as Parquet carry their own types and compress well, which is why they dominate as a *landing* format even when the source sent CSV.

## Reading HTTP APIs

APIs are the most common modern source and have the most failure modes. Four problems have to be solved together: authentication, pagination, rate limiting, and transience.

```python
import time
import requests

class ApiSource:
    def __init__(self, base_url: str, token: str, page_size: int = 500):
        self.name = "campaigns_api"
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({"Authorization": f"Bearer {token}"})
        self.page_size = page_size

    def _get(self, url: str, params: dict | None = None) -> dict:
        delay = 1.0
        for attempt in range(5):
            resp = self.session.get(url, params=params, timeout=30)
            if resp.status_code == 429 or resp.status_code >= 500:
                wait = float(resp.headers.get("Retry-After", delay))
                time.sleep(wait)
                delay = min(delay * 2, 60)
                continue
            resp.raise_for_status()
            return resp.json()
        raise RuntimeError(f"giving up on {url} after 5 attempts")

    def read(self, since: str | None) -> Iterator[Batch]:
        params = {"limit": self.page_size}
        if since:
            params["updated_since"] = since
        url = f"{self.base_url}/campaigns"
        while url:
            payload = self._get(url, params)
            records = payload.get("data", [])
            if records:
                high = max(r["updated_at"] for r in records)
                yield Batch(self.name, records, watermark=high)
            url = payload.get("next_page_url")
            params = None    # the next-page URL already carries the parameters
```

**Authentication** belongs in configuration, never in the file. Read the token from an environment variable or a secret manager. A credential committed to version control has to be treated as compromised, and rotating a shared API token at 2 a.m. is a bad evening.

**Pagination** comes in three common flavours. *Cursor* or *next-link* pagination, as above, is the most reliable — the server tells you where to continue. *Offset* pagination (`?offset=1000&limit=500`) is common and quietly lossy: if records are inserted while you page, rows shift between pages and you will skip some. *Token* pagination is a cursor by another name. Always terminate on the server's signal (an absent next link, an empty page), and add a hard maximum page count so a server bug cannot spin your job forever.

**Rate limits** show up as HTTP 429. Honour `Retry-After` when it is present; otherwise back off exponentially. Retrying immediately in a tight loop is how an ingestion job gets an API key banned.

**Transience.** Retry 429 and 5xx responses; do not retry 4xx, which means you sent something wrong and will keep sending it. Always set a timeout — a request with no timeout can hang until someone notices the job has been "running" for eleven hours.

**Incremental reads** use whatever "changed since" filter the API offers, seeded from your stored watermark and, as in the previous lesson, overlapped slightly. Where no such filter exists, you are stuck with full pulls, and it is worth asking the vendor for one.

## Reading databases

Reading from a database is the most controllable source and the one where carelessness does the most damage to somebody else.

```python
from sqlalchemy import create_engine, text

class DatabaseSource:
    def __init__(self, dsn: str, batch_size: int = 10_000):
        self.name = "orders_db"
        self.engine = create_engine(dsn)
        self.batch_size = batch_size

    def read(self, since: str | None) -> Iterator[Batch]:
        watermark = since or "1970-01-01T00:00:00"
        last_id = 0
        query = text("""
            SELECT order_id, customer_id, order_status, placed_at, updated_at
            FROM   orders
            WHERE  updated_at >= :since
              AND  order_id    > :last_id
            ORDER BY order_id
            LIMIT :limit
        """)
        while True:
            with self.engine.connect() as conn:
                rows = conn.execute(query, {
                    "since": watermark,
                    "last_id": last_id,
                    "limit": self.batch_size,
                }).mappings().all()
            if not rows:
                return
            records = [dict(r) for r in rows]
            last_id = records[-1]["order_id"]
            high = max(str(r["updated_at"]) for r in records)
            yield Batch(self.name, records, watermark=high)
```

**Read from a replica, not the primary.** Your nightly scan competing with customer checkout traffic is a production incident waiting for a busy night. If there is no replica, ask for one, and until then run in the quietest window you can and keep batches small.

**Page by key, not by offset.** `LIMIT ... OFFSET n` makes the database count and discard `n` rows on every page, so page 500 is 500 times as expensive as page 1. Keyset pagination — "give me the next 10,000 rows with an id greater than the last one I saw" — stays constant-cost because it uses the index. That is what `AND order_id > :last_id ORDER BY order_id` is doing above.

**Select only the columns you need**, and filter on `updated_at` at the source. Both are free reductions in work.

**Bind parameters.** Never build SQL by string-formatting values into it. It is a security defect even in an internal pipeline, and it also breaks the moment a value contains a quote.

**Know what you cannot see.** A source table without an `updated_at` cannot be read incrementally with confidence, and hard deletes are invisible to any timestamp-based read. These are conversations to have with the owning team — which is exactly the collaboration work from lesson 2 showing up as a technical constraint.

## Landing, configuration, and the runner

### Land raw and immutable

```python
import json, gzip, uuid
from datetime import datetime, timezone

def land(batch: Batch, run_id: str, root: Path) -> Path:
    now = datetime.now(timezone.utc)
    directory = root / batch.source / f"ingest_date={now:%Y-%m-%d}"
    directory.mkdir(parents=True, exist_ok=True)
    path = directory / f"{run_id}-{uuid.uuid4().hex[:8]}.jsonl.gz"
    with gzip.open(path, "wt", encoding="utf-8") as fh:
        for record in batch.records:
            fh.write(json.dumps({
                "_source": batch.source,
                "_run_id": run_id,
                "_ingested_at": now.isoformat(),
                "_payload": record,
            }) + "\n")
    return path
```

Every landed record carries where it came from, which run brought it, and when. Files are written once and never modified. Partitioning the directory by ingest date makes it trivial to reprocess a window or expire old data.

### Configuration, not code

The difference between one ingestion job and an ingestion *framework* is that the second one adds a source by editing a config file.

```yaml
sources:
  - name: orders_db
    type: database
    dsn_env: ORDERS_REPLICA_DSN
    table: orders
    watermark_column: updated_at
    batch_size: 10000
  - name: campaigns_api
    type: api
    base_url: https://api.example.com/v2
    token_env: CAMPAIGNS_API_TOKEN
    page_size: 500
  - name: inventory_csv
    type: file
    directory: /data/drop/inventory
    pattern: "inventory_*.csv"
```

Secrets are referenced by environment variable name, never by value. Connection details, batch sizes, and schedules are data. Adding the fourth source should not require a code review of retry logic.

### The runner

```python
def run(source: Source, store: WatermarkStore, root: Path) -> dict:
    run_id = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S")
    since = store.get(source.name)
    if since:
        since = overlap(since, minutes=60)   # re-read a safety window
    rows, files, high = 0, [], since
    try:
        for batch in source.read(since):
            files.append(land(batch, run_id, root))
            rows += len(batch.records)
            if batch.watermark and (high is None or batch.watermark > high):
                high = batch.watermark
    except Exception:
        log.exception("ingest failed", extra={"source": source.name, "run_id": run_id})
        raise                     # fail loudly; do NOT advance the watermark
    if high:
        store.set(source.name, high)
    return {"run_id": run_id, "source": source.name, "rows": rows, "files": len(files)}
```

The three load-bearing lines are the overlap window, the `raise`, and the fact that the watermark is written only after the loop completes. Together they make the job safe to re-run: a crash leaves the watermark where it was, the next run re-reads the same window, and because landed files are uniquely named and downstream loads are idempotent, the duplicate capture costs nothing.

Return a summary and write it to a run log — source, run id, row count, file count, duration, status. Then have the schedule alert on two conditions, not one: the job failed, *and* the job succeeded but returned zero rows when it normally returns thousands. The second is the failure people miss, because a silent empty success looks exactly like a healthy run until someone asks why the dashboard flatlined.

Scheduling itself can be as simple as cron at this stage. Expressing dependencies between jobs, retries at the schedule level, and backfill orchestration are what a workflow orchestrator is for, and that comes later in this pathway. Build the job so it is a clean single command with a date parameter, and it will drop into any orchestrator later without a rewrite.

## Practice

Build one ingestion job, in Python, that reads from all three source types into a shared raw landing area. Work in a git repository with a README.

**1. Stand up the sources.**
- *File.* Generate at least three CSV files of inventory counts (`store_id`, `sku`, `count_date`, `on_hand`), one per day, in a drop directory. Deliberately give one file a byte-order mark and one a value containing a quoted comma.
- *API.* Use any free public JSON API that paginates, or run a small local HTTP server that serves 2,000 synthetic records across pages, supports an `updated_since` parameter, and returns HTTP 429 on roughly one request in ten.
- *Database.* Use the e-commerce database you built in lesson 4, reading `orders` and `order_lines`.

**2. Implement the framework.** Write the `Source` protocol, the three source classes, the landing function, and the runner. Drive every source from a single YAML or JSON config file, with all credentials read from environment variables. All three must stream in batches — nothing may load an entire source into memory.

**3. Make it incremental and safe.** Persist watermarks per source (a small JSON file or SQLite table is fine). Implement the overlap window. Then demonstrate the safety properties with evidence:
- Run twice in a row and show that the second run lands only the overlap window, and that the downstream row count after deduplication is unchanged.
- Kill the process partway through the database source, then re-run, and show that no records were lost.
- Show the API source surviving your injected 429s, and record how many retries occurred.

**4. Observe it.** Write a run-log row per source per run with run id, start and end time, rows read, files written, and status. Add the zero-rows alert. Then produce a short table of your last five runs as evidence it works.

**5. Write the operations note.** Two hundred words for whoever inherits this: how to add a fourth source, where the credentials come from, what to do when a run fails, and how to backfill a specific date range. Then hand the repository to someone else and ask them to add a fourth source (any public API) using only your note. Every question they have to ask you is a defect in the note — fix it.
