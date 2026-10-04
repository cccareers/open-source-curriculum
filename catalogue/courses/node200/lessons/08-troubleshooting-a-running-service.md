---
lesson_id: node200-08
course_id: node200
pathway: software-developer
title: Troubleshooting a Running Service
order: 8
kind: lesson
competency_ids:
  - D6-S1-C02
  - D4-S1-C05
objectives:
  - Troubleshoot a running service from its logs and symptoms
---

## Debugging something you cannot stop

Everything you have debugged so far, you controlled. The failure was in front of you, you could add a `console.log`, restart, and try again in ten seconds.

A running service is a different problem. It failed twenty minutes ago, for one user out of four hundred, on a machine you cannot attach a debugger to, and the only record of what happened is whatever your code chose to write down at the time. You cannot reproduce it by asking, because the user's account of what they did is approximate, and you cannot experiment freely, because everyone else is still using it.

Two things follow, and they are the whole lesson. **The service must record enough to be diagnosed after the fact** — that is an engineering decision you make before the incident. And **diagnosis is a method, not an intuition**: symptom, observation, hypothesis, test, fix, verify, in that order, written down as you go.

The failure mode this lesson exists to prevent is the one every apprentice starts with: seeing a red error, guessing a cause, changing something, and checking whether it looks better. That works occasionally and teaches you nothing when it does, because you never established what was actually wrong. Worse, on a running system it adds a second change to a situation you did not understand.

## The loop

**1. Establish the symptom precisely.** Not "the site is broken" but "requests to `POST /events/:id/registrations` return 500 for about one in five attempts, starting around 14:10, on all accounts we have tried." Precision here does most of the work: a symptom that occurs on one endpoint but not others, or started at a specific time, has already eliminated most possible causes.

Get four facts before anything else: **what** exactly happens (status code, message, screenshot), **when** it started, **who** it affects (one user, one account type, everyone), and **what changed** near that time (a deploy, a migration, a configuration change, a traffic spike). The fourth is the highest-yield question in operations. Most things that break were working, and something moved.

**2. Observe before you theorise.** Read the logs around the reported time. Look at the error rate, the response times, and the database. Resist forming a theory until you have looked, because a theory formed first turns your reading into a search for confirmation.

**3. Form one hypothesis, stated so it can be wrong.** "The connection pool is exhausted because the registration transaction is not releasing connections" is testable. "Something is wrong with the database" is not.

**4. Test it with the cheapest available evidence.** If the pool is exhausted, active connections in Postgres will be at the maximum and the slow requests will be slow in the same way across unrelated endpoints. That is a query and a log filter, not a deploy.

**5. Fix, and know why the fix works.** A change that makes the symptom disappear without an explanation is not a fix; it is a coincidence you will meet again.

**6. Verify against the original symptom, and watch.** Return to the precise statement from step 1 and check that specific thing. Then watch for long enough to be confident, because intermittent problems love to look fixed.

**7. Write it down.** What the symptom was, what caused it, how you confirmed it, what you changed, and what would have caught it sooner. Fifteen minutes now saves the next person — often you — several hours.

Two rules govern the loop on a live system. **Change one thing at a time**, because two simultaneous changes make the result uninterpretable. And **preserve the evidence before you fix**: copy the logs, capture the query plan, note the counts. The moment you restart the process, most of what you needed is gone.

## Making the service diagnosable

You cannot debug what the service did not record. Structured logging is the single highest-value investment here, and node101's `morgan` access log is not enough — you need application events, correlated per request, in a form you can query.

```bash
npm install pino pino-http
```

```javascript
// src/lib/logger.js
import pino from "pino";
import { config } from "../config/index.js";

export const logger = pino({
  level: config.logLevel,
  redact: {
    paths: [
      "req.headers.cookie",
      "req.headers.authorization",
      'res.headers["set-cookie"]',  // the login response carries the new session id
      "req.body.password",
      "*.passwordHash",
      "*.password",
    ],
    censor: "[redacted]",
  },
  base: { service: "events-board", env: config.env },
});
```

```javascript
// src/middleware/request-logger.js
import pinoHttp from "pino-http";
import crypto from "node:crypto";
import { logger } from "../lib/logger.js";

export const requestLogger = pinoHttp({
  logger,
  genReqId: (req) => req.get("x-request-id") ?? crypto.randomUUID(),
  customLogLevel: (req, res, err) => {
    if (err || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  customProps: (req) => ({ userId: req.currentUser?.id }),
});
```

Registered first in `createApp()`, before anything that can fail, so every request is recorded even when it dies in body parsing.

The output is one JSON object per line:

```json
{"level":40,"time":1781530200123,"service":"events-board","env":"production",
 "reqId":"5f0d…","userId":"acc-91","req":{"method":"POST","url":"/events/12/registrations"},
 "res":{"statusCode":409},"responseTime":41,"msg":"request completed"}
```

pino writes levels as numbers: 30 is `info`, 40 is `warn`, 50 is `error`, 60 is `fatal`. This line is a 409, so the `customLogLevel` function above logs it at 40.

Five properties of that line are what make it useful at three in the morning.

**It is structured.** A line of prose can be grepped; a line of JSON can be filtered, counted, and grouped. `jq 'select(.res.statusCode >= 500)'` is a question you can ask of the second format and not the first.

**Every line carries a request id.** This is the correlation key, and it is the difference between "an error happened" and "here are the eleven things that happened during the request that failed." Pass it through to every log call inside the request, return it in the error body as lesson 06 did, and accept an inbound `x-request-id` so a trace survives across services.

**It carries the user id.** "Only affects one account" and "affects everyone" are different investigations, and you can only tell them apart if the identity is in the line.

**Levels are assigned by consequence, not by feeling.** `error` for things that are your fault (5xx, unhandled exceptions), `warn` for things that are the client's fault but may indicate abuse (4xx, rate limits), `info` for the normal record, `debug` for detail you turn on temporarily. The discipline that matters: **the error log must be empty when the service is healthy.** An error log with a steady background of validation failures is a log nobody reads.

**Secrets are redacted at the logger, not at each call site.** Passwords, cookies, session ids, tokens, and hashes must never be written, and the only reliable way to guarantee that is a central redaction list. Remember that secrets travel in both directions: the request's `Cookie` header carries the session id in, and the login response's `Set-Cookie` header carries a brand-new one out. That is why both are on the list. A log file is copied, shipped, and retained; treat it as though it will be read by someone who should not see your users' data.

Then log the events that carry meaning, not just the HTTP envelope:

```javascript
logger.info({ reqId: req.id, eventId, attendeeId, outcome: "waitlisted", confirmed, capacity },
  "registration processed");
```

Log at the decision, with the values the decision was made from. That line answers "why was this person waitlisted?" in one read. Two anti-patterns to avoid: logging inside a loop over rows, which floods the log and hides the signal, and logging the same event at three layers, which triples volume without adding information.

Finally, log to standard output and let the platform collect it. Writing to a file inside a container that gets replaced on every deploy is how logs are lost.

## Asking questions of the logs

With JSON lines, investigation is filtering. Locally, `jq`; in a hosted log viewer, the same predicates in its query language.

```bash
# every 5xx in the file
jq 'select(.res.statusCode >= 500)' app.log

# everything that happened during one request
jq 'select(.reqId == "5f0d8a2c-...")' app.log

# slowest 10 requests (skip application lines, which have no responseTime)
jq -s 'map(select(.responseTime != null)) | sort_by(-.responseTime) | .[:10] | .[] | {url: .req.url, ms: .responseTime}' app.log

# error count by route
jq -r 'select(.res.statusCode >= 500) | .req.url' app.log | sort | uniq -c | sort -rn

# when did it start
jq -r 'select(.res.statusCode >= 500) | .time' app.log | head -1
```

The first question is almost always **"when did this start, and what happened just before?"** — the last query, followed by reading the surrounding lines. The second is **"is it one route or everything?"** — the fourth query. Those two shape the entire investigation, because a problem confined to one route is a code problem and a problem across every route is a resource problem.

## A field guide to failures

Most production problems in a service like yours are one of a handful of things. Learning their signatures turns a two-hour investigation into a ten-minute one.

**Connection pool exhaustion.** *Signature:* everything gets slow at once, across unrelated endpoints, including ones that barely touch the database; response times pile up at a similar value; no single query is slow. *Cause:* connections are borrowed and not returned — a transaction with a path that neither commits nor rolls back, a query awaited inside a long external call, or simply more concurrency than `pool.max`. *Confirm:*

```sql
SELECT state, count(*) FROM pg_stat_activity GROUP BY state;
SELECT pid, state, now() - query_start AS duration, left(query, 80)
FROM pg_stat_activity WHERE state <> 'idle' ORDER BY duration DESC LIMIT 10;
```

Many connections `idle in transaction` is the tell: something opened a transaction and walked away.

**A slow query that grew.** *Signature:* one endpoint slow, gradually worsening over weeks, correlated with table growth. *Cause:* a missing index, or a query that was fine at a thousand rows. *Confirm:* `EXPLAIN ANALYZE` the query and look for `Seq Scan` on a large table, then compare against the row count. Lesson 04's query log tells you what actually ran.

**Unhandled promise rejection.** *Signature:* on Node 15 and later, the default is that the process exits: a stack trace on standard error, every in-flight request dropped, then the supervisor's restart. Clients see connections reset ("Empty reply from server"), not error responses. If something has installed an `unhandledRejection` listener that logs but does not exit, you get the other signature instead: the one request hangs forever, and nothing useful appears in the log. *Cause:* an async route handler without a `try/catch` on Express 4, or a promise created and never awaited, including in a `setTimeout` or an event listener. *Confirm:* a last-resort handler in `server.js` so it is at least recorded in your structured log before the process exits:

```javascript
process.on("unhandledRejection", (reason) => {
  logger.fatal({ err: reason }, "unhandled rejection — exiting");
  process.exit(1);
});
process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "uncaught exception — exiting");
  process.exit(1);
});
```

Exiting is correct. A process that has thrown an exception nobody caught is in an unknown state, and the supervisor restarting it is safer than continuing.

**A crash loop after deploy.** *Signature:* the platform reports the service as unhealthy; the log shows the same startup line repeating every few seconds. *Cause:* almost always configuration — a missing environment variable, a database that is not reachable, a migration that has not run, a port that is not the one the platform assigned. *Confirm:* read the last line before each restart; the fail-fast config module from lesson 02 makes this a one-line diagnosis.

**Memory growth.** *Signature:* memory climbs steadily and never falls; eventually the process is killed and restarted. *Cause:* something accumulating per request — a cache with no eviction, an array of recent items, listeners added and never removed, or the in-memory session store lesson 05 warned about. *Confirm:* log `process.memoryUsage().heapUsed` every minute and look at the shape. Sawtooth is healthy; a staircase is a leak. Take two heap snapshots with `node --inspect` several minutes apart and compare retained objects.

**A blocked event loop.** *Signature:* the whole process stops responding, including the health check, then recovers. *Cause:* synchronous work on the main thread — a large `JSON.parse`, a synchronous file read, an expensive regular expression, a password hash with the cost set far too high. *Confirm:* everything is slow for the same interval regardless of route, and CPU is pinned.

**Everything works except through the proxy.** *Signature:* login fails only in the deployed environment, or `req.ip` is the same for everyone, or the rate limiter locks out all users at once. *Cause:* `trust proxy` not set, so Express sees the proxy rather than the client and considers the connection insecure. Lesson 05 flagged this; it is common enough to be worth recognising by symptom.

**The data is wrong rather than the code.** *Signature:* one record behaves strangely and the rest are fine. *Cause:* a partially applied migration, a manual edit in a console, a timezone stored wrong, or a null in a column your code assumed was populated. *Confirm:* query the actual row before reading any code. The most common wasted hour in this job is spent reading a function that was working correctly on bad input.

Health checks are what make several of these visible early. Keep two: a **liveness** check that returns 200 if the process is running and touches nothing, and a **readiness** check that verifies the dependencies it needs:

```javascript
healthRouter.get("/live", (_req, res) => res.json({ status: "ok" }));

healthRouter.get("/ready", async (_req, res) => {
  try {
    await db.raw("SELECT 1");
    res.json({ status: "ok", uptime: process.uptime() });
  } catch (err) {
    logger.error({ err }, "readiness check failed");
    res.status(503).json({ status: "degraded", reason: "database unreachable" });
  }
});
```

The distinction matters: a liveness check that queries the database will report the process as dead during a brief database blip, and the platform will restart a perfectly healthy process — turning a small problem into an outage.

Alongside them, watch four numbers as a habit: request rate, error rate, response time at the 95th percentile, and saturation (pool usage, memory, CPU). Most incidents announce themselves in one of those before a user does.

## Working safely on a live system

Three rules, learned expensively by other people.

**Reproduce somewhere else first.** Restore a copy of the data if you can, run the same request locally, and see it fail. A failure you can reproduce is a failure you can iterate on; a failure you can only observe forces you to experiment in production.

**Never edit code on a running host.** Even when it would take thirty seconds. The change is not in version control, the next deploy silently reverts it, and nobody — including you next week — knows it happened.

**Prefer a rollback to a fix under pressure.** If a deploy broke it, put the previous version back and diagnose calmly. Debugging while people are affected produces the worst decisions of your career.

And know when to stop. If you have been on something for an hour with no working hypothesis, or the problem involves data loss, security, or money, escalate. Escalating early with a clear summary is a strength; escalating at hour four with a system you have changed six times is not.

## Reporting what you found

Finding the problem is half the competency. The other half is telling someone in a form they can act on, and this is where apprentices most often lose the value of good work.

A defect report needs six things, and it fits on half a page:

```markdown
**DEF-119 — Registration returns 500 intermittently under load**

Severity: High (blocks registration for ~20% of attempts on popular events)
Environment: production, v2.4.1, first seen 2026-06-14 14:07 UTC
Reported by: K. Osei (support), 3 user reports

**Steps to reproduce**
1. Seed an event with capacity 50 and 5,000 existing registrations.
2. Issue 30 concurrent POSTs to /events/{id}/registrations.
3. Roughly 6 of 30 return 500 rather than 201 or 409.

**Expected:** every request returns 201 (seat taken) or 409 (full/duplicate).
**Actual:** ~20% return 500 with code `internal_error`.

**Evidence**
- reqId 5f0d8a2c-… : `TimeoutError: Knex: Timeout acquiring a connection`
- pg_stat_activity showed 10 connections `idle in transaction` during the window
- Error rate on this route: 0/min before 14:07, ~14/min after (log query attached)

**Suspected cause:** the registration transaction does not release its connection
when the capacity check throws, so the pool drains under concurrency. The throw
path was added in commit a3f9c21 (2026-06-14 13:52), 15 minutes before onset.

**Workaround:** none. Retrying usually succeeds.
**Not yet checked:** whether the cancel path has the same shape.
```

What makes it good is not length. **The steps reproduce it** — a report without them will be handed back to you. **Expected and actual are separate lines**, so there is no ambiguity about what "broken" means. **Evidence is quoted, with request ids**, so the next person can find the same lines instead of re-deriving them. **The suspected cause is labelled as suspected**, and links to a specific change with a time that fits the symptom. And **"not yet checked" is stated**, so the reviewer knows the boundary of your work rather than assuming you covered it.

The same discipline applies to reporting *upward* in the moment, which is a different message: short, factual, and ending in a question.

```text
14:40 — Registration is failing intermittently in production, ~20% of attempts
since 14:07. Symptom: 500s with "Timeout acquiring a connection"; Postgres shows
connections stuck idle in transaction. Suspect the capacity-check throw path added
in a3f9c21 leaks a connection. Details in DEF-119.

Options as I see them: roll back a3f9c21 (5 minutes, restores service, loses the
capacity fix) or patch the transaction to release on throw (30 minutes, needs a
test). I would roll back now and patch properly after. Do you agree?
```

Four properties: it leads with impact rather than with the investigation story; it separates fact from suspicion; it proposes options with costs; and it asks a specific question. Compare that with "the registrations thing is being weird again, any ideas?" — same information, none of it usable.

Two more reporting habits. **Report early rather than completely**: a partial report at 14:40 lets someone else start on the rollback while you keep digging. And **close the loop** — when it is fixed, say so, in the same place, with what the cause turned out to be. Incidents that are never explicitly closed leave everyone quietly uncertain for days.

Afterwards, write a short note: timeline, cause, fix, and — most valuable — what would have caught this sooner. For DEF-119 the answer is a test that fires concurrent registrations against an event where the capacity check throws, which is exactly the kind of row that belongs in lesson 06's risk register and lesson 07's suite. That is how an incident makes the next release safer instead of just making a bad afternoon.

## Practice

You will break your own service deliberately, diagnose it from the outside, and report it. Work from logs and queries — reading the code you just edited is cheating, and the point is the method.

1. Add `pino` and `pino-http` with request ids, user ids, redaction of cookies and passwords, and status-based log levels. Confirm a login request logs no password and no cookie value anywhere.
2. Make the request id visible end to end: returned in every error body, present on every application log line for that request, and accepted from an inbound `x-request-id` header. Demonstrate with one `curl` and one `jq` filter that retrieves every line for that request.
3. Split your health endpoint into `/healthz/live` and `/healthz/ready`, with readiness checking the database. Stop Postgres and confirm liveness stays 200 while readiness returns 503, then explain in `NOTES.md` why a platform restarting the process on that 503 would be wrong.
4. Add `unhandledRejection` and `uncaughtException` handlers that log at fatal level and exit. Trigger one deliberately and record the log line.
5. **Fault 1 — pool exhaustion.** Introduce a transaction path that throws without releasing, or set `pool.max` to 2. Fire 30 concurrent registrations. Record the client-visible symptom, the log signature, and the output of the `pg_stat_activity` queries. Then diagnose it from that evidence alone and fix it.
6. **Fault 2 — the slow query.** Seed 50,000 registrations, drop the index on `(event_id, status)`, and measure the detail page. Record the response time before and after, plus both `EXPLAIN ANALYZE` plans, and state which scan type each used.
7. **Fault 3 — the silent hang.** Remove the `try/catch` from one async route handler and make it throw. Record what the client sees, what appears in the log, and how long the request takes to fail. Fix it and note which Express version behaves differently. (On Express 5 you will see a clean `500`, because the rejection is forwarded to your error handler. On Express 4 with the step 4 handlers installed, expect a fatal log line and a process exit rather than a hang. To see the true silent hang, temporarily make the `unhandledRejection` handler log without exiting. Record which of the three you observed.)
8. **Fault 4 — configuration.** Deliberately remove `SESSION_SECRET` and restart. Record the failure and how long it took to identify. Then remove the fail-fast check from your config module, restart, and record how the failure presents instead. Write one sentence on which you would rather debug.
9. Ask three questions of your logs with `jq` and record the commands and answers: what time did the 5xx rate change, which route produces the most 5xx, and what were the ten slowest requests.
10. Write a full defect report for Fault 1 in the six-part format from this lesson, with real request ids and real log excerpts from your own run.
11. Write the escalation message for the same fault: impact first, fact separated from suspicion, two options with costs, and a specific question. Keep it under 120 words.
12. Write a short incident note for Fault 2: timeline, cause, fix, and what would have caught it sooner. Name the specific test or alert you would add, and add it to your lesson 06 risk register as a new row.

**Deliverable:** a service with structured, correlated, redacted logging and split health checks, plus a `NOTES.md` documenting all four faults with their symptoms and evidence, a defect report, an escalation message, and an incident note with a new risk-register row.

## Check your understanding

1. Every endpoint, including `/healthz/live`, got slow at 14:07, and all response times cluster near the same value. Which failure from the field guide does that suggest, and which query confirms it?
2. Why must the liveness check avoid touching the database?
3. A user reports "it said something went wrong" and gives you request id `5f0d8a2c-…`. Write the `jq` command you run first.
4. In a defect report, why is "Suspected cause" labelled as suspected, and why is "Not yet checked" worth a line of its own?

**Answers**

1. If `/live` itself is slow, suspect a blocked event loop first: every request waits for the same synchronous work, and CPU is pinned. If `/live` stays fast while database-touching routes all stall at the same value, suspect connection pool exhaustion and confirm it with `SELECT state, count(*) FROM pg_stat_activity GROUP BY state;`. Look for many `idle in transaction`.
2. If it does, a brief database blip makes the platform think the process is dead and restart a healthy process, turning a small problem into an outage. Dependency health belongs in the readiness check.
3. `jq 'select(.reqId == "5f0d8a2c-...")' app.log`, adjusted to the key your logger actually uses for the request id.
4. Labelling it keeps fact separate from hypothesis, so a reviewer knows what to verify. "Not yet checked" marks the boundary of your work, so nobody assumes you covered what you did not.
