---
course_id: agile200
project_id: agile200-x01
title: "Signup Regression Guard: From Defect Record to Maintained Test"
kind: supplementary-project
status: draft
hours_estimate: 6
difficulty: core
related_lessons:
  - agile200-04
  - agile200-06
  - agile200-07
objectives:
  - Write and maintain automated test scripts as the code changes
  - Keep a defect database a team can actually use
competency_ids:
  - D3-S1-C03
  - D3-S1-C04
  - D3-S1-C06
  - D2-S1-C01
  - D2-S1-C04
  - D3-S1-C05
---

## Scenario

You are the QA engineer on a small capstone team building an accounts feature: signup, login, and (later) password reset. It is the middle of week 2. Two defects have just come in, and they are the same two the course uses as examples in Lesson 07:

- **DEF-01: "Signup form allows duplicate email addresses."** Entering an email already registered to an existing account creates a second account with the same email.
- **DEF-02: "Login form accepts a blank password and logs the user in."**

The developer on your team says both are "a two-line fix." That is probably true. Your job is not just to see them fixed. It is to make sure they are filed properly, triaged, guarded by automated regression tests, and still guarded a week from now after the code has changed twice more underneath your tests.

You get a small starter module (below) that stands in for the capstone's accounts logic, with both defects still in it. Everything runs on Node's built-in test runner, with zero dependencies.

## What you will build / produce

1. Two defect records in your tracker (or a spreadsheet standing in for one), written with the Lesson 07 template, triaged for severity and priority.
2. A small automated suite (unit level) built on Arrange, Act, Assert, including one regression test per defect.
3. One reusable test utility (`makeTestUser`) that at least three tests use.
4. Two maintenance commits: one where the behavior changed on purpose and you updated a test, and one where a test caught a real regression and you fixed the code, not the test.
5. An updated weekly outcomes log row (Lesson 03) with defects opened and verified-closed.

## Before you start (prerequisites, starter files or data)

- Node.js 20 or newer (`node --version`). Nothing to `npm install`.
- Lessons 04, 06, and 07 read.
- Create this folder layout. The helper file sits in `support/`, not `test/`, on purpose: `node --test` treats every `.js` file inside a `test/` folder as a test file, so a helper placed there shows up as an extra "test" in your results.

```text
signup-guard/
├── src/
│   └── accounts.js
├── support/
│   └── fixtures.js
└── test/
    └── accounts.test.js
```

**`src/accounts.js` (starter, contains DEF-01 and DEF-02):**

```javascript
'use strict';

// Starter code for the capstone "accounts" module.
// It contains two known defects. Do not fix them until Milestone 2.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function createAccountStore(seed = []) {
  const accounts = seed.map((account) => ({ ...account }));

  function signup({ email, password }) {
    if (!EMAIL_PATTERN.test(email)) {
      return { ok: false, error: 'Enter a valid email address' };
    }
    const account = { email, password, role: 'member' };
    accounts.push(account);
    return { ok: true, account: { email: account.email, role: account.role } };
  }

  function login(email, password) {
    const account = accounts.find((a) => a.email === email);
    if (!account) {
      return { ok: false, error: 'Email or password is incorrect' };
    }
    if (password && account.password !== password) {
      return { ok: false, error: 'Email or password is incorrect' };
    }
    return { ok: true, message: 'Welcome back' };
  }

  function count() {
    return accounts.length;
  }

  return { signup, login, count };
}

module.exports = { createAccountStore };
```

**`support/fixtures.js` (your test utility, Lesson 06 "Building a small test utility"):**

```javascript
'use strict';

// makeTestUser: returns a fresh, valid signup payload.
// A counter (not Date.now()) guarantees unique emails even when
// two calls happen in the same millisecond.
let counter = 0;

function makeTestUser(overrides = {}) {
  counter += 1;
  return {
    email: `user-${counter}@example.com`,
    password: 'correct-horse-battery',
    ...overrides,
  };
}

// The known seed account every test environment starts with (Lesson 04).
const SEED_ACCOUNTS = [
  { email: 'test.user@example.com', password: 'correct-horse-battery', role: 'member' },
];

module.exports = { makeTestUser, SEED_ACCOUNTS };
```

## Milestones

1. **File and triage (45 min).** Reproduce both defects by calling the starter module from a scratch script or the Node REPL (`node`, then `const { createAccountStore } = require('./src/accounts.js')`). File DEF-01 and DEF-02 with every field from the Lesson 07 template: steps starting from a known state (the seed account `test.user@example.com`), expected, actual, environment, severity, priority, status `New`. Then triage them: decide severity and priority separately and write one sentence justifying each. Hint: a blank password that logs someone in is an authentication bypass on the most important path of an accounts feature.
2. **Write the acceptance tests first (60 min).** Create `test/accounts.test.js` (below). Run `node --test` and confirm exactly two failures, both named after a defect. Failing first proves each regression test can actually catch its defect. A regression test you have never seen fail has not proven anything yet.
3. **Fix the code, not the tests (30 min).** Change `src/accounts.js` until all seven tests pass. Do not edit any assertion. Move both defects to `Fixed`, then have someone else re-run the original repro steps and `node --test`, and only then move them to `Verified` and `Closed`.
4. **Maintenance 1: behavior changed on purpose (30 min).** The product owner decides the invalid-email message is unhelpful. New copy: `Enter an email address like name@example.com`. Change the source. One test goes red. Decide, in writing, "real bug or changed on purpose?", then update the test **in the same commit** as the source change (Lesson 06, "Maintaining tests as the code changes").
5. **Maintenance 2: a real regression (30 min).** Your instructor (or a teammate) applies a "refactor" to `signup` that you have not seen. Run the suite. If a regression test goes red, treat it as a question: reopen the right defect (status `Reopened` or back to `In Progress`, per your tracker), link the commit, fix the code, and re-verify. Do not touch the assertion.
6. **Log the outcomes (15 min).** Add or update your Sprint 2 row in the weekly outcomes log: defects opened, defects verified-closed (not just marked fixed), and a note on the reopen.

**`test/accounts.test.js` (acceptance-test sketch):**

```javascript
'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { createAccountStore } = require('../src/accounts.js');
const { makeTestUser, SEED_ACCOUNTS } = require('../support/fixtures.js');

describe('signup', () => {
  test('rejects an invalid email', () => {
    // Arrange
    const store = createAccountStore(SEED_ACCOUNTS);
    // Act
    const result = store.signup(makeTestUser({ email: 'not-an-email' }));
    // Assert
    assert.deepEqual(result, { ok: false, error: 'Enter a valid email address' });
  });

  test('creates a member account for a new, valid email', () => {
    const store = createAccountStore(SEED_ACCOUNTS);
    const user = makeTestUser();
    const result = store.signup(user);
    assert.equal(result.ok, true);
    assert.deepEqual(result.account, { email: user.email, role: 'member' });
    assert.equal(store.count(), 2);
  });

  test('DEF-01 regression: refuses a duplicate email address', () => {
    const store = createAccountStore(SEED_ACCOUNTS);
    const result = store.signup(makeTestUser({ email: 'test.user@example.com' }));
    assert.deepEqual(result, { ok: false, error: 'Email already registered' });
    assert.equal(store.count(), 1, 'no second account should be created');
  });
});

describe('login', () => {
  test('logs in the seed user with the correct password', () => {
    const store = createAccountStore(SEED_ACCOUNTS);
    const result = store.login('test.user@example.com', 'correct-horse-battery');
    assert.deepEqual(result, { ok: true, message: 'Welcome back' });
  });

  test('rejects a wrong password', () => {
    const store = createAccountStore(SEED_ACCOUNTS);
    const result = store.login('test.user@example.com', 'wrong-password');
    assert.equal(result.ok, false);
  });

  test('DEF-02 regression: rejects a blank password', () => {
    const store = createAccountStore(SEED_ACCOUNTS);
    const result = store.login('test.user@example.com', '');
    assert.deepEqual(result, { ok: false, error: 'Email or password is incorrect' });
  });
});

describe('test utilities', () => {
  test('makeTestUser returns a unique email on every call', () => {
    const emails = new Set();
    for (let i = 0; i < 1000; i += 1) emails.add(makeTestUser().email);
    assert.equal(emails.size, 1000);
  });
});
```

Run it from the `signup-guard/` folder:

```bash
node --test
```

Against the starter code you should see `tests 7`, `pass 5`, `fail 2`, with the two failures named `DEF-01 regression: ...` and `DEF-02 regression: ...`. After Milestone 3 you should see `pass 7`, `fail 0`. (The exact layout of the output depends on your Node version and whether you are in an interactive terminal; add `--test-reporter=spec` if you want the readable tree format everywhere.)

## Acceptance criteria

- [ ] DEF-01 and DEF-02 exist as defect records with every Lesson 07 field filled, and severity and priority each have a one-sentence justification.
- [ ] Both regression tests were observed failing against the starter code (screenshot or pasted output).
- [ ] `node --test` passes with zero failures after the fix, with no assertion weakened from the version above.
- [ ] `makeTestUser` is used by at least three tests and has a comment explaining what it does and why it uses a counter.
- [ ] Maintenance 1: the source change and the test update are in the same commit, and the commit message says the behavior changed on purpose.
- [ ] Maintenance 2: the regression is fixed in source, the defect shows a reopen and a second verification, and the commit is linked from the defect.
- [ ] Both defects end in `Closed` only after someone other than the fixer verified them.
- [ ] The weekly outcomes log row shows opened and verified-closed counts separately.

## Automated checks (coding courses) / Evidence checklist (non-coding)

Automated: `node --test` from the project root is the check. A reviewer runs it against your final commit and expects `fail 0`. They then check out the commit before your Milestone 3 fix and expect exactly the two `DEF-` tests to fail.

Evidence to hand in:

- [ ] Links to (or exports of) the two defect records, showing full status history
- [ ] Output of `node --test` before and after the fix
- [ ] Commit links for Milestones 3, 4, and 5
- [ ] A two-sentence note for each maintenance commit answering "real bug or changed on purpose, and how did you know?"
- [ ] The outcomes log row

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Defect records | Vague title or steps; severity and priority treated as the same thing | All template fields filled; steps reproduce from the seed state; severity and priority justified separately | Records also tag an area ("auth") and link the regression test by name |
| Regression tests | Tests pass but were never seen failing, or check several unrelated things | One test per defect, each seen failing first, one Act and one reason to fail | Adds edge cases the defect implies (see Stretch goals) without being asked |
| Test maintenance | Assertion loosened to get green, or test updated in a later commit | Changed-on-purpose and real-bug cases told apart correctly, with tests updated in the same commit | Written reasoning cites the defect record or the product owner's decision as evidence |
| Test utility | Helper exists but is unused or undocumented | Used by three or more tests, documented, deterministic | Utility extended (for example a `makeSeededStore()`) and adopted across the suite |
| Defect tracking | Defects closed by the fixer | Verified by someone else; reopen recorded; outcomes log updated | Outcomes log note explains what the reopen says about test coverage |

## Stretch goals

- Duplicate emails that differ only by case (`Test.User@example.com`) should also be refused. Write the test first, watch it fail or pass, and decide whether that is a new defect or part of DEF-01.
- Add a `smoke` script: one file that runs only the two login tests and the "creates a member account" test, and prints a one-line pass/fail. This is the "smoke-test runner script" utility from Lesson 06.
- Write a second suite at integration level once your real capstone has a database: the same DEF-01 test, but against the seeded test database from Lesson 04.

## Reflection prompts

- Which of the two defects did you rate higher severity, and would your priority call change the day before a demo?
- In Maintenance 2, what did you look at first to decide whether the red test was a real bug? Was that the right first move?
- If DEF-02 had been "fixed" by deleting the blank-password test, how long would it have taken your team to notice?

## Instructor notes (common pitfalls, how to adapt for time)

- **Reference fix for Milestone 3:** in `signup`, before creating the account, return `{ ok: false, error: 'Email already registered' }` if any existing account's email matches. In `login`, change `if (password && account.password !== password)` to `if (account.password !== password)`. The blank-password bug comes from the `password &&` guard: an empty string is falsy, so the comparison is skipped.
- **Injection for Milestone 5:** replace the duplicate check with one that only compares the first account (`accounts[0]`), or remove it entirely. Learners who "fix" the assertion here instead of the code have missed the main point of the project; walk them back through the Lesson 06 two-reasons list.
- **Common pitfall:** placing `fixtures.js` inside `test/`. `node --test` then counts it as an extra test file and the totals stop matching the brief. This is a useful, small lesson in how test discovery works.
- **Common pitfall:** learners who reach for `Date.now()` in the helper, as in the lesson's original example, can produce colliding emails when two calls land in the same millisecond. The 1000-iteration uniqueness test exists to make that visible.
- **Short on time:** skip Milestone 5 and give the injected regression as a pre-written diff for discussion instead.
- **Team adaptation:** one person files and triages, another writes the tests, and a third verifies. That makes "someone other than the fixer verifies" real rather than simulated.
