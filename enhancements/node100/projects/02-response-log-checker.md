---
course_id: node100
project_id: node100-x02
title: "Response Log Checker"
kind: supplementary-project
status: draft
hours_estimate: 4
difficulty: stretch
related_lessons:
  - node100-03
  - node100-04
  - node100-05
  - node100-07
objectives:
  - Express decisions with conditional operators and boolean logic
  - Repeat work with the looping constructs Node provides
  - Break a larger problem into small, independently testable functions
  - Write a small assertion script that checks another program's behaviour
competency_ids:
  - D5-S1-C02
  - D3-S1-C03
  - D3-S1-C06
---

## Scenario

Lesson 04 counted failures in a hard-coded `responseCodes` array. In the real job, those codes arrive as lines of a server log that a developer pastes into a ticket, and some lines are garbage. You will build `log-checker.js`, the "log-checker" tool the course has been naming in its examples, which reads log text and reports how many requests failed and on which paths.

Each well-formed line looks like `METHOD PATH STATUS DURATIONms`, separated by one or more spaces, for example `GET /login 200 88ms`.

## What you will build / produce

`log-checker.js` exporting:

- `parseLogLine(line)` returns `{ method, path, statusCode, durationMs }` (numbers for the last two) or `null` if the line does not have exactly four parts, the status is not an integer, or the duration does not end in `ms`.
- `isFailure(entry)` returns `true` when `statusCode >= 400`.
- `checkLog(text)` returns `{ total, failures, malformed, failedPaths }`: blank lines are skipped entirely, malformed lines are counted but not included in `total`, and `failedPaths` lists each failing path once, in first-seen order.

Plus your own `check-log-checker.js` assertion script.

## Before you start (prerequisites, starter files or data)

- Lessons 03 to 07. You will need two string methods not covered in the lessons: `line.trim().split(/\s+/)` splits on any run of whitespace (the same regex idea as `slugify`), and `"88ms".endsWith("ms")` checks a suffix. `Number("200")` converts text to a number; `Number.isInteger` checks the result.
- Sample log for manual runs:

```text
GET /login 200 88ms
POST /login 401 51ms

GET /cart 500 1203ms
this line is garbage
GET /cart 500 990ms
```

## Milestones

1. Write `isFailure` and three cases for it on either side of `400`.
2. Write `parseLogLine` for the happy path, then add each `null` rule one at a time, adding a case to your checker before each rule (write the check first, watch it fail, then make it pass).
3. Write `checkLog` using a `for...of` loop over `text.split("\n")` and an accumulator object.
4. Run the acceptance tests and fix failures.

## Acceptance criteria

- [ ] `parseLogLine` returns `null` (not `undefined`, not a thrown error) for every malformed shape listed.
- [ ] `399` is not a failure; `400` is.
- [ ] Blank lines are ignored; garbage lines are counted in `malformed`.
- [ ] `failedPaths` has no duplicates.
- [ ] `checkLog("")` returns all zeros and an empty array.
- [ ] `node --test log-checker.test.js` passes.

## Automated checks (coding courses) / Evidence checklist (non-coding)

Save as `log-checker.test.js` and run `node --test log-checker.test.js` (Node 18+).

```javascript
// Run with: node --test log-checker.test.js   (Node 18 or newer)
const test = require("node:test");
const assert = require("node:assert/strict");
const { parseLogLine, isFailure, checkLog } = require("./log-checker.js");

test("parseLogLine turns a well-formed line into an object", () => {
  assert.deepEqual(parseLogLine("GET /login 200 88ms"),
    { method: "GET", path: "/login", statusCode: 200, durationMs: 88 });
});

test("parseLogLine tolerates extra spaces but returns null for malformed lines", () => {
  assert.deepEqual(parseLogLine("  POST   /cart  500   1203ms "),
    { method: "POST", path: "/cart", statusCode: 500, durationMs: 1203 });
  assert.equal(parseLogLine("GET /login"), null);
  assert.equal(parseLogLine("GET /login OK 88ms"), null);
  assert.equal(parseLogLine("GET /login 200 88"), null);
});

test("isFailure uses 400 as the boundary", () => {
  assert.equal(isFailure({ statusCode: 399 }), false);
  assert.equal(isFailure({ statusCode: 400 }), true);
  assert.equal(isFailure({ statusCode: 503 }), true);
});

test("checkLog summarizes a whole log, skipping blank lines", () => {
  const log = [
    "GET /login 200 88ms",
    "POST /login 401 51ms",
    "",
    "GET /cart 500 1203ms",
    "this line is garbage",
    "GET /cart 500 990ms",
  ].join("\n");
  assert.deepEqual(checkLog(log), { total: 4, failures: 3, malformed: 1, failedPaths: ["/login", "/cart"] });
});

test("checkLog on an empty log reports zeros, not an error", () => {
  assert.deepEqual(checkLog(""), { total: 0, failures: 0, malformed: 0, failedPaths: [] });
});
```

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Conditions | Truthy shortcuts (`if (code)`) or loose `==` | Strict comparisons; named booleans for each rule | Every `null` rule has its own named boolean and its own case |
| Loops | Mutates the input or uses index arithmetic needlessly | `for...of` with a clear accumulator | Uses `continue` deliberately and explains why in a comment |
| Decomposition | Parsing and counting tangled in one function | Three functions, each independently checked | Adds a `formatReport(report)` wrapper with its own cases |
| Testing | Checker only covers the happy path | Boundaries and malformed lines covered | Learner found a case the acceptance tests miss and added it |

## Stretch goals

- Add `slowestPath(text)` returning the path with the largest single duration.
- Read the log from a file path given on the command line (`process.argv[2]` and `require("fs").readFileSync(path, "utf8")`).

## Reflection prompts

- Why does `parseLogLine` return `null` instead of throwing? When would throwing be better?
- Which single case in your checker would catch `> 400` written instead of `>= 400`?

## Instructor notes (common pitfalls, how to adapt for time)

- Pitfalls: splitting on a single space `" "` (breaks on double spaces); forgetting `Number("OK")` is `NaN`, not an error; counting blank lines as malformed.
- Regex and `process.argv` are lightly introduced here; give the snippets directly if learners stall.
- Short on time: skip `failedPaths` and remove it from the expected objects.
