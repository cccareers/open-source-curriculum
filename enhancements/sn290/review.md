---
course_id: sn290
title: "Service Portal Fundamentals — Enhancement Review"
reviewed_lessons: 7
status: draft
---

## Summary

A strong, opinionated course with excellent worked code and a clear record-model mental model; the Northwind capstone is realistic and well-scoped. The most important fix was a security inaccuracy: lesson 3 said widget server scripts run "with the caller's rights for record access", which is not true of plain `GlideRecord`, and its acknowledge example lacked the write check its own practice step asks learners to prove. The biggest opportunity is more practice with permissions and with remediating someone else's broken widget, which is how most portal work actually arrives.

## Clarity issues

| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| sn290-03 | "The four-part contract" | States the server script "runs with the caller's rights for record access". Plain `GlideRecord` does not enforce ACLs; this misleads learners into publishing data they should not. | Rewrote the sentence: GlideRecord does not apply ACLs; use filters, `GlideRecordSecure`, or `canRead()`. | Applied |
| sn290-03 | "Client-to-server calls" | Acknowledge example updates any record by sys_id without a write check, yet practice step 4 expects the server to refuse an unwritable record. | Added `gr.canWrite()` check and an else-branch message; referenced it in the "validate on the server" rule. | Applied |
| sn290-05 | "Search, and why it is the real navigation" | "Query as the user" did not say how. | Named `GlideRecordSecure` / `canRead()`. | Applied |
| sn290-06 | "Server-side: the queries" | Claims dot-walking resolves a reference "without a second query". Dot-walked reference lookups can still issue queries (cached per record); the claim is not reliably true. | Softened to "without you writing a second query" and told learners to confirm with SQL debugging. | Applied |
| sn290-03 | "The `$sp` server API" | `$sp.log(message)` — I could not verify this method exists on current releases. | Verify; replace with `gs.info`/`gs.debug` if absent. | Proposed |
| sn290-04 | "Navigation people can follow" | Menu item type names ("Knowledge base / catalog category", "Header / divider") may not match the type choices on `sp_instance_menu` items in current releases. | Verify labels against target release. | Proposed |
| sn290-02 | "Pages and the URL" | "Draft" page field described as hiding from the designer's picker; behavior not verified. | Verify. | Proposed |
| sn290-02 to 06 | End of lesson | No self-check after Practice. | Added "Check your understanding" with answers. | Applied |

## Depth and coverage gaps

- **Permission verification as an artifact** (objective: "Surface the Knowledge Base and Service Catalog through the portal with the correct permissions"): lesson 5 describes the matrix well, but the capstone does not assess D6-S1-C04 at all (its competency list is C01 to C03). Project x01 fills this.
- **Remediation practice** (objective: "Diagnose a slow portal page and meet baseline accessibility requirements"): learners only slow down their own widget. Fixing a stranger's widget with measured before/after is more realistic. Project x02 fills this, and also exercises "Build and clone widgets using HTML, CSS, an AngularJS client controller, and a server script".
- **Misconception:** that `ng-show`/CSS hiding is a permission or privacy control. Lesson 3 touches it for screen readers; worth one line in lesson 5 too.
- **Option schema types**: only string/integer shown; a reference or choice option example would deepen lesson 3.
- **Responsive:** no worked example of the "reflow to cards below small" approach for wide tables; x02 asks for it but a lesson snippet would help.
- **Capstone gap:** D6-S1-C05 (performance and accessibility) is exercised by definition-of-done items 10 to 12 but not listed on the project; course owner may want to note that in the brief text (not frontmatter).

## Proposed additional projects

- **x01 Northwind Knowledge and Catalog Permission Audit** (drafted): user criteria, deny-wins, four-user, eight-check impersonation matrix, audit memo, script listing criteria attachments.
- **x02 Rescue the Northwind Shift Board Widget** (drafted): deliberately broken starter widget; fix server, client, accessibility, responsive; before/after evidence table.
- *Idea:* "Second audience, second theme": a minimal-header kiosk portal for clinic waiting rooms sharing Northwind pages with a different theme (lesson 2's "second theme, not conditional logic" rule).
- *Idea:* "Search source build": a "My open requests" search source with typeahead, tested for permission leaks and per-keystroke cost.
- *Idea:* "Shared Angular provider": extract date formatting used by two widgets into a provider.

## Video and animation opportunities

- **The widget data contract** — sn290-03 — screencast; the round trip is invisible without logs and the network panel. *Drafted: media/video-01.*
- **Hiding a link is not a permission** — sn290-05 — hybrid; impersonation and direct-URL probing must be seen. *Drafted: media/video-02.*
- **The column size cascade** — sn290-04, sn290-02 — explainer animation; breakpoint inheritance is dynamic by nature. *Drafted: media/animation-01.*
- **Walking the record stack** — sn290-02 — screencast from a visible box down to its `sp_instance`. Not drafted.
- **The digest cycle and watchers** — sn290-06 — animation of watchers multiplying with ng-repeat and disappearing with one-time binding. Not drafted.
- **Keyboard and screen reader walkthrough** — sn290-06 — screencast with a real screen reader. Not drafted.

## Assessment ideas

- "Where does this belong?" sort: 12 change requests, sort into theme / page / layout / instance / widget.
- Code-reading quiz: given a server script, list every value exposed to the browser.
- Breakpoint puzzle: given a target layout at three widths, fill in the minimum set of size fields.
- Accessibility spot-the-defect on a screenshot plus template.
- Rubric line for the capstone: "permission verified by direct URL as a non-entitled user" (pass/fail).

## Changes applied in this pass

- `02-service-portal-architecture.md`, end: added "Check your understanding".
- `03-widgets-html-css-and-scripts.md`, "The four-part contract": corrected the claim that server scripts apply the caller's record access; added GlideRecordSecure / canRead guidance.
- `03-widgets-html-css-and-scripts.md`, "Client-to-server calls": added `canWrite()` check and refusal message to the acknowledge example; tied it to the validate-on-server rule.
- `03-widgets-html-css-and-scripts.md`, end: added "Check your understanding".
- `04-responsive-layout-and-navigation.md`, end: added "Check your understanding".
- `05-knowledge-base-and-catalog-in-the-portal.md`, "Search, and why it is the real navigation": specified how to query as the user.
- `05-knowledge-base-and-catalog-in-the-portal.md`, end: added "Check your understanding".
- `06-portal-performance-and-accessibility.md`, "Server-side: the queries": softened the "no second query" dot-walk claim and pointed to SQL debugging.
- `06-portal-performance-and-accessibility.md`, end: added "Check your understanding".

## Open questions for the course owner

- Does `$sp.log()` exist on the target release? If not, lesson 3 should drop it.
- Exact type choices on Service Portal menu items (`sp_instance_menu` / `sp_rectangle_menu_item`) in the target release.
- Behavior of the `sp_page` Draft flag.
- Whether the platform caches dot-walked reference lookups well enough that "query inside a loop" and dot-walking are materially different in SQL count (the x02 instructor note tells learners to measure rather than assume).
- Many-to-many table names for knowledge and catalog user criteria in project x01's script (`kb_uc_can_read_mtom`, `kb_uc_cannot_read_mtom`, `sc_cat_item_user_criteria_mtom`) should be confirmed on the PDI release.
- "Session Debug > Debug SQL" menu path in project x02 and lesson 6 should be confirmed on the target release.
- The Bootstrap breakpoint values in lesson 4 assume Bootstrap 3; confirm Service Portal on the target release still uses them.
- Should the capstone (sn290-07) list D6-S1-C04 and D6-S1-C05 in course.json, since its definition of done exercises C05? Not changed here (course.json is out of scope for this pass).
