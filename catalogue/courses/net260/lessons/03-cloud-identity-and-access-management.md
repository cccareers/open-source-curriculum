---
lesson_id: net260-03
course_id: net260
pathway: cybersecurity-support-technician
title: Cloud Identity and Access Management
order: 3
kind: lesson
competency_ids:
  - D6-S1-C01
  - D2-S1-C03
objectives:
  - Apply least-privilege identity and access policy to a cloud account and
    detect over-permissive grants
---

## Identity is the perimeter

In net110 you learned a perimeter you could point at. Traffic arrived at an edge, a firewall decided, and the inside was a place. That model still exists in the cloud, and lesson 04 is about it, but it is no longer the primary control.

Here is why. In a cloud account, nearly every consequential action is an authenticated API call: create a virtual machine, read an object, change a firewall rule, disable logging, mint a new credential. Those calls do not traverse your network. They go to the provider's control plane from anywhere on the internet, and the only thing standing between an attacker and any of them is whether the credential they hold is permitted to make that call.

That is the inversion. On-premises, stealing a credential gets you onto a network where you still have to find and reach things. In the cloud, stealing a credential with broad permissions *is* the whole attack. There is no lateral movement to perform; the API is already global.

So identity comes first in this course, before you build anything. Your first deployment should not be performed from an account that could delete the whole environment, and the fastest way to guarantee that is to understand the permission model before you use it.

This lesson has two halves. First, how cloud authorization actually decides — the mechanics, the same three ways. Second, how to *audit* it: how to look at an account someone else configured and find the grants that are wider than the job requires. The second half is the one you will be paid for.

## The four nouns, in three dialects

Every cloud permission model is built from four things. The names differ; the concepts do not.

**Principal** — the thing making the call. A human user, a group of them, a machine identity, or a role that something has assumed.

**Permission** — a single allowed operation, usually `service:verb` shaped. `s3:GetObject`. `Microsoft.Storage/storageAccounts/blobServices/containers/blobs/read`. `storage.objects.get`.

**Resource** — the specific thing acted upon, addressed by a provider-specific identifier: an ARN, an Azure resource ID, a Google Cloud resource name.

**Policy or binding** — the statement that connects them: *this principal may perform these permissions on these resources, optionally under these conditions*.

Where the three providers really differ is in **what the policy attaches to**.

```text
AWS            Policies attach to the PRINCIPAL (identity policies) and,
               for some services, to the RESOURCE (bucket policies, key
               policies). Both are evaluated together.

Azure          Role definitions (a bundle of actions) are ASSIGNED to a
               principal AT A SCOPE. Scope is the whole model:
               management group > subscription > resource group > resource.
               Assignments inherit downward.

Google Cloud   An IAM POLICY is attached to a RESOURCE and binds roles to
               members. Resources sit in a hierarchy:
               organization > folder > project > resource. Policies inherit
               downward and are ADDITIVE.
```

That last word matters more than anything else on this page. **Inheritance is additive.** A role granted at the top of an Azure management group or a Google Cloud folder is granted on everything beneath it, and nothing further down can take it away by simply not mentioning it. When you find an over-permissive grant, one of your first questions is always: *at what scope was it made?* A `Contributor` assignment at subscription scope and a `Contributor` assignment on one resource group look identical in a list of role assignments and differ by three orders of magnitude in blast radius.

### How a decision is reached

Learn the evaluation order once and it saves you hours of confusion later.

```text
1. Start from IMPLICIT DENY.  Nothing is permitted until something permits it.
2. Collect every policy that applies to this principal and this resource
   (identity-attached, resource-attached, and everything inherited from
   higher scopes).
3. Any EXPLICIT DENY anywhere wins. Immediately. Full stop.
4. Otherwise, if at least one ALLOW matches, the call is permitted.
5. Otherwise it is denied.
```

Two practical consequences.

An explicit deny is an absolute ceiling. This is why organization-level guardrails work: a deny written at the top cannot be overridden by any grant written below it, no matter how privileged the person writing it is. If you need to guarantee that no one in a production account can ever turn off audit logging, an explicit deny at the organization scope is the mechanism.

And a missing allow is silent. When something legitimately breaks with an authorization error, the answer is almost never "add a wildcard until it works" — it is to read the denied call out of the audit log and add exactly that permission. You will do this in the practice.

### Conditions: the part everyone skips

A policy can carry conditions that must hold for the allow to apply. This is where a great deal of least-privilege value hides, and it is consistently the least-used feature of every provider's model.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ReadIntakeExportsFromOfficeOverTls",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::clinic-intake-exports",
        "arn:aws:s3:::clinic-intake-exports/*"
      ],
      "Condition": {
        "Bool": { "aws:SecureTransport": "true" },
        "DateLessThan": { "aws:CurrentTime": "2026-12-31T00:00:00Z" }
      }
    }
  ]
}
```

Two named actions, two named resources, transport encryption required, and an expiry date on the grant itself. The equivalent ideas exist elsewhere: Azure has ABAC conditions on role assignments and time-bound assignments through its privileged identity tooling; Google Cloud has IAM conditions with CEL expressions. When you audit a policy, the absence of conditions is not automatically a finding — but a standing, unconditioned, non-expiring grant to a sensitive resource usually is.

## Credentials: the thing that actually leaks

A permission model is only as good as the credential that carries the identity. Rank the options honestly.

**Worst: long-lived static keys.** An access key pair, a service principal secret, a downloaded service account JSON key. They do not expire, they are copied into config files and CI variables and laptops, and they work from anywhere on earth. The archetypal cloud breach begins with one of these in a public repository or a leaked build log.

**Better: federated human sign-in.** Humans authenticate to the corporate identity provider with MFA and receive short-lived cloud credentials. No cloud-local password, and offboarding in one place removes cloud access everywhere.

**Best: workload identity.** A running workload obtains short-lived credentials from its own environment, with no secret ever stored. An instance profile or task role on AWS, a managed identity on Azure, an attached service account on Google Cloud. For external systems such as a CI provider, workload identity federation lets the external system exchange its own token for short-lived cloud credentials — again, no stored secret.

The audit habit that follows: **whenever you find a static key, ask what it would take to eliminate it, not just to rotate it.** Rotation is a schedule you will eventually miss. Elimination is permanent. And when you find a key that cannot be eliminated, it needs a named human owner, a documented purpose, storage in a secrets manager, and monitoring for use from unexpected sources.

Two credential facts worth memorizing because they show up in real findings:

- The most powerful credential in the account — AWS account root user, Azure Global Administrator, Google Cloud Organization Administrator — should have MFA with the factor physically secured, no access keys at all, no routine use, and an alert on every authentication. Checking this takes ninety seconds and is the single highest-yield first look in an unfamiliar account.
- A credential's power is not what it can do directly. It is what it can do *plus* everything it can escalate to. That is the next section.

## Detecting over-permissive grants

Now the audit half. You are handed an account. Your task is to find grants wider than the job requires and report them in a form someone can act on. Work in passes, cheapest and highest-yield first.

### Pass 1: the wildcards

Search every policy for wildcards and rank what you find.

```text
Action: "*"     Resource: "*"       Administrator. Full account control.
Action: "s3:*"  Resource: "*"       Every action on every bucket, including
                                    delete, and including rewriting bucket
                                    policies to make data public.
Action: "*"     Resource: "<one>"   Total control of one resource. Often
                                    defensible. Often not.
Action: "s3:Get*" Resource: "*"     Read every object in the account.
```

The equivalents elsewhere: an Azure `Owner` or `Contributor` assignment at subscription or management group scope; a Google Cloud `roles/editor` or `roles/owner` binding at project, folder, or organization level. `roles/editor` deserves specific mention because it is the default basic role people reach for and it is enormous — it can modify nearly everything in the project.

For each wildcard, record: the principal, the scope, when it was granted, by whom, and whether it has ever actually been used at that breadth.

### Pass 2: the escalation paths

This is the pass that separates a checklist from an audit. Some permissions are not powerful in themselves but let a principal *grant themselves* more power. A principal holding any of these is effectively an administrator, and it will not look like one in a list of role assignments.

```text
Can create or modify identity policies         -> can grant self anything
Can attach a policy to a principal             -> same
Can create a new principal and credentials     -> makes an admin, uses it
Can create an access key for another identity  -> becomes that identity
Can assume/impersonate a more privileged role  -> is that role
Can modify a role's trust or assignment scope  -> lets self assume it
Can pass a privileged identity to a service    -> service acts as that identity
Can edit a deployment pipeline that deploys
  with a privileged identity                   -> indirect admin
```

That last one is the bridge to lessons 09 and 10, and it is routinely missed. If your CI pipeline deploys using an administrator identity, then everyone who can merge to the deployment branch is an administrator. That is a fact about your access control, and it belongs in your audit even though it does not appear in any IAM console.

The "pass a privileged identity to a service" pattern deserves care because it is subtle everywhere. A principal who may launch a compute instance *and* attach an arbitrary instance role can launch an instance with the administrator role attached and then read credentials from inside it. The fix is to constrain which identities may be passed to which services, not to forbid launching instances.

### Pass 3: the usage evidence

The strongest possible argument for removing a permission is that it has never been used. Every provider surfaces this: AWS reports last-accessed service data and IAM Access Analyzer can generate a policy from observed activity; Azure reports on assignment usage through its identity governance features; Google Cloud's IAM recommender proposes narrowed roles based on ninety days of observed calls.

Use them, and pair the output with the audit log. "Granted `s3:*` on `*`; in 180 days used only `s3:GetObject` and `s3:ListBucket` against two buckets" is a finding with the remediation already written inside it, and no one can argue with it.

### Pass 4: the population nobody reviews

Machine identities. They are created under time pressure, granted broadly because narrowing is fiddly, owned by nobody, and never reviewed because they do not appear in an HR system. In most accounts they outnumber humans and hold more permission. Enumerate every one, and for each answer: what is it for, who owns it, what credential type, when was it last used, and what would it take to remove its static key.

### Pass 5: the mover gap

Human access accumulates. Someone moves from support to billing, gains billing access on day one, and keeps production support access forever because nothing broke. Compare current role assignments against current job function for every human principal. The structural fix is not diligence — it is attaching access to groups derived from job function, so a role change removes old access as a side effect of adding new.

## The audit artifact

An audit that lives in your head is not an audit. Produce a record. This format is deliberately similar to the access-control audits you did in cyb130 and the evidence discipline from cyb150 — the difference is the scope column, which is a cloud-specific concept and the thing reviewers most often get wrong.

```text
ACCESS CONTROL AUDIT — CLOUD ACCOUNT
Account/Subscription/Project: clinic-prod-01
Auditor:  A. Nkemelu            Date: 2026-07-14
Scope:    All principals with any role in the production account, human and
          machine. Population evidence: evidence/2026-07-14-iam-inventory.csv
Method:   Wildcard scan, escalation-path review, 180-day usage report,
          machine identity enumeration, mover comparison against HR roster.
Authorization: Written approval from Platform Lead, ticket SEC-2210.

Population: 27 principals (9 human, 18 machine)

FINDINGS
F1  CRITICAL   ci-deployer (machine) holds admin-equivalent at account scope.
               Grant: Action "*" on Resource "*". Static key, created 2023-02,
               never rotated. Used only for 6 deploy actions in 180 days.
               Escalation: anyone who can merge to main deploys as admin.
               Fix: replace with workload identity federation; scope to the
               6 observed actions on the 3 deployment target resources.
               Owner: Platform Lead. Target: 14 days.

F2  HIGH       j.okafor retains prod-operate 63 days after transfer to Billing.
               Last use of prod-operate: 61 days ago.
               Fix: revoke now; move production access to group membership
               derived from the directory job function so movers lose it
               automatically. Owner: IT. Target: revoke immediately.

F3  HIGH       svc-reporting (machine) holds storage read at PROJECT scope
               where its job needs one bucket. Inherited from a folder-level
               binding, so it also reads the two other projects in the folder.
               Fix: remove folder binding; bind at the single bucket.
               Owner: Data Lead. Target: 7 days.

F4  MEDIUM     3 human principals may create access keys for other identities.
               None have done so. This is an escalation path, not a use.
               Fix: remove the permission; route key creation through a
               reviewed request. Owner: Platform Lead. Target: 30 days.

F5  MEDIUM     Root/organization-owner credential: MFA present, but an access
               key exists and was last used 8 months ago.
               Fix: delete the access key. Owner: Platform Lead. Target: 3 days.

F6  LOW        vendor-monitoring (machine) granted read 14 months ago, never
               used. Trial ended.
               Fix: delete the principal. Owner: Platform Lead. Target: 30 days.

ACCEPTED RISK
  break-glass-prod retains standing admin. Justification: identity provider
  outage recovery. Compensating controls: credential vaulted with split
  knowledge, MFA required, alert on any authentication, mandatory post-use
  review. Accepted by: D. Whitfield, Platform Owner. Next review: 2026-10-14.

NOT EXAMINED
  Application-level roles inside the appointment service. Cloud IAM only.
```

Notice what makes this usable: every finding names a principal, states the grant *and its scope*, cites evidence of use or non-use, gives a specific fix rather than "apply least privilege," and names an owner and a date. A finding without an owner is a complaint.

## Narrowing a policy, worked

The starting grant, which an engineer requested because "the exporter needs storage access":

```json
{
  "Version": "2012-10-17",
  "Statement": [
    { "Effect": "Allow", "Action": "s3:*", "Resource": "*" }
  ]
}
```

Pull 90 days of activity for that principal from the audit log and you find exactly three distinct actions against exactly one bucket prefix. The narrowed policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "WriteNightlyExportsOnly",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:AbortMultipartUpload"],
      "Resource": "arn:aws:s3:::clinic-exports/nightly/*",
      "Condition": { "Bool": { "aws:SecureTransport": "true" } }
    },
    {
      "Sid": "ListOwnPrefix",
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::clinic-exports",
      "Condition": { "StringLike": { "s3:prefix": "nightly/*" } }
    }
  ]
}
```

The same narrowing expressed as an Azure custom role, showing that the idea travels even though the syntax does not:

```json
{
  "Name": "Nightly Export Writer",
  "IsCustom": true,
  "Description": "Write nightly export blobs only.",
  "Actions": [],
  "DataActions": [
    "Microsoft.Storage/storageAccounts/blobServices/containers/blobs/write",
    "Microsoft.Storage/storageAccounts/blobServices/containers/blobs/add/action"
  ],
  "NotDataActions": [
    "Microsoft.Storage/storageAccounts/blobServices/containers/blobs/delete"
  ],
  "AssignableScopes": [
    "/subscriptions/<sub-id>/resourceGroups/clinic-prod/providers/Microsoft.Storage/storageAccounts/clinicexports"
  ]
}
```

Read `AssignableScopes` carefully — that single line is the difference between a role that can only ever be attached to one storage account and one that could be attached anywhere in the subscription.

Write the change ticket justification in two sentences, always: *what evidence supports the narrowing*, and *what breaks if you are wrong*. "90 days of audit log show only PutObject/AbortMultipartUpload/ListBucket against `nightly/`. If a quarterly job uses a wider action we have not observed, it will fail with an access-denied event that we will see in the log within one hour."

Then — and this is the step people skip — **watch for the denials after you deploy the narrowing.** Least privilege applied without a feedback loop is how teams end up handing out administrator to make the complaints stop.

## Practice

All exercises run against your own lab or sandbox account, or an instructor-provided target account, with written authorization confirmed before you start. Do not enumerate identities in any account you have not been explicitly authorized to examine.

**Exercise 1 — Read the evaluation.**

For each case, state whether the call is allowed or denied and cite the rule that decided it.

```text
a. Principal has an identity policy allowing s3:GetObject on bucket X.
   An organization-level policy denies all s3 actions in this account.
b. Principal has no policy mentioning s3 at all.
c. Principal has Contributor assigned at subscription scope; the resource
   group has no assignment for that principal.
d. Principal has an allow with a condition requiring TLS; the call arrives
   over plain HTTP.
e. A Google Cloud folder-level binding grants roles/storage.objectViewer;
   the project inside it has no storage bindings.
```

**Exercise 2 — Find the escalation paths.**

Given the four policies below, identify every principal that is effectively an administrator, and write one sentence per principal explaining the path. At least three of the four qualify.

```text
P1  iam:CreatePolicy, iam:AttachUserPolicy on "*"
P2  ec2:RunInstances on "*", iam:PassRole on "*"
P3  s3:GetObject, s3:PutObject on one bucket
P4  Write access to the repository that defines the deploy pipeline, where
    the pipeline runs with an identity holding Action "*" on Resource "*"
```

**Exercise 3 — Narrow from evidence.**

Your instructor provides (or you generate in your lab) 30 days of audit log activity for one over-permissioned machine identity. Produce: the observed action list, a narrowed policy as a fenced JSON block using named actions, named resources, and at least one condition, the two-sentence change-ticket justification, and the specific log query you would run afterwards to catch any access-denied events the narrowing causes.

**Exercise 4 — Run a full access-control audit.**

Against your lab account, perform all five passes and produce a complete audit record in the format above. Requirements: state your authorization at the top; give a population count split human and machine; produce at least six findings with severity, scope, evidence of use, a specific fix, an owner, and a target date; record at least one accepted risk with compensating controls and an accepting owner; and include a "not examined" section. Findings that say only "apply least privilege" do not count.

**Exercise 5 — Kill a static key.**

Choose one machine identity in your lab that authenticates with a long-lived static key. Write the migration plan to remove that key entirely: which workload identity or federation mechanism replaces it, the order of operations that avoids an outage, how you will confirm the old key is unused before deleting it, and the rollback step if the cutover fails. Then execute it in the lab and attach the audit log evidence showing the last use of the old key and the first use of the new identity.

## Check your understanding

1. A principal has an identity policy allowing `s3:GetObject` on a bucket, and an organization-level policy denies all `s3` actions in the account. Allowed or denied, and why?
2. `P2` holds `ec2:RunInstances` and `iam:PassRole` on `*` and no IAM-write permissions. Under what conditions can it gain administrator privileges?
3. Two `Contributor` assignments look identical in a list. What single field do you record to tell their blast radius apart?

**Answers:** (1) Denied — an explicit deny anywhere wins over every allow. (2) If an existing administrator role trusts EC2 and is available through an instance profile, and no other controls block the launch or role pass, it can launch an instance with that role and use its credentials. The two permissions alone do not create an administrator role. See [AWS PassRole requirements](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_passrole.html). (3) The scope at which each was granted (resource group vs. subscription or higher), since inheritance is additive downward.
