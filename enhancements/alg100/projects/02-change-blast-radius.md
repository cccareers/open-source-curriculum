---
course_id: alg100
project_id: alg100-x02
title: "Change Blast Radius: Which Tests Should Run?"
kind: supplementary-project
status: draft
hours_estimate: 5
difficulty: stretch
related_lessons:
  - alg100-06
  - alg100-07
objectives:
  - Traverse a tree or graph structure
  - Use complexity and edge-case reasoning to design test data
competency_ids:
  - D3-S1-C02
  - D5-S1-C02
  - D3-S1-C05
  - D3-S1-C06
---

## Scenario

A developer changed `auth.js`. The full suite takes 40 minutes, so your team wants a tool that walks the import graph from lesson 06 in the "imported by" direction and lists every affected module, nearest first, so the regression run can start with the tests most likely to break.

## What you will build / produce

`blast-radius.js` (ES module) exporting:

- `reverseGraph(imports)`: the lesson 06 function, keeping modules that nobody imports (with an empty list).
- `affectedBy(imports, changed)`: a breadth-first walk over the reversed graph returning `[{ module, distance }]`, nearest first, without the changed module itself; `[]` for an unknown module; terminates on cycles; must handle a 50,000-module chain without a stack overflow (so no recursion, and no `queue.shift()`; advance a `head` index as lesson 06 suggests).
- `regressionPlan(imports, changed)`: just the `.test.js` names from `affectedBy`, in the same order.

## Before you start (prerequisites, starter files or data)

- Lessons 06 and 07; Node 18+; a folder with `package.json` containing `{"type": "module"}`.

## Milestones

1. Draw the reversed version of the test graph below on paper; write the expected `affectedBy("auth.js")` result with distances.
2. Implement `reverseGraph` and `affectedBy`; run the suite.
3. Apply the lesson 07 four-step procedure to `affectedBy` and write at least two extra test cases the suite does not have (for example a diamond, or a module that imports the same dependency twice).
4. Implement `regressionPlan`; record the plan for a change to `api.js`.

## Acceptance criteria

- [ ] Distances are shortest-path distances (`app.js` is 1 from `auth.js`, not 2).
- [ ] No module appears twice; the changed module never appears.
- [ ] Cycles terminate; unknown modules return `[]`.
- [ ] The 50,000-module chain finishes in under a second.
- [ ] Two extra learner-written cases, each labelled with the lesson 07 step that produced it.
- [ ] `node --test` passes.

## Automated checks (coding courses) / Evidence checklist (non-coding)

Save as `blast-radius.test.js` and run `node --test`.

```javascript
// Run with: node --test
import { test } from "node:test";
import assert from "node:assert/strict";
import { reverseGraph, affectedBy, regressionPlan } from "./blast-radius.js";

// The lesson 06 graph, extended with test files.
const imports = {
  "app.js": ["auth.js", "router.js"],
  "auth.js": ["api.js"],
  "router.js": ["auth.js"],
  "api.js": [],
  "login.test.js": ["auth.js"],
  "router.test.js": ["router.js"],
  "api.test.js": ["api.js"],
};

test("reverseGraph flips every edge and keeps modules nobody imports", () => {
  const importedBy = reverseGraph(imports);
  assert.deepEqual([...importedBy["auth.js"]].sort(), ["app.js", "login.test.js", "router.js"]);
  assert.deepEqual(importedBy["app.js"], []);
  assert.deepEqual(importedBy["login.test.js"], []);
});

test("affectedBy lists everything downstream of auth.js, nearest first", () => {
  const result = affectedBy(imports, "auth.js");
  const names = result.map((r) => r.module);
  assert.deepEqual([...names].sort(), ["app.js", "login.test.js", "router.js", "router.test.js"]);
  const distance = Object.fromEntries(result.map((r) => [r.module, r.distance]));
  assert.equal(distance["router.js"], 1);
  assert.equal(distance["login.test.js"], 1);
  assert.equal(distance["app.js"], 1); // app.js imports auth.js directly, so 1, not 2
  assert.equal(distance["router.test.js"], 2);
  // breadth-first: no entry may appear after an entry with a larger distance
  for (let i = 1; i < result.length; i++) assert.ok(result[i - 1].distance <= result[i].distance);
});

test("the changed module itself is not in its own blast radius", () => {
  assert.ok(!affectedBy(imports, "api.js").some((r) => r.module === "api.js"));
});

test("regressionPlan keeps only affected tests in breadth-first order", () => {
  assert.deepEqual(regressionPlan(imports, "auth.js"), ["login.test.js", "router.test.js"]);
  assert.deepEqual(regressionPlan(imports, "app.js"), []);
  assert.deepEqual(regressionPlan(imports, "does-not-exist.js"), []);
});

test("a leaf nobody imports has an empty blast radius", () => {
  assert.deepEqual(affectedBy(imports, "app.js"), []);
});

test("an unknown module returns an empty list instead of throwing", () => {
  assert.deepEqual(affectedBy(imports, "does-not-exist.js"), []);
});

test("a cycle terminates and reports each module once", () => {
  const cyclic = { "a.js": ["b.js"], "b.js": ["a.js"], "c.js": ["a.js"] };
  const names = affectedBy(cyclic, "a.js").map((r) => r.module).sort();
  assert.deepEqual(names, ["b.js", "c.js"]);
});

test("a 50,000-module import chain finishes quickly without a stack overflow", () => {
  const chain = {};
  const N = 50_000;
  for (let i = 0; i < N; i++) chain[`m${i}.js`] = i === 0 ? [] : [`m${i - 1}.js`];
  const start = performance.now();
  const result = affectedBy(chain, "m0.js");
  const ms = performance.now() - start;
  assert.equal(result.length, N - 1);
  assert.equal(result.at(-1).distance, N - 1);
  assert.ok(ms < 1000, `took ${ms.toFixed(0)} ms`);
});
```

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Traversal | Depth-first or recursive; fails the chain test | Breadth-first with a `seen` set and head index | Explains why BFS gives shortest distances and DFS does not |
| Edge cases | Cycle or unknown module crashes | All provided edge cases pass | Extra cases found via the four-step procedure |
| Complexity reasoning | None | Notes that each module and edge is visited once | Predicts and measures run time for 10x and 100x graph sizes |

## Stretch goals

- Read real imports from a small project by scanning files for `import ... from "./x.js"` lines.
- Return the path (chain of modules) explaining *why* each test is affected.

## Reflection prompts

- What would the plan miss if your graph only recorded static imports and the app also loads modules dynamically?
- Why is "nearest first" a sensible ordering for a regression run with limited time?

## Instructor notes (common pitfalls, how to adapt for time)

- Pitfalls: walking the `imports` graph forward (gives dependencies, not dependents); marking nodes seen when dequeued instead of when enqueued (duplicates and wrong distances); recursion overflowing on the chain test.
- Short on time: drop `regressionPlan` and the 50,000-module test.
