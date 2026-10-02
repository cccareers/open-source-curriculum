---
lesson_id: node101-05
course_id: node101
pathway: software-developer
title: Middleware and the Request Pipeline
order: 5
kind: lesson
competency_ids:
  - D2-S1-C04
  - D5-S1-C02
objectives:
  - Compose middleware to handle cross-cutting request concerns
---

## What a middleware function actually is

So far the events board has been a set of routes. A request for `/events` arrives, the router matches it, your handler runs, and a response goes back. That works, but it leaves you with no place to put the work that belongs to *every* request rather than to one route: reading a JSON body, writing a log line, timing how long the response took, tagging the request with an id so you can find it in a log file later, refusing a request that is obviously malformed.

You could paste that work into the top of every handler. Do that with eight routes and you now have eight copies of the same four lines, and the copies drift. Express gives you the alternative: middleware.

A middleware function is an ordinary JavaScript function with a specific three-argument signature:

```js
function requestLogger(req, res, next) {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
}
```

`req` is the incoming request object. `res` is the response you can write to. `next` is a callback Express hands you that means "I am done; run whatever comes after me." That third argument is the entire mechanism. A middleware function does not return anything meaningful and Express ignores its return value. What matters is which of exactly three things it does before it finishes:

1. It calls `next()`, and the request continues to the next function in the stack.
2. It sends a response — `res.send`, `res.json`, `res.status(403).end()` — and does **not** call `next()`. The request stops here. Nothing after it runs.
3. It does neither. The request hangs. The browser spins until it times out, your server holds the socket open, and nothing in the logs tells you why.

That third case is the single most common middleware bug, and it is worth burning into memory now: **forgetting `next()` does not "skip" your middleware, it hangs the request.** If a route that used to work stops responding right after you add a middleware, this is almost always the cause.

Note also what is *not* in the signature. There is no return-a-response style, no promise contract that Express awaits, and no automatic error catching. Middleware is a callback chain, and the chain only moves when you move it.

Your route handlers have had this signature all along. `app.get("/events", (req, res) => { ... })` is a middleware function that happens to be filtered by method and path, and that happens to end the chain by sending a response. There is no separate category of "handler" in Express — there are only middleware functions, some of which are mounted at a path with a method filter. Once you see that, the framework gets much smaller.

One more mental model to fix now, because it explains behaviour that otherwise looks like magic. The stack is assembled **once, at startup**, in the order your module executes its `app.use` and `app.get` calls. It is not rebuilt per request. So a middleware registered inside a handler — `app.get("/events", (req, res) => { app.use(somethingElse); ... })` — appends to the stack every time that route is hit, and the application slowly accumulates thousands of copies of the same function. It is a strange thing to write on purpose, but it happens accidentally when registration code ends up inside a callback, and the symptom is a server that gets steadily slower for no visible reason. Registration is setup; keep it at the top level of your module.

The corollary is that a request does not "search" the stack. Express holds an index, and `next()` advances it by one. That is why the walk is strictly forward and why there is no way to go back: once a middleware has run, the request cannot revisit it. Anything that needs to happen both before and after the route has to arrange the "after" part itself, which the next section shows you how to do.

## Order is the whole design

Express keeps one ordered list of middleware, built in the order your file registers them. When a request arrives it walks that list from the top, running each entry whose mount path matches, and stops when something sends a response or the list runs out.

![How Express passes a request through an ordered stack of middleware before it reaches a route handler](./img/middleware-pipeline.png)

This means the order of the lines in `app.js` is not stylistic. It is the design of your service. Two files with identical middleware in different orders are two different systems.

Consider the events board:

```js
import express from "express";
import eventsRouter from "./routes/events.js";

const app = express();

app.use(requestId);          // 1. tag every request
app.use(requestTimer);       // 2. start the clock
app.use(express.json());     // 3. parse JSON bodies
app.use("/events", eventsRouter);  // 4. the resource routes

app.listen(3000);
```

Move `express.json()` below the router and every POST to `/events` suddenly sees `req.body` as `undefined`, because the router responds before the parser ever runs. Move `requestTimer` below the router and it never measures anything, because the router has already sent the response. Move `requestId` to the bottom and your log lines have no id in them.

The rule that follows: **middleware that prepares the request goes above the routes; middleware that reacts to the finished response goes above the routes too, but hooks the response rather than running after it.** Express has no "run after the handler" position in the ordinary sense — once a handler sends, the walk is over. The way you run code after a response is to register a listener while you are still upstream:

```js
function requestTimer(req, res, next) {
  const startedAt = process.hrtime.bigint();

  res.on("finish", () => {
    const ms = Number(process.hrtime.bigint() - startedAt) / 1e6;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms.toFixed(1)}ms`);
  });

  next();
}
```

`res.on("finish", ...)` fires when the response has been handed to the network. The middleware itself returns immediately by calling `next()`; the callback runs later. This pattern — set something up, register a listener, call `next()` — is how nearly every real logging and metrics middleware works, and it is worth reading twice, because "run something after the response" is a requirement that comes up constantly and has no obvious place in a top-to-bottom stack.

`app.use` also accepts a path as its first argument. With no path, the middleware runs for every request. With a path, it runs only for requests whose URL *starts with* that path:

```js
app.use(requestId);                  // every request
app.use("/events", requireApiKey);   // only /events and anything under it
```

The prefix match matters. `app.use("/events", …)` matches `/events`, `/events/42`, and `/events/42/attendees`. It does not match `/eventsomething`, because Express splits on path segments. Also, inside a mounted middleware, `req.url` has the mount prefix stripped while `req.originalUrl` keeps the whole thing — which is why the logger above uses `originalUrl`. Log `req.url` from inside a mounted router and every line reads `/` and you will not know which request it was.

## Middleware you do not have to write

A lot of the stack is not yours. Express ships some, npm supplies the rest, and using them is the normal case rather than a shortcut.

The two you need immediately are the body parsers. An HTTP request body arrives as a stream of bytes; something has to read that stream to completion and turn it into a JavaScript value. Express does not do this by default, because not every service wants a body parsed, and because the parser needs to know the format.

```js
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

`express.json()` reads bodies whose `Content-Type` is `application/json`, parses them, and sets `req.body`. `express.urlencoded()` does the same for `application/x-www-form-urlencoded`, which is what a plain HTML `<form>` sends when it posts. Registering both means the events board can accept a new event from an API client and from a browser form without the handler caring which it was.

Three things bite people here:

- **A parser that does not match the content type is a no-op.** It sees the header, decides the body is not its business, and calls `next()`. So a client that posts JSON without `Content-Type: application/json` produces `req.body` as `{}` — an empty object, not an error. Your handler then reads `req.body.title` as `undefined` and you go hunting in the wrong place. Check the request's headers first.
- **`extended: true`** tells `urlencoded` to use a parser that can express nested objects and arrays in form field names. `extended: false` restricts values to strings and arrays. Either is defensible; pick one deliberately rather than copying whichever appeared in a tutorial.
- **Body parsers have a size limit**, one megabyte by default. That default is protection, not an oversight: without it, anyone can exhaust your server's memory by posting a very large body. If you raise it, raise it on purpose, on the one route that needs it.

For request logging, the conventional third-party choice is `morgan`:

```bash
npm install morgan
```

```js
import morgan from "morgan";

app.use(morgan("dev"));
```

That single line gives you a coloured one-line-per-request log with method, path, status, and duration. `morgan("combined")` gives you the standard Apache-style format that log-processing tools expect in production. Reading morgan's source is a genuinely useful exercise later, because it is the timing pattern from the previous section plus a formatter, and nothing else.

The habit to build is this: before writing a middleware, check whether the concern is generic enough that someone has already solved it. Body parsing, logging, compression, CORS headers, security headers, rate limiting — all of these have well-maintained middleware packages. Middleware you write yourself should be the part that is specific to *your* service.

The counter-habit matters just as much: every package you install runs arbitrary code inside your request path, with full access to `req`, `res`, and anything upstream attached to them. Before adding one, spend two minutes on it. When was it last published? How many other packages depend on it? Does it have a readme that explains its options, or does it assume you will read the source? Is it a hundred lines doing one thing, or a framework in disguise? A middleware that does one small job badly is easy to replace; one that has grown into your application's structure is not. On a team, "why is this dependency here" is a completely reasonable code review question, and you should be able to answer it.

## Writing your own middleware

Now the part that is yours. A middleware you write looks like the ones you install, because there is no difference between them.

Start with a request id. Every log line the events board writes should be traceable to a single request, and a single request may produce several lines:

```js
import { randomUUID } from "node:crypto";

export function requestId(req, res, next) {
  req.id = req.get("X-Request-Id") ?? randomUUID();
  res.set("X-Request-Id", req.id);
  next();
}
```

Two decisions are worth naming. First, the middleware honours an incoming `X-Request-Id` header if one is present, so that when the events board is called by another service, both logs share an id. Second, it echoes the id back on the response, so a person looking at a failed request in their browser's network tab can tell you which id to search for.

Attaching your own property to `req` is the standard way middleware passes data downstream. Everything registered after this line can read `req.id`. Keep the names you attach few and obvious; a `req` object with fifteen ad-hoc properties bolted on by different middleware is a mess nobody can reason about, and there is no type checking to save you.

Next, a gate — middleware that can refuse a request. The events board will eventually accept new events, and you want to reject a write that carries no API key:

```js
export function requireApiKey(req, res, next) {
  if (req.method === "GET") {
    return next();
  }

  const key = req.get("X-Api-Key");
  if (!key || key !== process.env.EVENTS_API_KEY) {
    return res.status(401).json({ error: "A valid X-Api-Key header is required." });
  }

  return next();
}
```

Read the three exits carefully, because this function contains all three behaviours from the first section. A GET falls through with `next()`. A missing or wrong key sends a 401 and never calls `next()`, so the router below never sees the request. A good key calls `next()` and the request continues.

Note the `return` in front of every branch. `next()` does not stop your function — it is a plain function call, and execution continues on the next line after it returns. Without the `return`, a request with a bad key would send a 401 *and then* call `next()`, the router would run and try to send a second response, and Node would throw `ERR_HTTP_HEADERS_SENT`. That error message confuses people the first time; it almost always means some code path called `next()` after responding, or responded twice. Returning early from every branch makes it impossible.

This gate is deliberately crude — a shared secret in an environment variable is not authentication, and real user accounts belong to a later course. What matters here is the shape: a cross-cutting rule, expressed once, mounted where it applies.

One more useful pattern is the configurable middleware — a function that *returns* a middleware:

```js
export function requireHeader(name) {
  return function (req, res, next) {
    if (!req.get(name)) {
      return res.status(400).json({ error: `Missing required header: ${name}` });
    }
    return next();
  };
}

app.use("/events", requireHeader("X-Api-Key"));
```

That is why `express.json()` has parentheses and `requestId` does not. `express.json` is a factory: you call it, it reads your options, and it hands back the actual `(req, res, next)` function. Passing `express.json` without calling it registers the factory itself as middleware, which is then invoked with `(req, res, next)` as if they were options, and the request hangs. It is a one-character bug and it costs people an hour.

## Mounting: paths, routers, and scope

Lesson 04 gave the events board an `express.Router()`. A router is itself a middleware stack — the same ordered list, scoped to whatever path you mount it at. So everything in this lesson applies one level down.

```js
// routes/events.js
import express from "express";
import { requireApiKey } from "../middleware/require-api-key.js";

const router = express.Router();

router.use(requireApiKey);

router.get("/", (req, res) => {
  res.json(events);
});

router.get("/:id", (req, res) => {
  const event = events.find((e) => e.id === req.params.id);
  if (!event) {
    return res.status(404).json({ error: "No event with that id." });
  }
  return res.json(event);
});

export default router;
```

`router.use(requireApiKey)` applies the gate to every route in this router and nowhere else. That is a better home for it than `app.use("/events", requireApiKey)` in `app.js`, for a reason worth stating plainly: the rule now lives next to the routes it governs. Someone adding a route to this file cannot forget the gate, because they did not have to remember it. Someone reading `app.js` sees a clean list of mounts rather than a pile of path-specific rules.

You can also scope middleware to a single route by passing it before the handler:

```js
router.post("/", requireApiKey, express.json(), (req, res) => {
  // ...
});
```

Every argument after the path is middleware, run left to right. This is the narrowest scope available and the right choice when a rule genuinely applies to one endpoint — an expensive parser, say, or a check that only makes sense for one operation.

So you have four levels of scope: application-wide (`app.use(fn)`), path-mounted (`app.use("/events", fn)`), router-level (`router.use(fn)`), and route-level (`router.post("/", fn, handler)`). Choosing among them is a real design decision, and the guideline is to mount each concern at the narrowest scope that still covers everything it must cover. Mounting too broadly means a rule silently applies to routes nobody intended — a health check endpoint behind an API key gate is a classic way to break your own monitoring. Mounting too narrowly means the rule gets forgotten on the next route someone adds.

There is one more mounting position you should know exists without using it yet. A middleware function that takes **four** arguments — `(err, req, res, next)` — is not an ordinary middleware. Express treats it as an error handler and skips it entirely unless something upstream failed. That is how a thrown error jumps past the rest of the stack and lands somewhere that can turn it into a response. Error handling is the whole subject of lesson 08, so do not write one yet; just know that the four-argument shape is reserved, and that if you ever write an ordinary middleware with an unused fourth parameter, Express will quietly stop calling it.

## The pipeline as a design artifact

Everything above is implementation. This section is the part that transfers to work that is not Express, and it is the reason this lesson is tagged to design as well as construction.

An ordered middleware stack is a **system-structure design**. It is a pipeline: a sequence of stages, each with a defined input, a defined mutation, and a defined decision about whether the request continues. That is a design artifact whether or not anyone writes it down, and on a team the difference between a service people can safely change and one they cannot is usually that somebody wrote it down.

Writing it down does not require a tool. A table in the repository's README is enough:

| # | Stage | Scope | Reads | Writes | Can stop the request? |
| --- | --- | --- | --- | --- | --- |
| 1 | `requestId` | all | `X-Request-Id` header | `req.id`, response header | no |
| 2 | `requestTimer` | all | `res` finish event | log line | no |
| 3 | `morgan("dev")` | all | method, url, status | log line | no |
| 4 | `express.json()` | all | request body | `req.body` | yes (malformed JSON) |
| 5 | `express.urlencoded()` | all | request body | `req.body` | yes (malformed body) |
| 6 | `requireApiKey` | `/events` | `X-Api-Key` header | nothing | yes (401) |
| 7 | `eventsRouter` | `/events` | `req.params`, `req.body` | response | yes (it is the destination) |

Building that table forces questions that reading the code does not. Does stage 4 need to run before stage 6, or would rejecting an unauthorized request *before* parsing its body be cheaper and safer? (It would — you avoid spending memory parsing a body you are about to throw away.) Does anything read `req.id` other than the logger? If not, is stage 1 earning its place? Is there a stage that both parses and decides, and should those be two stages?

Two habits make the artifact useful rather than decorative:

**State each stage's contract as a precondition and a postcondition.** "After stage 4, `req.body` is either a parsed object or the request has already been rejected" is a sentence a teammate can rely on. "Stage 4 parses JSON" is not, because it does not say what happens when parsing fails.

**Keep the artifact and `app.js` in the same order, and treat a mismatch as a bug in one of them.** A diagram that has drifted from the code is worse than no diagram, because people trust it.

There is a third habit that only shows up on a team, and it is the one this competency is really about: **write the artifact before you write the middleware, and get it read.** A stage table is cheap to change and cheap to argue about. A stack of six middleware functions with tests around them is neither. Sketching the pipeline first — even as a numbered list in a pull request description or a message to whoever owns the service — turns "I added a thing" into a proposal a colleague can respond to. The responses you get are usually about position and scope, which are exactly the decisions that are expensive to reverse later and free to change now. That is what "contributing to a design artifact under guidance" looks like in practice: you produce the sketch, someone more experienced tells you the auth gate belongs above the parser, and you have learned something that would otherwise have cost a production incident.

When you review someone's pull request that adds a middleware, the design question is not "is this function correct" but "is this the right position in the stack, at the right scope, and does the table still describe reality." That is the level at which cross-cutting concerns are actually got right or wrong, and it is a review skill you can practise now on your own code.

The same reading works in reverse, and it is how you get oriented in a service you did not write. Open its entry file, read the `app.use` calls top to bottom, and you have the shape of the whole system before you have read a single handler: what it parses, what it logs, what it refuses, and where the real work is mounted. A well-ordered `app.js` is documentation. A disordered one — parsers halfway down, a gate mounted twice, a router registered above the middleware it depends on — tells you something true about the codebase before you have read any of it.

## Practice

You will restructure the events board so that its cross-cutting concerns live in a deliberate, documented pipeline.

1. Create a `middleware/` directory in the project. Add `request-id.js` exporting a `requestId` middleware that sets `req.id` from an incoming `X-Request-Id` header or a fresh `randomUUID()`, and echoes it back as a response header.
2. Add `middleware/request-timer.js` exporting a `requestTimer` middleware that records a start time, registers a `res.on("finish")` listener, and logs one line containing `req.id`, the method, the original URL, the status code, and the elapsed milliseconds. Confirm the line appears *after* the response arrives in your client.
3. Install `morgan` and mount it. Run a request and observe that you now get two log lines. Decide which one you want to keep, and write a one-sentence justification in a comment — this is a real trade-off, not a trick question.
4. Register `express.json()` and `express.urlencoded({ extended: true })` in `app.js`. Then send a POST to `/events` with a JSON body and **no** `Content-Type` header, and log `req.body` at the top of the handler. Record what you got. Repeat with the correct header. Write down the difference in one sentence.
5. Add `middleware/require-api-key.js` that lets every `GET` through and rejects any other method with a `401` and a JSON error body unless the `X-Api-Key` header matches `process.env.EVENTS_API_KEY`. Mount it with `router.use` inside the events router, not in `app.js`.
6. Deliberately break it: remove the `return` in front of one of the `next()` calls, send a request with a bad key, and read the error Node prints. Restore the `return`. You now know what `ERR_HTTP_HEADERS_SENT` means from the inside.
7. Deliberately break it again: comment out `next()` in `requestId` and send any request. Note that it hangs rather than failing. Restore it.
8. Move `express.json()` below the `/events` mount, POST a valid event, and record what `req.body` is now. Move it back.

**Deliverable:** a `PIPELINE.md` in the project root containing the stage table from the previous section, filled in for your actual `app.js` and events router — one row per stage, in the order Express runs them, with the scope, what it reads, what it writes, and whether it can stop the request. Below the table, add three sentences: one naming a stage whose position you changed and why, one stating a precondition some later stage depends on, and one naming a concern you decided *not* to put in the pipeline and where it belongs instead.
