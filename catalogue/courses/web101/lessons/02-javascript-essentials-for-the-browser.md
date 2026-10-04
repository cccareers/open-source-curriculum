---
lesson_id: web101-02
course_id: web101
pathway: quality-assurance-software-engineer
title: JavaScript Essentials for the Browser
order: 2
kind: lesson
competency_ids:
  - D5-S1-C02
objectives:
  - Use JavaScript variables, functions, and control flow in the browser
---

## Why a tester needs to read and write JavaScript

You are not in this course to become a front-end developer. You are here because every bug report you will ever write about a web page is, underneath, a claim about what some JavaScript did or failed to do. "The button doesn't work" really means "some function attached to that button either didn't run, ran with the wrong value, or threw an error partway through." You cannot describe that precisely, and you cannot write a script that automatically checks it, if you cannot read the code that is running or write a few lines yourself to poke at it. This lesson gives you the vocabulary: variables, functions, and control flow, all inside the browser environment where you will spend the rest of this course.

Open your browser's developer console now (F12 or right-click → Inspect, then the Console tab) and keep it open for the rest of this lesson. Everything here is meant to be typed and watched, not just read.

## Variables: `let`, `const`, and why `var` is a trap

JavaScript gives you three ways to declare a variable, but only two belong in code you write today.

```js
let attempts = 0;
const maxAttempts = 3;
var legacy = "avoid this";
```

`const` declares a binding that cannot be reassigned. Use it by default — it tells the next reader (often a fellow tester six months from now) that this value does not change. `let` declares a binding that can be reassigned, for things like counters. `var` is the original 1995 declaration keyword; it has function-level scope instead of block-level scope, which produces bugs that are genuinely hard to explain to a developer when you're filing a defect. You will still see `var` in old code you're testing — recognize it, but don't write it.

```js
if (true) {
  let blockScoped = "only visible in here";
  var functionScoped = "visible outside this block too";
}
console.log(functionScoped); // works, and that's the problem with var
console.log(blockScoped);    // ReferenceError
```

That `ReferenceError` is not a browser bug. It is JavaScript telling you a name doesn't exist in the current scope, and reading these errors accurately is a skill you'll use constantly once you reach debugging in Lesson 07.

## Data types you'll see in every page you test

JavaScript's primitive types are `string`, `number`, `boolean`, `undefined`, `null`, and (less often) `symbol` and `bigint`. Everything else — arrays, objects, functions, DOM elements — is an `object`.

```js
typeof "pass";        // "string"
typeof 42;             // "number"
typeof true;            // "boolean"
typeof undefined;       // "undefined"
typeof null;            // "object" — a famous, decades-old JavaScript quirk
```

That last line matters for testing: `typeof null === "object"` is a real trap in code you'll review. If a developer writes `if (typeof user === "object")` intending to check "did we get a user record back," `null` will pass that check even though there's no user. Knowing this lets you predict a bug before you even run the page.

JavaScript is also loosely typed — a variable can hold a string and later hold a number — and it performs implicit coercion during comparisons:

```js
"5" == 5;    // true  — coerces types before comparing
"5" === 5;   // false — checks type and value, no coercion
```

Always use `===` and `!==` in code you write. When you see `==` in application code during a review, treat it as worth a second look — it is a common source of "works on this input, breaks on that one" defects.

## Functions: three ways to write one

```js
// Function declaration — hoisted, can be called before its definition appears
function validateEmail(value) {
  return value.includes("@");
}

// Function expression — not hoisted
const validatePassword = function (value) {
  return value.length >= 8;
};

// Arrow function — shorter syntax, no `this` of its own
const validateUsername = (value) => value.trim().length > 0;
```

All three are callable the same way — `validateEmail("a@b.com")` — but they behave differently around hoisting and `this` binding. For this course, the rule that matters is simpler: arrow functions are what you'll write most often for small checks, and function declarations are what you'll most often read in application code, because they're forgiving about where they're defined relative to where they're called.

Functions can take multiple parameters, return early, and be composed:

```js
function isValidPassword(value) {
  if (value.length < 8) {
    return false;
  }
  if (!/[0-9]/.test(value)) {
    return false;
  }
  return true;
}

isValidPassword("short");     // false
isValidPassword("longenough1"); // true
```

Notice the shape: a function is a small, named claim about behavior — "given this input, I return that output." That claim is exactly what a test verifies. Once you can read a function like `isValidPassword`, you can already start listing test cases in your head before anyone asks you to: an 8-character password with no digit, a 7-character password with a digit, an empty string, `null`.

## Control flow: making decisions and repeating work

`if` / `else if` / `else` chooses between branches:

```js
function classify(score) {
  if (score >= 90) {
    return "excellent";
  } else if (score >= 70) {
    return "passing";
  } else {
    return "failing";
  }
}
```

Every branch is a path through the code, and every path is a candidate test case. A function with three branches has at least three inputs worth trying deliberately — this is the seed of the thinking you'll formalize later in the pathway when you learn structured test design, but it starts here, with just reading the branches.

Loops repeat work. The two you'll see constantly:

```js
// for — when you know how many times, or need an index
for (let i = 0; i < 3; i++) {
  console.log(`attempt ${i + 1}`);
}

// for...of — when you're iterating values in an array
const fields = ["email", "password", "username"];
for (const field of fields) {
  console.log(`checking ${field}`);
}
```

Watch for **off-by-one** conditions in loop bounds (`<` versus `<=`) — they are one of the most common defect classes you will find in real code, and they're invisible unless you trace the loop by hand or watch it run in the debugger.

## Arrays and objects, briefly

You will use both constantly once you reach the DOM in the next lesson, so get comfortable with the shape now.

```js
const users = [
  { name: "Ada", active: true },
  { name: "Grace", active: false },
];

const activeNames = users
  .filter((user) => user.active)
  .map((user) => user.name);

console.log(activeNames); // ["Ada"]
```

`.filter()` keeps items matching a condition; `.map()` transforms each item into something new. Both return a new array rather than modifying the original — that immutability is deliberate, and it's a property you'll rely on when you need to reason about whether a piece of code could have side effects that make a page's state hard to predict during a test run.

## Practice

Open your browser console (or a scratch file loaded in a blank HTML page) and complete all three:

1. Write a function `describeAttempt(count, max)` using `const`/`let` (no `var`) that returns `"ok"` if `count` is less than `max`, and `"locked"` otherwise. Call it with at least three different `(count, max)` pairs and confirm the console output matches what you expected before you ran it.
2. Write a loop that iterates the array `["email", "password", "confirmPassword"]` and logs `"field N: <name>"` for each one, where `N` is a 1-based position (not 0-based) — deliberately practice the off-by-one adjustment.
3. In the console, type `typeof null` and `null == undefined`, and write one sentence explaining, in your own words, why each result could mislead a developer reading a conditional check quickly. Save your three sentences (one per exercise) in a plain text file — you'll want the habit of writing down what you observed, not just what you expected, before this course reaches debugging.

## Check your understanding

1. Inside an `if` block you declare `var a = 1;` and `let b = 2;`. Which one can you read after the block closes?
2. Why does `if (typeof user === "object")` not prove that `user` exists?
3. List four inputs you would try against `isValidPassword`, and what each one protects against.

*Answers:* (1) Only `a`; `let` is block-scoped. (2) `typeof null` is also `"object"`, so a missing user passes. (3) For example: `"abcdefg1"` (8 characters with a digit, the boundary that should pass), `"abcdef1"` (7 characters, just below it), `"abcdefgh"` (long enough, no digit), and `""` (empty). `null` is worth trying too: it throws a `TypeError` on `.length`, which is itself a finding.
