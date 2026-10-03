---
lesson_id: sn301-03
course_id: sn301
pathway: servicenow-implementation-specialist
title: Building Your First ATF Test
order: 3
kind: lesson
competency_ids:
  - D10-S1-C04
objectives:
  - Build an ATF test with steps, assertions, and test data that cleans up after itself
---

## Before you build: turn testing on, in the right place

The Automated Test Framework is shipped with the platform but is switched off by default, and it is switched off by a system property rather than by a plugin toggle. Ask your administrator to enable test execution on the **sub-production instance** you are working in. There is a second, separate property that permits tests to run on a production instance; leave it alone. ATF drives a real session and writes real records, so a test run on production inserts incidents, fires notifications, and calls integrations. Enabling it there is a decision for a customer to make deliberately, never a step you take to unblock yourself.

You also need the test designer role. If the **Automated Test Framework** application menu is missing from the filter navigator, that is what you are missing, not a plugin.

## Anatomy of a test

A test is one record with an ordered list of step records under it. That is the whole model.

- **Test** — a name, a description, an active flag, and an ordered list of steps.
- **Step** — an instance of a *step configuration*, which is a shipped, reusable definition of one action. You pick the configuration from a list and then fill in its inputs.
- **Step configuration** — grouped into categories in the picker: **Server** steps (create, update, delete, and query records; run a script), **Form** steps (open a form, set a field, validate a field's value or state, submit, click a UI action), **Service Catalog** steps (open an item, set a variable, order it), plus categories for email, REST, and application-specific features.

Steps run top to bottom. If a step fails, the test stops there and the remaining steps are not attempted, which is why order matters more than it looks: put the cheap setup first and the expensive UI interaction last.

Custom step configurations exist and are the extension point when nothing shipped fits. They are out of scope here. Build your first dozen tests out of shipped steps; you will find that most of what an implementer needs to assert is already covered.

## Server steps versus form steps

This distinction decides how a test runs, so learn it early.

**Server steps** execute on the instance. They do not need a browser. A test made only of server steps runs entirely from the test record.

**Form and catalog steps** drive an actual browser UI. They need the **client test runner** — a browser tab that the instance hands instructions to, one step at a time. You open the runner, leave it open, and start the test; the runner takes over and reports back. Lesson 4 covers running suites through it properly.

A useful habit: assert with server steps wherever you can. Checking a field value by querying the record is faster and far less brittle than checking the same value by reading it off a form. Use form steps for what only the form can tell you — that a field became mandatory, that a UI policy hid a section, that a UI action is visible to this user.

## Impersonation, and why almost every test starts with it

An ATF test runs as whoever started it unless you say otherwise, and that is usually you, an admin. Admin sees every field and passes every ACL, so a test written as admin proves nothing about what a fulfiller or a requester can actually do.

Put an **Impersonate** step first and name a user with the role the behavior belongs to. Use a dedicated test account (for example `atf.fulfiller`) rather than a real person's user record: real users change roles, go inactive, or leave, and every test that impersonated them breaks at once. If a requirement says "an ITIL user can close an incident but cannot delete one", the test that proves it must be impersonating an ITIL user, not an administrator. The impersonation lasts for the rest of the test unless a later step changes it, so a test that needs two personas simply impersonates again halfway through.

## Making your own test data

The single most common reason a test is unreliable is that it depends on a record it did not create. `INC0010023` exists on your development instance today, but it will not exist on the customer's test instance, and it will not exist after the next clone.

The rule: **a test creates the data it needs.** Use a server step to insert the record, then use the record it produced in the steps that follow.

Steps hand their results to later steps through outputs. A **Create a Record** step outputs the record it inserted; a later step references it rather than a hard-coded sys_id. In the step form you select the earlier step's output from a picker instead of typing an identifier, which is what makes the test portable between instances.

A test for "a P1 incident is assigned to the Network group" looks like this in outline:

```text
1. Impersonate            user = Fulfiller (ITIL)
2. Create a Record        table = Incident
                          short_description = "ATF: network outage"
                          category = Network
                          impact = 1, urgency = 1
3. Record Query           table = Incident
                          conditions: Sys ID is <output of step 2>
                                      Assignment group is Network
                          assert: number of records returned = 1
4. Field Values Validation  record = <output of step 2>
                            Priority = 1 - Critical
```

Step 2 makes the data. Steps 3 and 4 assert against the record step 2 produced. Nothing in the test names a record that has to already be there.

The same pattern works when the behavior lives on a form. A test for "resolution notes become mandatory when an ITIL user resolves an incident" needs the browser, so it uses form steps and the client test runner:

```text
1. Impersonate               user = Fulfiller (ITIL)
2. Open a New Form           table = Incident
3. Set Field Values          short_description = "ATF: resolve check"
                             state = Resolved
4. Field State Validation    Resolution notes: mandatory
```

There is no Create a Record step here because the claim is about the form's behavior *before* the record is saved; the form is the data. Check on your instance which fields your UI policy actually makes mandatory, and assert those.

## Assertions: the part that makes it a test

A sequence of actions with no assertion is not a test, it is a macro. It will pass as long as nothing throws an error, which means it will pass while the behavior you cared about is broken.

The shipped assertion steps you will reach for most:

- **Record Query** — run a query and assert on the result: that exactly one record matches, that none do, or that a specific record is in the result.
- **Field Values Validation** — assert that named fields on a record hold specific values.
- **Field State Validation** (form) — assert that a field is visible, mandatory, read-only, or in a particular UI state. This is how you test a UI policy or a client script.
- **Record Validation** on a form — assert the values the form is showing.

Assert the requirement, not the implementation. "Priority is 1 - Critical" is a requirement. "The business rule named `calc_priority` ran" is an implementation detail that will fail the day someone rebuilds the same behavior in a flow, and it will fail for a reason nobody cares about.

Assert one thing per assertion step where you can. A failure that says "Assignment group was empty" tells you where to look; a single mega-step that checks nine fields tells you the record was wrong somewhere.

## Cleaning up after yourself

ATF tracks the records its steps create and rolls them back when the test finishes, pass or fail. This is what makes it safe to run the same test a hundred times on the same instance without leaving a hundred junk incidents behind.

It is not magic, and there are edges worth knowing:

- **Rollback covers what the framework created.** Records created by test steps are tracked. Side effects that leave the instance — an outbound email actually sent, a REST call to an external system — are not something a rollback can retrieve. Test on an instance where notifications and integrations are safely configured for a sub-production environment.
- **Asynchronous work can outlive the test.** Something scheduled by your record may run after the test has finished and rolled back. If your test's behavior depends on async processing, assert on the thing you can observe synchronously, or accept that you are testing a smaller claim.
- **Never delete data you did not create.** Do not add a "delete a record" step aimed at cleaning up leftovers from a previous run. If a previous run left records behind, fix the test that created them.
- **Name your test data.** Prefix short descriptions or names with something like `ATF:` so that anything that does escape rollback is obvious to a human reading the table.

## Practice

Work on a sub-production instance you are allowed to break.

1. Create a test named `ATF: Critical incident routing`. Add an **Impersonate** step for a user with the ITIL role.
2. Add a **Create a Record** step that inserts an Incident with a short description beginning `ATF:`, impact 1 and urgency 1, and a category your instance actually routes on.
3. Add a **Record Query** step that finds the incident by the sys ID output of step 2 and asserts that exactly one record is returned with the assignment group your configuration should have set.
4. Add a **Field Values Validation** step asserting that Priority is `1 - Critical`.
5. Run the test and read the result record. Open the step-by-step results and note which step reports the elapsed time and which reports the assertion outcome.
6. **Make it fail on purpose.** Change the expected assignment group to something wrong and re-run. Read the failure message and confirm you could locate the problem from that message alone. Change it back.
7. Query the Incident table for short descriptions starting `ATF:`. Confirm the records your test created are gone. If any remain, work out which step created them and why the rollback did not cover it.

## Check your understanding

1. Why should almost every test start with an Impersonate step?
2. Your test queries for `INC0010023`. Why will it break, and what should it do instead?
3. A test opens a form, sets fields, and submits, with no validation step. It passes. What has it proved?
4. Which side effects can ATF's rollback *not* undo?

*Answers:* (1) Admin passes every ACL and sees every field, so a test run as admin proves nothing about what a fulfiller or requester can do. (2) That record will not exist on another instance or after a clone; the test should create its own record and reference the step output. (3) Only that nothing threw an error; without an assertion it is a macro, not a test. (4) Side effects that left the instance (sent email, outbound REST calls) and asynchronous work that runs after the test finishes.
