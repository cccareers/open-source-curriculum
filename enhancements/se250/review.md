---
course_id: se250
title: "Advanced Sales Presentations & Storytelling — Enhancement Review"
reviewed_lessons: 8
status: draft
---

## Summary

An outstanding, tightly integrated course: the brief (L2) specifies the narrative (L3), which specifies the charts (L4), which specify the deck (L5), and two running cases (Bay Ridge worked, Fairmount practiced) carry all the way through to a new capstone account (Presidio). I found one arithmetic overstatement in the Bay Ridge narrative and an arithmetic error plus an internal data inconsistency in the capstone. The biggest opportunity is modeled delivery: Lessons 6–7 describe pauses, returns, and reframes that learners should see and hear before recording themselves.

## Clarity issues

| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| se250-03 | "Worked example: the Bay Ridge arc" — Beat 6 | "4,000 or so visits a year come back as capacity — which is roughly the overtime line." 4,000 × $180 ≈ $720k; overtime is 9% × $19.8M ≈ $1.78M. Overstated by ~2.5×, in a course that stresses "survives being checked." | Restated as ~$720,000, roughly 40% of the $1.78M overtime line. | Applied |
| se250-08 | "Hints" — "Carla is your best evidence…" | "Roughly 540 supervisor-hours a year." The notes say 45 min per supervisor per shift across 3 shifts and 4 supervisors: 45 × 3 × 4 = 540 *minutes a day*, i.e. thousands of hours a year — or ~750 h/yr if each supervisor covers one shift. 540 hours a year is not derivable either way. | Removed the specific figure; hint now asks learners to compute it and state their shift and operating-day assumptions. | Applied |
| se250-08 | "The data set" — timing by plant | Plant-level "2+ hours late" shares imply ≈ 9,470 late batches (9,100×9% + 8,400×26% + 7,200×61% + 6,300×33%), but the network cut lists 8,700 batches entered "more than 2 hours after." Sharp learners will find this mid-capstone. | Align the two (e.g., change the network figure to ~9,500 or adjust shares), or add a footnote explaining the difference. | Proposed |
| se250-04 | "Colour is an argument" | "Roughly one in twelve men" is accurate (~8%), but the sentence implies only men are affected. | Add "(and about one in two hundred women)". | Proposed |
| se250-05 | "Making it survive the forward" | Speaker-notes warning is good; PDF export can also embed notes in some tools' "notes pages" mode. | Add "export slides only, not notes pages." | Proposed |
| All lessons | End of lesson | No self-check. | Added "Check your understanding" to se250-02 through se250-07. | Applied |

## Depth and coverage gaps

- **Modeled openings and returns.** Lesson 6 gives scripts but no audio/video model of acknowledge–handle–return. Drafted se250-v01 for "Deliver a presentation with presence and absorb interruptions without losing the thread".
- **Rehearsal before the capstone.** Learners first record under interruption in the graded capstone. Drafted se250-x01 (Fairmount gauntlet) for "Deliver a presentation with presence and absorb interruptions without losing the thread" and "Lead a presentation with an insight that reframes the buyer's view of their situation".
- **Visual before/after.** Lesson 4 describes chart rebuilds in prose only; the images referenced (`chart-choice.png`, etc.) are not before/after pairs. Drafted se250-a01 for "Turn a data set into a visual argument a buyer can read in seconds".
- **Video-call delivery.** Lesson 6 covers video in one paragraph, yet both practice and capstone meetings are video calls. A short section on screen-share mechanics (camera position, sharing a single window, checkpoint questions) would help.
- **Accessibility of decks.** Lesson 5 mentions an accessibility floor; a worked checklist (contrast ratio, reading order, alt text) would make "Build a deck in presentation software that survives being read without you in the room" more concrete.

## Proposed additional projects

- **Drafted — se250-x01** `projects/01-fairmount-interruption-gauntlet.md`: five-minute and twenty-minute Fairmount deliveries with a scripted interruption panel.
- **Drafted — se250-x02** `projects/02-deck-teardown-clinic.md`: tear down a 26-slide standard deck and rebuild a 10–13 slide Fairmount deck that passes the headline and read-without-you tests with two strangers.
- Not yet drafted — **Insight lab**: build and pre-test one commercial insight on a "champion" before a panel delivery, scored on Lesson 7's three tests.
- Idea: **Executive memo alternative** — two-page prose leave-behind for Bay Ridge, per Lesson 5's two-artifact option.

## Video and animation opportunities

- **Drafted — se250-v01** "The First Ninety Seconds at Bay Ridge" (se250-03, se250-06), hybrid weak/strong take.
- **Drafted — se250-a01** "From Report to Argument" (se250-04), Motion Canvas chart rebuild.
- **Drafted — se250-v02** "Reframe Without Humiliation" (se250-07), hybrid: accusation vs. six-step reframe with Dana and Walt.
- Idea: screencast of the six-step build order — index cards to grey boxes to evidence — in a generic presentation tool (se250-05), tool-agnostic per the capstone constraint.

## Assessment ideas

- Headline-only quiz: given ten slide titles, classify label vs. assertion and rewrite three.
- Two-second test kit: twelve charts flashed for two seconds; learners write the claim.
- Peer rubric for interruption handling: return sentence present (Y/N), under 90 s (Y/N), thread resumed (Y/N).

## Changes applied in this pass

- `catalogue/courses/se250/lessons/03-story-structure-for-a-sales-narrative.md`, "Worked example: the Bay Ridge arc": corrected the overtime-capacity claim.
- `catalogue/courses/se250/lessons/08-project-deliver-a-recorded-customer-presentation.md`, "Hints": removed the incorrect 540 supervisor-hours figure and asked learners to compute and state assumptions (two sentences).
- Added "Check your understanding" to `02-what-a-sales-presentation-has-to-do.md`, `03-story-structure-for-a-sales-narrative.md`, `04-turning-data-into-a-visual-argument.md`, `05-building-the-deck.md`, `06-delivery-presence-and-interruptions.md`, `07-insight-led-presenting.md`.

## Open questions for the course owner

- Capstone data: which way do you want to reconcile the timing-by-plant shares with the 8,700-batch network figure?
- Capstone Yakima supervisor pattern: is it 4 supervisors per shift (3 shifts) or 4 supervisors total? Clarify so the hours are derivable.
- The Bay Ridge persona names (Dana, Marcus, Priya) reuse first names from se101/se203 with different roles; intentional?
- "Comparable operators reach the mid-70s" and the 3-operator aggregate are fictional within the scenario; confirm they should stay labeled as scenario data.
