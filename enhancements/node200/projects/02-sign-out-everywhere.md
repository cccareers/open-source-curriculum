---
course_id: node200
project_id: node200-x02
title: "Sign Out Everywhere and the Monday Logout Incident"
kind: supplementary-project
status: draft
hours_estimate: 7
difficulty: stretch
related_lessons:
  - node200-05
  - node200-07
  - node200-08
objectives:
  - Implement authentication and session handling for a web service
  - Troubleshoot a running service from its logs and symptoms
  - Test a service at unit and integration level and report progress
competency_ids:
  - D2-S1-C04
  - D6-S1-C02
  - D4-S1-C05
  - D4-S1-C04
---

## Scenario

An organizer on the events board left herself signed in on a shared computer at the Maker Space after the Intro to Soldering evening. She changed her password from home, but the Maker Space browser was still signed in as her the next morning. K. Osei has raised it as a security defect: **changing a password must sign out every other session for that account.** Lesson 05's checklist already names this ("Have a password change path that invalidates other sessions"). This project builds it.

The project has a second half. After you ship it, your instructor gives you a log file from a teammate's version of the same feature that went to staging. On Monday at 10:42 every user on staging was signed out at once. You diagnose it from the logs alone and write the defect report.

## What you will build / produce

**Part A — the feature**

- `POST /account/password` with body `{ currentPassword, newPassword }` (plus CSRF):
  - Verifies `currentPassword` with argon2. A wrong password returns `401 unauthenticated`, nothing changes, and the attempt counts against the login rate limiter.
  - Validates `newPassword` with zod (12 to 256 characters, must differ from the current one) → `400 validation_failed`.
  - Stores the new hash, deletes **every other** session row for this account, and regenerates the current session, so the session id changes and the user stays signed in on this device.
  - JSON clients get `200 { sessionsRevoked: <n> }`. Browsers get a `303` redirect to `/account`.
- `POST /account/sessions/revoke-others`: the same session deletion without a password change ("Sign out everywhere else").
- `src/repositories/sessions.repository.js` with `deleteOthersForAccount(accountId, keepSid, trx)`, which returns the deleted count. It's the only place the `user_sessions` table is queried directly.
- Structured auth events at the decision point, each with `reqId`, `accountId`, `outcome`, and counts. Never a password, hash, or session id: `auth.login.succeeded`, `auth.login.failed`, `auth.logout`, `auth.password.changed` (with `sessionsRevoked`), and `auth.sessions.revoked`.
- `export const loggerOptions` from `src/lib/logger.js`, so a test can build a logger with the real redaction list and a capture stream.

**Part B — the incident**

- `docs/quality/def-311.md`: a six-part defect report (lesson 08 format) for the Monday logout, with real `jq` commands and the lines they return.
- An escalation message under 120 words.
- A regression test that would have caught the teammate's bug, and a new row in your lesson 06 risk register.

## Before you start (prerequisites, starter files or data)

- The events board at the end of lesson 08: `express-session` with `connect-pg-simple` writing to `user_sessions` (`sid`, `sess` json, `expire`), argon2 hashing, CSRF, pino logging with redaction, and the lesson 07 test helpers including `csrfTokenFrom`.
- Know where the account id lives in the stored session. With lesson 05's login handler it is `req.session.userId`, so in Postgres it is `sess->>'userId'`. Check yours: `SELECT sid, sess FROM user_sessions LIMIT 1;`.
- Make sure the account page (`GET /account`) renders a form with a `_csrf` field.
- **Instructor supplies** `incident/staging-2026-06-22.log` (about 2,000 pino JSON lines) and `incident/teammate.patch`. See the instructor notes for how to generate them.

## Milestones

1. **Design note (30 min).** In `docs/design-notes.md`, record: which sessions are revoked and which is kept; why the current session is regenerated rather than kept; what `sessionsRevoked` counts; and what a client sees on a revoked device (`401` JSON or a redirect to `/login`).
2. **Repository (30 min).** `deleteOthersForAccount` in one parameterized statement:
   ```javascript
   const n = await trx("user_sessions")
     .whereRaw("sess->>'userId' = ?", [accountId])
     .andWhereNot({ sid: keepSid })
     .del();
   ```
   Explain in a code comment why `whereRaw` here is still safe: the value is bound, and only the JSON path is literal.
3. **Service (60 min).** `changePassword(accountId, currentSid, { currentPassword, newPassword })`. Verify, hash, update the hash, and revoke others in one transaction, then return `{ sessionsRevoked }`. The route does the `regenerate` (it is HTTP/session work), *after* the service succeeds.
4. **Routes and validation (45 min).** Schema, thin handlers, CSRF, and the rate limiter on the password route.
5. **Logging (30 min).** The five auth events, plus the `loggerOptions` export.
6. **Tests (90 min).** Use the acceptance sketch below, then add your own.
7. **Incident (90 min).** Work only from the log file first: symptom, observation, hypothesis, test. Then read the patch to confirm, write DEF-311, write the escalation message, and add the regression test.

## Acceptance criteria

- [ ] Changing the password from device A signs out devices B and C for the same account on their next request.
- [ ] Device A stays signed in, but its `eb.sid` cookie value changes.
- [ ] Sessions belonging to **other accounts** are untouched (asserted by row count in the test).
- [ ] The old password no longer logs in; the new one does.
- [ ] A wrong current password returns 401 and changes nothing (hash and session rows unchanged).
- [ ] `sessionsRevoked` in the response and in the `auth.password.changed` log line equals the number of rows deleted.
- [ ] No log line produced during the test run contains the password, the argon2 hash, or any `eb.sid` value.
- [ ] `user_sessions` is queried only from `sessions.repository.js` (grep proves it). connect-pg-simple's own access is excepted.
- [ ] DEF-311 names the onset time, the triggering request id, the evidence line, the suspected cause labelled as suspected, and "not yet checked".
- [ ] The regression test fails against the teammate's patch and passes against yours.

## Automated checks (coding courses) / Evidence checklist (non-coding)

Save as `test/integration/password-change.api.test.js` and run with:

```bash
node --env-file=.env.test --test --test-concurrency=1 test/integration/password-change.api.test.js
```

```javascript
// test/integration/password-change.api.test.js
import { describe, it, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { db } from "../../src/db/knex.js";
import { resetDatabase } from "../helpers/db.js";
import { hashPassword } from "../../src/lib/password.js";
import { csrfTokenFrom } from "../helpers/csrf.js";

const app = createApp();
const OLD = "correct horse battery staple";
const NEW = "a completely different passphrase";

async function createAccount(email, password = OLD) {
  const [row] = await db("accounts").insert({
    email, email_normalized: email, display_name: email, password_hash: await hashPassword(password),
  }).returning(["id"]);
  return row.id;
}

// Each call is a separate "device": its own cookie jar, its own session row.
async function device(email, password = OLD) {
  const agent = request.agent(app);
  const token = await csrfTokenFrom(agent, "/login");
  await agent.post("/login").type("form").send({ email, password, _csrf: token }).expect(302);
  return agent;
}

function sidOf(agent) {
  const cookie = agent.jar.getCookie("eb.sid", { domain: "127.0.0.1", path: "/", script: false, secure: false });
  return cookie?.value;
}

async function isSignedIn(agent) {
  const res = await agent.get("/organizer").set("Accept", "application/json");
  return res.status === 200;
}

async function changePassword(agent, body) {
  const token = await csrfTokenFrom(agent, "/account");
  return agent.post("/account/password")
    .set("Accept", "application/json")
    .set("x-csrf-token", token)
    .send(body);
}

describe("Password change signs out other sessions", () => {
  beforeEach(async () => { await resetDatabase(); });
  after(async () => { await db.destroy(); });

  it("revokes the account's other sessions and keeps this one", async () => {
    const ada = "ada@example.test";
    const adaId = await createAccount(ada);
    const [a1, a2, a3] = [await device(ada), await device(ada), await device(ada)];
    const sidBefore = sidOf(a1);

    const res = await changePassword(a1, { currentPassword: OLD, newPassword: NEW });

    assert.equal(res.status, 200);
    assert.equal(res.body.sessionsRevoked, 2);
    assert.equal(await isSignedIn(a1), true, "this device stays signed in");
    assert.notEqual(sidOf(a1), sidBefore, "this device's session id was regenerated");
    assert.equal(await isSignedIn(a2), false);
    assert.equal(await isSignedIn(a3), false);

    const remaining = await db("user_sessions").whereRaw("sess->>'userId' = ?", [adaId]);
    assert.equal(remaining.length, 1);
  });

  it("does not touch other accounts' sessions", async () => {
    await createAccount("ada@example.test");
    await createAccount("grace@example.test");
    const ada = await device("ada@example.test");
    const grace1 = await device("grace@example.test");
    const grace2 = await device("grace@example.test");
    const before = await db("user_sessions").count({ n: "*" }).first();

    await changePassword(ada, { currentPassword: OLD, newPassword: NEW }).then((r) => assert.equal(r.status, 200));

    assert.equal(await isSignedIn(grace1), true);
    assert.equal(await isSignedIn(grace2), true);
    const afterCount = await db("user_sessions").count({ n: "*" }).first();
    // Ada's session was regenerated (one row replaced), and nobody else lost one.
    assert.equal(Number(afterCount.n), Number(before.n));
  });

  it("old password stops working, new password works", async () => {
    await createAccount("ada@example.test");
    const a1 = await device("ada@example.test");
    await changePassword(a1, { currentPassword: OLD, newPassword: NEW }).then((r) => assert.equal(r.status, 200));

    const fresh = request.agent(app);
    const token = await csrfTokenFrom(fresh, "/login");
    const bad = await fresh.post("/login").type("form").set("Accept", "application/json")
      .send({ email: "ada@example.test", password: OLD, _csrf: token });
    assert.equal(bad.status, 401);

    await device("ada@example.test", NEW); // asserts 302 internally
  });

  it("wrong current password: 401 and nothing changes", async () => {
    const adaId = await createAccount("ada@example.test");
    const a1 = await device("ada@example.test");
    const a2 = await device("ada@example.test");
    const hashBefore = (await db("accounts").where({ id: adaId }).first()).password_hash;

    const res = await changePassword(a1, { currentPassword: "not my password at all", newPassword: NEW });

    assert.equal(res.status, 401);
    assert.equal((await db("accounts").where({ id: adaId }).first()).password_hash, hashBefore);
    assert.equal(await isSignedIn(a2), true);
  });

  it("rejects a short new password with 400 naming the field", async () => {
    await createAccount("ada@example.test");
    const a1 = await device("ada@example.test");
    const res = await changePassword(a1, { currentPassword: OLD, newPassword: "short" });
    assert.equal(res.status, 400);
    assert.ok(res.body.error.details.some((d) => d.field === "newPassword"));
  });
});
```

Redaction unit test, `test/unit/logger-redaction.test.js`. It uses the real redaction list with an in-memory destination:

```javascript
import { it } from "node:test";
import assert from "node:assert/strict";
import { Writable } from "node:stream";
import pino from "pino";
import { loggerOptions } from "../../src/lib/logger.js";

it("never writes cookies, set-cookie, or passwords", () => {
  let out = "";
  const sink = new Writable({ write(chunk, _enc, cb) { out += chunk; cb(); } });
  const log = pino(loggerOptions, sink);

  log.info({
    req: { headers: { cookie: "eb.sid=s%3AREQSECRET" }, body: { password: "hunter2hunter2" } },
    res: { headers: { "set-cookie": "eb.sid=s%3ARESSECRET; Path=/; HttpOnly" } },
  }, "auth.password.changed");

  assert.doesNotMatch(out, /REQSECRET|RESSECRET|hunter2/);
  assert.match(out, /\[redacted\]/);
});
```

Two notes on the sketch. `sidOf` reads supertest's cookie jar (the `cookiejar` package that superagent uses). If your version exposes the jar differently, assert instead that the `Set-Cookie` header on the password-change response carries a new `eb.sid`. And `isSignedIn` relies on lesson 05's `requireAuth` returning `401` JSON to an `Accept: application/json` request.

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Session security | Other sessions survive, or the current one is not regenerated | Others revoked, current regenerated, other accounts untouched | Design note justifies each choice and covers the "sign out everywhere else" button |
| Layering | Session SQL in a route or service | Single repository owns `user_sessions` access; regenerate stays in the route | Transaction boundary documented; layer check extended to `user_sessions` |
| Tests | Status-only assertions | Every acceptance criterion has an assertion against database state | Each test seen to fail against the teammate's patch or a deliberate break (recorded) |
| Logging and redaction | Secrets appear in logs | Five auth events, redaction unit test passes | Log lines include the counts needed to diagnose DEF-311 without reading code |
| Diagnosis method | Read the patch first, guessed | Symptom → observation → hypothesis → test, written down with `jq` evidence | Identified the blast radius (number of accounts affected) from logs alone |
| Reporting | Narrative report | Six-part DEF-311 plus escalation under 120 words | Incident note proposes an alert that would have fired at 10:42 |

## Stretch goals

- Show the user a list of their active sessions (created time, last seen, user agent) with a per-session "sign out" button. Store user agent and created time in the session at login.
- After a password change, send a "your password was changed" notice. Stub the mailer behind an interface and assert it was called. Do not build mail infrastructure (lesson 03's R-05 reasoning applies).
- Add a `CHECK` that only `sessions.repository.js` and connect-pg-simple touch `user_sessions`, by extending `check:layers`.

## Reflection prompts

- Why does the route, not the service, call `req.session.regenerate`? What would break if the service took `req`?
- In the incident, which single log field told you the most, and did you log it in your own version?
- What would a per-account `sessionsRevoked` alert threshold look like, and what false positives would it raise?

## Instructor notes (common pitfalls, how to adapt for time)

- **Generating the incident materials.** Create `teammate.patch` by changing the repository query to `.whereRaw("sess->>'userId' = ? OR sid <> ?", [accountId, keepSid]).del()`. That is the classic `AND`/`OR` slip: it deletes every session except the caller's. Run a seeded staging copy with about 300 signed-in test accounts generating traffic, have one account change its password at 10:42, and capture the pino output. The log should show `auth.password.changed` with `sessionsRevoked` in the hundreds, followed by a wall of `401`s across many `userId`s. Keep the `reqId` of the password change visible.
- **What good diagnosis looks like:** `jq 'select(.res.statusCode == 401) | .time' | head -1` gives the onset. `jq 'select(.msg == "auth.password.changed")'` near that time gives the trigger. Comparing `sessionsRevoked` with the account's own session count reveals the blast radius. Only then is the patch read to confirm.
- **Pitfall: deleting by `sid` from the cookie in the service.** The service should receive the current sid as a plain value from the route, not read the cookie.
- **Pitfall: forgetting connect-pg-simple's JSON shape.** Learners who stored `req.session.user = {...}` instead of `userId` need `sess->'user'->>'id'`. Have them check the actual row first, which is lesson 08's "query the actual row before reading any code".
- **Pitfall: `json` vs `jsonb`.** `->>` works on both. An index on `(sess->>'userId')` only matters at scale. Mention it, don't require it.
- **Short on time (4 hours):** Part A with the first three tests and the redaction test, then Part B as a 30-minute guided `jq` walkthrough.
- **Assessment link:** Part B is a good formative rehearsal for lesson 09's D11 (defect closed with a failing-first test).
