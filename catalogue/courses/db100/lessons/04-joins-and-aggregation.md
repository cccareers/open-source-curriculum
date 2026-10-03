---
lesson_id: db100-04
course_id: db100
pathway: software-developer
title: Joins and Aggregation
order: 4
kind: lesson
competency_ids:
  - D2-S1-C04
objectives:
  - Combine and summarize data across tables with joins and aggregation
---

## Putting the pieces back together

Lesson 02 broke the events board into seven tables so that each fact is stored once. That was the right call, and it means no single table can answer a real question. "What is on next month, where, and who is coming?" touches `events`, `venues`, `attendees`, and `registrations`. Reassembling them is what a **join** does.

The other half of this lesson is the opposite motion. A join gives you more rows; **aggregation** collapses many rows into one summary — a count, a total, an average. Almost every report anyone asks you for is a join followed by an aggregation, and almost every wrong report is one of the two mistakes at the end of this lesson.

## Inner joins

A join matches rows in one table against rows in another using a condition, and returns the matched pairs as single wide rows.

```sql
SELECT e.title, v.name AS venue, v.city
FROM events AS e
JOIN venues AS v ON v.venue_id = e.venue_id
WHERE e.status = 'published'
ORDER BY e.starts_at;
```

```text
        title         |      venue      |   city
----------------------+-----------------+-----------
 Neighborhood Cleanup | Rosa Parks Park | Detroit
 Intro to Soldering   | Maker Space     | Detroit
 Community Potluck    | Fellowship Hall | Hamtramck
 Resume Workshop      | Fellowship Hall | Hamtramck
 Bike Repair Clinic   | Rosa Parks Park | Detroit
(5 rows)
```

Three parts to read. `JOIN venues` names the second table. `ON v.venue_id = e.venue_id` is the **join condition** — the foreign key you declared in lesson 02, now doing its second job. And `AS e` / `AS v` are **table aliases**, short names for the rest of the query.

Get in the habit of aliasing every table and **qualifying every column** with its alias, even when only one table has that name. Two tables here have a `name` column and several have an `event_id`; an unqualified `name` gives you `ERROR: column reference "name" is ambiguous`, and an unqualified column that happens to be unique today becomes ambiguous the day someone adds a column to the other table.

`JOIN` on its own means `INNER JOIN`; the word `INNER` is optional and usually omitted. Its defining behavior is that **an unmatched row disappears.** Six events are published, but only five appear above — the Online Budgeting Q&A has a `NULL` venue, so nothing in `venues` matches, so it is gone. It vanished silently, with no warning and no error. That is the single most important fact about inner joins: they are a filter as well as a combination.

Chain more tables by adding more `JOIN` clauses, each with its own `ON`:

```sql
SELECT e.title, v.name AS venue, o.full_name AS organizer
FROM events AS e
JOIN venues AS v     ON v.venue_id = e.venue_id
JOIN organizers AS o ON o.organizer_id = e.organizer_id
ORDER BY e.starts_at
LIMIT 3;
```

```text
        title         |      venue      |   organizer
----------------------+-----------------+----------------
 Spring Seed Swap     | Rosa Parks Park | Dana Whitfield
 Intro to Databases   | Maker Space     | Marcus Lee
 Neighborhood Cleanup | Rosa Parks Park | Dana Whitfield
(3 rows)
```

There is no practical limit on how many tables you chain, and the order you write them in does not change the result — the planner decides the physical order. What does change the result is the join *type*, and whether a condition sits in `ON` or in `WHERE`.

One join type to know about and avoid by accident: writing `FROM events, venues` with no condition gives a **cross join**, every event paired with every venue — ten events times four venues is forty meaningless rows. If you ever see a result far larger than any of its inputs, you left a join condition out.

## Outer joins, and the rows that are not there

Some of the most useful questions are about absence. Which venues have hosted nothing? Which residents signed up and never came back? An inner join cannot answer them, because it deletes exactly the rows you are asking about.

A **left join** keeps every row from the left table, and fills the right table's columns with `NULL` where nothing matched:

```sql
SELECT v.name, e.title
FROM venues AS v
LEFT JOIN events AS e ON e.venue_id = v.venue_id
ORDER BY v.name, e.starts_at;
```

```text
       name        |        title
-------------------+----------------------
 Fellowship Hall   | Community Potluck
 Fellowship Hall   | Resume Workshop
 Fellowship Hall   | Winter Coat Drive
 Maker Space       | Intro to Databases
 Maker Space       | Intro to Soldering
 Riverside Library |
 Rosa Parks Park   | Spring Seed Swap
 ...
```

Riverside Library appears with an empty title. Combine that with `IS NULL` and you have the "find the orphans" pattern, which is worth memorizing outright:

```sql
SELECT v.name
FROM venues AS v
LEFT JOIN events AS e ON e.venue_id = v.venue_id
WHERE e.event_id IS NULL;
```

```text
       name
-------------------
 Riverside Library
(1 row)
```

Test the *right* table's key column for `NULL`, not one of its ordinary columns — the key is guaranteed non-null in a real matched row, so it is an unambiguous signal that no match existed.

`RIGHT JOIN` is the mirror image and is rare, because you can always swap the table order and use `LEFT`. `FULL JOIN` keeps unmatched rows from both sides; you will meet it when reconciling two systems and rarely otherwise. Write left joins, keep the "important" table on the left, and read down the query.

Now the trap. On an outer join, a condition in `ON` and the same condition in `WHERE` do different things:

```sql
-- Every venue, plus its published events. Venues with none still appear.
SELECT v.name, e.title
FROM venues AS v
LEFT JOIN events AS e
  ON e.venue_id = v.venue_id AND e.status = 'published';

-- Silently an inner join: venues with no published event are filtered out.
SELECT v.name, e.title
FROM venues AS v
LEFT JOIN events AS e ON e.venue_id = v.venue_id
WHERE e.status = 'published';
```

The `ON` clause decides **what counts as a match**, and it runs while the join is being formed. The `WHERE` clause runs afterwards, on the joined result — and a manufactured `NULL` row from an unmatched venue fails `e.status = 'published'`, because `NULL = 'published'` is unknown. Your left join is now an inner join and Riverside Library is gone again. The rule: **on an outer join, conditions about the optional table belong in `ON`; conditions about the required table belong in `WHERE`.**

## Joining through a junction table

Many-to-many relationships need two joins, one on each side of the junction table. Categories per event:

```sql
SELECT e.title, c.name AS category
FROM events AS e
JOIN event_categories AS ec ON ec.event_id = e.event_id
JOIN categories AS c        ON c.category_id = ec.category_id
WHERE e.title = 'Community Potluck';
```

```text
       title       | category
-------------------+----------
 Community Potluck | Food
 Community Potluck | Family
(2 rows)
```

Notice that the event appears twice. That is not a bug and it is the thing to internalize about junction joins: **a join through a many-to-many multiplies rows.** One event with two categories becomes two rows. If you then join registrations to the same query, each registration also appears twice. Hold that thought — it is the second mistake at the end of the lesson.

The same shape answers the reverse question. Everyone signed up for a given event:

```sql
SELECT a.full_name, a.email, r.checked_in
FROM registrations AS r
JOIN attendees AS a ON a.attendee_id = r.attendee_id
JOIN events AS e    ON e.event_id = r.event_id
WHERE e.title = 'Intro to Databases'
ORDER BY a.full_name;
```

A table can also be joined to itself, with two aliases, when you are comparing rows within one table — for example, finding events that share a venue and a date. `FROM events AS a JOIN events AS b ON b.venue_id = a.venue_id AND b.event_id <> a.event_id` is a **self join**, and the `<>` on the key is what stops every row matching itself.

## Aggregate functions

An aggregate reads many rows and returns one value.

```sql
SELECT count(*)          AS venue_count,
       min(capacity)     AS smallest,
       max(capacity)     AS largest,
       round(avg(capacity)) AS avg_capacity,
       sum(capacity)     AS total_seats
FROM venues;
```

```text
 venue_count | smallest | largest | avg_capacity | total_seats
-------------+----------+---------+--------------+-------------
           4 |       40 |     400 |          155 |         620
(1 row)
```

The five you will use are `count`, `sum`, `avg`, `min`, and `max`. Three details about them matter more than the list.

**`count(*)` and `count(column)` are different functions.** `count(*)` counts rows. `count(column)` counts rows where that column is not null. On the events table, `count(*)` is 10 and `count(venue_id)` is 9, and the gap is the online event. Use `count(*)` when you mean "how many rows" and `count(column)` when you mean "how many have this fact recorded" — and be sure which one you meant.

**Every aggregate except `count(*)` ignores nulls.** If one of those four venues had no recorded capacity, `avg(capacity)` would divide by three, not four. That is usually right — averaging in an unknown as zero would be worse — but it means `sum(x) / count(*)` and `avg(x)` can differ, and when a stakeholder disputes your average this is why.

**`count(DISTINCT column)`** counts unique values. `count(DISTINCT venue_id)` over the events table is 3, because three venues have events and the null does not count.

## GROUP BY

Aggregating the whole table gives you one row. `GROUP BY` splits the rows into buckets first and aggregates each bucket:

```sql
SELECT status, count(*) AS events
FROM events
GROUP BY status
ORDER BY events DESC;
```

```text
  status   | events
-----------+--------
 published |      6
 draft     |      2
 completed |      2
(3 rows)
```

The rule that governs `GROUP BY` and that the engine will enforce: **every column in your `SELECT` list must either appear in `GROUP BY` or be inside an aggregate.** Anything else is ambiguous — if you group by status, there are six different titles in the published bucket and no basis for choosing one. Postgres tells you exactly that:

```text
ERROR:  column "events.title" must appear in the GROUP BY clause
        or be used in an aggregate function
```

Grouping across a join works the same way. Registrations per event, biggest first:

```sql
SELECT e.title, count(r.attendee_id) AS signups
FROM events AS e
JOIN registrations AS r ON r.event_id = e.event_id
GROUP BY e.event_id, e.title
ORDER BY signups DESC;
```

```text
        title         | signups
----------------------+---------
 Community Potluck    |       6
 Neighborhood Cleanup |       5
 Intro to Databases   |       5
 Spring Seed Swap     |       4
 Intro to Soldering   |       3
 Online Budgeting Q&A |       3
 Resume Workshop      |       2
 Bike Repair Clinic   |       2
(8 rows)
```

Group by `e.event_id, e.title` rather than the title alone. The id is the identity of the bucket; the title comes along for display. Group by title only and two events that happen to share a name silently merge into one row.

Eight rows, not ten. Fall Block Party and Winter Coat Drive have no registrations, and the inner join dropped them — the same disappearance as before, now hiding in a report. The fix is a left join, and it comes with its own subtlety:

```sql
SELECT e.title, count(r.attendee_id) AS signups
FROM events AS e
LEFT JOIN registrations AS r ON r.event_id = e.event_id
GROUP BY e.event_id, e.title
ORDER BY signups, e.title;
```

```text
        title         | signups
----------------------+---------
 Fall Block Party     |       0
 Winter Coat Drive    |       0
 Bike Repair Clinic   |       2
 ...
```

**Use `count(r.attendee_id)`, never `count(*)`, on the nullable side of a left join.** An event with no registrations still produces one manufactured row with all of `r`'s columns null, so `count(*)` counts that phantom row and reports `1`. `count(r.attendee_id)` sees a null and correctly reports `0`. This one-character difference between a report that says "zero people signed up" and one that says "one person signed up" is a genuine production bug, and it is common.

## HAVING, and the order things run in

`WHERE` filters rows before grouping. `HAVING` filters groups after:

```sql
SELECT e.title, count(r.attendee_id) AS signups
FROM events AS e
JOIN registrations AS r ON r.event_id = e.event_id
WHERE e.status <> 'draft'
GROUP BY e.event_id, e.title
HAVING count(r.attendee_id) >= 5
ORDER BY signups DESC;
```

```text
        title         | signups
----------------------+---------
 Community Potluck    |       6
 Neighborhood Cleanup |       5
 Intro to Databases   |       5
(3 rows)
```

`WHERE e.status <> 'draft'` throws away draft events before any counting. `HAVING count(...) >= 5` throws away buckets whose total is too small. You cannot swap them: an aggregate in `WHERE` is an error, because nothing has been aggregated yet, and a plain row condition in `HAVING` works but is slower and misleading. **Row conditions go in `WHERE`; aggregate conditions go in `HAVING`.**

The full evaluation order, extending lesson 03:

```text
FROM / JOIN  →  build the combined rows
WHERE        →  filter rows
GROUP BY     →  bucket them
HAVING       →  filter buckets
SELECT       →  compute the output columns
ORDER BY     →  sort
LIMIT        →  truncate
```

That order explains why `HAVING` cannot use a `SELECT` alias but `ORDER BY` can, and why the alias `signups` is legal in the `ORDER BY` above. Postgres enforces this: `HAVING signups >= 5` fails with `ERROR: column "signups" does not exist`. Some engines, MySQL among them, accept the alias anyway, which is how code that worked elsewhere breaks when it moves to Postgres. Repeat the expression in `HAVING`.

## Subqueries: asking about another table without joining it

Sometimes you do not want columns from the second table — you only want to know whether a matching row exists. Joining for that works and brings a problem with it: a join through a one-to-many relationship duplicates rows, so "events that have at least one registration" written as a join returns each event once per registration, and you have to add `DISTINCT` to undo the damage.

`EXISTS` asks the question directly:

```sql
SELECT e.title
FROM events AS e
WHERE EXISTS (
  SELECT 1 FROM registrations AS r WHERE r.event_id = e.event_id
)
ORDER BY e.starts_at;
```

The inner query is **correlated** — it references `e.event_id` from the outer query, so it is evaluated per candidate row — and `EXISTS` is true as soon as one row comes back. What the subquery selects is irrelevant, which is why `SELECT 1` is the convention. No duplication is possible, because the subquery contributes no rows to the result.

`NOT EXISTS` is the cleanest way to ask about absence, and it is worth comparing to the left-join pattern from earlier:

```sql
SELECT e.title
FROM events AS e
WHERE NOT EXISTS (
  SELECT 1 FROM registrations AS r WHERE r.event_id = e.event_id
);
```

```text
       title
-------------------
 Fall Block Party
 Winter Coat Drive
(2 rows)
```

Both spellings are correct; use whichever reads more like the question you were asked. `NOT EXISTS` also behaves sanely with nulls, unlike `NOT IN`, which returns nothing at all if its list contains one — the same trap as lesson 03, now with the list coming from a query where you cannot see it.

An uncorrelated subquery is simply a list:

```sql
SELECT a.full_name
FROM attendees AS a
WHERE a.attendee_id IN (
  SELECT r.attendee_id
  FROM registrations AS r
  JOIN event_categories AS ec ON ec.event_id = r.event_id
  WHERE ec.category_id = 2
);
```

That returns the seven residents who have signed up for a technology event, each once, with no `DISTINCT` needed on the outer query.

A subquery can also sit in the `SELECT` list, where it must return exactly one row and one column:

```sql
SELECT e.title,
       (SELECT count(*) FROM registrations AS r WHERE r.event_id = e.event_id) AS signups
FROM events AS e
ORDER BY signups DESC;
```

That is a legitimate alternative to grouping when you want one counted column and no `GROUP BY` clutter. It gets expensive when you add a third and a fourth of them, so prefer a grouped join once you are counting more than one thing.

## The two ways a summary goes wrong

Almost every incorrect report you will write, or be asked to debug, is one of these.

**The silent inner join.** An inner join anywhere in the chain removes rows that did not match, and a summary shows no sign that anything was removed. A monthly attendance report that inner-joins `venues` quietly excludes online events forever. Before you send a number to anyone, run the query once with `count(*)` on the base table alone and confirm the join did not lose rows you cared about.

**Fan-out.** Joining a second one-to-many table multiplies rows, and the multiplication lands inside your aggregate. Count registrations per venue while also joining categories, and watch:

```sql
SELECT v.name, count(*) AS signups
FROM venues AS v
JOIN events AS e            ON e.venue_id = v.venue_id
JOIN registrations AS r     ON r.event_id = e.event_id
JOIN event_categories AS ec ON ec.event_id = e.event_id
GROUP BY v.venue_id, v.name
ORDER BY signups DESC;
```

```text
      name       | signups
-----------------+---------
 Rosa Parks Park |      22
 Fellowship Hall |      14
 Maker Space     |       8
(3 rows)
```

Rosa Parks Park has eleven registrations, not twenty-two. Each one was counted once per category on its event, and every Rosa Parks event with signups (the Cleanup, the Bike Repair Clinic, and the Seed Swap) carries two categories, so every registration there was counted twice. Fellowship Hall is inflated less — 14 instead of 8 — because only the Potluck has two categories. Maker Space is correct by luck: its events each have one category. Nothing errored; the numbers are simply wrong by different amounts, which is what makes fan-out hard to spot.

Three defenses, in order of preference. **Do not join what you are not using** — the categories join contributes nothing to that query. When you do need both, **count what is actually unique**: `count(DISTINCT (r.event_id, r.attendee_id))` counts registration identities rather than rows and gives 11. Or **aggregate before joining**, computing the per-event count in a subquery and joining the already-summarized result:

```sql
SELECT v.name, COALESCE(sum(s.signups), 0) AS signups
FROM venues AS v
LEFT JOIN events AS e ON e.venue_id = v.venue_id
LEFT JOIN (
  SELECT event_id, count(*) AS signups
  FROM registrations
  GROUP BY event_id
) AS s ON s.event_id = e.event_id
GROUP BY v.venue_id, v.name
ORDER BY signups DESC;
```

The subquery in the `FROM` clause is just another table as far as the outer query is concerned — it has a name, columns, and one row per event, so no multiplication can happen. `COALESCE(sum(...), 0)` handles Riverside Library, where `sum` over zero rows is `NULL` rather than `0`.

The habit that catches both problems is the same one: **when a total looks wrong, delete the aggregate and look at the rows.** Replace `count(*)` with `*`, drop the `GROUP BY`, add a `WHERE` narrowing to one venue, and count what comes back by eye. The duplicated rows are visible immediately, and no amount of staring at the aggregated output would have shown them.

## Practice

Against `events_board`. Keep everything in `reports.sql`, numbered with `--` comments.

1. List every published event with its venue name and city, soonest first. Then explain in a comment why your result has one fewer row than `SELECT count(*) FROM events WHERE status = 'published';` reports.
2. Fix that query so the online event appears, with a readable placeholder in the venue column.
3. List every event with its title, venue name, and organizer's full name and email, for events starting after today.
4. Find every venue that has never hosted an event, and every attendee who has never registered for one. Use the left-join-plus-`IS NULL` pattern for both.
5. Show every event with the categories it is tagged with, one row per pairing, ordered by title. Then write a comment stating how many rows you expected before running it and why.
6. Produce the attendance report: every event, including those with none, and the number of people registered, highest first. Deliberately write it with `count(*)` first, record the wrong numbers for the two draft events in a comment, then fix it and explain the fix.
7. Count events per status, and separately count events per venue including the venue with zero.
8. For each category, report how many events carry it and how many total registrations those events attracted, ordered by registrations. Check one category by hand against the seed data and note the check in a comment.
9. Report the average and maximum registrations per event across published events only, rounded to one decimal place.
10. List only the venues whose events have attracted at least ten registrations in total, using `HAVING`. Then write one sentence in a comment on why that condition could not have gone in `WHERE`.
11. Reproduce the fan-out. Run the venue/registration/category query above, record the inflated numbers, then produce the correct numbers two different ways — once with `count(DISTINCT ...)` and once by aggregating in a subquery — and confirm both agree.
12. For each organizer, report how many events they run and how many distinct attendees have registered across all of them. Explain in a comment why `count(DISTINCT a.attendee_id)` and `count(a.attendee_id)` give different answers here and which one the staff meant.

13. Answer "which events have nobody signed up yet?" twice — once with the left-join-plus-`IS NULL` pattern and once with `NOT EXISTS` — and confirm both return the same two rows. In a comment, say which one you would put in a pull request and why.
14. List every attendee who has registered for an outdoors event, each name once, using a subquery rather than a join on the outer query. Then write the join version and explain in a comment what `DISTINCT` is doing there and why the subquery version does not need it.

**Deliverable:** a `reports.sql` that runs end to end, and inside it, three comments that each name a specific way one of these queries could have returned a plausible but wrong number.

## Check your understanding

1. Six events are published, but your inner join to `venues` returns five rows. Which event is missing and why?
2. You move `e.status = 'published'` from the `ON` clause of a `LEFT JOIN events` into the `WHERE` clause. What happens to Riverside Library?
3. An attendance report shows `1` signup for the Fall Block Party, which has none. What one change fixes it?
4. A per-venue total doubled after someone added a join to `event_categories`. Name two ways to get the correct number without removing that join.

*Answers:* (1) The Online Budgeting Q&A — its `venue_id` is `NULL`, so nothing matches and an inner join drops it. (2) It disappears: its manufactured `NULL` row fails the `WHERE` test, turning the left join into an inner join. (3) Count a column from the optional table, `count(r.attendee_id)`, instead of `count(*)`. (4) Count unique registration identities with `count(DISTINCT (r.event_id, r.attendee_id))`, or aggregate registrations per event in a subquery before joining.
