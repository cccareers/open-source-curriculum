---
course_id: ai102
project_id: ai102-x01
title: "Signed Booking Webhook: Verify, Deduplicate, Shape"
kind: supplementary-project
status: draft
hours_estimate: 5
difficulty: core
related_lessons:
  - ai102-10
  - ai102-11
  - ai102-07
objectives:
  - Receive and send events with webhooks, including verifying and shaping an inbound payload
  - Configure and manage credentials for connected tools without exposing secrets
  - Add branching, filters, retries, and explicit error paths so an automation behaves predictably when a step fails
competency_ids:
  - D2-S1-C03
  - D2-S1-C02
---

## Scenario

Northgate's booking system (the same one you called in lesson 09) can now push events instead of being polled. Ops wants every `booking.created` event to land in the Requests base within seconds, keyed on `external_ref` (the `Source Row Id` you have carried since lesson 03). The booking system signs each delivery with HMAC-SHA256 and retries on anything that is not a 2xx, so the same event can arrive twice, and a forged or replayed event must never create a record.

You will build the receiving scenario in Make or Zapier, then prove its behaviour with a small test harness that sends genuine, duplicate, forged, stale, and malformed events. The harness also contains a **reference receiver**, a local mock that behaves the way your scenario should. It runs offline, so you and your instructor can see the expected behaviour before touching a platform.

## What you will build / produce

1. A catch-hook scenario that: captures the raw body; verifies the signature (or, if your platform cannot compute HMAC without a code step, a shared-secret header plus the callback-fetch pattern from lesson 10, with that decision written down); deduplicates on the event `id` via a `ProcessedEvents` table; shapes the payload into the flat object from lesson 10; writes it to a `Bookings` table; and dead-letters anything unknown or malformed into the `Exceptions` table from lesson 07.
2. The webhook secret stored in the platform's credential/keychain mechanism, plus a row in your connection register (lesson 11).
3. An evidence folder (see Evidence checklist) and a passing local test run.

## Before you start (prerequisites, starter files or data)

- Lessons 07, 09, 10, 11 completed; the Requests base from lesson 05 with `Exceptions` and `ProcessedEvents` tables.
- Node.js 20 or later (for `node:test` and built-in `fetch`). No npm packages are needed.
- Create this folder layout and paste in the files below:

```text
ai102-x01/
├── fixtures/booking-created.json
├── harness/sign.mjs
├── harness/shape.mjs
├── harness/mock-receiver.mjs
├── harness/send-events.mjs
├── harness/receiver.test.mjs
└── evidence/            (you fill this)
```

**fixtures/booking-created.json** (the lesson 10 payload, on one line so the signed bytes are unambiguous)

```json
{"id":"evt_01HZ8P2K4M","type":"booking.created","created_at":"2026-03-04T09:12:00Z","data":{"booking":{"id":8841,"status":"pending","external_ref":"row-10453","customer":{"id":553,"name":"Dana Okafor","email":"dana@northgate.example"},"items":[{"sku":"COPY-80","qty":3},{"sku":"RUSH","qty":1}]}}}
```

**harness/sign.mjs**

```js
// sign.mjs — produce and check a timestamped HMAC-SHA256 signature.
// Signed string: `${timestamp}.${rawBody}` (Stripe-style). Header: `t=<ts>,v1=<hex>`.
import { createHmac, timingSafeEqual } from 'node:crypto';

export function sign(secret, timestamp, rawBody) {
  const hex = createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex');
  return `t=${timestamp},v1=${hex}`;
}

export function verify(secret, header, rawBody, nowSeconds, toleranceSeconds = 300) {
  const parts = Object.fromEntries(String(header || '').split(',').map((p) => p.split('=')));
  const t = Number(parts.t);
  if (!t || !parts.v1) return { ok: false, reason: 'missing_signature' };
  if (Math.abs(nowSeconds - t) > toleranceSeconds) return { ok: false, reason: 'stale_timestamp' };
  const expected = Buffer.from(sign(secret, t, rawBody).split('v1=')[1], 'hex');
  const given = Buffer.from(parts.v1, 'hex');
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    return { ok: false, reason: 'bad_signature' };
  }
  return { ok: true };
}
```

**harness/shape.mjs**

```js
// shape.mjs — the reference shaping step from lesson 10, as a pure function.
export function shape(evt, receivedAt) {
  const b = evt?.data?.booking;
  if (!b || typeof evt.id !== 'string' || !evt.type) return null;
  const items = Array.isArray(b.items) ? b.items : [];
  return {
    event_id: evt.id,
    event_type: evt.type,
    booking_id: b.id,
    external_ref: b.external_ref ?? 'none',
    customer_email: b.customer?.email ?? 'unknown',
    customer_name: b.customer?.name ?? 'unknown',
    item_count: items.length,
    is_rush: items.some((i) => i.sku === 'RUSH'),
    received_at: receivedAt,
  };
}
```

**harness/mock-receiver.mjs**

```js
// mock-receiver.mjs — reference behaviour for the no-code scenario, runnable offline.
// POST /hooks/booking  -> verify, dedupe, shape (or dead-letter), ack fast.
// GET  /_state         -> what a ProcessedEvents / Exceptions / Bookings table would hold.
import { createServer } from 'node:http';
import { verify } from './sign.mjs';
import { shape } from './shape.mjs';

const KNOWN_TYPES = new Set(['booking.created', 'booking.updated', 'booking.cancelled']);
const MAX_ITEMS = 50;

export function startReceiver({ secret, port = 0, now = () => Math.floor(Date.now() / 1000) }) {
  const state = { processed: [], exceptions: [], bookings: [], rejected: [] };
  const server = createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/_state') {
      res.writeHead(200, { 'content-type': 'application/json' });
      return res.end(JSON.stringify(state));
    }
    if (req.method !== 'POST' || req.url !== '/hooks/booking') { res.writeHead(404); return res.end(); }
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      const send = (code, body) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(body)); };
      // 1. Verify against the RAW body, before any parsing.
      const v = verify(secret, req.headers['x-signature'], raw, now());
      if (!v.ok) { state.rejected.push(v.reason); return send(401, { error: v.reason }); }
      let evt;
      try { evt = JSON.parse(raw); } catch {
        state.exceptions.push({ reason: 'unparseable_json', raw }); return send(200, { received: true });
      }
      // 2. Deduplicate on the sender's event id.
      if (state.processed.includes(evt.id)) return send(200, { received: true, duplicate: true });
      // 3. Shape, or dead-letter anything that does not fit. Ack 200 either way: re-sending will not help.
      const shaped = shape(evt, new Date(now() * 1000).toISOString());
      const items = evt?.data?.booking?.items;
      let reason = null;
      if (!KNOWN_TYPES.has(evt.type)) reason = 'unknown_type';
      else if (!shaped) reason = 'missing_data';
      else if (Array.isArray(items) && items.length > MAX_ITEMS) reason = 'oversized_items';
      if (reason) state.exceptions.push({ reason, event_id: evt.id ?? null, raw });
      else state.bookings.push(shaped);
      if (evt.id) state.processed.push(evt.id);
      send(200, { received: true });
    });
  });
  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve({ server, port: server.address().port })));
}
```

**harness/send-events.mjs**

```js
// send-events.mjs — fire the six test events at any URL (the mock, or your real catch hook).
// Usage: WEBHOOK_SECRET=... node harness/send-events.mjs https://hook.example/...
import { readFileSync } from 'node:fs';
import { sign } from './sign.mjs';

export function buildCases(secret, nowSeconds) {
  const base = readFileSync(new URL('../fixtures/booking-created.json', import.meta.url), 'utf8');
  const unknown = base.replace('booking.created', 'booking.teleported').replace('evt_01HZ8P2K4M', 'evt_unknown_type');
  const noData = JSON.stringify({ id: 'evt_missing_data', type: 'booking.created', created_at: '2026-03-04T09:12:00Z' });
  const signed = (body, ts = nowSeconds) => ({ 'content-type': 'application/json', 'x-signature': sign(secret, ts, body) });
  return [
    { name: 'genuine',   body: base,    headers: signed(base) },
    { name: 'duplicate', body: base,    headers: signed(base) },
    { name: 'forged',    body: base.replace('Dana Okafor', 'Mallory'), headers: signed(base) },
    { name: 'stale',     body: base,    headers: signed(base, nowSeconds - 3600) },
    { name: 'unknown',   body: unknown, headers: signed(unknown) },
    { name: 'no-data',   body: noData,  headers: signed(noData) },
  ];
}

export async function fire(url, cases) {
  const out = [];
  for (const c of cases) {
    const r = await fetch(url, { method: 'POST', headers: c.headers, body: c.body });
    out.push({ name: c.name, status: r.status, body: await r.text() });
  }
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const url = process.argv[2];
  const secret = process.env.WEBHOOK_SECRET;
  if (!url || !secret) { console.error('usage: WEBHOOK_SECRET=... node harness/send-events.mjs <url>'); process.exit(2); }
  for (const r of await fire(url, buildCases(secret, Math.floor(Date.now() / 1000)))) console.log(r.name.padEnd(10), r.status, r.body);
}
```

**harness/receiver.test.mjs**

```js
// receiver.test.mjs — run with: node --test harness/
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { startReceiver } from './mock-receiver.mjs';
import { buildCases, fire } from './send-events.mjs';
import { sign, verify } from './sign.mjs';
import { shape } from './shape.mjs';

const SECRET = 'test-secret-not-for-production';
const NOW = 1772615520; // fixed clock: 2026-03-04T09:12:00Z
let srv, results, state;

before(async () => {
  srv = await startReceiver({ secret: SECRET, now: () => NOW });
  const url = `http://127.0.0.1:${srv.port}`;
  results = Object.fromEntries((await fire(`${url}/hooks/booking`, buildCases(SECRET, NOW))).map((r) => [r.name, r]));
  state = await (await fetch(`${url}/_state`)).json();
});
after(() => srv.server.close());

test('signature round-trips and rejects a one-character change', () => {
  const body = '{"a":1}';
  assert.equal(verify(SECRET, sign(SECRET, NOW, body), body, NOW).ok, true);
  assert.equal(verify(SECRET, sign(SECRET, NOW, body), '{"a":2}', NOW).reason, 'bad_signature');
  assert.match(sign(SECRET, NOW, body), /^t=\d+,v1=[0-9a-f]{64}$/);
});
test('genuine event is acknowledged with 200', () => assert.equal(results.genuine.status, 200));
test('forged body is rejected 401 and never processed', () => {
  assert.equal(results.forged.status, 401);
  assert.ok(!state.bookings.some((b) => b.customer_name === 'Mallory'));
});
test('stale timestamp is rejected 401', () => assert.equal(results.stale.status, 401));
test('duplicate delivery produces exactly one booking', () => {
  assert.equal(JSON.parse(results.duplicate.body).duplicate, true);
  assert.equal(state.bookings.filter((b) => b.event_id === 'evt_01HZ8P2K4M').length, 1);
});
test('unknown type and missing data are dead-lettered, not written', () => {
  assert.deepEqual(state.exceptions.map((e) => e.reason).sort(), ['missing_data', 'unknown_type']);
  assert.equal(state.bookings.length, 1);
});
test('shaped object matches the flat contract', () => {
  assert.deepEqual(state.bookings[0], {
    event_id: 'evt_01HZ8P2K4M', event_type: 'booking.created', booking_id: 8841, external_ref: 'row-10453',
    customer_email: 'dana@northgate.example', customer_name: 'Dana Okafor', item_count: 2, is_rush: true,
    received_at: '2026-03-04T09:12:00.000Z',
  });
});
test('shaping defaults optional fields instead of leaving blanks', () => {
  const s = shape({ id: 'e1', type: 'booking.created', data: { booking: { id: 1 } } }, 'x');
  assert.equal(s.customer_email, 'unknown');
  assert.equal(s.item_count, 0);
  assert.equal(s.is_rush, false);
});
test('YOUR shaped output (evidence/shaped-full.json) has the same keys and values', { skip: !existsSync('evidence/shaped-full.json') }, () => {
  const mine = JSON.parse(readFileSync('evidence/shaped-full.json', 'utf8'));
  const ref = state.bookings[0];
  for (const k of Object.keys(ref).filter((k) => k !== 'received_at')) assert.deepEqual(mine[k], ref[k], `field ${k}`);
});
```

Run the reference suite first. All tests except the last should pass, and the last is skipped until you add your own evidence:

```bash
node --test harness/receiver.test.mjs
```

## Milestones

1. **Read the reference behaviour.** Run the suite, then read `mock-receiver.mjs` top to bottom. Write three sentences: why verification happens on the raw body before parsing, why a duplicate still gets a `200`, and why an unknown event type gets a `200` but goes to `Exceptions`.
2. **Capture first.** Create the catch hook, enable whatever option your platform offers to keep the raw body and headers, and make the first action write raw body + headers + receipt time into a `RawEvents` table (lesson 10, "Your own capture-first step").
3. **Store the secret properly.** Generate a random secret (for example `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`), store it in the platform's credential mechanism, never in a step field, record name, or description, and add the connection-register row.
4. **Verify.** Implement HMAC-SHA256 over `timestamp + "." + rawBody` and compare with the `v1` value, rejecting anything older than 300 seconds. If your platform cannot do this without application code, implement the shared-secret header **and** the callback-fetch (re-`GET` the booking by id from the lesson 09 API) and record the weaker guarantee in your design notes.
5. **Deduplicate.** Find in `ProcessedEvents` by `id`; stop if found; create the `ProcessedEvents` row at the end of a successful run.
6. **Shape and write.** Produce the flat object (`event_id`, `event_type`, `booking_id`, `external_ref`, `customer_email`, `customer_name`, `item_count`, `is_rush`, `received_at`) with defaults for missing optional fields, and find-or-create the `Bookings` row on `external_ref`.
7. **Dead-letter.** Unknown `type`, missing `data`, or more than 50 items go to `Exceptions` with the raw body attached, and nothing is written to `Bookings`.
8. **Fire the real cases.** Run `WEBHOOK_SECRET=<your secret> node harness/send-events.mjs <your catch URL>`. Your platform will probably return `200` for everything, because it acknowledges on capture. That is expected, so your proof is in the tables and run history, not the status codes.
9. **Close the loop locally.** Copy the shaped output of your scenario's shaping step for the genuine event into `evidence/shaped-full.json` and re-run the suite; the last test now compares your output with the reference.

## Acceptance criteria

- [ ] `node --test harness/receiver.test.mjs` passes all tests, including the comparison against `evidence/shaped-full.json`.
- [ ] After milestone 8, `Bookings` contains exactly one row for `evt_01HZ8P2K4M`, and none with customer name `Mallory`.
- [ ] `ProcessedEvents` contains `evt_01HZ8P2K4M` once.
- [ ] `Exceptions` contains rows for `evt_unknown_type` and `evt_missing_data`, each with the raw body.
- [ ] The forged and stale deliveries are visible in run history as stopped at the verification filter (or, for shared-secret builds, the forged one is caught by the callback-fetch mismatch).
- [ ] The secret does not appear in any exported blueprint or Zap definition, record, name, URL, or screenshot.
- [ ] `is_rush` and `item_count` are a boolean and a number in the stored record, not strings.

## Automated checks (coding courses) / Evidence checklist (non-coding)

Automated: `harness/receiver.test.mjs` (reference behaviour plus your shaped output).

Evidence folder:

- `evidence/test-run.txt`: output of the local test run.
- `evidence/send-events.txt`: output of milestone 8 against your real URL.
- `evidence/tables.png`: Bookings, ProcessedEvents, Exceptions after milestone 8.
- `evidence/run-history.png`: the six runs, with the verification stop visible on two.
- `evidence/blueprint-redacted.json`: the exported scenario (or Zap description) showing the secret is referenced, not embedded.
- `evidence/design-notes.md`: the verification method you chose, what it does and does not guarantee, and the remaining race condition in your dedupe step (lesson 10).

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Verification | Shared secret only, not justified | HMAC with timestamp tolerance, or shared secret + callback-fetch with the trade-off written down | Both HMAC and callback-fetch for consequential events; rejected attempts logged with reason |
| Idempotency | Duplicates appear on replay | One booking per event id across four replays | Downstream write also keyed on `external_ref`, closing the race |
| Shaping | Downstream steps map nested paths directly | Flat object with defaults and correct types; local comparison test passes | Shaping isolated in one step/sub-scenario reused by a second webhook |
| Error paths | Malformed events fail the run | Unknown/missing/oversized go to `Exceptions` with raw body, no partial writes | Alert to a channel with a link to the exception row |
| Credentials | Secret visible in a step or export | Secret in credential store, register row complete | Rotation rehearsed with two active secrets and no missed events |

## Stretch goals

- Rotate the secret with zero downtime: accept either of two secrets for a window, switch the sender, then retire the old one (lesson 11's six-step sequence).
- Add a reconciliation sweep: a scheduled scenario that lists bookings created in the last 24 hours from the lesson 09 API and back-fills any missing from `Bookings`.
- Extend `mock-receiver.mjs` with an `ordering` case: `booking.updated` arriving before `booking.created`, and ignore anything older than the stored version.

## Reflection prompts

- Which guarantee would you lose if you verified the *parsed* body instead of the raw one? Show a concrete re-serialisation that breaks the signature.
- Your platform answered `200` to the forged request. Why is that acceptable here, and when would it not be?
- If the booking system stopped sending for six hours, which of your tables would tell you, and how fast?

## Instructor notes (common pitfalls, how to adapt for time)

- **Pitfall: signing the pretty-printed fixture.** The fixture is one line on purpose. If a learner reformats it, the signature they compute will differ from the sender's.
- **Pitfall: verification after parsing.** Platforms that auto-parse JSON may not expose the raw body by default. That is why milestone 2 asks for raw capture first.
- **Pitfall: secret in the filter value.** Typing the secret into a filter's comparison field puts it in the export. Check the blueprint.
- **HMAC availability varies by platform and plan, and labels change.** Do not prescribe a menu path; ask learners to cite the current help page they used. Zapier learners may need the shared-secret + callback route because of the course's no-application-code constraint (see review.md, Open questions).
- **Short on time (2-3 h):** skip milestones 2 and 9 and treat the local suite + design notes as the deliverable. **Long version (8 h):** add both stretch goals.
- The mock receiver is a teaching reference, not production code: it keeps state in memory and has no persistence or concurrency control.
