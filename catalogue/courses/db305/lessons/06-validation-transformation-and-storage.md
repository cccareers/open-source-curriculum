---
lesson_id: db305-06
course_id: db305
pathway: prompt-engineer
title: Validation, Transformation, and Storage
order: 6
kind: lesson
competency_ids:
  - D5-S1-C03
objectives:
  - Apply validation, transformation, and storage practices that keep workflow
    data trustworthy
---

## Validation is a contract, written down

Two lessons ago the database refused your bad write. One lesson ago nothing refused it. That asymmetry is why this lesson exists: the rules have to live somewhere, and the only reliable place is a written contract your workflow enforces at a boundary.

A validation contract states, for every field: its type, whether it is required, what values are acceptable, and what happens when the value is not acceptable. That fourth column is the one people forget, and it is the one that decides whether your workflow loses data.

There are only four legitimate answers to a validation failure:

**Reject** — refuse the record and tell the sender. Right when the sender is a system that can resend, and when accepting a broken record would be worse than losing it.

**Quarantine** — store the record intact, mark it invalid, list which rules failed, and put it in a queue a person works. This is the default and should be your default. Most invalid records are fixable in seconds by someone who knows the source.

**Default** — substitute a known value. Only ever legitimate when the default is genuinely correct, not merely convenient. `country = "GB"` because the form only serves the UK is a defensible default; `confidence = 1.0` because the model omitted it is not.

**Repair** — fix it deterministically, and log that you did. Trimming whitespace, upper-casing a country code, parsing a date. If the repair requires a judgement call, it is not a repair.

The one answer that is never acceptable is **discard silently**. A dropped record is invisible; nobody files a ticket about the order that never arrived. If you take nothing else from this lesson, take that.

## Four boundaries, not one

Validation belongs at every point where data crosses from something you do not control into something you do.

1. **Ingest.** The API response, the uploaded file, the form submission, the row read from a base. Covered in lessons 03 and 05; this is where most people already validate.
2. **Model output.** The extraction, classification, or summary that came back from an AI step. Most people do not validate here, and it is the boundary that fails most creatively.
3. **Before storage.** The last check before a write, applied to the record as it will actually be stored, after every transform has run.
4. **On read, for anything old.** Records written before the current rules existed do not retroactively comply. A workflow that reads two-year-old rows should not assume they satisfy this year's contract.

Validating at ingest only means a clean input can still produce a corrupt stored record, because the transforms and the model sit between the two.

## Write the contract as data

Keep the contract in one artifact rather than scattered across step configurations, so a person can read all the rules at once and diff them when they change. JSON Schema is a good default because most platforms and languages can evaluate it.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "order.v2",
  "type": "object",
  "required": ["order_id", "customer_id", "placed_at", "status", "total_minor"],
  "additionalProperties": false,
  "properties": {
    "order_id":    { "type": "string", "pattern": "^ORD-[0-9]{4,8}$" },
    "customer_id": { "type": "string", "pattern": "^C-[0-9]+$" },
    "placed_at":   { "type": "string", "format": "date-time" },
    "status":      { "type": "string",
                     "enum": ["draft", "confirmed", "shipped", "cancelled"] },
    "total_minor": { "type": "integer", "minimum": 0 },
    "currency":    { "type": "string", "pattern": "^[A-Z]{3}$", "default": "GBP" },
    "region":      { "type": ["string", "null"] },
    "line_items": {
      "type": "array", "minItems": 1,
      "items": {
        "type": "object",
        "required": ["sku", "qty", "unit_price_minor"],
        "properties": {
          "sku":              { "type": "string" },
          "qty":              { "type": "integer", "minimum": 1 },
          "unit_price_minor": { "type": "integer", "minimum": 0 }
        }
      }
    }
  }
}
```

Two choices in there are worth copying. `"additionalProperties": false` means an unexpected field is an error rather than a shrug — that is your schema-drift alarm, and you will want it. And `total_minor` as an integer count of pence rather than a decimal is the standard defence against floating-point money; `8.81` cannot be represented exactly in binary floating point, `881` can.

Schema languages cannot express everything. Cross-field rules go beside the schema as an explicit list:

```json
{
  "cross_field_rules": [
    "sum(line_items.qty * line_items.unit_price_minor) == total_minor",
    "if status == 'shipped' then shipped_at is present",
    "placed_at <= now() + 5 minutes",
    "if currency != 'GBP' then fx_rate is present"
  ]
}
```

The clock-skew tolerance in the third rule is deliberate. A rule of `placed_at <= now()` will fail a handful of legitimate records a day because two machines disagree about the time by a second, and a rule that cries wolf gets switched off.

## Validating what the model returned

Model output is the boundary where validation is least common and most needed, because a wrong answer arrives looking exactly like a right one.

Run the checks in this order and stop at the first failure:

```text
1. A response exists and is not empty.
2. It parses as JSON. (Strip a ```json fence if the model added one.)
3. Every required key is present.
4. Every value has the declared type — a number is a number, not "0.82".
5. Every closed-vocabulary field holds one of the allowed values, exactly.
6. Numeric fields are in range: confidence between 0 and 1, qty above 0.
7. Cross-field rules hold.
8. Grounding: every extracted verbatim value appears in the source text.
```

Check 5 is the one that earns its keep. A model returning `"Confirmed"` where the contract says `"confirmed"`, or `"quote request"` where the allowed set is `"quote"`, is a validation failure — not something to normalize away, because normalizing hides a prompt that has started drifting.

Check 8 is worth building at least once. If the contract says `access_code` is copied exactly from the note, then a returned `access_code` that does not appear as a substring of the note was invented. That single check catches a large share of confident fabrication, and it costs nothing.

On failure, retry once with the specific error appended to the prompt — models are good at fixing a named parse error. A second failure quarantines the record with the raw model text attached, because the raw text is the evidence you need to fix the prompt.

Record the outcome either way: `validated_ok`, `validated_after_retry`, or `quarantined`. The ratio between those three, tracked over time, is an early warning that something upstream has changed.

## Transformation: get to one canonical shape

Transformation is the work of making every record look the same regardless of where it came from. Keep the rules in a table, one row per field, so they can be reviewed by someone who did not write them.

| Canonical field | Source | Transform | On failure |
| --- | --- | --- | --- |
| `order_id` | `id` or `orderNumber` | trim, upper-case, prefix `ORD-` if bare digits | quarantine |
| `placed_at` | `created` or `placed_at` | parse with the source's known format, convert to UTC, emit ISO 8601 | quarantine |
| `total_minor` | `total` | strip currency symbols and separators, multiply by 100, round to integer | quarantine |
| `currency` | `currency` | upper-case; default `GBP` when absent | default |
| `status` | `state` | lower-case, map through the synonym table | quarantine |
| `region` | `customer.region` | trim; empty string becomes null | repair |

Four transforms cause most real incidents, and each has one correct habit.

**Dates.** `03/11/2026` is ambiguous and the source will not tell you which convention it uses. Determine it once — from the documentation, or from a sample containing a day above 12 — record the answer beside the rule, and store UTC. Format for humans only at the point of display.

**Money.** Convert to minor units on the way in, keep the currency code alongside, and never compare currency strings. `"$900" > "$1,000"` is true as text, and that has been a real approval-threshold bug in a real system.

**Enumerations.** Maintain an explicit synonym map from raw value to canonical value. Anything unmapped becomes a quarantine, not a guess. Review the unmapped pile weekly; it is a list of what the map is missing.

**Emptiness.** Decide once what empty means. An empty string, the literal text `null`, `N/A`, `-`, and an absent key must all resolve to a single representation before validation runs, or your `required` check will pass on a field containing nothing.

Two properties make a transform trustworthy. It must be **deterministic** — the same input always produces the same output, which means no model calls inside a transform. And it must be **replayable** — you can re-run the whole set over the preserved raw payload and get today's canonical form, which is what makes fixing a bad rule a re-run rather than an archaeology project.

## Storage practices

Five practices separate a store you can trust from one you merely have.

**Keep the raw payload.** Write the untouched input alongside the canonical record, with its source name and receipt timestamp. It costs a text column and it answers "what did they actually send us?" during every future incident.

**Give every record a stable natural key and write idempotently.** Use the source's own id where one exists; otherwise derive a deterministic key from stable fields. Then always upsert on that key, as you did in lessons 04 and 05. A workflow that cannot be safely re-run is a workflow you will be afraid to fix.

**Timestamp everything, in UTC.** `received_at`, `processed_at`, `updated_at`, and the source's own event time — which is a different thing and must not be conflated with when you got it.

**Never hard-delete from a workflow.** Set `deleted_at` and filter it out on read. An accidental delete is then a one-line correction rather than a restore-from-backup conversation.

**Decide retention and sensitivity per field, before the first write.** Which fields are personal data, how long they are kept, and which of them must not be sent to a model or written to a log. Redact at the boundary rather than trying to scrub storage later, and keep a note of the decision beside the schema.

Add one habit on top: **reconcile every batch.** Log `received`, `transformed`, `valid`, `quarantined`, `duplicate`, `stored`, and confirm they add up. When those numbers stop balancing you have found a bug before your users did.

## Derived artifacts, including embeddings

Extractions, classifications, summaries, and embeddings are all derived data, and derived data needs its own storage discipline: it can be regenerated, but only if you recorded how it was made.

Store with every derived value the **model and version** that produced it, the **prompt or transform version**, the **timestamp**, and a **pointer to the source record and, where relevant, the chunk**. Without those four, you cannot answer "which records were produced by the prompt we have since replaced", and the answer to that question is what makes a fix targeted rather than a full reprocess.

Embeddings are the case worth naming explicitly, because their storage requirements surprise people. An embedding is a fixed-length array of numbers produced by an embedding model from a piece of text. Stored, one row is roughly:

```json
{
  "chunk_id": "DOC-4412#s9.2",
  "source_id": "DOC-4412",
  "text": "Payment is due within 30 days of invoice date…",
  "embedding_model": "embed-model-3",
  "dimensions": 1536,
  "vector": [0.0121, -0.0334, 0.0075, "…1533 more numbers…"],
  "created_at": "2026-03-11T14:07:11Z"
}
```

Three storage facts follow. **The text must be stored beside the vector** — a vector alone is not human-readable and cannot be shown to anyone. **The model name and dimension count are mandatory**, because vectors from different models are not comparable and re-embedding is the only fix when a model is retired. And **vectors are large**, so they belong in a store built for them — a purpose-built vector database, or a vector column in a database that supports one — rather than in a spreadsheet-style base.

Building and querying a retrieval index over those embeddings is a distinct skill that this pathway's catalog does not currently cover; it is recorded as a proposed competency for this course rather than taught here. What belongs to you now is the storage discipline: keep the text, keep the model, keep the pointer, and be able to regenerate.

## Schema drift: notice the shape moving

Sources change without telling you. Three cheap detectors catch nearly all of it.

**Unexpected fields.** With `additionalProperties: false`, a new field upstream becomes a validation event on the first record instead of a discovery six months later.

**Missing expected fields.** Track the fill rate of each field per batch. A field that was 98 percent populated last week and 4 percent today has been renamed or dropped, and no individual record failure will tell you that.

**Distribution shifts.** Record counts, category proportions, and the average of key numerics per batch. A category that was 12 percent of records and is now 60 percent is either a real business change or a mapping bug, and you want to be the one who asks.

When something drifts, version rather than patch. Give the contract a version (`order.v2` in the schema above), stamp `schema_version` on every stored record, and add a new version when the shape changes rather than quietly editing the old one. Stored records then say which rules they were written under, and a reader can handle both.

## Practice

Work with a real source you already pull — the API from lesson 03 is ideal.

1. **Write the contract.** Produce a JSON Schema for the canonical record with types, required fields, patterns, enums, `additionalProperties: false`, and money in minor units. Add the cross-field rules as an explicit list beside it.
2. **Write the transform table.** One row per field: canonical name, source path, transform, and failure action. Every row's failure action must be one of reject, quarantine, default, or repair, and none may be discard.
3. **Implement quarantine.** Failing records keep their raw payload, gain a list naming each failed rule, and land in a queue you can open. Prove it with at least six deliberately broken records covering a type failure, a missing required field, a bad enum, a range failure, a cross-field failure, and an unexpected field.
4. **Validate the model output.** Add all eight model-output checks to an AI step, including the grounding check on one verbatim field. Force a failure by loosening the prompt's null policy, and confirm the record quarantines with the raw model text attached.
5. **Prove replayability.** Change one transform rule, re-run the whole set over the preserved raw payloads, and show that the canonical records update and no source was re-fetched.
6. **Store it properly.** Ensure every stored record has a natural key, an idempotent upsert, `received_at` and `processed_at` in UTC, a `schema_version`, and a `deleted_at` column that reads filter out. Run the pipeline twice and show record counts unchanged.
7. **Reconcile.** Log the seven batch counts and confirm they balance. If they do not, find the gap — that is the exercise.
8. **Detect drift.** Add a fill-rate check per field and a category-proportion check per batch. Then simulate drift: rename a field in a test fixture and add an unseen enum value, and confirm each is reported as a distinct, named event rather than a null in a record.
