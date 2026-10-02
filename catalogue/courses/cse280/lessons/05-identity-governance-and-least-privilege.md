---
lesson_id: cse280-05
course_id: cse280
pathway: cloud-support-engineer
title: Identity Governance and Least Privilege at Scale
order: 5
kind: lesson
competency_ids:
  - D2-S1-C04
objectives:
  - Govern identity and access at organization scale using least privilege and
    periodic review
---

## From "IAM works" to "IAM is governed"

You already know how identity and access management works: principals, policies, roles, and the evaluation logic that decides whether a call is allowed. That knowledge is enough to make one thing work in one account.

Governance is a different problem, and it appears the moment there is more than one of anything. More than one account. More than one team. More than one year of history. The questions change shape:

- Who is allowed to grant access, and who checks that they were right to?
- What stops a well-meaning engineer from attaching an administrator policy at two in the morning during an incident, and what makes sure it comes off afterwards?
- When someone moves from support to billing, who removes what they no longer need?
- If an auditor asks "who could read the customer database in March", can you answer?

Identity is the single control family that stays yours at every service model — you saw that in the responsibility table in lesson 02 — and it is the control family auditors examine hardest, because it is the one where evidence is most available and excuses are least persuasive. This lesson is about running it at organization scale and proving that you did.

## Guardrails and grants are different mechanisms

The first structural idea is that permissions come from two different directions, and confusing them causes most of the mess.

A **grant** gives a principal the ability to do something. A policy attached to a role saying "may read this bucket" is a grant.

A **guardrail** takes ability away regardless of grants. It is a ceiling that no grant can punch through. Every major provider has one:

- AWS: service control policies applied to organizational units in AWS Organizations, plus permission boundaries on individual principals
- Azure: management group scoped policy and role assignment restrictions, with Azure Policy denying non-conforming resource configurations
- Google Cloud: organization policy constraints applied at the organization, folder, or project level

Guardrails are the governance tool. They let you say, once, at the top of the tree: no resources may be created outside these regions; the audit log configuration may not be modified by anyone in a workload account; the root or organization-owner credentials may not be used for daily work. Then it does not matter how sloppy an individual account's grants become — the ceiling holds.

The compliance value is that a guardrail is a *preventive* control, and preventive controls are cheaper to evidence than detective ones. Showing an auditor a deny policy that has been in force for the whole period, plus the fact that no resource exists outside the permitted regions, is a stronger and shorter conversation than showing them twelve monthly reports in which you looked for violations and found none.

The structure follows the same logic:

```text
organization
├── security          (audit log archive, posture tooling — most locked down)
├── shared-services   (identity, networking, CI)
├── production        (guardrails: region lock, no log tampering, no public buckets)
│   ├── prod-app
│   └── prod-data
└── non-production
    ├── staging
    └── sandbox       (looser guardrails, but never real customer data)
```

Separating environments into separate accounts or subscriptions is itself an access control. It is far easier to say "these eleven people can reach production" than to prove that a permission inside a shared account cannot be escalated into the production resources sitting next to it. Auditors understand account boundaries; they are sceptical of clever policy conditions.

## The identity lifecycle, and the problem in the middle

Access has three lifecycle events, and organizations reliably do two of them well.

**Joiner.** Someone arrives, gets accounts, gets a role. This is done well because it is blocking — the person cannot work until it happens, so someone chases it.

**Leaver.** Someone departs and access is removed. This is done adequately because HR triggers it and because everyone can see why it matters. The audit question is not whether you did it but *how fast*, and whether you can show the timestamp. If your policy says access is removed within one business day, sample your last five leavers before an auditor does.

**Mover.** Someone changes role. This is done badly nearly everywhere, and it is the single most productive place to look for findings. The support engineer who moves to the billing team gets billing access added on day one and keeps their production support access forever, because nothing broke. Five years and three role changes later, that person can do everything, and no single grant looks unreasonable. The accumulated result is called **privilege creep**, and it defeats least privilege quietly.

The fix is structural rather than diligent: **access should be attached to the role, not to the person.** If permissions come from group membership, and group membership is derived from the job function recorded in the directory, then a role change removes the old access as a side effect of adding the new. If permissions come from policies attached directly to individual users, a role change requires somebody to remember, and somebody will not.

```text
Bad:   user "j.okafor" ← policy "prod-db-read"
                       ← policy "billing-export"
                       ← policy "temp-incident-admin"  (added 2025-11, never removed)

Good:  user "j.okafor" ← group "support-tier2" ← role "prod-operate"
                       ← group "billing-ops"   ← role "billing-read"
```

In the good version, removing `support-tier2` membership removes the production access completely and instantly, and the removal is a single auditable event in the directory rather than three separate policy detachments in three separate accounts.

## Designing roles that survive contact with reality

Least privilege is easy to state and hard to implement, because the honest starting position is that nobody knows what permissions a job actually needs. Two failure modes follow. Either you grant broadly "for now" and never narrow, or you grant so narrowly that people are blocked constantly and the organization's real response is to hand out an administrator role to make the complaints stop.

The workable method is to start restrictive and widen from evidence.

1. **Start from deny.** New role, minimal permissions — usually read-only on the resources the job touches.
2. **Let people work and collect the failures.** Access-denied events appear in the audit log. Each one is a data point about a permission the job genuinely needs.
3. **Widen deliberately, in named increments.** Add the specific action, not the wildcard that contains it. Record why.
4. **Use the provider's usage analysis to narrow again.** All three major providers offer tooling that reports which granted permissions have actually been used: AWS IAM Access Analyzer and last-accessed data, Azure's identity governance access reviews and privileged identity reporting, Google Cloud's IAM recommender. Permissions granted and never used over a long period are the safest possible thing to remove.
5. **Re-run step 4 periodically.** Roles rot in the direction of excess.

A worked narrowing. The starting grant an engineer asked for:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:*",
      "Resource": "*"
    }
  ]
}
```

Every action, on every bucket, in the account — including deleting buckets and rewriting bucket policies to make data public. After watching what the job actually did for a month:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ReadExportsOnly",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::acme-prod-exports",
        "arn:aws:s3:::acme-prod-exports/*"
      ],
      "Condition": {
        "Bool": { "aws:SecureTransport": "true" },
        "IpAddress": { "aws:SourceIp": ["203.0.113.0/24"] }
      }
    }
  ]
}
```

Two named actions, two named resources, and two conditions. The conditions are where a lot of least-privilege value hides: requiring encrypted transport and constraining the source range mean that a stolen credential is far less useful away from the office network. Conditions are also the part that most people never write, so they are worth checking for in any policy review.

The same shape exists on the other providers under different names — a role definition with explicit `actions` and `notActions` scoped to a resource group in Azure, a role binding with a condition expression on Google Cloud. The principle is portable even though the syntax is not.

**Permission boundaries** deserve a specific mention because they solve the delegation problem. You often want a team lead to be able to create roles for their own team without being able to create a role more powerful than their own. A boundary attached to the principal caps the effective permissions of anything they create. Without boundaries, "can create roles" is functionally equivalent to "is an administrator", which is a privilege escalation path auditors specifically look for.

## Privileged access

Some access cannot be least-privileged away: someone eventually needs to do something drastic. The governance answer is not to eliminate privilege but to make it rare, temporary, and loud.

**The organization's most powerful credential** — the AWS account root user, the Azure global administrator, the Google Cloud organization administrator — gets special handling everywhere: multi-factor authentication with the factor held physically and securely, no routine use, no access keys, and an alert whenever it authenticates. Almost every framework has something to say about this, and it is the fastest thing to check in an unfamiliar environment.

**Just-in-time elevation** is the current best practice for everything below that. Instead of holding an administrator role permanently, a person requests elevation for a bounded window, with a reason, and often with approval. The provider tooling exists for this and third-party tools fill the gaps. The compliance benefit is enormous and slightly indirect: elevation generates a *record* — who, when, why, approved by whom, for how long — which is exactly the evidence a period audit wants, and which permanent standing access can never produce.

**Break-glass accounts** are the escape hatch for the day the identity provider itself is down. They are legitimate and necessary. They are also a standing risk, so they come with rules: credentials split or vaulted, use alerts to a channel people actually read, and a mandatory post-use review that asks why the normal path failed. An unmonitored break-glass account is just a backdoor with paperwork.

## Non-human identities, where the real findings are

Human identity gets the attention. Machine identity causes more incidents.

Every environment accumulates service accounts, application credentials, CI pipeline identities, and integration keys. They are created under time pressure, granted broadly because narrowing them is fiddly, owned by nobody in particular, and never reviewed because they do not appear in an HR system. The classic audit finding in this space is a **long-lived static access key**, several years old, over-permissioned, present in a configuration file, belonging to a person who left.

The governance position, in order of preference:

1. **Eliminate the credential.** Use platform-native workload identity so that a compute resource obtains short-lived credentials from its own runtime environment: an instance role, a managed identity, a service account attached to a workload. No secret exists to leak.
2. **Federate.** For external systems such as a CI provider, use workload identity federation so the external system exchanges its own token for short-lived cloud credentials. Still no long-lived secret.
3. **If a static key is unavoidable**, then it must have a named human owner, a documented purpose, a rotation schedule that is actually executed, storage in a secrets manager rather than a repository or a configuration file, and monitoring for use from unexpected sources.

Whatever you do, **inventory them**. A service account you do not know about cannot be reviewed, rotated, or revoked. Include machine identities in your access review; they are the population most likely to contain something indefensible.

## The access review, and its evidence

The access review — also called recertification or attestation — is the recurring human control that catches what automation cannot: access that is technically permitted and no longer appropriate. It is the control that most directly satisfies the "reviewed periodically" clause in the requirements you mapped in lesson 04, and it is worth being precise about how it is done, because a badly run review is worse than none. It consumes real effort and produces false assurance.

A review that will hold up has these properties:

**A defined population.** Which accounts, which systems, which identities, including machine ones. Written down before the review starts.

**A reviewer who actually knows.** The right reviewer is the person who knows what the job requires — usually the system owner or the individual's manager — not a security analyst who is guessing. A review performed by someone with no basis for judgement will approve everything.

**A decision per line.** Retain, revoke, or modify. "Approved" as a single blanket action across two hundred rows is a red flag and auditors treat it as one.

**Evidence of the removals.** The review is not finished when decisions are made; it is finished when the revocations are executed and confirmed. The most common half-done review has a signed decision sheet and access still in place.

**A dated record with a name on it.** Who reviewed, what population, on what date, what was decided, when removals completed.

A workable record format:

```text
ACCESS REVIEW RECORD
Review ID:      AR-2026-Q2-PROD
Scope:          Production cloud account (prod-app, prod-data) — all human
                and machine identities with any role assignment
Population:     41 identities (33 human, 8 machine) — inventory export
                evidence/2026-07-01-prod-identity-inventory.csv
Reviewer:       D. Whitfield, Platform Owner
Period covered: 2026-04-01 to 2026-06-30
Performed:      2026-07-03

Decisions:      Retain 34 | Modify 4 | Revoke 3
Exceptions:     1 (see below)

Revocations:
  j.okafor    prod-operate    revoked 2026-07-03  moved to billing 2026-05-12
                                                  (mover gap: 52 days — see finding)
  svc-etl-old  prod-data-rw   revoked 2026-07-03  superseded by svc-etl-v2, unused 8 months
  m.tan        prod-admin     revoked 2026-07-04  contractor engagement ended 2026-06-30

Modifications:
  support-tier2 group  removed s3:DeleteObject  never used in 12 months
  svc-reporting        scoped to reporting bucket only, was account-wide read
  b.iyer               prod-admin → prod-operate  no admin action in 6 months
  svc-sms-gateway      static key replaced with workload identity federation

Exception:
  break-glass-prod retained with standing admin. Justification: identity
  provider outage recovery. Compensating controls: credential vaulted with
  split knowledge, MFA required, alert on authentication to #sec-alerts,
  mandatory post-use review. Accepted by: D. Whitfield. Next review: 2026-10-01.

Attachments:   identity inventory export, permission-usage report, revocation
               tickets OPS-4471/4472/4473, screenshot of post-revocation
               inventory dated 2026-07-04
Signed:        D. Whitfield, 2026-07-04
```

Read what that record does beyond recording decisions. It surfaced a 52-day mover gap, which becomes a finding about the *process* rather than about one person — and process findings are the valuable kind. It documented an exception with compensating controls and an accepting owner, which is how lesson 04's acceptance discipline shows up in practice. It caught an unused machine identity. And it attached the artifacts that prove the removals actually happened, so nobody has to take the reviewer's word for it.

## Practice

Work against the following inventory for the production account of the patient appointment reminder service. Assume the review period is the last calendar quarter and today is the first week of the new one.

```text
IDENTITY            TYPE     ROLE/GROUP        LAST USED    NOTES
a.reyes             human    prod-admin        2 days ago   Platform lead
j.okafor            human    prod-operate      41 days ago  Moved to Billing last quarter
j.okafor            human    billing-read      1 day ago
m.tan               human    prod-admin        11 days ago  Contractor, engagement ended
                                                            at quarter end
s.begum             human    prod-read         3 days ago   Support tier 1
s.begum             human    prod-operate      Never        Granted during an incident
                                                            two quarters ago
d.whitfield         human    prod-admin        5 days ago   Platform owner
root / org owner    human    (all)             8 months ago MFA status unknown
svc-appointments    machine  prod-data-rw      minutes ago  App tier, static key,
                                                            created 3 years ago
svc-etl-old         machine  prod-data-rw      9 months ago Replaced by svc-etl-v2
svc-etl-v2          machine  prod-data-read    1 day ago
svc-sms-gateway     machine  prod-data-read    minutes ago  Static key in an
                                                            application config file
ci-deployer         machine  prod-admin        6 hours ago  CI pipeline, static key
vendor-monitoring   machine  prod-read         Never        Trial from last year
```

**Exercise 1 — Run the access review and produce the record (the main artifact).**

Produce a complete access review record in the format above. Every line in the inventory gets an explicit decision of retain, modify, or revoke, with a one-line reason. Any retention that you consider risky must be recorded as an exception with a compensating control, a named accepting owner, and a next-review date. Include the machine identities; there are at least four defensible revocations or modifications among them.

**Exercise 2 — Find the process findings.**

Three of the problems in this inventory are not about an individual identity at all — they are about a process that is missing or not working. Identify them, and for each write a one-sentence finding stating the process gap rather than the symptom, plus the structural fix. "Revoke m.tan" is a symptom fix; the process finding is the thing you actually want.

**Exercise 3 — Narrow a policy.**

The `svc-sms-gateway` identity currently holds account-wide read on the data services. Its actual job is to read the next hour's appointments from one table and nothing else. Write the tightened policy as a fenced JSON block, using named actions, named resources, and at least one condition. Then write the two-sentence justification you would put in the change ticket, and name the single change that would remove its static key entirely.

**Exercise 4 — Design the guardrail.**

Write, in plain language, three organization-level guardrails you would apply above the production account so that no grant inside it can cause a specific class of problem. For each, state which class of problem it makes structurally impossible, which provider mechanism you would use, and how you would evidence that it was in force for the whole audit period. At least one guardrail must protect the audit logs themselves.

**Exercise 5 — Review the reviewer.**

Trade records with a classmate. Your job is to answer one question about their record: if an auditor picked three lines at random and asked "show me that this decision was executed", could they? Mark every line where the answer is no.
