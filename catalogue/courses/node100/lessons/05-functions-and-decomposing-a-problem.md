---
lesson_id: node100-05
course_id: node100
pathway: quality-assurance-software-engineer
title: Functions and Decomposing a Problem
order: 5
kind: lesson
competency_ids:
  - D5-S1-C02
objectives:
  - Break a larger problem into small, independently testable functions
---

## The unit a test targets

Every lesson so far has been building toward this one idea: a function is not just a way to avoid retyping code, it is the boundary that a test checks. When you write an assertion in lesson 07, you will be asserting against a function's return value — not against a whole program, not against a screen full of `console.log` output, but against one function, given known inputs, producing a known output. That only works if the functions you write are small enough, and self-contained enough, to reason about in isolation. This lesson is about building that habit before you need it.

## Declaring and calling a function

A function groups a set of statements under a name, optionally accepts inputs (parameters), and optionally produces an output (a return value):

```javascript
function square(number) {
  return number * number;
}

const result = square(4);
console.log(result); // 16
```

`number` is a **parameter** — a variable that only exists inside the function, holding whatever value is passed in when the function is **called**. `square(4)` is a **call**: it runs the function's body with `number` bound to `4`. `return` hands a value back to whoever called the function and immediately ends the function — any code after a `return` statement in the same block never runs.

Node also supports arrow function syntax, which you will see constantly in real code:

```javascript
const square = (number) => {
  return number * number;
};

// A single-expression arrow function can skip the braces and `return`:
const cube = (number) => number * number * number;
```

Both forms behave the same way when called. This course uses regular `function` declarations for anything with more than one line in the body, since the explicit `return` keeps the function's output obvious to a reader — and to a test.

## Pure functions: the easiest thing in the world to test

A **pure function** always returns the same output for the same input, and it doesn't read or change anything outside itself — no global variables, no logging, no modifying an object it was handed. `square` above is pure: call it with `4` a hundred times, in any order, mixed with any other calls, and it always returns `16`.

```javascript
// Pure — output depends only on the input
function discountedPrice(price, discountPercent) {
  return price - price * (discountPercent / 100);
}
```

Compare that to a function with a **side effect** — it does something beyond returning a value, such as changing a variable outside itself:

```javascript
let totalRevenue = 0;

// Impure — depends on and changes something outside itself
function recordSale(amount) {
  totalRevenue = totalRevenue + amount;
}
```

`recordSale` is not wrong to write — real programs need to track state somewhere — but it is fundamentally harder to test: to check it, you need to inspect `totalRevenue` before and after, and its result depends on every call that happened before it, not just its own arguments. `discountedPrice`, by contrast, can be checked with a single line: call it, compare the return value to what you expect. Whenever a piece of logic *can* be written as a pure function, write it that way, and push the side effect (saving, logging, printing) to a thin wrapper around it. You will feel exactly why this matters the first time you write an assertion in lesson 07 — pure functions are the ones you can assert against without any setup.

## Decomposing a larger problem

"Decomposing" a problem means splitting one large task into several small functions, each responsible for one piece, that combine to produce the final result. Consider a single tangled function that does everything at once:

```javascript
function processOrder(items) {
  let total = 0;
  for (const item of items) {
    total = total + item.price * item.quantity;
  }
  if (total > 100) {
    total = total - total * 0.1;
  }
  return "Order total: $" + total.toFixed(2);
}
```

This works, but it is doing three separate jobs — summing item costs, applying a discount rule, and formatting a message — and there is no way to check any one of those jobs without running all three. Decomposed into small functions, each with one job:

```javascript
function calculateSubtotal(items) {
  let subtotal = 0;
  for (const item of items) {
    subtotal = subtotal + item.price * item.quantity;
  }
  return subtotal;
}

function applyBulkDiscount(subtotal) {
  const qualifiesForDiscount = subtotal > 100;
  return qualifiesForDiscount ? subtotal - subtotal * 0.1 : subtotal;
}

function formatOrderTotal(total) {
  return "Order total: $" + total.toFixed(2);
}

function processOrder(items) {
  const subtotal = calculateSubtotal(items);
  const total = applyBulkDiscount(subtotal);
  return formatOrderTotal(total);
}
```

Nothing about the final result changed — `processOrder(items)` still returns the same string it did before. What changed is that `calculateSubtotal`, `applyBulkDiscount`, and `formatOrderTotal` can each be called and checked on their own, with no need to construct a full order just to verify that the discount math is right. `processOrder` itself becomes almost too simple to get wrong, because all it does is hand values from one function to the next.

## Naming a function so its job is obvious

A well-decomposed function should be nameable with a verb phrase that fully describes what it does: `calculateSubtotal`, `applyBulkDiscount`, `isEligibleForDiscount`. If you struggle to name a function without using the word "and" (`calculateAndFormatTotal`), that is a sign it is doing two jobs and should be split into two functions. This is not a cosmetic rule — a function's name is the first thing a reader (or a future you, writing a test) uses to guess what to check, and a function that does two things needs its caller to know both to use it correctly.

## Practice

Create a file named `functions.js`:

1. Write a pure function `isEven(number)` that returns `true` if `number` is evenly divisible by `2`, `false` otherwise. Call it with several numbers and log the results.
2. Write a pure function `average(numbers)` that takes an array of numbers and returns their average (sum divided by count). Use a loop and an accumulator from the previous lesson to compute the sum.
3. Take this tangled function and decompose it into at least two smaller, named, pure functions plus a small function that combines them — following the `calculateSubtotal` / `applyBulkDiscount` / `formatOrderTotal` pattern above:

   ```javascript
   function summarizeScores(scores) {
     let sum = 0;
     for (const s of scores) {
       sum = sum + s;
     }
     const avg = sum / scores.length;
     return avg >= 70 ? "Passing average: " + avg : "Failing average: " + avg;
   }
   ```

4. For each function you wrote in steps 1–3, call it at least twice with different inputs and log the results — this is the same "call it, check the output" pattern you'll formalize with real assertions in lesson 07.

## Check your understanding

1. Is `function addTax(price) { return price * 1.08; }` pure? Is `function logTotal(total) { console.log(total); }` pure?
2. A teammate names a function `validateAndSaveUser`. What does the name tell you, and what would you suggest?
3. Why can you check `applyBulkDiscount` without building a full order?

*Answers:* (1) `addTax` is pure; `logTotal` is not, because printing is a side effect. (2) It does two jobs; split it into `validateUser` (pure, easy to assert against) and `saveUser` (the side effect). (3) It takes a number and returns a number, so one call with a known subtotal (for example `200`, expecting `180`) is a complete check.
