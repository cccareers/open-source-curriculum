---
lesson_id: db305-02
course_id: db305
pathway: prompt-engineer
title: Structured and Unstructured Data for AI
order: 2
kind: lesson
competency_ids:
  - D5-S1-C01
objectives:
  - Work with structured and unstructured sources in an AI workflow and choose
    the right handling for each
---

## Three shapes, not two

People say "structured and unstructured data" as if there were a clean line. In practice your workflow will meet three shapes, and the middle one is where most of your time goes.

**Structured** data has a fixed set of named fields, every record has the same fields, and a machine can address any value without guessing. A database table, a well-formed CSV export, an Airtable base. You can filter, sort, and total it with no interpretation at all.

**Semi-structured** data has names and nesting but no guarantee of uniformity. A JSON API response where `shipping_address` is present on some orders and absent on others, where `line_items` is an array of variable length, where a field is sometimes a string and sometimes a number. It is machine-readable but not machine-predictable.

**Unstructured** data has no addressable fields at all. An email body, a scanned invoice, a support call transcript, a PDF contract, a photo of a delivery note. The meaning is there; nothing has labelled it.

The whole discipline of this lesson is one sentence: **know which shape a source is before you decide how to handle it, because the handling costs differ by an order of magnitude.**

## What each shape costs

| Shape | How you read a field | Cost per record | Failure mode |
| --- | --- | --- | --- |
| Structured | Direct column or field reference | Effectively zero | Schema changed under you |
| Semi-structured | Path expression plus a null check per level | Near zero, plus your attention | Missing key, type flip, empty array |
| Unstructured | A model reads it and returns fields | Tokens, latency, and a nonzero error rate | Hallucinated field, wrong extraction, silently plausible output |

That table is the reason for the most important rule in the course: **never send structured data to a model to do work a filter could do.** If the field already exists, read the field. A model asked to "find all orders over $500 in this CSV" will be slower, more expensive, and less correct than a `WHERE` clause or a filter step — and it will be wrong in a way that looks right.

The model's job is the third row of the table only: turning unstructured input into structured output. Everything after that is ordinary data work.

## Structured sources: read the field, watch the export

Structured sources are the easy case, with two traps worth naming.

The first is CSV. A CSV file is a structured source with no type information whatsoever. Every value arrives as text, and the exporter that produced it made decisions you did not see.

```csv
order_id,customer,ordered_at,total,notes
1041,"Reyes, Dana",2026-03-11,"1,240.00","Deliver after 5pm"
1042,"Okafor Ltd",03/11/2026,$980,"Left ""at gate"" per customer"
1043,"Chen & Co",2026-03-12,,
```

Four defects in three rows. `ordered_at` uses two different formats, and `03/11/2026` does not tell you whether it is March or November. `total` is a currency string in one row and a comma-grouped string in another, so a numeric comparison on it is meaningless. `customer` contains commas and escaped quotes, so a naive split on `,` shreds the file. Row 1043 has an empty `total` — is that zero, or unknown?

Two habits fix most of it. Parse CSV with a real CSV parser or your platform's CSV step, never by splitting on commas. And treat every CSV column as text until you have explicitly converted it, recording what you converted it to. You will formalize those conversions in lesson 06; here it is enough to notice that they are needed.

The second trap is the assumption that structured means stable. Structured sources change: a column gets renamed, a system adds a field, someone changes an export template. Your workflow should read a named field, never a column position — `row.total`, not `row[3]` — and should notice when a field it expects is absent instead of quietly reading `undefined`.

Also fix your encoding expectations. Sources should be UTF-8. When `café` arrives as `cafÃ©` you are reading a UTF-8 file as something else, and the fix is at the read step, not a find-and-replace later.

## Semi-structured: paths, nulls, and shapes that move

Most API responses are semi-structured. Here is a realistic one:

```json
{
  "order_id": "1041",
  "placed_at": "2026-03-11T14:05:00Z",
  "customer": { "id": "C-88", "name": "Reyes Freight", "vat_id": null },
  "shipping_address": {
    "line1": "14 Dock Road",
    "line2": "",
    "city": "Bristol",
    "postcode": "BS1 4RN"
  },
  "line_items": [
    { "sku": "PAL-STD", "qty": 4, "unit_price": 210.5 },
    { "sku": "SURCHARGE-FUEL", "qty": 1, "unit_price": 39.0 }
  ],
  "total": 881.0,
  "customer_note": "Driver must call ahead. Gate code changed last week."
}
```

You reach values by path: `customer.name`, `shipping_address.postcode`, `line_items[0].sku`. Three things will break that.

**A missing level.** If a walk-in order has no `customer` object, `customer.name` does not return empty — in many platforms it throws, and the whole run fails on record 4,000 of 5,000. Check each level, or use your platform's safe-navigation operator, and decide what a missing value means before it happens.

**A type that moves.** `qty` arrives as `4` on one record and `"4"` on the next because two different upstream systems write to the same endpoint. Comparisons then behave differently per record. Coerce on read.

**An array of unknown length.** `line_items` might be empty, might hold one item, might hold two hundred. Never write logic that assumes `line_items[0]` exists, and never flatten an array into a single field without deciding what happens when it is long.

Notice too that this record is a hybrid. Everything except `customer_note` is structured; `customer_note` is unstructured text sitting inside a structured envelope. That is the normal case, and it is exactly where the split of labour belongs: read the structured fields directly, and send only `customer_note` to a model when you need something out of it.

## Unstructured: write the extraction contract first

For unstructured input the model is a converter with a job description. Write the job description as a schema before you write the prompt, because the schema is what the rest of the workflow depends on.

An extraction contract has four parts: the exact fields you want, the type and allowed values of each, what to do when the source does not state a field, and a confidence signal.

```text
You extract delivery instructions from a customer note on a freight order.

Return only this JSON object and nothing else:
{
  "call_ahead": true | false | null,
  "access_code": string | null,
  "earliest_time": "HH:MM" | null,
  "latest_time": "HH:MM" | null,
  "special_equipment": "tail_lift" | "forklift" | "none" | null,
  "confidence": number
}

Rules:
- Use null for anything the note does not state. Never infer or guess a value.
- access_code: copy the characters exactly as written. Do not normalize them.
- Times are 24-hour local time as written in the note.
- special_equipment: only the three listed values, or null if not mentioned.
- confidence: your certainty across the whole extraction, 0.0 to 1.0.

Note:
{{customer_note}}
```

Three properties make that contract usable. It has a **closed vocabulary** for `special_equipment`, so downstream branching has a known set of cases. It has an **explicit null policy**, which is the single most effective defence against invented values — a model with no instruction about absence will fill the gap. And it **returns confidence**, which gives the workflow something to threshold on when routing to human review.

Then treat the model's reply as an untrusted source, because it is one. Parse the JSON, confirm every required key is present, confirm `special_equipment` is one of the three listed values or null, confirm `earliest_time` matches `HH:MM`. Output that fails those checks is a failure to handle, not a record to store. One retry with the parse error appended is reasonable; after that the record goes to a review queue with the raw model text attached.

Non-text unstructured sources add one step at the front. A scanned PDF or a photo has to become text or be handed to a model that accepts images; either way you now have two failure points — the conversion and the extraction — and you should log which one failed. A native PDF with a text layer extracts cleanly. A scan of a fax does not, and no amount of prompt tuning fixes a page the converter read as noise.

## Decide handling per field, not per source

Because most records are hybrids, "this source is unstructured" is too coarse a decision to build on. Go one level down and assign a handling to each field you need:

| Needed field | Comes from | Shape | Handling | Cost per record |
| --- | --- | --- | --- | --- |
| `order_id` | `order_id` | Structured | Direct read | None |
| `customer_name` | `customer.name` | Semi-structured | Path read, null check | None |
| `order_total` | `total` | Structured | Direct read, coerce to number | None |
| `pallet_count` | `line_items` | Semi-structured | Sum over the array | None |
| `call_ahead` | `customer_note` | Unstructured | Model extraction | Tokens plus review |
| `access_code` | `customer_note` | Unstructured | Model extraction, verbatim | Tokens plus review |

Two things fall out of a table like this immediately. The first is how few fields actually need a model — here, two out of six, from one field of the source record. The second is that the AI step's input is now precisely defined: it receives `customer_note` and nothing else. Sending the whole order record to the model because the record is what the previous step produced is the most common quiet waste in an AI workflow, and it costs accuracy as well as tokens, because the irrelevant fields compete for the model's attention.

The exception worth naming is when a structured field is genuinely needed as *context* for the extraction — a note saying "same as last time" needs the previous order to be interpretable. Include such a field deliberately, and write down why it is there, so the next person does not delete it or double it.

## Volume: chunk on meaning, not on length

A 90-page contract will not fit in one call, and even when it fits, accuracy falls off across a very long input. Split it.

The naive split is every N characters. It is fast and it cuts sentences, tables, and clauses in half, which is how you get an extraction that confidently reports half a payment term. Prefer to split on the document's own structure — sections, headings, pages, speaker turns in a transcript, one email per chunk in a thread — and only fall back to a length cap inside a section that is still too big. Overlap consecutive chunks by a couple of sentences so a fact that straddles a boundary survives in at least one chunk.

Then decide how the pieces come back together. Two patterns cover almost everything:

```text
map:     run the same extraction on every chunk -> array of partial results
         -> merge by field, resolving conflicts explicitly

reduce:  summarize each chunk -> concatenate the summaries
         -> run a final pass over the concatenation
```

Merging is where the thinking is. If three chunks each report a `payment_terms` value, your merge rule has to say which wins — first non-null, highest confidence, or escalate the disagreement to a person. Write the rule down. A merge with no stated rule silently takes whichever chunk finished last.

Keep a chunk identifier on every partial result. When someone asks why the extraction says 30 days, you want to answer "chunk 14, section 9.2" rather than re-reading the contract.

## Build the source inventory before you build anything

Before a single step exists, write down what you are dealing with. A short table per source is enough, and it settles arguments later.

| Source | Shape | Access | Volume | Refresh | Handling |
| --- | --- | --- | --- | --- | --- |
| Orders table | Structured | Database, read-only role | 40k rows | Continuous | Query directly, no model |
| Carrier feed | Semi-structured | REST API, JSON | ~2k/day | Hourly pull | Path reads, coerce types |
| Customer notes | Unstructured, inside orders | Same order record | 1 per order | With order | Model extraction, contract above |
| Signed PODs | Unstructured, scanned | File drop | ~300/day | Daily | Convert, then extract, log both |

The `Handling` column is the deliverable. Everything else on the row exists to justify it. When a colleague proposes sending the orders table to a model to "let AI find the patterns", this table is the answer.

## Practice

Take three real sources you can access — one structured, one semi-structured, one unstructured. A CSV export, a JSON API response you already have, and a folder of emails or PDFs will do.

1. **Inventory them.** Produce the six-column table above for all three sources, and write one sentence per row justifying the `Handling` choice.
2. **Break the structured one.** Load your CSV and deliberately confirm the type problems: find at least one field where the text form would sort or compare incorrectly, and one field where empty and zero are ambiguous. Write down what each ambiguity resolves to and why.
3. **Path-test the semi-structured one.** List every field your workflow needs as a path expression. For each, write what happens when the level above it is missing. Then find or construct a record where one of those levels is genuinely absent and confirm your workflow does what you wrote, rather than failing the run.
4. **Write an extraction contract** for the unstructured source, with a closed vocabulary for at least one field, an explicit null policy, and a confidence number. Run it over 15 documents.
5. **Grade it by hand.** For those 15, record for each field: correct, wrong, or missed. Count how many wrong values were confidently wrong. That number, not the average confidence, tells you whether this source can be handled without review.
6. **Chunk the largest document** you have. Split it on structure with overlap, run the same extraction per chunk, and merge with a written rule. Show one field where two chunks disagreed and state which rule resolved it.
7. **Write the split.** Finish with a short note listing which fields in your intended workflow come from direct reads and which come from the model. If anything is in the model column that could be in the direct column, move it.

## Check your understanding

1. A colleague asks a model to "find all orders over $500" in a CSV export. What do you suggest instead? *Convert `total` to a number and use a filter step or a `WHERE` clause. Never send structured data to a model to do work a filter could do.*
2. Which fields in the freight order JSON need a model, and which do not? *Only values buried in `customer_note` (such as `call_ahead` and `access_code`) need a model; `order_id`, `customer.name`, `total`, and the line items are direct or path reads.*
3. Why does the extraction contract include an explicit null policy? *Without one, a model fills gaps with invented values; "use null for anything the note does not state" is the strongest single defence against that.*
