---
course_id: sn301
title: "Automated Test Framework (ATF) Essentials — Enhancement Review"
reviewed_lessons: 6
status: draft
---

## Summary

A tight, well-voiced course: the lessons are concrete, honest about ATF's limits, and consistently tie testing to the update set / UAT / upgrade cycle. The biggest opportunities are (1) giving learners more failure-reading practice (triage is where implementers actually spend ATF time) and (2) a form-step worked example, since lesson 3's only worked outline is server-side while the project requires form and catalog steps.

## Clarity issues

| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| sn301-02 | "What testing actually protects" | "UAT" used before it is defined anywhere in the course. | Expand on first use. | Applied |
| sn301-03 | "Impersonation, and why almost every test starts with it" | Does not say *whom* to impersonate; learners commonly pick a real colleague's account. | Added guidance to use dedicated test accounts and why. | Applied |
| sn301-03 | "Making your own test data" | Only worked example is server-only; the Field State Validation step is listed but never shown in an outline, yet the project's validation test needs it. | Added a short form-step outline (resolve → resolution notes mandatory) with a note to confirm the instance's UI policy. | Applied |
| sn301-03 | "Before you build" | Names neither the property nor the role. Deliberate, perhaps, but learners on a PDI have no administrator to ask. | Consider naming the property and role (commonly `sn_atf.runner.enabled` and `atf_test_designer`) once verified against the target release. | Proposed |
| sn301-03 | "Assertions" | "Record Validation on a form" — the shipped form-category assertion step is more commonly labelled "Field Values Validation" (form) in the picker; "Record Validation" is a server step on some releases. | Verify labels on the target release and align. | Proposed |
| sn301-04 | "From a test to a suite" | "if a suite is configured to stop on the first failure" implies a suite-level option whose existence/name I could not verify. | Verify; if absent, rephrase to "if you want failures to surface early". | Proposed |
| sn301-04 | "Scheduling a suite" | "Where browser tests run" is vague. Scheduled suites with UI steps need a runner opened specifically to pick up scheduled runs (often called the *Scheduled Client Test Runner*). | Name the scheduled runner once verified. | Proposed |
| sn301-05 | "The upgrade cycle", step 5 | Did not say where skipped records are found or what decisions exist. | Added one sentence: upgrade history; keep yours, take base, or merge. | Applied |
| sn301-02 to 05 | End of lesson | No self-check after the practice block. | Added "Check your understanding" with answers. | Applied |

## Depth and coverage gaps

- **Failure triage** (objective: "Organize tests into suites and run them on a schedule with the client test runner"): lesson 4 names the three causes (real / test / environment) but learners never practise classifying them. Drafted project x01.
- **Test-first workflow and update set verification** (objective: "Fit automated tests into an update set, UAT, and upgrade cycle"): lesson 5 says to confirm ATF records are captured but gives no method. Project x02 supplies a background script over `sys_update_xml`.
- **Catalog steps** (objective: "Build an ATF test with steps, assertions, and test data that cleans up after itself"): no worked catalog-step outline anywhere before the capstone project. x02 includes one.
- **Parameterized tests and Quick Start Tests** are not mentioned. They are optional and release-dependent; a one-paragraph "where to go next" note in lesson 3 would help without adding objectives.
- **Misconception to address:** that rollback covers records created by flows. Lesson 3 hints via "asynchronous work"; the animation storyboard a01 makes it explicit.

## Proposed additional projects

- **x01 Red Morning Triage Drill** (drafted): planted real/test/environment failures, triage note from result records only.
- **x02 Test-First Change in One Update Set** (drafted): red-then-green test for a "New Laptop" short description rule, update set capture verified by script, promotion note.
- *Idea:* "Persona matrix": one requirement, four tests, four personas (requester, ITIL, approver, no role), to drill impersonation.
- *Idea:* "Upgrade rehearsal on a PDI": where the developer portal offers a PDI upgrade, run suite, upgrade, re-run, produce the delta table from video v02. Availability of PDI upgrades varies; verify before assigning.
- *Idea:* "Notification loop hardening": extend lesson 4's event loop with a script action that opens a defect record on failure.

## Video and animation opportunities

- **First test, make it fail on purpose** — sn301-03 — screencast; shows the data-pill reference and the failure message, both hard to convey in text. *Drafted: media/video-01.*
- **The upgrade delta** — sn301-02, sn301-05 — hybrid whiteboard; a before/after table is the clearest way to show why the pre-upgrade run matters. *Drafted: media/video-02.*
- **Step outputs and rollback** — sn301-03 — explainer animation; data passing between steps and rollback are invisible in the UI. *Drafted: media/animation-01.*
- **Client test runner handshake** — sn301-04 — animation of the runner polling for instructions, and what happens when the tab is backgrounded or closed. Not drafted.
- **Schedule → run → event → notification loop** — sn301-04 — explainer animation. Not drafted.

## Assessment ideas

- "Spot the macro": show three test outlines; learners identify which one has no real assertion.
- Classification quiz: ten failure messages / screenshots, classify as real defect, bad test, or bad environment.
- Rubric for the capstone handover note: can a stranger triage a red run from it? (pass/fail with a peer who has not seen the instance).
- Update set audit: given a `sys_update_xml` export listing, identify which ATF records are missing.

## Changes applied in this pass

- `02-why-automated-testing-belongs-in-platform-work.md`, "What testing actually protects": defined UAT on first use.
- `02-why-automated-testing-belongs-in-platform-work.md`, end: added "Check your understanding" (4 questions with answers).
- `03-building-your-first-atf-test.md`, "Impersonation, and why almost every test starts with it": added guidance to impersonate dedicated test accounts.
- `03-building-your-first-atf-test.md`, "Making your own test data": added a form-step worked outline (Field State Validation).
- `03-building-your-first-atf-test.md`, end: added "Check your understanding".
- `04-test-suites-scheduling-and-the-client-test-runner.md`, end: added "Check your understanding".
- `05-testing-through-change-and-upgrade-cycles.md`, "The upgrade cycle": added where skipped records are listed and the resolution choices.
- `05-testing-through-change-and-upgrade-cycles.md`, end: added "Check your understanding".

## Open questions for the course owner

- Exact system property names for enabling ATF execution and scheduled execution, and for permitting execution on production, on the release the course targets. I did not assert them in lessons.
- Whether ATF rollback covers records inserted by business rules triggered synchronously by a test step (I believe yes) and by flows (often no, because flows run asynchronously). Needed before animation a01 is rendered.
- Step picker labels ("Order Catalog Item" vs "Submit Catalog Item"; "Record Validation" vs form "Field Values Validation") differ across releases. Which release should the course and projects pin?
- Does an ATF test suite have a "stop on first failure" setting on the target release (lesson 4)?
- Name and URL of the scheduled client test runner on the target release (lesson 4, project x01 stretch).
- Skipped-record resolution labels ("Retain" / "Revert to base system" / merge) in the upgrade history UI should be confirmed for the target release (lesson 5 edit uses generic wording).
- Result table names in project x01's script (`sys_atf_test_suite_result`) should be confirmed on the PDI release.
- PDI upgrades: whether learners can reliably upgrade a PDI on demand (affects the "Upgrade rehearsal" project idea).
