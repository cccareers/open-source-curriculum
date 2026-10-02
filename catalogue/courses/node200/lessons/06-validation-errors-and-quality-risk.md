---
lesson_id: node200-06
course_id: node200
pathway: software-developer
title: Validation, Errors, and Quality Risk
order: 6
kind: lesson
competency_ids:
  - D4-S1-C01
objectives:
  - Validate input and assess the quality risks of a feature
---

## Everything from outside is a claim, not a fact

Your service now has a database and a login. That means it has something worth breaking, and the way in is the data it accepts.

Every value arriving from outside the process is a **claim** made by a stranger: a path parameter, a query string, a form field, a JSON body, a header, a cookie, an uploaded filename, a response from another service. None of it is validated by HTTP, by Express, or by JavaScript. `req.body` is whatever bytes the client sent, parsed as JSON — it can be `null`, an array, an object with three hundred keys, a string where you expected a number, or a number so large it loses precision.

Two habits follow. **Validate at the boundary**, once, converting a claim into a value you have checked, before it reaches any rule. And **never trust the client's copy of a fact you already know**: an id in a hidden form field saying which account owns this event is a suggestion, not information, and the authoritative version is in your session and your database.

The second half of this lesson is about the same problem viewed from the other end. Validation is one **control** against one class of failure. Before you build a feature, someone has to ask what else could go wrong with it, how likely each thing is, how badly it would hurt, and what control catches it — a test, a constraint, a limit, an alert. That is quality risk assessment, and on a team you will be asked to contribute to it for your own features.

## Three layers, each doing a different job

Validation is not one check in one place. A well-built service validates three times, deliberately, and the three are not redundant:

**Shape validation at the edge.** Is this request even the right kind of thing? Right fields present, right types, plausible ranges, unknown fields rejected. Fails with `400` and a message naming the field. Knows nothing about your data.

**Rule validation in the service.** Given data that is the right shape, is this operation allowed *now*? The event is in the future, the capacity is not exceeded, the actor owns the record. Fails with `409` or `403` and a message about the situation. Requires reading the database.

**Constraints in the database.** Regardless of what any code does, these facts hold: no null title, no duplicate registration, no event pointing at a non-existent organizer. Fails with a Postgres error code you translate.

The reason to keep all three is that each catches what the others cannot. Edge validation cannot know the event is full. Service rules cannot survive a concurrent request or a script that bypasses the API. Database constraints cannot produce a helpful message about which of eight fields was wrong. Drop any one and something eventually gets through.

## Schema validation at the edge

Hand-written checks (`if (!req.body.title) …`) do not scale: they are inconsistent between routes, they drift from the actual rules, and they produce a different error format everywhere. Use a schema library. This course uses **zod**, because the schema and the type live in one declaration and the parse result is a clean value.

```bash
npm install zod
```

```javascript
// src/schemas/events.schema.js
import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  description: z.string().trim().max(5000).optional(),
  startsAt: z.coerce.date().refine((d) => d > new Date(), {
    message: "startsAt must be in the future",
  }),
  venue: z.string().trim().min(1).max(120),
  capacity: z.coerce.number().int().min(0).max(100000).default(0),
}).strict();

export const listEventsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  sort: z.enum(["startsAt", "title", "createdAt"]).default("startsAt"),
});
```

Several deliberate choices there.

**`.strict()` rejects unknown keys.** The default is to strip them silently, which is safe but quiet; strict mode turns a client sending `{"title": "…", "organizerId": "…"}` into a `400` rather than a mystery. It also catches typos — `capcity` fails loudly instead of defaulting to zero.

**`z.coerce` at the edges where everything is a string.** Query parameters and form fields arrive as strings always: `?limit=20` is `"20"`. Coerce once, at the boundary, and every layer below has real types. This is the same principle as the config module in lesson 02.

**Bounds on everything, including the ones that feel unnecessary.** `max(120)` on a title and `max(100)` on a page size are not cosmetic. Without them a client can send a ten-megabyte title or ask for a million rows, and both are availability problems rather than correctness problems. Pair this with a body size limit on the parser itself: `express.json({ limit: "100kb" })`.

**Defaults belong in the schema.** `capacity` defaulting to 0 and `limit` to 20 means downstream code never handles `undefined`, which removes a whole category of `if` statements.

Then one middleware applies any schema to any part of the request:

```javascript
// src/middleware/validate.js
import { ValidationError } from "../errors/index.js";

export function validate(schema, source = "body") {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const details = result.error.issues.map((i) => ({
        field: i.path.join(".") || source,
        message: i.message,
      }));
      return next(new ValidationError("Request validation failed", details));
    }
    req.validated = { ...req.validated, [source]: result.data };
    next();
  };
}
```

```javascript
eventsRouter.post(
  "/",
  requireAuth,
  validate(createEventSchema),
  async (req, res, next) => {
    try {
      const event = await eventService.create(req.validated.body, req.currentUser.id);
      res.status(201).json(event);
    } catch (err) { next(err); }
  },
);
```

Note that the handler reads `req.validated.body`, not `req.body`. Assigning the parsed result to a new property rather than overwriting `req.body` means a handler that reads the raw body is visibly doing so, and a route with no `validate` in its chain cannot accidentally look validated. Make that a convention and it is greppable: any service call taking `req.body` directly is a review comment.

`safeParse` rather than `parse` keeps the failure a value rather than an exception, so you control the error type that reaches your handler. And note that **validation failures are not logged as errors** — a `400` is the client's problem, not yours. Logging them at error level trains everyone to ignore the error log, which matters in lesson 08.

Two more inputs need attention because they are easy to forget. Path parameters are user input too: `/events/:id` with a uuid column will throw a Postgres cast error on `/events/banana` unless you validate the format first — a `z.string().uuid()` on `req.params` turns a `500` into a `400`. And output needs escaping, not just input: a title containing a script tag is fine to store and dangerous to render, which is why the template engine's escaping default (`<%= %>` in EJS, not `<%- %>`) must never be switched off for user data.

## An error taxonomy that maps to status codes

Lesson 04's services throw `NotFoundError`, `ConflictError`, `ForbiddenError`. It is time to define them properly, because a consistent error model is what lets one handler at the end of the stack produce every error response in the service.

```javascript
// src/errors/index.js
export class AppError extends Error {
  constructor(message, { status, code, details = null, expose = true } = {}) {
    super(message);
    this.name = new.target.name;
    this.status = status;
    this.code = code;
    this.details = details;
    this.expose = expose;   // may this message be shown to the client?
    Error.captureStackTrace?.(this, new.target);
  }
}

export class ValidationError extends AppError {
  constructor(message, details) {
    super(message, { status: 400, code: "validation_failed", details });
  }
}
export class AuthError extends AppError {
  constructor(message) { super(message, { status: 401, code: "unauthenticated" }); }
}
export class ForbiddenError extends AppError {
  constructor(message) { super(message, { status: 403, code: "forbidden" }); }
}
export class NotFoundError extends AppError {
  constructor(message) { super(message, { status: 404, code: "not_found" }); }
}
export class ConflictError extends AppError {
  constructor(message) { super(message, { status: 409, code: "conflict" }); }
}
```

The service throws these; **only** the error handler knows they map to HTTP:

```javascript
// src/middleware/error-handler.js
import { AppError } from "../errors/index.js";
import { logger } from "../lib/logger.js";

export function errorHandler(err, req, res, _next) {
  const isKnown = err instanceof AppError;
  const status = isKnown ? err.status : 500;

  if (status >= 500) {
    logger.error({ err, requestId: req.id, path: req.originalUrl }, "unhandled error");
  } else {
    logger.info({ code: err.code, requestId: req.id, path: req.originalUrl }, "request rejected");
  }

  const body = {
    error: {
      code: isKnown ? err.code : "internal_error",
      message: isKnown && err.expose ? err.message : "Something went wrong",
      ...(isKnown && err.details ? { details: err.details } : {}),
      requestId: req.id,
    },
  };

  if (req.accepts("html") && !req.originalUrl.startsWith("/api")) {
    return res.status(status).render("error", { status, message: body.error.message, requestId: req.id });
  }
  res.status(status).json(body);
}
```

Four properties of that handler are the ones worth defending in review.

**Unknown errors become `500` with a generic message.** A `TypeError` from your own code must never reach the client as text. Stack traces, file paths, SQL fragments, and dependency versions are all reconnaissance, and the message that would help you is in the log, not the response.

**Every response carries a request id.** The user reports "it said something went wrong, id `a3f9c…`", and you find that exact request in the logs. This single habit converts unusable bug reports into precise ones, and lesson 08 builds on it.

**Client errors are logged at info, server errors at error.** The error log should contain only things that are your fault. Anything else and it becomes noise nobody reads.

**The response shape is the same everywhere.** One `error` object with `code`, `message`, optional `details`, and `requestId`. A machine-readable `code` matters more than the message: clients should branch on `"conflict"`, never on English prose you may reword.

Choosing the right status is a design decision. Use `400` for a malformed or unparseable request and `422` if you distinguish "well-formed but semantically invalid" — either is defensible; pick one and apply it consistently, and write down which. Use `401` for "no valid identity" and `403` for "identity fine, not permitted". Use `404` when the thing does not exist, and also when it exists but the caller has no right to know that. Use `409` for a conflict with current state — already registered, event full, version out of date. Use `429` when a limiter fired. Reserve `5xx` for your own faults, so that a spike in `5xx` genuinely means something is broken.

One more piece completes the chain: translating driver errors at the repository boundary, so no Postgres code ever escapes into a handler.

```javascript
const PG_UNIQUE_VIOLATION = "23505";
const PG_FOREIGN_KEY_VIOLATION = "23503";

try {
  return await db("registrations").insert(row).returning(COLUMNS);
} catch (err) {
  if (err.code === PG_UNIQUE_VIOLATION) throw new ConflictError("Already registered for this event");
  if (err.code === PG_FOREIGN_KEY_VIOLATION) throw new NotFoundError("That event does not exist");
  throw err;
}
```

## Quality risk: asking what could go wrong before it does

A feature can be correct on the happy path and still be a bad feature. Quality risk assessment is the discipline of naming the ways it can fail *before* it ships, deciding which of those matter, and attaching a control to each one that does. On a team, this typically happens in a short session with a senior engineer or a QA lead before implementation starts; your job as an apprentice is to arrive with a first draft rather than an empty page.

The generative step is a set of prompts. Take one feature — registration for an event — and walk them:

- **Input:** what if a field is missing, empty, enormous, the wrong type, a negative number, a date in the past, a duplicate, or contains markup or SQL syntax?
- **State:** what if the event is cancelled, already started, full, or deleted between the page load and the submit?
- **Identity:** what if the actor is not signed in, is signed in as someone else, is the organizer, or had their account deleted while the session lived?
- **Concurrency:** what if two requests arrive for the last seat in the same millisecond? What if the same form is submitted twice by a double-click, or by a browser retrying?
- **Dependencies:** what if the database is slow, unreachable, or returns an error mid-transaction?
- **Volume:** what happens at 5,000 registrations on one event? At 100 requests per second?
- **Data lifecycle:** what happens to registrations when the event is deleted? When the account is deleted? When the retention period expires?
- **Non-functional:** is the form usable by keyboard and screen reader? Does the error message make sense to someone who is not you? Does the page still work on a slow connection?

Then score what you found. Two axes, three values each is enough — more precision than that is false precision:

- **Likelihood**: high (will happen weekly), medium (plausible), low (needs unusual circumstances).
- **Impact**: high (data loss, security breach, money wrong, service down), medium (a user is blocked or confused, recoverable), low (cosmetic).

Anything high in both gets designed for now. High in one gets a control. Low in both gets recorded and consciously accepted — which is a legitimate outcome, and writing it down is what distinguishes an accepted risk from an unnoticed one.

```markdown
## Quality risk register — Event Registration (R-01..R-08, SRS 3.4)

| # | Risk | Likelihood | Impact | Control | Verified by | Owner |
| --- | --- | --- | --- | --- | --- | --- |
| QR-1 | Two concurrent requests take the last seat, overselling the event | Medium | High | Row lock in the register transaction plus unique constraint | Integration test: 20 concurrent requests on capacity 5 | me |
| QR-2 | Double-click submits two registrations | High | Medium | Unique constraint on (event_id, attendee_id); form disables on submit | Integration test: two identical POSTs, expect 201 then 409 | me |
| QR-3 | Attendee registers for a cancelled or past event | Medium | Medium | Service checks status and startsAt before insert | Unit test per branch | me |
| QR-4 | Non-organizer views another organizer's attendee list | Low | High | Ownership check in service, 403 | Integration test as other organizer | me |
| QR-5 | Places-remaining count is slow at 5,000 registrations (breaks 4.2.1) | Medium | Medium | Index on (event_id, status); measure before release | Load measurement against seeded data | needs review |
| QR-6 | Registration retained past 24 months (breaks R-07) | High | High | Nightly purge job; monitored | Job test with backdated rows; alert on job failure | not assigned |
| QR-7 | Error message reveals whether an email has an account | Low | Medium | Identical response for all login failures | Test asserting identical body and timing | me |
| QR-8 | Registration succeeds but confirmation email fails silently | Medium | Low | Deferred — R-05 is not in this release | n/a | accepted |
```

Read the columns rather than the rows. **Control** names the specific mechanism, not an intention: "row lock plus unique constraint" is a control, "be careful with concurrency" is not. **Verified by** names the evidence — the test that would fail if the control were removed — which is what makes lesson 07 a matter of transcription. **Owner** is a person, and "not assigned" in that column is itself a finding to raise.

Notice also which rows came from where. QR-5 and QR-6 came out of the *requirements* register from lesson 03, not out of imagining failures — non-functional requirements are risks by construction, because nothing about using the feature once will reveal whether they hold. QR-1, QR-2, and QR-4 came from the concurrency and identity prompts. That is the normal split, and a risk register with no rows traceable to a requirement usually means the specification was skimmed.

### Turning risks into QA requirements

A risk with a control still needs someone to say what "acceptable" means. That statement is a **QA requirement**, and it is written the same way as an acceptance criterion — observable, measurable, checkable by someone other than you:

```text
QA-1 (QR-1)  No event may ever have more confirmed registrations than its capacity.
             Verified by: 20 concurrent registrations against capacity 5 produce
             exactly 5 confirmed rows and 15 rejections with 409.

QA-2 (QR-5)  The event detail page returns in under 800ms at p95 with 5,000
             registrations, measured locally against seeded data before release.

QA-3 (QR-7)  Login failure responses are byte-identical for unknown email and
             wrong password, and mean response times differ by under 20ms
             across 20 samples of each.
```

The difference between a QA requirement and a wish is the "verified by" clause. "Registration should be reliable" cannot be checked. "Exactly 5 confirmed rows" can.

### Reporting it upward

Your risk assessment is a draft for review, and how you present it decides whether it gets used. Three things make it useful to a senior engineer.

**Lead with what you cannot cover.** QR-6 has no owner and QR-5 has no measurement — those two lines are the reason for the conversation. A register presented as complete gets skimmed; a register presented with two explicit gaps gets read.

**Separate what you decided from what you are asking.** "I have covered QR-1 to QR-4 and QR-7 with the controls listed. I need a decision on QR-6 — the purge job is not in the current work plan — and I need help sizing the measurement for QR-5."

**Keep it with the code.** The register lives in `docs/quality/` beside the requirements register, in version control, so it can be reviewed in a pull request and updated when a risk turns out to be real. A risk assessment in a chat message is gone by Thursday.

When a risk does materialise later, come back and mark the row. A register that records "QR-2 occurred in production on 12 May; control was missing from the mobile form" is how a team learns, and it is far more valuable than one that was written once and never touched.

## Practice

Work on the registration feature you have been building, using the requirements register from lesson 03 as the input.

1. Add `zod` and write schemas for creating an event, listing events (query parameters), and registering for an event. Use `.strict()`, coerce numbers and dates, and bound every string and number.
2. Write the `validate` middleware, apply it to at least four routes, and switch those handlers to read `req.validated`. Confirm with `curl` that an unknown field, a missing field, a past `startsAt`, and `limit=5000` each return `400` with a `details` array naming the field.
3. Add a `z.string().uuid()` check on `req.params` for every route with an id. Show the before and after of `curl -i http://localhost:3000/events/banana` in `NOTES.md` — a `500` becoming a `400`.
4. Set `express.json({ limit: "100kb" })` and confirm that a larger body is rejected before your handler runs.
5. Build the full `src/errors/index.js` class hierarchy from this lesson and rewrite the error handler to use it, including request id, HTML-versus-JSON branching, and the generic message for unknown errors.
6. Translate Postgres `23505` and `23503` into `ConflictError` and `NotFoundError` in the registrations repository. Verify that no response body anywhere contains the string `postgres`, a table name, or a stack trace — throw a deliberate `TypeError` from a handler and read the full response.
7. Write down your status-code policy in `docs/design-notes.md`: which situations produce 400, 401, 403, 404, 409, 422, 429, 500. Then audit your routes against it and fix the disagreements.
8. Run the eight risk prompts from this lesson against the registration feature and produce a quality risk register in `docs/quality/registration-risks.md` with at least eight rows, each scored on likelihood and impact, each with a named control and a "verified by".
9. At least two of your rows must trace back to a non-functional requirement from your lesson 03 register, and at least one must be a risk you consciously accept with no control. Mark them.
10. Write three QA requirements in the QA-n format, each citing its risk row, each with an observable verification method and a number.
11. Pick the highest-scoring risk you have not yet controlled and implement the control. Then remove it and demonstrate the failure it prevents, capturing the evidence.
12. Prepare a five-sentence report for a senior engineer covering: what the feature is, which risks you have controlled, which two you need a decision on, and what you are asking for. Have a peer read it and tell you what they would ask next.

**Deliverable:** validated routes with a single consistent error model, a committed `docs/quality/registration-risks.md` with a scored register and QA requirements, your status-code policy, and the demonstration evidence for the control you implemented.
