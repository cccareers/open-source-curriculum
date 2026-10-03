---
lesson_id: db100-02
course_id: db100
pathway: software-developer
title: Relational Foundations and Data Modeling
order: 2
kind: lesson
competency_ids:
  - D5-S1-C02
objectives:
  - Model a domain as tables, keys, and relationships
---

## What a relational database actually gives you

Every application you have written so far has kept its data in variables. An array of events, an object of settings, a JSON file you read at startup. That works until one of four things happens: the process restarts and the data is gone, a second process needs the same data at the same time, the data grows past what fits comfortably in memory, or somebody saves a record with a missing field and nothing stops them.

A relational database solves all four, but the reason it is worth a twenty-hour course is the fourth one. Durability and concurrency you could bolt onto a file with enough effort. What you could not build in an afternoon is a system that **refuses to store data that contradicts itself**, and that lets you ask arbitrary questions of that data without writing a loop.

The relational model is about forty years older than any framework you use, and it rests on one idea: store facts in **tables**, and let the engine work out how to answer questions about them. You describe *what* you want. The engine decides *how* to get it — which order to read the tables in, which index to use, whether to sort or hash. That split is why the same query you write today keeps working when the table grows from one thousand rows to ten million.

Four words will appear constantly, so pin them down now:

- A **table** is a set of rows that all have the same columns. It represents one kind of thing: venues, events, people.
- A **row** is one instance of that thing — one venue, one event. Other people will call it a record or a tuple; they mean the same object.
- A **column** is one named, typed fact about the thing. `capacity` is an integer. `name` is text. Every row has a value for every column, even if that value is nothing.
- A **schema** is the whole design: the tables, their columns, their types, and the rules connecting them.

Two properties of tables surprise people coming from arrays. **Rows have no order.** A table is a set, not a list. If you want results in a particular sequence, you say so in the query; without that instruction the database is free to hand rows back in whatever order was cheapest, and that order can change between runs. And **columns are addressed by name, never by position.** Writing code that depends on `venues` having `city` third is code that breaks the first time someone adds a column.

This course uses **PostgreSQL**. Everything in the next four lessons is standard SQL that would run with minor changes on MySQL or SQLite, but the syntax, the types, and the command-line tool are Postgres, and mixing dialects while you are learning is a good way to waste an evening on an error message that is not about your logic.

## The domain you will model

You need something concrete to model. Every lesson in this course uses the same one: a **community events board** for a neighborhood organization. Volunteers post events, residents sign up, and the staff needs to know who is coming.

Here is what the staff told you in a meeting. This is what a requirements conversation actually sounds like — prose, not a schema:

> We run events at a handful of venues around the neighborhood, plus the occasional online one. Every event has a title, a short summary, a start and end time, and one staff organizer who is responsible for it. Events sit in draft until we publish them, and once they are over we mark them completed. Residents create an account once and then sign up for as many events as they want, and we need to know when they signed up and whether they actually turned up on the day. We tag events with categories like outdoors or technology so people can browse, and an event usually has more than one tag.

Modeling is the work of turning that paragraph into tables. The mechanical version of the technique is old and it still works:

1. **Nouns that you keep separate records about become tables.** Venue, event, organizer, resident, category. Note the qualifier — "Tuesday" is a noun and is not a table.
2. **Facts about one of those nouns become columns on its table.** An event's title, its start time, its status.
3. **Verbs connecting two nouns become relationships.** An event *is held at* a venue. A resident *signs up for* an event. Relationships are expressed either by a column that points at another table, or by a table of their own — which one depends on cardinality, and that is the next section but one.
4. **Anything the staff said "usually more than one" about is a warning.** More than one of something never belongs in a column.

Run that on the paragraph above and you get six things worth their own table: venues, organizers, events, attendees, categories, and the signup itself.

## One fact per column, one type per column

Before keys and relationships, get the columns right, because a bad column is expensive to fix later.

A column holds **one value of one type**. That sounds obvious until you are tempted to write a `tags` column holding `'outdoors,civic'`, or a `contact` column holding `'Dana Whitfield <dana@example.org>'`. Both feel efficient and both are traps. Ask the database to find every outdoor event and you are reduced to substring matching, which will match `outdoors` inside `outdoorsy` and cannot use an index. Rename a category and you are rewriting text in every row that mentions it. The rule is worth memorizing: **if you would ever want to search, sort, count, or join on part of a value, that part is its own column or its own table.**

Choosing a type is the second half of designing a column. Postgres has many; these are the ones you will use in this course.

| Type | Use it for | Notes |
| --- | --- | --- |
| `integer` | Whole numbers, counts, identifiers | About ±2.1 billion. Use `bigint` if you might exceed that. |
| `numeric(10,2)` | Money and anything that must be exact | Never use `float`/`real` for money — `0.1 + 0.2` is not `0.3` in binary floating point. |
| `text` | Any string | Postgres does not make `text` slower than `varchar(50)`. Use a length limit only when the limit is a real business rule. |
| `boolean` | True/false facts | Stores `true`, `false`, or unknown. |
| `date` | A calendar day with no time | Someone's join date, a holiday. |
| `timestamptz` | A precise moment | Stores an absolute instant and converts to the client's time zone on display. |
| `uuid` | Identifiers generated outside the database | Useful when several systems mint ids. |

Two of those deserve a sentence more. Prefer `timestamptz` over plain `timestamp` for anything that is a real moment in time: a bare `timestamp` records "9am" with no statement about *where*, and the first time your organization runs an event in another time zone, or the first time daylight saving shifts, that ambiguity becomes a support ticket. And resist `text` for things that are secretly numbers or dates. A `capacity` stored as text sorts `'100'` before `'40'`, because that is correct alphabetical order and completely wrong arithmetic.

Then there is `NULL`, which is not a value but the absence of one. `NULL` means **unknown or not applicable**: an event with no venue because it is online, an organizer whose phone number nobody recorded. It is emphatically not zero and not the empty string — zero attendees is a fact, an unknown attendance is not. Because `NULL` means "unknown," comparing to it gives unknown rather than true or false, which is why `capacity = NULL` never matches anything and you have to write `capacity IS NULL`. That rule bites in every lesson that follows, so it is worth reading twice.

## Keys: how a row is identified

A **primary key** is the column, or set of columns, that identifies a row uniquely and never changes. Every table in this course has one. The database enforces it: two rows with the same primary key cannot both exist, and a primary key cannot be `NULL`.

You have two ways to choose one.

A **natural key** is data that is already unique in the real world — an email address for a resident, a slug for a category. It reads well, and it saves a table lookup when you already have the value in hand. Its weakness is that real-world uniqueness is softer than it looks. Two people share a household email. A resident changes their address and now every row that referenced them has to be rewritten. Somebody enters `Dana@Example.org` and the database considers it a different person from `dana@example.org`.

A **surrogate key** is a meaningless number the database generates. It is unique because the database says so, it never changes because it means nothing, and it is small and fast to compare. Its weakness is that it tells you nothing on sight and it does not stop two rows that are duplicates in every meaningful way.

The working default in most teams, and the one this course uses, is: **a surrogate primary key on every entity table, plus a uniqueness rule on the natural key.** You get a stable identifier to point at and the database still refuses to store the same resident twice. In Postgres the modern way to mint a surrogate key is an identity column:

```sql
venue_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY
```

`GENERATED ALWAYS AS IDENTITY` is standard SQL and replaces the older `serial` keyword you will still meet in existing projects. It tells Postgres to supply the next number itself, and to reject an insert that tries to supply one by hand.

A **foreign key** is a column holding the primary key of a row in another table. `events.venue_id` holds a `venues.venue_id`. Declaring it as a foreign key does two things: it documents the relationship for every human who reads the schema, and it makes the database *enforce* the reference. An insert naming a venue that does not exist is rejected. A delete that would leave events pointing at nothing is rejected. This property has a name — **referential integrity** — and it is the single biggest reason to keep relationships in the database rather than in application code. Application code that forgets a check runs anyway. The database does not forget.

## Relationships and cardinality

**Cardinality** is the question "how many of each side?" and the answer determines the shape of the design. There are three answers.

**One-to-many** is the common case. One venue hosts many events; each event is held at one venue. One organizer runs many events; each event has one organizer. The rule for implementing it is short and never varies: **the foreign key goes on the "many" side.** `events` carries `venue_id`, because an event has exactly one venue and there is room for exactly one value. Putting an `event_id` on `venues` could only ever record one event per venue, which is backwards.

**Many-to-many** needs a third table. A resident signs up for many events; an event has many residents signed up. Neither table can hold the other's key, because "many" does not fit in a column. Instead you create a **junction table** whose rows *are* the relationship: `registrations`, with an `event_id` and an `attendee_id`. Its primary key is the pair of them together — a **composite key** — which has the pleasant side effect of making it impossible to sign the same person up for the same event twice.

The junction table earns its keep the moment there is something to say about the relationship itself. When did they sign up? Did they show? Those facts are not about the event and not about the person; they are about the signup, and the junction table is where they live. Events and categories work the same way, with an `event_categories` table that carries nothing but the pair.

**One-to-one** is rare and usually means you split one thing in half. Occasionally it is right — an optional block of columns only a few rows use, or data with different access rules. Reach for it last.

You draw this with an **entity-relationship diagram**: a box per table and a line per relationship, with the line's ends marked to show cardinality. Lesson 06 covers producing one properly, as a document your team can read. For now, this is the shape you are about to build.

![Entity-relationship diagram of the community events board schema showing venues, organizers, events, attendees, categories, and the registrations and event_categories junction tables](./img/events-board-erd.png)

## Setting up PostgreSQL and the events board

Install Postgres. On macOS with Homebrew:

```bash
brew install postgresql@16
brew services start postgresql@16
```

Homebrew installs versioned Postgres formulas as "keg-only", which means `psql` and `createdb` are not put on your `PATH` automatically. If `psql --version` below says `command not found`, run the `echo 'export PATH=...'` line that `brew install` printed at the end of its output (it points at `$(brew --prefix)/opt/postgresql@16/bin`), then open a new terminal.

On Debian or Ubuntu:

```bash
sudo apt install postgresql
sudo service postgresql start
```

On Linux the server only knows one database user at first, called `postgres`, so `createdb` run as you will fail with `role "yourname" does not exist`. Create a matching role for yourself once:

```bash
sudo -u postgres createuser --superuser "$USER"
```

A superuser role is fine on your own laptop for a course database. You would never do this on a shared or production server.

Either way, confirm the client is on your path and create a database for this course:

```bash
psql --version
createdb events_board
psql events_board
```

That last command opens `psql`, the interactive terminal client, and it is where you will spend the rest of this course. A handful of its backslash commands do most of the work:

```text
\l            list databases
\dt           list tables in the current database
\d events     describe the events table: columns, types, keys, indexes
\x            toggle expanded display (one column per line — good for wide rows)
\i file.sql   run a SQL file
\q            quit
```

Two habits from the start. **Statements end in a semicolon.** If `psql` shows you a prompt ending in `-#` instead of `=#`, it is still waiting for one. And **write your schema in a file, not at the prompt.** A schema you typed interactively exists only in that database; a schema in a file can be re-run, reviewed by a colleague, and committed to git.

Create `schema.sql`:

```sql
DROP TABLE IF EXISTS event_categories, registrations, events,
  categories, attendees, organizers, venues;

CREATE TABLE venues (
  venue_id  integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name      text,
  address   text,
  city      text,
  capacity  integer
);

CREATE TABLE organizers (
  organizer_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  full_name    text,
  email        text,
  phone        text
);

CREATE TABLE attendees (
  attendee_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  full_name   text,
  email       text,
  joined_on   date
);

CREATE TABLE categories (
  category_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        text,
  slug        text
);

CREATE TABLE events (
  event_id     integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title        text,
  summary      text,
  starts_at    timestamptz,
  ends_at      timestamptz,
  venue_id     integer REFERENCES venues (venue_id),
  organizer_id integer REFERENCES organizers (organizer_id),
  status       text,
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE registrations (
  event_id      integer REFERENCES events (event_id),
  attendee_id   integer REFERENCES attendees (attendee_id),
  registered_at timestamptz DEFAULT now(),
  checked_in    boolean DEFAULT false,
  PRIMARY KEY (event_id, attendee_id)
);

CREATE TABLE event_categories (
  event_id    integer REFERENCES events (event_id),
  category_id integer REFERENCES categories (category_id),
  PRIMARY KEY (event_id, category_id)
);
```

Read the `DROP TABLE` line before you run it: dropping in reverse dependency order is deliberate, because Postgres will not drop a table another table still references. This file is safe to re-run and destroys everything each time, which is exactly what you want for a course database and never what you want against real data.

Notice what this schema does **not** have. No `NOT NULL`, no `UNIQUE`, no `CHECK` on `status`, no instruction about what happens to registrations when an event is deleted. Those are constraints, and they are lesson 05's subject — you will harden this schema there, which is a much more honest exercise than being handed a finished one. The keys and the references are here because keys and references are the model itself.

Now `seed.sql`, so you have something to query:

```sql
INSERT INTO venues (name, address, city, capacity) VALUES
  ('Rosa Parks Park',  '1200 Woodward Ave', 'Detroit',   400),
  ('Maker Space',      '88 Cass Ave',       'Detroit',    40),
  ('Fellowship Hall',  '15 Grand Blvd',     'Hamtramck', 120),
  ('Riverside Library','210 River Rd',      'Detroit',    60);

INSERT INTO organizers (full_name, email, phone) VALUES
  ('Dana Whitfield', 'dana@eastsideboard.org',   '313-555-0142'),
  ('Marcus Lee',     'marcus@eastsideboard.org', '313-555-0187'),
  ('Priya Raman',    'priya@eastsideboard.org',  NULL);

INSERT INTO categories (name, slug) VALUES
  ('Outdoors', 'outdoors'), ('Technology', 'technology'), ('Food', 'food'),
  ('Family', 'family'), ('Civic', 'civic');

INSERT INTO attendees (full_name, email, joined_on) VALUES
  ('Alicia Gomez',  'alicia.gomez@example.com',  '2026-01-12'),
  ('Ben Okafor',    'ben.okafor@example.com',    '2026-02-03'),
  ('Chen Wei',      'chen.wei@example.com',      '2026-02-19'),
  ('Dmitri Volkov', 'dmitri.volkov@example.com', '2026-03-05'),
  ('Erin Blake',    'erin.blake@example.com',    '2026-03-22'),
  ('Farah Haddad',  'farah.haddad@example.com',  '2026-04-01'),
  ('Grace Nolan',   'grace.nolan@example.com',   '2026-04-17'),
  ('Hector Ruiz',   'hector.ruiz@example.com',   '2026-05-09'),
  ('Ivy Chen',      'ivy.chen@example.com',      '2026-05-28'),
  ('Jonah Pierce',  'jonah.pierce@example.com',  '2026-06-11');

INSERT INTO events (title, summary, starts_at, ends_at, venue_id, organizer_id, status) VALUES
  ('Neighborhood Cleanup', 'Litter pickup along the park path', '2026-08-02 09:00-04', '2026-08-02 12:00-04', 1, 1, 'published'),
  ('Intro to Soldering',   'Hands-on basics, tools provided',   '2026-08-09 13:00-04', '2026-08-09 16:00-04', 2, 2, 'published'),
  ('Community Potluck',    'Bring a dish, meet the block',      '2026-08-16 17:00-04', '2026-08-16 20:00-04', 3, 1, 'published'),
  ('Resume Workshop',      'One-on-one resume review',          '2026-08-20 18:00-04', '2026-08-20 20:00-04', 3, 3, 'published'),
  ('Bike Repair Clinic',   'Free tune-ups while you wait',      '2026-09-05 10:00-04', '2026-09-05 14:00-04', 1, 2, 'published'),
  ('Online Budgeting Q&A', 'Video call with a counselor',       '2026-09-12 19:00-04', '2026-09-12 20:00-04', NULL, 3, 'published'),
  ('Fall Block Party',     'Music, food trucks, games',         '2026-10-03 12:00-04', '2026-10-03 18:00-04', 1, 1, 'draft'),
  ('Winter Coat Drive',    'Drop-off and sorting',              '2026-11-14 10:00-05', '2026-11-14 15:00-05', 3, 2, 'draft'),
  ('Spring Seed Swap',     'Trade seeds and starts',            '2026-06-13 10:00-04', '2026-06-13 13:00-04', 1, 1, 'completed'),
  ('Intro to Databases',   'SQL for absolute beginners',        '2026-06-27 18:00-04', '2026-06-27 21:00-04', 2, 2, 'completed');

INSERT INTO registrations (event_id, attendee_id, checked_in) VALUES
  (1,1,false),(1,2,false),(1,3,false),(1,4,false),(1,5,false),
  (2,2,false),(2,3,false),(2,6,false),
  (3,1,false),(3,4,false),(3,6,false),(3,7,false),(3,8,false),(3,9,false),
  (4,5,false),(4,7,false),
  (5,3,false),(5,8,false),
  (6,1,false),(6,2,false),(6,9,false),
  (9,1,true),(9,2,true),(9,4,true),(9,6,false),
  (10,3,true),(10,5,true),(10,7,false),(10,8,false),(10,9,true);

INSERT INTO event_categories (event_id, category_id) VALUES
  (1,1),(1,5),(2,2),(3,3),(3,4),(4,5),(5,1),(5,5),(6,5),
  (7,1),(7,3),(7,4),(8,5),(9,1),(9,4),(10,2);
```

Load both files and check your work:

```bash
psql events_board -f schema.sql
psql events_board -f seed.sql
psql events_board -c "SELECT count(*) FROM events;"
```

```text
 count
-------
    10
(1 row)
```

Some deliberate awkwardness is baked into that data, and you should know it is on purpose rather than discover it as a bug. Riverside Library hosts no events. Jonah Pierce has registered for nothing. Two draft events have no registrations. The online Q&A has a `NULL` venue. Priya Raman has no phone number. Every one of those cases exists to make a later lesson's query interesting — a query that only ever runs against tidy data teaches you nothing about the day it does not.

## Reading a schema you did not write

Most of your career is spent on schemas somebody else designed, so practice reading before you practice designing. `psql` will describe any table:

```text
events_board=# \d events
                     Table "public.events"
    Column    |           Type           | Nullable |  Default
--------------+--------------------------+----------+-----------
 event_id     | integer                  | not null | identity
 title        | text                     |          |
 starts_at    | timestamp with time zone |          |
 venue_id     | integer                  |          |
 organizer_id | integer                  |          |
Indexes:
    "events_pkey" PRIMARY KEY, btree (event_id)
Foreign-key constraints:
    "events_venue_id_fkey" FOREIGN KEY (venue_id) REFERENCES venues(venue_id)
    "events_organizer_id_fkey" FOREIGN KEY (organizer_id) REFERENCES organizers(organizer_id)
Referenced by:
    TABLE "registrations" CONSTRAINT ... FOREIGN KEY (event_id) REFERENCES events(event_id)
```

That listing is trimmed to the columns that matter here; your real output also shows `summary`, `ends_at`, `status`, and `created_at`, plus a `Collation` column. Read that output in three passes. The column list tells you what facts a row holds. **Foreign-key constraints** tells you what this table points at — its parents. **Referenced by** tells you what points at *this* table — its children, which is the part people miss and the part that tells you what deleting a row would break. Two minutes of `\d` on the three or four tables you care about will tell you more about an unfamiliar system than an hour of reading application code.

## Practice

Work in `psql` against `events_board`, and keep every statement you write in a file so you can re-run it.

1. Create the database and load `schema.sql` and `seed.sql` exactly as above. Confirm with `\dt` that seven tables exist, and with `SELECT count(*) FROM registrations;` that you have 30 rows.
2. Run `\d` on `events`, `registrations`, and `venues`. In a file called `NOTES.md`, write one sentence per table naming its primary key, and for `events` list both the tables it references and the tables that reference it.
3. Prove referential integrity is real. Try `INSERT INTO events (title, venue_id, organizer_id) VALUES ('Ghost Event', 999, 1);` and paste the exact error into `NOTES.md`. Then try `DELETE FROM venues WHERE venue_id = 1;` and paste that error too. Write one sentence explaining which side of the relationship each error is protecting.
4. Prove the composite key is real. Run `INSERT INTO registrations (event_id, attendee_id) VALUES (1, 1);` — attendee 1 is already registered for event 1 — and record the error.
5. Model an extension. The staff now wants to record that some events need volunteers, and that a resident can volunteer for an event in a specific role such as "setup" or "check-in", with a shift start and end time. Write the `CREATE TABLE` statements in a file called `volunteers.sql`. Decide the cardinality first and justify it in a comment: is a role a column, or its own table? Where does the shift time live, and why can it not live on `events` or on `attendees`?
6. Deliberately model something badly, then explain the cost. Write a single-table design for the same events board — one table with columns like `event_title`, `venue_name`, `venue_capacity`, `attendee_names`. Do not create it; just write the `CREATE TABLE` in `NOTES.md`, then list three specific questions from the staff's paragraph that this design makes hard or impossible to answer correctly.
7. Choose types with reasons. The staff wants to add a ticket price (sometimes free), a maximum headcount, an "is the venue wheelchair accessible" flag, and a published date. Write the four column definitions with Postgres types, and one sentence each on why you rejected the obvious alternative.

**Deliverable:** a loadable `schema.sql` and `seed.sql`, a `volunteers.sql` with a justified extension to the model, and a `NOTES.md` holding your schema reading, the three enforcement errors, and your single-table critique.

## Check your understanding

1. The staff say "an event usually has more than one category." Why can that fact not be stored as a `categories` column on `events`, and what do you build instead?
2. Which table gets the foreign key in a one-to-many relationship between `organizers` and `events`, and why does the other direction not work?
3. `SELECT * FROM events WHERE venue_id = NULL;` returns zero rows and no error. Why, and what should you write?
4. You try to delete a venue and Postgres refuses. Which section of `\d venues` would have warned you this would happen?

*Answers:* (1) A column holds one value; a list breaks searching, counting, and renaming, so you build the `event_categories` junction table. (2) `events`, the "many" side — an `organizer_id` on `events` holds exactly the one organizer each event has, while an `event_id` on `organizers` could only ever record one event per organizer. (3) Comparing anything to `NULL` gives unknown, and `WHERE` keeps only true rows; write `venue_id IS NULL`. (4) **Referenced by**, which lists the child tables pointing at `venues`.
