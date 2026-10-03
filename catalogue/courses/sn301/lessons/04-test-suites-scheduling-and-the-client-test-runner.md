---
lesson_id: sn301-04
course_id: sn301
pathway: servicenow-implementation-specialist
title: Test Suites, Scheduling, and the Client Test Runner
order: 4
kind: lesson
competency_ids:
  - D10-S1-C04
  - D7-S1-C03
objectives:
  - Organize tests into suites and run them on a schedule with the client test runner
---

## From a test to a suite

One test proves one behavior. A regression net is a *set* of tests you can start with a single action and walk away from. That container is a **test suite**.

A suite record holds two things: an ordered list of tests, and an ordered list of child suites. Because a suite can contain suites, you build a shallow tree rather than one flat list of eighty tests:

```text
Regression - HR Service Portal
├── Suite: Catalog items
│   ├── Test: New laptop request routes to Hardware Support
│   ├── Test: New laptop request requires a cost centre
│   └── Test: Onboarding request creates three tasks
├── Suite: Incident core
│   ├── Test: Critical incident routing
│   └── Test: ITIL user cannot delete an incident
└── Suite: Notifications
    └── Test: Assignment notification addresses the group
```

Two organizing schemes work in practice, and most teams end up with both:

- **By application or scoped app** — matches how work is assigned and how update sets are cut. When you change the HR app, you know which suite to run.
- **By risk tier** — a small **smoke suite** of the five or ten tests that must pass before anything else is worth checking, and a full regression suite that takes as long as it takes.

The smoke suite is the one that earns its keep. It runs after every promotion, finishes fast, and answers "did I break the instance" before anyone spends an hour on the long suite.

Order inside a suite matters less than order inside a test, but it is not free: put fast server-only tests before slow browser tests so failures surface early, and if a suite is configured to stop on the first failure, put the tests that prove the environment is sane at the top.

## The client test runner

Any test with a form or catalog step needs a browser to drive. The **client test runner** is that browser: a page you open on the instance that registers itself as available, then receives one instruction at a time from the test and reports the result back.

Working rules for the runner:

- **It must stay open.** Close the tab and the run has nowhere to go. Tests waiting on a runner sit in a waiting state until one appears or the wait times out.
- **Keep it in the foreground.** Browsers throttle background tabs. A runner in a background tab or a minimized window produces timeouts that look like product bugs and are not.
- **One run at a time per runner.** If you want two suites running in parallel you need two runners, on separate browser sessions.
- **Window size is part of the test environment.** Form steps interact with rendered UI. A very small window can change what is visible and turn a passing test red.
- **The runner runs as a session.** Combined with the impersonation steps inside your tests, this is what makes ACL and UI-policy assertions meaningful.

Server-only tests do not need any of this. They run from the test or suite record directly. This is a real reason to prefer server assertions where the behavior allows it: a suite with no browser steps can be scheduled unattended, and a suite with browser steps cannot, at least not without arranging a machine that keeps a runner open.

## Reading results

A run produces a small hierarchy of result records, and knowing the shape saves you from guessing:

- **Suite result** — one per run of the suite: overall status, start and end time, and the child test results.
- **Test result** — one per test in that run: status, duration, and the failing step if any.
- **Step result** — one per step: inputs used, outputs produced, and the assertion message. For UI steps, a screenshot is captured on failure, which is usually the fastest way to see that a modal was covering the button.

Triage failures in this order: is the failure real, is the test wrong, or is the environment wrong. "Environment wrong" is the most common on a shared sub-production instance — a clone landed, data changed, the runner's browser went to sleep. Fix the cause; do not deactivate the test, because a deactivated test is a hole in the net that nobody remembers.

## Scheduling a suite

A suite that only runs when a person remembers to run it is a suite that runs before demos and never before upgrades. Scheduling is how it becomes routine.

The platform gives you a **scheduled test suite** record. It is the ordinary scheduling engine — the same one behind every scheduled job on the instance — pointed at a suite:

- **The suite to run.**
- **A run cadence** — daily, weekly, monthly, periodically, or once. Same options, same semantics, as any other scheduled job.
- **A time**, interpreted in the scheduled record's time zone. Get this wrong and your "overnight" run starts in the middle of the customer's working day.
- **A run-as user**, whose roles determine what the run itself may do before any impersonation step inside the tests takes over.
- **Where browser tests run**, if the suite has any: a scheduled run of browser tests needs a registered client test runner waiting when the schedule fires, or those tests wait and then fail.

Scheduling well is mostly about avoiding collisions with the instance's other automation:

1. **Do not overlap the clone window.** A scheduled run that fires while a sub-production instance is being refreshed will produce a screenful of failures that mean nothing.
2. **Do not overlap another suite.** Two suites writing test data on the same instance at the same time will interfere, especially if either one queries by anything other than a sys ID it created.
3. **Pick off-hours, but pick off-hours in the right time zone.** Confirm the time zone on the record rather than assuming it inherits yours.
4. **Keep the cadence honest.** Nightly for a smoke suite is reasonable. Nightly for a three-hour full regression suite that nobody reads the results of is theatre; weekly, plus on demand before each promotion, is more useful.
5. **Never schedule against production.** This bears repeating because a schedule is exactly the mechanism by which a well-meant test run becomes a nightly source of live incident records.

## Making failures reach a human

A scheduled run nobody looks at is worse than no scheduled run, because it creates the impression of coverage. Close the loop with the platform's own eventing.

The pattern is standard platform automation, not something specific to ATF:

1. A business rule on the **suite result** table, running after insert or update, detects a completed run whose status is a failure.
2. That rule pushes an event onto the event queue with the result record as its context:

```javascript
// Business rule: after update on the test suite result table
// Condition: status changes to a failed value
gs.eventQueue('atf.suite.failed', current, current.status, current.getDisplayValue('test_suite'));
```

3. You register `atf.suite.failed` in the event registry so it is documented rather than mysterious.
4. A notification is triggered by that event and sent to the implementation team's group, with a link to the suite result.

That is the whole loop: **schedule → run → event → notification → a person who reads it.** The event layer is worth using rather than sending mail straight from the business rule, because other things can subscribe to the same event later — a script action that opens a defect record, for instance — without anyone editing the rule that detects the failure.

Two cautions. First, notify on failure, not on every run; an email that is green 95 percent of the time trains people to filter it. Second, if a scheduled suite is failing for a known environmental reason, fix it or pause the schedule deliberately. Leaving a permanently red schedule running is the fastest way to make the whole practice ignorable.

## Practice

Use the test you built in lesson 3, on a sub-production instance.

1. Create a second short test — for example, that a user with only the ITIL role cannot delete an incident — so that you have two tests to group.
2. Create a suite named `Smoke - Incident core` and add both tests to it, ordering the faster one first.
3. Create a parent suite named `Regression - Incident` and add `Smoke - Incident core` as a child suite. Run the parent and confirm the child ran.
4. Open the client test runner in a second browser tab, then run a test containing a form step from the first tab. Watch the runner drive the form.
5. Now close the runner tab and start the same run again. Observe what the run reports while no runner is available, then reopen the runner and let it complete. Write down what that failure or waiting message looks like, so you recognize it later.
6. Create a scheduled test suite for `Smoke - Incident core`. Set it to run daily at a time outside working hours, and check the time zone on the record explicitly. Then use the record's on-demand execution to prove the schedule's configuration works without waiting overnight.
7. Add the failure-notification loop: a business rule on the suite result table that calls `gs.eventQueue` when a run fails, the event registered, and a notification triggered by the event addressed to yourself. Force a failure by breaking one assertion, run the suite, and confirm the notification arrives. Repair the assertion afterwards.

## Check your understanding

1. Why does a suite made only of server steps schedule more easily than a suite with form steps?
2. A scheduled smoke run fails every test at 02:00 on the night a clone was scheduled. Real failure, bad test, or bad environment? What do you change?
3. Why route failure alerts through `gs.eventQueue` and an event-triggered notification instead of sending mail directly from the business rule?
4. Why notify only on failure?

*Answers:* (1) Server steps need no browser; form steps need a client test runner open and in the foreground when the schedule fires. (2) Bad environment; move the schedule so it does not overlap the clone window rather than deactivating tests. (3) Other automation (for example a script action that opens a defect) can subscribe to the same event later without editing the detecting rule. (4) A mostly-green email trains people to filter it, so the real failure gets missed.
