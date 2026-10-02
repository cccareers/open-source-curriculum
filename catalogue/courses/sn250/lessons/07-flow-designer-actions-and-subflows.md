---
lesson_id: sn250-07
course_id: sn250
pathway: servicenow-implementation-specialist
title: Flow Designer, Actions, and Subflows
order: 7
kind: lesson
competency_ids:
  - D7-S1-C02
  - D2-S1-C05
objectives:
  - Build a flow with actions and subflows, and judge when a flow is a better choice than a script
---

## Automation you can read

Five lessons of scripting have given you a hammer, and the temptation now is to treat every process as a nail. Resist it. A great deal of the automation an implementation specialist is asked for is a *process*: when this happens, ask that person for approval, then wait, then create these three tasks, then notify the requester, and if it is still sitting there in five days, escalate. You can write that as business rules and scheduled jobs. You should not.

**Flow Designer** is the platform's tool for exactly that shape of work. A flow is a trigger plus an ordered set of actions, built in a visual designer, with its execution recorded step by step. It is the default automation tool on the platform now, and the first question for any new automation requirement is "can this be a flow?" — not because scripting is bad, but because a flow is legible to people who will never open your script include, and its run history answers "what happened to this request?" without a debugging session.

This lesson is about building flows well and about the judgement call. It is not about connecting to third-party systems from a flow; integrations are the next lesson's subject and the integration content packs are another course's.

## Anatomy of a flow

A flow has four kinds of part.

**A trigger** — what starts it. One per flow. The common ones:

- *Record created*, *Record updated*, *Record created or updated* — the flow equivalent of a business rule, with a table and a condition. There is also a *Record updated* variant that can wait for a condition to become true.
- *Scheduled* — daily, weekly, monthly, or on a repeating interval.
- *Inbound email* — an email matching a condition.
- *Application* — no automatic trigger; the flow is started by something else, including a script. This is the one that matters for reuse.
- *Service Catalog* — a request item, which is how most catalog fulfilment is built.

**Actions** — the steps. The platform ships a large library: Create Record, Update Record, Look Up Record, Look Up Records, Delete Record, Ask for Approval, Send Notification, Wait for Condition, Log. You can also write your own.

**Flow logic** — the control structures, and they mirror the JavaScript you already know: *If* / *Else If* / *Else*, *For Each* over a list of records, *Do ... Until*, *Wait for Condition*, *Wait for a Duration*, *End Flow*, and *Try / Catch* style error handling via an action's error path.

**Data pills** — how values move. Every trigger and every action publishes outputs, and you drag those outputs into the inputs of later steps. A pill is a typed reference, not a copied value: the *Trigger Record* pill gives later steps access to the record and everything you can dot-walk from it. This is the flow equivalent of a variable, and the fact that you drag it rather than type it is why a flow does not have typos.

## Building the flow

Start with the trigger, because it determines everything downstream.

Give the trigger the narrowest condition that is correct. A *Record updated* trigger on `incident` with no condition fires on every incident update on the instance — the same mistake as a business rule with no condition, with the same cost. Conditions on a flow trigger are evaluated cheaply before any action runs.

Then add actions in order. Three patterns cover most flows:

**Look up, then act on what you found.** *Look Up Records* returns a list; a *For Each* loop iterates it; inside the loop you act on the current item.

**Branch on data.** An *If* with a condition built from data pills, with the alternative path in an *Else*. Flow conditions are built with the same condition builder you use everywhere else.

**Wait, then continue.** *Ask for Approval* pauses the flow until an approver responds, and the flow resumes on the answer. *Wait for Condition* pauses until a record reaches a state. This is the capability scripts genuinely do not have: a business rule cannot wait three days. Anything you write with a script plus a scheduled job that checks whether the script's work has completed is a flow that you have taken apart by hand.

Two settings on the flow itself are worth deliberate thought:

- **Run As** — *User who initiated session* means the flow's actions run with that user's rights, which is what you usually want for a catalog request. *System User* means full rights; use it when the flow must do something the requester cannot.
- **Run in a scoped application** — flows belong to an application like everything else, and a flow in a scope can only reach what the scope can reach.

## Actions: reusable steps you write

When no shipped action does what you need, build an **action**. An action has inputs, a sequence of steps, and outputs, and once built it appears in the action picker for every flow — which makes it the flow layer's equivalent of a script include.

Actions are assembled from steps. The ones you will use most: *Look Up Record*, *Create Record*, *Update Record*, *Delete Record*, and — the escape hatch — **Script**.

A script step is server-side JavaScript with two special objects: `inputs`, holding the action's declared inputs, and `outputs`, which you populate to hand values back to the flow.

```javascript
(function execute(inputs, outputs) {

  var group = new GlideRecord('sys_user_group');
  if (!group.get(inputs.group_id)) {
    outputs.member_count = 0;
    outputs.manager_email = '';
    return;
  }

  var members = new GlideAggregate('sys_user_grmember');
  members.addQuery('group', inputs.group_id);
  members.addAggregate('COUNT');
  members.query();
  members.next();

  outputs.member_count = parseInt(members.getAggregate('COUNT'), 10);
  outputs.manager_email = group.manager.email.toString();

})(inputs, outputs);
```

Declare `group_id` as an input and `member_count` and `manager_email` as outputs on the action record, and the flow can drag those outputs into any later step.

Two disciplines for script steps. **Keep them small**: a script step that runs 200 lines has taken the process back out of the flow and hidden it, which defeats the point of building a flow at all. And **do the querying and the branching in flow logic where you can** — a *Look Up Records* action plus a *For Each* is more readable than the same loop in a script step, and its results appear in the execution log.

If a script step is getting long, the right move is usually to put the logic in a **script include** and have the step call it in three lines. You get the flow's legibility and the include's testability at once.

## Subflows

A **subflow** is a flow with declared inputs and outputs that other flows call as a single step. Same relationship as a function to a program.

Build a subflow when:

- The same sequence appears in more than one flow — the offboarding steps that both the termination flow and the transfer flow need.
- A flow has grown past what fits on a screen, and a coherent chunk of it can be named. "Provision Standard Access" as one step reads better than eleven steps inline.
- A sequence needs its own error handling and its own tests.

A subflow declares inputs (typed: a reference to a record, a string, a boolean) and outputs, and the calling flow maps pills into the inputs and consumes the outputs. Keep the input list short and specific; a subflow taking eight inputs is usually two subflows.

Subflows can also be called **from a script**, which is the bridge between the two halves of this course:

```javascript
try {
  var inputs = {};
  inputs.incident_record = current;              // a GlideRecord for a reference input
  inputs.escalation_reason = 'No update in 3 days';

  sn_fd.FlowAPI.getRunner()
    .subflow('x_acme_myapp.escalate_incident')
    .inBackground()
    .withInputs(inputs)
    .run();

} catch (e) {
  gs.error('Could not start escalation subflow: ' + e.getMessage());
}
```

`inBackground()` starts it asynchronously and returns immediately, which is what you want from a business rule. The synchronous alternative, `.inForeground()`, blocks until the subflow finishes and gives you access to its outputs — use it only when you truly need the result inside the current transaction, and never inside a user's save if the subflow contains a wait.

The reverse direction — a flow calling a script include through a script step — you have already seen. Between them, these two calls mean "flow or script" is never an all-or-nothing decision.

## Choosing: flow or script

The honest version of the decision:

| Choose a flow when | Choose a script when |
| --- | --- |
| The requirement is a multi-step *process* | The requirement is one calculation or one field |
| It involves approvals, waits, or notifications | It must complete inside the current transaction |
| Non-developers need to read or amend it | The logic is intricate, conditional, and data-heavy |
| You want per-execution run history for free | It must run on every write with no path around it |
| It is triggered by a catalog request | It must reject a save |
| Steps may be reordered as the business changes | Performance is critical and the work is measured in milliseconds |

Some concrete calls. Field manipulation on save is a before business rule, always — a flow cannot change the record being written before it is written. Validation that must not be bypassed is a business rule, because a flow triggers after the write. A three-approval provisioning process is a flow, and writing it as business rules with state fields is how you build something nobody can maintain. Recalculating a rolled-up count is a script, in an async rule.

And the combination is normal and correct: a before business rule stamps a field, and an *Application*-triggered subflow started from an async rule runs the process. Neither tool is a badge of seniority.

## The legacy Workflow Editor

You will meet **Workflow**, the older graphical automation tool, on nearly every established instance. Its records live on `wf_workflow`, it is edited in a drag-and-drop canvas of activities joined by transitions, and it supports scripting through activities and conditions.

What you need to know about it, and no more:

- **Do not build new automation in it.** Flow Designer is where new work goes.
- **You will maintain existing workflows.** Read the canvas, find the activity that stalled, and fix it. Published versions are immutable — you check out a workflow, edit the checked-out copy, and publish, and forgetting to publish is why "my change did nothing".
- **The two can coexist** on the same table. A record can be driven by a legacy workflow while a new flow handles a different trigger on the same table, which is a real source of confusion when a record moves and nobody can find what moved it. When you inherit a table, check both.
- **Migration is a project, not a task.** Rebuilding a workflow as a flow means re-testing the process end to end. It is a decision made with the process owner, not something you do opportunistically while fixing a bug.

That is the maintenance context. Everything else in this lesson assumes Flow Designer.

## Testing and reading what happened

Flow Designer has a **Test** button that runs the flow against a record you pick, and every run — test or real — produces an **execution detail** record showing each action, its inputs, its outputs, and how long it took.

Read those details rather than guessing. The three questions they answer immediately: which step failed, what the pill actually contained when it got there (usually the answer is "empty, because the lookup found nothing"), and whether the flow is waiting rather than broken. A flow paused at an approval looks identical to a stuck flow until you open the execution details.

Test with the trigger condition in mind. A flow that works from the Test button and never fires in real use has a trigger condition problem, not a flow problem — and the flow's own history will be empty, which is itself the diagnostic.

## Worked example: a laptop replacement request

The requirement: *a user requests a replacement laptop. If the estimated cost is over 1500, the requester's manager approves. On approval, create a fulfilment task for the hardware group, wait until it is closed, then notify the requester and mark the request complete. If no approval decision arrives in five business days, notify the manager again and escalate.*

Decomposed:

**Trigger** — Service Catalog, on the request item.

**Step 1: If** cost is over 1500 → **Ask for Approval**, approver dot-walked from the trigger record's requester to their manager. Under 1500, skip it. The branch is flow logic; nothing is scripted.

**Step 2: the escalation timer** — the approval action's own reminder/duration settings, or a *Wait for Duration* on a parallel path plus a *Send Notification*. Either way it is configuration. Note what you did *not* do here: no scheduled job scanning for stale approvals.

**Step 3: Create Record** on the task table, assigned to the hardware group, description built from trigger-record pills.

**Step 4: Wait for Condition** on that created task, until its state is Closed Complete. The flow sleeps — possibly for days — costing nothing.

**Step 5: a custom action** — *Summarise Fulfilment* — with a script step that gathers the closing details into two output strings. This is where a script belongs in a flow: a small, named, testable transformation, not the process.

**Step 6: Send Notification** to the requester with those outputs, then **Update Record** to close the request.

**The subflow** — steps 3 to 5 also appear in the monitor-replacement flow and the docking-station flow. Extract them into a subflow taking the request record and an asset type, returning the fulfilment summary. Three flows, one definition of fulfilment.

Now count the scripting: one script step, maybe fifteen lines. Written as scripts, this requirement would be a business rule to create the task, a second to detect closure, a scheduled job to find stale approvals, a state field to track where a request had got to, and no run history at all. That comparison is the objective of this lesson.

## Practice

Work on a sub-production instance, in a scoped application.

1. **A first flow.** Build a *Record created* flow on `incident` with the condition `category is network`, that logs a message and adds a work note naming the caller. Trigger it by creating a record, then open the execution details and read every step's inputs and outputs.

2. **Branching and looping.** Extend it: look up all active incidents for the same caller, and if there is more than one, add a work note listing their numbers. Use *Look Up Records*, *If*, and *For Each* — no script step.

3. **A custom action.** Build an action with one input (a group reference) and two outputs (member count and manager email), implemented with a script step as in this lesson. Use it in the flow from exercise 1 and confirm the outputs appear as pills.

4. **Move the logic out.** Rewrite that action's script step so the real work lives in a script include and the step is three lines. Test the include from a background script, and note in a comment why this version is easier to verify.

5. **A subflow.** Build a subflow taking an incident reference and a reason string, which adds a work note, raises the escalation field, and returns the new escalation level. Call it from two different flows and confirm both get the output.

6. **Script to flow.** Start the subflow from a business rule with `sn_fd.FlowAPI.getRunner()` and `inBackground()`. Confirm from the execution details that the subflow ran and that the user's save did not wait for it.

7. **A wait.** Build a flow that creates a task and uses *Wait for Condition* until the task is closed, then notifies the requester. Leave it waiting overnight, then close the task and confirm the flow resumed. Write two sentences on how you would have implemented this with scripts alone.

8. **Read a legacy workflow.** Find an existing workflow on your instance, open the canvas, and describe its activities and transitions in plain English in a comment. Do not modify it. Then state which parts would map to flow logic and which would need a custom action.

9. **Make the call.** For each requirement, choose flow or script and justify it in one sentence: set a due date from a priority on save; route a purchase over a threshold through two approvals; block a save when a mandatory relationship is missing; create four onboarding tasks when a start date is confirmed; recompute a daily rollup for reporting; notify a manager if a task is untouched for 48 hours.
