---
lesson_id: se250-08
course_id: se250
pathway: technical-sales-representative
title: "Project: Deliver a Recorded Customer Presentation"
order: 8
kind: project
competency_ids:
  - D2-S1-C04
  - D2-S1-C05
objectives: []
---

## Goal

Build and deliver a complete customer presentation, end to end, and record it. This is the artifact the whole course points at: a brief, a narrative, data visuals that argue, a deck that survives being forwarded, and a recorded delivery that ends with a specific ask.

You are presenting to a new account — not Bay Ridge and not Fairmount. Everything you need is in this brief. Every figure in your finished presentation must trace back to what appears below, and where you add an assumption you must say so on the slide.

The deliverable is five things: a written presentation brief, a storyboard, the deck itself, a recording of you delivering it, and a written self-review. All five are graded, and the recording is the one that cannot be faked.

## The scenario

**Presidio Foods** is a regional food manufacturer running four plants across the Pacific Northwest. They produce refrigerated prepared foods — soups, sauces, and deli salads — under their own label and as a co-packer for three national grocery brands. Roughly 1,400 employees, of whom about 900 are on the production floor.

**What you sell.** A quality and traceability platform for food manufacturers: digital batch records replacing paper, in-line quality checks on tablets at the line, lot genealogy from raw material through finished pallet, supplier certificate-of-analysis management, and a recall simulation tool that traces any lot forward and backward in minutes.

**The incumbent.** Paper batch records, a shared spreadsheet system for supplier certificates, and a quality module inside their fifteen-year-old enterprise system that nobody at the plants uses. A competitor with a broader manufacturing suite is also bidding, and their proposal is roughly 40% more expensive and includes production scheduling that Presidio has not asked for.

## The people

- **Elena Vasquez**, VP of Quality and Food Safety — your champion. Owns the problem. Can authorize a plant-level pilot budget but not a network rollout.
- **Roy Tam**, Chief Financial Officer — economic buyer. Has told Elena he will attend "for the numbers" and expects to leave after twenty minutes.
- **Dev Patel**, Director of IT — has completed a security review with no findings. Skeptical about tablets on a wet production floor.
- **Carla Boyd**, Plant Manager, Yakima — the plant with the best quality numbers. Has run Presidio's paper batch record system for eleven years and designed the current forms herself.
- **Nnamdi Okoro**, Plant Manager, Salem — the plant with the worst quality numbers and the newest workforce.

## Discovery notes — Elena Vasquez, 12 September

- Four plants: **Yakima**, **Salem**, **Kent**, **Boise**. Roughly **31,000 production batches** a year across the network.
- "Every batch is a paper record. Two to five pages. They get scanned into a folder about a week later, sometimes."
- **Batch record errors** — a missing signature, an out-of-range value never initialled, an illegible entry — are found on **6.4%** of records at review.
- "When we find one, someone has to go back to the floor and reconstruct what happened. It takes about **90 minutes** per record and it is never fully satisfying."
- **Product holds:** 340 last year. A hold means finished product sits until quality clears it. "About 60% clear in under a day. The rest can sit for a week."
- "We had **two customer complaints** last year that became formal investigations. Both times the co-packing customer asked us for full lot traceability."
- "The first one took us **eleven days** to answer. The second took **nine**. Our contracts say **four hours**."
- "Elena's rule: I do not lose sleep over the recall we would have to do. I lose sleep over the recall we could not scope."
- "Everyone here believes Salem is the problem. Nnamdi's numbers are the worst and he has the newest crew."

## Discovery notes — Roy Tam, 19 September

- Annual revenue approximately **$310M**. Co-packing is **44%** of it, across three national brand customers.
- **Rework and disposal** from quality holds last year: **$1.9M**.
- "The bigger number is the one I cannot put in a spreadsheet. One of our three co-packing customers put us on a **corrective action plan** after the eleven-day trace. If we lose that contract it is **$47M**."
- Quality department: **19 people** across four plants, fully loaded average **$78,000**.
- "I will fund something that reduces a risk I can describe to the board. I will not fund a system because it is modern."
- Capital decisions for next year are made in **November**.

## Discovery notes — Dev Patel, 26 September

- Enterprise system is on-premise, fifteen years old, with a documented but slow integration path. IT will support one integration, not four.
- Security review complete, **no findings**.
- "The floor is washed down twice a shift. I have watched two tablet pilots die in eighteen months. If your answer is a ruggedized case, I have heard it."
- Wi-Fi coverage is complete in Yakima and Kent, **partial in Salem and Boise**.
- "I have three projects and two people. Whatever this is, it cannot need my team for six months."

## Discovery notes — plant walkthrough, 3 October

You spent a day at Salem and half a day at Yakima. Observations, with sources.

- At Salem, a line operator completes an in-process check every 30 minutes and records it on a clipboard at the end of the line. **The clipboard is filled in at the end of the shift** for the last several checks. Nnamdi: *"They know the numbers. They are just not writing them down at the moment."*
- At Yakima, Carla has added a second signature line to every form and a supervisor verification step at the end of each shift. Yakima's batch record error rate is **2.1%**.
- Yakima's supervisor verification consumes about **45 minutes per supervisor per shift**, across 3 shifts and 4 supervisors.
- Supplier certificates of analysis arrive by email and are filed by hand into a shared drive. **Two of last year's holds** were caused by a raw material used before its certificate was filed.
- Kent's quality manager keeps a personal spreadsheet cross-referencing lot numbers to pallet IDs "because the system cannot do it."

## The data set

**Batch record error rate by plant, last full year:**

| Plant | Batches | Error rate | Workforce tenure (median) |
| --- | --- | --- | --- |
| Yakima | 9,100 | 2.1% | 7.4 years |
| Kent | 8,400 | 5.8% | 5.1 years |
| Salem | 7,200 | 11.3% | 1.9 years |
| Boise | 6,300 | 7.0% | 4.6 years |

**Batch record error rate by record-completion timing (network, all plants):**

- Records where in-process checks were entered **within 15 minutes** of the check: **1.6%** error rate (11,900 batches)
- Records where checks were entered **more than 2 hours after** the check: **14.2%** error rate (8,700 batches)
- Remaining batches fall between the two and are excluded from this cut

**Timing behaviour by plant** (share of batches where checks were entered more than 2 hours late):

| Plant | Share entered 2+ hours late |
| --- | --- |
| Yakima | 9% |
| Kent | 26% |
| Salem | 61% |
| Boise | 33% |

**Product holds by root cause, last year:**

| Root cause | Holds | Share |
| --- | --- | --- |
| Batch record incomplete or unverifiable | 148 | 44% |
| Out-of-spec in-process result | 96 | 28% |
| Supplier material issue | 51 | 15% |
| Equipment or sanitation deviation | 45 | 13% |

**Trace response time, the two formal investigations:** 11 days and 9 days. Contractual requirement: **4 hours**.

**Comparable operators** (your company's aggregate, 6 food manufacturers, 4–8 plants each, first 12 months post-deployment): batch record error rate falls to a range of **1.2%–2.8%**; trace response time falls to a range of **8 minutes–2 hours**; product holds attributable to record issues fall by **60%–85%**. Ranges, not averages, and this is your company's own data.

## The meeting

**Fifty minutes. Video call. Hard stop.** All five attendees. Roy Tam leaves at approximately minute twenty. You have completed three discovery calls, a plant walkthrough, and a security review. Assume the deck is forwarded afterward to Presidio's CEO, who will not attend and who has never heard your company's name.

## What you must deliver

**1. The presentation brief.** All eight fields from lesson 2, in full sentences, on one page. Field 5 is a single sentence in Presidio's language. Field 7 names a person, a scope, a date, and a measure. Include an explicit kill list of at least five things this presentation will not contain.

**2. The storyboard.** Ten to fifteen slides. For each: slide number, the assertion headline as a full sentence, a one-line description of the evidence, and which of the six narrative beats it serves. Produced before the deck, and submitted as its own artifact.

**3. The deck.** Built in any presentation software, exported to PDF. It must contain a front-of-deck summary slide for the absent CEO, assertion headlines throughout, at least three original data visuals built from the data set above, source lines on every slide carrying Presidio data, and an indexed appendix.

**4. The recording.** You, delivering the presentation, on camera, in one take, no edits. Twenty to twenty-five minutes. It must include the four scripted interruptions listed under Constraints, delivered by a colleague or read aloud by you at the marked points, and it must end with the ask followed by silence.

**5. The self-review.** Two pages. Watch your own recording twice — once silent, once audio-only — and write what you found, then list at least eight specific behavioural changes for a second attempt. Include your timed elapsed time against your planned budget, and name the single moment where you most lost the room.

## Requirements

- **The narrative must have six identifiable beats**, and beats 1 through 4 must not mention your company or product at all.
- **The presentation must lead with an insight**, structured through all six steps of the reframe sequence from lesson 7. The insight must pass all three tests, and you must state in the brief which of the five sources it came from.
- **At least three original data visuals**, each with an assertion headline, exactly one accent element, a source line, and a claim that a stranger can read in two seconds. Specify the chart form and justify it from the shape of the claim.
- **Roy Tam leaves at minute twenty.** Whatever he needs to make a capital decision must have been delivered before then. Say in the brief what that is.
- **The deck must pass the read-without-you test.** Have someone who does not know this scenario read it for four minutes and answer the four questions. Report their exact answers in the self-review.
- **The deck must pass the headline test.** Include the headlines-only list as a page in your submission.
- **Every Presidio figure carries a source** — which person, which call or document. Any figure you derived shows its arithmetic. Any assumption you added is labelled as an assumption on the slide where it appears.
- **The close must contain a written ask** on a slide, with a name, a scope, a start date, and the measure that will decide it — followed by at least five seconds of silence on the recording.
- **A collapse plan** at full, half, and five-minute lengths, submitted with the brief. You are not recording all three; you are recording the full version.

## Constraints

- **No figure may enter the presentation that is not in this brief or derived from it.** If you need an external benchmark, label it as one on the slide and mark it low confidence.
- **The comparable-operator figures are ranges from your own company's data, and they are the ceiling.** Present them as ranges with the source stated. Claiming the top of a range as an expected result is a failure condition for this project.
- **Do not name a specific presentation product** in anything you submit, and do not build the presentation around a feature of one. Any tool is acceptable; the craft has to transfer.
- **Do not attack the incumbent or the competitor by name.** If the competitor's scope comes up, address it in terms of what Presidio asked for.
- **Do not humiliate anyone in the room.** Carla designed the current forms and Yakima has the best numbers. Nnamdi runs the worst plant with the newest crew. Both are on the call. A reframe that makes either of them the problem is a failed reframe, and it will be graded as one.
- **Do not resolve the tablet objection with a ruggedized case.** Dev has explicitly pre-empted that answer. Whatever you say about the floor environment has to be better than the answer he has already rejected.
- **Do not price the deal.** The ask is a pilot. Give a range if asked and move on. Structuring commercial terms, discount, and negotiation is se203's subject, not this project's.
- **Do not build a business case beyond what this presentation needs.** A full ROI model is se201's deliverable. Here you need the two or three numbers Roy acts on, presented visually, and nothing more.
- **Do not design a CRM workflow, an outbound sequence, or a pipeline forecast.** Out of scope.
- **The recording is one take.** Interruptions land where they land. Editing out a recovery removes the only evidence of the skill being assessed.

**The four scripted interruptions**, to be delivered at these points:

1. **Within your first three slides** — Roy: *"Before you go further — roughly what does this cost?"*
2. **During your evidence sequence** — Carla: *"I want to push back on the timing number. My supervisors verify every record at end of shift. Entry timing is not the same as accuracy."*
3. **During your proposal** — Dev: *"Tablets do not survive our floor. I have watched two pilots die. What is different?"*
4. **After your ask** — Nnamdi: *"Does this integrate with the label printers? Because the last system did not."*

## Definition of done

Your project is finished when all of the following are true.

- All five deliverables are present: brief, storyboard, deck as PDF, unedited recording, and self-review.
- The brief has all eight fields in full sentences, plus a kill list of at least five items and a three-length collapse plan.
- The storyboard exists as its own artifact and predates the deck, with a headline and a beat mapping for every slide.
- The six narrative beats are identifiable in the recording, and beats 1 through 4 contain no mention of your company or product.
- The reframe runs through all six steps in order, the insight is stated as a single sentence in the brief, and its source is named.
- At least three original data visuals are present, each with an assertion headline, one accent element, and a source line; the chart form for each is justified in the storyboard.
- Every Presidio figure on a slide has a named source; every derived figure shows its arithmetic; every added assumption is labelled on the slide.
- The comparable-operator figures appear as ranges, attributed, and are never presented as an expected result.
- The front-of-deck summary slide contains the situation, the finding, the cost, the proposal, and the ask in six lines or fewer.
- The headlines-only list is submitted and reads as a complete argument.
- The read-without-you test was run with a real person, and their four answers are transcribed verbatim in the self-review.
- Whatever Roy Tam needs has been delivered before minute twenty of the recording, and you can point to the timestamp.
- All four scripted interruptions appear in the recording, each answered with an audible acknowledge-handle-return, and the return sentence for each is transcribed in the self-review.
- Neither Carla nor Nnamdi is made the cause of the problem anywhere in the presentation.
- The recording is one unedited take of twenty to twenty-five minutes, ending with a written ask on screen followed by at least five seconds of silence.
- The self-review lists at least eight specific behavioural changes, each stated as an observable action rather than a quality.
- Someone who was not in the meeting could open the PDF, read it in four minutes, and correctly state Presidio's problem, its cost, your proposal, and the next step.

## Hints

**The insight is in the data and it is not the plant table.** Everyone at Presidio has looked at the plant-by-plant error rates and concluded Salem is the problem, because Salem is worst and Salem's crew is newest. That correlation is real. Now put the tenure column next to the timing column and see which one tracks the error rate more tightly. Salem is not worse because its people are newer; it is worse because its people are recording checks hours after they take them — and one of the four plants has a Wi-Fi gap that makes end-of-shift entry the only practical option. The finding you want is about *when* the record is made, not *who* makes it.

**Carla is your best evidence and your biggest risk.** Yakima's 2.1% is the proof that the problem is solvable. It is also Carla's achievement, achieved through a manual verification step that costs a substantial block of supervisor time every operating day. The honest framing is that Carla found the right answer and is paying an unsustainable price for it — she is doing manually what a system should do, and she is the only plant manager who can afford the labour to do it. That framing makes her an ally instead of a target, and it makes your case in the same sentence. Work out those hours from the walkthrough notes — 45 minutes per supervisor per shift — and state on the slide how you read the shift pattern and how many operating days you assumed.

**Roy told you exactly what he buys.** "A risk I can describe to the board." The $1.9M rework figure is real but it is not what moves him. The number that moves him is the co-packing customer on a corrective action plan against $47M of revenue, and the nine-and-eleven-day trace times against a four-hour contractual requirement. That comparison — four hours contracted, eleven days actual — is your single most powerful visual, and it needs to be on screen before minute twenty. Consider whether it is a chart at all, or whether it is two numbers in very large type.

**The hold data has a 44% line in it.** Nearly half of Presidio's product holds trace to a record problem rather than an actual quality problem. That means a substantial share of the $1.9M in rework and disposal was product that was probably fine and could not be proven fine. Be careful here: "probably fine" is your inference, not their data. If you use it, label it as an assumption and be conservative about how much of the $1.9M you attribute.

**Dev has pre-rejected the obvious answer, which is a gift.** The honest response to "tablets do not survive our floor" is not about hardware. It is about where the check is entered and how long it takes — a fifteen-second entry at a fixed wash-down-rated station near the line is a different proposition from an operator carrying a tablet through a wash-down. Also notice that Salem and Boise have partial Wi-Fi, which means offline capture matters, and that Dev has three projects and two people, which constrains your implementation ask more than your technical one. Answer the resourcing point without being asked.

**Watch the two-hours-late cut.** 11,900 batches at 1.6% and 8,700 at 14.2% does not account for all 31,000 batches — the middle band is excluded and the data set says so. If your visual implies it covers the whole network, someone will catch it. State the coverage on the slide.

**The pilot should be Salem, and you should say why out loud.** It is the worst plant, which means it has the most room to move, and it is the plant where the timing problem is most extreme. It is also the plant whose manager is most exposed by the finding, which is why the framing in the reframe matters so much. A pilot at Yakima would prove nothing; Yakima already has the answer.

**Write the ask before you write the deck.** The whole thing works backwards from a sentence like: *"A ninety-day pilot on two lines at Salem, starting the first week of December, measured on batch record error rate against Salem's 11.3% baseline and on trace response time against a simulated recall."* Once that sentence exists, most of the slide decisions make themselves.

**Rehearse the returns, not the answers.** Four interruptions are scripted, so you know they are coming. What you cannot script is the sentence that puts you back on the thread. Practise those four return sentences until they are automatic, and time yourself: none of the four handles should exceed ninety seconds.

**Record the five-minute version first.** It is the fastest way to discover whether your argument actually holds. If the five-minute version is compelling, the twenty-minute version is a matter of adding evidence. If it is not, no amount of slides will save the long one.
