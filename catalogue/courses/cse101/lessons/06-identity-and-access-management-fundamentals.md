---
lesson_id: cse101-06
course_id: cse101
pathway: cloud-support-engineer
title: Identity and Access Management Fundamentals
order: 6
kind: lesson
competency_ids:
  - D2-S1-C04
objectives:
  - Apply least-privilege identity and access management to a cloud account
---

## Identity is the perimeter

In a building, security is physical. The server room has a door, the door has a lock, and the network inside the building is trusted because you had to get past the lock to reach it. That model does not survive the move to cloud. Your resources sit in a facility you will never enter, on a network shared with strangers, reachable from anywhere on the internet by anyone holding a valid credential.

So the question "who can do this?" stops being answered by walls and starts being answered by **identity and access management** — IAM. Every action against a cloud platform is an API call, every API call carries an identity, and the platform decides on each one whether that identity is permitted. There is no other gate. A credential with broad permissions is, functionally, the key to the building, and it fits in a chat message.

This is why lesson 02 put configuration and identity on the customer's side of the line in *every* service model. The provider will authenticate and authorize perfectly against whatever policy you wrote. If the policy says everyone may delete everything, that is what will be enforced, flawlessly, at eleven nines of reliability.

Two words that get used interchangeably and must not be:

- **Authentication** establishes *who* the caller is. Passwords, multi-factor devices, certificates, signed requests, federated tokens.
- **Authorization** establishes *what* that caller may do. Policies, roles, permissions, scopes.

Most cloud incidents are authorization failures wearing authentication's coat. The credential was legitimate. It was simply allowed to do far more than the task required.

## The pieces every platform has

The vocabulary differs across providers; the parts do not.

**Principals** are things that can make a request.

- A **user** is a human with sign-in credentials. In a well-run organization, cloud users are federated from a central directory rather than created individually in each account, so that off-boarding one person removes their access everywhere at once.
- A **group** is a named set of users. Permissions attach to the group; users join and leave. Groups exist so that "what can a support engineer do" is written once instead of copied fifteen times and drifting.
- A **service identity** — service account, managed identity, workload identity — is a non-human principal used by code. A virtual machine, a container, a function, or a deployment pipeline assumes one to call other services.
- A **role** is a bundle of permissions that a principal can *assume* temporarily, receiving short-lived credentials in exchange. Roles are the mechanism that makes long-lived secrets unnecessary, and they are the single most important idea in this lesson.

**Permissions** are individual verbs on resource types: read an object, restart an instance, create a user, decrypt with a key. They are always specific. There is no "admin" permission, only policies that happen to include everything.

**Policies** bind principals to permissions on resources, with optional conditions. Every platform's policy language is some arrangement of four ideas:

| Element | Question it answers | Example |
| --- | --- | --- |
| Effect | Allow or deny? | `Allow` |
| Action | Which operations? | read an object, list a container |
| Resource | On what, exactly? | one bucket, one prefix, one instance |
| Condition | Under what circumstances? | only with MFA, only from a network range, only before a date |

Here is a generic policy in that shape. The syntax on your platform will differ; the structure will not.

```json
{
  "version": "2026-01-01",
  "statements": [
    {
      "sid": "ReadInvoicesOnly",
      "effect": "Allow",
      "actions": ["storage:GetObject", "storage:ListBucket"],
      "resources": [
        "storage:::billing-archive",
        "storage:::billing-archive/invoices/*"
      ],
      "condition": {
        "bool": { "auth:MultiFactorAuthPresent": "true" },
        "ip_address": { "network:SourceIp": "203.0.113.0/24" }
      }
    }
  ]
}
```

Read it as a sentence: *this principal may read and list, but only in the invoices prefix of one named bucket, and only when authenticated with a second factor from the office network.* Every clause narrows. That is what a least-privilege policy looks like — the narrowing is the whole document.

**Evaluation** works the same way nearly everywhere and the rules are worth memorizing:

1. **Deny by default.** No matching allow means denied. Absence of a policy is not permission.
2. **An explicit deny always wins.** No allow, anywhere, at any level, can override it.
3. **Permissions accumulate** across everything attached to the principal — its own policies, its groups' policies, the role it assumed, and policies attached to the resource itself.
4. **Upper-level guardrails cap the maximum.** Organization-level policies, permission boundaries, and scope inheritance limit what may be granted below, regardless of what a local administrator writes. This is how a central team stops any account from disabling audit logging.

That combination — accumulate the allows, cap with the guardrails, then let any explicit deny override — explains almost every "why can I not do this" ticket you will ever receive.

### RBAC and ABAC

Two models for expressing the same intent.

**Role-based access control** grants permissions to named roles: `billing-reader`, `deployment-operator`, `database-admin`. Principals get roles. It is simple, auditable, and it is where you should start.

**Attribute-based access control** grants permissions based on attributes matching between the principal and the resource — a policy saying "you may manage instances whose `team` tag equals your own `team` attribute." One policy then covers every team, and adding a team requires no policy change at all. It is powerful, and it is only as good as your tagging discipline. Untagged resources match nothing, and inconsistently tagged ones match the wrong thing.

The mature pattern is both: roles for the coarse shape of a job, attribute conditions to scope those roles to the right slice of resources.

### How the three platforms express this

Same ideas, three vocabularies. This is the lesson-04 translation skill applied to permissions.

| Concept | AWS | Azure | Google Cloud |
| --- | --- | --- | --- |
| Identity store | IAM (+ Identity Center) | Entra ID | Cloud Identity |
| Permission bundle | Policy (JSON document) | Role definition | Role (predefined or custom) |
| Grant to a principal | Attach policy / assume role | Role assignment at a scope | IAM binding on a resource |
| Non-human identity | IAM role, instance profile | Managed identity | Service account |
| Where the grant applies | Resource ARNs in the policy | The scope of the assignment | The resource the binding is on |
| Org-wide ceiling | Service control policy | Azure Policy / management group | Organization policy |
| Temporary credentials | STS-issued session | Managed identity token | Short-lived service account token |

The important structural difference: AWS puts the resource *inside* the policy document, while Azure and Google Cloud attach the grant *at* a resource scope and inherit downward. So on AWS you read a policy to learn its blast radius; on the other two you must also know where the assignment was made. When you troubleshoot access on an unfamiliar platform, that is the first thing to ask.

## Least privilege, concretely

"Least privilege" means every principal holds exactly the permissions its task requires, on exactly the resources it touches, for exactly as long as it needs them — and nothing else. It is easy to say and genuinely hard to do, because the pressure runs the other way: broad permissions make things work immediately, and nobody gets paged for a permission that was too wide.

Five practices make it achievable.

**Start from zero and add.** The only workable direction. Grant nothing, run the task, read the denial, grant that one permission, repeat. It takes an afternoon and produces a policy that is correct. Starting from administrator and trimming later never happens, because nothing is broken and therefore nothing gets trimmed.

**Grant to the task, not to the person.** The question is never "is Priya trustworthy." It is "what does the nightly export job need." Priya may be entirely trustworthy and still paste a command into the wrong terminal.

**Scope the resource, always.** A policy that says every bucket when the job touches one bucket is not least privilege even if the actions are read-only. Wildcards in the resource field are where blast radius is created.

**Prefer temporary credentials.** A role assumed for an hour cannot leak into a repository and be usable next year. Long-lived access keys are the credential type that turns up in breach reports.

**Review on a schedule.** Permissions accrete. Somebody needed elevated access for a migration in March and still has it in November. Every platform reports when a permission or credential was last used; that report is the review.

### The blast-radius question

Before granting anything, ask one question: *if this credential were posted publicly right now, what is the worst outcome?*

- Read access to one bucket of public marketing images: embarrassing, survivable.
- Read access to one bucket of customer records: a breach notification and possibly a regulator.
- Write access to production storage: data destruction.
- Ability to create identities: full and permanent takeover, because the attacker can now grant themselves anything and outlive the credential you rotate.

That last category — permissions that grant permissions — is qualitatively different from everything above it and belongs to almost nobody. `iam:*`-shaped permissions, role-assignment rights, and organization-policy edit rights are the crown jewels. Guard them separately from ordinary administrative access.

### The account you must not use

Every platform has an initial identity created with the account itself — root user, global administrator, project owner. It can do everything, including things no policy can restrain.

The rules are the same everywhere and they are not negotiable: put a long unique password on it, enable the strongest available multi-factor method, remove any programmatic access keys it has, store the recovery details somewhere physically secure with two people knowing the process, and then **stop using it**. Create ordinary administrative identities for daily work. Alert on any use of the root identity — a login there should page someone.

### Authentication: the other half

Least privilege limits what a credential can do. Authentication controls decide how likely it is that the wrong person is holding it. Four practices, and they are not optional extras.

**Federation and single sign-on.** Rather than creating users inside each cloud account, connect the cloud to the organization's existing identity provider. Users sign in once, with the company's password policy and multi-factor requirements, and receive a temporary cloud session. The payoff is off-boarding: disabling one directory account removes access to every account, subscription, and project at once. Creating cloud-local users in twelve accounts guarantees that in a year nobody knows where they all are — and the ex-employee's access outlives their laptop.

**Multi-factor authentication, mandatory, for every human.** A password alone is one leak away from an attacker. Not all factors are equal: hardware security keys and platform authenticators resist phishing because the credential is bound to the site; app-generated codes are good; SMS is the weakest common option because phone numbers can be taken over. Require the strongest factor your organization can actually support, and require it unconditionally on anything that can change permissions.

**Short-lived credentials wherever possible.** A role session that expires in an hour is a fundamentally different risk object from a key that never expires. This is why every platform's recommended pattern for code is an attached identity rather than a stored key: the platform issues and rotates the token automatically, and there is nothing for a developer to accidentally commit.

**Rotation and inventory for the keys you cannot avoid.** Some third-party integration will demand a static credential. When it does: store it in the platform's secrets service rather than in configuration, give it the narrowest possible policy, record its owner and its rotation date, and rotate on schedule with a two-key overlap so nothing breaks during the change. A credential with no recorded owner is a credential nobody will ever dare to delete.

A word on **sessions and conditions**, since they interact. Session duration, re-authentication requirements for sensitive actions, and conditions like "only from a corporate network" or "only with MFA present" are all authentication controls expressed inside authorization policy. That is why the condition block in the policy example earlier tested for multi-factor authentication: the two halves meet there, and it is the cheapest place to add defence in depth.

## The failure modes you will actually see

**The wildcard policy.** Allowing every action on every resource "temporarily," which becomes permanent. This is the most common finding in every cloud security audit ever run.

**The shared user.** One login that four people know the password to. Multi-factor is impossible in practice, nobody can be off-boarded, and the audit log records "the deploy user" for every action, which is the same as recording nothing.

**Long-lived keys in the wrong places.** In a repository, in a container image layer, in an environment file committed by accident, in a support ticket screenshot, in a Terraform state file in a readable bucket. Automated scanners find public keys in seconds. Use roles; when a static key is unavoidable, store it in the platform's secrets service and rotate it on a schedule.

**The over-privileged service identity.** A virtual machine granted administrator "so the app works." Now every vulnerability in that application is an account-wide compromise, because code running on the instance can request the instance's credentials from the local metadata endpoint. Service identities should be the *narrowest* principals in the account, not the widest.

**Public storage.** The permission failure from lesson 02, and the one that makes the news. Every platform now has account-level settings that block public access outright regardless of individual bucket policy. Turn them on and treat any exception as a reviewed decision with a named owner.

**The orphan.** A contractor's identity, a decommissioned service's account, a key belonging to someone who left in 2024. Nobody deletes them because nobody is certain nothing depends on them. Last-used data settles it: no use in 90 days, disable; no complaint in 30 more, delete.

## Auditing and troubleshooting access

Two questions come up constantly, and they have opposite shapes.

**"Who did this?"** The answer is in the audit log — the control-plane record of every API call, with the caller identity, source address, timestamp, parameters, and outcome. Every platform has one. Three things must be true for it to help: it is enabled on every account and region, it is delivered somewhere the ordinary administrators cannot alter it, and its retention is longer than your time-to-discovery. An audit trail that a compromised admin can delete is decoration.

**"Why can this identity not do the thing?"** Work it in this order:

1. **Read the denial message itself.** It usually names the principal, the action, and the resource. That is three-quarters of the answer, and it is routinely skipped.
2. **Confirm which identity is actually calling.** Not who is logged into the console — what the code is presenting. On a VM or container this is often an attached service identity, not the developer's user. Every CLI has a "who am I" command; run it.
3. **Check for an explicit deny and for guardrails above.** An organization-level policy or a permission boundary can block something a local policy allows, and the message will not always say so.
4. **Check the resource-side policy** as well as the identity-side one. Many services allow both, and both must permit the call.
5. **Check the conditions.** MFA absent, wrong source network, expired session, or a request from a region the condition excludes.
6. **Check that the resource identifier in the policy actually matches** — including the prefix. `bucket-name` and `bucket-name/*` are two different resources, and a policy naming only the first allows listing but not reading objects. This exact mismatch is one of the most common access tickets in existence.
7. **Use the platform's policy simulator** before editing anything. All three have one. Simulating a change is free; discovering in production that you removed a permission the batch job needed at 2 a.m. is not.

The discipline that matters here: **never resolve an access ticket by widening permissions until it works.** That converts a five-minute investigation into a permanent security defect, and the person who inherits it will not know why the wildcard is there. Find the missing specific permission and grant that one.

### Designing roles for a small team

A concrete shape you can reuse. For a six-person company running one production workload:

- **`break-glass-admin`** — full administrative rights, MFA required, credentials stored offline, use alerts to the whole team, exercised only during incidents. Two people can reach it.
- **`platform-operator`** — create and manage compute, storage, and networking in production. No identity-management permissions. Assumed as a role with a session limit, not held permanently.
- **`developer`** — full rights in the development account or project, read-only in production, plus the ability to read production logs and metrics because debugging without logs is not a job.
- **`support-engineer`** — read-only across production, plus a narrow set of safe operational actions: restart a service, re-run a failed job, read a queue. Explicitly no delete, no permission changes, no data export.
- **`billing-viewer`** — cost and billing data only, no infrastructure access at all. The finance contact needs this and nothing else, and giving them read-only-everything instead is a common lazy failure.
- **`deploy-pipeline`** — a service identity for automation. May push images and update the one service it deploys, in one environment. It cannot create identities, cannot read the customer data bucket, and cannot touch anything it does not deploy.

Note what that list does *not* contain: a shared account, a permanent human administrator, or a service identity with more rights than the humans. Note also that support engineers get a real role with real capability — least privilege is not a synonym for read-only, it is a synonym for *scoped to the job*.

## Practice

**Part 1 — Rewrite an over-privileged policy.** A colleague grants a reporting job this:

```json
{
  "statements": [
    { "effect": "Allow", "actions": ["*"], "resources": ["*"] }
  ]
}
```

The job actually does three things: it lists objects under `reports/` in the bucket `analytics-data`, downloads them, and writes one summary object per day to `summaries/` in the same bucket. It runs on a schedule from a container.

Write the replacement policy in the generic structure used in this lesson. It must scope actions and resources precisely, distinguish the read prefix from the write prefix, and include at least one condition. Below it, write: (a) the blast-radius answer for the original policy in two sentences, (b) the specific permission you were least sure about and how you would confirm it, and (c) why this job should use a role rather than a stored key.

**Part 2 — Design an access model.** For the six-person company described above, produce a table with one row per role and columns for: purpose, the principals who hold it, the three to five permission areas granted, at least one explicit exclusion, and the credential type and lifetime. Then answer:

- Which single role, if compromised, causes the worst outcome, and what specifically limits the damage?
- Which two roles would you refuse to combine into one, and why?
- How is a departing employee's access removed, in order, and what is the longest window during which they might still act?

**Part 3 — Troubleshoot four denials.** For each, name the most likely cause and the exact check you would run first. Then say what an inexperienced engineer would probably do instead and what damage that would cause.

1. An application on a virtual machine gets access denied writing to a bucket. The developer's own console session can write to it fine.
2. A user can list a bucket's contents but every download fails.
3. An administrator can create resources in one project or subscription but is denied in another, with identical role names in both.
4. A deployment pipeline that worked yesterday now fails on every call with an authentication error, no policy having changed.

**Part 4 — Audit a real account.** On any account you legitimately control — a personal free-tier account is ideal — produce an audit note covering: every principal that exists and when each last authenticated; every long-lived credential and its age; whether multi-factor is enabled on the root or global-admin identity and whether it has programmatic keys; whether the audit log is enabled and where it is delivered; whether public access to storage is blocked at the account level; and any policy granting a wildcard action or wildcard resource. For each finding write one remediation with an owner and a deadline. If you have no account, run the same audit against a documented example environment and say so.

**Part 5 — Start from zero.** Pick any small task on any platform — for instance, a function that reads one object and writes one object. Create a fresh identity with no permissions. Run the task, capture the denial, grant exactly the one permission it names, and run again. Repeat until it succeeds, recording every iteration. Submit the transcript and the final policy, then state how many permissions the final policy contains and how many a broad managed administrator role would have granted instead.

**Deliverable:** one document containing the rewritten policy with its three answers, the role table with its three questions, the four troubleshooting analyses, the audit note with remediations, and the start-from-zero transcript.

## Check your understanding

1. A policy allows `storage:GetObject` on `storage:::analytics-data`. Reads of `analytics-data/reports/jan.csv` are denied. Why? *(The resource names the bucket, not the objects inside it; the object resource needs the `/*` form.)*
2. A role's identity policy allows an action and an organization-level guardrail denies it. What happens, and which evaluation rule decides it? *(Denied — an explicit deny always wins, and upper-level guardrails cap what can be granted below.)*
3. Why is "can create identities or assign roles" a different category of risk from "can delete production storage"? *(Assigning roles lets an attacker grant themselves anything the guardrails above them still allow; creating identities becomes the same risk when it comes with any way to attach permissions to them. Either way the attacker gets new, legitimate-looking access that persists after the original credential is rotated.)*
