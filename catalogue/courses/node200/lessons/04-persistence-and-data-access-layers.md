---
lesson_id: node200-04
course_id: node200
pathway: software-developer
title: Persistence and Data Access Layers
order: 4
kind: lesson
competency_ids:
  - D2-S1-C04
  - D5-S1-C02
objectives:
  - Separate data access from request handling in a service
---

## The array has to go

Every version of the events board so far has kept its data in a module-level array. Restart the process and the data is gone. Run two copies behind a load balancer and they disagree about reality. That was deliberate — it kept a database out of the way while you learned HTTP — and it is now the single largest untruth in the codebase.

Replacing it is not just a matter of swapping storage. The interesting question is *where the database code is allowed to live*, because that decision determines how testable, how changeable, and how safe the service is for the rest of its life. This lesson builds the storage layer behind the boundary you drew in lesson 02 and keeps everything above that boundary ignorant of it.

Here is the shape you are avoiding, which is what most tutorials will show you:

```javascript
// DON'T: route handler with SQL in it
eventsRouter.get("/:id", async (req, res) => {
  const { rows } = await pool.query(
    `SELECT * FROM events WHERE id = $1`, [req.params.id],
  );
  if (rows.length === 0) return res.status(404).render("404");
  const attendees = await pool.query(
    `SELECT * FROM registrations WHERE event_id = $1`, [req.params.id],
  );
  res.render("events/detail", { event: rows[0], attendees: attendees.rows });
});
```

It works. It is also four problems in eleven lines. The route cannot be exercised without a database, so testing the HTTP behaviour requires standing up Postgres. The `SELECT *` means the template now depends on the column list, so a migration can break a view with no code change. The same two queries will be copy-pasted into the next handler that needs an event, and one copy will eventually be edited and the other not. And nothing here can be reused by a scheduled job or a command-line script, because it is welded to `req` and `res`.

## The stack this course uses

Persistence choices are a real decision with real trade-offs, but a course that changes stacks between lessons teaches nothing. This course uses:

- **PostgreSQL** as the database. It is the default relational choice in this pathway, it is what your db100 SQL transfers to directly, and it is available everywhere.
- **Knex** as the query builder, including its migration and seed tooling.
- **The repository pattern**, hand-written, as the boundary.

A **query builder** sits between raw SQL strings and a full object-relational mapper. Raw SQL through the `pg` driver gives you complete control and no help — you concatenate strings, manage placeholders by hand, and write your own migration runner. An ORM such as Sequelize or Prisma gives you model objects, relationship loading, and generated migrations, at the cost of a large abstraction between you and the query that actually runs. A query builder gives you composable, parameterized SQL in JavaScript, a migration runner, and a connection pool, while leaving the SQL recognisably SQL. For an apprentice who has just learned SQL, that middle position keeps the thing you learned visible.

Whichever your workplace uses, the boundary in this lesson is the same. The repository is the only module that knows which one you picked — which is exactly what makes the choice survivable.

```bash
npm install knex pg
```

## Connecting once, in one place

A database connection is expensive to open, so you never open one per request. You open a **pool** at startup — a set of connections held ready and lent out per query — and every query borrows from it.

```javascript
// src/db/knex.js
import knexFactory from "knex";
import { config } from "../config/index.js";

export const db = knexFactory({
  client: "pg",
  connection: config.databaseUrl,
  pool: { min: 2, max: 10 },
});
```

Add the URL to your config module from lesson 02, so a missing value fails at startup:

```javascript
// src/config/index.js — addition
databaseUrl: required("DATABASE_URL"),
```

```bash
# .env.example
DATABASE_URL=postgres://events:events@localhost:5432/events_board
```

Two details about pool sizing. `max` is the maximum number of connections this process will hold, and it is not a performance dial you turn up when things are slow — Postgres itself has a global connection limit (often 100), and every process, every replica, and every background job draws from the same budget. Ten per process is a reasonable default. If you exhaust the pool, requests queue for a connection and eventually time out, which produces a very specific symptom you will meet again in lesson 08: the service gets slow all at once, across every endpoint, without any single query being slow.

The pool must also be closed when the process stops, or a deploy leaves connections hanging until Postgres times them out. `server.js` already handles `SIGTERM`, so extend it:

```javascript
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, closing server");
  server.close(async () => {
    await db.destroy();
    process.exit(0);
  });
});
```

Order matters: stop accepting requests first, then close the pool, or an in-flight request loses its connection mid-query.

## Schema as code: migrations

Never create a table by typing SQL into a console. The schema is part of the application and belongs in version control, as an ordered series of **migrations** — small scripts that move the database from one version to the next, applied in the same order on every machine.

Knex needs a config file at the project root:

```javascript
// knexfile.js
import "dotenv/config";

export default {
  client: "pg",
  connection: process.env.DATABASE_URL,
  migrations: { directory: "./migrations", extension: "js" },
  seeds: { directory: "./seeds" },
};
```

```bash
npx knex migrate:make create_events
```

That writes a timestamped file. The timestamp is the ordering, which is why you never rename or reorder a migration once it has run anywhere but your own laptop.

```javascript
// migrations/20260304120000_create_events.js
export async function up(knex) {
  await knex.schema.createTable("organizers", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.string("email", 254).notNullable().unique();
    t.string("display_name", 120).notNullable();
    t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("events", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.string("title", 120).notNullable();
    t.text("description");
    t.timestamp("starts_at", { useTz: true }).notNullable();
    t.string("venue", 120).notNullable();
    t.integer("capacity").notNullable().defaultTo(0);
    t.uuid("organizer_id").notNullable()
      .references("id").inTable("organizers").onDelete("CASCADE");
    t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.index(["starts_at"], "events_starts_at_idx");
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("events");
  await knex.schema.dropTableIfExists("organizers");
}
```

```bash
npx knex migrate:latest      # apply everything pending
npx knex migrate:rollback    # undo the last batch
npx knex migrate:status      # what has run
```

Several decisions in that file are worth defending, because they are the ones reviewers ask about.

**Constraints belong in the database, not only in the application.** `notNullable`, `unique`, and the foreign key are enforced by Postgres regardless of what calls it — a script, a console, a second service, a bug. Application-level checks are for good error messages; database constraints are for correctness. You want both, and you want the database one to be the one you rely on.

**Timestamps are stored with a time zone.** `timestamp with time zone` stores an absolute instant; `timestamp` without one stores a wall-clock reading with no way to know whose clock it was. An events application, of all things, must not be ambiguous about when something starts. Store instants in UTC, format for display at the edge.

**`onDelete("CASCADE")` is a decision, not a default.** Deleting an organizer deletes their events. That may be right, or it may be a data-loss bug waiting for a mis-click; the alternative is `RESTRICT`, which refuses the delete while events exist. Choose deliberately and record the choice in the design note from lesson 02.

**The index is not premature.** `events_starts_at_idx` exists because the primary listing query orders by `starts_at`, and an index on the column a query sorts and filters on is the difference between a scan of the whole table and a range read. Add indexes for the queries you know you have; do not carpet the table with them, because every index makes writes slower.

**Never edit a migration that has already run** anywhere other than your own machine. Write a new one. A migration is a historical record: editing one means two databases claim the same version and hold different schemas, which is a genuinely bad afternoon.

Finally, migrations need a `down` that actually reverses the `up`, and you should test it once — `migrate:rollback` then `migrate:latest` — because the moment you need it is the moment a deploy is failing.

## The repository

A **repository** is a module that owns one table's worth of queries. It takes and returns plain domain objects. It contains no rules and no HTTP.

```javascript
// src/repositories/events.repository.js
import { db } from "../db/knex.js";

const COLUMNS = [
  "id", "title", "description", "starts_at", "venue",
  "capacity", "organizer_id", "created_at",
];

function toDomain(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    startsAt: row.starts_at,
    venue: row.venue,
    capacity: row.capacity,
    organizerId: row.organizer_id,
    createdAt: row.created_at,
  };
}

export async function findUpcoming({ limit = 20, offset = 0 } = {}) {
  const rows = await db("events")
    .select(COLUMNS)
    .where("starts_at", ">", db.fn.now())
    .orderBy("starts_at", "asc")
    .limit(limit)
    .offset(offset);
  return rows.map(toDomain);
}

export async function findById(id) {
  const row = await db("events").select(COLUMNS).where({ id }).first();
  return toDomain(row);
}

export async function insert(event, trx = db) {
  const [row] = await trx("events")
    .insert({
      title: event.title,
      description: event.description ?? null,
      starts_at: event.startsAt,
      venue: event.venue,
      capacity: event.capacity ?? 0,
      organizer_id: event.organizerId,
    })
    .returning(COLUMNS);
  return toDomain(row);
}

export async function countConfirmed(eventId, trx = db) {
  const row = await trx("registrations")
    .where({ event_id: eventId, status: "confirmed" })
    .count({ n: "*" })
    .first();
  return Number(row.n);
}
```

Six things in that file are the actual lesson.

**An explicit column list, never `SELECT *`.** Naming columns means a migration that adds one cannot silently change what your service returns, and a migration that removes one fails loudly at the repository instead of confusingly in a template. It also stops you accidentally shipping a column you did not mean to expose — a password hash, an internal note.

**Row shape is translated at this boundary.** Postgres convention is `snake_case`; JavaScript convention is `camelCase`. Pick the translation point and make it the repository: below it everything is `starts_at`, above it everything is `startsAt`. Doing it here means the rest of the application never sees a database convention, and renaming a column is a one-file change. Doing it *nowhere* means both spellings appear in your services and templates forever.

**Every value is bound, never interpolated.** Knex turns `.where({ id })` into `where "id" = ?` with the value sent separately. This is what makes SQL injection impossible: the value never becomes part of the query text, so a value of `' OR 1=1 --` is compared as a literal string and matches nothing. The moment you reach for `db.raw` with a template literal you have opted out of that protection:

```javascript
// DON'T — the id is concatenated into the query text
db.raw(`SELECT * FROM events WHERE id = '${id}'`);

// If you must use raw SQL, bind the values:
db.raw("SELECT * FROM events WHERE id = ?", [id]);
```

There is one more trap: **column and table names cannot be bound**, only values. A sort order taken from `req.query.sort` and dropped into `orderBy` is an injection vector even through the builder. Validate it against a fixed list:

```javascript
const SORTABLE = new Set(["starts_at", "title", "created_at"]);
const column = SORTABLE.has(sort) ? sort : "starts_at";
```

**Pagination is built in from the start.** `findUpcoming` takes `limit` and `offset` because a repository function with no limit is a function that returns the whole table the day the table gets big. Cap the limit at a sane maximum in the service.

**Every write takes an optional transaction.** The `trx = db` parameter is a small piece of design that pays off in the next section: a Knex transaction object has the same interface as the `db` instance, so a function written this way works both standalone and inside a transaction, with no duplicate version.

**No rule appears anywhere.** `findUpcoming` filters by date because that is what "upcoming" means as a query, but nothing decides whether the user is allowed to see it, whether the capacity is exceeded, or what error to return. That is the service's job.

## Services on top of repositories

The service is where the rules go — and it is now the layer that is worth unit testing, because it can be run with a fake repository and no database at all.

```javascript
// src/services/events.service.js
import * as eventsRepo from "../repositories/events.repository.js";
import { NotFoundError, ValidationError } from "../errors/index.js";

const MAX_PAGE_SIZE = 100;

export async function listUpcoming({ limit = 20, offset = 0 } = {}) {
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), MAX_PAGE_SIZE);
  return eventsRepo.findUpcoming({ limit: safeLimit, offset: Math.max(Number(offset) || 0, 0) });
}

export async function getById(id) {
  const event = await eventsRepo.findById(id);
  if (!event) throw new NotFoundError(`No event with id ${id}`);
  return event;
}

export async function create(input, organizerId) {
  if (new Date(input.startsAt) <= new Date()) {
    throw new ValidationError("startsAt must be in the future");
  }
  return eventsRepo.insert({ ...input, organizerId });
}
```

Read what is *not* there. No status codes — the service throws typed errors and lesson 06 maps them to responses. No `req`. No SQL. No knowledge that Postgres exists. If the storage moved to a different engine tomorrow, this file would not change, and that is the test of whether the boundary is real.

The route on top is now trivial:

```javascript
eventsRouter.get("/", async (req, res, next) => {
  try {
    const events = await eventService.listUpcoming(req.query);
    res.render("events/index", { events });
  } catch (err) {
    next(err);
  }
});
```

One note on that `try/catch`: an error thrown inside an async handler is a rejected promise, and Express 4 does not catch those — without the `catch`, the request hangs until it times out and nothing appears in your logs. Express 5 forwards rejections from async handlers automatically. Know which version you are on; on 4, either wrap every async handler in `try/catch` or write a small `asyncHandler` wrapper once and use it everywhere.

## Transactions: when two writes must be one

Some operations are not finished until several statements have all succeeded. Registering an attendee for an event means checking the confirmed count and inserting a row, and between those two steps another request can slip in and take the last seat. Both requests read 49 of 50, both insert, and the event is oversubscribed. This is a race condition, and it is invisible in testing because you are the only user.

A transaction makes a group of statements atomic:

```javascript
// src/services/registrations.service.js
import { db } from "../db/knex.js";
import * as eventsRepo from "../repositories/events.repository.js";
import * as regsRepo from "../repositories/registrations.repository.js";
import { ConflictError, NotFoundError } from "../errors/index.js";

export async function register(eventId, attendeeId) {
  return db.transaction(async (trx) => {
    const event = await eventsRepo.findByIdForUpdate(eventId, trx);
    if (!event) throw new NotFoundError(`No event with id ${eventId}`);

    const existing = await regsRepo.findByEventAndAttendee(eventId, attendeeId, trx);
    if (existing) throw new ConflictError("Already registered for this event");

    if (event.capacity > 0) {
      const confirmed = await regsRepo.countConfirmed(eventId, trx);
      if (confirmed >= event.capacity) throw new ConflictError("Event is full");
    }

    return regsRepo.insert({ eventId, attendeeId, status: "confirmed" }, trx);
  });
}
```

`db.transaction` opens a transaction, passes you `trx`, commits when the callback resolves, and rolls back if it throws. Every query inside must use `trx` — a query that uses `db` instead runs on a different connection, outside the transaction, and will not see the transaction's uncommitted rows. That is the single most common transaction bug, and it is why every repository function above accepts `trx` as a parameter.

The `findByIdForUpdate` variant adds row locking:

```javascript
export async function findByIdForUpdate(id, trx) {
  const row = await trx("events").select(COLUMNS).where({ id }).forUpdate().first();
  return toDomain(row);
}
```

`forUpdate()` emits `SELECT ... FOR UPDATE`, which locks that event row until the transaction ends. A second concurrent registration for the same event waits at that line, and by the time it proceeds, the first has committed and the count is correct. The lock is per-event, so registrations for different events do not block each other.

Two rules keep transactions from becoming a source of outages. **Keep them short** — a transaction holds a connection and locks rows for its whole duration, so never put an HTTP call to a payment provider or an email send inside one. And **do not nest them accidentally**: passing `trx` where a function expects `db` is fine; calling `db.transaction` inside another transaction's callback opens a second, independent one on a different connection, which will deadlock against the first.

There is also a belt-and-braces version of the duplicate check. Even with the transaction, the honest guarantee against double registration is a database constraint:

```javascript
t.unique(["event_id", "attendee_id"], { indexName: "registrations_event_attendee_uniq" });
```

Now a duplicate is impossible regardless of what any code does. The service check still exists, because it produces a good error message; the constraint exists because it is true. When the constraint fires, Postgres raises error code `23505`, which your repository can translate into the same `ConflictError` rather than letting a raw driver error escape.

## Reading the queries you are actually running

Two performance problems account for most of what goes wrong in a data access layer, and both are visible before they hurt.

**The N+1 query.** Rendering a list of twenty events and fetching each one's registration count inside the loop is one query for the list plus twenty more:

```javascript
// DON'T
const events = await eventsRepo.findUpcoming();
for (const event of events) {
  event.registered = await regsRepo.countConfirmed(event.id); // 20 round trips
}
```

Fetch in one query instead, with a join and a group, or a single `whereIn` followed by a map:

```javascript
export async function countsForEvents(eventIds) {
  const rows = await db("registrations")
    .select("event_id")
    .count({ n: "*" })
    .whereIn("event_id", eventIds)
    .andWhere({ status: "confirmed" })
    .groupBy("event_id");
  return new Map(rows.map((r) => [r.event_id, Number(r.n)]));
}
```

The symptom to watch for is a loop containing `await` on a repository call. Not every one is a defect, but every one deserves a second look.

**The unindexed lookup.** Ask Postgres what it did:

```sql
EXPLAIN ANALYZE
SELECT * FROM registrations WHERE event_id = '...' AND status = 'confirmed';
```

A `Seq Scan` on a large table means no usable index; an `Index Scan` means there is one. Turn on Knex's query logging in development and read what your builder actually emits — the gap between the query you imagined and the query that ran is where most surprises live:

```javascript
db.on("query", (q) => logger.debug({ sql: q.sql, bindings: q.bindings }, "query"));
```

## Seeds and a local database you can rebuild

Development needs data, and it needs to be data you can throw away.

```javascript
// seeds/01_events.js
export async function seed(knex) {
  await knex("registrations").del();
  await knex("events").del();
  await knex("organizers").del();

  const [organizer] = await knex("organizers")
    .insert({ email: "organizer@example.test", display_name: "Rosa Parks Park Committee" })
    .returning(["id"]);

  await knex("events").insert([
    { title: "Neighborhood Cleanup", starts_at: "2026-08-02T15:00:00Z",
      venue: "Rosa Parks Park", capacity: 40, organizer_id: organizer.id },
    { title: "Intro to Soldering", starts_at: "2026-08-09T18:00:00Z",
      venue: "Maker Space", capacity: 12, organizer_id: organizer.id },
  ]);
}
```

```json
{
  "scripts": {
    "db:migrate": "knex migrate:latest",
    "db:rollback": "knex migrate:rollback",
    "db:seed": "knex seed:run",
    "db:reset": "knex migrate:rollback --all && knex migrate:latest && knex seed:run"
  }
}
```

Seeds delete before they insert, in reverse dependency order, so `npm run db:seed` is repeatable. Seed data is example data, never real data, and never a substitute for a migration — anything the application requires in order to function (a status lookup table, a default role) belongs in a migration, not a seed, because seeds do not run in production.

Run Postgres locally however you like; a container keeps it disposable:

```bash
docker run --name events-db -e POSTGRES_PASSWORD=events -e POSTGRES_USER=events \
  -e POSTGRES_DB=events_board -p 5432:5432 -d postgres:16
```

Whatever you use, write the steps in the README. "Clone, `npm ci`, `cp .env.example .env`, `npm run db:reset`, `npm run dev`" is the standard a project is judged by, and you should be able to delete the database and be back to a working service in under a minute.

## Practice

Replace the in-memory array in the events board with a real PostgreSQL data access layer, keeping every rule above the repository boundary.

1. Stand up a local Postgres, add `DATABASE_URL` to `src/config/index.js` and `.env.example`, and create `src/db/knex.js` with a pool of max 10. Confirm the process exits cleanly on Ctrl+C with the pool destroyed.
2. Write a migration creating `organizers` and `events` with the columns, types, constraints, and index from this lesson. Run `migrate:latest`, then `migrate:rollback`, then `migrate:latest` again, and confirm all three succeed.
3. Write a second migration creating `registrations` with `id`, `event_id`, `attendee_id`, `status` (`confirmed` or `waitlisted`), and `created_at`, a foreign key to `events` with a deliberate delete behaviour, and a unique constraint on the event/attendee pair. Write one sentence in the migration file explaining your delete behaviour choice.
4. Write `src/repositories/events.repository.js` with `findUpcoming`, `findById`, `findByIdForUpdate`, `insert`, and `update`, using an explicit column list, a `toDomain` mapper, and an optional `trx` parameter on every write.
5. Write `src/repositories/registrations.repository.js` with `findByEventAndAttendee`, `countConfirmed`, `countsForEvents`, and `insert`.
6. Rewrite `src/services/events.service.js` so it calls only the repository, caps the page size at 100, and throws typed errors instead of returning status codes. No route handler may import a repository — verify with `grep -rn "repositories" src/routes/` returning nothing.
7. Implement `register(eventId, attendeeId)` in a registrations service inside a transaction, with a `forUpdate` lock on the event, a duplicate check, and a capacity check. Then prove the lock matters: comment out `forUpdate`, fire twenty concurrent registrations at an event with capacity 5 (`for i in $(seq 20); do curl -s -X POST ... & done`), and count the rows. Restore the lock and repeat.
8. Deliberately violate the unique constraint from the database console and record the Postgres error code. Then catch that code in the repository and translate it into your `ConflictError`.
9. Find and fix one N+1: render the events list with a registration count per event, first with a count inside the loop, then with `countsForEvents`. Enable the Knex query log and record the number of queries each version emits in `NOTES.md`.
10. Seed 5,000 registrations onto one event and run `EXPLAIN ANALYZE` on the confirmed-count query with and without an index on `(event_id, status)`. Paste both plans into `NOTES.md` with the row counts and timings, and state which scan type each used.
11. Write the `db:reset` script, then delete your database entirely and rebuild it from scratch using only the commands in your README. If a step is missing from the README, add it.

**Deliverable:** an events board with no in-memory array, migrations and seeds committed, a repository layer that is the only place SQL appears, services holding every rule, and a `NOTES.md` containing your concurrency results, the two query counts, and both query plans.
