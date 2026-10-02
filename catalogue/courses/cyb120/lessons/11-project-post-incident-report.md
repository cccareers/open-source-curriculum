---
lesson_id: cyb120-11
course_id: cyb120
pathway: cybersecurity-support-technician
title: "Project: Post-Incident Report"
order: 11
kind: project
competency_ids:
  - D4-S1-C04
  - D3-S1-C05
  - D3-S1-C01
objectives: []
---

## Goal

Close the case in writing. Using the material you produced in the previous two projects, write the **post-incident report** — the document that tells the organization what happened, what it cost, what was done about it, what the organization's security posture looks like as a result, and what specifically will change.

This is the artifact by which most of the organization will judge the entire response, because it is the only part of it they will ever see. It is also the deliverable that most often gets written badly by technically excellent responders, for a predictable reason: it is not written for people like you. Your reader is a manager, a business owner, a finance lead, an insurer, or an executive. They are intelligent, they are not technical, they have twenty minutes, and they have to make decisions with what you give them.

You will also facilitate the **post-incident review** that produces the report's action items, and produce a **technical annex** for the people who will do the work.

## What you are given

- Your own triage records, declaration, timeline, characterization, and indicator list from the triage and timeline project.
- Your own evidence log, custody records, artifact analysis, sample analysis, and merged timeline from the evidence handling project.
- A **remediation record** supplied by your instructor, describing the containment, eradication, and recovery actions that were taken in the scenario, including at least one action that was delayed, one that was incomplete, and one that was taken without proper authorization.
- A **business context sheet**: the affected departments, the systems' business functions, typical hourly costs of downtime, the number of records or documents involved, and the organization's regulatory environment in outline.
- A stakeholder list naming who will read the report and what each of them needs from it.

If your two previous projects used different scenarios, your instructor will tell you which one this project continues.

## Requirements

### Part 1 — Facilitate the review

Run a post-incident review as a **thirty- to forty-five-minute structured session** with at least three classmates playing the responder, a system owner, and a manager. Facilitate it yourself. Produce, as evidence that you ran it: the agenda you circulated in advance, your facilitation notes, and the raw list of findings and proposed actions with the names of who proposed them.

The session must work through: what happened and when; how the response performed against the plan and playbooks; what information was needed sooner than it was available; what would have detected this earlier; what would have prevented it; what was done that should not have been and what was not done that should have been; and what specifically will change.

Facilitate it **blamelessly**, and be prepared to demonstrate how. Your notes must show at least one moment where a contribution was reframed from a person to a system or a decision.

### Part 2 — The report

Write the post-incident report. Required structure:

**1. Executive summary — one page, no more.** What happened, when, what was affected, whether data was exposed, what was done, whether it is over, and what is being asked of the reader. Written so that a reader who stops here has an accurate understanding and knows what decision is wanted from them. No jargon, no technique names, no tool names. This page is the hardest thing in the project and it should be written last.

**2. Incident summary.** Incident type, severity and any changes to it, the timeline in business terms — detected, declared, contained, eradicated, recovered, closed — with the elapsed time between each, and the total duration.

**3. Impact assessment.** Systems affected, users affected, services degraded and for how long, data involved with a clear statement of what is **confirmed accessed** versus **potentially accessed** versus **confirmed not accessed**, and financial impact in whatever terms your business context sheet supports (staff hours, downtime cost, recovery cost). Where an impact is unknown, say so and say why.

**4. What happened.** A narrative of the intrusion in plain language and chronological order, from initial access to closure. Six to twelve paragraphs. No log excerpts, no command lines, no technique identifiers — those live in the annex. A reader must be able to retell this to a colleague after one read.

**5. Response summary.** What the response did, in order, with the decisions that were made and the reasoning at the time. Include the actions that were delayed, incomplete, or unauthorized — honestly, and framed as systems and decisions rather than as individuals.

**6. What went well.** Specific, evidenced, and not padding. This section exists because the things that worked are the things worth protecting when budgets are cut.

**7. Gaps and contributing factors.** What allowed the incident to happen and what allowed it to continue undetected. Each gap stated as a fact with its evidence, not as a criticism.

**8. Security posture assessment.** Given this incident, an honest statement of where the organization stands: which of the attacker's steps you would detect today, which you would not, and what that means for exposure to a similar event. Ground it in the technique-by-technique coverage question — for each stage of the intrusion, would we see it, and how do we know?

**9. Recommendations.** Each with: what to do, the specific risk it reduces, the effort involved, an owner, and a target date. Ordered by value, not by ease. Between five and ten — a list of thirty is a list nobody will act on.

**10. Appendix: indicators.** The indicator list, with confidence and recommended action.

### Part 3 — The technical annex

A separate document for the security and IT teams, containing: the full merged timeline with sources; the artifact and sample analysis findings; the intrusion characterization with tactic and technique mappings and evidence references; the evidence inventory with hashes; the detection rules proposed, written out; the hunting queries used and their results including negatives; and an explicit "not established" section.

The annex may be as technical as you like. It must never contradict the report — and if the annex contains a caveat that changes what a reader of the report would conclude, that caveat belongs in the report too.

### Part 4 — Action tracker

Produce a tracker for the review's action items: item, why it matters in one sentence, owner, target date, status, and how completion will be verified. Every item must be something a named person can do, not an aspiration. "Improve monitoring" is not an action item; "route the anomalous-parent-process alert class to the primary queue and confirm it is reviewed daily" is.

### Part 5 — Present it

Deliver a **ten-minute briefing** of the report to an audience playing the stakeholder list, followed by questions. Prepare for the four questions that always come: *Could this happen again? Do we have to tell anyone? How much did it cost? Whose fault was it?*

Prepare a real answer to the fourth one. The answer is never a name.

## Constraints

- **Write for the reader named in each section.** The executive summary and report are for non-technical readers; the annex is for practitioners. Mixing them fails both.
- **Every factual claim in the report must be supported by evidence in the annex.** If you cannot point to it, remove it or mark it as an assessment with a confidence rating.
- **Distinguish confirmed from assessed from unknown**, everywhere, and especially in the data-exposure section. The sentence "we cannot rule out access to the customer records in that directory" is a very different statement from "customer records were accessed," and the difference has legal and financial consequences.
- **No blame.** Describe systems, processes, and decisions. No individual is named in any critical context anywhere in either document.
- **No speculation about attribution.** "Consistent with publicly reported activity of X" only if you can evidence the similarity, and preferably no actor name at all.
- **State legal and regulatory questions; do not answer them.** Where a notification obligation or a regulatory clock may apply, flag it, name who owns the decision, and move on. The compliance and reporting discipline itself is covered in your compliance course and is out of scope here.
- **Every recommendation has an owner and a date.** A recommendation without both is a wish.
- The executive summary is **one page**. This is not a soft limit.
- **Plain language.** No unexplained abbreviations in the report. If a term is unavoidable, define it once in a sentence.

## Definition of done

- [ ] The review was facilitated with at least three participants, and the agenda, notes, and raw findings list are attached.
- [ ] The facilitation notes show at least one contribution reframed from a person to a system or decision.
- [ ] The report contains all ten sections in order.
- [ ] The executive summary is one page, contains no jargon, states whether data was exposed, and ends with a clear ask of the reader.
- [ ] The impact assessment distinguishes confirmed, potentially, and not accessed, with a stated basis for each.
- [ ] The "what happened" narrative contains no log excerpts, command lines, tool names, or technique identifiers.
- [ ] The response summary includes the delayed, incomplete, and unauthorized actions from the remediation record, framed without blame.
- [ ] The "what went well" section contains at least two specific, evidenced items.
- [ ] The posture assessment covers **every stage** of the intrusion with a would-we-see-it judgment and the basis for it.
- [ ] Between five and ten recommendations, each with risk reduced, effort, owner, and date, ordered by value.
- [ ] The technical annex exists, is fully sourced, contains an explicit "not established" section, and does not contradict the report.
- [ ] The action tracker has a named owner, a date, and a verification method for every item.
- [ ] Every factual claim in the report can be traced to the annex; a classmate has spot-checked at least ten claims and found all ten traceable.
- [ ] No individual is named in any critical context in either document.
- [ ] The briefing was delivered in ten minutes or less, and you answered all four standard questions — including the fourth, without naming a person.
- [ ] A non-technical reader who read only the executive summary could state, unprompted, what happened, whether data was exposed, and what is being asked of them.

## Hints

**Write the executive summary last, and then rewrite it.** It is a distillation, not an introduction. The common failure is a summary that summarizes the *document* ("this report covers...") rather than the *incident*.

**Give your draft to someone outside security and watch them read it.** Every place they pause, reread, or ask a question is a defect. This single technique will improve the report more than any amount of solitary editing.

**Quantify impact in the reader's units.** "Two workstations were unavailable for one day" means little; "two finance staff lost a working day during month-end close, and the reconciliation was completed a day late" means something to the person who has to decide whether to fund your recommendations.

**Be precise about data exposure and resist pressure in both directions.** There will be pressure to say nothing was taken, because that is the comfortable answer, and occasionally pressure to be maximally alarming. Your obligation is to the evidence: state what is confirmed, what cannot be ruled out, and what would be needed to settle it.

**Recommendations that cost nothing are the most likely to happen.** Include at least one that requires no budget — a routing change, a checklist item, a naming convention, a query scheduled. A report where every recommendation needs a purchase order tends to produce no change at all.

**Tie each recommendation to a specific moment in the timeline.** "If the scheduled-task creation alert had existed, we would have seen this at 13:58 instead of 09:14 the next day — a difference of nineteen hours" is an argument. "We should monitor persistence mechanisms" is a preference.

**The posture section is where your value shows.** Anyone can list what happened. The judgment being assessed is your honest, evidenced answer to "what would we see if this happened again tomorrow?" — including the parts where the answer is "nothing."

**Keep the annex's caveats in the report where they change the conclusion.** A reader of the report should never be surprised by something a reader of the annex already knew.

**Practise the fourth question out loud before the briefing.** "Whose fault was it?" is asked in almost every real debrief, and the answer that works is a redirection to the system: what made the error possible, what made it survivable, and what is changing. If you improvise it, you will name someone.
