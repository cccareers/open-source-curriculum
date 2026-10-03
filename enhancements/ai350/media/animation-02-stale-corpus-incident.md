---
course_id: ai350
media_id: ai350-a02
type: animation-storyboard
title: "The 60-Day Reply: Anatomy of a Monitoring Incident"
target_runtime: "90 sec"
suggested_tool: "After Effects"
related_lessons:
  - ai350-07
objectives:
  - Monitor AI-generated content for misinformation and compliance risk and respond when monitoring fires
competency_ids:
  - D6-S1-C05
---

## Concept and misconception it fixes
Misconception: "When an AI output is wrong, the fix is a better prompt." The ai350-07 worked example shows a reply quoting a 60-day return window when policy is 30; the cause was a stale page in the retrieval corpus, not hallucination. The animation shows detection lag over time, triage escalating from S2 to S1, and a root cause located outside the model.

## Visual language (shapes, colors with color-blind-safe palette, labels)
- Horizontal timeline in weeks (W1–W6). Outputs are small circles on the timeline: correct outputs gray (#999999, filled), incorrect outputs vermillion (#D55E00) with an "x" inside.
- Corpus documents are page icons: current policy page blue (#0072B2) labelled "30 days (current)"; stale page orange (#E69F00) labelled "60 days (old)".
- Severity badges S1/S2/S3 as text badges with distinct shapes (S1 octagon, S2 triangle, S3 circle) so severity is not color-only.

## Scenes
| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 8s | Retrieval corpus shelf with two pages: blue "30 days (current)" and orange "60 days (old)". Model funnel beside it. | Camera pans across shelf. | "The assistant answers from what you indexed. Someone indexed an old policy page next to the current one." |
| 2 | 12s | Timeline W1–W4. Circles stream in; most gray, every so often a vermillion x when the orange page is retrieved. | Circles drop at a steady rate; x's are sparse (1 in ~40). | "Most replies are right. A few quote 60 days. Nobody notices — the failure is in the tail." |
| 3 | 8s | At W5 a magnifying glass labelled "5% weekly sample" picks one circle: vermillion x. Text: "Reply quotes 60 days; policy says 30." | Zoom on the circle. | "The weekly sample finds one. One customer, materially wrong, correctable." |
| 4 | 6s | Triangle badge "S2 — act today" appears. | Pop-in. | "Triage says S2. But first: is it isolated?" |
| 5 | 10s | Search bar "60 day" sweeps back across W1–W5; eleven more x's light up. Triangle morphs into octagon "S1 — act now". | Sweep left; badges morph. | "A search of last month finds eleven more. That makes it S1." |
| 6 | 8s | A big toggle switch labelled "Automatic send → Human approval" flips. | Switch animation; stream of circles now passes through a person icon. | "Contain first: the automation goes to human-approval mode within the hour." |
| 7 | 8s | Eleven envelope icons fly to eleven customer icons, each labelled "Correction: 30 days; your 60-day quote will be honoured". Owner icon with "decides" label. | Envelopes fan out. | "Correct: eleven emails, stated plainly. Honouring the wrong window is a business decision, so the owner is notified." |
| 8 | 10s | Diagnosis: camera returns to the shelf. A "decision record" card shows `prompt_version: triage-v7` unchanged, `model` unchanged. Spotlight lands on orange page. | Spotlight moves from model to shelf. | "Diagnose with the decision records. Model unchanged. Prompt unchanged. The cause is the stale page." |
| 9 | 8s | Orange page removed. Rule card "M03: policy figures checked against system of record" stamps onto the pipeline; a test tube "regression set +1" appears. | Stamp + add. | "Prevent: fix the corpus, extend the traceability rule, add the case to the regression set." |
| 10 | 8s | Timeline returns with a bracket from W1 to W5 labelled "detection lag: 4 weeks". | Bracket draws. | "The most valuable finding: four weeks of lag. The sample rate was too low for this volume." |
| 11 | 4s | Title: "Monitoring finds problems whose causes are nowhere near the model." | Fade. | — |

## Interaction variant (optional)
A scrubbable timeline where learners set the sample rate (1%, 5%, 10%, fixed 30/week) and see the expected detection week change. Use a simple binomial model; label it as illustrative.

## Production notes
- Figures (30/60 days, eleven additional replies, four-week lag, 5% sample) come directly from the ai350-07 worked example; do not change them.
- Provide WebVTT captions and an audio-described track that reads out the severity badge changes and the detection-lag bracket.
- Keep the incorrect-output marker as an "x" shape in addition to color.
