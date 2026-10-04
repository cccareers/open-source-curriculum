---
course_id: sn350
title: "GRC: Integrate Risk Management (IRM) — Enhancement Review"
reviewed_lessons: 11
status: draft
---

## Summary

An unusually strong course: it teaches GRC as operating machinery, keeps one running example (Northwind Health's quarterly privileged access review) from lesson 3 through lesson 9, and is consistently honest about evidence, independence, and access. The main defects are in code samples: lesson 7's staleness guard referenced an undefined variable and compared a string to an object, and several table and role names are presented as shipped without a release anchor. The biggest opportunity is guided practice for risk calibration and indicator failure handling, plus fixing a scenario mismatch: the capstone switches from Northwind Health to "Meridian Logistics", a name also used (with different facts) in sn330.

## Clarity issues

| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| sn350-07 | "What a good indicator asserts" (second code block) | Guard snippet used `cutoffForLoad` without defining it, compared a date string to a GlideDateTime object, and had a bare `return` with no instruction on where to place it. | Defined `cutoffForLoad`, compared with `.getValue()`, and added a comment to place it inside the evaluation function. | Applied |
| sn350-08 | "Where a business rule is the right answer" (code) | Uses `sn_policy_statement`; the shipped policy statement table name on current releases may differ (possibly `sn_compliance_policy_statement`). | Added a comment that table and field names are illustrative. Verify and correct. | Applied (comment) / Proposed (name) |
| sn350-10 | "Exposing the right data to the right readers" (code) | Role names `sn_risk.practitioner`, `sn_audit.auditor` and the dot-walk `entity.support_group` are not verified; risk entities are GRC profile records that may not carry a support group directly. | Added a comment that role names and the entity-to-group path are illustrative. | Applied (comment) / Proposed (verify) |
| sn350-03 / 07 / 09 / 10 | Code samples | `sn_compliance_citation`, `sn_compliance_control`, `sn_grc_issue`, `sn_grc_indicator_result` and fields such as `related_control`, `source_type`, `compliance_result` are presented as shipped. Table names look plausible; several field names likely differ by release. | Verify each against the target release; consider a single "names used in this course" note in lesson 2. | Proposed |
| sn350-04 | "The control record and its lifecycle" | State labels (Draft, Attest, Monitor, Review, Retired) are given as "roughly" — good — but learners will look for them verbatim. | Confirm labels on target release or add "labels vary". | Proposed |
| sn350-11 | "Scenario" | Capstone introduces "Meridian Logistics" (freight, ~900 employees) while lessons 2 to 10 use Northwind Health; sn330 also uses "Meridian Logistics" (~4,000 employees, US/UK/India). Confusing across the pathway. | Decide whether the capstone should continue Northwind or deliberately use a fresh client with a distinct name. | Proposed |
| sn350-02 to 10 | End of lesson | No self-check. | Added "Check your understanding" with answers to all nine content lessons. | Applied |

## Depth and coverage gaps

- **Risk calibration practice** (objective: "Build a risk register with a scoring methodology and run a risk assessment against it"): lesson 5 is rich on method but learners never triage a real messy register. Project x01 supplies a legacy spreadsheet with planted defect types.
- **Indicator failure modes** (objective: "Configure indicators that test control effectiveness continuously instead of once a year"): the "blind indicator" problem is the lesson's most important idea; x02 turns it into a five-scenario drill and also exercises "Route a failed control into an issue and a remediation task, and support an audit engagement".
- **PDI setup:** no lesson says how to obtain IRM applications on a PDI. Many learners will stall at lesson 3 practice step 1.
- **Capstone competencies:** sn350-11 lists D10-S1-C05 and D9-S1-C01 but requires CMDB scoping (D5-S1-C01/C05) and flow automation (D2-S1-C05). Not changed (course.json out of scope).
- **Misconception:** that row-level ACLs protect aggregates and PA scores. Lesson 10 covers it well; video v02 reinforces it.

## Proposed additional projects

- **x01 Northwind Health Risk Register Calibration** (drafted): methodology, legacy triage, scoring with floor rule, assessment cycle, acceptance expiry sweep with idempotency guard.
- **x02 The Blind Indicator drill** (drafted): staleness guard, five scenarios, consecutive-failure threshold, idempotent issue, tactical and systemic remediation, independent verification. Includes a fallback path for PDIs without GRC indicators.
- *Idea:* "Authority document edition change": load v3 and v4 of the Northwind addendum, map editions, measure control churn.
- *Idea:* "Audit independence test pack": an auditor-role persona tries to edit evidence, swap attachments, and change a finding; produce the access report.
- *Idea:* "Scheduled report leak hunt": find and fix a scheduled distribution rendering admin-visible rows to owners.

## Video and animation opportunities

- **One statement, two obligations** — sn350-03, sn350-06 — hybrid; the chain and generated controls are easiest to grasp on screen. *Drafted: media/video-01.*
- **Show the denominator** — sn350-10 — screencast with persona switching. *Drafted: media/video-02.*
- **Inherent to residual with a floor** — sn350-05 — animation; matrix movement is inherently visual. *Drafted: media/animation-01.*
- **The blind indicator** — sn350-07 — animation of a feed stopping while results stay green, then the guard turning them grey ("unknown"). Not drafted.
- **One issue per problem** — sn350-09 — animation of 21 daily failures collapsing into one issue with appended notes. Not drafted.
- **Attestation campaign pre-check** — sn350-08 — screencast of the flow's exceptions list. Not drafted.

## Assessment ideas

- Statement clinic: 10 policy statements, mark single-assertion and testable, rewrite failures.
- Risk statement sort: bare noun / control gap / certainty / consequence without event / good.
- Issue, exception, or acceptance: 9 scenarios.
- Dashboard critique: screenshot of a GRC dashboard with five defects (no denominator, merged untested, undated, pie with 12 slices, live trend over huge table).

## Changes applied in this pass

- `02-governance-risk-and-compliance-on-the-platform.md`, end: added "Check your understanding".
- `03-the-policy-and-compliance-data-model.md`, end: added "Check your understanding".
- `04-controls-attestations-and-evidence.md`, end: added "Check your understanding".
- `05-the-risk-register-and-risk-assessment.md`, end: added "Check your understanding".
- `06-entities-entity-types-and-cmdb-scoping.md`, end: added "Check your understanding".
- `07-continuous-monitoring-and-indicators.md`, "What a good indicator asserts": fixed the staleness guard (defined `cutoffForLoad`, corrected comparison, placement comment).
- `07-continuous-monitoring-and-indicators.md`, end: added "Check your understanding".
- `08-automating-policy-and-risk-workflows.md`, "Where a business rule is the right answer": added comment that table and field names are illustrative.
- `08-automating-policy-and-risk-workflows.md`, end: added "Check your understanding".
- `09-issues-remediation-and-audit-management.md`, end: added "Check your understanding".
- `10-grc-reporting-and-executive-dashboards.md`, "Exposing the right data to the right readers": added comment that role names and the entity-to-group path are illustrative.
- `10-grc-reporting-and-executive-dashboards.md`, end: added "Check your understanding".

## Open questions for the course owner

- Which IRM plugins should PDI learners activate, and are Policy and Compliance, Risk, and Audit all available on PDIs for the target release?
- Shipped table and field names used in code: policy statement table, `sn_grc_issue` fields (`related_control`, `source_type`), control fields (`compliance_result`, `last_test_date`), indicator result table.
- Shipped IRM role names (lesson 10 sample and lesson 2 role-family description).
- How GRC indicators accept scripted evaluation on the target release (the lesson 7 sample's return-object contract and `current.entity` input are illustrative); x02 offers a Script Include fallback.
- Does control retirement on CI decommission preserve evidence by default on the target release (lesson 6 tells learners to verify)?
- Capstone scenario naming (Meridian Logistics vs Northwind Health; collision with sn330's Meridian).
- Should sn350-11's competency list include D5-S1 and D2-S1 competencies it exercises? Not changed.
