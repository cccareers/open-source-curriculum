---
course_id: sn280
project_id: sn280-x02
title: "From VPN Problem to Standard Change"
kind: supplementary-project
status: draft
hours_estimate: 6
difficulty: core
related_lessons:
  - sn280-04
  - sn280-05
objectives:
  - Configure problem management and connect it to incident and change records
  - Configure change management with change types, approvals, and a change schedule
competency_ids:
  - D2-S1-C01
  - D10-S1-C02
---

## Scenario
Lesson 4's VPN gateway keeps dropping remote sessions; the desk logs and closes about twenty-five incidents in ninety days. Lesson 5's lesson is that the routine fix belongs on a standard change, not a CAB agenda. In this project you run the whole loop on your PDI: find the cluster, raise and triage the problem, publish a workaround as a known error, fix it through a normal change created from the problem, and then turn the monthly gateway config refresh into a standard change template — while respecting a blackout window.

## What you will build / produce
- A CI `vpn-gw-01` (class: network gear / any `cmdb_ci_netgear` subclass available) with a support group.
- 6 incidents on that CI (stand-ins for the 25), linked to one problem.
- A problem taken New → Assess → Root Cause Analysis → Fix in Progress → Resolved with `cause_notes`, `workaround`, `known_error`, `fix_notes`, and two problem tasks.
- A normal change created *from* the problem (`problem.rfc` populated), approved, implemented, closed.
- A **standard change template** "VPN gateway monthly config refresh" (via the standard change proposal path), with implementation/test/backout plans and two change tasks.
- A blackout schedule and a maintenance window, and three changes testing conflict detection.
- Reports: incidents attributable to open problems; known errors with no workaround.

## Before you start (prerequisites, starter files or data)
- PDI with ITSM demo data; admin; named update sets per unit of work (`NW-VPN problem config`, `NW-VPN change config`).
- Groups: Network (demo), Identity (create), CAB (demo "CAB Approval" or create), each with a member you can impersonate.
- Check what your instance offers: Problem states (open a problem, read the State choices and stored values); Change > Standard Change Catalog / "Propose Standard Change"; Change > Schedules / Blackout Schedules / Maintenance Schedules; conflict detection (the *Conflicts* tab and *Check Conflicts* action on a change). Record any that are missing (risk/CAB plugins may not be active on a PDI).

## Milestones
1. **Seed the cluster.** Create the CI. Create 6 incidents (category Network, CI `vpn-gw-01`, short description variations of "VPN session dropped"), resolve 4 with close code "Solved (Work Around)" or your instance's equivalent.
2. **Find it by report.** Build a report: incidents last 90 days, grouped by CI, filtered category Network, sorted by count. Screenshot `vpn-gw-01` at the top.
3. **Problem from evidence.** From one incident use **Create Problem** (UI action). Then link the other five with a list edit of `problem_id` (no opening records one by one).
4. **Triage and investigate.** Move to Assess (assign Network, set impact). Then RCA: add two problem tasks (Network: capture gateway logs; Identity: check token lifetime). Close the Identity task with the finding. Try to leave RCA with the Network task still open — record what happens. If the platform allows it, add a data policy or business rule condition to block it (lesson 4 practice 5) — configuration preferred; justify any script.
5. **Known error.** Fill `cause_notes`, `workaround`; set `known_error`. Show how an agent sees the workaround from an incident (related problem link or a dot-walked field on the incident form layout — `problem_id.workaround` — choose and justify).
6. **Fix via change.** From the problem, **Create Normal Change** (or the equivalent UI action on your release); confirm `problem.rfc` is set and the problem moves to Fix in Progress (manually if your instance does not automate it — document which). Plan dates inside the maintenance window from milestone 8. Approve (impersonate an approver), implement, close successful. Do **not** auto-resolve the problem: record two weeks of zero incidents as the verification narrative (simulated), then resolve with `fix_notes`; clear `known_error`.
7. **Standard change template.** Propose "VPN gateway monthly config refresh" with full plans and two pre-populated change tasks; approve the proposal; create a change from the Standard Change Catalog; confirm it requires no approval.
8. **Schedule.** Create a maintenance schedule (first Saturday 01:00–05:00) for `vpn-gw-01` and a blackout schedule covering a week next month. Create three standard changes: inside the window, outside the window, inside the blackout. Run **Check Conflicts** on each; record results. Write your block-vs-warn recommendation (lesson 5).
9. **Reports.** Incidents attributable to open problems; known errors with no workaround. Run the verification script.

## Acceptance criteria
- [ ] Six incidents reference the problem; problem's `rfc` references the change; change references the problem (field name per release).
- [ ] Problem has `cause_notes`, `workaround`, `fix_notes`, two problem tasks, and passed through Assess.
- [ ] Standard change created from the template has no approval records.
- [ ] Conflict results recorded for all three scheduled changes, with a written block/warn recommendation.
- [ ] No out-of-box record modified, or each modification listed with reason.

## Evidence checklist
- [ ] Trend report screenshot; record numbers table (INC×6, PRB, PTASK×2, CHG normal, CHG standard×4).
- [ ] Problem activity stream showing state transitions.
- [ ] Screenshot of how the workaround appears to an agent on an incident.
- [ ] Normal change with approvals related list; standard change with empty approvals.
- [ ] Conflicts tab for each of the three scheduled changes.
- [ ] Update sets' contents + list of data that did not travel (schedules' entries, groups, incidents).
- [ ] Verification script output.

### Verification script (Scripts - Background)
```javascript
(function () {
  var PRB = 'PRB0040001'; // <-- your problem number
  function check(label, ok) { gs.info((ok ? 'PASS ' : 'FAIL ') + label); }

  var p = new GlideRecord('problem');
  check('problem found', p.get('number', PRB));

  var inc = new GlideAggregate('incident');
  inc.addQuery('problem_id', p.getUniqueValue());
  inc.addAggregate('COUNT');
  inc.query(); inc.next();
  check('6 incidents linked (found ' + inc.getAggregate('COUNT') + ')', inc.getAggregate('COUNT') === '6');

  var pt = new GlideAggregate('problem_task');
  pt.addQuery('problem', p.getUniqueValue());
  pt.addAggregate('COUNT');
  pt.query(); pt.next();
  check('2 problem tasks (found ' + pt.getAggregate('COUNT') + ')', pt.getAggregate('COUNT') === '2');

  check('cause_notes filled', !p.cause_notes.nil());
  check('workaround filled', !p.workaround.nil());
  check('fix_notes filled', !p.fix_notes.nil());

  var chg = p.rfc.getRefRecord();
  check('problem.rfc set to a change', chg.isValidRecord());
  check('fix change is normal', chg.isValidRecord() && chg.getValue('type') === 'normal');

  var std = new GlideRecord('change_request');
  std.addQuery('type', 'standard');
  std.addQuery('short_description', 'CONTAINS', 'VPN gateway monthly config refresh');
  std.query();
  var anyApproval = false, n = 0;
  while (std.next()) {
    n++;
    var ap = new GlideRecord('sysapproval_approver');
    ap.addQuery('sysapproval', std.getUniqueValue());
    ap.query();
    if (ap.hasNext()) { anyApproval = true; }
  }
  check('standard changes from template (found ' + n + ')', n >= 3);
  check('no approvals on standard changes', !anyApproval);
})();
```
Field names (`problem_id`, `rfc`, `problem`, `cause_notes`, `fix_notes`) are long-standing; if a check fails while the form looks right, confirm the column name in `sys_dictionary` (a lesson-6 skill) and adjust.

### ATF (optional)
*Impersonate* an itil user → *Record Insert* incident on `vpn-gw-01` with `problem_id` = your problem → *Open an Existing Record* → *Field Value Validation* on the dot-walked workaround field you placed on the form (proves agents see it).

## Rubric
| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Problem lifecycle | States skipped; no cause/fix notes | All states with decisions and notes; tasks used | Rejection path also demonstrated with a reason field |
| Linking | Links missing or typed as text | All references correct and navigable | Reports prove "incidents explained by open problems" |
| Change design | Fix done without change, or auto-resolved problem | Normal change from problem; verification before resolve | Failure path described (change backed out → problem to RCA) |
| Standard change | Template lacks plans | Proposal approved; changes need no approval | Scope exclusions written into the template |
| Schedule | No conflict evidence | Three cases recorded with recommendation | Explains why hard-blocking CI collisions corrupts the calendar |

## Stretch goals
- Implement the failure path: close the fix change as unsuccessful and move the problem back to RCA with a notification to the owner (flow, no script).
- Publish the known error as a knowledge article (if Knowledge is active) and compare discoverability with the dot-walked field.

## Reflection prompts
- Where did the platform push you toward the right process, and where did you have to hold the line yourself?
- What did the standard change template cost to write, and what does it save per month?
- Which link (incident→problem, problem→change) would you most expect a real team to skip, and how would your reports reveal it?

## Instructor notes (common pitfalls, how to adapt for time)
- UI action names (Create Problem, Create Normal Change) and whether problem state follows the change automatically vary by release; accept documented manual steps.
- Standard change proposals and the Standard Change Catalog are part of baseline change management on recent releases; CAB Workbench and risk assessment may need plugins — not required here.
- Conflict detection depends on the CI being on the change and schedules being linked to the CI; most "no conflict found" surprises are a missing CI.
- **Time-box:** 3-hour version — skip milestones 2, 8 and the reports.
