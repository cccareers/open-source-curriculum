---
lesson_id: sn250-04
course_id: sn250
pathway: servicenow-implementation-specialist
title: Business Rules and Execution Order
order: 4
kind: lesson
competency_ids:
  - D7-S1-C01
objectives:
  - Choose the correct business rule type and timing for a server-side requirement
---

## What a business rule is

A business rule is a piece of server-side script attached to a table that runs when a record on that table is queried, inserted, updated, or deleted. It runs no matter how the record was touched — a user on a form, a list edit, an inbound web service, an import, another script. That is its defining strength. If a requirement is "this must be true of the data, always", a business rule is usually the right home for it, because there is no path around it.

It is also its defining risk. A rule that is slow, or that writes back to its own table, or that fires on every update when it only needed one, multiplies across every transaction on that table. The skill this lesson builds is not writing rule scripts — you already have the JavaScript and the GlideRecord for that. It is choosing **when** the rule runs.

## The record

A business rule lives on the `sys_script` table and you author it in the Business Rules module. The fields that decide behaviour are:

- **Table** — what it watches.
- **Active** — the off switch.
- **Advanced** — reveals the script field and the When/Order settings. A rule without it can only set field values declaratively.
- **When** — `before`, `after`, `async`, or `display`.
- **Order** — a number deciding sequence among rules with the same When.
- **Insert / Update / Delete / Query** — which database operations trigger it.
- **Filter conditions** — a condition builder evaluated before the script runs.
- **Condition** — a script expression that must evaluate truthy.
- **Script** — the code.

Two things about conditions matter more than they look. First, **use the condition fields rather than an `if` at the top of your script**. A rule whose filter condition is false is skipped cheaply; a rule that runs a script to decide it had nothing to do has already paid for the script. Second, a rule with no condition at all runs on *every* insert or update of that table, which on a task table means constantly.

## The four When values

### before

Runs after the record has been submitted but **before** it is written to the database. `current` holds the values about to be saved, and any change you make to `current` is part of that same write.

This is where field manipulation belongs. Computing a value, defaulting an empty field, normalising input, forcing consistency between fields — all of it is a before rule, and none of it needs an `update()` call.

```javascript
(function executeRule(current, previous /*null when async*/) {

  // Set the short description when the caller left it blank.
  if (!current.getValue('short_description')) {
    var category = current.getValue('category') || 'general';
    current.setValue('short_description',
      'Auto-created ' + category + ' request from ' + gs.getUserName());
  }

})(current, previous);
```

Never call `current.update()` in a before rule. The write is already happening; calling update forces a second one and re-triggers the rule.

A before rule can also stop the write entirely:

```javascript
if (current.getValue('priority') === '1' && !current.getValue('assignment_group')) {
  gs.addErrorMessage('A priority 1 incident must have an assignment group.');
  current.setAbortAction(true);
}
```

`setAbortAction(true)` cancels the operation. Pair it with `gs.addErrorMessage` so the user learns why, and use it sparingly: a validation that fires on an import the user cannot see produces an error nobody reads. If the rule guards data integrity, abort. If it guards a form-filling mistake, a UI policy or client script (lesson 5) gives faster feedback — with the caveat that only the server-side rule is unbypassable.

### after

Runs once the record is written. `current` now reflects what is in the database, and the record's sys_id exists, which is the whole point.

Use an after rule for work on *other* records: creating a related task, updating a parent, writing an audit row.

```javascript
(function executeRule(current, previous /*null when async*/) {

  // On resolution of a parent incident, close its open child tasks.
  var child = new GlideRecord('incident_task');
  child.addQuery('incident', current.getUniqueValue());
  child.addQuery('active', true);
  child.query();

  while (child.next()) {
    child.setValue('state', '3');
    child.setValue('work_notes', 'Closed automatically with parent ' + current.getValue('number') + '.');
    child.update();
  }

})(current, previous);
```

Setting a field on `current` in an after rule does nothing useful on its own, because the write is over. If you find yourself writing `current.setValue(...); current.update();` in an after rule, the requirement almost certainly belonged in a before rule — and the version you wrote will re-trigger the rule set for the table, which is the classic recursive business rule.

### async

Runs after the write, like an after rule, but on a background scheduled worker rather than in the user's transaction. The user's save returns immediately; the rule executes a moment later.

Async is for work that is correct but expensive: an integration call, a large sweep of related records, a heavy calculation. Moving it off the transaction is the difference between a save that takes 200 milliseconds and one that takes four seconds.

The trade-offs are real. `previous` is **null** in an async rule, so you cannot compare old and new values in the script — put that comparison in the rule's condition instead, where it is evaluated at the time of the write. There is no ordering guarantee against other async work. And by the time the rule runs, the record may already have changed again, so re-read anything you depend on rather than trusting `current`.

```javascript
(function executeRule(current, previous /*null when async*/) {

  // Recalculate a rolled-up count on the parent — safe to be a second late.
  // Rule on incident_task. Its link to the incident is the 'incident' field,
  // the same one the after-rule example above queries.
  var parentId = current.getValue('incident');
  if (!parentId) {
    return;
  }

  var ga = new GlideAggregate('incident_task');
  ga.addQuery('incident', parentId);
  ga.addQuery('active', true);
  ga.addAggregate('COUNT');
  ga.query();
  ga.next();

  var parent = new GlideRecord('incident');
  if (parent.get(parentId)) {
    parent.setValue('u_open_task_count', ga.getAggregate('COUNT'));
    parent.update();
  }

})(current, previous);
```

### display

Runs when a record is **loaded onto a form**, before it is rendered, and does not run on list views or on save. Its unique ability is `g_scratchpad`: an object the display rule populates on the server and the form's client scripts read in the browser.

```javascript
(function executeRule(current, previous /*null when async*/) {

  g_scratchpad.callerVip = current.caller_id.vip.toString() === 'true';
  g_scratchpad.managerName = current.assignment_group.manager.getDisplayValue();

  var ga = new GlideAggregate('incident');
  ga.addQuery('caller_id', current.getValue('caller_id'));
  ga.addQuery('active', true);
  ga.addAggregate('COUNT');
  ga.query();
  ga.next();
  g_scratchpad.callerOpenIncidents = parseInt(ga.getAggregate('COUNT'), 10);

})(current, previous);
```

Put only plain strings, numbers, and booleans on the scratchpad. It is serialised to the browser with the form, so a large scratchpad slows every load of that record, and a GlideRecord placed on it will not survive the trip.

The display rule exists so client scripts do not have to ask the server for data at form-load time. Lesson 5 covers the client side of that bargain; here, the thing to remember is that a display rule pays its cost once per form load, for every user, whether or not the client script needed the value.

## current and previous

Inside a rule, `current` is a GlideRecord positioned on the record being processed, and `previous` is the record as it was before this change. `previous` is available in before and after rules on an update; it is `null` in an async rule, and on an insert its fields are empty.

The comparison you will write most often is "did this field just change?", and there is a helper for it:

```javascript
if (current.state.changesTo('6')) { /* just became Resolved */ }
if (current.assignment_group.changes()) { /* value differs from previous */ }
if (current.priority.changesFrom('1')) { /* was 1, now something else */ }
```

`changes()`, `changesTo(value)`, and `changesFrom(value)` are GlideElement methods, so they are called on the field, not on the record. They are also legal in the rule's **condition** field, which is where they belong — a rule that should only run when state becomes Resolved should have `current.state.changesTo('6')` as its condition, not as the first `if` inside a script.

Everything you learned about reading fields still applies: `current.getValue('field')` gives you a string, `current.field` gives you a GlideElement, and `current.getUniqueValue()` gives you the sys_id.

## Order, and what runs when

`Order` decides sequence among rules of the same When on the same table, low numbers first. The default is 100. Rules of different When values do not compete: every before rule runs before the write, every after rule runs after it, regardless of order numbers.

Ordering matters when one rule depends on another's work. If a before rule at order 100 computes a category and another before rule needs that category, the second must be a higher order number. Leave gaps — number rules 100, 200, 300 rather than 1, 2, 3 — so that a rule can be inserted between two existing ones later without renumbering.

Business rules also inherit down a table hierarchy. A rule on `task` runs for `incident`, `change_request`, and every other child table. That is a feature when the requirement is genuinely universal and a trap when it is not: before writing a rule on `task`, check that you really mean every task-derived table, present and future.

One more sequencing fact worth carrying: on a save, the platform runs before rules, then the database write, then after rules, then queues async rules. Client-side logic has already finished before any of it starts.

## Recursion, and the rules that fight each other

Two failure modes account for most of the business rules that "sometimes do something strange".

**Recursion.** A rule updates the record it is running on, that update runs the table's rules again, and one of them updates the record again. The platform detects the most obvious loops and stops them, which is worse than it sounds — the symptom is not an error but a rule that ran four times and a field that ended up with a value nobody can explain.

The cure is structural, not defensive:

- Field changes on the current record go in a **before** rule and never call `update()`.
- An after rule that must touch the current record — genuinely rare — should be re-examined first; the requirement almost always fits before.
- If you truly cannot avoid a write-back, guard it: check whether the value already equals what you are about to set, and return if it does. A rule that only writes when something actually changed cannot loop forever.

```javascript
var wanted = computeValue();
if (current.getValue('u_derived') !== wanted) {
  current.setValue('u_derived', wanted);
  current.update();      // only ever runs when the value really differs
}
```

**Rules that undo each other.** Two before rules on the same table, written by different people a year apart, both set `assignment_group` under overlapping conditions. Whichever has the higher order number wins, and neither author knows the other exists. This is why *Debug Business Rule* — which lists every rule that ran, in order — is worth turning on before you write a new one, not after it misbehaves. Read what already runs on the table. It takes two minutes and it is the difference between adding a rule and adding a conflict.

The related discipline is **naming**. A rule called `Set fields` tells the next person nothing. `Route P1 network incidents to Network Support` tells them whether to keep reading.

## Testing a business rule

Three checks, in order, before you call a rule done:

1. **From a form.** The obvious path, and the only one most people try.
2. **From a list edit.** Same rule, no form, no client script. A rule that depends on a client script having run first will fail here — which is itself the argument for server-side validation.
3. **From a background script.** `insert()` or `update()` on the table directly. This is how an import, an integration, and another script will hit your rule, and it is where an abort with `gs.addErrorMessage` has nobody to talk to. Confirm the rule still does the right thing when there is no user watching.

If the rule matters, wrap those three in an Automated Test Framework test so the check runs again next quarter when somebody edits the table.

## Query business rules

A rule with **Query** checked runs before a query against its table is executed, and it can add conditions to that query. This is row-level filtering — a way to make records invisible to users who should not see them, on lists, on related lists, in reports, everywhere.

```javascript
(function executeRule(current, previous /*null when async*/) {

  if (gs.hasRole('hr_admin') || gs.getSession().isInteractive() === false) {
    return;
  }
  current.addQuery('u_confidential', '!=', true);

})(current, previous);
```

In a query rule, `current` is the query being built rather than a record, and `addQuery` on it adds a condition every caller inherits. Be careful: it is easy to write a query rule that hides records from the very administrator debugging it, and equally easy to write one that leaks by returning early for too many roles.

## Choosing the right rule: a decision list

Work down this list and stop at the first match.

1. Does it change fields on the record being saved? → **before**, no `update()` call.
2. Does it need to reject the save? → **before**, `setAbortAction(true)` with a message.
3. Does it need the record's sys_id, or does it touch other records, and must it be done by the time the user sees the result? → **after**.
4. Does it touch other records or an external system, and can it be a second late? → **async**.
5. Does it exist only to hand server data to a client script on form load? → **display**, small values only.
6. Does it restrict which records a query returns? → **query**.

Two rules of restraint sit on top of that list. If the requirement is a multi-step process with approvals, waits, or notifications, a flow is a better fit than a rule — lesson 7 makes that case. And if the same logic is wanted by two rules, it belongs in a script include (lesson 6), with the rules reduced to a condition and one call.

## Worked example: one requirement, three wrong homes

The requirement: *when a priority 1 incident is assigned to a group, stamp the assignment time, notify the group's manager, and recompute the group's open-critical count.*

That is three pieces of work with three different timings, and putting them in one rule is the mistake.

**Stamp the assignment time** is field manipulation on the record being saved. Before rule, condition `current.assignment_group.changes() && current.priority == 1`:

```javascript
current.setValue('u_assigned_at', new GlideDateTime().getValue());
```

Use `new GlideDateTime()` here rather than `gs.nowDateTime()`: the latter returns the time formatted for the *user's* display and time zone, which is the wrong format to store in a date/time field, and it is not available in scoped applications at all.

**Notify the manager** needs the saved record and touches something else, and the user should not wait for it. After or async — async, because an email send should never be inside a user's save. The condition goes on the rule, since `previous` is null in the script. The one line below hands the work to the platform's event queue, which is lesson 9's subject; all that matters here is the timing decision:

```javascript
var managerId = current.assignment_group.manager.toString();
if (managerId) {
  gs.eventQueue('x_acme.critical_assigned', current, managerId, current.getValue('number'));
}
```

**Recompute the group's count** is an aggregate over other records, and nobody is watching the number in real time. Async, and it must re-read rather than trust `current`, because the assignment may have changed again in the seconds since.

Three rules, three When values, three conditions that each keep the rule from running when it has nothing to do. That decomposition — not the scripts — is the deliverable.

## Practice

Work on a sub-production instance. Give every rule a name that says what it does and a description field explaining why it exists.

1. **Before rule, field manipulation.** On `incident`, write a before insert/update rule that, when `short_description` is empty, fills it with the category and the caller's name. Verify it fires from a form save and from a list edit, and confirm you did not need `current.update()`.

2. **Before rule, abort.** Write a before rule that refuses to let an incident be set to priority 1 without an assignment group, with a clear error message. Then test it by inserting a record from a background script rather than a form, and record what the user experience is in each case.

3. **After rule.** Create a rule that, when an incident is resolved, adds a work note to every active child task and closes it. Prove it works by resolving a parent with two children. Then explain in a comment why this rule would recurse if the same logic were written to update `current`.

4. **Async rule.** Convert the child-task closure from exercise 3 into an async rule. Note in a comment what changes about `previous`, and move the "state changed to resolved" test out of the script and into the rule's condition field.

5. **Display rule and scratchpad.** Write a display rule on `incident` that puts the caller's open incident count and VIP flag on `g_scratchpad`. Confirm the values arrive by reading them in a temporary client script that logs to the browser console. Measure the form load before and after and say whether you would keep the rule.

6. **Ordering.** Create two before rules on the same table, one that sets a field and one that reads it, deliberately ordered wrong. Observe the failure, then fix it by renumbering, and write down why order numbers should be spaced.

7. **Query rule.** Add a checkbox field to a table you own, write a query business rule that hides checked records from users without a role you choose, and verify with impersonation. Then find and describe the flaw in your own early-return condition.

8. **Choose the timing.** For each of these, name the When value and one sentence of justification: recalculating a due date from a priority; sending a record to an external ticketing system; preventing deletion of a record with children; showing a client script the caller's contract tier; hiding archived rows from a related list.

## Check your understanding

1. A rule must set `u_region` from the caller's location whenever an incident is saved. Which When, and does it call `update()`? *Before; no — it changes the record already being written.*
2. Why is `previous` useless inside an async rule's script, and where does the "did it change?" test go instead? *It is null in async rules; put `changes()`/`changesTo()` in the rule's condition, evaluated at write time.*
3. Two before rules set `assignment_group`, orders 100 and 200. Which value is saved? *The order-200 rule's, because it runs last.*
4. Which tool shows every rule that ran for a save, in order? *Session debug: Debug Business Rule.*
