---
course_id: sn102
media_id: sn102-v01
type: video-script
title: "Four Clicks to an Answer: Lists, Filters, and Dot-Walking"
format: screencast
target_runtime: "7 min"
related_lessons:
  - sn102-03
  - sn102-04
objectives:
  - Navigate an instance and configure the system settings, lists, and preferences an implementer uses daily
  - Explain how tables, records, fields, and table extension organize data on the platform
competency_ids:
  - D1-S1-C01
  - D1-S1-C02
---

## Purpose
After watching, the learner can answer a stakeholder's "how many…?" question with a filtered, personalized, dot-walked list and an export — no report builder, no script.

## Audience and prerequisites
Apprentices in week 1–2 of the pathway. They have signed in to a PDI with demo data and read lesson 3. No prior list-filtering experience assumed.

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Cold open: a chat message on screen: "How many active critical incidents does the Network team have? Can I get it as a spreadsheet?" | "Here's a message you'll get in your first month. You could open the report builder. You could ask a developer. Or you could answer it in four clicks from a list. Let's do that." |
| 0:15 | PDI home. Cursor moves to the navigator filter (top-left "All" menu on Next Experience; left panel on classic UI). Types `incident.list`, presses Enter. | "Start in the navigator filter. Type the table name, dot list, and press Enter. That's the incident table, shown as rows. On Next Experience the filter lives under the All menu at the top; on the classic interface it's at the top of the left panel. Same box, same shortcut." |
| 0:35 | Zoom on breadcrumb, which shows a leftover filter, e.g. `All > Active = true`. Cursor clicks **All**. Row count in footer changes. | "Look just under the title. That's the breadcrumb, and it's telling you a filter is already on — maybe from the last time you were here. The breadcrumb isn't a label; it's a control. Click All, and you're looking at every incident. Watch the count at the bottom change." |
| 0:55 | Click funnel icon. Condition builder opens. Add `Active` `is` `true`. | "Now the funnel icon opens the condition builder. Field, operator, value. Active, is, true." |
| 1:10 | Click **AND**. Add `Priority` `is` `1 - Critical`. Add AND: `Assignment group` `is` `Network`. Click **Run**. | "AND adds another row. Priority is one, Critical. One more: Assignment group is Network. Run it. The breadcrumb now reads back all three conditions, left to right, and the footer gives you the number. That's the first answer." |
| 1:35 | Highlight the footer count; then the breadcrumb, hover each segment. | "Hover any segment of the breadcrumb. Click one and everything to its right is stripped off. That's how you'd quickly ask 'and how many critical incidents across *all* groups?'" |
| 1:55 | Right-click a column header > **Configure > List Layout**. Slushbucket appears. Add **Opened**, **Assigned to**; move **Short description** to position 2. Save. | "The requester will want more than numbers. Right-click any column header, Configure, List Layout. This is called a slushbucket: available on the left, selected on the right. Add Opened and Assigned to. Use the arrows to put Short description second — the first column people read after the number. Save." |
| 2:30 | Callout box: "Configure = changes it for everyone using this view. The gear icon = changes it for you only." Cursor points to the list gear icon. | "One caution. Configure List Layout changes the layout for everyone who uses this list view. If you only want it for yourself, use the gear icon at the top left of the list instead. On a client instance, that difference matters a lot." |
| 2:50 | New question appears on screen: "…and only for callers in the Finance department." | "Now the follow-up question. 'Only where the caller is in Finance.' Incident doesn't have a department field. But it has a Caller field — and Caller points at a user, and a user has a department." |
| 3:05 | Open condition builder. Click field picker, choose **Caller**, then click the expand arrow / "Show related fields" to reveal **Caller > Department**. Choose `Department` `is` `Finance`. Run. | "In the field picker, find Caller. Next to it is an expand arrow — on some versions it's a 'Show related fields' option. Click it and you're now choosing from the *user's* fields. Department, is, Finance. Run. You just walked from the incident, through the reference, into the user record. That's dot-walking." |
| 3:35 | Breadcrumb shows `Caller.Department = Finance`. Freeze-frame, annotate the dot. | "Look at the breadcrumb: Caller dot Department. The dot is the walk. Every reference field is a doorway into another table, and you'll see this same notation later in scripts." |
| 3:55 | Split screen: left the incident list; right `sys_dictionary.list` filtered `Table is incident`, `Column name is caller_id`, showing Type = Reference, Reference = sys_user. | "Why does this work? Open the dictionary — sys_dictionary dot list — and look at caller underscore id. Type: Reference. Reference table: sys_user. The incident row doesn't store a name; it stores the user's sys_id. The platform follows that pointer for you." |
| 4:25 | Back on incident list. Configure > List Layout. In the available list, expand **Caller** (click the "+" / dot-walk item) and add **Caller.Location**. Save. | "You can dot-walk in columns too. In the list layout, expand Caller and add Caller's Location. Now the location sits right next to each incident — with no data copied onto the incident record." |
| 4:50 | Right-click column header **Category** > **Group By Category**. Groups collapse/expand. | "Want a breakdown? Right-click the column you want to break down by — here, Category — and choose Group By. Now you see counts per category inside your filter." |
| 5:10 | Remove grouping. Click list title context menu (hamburger next to "Incidents") > **Export > CSV**. Download appears. Open the CSV in a spreadsheet, show matching columns. | "Remove the grouping, then open the list title menu and Export, CSV. Open the file. Same rows, same columns, including the dot-walked location. The export honors exactly what's on screen." |
| 5:35 | List title menu > **Save Filter**. Name "Critical Network incidents - Finance callers". Visibility: Me / Group / Everyone. | "Last click — and the one that saves you next week. Save the filter. Give it a name a colleague would understand. Choose who can see it: just you, a group, or everyone." |
| 5:55 | Clear filter (click All). Open the filter menu, re-apply saved filter. | "Clear it, then reapply from your saved filters. Next time this question arrives, it's one click." |
| 6:10 | Recap card with four icons: navigator shortcut, condition builder, list layout, export/save. | "Recap. Table dot list to get there. The condition builder to ask the question, dot-walking when the answer lives on a related record. List layout to show what matters. Export and save so you never build it twice." |
| 6:35 | End card: "Try it: incidents whose caller's department manager is a specific person. That's two walks." | "Your turn: build a filter two references deep — incidents whose caller's department has a specific manager. Then add that manager as a column. See you in the next one." |

## On-screen assets and B-roll
- PDI with demo data, Next Experience UI; one 10-second insert of the same steps on classic UI (UI16) for the navigator location.
- Callout overlays: "Configure vs gear (personal)", "The dot is the walk".
- Dictionary record for `incident.caller_id` (screenshot).
- Exported CSV opened in a spreadsheet application.
- Note for producer: demo group "Network" and department "Finance" exist in standard demo data but names can vary — check before recording and adjust narration.

## Accessibility
- Full captions; all table and field names spoken aloud as well as shown (e.g., "sys underscore dictionary dot list").
- Every click target is described in narration, not just highlighted ("the funnel icon at the far left of the breadcrumb row").
- Callouts use text labels and an outline shape, not color alone.
- Zoom to at least 150% on condition builder and breadcrumb; keep cursor movements slow; show keyboard Enter presses with an on-screen key indicator.
- Provide a transcript with the exact conditions in a copyable code block.

## Check for understanding
1. You type `incident.list` and see fewer records than expected. What is the first thing to check? — *The breadcrumb; a previous filter may still be applied. Click All.*
2. Incident has no Department field. How can you filter incidents by the caller's department? — *Dot-walk through the Caller reference field (Caller.Department), because Caller stores a sys_id pointing at `sys_user`.*
3. What is the difference between Configure > List Layout and the list gear icon? — *Configure changes the list view for everyone using it; the gear personalizes it for you only.*
