---
course_id: se301
media_id: se301-v01
type: video-script
title: "After the Call: Logging Harlan Freight Badly and Well"
format: screencast
target_runtime: "7 min"
related_lessons:
  - se301-02
  - se301-07
objectives:
  - Explain how a CRM models a sale — objects, records, stages, and their relationships
  - Apply CRM hygiene rules that keep pipeline data trustworthy
competency_ids:
  - D3-S1-C04
  - D4-S1-C03
---

## Purpose

After watching, the learner can turn a just-finished sales call into correct CRM records — the right objects, picklists instead of free text, two-sided activity association, a stage move justified by an exit criterion, and a dated next step.

## Audience and prerequisites

Learners who have read Lessons 2 and 7. Uses the Waypoint Fleet Systems / Harlan Freight scenario from the Lesson 9 project (event 4: demo held; Dana confirms the product addresses compliance reporting, names her VP as approver; decision in about six weeks; 140 vehicles).

Platform-neutral: record in a generic CRM UI mock-up (no real vendor UI), with the Lesson 2 vocabulary map shown as a sidebar so viewers can translate to Salesforce, HubSpot, or GoHighLevel.

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Host webcam inset; screen shows a generic CRM. | "You just finished the Harlan Freight demo. Dana Whitfield confirmed the product solves their compliance reporting problem, named her VP as the approver, and said a decision is about six weeks out. Here's the two minutes after the call, done two ways." |
| 0:20 | Title: "Take 1 — the rushed log." | |
| 0:23 | Cursor opens the deal; types in Notes: "great demo!! dana loved it. VP needs to sign off. prob closing EOQ. 140 trucks maybe more" | Host VO: "Watch what goes where." |
| 0:35 | Drags the deal from Solution Validation straight to Negotiation on the board. | |
| 0:40 | Sets Close Date to the last day of the quarter. Amount left at the placeholder $50,000. | |
| 0:45 | Logs a "Meeting" activity attached to Dana's contact only. Closes the record. No task created. | |
| 0:50 | Freeze. Five callouts, each numbered with an icon. | Host VO: "One: the facts went into a free-text note — nobody can filter on 'VP needs to sign off.' Two: the deal jumped two stages because the call felt good, not because an exit criterion was met. Three: the close date is the end of the quarter, not the buyer's six weeks. Four: the amount is a placeholder. Five: the meeting is attached only to Dana, so the deal looks dead to your manager — and there's no next step." |
| 1:40 | Title: "Take 2 — the professional log." | |
| 1:43 | Cursor searches "Harlan" before anything else; finds the existing Company and Deal. | Host VO: "Search first. Always." |
| 1:50 | Opens the deal. Logs the meeting, associating it to Dana's contact *and* the deal. Note text on screen: "Demo held with Dana Whitfield (Ops Mgr). Confirmed: product addresses DOT compliance reporting problem (her words: 'this is the report I rebuild every month'). Approver: VP Operations, name TBC. Decision expected ~6 weeks (week of 18 Nov). Scope: 140 vehicles." | "The note is written for a stranger: who, what they confirmed in their words, who approves, when." |
| 2:15 | Sets picklist fields: Business Pain = "Compliance reporting"; Decision Process = "VP approval"; Target Decision Date = 18 Nov. | "The facts that matter go into structured fields, so reports and automations can see them." |
| 2:30 | Opens the stage definition table in a side panel (Lesson 7). Checks the Solution Validation exit criteria: "Demonstration completed with technical evaluator present" — unchecked; "Buyer confirmed solution meets stated requirements" — checked. | "Can we move to Proposal? Read the exit criteria. Dana confirmed the requirements — but the technical evaluator wasn't on the demo. One criterion isn't met. The deal stays in Solution Validation." |
| 2:55 | Leaves stage unchanged. Adds a note: "Stage held: tech evaluator not yet present." | "Refusing to move a stage is a hygiene skill, not a failure." |
| 3:05 | Amount: replaces $50,000 placeholder with 140 × per-vehicle price; caption "per-vehicle price from your company's price book." | "Amount follows your team convention and the real scope — not a round placeholder." |
| 3:20 | Close date: 18 Nov, the buyer's stated window. | "The buyer's process sets the date, not your quarter." |
| 3:30 | Adds VP Operations as a second contact with role "Economic buyer (approver)"; name field "TBC". | "Two contacts, with roles. The VP is named as soon as you know who it is." |
| 3:45 | Creates task: "Book tech eval session with Harlan IT + VP intro — due Thu." Next Step field: "Tech eval session w/ Harlan IT; VP intro requested — Thu 31 Oct." | "Every open deal leaves with a dated next step and an open activity." |
| 4:05 | Split screen: Take 1 record vs Take 2 record. A report preview below shows Take 2 appears in "Deals by stage" correctly and in "Deals with an economic buyer identified." Take 1 appears in "Close date in quarter" and nowhere useful. | Host VO: "Same call. Take two took about ninety seconds longer. But only take two can be forecast from, handed over on Monday, or reported on in six months." |
| 4:40 | Host to camera. | "Notice what wasn't automation. Everything here is judgment — which criterion was met, what the buyer said, what the date really is. Automation can remind you; it can't do this part." |
| 5:00 | Practice prompt. | "Pause. Event 16 in the project: Harlan's finance committee moves back a week. Which fields change, and which must not?" |
| 5:15 | Sample answer. | Host VO: "The close date moves once, to the new date, and you note the push. The stage does not change — nothing about the buyer's state changed." |
| 5:35 | Recap card: search first; structured fields; two-sided association; stage by exit criteria; buyer's date; real amount; roles; dated next step. | |
| 5:55 | End card. | |

## On-screen assets and B-roll

- Generic CRM mock-up (Figma or similar) with Deal, Contact, Company, Activity panels — no vendor branding.
- Lesson 2 vocabulary map as a sidebar overlay.
- Lesson 7 stage-definition side panel with checkboxes.
- Report preview tiles.

## Accessibility

- Captions; cursor movements described in narration ("searches for Harlan").
- Callouts numbered with icons and text; checked/unchecked criteria use ✓/✗ glyphs plus text.
- Zoom to 150% on all form fields; keyboard shortcuts shown when used.
- Transcript with the full note text from 1:50.

## Check for understanding

1. Why did the deal stay in Solution Validation? *(Answer: the exit criterion requiring the technical evaluator at the demo was not met.)*
2. Why attach the meeting to both Dana and the deal? *(Answer: an activity attached only to the contact is invisible from the deal, which then looks unworked.)*
3. What's wrong with a close date at the end of the quarter here? *(Answer: it reflects your period, not the buyer's stated six-week decision window.)*
