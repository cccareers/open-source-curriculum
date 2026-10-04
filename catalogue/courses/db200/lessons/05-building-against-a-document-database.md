---
lesson_id: db200-05
course_id: db200
pathway: software-developer
title: Building Against a Document Database
order: 5
kind: lesson
competency_ids:
  - D2-S1-C04
objectives:
  - Build an application feature against a document database
---

## Getting a database and a driver

Everything so far has been on paper. This lesson is hands-on: you will connect a Node application to MongoDB and build a working feature against it. MongoDB is the default here because it is the most widely deployed document store and the one you are most likely to meet on a job; the concepts transfer to Couchbase, DocumentDB, and Firestore with different method names.

Get a database. Either is fine:

```bash
docker run -d --name mongo -p 27017:27017 mongo:7
```

Or create a free shared cluster on MongoDB Atlas, which gives you a connection string that starts with `mongodb+srv://`. Atlas is closer to what production looks like and forces you to deal with credentials from the start, which is a good habit. Local Docker is faster to iterate against.

Install the official driver — not Mongoose. Mongoose is a popular object-document mapper that adds schemas and models on top, and it is worth learning eventually, but it hides exactly the mechanics you need to see right now.

```bash
npm install mongodb
```

Also install `mongosh`, the shell, or use the one bundled in the Docker image with `docker exec -it mongo mongosh`. Being able to look at your data outside your application is not optional; half of debugging is confirming what is actually stored.

Put the connection string in the environment, exactly as you did with `PORT` in node101, and never in source:

```bash
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=events_board
```

## Connecting once, correctly

The single most common mistake is connecting per request. `MongoClient` maintains an internal connection pool; creating one per request means opening and tearing down sockets thousands of times a minute, and it will fall over under load. Create **one** client for the process, connect at startup, and reuse it.

```javascript
// src/db.js
import { MongoClient } from "mongodb";
import process from "node:process";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri || !dbName) {
  throw new Error("MONGODB_URI and MONGODB_DB must be set");
}

const client = new MongoClient(uri, {
  maxPoolSize: 20,
  serverSelectionTimeoutMS: 5000,
});

let db;

export async function connect() {
  await client.connect();
  db = client.db(dbName);
  await db.command({ ping: 1 });
  console.log(`connected to ${dbName}`);
  return db;
}

export function getDb() {
  if (!db) throw new Error("connect() has not completed");
  return db;
}

export async function close() {
  await client.close();
}
```

Three details worth understanding rather than copying.

`serverSelectionTimeoutMS` bounds how long the driver waits for a reachable server before failing. The default is thirty seconds, which in practice means a misconfigured URI hangs your startup for half a minute before telling you anything. Five seconds fails fast and readably.

The `ping` command is a deliberate startup check. `client.connect()` can resolve before the driver has actually confirmed a usable server, so pinging turns "probably fine" into "confirmed." Crash at startup on a bad database rather than on the first user request.

`getDb()` throwing when `db` is unset makes the ordering error loud. Without it, a module that grabs the database at import time gets `undefined` and fails much later with a confusing message.

Wire it into your server's lifecycle:

```javascript
// src/server.js
import express from "express";
import process from "node:process";
import { connect, close } from "./db.js";
import { eventsRouter } from "./routes/events.js";
import { ensureIndexes } from "./repositories/events.js";
import { ensureIndexes as ensureRsvpIndexes } from "./repositories/rsvps.js";

const app = express();
app.disable("x-powered-by");
app.use(express.json());
app.use("/events", eventsRouter);

const PORT = Number(process.env.PORT) || 3000;

await connect();
await ensureIndexes();
await ensureRsvpIndexes();

const server = app.listen(PORT, () => {
  console.log(`events-board listening on http://localhost:${PORT}`);
});

process.on("SIGTERM", async () => {
  server.close();
  await close();
  process.exit(0);
});
```

The `rsvps` repository later in this lesson defines its own `ensureIndexes`, imported here under a different name. Don't skip that call. It creates the unique index that makes double registration impossible, and without it the duplicate-key protection silently isn't there.

Closing the client on `SIGTERM` matters more here than it did with a plain HTTP server: an unclosed pool leaves sockets open on the database side, and a service that restarts frequently will exhaust the server's connection limit.

## Documents, `_id`, and BSON

Every document has an `_id`, unique within the collection and indexed automatically. If you do not supply one, the driver generates an `ObjectId` — a 12-byte value made of a 4-byte creation timestamp (in seconds), a 5-byte random value fixed per process, and a 3-byte counter. Older documentation describes a machine identifier and process id in the middle bytes; current drivers use the random value instead. Two consequences follow: `ObjectId` values sort roughly by creation time, so sorting by `_id` is a cheap proxy for sorting by insertion order, and you can supply your own `_id` when you have a natural key such as an email or an order number, which saves an index.

The wire format is BSON, not JSON. It is JSON's data model plus real types: `Date`, `ObjectId`, `Decimal128`, `Binary`, 32- and 64-bit integers. This matters immediately in two places.

**Store dates as `Date` objects, not strings.** A `Date` sorts and range-queries correctly. An ISO string sorts correctly only by accident of formatting and cannot be compared to a computed time without parsing.

**Never store money as a floating-point number.** `0.1 + 0.2` is as wrong in BSON as it is in JavaScript. Store integer cents, or use `Decimal128`.

And `_id` values arriving from an HTTP request are strings. `{ _id: "68a1..." }` will not match a document whose `_id` is an `ObjectId`; you have to convert, and the conversion throws on malformed input:

```javascript
import { ObjectId } from "mongodb";

export function toObjectId(value) {
  if (!ObjectId.isValid(value)) return null;
  return new ObjectId(value);
}
```

Returning `null` rather than throwing lets the route answer `400` for a bad id instead of `500` for an exception, which is the distinction lesson 03 of node101 made about status codes and it applies exactly here.

## A repository module

Keep database code out of your route handlers. Routes deal in HTTP; a repository deals in documents. The seam makes both testable and means a query change never touches a route.

```javascript
// src/repositories/events.js
import { getDb } from "../db.js";

const COLLECTION = "events";

function events() {
  return getDb().collection(COLLECTION);
}

export async function ensureIndexes() {
  await events().createIndexes([
    { key: { city: 1, startsAt: -1 }, name: "city_startsAt" },
    { key: { hostId: 1, startsAt: -1 }, name: "host_startsAt" },
    { key: { slug: 1 }, name: "slug_unique", unique: true },
    { key: { tags: 1 }, name: "tags" },
  ]);
}
```

`createIndexes` is idempotent — an index that already exists with the same specification is left alone — so calling it at startup is safe. Do that only while the collection is small; on a large production collection, index builds are a deliberate operational task, not something a deploy triggers by surprise.

Now the writes.

```javascript
export async function createEvent(input) {
  const doc = {
    title: input.title,
    slug: input.slug,
    description: input.description ?? "",
    city: input.city.toLowerCase(),
    startsAt: new Date(input.startsAt),
    venue: input.venue,
    host: { userId: input.host.userId, name: input.host.name },
    tags: input.tags ?? [],
    attendeeCount: 0,
    recentAttendees: [],
    schemaVersion: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await events().insertOne(doc);
  return { ...doc, _id: result.insertedId };
}
```

`insertOne` returns an acknowledgement and the generated `insertedId`, not the document — hence reassembling it for the caller. Note that the shape is built explicitly field by field rather than spreading `input`. Spreading a request body straight into a document lets a caller write any field they like into your collection, including `attendeeCount`, and there is no schema stopping them.

Reads:

```javascript
export async function findBySlug(slug) {
  return events().findOne({ slug });
}

export async function listUpcoming({ city, limit = 20, before }) {
  const filter = { city: city.toLowerCase(), startsAt: { $gte: new Date() } };
  if (before) filter.startsAt.$lte = new Date(before);

  return events()
    .find(filter)
    .project({ title: 1, slug: 1, startsAt: 1, venue: 1, attendeeCount: 1 })
    .sort({ startsAt: -1 })
    .limit(Math.min(limit, 100))
    .toArray();
}
```

`findOne` returns the document or `null`. `find` returns a **cursor**, which has executed nothing yet — the query runs when you iterate it or call `toArray()`. That laziness is why `.project()`, `.sort()`, and `.limit()` can be chained after the fact: you are building a query, not filtering an array.

`.project()` selects fields. Use it on every list query. It reduces what crosses the network and, when a projection is covered entirely by an index, lets the server answer without touching the documents at all.

`Math.min(limit, 100)` is a small thing that prevents a large thing. A caller passing `?limit=1000000` should not be able to make your process allocate an array of a million documents.

For a large result set, iterate the cursor rather than materializing it:

```javascript
export async function forEachUpcoming(city, fn) {
  const cursor = events().find({ city, startsAt: { $gte: new Date() } });
  try {
    for await (const doc of cursor) {
      await fn(doc);
    }
  } finally {
    await cursor.close();
  }
}
```

`toArray()` on an unbounded query is the classic way to exhaust a Node process's memory. The `finally` block matters because an early `break` or a thrown error otherwise leaves a server-side cursor open until it times out.

## Updating without clobbering

The rule that surprises people arriving from SQL: an update whose second argument is a plain object **replaces the entire document**.

```javascript
// Wrong: every field except title is deleted.
await events().updateOne({ slug }, { title: "New title" });
```

Modern drivers reject that outright, which is a mercy. What you want is an update operator:

```javascript
export async function updateEvent(slug, changes) {
  const $set = { updatedAt: new Date() };
  for (const field of ["title", "description", "startsAt", "venue", "tags"]) {
    if (changes[field] !== undefined) {
      $set[field] = field === "startsAt" ? new Date(changes[field]) : changes[field];
    }
  }

  const result = await events().findOneAndUpdate(
    { slug },
    { $set },
    { returnDocument: "after", projection: { description: 0 } },
  );
  return result;
}
```

An allow-list of updatable fields is the same defence as building the insert explicitly: a `PATCH` body is attacker-controlled, and without the list a caller can set `host.userId` and take over someone's event.

`findOneAndUpdate` applies the change and returns the document in one atomic round trip. This code assumes version 6 or later of the `mongodb` driver, where `findOneAndUpdate` returns the document itself (or `null`). Version 5 and earlier returned a wrapper object with the document under `.value`, so older tutorials show `result.value`. `returnDocument: "after"` gives you the new version; `"before"` gives the old one, which is what you want when you need to know what changed. It returns `null` when nothing matched, which is how a route distinguishes `200` from `404`.

The operators you will use constantly:

```javascript
{ $set:   { status: "cancelled" } }                     // set or create a field
{ $unset: { cancelledReason: "" } }                     // remove a field
{ $inc:   { attendeeCount: 1 } }                        // atomic numeric change
{ $push:  { tags: "beginner" } }                        // append to an array
{ $addToSet: { tags: "beginner" } }                     // append only if absent
{ $pull:  { tags: "beginner" } }                        // remove matching elements
{ $setOnInsert: { createdAt: new Date() } }             // only when an upsert inserts
{ $currentDate: { updatedAt: true } }                   // server-side timestamp
```

`$inc` deserves emphasis because it is where a whole class of bug disappears. Reading `attendeeCount`, adding one in JavaScript, and writing it back is a lost-update race: two concurrent registrations both read 41 and both write 42. `$inc` is applied by the server atomically, so both land and the count is 43. Any time you are tempted to read-modify-write a single field, look for an operator that does it in place.

An **upsert** inserts when nothing matched:

```javascript
export async function recordVenue(venue) {
  await getDb().collection("venues").updateOne(
    { name: venue.name },
    { $set: { address: venue.address, capacity: venue.capacity },
      $setOnInsert: { createdAt: new Date() } },
    { upsert: true },
  );
}
```

`$setOnInsert` runs only on the insert path, which is how you get a `createdAt` that does not move every time the record is touched.

## The feature: registering an attendee

Now put it together into a real feature — the one that motivated the subset and computed patterns from the last lesson. Registering an attendee must add an RSVP, increment the count, and keep a short list of recent attendees on the event for the detail page.

```javascript
// src/repositories/rsvps.js
import { getDb } from "../db.js";

export async function ensureIndexes() {
  await getDb().collection("rsvps").createIndexes([
    { key: { eventId: 1, userId: 1 }, name: "one_rsvp_per_user", unique: true },
    { key: { userId: 1, createdAt: -1 }, name: "user_recent" },
  ]);
}

export async function register(eventId, user) {
  const db = getDb();

  try {
    await db.collection("rsvps").insertOne({
      eventId,
      userId: user.id,
      name: user.name,
      createdAt: new Date(),
    });
  } catch (err) {
    if (err.code === 11000) return { ok: false, reason: "already_registered" };
    throw err;
  }

  const event = await db.collection("events").findOneAndUpdate(
    { _id: eventId },
    {
      $inc: { attendeeCount: 1 },
      $push: {
        recentAttendees: {
          $each: [{ userId: user.id, name: user.name }],
          $position: 0,
          $slice: 10,
        },
      },
      $currentDate: { updatedAt: true },
    },
    { returnDocument: "after" },
  );

  return { ok: true, attendeeCount: event.attendeeCount };
}
```

Several things are load-bearing here.

The **unique index on `{ eventId, userId }`** is what makes double registration impossible. Checking "has this user already registered?" with a `findOne` and then inserting is a race: two concurrent requests both find nothing and both insert. The index is enforced by the server, so exactly one insert wins and the other fails with error code **11000**, duplicate key. Catching 11000 and converting it to a business outcome is the correct pattern, and it is worth memorizing that number.

`$push` with `$each`, `$position: 0`, and `$slice: 10` maintains a bounded, newest-first list in a single atomic operation. That is the subset pattern from the previous lesson expressed in one update — the array can never grow past ten elements, so the event document cannot bloat.

And the honest caveat: those are **two** writes, and nothing makes them atomic together. A crash between them leaves an RSVP with a stale count. Options are a transaction, a reconciliation job that recomputes counts, or accepting the drift because a count being off by one is cosmetic. Naming the exposure is the part that matters; picking silently is the failure.

If you do need atomicity, a transaction requires a replica set — a standalone `mongod` will not do it, which is a common source of confusion when the code works on Atlas and fails locally. The `docker run` command at the top of this lesson starts a standalone server. To practice transactions locally, start a single-node replica set instead:

```bash
docker run -d --name mongo-rs -p 27017:27017 mongo:7 --replSet rs0
docker exec mongo-rs mongosh --quiet --eval 'rs.initiate({_id: "rs0", members: [{_id: 0, host: "localhost:27017"}]})'
```

Then connect with `MONGODB_URI=mongodb://localhost:27017/?replicaSet=rs0`. A one-node replica set gives you transactions without any of the fault tolerance, which is fine for learning and never for production.

The transaction version of `register`:

```javascript
export async function registerAtomically(client, eventId, user) {
  const session = client.startSession();
  try {
    return await session.withTransaction(async () => {
      const db = client.db(process.env.MONGODB_DB);
      await db.collection("rsvps").insertOne(
        { eventId, userId: user.id, name: user.name, createdAt: new Date() },
        { session },
      );
      await db.collection("events").updateOne(
        { _id: eventId },
        { $inc: { attendeeCount: 1 } },
        { session },
      );
    });
  } finally {
    await session.endSession();
  }
}
```

Every operation inside must be passed the `session`, and forgetting it on one line silently takes that operation outside the transaction. Transactions here cost real performance and are the exception, not the default; the single-document guarantees are what you should reach for first.

## Aggregation for the reporting query

Filtering and sorting cover most reads. Grouping, joining, and reshaping happen in the aggregation pipeline: an array of stages, each transforming the stream from the last.

```javascript
export async function attendanceByVenue(city, since) {
  return getDb().collection("events").aggregate([
    { $match: { city, startsAt: { $gte: since } } },
    { $group: {
        _id: "$venue.name",
        events: { $sum: 1 },
        attendees: { $sum: "$attendeeCount" },
        avgAttendance: { $avg: "$attendeeCount" },
    } },
    { $match: { events: { $gte: 2 } } },
    { $sort: { attendees: -1 } },
    { $limit: 20 },
    { $project: { _id: 0, venue: "$_id", events: 1, attendees: 1,
                  avgAttendance: { $round: ["$avgAttendance", 1] } } },
  ]).toArray();
}
```

Read it as SQL if it helps: `$match` before a `$group` is a `WHERE`, `$group` is `GROUP BY`, `$match` after it is a `HAVING`, `$sort` and `$limit` are themselves, and `$project` is the `SELECT` list. Field references inside stages are strings prefixed with `$`, and dotted paths reach into subdocuments.

**Put `$match` first, always.** It is the one stage that can use an index, and only while it is at the front of the pipeline. A `$match` after a `$group` filters a result set the server already paid to compute.

`$lookup` performs a left outer join against another collection:

```javascript
{ $lookup: { from: "rsvps", localField: "_id", foreignField: "eventId", as: "rsvps" } }
```

It works, and it is the tool of last resort. It runs per input document, it does not parallelize across shards well, and reaching for it repeatedly is the signal from lesson 02 that your data wants to be together — or wants to be in Postgres.

## The route layer

With the repository in place, the HTTP layer stays thin, which is the point.

```javascript
// src/routes/events.js
import { Router } from "express";
import { findBySlug, listUpcoming, updateEvent } from "../repositories/events.js";
import { register } from "../repositories/rsvps.js";

export const eventsRouter = Router();

eventsRouter.get("/", async (req, res, next) => {
  try {
    const city = req.query.city;
    if (typeof city !== "string" || city.length === 0) {
      return res.status(400).json({ error: "city is required" });
    }
    const limit = Number(req.query.limit) || 20;
    res.json(await listUpcoming({ city, limit }));
  } catch (err) {
    next(err);
  }
});

eventsRouter.get("/:slug", async (req, res, next) => {
  try {
    const event = await findBySlug(req.params.slug);
    if (!event) return res.status(404).json({ error: "event not found" });
    res.json(event);
  } catch (err) {
    next(err);
  }
});

eventsRouter.post("/:slug/rsvp", async (req, res, next) => {
  try {
    const event = await findBySlug(req.params.slug);
    if (!event) return res.status(404).json({ error: "event not found" });

    const result = await register(event._id, { id: req.body.userId, name: req.body.name });
    if (!result.ok && result.reason === "already_registered") {
      return res.status(409).json({ error: "already registered" });
    }
    res.status(201).json({ attendeeCount: result.attendeeCount });
  } catch (err) {
    next(err);
  }
});

eventsRouter.patch("/:slug", async (req, res, next) => {
  try {
    const updated = await updateEvent(req.params.slug, req.body);
    if (!updated) return res.status(404).json({ error: "event not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});
```

Two rules for async route handlers. Every one needs its errors forwarded — in Express 4, an async handler that rejects without a `try`/`catch` calling `next(err)` hangs the request forever, because the framework never sees the rejection. Express 5 forwards rejected promises to the error handler automatically, but the explicit `try`/`catch` works in both versions, so keep it until you know which one your project runs. And **never put a driver error in a response body.** It can contain the connection string, the collection name, and the shape of the failing query. Log it server-side, send a generic message.

`409 Conflict` for a duplicate RSVP is the right status: the request was well-formed and the state of the resource made it impossible, which is not a `400` and definitely not a `500`.

## Checking your work

Get comfortable in `mongosh` — assumptions about what is stored are wrong more often than the code is.

```javascript
use events_board
db.events.findOne({ slug: "intro-to-soldering" })
db.events.countDocuments({ city: "oakland" })
db.rsvps.find({ eventId: ObjectId("...") }).limit(5)
db.events.getIndexes()
```

And use `explain` to prove an index is being used rather than assuming it:

```javascript
db.events.find({ city: "oakland", startsAt: { $gte: new Date() } })
         .sort({ startsAt: -1 })
         .explain("executionStats")
```

Read two fields in the output. `stage: "IXSCAN"` means an index was used; `stage: "COLLSCAN"` means the whole collection was read. And compare `totalDocsExamined` with `nReturned` — examining 40,000 documents to return 20 is an index you do not have, even if the query is fast today on a small collection. This is the fastest feedback loop you have for the index design from the previous lesson, and it turns index choice from an opinion into a measurement.

## Practice

Build the events board feature end to end against a real MongoDB instance.

1. Start MongoDB locally with Docker or create an Atlas cluster. Put `MONGODB_URI` and `MONGODB_DB` in a `.env` file that `.gitignore` excludes, and load it with `node --env-file=.env`.
2. Write `src/db.js` with a single client, a `connect()` that pings, `getDb()`, and `close()`. Prove the fail-fast path by pointing `MONGODB_URI` at a wrong port and confirming the process exits within about five seconds with a readable message.
3. Write `src/repositories/events.js` with `ensureIndexes`, `createEvent`, `findBySlug`, `listUpcoming`, and `updateEvent`. Store `startsAt` as a `Date` and use an allow-list in `updateEvent`.
4. Seed at least 50 events across three cities with varied dates and attendee counts, using a script that reads a JSON fixture and calls `insertMany`.
5. Write `src/repositories/rsvps.js` with the unique index on `{ eventId, userId }` and a `register` that catches error code 11000. Prove the index works by firing two concurrent registrations for the same user with `Promise.all` and confirming exactly one succeeds.
6. Wire up the Express routes for list, detail, RSVP, and patch, with `400`, `404`, and `409` handled explicitly. Exercise each with `curl -i` and record the status line for each case.
7. Confirm the `recentAttendees` array never exceeds ten entries by registering fifteen different users against one event, then reading the document in `mongosh`.
8. Write the `attendanceByVenue` aggregation and add a `GET /events/reports/venues` route for it. Compare the result against a count you compute by hand from your seed data.
9. Run `explain("executionStats")` on `listUpcoming`'s query both before and after creating the `city_startsAt` index. Record `stage`, `nReturned`, and `totalDocsExamined` for both, and write one sentence explaining the difference.
10. Deliberately break something: crash the process between the RSVP insert and the count increment, then write a short `reconcile.js` script that recomputes `attendeeCount` for every event from the `rsvps` collection and reports how many were wrong.

**Deliverable:** a committed events-board service with `db.js`, two repository modules, the routes, a seed script, and a `NOTES.md` holding your `curl -i` results from step 6, both `explain` outputs from step 9, and the reconciliation report from step 10.

## Check your understanding

1. Why create one `MongoClient` per process instead of one per request?
2. `updateOne({ slug }, { title: "New title" })` — what would this have done without update operators, and what does a modern driver do instead?
3. Two requests register the same user for the same event at the same moment. What stops both from succeeding, and what does the losing request see?
4. Your `register` function does two writes. What's the exposure if the process crashes between them, and what are your three options?

*Answers:* (1) The client holds a connection pool. Creating one per request opens and closes sockets constantly and falls over under load. (2) It would have replaced the whole document with `{ title }`. Modern drivers throw an error saying update documents need atomic operators. (3) The unique index on `{ eventId, userId }`. The second insert fails with error code 11000, which the code turns into `already_registered` and the route turns into `409`. (4) The RSVP exists but `attendeeCount` is one too low. You can use a transaction (needs a replica set), run a reconciliation job, or accept cosmetic drift, and you should name whichever you choose.
