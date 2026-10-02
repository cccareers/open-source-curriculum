---
lesson_id: cyb130-05
course_id: cyb130
pathway: cybersecurity-support-technician
title: 'Identity Lifecycle: Joiners, Movers, and Leavers'
order: 5
kind: lesson
competency_ids:
  - D2-S1-C03
objectives:
  - Trace an identity through joiner, mover, and leaver events and identify where privilege accumulates
---

## An account is not a snapshot

Lesson 04 produced a role model — a clean picture of who should hold what. That picture is accurate on the day it is drawn and starts decaying immediately, because organizations are not static. People are hired. They move departments, cover for colleagues on leave, take on a project, get promoted, go on secondment, come back. They resign, retire, are let go, or simply stop appearing. Contractors arrive for three months and are still badged in eighteen months later.

Every one of those events should change an account's entitlements. In most organizations, only some of them do — and reliably it is the *granting* events that get processed, because a person who cannot do their job raises a ticket within the hour, while a person who retains access they no longer need raises nothing at all. That asymmetry is the entire subject of this lesson. Access management is additive by default, and the result is **privilege creep**: an account that, after five years of legitimate individual decisions, can do far more than anyone would ever have approved in one request.

The framework for managing this is **joiner, mover, leaver** — JML. Three event types, each with a defined set of actions, each with an owner and a time limit. It is not a product; it is a process that some products help you automate. Your job as a support technician is to execute it correctly and, when auditing, to find the places where it did not happen.

![The joiner, mover, and leaver stages of an identity lifecycle, showing entitlements being granted at joining, added but rarely removed at each move, and revoked at leaving](./img/identity-lifecycle-stages.png)

## The authoritative source

Before any of it works, one question has to have an answer: **which system decides that a person exists, and that they still work here?**

In almost every organization the answer is the HR system, and it should be. HR knows the hire date, the department, the manager, the job title, the employment type, the last working day. Making HR authoritative means identity events are triggered by the same record that triggers payroll — and the one thing an organization reliably gets right is stopping payroll.

The pattern is: HR record created or changed → identity system reads the change → accounts and entitlements are created, modified, or revoked → target systems are updated. Where that chain is automated, the protocol connecting the identity system to applications is often **SCIM**, which is why lesson 02 filed it under provisioning rather than authentication. Where it is not automated, the chain is a ticket, an email, or a person remembering — and the audit question becomes "how would anyone know?"

Three practical consequences you should be able to state:

**Populations outside HR need a different authoritative source.** Contractors, volunteers, vendors, temporary staff, auditors, and interns often do not appear in the HR system at all. Each of these populations needs a nominated **sponsor** — a named employee responsible for the record — and a mandatory **end date**. A non-employee identity with no sponsor and no expiry is the single most reliable way to produce an account that outlives its purpose by years.

**Non-human identities need an owner too.** A service account, an API integration, a scheduled job, a device certificate. None of them appear in HR, none of them resign, and every one of them should have a named human owner, a documented purpose, and a review date. When that owner leaves, the account does not — which is one of the tidiest questions to ask during a leaver process and one of the least often asked.

**Identity proofing happens once, at the start.** Before a first credential is issued, someone must confirm the person is who the record says. In person against photo identification, or through a verified process with the hiring manager. This matters more than it sounds, because everything downstream — every authentication, every log entry, every access grant — inherits its trustworthiness from that first check.

## Joiner

The goal is that a new starter can work on day one and can do nothing beyond their job.

The sequence, with owners:

1. **HR creates the record** with start date, department, manager, job title, employment type, and end date if there is one. *Owner: HR.*
2. **Identity is proofed** and a unique identifier is assigned that will never be reused. Reusing a username after someone leaves is a genuinely bad idea — old log entries and old permissions silently attach to the new person. *Owner: HR or IT.*
3. **The account is created** with base role entitlements only: email, intranet, home folder, company-wide read share. *Owner: IT.*
4. **The job role is assigned** from the role model, based on the job title. This is the birthright access for the position, and it should be automatic; if a role has to be hand-picked for every starter, the role model is not describing jobs.
5. **Add-on entitlements are requested** individually by the manager, with a business reason and an approval from whoever owns the resource. Each one is recorded.
6. **Credentials and factors are issued.** First credential delivered through a channel the recipient controls, forced change at first use, and MFA enrolled during onboarding — in person or from a managed device, as lesson 03 required.
7. **The record is verified.** Someone checks that what was granted matches what was approved, before day one.

Two traps in that list.

**"Same as" requests.** A manager writes "give her the same access as Dev." Dev has been here nine years and holds four roles, six add-on entitlements, and a direct grant from a 2021 project. Cloning Dev clones all of it — and now the creep is inherited rather than accumulated, which means it arrives on day one and looks legitimate forever after. The correct response is to grant the job role and ask the manager which specific additional entitlements are needed and why.

**Pre-emptive granting.** "Give them everything they might need so we do not get tickets later." This is understandable and it is exactly the thing least privilege exists to prevent. Grant the role; handle the extras as requests. The two extra tickets in week one are cheaper than the permanent over-entitlement.

## Mover

The mover event is where privilege creep is actually created, and it is the stage organizations handle worst.

A move is any change to what a person does: department transfer, promotion, secondment, a change of manager, taking on a project, temporarily covering a colleague's leave, or moving from contractor to employee. Every one of these should trigger a review of entitlements. In practice, most trigger an *addition* and nothing else, because the person needs new access to start the new job and nobody is inconvenienced by them keeping the old.

The correct mover procedure has one distinguishing feature: **it removes before it adds, or at minimum it forces an explicit decision about the old access.**

1. **HR records the change** with an effective date. *Owner: HR.*
2. **The current entitlement set is exported** — every role, every add-on, every direct grant, every group.
3. **The new job role is determined** from the role model.
4. **The difference is calculated**: what the new role includes, what the old role included, what add-ons exist and whether each is still justified.
5. **Both managers decide, explicitly, on each item that is not in the new job role.** The old manager says whether it can go; the new manager says whether it is needed. Silence means removal. This is the step that does the work, and the reason it is difficult is entirely organizational — the outgoing manager has no incentive to respond and the incoming manager does not know what the items are for.
6. **Removals are executed first**, then additions, with a short overlap only where a genuine handover requires it — and where an overlap is granted, it gets an end date recorded at the time it is granted, not later.
7. **The change is logged** with who approved what.

### Where creep hides

Six specific places, all of which you should look for in an audit:

**Temporary cover that never ended.** Someone covered a colleague's maternity leave in 2023 and still holds the approval role. This is the most common single source of broken separation of duties, because cover is precisely the situation where one person is handed both halves of a control pair.

**Project entitlements.** Access granted for a migration, an audit, an office move, or a system implementation. The project ends; the entitlement does not, because nobody wrote down that it was temporary.

**Cloned accounts.** The "same as" problem from the joiner section, arriving through a different door.

**Direct grants.** Permissions given straight to a user account rather than through a role. They are invisible to a role review, so they can only be found by enumerating permissions on resources rather than by reading group membership — which is why an audit has to work in both directions.

**Nested group drift.** A group is added as a member of another group to solve a problem. Two years later, everyone in the first group holds the second group's access and nobody in either group knows.

**Elevation that became standing.** A temporary administrative grant that was never time-boxed. Lesson 04's just-in-time elevation exists specifically to make this impossible.

### Worked trace: five years of Maya Okonkwo

Watch the entitlement set grow. Each individual decision is defensible; the endpoint is not.

| Date | Event | Entitlements after the event |
| --- | --- | --- |
| Mar 2021 | **Joiner** — Accounts Payable clerk | `role-base-employee`, `role-ap-clerk` |
| Sep 2021 | Covers the AP supervisor's three-month leave | + `role-ap-supervisor` (payment approval) |
| Jan 2022 | Cover ended; nobody removed the role | unchanged — **first creep** |
| Jun 2022 | Joins the ERP upgrade project; needs to read finance configuration | + `erp-config-read`, + `fs-project-erp` |
| Feb 2023 | Project closed; entitlements not reviewed | unchanged — **second creep** |
| Aug 2023 | **Mover** — promoted to Procurement Officer | + `role-vendor-maintainer`; `role-ap-clerk` retained "for handover" |
| Nov 2023 | Handover long finished | unchanged — **third creep**, and now a separation-of-duties break |
| Apr 2024 | Asked to help the auditors; given read access to the HR share for one week | + `fs-hr-read` — no end date recorded |
| Jan 2025 | **Mover** — moves to Procurement Manager | + `role-procurement-manager`, + delegated approval on the finance mailbox |
| Mar 2026 | Access review; her manager approves the list without reading it | unchanged |

By March 2026 this account can create a vendor, set that vendor's bank details, *and* approve a payment to it — the exact separation-of-duties pair lesson 04 designed the role model to keep apart. It can also read the HR share. No one ever approved that combination. Six people each approved one reasonable thing.

Two lessons from the trace. First, **the removals are the whole job**; every failure above is a removal that did not happen. Second, **the review in March 2026 was worthless** because it presented a list of group names to a manager who could not evaluate them. Access reviews that ask "do you approve?" get "yes." Reviews that ask "this person can approve payments up to $25,000 and change vendor bank details — is that correct for their job?" get real answers.

## Leaver

The leaver event has the tightest time requirement and the widest surface. It is also the one most likely to be discovered by an auditor rather than by IT.

The trigger is HR recording a last working day. The timing depends on circumstances: for a planned resignation, revocation at end of the last working day; for an involuntary termination, revocation timed to the conversation, which requires coordination that must be arranged in advance rather than improvised.

The checklist:

**Disable, do not delete.** Disabling is instant, reversible, and preserves the account's identifier so audit history and file ownership stay intact. Deletion destroys evidence and can orphan objects the account owned. Delete only after a defined retention period, and only once ownership of everything the account held has been transferred.

**Terminate active sessions and revoke tokens.** This is the step most commonly missed, and the one where a lot of "but we disabled the account" stories fall apart. Disabling a directory account does not necessarily invalidate a token already issued to a browser, a phone mail app, or an API client. Sign the account out everywhere, revoke refresh tokens, and confirm the session lifetime for anything federated. If long-lived tokens are in play, the person may retain access for hours after the account shows as disabled.

**Reset the credential.** Even on a disabled account, so a later re-enable cannot be used by someone holding the old secret.

**Remove all group memberships and role assignments,** recording them first. This is what prevents a re-enabled account from returning with everything intact, and the record is what an investigation will need.

**De-register authentication factors.** Remove enrolled devices, security keys, phone numbers, and recovery codes. A leaver whose MFA registration survives is a leaver who can complete a credential reset.

**Handle non-directory accounts.** Local accounts on machines, application-local logins, third-party SaaS tools bought on a departmental card, VPN profiles, source-code repositories, remote-access tools, database logins, and anything on a personal device under a bring-your-own arrangement. This is where federation pays off — a federated application dies with the directory account, an application with its own local user list does not. Producing that list of non-federated applications is a real deliverable and most organizations do not have one.

**Reclaim and clear devices.** Laptop, phone, tokens, smart card, building badge. Remotely wipe or retire mobile devices, and record what was returned.

**Transfer data ownership.** Mailbox delegated or exported, file-share ownership reassigned, personal drive contents reviewed and moved. Do this before the account is deleted, not after.

**Reassign what the person owned.** Service accounts they were the owner of. Systems where they were the sole administrator. Approval workflows where they were the only approver — this one bites, because a leaver who was the sole approver for a process silently blocks it. Access requests they had approved that are now unsponsored. Contractors they sponsored, whose records now have no owner.

**Notify.** Managers, the service desk (so it does not process a credential reset for a departed person), and any external party that needs to know.

**Verify.** Someone other than the person who executed it confirms the account is disabled, sessions are gone, groups are empty, factors are removed, and non-directory access is closed. Record the completion time against the SLA.

### The special cases

**Involuntary termination** is a coordination problem. The revocation is timed to the meeting, arranged in advance by HR, IT, and the manager, and executed as a single sequence. Doing it early tips off the person; doing it late leaves a window at the moment of highest risk.

**Long-term leave** — sabbatical, parental leave, extended sick leave — is not a leaver event, but leaving an active account with full entitlements untouched for nine months is not right either. Disable interactive access, keep the record, and set a return date that triggers re-enablement and a review.

**Contractor end dates** should be enforced automatically by the record. If a contractor's identity is created with an expiry, the account disables itself on that date and an extension is a deliberate act with an approval. Compare that to a contractor account created with no end date, which will be found by an auditor in three years.

**Internal transfer to another employer entity** — a group company, an acquisition — is a leaver in one directory and a joiner in another, and it is frequently processed as neither.

## Detecting what the process missed

Auditing is the act of comparing the process to reality, and reality is where you will find the material for the project. Five queries do most of the work.

**Orphaned accounts.** Every enabled account whose identity has no corresponding active record in the authoritative source. Join the directory export to the HR export and look at the accounts that do not match. Expect service accounts, contractors, and shared accounts to appear legitimately — each of those needs a documented owner rather than a deletion — and expect at least one genuine leaver.

**Dormant accounts.** Enabled accounts with no successful authentication in 60 or 90 days. Dormancy is not proof of abandonment; a quarterly-close account is legitimately idle. It is a prompt to ask the owner. A dormant account with privileged entitlements is a priority.

**Unowned accounts.** Any account, human or not, with no named owner. Nobody will ever dare to delete an account nobody owns, so it lives forever. Assigning owners is often the highest-value remediation available.

**Entitlement drift.** For each person, compare actual entitlements against the entitlements their current job role should confer. Everything in the difference is either an approved add-on with a record, or a finding. This is the query that catches Maya.

**Broken separation of duties.** For each exclusion pair defined in the role model, list every identity holding both halves. Short list, high value, and it is the finding that gets a report read by people above IT.

Two supporting measures make all five sustainable: a **recertification campaign** in which managers confirm their team's access on a schedule (quarterly for privileged, annually for standard), presented in business language rather than group names and with a real "remove" option that gets executed; and a small set of **metrics** — median hours from last working day to full revocation, percentage of leavers fully processed within the SLA, count of orphaned accounts, count of accounts with no owner, count of open separation-of-duties breaks, and average age of temporary entitlements. Numbers that move are what turn a finding into a fixed problem.

## Practice

**Part 1 — Trace an identity.** Devendra Rao joins Ashford Community Housing (the organization from lesson 04) as a Housing Officer in June 2022. Construct a table like the Maya trace covering these events, showing the full entitlement set after each and marking each point where privilege accumulates:

1. June 2022 — joins as a Housing Officer
2. October 2022 — covers a team leader's six-week absence
3. February 2023 — joins the housing-management-system migration project, needing configuration read access and a project share
4. September 2023 — migration completes
5. January 2024 — promoted to Team Leader
6. July 2024 — helps finance with a one-off supplier reconciliation, needing read access to the finance share
7. March 2025 — moves to a Business Improvement role reporting to the IT director
8. November 2025 — asked to administer the reporting server "temporarily"
9. April 2026 — resigns, last working day 30 April

For each event write: what should have been added, what should have been removed, and what a typical organization would actually have done. At the end, list every entitlement the account holds on 30 April 2026 that it should not, and identify any separation-of-duties break your trace created.

**Part 2 — Write the leaver runbook.** Produce a runbook for Devendra's departure that a service-desk technician could execute without asking questions. It must cover: the trigger and who owns it, the ordered steps, the timing target for each, what is disabled versus deleted, session and token revocation, factor de-registration, the non-directory systems that need separate action and how you would know what they are, data and ownership transfer, what he owned that must be reassigned, who is notified, what is recorded, and who verifies. Add a short section on what changes if the departure is involuntary.

**Part 3 — Find the orphans and the creep.** Two extracts follow: an HR active-employee list and a directory export. Identify every discrepancy, classify each as orphaned, dormant, unowned, entitlement drift, separation-of-duties break, or acceptable-with-documentation, and write a remediation with an owner for each.

```text
HR ACTIVE EMPLOYEES (extract)
  employee_id, name,            department,       job_title,          start,      end
  40881,       M Okonkwo,       Procurement,      Procurement Mgr,    2021-03-01, -
  41102,       D Rao,           Business Imp.,    Improvement Lead,   2022-06-13, 2026-04-30
  41390,       S Okoye,         HR,               HR Generalist,      2023-01-09, -
  41455,       K Brooks,        Finance,          AP Clerk,           2023-04-03, -
  41720,       T Okafor,        IT,               Systems Admin,      2024-02-05, -
  41881,       F Diallo,        HR,               HR Generalist,      2024-09-16, -

DIRECTORY ENABLED ACCOUNTS (extract)
  account,        display,        last_logon,   groups
  mokonkwo,       M Okonkwo,      2026-07-24,   role-base-employee; role-ap-clerk; role-ap-supervisor; role-vendor-maintainer; role-procurement-manager; fs-hr-read
  drao,           D Rao,          2026-07-25,   role-base-employee; role-team-leader; role-housing-officer; fs-finance-read; role-sysadmin
  sokoye,         S Okoye,        2026-07-25,   role-base-employee; role-hr-generalist
  kbrooks,        K Brooks,       2026-07-25,   role-base-employee; role-ap-clerk
  tokafor,        T Okafor,       2026-07-25,   role-base-employee; role-finance-clerk
  tokafor-adm,    T Okafor (adm), 2026-07-22,   Domain Admins
  fdiallo,        F Diallo,       2026-02-11,   role-base-employee; role-hr-generalist; fs-finance-read
  jbarnes,        J Barnes,       2025-08-30,   role-base-employee; role-sysadmin; Domain Admins
  contractor01,   HMS Support,    2026-07-20,   role-base-employee; role-hms-admin
  svc-backup,     (service),      2026-07-26,   Domain Admins
  helpdesk-shared,(shared),       2026-07-25,   role-helpdesk-tier1
  volunteer-kiosk,(shared),       2026-01-04,   role-base-employee
```

**Part 4 — Design the recertification.** Write the specification for Ashford's access review campaign: which populations are reviewed at what frequency, who the reviewer is for each, how an entitlement is described so the reviewer can actually judge it (give three worked examples of a group name rewritten into a business statement), what happens to a "remove" decision and within what time, what happens when a reviewer does not respond, and how you would prove afterwards that the campaign changed something. Then write two sentences on why presenting raw group names to a manager guarantees a useless review.

**Part 5 — Instrument it.** Propose six metrics for Ashford's identity lifecycle. For each, give the definition, the data source, the target, the review frequency, and the specific behaviour it would drive if reported to the leadership team every month. Then name one metric that *looks* useful and would be misleading, and explain why.

**Deliverable:** one document containing the traced entitlement table with its findings, the leaver runbook, the classified discrepancy list with remediations, the recertification specification, and the metric set.
