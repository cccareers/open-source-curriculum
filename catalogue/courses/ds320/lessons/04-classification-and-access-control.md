---
lesson_id: ds320-04
course_id: ds320
pathway: data-engineer
title: Classification and Access Control
order: 4
kind: lesson
competency_ids:
  - D5-S1-C01
objectives:
  - Classify a dataset and grant access according to least privilege
---

## Classification comes first

You cannot decide who may read a table until you have decided what the table is. Classification is that decision, made once per dataset by its owner, recorded in the inventory, and then used as the input to every other control in this course — which grants are allowed, which key encrypts it, how long its audit log is kept.

A classification scheme is a small ordered set of labels plus, for each label, a set of **handling rules**. The labels alone are decoration. Four levels are typical, and four is a good number: two is too coarse to be useful and seven means nobody remembers the middle ones.

| Label | Meaning | Example in a warehouse | Handling rules (abbreviated) |
| --- | --- | --- | --- |
| Public | Cleared for release outside the organization | Published product catalog | No access restriction; integrity controls only |
| Internal | Default for business data with no personal or contractual sensitivity | Aggregated order counts by region | Authenticated employees; no external sharing |
| Confidential | Personal data, commercially sensitive data, contractual restrictions | `raw.crm_contacts`, revenue by account | Named role membership, owner approval, encryption with managed key, access reviewed quarterly |
| Restricted | Severe harm if disclosed: special category data, credentials, payment data | Government identifiers, auth secrets | Explicit per-person approval, time-bound, dedicated key, all access logged and alerted |

Two rules keep a scheme honest. **Classification is by highest element**: a table containing one Confidential column is a Confidential table, unless you split it. **Classification propagates through derivation**: a mart built from a Confidential source is Confidential until an owner explicitly declassifies it on the basis of what it actually contains. Aggregation is the usual justification for declassifying — but aggregation is not automatically safe. A count of one is a disclosure, and "revenue by account" is not de-identified simply because you grouped it.

### Classifying at column granularity

Table-level labels are where you start; column-level labels are what let you avoid locking a whole mart because of one email address. Record them as metadata you can query. In PostgreSQL, comments are a serviceable, dependency-free home for this:

```sql
comment on column raw.crm_contacts.email is
  'classification=confidential; category=direct_identifier; owner=customer_ops';
comment on column raw.crm_contacts.country is
  'classification=internal; category=attribute; owner=customer_ops';
```

A dedicated registry table is better once you have more than a handful, because it can be joined and validated:

```sql
create table governance.column_classification (
  schema_name     text not null,
  table_name      text not null,
  column_name     text not null,
  classification  text not null
    check (classification in ('public','internal','confidential','restricted')),
  data_category   text not null,
  owner_role      text not null,
  classified_at   timestamptz not null default now(),
  primary key (schema_name, table_name, column_name)
);
```

With that in place, "which Confidential columns are exposed by this view?" becomes a query rather than a meeting. Whichever store you use, the requirement is the same: classification must be **machine-readable**, because every control downstream needs to consume it, and a label that lives only in a slide deck cannot drive a grant.

Practical heuristics for classifying a dataset you did not build:

- Start from the data map you built in the previous lesson. Anything you marked as a direct identifier, an online identifier, or special category or sensitive data is Confidential at minimum, and special category or sensitive data is Restricted.
- Ask what harm disclosure causes, and to whom. Harm to a person outranks embarrassment to the company.
- Look for free-text columns. `notes`, `description`, and `comment` fields are where unclassifiable personal data hides, because humans type anything into them. Treat unconstrained free text touched by customer-facing staff as Confidential until proven otherwise.
- Do not classify by system. "Everything in the warehouse is Internal" is how a Restricted column ends up readable by two hundred people.

## Access control models

Three models, and you will use two of them.

**Discretionary access control (DAC)** is the model relational databases were built on: the object owner grants privileges directly to other principals, and grantees may sometimes pass them on. It is simple and it does not scale — permissions accumulate on individuals and nobody can answer "what can Dana see?" without walking a graph.

**Role-based access control (RBAC)** is the working model for almost all data platforms. Privileges are granted to roles; people are granted roles. The reason this matters is not tidiness, it is **reviewability**: with RBAC, an access review is a list of role memberships that a data owner can actually read and approve. Design roles around *job functions* — `analyst_marketing`, `engineer_pipeline`, `support_tier1` — not around individual tables, and never around individual people.

**Attribute-based access control (ABAC)** decides from attributes evaluated at query time: the principal's department, the row's region tag, the data's classification, the time of day. ABAC expresses policies RBAC cannot ("analysts may see rows for their own region"), at the cost of being harder to reason about and much harder to review. Use it for the dimension that genuinely varies per row, and keep RBAC for everything else.

The principle that governs all three is **least privilege**: every principal has exactly the access its function requires, for exactly as long as it requires it, and no more. Its close relatives are **separation of duties** (the person who approves access is not the person who implements it, and the person who can change data is not the sole person who can delete the audit log) and **time-bounding** (access that expires beats access that must be remembered).

Note also that principals are not only humans. Service accounts — the identities your pipelines run as — are usually the most over-privileged principals in any data platform, because they were granted broad rights during development and nobody narrowed them afterwards. A pipeline service account that can `DROP` a schema is a bad day waiting for a bug.

## Implementing it: PostgreSQL

Work from a clean model: schema-level grants to functional roles, no privileges on `PUBLIC`, and views or row-level security for anything finer.

```sql
-- Start from deny. New databases grant CREATE and USAGE on public to PUBLIC.
revoke all on database warehouse from public;
revoke all on schema public from public;

-- Functional roles. NOLOGIN roles are containers; people log in as themselves.
create role analyst_marketing nologin;
create role engineer_pipeline nologin;

-- Read access to the mart layer for analysts.
grant usage on schema mart to analyst_marketing;
grant select on all tables in schema mart to analyst_marketing;
alter default privileges in schema mart
  grant select on tables to analyst_marketing;

-- The pipeline writes raw and mart, and reads nothing it does not need.
grant usage, create on schema raw to engineer_pipeline;
grant select, insert, update, delete on all tables in schema raw to engineer_pipeline;

-- People and services get roles, never direct object grants.
create role dana login;
grant analyst_marketing to dana;
```

`ALTER DEFAULT PRIVILEGES` is the line people forget, and its absence is the most common access defect in a warehouse: tables created next month silently have no grant, so someone fixes it with a hurried `GRANT ALL`.

**Column-level control.** Two options. Grant on specific columns, which is precise but easy to miss on new columns:

```sql
grant select (contact_id, country, created_at)
  on raw.crm_contacts to analyst_marketing;
```

Or expose a view that omits the Confidential columns, which is usually the better pattern because the view is a reviewable artifact and the base table stays ungranted:

```sql
create view mart.customer_ltv_safe as
select contact_id, lifetime_value_cents, first_order_at, segment
from mart.customer_ltv;

grant select on mart.customer_ltv_safe to analyst_marketing;
```

**Row-level control** via row-level security, which is PostgreSQL's ABAC:

```sql
alter table mart.customer_ltv enable row level security;

create policy region_scope on mart.customer_ltv
  for select
  using (
    region = current_setting('app.user_region', true)
  );
```

Two cautions worth internalizing. Row-level security is bypassed by the table owner and by superusers unless you `alter table ... force row level security`, so the policy you wrote may not apply to the very account running your tests. And a policy that reads a session variable is only as trustworthy as the code that sets it — if an analyst can set `app.user_region` themselves, the control is theatre. Set it from a trusted connection layer, not from client SQL.

**Auditing what you granted.** Least privilege is a claim; make it a query:

```sql
select grantee, table_schema, table_name, privilege_type
from information_schema.role_table_grants
where grantee not in ('postgres')
order by grantee, table_schema, table_name;
```

Run it monthly, diff it against the approved access model, and treat every difference as a finding. That diff is your detective control from lesson 2, applied to access.

## Implementing it: the cloud side

Object storage is the other half, and its failure modes are different. Using AWS as the concrete example, an identity policy grants a role read access to exactly one prefix:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ReadCuratedPrefixOnly",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::acme-warehouse",
        "arn:aws:s3:::acme-warehouse/curated/sales/*"
      ],
      "Condition": {
        "StringEquals": { "aws:PrincipalTag/department": "marketing" }
      }
    }
  ]
}
```

The equivalents on other providers differ in syntax but not in shape: an identity, a set of actions, a scoped resource, and optional conditions. Four rules carry across all of them.

**No wildcards in `Action` or `Resource` on anything above Internal.** `s3:*` on `*` is not a policy, it is an admission of defeat.

**Prefer a deny at the boundary.** A bucket policy that denies any principal outside your organization, or any request not using TLS, catches the mistakes that identity policies miss. Preventive beats detective when it is cheap.

**Use roles and short-lived credentials, never long-lived access keys**, for both humans and jobs. A pipeline should assume a role; a static key checked into a repository is the most common serious finding in any data platform audit.

**Separate buckets or prefixes by classification.** Mixing Restricted and Internal objects under one prefix means every policy has to be written per object, which means it will be written wrongly.

The mapping between the two worlds matters too: if your warehouse reads external tables from object storage, an analyst denied a column in the database but allowed the underlying files has no restriction at all. Check that the storage layer does not undo the database layer.

## Operating access over time

Granting access is the easy half. The half that produces audit findings is what happens over the following two years.

**Request and approval.** Every grant starts as a request with a stated business purpose, approved by the data owner (lesson 2's RACI), implemented by you. The approval record is evidence; keep it with the ticket.

**Provisioning through groups.** Wire the identity provider to database roles and cloud roles so that role membership follows the group, and joining or leaving a team changes access automatically. Manual grants drift within weeks.

**Access reviews (recertification).** Quarterly for Confidential, more often for Restricted: produce the current membership list per role, send it to the data owner, and remove anything not affirmatively re-approved. The default must be removal, not retention — reviews where silence means "keep it" achieve nothing.

**Joiners, movers, leavers.** Leavers are usually handled. *Movers* are not: someone transfers from support to marketing and accumulates both role sets. Movers are where privilege creep comes from, and the fix is to re-derive membership from the new job function rather than adding to the old.

**Break-glass access.** Emergencies happen; a production incident may genuinely need elevated access. Provide a documented path that is time-bounded, requires a second approver, alerts on use, and is reviewed afterwards. If you do not provide one, engineers will keep a standing admin account instead, and that is far worse.

**Service account hygiene.** One identity per pipeline, scoped to its own schema and prefix, no interactive login, credentials rotated on a schedule, and no sharing between jobs. When a job is retired, its identity is retired with it.

Anti-patterns to name and refuse: shared logins ("the analytics account"), grants to `PUBLIC`, an admin role handed out to speed up onboarding, permissions granted directly to individuals instead of roles, and "temporary" access with no expiry. Each of them defeats reviewability, which is the property that makes least privilege provable rather than merely intended.

## Practice

Use the `sales_ops` warehouse: `raw.crm_contacts` (`contact_id`, `full_name`, `email`, `phone`, `country`, `created_at`), `raw.orders`, `raw.web_events`, `mart.customer_ltv` (`contact_id`, `email`, `region`, `lifetime_value_cents`, `first_order_at`, `segment`), plus an object-storage bucket `acme-warehouse` with `raw/`, `curated/`, and `exports/` prefixes.

1. **Classify it.** Produce a column-level classification table for all four database tables using the four-label scheme, with a one-line justification per Confidential or Restricted column. Then state the table-level label for each table and, where a table is Confidential only because of one or two columns, propose the split or view that would let most consumers work at Internal.

2. **Write the access model.** Define three functional roles — marketing analyst, support agent, pipeline service account — and for each one state the business purpose, the objects it may reach, the privileges it needs, and the review cadence. Justify every privilege in a phrase; anything you cannot justify, remove.

3. **Implement it in SQL.** Write the full script: revoke defaults, create roles, grant schema and table privileges, set default privileges, create the safe view that hides `email` from `mart.customer_ltv`, and enable row-level security so a support agent sees only their own region. Include the `force row level security` consideration and say, in a comment, where `app.user_region` is set and why an analyst cannot set it themselves.

4. **Write one cloud policy.** Grant the marketing analyst role read access to `curated/sales/` only, denying everything else, and add a bucket-level deny for requests not using TLS. Then answer in two sentences: does this policy let an analyst bypass the column restriction from step 3 by reading the underlying files? Fix it if it does.

5. **Run an access review.** Using the `information_schema.role_table_grants` query, produce the current-state list for your implementation, compare it line by line to the access model from step 2, and write up any difference as a finding with an owner and a remediation. Then add one deliberate defect to your script — a stray `grant select on all tables in schema raw to analyst_marketing` — re-run the review, and confirm it is caught.
