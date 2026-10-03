---
course_id: db100
title: "Relational Databases — Enhancement Review"
reviewed_lessons: 6
status: draft
---

## Summary

db100 is a strong, coherent course. One running example (the community events board in PostgreSQL) carries through all six lessons, the seed data deliberately includes edge cases, and the practice sets are realistic. I loaded lesson 02's `schema.sql` and `seed.sql` into PostgreSQL 15 and spot-checked every numeric claim in lessons 03–05. All matched except one engine-behavior claim. The biggest opportunities are (a) fixing three factual slips (the `HAVING` alias, the `NOT NULL NOT VALID` advice, and the junction-table naming convention), (b) adding setup steps that block learners on day one, and (c) adding short self-checks, since no lesson currently has one.

## Clarity issues

| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| db100-02 | "Setting up PostgreSQL and the events board" | `brew install postgresql@16` is keg-only, so `psql`/`createdb` aren't on PATH and the next step fails | Added a PATH note | Applied |
| db100-02 | "Setting up PostgreSQL and the events board" | On Debian/Ubuntu, `createdb` as the login user fails with `role ... does not exist` | Added `sudo -u postgres createuser --superuser "$USER"` with a local-only caveat | Applied |
| db100-02 | "Reading a schema you did not write" | Sample `\d events` output omits several columns and the `Collation` column without saying so; learners compare literally | Added one sentence saying the listing is trimmed | Applied |
| db100-03 | "The order SQL actually runs in" | Says "Two consequences" then lists three | Changed to "Three consequences" | Applied |
| db100-04 | "HAVING, and the order things run in" | **Factual error:** says "Postgres is lenient about `HAVING` aliases." Postgres 15 rejects `HAVING signups >= 5` with `column "signups" does not exist` (verified); MySQL is the lenient engine | Corrected the sentence, quoted the real error | Applied |
| db100-04 | "The two ways a summary goes wrong" | Fan-out explanation credits only the Cleanup with two categories; all three Rosa Parks events with signups have two, and Fellowship/Maker Space inflate differently | Rewrote the explanation with all three venues' true vs inflated numbers | Applied |
| db100-05 | "Normalization: storing each fact once" | Claims `event_submissions` normalizes into "exactly the seven tables you already have"; it yields five (no attendees/registrations) | Corrected to five, named them | Applied |
| db100-05 | "Changing a schema that is already in use" | `-- UPDATE 2` comment is date-dependent (it's 6 on any date after 2026-09-12) | Changed to `UPDATE n` with a note | Applied |
| db100-05 | "Changing a schema that is already in use" | **Technical error:** advises adding `NOT NULL` "as `NOT VALID`". Postgres 16 has no `SET NOT NULL NOT VALID` (syntax error, verified on 15) | Replaced with the `CHECK (...) NOT VALID` → `VALIDATE` → `SET NOT NULL` pattern and a code block | Applied |
| db100-06 | "Conventions and gotchas" | Convention "Junctions: both table names, alphabetical" contradicts `event_categories` (alphabetical is `categories_events`) and `registrations` | Rewrote as "parent + child, or a noun naming the relationship" | Applied |

## Depth and coverage gaps

- **No self-checks anywhere** (all objectives). Added a "Check your understanding" block with answers to lessons 02–06.
- **Model a domain as tables, keys, and relationships:** one-to-one is mentioned but never shown. A short worked example (e.g. a `venue_accessibility` table) would complete the cardinality set.
- **Retrieve data from a relational database with SQL:** time zones are introduced in lesson 02 (`timestamptz`) but no query shows `AT TIME ZONE` or what `SET timezone` does to output. A short example would head off a common confusion with the `-04`/`-05` offsets in the seed data.
- **Combine and summarize data across tables with joins and aggregation:** window functions aren't covered. That's acceptable at this level. Not proposing scope creep, just noting that "rank events by signups within each venue" is a common request learners will hit.
- **Apply constraints and normalization to keep data correct through change:** `ON CONFLICT` (upsert) isn't introduced but is the natural tool for idempotent imports. Project db100-x02 uses it as a stretch goal.
- **Apply constraints and normalization to keep data correct through change:** practice item 6 in lesson 05 ("normalize it") is the hardest task in the course, with no worked example of `string_to_array`/`unnest` for splitting the category list. Project db100-x02 provides that scaffold.
- **Document a schema so a teammate can work against it:** the lesson references `./img/crows-foot-notation.png` and lesson 02 references `./img/events-board-erd.png`. Confirm both images exist in the published course (see Open questions).

## Proposed additional projects

- **db100-x01 Volunteer Shift Roster** (drafted): extends the schema with roles, needs, and shifts; constraints, zero-safe coverage view, overlap report. Includes `checks.sql` verified against a reference solution.
- **db100-x02 Import the Spring Submissions Form** (drafted): normalize a messy flat table into the existing schema as drafts, with traceability. Includes `checks.sql` verified against a reference solution.
- Not drafted: **Annual Impact Report**: produce the five numbers a funder asks for (events held, unique attendees, check-in rate, events per category, busiest venue), each with a hand spot-check and a one-line "how this could be wrong" note.
- Not drafted: **Schema hand-off drill**: two learners swap `db/README.md` files and complete a query task against each other's schema, logging every question asked.

## Video and animation opportunities

- **The phantom signup: `count(*)` on a left join** (db100-04): screencast. Drafted as `media/video-01-the-phantom-signup.md`.
- **SELECT first, then UPDATE: the transaction safety net** (db100-05): screencast. Drafted as `media/video-02-select-first-then-update.md`.
- **Where join rows come from: matches, phantoms, fan-out** (db100-04): explainer animation. Motion makes row creation and multiplication visible. Drafted as `media/animation-01-joins-make-and-multiply-rows.md`.
- Not drafted: **Logical evaluation order** (db100-03/04): animation of a query whose clauses light up in FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT order, with rows filtering at each step.
- Not drafted: **Three-valued logic** (db100-03): whiteboard on true/false/unknown and why `NOT IN` with a NULL returns nothing.
- Not drafted: **Expand and contract** (db100-05): timeline animation of five deploys, showing old and new app versions reading and writing both columns.

## Assessment ideas

- Predict-the-count items: show a query and the seed data, and ask for the row count before running it. Use the inner vs left join, `count(*)` vs `count(col)`, and fan-out cases.
- "Spot the bug" items: five short queries, each with one of `= NULL`, `"draft"` double quotes, `LIMIT` without `ORDER BY`, a `WHERE` on the optional side of a left join, or `BETWEEN` on timestamps.
- Rubric for the lesson 06 deliverable: a teammate completes the 60-day signup query from the document alone. Score = number of questions asked (0 = exceeds, 1–2 = meets, 3+ = developing).
- A short migration review: give learners a flawed migration (no transaction, unnamed constraints, a rename in one step) and ask them to write review comments.

## Changes applied in this pass

- `02-relational-foundations-and-data-modeling.md`, "Setting up PostgreSQL and the events board": added the Homebrew keg-only PATH note.
- `02-relational-foundations-and-data-modeling.md`, "Setting up PostgreSQL and the events board": added the Linux role-creation step.
- `02-relational-foundations-and-data-modeling.md`, "Reading a schema you did not write": noted that the `\d` sample is trimmed.
- `02-relational-foundations-and-data-modeling.md`: added "Check your understanding" (4 questions with answers).
- `03-querying-with-sql.md`, "The order SQL actually runs in": "Two consequences" → "Three consequences".
- `03-querying-with-sql.md`: added "Check your understanding" (4 questions with answers).
- `04-joins-and-aggregation.md`, "HAVING, and the order things run in": corrected the false claim that Postgres allows `SELECT` aliases in `HAVING`.
- `04-joins-and-aggregation.md`, "The two ways a summary goes wrong": rewrote the fan-out explanation with accurate per-venue numbers.
- `04-joins-and-aggregation.md`: added "Check your understanding" (4 questions with answers).
- `05-constraints-normalization-and-schema-change.md`, "Normalization: storing each fact once": "seven tables" → the five tables actually produced.
- `05-constraints-normalization-and-schema-change.md`, "Changing a schema that is already in use": made the `UPDATE` row-count comment date-independent.
- `05-constraints-normalization-and-schema-change.md`, "Changing a schema that is already in use": replaced the invalid `NOT NULL ... NOT VALID` advice with the correct `CHECK NOT VALID` / `VALIDATE` / `SET NOT NULL` sequence.
- `05-constraints-normalization-and-schema-change.md`: added "Check your understanding" (4 questions with answers).
- `06-documenting-a-schema-for-the-team.md`, "Conventions and gotchas": fixed the junction-table naming convention so it matches the schema.
- `06-documenting-a-schema-for-the-team.md`: added "Check your understanding" (3 questions with answers).

## Open questions for the course owner

- Lessons reference `./img/events-board-erd.png` and `./img/crows-foot-notation.png`, but no `img/` folder exists under `catalogue/courses/db100/lessons/`. Are these images still to be produced? (The ERD could be generated from the lesson 06 practice.)
- The course installs PostgreSQL 16; I verified SQL on PostgreSQL 15. Nothing used is version-specific between them. PostgreSQL 18 reportedly adds `NOT NULL ... NOT VALID`. I haven't verified that, so the lesson now says "in Postgres 16" to stay accurate for the pinned version.
- Lesson 05 describes `ON DELETE RESTRICT` as "effectively the default." That's true for immediate constraints. Do you want the `NO ACTION` vs `RESTRICT` deferral difference mentioned, or is it out of scope?
- Lesson 03's `to_char` example uses `FMDay, FMMonth`. Fine in Postgres; flag if the course will ever offer a MySQL/SQLite track.
