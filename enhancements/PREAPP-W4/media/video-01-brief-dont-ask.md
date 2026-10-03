---
course_id: PREAPP-W4
media_id: PREAPP-W4-v01
type: video-script
title: "Brief, Don't Ask: One Prompt, Two Models"
format: screencast
target_runtime: "7 min"
related_lessons:
  - PREAPP-W4-02
objectives:
  - Prompt Claude and ChatGPT with structure, comparing outputs and judging fitness for purpose
  - Structure prompts with role, context, task, and output format
competency_ids:
  - D3-S1-C01
  - D3-S1-C02
---

## Purpose

After watching, a learner can rewrite a one-line ask into a four-part prompt (role, context, task, output format), run it unchanged in two models, and choose an output using verifiability first.

## Audience and prerequisites

Week 4 participants with access to Claude and ChatGPT. No prior prompting experience assumed.

## Script

Note to producer: model outputs below are **illustrative examples written for the script**. Record real outputs on the day and replace them, keeping the teaching points (one output invents a specific; one drifts past the word limit). If the real outputs do not show these failures, re-run or adjust narration to what actually appears — never fake a screen.

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Screen: a chat window. Typed: "Write me a follow-up message for a hiring manager." | "This is how most people use an AI model: one line, like a search bar. Let's see what it gets us." |
| 0:10 | Output appears (illustrative): "Dear Hiring Manager, I hope this message finds you well. I wanted to follow up on my previous message regarding opportunities at your esteemed organization…" | "Generic. Formal. It could go to anyone. And that's not the model's fault — it had nothing to work with, so it wrote the most average message possible." |
| 0:30 | Instructor picture-in-picture. Text card: "A prompt is a brief." | "A prompt isn't a question. It's a brief — what you'd give a new teammate. Four parts: role, context, task, output format." |
| 0:45 | New document. Typing, with each label highlighted as it is written: `ROLE: You are helping a pre-apprentice in a tech training program write to hiring contacts. Plain, direct, no flattery.` | "Role: whose judgment to apply. I'm telling it who's writing and the voice I want." |
| 1:05 | `CONTEXT: Contact is Jordan Lee, engineering manager at Harborview Credit Union (fictional). I sent a connection request 3 days ago referencing Jordan's post about their team adopting automated testing; Jordan accepted but did not reply. Harborview's careers page lists one "Junior QA Analyst" role, posted 9 days ago. I am 4 weeks into the program; last week I ran a recorded mock discovery call and scored my pipeline.` | "Context: the facts it can't know. This is where most prompts fail. Every true detail I want available goes here — and nothing I can't back up." |
| 1:40 | `TASK: Draft touch 2: a short follow-up that adds one new thing.` | "Task: one verb. One job." |
| 1:50 | `OUTPUT FORMAT: - Under 60 words - No greeting cliches ("hope this finds you well") - End with one question answerable in a sentence - Below the draft, list every factual claim it makes` | "Output format: the shape I want back. That last line is the trick — make it list its own claims so I can check them in thirty seconds." |
| 2:10 | Split screen: prompt pasted unchanged into Claude (left) and ChatGPT (right). | "Now the same prompt, unchanged, in both models. Same words. No follow-ups. If I tweak it between runs, I'm testing my edits, not the models." |
| 2:30 | Left output (illustrative), 46 words: "Jordan — thanks for connecting. Since your team's move to automated testing, I noticed the Junior QA Analyst opening. I'm four weeks into a tech pre-apprenticeship and just ran my first recorded discovery call. What do you look for in someone's first 90 days in QA?" Claims list: 4 items. | "Left output. Forty-six words, under the cap. Read the claims list." |
| 2:50 | Right output (illustrative), 74 words, includes: "I saw Harborview grew its engineering team by 30% this year…" Claims list has 3 items and omits the 30% claim. | "Right output. Seventy-four words — over the limit. And look: 'grew its engineering team by thirty percent.' I never said that. Where did it come from?" |
| 3:15 | The "30%" phrase gets a highlight box and the label "INVENTED — no source." | "Nowhere. That's a fabrication. It might even be true — but I can't defend it if Jordan asks where I got it. And notice the claims list left it out. That's why you check the claims list against the draft, not just read the list." |
| 3:45 | Scorecard table fills in: Verifiability, Task fit, Format, Tone — left vs. right. Left: pass/pass/pass/pass. Right: fail/pass/fail/pass. | "Judge in order. Verifiability first: can I check every claim? Left yes, right no. Task fit: both wrote touch 2. Format: right blew the word cap. Tone: both readable." |
| 4:20 | Verdict typed: "Took the left draft; right invented a growth figure and ran 14 words over. Will change 'first 90 days' to 'first month' to match how Jordan writes." | "Then a one-sentence verdict with a reason. Not 'it sounded better.' Which one, why, and what I still change by hand." |
| 4:45 | Instructor PiP. | "Important: this doesn't mean one model is always better. Run this tomorrow and it may flip. There is no permanently better model — only a better output for this task, which is why you run both and keep notes." |
| 5:05 | Back in the prompt doc. Delete the OUTPUT FORMAT section. Re-run in one model. Output is 140 words with a greeting cliché and no claims list. | "One more experiment. I delete the output format and run it again. Longer, a greeting cliché, nothing to check. Format was doing a lot of quiet work." |
| 5:35 | Prompt library doc: a row is added — prompt, model, "good for: touch-2 follow-ups," "watch for: invented company stats." | "Last step. Save the prompt to your library: which model, what it's good for, what it gets wrong. A prompt you run three times a week is your automation candidate for Thursday." |
| 6:00 | Task card: "Rewrite 3 vague prompts → four parts. Run your best one in both models, unchanged. Score on 4 criteria. Write a one-sentence verdict." | "Your turn. Three rewrites, one head-to-head, one verdict." |
| 6:40 | End card. | — |

## On-screen assets and B-roll

- Real Claude and ChatGPT interfaces recorded on the day (or a neutral mock chat UI if the program prefers not to show vendor UIs).
- Prompt document with the four labels color-highlighted **and** bolded.
- Scorecard table graphic.
- Prompt library spreadsheet row.

## Accessibility

- Captions; every prompt and output on screen is also read aloud or included verbatim in the transcript.
- Highlighted fabrications are marked with a box and a text label ("INVENTED — no source"), not color alone.
- Zoom to at least 150% on all typed text; hold each output on screen long enough to read (narration pauses).
- Pass/fail in the scorecard uses words, not just icons.

## Check for understanding

1. Name the four parts of a structured prompt. **Answer:** Role, context, task, output format.
2. Output A is smoother; output B is plainer. A includes a statistic you did not provide. Which do you choose, and why? **Answer:** B (after your own edits). Verifiability is the first gate; an unsourced statistic is a fabrication even if it reads well.
3. Why must the prompt stay unchanged between models? **Answer:** Otherwise you are comparing your edits, not the models.
