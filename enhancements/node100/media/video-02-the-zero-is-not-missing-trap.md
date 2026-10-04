---
course_id: node100
media_id: node100-v02
type: video-script
title: "When Zero Is Not Missing: Truthy, Falsy, and Strict Checks"
format: hybrid
target_runtime: "5 min"
related_lessons:
  - node100-02
  - node100-03
objectives:
  - Express decisions with conditional operators and boolean logic
  - Run JavaScript with Node and declare variables with the right scope
competency_ids:
  - D5-S1-C02
---

## Purpose
After watching, the learner can spot a truthy/falsy shortcut that mistreats a valid `0` or empty string, and replace it with an explicit, testable condition.

## Audience and prerequisites
Apprentices in node100 lesson 03. Knows `let`, `const`, `null`, `undefined`.

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Talking head, then a mock ticket: "Cart badge shows 'Loading...' forever when cart is empty." | "Here's a real-shaped bug. A cart badge says 'Loading' forever, but only for people with an empty cart. Let's find out why in about four minutes." |
| 0:20 | Editor, `cart.js`: `function badgeText(itemCount) { if (itemCount) { return itemCount + " items"; } return "Loading..."; }` | "The developer wanted: if we have a count, show it; if not, we're still loading. Let's run it." |
| 0:40 | Terminal: `node -e 'const {badgeText}=require("./cart.js"); console.log(badgeText(3)); console.log(badgeText(undefined)); console.log(badgeText(0));'` prints `3 items`, `Loading...`, `Loading...`. (File ends with `module.exports = { badgeText };`.) | "Three items: fine. Undefined, still loading: fine. Zero: 'Loading'. That's the bug." |
| 1:05 | Slide listing the falsy values: `false`, `0`, `""`, `null`, `undefined`, `NaN`. `0` highlighted with a box and the label "valid count". | "`if (itemCount)` doesn't ask 'do we have a count?'. It asks 'is this value truthy?'. And zero is one of the falsy values. So a perfectly valid answer, zero items, is treated as no answer at all." |
| 1:40 | Back to editor. Rewrite: `const hasLoaded = itemCount !== null && itemCount !== undefined; if (hasLoaded) { ... }` | "Say what you mean. We don't care if it's truthy. We care whether it has loaded. So we name that boolean, `hasLoaded`, and write the explicit comparison." |
| 2:10 | Rerun the same three calls: `3 items`, `Loading...`, `0 items`. | "Zero items now shows zero items. And notice the name `hasLoaded` is something you can assert against directly." |
| 2:30 | Editor: `console.log("5" == 5, "5" === 5, 0 == false, 0 === false);` Run: `true false true false`. | "Same family of trap: loose equality. Double equals converts types before comparing, so the string five equals the number five, and zero equals false. Triple equals refuses to convert. In a test, a conversion you didn't ask for is a pass you didn't earn." |
| 3:10 | Editor: a `const` vs `let` aside: `const itemCount = 0; itemCount = 1;` → `TypeError: Assignment to constant variable.` | "One more habit from lesson 02 that helps here: if `itemCount` is a `const`, nothing later in the file can quietly change it before your check runs. Fewer moving parts, fewer surprises." |
| 3:35 | Checklist slide: "Could this value legitimately be 0, '' or false? Then don't use a truthy shortcut." / "Use === and !==." / "Name the boolean." | "So when you review code, or write your own, run this checklist. Can this value legitimately be zero, an empty string, or false? If yes, a truthy shortcut is a bug waiting for a user." |
| 4:10 | Bug report draft on screen: Title "Cart badge shows 'Loading...' when cart has 0 items"; Steps; Expected "0 items"; Actual "Loading..."; Cause "`if (itemCount)` treats 0 as missing". | "And here's how you'd write it up: the exact input that fails, expected versus actual, and the line that causes it. That's a bug a developer can fix in one minute." |
| 4:40 | End card. | "Practice step 4 in the lesson has you compare string five with number five both ways. Run it and explain the difference in your own words." |

## On-screen assets and B-roll
- `cart.js` before and after; falsy-values slide; review checklist slide; mock ticket and bug-report graphic.

## Accessibility
- Captions; the highlighted `0` on the falsy slide is also called out with a text label and narration, not only a colored box.
- Terminal output read aloud when first shown.
- Keyboard-only editing; no hover-only tooltips.

## Check for understanding
1. `if (userName)` is used to greet a user. Is an empty string `""` a valid name in your app? What does the check do with it? *Answer: Usually not valid, so the shortcut is acceptable here; it treats `""` as missing. The point is to decide deliberately.*
2. Rewrite `if (discountPercent)` so a 0% discount still counts as "a discount value was provided." *Answer: `if (discountPercent !== null && discountPercent !== undefined)`.*
3. What does `0 === false` evaluate to, and why? *Answer: `false`, because the types differ and `===` never converts.*
