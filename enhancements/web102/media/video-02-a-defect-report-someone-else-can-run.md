---
course_id: web102
media_id: web102-v02
type: video-script
title: "A Defect Report Someone Else Can Run"
format: hybrid
target_runtime: "8 min"
related_lessons:
  - web102-05
  - web102-06
objectives:
  - Report a defect with enough detail for someone else to reproduce it
  - Track a reported defect from report through fix to verification
competency_ids:
  - D4-S1-C05
  - D4-S1-C02
---

## Purpose

After watching, the learner can take a vague complaint, reproduce it, rewrite it as a report another developer can run without asking questions, and describe how that report moves through fix, verification, and closure.

## Audience and prerequisites

Apprentices in lesson 05, before the pair practice, or at the start of project 06's defect cycle. They have a working shift board from project 04.

## Script

Format: a talking-head presenter (an instructor or senior developer) for framing segments, and a screencast of the shift board at `http://localhost:3000`, with a planted stale-count defect, for the demonstration. The defect is the one from lesson 05's example: releasing a shift does not update the counts until reload.

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Talking head. Lower third: a chat message, "the numbers are wrong on the board sometimes". | "This is a real defect report. It arrived in a team chat at 4:55 on a Friday. Something is wrong, and that's all it tells us. In the next eight minutes we'll turn it into a report that anyone on the team could pick up and run." |
| 0:20 | Title card: "A defect report someone else can run". | — |
| 0:25 | Talking head. | "First rule: before you write a word or change a line of code, make it happen on purpose. A report you haven't reproduced is a rumour." |
| 0:35 | Screencast. A private window opens. DevTools Network shows "Disable cache" ticked. URL `http://localhost:3000`. | "Clean state first. A private window, so no extensions and no old storage. Cache disabled. Then follow what we were told, which isn't much: 'the numbers are wrong'. Which numbers? When?" |
| 0:55 | Click Claim on "Food bank sorting", type `Ana`, confirm. Counts go from "Open 6 · Claimed 1" to "Open 5 · Claimed 2". | "Claiming updates the counts. Open went down, claimed went up. Correct." |
| 1:10 | Click Release on "Food bank sorting". Row returns to open. Counts stay at "Open 5 · Claimed 2". Zoom on the counts bar. | "Releasing returns the row to open, but the counts don't move. Still five and two. That's our defect, reproduced." |
| 1:25 | Press Command-R (or Control-R). Counts read "Open 6 · Claimed 1". | "Now reload. The counts are correct. That one observation matters a lot: the stored data is right and only the display is wrong. Whoever fixes this doesn't need to look at persistence at all." |
| 1:45 | Screencast: repeat release four more times. Then open Firefox and repeat once. A tally appears on screen: "5 of 5 · Chrome + Firefox". | "Always or sometimes? Five out of five. Another browser? Same. So it isn't intermittent and it isn't browser-specific. Both facts go in the report." |
| 2:05 | Talking head. | "Second rule: narrow it down. Remove steps until the defect disappears. Here, the shortest sequence is claim one shift, then release it. Two steps. That's the reproduction we'll write down." |
| 2:20 | Editor with an empty `ISSUES.md`. The report is typed section by section; each heading is highlighted as it's narrated. | "Now the report. Each section is there because of a specific way reports fail without it." |
| 2:30 | Typed: `Title: Releasing a claimed shift does not decrease the claimed count until reload` | "The title names the defect, not the area. 'Shift board bug' tells nobody anything. This title tells someone scanning forty reports whether it's theirs, and whether the one they were about to file is a duplicate." |
| 2:50 | Typed: `Environment: Chrome 141, macOS 15, 1440x900. Local static server, main @ 4f2a1c9. Also Firefox 143.` Terminal inset: `git log -1 --oneline` showing `4f2a1c9`. | "Environment: browser and version, operating system, and above all, which version of the code. I got the commit hash from git log. The most common reason a fix doesn't fix anything is that someone tested a different version." |
| 3:15 | Typed:<br>`Steps:`<br>`1. Serve the project and open http://localhost:3000 in a private window.`<br>`2. Claim "Food bank sorting" with the name Ana. Counts show open 5, claimed 2.`<br>`3. Release "Food bank sorting".` | "Numbered steps from a defined starting state, with exact values: the shift title, the name, and what the counts showed in between. Someone should be able to follow this without asking me a single question." |
| 3:40 | Typed: `Expected: Counts return to open 6, claimed 1, as they change after a claim (spec R7: counts update on every claim, release, and filter change).` | "Expected result, and where that expectation comes from. Here it's requirement R7. Citing the spec is what makes this a defect and not a feature request." |
| 4:00 | Typed: `Actual: The row returns to the open style, but counts stay at open 5, claimed 2. Reloading shows open 6, claimed 1.` | "Actual: exactly what happened, including the reload observation." |
| 4:15 | Typed: `Frequency: 5 of 5 attempts, Chrome and Firefox.`<br>`Impact: A coordinator deciding whether to call more volunteers reads the wrong number of open shifts.`<br>`Evidence: Console clean. Screenshot attached (counts after step 3).` | "Frequency. Impact: what a real user can't do because of this, not how hard I think the fix is. Evidence: the console was clean, so I say so, and I attach a screenshot. If there had been an error, I'd paste it as text, not as a picture of text." |
| 4:45 | Typed, then highlighted in a different text style with a label: `Possible cause (unconfirmed): counts may only be updated in the claim handler.` | "And if I have a theory, it goes on its own line, labelled as a theory. If I write 'the render function doesn't update the count' as the actual result and I'm wrong, I've sent the developer to the wrong file." |
| 5:05 | Split screen: the original chat message on the left, the full report on the right. | "Same defect. On the left, a developer starts by interviewing the reporter. On the right, they can start work." |
| 5:20 | Talking head. A lifecycle diagram builds beside the presenter: Reported → Triaged → Reproduced → In progress → Fixed → Verified → Closed, with the two backward arrows labelled "needs info" and "failed verification". | "A report is the start of the defect's life, not the end. It gets triaged: how bad is it, and who takes it. The developer reproduces it from your steps. If they can't, it comes back to you with a specific question. That's the first backward arrow, and it's normal." |
| 5:50 | Screencast: a fix branch `fix/counts-after-release`. Commit message on screen, matching lesson 05's example: `Recompute the shift counts after a release` plus a body. | "The fix goes on its own branch, with a commit message that says what was wrong and what must stay unchanged. Then verification." |
| 6:10 | Screencast: a second person (a different cursor colour and a name label, "Verifier: Ben") follows steps 1–3 from the report. Counts update to open 6, claimed 1. | "Verification is done by someone other than the fixer, against the original steps. Not against what the fixer remembers. If it fails, that's the second backward arrow: back to in progress, with the new observation attached." |
| 6:35 | `ISSUES.md` closing block typed:<br>`Status: Closed — verified`<br>`Cause: Counts were updated only in the claim handler; release re-rendered rows but not counts.`<br>`Fix: 9c1e7aa (PR #14)`<br>`Verified: Ben, 2026-10-02, Chrome 141, steps 1–3 as written.`<br>`Left over: none.` | "Close it with the cause, the commit, who verified it and how, and anything left over. A year from now, git log and the issue tracker still tell the same story." |
| 7:00 | Talking head. | "One more thing. If you can't reproduce something, don't close it as 'cannot reproduce' with nothing attached. Write what you tried, what you saw instead, and exactly what you need from the reporter. That keeps people willing to report the next one." |
| 7:20 | Summary card, 4 lines: "Reproduce first · Narrow it · Observation, not diagnosis · Someone else verifies". | "Reproduce first. Narrow it down. Write observations, and label your theories. And let someone else verify the fix. That's the whole loop." |
| 7:40 | End card. | — |

## On-screen assets and B-roll

- Shift board repository with a branch `defect/stale-counts` holding the planted defect, and a fix branch.
- Report template overlay with each section heading.
- Lifecycle diagram matching the course asset `defect-lifecycle.png` (see the review's open questions: the image file does not exist yet).
- The browser version strings shown on screen must match whatever is used at recording time. Update the script text before recording.

## Accessibility

- Captions and a full transcript. The full report text is in the transcript as plain text.
- The verifier's cursor is told apart by a name label ("Verifier: Ben"), not only by colour.
- In the lifecycle diagram, the backward arrows are dashed and labelled with text, not only coloured.
- The "possible cause" line is marked with a text label as well as its different styling.
- Keyboard shortcuts are spoken and shown as on-screen keystrokes.

## Check for understanding

1. Why does the report say that reloading shows the correct counts? **Answer:** it shows the stored state is correct and only the display is wrong, which rules out the persistence layer before anyone opens the code.
2. Where does "counts may only be updated in the claim handler" belong in a report? **Answer:** in a clearly labelled "possible cause" line, not in Actual, because it is a hypothesis.
3. The fixer walked the steps and everything works. Can they close it? **Answer:** no. Someone else must verify it against the original steps, and the closure must record the cause, commit, verifier, and environment.
