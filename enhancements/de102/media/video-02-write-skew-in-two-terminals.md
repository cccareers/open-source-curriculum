---
course_id: de102
media_id: de102-v02
type: video-script
title: "Write Skew in Two Terminals: When Repeatable Read Is Not Enough"
format: screencast
target_runtime: "7 min"
related_lessons:
  - de102-04
objectives:
  - Explain how an isolation level changes what a concurrent transaction can observe
competency_ids:
  - D3-S1-C01
  - D3-S1-C02
---

## Purpose

After watching, the learner can reproduce a non-repeatable read and a write-skew anomaly with two PostgreSQL sessions, explain why `REPEATABLE READ` permits write skew, and show `SERIALIZABLE` aborting one transaction with SQLSTATE 40001.

## Audience and prerequisites

de102 learners who have read lesson 4 and can open two `psql` sessions to the same database.

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Split screen: two terminals labelled A (left) and B (right). A step counter in the corner. | "Two sessions, one database. Isolation bugs only appear when two transactions interleave, so we'll step through them one line at a time. Watch the step counter." |
| 0:15 | Both: `CREATE TABLE on_call (doctor text PRIMARY KEY, on_call boolean); INSERT INTO on_call VALUES ('alice', true), ('bob', true);` (run once in A). | "The on-call table from lesson 4. Two doctors, both on call. The rule: at least one must stay on call." |
| 0:35 | Step 1, A: `BEGIN ISOLATION LEVEL READ COMMITTED; SELECT on_call FROM on_call WHERE doctor='alice';` → `t`. | "First, the simplest anomaly. A reads Alice: on call." |
| 0:50 | Step 2, B: `UPDATE on_call SET on_call=false WHERE doctor='alice';` (autocommit). | "B changes Alice and commits." |
| 1:00 | Step 3, A: same SELECT → `f`. `COMMIT;` | "A reads again in the same transaction and gets a different answer. A non-repeatable read. Read committed takes a new snapshot for every statement." |
| 1:20 | Reset data. Step 1, A: `BEGIN ISOLATION LEVEL REPEATABLE READ;` SELECT → `t`. Step 2, B updates. Step 3, A SELECT → still `t`. | "Repeat at repeatable read. A keeps its first snapshot for the whole transaction, so it still sees Alice on call. That anomaly is gone." |
| 1:50 | Card: "Repeatable read: one snapshot per transaction." | "So repeatable read is safe? Not for every rule. Here's the one it misses." |
| 2:05 | Reset. Step 1, A: `BEGIN ISOLATION LEVEL REPEATABLE READ; SELECT count(*) FROM on_call WHERE on_call;` → 2. | "Alice wants to go home. Her transaction checks: are at least two doctors on call? Two. Fine to leave." |
| 2:25 | Step 2, B: `BEGIN ISOLATION LEVEL REPEATABLE READ; SELECT count(*) FROM on_call WHERE on_call;` → 2. | "At the same moment Bob checks. Also two. Also fine to leave." |
| 2:40 | Step 3, A: `UPDATE on_call SET on_call=false WHERE doctor='alice';` Step 4, B: `UPDATE on_call SET on_call=false WHERE doctor='bob';` | "Alice signs herself off. Bob signs himself off. Different rows, so neither waits on the other's lock." |
| 3:00 | Step 5, A: `COMMIT;` Step 6, B: `COMMIT;` Both succeed. Then `SELECT * FROM on_call;` → both `f`. | "Both commit. Nobody is on call. Each transaction was correct on its own snapshot. Together, they broke the rule." |
| 3:25 | Diagram: two snapshots both showing count=2; arrows writing to different rows; final state count=0. Label "write skew". | "That's write skew. Each transaction read a set, checked a condition, and wrote a different row. Row locks can't help, because the rule spans rows nobody locked." |
| 3:55 | Reset. Same steps at `SERIALIZABLE`. Step 5, A commits. Step 6, B: `ERROR: could not serialize access due to read/write dependencies among transactions` and `SQLSTATE 40001` (shown with `\set VERBOSITY verbose`). | "Now serializable. Same steps. Alice commits. Bob's commit fails with a serialization error, SQLSTATE 40001. PostgreSQL detected that no serial order of these two transactions could produce this outcome." |
| 4:30 | Card: "Serializable in PostgreSQL detects and aborts; it does not block." | "Notice nothing waited. Serializable snapshot isolation tracks what each transaction read and wrote, and aborts one when they'd form a cycle. Which means your code must retry." |
| 4:50 | Editor: Python retry loop with psycopg: catch `SerializationFailure`, rollback, sleep with jitter, re-run the whole transaction, max 3 attempts. | "Retry the whole transaction, never the single failed statement: the snapshot is gone. Bounded attempts, a little random backoff." |
| 5:25 | Re-run Bob's transaction via the script: it re-reads count = 1, refuses to sign off, prints "cannot leave: only one on call". | "On retry, Bob's transaction sees the world after Alice left: one doctor on call. The check now fails, so Bob stays. The rule holds." |
| 5:50 | Alternative card: `SELECT ... FOR UPDATE` on both rows, or a constraint/trigger. | "Other fixes exist: lock the rows you read with FOR UPDATE, or move the rule into the database. But serializable plus retry is the general answer when the rule is a query." |
| 6:15 | Summary table: level vs anomalies seen in this video. | "Read committed: non-repeatable reads. Repeatable read: fixes that, still allows write skew. Serializable: prevents write skew by aborting, so you retry." |
| 6:40 | End card: lesson 4 practice items 5 and 6. | "Now run practice items five and six yourself, using this exact step order." |

## On-screen assets and B-roll

- Step-ordered script for both sessions (provided as a text file so learners can follow along exactly).
- psycopg retry snippet.
- Snapshot diagram for write skew.

## Accessibility

- Captions; the step counter and terminal labels A/B are text, not color.
- Every query result is read aloud; terminal font 18 pt.
- Error messages shown in full and read aloud.

## Check for understanding

1. Why doesn't `REPEATABLE READ` prevent the on-call write skew? *Answer: each transaction reads a consistent snapshot and writes a different row, so there is no write-write conflict to detect; the violated rule spans both rows.*
2. What must application code do when it receives SQLSTATE 40001? *Answer: roll back and re-run the entire transaction (with bounded retries and backoff), not just the failing statement.*
3. Name one alternative to `SERIALIZABLE` for this specific rule. *Answer: lock both rows with `SELECT ... FOR UPDATE` before checking, or enforce the rule with a database constraint or trigger.*
