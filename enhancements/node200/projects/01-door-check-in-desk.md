---
course_id: node200
project_id: node200-x01
title: "Door Check-in Desk"
kind: supplementary-project
status: draft
hours_estimate: 6
difficulty: core
related_lessons:
  - node200-02
  - node200-04
  - node200-06
  - node200-07
objectives:
  - Separate data access from request handling in a service
  - Validate input and assess the quality risks of a feature
  - Test a service at unit and integration level and report progress
competency_ids:
  - D2-S1-C04
  - D5-S1-C02
  - D4-S1-C01
  - D4-S1-C04
---

## Scenario

The Rosa Parks Park Committee runs the Neighborhood Cleanup on the events board, and last month 40 people registered but only 23 showed up. The organizer wants to check attendees in at the gate from a phone, and wants a count of who actually came. K. Osei in support has passed the request on as a short spec:

```text
CHK-1  An organizer shall be able to check in a confirmed registration for one
       of their own events.
CHK-2  Check-in shall be possible from 2 hours before the event starts until
       6 hours after it starts, and at no other time.
CHK-3  Checking in a registration that is already checked in shall not change
       its original check-in time.
CHK-4  A waitlisted registration shall not be checked in.
CHK-5  An organizer shall be able to see, for their own event, how many
       confirmed registrations there are and how many have checked in.
CHK-6  An organizer shall not be able to check in, or see counts for, an event
       they do not organize.
```

This is a small feature on purpose. What's being assessed is whether it lands cleanly inside the boundaries you drew in lesson 02, with validation at the edge, rules in the service, SQL only in the repository, and a test suite that proves each CHK line.

## What you will build / produce

- A migration adding `checked_in_at timestamptz NULL` to `registrations`.
- Repository functions in `src/repositories/registrations.repository.js`: `findForEvent(eventId, registrationId, trx)`, `markCheckedIn(registrationId, at, trx)`, and `checkInCounts(eventId)`.
- A service `src/services/check-in.service.js` built as `makeCheckInService({ eventsRepo, regsRepo, now })` that exports `checkIn(eventId, registrationId, actorId)` and `counts(eventId, actorId)`.
- Two routes on the organizer router (already behind `requireAuth`):
  - `POST /organizer/events/:eventId/registrations/:registrationId/check-in` → `200 { id, checkedInAt }`
  - `GET /organizer/events/:eventId/check-ins` → `200 { confirmed, checkedIn }`
- A zod schema validating both path parameters as UUIDs.
- A "Check in" button with a `_csrf` hidden field next to each confirmed attendee on the organizer's event page (`GET /organizer/events/:eventId`).
- `docs/requirements/check-in.md` (register plus acceptance criteria), `docs/quality/check-in-risks.md` (at least 5 scored rows), and a test-run report.

**Status-code contract (write it into `docs/design-notes.md`):**

| Situation | Status | `error.code` |
|---|---|---|
| Malformed `eventId` or `registrationId` | 400 | `validation_failed` |
| Not signed in | 401 | `unauthenticated` |
| Signed in, not this event's organizer | 403 | `forbidden` |
| Event exists but the registration is not on it | 404 | `not_found` |
| Registration is waitlisted | 409 | `conflict` |
| Outside the check-in window | 409 | `conflict` |
| Already checked in | 200 | (body shows the *original* `checkedInAt`) |

## Before you start (prerequisites, starter files or data)

- Your events board at the end of lesson 07: layered structure, Knex and Postgres, sessions with CSRF, zod validation, the typed error hierarchy, and a passing `node:test` suite with `test/helpers/db.js`, `test/helpers/auth.js`, and `test/helpers/csrf.js` (`csrfTokenFrom`).
- Add two factories to `test/helpers/db.js` if you don't have them yet: `createAttendee()` (inserts an `accounts` row and returns `{ id, email }`) and `createRegistration({ eventId, attendeeId, status = "confirmed" })` (returns `{ id }`).
- `csrfTokenFrom` needs a page that renders a `_csrf` field. The organizer dashboard (`GET /organizer`) should already have one from its logout form. If it doesn't, add one. The token belongs to the session, not the page, so any form page works.
- Decide and record which table `events.organizer_id` references after lesson 05 (`organizers` or `accounts`). The tests below assume organizers are rows in `accounts`, as in lesson 07's helpers.

## Milestones

1. **Register and plan (45 min).** Turn CHK-1 to CHK-6 into a lesson 03 register, including at least one implied row (for example, "an attendee cannot check themselves in"). Write a bottom-up lesson 02 work plan. Note the riskiest row.
2. **Migration (20 min).** Add `checked_in_at` in a new migration with a working `down`. Run `migrate:latest`, `migrate:rollback`, and `migrate:latest`.
3. **Repository (45 min).** Write the three functions with explicit column lists, a `toDomain` mapper (`checkedInAt`), and a `trx` parameter on the write. `checkInCounts` is one query using `count` with a `FILTER`, or two `count`s in one round trip. It is not a loop.
4. **Service with injected clock (60 min).** Load the event; throw `NotFoundError` if it is missing. Throw `ForbiddenError` if `event.organizerId !== actorId`. Load the registration *for that event*; throw `NotFoundError` if it is missing. Throw `ConflictError` if the registration is waitlisted. Throw `ConflictError` if `now()` is outside `[startsAt − 2h, startsAt + 6h]`. If `checkedInAt` is already set, return it unchanged. Otherwise call `markCheckedIn(id, now())`. Do the load and the write in one transaction, with `findForEvent` using `forUpdate()` so a double-tap can't write two different times.
5. **Routes, validation, and view (45 min).** Thin handlers that call `validate(checkInParamsSchema, "params")` and read `req.validated.params`. Add the button to the organizer event page.
6. **Tests (90 min).** Unit tests with a fake repo and a fixed clock for every service branch. Integration tests from the acceptance sketch below.
7. **Risk register and report (45 min).** Score at least 5 risks. Write a requirement-mapped test-run report in the lesson 07 format.

## Acceptance criteria

- [ ] A new migration adds `checked_in_at`; no existing migration was edited; rollback works.
- [ ] No SQL outside `src/repositories/`; no `req`/`res` in `check-in.service.js`; `npm run check:layers` passes.
- [ ] Both path parameters are validated with zod; `/organizer/events/banana/...` returns 400, not 500.
- [ ] Every row in the status-code contract table is produced exactly as specified.
- [ ] A repeat check-in returns the original `checkedInAt`, and the database row is unchanged.
- [ ] Forbidden and conflict cases leave `checked_in_at` NULL in the database, and the tests assert that.
- [ ] The service's window rule is unit-tested at both edges (exactly −2h allowed, −2h−1ms refused, +6h allowed, +6h+1ms refused) with an injected clock.
- [ ] The check-in form carries a CSRF token, and a POST without one returns 403 `csrf_failed`.
- [ ] Every CHK id appears in at least one test name.
- [ ] `docs/requirements/check-in.md`, `docs/quality/check-in-risks.md`, and the test-run report are committed.

## Automated checks (coding courses) / Evidence checklist (non-coding)

Save as `test/integration/check-in.api.test.js`. It uses the helpers from lesson 07 plus the two new factories. Run it alone with:

```bash
node --env-file=.env.test --test --test-concurrency=1 test/integration/check-in.api.test.js
```

or as part of the full suite with `npm test`.

```javascript
// test/integration/check-in.api.test.js
import { describe, it, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { db } from "../../src/db/knex.js";
import {
  resetDatabase, createOrganizer, createEvent, createAttendee, createRegistration,
} from "../helpers/db.js";
import { signedInAgent } from "../helpers/auth.js";
import { csrfTokenFrom } from "../helpers/csrf.js";

const app = createApp();
const HOUR = 3_600_000;

async function organizerSession(email = "door@example.test") {
  const agent = await signedInAgent(app, { email });
  const account = await db("accounts").where({ email_normalized: email }).first();
  return { agent, organizerId: account.id };
}

async function checkIn(agent, eventId, registrationId) {
  const token = await csrfTokenFrom(agent, `/organizer/events/${eventId}`);
  return agent
    .post(`/organizer/events/${eventId}/registrations/${registrationId}/check-in`)
    .set("Accept", "application/json")
    .set("x-csrf-token", token);
}

async function checkedInAt(registrationId) {
  const row = await db("registrations").where({ id: registrationId }).first();
  return row.checked_in_at;
}

describe("Door check-in", () => {
  beforeEach(async () => { await resetDatabase(); });
  after(async () => { await db.destroy(); });

  it("CHK-1: organizer checks in a confirmed registration", async () => {
    const { agent, organizerId } = await organizerSession();
    const event = await createEvent({ organizerId, startsAt: new Date(Date.now() + HOUR) });
    const attendee = await createAttendee();
    const reg = await createRegistration({ eventId: event.id, attendeeId: attendee.id });

    const res = await checkIn(agent, event.id, reg.id);

    assert.equal(res.status, 200);
    assert.equal(res.body.id, reg.id);
    assert.ok(res.body.checkedInAt, "response includes checkedInAt");
    assert.notEqual(await checkedInAt(reg.id), null);
  });

  it("CHK-2: refuses check-in more than 2 hours before the start, and changes nothing", async () => {
    const { agent, organizerId } = await organizerSession();
    const event = await createEvent({ organizerId, startsAt: new Date(Date.now() + 3 * 24 * HOUR) });
    const reg = await createRegistration({ eventId: event.id, attendeeId: (await createAttendee()).id });

    const res = await checkIn(agent, event.id, reg.id);

    assert.equal(res.status, 409);
    assert.equal(res.body.error.code, "conflict");
    assert.equal(await checkedInAt(reg.id), null);
  });

  it("CHK-3: a second check-in keeps the original time", async () => {
    const { agent, organizerId } = await organizerSession();
    const event = await createEvent({ organizerId, startsAt: new Date(Date.now() + HOUR) });
    const reg = await createRegistration({ eventId: event.id, attendeeId: (await createAttendee()).id });

    const first = await checkIn(agent, event.id, reg.id);
    const second = await checkIn(agent, event.id, reg.id);

    assert.equal(second.status, 200);
    assert.equal(second.body.checkedInAt, first.body.checkedInAt);
  });

  it("CHK-4: refuses a waitlisted registration, and changes nothing", async () => {
    const { agent, organizerId } = await organizerSession();
    const event = await createEvent({ organizerId, startsAt: new Date(Date.now() + HOUR) });
    const reg = await createRegistration({
      eventId: event.id, attendeeId: (await createAttendee()).id, status: "waitlisted",
    });

    const res = await checkIn(agent, event.id, reg.id);

    assert.equal(res.status, 409);
    assert.equal(await checkedInAt(reg.id), null);
  });

  it("CHK-5: reports confirmed and checked-in counts", async () => {
    const { agent, organizerId } = await organizerSession();
    const event = await createEvent({ organizerId, startsAt: new Date(Date.now() + HOUR) });
    const regs = [];
    for (let i = 0; i < 3; i += 1) {
      regs.push(await createRegistration({ eventId: event.id, attendeeId: (await createAttendee()).id }));
    }
    await createRegistration({ eventId: event.id, attendeeId: (await createAttendee()).id, status: "waitlisted" });
    await checkIn(agent, event.id, regs[0].id);

    const res = await agent.get(`/organizer/events/${event.id}/check-ins`)
      .set("Accept", "application/json").expect(200);

    assert.deepEqual(res.body, { confirmed: 3, checkedIn: 1 });
  });

  it("CHK-6: another organizer gets 403 and the row is unchanged", async () => {
    const owner = await createOrganizer();
    const event = await createEvent({ organizerId: owner.id, startsAt: new Date(Date.now() + HOUR) });
    const reg = await createRegistration({ eventId: event.id, attendeeId: (await createAttendee()).id });
    const { agent } = await organizerSession("intruder@example.test");

    // The intruder cannot render the owner's page, so take a token from a page they can see.
    const token = await csrfTokenFrom(agent, "/organizer");
    const res = await agent
      .post(`/organizer/events/${event.id}/registrations/${reg.id}/check-in`)
      .set("Accept", "application/json")
      .set("x-csrf-token", token);

    assert.equal(res.status, 403);
    assert.equal(res.body.error.code, "forbidden");
    assert.equal(await checkedInAt(reg.id), null);
  });

  it("rejects a malformed registration id with 400, not 500", async () => {
    const { agent, organizerId } = await organizerSession();
    const event = await createEvent({ organizerId, startsAt: new Date(Date.now() + HOUR) });
    const res = await checkIn(agent, event.id, "banana");
    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, "validation_failed");
  });

  it("requires a CSRF token", async () => {
    const { agent, organizerId } = await organizerSession();
    const event = await createEvent({ organizerId, startsAt: new Date(Date.now() + HOUR) });
    const reg = await createRegistration({ eventId: event.id, attendeeId: (await createAttendee()).id });

    const res = await agent
      .post(`/organizer/events/${event.id}/registrations/${reg.id}/check-in`)
      .set("Accept", "application/json");

    assert.equal(res.status, 403);
    assert.equal(res.body.error.code, "csrf_failed");
    assert.equal(await checkedInAt(reg.id), null);
  });

  it("requires sign-in", async () => {
    await request(app)
      .post("/organizer/events/00000000-0000-4000-8000-000000000000/registrations/00000000-0000-4000-8000-000000000001/check-in")
      .set("Accept", "application/json")
      .expect((res) => assert.ok([401, 403].includes(res.status), `got ${res.status}`));
  });
});
```

The last test accepts 401 *or* 403 because the result depends on whether `verifyCsrf` or `requireAuth` runs first on your organizer router. Write down which order you chose, then tighten the assertion to match it.

Unit-test sketch for the window edges (`test/unit/check-in.service.test.js`):

```javascript
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { makeCheckInService } from "../../src/services/check-in.service.js";
import { ConflictError } from "../../src/errors/index.js";

const START = new Date("2026-08-02T15:00:00Z");
const HOUR = 3_600_000;

function service(nowMs, reg = { id: "r1", status: "confirmed", checkedInAt: null }) {
  return makeCheckInService({
    eventsRepo: { findById: async () => ({ id: "e1", organizerId: "org-1", startsAt: START }) },
    regsRepo: {
      findForEvent: async () => reg,
      markCheckedIn: async (id, at) => ({ ...reg, checkedInAt: at }),
    },
    now: () => new Date(nowMs),
    transaction: async (fn) => fn(null), // the fake runs the callback without a real trx
  });
}

describe("checkIn window (CHK-2)", () => {
  it("CHK-2: allows exactly 2h before start", async () => {
    const r = await service(START.getTime() - 2 * HOUR).checkIn("e1", "r1", "org-1");
    assert.ok(r.checkedInAt);
  });
  it("CHK-2: refuses 1ms earlier", async () => {
    await assert.rejects(service(START.getTime() - 2 * HOUR - 1).checkIn("e1", "r1", "org-1"), ConflictError);
  });
  it("CHK-2: allows exactly 6h after start", async () => {
    const r = await service(START.getTime() + 6 * HOUR).checkIn("e1", "r1", "org-1");
    assert.ok(r.checkedInAt);
  });
  it("CHK-2: refuses 1ms later", async () => {
    await assert.rejects(service(START.getTime() + 6 * HOUR + 1).checkIn("e1", "r1", "org-1"), ConflictError);
  });
});
```

The `transaction` option is how this sketch keeps `db.transaction` injectable. Its production default is `(fn) => db.transaction(fn)`. If you structure the transaction differently, adapt the fake, but keep the service testable without Postgres.

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Layer boundaries | SQL or status codes appear outside their layer | Routes thin, rules in service, SQL in repository; layer check passes | Design note states each module's "does NOT" line, and a reviewer finds no leaks |
| Validation and errors | Some bad input returns 500 | Every row of the status-code contract matches; existing error shape used | Contract documented and pinned by a test per row |
| Rule correctness | Window or idempotency wrong at the edges | All CHK rules correct, edges unit-tested with an injected clock | Concurrent double check-in proven safe with a `Promise.all` test |
| Test evidence | Status-only assertions | Forbidden/conflict tests assert the row is unchanged; CHK ids in test names | Each test has been seen to fail by removing its control (recorded in NOTES.md) |
| Requirements and risk | Register missing rows or sources | Register, implied rows, 5+ scored risks with controls | Accepted risk explicitly recorded; risks traced to CHK ids |
| Reporting | No run report | Lesson 07 format report mapped to CHK ids | Report includes a failing-then-fixed defect with id and next action |

## Stretch goals

- Add `GET /organizer/events/:eventId/check-ins.csv` that streams a CSV of attendees with check-in times. Escape fields correctly, and add a test that a display name containing a comma survives the round trip.
- Add an "undo check-in" action within 5 minutes of checking in. Record both actions so an organizer can see the history, in the spirit of SRS 4.7.11 from the capstone.
- Log one structured line per check-in at the decision point (request id, event id, registration id, outcome) and prove with a test that no session id appears in it.

## Reflection prompts

- Which status-code decision were you least sure about, and what would change your mind?
- Where did the injected clock change how you wrote the service?
- Which of your tests would still pass if the ownership check were deleted? If any, why?

## Instructor notes (common pitfalls, how to adapt for time)

- **Pitfall: checking ownership after loading the registration by id alone.** If the service loads `registrations.id = :registrationId` without also matching `event_id`, an organizer can check in a registration for someone else's event by pairing their own `eventId` with a foreign `registrationId`. That's the insecure direct object reference from lesson 05. Watch for it in review.
- **Pitfall: `new Date()` inside the service.** The window tests become flaky. Insist on `now` injection.
- **Pitfall: CSRF disabled in tests.** Refuse it. The `csrfTokenFrom` helper exists so learners don't need to.
- **Pitfall: `checkInCounts` as a loop.** Point back to the N+1 section of lesson 04.
- **Short on time (3 hours):** drop the view and the risk register, and keep CHK-1, CHK-3, CHK-4, CHK-6 plus the unit window tests.
- **Longer (8+ hours):** add the CSV and undo stretch goals and require a concurrency test for double-tap.
