---
course_id: sn250
title: "Scripting in ServiceNow — Enhancement Review"
reviewed_lessons: 11
status: draft
---

## Summary
The strongest course in the pathway so far: deep, accurate on most APIs, and consistent about judgement (which tool, which timing) rather than syntax alone. Code samples are mostly correct, defensive, and annotated. The main issues are a few code-level defects that a learner would copy (storing `gs.nowDateTime()` into a date/time field, an async example that queries the wrong link field, a practice item that cannot be done because Scripts - Background is admin-only), several release-sensitive claims that need verification, and a lack of learner-runnable test suites: ATF is recommended in lessons 4 and 6 but only one exercise builds a test. The supplementary projects ship ATF suites and PASS/FAIL background verifiers.

## Clarity issues
| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| sn250-03 | "GlideSystem" | `gs.nowDateTime()` listed without noting it returns a display-formatted string and is unavailable in scoped apps (the course works in scoped apps) | Annotate the line | Applied |
| sn250-03 | "Practice" ex. 10 | Asks learners to impersonate a non-itil user and run a background script; Scripts - Background requires admin | Use an ATF Impersonate + Run Server Side Script test | Applied |
| sn250-04 | "async" example | Async rule on `incident_task` reads `parent`, while the after example uses the `incident` field to link tasks to incidents; inconsistent and likely returns nothing | Use `incident` consistently, with comment | Applied |
| sn250-04 | "Worked example: one requirement, three wrong homes" | `current.setValue('u_assigned_at', gs.nowDateTime())` stores a user-time-zone display string in a date/time field (wrong format; not available in scoped apps) | `new GlideDateTime().getValue()` plus explanation | Applied |
| sn250-04 | "current and previous" | "on an insert its fields are empty" — verify; on many releases `previous` is null on insert, so `previous.field` throws | Verify and state precisely | Proposed |
| sn250-07 | "Subflows" | `catch (e) { ... e.getMessage() }` — `getMessage()` exists on Java exceptions but not on JavaScript `Error` objects; a JS error inside the try makes the catch itself throw | Use `(e.message || e)` | Proposed |
| sn250-07 | "Worked example: a laptop replacement request" step 2 | "the approval action's own reminder/duration settings" — reminder support on Ask for Approval varies by release (same issue flagged in sn201-06) | Verify; prefer the parallel Wait for Duration + notification path | Proposed |
| sn250-08 | "Building a Scripted REST API" write resource | `contact_type = 'integration'` is not an out-of-box choice on incident on standard instances; it saves as an orphan value | Add the choice, or use an existing value | Proposed |
| sn250-08 | "Credentials" | `new sn_ws.RESTMessageV2('x_acme.Inventory Service', 'getAsset')` — whether a scoped REST Message is referenced with the scope prefix in the name should be verified; *Preview Script Usage* generates the exact string | Add "copy the name from Preview Script Usage" | Proposed |
| sn250-10 | "The tools" | Script Debugger described without its key limit (only pauses synchronous scripts in your own session) | Add the limit and fallback | Applied |

## Depth and coverage gaps
- **Test automation is recommended but not practised** beyond lesson 6 ex. 8. Objectives: "Package reusable server logic in a script include and call it from other scripts", "Choose the correct business rule type and timing for a server-side requirement". Covered by sn250-x01 (ATF suite).
- **Inbound API testing beyond REST API Explorer**: ATF has REST test steps for inbound APIs; no lesson uses them. Objective: "Expose a Scripted REST API and call an external REST or SOAP service from the platform". Covered by sn250-x02.
- **Retry design** in lesson 8 is described ("queue the retry for later") but never built. sn250-x02 milestone 6 builds a bounded retry with a scheduled job — Objective: "Schedule recurring work and trigger script logic from platform events".
- **ES2021 mode**: lesson 2 says scoped apps "can opt into a modern engine". The setting's location and default (application record "JavaScript Mode") and whether new scoped apps default to it should be stated. See open questions.
- **GlideQuery** is not mentioned at all; newer code bases use it. Worth a sidebar in lesson 3 (proposed only; not an objective change).
- **Lesson 11 project** has a strong definition of done but no rubric and no automated checks; sn250-x01/x02 rubrics can be adapted.
- Lessons 4 and 6 had no short self-check; added.

## Proposed additional projects
- **sn250-x01 — Acme Routing, Under Test** (drafted): refactor duplicated routing into a script include, expose a client-callable summary via GlideAjax, and ship an ATF suite plus a background PASS/FAIL verifier.
- **sn250-x02 — Warranty Enrichment, Both Directions** (drafted): outbound REST via a REST Message record to a public echo service, an async rule and event with two listeners, a bounded retry job, and an inbound Scripted REST resource tested with ATF REST steps.
- Performance kata: given a seeded table of 5,000 rows and three slow scripts, cut query counts by 10x and document SQL debug evidence (not drafted; needs a seed script).
- Legacy workflow reading exercise converted into a flow with a subflow, with run-history evidence (not drafted).
- Query business rule for confidential incidents with an ATF test per role (not drafted; stretch).

## Video and animation opportunities
- **GlideAjax round trip, done right** — sn250-05/06 — screencast with network panel. **Drafted: media/video-01-glideajax-round-trip.md**
- **From 412 queries to 7: debugging and tuning a slow script** — sn250-10 — screencast with SQL debug. **Drafted: media/video-02-from-412-queries-to-7.md**
- **What happens when you click Save** — sn250-04/09 — timeline animation of client scripts → before rules → DB write → after rules → async queue → event queue → script actions/notifications. **Drafted: media/animation-01-what-happens-when-you-click-save.md**
- Strings vs GlideElements vs numbers ("'2' + 1") — sn250-02/03 — short explainer animation (not drafted).
- Event fan-out: one announcement, many listeners — sn250-09 — animation (partly covered in a01).
- REST status-code contract — sn250-08 — whiteboard (not drafted).

## Assessment ideas
- "Spot the bug" bank: 15 short scripts each with one platform-specific defect (GlideElement truthiness, unchecked `get()`, `current.update()` in before, missing `isLoading`, sync `getReference`, `CONTAINS` on large table).
- Timing decision quiz (lesson 4 decision list) with 12 scenarios, auto-gradable.
- Code-reading rubric for lesson 11 design note: artefact table completeness, rejected alternatives, testing evidence.
- Performance evidence check: learners submit SQL debug statement counts before/after.

## Changes applied in this pass
- `03-server-side-scripting-with-gliderecord.md`, "GlideSystem": annotated `gs.nowDateTime()` as display-format and global-only.
- `03-server-side-scripting-with-gliderecord.md`, "Practice" ex. 10: replaced impossible impersonated background script with an ATF Impersonate + Run Server Side Script approach.
- `04-business-rules-and-execution-order.md`, "async": async example now queries `incident_task.incident`, consistent with the after example.
- `04-business-rules-and-execution-order.md`, "Worked example": stamp uses `new GlideDateTime().getValue()` with an explanation.
- `04-business-rules-and-execution-order.md`: added "Check your understanding".
- `06-script-includes-and-reusable-server-logic.md`: added "Check your understanding".
- `10-debugging-logging-and-script-performance.md`, "The tools": added Script Debugger limits and fallback.

## Open questions for the course owner
- **`gs.nowDateTime()` in scoped apps**: documented as unavailable in scoped GlideSystem on the releases we know; verify on the current PDI release.
- **`previous` on insert** (lesson 4): null vs empty-fields behaviour should be verified and stated.
- **ES2021 / "ECMAScript 2021 (ES12)" JavaScript mode**: confirm where it is set (application record) and whether new scoped apps default to it on the current release.
- **Ask for Approval reminders** (lesson 7): same question as sn201; verify.
- **Scoped REST Message naming** in `new sn_ws.RESTMessageV2(name, method)`: verify the exact name string for a scoped message.
- **Public echo endpoint**: project sn250-x02 suggests `https://postman-echo.com/get`; availability and terms of any third-party echo service can change. PDIs allow outbound HTTPS to the internet by default as far as we know; not verified for every region.
- **ATF REST steps** ("Create a REST Request", "Assert Status Code", "Assert JSON Response Payload Element") — names vary by release; verify.
- **Naming**: projects reuse the `x_acme` / Acme naming used throughout the lessons.
