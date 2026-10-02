---
lesson_id: ds320-07
course_id: ds320
pathway: data-engineer
title: Securing an Enterprise Data Asset
order: 7
kind: project
competency_ids:
  - D5-S1-C01
  - D5-S1-C02
  - D5-S1-C03
objectives: []
---

## Goal

Produce a complete, defensible **data-protection plan** for one enterprise data asset, and configure the controls it specifies. The plan is a written document; the controls are working configuration you can demonstrate. Together they must let a reader who has never seen your system answer three questions without asking you anything: what is this data and who is accountable for it, what stops the wrong person reading it, and how would we prove either of those to a regulator or auditor.

This is the exercise the whole course has been building toward. Lessons 2 through 6 each gave you one instrument; here you apply all of them to a single asset and discover where they disagree.

Two boundaries, both firm. This is **not a penetration test** — you are not attacking anything, and offensive security is out of scope for this pathway. And it is **not legal work** — you will state obligations as you understand them and flag the questions that belong to legal and privacy, but you are not deciding lawfulness. A plan that routes its legal questions correctly is stronger than one that answers them confidently.

## The asset

Use a real dataset from your own work if you have one and are permitted to describe it. Otherwise use `acme_retail`, described below.

The asset is the customer data domain of an online retailer, landed and modelled by a pipeline you operate.

**Warehouse (PostgreSQL), schema `raw`:**

- `crm_contacts` — `contact_id`, `full_name`, `email`, `phone`, `date_of_birth`, `country`, `marketing_consent`, `consent_recorded_at`, `support_notes` (free text), `created_at`
- `orders` — `order_id`, `contact_id`, `amount_cents`, `currency`, `billing_country`, `placed_at`
- `web_events` — `event_id`, `session_id`, `contact_id` (nullable), `ip_address`, `device_id`, `page`, `occurred_at`
- `support_tickets` — `ticket_id`, `contact_id`, `subject`, `body` (free text), `agent_id`, `opened_at`, `closed_at`

**Warehouse, schema `mart`:**

- `customer_ltv` — `contact_id`, `email`, `region`, `lifetime_value_cents`, `first_order_at`, `segment`, `churn_risk_score`
- `campaign_audience` — `contact_id`, `email`, `segment`, `exported_at`

**Object storage,** bucket `acme-warehouse`: `raw/` (daily Parquet, 90-day retention), `curated/`, `exports/` (files delivered nightly to an external advertising vendor).

**Operational facts you must design around:**

- Customers are in the European Union, the United Kingdom, and the United States including California.
- The nightly `exports/` job sends `campaign_audience` to an advertising platform.
- Database snapshots are retained 35 days.
- Finance requires order records for seven years for tax purposes.
- Three groups need access: marketing analysts, tier-1 support agents, and the pipeline service account. A data science group has asked for a copy of `crm_contacts` to train a churn model.

## Requirements

Your submission has two halves. Both are required.

### Part A — the written plan

A single markdown document with these seven sections, in this order.

**A1. Asset profile and accountability.** What the asset is, its business purpose, the systems it spans, and the accountability model: named roles for owner, steward, custodian, and privacy contact, with a RACI covering at least four recurring decisions. Any role you cannot fill is recorded as an open item with the escalation path, not left blank.

**A2. Data map and classification.** Column-level classification for every column in the six tables plus the three storage prefixes, using a four-label scheme with handling rules stated once and referenced thereafter. For each Confidential or Restricted column, one line of justification. Include the derived columns and show how the label propagated to them.

**A3. Regulatory obligations.** For GDPR and CCPA separately: the obligations that bind this asset, mapped to the specific tables, columns, and prefixes they touch; the response deadline for each right; and, for each obligation, the platform capability that satisfies it. End with a numbered list of questions for legal and privacy — at least three — each phrased so it can be answered yes or no.

**A4. Access model.** Roles, purpose, objects, privileges, approval path, review cadence, and expiry where applicable. Include an explicit decision on the data science request, with reasoning, and a proposed alternative if you decline it as asked.

**A5. Encryption and key management.** Transit requirements per connection path; at-rest choice per store with the reason; the key hierarchy as a table (alias, protects, classification, users, administrators, rotation, region availability); the rotation runbook in summary; and whether crypto-shredding is part of your erasure strategy.

**A6. Evidence and audit.** What is logged, from which sources, where it is stored, how it is protected from tampering, retention, and the classification and retention of the logs themselves. Include the lineage records you emit and the specific queries that answer provenance.

**A7. Gaps, exceptions, and risks.** Everything that does not meet the standard, each with the breach, the compensating control, an owner, an expiry date, and the approving role. A plan with an empty section A7 will be assumed incomplete rather than perfect.

### Part B — the configured controls

Working configuration, with evidence that it runs. At minimum:

1. **Classification registry** populated for all six tables, queryable.
2. **Database access** implemented end to end: defaults revoked, three functional roles created, grants and default privileges set, a view that hides `email` and `date_of_birth` from marketing, and row-level security restricting support agents to their own region. Demonstrate that an analyst cannot read a Confidential column they were not granted.
3. **A cloud storage policy** scoping the marketing role to `curated/` only, denying non-TLS requests, and ensuring the storage layer does not undo the database column restriction.
4. **Transit** verified: a connection using `sslmode=verify-full` with an explicit certificate authority, with the successful and rejected connection attempts captured.
5. **A customer-managed key** with a policy separating users from administrators, rotation enabled, and one envelope-encryption round trip with an encryption context naming dataset and classification.
6. **Lineage emission** for one pipeline job, with column-level edges for `mart.customer_ltv`, and the recursive provenance query returning results.
7. **Audit logging** enabled for `raw.crm_contacts`, with three captured events including one denied access.
8. **Two detective controls** as scheduled queries: one finding datasets with no owner or classification, one finding grants that differ from the approved access model.
9. **A deletion and suppression path**: the `privacy.deletion_log` and `privacy.suppression_list` tables, the erasure runbook executed once against a test subject, and proof that the suppressed subject cannot appear in the nightly `exports/` file.
10. **One evidence pack** built to the four-section template — question, method, artifacts, attestation — answering an auditor question of your choice.

## Constraints

- **Vendor-neutral plan, concrete implementation.** Write the plan so it survives a change of provider, but implement against one relational engine and one cloud provider. Say which, in the first paragraph.
- **No offensive testing.** Do not attempt to break into anything, including your own systems. Verification means demonstrating a control denies an action you legitimately attempted with a role you legitimately hold.
- **No production data.** Use synthetic or fully de-identified data. If you adapt this to a real asset at work, do the written plan and get authorization before touching configuration.
- **No cryptographic primitives.** Managed KMS, provider storage encryption, and TLS only. Any hand-rolled cipher, key derivation, or random number generation fails the project.
- **Nothing is legal advice.** Where an answer depends on legal judgement, record the question and its owner rather than deciding.
- **Every claim is evidenced.** Any control asserted in Part A must be demonstrable in Part B or listed in A7 as a gap. An undemonstrated claim is worse than a declared gap.
- **Scope discipline.** Performance and cost optimization of the pipeline is out of scope here; if a control costs performance, note the trade-off and move on.

## Definition of done

You are finished when all of the following are true.

1. Every column in the six tables and every storage prefix carries a classification with an owner, and the registry can be queried to produce that list.
2. A reader can trace any GDPR or CCPA obligation to the exact tables, columns, and prefixes it binds, and to the capability that satisfies it.
3. The three access roles are implemented, and you can demonstrate one allowed and one denied access per role.
4. `mart.customer_ltv.email` is unreachable by the marketing analyst role through the database *and* through object storage.
5. A connection with `sslmode=verify-full` succeeds and an untrusted-certificate connection is refused, both captured.
6. A customer-managed key exists whose administrators cannot decrypt and whose users cannot delete, with rotation on, and an envelope round trip succeeds while a mismatched encryption context fails.
7. Column-level lineage exists for `mart.customer_ltv` and the recursive provenance query returns the upstream columns for at least one measure.
8. Audit logging captures who, what, when, where, and outcome for `raw.crm_contacts`, including a denied attempt.
9. Both detective controls run and each catches a defect you introduced deliberately.
10. A test subject's erasure is executed, logged, and provable, and the suppression list demonstrably blocks the vendor export.
11. The evidence pack is reproducible: a second person could re-run the stated method and obtain the same artifacts.
12. Section A7 lists every gap with an owner and an expiry date, and at least three questions are routed to legal or privacy.
13. Someone who has not seen your system can read Part A and answer the three questions from the Goal without asking you anything.

## Hints

- **Start from the data map, not the controls.** Classification decides key choice, grants, audit scope, and retention. Teams that start by configuring encryption end up encrypting the wrong things thoroughly.
- **The free-text columns are the hard part.** `support_notes` and `body` will contain anything a customer or agent typed, including identifiers you never modelled. Decide a defensible position and write it down rather than pretending they are Internal.
- **The data science request is the interesting decision**, and "no" is not automatically the right answer. Think about purpose limitation, the lawful basis under which the data was collected, and whether a de-identified or tokenized extract would serve the model. Whatever you decide, the reasoning is what is assessed.
- **The nightly vendor export is where CCPA bites.** Trace the path from `marketing_consent` and the suppression list all the way to the file that leaves the building, and put the suppression join at the edge, not upstream where a future refactor can drop it.
- **`raw.orders` versus erasure is a genuine conflict**, not an oversight in the brief. Seven-year tax retention and a deletion request collide. Design for surgical removal of identifiers while the transaction record survives — and note that whether that satisfies the request is a question for legal.
- **Snapshots and the landing zone need an explicit answer.** Say what happens on restore, and who re-applies the deletion log.
- **Separate key administration from key use** early; retrofitting that split into a policy that has been in use for a year is unpleasant.
- **Introduce your own defects deliberately.** The detective controls are only proven by catching something. Add a stray grant, a mislabelled column, and remove one classification, then confirm each is found.
- **Write A7 as you go.** Every time you notice something that will not meet the standard, add the row immediately. Reconstructing the gap list at the end guarantees you miss some.
- **Timebox the writing.** The plan should be readable in twenty minutes. If it is longer than that, you are explaining rather than deciding — move the explanation to an appendix and keep the decisions.
