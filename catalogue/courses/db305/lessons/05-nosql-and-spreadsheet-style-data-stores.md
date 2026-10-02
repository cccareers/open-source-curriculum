---
lesson_id: db305-05
course_id: db305
pathway: prompt-engineer
title: NoSQL and Spreadsheet-Style Data Stores
order: 5
kind: lesson
competency_ids:
  - D5-S1-C02
objectives:
  - Build an AI workflow against a NoSQL or spreadsheet-style store and explain
    when that model is the better fit
---

## Two families that are not tables

"NoSQL" is a bad name for a real thing. It covers every store that does not organize data as fixed-column tables joined by keys. Two of those families show up constantly in AI workflows, and a prompt engineer should be fluent in both.

**Document stores.** Data is stored as self-contained JSON-like documents in collections. Each document carries its own structure. Several hosted document databases exist, plus document features inside otherwise-relational databases; the model below is common to all of them.

**Spreadsheet-style stores** — Airtable, and the built-in data tables inside Zapier, Make, n8n, and Softr. Data looks like a grid, humans edit it directly in a browser, and the store publishes an API so a workflow can read and write the same records.

The third family, in-memory key-value stores, you will meet as a cache rather than as a data source, and it is out of scope here.

What unites both families for your purposes is that **the store enforces much less than a relational database does**. That is the whole trade: you gain flexibility and speed of setup, and you take on the enforcement yourself.

## Document stores: one record, whole

In the relational lesson an order lived in three tables. In a document store it is one document:

```json
{
  "_id": "ORD-1041",
  "customer": { "id": "C-88", "name": "Reyes Freight", "region": "UK" },
  "placed_at": "2026-03-11T14:05:00Z",
  "status": "confirmed",
  "total": 881.0,
  "line_items": [
    { "sku": "PAL-STD", "qty": 4, "unit_price": 210.5 },
    { "sku": "SURCHARGE-FUEL", "qty": 1, "unit_price": 39.0 }
  ],
  "notes": [
    {
      "text": "Driver must call ahead. Gate code changed last week.",
      "extracted": { "call_ahead": true, "access_code": null, "confidence": 0.82 },
      "extracted_at": "2026-03-11T14:07:11Z",
      "model": "extractor-v3"
    }
  ]
}
```

Three properties of that document explain the whole family.

**Nesting is native.** `line_items` and `notes` are arrays inside the record. In a relational store they are separate tables and a join. Here, one read returns everything about the order.

**The schema is per-document.** The next order might have no `notes` key at all, or a `customer` object with an extra `vat_id`, or a `line_items` entry with a `discount` field the others lack. Nothing rejects it.

**Data is duplicated on purpose.** The customer's name is copied into every order. Relational people call that denormalization and flinch; here it is the point, because it means the read needs no join. The cost is that a customer rename does not propagate — you either accept the copy as a snapshot of the name at order time, which is often correct, or you write an update across every affected document.

That last trade is the whole design conversation in one sentence, and you should be able to state which side you are on for any field you duplicate.

## Querying documents

Where SQL is a language, most document stores take a filter object. The concepts map closely.

```json
{
  "status": "confirmed",
  "placed_at": { "$gte": "2026-03-01T00:00:00Z" },
  "customer.region": "UK",
  "total": { "$gt": 500 }
}
```

That is the `where` clause. Note `"customer.region"` — dotted paths reach into nested objects, which SQL cannot do without a join. Querying inside an array works too:

```json
{ "line_items.sku": "SURCHARGE-FUEL" }
```

This matches any document where at least one line item has that SKU. Convenient, and a common source of confusion: a match on the array does not tell you *which* element matched.

Alongside the filter you supply projection, sort, and limit — the same three concerns as SQL, expressed as options rather than clauses:

```json
{
  "filter": { "status": "confirmed" },
  "projection": { "_id": 1, "total": 1, "customer.name": 1 },
  "sort": { "placed_at": -1 },
  "limit": 100
}
```

Writes follow the same shape. An update names the document and the change:

```json
{
  "filter": { "_id": "ORD-1041" },
  "update": { "$set": { "status": "shipped", "shipped_at": "2026-03-12T09:00:00Z" } },
  "upsert": true
}
```

`upsert: true` is the same idempotency tool you used in SQL: insert if absent, update if present. Use it for the same reason — workflow steps get retried.

The habits from the SQL lesson carry over unchanged. Bound every query with a limit. Project only the fields you need, because documents can be large. Filter in the store, not in the workflow. And never build a filter by pasting text together — pass the value into the filter object as a value, so a string containing store syntax stays a string.

Two behaviours differ enough from SQL to catch you out. **A filter on a missing field is not the same as a filter on a null field**: `{ "region": null }` matches documents where `region` is null *and*, in several stores, documents where `region` is absent entirely, which are different situations you may need to distinguish. And **document stores usually index nothing you did not ask them to index**, so a filter on a field with no index scans every document in the collection. That is invisible at a thousand documents and fatal at a million. Ask whoever owns the store which fields are indexed and filter on those; if your workflow needs a filter on an unindexed field, that is a request to make rather than a query to force through.

Pagination follows the API lesson exactly — a page size plus a cursor or continuation token in the response. Page it, write each page to staging as it arrives, and keep the three loop guards.

## Spreadsheet-style stores: Airtable's model

Airtable is the one to learn properly, because it is the store this pathway's earlier courses lean on and the one you will meet in real engagements. Its vocabulary:

- A **base** is the database.
- A **table** is a collection of records.
- A **field** is a column, and unlike a spreadsheet it has a real type: single line text, long text, number, date, checkbox, single select, multiple select, attachment, formula, and — importantly — **linked record**.
- A **record** has a system id like `recX9d2Kp1QaBz`, which is the id your workflow should key on. Never key on a row position or a name.
- A **view** is a saved filter and sort over a table. Views are how you hand a workflow a subset without writing a filter, and how a human sees a queue.

A linked-record field is Airtable's answer to a foreign key: an `Orders` record can link to a `Customers` record, and the linked field stores an array of record ids. It gives you relationships without joins, but only one hop at a time — following two links means two API calls.

The reason teams choose this family is not technical. It is that a non-technical colleague can open the base, see the data, fix a typo, and add a column, all without asking anybody. That is a genuine advantage, and it is also the source of the failure mode: the same colleague can rename a field, and your workflow, which addresses fields by name, stops.

## Working with the Airtable API

Reads look like this:

```http
GET /v0/appA1b2C3d4E5f6G7/Orders?pageSize=100&view=Needs%20Extraction HTTP/1.1
Host: api.airtable.com
Authorization: Bearer patXXXXXXXXXXXXXX
```

The response is cursor-paginated, exactly the pattern from the API lesson:

```json
{
  "records": [
    {
      "id": "recX9d2Kp1QaBz",
      "createdTime": "2026-03-11T14:05:00.000Z",
      "fields": {
        "Order ID": "ORD-1041",
        "Status": "Confirmed",
        "Total": 881,
        "Customer": ["recQ7pLm3Nb0Xy"],
        "Customer Note": "Driver must call ahead. Gate code changed last week."
      }
    }
  ],
  "offset": "itrABC123/recX9d2Kp1QaBz"
}
```

Pass `offset` back to get the next page; when the response has no `offset`, you have reached the end. Two details that catch people out: **empty fields are absent from `fields` entirely**, not present as null, so your reads must tolerate a missing key; and field names in the API are the human-readable names with their spaces and capitals, which is why a rename breaks things.

Filtering server-side uses a formula:

```http
GET /v0/appA1b2C3d4E5f6G7/Orders?filterByFormula=AND({Status}='Confirmed',{Extracted}=BLANK())
```

Prefer a **view** to a hand-written formula when you can. The view lives in the base where a human can see and adjust it, and it keeps a fragile formula string out of your workflow configuration.

Writes are batched, up to ten records per request:

```http
PATCH /v0/appA1b2C3d4E5f6G7/Orders HTTP/1.1
Authorization: Bearer patXXXXXXXXXXXXXX
Content-Type: application/json

{
  "records": [
    { "id": "recX9d2Kp1QaBz",
      "fields": { "Call Ahead": true, "Extraction Confidence": 0.82 } },
    { "id": "recM4nQ8rTs2Vw",
      "fields": { "Call Ahead": false, "Extraction Confidence": 0.91 } }
  ]
}
```

Batching matters because the API is rate limited at a handful of requests per second per base. Writing 400 records one at a time will be throttled; writing them in batches of ten will not. The backoff discipline from the API lesson applies here unchanged — read the limit, pace yourself, honour the retry signal.

Three more operational notes. A single-select field rejects a value that is not already one of its options unless you explicitly allow creation, so a model that invents a category will fail the write — which is a feature. Formula and rollup fields are computed by Airtable and cannot be written by your workflow. And attachments are URLs, so a file arrives as a link you must fetch, not as bytes in the response.

## What you gave up

Be honest about the trade, in both families:

| Capability | Relational | Document | Spreadsheet-style |
| --- | --- | --- | --- |
| Enforced column types | Yes | Rarely | Yes, per field |
| Required fields, ranges, cross-field rules | Yes | No | Barely |
| Multi-table joins in one query | Yes | No | No |
| Aggregations across the whole dataset | Yes | Limited | Weak |
| Multi-record transactions | Yes | Limited | No |
| Schema flexibility per record | No | Yes | Moderate |
| A non-technical human can edit it | No | No | Yes |
| Comfortable scale for a workflow | Millions | Millions | Tens of thousands |

Two rows deserve emphasis. **No joins** means the relationships you would have expressed once in a query become either duplication at write time or several sequential reads at run time — plan which. **No constraints** means every rule the relational database would have enforced now has to live in your workflow, before the write. That is not optional work you skipped; it is work that moved, and lesson 06 is where you pick it up.

## Choosing between them

Answer these six questions about the data, not about your preferences.

1. **Do humans need to see and edit the records directly?** Yes strongly favours spreadsheet-style.
2. **How variable is the record shape?** Highly variable, or evolving weekly, favours documents. Uniform favours relational.
3. **Do you need to ask cross-cutting analytical questions?** "Revenue by region by month" is relational work.
4. **How much data, and how fast is it growing?** Tens of thousands of records is comfortable for a base; hundreds of thousands is not.
5. **How strict must correctness be?** Money, entitlements, and anything audited want a store that refuses bad writes.
6. **How many relationships must be traversed at once?** Two or more hops in a single question is a strong relational signal.

A representative answer: an internal review queue with 4,000 records that three coordinators work in daily belongs in Airtable, even though a relational database would be technically superior — the visibility to the humans is the requirement. A ledger of 900,000 invoice lines that finance reconciles monthly does not, no matter how much easier the base was to set up.

Mixed answers usually mean mixed stores. It is entirely normal to keep the system of record in a relational database and expose a filtered working queue in a base that people operate in, with a workflow syncing between them on the record id.

The signals that a spreadsheet-style store has outgrown itself are worth knowing before you meet them: views that take seconds to load, formulas nobody can explain, a "temporary" second base holding overflow, workflows timing out on pagination, and duplicate records that the store has no way to reject. When two or more of those are true, the conversation is about migration, not about another formula.

## Practice

Model the same small dataset twice and build a workflow against each.

1. **Pick a dataset** of at least 200 records with one nested or repeating element — orders with line items, tickets with comments, applications with attachments.
2. **Build the document version.** Design the document shape, load the data, and write down for each duplicated field whether it is a snapshot or needs propagating on change.
3. **Build the base version.** Create the equivalent Airtable base with correctly typed fields, a linked-record relationship, and a view named for the workflow that will consume it.
4. **Query both.** Write the same three questions against each store: one filtered list, one nested-condition query ("orders containing a specific SKU"), and one count grouped by a category. Record the effort and the result for each store, including anything you could not do.
5. **Build the AI step.** Read unextracted records from each store, run one extraction, and write the structured fields back — upsert in the document store, batched `PATCH` of ten in the base. Run each twice and prove no duplicates were created.
6. **Hit a limit on purpose.** Write 200 records to the base one request at a time until you are throttled, then rewrite it batched with pacing and compare the elapsed time and the error count.
7. **Break a field name.** Rename one Airtable field a workflow reads and observe exactly how the failure presents. Then add a check that fails the run loudly instead of writing a null.
8. **Write the fit memo.** One page: which store you would put this dataset in, answering all six questions, and the two conditions that would make you change your mind.
