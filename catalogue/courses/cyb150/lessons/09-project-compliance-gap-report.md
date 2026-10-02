---
lesson_id: cyb150-09
course_id: cyb150
pathway: cybersecurity-support-technician
title: "Project: Compliance Gap Report"
order: 9
kind: project
competency_ids:
  - D4-S1-C05
  - D4-S1-C04
objectives: []
---

## Goal

Assess Cedar Hollow Community Health against a defined framework subset, evidence every conclusion, and deliver a gap report and executive summary that the Executive Director and the grant funder can both act on.

This is the third and final project in the linked sequence, and it consumes both of the others. **Project 07** gave you the risks. **Project 08** gave you the policies. This project asks the question that closes the loop: for each requirement, does a control exist, does it operate, and can you prove it? The most important finding you will produce comes from the seam between your two earlier artifacts — a policy you drafted in project 08 that says a review happens quarterly, with no evidence that it has ever happened, is **partially met**, not met. Learning to make that call, and to say so in a report that an executive can act on without feeling attacked, is the point of the whole course.

Bring both prior artifacts forward. If either is missing, reconstruct enough of it to work from before you begin.

## The situation

Three months have passed since project 08. The policy set was approved by Angela Ruiz in November. The grant funder has now asked for something more specific than a risk analysis:

> "Please provide a summary of your organization's compliance posture against the HIPAA Security Rule, identifying any material gaps, and your remediation plan with target dates."

At the same time the cyber insurance questionnaire has arrived, the EHR vendor has sent its annual assurance report, and Ridge Revenue Partners still has not produced theirs.

Angela has asked you to perform the assessment and write the report. She will present it. Sam Okonjo will decide what gets funded.

What changed in three months — the raw material for your evidence phase:

```text
+ MFA enabled on the EHR for the 12 administrative accounts. Clinical
  accounts (183) are still password only. Vendor supports it.
+ Offboarding checklist created and stored in the shared drive. Used for
  3 of the 5 departures since November; two managers did not know it existed.
+ Annual security awareness training purchased. 96 of 210 staff have
  completed it. No deadline was communicated.
+ File server permissions reviewed at the administrative office only; the
  clinical share was not touched. No record of what was changed.
+ A quarterly access review is required by the policy you drafted. One has
  been performed, for the EHR only, in a spreadsheet with no date and no
  reviewer name.
- Backup restore test: still never performed.
- Guest Wi-Fi still shares the clinic network at two sites.
- Tablets in exam rooms: still unmanaged, still 22 of them.
- Ridge Revenue Partners: no assurance report, third request unanswered.
  Contract renews in six weeks.
- EHR vendor's assurance report received. Covers Jan-Sep. Contains two
  exceptions relating to change management. Nobody has read past page 2.
- A laptop was reported lost in December. Not encrypted. It belonged to a
  care coordinator. Contents unknown. An incident record was opened and
  has not been updated since.
```

## Requirements

**1. Define the assessment scope.** Name exactly which requirements you are assessing against — a defined subset of at least **fifteen HIPAA Security Rule implementation specifications** drawn from `§164.308`, `§164.310`, and `§164.312`, with at least four from each section, plus the NIST CSF Subcategory you consider each to correspond to. State the period assessed, the systems in scope, the systems explicitly out of scope, and the basis of assessment. Anything you did not look at must be visible as not looked at.

**2. The gap table.** One row per requirement, with columns for: requirement identifier and short text, required or addressable, the internal control or policy statement intended to satisfy it (from project 08), status, evidence examined, evidence gap, and risk ID from project 07 where one applies.

Use exactly four statuses, and use the definitions below without loosening them:

```text
MET              A control exists AND you examined evidence that it operated
                 across the assessed period.
PARTIALLY MET    A control exists in design but evidence of operation is
                 absent, incomplete, or covers only part of the scope or
                 the period.
NOT MET          No control exists, or evidence shows it did not operate.
NOT APPLICABLE   The requirement does not apply, with a written justification.
                 Rare. An assessor will challenge every one of these.
```

At least **six** of your rows must be `PARTIALLY MET`, and for each you must state precisely which of the four deficiencies applies — missing evidence, incomplete evidence, partial scope, or partial period. This distinction is the substance of the project.

**3. Evidence, not assertion.** Every `MET` requires a named artifact in the evidence column: what it is, its source system, the period it covers, and when it was captured. A `MET` supported by "confirmed with IT" is inquiry alone and does not qualify — downgrade it. For every `PARTIALLY MET` and `NOT MET`, the evidence-gap column states the specific artifact that would change the status.

**4. An evidence request list.** The list you would send to owners inside Cedar Hollow to close the gaps: request ID, requirement, exactly what is being asked for, acceptable format, owner role, and due date. At least ten rows. Mark each as design evidence or operating evidence. Include at least one request that must go to a **vendor** rather than an internal owner, and note what leverage exists to obtain it.

**5. Remediation roadmap.** Every gap gets a remediation item with an owner role, a target date, an effort estimate in rough terms, and a priority. Priority must be justified by reference to your project 07 ratings, not by which gap is easiest. Group into three horizons: within 30 days, within 90 days, and beyond 90 days. State a total effort figure Sam can weigh against the two-person IT team.

**6. Executive summary.** One page, standing alone, addressed to the Executive Director and readable by the funder. It must contain: a bottom-line paragraph written last, a status summary showing how many requirements fall in each of the four statuses, the five most consequential gaps stated as business consequences rather than technical findings, what improved since the last assessment, at least one honest statement of what you could not assess and why, and a decisions-requested section with at least three asks — each with an owner, a date, at least two options, and the consequence of no decision.

**7. Two escalations.** Identify at least two matters in this assessment that must go to the Privacy Officer and counsel rather than being resolved in your report. Write the actual handover note for each: the facts you have, the question you are not answering, who you are asking, and what is blocked pending the answer.

**8. Collaboration plan.** Half a page: how you will run the evidence collection across six clinics with two IT staff and no authority over clinical managers. Name your tracking mechanism, your acknowledgement and escalation expectations, what you do when an owner does not respond, and how you would handle a manager who asks you to change a status.

## Constraints

- **Status definitions are fixed.** A policy with no evidence of operation is `PARTIALLY MET`. You may not promote it because the policy is good, because it was only approved recently, or because you wrote it yourself. If your table has no uncomfortable rows, re-read your own definitions.
- **No legal conclusions.** Do not state whether Cedar Hollow is in violation of HIPAA, whether the December laptop loss is a reportable breach, whether the 2019 business associate agreement is enforceable, or what any notification deadline is. State facts; route determinations. A gap report that concludes "we are non-compliant with HIPAA" has made a legal statement it has no standing to make.
- **No fabricated evidence.** Where evidence does not exist, the status reflects that. Do not write a status the artifacts do not support, and do not describe an artifact you have not examined.
- **The report is confidential.** It is a list of your employer's weaknesses. State a classification and a distribution list, and identify what would have to change before any part of it goes to the funder or to an insurer.
- **You assess and report; Angela presents and Sam decides.** Recommend; do not commit the organization to a date you do not control.
- **No implementation.** Configuration steps are out of scope. "Enable MFA for clinical accounts" is a remediation item; a rollout runbook is not.

## Definition of done

- [ ] Scope statement: at least 15 requirements, at least 4 from each of `§164.308`, `§164.310`, `§164.312`, each with a corresponding NIST CSF Subcategory
- [ ] Period, in-scope systems, out-of-scope systems, and basis of assessment all stated
- [ ] Gap table complete, one row per requirement, all columns populated
- [ ] Only the four defined statuses used, with the fixed definitions
- [ ] At least 6 `PARTIALLY MET` rows, each naming which of the four deficiencies applies
- [ ] Every `MET` names a specific artifact with source, period, and capture date
- [ ] Every `PARTIALLY MET` and `NOT MET` names the artifact that would change the status
- [ ] Evidence request list of at least 10 rows, each marked design or operating, including at least one vendor request with its leverage noted
- [ ] Remediation roadmap with owners, dates, effort, priority justified from project 07 ratings, in three horizons, with a total effort figure
- [ ] One-page executive summary containing all seven required elements
- [ ] At least three decision requests, each with options, owner, date, and consequence of no decision
- [ ] Two escalation handover notes written out
- [ ] Collaboration plan covering tracking, acknowledgement, escalation, and status pressure
- [ ] Classification and distribution list stated
- [ ] No legal conclusion anywhere in the document

## Hints

**Assess your own project 08 policies first, and be hard on them.** The quarterly access review you required now exists as an undated spreadsheet covering one system. That is `PARTIALLY MET` on three of the four deficiencies at once — incomplete evidence, partial scope, partial period — and writing that honestly about your own work is the exercise. The status is about the evidence, never about the author.

**Separate "recently implemented" from "operating".** MFA on 12 administrative accounts is real progress and it does not make the access-control specification `MET`, because 183 clinical accounts are outside it. Partial scope is a specific deficiency; name it as such rather than splitting the difference on the status.

**The training numbers are a trap worth falling into deliberately.** 96 of 210 completed, no deadline communicated. The requirement is a security awareness and training programme. Decide what status that earns under your own definitions and then defend it. Both a defensible `PARTIALLY MET` and a defensible `NOT MET` exist here; what is not defensible is `MET` because the training was purchased.

**Read past page 2 of the EHR vendor's report.** The two change-management exceptions are the entire reason the report was sent to you, and a vendor report with unread exceptions is a gap in your own vendor management control, not just the vendor's problem. The Ridge Revenue Partners silence with a renewal six weeks away is a different kind of gap — one where your only real leverage is the renewal date, which makes it a decision request rather than a remediation item.

**Two things in this material are escalations, not findings.** The December laptop was unencrypted and its contents are unknown; the assessment records those facts and stops. The Ridge business associate agreement is a contract from 2019 and its adequacy is not an engineering judgement. Both go in section 7, written as handover notes with the blocked item named.

**Write the executive summary last and shrink it twice.** Draft it, cut it to one page, then cut every sentence that is not a fact, a consequence, or an ask. Then check: does the first paragraph contain the worst news? If it does not, move it.

**Give Sam options, not requests.** "Enable MFA for clinical staff" is a request. "Option A: vendor-supported rollout over six weeks, roughly 40 IT hours, requires 15 minutes of each clinician's time; Option B: defer to the EHR upgrade in Q3, leaving 183 accounts password-only for another two quarters, and RISK-003 at 20 Critical" is a decision. Executives fund decisions.

**Notice what you built.** Register, policies, gap report, roadmap, executive summary. That is a compliance package, produced by one technician, that a funder, an insurer, and an assessor could each be shown a version of. Keep it — it is the strongest single artifact you will take out of this course.
