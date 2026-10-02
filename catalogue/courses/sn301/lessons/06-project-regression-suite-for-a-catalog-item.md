---
lesson_id: sn301-06
course_id: sn301
pathway: servicenow-implementation-specialist
title: 'Project: Regression Suite for a Catalog Item'
order: 6
kind: project
competency_ids:
  - D10-S1-C04
objectives: []
---

## Goal

Build a small, trustworthy regression suite for one service catalog item on a sub-production instance, schedule it, and hand it over the way you would hand it to a customer's team: with a suite that runs unattended, fails loudly when the item breaks, and leaves no test data behind.

Pick a catalog item you configured in an earlier course, or configure a simple one for this project. It needs at least three variables, at least one of them mandatory, and something that happens on submission — a flow, a business rule, or an assignment. If the item is trivial, there is nothing worth asserting.

## Requirements

**1. Four tests, minimum, each proving one behavior.** Cover at least these four kinds of claim:

- **Happy path.** A requester with the right role can order the item with valid values, and the resulting request or task lands with the field values your configuration should have set.
- **Validation.** A required variable that is left empty prevents submission, or a UI policy makes a field mandatory or visible under a specific condition.
- **Routing or fulfillment.** The generated record reaches the right assignment group, has the right priority or approval, or generates the right number of tasks.
- **Permission.** A user without the intended role sees a different outcome — the item is not available to them, or a field they should not edit is read-only.

**2. Every test impersonates.** No test may rely on running as an administrator to pass.

**3. Every test creates the data it needs** and asserts against records it created. No hard-coded sys_id of a record that already exists on the instance.

**4. Every test asserts.** A test whose steps all succeed but which checks nothing does not count toward the four.

**5. A suite that contains them,** named for the item, with the fastest tests first.

**6. A scheduled run of the suite** at an off-hours time, with the time zone on the record checked, plus a failure notification path: a business rule on the suite result table that queues an event on failure, the event registered, and a notification triggered by it.

**7. A one-page handover note** covering: what each test proves, which tests need a client test runner, when the suite is scheduled, who gets notified on failure, and what a reviewer should do when a test fails.

## Constraints

- Work on a sub-production instance you are allowed to break. **Nothing in this project touches a production instance**, and the suite is never scheduled against one.
- Shipped step configurations only. If nothing shipped can express an assertion, write down what you would need instead of building a custom step configuration — that is out of scope for this course.
- Capture the tests and the suite in an update set (or in the scoped application, if the item lives in one) and confirm the records are actually captured before you call the work done.
- Total build time is about an hour. Four small honest tests beat twelve half-written ones; do not grow the suite to fill time.
- Prefix all test data with `ATF:` so anything that escapes rollback is identifiable.

## Definition of done

- [ ] Four or more tests exist, each named for the behavior it proves, each with at least one assertion.
- [ ] Every test begins with an impersonation step naming a role-appropriate user.
- [ ] Every test creates its own data; no reference to a pre-existing record's sys_id.
- [ ] The full suite runs green twice in a row from a clean start.
- [ ] Each test has been made to fail once on purpose, and the failure message alone was enough to locate the cause. Note in the handover which message was clearest and which was not.
- [ ] After a full run, a query for records whose names or short descriptions start with `ATF:` returns nothing your tests created.
- [ ] A scheduled test suite record exists, points at the suite, has a verified time zone, and has been executed once on demand to prove its configuration.
- [ ] A forced failure produced the notification, and the notification links to the suite result.
- [ ] The update set (or application) contains the tests, the steps, and the suite.
- [ ] The handover note is written and would let someone who has never seen the instance triage a red run.

## Hints

- Build the happy path first and get it green before you write anything else. The later tests reuse the same data-creation steps and the same impersonation choice.
- Catalog steps drive the real UI, so they need the client test runner open and in the foreground. Assert on the *resulting* records with server steps wherever you can — it is faster and much less brittle than reading values back off a form.
- For the permission test, the cleanest assertion is often a server-side query as the restricted user rather than hunting for a UI element that should not be there.
- The validation test is the one most likely to be flaky. Assert a field's *state* — mandatory, read-only, visible — rather than trying to assert what an error message says.
- Order matters inside a test: impersonate, create data, act, then assert. A failure stops the test, so put the cheap checks early.
- If a test fails only when the whole suite runs, suspect shared data or an assumption about ordering. Two tests that both query for "the most recent incident" will interfere.
- When a test is hard to write, that is information. It often means the behavior depends on something asynchronous, or on state the configuration does not really control. Record it in the handover note instead of forcing a brittle test.
