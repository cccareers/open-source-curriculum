---
lesson_id: node100-04
course_id: node100
pathway: quality-assurance-software-engineer
title: Loops and Iteration
order: 4
kind: lesson
competency_ids:
  - D5-S1-C02
objectives:
  - Repeat work with the looping constructs Node provides
---

## Why loops matter to a QA engineer specifically

A huge share of the tooling you will eventually build runs the same check against many things: every line of a log file, every row of a CSV, every test case in a suite. That is a loop. Learning to write loops cleanly now — with a clear stopping condition and a clear, single job per iteration — is directly the skill you will use later to write a script that walks through a hundred test results and reports which ones failed.

## `for` loops: when you know how many times

The classic `for` loop has three parts, separated by semicolons: a starting point, a condition checked before each pass, and an update run after each pass.

```javascript
for (let i = 0; i < 5; i = i + 1) {
  console.log(i);
}
// prints 0, 1, 2, 3, 4
```

Read it left to right: `let i = 0` runs once, before anything else. `i < 5` is checked before *every* pass — the loop body only runs when it is `true`. `i = i + 1` runs after every pass. Because `i` was declared with `let` inside the loop's own parentheses, it is scoped to the loop — it does not exist before it and does not leak out after it, the same block-scope guarantee you saw with `let` and `const` in lesson 02.

`for` is the right tool when you know in advance roughly how many times you need to repeat something, or when you need direct access to a numeric index — for example, to compare an item at position `i` with the item before it.

## `while` loops: when you don't know how many times

A `while` loop checks its condition before each pass and keeps going as long as that condition is `true`. Use it when the number of repetitions depends on something that can only be determined while the loop is running:

```javascript
let attempts = 0;
let succeeded = false;

while (attempts < 3 && !succeeded) {
  succeeded = tryConnect();
  attempts = attempts + 1;
}
```

Every `while` loop needs something inside its body that eventually makes the condition `false` — here, `attempts` increasing toward `3`, or `succeeded` becoming `true`. Forgetting that update is the single most common way to write an infinite loop. Before you run any `while` loop you write, trace through it by hand for two or three iterations and confirm the condition is actually moving toward `false`.

## `for...of`: looping over the values in a collection

When you have an array and want each value in turn, `for...of` is clearer than manually tracking an index:

```javascript
const statuses = ["pass", "pass", "fail", "pass"];

for (const status of statuses) {
  console.log(status);
}
```

`for...of` gives you the *value* at each position, not the index. If you find yourself writing `array[i]` inside a `for` loop just to read each element in order, that is a signal to switch to `for...of` instead — it says exactly what you mean ("for each value in this collection") with less room for an off-by-one mistake in the index arithmetic.

## Accumulating a result across a loop

A very common loop shape builds up a single result — a total, a count, a filtered list — one iteration at a time. Declare the accumulator with `let` *before* the loop, so it survives across every pass:

```javascript
const responseCodes = [200, 404, 200, 500, 200];

let failureCount = 0;

for (const code of responseCodes) {
  if (code >= 400) {
    failureCount = failureCount + 1;
  }
}

console.log(failureCount); // 3
```

Notice the shape: `failureCount` starts at a known value (`0`), each iteration either changes it or doesn't according to a clear condition, and after the loop ends it holds a single, checkable answer. That is the exact shape of code you will write dozens of times once you are scanning real test output — "how many of these failed," "which of these are missing a required field," "what's the average response time." Get comfortable with it now, with small arrays you can trace by hand.

## Breaking out early

Sometimes you want to stop a loop as soon as you find what you are looking for, rather than needlessly checking everything else. `break` exits the loop immediately:

```javascript
const ids = ["a1", "b2", "c3", "d4"];
let found = null;

for (const id of ids) {
  if (id === "c3") {
    found = id;
    break;
  }
}

console.log(found); // "c3"
```

Use `break` when continuing to loop after you already have your answer would be wasted work. Reach for it deliberately, not as a substitute for a well-formed condition — a loop that needs three or four `break` statements scattered through it is usually a sign the logic should be restructured, not that you need more exits.

## A caution: don't modify an array while looping over it with `for...of`

Adding or removing elements from an array while a `for...of` loop is iterating over it produces confusing, hard-to-predict behavior — exactly the kind of thing that is nearly impossible to write a reliable check against. If you need to build a *new* filtered or transformed collection, accumulate it into a separate array instead of mutating the one you are looping over:

```javascript
const numbers = [1, 2, 3, 4, 5, 6];
const evens = [];

for (const n of numbers) {
  if (n % 2 === 0) {
    evens.push(n);
  }
}

console.log(evens); // [2, 4, 6]
console.log(numbers); // [1, 2, 3, 4, 5, 6] — unchanged
```

Leaving the original `numbers` array untouched means anyone reading this code — or testing it — can trust that the input didn't quietly change shape partway through.

## Practice

Create a file named `loops.js`:

1. Write a `for` loop that logs every number from `1` to `10` that is divisible by `3` (use the remainder operator `%`: `n % 3 === 0`).
2. Given `const words = ["pass", "fail", "pass", "skip", "fail", "pass"];`, use a `for...of` loop and an accumulator to count how many entries equal `"fail"`. Log the final count.
3. Write a `while` loop that starts a `let total = 0;` and a `let n = 1;`, and adds `n` to `total`, incrementing `n` each pass, stopping as soon as `total` is greater than `50`. Log the final `total` and the final `n`.
4. Given `const ids = ["x1", "x2", "x3", "x4", "x5"];`, write a `for...of` loop that uses `break` to stop as soon as it finds `"x3"`, storing the found value in a variable declared before the loop. Log the variable after the loop and confirm it holds `"x3"`, not the full array.

## Check your understanding

1. You need to read every value in an array and you never use the index. Which loop do you reach for?
2. A `while` loop never ends. What is the first thing you check?
3. Trace this by hand: `const codes = [200, 500, 404]; let failures = 0; for (const c of codes) { if (c >= 400) { failures = failures + 1; } }`. What is `failures` after each pass?

*Answers:* (1) `for...of`. (2) Whether anything inside the body moves the condition toward `false` (a counter that never increments, a flag that never flips). (3) `0`, then `1`, then `2`.
