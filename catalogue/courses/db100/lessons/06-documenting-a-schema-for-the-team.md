---
lesson_id: db100-06
course_id: db100
pathway: software-developer
title: Documenting a Schema for the Team
order: 6
kind: lesson
competency_ids:
  - D1-S1-C01
objectives:
  - Document a schema so a teammate can work against it
---

## The document is the deliverable

You can now design a schema, query it, summarize it, and change it safely. The last thing standing between that work and a functioning team is a document.

This lesson is not more SQL. It is the workplace-document skill applied to a database: producing a written artifact — a reference page, a spreadsheet, a diagram — that somebody who was not in the room can read and act on correctly. Every apprentice writes these, and the quality gap between people is enormous and immediately visible.

The standard to aim at is specific, and you should test against it literally: **a new teammate should be able to write a correct query against your schema without asking you a question.** Not "should be able to find the table names" — the database already tells them that. Correct means they know that `venue_id` can be null, that draft events must be excluded from anything public, and that `registrations` is keyed on a pair.

Three audiences read a schema document, and they read it differently.

A **new developer** needs to get productive today. They want the diagram, the table list, and the gotchas, in that order, and they will skim everything else.

A **non-engineer stakeholder** — a program manager, the person who requested the report — needs to know what the system can answer. They want the plain-language overview and nothing with a type name in it.

**You, in six months**, will need the reasons. Why `venue_id` is nullable, why the status vocabulary has four values, what changed in March. You will not remember, and the reasoning is the part nobody writes down.

Write primarily for the new developer, open with a paragraph for the stakeholder, and record the reasons in a notes column as you go. One document can serve all three if it is ordered so each audience can stop reading when they have what they need.

## The shape of the document

A schema reference has six parts, in this order. The order is not arbitrary: it goes from most general to most specific, so a reader can stop at any point.

**1. A header block.** Four facts, at the very top, before any prose:

```text
Events Board — Schema Reference
Owner:        Dana Whitfield (data lead)
Last updated: 2026-07-24
Applies to:   events_board, production and staging
Source of truth: db/migrations/ in the events-board repository
```

Every workplace document carries a title, an owner, and a date. Without an owner nobody fixes it; without a date nobody knows whether to trust it. The "source of truth" line matters most: it tells the reader that this document *describes* the schema and the migrations *define* it, so when the two disagree the migrations win. A document that claims to be authoritative when it is not is how people end up writing code against tables that were dropped last quarter.

**2. A plain-language overview.** Two or three sentences with no jargon, describing what the system stores and for whom. "The events board holds the neighborhood events the organization runs, the venues they happen at, and the residents who sign up. Staff use it to publish upcoming events and to know who is coming." That paragraph is the entire document for one of your three audiences.

**3. The entity-relationship diagram.** One picture, near the top, because the shape of a schema is spatial and prose is bad at spatial.

**4. The data dictionary.** Every table and every column. This is the bulk of the document and the part that gets read most.

**5. Conventions and gotchas.** The rules that are not visible in the schema itself.

**6. A change log.** What changed, when, and why.

## Building the data dictionary

A data dictionary is a table with one row per column of your database, and it is where the spreadsheet skill earns its keep. Use these headings:

| Table | Column | Type | Null? | Default | Key | Description | Example |
| --- | --- | --- | --- | --- | --- | --- | --- |
| events | event_id | integer | no | identity | PK | Surrogate id for one event. | 42 |
| events | title | text | no | | | Public name shown on the listing page. | Community Potluck |
| events | starts_at | timestamptz | no | | | When the event begins, stored as an absolute instant. | 2026-08-16 17:00-04 |
| events | venue_id | integer | yes | | FK venues | Where it is held. Null means online only. | 3 |
| events | status | text | no | 'draft' | | draft, published, completed, or cancelled. Only published events appear publicly. | published |

Do not type the mechanical columns by hand. Postgres knows them, and it will export them for you:

```sql
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
```

Send that straight to a CSV file your spreadsheet can open:

```bash
psql events_board -c "\copy (SELECT table_name, column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema='public' ORDER BY table_name, ordinal_position) TO 'data-dictionary.csv' WITH CSV HEADER"
```

That is the whole skeleton in one command, with no transcription errors in it. Open it in your spreadsheet tool and add the columns only a human can fill: `Key`, `Description`, `Example`, and a `Notes` column for the reasoning.

The descriptions are the actual work, and this is where most attempts fail. A description that restates the column name is worse than no description, because it costs the reader time and returns nothing:

| Bad | Good |
| --- | --- |
| `venue_id` — the venue id | The venue this event is held at. Null for online-only events, which is why most venue joins must be `LEFT JOIN`. |
| `checked_in` — checked in | Whether the attendee physically arrived. Set by staff on the day; false on every future event, so never use it to measure interest. |
| `joined_on` — join date | The day the resident created their account. Not the day they first registered for an event. |

The pattern in the good column: say what the value *means*, then say the thing a reader would otherwise get wrong. If you cannot name a way to misread the column, one plain sentence is enough.

Spreadsheet craft matters here, because this file will be opened by people who will sort and filter it:

- **One header row, frozen**, so the headings stay visible when the reader scrolls to row 60. Bold it. Do not stack a title above it — a merged cell in row 1 breaks sorting and every import.
- **One fact per cell.** Not `text, not null, FK` crammed into one column; that is the same 1NF rule from lesson 05, applied to a spreadsheet.
- **Consistent vocabulary.** Pick `yes`/`no` for nullability and never mix in `Y`, `TRUE`, or a blank. Inconsistent values make filtering useless, and filtering is the only reason this is a spreadsheet.
- **Turn on the filter row** and sort by table then by column order, so related rows sit together.
- **Widen the description column and wrap the text.** A dictionary you cannot read without clicking each cell will not be read.
- **Export a copy as CSV** and keep it in the repository next to the migrations. The spreadsheet is for editing; the CSV is what diffs in a pull request and what survives the person who owned the file leaving.

For a schema this size you can also keep the dictionary directly in the document as a Markdown table, one table per database table, which has the advantage of living in the same file as everything else. Use a spreadsheet when the dictionary is large, when non-developers maintain it, or when people need to filter it; use Markdown when it is small and lives beside the code. Either way, do not maintain both — two copies means one of them is wrong.

## Drawing the diagram

An entity-relationship diagram is a box per table and a line per relationship, with the line ends carrying the cardinality. The usual notation is called **crow's foot**, after the three-pronged mark that means "many."

![Crow's foot notation legend showing the line-end symbols for exactly one, zero or one, one or many, and zero or many, with an example relationship between two tables](./img/crows-foot-notation.png)

Read a line by reading each end separately: a single bar means exactly one, a circle means zero is allowed, and the three-pronged foot means many. The line between `venues` and `events` has a bar at the venue end and a crow's foot with a circle at the event end — one venue, zero or more events.

Practical rules for a diagram people actually use:

- **Show every table, but not every column.** Primary keys, foreign keys, and the two or three columns that identify a row to a human. The full column list is the dictionary's job, and a diagram that repeats it is unreadable at any zoom level.
- **Put parents above or left of children,** so foreign keys generally point up and left. Consistent direction is most of what makes a diagram legible.
- **Label relationships with a verb** — "hosts", "organizes", "registers for". A line with no verb makes the reader guess, and a many-to-many with no verb makes them guess wrong.
- **Draw junction tables as tables**, not as a line with a diamond on it. `registrations` holds real facts; hiding it hides `checked_in`.
- **Do not draw column types.** They change more often than the shape does, and every change becomes a diagram edit.

Any of several tools will do this: diagrams.net for freehand boxes, dbdiagram.io or Mermaid for text you type and render, or your presentation tool if that is what the team already has. The choice matters less than two rules. **Keep the editable source file in the repository, not only the exported image** — a picture nobody can edit is a picture that will be wrong forever. And **export a PNG or SVG and embed that in the document**, because a link to a diagramming service is a link that expires when someone's account does.

If your document ever gets presented rather than read — a fifteen-minute walkthrough for the team, which is a normal request — the diagram is your one slide. Show the shape, name the three tables people will actually query, and spend the rest of the time on the gotchas.

## Conventions and gotchas

This section is short, high-value, and the part of the document a reviewer will thank you for.

**Naming conventions** let a reader predict a name instead of looking it up:

```text
Tables       plural, snake_case                 events, event_categories
Primary key  singular table name + _id          event_id
Foreign key  same name as the key it references venue_id
Timestamps   suffix _at, always timestamptz     starts_at, registered_at
Dates        suffix _on, type date              joined_on
Booleans     read as a true statement           checked_in
Junctions    parent table + child table, or a   event_categories,
             noun naming the relationship       registrations
```

**Controlled vocabularies** need writing down because the database only enforces the set, not the meaning: `draft` means not yet public; `published` means visible on the site; `completed` means it happened; `cancelled` means it was called off and must never be counted as attendance.

**Gotchas** are the rules a correct query depends on that nothing in the schema states:

- `events.venue_id` is null for online events. Use `LEFT JOIN venues` unless you deliberately mean in-person only.
- `registrations` has a composite primary key `(event_id, attendee_id)`. There is no single `registration_id` to reference.
- Counting rows off a left join needs `count(registrations.attendee_id)`, not `count(*)`, or events with no signups report one.
- `checked_in` is false for every future event. It measures attendance, never interest.
- Anything public-facing filters `status = 'published'`. Draft events are unfinished and leak details the staff have not agreed to.

Every one of those is a bug somebody would otherwise ship, and each costs you one line to prevent. Finish the section with **who to ask** when the document is silent — a name and a channel, not "the team."

## Keeping it true

An out-of-date schema document is worse than none, because it is trusted. Three habits keep it honest.

**Store it with the code it describes.** `db/README.md` beside `db/migrations/` means it appears in searches, opens in the same editor, and travels with the repository. A document in someone's personal drive is already lost.

**Update it in the same pull request as the migration.** Not afterwards, not in a ticket. A migration that adds a column and does not touch the dictionary should get a review comment asking where the description went — and when you are the reviewer, that is a comment you should be willing to leave. Keep a change log at the foot of the document so history is visible:

| Date | Change | Migration | Author |
| --- | --- | --- | --- |
| 2026-07-24 | Renamed `events.summary` to `description` | 004, 005 | M. Lee |
| 2026-07-02 | Added status and time-order checks | 002 | D. Whitfield |

**Test the document on a person.** Hand it to a teammate who has never seen the schema and give them one task: "write a query listing published events next month with their venue and signup count." Watch without helping, and time it. Every question they ask out loud is a defect in your document, and you fix the document rather than answering the question. This is the same review loop you would run on any workplace deliverable, and it takes twenty minutes to find problems you would never have seen yourself.

## Practice

Produce a real schema document for `events_board` as it stands after lesson 05's migrations. This is a document-production exercise: the deliverable is judged on whether somebody else can use it.

1. Export the mechanical data from `information_schema` to `data-dictionary.csv` with the `\copy` command above. Confirm the row count matches the number of columns across your seven tables.
2. Open it in a spreadsheet tool and add `Key`, `Description`, `Example`, and `Notes` columns. Fill in every row. Apply the formatting rules: bold and frozen header, filter row on, consistent `yes`/`no` in the nullable column, description column widened with text wrapping, sorted by table and ordinal position.
3. Re-export the finished sheet as CSV and save it in your repository next to `migrations/`. Confirm it opens cleanly and that no cell contains a stray line break that shifts the columns.
4. Draw the entity-relationship diagram in a tool of your choice. Every table, keys plus two identifying columns each, crow's foot ends, verbs on the relationships, parents above children. Export a PNG and keep the editable source alongside it.
5. Write `db/README.md` with all six sections: header block, plain-language overview, the embedded diagram, the data dictionary (as a Markdown table for the three most-queried tables, with a link to the CSV for the rest), conventions and gotchas, and an empty change log with its column headings.
6. Write the gotchas section from your own experience, not from this lesson's list. Go back through your lesson 03, 04, and 05 notes, find the four things that actually caught you out, and write one line each in the form "here is the trap, here is what to do instead."
7. Run the twenty-minute test. Give the document to someone who has not seen your schema and ask them to write: published events in the next sixty days with venue name and signup count, zero-signup events included. Do not help. Write down every question they ask and every mistake they make, then fix the document so each one could not happen again, and add a change-log row recording the revision.
8. Write the one-paragraph stakeholder summary as a separate short section at the top, and check it against a hard rule: no table name, no column name, no type name anywhere in it.

**Deliverable:** a `db/README.md` containing all six sections and an embedded diagram, a `data-dictionary.csv` beside it, the diagram's editable source file, and a short note recording what your reader got stuck on and what you changed in response.

## Check your understanding

1. Your schema document and the latest migration disagree about whether `events.ends_at` is required. Which one is right, and what line in the header block tells the reader that?
2. Rewrite this dictionary description so it earns its place: "`registered_at` — registered at."
3. Why should the data dictionary be updated in the same pull request as the migration rather than afterwards?

*Answers:* (1) The migration; the "Source of truth" line says the migrations define the schema and the document describes it. (2) For example: "The moment the resident signed up, stored as an absolute instant. Set automatically on insert; not the time of the event and not when they checked in." (3) Because a dictionary updated later is a dictionary that is wrong in between — and in practice "later" often never comes; the reviewer can only check both together if they arrive together.
