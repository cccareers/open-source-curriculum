---
course_id: sn102
project_id: sn102-x02
title: "One Tuesday, Four Records, One Flow"
kind: supplementary-project
status: draft
hours_estimate: 5
difficulty: core
related_lessons:
  - sn102-06
  - sn102-08
objectives:
  - Identify the core ITSM processes and the records each one creates
  - Explain how workflow automation moves work through the platform without manual handoffs
competency_ids:
  - D2-S1-C01
  - D2-S1-C05
  - D7-S1-C02
---

## Scenario
Lesson 6 told the story of one Tuesday: an expired certificate takes down the expense system, forty people call the service desk, an emergency change restores service, a problem is opened to find out why, and — unrelated — a manager requests reporting access through the catalog. Your service desk lead wants a **training replay** of that Tuesday in your PDI so new agents can click through a realistic, correctly-linked set of records. Then, because the critical-incident page went out by email last time and nobody saw it, you will add the lesson 8 automation that posts a work note and emails the on-call person the moment an incident becomes critical.

## What you will build / produce
- One linked set of ITSM records: 1 parent incident + 3 child incidents, 1 emergency change with 2 change tasks, 1 problem, 1 normal change linked as the problem's fix, and 1 catalog request (REQ → RITM → SCTASK).
- One flow, **Critical incident alert**, with a trigger, two actions, and (milestone 5) an approval wait.
- A one-page "replay guide" mapping each record to the process and the question it answers.

## Before you start (prerequisites, starter files or data)
- PDI with demo data, signed in as `admin`.
- Create a configuration item to stand in for the expense system if none fits: `cmdb_ci_appl.form`, Name `Expense App`. (Any existing application CI in demo data is also fine; record which you used.)
- Pick an assignment group from demo data for the service desk (for example *Service Desk*) and one for the platform team (for example *Software* or *Hardware*). Record your choices — exact demo group names vary by release.

## Milestones
1. **09:10 — the first incident.** Create an incident: Caller = any demo user, Category = Software, Configuration item = Expense App, Impact = 3 - Low, Urgency = 2 - Medium, Short description "Expense App rejects login." Record the number and the **derived Priority**. Write one sentence on why you could not type Priority directly.
2. **09:30 — it is bigger.** Raise Impact to 1 - High and Urgency to 1 - High on the first incident; note the new priority. Create three more incidents with different callers and set each one's **Parent Incident** field to the first incident. Open the first incident and find the **Child Incidents** related list. (If your instance has the Major Incident Management plugin active, you may propose the incident as a major incident; on a default PDI this is optional — see Instructor notes.)
3. **09:50 — emergency change.** From the parent incident, create a change request (form context menu or the **Create Normal/Emergency Change** UI action, where present; otherwise create from `change_request.form` and fill the incident's **Change Request** field). Type = Emergency, CI = Expense App, Short description "Replace expired certificate on Expense App." Add two change tasks: "Install certificate," "Verify login." Move the change through its states as far as your instance allows without additional approvers; record each state you passed through. Resolve all four incidents with a resolution code and notes.
4. **11:00 — the problem.** Create a problem: "Certificate expiry on Expense App not monitored." Link the four incidents to it (the incident's **Problem** field). Fill Workaround and Root cause fields (field labels vary by release; record which you used). Create a **normal** change "Add certificate-expiry monitoring" and link it to the problem (the problem's related list or the change's **Problem** reference, whichever your instance shows).
5. **11:15 — the request.** Impersonate a demo user, open the Service Catalog (Service Portal `/sp` or Employee Center `/esc`, whichever your PDI has), and order any access- or software-type catalog item (for example *Request access* or a software item — record what you used). End impersonation. Find the REQ, RITM, and the SCTASK(s) generated. If no SCTASK appears, record which approval or flow stage the RITM is waiting on — that observation counts.
6. **Automate: the critical-incident alert.** In Flow Designer (reached via Workflow Studio on newer releases), create flow **Critical incident alert**:
   - Trigger: **Updated** on Incident, condition **Priority changes to 1 - Critical** (if your trigger condition builder does not offer "changes to", use `Priority is 1 - Critical` and set the trigger to run **Once**).
   - Action 1: **Update Record** on the trigger incident — Work notes: "Critical alert sent to on-call."
   - Action 2: **Send Email** to your own admin email address, subject "CRITICAL: " + the incident's Number (drag the data pill).
   - Save, **Activate**.
7. **Fire it.** Create a fresh incident at Impact 1 / Urgency 1, or raise an existing one. Confirm the work note on the record; find the email in **System Logs > Emails** (`sys_email.list`) — PDIs usually do not deliver outbound email, so the log entry is your evidence. Open the flow's **Executions** and read the run step by step.
8. **Add a wait.** Insert **Ask for Approval** (approver: your own user) between Action 1 and Action 2. Fire it again on a different incident. Show the execution paused at the approval; approve it from **My Approvals** (`sysapproval_approver.list`, filter Approver is you); show the execution completed.
9. **Run the verification script** and write the replay guide.

## Acceptance criteria
- [ ] Four incidents share one parent; all four reference the same problem.
- [ ] One emergency change linked from the parent incident, with exactly two change tasks.
- [ ] One normal change linked to the problem as its fix.
- [ ] One REQ with at least one RITM; SCTASK present or the waiting stage documented.
- [ ] Flow is active, fires only on the change to Critical, and its execution log shows both the immediate run and the paused-then-resumed run.
- [ ] Replay guide names, for each record, the process, its number prefix, and the question it answers ("restore service," "remove cause," "alter production safely," "deliver something normal to want").

## Evidence checklist
- [ ] Table of every record number created, its table, and its parent/linked record.
- [ ] Screenshot: parent incident with Child Incidents related list.
- [ ] Screenshot: emergency change with Change Tasks related list and the states you passed through.
- [ ] Screenshot: problem with Incidents related list and the linked normal change.
- [ ] Screenshot: RITM showing parent REQ, catalog item, variables, and SCTASK (or the stage it waits on).
- [ ] Screenshot: flow in the designer (trigger + actions) and the **Active** indicator.
- [ ] Screenshot: execution detail of a completed run and of the paused run *before* you approved it.
- [ ] Screenshot: `sys_email` entry for the alert.
- [ ] Verification script output with every line PASS.

### Verification script (read-only)
Replace the number in the first line with your parent incident number, then run in **Scripts - Background**.

```javascript
var PARENT = 'INC0010001'; // <-- your parent incident number
function check(label, ok) { gs.print((ok ? 'PASS  ' : 'FAIL  ') + label); }

var p = new GlideRecord('incident');
check('parent incident found', p.get('number', PARENT));

var kids = new GlideRecord('incident');
kids.addQuery('parent_incident', p.getUniqueValue());
kids.query();
check('3 child incidents (found ' + kids.getRowCount() + ')', kids.getRowCount() == 3);

var prb = p.problem_id.getRefRecord();
check('parent linked to a problem', prb.isValidRecord());

var linked = new GlideRecord('incident');
linked.addQuery('problem_id', prb.getUniqueValue());
linked.query();
check('4 incidents on the problem (found ' + linked.getRowCount() + ')', linked.getRowCount() == 4);

var chg = p.rfc.getRefRecord();
check('parent linked to a change', chg.isValidRecord());
check('that change is Emergency', chg.isValidRecord() && chg.getValue('type') == 'emergency');

var ct = new GlideRecord('change_task');
ct.addQuery('change_request', chg.getUniqueValue());
ct.query();
check('2 change tasks (found ' + ct.getRowCount() + ')', ct.getRowCount() == 2);

var fix = new GlideRecord('change_request');
fix.addQuery('type', 'normal');
fix.addQuery('parent', prb.getUniqueValue()).addOrCondition('problem', prb.getUniqueValue());
fix.query();
gs.print('INFO  normal changes linked to problem: ' + fix.getRowCount() + ' (link field varies by release; 0 here means check the problem form manually)');

var crit = new GlideRecord('sys_journal_field');
crit.addQuery('name', 'incident');
crit.addQuery('element', 'work_notes');
crit.addQuery('value', 'CONTAINS', 'Critical alert sent to on-call');
crit.query();
check('flow wrote at least one alert work note (found ' + crit.getRowCount() + ')', crit.getRowCount() >= 1);
```

The fix-change check prints INFO rather than PASS/FAIL because the field that links a change to a problem differs by release and plugin; verify it on the form.

## Rubric
| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Record selection | One or more records on the wrong table (e.g. request logged as incident) | Every record on the correct table with correct type | Replay guide explains *why* each alternative table would be wrong |
| Linking | Records exist but are not linked | Parent/child, problem, and change links all correct | Uses related lists to navigate the whole chain from any record |
| Flow design | Fires on every update or not active | Fires once on the change to Critical; both actions run | Explains why the work note is a flow step but a due-date stamp would be a business rule |
| Evidence of waiting | No paused execution shown | Paused and resumed executions shown | Annotates where the flow persisted its state while paused |
| Communication | Guide is a list of numbers | Guide maps record → process → question | Guide is usable by a new agent with no help |

## Stretch goals
- Add a branch: if the incident's Configuration item is Expense App, also create an incident task for the platform team.
- Build a report (bar chart) of open task records by **Task type** that shows all your Tuesday records in one query, and explain why that works.
- Write the same alert as a description of an *after* business rule (do not build it) and list what you would lose compared with the flow (execution log, wait capability).

## Reflection prompts
- At 09:30 you had to decide between four separate incidents and one parent with children. What would reporting look like next month under each choice?
- Which record in your replay would an auditor (lesson 7, GRC) care about most, and why?
- In your flow's execution log, where did the time go? What would that tell a service desk manager?

## Instructor notes (common pitfalls, how to adapt for time)
- **Field names used in the script** (`parent_incident`, `problem_id`, `rfc`) are the long-standing incident fields; confirm on the current PDI release. If a check FAILs while the form looks right, have the learner open `sys_dictionary` for the field label to find the real name — that is a lesson 4 skill.
- **Change state progression** on a PDI depends on change models and whether a CAB/approval group has members. Learners may stall at Assess/Authorize; documenting where and why it stopped is acceptable evidence.
- **Major Incident Management** is a separate plugin; do not require it.
- **Catalog content** differs between PDI builds. Any item that produces a RITM is acceptable.
- **Email**: outbound mail is typically disabled on PDIs; the `sys_email` record is the evidence.
- **Time-box:** for a 2.5-hour version, skip milestones 4's normal change and milestone 8.
