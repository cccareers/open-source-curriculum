---
lesson_id: de102-02
course_id: de102
pathway: data-engineer
title: Relational Modeling in PostgreSQL and MySQL
order: 2
kind: lesson
competency_ids:
  - D3-S1-C01
objectives:
  - Model a relational schema whose integrity is enforced by keys and constraints
---

## What a schema is actually for

A relational schema is not documentation. It is a set of rules the database engine enforces on your behalf, every time, for every writer, including the ones you have never met: the intern's one-off script, the vendor integration, the migration you will run at 2am. Application code can check the same rules, but application code is one of many writers and it can be bypassed. The schema cannot.

That is the frame for this lesson. Every design decision below is judged by one question: after this change, what class of bad data becomes impossible rather than merely discouraged?

PostgreSQL is the engine we teach against. MySQL (specifically InnoDB, which is the only storage engine worth using for transactional work) is close enough that most of this transfers verbatim, and the places it does not are called out explicitly.

## Tables, columns, and choosing types

A table holds rows of a single kind of thing. A column holds one fact about that thing. The type you give a column is the first constraint you write, and it is the cheapest one you will ever get.

```sql
CREATE TABLE customer (
  customer_id   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email         text        NOT NULL,
  display_name  text        NOT NULL,
  country_code  char(2)     NOT NULL,
  credit_limit  numeric(12,2) NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);
```

A few type choices in there are worth defending:

- **`text`, not `varchar(n)`.** In PostgreSQL these are the same type internally; `varchar(n)` only adds a length check. Add a length check when the length is a real business rule, not out of habit.
- **`numeric` for money, never `float`.** Binary floating point cannot represent 0.10 exactly, so sums drift. `numeric(12,2)` is exact decimal arithmetic.
- **`timestamptz`, not `timestamp`.** `timestamptz` stores an absolute instant and converts on the way in and out using the session time zone. Plain `timestamp` stores a wall-clock reading with no time zone at all, which means two rows written from two servers are not comparable. Use `timestamptz` for anything that records when something happened.
- **`bigint` identity, not `int`.** Four-byte integers run out at about 2.1 billion. The extra four bytes per row is cheaper than the migration.

MySQL differences worth knowing now: `AUTO_INCREMENT` is the usual identity mechanism, though MySQL 8 also understands the standard-ish `GENERATED` syntax in fewer places; `DATETIME` is the time-zone-naive type and `TIMESTAMP` is the one that converts, which is the reverse of the naming intuition Postgres gives you; and `DECIMAL` is the money type. Always create MySQL schemas with `utf8mb4` character set — the older `utf8` alias is a three-byte encoding that cannot store emoji or many CJK characters.

## Keys: which row is this?

A **primary key** answers "which row is this?" uniquely and permanently. It must be unique, never null, and never updated.

You choose between a **natural key** (a real-world identifier that already exists, such as an ISO country code) and a **surrogate key** (a meaningless number or UUID the database mints). The rule of thumb: use a natural key when the value is genuinely immutable and controlled by an external standards body; use a surrogate key otherwise. Email addresses, phone numbers, usernames, and order reference numbers all feel unique until the day the business changes one, and then every foreign key referencing it has to change too.

Surrogate does not mean "abandon the natural key". It means "demote it to a unique constraint":

```sql
ALTER TABLE customer
  ADD CONSTRAINT customer_email_key UNIQUE (email);
```

Now the row identity is stable, and the business rule "one account per email" is still enforced by the engine.

A **composite key** is a primary key over more than one column. It is the right answer for a join table representing a many-to-many relationship:

```sql
CREATE TABLE order_line (
  order_id    bigint NOT NULL,
  line_number int    NOT NULL,
  product_id  bigint NOT NULL,
  quantity    int    NOT NULL,
  unit_price  numeric(12,2) NOT NULL,
  PRIMARY KEY (order_id, line_number)
);
```

## Foreign keys and what happens on delete

A **foreign key** declares that the values in one column must already exist as a key in another table. It converts "orphaned rows" from a data-quality ticket into an error at write time.

```sql
ALTER TABLE order_line
  ADD CONSTRAINT order_line_order_fk
  FOREIGN KEY (order_id) REFERENCES sales_order (order_id)
  ON DELETE CASCADE;
```

The referential action is the part people skip, and it encodes a real business decision:

- `ON DELETE RESTRICT` (and `NO ACTION`, the default) refuses the delete while children exist. This is the safe default for anything a human might delete by mistake.
- `ON DELETE CASCADE` deletes the children too. Correct when the child cannot exist independently — order lines really are part of the order. Dangerous when the child has independent value, because one delete can silently remove a great deal.
- `ON DELETE SET NULL` keeps the child and blanks the reference. Correct for optional relationships, such as an employee's assigned manager.

MySQL's InnoDB honours all of these. Two differences bite in practice: MySQL silently creates an index on the referencing column if none exists (Postgres does not, and an unindexed foreign key makes parent deletes slow), and Postgres supports `DEFERRABLE INITIALLY DEFERRED` constraints that are only checked at commit, which MySQL does not.

## The other constraints

`NOT NULL` is the most under-used constraint in the industry. Every nullable column is a branch every future query must handle. Make columns `NOT NULL` by default and justify each exception; "unknown" and "not applicable" are the only good reasons.

`CHECK` constraints encode row-local business rules:

```sql
ALTER TABLE order_line
  ADD CONSTRAINT order_line_quantity_positive CHECK (quantity > 0),
  ADD CONSTRAINT order_line_price_nonnegative CHECK (unit_price >= 0);
```

Name your constraints. An unnamed constraint gets a generated name that differs between environments, and the error message your application logs is the constraint name.

PostgreSQL also gives you **exclusion constraints**, which generalise uniqueness to any operator. The classic use is preventing overlapping reservations:

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE room_booking
  ADD CONSTRAINT room_booking_no_overlap
  EXCLUDE USING gist (room_id WITH =, stay_period WITH &&);
```

`stay_period` here is a `daterange`. The constraint says: two rows may not have the same `room_id` and overlapping ranges. MySQL has no equivalent; there you enforce it in application code and accept the race.

MySQL note on `CHECK`: versions before 8.0.16 parsed `CHECK` and then ignored it entirely. If you inherit a MySQL 5.7 schema, assume every check constraint in it is decorative.

## Normalization, in the amount you actually need

Normalization is the discipline of storing each fact once. Three normal forms cover essentially all practical work:

**First normal form**: each column holds a single value, not a list. A `tags` column containing `"urgent,billing,eu"` is a parsing problem waiting to happen.

**Second normal form**: every non-key column depends on the *whole* primary key. In `order_line` keyed by `(order_id, line_number)`, storing `customer_email` would violate this — the customer depends on the order alone.

**Third normal form**: no non-key column depends on another non-key column. Storing `country_code` and `country_name` in the same customer row is the standard violation; the name depends on the code, not on the customer, so it belongs in a `country` table.

The payoff is that an update touches one row. The cost is more joins. Denormalizing — deliberately storing a fact twice for read speed — is a legitimate choice, but treat it as a performance optimisation with a maintenance bill, made after you have measured, not as a starting position. When you do denormalize, write down what keeps the copies in agreement.

## Structured and semi-structured in the same table

Not every fact is known at design time. Event payloads, third-party webhooks, and user-defined attributes all arrive with shapes you do not control. PostgreSQL's `jsonb` type lets you keep that data in the same row as your structured columns:

```sql
CREATE TABLE device_reading (
  reading_id  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  device_id   bigint      NOT NULL REFERENCES device (device_id),
  observed_at timestamptz NOT NULL,
  payload     jsonb       NOT NULL,
  CONSTRAINT device_reading_payload_is_object
    CHECK (jsonb_typeof(payload) = 'object')
);
```

`jsonb` stores a parsed, binary representation, so it is queryable (`payload ->> 'firmware'`) and comparable, unlike the `json` type which keeps the original text. MySQL's `JSON` type is likewise parsed and binary.

The discipline that keeps this from becoming a swamp: anything you filter, join, or aggregate on regularly should be promoted to a real column with a real constraint. `jsonb` is for the long tail, not for avoiding schema design. A useful middle step in Postgres is a generated column that lifts a field out of the document and gives it a type:

```sql
ALTER TABLE device_reading
  ADD COLUMN firmware text
  GENERATED ALWAYS AS (payload ->> 'firmware') STORED;
```

## Changing a schema that is already in use

Schema changes are code and belong in version control as forward-only migration files, applied in order, each one small enough to reason about. Two habits keep them safe:

**Know which operations take an exclusive lock.** In modern PostgreSQL, adding a nullable column, or a column with a constant default, is fast metadata-only work. Adding a `NOT NULL` column without a default, or changing a column's type, rewrites the whole table and blocks readers for the duration. The safe pattern for adding a required column to a large live table is three steps: add it nullable, backfill in batches, then add the constraint — using `NOT VALID` first and `VALIDATE CONSTRAINT` afterwards so the validation scan does not hold a blocking lock.

**Expand before you contract.** To rename or retype a column without downtime: add the new column, write to both, backfill, switch readers, then drop the old one — as separate deploys.

MySQL 8 does much of this online too (`ALGORITHM=INPLACE, LOCK=NONE`), but the set of operations that qualify differs from Postgres's, so check the manual for the specific change rather than assuming.

## Practice

Work against a local PostgreSQL instance. Create a fresh database for this exercise.

1. **Design.** Model a small library lending system with at least five tables: books, physical copies of books, members, loans, and one reference table of your choosing. Every table gets a primary key; every relationship gets a foreign key with a deliberately chosen referential action. Write down in a comment why each `ON DELETE` action is right for that relationship.
2. **Make bad data impossible.** Add constraints such that all of the following are rejected by the engine: a loan whose return date precedes its checkout date; two members with the same email; a copy that belongs to no book; a negative replacement cost; a loan referencing a copy that does not exist.
3. **Prove it.** For each constraint, write an `INSERT` or `UPDATE` that violates it, run it, and record the exact error message the server returns. A constraint you have not seen fire is a constraint you have not tested.
4. **Semi-structured.** Add a `jsonb` column to your books table for publisher-supplied metadata whose fields you do not control. Constrain it to be a JSON object. Then promote one field you would realistically filter on into a generated column with a proper type.
5. **Normalize.** Deliberately introduce a third-normal-form violation (store a denormalized value that depends on another non-key column), then write the `UPDATE` that would be required to keep both copies in agreement. Migrate it into a properly normalized reference table and note what the update becomes afterwards.
6. **Migrate safely.** Write a migration that adds a required `membership_tier` column to your members table on the assumption it already holds ten million rows. Use the add-nullable, backfill, `NOT VALID`, `VALIDATE CONSTRAINT` sequence, and explain in a comment which step would have blocked writers if done naively.
