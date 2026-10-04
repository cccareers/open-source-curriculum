---
course_id: sn102
title: "Introduction to ServiceNow Platform — Enhancement Review"
reviewed_lessons: 9
status: draft
---

## Summary
A strong, well-voiced survey course: every lesson has a clear mental model, a worked example, and practice. The biggest opportunities are (1) a handful of technical statements that are inaccurate or describe only the classic UI (task-table storage, group "transitivity", where the security debugger lives, the "four" system fields), and (2) the course has only one hands-on project, so learners rarely build the things they read about (a task-extended table, an ACL, a small flow). Two supplementary projects close that gap without adding objectives.

## Clarity issues
| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| sn102-02 | "The layers of the platform" | "Next Experience workspace-style interface" conflates Next Experience (the UI framework / unified navigation) with workspaces | Distinguish Next Experience unified navigation from workspaces | Applied |
| sn102-02 | "The core data model" | `task` "Never used directly" is an overstatement — a bare task record can exist | Soften to "almost never used directly" | Applied |
| sn102-03 | "Getting your bearings" | Navigator described only as a left-hand panel (UI16). Instances on Next Experience (default on new PDIs) show the All / Favorites / History menus in the top header | Add a sentence covering both layouts | Applied |
| sn102-03 | "Worked example: from question to answer in four clicks" step 3 | "Right-click the Priority column header and choose Group By if you want the breakdown by another dimension" — grouping by Priority does not give another dimension | Right-click the header of the column you want to break down by (e.g. Category) | Applied |
| sn102-04 | "Tables, records, fields" | Says "Four fields" then lists five | Change to "Five fields" | Applied |
| sn102-04 | "Table extension" | States each extended table is stored in its own physical table and joined to the parent. For the task hierarchy the platform by default flattens parent and children into one physical table (table-per-hierarchy); storage strategy varies (e.g. CMDB uses partitions) | Rewrite the sentence so it is storage-agnostic and keeps the true point (querying the parent returns every child, each knowing its class via `sys_class_name`) | Applied |
| sn102-05 | "Users, groups, roles" | "Groups can contain groups, and the membership is transitive" — on the platform a child group inherits the parent group's *roles*; membership for assignment is not transitive | Correct the sentence | Applied |
| sn102-05 | "Access control rules" | Evaluation rules omit that when several ACLs match at the same (most specific) level, passing any one of them is enough | Add a fifth evaluation point | Applied |
| sn102-05 | "Access control rules" | Security debug described as "switched on from the impersonation or settings area" — it is a module (System Security > Debugging > Debug Security Rules, or System Diagnostics > Session Debug) | Name the module; tell learners to switch it on as admin before impersonating | Applied |
| sn102-05 | "Worked example: designing access for a small team" | `write` on `u_vendor_escalation.*` alone contradicts rule 4 (record-level rule must also pass); "confirm the list is empty" — without a query business rule the list shows a "rows removed by security constraints" message, not an empty list | Add the record-level write rule; correct the expected test result | Applied |
| sn102-07 | "HR Service Delivery" | "Two things make HRSD structurally distinct" then "The third piece to recognize" | "A third piece" wording | Applied |
| sn102-08 | "Practice" ex. 3 | "send a notification to yourself" — the Flow Designer *Send Notification* action needs an existing notification record; *Send Email* is the beginner-friendly action. Trigger can re-fire on every later update | Use Send Email; set condition so it fires on the change to Critical only | Applied |
| sn102-09 | "Hints" | "The security debugger is switched on from the same menu you impersonate from" — incorrect | Point to the Debug Security Rules module | Applied |
| sn102-04 | "Field types worth knowing" | "List" and "Glide List / Watch list" rows overlap (a watch list *is* a List field pointing at `sys_user`) | Merge rows or relabel second row "Watch list (a List field on sys_user)" | Proposed |

## Depth and coverage gaps
- **No build of a task-extended table anywhere in the course** (objective: "Explain how tables, records, fields, and table extension organize data on the platform"). The Vendor Escalation table is read in lesson 4 and secured in lesson 5 but never built. Project sn102-x01 covers it.
- **ACLs are only read, never created** (objective: "Explain how users, groups, roles, and access controls determine who can see and change a record"). Learners do not meet `security_admin` elevation, which is the first thing that stops them in sn201. Covered in sn102-x01; also worth one sentence in lesson 5 (proposed).
- **Misconception not addressed: "the portal has its own data"** is named in lesson 2 but never practised. A practice item could open the same incident in the portal, UI16, and Service Operations Workspace (if available) and compare.
- **ITSM tour has no hands-on creation** (objective: "Identify the core ITSM processes and the records each one creates"). Learners observe demo data only; the Tuesday worked example is ideal to reproduce. Covered in sn102-x02.
- **Workflow automation**: no comparison of a flow's execution log to a business rule's (invisible) effect (objective: "Explain how workflow automation moves work through the platform without manual handoffs"). Covered in sn102-x02 milestone 4 and the animation a02.
- **CSM/HRSD/GRC observation** depends on plugins absent from a default PDI; lesson 7 says so, but gives no path to activate them. See open questions.
- No "Check your understanding" blocks; lessons end with long practice lists. Short self-checks added to lessons 4 and 5 (highest misconception density).

## Proposed additional projects
- **sn102-x01 — Vendor Escalation: Build It, Read It, Lock It** (drafted). Build the lesson-4 table extending `task`, read it through the dictionary, apply the lesson-5 access design, prove it by impersonation and a background-script check.
- **sn102-x02 — One Tuesday, Four Records, One Flow** (drafted). Reproduce the lesson-6 certificate outage in a PDI (INC, PRB, CHG, REQ/RITM/SCTASK), link them correctly, then automate the lesson-8 critical-incident notification flow and read its execution log.
- Portal vs workspace vs classic: one record, three interfaces (not drafted; warm-up, 1 h).
- "Explain-a-table" teach-back: learner picks an unfamiliar shipped table and records a 3-minute walkthrough using the lesson-4 five-step sequence (not drafted).
- GRC paper exercise extended: map three real workplace rules to risk/control/test/issue (not drafted; no instance needed).

## Video and animation opportunities
- **Four clicks to an answer: lists, filters, dot-walking** — sn102-03/04 — screencast; motion shows how the breadcrumb changes as conditions are added. **Drafted: media/video-01-lists-filters-and-dot-walking.md**
- **Who can see this record?** — sn102-05 — screencast of groups, roles, impersonation, and the security debugger. **Drafted: media/video-02-who-can-see-this-record.md**
- **One table, many kinds of work (task extension)** — sn102-02/04 — explainer animation; inheritance and querying the parent are invisible in the UI. **Drafted: media/animation-01-task-extension.md**
- **The flow that waits** — sn102-08 — explainer animation of the licence request pausing at approvals versus a business rule firing instantly. **Drafted: media/animation-02-the-flow-that-waits.md**
- Four layers of the platform with a single incident traveling through them — sn102-02 — whiteboard (not drafted).
- REQ / RITM / SCTASK fan-out — sn102-06 — explainer animation (not drafted; coordinate with sn280, which has the same need).
- Same platform, different customer (ITSM/CSM/HRSD/GRC audience model) — sn102-07 — talking head with table graphic (not drafted).

## Assessment ideas
- 10-item scenario sort: "which record type?" (extends lesson 6 practice 2) with distractors that look like incidents but are requests.
- ACL evaluation puzzles: given three ACL records and a user, state whether read/write is granted and which rule decided it.
- Dictionary scavenger hunt with auto-checkable answers (stored value of incident state "On Hold", reference target of `caller_id`, etc.).
- Rubric for the lesson-9 project already exists implicitly in "Definition of done"; convert to a Developing/Meets/Exceeds rubric.
- Tool-selection drill (lesson 8 ex. 5) as a scored multiple-choice bank.

## Changes applied in this pass
- `02-platform-architecture-and-core-components.md`, "The layers of the platform": distinguished Next Experience unified navigation from workspaces.
- `02-platform-architecture-and-core-components.md`, "The core data model": "Never used directly" → "Almost never used directly".
- `03-navigating-and-configuring-the-instance.md`, "Getting your bearings": added how the navigator appears in Next Experience (top header menus) vs. classic UI (left panel).
- `03-navigating-and-configuring-the-instance.md`, "Worked example: from question to answer in four clicks": corrected the Group By instruction.
- `04-tables-records-and-the-data-model.md`, "Tables, records, fields": "Four fields" → "Five fields".
- `04-tables-records-and-the-data-model.md`, "Table extension": replaced inaccurate physical-storage sentence with a storage-agnostic, accurate one mentioning `sys_class_name`.
- `04-tables-records-and-the-data-model.md`: added "Check your understanding" block.
- `05-users-roles-and-access-control.md`, "Users, groups, roles": corrected group nesting (roles inherit to child groups; membership is not transitive).
- `05-users-roles-and-access-control.md`, "Access control rules": added evaluation point 5 (any one matching rule at the deciding level is enough); named the Debug Security Rules module and when to switch it on.
- `05-users-roles-and-access-control.md`, "Worked example": added the record-level write rule; corrected expected list behaviour for a user with no access; added note on `security_admin` elevation.
- `05-users-roles-and-access-control.md`: added "Check your understanding" block.
- `07-a-tour-of-csm-hrsd-and-grc.md`, "HR Service Delivery": fixed "two things / third piece" inconsistency.
- `08-workflow-automation-on-the-platform.md`, "Practice" ex. 3: Send Email action instead of Send Notification; trigger condition fires only on the change to Critical.
- `09-project-configure-a-developer-instance.md`, "Hints": corrected where the security debugger is switched on.

## Open questions for the course owner
- **Navigation naming by release.** Flow Designer is reached through Workflow Studio on recent releases (Washington DC and later); the course deliberately avoids release names. Confirm whether lesson 8 should mention "Workflow Studio" as an alternate entry point. Not verified per release.
- **Debug Security Rules location.** Module paths used here (System Security > Debugging > Debug Security Rules; System Diagnostics > Session Debug) are long-standing but were not verified on the current PDI release. Newer releases also include an Access Analyzer tool; confirm whether to reference it.
- **Session debug during impersonation.** We instruct learners to enable security debugging as admin *before* impersonating, because a no-role user cannot reach the module. Confirm on the current PDI release that the debug output persists through impersonation.
- **Plugins on PDI for lesson 7.** CSM, HRSD, and GRC/IRM are not active on a default PDI. The developer portal has historically offered plugin activation (e.g. "Activate Plugin" from the instance action menu on developer.servicenow.com) but availability of each, especially GRC/IRM, was not verified. Decide whether to add activation instructions or keep lesson 7 observation-optional.
- **Table names in lesson 2 practice 2** (`sn_hr_core_case`, `sn_customerservice_case`) exist only when those plugins are installed. Fine for a paper exercise; flag if learners are told to find them.
- **Course description says "HRIS"**; sequencing rationale already reads it as HRSD. No change made.
- **Custom table limits on PDI.** Creating a `u_` table in global scope is allowed on a PDI; confirm the program's custom-table guidance has not changed (subscription table counting applies to customer instances, not PDIs).
