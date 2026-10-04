---
course_id: alg100
project_id: alg100-x01
title: "Defect Store and Numeric ID Search"
kind: supplementary-project
status: draft
hours_estimate: 6
difficulty: core
related_lessons:
  - alg100-03
  - alg100-04
  - alg100-05
objectives:
  - Choose a data structure that fits the data you are holding
  - Implement and compare linear and binary search
competency_ids:
  - D3-S1-C05
  - D5-S1-C02
---

## Scenario

The test-run tool from lesson 03 needs its in-memory defect store packaged as a module, and the tracker has just passed `DEF-1000`. Lesson 04 warned that alphabetical comparison breaks binary search once ids vary in length; your lead wants a search that is correct for any `DEF-<number>` id, with numbers to prove binary search is worth it.

## What you will build / produce

`defect-store.js` (an ES module) exporting:

- `createDefectStore()` returning an object with `fileDefect(id, details)` (returns `true` when stored, `false` for a duplicate, and never overwrites), `getDefect(id)`, `hasDefect(id)`, `listInOrder()` (filing order, returned as a copy), and `count()`. Use the array + `Set` + `Map` combination from lesson 03.
- `compareDefectIds(a, b)`: negative, zero, or positive by the *numeric* part; throws a `TypeError` for anything not shaped `DEF-<digits>`.
- `linearSearchIds(ids, target)` and `binarySearchIds(sortedIds, target)`, each returning `{ index, comparisons }` (`index` is `-1` when absent; `comparisons` counts how many ids were compared with the target).

## Before you start (prerequisites, starter files or data)

- Lessons 03 to 05; Node 18+.
- Create a folder with `package.json` containing `{"type": "module"}` so `import`/`export` work, plus `defect-store.js` and `defect-store.test.js`.

## Milestones

1. Write a comment listing the store's operations and which structure makes each cheap (lesson 03 habit).
2. Implement the store; run only the first three tests (`node --test --test-name-pattern="fileDefect|listInOrder|unknown"`).
3. Implement `compareDefectIds`. Before coding, write down what `"DEF-99" < "DEF-101"` returns and why.
4. Implement both searches with comparison counters. Binary search must use `compareDefectIds`, not `<`.
5. Run the full suite. Then write one paragraph: comparisons for an absent id on 1,000 ids, linear vs binary, and what that means for a tool that checks 5,000 ids per run.

## Acceptance criteria

- [ ] `fileDefect` rejects duplicates without overwriting the original details.
- [ ] Changing the array returned by `listInOrder()` does not change the store.
- [ ] `["DEF-1000", "DEF-99", "DEF-101"].sort(compareDefectIds)` gives `["DEF-99", "DEF-101", "DEF-1000"]`.
- [ ] Binary search passes all seven lesson 04 boundary cases (first, last, middle, below all, above all, empty, one element) plus a gap in the middle.
- [ ] Binary search needs at most 10 comparisons on 1,000 ids; linear needs 1,000 for an absent id.
- [ ] `node --test` passes.

## Automated checks (coding courses) / Evidence checklist (non-coding)

Save as `defect-store.test.js` and run `node --test` in the folder.

```javascript
// Run with: node --test
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createDefectStore,
  compareDefectIds,
  linearSearchIds,
  binarySearchIds,
} from "./defect-store.js";

test("fileDefect stores a new defect and refuses a duplicate id", () => {
  const store = createDefectStore();
  assert.equal(store.fileDefect("DEF-101", { severity: "high", status: "open", build: "4.2.0" }), true);
  assert.equal(store.fileDefect("DEF-101", { severity: "low", status: "open", build: "4.2.0" }), false);
  assert.equal(store.count(), 1);
  assert.equal(store.getDefect("DEF-101").severity, "high"); // the duplicate did not overwrite
});

test("listInOrder returns filing order and cannot be mutated from outside", () => {
  const store = createDefectStore();
  for (const id of ["DEF-103", "DEF-101", "DEF-102"]) store.fileDefect(id, { status: "open" });
  const list = store.listInOrder();
  assert.deepEqual(list, ["DEF-103", "DEF-101", "DEF-102"]);
  list.push("DEF-999");
  assert.equal(store.count(), 3);
  assert.deepEqual(store.listInOrder(), ["DEF-103", "DEF-101", "DEF-102"]);
});

test("getDefect and hasDefect handle an unknown id", () => {
  const store = createDefectStore();
  assert.equal(store.getDefect("DEF-404"), undefined);
  assert.equal(store.hasDefect("DEF-404"), false);
});

test("compareDefectIds rejects malformed ids in either argument", () => {
  for (const invalid of ["DEF-", "DEF-1x", "def-1", "XDEF-1", "DEF-1\n", null, undefined, 101]) {
    assert.throws(() => compareDefectIds(invalid, "DEF-1"), TypeError);
    assert.throws(() => compareDefectIds("DEF-1", invalid), TypeError);
  }
});

test("compareDefectIds orders by number, not by text", () => {
  assert.ok(compareDefectIds("DEF-99", "DEF-101") < 0); // text comparison gets this wrong
  assert.ok(compareDefectIds("DEF-110", "DEF-102") > 0);
  assert.equal(compareDefectIds("DEF-104", "DEF-104"), 0);
  const ids = ["DEF-1000", "DEF-99", "DEF-101"];
  assert.deepEqual([...ids].sort(compareDefectIds), ["DEF-99", "DEF-101", "DEF-1000"]);
});

const sortedIds = ["DEF-99", "DEF-101", "DEF-102", "DEF-104", "DEF-107", "DEF-110", "DEF-1000"];

test("binarySearchIds finds the boundary positions", () => {
  assert.equal(binarySearchIds(sortedIds, "DEF-99").index, 0);              // first
  assert.equal(binarySearchIds(sortedIds, "DEF-1000").index, 6);            // last
  assert.equal(binarySearchIds(sortedIds, "DEF-104").index, 3);             // exact middle
  assert.equal(binarySearchIds(sortedIds, "DEF-1").index, -1);              // smaller than all
  assert.equal(binarySearchIds(sortedIds, "DEF-5000").index, -1);           // larger than all
  assert.equal(binarySearchIds(sortedIds, "DEF-103").index, -1);            // gap in the middle
  assert.equal(binarySearchIds([], "DEF-101").index, -1);                   // empty
  assert.equal(binarySearchIds(["DEF-101"], "DEF-101").index, 0);           // one element, present
  assert.equal(binarySearchIds(["DEF-101"], "DEF-102").index, -1);          // one element, absent
});

test("linear and binary search agree on every id in the list", () => {
  for (const id of sortedIds) {
    assert.equal(binarySearchIds(sortedIds, id).index, linearSearchIds(sortedIds, id).index);
  }
});

test("binary search stays within log2 comparisons on 1,000 ids; linear does not", () => {
  const big = Array.from({ length: 1000 }, (_, i) => `DEF-${i + 1}`);
  const absent = "DEF-5000";
  assert.equal(linearSearchIds(big, absent).comparisons, 1000);
  assert.ok(binarySearchIds(big, absent).comparisons <= 10);
  assert.ok(binarySearchIds(big, "DEF-1").comparisons <= 10);
});
```

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Structure choice | Single array with `.find()`/`.includes()` | Array + Set + Map, each justified in a comment | Explains the memory cost of keeping three structures and when one could be dropped |
| Comparison correctness | Uses string `<` | Numeric comparison used for both sort and search | Adds numeric edge cases with a clear comparison contract |
| Search boundaries | Some boundary tests fail | All pass | Learner deliberately breaks `low = mid + 1` and records what the tests report |
| Cost explanation | No numbers | Comparison counts reported and interpreted | Predicts counts before running and explains any difference |

## Stretch goals

- Add `defectsForBuild(build)` and decide whether it needs another `Map` (build to ids) or a scan; justify with the operations list.
- Zero-pad the ids (`DEF-0099`) instead of numeric comparison and compare the trade-offs in a paragraph.

## Reflection prompts

- Why does a binary search over wrongly sorted data return `-1` instead of crashing, and why does that make the bug dangerous?
- Which test would have caught the alphabetical-comparison bug, and which would not have?

## Instructor notes (common pitfalls, how to adapt for time)

- Pitfalls: returning the internal array from `listInOrder`; sorting with `.sort()` and no compare function; counting loop iterations instead of comparisons; `Math.floor` omitted so `mid` is fractional.
- Learners new to ES modules may need the `package.json` tip; alternatively rename files to `.mjs`.
- Short on time: drop the store (milestones 1 to 2) and its three tests.
