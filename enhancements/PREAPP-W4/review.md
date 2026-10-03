---
course_id: PREAPP-W4
title: "Pathway Rotation: AI Prompt Engineering & Automation — Enhancement Review"
reviewed_lessons: 4
status: draft
---

## Summary

Week 4 teaches verifiability over fluency well, and the "you bring the facts, the model does the shaping" frame is the right one for beginners. Main gaps: "LLM" is never defined; the worked examples are all from a software seller's point of view while learners apply them to a job-search pipeline, with no translation; and the automation project gives a time-saved formula but no worked calculation.

## Clarity issues

| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| PREAPP-W4-02 | "The gap between a question and a prompt" | "LLM" (in the lesson title) is never defined; no plain explanation of why models produce confident errors | Add a two-sentence definition at the top | Applied |
| PREAPP-W4-02 | "Role, context, task, output format" | Northwind example is a vendor's cold email; the Practice says "work against your own live pipeline" (job-search outreach). Career-changers get stuck translating | Add a paragraph mapping each of the four parts to job-search outreach | Applied |
| PREAPP-W4-03 | Practice 2 | "Why it connects to what you sell" — learners are not selling a product | Parenthetical: what you sell is your candidacy | Applied |
| PREAPP-W4-04 | "Requirements" item 4 | Formula given without a worked example; learners often omit checking time or upkeep | Add a fully worked example, including checking time in "after" and setup payback | Applied |
| PREAPP-W4-03 | "A research pass that stays checkable" | "Takes most people twelve to fifteen minutes; this pass takes two or three" is presented as fact | Frame as typical cohort observation or let learners measure their own | Proposed |
| PREAPP-W4-04 | "Constraints" | "Do not paste anything confidential into a tool the program has not cleared" — learners don't know which tools are cleared or what counts as confidential (contact emails? interview notes?) | Instructor-provided list of cleared tools and a one-line definition of confidential for this program | Proposed |

## Depth and coverage gaps

- **No example of a weak automation candidate vs. a strong one** for "Select an automation candidate by frequency, time cost, and repeatability." A two-row comparison (e.g. "writing hooks" = judgment-heavy, poor candidate; "formatting research into the CRM note template" = rule-based, good candidate) would model the written case.
- **No example of what "working build" looks like at beginner level** for "Design and build a working automation with a measurable time-saved estimate." Many learners freeze at tool choice. A gallery of three past-cohort automations (saved prompt + template; spreadsheet formula; no-code workflow), each with its runbook, would help.
- **Prompt library has no template.** Lesson 2 lists four fields; offering a starter table would make Practice 6 faster.
- **Data handling is mentioned once.** Learners paste real contacts' profile text into third-party tools all week. A short "what's OK to paste" guide would reduce risk.

## Proposed additional projects

- **Drafted:** `projects/01-automation-runbook-and-audit.md` — a one-page runbook a peer can follow plus a five-input accuracy audit of the automation's output. This is the AI rotation artifact for the W7 portfolio.
- Idea: "Prompt Library Swap" — learners exchange their three best prompts, run a partner's prompt on their own pipeline, and report what broke.
- Idea: "Hallucination Hunt" — instructor provides five AI drafts seeded with fabricated specifics, overstated inferences, and filler; timed critique race with scoring.

## Video and animation opportunities

- **Brief, don't ask: one prompt, two models** (W4-02) — screencast; one-line prompt vs. four-part brief, head-to-head, verdict. *Drafted: `media/video-01-brief-dont-ask.md`* (model outputs must be re-recorded live; script flags this).
- **You bring the facts** (W4-03) — explainer animation; recalled vs. sourced claims, then the critique-pass sort. Shows source threads, which are hard to convey in prose. *Drafted: `media/animation-01-you-bring-the-facts.md`.*
- Building a no-code automation end to end (W4-04) — screencast; vendor-specific, so needs one per cleared tool. Not drafted.
- "The swap test" in 60 seconds (W4-03) — short-form clip. Not drafted.

## Assessment ideas

- **Four-part labeling:** give five prompts; learners label role/context/task/format and identify what is missing.
- **Claim audit item:** a draft plus three sources; learners mark each claim Verified / Unsupported / Overstated.
- **Time-saved calculation item:** given timings, frequency, upkeep, and setup, compute weekly savings and payback; one distractor omits checking time.

## Changes applied in this pass

- `02-working-with-llms.md`, "The gap between a question and a prompt": added a plain definition of LLM and why fluent output can be wrong.
- `02-working-with-llms.md`, "Role, context, task, output format": added a paragraph translating the four parts to job-search outreach.
- `03-ai-assisted-prospecting.md`, Practice 2: clarified "what you sell" as your candidacy.
- `04-build-an-automation.md`, "Requirements" item 4: added a worked time-saved and payback calculation.

## Open questions for the course owner

- Which AI and automation tools are cleared for participant data? The lessons reference clearance but no list exists in the course.
- Does the program have accounts for both Claude and ChatGPT for every participant, or are free tiers assumed? Free-tier limits may affect the head-to-head exercises.
- The "Nothing sends unreviewed" rule is in W4-04 only. Should it be repeated in W4-03, where learners first draft live messages with AI?
