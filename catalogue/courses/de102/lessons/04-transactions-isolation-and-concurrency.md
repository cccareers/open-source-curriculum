---
lesson_id: de102-04
course_id: de102
pathway: data-engineer
title: Transactions, Isolation, and Concurrency
order: 4
kind: lesson
competency_ids:
  - D3-S1-C01
  - D3-S1-C02
objectives:
  - Explain how an isolation level changes what a concurrent transaction can
    observe
---

## The transaction is the unit of correctness

Everything you wrote in the last two lessons assumed you were alone. You are not. A production database runs hundreds of statements concurrently, and the guarantees you get about what your statements see, and what other sessions see of yours, are exactly the guarantees your isolation level gives you — no more.

A **transaction** groups statements so that they succeed or fail together:

```sql
BEGIN;

UPDATE account SET balance = balance - 100 WHERE account_id = 1;
UPDATE account SET balance = balance + 100 WHERE account_id = 2;

COMMIT;
```

The four letters of ACID name what that buys you. **Atomicity**: all of it or none of it; a crash between the two updates leaves neither applied. **Consistency**: the transaction moves the database from one state satisfying your constraints to another — this is the one your schema work in lesson 2 actually provides. **Isolation**: concurrent transactions do not corrupt each other's view, to a degree you choose. **Durability**: once `COMMIT` returns, the change survives a power cut, because it was written to the write-ahead log and flushed before the acknowledgement.

Both PostgreSQL and MySQL run in autocommit mode by default: a bare statement is its own transaction. That is fine for single statements and wrong for anything that must be all-or-nothing.

**Savepoints** give you partial rollback inside a transaction:

```sql
BEGIN;
INSERT INTO import_row VALUES (...);
SAVEPOINT after_first;
INSERT INTO import_row VALUES (...);   -- may violate a constraint
ROLLBACK TO SAVEPOINT after_first;     -- keep the first insert, discard the second
COMMIT;
```

In PostgreSQL this matters more than it looks: once any statement errors, the whole transaction is poisoned and every subsequent statement fails with "current transaction is aborted" until you roll back — to a savepoint, or entirely. There is no continuing past an error without one.

## The anomalies isolation levels are named after

Isolation levels are defined by which of these misbehaviours they permit. Learn the anomalies first; the levels are then just a table.

**Dirty read** — you read a row another transaction has modified but not committed. If that transaction rolls back, you acted on a value that never existed.

**Non-repeatable read** — you read a row, another transaction commits an update to it, you read it again in the same transaction and get a different value.

**Phantom read** — you run a query returning a set of rows, another transaction commits an insert matching your predicate, you re-run the query and a new row appears.

**Lost update** — two transactions read the same value, each computes a new value from it, and both write. The second write silently overwrites the first. This is the classic `balance = balance_you_read - 100` bug.

**Write skew** — the subtle one. Two transactions each read an overlapping set, each check a condition that is still true, and each write to *different* rows in a way that makes the condition false in combination. Two doctors both check "at least one other doctor is on call" and both sign off shift; individually valid, jointly wrong. No amount of row locking on the rows you wrote prevents this, because the constraint spans rows nobody wrote.

## The four levels, and what the engines really do

The SQL standard defines four levels by which anomalies they forbid:

| Level | Dirty read | Non-repeatable read | Phantom |
| --- | --- | --- | --- |
| Read uncommitted | allowed | allowed | allowed |
| Read committed | prevented | allowed | allowed |
| Repeatable read | prevented | prevented | allowed |
| Serializable | prevented | prevented | prevented |

That table is the standard's *minimum*. Real engines are stricter in places, and knowing where is the practical skill.

**PostgreSQL** uses multi-version concurrency control. An update does not overwrite a row; it writes a new row version and marks the old one dead for transactions that started later. This is why readers never block writers and writers never block readers in Postgres — a reader simply follows the version visible to its snapshot.

- `READ UNCOMMITTED` is accepted as syntax but behaves exactly like `READ COMMITTED`. Postgres has no dirty reads at all.
- `READ COMMITTED` (the default) takes a **new snapshot for every statement**. So two identical `SELECT`s in one transaction can differ, and a long report is not internally consistent.
- `REPEATABLE READ` takes **one snapshot at the first statement** and holds it for the transaction. Because of MVCC this also eliminates phantoms, which is stronger than the standard requires. The cost is that a write conflicting with a concurrent committed update raises `could not serialize access due to concurrent update` (SQLSTATE 40001), and your application must retry.
- `SERIALIZABLE` adds serializable snapshot isolation: Postgres tracks read/write dependencies and aborts a transaction whose commit would create a cycle, guaranteeing the result matches *some* serial order. This is the only level that prevents write skew. It does not take extra locks and does not block; it detects and aborts. Again: you must retry on 40001.

**MySQL/InnoDB** also uses MVCC but reaches its guarantees differently.

- The default is `REPEATABLE READ`, not `READ COMMITTED` — a genuine portability trap when moving code between engines.
- InnoDB's repeatable read prevents phantoms for plain `SELECT`s via consistent snapshot reads, but *locking* reads and writes inside the same transaction see the latest committed data, so a `SELECT ... FOR UPDATE` can return rows your plain `SELECT` did not. This mixture surprises people.
- InnoDB prevents phantoms in locking reads using **next-key locks**: a row lock plus a gap lock on the index range before it, so no one can insert into the gap. Gap locks are the reason InnoDB deadlocks often involve statements that appear to touch different rows.
- InnoDB's `SERIALIZABLE` implicitly converts plain `SELECT` into `SELECT ... LOCK IN SHARE MODE`, so it achieves serializability by locking and blocking rather than by aborting.

Set the level per transaction:

```sql
BEGIN ISOLATION LEVEL REPEATABLE READ;   -- PostgreSQL
-- SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;  -- portable form, before BEGIN in MySQL
```

## Explicit locking, and the lost-update fix

The lost update has two standard cures.

**Pessimistic**: take the lock when you read.

```sql
BEGIN;
SELECT balance FROM account WHERE account_id = 1 FOR UPDATE;
-- no other transaction can update or lock this row until we commit
UPDATE account SET balance = 42 WHERE account_id = 1;
COMMIT;
```

`FOR UPDATE` takes an exclusive row lock; `FOR SHARE` takes a shared one that blocks writers but not other readers. `FOR UPDATE SKIP LOCKED` skips rows someone else has locked, which is the standard recipe for a work-queue table where several workers each want a different job. `FOR UPDATE NOWAIT` errors immediately instead of waiting.

**Optimistic**: do not lock; detect. Carry a version column, and make the update conditional on it:

```sql
UPDATE document
SET    body = $1, version = version + 1
WHERE  document_id = $2 AND version = $3;
```

If zero rows are affected, someone else got there first, and the application re-reads and retries. This scales better under low contention and costs a retry loop.

And frequently the best answer is neither: express the change as a single atomic statement, `UPDATE account SET balance = balance - 100 WHERE ...`, so the read and the write happen inside one statement's lock and no lost update is possible.

## Deadlocks

A deadlock is two transactions each holding a lock the other wants. The engine detects the cycle and kills one of them with an error (Postgres: `deadlock detected`, SQLSTATE 40P01; MySQL: error 1213). This is not a bug to be eliminated so much as a condition to be handled.

Two practical rules. First, **acquire locks in a consistent order** everywhere in your codebase — if every transaction that touches two accounts locks the lower `account_id` first, the cycle cannot form. Second, **keep transactions short**: no HTTP calls, no user think-time, no waiting on a queue inside an open transaction.

Any application talking to a serious database needs a retry wrapper for SQLSTATE 40001 and 40P01: catch, roll back, sleep briefly with jitter, re-run the whole transaction. Retry the transaction, never the failed statement — the snapshot is gone.

## What long transactions cost you

Because Postgres keeps old row versions until no snapshot can see them, an idle-in-transaction session holds back cleanup for the entire database. Dead tuples accumulate, tables and indexes bloat, and query performance degrades everywhere, not just in the table that session touched. Watch for it:

```sql
SELECT pid, state, now() - xact_start AS xact_age, query
FROM   pg_stat_activity
WHERE  state <> 'idle'
ORDER  BY xact_start;
```

Setting `idle_in_transaction_session_timeout` gives you a safety net. MySQL has an analogous problem: long transactions extend the undo log history list, which slows down reads that must reconstruct old versions.

Two more habits worth building. Data definition statements are transactional in PostgreSQL — you can wrap `CREATE TABLE` and `ALTER TABLE` in a transaction and roll them back, which makes migrations far safer — while MySQL commits implicitly around most DDL, so a failed migration leaves partial changes. And a transaction that writes nothing still holds a snapshot, so wrap read-only reporting work in `BEGIN READ ONLY` at `REPEATABLE READ` when you need a consistent view, and end it promptly.

## Practice

You need two terminal sessions connected to the same PostgreSQL database. Label them A and B; the whole point is watching them interfere.

1. **See a non-repeatable read.** In A, `BEGIN` at `READ COMMITTED` and `SELECT` one row. In B, update and commit that row. In A, `SELECT` again. Record what you see. Repeat the entire experiment at `REPEATABLE READ` and record the difference.
2. **See a phantom — or fail to.** At `READ COMMITTED`, run a `SELECT count(*)` with a predicate in A, insert a matching row in B and commit, and re-count in A. Then do it at `REPEATABLE READ` and explain why PostgreSQL's answer is stronger than the standard's table promises.
3. **Cause a lost update.** In both sessions, read a balance, compute a new value in your head, and write it back with a literal. Confirm one update is lost. Fix it three ways — `FOR UPDATE`, an optimistic version column, and a single atomic `UPDATE ... SET balance = balance - 100` — and verify each.
4. **Cause a deadlock deliberately.** Have A lock row 1 then row 2, and B lock row 2 then row 1, interleaved so both block. Capture the exact error text and note which session was chosen as the victim. Then rewrite both transactions to acquire locks in ascending key order and show the deadlock cannot occur.
5. **Write skew and serializable.** Build the on-call table: two doctors, a rule that at least one must remain on call. Write two transactions that each check the rule and then remove a different doctor. Show they both succeed at `REPEATABLE READ`, leaving the rule violated. Re-run at `SERIALIZABLE` and show one aborts with a serialization failure.
6. **Retry loop.** Write a short script in any language that runs the serializable transaction from step 5 and retries up to three times on SQLSTATE 40001 with a short randomised backoff. Run two copies concurrently and confirm both eventually complete with the invariant intact.
7. **Long-transaction cost.** Open a transaction in A, run one `SELECT`, and leave it idle. In B, update the same table repeatedly, then inspect `n_dead_tup` in `pg_stat_user_tables` and run `VACUUM (VERBOSE)`. Explain in two sentences why the dead rows could not be removed.
