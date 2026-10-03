---
course_id: sn290
project_id: sn290-x02
title: "Rescue the Northwind Shift Board Widget"
kind: supplementary-project
status: draft
hours_estimate: 5
difficulty: stretch
related_lessons:
  - sn290-03
  - sn290-04
  - sn290-06
objectives:
  - Build and clone widgets using HTML, CSS, an AngularJS client controller, and a server script
  - Lay out a portal that works on a phone and give it navigation a user can follow
  - Diagnose a slow portal page and meet baseline accessibility requirements
competency_ids:
  - D6-S1-C02
  - D6-S1-C03
  - D6-S1-C05
---

## Scenario

A previous contractor built a "My Unit's Open Requests" widget for Northwind Regional Health's `nwsc` portal so charge nurses can see what their unit has asked for. It works on the contractor's desktop. On the ward, on a phone, over hospital Wi-Fi, it takes several seconds to load, the "Mark seen" buttons cannot be reached with a keyboard or a screen reader, it ignores the Northwind theme, and the table is unreadable at phone width. You are asked to fix it without changing what it shows, and to prove each fix with a before/after measurement.

## What you will produce

- A fixed version of the widget (your own widget record; the starter is pasted in, not an out-of-box widget).
- A before/after evidence table: SQL statement count, document response time, payload size, accessibility checker findings, keyboard task result.
- A short remediation note.

## Before you start (prerequisites, starter files or data)

- PDI with your `dev290` or `nwsc` portal and a copied theme.
- At least 300 active incidents. If your PDI has fewer, run this once in **Scripts - Background** to generate test data (prefixed so you can delete it afterwards):

```javascript
for (var i = 0; i < 300; i++) {
  var inc = new GlideRecord('incident');
  inc.initialize();
  inc.short_description = 'SN290 load test ' + i;
  inc.caller_id = gs.getUserID();
  inc.opened_by = gs.getUserID();
  inc.insert();
}
```

- Create a widget named `nw Shift Board (starter)` with exactly this code, place one instance on a test page, and confirm it renders.

**Server script (starter)**

```javascript
(function() {
  data.rows = [];
  var gr = new GlideRecord('incident');
  gr.addActiveQuery();
  gr.addQuery('opened_by', gs.getUserID());
  gr.query();
  while (gr.next()) {
    var u = new GlideRecord('sys_user');
    u.get(gr.getValue('assigned_to'));
    data.rows.push({
      sys_id: gr.getUniqueValue(),
      number: gr.getValue('number'),
      short_description: gr.getValue('short_description'),
      description: gr.getValue('description'),
      state: gr.getDisplayValue('state'),
      priority: gr.getDisplayValue('priority'),
      assigned: u.getValue('name'),
      updated: gr.getValue('sys_updated_on'),
      work_notes: gr.getValue('work_notes')
    });
  }
  data.total = data.rows.length;
  if (input && input.sys_id) {
    var rec = new GlideRecord('incident');
    rec.get(input.sys_id);
    rec.comments = 'Seen by charge nurse';
    rec.update();
  }
})();
```

**Template (starter)**

```html
<div style="background:#0b5394;color:#fff;padding:8px">
  <span style="font-size:22px;font-weight:bold">Unit requests ({{c.data.total}})</span>
</div>
<table class="table">
  <tr><td>Number</td><td>Description</td><td>State</td><td>Priority</td><td>Assigned</td><td>Updated</td><td></td></tr>
  <tr ng-repeat="r in c.data.rows">
    <td>{{r.number}}</td><td>{{r.short_description}}</td><td>{{r.state}}</td>
    <td><span style="color:red" ng-show="r.priority == '1 - Critical'">&#9679;</span>{{r.priority}}</td>
    <td>{{r.assigned}}</td><td>{{r.updated}}</td>
    <td><div class="btn-link" ng-click="c.seen(r)">Mark seen</div></td>
  </tr>
</table>
```

**Client controller (starter)**

```javascript
api.controller = function($interval) {
  var c = this;
  c.seen = function(r) {
    c.data.sys_id = r.sys_id;
    c.server.update();
  };
  $interval(function() { c.server.update(); }, 10000);
};
```

## Milestones

1. **Baseline.** As your own user (not admin-impersonating someone else), load the page with the browser network panel open and **System Diagnostics > Session Debug > Debug SQL** (or your release's equivalent) enabled. Record: document response time, number of SQL statements, size of the document response, and how long the page sits before the list appears. Run an automated accessibility checker (for example the axe browser extension or Lighthouse) and record the count of findings. Try to mark a row seen using only the keyboard; record whether you could.
2. **Diagnose into buckets** (lesson 6): which defects are server, asset, or browser? Write the list before fixing anything. You should find at least: no `setLimit`; a query per row; unused fields (`description`, `work_notes`) serialized; an unconditional-looking side effect that also has no permission check; full `c.server.update()` for a single action; polling with `$interval`; no `track by`; non-focusable click target; color-only priority signal; hard-coded colors and font size; a non-heading title; a table with no header cells.
3. **Fix the server script.** Limit the query (and add an option for the limit), dot-walk or display-value the assignee instead of querying per row, send only rendered fields, and branch on an explicit `input.action` with a write-permission check:

```javascript
if (input && input.action === 'seen') {
  var rec = new GlideRecord('incident');
  if (rec.get(input.sys_id) && rec.canWrite()) {
    rec.comments = 'Seen by charge nurse';
    rec.update();
    data.message = gs.getMessage('Marked {0} as seen', rec.getDisplayValue('number'));
  } else {
    data.message = gs.getMessage('You cannot update that record.');
  }
}
```

4. **Fix the client.** Use `c.server.get({action: 'seen', sys_id: r.sys_id})` for the action, then refresh; replace the `$interval` poll with `spUtil.recordWatch` on the same filter; add `track by r.sys_id`; one-time bind the static title.
5. **Fix accessibility and theme.** Real `<button type="button">` controls with row-specific accessible names (for example `aria-label="Mark INC0010001 seen"`); a real heading for the title; `<th scope="col">` header cells; a word or icon-with-text beside the priority dot; a `role="status" aria-live="polite"` region for `data.message`; theme variables instead of hex values; no inline styles.
6. **Fix the phone layout.** At 375 px the seven-column table must be usable: either wrap it in an `overflow-x: auto` region, or render a stacked card list below the small breakpoint. Confirm 44 by 44 px tap targets for the button.
7. **Re-measure** every baseline number under the same conditions and fill in the evidence table.
8. **Write the remediation note.**

## Acceptance criteria

- [ ] The widget shows the same information to the same user as before (number, short description, state, priority, assignee, updated).
- [ ] SQL statement count for the widget is constant regardless of how many incidents the user has (no per-row query).
- [ ] The server query is limited and the limit is an instance option.
- [ ] The action validates `input.action` and checks write permission before updating; attempting it against a record the user cannot write returns a message, not an error.
- [ ] No polling timer remains.
- [ ] A keyboard-only user can mark a row seen, with visible focus, and a screen reader announces the result.
- [ ] Priority is conveyed by text, not color alone.
- [ ] Changing one theme color variable changes the widget.
- [ ] At 375 px, no horizontal page scroll is required (a scrolling region inside the widget is acceptable).

## Evidence checklist

- [ ] Evidence table:

| Measure | Before | After |
|---|---|---|
| Document response time (ms) | | |
| SQL statements on page load | | |
| Document response size (KB) | | |
| Server calls per minute while idle | | |
| Automated accessibility findings | | |
| Keyboard-only "mark seen" possible? | | |
| Horizontal page scroll at 375 px? | | |

- [ ] Screenshots of the SQL debug output before and after (statement counts visible).
- [ ] Screenshot of the network panel showing no periodic requests while idle after the fix.
- [ ] Accessibility checker reports before and after.
- [ ] Screenshot at 375 px.
- [ ] Final widget code (all four parts) pasted into the note or exported in an update set.
- [ ] Cleanup: run this after the project, then confirm it reports 0.

```javascript
var gr = new GlideRecord('incident');
gr.addQuery('short_description', 'STARTSWITH', 'SN290 load test');
gr.query();
gs.info('Deleting ' + gr.getRowCount() + ' test incidents');
gr.deleteMultiple();
```

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Diagnosis | Fixes applied without measuring | Each defect placed in the right bucket before fixing | Predicts the size of each improvement before measuring it |
| Server script | Limit added only | Limit, no per-row query, minimal payload, validated action | Limit and fields exposed as an option schema with sensible defaults |
| Client and browser | Still polls or uses full update for the action | `get` for the action, record watch, track by, one-time bindings | Explains why record watch is cheaper than polling in terms of server load |
| Accessibility | Checker findings remain | Keyboard, names, headings, live region, non-color priority | Screen reader walkthrough recorded as evidence |
| Responsive | Table unreadable on phone | Usable at 375 px | Card layout below the small breakpoint with a justified choice |

## Stretch goals

- Add an ATF test (if you have taken sn301) with a **Run Server Side Script** step that executes the widget's query logic and asserts it returns no more than the configured limit.
- Move the date formatting into an Angular provider shared with your `sn290 Open Records` widget.

## Reflection prompts

- Which single fix had the largest measurable effect, and was it the one you expected?
- Which accessibility defect would the automated checker never have found?

## Instructor notes (common pitfalls, how to adapt for time)

- Learners often replace the per-row query with a dot-walk and assume zero extra queries. Have them check the SQL debug output to see what the platform actually issues; dot-walked reference lookups can still cost queries (see review.md open question). The acceptance criterion is a *constant* count, not a specific number.
- The starter's action has no `action` key and no permission check; learners who keep `c.server.update()` will re-run the update on every refresh. That is the point of milestone 3.
- The bulk insert script is for a PDI only. Never run data generators on a shared instance.
- For a 3-hour version, skip the responsive milestone and the stretch goals.
