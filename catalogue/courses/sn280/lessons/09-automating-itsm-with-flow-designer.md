---
lesson_id: sn280-09
course_id: sn280
pathway: servicenow-implementation-specialist
title: Automating ITSM with Flow Designer
order: 9
kind: lesson
competency_ids:
  - D2-S1-C05
objectives:
  - Automate an ITSM process end to end with Flow Designer and business rules
---

## Choosing the right automation tool

By this point in the course every ITSM process exists as configuration: states, priorities, forms, catalog items, SLAs. What none of them do yet is *run themselves*. This lesson is about the layer that makes a process execute — and the first skill is choosing which mechanism to use, because ServiceNow gives you several and they are not interchangeable.

The decision, stated as a rule and then explained:

| Requirement shape | Use |
| --- | --- |
| A multi-step process with waits, approvals, tasks, and branches | **Flow Designer** |
| Enforce or derive a value at the moment a record is written | **Business rule** |
| Set a value from other fields on the same record, declaratively | **Data lookup or a field default** |
| Change how the form behaves for the person looking at it | **UI policy or client script** |
| Reusable logic called from several places | **Subflow, action, or script include** |
| Work that must happen on a timetable, not in response to a record | **Scheduled job or scheduled flow** |

The two that get confused are Flow Designer and business rules, so be precise about the difference. **A business rule is a moment. A flow is a duration.**

A business rule runs inside the database transaction that writes a record. It starts and finishes in milliseconds, it cannot wait for anything, and if it is slow every user who saves that kind of record waits for it. It is the right tool for "when this record is saved, make sure this field is correct."

A flow is a process with a lifetime measured in hours or days. It creates tasks and waits for them to close. It asks for an approval and waits for a decision. It has state that survives across sessions. It is the right tool for "when a request is submitted, do these seven things in this order."

The single most common ITSM automation error is implementing a multi-step fulfilment process as a chain of business rules — each rule watching for the state produced by the last one. It works, briefly. Then it becomes impossible to answer "where is this request right now," because the process has no representation anywhere; it exists only as the emergent behavior of nine rules whose order is set by a number field.

## Flow Designer: the building blocks

A **flow** is a trigger plus a sequence of actions, with flow logic controlling the sequence.

**Triggers** determine when the flow runs. The ones that matter for ITSM:

- *Record created*, *Record updated*, *Record created or updated* — with a table and a condition. The condition is what keeps the flow from running on every save.
- *Service Catalog* — the item-specific trigger that fires when an RITM is created for a given catalog item. This is what fulfils the design you specified in lesson 7.
- *Scheduled* — daily, weekly, or on a repeating interval.
- *Inbound email* and *Application* triggers, for records arriving from outside the form.

Two trigger settings matter more than they look. **Run once versus run for each unique record** controls re-entry. And the **condition** should be as narrow as you can make it: `state changes to Resolved` rather than `state changes`, because the second one starts a flow context every time anyone touches the record.

**Actions** are the steps. The core set covers record operations (create, update, look up, delete), task generation, approvals (the "Ask for Approval" action, which handles the approval records and the waiting), notifications, and script steps. Beyond these, **spokes** package actions for specific systems and applications — the integration spokes are lesson 11's subject; the ITSM-facing ones give you catalog task creation, CMDB operations, and similar.

**Flow logic** is the control structure: `If`, `Else`, `Do the following in parallel`, `For each item in`, `Wait for a duration`, `Wait for a condition`. Parallel branches matter for real fulfilment — provisioning an account and shipping a laptop have no dependency, and running them sequentially doubles the elapsed time for no reason.

**Data pills** carry values between steps. The trigger record's fields are available as pills, and so is every prior action's output. This is the mechanism that replaces the variable-passing you would write by hand in a script, and it is why a flow is readable by someone who is not a developer.

**Subflows** are reusable flows with defined inputs and outputs, called from other flows. When three catalog items all need the same "notify the requester's manager and wait for acknowledgement" sequence, that is a subflow, built once.

**Actions** (custom ones) are reusable single steps with inputs and outputs — the right home for a piece of logic that several flows need but that is smaller than a subflow.

## Building a fulfilment flow

Take the software access request from lesson 7 and make it run. The design specified: approval by the application owner, then a license check, then either a grant task or a purchase-then-grant sequence.

The flow, step by step:

**Trigger.** Service Catalog trigger on the "Request application access" item. The RITM is the trigger record; the item's variables are available as pills.

**Step 1 — look up the application record.** A Look Up Record action against the application table, matching the RITM's `application` variable. Its output — the application record — becomes a pill carrying the owner and the license count.

**Step 2 — ask for approval.** The Ask for Approval action, with the approver set from the application record's owner field. Configure the approval's rejection behavior explicitly: on rejection, update the RITM stage to Request Cancelled, notify the requester with the rejection comments, and end the flow. A flow that only handles the approved branch will strand every rejected request.

**Step 3 — branch on license availability.** An `If` on the application record's available license count.

- *If licenses are available:* create a catalog task for the identity team to grant access, then Wait for the task to close.
- *Otherwise:* create a catalog task for procurement, wait for it to close, then create the identity task and wait for that.

**Step 4 — close out.** Update the RITM stage to Completed and its state to Closed Complete. Notify the requester.

Three things this flow does that a chain of business rules could not do at all: it *waits*, it *branches on data looked up at runtime*, and it is *visible* — a support engineer can open the flow's execution context and see exactly which step the request is sitting on and why.

Design notes that generalize beyond this example:

**Never hard-code a person or a group.** The approver comes from the application record; the fulfilment groups come from a field, a group lookup, or the CI's support group. A flow with a named user in it breaks the day that user changes role, and it breaks silently.

**Handle the unhappy path in the flow, not in a runbook.** Rejection, task failure, timeout, and missing reference data are all real. At minimum, every wait should have a defined timeout behavior.

**Keep script steps small.** A script step inside a flow is legitimate — for a computation the actions cannot express — but a flow that is one trigger and one 200-line script step is a script wearing a flow costume, with none of a flow's visibility.

## Business rules: the moment of the write

Business rules run server-side around a database operation, and *when* they run is the whole of their design.

| Type | Runs | Use for |
| --- | --- | --- |
| **Before** | Inside the transaction, before the write | Setting or validating fields on the record being saved |
| **After** | Inside the transaction, after the write | Updating *related* records |
| **Async** | After the transaction, on a scheduled worker | Anything slow that the user need not wait for |
| **Display** | Before the form loads | Passing server data to client scripts via the scratchpad |

Two variables define the context: `current` is the record as it will be written, and `previous` is the record as it was. `previous` is only meaningful on update.

The rules that keep business rules from becoming a performance problem:

**Set the condition on the rule record, not in the script.** The `when` and `condition` fields are evaluated cheaply. A rule with no condition whose script begins with an `if` still loads and runs on every single write to that table.

**Use `before` to modify `current`, and never call `current.update()` in a `before` rule.** The write is already happening; calling update again causes recursion.

**Never query in a loop.** One query returning many records beats many queries returning one.

**Put anything slow in an `async` rule.** The user pressed Save; they should not wait for a downstream update.

A correct, small `before` rule — enforcing that a resolved incident linked to a problem cannot be resolved while that problem is still under investigation:

```javascript
(function executeRule(current, previous) {

  // Condition on the rule record: state CHANGES TO Resolved AND problem_id IS NOT EMPTY.
  var problem = new GlideRecord('problem');
  if (!problem.get(current.getValue('problem_id'))) {
    return;
  }

  // Allow resolution only when the problem has a documented workaround
  // or has itself been resolved. getValue returns a string, so convert
  // before comparing numerically.
  var hasWorkaround = !problem.workaround.nil();
  var problemResolved = parseInt(problem.getValue('state'), 10) >= 106; // Resolved or later on this instance

  if (!hasWorkaround && !problemResolved) {
    gs.addErrorMessage(
      'This incident is linked to problem ' + problem.number +
      ', which has no documented workaround. Add a workaround to the problem ' +
      'or unlink the incident before resolving.'
    );
    current.setAbortAction(true);
  }

})(current, previous);
```

Note the parts that make it safe: the expensive condition lives on the rule record so the script only loads when it is relevant; the `get` is guarded; it aborts with a message a human can act on rather than failing silently; and it does one query, not one per related record.

And an `after` rule updating related records — propagating a major incident's resolution to its children:

```javascript
(function executeRule(current, previous) {

  // Condition on the rule record: state CHANGES TO Resolved AND major_incident_state IS accepted.
  var children = new GlideRecord('incident');
  children.addQuery('parent_incident', current.sys_id);
  children.addQuery('state', 'IN', '1,2,3'); // New, In Progress, On Hold only
  children.query();

  while (children.next()) {
    children.state = 6; // Resolved
    children.close_code = current.close_code;
    children.close_notes =
      'Resolved by major incident ' + current.number + '. ' + current.close_notes;
    children.update();
  }

})(current, previous);
```

Before you build this one, check what already runs: the baseline instance ships a business rule that propagates a parent incident's resolution to its children, and a second rule doing the same work will double-update them. Use Debug Business Rule while resolving a parent, and build your own only if the shipped behavior does not match the customer's requirement (deactivating the shipped rule with a recorded reason, as lesson 6 described). Either way, this kind of rule belongs in an `async` rule if the child count can be large, and that judgment — how many related records is too many to process inline — is one you should make explicitly rather than by default. Fifty children in a `while` loop is a noticeable pause for the person who pressed Save.

## Approvals, notifications, and events

Three supporting mechanisms complete the automation picture.

**Approvals** are records on `sysapproval_approver`. Generate them from a flow's Ask for Approval action rather than by script, because the action handles group approvals, the approval-of-approvals rollup, and the waiting. Where an approval must be generated outside a flow, use the approval engine's own mechanisms rather than inserting approver records directly.

**Notifications** are triggered by a record condition or by an **event**. The event-driven form is the better one for automation: the flow or business rule fires an event with parameters, and one or more notifications subscribe to it. This decouples "the thing happened" from "who gets told," so adding a recipient later does not mean editing the automation.

**Scheduled jobs and scheduled flows** handle time-based work with no triggering record: the nightly report of stale problems, the weekly reminder to change owners with unscheduled approved changes. Prefer a scheduled flow over a scheduled script for the same visibility reason as everywhere else in this lesson.

## Testing, debugging, and not breaking production

Automation is the part of an ITSM implementation most likely to fail in ways nobody notices, because it runs without a human watching.

**Test flows before activating them.** Flow Designer's test capability runs a flow against a chosen record and shows the execution path. Use it, and use it on the edge cases — a rejected approval, a missing reference, an empty variable — not just on the happy path.

**Read the execution context.** Every flow run produces a context record showing each step, its inputs, its outputs, and where it currently is. This is your primary debugging tool and it is also what you show a customer who asks where their request is.

**Watch for recursion and loops.** A flow that updates a record whose update triggers the same flow is a real failure and it will consume the instance's scheduler workers. Narrow the trigger condition so the flow's own updates cannot re-trigger it.

**Use the Automated Test Framework for the paths that matter.** A test that submits the catalog item, approves it, closes the tasks, and asserts the RITM's final state is a test that will catch a regression the next time someone edits the flow. Wire it into the release process from lesson 5.

**Deactivate rather than delete** when retiring automation, and record why on the record. A deleted business rule leaves no trace of the requirement it satisfied.

## Practice

Work in a personal developer instance, capturing your work in one named update set.

1. **Tool choice.** For each requirement, name the mechanism you would use and give one sentence of justification. At least two should be something other than a flow:
   - "When an incident is resolved, the caller gets an email."
   - "An incident may not be resolved without a close code, however it was created."
   - "When a P1 incident is created, page the on-call engineer, wait fifteen minutes, and page their manager if it is still unassigned."
   - "Every Monday, email each change manager a list of their approved changes with no scheduled window."
   - "When a change's risk is high, hide the express-approval checkbox on the form."

2. **Build the fulfilment flow.** Implement the software access request flow described in this lesson, against the catalog item you built in lesson 7: look up the application, ask for approval from its owner, branch on license availability, create the appropriate tasks, wait for them, and close the RITM. Do not hard-code any user or group.

3. **Unhappy paths.** Extend that flow to handle rejection and a task that is closed as incomplete. For each, define what the requester is told and what state the RITM ends in. Demonstrate both branches running.

4. **Parallel.** Add a step that must run alongside the fulfilment rather than after it — for example, notifying the requester's manager — using parallel flow logic. Confirm from the execution context that both branches ran.

5. **Subflow.** Extract one reusable sequence from your flow into a subflow with explicit inputs and outputs, and call it from two different flows. State what the inputs are and why you chose them.

6. **Business rule.** Implement the "cannot resolve an incident whose problem has no workaround" rule from this lesson. Put the expensive part of the condition on the rule record, not in the script. Test both the blocked and the allowed case, and confirm the user sees a message they can act on.

7. **Async.** Implement the major-incident child propagation as an `after` rule, then convert it to `async`. Describe what changed from the user's point of view at save time, and state the record-count threshold at which you would insist on async at a customer.

8. **Testing.** Build an Automated Test Framework test that submits your catalog item and asserts that an RITM was created with the expected stage and at least one task. Run it, then deliberately break the flow and confirm the test fails.
