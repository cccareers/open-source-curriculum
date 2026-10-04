---
course_id: ops100
media_id: ops100-v02
type: video-script
title: "Resolving a Real Merge Conflict Without Guessing"
format: screencast
target_runtime: "7 min"
related_lessons:
  - ops100-04
  - ops100-03
objectives:
  - Work on a shared repository using branches, merges, and pull requests
competency_ids:
  - D1-S1-C04
  - D4-S1-C01
---

## Purpose
After watching, the learner can produce, read, and resolve a merge conflict, back out with `git merge --abort` when unsure, and record the resolution in a clear commit, using the lesson 04 shipping-cost example.

## Audience and prerequisites
ops100 learners at lesson 04. A terminal and VS Code; a scratch repository with `src/checkout.js` containing `const shippingCost = calculateShipping(cart);` on `main`.

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Terminal, `git log --oneline --graph --all` showing `main` and two branches, `fix/region-shipping` and `feature/new-shipping-calc`, both branched from the same commit. | "Two people, one line of code. Priya fixed shipping for regions on one branch; Sam switched to a new shipping calculator on another. Both changed the same line. Let's see what Git does." |
| 0:20 | `git diff main fix/region-shipping` shows `- calculateShipping(cart)` / `+ calculateShipping(cart, region)`. `git diff main feature/new-shipping-calc` shows `+ calculateShippingV2(cart)`. | "Here are both changes. Different edits to the same line. Git can't know which one is right, and neither should you, yet." |
| 0:45 | `git switch main`, `git merge fix/region-shipping` → "Fast-forward". | "Priya's branch merges first, cleanly. Nothing else had changed on main." |
| 1:00 | `git merge feature/new-shipping-calc` → `CONFLICT (content): Merge conflict in src/checkout.js` and `Automatic merge failed; fix conflicts and then commit the result.` | "Now Sam's branch. Conflict. Read the message: which file, and what Git wants: fix the conflict, then commit." |
| 1:20 | `git status` shows "You have unmerged paths" and `both modified: src/checkout.js`. | "`git status` is your map in the middle of a merge. It says we're mid-merge and lists every conflicted file." |
| 1:40 | Open `src/checkout.js`: the `<<<<<<< HEAD` / `=======` / `>>>>>>> feature/new-shipping-calc` block from lesson 04. Each section is annotated with a text label ("ours: main now", "theirs: incoming branch"). | "Between `<<<<<<< HEAD` and the equals signs is what main has now, Priya's region fix. Between the equals signs and `>>>>>>>` is Sam's V2 call. The markers are literal text in your file. The code won't even run until you remove them." |
| 2:20 | Pause on the editor. Overlay: "Do I understand both sides?" | "Here's the rule from the lesson: don't resolve code you don't understand. Does V2 handle regions? I don't know. So I stop." |
| 2:35 | `git merge --abort`; `git status` → "nothing to commit, working tree clean". | "`git merge --abort` puts everything back exactly as it was before the merge. Nothing lost, no half-resolved file." |
| 2:50 | Chat mock: "@Sam does calculateShippingV2 take a region? Priya's fix on main needs it for AK/HI rates." Reply: "V2 takes (cart, region), I forgot to pass it. Use calculateShippingV2(cart, region)." | "Ask the person who wrote the other side. Thirty seconds of chat beats an hour of guessing, and it's what the communication competency looks like in practice." |
| 3:20 | Re-run `git merge feature/new-shipping-calc`; open the file; replace the whole block with `const shippingCost = calculateShippingV2(cart, region);`; delete every marker line. | "Merge again. Now I resolve it with knowledge: V2, with the region. And every marker line goes: the arrows, the equals signs, all of them." |
| 3:55 | `grep -n -E '^(<<<<<<<\|=======\|>>>>>>>)' src/checkout.js` → no output. `npm test` → passes. | "Two checks before committing. Search for leftover markers: none. Run the tests: green." |
| 4:15 | `git add src/checkout.js`, `git status` → "All conflicts fixed but you are still merging." | "Staging the file tells Git this conflict is resolved. Status confirms: all fixed, still merging." |
| 4:30 | `git commit` opens the editor with "Merge branch 'feature/new-shipping-calc'"; add a body: "Conflict in checkout.js: kept V2 calculator from Sam's branch and passed region from Priya's fix (confirmed with Sam). Tests pass." Save. | "Commit, and write a body. Six months from now, someone running `git blame` on this line will want to know why it's a combination of both branches. Tell them." |
| 5:05 | `git log --oneline --graph` shows the merge commit joining both lines. | "The graph shows both lines of work joined, with your reasoning attached." |
| 5:20 | Slide: "status → read markers → understand both sides (or abort and ask) → edit → remove markers → test → add → commit with why". | "That's the whole loop. And the best conflict is the one you avoided: say what file you're touching before you start, and pull main into your branch often." |
| 5:45 | End card: "Practice: lesson 04 steps 1 to 4". | "Now produce a conflict on purpose with a partner, or with a second clone, and resolve it with this loop." |

## On-screen assets and B-roll
- Scratch repo with `main`, `fix/region-shipping`, and `feature/new-shipping-calc` prepared as above (a small script can build it).
- Chat mock graphic; summary slide.

## Accessibility
- Captions; the conflict markers are read aloud by name ("seven less-than signs, HEAD").
- "Ours" and "theirs" sections are labelled with text, not only highlight colors.
- Terminal at 20pt+, high-contrast theme; every command is spoken.

## Check for understanding
1. Which command tells you that you are mid-merge and which files are still conflicted? *Answer: `git status`.*
2. You start a merge and realise you don't understand the other side's change. What do you do? *Answer: `git merge --abort`, then ask the author before trying again.*
3. Name two checks to run before committing a conflict resolution. *Answer: Search for leftover conflict markers, and run the tests (or at least start the app).*
