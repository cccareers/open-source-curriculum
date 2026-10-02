---
lesson_id: ai210-02
course_id: ai210
pathway: prompt-engineer
title: "Discovery: Identifying AI Needs with Clients"
order: 2
kind: lesson
competency_ids:
  - D4-S1-C01
objectives:
  - Run a discovery conversation that surfaces a client's real AI automation
    needs rather than their first stated request
---

## The first request is a symptom, not a specification

A client rarely arrives with a need. They arrive with a solution they have already half-designed in their head, phrased as a request: "we want a chatbot for our support inbox," "can you build something that writes our weekly report," "we need AI to read these PDFs." Every one of those sentences is a compressed summary of a problem the client has already interpreted, prioritized, and translated into the nearest technology they have heard of. Your job in discovery is to decompress it.

This matters more with AI work than with ordinary software, for a specific reason. Conventional software requests tend to describe a mechanism the client already understands — a form, a report, a button. AI requests tend to describe an outcome the client has only seen demonstrated. The gap between "AI reads our PDFs" and any buildable system is enormous: which PDFs, produced by whom, in what condition, read for what purpose, with what consequence if the reading is wrong. If you accept the request as written, you will build something that works exactly as asked and gets abandoned in six weeks, because the thing that was actually painful was never on the table.

Discovery is the structured conversation that closes that gap. It is not a requirements meeting — you are not writing the specification yet, and trying to do both at once is the most reliable way to ruin the conversation. Discovery has one job: to produce an accurate, evidenced picture of how work happens today, what it costs, who it touches, and where an AI-powered solution would genuinely change the outcome. Turning that picture into requirements is a separate task with different rules.

## What you are trying to leave the room with

Before you plan questions, get clear on what a good discovery session produces. A discovery conversation has succeeded when you can describe, in your own words and without guessing:

- **The work as it is actually done.** Not the documented process — the real one, including the spreadsheet someone keeps on the side and the step everyone skips when they are busy.
- **The trigger and the volume.** What starts this work, how often, and how much of it there is. "A few a week" and "four hundred a day" are different products.
- **The cost of the current state.** Time, money, delay, errors, morale, missed revenue, risk. Ideally a number the client already tracks, not one you invent.
- **The people involved.** Who does the work, who receives the output, who is accountable when it is wrong, and who has to approve any change.
- **The decision the output supports.** Almost every AI output feeds a decision. Knowing which one tells you how accurate the system has to be and what has to happen when it is uncertain.
- **The cost of being wrong.** A wrong product recommendation is an annoyance. A wrong benefits-eligibility summary is a harm. This single answer shapes more of your design than any other.
- **Constraints you did not choose.** Data that cannot leave the building, a regulator, a system nobody is allowed to modify, a budget cycle that closes in March.
- **What "better" looks like to them.** In their words, before you translate it.

Notice that none of those are features. If you leave discovery with a feature list and no evidence, you have taken dictation, not run a discovery.

## Preparing the session

Do enough homework that you are not spending the client's time on things you could have read. Look at their public materials, the product they sell, the language they use for their own processes. Come in able to say "you serve two customer types, is that right?" rather than "so what does your company do?"

Then plan the shape of the session rather than a script. A workable ninety-minute structure:

```text
DISCOVERY SESSION PLAN — 90 minutes

00–05  Framing. Why we're here, what we'll do with what you tell us,
       and what we are NOT doing today (not scoping, not quoting).
05–15  Orientation. Who's in the room, what each person's stake is.
15–45  The work as it is. Walk me through the last time this happened.
45–60  Pain, volume, and cost. Where does it hurt, how often, what
       does it cost you today?
60–75  Consequences and constraints. What happens when it goes wrong?
       What can't we touch?
75–85  Success. If this were solved, what's different in 90 days?
85–90  Close. What we'll send back, by when, and who reviews it.
```

Two preparation rules are worth holding firm on. First, **get the people who do the work in the room, not only the people who fund it.** A sponsor can tell you why the project exists; only the person handling the inbox can tell you what actually happens in it. If you can have only one session, ask for both and protect time for the practitioner. Second, **ask to see artifacts.** Real emails, real forms, real spreadsheets, real rejected outputs. Ten minutes looking at three real examples teaches you more than an hour of description, and it is the fastest way to discover that the "unstructured documents" are in fact eleven different templates.

## A discovery question bank

Questions are the craft of discovery. The bank below is organized by what each question is for. You will not use all of them, and you should not read them aloud in order — pick the branch the conversation opens.

```text
CURRENT STATE — get to the concrete
  Walk me through the last time this happened, start to finish.
  Who touched it, in what order?
  What did you have in front of you when you started?
  Where does the information come from before it reaches you?
  What do you do when the input is incomplete or unusual?
  How long does a typical one take? What about the worst one this month?
  What happens to the output after you send it?

VOLUME AND VARIATION
  How many of these in a normal week? A peak week?
  What proportion are routine versus exceptions?
  What does an exception look like? Show me a recent one.
  Is this seasonal, or does it spike for a reason you can predict?

PAIN AND COST
  Which part of this do you dread?
  If you could delete one step, which one?
  What does this cost you today — hours, delay, rework, lost work?
  Has anyone tried to fix this before? What happened?
  What would you do with the time if this took ten minutes, not two hours?

THE DECISION BEHIND THE OUTPUT
  What decision does this output feed?
  Who makes that decision, and what else do they look at?
  How would they know if the output were wrong?
  What happens if nobody notices it's wrong?
  Is there a step where a human must sign off, for policy or for law?

CONSEQUENCE AND RISK
  What's the worst realistic outcome of a bad output here?
  Who is affected — staff, customers, the public?
  Is any of this data sensitive, regulated, or someone else's?
  Are there rules about where this data can be processed?

PEOPLE AND ADOPTION
  Who would use this every day?
  What tools are they already in all day?
  What's the last new tool that got adopted here? Why did it stick?
  What's the last one that didn't? Why not?
  Who could quietly kill this project by not using it?

SUCCESS
  If we solved this, what's different in 90 days?
  How would you know, without asking me?
  What number would move? Do you already measure it?
  What would make you say this was a waste of money?

SCOPE BOUNDARIES
  What's explicitly not part of this?
  What's the smallest version that would still be worth doing?
  If we could fix only one step, which one?
```

The single most valuable question in that bank is the first one — "walk me through the last time this happened." It converts opinion into episode. People describe processes idealistically and episodes accurately, and the detail that breaks your assumptions almost always lives in the episode.

## Techniques that separate a good discovery from a polite one

**Ask about the last time, not the usual time.** "Usually" is a summary, and summaries hide exceptions. "Last Tuesday" produces the exception.

**Follow the thing, not the person.** Trace one item — one email, one invoice, one application — from the moment it arrives to the moment it is done. Every handoff you find is a place where the current process leaks time, and the leak is rarely where the client thinks it is.

**Count silently, then out loud.** When someone says "it takes forever," ask how many, how long, how often, and let them do the arithmetic themselves. Clients who compute their own cost of delay become the strongest advocates for the work later.

**Sit with the discomfort of silence.** The second answer to a question is usually more honest than the first. Count to five before filling the gap.

**Never propose during discovery.** The moment you say "we could use AI to summarize that," the client stops describing their world and starts evaluating your idea. Write the idea in the margin and keep asking. You will still have it in an hour.

**Separate the stated request from the underlying need explicitly.** Keep two columns in your notes. "We want a chatbot" goes in the request column. "People ask us the same six questions and we answer them at eleven at night" goes in the need column. At the end of the session you will often find the need can be met without the requested solution at all — sometimes that six-question list is a page, not a chatbot.

**Listen for where AI does not fit.** Discovery that always concludes "yes, AI" is not discovery. If the work is deterministic, low-volume, and rule-based, a lookup table or a better form is the honest answer. If the consequence of error is severe and the process has no review step, the honest answer may be AI-assisted with mandatory human sign-off, which is a different product than the client imagined. Being the person who says this early is how you get invited back.

**Watch for the second audience.** Many requests have an end user nobody mentioned — the customer receiving the AI-drafted email, the applicant whose document is being read. Ask who is on the far end of the output. That person's experience is as much your design problem as the operator's.

## When the client is not one person

Discovery with a single sponsor is easy and usually wrong. Most work of any size has several stakeholders whose accounts of the same process will not match, and the mismatch is a finding rather than a nuisance. The sponsor describes the process as designed, the operations lead describes it as managed, and the person doing it describes it as survived. Where those three accounts diverge is exactly where a solution built from any one of them will fail.

Handle it by interviewing separately before you convene anyone. A group session held first collapses to the most senior voice in the room, and the practitioner will not contradict their manager in front of their manager. Talk to two or three people individually, note where their accounts differ, and bring the differences back as neutral questions: "the intake step was described to me two different ways — can we settle which one happens?"

Watch also for the request that arrives pre-approved by someone who has not been in any of these conversations. When a client says "leadership wants AI in the customer journey," you have a sponsor with a goal and no process knowledge, and you need to find whoever owns the process before you can discover anything at all. Ask directly: who would have to change how they work for this to succeed, and can I speak with them?

## Capturing what you heard

Take notes in a fixed shape so that writing them up is mechanical rather than creative. A workable notes template:

| Field | What to capture |
| --- | --- |
| Stated request | Their words, verbatim, in quotes |
| Underlying need | What the pain actually is, in your words |
| Trigger | What starts the work |
| Current steps | Numbered, with who does each |
| Volume | Per week, plus peak |
| Time per item | Typical / worst |
| Exceptions | How common, what they look like |
| Decision supported | What the output is used to decide |
| Cost of a wrong output | Who is harmed, how badly, who notices |
| Constraints | Data, legal, systems, calendar, budget |
| People | Doers, receivers, approvers, blockers |
| Current measures | Anything they already track |
| Their definition of better | Their words |
| Open questions | What you still need, and who has it |
| Evidence collected | Files, screenshots, samples you were given |

Write it up the same day, while your memory can still fill gaps, and send a short summary back to the client ending with "please correct anything I've got wrong." That message does two jobs: it catches your misunderstandings while they are still cheap, and it demonstrates that you were listening, which is most of what buys you the second conversation.

Discovery is not finished when the meeting ends. It is finished when the client reads your account of their own work and says yes, that is what happens here.

## Practice

Work with a partner. One of you plays a client, the other runs discovery. Then swap roles and run it again with a different brief.

1. **Set up the role.** The client picks one of these briefs and does not show it to the interviewer: (a) "We want an AI chatbot for our customer support inbox." (b) "We want AI to write our weekly management report." (c) "We need AI to read incoming PDF applications." The client then invents, privately and in writing, at least three facts the interviewer will only find by asking: a hidden exception case, a constraint on the data, and one person whose approval matters.
2. **Run a 30-minute discovery.** Use the question bank as a reference, not a script. You may not propose any solution during the session. Open with "walk me through the last time this happened."
3. **Fill in the notes template** from your notes alone, without asking follow-up questions afterwards. Leave gaps blank — blanks are findings.
4. **Write the two-column comparison.** Left column: the stated request, verbatim. Right column: the underlying need in one sentence, plus the specific evidence from the session that supports it. If the two columns say the same thing, you probably did not dig.
5. **Score yourself.** Ask the client whether you surfaced all three hidden facts. For any you missed, identify which question would have found it and add that question to your own copy of the bank.
6. **Write the recap email** — under 200 words, summarizing the work as you understood it, listing your open questions, and asking for corrections. Have the client mark every sentence that is wrong, and count them.
