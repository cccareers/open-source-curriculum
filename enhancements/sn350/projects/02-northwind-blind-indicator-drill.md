---
course_id: sn350
project_id: sn350-x02
title: "The Blind Indicator: Northwind Monitoring and Issue Loop Drill"
kind: supplementary-project
status: draft
hours_estimate: 5
difficulty: stretch
related_lessons:
  - sn350-07
  - sn350-09
objectives:
  - Configure indicators that test control effectiveness continuously instead of once a year
  - Route a failed control into an issue and a remediation task, and support an audit engagement
competency_ids:
  - D10-S1-C05
  - D9-S1-C03
---

## Scenario

Northwind Health's dormant-privileged-account indicator (lesson 7) has reported "pass" on every finance server for six weeks. The internal auditor has just found that the integration loading the account data stopped running five weeks ago. The CISO asks two questions: "How do we stop a blind indicator from reporting success?" and "When it does fail, how do we make sure we get one issue that is actually fixed, not twenty-one that are closed?" You will rebuild the indicator logic with a staleness guard, prove it, and run a failure through the full issue lifecycle.

## What you will produce

- Two small custom tables of test data standing in for the identity feed.
- A scripted indicator evaluation (as a GRC indicator if available, otherwise as a Script Include called by a scheduled job) with a staleness guard returning unknown.
- An idempotent issue-raising function, triggered after two consecutive failures.
- A full issue lifecycle: triage, root cause, tactical and systemic tasks, independent verification, closure with evidence.
- A drill log covering five scenarios.

## Before you start (prerequisites, starter files or data)

- PDI with Policy and Compliance Management (and GRC core) activated if possible. If GRC indicators or issues are not available on your PDI, build the evaluation as a Script Include plus scheduled job, and use a custom `u_grc_issue_sim` table with fields `related_control` (string), `source_type`, `state`, `severity`, `detail`, `work_notes` (journal). Record which path you used.
- Create `u_privileged_account` (fields: `ci` reference to `cmdb_ci_server`, `account_name`, `active` true/false, `last_used_on` date/time) and `u_privileged_account_load` (fields: `ci` reference, `rows_loaded` integer). Pick two demo servers as "FIN-APP-01" and "FIN-DB-01" stand-ins.
- Confirm every custom field name in the dictionary before running the scripts; replace illustrative names such as `ci`, `active`, `last_used_on`, and `source_type` with the actual names (Global custom fields normally have a `u_` prefix). Use choice stored values `closed`, `cancelled`, and `indicator` on the fallback issue table, or adapt the verifier to your values.
- Seed data: four accounts per server, all used within the last 10 days; one load record per server dated today.

## Milestones

1. **Write the evaluator** following lesson 7, with the guard *inside* the function and before the main query. A corrected skeleton:

```javascript
function evaluateDormancy(entitySysId) {
  var THRESHOLD_DAYS = 90, MAX_LOAD_AGE_DAYS = 2;
  var cutoff = new GlideDateTime(); cutoff.addDaysUTC(-THRESHOLD_DAYS);
  var loadCutoff = new GlideDateTime(); loadCutoff.addDaysUTC(-MAX_LOAD_AGE_DAYS);

  var pop = new GlideAggregate('u_privileged_account');
  pop.addQuery('ci', entitySysId); pop.addAggregate('COUNT'); pop.query();
  var total = pop.next() ? parseInt(pop.getAggregate('COUNT'), 10) : 0;

  var load = new GlideRecord('u_privileged_account_load');
  load.addQuery('ci', entitySysId);
  load.addQuery('sys_created_on', '>=', loadCutoff);
  load.setLimit(1); load.query();
  if (total === 0 || !load.hasNext()) {
    return { passed: null, value: null, detail: 'Source data missing or stale; not evaluated.' };
  }

  var offenders = [];
  var acct = new GlideRecord('u_privileged_account');
  acct.addQuery('ci', entitySysId);
  acct.addQuery('active', true);
  acct.addQuery('last_used_on', '<', cutoff);
  acct.query();
  while (acct.next()) offenders.push(acct.getValue('account_name'));

  return { passed: offenders.length === 0, value: offenders.length,
           detail: offenders.length === 0 ? 'No dormant privileged accounts.'
                   : 'Dormant privileged accounts: ' + offenders.join(', ') };
}
```

2. **Wire failure behavior:** raise an issue only after two consecutive failures, using the lesson 9 reuse branch (update the open issue rather than create another).
3. **Run the five drill scenarios** and log each result:
   - **A. Healthy:** expect pass, no issue.
   - **B. Blind:** delete the load records for FIN-APP-01 (or back-date them 5 days). Expect unknown, not pass, and no issue.
   - **C. Empty:** delete all accounts for FIN-DB-01 but keep a fresh load record. Expect unknown.
   - **D. One failure:** restore data, set two accounts on FIN-APP-01 to `last_used_on` 120 days ago, run once. Expect fail, no issue.
   - **E. Persistent failure:** run three more times. Expect exactly one open issue, with later failures appended to work notes.
4. **Work the issue.** Triage; classify root cause (expected: process gap, leaver process misses local accounts). Create a tactical task (remove the two accounts, phrased for the infrastructure team, listing them) and a systemic task (extend the leaver process). Request and approve a due-date extension on the systemic task, keeping the original date.
5. **Verify independently.** Deactivate the two accounts, then run the evaluator on five consecutive days (simulate by running five times with a note, or adjust `sys_created_on` of result records in a sandbox) and record five passes. Verification is by someone other than the fixer (use a second test user).
6. **Close with evidence**, then write the drill log and a one-paragraph answer to the CISO.

## Acceptance criteria

- [ ] Scenarios B and C return unknown, never pass.
- [ ] Scenario D raises no issue; scenario E raises exactly one.
- [ ] The issue's detail names the offending accounts, so the assignee never re-runs the query.
- [ ] Tactical and systemic tasks exist; the systemic extension is approved and the original due date is preserved.
- [ ] Closure is verified by indicator passes and by a different user than the one who did the work.

## Evidence checklist

- [ ] Evaluator code and the scheduled job or indicator configuration.
- [ ] Drill log table: scenario, expected, actual, evidence (result record or log line).
- [ ] Output of this check after scenario E (use your issue table name):

```javascript
var t = 'sn_grc_issue'; // or 'u_grc_issue_sim' on the fallback path
var ga = new GlideAggregate(t);
ga.addQuery('state', 'NOT IN', 'closed,cancelled');
ga.addQuery('source_type', 'indicator');
ga.addAggregate('COUNT');
ga.query();
gs.info('Open indicator issues: ' + (ga.next() ? ga.getAggregate('COUNT') : 0));
```

  Expected: 1. (Field names on `sn_grc_issue` vary by release; confirm `source_type` and state values on your PDI, or use the fallback table.)
- [ ] Issue record screenshots at each state (draft, analyze, respond, review, closed), with the verifier's name visible at review.
- [ ] The CISO paragraph.

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Guard | Missing data reads as pass | Missing and stale both read unknown | A second indicator watches the feed's freshness itself |
| Idempotency | Multiple issues per problem | Exactly one issue, later failures appended | Consecutive-failure threshold is configurable data, not code |
| Remediation | One task, closed by the fixer | Tactical plus systemic, independent verification | Recurrence check: report for controls with a closed issue in the last 12 months |
| Communication | Log only | Clear drill log and CISO answer | Answer includes the KPI that would have exposed the blind period (for example, results with "unknown") |

## Stretch goals

- Build the "monitor the monitor" indicator: fail if no load record for any in-scope server in 48 hours.
- Create a mini audit engagement scoped to the finance service and show the auditor reading the closed issue and indicator history.

## Reflection prompts

- How many weeks of false "pass" would Northwind have accepted if the auditor had not looked?
- Why is "unknown" a better result than "fail" for scenario B?

## Instructor notes (common pitfalls, how to adapt for time)

- The lesson 7 guard snippet must be placed inside the evaluation function; learners who paste it at top level get a syntax error from the bare `return`.
- Comparing a date string to a GlideDateTime object silently misbehaves; the skeleton above uses query conditions instead.
- For a 3-hour version, skip milestone 4's extension and the stretch goals.
