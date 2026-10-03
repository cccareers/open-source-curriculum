---
course_id: db200
project_id: db200-x01
title: "Capacity Limits and a Fair Waitlist"
kind: supplementary-project
status: draft
hours_estimate: 6
difficulty: core
related_lessons:
  - db200-04
  - db200-05
objectives:
  - "Model data around an application's access patterns"
  - Build an application feature against a document database
competency_ids:
  - D5-S1-C02
  - D2-S1-C04
---

## Scenario

The events board's "Intro to Soldering" sold out in eleven minutes, and then it oversold. The Maker Space holds 40 people and 46 showed up with confirmations, because several RSVPs arrived in the same second and each one saw "1 seat left." Sam Ruiz, the host, wants two things: the database must never confirm more people than the venue holds, and anyone turned away should join a waitlist and be promoted automatically, in order, when someone cancels.

You will extend the `rsvps` repository from lesson 05 to do both, and prove it with tests that fire concurrent requests at a real MongoDB.

## What you will build / produce

- An updated `src/repositories/rsvps.js` exporting `ensureIndexes`, `register(eventId, user)`, and `cancel(eventId, userId)` with the return shapes in the table below.
- Event documents gain `capacity` (number) and `waitlistSeq` (number, starts at 0).
- `test/waitlist.test.js` (provided below) passing.
- A short `DESIGN.md`: the access patterns this feature adds, the fields you added and why, and the one consistency exposure you are accepting.

| Call | Returns |
| --- | --- |
| `register` with a seat free | `{ ok: true, status: "confirmed", attendeeCount }` |
| `register` when full | `{ ok: true, status: "waitlisted", position }` (1, 2, 3 … in arrival order) |
| `register` twice for the same user | `{ ok: false, reason: "already_registered" }` |
| `cancel` a confirmed seat with people waiting | `{ ok: true, promoted: "<userId of earliest waitlisted>" }`, count unchanged |
| `cancel` a confirmed seat, nobody waiting | `{ ok: true, promoted: null }`, count decremented |

## Before you start (prerequisites, starter files or data)

- Your lesson 05 service: `src/db.js` exporting `connect`, `getDb`, `close`, and `src/repositories/rsvps.js`.
- MongoDB running locally (`docker run -d --name mongo -p 27017:27017 mongo:7`). No replica set is needed. This project is solved without transactions, on purpose.
- `"type": "module"` in `package.json`, and Node 20 or later.

## Milestones

1. **Write the access patterns first** (lesson 04 form): register, cancel, "who's next on the waitlist for event X," "is user Y registered for event X." Give each a frequency estimate and say which index serves it.
2. **Make the seat claim atomic.** The bug Sam saw is a read-check-write race. Replace "read the count, compare to capacity, then `$inc`" with a single conditional update whose filter only matches while a seat is free: `findOneAndUpdate({ _id, $expr: { $lt: ["$attendeeCount", "$capacity"] } }, { $inc: { attendeeCount: 1 } })`. If it returns `null`, the event was full.
3. **Keep the duplicate guard in the database.** Keep the unique `{ eventId, userId }` index from lesson 05 and the error 11000 handling.
4. **Number the waitlist fairly.** Use `$inc` on the event's `waitlistSeq` to hand out positions, so two simultaneous arrivals can never get the same number.
5. **Promote on cancel.** Delete the RSVP. If it was confirmed, use `findOneAndUpdate` with `sort: { position: 1 }` to flip the earliest waitlisted RSVP to confirmed in one step. Only decrement `attendeeCount` if nobody was promoted.
6. **Add an index** that serves "earliest waitlisted RSVP for this event" and confirm with `explain("executionStats")` that it's an `IXSCAN`.
7. **Name your exposure** in `DESIGN.md`. `register` still performs more than one write. What can a crash between them leave behind, and how would the lesson 05 reconciliation script need to change?

## Acceptance criteria

- [ ] `npm test` passes all six tests against a fresh database, three runs in a row.
- [ ] 25 concurrent registrations for 2 seats confirm exactly 2 and number the other 23 from 1 to 23 with no gaps or repeats.
- [ ] No read-then-write logic is used to decide whether a seat is free (reviewer checks the code).
- [ ] `DESIGN.md` lists access patterns with indexes, and names the multi-write exposure and a mitigation.
- [ ] The waitlist query is shown to use an index (`IXSCAN` output pasted in `DESIGN.md`).

## Automated checks (coding courses)

Save as `test/waitlist.test.js`. It uses only `node:test` and the `mongodb` driver you already installed. **It drops the database named in `MONGODB_DB`**, so it refuses to run unless that name contains `test`.

```javascript
// test/waitlist.test.js — acceptance tests for db200-x01 (Capacity and Waitlist)
// Needs a running MongoDB. Run: MONGODB_URI=mongodb://localhost:27017 MONGODB_DB=events_board_test node --test
import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { connect, close, getDb } from "../src/db.js";
import { ensureIndexes, register, cancel } from "../src/repositories/rsvps.js";

const EVENT_ID = "evt_test_soldering";
const user = (n) => ({ id: `usr_${n}`, name: `Tester ${n}` });

before(async () => {
  assert.match(process.env.MONGODB_DB ?? "", /test/, "MONGODB_DB must contain 'test' — these tests drop the database");
  await connect();
});
after(async () => { await close(); });

beforeEach(async () => {
  await getDb().dropDatabase();
  await ensureIndexes();
  await getDb().collection("events").insertOne({
    _id: EVENT_ID, title: "Intro to Soldering", slug: "intro-to-soldering",
    capacity: 2, attendeeCount: 0, waitlistSeq: 0,
  });
});

const event = () => getDb().collection("events").findOne({ _id: EVENT_ID });

test("confirms registrations up to capacity", async () => {
  const a = await register(EVENT_ID, user(1));
  const b = await register(EVENT_ID, user(2));
  assert.equal(a.status, "confirmed");
  assert.equal(b.status, "confirmed");
  assert.equal((await event()).attendeeCount, 2);
});

test("never oversells under concurrent registration", async () => {
  // 25 simultaneous requests for 2 seats. A read-then-check-then-write
  // implementation lets several requests see "1 seat left" and oversells.
  const ids = Array.from({ length: 25 }, (_, i) => i + 1);
  const results = await Promise.all(ids.map((n) => register(EVENT_ID, user(n))));
  const confirmed = results.filter((r) => r.status === "confirmed");
  const waitlisted = results.filter((r) => r.status === "waitlisted");
  assert.equal(confirmed.length, 2, "exactly capacity registrations are confirmed");
  assert.equal(waitlisted.length, 23);
  assert.deepEqual(
    waitlisted.map((r) => r.position).sort((a, b) => a - b),
    Array.from({ length: 23 }, (_, i) => i + 1),
    "waitlist positions are unique and gap-free",
  );
  assert.equal((await event()).attendeeCount, 2);
});

test("rejects a duplicate registration without changing the count", async () => {
  await register(EVENT_ID, user(1));
  const again = await register(EVENT_ID, user(1));
  assert.deepEqual(again, { ok: false, reason: "already_registered" });
  assert.equal((await event()).attendeeCount, 1);
});

test("cancelling a confirmed seat promotes the earliest waitlisted user", async () => {
  for (const n of [1, 2, 3, 4]) await register(EVENT_ID, user(n));
  const result = await cancel(EVENT_ID, "usr_1");
  assert.equal(result.promoted, "usr_3");
  const promoted = await getDb().collection("rsvps").findOne({ eventId: EVENT_ID, userId: "usr_3" });
  assert.equal(promoted.status, "confirmed");
  assert.equal((await event()).attendeeCount, 2, "count is unchanged when a seat is handed over");
});

test("cancelling with an empty waitlist frees the seat", async () => {
  await register(EVENT_ID, user(1));
  const result = await cancel(EVENT_ID, "usr_1");
  assert.equal(result.promoted, null);
  assert.equal((await event()).attendeeCount, 0);
});

test("the unique index exists (protection lives in the database, not the code)", async () => {
  const indexes = await getDb().collection("rsvps").indexes();
  const unique = indexes.find((i) => i.unique && i.key.eventId === 1 && i.key.userId === 1);
  assert.ok(unique, "rsvps needs a unique index on { eventId: 1, userId: 1 }");
});
```

Add a script to `package.json` and run it:

```json
"scripts": { "test": "node --test" }
```

```bash
MONGODB_URI=mongodb://localhost:27017 MONGODB_DB=events_board_test npm test
```

`node --test` with no arguments finds files matching `*.test.js` under `test/`. Don't pass a bare directory (`node --test test/`); Node 22 and later treat that as a module path and fail.

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Correctness under concurrency | Concurrency test fails or passes only sometimes | All tests pass three runs in a row | Explains in `DESIGN.md` exactly which interleaving the conditional update prevents |
| Modeling | Fields added without stated access patterns | Access patterns listed, each mapped to an index | Considers embedding the waitlist in the event (subset pattern) and justifies rejecting or adopting it |
| Honesty about exposure | Multi-write risk not mentioned | Exposure named with one mitigation | Reconciliation script extended to repair waitlist positions and counts, and run against seeded bad data |
| Code quality | Database logic in route handlers | Repository functions only; routes stay thin | `409` for duplicates and a `GET /events/:slug/waitlist` route added with tests |

## Stretch goals

- Let hosts raise `capacity` and automatically promote that many waitlisted users.
- Rewrite `register` and `cancel` with a transaction on a single-node replica set (see lesson 05). Compare the code and the failure modes.
- Expire unconfirmed waitlist promotions: a promoted user has 24 hours to accept, enforced with a TTL index or a scheduled job.

## Reflection prompts

- The duplicate guard is an index; the capacity guard is a conditional update. Why can't a unique index enforce "at most 40"?
- Which consistency rung from lesson 03 does a waitlisted user need when they check their position? What would they see on a replica that lags?
- If the events board moved to Postgres tomorrow, how would you enforce capacity there?

## Instructor notes (common pitfalls, how to adapt for time)

- Almost every first attempt reads the event, checks `attendeeCount < capacity` in JavaScript, then increments. The 25-way concurrency test catches this reliably. In a reference run the naive version failed 3 out of 3 times and the conditional update passed 3 out of 3.
- Learners sort waitlist positions with `.sort()` and get `[1, 10, 11, …]`. The test sorts numerically for that reason; point it out.
- If a learner's `findOneAndUpdate` returns `{ value: … }`, they're on driver 5 or earlier. Upgrade to `mongodb@6` or read `.value`.
- Shorter session (3 hours): drop milestones 6 and 7 and the cancel tests.
- Verified against MongoDB 7 and `mongodb` driver 6.x on Node 24.
