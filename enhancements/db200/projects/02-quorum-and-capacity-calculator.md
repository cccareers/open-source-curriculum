---
course_id: db200
project_id: db200-x02
title: "Quorum and Capacity Calculator for Feasibility Reviews"
kind: supplementary-project
status: draft
hours_estimate: 3
difficulty: warm-up
related_lessons:
  - db200-03
  - db200-06
objectives:
  - Explain the consistency and availability trade-offs described by CAP
  - Justify a data-store choice on technical and operational grounds
competency_ids:
  - D3-S1-C03
---

## Scenario

Before you write the Trail Pulse recommendation in lesson 06, your tech lead gives you some advice: "Every number in a feasibility doc gets challenged. Don't do the arithmetic in your head. Write it as code, test it, and paste the outputs with the assumptions next to them." You'll build a small, tested calculator for the two kinds of numbers this course keeps asking for: quorum arithmetic (lesson 03) and write-rate and storage sizing (lesson 06). Then you'll use it to write a one-page sizing appendix.

## What you will build / produce

- `calculator.js`: an ES module exporting the seven functions the tests import.
- `test/calculator.test.js` (provided) passing.
- `sizing-appendix.md`: one page applying the calculator to Trail Pulse part 1 (breadcrumbs), with every assumption stated, plus a quorum table for `N = 3` and `N = 5`.

## Before you start (prerequisites, starter files or data)

- Node 20 or later. No database and no npm packages are needed.
- `package.json` containing `{ "type": "module", "scripts": { "test": "node --test" } }`.
- Lesson 03's "Tuning it yourself: quorums" and lesson 06's scenario open beside you.

## Milestones

1. **Quorum functions.** `isStrong({ n, w, r })`, `writeFailuresTolerated({ n, w })`, `readFailuresTolerated({ n, r })`, and `strongCombinations(n)` returning every `{ w, r }` pair that gives strong consistency. Throw a `RangeError` for values below 1, non-integers, or `W`/`R` greater than `N`.
2. **Sizing functions.** `writesPerSecond({ concurrent, intervalSeconds })`, `rowsOverRetention({ perDay, retentionDays })`, and `storageGiB({ rows, bytesPerRow })` rounded to one decimal (1 GiB = 2^30 bytes).
3. **Run the tests** until all six pass.
4. **Write the appendix.** Compute the Saturday peak write rate, a weekday rate (pick and state a number for "a few hundred"), points per week, and storage over 18 months at a stated bytes-per-point. Compare your total with the scenario's "about 2.5 billion points." If they disagree, say so and say which number you'd use for your recommendation.
5. **Add a quorum table** for `N = 3` and `N = 5`: every strong pair, write failures tolerated, read failures tolerated, and a one-line note on which pair suits a write-heavy workload.

## Acceptance criteria

- [ ] `npm test` passes all six tests.
- [ ] Invalid input throws `RangeError` rather than returning a wrong number.
- [ ] `sizing-appendix.md` states every assumption beside the number it produces, and a reviewer can recompute each number from the text alone.
- [ ] The appendix explicitly checks the scenario's 2.5-billion estimate against your own arithmetic.

## Automated checks (coding courses)

```javascript
// test/calculator.test.js — acceptance tests for db200-x02
// Run: node --test
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isStrong, writeFailuresTolerated, readFailuresTolerated, strongCombinations,
  writesPerSecond, rowsOverRetention, storageGiB,
} from "../calculator.js";

test("W + R > N is strong; W + R = N is not", () => {
  assert.equal(isStrong({ n: 3, w: 2, r: 2 }), true);
  assert.equal(isStrong({ n: 3, w: 2, r: 1 }), false);
  assert.equal(isStrong({ n: 3, w: 3, r: 1 }), true);
  assert.equal(isStrong({ n: 5, w: 3, r: 3 }), true);
  assert.equal(isStrong({ n: 5, w: 2, r: 3 }), false);
});

test("node failures tolerated: writes need W live replicas, reads need R", () => {
  assert.equal(writeFailuresTolerated({ n: 3, w: 2 }), 1);
  assert.equal(writeFailuresTolerated({ n: 3, w: 3 }), 0);
  assert.equal(readFailuresTolerated({ n: 5, r: 2 }), 3);
});

test("lists every strongly consistent (W, R) pair for N = 5", () => {
  const pairs = strongCombinations(5).map(({ w, r }) => `${w},${r}`).sort();
  assert.equal(pairs.length, 15);
  assert.ok(pairs.includes("3,3") && pairs.includes("1,5") && pairs.includes("5,1"));
  assert.ok(!pairs.includes("2,3"), "2 + 3 = 5 is not > 5");
});

test("rejects impossible settings", () => {
  assert.throws(() => isStrong({ n: 3, w: 4, r: 1 }), RangeError);
  assert.throws(() => isStrong({ n: 3, w: 0, r: 1 }), RangeError);
});

test("Trail Pulse breadcrumbs: Saturday peak write rate", () => {
  // 3,000 concurrent hikes, one point every 30 seconds
  assert.equal(writesPerSecond({ concurrent: 3000, intervalSeconds: 30 }), 100);
});

test("rows retained and storage, with stated assumptions", () => {
  // 1,000,000 points a day kept for 30 days
  assert.equal(rowsOverRetention({ perDay: 1_000_000, retentionDays: 30 }), 30_000_000);
  // 2.5 billion rows at 100 bytes each (incl. index overhead), in GiB, rounded to 1 decimal
  assert.equal(storageGiB({ rows: 2_500_000_000, bytesPerRow: 100 }), 232.8);
});
```

```bash
npm test
```

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Quorum logic | Some tests fail, or `W + R >= N` used | All quorum tests pass; invalid input rejected | Adds tests for N = 1 and N = 2 and explains why a 2-node majority system is fragile |
| Sizing | Numbers without assumptions | Every number traceable to a stated assumption | Gives a sensitivity range (low, expected, high) and says which one drives the decision |
| Communication | Raw output pasted | Appendix readable by the tech lead in two minutes | Flags a disagreement with the scenario's own figures and explains its effect on the recommendation |

## Stretch goals

- Add `latencyMs({ w, replicaLatenciesMs })` returning the latency of the W-th fastest replica acknowledgment, and use it to show the PACELC "else" cost of `W = 2` across three regions.
- Add a monthly cost function that takes a cited unit price, and keep the citation in a code comment.

## Reflection prompts

- Which of your numbers would change the store you recommend if it were 10 times larger? Which wouldn't matter?
- Why is `W = 2, R = 2, N = 3` called the workhorse setting? Use your table to explain it.
- What did writing the arithmetic as tested code catch that doing it in your head wouldn't have?

## Instructor notes (common pitfalls, how to adapt for time)

- The commonest bug is `w + r >= n`. The `n: 3, w: 2, r: 1` case catches it.
- The scenario's 2.5-billion figure is hard to reproduce from its own stated concurrency. A reasonable weekly profile gives under a billion points over 18 months. That's intentional fodder for discussion, not an error learners must "fix." See the db200 review's open questions.
- Use this as the first session of the lesson 06 project. It takes 2–3 hours.
- Tests verified on Node 24 against a reference implementation.
