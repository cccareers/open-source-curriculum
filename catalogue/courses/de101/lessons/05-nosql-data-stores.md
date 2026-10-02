---
lesson_id: de101-05
course_id: de101
pathway: data-engineer
title: NoSQL Data Stores
order: 5
kind: lesson
competency_ids:
  - D3-S1-C01
objectives:
  - Choose between a relational store and a NoSQL store for a stated workload
---

## What "NoSQL" actually means

"NoSQL" is a terrible name for a real idea. It does not mean "no SQL" — several of these systems have SQL-like query languages — and it is not a single technology. It is a label attached, in retrospect, to a wave of data stores that gave up one or more of the relational model's guarantees in exchange for something else: horizontal scale, flexible structure, or a data shape the relational model represents awkwardly.

The useful reading is **not relational-only**. A relational database makes a specific bargain: rigid schema, normalized structure, strong consistency, joins across tables, and a scaling story that is mostly about buying a bigger machine. That bargain is excellent for most workloads. When it stops being excellent, it is usually for one of four reasons:

1. **The data does not have a fixed shape.** Every record has a different set of attributes, or the shape changes weekly, and every change means a schema migration on a table with a hundred million rows.
2. **The volume or write rate exceeds one machine.** Relational systems can be sharded, but it is manual, painful work, and joins across shards mostly stop being possible anyway.
3. **The access pattern is a single well-known lookup, repeated billions of times.** You do not need a query planner to fetch a session by its id; you need it to be fast and never down.
4. **The natural structure is not tabular.** Deeply nested documents, or highly connected graphs where the interesting question is "how are these two things related, three hops out?"

Each family of NoSQL store is essentially a different answer to one of those four situations. Understanding which situation you are actually in is the whole skill.

## The families

### Key-value stores

The simplest model: a dictionary at scale. You store a value under a key and you get it back by that key. The store does not know or care what is inside the value.

- **Strengths.** Extremely fast, trivially partitionable (route by key), simple to reason about, cheap to operate.
- **Limits.** You can only retrieve by key. No querying by the contents of a value, no joins, no aggregation.
- **Fits.** Session state, feature flags, rate-limit counters, caching a computed result, an idempotency ledger recording which pipeline runs already completed.

For a data engineer, the most common use is not a primary store at all — it is a cache in front of something slower, or a small operational side-table that a pipeline reads and writes on every run.

### Document stores

A key-value store that understands the value. Documents are JSON-like structures, and the store can index and query fields *inside* them, including nested ones.

```json
{
  "order_id": "ORD-10021",
  "placed_at": "2024-03-17T14:02:11Z",
  "customer": { "id": 8841, "name": "R. Okafor", "state": "OH" },
  "lines": [
    { "sku": "BK-119", "qty": 2, "unit_price": 14.99 },
    { "sku": "PN-004", "qty": 1, "unit_price": 3.50 }
  ],
  "gift_message": "Happy birthday"
}
```

Notice what that document does. The whole order — header, customer context, and every line — is one record retrievable in one read, with no joins. The `gift_message` field can simply be absent on the millions of orders that do not have one, at no cost. That is **schema-on-read**: the store accepts whatever structure you send, and the responsibility for interpreting it moves to whoever reads it.

- **Strengths.** Flexible structure, natural fit for hierarchical data, fast retrieval of a complete aggregate, easy to evolve.
- **Limits.** No enforced schema means nothing stops a bad writer from producing `"qty": "two"`. Joins are limited or absent. Data duplicated across documents (the customer's name here) has to be updated in many places or accepted as a point-in-time snapshot.
- **Fits.** Product catalogs with wildly varying attributes per category, content management, event and audit records, API payloads landed exactly as received.

### Wide-column stores

Rows are identified by a key and hold a large, sparse set of columns which can differ from row to row. Data is physically partitioned by part of the key and sorted by another part, which makes range scans within a partition very fast and makes the store scale across many machines cleanly.

- **Strengths.** Very high write throughput, linear horizontal scale, predictable performance for the access pattern the key was designed for.
- **Limits.** You must design the table around the query *before* you write any data, because the partition key determines what is efficient and cannot be changed later without a full rewrite. Ad-hoc querying is essentially not available.
- **Fits.** Time-series and sensor data, event logs at very large volume, per-user activity feeds.

### Graph databases

Data is stored as nodes and edges, both of which can carry properties, and the query language traverses relationships directly.

- **Strengths.** Multi-hop relationship questions — "which suppliers are within three steps of this component?", "who else shares a device fingerprint with this account?" — that would require an unbounded chain of self-joins in SQL.
- **Limits.** Narrow. If your questions are aggregations rather than traversals, a graph store is the wrong tool and will be slower and more expensive than a relational one.
- **Fits.** Fraud rings, recommendation networks, organizational hierarchies, supply-chain dependency analysis, identity resolution.

### Search engines

Worth naming even though they are usually a complement rather than a primary store: document-oriented systems built around an inverted index, giving full-text relevance ranking, fuzzy matching, and faceting. They are typically fed *from* a system of record rather than being one, because they trade durability guarantees for retrieval quality.

## The trade-offs behind the marketing

### Schema-on-write versus schema-on-read

A relational store validates structure at write time. Bad data is rejected at the door, and every reader can rely on the shape. The cost is friction: changing the shape means a migration.

A schema-on-read store accepts anything and defers interpretation to readers. The cost is that the structure still exists — it has just moved from the database, where it was enforced once, into every consumer, where it is assumed independently and drifts. Flexibility at write time is real, and so is the tax.

This is the honest framing for a data engineer: **schema-on-read does not remove the schema, it moves the enforcement into your pipeline.** If you land documents in a document store, you own validation. That is a legitimate choice, and you must budget for it.

### Consistency and the CAP trade-off

When data is replicated across machines and the network between them fails — and networks do fail — a distributed store has to choose. It can refuse to answer until it is sure the answer is current (favouring consistency), or it can answer with possibly-stale data (favouring availability). That forced choice under partition is what CAP describes. It is not a menu of three where you pick two; it is a statement that during a partition you get consistency or availability, not both.

In practice this shows up as **eventual consistency**: a write is accepted, replicas converge "soon," and a read immediately afterwards on a different replica might not see it. Many NoSQL stores default to this, and many let you tune it per operation.

The engineering question is never "is eventual consistency acceptable in general?" It is "is it acceptable for *this* operation?" A view counter that is a few seconds stale is fine. An account balance that is a few seconds stale can authorize a double withdrawal. Ask what a stale read costs before you accept one.

### Scaling shape

Relational systems scale **vertically** by default: a bigger machine, more memory, faster disks. This works further than people assume and is dramatically simpler to operate. Most NoSQL systems scale **horizontally**: add nodes, and data is partitioned across them by key.

Horizontal scale has a price, and the price is the **partition key**. Everything about performance depends on choosing a key that spreads data evenly and matches your read pattern. Choose `country` as a partition key and one partition holds half your data — a hot spot that no amount of hardware fixes. Choose something evenly distributed but unrelated to how you read, and every query has to touch every node. In a wide-column or key-value store, the partition key is a decision that is expensive to reverse, and it must be made before the first row is written.

### What you give up

Be explicit about the losses, because vendor material rarely is:

- **Joins.** Usually absent or limited. Combining data becomes the application's or the pipeline's job.
- **Transactions across records.** Often limited to a single document or key. Multi-record atomicity may be unavailable or expensive.
- **Referential integrity.** No foreign keys. Orphaned references are your problem to prevent and detect.
- **Ad-hoc query.** Where a relational store lets an analyst ask a question nobody anticipated, a store designed around a known access pattern often cannot answer a new one at any reasonable cost.

That last point is why analytics almost always lands back in a relational or columnar warehouse regardless of where the data originated.

## Choosing, deliberately

Here is a decision procedure you can defend in a design review. Work through it in order.

**1. State the workload precisely.** Read rate and write rate, data volume now and in two years, the size of a single record, and — most importantly — the actual queries. Write down the five most frequent operations as sentences: "fetch one order by id," "list a customer's orders newest first," "sum revenue by category by month."

**2. Start from relational and require a reason to leave.** A relational database is the highest-leverage default: enforced correctness, ad-hoc query, mature tooling, and a skill set every team already has. Modern relational engines also store and index JSON columns, which covers a surprising amount of the "flexible shape" argument without leaving the model. Moving away should be a decision with a written justification.

**3. Name the specific pressure.** If you are leaving relational, the reason should be one of: volume or write rate genuinely beyond one machine; genuinely variable structure; a single high-volume access pattern that needs guaranteed latency; or a traversal-shaped question. "It is more modern" and "we might need to scale someday" are not reasons.

**4. Map pressure to family.**

| Pressure | Likely fit |
| --- | --- |
| Fetch by a single known key, enormous rate | Key-value |
| Records with variable, nested structure, retrieved whole | Document |
| Massive append-heavy time-series, known access pattern | Wide-column |
| Multi-hop relationship questions | Graph |
| Relevance-ranked text search | Search engine |
| Ad-hoc analytical questions over structured data | Relational or columnar warehouse |

**5. Design for the access pattern, not the entities.** This is the mental flip that trips up people coming from relational modeling. In a relational database you model the entities and then write whatever queries you need. In most NoSQL stores you enumerate the queries first, then design storage so each one is a single efficient operation — even if that means storing the same fact three times in three shapes. Duplication is a design tool here, not a defect, and the price you pay for it is that updates must fan out.

**6. Write down the cost.** Every choice has one. Say it out loud: "we accept that we cannot answer ad-hoc questions from this store, and we will replicate it nightly to the warehouse for that." A decision with its cost written next to it is an engineering decision; one without is a preference.

### Polyglot persistence

Real systems rarely pick one. A production architecture might run a relational database as the system of record for orders, a key-value cache in front of a slow computation, a search engine for the product catalog, and a warehouse that everything replicates into for analysis. This is normal and correct — each store does what it is good at.

The cost, and the reason it is a data engineering concern rather than a purely architectural one, is that **every additional store is another source you must ingest, reconcile, and keep consistent.** Four stores means four extraction paths, four schemas to track, and four opportunities for them to disagree about the same customer. Add a store when the workload demands it, not when it is interesting.

### Worked examples

- *"We store one JSON blob per IoT device reading, 50,000 writes per second, and we only ever query the last 24 hours for one device."* Wide-column. High write rate, append-only, single well-defined access pattern, partition by device with time as the sort key.
- *"Our product catalog has 300 categories and each has completely different attributes; shoppers filter and search it."* Document store, likely paired with a search engine. Variable structure is the whole problem.
- *"We need to know whether a loan applicant shares an address or phone number with any account previously flagged for fraud, up to four connections away."* Graph. The question is a traversal and gets worse with every hop in SQL.
- *"Finance needs monthly revenue by region, and the numbers must reconcile to the penny with the accounting system."* Relational, without hesitation. Correctness, transactions, and ad-hoc query are exactly the requirements.
- *"We want to store user preferences; there are eight of them and they change rarely."* Relational, in a table you already have. This is a workload with no pressure at all, and reaching for a second store here adds operational burden for nothing.

## Practice

**1. Classify five workloads.** For each of the following, write a short decision memo (roughly 150 words each) naming the store family you would choose, the specific pressure that justifies it, at least one thing you are giving up, and how you would compensate for that loss:

- A ride-hailing app storing every position ping from every active driver, retained 30 days.
- A hospital's patient billing system.
- A social platform's "people you may know" suggestions.
- A news site's article archive, where editors add new field types every few months and readers search full text.
- A checkout service that needs to guarantee a coupon code is redeemed exactly once.

**2. Model the same data two ways.** Take the e-commerce orders subject area from earlier in this course. Write out (a) the normalized relational tables as you already know them, and (b) a document-store representation as a single JSON document per order, and (c) a document-store representation as separate customer and order documents that reference each other. For each of (b) and (c), answer in writing: how do you retrieve one full order? How do you list all orders for a customer? What happens when a customer changes their name — and is the old name on the old order a bug or a feature? Which of the three would you choose if the primary consumer is a mobile app showing order history, and which if the primary consumer is a finance team?

**3. Design a partition key and try to break it.** You are storing app events in a wide-column store, roughly 200 million events per day, and the required access pattern is "all events for one user in a given day, in time order." Propose a partition key and a sort key. Then argue against your own design: describe a realistic distribution of users that would create a hot partition, and describe a legitimate business question your key makes impossible to answer efficiently. Revise the design once in response, and state the new trade-off you accepted.

**4. Write the reversal.** Find or invent a case where a team chose a NoSQL store and later regretted it. Write a 300-word post-mortem in your own words: what pressure did they think they had, what pressure did they actually have, what did the wrong choice cost, and which question from the decision procedure above would have caught it.
