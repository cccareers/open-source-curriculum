---
lesson_id: db200-04
course_id: db200
pathway: software-developer
title: Modeling for Access Patterns
order: 4
kind: lesson
competency_ids:
  - D5-S1-C02
objectives:
  - Model data around an application's access patterns
---

## The method inverts

In db100 you modeled a domain by describing the world. You found the entities, gave each one a table, gave each table a primary key, connected them with foreign keys, and normalized until every fact was stored exactly once. The queries came afterwards, and that was fine, because a relational engine can join anything to anything at runtime. A good normalized schema answers questions its designer never anticipated.

That method is correct for relational and actively harmful for most NoSQL stores, because the thing that made it work — cheap, arbitrary, runtime joins — is the thing these stores gave up. A document store can join, but the operation is expensive and gets worse across shards. A wide-column store barely can. A key-value store cannot at all.

So the method inverts. **You write down the queries first, and then design the storage that answers them.** The design question stops being "what is true about this domain?" and becomes "what does this application ask, how often, and what must come back in one round trip?"

The first artifact is therefore not a diagram. It is a list. For a community events board — the same domain you served over HTTP in node101 — the list might read:

```text
AP1  Show one event's detail page: title, description, venue, time, host name,
     and the first 20 attendees.                       ~2,000/day   read
AP2  List upcoming events in a city, newest first, 20 per page.  ~9,000/day  read
AP3  Show one user's profile: name, bio, and the events they host.  ~800/day  read
AP4  Register the current user as an attendee of an event.        ~600/day   write
AP5  Show "my upcoming events" for the signed-in user.          ~4,000/day   read
AP6  Host edits an event's title, description, or time.            ~50/day   write
AP7  Monthly report: attendance totals per venue.                   ~1/month read
```

Four columns, and each earns its place. **What is asked**, because a vague access pattern produces a vague model. **What must come back together**, because that determines what gets stored together. **How often**, because a pattern running nine thousand times a day deserves a purpose-built shape and one running monthly does not. **Read or write**, because every optimization for reads is usually paid for on the write path.

Get this list from the product owner, the API surface, or the screens. If you cannot produce it, you are not ready to model, and saying so is a legitimate design contribution — it is precisely the kind of "help identify what we need" work that design support means.

## Embed or reference

Once you have the list, nearly every document-modeling decision reduces to one recurring question: does this related data live **inside** the parent document, or in its own document referenced by id?

Embedded, an event carries its venue and its attendees:

```json
{
  "_id": "evt_5512",
  "title": "Intro to Soldering",
  "startsAt": "2026-08-09T18:00:00Z",
  "city": "oakland",
  "venue": { "name": "Maker Space", "address": "412 7th St", "capacity": 40 },
  "host": { "userId": "usr_88", "name": "Sam Ruiz" },
  "attendees": [
    { "userId": "usr_12", "name": "Dana Okafor", "rsvpAt": "2026-07-20T11:02:00Z" },
    { "userId": "usr_44", "name": "Lee Park", "rsvpAt": "2026-07-21T09:41:00Z" }
  ]
}
```

Referenced, they are separate documents joined by the application or a pipeline stage:

```json
{
  "_id": "evt_5512",
  "title": "Intro to Soldering",
  "startsAt": "2026-08-09T18:00:00Z",
  "city": "oakland",
  "venueId": "ven_9",
  "hostId": "usr_88"
}
```

```json
{ "_id": "rsvp_77201", "eventId": "evt_5512", "userId": "usr_12", "rsvpAt": "2026-07-20T11:02:00Z" }
```

Neither is right in general. Six questions decide it, and they decide it per relationship, not per collection.

**Is it read together?** If every read of the parent needs the child, embedding turns two reads into one. AP1 always wants the venue, so the venue belongs in the event.

**Is it read separately?** If the child is also read on its own — a venue page listing all events at that venue — embedding alone forces you to search inside other documents to find it. That usually means the child needs its own document too, whether or not a copy is also embedded.

**What is the cardinality?** One-to-few (an event has one venue, a user has three addresses) embeds comfortably. One-to-many with a known ceiling (an event has at most a few hundred attendees) can embed with care. One-to-unbounded (a popular user's followers, an event's chat messages, a sensor's readings) must never embed, because the array grows forever and every read of the parent drags the whole thing along.

**How often does the child change relative to the parent?** Embedded data is rewritten with the parent. A field updated on every page view does not belong inside a document that is otherwise written once a month.

**Does it need to change atomically with the parent?** A single-document write is atomic in every document store, for free. If two facts must never be observed out of step, putting them in one document is the cheapest correctness guarantee available to you. Splitting them means either a multi-document transaction — supported, but not free — or accepting that readers will sometimes see one without the other.

**How big does it get?** MongoDB caps a document at 16MB, and every document store has some limit. Long before you reach it, a large document is slow, because these stores read and write whole documents; growing an array by one element can rewrite the entire record and, if it no longer fits in place, move it on disk.

The default that serves most teams: **embed one-to-few and data read with the parent; reference one-to-many, anything unbounded, and anything with its own life.** Applied to the events board, the venue and host summary embed, and attendees do not — because AP5 ("my upcoming events") asks the question from the user's side, and an attendee list buried inside event documents cannot answer it efficiently.

![A one-to-many relationship modeled two ways: children embedded as an array inside the parent document, and children as separate documents holding a reference to the parent's id](./img/embed-vs-reference.png)

## Duplicating data on purpose

Here is the part that will feel wrong for a while. Normalization taught you that a fact should be stored once, so that updating it updates it everywhere. Document modeling routinely stores facts more than once, deliberately.

Look at that embedded host: `{ "userId": "usr_88", "name": "Sam Ruiz" }`. The name is duplicated from the user document. If Sam changes their display name, every event Sam hosts now shows the old one.

That is not an oversight, it is a priced trade. You bought a much cheaper AP1 — no second lookup on the busiest read in the application — and you paid for it with a fan-out update on a rare write, plus a window of inconsistency. Before you accept the trade, answer three questions:

**Does staleness actually harm anyone?** Some duplicated data must be stale. The customer name on a completed order is not a copy of the current customer record; it is the name at the time of purchase, and updating it would be a bug. This category — a historical snapshot — is not denormalization at all and needs no fan-out.

**How expensive is the fan-out?** Updating a display name across the 40 events a person hosts is trivial. Updating a product name across four million order line items is a background job with progress tracking, and you should know which one you are signing up for before you embed.

**How stale can it be?** If the correction can land seconds or minutes later, a queued background job is fine. If it must be immediate, you need a transaction or you need to reference instead.

Two disciplines make duplication survivable. First, **write down which copy is authoritative.** One collection owns each fact; the others hold caches of it. The rule belongs in the schema documentation you learned to write in db100, because the next developer cannot infer it. Second, **embed the smallest useful subset.** Copy the host's `name` because the detail page shows it; do not copy their bio, their email, and their notification preferences, because every one of those is another thing to keep in sync for no read benefit.

## Patterns worth knowing by name

These recur so often they have names, and using the names makes design reviews faster.

**Extended reference.** Store the id *and* the two or three fields you always display alongside it. This is the `host` object above. It is the middle road between embed and reference, and it is the most common pattern in real document schemas.

**Subset.** Embed the first N children and keep the full set in its own collection. An event embeds its ten most recent attendees for the detail page and stores all four hundred as separate documents for the full list. The common read is one document; the rare read pays for a second query. This is how you get most of the benefit of embedding without the unbounded-array problem.

```json
{
  "_id": "evt_5512",
  "title": "Intro to Soldering",
  "attendeeCount": 412,
  "recentAttendees": [
    { "userId": "usr_12", "name": "Dana Okafor" },
    { "userId": "usr_44", "name": "Lee Park" }
  ]
}
```

**Computed.** Store the answer, not the ingredients. `attendeeCount` above is computed at write time rather than counted at read time. When a value is read far more often than the data behind it changes, computing on write is nearly always right — and it is the same instinct as a materialized view, which you have already met.

**Bucket.** Group many small time-ordered records into one document per interval instead of one per record. A thousand sensor readings become one document per sensor per hour. Fewer, larger documents mean fewer index entries and far less per-document overhead, at the cost of more complex writes.

**Polymorphic.** Keep related-but-different things in one collection with a discriminator field, so one query returns all of them. A `notifications` collection holding `type: "rsvp"`, `type: "cancellation"`, and `type: "reminder"` documents with different bodies is easier to query for "my notification feed" than three collections would be.

**Outlier.** Design for the normal case and flag the exceptions. Most events have under fifty attendees and embed fine; three events have eight thousand. Give those documents a `hasOverflow: true` flag and store the excess elsewhere, rather than distorting the model for every document to accommodate three.

## Indexes are part of the model

A document store's default index is on `_id` and nothing else. Every other query you listed scans the collection unless you build an index for it, so the index list is not an afterthought or a performance-tuning exercise you do later — it is part of the design artifact, written at the same time as the document shapes.

For the events board, AP2 filters on `city` and `startsAt` and sorts by `startsAt`:

```json
{ "city": 1, "startsAt": -1 }
```

Three rules govern compound indexes, and they are the same rules in every store that has them.

**Prefix.** A compound index on `{ city, startsAt }` serves queries on `city` alone, and on `city` plus `startsAt`. It does **not** serve a query on `startsAt` alone. The order of fields in the index is not decoration.

**Equality, sort, range — in that order.** Fields matched exactly go first, then fields you sort by, then fields matched as a range. `{ city: "oakland", startsAt: { $gt: <now> } }` sorted by `startsAt` is served perfectly by `{ city: 1, startsAt: -1 }` because `city` is equality and `startsAt` does double duty as sort and range.

**Every index taxes every write.** An index is a second structure that has to be updated whenever the indexed field changes. Five indexes on a collection means an insert does six writes. Indexes also consume memory, and an index that does not fit in memory stops helping. Build the ones your access patterns require and delete the ones nothing uses.

Two more index facts that specifically matter in document stores. **Multikey indexes** index every element of an array, so `{ "tags": 1 }` on a document with three tags produces three index entries — powerful, and a reason to keep indexed arrays small. And **TTL indexes** delete documents automatically once a date field passes, which is the cleanest way to expire sessions, drafts, or old telemetry without writing a cleanup job.

## Keys and partitions in the other families

The same "design for the query" method applies outside document stores; only the vocabulary changes.

In a **key-value** store, the key *is* the model. Every access pattern must correspond to a key you can construct from what the caller already knows. `cart:cus_331`, `session:9f3a-77c1`, `event:evt_5512:attendee_count` — the prefix conventions are your schema, and they should be documented as one. If an access pattern needs a value you cannot build a key for, that pattern does not belong in this store.

In a **wide-column** store, the partition key and clustering columns are the model, and the choice carries operational weight. Pick a partition key with high cardinality so data spreads evenly, with bounded rows per partition so no single partition grows without limit, and with enough selectivity that your reads touch one partition rather than all of them. `PRIMARY KEY ((sensor_id), reading_at)` satisfies all three; `PRIMARY KEY ((country), reading_at)` fails the first two badly, because one country will hold most of your data and that partition will grow forever. When a partition key satisfies one query pattern and not another, you write the data to a second table shaped for the second pattern.

Across all three families, one warning carries: **the partition or shard key is the hardest thing to change later.** Adding a field is easy. Changing what data is grouped with what data means rewriting every record, usually with a dual-write period and a backfill. Spend disproportionate design time on it.

## Handling change

Because the engine does not enforce a schema, you will accumulate document versions. Plan for it rather than discovering it.

Put a `schemaVersion` on documents whose shape you expect to evolve. It costs one small field and turns "what shape is this?" from a guess into a read.

Then choose a migration strategy per change. **Migrate on read** — application handles all versions, upgrading each document as it is written — costs nothing up front and leaves you supporting old shapes indefinitely. **Migrate in the background** — a job walks the collection converting documents — clears the debt, and the application must handle both shapes while it runs. **Migrate all at once** requires a maintenance window and is only viable for small collections. Whichever you pick, write it down, because the failure mode is a codebase that quietly handles four generations of a field that nobody can explain.

Most stores also offer optional schema validation — MongoDB accepts a JSON Schema per collection and will reject documents that violate it. Turning that on for your core collections gives back much of what you gave up when you left Postgres, and costs you almost none of the flexibility, because you write the rules and you can relax them.

## Putting it together

A finished data-model artifact — the thing you hand to a reviewer, and the thing the closing project asks for — has five parts:

1. The access-pattern list, with frequency and read/write for each.
2. The collections or tables, with one example document or row per collection showing realistic data.
3. Every embed-versus-reference decision, with the reason in one sentence.
4. Every duplicated field, naming the authoritative source and the update strategy.
5. The index list, with the access pattern each index serves.

Then check it: walk each access pattern and count the round trips it costs. Any high-frequency pattern that needs more than one or two is a design smell, and the fix is nearly always to move data together rather than to add an index.

If you cannot make a set of access patterns cheap without contorting the model — if you keep needing joins in every direction, or every write fans out to six collections — that is real evidence, and the right response is not a cleverer document shape. It is to report that this workload looks relational, which is a finding, not a failure.

## Practice

Use the community events board domain. No database is required; the deliverable is a design document.

1. Write the access-pattern list for the board, starting from AP1 through AP7 in this lesson and adding at least three of your own — include at least one write-heavy pattern and one reporting pattern. Give each an estimated frequency and mark it read or write.
2. Design the document collections. For every relationship (event to venue, event to host, event to attendees, user to hosted events), state embed or reference and give the one-sentence reason, citing which access pattern drove it.
3. Write one realistic example document per collection, with plausible values rather than placeholders.
4. List every field you duplicated across collections. For each, name the authoritative source, say what happens when it changes, and state how stale it is allowed to be.
5. Write the index list. For each index give the field order and the access patterns it serves, then verify each against the equality-sort-range rule. Identify any access pattern that no index serves and either add one or explain why a scan is acceptable.
6. Walk every access pattern and record the number of round trips it costs in your design. Flag anything above two on a high-frequency pattern and propose a fix.
7. AP7 — monthly attendance totals per venue — is the pattern most likely to fight your design. Write a paragraph on how you would serve it: a slow aggregation on demand, a computed field maintained on write, or a separate reporting store. Justify the choice on the frequency you assigned it.
8. Now change a requirement: events can be recurring, with each occurrence having its own attendee list, and a series can run for years. Revise the model, and write a short note describing what you changed and why the original shape no longer worked.
9. Take the same access-pattern list and sketch, in about half a page, how you would model AP2 and AP5 in a wide-column store. Name the partition key and clustering columns for each, and say why you needed two tables.

**Deliverable:** a `data-model.md` file containing the five-part artifact from the "Putting it together" section, plus your answers to steps 6 through 9.
