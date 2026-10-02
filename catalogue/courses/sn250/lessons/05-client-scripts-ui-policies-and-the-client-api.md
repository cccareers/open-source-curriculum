---
lesson_id: sn250-05
course_id: sn250
pathway: servicenow-implementation-specialist
title: Client Scripts, UI Policies, and the Client API
order: 5
kind: lesson
competency_ids:
  - D7-S1-C01
objectives:
  - Decide between a client script and a UI policy, and write client-side logic that does not slow the form
---

## A different machine

Everything you have written so far ran on the server, next to the database, in a transaction the user was waiting on. Client-side script runs somewhere else entirely: in the user's browser, in the form they are looking at, with no database and no `gs`.

That difference sets the rules for this lesson. Client script is fast for anything already on the form and slow for anything that is not, because getting it means a round trip across the network. It is also **not a security control** — anything the browser enforces, the browser can be made to skip, and an inbound web service never loads a form at all. Client logic exists to make the form pleasant and correct to fill in. Rules that must hold are server-side, and you wrote them last lesson.

The tools are two: **UI policies**, which are declarative, and **client scripts**, which are code. Choosing correctly between them is half the objective.

## UI policies first

A UI policy is a condition plus a set of field actions: make mandatory, make read-only, make visible. No script.

You build the condition in the condition builder, add one **UI policy action** row per field, and the platform applies it whenever the condition becomes true — and, if **Reverse if false** is checked, un-applies it when the condition stops being true. That reversal is why a policy is safer than a script for show/hide work: the script version usually handles the "make it appear" half and forgets the "make it disappear again" half.

The fields that decide behaviour:

- **Condition** — when the policy applies.
- **Reverse if false** — undo the actions when the condition goes false. Leave it on unless you have a reason.
- **On load** — also apply when the form first renders, not only on change.
- **Global** — apply on all views, not just the one you built it on.
- **Order** — sequence among policies, low first, same as business rules.
- **Run scripts in UI type** — where the policy's optional scripts run.

A UI policy can carry a small script in **Execute if true** and **Execute if false**, which runs after the field actions. Use it for the leftovers — clearing a value, setting a default — not as a way to smuggle a client script into a policy.

The reason to reach for a policy before a script is that a policy is visible. An administrator can read what it does from the list view without opening a code editor, the condition is searchable, and there is no `isLoading` guard to get wrong. **If the requirement can be expressed as "when this condition holds, these fields are mandatory / read-only / hidden", it is a UI policy. Full stop.**

Write a client script when you need something a policy cannot express: computing a value, validating a format, populating one field from another, reacting to a change with real logic, or stopping a submit.

## Client script types

A client script record names a table, a UI type, and a **type**:

**onLoad** runs once when the form renders, before the user sees it. Keep it small; every millisecond here is a millisecond of blank form.

```javascript
function onLoad() {
  if (g_form.isNewRecord()) {
    g_form.setValue('urgency', '3');
    g_form.showFieldMsg('short_description', 'Describe the symptom, not the fix.', 'info');
  }
}
```

**onChange** runs when a specific field changes. You pick the field on the client script record, and the function receives a fixed signature.

```javascript
function onChange(control, oldValue, newValue, isLoading, isTemplate) {
  if (isLoading || newValue === '') {
    return;
  }

  if (newValue === '1') {
    g_form.setMandatory('assignment_group', true);
    g_form.showFieldMsg('priority', 'Critical incidents need a group before you save.', 'warning');
  } else {
    g_form.setMandatory('assignment_group', false);
    g_form.hideFieldMsg('priority');
  }
}
```

The first two lines are not optional boilerplate; they are the two bugs everybody writes once. `isLoading` is true when the change is the form being populated rather than a user typing, so without that guard your script runs on every form load. `newValue === ''` catches a field being cleared, where most logic that expects a value will misbehave.

**onSubmit** runs when the user saves and can stop the save by returning `false`.

```javascript
function onSubmit() {
  var state = g_form.getValue('state');
  var notes = g_form.getValue('close_notes');

  if (state === '6' && notes.trim().length < 20) {
    g_form.addErrorMessage('Close notes must explain the resolution in at least 20 characters.');
    return false;
  }
  return true;
}
```

An onSubmit script must be **synchronous**. If it needs an answer from the server before deciding, you have a design problem, not a scripting problem: move the validation to a before business rule, or pre-fetch the answer at load time.

**onCellEdit** runs when a field is edited directly in a list. Its signature differs — it receives the sys_ids being edited and a callback you must call with `true` or `false` to allow or block the edit.

## The g_form API

`g_form` is the form. The methods worth memorising:

| Method | Does |
| --- | --- |
| `getValue(field)` | the stored value, always a string |
| `getDisplayValue(field)` | what the user sees (display name, choice label) |
| `setValue(field, value)` | set the stored value |
| `setValue(field, value, displayValue)` | set a reference field without a server lookup |
| `clearValue(field)` | empty it |
| `setMandatory(field, bool)` | require it |
| `setReadOnly(field, bool)` | lock it |
| `setDisplay(field, bool)` | remove it from the form entirely |
| `setVisible(field, bool)` | hide it but keep the space |
| `setSectionDisplay(name, bool)` | show or hide a form section |
| `addOption` / `removeOption` / `clearOptions` | manipulate a choice list |
| `showFieldMsg(field, msg, type)` | a message under one field |
| `hideFieldMsg(field)` | remove it |
| `addInfoMessage` / `addErrorMessage` | a banner at the top of the form |
| `isNewRecord()` | true before the first save |
| `isMandatory(field)` / `isVisible(field)` | read current state |

Two habits. Prefer `setDisplay` to `setVisible` — a hidden-but-present field leaves a gap in the layout. And when you set a reference field you already know the display value for, pass the third argument; without it, the browser makes a server call just to render the label.

`g_user` is the current user, available without a query:

```javascript
if (!g_user.hasRole('itil')) {
  g_form.setReadOnly('assignment_group', true);
}
g_form.setValue('u_requested_by', g_user.userID);
```

`g_user.userName`, `g_user.userID`, `g_user.firstName`, `g_user.lastName`, and `g_user.hasRole(role)` cover almost every need. Note that `hasRole` returns true for an admin regardless of the role asked about; `hasRoleExactly` does not.

## The performance rule

Here is the thing that separates a client script that is fine from one that makes an instance feel broken: **a synchronous server call blocks the browser**. The form freezes — no typing, no scrolling, no clicking — until the server answers. Two of them on the same form and the user notices. On a slow connection, one is enough.

Three calls are synchronous and should be treated as defects in new code:

- `g_form.getReference('caller_id')` **without** a callback function.
- `new GlideRecord(...)` used client-side and queried without a callback. Client-side GlideRecord is available but it is a network call per query, and it ignores nothing about how expensive that is.
- `GlideAjax`'s `getXMLWait()`.

In order of preference, here is how to get server data to a form:

**1. Do not.** Most of the time the value is already on the form or dot-walkable in a field the form could carry. Adding the field to the form and reading it with `g_form.getValue` costs nothing.

**2. A display business rule and `g_scratchpad`.** You wrote one of these last lesson. The server computes the value while the form is being assembled and ships it with the page — zero extra round trips.

```javascript
function onLoad() {
  if (g_scratchpad.callerVip) {
    g_form.addInfoMessage('This caller is a VIP. Response target is 30 minutes.');
  }
}
```

Use this whenever the value is knowable at load time and needed at load time.

**3. `GlideAjax`, asynchronously.** When the value depends on something the user does *after* the form loads, ask the server then — but never block while waiting.

```javascript
function onChange(control, oldValue, newValue, isLoading, isTemplate) {
  if (isLoading || newValue === '') {
    return;
  }

  var ga = new GlideAjax('AcmeIncidentAjax');
  ga.addParam('sysparm_name', 'getOpenCountForCaller');
  ga.addParam('sysparm_caller', newValue);
  ga.getXMLAnswer(function (answer) {
    var count = parseInt(answer, 10);
    if (count > 5) {
      g_form.showFieldMsg('caller_id',
        'This caller already has ' + count + ' open incidents.', 'warning');
    } else {
      g_form.hideFieldMsg('caller_id');
    }
  });
}
```

The callback runs when the answer arrives; everything else on the form keeps working in the meantime. `getXMLAnswer` hands you the answer string directly, which is simpler than `getXML` and its response-document parsing.

On the server side, `GlideAjax` calls a **client-callable script include**. The next lesson is where you learn to write those properly; for now, note only the shape, and that the class name in `new GlideAjax('AcmeIncidentAjax')` is the script include's name:

```javascript
var AcmeIncidentAjax = Class.create();
AcmeIncidentAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

  getOpenCountForCaller: function () {
    var callerId = this.getParameter('sysparm_caller');
    var ga = new GlideAggregate('incident');
    ga.addQuery('caller_id', callerId);
    ga.addQuery('active', true);
    ga.addAggregate('COUNT');
    ga.query();
    ga.next();
    return ga.getAggregate('COUNT');
  },

  type: 'AcmeIncidentAjax'
});
```

**4. `getReference` with a callback.** Acceptable when you genuinely need several fields of a referenced record and do not want a script include. Passing the callback is what makes it asynchronous; omitting it is what makes the browser hang.

```javascript
g_form.getReference('caller_id', function (caller) {
  g_form.setValue('location', caller.location);
});
```

Even done right, this pulls the whole referenced record across the network. A GlideAjax call that returns the three values you need is lighter.

## Scope and reach

A client script record has a **UI type** deciding where it applies, and it applies to the table and its child tables — the same inheritance business rules have, with the same warning. A script on `task` runs on every task-derived form.

Client scripts also exist for catalog items, as **catalog client scripts**, with the same types and mostly the same API operating on variables instead of fields. The judgement in this lesson transfers directly; the details of service catalog authoring are not this course's.

Keep the script's **Applies to** and **Isolate script** settings in mind and leave isolation on. It sandboxes your script from other scripts on the page, which is protection you want and lose the day you turn it off "to make something work".

## When your client script does not run

Client-side debugging starts with a narrower question than "why is it broken?": did it run at all? Work down this list.

**Is it active, and on the right table and view?** A script on `incident` does not run on `sc_req_item`, and a script restricted to a view does not run on the default one.

**Is the UI type right?** A script set to one UI type will not run in the other. This accounts for a surprising share of "it works on my screen and not on theirs".

**Is the field on the form?** `g_form.setValue` on a field that is not on the current view either silently does nothing or logs a warning — it cannot set what is not rendered. Adding the field to the form, or to a hidden section, is the fix.

**Did an error stop it?** One uncaught error in one client script can prevent later scripts on the same form from running. The browser console shows it. Check the console before you change any code.

**Is it an onChange on the right field?** The field is a setting on the record, not something the function signature tells you. A copied script often keeps the original field.

**Is the value what you think?** `g_form.getValue` on a reference field returns a sys_id, on a checkbox returns `'true'` or `'false'` as strings, and on an empty field returns `''`. Log it before you branch on it.

**Are you fighting a UI policy?** Policies and scripts both set mandatory, read-only, and visible, and a policy that reverses if false will happily undo what your onLoad script just did. When the two disagree, the policy usually wins the last word. Decide which tool owns the field and let it own it alone.

## Cost, and what "slow" actually means

The three things that make a form feel slow, in order of how often they are the cause:

1. **A synchronous server call**, which freezes the browser for the duration of the round trip.
2. **Too many onLoad scripts doing too much**, each adding to the time before the user can type.
3. **An oversized `g_scratchpad`**, which is serialised with every load of the form for every user, whether or not anything reads it.

The first is a defect. The second and third are budgets. A form with eleven client scripts, four of which query, is not fixable by making each one faster — it is fixable by deleting the ones nobody needs and converting the show/hide ones into UI policies.

The measurement is the browser network panel: count the requests a single form load makes, and count again after a field change. That number is the honest one, and it does not care how elegant your script is.

## Worked example: one requirement, both tools

The requirement: *on the incident form, when the caller is a VIP, show a banner and make the assignment group mandatory. When the category is `hardware`, show the asset field and require it. When priority becomes 1, warn if the caller already has open critical incidents.*

Three pieces, and only one of them is a client script.

**The hardware/asset behaviour is a UI policy.** Condition `category is hardware`; two actions on the asset field, mandatory true and visible true; Reverse if false checked; On load checked. No code, and it un-applies itself when the category changes back.

**The VIP behaviour is a display business rule plus a three-line onLoad script.** The VIP flag is knowable at load time, so it rides on `g_scratchpad` — no round trip. The onLoad script reads it, shows the banner, and sets the group mandatory:

```javascript
function onLoad() {
  if (!g_scratchpad.callerVip) {
    return;
  }
  g_form.addInfoMessage('VIP caller — assignment group is required before saving.');
  g_form.setMandatory('assignment_group', true);
}
```

**The open-critical warning is an onChange client script with GlideAjax**, because the answer depends on a caller the user may change after load. It is the code block from the section above, and it is asynchronous because the alternative is a frozen form on every priority change.

Notice what is not here: no client script that queries the incident table directly, no `getReference` without a callback, and no attempt to *enforce* any of this from the browser. Every constraint that actually matters — VIP incidents having a group, close notes being present — is duplicated in a before business rule, because that is the copy that cannot be bypassed.

## Practice

Work on a sub-production instance. Open the browser developer console before you start; you will need it.

1. **Policy, not script.** Implement this with a UI policy and no code: when `state` is Resolved, `close_code` and `close_notes` are mandatory and visible; otherwise they are hidden. Verify the reversal by moving the state back and forth. Then write one sentence on what would have gone wrong had you written it as an onChange script.

2. **onChange with both guards.** Write an onChange script on `category` that sets a default `assignment_group` for `network` and clears it otherwise. Deliberately omit the `isLoading` guard first, load an existing record, and record what happens. Then add the guard and confirm the difference.

3. **onSubmit validation.** Block saving a resolved incident whose close notes are shorter than 20 characters, with a useful error message. Then bypass your own validation by updating the same record from a background script, and write down what that proves about client-side validation.

4. **Read the API.** Using one incident form and a temporary onLoad script, print to the console the result of `getValue`, `getDisplayValue`, `isMandatory`, and `isVisible` for `assigned_to` and `priority`. Explain each pair of values in a comment.

5. **Scratchpad path.** Write a display business rule that puts the caller's open incident count on `g_scratchpad`, and an onLoad client script that shows a warning banner when the count is above three. Confirm with the browser network panel that the form load makes no additional request for it.

6. **GlideAjax path.** Rewrite exercise 5's warning so it recalculates whenever the caller field changes, using an asynchronous GlideAjax call to a client-callable script include. Confirm in the network panel that the request happens on change and that the form stays responsive while it is in flight.

7. **Feel the freeze.** In a throwaway client script, call `g_form.getReference('caller_id')` with no callback inside a loop of five iterations. Load the form and try to type while it runs. Delete the script afterwards and describe, in two sentences, what a user on a slow connection experienced.

8. **Decide.** For each requirement, name the tool — UI policy, client script (which type), display rule plus client script, or server-side business rule — and justify it in one sentence: hide a section for users without a role; stop a save when two date fields are out of order; copy a location from the selected caller; require a justification field when risk is high; prevent any user from reopening a closed record.
