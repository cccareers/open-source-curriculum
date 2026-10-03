---
course_id: cyb130
media_id: cyb130-a01
type: animation-storyboard
title: "Five Years of Maya: How Privilege Creeps"
target_runtime: "90 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - cyb130-05
  - cyb130-04
objectives:
  - Trace an identity through joiner, mover, and leaver events and identify where privilege accumulates
competency_ids:
  - D2-S1-C03
---

## Concept and misconception it fixes
Misconception: "Nobody approved anything wrong, so her access must be fine." Privilege creep comes from removals that never happen. Every grant in Maya Okonkwo's trace (lesson 05) was reasonable on the day it was made. The animation shows entitlements stacking up over a timeline with nothing ever leaving, until two blocks that should never sit together collide.

## Visual language (shapes, colors with color-blind-safe palette, labels)
- A horizontal timeline from Mar 2021 to Mar 2026 with event markers.
- Maya is a figure on the left. Her entitlements are labelled blocks stacked above her.
- Okabe-Ito palette. Base role: grey `#999999`. Job roles: blue `#0072B2`. Temporary or project grants: yellow `#F0E442` with a dashed border and a small clock icon. Payment approval: orange `#E69F00` with a "$" glyph. Vendor bank details: bluish green `#009E73` with a "bank" glyph.
- A creep moment is marked with an upward arrow labelled "not removed". The SoD collision gets a jagged outline and the word "CONFLICT", so the cue does not rely on colour.

## Scenes
| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 8 s | Mar 2021 marker. Maya with two blocks: `role-base-employee` and `role-ap-clerk`. | Blocks drop in. | "March 2021. Maya joins Accounts Payable with the base role and the AP clerk role. Exactly right." |
| 2 | 10 s | Sep 2021: a dashed orange `role-ap-supervisor` block with a clock appears ("cover, 3 months"). Jan 2022: the clock runs out, but the block stays and turns solid. An arrow reads "not removed". | The clock sweeps, then stops and the block stays. | "She covers her supervisor's leave and gets payment approval for three months. The cover ends. The access doesn't." |
| 3 | 10 s | Jun 2022: yellow dashed `erp-config-read` and `fs-project-erp` blocks are added. Feb 2023: the project ends and the blocks stay. "Not removed." | Same pattern. | "The ERP project gives her configuration access. The project closes. The access doesn't." |
| 4 | 12 s | Aug 2023: promoted. The green `role-vendor-maintainer` block lands. A ghost outline over `role-ap-clerk` reads "keep for handover". Nov 2023: the ghost turns solid. | The green block lands next to the orange one. They pulse and a jagged "CONFLICT" outline appears. | "Promoted to procurement. She gains vendor maintenance, and it lands next to the supervisor role that was never removed. Now one person can set a vendor's bank details and approve paying them. That's the control pair lesson 04 kept apart. And the clerk role she keeps 'for handover' is more stale access on top." |
| 5 | 8 s | Apr 2024: a yellow `fs-hr-read` block, "one week, auditors", has no clock. | The block drops; a "no end date" tag flashes. | "One week helping the auditors, with HR read access. No end date was recorded, so it never ends." |
| 6 | 10 s | Jan 2025: another mover adds `role-procurement-manager` and a mailbox delegation. The stack now towers over the figure. | Camera pulls back to show the height. | "Another promotion, two more grants. Six people each approved one reasonable thing." |
| 7 | 12 s | Mar 2026: a manager icon views a list of raw group names and clicks "Approve all". A second panel shows the same items rewritten in business language: "Can approve payments up to $25,000", "Can change vendor bank details", "Can read HR files". The manager hesitates. | Split screen. | "At the access review, a list of group names gets a yes. Rewrite it in business language and the problem is obvious." |
| 8 | 10 s | Rewind to Aug 2023 with the correct mover procedure: export, compare, both managers decide, remove before add. The stack falls to the correct two blocks: `role-base-employee` and `role-vendor-maintainer`. | Excess blocks slide off in order. | "The fix lives at each move: remove before you add, and treat silence as removal. Do that, and five years later Maya holds what her job needs." |

## Interaction variant (optional)
A scrubbable H5P timeline. At each event the learner chooses "remove", "keep with end date", or "keep". The stack updates live, and the SoD collision appears only if both conflicting blocks survive. The end screen compares the learner's stack with the lesson's ideal.

## Production notes
- Use the exact dates and group names from the lesson 05 trace table so learners can cross-reference.
- Keep the blocks big enough for their labels at 720p. The dashed border and clock icon show "temporary" for viewers who can't rely on colour.
- Pairs with project cyb130-x01. The script flags this same account's SOD_BREAK and DRIFT rows.
