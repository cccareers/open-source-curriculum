---
course_id: PREAPP-W5
project_id: PREAPP-W5-x01
title: "Funnel Report Script"
kind: supplementary-project
status: draft
hours_estimate: 5
difficulty: stretch
related_lessons:
  - PREAPP-W5-02
  - PREAPP-W5-03
  - PREAPP-W5-04
objectives:
  - Apply core programming concepts to contact-list tasks in TypeScript
  - Explain what APIs are and use a script to pull and transform pipeline data
  - Use Git fundamentals and publish working code to GitHub with a plain-language README
competency_ids:
  - D4-S1-C01
  - D4-S2-C02
  - D4-S3-C01
---

## Scenario

In Week 3 you built your funnel table by hand in a spreadsheet, counting "reached at least this stage" for each row. In Week 7 you will need that table again, for every week of the program, as the backbone of your metrics story. Use the dated weekly snapshots saved with your ledger: a current export cannot recreate earlier stage states. Doing it by hand eight times is exactly the kind of repetitive, rule-based step Week 4 taught you to automate.

This script reports the Week 1 CRM-stage funnel (Connected includes accepted invitations; In conversation can include a scheduled meeting). It is not identical to Week 3's human-reply / held-call / next-step funnel. Track those events separately and label both tables rather than treating acceptance as reply or booking as attendance.

This project extends your Week 5 script so it reads your CRM export and prints the funnel: counts per stage, stage-to-stage conversion, and the weakest transition. It ships in the same GitHub repository as your milestone script, with tests a stranger can run. It becomes your **Software Development rotation artifact** for the Week 7 portfolio, and its output feeds your metrics story directly.

## What you will build / produce

- `funnel.ts` — four exported functions: `furthestStage`, `reachedAtLeast`, `conversions`, `weakest`.
- `funnel.test.ts` — the acceptance tests below, passing.
- A `report.ts` (or a section of `pipeline.ts`) that reads a CSV, calls the functions, and prints a funnel table.
- README section "Funnel report" explaining in plain language what the numbers mean.
- Ledger updates: Week 5 numbers row, caption card, dated reflection.

## Before you start (prerequisites, starter files or data)

- Your Week 5 repository with `toRows` working (Lesson 3).
- A CRM export with at least a `name` and `stage` column. Add a `furthest_stage` column for any contact whose current stage is earlier than the furthest stage they ever reached, including Nurture or Closed contacts. Populate it from CRM history or dated activity evidence; do not guess. `furthestStage` uses this historical value when supplied, otherwise the current stage.
- Bun installed (the tests use Bun's built-in test runner: `bun test`).
- Your apprentice partner for a code review at milestone 5.

Stage order (Week 1 names; edit if your cohort uses a variant):

```ts
export const STAGES = ["Researched", "Initiated", "Connected", "In conversation", "Interviewed"];
```

## Milestones

1. **Trace first** (30 min). With your partner, work out by hand on paper what the funnel should be for the eight test rows in `funnel.test.ts` below. Write the five counts and four rates before writing any code. This is the "trace before run" habit from Lesson 2.
2. **`furthestStage` and `reachedAtLeast`** (60 min). A contact counts in a stage if their furthest stage is at that position *or later* in `STAGES`. Use `indexOf`, `filter`, and `map`. Run `bun test` and get the first three tests passing.
3. **`conversions` and `weakest`** (45 min). Rate = this count ÷ previous count × 100, rounded to one decimal. Guard against dividing by zero. Get all six tests passing.
4. **Wire it to real data** (45 min). Fetch → parse → transform → output, one function each (Lesson 3). Print a table like:

```text
Stage            Count   From previous
Researched         120   —
Initiated           95   79.2%
Connected           19   20.0%
In conversation      7   36.8%
Interviewed          2   28.6%
Weakest: Initiated -> Connected (20.0%)
```

5. **Review and commit** (30 min). Your partner reads the code and asks you to explain one function line by line. Commit in small steps: tests first, then each function, then the report wiring. Messages say what changed.
6. **README and sample data** (30 min). Add a "Funnel report" section: what it does, how to run it (`bun test`, then `bun run report.ts contacts.sample.csv`), what the output means, and what it does not do. Add rows to `contacts.sample.csv` — fake people only — so the sample produces a funnel with no zero stages.
7. **Update the ledger** (20 min). Week 5 row (paste in the funnel your script printed for your real data). Caption card for the repository. Dated reflection: hard, boring, surprising — and whether you would want to write code like this all day.

## Acceptance criteria

- [ ] `bun test` passes all six tests from a clean clone.
- [ ] `bun run report.ts contacts.sample.csv` prints the funnel table from a clean clone, with no real data in the repository.
- [ ] Each of fetch, parse, transform, and output is its own function.
- [ ] The README explains "reached at least this stage" in one plain sentence.
- [ ] Commit history shows the work in at least four meaningful steps.
- [ ] The script's output for your real data matches your hand-built Week 3 table, or you can explain every difference.
- [ ] TypeScript reports no type errors (`bunx tsc --noEmit` if TypeScript is installed in the repository, or your editor shows no red underlines).

## Automated checks (coding courses)

Copy this file into your repository as `funnel.test.ts`. It runs with `bun test`. A reference solution was written and run against these tests during authoring (6 of 6 passing, Bun 1.3, and type-checked with `tsc --strict`); do not look for it — write your own.

```ts
import { describe, expect, test } from "bun:test";
import { reachedAtLeast, conversions, weakest, type Row } from "./funnel";

const rows: Row[] = [
  { name: "A", stage: "Researched" },
  { name: "B", stage: "Initiated" },
  { name: "C", stage: "Initiated" },
  { name: "D", stage: "Connected" },
  { name: "E", stage: "In conversation" },
  { name: "F", stage: "Interviewed" },
  { name: "G", stage: "Nurture", furthest_stage: "Connected" },
  { name: "H", stage: "Closed - no fit", furthest_stage: "Initiated" },
];

describe("reachedAtLeast", () => {
  test("counts every contact that reached a stage, not just those sitting in it", () => {
    const counts = reachedAtLeast(rows);
    expect(counts.map((c) => c.count)).toEqual([8, 7, 4, 2, 1]);
  });

  test("uses furthest_stage for Nurture and Closed rows", () => {
    const connected = reachedAtLeast(rows).find((c) => c.stage === "Connected");
    expect(connected?.count).toBe(4); // D, E, F, and G (Nurture, furthest Connected)
  });

  test("returns zeros for an empty export instead of crashing", () => {
    expect(reachedAtLeast([]).every((c) => c.count === 0)).toBe(true);
  });
});

describe("conversions", () => {
  test("computes stage-to-stage rates as percentages to one decimal", () => {
    const rates = conversions(reachedAtLeast(rows)).map((c) => c.rate);
    expect(rates).toEqual([87.5, 57.1, 50, 50]);
  });

  test("does not divide by zero", () => {
    const rates = conversions(reachedAtLeast([])).map((c) => c.rate);
    expect(rates).toEqual([0, 0, 0, 0]);
  });
});

describe("weakest", () => {
  test("finds the lowest-converting transition", () => {
    const w = weakest(conversions(reachedAtLeast(rows)));
    expect(w.rate).toBe(50);
    expect(w.from).toBe("Connected");
  });
});
```

Types the tests expect `funnel.ts` to export:

```ts
export type Row = Record<string, string>;
export type StageCount = { stage: string; count: number };
export type Conversion = { from: string; to: string; rate: number };
```

Note: Contact A is still in Researched, so A counts only in the first row. Contact H was initiated, then closed, so H counts in Researched and Initiated. Ties for the weakest stage go to the earliest transition.

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Correctness | Some tests fail | All six tests pass from a clean clone | Adds own tests for messy input (blank stage, unknown stage name) and handles them |
| Structure | One long block | Fetch / parse / transform / output separated; functions named for what they do | Report output is also written to `funnel.csv` for the ledger |
| Explanation | Cannot explain a function without notes | Explains any function line by line to partner | README's limits section names a real edge case found in own data |
| Git practice | One or two commits | Four or more meaningful commits, clean history, no real data | Tests committed before implementation (test-first) |
| Data honesty | Output differs from Week 3 table, unexplained | Matches, or every difference explained | Finds and fixes an error in the original hand-built table |

## Stretch goals

- Accept a `--week` filter using `initiated_date` to group first-touch cohorts. Label these as cohort results as of the export date; they are different from the historical end-of-week snapshots in the ledger. To reproduce those snapshots, run the report separately on each dated export.
- Unknown stage names (typos in the CRM) are reported as warnings, not silently dropped.

## Reflection prompts

- Your hand count in Week 3 and the script disagreed. Which one was wrong, and how did you find out?
- Which part did you enjoy more: getting the tests to pass, or deciding what the tests should check?

## Instructor notes (common pitfalls, how to adapt for time)

- **Pitfall: current-stage counting.** The first test exists to catch it. If learners count `r.stage === stage`, the counts come out `[1, 2, 1, 1, 1]` and the test message points them to the lesson's "reached at least" rule.
- **Pitfall: `indexOf` returns -1** for Nurture/Closed rows without a `furthest_stage`, so they count nowhere. Report those rows as unresolved and exclude them explicitly; do not present incomplete counts as a verified real-data funnel. Recover their history before using the totals in the ledger.
- **Short on time:** drop milestone 4's real-data wiring and ship with the sample data only (about 3 hours). Tests and README are the non-negotiables.
- **Pairing:** the apprentice partner should review, not write. A useful review question is "what happens if the CSV is empty?"
- **Arc:** fifth link (`enhancements/PREAPP-ARC.md`). The printed funnel goes straight into the ledger and then the Week 7 metrics story.
