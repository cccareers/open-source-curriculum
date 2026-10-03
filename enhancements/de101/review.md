---
course_id: de101
title: "Data Engineering Fundamentals — Enhancement Review"
reviewed_lessons: 8
status: draft
---

## Summary

A strong, coherent entry course: the retailer e-commerce schema from lesson 3 carries through SQL, NoSQL, pipelines, ingestion, and quality, and the writing is concrete and honest about trade-offs. The biggest opportunity is runnability: several code samples depend on undefined helpers or schema columns that do not exist in the lesson 3 schema, and the practice sections ask for large builds with no acceptance tests, so learners cannot tell when they are done.

## Clarity issues

| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| de101-04 | Practice, item 7 | Asks to reconcile a "header count of lines", but the lesson 3 `orders` table has no such column. | Tell learners to add `expected_line_count` and seed two wrong rows. | Applied |
| de101-04 | "Derived columns and CASE" | `CURRENT_DATE - 30` is PostgreSQL-only arithmetic; the lesson says any of PostgreSQL/MySQL/SQLite is fine for practice. | Parenthetical with MySQL and SQLite equivalents. | Applied |
| de101-06 | "Idempotency" | `MERGE` presented without engine caveat; MySQL and SQLite lack it, PostgreSQL only since 15. | One paragraph with `ON DUPLICATE KEY` / `ON CONFLICT` equivalents. | Applied |
| de101-07 | "Reading databases" | Watermark built with `str(datetime)` (space separator) but compared with ISO `T` strings — string comparison is wrong. | Use `.isoformat()` and explain why. | Applied |
| de101-07 | "The runner" | `overlap`, `WatermarkStore`, `log` are used but never defined; `X \| None` needs Python 3.10. | Short paragraph defining each helper. | Applied |
| de101-08 | "Deduplication" | `ctid` is PostgreSQL-specific and unexplained; the in-place DELETE contradicts "never in place". | Explain `ctid`; give `ROW_NUMBER()` portable alternative. | Applied |
| de101-08 | Practice intro | Practice corrupts `order_total`, which the schema does not have. | Say to compute it from `order_lines` in the export. | Applied |
| de101-08 | "Validation" code | `pd.Timestamp.utcnow()` returns a tz-aware value; comparing to a tz-naive `placed_at` raises `TypeError`, and `utcnow` is deprecated in pandas 2.2+. | Use `pd.Timestamp.now(tz="UTC")` and parse `placed_at` with `utc=True`. | Proposed (verify against the pandas version the program pins) |
| de101-07 | "Reading HTTP APIs" | Text recommends a hard maximum page count, the sample has none. | Add `max_pages` guard to the loop. | Proposed |

## Depth and coverage gaps

- **No acceptance criteria for practice builds** (lessons 4, 7, 8). Learners build substantial systems with no way to self-check. Drafted project x01 adds a pytest suite. Objective: "Apply profiling and quality checks to a raw dataset before it is used downstream".
- **Data generation is left to the learner** in lessons 4, 7, 8. A shared seeded generator (schema + row counts + injected faults) would keep the running example identical across cohorts. Objective: "Write SQL that joins, filters, and aggregates data across several tables".
- **Window functions** are absent (deferred to de102, which is fine), but practice item 5 ("share of total units") nudges learners toward them; add a hint that a scalar subquery works here.
- **Type 2 SCD** is described but never shown as SQL. A ten-line example closing and inserting a row would make the concept concrete. Objective: "Design a normalized transactional schema and a denormalized analytical model for the same subject area".
- **NoSQL lesson has no hands-on store.** Fine for the scope, but a short local MongoDB-in-Docker or SQLite-JSON exercise would make "design for the access pattern" tangible. Objective: "Choose between a relational store and a NoSQL store for a stated workload".
- **ETL vs ELT** lacks a worked numeric example of re-deriving history after a definition change; project x02 below covers it.

## Proposed additional projects

- **x01 Retailer Orders: Profile, Clean, and Gate a Messy Export** (drafted) — lessons 04, 08; sqlite3 + pytest.
- **x02 Three-Source Ingestion with a Fake Flaky API** (drafted) — lessons 06, 07; local `http.server` API that returns 429s, CSV drop, SQLite source, watermark store, pytest.
- Star schema build-out: load `dim_customer` (type 2 on `state_code`) and `fact_order_line` from the 3NF tables, prove sums match. Not drafted.
- NoSQL decision memo bake-off: same five workloads, peer-reviewed against the lesson's decision procedure. Not drafted.

## Video and animation opportunities

- **The grain trap** (de101-04) — screencast; motion shows rows multiplying. *Drafted: media/video-01-the-grain-trap.md.*
- **Profiling a file you have never seen** (de101-08) — screencast running the `profile()` function and the `GROUP BY` value query. *Drafted: media/video-02-profiling-a-stranger-file.md.*
- **Watermark, late commit, overlap window** (de101-06/07) — explainer animation. *Drafted: media/animation-01-watermark-and-overlap.md.*
- Normal forms as anomalies (de101-03) — whiteboard: update/insert/delete anomaly on a wide table. Not drafted.
- CAP under partition (de101-05) — explainer animation of two replicas and a cut link. Not drafted.
- ETL vs ELT layers (de101-06) — explainer; could reuse `etl-vs-elt.png`. Not drafted.

## Assessment ideas

- Grain quiz: show five join queries, learner states the grain of each result.
- "Which null?" sort: ten columns with nulls; learner chooses leave / impute / reject / flag with a reason.
- Rubric for the lesson 2 upstream contract: columns named, assumptions explicit, notice period, reciprocal promise, under 400 words.
- Severity triage: twelve check failures, learner assigns blocking/quarantine/warn and justifies blocking ones.

## Changes applied in this pass

- `04-relational-databases-and-sql.md`, "Derived columns and CASE": engine-specific date arithmetic note.
- `04-relational-databases-and-sql.md`, "Practice" item 7: added `expected_line_count` instruction so the reconciliation query is possible.
- `06-etl-and-elt-pipelines.md`, "Idempotency": MERGE engine-support paragraph with upsert equivalents.
- `07-ingesting-data-from-multiple-sources.md`, "Reading databases": watermark now `.isoformat()`; added paragraph explaining the string-comparison bug.
- `07-ingesting-data-from-multiple-sources.md`, "The runner": defined `overlap`, `WatermarkStore`, `log`; noted Python 3.10 requirement.
- `08-data-quality-fundamentals.md`, "Deduplication": explained `ctid`; added portable `ROW_NUMBER()` alternative.
- `08-data-quality-fundamentals.md`, "Practice": instruct to compute `order_total` for the export.

## Open questions for the course owner

- Is Python 3.10+ the pathway's pinned version? Lesson 7's type syntax requires it.
- Which pandas version is pinned? Determines the fix for `pd.Timestamp.utcnow()`.
- Should de101 standardize on one practice engine (SQLite for zero setup, or PostgreSQL to match de102)? Today learners pick, and SQL samples are PostgreSQL-flavoured.
- The `star-schema-vs-normalized.png` and `etl-vs-elt.png` assets referenced in lessons 3 and 6 — confirm they exist in `img/`.
