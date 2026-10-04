---
lesson_id: node200-02
course_id: node200
pathway: software-developer
title: Structuring an Express Application
order: 2
kind: lesson
competency_ids:
  - D5-S1-C02
  - D2-S1-C02
objectives:
  - Structure an Express application into modules with clear responsibilities
---

## When one file stops being enough

The events board you finished in node101 works. It renders pages, answers a JSON API, logs requests, and handles its own errors. It is also somewhere around three hundred lines in a single `server.js`, and that is roughly where every Express application starts to go wrong.

The failure is not dramatic. Nothing crashes. What happens instead is a slow accumulation of symptoms, and you should learn to recognise them because they are your signal to restructure:

- **You scroll to find things.** Adding a route means reading past forty routes to work out where it belongs, and two routes for the same resource end up two hundred lines apart.
- **Editing one feature risks another.** A shared helper near the top of the file is used by six handlers, and you cannot change it without checking all six.
- **You cannot test anything without starting a server.** Every piece of logic is inside a route handler, and every route handler needs a live HTTP request to run. There is nothing you can call directly.
- **Merges conflict constantly.** Two people adding unrelated features both edit `server.js`, and git has no idea their changes are independent.
- **Nobody can tell you where a rule lives.** "Where do we check that an event has not already started?" has no answer, because the check exists in three handlers with three slightly different versions.

Structure is the fix, and structure means one thing: every piece of code has an obvious home, and the homes have rules about who may call whom. This lesson is about drawing those boundaries deliberately — writing them down before you move a line of code — because the boundaries you draw here are where persistence, authentication, validation, and tests all get placed for the rest of this course.

## The three responsibilities in every web service

Almost every request your service handles does the same three kinds of work, and almost every maintainable structure separates them:

**HTTP work.** Read the request, pull values out of the path, query string, body, and cookies. Decide a status code. Serialize a response. This layer knows what `req` and `res` are and is allowed to care about status codes and headers.

**Decision work.** Apply the rules the business actually cares about: an event cannot be created in the past, a registration cannot exceed capacity, only the organizer may cancel. This layer knows nothing about HTTP. It takes plain JavaScript values, returns plain JavaScript values or throws, and would work identically if the service were a command-line tool.

**Storage work.** Get rows out of a database and put rows into it. This layer knows SQL and table names and nothing else — not status codes, not business rules.

Give those three a name each and you have the layout used by most of the Express codebases you will join:

```text
src/
├── config/          # environment reading, one place
├── routes/          # HTTP layer: express.Router per resource
├── services/        # decision layer: business rules
├── repositories/    # storage layer: queries
├── middleware/      # cross-cutting request handling
├── errors/          # shared error types
├── views/           # templates
├── app.js           # builds and returns the Express app
└── server.js        # reads config, starts listening
```

The single most important property of that list is not the folder names. It is the **direction of dependency**:

```text
routes  →  services  →  repositories
```

A route may import a service. A service may import a repository. Nothing points back up the arrow. A repository never imports a service; a service never imports a route, and never touches `req` or `res`. If you only enforce one rule from this lesson, enforce that one, because everything else in the course depends on it. A service with no HTTP in it can be unit-tested with a function call. A repository with no rules in it can be swapped for a fake. A route with no rules in it is a five-line function nobody argues about.

![The dependency direction between route, service, and repository modules in an Express application, with arrows pointing only downward and the HTTP request entering at the top](./img/express-layer-boundaries.png)

The arrow also tells you where a new piece of code goes. Ask: does this need `req`? Then it is HTTP work. Does it need to know a table name? Then it is storage work. Everything else is a decision, and decisions live in services.

### Layers or features?

There is a second way to slice the same code — by feature rather than by layer:

```text
src/
├── events/
│   ├── events.routes.js
│   ├── events.service.js
│   └── events.repository.js
├── organizers/
└── registrations/
```

Both layouts are defensible and you will meet both. Layer-first (`routes/events.js`) makes the architecture obvious at a glance and is easier for a newcomer to navigate; feature-first keeps everything about one resource in one directory, which means adding a feature touches one folder and deleting one is a `rm -rf`. Feature-first scales better past about a dozen resources.

The rule is: **pick one, write down which one, and do not mix them.** A codebase with `src/services/` *and* `src/events/services/` is worse than either choice made consistently. This course uses layer-first because there are only a handful of resources and the layers are what you are learning to see. If a workplace codebase you join is feature-first, the dependency rule above is unchanged — only the folder nesting differs.

## Splitting the HTTP surface with routers

`express.Router()` is a mini-application: it holds routes and middleware, it has the same `.get`/`.post`/`.use` methods as `app`, and it is mounted at a path prefix. It is the tool that lets each resource own a file.

Here is the events board's HTTP surface as a router, in `src/routes/events.routes.js`:

```javascript
import { Router } from "express";
import * as eventService from "../services/events.service.js";

export const eventsRouter = Router();

eventsRouter.get("/", async (req, res) => {
  const events = await eventService.listUpcoming();
  res.render("events/index", { events });
});

eventsRouter.get("/:id", async (req, res, next) => {
  const event = await eventService.getById(req.params.id);
  if (!event) return next();
  res.render("events/detail", { event });
});

eventsRouter.post("/", async (req, res) => {
  const created = await eventService.create(req.body);
  res.redirect(303, `/events/${created.id}`);
});
```

A note on that last line: `res.redirect` always sets its own status — 302 unless you pass one — so writing `res.status(201).redirect(...)` silently throws the 201 away. For a browser form, `303 See Other` is the honest status: "the thing was created; now GET this page." That pattern is called Post/Redirect/Get, and it is why refreshing the page afterwards does not resubmit the form. A JSON API would instead answer `res.status(201).json(created)`.

Three things in there are worth naming.

**The paths are relative to the mount point.** The router says `/` and `/:id`; it does not say `/events`. Where it lives in the URL space is decided by whoever mounts it, in `app.js`. That is what makes a router portable: you can move the whole resource from `/events` to `/api/v2/events` by changing one line, and you can mount the same router twice if you ever need to.

**The handlers are thin.** Each one reads input, calls exactly one service function, and chooses a response. There is no rule in them. When a handler grows past about ten lines, something that belongs in the service has leaked upward.

**`next()` with no argument means "no match here".** Calling `next()` in the `/:id` handler when the event does not exist falls through to the 404 handler you registered at the end of the stack, rather than duplicating a not-found response in every route. Passing a value — `next(err)` — jumps to the error handler instead. Both were in node101; what is new is that routers participate in the same chain.

**Which Express, and which module system, this code assumes.** Every sample in this course uses ES modules (`import`/`export`), so your `package.json` needs `"type": "module"`. The handlers above are `async` with no `try/catch`, which is safe on **Express 5** — `npm install express` gives you 5 today — because Express 5 forwards a rejected promise from a handler to your error handler. On **Express 4** the same code is dangerous: a throw inside an async handler escapes Express entirely. Check `npm ls express` before you start. If you are on 4, lesson 04 shows the pattern you need on every async handler.

Routers can carry their own middleware, which is the tidy way to apply something to one resource only:

```javascript
import { Router } from "express";
import { requireAuth } from "../middleware/require-auth.js";

export const organizersRouter = Router();

organizersRouter.use(requireAuth);          // every route below this needs a session

organizersRouter.get("/dashboard", async (req, res) => { /* … */ });
```

Anything registered with `router.use` runs only for requests that matched the router's mount path, in the order it was registered. `requireAuth` itself is lesson 05's business; what matters now is that the router is the right place to attach it, because "these routes require a login" is a property of this group of routes and of nothing else.

There is also `mergeParams`, which you need exactly when you nest routers:

```javascript
const registrationsRouter = Router({ mergeParams: true });
eventsRouter.use("/:eventId/registrations", registrationsRouter);

registrationsRouter.get("/", async (req, res) => {
  // without mergeParams, req.params.eventId would be undefined here
  const list = await registrationService.listForEvent(req.params.eventId);
  res.json(list);
});
```

Without `mergeParams: true`, a child router only sees the parameters in its own path. Nesting more than two levels deep gets hard to follow; when you want a third, it is usually a sign the resource deserves a top-level mount of its own.

## Separating the app from the server

This is a small change with an outsized payoff. Split the file that *builds* the application from the file that *runs* it.

`src/app.js` — builds and returns, never listens:

```javascript
import express from "express";
import morgan from "morgan";
import { eventsRouter } from "./routes/events.routes.js";
import { healthRouter } from "./routes/health.routes.js";
import { notFound } from "./middleware/not-found.js";
import { errorHandler } from "./middleware/error-handler.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("view engine", "ejs");

  app.use(morgan("combined"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static("public"));

  app.use("/healthz", healthRouter);
  app.use("/events", eventsRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
```

`src/server.js` — the only file that knows about ports and signals:

```javascript
import process from "node:process";
import { createApp } from "./app.js";
import { config } from "./config/index.js";
import { logger } from "./lib/logger.js";

const app = createApp();

const server = app.listen(config.port, () => {
  logger.info({ port: config.port, env: config.env }, "server started");
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM received, closing server");
  server.close(() => process.exit(0));
});
```

Why bother? Because `createApp()` returns a fully wired application that is **not listening on a port**. That is exactly what an HTTP test needs — lesson 07 will call `createApp()` and drive it directly, with no port, no cleanup, and no chance of two test files fighting over 3000. It also means anything that must happen before the app exists (reading config, opening a database pool) has an obvious place: `server.js`, above the `createApp()` call.

Note the order of `app.use` calls in `createApp`. Express runs middleware in registration order, so the stack reads top to bottom: logging first so every request is recorded even if it later fails, body parsing before any route that needs `req.body`, static files before routers so a real file wins over a route, then the routers, then the catch-all 404, then the error handler last. The error handler must be registered after everything it is expected to catch — that is not a style preference, it is how the chain works.

## Configuration in one place

Scattering `process.env.X` through the codebase creates a service whose requirements nobody can enumerate. Read the environment once, in one module, and validate it there:

```javascript
// src/config/index.js
import process from "node:process";

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const config = {
  env: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: required("DATABASE_URL"),
  sessionSecret: required("SESSION_SECRET"),
  logLevel: process.env.LOG_LEVEL ?? "info",
};
```

Three properties make this worth a whole module. It **fails fast**: a missing `DATABASE_URL` crashes at startup with a clear message rather than producing a confusing connection error twenty minutes into a shift. It **coerces at the boundary**: `port` is a number everywhere downstream, because environment variables are always strings. And it **documents itself**: this file plus `.env.example` is the complete list of what the service needs to run, which is the first thing anyone deploying it will ask you for.

The `databaseUrl` and `sessionSecret` lines show where the module ends up. You add them in lessons 04 and 05, when there is a database and a session to configure. Leave them out today, or the service will refuse to start for want of a value it does not use yet.

Everything below `config/` imports `config`, never `process.env`. One grep for `process.env` outside `src/config/` and `src/server.js` tells you whether the rule is holding.

## Designing the modules before you move the code

Here is where the structural work becomes a design task rather than a filing task. Before you cut a large file into modules, write down what each module is *for* and what it *exposes*. On a real team this is the artifact a senior engineer reviews — it is far cheaper to correct a boundary on half a page than after a day of moving files.

A module design note does not need to be long. For each module, record four things: its responsibility in one sentence, the functions it exports with their inputs and outputs, what it is allowed to depend on, and what it explicitly does not do.

```markdown
## Module: services/events.service.js

Responsibility: applies the rules governing events — what may be created,
what may be changed, and which events are visible to the public.

Exports:
  listUpcoming({ limit, offset }) -> Promise<Event[]>
      Events with startsAt in the future, soonest first.
  getById(id) -> Promise<Event | null>
  create(input) -> Promise<Event>
      Throws ValidationError when startsAt is in the past.
  cancel(id, actorId) -> Promise<Event>
      Throws NotAuthorizedError when actorId is not the organizer.

Depends on: repositories/events.repository.js, errors/
Does NOT: read req/res, choose status codes, write SQL, render views.
```

The "does NOT" line does more work than it looks like. Most boundary violations happen because someone in a hurry could not tell whether a thing was allowed, and an explicit prohibition answers that in two seconds.

Alongside the modules, write down the **data model** the modules pass around — the shape of the objects crossing each boundary — even before there is a database:

```markdown
## Entity: Event

id           string (uuid)
title        string, 1..120 chars
description  string, optional
startsAt     ISO-8601 timestamp, must be in the future at creation
venue        string, 1..120 chars
capacity     integer >= 0, 0 means unlimited
organizerId  string (uuid), references Organizer.id
createdAt    ISO-8601 timestamp
```

That table is what lesson 04 turns into a migration and lesson 06 turns into a validation schema. Writing it now, in the design note, is what makes those lessons a transcription job rather than a fresh set of decisions. It is also the artifact you hand to a reviewer when you want the design checked — "here is the shape of an Event and here is who is allowed to change it" is a reviewable claim, where "I refactored the events code" is not.

Two habits go with it. **Record which names must not change**: if the JSON API already returns `starts_at` to a client you do not control, note that the wire format is fixed even though the internal field is `startsAt`, and put the translation in one place. And **note anything you assumed** rather than knew, so the reviewer can correct the assumption instead of discovering it later in the code.

## Turning a feature into a work plan

Structure is also what makes a feature estimable. Once the modules exist, "add a waitlist" stops being a vague lump of work and becomes a list of specific edits to specific files — which is exactly what a work plan is, and what you will be asked for on any team following a development lifecycle.

The method is mechanical. Take the feature, walk the dependency arrow **bottom-up**, and write down what each layer needs:

**Feature: registrations may join a waitlist when an event is full.**

| # | Layer | Change | Depends on | Est. |
| --- | --- | --- | --- | --- |
| 1 | data model | Add `status` (`confirmed`/`waitlisted`) to Registration | — | 0.5h |
| 2 | repository | `countConfirmed(eventId)`; `insert` accepts `status` | 1 | 1h |
| 3 | service | `register()` returns waitlisted when at capacity | 2 | 2h |
| 4 | service | `cancel()` promotes the earliest waitlisted registration | 3 | 2h |
| 5 | route | `POST /events/:id/registrations` reports which outcome occurred | 3 | 1h |
| 6 | view | Registration page shows waitlist position | 5 | 1h |
| 7 | tests | Unit tests for 3 and 4; integration test for 5 | 3,4,5 | 2h |

That table is small but it does four jobs at once. It **orders the work** so nothing is blocked by something not yet written — bottom-up means each row can be finished and verified before the row above needs it. It **exposes the risky row**: number 4 is where two people cancelling at the same moment could promote the same waitlisted person twice, and naming that now means it gets designed rather than discovered. It **gives an estimate you can defend**, because the number attaches to a named change rather than to a feeling. And it **makes progress reportable**: "rows 1 through 3 are merged, row 4 is in review" is a status a project manager can use, where "about 60% done" is not.

Where this fits in the lifecycle is worth being explicit about, because you will be working inside one. A specification arrives (lesson 03 is entirely about reading one properly). You turn it into a design note and a work plan like the ones above. A senior engineer reviews both before you write code — that review is the cheapest one available, and skipping it is how a week gets spent building the wrong shape. You implement in plan order, keeping each change small enough to review. The tests in the last row are not an afterthought; they are the evidence the plan was completed. Then the work is integrated, verified against the specification, and whatever you learned goes back into the next plan.

Under supervision, your part is to produce the design note and the plan, flag what you are unsure about, and keep the plan honest as reality changes it. A plan that is quietly abandoned in week one is worse than no plan, because now the status you are reporting is fiction. When row 3 turns out to be twice the size you thought, update the row and say so.

## Making the boundaries hold

A structure that is not enforced decays back into one file, just spread across more of them. Three cheap defences:

**Test the direction.** A repository that imports a service is a bug you can detect with a grep in a script:

```bash
if grep -rn "from \"\.\./services" src/repositories/; then echo "LAYER VIOLATION"; exit 1; fi
```

Write it as an `if`, not as `grep ... && echo ... && exit 1`. `grep` exits with status 1 when it finds *nothing*, so the `&&` version exits 1 on a clean codebase and your check fails exactly when everything is fine. The `if` form fails only when a match is printed. If you put it in `package.json` as `check:layers`, escape the inner quotes for JSON, or move the line into `scripts/check-layers.sh` and run that instead.

**Watch for the leaks.** The two most common are a service that takes `req` as a parameter — usually because someone wanted `req.user`, and the fix is to pass the actor id instead — and a route handler that contains an `if` about business rules rather than about HTTP.

**Keep index files honest.** A barrel file (`src/services/index.js` re-exporting everything) is convenient and quietly encourages circular imports, because now every service can reach every other service by importing the barrel. In ESM a cycle does not always crash; it can hand you an `undefined` binding at call time, which is a genuinely nasty afternoon. Import the specific module you need, by its full path with the `.js` extension — ESM requires the extension, and omitting it is the single most common error when moving a CommonJS codebase across.

One last note on scope. The repository layer in this lesson is a boundary, not an implementation. If you refactor today, `repositories/events.repository.js` can perfectly well keep the in-memory array from node101 behind the same function signatures — `findAll`, `findById`, `insert`. That is the point of drawing the line first: lesson 04 replaces the body of those functions with real SQL, and if the boundary is honest, nothing above it changes at all.

## Practice

Restructure the events board from node101 into modules, and produce the design artifacts that go with it. Work on a branch so the before and after can be compared.

1. Create the directory layout: `src/config/`, `src/routes/`, `src/services/`, `src/repositories/`, `src/middleware/`, `src/errors/`. Write a one-paragraph `ARCHITECTURE.md` at the repo root stating that the project is layer-first and that dependencies run routes → services → repositories, never upward.
2. Extract `src/config/index.js` reading `PORT`, `NODE_ENV`, and `LOG_LEVEL` from the environment, coercing the port to a number and throwing on anything required and missing. Update `.env.example` to match. Confirm `grep -rn "process.env" src/ --include="*.js"` reports hits only in `config/` and `server.js`.
3. Split `server.js` into `src/app.js` exporting `createApp()` and `src/server.js` doing config, listen, and `SIGTERM`. Confirm `node src/server.js` still serves every route it served before.
4. Move every event route into `src/routes/events.routes.js` as an `express.Router`, mounted at `/events` in `app.js`. Move the health route into its own router mounted at `/healthz`. No route paths in the router may begin with `/events`.
5. Create `src/repositories/events.repository.js` exporting `findAll()`, `findById(id)`, and `insert(event)` — still backed by the in-memory array for now — and `src/services/events.service.js` exporting `listUpcoming()`, `getById(id)`, and `create(input)`. Move every rule (date checks, sorting, filtering) out of the handlers and into the service. Each route handler should end up under ten lines.
6. Write a design note in `docs/design-notes.md` covering all three of your new modules in the four-part format from this lesson (responsibility, exports with signatures, allowed dependencies, explicit "does NOT"), plus the `Event` entity table with types and constraints. Have a peer read it and mark any boundary they find ambiguous.
7. Add `src/middleware/not-found.js` and `src/middleware/error-handler.js`, registered last in `createApp()` in that order. Verify with `curl -i` that an unknown path is a 404 and a deliberately thrown error is a 500.
8. Add the layer-violation grep from this lesson as a `npm run check:layers` script. Deliberately add an import of a service inside a repository, prove the script fails, then remove it.
9. Write a work plan, as a table in the format above, for adding a `capacity` field to events and refusing registration when it is reached. Order the rows bottom-up, note dependencies and estimates, and mark the row you consider riskiest with one sentence explaining why.
10. Write a short `NOTES.md` entry answering: which file would you edit to change the JSON shape returned to clients, which to change the rule about which events are public, and which to change where the data is stored? If any answer is "more than one file", the boundary is wrong — fix it before you finish.

**Deliverable:** a branch in which `src/server.js` is under thirty lines, every route lives in a router, every rule lives in a service, and `ARCHITECTURE.md`, `docs/design-notes.md`, and the capacity work plan are committed alongside the code.

## Check your understanding

1. A new function needs to know whether the signed-in user is the event's organizer before allowing an edit. Which layer does it belong in, and what should the route pass to it instead of `req`?
2. Why does `createApp()` return the app without calling `listen`? Name one thing that becomes possible because of it.
3. Your `check:layers` script reports a violation: `src/repositories/events.repository.js` imports `../services/events.service.js`. What rule is broken, and what is the usual fix?
4. A teammate registers the error handler *before* `app.use("/events", eventsRouter)`. What happens to an error thrown inside an events route, and why?

**Answers**

1. The service, because it is a decision about a business rule. The route passes the actor's id (for example `req.currentUser.id`) as a plain value, so the service never sees HTTP.
2. So tests (and anything else) can get a fully wired application without binding a port. Lesson 07's supertest tests drive `createApp()` directly, with no port conflicts and nothing to shut down.
3. Dependencies must point only downward: routes → services → repositories. The fix is usually to move the logic the repository wanted into the service, which then calls the repository.
4. The error handler never sees it. Express runs middleware in registration order, so an error passed on by a later router finds no error handler after it and falls through to Express's default handler.
