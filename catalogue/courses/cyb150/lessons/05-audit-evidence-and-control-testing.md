---
lesson_id: cyb150-05
course_id: cyb150
pathway: cybersecurity-support-technician
title: Audit Evidence and Control Testing
order: 5
kind: lesson
competency_ids:
  - D4-S1-C05
  - D4-S1-C01
objectives:
  - Collect the evidence an auditor needs to confirm that a control operates as written
---

## The claim and the proof

Your policy says system owners re-approve access to PHI systems every quarter. That is a claim. An auditor's entire job is to decide whether to believe it, and they will not decide on the basis of your assurance, your org chart, or the quality of your documentation. They will decide on the basis of artifacts produced by systems and signed by people.

This lesson is about producing those artifacts. It is the least glamorous competency in the course and the one you will spend the most hours on, because when Meridian's SOC 2 Type II examination starts, the compliance manager does not have production access and the auditor does not have any. You do. Practically every request in the audit lands on the support team, and how well you handle them determines whether the examination takes four weeks or four months.

There is a second competency running through this lesson alongside evidence production: **collaboration**. An audit is a multi-party project with an external firm, an internal owner, control owners across engineering, and you in the middle. Most of the ways an audit goes badly are coordination failures, not technical ones. So the lesson covers both what good evidence looks like and how to work the request queue without creating problems for your employer.

## Who is who

| Role | At Meridian | What they decide | What they must never get from you |
| --- | --- | --- | --- |
| External auditor | Kestrel Assurance, engagement lead Tom Iyer | Whether the control is effective; the opinion | Speculation, scope opinions, or documents nobody asked for |
| Compliance manager | Dana Okafor | Scope, the response, what gets shared | — |
| Control owner | System owner in engineering | That the control operates | — |
| Evidence producer | You | Nothing. You produce, log, and route | — |

Take that last column seriously. Every sentence you say to an auditor is testimony about your employer's control environment, and an offhand remark — *"yeah, we're supposed to do it quarterly but honestly it slips"* — is an audit finding you volunteered. This is not about concealment; you must never misrepresent anything. It is about staying inside your role: state facts you know, produce artifacts you were asked for, and route everything else to Dana.

## Design versus operation, point versus period

Two distinctions govern everything else in this lesson.

**Design effectiveness** asks: if this control worked as written, would it address the risk? You prove design with the policy, the standard, the architecture, the configuration.

**Operating effectiveness** asks: did it actually work, every time it was supposed to, over the period? You prove operation with records generated as the control ran.

**SOC 2 Type I** tests design at a point in time. **SOC 2 Type II** tests operation across a period, typically six or twelve months. HIPAA assessments and ISO 27001 surveillance audits ask period questions too.

From which follows the single most common evidence failure in the field, and the one you should be alert to for the rest of your career:

> A screenshot taken today proves the control was true today. For a period-of-time control it proves almost nothing.

If the control is "access is reviewed quarterly" and you supply a screenshot of the current user list, you have answered a different question than the one asked. The auditor needs four review records — one per quarter of the period — each showing who reviewed, when, what they looked at, and what they decided. If Q2's review was never done, no artifact you produce in December can create it. That gap is a finding, it is your employer's finding rather than yours, and the correct response is to report it accurately, not to construct something.

Say the rest of that plainly, because it will come up. Back-dating a review, generating a report and presenting it as though it were produced in April, or asking a system owner to sign something covering a period during which they did nothing is fabrication of audit evidence. It is a career-ending act and, depending on the context, a criminal one. If anyone asks you to do it, you decline and escalate — to Dana, to the CISO, or above them if necessary.

## The four test methods

Auditors gather evidence four ways, in ascending order of strength. Knowing which method a request implies tells you what to produce.

| Method | What it is | Strength | Example request |
| --- | --- | --- | --- |
| **Inquiry** | Asking someone | Weakest — never sufficient alone | "Walk me through how access is granted." |
| **Observation** | Watching it happen | Weak; proves only that moment | "Show me the approval screen." |
| **Inspection** | Examining records and configuration | Strong | "Provide the Q1 access review record." |
| **Reperformance** | The auditor re-runs the control themselves | Strongest | "Pull the current admin list; we'll compare it to your Q1 approvals." |

Most requests are inspection. When a request looks like inquiry, it is usually a walkthrough at the start of fieldwork, and its real purpose is to work out what to inspect later. Answer walkthroughs precisely and describe the process as it actually runs, not as the policy describes it — a walkthrough that does not match the evidence later is worse than an honest description of a messy process.

## Populations and samples

This is the concept that separates people who have been through an audit from people who have not.

An auditor rarely tests every instance. For a control that ran 300 times in the period, they will test a **sample** — maybe 25 — selected by them from a **population** you provide. Two consequences follow, and both are your responsibility.

**The population must be complete.** If you supply a list of 300 changes and the auditor later finds a change that is not on it, the population is unreliable, the sample drawn from it is meaningless, and the test fails regardless of how good the 25 sampled items were. Populations must be extracted from a system of record with a stated filter, not assembled by hand from memory.

**You do not choose the sample.** Providing "some examples" of good access reviews is not evidence; it is selection bias with a friendly face. Provide the complete population and let the auditor select. If you are asked for examples, that is a walkthrough, and the sampled test is still coming.

A population extract should be self-describing:

```text
Population   : Production change records
Source       : Jira project PLAT, issue type "Change"
Filter       : resolved >= 2026-01-01 AND resolved <= 2026-06-30
                AND environment = production
Extracted by : M. Silva, IT Support        Extracted on : 2026-07-08 14:22 UTC
Record count : 312
File         : POP-CC81_prod-changes_2026-01-01_2026-06-30_extracted-2026-07-08.csv
```

If you cannot state the filter, you cannot defend the completeness of the population — and completeness is the first thing a good auditor tests, usually by cross-checking your list against a different system's record of the same events.

## What makes a single artifact good

Six properties. An artifact missing any one of them will come back as a follow-up request, and follow-up requests are how a four-week audit becomes a twelve-week audit.

1. **Source is identified.** Which system, which view, which account ran the export. A spreadsheet with no origin is unverifiable.
2. **It is dated at the point of capture.** Both the period the data covers and the moment it was captured. These are different dates and both matter.
3. **Scope and filter are stated.** What was included and excluded, in the artifact or its cover note.
4. **The capturer is named.** Who produced it.
5. **It is unaltered.** Export natively — CSV, JSON, PDF — rather than retyping into a spreadsheet. Never crop a screenshot in a way that removes context, and never edit one at all.
6. **It answers a stated request.** Tag it with the request ID so that six months later anyone can reconstruct what it was for.

Screenshot hygiene, since screenshots are unavoidable for configuration evidence: capture the full window including the URL or system name, the logged-in user, and a visible system clock or timestamp field; do not crop to just the setting; and prefer a configuration export over a screenshot whenever the system offers one.

A naming convention that makes an evidence package navigable a year later:

```text
<CONTROL-ID>_<PERIOD>_<short-description>_<capture-date>.<ext>

CC6.2_2026-Q1_access-review-export_2026-04-06.csv
CC6.3_2026-H1_termination-population_2026-07-08.csv
CC8.1_2026-H1_change-population_2026-07-08.csv
CC7.2_2026-H1_log-review-tickets_2026-07-09.pdf
```

## A real-shaped evidence request list

Auditors send a request list — often called the PBC list, for "provided by client". Here is a fragment of the one Kestrel sent Meridian for the period 1 January to 30 June 2026.

| Req | Criterion | Control | Request | Format | Owner | Due |
| --- | --- | --- | --- | --- | --- | --- |
| PBC-004 | `CC6.2` | MHA-AC-05 | Evidence that quarterly user access reviews were performed for all systems containing PHI during the period, including reviewer, date, accounts reviewed, and outcome | Native export plus approval record | System owners / IT Support | 2026-07-15 |
| PBC-005 | `CC6.3` | MHA-AC-06 | Complete listing of all workforce members terminated during the period, with termination date | HR system export | HR | 2026-07-15 |
| PBC-006 | `CC6.3` | MHA-AC-06 | For the sample selected from PBC-005, evidence of access removal and its date | Ticket export plus IdP audit log | IT Support | 2026-07-22 |
| PBC-011 | `CC8.1` | MHA-CM-01 | Complete listing of all production changes during the period | Ticket system export | Platform | 2026-07-15 |
| PBC-014 | `CC7.2` | MHA-AU-02 | Evidence that log reviews were performed at the documented frequency, with disposition of flagged events | Ticket export | Security | 2026-07-22 |
| PBC-019 | `CC6.1` | MHA-AC-07 | Current MFA configuration for the production identity provider | Configuration screenshot or export | IT Support | 2026-07-15 |
| PBC-023 | `CC9.2` | MHA-VM-01 | Vendor listing with tier, and the most recent SOC 2 report for each critical vendor | Documents | Compliance | 2026-07-22 |
| PBC-027 | `CC6.1` | — | Confirm whether the analytics data warehouse is in scope for this examination | Written response | ??? | 2026-07-15 |

Two rows in that list are not what they appear.

**PBC-019 is a design-only request** — a point-in-time configuration. It proves MFA is enforced today. It does not prove MFA was enforced in February. Produce what was asked, and if you know the configuration changed mid-period, say so in the cover note; a control that was implemented in March is a control with a three-month gap, and the auditor will find it in the change records anyway.

**PBC-027 is not an evidence request at all.** It is a scope question, and the owner column is a question mark because nobody should have answered it yet. Answering "yes, it's in scope" pulls a whole system into the examination. Answering "no" is a representation about your employer's scope that you have no authority to make. This one goes to Dana, same day, with a note that it is blocking nothing yet but has a due date.

## Worked example: responding to PBC-004

The control, from lesson 04's policy: *system owners must review and re-approve all user access to systems containing PHI at least once per quarter, and must record the review outcome.*

The period is two quarters, so the answer is not one artifact. Work backwards from what the auditor must be able to conclude.

**What must be shown, per quarter, per in-scope system:** that a review happened; when; who performed it; the complete list of accounts they looked at; a retain-or-revoke decision for each; and that revocations actually happened.

That last item is the one everyone forgets. A review that flagged three accounts for removal and a system where those three accounts are still active is a *worse* finding than no review at all, because you have documented evidence that you knew.

**The package:**

```text
PBC-004 RESPONSE - Quarterly user access review, 2026-01-01 to 2026-06-30
In-scope systems: production database, nightly export storage, support ticketing

01_cover-note.md
     Systems in scope and why; the review cadence and its policy reference
     (POL-AC-01 §3.6); reviewers by system; one known deviation, stated up
     front (see below); index of the files in this package.

02_CC6.2_2026-Q1_prod-db_review-export_2026-04-06.csv
     Native export from the IdP: every account in the prod-db role groups as
     of the review date, with group, grant date, and last login.

03_CC6.2_2026-Q1_prod-db_review-decisions_2026-04-06.pdf
     The completed review: each account with retain/revoke, reviewer name,
     signature, date 2026-04-06.

04_CC6.2_2026-Q1_prod-db_revocation-tickets_2026-04-14.pdf
     SVC-3981, SVC-3982, SVC-3987 - the three accounts marked revoke, each
     showing the removal action and its timestamp.

05..07  Same three artifacts for the nightly export storage, Q1.
08..10  Same three artifacts for support ticketing, Q1.
11..19  Q2 equivalents for all three systems.

20_deviation-note.md
     The Q2 support-ticketing review was performed on 2026-07-11, eleven days
     after the quarter closed. Cause: system owner transition. Recorded in
     SVC-4402. Stated by Meridian, not discovered by the auditor.
```

The deviation note is the professionally important part. You will find gaps while assembling evidence — that is what assembling evidence is for. Surfacing one yourself, with a cause and a ticket, is the behaviour of a mature control environment. Waiting for the auditor to find it converts a self-identified deviation into a discovered exception, which is a materially worse outcome for your employer and is entirely your doing.

Keep an evidence log as you go:

| Req | Artifact | Source | Period | Captured | By | Status |
| --- | --- | --- | --- | --- | --- | --- |
| PBC-004 | prod-db review export Q1 | Identity provider | 2026-Q1 | 2026-04-06 | System owner | Delivered 07-14 |
| PBC-004 | revocation tickets Q1 | Service desk | 2026-Q1 | 2026-07-09 | M. Silva | Delivered 07-14 |
| PBC-004 | ticketing review Q2 | Identity provider | 2026-Q2 | 2026-07-11 | System owner | Delivered 07-14, deviation noted |
| PBC-027 | — | — | — | — | — | Routed to Compliance 07-08, awaiting scope decision |

The log is not overhead. It becomes next year's head start, it answers "did we ever send that?" instantly, and it is itself evidence that the audit response was managed.

## Working the request queue

The collaboration half of this competency is a set of habits, and they are learnable.

**Acknowledge within one business day, even when the answer is slow.** Silence is read as a problem. "Received, targeting Thursday, one clarification below" costs a minute and buys a week of goodwill.

**Ask clarifying questions early and in writing.** The most expensive audit mistake is spending three days assembling the wrong thing. When a request is ambiguous, restate your reading and ask for confirmation: *"Reading PBC-014 as covering the weekly PHI access anomaly review only, not the daily infrastructure alert triage — confirm?"*

**Give exactly what was asked for.** Not less, and emphatically not more. A dump of the full log platform in response to a request for one report hands the auditor data they did not ask for, may pull systems into scope, and risks disclosing information the auditor is not entitled to. Over-sharing feels cooperative and is a real professional error.

**Route rather than answer, when the question is not yours.** Scope, contractual interpretation, whether something is a reportable breach, whether a control was "adequate", commitments about future remediation: all of these belong to Dana. Route them the same day, in writing, with the deadline attached.

**Never modify an artifact to look better.** If the export is ugly, send the ugly export with a cover note explaining it.

**Track everything centrally.** One tracker, shared with the compliance manager, showing request, owner, status, due date. Three people privately emailing artifacts to the auditor is how items get missed and how nobody can answer "where are we?"

**Escalate a blocked request rather than sitting on it.** If a system owner has not responded in three days, that is Dana's problem to solve and she can only solve it if she knows.

## When the evidence shows a failure

Sometimes you assemble the package and it proves the control did not operate. Two of the four access reviews were skipped. Nine of 312 changes had no approval. The log review has not run since April.

This is normal, and it has an established path.

The auditor records an **exception** — an instance where the control did not operate as described. Enough exceptions, or a severe one, and the control is deemed ineffective, and the report carries a **qualified opinion**. Management writes a **management response**: what happened, why, what is being done, by when, by whom.

Your part is narrow and important. Produce the evidence accurately, including the part that shows the failure. Document what you observed factually, without characterising it — "no approval record exists for these nine changes" rather than "the team ignored the process." Note contributing facts you actually know, such as a tooling change in March. And hand it to the control owner and the compliance manager, immediately, because a management response written with three weeks' notice is a plan and one written in the final week is an excuse.

The organizational instinct to minimise a finding is strong and you will feel it. Resist it. A qualified SOC 2 with an honest remediation plan is a survivable business fact that customers negotiate around every day. Evidence that was manufactured to avoid one is not survivable by anyone.

## Practice

Kestrel's fieldwork at Meridian starts Monday. The full request list has landed and Dana has assigned you five items.

**Exercise 1 — Triage the requests.**

For each request below, state (a) whether it tests design or operating effectiveness, (b) which of the four test methods it implies, (c) whether it is point-in-time or period-of-time, and (d) who should own it. One of the five is not yours to answer at all — identify it.

1. "Provide evidence that vulnerability scans were performed at the documented frequency during the period."
2. "Provide the current password policy configuration from the identity provider."
3. "Confirm that the analytics data warehouse contains no PHI."
4. "Provide a complete listing of all users granted privileged access during the period."
5. "Walk us through how a production change moves from request to deployment."

**Exercise 2 — Build a population extract.**

For request 4, write the population definition block — source system, filter, extraction method, count, extractor, extraction timestamp, filename — following the format in this lesson. Then write two sentences explaining how an auditor could test whether your population is complete, and name one system they could cross-check it against.

**Exercise 3 — Assemble an evidence package.**

For request 1, and assuming Meridian's policy commits to authenticated internal scans monthly and external scans weekly across a six-month period, write out the file manifest for the package: every artifact, with a compliant filename, its source system, the period it covers, and one line on what it proves. Then state explicitly which artifact proves *operation over the period* rather than the current configuration — and if none of your artifacts does, fix the manifest.

**Exercise 4 — Handle a bad result.**

While assembling Exercise 3 you discover that external scans ran weekly in January and February, then stopped for six weeks after a scanner licence lapsed, and resumed in mid-April. Write three things: the factual deviation note you would attach to the evidence package; the message you would send to the control owner and Dana today; and a two-sentence explanation of why disclosing this yourself is better for Meridian than letting Kestrel find it in the scan history.

**Exercise 5 — Reply to the three awkward messages.**

Write your actual reply to each, in two to four sentences.

1. Tom from Kestrel, in the hallway: *"Off the record, do you think the access reviews are actually happening?"*
2. A system owner, by chat: *"Can you just sign the Q2 review for me and date it end of June? I did look at it, I just never wrote it down."*
3. Tom again, by email: *"While you're pulling that, can you send the full log export for the period so we can have a look around?"*

For each, name the principle from this lesson your reply is applying, and where relevant, name who you copied.

## Check your understanding

1. The auditor asks for evidence that access reviews ran quarterly, and you send a screenshot of today's user list. What is wrong? *It proves current state, not operation across the period. The auditor needs one review record per quarter, with reviewer, date, accounts, decisions, and the revocations actually carried out.*
2. Why must you supply the full population rather than "a few good examples"? *The auditor selects the sample. Handpicked examples are selection bias, and an incomplete population invalidates the whole test.*
3. A system owner asks you to sign and back-date a missed review. What do you do? *Decline and escalate to Dana or the CISO. Back-dating is fabrication of audit evidence.*
