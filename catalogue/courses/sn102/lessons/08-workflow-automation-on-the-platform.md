---
lesson_id: sn102-08
course_id: sn102
pathway: servicenow-implementation-specialist
title: Workflow Automation on the Platform
order: 8
kind: lesson
competency_ids:
  - D2-S1-C05
  - D7-S1-C02
objectives:
  - Explain how workflow automation moves work through the platform without manual handoffs
---

## The handoff problem

Everything you have seen so far is a record sitting in a table. The reason organizations buy this platform is what happens to that record *next*.

Picture the manual version. An employee emails a manager to ask for a licence. The manager replies "approved" and forwards it to IT. Someone in IT sees the forward, buys the licence, and emails the employee. Then a week later, somebody asks how long licence requests take and nobody can answer, because the process lived in four inboxes.

Every failure in that story is a **handoff** — a moment where work stops moving until a human notices and forwards it. Handoffs lose things, they add hours of waiting to minutes of work, and they leave no record of what happened.

Workflow automation removes handoffs by making the *platform* the thing that notices. When a record changes state, the platform decides what happens next, does the parts that can be done automatically, creates tasks for the parts that need a person, waits for the answers it needs, and records every step. The employee, the manager, and the IT fulfiller each do their own piece; nobody forwards anything.

## Two mental models: trigger-action and process

Automation on ServiceNow comes in two shapes, and telling them apart is most of what this lesson is for.

**Trigger-action automation** is small, immediate, and invisible. Something happens to one record, and a rule fires that adjusts that record or does one thing. "When priority is set to critical, notify the on-call group." "When state changes to resolved, stamp the resolution time." These are single events with single consequences, they run in a fraction of a second, and they leave no visible artifact except their effect.

**Process automation** is long-running, multi-step, and visible. A request needs an approval, then a provisioning task, then a confirmation email, and the whole thing may take four days because a human has to sleep at some point. This kind of automation has to *wait*, has to survive the waiting, and has to show you where a given record has got to.

The platform has different tools for each, and picking the wrong one is the most common design error a new implementer makes. A four-day approval process is not a business rule. A one-line field default is not a flow.

## The trigger-action tools

**Business rules** are the platform's server-side event handlers. A business rule is a record that says: on this table, when this database operation happens (insert, update, delete, query), if this condition is true, do this. The "when" has four settings, and they matter:

- **Before** — runs after the user clicks save but before the row is written. Used to adjust values on the record being saved, because you are changing it in flight and no second write is needed.
- **After** — runs once the row is written. Used to act on *other* records, or to trigger something downstream.
- **Async** — runs after the write, on a background queue, so the user is not kept waiting. Used for anything slow.
- **Display** — runs before the form is shown to the user, to prepare information for the page.

Business rules can be entirely condition-based, and many useful ones contain no code at all. The ones that do contain code are read far more often than they are written, and scripting is a later course; what you need now is to recognize a business rule when you see one and know which "when" it runs at.

Two important relatives share the same idea. **Query business rules** add conditions to every read of a table, which is the mechanism mentioned in the access-control lesson for filtering what a user can see. And **client scripts** and **UI policies** are the browser-side equivalents — they react to what a user does on a *form*, before anything is saved, which is why a field can grey out the instant you pick a category. Remember the rule from lesson 5: client-side behavior is usability, not security.

## The process tools

**Flow Designer** is the platform's current process automation tool, and it is where new automation is built. A flow is assembled in a visual editor from four kinds of piece:

```text
Trigger    when a record is created or updated, on a schedule,
           or when an application calls the flow

Conditions the trigger's filter: which records qualify

Actions    the steps: create a record, update a record, ask for
           approval, send a notification, wait for a condition,
           look something up, call a subflow

Data       each step's outputs, available to every later step
```

Two ideas make Flow Designer worth its own vocabulary. **Actions** are reusable building blocks; you can assemble an action from steps and then use it in many flows, and the platform ships hundreds of them. **Subflows** are whole flows callable from another flow, which is how a common approval pattern gets written once. And a flow can genuinely **wait** — for an approval, for a duration, for a condition to become true — for as long as it needs, surviving restarts and upgrades.

The part that pays for itself is the **execution log**. Open a flow's execution history for a specific record and you see every step, the data at each step, how long each took, and exactly where it is currently stuck. When someone asks why a request has not been fulfilled, that screen is the answer, and no equivalent exists in the email version of the process.

There is also the older **Workflow Editor**, a drag-and-drop canvas of activities joined by transitions. You will meet it in real instances because a great deal of existing automation — much of it in the service catalog — was built there, and it continues to run. New work goes in Flow Designer. Being able to open an existing workflow, follow its transitions, and understand what it does is a genuine job skill even though you will not author new ones.

**Integration Hub** extends flows outward: it provides **spokes**, which are packaged sets of actions for external systems, so a flow can create a ticket in another tool or read a record from a directory as an ordinary step. When no spoke exists and the platform needs to *offer* an interface rather than consume one, a **Scripted REST API** is the tool — a custom web endpoint that an outside system calls, with the developer defining the resources and what they return. Recognize the name and what it is for; building integrations is a separate course in this pathway.

Two smaller tools round out the set. **Scheduled jobs** run something on a timetable rather than in response to an event — nightly cleanups, weekly reports, monthly reminders. **Notifications** send email or push messages, triggered by an event or called from a flow, using templates so the wording lives in one place.

## Choosing the right tool

The decision is usually straightforward once you ask three questions: does this react to a record event or to the clock, does it need to wait for a human, and does anyone need to see where it got to.

| Need | Tool |
| --- | --- |
| Set a field on the record being saved | Before business rule |
| Update a related record when this one changes | After business rule |
| Do something slow without making the user wait | Async business rule |
| Hide or require a field on a form | UI policy or client script |
| Approvals, tasks, and waiting, across days | Flow Designer |
| Maintain existing catalog automation | Workflow Editor |
| Call an external system as a step | Flow Designer with Integration Hub |
| Let an external system call the platform | Scripted REST API |
| Run something nightly | Scheduled job |
| Tell someone about it | Notification |

The one-sentence version: **if it waits, it is a flow; if it reacts, it is a rule.**

## Worked example: the licence request, automated

Take the email process from the opening and rebuild it as the platform would run it.

An employee opens Employee Center and submits the "Software Licence" catalog item, choosing the product and giving a business justification. Submitting creates a request (REQ) and one requested item (RITM). Nobody has been emailed and nothing has been forwarded.

The RITM's creation is a **trigger**. A flow is defined on the requested item table, with a condition limiting it to this catalog item, so this record and no other kicks it off.

```text
Trigger:  Requested Item created, where Catalog item is "Software Licence"

Step 1    Look up the requester's manager
Step 2    Ask for approval from that manager        <-- waits
Step 3    If rejected: update the item to Closed Incomplete,
          notify the requester, end
Step 4    If the licence costs more than the threshold,
          ask for approval from the cost centre owner  <-- waits
Step 5    Create a catalog task for the Software Asset group
Step 6    Wait for the catalog task to be closed        <-- waits
Step 7    Update the requested item to Closed Complete
Step 8    Notify the requester
```

Step 2 is the interesting one. The flow stops. It might stop for four days. The manager sees the approval in their own approvals list, or in an email with approve and reject buttons, or on their phone — and when they act, the flow resumes at exactly the point it paused. Nobody chased anybody.

Step 4 shows conditional branching doing real work: cheap licences skip a whole approval, expensive ones do not, and the rule about which is which lives in one visible place rather than in a manager's memory.

Step 5 hands work to a human deliberately, as a **task record** in a group's queue rather than as an email in one person's inbox. If that person is on holiday, a colleague picks it up, because it was never addressed to an individual.

Alongside the flow, a small amount of trigger-action automation does the unglamorous work: a **before business rule** stamps a due date from the catalog item's fulfillment target when the item is created, and a **UI policy** on the catalog form makes the justification field mandatory when the requested product is in the expensive category. Neither belongs in the flow — they are instantaneous field-level behavior, not process.

Now ask the question nobody could answer in the email version: how long do licence requests take, and where do they get stuck? Every step is a record. The approval has a timestamp. The catalog task has an assignment group and a duration. The flow's execution log shows which step each in-flight request is sitting on. The report writes itself, and the answer — "eighty percent of the elapsed time is the manager approval" — tells the organization exactly what to fix next.

That is the whole argument for workflow automation. It is not that the machine does the work. It is that the work stops disappearing between people.

## Practice

Use a personal developer instance. Build only in your own instance; do not modify anything you did not create.

1. **Read an existing flow.** Open Flow Designer and find a flow that ships with the instance. Identify its trigger, its trigger conditions, and its steps in order. Write down which steps wait for a human and which run immediately. Then open its execution history and read one past run start to finish.

2. **Read an existing business rule.** Open the business rule list and filter to the incident table. Find one rule that runs **before** and one that runs **after**. For each, write down its condition and, in one plain sentence, what it does. Then explain why each one is at the "when" it is, and what would break if you swapped them.

3. **Build a small flow.** In your own instance, create a flow triggered when an incident is updated and its priority becomes critical. Give it two steps: post a work note on the incident, and send a notification to yourself. Activate it, then create or edit an incident to fire it. Confirm the result on the record and then read the run in the execution log.

4. **Add a wait.** Extend the flow from exercise 3 with an approval step addressed to your own user, placed before the notification. Fire it again. Observe that the flow pauses, find the pending approval in your approvals list, approve it, and confirm the flow resumed. Note where in the execution log the pause is visible.

5. **Tool selection drill.** For each requirement, name the tool you would use and give a one-sentence reason: (a) the short description must be copied into a custom field whenever an incident is saved; (b) a change request needs sign-off from two managers before it can be scheduled; (c) every night at 2 a.m., close resolved incidents older than seven days; (d) the "resolution notes" field must become mandatory the moment a user selects the Resolved state on the form; (e) an external ticketing system needs to create records in your instance; (f) when a critical incident is created, a message must be posted to the on-call channel in an external chat tool.

6. **Find the handoffs.** Write down a process you have personally been part of, at work or elsewhere, that ran on email or messaging. List every handoff in it. For each handoff, say whether it would become a flow step, a task record, an approval, or a notification, and identify the one place the process most often stalled. One page is plenty.
