---
course_id: sn250
media_id: sn250-a01
type: animation-storyboard
title: "What Happens When You Click Save"
target_runtime: "100 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - sn250-04
  - sn250-05
  - sn250-09
objectives:
  - Choose the correct business rule type and timing for a server-side requirement
  - Schedule recurring work and trigger script logic from platform events
competency_ids:
  - D7-S1-C01
  - D7-S1-C03
---

## Concept and misconception it fixes
A save is a timeline, not a moment. Learners mix up when each piece runs, which produces the classic bugs: setting `current` in an after rule (too late), calling `current.update()` in a before rule (recursion), reading `previous` in an async rule (null), sending email from a before rule (user waits), and expecting a client script to protect data (bypassed by imports). The animation lays every mechanism on one horizontal timeline with the user's wait highlighted.

## Visual language (shapes, colors with color-blind-safe palette, labels)
- Horizontal timeline, left to right. A thick bar above it labelled **"User is waiting"** spans from Save to the response.
- Lanes (top to bottom): Browser · Server transaction · Database · Background workers (async queue, event queue).
- Mechanism blocks: client scripts (sky blue `#56B4E9`, monitor icon), before rules (blue `#0072B2`, "B"), DB write (black cylinder), after rules (bluish green `#009E73`, "A"), async rules (orange `#E69F00`, clock icon), events (reddish purple `#CC79A7`, megaphone), script actions/notifications (yellow `#F0E442` with dark outline, ear icon).
- The record is a card labelled `INC0010023` that changes fields visibly (pills on the card).
- Every color has an icon + text label.

## Scenes
| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 0–8s | Incident form; user sets Priority 1 and assigns a group; cursor on Save. | Click; the "User is waiting" bar begins growing. | "You click Save. Here's everything that happens — and how long you wait for each part." |
| 2 | 8–18s | Browser lane: onSubmit client script block runs; a check mark. | Block flashes; card travels down to Server lane. | "First, in the browser: onSubmit client scripts. They can cancel the save — but only for people using this form. An import never runs them." |
| 3 | 18–32s | Server lane: three before-rule blocks ordered 100, 200, 300. Inside 100: `current.u_assigned_at = now`. | Card passes through blocks in order; a new pill appears on the card each time. Side panel shows a red-outlined ghost block `current.update()` looping back to start with a "⟲ recursion" label, then fading. | "Before rules run in order, lowest first, and change the record in flight — no update call needed. Calling update here would save the record from inside its own save." |
| 4 | 32–40s | Database lane: cylinder; card drops in; sys_id stamp appears on card. | Thud; "written" label. | "Now the database write. Only now does the record have its final, saved values." |
| 5 | 40–52s | After-rule block: arrows from the card to *other* cards (two `incident_task` cards close). A ghost `current.setValue(...)` arrow bounces off the already-written card. | Other cards update; ghost bounces. | "After rules run once the write is done. They're for other records. Changing current here is too late." |
| 6 | 52–60s | "User is waiting" bar stops; browser shows the saved form. | Bar caps with "response". | "And the user gets their form back. Everything after this point costs them nothing." |
| 7 | 60–75s | Background lane: async rule block picks up the card a moment later. Label: `previous = null`. An outbound REST call arrow leaves to a cloud icon and returns. | Clock icon ticks; arrow round-trips. | "Async rules run shortly after, on a background worker. Slow work belongs here — like calling another system. Note previous is null, so 'did it change?' goes in the rule's condition." |
| 8 | 75–90s | An after rule emits `gs.eventQueue('x_acme.critical_assigned', ...)`: a megaphone drops an event row into the event queue lane. Two listeners light: a script action and an email notification. | Event row changes label ready → processed; listeners fire in parallel. | "Or a rule just announces a fact. The event queue delivers it to every listener: a script action, a notification — added later, without touching the rule." |
| 9 | 90–100s | Whole timeline zooms out; five labelled callouts. | Callouts appear in sequence. | "Before: change this record. After: change others. Async: slow work. Events: many listeners. And none of the server side can be skipped." |

## Interaction variant (optional)
Scrubbable timeline (Rive or a simple web slider): learner drags a playhead and drops a requirement card ("stamp a field", "email the manager", "close child tasks", "call inventory API") onto the lane where it belongs; incorrect drops play the matching bug (recursion, late write, user wait).

## Production notes
- Keep order numbers and When values consistent with lesson 4 text. Do not show engines (approval/workflow engines at order 1000) unless a note explains them.
- The event name and parameters must match lesson 4's worked example: `x_acme.critical_assigned`, record, manager sys_id, number.
- Provide SRT captions and a text transcript; pacing ≥ 3 s per caption.
- Export a still of scene 9 as a one-page reference card for lesson 4.
