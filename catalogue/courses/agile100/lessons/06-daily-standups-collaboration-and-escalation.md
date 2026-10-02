---
lesson_id: agile100-06
course_id: agile100
pathway: quality-assurance-software-engineer
title: Daily Standups, Collaboration, and Escalation
order: 6
kind: lesson
competency_ids:
  - D1-S1-C04
  - D2-S1-C05
  - D5-S1-C04
objectives:
  - Collaborate daily with a team and escalate issues clearly
---

## The daily standup

The daily standup is a short, time-boxed sync — usually 10 to 15 minutes, same time every day — where each person answers three questions:

1. What did I do yesterday (toward the sprint goal)?
2. What am I doing today?
3. Is anything blocking me?

It is not a status report to a manager and not a problem-solving session — if a question needs real discussion, the standard move is to flag it and take it offline ("let's grab five minutes after this"), so the standup stays short for everyone. Its whole value is that it happens every day, so problems surface within 24 hours instead of festering until the next weekly meeting.

## What a QA engineer reports

Your three answers look a little different from a developer's, because your "done" is verification, not code:

```text
Yesterday: Finished test cases for STORY-101 (wishlist), found and filed
           1 defect (duplicate wishlist entries — see BUG-142)
Today:     Retesting BUG-142 once dev confirms the fix; starting
           STORY-108 regression pass
Blocking:  None
```

Compare that to something vague and useless: "Yesterday I did some testing. Today more testing." The first version tells the team exactly what's verified, what's found, and what's next — the second tells them nothing they could act on.

## Escalating a blocking defect

Most days, standup is routine. Some days, you've found something that threatens the sprint — a defect severe enough that it blocks other work, blocks the release, or signals a deeper problem. That's when "report" becomes "escalate," and getting the clarity and detail right (D2-S1-C05) is the single highest-leverage communication skill this lesson teaches.

An escalation that works has four parts, in this order:

1. **What's blocked, plainly, first.** Lead with the impact, not the investigation. "The checkout flow is broken for all guest users" gets attention; "I was poking around in the payment service and noticed something weird" does not, even if it's the same underlying bug.
2. **Reproduction, concretely.** Exact steps, so anyone can see it themselves without asking you follow-up questions. "It's broken sometimes" forces the listener to do your job for you.
3. **Scope and severity.** Who's affected, how badly, and since when. "All guest checkouts, 100% reproduction, since this morning's deploy" is instantly triageable; "some users might be affected" is not.
4. **What you need, specifically.** A decision, a person, or a piece of information. "I need someone with prod log access to confirm this started with today's deploy" is actionable; "someone should probably look at this" is not.

### Worked example: escalating in standup

```text
Yesterday: Ran regression on the checkout flow after STORY-108's search fix
           merged.
Today:     BLOCKING ISSUE — need to flag now, not wait for my update:
           Guest checkout is failing 100% of the time as of this morning's
           deploy. Steps: add any item to cart while logged out, proceed to
           checkout, submit payment info -> 500 error, no order created.
           Confirmed on staging and prod. This blocks anyone not logged in
           from buying anything. Filed as BUG-150, marked Critical.
           I need someone with deploy history to help confirm which change
           introduced it — I can pair on that right after standup.
Blocking:  The above.
```

Notice the shape: impact first, then exact reproduction, then scope/severity, then a specific ask. This is the same discipline as the defect record you'll build in Lesson 07 — an escalation is really a defect report compressed for a live, time-boxed conversation.

### What NOT to do

- Don't bury the blocker at the end of a long update — say it first if it's genuinely blocking.
- Don't escalate everything at "critical" volume — if minor issues get the same urgency as a broken checkout, the team stops trusting your signal. Reserve escalation language for things that actually block work or a release.
- Don't wait for standup if something is actively blocking right now — message the right person immediately, and use standup to confirm status, not to be the first notification.

## Collaborating with the team beyond standup (D1-S1-C04, D5-S1-C04)

Standup is the most visible collaboration touchpoint, but effective teamwork happens in the gaps around it too:

- **Pairing.** When a defect is hard to reproduce or a fix needs verification against something only the developer understands, sitting down (or screen-sharing) together for fifteen minutes often resolves what would take a day of back-and-forth comments.
- **Asking, not assuming.** If an acceptance criterion's intent is unclear mid-sprint, ask the Product Owner or the developer directly rather than guessing and testing against your guess.
- **Being findable and responsive.** A QA engineer who takes six hours to respond to "can you confirm this bug still repros?" becomes a bottleneck the team routes around — and starts skipping.
- **Working across roles**, not just alongside them (D5-S1-C04): design decisions, implementation tradeoffs, and test coverage are entangled. A QA engineer who joins a design discussion for even five minutes, or explains to a developer exactly how a fix will be verified, produces better outcomes than one who waits silently for a "ready for QA" handoff.

Collaboration and escalation are the same skill at different volumes: both are about giving the right person the right information at the right time, clearly enough that they can act without needing to ask you what you meant.

## When standup is written, not spoken

Not every team stands in a circle every morning. Distributed or asynchronous teams often run standup as a written update posted to a shared channel by a fixed time each day, with the team reading and reacting on their own schedule rather than all meeting live. The three questions and the escalation structure don't change — what changes is that you lose the immediacy of a live room, so two habits matter more:

- **Still say it the moment you find it, not at the fixed posting time.** If a blocking defect surfaces at 10am and the written standup isn't posted until 9am tomorrow, waiting to escalate it in that post costs the team a full day. Post or message immediately; use the standup channel to summarize, not to be the first notice.
- **Write for someone who wasn't in your head.** A live standup lets people ask a clarifying question on the spot. A written one doesn't, until someone reads it — possibly hours later, possibly overnight. Include the detail a live update could get away with skipping: exact repro steps, not "the usual bug," and enough context that a reader three time zones away can act without a reply first.

Whether spoken or written, the underlying discipline from this lesson is the same: report clearly every day, and escalate the moment something actually blocks the team.

## Practice

You've just found this while testing: an admin user can delete another admin's account without any confirmation prompt, and there's no audit log entry when it happens. You discovered it 20 minutes before today's standup.

1. Write your full standup update (Yesterday / Today / Blocking) including this as a blocking escalation, following the four-part structure (impact first, reproduction, scope/severity, specific ask).
2. In two sentences, explain why this specific defect deserves escalation-level urgency rather than a routine ticket filed for later triage.
