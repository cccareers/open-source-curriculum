---
lesson_id: cyb130-06
course_id: cyb130
pathway: cybersecurity-support-technician
title: 'Project: Access Control Audit'
order: 6
kind: project
competency_ids:
  - D2-S1-C03
  - D2-S1-C04
objectives: []
---

## The goal

Produce a written access-control audit of a small organization: a report that names every authentication and authorization weakness you can substantiate from the supplied evidence, ranks them, and hands each one to a named owner with a remediation and a way to verify it later.

You are not configuring anything. The deliverable is a document, because reading an environment and writing up what is wrong is the work an entry-level support technician is actually handed — long before anyone gives them permission to change a group. Three judgments are being assessed:

- Can you look at real evidence and **find a misconfiguration**, rather than restating good practice in general terms?
- Can you **choose an appropriate access control** for a stated population and risk level, and justify it against that population's constraints rather than against your own preferences?
- Can you write findings a manager will act on — specific, ranked, owned, and verifiable?

Budget roughly three hours. This is an analysis exercise, not a research project. If you are ninety minutes in and still reading standards documents, you are optimizing the wrong thing.

## The client

**Ravensworth Building Society** is a UK regional lender with 180 employees; monetary recommendations use pounds sterling (GBP). It has a head office, four branches, and a small mortgage-processing team. They have never had an access-control audit. The IT team is four people, two of whom joined this year. The compliance officer has asked for an audit because their insurer's renewal questionnaire asked three questions the society could not answer.

What they run:

- A directory that authenticates staff and is federated to three applications
- A **core banking system** holding customer accounts and payment functions, with its own local user list — not federated
- A **loan origination system**, federated, used by branch and mortgage staff
- A **document management system** holding scanned customer identification and signed agreements, federated
- A **file server** with departmental shares
- Email, and a small server estate of eleven servers
- A **branch teller terminal** in each branch, shared by whoever is on shift

Who works there:

- **4 IT staff** — 2 service desk, 2 systems administrators, all with company laptops
- **11 head-office finance and treasury staff**, company laptops
- **9 compliance and risk staff**, company laptops
- **62 branch staff** across four branches, sharing terminals at the counter, not permitted personal phones at the counter
- **34 mortgage processors** at head office, company laptops, handling customer identification documents
- **28 contact-centre agents** in a single room, company desktops, on rotating shifts
- **21 back-office staff** (HR, facilities, marketing), company laptops
- **11 mortgage advisers** who work from home and at customer premises, company laptops, frequently with no mobile signal in rural areas
- **A managed service provider** who supports the core banking system remotely, 4 named engineers
- **Non-human accounts**: nightly payments interface, backup service, monitoring agent, document-scanner integration, report scheduler, and a core-banking batch job

What the compliance officer has said, in her words: *"I need to know what we would say if a regulator asked who can move money, and I need to know it in a way I can hand to the board."*

## The evidence

The extracts are a snapshot as of 27 July 2026. The 180 employees exclude the four external MSP engineers and six non-human accounts. Everything below is what the IT team was able to export. It is incomplete in places, and noticing what is missing is part of the audit.

### Extract A — directory accounts

```text
account,          display,             enabled, last_logon,  mfa_registered, groups
jmurray,          J Murray,            yes,     2026-07-24,  key+app,        role-base; role-sysadmin
jmurray-adm,      J Murray (adm),      yes,     2026-07-24,  key,            Domain Admins
achen,            A Chen,              yes,     2026-07-25,  app,            role-base; role-sysadmin; Domain Admins
rpatel,           R Patel,             yes,     2026-07-25,  sms,            role-base; role-helpdesk; Domain Admins
lmoreau,          L Moreau,            yes,     2026-07-25,  none,           role-base; role-helpdesk
sblake,           S Blake,             yes,     2024-11-08,  none,           role-base; role-treasury; role-payments-release
dortega,          D Ortega,            yes,     2026-07-23,  app,            role-base; role-treasury; role-payments-release; role-payee-maintain
hkaur,            H Kaur,              yes,     2026-07-25,  app,            role-base; role-compliance; role-sysadmin
branch-teller-01, Branch 1 Teller,     yes,     2026-07-25,  none,           role-base; role-teller
branch-teller-02, Branch 2 Teller,     yes,     2026-07-25,  none,           role-base; role-teller
branch-teller-03, Branch 3 Teller,     yes,     2026-07-25,  none,           role-base; role-teller
branch-teller-04, Branch 4 Teller,     yes,     2026-07-25,  none,           role-base; role-teller
mspeng1,          MSP Engineer 1,      yes,     2026-07-19,  none,           role-base; Domain Admins; role-corebank-admin
mspeng2,          MSP Engineer 2,      yes,     2025-03-02,  none,           role-base; Domain Admins; role-corebank-admin
mspeng3,          MSP Engineer 3,      yes,     2026-06-30,  none,           role-base; Domain Admins; role-corebank-admin
mspeng4,          MSP Engineer 4,      yes,     2023-09-14,  none,           role-base; Domain Admins; role-corebank-admin
tfarrell,         T Farrell,           yes,     2025-12-19,  app,            role-base; role-mortgage-processor; role-loan-underwrite
svc-payments,     (service),           yes,     2026-07-26,  none,           Domain Admins
svc-backup,       (service),           yes,     2026-07-26,  none,           Domain Admins
svc-scanner,      (service),           yes,     2026-07-26,  none,           role-base; role-dms-admin
audit-temp,       Audit Access 2024,   yes,     2024-06-30,  none,           role-base; role-compliance; fs-finance-read
```

### Extract B — group memberships

```text
Domain Admins        : jmurray-adm, achen, rpatel, mspeng1, mspeng2, mspeng3, mspeng4, svc-payments, svc-backup
role-helpdesk        : rpatel, lmoreau, Domain Admins
role-teller          : (62 branch staff), branch-teller-01..04, role-contact-centre
role-contact-centre  : (28 agents)
role-payments-release: sblake, dortega, role-treasury
role-treasury        : (6 treasury staff)
role-payee-maintain  : dortega, role-treasury
role-compliance      : (9 staff), audit-temp, hkaur
role-mortgage-processor : (34 staff), role-contact-centre
role-dms-admin       : svc-scanner, role-mortgage-processor
```

### Extract C — file-share permissions

```text
\\rbs-fs01\finance     : role-treasury = Modify; Authenticated Users = Read
\\rbs-fs01\compliance  : role-compliance = Full Control; role-helpdesk = Full Control
\\rbs-fs01\customer-id : role-mortgage-processor = Modify; Everyone = Read
\\rbs-fs01\hr          : role-hr = Modify; achen = Full Control
\\rbs-fs01\it          : Domain Admins = Full Control
\\rbs-fs01\public      : Everyone = Full Control
\\rbs-fs01\archive     : Everyone = Full Control (inheritance disabled, set 2019, no change record)
```

### Extract D — core banking system local users

```text
username,     full_name,        last_login,  role,              password_policy
admin,        (built-in),       2026-07-26,  full_admin,        never_expires
rbs_support,  MSP Shared,       2026-07-25,  full_admin,        never_expires
sblake,       S Blake,          2024-11-08,  payments_release,  90_day
dortega,      D Ortega,         2026-07-23,  payments_release,  90_day
dortega2,     D Ortega (test),  2026-05-14,  full_admin,        never_expires
teller_pool,  Branch Tellers,   2026-07-25,  teller,            never_expires
batch_run,    (batch job),      2026-07-26,  full_admin,        never_expires
```

### Extract E — authentication policy, as documented

```text
- Password minimum length 8, complexity required, expiry 90 days, history 5
- MFA required for: remote access via VPN
- MFA not enforced for: internal logins, core banking system, branch terminals
- Conditional access: one rule, "require MFA when outside the office IP ranges",
  with exclusion group 'ca-exempt' (members: mspeng1..4, svc-payments, sblake, audit-temp)
- Account lockout: 10 attempts, 15 minute window
- Session lifetime: 30 days for federated applications, no re-authentication for
  sensitive actions
- No documented process for MFA reset; service desk resets on caller request after
  confirming employee number and date of birth
```

### Extract F — HR active-employee list, cross-reference

```text
Active employees include: J Murray, A Chen, R Patel, L Moreau, D Ortega, H Kaur
Leavers: S Blake (last working day 2024-11-08), T Farrell (last working day 2025-12-19)
Not in HR: all MSP engineers (contract), all shared and service accounts
```

## Requirements

Numbered so a reviewer can mark them one at a time.

**R1 — Scope and method statement.** Half a page: what you audited, what evidence you used, what you could not examine and therefore cannot make claims about, and the three questions your audit set out to answer. State at least four pieces of evidence you would have asked for that are not in the pack, and what each would have let you check.

**R2 — Authentication findings.** Every weakness in how identities prove themselves. Use the factor classification from lesson 02 — for each account or population, name the factor types in play and whether the combination qualifies as multi-factor. At minimum you must address: which populations have no second factor, which have a weak one, the conditional-access exclusion list, session lifetime, and the credential-reset process.

**R3 — Authorization findings.** Every weakness in what identities may do. You must work in both directions: from the identity outward (what does this account hold, and via what path) and from the resource inward (who can reach this share, and how). Trace at least two accounts' effective permissions hop by hop, naming the mechanism at each hop.

**R4 — Separation-of-duties analysis.** Identify the control pairs this organization needs given what it does, then list every identity that holds both halves of any pair. For each, state the specific harm that becomes possible and the minimum change that breaks the combination.

**R5 — Lifecycle findings.** Cross-reference the directory against the HR list and the evidence pack. Classify every account that does not belong to a current, active, human employee as orphaned, dormant, shared, non-human, contractor, or temporary-expired. For each, state the remediation and who must decide.

**R6 — Accounting findings.** What can and cannot be reconstructed from this environment after an incident. Name at least three specific questions a regulator or investigator might ask that this environment currently cannot answer, and say exactly which control's absence causes each.

**R7 — Ranked findings register.** A single table, one row per finding, sorted most severe first, with columns for: finding ID, one-line description, the evidence extract it came from, severity with a stated reason, the owner role who must fix it, the remediation, the target date, and the specific check that would verify the fix. Aim for twenty to thirty findings; a register of six means you stopped reading, and a register of eighty means you split one problem into fragments. Severity must be justified by impact and exposure, not asserted.

**R8 — An access-control recommendation for each population.** A table with one row per population from the client description, and columns for: recommended primary authentication method, recommended alternate, the constraint that decided it, the recovery path when a factor is lost, and the authorization model change you would make for that population. Every recommendation must name the property of *that* population that drove it. Cover the non-human accounts too, and be explicit about why MFA is the wrong instrument for them.

**R9 — A ninety-day remediation plan.** What is fixed in the first week, the first month, and the first quarter, in that order, with the reasoning for the sequence. It must state which fixes can be done by the four-person IT team with existing tooling, which require a purchase or a project, and which require a decision from someone above IT. Name the one change you would make first if the society could only make one, and defend it in three sentences.

**R10 — A one-page summary for the board.** Plain language, no jargon introduced without explanation in the same sentence, leading with the answer. It must state: whether the society can currently answer "who can move money" and what the answer is, the three most serious problems in business terms, what will be done and by when, and what the board is being asked to approve. This page must stand alone without the rest of the report.

## Constraints

- **Every finding cites its evidence.** Name the extract and the specific line. A finding you cannot point at is an opinion, and opinions do not survive a management response.
- **Vendor-neutral.** Describe what must be true, not which product screen to open. Naming a category of tool is fine; assuming a specific platform is not.
- **Nothing is configured.** No systems are changed, no accounts are touched, no tools are run against anything. If you find yourself making a change, stop.
- **No attack techniques.** This is an administrative audit. Where a weakness matters because it enables an attack, state the risk in one sentence and move to the remediation. Do not write procedures for exploiting anything.
- **Scope discipline.** Cloud-native permission-policy authoring, cryptographic algorithm selection, network segmentation design, and full privileged-access-management deployment are outside this course. Where a finding touches one, note it in a short "referred" list with one line on why and to whom — do not design it.
- **Three hours.** If you must cut, cut breadth of research, not R7 or R10.

## Definition of done

Your submission is complete when all of the following are true:

1. All ten requirements are present and clearly labelled with their requirement numbers.
2. Every finding in R7 cites a specific extract and line, and no finding appears twice under different IDs.
3. Every finding has an owner role, a remediation, and a verification check that a third party could run.
4. Severity ratings are justified by stated impact and exposure, and the ranking is consistent with those justifications.
5. At least two effective-permission traces in R3 name the mechanism at every hop.
6. Every population in R8 has a recommendation naming the specific constraint that decided it, and no two populations receive an identical justification.
7. The non-human accounts appear in R5, R7, and R8.
8. The separation-of-duties analysis in R4 names at least three control pairs and identifies every identity breaching them.
9. R6 names at least three questions the environment cannot answer, each tied to a missing control.
10. The board page contains no unexplained jargon, answers the compliance officer's question directly, and states dates.
11. Every claim about something *not* in the evidence is labelled as an assumption or a gap, not asserted as fact.

## Hints

**Read the extracts against each other, not one at a time.** Almost every serious finding here requires two extracts. An account's group membership in Extract B is unremarkable until you check its last logon in Extract A and its employment status in Extract F. The exclusion group in Extract E is a policy detail until you look up who is in it.

**The nested groups are doing more than they appear to.** Walk every group in Extract B down to its members before you conclude anything about who holds what. A role that contains another role passes everything through, and at least two of the surprises in this pack come from that mechanism. Draw it if it helps.

**"Who can move money" is the compliance officer's question, so answer it explicitly.** Find every path to payment release and payee maintenance — directory groups, core banking local roles, shared accounts, and administrative accounts that could grant themselves either. The answer is longer than the society expects, and the gap between the intended answer and the real one is the spine of your report.

**Shared accounts are both an authentication finding and an accounting finding, and they are not always removable.** A teller terminal at a counter has real constraints. The strong answer is not "abolish shared accounts"; it is a recommendation that respects the constraint while restoring attribution, plus an honest statement of the residual risk if the constraint cannot be moved.

**The mortgage advisers are the interesting authentication problem.** Home and rural customer premises, company laptop, frequently no mobile signal. Anything network-dependent is unusable at the moment they need it. Say what you would issue them and what it costs.

**The managed service provider is the interesting authorization problem.** Four external engineers, standing membership of the highest-privilege group, one of whom has not logged in since 2023, all excluded from the conditional-access rule, plus a shared login in the core banking system. Take it apart into separate findings rather than writing one finding called "MSP access."

**Non-human accounts need a different recommendation, not a weaker one.** They cannot approve a prompt, so the answer is ownership, scope reduction, credential handling, and monitoring. Say which of them plainly does not need the privilege it holds, and what evidence would confirm that before you removed it.

**Notice what the evidence does not contain.** There is no log retention statement, no record of who approved any of these grants, no owner recorded for any service account, no review history, and no list of applications that are not federated. Each absence is a finding in its own right, and R1 exists so you get credit for spotting them rather than quietly working around them.

**Write R10 last, then check it upward.** If the board page promises something the register does not contain, one of the two is wrong. Either way, you found it before your reviewer did.
