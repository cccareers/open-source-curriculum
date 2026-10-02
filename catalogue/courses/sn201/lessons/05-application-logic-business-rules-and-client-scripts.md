---
lesson_id: sn201-05
course_id: sn201
pathway: servicenow-implementation-specialist
title: 'Application Logic: Business Rules and Client Scripts'
order: 5
kind: lesson
competency_ids:
  - D7-S1-C01
objectives:
  - Add application logic with business rules and client scripts
---

## Two places code can run

Lesson 4 ended with a list of things a UI policy cannot do. This lesson gives you the two tools that can, and — just as importantly — the judgement to use as little of them as possible.

Everything you write from here runs in one of two places.

**On the server**, when a record is read or written. Server code sees the whole database, runs whether the record came from a form, an import, an integration, or a flow, and cannot be bypassed by a user. That is a **business rule**.

**In the browser**, while someone has a form open. Client code sees only what is on the form, runs only for form users, and gives immediate feedback without a round trip. That is a **client script**.

The distinction is not a preference. Logic that must always hold belongs on the server; logic that shapes what someone sees while typing belongs on the client. Putting a data guarantee in a client script means an import can violate it. Putting a form nicety in a business rule means the user finds out after the save.

A note on scope before you start. This course teaches business rules and client scripts as **single-purpose application logic** — one rule, one job, ten or fifteen lines. Script includes, reusable server-side classes, GlideAjax patterns, and how to structure a codebase of scripts are the subject of sn250. When this lesson says "keep it small," it is not because small is all the platform offers; it is because small is what an application at this stage should need, and the architecture that scales beyond it is taught properly later.

## Business rules: the four whens

A business rule is a server-side script attached to a table, gated by a condition, and scheduled by a **when**.

| When | Runs | Use it for |
| --- | --- | --- |
| `before` | After validation, before the record is written | Modifying the record being saved; aborting the save |
| `after` | Once the record is written | Updating *other* records; reacting to the change |
| `async` | Shortly after the write, in the background | Slow work the user should not wait for |
| `display` | When the record is loaded onto a form | Preparing data for client scripts to read |

Along with `when`, each rule carries:

- **Table** — which table it watches.
- **Insert / Update / Delete / Query** — which operations trigger it. Tick only what you need.
- **Condition** — a filter, a script condition, or both. A rule with no condition runs on every single write to the table, which is how instances get slow.
- **Order** — the sequence when several rules apply at the same `when`. Lower first. Leave gaps.

Inside the script you have two objects that carry most of the work:

- **`current`** — the record as it will be saved, with every field readable and (in a `before` rule) writable.
- **`previous`** — the record as it was before this change. Only meaningful on update.

### A before rule: stamp a value

The facilities team wants to know when work actually started, without asking technicians to fill in a field. The moment the state first becomes In Progress, stamp the time.

- Table: `work_order`
- When: `before`, on Update
- Condition: `State changes to In Progress`
- Order: 100

```javascript
(function executeRule(current, previous) {
  // State just moved to In Progress and we have not stamped a start yet.
  if (current.work_started.nil()) {
    current.work_started = new GlideDateTime();
  }
})(current, previous);
```

Three things to notice. There is no `current.update()` — a `before` rule modifies the record that is *about to be saved*, and calling update inside one causes a recursive save. The condition does the filtering, so the script does not re-check the state. And the `nil()` guard makes the rule safe if the record bounces in and out of In Progress.

### An after rule: touch another record

When a work order closes, roll its cost onto the parent, if it has one.

- When: `after`, on Update
- Condition: `State is Closed Complete`

```javascript
(function executeRule(current, previous) {
  if (current.parent.nil()) {
    return;
  }
  var parent = new GlideRecord('x_acme_facilities_work_order');
  if (parent.get(current.parent)) {
    parent.child_cost_total = (parent.child_cost_total || 0) + (current.total_cost || 0);
    parent.update();
  }
})(current, previous);
```

Here `update()` is correct, because you are writing a *different* record. Note the guard clause first: rules that start by ruling themselves out are easier to read and cheaper to run.

### An async rule: get out of the user's way

If closing a work order should trigger something slow — recalculating a rollup across hundreds of rows, say — use `async`. The user's save returns immediately and the work happens in a background job. The trade is that `previous` is not available, and the record may have changed again by the time it runs. Use async for work whose exact timing does not matter.

### Aborting a save

A `before` rule can refuse the write:

```javascript
(function executeRule(current, previous) {
  if (current.state == 60 && current.work_order_parts_pending()) {
    gs.addErrorMessage('Close the outstanding part requests before completing this work order.');
    current.setAbortAction(true);
  }
})(current, previous);
```

Two rules about aborting. Always tell the user why, with a message — a save that silently fails is the worst experience an application can offer. And prefer a data policy or a mandatory field where one would do; an abort is for conditions no simpler mechanism can express.

### A display rule

A `display` rule runs when the form loads and can put values into a scratchpad object that client scripts read. It is the sanctioned way to give the browser server-side information without an extra call. You will rarely need it in this course; know it exists so you recognise it in someone else's application.

## Client scripts: the four types

A client script runs in the browser against the loaded form. Its type says when.

| Type | Fires | Typical use |
| --- | --- | --- |
| `onLoad` | Once, when the form finishes loading | Initial arrangement the UI policy could not express |
| `onChange` | Whenever a specific field changes | Reacting to one field by adjusting another |
| `onSubmit` | When the user saves | Last-chance validation with a clear message |
| `onCellEdit` | When a field is edited inline in a list | The list equivalent of onChange |

An `onChange` script is tied to one field, chosen on the script record.

The API you work through is **`g_form`**, which manipulates the form. The methods you will actually use:

```javascript
g_form.getValue('work_type');            // read a field
g_form.setValue('priority', '2');        // write a field
g_form.setMandatory('close_notes', true);
g_form.setDisplay('contractor_company', false);  // remove from layout
g_form.setReadOnly('location', true);
g_form.clearValue('assigned_to');
g_form.addInfoMessage('...');            // banner at the top of the form
g_form.addErrorMessage('...');
g_form.showFieldMsg('scheduled_for', 'Date is in the past.', 'error');
g_form.clearMessages();
```

### An onChange script: derive a value

Facilities wants HVAC jobs defaulted to a higher priority, because a failed chiller escalates fast. Priority remains editable — this is a suggestion, not a rule.

- Table: `work_order`, Type: `onChange`, Field: `work_type`

```javascript
function onChange(control, oldValue, newValue, isLoading, isTemplate) {
  // Skip the initial page load and cleared values.
  if (isLoading || newValue === '') {
    return;
  }
  if (newValue === 'hvac') {
    g_form.setValue('priority', '2');
    g_form.addInfoMessage('HVAC jobs default to High priority. Change it if this one is routine.');
  }
}
```

The `isLoading` guard is not optional. Without it the script fires while the form is drawing, overwriting saved values on every existing record someone opens. Half of all reported "my data changed by itself" bugs are a missing `isLoading` check.

### An onSubmit script: validate before saving

```javascript
function onSubmit() {
  var scheduled = g_form.getValue('scheduled_for');
  if (scheduled === '') {
    return true;
  }
  if (new Date(scheduled) < new Date()) {
    g_form.addErrorMessage('Scheduled date cannot be in the past.');
    return false;   // cancels the save
  }
  return true;
}
```

Returning `false` cancels the submit. Always pair it with a message.

And note the limit: this validation protects the form only. If the same guarantee must hold for records created by an integration, it belongs in a business rule or a data policy as well. Client-side validation is a courtesy; server-side validation is a control.

### The thing not to do

You will eventually want a client script to look something up — "is this location currently under a maintenance freeze?" It is possible to query the server from a client script, and there is a correct asynchronous way to do it. There is also an old synchronous way that freezes the user's browser until the server answers, and it appears in a great deal of legacy code.

For this course: if a client script needs server data, first ask whether a **display business rule** can hand it over on load, or whether a **reference qualifier** or **dictionary default** removes the need entirely. Those solve most cases without a call. The proper asynchronous server-call pattern, and the script include that sits behind it, are taught in sn250 where they can be given the space they deserve.

## Choosing the right tool

By now you have four mechanisms that overlap. This is the order to consider them in.

| The requirement | Reach for |
| --- | --- |
| Show, hide, require, or lock a field based on other fields on the form | **UI policy** |
| The same, but it must hold for imports and integrations too | **Data policy** |
| Limit which records a reference field offers | **Reference qualifier** |
| Set a field's value when another field changes, on the form | **onChange client script** |
| Block a save with a message the user can act on | **onSubmit client script**, plus a server-side guard if it must always hold |
| Set or derive a field value on every save, from any source | **before business rule** |
| Update or create *other* records when this one changes | **after business rule**, or a flow |
| Multi-step process with approvals, waits, notifications, or tasks | **Flow Designer** — lesson 6 |

Work down the table, not up it. The first row that satisfies the requirement is your answer. A team that reaches straight for a business rule when a UI policy would do ends up with an application that only its author can change.

## Keeping logic small

Three habits keep an application's logic maintainable at this stage.

**One rule, one job.** A business rule named "Work order stuff" that stamps a date, sends a notification, and updates a parent is impossible to debug, because you cannot disable one third of it. Three rules with three names and three conditions can each be turned off in isolation.

**Condition first, script second.** Anything the condition builder can filter should be filtered there. It runs before the script is even compiled, it is visible to someone reading the list of rules, and it is faster.

**Name the rule after its effect.** "Stamp work_started when state becomes In Progress" tells a maintainer everything. "BR1" tells them nothing.

When your application outgrows this — when three rules share the same twenty lines of logic and you find yourself copying code between them — that is the signal that you need script includes and a deliberate script architecture. That is exactly where sn250 picks up. Recognising the signal is this course's job; building the answer is that one's.

## Practice

Work in the `Facilities Work Orders` application.

1. **Add the supporting field.** Create `work_started` (Date/Time) and `total_cost` (Currency) on `work_order`. Put `work_started` on the Assignment section as read-only.

2. **Write the before rule.** Implement the "stamp `work_started`" rule described above, with the condition on the rule record rather than in the script. Test it: move a record to In Progress, confirm the stamp appears, move it to On Hold and back, and confirm the original stamp survives.

3. **Write the after rule.** Add `child_cost_total` (Currency) to `work_order`, then implement the roll-up rule. Create a parent work order and two children, close both children, and confirm the parent total is the sum. Then explain in one sentence why this rule must be `after` and not `before`.

4. **Write the onChange script.** Implement the HVAC priority default. Test it three ways: on a new record (should fire), by reopening a saved HVAC record (should *not* fire — this is the `isLoading` test), and by changing work type away from HVAC (should not undo the priority, because you did not ask it to).

5. **Write the onSubmit script.** Implement the past-date validation. Confirm the save is blocked and the message is legible. Then confirm that creating a record through a list's inline-new row bypasses it, and write down what that tells you about client-side validation.

6. **Deliberately break something, then fix it.** Remove the `isLoading` guard from your onChange script and reopen an existing HVAC work order that you had manually set to Priority 4. Watch it change. Restore the guard. This is a five-minute exercise that will save you a day at some point in your career.

7. **Audit your own work.** List every UI policy, client script, and business rule now on `work_order`. For each, name the row in the decision table it belongs to. If any of them sit lower in the table than they need to, rewrite them upward — a client script that a UI policy could do should become a UI policy.

8. **Stretch.** Add a `before` rule that aborts closing a work order while any related `work_order_part` row has a zero quantity, with a message naming the problem. Then argue, in three sentences, whether this rule is better placed as a business rule or as a data policy, and what the difference would be for an integration.
