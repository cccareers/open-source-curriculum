---
lesson_id: ds320-03
course_id: ds320
pathway: data-engineer
title: Privacy Regulation in Practice
order: 3
kind: lesson
competency_ids:
  - D5-S1-C02
objectives:
  - Map GDPR and CCPA obligations onto the data a pipeline actually holds
---

## Reading a regulation as an engineer

Two regulations dominate day-to-day privacy work for data engineers in most organizations: the European Union's General Data Protection Regulation (GDPR) and California's Consumer Privacy Act as amended by the California Privacy Rights Act (referred to here as CCPA). They are the two this course covers because they are the two that most often turn into tickets.

**This lesson is not legal advice and will not make you a privacy lawyer.** Whether a specific processing activity is lawful, whether your organization is a controller or a processor for a given dataset, and whether a request must be honored are legal determinations made by your privacy and legal functions. What you are learning is the translation layer: how to take an obligation those functions hand you and find, in your actual schemas and buckets, the rows and files it applies to — and how to build the pipeline capability that makes the obligation satisfiable at all. Engineers who cannot do this translation are the reason privacy teams end up with promises they cannot keep.

The habit to build is mechanical. For every obligation, ask three questions:

1. **Which data?** Name the tables, columns, buckets, topics, and backups it touches.
2. **Which capability?** What must the platform be able to do — find, delete, export, restrict, prove?
3. **What evidence?** What artifact shows we did it, and how long do we keep that artifact?

If you can answer all three for an obligation, it is engineered. If you can only answer the first, it is documented, which is not the same thing.

## GDPR: the concepts that change your schema

**Personal data** is any information relating to an identified or identifiable natural person. This is broader than most engineers expect. It is not just name and email — it includes an IP address, a device identifier, a cookie id, a customer number, and a pseudonymous id that your organization can still link back to a person. The engineering consequence: a table with no obviously human column can still be full of personal data. Session identifiers, user agent strings, and precise timestamps at user granularity all count when they are linkable.

**Special category data** is a narrower set treated more strictly: data revealing racial or ethnic origin, political opinions, religious beliefs, trade union membership, genetic and biometric data used for identification, health data, and data about sex life or sexual orientation. If a pipeline you are asked to build carries any of these, stop and escalate before you build it. Health-adjacent inference — a retailer inferring pregnancy from purchases, a fitness app storing heart rate — is a recurring trap.

**Controller and processor.** The controller decides why and how personal data is processed; the processor acts on the controller's instructions. Your organization is usually a controller for its own customer data and a processor when it handles a client's data. This determination changes who must respond to a request and what has to be in the contract, and it is not yours to make — but it is yours to know, because it decides whether a data subject request arrives at your desk or gets forwarded to a client.

**Lawful basis** is the justification for processing at all: consent, contract, legal obligation, vital interests, public task, or legitimate interests. Engineers meet lawful basis in two places. First, consent-based processing means the pipeline needs a consent signal as an input, with a timestamp and a version of what was consented to — a boolean with no provenance is not usable evidence. Second, the basis constrains what you may do downstream: data collected under contract to fulfill an order is not automatically available for model training.

**Purpose limitation and data minimization.** Data collected for one purpose may not be freely repurposed, and you should collect and retain only what the purpose requires. This is the single most engineering-relevant pair of principles in the regulation, because `SELECT *` is the default habit of the profession. A pipeline that ingests an entire source table when the mart needs four columns is a minimization defect, and it is one you can fix in an afternoon.

**Storage limitation.** Personal data is kept no longer than necessary for the purpose. This is what makes a retention schedule mandatory rather than tidy, and it applies to your intermediate layers too — the staging tables, the raw landing zone, the debug exports in someone's home directory.

**Data subject rights.** The rights that generate work: access (a copy of their data and information about the processing), rectification (correction), erasure (the "right to be forgotten", which is qualified, not absolute), restriction of processing, portability (a machine-readable export), and objection. The response deadline is one month, extendable by two further months for complex requests. One month is not long if fulfilling a request requires an engineer to hand-write queries against nine systems.

**Records of processing activities.** Article 30 requires a register of processing activities. Privacy owns the document; you supply the technical reality — which systems, which categories of data, which recipients, which transfers, what retention. When your inventory from the previous lesson is accurate, this becomes a join rather than an interview.

**Breach notification.** Personal data breaches must generally be reported to the supervisory authority within 72 hours of awareness. The engineering implication is not the paperwork — it is that you need logs good enough to establish, quickly, *what was accessed and by whom*. That capability is built in lesson 6, and it is built before the incident or not at all.

**International transfers** are restricted and require a valid mechanism. As an engineer, what you owe here is a truthful answer to "where does this data physically live and which regions do our jobs run in?" Region selection in a pipeline configuration is a compliance decision wearing a technical costume.

## CCPA: the same shape, different edges

CCPA regulates a **business** handling **personal information** of California **consumers**. Its definition of personal information is likewise broad, and it explicitly includes household-level data and inferences drawn to create a profile. It carves out a category of **sensitive personal information** — precise geolocation, government identifiers, account credentials, racial or ethnic origin, contents of private messages, biometric and health data — which consumers may direct a business to limit the use of.

Consumer rights under CCPA that create engineering work: the right to know what is collected and how it is used, the right to delete, the right to correct, the right to opt out of the **sale or sharing** of personal information (where "sharing" specifically covers cross-context behavioral advertising), and the right to limit use of sensitive personal information. The response deadline is 45 days, extendable by another 45.

The two edges that most often bite engineers are these. First, **"sale" is broader than money changing hands** — passing identifiers to an advertising platform can qualify. If your pipeline exports a hashed email to an ad network, that export is in scope, and an opt-out must actually stop it. Second, **opt-out signals must propagate**, including browser-level preference signals. An opt-out that updates a preferences table but does not reach the nightly audience export is a control that exists on paper only.

Where the two regimes differ in ways that change your design:

| Concern | GDPR | CCPA |
| --- | --- | --- |
| Trigger for processing | Requires a lawful basis up front | Generally permitted with notice; consumer opts out |
| Deletion request deadline | One month, extendable to three | 45 days, extendable to 90 |
| Portability | Machine-readable export of provided data | Export in a readily usable format |
| Advertising data flows | Consent and legitimate-interest analysis | Opt-out of sale or sharing |
| Sensitive data | Special category, stricter conditions | Sensitive personal information, right to limit use |
| Scope of "personal" | Identified or identifiable natural person | Consumer or household, including inferences |

Design to the stricter of the two per capability and you will usually satisfy both — but say so explicitly in your design notes rather than assuming, and let privacy confirm it.

Other regimes exist and will appear in job postings: HIPAA for protected health information in the United States, PCI-DSS as a contractual standard for payment card data, FERPA for student education records, and SOC 2 as an auditable control framework rather than a law. This course does not teach them, because the pathway does not name an industry. If you land in healthcare, payments, or education, the *shape* of the work in this course transfers directly — the specific control set does not, and you must learn it from the regime itself.

## Mapping obligations onto a real schema

Here is the mechanical part. Take the pipeline schema and produce a **data map**: a row per column that carries personal data, with what it is, why it exists, and how long it stays.

Consider a warehouse holding `raw.crm_contacts`, `raw.web_events`, `raw.orders`, `mart.customer_ltv`, plus a Parquet landing zone in object storage and 35 days of database snapshots.

| Location | Column or field | Personal data? | Category | Purpose | Retention | Deletable in place? |
| --- | --- | --- | --- | --- | --- | --- |
| `raw.crm_contacts` | `full_name`, `email`, `phone` | Yes | Direct identifiers | Service delivery | Life of account + 2y | Yes |
| `raw.crm_contacts` | `country` | Yes, in context | Attribute | Tax, localization | Same | Yes |
| `raw.web_events` | `ip_address`, `device_id` | Yes | Online identifiers | Product analytics | 13 months | Yes |
| `raw.web_events` | `session_id` | Yes, linkable | Pseudonymous id | Product analytics | 13 months | Yes |
| `raw.orders` | `contact_id` | Yes, linkable | Pseudonymous key | Billing, legal record | 7y (tax) | No — legal hold |
| `mart.customer_ltv` | `email`, `segment` | Yes | Identifier, inference | Marketing targeting | 24 months | Yes |
| Object storage | daily Parquet exports | Yes | Mixed | Reprocessing | 90 days | Rewrite required |
| Snapshots | full database | Yes | Mixed | Recovery | 35 days | No — expires |

That last column is where the interesting engineering lives, and it is worth dwelling on. Three findings fall straight out of this map.

**Conflicting retention.** `raw.orders` must be kept for tax purposes while a deletion request may cover the same person. The usual resolution — again, a decision for legal, not for you — is to keep the transaction record while removing or pseudonymizing the identifiers that are not required for the legal purpose. Your job is to make that surgically possible: keep identifiers in one place, reference them by surrogate key everywhere else. A schema where `email` appears in nine tables has made deletion into a nine-table migration.

**Immutable and append-only stores.** Parquet files in object storage cannot be updated in place; satisfying a deletion means rewriting affected partitions or adopting a table format that supports row-level deletes. Decide this before you have four years of files.

**Backups.** You cannot practically delete a row from a snapshot. The accepted engineering position is that deletion applies to live systems, backups expire on a defined and short-enough cycle, and any restore is followed by re-application of the deletion log. That last part is a real pipeline job that someone has to write, and it is the step teams forget. Keep a `privacy.deletion_log` of subject identifiers and completion timestamps precisely so a restore can be re-cleaned.

## Building the capabilities

Four capabilities turn obligations into something your platform can do on demand.

**Find.** Given a subject identifier, locate every record about them. This requires a mapping from identifier to location, which is exactly your data map plus a resolved identity graph. A useful implementation is a `privacy.subject_index` table maintained by the pipeline: subject key, system, table, and locating predicate.

**Export.** Produce a structured copy of the subject's data. Build it as a parameterized job with a reviewed output, not an ad hoc query — an access response that accidentally includes another person's data is itself a breach.

**Delete or de-identify.** Execute the deletion across live stores, honor legal holds, log completion, and know what to do about immutable layers. De-identification (masking, tokenization, pseudonymization) is often the right answer where records must survive but the person need not be identifiable; note that pseudonymized data is still personal data under GDPR if the mapping exists somewhere.

**Restrict and suppress.** Mark a subject as opted out or restricted and have every downstream consumer honor it. Implement suppression as a join at the *edge* of the pipeline, not as a filter each analyst is trusted to remember. A single `privacy.suppression_list` joined in the export job is worth a hundred lines of policy.

Sketching the fulfilment path as code makes the gaps obvious:

```sql
-- 1. Resolve the subject to every location that holds them.
select system_name, object_name, locator_column, locator_value
from privacy.subject_index
where subject_key = :subject_key;

-- 2. Apply the erasure where no legal hold applies.
update raw.crm_contacts
set full_name = null,
    email     = null,
    phone     = null,
    redacted_at = now()
where contact_id = :contact_id;

-- 3. Record completion as evidence.
insert into privacy.deletion_log
  (subject_key, system_name, object_name, action, actor, completed_at)
values
  (:subject_key, 'warehouse', 'raw.crm_contacts', 'erasure', :actor, now());
```

Notice that step 3 is not optional decoration. Without the log you cannot prove the request was fulfilled, cannot re-apply it after a restore, and cannot answer the regulator's inevitable follow-up: how do you know?

## Practice

Use the `sales_ops` warehouse described above — `raw.crm_contacts`, `raw.web_events`, `raw.orders`, `mart.customer_ltv`, a 90-day Parquet landing zone, and 35 days of snapshots — or substitute your own pipeline if it holds personal data.

1. **Build the data map.** One row per column that carries personal data, with these fields: location, field, category (direct identifier, online identifier, pseudonymous key, inference, attribute, special category or sensitive), purpose, lawful basis or CCPA treatment as you understand it, retention period, and whether it can be deleted in place. Mark anything you are unsure of as a question for privacy rather than guessing — list those questions at the end as a numbered escalation list.

2. **Write a deletion runbook** for a verified GDPR erasure request and a CCPA deletion request against the same person. It must cover: how the subject is resolved to records, the order of operations across live stores, what is retained under legal hold and why, how the landing zone and snapshots are handled, what is logged, and who signs off. State the deadline for each regime at the top.

3. **Write the export query set** for an access request against `raw.crm_contacts` and `raw.orders`. Include the review step that checks the output contains only the requesting subject's data, and say who performs it.

4. **Design the opt-out propagation.** Given a `privacy.suppression_list` of subject keys with an opt-out timestamp and scope, show where in the pipeline the suppression join belongs so that the marketing vendor export cannot ship a suppressed subject. Then write the detective control — a query that would catch it if the join were ever removed.

5. **Find the minimization defect.** Identify at least one column in the schema that is collected or retained without a purpose that justifies it, and write the two-sentence recommendation you would take to the data owner: what to drop or shorten, and what breaks if you do.
