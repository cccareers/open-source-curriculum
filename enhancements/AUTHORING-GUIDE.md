# Enhancement Pass — Authoring Guide

This folder holds the first robustness pass over every course in `catalogue/courses/`. The goal is **more robustness, not new outcomes**: clearer lessons, more practice projects, and production-ready scripts for videos and animations. Learning objectives, lesson objectives, competency mappings, and outcomes stay exactly as they are.

`enhancements/` lives outside `catalogue/` on purpose: the course player scans every Markdown file under a course folder and would show these drafts to learners as lessons. Nothing here changes what a learner sees until an editor promotes it.

## Hard rules

1. **Do not change learning objectives or outcomes.** Never edit `course.json`. Never edit lesson frontmatter (`lesson_id`, `objectives`, `competency_ids`, `order`, `kind`, `title`, etc.).
2. **Every objective you cite must be copied verbatim** from that course's `course.json` (`learning_objectives` or a lesson's `objectives`). Every competency ID you cite must already appear in that course's `course.json` lessons. Every `related_lessons` entry must be an existing `lesson_id`. A test (`tests/enhancements.test.js`) enforces this.
3. **In-place lesson edits are body-only and surgical**: sharpen an ambiguous sentence, fix a factual or technical error, define a term before first use, add a missing step, deepen a thin worked example, add a short "Check your understanding" block at the end. Keep the author's voice (direct, second person, concrete, no fluff). Do not restructure, reorder, or delete sections. Do not add MDX components (lessons are `.md`).
4. **Accuracy over volume.** If you are not sure a product UI path, CLI flag, statute, or statistic is current, say so in `review.md` rather than asserting it.
5. **Do not run git commands.** The orchestrator commits.

## Folder layout per course

```
enhancements/<course_id>/
├── review.md                         # findings + comprehensive improvement list
├── projects/
│   └── 01-<slug>.md                  # supplementary project briefs
└── media/
    ├── video-01-<slug>.md            # video scripts
    └── animation-01-<slug>.md        # animation storyboards
```

`<course_id>` is the exact folder name in `catalogue/courses/` (case-sensitive, e.g. `CHW101`, `react100`, `DOCKER-AI-101`).

## `review.md`

```markdown
---
course_id: react100
title: "Beginner React JS — Enhancement Review"
reviewed_lessons: 11
status: draft
---

## Summary
Two or three sentences: overall quality, the biggest opportunity.

## Clarity issues
| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| react100-03 | "Props are not just strings" | ... | ... | Applied / Proposed |

## Depth and coverage gaps
Bulleted. Where examples are thin, missing edge cases, missing misconceptions, missing practice. Map each to an existing objective — never propose a new one.

## Proposed additional projects
Bulleted list of every project idea (the drafted ones in `projects/` plus any extra ideas not drafted yet).

## Video and animation opportunities
Bulleted list: concept, lesson, why motion helps, format (screencast / talking head / explainer animation / whiteboard). Mark which ones have drafts in `media/`.

## Assessment ideas
Quick checks, rubrics, or practice items worth adding later.

## Changes applied in this pass
Bulleted list of every in-place lesson edit: file, heading, one-line description.

## Open questions for the course owner
Anything you could not verify or that needs a decision.
```

## Project briefs — `projects/NN-<slug>.md`

Supplementary practice that reinforces existing objectives. Prefer realistic workplace scenarios that match the course's existing running examples and pathway. Coding courses: include a runnable acceptance-test sketch (CONTRIBUTING.md asks that coding projects ship with a learner-runnable test suite). Non-coding courses (CHW, sales, marketing, ServiceNow config, pre-apprenticeship): use role-plays, artifacts, configuration checklists, case files, and evidence portfolios instead.

```markdown
---
course_id: react100
project_id: react100-x01
title: "Toolshare Reservation Calendar"
kind: supplementary-project
status: draft
hours_estimate: 6
difficulty: core            # warm-up | core | stretch
related_lessons:
  - react100-04
  - react100-05
objectives:
  - Manage component state and respond to user events
competency_ids:
  - D2-S1-C04
---

## Scenario
## What you will build / produce
## Before you start (prerequisites, starter files or data)
## Milestones
1. ...
## Acceptance criteria
- [ ] ...
## Automated checks (coding courses) / Evidence checklist (non-coding)
## Rubric
| Criterion | Developing | Meets | Exceeds |
## Stretch goals
## Reflection prompts
## Instructor notes (common pitfalls, how to adapt for time)
```

`project_id` = `<course_id>-xNN` (x = supplementary, so it never collides with lesson IDs).

## Video scripts — `media/video-NN-<slug>.md`

```markdown
---
course_id: react100
media_id: react100-v01
type: video-script
title: "Why Your Fetch Shows Stale Data"
format: screencast            # screencast | talking-head | hybrid | whiteboard
target_runtime: "6 min"
related_lessons:
  - react100-07
objectives:
  - Load and display remote data from a component
competency_ids:
  - D2-S1-C04
---

## Purpose
One sentence: what the learner can do after watching that they could not before.
## Audience and prerequisites
## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Cold open: ... | "..." |
Write the full narration, not placeholders. Include the exact code, commands, or screens shown.
## On-screen assets and B-roll
## Accessibility
Captions, described visuals for anything conveyed only visually, color-independent cues, keyboard-visible demos.
## Check for understanding
2–3 questions to place after the video (with answers).
```

## Animation storyboards — `media/animation-NN-<slug>.md`

For concepts that are invisible or dynamic: data flowing, state changing over time, packets moving, a timeline race, a process handoff, a funnel draining.

```markdown
---
course_id: react100
media_id: react100-a01
type: animation-storyboard
title: "The Fetch Race"
target_runtime: "75 sec"
suggested_tool: "Motion Canvas"   # Manim | Motion Canvas | After Effects | Lottie | Rive | Excalidraw+screen recording
related_lessons:
  - react100-07
objectives:
  - Load and display remote data from a component
competency_ids:
  - D2-S1-C04
---

## Concept and misconception it fixes
## Visual language (shapes, colors with color-blind-safe palette, labels)
## Scenes
| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
## Interaction variant (optional)
How this could become an interactive (scrubbable, H5P, step-through).
## Production notes
```

## Volume target per course

| Course size | Projects | Video scripts | Animation storyboards |
|---|---|---|---|
| ≤ 5 lessons | 1 | 1 | 1 |
| 6+ lessons | 2 | 2 | 1–2 |

Plus `review.md` and in-place clarity edits wherever the fix is clear.

Work order inside a course: read `course.json` and every lesson → write `review.md` → draft projects → draft media → apply in-place clarity edits → update the "Changes applied" section of `review.md`.
