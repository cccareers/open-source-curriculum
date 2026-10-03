---
lesson_id: node100-03
course_id: node100
pathway: quality-assurance-software-engineer
title: Conditional Logic and Boolean Expressions
order: 3
kind: lesson
competency_ids:
  - D5-S1-C02
objectives:
  - Express decisions with conditional operators and boolean logic
---

## Decisions are the thing you will spend your career checking

A conditional statement is a program deciding between two or more paths based on a condition. As a QA engineer, conditionals are going to be your constant subject: nearly every bug report you will ever write boils down to "this condition should have been true, and it wasn't" or "this branch should never have run, and it did." Before you can find those bugs in someone else's code, you need to be fluent in writing conditions that say exactly what you mean — because vague conditions are exactly what produce the bugs you will spend your career hunting.

## Booleans and comparison operators

A boolean is a value that is either `true` or `false`, nothing else. You produce booleans with comparison operators:

```javascript
5 > 3        // true
5 < 3        // false
5 === 5      // true
5 !== 4      // true
```

Always use `===` and `!==` (strict equality) rather than `==` and `!=`. The loose operators (`==`, `!=`) try to convert mismatched types before comparing, which produces results that surprise most people the first time they see them:

```javascript
0 == false          // true  — surprising
"" == false         // true  — surprising
0 === false         // false — no surprise, different types
```

A test that relies on loose equality is a test that can pass or fail for the wrong reason. Strict equality removes that ambiguity entirely: it only returns `true` when both the value and the type match, which is exactly the guarantee a testable condition needs.

## Combining conditions: `&&`, `||`, and `!`

Real decisions are rarely a single comparison. You combine them with three logical operators:

- `&&` (AND) — true only when **both** sides are true
- `||` (OR) — true when **at least one** side is true
- `!` (NOT) — flips a boolean

```javascript
const age = 20;
const hasId = true;

const canEnter = age >= 18 && hasId;   // true
const needsReview = age < 18 || !hasId; // false
```

Write compound conditions so a reader can tell what they mean without running them in their head twice. Naming the boolean, rather than inlining a long expression directly into an `if`, is one of the cheapest habits you can build:

```javascript
// Harder to verify by reading
if (age >= 18 && hasId && !isBanned) {
  admit();
}

// Named, and now individually checkable
const isAdult = age >= 18;
const isVerified = hasId;
const isAllowed = isAdult && isVerified && !isBanned;

if (isAllowed) {
  admit();
}
```

The second version is not just easier to read — it is easier to *test*. If you were writing a check against this logic, you could assert on `isAdult`, `isVerified`, and `isAllowed` independently instead of having to reverse-engineer a single tangled expression.

## `if`, `else if`, and `else`

An `if` statement runs a block only when its condition is `true`. Chain further checks with `else if`, and catch everything else with a final `else`:

```javascript
function classifyScore(score) {
  if (score >= 90) {
    return "A";
  } else if (score >= 80) {
    return "B";
  } else if (score >= 70) {
    return "C";
  } else {
    return "F";
  }
}

console.log(classifyScore(85)); // "B"
```

Notice that `classifyScore` always returns a value on every path — there is no way to call it and get nothing back. That is deliberate, and it is a habit worth adopting immediately: a function with a "missing" branch, where some input falls through without hitting any `return`, is one of the most common sources of an `undefined` value sneaking into the rest of a program. When you (or someone else) later write an assertion against `classifyScore`, every possible input has a defined, checkable output.

## The ternary operator, used sparingly

For a simple two-way choice that produces a value, the ternary operator (`condition ? valueIfTrue : valueIfFalse`) is more compact than a full `if`/`else`:

```javascript
const status = itemCount > 0 ? "in stock" : "out of stock";
```

Reserve it for short, single-condition decisions. Nesting ternaries inside one another (`a ? b : c ? d : e`) trades a small amount of typing for a large amount of confusion, and confusing code is exactly what makes writing a correct check against it harder than it needs to be. If a decision needs more than one condition, write it as a normal `if`/`else if`/`else`.

## Truthy and falsy values

Any value can be used where a boolean is expected — JavaScript will convert it. Six values you will meet constantly convert to `false` ("falsy"): `false`, `0`, `""` (empty string), `null`, `undefined`, and `NaN`. (Two rarer ones, `-0` and the BigInt zero `0n`, are falsy too; you are unlikely to see them in this course.) Every other value, including `"0"` (a string containing the character zero) and `[]` (an empty array), converts to `true` ("truthy").

```javascript
if (userName) {
  console.log(`Hello, ${userName}`);
} else {
  console.log("No name provided");
}
```

This is convenient, but it is also a place where sloppy conditions hide real bugs. `if (itemCount)` looks like it means "if there are items," but it is actually "if `itemCount` is not `0`, not `""`, not `null`, and not `undefined`" — and if `itemCount` could legitimately be the number `0` as a valid, meaningful value, that shortcut silently treats a valid zero the same as a missing value. When a value's exact type and meaning matters — which, as a QA engineer, it usually does — write the explicit comparison instead:

```javascript
if (itemCount !== null && itemCount !== undefined) {
  // itemCount is meaningfully present, even if it's 0
}
```

Explicit conditions are slightly more typing and dramatically easier to verify.

## Practice

Create a file named `conditions.js`:

1. Write a function `describeTemperature(celsius)` that returns `"freezing"` if `celsius <= 0`, `"cold"` if `celsius` is between 1 and 14 inclusive, `"mild"` if between 15 and 24 inclusive, and `"hot"` otherwise. Use `if`/`else if`/`else` so every input produces a return value — no falling through with nothing returned.
2. Write a function `canCheckout(cartItemCount, hasPaymentMethod)` that returns a boolean: `true` only when `cartItemCount` is strictly greater than `0` **and** `hasPaymentMethod` is `true`. Store the two conditions in separately named boolean variables before combining them with `&&`.
3. Call both functions several times with `console.log`, choosing inputs that exercise every branch of `describeTemperature` (including the exact boundary values `0`, `14`, `15`, and `24`) and both outcomes of `canCheckout`.
4. Write one line using `===` and one line using `==` comparing `"5"` and `5`. Log both results and add a comment explaining, in your own words, why they differ.

## Check your understanding

1. What do `"5" == 5` and `"5" === 5` evaluate to, and which one belongs in a test?
2. `itemCount` is `0`, a valid value meaning "the cart is empty." What does `if (itemCount)` do with it, and what should you write instead?
3. Which boundary values would you pick to check `describeTemperature` from the practice, and why those?

*Answers:* (1) `true` and `false`; use `===`, because it never converts types behind your back. (2) It treats `0` as falsy and takes the "missing" path; write `itemCount !== null && itemCount !== undefined`. (3) `0`, `1`, `14`, `15`, `24`, and `25`: each sits on either side of a point where the answer changes, which is exactly where off-by-one bugs live.
