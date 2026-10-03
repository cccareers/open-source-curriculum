---
course_id: ai101
media_id: ai101-a01
type: animation-storyboard
title: "The Next-Token Loop: Distribution, Temperature, and the Window"
target_runtime: "90 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - ai101-02
objectives:
  - Explain in plain language how a generative AI model turns a prompt into a response, and what a token, a context window, and a temperature setting each control
competency_ids:
  - D1-S1-C01
---

## Concept and misconception it fixes

Lesson 02 describes a loop that learners cannot see: split the prompt into tokens, produce a probability distribution over the whole vocabulary, sample one token, append it, repeat, all inside one fixed token budget. Three misconceptions this targets:

1. **"The model looks the answer up."** The animation shows only a distribution and a draw. There is no database anywhere in the frame.
2. **"Temperature 0 makes it correct."** The animation shows temperature reshaping the bars. It does not change which bar is tallest, and a wrong-but-tallest bar stays wrong.
3. **"The context window is just how much I can paste."** The animation shows instructions, history, pasted text, *and the response being generated* all filling the same bar.

It is the motion version of the `next-token-prediction.png` asset described in `course.json`, and uses the lesson's own examples ("The capital of France is", "My favorite color is").

## Visual language (shapes, colors with color-blind-safe palette, labels)

- **Tokens:** rounded rectangles ("tiles") with monospace text, including a visible leading space (rendered as `␣city`) to echo the lesson's point that whitespace belongs to tokens.
- **Model:** a plain gray box labelled "model (frozen weights)". No brain, no robot, no glowing eyes; the lesson argues against anthropomorphizing.
- **Distribution:** a horizontal bar chart of the top 5 candidates plus a faded "…tens of thousands more" bar.
- **Temperature dial:** a labelled slider from 0 to the provider's maximum, with "range varies by provider" in small text.
- **Context window:** a horizontal capacity bar along the bottom with four labelled segments: SYSTEM, HISTORY, PASTED DOC, RESPONSE.
- **Palette (Okabe–Ito, color-blind safe):** blue `#0072B2` for prompt tokens, orange `#E69F00` for generated tokens, bluish-green `#009E73` for the sampled bar, vermillion `#D55E00` for the overflow warning, gray `#999999` for the model. Each color is always paired with a text label or a pattern (generated tiles have a dotted border), so nothing relies on color alone.
- **Type:** sans serif for labels, monospace for tokens, minimum 28 px at 1080p.

## Scenes

| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 0:00–0:08 | The sentence "The capital of France is" in plain text, center frame. | The sentence breaks along token boundaries into five blue tiles: `The`, `␣capital`, `␣of`, `␣France`, `␣is`. | "The model doesn't read words. It reads tokens — chunks of text from a fixed vocabulary." |
| 2 | 0:08–0:18 | Tiles slide left into the gray model box. On the right, an empty bar chart. | Bars grow: `␣Paris` 0.91, `␣the` 0.03, `␣a` 0.01, `␣located` 0.01, `␣now` 0.004, plus a faded "…" bar. | "Out comes not an answer but a probability for every token in its vocabulary. Here, one candidate dominates — a peaked distribution." |
| 3 | 0:18–0:26 | Same chart. A small "draw" marker drops onto `␣Paris`; that bar turns green with the label "sampled". | An orange `␣Paris` tile flies from the chart and appends to the end of the token row. | "One token is sampled, and appended to the sequence." |
| 4 | 0:26–0:34 | The whole token row, now six tiles, slides back into the model. A new chart appears: `.` ranked highest. | Loop arrow traces from the end of the row back into the model; a counter in the corner reads "pass 2". | "Then the whole, longer sequence goes back in, and it happens again. One token at a time. No plan for the paragraph — just the next token." |
| 5 | 0:34–0:44 | Swap the prompt: "My favorite color is". New chart: `␣blue` 0.24, `␣green` 0.15, `␣red` 0.12, `␣purple` 0.09, `␣black` 0.07. | Bars grow to a visibly flatter shape. A side-by-side thumbnail of the peaked chart from scene 2 appears for comparison. | "A different prompt gives a flat distribution — many reasonable continuations. This is where your settings matter." |
| 6 | 0:44–0:58 | Temperature slider appears under the chart, starting at 1.0 ("as computed"). | Slider moves to 0: bars sharpen until `␣blue` holds nearly all the height. Slider moves to a high value: bars flatten toward equal height. Three quick "draw" markers fall at each setting, showing repeated `blue` at 0 and varied picks at high temperature. | "Temperature reshapes the distribution before the draw. Low makes the likely choices even likelier — repeatable output. High flattens it — more variety, more drift." |
| 7 | 0:58–1:06 | Back to a factual-style prompt where the *wrong* token is tallest (label above the chart: "suppose the tallest candidate is wrong"). Slider at 0. | Draw lands on the wrong bar three times in a row; each draw shows a small text tag "same answer". | "And here's the trap. At temperature zero, a wrong top choice is chosen every time. Low temperature buys consistency, not correctness." |
| 8 | 1:06–1:20 | Context window bar along the bottom. Segments fill left to right: SYSTEM, HISTORY (grows with each simulated turn), PASTED DOC, then RESPONSE fills as orange tiles are generated. | When the bar reaches capacity, the oldest HISTORY segment (a tile reading `end every reply with BANANA`) is pushed off the left edge with a vermillion "dropped" tag and a dashed outline. | "Everything shares one budget: instructions, the whole conversation, what you pasted, and the reply being written. When it overflows, some systems silently drop the oldest material — and the model 'forgets' an instruction that is no longer in its input." |
| 9 | 1:20–1:30 | Summary frame: the loop diagram (tokens → model → distribution → sample → append) with three labels pointing at it: "token = the unit", "temperature = shape of the draw", "context window = the whole budget". | Labels fade in one by one. | "Tokens are the unit. Temperature shapes the draw. The context window is the budget for all of it. That's the machine you're prompting." |

## Interaction variant (optional)

A scrubbable web interactive (or an H5P "interactive video" with pause points):
- A temperature slider the learner drags while the bar chart re-renders live, with a "sample 10 times" button that tallies picks into a small table.
- A step button ("next token") that advances the loop one pass, so the learner controls the pace.
- A context-window sandbox where the learner adds turns and watches the oldest segment drop, with a toggle between "error on overflow" and "silently drop oldest" to show both behaviors the lesson names.
Probabilities are illustrative and fixed in the interactive; label them as such on screen.

## Production notes

- The probabilities are the illustrative numbers from lesson 02. Display "illustrative" in the corner of every chart scene.
- Temperature rescaling should be computed honestly (softmax of log-probabilities divided by T) so the sharpening and flattening look right, rather than hand-animated. At T = 0, render the top bar at 100% and label it "greedy".
- Do not show a specific numeric maximum on the slider; label the end "max (varies by provider)". See the `review.md` open question on temperature ranges.
- Do not name or depict a specific vendor's interface or model.
- Captions are burned in and also supplied as a separate caption file; the VO text above is the full narration script.
- Keep motion at a reading pace; no scene shorter than 6 seconds, and no flashing.
