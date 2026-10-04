---
lesson_id: node200-07
course_id: node200
pathway: software-developer
title: Testing and Integration
order: 7
kind: lesson
competency_ids:
  - D4-S1-C04
objectives:
  - Test a service at unit and integration level and report progress
---

## What the suite is actually for

You have been testing all along — with `curl`, with a browser, with a script that fires twenty concurrent registrations. Those checks worked, and then they evaporated. Nobody else can run them, they prove nothing tomorrow, and the person who changes your capacity rule in six months has no way to discover they broke it.

An automated test suite is the same checks, written down so they run on demand. That gives you three things you cannot otherwise have.

**A regression net.** Every rule you encoded stays encoded. The value of a test is not that it passes today; it is that it fails the day someone breaks the thing it describes.

**Evidence.** In lesson 03 you wrote acceptance criteria, and in lesson 06 you wrote a risk register whose every row has a "verified by" column. A test is what fills that column. "I tested it" is an opinion; a named test that fails when the control is removed is a fact.

**Permission to change things.** Without tests, every refactor is a gamble, so nobody refactors, so the codebase calcifies. The suite is what makes the structure from lesson 02 maintainable rather than merely tidy.

There is a fourth thing, less often said, that this lesson gives equal weight to: **a suite is how you report progress honestly.** On a team, someone has to say what works, what does not, and what has not been checked yet. A test run mapped to requirement ids answers that in a table. Without one, status reporting is a feeling.

This course uses **`node:test`**, Node's built-in runner, with **`supertest`** for HTTP. No framework to install for the runner itself, and the assertions come from `node:assert/strict`. Vitest and Jest are common alternatives with more features and more configuration; the concepts here transfer directly to both.

```bash
npm install --save-dev supertest
```

## The shape of a suite

Tests are usually described as a pyramid, and the shape is a budget rather than a law.

**Unit tests** exercise one module with its dependencies replaced. Fast — hundreds per second — and precise: a failure names the function. They can only test logic that is reachable without the outside world, which is exactly why lesson 02 pushed the rules into services.

**Integration tests** exercise several real modules together, usually the whole HTTP stack down to a real database. Slower, and a failure takes longer to localise, but they test the wiring: routing, middleware order, session handling, serialization, SQL, constraints. Most defects in a small service live in the wiring, not in the logic.

**End-to-end tests** drive a real browser against a running deployment. Slow, brittle, and expensive to maintain — worth having for a handful of critical journeys and nothing more. They are out of scope for this course.

Aim for many unit tests over your rules, a solid layer of integration tests over each endpoint's important paths, and no end-to-end tests until something genuinely needs one. The wrong shape is not "too few tests" but "all tests at the same level": all-unit suites pass while the app is broken, all-integration suites are slow enough that people stop running them.

## Running tests

`node --test` discovers files matching `*.test.js` (and a few other patterns) and runs them, each file in its own process.

```json
{
  "scripts": {
    "test": "node --test --test-concurrency=1 test/",
    "test:watch": "node --test --watch test/",
    "test:coverage": "node --test --experimental-test-coverage test/"
  }
}
```

`--test-concurrency=1` matters here: test files run in parallel by default, and parallel files sharing one test database will destroy each other's data. Serial files with a shared database is the simplest correct arrangement; if the suite gets slow enough to hurt, give each worker its own database rather than removing the isolation.

The API is small:

```javascript
import { describe, it, before, beforeEach, after, mock } from "node:test";
import assert from "node:assert/strict";

describe("capacity", () => {
  it("rejects a registration when the event is full", async () => {
    assert.equal(1 + 1, 2);
  });
});
```

`assert.equal` is strict (`===`), `assert.deepEqual` compares structures, `assert.match` takes a regular expression, and `assert.rejects` asserts that a promise rejects — which you will use constantly, because your services signal failure by throwing.

## Unit-testing a service

The layering pays off here. `events.service.js` imports a repository module and nothing else, so a unit test supplies a fake repository and never touches Postgres.

The cleanest way to make that possible is **dependency injection**: have the service accept its repository rather than import it. A small change to the service:

```javascript
// src/services/events.service.js
import * as defaultRepo from "../repositories/events.repository.js";
import { NotFoundError, ValidationError } from "../errors/index.js";

export function makeEventsService({ repo = defaultRepo, now = () => new Date() } = {}) {
  async function create(input, organizerId) {
    if (new Date(input.startsAt) <= now()) {
      throw new ValidationError("startsAt must be in the future");
    }
    return repo.insert({ ...input, organizerId });
  }

  async function getById(id) {
    const event = await repo.findById(id);
    if (!event) throw new NotFoundError(`No event with id ${id}`);
    return event;
  }

  return { create, getById };
}

export const eventsService = makeEventsService();
```

Production code imports `eventsService` and notices nothing. Tests call `makeEventsService({ repo: fake })`.

```javascript
// test/unit/events.service.test.js
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { makeEventsService } from "../../src/services/events.service.js";
import { ValidationError, NotFoundError } from "../../src/errors/index.js";

function fakeRepo(overrides = {}) {
  return {
    insert: async (event) => ({ id: "evt-1", ...event }),
    findById: async () => null,
    ...overrides,
  };
}

const FIXED_NOW = new Date("2026-06-01T12:00:00Z");

describe("eventsService.create", () => {
  it("R-09: rejects an event starting in the past", async () => {
    const service = makeEventsService({ repo: fakeRepo(), now: () => FIXED_NOW });

    await assert.rejects(
      () => service.create({ title: "Cleanup", startsAt: "2026-05-01T10:00:00Z" }, "org-1"),
      (err) => err instanceof ValidationError && /future/.test(err.message),
    );
  });

  it("R-09: stores the organizer id from the actor, not the input", async () => {
    let stored;
    const repo = fakeRepo({ insert: async (e) => { stored = e; return { id: "evt-1", ...e }; } });
    const service = makeEventsService({ repo, now: () => FIXED_NOW });

    await service.create(
      { title: "Cleanup", startsAt: "2026-07-01T10:00:00Z", organizerId: "attacker" },
      "org-1",
    );

    assert.equal(stored.organizerId, "org-1");
  });
});

describe("eventsService.getById", () => {
  it("throws NotFoundError when the repository returns nothing", async () => {
    const service = makeEventsService({ repo: fakeRepo() });
    await assert.rejects(() => service.getById("missing"), NotFoundError);
  });
});
```

Four things there are worth copying as habits.

**The injected clock.** `now: () => FIXED_NOW` removes time from the test. A test that constructs a date relative to the real clock passes today and fails on a boundary someday, and "the suite is flaky on Mondays" is a genuinely miserable thing to debug. Inject time wherever a rule depends on it.

**The second test asserts a security property**, not a happy path: the organizer id comes from the authenticated actor, and a client-supplied `organizerId` is ignored. That is the lesson-05 rule about not trusting client copies of facts, pinned down so it cannot silently regress.

**The requirement id is in the test name.** (`R-09` is not in the 3.4 extract from lesson 03, which stops at R-08. It stands for whatever id your register gives the event-creation rule "an event cannot start in the past", so use your own number.) `R-09:` makes the traceability matrix from lesson 03 reconstructable with a grep, and makes a test failure immediately meaningful to a project manager.

**The fake is a plain object.** You rarely need a mocking library for this; `node:test` provides `mock.fn()` when you want call recording, but a hand-written fake is more readable and does not silently drift from the real interface. Whichever you use, when the real repository's signature changes, nothing tells the fake — which is why integration tests exist.

## Integration tests over the real stack

`createApp()` from lesson 02 returns a wired application that is not listening. `supertest` takes it, binds an ephemeral port for the duration of one request, and gives you a fluent client:

```javascript
// test/integration/events.api.test.js
import { describe, it, before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { db } from "../../src/db/knex.js";
import { resetDatabase, createOrganizer, createEvent } from "../helpers/db.js";

const app = createApp();

describe("GET /events", () => {
  beforeEach(async () => { await resetDatabase(); });
  after(async () => { await db.destroy(); });

  it("R-04: lists upcoming events with places remaining", async () => {
    const organizer = await createOrganizer();
    await createEvent({ organizerId: organizer.id, title: "Cleanup", capacity: 40 });
    await createEvent({ organizerId: organizer.id, title: "Past", startsAt: "2020-01-01T00:00:00Z" });

    const res = await request(app).get("/events").set("Accept", "application/json").expect(200);

    assert.equal(res.body.length, 1);
    assert.equal(res.body[0].title, "Cleanup");
    assert.equal(res.body[0].placesRemaining, 40);
  });

  it("rejects an out-of-range page size with 400 and names the field", async () => {
    const res = await request(app).get("/events?limit=5000")
      .set("Accept", "application/json")   // otherwise lesson 06's handler renders HTML
      .expect(400);
    assert.equal(res.body.error.code, "validation_failed");
    assert.ok(res.body.error.details.some((d) => d.field === "limit"));
  });
});
```

No server is started, no port is chosen, nothing needs cleaning up between files. Every layer below the request is real: routing, middleware order, validation, the service, the repository, Postgres, the error handler.

### The test database

Integration tests need their own database, and it must be reset between tests or they will depend on each other's leftovers in ways that only show up when you run one file alone.

```bash
# .env.test
DATABASE_URL=postgres://events:events@localhost:5432/events_board_test
NODE_ENV=test
SESSION_SECRET=test-secret-not-used-anywhere-else
LOG_LEVEL=silent
```

```json
{
  "scripts": {
    "test": "node --env-file=.env.test --test --test-concurrency=1 test/",
    "test:db:reset": "node --env-file=.env.test node_modules/.bin/knex migrate:latest"
  }
}
```

```javascript
// test/helpers/db.js
import { db } from "../../src/db/knex.js";

export async function resetDatabase() {
  await db.raw("TRUNCATE registrations, events, accounts, user_sessions RESTART IDENTITY CASCADE");
}

let counter = 0;
export async function createOrganizer(overrides = {}) {
  counter += 1;
  const [row] = await db("accounts")
    .insert({
      email: `organizer${counter}@example.test`,
      email_normalized: `organizer${counter}@example.test`,
      display_name: "Test Organizer",
      password_hash: "$argon2id$placeholder",
      ...overrides,
    })
    .returning(["id", "email"]);
  return row;
}

export async function createEvent(overrides = {}) {
  // Tests speak camelCase; the table speaks snake_case. Translate here, once.
  const { organizerId, startsAt, ...rest } = overrides;
  const [row] = await db("events")
    .insert({
      title: "Test Event",
      starts_at: startsAt ?? new Date(Date.now() + 7 * 86_400_000),
      venue: "Test Venue",
      capacity: 10,
      organizer_id: organizerId,
      ...rest,
    })
    .returning(["id", "title"]);
  return row;
}
```

Note the destructuring in `createEvent`. Spreading `overrides` straight into the insert would hand Knex columns called `organizerId` and `startsAt`, which do not exist, and every test using the factory would fail with a Postgres "column does not exist" error. The factory does the same camelCase-to-snake_case translation the repository does, for the same reason.

Five rules keep this from becoming the flakiest part of your project.

**The test database is separate and disposable.** Pointing tests at your development database means `TRUNCATE` deletes your seed data, and eventually someone points `.env.test` at production. Name it distinctly and consider refusing to run when the URL does not end in `_test`.

**Migrate it the same way as every other environment.** The schema under test must be the schema you deploy; never create test tables by hand.

**Truncate before each test, not after.** A test that fails midway leaves rows behind, and cleaning up first means the next run starts clean regardless.

**Factories over fixtures.** `createEvent({ capacity: 0 })` states exactly what this test depends on and defaults the rest. A shared fixture file used by forty tests becomes untouchable, because any change breaks something unrelated.

**Every test creates what it needs.** No ordering between tests, ever. Run one file alone, run the suite in a different order, and the results must be identical.

### Testing authenticated routes

Session cookies make this slightly more involved, and `supertest`'s agent handles it: an agent keeps a cookie jar across requests, so logging in once carries the session forward.

```javascript
// test/helpers/auth.js
import request from "supertest";
import { hashPassword } from "../../src/lib/password.js";
import { db } from "../../src/db/knex.js";

export async function signedInAgent(app, { email = "user@example.test", password = "correct horse battery staple" } = {}) {
  await db("accounts").insert({
    email,
    email_normalized: email.toLowerCase(),
    display_name: "Test User",
    password_hash: await hashPassword(password),
  });

  const agent = request.agent(app);
  await agent.post("/login").type("form").send({ email, password }).expect(302);
  return agent;
}
```

```javascript
describe("POST /events/:id/cancel", () => {
  beforeEach(async () => { await resetDatabase(); });

  it("R-06: refuses cancellation by a non-organizer with 403", async () => {
    const owner = await createOrganizer();
    const event = await createEvent({ organizerId: owner.id });
    const agent = await signedInAgent(app, { email: "other@example.test" });

    const res = await agent.post(`/events/${event.id}/cancel`).expect(403);
    assert.equal(res.body.error.code, "forbidden");

    const after = await db("events").where({ id: event.id }).first();
    assert.notEqual(after.status, "cancelled");
  });

  it("requires authentication", async () => {
    const owner = await createOrganizer();
    const event = await createEvent({ organizerId: owner.id });
    await request(app).post(`/events/${event.id}/cancel`)
      .set("Accept", "application/json").expect(401);
  });
});
```

Note the assertion against the database after the `403`. Asserting only the status code proves the response was right, not that the side effect was prevented — and it is entirely possible to return `403` after having already cancelled the event. **For any test of a rule that forbids something, assert that the thing did not happen**, not just that the status was correct.

If you mounted lesson 05's `verifyCsrf`, both of these tests need a valid token. Without one, the login inside `signedInAgent` and the cancel `POST` are refused with `403 csrf_failed` before your code runs, so the cancel test passes for the wrong reason and the login helper fails outright. Never switch CSRF checks off under `NODE_ENV=test`; you would be testing a different application. Fetch the token the way a browser does, from a page that renders a form:

```javascript
// test/helpers/csrf.js
export async function csrfTokenFrom(agent, path) {
  const res = await agent.get(path).set("Accept", "text/html").expect(200);
  const match = res.text.match(/name="_csrf" value="([^"]+)"/);
  if (!match) throw new Error(`No _csrf field rendered at ${path}`);
  return match[1];
}
```

In `signedInAgent`, call `csrfTokenFrom(agent, "/login")` before posting and send it as `_csrf`. Login regenerates the session, and the session holds the token, so fetch a fresh token after login for any later `POST`, for example ``csrfTokenFrom(agent, `/events/${event.id}`)``. Then send it with `.type("form").send({ _csrf: token })` or `.set("x-csrf-token", token)`. Keep one test that deliberately omits the token and asserts `403 csrf_failed`, so the protection itself is covered.

Real password hashing makes these tests noticeably slower (argon2 is deliberately expensive). Two acceptable answers: create the account once per file rather than per test, or lower the cost parameters when `NODE_ENV === "test"`. If you take the second, do it in the config module so it is visible and cannot leak into production.

### Testing the hard paths

The tests worth the most are the ones covering things you cannot check by hand.

```javascript
it("QA-1: never oversells capacity under concurrency", async () => {
  const organizer = await createOrganizer();
  const event = await createEvent({ organizerId: organizer.id, capacity: 5 });
  const attendees = await Promise.all(Array.from({ length: 20 }, () => createAttendee()));

  const results = await Promise.allSettled(
    attendees.map((a) => registrationsService.register(event.id, a.id)),
  );

  const confirmed = results.filter((r) => r.status === "fulfilled").length;
  assert.equal(confirmed, 5);

  const rows = await db("registrations").where({ event_id: event.id, status: "confirmed" });
  assert.equal(rows.length, 5);
});
```

That test is the "verified by" cell for QR-1 in your risk register. Prove it works by removing the `forUpdate()` lock from the repository and watching it fail — a test you have never seen fail is a test you do not know works.

Cover the error paths with the same seriousness as the happy path: a duplicate registration returns `409` and creates no second row; an invalid uuid returns `400` and not `500`; a deliberate exception from a handler returns `500` with a generic body containing no stack trace. Those are the cases users hit and nobody checks by hand.

## Coverage, and what it is worth

```bash
npm run test:coverage
```

Coverage tells you which lines ran during the suite. That is genuinely useful in one direction: a service function at 0% is untested, and an error branch never executed is a branch that has never been shown to work. Reading a coverage report to find untested branches is a good half hour.

It is worthless in the other direction. A file at 100% coverage can have zero assertions — running a line is not testing it. Treat coverage as a way to find gaps, never as a target. Teams that mandate a percentage get tests written to satisfy the percentage, which are worse than no tests because they cost maintenance and prove nothing.

The better question is the risk register: does every row's "verified by" cell name a test that exists and has been seen to fail? That is coverage of the things that matter.

## Recording and reporting progress

This is the half of the competency that is not about writing tests at all. On a team you are expected to say, in a form other people can act on, what has been verified and what has not.

Start with a **test plan** written before the tests, from the acceptance criteria and the risk register. It does not need to be long:

```markdown
# Test plan — Event Registration (SRS 3.4)

Scope: registration create/cancel, capacity, duplicate prevention, organizer
attendee list. Out of scope: confirmation email (R-05 deferred), retention
purge (R-07, separate plan).

Levels:
- Unit: registration rules (capacity, duplicate, cancelled/past event)
- Integration: POST /events/:id/registrations, GET /organizer/events/:id/attendees
- Manual: keyboard and screen-reader pass on the registration form (QR-9)

Environment: local Postgres `events_board_test`, migrations at head, seeded per
test by factories.

Entry criteria: feature branch builds, migrations run clean.
Exit criteria: every Must requirement in the register has a passing test named
with its id; no known defect of severity high or above remains open.
```

Then a **test run report** after a run. The point is that it maps to requirement ids, not to file names, so it can be read by someone who has not seen the code:

```markdown
# Test run — 2026-06-14, branch feature/registration, commit a3f9c21

Command: `npm test` (node --test, 64 tests)
Result: 61 passed, 2 failed, 1 skipped, 14.2s

| Requirement | Tests | Result | Note |
| --- | --- | --- | --- |
| R-01 register for published event | 4 | pass | |
| R-02 no double registration | 3 | pass | includes concurrent case |
| R-03 closes at capacity | 3 | pass | QA-1 verified, 20-way concurrency |
| R-04 places remaining shown | 2 | 1 fail | DEF-118: count excludes waitlisted, spec unclear |
| R-06 organizer sees own attendees only | 3 | pass | 403 asserted plus no side effect |
| R-07 retention purge | 0 | not started | job not implemented, tracked as TASK-91 |
| R-08 detail page under 800ms p95 | 1 | fail | 1,240ms at 5,000 rows — DEF-119 raised |

Not covered: R-05 (deferred). Manual accessibility pass scheduled 2026-06-16.
```

Four disciplines make that report worth writing.

**Distinguish a failing test from a defect.** A failing test can mean the code is wrong (raise a defect), the test is wrong (fix the test), or the requirement was ambiguous (go back to lesson 03's open-questions table). DEF-118 above is the third case, and saying so is more useful than either fixing the code or the test on a guess.

**Never report "not started" as "passing".** R-07 has zero tests, and the row says so. An empty row is a status; a missing row is a lie by omission, and the person planning the release needs it.

**Give every failure an identifier and a next action.** DEF-119 is a performance defect against a numbered requirement, which means someone can prioritise it against other work rather than rediscovering it at release.

**Report the same numbers every time.** Total, passed, failed, skipped, duration, commit. Consistency is what lets someone compare two runs and see a trend.

Two smaller habits complete the picture. **Run the suite the same way everywhere** — the exact `npm test` command you run locally should be the one that runs on the shared build, so a pass on your machine means the same thing as a pass on theirs. And **document what must not change**: when a test pins behaviour another team depends on — a JSON field name, a status code, an ordering — say so in the test name or a comment, so the next person to touch it knows a rename is a breaking change rather than a tidy-up.

## Practice

Build a test suite for the events board and report on it.

1. Add `supertest`, create `.env.test` pointing at a separate `events_board_test` database, add the `test` and `test:coverage` scripts, and run the migrations against the test database. Add a guard that refuses to run when `DATABASE_URL` does not end in `_test`.
2. Refactor `events.service.js` and `registrations.service.js` into `makeXService({ repo, now })` factories with default exports preserved, so production code is unchanged.
3. Write `test/helpers/db.js` with `resetDatabase()` and factories for organizers, attendees, events, and registrations. Every factory takes overrides and generates unique values.
4. Write at least eight unit tests over the registration and event rules, with a fixed injected clock: past event, cancelled event, duplicate, at capacity, one seat left, capacity zero meaning unlimited, non-organizer cancel, organizer id taken from the actor rather than the input.
5. Write at least eight integration tests using `supertest` and `createApp()`, covering the list endpoint, the detail endpoint, creation with a valid body, creation with four distinct invalid bodies, and the not-found path.
6. Write `test/helpers/auth.js` returning a signed-in agent, and use it for at least four tests over authenticated routes, including one `401` for signed-out access and one `403` for a non-owner. Every forbidden case must also assert that the database was not changed.
7. Write the concurrency test from this lesson. Then remove the `forUpdate()` lock, run it, record the failure output in `NOTES.md`, and restore the lock.
8. Deliberately break one production behaviour — change a `409` to a `200`, remove the ownership check, drop a unique constraint — and record which tests caught it. If none did, write the test that should have.
9. Run coverage and identify the three least-covered files. For each, write one sentence in `NOTES.md` saying whether the gap matters and why. Add tests for one of them.
10. Write `docs/quality/test-plan-registration.md` in the format above, with scope, levels, environment, and entry and exit criteria, derived from your lesson 03 acceptance criteria and lesson 06 risk register.
11. Run the full suite and write `docs/quality/test-run-2026-xx-xx.md` as a requirement-mapped report with totals, per-requirement rows, at least one honest "not started", and a defect id for anything failing.
12. Add requirement ids to every test name where one applies, then produce the traceability matrix by grep alone: `grep -rn "R-0" test/` should let you fill the "verified by" column of your lesson 03 matrix without opening a file.

**Deliverable:** a committed suite that passes with `npm test` from a clean checkout, a test plan and a test run report under `docs/quality/`, an updated traceability matrix, and a `NOTES.md` recording the concurrency failure, the deliberate breakage, and your coverage assessment.

## Check your understanding

1. Does a supertest integration test need `npm run dev` running in another terminal? Why or why not?
2. A test asserts `expect(403)` on a non-owner cancel and passes. Why is that not enough, and what should the test also check?
3. Your suite passes when run file by file but fails when run with `npm test`. Name the two most likely causes given this lesson's setup.
4. Coverage reports 100% for `registrations.service.js`. What can you still not conclude, and what is a better question to ask?

**Answers**

1. No. supertest takes the app returned by `createApp()`, binds a temporary port for each request, and closes it. That is why lesson 02 separated `app.js` from `server.js`.
2. It proves the response was right, not that the side effect was prevented. The event could have been cancelled before the 403 was returned. Read the row back from the database and assert its status did not change.
3. Test files running in parallel against one shared test database (missing `--test-concurrency=1`), or tests depending on each other's leftover rows (missing reset before each test, or a test that doesn't create what it needs).
4. That the lines were *tested*. A line can run with no assertion about its result. Better question: does every risk-register row's "verified by" name a test that exists and has been seen to fail when its control is removed?
