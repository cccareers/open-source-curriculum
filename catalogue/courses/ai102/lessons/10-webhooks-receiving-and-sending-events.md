---
lesson_id: ai102-10
course_id: ai102
pathway: prompt-engineer
title: 'Webhooks: Receiving and Sending Events'
order: 10
kind: lesson
competency_ids:
  - D2-S1-C03
objectives:
  - Receive and send events with webhooks, including verifying and shaping an inbound payload
---

## Push instead of poll

Every trigger you have used so far except one works by asking. The platform calls the source system on an interval — "anything new?" — and most of the time the answer is no. That is polling, and it has three costs: latency bounded by the interval, quota spent on empty checks, and a hard ceiling on how fresh your data can be.

A **webhook** inverts the relationship. Instead of you asking, the source system calls *you* the moment something happens. It is an ordinary HTTP request — almost always a `POST` with a JSON body — sent to a URL you provide. Latency drops to seconds, empty checks disappear, and events that polling cannot detect at all become available.

The mechanics are the same HTTP from the previous lesson, with the direction reversed. There, you were the client calling somebody's API. Here, you are the server receiving a call. Everything you learned about status codes, content types, and JSON bodies applies; what is new is that you no longer control when the request arrives, what it contains, or who sent it — and each of those is a problem with a specific solution.

![Sequence of a webhook delivery: source system posts an event to the automation platform's catch URL, the platform acknowledges with 200 immediately, then processes the event asynchronously and retries on failure](./img/webhook-handshake.png)

Two structural facts govern everything below. **The sender decides the payload**, so you must inspect what actually arrives rather than trusting the documentation. And **the sender expects a fast acknowledgement**, so the first thing your workflow must do is say "received," not "here is the answer."

## Receiving: the catch hook

Both platforms give you an endpoint in a few clicks.

In the list-shaped platform, add a trigger of type **Webhooks by Zapier — Catch Hook**. It immediately displays a URL:

```text
https://hooks.zapier.com/hooks/catch/2841556/a7f3k9x/
```

In Make, add a **Webhooks — Custom webhook** module, create a webhook, and it gives you the equivalent:

```text
https://hook.eu2.make.com/9k3fj2x8sa0dqp1mvn4t7bwe6r5yzuhc
```

That URL is now live and will accept requests from anybody who knows it. Treat it as a secret in the same way you treat a credential: not in a public repository, not in a screenshot, not in a support ticket.

**Register the URL with the source system.** Most SaaS products have a settings page listing webhook endpoints, where you paste the URL and tick which event types to send. Some let you send a test event; use it.

**Then determine the payload's real shape.** Both platforms wait in a listening state for the first request and show you what arrived. This step is not optional and it is not a formality — the fields you get are the fields your workflow can map, and if you configure the workflow before a real event has been captured, half your mappings will not exist. Send a *representative* event, not the simplest one the test button offers.

A typical inbound payload:

```json
{
  "id": "evt_01HZ8P2K4M",
  "type": "booking.created",
  "created_at": "2026-03-04T09:12:00Z",
  "data": {
    "booking": {
      "id": 8841,
      "status": "pending",
      "external_ref": "row-10453",
      "customer": { "id": 553, "name": "Dana Okafor", "email": "dana@northgate.example" },
      "items": [
        { "sku": "COPY-80", "qty": 3 },
        { "sku": "RUSH", "qty": 1 }
      ]
    }
  }
}
```

Note the nesting. The customer's email is at `data.booking.customer.email`. The platform's mapping panel will show that path once it has seen a real request; before that it shows nothing.

**Watch for repeated-key and array behaviour.** Some senders post `application/x-www-form-urlencoded` rather than JSON, in which case nested structures arrive flattened with bracket notation (`data[booking][id]`) and repeated keys may collapse. If your platform offers a "raw body" option, capturing the raw text as well as the parsed version costs nothing and saves an afternoon when the parse is wrong.

## Answer fast, work later

The sender is waiting on your response, and it is not waiting long — typical timeouts are between 3 and 30 seconds. If your workflow calls a model, writes three records, and posts a message before responding, you will exceed that, the sender will record a delivery failure, and it will send the event again. Now you have duplicate processing caused by slowness rather than by any real error.

The correct pattern is **acknowledge immediately, process asynchronously**.

Both platforms respond automatically as soon as the trigger has captured the request, and continue running the rest of the workflow afterwards. That default is what you want, and the thing to avoid is deliberately overriding it with a "custom response" module placed at the end of a long chain.

There is one case where you *do* want to respond at the end: when the sender expects data back — a validation check, a form that displays your answer, a system asking you to approve something inline. Then the response module goes last and everything before it must be fast. Make provides a **Webhook response** module for this, with a configurable status and body:

```text
Module: Webhook response
  Status:  200
  Headers: Content-Type: application/json
  Body:    {"received": true, "request_ref": "{{2.id}}"}
```

Keep synchronous webhooks to a few seconds of work. If the answer genuinely requires a model call over a long document, respond with an acknowledgement and deliver the result by another route.

The status code you return matters, because it drives the sender's retry behaviour. Return `200` (or `204`) when you have accepted the event. Return a `4xx` only when the event is genuinely unacceptable and re-sending it would be pointless — most senders will stop retrying on a `4xx` and may disable your endpoint after enough of them. Return a `5xx` when you want a retry.

## Verifying that the request is genuine

Your webhook URL is a public endpoint. Anyone who learns it can post anything to it, and your workflow will dutifully create records, call models, and notify people. The URL's obscurity is not security; it appears in browser history, in configuration screens, in support conversations, and in the logs of any proxy between the sender and you.

Three verification approaches, in increasing order of strength.

**A shared secret in a header or the body.** The sender is configured to include a fixed value; your workflow's first filter checks it and stops if it does not match.

```text
Filter: Authorised request
  {{1.headers.`x-webhook-token`}}   Text: Equal to   {{connection.webhook_secret}}
```

Simple, better than nothing, and weak: the secret travels in full on every request, so anyone who ever captures one request has it forever.

**An HMAC signature.** The proper mechanism, and what serious APIs use. The sender computes a hash of the request body using a secret only the two of you know, and puts it in a header:

```text
X-Signature: t=1741079520,v1=5f2b9c1d8e0a4b6f3c7d2e9a1b8c4d6e0f3a7b2c9d1e5f8a
X-Request-Timestamp: 1741079520
```

You recompute the same hash over the body you received and compare. If they match, the body is unmodified and was produced by someone holding the secret.

Doing this in no-code needs a step that can compute an HMAC. Make has a **Crypto** or tools module that computes an HMAC-SHA256 over a string with a key; the list-shaped platform typically needs a small code step or an external utility. Where neither is available, you have three honest options: use a shared-secret header instead and accept the weaker guarantee; restrict by source IP if the sender publishes a stable range; or put a small hosted function in front of the webhook to verify and forward. Choose deliberately and write down which you chose and why.

Two details people get wrong when they do implement it. **Hash the exact raw body**, byte for byte, before any parsing or re-serialising — reordering keys changes the hash. And **check the timestamp**, rejecting anything more than a few minutes old, because a signature with no time bound can be replayed forever by anyone who captured one valid request.

**Verify by calling back.** The strongest and often the simplest pattern: treat the webhook as a *notification that something happened*, not as a source of truth. Take only the event type and the object id from the payload, then use the HTTP step from the previous lesson to `GET` that object from the API with your own credentials. Now the data is authenticated by your own call, and a forged payload can at worst cause you to re-fetch a real record. This costs one extra API call and removes an entire class of trust problem — use it whenever the payload drives anything consequential.

## Duplicates, ordering, and the guarantees you do not have

Webhook delivery is **at-least-once**, not exactly-once. Assume every event may arrive more than once — because the sender timed out waiting for you, because a retry crossed with a slow success, or because someone clicked "resend" in a settings screen.

The fix is the idempotency machinery from lesson 07, keyed on the sender's event id. That `id` field at the top of the payload is there precisely for this. At the top of your workflow, look it up in a processed-events table; if present, stop; if not, continue, and record it when you finish.

```text
Step 1: Catch hook
Step 2: Database > Find record in ProcessedEvents where EventId = {{1.id}}
Step 3: Filter — continue only if step 2 found nothing
Step 4..n: do the work
Step n+1: Database > Create ProcessedEvents record {EventId, Type, ReceivedAt}
```

There is a race in that design — two copies arriving simultaneously can both pass step 3 — which in practice is rare and which you close, where it matters, by making the downstream write itself keyed and idempotent rather than relying on the check alone.

Two further guarantees you do not have. **Order is not guaranteed.** `booking.updated` can arrive before `booking.created`. Where order matters, do not infer state from the sequence of events; use the callback pattern to fetch the object's current state, or compare a version or timestamp on the payload and ignore anything older than what you have already recorded. And **delivery is not guaranteed forever**: senders give up after a number of failed attempts, so a period where your workflow was broken is a period of events you will never receive. Plan a reconciliation sweep — a scheduled workflow that queries the source API for anything created in the last day and fills gaps — for anything you cannot afford to miss.

## Shaping the payload for the rest of the workflow

Raw webhook payloads are shaped for the sender's convenience, not yours. Add a shaping step immediately after verification and before any business logic, producing a flat, predictable object that the rest of the workflow maps from. It makes every downstream step readable and it means a change in the sender's payload shape is one step to fix rather than fifteen mappings.

```json
{
  "event_id": "evt_01HZ8P2K4M",
  "event_type": "booking.created",
  "booking_id": 8841,
  "external_ref": "row-10453",
  "customer_email": "dana@northgate.example",
  "customer_name": "Dana Okafor",
  "item_count": 2,
  "is_rush": true,
  "received_at": "2026-03-04T09:12:04Z"
}
```

Four shaping techniques cover most cases. **Flatten** deep paths into named fields. **Default** anything optional with `ifempty` or its equivalent so a missing key becomes an explicit value rather than a blank that propagates. **Derive** the values you will branch on — `is_rush` computed once here rather than re-evaluated in three filters. And **iterate** arrays with the iterator from lesson 04 when you need one run per element, or aggregate them to a count or a summary string when you do not.

Guard against the payload that does not fit. A `type` you have never seen, a missing `data` object, an array with 500 elements. Send those to the dead-letter path from lesson 07 with the full raw body attached, rather than letting them run through logic designed for a different shape.

## Sending webhooks

The reverse direction is simpler, because you are back to being the client. Sending a webhook is a `POST` from the previous lesson, aimed at somebody else's endpoint. You do it to notify another system, to trigger a second workflow, or to hand work to a service that has no connector.

```text
Method:  POST
URL:     https://hook.eu2.make.com/9k3fj2x8sa0dqp1mvn4t7bwe6r5yzuhc
Headers:
  Content-Type      application/json
  X-Webhook-Token   {{connection.outbound_secret}}
Body:
```

```json
{
  "event_id": "{{uuid}}",
  "type": "draft.approved",
  "occurred_at": "{{now}}",
  "data": {
    "request_ref": "{{2.`Request Ref`}}",
    "draft_id": "{{2.id}}",
    "approved_by": "{{2.`Reviewed By`}}"
  }
}
```

Design your outbound events the way you wish inbound ones were designed. Give every event a **unique id** so the receiver can deduplicate. Give it a **type** string with a stable vocabulary. Include an **occurred_at** timestamp. Keep the payload **small and stable**, carrying identifiers rather than whole objects, so the receiver can fetch what it needs and your payload shape does not change every time you add a database field. And include a **shared secret or signature** so the receiver can verify you.

Then handle the send like any other HTTP call: check the status, retry `5xx` and `429` with backoff, do not retry `4xx`, and dead-letter what you cannot deliver. A webhook you sent and nobody received is indistinguishable from one you never sent unless you logged the attempt.

Chaining workflows this way — one posts to another's catch URL — is a genuinely good pattern. It keeps each workflow small enough to read, lets you reuse a subprocess from several callers, and gives each piece its own run history. The cost is that a failure now spans two run histories, so put the same `event_id` in both and you can follow a single logical operation across the seam.

## Debugging

Four tools, in the order you should reach for them.

**A request inspection service.** A free hosted endpoint that shows you exactly what a sender transmits — headers, raw body, content type. Point the source system at it once, capture a real event, and you have ground truth to compare against what your platform reports.

**The platform's own request log.** Both platforms retain recent inbound requests to a webhook. When a workflow "did not run," the first question is whether the request arrived at all, and this log answers it. A request that never arrived is a sender-side problem — check whether the endpoint is still registered and whether the sender disabled it after failures.

**Replay.** Both platforms let you re-run a stored inbound payload, which is far better than persuading the source system to emit another event. Many senders also have a resend button in their delivery log.

**Your own capture-first step.** For a webhook you are still developing, make the first action write the entire raw payload into a database table. You then have a permanent record of what actually arrived, including the malformed one at 02:00 on a Sunday that you will otherwise never see again.

One more failure mode worth naming because it wastes so much time: **the endpoint the sender has registered is not the one you are editing.** Regenerating a webhook, duplicating a workflow, or moving between a development and production copy all change the URL. When everything looks right and nothing arrives, compare the two URLs character by character before assuming anything more interesting.

## Practice

You need a source system that emits webhooks — a form tool, a payment sandbox, a project tool, or a second workflow of your own acting as the sender.

1. **Receive a real event and record its true shape.** Create a catch hook, register it, send a representative event, and capture it. Write down the full JSON path to four values you will need, the content type actually used, and any difference between the payload and what the sender's documentation claims.

2. **Capture first, always.** Make the first action of your workflow write the raw body, headers, and receipt time into a database table. Send three different event types and show three stored rows.

3. **Shape it.** Add a step that converts the raw payload into the flat object shape from this lesson, with flattening, defaults for two optional fields, and one derived boolean you will branch on. Show the shaped output for a full payload and for one with the optional fields absent.

4. **Verify the sender, and prove it.** Implement the strongest verification your platform supports — HMAC if you can, shared secret otherwise, plus the callback pattern for anything consequential. Then post a forged request to your own endpoint with a wrong or missing secret and show that it is rejected and logged. State plainly which guarantee your chosen method does and does not give you.

5. **Handle duplicates.** Add a processed-events table keyed on the sender's event id. Replay the same event four times and show one record created, one notification sent, and three runs stopped at the filter. Then describe the remaining race condition in two sentences and what would close it.

6. **Test the response contract.** Measure how long your workflow takes to acknowledge. Then build a second webhook that must respond synchronously with a JSON body, keep it under two seconds, and show the sender receiving your response. Deliberately make it slow enough to time out and record what the sender did.

7. **Handle the payload you did not expect.** Send an event with an unknown `type`, one with the `data` object missing, and one with an array of 200 items. Show each landing in the dead-letter path with the raw body attached, and no partial writes to your main tables.

8. **Send a webhook to yourself.** Have workflow A post a well-formed outbound event — unique id, type, timestamp, identifiers only, shared secret header — to workflow B's catch URL. Handle the response, retry a forced `503`, and dead-letter a permanent failure. Then trace one logical operation across both run histories using the shared event id.

9. **Compare poll and push.** Take an existing polling trigger from an earlier lesson and, where the source supports it, replace it with a webhook. Report end-to-end latency before and after, and the monthly operations or tasks consumed by each at your real event volume.
