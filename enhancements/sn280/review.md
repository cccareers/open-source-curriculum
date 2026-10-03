---
course_id: sn280
title: "IT Service Management (ITSM) Implementation — Enhancement Review"
reviewed_lessons: 12
status: draft
---

## Summary
A mature, consultant-voiced course that consistently teaches judgement (configuration over customization, one derivation path, the fast path is the correct path) and grounds every lesson in a worked customer example, ending in a strong Northwind Regional Health capstone. The most serious finding is an internal contradiction: lesson 2 classes password resets as requests, while lesson 7 (body and practice 7) says they belong in an incident-creating record producer. Other issues are smaller: a misleading "data does not travel" list in lesson 5, two code samples that would misbehave (an unguarded inbound body, a numeric comparison on a GlideElement), an unflagged plugin dependency (Major Incident Management) for a practice item, two referenced images that do not exist, and a custom child-propagation rule that would duplicate a shipped one. The supplementary projects give learners a hands-on SLA/incident drill and a problem-to-standard-change loop on a PDI with ATF and script evidence.

## Clarity issues
| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| sn280-07 | "Record producers, and when to use one" + Practice 7 | Says a password reset belongs in an incident record producer; lesson 2 explicitly classes password resets as requests | Use "my email stopped working" as the incident example; state that routine password resets are requests; rewrite practice 7 accordingly | Applied |
| sn280-07 | "Order guides" | Variable mapping described as configured on item entries; the baseline mechanism is the order guide's *Cascade variables* option with matching variable names | Describe cascading | Applied |
| sn280-05 | "Release management on the platform itself" | "Data does not travel" list puts choice lists and catalog variables among data; they are captured by update sets (contradicts sn201-08). Data lookup rows, groups, memberships are the real data | Rewrite the bullet with accurate examples and how to move data deliberately | Applied |
| sn280-09 | "Business rules: the moment of the write" | `problem.state >= 106` compares a GlideElement; `problem.get(current.problem_id)` passes a GlideElement — both work by coercion but contradict sn250's taught practice | `getValue` + `parseInt` | Applied |
| sn280-09 | "Business rules" after-rule example | Builds a child-propagation rule without noting the baseline ships one; two rules double-update children | Add a check-what-runs note | Applied |
| sn280-11 | "Inbound: being called" | `request.body.data` read without guarding a missing body; `body.alert_id` throws a 500 on an empty POST | Guard body | Applied |
| sn280-11 | "Inbound: being called" | Returns objects from `process()` while sn250 uses `response.setBody()`; both forms exist but the inconsistency confuses learners | Pick one style across the pathway (prefer `setBody`) | Proposed |
| sn280-11 | "Inbound: being called" | `contact_type = 'monitoring'`; idempotency query excludes only Closed (7), not Canceled (8) | Verify choice exists / add it; use `state NOT IN 7,8` | Proposed |
| sn280-03 | "Practice" ex. 6 | Major Incident Management is a separate plugin, not guaranteed on a PDI | Flag the dependency and provide a fallback | Applied |
| sn280-02 | "The task table…" | Image `./img/itsm-task-table-inheritance.png` does not exist | Commission (sn102-a01 storyboard can be reused) | Proposed |
| sn280-10 | "Relationships, and the dependency map" | Image `./img/cmdb-service-dependency-map.png` does not exist | Commission | Proposed |
| sn280-05 | "Practice" ex. 7 | "Do items 2 through 6 inside a single named update set" contradicts the lesson's own "one update set per unit of work" | Allow one set per exercise, then batch | Proposed |
| sn280-06 | "Fields: type, and the dictionary" | "Dictionary attributes control … read-only, mandatory" — those are dictionary fields; *attributes* is a separate field of key=value pairs | Reword | Proposed |

## Depth and coverage gaps
- **SLA practice relies on waiting real time.** Lesson 8 practice asks for timing tests, but never mentions shortening durations for testing beyond one exercise, nor how to read the SLA timeline. Objective: "Define SLAs, OLAs, and schedules that measure the commitment the business actually made". Covered by sn280-x01 (minutes-scale test SLA, `task_sla` timeline evidence).
- **No hands-on problem-to-change loop.** Lesson 4 practice touches it, but no exercise carries a problem through a standard change template and a blackout check. Objectives: "Configure problem management and connect it to incident and change records", "Configure change management with change types, approvals, and a change schedule". Covered by sn280-x02.
- **ATF for ITSM is recommended (lessons 5, 9, 12) but no lesson shows Service Catalog ATF steps.** Covered in the project automated checks.
- **Plugin dependencies on a PDI** are never stated in one place: Major Incident Management, Change risk assessment, CAB Workbench, Integration Hub spokes (most require subscriptions), Discovery/MID Server (not practical on PDI), Asset Management features. A one-paragraph "what your PDI has" note in lesson 1 would save learners hours (proposed; see open questions).
- **Misconception to address:** "Resolved = Closed" is handled well; "priority is typed" is handled well. Missing: "an SLA definition change updates running SLAs" (lesson 8 mentions SLA repair briefly; worth a practice item).
- No "Check your understanding" blocks; added to lessons 3 and 8.

## Proposed additional projects
- **sn280-x01 — Northwind P1 Clock: Incident Rules and a Testable SLA** (drafted).
- **sn280-x02 — From VPN Problem to Standard Change** (drafted): problem from an incident cluster, known error and workaround, change created from problem, standard change template, blackout schedule conflict check.
- Monitoring-alert inbound integration with idempotency and an integration health dashboard (not drafted; mirrors lesson 11 practice 2–7).
- Customer Ordering service map + impact-from-criticality (not drafted; depends on CMDB health on the PDI).
- Onboarding order guide with cascading variables and per-item SLAs (not drafted).

## Video and animation opportunities
- **Pinning down "four hours": configuring and testing an SLA** — sn280-08 — screencast. **Drafted: media/video-01-pinning-down-four-hours.md**
- **One click, three records: REQ → RITM → SCTASK** — sn280-07/09 — screencast building the lesson 7 item and lesson 9 flow. **Drafted: media/video-02-one-click-three-records.md**
- **The SLA clock: start, pause, stop, breach** — sn280-08 — explainer animation of business vs actual elapsed time across a weekend with a pause. **Drafted: media/animation-01-the-sla-clock.md**
- Priority matrix as a lookup, not code — sn280-03 — 45-second animation (not drafted).
- Problem ↔ incident ↔ change reference fields lighting up through the VPN example — sn280-04 — animation (not drafted).
- Dependency map read upward for impact, downward for blast radius — sn280-10 — animation (not drafted).

## Assessment ideas
- Classification drill with 20 customer utterances → incident / request / problem / change (fixes the password-reset confusion with explicit items).
- SLA arithmetic quiz: five start times, two schedules, holidays → due time; auto-gradable.
- Upgradeability audit rubric for lesson 6 practice 7.
- Capstone rubric for lesson 12 (configuration, plan, risks, measures), modelled on the project rubrics here.

## Changes applied in this pass
- `03-incident-management-configuration.md`, "Practice" ex. 6: flagged the Major Incident Management plugin dependency and a fallback.
- `03-incident-management-configuration.md`: added "Check your understanding".
- `05-change-and-release-management.md`, "Release management on the platform itself": rewrote the "Data does not travel" bullet with accurate examples.
- `07-service-catalog-and-request-management.md`, "Record producers, and when to use one": replaced the password-reset example; aligned with lesson 2.
- `07-service-catalog-and-request-management.md`, "Order guides": described cascading variables.
- `07-service-catalog-and-request-management.md`, "Practice" ex. 7: reworded to match.
- `08-service-level-agreements.md`: added "Check your understanding".
- `09-automating-itsm-with-flow-designer.md`, "Business rules: the moment of the write": `getValue`/`parseInt` in the before rule; note about the shipped child-propagation rule.
- `11-integrating-itsm-with-external-systems.md`, "Inbound: being called": guarded a missing request body.

## Open questions for the course owner
- **PDI plugin availability**: Major Incident Management, Change Management risk assessment (questionnaire), CAB Workbench, Service Operations Workspace, Integration Hub spokes, Discovery/MID Server. Availability and activation path on the developer portal not verified for the current release.
- **Baseline child-propagation rule name** (lesson 9): we refer to it generically; verify the shipped rule's name and behaviour on the current PDI.
- **Problem state values** (101–107) and whether `problem_state` is still present — lesson 4 already hedges; the code in lesson 9 assumes 106 = Resolved.
- **`contact_type` choices** "integration"/"monitoring" (lessons 11, sn250-08) — verify they exist or add them as part of the exercise.
- **Missing images** in lessons 2 and 10.
- **Password reset policy**: we aligned lesson 7 with lesson 2 (request). If the owner prefers the "interrupted service" framing, lesson 2 needs to change instead; either way they must agree.
- **SLA flow vs workflow**: lesson 8 says "workflow or flow attached"; on current releases the SLA definition has a Flow field defaulting to the shipped SLA flow. Verify naming.
