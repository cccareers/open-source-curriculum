---
course_id: sn301
project_id: sn301-x02
title: "Test-First Change: Laptop Short Description Rule in One Update Set"
kind: supplementary-project
status: draft
hours_estimate: 4
difficulty: stretch
related_lessons:
  - sn301-03
  - sn301-05
objectives:
  - Build an ATF test with steps, assertions, and test data that cleans up after itself
  - Fit automated tests into an update set, UAT, and upgrade cycle
competency_ids:
  - D10-S1-C04
  - D10-S1-C02
---

## Scenario

The customer from lesson 2 has a "New Laptop" catalog item. A change request arrives: *"When a laptop request is submitted, the requested item's short description must read `New Laptop - <model> for <requested for>` so that Hardware Support can scan their queue."* Your lead wants the change and the test that proves it delivered as **one unit of work** in a single update set, with a promotion note that a reviewer could sign off.

You will write the test first, watch it fail for the right reason, build the configuration, watch it pass, and then package both.

## What you will build / produce

- A simple "New Laptop" catalog item on your PDI (if you do not already have one from an earlier course) with at least: `model` (Select Box: Standard, Developer, Executive; mandatory) and `requested_for` (Reference to User).
- One ATF test, created **before** the configuration, that proves the short-description requirement.
- The configuration that satisfies it (a business rule, or a flow step; your choice).
- An update set containing both, verified by script.
- An exported update set XML file and a promotion note.

## Before you start (prerequisites, starter files or data)

- PDI with test execution enabled and the ATF test designer role.
- A clean update set named `LAPTOP-SD-001 Short description rule` set as your **current** update set **before** you create anything. (Creating the catalog item itself can happen in a separate setup update set if you prefer.)
- A test user with no roles (for example `atf.requester`) who can see the item.
- Open the client test runner in a separate, foreground browser tab.

## Milestones

1. **Write the test first** (`ATF: New Laptop short description`):
   ```text
   1. Impersonate                  user = atf.requester
   2. Open a Catalog Item          item = New Laptop
   3. Set Variable Values          model = Developer
                                   requested_for = atf.requester
   4. Order Catalog Item           (output: request record)
   5. Record Query                 table = Requested Item [sc_req_item]
                                   conditions: Request is <output of step 4>
                                   assert: exactly one record matches
   6. Field Values Validation      record = the requested item from step 5
                                   Short description = New Laptop - Developer for <atf.requester display name>
   ```
   Step names differ slightly between releases (for example "Order Catalog Item" versus "Submit Catalog Item"); pick the shipped Service Catalog step that submits the item on your release. If your release's Record Query step cannot output the matched record for step 6, replace steps 5 and 6 with a single Record Query whose conditions include the expected short description.
2. **Run it and confirm it fails at step 6** (or the combined query step) with a message about the short description. A test that fails at step 2 or 4 is failing for the wrong reason; fix that first.
3. **Build the configuration.** Create a flow with a **Service Catalog** trigger and associate it with the New Laptop item. Use **Get Catalog Variables** with the trigger's Requested Item record to retrieve `model` and `requested_for`, then **Update Record** on that RITM to set `New Laptop - <model label> for <requested_for display name>` (choose labels/display values, not stored choice values or sys_ids). A before-insert rule on `sc_req_item` must not assume catalog variables already exist. Add a bounded wait/retry to the assertion in steps 5–6 so it waits for the expected short description, and fails with a timeout if the flow never sets it. Document the timeout in the promotion note. See [Service Catalog flows](https://www.servicenow.com/docs/r/build-workflows/workflow-studio/create-sc-flow.html) and [Get Catalog Variables](https://www.servicenow.com/docs/r/xanadu/build-workflows/workflow-studio/get-cat-variables-flow-designer.html).
4. **Run the test until green twice in a row.** Then make it fail on purpose by changing the business rule's text, confirm the message points to the short description, and revert.
5. **Verify the update set contents** with the script in the Evidence checklist. You should see the test, its steps, and the business rule. Fix anything missing before you close the set.
6. **Close and export** the update set to XML.
7. **Write the promotion note** (template below) covering development, test, and production, and what you will and will not run in each.

## Acceptance criteria

- [ ] The test exists in the update set alongside the configuration it proves.
- [ ] Evidence shows a red run *before* the configuration existed, failing at the assertion step.
- [ ] Evidence shows two green runs after the configuration.
- [ ] The test impersonates a non-admin user and creates its own request through the catalog.
- [ ] The update set export contains the test, its steps, and the business rule (or flow).
- [ ] The promotion note states that the test is not run on production and says why in one concrete sentence.

## Evidence checklist

- [ ] Test result numbers: the pre-configuration red run, and the two post-configuration green runs.
- [ ] Screenshot of the red run's failing step result message.
- [ ] Output of this background script (System Definition > Scripts - Background), listing what the update set captured:

```javascript
var set = new GlideRecord('sys_update_set');
set.get('name', 'LAPTOP-SD-001 Short description rule');
var x = new GlideRecord('sys_update_xml');
x.addQuery('update_set', set.getUniqueValue());
x.orderBy('type');
x.query();
gs.info('Captured records: ' + x.getRowCount());
while (x.next()) {
  gs.info(x.getValue('type') + ' | ' + x.getValue('target_name') + ' | ' + x.getValue('name'));
}
```

  Expect rows whose type reads like "Test", "Test Step", and "Business Rule". The exact type labels vary by release; what matters is that every record you created is present.
- [ ] The exported update set XML file.
- [ ] The promotion note.

Promotion note template:

```text
Change: LAPTOP-SD-001 Short description rule
Contents: <business rule / flow>, ATF test "ATF: New Laptop short description" (+ N steps)
Development: test green x2 on <date>, result numbers <...>
Test instance: after commit, run Smoke suite, then this test. Expected: green.
UAT: business users judge readability of the short description in the Hardware Support queue; they do not re-click the order flow the test already proves.
Production: test execution stays disabled. Post-deploy check: submit one real request with the customer, confirm short description by hand.
Rollback: back out update set; re-run test on test instance to confirm red.
```

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Test-first discipline | Test written after the configuration | Red-then-green evidence exists | Red run failed exactly at the assertion step, and the note explains why that matters |
| Test quality | Runs as admin, or asserts implementation details | Impersonates, creates own data, asserts the requirement text | Also handles the async case explicitly if a flow was used |
| Packaging | Test missing from the update set | Script output shows test, steps, and configuration in one set | Note flags any record that did not capture as expected and how it was fixed |
| Promotion note | Vague ("tested, works") | Covers each instance and the production rule | A reviewer could approve or reject from the note alone |

## Stretch goals

- Add a second test that proves the rule does **not** fire for a different catalog item.
- If your PDI has a scoped app, repeat the exercise with the item inside the app and link the app to a Git repository from Studio, so the test and the rule appear in the same commit. Record the commit hash.

## Reflection prompts

- What would have happened on the test instance if you had built the test in the following sprint's update set?
- Which part of this change could a test never judge, and who should judge it in UAT?

## Instructor notes (common pitfalls, how to adapt for time)

- The most common failure is a test that fails at "Order Catalog Item" because the runner was in a background tab or the requester cannot see the item. Make learners read the failing step number before touching anything.
- Learners often forget to set the current update set first and have to move records afterwards. Let that happen once; it is the lesson.
- For a shorter session, provide the catalog item pre-built and skip milestone 7.
- Variable access syntax and step names should be checked against the release your PDIs are on before class.
