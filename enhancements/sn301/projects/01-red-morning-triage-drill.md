---
course_id: sn301
project_id: sn301-x01
title: "Red Morning Triage Drill"
kind: supplementary-project
status: draft
hours_estimate: 3
difficulty: core
related_lessons:
  - sn301-03
  - sn301-04
objectives:
  - Build an ATF test with steps, assertions, and test data that cleans up after itself
  - Organize tests into suites and run them on a schedule with the client test runner
competency_ids:
  - D10-S1-C04
  - D7-S1-C03
---

## Scenario

You inherit the `Smoke - Incident core` suite from lesson 4 on a shared sub-production instance. Overnight, the scheduled run went red: three tests failed. Your lead wants a triage note by 10:00 that says, for each failure, whether it is a **real defect**, a **bad test**, or a **bad environment**, and what you did about it. Deactivating a test is not an allowed answer.

This drill is run in pairs. One person (the "saboteur") plants three failures on their own Personal Developer Instance (PDI); the other person triages them using only the result records. Then swap.

## What you will build / produce

- A smoke suite of at least four tests (reuse the lesson 3 and lesson 4 tests and add two more).
- Three planted failures, one of each type, documented privately by the saboteur.
- A triage note: one row per failure with evidence (the step result message or screenshot) and a classification.
- A repaired, green suite run after triage.

## Before you start (prerequisites, starter files or data)

- A free PDI with test execution enabled (see lesson 3) and your user holding the ATF test designer role.
- The `ATF: Critical incident routing` test from lesson 3 and the "ITIL user cannot delete an incident" test from lesson 4.
- A non-admin test user with only the `itil` role (for example `atf.fulfiller`) and a test user with no roles (for example `atf.requester`). Create these in **User Administration > Users** if they do not exist; prefix them so they are obviously test accounts.
- Two additional tests to bring the suite to four:
  - **Incident form: resolution fields become mandatory.** Impersonate the ITIL user, open a new incident form, set State to Resolved, and use **Field State Validation** to assert the resolution code and resolution notes fields are mandatory. (Field labels and the out-of-box UI policy that drives this vary by release; confirm on your PDI which fields become mandatory and assert those.)
  - **Requester cannot read another user's incident.** Impersonate `atf.fulfiller` and use a **Create a Record** step to insert an `ATF:` incident with caller set to `atf.fulfiller`; then impersonate `atf.requester` and use **Record Query** to assert that zero records are returned for that sys ID.

## Milestones

1. **Baseline.** Assemble the four tests into `Smoke - Incident core`, server-only tests first. Run it twice from a clean start; both runs green. Save the suite result number.
2. **Saboteur plants three failures** (write them down, do not tell the triager):
   - *Real defect:* change the configuration the routing test proves, for example deactivate the assignment rule or business rule that routes Network incidents, or change its target group.
   - *Bad test:* change one test's expected value so it asserts something the requirement never said (for example, expect Priority `2 - High` for impact 1 / urgency 1).
   - *Bad environment:* make the run depend on a missing runner. Close the client test runner before starting the suite, so the form-based test waits and then fails or times out. (Alternative: lock out the `atf.fulfiller` user so impersonation fails.)
3. **Triager runs the suite** and works only from the suite result, test results, and step results (including the failure screenshot for UI steps). For each failure, record the step, the assertion message, and the classification.
4. **Fix the cause, not the symptom.** Real defect: restore the configuration. Bad test: restore the requirement-based assertion. Environment: reopen the runner in the foreground (or unlock the user) and re-run.
5. **Prove the repair.** Run the suite twice more; both green. Then run the cleanup query in the Evidence checklist.
6. **Swap roles** and repeat with different planted failures.

## Acceptance criteria

- [ ] The suite contains four or more tests, each starting with an Impersonate step and each with at least one assertion step.
- [ ] Every test creates its own data; none references a pre-existing record by hard-coded sys_id.
- [ ] The triage note classifies all three planted failures correctly, citing the step result message for each.
- [ ] No test was deactivated, deleted, or had its assertion removed to make the run green.
- [ ] Two consecutive green suite runs exist after the repair.
- [ ] No `ATF:` records created by the tests remain after the final run.

## Evidence checklist

Collect these into a single document or folder.

- [ ] Screenshot of the suite record showing the ordered test list (server-only tests first).
- [ ] Suite result numbers for: baseline run 1, baseline run 2, the red run, post-repair run 1, post-repair run 2.
- [ ] For each failure: a screenshot of the failing step result, including the assertion message, and the UI-step failure screenshot where one exists.
- [ ] The triage note (template below).
- [ ] Output of the cleanup check below, run in **System Definition > Scripts - Background** on the PDI after the final run:

```javascript
// Leftover-data check: should print 0 for each table your tests write to.
var tables = ['incident'];
tables.forEach(function (t) {
  var ga = new GlideAggregate(t);
  ga.addQuery('short_description', 'STARTSWITH', 'ATF:');
  ga.addAggregate('COUNT');
  ga.query();
  var n = ga.next() ? ga.getAggregate('COUNT') : 0;
  gs.info('Leftover ATF records in ' + t + ': ' + n);
});
```

- [ ] Output of this summary of the five suite runs (replace the suite name if yours differs). The table and field names below are the commonly documented ATF result tables; confirm them on your PDI by opening a suite result and checking the URL before you rely on the script.

```javascript
var gr = new GlideRecord('sys_atf_test_suite_result');
gr.addQuery('test_suite.name', 'Smoke - Incident core');
gr.orderByDesc('sys_created_on');
gr.setLimit(5);
gr.query();
while (gr.next()) {
  gs.info(gr.getDisplayValue('number') + ' | ' + gr.getDisplayValue('status') + ' | ' + gr.getValue('sys_created_on'));
}
```

Triage note template:

| Test | Failing step | Message (verbatim) | Classification | Evidence used | Fix applied | Re-run result |
|---|---|---|---|---|---|---|

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Test design | Some tests run as admin or depend on existing records | Every test impersonates, creates its own data, and asserts one requirement per step | Tests also follow server-first ordering and use step output references throughout |
| Triage accuracy | One or more failures misclassified | All three classified correctly with the message cited | Classification also names how the failure would have been caught earlier (for example, a sanity test at the top of the suite) |
| Fix discipline | A test was weakened or deactivated | Each cause fixed at its source | Note proposes a guard so the environment failure surfaces clearly next time |
| Evidence | Missing run numbers or screenshots | Complete checklist | Evidence is organized so a lead could audit it in five minutes |

## Stretch goals

- Add a fifth "environment sanity" test at the top of the suite (for example, a Record Query asserting the `atf.fulfiller` user exists and is active) so environment problems fail first with an obvious message.
- Wire the lesson 4 failure-notification loop to this suite and include the received notification in your evidence.

## Reflection prompts

- Which failure message was clearest, and which forced you to open the screenshot or the configuration? What would you change in the test to make that message better?
- How would your triage have gone if one of the tests had queried for "the most recent incident" instead of the record it created?

## Instructor notes (common pitfalls, how to adapt for time)

- Learners often classify the closed-runner failure as a product bug. Point them back to the lesson 4 runner rules.
- The "bad test" plant is the most valuable discussion: ask the triager how they knew which value the requirement actually specified. If they could not tell, the test name or description was not specific enough.
- For a 90-minute session, skip the swap and have the instructor plant the failures on a shared PDI before class.
- PDIs hibernate after inactivity and are reclaimed if unused; have learners wake the instance and re-run the baseline before planting.
