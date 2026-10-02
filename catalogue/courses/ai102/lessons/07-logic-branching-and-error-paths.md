---
lesson_id: ai102-07
course_id: ai102
pathway: prompt-engineer
title: Logic, Branching, and Error Paths
order: 7
kind: lesson
competency_ids:
  - D2-S1-C02
objectives:
  - Add branching, filters, retries, and explicit error paths so an automation behaves predictably when a step fails
---

## Predictable is the goal, not working

Everything you have built so far works when the input is what you expected and every service is up. That is the easy half. This lesson is about the other half: what your automation does when the input is strange, when a step returns an error, when the same event arrives twice, and when a service is briefly unavailable.

The word to hold onto is **predictable**, not *reliable*. You cannot stop a third-party API from being down. What you can do is guarantee that when it is down, your automation does one specific, known, documented thing — not "sometimes creates half a record, sometimes sends two notifications, sometimes fails silently." A colleague should be able to read your workflow and answer, for every step, the question "and if that fails?"

Undefined behaviour under failure has a signature that is easy to spot once you know it: nobody can say what the system did last Tuesday. The run history shows a gap, a record is half-written, someone got a notification about something that never completed, and the only recovery is a human reading rows and guessing. Everything below exists to make that impossible.

## Filters: stopping when you should

The cheapest control is the one that stops work from happening at all. A **filter** evaluates a condition and either lets the run continue or ends it.

In the list-shaped platform this is a Filter step: everything below it runs only if the condition passes, and the run ends with status **Stopped** — which is a normal outcome, not an error, and does not consume tasks for the steps that did not run. In Make it is a condition attached to a connection line, with the same effect for that bundle.

Put filters as early as possible. A filter after four steps has already paid for four steps. The very best filter is not a filter at all: it is a database view that only contains the records you want, so the trigger never fires for the rest (the `[AUTO]` views from lesson 05).

Two filter behaviours to internalise.

**Empty is not false.** A condition like `Status does not equal Cancelled` passes when `Status` is empty, because empty is not "Cancelled." Sometimes that is what you want and often it is not. When a field is optional, test it explicitly: `Status exists AND Status does not equal Cancelled`.

**Text comparisons have a case and a whitespace problem.** `"Website Copy "` does not equal `"Website copy"`. Prefer case-insensitive operators where the platform offers them, trim inputs, and prefer comparing against select-field values from lesson 05 rather than free text, which is exactly why that lesson insisted on select fields.

## Branching: doing different things

When you need more than "continue or stop," you need branches. Both platforms give you a construct — Paths in one, a Router with per-route filters in the other — and the mechanics differ (lesson 04 covered the router's structure), but the design discipline is identical and it is the discipline that matters.

**Write the conditions as a table before you build them.** Take the deciding inputs, enumerate the combinations, and assign an outcome to each row. For a request router:

| Client tier | Due within 2 days | Branch |
| --- | --- | --- |
| Priority | yes | Urgent queue, page the duty lead |
| Priority | no | Priority queue |
| Standard | yes | Standard queue, flag as tight |
| Standard | no | Standard queue |
| *empty or unknown* | any | Fallback: standard queue, log for review |

The table takes four minutes and finds the case you were going to forget — here, the record with no tier at all. Building branches without one is how you end up with a workflow that handles three of five real situations.

**Every branch set needs a fallback that does something.** Not an empty branch; a branch that records what happened. The most useful fallback in existence is: write a row to an `Exceptions` table with the input data and a reason, and post one message to a channel a human reads. Anything unexpected then becomes visible within minutes instead of never.

**Decide whether branches are exclusive and enforce it.** If exactly one branch should run, the conditions must be mutually exclusive, and the fallback must be genuinely last. If more than one may run, say so in the branch names, because a reader will assume exclusivity otherwise.

**Keep branch logic shallow.** Two levels of branching is manageable; four is unreadable and untestable. When you feel a third level coming, the usual fix is to move the decision into data — a lookup table, or a field on a record computed by a formula in lesson 05's database — so the workflow reads one value and branches once.

## Loops, and the batch that breaks things

Handling a list is where predictability most often collapses. Ten items go into a loop, item four fails, and now you have four processed, one broken, and five untouched — with no record of which is which.

Three rules make loops safe.

**Decide the policy before you build: stop on first failure, or continue and collect.** "Continue and collect" is right when items are independent — ten emails to send, one bad address should not block nine good ones. "Stop on first failure" is right when items are part of one logical whole. Whichever you choose, write it in the workflow's description, because a reader cannot infer it.

**Track per-item outcome in a real record.** For anything that matters, each item should end up with a status somewhere: processed, failed with reason, skipped. That converts a partial batch from a mystery into a query.

**Cap the loop.** Every loop needs a maximum. A list you expect to have 5 items will one day have 5,000 because someone imported a spreadsheet, and an uncapped loop will consume your entire monthly quota in eleven minutes. Set a limit and treat exceeding it as an exception to report, not a normal case to absorb.

## Retries: when trying again is the right answer

A **transient** failure is one that will probably succeed if you try again shortly: a timeout, a `429 Too Many Requests`, a `502` or `503`, a connection reset. A **permanent** failure will fail identically forever: a `400` because your payload is malformed, a `401` because the credential is wrong, a `404` because the record does not exist, a `422` because a required field is blank.

Retrying a transient failure is correct. Retrying a permanent one is a waste of quota and, worse, delays the moment a human learns something is genuinely broken. So the first job is to distinguish them, usually by status code.

Platform behaviour differs and you must know yours. The list-shaped platform will, on many errors, automatically hold and replay a run after a delay, and gives you a manual replay in the run history. Make gives you per-module error handling with an explicit **Break** directive that parks the run and retries it on a schedule you configure, along with settings for the number of attempts and the interval.

Configure retries with three parameters and defend each:

```text
Max attempts:      3
Backoff:           exponential — 1 min, 5 min, 25 min
Retry on:          408, 429, 500, 502, 503, 504, connection timeout
Do not retry on:   400, 401, 403, 404, 409, 422
```

Exponential backoff matters because a fixed one-minute retry against a service under load is part of the load. And retries are only safe if the operation is **idempotent** — which is why the next section is the one that actually makes retries usable.

## Idempotency, or why retries are not enough

An operation is **idempotent** when running it twice has the same effect as running it once. Creating a record is not idempotent by default: run it twice, get two records. That means a retry after a timeout — where you genuinely do not know whether the first attempt succeeded — is a coin flip between "fixed it" and "duplicated it."

Three mechanisms make no-code operations idempotent, in increasing order of strength.

**Find-or-create on a stable external key.** The pattern from lesson 03, keyed on the `Source Row Id` field you designed into lesson 05's schema. Search first; create only if not found. This costs one extra operation per run and eliminates the entire duplicate class.

**Update-by-key instead of create.** Where the destination supports an upsert — "create or update, matching on this field" — use it. One operation, idempotent by construction.

**A processed-events table.** For anything where the above are unavailable, keep a table with one row per event id you have handled. At the top of the workflow, look up the incoming event id; if present, filter out and stop. At the end, record it. This is heavier and it is the only thing that works when the downstream action has no key at all — sending an email, posting a message, charging a card.

State one of these three in your design for every mutating step. A step that mutates something and has none of them cannot be retried safely, and you should either add one or accept that failures there require a human.

## Explicit error paths

A filter handles expected variation. An **error path** handles a step that failed. The difference matters: an unexpected error with no path is where predictability dies.

Make gives you an explicit error handler route attached to a module, with directives that name the behaviour:

- **Resume** — swallow the error, substitute a value you specify, and carry on. Right when the step is genuinely optional.
- **Ignore** — discard this bundle and continue with others. Right in a "continue and collect" loop.
- **Break** — park the run, retry later on a schedule, and keep the incomplete execution visible for manual handling. The workhorse for transient failures.
- **Rollback** — stop and undo what the transaction supports. Right when a partial result is worse than nothing.
- **Commit** — stop deliberately and keep what has been done.

The list-shaped platform expresses less of this structurally; there you build it with a combination of the built-in error handling, a step that captures the failure into a record, and separate monitoring on the run history.

Either way, the pattern to standardise on is the **dead-letter path**: when a step fails in a way you cannot resolve, do not just stop. Write a row into an `Exceptions` table containing the input data, the step that failed, the error message, and a timestamp; then notify a channel. Now every failure is a record somebody can query, replay from, and count.

```json
{
  "workflow": "Intake -> Requests",
  "run_id": "01HZ8P2K4M",
  "failed_step": "Create a Record",
  "error_code": "422",
  "error_message": "Field 'Due' expects a date; received ''",
  "input_payload": {
    "Requester Name": "Dana Okafor",
    "Request Type": "Website copy",
    "Deadline": ""
  },
  "occurred_at": "2026-03-04T09:13:41Z",
  "retry_count": 3
}
```

Store that shape and you can answer, at any moment, "what has failed, how often, and why" — which is the question the person who inherits your build will ask first.

Two things belong beside the dead-letter path. **Alerting on failure**, so that a run erroring at 02:00 produces a message rather than a discovery three days later; both platforms can email or notify on a failed execution, and you should also alert on a *disabled* workflow, because the failure mode where a platform switches off a repeatedly-erroring automation is one people miss for weeks. And **timeouts**, so that a step waiting forever on an unresponsive service fails rather than hanging; where the platform lets you set a request timeout, set it, and prefer a fast failure with a retry over an indefinite wait.

## Write the failure contract down

Everything above is a set of decisions, and a decision that lives only in the configuration is a decision nobody can review. The artefact that fixes this is a **failure contract**: one table, one row per step, stating what that step does when it fails.

```text
STEP                  FAILS WHEN            RETRY   ON FINAL FAILURE      IDEMPOTENT BY
Trigger: watch rows   source unreachable    n/a     platform alerts       n/a
Find record           API 5xx / timeout     3, exp  dead-letter + notify  read-only
Create record         422 validation        no      dead-letter + notify  Source Row Id
AI classify           429, timeout          3, exp  route to human review re-runnable
Parse JSON            malformed output      no      dead-letter + notify  pure function
Update record         409 conflict          1       dead-letter + notify  keyed update
Chat notification     channel gone (404)    no      log only, continue    processed-events
```

Four things become visible the moment you fill this in, and none of them are visible on the canvas.

**Steps with no idempotency guarantee stand out** as blank cells in the last column. Each one is a step that cannot be retried safely, which means either you add a key or you accept that failures there need a human.

**Inconsistent retry policy stands out.** Three steps calling the same API with three different attempt counts is a sign that each was configured in the moment rather than designed.

**The "log only, continue" rows are a deliberate risk you have now named.** The notification above is allowed to fail without stopping the run, because a record written and nobody told is better than a record not written. That is a defensible choice; leaving it implicit is not, because the next person will assume the opposite.

**The gap between the contract and the configuration is testable.** Reading the table next to the actual settings finds the step where the retry count says three and the configuration says one, which is otherwise discovered during an incident.

Keep this table beside the workflow — in a record, in the workflow's own description field, wherever your team will find it — and update it in the same edit that changes the behaviour. It is the single most useful page to hand to whoever inherits the build, and it is what turns "it handles errors" into a claim someone can check.

## Testing failure deliberately

You cannot claim an error path works until you have watched it work. Manufacture each failure class on purpose:

**Bad input** — feed a record with the required field empty, a date in the wrong format, and a text value where a number is expected. **Authentication failure** — temporarily revoke or corrupt a connection and run it. **Rate limiting** — fire the workflow in a tight burst until the destination returns `429`. **Downstream outage** — point an HTTP step at a URL that does not resolve, or at a service that returns `503`. **Duplicate event** — replay the same run twice and confirm one record, one message. **Oversized batch** — hand the loop 200 items when it expects 5.

For each, record three things: what the run history shows, what ended up in the destination, and what a human was told. If the answer to the third is "nothing," you have found the defect. That six-case matrix, filled in, *is* the reliability evidence for a no-code build, and lesson 15 will build a full test plan around it.

## Practice

Use the automation and base you built in lessons 03 through 06.

1. **Write the truth table first.** For a router that treats requests differently by client tier and urgency, produce the full table of input combinations including the empty and unknown cases, and assign an outcome to every row. Then build it, and show that every row of your table is reachable.

2. **Add an early filter and measure it.** Move the "only process new priority requests" condition into a database view so the trigger never fires for the rest. Record the operations or tasks consumed per event before and after, and state the monthly saving at 1,000 events.

3. **Make one mutating step idempotent, three ways.** Convert your record creation to find-or-create on a stable key. Then implement a processed-events table for the *notification* step, which has no key. Replay the same run three times and show exactly one record and one message.

4. **Configure retries with a defence.** Set max attempts, backoff, and the retryable status list on one step. Then force a `429` and a `400` and show from the run history that the first retried and the second did not. Write two sentences explaining why retrying the `400` would be wrong.

5. **Build the dead-letter path.** Add an `Exceptions` table with the fields in this lesson's JSON example. Route every unresolvable failure into it and notify a channel. Then break three different steps in three different ways and show three exception rows with accurate `failed_step` and `error_message` values.

6. **Run the six-case failure matrix.** Manufacture bad input, an auth failure, a rate limit, a downstream outage, a duplicate event, and an oversized batch. Produce a table with one row per case and three columns: what the run history showed, what the destination contains afterward, and what a human was told. Fix every row where the third column is empty.

7. **Handle the partial batch.** Give your loop 10 items where item 4 fails. Implement "continue and collect" with a per-item status recorded in the database, a cap of 50, and a summary message stating processed, failed, and skipped counts. Then argue in three sentences whether this workflow should instead stop on first failure.
