---
course_id: db100
media_id: db100-v01
type: video-script
title: "The Phantom Signup: Why Your Report Says 1 Instead of 0"
format: screencast
target_runtime: "6 min"
related_lessons:
  - db100-04
objectives:
  - Combine and summarize data across tables with joins and aggregation
competency_ids:
  - D2-S1-C04
---

## Purpose

After watching, the learner can write a per-event signup report that includes events with zero signups and reports them as `0`, and can explain why `count(*)` on a left join reports `1`.

## Audience and prerequisites

Apprentices midway through lesson 04 who have loaded `events_board` and written an inner join. Assumes `GROUP BY` has been introduced.

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Cold open: a spreadsheet titled "Fall signups" with Fall Block Party = 1, highlighted. A chat bubble from Dana: "Who is the one person signed up for the block party? I don't see them." | "Dana is asking a fair question. The report says one person signed up for the Fall Block Party. Nobody did. In the next six minutes you'll find where that phantom person came from, and fix it with one change." |
| 0:20 | Terminal, `psql events_board`, large font. Type the inner-join query. | "Start with the report the way most people write it the first time." |
| 0:25 | Code: `SELECT e.title, count(r.attendee_id) AS signups FROM events AS e JOIN registrations AS r ON r.event_id = e.event_id GROUP BY e.event_id, e.title ORDER BY signups DESC;` Result: 8 rows. | "Eight rows. We have ten events. Two are missing: Fall Block Party and Winter Coat Drive. Nobody has registered for either, so the inner join found no match and dropped them. No warning, no error. That's what an inner join does: it filters as well as combines." |
| 1:05 | Change `JOIN` to `LEFT JOIN` and `count(r.attendee_id)` to `count(*)`. Run. Fall Block Party shows 1. | "So you switch to a left join to keep every event. And because you're counting signups, `count(*)` feels natural. Run it. Ten rows, good. But look: Fall Block Party, one. Winter Coat Drive, one. There's our phantom." |
| 1:35 | Remove `GROUP BY` and the count; select `e.title, r.attendee_id, r.registered_at` with `WHERE e.title = 'Fall Block Party'`. One row, attendee_id and registered_at empty. A caption labels the empty cells "NULL". | "When a total looks wrong, take the aggregate away and look at the rows. Here's the Fall Block Party on its own. One row. The event's columns are filled in; every registration column is NULL. A left join has to show the event somehow, so it creates one row and fills the missing side with NULLs." |
| 2:15 | Split screen: left `count(*)` with "counts rows → 1", right `count(r.attendee_id)` with "counts non-NULL values → 0". | "`count(*)` counts rows. There is one row, so you get one. `count` of a column counts the rows where that column is not NULL. The attendee ID here is NULL, so you get zero. Same row, different question." |
| 2:45 | Back to the full query with `LEFT JOIN` and `count(r.attendee_id)`. Run. Fall Block Party 0, Winter Coat Drive 0. | "Put the column back inside count, keep the left join, and run it. Fall Block Party, zero. Winter Coat Drive, zero. Every other number is unchanged." |
| 3:15 | Highlight `count(r.attendee_id)`; why the key column: overlay "attendee_id is part of the primary key → never NULL in a real row". | "Which column should you count? Use one that can never be NULL in a real registration. attendee_id is part of the registrations primary key, so a NULL there can only mean no match. Counting checked_in would work today too, but it's an ordinary column. If it ever allows NULL, your count breaks quietly." |
| 3:50 | Recap card with two rules. | "Two rules. One: if a row might have no match and you still want to see it, use a left join. Two: on the optional side of a left join, count a key column, never star." |
| 4:15 | Quick drill in terminal: per-venue event count. Type `SELECT v.name, count(e.event_id) AS events FROM venues AS v LEFT JOIN events AS e ON e.venue_id = v.venue_id GROUP BY v.venue_id, v.name ORDER BY events;` Riverside Library 0. | "Same pattern, new question: events per venue. Pause and predict what Riverside Library shows. Left join venues to events, count e.event_id. Riverside Library, zero. If you'd used star, it would say one." |
| 5:00 | Closing: the spreadsheet updated with 0; a reply to Dana: "Fixed. It was a counting bug, not a person." | "Before you send any count to anyone, look for the rows that could have no match and ask what your count does with them. Thirty seconds of checking is cheaper than answering Dana's question." |
| 5:30 | End card: "Try it: practice item 6 in lesson 04." | "Lesson 04's practice item 6 asks you to make this mistake on purpose and then fix it. Go do that now while it's fresh." |

## On-screen assets and B-roll

- `events_board` loaded from lesson 02's `schema.sql` and `seed.sql`; terminal at 18pt or larger, light theme.
- Mock spreadsheet "Fall signups" (static image) and a mock chat message from Dana Whitfield.
- Overlay labels for `NULL` cells (text label plus a dotted outline, not color alone).

## Accessibility

- Burned-in captions plus a separate WebVTT file; every query is read aloud in full the first time it appears.
- NULL cells are marked with the text "NULL" and a dotted outline, never by color alone.
- Narration describes each result before commenting on it ("ten rows; Fall Block Party shows one").
- Provide the full query text in the video description so screen-reader users can copy it.

## Check for understanding

1. Why does the inner-join version of the report show eight rows instead of ten? *Answer: two events have no registrations, so the inner join finds no match and drops them.*
2. A left join from `venues` to `events` uses `count(*)`. What does Riverside Library show, and why? *Answer: 1, because the left join adds one row of NULLs for the unmatched venue and `count(*)` counts that row.*
3. Why count `r.attendee_id` rather than `r.checked_in`? *Answer: `attendee_id` is part of the primary key and can't be NULL in a real row, so a NULL there can only mean no match.*
