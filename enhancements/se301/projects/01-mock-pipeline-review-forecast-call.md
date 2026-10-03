---
course_id: se301
project_id: se301-x01
title: "Mock Pipeline Review: Defend the Twelve-Deal Forecast to Your Manager"
kind: supplementary-project
status: draft
hours_estimate: 4
difficulty: core
related_lessons:
  - se301-07
  - se301-08
objectives:
  - Apply CRM hygiene rules that keep pipeline data trustworthy
  - Produce a defensible forecast from CRM opportunity data
competency_ids:
  - D4-S1-C03
---

## Scenario

It is week three of the quarter. You own the twelve-deal pipeline from Lesson 8 ($310,000 closed, $800,000 quota, $1,250,000 open). Before your Thursday pipeline review, your manager, **Renee Carter**, has asked for your forecast artifact. In the review she will play skeptic: every commit deal, every date on the last day of the quarter, and Arbor Health's $240,000 Discovery deal dated 30 September will be challenged.

You will (1) run a hygiene audit on a seeded copy of the pipeline, (2) produce the forecast artifact, and (3) defend it in a recorded 15-minute mock review.

## What you will produce

1. A hygiene audit table: the twelve deals scored against the Lesson 7 opportunity checklist, with defects and fixes.
2. A spreadsheet reproducing the Lesson 8 steps 1–6 after your hygiene fixes.
3. The half-page forecast artifact with all eight elements.
4. A recorded 15-minute mock review with a partner playing Renee.
5. A post-review note: what changed in your forecast as a result of the review, and why.

## Before you start

Load the twelve deals into any CRM from Lessons 3–5 (or a spreadsheet if you have no CRM access) and add these seeded defects, which your audit must find:

| Deal | Seeded defect |
|---|---|
| 4 Vale Manufacturing | Close date set to a date that has already passed; no open activity |
| 8 Stanton Logistics | Next step reads "follow up" |
| 9 Meridian Group | Only one contact associated; no economic buyer |
| 10 Cobalt Energy | Close date pushed three times (record the push history in a note) |
| 12 Orchard Systems | Amount is a round $110,000 placeholder; buyer has only described a 40-user team (your company prices at $1,200 per user per year) |
| 3 Arbor Health | Stage Discovery, close date 30 September, no decision timeline recorded |

**Persona card — Renee Carter (partner only)**

- Open with: "What's the number, and how did you get it?" Accept only a named method.
- Ask about Vale: "Why is a deal with a past close date in your commit?"
- Ask about Arbor: "Walk me through how a Discovery deal closes in the last week of the quarter."
- Ask about Cobalt: "Third push. Why is it still commit?"
- Ask about coverage: "How much pipeline do you need, by when?"
- If the rep's number equals or exceeds quota without explanation, say: "That looks like the quota. Convince me it isn't."
- Close with: "What do you need from me?" Reward a specific ask (e.g., an executive sponsor call for Calder, or help sourcing $220,000 of pipeline).

## Milestones

1. **Hygiene audit (60 min).** Score all twelve deals against the Lesson 7 opportunity checklist. Fix each defect in the system and log the fix. Re-qualify Cobalt and decide its category. Re-size Orchard's amount from the stated team size and log the change.
2. **Forecast (60 min).** Re-run Lesson 8 steps 1–6 on the cleaned data. Show all arithmetic.
3. **Artifact (30 min).** All eight elements, including named commit deals with "the one thing that has to happen," and at least two risks the arithmetic does not show.
4. **Mock review (15 min, recorded).**
5. **Post-review note (15 min).**

## Acceptance criteria

- [ ] All six seeded defects found and fixed, each with a logged reason.
- [ ] Orchard's amount is re-derived (40 × $1,200 = $48,000) and the forecast recomputed accordingly.
- [ ] Vale's close date is moved once to a date you believe, or the deal is closed out — with a reason.
- [ ] Arbor's stage-to-date mismatch is resolved: either the date moves out of the quarter or the stage is evidenced.
- [ ] The forecast names a method, states commit / forecast / upside separately, and does not equal quota.
- [ ] Coverage is stated in dollars of additional pipeline needed.
- [ ] The artifact is snapshotted with today's date.
- [ ] The recording shows each challenge answered with record evidence, not adjectives.

## Evidence checklist

- [ ] Hygiene audit table with before/after defect counts
- [ ] Forecast spreadsheet
- [ ] Forecast artifact (dated)
- [ ] Recording
- [ ] Post-review note
- [ ] Screenshots of the four Lesson 7 ritual views, empty after fixes

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Hygiene | Misses seeded defects or "fixes" by pushing dates | All six found; fixes follow Lesson 7 rules | Finds an additional defect not seeded and fixes it |
| Forecast arithmetic | Errors or a single method only | Steps 1–6 correct on cleaned data | Adds a sensitivity table (Calder slips; Negotiation rate 60%) |
| Honesty of the call | Forecast ≈ quota; risks unstated | Commit, forecast, upside separate; projected gap stated | Calls the miss in week three with a specific recovery plan |
| Defending under challenge | Defends with confidence, not evidence | Answers each challenge from the record | Concedes and re-categorizes live where Renee is right, then updates the artifact |
| The ask | None | Asks for something specific | Ask is tied to the biggest risk (e.g., Calder concentration) with a date |

## Stretch goals

- Add the Lesson 8 Practice 1 thirteenth deal (Ridgeway Transit) and present the before/after.
- Build a stale-opportunity automation (Lesson 6, worked spec 3) in your platform and show it would have flagged Vale.

## Reflection prompts

- Which fix reduced your forecast the most, and how did it feel to make it?
- Which of Renee's questions would you now ask yourself every Monday?

## Instructor notes

- Learners often "fix" Vale by moving its date to 30 September. Point out that this adds to date clustering — the risk Lesson 8 warns about.
- Orchard re-sizing tests the Lesson 7 rule on suspiciously round numbers; the new amount changes the weighted totals only slightly but the habit is the point.
- For a shorter session, skip the CRM load and run the audit on a printed table.
