---
lesson_id: ai210-08
course_id: ai210
pathway: prompt-engineer
title: Stakeholder Alignment and Handoff
order: 8
kind: lesson
competency_ids:
  - D4-S1-C05
objectives:
  - Align stakeholders on an AI solution's goals, trade-offs, and handoff so the
    build survives contact with the organization
---

## The failure this lesson prevents

A design can be well researched, well prototyped, tested with real users, and still die. The usual cause is not quality. It is that somebody with influence was never brought along, learned about the work late, and had no reason to support something they did not help shape. Alignment is the practice of preventing that, and it is a communication skill applied to work you have already done rather than a new kind of analysis.

Alignment is not consensus, and chasing consensus is how designs turn to mush. What you need is narrower and achievable: everyone who matters understands the goal, knows which trade-offs were made and why, agrees on how the outcome will be judged, and knows who decides when they disagree.

## Map the stakeholders before you convene them

Write the list down; the ones you forget are the ones who surface late.

| Role | What they care about | What they can do to you |
| --- | --- | --- |
| Sponsor | The business outcome and the money | Fund it, stop it |
| Operating owner | Whether their team can run it daily | Make it work, or let it wither |
| Practitioners | Whether it makes their day better or worse | Adopt it, or route around it |
| Build team | Feasibility, clarity, cost | Deliver something other than what you designed |
| Risk, legal, or compliance | Data handling, disclosure, accountability | Block it at the last gate |
| Recipients of the output | Being treated fairly and told what happened | Complain, escalate, leave |

For each, record what they need to know, when they need to be involved, and what would make them object. Two categories deserve extra attention. The **quiet blocker** is anyone who can decline to participate without ever saying no — most often the practitioners. Bring them in early enough that the design carries their fingerprints. The **late gate** is the reviewer who appears at the end with authority and no context, typically in risk or compliance; a thirty-minute conversation with them in week one costs a fraction of what their objection costs in week ten.

## Aligning on trade-offs, not just goals

Everyone agrees with a goal. Alignment happens on the trade-offs, and it works best when you present them as choices with consequences rather than as decisions you have already taken.

The recurring trade-offs in AI-powered work are worth naming plainly:

- **Accuracy against coverage.** Handling only the clear cases well, or handling everything with more errors.
- **Speed against review.** Every human check adds confidence and delay. The right number of checks comes from the cost of being wrong, which you established in discovery.
- **Automation against control.** More autonomy returns more time and removes the moment where a person would have caught the error.
- **Transparency against simplicity.** Sources, confidence notes, and disclosures take space and attention. Removing them makes a cleaner screen and a less checkable one.
- **Scope against date.** The oldest trade-off there is, and the one most often resolved by silence.

Present each as an option set: what we could do, what it costs, what we recommend, and what we would need to change our recommendation. Stakeholders who are shown the reasoning tend to accept the recommendation; stakeholders who are shown only the conclusion tend to relitigate it later, usually in front of someone more senior.

## The alignment document

One short document, kept current, that anybody can read in ten minutes.

```text
SOLUTION ALIGNMENT — <client> / <initiative>
Version <n> — <date> — owner: <you>

1. GOAL
   One sentence. The business outcome, with the measure and the target
   from the requirements document.

2. WHAT WE ARE BUILDING
   Three to five sentences in plain language, plus a link to the
   prototype. No jargon a sponsor would have to look up.

3. WHAT WE ARE NOT BUILDING
   The out-of-scope list, restated. The most-read section here.

4. HOW IT WILL BE JUDGED
   The agreed success criteria, verbatim, with baselines and who
   measures each one.

5. KEY TRADE-OFFS AND DECISIONS
   | # | Decision | Options considered | Chosen because | Decided by | Date |

6. WHAT WE LEARNED FROM USERS
   Three to five findings that changed the design, with the evidence.
   This is what converts the design from opinion into work.

7. RISKS AND OPEN ISSUES
   | Risk | Impact | Owner | Mitigation | Status |

8. WHO DECIDES WHAT
   | Area | Decides | Consulted | Informed |

9. NEXT STEPS AND DATES
   Who does what by when, including the next point of review.
```

Section 8 is a simplified form of a RACI chart (responsible, accountable, consulted, informed), cut down to the question that matters most in a disagreement: who decides. Put exactly one name in the Decides column for each area; two names there means nobody decides.

Section 5 is the one that earns its keep. A decision log turns "why does it work like that?" — a question that arrives six months later, usually from someone new — into a lookup instead of an argument. Record decisions as they happen, including the ones you lost.

## Running the alignment review

Send the document at least two days before you meet, with two or three specific questions attached, and expect that most people will read it in the meeting anyway.

Structure the session so the decisions get the time: five minutes on goal and scope, fifteen walking the prototype through a real task rather than screen by screen, fifteen on the trade-offs where you need a decision, ten on risks and next steps. Show the prototype at its true fidelity and say the word "prototype" out loud, or you will spend the meeting on visual polish.

When disagreement appears, find out which kind it is. A **factual** disagreement is resolved with evidence — often you already have it from user testing. A **priority** disagreement is legitimate and belongs to the sponsor, so name it and route it rather than debating it. A **misunderstanding** is your problem to fix on the spot. And a **position** taken for reasons outside the room needs a separate, private conversation. Trying to resolve the last two kinds in a group meeting is how alignment reviews go badly.

Close every session the same way: decisions made, decisions still open with an owner and a date, and what you will send afterwards. Send it within a day. Written follow-up is where alignment actually happens; the meeting is where it is negotiated.

## Handoff

Handoff is not sending a folder. It is transferring enough context that the receiving team can make good decisions about things you did not anticipate.

A design handoff package contains the wireframe descriptions and clickable prototype; the state table with every state's designed behavior and its wording; the disclosure, transparency, and correction designs; the accessibility findings and their status; the requirements and success criteria; the decision log; and the open questions with owners. Walk it through live at least once, because the questions asked in that hour are the ones the document was missing.

There is a second handoff that teams routinely skip: the one to whoever will operate the thing. That conversation covers who owns the outputs, who reviews the flagged queue, who reads the captured corrections and how often, what happens when quality degrades, who tells users about changes, and when the success criteria will next be measured. A solution with no operating owner reverts to the old process within a quarter, no matter how good the design was.

Finally, book the measurement. Put a date on the calendar to evaluate the success criteria against their baselines, with the person who agreed to judge them. The engagement is not finished when the design ships; it is finished when someone checks whether it did what you all agreed it would do.

## Practice

Use the requirements document, prototype, and usability findings you have produced across this course.

1. **Build the stakeholder map.** At least six roles, using the table format. For each, name what they need to know, when to involve them, and their most likely objection. Identify one quiet blocker and one late gate by name or role.
2. **Write three trade-offs as option sets.** Each with the options, the cost of each, your recommendation, and what would change your mind.
3. **Write the alignment document** using the template. Sections 3, 5, 6, and 7 must not be empty; section 5 needs at least four decisions, including one you would have decided differently on your own.
4. **Run a 30-minute alignment review** with partners playing the sponsor, the operating owner, and a compliance reviewer. Brief each privately to raise one objection. Classify each objection as factual, priority, misunderstanding, or position, and handle it accordingly.
5. **Send the follow-up** within the hour: decisions made, decisions open with owners and dates, and what you will send next. Under 250 words.
6. **Assemble the handoff package** as a contents list with a one-line note on what each item is for, and write the operating-owner agreement: who owns outputs, who reviews flags, who reads corrections, what happens when quality drops, and the date the success criteria will be measured.

## Check your understanding

1. What is the difference between alignment and consensus?
2. Who is the "quiet blocker" in most AI projects, and how do you handle them?
3. In a review, the operations lead says operators always check the refund window, so the "check this" note is unnecessary. Your usability sessions showed 3 of 5 participants sent a wrong refund window unchecked. What kind of disagreement is this, and how is it resolved?
4. What is the second handoff teams skip, and what happens without it?

Answers: (1) Alignment means everyone who matters understands the goal, the trade-offs, how success is judged, and who decides; consensus means everyone agrees, which turns designs to mush. (2) Usually the practitioners — bring them in early so the design carries their fingerprints. (3) Factual — resolve it with the evidence from user testing. (4) The handoff to whoever operates the system; with no operating owner, the solution reverts to the old process within a quarter.
