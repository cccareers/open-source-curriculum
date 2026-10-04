---
course_id: db100
project_id: db100-x01
title: "Volunteer Shift Roster"
kind: supplementary-project
status: draft
hours_estimate: 5
difficulty: core
related_lessons:
  - db100-02
  - db100-04
  - db100-05
objectives:
  - Model a domain as tables, keys, and relationships
  - Combine and summarize data across tables with joins and aggregation
  - Apply constraints and normalization to keep data correct through change
competency_ids:
  - D5-S1-C02
  - D2-S1-C04
  - D5-S1-C03
---

## Scenario

Dana Whitfield, the events board's data lead, forwards you a message from the volunteer coordinator:

> For the bigger events we need people for setup, check-in, and teardown. I want to say "the Neighborhood Cleanup needs 3 setup and 2 check-in volunteers," let residents sign up for a role with a shift time, and see at a glance which events are short. Right now I do it in a group chat and people get double-booked.

Lesson 02's practice asked you to sketch a `volunteers.sql`. This project turns that sketch into a hardened, tested part of the `events_board` schema.

## What you will build / produce

- A migration file `migrations/006_volunteers.sql` (one transaction) that creates three tables and one view.
- A `seed_volunteers.sql` with realistic data for at least three events.
- A `volunteer_reports.sql` answering the coordinator's questions.
- A short section added to your `db/README.md` from lesson 06 documenting the new tables.

## Before you start (prerequisites, starter files or data)

- The `events_board` database loaded from lesson 02's `schema.sql` and `seed.sql`. If you have applied lesson 05's migrations too, that is fine.
- The acceptance-check file `checks.sql` from the **Automated checks** section below, saved in your project folder.
- The checks expect these exact names, because a teammate's code will read them:

| Object | Columns (minimum) |
| --- | --- |
| `volunteer_roles` | `role_id` (surrogate PK), `name` |
| `volunteer_needs` | `event_id`, `role_id`, `needed` |
| `volunteer_shifts` | `shift_id` (surrogate PK), `event_id`, `role_id`, `attendee_id`, `shift_start`, `shift_end` |
| `shift_coverage` (view) | `event_id`, `title`, `role_name`, `needed`, `filled` |

## Milestones

1. **Model on paper first.** Write the cardinality of each relationship in a comment at the top of the migration: role to need, event to need, attendee to shift. Decide what the primary key of `volunteer_needs` is and why it does not need a surrogate.
2. **Create the tables** with types chosen deliberately: `timestamptz` for shift times, `integer` for `needed`.
3. **Add the constraints the coordinator described in prose**: role names unique regardless of capitalization; a shift ends after it starts; `needed` is positive; a person cannot hold the same role twice at the same event; deleting an event removes its needs and shifts. Name every constraint.
4. **Build the `shift_coverage` view** — one row per need, with `filled` as an integer count that is `0`, never `NULL` and never missing, when nobody has signed up. (Lesson 04: which join type, and which `count`?)
5. **Seed it.** At least three roles, needs on at least three events, and at least one need with zero volunteers.
6. **Write the reports** in `volunteer_reports.sql`:
   - Every published event that is short of volunteers, with how many more it needs, most short first.
   - Each volunteer's total hours across all shifts (`sum(shift_end - shift_start)`), including residents with zero.
   - Any resident booked on two overlapping shifts at the same time (a self join on `volunteer_shifts`).
7. **Run the checks** until they all pass, then document the tables in `db/README.md` with at least two gotchas.

## Acceptance criteria

- [ ] `psql events_board -f migrations/006_volunteers.sql` runs cleanly on a freshly loaded database.
- [ ] `psql events_board -v ON_ERROR_STOP=1 -f checks.sql` prints `All db100-x01 checks passed.`
- [ ] Every constraint has a descriptive name (no `_check1` / `_fkey1` defaults on constraints you added by hand).
- [ ] `shift_coverage` returns `0` for a need with no volunteers.
- [ ] The overlap report finds a double-booking you deliberately seeded.
- [ ] `db/README.md` has dictionary rows for every new column and at least two gotchas.

## Automated checks (coding courses)

Save as `checks.sql`. It runs entirely inside a transaction that is rolled back, so it never changes your data. Each check prints a `FAIL:` message naming what went wrong.

```sql
-- checks.sql: acceptance checks for db100-x01 (Volunteer Shift Roster)
-- Run: psql events_board -v ON_ERROR_STOP=1 -f checks.sql
-- Every check runs inside one transaction that is rolled back, so your data is untouched.
\set ON_ERROR_STOP 1
BEGIN;

-- 1. The required tables and view exist.
DO $$ BEGIN
  ASSERT to_regclass('public.volunteer_roles')  IS NOT NULL, 'missing table volunteer_roles';
  ASSERT to_regclass('public.volunteer_needs')  IS NOT NULL, 'missing table volunteer_needs';
  ASSERT to_regclass('public.volunteer_shifts') IS NOT NULL, 'missing table volunteer_shifts';
  ASSERT to_regclass('public.shift_coverage')   IS NOT NULL, 'missing view shift_coverage';
END $$;

-- Fixture: one role, one need, on event 1 (Neighborhood Cleanup) and event 2 (Intro to Soldering).
INSERT INTO volunteer_roles (name) VALUES ('test-setup');
INSERT INTO volunteer_needs (event_id, role_id, needed)
  SELECT e, role_id, 2 FROM volunteer_roles, (VALUES (1),(2)) AS v(e) WHERE name = 'test-setup';
INSERT INTO volunteer_shifts (event_id, role_id, attendee_id, shift_start, shift_end)
  SELECT 1, role_id, 1, '2026-08-02 08:00-04', '2026-08-02 10:00-04' FROM volunteer_roles WHERE name = 'test-setup';

-- 2. Role names are unique, case-insensitively.
DO $$ BEGIN
  BEGIN
    INSERT INTO volunteer_roles (name) VALUES ('TEST-SETUP');
    RAISE EXCEPTION 'FAIL: duplicate role name (different case) was accepted';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;
END $$;

-- 3. A shift cannot end before it starts.
DO $$ BEGIN
  BEGIN
    INSERT INTO volunteer_shifts (event_id, role_id, attendee_id, shift_start, shift_end)
      SELECT 1, role_id, 2, '2026-08-02 10:00-04', '2026-08-02 09:00-04' FROM volunteer_roles WHERE name = 'test-setup';
    RAISE EXCEPTION 'FAIL: shift ending before it starts was accepted';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
END $$;

-- 4. A shift must point at a real event and a real attendee.
DO $$ BEGIN
  BEGIN
    INSERT INTO volunteer_shifts (event_id, role_id, attendee_id, shift_start, shift_end)
      SELECT 999, role_id, 1, '2026-08-02 08:00-04', '2026-08-02 10:00-04' FROM volunteer_roles WHERE name = 'test-setup';
    RAISE EXCEPTION 'FAIL: shift for a non-existent event was accepted';
  EXCEPTION WHEN foreign_key_violation THEN NULL;
  END;
END $$;

DO $$ BEGIN
  BEGIN
    INSERT INTO volunteer_shifts (event_id, role_id, attendee_id, shift_start, shift_end)
      SELECT 1, role_id, 999, '2026-08-02 08:00-04', '2026-08-02 10:00-04' FROM volunteer_roles WHERE name = 'test-setup';
    RAISE EXCEPTION 'FAIL: shift for a non-existent attendee was accepted';
  EXCEPTION WHEN foreign_key_violation THEN NULL;
  END;
END $$;

-- 5. The same person cannot hold the same role twice at the same event.
DO $$ BEGIN
  BEGIN
    INSERT INTO volunteer_shifts (event_id, role_id, attendee_id, shift_start, shift_end)
      SELECT 1, role_id, 1, '2026-08-02 08:00-04', '2026-08-02 10:00-04' FROM volunteer_roles WHERE name = 'test-setup';
    RAISE EXCEPTION 'FAIL: duplicate shift was accepted';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;
END $$;

-- 6. shift_coverage reports filled vs needed, including needs with zero volunteers.
DO $$
DECLARE c1 int; c2 int;
BEGIN
  SELECT filled INTO c1 FROM shift_coverage WHERE event_id = 1 AND role_name = 'test-setup';
  SELECT filled INTO c2 FROM shift_coverage WHERE event_id = 2 AND role_name = 'test-setup';
  ASSERT c1 = 1, format('expected 1 volunteer filled for event 1, got %s', c1);
  ASSERT c2 = 0, format('expected 0 (not NULL, not missing) for event 2, got %s', c2);
END $$;

-- Add a real shift on event 2 so the cascade check tests both child tables.
INSERT INTO volunteer_shifts (event_id, role_id, attendee_id, shift_start, shift_end)
  SELECT 2, role_id, 2, '2026-08-09 08:00-04', '2026-08-09 10:00-04' FROM volunteer_roles WHERE name = 'test-setup';

-- 7. Deleting an event removes its needs and shifts (no orphans, no error).
DO $$ BEGIN
  DELETE FROM registrations    WHERE event_id = 2;
  DELETE FROM event_categories WHERE event_id = 2;
  DELETE FROM events WHERE event_id = 2;
  ASSERT NOT EXISTS (SELECT 1 FROM volunteer_needs WHERE event_id = 2), 'volunteer_needs rows survived their event';
  ASSERT NOT EXISTS (SELECT 1 FROM volunteer_shifts WHERE event_id = 2), 'volunteer_shifts rows survived their event';
END $$;

\echo 'All db100-x01 checks passed.'
ROLLBACK;
```

Run it:

```bash
psql events_board -v ON_ERROR_STOP=1 -f checks.sql
```

The checks rely on Postgres's built-in `ASSERT` statement inside `DO` blocks, and on catching specific error classes (`unique_violation`, `check_violation`, `foreign_key_violation`). If a check fails, the message after `ERROR:` tells you which rule your schema does not yet enforce. Check 7 deletes an event's registrations and categories by hand first so it works whether or not you applied lesson 05's `ON DELETE CASCADE` migration.

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Model | Tables exist but cardinality is not stated or a list is stored in a column | Cardinality stated; junction-style tables with composite or justified keys | Comment explains a rejected alternative design and why |
| Constraints | Some rules enforced only in prose | Every rule in milestone 3 enforced and named; all checks pass | Adds a further justified rule (e.g. shift must fall on the event's day) with its own test |
| Reports | Queries run but drop zero rows or double-count | Correct counts including zeros; overlap report works | Explains in comments how each report was spot-checked by hand |
| Documentation | Table names listed | Dictionary rows with meaning-bearing descriptions; two gotchas | A teammate wrote a correct query from the doc alone, and that is recorded |

## Stretch goals

- Prevent overlapping shifts for the same person in the database itself, not just in a report. Research Postgres exclusion constraints (`EXCLUDE USING gist`) and the `btree_gist` extension; record in your notes what you learned and whether you would ship it.
- Add a `cancelled_at` column to shifts and update the view so cancelled shifts do not count as filled.

## Reflection prompts

- Which rule did you first try to enforce in a report and later move into a constraint? What made you move it?
- Where did `count(*)` versus `count(column)` matter in this project?
- What would break for the coordinator if someone later renamed `volunteer_needs.needed`? How would you change it safely?

## Instructor notes (common pitfalls, how to adapt for time)

- The most common failure is check 6 returning `NULL` or no row for event 2: learners inner-join shifts, or use `count(*)` on a left join (which returns 1). Both are lesson 04's exact traps.
- Learners often put `UNIQUE (name)` on roles and fail check 2; point them back to the `lower(email)` index in lesson 05.
- For a shorter session (2–3 hours), drop milestone 6's overlap report and the README section.
- The checks were verified against a reference solution on PostgreSQL 15; nothing in them is version-specific beyond `ASSERT` (available since 9.5).
