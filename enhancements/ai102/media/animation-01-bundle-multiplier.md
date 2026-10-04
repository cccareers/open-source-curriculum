---
course_id: ai102
media_id: ai102-a01
type: animation-storyboard
title: "The Bundle Multiplier"
target_runtime: "80 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - ai102-04
  - ai102-15
objectives:
  - Build the same class of automation in Make using scenarios, modules, and routers, and explain the trade-offs against Zapier
  - Test a no-code AI build and account for its running cost, quota limits, and failure modes before handing it over
competency_ids:
  - D2-S1-C01
  - D2-S1-C02
---

## Concept and misconception it fixes

The misconception is "a five-module scenario costs five operations per run." In Make, a module that emits several bundles makes every downstream module run once per bundle, so cost multiplies instead of adding up. Lesson 04's worked figure is `1 + 1 + 3 + 3 + 3 = 11`. The animation makes the hidden multiplication visible, then shows an Aggregator collapsing it back to one bundle. It finishes by contrasting this with the list-shaped platform, where the count is simpler to predict.

## Visual language (shapes, colors with color-blind-safe palette, labels)

- Modules: circles 120 px wide, labelled under each circle ("1 Watch Rows", "2 Search Records", "3 Create Record", "4 Chat Message", "5 Text Aggregator").
- Bundles: small rounded squares that travel along the connection lines. Single-bundle flow uses blue `#0072B2`. Fanned-out bundles use orange `#E69F00`, numbered 1, 2, 3 inside the square. Aggregated bundle uses bluish green `#009E73`. These are Okabe-Ito colours, and every bundle also carries a number or a "Σ" glyph, so colour is never the only cue.
- Operation counter: top-right, monospace, "Operations this run: N". It increments with a short tick each time a module executes.
- Bundle badge: the small number on each connection line, as in Make's run view, drawn generically rather than copied from the vendor UI.
- Background: off-white; lines in dark grey `#333333`.

## Scenes

| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 0:00-0:08 | Five circles in a row, connected. Counter reads 0. | Camera eases in from the left. | "Five modules. How many operations does one run cost?" |
| 2 | 0:08-0:16 | Viewer prompt card: "Guess: 5?" | Card fades in, then slides away. | "Most people say five. Watch." |
| 3 | 0:16-0:24 | One blue bundle leaves module 1. | Module 1 pulses; counter 0 -> 1. Bundle travels to module 2. | "The trigger runs once. One operation." |
| 4 | 0:24-0:32 | Module 2 (Search Records) pulses once; counter 1 -> 2. Three orange bundles labelled 1, 2, 3 emerge. | Badge on line 2->3 shows "3". | "The search runs once and finds three matches. It emits three bundles." |
| 5 | 0:32-0:44 | Each orange bundle enters module 3 in turn. | Module 3 pulses three times; counter 2 -> 3 -> 4 -> 5. | "Everything downstream now runs once per bundle. Create Record: three operations." |
| 6 | 0:44-0:52 | Same three bundles flow into module 4. | Module 4 pulses three times; counter 5 -> 8. Caption equation builds: `1 + 1 + 3 + 3`. | "Chat message: three more." |
| 7 | 0:52-1:00 | Module 5 is relabelled for the lesson 04 figure as a third per-bundle step ("5 Update Record"). | Three pulses; counter 8 -> 11. Equation completes: `1 + 1 + 3 + 3 + 3 = 11`. | "Eleven operations, not five. Searches and iterators are where the multiplication happens." |
| 8 | 1:00-1:10 | Rewind. Module 5 becomes "5 Text Aggregator, source: module 2". Three orange bundles converge into one green "Σ" bundle. A sixth module "6 Chat summary" appears. | Aggregator pulses once; the Σ bundle travels to module 6, which pulses once. | "An aggregator gathers the bundles that started at its source module and emits one, so whatever comes after it runs once." |
| 9 | 1:10-1:20 | Split screen: left, the Make graph with "11". Right, a vertical list of steps labelled "list-shaped platform", with each action step ticking once and Filter/Formatter steps greyed out as "not counted". | Both panels fade into a final card: "Count units from a real run, not from the canvas." | "Different platforms count different units. Measure from an actual execution, then multiply by volume. Lesson 15 makes you do it." |

## Interaction variant (optional)

A scrubbable H5P or web interactive: the learner sets "matches returned by Search" (0 to 10) with a slider and sees bundles and the counter update live, with the equation rewritten each time. A second toggle inserts the Aggregator. Add a prediction prompt before each run ("type your predicted count"), and log whether the prediction was right, so instructors can see if the misconception persists.

## Production notes

- Keep it generic. Don't reproduce Make's exact icons or colours. The animation teaches the counting rule, not the UI.
- Billing vocabulary: Make now bills in **credits**, and for non-AI modules one operation consumes one credit (Make Help Center, "Credits", checked 2026-10). Keep the on-screen label "Operations" to match lessons 04 and 15, and add a small footnote card in scene 9: "Make bills these as credits; AI modules may use more per run." Re-verify before release.
- The "Filter/Formatter not counted" detail in scene 9 reflects Zapier's task-usage help page as of this pass. Re-verify before release (see review.md, Open questions).
- Target 80 seconds; scenes 3-7 must not feel rushed. Use 0.4 s per pulse and 0.6 s bundle travel.
- Audio: a soft tick per operation, at -18 LUFS, with captions carrying everything.
