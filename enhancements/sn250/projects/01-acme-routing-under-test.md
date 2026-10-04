---
course_id: sn250
project_id: sn250-x01
title: "Acme Routing, Under Test"
kind: supplementary-project
status: draft
hours_estimate: 8
difficulty: core
related_lessons:
  - sn250-03
  - sn250-04
  - sn250-05
  - sn250-06
objectives:
  - Query, create, and update records from server-side script using GlideRecord and GlideSystem
  - Choose the correct business rule type and timing for a server-side requirement
  - Decide between a client script and a UI policy, and write client-side logic that does not slow the form
  - Package reusable server logic in a script include and call it from other scripts
competency_ids:
  - D7-S1-C01
  - D7-S1-C04
---

## Scenario
Lesson 6 ended with a refactor: two business rules on `incident`, each with its own copy of routing logic, collapsed into `AcmeRoutingUtils`. Acme's platform owner now wants that refactor done for real, with proof. The service desk also wants agents to see a warning on the incident form when a caller already has several open incidents (the lesson 5 GlideAjax example) — without the form ever freezing. Nothing ships without a test suite someone else can re-run.

## What you will build / produce
In a scoped application `x_acme_routing` (any scope name you own is fine; record it):

1. **Script include `AcmeRoutingUtils`** (server-side class) with public methods `groupForIncident(incidentGr)` and `groupIdByName(name)` and a per-instance cache, as in lesson 6, reading group names from system properties `x_acme_routing.network_group` and `x_acme_routing.hardware_group` (defaults `Network`, `Hardware` — demo-data group names; adjust to your PDI).
2. **One before business rule** on `incident` (Insert, Update), condition `insert OR category changes OR priority changes`; order it after the priority derivation on your instance, calling the include in ≤ 4 lines.
3. **Client-callable script include `AcmeIncidentAjax`** with `getCallerSummary()` returning a JSON string `{openCount, vip, location}`; validates `sysparm_caller` is a 32-char hex sys_id and returns `{}` otherwise; require the fulfiller role on the client-callable include and in its methods, and use ACL-aware reads for caller fields. A valid sys_id is not authorization.
4. **onChange client script** on `caller_id` calling `getCallerSummary` with `getXMLAnswer` (async), showing a field message when `openCount > 3`; guards `isLoading` and empty values.
5. **UI policy** (not script): when `category` is `hardware`, `cmdb_ci` is visible and mandatory (Reverse if false, On load).
6. **ATF suite** `Acme Routing — Regression` (4 tests) and a **background verifier** with PASS/FAIL output.

## Before you start (prerequisites, starter files or data)
- PDI with demo data; admin.
- Create the scoped app (System Applications > Studio or App Engine Studio — whichever your release offers; see open questions in review.md). Set the application's JavaScript mode to ES5-compatible code anyway: write `var`/`function` only.
- Set `sn_atf.runner.enabled = true` in `sys_properties` and open the Client Test Runner (Automated Test Framework > Run > Client Test Runner) for client tests.
- Note two demo group names to route to and a demo caller who has more than three active incidents (or create them).
- **Cross-scope note:** your scoped include writes to `incident` (global). With runtime access tracking on "Tracking", the first run creates a cross-scope privilege record; open Studio's/your app's Cross scope privileges list and confirm it, then decide whether to enforce.

## Milestones
1. **Reproduce the mess.** Create lesson 6's Rule A and Rule B verbatim (inactive at first). Activate both, save an incident with category network and priority 1, and use Session debug > *Debug Business Rule* to capture evidence that Rule B re-runs rules (recursion). Deactivate both.
2. **Write the include.** Implement `AcmeRoutingUtils` with input guards. Every public method must return `''` (not throw) for `null`, `''`, an unqueried GlideRecord, and an invalid sys_id. The routing method must also accept an initialized new incident in a before-insert rule; guard record type/methods and required routing values rather than rejecting every record not yet persisted.
3. **Write the rule.** Before, Insert+Update, condition on the record (not in script):
   ```javascript
   (function executeRule(current, previous) {
     var groupId = new AcmeRoutingUtils().groupForIncident(current);
     if (groupId && groupId !== current.getValue('assignment_group')) {
       current.setValue('assignment_group', groupId);
     }
   })(current, previous);
   ```
4. **Client side, the cheap way first.** Build the UI policy for hardware/CI. Then build `AcmeIncidentAjax` and the onChange script. Open the browser network panel and confirm: zero `xmlhttp.do` requests on form load; exactly one on caller change; the form stays typeable while it is in flight.
5. **ATF suite.** Build four tests (details below), add them to the suite, run green.
6. **Background verifier.** Run the script below; paste output.
7. **Break and catch.** Change `x_acme_routing.network_group` to a group name that does not exist. Re-run the suite: Test 1 must fail, and the system log must show the include's `gs.warn` about the missing group. Restore.

### ATF tests
| Test | Steps (summary) | Asserts |
|---|---|---|
| T1 Routing — network P1 | Record Insert incident (category `network`, impact 1, urgency 1, short_description "ATF T1") → Record Validation | `assignment_group` = network group sys_id (use a Run Server Side Script step to look it up by name and compare) |
| T2 Routing — no rule applies | Record Insert incident (category `inquiry`) → Record Validation | `assignment_group` empty |
| T3 Include guards | Run Server Side Script (code below) | all four guard assertions pass |
| T4 Client — hardware UI policy | Open a New Form (incident) → Set Field Values category `hardware` → Field State Validation `cmdb_ci` visible + mandatory → Set Field Values category `software` → Field State Validation `cmdb_ci` not mandatory | UI policy applies and reverses |

T3 script:
```javascript
(function(outputs, steps, params, stepResult, assertEqual) {
  var u = new AcmeRoutingUtils();
  var unqueried = new GlideRecord('incident');
  var bogus = new GlideRecord('incident');
  bogus.get('ffffffffffffffffffffffffffffffff');
  assertEqual({name: 'null input', shouldbe: '', value: u.groupForIncident(null)});
  assertEqual({name: 'unqueried GR', shouldbe: '', value: u.groupForIncident(unqueried)});
  assertEqual({name: 'invalid sys_id GR', shouldbe: '', value: u.groupForIncident(bogus)});
  assertEqual({name: 'unknown group name', shouldbe: '', value: u.groupIdByName('No Such Group ' + gs.generateGUID())});
})(outputs, steps, params, stepResult, assertEqual);
```

### Background verifier (run in your app's scope)
```javascript
(function verify() {
  var pass = 0, fail = 0;
  function check(label, ok) { if (ok) { pass++; } else { fail++; } gs.info((ok ? 'PASS ' : 'FAIL ') + label); }

  var u = new AcmeRoutingUtils();
  check('null-safe', u.groupForIncident(null) === '');

  var netName = gs.getProperty('x_acme_routing.network_group', 'Network');
  var netId = u.groupIdByName(netName);
  check('network group resolves (' + netName + ')', netId.length === 32);

  // Cache: repeat lookups should not hit the database, so 200 of them are fast.
  var t0 = new GlideDateTime().getNumericValue();
  for (var i = 0; i < 200; i++) { u.groupIdByName(netName); }
  var ms = new GlideDateTime().getNumericValue() - t0;
  gs.info('INFO 200 cached lookups took ' + ms + ' ms; verify no repeated group query with Debug SQL.');

  // Rule fires from script, not just forms (dry: insert then delete).
  var inc = new GlideRecord('incident');
  inc.initialize();
  inc.setValue('short_description', 'verifier ' + gs.generateGUID());
  inc.setValue('category', 'network');
  inc.setValue('impact', '1');
  inc.setValue('urgency', '1');
  var id = inc.insert();
  check('insert succeeded', !!id);
  if (id && inc.get(id)) {
    check('rule routed scripted insert', inc.getValue('assignment_group') === netId);
    inc.deleteRecord();
  }

  var ajaxRec = new GlideRecord('sys_script_include');
  ajaxRec.addQuery('name', 'AcmeIncidentAjax');
  ajaxRec.query();
  check('AcmeIncidentAjax is client callable', ajaxRec.next() && ajaxRec.getValue('client_callable') === '1');

  gs.info('RESULT ' + pass + ' passed, ' + fail + ' failed');
})();
```
The verifier inserts and deletes one incident. Run it only on your PDI.

## Acceptance criteria
- [ ] Old Rule A/B inactive; one new before rule with a condition on the record and ≤ 4 script lines.
- [ ] No GlideRecord in any business rule or client script — only in the include.
- [ ] No group sys_id or name hard-coded in script; names come from properties with defaults.
- [ ] Zero server calls on form load; one async call per caller change; no `getXMLWait`, no `getReference` without callback.
- [ ] ATF suite 4/4 green; red-then-green demonstrated in milestone 7.
- [ ] Verifier prints `RESULT n passed, 0 failed`.

## Evidence checklist
- [ ] Debug Business Rule output showing Rule B's recursion (milestone 1).
- [ ] Screenshots of the include, rule (When/Order/Condition tab), client script, UI policy.
- [ ] Network panel screenshot: form load (0 calls) and caller change (1 call to `xmlhttp.do` with `sysparm_name=getCallerSummary`).
- [ ] ATF suite result 4/4 and the failure screenshot from milestone 7, plus the `gs.warn` log line.
- [ ] Verifier output.
- [ ] Cross-scope privilege record (screenshot) and your decision: track or enforce, and why.
- [ ] Half-page design note: why before (not after), why UI policy (not client script) for hardware, why GlideAjax (not display rule) for open count.

## Rubric
| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Include design | Logic duplicated or no guards | One include, guarded, cached, property-driven | Contract comments on every public method; rules/data-access split |
| Timing choice | After rule with `current.update()` | Before rule, condition on record | Explains interaction with other rules from Debug Business Rule output |
| Client performance | Synchronous call or GlideRecord on client | Async GlideAjax; UI policy for show/require | Measured request counts and explained the trade-off vs display rule |
| Security | Client-callable accepts arbitrary input | Validates sys_id and authorization; returns ACL-readable minimal data | Uses GlideRecordSecure or role check and justifies it |
| Tests | Manual only | ATF 4/4 + verifier all PASS | Adds negative client test and nightly ATF schedule |

## Stretch goals
- Add a fifth ATF test that impersonates a non-itil user and asserts `getCallerSummary` returns `{}` (call the include server-side as that user).
- Replace the property defaults with a small `x_acme_routing_rule` table (category → group) and make `groupForIncident` data-driven.
- Extend `AcmeRoutingUtils` with a subclass for major incidents (lesson 6 "Extending another script include").

## Reflection prompts
- Which defect in Rule A/Rule B would ATF have caught, and which only Debug Business Rule revealed?
- Where did you most want to put logic that ended up elsewhere, and why was the other place better?
- What would a client-side GlideRecord have cost a user on hotel Wi-Fi?

## Instructor notes (common pitfalls, how to adapt for time)
- Learners forget `this.` inside class methods; the guard test (T3) exposes it immediately.
- Demo group names differ across PDI builds; let learners set the properties rather than editing code.
- ATF client tests need the Client Test Runner open in another tab; tests appear "waiting" otherwise.
- `gs.generateGUID()` availability in scoped scripts should be confirmed on the current release; if missing, use a timestamp string.
- The timing check in the verifier is coarse; treat a FAIL there as a prompt to inspect, not a grade.
- **Time-box:** 4-hour version — skip milestones 1 and 7 and test T4.
