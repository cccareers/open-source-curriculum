---
course_id: db100
media_id: db100-v02
type: video-script
title: "SELECT First, Then UPDATE: The Transaction Safety Net"
format: screencast
target_runtime: "5 min"
related_lessons:
  - db100-05
objectives:
  - Apply constraints and normalization to keep data correct through change
competency_ids:
  - D5-S1-C03
---

## Purpose

After watching, the learner can change live data with a rehearsed `SELECT` → `BEGIN` → `UPDATE` → check → `COMMIT`/`ROLLBACK` sequence, and can recover from a mistaken update before it is committed.

## Audience and prerequisites

Apprentices in lesson 05 with `events_board` loaded. Assumes they can write `WHERE` clauses (lesson 03).

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Black screen, then text: `UPDATE events SET status = 'completed';` followed by `UPDATE 10`. | "This statement just marked every event on the board as completed, including the two drafts for this fall. There's no undo button. Unless you used the habit this video is about." |
| 0:15 | Terminal, `psql events_board`. Task card: "Marcus: mark every published event that has already happened as completed." | "Here's the request from Marcus: every published event that has already happened should be marked completed. Start with a SELECT, not an UPDATE." |
| 0:30 | Type and run: `SELECT event_id, title, status, starts_at FROM events WHERE starts_at < now() AND status = 'published';` | "Write the WHERE clause you plan to use, as a SELECT. Read the rows. Are these the events Marcus meant? Count them. Remember that number." |
| 1:00 | Highlight the row count in the result footer. | "This count depends on today's date, so yours may differ from mine. Whatever it is, write it down." |
| 1:15 | Type `BEGIN;` Prompt changes to `events_board=*#`; zoom on the asterisk. | "Now open a transaction. Notice the prompt: psql adds an asterisk when you're inside a transaction. Until you commit, nobody else can see your changes, and you can still undo them." |
| 1:35 | Type the UPDATE with the identical WHERE: `UPDATE events SET status = 'completed' WHERE starts_at < now() AND status = 'published';` Output `UPDATE n`. | "Same WHERE clause, copied from the SELECT. Postgres replies UPDATE and a number. Compare it with the SELECT count. They should match. If they don't, something is wrong, and you haven't committed yet." |
| 2:05 | Run `SELECT status, count(*) FROM events GROUP BY status;` | "Check the outcome while you're still inside the transaction. Drafts untouched, completed count increased by n. That's what Marcus asked for." |
| 2:25 | Type `COMMIT;` Prompt loses the asterisk. | "Commit. Now it's permanent and everyone can see it." |
| 2:40 | Replay the cold open inside a transaction: `BEGIN; UPDATE events SET status = 'completed';` shows `UPDATE 10`. | "Now let's make the cold-open mistake on purpose, inside a transaction. No WHERE clause. UPDATE 10. Ten is not the number we expected, and that's the warning." |
| 3:05 | Type `ROLLBACK;` then `SELECT status, count(*) FROM events GROUP BY status;` shows the drafts restored. | "Rollback. Check again: the drafts are drafts. That mistake just cost you five seconds instead of an incident report." |
| 3:30 | Code card: a migration file wrapped in `BEGIN; ... COMMIT;` with a CHECK constraint that fails; output shows `ERROR` and `ROLLBACK`. | "Migration files use the same safety net. Postgres lets schema changes run inside a transaction, so if any statement in the file fails, none of the file applies. Wrap every migration in BEGIN and COMMIT." |
| 4:05 | Recap: four-step checklist on screen. | "The loop: SELECT with your WHERE clause and note the count. BEGIN. Run the change and compare the count it reports. Inspect, then COMMIT or ROLLBACK. Do it every time, especially when you're sure." |
| 4:40 | End card pointing to lesson 05 practice item 3. | "Lesson 05's practice has you break a constraint inside a transaction and roll it back. Try it next." |

## On-screen assets and B-roll

- Fresh `events_board`; note in the editor's notes that `UPDATE n` will vary with the recording date. Record on a date after September 12, 2026 so all six published events are in the past, or narrate the actual number.
- Zoom callouts on the psql prompt asterisk (`=*#`).

## Accessibility

- Captions; every typed statement is read aloud.
- The transaction-state change is described in narration ("the prompt now shows an asterisk"), not only shown.
- Row counts are spoken, not only highlighted.

## Check for understanding

1. Your SELECT returned 4 rows; your UPDATE inside a transaction reports `UPDATE 7`. What do you do? *Answer: ROLLBACK, then compare the two WHERE clauses. They aren't the same, or the data changed between the SELECT and the UPDATE.*
2. How can you tell in `psql` that you're inside an open transaction? *Answer: the prompt shows an asterisk, `=*#`.*
3. Why wrap a migration file in `BEGIN`/`COMMIT`? *Answer: so that if any statement fails, the whole file is undone and the schema is never left half-changed.*
