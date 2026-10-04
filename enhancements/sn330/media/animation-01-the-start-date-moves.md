---
course_id: sn330
media_id: sn330-a01
type: animation-storyboard
title: "The Start Date Moves: Anchored Activities on a Timeline"
target_runtime: "75 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - sn330-06
objectives:
  - Design a lifecycle event that coordinates onboarding or offboarding activities across departments
competency_ids:
  - D4-S1-C03
---

## Concept and misconception it fixes

Activities anchored relative to a driving date behave differently from fixed-date activities when the date moves or when the timeline is compressed. Misconceptions fixed: "due dates update themselves" (they only do if you configured rescheduling), and "a short-notice hire just gets overdue tasks" (that should be handled deliberately). Also shows conditional sets appearing per hire.

## Visual language (shapes, colors with color-blind-safe palette, labels)

- Horizontal timeline with a bold vertical "Start date" pin labelled "Day 0".
- Activities as labelled pill shapes positioned by due date, each with an owner icon (laptop for IT, building for Facilities, person for New hire, clipboard for HR).
- States: open (outlined pill), complete (filled pill with check and the word "Done"), overdue (pill with a warning triangle and the word "Overdue").
- Palette: Okabe-Ito blue (#0072B2) for always-on sets, orange (#E69F00) for conditional sets, vermillion (#D55E00) only together with the warning triangle; a "Today" marker as a dashed vertical line.

## Scenes

| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 8 s | Timeline appears. Start date pin at Day 0. "Today" marker at Day -28. | Draw-on. | "Meridian Logistics hire: start date in four weeks." |
| 2 | 10 s | Always-on pills drop into place: Right-to-work (-14), Background check (-14), Order laptop (-10), Workspace (-5), Badge (0), Code of conduct (+7), Benefits (+1 to +30 as a bar). | Pills fall and snap to positions, each attached to the pin by a thin dotted line. | "Every activity is tied to the start date, not to a calendar day." |
| 3 | 8 s | Second hire timeline below, labelled "Relocating hire", with Today at Day -28. Same always-on pills plus orange "Relocation vendor (-30)" set; because its anchor is already past, mark it "Due now" with a coordinator escalation. Third hire: "Manager hire" with orange "People-leader training". | Rows slide in; relocation activity moves to Today with an escalation arrow. | "Conditional sets appear for matching hires. A relocation task already due needs immediate handling." |
| 4 | 10 s | Back to hire 1. Today marker moves to Day -14; Right-to-work and Background check become Done. | Today line slides; pills fill. | "Two weeks pass. Pre-boarding is done." |
| 5 | 12 s | Start date pin drags one week later. Open pills (laptop, workspace, badge, code of conduct, benefits) slide right with it, following their dotted lines. Done pills stay put. A bell icon labelled "Coordinator notified" appears. | Pin drag; open pills follow; done pills stay. | "The start date moves. Configured well: open activities reschedule, completed ones stay, the coordinator is told." |
| 6 | 8 s | Replay scene 5 in "unconfigured" mode: pin moves, nothing else moves; dotted lines stretch and snap; caption "Nothing happened". | Pin moves alone. | "Not configured: every due date is now wrong, and nobody knows." |
| 7 | 12 s | New hire 4 timeline with Today at Day -3. -14 and -10 pills appear left of Today with warning triangles and "Overdue". They then animate to the Today line, labelled "Due now" with an escalation arrow to the coordinator. | Pills appear overdue, then slide to Today. | "Short notice: never create work already overdue in silence. Make it due now and escalate." |
| 8 | 7 s | Summary card. | Text builds. | "Anchor to the date. Decide what moves. Handle short notice on purpose." |

## Interaction variant (optional)

Scrubbable timeline: learners drag the start date pin and toggle "reschedule open activities" on or off, then drag the Today marker to create compressed timelines. A prompt asks them to predict which pills move before releasing the pin.

## Production notes

- Actual reschedule behavior on date change depends on configuration and release; the animation shows the *designed* behavior lesson 6 recommends, not a guaranteed default (see review.md open questions).
- Business-day anchoring is not shown to keep the frame readable; mention it in the caption track or a follow-up card.
- Provide a reduced-motion version that cuts between states.
