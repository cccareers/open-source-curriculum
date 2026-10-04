---
course_id: db305
project_id: db305-x01
title: "Carrier Orders Sync: Paged, Polite, and Idempotent"
kind: supplementary-project
status: draft
hours_estimate: 6
difficulty: core
related_lessons:
  - db305-03
  - db305-04
objectives:
  - Pull data from an API into a workflow, handling pagination, rate limits, and error responses
  - Build an AI workflow that reads from and writes to a SQL database safely
competency_ids:
  - D5-S1-C01
  - D5-S1-C02
  - D5-S1-C03
---

## Scenario
The freight team's nightly job pulls orders from `api.example-freight.com/v2/orders` into the reporting database. Last month it silently stopped at page 1 for three nights (the cursor was not being passed), and a week later a 429 storm at 02:00 left the table half-written. Both incidents were found by a person, days later. You are rebuilding the sync as a small, tested Python module so the extraction workflow from db305-06 always has a complete, de-duplicated `orders` table to read.

## What you will build / produce
A module `sync.py` with:
- `init_db(conn)` — creates three tables in the given SQLite connection: `orders(id text primary key, customer_name text, status text not null, total real, updated_at text)`, `quarantine(record_id text, reason text, raw text)`, `sync_state(name text primary key, last_synced text)`.
- `fetch_with_backoff(api, params, sleep, max_attempts=5)` — calls `api.get(params)`, which returns `(status, headers, body)`. Returns the body on 2xx. On 429 or 5xx, waits and retries: honour `Retry-After` exactly when present; otherwise wait `2**attempt` seconds plus up to 50% jitter (1, 2, 4, 8 …). Does not sleep after the last attempt. Raises `RetryExhausted` after `max_attempts`. On any other status raises `ApiError` (with a `.status` attribute) immediately, without retrying.
- `sync_orders(api, conn, since, sleep, max_pages=500, overlap_minutes=5)` — pulls every page with `updated_since` set to `since` minus the overlap, `limit=100`, `sort=updated_at`, passing `cursor=next_cursor` on each subsequent request. Writes each page as it arrives using a parameterized upsert keyed on `id`. Sends records whose `status` is not in `draft, confirmed, shipped, cancelled` to `quarantine` with a reason that mentions `status`. Applies the three loop guards from db305-03. Advances `sync_state.last_synced` (to the largest `updated_at` written) only when the whole pull finished. Returns `{"status", "pages_fetched", "records_written"}`, where status is `ok`, `stopped_no_progress`, or `stopped_max_pages`.

Plus a one-page **sync runbook**: the five API facts (db305-03), how to tell from `sync_state` and the summary whether last night's run was complete, and how to resume.

## Before you start (prerequisites, starter files or data)
- Python 3.10+, `pip install pytest`. SQLite ships with Python; no server needed.
- Copy the test file below to `tests/test_sync.py`. It contains `FakeOrdersAPI`, a cursor-paginated stand-in for the real API that can be scripted to return 429s and 5xxs.
- Optional: once the tests pass, point the same module at a real paginated API (your platform's API or a public one) by writing a ten-line adapter with the same `get(params)` shape.

## Milestones
1. **Five facts (20 min).** Write them for the fake API by reading `FakeOrdersAPI`: base URL, auth (none for the fake), endpoint and parameters, pagination style (cursor), rate-limit behaviour.
2. **Backoff (60 min).** Implement `fetch_with_backoff`. Pass `-k "backoff or retry or client_errors"`.
3. **Schema and parameterized upsert (45 min).** `init_db` and the write path. Use `?` placeholders only; pass the apostrophe test.
4. **The loop and its guards (75 min).** Pagination, write-per-page, runaway and no-progress guards.
5. **Validation and quarantine (30 min).** Known-status check.
6. **Incremental cursor (45 min).** Overlap on the request, advance only on a complete pull.
7. **Runbook (30 min).**

## Acceptance criteria
- [ ] `python -m pytest -q` reports `13 passed`.
- [ ] No SQL statement in `sync.py` is built by string concatenation or f-strings with data values.
- [ ] A 400, 403, or 422 is attempted exactly once.
- [ ] A broken cursor stops after the second request, not after hundreds.
- [ ] Records with unknown statuses appear in `quarantine`, never in `orders`, and never vanish.
- [ ] The runbook lets a colleague decide in under a minute whether last night's sync was complete.

## Automated checks (coding courses) / Evidence checklist (non-coding)
Save as `tests/test_sync.py`; run `python -m pytest -q` from the project root.

```python
# tests/test_sync.py  -- run with:  python -m pytest -q
# No network and no cloud account needed: FakeOrdersAPI stands in for
# api.example-freight.com/v2/orders and an in-memory SQLite database stands in
# for the warehouse.
import sqlite3
import pytest
from sync import init_db, fetch_with_backoff, sync_orders, ApiError, RetryExhausted

STATUSES = ["draft", "confirmed", "shipped", "cancelled"]

def make_orders(n, start=1000):
    return [{"id": f"ORD-{start + i}",
             "customer_name": "Reyes Freight" if i % 2 else "Okafor Ltd",
             "status": STATUSES[i % 4],
             "total": round(100 + i * 1.5, 2),
             "updated_at": f"2026-03-11T{(i // 60) % 24:02d}:{i % 60:02d}:00Z"}
            for i in range(n)]

class FakeOrdersAPI:
    """Cursor-paginated fake. `script` is a list of (status, headers) to return
    before serving real pages, so tests can inject 429s and 5xxs."""
    def __init__(self, orders, page_size=100, script=None, ignore_cursor=False):
        self.orders, self.page_size = orders, page_size
        self.script = list(script or [])
        self.ignore_cursor = ignore_cursor
        self.calls = []
    def get(self, params):
        self.calls.append(dict(params))
        if self.script:
            status, headers = self.script.pop(0)
            return status, headers, {"error": "scripted"}
        start = 0 if self.ignore_cursor else int(params.get("cursor") or 0)
        page = self.orders[start:start + self.page_size]
        nxt = start + self.page_size
        has_more = nxt < len(self.orders)
        body = {"data": page, "has_more": has_more,
                "next_cursor": str(nxt) if has_more else None}
        return 200, {"Content-Type": "application/json"}, body

@pytest.fixture
def conn():
    c = sqlite3.connect(":memory:")
    init_db(c)
    yield c
    c.close()

def count(conn, table):
    return conn.execute(f"select count(*) from {table}").fetchone()[0]

def no_sleep(_seconds):
    pass

# --- Pagination and idempotent writes ----------------------------------------
def test_full_pull_writes_every_record(conn):
    api = FakeOrdersAPI(make_orders(250))
    summary = sync_orders(api, conn, since="2026-03-11T00:00:00Z", sleep=no_sleep)
    assert summary["status"] == "ok"
    assert summary["pages_fetched"] == 3
    assert count(conn, "orders") == 250

def test_rerun_creates_no_duplicates(conn):
    api = FakeOrdersAPI(make_orders(250))
    sync_orders(api, conn, since="2026-03-11T00:00:00Z", sleep=no_sleep)
    sync_orders(FakeOrdersAPI(make_orders(250)), conn, since="2026-03-11T00:00:00Z", sleep=no_sleep)
    assert count(conn, "orders") == 250

def test_apostrophe_survives_because_values_are_parameters(conn):
    orders = make_orders(1)
    orders[0]["customer_name"] = "O'Brien Haulage'; drop table orders; --"
    sync_orders(FakeOrdersAPI(orders), conn, since="2026-03-11T00:00:00Z", sleep=no_sleep)
    row = conn.execute("select customer_name from orders where id = ?", ("ORD-1000",)).fetchone()
    assert row[0] == "O'Brien Haulage'; drop table orders; --"

# --- Loop guards ---------------------------------------------------------------
def test_no_progress_guard_stops_a_cursor_bug(conn):
    api = FakeOrdersAPI(make_orders(250), ignore_cursor=True)   # page 2 == page 1
    summary = sync_orders(api, conn, since="2026-03-11T00:00:00Z", sleep=no_sleep)
    assert summary["status"] == "stopped_no_progress"
    assert len(api.calls) == 2

def test_runaway_guard(conn):
    api = FakeOrdersAPI(make_orders(1000))
    summary = sync_orders(api, conn, since="2026-03-11T00:00:00Z", sleep=no_sleep, max_pages=2)
    assert summary["status"] == "stopped_max_pages"
    assert summary["pages_fetched"] == 2

# --- Rate limits and errors ----------------------------------------------------
def test_retry_after_is_honoured_exactly():
    api = FakeOrdersAPI(make_orders(5), script=[(429, {"Retry-After": "2"})])
    sleeps = []
    body = fetch_with_backoff(api, {"limit": 100}, sleep=sleeps.append)
    assert sleeps == [2]
    assert len(body["data"]) == 5

def test_exponential_backoff_then_give_up():
    api = FakeOrdersAPI(make_orders(5), script=[(503, {})] * 5)
    sleeps = []
    with pytest.raises(RetryExhausted):
        fetch_with_backoff(api, {"limit": 100}, sleep=sleeps.append, max_attempts=5)
    assert len(api.calls) == 5
    assert len(sleeps) == 4                       # no wait after the final failure
    for base, waited in zip([1, 2, 4, 8], sleeps):
        assert base <= waited <= base * 1.5       # exponential with up to 50% jitter

@pytest.mark.parametrize("status", [400, 403, 422])
def test_client_errors_are_never_retried(status):
    api = FakeOrdersAPI(make_orders(5), script=[(status, {})])
    with pytest.raises(ApiError) as err:
        fetch_with_backoff(api, {"limit": 100}, sleep=no_sleep)
    assert err.value.status == status
    assert len(api.calls) == 1

# --- Validation and the incremental cursor --------------------------------------
def test_unknown_status_is_quarantined_not_defaulted(conn):
    orders = make_orders(4)
    orders[2]["status"] = "pending_review"
    sync_orders(FakeOrdersAPI(orders), conn, since="2026-03-11T00:00:00Z", sleep=no_sleep)
    assert count(conn, "orders") == 3
    reason = conn.execute("select reason from quarantine where record_id = ?", (orders[2]["id"],)).fetchone()
    assert reason is not None and "status" in reason[0]

def test_cursor_advances_only_after_a_complete_pull(conn):
    sync_orders(FakeOrdersAPI(make_orders(1000)), conn, since="2026-03-11T00:00:00Z",
                sleep=no_sleep, max_pages=2)
    assert conn.execute("select last_synced from sync_state where name='orders'").fetchone() is None
    orders = make_orders(250)
    sync_orders(FakeOrdersAPI(orders), conn, since="2026-03-11T00:00:00Z", sleep=no_sleep)
    saved = conn.execute("select last_synced from sync_state where name='orders'").fetchone()[0]
    assert saved == max(o["updated_at"] for o in orders)

def test_since_parameter_is_sent_with_overlap(conn):
    api = FakeOrdersAPI(make_orders(10))
    sync_orders(api, conn, since="2026-03-11T03:00:00Z", sleep=no_sleep, overlap_minutes=5)
    assert api.calls[0]["updated_since"] == "2026-03-11T02:55:00Z"
```

## Rubric
| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Pagination | Loops pages but no guards | All three guards, write-per-page | Also records `run_id`, `pages_fetched`, `last_cursor`, `records_written` per run so a failed run resumes from `last_cursor` |
| Rate limits and errors | Retries everything, or nothing | Retry-After honoured; exponential backoff with jitter; client errors not retried | Reads `X-RateLimit-Remaining` and slows voluntarily below 10% |
| Safe SQL | Some values concatenated | All values parameterized; upsert idempotent | Writes each page inside a transaction so a page is all-or-nothing |
| Validation | No known-value check | Unknown statuses quarantined with reason and raw record | Also alerts when the page count or record count deviates sharply from the previous run |
| Runbook | Missing facts | Five facts, completeness check, resume steps | Includes a worked "last night failed at page 380" example |

## Stretch goals
- Add a `Content-Type` check so an HTML login page returned with status 200 raises a clear error (db305-03, "Errors: which ones to retry").
- Add a read-only reporting query: confirmed orders from the last 7 days, named columns, explicit `limit`, using `?` parameters.
- Swap SQLite for a local PostgreSQL and change the upsert to `on conflict (id) do update` with `excluded.`; the tests should only need a different fixture.

## Reflection prompts
- Which guard would have caught last month's three silent nights, and how quickly?
- Why must the stored cursor advance only after the whole pull succeeds? What gap would you create otherwise?
- Which of your tests protects against a bug you have personally written before?

## Instructor notes (common pitfalls, how to adapt for time)
- Learners often call `sleep` after the final failed attempt; the test checks for exactly four waits.
- The no-progress guard is easiest as "every id on this page was already seen in this run". Learners who compare cursors instead miss the case where the API ignores the cursor.
- SQLite supports `insert ... on conflict(id) do update set col = excluded.col` from version 3.24; any Python 3.10+ build includes a new enough SQLite.
- Short on time: give learners `fetch_with_backoff` and focus on the loop, guards, and upsert (about 3.5 hours).
- No-code variant: build the same loop in Make or n8n with an iterator and a data store, and submit run-history screenshots proving each guard fires.
