---
course_id: sn201
project_id: sn201-x01
title: "Prove It with ATF: A Regression Suite for Facilities Work Orders"
kind: supplementary-project
status: draft
hours_estimate: 6
difficulty: core
related_lessons:
  - sn201-04
  - sn201-05
  - sn201-07
objectives:
  - Build forms, views, and UI policies that present the right fields to the right user
  - Add application logic with business rules and client scripts
  - Secure an application with roles and access control rules
competency_ids:
  - D2-S1-C02
  - D7-S1-C01
  - D1-S1-C03
---

## Scenario
The facilities manager liked the demo. Before she lets the app near test, the platform owner asks one question: "When someone changes a UI policy next month, how will you know you didn't break closure, the work-started stamp, or who can see costs?" Every lesson so far had you test by hand. This project turns those manual checks into an **Automated Test Framework (ATF)** suite owned by your `x_acme_facilities` scope, so it travels with the application and anyone can re-run it in two minutes.

## What you will build / produce
An ATF **test suite** named `Facilities Work Orders — Regression` containing four tests:

1. **UI policy: closure fields** (client-side test, lesson 4).
2. **Business rule: stamp work_started** (server-side, lesson 5).
3. **Business rule: abort completion without part costs** (server-side, lesson 5).
4. **ACL: technician cannot see total_cost; manager can** (impersonation, lesson 7).

Plus: a suite run result showing all four passing, and one deliberate regression caught by the suite.

## Before you start (prerequisites, starter files or data)
- Your Facilities Work Orders app from lessons 2–7 on your PDI, including: closure-fields UI policy, `work_started` before rule, the abort-completion rule from lesson 5, `total_cost` field-level ACLs, and test users for technician and manager.
- Application picker set to **Facilities Work Orders**, with a named update set current (e.g. `Facilities Work Orders v1.0 — ATF suite`).
- **Enable test execution**: as admin, open `sys_properties.list`, find `sn_atf.runner.enabled` and set it to `true` (PDIs commonly ship with it false). Without this, tests save but will not run.
- Client-side steps need the **Client Test Runner**: from Automated Test Framework > Run > Client Test Runner, open it in a separate browser tab and leave it open while tests run.
- At least one `cmn_location` record and one `x_acme_facilities_part` record exist.

## Milestones
1. **Create the suite.** Automated Test Framework > Suites > New. Name it; save.
2. **Test 1 — closure fields (UI policy).** Automated Test Framework > Tests > New, name `WO - closure fields appear and are mandatory`. Add steps:
   1. *Impersonate* — your technician test user.
   2. *Open a New Form* — table `x_acme_facilities_work_order`.
   3. *Field State Validation* — `close_code` and `close_notes` **not visible**.
   4. *Set Field Values* — `state` = Closed Complete.
   5. *Field State Validation* — `close_code`, `close_notes` **visible** and **mandatory**.
   6. *Set Field Values* — `state` = In Progress.
   7. *Field State Validation* — `close_code` **not visible** (proves Reverse if false).
   Run it with the Client Test Runner open. Add the test to the suite.
3. **Test 2 — work_started stamp (before rule).** New test `WO - work_started stamped once`. Steps:
   1. *Record Insert* — `x_acme_facilities_work_order` with short_description "ATF stamp test", location (pick one), state New (10).
   2. *Record Update* — the record from step 1 (use the data pill), state = In Progress (30).
   3. *Run Server Side Script* — assertion below.
   4. *Record Update* — state = On Hold (40); then another *Record Update* — state = In Progress (30).
   5. *Run Server Side Script* — assert the stamp did not change (script below, second variant).

   ```javascript
   (function(outputs, steps, params, stepResult, assertEqual) {
     var insertStep = '<sys_id of the Record Insert step>'; // pick from the data pill picker
     var wo = new GlideRecord('x_acme_facilities_work_order');
     wo.get(steps(insertStep).record_id);
     if (wo.work_started.nil()) {
       stepResult.setOutputMessage('work_started was not stamped on move to In Progress');
       return false;
     }
     outputs.work_started_stamp = wo.getValue('work_started'); // custom String output
     stepResult.setOutputMessage('work_started = ' + wo.getValue('work_started'));
     return true;
   })(outputs, steps, params, stepResult, assertEqual);
   ```

   Use a custom server step configuration with a String output named `work_started_stamp`; the shipped `table` output is a table reference, not timestamp storage. For the second check, compare `wo.getValue('work_started')` with the value captured by the first script step (`steps('<first script step sys_id>').work_started_stamp`) using `assertEqual({name: 'stamp unchanged', shouldbe: first, value: wo.getValue('work_started')})`.
4. **Test 3 — abort completion without part costs.** New test `WO - cannot complete with uncosted parts`. Steps:
   1. *Record Insert* — work order, state In Progress.
   2. *Record Insert* — `x_acme_facilities_work_order_part`, work_order = step 1 record, part = any, quantity 1, **unit_cost empty**.
   3. *Record Update* — work order state = Closed Complete, supplying the required close_code and close_notes, with **Assert type = "Record not successfully updated"** (the step's expected-failure option; label may vary by release).
   4. *Record Validation* — work order state is still In Progress (30).
   5. *Record Update* — set the part's unit_cost = 10.
   6. *Record Update* — work order state = Closed Complete (expect success).
   7. *Record Validation* — state = 60 **and** active = false (proves the `close_states` dictionary override from lesson 3).
5. **Test 4 — cost visibility (ACL).** New test `WO - total_cost visible to managers only`. Steps:
   1. *Record Insert* — work order with total_cost = 250, assigned_to = technician test user.
   2. *Impersonate* — technician.
   3. *Open an Existing Record* — step 1 record.
   4. *Field State Validation* — `total_cost` **not visible**.
   5. *Impersonate* — manager.
   6. *Open an Existing Record* — step 1 record.
   7. *Field State Validation* — `total_cost` **visible**.
   Add a server-side check as well, because form visibility is not the whole story:
   ```javascript
   (function(outputs, steps, params, stepResult, assertEqual) {
     // Runs as the currently impersonated user (technician, if placed after step 2).
     var wo = new GlideRecordSecure('x_acme_facilities_work_order');
     wo.get(steps('<Record Insert step sys_id>').record_id);
     assertEqual({name: 'technician cannot read total_cost', shouldbe: false, value: wo.total_cost.canRead()});
   })(outputs, steps, params, stepResult, assertEqual);
   ```
6. **Run the suite.** From the suite record, **Run Test Suite**. All four pass. Screenshot the suite result.
7. **Catch a regression on purpose.** Untick **Reverse if false** on the closure-fields UI policy. Re-run the suite. Test 1 must fail at step 7. Screenshot the failure, restore the setting, re-run, green again.
8. **Confirm it travels.** Open your update set and find the ATF test, step, and suite records in it.

## Acceptance criteria
- [ ] Suite contains exactly the four tests, all owned by the `x_acme_facilities` scope.
- [ ] Every test creates its own work-order and work-order-part data (ATF rolls back data it created); users, locations, and catalog parts are documented shared reference fixtures.
- [ ] Test 1 covers both On load/visibility and Reverse if false.
- [ ] Test 3 proves both the abort *and* the close-state behaviour.
- [ ] Test 4 checks visibility for two roles, and includes a server-side `canRead()` assertion.
- [ ] A recorded red-then-green run caused by a deliberate change.

## Evidence checklist
- [ ] Screenshot of `sn_atf.runner.enabled = true`.
- [ ] Screenshot of each test's step list.
- [ ] Suite result page: 4/4 passed, with run date.
- [ ] Failure screenshot from milestone 7 showing the failing step and its message.
- [ ] Update set customer updates list filtered to `sys_atf` records.
- [ ] Half-page note: for each test, the lesson artifact it protects and one realistic change that would break it.

## Rubric
| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Coverage | Fewer than four behaviours tested | All four behaviours, including negative cases | Adds a test for the HVAC onChange script and the view rule |
| Test independence | Tests rely on pre-existing records | Each test creates its own data | Uses parameters/data pills so tests survive renamed records |
| Assertions | Steps run but nothing is asserted | Each test asserts the expected outcome | Assertions produce readable output messages |
| Regression proof | No deliberate failure | Red → green demonstrated | Explains why ATF caught what a manual "looks fine" check would miss |
| Packaging | Tests in Global or Default update set | Tests in app scope and named update set | Suite documented in the release note |

## Stretch goals
- Add a test that impersonates a requester and asserts they see only their own work orders (*Record Query* step with expected count).
- Schedule the suite (Automated Test Framework > Schedules) to run nightly and email results.
- Add a *Run Server Side Script* test for the after-rule cost roll-up: create a parent and two children, close both, assert the parent's `child_cost_total`.

## Reflection prompts
- Which of your four tests would have caught a bug you actually made in lessons 4–7?
- Why does Test 4 need both a form check and a server-side check?
- What is one behaviour of your app that ATF would struggle to test, and how else would you protect it?

## Instructor notes (common pitfalls, how to adapt for time)
- **Runner disabled** is the most common failure: tests sit "Waiting" forever. Check `sn_atf.runner.enabled` and that the Client Test Runner tab is open for client steps.
- **Step names and options** (e.g. Record Update's expected-failure assertion) vary slightly by release; verify on the current PDI.
- Test 2 passes a value between script steps through the Run Server Side Script step's built-in outputs (`outputs.table` / `outputs.record_id`). Not verified on every release; if it fails, have the second script re-check that the stamp is non-empty and compare it manually with the value printed in the first step's output message.
- `steps('<sys_id>')` must reference the *step* record's sys_id; the script editor's data-pill picker inserts it for you.
- ATF rolls back data it creates, but **not** side effects such as emails or flows that already ran. If the contractor approval flow triggers during tests, set requires_contractor = false in inserted records.
- **Time-box:** a 3-hour version can drop Test 3 and milestone 8.
