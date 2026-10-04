---
course_id: sn201
media_id: sn201-v02
type: video-script
title: "Capture, Preview, Commit: Promoting an Update Set Without Surprises"
format: screencast
target_runtime: "8 min"
related_lessons:
  - sn201-08
objectives:
  - Move an application between instances using update sets and source control
competency_ids:
  - D10-S1-C02
---

## Purpose
After watching, the learner can capture work in a named update set, audit its contents, move it to another instance, read the preview, resolve a collision deliberately, and verify on the target.

## Audience and prerequisites
sn201 learners at lesson 8 with the Facilities Work Orders app. Two instances on screen (source and target PDIs, labelled with banner colours and names).

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Two browser windows side by side, banners "SOURCE — dev" and "TARGET — test". | "On the left, where we build. On the right, where facilities will test. Nothing on the right changes unless we move it there on purpose. Here's how." |
| 0:15 | Source: header shows application picker = Facilities Work Orders; update set picker reads "Default". Red outline. | "First, look at the header. Application: Facilities Work Orders. Update set: Default. Stop. Anything I build now lands in a set that's not meant to be promoted." |
| 0:35 | System Update Sets > Local Update Sets > New. Name "Facilities Work Orders v1.0 — release 1"; description listing contents. Click **Submit and Make Current**. Header now shows it. | "New update set, named so a stranger knows what it is a year from now, with a description of what it should contain. Submit and Make Current. The header now shows our set — and because update sets belong to a scope, it's a Facilities Work Orders set." |
| 1:05 | Add field `follow_up_required` (True/False) to work_order; add to form. | "Make a change: a new True/False field, and put it on the form." |
| 1:20 | Open the update set; Customer Updates related list shows sys_dictionary, sys_documentation, sys_ui_section/element records. | "Open the set. Customer updates: the dictionary entry, its label, the form section. Each is an XML payload of a configuration record — and only the latest version of each travels." |
| 1:45 | Highlight an unexpected row: a global business rule touched while debugging. | "And here's something I didn't intend: a global business rule I edited while debugging. If this ships, it changes test. The audit is the step everyone skips and the one that saves you. I'll move that update to a separate set." |
| 2:15 | Show part records absent from the set; callout "data does not travel". | "Notice what's not here: the part records I created. Records are data unless the table is marked to capture them. That's a separate decision in your release plan." |
| 2:35 | Set State = Complete. Callout: "Complete = closed to new changes". | "Mark it Complete. From now on, new work needs a new set." |
| 2:50 | Target: System Update Sets > Update Sources > (source configured) > Retrieve Completed Update Sets. Set appears under Retrieved Update Sets, state Loaded. (Alternative card: "No second instance? Export to XML / Import Update Set from XML".) | "On the target, retrieve completed sets from the source. If you only have one instance, export to XML and import it — same next step." |
| 3:20 | Click **Preview Update Set**. Progress; then Preview Problems list shows one Error: "Could not find a record in sys_user_role for column ... referenced in this update"; and one Collision warning. | "Preview. Never skip this. Two problems: an error, because the set references a role that was created in a different update set we haven't moved yet — and a collision." |
| 3:55 | Error: explain dependency; show committing the earlier set first, then re-running preview: error gone. | "The error is ordering. The role lives in the 'security' set. Commit that one first, re-run preview, and the error is gone. That's why we number sets, and why batching exists." |
| 4:30 | Collision: show "Compare to current" side-by-side: target label "Follow-up?" vs incoming "Follow up required". | "The collision says the target's copy changed locally since it last matched. Compare: someone edited the label directly on test. That's the real problem — a change made outside the promotion path." |
| 5:00 | Choose **Accept remote update**; add a note. Callout: "Skip = target now differs from every source". | "I accept the incoming update, because source is the truth, and I note why. Skipping would leave test running something that exists nowhere in development — and the next deployment collides again." |
| 5:25 | **Commit Update Set**. Done. | "All problems resolved. Commit." |
| 5:35 | Verify on target: open a work order form, new field present; save; impersonate technician; run contractor flow test. | "Now the step that matters: verify on the target. Open the form, the field renders. Save a record. Impersonate a technician. The preview told us it applied; only this tells us it works." |
| 6:10 | Back-out: show Back Out button and its warning; callout "reverses configuration, not data changed while live". | "If it goes wrong, a committed set can be backed out — but it reverses configuration, not the data business rules changed while it was live. Write your back-out plan before you commit, not after." |
| 6:40 | Source control panel (developer studio): Link to Source Control, commit, tag. Card: "UI location varies by release". | "Update sets move changes instance to instance. For a scoped app, source control adds history, branches, and review. Commit, tag the release — and keep update sets for anything outside your scope." |
| 7:15 | Recap card: name & make current → build → audit → complete → move → preview → resolve → commit → verify. | "Name it and make it current. Build. Audit. Complete. Move. Preview. Resolve deliberately. Commit. Verify on the target." |
| 7:40 | End card. | "Your turn: manufacture a collision on purpose, as in practice 8, and write down the state of the target after each choice." |

## On-screen assets and B-roll
- Two PDIs with distinct banner names/colours; if only one is available for recording, simulate the target with an XML import and say so on screen.
- Preview problem messages must be captured live; do not script exact error text beyond paraphrase.
- Overlay: the nine-step recap.

## Accessibility
- Captions/transcript; instance identity always spoken ("on the target…") and shown as text banners, not colour alone.
- Zoom on the update set picker and preview problem rows; narrate each row.

## Check for understanding
1. Why did preview report an error, and how was it fixed without editing anything? — *Missing dependency created in another set; commit the sets in order (or batch them).*
2. What does a collision mean, and why is skipping usually a trap? — *The target's record changed locally; skipping leaves the target diverged from source and the next promotion collides again.*
3. Name one thing back-out cannot undo. — *Data changed by business rules or users while the configuration was live.*
