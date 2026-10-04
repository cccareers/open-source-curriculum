---
course_id: alg100
media_id: alg100-a01
type: animation-storyboard
title: "Same Tree, Two Orders: Depth-First vs Breadth-First"
target_runtime: "75 sec"
suggested_tool: "Manim"
related_lessons:
  - alg100-06
objectives:
  - Traverse a tree or graph structure
competency_ids:
  - D3-S1-C02
  - D5-S1-C02
---

## Concept and misconception it fixes
Learners memorize "DFS goes deep, BFS goes wide" without seeing *why*: depth-first is driven by the call stack (last in, first out), breadth-first by a queue (first in, first out). Shown side by side on lesson 06's `componentTree`, with the stack and queue visible, the different visit orders become a consequence of the data structure, and the learner sees why BFS finds a shallow failure sooner.

## Visual language (shapes, colors with color-blind-safe palette, labels)
- Two identical trees, left labelled "Depth-first (stack)", right "Breadth-first (queue)": App → Header (Logo, NavMenu), Main (LoginForm).
- Unvisited nodes: white circles with black outline. Current node: blue `#0072B2` fill with a thick outline. Visited: grey `#999999` fill with a ✓ and a visit number.
- Under each tree, a container: a vertical stack (open at the top) on the left, a horizontal queue (enter right, exit left) on the right; items are labelled cards.
- In scene 6 the failing node (`Main`, with `hasError: true`) is marked with a ⚠ glyph and vermillion `#D55E00` outline.

## Scenes
| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 6s | Both trees drawn; stack and queue empty. | Trees build top-down. | "One tree, two ways to walk it." |
| 2 | 8s | Both start: App card enters each container. | App leaves each container, turns blue, then grey with ①. Its children enter: on the stack, LoginForm-side branch `Main` pushed first then `Header` on top (so Header is next); in the queue, `Header` then `Main`. | "Both visit App first. Then they store its children. The stack will take the most recent one next; the queue will take the oldest." |
| 3 | 10s | Step 2. | Left: Header popped (②); its children pushed on top. Right: Header dequeued (②); Logo, NavMenu join the back of the queue behind Main. | "Both visit Header second. But watch where Header's children go." |
| 4 | 10s | Step 3. | Left: Logo popped (③), top of stack. Right: Main dequeued (③), the front of the queue. | "Here they split. The stack takes Logo, deep in Header's branch. The queue takes Main, the next node on the same level." |
| 5 | 12s | Steps 4 to 6 play faster. | Left order: NavMenu ④, Main ⑤, LoginForm ⑥. Right order: Logo ④, NavMenu ⑤, LoginForm ⑥. | "Depth-first: App, Header, Logo, NavMenu, Main, LoginForm. Breadth-first: App, Header, Main, Logo, NavMenu, LoginForm. Same nodes, different order." |
| 6 | 12s | Reset. Mark `Main` with ⚠ (the failing node at depth 1) and add three more leaves under Header, so Header has five children. | Run both searches for the ⚠ node; counters tick. Left reaches ⚠ at visit 8; right at visit 3. | "Now suppose the failure is shallow, in Main. Depth-first must exhaust Header's whole branch first. Breadth-first finds it on visit three." |
| 7 | 10s | A small graph with a cycle: a.js ⇄ b.js. | Without a `seen` set, a token loops a→b→a→b with a growing counter; then a `seen` set box appears and the token stops at the second visit with a ✗ "already seen". | "Graphs can loop back. Without a seen set, the walk never ends. With one, it stops." |
| 8 | 7s | Summary. | "Stack → deep first", "Queue → level by level", "Graphs → track seen". | "The container decides the order." |

## Interaction variant (optional)
A step-through web page with "Step" buttons for each side and an editable tree (add or move the ⚠ node), letting learners predict which traversal finds it first, which matches lesson 06 practice step 2.

## Production notes
- Keep the visit numbers large (36px+) and always paired with the ✓ glyph.
- Narration must state each container's next item before it moves.
- Use the exact node names from `componentTree` so learners can map it to the lesson code.
