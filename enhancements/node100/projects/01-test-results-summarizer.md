---
course_id: node100
project_id: node100-x01
title: "Test Results Summarizer"
kind: supplementary-project
status: draft
hours_estimate: 5
difficulty: core
related_lessons:
  - node100-05
  - node100-06
  - node100-07
objectives:
  - Break a larger problem into small, independently testable functions
  - Model data with objects and arrays
  - Write a small assertion script that checks another program's behaviour
competency_ids:
  - D5-S1-C02
  - D3-S1-C03
  - D3-S1-C06
---

## Scenario

Your QA team's nightly run produces an array of test results with the same shape you designed in lesson 06: `{ name, status, durationMs }`. Right now someone scrolls through the raw output each morning to count failures and spot slow tests. Your lead asks you to build a small Node module, `summarize-results.js`, that turns that array into a one-line report and an exit code a CI job could act on, plus your own assertion script that proves it works.

## What you will build / produce

- `summarize-results.js` exporting four pure functions via `module.exports`:
  - `countByStatus(results)` returns `{ pass, fail, skip }` (all three keys always present). Throws an `Error` whose message starts with `Unknown status` if any entry has a status other than `"pass"`, `"fail"`, or `"skip"`.
  - `findSlowTests(results, thresholdMs)` returns an array of names whose `durationMs` is strictly greater than `thresholdMs`, in input order.
  - `formatSummary(counts)` returns exactly `"<total> tests: <pass> passed, <fail> failed, <skip> skipped"`.
  - `exitCodeFor(counts)` returns `1` if `fail > 0`, otherwise `0`.
- `check-summarize-results.js`: your own lesson-07-style checker (cases array, try/catch, pass/fail count).
- `run-summary.js`: a thin wrapper that holds a sample `results` array, prints the summary and slow tests, and calls `process.exit(exitCodeFor(counts))`. This is the only file allowed to have side effects.

## Before you start (prerequisites, starter files or data)

- Lessons 02 to 07 complete; Node 18 or newer (`node --version`).
- Sample data (paste into `run-summary.js` and your checker):

```javascript
const results = [
  { name: "login rejects bad password", status: "fail", durationMs: 142 },
  { name: "login accepts valid password", status: "pass", durationMs: 88 },
  { name: "logout clears session", status: "pass", durationMs: 51 },
  { name: "password reset email sent", status: "skip", durationMs: 0 },
  { name: "profile page loads", status: "pass", durationMs: 1203 },
];
```

## Milestones

1. Write the shape comment for a result and for the counts object before any code (lesson 06).
2. Implement `countByStatus` with a `for...of` loop and an accumulator object (lessons 04, 06). Do not mutate the input.
3. Implement `findSlowTests` and `formatSummary`. Name every intermediate boolean (lesson 03).
4. Implement `exitCodeFor` and the `run-summary.js` wrapper. Run `node run-summary.js; echo $?` and confirm it prints `1`.
5. Write `check-summarize-results.js` with at least 8 cases across the four functions, including an empty array, a threshold exactly equal to a duration, and an unknown status (use `assert.throws`).
6. Run the provided acceptance tests below. Fix your code (or, if you are sure the code is right, write down why you think the test is wrong and ask your instructor).

## Acceptance criteria

- [ ] All four functions are exported and pure (no `console.log`, no changes to arguments).
- [ ] `countByStatus([])` returns `{ pass: 0, fail: 0, skip: 0 }`.
- [ ] A threshold equal to a test's duration does not count that test as slow.
- [ ] An unknown status throws instead of being silently ignored.
- [ ] `node run-summary.js` exits with code `1` for the sample data and `0` after you change the failing result to `"pass"`.
- [ ] Your own checker reports a pass/fail count and has at least 8 cases.
- [ ] `node --test acceptance.test.js` passes.

## Automated checks (coding courses) / Evidence checklist (non-coding)

Save as `acceptance.test.js` next to `summarize-results.js` and run `node --test acceptance.test.js`. It uses Node's built-in test runner (`node:test`), which is a slightly more structured version of the checker you wrote in lesson 07: each `test(...)` is one named case, and the runner does the pass/fail counting for you.

```javascript
// Run with: node --test acceptance.test.js   (Node 18 or newer)
const test = require("node:test");
const assert = require("node:assert/strict");
const { countByStatus, findSlowTests, formatSummary, exitCodeFor } = require("./summarize-results.js");

const results = [
  { name: "login rejects bad password", status: "fail", durationMs: 142 },
  { name: "login accepts valid password", status: "pass", durationMs: 88 },
  { name: "logout clears session", status: "pass", durationMs: 51 },
  { name: "password reset email sent", status: "skip", durationMs: 0 },
  { name: "profile page loads", status: "pass", durationMs: 1203 },
];

test("countByStatus counts every status, including zero counts", () => {
  assert.deepEqual(countByStatus(results), { pass: 3, fail: 1, skip: 1 });
  assert.deepEqual(countByStatus([]), { pass: 0, fail: 0, skip: 0 });
});

test("countByStatus rejects a result with an unknown status", () => {
  assert.throws(() => countByStatus([{ name: "x", status: "passed", durationMs: 1 }]), /Unknown status/);
});

test("countByStatus does not modify its input", () => {
  const copy = structuredClone(results);
  countByStatus(results);
  assert.deepEqual(results, copy);
});

test("findSlowTests returns names strictly above the threshold, in input order", () => {
  assert.deepEqual(findSlowTests(results, 100), ["login rejects bad password", "profile page loads"]);
  assert.deepEqual(findSlowTests(results, 142), ["profile page loads"]);
  assert.deepEqual(findSlowTests([], 100), []);
});

test("formatSummary produces the exact report line", () => {
  assert.equal(formatSummary({ pass: 3, fail: 1, skip: 1 }), "5 tests: 3 passed, 1 failed, 1 skipped");
});

test("exitCodeFor is 1 when anything failed, 0 otherwise", () => {
  assert.equal(exitCodeFor({ pass: 3, fail: 1, skip: 0 }), 1);
  assert.equal(exitCodeFor({ pass: 3, fail: 0, skip: 2 }), 0);
});
```

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Decomposition | One large function or side effects mixed into logic | Four pure functions, one job each; side effects only in the wrapper | Also extracts small helpers (for example `isSlow(result, thresholdMs)`) with their own cases |
| Data modeling | Shape is implicit; keys vary | Shape comments written; counts object always has all three keys | Validates input shape and reports which entry is malformed |
| Own assertion script | Fewer than 8 cases or stops at first failure | 8+ cases, try/catch reporting, boundaries covered | Cases chosen deliberately with a comment per case explaining what it protects |
| Acceptance tests | Some fail | All pass | All pass and learner added one extra `test(...)` that caught a real mistake |

## Stretch goals

- Read the results from a `results.json` file with `require("./results.json")` instead of a hard-coded array.
- Add `averageDuration(results)` and decide (in a comment) what it should return for an empty array, then assert it.
- Print the slow tests sorted from slowest to fastest without changing `findSlowTests`.

## Reflection prompts

- Which of your cases would have caught a `>=` vs `>` mistake in `findSlowTests`? Which would not?
- Why is it useful that `exitCodeFor` is separate from `process.exit`?
- Did any acceptance test fail because your expected value, not your code, was wrong?

## Instructor notes (common pitfalls, how to adapt for time)

- Common pitfalls: initializing counts as `{}` so missing statuses become `undefined`; using `>=` for the threshold; calling `process.exit` inside `countByStatus`; comparing objects with `strictEqual` instead of `deepStrictEqual`.
- `node:test` and `node:assert/strict` are not taught in lesson 07; point out that `assert/strict` makes `deepEqual` behave like `deepStrictEqual`. Learners only need to run the file, not write in that style.
- Short on time: drop `exitCodeFor` and the wrapper (milestone 4) and the matching test.
