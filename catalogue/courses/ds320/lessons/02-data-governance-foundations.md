---
lesson_id: ds320-02
course_id: ds320
pathway: data-engineer
title: Data Governance Foundations
order: 2
kind: lesson
competency_ids:
  - D5-S1-C02
objectives:
  - Explain what a data governance program owns and who is accountable for each part
---

## What a governance program actually is

A data governance program is the standing answer to four questions about every dataset your organization holds:

1. What is this data, and what is it allowed to be used for?
2. Who decides that?
3. What controls enforce the decision?
4. How do we show, later, that the controls were working?

That is the whole of it. Everything that follows in this course — classification, access control, encryption, lineage, audit — is machinery for answering question 3 and question 4. Governance is not a document, and it is not a committee, although it produces both. It is the ownership model that makes it possible to point at a table and say who is accountable for it.

You have already met the consequences of not having one. A pipeline built in the previous course pulls customer rows from an operational database into a warehouse. Six months later somebody asks: can the marketing analytics team read this table? Nobody knows, because nobody wrote down what the table contains, who owns it, or what the customers were told when the data was collected. The engineer who built the pipeline is asked to decide, on the spot, a question that is not theirs to decide. Governance exists so that this question has an owner before it is asked.

A note on scope, and it matters for the whole course: this is engineer-facing governance. **Nothing in this course is legal advice.** You are learning to implement, operate, and evidence controls. Deciding whether a particular processing activity is lawful, whether a contract is adequate, or whether a regulator's expectation has been met is the job of your organization's legal, privacy, and compliance functions. Your obligation to them is accuracy: tell them what the data really contains and what the systems really do.

## The accountability model

Most governance programs, whatever vocabulary they use, distribute accountability across five roles. Learn the roles rather than the titles, because titles vary wildly between organizations.

**Executive sponsor / data governance council.** Owns the program itself: the policies, the funding, the escalation path, and the tie-break when two business units want incompatible things from the same dataset. The council is where a policy exception gets approved or refused. Without a real escalation path, governance decisions get made by whoever is least able to say no — usually the engineer.

**Data owner.** A named business person accountable for a domain of data: the head of customer operations owns customer data, the finance controller owns billing data. The owner decides classification, decides who may have access, approves retention periods, and signs off on new uses. Owners are accountable, not operational — they rarely touch a system. The single most common defect in a young governance program is a dataset with no named owner, because every downstream decision then has no author.

**Data steward.** The owner's working delegate. Stewards maintain the definitions ("what exactly counts as an active customer?"), curate the catalog entries, triage data-quality issues, and are the first responders to an access request. In many teams the steward is a senior analyst who knows the data semantically.

**Data custodian.** The team that runs the systems the data lives in — usually you, plus the platform and database teams. Custodians implement the controls the owner decides on: they write the grants, configure the key policy, set the bucket policy, schedule the retention job. Custodians do not decide what the rules are; they decide how the rules are implemented and they are accountable for the implementation being correct.

**Privacy and security functions.** The data protection officer or privacy lead interprets regulation and maintains the record of processing activities. The security team owns the control standards — the baseline every system must meet — and usually owns the identity provider and the key management service. These functions set constraints that owners cannot waive unilaterally.

Written as a RACI for a single decision — "may the marketing analytics team query the customer table?" — it looks like this:

| Activity | Owner | Steward | Custodian (you) | Privacy | Council |
| --- | --- | --- | --- | --- | --- |
| Classify the table | A | R | C | C | I |
| Approve the access request | A | R | C | C | I |
| Implement the grant | I | I | A/R | I | I |
| Attest that access is still needed | A | R | C | I | I |
| Approve an exception to policy | R | I | C | C | A |

Read that table once and notice the pattern: you are accountable for exactly one row. Being clear about which row is yours is most of what this lesson is for. When you are handed a decision from another row, the correct response is not to make it — it is to name the owner and route it, and to say what the technical options and their costs are.

![Accountability model showing how a policy decision flows from data owner through steward to custodian and back as evidence](./img/governance-accountability-model.png)

## What the program owns

A governance program owns a small number of artifacts. If you can name them and say who maintains each one, you understand the program.

**Policy, standard, control, evidence.** These four words form a chain and are frequently confused. A **policy** is a short statement of intent approved at the council level: "personal data is encrypted at rest." A **standard** makes it testable: "all storage holding data classified Confidential or above uses a customer-managed key in the organization's key management service, with rotation enabled." A **control** is the implemented mechanism: the specific bucket configuration, the specific database parameter. **Evidence** is the artifact that proves the control was in place over a period: the configuration export, the key-usage log, the access-review sign-off. Auditors test controls and collect evidence; they read policies only to know which controls to test. When you are asked for "our encryption policy" what is usually wanted is the standard and the evidence.

**The data inventory (or catalog).** The list of datasets, with owner, classification, source, location, retention period, and whether they contain personal data. This is the spine of the program — every other artifact joins to it. In practice it lives in a data catalog tool, a warehouse metadata schema, or, in smaller shops, a well-maintained spreadsheet. An inventory that is not maintained is worse than none, because it produces confident wrong answers.

**The record of processing activities.** A regulatory artifact (you will meet it properly in the next lesson) describing, for each processing activity, what personal data is used, why, on what basis, who it is shared with, and how long it is kept. Privacy owns it; you supply the technical facts.

**The classification scheme and its handling rules.** The set of labels and, for each label, what is required of any system holding data with that label. The scheme is worthless without the handling rules — a label that implies no obligation changes nothing.

**The retention schedule.** For each data category, how long it is kept and what happens at the end. Owners set the periods, often with legal input; custodians implement the deletion.

**The access model.** The set of roles, what each role may reach, and the process for requesting, approving, reviewing, and removing access.

**The exception register.** Every real program has exceptions — a legacy system that cannot meet the standard, a vendor that will not support a customer-managed key. An exception must be written down, justified, given a compensating control, given an expiry date, and approved by someone senior enough to carry the risk. Undocumented exceptions are how programs quietly become fiction.

## Monitoring and enforcement, operationally

The competency behind this lesson is about monitoring and enforcing standards, so it is worth being concrete about what enforcement looks like from an engineer's desk. It has three modes, and mature programs use all three.

**Preventive.** The control makes the violation impossible. A bucket policy that denies unencrypted uploads. A database role that has no grant on the restricted schema. A CI check that fails a pull request adding a column named like an identifier to a table not marked as containing personal data. Preventive controls are the cheapest to operate and the most annoying to introduce, because they break existing work.

**Detective.** The control notices the violation after the fact. A scheduled query over the warehouse's information schema listing tables with no owner tag. A daily diff of role membership against the approved access model. A scan for storage objects whose encryption configuration drifted. Detective controls are where most enforcement lives in practice, because you can add them without breaking anything.

**Corrective.** The response when detection fires: revoke, re-encrypt, quarantine, and — always — record what happened. A detective control with no defined corrective response generates alert fatigue and nothing else.

A useful habit is to write each standard as a query you can run. "All Confidential tables have a named owner" is a policy sentence; as a detective control it is:

```sql
select table_schema, table_name
from information_schema.tables t
left join governance.dataset_registry r
  on r.schema_name = t.table_schema
 and r.table_name  = t.table_name
where t.table_schema not in ('pg_catalog', 'information_schema')
  and (r.owner_email is null or r.classification is null);
```

Anything that query returns is a governance defect with a name attached. Run it on a schedule, publish the count, and the count becomes the program's health metric. This is the pattern you will reuse for the rest of the course: express the standard as something queryable, schedule it, and keep the result.

## Where this sits against the pipelines you have built

Governance changes pipeline work in four specific places, and it is worth anticipating them.

At **ingestion**, you now have to declare what you are pulling. A new source table means a new inventory entry, a classification, and an owner — before the first run, not after. If the source contains personal data you did not expect, the pipeline is a governance incident, not just a schema surprise.

At **transformation**, classification propagates. If you derive a column from a Restricted column, the derived column is Restricted until an owner says otherwise. Pipelines that fan sensitive columns out into a dozen marts without carrying the label are the most common way a well-governed source becomes an ungoverned warehouse.

At **storage**, the handling rules bind: which bucket, which key, which grants, which retention. This is the point where the standard becomes configuration.

At **operations**, you inherit obligations that have nothing to do with correctness: access reviews, evidence collection, and responding to requests about specific records. Budget for them. Teams are routinely surprised that governance work is recurring rather than one-off.

## Maturity, and being honest about where you are

Programs are usually described on a five-level scale, and knowing the levels stops you from over-promising:

1. **Ad hoc** — decisions made per request, no inventory, no owners.
2. **Defined** — policies written, roles named, inventory started but incomplete.
3. **Implemented** — inventory complete for in-scope systems, controls in place, exceptions registered.
4. **Measured** — controls monitored continuously, evidence produced automatically, metrics reported to the council.
5. **Optimizing** — controls tuned by risk, automated remediation, program reviewed against outcomes.

Most organizations that believe they are at level 4 are at level 2 with good intentions and one very tidy spreadsheet. The diagnostic question is not "do we have a policy?" but "for this table, can you show me the owner, the classification, the grants, and last quarter's access review, in under ten minutes?" If the answer requires an archaeology project, the program is at level 2 regardless of what the policy library says.

## Common failure modes

**Ownership by default.** No named owner, so the engineer decides. Fix: refuse to be the decision-maker, and make the missing owner a visible defect in the inventory.

**Policy without standard.** Fine words, nothing testable. Fix: for each policy line, ask "what query or configuration export would prove this?" If there is no answer, the policy is not yet a standard.

**A catalog nobody updates.** Fix: generate what you can from the systems themselves — schemas, grants, storage configuration — and reserve human entry for the things machines cannot know, like purpose and owner.

**Governance as a gate at the end.** A review board that sees work only when it is finished produces rework and resentment. Fix: bring classification and ownership questions into design, where changing the answer is cheap.

**Enforcement without escalation.** Detective controls fire, nobody has authority to make anyone act, the alerts get muted. Fix: every recurring control needs a named owner for its findings and a route to the council.

## Practice

Work against a pipeline you have already built, or the sample below if you need one. A `sales_ops` pipeline lands three tables in a warehouse:

- `raw.crm_contacts` — `contact_id`, `full_name`, `email`, `phone`, `country`, `created_at`
- `raw.orders` — `order_id`, `contact_id`, `amount_cents`, `currency`, `placed_at`
- `mart.customer_ltv` — `contact_id`, `email`, `lifetime_value_cents`, `first_order_at`, `segment`

Produce four artifacts.

1. **An inventory entry for each table.** Columns: dataset name, description, source system, data owner (role title, not a real person), steward, custodian, contains personal data (yes/no), retention period, and a one-line purpose. Where you do not know something, write `UNKNOWN — decision needed from <role>` using the role's title rather than guessing. The unknowns are part of the deliverable.

2. **A RACI for five decisions** about `mart.customer_ltv`: classifying it, approving analyst access, implementing the grant, approving a request to export it to a marketing vendor, and approving an exception if the vendor cannot meet the encryption standard. Use the five roles from this lesson.

3. **One policy line turned into a standard and a detective control.** Take the policy "every dataset in the warehouse has a named owner and a classification." Write the standard sentence (testable, specific), then write the SQL detective control that finds violations, then write the corrective response in two sentences: who is notified, and what happens if it is not fixed in ten working days.

4. **An exception register entry.** Invent a plausible exception for this pipeline — for example, `mart.customer_ltv` carries `email` because a downstream tool joins on it, even though the standard says marts should carry surrogate keys only. Record: what the exception is, which standard it breaches, the business justification, the compensating control, the expiry date, and the approving role.

Then review your own work with one question, and write the answer down: if a regulator asked today who is accountable for `mart.customer_ltv` containing email addresses, does your inventory answer them without you in the room? If not, name the specific gap.
