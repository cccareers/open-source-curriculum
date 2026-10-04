---
course_id: sn301
media_id: sn301-a01
type: animation-storyboard
title: "Where Test Data Goes: Step Outputs and Rollback"
target_runtime: "80 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - sn301-03
objectives:
  - Build an ATF test with steps, assertions, and test data that cleans up after itself
competency_ids:
  - D10-S1-C04
---

## Concept and misconception it fixes

Two invisible mechanics: (1) a step's output (the record it created) is handed to later steps by reference, so no sys_id is hard-coded; (2) ATF rolls back what the test created, but cannot pull back side effects that already left the instance or async work that runs after the test. Misconceptions fixed: "I need to paste a sys_id into the query" and "rollback undoes everything, including emails."

## Visual language (shapes, colors with color-blind-safe palette, labels)

- Steps: rounded rectangles in a vertical stack, numbered 1 to 4, dark grey outline.
- Created record: a card icon labelled `INC (ATF: network outage)`, Okabe-Ito blue (#0072B2).
- Data pill / reference: a dashed line with a small plug icon, Okabe-Ito orange (#E69F00).
- Rollback: a curved arrow sweeping cards back into a "rollback log" box, vermillion (#D55E00), always paired with the text "rolled back".
- Things that escape: envelope icon (email) and a cloud icon (external REST), bluish green (#009E73), labelled "already sent".
- Pass/fail shown with check and cross shapes plus the words, never color alone.

## Scenes

| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 6 s | Empty Incident table drawn as a grid, label "Incident table: 0 ATF rows". | Grid fades in. | "Before the test: no ATF records." |
| 2 | 8 s | Step stack appears on the left: 1 Impersonate, 2 Create a Record, 3 Record Query, 4 Field Values Validation. A small person icon labelled `atf.fulfiller` docks onto step 1. | Steps drop in one by one; person icon slides onto step 1. | "Step one: act as the fulfiller, not as admin." |
| 3 | 10 s | Step 2 pulses; a blue record card is created and flies into the grid. A copy of a tag "output: record" stays attached to step 2. A small entry "INC created" is written into a rollback log box at bottom right. | Card flies into grid; log entry types in. | "Step two creates the incident, and ATF writes it down." |
| 4 | 10 s | Orange dashed line runs from step 2's output tag to step 3's condition slot. A ghosted text "sys_id = 46d4..." appears in the slot, gets a cross through it, and is replaced by the plug icon. | Line draws; ghost text crossed out. | "Step three does not paste an ID. It plugs into step two's output." |
| 5 | 8 s | Step 3 query beam scans the grid, highlights only the blue card, shows "1 match, Assignment group = Network" and a check with "Pass". Step 4 checks "Priority = 1 - Critical" with a check and "Pass". | Beam sweeps; checks appear. | "Each assertion checks one claim against that record." |
| 6 | 10 s | Alternate branch: rewind to step 3 with expected group "Database". Beam finds no match; cross and "Fail" appear; step 4 greys out with label "not attempted". | Rewind effect; step 4 dims. | "If a step fails, the test stops. Later steps never run." |
| 7 | 10 s | Test ends. Vermillion rollback arrow sweeps the blue card out of the grid back into the log; grid label returns to "0 ATF rows", text "rolled back". | Sweep animation. | "When the test ends, pass or fail, ATF rolls back what it created." |
| 8 | 12 s | Replay with a business rule that also sends an email and calls an external REST endpoint. Envelope and cloud icons fly out of the instance boundary before the end. Rollback sweep returns the card but the envelope and cloud stay outside, labelled "already sent". A clock icon then launches a late async job card after the sweep, labelled "ran after rollback". | Icons cross the instance border; sweep cannot reach them. | "Rollback cannot reach what already left the instance, or work that runs after the test ends." |
| 9 | 6 s | Summary card: "Create your own data. Reference outputs. Prefix with ATF:. Test where email and integrations are safe." | Text builds line by line. | "Create your own data, reference it, and test somewhere safe." |

## Interaction variant (optional)

A step-through H5P "Course Presentation" where the learner clicks each step to advance, and at scene 4 must choose between "paste the sys_id" and "use step 2 output" before the animation continues. At scene 8, a multiple-choice prompt: "Which of these does rollback undo?" (record, email, REST call, late async job).

## Production notes

- Keep the grid and step stack in fixed positions across scenes so the viewer tracks objects, not layouts.
- Do not show a real sys_id from a real instance; the ghost text is illustrative.
- The exact boundary of what ATF rollback tracks (for example, records inserted by business rules triggered synchronously by a test step) should be confirmed by the course owner before final render; see review.md open questions.
