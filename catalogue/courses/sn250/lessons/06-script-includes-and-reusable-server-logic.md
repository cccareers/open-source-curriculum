---
lesson_id: sn250-06
course_id: sn250
pathway: servicenow-implementation-specialist
title: Script Includes and Reusable Server Logic
order: 6
kind: lesson
competency_ids:
  - D7-S1-C01
  - D7-S1-C04
objectives:
  - Package reusable server logic in a script include and call it from other scripts
---

## The problem this solves

By now you have written the same twelve lines twice. A business rule needs to work out whether an incident is eligible for auto-closure; a scheduled job needs the same answer; a flow will want it next month. Copy the block a third time and you have three definitions of "eligible", which will drift apart, and a bug fix that has to be applied in places nobody has an inventory of.

A **script include** is a named, reusable unit of server-side script. You write the logic once, in one record, and every business rule, scheduled job, flow action, Scripted REST API, and client-callable request calls it by name. It is the platform's answer to "where does shared server logic live", and it is also the answer to "how do I make this testable", because a function you can call from a background script is a function you can verify.

There is one more reason that matters operationally: script includes are **loaded on demand**. The platform only evaluates a script include when something references its name. A hundred script includes cost nothing until they are called, whereas a hundred business rules are evaluated for every relevant transaction. Moving logic out of rules and into includes makes an instance faster, not just tidier.

## The record

A script include lives on `sys_script_include`. The fields that matter:

- **Name** — must match the class or function name inside the script exactly. This is not a convention; the loader finds the script by name.
- **API Name** — read-only, generated: `scope.Name` for a scoped application, plain `Name` in global. This is what other scopes call.
- **Client callable** — exposes it to `GlideAjax` from the browser. Off unless you need it.
- **Accessible from** — `This application scope only` or `All application scopes`. The cross-scope switch.
- **Active** — the off switch.
- **Description** — write it. A script include with no description is a black box with a name.

## Three shapes

There are three ways to write one, and picking the right one is most of the skill.

### 1. A single function

The simplest form: the script defines one function with the same name as the record, and callers invoke it directly. No object, no instantiation.

```javascript
function acmeIsEligibleForAutoClose(incidentGr) {
  if (!incidentGr || !incidentGr.isValidRecord()) {
    return false;
  }
  if (incidentGr.getValue('state') !== '6') {   // Resolved
    return false;
  }
  var resolvedAt = new GlideDateTime(incidentGr.getValue('resolved_at'));
  var cutoff = new GlideDateTime();
  cutoff.addDays(-7);
  return resolvedAt.before(cutoff);
}
```

Called from anywhere on the server:

```javascript
if (acmeIsEligibleForAutoClose(current)) {
  current.setValue('state', '7');
}
```

Use this shape for a genuinely single-purpose helper. Its limits show up fast: there is nowhere to put related helpers, nowhere to hold state between calls, and the global namespace gets one more name in it.

### 2. A class

The standard shape. `Class.create()` builds a constructor, and the prototype holds the methods.

```javascript
var AcmeIncidentUtils = Class.create();
AcmeIncidentUtils.prototype = {

  initialize: function (autoCloseDays) {
    this.autoCloseDays = parseInt(autoCloseDays, 10) || 7;
  },

  isEligibleForAutoClose: function (incidentGr) {
    if (!incidentGr || !incidentGr.isValidRecord()) {
      return false;
    }
    if (incidentGr.getValue('state') !== '6') {
      return false;
    }
    return this._olderThanCutoff(incidentGr.getValue('resolved_at'));
  },

  autoCloseResolved: function (limit) {
    var closed = [];
    var gr = new GlideRecord('incident');
    gr.addQuery('state', '6');
    gr.addQuery('active', true);
    gr.setLimit(limit || 500);
    gr.query();

    while (gr.next()) {
      if (this.isEligibleForAutoClose(gr)) {
        gr.setValue('state', '7');
        gr.setValue('close_notes', 'Closed automatically after ' +
          this.autoCloseDays + ' days in Resolved.');
        if (gr.update()) {
          closed.push(gr.getValue('number'));
        }
      }
    }
    return closed;
  },

  _olderThanCutoff: function (dateTimeValue) {
    if (!dateTimeValue) {
      return false;
    }
    var when = new GlideDateTime(dateTimeValue);
    var cutoff = new GlideDateTime();
    cutoff.addDays(-this.autoCloseDays);
    return when.before(cutoff);
  },

  type: 'AcmeIncidentUtils'
};
```

Four structural points, all load-bearing:

- **`initialize`** is the constructor. It runs on `new AcmeIncidentUtils(...)` and receives whatever the caller passed. Use it to accept configuration and set defaults; do not put real work in it.
- **`this`** refers to the instance, so methods call each other with `this.otherMethod()`. Forgetting `this` is the most common error in this shape and produces a "not defined" failure at the moment of the call, not at save time.
- **A leading underscore** on a method name is the platform's convention for "internal, do not call from outside". The language does not enforce it; readers respect it.
- **`type`** is a string naming the class. Keep it, and keep it correct — the platform uses it, and a copy-pasted script include with the wrong `type` is a debugging afternoon.

Calling it:

```javascript
var utils = new AcmeIncidentUtils(14);
var closed = utils.autoCloseResolved(100);
gs.info('Closed ' + closed.length + ': ' + closed.join(', '));
```

### 3. A client-callable class

For `GlideAjax` calls from a client script. The class extends `AbstractAjaxProcessor`, methods read parameters with `this.getParameter(name)`, and the return value goes back to the browser as the answer.

```javascript
var AcmeIncidentAjax = Class.create();
AcmeIncidentAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

  getOpenCountForCaller: function () {
    var callerId = this.getParameter('sysparm_caller');
    if (!callerId) {
      return '0';
    }
    var ga = new GlideAggregate('incident');
    ga.addQuery('caller_id', callerId);
    ga.addQuery('active', true);
    ga.addAggregate('COUNT');
    ga.query();
    ga.next();
    return ga.getAggregate('COUNT');
  },

  getCallerSummary: function () {
    var callerId = this.getParameter('sysparm_caller');
    var summary = { openCount: 0, vip: false, location: '' };

    var user = new GlideRecord('sys_user');
    if (user.get(callerId)) {
      summary.vip = user.getValue('vip') === 'true';
      summary.location = user.getDisplayValue('location');
      summary.openCount = parseInt(this.getOpenCountForCaller(), 10);
    }
    return JSON.stringify(summary);
  },

  type: 'AcmeIncidentAjax'
});
```

Three rules for this shape, and they are security rules, not style:

1. **Return a string.** Objects do not survive the trip. Serialise with `JSON.stringify` and parse in the callback with `JSON.parse`.
2. **Never trust a parameter.** Everything in `sysparm_*` came from a browser and can be anything. Validate it, and never concatenate it into an encoded query without checking what it is.
3. **Assume anyone can call it.** A client-callable script include is reachable by any authenticated user who can craft a request, whether or not your client script is the one asking. If the method returns data some users should not see, check the role — `gs.hasRole(...)` — or query with `GlideRecordSecure`.

That last point deserves emphasis because it is the most common real vulnerability in ServiceNow custom code. A method that takes a table name and an encoded query as parameters and runs them is a general-purpose data exfiltration tool. Return specific answers to specific questions.

## Four shapes worth recognising

Most useful script includes fall into one of four roles. Naming the role before you write helps you keep one responsibility per include.

**A data-access include** wraps the queries for one table or one concept: `findOpenLoansForUser`, `getGroupByName`, `countActiveByCategory`. Callers stop writing GlideRecord entirely, which means the day a field is renamed there is one place to fix. This is the shape that most improves a codebase.

**A rules include** holds the decisions: `isEligibleForAutoClose`, `groupForIncident`, `requiresApproval`. Methods take data and return an answer, touch nothing, and are therefore trivial to test — you can assert on a return value without creating a record.

**A builder include** assembles something for another system to consume: a payload object, a formatted work note, a summary string. Its methods return strings or plain objects, never write, and never log.

**A configuration include** exposes tunable values read from system properties, so that thresholds and lists live in one readable place:

```javascript
var AcmeConfig = Class.create();
AcmeConfig.prototype = {

  initialize: function () {},

  autoCloseDays: function () {
    return parseInt(gs.getProperty('x_acme.auto_close_days', '7'), 10);
  },

  notifyGroups: function () {
    var raw = gs.getProperty('x_acme.notify_groups', '');
    return raw ? raw.split(',') : [];
  },

  type: 'AcmeConfig'
};
```

Notice each method's default. A configuration include that returns `NaN` because a property was never created is worse than a hard-coded number, so every read has a fallback and every fallback is the value that was in the code before you made it configurable.

The shapes compose. A rules include calls a configuration include for its threshold; a business rule calls the rules include; a scheduled job calls a data-access include for the candidate rows and the rules include for the decision. What you should not build is one include doing all four, which is the "Utils" class that grows to 900 lines and that nobody dares change.

## Extending another script include

`Object.extendsObject(Parent, { ... })` sets up inheritance. The child gets the parent's methods and can override any of them.

```javascript
var AcmeMajorIncidentUtils = Class.create();
AcmeMajorIncidentUtils.prototype = Object.extendsObject(AcmeIncidentUtils, {

  isEligibleForAutoClose: function (incidentGr) {
    // Major incidents are never auto-closed.
    if (incidentGr.getValue('u_major') === 'true') {
      return false;
    }
    return AcmeIncidentUtils.prototype.isEligibleForAutoClose.call(this, incidentGr);
  },

  type: 'AcmeMajorIncidentUtils'
});
```

Note the way the parent method is called: through the prototype, with `.call(this, ...)`, so `this` still refers to the child instance. Inheritance is worth using when a genuine specialisation exists. It is not worth using to share two helper functions — that is just a second script include.

## Scope, and calling across it

In a scoped application, the API name is `x_acme_myapp.AcmeIncidentUtils`. Inside the same scope, the short name works. From another scope, you must use the full API name **and** the include's **Accessible from** must be `All application scopes`.

```javascript
// from a different scope
var utils = new x_acme_myapp.AcmeIncidentUtils();
```

Calling a global script include from a scoped application works when it is marked accessible, and that is why `global.AbstractAjaxProcessor` is written out in full in the client-callable example. Calling in the other direction — global script reaching into a scope — follows the same rule.

Default `Accessible from` to `This application scope only` and widen it deliberately. Every include you expose is API surface you have promised not to break.

## Naming, size, and where logic belongs

A few conventions that make a codebase navigable:

- **Prefix with the application**, as the examples do. `IncidentUtils` in a shared instance is a collision waiting to happen; `AcmeIncidentUtils` is not.
- **Name the domain, not the caller.** `AcmeIncidentUtils`, not `AcmeBusinessRuleHelper`. The include should not know or care that a business rule is calling it.
- **One responsibility per include.** When you cannot describe it in one sentence without "and", split it.
- **Methods return values; they do not print.** A method that logs instead of returning cannot be tested or composed. Log at the caller.
- **Guard the inputs.** Every public method should survive being called with `null`, an empty string, or an invalid sys_id, because eventually it will be.

The related judgement is what to leave *out* of the include. A business rule that calls an include should keep its condition — the "should this run at all" test — on the rule record, where it is cheap and visible, and delegate only the work. Moving the condition into the include means the include gets loaded and executed on every transaction just to decide it had nothing to do.

## Documenting the contract

A script include is an interface other code depends on. The description field says what it is for; a comment block above each public method says how to call it. Keep it to the three things a caller actually needs:

```javascript
  /**
   * Returns the sys_id of the group an incident should be routed to.
   *
   * @param incidentGr {GlideRecord} a queried incident record
   * @return {String} a sys_id, or '' when no routing rule applies
   */
```

Parameters, return value, and what happens in the failure case. That last line is the one people omit and the one callers need most: an empty string, a `null`, and a thrown exception demand three different call sites.

Once a method has callers, its signature is a promise. Changing what it returns breaks code you cannot see, particularly for an include marked accessible from all scopes. When a change is genuinely needed, add a new method rather than repurposing the old one, and remove the old one only after you have found and updated its callers — searching the script fields across the instance for the method name is how you find them.

## When not to write one

Three cases where a script include is the wrong instinct:

**A single caller, three lines, never reused.** The indirection costs more than it saves. Put it in the rule and move on. Extract it the day a second caller appears.

**Logic that is really a condition.** A method called `shouldThisRuleRun` means the condition has moved off the rule record, where it was visible and cheap, into a script that must be loaded and executed to answer "no". Keep conditions on the record.

**Configuration masquerading as code.** A method returning a hard-coded list of group names, thresholds, or endpoints is a system property or a small custom table with a code wrapper around it. When the business changes the threshold, they should not need a developer.

The counter-case — when you should absolutely write one — is anything a flow, a rule, and a scheduled job would each want. That is the shape this course keeps producing, and lesson 9's scheduled jobs will assume the logic already lives in an include.

## Testing what you wrote

Two mechanisms, and you should use both.

**Background scripts**, for the fast loop. Because the include is callable by name, you can exercise it directly:

```javascript
var utils = new AcmeIncidentUtils(7);

var gr = new GlideRecord('incident');
gr.get('number', 'INC0010023');

gs.info('eligible: ' + utils.isEligibleForAutoClose(gr));
gs.info('null-safe: ' + utils.isEligibleForAutoClose(null));
gs.info('closed: ' + JSON.stringify(utils.autoCloseResolved(5)));
```

**The Automated Test Framework**, for the loop that survives you. An ATF test with a *Run Server Side Script* step can call the include and assert on the result, so the check runs again the next time somebody edits it. That is the difference between having verified the code once and knowing it still works.

```javascript
(function (outputs, steps, params, stepResult, assertEqual) {

  var utils = new AcmeIncidentUtils(7);
  var gr = new GlideRecord('incident');
  gr.get(params.incident_sys_id);

  assertEqual({
    name: 'Resolved 8 days ago is eligible',
    shouldbe: true,
    value: utils.isEligibleForAutoClose(gr)
  });

})(outputs, steps, params, stepResult, assertEqual);
```

Run tests on a sub-production instance only.

## Worked example: a refactor

Start with the mess. Two business rules on `incident`, written months apart, each containing its own copy of the routing logic:

```javascript
// Rule A: "Route critical incidents" (before update)
var grp = new GlideRecord('sys_user_group');
grp.addQuery('name', 'Network Support');
grp.query();
if (grp.next() && current.getValue('category') === 'network' && current.getValue('priority') === '1') {
  current.setValue('assignment_group', grp.getUniqueValue());
}

// Rule B: "Route on reopen" (after update) — same idea, subtly different
var g2 = new GlideRecord('sys_user_group');
g2.addQuery('name', 'Network Support');
g2.query();
g2.next();
if (current.getValue('category') == 'network') {
  current.setValue('assignment_group', g2.getUniqueValue());
  current.update();
}
```

The defects: the group name is hard-coded twice, the second copy does not check `next()` before using the record, the second copy uses a different condition, and it calls `update()` in an after rule, which recurses.

The include:

```javascript
var AcmeRoutingUtils = Class.create();
AcmeRoutingUtils.prototype = {

  initialize: function () {
    this.groupCache = {};
  },

  /**
   * Returns the sys_id of the group an incident should be routed to,
   * or '' when no rule applies.
   */
  groupForIncident: function (incidentGr) {
    if (!incidentGr || !incidentGr.isValidRecord()) {
      return '';
    }
    var category = incidentGr.getValue('category') || '';
    var priority = parseInt(incidentGr.getValue('priority') || '5', 10);

    if (category === 'network' && priority <= 2) {
      return this.groupIdByName('Network Support');
    }
    if (category === 'hardware') {
      return this.groupIdByName('Hardware Support');
    }
    return '';
  },

  groupIdByName: function (name) {
    if (this.groupCache.hasOwnProperty(name)) {
      return this.groupCache[name];
    }
    var grp = new GlideRecord('sys_user_group');
    var found = grp.get('name', name) ? grp.getUniqueValue() : '';
    if (!found) {
      gs.warn('AcmeRoutingUtils: no group named "' + name + '"');
    }
    this.groupCache[name] = found;
    return found;
  },

  type: 'AcmeRoutingUtils'
};
```

Both rules collapse to a condition on the record plus two lines of script, and both become before rules because the work is field manipulation:

```javascript
var groupId = new AcmeRoutingUtils().groupForIncident(current);
if (groupId) {
  current.setValue('assignment_group', groupId);
}
```

Count what improved. One definition of the routing policy. One place to change the group name. A `next()` check that exists. A cache so a sweep over a thousand records queries the group table twice instead of a thousand times. A warning in the log when a configured group is missing, instead of a silent empty assignment. And a function that a background script or an ATF test can call directly, which none of the original code could.

## Practice

Work in a scoped application on a sub-production instance so the scope behaviour in exercises 6 and 7 is real.

1. **Function include.** Write a single-function script include that takes a duration in seconds and returns a human-readable string like `2d 3h 15m`. Call it from a background script with 0, 59, 3600, and 200000, and with a non-numeric argument, and make sure none of them throw.

2. **Class include.** Convert exercise 1 into a class with `initialize` accepting an options object (for example, whether to include seconds). Keep the formatting method public and put the arithmetic in an underscore-prefixed helper. Confirm both call paths still work.

3. **Refactor real duplication.** Take the two business rules from the worked example, reproduce them on your instance, verify the recursion problem exists, then refactor to the include version. Record the before and after in a comment on each rule.

4. **Guard the inputs.** For the include from exercise 3, write a background script that calls every public method with `null`, `''`, an invalid sys_id, and a GlideRecord that was never queried. Fix whatever throws.

5. **Client-callable.** Write a client-callable include with one method returning a JSON summary of a user: open incident count, VIP flag, and location. Call it from an onChange client script and render the values with `showFieldMsg`. Then call the same method with a made-up sys_id and confirm the client handles the empty answer.

6. **Break the security rule on purpose.** Add a method to your client-callable include that accepts a table name and an encoded query and returns matching records, then use it from the browser to read a table your test user should not see. Delete it, and write three sentences on what you demonstrated.

7. **Cross scope.** Set your include's *Accessible from* to `This application scope only` and try to call it from a global background script. Read the error. Widen it, call it with the full API name, and note both forms in a comment.

8. **Test it.** Write an ATF test with a server-side script step that asserts two behaviours of your routing or formatting include, including one negative case. Run it and confirm it passes; then break the include deliberately and confirm the test fails.

## Check your understanding

1. A script include named `AcmeRouting` contains `var AcmeRoutingUtils = Class.create();`. Why does `new AcmeRoutingUtils()` fail from a business rule? *The loader finds the script by the record's Name; Name and class name must match exactly.*
2. Inside a class method you call `groupIdByName('Network Support')` and get "not defined". What is missing? *`this.` — methods call each other as `this.groupIdByName(...)`.*
3. Why must a client-callable method return a string? *The answer crosses the network to the browser; serialise objects with `JSON.stringify`.*
4. A client-callable method accepts a table name and an encoded query from `sysparm_*`. What is wrong with it? *Any authenticated user can call it with any table and query; it is a data-exfiltration tool. Answer specific questions and check roles or use GlideRecordSecure.*
