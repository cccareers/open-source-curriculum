---
lesson_id: node101-04
course_id: node101
pathway: software-developer
title: Routing and Route Parameters
order: 4
kind: lesson
competency_ids:
  - D2-S1-C04
objectives:
  - Route requests to handlers using paths, parameters, and methods
---

## A route is a method plus a path

In the last lesson you wrote a handful of routes with fixed paths and got a `404` when you sent a `POST` to a path that only accepted `GET`. That `404` was the routing system doing its job, and it is worth being precise about what that job is.

Express keeps an ordered list of registered handlers. Each entry records a **method**, a **path pattern**, and a **function**. When a request arrives, Express walks that list from the top, and for each entry asks two questions: does the request's method match, and does the request's path match the pattern? The first entry that answers yes to both gets called. If nothing matches, Express falls through to its built-in final handler, which sends the `404` you saw.

That means the identity of a route is the **pair**, not the path alone. These are three different routes that happen to share a path:

```javascript
app.get("/events", (req, res) => {
  res.json(events);
});

app.post("/events", (req, res) => {
  res.status(201).json({ created: true });
});

app.delete("/events", (req, res) => {
  res.sendStatus(405);
});
```

Express gives you a method-named function for every HTTP method: `app.get`, `app.post`, `app.put`, `app.patch`, `app.delete`, `app.head`, `app.options`. There is also `app.all(path, handler)`, which matches every method at that path — useful for a path that should answer uniformly regardless of how it was asked for.

Two conveniences are worth knowing. `app.route(path)` lets you group the methods for one path so the path string is written once:

```javascript
app
  .route("/events")
  .get((req, res) => res.json(events))
  .post((req, res) => res.status(201).json({ created: true }));
```

And `HEAD` is handled for you: Express answers a `HEAD` request using your `GET` handler and simply omits the body. You do not write `app.head` unless you want different behavior.

One thing you cannot do yet: read what a `POST` sent you. The body of a request is a stream of bytes, and turning it into a JavaScript object requires a **body parser** — a piece of middleware that reads the stream and populates `req.body`. Until you add one, `req.body` is `undefined` no matter what the client sent. That is lesson 05's material. Write your `POST` routes here as stubs that acknowledge the method and return a fixed response; you will fill them in once the pipeline exists to feed them.

Path matching itself has a few properties that surprise people:

- **Matching is case-insensitive by default.** `/Events` matches a route registered as `/events`. You can change this with `app.set("case sensitive routing", true)`, and it is reasonable to do so on an API where you want one canonical spelling.
- **A trailing slash is ignored by default.** `/events/` matches `/events`. `app.set("strict routing", true)` makes them distinct.
- **The query string is not part of the path.** `/events?tag=music` matches the route `/events`. Everything from the `?` onward is handled separately, which is the subject of a section below.

Being explicit about these defaults matters more than which way you set them. A URL that works in one environment and 404s in another is very often a strict-routing setting that differs between them.

Since you are choosing the paths, choose them on a convention rather than one at a time. The widely used one is resource-oriented: **a path names a thing, and the method says what you are doing to it.** That produces a predictable surface for the events board:

| Method and path | Meaning |
| --- | --- |
| `GET /events` | the collection |
| `POST /events` | add one to the collection |
| `GET /events/:id` | one member of the collection |
| `PUT /events/:id` | replace that member |
| `PATCH /events/:id` | modify part of that member |
| `DELETE /events/:id` | remove that member |

Three habits follow from it. **Use nouns, not verbs** — `POST /events` rather than `GET /createEvent`, because the method already carries the verb and a path with a verb in it needs a new path for every operation. **Use plural collection names consistently**, so a reader who knows one resource can guess the next. And **use lowercase with hyphens** for multi-word segments (`/event-series`, not `/eventSeries`), because paths are case-sensitive on many systems and hyphens survive being read aloud.

Where a request has no body — as in every route in this lesson — only the `GET` rows apply. The rest of the table is the plan the next two lessons fill in, and having it written down now is what keeps the paths from being invented one at a time under time pressure.

A related choice: what to do when the path exists but the method does not. Express's default is a `404`, which is slightly misleading, since the resource is there and only the operation is unsupported. `405 Method Not Allowed` says that precisely, and you can state it explicitly for a path where it matters:

```javascript
app.all("/events/:id", (req, res) => {
  res.set("Allow", "GET").sendStatus(405);
});
```

Registered *after* the real `/events/:id` routes, that catches anything they did not handle. It is a refinement rather than a requirement — plenty of production services return `404` here — but knowing the difference is part of designing an HTTP surface rather than accumulating one.

## Route parameters

Fixed paths only get you so far. The events board needs a page per event, and you are not going to register `/events/1`, `/events/2`, and `/events/3` by hand — the array changes at runtime, and hardcoding the paths would mean the routes and the data could disagree.

A **route parameter** is a named placeholder in the path pattern. Prefix a path segment with a colon and Express will match any single segment there and hand you the value:

```javascript
app.get("/events/:id", (req, res) => {
  const event = events.find((candidate) => candidate.id === Number(req.params.id));

  if (!event) {
    return res.status(404).json({ error: `No event with id ${req.params.id}` });
  }

  res.json(event);
});
```

Request `/events/2` and `req.params` is `{ id: "2" }`. Request `/events/99` and it is `{ id: "99" }` — the pattern matched, the lookup failed, and you returned a `404`. Those are two different failures and it is important that you keep them separate in your head: the route matching succeeded either way. Express found a handler; your handler decided the resource does not exist.

Four properties of parameters you need to internalize:

**Parameters are always strings.** `req.params.id` is `"2"`, never `2`. The `Number()` in the example above is not decoration. Without it, `candidate.id === req.params.id` compares a number to a string with `===` and is always false, so every lookup returns `404` and you spend twenty minutes staring at data that is obviously right there. This is the single most common route-parameter bug there is. Convert at the top of the handler and work with the converted value.

**A parameter matches exactly one segment.** `:id` matches `2` and `abc` and `2026-08-02`, but it does not match `2/edit`, because the slash separates segments. If you need to capture the rest of a path including slashes, that is a wildcard, not a parameter.

**A parameter cannot be empty.** `/events/` does not match `/events/:id` — there is no segment to capture, so it falls through. If you want both `/events` and `/events/:id`, register both.

**You can have several, and the names are yours.** They are just keys on `req.params`:

```javascript
app.get("/events/:year/:month", (req, res) => {
  const year = Number(req.params.year);
  const month = Number(req.params.month);
  const matches = events.filter((event) => {
    const eventDate = new Date(event.date);
    return eventDate.getFullYear() === year && eventDate.getMonth() + 1 === month;
  });
  res.json({ year, month, count: matches.length, events: matches });
});
```

Because a parameter matches literally anything in that segment, **validate it before you use it.** A user can request `/events/banana`, `/events/-1`, or `/events/99999999999999999999`. `Number("banana")` is `NaN`, and `events.find` with `NaN` quietly returns `undefined`, so the `404` branch catches it — but relying on an accident is not the same as handling a case. Be explicit:

```javascript
app.get("/events/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "id must be a positive integer" });
  }

  const event = events.find((candidate) => candidate.id === id);

  if (!event) {
    return res.status(404).json({ error: `No event with id ${id}` });
  }

  res.json(event);
});
```

Note the status codes doing real work. `400` means *you sent me something that is not an id*. `404` means *that was a valid id and nothing has it*. A client — including a human reading logs six months from now — can act on that difference. Collapsing both into `404` throws away information for no gain.

Express also lets you constrain a parameter with a regular expression in the pattern itself, which rejects bad input before your handler runs:

```javascript
app.get("/events/:id(\\d+)", (req, res) => {
  // only reached when :id is one or more digits
});
```

This is genuinely useful, and it has a trap: a request to `/events/banana` now does not match this route at all, so instead of your `400` it falls through to whatever comes next — possibly a `404`, possibly a different route you did not intend. Use pattern constraints when you want non-matching input to try other routes, and handler validation when you want to give the client a specific error. Do not use both for the same case and expect the handler branch to run.

Finally, on naming. Parameters name the resource identifier, not the position: `/events/:id` and `/events/:eventId/tickets/:ticketId` read correctly, while `/events/:x/:y` tells the next reader nothing. And keep the resource plural and consistent across the whole application — `events` everywhere, never `event` in one route and `events` in another. Consistency in URLs is a small courtesy that eliminates a whole class of "why is this 404ing" questions.

## Query strings and `req.query`

Route parameters identify *which* resource. Query strings modify *how* you want it — filtering, sorting, paginating, formatting. The rule of thumb: if removing it would change which thing you are asking for, it belongs in the path; if removing it would still return the same thing in a different shape or subset, it belongs in the query.

Everything after the `?` in a URL is the query string, written as `key=value` pairs joined by `&`. Express parses it and puts the result on `req.query`:

```javascript
// GET /events?venue=Maker%20Space&limit=2
app.get("/events", (req, res) => {
  let results = events;

  if (req.query.venue) {
    results = results.filter((event) => event.venue === req.query.venue);
  }

  const limit = Number(req.query.limit);
  if (Number.isInteger(limit) && limit > 0) {
    results = results.slice(0, limit);
  }

  res.json({ count: results.length, events: results });
});
```

Several things about `req.query` will catch you out if you do not know them in advance.

**Values are strings, exactly like parameters.** `req.query.limit` is `"2"`. Same conversion discipline applies.

**Missing keys are `undefined`, not empty strings.** `/events` with no query gives `req.query.venue === undefined`. But `/events?venue=` gives `""`, which is a different value that is also falsy — the `if (req.query.venue)` above treats them the same, which is usually what you want. If you ever need "the parameter was present but blank" to mean something different from "absent," check with `"venue" in req.query`.

**A repeated key becomes an array.** `/events?tag=music&tag=free` gives `req.query.tag` as `["music", "free"]`, while `/events?tag=music` gives the string `"music"`. Code that assumes a string and calls `.toLowerCase()` on it crashes the moment someone repeats the parameter. Normalize at the boundary:

```javascript
const tags = [].concat(req.query.tag ?? []);
```

That produces `[]`, `["music"]`, or `["music", "free"]` — one shape to write the rest of your logic against.

**Nested and bracketed keys parse into objects.** By default Express parses `?filter[venue]=Maker` into `{ filter: { venue: "Maker" } }`. This is occasionally handy and frequently a source of surprise when a client sends something you did not anticipate. Never assume `req.query.something` is a string — check the type if the value came from outside your own links.

**Values are URL-decoded for you.** `?venue=Maker%20Space` arrives as `"Maker Space"`. Conversely, when you build URLs yourself, encode them — `encodeURIComponent(venue)` — or a value containing `&` will silently split into two parameters.

Two design habits are worth adopting now. First, **query parameters should be optional and the route should work without any of them.** `/events` with nothing after it must still return the full list; a route that requires a query parameter is a route whose requirement belongs in the path. Second, **ignore what you do not understand rather than erroring.** If a client sends `?sortt=date`, returning the unsorted list is friendlier than a `400`, because query strings collect typos, tracking parameters, and things added by clients you do not control. Reserve `400` for a parameter you *do* support that has been given a value you cannot use — `?limit=banana` is worth rejecting.

And a note on method semantics that connects back to the previous section: a query string is part of a `GET`, and a `GET` must not change anything. `/events?delete=3` is a real pattern in old code and it is a real bug — a link prefetcher, a browser preloading on hover, or a chat client generating a preview will follow that URL and delete the event without a human ever clicking. Filtering and sorting in the query, changes through `POST`, `PUT`, `PATCH`, and `DELETE`.

## Order and specificity

Express matches routes **in registration order**, top to bottom, and stops at the first match. It does not score routes for specificity, it does not prefer literal paths over patterns, and it does not warn you when one route makes another unreachable. This is the single largest source of "my route is never called" in Express, and it is entirely mechanical once you see it.

Consider this ordering:

```javascript
app.get("/events/:id", (req, res) => {
  res.json({ lookup: req.params.id });
});

app.get("/events/upcoming", (req, res) => {
  res.json({ upcoming: true });
});
```

Request `/events/upcoming` and you get `{"lookup":"upcoming"}`. The first route matched, because `:id` happily captured the literal segment `upcoming`, and Express stopped there. The second handler is dead code and nothing tells you so.

The fix is to register the specific path first:

```javascript
app.get("/events/upcoming", (req, res) => {
  res.json({ upcoming: true });
});

app.get("/events/:id", (req, res) => {
  res.json({ lookup: req.params.id });
});
```

The general rule: **static segments before parameterized ones at the same depth.** Whenever a literal path could also be captured by a parameter in the same position, the literal must be registered first.

This has a second-order consequence worth planning around. Once `/events/upcoming` exists, the id `upcoming` is unreachable forever. That is fine when ids are numbers. It is a genuine collision when ids are user-chosen slugs, and the standard solution is to move the special views out of the collision space — `/events/views/upcoming`, or a query parameter `/events?when=upcoming` — rather than accumulating reserved words you have to remember.

A related ordering issue appears with paths that share a prefix. `/events` and `/events/:id` do not conflict, because `/events` has no second segment to capture and `/events/:id` requires one. But `/events/:id` and `/events/:id/tickets` are also distinct for the same reason, so depth protects you more often than you would guess. The collisions are almost always literal-versus-parameter at the *same* depth.

Two practical habits keep this manageable as the file grows:

1. **Group routes by resource and order each group from most specific to least.** All the `/events` routes together, with `/events`, then `/events/upcoming` and friends, then `/events/:id`, then `/events/:id/...`.
2. **When a route is not firing, log at the top of every candidate handler and request the URL once.** Whichever handler prints is the one that matched. This takes thirty seconds and beats reading the route table.

The endpoint of this reasoning is the catch-all `404`, which by definition must be registered after every real route — that is the last section of this lesson.

## Splitting the app into a Router

By now `src/server.js` is holding configuration, data, and every route in the application. Grow that to twenty routes and it becomes a file nobody wants to open, with merge conflicts every time two people touch it.

`express.Router()` is the tool for splitting it. A router is a small, self-contained routing system with the same interface as `app` — it has `.get`, `.post`, `.route`, and the rest — that you mount at a path prefix on the main application.

Create `src/routes/events.js`:

```javascript
import express from "express";
import { events } from "../data/events.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ count: events.length, events });
});

router.get("/upcoming", (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  res.json(events.filter((event) => event.date >= today));
});

router.get("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "id must be a positive integer" });
  }

  const event = events.find((candidate) => candidate.id === id);

  if (!event) {
    return res.status(404).json({ error: `No event with id ${id}` });
  }

  res.json(event);
});

export default router;
```

And `src/data/events.js`, so the array has one home:

```javascript
export const events = [
  { id: 1, title: "Neighborhood Cleanup", date: "2026-08-02", venue: "Rosa Parks Park" },
  { id: 2, title: "Intro to Soldering", date: "2026-08-09", venue: "Maker Space" },
  { id: 3, title: "Community Potluck", date: "2026-08-16", venue: "Fellowship Hall" },
];
```

Then mount it in `src/server.js`:

```javascript
import express from "express";
import process from "node:process";
import eventsRouter from "./routes/events.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.get("/", (req, res) => {
  res.send("<h1>Community Events Board</h1>");
});

app.use("/events", eventsRouter);

app.listen(PORT, () => {
  console.log(`events-board listening on http://localhost:${PORT}`);
});
```

The important idea is in `app.use("/events", eventsRouter)`: **the prefix is stripped before the router sees the path.** A request to `/events/2` reaches the router as `/2`, which is why the router's routes are written as `/` and `/:id` rather than `/events` and `/events/:id`. Writing the full path inside a mounted router is a classic mistake — it produces working-looking routes at `/events/events/2` that never fire.

Three consequences follow:

- **The prefix lives in exactly one place.** Renaming the resource from `/events` to `/happenings` is a one-line change at the mount point, and every route inside comes along.
- **Routes inside a router are still matched in registration order**, and mounted routers are matched in the order they were mounted. All the ordering rules from the previous section apply, one level down.
- **`req.originalUrl` keeps the full path** while `req.url` is the trimmed version the router sees. When you are debugging inside a router and the path looks wrong, that is why. There is also `req.baseUrl`, which holds the mount prefix.

One parameter detail specific to routers: a router does not inherit parameters captured by its mount path unless you ask. If you mount a router at `/venues/:venueId`, then inside that router `req.params.venueId` is `undefined` by default. Create the router with `express.Router({ mergeParams: true })` to inherit them. You will not need this for the events board, but the day you nest a router it will save you an hour.

How you split is a judgment call, and the useful default is **one router per resource**, in `src/routes/<resource>.js`. The events board will end up with `routes/events.js` for the browser-facing pages and, in a later lesson, a separate router for the JSON API mounted at `/api/events`. Two routers can serve the same underlying data in different formats, and keeping them separate keeps each one's response shape obvious.

## Redirects and the catch-all 404

Two things finish the routing layer: sending a client somewhere else, and answering requests that match nothing.

**`res.redirect(url)`** sends a `302 Found` with a `Location` header, and the browser follows it automatically:

```javascript
app.get("/calendar", (req, res) => {
  res.redirect("/events");
});
```

Supply a status explicitly when you mean something other than a temporary move:

```javascript
res.redirect(301, "/events");    // permanent: the old URL is gone for good
res.redirect(302, "/events");    // temporary: the old URL may come back
res.redirect(303, "/events");    // see other: go look at this instead, with GET
```

The `301` versus `302` distinction has teeth. Browsers **cache a `301` aggressively**, often until the user clears their cache, so a `301` sent by mistake during development can follow you around your own machine for days. Use `302` unless you are certain the move is permanent. `303` matters after a form submission — it tells the browser to issue a `GET` for the new location instead of repeating the `POST`, which is what stops a page refresh from submitting the form twice. You will use it once you can read request bodies.

Redirects are the right tool for keeping old URLs working after you rename something, for normalizing a path (`/Events` to `/events` when you have turned on case-sensitive routing), and for pointing a convenience URL at the canonical one. They are the wrong tool for error handling; a missing event should be a `404`, not a redirect to the list.

**The catch-all `404`.** Express has a built-in final handler that produces a bare `Cannot GET /nope` page. It works, and it is not what you want to serve visitors: it leaks the framework's phrasing, it is always HTML regardless of what the client asked for, and it looks broken.

Register your own at the very bottom of the file:

```javascript
app.use((req, res) => {
  res.status(404).json({
    error: "Not found",
    method: req.method,
    path: req.originalUrl,
  });
});
```

Three details make this work.

**It uses `app.use` with no path**, so it matches every method and every path. That is exactly what you want for a catch-all. Writing `app.get("*", ...)` covers only `GET`, which means a stray `POST` still gets Express's default page — and the `*` wildcard syntax changed between Express 4 and Express 5, so the pathless `app.use` is both broader and more portable.

**It must be registered last**, after every route and every mounted router. Express matches in order, so a catch-all placed in the middle of the file swallows everything below it and your later routes go dead. If every request suddenly returns your `404`, look for a catch-all that drifted up the file.

**It must set the status explicitly.** `res.status(404)` before the body. A catch-all that sends a friendly message with the default `200` is worse than no catch-all at all: crawlers index the page, monitoring reports the service as healthy, and automated clients treat a missing resource as a successful response. This is called a soft 404, and it is a real defect.

A refinement, once the app serves both HTML and JSON: answer in the format the client asked for.

```javascript
app.use((req, res) => {
  res.status(404);

  if (req.accepts("html")) {
    return res.send("<h1>Not found</h1><p><a href=\"/events\">Back to events</a></p>");
  }

  res.json({ error: "Not found", path: req.originalUrl });
});
```

That is the routing layer complete: method and path select a handler, parameters and the query string carry the request's details, order decides which handler wins, routers keep the file navigable, and anything that matches nothing gets a deliberate, correctly-statused answer. What is still missing is everything that should happen *around* every route rather than inside one — logging, parsing request bodies, shared checks. That is middleware, and it is the next lesson.

## Practice

Restructure the events board around a router and give it a complete routing surface.

1. Move the events array into `src/data/events.js` and export it. Add at least two more events, giving at least two of them the same `venue` so filtering has something to do.
2. Create `src/routes/events.js` exporting an `express.Router()`, and mount it in `src/server.js` with `app.use("/events", eventsRouter)`. Confirm that no path string inside the router repeats the `/events` prefix.
3. In the router, add `GET /` returning all events as JSON with a `count`.
4. Add `GET /:id` that converts the parameter with `Number()`, returns `400` for a non-integer or non-positive id, `404` when no event has that id, and the event as JSON otherwise. Test all three outcomes with `curl -i` using `/events/2`, `/events/banana`, and `/events/999`.
5. Add `GET /upcoming` returning only events whose `date` is today or later. Register it **after** `/:id` first, request `/events/upcoming`, and record what you get and why. Then move it above `/:id` and confirm the fix.
6. Extend `GET /` to support `?venue=` and `?limit=`. Ignore unknown query parameters, treat a missing one as "no filter," and return `400` when `limit` is present but not a positive integer. Test `?venue=Maker%20Space`, `?limit=2`, `?limit=banana`, and `?nonsense=1`.
7. Add support for a repeatable `?tag=` parameter, normalizing it to an array with `[].concat(req.query.tag ?? [])`. Prove with `curl` that one `tag` and two `tag`s both work.
8. Add `GET /events/:year/:month` (in the router, as `/:year/:month`) returning the events in that calendar month, and check it does not collide with `/:id`. Explain the result in a comment.
9. Add a `POST /` stub to the router that returns `501` with the JSON body `{ "error": "Not implemented yet" }`, and a comment noting that reading the submitted body requires a body parser you will add in the next lesson.
10. Add `GET /calendar` on the main app that redirects to `/events`. Use `curl -i` to confirm you see a `302` and a `Location` header, then follow it with `curl -iL` and confirm you land on the list.
11. Add a catch-all with `app.use` at the very bottom of `src/server.js` that returns `404` with the method and `req.originalUrl`. Verify with `curl -i http://localhost:3000/nope` and `curl -i -X POST http://localhost:3000/nope`. Then temporarily move it above the router mount, observe that every route now returns `404`, and put it back.

**Deliverable:** a committed project with `src/data/events.js`, `src/routes/events.js`, and a `src/server.js` that mounts the router and ends with a catch-all, plus a `NOTES.md` recording your `curl -i` status lines for every case in steps 4, 6, 10, and 11 and a two-sentence explanation of the ordering failure you produced in step 5.
