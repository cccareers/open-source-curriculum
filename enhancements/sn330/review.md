---
course_id: sn330
title: "HR Service Delivery (HRSD) Implementation — Enhancement Review"
reviewed_lessons: 10
status: draft
---

## Summary

A deep, design-led course with excellent judgment about structure, privacy, and where configuration beats code; the Meridian Logistics capstone is a demanding, realistic assembly project. The main gaps are hands-on artifacts for the integration and security objectives (both lessons have rich practice lists but no worked dataset or evidence format), and a handful of field or table names in code samples that should be confirmed against a target release. Learners on a PDI will also need explicit setup guidance for activating HRSD.

## Clarity issues

| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| sn330-07 | "Business rule ordering and recursion" (code) | Sample uses `current.subject_person`, `hr_service.confidential`, profile field `work_region`, and `u_work_region` as if shipped; I could not verify these names, and the course elsewhere says labels vary. | Added a code comment that field names are illustrative and must be checked in the dictionary. | Applied |
| sn330-09 | "Validation and error handling" | `ignore = true` inside a wrapper function looks like it sets a local; learners also assume it rolls back earlier rows. | Clarified that `ignore` is the engine-provided variable and that earlier rows are not rolled back. | Applied |
| sn330-04 | "User criteria: who sees what" | "Empty can-read means everyone" is stated flatly; sn290 lesson 5 tells learners to test this because behavior depends on instance configuration. The courses disagree. | Added a sentence to test it on the instance. | Applied |
| sn330-02 to 09 | End of lesson | No self-check. | Added "Check your understanding" with answers to all eight content lessons. | Applied |
| sn330-02 | "Practice" | Says "a personal development instance with HRSD available" but gives no setup guidance; on a PDI, HRSD plugins must be requested/activated and some COEs or Employee Center components may be unavailable. | Add a short setup note once the course owner confirms which plugins to name. | Proposed |
| sn330-03 | "HR templates" | Template application paths described generically; whether an HR service field directly references a template varies by release. | Verify and name the field. | Proposed |
| sn330-05 | "Forms" | "The HR service's own configured intake" is vague; it likely refers to record producers linked to HR services. | Verify and name the mechanism. | Proposed |

## Depth and coverage gaps

- **Integration practice data** (objective: "Integrate HRSD with an HRIS or payroll system using import sets, transform maps, and error handling"): lesson 9 asks learners to build a 50-row defective file but supplies none. Project x01 supplies a starter file with planted defects, an answer key, and a reconciliation script.
- **Security evidence format** (objective: "Apply access controls and data-privacy practices that keep sensitive HR data restricted"): lesson 8 describes the matrix; x02 supplies the persona list, matrix template, and scripts to prove no direct role grants and ACL descriptions.
- **Capstone competencies:** sn330-10 lists D4-S1-C01 to C03 but its definition of done also exercises C04 (access) and C02. Not changed (course.json out of scope).
- **Misconception:** subject person vs logged-in user vs reader. Covered across lessons 2 to 4 but scattered; video v02 consolidates it.
- **Worked example gap:** no example of an actual flow (trigger, actions, data pills) in lesson 7, only a prose stage description; a screenshot-level walkthrough would help.
- **ATF**: no mention of using ATF for HR regression, although sn301 is a sibling course. A one-line pointer in lesson 7's testing paragraph would connect them.

## Proposed additional projects

- **x01 Meridian Logistics Nightly Worker Feed** (drafted): planted-defect CSV, two-pass transform, translation table, issue table, run-level guards, reconciliation script.
- **x02 Meridian HR Access Matrix and Separation Audit** (drafted): group/role model, five-path separation proof, field ACL, attachment and export checks, 9-persona matrix.
- *Idea:* "Meridian offboarding with time-triggered revocation": involuntary-departure variant as a separate lifecycle event with a restricted access model.
- *Idea:* "Knowledge deflection sprint": seed 20 searches, read the zero-result log, fix three gaps, measure.
- *Idea:* "Payroll handoff contract": design and mock the outbound event with acknowledgement and cutoff handling (REST message to a mock endpoint).

## Video and animation opportunities

- **Activity set table walkthrough** — sn330-06, sn330-10 — whiteboard; the design artifact is the hardest thing to learn from prose. *Drafted: media/video-01.*
- **Who is this case about?** — sn330-02, 03, 04 — hybrid; consolidates the subject/caller/viewer distinction. *Drafted: media/video-02.*
- **The start date moves** — sn330-06 — animation; anchoring and rescheduling are time-based and invisible in forms. *Drafted: media/animation-01.*
- **Two-pass manager import** — sn330-09 — animation of rows arriving in order and references failing then resolving. Not drafted.
- **Structural separation vs conditional ACLs** — sn330-08 — animation of a query reaching a shared table through five paths vs a separate table. Not drafted.
- **Leave of absence flow execution** — sn330-07 — screencast reading flow execution details. Not drafted.

## Assessment ideas

- Classification drill: 15 behaviors, sort into before rule / after rule / flow / scheduled flow.
- COE decision cases: 6 functions, decide COE or category with the confidentiality and record-shape tests.
- Matrix-reading quiz: given a filled access matrix, identify the release-blocking cells.
- Transform script code review: find the three defects in a provided onBefore script (email coalesce, silent default, early return).

## Changes applied in this pass

- `02-hrsd-architecture-and-hr-services.md`, end: added "Check your understanding".
- `03-hr-case-management-configuration.md`, end: added "Check your understanding".
- `04-hr-knowledge-management.md`, "User criteria: who sees what": added instruction to test empty can-read behavior on the instance.
- `04-hr-knowledge-management.md`, end: added "Check your understanding".
- `05-employee-center-and-hr-portal-configuration.md`, end: added "Check your understanding".
- `06-lifecycle-events-onboarding-and-offboarding.md`, end: added "Check your understanding".
- `07-automating-hr-workflows.md`, "Business rule ordering and recursion": added comment in the code sample that field names are illustrative.
- `07-automating-hr-workflows.md`, end: added "Check your understanding".
- `08-data-privacy-security-and-compliance-in-hr.md`, end: added "Check your understanding".
- `09-integrating-hrsd-with-hris-and-payroll.md`, "Validation and error handling": clarified `ignore` semantics.
- `09-integrating-hrsd-with-hris-and-payroll.md`, end: added "Check your understanding".

## Open questions for the course owner

- Which HRSD plugins should PDI learners activate (core, specific COEs, lifecycle events, Employee Center), and are all of them available on PDIs for the target release? This affects every practice section and both projects.
- Shipped field names on the HR case and HR profile tables (subject person / opened for, confidential flag, work region) for the lesson 7 sample.
- Shipped HRSD role names per COE (lesson 8 deliberately does not name them; x02 asks learners to record them).
- Empty can-read knowledge behavior: align sn290-05 and sn330-04 on one statement after verification.
- Whether lifecycle event activity due dates reschedule automatically when the driving date changes on the target release, or require configuration (animation a01 shows designed behavior).
- Supported abort mechanism in an `onStart` transform script on the target release (x01 asks learners to record theirs).
- Import set row state field name (`sys_import_state`) in x01's script.
- Should sn330-10's competency list include D4-S1-C04? Not changed here.
