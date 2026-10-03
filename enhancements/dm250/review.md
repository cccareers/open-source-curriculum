---
course_id: dm250
title: "Social Media Marketing — Enhancement Review"
reviewed_lessons: 7
status: draft
---

## Summary
A strong, numerate course: every lesson works the same Fernwood Coffee Roasters case, shows its arithmetic, and ends in a decision rather than a description. Nearly all of the arithmetic checks out. The fixes needed are a handful of internal-consistency errors between lessons (the same post reported with two different reach figures, a pillar check whose slot counts did not add up, a date that disagreed with the calendar). The biggest opportunity is supplied practice data: learners are asked to analyse "a month of data" but only lesson 07 hands them a complete dataset, so the projects drafted here supply CSV-style case files.

## Clarity issues
| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| dm250-03 | "One Idea, Five Formats" (Container 4) | Facebook copy invited people to the grind clinic on "Tuesday the 15th"; the calendar lists the clinic on Wed Jul 15 (and Jul 15 2026 is a Wednesday). | Changed to "Wednesday the 15th". | Applied |
| dm250-03 | "The Calendar" (pillar check) | Pillar check claimed 20 slots but listed 8+6+5+3 = 22, and the Brew Better count (8) did not match the calendar (5 Instagram + LinkedIn Brew Better slots). | Recounted from the calendar: Brew Better 5 (25%), Cafe Life 6 (30%), Wholesale 6 (30%), Origin 3 (15%) = 20. Added a check line and a note that Brew Better is the larger shortfall, with a decision. Surrounding prose ("caught a structural conflict") still holds. | Applied |
| dm250-05 | "The organic evidence gate" (eligibility table) | Jul 24 photo was marked "Local only (1.2x)" but its 7.4 saves/1k fails the 1.2x local gate (13.1). | Changed saves from 22 to 40 (13.4/1k) so the row is consistent with its verdict and still fails the national gate. | Applied |
| dm250-05 / dm250-06 | Gate table vs. "The worked case" | The "One morning, three cafes" Reel appears as 4,410 reach / 40 saves / 27 shares in lesson 05 and as Post A with 38,400 reach / 42 saves / 88 shares in lesson 06. | Aligned lesson 05's row to lesson 06's figures (38,400 reach; 1.1 saves/1k; 2.3 shares/1k; still "No"). Lesson 06 is the more developed use. | Applied |
| dm250-06 | "The worked case that makes this concrete" | "at one third and a half the production cost" is garbled. | "under a third of the production cost ($28 against $98)". | Applied |
| dm250-06 | "The Monthly Report" | Followers row labelled "net" but showed +9,610 / +9,850, which are totals. | Relabelled "Followers (end of month)" with unsigned totals. | Applied |
| dm250-06 | "Baselines Beat Month-Over-Month" vs. the July report | The lesson's rule is "below about 30 results, refuse a percentage change", but the report computes +52% and +62% on June bases of 27 and 21. | Either add a footnote to the report or note it as a deliberate teaching trap in Practice Part 5. | Proposed |
| dm250-05 | "Budget as a Planning Decision" vs. "The Q3 Overlay Plan" | Budget split allocates $1,440 to amplification, but the overlay plan holds back exactly $1,440 and puts $1,260 on assets 1-2. Learners will try to reconcile the two tables. | Add one sentence: the held-back $1,440 is the amplification line, released monthly to proven assets. | Proposed |
| dm250-02 | "Write the Objective Before You Look at a Platform" | Solid; no change. "Outcome/audience/horizon" could be shown once as a fill-in template for weaker writers. | Optional template. | Proposed |

## Depth and coverage gaps
- **No supplied dataset for lessons 04 and 06 practice.** Lesson 06 Part 5 says "real or the Fernwood July figures"; learners without a live account have only the summary rows. A post-level CSV case file would let them compute every ratio themselves (objective: Measure social campaign effectiveness with platform and web analytics). Drafted as project x01.
- **Sentiment coding is described but never practised on raw text.** Lesson 04 gives coding rules and counts but no sample of actual mentions to code. A 30-mention coding drill with a second-coder agreement check would make the "code consistently" rule concrete (objective: Manage a community and monitor brand sentiment). Included in project x02.
- **Paid overlay creative handoff.** "What Changes When a Post Becomes an Ad" lists rules but shows no before/after of an organic caption rewritten as ad copy. One worked example would help (objective: Plan and target a paid social campaign that supports an organic strategy).
- **Accessibility in social formats** is limited to alt text. Captions on Reels and contrast of burned-in text are mentioned only in lesson 05; a one-paragraph note in lesson 03's copy section would align with dm270.
- **Misconception worth naming explicitly in lesson 06:** "engagement rate went up, so the content got better" when the denominator changed (follower vs. reach). The lesson covers the mechanics; a short check item would test it.

## Proposed additional projects
- **x01 Fernwood August Analytics Case File** (drafted) — post-level and web-analytics CSV data for August, learner builds the chain, the report, and three decisions.
- **x02 Grind Clinic Community Week** (drafted) — a week of inbound items and 30 raw mentions to triage, reply to, and sentiment-code, with a second-coder agreement check.
- Holiday gift-subscription campaign brief: a four-week calendar plus paid overlay for a December gift-subscription push, reusing the gate and cell-sizing method.
- Platform re-score for a new platform launch: apply the seven-axis framework to a platform not in the table and write the decision memo with a revisit trigger.
- LinkedIn wholesale content sprint: eight posts for June's wholesale pillar, each with a spine and a measurement plan tied to wholesale enquiries.

## Video and animation opportunities
- **Reading a post down the chain** (lesson 06) — screencast walking Post A vs Post B through exposure → outcome. Drafted: `media/video-01-two-posts-down-the-chain.md`.
- **One idea, five containers** (lesson 03) — screencast building the grind spine into carousel, Reel script, LinkedIn post, Facebook post, Story frames. Drafted: `media/video-02-one-idea-five-containers.md`.
- **The chain draining** (lesson 06) — explainer animation of losses compounding link by link, then the same funnel with one link fixed. Drafted: `media/animation-01-the-leaking-chain.md`.
- **Capacity arithmetic** (lesson 02) — whiteboard: 12 hours shrinking as reply pass and reporting are subtracted first, then platforms competing for the remaining 7.5. Not drafted.
- **Sentiment baseline and thresholds** (lesson 04) — animation of NSS line inside a WATCH/ACT band, July breaking out. Not drafted.
- **Cell sizing** (lesson 05) — animation of $1,260 split into 12 tiny cells vs 4 readable cells. Not drafted.

## Assessment ideas
- Quick check (lesson 06): give reach, impressions, followers and engagements; ask for the three engagement rates and which one to standardise on.
- Quick check (lesson 05): five posts with saves/shares/reach; apply the 1.5x gate and the 1.2x local gate.
- Triage drill (lesson 04): ten items, learner names the branch and the owner in under five minutes; scored against a key.
- Rubric line for every written deliverable: "Every number traceable to a supplied value through visible arithmetic" (already the lesson 07 standard; reuse it course-wide).

## Changes applied in this pass
- `catalogue/courses/dm250/lessons/03-social-content-planning-and-creation.md`, "One Idea, Five Formats" (Container 4): clinic day corrected to Wednesday the 15th.
- `catalogue/courses/dm250/lessons/03-social-content-planning-and-creation.md`, "The Calendar": pillar check recounted from the calendar, totals check added, note and decision extended for the Brew Better shortfall.
- `catalogue/courses/dm250/lessons/05-paid-social-campaigns.md`, "The organic evidence gate": Jul 24 saves corrected so the local-gate verdict holds; Jul 31 row aligned to lesson 06's Post A figures.
- `catalogue/courses/dm250/lessons/06-social-media-analytics.md`, "The worked case that makes this concrete": garbled production-cost comparison rewritten.
- `catalogue/courses/dm250/lessons/06-social-media-analytics.md`, "The Monthly Report": followers row relabelled as end-of-month totals.

## Open questions for the course owner
- **Possibly outdated platform specifics (not verified in this pass):** the platform comparison table in lesson 02 (discovery mechanisms, demographics, link tolerance) and the attribution windows in lesson 06 ("often seven days" click, "often one day" view) are reasonable as of writing but change frequently. Recommend a dated "last checked" line on the table and a pointer to each platform's current help page rather than new specifics.
- Lesson 04's "one in five to one in ten" complainers-to-affected ratio is labelled as a working assumption; keep the label, do not cite it as research.
- The Jul 31 Reel now shows 38,400 reach in lesson 05. If the owner prefers the original 4,410 figure, lesson 06's Post A needs to change instead (it carries more downstream arithmetic, so changing lesson 05 was the smaller edit).
- Sequencing rationale flags overlap with dm230 on paid social; still unresolved by the owner.
