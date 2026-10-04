---
course_id: ops100
media_id: ops100-a01
type: animation-storyboard
title: "Revert vs Reset on a Shared Branch"
target_runtime: "70 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - ops100-03
  - ops100-04
objectives:
  - Use Git to record, inspect, and recover work
competency_ids:
  - D4-S1-C01
---

## Concept and misconception it fixes
Learners think `reset` and `revert` are two spellings of "undo". On a shared branch they are opposites: `revert` adds a new commit, so everyone's history still lines up; `reset` plus a force-push removes commits that teammates already have, so their next pull diverges. The animation shows both on the cart team's `main`, then shows the reflog rescuing a deleted branch.

## Visual language (shapes, colors with color-blind-safe palette, labels)
- Commits are circles labelled with short subjects ("Add cart", "Tax test", "Hardcode tax"); the bad commit has a ⚠ glyph and vermillion `#D55E00` outline.
- Branch labels are tags: `main` (blue `#0072B2`), `origin/main` (sky blue `#56B4E9`, dashed outline), `HEAD` (black arrow).
- Two lanes: "Your clone" (top) and "Teammate's clone" (bottom), plus a cloud labelled "origin".
- Revert commits are circles with a ↺ glyph and bluish green `#009E73` fill. Removed commits fade to 30% opacity with a ✗.

## Scenes
| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 8s | Three commits on `main` in origin and both clones: Add cart → Tax test → ⚠ Hardcode tax. | Commits draw left to right; all three lanes in sync. | "The bad commit is already pushed. Everyone has it." |
| 2 | 12s | Path A: revert. | In your clone a fourth circle ↺ "Revert Hardcode tax" appears after ⚠; push sends it to origin; teammate pulls and gets the same four circles. | "Revert adds a new commit that undoes the change. Push, and everyone just gets one more commit. Histories still match." |
| 3 | 6s | Rewind to scene 1. | Quick reverse animation. | "Now the other way." |
| 4 | 14s | Path B: reset and force-push. | In your clone the `main` tag jumps back to "Tax test"; ⚠ fades with ✗; force-push replaces origin's `main`. Teammate still has ⚠ locally; their next pull shows a fork in the graph with a "diverged" warning label. | "Reset moves the branch back and force-push rewrites origin. But your teammate still has the old commit. Their history and the shared one no longer agree." |
| 5 | 8s | Teammate pushes again. | The ⚠ commit reappears on origin through their merge. | "And the bad change can come right back the next time they push." |
| 6 | 14s | Reflog rescue: your clone shows a branch tag `fix/cart-quantity` on a "Fix quantity" commit; the tag is deleted (✗). | The commit stays, greyed, with a dotted line to a small list labelled `git reflog` showing "commit: Fix cart total ignoring quantity…". `git switch -c fix/cart-quantity <hash>` re-attaches a new tag. | "Deleting a branch deletes the label, not the commit. The reflog remembers where you've been, so you can put a label back." |
| 7 | 8s | Summary. | Three cards: "Shared? revert", "Local only? reset is fine", "Lost? reflog first". | "Shared: revert. Local only: reset is fine. Lost something: check the reflog before you panic." |

## Interaction variant (optional)
Pair with project ops100-x01: a step-through where the learner chooses "revert" or "reset + force-push" and sees the teammate lane update, ending with the checker's pass/fail lines.

## Production notes
- Keep commit subjects identical to the ops100-x01 lab so learners recognise them.
- Never rely on color alone: the ⚠, ↺, and ✗ glyphs carry meaning.
- Narration must mention that the reflog is local to one machine and expires.
