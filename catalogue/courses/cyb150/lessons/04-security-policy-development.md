---
lesson_id: cyb150-04
course_id: cyb150
pathway: cybersecurity-support-technician
title: Security Policy Development
order: 4
kind: lesson
competency_ids:
  - D4-S1-C03
objectives:
  - Draft a security policy that is specific, enforceable, and traceable to a control requirement
---

## A policy is a decision, written down

You have a requirement from lesson 02 and a rated risk from lesson 03. A policy is what happens next: the organization's written decision about how it will behave, published so that the decision does not have to be re-made by every employee every day.

That definition rules out most of what gets called policy. A document that says "employees should use good judgement when handling sensitive information" has decided nothing. It cannot be followed, because it does not say what to do; it cannot be enforced, because no specific act violates it; and it cannot be audited, because there is no test. It exists so that a box can be ticked, and an experienced auditor will spot it in about eight seconds.

A policy that works has three properties, and this lesson is organised around producing all three.

- **Specific.** A competent employee reading it knows exactly what they are and are not permitted to do, without asking anyone.
- **Enforceable.** A specific act either violates it or does not, and the organization is genuinely willing and able to act on a violation.
- **Traceable.** Every statement in it exists for a reason you can point at — a control requirement, a risk in the register, a contractual commitment.

The third one is what most drafts lack, and it is the one that turns a policy from a document into evidence. A policy statement with no traceable origin is either a good idea somebody had, or an obligation nobody can find again when it is challenged.

Note your seat, as always. At Meridian, you draft. Priya reviews for technical accuracy, HR reviews anything touching employment consequences, and Dana routes anything with legal exposure to counsel. Marcus or the designated security officer approves. **The signature is not yours**, and a policy without an approving signature is a draft no matter how good it is.

## Policy, standard, procedure, guideline

More policy work goes wrong here than anywhere else. Four document types, four purposes, four review cadences, four audiences. Mixing them produces a fifteen-page "policy" that must go back to an executive approver every time a firewall model changes.

| Type | Answers | Tone | Changes | Approved by |
| --- | --- | --- | --- | --- |
| **Policy** | *What* must be true and *why* | Mandatory, technology-neutral | Rarely — annually | Executive or security officer |
| **Standard** | *To what specification* | Mandatory, specific and technical | When technology changes | Security lead |
| **Procedure** | *How*, step by step, by whom | Instructional, sequential | Whenever the process changes | Process owner |
| **Guideline** | *What is recommended* | Advisory — "should", never "must" | Freely | Subject matter expert |

The same subject, expressed at all four levels:

```text
POLICY    "All access to Meridian systems containing PHI must be authenticated
           with multi-factor authentication."
STANDARD  "Multi-factor authentication for privileged accounts must use a
           FIDO2 hardware authenticator. Push-notification and SMS factors are
           not permitted for privileged accounts."
PROCEDURE "1. Service desk receives the request via SVC ticket.
           2. Verify the requester's manager approved in the ticket.
           3. Register the key in the identity provider under the user's
              named account. 4. Confirm enrolment. 5. Note the key serial in
              the ticket and close."
GUIDELINE "Consider issuing a second hardware key to staff who travel, to
           avoid lockout if one is lost."
```

Notice what this separation buys you. When FIDO2 is superseded, the standard changes and the policy does not — no executive signature required. When the service desk tool changes, the procedure changes and nothing else does. Policies that embed product names and step-by-step instructions are permanently out of date, and out-of-date policies are worse than none because staff learn to ignore the whole library.

## The anatomy of a policy document

Every policy carries the same header block. This is not bureaucracy; every field in it exists because an auditor asks for it or a reader needs it.

```text
Document ID     POL-AC-01              Version        2.1
Title           Access Control Policy  Classification Internal
Owner           Priya Raman, CISO      Approver       Marcus Hale, CTO
Effective date  2026-04-01             Next review    2027-04-01
Applies to      All Meridian workforce members, contractors, and vendor
                personnel with access to Meridian information systems
```

Then the body sections, in this order:

1. **Purpose** — two or three sentences on why the policy exists and what outcome it protects.
2. **Scope** — who it binds and which systems and data it covers. State exclusions explicitly; an unstated exclusion is an argument waiting to happen.
3. **Policy statements** — numbered, one obligation per statement.
4. **Roles and responsibilities** — who does what, by role title rather than by person's name.
5. **Exceptions** — how to request one, who can grant it, that it expires.
6. **Enforcement** — the consequence of violation, in language HR has approved.
7. **Related documents** — the standards and procedures beneath it.
8. **Control mapping** — the traceability table.
9. **Revision history** — version, date, author, summary of change, approver.

## Writing statements that can be enforced

The craft of policy writing lives in the numbered statements. Three rules.

**Use precise obligation words, consistently.** Adopt the convention and state it in the document: **must** is a requirement, **must not** is a prohibition, **should** is a recommendation whose deviation needs no exception, **may** is permission. Never use "will", "shall", "is expected to", "is encouraged to", and "is responsible for ensuring" interchangeably in the same document. If a reader has to guess whether a sentence binds them, it does not.

**Make every statement testable.** Read each one and ask: what exactly would I inspect to know whether this is true? If the answer is "nothing", rewrite it.

**One obligation per numbered statement.** A statement with three obligations gets partially implemented and cannot be scored in an audit.

Here is the same set of intentions, drafted badly and then repaired:

| Bad | What is wrong | Repaired |
| --- | --- | --- |
| "Passwords should be strong." | No specification; "should" makes it advisory | "User account passwords must be at least 14 characters and must be checked against a breached-password list at the time they are set." |
| "Access must be reviewed regularly." | "Regularly" is not a frequency; no actor | "System owners must review and re-approve all user access to systems containing PHI at least once per quarter, and must record the review outcome in the access review ticket." |
| "Employees must not misuse company systems." | Unfalsifiable; every dispute becomes a debate | "Workforce members must not install software on Meridian endpoints except from the managed software catalogue." |
| "All data must be encrypted." | Scope unbounded, impossible in practice, so ignored in practice | "PHI must be encrypted in transit using TLS 1.2 or higher, and at rest using the platform's managed encryption on the database, object storage, and backup services." |
| "Terminated employees' access should be removed promptly and their equipment returned and their manager notified." | Three obligations in one; "promptly" | Split into three numbered statements, each with an actor and a time limit. |
| "Staff are responsible for ensuring appropriate security of their workstations." | Delegates the definition to the reader | "Workforce members must lock their workstation when leaving it unattended and must not disable the enforced 10-minute screen lock." |

A discipline that catches almost everything: after drafting a statement, write the sentence "This would be violated if…" If you cannot complete it with a concrete act, the statement is decorative.

## A real-shaped excerpt

Here is a fragment of `POL-AC-01` as it would actually be published at Meridian, drawing on the control statement built in lesson 02 and the risks rated in lesson 03.

```text
POL-AC-01  ACCESS CONTROL POLICY                       Version 2.1
Owner: CISO   Approver: CTO   Effective: 2026-04-01   Review: 2027-04-01

1. PURPOSE
   This policy establishes the requirements for granting, reviewing, and
   removing access to Meridian information systems. It exists to ensure that
   only workforce members whose role requires access to protected health
   information can obtain it, and that such access can be demonstrated to
   customers and regulators.

2. SCOPE
   This policy applies to all Meridian workforce members, contractors, and
   vendor personnel, and to all Meridian information systems that store,
   process, or transmit customer data or PHI, including the production
   database, the nightly export storage, the log platform, and the customer
   support ticketing system. Personal devices not enrolled in Meridian device
   management are out of scope and are prohibited from accessing these
   systems by statement 3.9.

3. POLICY STATEMENTS
   In this policy, "must" indicates a requirement and "should" indicates a
   recommendation.

   3.1  All access to in-scope systems must be through a named individual
        account provisioned from the corporate identity provider. Shared,
        generic, and group login accounts must not be created or used.

   3.2  Exactly one break-glass administrative account may exist per
        production system. Its credential must be held in the password vault,
        its use must generate an alert to the security team within 15 minutes,
        and each use must be reconciled to a change or incident ticket within
        one business day.

   3.3  All human access to in-scope systems must be authenticated with
        multi-factor authentication. Privileged access must additionally meet
        STD-AC-02 (Authenticator Standard).

   3.4  Access must be granted on the principle of least privilege, through
        membership of a role group. Permissions must not be assigned directly
        to an individual account.

   3.5  Access requests must be approved by the requester's line manager and
        by the owner of the target system before provisioning. Approval must
        be recorded in the service ticket.

   3.6  System owners must review and re-approve the membership of every role
        group granting access to PHI at least once per calendar quarter.
        The reviewer, the date, the accounts reviewed, and each retain-or-
        revoke decision must be recorded.

   3.7  Access for a workforce member whose employment or engagement ends
        must be disabled within one business day of the effective end date.

   3.8  Access must be modified within five business days of a role change
        to reflect the new role's entitlements. Entitlements from the prior
        role must be removed, not retained alongside the new ones.

   3.9  Access to in-scope systems from a device not enrolled in Meridian
        device management is prohibited.

4. ROLES AND RESPONSIBILITIES
   System Owner    Approves access; performs quarterly review (3.6).
   Line Manager    Approves requests for their reports (3.5); notifies HR and
                   IT of departures and role changes.
   IT Support      Provisions, modifies, and removes access; records evidence.
   CISO            Owns this policy; maintains the supporting standards.

5. EXCEPTIONS
   Any deviation from this policy requires an approved exception recorded in
   the exception register (see section 5 of this lesson). Exceptions are
   granted by the CISO, must state a compensating measure, and must not
   exceed 12 months without renewal. Where a statement in this policy
   implements a requirement of an executed customer agreement or of law,
   an exception may not be granted at CISO level and must be escalated to
   the Compliance Manager.

6. ENFORCEMENT
   Violations may result in withdrawal of access and disciplinary action
   under the Meridian Employee Handbook, up to and including termination.
   [Wording of this section reviewed and approved by Human Resources.]
```

Read statement 3.8 again, because it is the one most drafts miss. Removing old entitlements on a role change is a different act from granting new ones, and if the policy does not say so, the accumulation of permissions across a career — what auditors call privilege creep — is not a violation of anything.

Read the last sentence of section 5 too. That is the escalation boundary from lesson 02, written into the policy itself so that nobody has to remember it.

## Traceability: the mapping table

Append this to every policy. It is the difference between a document and a control, and it is the first thing a prepared auditor asks for.

| Statement | Control | NIST CSF | 800-53 | ISO 27001 | HIPAA | SOC 2 | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 3.1, 3.2 | MHA-AC-04 | `PR.AA-01` | `AC-2`, `IA-2` | `A.5.16`, `A.8.2` | `§164.312(a)(2)(i)` | `CC6.1` | RISK-016 |
| 3.3 | MHA-AC-07 | `PR.AA-03` | `IA-2(1)` | `A.8.5` | `§164.312(d)` | `CC6.1` | RISK-014 |
| 3.4, 3.5 | MHA-AC-04 | `PR.AA-05` | `AC-6`, `AC-2` | `A.5.15`, `A.5.18` | `§164.308(a)(4)` | `CC6.2` | RISK-016 |
| 3.6 | MHA-AC-05 | `PR.AA-05` | `AC-2(3)` | `A.5.18` | `§164.308(a)(4)(ii)(C)` | `CC6.2` | RISK-016 |
| 3.7, 3.8 | MHA-AC-06 | `PR.AA-05` | `PS-4`, `PS-5` | `A.5.18`, `A.6.5` | `§164.308(a)(3)(ii)(C)` | `CC6.3` | RISK-016 |
| 3.9 | MHA-EP-02 | `PR.PS-01` | `AC-19`, `CM-6` | `A.8.1` | `§164.310(b)` | `CC6.7` | RISK-021 |

Three things this table does. It proves every statement has a reason, so a challenge like "why do we do quarterly reviews?" has a written answer rather than a shrug. It shows the auditor exactly where to look, which shortens every audit you will ever be part of. And read the other way — down the framework columns — it shows what is *not* covered, which is the raw material for the gap report in project 09.

Apply the same identifier discipline from lesson 02. An unverified cell says `unverified`. It never says a plausible-looking number.

## The lifecycle: what "maintain" means

Drafting is the short part. The competency says develop *and maintain*, and maintenance is where policies quietly die.

**Draft → review → approve → publish → attest → review again.** The review stage has more participants than people expect: the CISO for technical accuracy, system owners for whether the statements are actually operable, HR for anything with an employment consequence, Legal for anything touching monitoring, privacy, retention, or contractual commitments, and — this is the one people skip — a representative of the staff who will have to live with it. A policy that makes the correct behaviour harder than the incorrect one will be routed around, and you will have manufactured a control that generates violations rather than compliance.

Publication means findable, not emailed. Attestation means a record that each workforce member acknowledged it, which is a HIPAA training expectation, a SOC 2 `CC1`/`CC2` evidence item, and the thing that makes enforcement fair. A policy nobody has read is not a control; it is a document that will be used against your employer rather than for it.

Then review. Annually at minimum, and off-cycle whenever one of these triggers fires:

- A new system, vendor, or data type enters scope
- An incident or audit finding shows the policy was silent, wrong, or unfollowable
- A regulation or a customer contract changes an obligation
- A repeated exception request reveals a statement that does not survive contact with reality

That last trigger is the useful one. Three exception requests against the same statement is not an exceptions problem; it is a drafting defect. Fix the statement.

Version numbering: increment the minor version for clarifications, the major version for a change in obligation. Record it in the revision history with the approver, because an auditor testing a control over a twelve-month period needs to know which version of the policy was in force in month three.

## Exceptions, properly

Exceptions are healthy. Undocumented deviation is the disease. Keep a register:

```text
EXC-2026-011
Policy / statement : POL-AC-01 §3.9 (managed devices only)
Requested by       : Head of Analytics
Description        : The analytics consultancy's two engineers use consultancy-
                     managed laptops that cannot be enrolled in Meridian MDM.
Business reason    : Engagement ends 2027-03; enrolment would require the
                     consultancy to re-image devices used for other clients.
Risk accepted      : RISK-022, residual rated 3x4 = 12 (High)
Compensating       : Access restricted to a virtual desktop with clipboard and
                     file transfer disabled; no local data storage; session
                     recording enabled; access reviewed monthly rather than
                     quarterly.
Approved by        : Priya Raman, CISO           Date: 2026-05-02
Expires            : 2027-03-31                  Review: 2026-11-02
```

Every field earns its place. No expiry date means the exception becomes permanent by inattention, which is how a temporary vendor arrangement is still running in year four. No compensating measure means the exception is just non-compliance with a signature on it. And where the statement being excepted implements a legal or contractual requirement, the approval line moves above the CISO — a security lead cannot excuse the organization from a duty it agreed to.

## Where policy stops and law begins

Some sections of a policy are not yours to write, and knowing which ones is part of the competency.

- **Enforcement and disciplinary language** — HR and Legal own the wording. Draft a placeholder and say so.
- **Monitoring and employee privacy** — what an employer may lawfully monitor varies by jurisdiction and by what the employment contract says. Never draft this from a template you found.
- **Data retention periods** — driven by regulation, contract, and litigation-hold obligations. Ask; do not pick a number that sounds reasonable.
- **Breach notification timelines and thresholds** — a legal determination in every jurisdiction.
- **Anything you are copying from another company's published policy** — their obligations are not yours.

The right move in every one of these cases is the same as it was in lesson 02: draft everything around the gap, mark the gap clearly in the draft, and route it in writing to the person who can fill it.

## Practice

Meridian is preparing for its first SOC 2 Type II examination and has discovered that its Remote Access Policy is one paragraph long. Dana has asked you to produce a proper draft.

**Exercise 1 — Sort the documents.**

Below are eight statements pulled from Meridian's existing document library. For each, say whether it belongs in a policy, a standard, a procedure, or a guideline, and rewrite it in the register appropriate to that type.

1. "VPN should be used when working remotely."
2. "Click the shield icon in the system tray, then select 'Connect — Meridian Prod'."
3. "Remote sessions must time out."
4. "We use WireGuard on port 51820."
5. "It's a good idea to avoid public Wi-Fi."
6. "Contractors get access."
7. "TLS 1.0 and 1.1 are disabled on all externally reachable endpoints."
8. "The service desk will handle lost device reports appropriately."

**Exercise 2 — Draft the policy.**

Write `POL-RA-01`, the Meridian Remote Access Policy, complete with the header block, purpose, scope with an explicit exclusion, at least eight numbered policy statements, a roles and responsibilities section, an exceptions section, and an enforcement placeholder. Constraints: every statement uses **must**, **must not**, **should**, or **may**; every statement carries exactly one obligation; no product names appear in the policy (push them down to a standard); and at least three statements specify a number — a time limit, a version, a frequency, or a count.

**Exercise 3 — Apply the violation test.**

For each of your numbered statements, write the sentence "This would be violated if…" and complete it with a concrete act by a specific role. Any statement you cannot complete goes back to Exercise 2 and gets rewritten. Report how many you had to rewrite.

**Exercise 4 — Build the mapping table.**

Append a traceability table to your policy with one row per statement, mapping to a NIST CSF Subcategory, an SP 800-53 control, an ISO 27001 Annex A control, a HIPAA Security Rule section, a SOC 2 criterion, and a risk ID from lesson 03. Mark unverified identifiers as `unverified`. Then read the table down the columns and name one framework requirement your policy does *not* cover, and say whether that is a gap or a deliberate exclusion.

**Exercise 5 — Write the exception, and find the one you cannot grant.**

The analytics consultancy needs remote access from unmanaged laptops. Write the full exception record in the format shown in this lesson, including a compensating measure specific enough to be tested. Then: Meridian's largest clinic customer has a signed agreement requiring that all remote access to PHI use company-managed devices. Explain in three sentences what changes about your exception, who it now has to go to, and what you would write in the ticket to hand it over.
