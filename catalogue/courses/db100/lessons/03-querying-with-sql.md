---
lesson_id: db100-03
course_id: db100
pathway: software-developer
title: Querying with SQL
order: 3
kind: lesson
competency_ids:
  - D2-S1-C04
objectives:
  - Retrieve data from a relational database with SQL
---

## The shape of every query

You have a schema and ten events in it. Now you ask questions.

SQL is declarative: you describe the rows you want, not the steps to find them. Every retrieval you write in this lesson is a variation on one statement:

```sql
SELECT title, starts_at
FROM events
WHERE status = 'published'
ORDER BY starts_at
LIMIT 5;
```

Five clauses, and each does exactly one job. `FROM` names the table. `WHERE` decides which rows survive. `SELECT` decides which columns come back and what shape they are in. `ORDER BY` sorts. `LIMIT` truncates. That is the entire skeleton, and joins and grouping in the next lesson add clauses to it without changing it.

Run it:

```text
        title         |       starts_at
----------------------+------------------------
 Neighborhood Cleanup | 2026-08-02 09:00:00-04
 Intro to Soldering   | 2026-08-09 13:00:00-04
 Community Potluck    | 2026-08-16 17:00:00-04
 Resume Workshop      | 2026-08-20 18:00:00-04
 Bike Repair Clinic   | 2026-09-05 10:00:00-04
(5 rows)
```

Some conventions before you write more. SQL keywords are case-insensitive, but writing them uppercase and your identifiers lowercase makes a long query readable at a glance, and every team you join will expect it. Whitespace and line breaks mean nothing to the parser, so put each clause on its own line — a query that fits on one line today will not fit next week. And the statement ends at the semicolon, not at the newline; if `psql` is showing you `events_board-#` it is still waiting for one.

One more convention that is not cosmetic: **single quotes are for string values, double quotes are for identifiers.** `WHERE status = 'draft'` filters on the text `draft`. `WHERE status = "draft"` tells Postgres to compare the `status` column to a *column named* `draft`, and you get `ERROR: column "draft" does not exist`. That error message is the single most common confusion in a first SQL week, and now you know what it means.

## SELECT: choosing and shaping columns

`SELECT *` returns every column. It is right for exploring at the prompt and wrong everywhere else. Naming your columns means you transfer only what you need, and it means adding a column to the table later cannot change what your query returns — which matters enormously once an application is reading the results by position.

Naming columns is called **projection**, and the list can hold more than column names. Any expression works:

```sql
SELECT title,
       ends_at - starts_at AS duration
FROM events;
```

Subtracting two `timestamptz` values gives an `interval`, so `duration` comes back as `03:00:00`. That column does not exist in the table; you computed it, and `AS duration` gave it a name. Without an alias Postgres invents one like `?column?`, which is unusable from application code. **Alias every computed column.** The `AS` keyword is optional — `ends_at - starts_at duration` works — but include it, because omitting it turns a single missing comma into a silently renamed column instead of an error.

Text is concatenated with `||`:

```sql
SELECT title || ' at ' || city AS listing
FROM events, venues;
```

Do not run that one yet — pulling from two tables like this without connecting them is a cross join, and it is the next lesson's business. Keep to one table for now.

`DISTINCT` removes duplicate rows from the result:

```sql
SELECT DISTINCT status FROM events;
```

```text
  status
-----------
 published
 completed
 draft
(3 rows)
```

`DISTINCT` applies to the whole row you selected, not to the first column. `SELECT DISTINCT status, venue_id` gives you distinct *pairs*, which is usually not what someone typing it quickly meant.

## WHERE: choosing rows

`WHERE` takes a condition and keeps the rows for which it is true. The comparison operators are what you would expect — `=`, `<>` (also written `!=`), `<`, `>`, `<=`, `>=` — and they work on numbers, text, dates, and booleans alike.

```sql
SELECT name, city, capacity
FROM venues
WHERE capacity >= 100;
```

```text
      name       |   city    | capacity
-----------------+-----------+----------
 Rosa Parks Park | Detroit   |      400
 Fellowship Hall | Hamtramck |      120
(2 rows)
```

Combine conditions with `AND`, `OR`, and `NOT`. `AND` binds tighter than `OR`, exactly like `*` binds tighter than `+`, so this:

```sql
WHERE city = 'Detroit' AND capacity > 100 OR capacity > 300
```

means `(city = 'Detroit' AND capacity > 100) OR capacity > 300`, which includes large venues in every city. If you meant the other grouping you must say so with parentheses. **Parenthesize any mix of `AND` and `OR`**, even when the default precedence is what you want, because the next person to read it should not have to remember the rule.

Four operators save you from writing long chains.

**`IN`** tests membership in a list:

```sql
SELECT title, status FROM events
WHERE status IN ('draft', 'completed');
```

**`BETWEEN`** tests an inclusive range. `capacity BETWEEN 50 AND 150` is `capacity >= 50 AND capacity <= 150`. Inclusive at both ends is the part people forget, and it makes `BETWEEN` a poor fit for timestamps: `starts_at BETWEEN '2026-08-01' AND '2026-08-31'` silently excludes almost the whole of the 31st, because `'2026-08-31'` means midnight at its start. For date ranges over timestamps, write a half-open range instead:

```sql
SELECT title, starts_at FROM events
WHERE starts_at >= '2026-08-01' AND starts_at < '2026-09-01';
```

**`LIKE`** does pattern matching, where `%` matches any run of characters and `_` matches exactly one:

```sql
SELECT title FROM events WHERE title LIKE 'Intro%';
```

```text
        title
----------------------
 Intro to Soldering
 Intro to Databases
(2 rows)
```

`LIKE` is case-sensitive. Postgres adds `ILIKE`, which is not, and it is almost always what you want for user-typed search: `title ILIKE '%repair%'` finds the Bike Repair Clinic whatever the visitor's shift key was doing. Be aware that a pattern starting with `%` cannot use an ordinary index, so leading-wildcard search on a large table is slow — fine for ten events, worth knowing before you put it on a page.

**`IS NULL`** tests for absence, and it is the one that catches everyone.

```sql
SELECT title, venue_id FROM events WHERE venue_id IS NULL;
```

```text
        title         | venue_id
----------------------+----------
 Online Budgeting Q&A |
(1 row)
```

Writing `WHERE venue_id = NULL` instead returns zero rows and no error. The reason is that SQL uses **three-valued logic**: a comparison can be true, false, or unknown, and `NULL` means "unknown," so *anything* compared to it is unknown. `WHERE` keeps only rows where the condition is true, so unknown rows are dropped. `IS NULL` and `IS NOT NULL` are the only operators that test for it.

The consequence that will actually bite you is subtler. Consider:

```sql
SELECT title FROM events WHERE venue_id <> 3;
```

You get every event at a venue other than Fellowship Hall — and *not* the online Q&A, because `NULL <> 3` is unknown, not true. That is logically correct and almost never what the person asking wanted. When a column is nullable, say what you mean about the nulls:

```sql
SELECT title FROM events
WHERE venue_id <> 3 OR venue_id IS NULL;
```

The same trap has a nastier form with `NOT IN`. If any value in the list is `NULL`, `NOT IN` returns no rows at all, ever. Keep `NULL` out of `NOT IN` lists.

Booleans need no comparison at all. `WHERE checked_in` is complete and preferred; `WHERE checked_in = true` works and reads like a beginner wrote it. For the negative, prefer `WHERE NOT checked_in`, and remember that a `NULL` boolean satisfies neither.

Filtering on time is a daily task. Postgres parses ISO-8601 strings directly, gives you `now()` for the current instant, and does arithmetic with `interval`:

```sql
SELECT title, starts_at FROM events
WHERE starts_at > now()
  AND starts_at < now() + interval '60 days'
  AND status = 'published'
ORDER BY starts_at;
```

`current_date` gives today with no time. `date_trunc('month', starts_at)` snaps a timestamp down to the first instant of its month. `extract(dow FROM starts_at)` pulls the day of week out as a number, `0` for Sunday. And `starts_at::date` casts a timestamp to a plain date, which is the readable way to compare "the same day" — though note that casting a column that way stops an index on it from being used, so on a large table prefer the half-open range above.

## Sorting and limiting

`ORDER BY` sorts the result. Without it, the order of rows is undefined — not "insertion order," not "primary key order," *undefined*, and it will change as the table grows or the plan changes.

```sql
SELECT title, status, starts_at
FROM events
ORDER BY starts_at DESC
LIMIT 3;
```

`ASC` is the default and can be omitted; `DESC` reverses. You can sort by several keys, each with its own direction — `ORDER BY status ASC, starts_at DESC` groups by status and puts the newest first inside each group. You can sort by an expression, and unusually for SQL you can sort by a `SELECT` alias, because sorting happens after projection.

`NULL`s sort last in ascending order in Postgres and first in descending, which is a per-engine decision and worth being explicit about when it matters:

```sql
SELECT title, venue_id FROM events
ORDER BY venue_id ASC NULLS FIRST;
```

`LIMIT n` returns at most `n` rows and `OFFSET m` skips the first `m`, which together give you pagination:

```sql
SELECT title FROM events ORDER BY starts_at LIMIT 5 OFFSET 5;
```

The rule that goes with them: **`LIMIT` without `ORDER BY` is a bug.** "Any five rows" is what you asked for and what you will get, and the five can differ between runs. If you are paginating, order by something unique — a tie in the sort key can shuffle rows between pages, so `ORDER BY starts_at, event_id` is safer than `ORDER BY starts_at` alone.

## The order SQL actually runs in

You write a query in one order and the database evaluates it in another. Knowing the evaluation order explains most "why did that not work" moments:

```text
FROM      →  which table(s)
WHERE     →  which rows
SELECT    →  which columns, computed
ORDER BY  →  what sequence
LIMIT     →  how many
```

Three consequences follow directly. First, a `SELECT` alias cannot be used in `WHERE`, because `WHERE` ran before the alias existed:

```sql
SELECT title, ends_at - starts_at AS duration
FROM events
WHERE duration > interval '2 hours';   -- ERROR: column "duration" does not exist
```

Repeat the expression in `WHERE` instead, or wrap the query in another `SELECT`. Second, an alias *can* be used in `ORDER BY`, because that runs after projection. And third, `LIMIT` applies to the sorted result, not to the scan, so `ORDER BY starts_at LIMIT 1` genuinely gives you the earliest event and not the first one the engine happened to read.

## Shaping values on the way out

A retrieval is rarely raw column values. These are the functions you will reach for constantly.

**Text.** `upper()`, `lower()`, `length()`, `trim()` (strips whitespace from both ends), `substring(text FROM 1 FOR 20)`, `left()` and `right()`, `replace()`, and `split_part(email, '@', 2)` to pull the domain out of an address.

```sql
SELECT full_name,
       lower(email) AS email,
       split_part(email, '@', 2) AS domain
FROM attendees
ORDER BY full_name
LIMIT 3;
```

```text
  full_name   |          email           |   domain
--------------+--------------------------+-------------
 Alicia Gomez | alicia.gomez@example.com | example.com
 Ben Okafor   | ben.okafor@example.com   | example.com
 Chen Wei     | chen.wei@example.com     | example.com
(3 rows)
```

**`COALESCE`** returns its first non-null argument, which is how you put a readable placeholder in front of missing data:

```sql
SELECT full_name, COALESCE(phone, 'no phone on file') AS phone
FROM organizers;
```

```text
   full_name    |      phone
----------------+------------------
 Dana Whitfield | 313-555-0142
 Marcus Lee     | 313-555-0187
 Priya Raman    | no phone on file
(3 rows)
```

Its mirror image is `NULLIF(a, b)`, which returns `NULL` when the two arguments are equal — the usual use is `NULLIF(trim(notes), '')` to turn empty strings, which are a real value, into honest nulls.

Be careful about *where* you substitute. `COALESCE` in a `SELECT` is presentation and is fine. `COALESCE` in a `WHERE` — `WHERE COALESCE(venue_id, 0) = 0` — is you hiding a modeling question inside a filter, and the reader can no longer tell whether zero is a real venue.

**`CASE`** is SQL's conditional, and it is how you turn stored values into something a person reads:

```sql
SELECT title,
       CASE
         WHEN starts_at < now()          THEN 'past'
         WHEN starts_at < now() + interval '14 days' THEN 'soon'
         ELSE 'later'
       END AS timing
FROM events
WHERE status = 'published'
ORDER BY starts_at;
```

The branches are evaluated top to bottom and the first true one wins, so order them from most specific to least. Without an `ELSE`, unmatched rows get `NULL` — include one unless you genuinely mean "unknown."

**Casting** converts a type, written `value::type` in Postgres or `CAST(value AS type)` in standard SQL. `'2026-08-01'::date`, `capacity::text`, `'40'::integer`. Casting fails loudly on garbage, which is a feature.

**Formatting dates** for display is `to_char(starts_at, 'FMDay, FMMonth DD at HH12:MI AM')`. Format a timestamp for humans in the `SELECT` list and never in a `WHERE` clause — comparing formatted strings sorts `'August'` before `'July'`.

Put several of these together and you get something you would genuinely put on a page:

```sql
SELECT to_char(starts_at, 'Mon DD') AS day,
       title,
       upper(status) AS status,
       COALESCE(summary, 'No description yet.') AS summary
FROM events
WHERE starts_at >= current_date
  AND status <> 'draft'
ORDER BY starts_at
LIMIT 10;
```

One habit that makes all of this cheaper to learn: **Postgres lets you `SELECT` with no `FROM` at all.** `SELECT now();`, `SELECT 'a' || 'b';`, `SELECT '2026-08-31'::date + 1;`, `SELECT length(trim('  hi  '));` — each returns one row and answers a question about a function in two seconds, with no table and no risk. When you are unsure what a function does to a null or to an empty string, ask it directly rather than reasoning about it inside a query that is already not working.

## Building a query you cannot see yet

Most real requests do not arrive as a query. They arrive as a sentence: "can you get me the events coming up in the next two months that still have space, with the organizer's name?" Beginners try to write that in one go, get an error on line six, and start guessing. Work outward instead, one clause at a time, checking after each.

**Start with the table and a limit.** `SELECT * FROM events LIMIT 5;` tells you the real column names and what the values actually look like, which is almost never exactly what you assumed.

**Add one condition at a time, and watch the row count.** Add `WHERE status = 'published'` and confirm the count drops from ten to six. Add the date range and confirm it drops again. A condition that changes nothing is a condition that is not doing what you think, and a condition that empties the result is the one to inspect. This is the whole debugging technique, applied forward instead of backward.

**Project last.** Swap `*` for the real column list and add the expressions and aliases once the row set is right. Formatting rows you have not confirmed is wasted work.

**Then read it back against the sentence.** Every noun in the request should map to something in the query, and every clause in the query should map to something in the request. A clause you cannot justify from the request is usually left over from an earlier attempt.

Two sanity checks before you hand a result to anybody. Count the rows and ask whether that number is plausible — a query over ten events that returns four hundred rows is telling you something. And spot-check one row by hand: pick it, find the underlying record, and confirm every value. Both take under a minute and both have saved careers.

## Getting the rows somewhere useful

Results usually need to leave `psql`. Two destinations cover nearly everything.

**A file, for a person.** `\copy` runs a query and writes the result client-side, which means it works without database superuser rights:

```bash
psql events_board -c "\copy (SELECT title, starts_at, status FROM events ORDER BY starts_at) TO 'events.csv' WITH CSV HEADER"
```

`WITH CSV HEADER` writes a header row, which is what makes the file openable in a spreadsheet without renaming columns by hand. This is how most ad-hoc requests from non-engineers get answered, and lesson 06 uses the same command for something more interesting.

**An application, at runtime.** Your code will not paste strings together to build SQL — it will send the query and the values separately, using placeholders:

```javascript
const { rows } = await db.query(
  "SELECT title, starts_at FROM events WHERE status = $1 AND starts_at > $2 ORDER BY starts_at LIMIT $3",
  ["published", new Date(), 10],
);
```

`$1`, `$2`, `$3` are **parameter placeholders** — Postgres's numbering; other drivers use `?`. The database receives the query text and the values as separate things, so a value can never be read as SQL. The alternative, building the string yourself:

```javascript
// Never do this.
const sql = `SELECT * FROM events WHERE title = '${userInput}'`;
```

is **SQL injection**, and it is not a subtle bug. A visitor who types `x'; DROP TABLE events; --` into your search box has just written the second half of your query. Every language and every driver supports placeholders; there is no situation in which concatenating user input into SQL is the right call. Learn the habit now, while your queries are small enough that it costs nothing.

## Reading errors, and habits at the prompt

Postgres error messages are better than most, and they point at the character position. Four cover most of a first week.

```text
ERROR:  column "draft" does not exist
```
Double quotes where you meant single. You wrote `status = "draft"`.

```text
ERROR:  syntax error at or near "FROM"
```
Almost always a missing or extra comma in the `SELECT` list just before it. Look at the token *before* the one named.

```text
ERROR:  operator does not exist: text >= integer
```
A type mismatch — you compared a text column to a number. Either the value needs quoting or the column is the wrong type, and the second is a modeling bug worth fixing rather than casting around.

```text
ERROR:  invalid input syntax for type integer: "banana"
```
A cast failed. The value is not what the column claims values are.

A few `psql` habits pay for themselves immediately. `\x` switches to expanded display, one column per line, which turns an unreadably wide row into something you can actually read. `\timing` prints how long each statement took. Pressing the up arrow recalls previous statements, and `\e` opens the last one in your editor, which is the sane way to fix a twelve-line query. `\i queries.sql` runs a file — and as with the schema, **keep queries in a file.** A query you typed once is a query you will retype badly.

Finally, get comfortable being wrong about your own data. When a query returns nothing, do not stare at it. Delete the `WHERE` clause and confirm the rows exist at all, then add conditions back one at a time. The condition that empties the result is the condition that was wrong, and nine times in ten it is a null, a case-sensitive comparison, or a date boundary.

## Practice

All of these run against the `events_board` database from lesson 02. Put every query in a file called `queries.sql`, numbered with `--` comments, so you can re-run the whole set.

1. List every venue's name and capacity, largest first. Then list only venues in Detroit, and then only venues with a capacity between 50 and 150 inclusive.
2. List the title and start time of published events, soonest first. Add a second query that returns only the next three.
3. Find every event whose title mentions databases, using a case-insensitive search that would still work if somebody typed `DATABASES`.
4. Return every event that is *not* held at Fellowship Hall, including the online one. Write the naive version first, note how many rows it returns, then fix it and explain the difference in a comment.
5. Show each event's title alongside its length as an interval, aliased `duration`. Then return only the events longer than two hours — and write a comment explaining why you could not simply reuse the alias in `WHERE`.
6. Produce a listing for the events page: the start date formatted as `Aug 02`, the title, and the summary with `No description yet.` substituted when it is missing. Published and completed events only, soonest first.
7. Label every event `past`, `soon`, or `later` with a `CASE` expression relative to `now()`, and sort so the soonest comes first.
8. List attendees who joined before March 2026, with their email lowercased and the domain in its own column, sorted by join date.
9. Show every event's title and `venue_id`, sorted so the online event with no venue appears first, then the rest by venue.
10. Break something on purpose. Write one query that produces each of these errors, paste the exact message under it as a comment, and write one sentence on the fix: `column "..." does not exist` from a quoting mistake; `syntax error at or near ...`; `operator does not exist`.
11. Paginate. Return events 4 through 6 by start time using `LIMIT` and `OFFSET`, then explain in a comment why you added `event_id` as a second sort key.
12. Build one query the long way. The request is: "the published events happening in the next ninety days, with a formatted date, the title, and how long each one runs, soonest first." Write it in four steps as described above — table and limit, then one condition at a time, then projection — and record the row count after each step as a comment. Your file should show all four intermediate versions, not just the finished one.
13. Answer a request from a non-engineer. Export the title, start time, and status of every published event to `upcoming.csv` using `\copy` with a header row, then open it in a spreadsheet and confirm the columns line up.
14. Rewrite query 2 as it would appear in application code, using placeholders for the status and the limit. In a comment, write out what a visitor could do to your database if you had built that string by concatenation instead.

**Deliverable:** a `queries.sql` that runs top to bottom with `psql events_board -f queries.sql` and produces no errors except the three you caused deliberately in step 10, which should be commented out with their messages recorded.

## Check your understanding

1. What does `WHERE starts_at BETWEEN '2026-08-01' AND '2026-08-31'` miss, and what do you write instead?
2. A colleague's query `SELECT title FROM events WHERE venue_id <> 3;` returns eight rows and they expected nine. What happened?
3. Why does `SELECT title, ends_at - starts_at AS duration FROM events WHERE duration > interval '2 hours';` fail, while `ORDER BY duration` would have worked?
4. Why is `LIMIT 5` with no `ORDER BY` a bug even when it seems to return the right rows?

*Answers:* (1) Almost all of August 31, because the upper bound is midnight at its start; use `starts_at >= '2026-08-01' AND starts_at < '2026-09-01'`. (2) The online event has a `NULL` venue, and `NULL <> 3` is unknown, so it is dropped; add `OR venue_id IS NULL`. (3) `WHERE` runs before `SELECT` creates the alias; `ORDER BY` runs after. (4) Without an order, which five rows come back is undefined and can change between runs.
