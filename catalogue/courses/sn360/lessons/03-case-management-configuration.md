---
lesson_id: sn360-03
course_id: sn360
pathway: servicenow-implementation-specialist
title: Case Management Configuration
order: 3
kind: lesson
competency_ids:
  - D3-S1-C01
objectives:
  - Configure case types, states, and the case lifecycle so support work follows a defined process
---

## The case is a task, and that matters

`sn_customerservice_case` extends `task`. Everything you learned about the task table in the platform fundamentals course still applies: assignment group and assigned to, work notes and additional comments, approvals, SLA attachment, activity formatter, the `state` field as an integer with choice labels. CSM adds the customer half of the record — account, contact or consumer, installed product, entitlement, contract — and a lifecycle tuned for external support rather than internal IT.

Reading the case as "a task with a customer on it" tells you where to configure things. Anything about who does the work is task-shaped and behaves the way it always has. Anything about who the work is for came from lesson 02's data model. The interesting configuration is where the two meet: which states exist, who is allowed to move between them, what has to be true before a case can close, and what the customer sees while all of that happens.

## Case types: one table, several processes

A support organization does not run one process. A password reset, a warranty claim, a billing dispute, and a product defect share a record shape but not a workflow, and the temptation is to solve that by extending the case table once per process. Resist it. Table extension multiplies forms, access controls, reports, and every future upgrade's regression surface.

CSM gives you better tools:

**The case type field** distinguishes the process on one table. Out of the box you will find types along the lines of question, issue, and complaint; on a real engagement you rename and extend that choice list to the customer's language. Case type drives form layout through UI policies, drives routing in lesson 08, and drives which required fields apply at which state.

**Case templates** pre-fill a set of fields for a recurring situation — a standard RMA, a scheduled maintenance request — so the agent starts from a filled form rather than a blank one.

**Case tasks** (`sn_customerservice_task`) carry the sub-work. When resolving a case requires a shipment, a lab diagnosis, and a follow-up call, those are three case tasks under one case, each with its own assignment group and state. The case stays the customer's single view; the tasks are how the internal work divides. Configure whether a case can close with open tasks — the usual answer is no.

Only extend the case table when the *data* genuinely differs, not when the process differs. A warranty claim that needs eight claim-specific fields no other case type uses is a reasonable extension. A warranty claim that needs a different approval path is not.

## The state model

A case's `state` field is where the process becomes visible. The shipped model is roughly:

```text
New          -> the case exists, nobody has picked it up
Open         -> an agent is working it
Awaiting Info -> blocked on the customer
Resolved     -> a fix has been proposed, the customer has not confirmed
Closed       -> terminal
```

Four design decisions live in that list, and every implementation argues about all four.

**Resolved versus Closed.** These are two states because they answer two different questions. Resolved means the agent believes the work is done. Closed means the customer agrees, or enough time has passed that agreement is assumed. Collapsing them destroys your ability to measure reopen rate, which is one of the few honest quality signals in support. Keep both, and configure an auto-close: a scheduled job moves cases from Resolved to Closed after a defined quiet period, typically five to ten business days, and notifies the customer before it does.

**Awaiting Info and the SLA clock.** When the case is waiting on the customer, the customer's response time is not your fault, and your resolution SLA should pause. That pause is configured on the SLA definition, not on the state itself — you will wire it in lesson 04. What you configure here is that the state exists, that moving into it requires a customer-visible comment (otherwise the customer is not actually being asked anything), and that a reminder fires if the customer stays silent.

**Who may move to which state.** State transitions are the part of the lifecycle that most benefits from being declarative. A state flow or a small set of UI policies plus a business rule should encode the legal moves: New to Open on assignment, Open to Awaiting Info only with a comment, anything to Resolved only with a resolution code and resolution notes, Resolved to Open when the customer replies. Encoding these as client-side validation alone is a mistake — the portal, inbound email, integrations, and Virtual Agent all write to cases without going through your form.

**Cancelled.** Decide early whether cancellation is a state or a resolution code. Both are defensible; having both is not. The usual choice is a resolution code under Closed, so that every terminal case is Closed and your cycle-time reports do not need to special-case a second ending.

Here is the shape of the server-side guard for the resolution requirement, as a before-update business rule on the case table:

```javascript
(function executeRule(current, previous) {
  var RESOLVED = 6; // confirm the numeric value in your instance's choice list
  if (current.state == RESOLVED && previous.state != RESOLVED) {
    if (current.resolution_code.nil() || current.close_notes.nil()) {
      gs.addErrorMessage(gs.getMessage(
        'A resolution code and resolution notes are required before resolving a case.'));
      current.setAbortAction(true);
    }
  }
})(current, previous);
```

Two points about that snippet. It reads the *previous* value so it only fires on the transition rather than on every update of an already-resolved case. And it lives on the server, so email replies and portal actions are covered by the same rule as the agent form.

## Channels, interactions, and where cases come from

A case does not only appear because an agent typed one. CSM records the customer's touch as an **interaction** — a phone call, a chat, a portal session, an inbound email — and a case may be created from that interaction and stay linked to it. This linkage is what lets a single customer conversation produce two cases, or lets you measure how many chats resolved without ever becoming a case.

The channels you will typically configure:

- **Portal** — the contact fills a form. Covered in lesson 05.
- **Email** — inbound actions create or update cases. The critical configuration is matching the sender's address to a contact record, and deciding what to do when it does not match: create a contact, reject, or route to a triage queue. Never let unmatched email silently create a case with no account, because that case has no entitlement and no owner.
- **Chat and Virtual Agent** — covered in lesson 07; a conversation that cannot be deflected creates a case carrying its transcript.
- **Phone** — the agent opens an interaction, searches for the contact, and creates a case from it.

Set `contact_type` (or the equivalent channel field) on every path. Case volume by channel is the first thing a service manager asks for, and it is unrecoverable if you did not stamp it at creation.

## Communication: what the customer sees

On a task record, **work notes** are internal and **additional comments** are customer-visible. On an internal incident, mixing them up is embarrassing. On a customer case, it is a contractual incident. Configure with that asymmetry in mind:

- Default the agent's comment field to work notes, so the deliberate act is going public rather than going private.
- Use response templates for the routine customer-facing messages, so tone and required disclosures are consistent.
- Make the case's notification set explicit: a notification when the case is created, when it moves to Awaiting Info, when it is resolved, and when it is auto-closed. Each of those is a promise; do not send others by accident.
- Keep attachments in mind. Anything an agent attaches to the case is visible on the portal unless you restrict it. Decide whether internal diagnostics belong on the case or on a case task.

## Major cases

When one underlying problem generates fifty customer cases, you do not want fifty agents writing fifty updates. CSM supports promoting a case to a **major case** and attaching the others as children. The children inherit updates from the parent: one resolution message propagates, and each child closes with its own record intact for reporting and entitlement purposes.

Configure three things. The criteria that make a case a *candidate* for promotion, so agents get a prompt rather than having to notice. The propagation behavior — which fields and comments flow from parent to child. And the closure rule, since resolving the parent should resolve the children but should not skip their individual resolution codes.

Major case handling is worth setting up even in a first implementation. The day you need it, you will not have time to build it.

## Resolution codes, and why they are worth arguing about

The resolution code is the smallest field on the case and the one that carries the most future value. It is the only structured statement of *what actually happened*, and every quality conversation the customer has six months from now will be built on it.

Which means the choice list deserves a real design session rather than five minutes at the end of one. Three properties make a good set:

- **Mutually exclusive.** If an agent can reasonably pick two, they will pick the first one, and your data becomes a measure of list order.
- **Actionable.** Each value should imply something someone could do differently. "Resolved" implies nothing. "Configuration corrected", "defective part replaced", "customer error, guidance given", "no fault found", "duplicate of another case", "withdrawn by customer" each point somewhere.
- **Short.** Eight to twelve values. Beyond that, agents stop reading and pick from the top.

Watch for the two codes that quietly matter most. **"No fault found"** rising is a signal about diagnostics or about a product's error messages. **"Customer error, guidance given"** rising is a knowledge gap, and it is the single best source of the article candidates lesson 06 depends on. Neither is visible without the code.

Pair the code with mandatory resolution notes written for the customer, not for the next engineer. The notes are visible on the portal, they land in the closure notification, and they are what the customer reads to decide whether to reopen. An agent who writes "fixed per KB0010023" has technically complied and practically failed; a response template per resolution code is the cheapest fix for that.

## Where case lifecycles usually break

Four failure patterns show up on engagement after engagement. Recognizing them early is worth more than any single configuration technique.

**Too many states.** Somebody asks for "Pending Engineering", "Pending Parts", "Pending Vendor", and "Pending Customer" as separate states. Now the SLA pause conditions have four branches, the portal has four labels to map, and reporting has to group them back together. The better model is one blocked state plus a "blocked reason" field. States are for things that change the *process*; attributes are for things that change the *explanation*.

**States that encode who, not what.** "With Tier 2" is not a state; it is an assignment. If your state list reads like an org chart, the process is being modeled in the wrong field, and every reorganization will require a state change and a data migration.

**The unenforced transition.** A rule that exists only as a UI policy or a client script is a rule that email, the portal, Virtual Agent, and every integration ignores. This is the defect that most reliably reaches production, because it is invisible from the agent form where all the testing happened.

**The case that cannot end.** Somewhere there is a state combination — usually resolved-with-an-open-task, or awaiting-info-on-a-contact-who-left — that no configured transition can leave. Find these before go-live by taking each state and asking "what is the exit, and what if the obvious exit is unavailable?" Every state needs at least one exit that does not depend on the customer doing something.

A fifth pattern is worth naming even though it is not configuration: **the lifecycle nobody agreed to.** If two managers give you different answers about when a case may be resolved, you have found a business disagreement, not a requirement. Configuring both answers into the same instance produces a process that satisfies neither. Send it back, in writing, with the two options and their consequences.

## Worked example: designing the lifecycle for one case type

Continue with Northwind from lesson 02. The customer's controller alarms overnight. Take the process the customer actually agreed to and turn it into configuration.

The agreed process: cases are triaged within the SLA, an engineer may request logs from the site, a field replacement may be required, and the customer confirms the fix before closure.

The configuration:

| Requirement | Where it lives |
| --- | --- |
| Case type "Product Issue" drives the form | Choice on `type`, plus a UI policy showing the installed product and symptom fields |
| Requesting logs pauses our clock | State `Awaiting Info`, with SLA pause configured in lesson 04 |
| Asking for logs must ask the customer | Business rule: transition to Awaiting Info requires a new additional comment |
| Field replacement is separate work | Case task of type Dispatch, assigned to the logistics group |
| Case cannot close with the replacement open | Business rule blocking Resolved while open case tasks exist |
| Customer confirms the fix | Resolved state plus auto-close job at 7 days with a prior notification |
| Reopen if the customer disagrees | Inbound email action and portal action set state back to Open, clearing resolution fields |

Notice how little of that is code. One guard rule, one task-count check, one scheduled job, and the rest is data: choices, UI policies, templates, notifications. That ratio is the sign of a healthy CSM build. When the ratio inverts, the process being implemented is usually one the customer has not actually agreed on internally, and the right move is to send it back rather than script around it.

## Practice

1. **Add a case type end to end.** Add a `Product Issue` choice to the case type field. Create a UI policy that makes `installed product` mandatory and shows a symptom field only for that type. Verify the policy does not fire for other types.

2. **Guard the resolution.** Implement the before-update business rule shown above in your instance, confirming the correct numeric state value first. Then prove it works from two directions: try to resolve from the agent form without a resolution code, and try the same update from a background script or a REST call. Both must be blocked.

3. **Build the Awaiting Info discipline.** Configure the transition into `Awaiting Info` so it requires a new customer-visible comment. Write down what should happen if the customer never replies, and implement the reminder as a scheduled job or a flow.

4. **Add a case task dependency.** Create a `Dispatch` case task type. Add a rule preventing the case from reaching `Resolved` while any case task is open. Test with one open task and with none.

5. **Auto-close.** Configure a scheduled job that closes cases resolved more than seven days ago, and a notification sent two days before it happens. Run the job against a backdated test case and confirm both the notification and the state change.

6. **Write the state diagram.** On one page, draw the legal state transitions you have configured with the condition on each arrow. Identify one transition your configuration currently allows that the business process does not, and fix it.
