---
course_id: se305
project_id: se305-x02
title: "Dashboard Teardown: From Fourteen Tiles to Six That Change Your Week"
kind: supplementary-project
status: draft
hours_estimate: 4
difficulty: core
related_lessons:
  - se305-02
  - se305-05
objectives:
  - Build a CRM dashboard that answers a stated question rather than displaying everything
  - Choose the small set of sales metrics that should drive a rep's weekly decisions
competency_ids:
  - D4-S1-C03
  - D4-S1-C04
  - D1-S1-C01
---

## Scenario

Your team at Meridian Freight Software inherited a "Rep Performance" dashboard built by someone who has since left. It has fourteen tiles, and nobody has opened it in a month. Your manager asks each rep to propose a replacement weekly dashboard for themselves, using the Meridian dataset from Lessons 2–3 (25% win rate, $154,000 Q4 gap, 32 open opportunities, 7 with stale close dates).

## What you will produce

1. A teardown table: each of the 14 tiles scored against Lesson 2's four tests (actionable, attributable, timely, hard to game) and given a verdict of keep / rebuild / move to monthly / delete, with a one-line reason.
2. A specification for each tile on your new weekly dashboard (six tiles maximum): decision → question → metric → filter → threshold → action.
3. A gaming test for each tile, with the paired tile or filter change that closes the loophole.
4. The dashboard built in any CRM you can access (or a mock-up if you can't), showing the readings from the Meridian data.
5. A 150-word note to your manager explaining what you deleted and why.

## Before you start

**The inherited dashboard, 14 tiles**

1. Calls made this week
2. Emails sent this week
3. Total open pipeline (unweighted)
4. Pipeline by stage (pie chart)
5. Lifetime pipeline created
6. Team leaderboard by closed-won
7. Opportunities closing this quarter (filter: close date on or before quarter end)
8. Win rate, trailing 12 months, by count
9. Average deal size (mean)
10. Company ARR
11. Opportunities created this month
12. Open opportunities with no activity in 14 days
13. Meetings booked this week
14. Weighted pipeline (default CRM probabilities 10/30/60/90%)

## Milestones

1. **Score all 14 (40 min).** Be explicit about the failures, e.g. tile 4 (a sequence drawn as a circle), tile 7 (catches stale dates), tile 14 (uncalibrated weights).
2. **Specify (60 min).** Up to six weekly tiles. At least one must be a hygiene tile that makes another tile trustworthy. Rate metrics go on a separate monthly list, not the weekly one.
3. **Gaming test (30 min).** For each tile: "What could I do to make this look good without selling more?" Then the fix.
4. **Build and read (45 min).** Populate from the Meridian figures. Coverage should read 2.70x clean, not 3.97x.
5. **Manager note (15 min).**

## Acceptance criteria

- [ ] All 14 tiles scored, each with a verdict and reason.
- [ ] Tiles 3, 4, 5, 6, and 10 deleted or moved off the weekly view, with reasons tied to the four tests.
- [ ] Tile 7 rebuilt with a filter of close date between today and quarter end, with the threshold set at 1 ÷ win rate.
- [ ] Tile 14 either deleted or rebuilt using cohort probabilities (25.0 / 41.4 / 66.7 / 80.0%) and labelled as a portfolio estimate.
- [ ] Every weekly tile has all six specification lines, with a filter precise enough for someone else to rebuild it.
- [ ] Each tile has a gaming loophole and a fix.
- [ ] The whole dashboard fits on one screen, with action tiles at top left.

## Evidence checklist

- [ ] Teardown table
- [ ] Tile specifications
- [ ] Gaming-test table
- [ ] Screenshot or mock-up with readings
- [ ] Manager note

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Selection | Keeps most tiles | Cuts to six or fewer, each passing the four tests | Explains which deleted tile someone will ask for back, and what it would displace |
| Specification | Metric names only | Full six-line chain per tile | Thresholds derived from the rep's own rates, not round numbers |
| Hygiene awareness | No hygiene tile | A date-hygiene tile paired with coverage | Notes which tiles flatter on dirty data and in which direction |
| Gaming test | Skipped or generic | Specific loophole and fix per tile | Fix uses a paired snapshot tile, like the time-to-no example in Lesson 5 |
| Communication | Lists deletions | Ties each deletion to a decision it fails to support | Note is under 150 words and ends with what you will review monthly instead |

## Stretch goals

- Design the four-tile monthly dashboard that complements the weekly one.
- Rebuild the weekly dashboard for Dana Okafor's territory from the Lesson 6 capstone and compare thresholds.

## Reflection prompts

- Which deleted tile felt most like evidence of hard work, and why does that make it a bad weekly metric?
- Which of your tiles could still mislead you, and how would you notice?

## Instructor notes

- Learners often keep "meetings booked" as a leading indicator. Accept it only if paired with a conversion check, such as meetings that became qualified opportunities.
- Native CRM report builders differ. Grade the specification, not the screenshot.
- For a shorter session, skip the build.
