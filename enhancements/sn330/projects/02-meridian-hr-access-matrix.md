---
course_id: sn330
project_id: sn330-x02
title: "Meridian HR Access Matrix and Separation Audit"
kind: supplementary-project
status: draft
hours_estimate: 6
difficulty: stretch
related_lessons:
  - sn330-08
  - sn330-02
  - sn330-03
objectives:
  - Apply access controls and data-privacy practices that keep sensitive HR data restricted
  - Describe HRSD's scoped application structure and how HR services, COEs, and scoped data separation work
competency_ids:
  - D4-S1-C04
  - D1-S1-C03
  - D4-S1-C01
---

## Scenario

Meridian Logistics, the roughly 4,000-employee US/UK/India employer from the onboarding capstone, is about to put employee relations investigations into HRSD. Before go-live, the Chief People Officer wants proof, not assurances, that (1) HR shared services agents cannot reach an employee relations case by any path, (2) employees see their own cases but never internal work notes, (3) managers see only what a narrow requirement allows, and (4) compensation fields are hidden even from agents who can read the case. You will build the group and role model, write the minimum ACLs, and deliver an audit pack built around a predicted-versus-actual access matrix.

## What you will produce

- A one-page access requirements statement (every control traces to a line in it).
- Groups with role grants (no direct user role grants).
- ACLs for self-access and a restricted field, each with its requirement in the description.
- A 10-persona by 9-object access matrix, predicted then tested by impersonation.
- A findings report with severity and fixes, plus a side-channel audit.

## Before you start (prerequisites, starter files or data)

- A PDI with HR Service Delivery core and at least two COE case tables available (for example, HR shared services / workforce administration and employee relations). On a PDI, HRSD plugins typically need to be activated from the developer portal's plugin activation page; exact plugin names vary by release. If an employee relations COE table is not available on your PDI, use any second COE case table and name it as the restricted COE in your report (flag this in your findings).
- Synthetic users: `mer.employee1` (subject of the cases), `mer.employee2`, `mer.manager1` (manager of employee1), `mer.manager2`, `mer.hrss.agent`, `mer.er.agent`, `mer.tr.agent` (if a total rewards COE exists), `mer.hr.admin`, `mer.facilities` (assigned an HR task only), `mer.integration` (service account), `mer.leaver` (inactive).
- Test data: one general HR case for `mer.employee1` ("Employment verification letter", matching lesson 3), one employee relations case for `mer.employee1`, one HR task on the general case assigned to a facilities group, a PDF attachment named `ATF-test-medical-note.pdf` (dummy content) on the employee relations case, and a work note plus an additional comment on each case.
- Update set `MERIDIAN-SEC-001`.

## Milestones

1. **Requirements statement (one page).** Who may read each COE's cases; who may read HR profiles; exactly what a manager may see about a direct report (for this project: the onboarding/lifecycle activities they participate in and nothing in employee relations); who may read compensation.
2. **Groups and roles.** Create groups `MER HR Shared Services`, `MER Employee Relations`, `MER HR Admins`, `MER Facilities`. Grant COE roles to groups only. Use the shipped HRSD role names on your release (record them in your report; lesson 8 describes the reader/writer/admin pattern without naming them).
3. **Prove structural separation.** As `mer.hrss.agent`, attempt to reach the employee relations case five ways: direct URL, list view, global search, a report over HR case tables, and a related list on `mer.employee1`'s user record. All five must fail.
4. **Self-access.** Confirm (or build, if your release does not ship it) the rule that lets `mer.employee1` read their own cases in the portal; confirm they can read additional comments and cannot read work notes.
5. **Restricted field.** Add a compensation field to the general case (or use an existing one on the HR profile), and write a field-level read ACL restricted to `MER HR Admins`. Verify as `mer.hrss.agent` on form, list (add the column), and export (to CSV).
6. **Task participation.** As `mer.facilities`, open and close the assigned HR task; attempt to open the parent case. Record both.
7. **Attachment.** As `mer.hrss.agent` and as `mer.manager1`, attempt to download the attachment by its direct `sys_attachment.do?sys_id=` URL (copy the sys_id as admin).
8. **Matrix.** Fill in every predicted cell first, then impersonate each persona and test. Use list, search, and direct URL for every "should be denied" cell.
9. **Side channels.** Review the case notifications, one report, and the clone exclusion/data-preserver configuration (or document that the PDI has none, and what you would configure).
10. **Findings report.**

## Acceptance criteria

- [ ] No test user holds an HR role granted directly (proven by script below).
- [ ] All five separation paths fail for `mer.hrss.agent`.
- [ ] `mer.employee1` reads own case comments, never work notes.
- [ ] The compensation field is absent for agents on form, list, and export.
- [ ] `mer.facilities` completes the task without reading the case.
- [ ] Every ACL created has its requirement in its description.
- [ ] The matrix has predicted and actual values for every cell, and every divergence is a finding with a fix or an accepted-risk note.

## Evidence checklist

- [ ] Requirements statement.
- [ ] Output of this script (Scripts - Background) listing any direct (non-inherited) role grants on the test users; expected output is none for HR roles:

```javascript
var ur = new GlideRecord('sys_user_has_role');
ur.addQuery('user.user_name', 'STARTSWITH', 'mer.');
ur.addQuery('inherited', false);
ur.query();
var n = 0;
while (ur.next()) {
  n++;
  gs.info('DIRECT GRANT: ' + ur.getDisplayValue('user') + ' -> ' + ur.getDisplayValue('role'));
}
gs.info('Direct grants found: ' + n);
```

- [ ] Output of this script listing the ACLs you created and confirming each has a description:

```javascript
var acl = new GlideRecord('sys_security_acl');
acl.addQuery('sys_created_by', gs.getUserName());
acl.addQuery('sys_created_on', '>=', gs.daysAgoStart(14));
acl.query();
while (acl.next()) {
  gs.info(acl.getValue('name') + ' | ' + acl.getValue('operation') + ' | description: ' + (acl.getValue('description') ? 'yes' : 'MISSING'));
}
```

- [ ] Screenshots for each of the five separation attempts, with the impersonated user's name visible.
- [ ] Screenshot of the CSV export as `mer.hrss.agent` showing no compensation column values.
- [ ] Completed matrix (template below).
- [ ] Findings report: each divergence with severity (block release / fix before go-live / accept), cause, fix, and re-test result.

Matrix template (P = predicted, A = actual; values R = read, W = write, - = no access):

| Persona | Own case | Other's general case | ER case | Other's HR profile | Compensation field | ER attachment | Manager-only KB article | Report over HR cases |
|---|---|---|---|---|---|---|---|---|
| mer.employee1 | P: / A: | | | | | | | |
| mer.manager1 (own report) | | | | | | | | |
| mer.manager2 (not their report) | | | | | | | | |
| mer.hrss.agent | | | | | | | | |
| mer.er.agent | | | | | | | | |
| mer.hr.admin | | | | | | | | |
| mer.facilities (task only) | | | | | | | | |
| mer.integration | | | | | | | | |
| mer.leaver (inactive) | | | | | | | | |

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Traceability | ACLs without stated requirement | Every control traces to the requirements page | Requirements page also states what is deliberately *not* granted |
| Role model | Direct grants or a catch-all HR group | Group-based grants per team | Includes a quarterly access-review design for the ER group |
| Verification | Form-only checks, or as admin | Five-path checks by impersonation | Matrix re-run after each fix with diffs recorded |
| Privacy side channels | Not reviewed | Notifications, report, clone reviewed | Concrete clone masking/exclusion recommendation with tables named |
| Report quality | List of observations | Severity, cause, fix, re-test per finding | A CPO could sign off or block from page one |

## Stretch goals

- Enable read auditing or access logging for the ER table if your release supports it, and show a log entry for `mer.er.agent` opening the case.
- Write one ATF test per critical denial (for example, impersonate `mer.hrss.agent`, Record Query on the ER table for the case sys_id, assert no records). See sn301.

## Reflection prompts

- Which denial would you have assumed held but found did not? What does that say about form-only testing?
- The stakeholder says "managers should see their team's cases." Write the one-sentence clarifying question you would ask.

## Instructor notes (common pitfalls, how to adapt for time)

- The most common gap is the attachment path and the export path. Insist on both.
- Learners sometimes "fix" a leak by hiding a module or a related list. That is not access control; require the direct-URL re-test.
- HRSD shipped ACLs and role names vary by release; grade on the method and evidence, not on matching a specific role name.
- For a shorter session, drop the integration and leaver personas and the side-channel audit.
