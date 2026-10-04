---
course_id: sn350
project_id: sn350-x01
title: "Northwind Health Risk Register Calibration"
kind: supplementary-project
status: draft
hours_estimate: 5
difficulty: core
related_lessons:
  - sn350-05
  - sn350-08
objectives:
  - Build a risk register with a scoring methodology and run a risk assessment against it
  - Automate policy review, risk acceptance, and attestation campaigns with Flow Designer
competency_ids:
  - D10-S1-C05
  - D2-S1-C05
  - D7-S1-C02
---

## Scenario

Northwind Health (the healthcare payer from lessons 2 to 10) has handed you its legacy risk spreadsheet: 24 rows written by seven business units over three years. The risk committee meets in two weeks and wants (1) a published scoring methodology, (2) the spreadsheet triaged into risks, issues, and topics, (3) a first assessment cycle on the real register, and (4) proof that a risk acceptance cannot quietly become permanent.

## What you will produce

- A one-page scoring methodology (scales with anchors, matrix with a floor rule, appetite statement).
- A triage of the 24 legacy rows into three piles, with a consolidated statement library.
- At least eight risks instantiated against entities, scored inherent and residual, with arithmetic shown.
- One assessment cycle scoped by query, with preserved previous scores.
- A risk acceptance with expiry, and a scheduled expiry sweep flow with an idempotency guard.
- A calibration memo for the committee.

## Before you start (prerequisites, starter files or data)

- A Personal Developer Instance (PDI) with Risk Management (and its GRC core dependency) activated. On a PDI, IRM applications are typically activated by request from the developer portal; plugin names and availability vary by release, so record exactly what you activated. If Risk Management is unavailable on your PDI, complete milestones 1, 2, and 5's design on paper and build the expiry sweep against a small custom table (`u_risk_acceptance` with `risk_name`, `state`, `expiry`, `approver`), and note this in your memo.
- At least three entities (business services or applications from the PDI demo CMDB).
- Starter legacy rows (use these 12 and invent 12 more in the same style from the seven units shown; keep your key):

| # | Legacy row (as written) | Unit | Old rating |
|---|---|---|---|
| 1 | Cybersecurity | IT | High |
| 2 | We do not have MFA on the claims portal admin console | IT | High |
| 3 | Because leavers' local admin accounts are not removed, an unauthorized actor may retain access, resulting in undetected changes to claims data | IT | Medium |
| 4 | Reputational damage | Comms | High |
| 5 | Backup restores for the claims database have never been tested | IT | Medium |
| 6 | Because the claims adjudication vendor has a single data center, a regional outage may stop claims processing, resulting in breach of prompt-pay regulations | Ops | Medium |
| 7 | Access control | Compliance | High |
| 8 | Because privileged access is not reviewed consistently, excessive access may go unnoticed, resulting in fraudulent payments | Finance | High |
| 9 | Because emergency changes skip CAB, an untested change may reach production, resulting in a multi-hour outage of member services | IT | Low |
| 10 | Staff turnover in the actuarial team | HR | Medium |
| 11 | Because member PHI is emailed to providers unencrypted, it may be intercepted, resulting in a reportable breach | Privacy | High |
| 12 | Because leavers keep local admin rights, someone may still have access, causing data changes | Finance | High |

## Milestones

1. **Methodology first** (before touching the spreadsheet). Five-level likelihood (with a 12-month horizon) and impact (worst credible single occurrence) scales, each level anchored. Matrix bands with at least one floor rule (for example, impact 5 never below High). Appetite: which bands require a plan, which require escalation.
2. **Triage.** Sort all 24 rows: genuine risk / control gap (becomes an issue) / topic (becomes a conversation). Rows 3 and 12 should consolidate into one statement. Rewrite every genuine risk in cause-event-consequence form.
3. **Instantiate and score.** Create statements, then risks against entities (at least eight risks). Score inherent likelihood and impact. Link at least one risk (the privileged-access risk) to a control. Compute residual using the lesson 5 derivation; show one by hand.
4. **Assessment cycle.** Launch an assessment scoped by query (for example, all risks on the claims services whose last assessment is empty). Respond as owner for two risks, review as practitioner, and challenge one rating.
5. **Acceptance with expiry.** Record an acceptance on a Moderate risk: authority appropriate to band, rationale, compensating measure, 90-day expiry.
6. **Expiry sweep flow.** Scheduled daily flow: find accepted risks with expiry within 30 days and *no open re-decision task* (guard in the lookup condition), create a re-decision task; on expiry with no decision, return the risk to its pre-acceptance state and notify owner and approver. Run it twice; the second run creates nothing.
7. **Break your matrix.** Find one indefensible cell, change the matrix, and list every risk whose band changed.
8. **Calibration memo** (one page) for the committee.

## Acceptance criteria

- [ ] Methodology is usable by a business owner who has never seen the tool.
- [ ] Every legacy row is classified; control gaps (for example rows 2 and 5) became issues, not risks.
- [ ] Rows 3 and 12 consolidate into one statement.
- [ ] At least eight risks exist with inherent and residual scores; one hand calculation matches the tool.
- [ ] The floor rule demonstrably holds for an impact-5 risk with low likelihood.
- [ ] The assessment preserved previous scores and stamped assessor and date.
- [ ] The acceptance has an expiry, and the sweep is idempotent (second run creates zero tasks).
- [ ] The expired acceptance lapses rather than renewing silently.

## Evidence checklist

- [ ] Methodology document.
- [ ] Triage table: legacy row, pile, resulting statement or issue, reason.
- [ ] Hand calculation for one risk beside a screenshot of the tool's score.
- [ ] Assessment screenshots showing previous score retained.
- [ ] Flow screenshot showing the guard condition in the lookup step, and execution details for both runs.
- [ ] Output of this background script listing risks, bands, and acceptance expiry. Table and field names follow commonly documented IRM names (`sn_risk_risk`, `residual_score`); confirm them on your PDI and adjust before running.

```javascript
var r = new GlideRecord('sn_risk_risk');
r.orderByDesc('residual_score');
r.query();
while (r.next()) {
  gs.info(r.getDisplayValue('name') + ' | inherent ' + r.getValue('inherent_score') +
          ' | residual ' + r.getValue('residual_score') + ' | state ' + r.getDisplayValue('state'));
}
```

- [ ] Before/after list from milestone 7.
- [ ] Calibration memo.

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Methodology | Levels named but not anchored | Anchored scales, time horizon, floor rule, appetite | Anchors tied to Northwind's real thresholds with a rationale for each |
| Triage | Rows imported as-is | Three piles, consolidation, cause-event-consequence | Shrinkage explained ready for the sponsor |
| Scoring | Residual computed by reducing impact | Controls reduce likelihood; floor applied after arithmetic | Explains a case where an impact-reducing control is legitimate |
| Acceptance automation | No expiry or no guard | Expiry, guard, lapse behavior proven | Approval-by-band built as a reusable subflow |
| Memo | Lists scores | Names calibration challenges and decisions needed | Recommends cadence by band with event triggers |

## Stretch goals

- Build the approval-by-band subflow from lesson 8 and call it from the acceptance flow.
- Add an event-driven reassessment trigger when a linked control's attestation fails.

## Reflection prompts

- Which legacy row was hardest to classify, and what does that say about how the business thinks about risk?
- Why would averaging these risks into a single number mislead the committee?

## Instructor notes (common pitfalls, how to adapt for time)

- Learners frequently reduce impact for every control. Ask "does this control make the event cheaper or less likely?"
- Row 4 ("Reputational damage") is a consequence without an event; row 7 is a topic. Expect debate; that is the calibration lesson.
- For a 3-hour version, skip milestone 4 and use 12 legacy rows only.
