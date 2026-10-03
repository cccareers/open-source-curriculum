---
course_id: ai101
media_id: ai101-a02
type: animation-storyboard
title: "How a Chain Launders an Error"
target_runtime: "75 sec"
suggested_tool: "Excalidraw+screen recording"
related_lessons:
  - ai101-06
  - ai101-07
objectives:
  - Apply few-shot examples and multi-step prompt chains to tasks a single prompt cannot do well
competency_ids:
  - D1-S1-C03
---

## Concept and misconception it fixes

Lesson 06 warns that in a prompt chain "a wrong date extracted at step one is a fact by step three" — errors propagate and get *laundered*, treated with the confidence of an input rather than the suspicion of a guess. Learners tend to assume chains average out errors, or that the last step is where to fix a bad final answer. This animation shows one bad value entering at the extract step and gaining apparent authority as it moves downstream, and then replays the same chain with the three cheap defenses from the lesson: validate between steps, a null path, and a human review gate.

It uses the lesson's worked chain (extract → decide → draft) for the Site 2 scanner email, and is the motion companion to the `prompt-chain-flow.png` asset described in `course.json`.

## Visual language (shapes, colors with color-blind-safe palette, labels)

- **Steps:** three large rounded boxes left to right, labelled "1 EXTRACT (temp 0)", "2 DECIDE (temp 0)", "3 DRAFT (temp 0.6)".
- **Intermediate outputs:** index-card shapes between steps showing the actual JSON fields in monospace.
- **The bad value:** a field card with a hatched (diagonal stripe) fill **and** the text tag "GUESS". As it travels, the hatching fades and the tag changes to "FACT?" then disappears — the visual metaphor for laundering.
- **Validation gate:** a turnstile icon between steps labelled "CHECK".
- **Human gate:** a person icon labelled "REVIEW".
- **Palette (Okabe–Ito):** sky blue `#56B4E9` for normal data cards, vermillion `#D55E00` + hatching for the bad value, bluish-green `#009E73` + a check mark for passed validation, yellow `#F0E442` outline for the review gate. Every color is paired with a pattern, icon, or text label.
- Hand-drawn Excalidraw style to match the course's in-house diagrams.

## Scenes

| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 0:00–0:08 | The customer email card on the left: "Hi — the handheld scanners at Site 2 have been down since this morning. Six of us can't receive stock, so we're writing receipts by hand." | The email card slides into box 1. | "A customer email goes into a three-step chain: extract the facts, decide the severity, draft a reply." |
| 2 | 0:08–0:18 | Box 1 emits a JSON card. Every field is blue except `"people_blocked": 60`, which is hatched vermillion with the tag "GUESS". | The bad field pulses once. A small zoom shows the email text "Six of us" beside "60". | "Suppose step one misreads one value: sixty people blocked instead of six. Small slip. Watch what happens to it." |
| 3 | 0:18–0:30 | The card travels to box 2. Box 2 outputs `{"severity": "URGENT", "reason": "Sixty staff cannot receive stock…"}`. | As the card enters box 2, the hatching fades by half and the tag changes from "GUESS" to "FACT?". The reason text includes "Sixty" in the new card. | "Step two never saw the email. It only sees the extraction — so sixty is now its input. It reasons from it, confidently." |
| 4 | 0:30–0:42 | Box 3 drafts a reply: "We understand sixty members of your team are unable to receive stock…". | The hatching disappears entirely and the tag vanishes; the number now sits in a polished sentence. A customer icon on the far right receives the reply. | "By step three the guess is a fact, stated to the customer in a well-written sentence. Chains don't average out errors. They compound them — and launder them." |
| 5 | 0:42–0:46 | Freeze frame; "REWIND" label. | Everything rewinds quickly back to scene 2. | "Same chain. Three cheap defenses." |
| 6 | 0:46–0:56 | A CHECK turnstile appears between box 1 and box 2 with the rule text "people_blocked must appear in the source text". | The bad card hits the turnstile; it stops; a text tag "not found in source → null" appears and the field flips to `"people_blocked": null` with a dotted outline. | "One: validate between steps. A simple check — does this number appear in the email? — stops the bad value before you spend another call on it. Two: a null path. When the check fails, the value becomes null instead of a guess." |
| 7 | 0:56–1:06 | Box 2 receives the null and outputs `"needs_human_review": true`. A REVIEW person icon appears between box 2 and box 3. | The person icon examines the card, corrects `people_blocked` to 6 (shown with a check mark), and lets it pass to box 3. | "Three: a human at the highest-leverage point — after the decision, before anything reaches a customer. The lesson's rule: review when severity is urgent or a key field is null." |
| 8 | 1:06–1:15 | Final frame: both chains stacked — top labelled "without defenses" ending in the wrong reply, bottom labelled "with defenses" ending in "six members of your team". A debug arrow points from the final step back to step 1, labelled "fix where it started, not where you noticed it". | Arrow draws from right to left. | "And when a chain's final answer is wrong, read the intermediates from the top. The last step is where you noticed the problem — rarely where it started." |

## Interaction variant (optional)

A step-through interactive: the learner chooses which single value to corrupt at step 1 (site, system, people blocked, first noticed), then presses "run" and watches where it surfaces in steps 2 and 3. Toggles turn each defense on and off independently (validation, null path, human gate) so the learner can see which defense catches which corruption. A final question asks where they would place the human review gate and why, with feedback referencing lesson 06's "after the irreversible or expensive commitment, before the customer".

## Production notes

- The values must stay consistent with the lesson 06 worked chain: Site 2, handheld scanners, six people blocked, first noticed this morning, workaround writing receipts by hand; severity URGENT; reply asks whether the scanners were rebooted.
- The "60" is a deliberately introduced error for teaching. Label scene 2 with a small "simulated error" tag so the animation is not read as showing a real model output.
- The validation rule shown in scene 6 is illustrative of lesson 06's "validate between steps"; do not present it as the only correct check.
- Captions are burned in; the VO column is the full narration. Supply a text transcript and a static three-panel version (the final frame) for learners who cannot view motion.
- No scene shorter than 4 seconds; transitions are slides, not flashes.
