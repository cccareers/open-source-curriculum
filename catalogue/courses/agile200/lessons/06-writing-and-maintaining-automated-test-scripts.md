---
lesson_id: agile200-06
course_id: agile200
pathway: quality-assurance-software-engineer
title: Writing and Maintaining Automated Test Scripts
order: 6
kind: lesson
competency_ids:
  - D3-S1-C03
  - D3-S1-C04
  - D3-S1-C06
objectives:
  - Write and maintain automated test scripts as the code changes
---

## Writing tests is the easy half

Anyone can write a test that passes once, against the code as it exists this afternoon. The hard, and more valuable, half of this skill is keeping that test correct and useful as the code underneath it keeps changing for the next two and a half weeks. This lesson covers both: using your test runner and browser automation library (installed in Lesson 04) to write real tests against your test environment, and the ongoing discipline of maintaining them.

## Structuring a test

Every automated test, regardless of level, follows the same shape — often called Arrange, Act, Assert:

```javascript
// example using a generic test-runner syntax; adapt to your tooling
test("rejects an invalid email on the signup form", () => {
  // Arrange: set up the state the test needs
  const form = renderSignupForm();

  // Act: perform the behavior under test
  form.fillEmail("not-an-email");
  form.submit();

  // Assert: check the outcome
  expect(form.errorMessage()).toBe("Enter a valid email address");
});
```

Keep each test to one Act and one clear reason to fail. A test that checks five unrelated things fails for an ambiguous reason and becomes exactly the kind of test people learn to ignore.

## Writing at each level

Follow the risk-based plan from your Lesson 05 test strategy — write unit tests for the logic-heavy, high-likelihood-of-breaking paths first, then integration tests around the seams you flagged, then a small number of end-to-end tests for your highest-impact user paths.

For end-to-end tests with your browser automation library, target elements the way a real user would — visible text, labels, roles — rather than brittle internal selectors that break on any markup change:

```javascript
// example E2E test, written in Playwright's syntax; other libraries have equivalents
test("user can log in with valid credentials", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("test.user@example.com");
  await page.getByLabel("Password").fill("correct-horse-battery");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.getByText("Welcome back")).toBeVisible();
});
```

Run your smoke test subset (defined in Lesson 05) on every merge, and your fuller regression pass at least once before each weekly checkpoint.

## Maintaining tests as the code changes

A test suite in a project that's actively being built breaks for two very different reasons, and telling them apart is the core skill this lesson is really about:

- **The test caught a real bug.** The code changed in a way that broke actual behavior. Fix the code, not the test.
- **The test is now testing the wrong thing.** The behavior legitimately changed on purpose (a button's label changed, a field became optional), and the test is failing because it still expects the old behavior. Fix the test.

Treat every red test as a question, not an annoyance: "did we break something, or did the world change out from under this test?" Never "fix" a failing test by loosening its assertion until it passes without first answering that question — that is how a test suite quietly stops testing anything.

A few concrete maintenance habits:

- **When you rename or restructure something the tests reference**, update the tests in the same commit or pull request as the change, not "later." A test suite that's one commit behind the code is already starting to rot.
- **Delete tests for removed features.** A test for a feature that no longer exists doesn't fail — it just sits there passing trivially, or gets deleted in a panic when someone finally notices it's testing nothing.
- **Watch for flaky tests** — ones that pass and fail intermittently with no code change. A flaky test is worse than a missing one, because it teaches the team to re-run failures instead of investigating them. Common causes: tests that depend on timing (waiting a fixed number of milliseconds instead of waiting for a specific condition), tests that depend on shared state left over from a previous test, or tests that depend on external services being up. Fix the root cause; do not just retry until green.
- **Keep a running note of test debt.** When you notice a test that's awkward, slow, or testing the wrong thing but don't have time to fix it now, log it (in your defect database from Lesson 07, or a simple running list) rather than letting it become invisible.

## Building a small test utility

Beyond individual test scripts, D3-S1-C06 asks you to design or develop automated testing tools — not just use them, but build something that makes testing itself easier. For a capstone-sized project, a small, focused utility is enough. Examples:

- A **seed-data helper** that creates a fresh, known test user (or other core object) with sensible defaults, so every test that needs one doesn't repeat the same setup code.
- A **custom assertion/matcher** for a check your tests make often — e.g., asserting an API response matches your expected shape, instead of repeating field-by-field checks everywhere.
- A **smoke-test runner script** that runs your defined smoke subset with one command and prints a clear pass/fail summary — useful in its own right, and it's what you'll wire into "run on every merge."

```javascript
// example: a small reusable test helper
function makeTestUser(overrides = {}) {
  return {
    email: `user-${Date.now()}@example.com`,
    role: "member",
    ...overrides,
  };
}
```

One caution about this example: two calls in the same millisecond produce the same email, which is exactly the kind of intermittent collision that makes a suite flaky. A simple counter (`let nextUserId = 1;` outside the function, then `` `user-${nextUserId++}@example.com` ``) guarantees uniqueness within a run.

Build one such utility, use it in at least three of your own tests, and document what it does and why in a short comment or README section — a tool nobody else can figure out how to use is not much of a tool.

## Practice

Write at least six automated tests for your capstone spanning at least two levels (unit and integration, or integration and end-to-end), following the risk priorities from your Lesson 05 strategy. Then deliberately change one piece of application behavior on purpose (rename a field, change a validation rule) and update the tests that reference it in the same commit. Build one small reusable test utility per the examples above, use it in at least three tests, and add a short note to your defect database or test-debt list identifying one test in your suite that is currently awkward, slow, or flaky, with your best guess at the root cause.

## Check your understanding

1. A test for the signup error message fails after the product owner approved new copy. Do you fix the code or the test?
2. Why is replacing an exact assertion with `assert.equal(result.ok, false)` a dangerous way to make a red test green?
3. Name two common root causes of a flaky test.

*Answers:* (1) The test, in the same commit as the copy change, keeping the assertion exact. (2) It passes for many wrong outputs too, so the test stops protecting the behavior. (3) Fixed waits instead of waiting for a condition; shared state between tests; dependence on external services; non-unique test data (for example `Date.now()` collisions).
