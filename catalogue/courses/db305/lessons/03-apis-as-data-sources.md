---
lesson_id: db305-03
course_id: db305
pathway: prompt-engineer
title: APIs as Data Sources
order: 3
kind: lesson
competency_ids:
  - D5-S1-C01
  - D5-S1-C03
objectives:
  - Pull data from an API into a workflow, handling pagination, rate limits, and
    error responses
---

## The five parts of a request

In this pathway an API is usually where the data actually lives. The order table you want is not a file anyone will send you; it is an endpoint someone will give you a key for. Pulling from it reliably is a small skill with a lot of sharp edges.

Every HTTP request you will send has the same five parts, and every API doc is telling you how to fill them in.

```http
GET /v2/orders?updated_since=2026-03-11T00:00:00Z&limit=100 HTTP/1.1
Host: api.example-freight.com
Authorization: Bearer sk_live_9f2c...
Accept: application/json
```

**Method** — `GET` to read, `POST` to create, `PATCH` to change part of a record, `PUT` to replace one, `DELETE` to remove. **URL path** — which collection or record. **Query string** — filters, page size, sort, cursor; only on `GET`-style reads. **Headers** — who you are (`Authorization`), what you will accept back (`Accept`), and what you are sending (`Content-Type`). **Body** — JSON, on writes only.

A write looks like this:

```http
POST /v2/orders HTTP/1.1
Host: api.example-freight.com
Authorization: Bearer sk_live_9f2c...
Content-Type: application/json

{"customer_id": "C-88", "pallets": 4, "collect_on": "2026-03-14"}
```

The response has its own three parts: a **status code**, **headers**, and a **body**. All three matter. Workflow builders make it easy to look only at the body, which is how a run happily maps an error message into a record.

## Read the docs for five things

Before you build a step, find these five facts and write them down. Ten minutes here saves an afternoon.

1. **Base URL and version.** `https://api.example-freight.com/v2`. Pin the version explicitly; an API that lets you omit it will eventually move you.
2. **Auth scheme.** Which header, which prefix, where the credential comes from.
3. **The endpoint and its parameters.** Which filters exist, what the maximum page size is, whether sorting is available.
4. **Pagination style.** Offset, page number, or cursor. This decides the shape of your loop.
5. **Rate limits.** Requests per second or per minute, whether limits are per key or per account, and which headers report your remaining budget.

Then make one request by hand — in a REST client, or a `curl` in a terminal — before you put anything in a workflow. Confirm the status is 200 and the body is what the docs claim. Debugging a request is much easier outside a workflow than inside one.

## Authentication you will actually meet

**API key in a header.** The common case. `Authorization: Bearer <key>`, or a vendor-specific header such as `X-API-Key`. Simple, long-lived, and dangerous if it leaks.

**Basic auth.** A base64-encoded `user:password` in the `Authorization` header. Still around in older systems; it is not encryption, only encoding.

**OAuth 2.0.** You exchange a client id and secret (or a user's consent) for a short-lived access token, then send that token as a bearer. Tokens expire, typically in an hour, and the response tells you when:

```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "rt_8812..."
}
```

Your workflow either lets the platform's connector manage this — the usual and correct choice — or stores the token with its expiry and refreshes when there are fewer than five minutes left. Refreshing on a 401 alone works but wastes a failed request per hour.

Three rules regardless of scheme. Credentials live in your platform's secret or credential store, never in a step's plain-text field and never in a prompt. Use separate keys per environment so revoking a test key does not stop production. And confirm your platform does not log request headers into run history, because a key in a log is a key that has left the building.

## Pagination: three patterns, one loop

No API hands you 40,000 rows in one response. You will meet three styles.

**Offset and limit.** You ask for a window.

```http
GET /v2/orders?limit=100&offset=0
GET /v2/orders?limit=100&offset=100
```

Simple, and subtly wrong on live data: if 20 records are inserted while you page, records shift down and you both miss and duplicate rows. Acceptable for a stable export; risky for a live table unless you sort by an immutable key.

**Page numbers.** The same thing with friendlier arithmetic — `?page=3&per_page=100` — and the same drift problem. The response usually tells you when to stop:

```json
{ "data": [ /* … */ ], "page": 3, "per_page": 100, "total_pages": 47 }
```

**Cursors.** The API hands you an opaque token pointing at your place in the result set.

```json
{
  "data": [ /* … */ ],
  "has_more": true,
  "next_cursor": "eyJpZCI6IjEwNDEiLCJ0cyI6MTc0..."
}
```

```http
GET /v2/orders?limit=100&cursor=eyJpZCI6IjEwNDEiLCJ0cyI6MTc0...
```

Cursors are stable under concurrent writes and are what you should prefer when offered. Never parse or construct a cursor yourself; it is opaque on purpose and its format will change.

Whichever style, the loop is the same shape, and it needs three guards:

```text
page = first page
loop:
  response = request(page)
  handle errors and rate limits   (next two sections)
  write this page's records to staging immediately
  if no next page: stop
  if pages fetched > max_pages: stop and alert     <- runaway guard
  if this page's records are all already seen: stop <- no-progress guard
  page = next page
  wait(politeness delay)
```

The runaway guard exists because a broken `has_more` will loop until your platform's operation budget is gone. The no-progress guard catches the classic bug where the cursor is not being passed and page 2 is page 1 again. Set the maximum from the expected volume: if the table holds 40,000 rows at 100 per page, 500 pages is generous and 5,000 is a bug.

Write each page to staging **as it arrives**, rather than accumulating 40,000 records in memory to write at the end. Large pulls fail partway; a pull that has persisted 380 of 400 pages can resume, and one that held everything in a variable cannot.

## Rate limits: budget first, back off second

A rate limit is the number of requests the API will accept from you in a window. Exceeding it returns `429 Too Many Requests`.

Most APIs report your remaining budget in response headers:

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 12
X-RateLimit-Reset: 1773412800
Content-Type: application/json
```

Read them on every response rather than only on failures. When `Remaining` drops below about 10 percent of `Limit`, slow down voluntarily. Staying under the limit is far better than discovering it.

When you do get a 429, the correct response is **wait, then retry the same request**. If a `Retry-After` header is present, honour it exactly — it is the server telling you the answer. Otherwise back off exponentially with jitter:

```text
attempt 1 fails -> wait 1s  + random(0..500ms)
attempt 2 fails -> wait 2s  + random(0..1000ms)
attempt 3 fails -> wait 4s  + random(0..2000ms)
attempt 4 fails -> wait 8s  + random(0..4000ms)
attempt 5 fails -> stop, record the failure, alert
```

The jitter matters when more than one workflow shares a key: without it, everything that got throttled retries at the same instant and throttles again. The cap matters too — a retry loop with no maximum turns a five-minute outage into an all-night storm of requests.

Two more habits. Add a small fixed delay between pages even when you are nowhere near the limit; a 200 ms pause on a 400-page pull costs 80 seconds and makes you a well-behaved client. And keep concurrency low. Fetching eight pages in parallel is how a 300-per-minute limit becomes a 429 on the first burst.

## Errors: which ones to retry

Status codes come in classes, and the class tells you what to do.

| Status | Meaning | Retry? | Your action |
| --- | --- | --- | --- |
| 200, 201 | Success | — | Validate the body, then use it |
| 204 | Success, no body | — | Do not attempt to parse |
| 400 | Malformed request | No | Fix the request; log the body, it names the field |
| 401 | Not authenticated | Once, after refresh | Refresh the token; if it fails again, alert |
| 403 | Authenticated, not allowed | No | Wrong scope or wrong environment; alert |
| 404 | No such record or path | No | Check the path; treat a missing record as data, not a crash |
| 409 | Conflict | No | Something changed underneath you; re-read and decide |
| 422 | Understood but invalid | No | Your payload failed their validation; log and quarantine |
| 429 | Rate limited | Yes, with backoff | See above |
| 500, 502, 503, 504 | Server-side fault | Yes, with backoff | Transient; retry, then alert |

The rule underneath the table: **retry what is transient, never retry what is your fault.** A 400 retried five times is five identical failures and a slower alert.

Two cases that are not status codes at all. A **timeout** is ambiguous on writes — you do not know whether the server processed your request — so never blindly retry a `POST` that timed out unless the API supports an idempotency key, which lets you send the same request twice safely:

```http
POST /v2/orders HTTP/1.1
Idempotency-Key: 4f9c1d8e-2b6a-4d70-9f11-0a2c8b7e5d31
Content-Type: application/json

{"customer_id": "C-88", "pallets": 4}
```

And an **HTML error page returned with status 200** happens more than it should, usually from a proxy or a login redirect. Check `Content-Type` before you parse.

Every failure should be recorded with enough to diagnose it: the URL with secrets stripped, the status, the response body, the attempt number, and the timestamp. "The API call failed" is not a log entry.

## Validate the response before you trust it

An API response is an external input and gets the same treatment as any other. Run these checks in order, and stop at the first failure:

```json
{
  "checks": [
    "status is 2xx",
    "content-type is application/json",
    "body parses as JSON",
    "the collection key exists and is an array",
    "record count is not implausible (0 on a full sync is suspicious)",
    "each record has: id, updated_at, status",
    "types are as expected: id string, total number, updated_at ISO 8601",
    "status is in the known set: draft, confirmed, shipped, cancelled"
  ]
}
```

The last check is the one people skip and the one that catches real drift. When a vendor adds a `pending_review` status, a workflow that branches on four known values will route it to whatever the default branch is — silently, for weeks. Comparing what arrived against a known set makes the new value an event you see rather than a bug you inherit.

Also sanity-check the whole pull, not just the records. A nightly sync that normally returns 1,800 orders and today returns 4 has probably had a filter parameter silently rejected. Log the count for every run and alert on a large deviation.

## Incremental pulls and resuming

Refetching everything every night stops working somewhere around the point it starts to matter. Switch to incremental pulls as soon as the endpoint supports a filter on a change timestamp.

Keep a cursor of your own — the last successfully synced timestamp — and query with a small overlap:

```http
GET /v2/orders?updated_since=2026-03-11T02:55:00Z&limit=100&sort=updated_at
```

If the last run finished at 03:00, ask from 02:55. The overlap catches records written during the previous run's final page, and it produces duplicates on purpose, which is fine because your write is keyed on the record's own id. Advance the stored cursor only **after** the whole pull has been written successfully; advancing it per page means a failure halfway leaves a gap you will never notice.

That same discipline gives you resume for free. Record `run_id`, `pages_fetched`, `last_cursor`, `records_written`, and `status` for every pull. A failed run resumes from `last_cursor` instead of starting over, and the six numbers tell you at a glance whether last night's sync was complete.

## Practice

Pick a real API you can get a key for — your platform's own API, a public data API, or a sandbox account of a tool you use. It must be paginated and documented.

1. **Write the five facts** before building: base URL and version, auth scheme, endpoint and parameters, pagination style, and rate limits with the header names.
2. **Make one request by hand** outside your workflow tool. Record the status code, the `Content-Type`, the rate-limit headers, and the first record.
3. **Build the paged pull** with all three loop guards — end-of-pages, maximum-pages, and no-progress. Write each page to staging as it arrives, not at the end.
4. **Prove the guards work.** Deliberately break the cursor so page 2 repeats page 1 and confirm the no-progress guard stops the run. Then set the maximum pages to 2 and confirm it stops there.
5. **Implement backoff.** Add exponential backoff with jitter, a maximum of five attempts, and `Retry-After` handling. Force a 429 if the API allows it; otherwise point the step at a URL that returns 503 and confirm the wait intervals in the log.
6. **Build the error table into the workflow.** Route each status class to its own branch — retry, quarantine, or alert — and confirm a 404 does not fail the run while a 401 does alert.
7. **Add response validation** using the eight checks above, including the known-value check on one enum field. Introduce an unknown value in a test fixture and confirm the workflow raises it rather than defaulting it.
8. **Go incremental.** Store a sync cursor with a five-minute overlap, advance it only on a fully successful run, and prove it: run the pull twice and show that the second run fetches only the overlap window and writes zero new records.
