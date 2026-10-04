---
lesson_id: node100-07
course_id: node100
pathway: quality-assurance-software-engineer
title: Your First Assertion Script
order: 7
kind: lesson
competency_ids:
  - D3-S1-C03
  - D3-S1-C06
  - D5-S1-C02
objectives:
  - Write a small assertion script that checks another program's behaviour
---

## Where this lesson sits

Every earlier lesson in this course has been building toward one specific skill: writing code you can check automatically instead of by eye. You have variables that behave predictably, boolean conditions written explicitly, loops that produce a single checkable answer, functions small enough to test in isolation, and data with a shape you designed on purpose. This lesson is where all of that pays off. You are going to write a script whose entire job is to run another piece of code and report, without a human watching, whether it behaved the way it was supposed to. That is what testing tooling *is* — and building even a small piece of it is your first hands-on step into the two competencies this lesson is tagged against: operating a testing tool correctly, and building a small piece of test automation yourself.

## What an assertion actually is

An **assertion** is a statement that a condition must be true — if it isn't, the assertion throws an error and stops the script right there, rather than letting the program continue on with something wrong. Node ships a built-in module for this called `assert`, and you don't need to install anything to use it:

```javascript
const assert = require("assert");

assert(1 + 1 === 2); // passes silently — nothing happens
assert(1 + 1 === 3); // throws: AssertionError [ERR_ASSERTION]
```

Called with just one argument, `assert(value)` checks that `value` is truthy (you covered truthy/falsy in lesson 03) and throws if it isn't. That's useful, but `assert` also exposes more specific methods that produce far more useful error messages when something fails — and a useful error message is the entire point of a testing tool. The one you will use constantly is `assert.strictEqual`:

```javascript
assert.strictEqual(1 + 1, 2); // passes silently
assert.strictEqual(1 + 1, 3);
// throws:
// AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
// 2 !== 3
```

`assert.strictEqual(actual, expected)` compares its two arguments with `===` — the same strict equality from lesson 03 — and, when they don't match, throws an error that tells you exactly what it got and what it wanted. That is dramatically more useful for finding a bug than a bare `assert(actual === expected)`, which only tells you that *something* didn't match, not what. A handful of other `assert` methods come up often enough to know now:

```javascript
assert.deepStrictEqual({ a: 1 }, { a: 1 });   // passes — same shape and values
assert.ok(someValue);                          // same as assert(someValue) — truthy check
assert.throws(() => riskyFunction());          // passes only if riskyFunction() throws
```

`assert.strictEqual` compares primitive values — numbers, strings, booleans. `assert.deepStrictEqual` is for objects and arrays: it checks that every key and value inside them match, not just that they're the same object in memory. You'll need `deepStrictEqual` any time you're comparing the kind of structured data you modeled in lesson 06.

## The shape of a check: arrange, act, assert

Nearly every automated check you'll ever write, in any language or tool, follows the same three-part shape:

1. **Arrange** — set up the input and the known-correct expected result.
2. **Act** — call the function under test with that input.
3. **Assert** — compare what it actually returned to what you expected.

```javascript
const assert = require("assert");

function square(number) {
  return number * number;
}

// Arrange
const input = 4;
const expected = 16;

// Act
const actual = square(input);

// Assert
assert.strictEqual(actual, expected);

console.log("square(4) passed");
```

Notice this only works cleanly because `square` is a pure function, exactly the kind you practiced writing in lesson 05: give it `4`, it always returns `16`, with nothing else to set up and nothing else to check. This is the payoff for every "keep it pure" habit from that lesson — a pure function drops straight into the arrange/act/assert shape with no extra scaffolding.

## Writing several checks and reporting the result

A single assertion tells you one thing passed. A useful script runs several and tells you the total — which is a loop over a list of cases, exactly the accumulator pattern from lesson 04, combined with the try/catch you'll use below to keep one failure from stopping the rest:

```javascript
const assert = require("assert");

function square(number) {
  return number * number;
}

const cases = [
  { input: 2, expected: 4 },
  { input: 0, expected: 0 },
  { input: -3, expected: 9 },
];

let passed = 0;
let failed = 0;

for (const testCase of cases) {
  const actual = square(testCase.input);
  try {
    assert.strictEqual(actual, testCase.expected);
    passed = passed + 1;
  } catch (error) {
    failed = failed + 1;
    console.log(`FAILED: square(${testCase.input}) — ${error.message}`);
  }
}

console.log(`${passed} passed, ${failed} failed`);
```

`try { ... } catch (error) { ... }` runs the code in the `try` block, and if anything inside it throws — including an `AssertionError` — control jumps into the `catch` block instead of crashing the whole script. That's what lets this loop check every case in `cases` and report on all of them, rather than stopping dead at the first failure. `cases` itself is exactly the "array of objects with a consistent shape" pattern from lesson 06 — each case is `{ input, expected }`, and the loop treats every entry identically because the shape is predictable.

## Checking another program's behavior, not just a bare function

So far every example has asserted against a function defined in the same file. The real target of this lesson's objective — "checks another program's behaviour" — is a script that verifies code living somewhere else. Suppose you have a small utility file, `stringUtils.js`, that someone else on your team wrote:

```javascript
// stringUtils.js
function slugify(text) {
  return text.trim().toLowerCase().replace(/\s+/g, "-");
}

module.exports = { slugify };
```

`module.exports` is how a Node file makes something available to be imported elsewhere — you're marking `slugify` as this file's public output. A separate assertion script imports it with `require` and checks it the same way you checked `square`:

```javascript
// check-string-utils.js
const assert = require("assert");
const { slugify } = require("./stringUtils.js");

const cases = [
  { input: "Hello World", expected: "hello-world" },
  { input: "  Trim   Me  ", expected: "trim---me" },
  { input: "ALREADY-lower", expected: "already-lower" },
];

let passed = 0;
let failed = 0;

for (const testCase of cases) {
  const actual = slugify(testCase.input);
  try {
    assert.strictEqual(actual, testCase.expected);
    passed = passed + 1;
  } catch (error) {
    failed = failed + 1;
    console.log(`FAILED: slugify(${JSON.stringify(testCase.input)}) — ${error.message}`);
  }
}

console.log(`${passed} passed, ${failed} failed`);
```

Run it with `node check-string-utils.js`. This is the whole idea in miniature: `stringUtils.js` is "another program," `check-string-utils.js` is a small piece of test automation you built yourself, and running it is exactly what "installing, maintaining, and using a testing tool" looks like at the smallest possible scale — except here you're both the tool's builder and its user. Look closely at the second test case above before you run it: `"  Trim   Me  "` has multiple internal spaces, and `slugify`'s regex replaces every run of whitespace with a single dash, so trace through what `expected` should actually be by hand before trusting the value written here — that kind of careful, skeptical double-checking of an expected value is itself a core QA habit, not a distraction from it.

If you traced it, you found the problem: `trim()` removes the outer spaces, leaving `"Trim   Me"`, and `/\s+/g` turns the run of three spaces into *one* dash, so `slugify` correctly returns `"trim-me"`. The script reports `2 passed, 1 failed`, and this time the bug is in the **test data**, not in `stringUtils.js`. When a check fails, always ask both questions: is the code wrong, or is my expected value wrong? Fix the case to `expected: "trim-me"` and rerun to see `3 passed, 0 failed`.

## Why this is a tool, not just a script

The distinction matters: a one-off `console.log` check you delete after looking at it is debugging. What you just wrote is a *tool* — it is reusable (run it again anytime `stringUtils.js` changes), it is self-reporting (it tells you pass/fail counts without you reading through log lines), and it is built from cases that are easy to add to (append another `{ input, expected }` object and it's covered). That combination — reusable, self-reporting, easy to extend — is what separates a real piece of test automation from a scratch script, and it's exactly what D3-S1-C06 means by designing or developing an automated testing tool.

## Practice

This is the course's capstone exercise — budget real time for it.

1. Create `mathUtils.js` exporting two pure functions via `module.exports`: `clamp(value, min, max)` (returns `value`, but pulled inside the `[min, max]` range if it falls outside it) and `isInRange(value, min, max)` (returns a boolean). Reuse the decomposition habits from lesson 05: keep each function doing exactly one job.
2. Create `check-math-utils.js` that `require`s `assert` and your `mathUtils.js`. Build a `cases` array of at least four objects for `clamp` (include a case where the value is already inside the range, one below `min`, one above `max`, and one exactly on a boundary) and at least three for `isInRange`. Follow the arrange/act/assert shape and the try/catch reporting loop shown above.
3. Run your script with `node check-math-utils.js` and confirm every case passes. Then deliberately break one function in `mathUtils.js` (for example, make `clamp` return `max` where it should return `min`, or change `isInRange`'s `<=` to `<` so a value exactly on the boundary is rejected; note that swapping `<` for `<=` inside `clamp` would *not* be caught, because when `value === min`, returning `value` and returning `min` produce the same number), rerun the script without changing the checker, and read the failure message it produces. Add a comment in `check-math-utils.js` describing, in your own words, what the failure message told you and how it would have helped you find the bug even if you hadn't just broken it yourself.
4. Fix `mathUtils.js` back to correct and confirm the script reports all cases passing again.
5. Add one more case to `cases` for a boundary condition you have not yet covered (for instance, `clamp` called with `min` and `max` equal to each other). Rerun the script and confirm it passes without needing any change to the checking logic itself — only the data.

## Check your understanding

1. You compare two arrays with `assert.strictEqual([1, 2], [1, 2])` and it fails. Why, and which method should you use?
2. Your checker reports `3 passed, 1 failed`. Name the two places the bug could be.
3. Why does the reporting loop put the assertion inside `try`/`catch`?

*Answers:* (1) `strictEqual` checks that both arguments are the *same* array in memory; these are two different arrays. Use `assert.deepStrictEqual`. (2) In the code under test, or in the case's `expected` value (as with the `slugify` example). (3) So one failing case is recorded and reported instead of crashing the script and hiding the results of every case after it.
