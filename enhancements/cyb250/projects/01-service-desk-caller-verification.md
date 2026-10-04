---
course_id: cyb250
project_id: cyb250-x01
title: "Merrow Fields Service Desk: Caller Verification Standard and Role-Play Drill"
kind: supplementary-project
status: draft
hours_estimate: 5
difficulty: core
related_lessons:
  - cyb250-02
  - cyb250-03
objectives:
  - Explain the psychological levers social engineers use and recognize them in a described interaction
  - Analyze a suspicious message, decide what to do with it, and route it to the right people
competency_ids:
  - D5-S1-C02
---

## Scenario

At **Merrow Fields Logistics** (lesson 04), the service desk resets about 60 passwords a week by phone with no formal caller verification. Last month two depot supervisors mentioned "a new guy from IT" who called asking them to read out the code from a text message. Nothing was confirmed as lost, but the IT manager wants two things before the autumn contractor intake: a written caller-verification standard the desk can follow without exceptions, and evidence that the desk can recognize and name the pressure in a live call. You will write the standard, run a scripted role-play drill with peers, and produce an evidence portfolio.

## Scope and authorization

- This is a **classroom role-play among consenting peers**. Every caller is a classmate or instructor reading a fictional script; every "target" knows they are in a drill.
- **Do not call, text, or message any real organization, help desk, or person** to test their reaction. Testing real people without written authorization from the organization (and HR/legal sign-off) is not a drill — it is an attack.
- Scripts describe the pretext and the pressure; they do not include real names, real phone numbers, or real credentials. Use the fictional Merrow Fields directory below.

## What you will build / produce

1. **Caller Verification Standard** (one page): the exact steps the desk follows before any password reset, MFA reset, or account change requested by phone.
2. **Role-play pack**: four caller scripts (two legitimate, two social engineering) and an observer scoring sheet.
3. **Drill log**: results from running all four scripts with at least two peers playing the desk.
4. **Routing record** for each social-engineering call, using lesson 03's routing table.
5. **Evidence portfolio** (below).

## Before you start

- Lessons 02 and 03, especially "The levers", "Recognition: a method, not a checklist", and "Routing: who needs to know, and when".
- Fictional directory for the drill:

| Name | Role | Directory extension | Manager |
|---|---|---|---|
| Sam Okoye | Depot B shift supervisor | x2214 | Lena Price |
| Lena Price | Depot operations manager | x2201 | — |
| Raj Mehta | Field engineer | mobile on file only | Lena Price |
| Contractor pool | Seasonal, autumn intake | none — via agency contact | Agency account manager |

## Milestones

1. **Draft the standard (1.5 h).** It must answer: what identity proof is acceptable (and what is not: knowing an employee ID, a manager's name, or a date of birth is *not* proof — all are public or guessable); how the call-back works (to the number in the directory, never one the caller gives); what happens when the person cannot be reached; how contractors are verified (through the agency's registered contact); and the "no exceptions, including executives" clause. Include the line staff will actually say: *"I verify every one of these, including my own manager's — I'll call you straight back on the number we have."*
2. **Write the scripts (1 h).** Use this structure for each: caller role, pretext, which levers they will apply and when, the escalation sequence of asks, and how they react to a call-back offer. Required set:
   - **A (legitimate):** Sam Okoye, locked out before a shift, mildly stressed, happy to be called back.
   - **B (legitimate, awkward):** Raj Mehta from a roadside with poor signal; the number on file is correct but he cannot answer quickly. Tests that the standard handles real inconvenience without breaking.
   - **C (social engineering):** "New contractor in repairs" who knows Lena Price's name and the depot move date; rapport first, then urgency (truck leaving), then a request to send the reset to "my personal mobile since my work phone isn't set up yet." Pushes back on call-back.
   - **D (social engineering, MFA fatigue):** "IT service desk" calling a depot supervisor after a burst of push prompts, asking them to approve the next one "to clear the sync loop." Played with roles reversed: the learner is the supervisor.
3. **Run the drill (1 h).** Each peer plays the desk for all four scripts in a shuffled order without knowing which are legitimate. An observer completes the scoring sheet.
4. **Route and debrief (30 min).** For C and D, complete a routing record. Debrief each peer with the lesson 02 rule: the target is a witness, not a suspect.
5. **Assemble the portfolio (1 h).**

## Acceptance criteria

- [ ] The standard requires call-back to a number from the directory or agency record, never a caller-supplied number, and states that recognition of a voice is not verification.
- [ ] The standard covers employees, contractors, executives, and the unreachable-caller case explicitly.
- [ ] Each script names at least two levers and the stage of the attack lifecycle at which they are applied.
- [ ] Scripts A and B were completed correctly by the desk player **without** being refused service — the standard must not break legitimate work.
- [ ] For C and D, the observer recorded whether the desk player named the pressure aloud and offered out-of-band verification.
- [ ] Routing records for C and D match lesson 03's table (an approved MFA prompt routes to incident response immediately).

## Evidence checklist

- The one-page standard, version-dated, with an owner and review date.
- The four scripts and the blank scoring sheet.
- Completed scoring sheets for each peer (no grades on people — record behaviors only: verified / did not verify; named lever / did not).
- Two routing records.
- A half-page reflection: where the standard caused friction in A or B, and the one wording change you made because of it.

### Observer scoring sheet (copy per call)

| Behavior | Seen? | Note |
|---|---|---|
| Asked what action the caller wants (question 1) | Y / N | |
| Named a lever aloud or in notes (question 2) | Y / N | Which? |
| Offered call-back on directory number (question 3) | Y / N | |
| Held the standard when the caller resisted | Y / N / n.a. | |
| Treated the caller courteously throughout | Y / N | |
| Correct outcome (reset / no reset / escalate) | Y / N | |

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Standard | Allows knowledge-based "proof" or caller-supplied numbers | Directory call-back, no exceptions, contractor path | Includes exact phrasing for staff and a tested unreachable-caller path |
| Lever analysis | Levers listed generically | Each lever tied to a specific line in the script | Explains how lever order builds commitment and consistency |
| Drill execution | Fewer than four scripts run | All four run with observer sheets | Two rounds, with a standard revision between them |
| Routing | Generic "tell security" | Matches lesson 03 table with urgency | Adds the session-revocation step for D and explains why |
| Tone | Blame language in debrief | Witness-not-suspect framing | Debrief script reusable by the desk |

## Stretch goals

- Add a fifth script using a synthetic "cloned voice" premise (described, not produced) and update the standard to state that recognition is not verification.
- Draft the 100-word card version of the standard for the desk monitor.

## Reflection prompts

1. Which lever was hardest for your peers to resist, and why do you think that was?
2. Script B is a real employee in a real bind. What did your standard do to keep him working, and what did it cost?
3. If a director called and refused the call-back, what would you want written in the standard before that call happens?

## Instructor notes

- Learners often write a standard so strict that Script B fails. That is the teaching moment: a control people cannot live with gets bypassed.
- Keep role-play callers to the scripts; improvisation tends to drift toward aggression, which is unrealistic (good social engineers are pleasant).
- For a 2-hour version, provide the four scripts and grade only the standard, the drill, and the routing records.
