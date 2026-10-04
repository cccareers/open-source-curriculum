---
course_id: alg100
media_id: alg100-v01
type: video-script
title: "Binary Search Bugs Live at the Boundaries"
format: screencast
target_runtime: "7 min"
related_lessons:
  - alg100-04
  - alg100-07
objectives:
  - Implement and compare linear and binary search
  - Use complexity and edge-case reasoning to design test data
competency_ids:
  - D5-S1-C02
  - D3-S1-C05
---

## Purpose
After watching, the learner can trace `low`, `mid`, and `high` by hand, explain how two classic off-by-one mistakes fail, and turn the seven boundary cases into a runnable test list.

## Audience and prerequisites
alg100 learners at lesson 04. Node installed; VS Code with a terminal.

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Editor with `binarySearch` from lesson 04 and `const sortedIds = ["DEF-101", "DEF-102", "DEF-104", "DEF-107", "DEF-110"];` | "Binary search is ten lines long, and professional programmers get it wrong all the time. The bugs are almost always in one place: the boundaries. Let's find them on purpose." |
| 0:20 | Run `node search.js` with `console.log(binarySearch(sortedIds, "DEF-104"))`; prints `2`. | "Searching for DEF-104 returns 2. Correct. But one passing case tells you almost nothing." |
| 0:35 | Whiteboard overlay: five boxes indexed 0 to 4; arrows `low=0`, `high=4`, `mid=2`. | "Trace it. low is 0, high is 4, mid is the floor of 2. Index 2 is DEF-104. Found in one comparison, the luckiest case." |
| 1:00 | Trace for target `DEF-110`: mid=2 (DEF-104 < DEF-110) → low=3; mid=3 (DEF-107) → low=4; mid=4 → found. | "Now the last element. Mid is 2, too small, so low becomes 3. Mid is 3, still too small, low becomes 4. Now low and high are both 4. Mid is 4. Found. Notice that last step only happens because the loop condition is low less than *or equal* to high." |
| 1:40 | Edit: `while (low < high)`. Run with `DEF-110`: prints `-1`. | "Change it to strictly less than. Run. Minus one. The id is right there and the search says it isn't. No crash, no error, just a wrong answer." |
| 2:05 | Revert. Edit: `low = mid;`. Run with `["DEF-101", "DEF-102"]` and target `DEF-102`. Terminal hangs; press Ctrl+C. | "Second classic bug: low equals mid instead of mid plus one. Two elements, look for the second. It hangs." |
| 2:25 | Whiteboard: low=0, high=1, mid=0, DEF-101 < DEF-102 → low=0 again; loop forever. | "Trace it: mid is the floor of a half, which is 0. Too small, so low becomes mid, which is 0 again. Nothing changed. Forever." |
| 2:50 | Revert. Slide listing the seven boundary cases from lesson 04. | "So the cases that catch these bugs are exactly the boundaries: first, last, middle, smaller than everything, larger than everything, an empty array, and a single element." |
| 3:15 | Type a `cases` array: `{ name: "first", items: sortedIds, target: "DEF-101", expected: 0 }`, `{ name: "last", ..., target: "DEF-110", expected: 4 }`, `{ name: "middle", ..., "DEF-104", 2 }`, `{ name: "below all", ..., "DEF-100", -1 }`, `{ name: "above all", ..., "DEF-111", -1 }`, `{ name: "empty", items: [], target: "DEF-101", expected: -1 }`, `{ name: "one element", items: ["DEF-101"], target: "DEF-101", expected: 0 }`. Then a loop printing `PASS`/`FAIL` with the name. | "Here they are as data. Each row says which boundary it covers. A small loop runs them all and prints pass or fail with the name." |
| 4:00 | Run: `7/7 passed`. Reintroduce `low < high`: `FAIL last`, `FAIL one element`. Reintroduce `low = mid` instead: the run hangs at "last". | "All seven pass. Now replay both bugs. The strict-less-than bug fails 'last' and 'one element'. The low-equals-mid bug hangs. Either way, the boundary list catches what the happy path never would." |
| 4:40 | New array: `["DEF-99", "DEF-101", "DEF-1000"]` (sorted numerically). Search for `DEF-1000` with string `<`: prints `-1`. | "One more trap from the lesson. These ids are sorted by number. But our search compares strings, and as text, DEF-1000 comes before DEF-101. The search walks the wrong way and reports it missing." |
| 5:10 | Console: `"DEF-99" < "DEF-101"` → `false`. | "Proof: as strings, DEF-99 is not less than DEF-101, because the character 9 is greater than 1." |
| 5:30 | Replace comparisons with a `compareIds(a, b)` that subtracts the numeric parts; run; prints `2`. | "The fix is to sort and search with the same numeric comparison. The rule: binary search is only correct if the array is sorted by the exact comparison the search uses." |
| 6:00 | Slide: "1,000,000 sorted ids → about 20 comparisons" next to "linear: up to 1,000,000". | "Why bother with all this care? Because on a million sorted ids, binary search needs about 20 comparisons where linear search may need a million. Fast and fragile, so test the boundaries." |
| 6:30 | End card: "Practice: lesson 04 steps 2 and 3". | "Now do it yourself: break it, watch your cases catch it, fix it." |

## On-screen assets and B-roll
- `search.js` with `binarySearch`, the cases array, and the runner loop.
- Whiteboard overlay of five indexed boxes with movable `low`/`mid`/`high` arrows (can reuse animation a01 frames).

## Accessibility
- Pointer positions are always spoken ("low is 3, high is 4"), not only shown.
- Pointers use distinct shapes and labels in addition to color.
- Captions; the hang is explained aloud ("the terminal stops responding; I press Control C").

## Check for understanding
1. Which boundary case fails when the loop condition is `low < high`? *Answer: Cases where the target is found only when `low === high`, such as the last element here or a one-element array.*
2. Why does `low = mid` loop forever on a two-element array? *Answer: `mid` floors to `low`, so assigning `low = mid` leaves the range unchanged.*
3. Ids `DEF-99`, `DEF-101`, `DEF-1000` are sorted numerically. Why does a string-comparison binary search fail to find `DEF-1000`? *Answer: The search's comparison disagrees with the sort order, so it discards the half that holds the target.*
