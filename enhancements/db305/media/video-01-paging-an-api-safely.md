---
course_id: db305
media_id: db305-v01
type: video-script
title: "Paging an API Without Losing or Duplicating a Row"
format: screencast
target_runtime: "8 min"
related_lessons:
  - db305-03
objectives:
  - Pull data from an API into a workflow, handling pagination, rate limits, and error responses
competency_ids:
  - D5-S1-C01
  - D5-S1-C03
---

## Purpose
After watching, the learner can write a paginated pull with the three loop guards, retry only transient errors with exponential backoff, and store a sync cursor that advances only after a complete pull.

## Audience and prerequisites
Apprentices who can configure an HTTP request and read JSON (db305 prerequisites). Watch before practice step 3 in db305-03.

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Terminal: `curl -s -H "Authorization: Bearer $FREIGHT_KEY" "https://api.example-freight.com/v2/orders?limit=100" \| jq '.data \| length, .has_more, .next_cursor'` prints `100`, `true`, `"eyJpZCI6IjEwNDEi..."`. | "Here's the freight API from this lesson. One request, a hundred orders, and two fields that matter more than the data: has_more is true, and there's a next_cursor. There are forty thousand orders behind this endpoint. No API hands you all of them in one response." |
| 0:30 | Notes panel: the five facts filled in: base URL `https://api.example-freight.com/v2`; auth `Authorization: Bearer`; endpoint `/orders` with `updated_since`, `limit` (max 100), `sort`; pagination: cursor; rate limit: 300/min per key, headers `X-RateLimit-*`. | "Before building anything, I write down five facts. Base URL and version, auth, the endpoint's parameters, the pagination style, and the rate limit with its header names. Ten minutes here saves an afternoon." |
| 1:00 | Whiteboard overlay: offset pages 0–99, 100–199; a new record inserted at the top pushes row 99 into page 2. | "Why prefer cursors? With offset paging, if twenty orders get inserted while you're on page one, everything shifts down. You see some rows twice and miss others. A cursor marks your place in the result set, so concurrent writes don't move it." |
| 1:30 | Editor: `sync.py`, the loop: `while True:` → `body = fetch_with_backoff(api, params, sleep)` → write page → `if not body["has_more"]: break` → `if pages >= max_pages: return stopped_max_pages` → `params["cursor"] = body["next_cursor"]` → `sleep(0.2)`. | "Here's the loop. Fetch a page. Write it to the database immediately, not at the end. If there's no next page, stop. Then pass the cursor back and wait two hundred milliseconds to be polite." |
| 2:05 | Highlight two guard lines: `if pages >= max_pages` and `if ids and ids <= seen: return stopped_no_progress`. | "Two guards make this safe. The runaway guard: forty thousand rows at a hundred per page is four hundred pages, so five hundred is generous and five thousand is a bug. And the no-progress guard: if every id on this page was already seen in this run, the cursor isn't being passed, and page two is page one again." |
| 2:40 | Terminal: run tests `python -m pytest -q -k no_progress` with the cursor line commented out → summary shows `stopped_no_progress` after 2 calls. | "Let me prove it. I'll comment out the line that passes the cursor, the exact bug that caused three silent nights for our freight team. The run stops on the second request and says why." |
| 3:10 | Editor: `fetch_with_backoff`: `if 200 <= status < 300: return body`; `if status == 429 or status >= 500:` → `Retry-After` branch or `base = 2 ** attempt; sleep(base + random.uniform(0, base * 0.5))`; else `raise ApiError(status)`. | "Now errors. The rule is: retry what's transient, never retry what's your fault. A 429 or a 5xx: wait and try again. If the server sends Retry-After, honour it exactly; it's telling you the answer. Otherwise back off exponentially: one second, two, four, eight, plus random jitter." |
| 3:50 | Table from the lesson, rows 400/401/403/404/409/422 highlighted. | "Anything else, a 400, a 403, a 422, fails immediately. A malformed request retried five times is five identical failures and a slower alert." |
| 4:10 | Overlay: four workflows hitting a shared key, all retrying at t=1s → stacked spike; with jitter → spread. | "Why the jitter? If four workflows share a key and all get throttled together, without jitter they all retry at the same instant and get throttled again." |
| 4:35 | Response headers: `X-RateLimit-Limit: 300`, `X-RateLimit-Remaining: 12`, `X-RateLimit-Reset: 1773412800`. | "Better still, don't hit the limit at all. Read these headers on every response. Twelve left out of three hundred is under ten percent, so slow down voluntarily. Reset here is a Unix timestamp; some APIs send seconds remaining instead, so check the docs." |
| 5:00 | Editor: validation `if r["status"] not in KNOWN: insert into quarantine`. Terminal: a fixture with `pending_review` → row in `quarantine`, not in `orders`. | "Each record gets validated. When the vendor adds a pending_review status, a workflow that branches on four values routes it to the default branch, silently, for weeks. Comparing against the known set makes it an event you see." |
| 5:35 | Editor: upsert `insert into orders (...) values (?, ?, ?, ?, ?) on conflict(id) do update set ...`. | "The write is a parameterized upsert keyed on the order id. Values go in as parameters, never pasted into the SQL. And because it's an upsert, running the pull twice gives one row per order, not two." |
| 6:05 | Editor: `updated_since = since - 5 minutes`; and `sync_state` write placed after the loop. | "Incremental pulls: store the last synced timestamp and ask from five minutes before it. The overlap produces duplicates on purpose; the upsert absorbs them. And the cursor advances only after the whole pull succeeds. Advance it per page and a failure halfway leaves a gap you'll never notice." |
| 6:40 | Terminal: `python -m pytest -q` → `13 passed`. | "Thirteen tests, all offline, no cloud account. Every behaviour I just described is one of them." |
| 7:00 | Checklist slide: five facts; three guards; retry transient only; Retry-After; jitter + cap; write per page; validate known values; upsert; advance cursor last. | "That's a pull you can leave running overnight. In the project for this lesson, you'll build it yourself against the same tests." |

## On-screen assets and B-roll
- `sync.py` and `tests/test_sync.py` from project db305-x01.
- A `curl` call against a sandbox API or a recorded response (blur the bearer token; use `$FREIGHT_KEY` from an environment variable on screen, never a literal key).
- Whiteboard overlays for offset drift and retry storms (can reuse animation db305-a01 frames).

## Accessibility
- Captions and a transcript with all code shown as text.
- Terminal font at least 18 pt; dark-on-light theme for contrast.
- Highlights use a box outline plus narration naming the line, not color alone.

## Check for understanding
1. Your pull stopped with `stopped_no_progress` on page 2. What is the most likely bug? *Answer: the cursor from the previous response is not being passed on the next request, so page 2 repeats page 1.*
2. You get a 422. Do you retry? *Answer: no. It means your payload failed validation; log it and quarantine. Only 429 and 5xx are retried.*
3. Why does the sync cursor advance only after the whole pull succeeds? *Answer: advancing per page means a failure midway would skip the unfetched records next time, leaving a silent gap.*
