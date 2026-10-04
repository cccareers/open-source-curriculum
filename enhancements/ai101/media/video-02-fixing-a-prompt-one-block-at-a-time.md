---
course_id: ai101
media_id: ai101-v02
type: video-script
title: "Fixing a Prompt One Block at a Time"
format: hybrid
target_runtime: "6 min"
related_lessons:
  - ai101-04
  - ai101-07
objectives:
  - Write a structured prompt using role, task, context, constraints, and output format
competency_ids:
  - D1-S1-C02
---

## Purpose

After watching, the learner can diagnose a disappointing output by naming the single prompt block that failed, make one targeted edit, re-run, and keep a version note — instead of piling sentences onto the prompt.

## Audience and prerequisites

Learners partway through lesson 04 ("Prompt Anatomy and Core Patterns") who have read the five-block table. Uses the lesson's own running example: the weekly status update for an operations director, built from three project notes about ShiftLine.

Format is hybrid: a presenter on camera for the opening and close, and a screencast of any chat assistant (the UI is cropped to the prompt and output panes so the video does not date with a vendor's interface). Use temperature 0 or the lowest setting the tool allows so differences between runs come from the edit, not from sampling (lesson 02).

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Presenter on camera, a printed prompt in hand with a dozen sticky notes on it. | "This is what a prompt looks like after an afternoon of 'just one more fix'. Every sticky note is a sentence someone added when the output disappointed them. Some of them contradict each other. Nobody knows which ones matter. Today we're going to do the opposite." |
| 0:20 | Title card: "Fixing a prompt one block at a time." Five colored-and-labelled blocks: ROLE, TASK, CONTEXT, CONSTRAINTS, FORMAT. | "One run, one diagnosis, one block, one edit. That's the whole method." |
| 0:30 | Screencast. Prompt pane shows the lesson 04 attempt one: "Summarize these project updates for my manager." followed by three raw notes (on screen in full): "Shift-copy feature finished and deployed to all three sites Tuesday. Text notifications for schedule changes turned on. Vendor API migration — still waiting on replacement credentials from the vendor, they haven't said when. Tooling: upgraded the linter. Next: review site-two rollout, draft manager training note." | "Here's the starting point from lesson 04: one line of instruction, and the raw notes pasted underneath. Let's run it." |
| 0:55 | Output: six bullets, the vendor delay in fourth position, the linter upgrade second. | "Roughly correct. But the one thing the director actually needs to act on — the vendor delay — is buried in bullet four, behind a linter upgrade. Now, the tempting move is to type 'make it better' and add a paragraph of instructions. Don't. Name the block that failed." |
| 1:20 | On-screen checklist appears beside the output: "Wrong register? → ROLE. Wrong job? → TASK. Invented facts? → CONTEXT. Broke a rule? → CONSTRAINTS. Wrong shape? → FORMAT." Cursor ticks "ROLE". | "Who is this for? The prompt says 'my manager', which tells the model nothing about what that person needs. That's a role failure — specifically the audience half of the role block, the half beginners skip." |
| 1:45 | Edit, typed live, added at the top: "You are a project lead writing the weekly update read by an operations director who has fifteen other projects to track and thirty seconds for this one." Version note in a side panel: "v2 — ROLE: named audience and time budget." | "One edit. A writer, a reader, and the one fact about that reader that changes everything: thirty seconds. I log it as version two. Run." |
| 2:10 | Output v2: shorter, plainer, but the vendor item is still third. | "Better register, shorter sentences. But the risk still isn't first. The model now knows the reader is busy; it doesn't know that risk outranks good news. That isn't a role problem any more. Which block?" |
| 2:30 | Checklist: cursor ticks "CONSTRAINTS". | "It broke a rule we never wrote down. That's a constraint." |
| 2:40 | Edit: add "Constraints: - Anything at risk or behind schedule goes first, always. - Maximum 90 words total." Version note: "v3 — CONSTRAINTS: risk first; 90-word cap." | "Measurable rules. 'Risk first, always.' 'Ninety words maximum' — a number, not 'keep it short'. Version three. Run." |
| 3:00 | Output v3 now leads with: "Vendor API migration slipped; credentials expected next Friday." A red dashed outline appears around "next Friday". | "The risk leads. But read carefully — 'credentials expected next Friday'. Go back to the notes. They say the vendor hasn't said when. 'Next Friday' is invented." |
| 3:25 | Checklist: cursor ticks "CONSTRAINTS (escape hatch)". | "This is the most important catch in the whole video. The model wasn't told what to do when a date is missing, and the most plausible continuation of 'credentials expected' is a date. We need an escape hatch." |
| 3:40 | Edit: add "- If the notes do not state a date for something, write \"no date given\" rather than estimating." Version note: "v4 — CONSTRAINTS: escape hatch for missing dates." | "One more constraint line: if there's no date, say 'no date given'. That makes honesty a legal answer." |
| 3:55 | Output v4: "Vendor API migration slipped; no date given for the replacement credentials." Then the rest as one paragraph. | "Fixed. Last problem: it's a paragraph, and the director scans. That's the shape." |
| 4:10 | Checklist ticks "FORMAT". Edit: add the lesson 04 format block — "**Needs attention:** one line per item, or \"none this week\" / **Shipped:** one line per item / **Next week:** up to three lines" — and wrap the notes in `<<<NOTES>>>` markers. Version note: "v5 — FORMAT: three labelled sections; notes delimited." | "Format block: three labelled sections, and while I'm here I fence the notes off with markers so the model can't confuse my notes with my instructions." |
| 4:35 | Output v5 matches the lesson 04 sample output exactly. | "That's the output from lesson 04. And every improvement traces to one block and one logged edit." |
| 4:50 | Side panel enlarged: the version log v1–v5, each with block name and one-line note. | "Here's the real artifact. Not the output — the log. Next week, when something goes wrong, you'll know which block each line belongs to and why it's there." |
| 5:05 | Quick montage: delete the ROLE block from v5, run, output becomes generic bullets; restore it. Caption: "Remove it, run, compare." | "And if you ever doubt a line, delete it and re-run. If nothing changes, it was decoration. That's lesson 04 practice two." |
| 5:20 | Presenter on camera, peeling the sticky notes off the printed prompt. | "One output isn't the end, either. In lesson 07 you'll run a prompt like this over twenty real inputs and score them — because one good run is one sample. But it all starts with this habit: name the block, change only that, log it." |
| 5:45 | End card: "Try it: lesson 04 practice 2 and 4." | "Your turn. Take a prompt you use every week and fix it one block at a time." |

## On-screen assets and B-roll

- Physical prop: printed prompt with sticky notes (opening and close).
- Five-block graphic matching the `prompt-skeleton.png` asset described in `course.json` (role, task, context, constraints, output format; source text last inside delimiters), reused as a persistent sidebar.
- Diagnosis checklist overlay (five questions → five blocks).
- Version log side panel that grows with each edit.
- The three raw ShiftLine project notes as a text file for learners to download and replay the exercise.
- Pre-recorded outputs for v1–v5 as a fallback, in case live runs vary; label them "example output".

## Accessibility

- Captions for all narration; the version log and checklist are also provided as a text handout.
- Block identity is conveyed by text labels ("ROLE", "CONSTRAINTS") as well as color; the five colors are drawn from a color-blind-safe palette (e.g. Okabe–Ito).
- The invented "next Friday" is called out in narration and with a dashed outline plus a text tag "NOT IN SOURCE", not by red alone.
- Typed edits are left on screen for at least three seconds; zooms are slow and there are no flashing cuts.

## Check for understanding

1. **An extraction prompt returns a friendly paragraph instead of the table you described. Which block failed, and what is the one-line fix?**
   Answer: output format. Show the exact shape (column headers or JSON keys) and add "Return the table only — no preamble, no explanation after it."
2. **In the video, the model wrote "credentials expected next Friday". Why did it invent a date, and which block fixed it?**
   Answer: with no instruction for a missing date, the most plausible continuation is a confident date (lesson 02/03). An escape-hatch line in the constraints block ("write 'no date given' rather than estimating") made the honest answer available.
3. **Why change only one block per run?**
   Answer: so you can attribute any change in the output to that edit; changing several at once tells you nothing about which helped, and it is how prompts accumulate contradictory "wreckage".
