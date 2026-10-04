---
course_id: db100
project_id: db100-x02
title: "Import the Spring Submissions Form"
kind: supplementary-project
status: draft
hours_estimate: 6
difficulty: stretch
related_lessons:
  - db100-03
  - db100-05
  - db100-06
objectives:
  - Retrieve data from a relational database with SQL
  - Apply constraints and normalization to keep data correct through change
  - Document a schema so a teammate can work against it
competency_ids:
  - D2-S1-C04
  - D5-S1-C03
  - D1-S1-C01
---

## Scenario

Volunteers have been proposing events through a web form all spring. The form wrote everything into one flat table, `event_submissions` — the same shape lesson 05 used to explain insert, update, and delete anomalies. Marcus Lee asks you to bring the six pending submissions into the real `events_board` schema as drafts so staff can review them. The data is real-world messy: a venue typed in lowercase with a trailing space, one organizer's email in three capitalizations, a new venue and a new organizer nobody has seen before, and a category list with a trailing comma.

## What you will build / produce

- `migrations/007_import_submissions.sql`: one transaction that adds a traceability column and normalizes the submissions into `venues`, `organizers`, `events`, `categories`, and `event_categories`.
- `IMPORT-NOTES.md`: the "must not change" list, the exploratory queries you ran first, and a one-paragraph pull-request description.
- An updated change-log row and gotcha in your `db/README.md` from lesson 06.

## Before you start (prerequisites, starter files or data)

- A freshly loaded `events_board` (lesson 02's `schema.sql` and `seed.sql`).
- Save the starter data below as `submissions.sql` and load it with `psql events_board -f submissions.sql`.

```sql
-- submissions.sql: the raw spring form export (starter data for db100-x02)
DROP TABLE IF EXISTS event_submissions;
CREATE TABLE event_submissions (
  submission_id   integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_title     text,
  starts_at       timestamptz,
  ends_at         timestamptz,
  venue_name      text,
  venue_city      text,
  venue_capacity  integer,
  organizer_name  text,
  organizer_email text,
  categories      text
);
INSERT INTO event_submissions
  (event_title, starts_at, ends_at, venue_name, venue_city, venue_capacity, organizer_name, organizer_email, categories)
VALUES
  ('Tool Library Open House', '2026-10-10 10:00-04', '2026-10-10 13:00-04', 'Maker Space',      'Detroit',   40,  'Marcus Lee',     'Marcus@EastsideBoard.org', 'technology, family'),
  ('Tree Planting Morning',   '2026-10-17 09:00-04', '2026-10-17 12:00-04', 'rosa parks park ', 'Detroit',   400, 'Dana Whitfield', 'dana@eastsideboard.org',   'outdoors,civic'),
  ('Halloween Story Hour',    '2026-10-31 16:00-04', '2026-10-31 17:00-04', 'Riverside Library','Detroit',   60,  'Priya Raman',    'priya@eastsideboard.org',  'family'),
  ('Soup Swap',               '2026-11-07 12:00-05', '2026-11-07 14:00-05', 'Corner Kitchen',   'Hamtramck', 35,  'Tomas Reyes',    'tomas.reyes@example.org',  'food,family,'),
  ('Voter Info Night',        '2026-10-20 18:00-04', '2026-10-20 20:00-04', 'Fellowship Hall',  'Hamtramck', 120, 'Priya Raman',    'PRIYA@eastsideboard.org',  'civic'),
  ('Composting 101',          '2026-11-14 10:00-05', '2026-11-14 11:30-05', 'Corner Kitchen',   'Hamtramck', 35,  'Tomas Reyes',    'tomas.reyes@example.org',  'outdoors, food');
```

## Milestones

1. **Explore before you write.** Using only lesson 03 techniques (`SELECT`, `DISTINCT`, `lower()`, `trim()`, `ILIKE`), answer in `IMPORT-NOTES.md`: which submitted venues already exist? Which organizers already exist? How many distinct categories are listed, and which are new? Record each query and its row count.
2. **Write the "must not change" list.** The existing ten events, their registrations, and their ids must be untouched. Name at least three things that read these tables (the public listing, the attendance report, the lesson 06 data dictionary) and how you will confirm each still works.
3. **Add traceability.** `ALTER TABLE events ADD COLUMN source_submission_id integer` with a uniqueness rule and a foreign key to `event_submissions`, so every imported event can be traced to the row it came from and nothing can be imported twice.
4. **Normalize in dependency order** — parents before children: venues, organizers, categories, then events, then `event_categories`. Use `trim()` and `lower()` to match existing rows; insert only what is genuinely new. `string_to_array(categories, ',')` with `unnest()` turns a comma list into rows.
5. **Import every event as `draft`.** Nothing goes public until staff review it.
6. **Run inside `BEGIN` … `ROLLBACK` first.** Inspect the results with `SELECT`, run the checks, then swap `ROLLBACK` for `COMMIT`.
7. **Document.** Add a change-log row and a gotcha about `source_submission_id` to `db/README.md`.

## Acceptance criteria

- [ ] The migration applies cleanly, once, to a freshly loaded database plus `submissions.sql`.
- [ ] `psql events_board -v ON_ERROR_STOP=1 -f checks.sql` prints `All db100-x02 checks passed.`
- [ ] `SELECT count(*) FROM venues;` is 5 (one new venue, Corner Kitchen) and `SELECT count(*) FROM organizers;` is 4 (one new organizer).
- [ ] The original ten events and thirty registrations are unchanged (`count(*)` before and after recorded in `IMPORT-NOTES.md`).
- [ ] `IMPORT-NOTES.md` contains the exploration queries, the "must not change" list, and a PR description.

## Automated checks (coding courses)

Save as `checks.sql` and run it after your migration. It only reads data.

```sql
-- checks.sql: acceptance checks for db100-x02 (Import the Spring Submissions)
-- Run AFTER your import migration: psql events_board -v ON_ERROR_STOP=1 -f checks.sql
-- Read-only: these checks only SELECT.
\set ON_ERROR_STOP 1

DO $$ BEGIN
  ASSERT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'events' AND column_name = 'source_submission_id'),
    'events.source_submission_id is missing (you need it to trace each event to its submission)';
END $$;

-- 1. Every submission became exactly one event.
DO $$ DECLARE subs int; imported int; dupes int; BEGIN
  SELECT count(*) INTO subs FROM event_submissions;
  SELECT count(*) INTO imported FROM events WHERE source_submission_id IS NOT NULL;
  SELECT count(*) INTO dupes FROM (SELECT source_submission_id FROM events
    WHERE source_submission_id IS NOT NULL GROUP BY 1 HAVING count(*) > 1) d;
  ASSERT imported = subs, format('expected %s imported events, found %s', subs, imported);
  ASSERT dupes = 0, format('%s submissions were imported more than once', dupes);
END $$;

-- 2. No duplicate venues, ignoring case and stray spaces.
DO $$ DECLARE n int; BEGIN
  SELECT count(*) INTO n FROM (SELECT lower(trim(name)) FROM venues GROUP BY 1 HAVING count(*) > 1) d;
  ASSERT n = 0, format('%s venue names appear more than once (check case and whitespace)', n);
END $$;

-- 3. No duplicate organizers by email, ignoring case.
DO $$ DECLARE n int; BEGIN
  SELECT count(*) INTO n FROM (SELECT lower(trim(email)) FROM organizers GROUP BY 1 HAVING count(*) > 1) d;
  ASSERT n = 0, format('%s organizer emails appear more than once', n);
END $$;

-- 4. Each imported event points at the venue and organizer its submission named.
DO $$ DECLARE n int; BEGIN
  SELECT count(*) INTO n
  FROM event_submissions s
  JOIN events e      ON e.source_submission_id = s.submission_id
  LEFT JOIN venues v     ON v.venue_id = e.venue_id
  LEFT JOIN organizers o ON o.organizer_id = e.organizer_id
  WHERE lower(trim(v.name)) IS DISTINCT FROM lower(trim(s.venue_name))
     OR lower(o.email)      IS DISTINCT FROM lower(trim(s.organizer_email));
  ASSERT n = 0, format('%s imported events point at the wrong venue or organizer', n);
END $$;

-- 5. Each imported event carries exactly the categories listed (trimmed, blanks ignored).
DO $$ DECLARE n int; BEGIN
  SELECT count(*) INTO n FROM (
    SELECT s.submission_id,
           (SELECT coalesce(array_agg(category ORDER BY category), ARRAY[]::text[])
            FROM (SELECT DISTINCT lower(trim(t)) AS category
                  FROM unnest(string_to_array(s.categories, ',')) AS t
                  WHERE trim(t) <> '') names) AS expected,
           (SELECT coalesce(array_agg(DISTINCT lower(trim(c.name)) ORDER BY lower(trim(c.name))), ARRAY[]::text[])
            FROM event_categories ec JOIN categories c USING (category_id)
            WHERE ec.event_id = e.event_id) AS actual
    FROM event_submissions s JOIN events e ON e.source_submission_id = s.submission_id
  ) x WHERE expected IS DISTINCT FROM actual;
  ASSERT n = 0, format('%s imported events have the wrong category set', n);
END $$;

-- 6. Imported events start as drafts so nothing goes public unreviewed.
DO $$ BEGIN
  ASSERT NOT EXISTS (SELECT 1 FROM events WHERE source_submission_id IS NOT NULL AND status IS DISTINCT FROM 'draft'),
    'imported events must have status draft';
END $$;

\echo 'All db100-x02 checks passed.'
```

```bash
psql events_board -v ON_ERROR_STOP=1 -f checks.sql
```

Before your migration, the first check fails with `events.source_submission_id is missing`. That is the expected starting point.

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Exploration | Jumped straight to inserts | Each data problem found and recorded with the query that found it | Row counts predicted before each insert and confirmed after |
| Normalization | Duplicates created or lists stored in columns | All checks pass; parents inserted before children | Migration is safe to re-run (inserts guarded with `NOT EXISTS` or `ON CONFLICT`) and explains why |
| Safety | Ran statements straight at the prompt | One transaction, rehearsed with `ROLLBACK` first | Before/after counts for every touched table recorded |
| Communication | No notes | "Must not change" list and PR description present | A teammate reviewed the PR description and could approve without asking a question |

## Stretch goals

- Make the migration idempotent with `INSERT ... ON CONFLICT DO NOTHING` (you will need the unique indexes from lesson 05 for this to work).
- Write a query that flags submissions whose capacity disagrees with the capacity already stored for that venue, and decide with the staff which one wins.

## Reflection prompts

- Which messy value would have created a duplicate venue or organizer if you had not explored first?
- Why is "import as draft" a business rule rather than a technical one? Who should have made that decision?
- Which normal form does `event_submissions.categories` break, and which part of your migration fixes it?

## Instructor notes (common pitfalls, how to adapt for time)

- Most learners first match venues with `=` and create a second "rosa parks park". Let check 2 catch it; the lesson is in the failure.
- `'food,family,'` produces an empty string from `string_to_array`. Learners who skip `WHERE trim(t) <> ''` fail check 5.
- If a learner applied lesson 05's case-insensitive email index, inserting `Marcus@EastsideBoard.org` as a new organizer errors instead of duplicating — a good moment to show constraints doing their job.
- Shorter session: provide the `ALTER TABLE` for step 3 and skip the README update.
- Checks verified against a reference solution on PostgreSQL 15.
