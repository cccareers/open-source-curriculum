---
course_id: node200
title: "Intermediate Express JS — Enhancement Review"
reviewed_lessons: 9
status: draft
---

## Summary

node200 is a strong, unusually coherent course. One running example, the events board (events, organizers/accounts, registrations, the K. Osei support contact, SRS section 3.4 and then 4.7), carries all nine lessons. The prose is direct and concrete, and every lesson ends in a practice list that produces committed evidence. The biggest opportunity is technical accuracy at the seams. A few code samples will fail or mislead when run exactly as printed: the layer-check script always fails, `returnTo` is lost after `regenerate`, the composite rate-limit key doesn't do what the text claims, the error handler turns body-parser 413/400 errors into 500s, and the test helper inserts camelCase columns. The course also needs to say which Express major version it targets. Its claim that an unhandled async rejection makes "the request hang" is out of date on Node 15+, where the default is a process crash. No lesson had a "Check your understanding" block.

## Clarity issues

| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| node200-02 | "Splitting the HTTP surface with routers" | The code uses async handlers with no `try/catch` and ESM `import`. The lesson never says this needs Express 5 and `"type": "module"`. On Express 4 the handlers crash the process when they throw. | Add a short "which Express this assumes" paragraph that points to lesson 04 for the Express 4 pattern. | Applied |
| node200-02 | "Splitting the HTTP surface with routers" | `res.status(201).redirect(...)`: `res.redirect` sets its own status (302 by default), so the 201 is silently discarded and misleads the reader. | Change to `res.redirect(303, ...)` and explain Post/Redirect/Get in one sentence. | Applied |
| node200-02 | "Configuration in one place" | The config sample requires `DATABASE_URL` and `SESSION_SECRET`, which don't exist until lessons 04/05. Practice step 2 (correctly) asks only for PORT/NODE_ENV/LOG_LEVEL. A learner who copies the sample can't start the server. | Add a note saying those two lines arrive in lessons 04 and 05. | Applied |
| node200-02 | "Making the boundaries hold" | `grep ... && echo ... && exit 1` exits non-zero when grep finds **no** match, so `npm run check:layers` fails on clean code and passes nothing useful. | Replace with an `if grep ...; then ...; fi` form and explain why. | Applied |
| node200-03 | "Reading one properly" (3.4.4 analysis) | "95th percentile" / p95 and `autocannon` are used without definition. | Define p95 inline and gloss autocannon as an HTTP load-generation CLI. | Applied |
| node200-04 | "The stack this course uses" | `knexfile.js` imports `dotenv/config`, but the install line omits `dotenv`. The ESM knexfile also depends on `"type": "module"`. | Add `dotenv` to the install line and add one sentence about ESM. | Applied |
| node200-04 | "The repository" | `countConfirmed` is defined in `events.repository.js` but queries `registrations`. That contradicts "one table's worth of queries", and the service later imports it from `registrations.repository.js`. | Add a clarifying sentence after the six-point list. | Applied |
| node200-04 | "Services on top of repositories" | "Express 4 does not catch those, the request hangs ... nothing appears in your logs." On Node 15+ an unhandled rejection crashes the process by default. The hang only happens if something has installed a non-exiting `unhandledRejection` listener. | Correct the paragraph to describe both outcomes. | Applied |
| node200-04 | "Transactions: when two writes must be one" | "calling `db.transaction` inside another ... will deadlock" overstates it. It *can* block forever on a lock the outer transaction holds, and Postgres can't detect that, because the outer transaction is waiting in Node, not in the database. | Reword to "can block ... until a timeout". | Applied |
| node200-05 | "Login, logout, and the session fixation trap" | `res.redirect(req.session.returnTo ?? "/events")` runs **after** `regenerate`, which creates an empty session, so `returnTo` is always undefined. | Capture `returnTo` before regenerating and keep only relative paths. | Applied |
| node200-05 | "Login, logout, and the session fixation trap" | The text says signup must not confirm that an account exists, but the lesson's own `signUp` throws `ConflictError("An account with that email already exists")`. | Add a paragraph naming the trade-off and the enumeration-safe alternative. | Applied |
| node200-05 | "Cross-site request forgery" | `sent.length !== expected.length` compares string lengths. `timingSafeEqual` throws on unequal *byte* lengths (non-ASCII input), and a repeated `_csrf` field parses to an array. Both produce a 500, not a 403. Separately, a global `csrfToken` writes to every session, which quietly defeats `saveUninitialized: false`. | Compare Buffers by byte length after a `typeof` check, and add a note about where to mount `csrfToken`. | Applied |
| node200-05 | "Slowing down the attacker" | One limiter keyed on `ip:email` does **not** stop one attacker spreading across many accounts, or one account being attacked from many addresses, which is what the text claims. Each combination gets its own 10 attempts. | Replace with two limiters (per-IP and per-account) and add `skipSuccessfulRequests`. | Applied |
| node200-05 | "Practice" step 7 | With `saveUninitialized: false` and no CSRF middleware yet (step 10), an anonymous visitor has no cookie, so there is no "before" value to record. | Tell the learner how to create a pre-login session first. | Applied |
| node200-06 | "Schema validation at the edge" | Express 5 makes `req.query` a read-only getter. The `req.validated` convention is the reason the middleware still works, but the lesson doesn't say so. | Add one sentence. | Applied |
| node200-06 | "An error taxonomy that maps to status codes" | The handler maps every non-`AppError` to 500, including body-parser's 413 (too large) and 400 (malformed JSON). That breaks practice step 4. There is also no `res.headersSent` guard. `req.id` is used two lessons before lesson 08 sets it. | Honour `err.status` on exposed 4xx errors, add a `headersSent` guard, and note where `req.id` comes from. | Applied |
| node200-06 | "Practice" step 2 | `curl` sends `Accept: */*`, so `req.accepts("html")` is truthy and the handler renders HTML with no `details` array. The step can't succeed as written. | Tell the learner to send `-H "Accept: application/json"`. | Applied |
| node200-07 | "Unit-testing a service" | The `makeEventsService` sample uses `ValidationError`/`NotFoundError` without importing them. `R-09` doesn't exist in the lesson 03 register (R-01..R-08). | Add the import and explain the id. | Applied |
| node200-07 | "The test database" | `createEvent` spreads `overrides` (which contain `organizerId`/`startsAt`) into a snake_case insert, so Knex tries to write columns `organizerId`/`startsAt` and the insert fails. | Destructure camelCase keys before spreading. | Applied |
| node200-07 | "Integration tests over the real stack" | The `limit=5000` test sends no `Accept` header, so lesson 06's handler renders HTML and `res.body.error` is undefined. | Add `.set("Accept", "application/json")`. | Applied |
| node200-07 | "Testing authenticated routes" | `signedInAgent` and the cancel test ignore lesson 05's CSRF check. If `verifyCsrf` is mounted, login and cancel return 403 `csrf_failed`, not the asserted outcomes. | Add a paragraph and a token-fetch helper. | Applied |
| node200-08 | "Making the service diagnosable" | The redaction list misses the **response** `Set-Cookie` header, so every login logs the new session id and practice step 1 fails. The example log line shows level 30 for a 409, but `customLogLevel` maps 4xx to warn (40). | Add the `res.headers["set-cookie"]` path and correct the level. | Applied |
| node200-08 | "Asking questions of the logs" | `sort_by(-.responseTime)` errors in jq ("null cannot be negated") on any application log line without `responseTime`. | Filter first. | Applied |
| node200-08 | "A field guide to failures" / Practice step 7 | "Unhandled promise rejection ... the request hangs forever" has the same Node 15+ inaccuracy as lesson 04. | Correct the signature and add a note to Fault 3. | Applied |
| node200-02..08 | End of lesson | No "Check your understanding" block. | Add 3–4 questions with answers to each. | Applied |

## Depth and coverage gaps

- **Express version is never pinned** (*Structure an Express application into modules with clear responsibilities*). `npm install express` installs Express 5 as of 2025, but lesson 04's advice is Express 4-centred. The course should state its target in lesson 01/02 and the starter `package.json`. A one-paragraph note was added to lesson 02. A fuller "4 vs 5 differences that bite" sidebar (async errors, `req.query` getter, path-to-regexp v8 wildcard syntax `/*splat`, removed `res.redirect("back")`, `req.body` undefined without a parser) would help learners who join Express 4 codebases.
- **Organizers vs accounts data model drift** (*Separate data access from request handling in a service*). Lesson 04 creates an `organizers` table and `events.organizer_id` references it. Lesson 05 introduces `accounts`. Lesson 07's helpers insert organizers into `accounts` and use their ids as `organizer_id`, which would violate the lesson 04 foreign key. The course never shows the migration that reconciles the two (for example, re-pointing the FK at `accounts`). A short worked migration in lesson 05 would close this.
- **`events.status` column appears without a migration** (*Implement authentication and session handling for a web service*). `cancel()` in lesson 05 writes `status: "cancelled"` and lesson 07 asserts on it, but no migration adds `events.status`.
- **Request id before lesson 08** (*Validate input and assess the quality risks of a feature*). Lesson 06 relies on `req.id`, which only exists after pino-http is added in lesson 08. A note was added. A two-line `crypto.randomUUID()` middleware in lesson 06 would be cleaner.
- **CSRF and the test suite** (*Test a service at unit and integration level and report progress*). The course never shows an end-to-end test of a CSRF-protected form. A helper was added in lesson 07. Supplementary project x01 exercises it.
- **Session store and connection budget** (*Implement authentication and session handling for a web service*). `connect-pg-simple` with `conString` opens its own `pg` pool, separate from Knex's. That costs extra Postgres connections against the "often 100" budget lesson 04 warns about. Worth one sentence, or show passing a shared `pg.Pool`.
- **Sign out everywhere** (*Implement authentication and session handling for a web service*). The checklist mentions it but gives no worked query against `user_sessions.sess`. Project x02 drafts it.
- **Express 4 async wrapper**: lesson 04 mentions `asyncHandler` but never shows it. A five-line example would help anyone on Express 4.
- **Log levels disagree between lessons 06 and 08** (*Troubleshoot a running service from its logs and symptoms*). Lesson 06 logs client errors at `info`; lesson 08's pino-http config logs 4xx at `warn`. Both are defensible. Pick one and say so.
- **Misconception worth naming in lesson 07**: "supertest needs the server running". The lesson implies the answer; an explicit check question was added.

## Proposed additional projects

- **x01 — Door Check-in Desk** (drafted: `projects/01-door-check-in-desk.md`). Organizer-only check-in of confirmed registrations at the venue: a new repository function, an idempotent service rule, zod validation, a risk register, and a node:test + supertest acceptance suite.
- **x02 — Sign Out Everywhere and the Session Incident** (drafted: `projects/02-sign-out-everywhere.md`). Password change that rotates the current session and deletes all other sessions, redacted auth event logging, then a seeded "logged-out users" incident to diagnose from logs and report in DEF format.
- *Not drafted:* **Retention purge job (R-07)**. A `jobs/purge-registrations.js` that deletes registrations 24 months after the event date, with a backdated-row test and a readiness signal for job failure. Maps to *Separate data access from request handling in a service* and *Test a service at unit and integration level and report progress*.
- *Not drafted:* **Requirements register drill on a second SRS extract** (for example "Organizer profile pages"), using peer review only. Maps to *Work from a Software Requirement Specification to record what must be built*.
- *Not drafted:* **Feature-first refactor kata**. Convert the layer-first tree to feature-first while `check:layers` (rewritten for the new layout) and the full suite stay green. Maps to *Structure an Express application into modules with clear responsibilities*.

## Video and animation opportunities

- **When an async route throws: Express 4 vs Express 5** (lessons 04, 08). Screencast. The difference is only visible when you run it: a process crash versus a clean 500 with a request id. **Drafted:** `media/video-01-async-errors-express-4-vs-5.md`.
- **Watching session fixation happen** (lesson 05). Screencast in browser devtools plus a terminal. Cookie values changing (or not changing) across login are invisible in code. **Drafted:** `media/video-02-session-fixation-live.md`.
- **The last seat race** (lessons 04, 07). Explainer animation. Two transactions interleaving, with and without `FOR UPDATE`, is a timing concept learners can't see in a single-user test. **Drafted:** `media/animation-01-the-last-seat-race.md`.
- **One request through the layers** (lesson 02). Explainer animation of a request entering `app.js`, passing the middleware stack in registration order, hitting router, service, then repository, and an error short-circuiting to the error handler. **Drafted:** `media/animation-02-one-request-through-the-layers.md`.
- *Not drafted:* **Reading a requirement like a contract** (lesson 03). Whiteboard. Annotate SRS 3.4 live and pull out the implied prohibitions and the 3.4.4 × 4.2.1 interaction.
- *Not drafted:* **Pool exhaustion from the outside** (lesson 08). Hybrid. A `pg_stat_activity` view filling up with `idle in transaction` next to a latency graph flattening at the acquire timeout.

## Assessment ideas

- **Layer-placement quiz (lesson 02).** Show 10 code snippets (a `res.status` call, a capacity check, a `whereIn` query, a `process.env` read). The learner places each in route, service, repository, or config. Auto-gradable.
- **Requirement-verb sort (lesson 03).** Classify 12 SRS lines as must/should/may/unclear and functional/non-functional.
- **Spot the injection (lesson 04).** Five Knex snippets; identify which are injectable (`raw` with a template literal, unvalidated `orderBy`).
- **Cookie flag rubric (lesson 05).** Given a `Set-Cookie` header, name each missing or weak attribute and the attack it enables.
- **Status-code drill (lesson 06).** Twelve situations mapped to 400/401/403/404/409/413/422/429/500, with the course's stated policy as the key.
- **"Would this test catch it?" (lesson 07).** Present a test and a code mutation; the learner predicts pass or fail, then runs it.
- **Log forensics (lesson 08).** Provide a 2,000-line pino log with one seeded pool-exhaustion incident. Learners submit the `jq` queries, onset time, and a DEF report, graded against the six-part rubric in the lesson.
- **Capstone rubric (lesson 09).** D1–D14 are already gradable one at a time. Add a 3-level scale per D-item (Developing / Meets / Exceeds) so assessors are consistent.

## Changes applied in this pass

- `02-structuring-an-express-application.md`, "Splitting the HTTP surface with routers": replaced `res.status(201).redirect(...)` with `res.redirect(303, ...)` and added an explanation.
- `02-structuring-an-express-application.md`, "Splitting the HTTP surface with routers": added a "which Express and module system this assumes" paragraph (Express 5, `"type": "module"`, pointer to lesson 04 for Express 4).
- `02-structuring-an-express-application.md`, "Configuration in one place": noted that `databaseUrl`/`sessionSecret` arrive in lessons 04/05.
- `02-structuring-an-express-application.md`, "Making the boundaries hold": fixed the layer-check command, which always failed on clean code, and explained the exit-code trap.
- `02-structuring-an-express-application.md`, end: added "Check your understanding" (4 questions).
- `03-working-from-a-requirement-specification.md`, "Reading one properly": defined 95th percentile (p95) at first analytic use.
- `03-working-from-a-requirement-specification.md`, "Acceptance criteria: the definition of done": glossed `autocannon`.
- `03-working-from-a-requirement-specification.md`, end: added "Check your understanding" (4 questions).
- `04-persistence-and-data-access-layers.md`, "The stack this course uses": added `dotenv` to the install line and a note on the ESM knexfile.
- `04-persistence-and-data-access-layers.md`, "The repository": clarified that `countConfirmed` belongs in the registrations repository.
- `04-persistence-and-data-access-layers.md`, "Services on top of repositories": corrected the Express 4 / Node 15+ unhandled-rejection behaviour (crash by default, hang only when a listener swallows it) and showed `asyncHandler`.
- `04-persistence-and-data-access-layers.md`, "Transactions: when two writes must be one": softened "will deadlock" to the accurate "can block until a timeout", with the reason.
- `04-persistence-and-data-access-layers.md`, end: added "Check your understanding" (4 questions).
- `05-authentication-and-session-handling.md`, "Login, logout, and the session fixation trap": captured `returnTo` before `regenerate` and restricted it to relative paths.
- `05-authentication-and-session-handling.md`, "Login, logout, and the session fixation trap": added a paragraph on the signup 409 vs account-enumeration trade-off.
- `05-authentication-and-session-handling.md`, "Cross-site request forgery": made the token comparison byte-length-safe and type-checked, and added a note on where to mount `csrfToken` given `saveUninitialized: false`.
- `05-authentication-and-session-handling.md`, "Slowing down the attacker": replaced the single composite-key limiter with per-IP and per-account limiters and added `skipSuccessfulRequests`.
- `05-authentication-and-session-handling.md`, "Practice" step 7: added how to create a pre-login session so there is a "before" cookie.
- `05-authentication-and-session-handling.md`, end: added "Check your understanding" (4 questions).
- `06-validation-errors-and-quality-risk.md`, "Schema validation at the edge": added a note that `req.validated` also avoids Express 5's read-only `req.query`.
- `06-validation-errors-and-quality-risk.md`, "An error taxonomy that maps to status codes": the error handler now honours exposed 4xx errors from body parsers (413/400) and checks `res.headersSent`. Added a note on where `req.id` comes from before lesson 08.
- `06-validation-errors-and-quality-risk.md`, "Practice" step 2: added the `Accept: application/json` header to the curl instruction.
- `06-validation-errors-and-quality-risk.md`, end: added "Check your understanding" (4 questions).
- `07-testing-and-integration.md`, "Unit-testing a service": added the missing error-class import and explained the `R-09` id.
- `07-testing-and-integration.md`, "Integration tests over the real stack": added an `Accept` header to the 400 test.
- `07-testing-and-integration.md`, "The test database": fixed the `createEvent` factory so camelCase overrides map to snake_case columns.
- `07-testing-and-integration.md`, "Testing authenticated routes": added a paragraph and a `csrfTokenFrom` helper for CSRF-protected routes.
- `07-testing-and-integration.md`, end: added "Check your understanding" (4 questions).
- `08-troubleshooting-a-running-service.md`, "Making the service diagnosable": added the `res.headers["set-cookie"]` redaction path and corrected the example log line's level for a 409.
- `08-troubleshooting-a-running-service.md`, "Asking questions of the logs": made the slowest-requests jq query skip lines without `responseTime`.
- `08-troubleshooting-a-running-service.md`, "A field guide to failures": corrected the unhandled-rejection signature for Node 15+.
- `08-troubleshooting-a-running-service.md`, "Practice" step 7: added a note on crash vs hang depending on Node defaults and listeners.
- `08-troubleshooting-a-running-service.md`, end: added "Check your understanding" (4 questions).

## Open questions for the course owner

- **Course description is mis-mapped.** `course.json` `description` describes JavaScript fundamentals, and `sequencing_rationale` already flags it as "the outline most likely to be wrong". Someone needs to confirm the scope before this course is promoted. Not edited (course.json is out of bounds).
- **Express major version.** Confirm the course targets Express 5 (this pass assumes it in lesson 02's note). If the starter repo pins Express 4, lesson 02's async handlers need the lesson 04 wrapper from the start.
- **`node --test test/` with a directory argument.** Node 20 accepted a directory. Newer Node lines treat positional arguments as glob patterns, and I could not confirm that a bare directory is still searched recursively. A quoted glob (`"test/**/*.test.js"`) is the safe form. Please verify against the Node version the course pins before changing lesson 07's scripts.
- **express-rate-limit version.** v7 introduced `limit` (replacing `max`). Recent major versions validate custom `keyGenerator`s that use `req.ip` and recommend an `ipKeyGenerator` helper for IPv6 subnet handling. I did not verify the exact version or helper name, so the edited lesson 05 code uses `req.ip` directly. Confirm against the version you pin.
- **zod major version.** Lesson 06 uses `z.string().uuid()`, `.strict()`, and `refine(..., { message })`. These still work in Zod 4 but are deprecated there in favour of `z.uuid()`, `z.strictObject()`, and `{ error }`, and Zod 4's uuid check is stricter about variant bits. Pin a version in the starter repo.
- **pino-http `customProps` timing and request-id key.** Lesson 08 reads `req.currentUser` inside `customProps` while registering pino-http first, before sessions load the user. Whether `userId` appears on the completion line depends on when your pino-http version evaluates `customProps`. Also verify that the top-level `reqId` key in the example log line matches your version's output, since `req.id` nested under `req` is the default in some versions.
- **Unvalidated inbound `x-request-id`.** Lesson 08 accepts the header as-is. Consider bounding its length and charset so a client can't inject arbitrary content into every log line.
- **Knex ESM migrations.** `npx knex migrate:make` may generate a CommonJS stub (`exports.up`) even when the knexfile is ESM. Confirm the Knex version's behaviour, or have the starter repo set `migrations.stub`.
- **Lesson 09 "all twelve document deliverables".** I count document-producing items across D1–D14 differently depending on how D3/D13/D14 are read. Consider listing the twelve paths explicitly.
- **Organizers/accounts reconciliation.** Decide whether `events.organizer_id` references `organizers` or `accounts` after lesson 05, and add the migration (see Depth gaps).
- **Assets.** `img/express-layer-boundaries.png` and `img/session-login-flow.png` are referenced but not present in the lessons folder. Animation a02 and video v02 can double as briefs for them.
