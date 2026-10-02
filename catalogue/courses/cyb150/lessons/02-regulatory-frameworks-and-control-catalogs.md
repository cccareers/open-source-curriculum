---
lesson_id: cyb150-02
course_id: cyb150
pathway: cybersecurity-support-technician
title: Regulatory Frameworks and Control Catalogs
order: 2
kind: lesson
competency_ids:
  - D4-S1-C01
objectives:
  - Map a stated security requirement to the right control in NIST, ISO 27001, HIPAA, or SOC 2
---

## Four rulebooks, one environment

Here is the situation you are walking into. Your employer runs one set of servers, one identity provider, one laptop fleet. But four different parties are asking questions about it, in four different vocabularies, on four different schedules: a federal regulator, a certification auditor, a customer's procurement team, and your own management. None of them will translate for you. That translation is the job this lesson teaches.

The running scenario for the teaching lessons in this course is **Meridian Health Analytics**, a 140-person company that sells a hosted appointment-analytics product to about ninety small medical clinics. Meridian is not a hospital, but it processes patient names, phone numbers, and appointment histories on behalf of clinics that are, which makes it a **business associate** under HIPAA. Its clinic customers demand a SOC 2 report before they will sign. A prospect in Europe has asked whether Meridian is ISO 27001 certified. And Meridian's own security team organises its programme around the NIST Cybersecurity Framework because they needed some structure to hang everything on. You sit on the IT and security support team. The compliance manager, Dana Okafor, owns the programme; the CISO, Priya Raman, owns the controls; the CTO, Marcus Hale, is the person who can accept a risk. You produce the work.

Before the frameworks, one distinction that prevents most of the confusion in this field.

| Kind | Example | Force | What non-compliance costs |
| --- | --- | --- | --- |
| Law or regulation | HIPAA Security Rule | Binding on covered entities and business associates | Civil penalties, corrective action plan, enforcement |
| Certifiable standard | ISO/IEC 27001 | Voluntary, unless a contract requires it | Loss of certificate, lost deals |
| Voluntary framework | NIST Cybersecurity Framework | None on its own | Nothing directly; it is a language |
| Control catalog | NIST SP 800-53 | Mandatory for federal systems, reference elsewhere | Depends who is pointing at it |
| Attestation criteria | SOC 2 Trust Services Criteria | Contractual | A qualified report; lost deals |
| Contract | A customer security addendum, a BAA | Binding between the parties | Breach of contract |

Read that table twice. A person who says "we have to do this, it's NIST" is usually wrong about *why* and therefore wrong about *how much*. NIST CSF obliges nobody by itself. A customer contract that says "the vendor shall implement controls consistent with NIST SP 800-53 moderate baseline" obliges you enormously — and the obligation is contractual, not regulatory. Knowing which kind of instrument you are looking at tells you who can grant an exception, which is the single most useful thing to know when someone asks for one.

## What each of the four actually is

The goal here is orientation, not recitation. You need to be able to open the right document and find the right neighbourhood. Nobody expects you to know control numbers from memory, and pretending to is a specific way to get burned, as you will see.

### NIST Cybersecurity Framework

The CSF is an organising structure, not a control list. Version 2.0 sorts security outcomes into six **Functions**:

```text
GOVERN   (GV)  - risk strategy, roles, policy, oversight, supply chain
IDENTIFY (ID)  - asset inventory, risk assessment, improvement
PROTECT  (PR)  - identity and access, awareness, data security, platform security
DETECT   (DE)  - continuous monitoring, adverse event analysis
RESPOND  (RS)  - incident management, analysis, reporting, mitigation
RECOVER  (RC)  - restoration, recovery communication
```

Functions contain Categories, and Categories contain **Subcategories**, which is the level you will actually cite: identifiers like `PR.AA-05` (access permissions and authorisations are managed according to least privilege) or `DE.CM-09` (computing hardware and software are monitored to find potentially adverse events). A Subcategory states an outcome. It does not tell you how to achieve it, which is exactly why it makes a good spine: you can map anything to it.

Two CSF ideas are worth carrying forward. **Profiles** describe your current state versus your target state, and the gap between them is a roadmap — which is exactly what project 09 asks you to produce. **Tiers** describe how rigorous your risk practices are, from Partial to Adaptive. They are not maturity grades and are not a score to chase.

### NIST SP 800-53

Where CSF says what outcome you want, SP 800-53 is the catalog of controls that produce it. Revision 5 organises roughly a thousand controls and enhancements into twenty families, each with a two-letter prefix:

```text
AC  Access Control            AU  Audit and Accountability
AT  Awareness and Training    CA  Assessment, Authorization, Monitoring
CM  Configuration Management  CP  Contingency Planning
IA  Identification and Auth   IR  Incident Response
MA  Maintenance               MP  Media Protection
PE  Physical and Environmental PL Planning
PS  Personnel Security        RA  Risk Assessment
SA  System and Services Acq.  SC  System and Comms Protection
SI  System and Information Integrity   SR  Supply Chain Risk Management
```

Controls are numbered within a family: `AC-2` is Account Management, `AC-6` is Least Privilege, `AU-6` is Audit Record Review. A number in parentheses is an **enhancement** — `AC-2(1)` is "automated system account management", a stricter version of the base control. Federal systems select a **baseline** (low, moderate, high) based on impact level. Commercial organisations mostly borrow 800-53 as a reference vocabulary rather than adopting a baseline wholesale, unless a contract makes them.

### ISO/IEC 27001

ISO 27001 is a **management system** standard. The certifiable part is clauses 4 through 10: context, leadership, planning, support, operation, performance evaluation, improvement. In plain terms, it certifies that you run a functioning process for managing information security risk — you identify risks, you decide treatments, you document decisions, you measure, you correct. An auditor from a certification body can, and will, ask to see your risk register and your management review minutes.

**Annex A** is the control reference. The 2022 edition lists 93 controls in four themes:

```text
A.5  Organizational controls  (37)  - policies, roles, supplier relationships, incidents
A.6  People controls           (8)  - screening, terms of employment, awareness, discipline
A.7  Physical controls        (14)  - perimeters, entry, equipment, clear desk
A.8  Technological controls   (34)  - access, crypto, logging, malware, secure development
```

Identifiers look like `A.5.15` (access control), `A.8.5` (secure authentication), `A.8.15` (logging), `A.5.19` (information security in supplier relationships). The document that ties Annex A to your organization is the **Statement of Applicability**: for every one of the 93 controls, you state whether it applies, whether it is implemented, and why. An excluded control is legitimate if the justification is written down. Excluding one silently is a nonconformity.

### The HIPAA Security Rule

HIPAA is law. The Security Rule lives at 45 CFR Part 164 Subpart C and governs electronic protected health information — ePHI specifically, not paper, which is the Privacy Rule's territory. It applies to **covered entities** (providers, plans, clearinghouses) and, since the HITECH Act, directly to their **business associates** — which is Meridian. The contract that binds a business associate is the **Business Associate Agreement**, and it frequently imposes more than the regulation does. Read it before you answer a question about it.

The Rule groups safeguards into three sections:

```text
§164.308  Administrative safeguards - risk analysis, sanctions, workforce access,
                                      training, incident procedures, contingency plan
§164.310  Physical safeguards       - facility access, workstation use, device and media
§164.312  Technical safeguards      - access control, audit controls, integrity,
                                      authentication, transmission security
```

The structural feature you must understand is **required versus addressable**. A required implementation specification must be implemented. An *addressable* one must be assessed: you implement it if it is reasonable and appropriate, and if it is not, you document why and implement an equivalent alternative measure. Encryption of ePHI at rest, at `§164.312(a)(2)(iv)`, is addressable. That does not mean optional, and a support technician who tells a clinic customer "encryption is optional under HIPAA" has created a problem for their employer. The correct sentence is: "That specification is addressable, which means the decision has to be documented by our security officer — let me route that to Dana."

That is also the boundary of this course. Whether a particular disclosure is permitted, whether a particular event is a reportable breach, whether a state law imposes a stricter duty than HIPAA does — those are legal determinations. You do not make them, and neither does this lesson.

### SOC 2

SOC 2 is not a certification and there is no such thing as being "SOC 2 certified", however many vendor websites say so. It is an **attestation report** written by a licensed CPA firm about a service organization's controls, against the AICPA **Trust Services Criteria**. There are five categories:

- **Security** — the common criteria, `CC1` through `CC9`, and the only mandatory category
- **Availability**, **Confidentiality**, **Processing Integrity**, **Privacy** — added by choice, usually because customers ask

The common criteria you will meet most often are the `CC6` access family (`CC6.1` logical access controls, `CC6.2` registration and authorisation, `CC6.3` access removal and modification, `CC6.6` external threat protection, `CC6.7` transmission), `CC7` operations (`CC7.1` vulnerability detection, `CC7.2` monitoring, `CC7.3` and `CC7.4` incident evaluation and response), and `CC8.1` change management.

The distinction that will dominate your working life is **Type I versus Type II**. Type I says the controls were suitably designed as of a single date. Type II says they *operated effectively throughout a period*, typically six or twelve months. Meridian's clinic customers all want Type II. Everything in lesson 05 about evidence follows from that one word, "throughout".

### Named, not taught

Four more will come up. Recognise them, do not pretend to own them:

- **PCI DSS** — payment card data. If Meridian ever touches a card number, this arrives with its own auditors and its own scoping rules.
- **GDPR** — personal data of people in the EU/EEA. The European prospect who asked about ISO 27001 will ask about this next. It is a privacy law with data-subject rights and a data processing agreement, not a control catalog.
- **CMMC** — cybersecurity maturity certification for US defence contractors, built on NIST SP 800-171.
- **State privacy and breach-notification law** — fifty different clocks and thresholds.

When one of these appears in a questionnaire, your answer is a routing decision, not a guess.

![How a single obligation reaches one organization through four different instruments: a regulation, a certifiable standard, an attestation report, and a customer contract](./img/framework-landscape.png)

## The mapping method

You now have four vocabularies. The method that turns a requirement in any of them into something you can act on is the same every time, and it has four steps.

**Step 1 — Parse the requirement.** Requirements are written to be unambiguous to lawyers and are therefore opaque to everyone else. Break each one into four parts before doing anything:

```text
WHO       is obligated?          us, a customer, a subcontractor
WHAT      must be true?          the verb: restrict, encrypt, review, retain, notify
SCOPE     over which assets?     the most common place mapping goes wrong
FREQUENCY how often, or when?    "annually", "prior to access", "within 60 days"
```

If scope is vague, stop and get it pinned down in writing. "Information systems" can mean the production database, or it can mean the production database plus the analytics warehouse plus the support ticket system plus a developer's laptop. Those are two completely different projects.

**Step 2 — Write a neutral control statement.** One sentence, present tense, framework-independent, and falsifiable. If you cannot describe an environment that would make the sentence false, it is not a control statement, it is a slogan.

- Bad: "We use MFA." Not a claim; nothing can disprove it.
- Bad: "Access is appropriately restricted." The word "appropriately" is carrying weight it cannot carry.
- Bad: "We have Okta." A tool is not a control. Tools get replaced; the control outlives them.
- Good: "Every human account with access to the production environment authenticates through the corporate identity provider with a phishing-resistant second factor; no local or shared accounts exist except one documented break-glass account whose use raises an alert."

**Step 3 — Point every framework at it.** The control exists once, in the environment. The frameworks are four different parties asking about the same thing. This is a **crosswalk**, and it is the reason mapping is worth doing: one well-built control answers a HIPAA question, a SOC 2 test, an ISO audit sample, and a customer questionnaire simultaneously.

**Step 4 — Verify every identifier, or mark it unverified.** Never write a control number you have not looked up in the actual publication. A wrong identifier is worse than a blank, because it looks like knowledge and survives review. `SOC 2 — CC6.x, exact criterion to be confirmed with Dana` is an honest, fixable cell. `SOC 2 — CC6.4` when you meant `CC6.3` is a defect that reaches an auditor.

## Worked example 1: workforce access to patient data

The requirement arrives from a clinic customer's security addendum:

> "The Business Associate shall ensure that access to systems containing Protected Health Information is limited to workforce members whose role requires it, and shall review such access periodically."

Parsed:

```text
WHO       : Meridian (business associate)
WHAT      : limit access by role; review it
SCOPE     : "systems containing PHI" - AMBIGUOUS. Production database, certainly.
            Also: the log aggregation platform? The support ticket system where
            customers paste patient names? The nightly export bucket? ASK.
FREQUENCY : "periodically" - undefined. Our own policy must supply a number.
```

Two flags raised in one requirement, and both must be resolved by a human before the mapping is finished. Dana confirms scope as the production database, the nightly export bucket, and the support ticketing system. Meridian's own access control policy supplies the number: quarterly.

Neutral control statement, given identifier `MHA-AC-04`:

> Access to Meridian systems holding PHI is granted only through named individual accounts assigned to a role group by the system owner; no shared accounts exist; membership of every role group is reviewed and re-approved by the system owner at least quarterly; and access is removed within one business day of a termination and five business days of a role change.

Now the crosswalk:

| Framework | Identifier | Requirement in that framework's words |
| --- | --- | --- |
| NIST CSF 2.0 | `PR.AA-05` | Access permissions and authorisations are managed, incorporating least privilege and separation of duties |
| NIST SP 800-53 r5 | `AC-2`, `AC-2(3)`, `AC-6`, `PS-4` | Account management; disable inactive accounts; least privilege; personnel termination |
| ISO/IEC 27001:2022 | `A.5.15`, `A.5.18`, `A.8.2` | Access control; access rights (provision, review, removal); privileged access rights |
| HIPAA Security Rule | `§164.308(a)(3)`, `§164.308(a)(4)`, `§164.312(a)(1)` | Workforce security; information access management; technical access control |
| SOC 2 TSC | `CC6.1`, `CC6.2`, `CC6.3` | Logical access security; registration and authorisation of users; modification and removal of access |

Look at what that one control statement did. Five parties, one implementation, one review record, one evidence package. Look also at what the control statement had to *add* that no framework said: the one-business-day termination window, the five-day role-change window, the quarterly cadence. Those numbers came from Meridian's own policy, and that is the correct source. The requirement set the direction; your policy set the parameters; the control makes both true and checkable.

And be careful with those numbers, because every one of them is something you will be measured against. Writing "within four hours of termination" because it sounds strong, when the real process takes a day, does not make you more secure. It manufactures an audit finding out of nothing.

## Worked example 2: audit logging

The requirement, this time from Meridian's own reading of HIPAA:

> "Implement hardware, software, and/or procedural mechanisms that record and examine activity in information systems that contain or use electronic protected health information."

Parsed:

```text
WHO       : Meridian
WHAT      : record activity AND examine it  <- two verbs, two controls
SCOPE     : systems containing or using ePHI
FREQUENCY : "examine" implies a cadence; the regulation does not state one
```

Notice the two verbs. This requirement is routinely mapped to logging alone, and the second half — *examine* — is forgotten. That omission is one of the most common findings in health-sector assessments, because generating logs is a product feature and reviewing them is a human commitment. Split it into two control statements.

> `MHA-AU-01`: All systems processing PHI forward authentication, authorisation, administrative-action, and PHI-access events to the central log platform within five minutes; log records are retained for twelve months and are write-once to the retention service account.
>
> `MHA-AU-02`: A named security analyst reviews the weekly PHI access anomaly report, documents the disposition of every flagged event in a ticket, and the security manager confirms completion monthly.

| Framework | `MHA-AU-01` (record) | `MHA-AU-02` (examine) |
| --- | --- | --- |
| NIST CSF 2.0 | `PR.PS-04` | `DE.AE-02`, `DE.CM-09` |
| NIST SP 800-53 r5 | `AU-2`, `AU-3`, `AU-11`, `AU-9` | `AU-6`, `AU-6(1)` |
| ISO/IEC 27001:2022 | `A.8.15`, `A.8.17` | `A.8.16` |
| HIPAA Security Rule | `§164.312(b)` | `§164.312(b)`, `§164.308(a)(1)(ii)(D)` |
| SOC 2 TSC | `CC7.2` | `CC7.2`, `CC7.3` |

One requirement, two controls, and the second one is the one that will fail testing, because it depends on a person doing something every week for a year.

## Five ways mapping goes wrong

**Mapping to a product instead of a control.** "Requirement satisfied by CrowdStrike." Next year the tool is replaced and every row that named it is stale, with nobody able to say what the control was for. Name the control; the tool goes in the implementation column.

**Inventing or half-remembering an identifier.** Covered above; it bears repeating because it is the failure mode most specific to this competency. Look it up or flag it.

**Answering the legal question.** "Is this a breach?" "Does GDPR apply to us?" "Can we keep this data for seven years?" These arrive at technical people constantly because technical people are the ones in the ticket. The professional answer is a routing answer, in writing: *"That's a determination for Dana and counsel — I've opened SVC-4471 and copied her with the facts as I have them."*

**Confusing the instrument.** Treating a voluntary framework as a legal mandate makes you cry wolf; treating a contractual obligation as advisory loses a customer. Check which one you are holding.

**Scope drift.** The requirement says "systems containing PHI" and the mapping quietly becomes "the production database." The export bucket, the analytics replica, and the support tool are now unmapped, unmonitored, and in scope for the next audit whether you mapped them or not.

## Practice

You are the compliance support technician at Meridian Health Analytics. Dana has sent you five requirement statements pulled from three different sources and asked for a first-pass crosswalk by Friday.

**Exercise 1 — Parse all five.**

For each requirement below, write the four-line parse block (`WHO / WHAT / SCOPE / FREQUENCY`). Flag every ambiguity explicitly rather than resolving it yourself, and name who you would ask.

1. From a clinic's BAA: "Business Associate shall implement a mechanism to encrypt electronic protected health information whenever deemed appropriate."
2. From a SOC 2 readiness checklist: "Changes to production systems are authorised, tested, and approved prior to implementation."
3. From the HIPAA Security Rule: "Implement procedures for creating and maintaining retrievable exact copies of electronic protected health information."
4. From a European prospect's questionnaire: "Describe how the supplier manages information security within supplier relationships, including sub-processors."
5. From a customer email: "Do we need to notify our patients about the outage you had last Tuesday?"

**Exercise 2 — Write the control statements.**

For requirements 1 through 4, write a neutral, falsifiable control statement with an identifier in Meridian's `MHA-XX-NN` format. Each statement must name a subject, a mechanism, and — where the requirement implies one — a specific frequency or time window drawn from a policy rather than from a framework. Then, for each statement, write one sentence describing an environment that would make it false. If you cannot, rewrite the statement.

**Exercise 3 — Build the crosswalk.**

Produce a table with one row per control and columns for NIST CSF Subcategory, NIST SP 800-53 control, ISO 27001 Annex A control, HIPAA Security Rule section, and SOC 2 criterion. Every cell either contains an identifier you have verified in the source publication, or the literal text `unverified - confirm with compliance`. Count your unverified cells at the end and state how you would close them.

**Exercise 4 — Handle number 5.**

Requirement 5 is a trap, and it is the most realistic item on the list. Write the actual reply you would send. It should take no position on the notification question, capture the facts you do have, name the person the question belongs to, and record a ticket reference. Then write two sentences explaining to a peer why answering it yourself — even with a correct answer — would be a professional error.

**Exercise 5 — Find the double verb.**

Requirement 3 contains more than one obligation, in the same way the audit-logging example did. Split it into the smallest set of separate control statements that fully covers it, and say which of them is most likely to pass a design review and fail an operating-effectiveness test a year later. Justify your pick in two sentences.
