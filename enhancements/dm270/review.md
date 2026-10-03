---
course_id: dm270
title: "Content Creation and Management — Enhancement Review"
reviewed_lessons: 8
status: draft
---

## Summary
A coherent, well-paced course built on one running brand (Harvest Lane) that carries a single flagship piece from audience research through measurement. The writing is concrete, accessibility is genuinely integrated rather than appended, and the lesson 07 performance table reconciles exactly. The fixes needed are small arithmetic and narration errors. The biggest opportunity is supplied evidence and data for learners who cannot get real customer quotes or 90 days of analytics, plus worked examples of a repurposing derivative written from research rather than from the article.

## Clarity issues
| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| dm270-02 | "Auditing what already exists" | "63 URLs became 49" — the audit (22 keep, 14 update, 19 merged into 6, 8 retire) leaves 42 URLs. | Corrected to 42 with the breakdown shown. | Applied |
| dm270-04 | "The script" and the caption file | Opening narration "One of these trays got six hours of light. The other got eighteen inches of it, three inches away" contradicts itself and the on-screen labels ("18 in away" / "3 in away"). | Rewrote the line and the two matching caption cues: "One tray grew with its light eighteen inches away. The other, three inches away." | Applied |
| dm270-04 | "The script" header | "Spoken: 104 words" was not re-counted after the narration fix (now roughly 99). | Re-count and update the header, or drop the exact count. | Proposed |
| dm270-07 | "A content performance table" findings | "Row 7 is third by sessions" — it is fourth (8,420; 6,110; 5,340; 4,900). | Corrected to fourth. | Applied |
| dm270-07 | Same section | "$3,204 an hour — more than twice row 5 and ten times row 1": row 1 is $903, so 3.5x; ten times is row 2 ($316). | Corrected to "three and a half times row 1, and ten times row 2". | Applied |
| dm270-03 | Before/after word counts | Stated counts (127, 58, 61, 63, 66, 58) differ slightly from a mechanical count depending on how dashes, arrows and emoji are counted. Not wrong, but learners checking will get different numbers. | Add a one-line note: "word counts exclude symbols and the label line". | Proposed |
| dm270-06 | "The repurposing map", row 4 | Channel cell "Site gated-free + email" is unclear, and the Job "Subscriber capture" implies a gate. | Decide: ungated download with an optional opt-in, or gated. Then reword the cell. | Proposed |
| dm270-08 | "Constraints" | "Real evidence only... invented quotes fail" sits beside "a fictional brand you define in a paragraph" (Goal section). A fictional brand has no customers to quote. | Clarify: a fictional brand must use real evidence from its category (competitor reviews, forums, search data). | Proposed |

## Depth and coverage gaps
- **Learners without customer access** need a fallback evidence pack. Lesson 02 Part 2 requires 30 verbatim quotes; a supplied set of anonymised, category-level review and forum excerpts (clearly labelled as practice data) would let them practise the inventory method before doing it for real (objective: Build a content strategy from audience research and business goals).
- **Learners without 90 days of analytics** are told to reuse the lesson 07 table, which they have already seen worked. A fresh 10-row content performance CSV with a seasonal trap and a tagging defect is drafted as project x01 (objective: Measure content performance and decide what to publish next).
- **Repurposing derivatives**: lesson 06 maps ten derivatives but writes none of them out. One fully written derivative (the carousel or the newsletter feature) would model "write from the research, not from the article" (objective: Distribute and repurpose one piece of content across multiple channels). Drafted as project x02.
- **CMS migration edge cases**: lesson 05 covers merges and redirects conceptually; a short worked redirect map (old URL → survivor, with status) would make the maintenance plan concrete.
- **Misconception to name in lesson 07**: "high engagement rate always means a good page" — the lesson implies it (calculator row) but a check item would test it directly.

## Proposed additional projects
- **x01 Harvest Lane Q2 Content Performance Case File** (drafted) — supplied 90-day CSV with a seasonal trap, an untagged derivative, and a small-number row; learner produces verdicts, decisions and the one-page report.
- **x02 Leggy Seedlings Distribution Sprint** (drafted) — repurposing map, three finished derivatives written from the research notes, a six-week schedule, and tagged links.
- Library rescue: given a 40-row inventory export with 90 freeform tags, design the taxonomy, consolidation plan, and redirect map.
- Product-page copy pack: rewrite three Harvest Lane product blocks with objection, proof, single CTA, and accessibility pass.
- Brief-to-video in an afternoon: a 30-second "soil settling" vertical video from brief to captioned export.

## Video and animation opportunities
- **Six-pass edit, live** (lesson 03) — screencast editing the 127-word intro down pass by pass with word counts. Drafted: `media/video-01-six-pass-edit.md`.
- **Reading a content performance table** (lesson 07) — screencast computing value per hour and assigning verdicts. Drafted: `media/video-02-from-table-to-verdicts.md`.
- **Taxonomy sprawl vs. governed taxonomy** (lesson 05) — explainer animation of 147 tags collapsing into 4 planned taxonomies and the archive pages they generate. Drafted: `media/animation-01-taxonomy-sprawl.md`.
- **The safe area on a vertical frame** (lesson 04) — short animation showing where platform UI covers text. Not drafted.
- **One asset, six weeks** (lesson 06) — timeline animation of derivatives released across the distribution window vs. a day-one dump. Not drafted.

## Assessment ideas
- Quick check (lesson 02): five topic ideas; learner assigns each to a Harvest Lane pillar or the exclusion list with a one-line reason.
- Quick check (lesson 03): identify the defect category (throat-clearing, intensifier, abstraction, directional instruction) in six sentences.
- Quick check (lesson 05): given an H2 → H4 outline and three image alt attributes, identify the accessibility defects.
- Rubric line for lesson 07 practice: every verdict cites the rate or volume that justifies it, and at least one "leave alone" is defended.

## Changes applied in this pass
- `catalogue/courses/dm270/lessons/02-content-strategy-and-audience-research.md`, "Auditing what already exists": post-audit URL count corrected from 49 to 42 with the breakdown.
- `catalogue/courses/dm270/lessons/04-multimedia-content-production.md`, "The script": contradictory opening narration rewritten to match the on-screen labels.
- `catalogue/courses/dm270/lessons/04-multimedia-content-production.md`, "Accessibility, built in": caption cues 1 and 2 updated to match the corrected narration.
- `catalogue/courses/dm270/lessons/07-measuring-content-performance.md`, "A content performance table": row 7 rank corrected to fourth by sessions; value-per-hour comparison corrected (3.5x row 1, 10x row 2).

## Open questions for the course owner
- **Which CMS does the program use?** The course teaches WordPress-style concepts generically (per the sequencing rationale). If the program standardises on one CMS, a one-page vocabulary map would help.
- **Possibly outdated specifics (not verified):** spoken word rate (130-150 wpm), safe-area guidance (bottom 20%, top 10%), and the 48px text floor in lesson 04 are sensible rules of thumb but platform UI overlays change; recommend labelling them as working defaults. Engagement-rate and "view" definitions in lesson 07 differ by platform and change over time; the lesson already says so, which is the right approach.
- Seed subscription value ($108 = $9 x 12 months) in lesson 07 assumes 12-month retention; confirm this is the intended teaching assumption.
- The $189 bed price (lessons 02 and 03) and the $142 average order value (lesson 02) are both used; they are compatible but a sentence linking them would prevent questions.
