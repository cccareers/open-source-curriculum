---
course_id: web101
project_id: web101-x01
title: "Signup Form: Testable Validation and Accessible Errors"
kind: supplementary-project
status: draft
hours_estimate: 6
difficulty: core
related_lessons:
  - web101-02
  - web101-05
  - web101-07
objectives:
  - Validate form input and report errors to the user clearly
  - Use JavaScript variables, functions, and control flow in the browser
  - Debug a broken page in the browser and describe the defect precisely
competency_ids:
  - D5-S1-C01
  - D5-S1-C02
  - D2-S1-C01
  - D3-S1-C02
---

## Scenario

Support tickets say the signup form from lesson 05 "rejects good emails", "accepts a password of eight spaces", and "keeps saying my email is invalid after I fixed it". Your lead asks you to split validation into a pure, testable module, harden its rules, wire it to the page with correctly connected error messages, and file a defect report for each original ticket.

## What you will build / produce

- `validate-signup.js`: a pure `validateSignupForm(email, password, confirmPassword)` returning an array of `{ field, message }` in field order (email, password, confirmPassword). Exported with `module.exports` (and attached to `window` for the page; see starter).
- `signup.html` + `signup.js`: the form from lesson 05, wired to the module, using the lesson 05 `showErrors` pattern (including the clearing of stale `aria-invalid`/`aria-describedby`).
- `defects.md`: three defect reports (one per support ticket) against the *original* lesson 05 code, in the five-part lesson 07 shape.

## Before you start (prerequisites, starter files or data)

- Lessons 02 to 07; Node 18+ to run the acceptance tests.
- Rules to implement:
  - Email is trimmed before checking. Empty or whitespace-only: `"Enter your email address."`. Otherwise it must look like `something@something.something` with no spaces; if not: `"Enter a valid email address, like name@example.com."`
  - Password shorter than 8 characters: `"Password must be at least 8 characters."`. Eight or more characters that are all whitespace: `"Password cannot be only spaces."`
  - Confirmation must equal password exactly: `"Passwords do not match."`
- Making one file work in both Node and the browser:

```javascript
// last lines of validate-signup.js
if (typeof module !== "undefined") module.exports = { validateSignupForm };
if (typeof window !== "undefined") window.validateSignupForm = validateSignupForm;
```

## Milestones

1. Reproduce each support ticket against the original lesson 05 code; write the three defect reports (steps, expected, actual, location, severity).
2. Write `validateSignupForm` as a pure function; run the acceptance tests until they pass.
3. Wire it into the page with `preventDefault()` on submit and `showErrors`; confirm each message element has the `id` its field's `aria-describedby` names (Elements panel).
4. Keyboard-only pass: Tab through, submit with Enter, fix one error, resubmit, and confirm the fixed field loses `aria-invalid`.
5. Add two cases of your own to the test file for anything the suite misses.

## Acceptance criteria

- [ ] `node --test validate-signup.test.js` passes, including your two added cases.
- [ ] `validateSignupForm` never touches the DOM.
- [ ] All errors show at once; resubmitting never duplicates messages.
- [ ] A corrected field loses `aria-invalid` and `aria-describedby` on the next submit.
- [ ] Each message element's `id` matches its field's `aria-describedby`.
- [ ] Every input has a connected `<label for>` ("Email", "Password", "Confirm password"); the lesson 05 starter markup has none, which is itself a web100 defect to fix.
- [ ] Three defect reports, each with a located cause (function and line or the specific wrong value).

## Automated checks (coding courses) / Evidence checklist (non-coding)

Save next to `validate-signup.js` and run `node --test validate-signup.test.js`.

```javascript
// Run with: node --test validate-signup.test.js   (Node 18 or newer)
const test = require("node:test");
const assert = require("node:assert/strict");
const { validateSignupForm } = require("./validate-signup.js");

const fields = (errors) => errors.map((e) => e.field);

test("valid input produces no errors", () => {
  assert.deepEqual(validateSignupForm("ada@example.com", "longenough1", "longenough1"), []);
});

test("surrounding whitespace in the email is tolerated", () => {
  assert.deepEqual(validateSignupForm("  ada@example.com ", "longenough1", "longenough1"), []);
});

test("empty and whitespace-only emails get the 'enter your email' message", () => {
  for (const email of ["", "   "]) {
    const errors = validateSignupForm(email, "longenough1", "longenough1");
    assert.deepEqual(fields(errors), ["email"]);
    assert.match(errors[0].message, /enter your email/i);
  }
});

test("malformed emails are rejected with a message that shows the expected format", () => {
  for (const email of ["ada", "ada@", "@example.com", "ada@example", "ada @example.com"]) {
    const errors = validateSignupForm(email, "longenough1", "longenough1");
    assert.deepEqual(fields(errors), ["email"], `expected ${JSON.stringify(email)} to be rejected`);
    assert.match(errors[0].message, /example\.com/);
  }
});

test("password length boundary: 7 fails, 8 passes", () => {
  assert.deepEqual(fields(validateSignupForm("ada@example.com", "1234567", "1234567")), ["password"]);
  assert.deepEqual(validateSignupForm("ada@example.com", "12345678", "12345678"), []);
});

test("a password of only spaces is rejected even when long enough", () => {
  assert.deepEqual(fields(validateSignupForm("ada@example.com", "        ", "        ")), ["password"]);
});

test("mismatched confirmation is reported on confirmPassword", () => {
  assert.deepEqual(fields(validateSignupForm("ada@example.com", "longenough1", "longenough2")), ["confirmPassword"]);
});

test("every problem is reported at once, in field order", () => {
  assert.deepEqual(fields(validateSignupForm("", "short", "different")), ["email", "password", "confirmPassword"]);
});

test("every message is a non-empty sentence ending in a period", () => {
  for (const e of validateSignupForm("", "short", "different")) {
    assert.match(e.message, /^[A-Z].*\.$/);
  }
});
```

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Validation logic | Some rules missing or DOM mixed in | Pure function, all rules, tests pass | Adds own boundary cases that catch a real mistake |
| Error display | Messages appear but stale state remains | Messages and ARIA state cleared and reapplied correctly | Moves focus to the first invalid field and explains why |
| Defect reports | Vague steps or no location | Five-part reports with located causes | Each report includes the failing test case that now guards it |

## Stretch goals

- Validate on `blur` as well as `submit`, without showing an error on a field the user has not touched yet.
- Use the Playwright sketch below (requires `npm install -D @playwright/test`; not verified in this pass) to check the page end to end:

```javascript
const { test, expect } = require("@playwright/test");
const path = require("node:path");
test("stale email error is cleared after a fix", async ({ page }) => {
  await page.goto("file://" + path.resolve("signup.html"));
  await page.getByLabel("Email").fill("ada");
  await page.getByRole("button", { name: "Sign up" }).click();
  await expect(page.getByLabel("Email")).toHaveAttribute("aria-invalid", "true");
  await page.getByLabel("Email").fill("ada@example.com");
  await page.getByRole("button", { name: "Sign up" }).click();
  await expect(page.getByLabel("Email")).not.toHaveAttribute("aria-invalid", "true");
});
```

## Reflection prompts

- Which ticket was a functional bug and which was a usability or accessibility bug? Could one be both?
- Why is it easier to test `validateSignupForm` than `showErrors`?

## Instructor notes (common pitfalls, how to adapt for time)

- Pitfalls: trimming the password (it should not be trimmed); using `includes("@")` only; forgetting the message `id`; checking `password.trim()` before the length rule, which changes which message appears.
- The email regex is intentionally simple; tell learners real-world email validation is looser on the client and authoritative on the server.
- Short on time: skip milestone 4 and the Playwright stretch.
