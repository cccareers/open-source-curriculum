---
lesson_id: sn201-06
course_id: sn201
pathway: servicenow-implementation-specialist
title: Automating the Application with Flow Designer
order: 6
kind: lesson
competency_ids:
  - D7-S1-C02
  - D2-S1-C05
objectives:
  - Automate an application process with Flow Designer
---

## Where a business rule stops being the right tool

In lesson 5 you wrote a rule that updated a parent record when a child closed. That was a good use of a business rule: one trigger, one condition, one immediate effect, no waiting.

Now consider what the facilities manager actually asked for:

> "When a work order needs a contractor, it should go to me for approval. If I approve it, assign it to the contractor coordination group and email the requester. If I reject it, put it back to New with my reason on it. And if I haven't answered in two business days, remind me."

Try to write that as a business rule. You immediately need to *wait* — for a human, and then for a clock. A business rule runs and finishes; it has no memory and nowhere to stand while it waits. You would end up storing approval state in fields, adding a scheduled job to check for overdue ones, and scattering the logic across four artifacts that nobody can see as a single process.

That is the boundary. **A business rule is an event handler. A flow is a process.** The moment your requirement contains the words "then wait," "for approval," "after two days," or "if they don't respond," you are describing a process, and Flow Designer is the tool.

A word on the older tool. The **Workflow Editor** modelled the same idea with a drag-and-drop canvas and is still present on most instances running long-lived processes. You will meet it in maintenance work, and it is worth being able to read one. For anything new, Flow Designer is the current tool, and it is what this course builds in.

The other half of this lesson's competency — **Scripted REST APIs** — is about exposing your application's automation to systems *outside* the instance. That is integration work, and it belongs to the integration courses later in this pathway. Here, the automation you build stays inside the platform.

## Anatomy of a flow

A flow has four kinds of part.

**A trigger.** One per flow. It decides when the flow starts.

| Trigger type | Fires when |
| --- | --- |
| Record — Created | A record matching a condition is inserted |
| Record — Updated | A matching record is updated |
| Record — Created or Updated | Either |
| Scheduled | On a repeating or one-off schedule |
| Date | Relative to a date field on a record |
| Application / Inbound | Another part of the platform asks for it |

Record triggers carry a **condition**, and the same discipline applies as with business rules: filter at the trigger, not inside the flow. A flow that starts on every update and then immediately checks whether it should have started is a flow that runs thousands of times a day for nothing.

Record triggers also carry a **run-as** setting — as the user who triggered it, or as the system user. This matters more than it looks, and lesson 7 explains why: a flow running as the triggering user can only do what that user is permitted to do.

**Actions.** The steps. The platform ships a large library, and these carry most application automation:

- **Create Record**, **Update Record**, **Delete Record**
- **Look Up Record** (one) and **Look Up Records** (many)
- **Ask for Approval**
- **Send Email** / **Send Notification**
- **Create Task** and **Wait for Condition**
- **Log** — the humble one, and the one that makes flows debuggable

**Flow logic.** Structure rather than work:

- **If / Else If / Else** — branching.
- **For Each** — iterate over a list of records from a Look Up Records step.
- **Do Until** — repeat while a condition holds.
- **Wait For Condition** and **Wait For Duration** — pause the flow, resume later. This is the capability a business rule fundamentally does not have.
- **Parallel** — run branches concurrently.

**Data pills.** Every step publishes its outputs, and later steps consume them by dragging a pill rather than typing a reference. The trigger publishes the record that started the flow; a Look Up publishes what it found; an Ask for Approval publishes the approval state and the approver's comments. The data panel beside the canvas lists everything currently available.

Data pills are why Flow Designer is genuinely low-code. You are not writing `current.assigned_to.email`; you are dragging *Trigger → Work Order → Assigned to → Email* into a field. The dot-walk you learned in lesson 3 is the same idea, presented as a picker.

## Building the contractor approval flow

Here is the manager's requirement, expressed as a flow. Build it in your application's scope so it travels with the app.

**Name:** Work Order — Contractor Approval
**Trigger:** Record — Updated on `work_order`, condition `Requires contractor is true AND State is New`, run as System User.

**Step 1 — Log.** Text: `Contractor approval started for [Trigger → Work Order → Number]`. Put a log step at the start of every flow you build. It costs nothing and it is the difference between "the flow didn't work" and "the flow ran and took the else branch."

**Step 2 — Update Record.** Record: the trigger record. Set `State` to `Assigned`. This gives the requester immediate feedback that something is happening.

**Step 3 — Ask for Approval.** Record: the trigger record. Approver: the facilities manager group. Rule: anyone approves. This step *pauses the flow* until an answer arrives; the flow's stored state survives restarts, upgrades, and weeks of waiting.

**Step 4 — If.** Condition: `Step 3 → Approval state` is `Approved`.

Inside the If branch:

- **Update Record** — set `assignment_group` to the contractor coordination group and `State` to `Assigned`.
- **Send Notification** — to the trigger record's `requested_by`, telling them the contractor visit is approved and giving the work order number.

Inside the Else branch:

- **Update Record** — set `State` to `New`, `requires_contractor` to false, and append the approver's comments to `work_notes`. The comments arrive as a data pill from Step 3.
- **Send Notification** — to `requested_by`, explaining the request was declined and quoting the reason.

**The reminder.** The "remind me after two business days" part is not a fifth step. The Ask for Approval action has its own reminder and escalation configuration, and using it is better than bolting a Wait onto the side, because the reminder stops automatically when the approval is answered. Configure it on the step.

That is the whole process, in one artifact, readable top to bottom by someone who has never seen your application. Compare that to the four-artifact business rule version you sketched at the start of the lesson.

## Testing a flow

Flows have a real test story, and using it separates people who ship automation from people who hope.

**The Test button** runs the flow against a record you pick, without the trigger firing. It is the fastest loop while building. Be aware of one trap: testing does not always exercise the trigger condition, so a flow that tests perfectly can still never fire in production because its condition is wrong. Always follow a successful test with a real end-to-end run.

**Execution details** — the flow's run history — shows every step of every execution: which branch it took, what each data pill contained, how long each step waited, and where it failed. When someone tells you the automation is broken, this is the first place you look, and usually the last.

A checklist for testing an approval flow specifically:

1. Trigger it and confirm it reaches the approval step and *stops there*.
2. Approve, and confirm the approved branch ran and the notification went out.
3. Trigger a second one and reject, confirming the else branch and the comments landing in work notes.
4. Trigger a third and change the record in a way that should *not* have started a flow — confirm nothing ran.
5. Read the execution details for all four and check no step logged an error you were not expecting.

Step 4 is the one people skip. An over-firing flow is worse than one that never fires, because it does real damage quietly.

## Flows and errors

Two failure modes bite new flow builders.

**Permission failures.** A flow running as the triggering user can only read and write what that user can. A technician triggering a flow that updates a manager-only field will see the flow fail on that step, with an access error in the execution details. The fix is usually to run the flow as System User — but do that deliberately, understanding you have just given the flow more authority than the person who triggered it.

**Nothing to act on.** A Look Up Records step that finds nothing does not error; it returns an empty list, and a For Each over an empty list does nothing at all. That is correct behaviour and a common source of "it silently did nothing." Add a Log step inside the loop while you are developing so you can see how many times it ran.

Prefer to handle the foreseeable cases with explicit If logic rather than letting a step fail. A flow that ends cleanly on a branch you wrote is debuggable; a flow that ends on an error is an incident.

## Reuse: subflows and actions

Two mechanisms keep flows from sprawling.

A **subflow** is a flow called by another flow, with defined inputs and outputs. When three of your flows all need "notify the requester and stamp the notification date," that becomes a subflow they all call.

An **action** is a reusable step — the same idea one level down. You build one when a piece of work is genuinely atomic and you want it in the palette alongside the platform's own actions.

Both are worth knowing about now and worth using sparingly. Extract a subflow when you have *actually* repeated yourself twice, not in anticipation. Premature extraction produces a set of tiny flows that are collectively harder to follow than the duplication they replaced.

## Choosing between a flow and a business rule

The decision is usually clear once you ask three questions.

| Question | If yes |
| --- | --- |
| Does it need to wait — for a person, a date, or a condition? | **Flow** |
| Does it involve approvals, notifications, or generated tasks? | **Flow** |
| Does a non-developer need to read or adjust the process? | **Flow** |
| Is it a single immediate field change on the record being saved? | **before business rule** |
| Must it run on *every* write, including from integrations and background jobs? | **Business rule** |
| Does the user need to be blocked from saving? | **before business rule** |

The last two matter. A flow triggered on record update runs *after* the record is committed, so it cannot prevent a bad save — only react to one. If your requirement is "this must never be saved in that state," it is a business rule or a data policy, and it may sit alongside a flow that handles the process afterwards. Those two are not competitors; a well-built application usually has both.

## Practice

Work in the `Facilities Work Orders` application, with the application picker on your scope so the flow is owned by the app.

1. **Create the prerequisites.** Create a `Facilities Managers` group and a `Contractor Coordination` group, each with at least one member you can impersonate. Confirm `requires_contractor` and `work_notes` are on your form.

2. **Build the flow.** Implement Work Order — Contractor Approval exactly as described: trigger with a condition, opening log step, state update, Ask for Approval, and an If/Else with the approved and rejected branches. Configure the approval step's reminder for two days.

3. **Test the happy path.** Trigger the flow with a real record, confirm it pauses at the approval, approve as a manager, and confirm the assignment group changed and the notification was generated. Read the execution details end to end.

4. **Test the rejection path.** Trigger a second work order, reject it with a comment, and confirm the state returned to New, `requires_contractor` cleared, and the approver's comment landed in `work_notes` from the data pill — not typed in by you.

5. **Test that it does not over-fire.** Update a work order that does *not* require a contractor. Confirm no flow execution exists. Then update one that already went through approval and confirm it does not start a second time — if it does, your trigger condition needs the state clause.

6. **Add a scheduled reminder.** Build a second, small flow with a Scheduled trigger that runs daily, looks up all work orders in state In Progress whose `scheduled_for` is in the past, and sends a digest to the assignment group. Put a Log step inside the loop so you can see how many records it found.

7. **Argue the boundary.** Your lesson 5 rule that stamps `work_started` could be rebuilt as a flow. Write three or four sentences explaining why it should not be — reference at least two rows of the decision table above.

8. **Stretch.** Extract the "notify the requester" steps from both branches into a subflow with the work order and a message as inputs, and call it from both. Then say honestly whether the flow is easier or harder to read than before, and why.
