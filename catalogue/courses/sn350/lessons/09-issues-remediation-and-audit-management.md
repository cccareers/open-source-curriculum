---
lesson_id: sn350-09
course_id: sn350
pathway: servicenow-implementation-specialist
title: Issues, Remediation, and Audit Management
order: 9
kind: lesson
competency_ids:
  - D10-S1-C05
objectives:
  - Route a failed control into an issue and a remediation task, and support an audit engagement
---

## What happens when something fails

Everything you have built so far detects. Attestations detect by asking, indicators detect by measuring, assessments detect by judging. Detection without a disposal path is a program that generates anxiety and nothing else, and the honest measure of GRC maturity is not how much it detects but what percentage of what it detects gets closed, verified, and stays closed.

The disposal path has one entry point and one shape. Whatever detected the problem — a failed control test, a failed indicator, a negative attestation answer, a risk above appetite, an audit finding, a self-reported gap — it produces an **issue**. From the issue come **remediation tasks**, and from the tasks comes closure, which is verified by someone other than the person who did the work.

Standardizing on one issue record across all sources is the design decision that makes the program governable. It means one queue, one aging report, one set of escalation rules, and one honest answer to "what is currently wrong here" regardless of which mechanism noticed. A program with separate remediation tracking per source has as many blind spots as it has sources.

## The issue record

An issue asserts that a specific thing is wrong with a specific control, risk, or entity, and that somebody owes a fix.

The fields that carry weight:

- **Source.** A reference back to what raised it — the indicator result, the attestation response, the audit finding. Without this, the issue is an assertion nobody can re-verify.
- **Related record.** The control, risk, or entity affected. This is what makes an issue appear on the right roll-up and the right dashboard.
- **Owner.** A named person accountable for resolution, distinct from whoever is assigned individual tasks.
- **Severity.** Ideally derived rather than typed: an issue on a control mitigating a Critical risk is not the same as one on a control nobody relies on. Deriving severity from the related record's rating is a small piece of configuration that removes a large amount of arguing.
- **Root cause.** A classified cause, not free text alone. Categories such as process gap, missing automation, ownership gap, capacity, or knowledge are what make aggregate root cause analysis possible later.
- **Due date.** Driven by severity through a documented matrix, not negotiated per issue.
- **Response type.** Fix, compensate, accept, or dispute — the same four-way choice as risk response, and it must be explicit.

A workable lifecycle:

```text
Draft     -> raised, not yet triaged
Analyze   -> owner assigned; root cause and response type being determined
Respond   -> remediation tasks open and being worked
Review    -> work claimed complete; awaiting independent verification
Closed    -> verified; evidence of the fix attached
```

The **Review** state is not optional decoration. An issue closed by the person who fixed it, with no verification, is the most common way a compliance program acquires a false clean bill of health. Verification means a second party confirms the fix, and where possible the confirmation is a re-run of the test that failed rather than an assurance that it was addressed. That is one of the quieter payoffs of Lesson 7: with an automated indicator behind the control, verification can be "the indicator passed for five consecutive days," which is both cheaper and stronger than a human opinion.

## Issue, exception, or acceptance?

Three records look similar and mean very different things. Getting the distinction into practitioners' heads is a training problem you will own as the implementer.

**An issue** says: this is wrong, and we intend to fix it. It has a due date and it is expected to close.

**A policy exception** says: this requirement does not apply to this thing, for a stated reason, until a stated date. It is a scoped, approved, expiring departure from the policy. It attaches to the control or entity and suppresses the finding for its duration.

**A risk acceptance** says: we understand the exposure and are choosing to carry it. It attaches to a risk, needs an authority proportionate to the band, and expires.

The failure mode is organizations using "closed" as a synonym for all three, which erases the difference between fixed, waived, and tolerated. Configure them as distinct records with distinct approvals, and make the reporting show them separately. An executive who is told 94 percent compliance should be able to see how much of the remaining 6 percent is being fixed versus formally tolerated, and how much of the 94 is passing only because an exception is suppressing it.

Two governance rules worth arguing for: every exception and acceptance carries an expiry, and exceptions do not renew automatically. A renewal is a fresh decision by a fresh approver, or the exception lapses — the same lapse behavior as the acceptance sweep in Lesson 8, for the same reason.

## Remediation tasks

An issue describes the problem; tasks do the work. Splitting them matters because remediation is usually cross-functional: the compliance practitioner owns the issue, but the fix is a change on a server owned by an infrastructure team who have never heard of the control.

Design principles:

**Tasks are assignable to people who are not in the GRC program.** The assignee should be able to understand the task without knowing what a control objective is. Write the task in the language of the work: "remove the six dormant accounts listed below from the local administrators group," not "remediate control failure on ITGC-AC-03."

**Carry the evidence forward.** The detail string your indicator produced in Lesson 7 belongs in the task description. If the assignee has to ask which accounts, the automation has failed at its actual job.

**Reference, do not duplicate, ITSM.** Remediation frequently *is* a change request or an incident. The right pattern is a remediation task that references the change record and closes when the change closes, not a parallel record where the same work is tracked twice. Two systems of record for the same work means two states, and they will disagree at the moment somebody asks.

**Make aging visible.** Issue age from creation, not from last update, is the honest metric. An issue that has been open 400 days but was commented on yesterday is not fresh.

```javascript
// Raise a GRC issue from a failed indicator result, idempotently.
// Guard: do not create a second open issue for the same control + source.
function raiseIssueFromIndicator(controlSysId, indicatorResultSysId, detail, severity) {

  var existing = new GlideRecord('sn_grc_issue');
  existing.addQuery('related_control', controlSysId);
  existing.addQuery('source_type', 'indicator');
  existing.addQuery('state', 'NOT IN', 'closed,cancelled');
  existing.setLimit(1);
  existing.query();
  if (existing.next()) {
    existing.work_notes = 'Indicator failed again: ' + detail;
    existing.update();
    return existing.getUniqueValue();      // reuse, do not multiply
  }

  var issue = new GlideRecord('sn_grc_issue');
  issue.initialize();
  issue.setValue('related_control', controlSysId);
  issue.setValue('source_type', 'indicator');
  issue.setValue('source_record', indicatorResultSysId);
  issue.setValue('severity', severity);   // derived upstream from the related risk
  issue.setValue('short_description',
    'Control test failed: ' + detail.substring(0, 80));
  issue.setValue('description', detail);
  issue.setValue('state', 'draft');
  return issue.insert();
}
```

The reuse branch is the important half. Without it, a daily indicator failing for three weeks produces twenty-one issues describing one problem, the queue becomes unreadable, and the first thing anyone does is turn the indicator off.

## Reading the queue as a whole

Individual issues get worked. The queue as a whole is where the program's real problems are visible, and looking at it in aggregate is a practitioner discipline you should build reporting for from the start.

**Root cause distribution** is the most valuable view. Classify causes consistently and the pattern emerges fast: if 40 percent of issues classify as *ownership gap*, the organization does not have a control problem, it has a CMDB and joiner-mover-leaver problem, and fixing that removes a whole category of future issues. Aggregate root cause is how a compliance program stops playing whack-a-mole. It only works if the cause list is short, mandatory, and enforced — free text produces four hundred unique causes and no insight.

**Recurrence** is the second view. The same control failing every quarter means the remediation is tactical every time and the systemic fix has never been done. Report on issues raised against controls that already had a closed issue in the last twelve months, and treat a hit as a signal that the previous closure was premature.

**Aging and the escalation ladder.** Bucket open issues by age against their severity's due window and escalate on a documented ladder rather than by whoever shouts. A workable pattern: at due date, notify the owner; at due plus one week, notify their manager; at due plus a month, it appears by name on the risk committee's report. Publish the ladder in advance — escalation that surprises people is resented, escalation that was announced is just the process.

**Extension discipline.** Due dates will be extended; that is not a failure. Silent extension is. Require an approval proportionate to severity, keep the original due date on the record, and report on the count of extensions per issue. An issue extended four times is a decision the organization has effectively made without saying so, and surfacing it is the point.

One number to watch above all: the ratio of issues **closed as fixed** to those closed as accepted, waived, or, most tellingly, cancelled. A rising cancellation rate almost never means problems evaporated. It means the queue is being cleaned rather than worked, and it is the earliest reliable symptom of a program losing legitimacy.

## Audit Management at supporting depth

Audit is the third party in the room. An audit engagement is a scoped, time-boxed examination that produces findings, and the platform models it so that auditors work from the same control and evidence data rather than emailing requests for spreadsheets.

The record shapes:

- **Engagement.** The audit itself: objective, period, lead auditor, timeline, status.
- **Scope.** Which entities, controls, risks, or policies are in it. Built from the same entity types you defined in Lesson 6, which is a meaningful efficiency — the auditor's scope and the program's scope are derived from one definition instead of negotiated from two lists.
- **Audit task.** The unit of auditor work: test this control, review this population, interview this owner.
- **Working paper.** The auditor's record of what was examined and concluded, with evidence attached. This is the auditor's own artifact and is not editable by the audited party.
- **Evidence request.** A formal ask to a control owner, tracked with a due date, so that "we asked for it three weeks ago" is a fact rather than a recollection.
- **Finding.** A concluded deficiency, which flows into an **issue** — the same issue record as everything else, which is why standardizing on it mattered.

The implementation value is mostly in two things. First, an auditor who can see current control state and existing evidence asks for far less, because most of the population is already there and dated. Second, findings land in the same remediation machinery as internally detected problems, so the organization has one view of what is wrong rather than an internal list and an audit list that quietly diverge.

### Independence, in configuration terms

Audit independence is an access control problem before it is a philosophical one, and the implementer owns it:

- Auditors **read** control, evidence, risk, and policy data broadly, and **write** only to engagement, task, working paper, and finding records.
- Audited parties can respond to evidence requests and can read findings addressed to them, but cannot edit a working paper or alter a finding's conclusion.
- Evidence attached to an attestation must not be replaceable after submission. If an owner can swap the account list after the auditor has read it, the evidence has no value. Restrict attachment deletion on submitted records and rely on the audit history to show what changed and when.
- The audit trail on control, issue, and evidence tables is on, retained, and no one on the program can disable it.

State these as configuration in a design document and have them reviewed. "We trust our people" is not an answer an external auditor accepts, and the question will be asked about the GRC tool itself.

### Worked example: one indicator failure, end to end

Continuing Northwind Health. On a Tuesday, the dormant-account indicator fails on two finance application servers for the second consecutive day.

1. **Issue raised** automatically, one per control, severity derived as High because the related risk's residual band is High. Detail carries the six offending account names. The existing-open-issue guard means Wednesday's failure updates rather than duplicates.
2. **Triage** by the compliance practitioner within the severity's triage window. Root cause classified as *process gap*: the leaver process removes directory accounts but not local administrator accounts on these two hosts.
3. **Two remediation tasks.** One to the infrastructure team, phrased in their language and listing the six accounts, referencing the change record that will remove them. One to the identity team, to extend the leaver process to local accounts — the systemic fix, without which the first task recurs next quarter.
4. **The systemic task takes longer than the due date.** It is not silently extended. The owner requests a due date extension with a rationale, approved by the issue's severity-appropriate authority, and the extension is visible on the record.
5. **Verification.** The tactical fix is verified by the indicator passing for five consecutive days, automatically. The systemic fix is verified by the practitioner reviewing the amended process document and by a new indicator watching for local privileged accounts created outside an approved request.
6. **Closure** with evidence attached: the change record, the amended process, and the indicator history.
7. **Four months later**, an audit engagement scoped to the finance service opens. The auditor reads the control, sees the failure, the issue, the two tasks, the verification, and the sustained passing indicator, and raises no finding. That non-finding is the return on everything in this course.

## Practice

Use a developer instance with the IRM applications available, building on your earlier work.

1. **Design the severity matrix.** Write a matrix mapping issue severity to triage window, remediation due window, escalation authority, and required verification method. Derive severity from the related risk or control rating rather than leaving it manual, and state the derivation rule.

2. **Route a failure end to end.** Force the indicator you built in Lesson 7 to fail, and follow it: issue raised, triaged, root cause classified, at least two remediation tasks created (one tactical, one systemic), work completed, independently verified, closed with evidence. Record what the tool did automatically and what you had to do by hand.

3. **Prove idempotency.** Let the same indicator fail on three consecutive runs. Confirm exactly one open issue exists, and that the later failures are recorded on it. If your configuration creates three, fix it and describe what you changed.

4. **Distinguish the three records.** Write three short scenarios for one control — one that should become an issue, one a policy exception, and one a risk acceptance. For each, state who approves it, what expiry it carries, and how it should appear on a compliance report. Then describe what a report would wrongly say if all three were recorded as issues.

5. **Scope a mini engagement.** Create an audit engagement for one entity type, scoped from the entity type you built in Lesson 6, with at least two audit tasks and one evidence request to a control owner. Take one task to a finding and confirm the finding produces an issue in the same queue as your indicator-raised one.

6. **Test independence.** Write down the four access rules from this lesson as testable statements. Then, with a test account holding only an auditor role, try to edit a control's evidence and try to alter a submitted attestation response. Report what happened, and if either succeeded, name the specific control you would implement.

## Check your understanding

1. Why should every detection source raise the same kind of issue record?
2. Who should verify that an issue is fixed?
3. A requirement does not apply to a legacy server until it is decommissioned in June. Issue, policy exception, or risk acceptance?
4. What does a rising cancellation rate on issues usually mean?

*Answers:* (1) One queue, one aging report, one escalation ladder, and one honest answer to "what is wrong," regardless of source. (2) Someone other than the fixer, ideally by re-running the failed test (for example an indicator passing for several consecutive days). (3) A policy exception: scoped, approved, and expiring. (4) The queue is being cleaned rather than worked; it is an early sign the program is losing legitimacy.
