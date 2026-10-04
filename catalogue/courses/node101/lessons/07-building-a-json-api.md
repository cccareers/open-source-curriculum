---
lesson_id: node101-07
course_id: node101
pathway: software-developer
title: Building a JSON API
order: 7
kind: lesson
competency_ids:
  - D5-S1-C02
objectives:
  - Build a JSON API that other clients can consume
---

## Designing the resource before you write a route

Lesson 06 gave the events board a face: rendered pages a person reads in a browser. This lesson gives it a second interface over the same data — one designed for programs. A mobile app, a partner site embedding your listings, a script that imports events from a spreadsheet, a front end that fetches without reloading the page. None of them want HTML. They want the data, in a shape they can parse, with enough structure that they can be written against it once and keep working.

That last phrase is the whole subject. An API is a **contract**. When you render a page you can restructure the markup any afternoon and nobody notices, because the only consumer is a browser that re-reads it every time. When you publish an API, someone writes code against your response shape and ships it, and that code keeps running long after you have forgotten it exists. Changing a field name is now a breaking change for a stranger. So the design work happens *before* the routes, and it is design work in the ordinary sense — naming things, defining structures, deciding what is guaranteed.

Start with the resource. The events board has one: an event. Not "getEvents", not "eventFetcher" — a noun, plural, lowercase, and the same word everywhere:

```text
/events
/events/:id
```

The convention is that a path names a **thing**, and the HTTP method says what you are doing to it. That is the opposite of a function call, where the name carries the verb, and it is the adjustment most people have to make consciously the first time. `/getEvents`, `/createEvent`, and `/deleteEventById` are not wrong in the sense of failing, but they throw away everything the method already tells you, and every consumer now has to read your documentation to guess a URL they could have derived.

Two paths cover a resource:

- `/events` — the **collection**. Operations here concern the set: list them, add one.
- `/events/:id` — a **member**. Operations here concern one event: read it, replace it, delete it.

Nesting expresses containment. If an event had attendees, they would live at `/events/:id/attendees`, because an attendee only means something in the context of an event. Do not nest deeper than that without a strong reason; three-level paths get unwieldy and usually mean the inner resource deserves a top-level path of its own.

Keep the naming mechanical so nobody has to remember exceptions: plural nouns, lowercase, hyphens rather than underscores or camel case in path segments, no file extensions, no trailing slash. `/events` and `/event-series`, never `/Events`, `/event_list`, or `/events.json`.

Next, define the shape of an event as it appears on the wire, before you write a line of route code:

```json
{
  "id": "e-104",
  "title": "Saturday Repair Cafe",
  "location": "Marsh Lane Library",
  "startsAt": "2026-08-15T10:00:00.000Z",
  "capacity": 40
}
```

Decisions embedded there, each of which you should be able to defend:

- `id` is a string, not a number. Strings survive a change of id scheme later; numbers invite consumers to do arithmetic on them. This is a change from the numeric ids you have used since lesson 02, so update `src/data/events.js` to match: `1` becomes `"e-101"`, `2` becomes `"e-102"`, and so on. Add a `capacity` to each event (an integer, or `null` for no limit). Any lookup that still converts with `Number(req.params.id)` must go back to comparing strings.
- `startsAt` is an ISO 8601 timestamp in UTC, with an explicit `Z`. Dates are where APIs go wrong most reliably. `"15/08/2026"` is ambiguous between two continents and unparseable without a format guess. ISO 8601 is unambiguous, sorts correctly as a string, and every language can parse it.
- Field names are consistently `camelCase`. `snake_case` is equally valid — what matters is that you pick one and no response ever mixes them.
- The shape is flat and predictable. Every event has every field. A field that is unknown is `null`, not absent, because a consumer checking `event.capacity` should not have to distinguish "missing" from "empty".

Write this shape down. A short `API.md` listing each endpoint, its method, its request body shape, its response shape, and its possible status codes is a design artifact your teammates and your future self will actually use, and producing one is a normal part of the job rather than paperwork.

## Methods and status codes carry meaning

Every method in the table below is already understood by every HTTP client, every proxy, and every developer who has worked on a web service. Using them as intended means a consumer can predict your API's behaviour without reading anything.

| Method | Path | Meaning | Success status |
| --- | --- | --- | --- |
| `GET` | `/events` | list the collection | 200 |
| `POST` | `/events` | create a new event | 201 |
| `GET` | `/events/:id` | read one event | 200 |
| `PUT` | `/events/:id` | replace one event | 200 |
| `DELETE` | `/events/:id` | remove one event | 204 |

Two properties of these methods are worth naming because tooling depends on them.

`GET` is **safe**: it must not change anything. This is not a style preference. Browsers prefetch links, proxies cache responses, and crawlers follow every URL they see. A `GET /events/104/delete` endpoint will eventually be hit by something that was only looking around, and the data will be gone. If a request changes state, it is not a `GET`.

`PUT` and `DELETE` are **idempotent**: sending the same request twice leaves the system in the same state as sending it once. That property is what lets a client safely retry after a timeout, which matters because a timeout does not tell you whether the server acted. `POST` is not idempotent — two identical `POST /events` calls create two events — which is exactly why retrying a create is a genuinely hard problem and why it gets its own solutions in later courses.

Now the status codes. HTTP defines a lot of them; a small set does nearly all the work, and the discipline is using that set precisely rather than sending 200 for everything with an `"ok": false` field in the body.

- **200 OK** — the request succeeded and there is a body. Every successful `GET`, and a `PUT` that returns the updated resource.
- **201 Created** — a `POST` created something. Pair it with a `Location` header, covered below.
- **204 No Content** — succeeded, and there is deliberately nothing to send. The right answer for `DELETE`. A 204 response must have an empty body; sending JSON with a 204 is a protocol violation and some clients will choke on it.
- **400 Bad Request** — the request itself is malformed or fails your input checks. The client sent something wrong and repeating it unchanged will fail again.
- **404 Not Found** — the path is fine but the thing it names does not exist. `GET /events/9999` where 9999 was never an event.

The 400/404 distinction trips people up, so hold onto the difference: **400 means "fix your request", 404 means "that thing is not here."** A missing required field is a 400. A well-formed request for an id nobody ever created is a 404.

Two more you will meet without needing to implement them yet: 401 and 403 concern who is asking (you built a crude version of a 401 gate in lesson 05; real authentication is node200's), and 500 means your server broke, which is lesson 08's subject. Nothing in this lesson should ever deliberately send a 500 — if one appears, you have a bug, and that is precisely the signal a 500 exists to give you.

Errors need a body shape too, and it should be consistent across every endpoint so a consumer can write one error handler rather than five:

```json
{
  "error": {
    "code": "invalid_request",
    "message": "title is required and must be a non-empty string.",
    "field": "title"
  }
}
```

Whatever you choose, use it everywhere. An API that returns `{"error": "..."}` from one route and `{"message": "..."}` from another is a small cruelty to whoever consumes it.

## Reading and writing JSON in Express

With the design settled, the implementation is short — which is the point of doing the design first.

The parser is already mounted. In lesson 05 you added `express.json()` to the pipeline above the routes, so any request arriving with `Content-Type: application/json` has already had its body read and parsed by the time a handler runs. If you skipped that, `req.body` is `undefined` here and no amount of staring at the handler will explain why.

Reading the collection:

```js
router.get("/", (req, res) => {
  res.json({ data: events });
});
```

`res.json(value)` serializes the value with `JSON.stringify`, sets `Content-Type: application/json; charset=utf-8`, and sends it. You do not need `res.send(JSON.stringify(...))` — that works but leaves you setting the content type by hand, and forgetting it means clients receive JSON labelled as HTML.

Notice the collection is wrapped in an object with a `data` key rather than returned as a bare array. That is a deliberate choice with a specific payoff: an object has room to grow. When you add paging in the next section you will need to send a total count alongside the items, and with an envelope you add a field. With a bare array at the top level, adding anything is a breaking change for every consumer. Some well-known APIs return bare arrays and live with it. Choose the envelope and be consistent.

Reading one member:

```js
router.get("/:id", (req, res) => {
  const event = events.find((e) => e.id === req.params.id);

  if (!event) {
    return res.status(404).json({
      error: { code: "not_found", message: `No event with id ${req.params.id}.` },
    });
  }

  return res.json({ data: event });
});
```

`req.params.id` is always a string, because a URL is text. If your ids are numbers internally, convert deliberately — `events.find((e) => e.id === req.params.id)` comparing a number to a string returns `undefined` for every event, and the endpoint 404s on ids that plainly exist. This is a very common first bug and it looks like a data problem when it is a type problem.

Creating one:

```js
// Module scope, next to the imports: the next number to use for a new id.
// Start it above the highest id already in your fixture, so "e-104" follows "e-103".
let nextId = 104;

router.post("/", (req, res) => {
  const { title, location, startsAt, capacity } = req.body ?? {};

  if (typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({
      error: { code: "invalid_request", message: "title is required.", field: "title" },
    });
  }

  if (typeof startsAt !== "string" || Number.isNaN(Date.parse(startsAt))) {
    return res.status(400).json({
      error: {
        code: "invalid_request",
        message: "startsAt is required and must be an ISO 8601 timestamp.",
        field: "startsAt",
      },
    });
  }

  const event = {
    id: `e-${nextId++}`,
    title: title.trim(),
    location: typeof location === "string" ? location.trim() : null,
    startsAt: new Date(startsAt).toISOString(),
    capacity: Number.isInteger(capacity) ? capacity : null,
  };

  events.push(event);

  return res
    .status(201)
    .location(`/events/${event.id}`)
    .json({ data: event });
});
```

Several things in that handler are worth pulling out.

**The input check is deliberately light.** It confirms the required fields are present and roughly the right type, and it rejects with a 400 naming the offending field. It does not check that the title is under 200 characters, that `startsAt` is in the future, that `capacity` is positive, or that this event does not duplicate an existing one. That deeper, rule-driven validation — and the schema libraries that make it maintainable rather than a wall of `if` statements — belongs to **node200**. What you must take from this lesson is the principle underneath: never trust the body. It arrived over the network from a client you do not control, and every field in it is a claim, not a fact.

**The handler builds a new object rather than storing `req.body`.** Writing `events.push(req.body)` would accept every field a caller sent, including fields you never defined, including an `id` they chose themselves, including a hundred-megabyte string in a field name you have never heard of. Constructing the stored object field by field from values you have checked means the shape of your data is decided by your code, not by whoever called you. This one habit prevents a whole family of bugs and a whole family of vulnerabilities.

**It normalizes on the way in.** Trimming the title and re-serializing `startsAt` through `toISOString()` means everything in the array has the same shape regardless of what the caller sent. Normalize once, at the boundary, and everything downstream can assume a canonical form.

**201 plus `Location`.** `res.location(path)` sets the `Location` header, which for a 201 means "the thing you just created lives here." A well-behaved client can follow it without guessing your URL scheme. Returning the created object in the body as well is conventional and saves the client a second request — it lets them see the `id` and any defaults you filled in.

Deleting:

```js
router.delete("/:id", (req, res) => {
  const index = events.findIndex((e) => e.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({
      error: { code: "not_found", message: `No event with id ${req.params.id}.` },
    });
  }

  events.splice(index, 1);
  return res.status(204).end();
});
```

`res.status(204).end()` sends the status and closes the response with no body. Use `.end()`, not `.json()`, for a 204.

Remember that `events` is an in-memory array. Restart the process and every event you created is gone. That is intentional for this course — persistence is node200's and the database courses' subject — but say it out loud so the behaviour never surprises you, and so you do not build anything on the assumption that the array survives a deploy.

## Collections: filtering and paging

`GET /events` returning every event works with twelve events and stops working at twelve thousand. The response gets slow, large, and unusable on a phone. Collections need a way for the caller to ask for a subset, and the query string is where that goes.

The distinction to keep straight: **path segments identify a resource, query parameters modify the request.** `/events/104` is a different thing; `/events?limit=20` is the same thing, described differently. Filtering, sorting, and paging are all modifiers, so all three are query parameters.

```js
router.get("/", (req, res) => {
  const limit = Math.min(Number.parseInt(req.query.limit ?? "20", 10) || 20, 100);
  const offset = Math.max(Number.parseInt(req.query.offset ?? "0", 10) || 0, 0);

  let matched = events;

  if (typeof req.query.location === "string" && req.query.location !== "") {
    const needle = req.query.location.toLowerCase();
    matched = matched.filter((e) => (e.location ?? "").toLowerCase().includes(needle));
  }

  if (req.query.after) {
    const after = Date.parse(req.query.after);
    if (Number.isNaN(after)) {
      return res.status(400).json({
        error: {
          code: "invalid_request",
          message: "after must be an ISO 8601 timestamp.",
          field: "after",
        },
      });
    }
    matched = matched.filter((e) => Date.parse(e.startsAt) >= after);
  }

  const page = matched.slice(offset, offset + limit);

  return res.json({
    data: page,
    meta: { total: matched.length, limit, offset },
  });
});
```

The pieces that matter beyond the mechanics:

**Every query parameter arrives as a string, or as an array of strings if it appears twice, or as `undefined` if it is absent.** `req.query.limit` is `"20"`, never `20`. Parse it, and handle the parse failing. `Number.parseInt("banana", 10)` is `NaN`, and `NaN` propagating into a `slice` produces silently wrong results rather than an error, which is much worse than a crash. The `|| 20` fallback catches that.

**A default limit is not optional, and neither is a maximum.** Without a default, a caller who omits `limit` gets everything and you have not solved anything. Without a maximum, a caller sends `limit=1000000` and you have handed them a way to exhaust your server. Twenty and a hundred are conventional starting points.

**`meta.total` is what makes paging usable.** A client showing "showing 20 of 348" or drawing page buttons needs the total, and it is the count *after* filtering, not the size of the whole collection. Getting that wrong produces a last page that is empty.

**Unknown query parameters are ignored.** A request with `?colour=blue` returns the unfiltered list rather than a 400. That is the conventional and forgiving behaviour, and it means adding a new filter later does not break callers who were already sending something you did not recognize.

Offset paging as written has a real limitation worth knowing: if a new event is created while a caller is walking pages, the offsets shift under them and they can see an item twice or miss one entirely. Cursor-based paging fixes this and is more than you need here. Know the limitation exists so you recognize the bug report when it arrives.

## Who else calls this, and CORS

Your API now works from a terminal. Point a browser-based front end on a different origin at it and every request fails with a message about `Access-Control-Allow-Origin`, and the response you can see plainly in the network tab is not readable from JavaScript.

That is not a bug in your server. It is the **same-origin policy**, a browser rule that stops a page on one site from reading responses from another. Without it, a page you visited could quietly read your webmail using your cookies. The policy is only enforced by browsers — your terminal, another server, and a mobile app are unaffected, which is why the same request that works from a command line fails from a page.

**CORS** — cross-origin resource sharing — is how a server opts in. It is a set of response headers saying which origins may read the response. Express does not send them by default and you should not hand-roll them; use the standard middleware:

```bash
npm install cors
```

```js
import cors from "cors";

app.use("/api/v1/events", cors({ origin: "https://events.example.org" }));
```

Mount it on the API path, above the API router. The rendered pages at `/events` are loaded by browsers navigating to them, not fetched cross-origin, so they do not need CORS headers.

Naming the origin explicitly matters. `cors()` with no options sends `Access-Control-Allow-Origin: *`, which lets any page on the internet read your API. For a genuinely public read-only listing that is a reasonable choice made deliberately. For anything that returns data belonging to a particular person, it is a hole. Configure the origin list on purpose.

One behaviour to expect: for anything beyond a simple request — a `DELETE`, or a `POST` with a JSON content type — the browser first sends an `OPTIONS` request to ask permission, then sends the real one. You will see paired requests in the network tab. The `cors` middleware answers the `OPTIONS` for you, which is most of why you should use it rather than setting headers by hand.

The two symptoms to recognize: a CORS error in the browser console for a request that works fine from the terminal means the headers are missing or the origin does not match. A CORS error on a request that returns a 500 usually means your error path sent a response *without* going through the CORS middleware — a reminder that middleware order from lesson 05 applies to error responses too, which lesson 08 will make concrete.

## Versioning the surface

The last design decision, and the one people skip until it hurts.

Once a consumer depends on your response shape, you cannot change it freely. Renaming `startsAt` to `starts_at`, moving `location` into a nested object, or making a previously optional field required will break code you cannot see and cannot fix. But you also cannot freeze the API forever. Versioning is how both are true at once: publish the change as a new version and keep the old one answering until its consumers have moved.

Some changes are safe on an existing version and some are not. The line is whether existing client code keeps working:

- **Safe:** adding a new field to a response, adding a new optional field to a request, adding an entirely new endpoint, adding a new query parameter with a sensible default.
- **Breaking:** removing or renaming a response field, changing a field's type, making an optional request field required, changing a status code, changing the meaning of an existing field.

That first list is why the envelope from earlier pays off: adding `meta` to a response whose `data` key already existed breaks nobody.

The most common way to express a version is a path prefix, and it costs almost nothing to add now:

```js
import eventsRouter from "./routes/events.js";

app.use("/api/v1/events", eventsRouter);
```

Every endpoint is now `/api/v1/events…`. When a genuinely breaking change becomes necessary you write `routes/events-v2.js`, mount it at `/api/v2/events`, and both run side by side while consumers migrate. Because a router is a self-contained middleware stack, this costs one line.

The `/api` segment earns its place separately: it keeps the machine interface from colliding with the human one. Lesson 06's rendered pages live at `/events`, this API lives at `/api/v1/events`, and both read the same in-memory array from the same module. That is the normal shape of a small web application — one data source, two presentations — and it is worth pausing on, because it is the reason the design work at the top of this lesson was about the *data* and not about the routes. The routes are a thin layer over a model that both interfaces share.

The alternatives to path versioning — a custom header, a `?version=` parameter, or content negotiation via `Accept` — all exist and all have advocates. Path versioning is the most visible and the easiest to test, which at your stage outweighs the arguments against it. What is not defensible is no version at all, because retrofitting one after consumers exist means doing it during an outage.

Document the version alongside the shapes. Your `API.md` should say what `v1` guarantees, and a changelog entry should record every addition. An API without written guarantees is not a contract, it is a hope.

## Practice

You will publish the events board's data as a versioned JSON API, designed on paper before it is written in code.

1. Write `API.md` in the project root **before writing any route code**. Document five endpoints — list, create, read, replace, delete — each with its method, path, request body shape, response body shape, and every status code it can return. Include the canonical event object, the error object shape, and one sentence stating what `v1` guarantees will not change.
2. Mount the events router at `/api/v1/events` in `app.js`, leaving lesson 06's HTML routes at `/events` untouched. Confirm both still work and that both read the same array.
3. Implement `GET /api/v1/events` returning `{ data, meta }` with `limit` (default 20, maximum 100) and `offset` query parameters, plus a `location` substring filter and an `after` timestamp filter. Return a 400 with your standard error shape when `after` is unparseable.
4. Implement `GET /api/v1/events/:id`, returning 200 with `{ data }` or 404 with your error shape. Confirm `req.params.id` is a string and that your comparison accounts for it.
5. Implement `POST /api/v1/events`. Check that `title` is a non-empty string and `startsAt` parses as a date; reject with 400 and a `field` naming the problem otherwise. Build the stored object field by field — do not push `req.body`. Respond 201 with a `Location` header and the created event in the body.
6. Implement `DELETE /api/v1/events/:id` returning 204 with an empty body, or 404. Confirm with `curl -i` that the 204 response genuinely has no body.
7. Exercise every endpoint from the command line and save the transcript. At minimum: a create, a read of the created id, a list with `?limit=2`, a list with a filter that matches nothing, a create missing `title`, a read of an id that does not exist, a delete, and a second delete of the same id. Record the status code for each.
8. Send a `POST` with a valid JSON body but **no** `Content-Type: application/json` header. Record what `req.body` is and which status came back, then explain in one sentence which middleware from lesson 05 is responsible.
9. Install and mount `cors` for the `/api/v1` routes with an explicit origin rather than `*`. Write one sentence in `API.md` stating which origins may call the API and why.

**Deliverable:** the `API.md` from step 1, updated to match what you actually built, with an appended "Transcript" section containing the step 7 requests and their status codes and bodies, your step 8 answer, and a short "Breaking changes" list naming three changes you could make to this API safely and three you could not.

## Check your understanding

1. A client sends `POST /api/v1/events` with no `title`. A different client sends `GET /api/v1/events/e-999`, and no such event exists. Which status does each get?
   *`400` for the missing field (fix your request) and `404` for the unknown id (that thing is not here).*
2. Why build the stored event field by field instead of `events.push(req.body)`?
   *The body is untrusted. Pushing it stores any field the caller sent, including an `id` they chose or a huge string, so your data's shape is decided by strangers instead of by your code.*
3. Why wrap the list in `{ data: [...] }` instead of returning a bare array?
   *An object has room to grow. Adding `meta` for paging later is a safe change; adding anything to a bare array is a breaking one.*
4. Your `DELETE` returns `res.status(204).json({ deleted: true })`. What is wrong?
   *A `204` must have no body. Use `res.status(204).end()`.*
5. A front end on another origin gets a CORS error, but the same request works from `curl`. Is the API broken?
   *No. The same-origin policy is enforced only by browsers. The server has to opt in with CORS headers for that origin, using the `cors` middleware with an explicit `origin`.*
6. Name one change you could make to `v1` safely and one that would require `v2`.
   *Safe: adding a new response field or a new optional query parameter. Breaking: renaming `startsAt`, changing a field's type, or making an optional request field required.*
