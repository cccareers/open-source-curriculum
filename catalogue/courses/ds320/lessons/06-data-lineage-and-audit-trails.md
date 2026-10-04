---
lesson_id: ds320-06
course_id: ds320
pathway: data-engineer
title: Data Lineage and Audit Trails
order: 6
kind: lesson
competency_ids:
  - D5-S1-C03
objectives:
  - Produce lineage and audit evidence that answers a regulator's or auditor's question
---

## From engineering artifact to evidence

You already build lineage. In the pipeline course you captured which job wrote which table, which upstream tables it read, and which run produced which partition — and you used it for impact analysis and debugging: what breaks if I change this column, why is this number wrong.

This lesson uses the same graph for a different purpose. **Lineage is the evidence that answers questions about provenance and control, asked by someone who does not trust you and cannot read your code.** That change of audience changes what "good" means. For debugging, lineage needs to be *approximately* right and *quickly* readable by you. For evidence, it needs to be complete over a defined period, attributable to a source you did not hand-edit, retained beyond the incident, and comprehensible to an auditor.

The questions you are answering fall into four families, and it is worth having them in front of you before designing anything:

1. **Provenance.** "This report says 4.2 million euros. Where did that number come from, and what transformations touched it?"
2. **Authorization.** "Who read the table containing customer identifiers in March, and was each of them approved?"
3. **Fulfilment.** "Prove that this person's data was deleted from every system on the date you claim."
4. **Control effectiveness.** "Show that encryption and least-privilege access were in force for this dataset for the whole of the last quarter, not just today."

Notice that only the first is answered by lineage alone. The other three need lineage joined to logs. That join is what this lesson builds.

## What traceable lineage records

**Table-level lineage** — this job read these tables and wrote that table — is the cheap baseline and answers coarse provenance. **Column-level lineage** — this output column derives from these input columns through this expression — is what governance actually needs, for one specific reason: classification propagates along column edges. If `mart.customer_ltv.segment` derives from `raw.web_events.ip_address`, then the label on `segment` is not a judgement call, it is a graph traversal.

A minimally sufficient lineage record for evidence has these fields:

| Field | Why an auditor cares |
| --- | --- |
| `run_id` | Ties every claim to one execution |
| `job_name`, `job_version` | Which code, at which revision, produced this |
| `started_at`, `ended_at`, `status` | Whether it completed, and when |
| `inputs` (dataset, partition, row count) | What was consumed |
| `outputs` (dataset, partition, row count) | What was produced |
| `column_mapping` | Provenance at field granularity |
| `executed_by` | Which principal ran it |
| `code_ref` (commit SHA) | Reproducibility of the transformation |
| `parameters` | The run was not hand-tuned invisibly |

Two properties separate this from ordinary run logging. It must be **emitted by the pipeline itself**, not reconstructed afterwards by a human reading code, because reconstruction is an assertion and emission is a record. And it must be **immutable once written** — appended, never updated. An auditor's first instinct on seeing an editable evidence table is to ask who can edit it.

A workable schema on the warehouse side:

```sql
create table lineage.run (
  run_id       uuid primary key,
  job_name     text not null,
  job_version  text not null,
  code_ref     text not null,
  executed_by  text not null,
  parameters   jsonb not null default '{}'::jsonb,
  started_at   timestamptz not null,
  ended_at     timestamptz,
  status       text not null check (status in ('running','succeeded','failed'))
);

create table lineage.edge (
  run_id            uuid not null references lineage.run(run_id),
  input_dataset     text not null,
  input_column      text,
  output_dataset    text not null,
  output_column     text,
  transform_expr    text,
  recorded_at       timestamptz not null default now()
);
```

With that in place, provenance is a recursive query rather than an archaeology project:

```sql
with recursive upstream as (
  select input_dataset, input_column, output_dataset, output_column, 1 as depth
  from lineage.edge
  where output_dataset = 'mart.customer_ltv'
    and output_column  = 'lifetime_value_cents'
  union all
  select e.input_dataset, e.input_column, e.output_dataset, e.output_column, u.depth + 1
  from lineage.edge e
  join upstream u
    on e.output_dataset = u.input_dataset
   and e.output_column  = u.input_column
  where u.depth < 10
)
select distinct input_dataset, input_column, depth
from upstream
order by depth, input_dataset;
```

Run that, hand the output to a data owner, and the provenance question is answered in minutes rather than days. Add a join to `governance.column_classification` from lesson 4 and the same query tells you whether any Confidential column feeds an Internal output — a classification-propagation defect, found automatically.

## Audit trails: what to log and where it comes from

An audit trail records **who did what to which object, when, from where, and whether it succeeded**. Five fields, and a log missing any one of them is weaker than it looks: without the outcome you cannot distinguish an attack from a failed attack, and without the source you cannot tell a scheduled job from a laptop.

A data platform produces audit evidence from at least five sources, and evidence work is mostly the work of correlating them.

**Database audit logging.** In PostgreSQL, the `pgaudit` extension records statements at a configurable granularity. Session-level auditing of reads on everything is far too noisy; scope it to the classifications that matter:

```sql
-- Audit every read and write against the Confidential contacts table,
-- for every role, without drowning in mart queries.
create role auditor nologin;
grant select, insert, update, delete on raw.crm_contacts to auditor;

-- Object-level audit configuration (pgaudit.role model)
alter system set pgaudit.role = 'auditor';
alter system set pgaudit.log = 'ddl, role';
select pg_reload_conf();
```

The pattern is worth understanding beyond the syntax: you grant a dedicated audit role privileges on exactly the objects you want audited, and the extension logs any statement touching an object that role can see. It is classification-driven auditing, which is why the lesson-4 registry is a prerequisite. Note that the audit role logs exactly the statement types it holds privileges for — grant it only `SELECT` and writes go unrecorded.

Two practical notes before you try this. `pgaudit` must be listed in `shared_preload_libraries` and the server restarted before `CREATE EXTENSION pgaudit` works; managed PostgreSQL services expose this as a parameter-group or flag setting. And pgaudit records statements that *execute*. A read refused with `permission denied` never executes, so it does not appear as a pgaudit entry; it appears in the server's error log, provided `log_min_error_statement` is at `error` or lower, which is the default. Your evidence for a denied attempt therefore comes from that error log line, correlated by user and timestamp.

**Cloud control-plane logs.** Every API call against your storage, database, and key services — who called it, from which principal and address, and whether it was allowed or denied. Denied calls are the most interesting rows in the entire platform and the ones teams most often filter out.

**Key management logs.** From lesson 5: each `Decrypt` and `GenerateDataKey` call with its encryption context. This is the highest-value audit source you have, because it records intent to read plaintext, and the encryption context tells you which dataset without joining anything.

**Pipeline run logs and lineage.** Your own `lineage.run` records, which are the only source that knows *why* a read happened.

**Change history.** Grants and revokes, classification changes, key policy edits, schema migrations. Control effectiveness questions are answered here: not "is encryption on now" but "was it on continuously, and if it changed, who changed it and was it approved?"

## What makes a log evidence

Not every log is evidence. Six properties decide it, and each one is a design decision you make before the audit, not during.

**Complete over a defined period.** You must be able to say the trail covers the whole quarter with no gaps. That means monitoring the log pipeline itself — a silent collector is indistinguishable from a quiet month.

**Immutable and tamper-evident.** Write to append-only storage with object lock or equivalent retention lock. Ideally add a tamper-evident mechanism such as periodic hashing of the log segment. If someone with production access can edit the audit trail, the trail proves nothing about that person.

**Separated from the audited system.** Logs from the warehouse live somewhere the warehouse administrators cannot rewrite them. This is separation of duties again, applied to evidence.

**Attributable.** Every entry names an individual principal. Shared accounts destroy attribution, which is the strongest argument against them and the one you should use with management.

**Time-synchronized.** Correlating a KMS decrypt with a database read requires clocks that agree. Synchronize to a common time source and store timestamps in UTC. Mixed local times in evidence are the single most common reason a correlation cannot be defended.

**Retained per schedule, and queryable.** Retention is set by policy, usually one to seven years depending on regime and classification. But retained is not the same as usable — evidence that requires a three-day restore from cold archive will not meet a 72-hour breach notification deadline. Keep the recent window hot and queryable.

And a warning that catches people: **audit logs contain personal data**. Query text may include identifiers in a `WHERE` clause; access logs contain the addresses and identities of employees. Logs therefore need their own classification, their own access control, and their own retention limit. "We keep all logs forever" is a privacy defect wearing the costume of diligence. Log access itself should be restricted to the audit function and logged in turn.

## Assembling an evidence pack

The deliverable an auditor actually wants is not a database, it is a small, self-contained package that answers a specific question. Build it as: **question, method, artifact, attestation.**

Take question 3 from the opening list — prove a deletion. The pack contains:

1. **The question**, restated precisely, with the subject reference, the systems in scope, and the date range.
2. **The method**: which queries were run, against which sources, by whom, on what date. Include the SQL, not a description of it.
3. **The artifacts**: the `privacy.deletion_log` rows for the subject; the `lineage.run` records for the deletion job showing it completed successfully across each target; a post-deletion search result showing zero matching rows in the live stores; the retention configuration showing the snapshot window expires within 35 days; and, where crypto-shredding was used, the key deletion record.
4. **The attestation**: who reviewed the pack, when, and what they are asserting.

Assembled that way it is reproducible — someone else can re-run the method and get the same artifacts — and reproducibility is the property that turns a claim into evidence.

The other three question families follow the same template. Provenance uses the recursive lineage query plus the `code_ref` for each contributing job. Authorization uses the audit log of reads joined to the approved access model and the quarterly access review sign-offs from lesson 4. Control effectiveness uses configuration history over the period plus the change-approval records, and the honest answer often includes a gap — a week where rotation was disabled, a grant that existed for eleven days before being reviewed.

Report those gaps. An evidence pack that finds and states its own gaps, with the remediation and its date, is far stronger than one that claims perfection. Auditors are professionally suspicious of clean results, and finding a gap yourself demonstrates the detective controls work — which is, in the end, what they are testing.

## Practice

Continue with the `sales_ops` warehouse, the `acme-warehouse` bucket, the key hierarchy from lesson 5, and the `privacy.deletion_log` from lesson 3.

1. **Instrument lineage.** Create the `lineage.run` and `lineage.edge` tables and modify one existing pipeline job to emit records for a real run: the run row with `code_ref` and `executed_by`, and column-level edges for at least five output columns of `mart.customer_ltv`. Then run the recursive provenance query for `lifetime_value_cents` and paste the result.

2. **Find a classification defect with lineage.** Join `lineage.edge` to `governance.column_classification` and write a query that returns any output column classified Internal or Public whose upstream includes a Confidential or Restricted column. Introduce one such edge deliberately, confirm the query catches it, then state the remediation you would recommend and to whom.

3. **Turn on database auditing** for `raw.crm_contacts` only, using the audit-role pattern. Generate three events — an approved analyst read, a pipeline write, and a denied read from an unauthorized role — and show the resulting log entries. Confirm each entry carries all five audit fields; note any that is missing and how you would obtain it.

4. **Build one evidence pack.** Choose one of: (a) prove a specific subject's data was deleted; (b) show every principal that read `raw.crm_contacts` in a chosen month and whether each was approved; (c) show that the Confidential key's policy and rotation setting were unchanged across the period. Produce the four sections — question, method (with the actual queries), artifacts, attestation — as a single markdown document. State at least one gap or limitation honestly.

5. **Assess your own evidence** against the six properties. For each of completeness, immutability, separation, attribution, time synchronization, and retention, write one line: does your setup satisfy it, and if not, what is the specific change required? Then answer the privacy question: what personal data do your audit logs themselves contain, what is their classification, and what retention have you set for them?
