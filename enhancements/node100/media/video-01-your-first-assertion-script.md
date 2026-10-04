---
course_id: node100
media_id: node100-v01
type: video-script
title: "Your First Assertion Script: Arrange, Act, Assert"
format: screencast
target_runtime: "7 min"
related_lessons:
  - node100-07
objectives:
  - Write a small assertion script that checks another program's behaviour
competency_ids:
  - D3-S1-C03
  - D3-S1-C06
  - D5-S1-C02
---

## Purpose
After watching, the learner can write a Node script that imports another file, runs a list of cases through it with `assert.strictEqual`, keeps going after a failure, and decides whether a failure means the code or the expected value is wrong.

## Audience and prerequisites
Apprentices who have finished node100 lessons 02 to 06. Comfortable running `node file.js` in a terminal. Editor: VS Code with a terminal panel; font size 18+.

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Terminal: `node -e "console.log(2 + 2)"` prints `4`. | "Checking code by reading console output works once. It does not work at 2 a.m. when a pipeline runs without you. Today you'll write a script that checks another file and reports pass or fail on its own." |
| 0:20 | New empty file `stringUtils.js`. Type it out. | "Here's the file under test. A teammate wrote `slugify`: it trims the text, lowercases it, and replaces every run of whitespace with a single dash. The last line, `module.exports`, makes `slugify` available to other files." |
| 0:20 | Code: `function slugify(text) { return text.trim().toLowerCase().replace(/\s+/g, "-"); }` and `module.exports = { slugify };` | (continues) |
| 0:55 | New file `check-string-utils.js`. Type `const assert = require("assert");` | "Node ships an `assert` module. Nothing to install. An assertion is a statement that must be true. If it isn't, it throws." |
| 1:10 | Type `assert.strictEqual(1 + 1, 2);` and run `node check-string-utils.js`. No output. | "Silence means it passed. `strictEqual` compares with triple equals, the same strict equality from lesson 03." |
| 1:25 | Change to `assert.strictEqual(1 + 1, 3);` and run. Error shows `Expected values to be strictly equal:` and `2 !== 3`. Zoom on those lines. | "Now it throws, and look at the message: it tells you what it got, 2, and what it wanted, 3. That message is the product. A test that fails without telling you why is half a test." |
| 2:00 | Delete the sample line. Type `const { slugify } = require("./stringUtils.js");` | "Now let's check the other file. `require` with a dot-slash path loads our teammate's module, and the curly braces pull out `slugify`." |
| 2:15 | Type a single arrange/act/assert block with labelled comments: `const input = "Hello World"; const expected = "hello-world"; const actual = slugify(input); assert.strictEqual(actual, expected);` | "Every check has three parts. Arrange: the input and the answer you know is correct. Act: call the function. Assert: compare. Say them out loud as you write them until it's automatic." |
| 2:45 | Replace with the `cases` array of three objects including `{ input: "  Trim   Me  ", expected: "trim---me" }`. | "One case isn't a test suite. So we make an array of cases, all with the same shape, `input` and `expected`. That's lesson 06 paying off." |
| 3:10 | Type the `for...of` loop with `try`/`catch`, `passed` and `failed` counters, and the final `console.log` of totals. | "We loop over every case. The assertion goes inside `try`. If it throws, `catch` records the failure and prints the message, and the loop moves on. Without `try`/`catch`, the first failure would crash the script and hide every result after it." |
| 4:00 | Run. Output: `FAILED: slugify("  Trim   Me  ") — Expected values to be strictly equal:` then `'trim-me' !== 'trim---me'` then `2 passed, 1 failed`. | "Two passed, one failed. Here is the most important moment in this video. Before you file a bug against `slugify`, ask: is the code wrong, or is my expected value wrong?" |
| 4:25 | Split screen: the input string with spaces shown as visible dots `··Trim···Me··`. Animate trim, then lowercase, then the run of three dots collapsing to one dash. | "Trace it by hand. Trim removes the outer spaces. Lowercase. Then the regex replaces each *run* of whitespace, and three spaces in a row is one run, so one dash. The function returns `trim-me`. The bug is in our test data." |
| 5:05 | Fix expected to `"trim-me"`. Run. `3 passed, 0 failed`. | "Fix the case, rerun: three passed. A failing check is a question, not a verdict." |
| 5:20 | Edit `stringUtils.js`: change `/\s+/g` to `/\s/g`. Run checker unchanged. Output shows the trim case failing with `'trim---me' !== 'trim-me'`. | "Now let's prove the checker actually guards something. Break the regex so it replaces single spaces. Don't touch the checker. Run it. It catches the regression immediately, and the message shows exactly how the output changed." |
| 6:00 | Revert. Run. `3 passed, 0 failed`. Add a fourth case `{ input: "", expected: "" }`, run, still passes. | "Revert, green again. Adding coverage is now just adding data: a new object in the array, no new logic. That is what makes this a tool rather than a scratch script: reusable, self-reporting, easy to extend." |
| 6:35 | Slide: Arrange / Act / Assert; "Is the code wrong, or the expected value?" | "Your turn: the lesson's practice has you build the same thing for `clamp` and `isInRange`. Pick cases on the boundaries, and every time something fails, ask both questions." |

## On-screen assets and B-roll
- Final versions of `stringUtils.js` and `check-string-utils.js` from lesson 07, with the corrected case.
- A whitespace visualizer graphic (spaces as middle dots) for the trace at 4:25.
- End slide with the three-step pattern.

## Accessibility
- Burned-in captions plus a separate `.vtt` file; narration names every keystroke-level change ("change the plus sign regex to a single-space regex").
- Terminal theme with at least 4.5:1 contrast; pass/fail is conveyed by the words `passed`/`FAILED`, never by color alone.
- The whitespace visual at 4:25 is described aloud ("two spaces, the word Trim, three spaces, the word Me, two spaces").
- All typing is shown in the editor at readable speed; no mouse-only actions.

## Check for understanding
1. Your checker prints `FAILED: slugify("A  B") — 'a-b' !== 'a--b'`. Is `slugify` broken? *Answer: No. `\s+` collapses the two spaces into one dash, so `a-b` is correct; the expected value is wrong.*
2. Why is the assertion inside `try`? *Answer: So a failing case is counted and reported and the loop continues to check the remaining cases.*
3. Which method would you use to compare `{ total: 3 }` with `{ total: 3 }`? *Answer: `assert.deepStrictEqual`, because `strictEqual` checks whether they are the same object in memory.*
