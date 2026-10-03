---
course_id: dm350
title: "CRM and Marketing Automation — Enhancement Review"
reviewed_lessons: 10
status: draft
---

## Summary
A thorough capstone that keeps one business (Northlight Bookkeeping) and one set of numbers across data modelling, capture, email, segmentation, automation, deliverability, martech and privacy. The workflow specification format in lesson 06 and the triage path in lesson 07 are excellent teaching artefacts. Most arithmetic checks out; the problems are small factual slips (row and property counts, a time-zone example that ran backwards, a subject-line character count), one internal contradiction (a nurture workflow that moved lifecycle stage backwards while the next section forbids it), and a cluster of audience-size figures that do not quite agree across lessons 04 and 05. The biggest opportunity is hands-on data: learners are asked to clean, segment and diagnose, but only lesson 02's eight-row CSV is supplied.

## Clarity issues
| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| dm350-02 | "Importing Without Poisoning the Database" + Practice | CSV has eight data rows; text and practice called it nine. | "Eight rows" / "eight-row CSV". | Applied |
| dm350-02 | Practice item 1 | "fourteen properties" — the schema has fifteen. | "fifteen". | Applied |
| dm350-02 | "Activities and the Timeline" | Sam's timeline runs Feb 19 to Mar 4 but was described as "Five weeks". | "Two weeks". | Applied |
| dm350-03 | "Measuring Lead Quality, Not Lead Count" | "A new contact of any kind is worth about $245" collides with the $245 cost per new client in the table above it; the value is $247 (11/287 x $6,435). | Corrected to $247 and noted the two numbers are different. | Applied |
| dm350-04 | "Subject Lines and Preview Text" | Character counts off by 1-3 (A is 55, not 58; B 45; C 44; D 36). | Corrected. | Applied |
| dm350-04 | Same section | Said "the fill-rate audit from lesson 02 said 1,470 contacts have no reliable name"; lesson 02's audit shows 1,470 blank **country** values and does not audit first name. | Reworded to attribute the 1,470 unreliable first names to Northlight's data, with lesson 05 as the follow-up. | Applied |
| dm350-05 | "Measuring by Segment" | "produced a third as many bookings per contact" — solo is 5/1,340 vs agency 14/2,500, about two-thirds. | Corrected with the figures. | Applied |
| dm350-06 | "Delays" | Time-zone example said a 10:00 send "from the office" lands at 07:00 for part of the list; the office is in Portland (Pacific), so it lands at 13:00 in Boston. | Rewritten in both directions. | Applied |
| dm350-06 | "The Worked Workflow" END line | Moved contacts back to `subscriber`, contradicting "NEVER move a stage BACKWARDS automatically" in the next section. | END now leaves lifecycle stage unchanged. | Applied |
| dm350-06 | "The Funnel, Mapped" | Stage medians (0+19+4+6+11 = 40 days) do not add to the 32-day end-to-end median; learners will add them. | Added a note that medians do not add and the end-to-end figure is measured directly. | Applied |
| dm350-07 | "Open Rate Is Not What It Used to Be" | Claimed lesson 06's day-6 branch used "opened or clicked" because "the click carries the signal", which contradicts "never automate on opens". | Reworded: the branch only decides a re-send, where a machine open is a cheap error; consequential branches use clicks/replies/forms. | Applied |
| dm350-08 | "Measuring the Bot" | "four in ten of them are being let down" — 12 of 41 is about three in ten. | Corrected. | Applied |
| dm350-09 | "Two Regimes, One Posture" | "Northlight has 240 clients in California" — 240 is the total client count. | Reworded to "clients and prospects in California". | Applied |
| dm350-04 / dm350-05 | Q3 brief vs segment map | Lesson 04's audience is 3,940 contacts; lesson 05's segmented send of the same campaign is 3,840 (2,500 + 1,340). Lesson 05's table also implies every one of the 240 clients has an unknown/other business type. | Pick one audience size (3,840 is consistent with lesson 05's tables) and cascade lesson 04's arithmetic (delivered 3,725; clicks about 89; bookings about 20 still holds). | Proposed |
| dm350-07 | "Reading a Bad Send" | "Hard bounces tripled, to 6 percent" compares October's hard bounce rate with September's **total** bounce rate (3.0%). | Supply September's hard-bounce rate or say "doubled versus total bounces". | Proposed |

## Depth and coverage gaps
- **No full contact export to practise on.** Lessons 02, 05 and 07 ask learners to audit fill rates, build segments and diagnose sends; a 40-row contact CSV plus a send log would make the work concrete (objectives: Model contacts, companies, and activities in a CRM so the data stays usable; Segment an audience and personalize content for each segment). Drafted as project x01.
- **Deliverability diagnosis practice** has one worked bad send and one exercise. A second case where the problem is at a single mailbox provider (authentication/alignment) rather than the list would exercise triage step 6 (objective: Diagnose email deliverability and performance problems and fix them). Drafted as project x02.
- **US commercial-email law is not named.** Lesson 04 requires a postal address and an unsubscribe link (both CAN-SPAM requirements) without naming the law; lesson 09 covers GDPR and CCPA only. One orienting paragraph naming CAN-SPAM, labelled "check current text", would help US apprentices. Owner decision.
- **CCPA applicability thresholds.** Lesson 09 recommends building to opt-in regardless, which is sound, but does not mention that CCPA applies only to businesses meeting thresholds; a nine-person firm may be outside it. Flag rather than assert.
- **Workflow worked example for a client-side (retention) sequence** is assigned in lesson 06 practice but not modelled; one short exemplar would raise the floor.

## Proposed additional projects
- **x01 Northlight Contact Export Clean-and-Segment** (drafted) — 40-row CSV with planted defects; learner produces a fill-rate audit, cleaned file, segment logic with counts, and a three-branch conditional block.
- **x02 The One-Provider Problem: A Deliverability Case File** (drafted) — per-provider send log and DNS records; learner triages, finds the alignment failure, and writes a recovery plan.
- Client onboarding workflow spec (from lesson 06 practice) with a test plan and holdout.
- Chatbot script for the Year-End Close Sprint with a capacity-aware branch ("places left").
- Data subject request tabletop: five requests arriving across channels; learner runs the runbook and drafts replies.

## Video and animation opportunities
- **Reading a bad send** (lesson 07) — screencast computing the October report and walking the triage path. Drafted: `media/video-01-reading-a-bad-send.md`.
- **Specifying a workflow before building it** (lesson 06) — screencast turning the checklist nurture into a specification and a test plan. Drafted: `media/video-02-spec-before-build.md`.
- **SPF, DKIM, DMARC alignment** (lesson 07) — explainer animation of an email's envelope, signature and visible From domain being checked. Drafted: `media/animation-01-dmarc-alignment.md`.
- **The engagement ladder and sunsetting** (lesson 05) — animation of contacts sliding down tiers and the sending rate improving after dormant suppression. Not drafted.
- **Deletion vs suppression** (lesson 09) — animation of a deleted contact reappearing via import, then blocked by a hashed suppression entry. Not drafted.

## Assessment ideas
- Quick calc (lesson 07): the practice-1 send (4,120 sent, 33 hard, 21 soft...) as an auto-graded item.
- Quick check (lesson 06): spot the missing anatomy part in three short workflow specs.
- Quick check (lesson 05): static or active list for five scenarios.
- Quick check (lesson 09): classify ten scenarios with the decision table (may we email? retention?).

## Changes applied in this pass
- `catalogue/courses/dm350/lessons/02-crm-fundamentals-and-data-model.md`, "Activities and the Timeline": "Five weeks" → "Two weeks".
- `catalogue/courses/dm350/lessons/02-crm-fundamentals-and-data-model.md`, "Importing Without Poisoning the Database" and Practice items 1-2: row count (eight) and property count (fifteen) corrected.
- `catalogue/courses/dm350/lessons/03-lead-generation-capture-and-qualification.md`, "Measuring Lead Quality, Not Lead Count": value per new contact corrected to $247 and distinguished from cost per client.
- `catalogue/courses/dm350/lessons/04-designing-an-email-campaign.md`, "Subject Lines and Preview Text": four character counts corrected; source of the 1,470 unreliable first names corrected.
- `catalogue/courses/dm350/lessons/05-segmentation-and-personalization.md`, "Measuring by Segment": bookings-per-contact comparison corrected.
- `catalogue/courses/dm350/lessons/06-automation-workflows-and-funnels.md`, "The Funnel, Mapped": median note added; "Delays": time-zone example corrected; "The Worked Workflow": END no longer moves lifecycle stage backwards.
- `catalogue/courses/dm350/lessons/07-deliverability-and-email-performance.md`, "Open Rate Is Not What It Used to Be": reconciled with lesson 06's day-6 branch.
- `catalogue/courses/dm350/lessons/08-chatbots-ai-insights-and-emerging-martech.md`, "Measuring the Bot": "four in ten" → "three in ten (12 of 41)".
- `catalogue/courses/dm350/lessons/09-privacy-consent-and-data-governance.md`, "Two Regimes, One Posture": California client count wording corrected.

## Open questions for the course owner
- **Possibly outdated, re-verify before publishing (not changed):** mailbox-provider bulk-sender requirements (authentication, one-click unsubscribe, 0.30% complaint threshold) in lesson 07 — the lesson already tells learners to check current guidance, which is right; Apple Mail Privacy Protection behaviour; SPF's ten-lookup limit (stable, but worth a "checked on" date); GDPR/CCPA summaries in lesson 09 (correctly framed as orientation, not advice).
- Which CRM does the program license (sequencing rationale item 4)? Lesson vocabulary is HubSpot-style.
- Should email marketing (lessons 04, 05, 07) stay in this course or move to a dedicated email course (sequencing rationale item 2)?
- Confirm the intended audience size for the Q3 campaign (3,840 vs 3,940) so lessons 04 and 05 can be aligned.
