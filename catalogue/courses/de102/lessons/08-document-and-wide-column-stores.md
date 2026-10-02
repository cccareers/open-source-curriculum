---
lesson_id: de102-08
course_id: de102
pathway: data-engineer
title: Document and Wide-Column Stores
order: 8
kind: lesson
competency_ids:
  - D3-S1-C01
  - D3-S1-C02
objectives:
  - Design a MongoDB document model and a Cassandra table around their access
    patterns
---

## Modeling in reverse

Everything in the first half of this course started from the data: what entities exist, what facts belong to each, how do we store every fact exactly once. Queries came afterwards, and the engine's job was to make arbitrary ones work.

Document and wide-column databases invert that. Neither has a join planner worth relying on, so neither can rescue a model that does not match its queries. You start from the **access patterns** — the specific reads your application will perform, in the volumes it will perform them — and you design storage so each of those reads touches as little as possible. Storing a fact twice is normal. Restructuring the whole model because a new query appeared is normal too.

That is not a lower standard of design. It is a different one, and it is stricter in an uncomfortable way: a relational schema that is merely reasonable will serve queries nobody anticipated, while a document or wide-column model that is merely reasonable can be useless for the query you add next quarter.

## MongoDB: documents and collections

A MongoDB **document** is a BSON object — JSON's data model plus real types for dates, 64-bit integers, decimals, and binary. Documents live in **collections**, which impose no schema unless you ask them to. Every document has an `_id`, unique within the collection, defaulting to a 12-byte `ObjectId` that embeds a timestamp.

```javascript
{
  _id: ObjectId("665f1a2b9c4e5d0011a2b3c4"),
  sku: "WID-1042",
  name: "Widget, 10mm",
  category: { id: 17, path: "hardware/fasteners" },
  price: NumberDecimal("4.95"),
  attributes: { material: "steel", finish: "zinc", threads: "M10" },
  tags: ["fastener", "metric"],
  updated_at: ISODate("2026-07-01T09:12:00Z")
}
```

Note what is happening structurally: `category` and `attributes` would each be a join in a relational model, and here they are simply part of the row. That is the core trade the document model offers — **one read instead of several**, paid for with duplication.

Schemaless does not mean structureless. Use **schema validation** so the collection enforces the shape you actually intend:

```javascript
db.createCollection("product", {
  validator: { $jsonSchema: {
    bsonType: "object",
    required: ["sku", "name", "price"],
    properties: {
      sku:   { bsonType: "string", pattern: "^[A-Z]{3}-[0-9]{4}$" },
      price: { bsonType: "decimal", minimum: 0 },
      tags:  { bsonType: "array", items: { bsonType: "string" } }
    }
  }},
  validationLevel: "strict"
});
```

The other structural rule that shapes designs: **atomicity is per document.** A single update to one document is atomic no matter how deeply nested; a change spanning two documents is not, unless you use a multi-document transaction — which exists, works, and costs enough that a model needing it constantly is a model drawn on the wrong boundaries.

## Embed or reference

This is the whole of document modeling, and it has a small number of good answers.

**Embed when** the child is owned by the parent, is read with the parent essentially always, and is bounded in size. Order lines inside an order. Address inside a customer. Configuration inside a device.

**Reference when** the child is large, is shared between parents, is updated far more often than the parent, or grows without bound. Comments on a popular post. A product referenced by every order that contains it.

Three constraints push on the answer. A document has a hard **16MB limit**, so any embedded array that grows with time or traffic will eventually break — an unbounded array is the single most common MongoDB design defect. Updating a large document rewrites it, so embedding a rarely-read 200kB blob into a frequently-updated document taxes every write. And duplicated data must be kept in agreement by *you*; there is no cascade.

Several named patterns handle the awkward middle:

- **Extended reference** — store the referenced `_id` plus the two or three fields you always display alongside it. An order stores `customer: { id, name, city }`. You accept that a renamed customer leaves stale copies, and you decide deliberately whether that matters.
- **Subset** — embed the ten most recent or most relevant children and keep the full set in another collection. A product embeds its five newest reviews; the reviews collection has all forty thousand.
- **Bucket** — for time series and high-volume events, store many measurements per document rather than one document per measurement. A document per device per hour holding an array of readings turns a million tiny documents into a manageable number of large ones and dramatically shrinks index overhead. MongoDB's native time-series collections apply this pattern for you.
- **Computed** — store the aggregate (order total, review count) on the parent and update it on write, because reading it on every page view is the expensive direction.

## Querying MongoDB

Find with a filter document and a projection:

```javascript
db.product.find(
  { "category.path": "hardware/fasteners", price: { $lt: NumberDecimal("10") } },
  { sku: 1, name: 1, price: 1, _id: 0 }
).sort({ price: 1 }).limit(20);
```

The **aggregation pipeline** is where analytical work happens. Each stage transforms the stream of documents from the previous stage:

```javascript
db.order.aggregate([
  { $match: { ordered_at: { $gte: ISODate("2026-01-01") } } },
  { $unwind: "$lines" },
  { $group: { _id: "$lines.product_id",
              units:   { $sum: "$lines.quantity" },
              revenue: { $sum: { $multiply: ["$lines.quantity", "$lines.unit_price"] } } } },
  { $sort: { revenue: -1 } },
  { $limit: 25 },
  { $lookup: { from: "product", localField: "_id",
               foreignField: "_id", as: "product" } },
  { $project: { _id: 0, sku: { $first: "$product.sku" }, units: 1, revenue: 1 } }
]);
```

Two habits make pipelines good. **Put `$match` and `$sort` first**, before any `$unwind`, `$group`, or `$lookup`, so the stages that can use an index do, and the expensive stages see fewer documents. And **treat `$lookup` as a last resort at small cardinality** — it is a nested loop against the foreign collection, and using it in the middle of a large pipeline is exactly the join cost the model was meant to avoid. Note that it appears *after* `$limit` above, so it runs 25 times, not once per order.

Updates use operators, not whole-document replacement: `$set`, `$inc`, `$push` with `$slice` to keep a bounded array, `$addToSet`, `$pull`. To modify a specific array element, use `arrayFilters`:

```javascript
db.order.updateOne(
  { _id: orderId },
  { $set: { "lines.$[l].quantity": 3 } },
  { arrayFilters: [ { "l.product_id": 1042 } ] }
);
```

## Cassandra: the query is the schema

Cassandra is a wide-column store, and its data model follows from one architectural fact: rows are distributed across nodes by a hash of the partition key, and a read that does not name a partition key must contact every node. So the model is not negotiable — **you design one table per query, and the query's filter is the primary key.**

```sql
CREATE TABLE reading_by_device (
  device_id   uuid,
  bucket      date,
  observed_at timestamp,
  metric      text,
  value       double,
  PRIMARY KEY ((device_id, bucket), observed_at, metric)
) WITH CLUSTERING ORDER BY (observed_at DESC, metric ASC);
```

Read that primary key carefully, because it has two distinct parts.

The **partition key** is the parenthesised group `(device_id, bucket)`. It determines which node stores the data, and every query must supply it in full with equality. All rows sharing a partition key live together on disk, sorted.

The **clustering columns** are `observed_at` and `metric`. They order rows within the partition and can be filtered with equality or ranges, but only left to right — the same leftmost-prefix rule you learned for composite indexes, applied here as a hard restriction rather than a performance consideration.

So this table serves:

```sql
SELECT * FROM reading_by_device
WHERE device_id = ? AND bucket = '2026-07-27'
  AND observed_at >= '2026-07-27 06:00:00';
```

and refuses, or performs terribly on, anything that does not name `device_id` and `bucket`.

Note `bucket` in the partition key. That is the **bucketing** technique, and it is essential: without it, a device that reports forever accumulates one unbounded partition. Cassandra partitions should stay under roughly 100MB and 100,000 rows; a partition that grows without limit will eventually cause slow reads, then heap pressure, then an unavailable node. Adding a time bucket — daily, monthly, whatever bounds the growth — is the standard fix, and it means queries spanning a range of buckets issue one query per bucket from the client.

If you also need "readings by metric across devices", you do not add an index. You **add a table** and write to both:

```sql
CREATE TABLE reading_by_metric (
  metric      text,
  bucket      date,
  observed_at timestamp,
  device_id   uuid,
  value       double,
  PRIMARY KEY ((metric, bucket), observed_at, device_id)
);
```

Writing the same fact to several tables is correct Cassandra design, not a compromise. Writes are cheap by construction; the duplication is the price of the read.

Two more modeling tools. **TTL** expires data automatically (`USING TTL 604800`), which is how time-series retention is normally expressed. **Collections** — `set`, `list`, `map` — hold small bounded groups inside a row; they are read whole, so keep them to tens of entries. **Counter** columns provide distributed increments and live in tables of their own.

And the things Cassandra does not give you, which must shape the model rather than be worked around: no joins, no aggregation across partitions worth relying on, no foreign keys, and no read-then-write safety — an `UPDATE` is an upsert and will happily create a row that never existed. Lightweight transactions (`IF NOT EXISTS`, `IF value = ?`) provide compare-and-set at a substantial latency cost; use them rarely and deliberately. Secondary indexes exist, and they query every node, so they are appropriate only for low-cardinality columns inside a known partition. If you find yourself typing `ALLOW FILTERING` to make a query run, the query is telling you the model is wrong.

## Choosing between them

Reach for a **document store** when entities are self-contained, shapes vary between records, and the access pattern is "fetch this whole thing by its identifier, then render it". Reach for a **wide-column store** when writes are relentless and predictable, the read pattern is a small number of known shapes over ordered rows within a key, and you need it to stay flat as data grows. Keep the data in a **relational** engine when relationships are many-to-many, queries are unpredictable, and cross-entity invariants must actually hold — because that is the only one of the three that will enforce them for you.

## Practice

Run MongoDB and a single-node Cassandra locally, both easiest with Docker.

1. **Access patterns first.** For a bicycle-share system, write down eight concrete queries the application must serve, with expected frequency and result size. Everything below is judged against this list, so make it specific.
2. **Document model.** Design MongoDB collections for it. For each embed-or-reference decision, write one sentence naming the pattern used and the query it optimises. Add `$jsonSchema` validation to at least two collections and demonstrate a rejected insert.
3. **Find the flaw.** Deliberately design one collection with an unbounded embedded array. Load enough data to make the document large, measure the update latency, then refactor it using the subset or bucket pattern and measure again.
4. **Pipeline.** Write an aggregation producing the top ten stations by trip count for a date range, with the station's name resolved from another collection. Place `$match`, `$sort`, `$limit`, and `$lookup` in the order that does the least work, and explain each placement.
5. **Wide-column model.** Design Cassandra tables for four of your eight queries. Give the partition key, the clustering columns, and the clustering order for each, and state what bounds each partition's growth.
6. **Feel the constraint.** Write a `SELECT` that omits part of the partition key and record the exact error. Write another that filters a clustering column while skipping the one before it and record that error too. Then make one work with `ALLOW FILTERING`, and write down the design change you would make instead of shipping it.
7. **Denormalize on purpose.** Take one query your first Cassandra table cannot serve and add a second table for it. Write a short note describing exactly what the application must do at write time to keep the two consistent, and what happens if the second write fails.
8. **Compare.** Load the same 100,000 trips into both systems and time your most frequent query on each. Then state which store you would choose for this application and defend it in a paragraph.
