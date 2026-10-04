---
course_id: cse270
media_id: cse270-a02
type: animation-storyboard
title: "Pipeline Stages as Gates"
target_runtime: "75 sec"
suggested_tool: "Lottie"
related_lessons:
  - cse270-06
  - cse270-07
objectives:
  - Automate a deployment with a continuous integration and delivery pipeline
competency_ids:
  - D4-S1-C03
---

## Concept and misconception it fixes
Learners see a pipeline as a list of commands. The animation shows each stage as a gate that adds one guarantee, shows a pull-request run stopping before deploy, a lint failure stopping everything downstream, and a script that logs an error but exits 0 sailing through — the most dangerous case.

## Visual language (shapes, colors with color-blind-safe palette, labels)
- Commit: a small card with a short SHA (`a1b2c3d`).
- Stages: gates in a row labelled Checkout, Lint, Build, Test, Deploy-staging, Approval, Deploy-prod; each gate has its one-line guarantee under it.
- Gate states: open (✓ and solid outline), closed (✗ and heavy outline), skipped (⊘ and dotted outline) — symbols carry meaning, colour (#009E73 / #D55E00 / grey) is secondary.
- Artifact: a box labelled `bundle-a1b2c3d` that travels from Build onward.

## Scenes
| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 10s | PR commit card enters; gates Checkout→Test open in turn; Deploy gates show ⊘ "branch != main". | Card passes four gates, stops. | "A pull request runs the safe stages and stops. Deploy is conditional on the main branch." |
| 2 | 10s | Merge: card on main passes all gates; artifact box created at Build and carried, not rebuilt. Approval gate pauses with a person icon, then opens. | Artifact travels with card. | "After merge, the same artifact travels all the way — what you tested is what you deploy. A human approves before production." |
| 3 | 12s | New commit with a lint error: Lint gate closes ✗; every later gate turns ⊘ "skipped". Target server unchanged. | Gates dim in sequence. | "A lint error closes the first gate. Everything downstream is skipped, and nothing reaches the target." |
| 4 | 15s | Commit where the test script logs "ERROR" but exits 0: Test gate shows ✓ with a warning triangle; card proceeds to deploy. Exit-code badge "0" highlighted. | Card slips through; alarm icon pulses after. | "Now the dangerous one. The script printed an error but exited zero. The pipeline only reads the number. It deploys." |
| 5 | 10s | Re-run the deploy on the same SHA: target shows the same bundle; counter "resources created: 0". | Second pass, no change. | "Re-runs happen. An idempotent deploy leaves the same end state the second time." |
| 6 | 10s | Two merges arrive close together; a concurrency lock icon makes the second wait until the first finishes. | Second card waits at the lock. | "And a concurrency lock stops two deploys running at the same time. It doesn't promise order on its own — if an older commit must never replace a newer one, the deploy has to check that too." |
| 7 | 10s | Summary: gates with their guarantees listed. "Exit codes are the contract." | Text fades in. | "Each gate adds one guarantee. Exit codes are the contract." |

## Interaction variant (optional)
Learners drag a "failure" token onto any gate and predict which gates run; then press play to check. A second mode lets them toggle a script's exit code independently of its log output.

## Production notes
- Lottie (After Effects + Bodymovin) suits the looping gate states; export each scene separately for embedding in lessons 06 and 07.
- Short SHA must match across scenes so the artifact-provenance point lands.
