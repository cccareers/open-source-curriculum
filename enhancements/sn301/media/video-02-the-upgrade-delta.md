---
course_id: sn301
media_id: sn301-v02
type: video-script
title: "The Upgrade Delta: Why You Run the Suite Before the Upgrade"
format: hybrid
target_runtime: "6 min"
related_lessons:
  - sn301-02
  - sn301-05
objectives:
  - Explain what automated testing protects on a platform that changes with every upgrade
  - Fit automated tests into an update set, UAT, and upgrade cycle
competency_ids:
  - D10-S1-C04
  - D10-S1-C02
---

## Purpose

After watching, the learner can explain to a project manager why a pre-upgrade suite run is required, read a before/after comparison of suite results as an upgrade impact list, and say why ATF does not run on production.

## Audience and prerequisites

Apprentices who have built at least one test and one suite (lessons 3 and 4). No upgrade access needed; this video uses a talking-head frame plus whiteboard diagrams and a prepared results table.

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Talking head, presenter at desk. | "Picture this: it is the afternoon of an upgrade on the test instance. You run your regression suite and seven tests are red. Question: how many of those seven did the upgrade break?" |
| 0:15 | Beat. Text overlay: "You cannot know." | "If you did not run the suite before the upgrade, you cannot know. Some of those might have been red last week." |
| 0:25 | Title card. | "The upgrade delta. Lesson five of ATF Essentials." |
| 0:30 | Whiteboard: three arrows labelled "your changes", "other people's changes", "family release" all pointing at a box labelled "instance". | "Lesson two named three forces that move an instance: your changes, other people's changes, and the platform upgrade. The upgrade is the big one, because it re-validates every customization anyone ever made, in one window." |
| 1:00 | Whiteboard: six numbered boxes in a row: Clone prod down, Run full suite, Apply upgrade, Run full suite again, Work skipped records + failures, Re-run after each fix. | "Here is the cycle. Clone production down so the data is realistic. Run the full suite. Upgrade. Run it again. Then work the skipped records alongside the failures, and re-run after every fix." |
| 1:30 | Highlight box 2 in a contrasting outline and the label "the step people skip". | "Step two is the one people skip. It feels like wasted time, because nothing has changed yet. It is the step that makes every later result meaningful." |
| 1:45 | Table on screen: columns Test, Pre-upgrade, Post-upgrade, Meaning. Rows: (1) New Laptop routes to Hardware Support: Pass, Pass, "No impact". (2) New Laptop requires cost centre: Pass, Fail, "Upgrade impact: investigate". (3) Onboarding creates three tasks: Fail, Fail, "Pre-existing: not the upgrade". (4) ITIL user cannot delete incident: Pass, Fail, "Upgrade impact: investigate". (5) Assignment notification addresses group: Fail, Pass, "Changed: find out why". | "Here is what that buys you. Read each row. Row one passed both times: no impact. Rows two and four passed before and failed after: that is your upgrade impact list. Row three failed both times: it is real, but it is not the upgrade's fault, and you just saved a day of investigating the wrong thing. Row five is the sneaky one: it failed before and passes after. Something changed. Find out what before you celebrate." |
| 2:50 | Whiteboard: two lists side by side. Left: "Skipped records (customizations the upgrade did not overwrite)". Right: "Failing tests". Lines connect two skipped records to the two impact tests. | "Now combine that with skipped records. A skipped record is a customization the upgrade left alone instead of overwriting. You might have hundreds. The failing tests tell you which of those actually change behavior. Without tests, reviewing skipped records is guessing at impact." |
| 3:30 | Talking head. | "Sometimes, when you investigate, you will find that out-of-box behavior changed on purpose, and the new behavior is what the customer wants. Then the right fix is to update the assertion. What is never right is to deactivate the test to make the run green." |
| 3:55 | Whiteboard: dev, test, prod boxes. Green check icons with the word "Run" under dev and test; a crossed-out label "No ATF" under prod. | "Where do tests run? On development while you build. On test after the update set is committed, smoke first, then regression. Alongside UAT, so business users spend their time on judgment, not re-clicking. And never on production." |
| 4:20 | Overlay list: "Inserts records / Sends notifications / Calls integrations". | "When someone asks to run the suite on production just to be sure, here is the concrete reason: an ATF run inserts real records, sends real notifications, and calls real integrations, as though a user did it. Test execution stays disabled on production." |
| 4:50 | Show a sample promotion note text on screen: "Smoke suite green. HR regression green except 2 known-failing tests raised as defects DEF0001, DEF0002." | "Finally, write the result down. A promotion note like this one makes a deployment decision reviewable later. Green is evidence. Sign-off is still a person's decision." |
| 5:20 | Recap slide: "Run before. Run after. The delta is the impact list. Update assertions, never deactivate. Never on prod." | "Run before. Run after. The delta is your impact list. Update assertions when behavior legitimately changes. Never deactivate. Never on production." |
| 5:45 | End card. | "Try the pre-upgrade checklist exercise in lesson five next." |

## On-screen assets and B-roll

- Whiteboard or tablet drawing of the six-step cycle and three-instance path.
- Pre-built results comparison table (five rows above) as a slide; use icons plus the words "Pass" and "Fail".
- Sample promotion note slide.

## Accessibility

- Captions; every table row is read aloud in narration, so the table is not the only carrier of meaning.
- Pass/Fail cells use words and distinct shapes (check, cross), never color alone; highlight box uses a thick outline rather than color.
- Transcript with the table reproduced as text.

## Check for understanding

1. A test fails both before and after the upgrade. Is it an upgrade impact? *Answer: No; it was already failing. It is a real issue to raise, but not caused by the upgrade.*
2. Why are failing tests useful when reviewing skipped records? *Answer: they show which of the many skipped customizations actually change behavior that matters.*
3. Give the one-sentence reason ATF does not run on production. *Answer: a run inserts real records, sends notifications, and calls integrations as though a user did it.*
