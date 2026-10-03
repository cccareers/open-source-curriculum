---
lesson_id: ai102-09
course_id: ai102
pathway: prompt-engineer
title: Connecting Tools with REST APIs
order: 9
kind: lesson
competency_ids:
  - D2-S1-C03
objectives:
  - Connect a tool that has no prebuilt integration by calling its REST API from an HTTP step
---

## The day the connector is not there

Everything so far has relied on a prebuilt connector: you picked an app from a list, authorised it once, and got a friendly form with named fields. That covers a few thousand applications and it will not cover the one your organisation actually uses. Sooner or later you will search the app directory for your booking system, your regional payment provider, or your industry-specific records tool, and it will not be there.

It is also not a binary. A connector may exist but be missing the *event* you need, or the *action* you need, or a field the API supports and the connector never exposed. "There is a connector but it cannot do this" is more common than "there is no connector."

The escape hatch in every serious platform is a generic **HTTP step** — Zapier's Webhooks by Zapier with its Custom Request action, Make's HTTP module, and the equivalent in every competitor. It lets you construct an HTTP request by hand and use the response like any other step's output. Learning to use it is what converts a platform's app directory from a hard boundary into a convenience, and it is the difference between "we can automate the things someone built a connector for" and "we can automate our systems."

You do not need to write code to do this. You need to read an API's documentation, translate it into six fields on a form, and interpret what comes back.

## What a REST API is, in the terms you need

An API is a set of URLs that accept structured requests and return structured answers. In the REST style, the URL identifies a **resource** and the HTTP **method** says what to do with it.

```text
GET    https://api.example.com/v2/bookings          list bookings
GET    https://api.example.com/v2/bookings/8841      fetch one booking
POST   https://api.example.com/v2/bookings           create a booking
PATCH  https://api.example.com/v2/bookings/8841      change part of one
PUT    https://api.example.com/v2/bookings/8841      replace one entirely
DELETE https://api.example.com/v2/bookings/8841      remove one
```

Two of these have a safety property worth knowing. `GET` and `DELETE` are **idempotent** in principle — calling them twice has the same effect as once — as is `PUT`. `POST` is not: two identical `POST`s create two bookings. That is exactly the idempotency problem from lesson 07, and it is why retries around a `POST` need a key or a find-first step. `PATCH` is not guaranteed idempotent either: setting a field to a value is safe to repeat, but a `PATCH` that appends to a list or increments a counter is not. Read what the endpoint does before you retry it.

A request has four parts you will configure.

**The URL**, including any **path parameters** (`/bookings/8841`) and **query parameters** (`?status=confirmed&limit=50`). Query parameters filter, sort, and paginate; path parameters identify.

**Headers**, which carry metadata. The three you will use constantly are `Authorization` (who you are), `Content-Type` (what you are sending), and `Accept` (what you want back).

**The body**, present on `POST`, `PATCH`, and `PUT`. Almost always JSON.

**The method** itself.

The response has three parts: a **status code**, **headers**, and a **body**. Status codes group by first digit:

```text
2xx  succeeded         200 OK   201 Created   204 No Content
3xx  redirect          usually followed automatically
4xx  you were wrong    400 bad request   401 not authenticated
                       403 not permitted 404 not found
                       409 conflict      422 validation failed
                       429 rate limited
5xx  they were wrong   500 internal      502 bad gateway
                       503 unavailable   504 timeout
```

The 4xx-versus-5xx split is the retry decision from lesson 07 in a single digit. A 5xx and a 429 are worth retrying; a 400, 401, 403, 404, or 422 are not, because they will fail identically until you change something.

## Reading the documentation, in order

Give yourself twenty minutes with the API's docs before you configure anything. Answer these nine questions in writing, because every one of them will otherwise be discovered the hard way.

1. **What is the base URL**, and does it differ between test and production environments?
2. **How does authentication work**, and where does the credential go — an `Authorization` header, a custom header, a query parameter? (Getting and storing the credential safely is lesson 11; here you only need to know where it goes.)
3. **Which endpoint does what I need**, with which method?
4. **What exactly does the request body look like** — field names, types, which are required, what nesting?
5. **What does a successful response look like**, and where inside it is the data? Some APIs return the object at the top level; many wrap it in `data`, `result`, or `items`.
6. **How does pagination work** — page numbers, offsets, or cursors — and what is the maximum page size?
7. **What are the rate limits**, and does the response tell you your remaining budget in a header?
8. **What do errors look like** — the status codes used and the error body's shape?
9. **Is there a sandbox** or test mode? Use it. Development against production data is how you email six hundred customers by accident.

A well-documented API answers all nine on two pages. A badly documented one will make you infer some of them from a sample response, which is legitimate — but write down what you inferred, because an inference you forget is a defect you cannot explain later.

## Configuring the HTTP step

The generic HTTP step is the same form everywhere, with different labels. A `GET` with filtering:

```text
Method:  GET
URL:     https://api.example.com/v2/bookings
Query parameters:
  status        confirmed
  updated_since {{formatDate(addMinutes(now; -15); "YYYY-MM-DDTHH:mm:ss[Z]")}}
  limit         50
Headers:
  Authorization  Bearer {{connection.api_token}}
  Accept         application/json
Parse response: Yes
```

A `POST` that creates something:

```text
Method:  POST
URL:     https://api.example.com/v2/bookings
Headers:
  Authorization  Bearer {{connection.api_token}}
  Content-Type   application/json
  Accept         application/json
Body type: Raw / JSON
Body:
```

```json
{
  "customer": {
    "name": "{{1.`Requester Name`}}",
    "email": "{{1.`Requester Email`}}"
  },
  "service_code": "COPY",
  "starts_at": "{{formatDate(1.Deadline; \"YYYY-MM-DD\")}}T09:00:00Z",
  "notes": "{{replace(1.Details; \"\\\"\"; \"'\")}}",
  "external_ref": "{{1.`Source Row Id`}}"
}
```

Five things in that body are deliberate and each prevents a specific failure.

**`Content-Type: application/json` is set.** Omit it and many APIs will refuse the body or parse it as form data. This is the single most common cause of a mysterious `400` on a request that looks correct.

**Quotes inside mapped values are escaped.** A user typing `He said "urgent"` in the Details field will produce invalid JSON and a `400` that appears intermittently and looks like an API fault. Escape or strip quotes in any free-text value you interpolate, or use the platform's structured body builder rather than raw JSON where one is offered. Quotes are not the only offender. A raw line break and a backslash inside a JSON string are just as invalid, so the `replace()` in the example above handles only one of three cases. A multi-line Details field needs its newlines escaped (as `\n`) or replaced with spaces as well.

**The date is formatted explicitly** into the format the API documents, rather than passed through and hoped over.

**`external_ref` carries your identifier** into their system. It is the key you will search on to avoid duplicates, exactly as in lesson 05.

**Nesting matches the documented shape.** `customer` is an object because the docs say so; flattening it to `customer_name` produces a `422` with a message you will spend an hour reading.

Turn on the platform's option to **parse the response as JSON** so downstream steps get a mappable structure instead of a string. Then read the response carefully:

```json
{
  "data": {
    "id": 8841,
    "status": "pending",
    "customer": { "id": 553, "name": "Dana Okafor" },
    "starts_at": "2026-03-18T09:00:00Z",
    "external_ref": "row-10453",
    "links": { "self": "/v2/bookings/8841" }
  },
  "meta": { "request_id": "req_01HZ8P2K4M" }
}
```

The booking id is at `data.id`, not `id`. Mapping the wrong path is the second most common defect after content type, and it produces empty values downstream rather than an error — so check the actual response structure in the step's output panel rather than assuming the shape from the documentation's prose.

Store `meta.request_id` if the API provides one. When you have to ask their support why a call behaved oddly, that string is the first thing they will ask for.

## Test outside the platform first

Do not debug two things at once. Before wiring an API into a workflow, make the call succeed in isolation using an API testing client, your terminal, or the API's own documentation console. Only once you have a known-good request should you translate it into the HTTP step.

```bash
curl -i -X POST "https://api.example.com/v2/bookings" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"customer":{"name":"Test User","email":"test@example.com"},
       "service_code":"COPY","starts_at":"2026-03-18T09:00:00Z",
       "external_ref":"test-001"}'
```

The `-i` flag prints response headers, which is where rate-limit and pagination information hides. When the workflow version then fails and the isolated version works, the difference is in your step configuration — usually a header, an unescaped value, or a mapping — and you have halved the search space.

Keep the working request in a note beside the automation. It is the fastest possible reproduction case for whoever debugs this next, including you.

## Pagination

An endpoint that returns a list returns *some* of the list. Three schemes cover nearly everything.

**Offset or page number.** `?page=2&per_page=100` or `?offset=200&limit=100`. Simple, and unreliable while data is changing underneath you — records inserted between page one and page two shift everything and you will skip or repeat rows.

**Cursor or token.** The response contains an opaque pointer to the next page: `{"data":[...],"next_cursor":"eyJpZCI6ODg0MX0"}`. You pass it back as a query parameter. Sturdier, and the one to prefer when offered.

**Link headers.** The same idea expressed in a `Link` response header containing a `rel="next"` URL.

In a workflow, paging means a loop: call, collect, check for a next marker, call again. Both platforms support this with a repeater or iterator construct, and Make's HTTP module has a pagination option for common schemes.

Three rules for paging in no-code. **Always cap the loop** at a maximum number of pages, and treat hitting the cap as an exception, because a malformed cursor that keeps returning the same page will loop until your quota is gone. **Always request the largest page size the API allows**, since every page is a billable operation. And **prefer filtering server-side** with query parameters over fetching everything and filtering in the workflow — an `updated_since` parameter can turn a 40-page sweep into a 1-page one, and the difference compounds every run.

## Rate limits

Every API limits how fast you may call it, and no-code loops hit those limits easily, because a loop over 200 records issuing one request each has no natural pacing.

Look for these response headers:

```text
X-RateLimit-Limit:      600
X-RateLimit-Remaining:  12
X-RateLimit-Reset:      1741080000
Retry-After:            30
```

When you get a `429`, the correct behaviour is to wait — ideally for the number of seconds in `Retry-After`, otherwise using the exponential backoff from lesson 07 — and try again. What you must not do is retry immediately in a loop, which some platforms will happily do and which converts a brief throttle into a sustained block.

Three preventive measures are better than reacting. **Add a small delay module inside high-volume loops**; a one-second pause costs nothing and keeps you under most limits. **Use bulk endpoints where they exist** — many APIs accept an array of up to 50 or 100 objects in one request, turning 100 calls into 2. And **reduce call volume by design**: filter server-side, cache values that rarely change into your database rather than re-fetching them, and question any workflow that calls the same endpoint twice in one run.

## Handling errors from an HTTP step

Configure the step so a non-2xx status **surfaces as an error** rather than passing quietly to the next step — most platforms have an "evaluate all states as errors" or equivalent toggle, and leaving it off means a `401` flows onward as an empty value and your database fills with blanks.

Then branch on the status code, which is lesson 07's machinery pointed at this specific step:

```text
Status 2xx        -> continue
Status 429 / 5xx  -> retry with backoff (max 3), then dead-letter
Status 401 / 403  -> do not retry; alert immediately, this is a credential problem
Status 404        -> do not retry; branch to create-instead-of-update, or dead-letter
Status 400 / 422  -> do not retry; dead-letter with the full request body attached
```

That last one is important. A `422` means *your payload was wrong*, and the only way to diagnose it later is to have kept the payload. Log the request body alongside the error in your exceptions table, minus anything sensitive.

Read the error body rather than only the status; good APIs put the actual problem in it:

```json
{
  "error": {
    "code": "validation_failed",
    "message": "starts_at must be in the future",
    "fields": [{ "name": "starts_at", "issue": "in_the_past" }]
  }
}
```

Two further habits. **Set a request timeout** so a hanging call fails in 30 seconds rather than occupying a run indefinitely. And **make `POST` calls safe to retry** — search first on your `external_ref`, or use the API's idempotency-key header if it offers one, which is a header you generate containing a unique value per logical operation so the server itself deduplicates.

## Making it reusable

Once a call works, the temptation is to copy the step into the next workflow. Resist it, because you now have the same URL, headers, and body shape in several places and the next API version change means finding all of them.

Three ways to consolidate, in increasing order of effort. **Save it as a reusable component** where the platform supports one — Zapier lets you build a custom action from a configured request, and Make lets you package a scenario others call. **Extract it into one sub-workflow** that other workflows invoke with parameters, so the request exists once. Or, at minimum, **document it in one place**: a record in your database holding the endpoint, method, body template, and a link to the docs, referenced from every workflow that uses it.

Also keep an eye on **versioning**. The `/v2/` in the URL is a promise that the shape will not change under you, and the day the provider announces v3 you want a list of every place v2 appears. That list is much easier to produce if the answer is "one sub-workflow" than "somewhere in fourteen scenarios."

## Practice

Choose a real API with a free tier and a sandbox — a public data service, a project tool, a hosted model API, or your own no-code database's REST interface, which is an excellent target because you can verify every effect immediately.

1. **Answer the nine documentation questions in writing** for your chosen API, with a URL for each answer and the date checked. Mark clearly any answer you inferred from a sample rather than read in the docs.

2. **Get a `GET` working outside the platform first.** Use a terminal or an API client with `-i` or the equivalent so you see response headers. Record the status, three interesting response headers, and the JSON path where the actual data lives.

3. **Translate it into an HTTP step.** Reproduce the same call in your automation platform with query parameters, headers, and response parsing enabled. Map two nested fields from the response into a database record. Show the step's raw output panel next to the record it produced.

4. **Do a `POST` that creates something, carrying your own reference.** Include `Content-Type`, a correctly nested body, an explicitly formatted date, and an `external_ref` or equivalent field holding your database record's key. Verify the object exists in the target system and that your reference is on it.

5. **Break it four ways on purpose.** Produce a `400` by removing the content type, a `401` by corrupting the credential, a `404` by requesting a non-existent id, and a `422` by omitting a required field. For each, record the status, the error body, and what your workflow did. Then implement the status-code branching from this lesson and re-run all four.

6. **Prove the quote bug and fix it.** Put a double quote and a newline into a free-text field that you interpolate into a raw JSON body. Show the resulting failure, then fix it with escaping or a structured body builder, and re-run with the same input.

7. **Page through a large collection.** Find or create at least 250 records and retrieve them all, with the largest allowed page size, a loop cap, and a stated policy for what happens at the cap. Report the number of pages, the operations consumed, and the same figures after you add a server-side filter that halves the result set.

8. **Survive a rate limit.** Fire enough requests in a burst to receive a `429`. Show the rate-limit headers, implement `Retry-After` handling plus a delay inside the loop, and demonstrate the same burst completing. State the requests-per-minute your workflow now sustains.

9. **Make the `POST` idempotent and reusable.** Add a search-first step or an idempotency key so that running the create twice with the same input produces one object. Then extract the whole call into a reusable component or sub-workflow, call it from a second workflow, and list every place you would have to edit if the API moved to v3.

## Check your understanding

1. A `POST` that looks correct returns `400`, and the same request works from `curl`. What two causes do you check first? *Answer: a missing `Content-Type: application/json` header in the HTTP step, and an unescaped quote, newline, or backslash in an interpolated free-text value.*
2. Your HTTP step's output has values, but downstream fields are empty. What is the likely cause? *Answer: the wrong response path, for example mapping `id` when the API returns the object inside `data`. Check the actual parsed output panel.*
3. A `401` and a `429` arrive in the same hour. How should each be handled? *Answer: 401 means no retry. Alert immediately, because it is a credential problem a human must fix. 429 means wait (use `Retry-After` if present, otherwise backoff) and retry within your cap.*
