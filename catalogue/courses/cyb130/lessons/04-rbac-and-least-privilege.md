---
lesson_id: cyb130-04
course_id: cyb130
pathway: cybersecurity-support-technician
title: RBAC and Least Privilege
order: 4
kind: lesson
competency_ids:
  - D2-S1-C03
objectives:
  - Model roles and permissions that grant least privilege for a described organization
---

## From "who are you" to "what may you do"

Lesson 02 separated authentication from authorization and lesson 03 hardened the first of the two. Everything from here is the second. Once the directory has confirmed that the person at the keyboard really is Maya Okonkwo, some system has to decide whether Maya may open the payroll folder, approve a purchase order, restart a server, or add someone to a group. That decision is authorization, and how an organization structures it determines both how usable it is day to day and how bad a compromised account turns out to be.

The organizing principle is **least privilege**: every identity holds exactly the permissions its job requires, on exactly the resources it touches, for exactly as long as it needs them, and nothing else. It is easy to state and genuinely hard to sustain, because all the day-to-day pressure runs the other way. Broad permissions make tickets close immediately. Nobody is ever paged because a permission was too wide. The only force pushing back is deliberate design and periodic review — which is exactly the work this lesson and the next teach.

A companion principle: **need to know**. Least privilege limits the *actions*; need to know limits the *data*. A backup operator may legitimately need to copy the HR file share without any business reason to read what is in it. The controls differ, and an audit should ask both questions.

## The access-control models

Four models, and you should be able to name which one a system is using from how it behaves.

**Discretionary access control (DAC).** The owner of a resource decides who may use it. This is what a file share does when a user right-clicks a folder and grants a colleague access. It is flexible, it is what most users expect, and it distributes authorization decisions to hundreds of people who have no security training. It is the reason "everyone" ends up on a folder somebody meant to share with one person, and it is the single most common source of the misconfiguration you will look for in the project.

**Mandatory access control (MAC).** The system enforces labels centrally and owners cannot override them. A document labelled *Restricted* is readable only by identities cleared for *Restricted*, and the person who wrote it cannot decide otherwise. Rigid, expensive to run, and correct in defence, intelligence, and some clinical settings. You will meet it as a concept more often than as a deployment.

**Role-based access control (RBAC).** Permissions are attached to named roles that describe jobs; identities receive roles. This is the workhorse of enterprise identity and the model this lesson develops. Its virtue is reviewability — "who can approve payments" has one answer you can read, rather than a permission hunt across forty systems.

**Attribute-based access control (ABAC).** Permissions are computed from attributes of the identity, the resource, the action, and the context: *a nurse may open a chart when the patient is assigned to their unit and the current shift is active*. Enormously expressive, and only as good as the attribute data behind it. Untagged resources match nothing; wrongly tagged ones match the wrong thing.

**Rule-based** controls sit alongside these — time-of-day restrictions, network-based restrictions, the conditional-access policies from lesson 03. They constrain rather than grant.

The mature answer in most organizations is RBAC for the coarse shape of a job, plus attribute conditions to scope a role to the right slice of resources, plus rules for context. Start with RBAC, because you cannot review what you cannot describe.

## The anatomy of a role model

Four objects and the relationships between them:

- **Permissions** are the atoms: read this share, approve a purchase order under $10,000, restart a service, reset another user's credential, add a member to a group. Permissions are always specific verbs on specific object types. There is no "admin" permission — only bundles that happen to contain everything.
- **Roles** are named bundles of permissions that correspond to something a person actually does: `ap-clerk`, `warehouse-supervisor`, `helpdesk-tier1`.
- **Assignments** connect identities to roles.
- **Constraints** limit assignments: mutual exclusion (nobody may hold both `vendor-maintainer` and `payment-approver`), cardinality (at most two people hold `domain-admin`), and prerequisites (you may hold `payment-approver` only if you hold `ap-clerk`).

**Role hierarchy** lets a senior role inherit a junior one: `ap-supervisor` inherits everything `ap-clerk` has and adds approval. Hierarchies reduce duplication and they make privilege accumulate silently if you build them carelessly, so keep them shallow — two or three levels — and never let a hierarchy be the reason someone holds a permission nobody can explain.

### The two-tier group pattern

Most directories implement roles as groups, and the pattern that survives contact with reality separates two kinds of group.

**Resource groups** are attached to a thing and carry one permission on it: `fs-payroll-read`, `fs-payroll-modify`, `app-erp-approve`. Never assign a person to one of these directly.

**Role groups** describe a job: `role-ap-clerk`, `role-warehouse-supervisor`. People go in these, and role groups are made members of the resource groups they need.

Why bother with the indirection? Because it makes both directions answerable. Read a role group and you know what a job can do. Read a resource group and you know every job that reaches that resource. Flatten the two and you get a directory where the only way to answer "who can read payroll" is to walk a tree of nested memberships by hand — which is precisely the situation an access-control audit exists to detect.

Two rules keep the pattern healthy. Never nest role groups inside other role groups more than one level deep, because effective permissions become unreadable fast. And never grant a permission to an individual user account "just this once"; a direct grant is invisible to every role review you will ever run, and it will outlive the reason for it by years.

## Building a role model from scratch

The method is boring and it works. Five steps.

**Step 1 — Inventory the job functions, not the people.** Get the organization chart and the list of job titles, then merge titles that do the same work and split titles that do not. "Analyst" covering three different jobs is the reason role models fail; two people with different titles doing identical work should share a role.

**Step 2 — Inventory the tasks per function.** For each function, list what the person must actually do in each system. Interview someone who does the job; do not guess from the title. This step surfaces the tasks that are done once a quarter and forgotten in every design meeting — the month-end close, the annual audit extract, the disaster-recovery test.

**Step 3 — Map tasks to the minimum permissions.** For each task, the narrowest permission that accomplishes it. This is where you resist the temptation to grant `modify` because `read` plus `create` felt fiddly. Where you are unsure, grant less and let the denial tell you what is missing — starting narrow and widening on evidence takes an afternoon and produces a correct role, while starting broad and trimming later never happens, because nothing is broken and so nothing is trimmed.

**Step 4 — Group permissions into roles.** Look for the permission sets that repeat across functions. Those become a **base role** — the birthright access every employee gets: email, the intranet, the shared printer, the staff handbook, their own home folder. Everything above the base becomes a **job role**, and anything genuinely person-specific becomes an **add-on entitlement** that is requested and approved individually rather than baked into a role.

**Step 5 — Write the exclusions.** For every role, at least one explicit statement of what it may *not* do. This is the step people skip and the one that makes a role model auditable, because it converts silence into a decision. `helpdesk-tier1` may reset standard-user credentials and explicitly may not reset administrative credentials or modify group membership — now a reviewer can check it.

### Worked example: Cedar Point Distribution

A 90-person distributor. Systems: a file server, an ERP, a warehouse management system, email, and a small server estate.

| Role | Holders | Key permissions | Explicit exclusion |
| --- | --- | --- | --- |
| `role-base-employee` | All 90 | Email, intranet, own home folder, company-wide read share, printing | No access to any departmental share by default |
| `role-ap-clerk` | 4 | ERP: create and edit vendor invoices; read vendor master; read `fs-finance` | May not approve payments; may not create or edit vendor bank details |
| `role-ap-supervisor` | 1 | Inherits `role-ap-clerk`; approve payments up to $25,000; run payment batches | May not create vendors or edit vendor bank details |
| `role-vendor-maintainer` | 2 (procurement) | ERP: create vendors, edit vendor bank details | May not approve or release any payment |
| `role-warehouse-operator` | 46 | WMS: pick, pack, receive, adjust stock with reason code | May not void transactions; no ERP financial access |
| `role-warehouse-supervisor` | 6 | Inherits operator; void transactions, approve stock adjustments over 50 units, view shift reports | May not change WMS pricing or user records |
| `role-helpdesk-tier1` | 3 | Reset standard-user credentials; add and remove members of a defined list of role groups; read workstation inventory | May not reset administrative credentials, modify privileged groups, or access file-share contents |
| `role-sysadmin` | 2 | Server administration via a separate named admin account, elevation required | May not approve their own elevation; no standing access to the ERP financial modules |
| `role-hr-generalist` | 2 | HR system full; `fs-hr` modify | No ERP access; may not view individual payroll bank details |
| `svc-wms-integration` | 1 (non-human) | WMS API: read orders, write shipment confirmations, on one interface account | No interactive logon; no access outside the two API operations |

Three things in that table are the actual lesson.

**Separation of duties is visible.** `role-vendor-maintainer` can create a vendor and set its bank details but cannot pay it. `role-ap-supervisor` can pay a vendor but cannot change where the money goes. Neither role alone can direct a payment to an account it controls. That is not a technical control; it is a *design decision expressed in roles*, and it is the highest-value thing on the page. The classic pairs to keep apart are create-vendor and approve-payment, request-access and approve-access, develop and deploy to production, and administer a system and audit that system's logs.

**Volume tracks with restriction.** The 46-person operator role is the narrowest job role in the table, and the two-person sysadmin role is the widest. That is the correct shape. When you see a role model where a large population holds broad permissions, you have found a finding without looking any further.

**The non-human identity is in the table.** Service accounts are the most consistently over-privileged identities in any environment, precisely because they never complain and nobody reviews them. Every one of them belongs in the role model, with an owner, a purpose, and an exclusion line.

## Privileged access

Some permissions are qualitatively different from the rest: those that grant permissions. The ability to add a member to the administrators group, reset another user's credential, register a new authentication method on someone else's account, edit a conditional-access policy, or modify audit-log settings. An identity holding any of these can grant itself everything else and can outlive the credential you rotate. Treat them as a separate class.

Four practices you should be able to recommend:

**Named administrative accounts, separate from daily accounts.** Maya browses the web and reads email as `mokonkwo`; she administers servers as `mokonkwo-adm`. The administrative account has no mailbox, no internet browsing, and its own stronger MFA. This means the routine risks of daily computing do not sit on the privileged credential, and the audit log distinguishes ordinary work from privileged work.

**Administrative tiering.** Do not let a credential that administers workstations also administer the directory. Define tiers — directory and identity infrastructure at the top, servers and applications in the middle, workstations at the bottom — and forbid credentials from one tier being used to log into a lower tier, because a credential used on a machine can be recovered from that machine. This one rule prevents a large fraction of the escalation paths in a real environment.

**Just-in-time elevation.** Nobody holds standing administrative rights. A person requests elevation, states a reason, is approved, holds the role for two hours, and it expires automatically. Standing privilege is what makes a stolen credential valuable at 03:00; time-bound privilege makes the same credential useless most of the time.

**Approval and dual control for the most dangerous actions.** Two people for anything that changes the identity infrastructure itself.

The tooling that implements the last two properly is **privileged access management (PAM)**, usually alongside a **secrets vault** for the shared and non-human credentials that cannot be eliminated. Both are named here so you recognize them on a ticket or a vendor call and know what problem they solve: PAM brokers, records, and time-bounds privileged sessions; a secrets vault stores, rotates, and issues credentials so that no human ever knows a service account's password. Deploying either is a project in its own right and is out of scope at this level — but "these permissions belong behind PAM" is a legitimate and expected recommendation in an audit finding.

## Effective permissions, and why they surprise people

The permissions a user actually has are rarely the permissions someone intended. Five mechanisms combine.

**Accumulation.** Permissions from every source add together: direct grants, every group the account is in, every group *those* groups are in, and any resource-side permission. Nothing subtracts by default. This is the mechanism behind lesson 05's privilege creep.

**Inheritance.** Permissions set on a container flow down to its children unless inheritance is broken. A permission granted at the top of a share reaches every folder beneath it, including the one somebody later created for a sensitive project.

**Explicit deny wins.** In most systems, an explicit deny overrides any allow from any source. Deny is powerful and it is also a trap: a deny placed on a broad group to solve one problem produces baffling failures for unrelated people years later. Prefer removing an allow to adding a deny, and when you must deny, document why on the object.

**The union of share and file-system permissions.** Where two layers both apply — a network share permission and an underlying file-system permission — the effective result is the more restrictive of the two. A share set to full control with restrictive underlying permissions looks alarming in a report and is not, and the reverse looks fine and is not. Check both layers before writing a finding.

**Nested groups.** A user in a group in a group in a group holds everything all three grant. Nesting is useful and it hides privilege effectively. Depth beyond two or three levels is a finding on its own, and a cycle — group A contains group B which contains group A — is a defect that makes automated review tools disagree with each other.

The practical consequence: **never assess someone's access by reading a single group membership.** Use the platform's effective-permissions tooling, or reconstruct the union by hand, and always test with the actual account rather than assuming.

### Common findings you should be able to name

- **Everyone or all-authenticated-users on a sensitive resource.** The most common finding in existence, usually created by someone trying to make sharing work quickly.
- **A wildcard or all-permissions grant** described as temporary in a change record from two years ago.
- **Direct user grants on resources**, bypassing every role and invisible to role reviews.
- **A large population holding an administrative role** — often because an application vendor's installation guide said to.
- **Nested groups more than three deep**, or a group whose name no longer matches what it grants.
- **A departed employee's group memberships** still present. That is lesson 05's territory.
- **Service accounts with interactive logon rights** and domain-administrative privileges, granted because it made an installation work.
- **Duplicate roles** — `finance-read`, `fin-readonly`, and `role-finance-view` all granting almost the same thing, none of them retired.
- **Broken separation of duties** — one identity holding both halves of a control pair, most often because someone covered a colleague's leave and kept the access.

## Role explosion and role bloat

Two opposite failures.

**Role bloat** is roles that grant too much because they were built by copying the widest existing user. It hides in the phrase "give them the same as Priya" — a request that propagates one person's accumulated exceptions into a permanent role.

**Role explosion** is the opposite: so many narrow roles that nobody can find the right one, so requesters pick the one they recognize, and the model degrades into noise. A useful sanity check is the ratio of roles to people. In a 90-person company, ten to fifteen job roles is healthy; sixty is a symptom.

The cure for both is the same: roles describe *jobs*, and genuinely person-specific access is an add-on entitlement, requested and approved separately, with an expiry date. Do not create `role-ap-clerk-except-maya`.

## Practice

**Part 1 — Model an organization.** Ashford Community Housing has 140 staff:

- 6 finance staff: 3 process invoices, 1 approves payments, 1 maintains supplier records, 1 is the finance manager
- 55 housing officers who read and update tenant records for their own patch and raise repair jobs
- 12 team leaders who supervise housing officers, approve repair jobs over £2,000, and reassign cases
- 20 maintenance technicians who use a mobile app to see assigned jobs and record completion, and who share four depot workstations
- 8 HR staff: 5 generalists, 2 payroll, 1 HR director
- 4 IT staff: 2 service desk, 2 systems administrators
- 30 volunteers who need email, the intranet, and a shared volunteer calendar, on personal devices
- 5 non-human accounts: nightly finance interface, backup service, repair-contractor API integration, monitoring agent, report scheduler

Systems: a housing management system holding tenant personal data, a finance system, an HR and payroll system, a file server with departmental shares, email, and a small server estate.

Produce a role table with one row per role and columns for: role name, who holds it, three to five permission areas, at least one explicit exclusion, and whether it is a base role, a job role, or an add-on entitlement. Cover every population above including the non-human accounts.

**Part 2 — Separation of duties.** From your model, identify at least three pairs of permissions that must not be held by the same identity. For each, write the harm that becomes possible if they are combined, name which role holds each half, and state what the organization should do when the person holding one half is on leave and someone must cover.

**Part 3 — Find the misconfigurations.** Below is an extract of group memberships and share permissions from Ashford's file server. Identify every problem, rank them by severity, and for each give the specific remediation and one sentence on how it would be verified afterwards. There are at least eight.

```text
GROUP MEMBERSHIPS
  Domain Admins            : jbarnes-adm, tokafor-adm, svc-backup, helpdesk-shared, rmartin
  role-helpdesk-tier1      : rmartin, dpatel, Domain Admins
  role-finance-clerk       : ahughes, kbrooks, lnguyen, tokafor
  fs-hr-modify             : role-hr-generalist, ahughes, Domain Users
  role-hr-generalist       : sokoye, mgrant, fdiallo, role-housing-officer
  role-housing-officer     : (55 members)
  svc-repair-api           : member of Domain Admins, interactive logon enabled

SHARE PERMISSIONS
  \\ash-fs01\finance       : role-finance-clerk = Modify; Everyone = Read
  \\ash-fs01\hr            : fs-hr-modify = Full Control; Authenticated Users = Read
  \\ash-fs01\tenants       : role-housing-officer = Modify; role-volunteer = Read
  \\ash-fs01\it-admin      : Domain Admins = Full Control; rmartin = Full Control
  \\ash-fs01\public        : Everyone = Full Control
```

**Part 4 — Privileged access recommendation.** Write a half-page recommendation for Ashford covering: which accounts you classify as privileged and why, the separate-admin-account rule and how it would be introduced, what tiering would look like with only four IT staff, which two actions you would put behind dual control, and which specific problems in Part 3 would be solved by a privileged access management tool rather than by editing groups. Be explicit about what you are *not* recommending at this organization's size, and why.

**Part 5 — Trace effective permissions.** Using your Part 3 answers, pick the account `rmartin` and write, step by step, every path by which that account reaches the HR share, naming the mechanism at each hop (direct grant, group membership, nested group, inheritance, or resource-side permission). Then state which single change would remove the most paths at once, and what you would check to confirm nothing legitimate broke.

**Deliverable:** one document containing the role table, the separation-of-duties analysis, the ranked findings with remediations, the privileged access recommendation, and the effective-permissions trace.
