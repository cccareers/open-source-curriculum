---
lesson_id: alg100-07
course_id: alg100
pathway: quality-assurance-software-engineer
title: "Complexity, Edge Cases, and Test Data Design"
order: 7
kind: lesson
competency_ids:
  - D3-S1-C05
  - D3-S1-C06
  - D4-S1-C03
objectives:
  - Use complexity and edge-case reasoning to design test data
---

## Bringing the course together

Every earlier lesson quietly built toward this one. You learned to decompose a problem into buckets of behavior (lesson 02), to choose a data structure based on which operations need to be cheap (lesson 03), to compare a search that scans everything against one that halves its work every step (lesson 04), to compare a sort whose cost grows with the square of its input against one that scales far more gently (lesson 05), and to walk a tree or graph to find the node responsible for a failure (lesson 06). This lesson turns all of that into a single, practical habit: before you validate a change, design the test data on purpose, using what you know about the code's cost and its boundaries, rather than picking a few values that happen to occur to you.

## Complexity as a prediction tool

You already know, from lessons 04 and 05, that a linear search's cost grows with the size of its input and a quadratic sort's cost grows with the *square* of its input, while binary search and merge sort grow far more gently. The reason that matters here is that complexity lets you predict, before you run anything, where a performance problem is most likely to show up — which tells you exactly what size of test data is worth generating.

If a function's cost grows linearly, doubling the input roughly doubles the time; testing it at 10x the expected production size will tell you almost everything a 100x test would, because the relationship between size and time is a straight line. If a function's cost grows quadratically — like the `bubbleSort` from lesson 05, or any nested loop that compares every item to every other item — doubling the input roughly quadruples the time, and the gap between "works fine in the demo" and "times out in production" can appear surprisingly close to a size nobody thought to test. Reading a function and recognizing a nested loop over the same collection, or a search that isn't exploiting sorted order when it could be, is how you decide a performance test is even necessary, and roughly what input size will actually expose the cost rather than hiding inside noise.

```javascript
// A defect-matching function that compares every new defect
// against every existing one to flag likely duplicates.
function findLikelyDuplicates(newDefect, existingDefects) {
  const matches = [];
  for (const existing of existingDefects) {
    if (isSimilar(newDefect, existing)) {
      matches.push(existing);
    }
  }
  return matches;
}
```

Called once per new defect, this function's cost is proportional to the size of `existingDefects` — fine at a hundred records, and still probably fine at a thousand. But if it's called once for *every* defect while re-scanning the whole growing database — the pattern you'd get from running it across an entire import — the total cost becomes quadratic in the number of defects, and that's the shape of test data a risk-based test plan should specifically target: not "does it work with 10 defects," which it trivially will, but "does it stay responsive with the defect count this database will actually reach in a year."

## Edge-case reasoning: from boundaries to a test plan

Lessons 02 and 04 already introduced the two habits this section names formally. Decomposing a problem sorts its inputs into buckets — equivalence classes — and every seam between buckets is a candidate edge case. Tracing binary search's `low`, `mid`, and `high` pointers by hand showed that an algorithm's own internal boundary conditions are frequently where its bugs live, which is exactly where boundary-value analysis should aim.

Put together, edge-case reasoning for any function you're about to test is a short, repeatable procedure:

1. **Decompose the function** into the buckets of behavior it distinguishes (as in lesson 02) — what makes it do one thing versus another.
2. **Find every boundary** between adjacent buckets — the exact value where behavior flips.
3. **Find the structural edges of the input itself** — empty, one element, the largest size you'll realistically see, `null` or `undefined` where a value is expected, duplicate values where uniqueness was assumed.
4. **Find the size where complexity predicts trouble** — from the previous section, the input size where a quadratic or worse cost starts to matter.

Applied to `letterGrade` from lesson 02's practice: the buckets are the four grade bands, the boundaries are 90, 80, and 70 exactly, and the structural edges are a score of 0, a score of 100, and — worth asking explicitly — what should happen with a score below 0 or above 100, which the original decomposition never addressed. That last question, arriving out of edge-case reasoning rather than from the original requirement, is itself a legitimate output of this process: a gap worth raising before the change ships, not a gap to quietly ignore.

## Designing test data on purpose

"Test data design" means writing down the inputs your edge-case reasoning identified, before you run anything, as a deliberate small dataset rather than whatever happens to be lying around. For a function that validates an order before checkout, a purposefully designed dataset — built from the four-step procedure above — might look like this:

```javascript
const orderValidationTestCases = [
  { name: "typical valid order", order: { items: [{ price: 10 }], total: 10 }, expectValid: true },
  { name: "empty items array", order: { items: [], total: 0 }, expectValid: false },
  { name: "total is exactly zero with items present", order: { items: [{ price: 0 }], total: 0 }, expectValid: true },
  { name: "total is negative", order: { items: [{ price: -5 }], total: -5 }, expectValid: false },
  { name: "items is missing entirely", order: { total: 10 }, expectValid: false },
  { name: "very large order, 10,000 items", order: { items: Array(10000).fill({ price: 1 }), total: 10000 }, expectValid: true },
];
```

Notice this list wasn't guessed at. "Empty items array" and "items missing entirely" come from asking what the structural edges of the input are. "Total is exactly zero" and "total is negative" come from finding the boundary in a bucket ("valid totals" versus "invalid totals") the same way 90, 80, and 70 bounded grade letters. "Very large order" comes from complexity reasoning — if the validation function loops over every item, ten thousand items is where a hidden quadratic cost would start to show. Each row earns its place in the dataset by answering "which step of the edge-case procedure put this here," which is what separates deliberate test data from a handful of values a developer typed in without thinking about why.

## Building a small automated test utility

Once test data is designed, running it by hand every time is exactly the kind of repetitive, error-prone task worth automating — which is its own competency, not just a convenience. A small utility that runs a list of cases against a function and reports which passed doesn't need a testing framework to be useful:

```javascript
function runCases(fn, cases) {
  const results = cases.map((testCase) => {
    const actual = fn(testCase.order);
    const passed = actual === testCase.expectValid;
    return { name: testCase.name, passed, actual, expected: testCase.expectValid };
  });

  const failed = results.filter((r) => !r.passed);
  console.log(`${results.length - failed.length}/${results.length} passed`);
  for (const failure of failed) {
    console.log(`FAILED: ${failure.name} — expected ${failure.expected}, got ${failure.actual}`);
  }
  return failed.length === 0;
}

runCases(isValidOrder, orderValidationTestCases);
```

This is a small automated testing tool in the fullest sense the term deserves: it takes structured test data (the direct product of the previous section), runs it against a function under test, and reports discrepancies without a human re-checking each case by eye. The value isn't the twenty lines of code — it's that the same `runCases` utility works against any function and any dataset you design the same way, which means the effort you put into deliberate test data design pays off every time the function changes, not just once.

## Maintaining a database of known defects

Test data design has a second, quieter source beyond decomposition and boundaries: history. Every defect a project has actually shipped is evidence of an edge case someone's reasoning missed the first time, which makes a maintained defect record one of the most valuable inputs into future test data — not just a log of what went wrong, but a growing library of the specific inputs that have already proven capable of breaking something.

```javascript
const knownDefects = [
  {
    id: "DEF-101",
    summary: "Order total shows negative when a discount exceeds the subtotal",
    reproInput: { items: [{ price: 5 }], discount: 10 },
    fixedInVersion: "2.3.1",
  },
  {
    id: "DEF-104",
    summary: "Duplicate detection missed a match when defect text differed only by whitespace",
    reproInput: { newDefect: "login  broken", existing: "login broken" },
    fixedInVersion: "2.4.0",
  },
];

function regressionCasesFromDefects(defects) {
  return defects.map((d) => ({
    name: `regression: ${d.id} — ${d.summary}`,
    input: d.reproInput,
  }));
}
```

Structuring the defect database this way — with each entry's original repro input kept, not just a prose description — turns "maintain a database of known defects" from record-keeping into an active source of test cases: every future run can replay every historical `reproInput` and confirm the bug hasn't quietly resurfaced. This is the same discipline as designing test data from first principles, applied retroactively to inputs that are already known to be dangerous rather than merely suspected of it.

## Validating a change before it ships

All of this converges on a single moment: a change is about to go out, and you need to decide whether it's safe. That decision is what regression and smoke testing exist for, and both are strengthened directly by everything above. A **smoke test** is a small, fast set of cases confirming the basics still work at all — typically the "typical valid" row from a deliberately designed dataset, run first because there's no point checking edge cases if the ordinary path is broken. A **regression test** is the fuller set: every deliberately designed edge case from the current change, plus every replayed case from the known-defect database, run together so a change can't quietly reopen an old bug while fixing a new one.

```javascript
function validateChange(fn, { smokeCases, edgeCases, knownDefects }) {
  console.log("Smoke test:");
  const smokeOk = runCases(fn, smokeCases);
  if (!smokeOk) {
    console.log("Smoke test failed — stopping before full regression.");
    return false;
  }

  console.log("Full regression (edge cases + known defects):");
  const regressionCases = [...edgeCases, ...regressionCasesFromDefects(knownDefects)];
  return runCases(fn, regressionCases);
}
```

The sequencing here is deliberate and mirrors how you'd triage in practice: fail fast on the smoke test rather than burning time on a full regression run against code that's obviously broken, and only once the basics pass, spend the effort on the deliberately designed edge cases and the replayed history of everything that has broken before. This is the complete loop the course has been building toward — complexity tells you what size of data to worry about, edge-case reasoning tells you which specific values to worry about, the defect database tells you which values have already proven dangerous, and a small automated utility runs all of it before a change is allowed to ship.

## Practice

This is an extended, multi-part exercise. Use the `isValidOrder` function below (a stand-in for any function you're validating) throughout.

```javascript
function isValidOrder(order) {
  if (!order || !Array.isArray(order.items)) return false;
  if (order.items.length === 0) return false;
  const sum = order.items.reduce((total, item) => total + item.price, 0);
  return sum === order.total && sum >= 0;
}
```

1. **Complexity read:** Read `isValidOrder` and identify its cost in terms of the number of items in the order. Is it constant, linear, or worse? Explain in one or two sentences what input size would be worth using in a performance test, and why.
2. **Edge-case reasoning:** Apply the four-step procedure from this lesson to `isValidOrder` — buckets, boundaries between buckets, structural edges of the input, and any size worth testing from your complexity read. Write out at least eight distinct test cases as a JavaScript array in the same shape as `orderValidationTestCases`, each with a short `name` explaining which step of the procedure produced it.
3. **Automated utility:** Run your test-case array through the `runCases` function from this lesson (or your own version of it) against `isValidOrder`, and paste the pass/fail output. If anything fails, decide whether the failure reveals a bug in `isValidOrder` or a mistake in your expected value, and fix whichever is wrong.
4. **Defect database:** Invent two plausible historical defects for a function like `isValidOrder` (for example, floating-point rounding causing `sum === order.total` to fail when it shouldn't), and record them in the `knownDefects` shape from this lesson, including a concrete `reproInput` for each.
5. **Validate a change:** Write a `smokeCases` array (one or two obviously-valid orders), then call `validateChange(isValidOrder, { smokeCases, edgeCases: <your array from step 2>, knownDefects: <your array from step 4> })` and report whether the change would be considered safe to ship, based on the output.
