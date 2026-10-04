---
course_id: ops100
media_id: ops100-v01
type: video-script
title: "From Console Error to Defect Report in Five Minutes"
format: screencast
target_runtime: "7 min"
related_lessons:
  - ops100-06
  - ops100-07
  - ops100-08
objectives:
  - Use Chrome DevTools to inspect and debug a running page
  - Turn what DevTools shows you into a defect report a developer can act on
competency_ids:
  - D3-S1-C02
  - D3-S1-C03
  - D2-S1-C01
---

## Purpose
After watching, the learner can go from "the cart total doesn't update" to a reproducible, evidence-backed defect report using Console, Sources, and Network, following the config, logs, code order.

## Audience and prerequisites
ops100 learners at lessons 06 to 08. Chrome; a demo cart page (provided by the instructor) where changing quantity throws in `cart.js` line 58 and never calls `/api/cart/update`.

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Demo `/cart` page, one item, quantity 1, total $12.00. | "A ticket says: 'Cart total is broken.' That's not a report yet. In five minutes we'll turn it into one a developer can fix without asking us a single question." |
| 0:15 | Change quantity to 3. Total stays $12.00. | "First, reproduce it. Quantity three, total still twelve dollars. Reproduced, from a fresh page load." |
| 0:30 | Open DevTools (Cmd+Option+I / F12). Show the Sources panel's `config.js` or the page's environment banner: `API_BASE_URL: https://staging.example.com`. | "Lesson 06 order: config first. We're on staging, pointed at the staging API, flags as expected. Nothing odd. Now logs." |
| 0:55 | Console tab: red `Uncaught TypeError: Cannot read properties of undefined (reading 'price') at updateTotal (cart.js:58)`. | "There it is. The error type, the exact file and line, and the function. Something was undefined when the code tried to read `.price`." |
| 1:20 | Click `cart.js:58`. Sources opens at `const lineTotal = cart.items[index].price * qty;`. | "Clicking the link jumps straight to the line. It reads the price of `cart.items[index]`." |
| 1:40 | Set a breakpoint on line 58. Change quantity again. Execution pauses. Scope pane: `index: 1`, `cart.items: Array(1)`. | "Set a breakpoint and trigger it again. Paused. Look at Scope: `index` is 1, but the cart only has one item, at index 0. Off by one. `cart.items[1]` is undefined." |
| 2:20 | Call Stack pane: `updateTotal` on top, `onQuantityChange` below it. | "The Call Stack shows how we got here: the quantity-change handler called `updateTotal`. Top frame is where we're paused; the one below called it." |
| 2:40 | Resume. Network tab, filter "Fetch/XHR", clear, change quantity. No `/api/cart/update` request appears. | "Now Network. Filter to API calls, clear, change quantity. Nothing. The update request never fires, because the code threw before it got there." |
| 3:10 | Bug tracker form. Type Title: "Cart total does not update when quantity changes on /cart (TypeError at cart.js:58)". | "Now we write. A title someone could find in a search: where, what, and the error." |
| 3:30 | Environment: "Chrome (version from chrome://version), macOS; staging.example.com; desktop and 375px widths". | "Environment: exact browser version, OS, the environment URL, and the widths we tried." |
| 3:50 | Steps: "1. Fresh load of /cart with one item (any product). 2. Change quantity from 1 to 3." | "Steps a stranger can follow. I'll re-run them from a fresh tab before filing, to be sure nothing is assumed." |
| 4:10 | Expected/Actual. | "Expected: total updates to price times three. Actual: total stays at price times one." |
| 4:25 | Evidence: the console line; "Breakpoint at cart.js:58: index = 1 while cart.items.length = 1"; "Network (Fetch/XHR): no /api/cart/update request on quantity change"; screenshot attached. | "Evidence is where DevTools pays off: the exact error, the value that was wrong, and the request that should have happened and didn't. We're not guessing at the cause; we're quoting what we saw." |
| 5:00 | Severity: High; Component: Cart; one-line justification "affects checkout totals for any multi-quantity order". | "Severity: High, and say why. Don't mark everything critical; triage has to trust your judgment." |
| 5:25 | Split screen: weak report "cart total broken" vs the finished report. | "Same bug, two reports. One costs a developer an hour of reproducing. The other costs them a minute." |
| 5:45 | Checklist slide: "Reproduce / Config → Logs → Code / Evidence with numbers / Steps re-run from clean / Honest severity". | "That's the loop. Reproduce, check config, logs, then code, capture evidence, re-run your steps, and categorize honestly." |

## On-screen assets and B-roll
- Demo cart page with a planted off-by-one at `cart.js:58` (instructor build).
- Bug tracker form mock (fields from the lesson 08 template).

## Accessibility
- Captions; every DevTools value is read aloud ("index is one, items length is one").
- Red console text is also identified as "Uncaught TypeError" in narration and zoomed.
- Keyboard shortcuts spoken and shown; DevTools font zoomed.

## Check for understanding
1. Why check config before stepping through code? *Answer: A wrong environment value looks like a code bug but needs a different fix, and it is the cheapest thing to rule out.*
2. Which DevTools evidence showed the update request never happened? *Answer: The Network panel filtered to Fetch/XHR, showing no `/api/cart/update` request on quantity change.*
3. What makes "index = 1 while cart.items.length = 1" stronger evidence than "something is undefined"? *Answer: It names the exact wrong value and points to the cause (off-by-one), so the developer can go straight to the fix.*
