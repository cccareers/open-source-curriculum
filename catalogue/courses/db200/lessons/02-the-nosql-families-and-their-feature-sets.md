---
lesson_id: db200-02
course_id: db200
pathway: software-developer
title: The NoSQL Families and Their Feature Sets
order: 2
kind: lesson
competency_ids:
  - D5-S1-C02
objectives:
  - Compare the NoSQL data-store families and the workloads each suits
---

## What the name actually means

"NoSQL" is a bad name for a real category. It was a hashtag for a 2009 meetup and it stuck, which is why the industry spent a decade retconning it into "not only SQL." Neither reading tells you anything useful, because the label is defined by a negative: these are the stores that decided not to be a relational database. What they became instead varies enormously.

You have just spent a course inside PostgreSQL, so you have a precise baseline to compare against. A relational database gives you a fixed schema declared ahead of time, rows in tables, a declarative query language that can combine any table with any other table at query time, transactions that hold across multiple rows and multiple tables, and a set of constraints the engine enforces on your behalf whether or not your application remembers to. That bundle is not free. It is bought with a single logical writer for each piece of data, with locks, with a query planner that has to make decisions at runtime, and with a schema that every deployment has to migrate in lockstep.

Every store in this lesson unbundles some part of that package. One drops the fixed schema. One drops the query language entirely. One drops multi-table joins so it can spread writes across a hundred machines. One drops tabular structure altogether because the thing it stores is a network, not a grid. The productive question is never "should I use NoSQL?" — that question has no answer. It is "which of these guarantees does my workload actually need, and what am I willing to hand back to buy the ones I do?"

Two clarifications before the tour, because both cause confusion.

**Schemaless does not mean structureless.** A document store will happily accept two documents with different fields. That does not mean your data has no shape; it means the shape is enforced by your application code and your code review instead of by the engine. The schema moved, it did not disappear. Whether that is a feature or a liability depends entirely on whether your team is disciplined enough to be the enforcer. Most of these stores now offer optional schema validation precisely because teams learned this the hard way.

**Scaling out is the recurring motive.** Postgres scales up: you buy a bigger machine, and you can add read replicas, but there is exactly one machine accepting writes for a given row. Most NoSQL stores are built to scale out: data is partitioned across many machines by a key, and any machine can accept writes for the partitions it owns. Nearly every restriction you are about to meet — no joins, no cross-partition transactions, limited query flexibility — exists because the store refuses to do anything that would require coordinating several machines on the write path. The restrictions are the price of horizontal scale, and if you do not need horizontal scale, you are paying for nothing.

## Document stores

A document store keeps records as self-describing documents, in practice JSON or a binary encoding of it. MongoDB stores BSON; Couchbase, Amazon DocumentDB, Firestore, and RavenDB are all variations on the idea, and Postgres itself has a very capable `jsonb` column type that covers a surprising amount of this ground.

The unit of storage is a whole document, and documents live in collections rather than tables. Here is an order that would have been four rows across three tables in your db100 schema:

```json
{
  "_id": "ord_10482",
  "placedAt": "2026-03-14T18:22:05Z",
  "status": "shipped",
  "customer": {
    "id": "cus_331",
    "name": "Dana Okafor",
    "email": "dana@example.com"
  },
  "lines": [
    { "sku": "KB-88", "name": "Split keyboard", "qty": 1, "unitPrice": 179.00 },
    { "sku": "CB-02", "name": "USB-C cable", "qty": 2, "unitPrice": 12.50 }
  ],
  "shipping": { "carrier": "UPS", "tracking": "1Z999AA10123456784" },
  "total": 204.00
}
```

Three things follow from that shape, and they are the whole argument for document stores.

**The document is the atomic unit.** Writing this order is one write. Reading it back for an order-detail page is one read, with no join, no matter how many line items it has. In a relational schema the same page costs a join across `orders`, `order_lines`, and `customers`, and the database has to reassemble a result set that your application then has to un-flatten back into an object. When the shape your application wants matches the shape on disk, an entire layer of translation stops existing.

**Nesting is native.** Arrays and sub-objects are first-class. You can query into them — "orders containing SKU `KB-88`" — and index into them, without inventing a join table.

**Fields are per-document.** Adding a `giftMessage` field to new orders requires no migration and no downtime; old orders simply do not have it. This is genuinely valuable for evolving products and genuinely dangerous for long-lived data, because six months later your collection contains four generations of document shape and every read path has to cope with all four.

Query capability is the strongest of any family here after relational. You get filtering on any field including nested ones, sorting, ranges, projections that return only the fields you asked for, secondary indexes on arbitrary fields, and an aggregation pipeline that does grouping, joining, and reshaping in stages. That last point matters: modern document stores *can* join. MongoDB's `$lookup` exists. But joins are second-class here — they are a pipeline stage rather than the organizing idea, they perform worst across shards, and a design that leans on them heavily is usually a relational schema wearing a costume.

Where document stores fit: content and catalogs, user profiles, event and activity records, order and booking documents, configuration, anything where a natural aggregate — one thing plus everything that belongs to it — is read and written as a unit. They are the reasonable default when you know you want something document-shaped and you have no other constraint pushing you elsewhere.

Where they hurt: data that is genuinely a many-to-many web of relationships that gets queried from every direction; workloads requiring transactions that span many documents on a routine basis; and reporting that slices the same data forty different ways, which is exactly the case where a fixed relational schema and an ad-hoc query planner earn their keep.

## Key-value stores

A key-value store is the smallest useful database: a distributed hash map. You hand it a key, it hands you a value. Redis, Memcached, Amazon DynamoDB in its simplest configuration, etcd, and Riak all live here.

```text
GET  session:9f3a-77c1   ->  {"userId":331,"role":"admin","expires":1773500000}
GET  cart:cus_331        ->  {"items":[{"sku":"KB-88","qty":1}]}
GET  ratelimit:ip:10.2.4.9 -> 47
```

The value is usually opaque. The store does not parse it, cannot filter on anything inside it, and offers no way to ask "give me every session belonging to user 331" — there is no index but the key. Everything you want to look something up by has to be part of a key you constructed. Key design *is* schema design in this family, which is why you see keys like `session:9f3a-77c1` and `ratelimit:ip:10.2.4.9`: the colon-delimited prefix is a namespace invented by the application, not a feature of the store.

What you buy for that austerity is speed and simplicity. Lookup is one hash operation against one partition on one machine, so latency is low and, crucially, *predictable* — it does not degrade as the dataset grows, because nothing is scanned. Partitioning is trivial, since the key is the partition key by definition, so these stores scale out further and more easily than anything else in this lesson.

Redis complicates the picture in a useful way by making values typed: strings, lists, hashes, sets, sorted sets, streams, bitmaps. A sorted set gives you a leaderboard with a rank query. A list gives you a work queue. A stream gives you an append-only log with consumer groups. These are data structures with server-side operations, which lets you push small pieces of logic — increment this counter, push to this queue, take the top ten — into the store where they become atomic.

Where key-value stores fit: caching in front of a slower store, sessions, feature flags, rate limiting, work queues, leaderboards, service discovery, and anything else identified by a single obvious key and read far more often than it is written. Many key-value stores also offer a TTL per key, so expiring data cleans itself up, which is a small feature that removes an entire category of scheduled-job code.

Where they hurt: any question that starts with "find all the records where…". If you find yourself maintaining hand-built secondary index keys — writing `user:331:sessions` alongside every `session:*` key, and keeping the two in sync from application code — you have started reimplementing a database inside a hash map, and you should stop and pick a different family.

One operational note that catches people: many key-value stores are memory-first. Redis holds the working set in RAM, which is where the speed comes from, and RAM is roughly an order of magnitude more expensive per gigabyte than disk. A cache that grows without bound becomes a budget problem before it becomes a technical one.

## Wide-column stores

Wide-column stores — Apache Cassandra, ScyllaDB, HBase, and Google Bigtable — are the family most often misunderstood, partly because the name suggests something tabular and partly because Cassandra's query language, CQL, looks almost exactly like SQL and is not.

The model is a partitioned, sorted map. Rows are grouped into partitions by a **partition key**. Inside a partition, rows are stored physically sorted by one or more **clustering columns**. Both together form the primary key.

```text
CREATE TABLE sensor_readings (
  sensor_id   text,
  reading_at  timestamp,
  temp_c      double,
  humidity    double,
  PRIMARY KEY ((sensor_id), reading_at)
) WITH CLUSTERING ORDER BY (reading_at DESC);
```

`sensor_id` is the partition key, so every reading for one sensor lives together on the same replicas, sorted newest-first. "Give me the last hundred readings for sensor 44" is then a single sequential scan of contiguous data on one node — about as cheap as a database query gets, and just as cheap when the table holds a trillion rows.

Now the catch, and it is the defining property of the family: **you can only query along the primary key.** "Give me all readings above 40 degrees" requires scanning every partition on every node, and Cassandra will refuse unless you explicitly tell it you meant to do something that expensive. There is no query planner rescuing a query you did not design for. You design the table for the query, and if you have three query patterns you write the same data into three tables. Duplicating data across query-specific tables is not a workaround here; it is the documented, intended practice.

The payoff is a write path with no coordinator and no single leader. Any node can accept a write for any partition it replicates, which makes writes extremely fast and makes the cluster tolerate the loss of nodes without losing the ability to accept writes. Cassandra clusters routinely run across multiple data centers with all of them writable. Replication is tunable per keyspace, and consistency is tunable per query — which is the subject of the next lesson, so hold that thought.

Where wide-column stores fit: time-series and sensor data, event and audit logs, message and activity histories, IoT telemetry, and anything with an enormous, continuous write volume and a small, known set of read patterns that are always anchored to a natural partition key.

Where they hurt: unpredictable or exploratory queries, anything needing joins or aggregates across partitions, and small datasets — a three-node Cassandra cluster to hold two gigabytes is a lot of operational surface area for no benefit. They also punish bad partition-key choices harder than any other family: a key with too few distinct values creates hot partitions that pin all the traffic to one node, and a key with unbounded rows per partition creates partitions that grow until they cannot be read.

## Graph databases

A graph database stores nodes, the edges between them, and properties on both. Neo4j is the reference implementation; Amazon Neptune, ArangoDB, and Memgraph are alternatives.

```text
(dana:Person {name:"Dana Okafor"})-[:PLACED {at:"2026-03-14"}]->(o:Order {id:"ord_10482"})
(o)-[:CONTAINS {qty:1}]->(kb:Product {sku:"KB-88"})
(dana)-[:FOLLOWS]->(sam:Person {name:"Sam Ruiz"})
(sam)-[:REVIEWED {stars:5}]->(kb)
```

The relationship is a stored object with its own type and its own properties, not a foreign key you infer at query time. That is the entire point. In a relational schema, traversing from Dana to the products reviewed by people Dana follows means a self-join on the follow table, a join to reviews, a join to products — three joins, each one a set operation the planner has to size and execute. Add another degree of separation and you add another join; the cost climbs with the size of the tables involved.

In a graph database, each node holds direct pointers to its edges, so a traversal walks from one node to its neighbours in constant time per hop. The cost of a traversal scales with the size of the *result*, not the size of the database. This property is called index-free adjacency and it is why graph databases hold up at four, five, and six hops where a relational query has long since become unusable.

Query languages are traversal-shaped rather than set-shaped. Cypher, the most common, reads like ASCII art of the pattern you want:

```text
MATCH (me:Person {name:"Dana Okafor"})-[:FOLLOWS*1..3]->(peer)-[r:REVIEWED]->(p:Product)
WHERE r.stars >= 4 AND NOT (me)-[:PLACED]->(:Order)-[:CONTAINS]->(p)
RETURN p.sku, count(*) AS endorsements
ORDER BY endorsements DESC LIMIT 10
```

`[:FOLLOWS*1..3]` is a variable-length traversal of one to three hops. Expressing that in SQL requires a recursive common table expression that most developers cannot write from memory and no reviewer enjoys reading.

Where graph databases fit: social graphs and recommendations, fraud-ring detection, network and infrastructure topology, permission and org hierarchies, supply chains, knowledge graphs, and anything where the questions are about paths, reachability, and connection strength rather than about aggregates of rows.

Where they hurt: bulk analytics over all nodes of a type, very high write throughput, and — importantly — any domain where the relationships are shallow. If your deepest question is one join deep, you do not have a graph problem, you have a relational schema and a fashionable instinct. Graph databases are also the hardest of these four to staff for; a team that has never used Cypher is a real project cost.

![The same customer order represented four ways: as one nested document, as an opaque value under a composite key, as partition-keyed rows in a wide-column table, and as nodes and edges in a graph](./img/nosql-families-same-data.png)

## Comparing feature sets rather than names

Product names change and vendors add features across family lines. What stays stable is the set of dimensions you compare along. When you evaluate any store — in this course, and in a design review three years from now — walk these seven.

**Data model.** What is the unit you read and write? A row, a document, an opaque blob, a partition of sorted rows, a node? Everything else follows from this, because it determines what an atomic operation can cover.

**Query capability.** Can you filter on arbitrary fields, or only on the key? Can you aggregate server-side? Can you join, and at what cost? Is there a planner making decisions for you, or must every query correspond to a structure you built deliberately?

**Indexing.** Are secondary indexes supported? Are they consistent with the data at write time or updated asynchronously? Every index you add is a tax on every write, in every family.

**Transaction scope.** How much can one atomic operation cover? A single document or key is the common floor. Modern MongoDB supports multi-document transactions across a replica set; DynamoDB supports bounded transactional writes; Cassandra offers only lightweight per-partition compare-and-set. The relational answer — arbitrary transactions across arbitrary tables — is the outlier, not the norm.

**Consistency and replication.** How many copies, where, and what do you see if you read immediately after writing? This is where the interesting money is, and it is the whole of the next lesson.

**Scaling model.** Scale up or scale out? Is partitioning automatic or something you configure? What happens when you need to change the partition key later — and the honest answer is usually "you rewrite the data."

**Operational cost.** Who runs it? Managed service or your own cluster? What does it cost at your data volume, and what does it cost at ten times your data volume? How hard is it to hire someone who knows it? This dimension gets skipped in technical arguments and then decides the outcome anyway, which is why the closing project of this course asks you to price it explicitly.

## Multi-model stores, and why the boundaries blur

The four families are a map, not a set of walls. Postgres with `jsonb` gives you document storage, GIN indexes into nested fields, and full transactional guarantees over the whole thing — and for a great many "we need a document store" cases it is the correct answer, because you keep joins and constraints and add flexibility on top. Redis has added JSON and search modules. MongoDB has joins and transactions. ArangoDB markets document, key-value, and graph in one engine. DynamoDB is a key-value store that grew a document model and secondary indexes.

Two consequences for you. First, do not choose a family and then look for a product; describe your workload and evaluate candidates on the seven dimensions above, and let the family fall out of that. Second, be suspicious of the multi-model pitch. A store that does three things is rarely as good at any one of them as the specialist, and "we can do it all in one system" is a real operational benefit that has to be weighed against being second-best at your primary workload — not assumed to win.

The last thing to keep hold of: relational is still the default for a reason. It is the only family here that gives you enforced constraints, arbitrary joins, and broad transactions at the same time, and most applications are not large enough for the restrictions of the other four to buy them anything. Reach for a NoSQL store when you can name the specific property you need — scale-out writes, schema flexibility, sub-millisecond key lookups, deep traversal — and name what you are giving up to get it. "It's more modern" is not a property.

## Practice

Work on paper or in a text file. No database installation is needed for this lesson.

1. Take the `orders` / `order_lines` / `customers` / `products` schema you built in db100 and write out how the same single order would be represented in each of the four families: one document, one key-value entry with the key you would choose, a wide-column table definition with its primary key, and a set of nodes and edges. Keep them side by side.
2. For each of the four, write the one query it makes cheap and the one query it makes painful.
3. For each of the following workloads, name the family you would start from and write two sentences of justification. Name the property you are buying and the property you are giving up.
   - A dashboard showing the last 24 hours of readings from 50,000 temperature sensors, with new readings arriving every ten seconds.
   - Shopping carts for an e-commerce site, discarded after 30 days of inactivity.
   - A recipe site where each recipe has ingredients, steps, photos, and tags, and editors add new fields to the recipe format every few months.
   - "People who bought this also bought" recommendations on that same e-commerce site.
   - The financial ledger recording payments for that same site.
4. One of the five above is a trap: the correct answer is the relational database you already know. Identify it and explain what a NoSQL store would cost you there.
5. Pick any two stores from different families — for example Redis and Cassandra — and fill in a comparison table with a row for each of the seven dimensions in this lesson. Use the vendors' own documentation, and cite the page you got each answer from.
6. Write a short paragraph on this claim: "We should use MongoDB because we don't want to write migrations." State what is true in it and what it is hiding.

**Deliverable:** a `nosql-families.md` file holding the four representations from step 1, your workload table from steps 3 and 4, the seven-dimension comparison from step 5, and the paragraph from step 6.
