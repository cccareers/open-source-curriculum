---
lesson_id: de101-03
course_id: de101
pathway: data-engineer
title: Data Modeling Foundations
order: 3
kind: lesson
competency_ids:
  - D3-S1-C01
  - D7-S1-C02
objectives:
  - Design a normalized transactional schema and a denormalized analytical model for the same subject area
---

## Why the same data needs two shapes

A model is a decision about how to represent a piece of the world as tables, columns, and relationships. There is no single correct model for a subject area, because the right model depends on what the database is being asked to do.

An application that takes orders needs to write a small amount of data very often, correctly, with no chance of two copies of the same fact disagreeing. An analytics system needs to read enormous amounts of data occasionally, slicing it many ways, and cares far more about being easy to query than about being economical to write. Those two goals pull in opposite directions. Optimizing writes means splitting data apart so each fact is stored once; optimizing reads means pulling data together so a question can be answered without assembling fifteen pieces.

That is the whole story of this lesson. You will learn to build a **normalized transactional model** for the write side and a **denormalized analytical model** for the read side, for the same subject area, and to document both so someone else can use them.

## The vocabulary you cannot skip

### Entities, attributes, relationships

An **entity** is a thing the business cares about and can identify individually: a customer, an order, a product, a course section. It usually becomes a table. An **attribute** is a fact about that entity — a customer's email, an order's placed timestamp — and becomes a column. A **relationship** connects entities: a customer *places* orders; an order *contains* products.

Relationships have **cardinality**, which is just how many of each side can participate:

- **One-to-many (1:N).** One customer has many orders; each order has exactly one customer. This is the most common relationship in transactional systems and is implemented with a foreign key on the many side.
- **Many-to-many (M:N).** An order contains many products, and a product appears on many orders. A relational database cannot express this directly; you create a **junction table** (here, order lines) that holds a foreign key to each side.
- **One-to-one (1:1).** Rarer, and usually a sign that two tables should be one, or that you are splitting off optional or sensitive attributes deliberately.

### Keys

A **primary key** uniquely identifies a row and is never null. A **foreign key** is a column whose values must exist as a primary key in another table; it is how the database enforces that an order cannot reference a customer who does not exist.

You will choose repeatedly between two kinds of primary key:

- A **natural key** is a real-world identifier that already uniquely identifies the entity — an ISBN, an email address, a course code. It is meaningful, which is convenient, but real-world identifiers get reused, corrected, and reformatted, which is a problem when other tables point at them.
- A **surrogate key** is a system-generated identifier with no business meaning — an auto-incrementing integer or a UUID. It never changes, which makes it safe to reference, at the cost of being unreadable on its own.

The common professional default is a surrogate primary key plus a unique constraint on the natural key, so you get stability *and* the guarantee that the business identifier is not duplicated.

### Grain

**Grain** is the single most useful idea in this lesson: it is the answer to "what does one row in this table mean?" A table whose grain is "one row per order" and a table whose grain is "one row per order line" look similar and behave completely differently — summing an amount column across them gives different answers.

State the grain of every table you design, in one sentence, before you write a column list. If you cannot state it cleanly, the table is doing two jobs and should be two tables. Most incorrect metrics in the wild come from joining tables of different grain and then aggregating without noticing that rows were multiplied.

## Normalization: the transactional model

Normalization is a systematic way of splitting tables so that each fact lives in exactly one place. The motivation is **anomalies**. Consider a single wide `orders` table that repeats the customer's address on every row. Update the address on one row and not the others, and the database now holds two contradictory truths — an *update anomaly*. You also cannot record a customer who has not ordered yet — an *insertion anomaly* — and deleting their only order erases the customer entirely — a *deletion anomaly*.

The normal forms are the cure. Three of them cover almost all practical work.

**First normal form (1NF).** Every column holds a single, atomic value, and there are no repeating groups. Columns like `product_1`, `product_2`, `product_3`, or a comma-separated `phone_numbers` string, violate it. The fix is a child table with one row per value.

**Second normal form (2NF).** In 1NF, and every non-key column depends on the *whole* primary key. This only bites when the primary key is composite. If `order_lines` is keyed on `(order_id, product_id)` and you store `product_name` there, that column depends only on `product_id` — half the key — so it belongs in `products`.

**Third normal form (3NF).** In 2NF, and no non-key column depends on another non-key column. If `orders` holds `customer_id`, `customer_city`, and `customer_state`, then city and state depend on the customer, not the order. They belong in `customers`.

A working shorthand you will hear repeatedly: every non-key attribute depends on *the key, the whole key, and nothing but the key*.

### A worked transactional schema

Take a small e-commerce subject area. Normalized to 3NF, with surrogate keys:

```sql
CREATE TABLE customers (
  customer_id   BIGINT PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  full_name     VARCHAR(200) NOT NULL,
  created_at    TIMESTAMP    NOT NULL,
  updated_at    TIMESTAMP    NOT NULL
);

CREATE TABLE addresses (
  address_id    BIGINT PRIMARY KEY,
  customer_id   BIGINT       NOT NULL REFERENCES customers(customer_id),
  line1         VARCHAR(200) NOT NULL,
  city          VARCHAR(100) NOT NULL,
  state_code    CHAR(2)      NOT NULL,
  postal_code   VARCHAR(20)  NOT NULL
);

CREATE TABLE categories (
  category_id   BIGINT PRIMARY KEY,
  category_name VARCHAR(100) NOT NULL UNIQUE,
  department    VARCHAR(100) NOT NULL
);

CREATE TABLE products (
  product_id    BIGINT PRIMARY KEY,
  sku           VARCHAR(64)  NOT NULL UNIQUE,
  product_name  VARCHAR(200) NOT NULL,
  category_id   BIGINT       NOT NULL REFERENCES categories(category_id),
  list_price    NUMERIC(10,2) NOT NULL
);

CREATE TABLE orders (
  order_id            BIGINT PRIMARY KEY,
  customer_id         BIGINT    NOT NULL REFERENCES customers(customer_id),
  shipping_address_id BIGINT    NOT NULL REFERENCES addresses(address_id),
  order_status        VARCHAR(20) NOT NULL,
  placed_at           TIMESTAMP NOT NULL,
  updated_at          TIMESTAMP NOT NULL
);

CREATE TABLE order_lines (
  order_id      BIGINT NOT NULL REFERENCES orders(order_id),
  line_number   INT    NOT NULL,
  product_id    BIGINT NOT NULL REFERENCES products(product_id),
  quantity      INT    NOT NULL CHECK (quantity > 0),
  unit_price    NUMERIC(10,2) NOT NULL,
  PRIMARY KEY (order_id, line_number)
);
```

Grain, stated explicitly: one row per customer; one row per address; one row per product; one row per order; one row per line on an order.

Two details worth noticing, because they will matter for the rest of this course. First, `unit_price` is stored on the order line rather than read from `products.list_price` at query time — the price the customer paid is a fact about *that order*, and it must not change when someone edits the catalog. Distinguishing facts that are true forever from attributes that drift is a modeling skill, not a technicality. Second, every table carries `created_at` / `updated_at`. Those timestamps are what makes incremental extraction possible later; a source table without them forces you to re-read everything, every time.

## Denormalization: the analytical model

Now ask an analytical question of that schema: revenue by product category by month for the last two years, split by customer state. It requires joining five tables, and every one of those joins is work the database repeats for every variation of the question. Analysts will get it wrong sometimes, and the query is unreadable.

The analytical answer is **dimensional modeling**: reshape the same data into **facts** and **dimensions**.

A **fact table** holds measurements of business events. It is long and narrow: mostly foreign keys to dimensions plus numeric measures. Its grain is a business event — one row per order line, one row per payment, one row per page view.

A **dimension table** holds the descriptive context you filter and group by: who, what, where, when. It is short and wide, and it is *deliberately denormalized* — the product dimension carries the category name and the department name directly, even though that repeats values across rows, because one join beats three.

Arranged around a central fact table, the dimensions form the shape the pattern is named for.

![A normalized order schema on the left and the equivalent star schema on the right, showing one central fact table joined to date, customer, and product dimensions](./img/star-schema-vs-normalized.png)

### The same subject area, dimensionally

```sql
CREATE TABLE dim_date (
  date_key      INT PRIMARY KEY,      -- e.g. 20240317
  full_date     DATE NOT NULL,
  day_of_week   VARCHAR(10) NOT NULL,
  month_number  INT NOT NULL,
  month_name    VARCHAR(10) NOT NULL,
  quarter       INT NOT NULL,
  year          INT NOT NULL,
  is_weekend    BOOLEAN NOT NULL
);

CREATE TABLE dim_customer (
  customer_key  BIGINT PRIMARY KEY,   -- surrogate, warehouse-generated
  customer_id   BIGINT NOT NULL,      -- natural key from the source system
  full_name     VARCHAR(200) NOT NULL,
  email         VARCHAR(255) NOT NULL,
  city          VARCHAR(100),
  state_code    CHAR(2),
  signup_date   DATE
);

CREATE TABLE dim_product (
  product_key   BIGINT PRIMARY KEY,
  product_id    BIGINT NOT NULL,
  sku           VARCHAR(64) NOT NULL,
  product_name  VARCHAR(200) NOT NULL,
  category_name VARCHAR(100) NOT NULL,   -- denormalized on purpose
  department    VARCHAR(100) NOT NULL    -- denormalized on purpose
);

CREATE TABLE fact_order_line (
  order_line_key BIGINT PRIMARY KEY,
  date_key       INT    NOT NULL REFERENCES dim_date(date_key),
  customer_key   BIGINT NOT NULL REFERENCES dim_customer(customer_key),
  product_key    BIGINT NOT NULL REFERENCES dim_product(product_key),
  order_id       BIGINT NOT NULL,        -- degenerate dimension
  quantity       INT    NOT NULL,
  unit_price     NUMERIC(10,2) NOT NULL,
  extended_price NUMERIC(12,2) NOT NULL
);
```

The grain of `fact_order_line` is one row per product line on an order. That single sentence tells you what you may sum (`quantity`, `extended_price`) and what you may not (`unit_price`, which is a rate, not an additive measure — averaging it across rows without weighting by quantity is a classic error).

`order_id` sits in the fact table with no dimension of its own. That is a **degenerate dimension**: an identifier you want for grouping and traceability that has no descriptive attributes to hang off it.

Two more terms you will meet immediately in real work:

- **Conformed dimensions.** If both `fact_order_line` and a future `fact_shipment` use the same `dim_customer` and `dim_date`, the two facts can be compared and combined. Shared, consistent dimensions are what make a warehouse a warehouse rather than a pile of tables.
- **Slowly changing dimensions.** A customer moves from Ohio to Texas. Do you overwrite the state (**type 1** — history is lost, current truth is simple) or close the old row and insert a new one with validity dates and a current flag (**type 2** — history is preserved, and old orders still roll up to Ohio where they belong)? Type 1 answers "where do they live now?"; type 2 answers "what did we sell into Ohio in 2023?" Pick per attribute, not per table, and pick based on whether anyone needs to ask the historical question.

### Choosing between the shapes

| | Normalized (3NF) | Dimensional (star) |
| --- | --- | --- |
| Optimized for | Frequent, correct writes | Flexible, fast reads |
| Redundancy | Minimized | Accepted deliberately |
| Typical joins per query | Many | One or two per dimension |
| Handles change by | Updating one row | Loading new rows on a schedule |
| Lives in | The application database | The warehouse or analytics layer |

Notice that the analytical model is not "the normalized model done badly." It is a different artifact, built by a pipeline that reads the normalized model. The redundancy is controlled, produced by a repeatable process, and never hand-edited — which is exactly why it does not cause the anomalies that made normalization necessary in the first place.

## Documenting the model

An undocumented model is a model only its author can use, which means it will be re-derived, misused, or quietly abandoned. Documentation is a first-class deliverable of modeling work, and it has three pieces.

**An entity-relationship diagram.** A picture of tables, their keys, and the lines between them, with cardinality marked. It answers "how do these fit together?" in ten seconds. Keep it in version control next to the schema — a text-based diagram source that renders to an image ages far better than a screenshot in a slide deck.

**A data dictionary.** One row per column, with the table, column name, type, nullability, a plain-English definition, and the source it comes from. The definition column is the valuable one and the one people skip. "`order_status`: current fulfilment state; one of `pending`, `paid`, `shipped`, `cancelled`; set by the checkout service; `cancelled` orders are excluded from revenue" is worth more than the other five columns combined.

| Table | Column | Type | Null | Definition |
| --- | --- | --- | --- | --- |
| `fact_order_line` | `extended_price` | numeric(12,2) | no | `quantity * unit_price`, before tax and shipping; additive across all dimensions |
| `dim_customer` | `state_code` | char(2) | yes | Two-letter state of the customer's current primary address; null for non-US customers |

**A model README.** The narrative the diagram and dictionary cannot carry: the subject area's grain statements, the decisions you made and why (which attributes are type 2 and which are type 1, why price is stored on the line, what is deliberately out of scope), and the known limitations. Six months later this is the document that stops someone from "fixing" a decision you made on purpose.

A few conventions that make documentation cheaper to maintain: name tables consistently (plural nouns for entities, `dim_` and `fact_` prefixes for the analytical layer), name a foreign key after the primary key it points at, avoid abbreviations nobody outside the team knows, and keep the documentation in the same repository as the schema so a pull request changes both together. Documentation stored somewhere the schema change does not touch will be wrong within a quarter.

## Practice

**1. Model a subject area end to end.** Choose one subject area you understand well and that is *not* e-commerce — a community college's course registration, a bike-share system, a food bank's inventory and distributions, or a clinic's appointments. Then produce all of the following:

- A list of at least six entities with their attributes and the relationships between them, with cardinality marked.
- A 3NF schema written as `CREATE TABLE` statements, with primary keys, foreign keys, `NOT NULL` where appropriate, and a `created_at` / `updated_at` pair on every entity table. State the grain of each table in a one-line comment above it.
- A short justification, per table, of your choice of surrogate versus natural primary key.

**2. Break it, then fix it.** Before normalizing, write out a single wide table for the same subject area — the kind a spreadsheet would produce. Give three specific examples of anomalies it permits (one insertion, one update, one deletion), naming the exact rows and columns involved. Then show which normal form each of your 3NF tables resolves.

**3. Build the analytical counterpart.** From the same subject area, design a star schema: one fact table and at least three dimensions. Write it as `CREATE TABLE` statements. State the fact grain in one sentence. For each numeric column in the fact table, label it additive, semi-additive (summable across some dimensions but not time), or non-additive, and say what an analyst would get wrong if they ignored your label. Identify at least one attribute that should be slowly changing type 2 and explain the business question that forces the choice.

**4. Document it.** Produce the three documentation artifacts for your analytical model: an ERD (hand-drawn and photographed is acceptable; a text-based diagram source is better), a data dictionary covering every column of the fact table and one dimension, and a model README of 300 to 500 words recording your grain statements, your type 1 / type 2 decisions, and two things you deliberately left out of scope. Then hand the whole package to someone who has not seen your subject area and ask them to write, from the documentation alone, the question "which category sold the most units last quarter" as a plain-English list of the tables and joins involved. Anywhere they hesitate is a documentation defect — fix it.
