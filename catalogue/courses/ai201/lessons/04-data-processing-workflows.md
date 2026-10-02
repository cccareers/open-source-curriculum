---
lesson_id: ai201-04
course_id: ai201
pathway: prompt-engineer
title: Data Processing Workflows
order: 4
kind: lesson
competency_ids:
  - D3-S1-C01
objectives:
  - Build a workflow that ingests, cleans, and routes business data without manual handling
---

## The shape of a data pipeline

Most of the manual work you found in your process map is data movement: someone reads a value in one place and types it into another, fixing the format on the way. Automating it well is not one big step. It is five small ones, in a fixed order, and skipping any of them is how pipelines quietly corrupt a database.

```text
ingest -> normalize -> validate -> deduplicate -> enrich -> route
```

Each stage has a single responsibility and a defined output. **Ingest** gets raw data in and preserves it unmodified. **Normalize** makes every field the same shape. **Validate** decides whether the record is usable. **Deduplicate** decides whether it is new. **Enrich** adds what the record needs but did not arrive with — this is where an AI step earns its place. **Route** puts the record where the business acts on it.

The order matters. Deduplicating before normalizing means `Dana.Reyes@Example.com ` and `dana.reyes@example.com` look like two people. Enriching before validating means you pay for an AI call on a record you are about to throw away. Routing before enriching means the routing rule cannot see the fields it needs.

## Ingest: keep the original

Sources vary — a form webhook, a nightly CSV drop, an API pull, a shared inbox, a partner posting rows into a table. What does not vary is the rule: **write the raw payload down before you touch it.**

Store the raw body as text on the record, along with the source name and the receipt timestamp. It costs a text field. It buys you the ability to answer "what did they actually send us?" during every future incident, and it lets you replay a record through a fixed pipeline instead of asking the sender to resubmit.

Decide batch versus per-record deliberately. Per-record processing gives you clean isolation — one bad row fails one run — but on a 4,000-row CSV it will exhaust your platform's operation budget before lunch. The usual compromise is: ingest the file as one run that splits it into rows and writes each row raw into a staging table with `status: received`, then let a second workflow process rows in batches of 50 to 200. That also gives you a natural resume point when the file is half done and something breaks.

For scheduled pulls, keep a cursor. Store `last_synced_at` (or the last processed ID) in a settings record and query `updated_after = last_synced_at - 5 minutes`. The overlap window catches records written during the previous poll; your dedupe handles the resulting repeats. Do not trust a source's pagination to be stable across a change in the underlying data.

## Normalize: one shape per field

Normalization is boring, mechanical, and responsible for more downstream bugs than anything else in the pipeline. Write the rules explicitly, one per field, in a mapping table you keep alongside the workflow:

| target field | source path | transform | on failure |
| --- | --- | --- | --- |
| `email` | `data.email` | trim, lowercase | quarantine |
| `company` | `data.company` | trim, collapse internal spaces | keep raw |
| `phone` | `data.phone` | strip non-digits, prefix country code if 10 digits | null the field |
| `requested_at` | `occurred_at` | parse ISO 8601, store UTC | quarantine |
| `amount` | `data.total` | strip currency symbols and thousands separators, to decimal | quarantine |
| `request_type` | `data.request_type` | lowercase, map through synonym table | set `unknown` |

Four transforms cause almost all real incidents.

**Dates.** `03/11/2026` is ambiguous and your source will not tell you which convention it uses. Establish it once, from documentation or from a sample containing a day above 12, and record the answer in the mapping table. Store everything in UTC; format for humans only at the point of display.

**Numbers.** `"1,240.00"`, `"$1,240"`, and `"1240"` must all become `1240.00`. Never let a currency string reach a comparison — `"$900" > "$1,000"` is true in string comparison, and that is a real approval-threshold bug.

**Enums.** Free-text category fields arrive as `Quote`, `quote request`, `QUOTES`, and `rfq`. Maintain a synonym map from raw value to canonical value, and route anything unmapped to `unknown` rather than inventing a match. Review the `unknown` pile weekly; it tells you what the map is missing.

**Nulls.** Decide what empty means per field. An empty string, the literal text `null`, `N/A`, and a missing key must all resolve to one representation before validation runs.

## Validate: quarantine, do not discard

Validation answers one question: can the rest of the pipeline safely act on this record? Express it as a checklist the workflow evaluates in one step.

```json
{
  "required": ["email", "company", "request_type", "received_at"],
  "formats": {
    "email": "rfc-ish: has one @ and a dot in the domain",
    "amount": "decimal >= 0",
    "received_at": "ISO 8601 UTC"
  },
  "enums": {
    "request_type": ["quote", "support", "billing", "other"]
  },
  "cross_field": [
    "if request_type = quote then amount is present",
    "line_items sum equals amount, tolerance 0.01"
  ]
}
```

Records failing validation go to **quarantine**, not to the bin. Quarantine is a status and a view: the record keeps its raw payload, gains a `validation_errors` list naming each failed rule, and appears in a queue a person checks. Most quarantined records are fixable in seconds by someone who understands the source, and each one is evidence about a normalization rule you got wrong.

Silently dropping bad records is the single worst thing a data pipeline can do, because the absence of a record is invisible. Nobody files a ticket about the quote request that never appeared.

Add a reconciliation count as a habit: for every batch, log `received`, `normalized`, `valid`, `quarantined`, `duplicate`, `routed`. Those six numbers must add up. When they stop adding up, you have found a bug before your users did.

## Deduplicate: exact first, fuzzy carefully

Start with the natural key from the architecture lesson — the source's own ID. If two records share it, the second is a delivery duplicate; discard it and log the fact.

Business duplicates are harder: the same company submitting the same request twice through different channels. Use a tiered approach and never let the fuzzy tier act on its own:

1. **Exact key match** on `source_id`. Automatic, no review.
2. **Deterministic composite match** on normalized fields — `lower(email) + request_type + date(received_at)`. Automatic merge is acceptable when the composite is tight.
3. **Probable match** — same company domain, similar request text, within 48 hours. Flag as `possible_duplicate`, link to the candidate, and route to a human. Do not merge.

If you use an AI step for tier 3, constrain it hard: give it exactly two candidate records and ask for a judgement plus a reason, not a free search.

```text
You compare two intake records and decide whether they describe the same request.

Record A:
{{record_a_json}}

Record B:
{{record_b_json}}

Return only JSON:
{"same_request": true|false, "confidence": 0.0-1.0, "reason": "one sentence citing the fields you compared"}

Rules:
- Judge only from the fields shown. Do not assume anything not present.
- Different contact people at the same company are NOT automatically the same request.
- If either record is missing the fields you would need, return same_request false with confidence below 0.5.
```

Anything under your confidence floor stays a human decision. You will set that floor properly in the customer-service lesson; for now, treat 0.85 as a placeholder you must justify with a labeled sample.

## Enrich: the AI step, bounded

Enrichment adds derived fields: a category, a priority, a normalized company name, a short summary of a long free-text field, extracted entities. Two rules make this reliable.

**Rule-first, model-second.** If a rule can produce the field, use the rule. `amount > 10000 -> tier = enterprise` does not need a model, will never drift, and costs nothing. Reserve the model for fields that require reading unstructured text.

**Demand structured output with a closed vocabulary.** Never ask for a free-text category. Give the exact allowed values, an escape value, and a per-field confidence.

```text
You classify inbound business requests for a freight company.

Return only this JSON object, no prose:
{
  "category": "quote" | "support" | "billing" | "other",
  "urgency": "low" | "normal" | "high",
  "entities": {"origin": string|null, "destination": string|null, "pallet_count": number|null},
  "summary": string,
  "confidence": number
}

Rules:
- Use only the four categories listed. If none fit, use "other".
- Set a field to null when the message does not state it. Never infer a value.
- summary: one sentence, maximum 25 words, drawn only from the message.
- confidence: your certainty in the category, 0.0 to 1.0.

Message:
{{message}}
```

Then validate the model's output the same way you validated the source data: parse the JSON, check `category` is in the allowed set, check `pallet_count` is a number or null, check `summary` length. A model returning `"category": "quote request"` is a validation failure, not a category. One retry with the parse error appended is reasonable; a second failure sends the record to quarantine with the raw model output attached.

## Route: rules over the enriched record

Routing is the last stage and should be pure logic over fields that now exist. Keep the routing table as data rather than as nested branches, so a non-engineer can read it:

| condition | destination | owner | sla_hours |
| --- | --- | --- | --- |
| `category = quote AND urgency = high` | `quotes_priority` | Quotes lead | 2 |
| `category = quote` | `quotes_queue` | Quotes team | 8 |
| `category = billing` | `billing_queue` | Billing | 24 |
| `category = support` | `support_queue` | Support | 4 |
| `confidence < 0.75` | `triage_review` | Duty manager | 4 |
| anything else | `triage_review` | Duty manager | 8 |

Note the two catch-all rows. Low confidence routes to a human regardless of category, and an unmatched record still lands somewhere with an owner and a clock. A routing table with no default row is a record loss waiting to happen.

Routing writes the destination, owner, and SLA onto the record and advances the status. It does not send anything to a customer. Data processing pipelines feed queues; the lessons on email and customer service deal with what a person or a reviewed draft says outward.

## Volume, limits, and the audit trail

Two operational concerns decide whether a pipeline that works on 50 records works on 50,000.

**Respect the limits you will actually hit.** Every platform meters something — operations per month, records per run, payload size, concurrent executions — and every API you call has a rate limit. Find both numbers before you build, then design to them. Practical measures: process in bounded batches with a cursor so a run always finishes, add a deliberate pause between API calls when a source is rate-limited, cap concurrency so a backfill cannot starve live traffic, and separate the backfill workflow from the live one so a historical load never competes with today's records. A pipeline that consumes a month of operations in a Tuesday afternoon has failed even though every run was green.

**Chunk on meaning, not on convenience.** When a source hands you a 12,000-row file, split it on a boundary that makes a partial result coherent — one batch per source file, per day, per account — so that a half-completed load is interpretable. Random 500-row chunks leave you unable to say what has been processed.

**Keep an audit trail per record**, not per batch. At minimum: the raw payload, the source and receipt time, which transformation version ran, the validation result, the model output verbatim if an AI step touched it, and every status change with its timestamp. This costs storage and repays it constantly — it is what lets you answer "why does this record say Ohio?", replay a record through a fixed pipeline, and prove to an auditor what happened to a specific case. Version your transformation rules and stamp the version onto each record, because the answer to "why did January's records come out differently?" is usually that they did, correctly, under the rules of the time.

**Set a retention rule deliberately.** Raw payloads containing personal data should not accumulate forever by default. Decide how long you keep them, write the rule down, and implement the deletion — a retention policy nobody implemented is a liability with a document attached.

## Practice

Build a complete ingest-to-route pipeline over deliberately messy data.

1. **Make the mess.** Create a CSV of 60 to 100 intake rows containing, on purpose: inconsistent date formats, currency strings with symbols and commas, mixed-case and space-padded emails, three spellings of the same category, five exact duplicate rows, two near-duplicates that differ only in contact name, four rows missing a required field, and one row with a line-item total that does not match its stated total.
2. **Build ingest.** One workflow reads the file and writes every row raw into a staging table with `status: received`, the raw text preserved, and a natural key.
3. **Build normalize and validate** as a second workflow over `received` rows. Implement the mapping table explicitly — one visible transform per field. Failing rows get `status: quarantined` and a populated `validation_errors` list naming which rule failed.
4. **Build dedupe.** Implement tiers 1 and 2 automatically. Implement tier 3 as a flag plus a link, never an automatic merge.
5. **Add one AI enrichment step** producing category, urgency, entities, summary, and confidence in strict JSON. Validate its output against the allowed values and route parse failures to quarantine with the raw model text attached.
6. **Implement the routing table** as data, including both catch-all rows.
7. **Reconcile.** Log the six counts (`received`, `normalized`, `valid`, `quarantined`, `duplicate`, `routed`) for the batch and confirm they balance. If they do not, find the gap before you move on — that is the exercise.
8. **Prove it twice.** Re-run the same file end to end. The second run must produce zero new records and zero new AI calls. Report the counts from both runs side by side.
