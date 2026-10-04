---
course_id: db305
title: "Data Handling, APIs & AI Infrastructure — Enhancement Review"
reviewed_lessons: 8
status: draft
---

## Summary
db305 is technically strong and unusually disciplined: every lesson turns a data concept into concrete habits (bound every query, upsert on a natural key, validate at four boundaries, change one thing at a time) and the freight-order running example (orders 1041–1043, customer C-88 Reyes Freight, the delivery-note extraction contract, the `orders-extractor-prod` deployment) threads through all seven content lessons. The main gaps are a few technical slips in code samples that a careful learner will trip over (an upsert with no unique constraint behind it, a JSON Schema that rejects fields its own cross-field rules require, a model name that changes between lessons 07 and 08), and the absence of any runnable, offline exercise: every practice requires a live API, database, or cloud account. The two drafted projects close that gap with pytest suites that run on SQLite and fakes.

## Clarity issues
| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| db305-04 | "Writing back" | `on conflict (order_id)` fails in PostgreSQL unless `order_notes.order_id` has a unique constraint, and the schema shown has none; the join section also says an order can have several notes. | Added a short paragraph explaining the unique-constraint requirement and the one-note-per-order versus keyed-by-source choice. | Applied |
| db305-04 | "Writing back" (transaction) | `invoices` table is not in the lesson's schema. | Left as is; it reads as illustrative. Consider adding it to the schema block. | Proposed |
| db305-06 | "Write the contract as data" | Cross-field rules reference `shipped_at` and `fx_rate`, but the schema has `"additionalProperties": false` and does not declare them, so any shipped order would fail validation. Also, `"default": "GBP"` is an annotation; most validators do not apply it. | Added a note after the cross-field rules: declare every field a rule references, and apply defaults in the transform step. | Applied |
| db305-08 | "Log one record per run" | Run record names `"model": "gpt-4o-mini"`, `"model_version": "2024-07-18"` for deployment `orders-extractor-prod`, which lesson 07 pinned to `chat-model-mini` / `2026-01-15`. Inconsistent running example and the only real vendor model name in the course. | Changed to `chat-model-mini` / `2026-01-15`. | Applied |
| db305-07 | "One worked example" | Host, path, and `api-version` are presented as a concrete Azure AI Foundry request but are illustrative; the real endpoint shape differs by resource type and changes over time. | Added one sentence telling learners to copy the exact endpoint and API version from their deployment's details page. | Applied |
| db305-05 | "Working with the Airtable API" | `filterByFormula` example is shown unencoded inside a URL; pasting it into a raw HTTP request fails. | Added a sentence on URL-encoding the formula. | Applied |
| db305-03 | "Rate limits: budget first, back off second" | `X-RateLimit-Reset` value shown as an epoch timestamp without saying so; APIs differ (epoch vs seconds remaining). | Added a clarifying sentence. | Applied |
| db305-02 | "Unstructured: write the extraction contract first" | "one of the four allowed values" for `special_equipment` while the contract lists three values plus null. | Clarified to "the three listed values or null". | Applied |
| db305-02..08 | End of lesson | No self-check before the long practice lists. | Added "Check your understanding" to each content lesson. | Applied |

## Depth and coverage gaps
- **No offline, testable practice** (all objectives). Every practice requires live infrastructure. Projects db305-x01 and db305-x02 provide SQLite + fake-API versions with acceptance tests, so a learner without a cloud account can still demonstrate the skill.
- **Pagination loop is pseudocode only** (objective: "Pull data from an API into a workflow, handling pagination, rate limits, and error responses"). A worked implementation with the three guards appears only in the new project.
- **SQL write safety**: the lesson shows a parameterized `insert` but never a full worked example of the "generated SQL" guard (db305-04). A ten-line validator sketch would deepen it; proposed as an extra project.
- **Document-store null vs missing** (db305-05): stated, not demonstrated. A two-document example (`region: null` vs no `region`) with the query result would make it concrete.
- **Calibration table** (db305-08): the 0.0–0.5 bucket at 0.41 actual accuracy is labelled "honest", but a bucket whose midpoint is about 0.25 scoring 0.41 is under-confident. Minor; flagged in open questions rather than edited.
- **Misconception to address**: "JSON Schema `default` fills in missing values" — now addressed in the db305-06 note.
- **Embedding storage** (db305-06) is explicitly out of scope for retrieval; fine, but a check-your-understanding item now reinforces "store text + model + dimensions beside the vector".

## Proposed additional projects
- **db305-x01 Carrier Orders Sync: Paged, Polite, and Idempotent** (drafted) — cursor pagination with three guards, backoff with `Retry-After`, error classes, known-value validation, parameterized upserts into SQLite, incremental cursor with overlap; 13-test pytest suite.
- **db305-x02 Delivery-Note Extraction Pipeline with Validation and a Run Log** (drafted) — canonical transforms (minor units, date formats, synonym map), the eight model-output checks, retry-once-then-quarantine, idempotent storage, run log, and cost per usable record; 21-test pytest suite.
- Text-to-SQL guard (not drafted): implement the six-step generated-SQL guard from db305-04 against SQLite with a read-only connection (`mode=ro` URI) and a red-team list of forbidden statements.
- Same data, two stores (not drafted): load the order documents into a local document store or JSON file and into SQLite; answer the three practice questions from db305-05 in both; write the fit memo.
- Deployment config review (not drafted, non-coding): given three configuration sheets with planted problems (floating model alias, shared key, no rate limit), learners mark findings.

## Video and animation opportunities
- **Paging an API without losing or duplicating rows** — db305-03 — offset drift and cursor stability are invisible in a static page — screencast. **Drafted: media/video-01-paging-an-api-safely.md**
- **Validating model output: the eight checks** — db305-06 — watching a plausible but invented access code get caught by the grounding check is persuasive — screencast. **Drafted: media/video-02-eight-checks-on-model-output.md**
- **Offset drift vs cursor** — db305-03 — rows shifting under an offset while records are inserted — explainer animation. **Drafted: media/animation-01-offset-drift-vs-cursor.md**
- **Parameters vs string building** — db305-04 — value becoming SQL text vs travelling separately — explainer animation. Not drafted.
- **Inner vs left join dropping rows** — db305-04 — whiteboard. Not drafted.
- **Calibration buckets** — db305-08 — explainer animation of runs falling into confidence buckets and accuracy bars. Not drafted.

## Assessment ideas
- Shape sort (db305-02): ten fields from the freight JSON and note; learner labels structured / semi-structured / unstructured and the handling.
- Status-code triage (db305-03): given 10 responses, choose retry / fix / alert / quarantine.
- Spot the bug (db305-04): five SQL snippets, each with one trap (null comparison, inner join dropping rows, update without where, row multiplication, string concatenation).
- Store choice (db305-05): three scenarios scored against the six questions.
- Contract review (db305-06): a schema with three planted issues (float money, missing additionalProperties, rule referencing an undeclared field).
- Configuration sheet audit (db305-07) and "is this optimization real?" per-field comparison table (db305-08).

## Changes applied in this pass
- `02-structured-and-unstructured-data-for-ai.md` — "Unstructured: write the extraction contract first": clarified the allowed values for `special_equipment`.
- `02-structured-and-unstructured-data-for-ai.md` — end: added "Check your understanding".
- `03-apis-as-data-sources.md` — "Rate limits: budget first, back off second": explained the `X-RateLimit-Reset` value format.
- `03-apis-as-data-sources.md` — end: added "Check your understanding".
- `04-ai-workflows-over-sql-databases.md` — "Writing back": added the unique-constraint requirement for `on conflict`.
- `04-ai-workflows-over-sql-databases.md` — end: added "Check your understanding".
- `05-nosql-and-spreadsheet-style-data-stores.md` — "Working with the Airtable API": added URL-encoding note for `filterByFormula`.
- `05-nosql-and-spreadsheet-style-data-stores.md` — end: added "Check your understanding".
- `06-validation-transformation-and-storage.md` — "Write the contract as data": declared-fields and `default` note after the cross-field rules.
- `06-validation-transformation-and-storage.md` — end: added "Check your understanding".
- `07-deploying-ai-models-on-cloud-services.md` — "One worked example": marked host/path/api-version as illustrative.
- `07-deploying-ai-models-on-cloud-services.md` — end: added "Check your understanding".
- `08-monitoring-and-optimizing-ai-performance.md` — "Log one record per run": aligned model name/version with lesson 07.
- `08-monitoring-and-optimizing-ai-performance.md` — end: added "Check your understanding".

## Open questions for the course owner
- **Cloud product names and UI (db305-07)**: "Azure AI Foundry", "Amazon Bedrock", "Vertex AI" and their deployment concepts are renamed and reorganised frequently (Microsoft has rebranded its AI platform more than once). Verify current names and whether "deployment", "tokens per minute limit", and "managed identity" auth still map as described before each cohort.
- **Airtable limits (db305-05)**: "a handful of requests per second per base" and "up to ten records per request" match long-standing published limits, but verify; Airtable has changed plan-level API limits before.
- **OAuth token lifetime (db305-03)**: "typically in an hour" is common but vendor-specific; fine as written.
- **Calibration labels (db305-08)**: should the 0.0–0.5 bucket be relabelled "under-confident" rather than "honest"?
- **`invoices` table (db305-04)**: add it to the schema block, or leave illustrative?
- **Prompt caching (db305-08)**: availability and pricing differ by provider and change often; the lesson rightly says "check whether yours does".
- Projects assume Python 3.10+ and pytest; the course prerequisites mention JSON and HTTP but not Python. Confirm learners have Python, or offer a no-code variant (each brief includes one).
