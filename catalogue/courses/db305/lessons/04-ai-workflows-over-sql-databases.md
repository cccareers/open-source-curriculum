---
lesson_id: db305-04
course_id: db305
pathway: prompt-engineer
title: AI Workflows over SQL Databases
order: 4
kind: lesson
competency_ids:
  - D5-S1-C02
objectives:
  - Build an AI workflow that reads from and writes to a SQL database safely
---

## The model you are querying against

A relational database stores data in tables. A table has named columns with declared types, and rows that must fit them. Two things follow, and both are why teams keep putting their important data here.

**The database enforces the rules.** A column declared `NOT NULL` cannot hold a null. A column declared `numeric(10,2)` cannot hold `"$980"`. A primary key cannot repeat. Unlike a spreadsheet or a document store, the database will refuse your bad write rather than accept it and let you find out later.

**Relationships are first class.** A row in `orders` points at a row in `customers` through a foreign key. You do not copy the customer's name into every order; you store the id and join when you need the name.

Here is the small schema this lesson uses. You are not designing schemas in this course — you are reading them, which you will do constantly, because every query you write starts by finding the column names.

```sql
customers(id text primary key, name text not null, region text, created_at timestamptz)
orders(id text primary key, customer_id text references customers(id),
       placed_at timestamptz not null, status text not null, total numeric(10,2))
order_notes(order_id text references orders(id), note text, extracted jsonb, updated_at timestamptz)
```

Ask whoever owns the database for exactly this: table names, column names and types, primary keys, and which columns link tables together. That, plus the queries below, is the whole working set for a workflow author.

## Reading one table

```sql
select id, placed_at, status, total
from orders
where status = 'confirmed'
  and placed_at >= '2026-03-01'
order by placed_at desc
limit 100;
```

Read it in the order the database evaluates it, not the order it is written: **from** which table, **where** which rows qualify, **select** which columns come back, **order by** in what sequence, **limit** how many.

Four habits to build immediately.

**Name your columns.** `select *` returns whatever the table happens to have today. When someone adds a column, your workflow's field mapping shifts under it. Listing columns also cuts the payload, which matters when a table has a large text or JSON column you do not need.

**Always bound the result.** Every query a workflow issues should have a `limit`, even when you expect three rows. The one time the `where` clause is wrong, the limit is the difference between a slow step and an exhausted platform.

**Filter on the database side.** Pulling 40,000 rows to filter them in a workflow step is the same mistake as sending structured data to a model — it is slower, more expensive, and it will hit a row cap. Let `where` do the work.

**Handle three-valued logic.** `null` is not a value, it is the absence of one, and it never equals anything. `where region = null` returns nothing at all; you want `where region is null`. Worse, `where region <> 'EU'` silently excludes rows where `region` is null. When null is possible, say so: `where region is distinct from 'EU'`, or `where region <> 'EU' or region is null`.

Useful operators beyond `=`: `in ('confirmed','shipped')`, `between` for ranges, `like '%freight%'` for a text match (`ilike` for case-insensitive in some databases), and `is null` / `is not null`.

## Joining two tables

A workflow almost never wants one table. It wants orders with the customer's name on them.

```sql
select o.id            as order_id,
       o.placed_at,
       o.total,
       c.name          as customer_name,
       c.region
from orders o
join customers c on c.id = o.customer_id
where o.status = 'confirmed'
  and o.placed_at >= now() - interval '7 days'
order by o.placed_at desc
limit 500;
```

`join ... on` says which column links the tables. The aliases `o` and `c` keep it readable and are required once two tables have a column with the same name — `id` exists in both, so `o.id` and `c.id` are different things.

The distinction you must not get wrong is inner versus left.

```sql
-- inner join: only orders that HAVE a matching customer
join customers c on c.id = o.customer_id

-- left join: ALL orders; customer columns are null when there is no match
left join customers c on c.id = o.customer_id
```

An inner join silently drops rows. If 40 of your 500 orders reference a customer that was deleted, the inner join returns 460 and tells you nothing. When "every row of the left table must appear" is what you mean, use `left join` — and then check for nulls in the joined columns, because those nulls are a data-quality finding worth reporting.

The second trap is row multiplication. Joining `orders` to `order_notes` when an order can have several notes returns one row per note, so an order with three notes appears three times and any total you compute from that result is wrong. When you only want one row per order, either aggregate the notes or join to a filtered subset.

## Aggregating

```sql
select c.region,
       count(*)                as order_count,
       sum(o.total)            as revenue,
       avg(o.total)            as average_order
from orders o
join customers c on c.id = o.customer_id
where o.placed_at >= date_trunc('month', now())
  and o.status in ('confirmed', 'shipped')
group by c.region
having sum(o.total) > 10000
order by revenue desc;
```

`group by` collapses rows into buckets; every selected column must either be in the `group by` or wrapped in an aggregate. `having` filters the buckets after aggregation, while `where` filters the rows before it — putting a condition in the wrong one gives a wrong answer quietly.

Note `count(*)` versus `count(o.total)`: the first counts rows, the second counts rows where `total` is not null. That gap is often the most interesting number on the page.

This is the query type that most often deserves to feed an AI step. The database produces the numbers; the model writes the paragraph about them. Never the reverse.

## Writing back

```sql
insert into order_notes (order_id, note, extracted, updated_at)
values ($1, $2, $3, now());
```

```sql
update orders
set status = $1
where id = $2;
```

Say the rule out loud before you run either: **an `update` or `delete` without a `where` clause changes every row in the table.** There is no confirmation prompt and no undo. Build the habit of writing the `where` clause first, and of running the equivalent `select` before the `update`:

```sql
-- 1. see exactly which rows you are about to change
select id, status from orders where id = 'ORD-1041';

-- 2. only then
update orders set status = 'shipped' where id = 'ORD-1041';
```

A workflow that writes should also be safe to run twice, because it will be — a retry after a timeout, a replayed page, a rerun after a fix. The tool for that is an upsert: insert if new, update if present, keyed on something unique.

```sql
insert into order_notes (order_id, note, extracted, updated_at)
values ($1, $2, $3, now())
on conflict (order_id)
do update set note       = excluded.note,
              extracted  = excluded.extracted,
              updated_at = now();
```

Run that twice with the same input and you get one row, not two. That single property removes most of the duplicate-record incidents a workflow can cause.

When several writes must succeed or fail together, wrap them in a transaction:

```sql
begin;
update orders set status = 'invoiced' where id = 'ORD-1041';
insert into invoices (order_id, amount, issued_at) values ('ORD-1041', 881.00, now());
commit;
```

If anything between `begin` and `commit` fails, `rollback` leaves the database as it was. Use it for the small number of cases where a half-finished write is worse than no write; do not wrap a long-running loop with a model call inside it, because the transaction holds locks for as long as it is open.

## Connecting a workflow to the database

The credentials your workflow uses are a design decision, not a copy-paste.

**Use a dedicated database user for each workflow**, not the admin account and not a shared one. When something goes wrong you want the database's logs to name the culprit, and you want revoking access to affect one thing.

**Grant the least privilege that works.** A reporting workflow gets `select` on the specific tables it reads and nothing else. A workflow that writes gets `select` and `insert` and `update` on its own tables. No workflow gets permission to create, alter, or drop tables. Ask the database owner for this explicitly; the default they hand you will usually be broader than you need.

```text
reporting_bot   -> select on orders, customers
extraction_bot  -> select on orders; select, insert, update on order_notes
```

**Set a statement timeout** so a runaway query is cancelled rather than holding a connection open. **Cap rows** at the query level as described above. And **store the connection string in your platform's credential store**, never in a step field — a connection string is a password with a hostname attached.

If your organization has a read replica, point read-only workflows at it. Reporting queries then cannot slow down the system taking orders.

## Parameters, not string building

This is the rule that has no exceptions.

```text
WRONG:  "select * from orders where id = '" + input_id + "'"
RIGHT:  "select * from orders where id = $1"   with input_id passed as a parameter
```

When you paste a value into query text, whatever that value contains becomes part of the query. A customer name of `O'Brien` breaks the syntax. A crafted value such as `x'; delete from orders; --` does something much worse. Parameterized queries send the value separately from the statement, so the database treats it as data no matter what it contains — the injection cannot happen because the value never becomes SQL.

Every workflow platform's database step supports parameters. Find how yours expresses them (`$1`, `?`, or a named binding) and use it for every value that came from outside: form input, API response, spreadsheet cell, and above all model output.

The one thing parameters cannot do is stand in for a table or column name. If you find yourself wanting `select * from $1`, stop and use an allowlist — a fixed map from a small set of accepted inputs to hard-coded names you wrote.

## When the model writes the SQL

Asking a model to turn "how much did each region bill last month" into SQL is a genuinely useful pattern, and it is only safe with guard rails. Treat generated SQL as untrusted input.

Give the model the schema and constraints in the prompt:

```text
You write a single read-only SQL query for PostgreSQL.

Schema:
customers(id text, name text, region text, created_at timestamptz)
orders(id text, customer_id text, placed_at timestamptz, status text, total numeric)

Rules:
- SELECT statements only. Never INSERT, UPDATE, DELETE, DROP, ALTER, GRANT, or COPY.
- Query only the two tables listed. Never reference any other table.
- Always include an explicit LIMIT of 1000 or fewer.
- Never use a semicolon except as the final character.
- Return only the SQL. No explanation, no code fence.

Question:
{{question}}
```

Then enforce the same rules in code, because the prompt is a request and the check is the control:

```text
1. Reject unless the statement starts with SELECT (after trimming whitespace and comments).
2. Reject if it contains a second semicolon, or any of the forbidden keywords.
3. Reject if it references a table outside the allowlist.
4. Append or clamp a LIMIT.
5. Run it as a read-only database user, under a statement timeout.
6. Log the question, the generated SQL, the row count, and the duration.
```

Step 5 is the one that actually protects you. If the connection has no write permission, a generated `delete` fails at the database regardless of what the other checks missed. Prompt rules reduce noise; permissions provide the guarantee.

Show the query to the user alongside the answer. A person who can see the SQL can spot a wrong join before it becomes a wrong decision.

## Practice

Use a database you can safely write to — a local PostgreSQL, a free hosted instance, or a sandbox schema your team provides. Create the three tables above and load a few hundred rows of test data.

1. **Write the schema down** in the form given at the top of this lesson: tables, columns, types, keys, and links. Work from the database itself, not from memory.
2. **Read one table.** Write a query returning confirmed orders from the last 30 days with named columns, an explicit limit, and a sort. Run it and record the row count.
3. **Prove the null trap.** Set `region` to null on a handful of customers. Write a query intended to return "customers not in the EU region" that wrongly excludes them, then fix it, and show both row counts.
4. **Join.** Write the inner-join version of orders-with-customer, then the left-join version. Delete or orphan a customer reference so the two disagree, and report which rows the inner join dropped.
5. **Aggregate.** Produce revenue and order count by region for the current month, filtered with `having` to regions above a threshold. Then feed the result to a single AI step that writes a two-sentence commentary — and confirm every number in the commentary came from the query, not the model.
6. **Write safely.** Build a workflow step that stores an extraction result into `order_notes` using an upsert and parameters. Run it three times with the same input and show that exactly one row exists.
7. **Break it on purpose.** Attempt the same write by concatenating a value containing an apostrophe into the query text and observe the failure. Then attempt it with a parameter and observe it succeed. Keep both outputs as evidence.
8. **Lock it down.** Create a read-only database user, point a copy of your workflow at it, and confirm that the write step now fails with a permission error. Add the generated-SQL guard rails from the last section and test them with a question crafted to produce a forbidden statement.
