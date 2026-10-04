---
lesson_id: sn301-05
course_id: sn301
pathway: servicenow-implementation-specialist
title: Testing Through Change and Upgrade Cycles
order: 5
kind: lesson
competency_ids:
  - D10-S1-C02
  - D10-S1-C04
objectives:
  - Fit automated tests into an update set, UAT, and upgrade cycle
---

## Tests are configuration, so they move like configuration

A test is not a document that lives beside your work. It is a set of records on the instance, which means it travels the same way every other change travels, and it is subject to the same discipline.

**In a global-scope implementation**, tests, their steps, and suites are captured in the update set that is current when you create them. Two habits follow. First, build the test in the *same* update set as the configuration it proves, so that a promotion carries the behavior and its check together — if the test lands one release later than the feature, there is a window where nobody can verify the feature on the target instance. Second, before you close an update set, open it and confirm the test and suite records are actually in it. Some related records do not capture the way you assume; catch that on the development instance rather than on the test instance.

**In a scoped application**, tests belong to the application and travel inside the application version, whether you move that as an update set, publish it to an application repository, or link the app to source control from Studio. The source-control path is the better DevOps practice where it is available: the tests are versioned in the same branch and the same commit as the configuration, so a branch either contains the feature and its tests or it does not, and a reviewer can see both in one diff.

Whichever mechanism you use, the rule is the same: **a change and the test that proves it are one unit of work.** That is the practice being asked for, not a preference about tooling.

## Where the tests run in a normal release

A typical three-instance path — development, test, production — puts automated tests in three places and deliberately not in a fourth.

1. **On development, while you build.** Write or update the test as you configure. Run it. A failing test here costs minutes.
2. **On test, after the update set is imported and committed.** This is the run that matters most, because it is the first time your configuration meets data and other people's changes that did not exist on your development instance. Run the smoke suite first, then the regression suite for the affected application. A test that passed on development and fails here has found exactly what it was built to find.
3. **During UAT, alongside the business users.** The automated suite handles regression — the things that worked before and must still work. The business users handle judgment — is this the right behavior, is it usable, does it match the process. Do not spend a business user's UAT hours re-clicking what a suite already asserts, and do not pretend a green suite is a sign-off. Sign-off is a person's decision; the suite is evidence that supports it.
4. **Not on production.** After the production deployment you validate with the checks that are safe there: smoke-check the affected records by hand, watch error logs, confirm integrations. Test execution should remain disabled on the production instance, and a scheduled suite should never be pointed at it. If someone proposes it, the argument to make is concrete: an ATF run inserts records, sends notifications, and calls integrations as though a user did it.

Record the outcomes as you go. A promotion note that says "smoke suite green, HR regression suite green except two known-failing tests raised as defects" is what makes a deployment decision reviewable later.

## The upgrade cycle

An upgrade is where the suite pays for the hours you put into it. The shape:

1. **Clone production down** to the sub-production instance you will upgrade first, so you are validating against realistic data and configuration.
2. **Run the full suite before the upgrade.** This is the step people skip, and skipping it makes everything afterwards ambiguous. If a test is already red on the pre-upgrade clone, that failure is not the upgrade's fault, and you want to know that before you spend a day investigating.
3. **Apply the upgrade** to that instance.
4. **Run the full suite again.** Compare against the pre-upgrade run. The delta is your upgrade impact list, produced in the time the suite takes rather than in the time a room full of testers takes.
5. **Work the skipped records** the upgrade produced, alongside the failures. The upgrade lists them in its upgrade history on the upgraded instance; each one needs a decision to keep your version, take the new base version, or merge. A skipped record is a customization the upgrade did not overwrite; a failing test tells you which of those customizations actually matters to behavior. Reviewing skipped records without tests is guesswork about impact.
6. **Re-run after each fix,** then repeat the whole cycle on the next instance in the path, and finally deploy to production with the same production-safe validation as any other release.

The tests also need maintaining across an upgrade. When out-of-box behavior legitimately changes, the correct response is sometimes to update the assertion, not to file a defect. What is never correct is deactivating the test to make the run green.

## Practice

1. Take the suite you built in lesson 4. Create a new update set, make one small configuration change on your instance that the suite covers, and update the affected test in that same update set. Open the update set and list which ATF records were captured and which were not.
2. Write the promotion order you would use for that update set across development, test, and production, and mark at each step which suite you would run and what you would do with the result.
3. Write a five-line pre-upgrade checklist for a customer, in the order the steps happen, including the pre-upgrade suite run and the skipped-record review.
4. Draft two or three sentences you would say to a project manager who asks to run the regression suite on production "just to be sure". Make the reason specific.

## Check your understanding

1. You built the test for a feature in next sprint's update set. What goes wrong on the test instance?
2. After an upgrade, a test that was red on the pre-upgrade clone is still red. Should it go on the upgrade impact list?
3. Out-of-box behavior legitimately changed in the upgrade and the customer wants the new behavior. What do you do with the failing test?
4. What should a promotion note record about the suite run?

*Answers:* (1) The feature arrives without its check, so nobody can verify it on the target instance until the test catches up. (2) No; it was failing before the upgrade. Raise it, but not as upgrade impact. (3) Update the assertion to the new requirement; never deactivate the test. (4) Which suites ran, the result, and any known failures with their defect references.
