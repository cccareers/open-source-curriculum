---
lesson_id: node101-08
course_id: node101
pathway: software-developer
title: Error Handling and Logging
order: 8
kind: lesson
competency_ids:
  - D4-S1-C05
objectives:
  - Handle and log errors so failures are diagnosable
---

## When a handler fails

Every route you have written so far assumed success. The events board reads from an in-memory array, finds what it is looking for, and renders it. That assumption holds right up until someone types a URL you did not plan for, and then it does not hold at all.

Here is the detail route from lesson 04, unchanged:

```js
app.get("/events/:id", (req, res) => {
  const event = events.find((e) => e.id === req.params.id);
  res.render("event-detail", { title: event.title, event });
});
```

Request `/events/42` and it works. Request `/events/does-not-exist` and `find` returns `undefined`, `event.title` throws a `TypeError`, and the request ends in a way you did not choose. That last part is the important one. The request still ends — Express has a default error handler and it will respond — but it responds with decisions someone else made on your behalf.

Those default decisions are worth knowing precisely, because a lot of learners assume the framework has "handled it" and stop thinking. Express catches an exception thrown synchronously inside a route handler, stops running the rest of the stack, and hands the error to its own final handler. That handler responds with status 500, logs the stack to standard error, and — when `NODE_ENV` is anything other than `production` — puts the entire stack trace in the response body. Set `NODE_ENV=production` and the body shrinks to the words "Internal Server Error" with no detail at all.

So the default gives you two failures at once. The status is wrong: nothing broke on the server, the client asked for a record that does not exist, and that is a 404. And the response shape is wrong in both directions: in development it hands a stranger your file paths and package internals, and in production it hands your own teammate a blank wall with nothing to trace.

Treat the default handler as a safety net that keeps the process alive, not as error handling. Error handling is a design decision you make: which failures are expected, what status each one deserves, what the client sees, and what you write down so that a human can reconstruct the failure later.

That last part is why this lesson pairs errors with logs. An error your service handled cleanly and never recorded is an error nobody can fix. The competency this lesson is graded against is about monitoring software, spotting an issue, and reporting it clearly enough that a senior developer can act on it — and every piece of machinery below exists to make that report possible.

## Errors Express cannot see

Express catches synchronous throws. It does not, in Express 4, catch a rejected promise. This is the single biggest source of mystery hangs in Node web services, so read this section slowly.

```js
app.get("/events/:id", async (req, res) => {
  const event = await loadEvent(req.params.id);
  res.render("event-detail", { event });
});
```

The handler is `async`, which means calling it returns a promise. Express 4 calls it, ignores the return value, and moves on. If `loadEvent` rejects, the rejection has nowhere to go: Express never learns about it, no response is ever sent, and the browser sits there spinning until it times out. Node prints an unhandled rejection warning, and on modern Node versions an unhandled rejection terminates the process by default — so one bad request can take your whole service down.

Express 5 does forward rejected promises from handlers automatically. You may end up on either version, and a habit that works on both is worth more than a habit that depends on which one `npm install express` gave you this week. Be explicit.

Being explicit means using `next`. You met `next` in lesson 05 as the third argument that passes control to the following middleware. It has a second job: call it with an argument, and Express skips every remaining ordinary middleware and route handler and goes looking for an error handler instead. Any non-null argument counts as an error, though you should always pass an actual `Error` object so that a stack trace exists. The one reserved value is the string `"route"`, which skips the rest of the current route's handlers without signalling failure — a routing detail, not an error path.

With `next` in hand, the detail route becomes honest about both of its failure modes:

```js
app.get("/events/:id", async (req, res, next) => {
  try {
    const event = await loadEvent(req.params.id);
    if (!event) {
      const err = new Error(`No event with id ${req.params.id}`);
      err.status = 404;
      return next(err);
    }
    res.render("event-detail", { event });
  } catch (err) {
    next(err);
  }
});
```

Two things are happening. The missing record is an *expected* failure, so you construct an error, tag it with the status you want, and forward it. Anything else that goes wrong inside the `try` is an *unexpected* failure, and the `catch` forwards it untouched with no status attached. Both end up in the same place, which is what you want: one exit path, one handler, one log format.

The `return` in front of `next(err)` is not decoration. `next` does not stop your function; if you forget the `return`, execution falls through to `res.render` with an undefined event and you get a second, more confusing error on top of the first.

Wrapping every async handler in `try`/`catch` gets repetitive fast, and repetition is where people start skipping the boring part. One small helper removes it:

```js
export function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}
```

```js
app.get(
  "/events/:id",
  asyncRoute(async (req, res) => {
    const event = await loadEvent(req.params.id);
    if (!event) throw Object.assign(new Error("Event not found"), { status: 404 });
    res.render("event-detail", { event });
  })
);
```

`Promise.resolve` means the wrapper works whether the handler is async or not, and `.catch(next)` sends any rejection down the error path. Now a plain `throw` inside an async handler behaves the way most people already assumed it did.

One rule to fix in your head now, because it causes a genuinely baffling class of bug: once you have sent a response, you must not call `next(err)`. If `res.send` or `res.render` has already run, the headers are on the wire and cannot be changed. Express will fall back to its default handler, log a warning about headers already being sent, and abort the connection mid-response. The pattern to avoid is starting a response, discovering a problem, and then trying to switch to an error — decide first, respond once.

## The error handler and where it sits

An error-handling middleware is an ordinary function with one distinguishing feature: it takes **four** parameters.

```js
app.use((err, req, res, next) => {
  // handle it
});
```

Express identifies error handlers by counting the function's declared parameters. Four means error handler. Three or fewer means ordinary middleware. This is why the most common failure in this whole lesson is dropping the unused fourth parameter to keep a linter quiet — the function silently becomes ordinary middleware, never receives an error, and every failure falls back to the default handler while your code sits there looking correct.

![How an error thrown or forwarded in a handler skips the remaining middleware and reaches the error handler](./img/express-error-flow.png)

Position matters as much as arity. Middleware runs in registration order, and an error handler can only catch errors from things registered *above* it. Register it first and it will never fire once. It goes last, after every router.

Just above it goes the 404 handler, and it is worth being clear that the 404 handler is *not* an error handler. It is ordinary middleware with no path, which means it matches every request. Express only reaches it when no route above it matched, so arriving there is itself the signal:

```js
app.use((req, res, next) => {
  const err = new Error(`No route for ${req.method} ${req.originalUrl}`);
  err.status = 404;
  next(err);
});
```

That gives one place where every 404 is produced — the not-found route inside a handler and the not-found path both converge on the same response shape.

Assembled, the events board's `app.js` now reads top to bottom as the life of a request:

```js
import express from "express";
import morgan from "morgan";
import { requestId } from "./middleware/request-id.js";
import { notFound, errorHandler } from "./middleware/errors.js";
import { eventsRouter } from "./routes/events.js";
import { apiRouter } from "./routes/api.js";

const app = express();

app.use(requestId);                // 1. tag the request
app.use(morgan(":id :method :url :status :response-time ms"));
app.use(express.json());           // 2. parse bodies
app.use(express.static("public")); // 3. static assets
app.use("/events", eventsRouter);  // 4. rendered pages
app.use("/api", apiRouter);        // 5. JSON API
app.use(notFound);                 // 6. nothing matched
app.use(errorHandler);             // 7. four arguments, always last
```

Move `notFound` above the routers and every page 404s, because it matches everything. Move `errorHandler` above the routers and it catches nothing. The order is the design.

You can register more than one error handler. Calling `next(err)` from inside one passes the error along to the next four-argument function below it, which is occasionally useful — a handler that only deals with body-parsing failures, say, forwarding everything else. Start with one; add a second only when you can name what it is for.

## Expected failures and real ones

A status code is a claim about whose problem it is. Codes in the 400 range say the request was wrong: it asked for something that is not there, or sent something malformed. Codes in the 500 range say your application failed while trying to do something reasonable. Getting this distinction right is not pedantry. It determines whether an alert wakes somebody up, whether a spike in the graph means anything, and how much detail is safe to show.

A missing event is a 404. A malformed JSON body is a 400. A view template that references a variable you never passed is a 500, and it is your bug. If you return 500 for the missing event, you will eventually have a dashboard full of red that turns out to be people mistyping URLs, and the real failure hiding inside it will not stand out at all.

The error handler decides all of this in one place. The events board serves two audiences — rendered pages for browsers, JSON for API clients — so it also has to pick a body shape:

```js
export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  const status = err.status ?? err.statusCode ?? 500;
  const clientMessage =
    status < 500 ? err.message : "Something went wrong on our end.";

  const entry = {
    requestId: req.id,
    method: req.method,
    url: req.originalUrl,
    status,
    message: err.message,
  };

  if (status >= 500) {
    logger.error({ ...entry, stack: err.stack });
  } else {
    logger.info(entry);
  }

  res.status(status);

  if (req.path.startsWith("/api/")) {
    return res.json({ error: { status, message: clientMessage, requestId: req.id } });
  }

  res.render("error", { status, message: clientMessage, requestId: req.id });
}
```

Read the decisions in it one at a time.

The `headersSent` guard is the escape hatch for the situation described earlier: a response already started, so there is nothing this handler can usefully do, and it hands back to the default handler to close the connection. It also gives the fourth parameter a real job.

`err.status ?? err.statusCode ?? 500` reads the tag you attached, tolerates the `statusCode` spelling that some libraries use, and defaults to 500. Defaulting to 500 is deliberate: an error with no status is one you did not anticipate, and an unanticipated failure is a server failure until proven otherwise.

`clientMessage` is where the leak is prevented. For a 4xx, the message is one you wrote yourself — "Event not found" — and it is safe and useful. For a 5xx, the message came from somewhere you do not control. A driver, a template engine, a JSON parser. Those messages routinely contain absolute file paths, package versions, internal hostnames, fragments of input data, and occasionally a connection string with credentials in it. So the client gets a fixed sentence, and everything real goes to the log.

Never send a stack trace to a client. Not in a 500 page, not in a JSON error body, not "just while I am debugging" on a public URL. A stack trace is a map of your source tree and dependency versions handed to whoever asked for it. The request id in the response is what replaces it: the user or the reporter quotes the id, and you find the full stack in your own logs in seconds. That trade — nothing useful to a stranger, everything useful to you — is the whole point of the design.

Two smaller mistakes to avoid. Do not set a status before forwarding and then set another one in the handler; decide once, in the handler. And keep the `error` view trivial. It should render a heading, the message, and the request id, with no data lookups and no partials that could themselves fail — an error template that throws puts you right back at the default handler with a much worse trace.

## Logs you can actually use

Lesson 05 added morgan, which writes one line per request: method, path, status, response time. That answers "what happened". It does not answer "why", and it does not let you tie three lines together into one story. For that you need an application log of your own, and two habits.

The first habit is levels. Use `error` for something broken that needs a human. Use `warn` for something suspicious that the code recovered from. Use `info` for normal but significant events — process started on port 3000, request completed, item created. Use `debug` for the noisy detail you want while developing and off in production. The test for `error` is simple: if nobody would act on it, it is not an error. A log where every line is red is a log nobody reads.

The second habit is structure. Write one line per event, as JSON, with the same field names every time. Prose log lines are pleasant to read one at a time and useless to search across ten thousand. A structured line can be filtered by field in any host's log viewer.

```js
function write(level, fields) {
  process.stdout.write(
    JSON.stringify({ time: new Date().toISOString(), level, ...fields }) + "\n"
  );
}

export const logger = {
  info: (fields) => write("info", fields),
  warn: (fields) => write("warn", fields),
  error: (fields) => write("error", fields),
};
```

Note where it writes: standard output. Not a file. A log file on a server you do not administer is a file you cannot get to, on a disk that is often wiped between restarts. Writing to the standard streams means the process that supervises your app collects them — which is exactly how you will read logs on a public host in the next lesson.

A useful line carries the timestamp, the level, the request id, the method and path, the status, and a short stable message. Stable matters: `"event not found"` with the id in a separate field is searchable, while `` `Event ${id} not found` `` produces a unique string every time and can never be counted.

What must never appear in a log: passwords, tokens, API keys, session cookies, full authorization headers, and personal data you do not need. The rule that keeps you safe is to log identifiers, not payloads. Log `userId`, not the user object. Log that a request body failed validation and which field, not the body. Dumping an entire request or an entire configuration object is the usual way secrets end up in a log aggregator that far more people can read than can read your database.

The piece that turns a pile of lines into a story is a request id. Generate one per request, hang it on the request object, echo it in a response header, and include it in every line you write for that request:

```js
import { randomUUID } from "node:crypto";

export function requestId(req, res, next) {
  req.id = req.get("x-request-id") ?? randomUUID();
  res.set("x-request-id", req.id);
  next();
}
```

Honouring an incoming `x-request-id` costs one line and means that when something upstream already assigned an id, yours matches. Register this middleware first, above morgan, and teach morgan about it so the access log carries it too:

```js
morgan.token("id", (req) => req.id);
```

Now every line about one request — the access line, any warnings, the error with its stack — shares a value you can filter on. That single field is the difference between "there were some 500s this afternoon" and "here is exactly what that person hit, in order".

## Reporting an issue a senior developer can act on

Detecting a problem and reporting it well is a skill with its own failure modes, and it is what this lesson is assessed on. The machinery above exists so that your report can contain facts instead of impressions.

Start from whatever you were told. "The events page was blank around 2:15" is a real report, and it is enough. If the person has the response header or a screenshot showing the request id, filter your logs on it directly. If not, narrow by time and path first, find the id on the matching line, then filter on the id to pull the whole request:

```bash
grep '"requestId":"7c1f0a52-4a1e-4ef7-9e4f-6a2b3c0d1e88"' app.log
```

Read the lines in order. You are looking for three things: the status the client actually got, the first line where something went wrong rather than the last, and whether the same pattern appears in other requests. One occurrence is an anecdote; forty in ten minutes is an outage, and saying which one it is changes what the person reading your report does next.

Then write it down. A report a senior developer can act on without a conversation contains, in roughly this order: what you observed, what you expected, when it happened with a timezone, where it happened including the exact URL and which environment, the request id, whether it reproduces and the steps that reproduce it, the evidence, what you already ruled out, and how big it is.

```text
Title: /events/:id returns 500 for ids containing a slash

Observed: GET /events/summer%2Fparty returns 500 with the generic error page.
Expected: 404, the same as any other unknown id.

When:        2026-07-24 14:12 UTC, first seen 14:02 UTC
Where:       staging, https://events-board-staging.example.net/events/summer%2Fparty
Request id:  7c1f0a52-4a1e-4ef7-9e4f-6a2b3c0d1e88
Reproduces:  yes, every time. curl -i '<base>/events/summer%2Fparty'

Evidence: error log for that request id shows a TypeError in
views/event-detail.ejs line 12, reading `title` of undefined. The route
forwarded no status, so the handler defaulted to 500.

Frequency: 6 requests in the last hour, all from one crawler. No other
paths affected.

Already ruled out:
- Not the 404 middleware: unmatched paths like /nope still render 404.
- Not data: the same id shape fails against an empty events array.
- Not deploy-related: reproduces on the previous release too.

Guess (low confidence): the handler renders before checking that find()
returned something, so any id that misses hits the template with undefined.
```

Every line there is doing work. The timezone means nobody hunts through the wrong hour of logs. The request id means the reader gets to the same evidence in one filter instead of re-deriving your investigation. The reproduction means they can see it themselves. The "already ruled out" list is the most valuable part and the one people skip: it stops the reader from spending twenty minutes on the two theories you already killed. And separating the guess from the facts, clearly labelled, lets them use your hunch without inheriting your certainty.

The common ways this goes wrong are worth naming. "The site is broken" is not a report. A screenshot with no URL, no time, and no id forces the reader to start from nothing. Reporting your theory as if it were an observation sends people down your dead end. Bundling three unrelated problems into one message means two of them get lost. And reporting a problem while quietly deleting the data or restarting the process that caused it destroys the evidence — if you must restart to restore service, say so in the report and say what time you did it.

Urgency is a fact too, and it belongs in the report rather than in your tone. Say how many requests, how many users, whether there is a workaround, and whether it is getting worse. Let the person reading decide what to drop; give them what they need to decide.

## Practice

Work in your events board project. Each step should be a separate commit so you can see the behaviour change.

1. **Reproduce the default.** Add a route `/boom` whose handler throws synchronously. Request it, and record the status and the exact response body. Now start the server with `NODE_ENV=production` and request it again. Write down both bodies and one sentence on why neither is acceptable in a real service.

2. **Add request ids.** Write the `requestId` middleware and register it first. Add the morgan token so access lines carry it. Confirm with `curl -i` that the response has an `x-request-id` header and that the same value appears in the access log line.

3. **Add a structured logger.** Build the small `logger` above in its own module. Log one `info` line at startup with the port and `NODE_ENV`. Verify that every line is valid JSON on a single line.

4. **Add the 404 and error handlers.** Register the not-found middleware and a four-argument error handler in the correct positions. Then delete the fourth parameter from the error handler, restart, and request `/boom` again. Explain in a comment what changed and why, then put the parameter back.

5. **Split the response shapes.** Make `/events/:id` produce a 404 with a rendered error page for a missing id, and `/api/events/:id` produce a 404 with a JSON error body carrying the same request id. Verify both with `curl -i`. Confirm no stack trace appears in either body when `NODE_ENV=production`, and that the full stack *does* appear in your logs.

6. **Prove the async gap.** Add an async route that awaits a promise which rejects. Request it and observe what happens with no `try`/`catch`. Then wrap it with `asyncRoute` and observe the difference. Note which Express major version you have and what that changes.

7. **Write the report.** Have a classmate introduce one small bug into your app without telling you what it is. Find it using only the logs and the request id, then write an issue report using the structure in this lesson — including at least two things you ruled out. Swap reports and check whether the other person's report is enough to reproduce and fix the bug without asking a single follow-up question.
