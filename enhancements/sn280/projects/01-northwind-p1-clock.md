---
course_id: sn280
project_id: sn280-x01
title: "Northwind P1 Clock: Incident Rules and a Testable SLA"
kind: supplementary-project
status: draft
hours_estimate: 6
difficulty: core
related_lessons:
  - sn280-03
  - sn280-08
objectives:
  - Configure incident management including states, priority, assignment, and major incident handling
  - Define SLAs, OLAs, and schedules that measure the commitment the business actually made
competency_ids:
  - D2-S1-C01
  - D2-S1-C04
---

## Scenario
Northwind Regional Health (the lesson 12 customer) has incident management that "works" but nobody trusts its numbers. Before the steering group approves phase two, the IT director wants proof that a P1 at one of the four hospitals is (a) prioritized by the matrix, not by whoever logs it, (b) routed to the right site team with no human hop, (c) cannot be resolved without a close code from any channel, and (d) measured by an SLA that pauses only when Northwind is genuinely waiting on the caller. You will configure it on your PDI and prove each point with evidence a sceptical auditor would accept.

## What you will build / produce
- Incident data policy (Resolved requires `close_code` and `close_notes`) and UI policy (On Hold requires `hold_reason`).
- Two assignment rules routing Hardware incidents by caller location to two site groups.
- Three schedules: 24x7, Northwind business hours (08:00–18:00 Mon–Fri), Northwind holidays (excluded from business hours).
- Two SLA definitions on `incident`: **NW P1 Resolution** (24x7) and **NW P2 Resolution** (8 business hours), each pausing only on hold reason *Awaiting Caller*.
- A **test-scale** copy of the P1 SLA (**NW P1 Resolution — TEST**, duration 10 minutes, with a 50% warning) so you can watch a full lifecycle in one sitting.
- ATF test + background verification script; an SLA design note (1 page).

## Before you start (prerequisites, starter files or data)
- PDI with ITSM demo data; admin; a named update set `NW Phase 1 — incident rules and SLAs`.
- Two locations from demo data (record them) to stand in for "Northwind North Hospital" and "Northwind South Hospital", and two groups `NW North Field Services`, `NW South Field Services` (create; add one member each).
- Two demo users with those locations set (callers).
- Confirm hold reason choices on your instance: open an incident, set State On Hold, read the Hold reason values; record the stored value for *Awaiting Caller* (often `1`) via `sys_choice.list` (table incident, element hold_reason).
- SLA module paths: Service Level Management > SLA > SLA Definitions; schedules under System Scheduler > Schedules (labels may vary by release).

## Milestones
1. **Priority sanity.** Without changing anything, create incidents at I1/U1, I2/U2, I3/U3 and record priorities. Locate the priority data lookup (System Policy > Rules > Priority Data Lookup, or `dl_u_priority.list`). Do **not** change it; write one sentence on why a matrix change is a customer decision.
2. **State rules.** Data policy on `incident`: condition State is Resolved → `close_code`, `close_notes` mandatory; enable *Use as UI policy on client* so the ATF mandatory-field assertion is satisfied (or add an equivalent UI policy); decide and justify *Apply to import sets* separately. UI policy: State is On Hold → `hold_reason` mandatory, Reverse if false, On load.
3. **Assignment rules.** System Policy > Rules > Assignment (`sysrule_assignment`): rule 1 order 100, table incident, condition Category is Hardware AND Caller.Location is North → group NW North; rule 2 order 200 for South. Create one incident per site and confirm routing. Create one Software incident and confirm neither rule fires.
4. **Schedules.** Build the three schedules; add three holiday dates (one must be a weekday in the next month); set business hours to exclude the holiday schedule. Set the business-hours schedule's time zone explicitly and record it.
5. **SLA definitions.** Build NW P1 (Start: Priority is 1 - Critical; Pause: State is On Hold AND Hold reason is Awaiting Caller; Stop: State is Resolved; Duration 4 h; Schedule 24x7) and NW P2 (8 h, business hours). Then copy NW P1 as **TEST** with 10 minutes and add a 50% warning (via the SLA's flow or a notification on `task_sla` condition `percentage ≥ 50` — record which mechanism your release supports). Make TEST's start condition also require Short description *starts with* `[SLATEST]` so it never attaches to real records.
6. **Run the clock (≈ 20 minutes).** Create `[SLATEST] North MRI workstation down` at I1/U1 with a North caller, Hardware category. Then:
   - t+2 min: On Hold, reason **Awaiting Caller**. Wait 3 minutes. Back to In Progress.
   - t+6 min: On Hold, reason **Awaiting Vendor** (or another non-caller reason). Wait 2 minutes — clock must keep running. Back to In Progress.
   - Try to Resolve without a close code → blocked. Then resolve properly.
   Open the `task_sla` record for TEST: record Business elapsed, Actual elapsed, Business elapsed percentage, Has breached, Pause duration. Open the SLA **Timeline** (related link on the task SLA, where available).
7. **Prove the server-side rule.** Run the verification script below — it attempts a scripted resolve without a close code.
8. **P2 arithmetic.** Create a P2 incident and record the planned end time of NW P2. Then compute by hand what it would be for a P2 created at 16:00 on the Friday before your weekday holiday; check by temporarily setting the SLA's schedule start via the SLA definition's **Test** (if your release has the SLA timeline/test feature) or by reasoning — show your arithmetic.
9. **ATF.** Build the test listed under Automated checks; run green.
10. **Design note.** One page in the format of lesson 8's worked example: one row per SLA (table, condition, start, pause, stop, duration, schedule, type, warnings) plus every ambiguity you resolved.

## Acceptance criteria
- [ ] Priorities match the baseline matrix for the three test incidents.
- [ ] A scripted resolve without a close code is rejected (data policy holds server-side).
- [ ] Hardware incidents route by caller location with no manual assignment; non-hardware incidents are untouched by the rules.
- [ ] TEST SLA paused only during *Awaiting Caller*; pause duration ≈ 3 minutes (± scheduler granularity); actual elapsed − business elapsed ≈ pause duration.
- [ ] 50% warning fired (email log `sys_email` or notification record).
- [ ] No out-of-box record modified; everything in the named update set (or listed as data that did not travel).

## Evidence checklist
- [ ] Table of incident numbers created, with impact, urgency, priority, assignment group.
- [ ] Screenshots: data policy, UI policy, both assignment rules (with Order), three schedules (spans and the excluded child schedule).
- [ ] Screenshots: both SLA definitions (Start/Pause/Stop tabs) and the TEST copy.
- [ ] `task_sla` record for the TEST run with the five values from milestone 6, plus timeline screenshot if available.
- [ ] `sys_email` (or notification) entry for the 50% warning.
- [ ] Verification script output (all PASS).
- [ ] ATF result 1/1 passed.
- [ ] Update set customer updates list, and a list of what did not travel (e.g. groups, group members, schedule entries if not captured).
- [ ] The one-page SLA design note.

## Automated checks
### Verification script (Scripts - Background, global)
```javascript
(function () {
  function check(label, ok) { gs.info((ok ? 'PASS ' : 'FAIL ') + label); }

  // 1. Data policy holds for scripted writes
  var inc = new GlideRecord('incident');
  inc.initialize();
  inc.setValue('short_description', '[SLATEST] verifier ' + new GlideDateTime().getValue());
  inc.setValue('impact', '1');
  inc.setValue('urgency', '1');
  var id = inc.insert();
  check('test incident inserted', !!id);
  if (!id) { return; } // Do not query or delete using a missing verifier id.
  check('priority derived as 1', inc.getValue('priority') === '1');
  inc.setValue('state', '6');          // Resolved, no close code
  var ok = inc.update();
  var reread = new GlideRecord('incident');
  reread.get(id);
  check('resolve without close code rejected (state=' + reread.getValue('state') + ')',
        reread.getValue('state') !== '6');

  // 2. SLA attached
  var sla = new GlideRecord('task_sla');
  sla.addQuery('task', id);
  sla.addQuery('sla.name', 'STARTSWITH', 'NW P1 Resolution');
  sla.query();
  check('NW P1 SLA(s) attached (found ' + sla.getRowCount() + ')', sla.getRowCount() >= 1);

  // 3. Assignment rules exist and are ordered
  var ar = new GlideRecord('sysrule_assignment');
  ar.addQuery('name', 'STARTSWITH', 'NW ');
  ar.orderBy('order');
  ar.query();
  check('two NW assignment rules (found ' + ar.getRowCount() + ')', ar.getRowCount() === 2);

  // Clean up the verifier record
  reread.deleteRecord();
})();
```
If the data-policy check FAILs, confirm the data policy is active and that its *Apply to import sets*/server enforcement settings are as you intended; data policies are enforced server-side for scripted writes on standard releases — record what you observed if not.

### ATF test: `NW - P1 hardware routes North and requires close code`
1. *Impersonate* — a user with `itil`.
2. *Open a New Form* — Incident.
3. *Set Field Values* — Caller (North user), Category Hardware, Impact 1, Urgency 1, Short description `[ATF] NW routing`.
4. *Submit a Form*.
5. *Record Validation* — Priority = 1 - Critical; Assignment group = NW North Field Services.
6. *Open an Existing Record* — the submitted incident (data pill).
7. *Set Field Values* — State = Resolved.
8. *Field State Validation* — Resolution code and Resolution notes **mandatory**.
9. *Run Server Side Script* — assert a `task_sla` exists for the record with SLA name starting `NW P1`.

Client steps need the Client Test Runner open; set `sn_atf.runner.enabled = true`.

## Rubric
| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Incident rules | UI policy only, bypassable | Data policy proven server-side; hold reason enforced | Explains each data-policy option chosen |
| Routing | Manual or hard-coded in script | Two ordered assignment rules, verified | Documents the CI support-group alternative and its data dependency |
| Schedules | 24x7 only | Business hours + holidays + explicit time zone | Shows a holiday case in the arithmetic |
| SLA behaviour | Pauses on any hold | Pauses only on Awaiting Caller, proven by timings | Explains reprioritization behaviour and retroactive start choice |
| Evidence & design note | Screenshots without explanation | Complete checklist + one-page note | Note is signable by a service owner without edits |

## Stretch goals
- Add an OLA for NW North Field Services (30-minute response, stop on first work note by a group member) and show it ticking independently.
- Reprioritize a TEST incident P2 → P1 and record what happens to each SLA with retroactive start on and off.
- Build a report: SLA attainment by definition this month, and a list of breached task SLAs with pause duration.

## Reflection prompts
- Which of Northwind's four questions about "four hours" did your configuration answer, and which still needs a customer decision?
- What would change in your evidence if the schedule's time zone were left blank?
- Which of your rules would an integration bypass, and which would it not?

## Instructor notes (common pitfalls, how to adapt for time)
- SLA timers are evaluated by scheduled jobs; small discrepancies (tens of seconds) in pause duration are normal.
- Learners often attach TEST SLAs to real demo records; the `[SLATEST]` start condition prevents it.
- Assignment rules do not fire when an assignment group is already set, and other routing (assignment data lookups, flows) may run first — use Debug Business Rule if routing surprises.
- Hold reason stored values vary; insist on reading them from `sys_choice`.
- Warning mechanism (SLA flow vs notification on `task_sla`) varies by release; accept either with evidence.
- **Time-box:** 3-hour version — skip milestones 8 and 9.
