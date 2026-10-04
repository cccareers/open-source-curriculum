---
course_id: sn201
media_id: sn201-v01
type: video-script
title: "Server or Browser? Business Rules and Client Scripts in Action"
format: screencast
target_runtime: "8 min"
related_lessons:
  - sn201-05
objectives:
  - Add application logic with business rules and client scripts
competency_ids:
  - D7-S1-C01
---

## Purpose
After watching, the learner can choose between a before business rule, an after business rule, and an onChange client script for a requirement, and can recognize the two classic bugs: `current.update()` in a before rule and a missing `isLoading` guard.

## Audience and prerequisites
Apprentices who have completed sn201 lessons 2–4 and have the Facilities Work Orders app with the `work_order` table, the six-state model (10–70), and `work_started`, `total_cost`, `child_cost_total` fields.

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Split screen: left a laptop browser icon labeled "Browser — client script"; right a server rack icon labeled "Server — business rule". A work order record travels between them on "Save". | "Every line of logic you write in this app runs in one of two places: in the browser while someone has the form open, or on the server when the record is saved. Pick the wrong place and your rule either gets bypassed or shows up too late. Let's build one of each and break both on purpose." |
| 0:25 | PDI, application picker reads Facilities Work Orders. Navigator: System Definition > Business Rules > New. | "First, check the application picker. It says Facilities Work Orders — good, the rule will belong to our app. System Definition, Business Rules, New." |
| 0:40 | Form: Name "Stamp work_started when state becomes In Progress", Table `x_acme_facilities_work_order`, Advanced ticked. When to run tab: When = before, Update ticked, Order 100. Filter condition: State changes to In Progress. | "Name it after its effect. Table: work order. Tick Advanced so we get a script. When: before. Only on Update. And here's the habit that matters — put the filter in the condition builder: State changes to In Progress. The script won't even run unless this is true." |
| 1:10 | Advanced tab, type script: `if (current.work_started.nil()) { current.work_started = new GlideDateTime(); }` inside the executeRule wrapper. | "The script is three lines. If work started is empty, set it to now. Notice what's missing: there's no current dot update. In a before rule, current *is* the record about to be saved. You're changing it in flight." |
| 1:35 | Save. Open a work order in New, set State In Progress, Save. Work started now shows a timestamp. | "Save it, then test. Open a new work order, move it to In Progress, save. Work started is stamped." |
| 1:50 | Set On Hold, save; back to In Progress, save. Timestamp unchanged — highlight. | "On Hold, then back to In Progress. Same timestamp. That's the nil guard doing its job." |
| 2:05 | Callout "Don't do this" — editor shows `current.update();` added at the end. Cut to System Logs > All with a warning about recursive update / business rule loop (illustrative screenshot captured on the PDI). | "Now the classic mistake. Add current dot update to a before rule and you save the record from inside its own save. The platform detects the recursion and stops it, but you've doubled the work and you'll see warnings in the system log. Delete that line. Before rules never call update on current." |
| 2:35 | New business rule: "Recompute parent child_cost_total when a child closes", When = after, Update, condition State changes to Closed Complete. Paste the recompute script from lesson 5. | "Second requirement: when a child work order closes, recompute its parent's cost total. That touches a *different* record, so it's an after rule. Condition: State changes to Closed Complete." |
| 3:00 | Zoom on `parseFloat(child.getValue('total_cost')) || 0`. Side box: `current.total_cost + 1` → `"2501"`. | "Look at this line. We read the cost with getValue and turn it into a number. If you write current dot total cost plus one, you're adding to a field object, and JavaScript joins strings — 250 plus 1 becomes 2501. Read the value, convert it, then do math." |
| 3:25 | Zoom on the loop and `parent.update()`. | "And we recompute from all closed children instead of adding to a running total, so reopening and re-closing a child can't double-count. Here parent dot update is correct — it's a different record." |
| 3:45 | Create parent WO, two children (Parent field set), total_cost 100 and 150, close both. Open parent: Child cost total = 250. | "Test: a parent, two children at 100 and 150, close both. Parent shows 250." |
| 4:05 | Navigate: System Definition > Client Scripts > New. Name "Default HVAC to High priority", Table work_order, UI Type All, Type onChange, Field name Work type. | "Now the browser side. Facilities wants HVAC jobs to default to High priority — but it's only a suggestion, and the user should see it happen instantly. That's an onChange client script on the Work type field." |
| 4:30 | Script typed: the lesson's onChange with `if (isLoading || newValue === '') return;` and `if (newValue === 'hvac') { g_form.setValue('priority', '2'); g_form.addInfoMessage(...); }`. | "The first line is the guard: if the form is still loading, or the value was cleared, do nothing. Then: if the new value is hvac — that's the stored choice value, not the label — set priority to 2 and tell the user why." |
| 4:55 | Open a new work order, choose Work type HVAC: Priority flips to 2 - High, blue info message. | "New work order, pick HVAC. Priority jumps to High and the message explains it." |
| 5:10 | Open an existing HVAC work order, set Priority to 4 - Low manually, Save. Reopen: still 4. | "Now an existing HVAC job someone deliberately set to Low. Reopen it. Still Low. Good." |
| 5:25 | Break it: remove the `isLoading` check, save script. Reopen the same record: Priority silently flips to 2. Red callout "Data changed by itself". | "Remove the isLoading guard and reopen the record. Priority just changed to High — and nobody touched it. onChange fires while the form is loading its saved values. This one bug explains half the 'my data changed by itself' tickets you'll ever see. Put the guard back." |
| 5:55 | Back on list view. Use list inline edit (double-click Work type cell) to set HVAC. Priority unchanged. | "One more test. Change work type from the list instead of the form. Priority doesn't change, because onChange scripts only run on the form. That's fine here — it's a suggestion. But if it were a rule that must always hold…" |
| 6:15 | Decision table from lesson 5 on screen; highlight rows "Set or derive a field value on every save, from any source → before business rule" and "Set a field's value when another field changes, on the form → onChange client script". | "…it would belong on the server. Here's the decision table from the lesson. If it must hold no matter where the record came from — form, import, integration — it's a business rule or a data policy. If it's about what the user sees while typing, it's client side." |
| 6:45 | Quick montage of the three artifacts in the app's file list (developer studio / App Engine Studio). | "Three artifacts, three names that say what they do, each doing one job. Any one can be switched off without touching the others." |
| 7:05 | Recap card: "Before: change current, never update it" · "After: other records, update() is fine" · "Client: guard isLoading" · "Must always hold → server". | "Recap: before rules change the record in flight. After rules touch other records. Client scripts guard isLoading. And anything that must always hold lives on the server." |
| 7:30 | End card: "Try it: write the onSubmit past-date check, then create a record from the list and see what happens." | "Your turn: build the onSubmit past-date check from the lesson, then create a work order from the list and see whether your check runs. Write down what that tells you." |

## On-screen assets and B-roll
- PDI with the Facilities Work Orders app at end of lesson 4 state.
- Pre-recorded clip of the recursion warning in System Logs (capture on the PDI; message text varies by release — do not invent it in narration beyond "warnings in the system log").
- Overlay graphic: browser vs server icons; decision table excerpt from lesson 5.
- Code shown must match the corrected lesson 5 code exactly (getValue/parseFloat roll-up).

## Accessibility
- Captions; code shown at ≥ 18 pt in the editor; every code line also read aloud or summarized.
- "Don't do this" callouts use an icon and text label, not red alone.
- Describe state changes verbally ("Priority now reads 2 - High") rather than relying on viewers to spot them.
- Provide all three scripts in the transcript as copyable code blocks.

## Check for understanding
1. Why must the `work_started` rule be `before` and not `after`? — *It changes the record being saved; a before rule does that without a second write.*
2. A teammate's roll-up shows 100150 instead of 250. What happened? — *They added field objects/strings; read with `getValue()` and `parseFloat()`.*
3. Why did changing work type from the list not change priority? — *onChange client scripts run only on forms; list edits go straight to the server.*
