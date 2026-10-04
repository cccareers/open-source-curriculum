---
lesson_id: sn330-06
course_id: sn330
pathway: servicenow-implementation-specialist
title: 'Lifecycle Events: Onboarding and Offboarding'
order: 6
kind: lesson
competency_ids:
  - D4-S1-C03
objectives:
  - Design a lifecycle event that coordinates onboarding or offboarding activities across departments
---

## When one case is not the right shape

An employment verification letter is one request, one team, one outcome. Onboarding is not. A single new hire triggers a background check, an equipment order, account provisioning, a badge, a desk, a payroll enrollment, a benefits election window, a policy acknowledgement, a manager checklist, and a first-week schedule — owned by at least five departments, spread across three weeks, with dependencies between some of them and none between others.

You could model that as a case with thirty tasks. Implementations that do this discover the same four problems:

- **Conditionality is unmanageable.** The relocation tasks apply to about one hire in twenty. The visa tasks apply in some countries. As task-creation conditions on one case, this becomes a thicket nobody will touch.
- **Timing has no anchor.** Tasks need due dates relative to the *start date* — background check ten days before, equipment shipped five days before, orientation on day one, benefits election by day thirty. A flat task list has no such anchor.
- **The employee has no view.** A new hire needs their own checklist, and they may not have an account until day one.
- **Reuse is zero.** Offboarding, transfer, promotion, and return from leave are the same shape with different content, and a bespoke thirty-task case gives you nothing to reuse.

**Lifecycle events** exist for exactly this shape: a milestone in an employee's relationship with the company that triggers a coordinated, conditional, time-anchored set of activities across departments.

## The structure

Four objects, nested.

A **lifecycle event** is the definition: "Onboarding," "Offboarding," "Employee Transfer," "Return from Leave." It names the milestone and holds the configuration common to every run of it.

An **activity set** groups activities that belong together and share a condition and a timing anchor. "Pre-Start Provisioning," "Day One," "First Thirty Days," "Relocation," "Visa Sponsorship" are activity sets. The activity set is the unit of conditionality — this is the key idea of the whole model.

An **activity** is one unit of work: an HR task, a catalog request, an approval, a knowledge acknowledgement, a to-do for the employee, or a trigger into a flow or integration. Activities have their own assignment, their own timing, and their own optional condition.

A **lifecycle event case** is one run of the definition for one employee, created when the milestone occurs. It holds the actual dates, the actual person, and the generated activities.

![A lifecycle event definition containing conditional activity sets, each holding activities with assignments and relative due dates, and the case instance generated for one employee](./img/lifecycle-event-structure.png)

The design payoff of putting conditions on the **activity set** rather than on every activity is worth stating explicitly: the relocation condition is written once and governs the eight relocation activities. When relocation policy changes, you edit one condition and one set. When a new country is added, you add an activity set rather than rewriting a case template.

## Activity types and choosing between them

**HR task.** Internal work by an HR or other internal team. Use when the work is done by a named group and produces no separate record. "Verify right-to-work documentation."

**Catalog request.** Generates a request in another department's fulfillment process. Use when the receiving team already has a working queue and process — IT equipment, facilities desk assignment, badge production. This is the correct way to coordinate cross-department, because the fulfilling team works in the process they already know and does not need HR access.

**Approval.** A decision gate. "Manager confirms start date," "Finance approves early equipment shipment."

**Knowledge acknowledgement.** The employee must read and confirm a policy. Produces an auditable record of who acknowledged what and when, which is the point — this is a compliance artifact, not a reading exercise.

**To-do for the employee.** Something the new hire does themselves: upload a document, complete a profile, choose benefits, watch an orientation module.

**Trigger to a flow or integration.** Where the activity is really "tell another system," use this rather than an HR task that says "someone go type this into the HRIS."

The choice matters more than it looks. The most common design error in onboarding builds is making everything an HR task, which puts the entire cross-department burden onto the HR coordinator: they receive thirty tasks and then email five departments. If IT provisioning is a catalog request into IT's queue, the HR coordinator receives nothing and the work still happens.

## Timing: anchoring to the event date

Every lifecycle event has a **driving date** — the start date for onboarding, the last working day for offboarding, the effective date for a transfer — and activity due dates should be expressed *relative to it*.

Typical onboarding anchors:

- Background check initiated: start date minus 14 days
- Equipment ordered: start date minus 10 days
- Accounts provisioned and credentials ready: start date minus 2 days
- Manager welcome contact: start date minus 3 days
- Badge and desk ready: start date
- Orientation and policy acknowledgements: start date plus 0 to 2 days
- Benefits elections: start date plus 1 to 30 days
- Thirty-day check-in: start date plus 30

Two hard problems come with relative dates, and you should design for both from the beginning.

**The date moves.** Start dates change constantly. Decide what happens when the driving date shifts: are open activities rescheduled automatically, is the coordinator notified, are already-completed activities left alone? The common and defensible answer is to reschedule open activities, leave completed ones, and notify the coordinator — but whatever you choose, decide it deliberately and test it, because the default behavior of a half-built implementation is usually "nothing happens and every due date is now wrong."

**The date is in the past or too close.** A hire starting in three days cannot have a background check that was due fourteen days ago. Configure a rule for compressed timelines: either activities become due immediately with an escalation, or the event creation warns the coordinator. Never let an activity be silently created already overdue with no signal.

Anchor to **business days** and to the employee's own schedule where the organization is multi-region. "Minus two days" over a weekend is minus four in practice.

## Sequencing and parallelism

Within an activity set, decide whether activities run **in parallel** or **in sequence**. Between activity sets, the same question applies.

The instinct to sequence everything is wrong and it is slow. Equipment ordering does not depend on badge photography. Run them together.

Sequence only where a genuine dependency exists:

- Account provisioning depends on the employee record existing in the identity source.
- Badge production depends on a photo being submitted.
- Day-one activities depend on the employee having credentials.
- In offboarding, asset return depends on the last working day having occurred, and final access revocation depends on asset return only where the asset requires access.

Where a dependency exists, express it as sequencing rather than as a manual instruction inside a task description. "Wait until IT has finished before starting this" in free text is not a dependency; it is a hope.

There is also a *conditional* sequencing question: what happens to downstream activities when an upstream one fails? A failed background check should stop onboarding, not proceed to desk assignment. Configure the stop, define who is notified, and define how the event case is closed. This is one of the few places where an unhandled path has real consequences.

## Onboarding, in detail

A defensible onboarding lifecycle event, expressed as activity sets:

**Pre-boarding (always).** Right-to-work verification, background check, offer-document acknowledgement, employee record creation in downstream systems, manager pre-start checklist. Anchored from minus 14 to minus 5 days. Owners: HR shared services, the manager, and an integration trigger.

**Provisioning (always).** Equipment catalog request to IT, account and access request, phone or software licensing, desk or workspace request to facilities. Minus 10 to minus 2 days. Owners: IT and facilities, as catalog requests.

**Relocation (conditional: relocation flag is true).** Relocation vendor engagement, temporary accommodation, shipping allowance, local registration guidance. Anchored to minus 30 days, which is why this set has its own timing.

**Immigration (conditional: work authorization sponsorship required).** Visa filing, document collection, status tracking. Owned by the immigration COE, restricted accordingly.

**Day one (always).** Badge collection, orientation session, workspace introduction, IT setup session, manager first meeting. Anchored to day zero.

**First thirty days (always).** Benefits enrollment to-do for the employee, mandatory compliance training, policy acknowledgements, thirty-day check-in for the manager, probation-review scheduling where applicable.

**Manager-track (conditional: the hire is a people manager).** Manager systems access, people-leader training enrollment, team introduction.

Two structural comments. First, notice how much of this is conditional and how clean the conditions are because they sit on sets. Second, notice that the new hire's own activities are to-dos, not HR tasks, and that at least one of them (benefits enrollment) has a hard deadline with a legal consequence — that one deserves reminders and an escalation to HR, not just a due date.

### The pre-account problem

A new hire has no account until close to their start date, but pre-boarding needs them to upload documents and acknowledge an offer. Implementations solve this in one of three ways: a pre-hire identity with restricted access to a limited self-service experience; an external pre-boarding link with token-based access; or by routing all pre-start employee actions through the manager or HR.

You should know that this decision exists and that it is an *access* decision, not a convenience one. Whatever you choose, the pre-hire population must not be able to read anything beyond their own onboarding case, and their access must expire or convert cleanly on day one. Confirm the approach with the security stakeholder before building.

## Offboarding, in detail

Offboarding is not onboarding in reverse; it has a different risk profile. In onboarding, the cost of a late activity is inconvenience. In offboarding, the cost of a late activity is an ex-employee with live system access.

Activity sets for a voluntary departure:

**Notification and confirmation.** Resignation recorded, last working day confirmed, manager acknowledgement, HR confirmation letter. Immediately on event creation.

**Knowledge transfer (conditional on notice period length).** Handover documentation, project reassignment, delegation of approvals — this last one is quietly important, because an ex-employee left as an approver blocks other people's work for months.

**Access and asset management.** Asset return list generated from the asset records, laptop and phone return, badge return, access revocation. Anchored to the last working day, with revocation ideally *scheduled* rather than dependent on a human clicking on the day.

**Final compensation coordination.** Final pay handoff to payroll, expense claim deadline, unused leave calculation request, benefits end-date notification. Note the word coordination: HRSD raises the request and tracks it; the actual payroll calculation happens in the payroll system, which is outside the scope of what you build here.

**Exit process.** Exit interview scheduling, exit survey, alumni contact preferences.

**Post-departure.** Record status change, access audit confirmation, document retention flag.

Three offboarding-specific design points:

**Involuntary departures need a different variant.** Immediate access revocation, no notice period, security escort processes, and a much tighter access model on the event case itself. This is usually a separate lifecycle event definition restricted to a small group, not a condition inside the standard one.

**Access revocation should be time-triggered, not task-triggered.** A task that says "revoke access on the last working day" depends on someone doing it that day. Prefer a scheduled trigger at end of last working day, with the task existing to *verify* rather than to perform.

**Prove completion.** Offboarding should produce an auditable statement that every access item was revoked and every asset accounted for, with the exceptions listed. That report is the artifact security and audit will ask for, and it is far easier to design in than to reconstruct.

## Writing the activity set table

Before building anything, the design artifact to produce is a table with one row per activity. It is unglamorous and it is the difference between a lifecycle event you can explain and one you cannot. Columns: activity set, condition on the set, activity name, activity type, owner, timing anchor, blocking or not, and employee-visible or not.

An extract from an onboarding design:

| Set (condition) | Activity | Type | Owner | Anchor | Blocking |
| --- | --- | --- | --- | --- | --- |
| Pre-boarding (always) | Verify right-to-work documents | HR task | HR shared services | Start − 14d | Yes |
| Pre-boarding (always) | Background check | Integration trigger | Vendor integration | Start − 14d | Yes |
| Provisioning (always) | Order laptop and peripherals | Catalog request | IT | Start − 10d | No |
| Provisioning (always) | Assign workspace | Catalog request | Facilities | Start − 5d | No |
| Relocation (relocating = true) | Engage relocation vendor | HR task | Mobility team | Start − 30d | No |
| Day one (always) | Collect badge | HR task | Facilities | Start + 0d | No |
| First 30 days (always) | Enrol in benefits | Employee to-do | New hire | Start + 1d to +30d | No |
| First 30 days (always) | Acknowledge code of conduct | Acknowledgement | New hire | Start + 7d | Yes |

Three things this table forces you to decide that a build-as-you-go approach lets you avoid. **Which activities block** — and therefore what a failure stops. **Who genuinely owns each one** — writing "HR" in eleven rows is how you discover you have built a coordinator's inbox rather than a distributed process. And **what the employee sees**, which is a different list from what HR sees and is the basis of the portal experience from the previous lesson.

Keep the table with the implementation. It is the document you will hand a stakeholder in a design review, and it is the document you will re-read in a year when someone asks why the relocation set exists.

## The other lifecycle events

Onboarding and offboarding are the two that justify the investment, but the model generalizes, and designing the first one well makes the rest cheap.

**Transfer or internal move.** Structurally the hardest, because it is an offboarding from one team and an onboarding to another happening simultaneously, with the employee remaining employed throughout. The activity sets are: manager handover, access changes (both revoke and grant, and getting the ordering right so the employee is never without access), reporting-line update, location or equipment changes, and payroll or compensation handoff where the move changes either.

**Promotion.** Usually lighter: compensation change handoff, title and reporting updates, new access, manager training if the person is becoming a people leader for the first time — which is the same conditional set you already built for a manager hire, reused.

**Leave of absence and return from leave.** The pair matters. Going on leave: coverage plan, delegation of approvals, access decisions, payroll and benefits handoff. Returning: access reinstated, equipment returned to them, re-onboarding to whatever changed while they were away. Return-from-leave is the event most often skipped, and its absence is felt as employees coming back to dead accounts.

**Long-term contractor conversion.** Where the person exists in the instance already but their employment relationship changes. Watch identity carefully here: converting rather than duplicating is the whole game, and it depends on the stable identifier from the integration lesson.

The reuse payoff is real. A well-built onboarding gives you activity sets — provisioning, access, acknowledgements, manager tasks — that a transfer event can invoke rather than reimplement.

## Operating a lifecycle event

Once these are running, someone has to watch them, and the implementation should give that person what they need.

**The coordinator needs a view of events in flight**, not a list of individual tasks. Group by event, show days to the driving date, and highlight events with overdue blocking activities. A coordinator who has to reconstruct the state of an onboarding from a task list is doing the work the spreadsheet used to do.

**Exceptions need to surface, not accumulate.** Configure escalation on overdue blocking activities: a reminder to the owner, then a notification to the coordinator, then a notification to the coordinator's manager. Without escalation, a stalled activity is discovered by the new hire on day one.

**Measure the right things.** Percentage of onboardings with all pre-start activities complete before day one is the honest headline metric — it is what "onboarding failed quietly" looks like in a number. Beyond it: overdue activities by owning department, which shows you where the process is genuinely constrained; and time from event creation to first activity completion.

**Report by department, not just in aggregate.** "Onboarding is 87 percent on time" is not actionable. "IT provisioning completes on time in 62 percent of cases and everything else is above 95" is a conversation with one team.

## Testing a lifecycle event

Lifecycle events are the hardest thing in this course to test properly, because they span weeks and departments. Test them in four passes.

**Structural pass.** Create an event case for a straightforward employee with a start date well in the future. Confirm the expected activity sets were generated, the conditional ones were not, every activity has an owner, and every due date is sensible.

**Conditional pass.** Create three more cases with different profiles — a relocating hire, a hire requiring sponsorship, a manager hire — and confirm each extra set appears exactly when it should and not otherwise.

**Timing pass.** Create a case with a start date three days out and confirm the compressed-timeline handling works. Then move the start date on an existing case by a week and record what happened to open and completed activities.

**Failure pass.** Fail one blocking activity — the background check — and confirm the downstream sets stop, the right people are notified, and the case reaches a defensible end state. Then reassign an activity whose owner group is empty and confirm it does not disappear.

Run every pass with impersonation, not as an administrator. An administrator sees everything and will not notice that the facilities team cannot open the task assigned to them.

## Practice

Work in a development instance with HRSD lifecycle events available, using the HR services and tasks you built earlier. Prepare test employees with differing countries, manager status, and a relocation flag.

1. **Design before you build.** Produce a one-page design for an offboarding lifecycle event: list the activity sets, the condition on each, the timing anchor for each, and for every activity its type (HR task, catalog request, approval, to-do, acknowledgement, integration trigger) and its owner. Mark which activities run in parallel and which are sequenced, and state the dependency for every sequenced one.

2. **Justify the activity types.** For three activities in your design, write a sentence on why you chose that type over an HR task. At least one must be a catalog request into another department, and you must state what that department sees and does *not* see.

3. **Build the always-on sets.** Implement the notification/confirmation set and the access-and-asset set. Create a lifecycle event case for a test employee with a last working day two weeks out and confirm every activity generated with the right owner and due date.

4. **Build one conditional set.** Add a set that only runs under a condition — knowledge transfer for employees with a notice period over two weeks, or a manager-specific handover set. Create two cases, one matching and one not, and confirm the difference.

5. **Move the date.** Change the last working day on an open case by one week, both forward and backward. Record exactly what happened to open activities, completed activities, and any already-overdue activities. If nothing happened, describe the configuration you would add.

6. **Compress the timeline.** Create a case with a last working day tomorrow. Document what the implementation did with activities anchored to minus five days, and whether anyone would have noticed.

7. **Handle a failure.** Add a blocking approval to your design, reject it on a test case, and confirm the downstream behavior. Write down the end state of the case and who was told.

8. **Produce the completion evidence.** For one completed test case, describe the report or record you would give an auditor to prove that all access was revoked and all assets returned by the last working day — what it lists, where the data comes from, and what it does with exceptions.

9. **Compare to onboarding.** In one paragraph, name three ways your offboarding design differs structurally from an onboarding design, and explain each difference in terms of risk rather than in terms of process.

## Check your understanding

1. Eight relocation activities all need the condition "relocating = true." Where should the condition live?
2. Why is offboarding access revocation better time-triggered than task-triggered?
3. Which onboarding metric best shows that onboarding "failed quietly"?
4. A start date moves a week later. What is the defensible default for open, completed, and overdue activities?

*Answers:* (1) On the activity set. (2) A task depends on someone doing it that day; a scheduled trigger fires regardless, and the task can verify. (3) The percentage of onboardings with all pre-start activities complete before day one. (4) Reschedule open activities, leave completed ones, notify the coordinator, and decide deliberately (and test) how overdue ones are handled.
