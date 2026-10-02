---
lesson_id: db100-05
course_id: db100
pathway: software-developer
title: Constraints, Normalization, and Schema Change
order: 5
kind: lesson
competency_ids:
  - D5-S1-C03
objectives:
  - Apply constraints and normalization to keep data correct through change
---

## The schema you were given is not finished

The `schema.sql` from lesson 02 has keys and references and nothing else. Every column accepts `NULL`. Two residents can share an email address. An event can have a status of `bananas`, or an end time before its start time. Nothing stops any of it.

That was deliberate. You now have four lessons of experience querying this data, which is what it takes to see why those gaps matter — a `NULL` you did not expect is an outer join you have to write, and a duplicated resident is an attendance count that is quietly wrong. This lesson is the pass where you tighten the schema, and then the pass where you learn to change a schema that already holds data somebody depends on.

That second half is the real job. On a working team you rarely design a schema from nothing. You are handed one, told what needs to change, and expected to make the change without breaking the application reading from it. Doing that safely is a specific skill with a specific procedure, and the procedure is the last section of this lesson.

## Constraints: rules the database refuses to break

Application code can validate input, and it should. But application code is one of several things writing to your database — there is also the admin script, the data import somebody ran at 5pm, the console session, and the next application. A **constraint** lives in the schema, so every one of those paths is checked, and it cannot be forgotten.

**`NOT NULL`** says a value is required. Ask of every column: is there any legitimate row where this is unknown? An event with no title is meaningless, so `title` is `NOT NULL`. An event with no venue is the online Q&A, so `venue_id` stays nullable. This is a modeling decision, not a formality — every nullable column is a branch someone downstream has to handle.

**`DEFAULT`** supplies a value when the insert omits the column. `created_at timestamptz DEFAULT now()` and `checked_in boolean DEFAULT false` are already in your schema. A default plus `NOT NULL` is a good pairing: the column is always populated and callers do not have to care.

**`UNIQUE`** forbids duplicate values. It is what stops the same resident existing twice, and it is what makes a natural key trustworthy alongside your surrogate one. It has a wrinkle: `NULL` is not equal to anything, including another `NULL`, so a plain `UNIQUE` column accepts any number of null rows. If you want one row and one row only, pair `UNIQUE` with `NOT NULL`. And uniqueness is exact by default — `Dana@example.org` and `dana@example.org` are two different values. To make it case-insensitive, put the uniqueness on an expression:

```sql
CREATE UNIQUE INDEX attendees_email_unique ON attendees (lower(email));
```

**`CHECK`** enforces an arbitrary condition on a row. It is the most underused constraint in most schemas:

```sql
ALTER TABLE events
  ADD CONSTRAINT events_status_valid
  CHECK (status IN ('draft', 'published', 'completed', 'cancelled'));

ALTER TABLE events
  ADD CONSTRAINT events_time_order
  CHECK (ends_at IS NULL OR ends_at > starts_at);

ALTER TABLE venues
  ADD CONSTRAINT venues_capacity_positive
  CHECK (capacity IS NULL OR capacity > 0);
```

Name your constraints. Postgres will invent a name if you do not, and the invented name is what appears in the error your application logs at 2am. `events_status_valid` tells the reader what broke; `events_check1` does not.

Note the `IS NULL OR ...` in two of those. A `CHECK` passes when its condition is true *or unknown*, so a null column would pass anyway — but writing the null case explicitly tells the next reader that you thought about it rather than missed it.

**Foreign keys** you already have, but you have not chosen what happens on delete. The default is `NO ACTION`, which refuses the delete — that is the error you saw when you tried to remove a venue in lesson 02. The alternatives:

- `ON DELETE CASCADE` deletes the children too. Correct for a junction table: if an event is deleted, its registrations are meaningless. Dangerous everywhere else, because one statement can remove far more than the author intended.
- `ON DELETE SET NULL` keeps the child and blanks the reference. Correct for `events.venue_id` — a demolished venue should not delete the history of what happened there.
- `ON DELETE RESTRICT` (effectively the default) refuses. Correct when deletion should be a deliberate two-step act.

Choosing these is a business conversation, not a technical one, and the right move on a team is to ask rather than assume. "If we delete a venue, do the past events at it disappear from the annual report?" is the question, and the person who knows the answer is not you.

## Hardening the events board

Adding a constraint to a table that already holds data is where theory meets reality: **Postgres validates the existing rows and rejects the constraint if any row violates it.**

```sql
ALTER TABLE events ALTER COLUMN title SET NOT NULL;
```

If a single event has a null title, you get:

```text
ERROR:  column "title" of relation "events" contains null values
```

That error is a feature. It is the database telling you that your intended rule does not describe your actual data, and that you have a cleanup to do before the rule can hold. The sequence is always: **find the violations, decide what they should be, fix them, then add the constraint.**

```sql
SELECT event_id, title FROM events WHERE title IS NULL;
UPDATE events SET title = 'Untitled event' WHERE title IS NULL;
ALTER TABLE events ALTER COLUMN title SET NOT NULL;
```

The full hardening pass on the events board, which you will run in the practice, looks like this:

```sql
ALTER TABLE venues     ALTER COLUMN name SET NOT NULL;
ALTER TABLE organizers ALTER COLUMN full_name SET NOT NULL,
                       ALTER COLUMN email SET NOT NULL;
ALTER TABLE attendees  ALTER COLUMN full_name SET NOT NULL,
                       ALTER COLUMN email SET NOT NULL;
ALTER TABLE events     ALTER COLUMN title SET NOT NULL,
                       ALTER COLUMN starts_at SET NOT NULL,
                       ALTER COLUMN organizer_id SET NOT NULL,
                       ALTER COLUMN status SET DEFAULT 'draft',
                       ALTER COLUMN status SET NOT NULL;
```

Read the choices, not just the syntax. `organizer_id` becomes required because the staff said every event has a responsible organizer; `venue_id` does not, because online events exist. `status` gets both a default and `NOT NULL`, so a new row is always in a known state.

`ALTER TABLE` does the other structural changes too:

```sql
ALTER TABLE events ADD COLUMN capacity_override integer;
ALTER TABLE events DROP COLUMN capacity_override;
ALTER TABLE events RENAME COLUMN summary TO description;
ALTER TABLE events ALTER COLUMN status TYPE text;
```

Two of those are dangerous in a way the other two are not. `DROP COLUMN` destroys data irreversibly. `RENAME COLUMN` breaks every query, view, and application line that referenced the old name, instantly, with no warning at write time. The last section of this lesson is about doing that second one without an outage.

## Normalization: storing each fact once

The events board is well-shaped because lesson 02 shaped it. Most data you inherit is not. Here is a table like ones you will genuinely be handed — the raw output of a web form where volunteers submit events:

```sql
CREATE TABLE event_submissions (
  submission_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_title   text,
  starts_at     timestamptz,
  venue_name    text,
  venue_city    text,
  venue_capacity integer,
  organizer_name text,
  organizer_email text,
  categories    text        -- 'outdoors,civic'
);
```

Everything about one submission in one row. It is easy to write and it fails in three specific ways, which have names.

An **insert anomaly**: you cannot record a new venue until an event happens there. The venue only exists as a side effect of an event.

An **update anomaly**: Rosa Parks Park's capacity changes to 500. It appears in four rows and you must update all four. Update three and the database now holds two contradictory answers to the same question, with nothing to say which is right.

A **delete anomaly**: delete the only event at Riverside Library and you have destroyed the library's address, which nobody meant to discard.

**Normalization** is the process of removing those anomalies by splitting the table so each fact is stored exactly once. Three levels cover almost everything you will do.

**First normal form** requires atomic values: no lists in a column, no repeating groups of columns. `categories` holding `'outdoors,civic'` breaks it — that is why lesson 02 created `event_categories`. So does a table with `category_1`, `category_2`, `category_3`, which is the same mistake spelled differently, and which breaks the day an event needs a fourth.

**Second normal form** requires that every non-key column depend on the *whole* primary key. It only has teeth on composite keys. In `registrations`, keyed on `(event_id, attendee_id)`, `registered_at` depends on both — good. If you added `attendee_email` there, it would depend only on `attendee_id`, half the key, and would then be duplicated in every registration that person makes. Move it to `attendees`.

**Third normal form** requires that non-key columns depend on the key and nothing else. In `event_submissions`, `venue_city` depends on `venue_name`, which is not the key — a **transitive dependency**. That is what makes the update anomaly possible. The fix is the one lesson 02 already applied: venues get their own table, and the event points at it.

Normalized to third normal form, `event_submissions` becomes exactly the seven tables you already have. That is the point of running the exercise on a table you know the answer to: the normal forms are not a separate theory, they are a description of the reasoning you already used.

Two cautions to carry. First, "3NF" is a floor, not a religion — you can normalize into a schema where every simple question needs six joins, and that helps nobody. Second, **denormalization is legitimate when it is deliberate, measured, and documented.** Caching a `signup_count` on `events` is a reasonable answer to a slow page, provided you can say what keeps it correct and what happens when it drifts. Storing a venue's city in the events table because it was convenient is not the same thing.

## Changing a schema that is already in use

Everything above assumed you could edit `schema.sql` and reload. Once an application is running against the database, you cannot: the data must survive, and the application must keep working while the change happens. This is the part of the lesson that describes your actual first-year job — receiving a change request, planning it, and applying it under review.

**Every change is a migration file.** Not a statement you typed into `psql`, not an edit to `schema.sql`. A numbered, immutable file, committed to git alongside the code that needs it:

```text
migrations/
  001_initial_schema.sql
  002_harden_constraints.sql
  003_add_event_capacity.sql
```

Migration files are **forward-only and never edited after they are applied**. If `003` was wrong, `004` fixes it. Editing an applied migration means your database and your colleague's database ran different code and are now different in a way nothing records. Most frameworks ship a migration runner that tracks which files have run in a table; the discipline matters more than the tool.

**Wrap each migration in a transaction.** Postgres, unlike some engines, allows DDL inside a transaction, so a migration either fully applies or leaves nothing behind:

```sql
BEGIN;

ALTER TABLE events ADD COLUMN max_attendees integer;
UPDATE events SET max_attendees = 50 WHERE status = 'published';
ALTER TABLE events ADD CONSTRAINT events_max_attendees_positive
  CHECK (max_attendees IS NULL OR max_attendees > 0);

COMMIT;
```

If the `CHECK` fails, the `ADD COLUMN` and the `UPDATE` are undone with it. The same mechanism is your safety net at the prompt: `BEGIN`, run the destructive statement, `SELECT` to inspect the result, then `COMMIT` if it is right and `ROLLBACK` if it is not. Practice that loop until it is reflex, because it is the difference between a mistake and an incident.

Data changes follow the same care. `UPDATE` and `DELETE` without a `WHERE` clause modify every row in the table:

```sql
-- 1. See exactly which rows you are about to touch.
SELECT event_id, title, status FROM events WHERE starts_at < now() AND status = 'published';

-- 2. Change them inside a transaction, checking the reported row count.
BEGIN;
UPDATE events SET status = 'completed'
WHERE starts_at < now() AND status = 'published';
-- UPDATE 2   <- does that match what the SELECT showed?
COMMIT;
```

**Write the `SELECT` first, every time.** The `WHERE` clause in your `UPDATE` should be the one you just proved returns the right rows, and the row count the statement reports is your confirmation that nothing broader got caught.

Renaming is the change people underestimate. A one-statement `RENAME COLUMN` breaks every reader at the instant it commits. The safe procedure is **expand and contract**, and it takes several deploys on purpose:

1. **Expand.** Add the new column. Nothing reads it yet, so this is safe on its own.
2. **Backfill.** Copy the existing data across, in batches if the table is large.
3. **Dual-write.** Change the application to write both columns, so they stay in step while old code may still be running.
4. **Switch reads.** Point queries at the new column and verify in production.
5. **Contract.** Only once nothing references the old column, drop it.

A backfill within one table is a plain `UPDATE`:

```sql
ALTER TABLE events ADD COLUMN description text;
UPDATE events SET description = summary WHERE description IS NULL;
```

A backfill that has to look a value up in another table uses `UPDATE ... FROM`. This is the shape you need when importing `event_submissions`, where each row carries a venue *name* and you want the matching `venue_id`:

```sql
UPDATE events AS e
SET venue_id = v.venue_id
FROM venues AS v
WHERE v.name = e.imported_venue_name
  AND e.venue_id IS NULL;
```

The `FROM` table is joined to the rows being updated by the `WHERE` clause, and only matched rows are touched — which is also the risk, so run the equivalent `SELECT` first and confirm the count.

Two more practical notes. Adding a column with a default is cheap on modern Postgres but not on every engine or every version, and adding a `NOT NULL` constraint scans the whole table while holding a lock — on a big table, add the constraint as `NOT VALID` first and validate it separately so writers are not blocked. And **know what must not change.** Any change request comes with an implicit contract: the report the finance team runs, the column an integration reads, the id an external system stores. Write that list down before you touch anything, and put it in the pull request so your reviewer can check the same list. The change you were asked for is only half the specification; the other half is everything that has to still work afterwards, and stating it plainly is what makes your work reviewable.

## Practice

Work against `events_board`. Everything you write goes in numbered migration files under `migrations/`, and each file is one transaction.

1. Write `002_harden_constraints.sql` applying the `NOT NULL` and `DEFAULT` pass from this lesson, plus the three `CHECK` constraints and a case-insensitive unique index on `attendees(lower(email))`. Wrap it in `BEGIN`/`COMMIT` and run it.
2. Prove each constraint. Attempt an event with status `bananas`, an event whose `ends_at` precedes its `starts_at`, a venue with capacity `0`, and a second attendee with the email `ALICIA.GOMEZ@example.com`. Record all four error messages in `NOTES.md` with the constraint name that fired.
3. Break the hardening on purpose. In a transaction, set one venue's `name` to `NULL` — you will need to drop the constraint first — then try to re-add `SET NOT NULL`, capture the error, `ROLLBACK`, and confirm with a `SELECT` that the table is unchanged.
4. Write `003_delete_rules.sql` that sets `events.venue_id` to `ON DELETE SET NULL` and both junction-table foreign keys to `ON DELETE CASCADE`. You will need to drop and recreate the constraints; look up the existing names with `\d`. Then delete Riverside Library and one draft event, and confirm with `SELECT` that the surviving rows are what you intended.
5. Create `event_submissions` exactly as written above and insert three rows describing events at the same venue, with comma-separated categories. Then write out, in `NOTES.md`, one concrete insert anomaly, one update anomaly, and one delete anomaly this table permits, each phrased as something a staff member would actually try to do.
6. Normalize it. Write the SQL that reads `event_submissions` and populates `venues`, `organizers`, `events`, and `event_categories` without creating duplicate venues or organizers. Note which normal form each step of your split satisfies.
7. Perform an expand-and-contract change. The staff wants `events.summary` renamed to `description`. Write `004_add_description.sql` (add plus backfill) and `005_drop_summary.sql` (contract), run them in order, and in `NOTES.md` write the two sentences you would put in a pull request explaining why this is two migrations and what would have to be true before the second one is safe to run.
8. Write the "must not change" list for step 7: name three things that read `events` and would break if you had simply renamed the column, and say how you would check each one before contracting.

**Deliverable:** a `migrations/` directory whose files apply cleanly in order to a freshly loaded database, and a `NOTES.md` holding your four constraint errors, your three anomalies, your normalization plan, and the pull-request note from step 7.
