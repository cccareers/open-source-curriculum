---
course_id: cyb150
title: "Security Compliance & Risk Management — Enhancement Review"
reviewed_lessons: 9
status: draft
---

## Summary
cyb150 is the most professionally grounded course in the pathway. Meridian Health Analytics carries the teaching lessons and Cedar Hollow Community Health carries the three linked projects. The legal boundary ("route, don't rule") is drawn consistently, and the evidence lesson is unusually honest about fabrication. Framework details I spot-checked (CSF 2.0 functions and subcategories, the 800-53 r5 families, ISO 27001:2022 Annex A theme counts, HIPAA section structure, SOC 2 Type I and II) are accurate. The main issues are one internal contradiction in the sample posture report and some time-sensitive regulatory items that need an owner decision. The biggest opportunity is checkable practice: the course has no machine-verifiable artifacts. This pass adds a register checker and a population/exception exercise with planted traps.

## Clarity issues
| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| cyb150-06 | "A real-shaped posture report", section 2 | The patch metric (11 days against a 7-day commitment in 14 customer agreements) is marked AMBER, but the report's own RAG definitions make any unmet customer commitment RED. In a lesson about honest colours, this teaches the opposite. | Changed the status to RED and explained why in the commentary. | Applied |
| cyb150-02 | "The HIPAA Security Rule" | Required versus addressable is taught as settled. HHS published a Security Rule NPRM (proposed rule, early 2025) that would remove most of the addressable distinction and make encryption and MFA largely required. Its final status was not verified in this pass. | Proposed: add a dated note once the owner confirms the rule's status. | Proposed |
| cyb150-05 / cyb100 | Names | "Kestrel Assurance" (cyb150 auditor) and "Kestrel Property Management" (cyb100 client) are in the same pathway. Minor, but learners may conflate them. | Proposed: rename one of them. | Proposed |
| cyb150-02 / cyb140 | Names | "Meridian Health Analytics" (cyb150) and "Meridian Freight Systems" (cyb140) are unrelated companies sharing a name. | Proposed: rename one, or acknowledge the coincidence. | Proposed |
| cyb150-03 | "Scoring, and the honest limits of the matrix" | Strong. Band thresholds skip impossible products (11, 13–15, 17–19), which a learner may query. | Proposed: add one sentence noting that those products can't occur on a 5×5. | Proposed |

## Depth and coverage gaps
- **No machine-checkable register practice** (objective: *Rate a risk by likelihood and impact and defend its priority against the rest of the register*). Project x01 adds a checker for scenario form, arithmetic and banding, inherent versus residual, the five-part acceptance, category minimums, and legal-conclusion phrasing.
- **Population completeness is described but never experienced** (objective: *Collect the evidence an auditor needs to confirm that a control operates as written*). Project x02 plants an incomplete colleague list whose missing record is the never-disabled leaver, plus a holiday that changes one deadline.
- **The holiday and business-day calendar is never mentioned.** Policies say "one business day", so the calendar is part of the evidence. Covered in x02.
- **Mapping practice relies on recall.** Video v01 models looking identifiers up and marking them `unverified` (objective: *Map a stated security requirement to the right control in NIST, ISO 27001, HIPAA, or SOC 2*).
- **"Check your understanding" blocks were missing.** Added to lessons 02–06.
- The **policy objective** (*Draft a security policy that is specific, enforceable, and traceable to a control requirement*) is well served by project 08. A future pass could add a statement-linting exercise that flags "should" in policy bodies, product names, multiple obligations per statement, and missing numbers.

## Proposed additional projects
- **x01: Cedar Hollow Register, Machine-Checked** (drafted, `projects/01-cedar-hollow-register-checked.md`). Supplements project 07. The checker was tested against a valid sample and a mis-banded sample.
- **x02: Meridian PBC-005/006, a Complete Population and an Honest Exception** (drafted, `projects/02-meridian-termination-population.md`). Synthetic HR and IdP data with deliberate traps. The checker was tested against the correct answer and against the colleague's incomplete list.
- Policy statement linter: a script that flags weak obligation words, product names, compound obligations, and statements with no number. Not drafted.
- Vendor SOC 2 exception-reading drill: a redacted sample report section with three exceptions, to be summarized into a vendor register entry. Not drafted.
- Audit hallway role-play: the three "awkward messages" from lesson 05 Exercise 5, played live with an observer rubric. Not drafted.

## Video and animation opportunities
- **One control, five frameworks** (cyb150-02): parse, state, crosswalk, verify, shown as a screencast. **Drafted: `media/video-01-one-control-five-frameworks.md`.**
- **Write the bottom line, keep the red** (cyb150-06): metric conversion, RAG discipline, and decision requests, as a talking head. **Drafted: `media/video-02-bottom-line-and-red.md`.**
- **Point versus period** (cyb150-05): why a screenshot can't cover a Type II period, and population before sample. Explainer animation. **Drafted: `media/animation-01-point-versus-period.md`.**
- **Ordinal matrix limits** (cyb150-03): 3×4 versus 4×3, and the hidden 1×5 tail. A short animation. Not drafted.

## Assessment ideas
- Instrument-type sort: 10 obligations, each classified as law, certifiable standard, voluntary framework, control catalog, attestation criteria, or contract.
- Status-definition drill for project 09: 8 evidence vignettes, each assigned MET / PARTIALLY MET (naming the deficiency) / NOT MET / N/A.
- Policy-statement rewrite items, auto-checked for obligation words and the presence of a number.
- RAG quiz using the lesson 06 definitions, including the contract-commitment edge case that this pass fixed.

## Changes applied in this pass
- `lessons/06-reporting-security-posture.md`, "A real-shaped posture report": patch metric AMBER changed to RED to match the report's own definitions.
- `lessons/06-reporting-security-posture.md`, commentary ("The patching metric is tied to a contract"): explained why the metric is red.
- `lessons/06-reporting-security-posture.md`, end: added "Check your understanding".
- `lessons/02-regulatory-frameworks-and-control-catalogs.md`, end: added "Check your understanding".
- `lessons/03-risk-assessment-methods.md`, end: added "Check your understanding".
- `lessons/04-security-policy-development.md`, end: added "Check your understanding".
- `lessons/05-audit-evidence-and-control-testing.md`, end: added "Check your understanding".

## Open questions for the course owner
- **HIPAA Security Rule NPRM.** What is its current status, and should lesson 02 note that the addressable distinction may change? (Not verified in this pass.)
- **Holiday calendar in x02.** The listed 2026 US federal holidays (1 Jan, 19 Jan, 16 Feb, 25 May, 19 Jun) should be confirmed against the OPM calendar before publishing.
- **Name collisions** across courses (Kestrel, Meridian). Rename?
- **SOC 2 criteria identifiers.** Lesson identifiers (CC6.1–CC6.7, CC7.x, CC8.1, CC9.2) match the 2017 TSC as revised in 2022, to the best of my knowledge. Confirm against the current AICPA publication before release.
- **Posture report decision cost.** Video v02 leaves "$X" for the instructor to fill in, because the course gives no ISO programme cost.
