---
lesson_id: node100-06
course_id: node100
pathway: quality-assurance-software-engineer
title: "Objects, Arrays, and Modeling Data"
order: 6
kind: lesson
competency_ids:
  - D5-S1-C02
objectives:
  - Model data with objects and arrays
---

## Predictable shapes are what make a check possible

So far you've worked mostly with individual values — a number, a string, a boolean. Real programs, and real test output, deal in structured data: a single test result with a name, a status, and a duration; a whole suite of results as a collection of those. This lesson covers the two structures JavaScript gives you for that — objects and arrays — with a constant emphasis on giving your data a **predictable shape**, because an assertion can only check a value it can reliably find.

## Objects: a labeled bundle of values

An object groups related values under named keys, using curly braces:

```javascript
const testResult = {
  name: "login should reject bad password",
  status: "fail",
  durationMs: 142,
};
```

Read a value off an object with dot notation, and change one with an assignment to that same path:

```javascript
console.log(testResult.name);   // "login should reject bad password"
console.log(testResult.status); // "fail"

testResult.status = "pass";
console.log(testResult.status); // "pass"
```

If you need to read a key whose name is stored in a variable, or a key that isn't a valid identifier, use bracket notation instead:

```javascript
const key = "durationMs";
console.log(testResult[key]); // 142
```

Declare objects you don't intend to reassign with `const` — exactly like lesson 02. `const` does **not** stop you from changing a property (`testResult.status = "pass"` above works fine on a `const`); it only stops you from reassigning `testResult` itself to a completely different object. That distinction — `const` protects the *binding*, not the object's contents — is one you will run into constantly, so it's worth testing for yourself in this lesson's practice.

## Arrays: an ordered list of values

An array holds a sequence of values, in order, accessed by a numeric position starting at `0`:

```javascript
const statuses = ["pass", "fail", "pass", "skip"];

console.log(statuses[0]); // "pass"
console.log(statuses[1]); // "fail"
console.log(statuses.length); // 4
```

You already used arrays with `for...of` in lesson 04. A few methods come up constantly enough to know now:

```javascript
statuses.push("pass");           // adds to the end; returns the new length
const first = statuses.shift();  // removes and returns the first element
const hasFailure = statuses.includes("fail"); // true/false
```

## Arrays of objects: the shape almost all real data takes

Most data you will work with as a QA engineer is neither a bare list of values nor a single object — it's a **list of objects**, each with the same set of keys. A whole test suite's results look like this:

```javascript
const results = [
  { name: "login rejects bad password", status: "fail", durationMs: 142 },
  { name: "login accepts valid password", status: "pass", durationMs: 88 },
  { name: "logout clears session", status: "pass", durationMs: 51 },
];
```

Every object in `results` has exactly the same three keys — `name`, `status`, `durationMs` — even though the values differ. That consistency is the whole point: because the shape is predictable, you can write one loop that works for every entry, and one assertion that works against any entry you pick out.

```javascript
let failureCount = 0;

for (const result of results) {
  if (result.status === "fail") {
    failureCount = failureCount + 1;
  }
}

console.log(failureCount); // 1
```

This combines directly with what you already know: `for...of` from lesson 04, a comparison from lesson 03, and an accumulator declared with `let`. Nothing new is required to work with structured data once the data has a consistent shape — the new skill is designing that shape deliberately.

## Nested structures

Objects can hold arrays, and arrays can hold objects, nested as deep as the data actually needs to go — no deeper:

```javascript
const suite = {
  suiteName: "auth",
  results: [
    { name: "login rejects bad password", status: "fail" },
    { name: "login accepts valid password", status: "pass" },
  ],
};

console.log(suite.suiteName);            // "auth"
console.log(suite.results[0].status);    // "fail"
console.log(suite.results.length);       // 2
```

Read a nested path left to right, the same way you'd describe it out loud: "the suite's results, entry zero, status." Resist the urge to nest data more deeply than the problem requires — a structure with objects inside arrays inside objects inside arrays is hard for a person to trace and hard to write a correct check against. If you find yourself more than two or three levels deep, it's usually a sign the data should be split into smaller, separately-named pieces.

## Designing a shape before you write the code

Before writing a function that produces or consumes structured data, decide the shape on paper (or in a comment) first: what keys will always be present, what type each holds, and whether a value is ever allowed to be missing. Write it as a small example object, the same way the examples in this lesson are written:

```javascript
// Shape: { id: string, status: "pass" | "fail" | "skip", durationMs: number }
```

That comment is not decoration. It is a promise about what every object of this kind will look like, and a promise you (or a teammate) can hold code to later — which is precisely what an assertion checks against once you get to lesson 07.

## Practice

Create a file named `data-modeling.js`:

1. Create a `const` object named `testCase` with keys `name` (a string), `status` (one of `"pass"`, `"fail"`, or `"skip"`), and `durationMs` (a number). Log each property individually with dot notation.
2. Reassign `testCase.status` to a different valid value and log the whole object. Then try (in a separate step, commented out or in a `try`/`catch` you don't need to understand yet — just observe the error message) reassigning `testCase` itself to a plain string, and note in a comment what error `const` produces.
3. Create a `const` array named `suiteResults` containing at least four objects, each with the same shape as `testCase` from step 1. Write a `for...of` loop that counts how many entries have `status === "pass"` and logs the count.
4. Write a pure function `summarize(suiteResults)` that takes an array shaped like step 3 and returns an object `{ total: number, passed: number, failed: number }`. Call it on your `suiteResults` array and log the returned object.
