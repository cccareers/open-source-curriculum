---
course_id: sn201
title: "Application Development Fundamentals (ADF) — Enhancement Review"
reviewed_lessons: 9
status: draft
---

## Summary
A well-sequenced build course with a single, consistent running example (the `x_acme_facilities` Facilities Work Orders app) and a capstone (equipment loans) that transfers the same shape to a new problem. The biggest risks are technical: two code samples would fail or misbehave if copied (an invented `work_order_parts_pending()` method; a cost roll-up that string-concatenates GlideElements and double-counts), the ACL evaluation order in lesson 7 is stated in the wrong sequence and its diagram file is missing, and the custom state values (60/70) are never registered as close states, so `active` would stay true on closed work orders. The biggest opportunity is test automation: the course tells learners to test by hand repeatedly but never introduces ATF, which a free PDI supports.

## Clarity issues
| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| sn201-02 | "What the application record actually holds" | Runtime access tracking is described as governing calls *from another scope into yours*. It governs your application's calls *out* to other scopes (cross-scope privileges). Inbound access is the table's Application Access settings (lesson 7) | Correct the direction; point to lesson 7 for inbound | Applied |
| sn201-03 | "Choice fields and state values" | Custom state values (60, 70) on a Task extension are not automatically treated as closed; the inherited `active` flag and task close logic key off the `close_states` / `default_close_state` / `default_work_state` dictionary-override attributes | Add a paragraph on the dictionary override for `state` | Applied |
| sn201-03 | "The facilities data model, assembled" | `requested_by` "default to the current user" with no value shown | Show `javascript:gs.getUserID()` | Applied |
| sn201-04 | "Practice" ex. 2 | Asks learners to create `close_notes`; Task already provides `close_notes` on standard instances, so a duplicate is created or refused | Tell learners to check inherited columns and reuse `close_notes` | Applied |
| sn201-04 | "Views: several forms over one table" | View rule example tests a role, which the condition builder cannot express; it needs the advanced script option | Add one sentence | Applied |
| sn201-05 | "An after rule: touch another record" | `(parent.child_cost_total || 0) + (current.total_cost || 0)` operates on GlideElement objects (always truthy; `+` concatenates strings); incremental add double-counts when the rule re-fires on any later update to a closed child | Recompute the total from closed children with `getValue` + `parseFloat`; condition "State changes to Closed Complete" | Applied |
| sn201-05 | "Aborting a save" | `current.work_order_parts_pending()` is not a GlideRecord method; copying it throws | Replace with a real GlideRecord query (part rows with no unit cost) | Applied |
| sn201-05 | "An onSubmit script" | `new Date(g_form.getValue(...))` parses the user's display format, which is unreliable across date formats | Use `getDateFromFormat(value, g_user_date_time_format)` | Applied |
| sn201-06 | "Building the contractor approval flow" — "The reminder" | States Ask for Approval has built-in reminder/escalation configuration. The action's documented options are approval rules and a due date (with auto-approve/reject/cancel); a reminder email is not a standard option on all releases | Verify on current PDI; if absent, rewrite as a parallel branch with Wait for Duration + Send Email, or the due-date behaviour | Proposed |
| sn201-06 | "Building the contractor approval flow" | Uses **Send Notification**, which needs an existing notification record the course never creates; trigger is Updated only, so a work order *created* with Requires contractor ticked never enters approval | Use Send Email (or add a notification-record step); use Created or Updated trigger | Proposed |
| sn201-06 | "Anatomy of a flow" | "Record triggers also carry a run-as setting" — run-as is a flow property, not a trigger setting | Reword | Proposed |
| sn201-07 | "How the platform decides" | Field-level order stated as table.field → table.* → parent. Documented order is table.field → parent.field → *.field → table.* → parent.* → *.* | Correct the sequence | Applied |
| sn201-07 | "How the platform decides" | Image `./img/acl-evaluation-order.png` does not exist in the repo (no `img/` folder in any course) | Commission the image; animation sn201-a01 storyboards the same content | Proposed |
| sn201-07 | "Writing the facilities rules" | The model has no `read` rule at field level (`work_order.*`) for requesters/technicians; whether fields render depends on inherited/`*.*` rules, which differ by release and by whether App Engine Studio auto-generated ACLs | Add a `read work_order.*` row or a note to check inherited field rules | Proposed |
| sn201-08 | "The update set workflow" step 2 | "the Default set never leaves the instance" is overstated; it can be exported but should never be promoted. Also missing: update sets are scope-specific, and switching the application picker switches the current update set | Soften and add the scope note | Applied |
| sn201-08 | "What an update set actually is" | "Some tables are marked so that their records are captured" — name the mechanism (`update_synch` dictionary attribute) | Name it | Applied |

## Depth and coverage gaps
- **No automated testing anywhere.** Lessons 4–7 each say "test properly" and give manual steps. ATF (Automated Test Framework) runs on a PDI and is exactly how client teams regression-test these artifacts. Maps to: "Build forms, views, and UI policies that present the right fields to the right user", "Add application logic with business rules and client scripts", "Secure an application with roles and access control rules". Covered by project sn201-x01.
- **Reference data and promotion.** Lesson 8 explains that `part` records do not travel but practice only exports them; no exercise uses `update_synch` or a "create if missing" fix script. Maps to: "Move an application between instances using update sets and source control". Covered by project sn201-x02.
- **Close-state semantics** for Task extensions (applied fix above); worth a practice item that proves `active` flips to false on Closed Complete.
- **Cross-scope privileges in practice.** Lesson 2 mentions them; no exercise triggers one (e.g. the lesson 9 capstone reading an ITSM table). Add a practice item to lesson 7 or 8: trigger a cross-scope read, find the `sys_scope_privilege` record.
- **Misconception:** "App Engine Studio and Studio are different apps with different files" is addressed well. But Studio itself is being superseded on newer releases (ServiceNow IDE / App Engine Studio file views); see open questions.
- **Lesson 9 capstone** has excellent requirements but no rubric; add one modeled on the projects drafted here.

## Proposed additional projects
- **sn201-x01 — Prove It with ATF: a regression suite for Facilities Work Orders** (drafted).
- **sn201-x02 — Release 1.1: Parts Catalogue, Seed Data, and a Clean Promotion** (drafted).
- Cross-scope integration mini-project: work order automatically links to an ITSM incident when work type is "IT-related"; learner handles the cross-scope privilege and documents it (not drafted; stretch).
- Technician mobile-friendly view + view rule + ATF check that the view rule selects correctly for each role (not drafted; warm-up).
- Security review exercise: learner receives a deliberately misconfigured ACL set (export XML) and must find three defects via impersonation and debug (not drafted; would need a starter XML).

## Video and animation opportunities
- **Business rule timing: before, after, async, display** — sn201-05 — screencast with live demo of `current.update()` recursion and the `isLoading` bug. **Drafted: media/video-01-business-rules-and-client-scripts-in-action.md**
- **Update set capture and promotion between two PDIs** — sn201-08 — screencast (preview, collision, commit). **Drafted: media/video-02-update-set-promotion.md**
- **How the platform decides: ACL evaluation order** — sn201-07 — explainer animation; replaces the missing `acl-evaluation-order.png`. **Drafted: media/animation-01-acl-evaluation-order.md**
- Scope boundary: runtime access tracking vs application access (two arrows, two directions) — sn201-02/07 — explainer animation (not drafted).
- Flow waiting at an approval and resuming — sn201-06 — animation (sn102-a02 covers the concept at survey depth; reuse).
- Table extension and the close_states dictionary override — sn201-03 — whiteboard (not drafted).

## Assessment ideas
- Code-review quiz: show five short scripts (including the original buggy roll-up and abort examples) and ask learners to spot the defect.
- ACL puzzle set: given the facilities rule table and a user, predict read/write on three fields; check with impersonation.
- Decision-table drill (lesson 5 "Choosing the right tool"): 12 requirements → mechanism, auto-gradable.
- Rubric for the lesson 9 capstone with criteria: data model, interface, logic placement, automation, security, deployment, decision log quality.
- Update set audit: hand learners an exported update set XML with one unintended global change; they must find it.

## Changes applied in this pass
- `02-scoped-applications-and-app-engine-studio.md`, "What the application record actually holds": corrected the direction runtime access tracking governs; pointed to application access for inbound calls.
- `03-designing-the-application-data-model.md`, "Choice fields and state values": added paragraph on registering 60/70 as close states via a dictionary override on `state`.
- `03-designing-the-application-data-model.md`, "The facilities data model, assembled": `requested_by` default shown as `javascript:gs.getUserID()`.
- `04-forms-views-and-ui-policies.md`, "Views: several forms over one table": noted that role-based view rules use the advanced script option.
- `04-forms-views-and-ui-policies.md`, "Practice" ex. 2: reuse inherited `close_notes` instead of creating a duplicate.
- `05-application-logic-business-rules-and-client-scripts.md`, "An after rule: touch another record": replaced the roll-up with an idempotent recompute using `getValue`/`parseFloat`; condition now "State changes to Closed Complete".
- `05-application-logic-business-rules-and-client-scripts.md`, "Aborting a save": replaced invented method with a real GlideRecord query.
- `05-application-logic-business-rules-and-client-scripts.md`, "An onSubmit script: validate before saving": date parsing via `getDateFromFormat` and `g_user_date_time_format`.
- `05-application-logic-business-rules-and-client-scripts.md`: added "Check your understanding".
- `07-securing-the-application-with-roles-and-acls.md`, "How the platform decides": corrected field-level evaluation order.
- `07-securing-the-application-with-roles-and-acls.md`: added "Check your understanding".
- `08-update-sets-source-control-and-deployment.md`, "What an update set actually is": named the `update_synch` attribute.
- `08-update-sets-source-control-and-deployment.md`, "The update set workflow" step 2: softened the Default-set claim; added note that update sets are per application scope.

## Open questions for the course owner
- **Ask for Approval reminders** (lesson 6): verify on the current PDI release whether the action exposes reminder configuration. If not, lesson 6 text and practice 2 need rewriting (proposal above). Not verified.
- **Studio vs ServiceNow IDE / App Engine Studio**: the classic Studio is being phased out on recent releases in favour of App Engine Studio file views and the ServiceNow IDE; source control linking moved with it. Confirm the target release and update lesson 2 and lesson 8 UI paths accordingly. Not verified.
- **Two instances for lesson 8**: the developer program gives one PDI per account. Learners need a partner's PDI or must treat the XML export as the deliverable (lesson 8 already allows this). Confirm the program's current terms before suggesting a second account.
- **Missing images**: `07-...md` references `./img/acl-evaluation-order.png`; no `img/` directory exists for this course (same pattern across the catalogue). Decide whether to commission it from animation sn201-a01.
- **Default field ACLs**: whether fields are readable with the lesson 7 model depends on auto-generated ACLs from App Engine Studio table creation and on platform `*.*` rules. Verify on PDI and add a `read work_order.*` row if needed.
- **`getDateFromFormat`** is available on classic forms; not verified in workspaces/Next Experience forms for scoped client scripts. Flag if the course targets workspaces.
- **Currency `getValue`** returns the amount as a string on standard instances; confirm behaviour with multi-currency settings (roll-up example).
