---
course_id: node101
project_id: node101-x01
title: "Event RSVP API"
kind: supplementary-project
status: draft
hours_estimate: 6
difficulty: core
related_lessons:
  - node101-04
  - node101-07
  - node101-08
objectives:
  - Route requests to handlers using paths, parameters, and methods
  - Build a JSON API that other clients can consume
  - Handle and log errors so failures are diagnosable
competency_ids:
  - D2-S1-C04
  - D5-S1-C02
  - D4-S1-C05
---

## Scenario
The partner site that embeds the events board's listings has a new request. Organizers keep getting more people than they have room for at the Saturday Repair Cafe. They want visitors to RSVP from the partner site, and they want the board to refuse new RSVPs once an event is full. The partner's developer will write code against your API and ship it, so the contract has to be predictable. Every success and every failure needs the right status code and a consistent body, and when something goes wrong, their support desk needs a request id to quote back to you.

You will add an **RSVP sub-resource** under each event in the JSON API you built in lesson 07. There is still no database. RSVPs live in memory on each event object and reset when the process restarts, just like the events themselves.

## What you will build / produce
Three endpoints, nested under the versioned API from lesson 07:

| Method and path | Success | Failure statuses |
|---|---|---|
| `GET /api/v1/events/:id/rsvps` | `200` with `{ data: [...], meta: { total, capacity, remaining } }` | `404` unknown event |
| `POST /api/v1/events/:id/rsvps` | `201` with a `Location` header and `{ data: rsvp }` | `400` missing or blank `name`, `400` malformed JSON, `404` unknown event, `409` event full |
| `DELETE /api/v1/events/:id/rsvps/:rsvpId` | `204`, empty body | `404` unknown event or RSVP |

`409 Conflict` is new to this course. It means "your request was well-formed, but it conflicts with the current state of the resource." An event that is already full is the textbook case. Asking again will fail again until someone cancels, which is different from a `400`, where the request itself is wrong.

An RSVP looks like this on the wire:

```json
{ "id": "r-1", "name": "Dana Okafor", "createdAt": "2026-08-01T15:04:05.000Z" }
```

Every error, from any endpoint, uses lesson 07's error shape plus the request id from lesson 08:

```json
{ "error": { "code": "event_full", "message": "This event is full.", "requestId": "7c1f0a52-..." } }
```

You will also produce:

- An `API.md` section documenting the three endpoints, written **before** the code.
- A passing automated test suite (below).
- A short `NOTES.md` with a `curl -i` transcript of a full RSVP lifecycle.

## Before you start (prerequisites, starter files or data)
- Your events board at the end of lesson 08: a JSON API under `/api/v1/events`, `express.json()` in the pipeline, a request-id middleware, a not-found middleware, and a four-argument error handler.
- Events in the lesson 07 shape, with string ids and a `capacity` that is either an integer or `null` (no limit).
- **One structural change: split the app from the server.** Tests need to import your application without opening a port. Move everything except `app.listen` into `src/app.js`, which exports a function that builds the app:

  ```js
  // src/app.js
  import express from "express";
  // ...your middleware and router imports

  export function createApp({ events }) {
    const app = express();
    // ...every app.use / app.get you already have, in the same order
    return app;
  }
  ```

  ```js
  // src/server.js
  import process from "node:process";
  import { createApp } from "./app.js";
  import { events } from "./data/events.js";

  const PORT = Number(process.env.PORT) || 3000;
  createApp({ events }).listen(PORT, () => {
    console.log(`events-board listening on http://localhost:${PORT}`);
  });
  ```

  Passing `events` in, rather than importing it inside `app.js`, lets every test build an app with a fresh, known fixture.

- Install the test client as a dev dependency. `node:test` and `node:assert` ship with Node, so nothing else is needed:

  ```bash
  npm install --save-dev supertest
  ```

  Then add `"test": "node --test"` to `scripts` in `package.json`.

## Milestones
1. **Design first.** Add the three endpoints to `API.md`: method, path, request body, response body, and every status code each can return. Include the RSVP object and one sentence explaining when you return `409` rather than `400`.
2. **Split app and server** as shown above. Confirm `npm start` still works and every lesson 07 endpoint still answers.
3. **Mount a nested router.** Create `src/routes/rsvps.js` exporting a function that takes `events` and returns `express.Router({ mergeParams: true })`. Mount it at `/api/v1/events/:id/rsvps`. Without `mergeParams`, `req.params.id` is `undefined` inside the router (lesson 04, "Splitting the app into a Router").
4. **Resolve the event once.** Write a `router.use` middleware at the top of the RSVP router that finds the event by `req.params.id`, forwards a `404` error with `next(err)` if it does not exist, sets `event.rsvps ??= []`, and attaches the event as `req.event`. Every handler below it can now assume the event exists. That's the precondition/postcondition habit from lesson 05.
5. **List.** `GET /` returns the RSVPs plus `meta.total`, `meta.capacity`, and `meta.remaining` (`null` when `capacity` is `null`).
6. **Create.** `POST /` checks that `name` is a non-empty string and returns `409` when the event is full. It builds the stored object field by field (never push `req.body`), trims the name, and responds `201` with `Location: /api/v1/events/<id>/rsvps/<rsvpId>`. Hint: `req.baseUrl` inside the router already holds `/api/v1/events/<id>/rsvps`.
7. **Cancel.** `DELETE /:rsvpId` responds `204` with `res.status(204).end()`, or `404`.
8. **Route every failure through the error handler.** Handlers call `next(err)` with `err.status` and `err.code` set, and never write error bodies themselves. Check that a malformed JSON body produces a `400` in your error shape. `express.json()` already sets `status = 400` on its parse errors, so your handler's `err.status ?? 500` should do the right thing. Confirm it.
9. **Run the test suite** and make it pass.
10. **Record a lifecycle transcript** in `NOTES.md` with `curl -i`: list (empty), create, create until full, the `409`, delete one, create again, delete the same id twice.

## Acceptance criteria
- [ ] `API.md` documents all three endpoints and the RSVP object, and was committed before the route code (check the commit order).
- [ ] `src/app.js` exports `createApp({ events })`, and `src/server.js` is the only file that calls `listen`.
- [ ] The RSVP router is mounted at `/api/v1/events/:id/rsvps` with `mergeParams: true`.
- [ ] Every status in the table above is produced exactly as listed. No endpoint returns `500` for a client mistake.
- [ ] The stored RSVP contains only `id`, `name`, and `createdAt`. Extra request fields are dropped.
- [ ] Every error body uses `{ error: { code, message, requestId } }`, and `requestId` matches the `x-request-id` response header.
- [ ] No error body contains a stack trace or a file path.
- [ ] `npm test` passes.

## Automated checks (coding courses) / Evidence checklist (non-coding)
Save this as `test/rsvps.test.js`. It uses only `node:test`, `node:assert`, and `supertest`. It was verified passing against both Express 5.2.1 and Express 4. Your error `code` strings must match the ones in the table (`invalid_request`, `not_found`, `event_full`), or you should change the assertions to match the codes you documented in `API.md`.

```js
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "../src/app.js";

let app;

beforeEach(() => {
  // A fresh copy of the fixture for every test, so tests cannot leak state into each other.
  app = createApp({
    events: [
      { id: "e-101", title: "Neighborhood Cleanup", location: "Rosa Parks Park", startsAt: "2026-08-02T14:00:00.000Z", capacity: 2 },
      { id: "e-102", title: "Intro to Soldering", location: "Maker Space", startsAt: "2026-08-09T17:00:00.000Z", capacity: null },
    ],
  });
});

test("GET lists RSVPs for an event with a meta block", async () => {
  const res = await request(app).get("/api/v1/events/e-101/rsvps");
  assert.equal(res.status, 200);
  assert.match(res.headers["content-type"], /application\/json/);
  assert.deepEqual(res.body.data, []);
  assert.deepEqual(res.body.meta, { total: 0, capacity: 2, remaining: 2 });
});

test("POST creates an RSVP: 201, Location header, created object in body", async () => {
  const res = await request(app).post("/api/v1/events/e-101/rsvps").send({ name: "  Dana  " });
  assert.equal(res.status, 201);
  assert.equal(res.body.data.name, "Dana", "name should be trimmed");
  assert.equal(typeof res.body.data.id, "string");
  assert.equal(res.headers.location, `/api/v1/events/e-101/rsvps/${res.body.data.id}`);

  const list = await request(app).get("/api/v1/events/e-101/rsvps");
  assert.equal(list.body.meta.total, 1);
});

test("POST ignores fields the client should not control", async () => {
  const res = await request(app)
    .post("/api/v1/events/e-101/rsvps")
    .send({ name: "Sam", id: "r-999", admin: true });
  assert.equal(res.status, 201);
  assert.notEqual(res.body.data.id, "r-999");
  assert.equal(res.body.data.admin, undefined);
});

test("POST without a name is a 400 that names the field", async () => {
  const res = await request(app).post("/api/v1/events/e-101/rsvps").send({});
  assert.equal(res.status, 400);
  assert.equal(res.body.error.code, "invalid_request");
  assert.match(res.body.error.message, /name/);
});

test("malformed JSON is a 400 in the standard error shape, not a 500", async () => {
  const res = await request(app)
    .post("/api/v1/events/e-101/rsvps")
    .set("Content-Type", "application/json")
    .send('{"name": "Sam"'); // missing closing brace
  assert.equal(res.status, 400);
  assert.ok(res.body.error, "body should use the { error: {...} } shape");
  assert.doesNotMatch(JSON.stringify(res.body), /node_modules|at .*\.js/);
});

test("a full event answers 409 and does not add the RSVP", async () => {
  await request(app).post("/api/v1/events/e-101/rsvps").send({ name: "A" });
  await request(app).post("/api/v1/events/e-101/rsvps").send({ name: "B" });
  const res = await request(app).post("/api/v1/events/e-101/rsvps").send({ name: "C" });
  assert.equal(res.status, 409);
  const list = await request(app).get("/api/v1/events/e-101/rsvps");
  assert.equal(list.body.meta.total, 2);
  assert.equal(list.body.meta.remaining, 0);
});

test("an event with capacity null never fills up", async () => {
  for (const name of ["A", "B", "C"]) {
    const res = await request(app).post("/api/v1/events/e-102/rsvps").send({ name });
    assert.equal(res.status, 201);
  }
});

test("unknown event is a 404, not a 500", async () => {
  const res = await request(app).get("/api/v1/events/e-999/rsvps");
  assert.equal(res.status, 404);
  assert.equal(res.body.error.code, "not_found");
});

test("DELETE removes an RSVP with 204 and an empty body; a second DELETE is 404", async () => {
  const created = await request(app).post("/api/v1/events/e-101/rsvps").send({ name: "Dana" });
  const path = created.headers.location;

  const first = await request(app).delete(path);
  assert.equal(first.status, 204);
  assert.equal(first.text, "");

  const second = await request(app).delete(path);
  assert.equal(second.status, 404);
});

test("every error carries the request id that was sent in", async () => {
  const res = await request(app)
    .get("/api/v1/events/e-999/rsvps")
    .set("X-Request-Id", "test-req-123");
  assert.equal(res.headers["x-request-id"], "test-req-123");
  assert.equal(res.body.error.requestId, "test-req-123");
});

test("unknown API paths get the JSON 404 shape, for every method", async () => {
  const res = await request(app).patch("/api/v1/nope");
  assert.equal(res.status, 404);
  assert.match(res.headers["content-type"], /application\/json/);
  assert.ok(res.body.error);
});
```

Run it from the project root:

```bash
npm test
# or, without the script:
node --test
```

`node --test` with no arguments finds files matching `**/*.test.js` (among other patterns) and runs them. Expect `ℹ pass 11` and `ℹ fail 0` at the bottom of the output.

If your error handler renders HTML for some paths (lesson 08 splits on `req.path.startsWith("/api/")`), the last test confirms that API paths always get JSON, even for methods you never registered.

## Rubric
| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Contract design (`API.md`) | Endpoints listed, but statuses or shapes are missing or don't match the code | Every endpoint, body, and status is documented and matches the code; written before the code | Also documents idempotency of DELETE and what a retry after a timeout does for each endpoint |
| Routing | Nested routes work, but the event lookup is repeated in each handler | `mergeParams` router with a single event-resolving middleware | Also returns `405` with an `Allow` header for unsupported methods on the RSVP paths |
| Status codes | Some client errors return `500` or `200` | All statuses match the table; `400` vs `404` vs `409` are justified in `API.md` | Edge cases covered: blank-after-trim name, capacity `0`, deleting from an event that was itself deleted |
| Error handling and logging | Errors are written inline in handlers | All failures go through `next(err)` to one handler; no stack traces leak | 5xx errors are logged as structured JSON with `requestId` and stack; 4xx at `info` |
| Tests | Suite runs with failures | All 11 tests pass | Learner adds at least two meaningful tests of their own (for example, capacity `0`, or `Location` following) |

## Stretch goals
- Add `GET /api/v1/events/:id/rsvps/:rsvpId` and make the `Location` header from `POST` resolve to it.
- Add `meta.remaining` to the lesson 07 event list response, so the partner site can show "3 spots left" without a second request. Then decide whether that is a safe change to `v1` (lesson 07, "Versioning the surface").
- Reject a second RSVP with the same name (case-insensitive) for the same event with `409` and code `duplicate_rsvp`.

## Reflection prompts
- Why does the full-event case deserve `409` rather than `400`? What would a client do differently with each?
- `DELETE` is idempotent, but your second `DELETE` returns `404`, not `204`. Is that a contradiction? (The system's *state* is the same after one or two calls. Idempotency is about state, not about identical responses.)
- Where did `mergeParams` matter, and how would you have diagnosed its absence from the logs alone?
- What happens to every RSVP when the host restarts your process? Who would you need to tell before this feature goes live?

## Instructor notes (common pitfalls, how to adapt for time)
- **Most common bug:** forgetting `mergeParams: true`. Every request 404s because `req.params.id` is `undefined`. Ask learners to log `req.params` inside the router before you give them the answer.
- **String vs number ids:** if a learner kept numeric ids from lessons 02–04, the fixture in the test file will not match their lookup. Either have them convert to the lesson 07 string ids, or have them compare with `String(e.id) === req.params.id`.
- **Error handler renders HTML for API errors:** learners who check `req.path.startsWith("/api/")` inside a mounted router see the stripped path. The check must run in the app-level error handler (where `req.path` is the full path), or use `req.originalUrl`.
- **Fixture mutation:** the reference solution stores RSVPs on the event object. Tests pass because `beforeEach` builds a new array. Learners who keep a module-level RSVP store will see tests leak into each other, which is a good teaching moment about module scope (lesson 02).
- **Shorter version (3 hours):** drop `DELETE` and the `409`, keep list + create + the error-shape tests (remove the corresponding test cases).
- **Longer version:** add the stretch goals plus a `PUT` that replaces an RSVP's name, with its own tests.
- A reference solution (about 90 lines across `src/app.js` and `src/routes/rsvps.js`) was used to verify the test suite on Express 5.2.1 and 4.x. It is not included here, so learners can't copy it.
