---
lesson_id: sn330-07
course_id: sn330
pathway: servicenow-implementation-specialist
title: Automating HR Workflows
order: 7
kind: lesson
competency_ids:
  - D4-S1-C03
  - D2-S1-C05
objectives:
  - Automate an HR process with Flow Designer, including approvals and notifications
---

## What automation is for in HRSD

Lifecycle events gave you a way to describe *what* happens and *when*. This lesson is about making it happen without a person driving it: the approvals, the notifications, the field derivations, the record creation, and the handoffs that turn a designed process into a running one.

The tool set is the platform's standard automation kit — Flow Designer, subflows, actions, and business rules — applied to HR tables. Nothing here is HR-specific in mechanism. What *is* HR-specific is the judgment about where automation belongs, and three constraints shape that judgment:

**Scope boundaries are real.** HR case tables live in scoped applications. A flow built in the global scope that tries to update a scoped HR case will fail on cross-scope access unless the privilege has been granted. Build HR automation in a scope that has legitimate access, and when something works for an administrator and fails for everyone else, check the scope before you check anything else.

**Notifications carry sensitive content.** An email that restates the body of an accommodation request has moved sensitive HR data into an inbox and a mail archive you do not control. Automation multiplies whatever mistake you make here by the number of records it processes.

**Automation must not become the process documentation.** If the only place the leave approval rule is written down is inside a flow's condition, HR cannot review it and cannot change it. Prefer data-driven configuration — a mapping table, an HR criterion, an approval rule record — over a condition buried three branches deep.

## Flow Designer or business rule?

Both can react to a record change. Choosing badly produces implementations that are either impossible to read or impossible to debug, so it is worth having a firm rule.

**Use a business rule when the work is synchronous data integrity on one record.** Deriving a field from other fields on the same record, defaulting a value, validating before insert, denying a save that would violate a rule, or maintaining a denormalized field. Business rules run inside the database transaction, they are fast, and a *before* rule can change what gets written.

**Use a flow when the work is a process.** Multiple steps, human decisions, waiting, notifications, creating records in other applications, calling out to another system, or anything an HR analyst should be able to read and understand.

Some sharper heuristics:

- If it takes longer than the save should take, it is a flow (or async).
- If a human is involved at any point, it is a flow. Business rules cannot wait.
- If the logic will be explained to a non-technical stakeholder in a design review, it is a flow — Flow Designer's visual representation is a genuine deliverable.
- If it must be guaranteed to run before the record is written, it is a *before* business rule. Nothing else has that guarantee.
- If it fans out to other systems or generates a lot of work, it is a flow, and probably an async trigger.

Two anti-patterns to name and avoid. **Business rules that create tasks and send emails** are the classic legacy pattern; they are invisible to stakeholders, they slow saves, and their failures are silent. **Flows that do simple field derivation** on every update are wasteful and add latency to something a two-line before rule handles.

### Business rule ordering and recursion

When you do write a business rule on an HR case, two disciplines prevent most of the pain.

Set the **order** deliberately and leave gaps (100, 200, 300). Rules that derive values must run before rules that use them.

Avoid **recursion**. A rule that updates the record it is running on, on an after trigger, re-triggers the rules. In a before rule, set the field directly on the current object and do not call an update.

Here is a compact before-rule example: deriving a case's due date and confidentiality flag when an HR case is created.

```javascript
(function executeRule(current, previous /*null when async*/) {
  // Runs: before, insert, on the HR case table.
  // Purpose: derive values so agents and SLAs have them at insert time.
  // NOTE: all person-based logic reads the SUBJECT person, not the caller.

  // Field names below (subject_person, hr_service.confidential, work_region,
  // u_work_region) are illustrative. Check the dictionary of your HR case and
  // HR profile tables on your release and use the actual field names.
  var subject = current.subject_person; // reference to the person the case is about

  // 1. Confidentiality flag: some services are always restricted.
  var svc = current.hr_service;
  if (svc && svc.confidential == true) {
    current.confidential = true;
  }

  // 2. Region, copied from the subject's HR profile so assignment rules and
  //    SLA schedules can use it without a second query later.
  if (subject) {
    var profile = new GlideRecord('sn_hr_core_profile');
    profile.addQuery('user', subject);
    profile.setLimit(1);
    profile.query();
    if (profile.next()) {
      current.u_work_region = profile.getValue('work_region');
    }
  }

  // 3. Do NOT set state, do NOT create tasks, do NOT send email here.
  //    Those are process steps and belong in the flow.
})(current, previous);
```

Note what the rule refuses to do. It derives fields and stops. The moment it starts creating tasks, the logic has left the place a stakeholder can see it.

## Building an HR flow

A flow has a **trigger**, a sequence of **actions**, and access to **flow variables** and the trigger record's data.

**Triggers you will actually use in HRSD:**

- *Created* on an HR case table — the main entry point for service-specific automation.
- *Updated* with a condition — for example, state changes to resolved, or a specific field is set.
- *Created or updated* with a filter condition, used carefully; make the condition tight or the flow runs constantly.
- *Scheduled* — nightly sweeps such as "resolved cases untouched for five days" or "articles past review date."
- *Service Catalog / record producer* — where the request drives the process rather than the case record.
- *Called from another flow or from a lifecycle event activity* — subflows invoked by the activities you designed in the previous lesson.

**Structure the flow so it reads like the process.** Name the flow after the business outcome ("Leave of Absence Request"), not after the mechanism ("HR case update flow 3"). Use stages if the process has recognizable phases; they show up in the flow's own progress display and make a running instance readable.

**Push reusable work into subflows.** "Notify the subject person's manager," "create a task for the region's HR team," "record a compliance acknowledgement" are used by half a dozen processes. A subflow with clear inputs and outputs is testable on its own and fixable in one place.

**Keep script steps small and rare.** Flow Designer's value is that a non-developer can read it. A flow whose middle is one giant script step has thrown that away. When you do need script, put it in a custom action with named inputs and outputs so the flow still reads as steps.

## Approvals

Approval is where HR automation earns its reputation, in either direction.

**Choose the approver dynamically, from data.** The overwhelmingly common HR approver is "the subject person's manager," which comes from the HR profile or the user record. Hard-coding a named user or a static group is the defect you will inherit in every implementation you are ever asked to fix.

Beyond the manager, common patterns are:

- **Manager's manager** for higher-value or exception requests. Get the escalation depth from data, and handle the case where the chain runs out before you reach the required level.
- **Role or COE approval** — total rewards approves a leave exception, finance approves a relocation allowance.
- **Conditional approval** — no approval under a threshold, one approval above it, two above a higher one. Express the thresholds in a configuration record, not in the flow's condition.

**Handle the paths that are not "approved."** Every approval needs answers to four questions before you build it:

1. What happens on rejection? The case does not simply stop; someone must be told, and the case needs a defensible end state.
2. What happens if the approver does not respond? Configure a reminder and then an escalation with a timeout. An approval with no timeout is a case that sits forever, and HR will find it three months later.
3. What if the approver *is* the subject person? A manager requesting their own leave cannot approve it. Detect this and route upward.
4. What if the approver has left the company or is on leave? Delegation should cover this; confirm it does, and have a fallback to the group.

**Do not put sensitive detail in the approval request.** The approver needs to know what decision they are making, not the medical background to it. "Approve leave of absence for J. Okafor, 12 weeks from 3 March" is enough; the reason for the leave, where it is sensitive, stays in the case for those with access.

## Notifications

Notifications are the most visible output of your automation and the easiest to get wrong at scale.

**Notification records versus a send-email flow action.** Use a notification record when the message is a standing communication tied to an event, with a template, subscribers, and the ability for administrators to see and change it without editing a flow. Use the flow's send-email action when the message is genuinely specific to one point in one process and constructing it in the flow keeps the process readable. When in doubt, prefer the notification record: it is discoverable, and "why did the employee get this email" is a question you will be asked.

**Design the notification set per audience, not per event.** For a leave request the audiences are: the employee (request received, approved or declined, action needed from you, completed), the manager (approval needed, reminder), and the HR team (assigned, escalated). Write that grid out and you will discover both the missing notifications and the redundant ones.

**Rules that keep notifications trustworthy:**

- Every notification must be actionable or informative. "The state of your case changed to In Progress" is neither.
- Link to the portal; do not restate the case content. This is the privacy rule and also the usability rule.
- Suppress self-notification — the person who just did the thing does not need an email about it.
- Give every notification a switch. Something will misfire in production at 3 a.m., and the ability to deactivate one notification without deactivating the flow is worth building for.
- Test with a real inbox at least once. Templates that look fine in the platform preview and terrible in a mail client are a rite of passage.

## Worked example: leave of absence request

Trace one complete automation, using pieces from earlier lessons.

**Trigger.** Created, on the total rewards COE case table, filtered to the "Leave of Absence" HR service.

**Stage 1 — Validate and enrich.** Look up the subject person's HR profile. If employment type or work country is missing, create a data-quality task for HR shared services and stop the flow with a clear case comment; do not proceed on bad data. Otherwise set the region and the applicable policy variant from a mapping table.

**Stage 2 — Deflect and inform.** Post an employee-facing comment linking the country-specific leave policy article from lesson 4, so the employee has the terms in front of them while the request is processed.

**Stage 3 — Approval.** Look up the subject person's manager from the HR profile. If the manager is the subject person, or the manager field is empty, escalate to the next level up and note why on the case. Send the approval with a summary that names the request, the dates, and nothing more. Configure a three-day reminder and a five-day escalation to the manager's manager.

**Stage 4 — Branch.**

- *Approved:* create the fulfillment tasks — payroll notification, benefits continuation check, manager coverage plan — as an activity set. Notify the employee with a decision and the next steps.
- *Rejected:* set the case to closed incomplete with a close code of "declined," notify the employee with the manager's comment, and create a follow-up task for HR if the policy requires a conversation.
- *Timed out with no response after escalation:* notify HR, leave the case open in an explicit "awaiting approval — escalated" condition, and do not close it silently.

**Stage 5 — Completion.** When all tasks are closed, move the case to resolved, notify the employee, and let the auto-close rule from lesson 3 finish the job.

**Where a business rule still belongs in this process.** The before rule shown earlier still derives the region and the confidentiality flag at insert. The flow reads those fields rather than recomputing them. That division — rules derive data, flows run process — is the one to carry into every build.

## Error handling and operability

Automation you cannot observe is automation you cannot support.

**Use the flow execution details.** Every run records which actions executed, with what inputs and outputs. When a stakeholder says "the approval never went out," this is the first place to look, and knowing how to read it quickly is a core implementer skill.

**Design the failure paths.** A lookup that returns nothing, an approver who does not exist, a task creation that fails on ACLs, an integration step that times out. For each, decide: retry, alternate path, or fail loudly with a task for a human. Silent failure is the worst outcome, because HR keeps believing the process ran.

**Do not let a flow failure strand a case.** If the automation dies halfway, the case should end in a state a human can pick up, with a comment saying what happened. Build a catch-all: on error, assign to a support group with the error text in work notes.

**Test in the flow's own test facility first**, then with real records, then with impersonation. Testing only as an administrator hides every access problem your flow has.

**Watch volume.** A flow triggered on every update of a high-volume table, or one that loops over a large result set, becomes a performance problem the day the HRIS feed loads twelve thousand records. Tighten trigger conditions, and prefer async where the work does not need to be immediate.

## Practice

Work in a development instance, using the HR services, tasks, and lifecycle event you built earlier. Build inside an appropriate HR scope, not global.

1. **Classify before you build.** Take five pieces of behavior from your implementation — for example: default a case's category from its service; notify a manager when a direct report's case is created; escalate an unanswered approval; stamp a region on insert; create three fulfillment tasks on approval. For each, decide business rule or flow, and write one sentence of justification. You should end with at least one of each.

2. **Write one before business rule.** Implement a derivation rule on an HR case table — region, confidentiality, or a due-date default. It must set fields only: no record creation, no email, no state change. Set an explicit order value and say in a comment why that order.

3. **Build the leave-of-absence flow.** Implement the worked example above, at minimum stages 1, 3, and 4. The approver must be looked up from data, never hard-coded.

4. **Handle the four approval questions.** Demonstrate each: reject a request and show the resulting case state and notification; let one time out and show the reminder and escalation; submit a request where the subject person is their own manager and show the upward routing; and describe what your build does when the approver is inactive.

5. **Build a subflow and reuse it.** Extract "notify the subject person's manager" into a subflow with inputs and outputs, and call it from at least two places. Explain in a sentence what would have to change if the notification content changed, in your design versus a copy-paste design.

6. **Design the notification grid.** For your leave process, produce a table of audience by event, marking which notifications you are sending and which you deliberately are not. Justify two omissions. Then check every notification body against the rule that sensitive content stays out of email — fix any that fail.

7. **Break it deliberately.** Remove the manager from your test subject's HR profile and run the flow. Then empty the fulfillment assignment group and run it again. For each, record what happened, whether a human would have found out, and what you changed to make the failure visible.

8. **Read the execution log.** Open the flow execution details for one failed run and identify the exact action and input that caused the failure. Write two or three sentences describing what you saw and how you would explain it to a support colleague who did not build the flow.

## Check your understanding

1. "Set the case's region from the subject's HR profile at insert." Business rule or flow? Before or after?
2. "Ask the manager to approve, remind after three days, escalate after five." Business rule or flow?
3. The flow works when an administrator tests it and fails for everyone else. What do you check first?
4. What four non-approved paths must every HR approval design answer?

*Answers:* (1) A before insert business rule; it is synchronous field derivation on one record. (2) A flow; it involves a human and waiting. (3) Scope and cross-scope access, then the run-as context and ACLs. (4) Rejection, no response (reminder, escalation, timeout), approver is the subject, and approver has left or is on leave.
