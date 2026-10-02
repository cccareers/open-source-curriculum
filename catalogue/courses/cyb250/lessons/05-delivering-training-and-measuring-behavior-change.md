---
lesson_id: cyb250-05
course_id: cyb250
pathway: cybersecurity-support-technician
title: Delivering Training and Measuring Behavior Change
order: 5
kind: lesson
competency_ids:
  - D5-S1-C05
objectives:
  - Deliver a short awareness session and choose metrics that show whether behavior actually changed
---

## Delivery is where programs are won or lost

You designed a program in lesson 04. Now you have fifteen minutes in front of thirty warehouse staff at a shift handover, or a slot at the end of a finance team meeting where everyone is watching the clock. Whatever you designed is worth exactly what you can transmit in that room.

The good news is that adult audiences are predictable, and a handful of working principles cover nearly all of it. You are not being asked to become an instructional designer; you are being asked to run a short session well.

**Adults need to know why before they will engage with what.** A session that opens with content has already lost the people who are deciding whether to pay attention. Open with the reason — ideally an incident that happened here, to people like them.

**They bring experience, and using it beats overriding it.** "Has anyone had one of these?" produces better material than any example you could invent, and it converts the room from audience to participants. Someone always has a story.

**They are problem-centred, not subject-centred.** Nobody wants a taxonomy of attack types. They want to know what to do when the phone rings and someone claims to be from IT. Frame every session as a problem they recognize.

**They need to apply it immediately.** The behavior you teach should be usable that same day, with something they already have. If it requires a tool they cannot access or a permission they do not hold, you have taught frustration.

**They must not be talked down to.** The fastest way to lose a room of experienced people is to imply they are the weak link. They are the sensor network. Say so and mean it.

## Designing a short session

**One behavior. One session.** The most common failure in awareness delivery is covering six topics adequately instead of one topic well. If the group can only do one new thing tomorrow, decide now what it is, and cut everything that does not serve it.

A structure that reliably works in ten to fifteen minutes:

1. **Hook, 1 minute.** A real, anonymized local incident. "Six weeks ago someone here got a call from a person who knew the name of our facilities supplier and the date of the office move." Specific and local beats dramatic and generic every time.
2. **Why it works, 3 minutes.** The lever, named. Not a red-flag list — the pressure. This is the transferable part, and it is the reason lesson 02 came first.
3. **The behavior, 2 minutes.** Exactly what you want them to do, stated as an action with no conditions attached. "Verify with a number you already had." "Report it with the button; you do not need to be sure."
4. **Practice, 5 minutes.** They do it, not you. Two described interactions, small groups, name the pressure and say what they would do. This is the part people cut when time is short, and it is the part that produces the behavior change.
5. **The ask and the safety net, 2 minutes.** One sentence on what you want from them, where to report through every channel, and the explicit reassurance that reporting something harmless is a success and that anyone who has already clicked something should call, today, and will not be in trouble.
6. **Questions, until they stop.** The questions are the most valuable data in the session. Write them down.

**Content rules for the room.** No jargon you have not defined in the same sentence. No fear as a motivator — fear produces silence, and silence is the thing you are trying to eliminate. No shaming stories, ever, including anonymized ones told in a tone of amusement; the room will assume you talk about them the same way. Numbers over adjectives. And be honest about the limits: "this one is genuinely hard to spot, which is why the verification step exists and why nobody is expected to catch it by eye."

**Adapt to the setting.** A shift briefing is standing, noisy, and five minutes long — one behavior, one story, a card in the hand, done. A finance team session can be thirty minutes and should be mostly their own payment scenarios. An executive briefing is fifteen minutes, one-to-one or small, and is about their exposure and the norms they set for their assistants; executives are also the people most able to authorize the process changes you need, so treat the session as both training and a request. A virtual session needs a question every three minutes or you are talking to a wall of muted rectangles.

**Handle the predictable objections without defensiveness.**

- *"We're too busy for this."* Agree, then make the cost concrete: reporting is one click, verification is one phone call, and the alternative last time cost a five-figure payment and three weeks of finance's time.
- *"Why does IT make everything so hard?"* Legitimate grievance, often accurate. Acknowledge it, and take one specific friction point away as an action. This buys more credibility than any slide.
- *"I already know all this."* Probably true for the recognition part. Redirect to the part that is not knowledge: the reporting path, the response times, the verification procedure for their specific role.
- *"What if I report something and it turns out to be nothing?"* The most important question anyone will ask you. Answer it emphatically and publicly.

**When someone tells you they clicked.** This is delivery too, and it matters more than any session. Thank them first, before anything else. Get the facts fast and flatly — what did you enter, did you approve a prompt, what time. No sighing, no teaching in the moment, no "you should have noticed." Tell them what you are doing and that they did the right thing by telling you. The learning conversation happens days later if at all, and it is about the process, not the person. Every future report in that department depends on how this one goes.

## Measurement: what to count and what not to

Here is the honest situation. Awareness is one of the easiest security functions to fund and one of the hardest to defend, because the usual metric is worthless and everyone half-knows it.

**Why click rate alone fails.** It is entirely determined by lure difficulty, so it measures your campaign design rather than your workforce. It goes down when you send easier lures, which is a strong and unspoken incentive. It says nothing about what happened next — a click and an immediate report is a good outcome, and a click with silence is an incident. It ignores the people who spotted it and did nothing. And used punitively it corrupts its own data, because staff learn to avoid the test rather than the attack.

Click rate is not useless; it is a component. It is a denominator problem waiting to happen if it is your headline.

**The metrics that actually mean something.**

| Metric | What it tells you | Direction |
| --- | --- | --- |
| Report rate | What proportion of recipients told you | Up |
| Time to first report | How long an attack sits undetected | Down |
| Report rate among those who clicked | Whether the no-blame culture is real | Up |
| Reports on real messages per month | Whether the sensor network is live between campaigns | Up, then steady |
| Share of real campaigns first detected by a human report | Awareness as a detection control, in one number | Up |
| Time from first report to tenant-wide purge | Your own process speed, not the workforce's | Down |
| Repeat-interaction cohort size | Where targeted support is needed | Down |
| Verification requests to the service desk | Whether the out-of-band habit is spreading | Up |
| Payment-change verifications completed correctly | Compliance with the control that stops BEC | Up, toward 100% |
| Unsolicited MFA prompts reported rather than approved | Direct evidence of the behavior that stops token theft | Up |
| Coverage and reach by audience | Whether the deskless and contractor populations are actually included | Up |
| False-positive report rate | Best read as a health signal, not a cost | Steady or gently up |

That last row deserves an explanation, because managers will challenge it. A rising volume of harmless reports means people are willing to report when unsure. Suppressing it by discouraging uncertain reports raises your time-to-report on real attacks. Budget triage capacity for it and say so out loud; it is a cost you are choosing deliberately.

**Leading and lagging.** Report rate and verification-habit metrics are *leading* — they move first and predict outcomes. Incidents, losses, and dwell time are *lagging* — they are what the business cares about and they move slowly and noisily. Report both. A scorecard of only leading indicators looks like activity; a scorecard of only lagging indicators cannot show progress within a budget cycle.

**Four levels, at working depth.** A useful mental ladder, borrowed from training evaluation and cut to what you can actually collect:

- *Reaction* — did they find it useful? Two questions after a session. Cheap, weak evidence, still worth having because it catches a session that is failing.
- *Learning* — can they recognize the pressure? A three-question check embedded in the session, not a graded exam.
- *Behavior* — did they report, verify, refuse? This is the level that matters and the level almost everyone skips, because it requires operational data rather than a survey.
- *Results* — did incidents, losses, or dwell time change? Slow, confounded, and the only level a finance director genuinely cares about. Claim it carefully.

**Measure it honestly.** A few disciplines separate a defensible scorecard from a decorative one:

- **Baseline before you intervene.** Without a pre-program measurement you have no claim to improvement at all.
- **Normalize for difficulty.** State the difficulty tier of every simulation alongside its numbers, and never compare across tiers as though the difference were progress.
- **Get the denominator right.** Delivered to inbox, not sent. Recipients who were at work, not headcount.
- **Segment by audience.** An aggregate that hides a finance team at 8% report rate behind a company average of 40% is worse than no number.
- **Watch for confounders.** A new mail gateway, a reorganization, a seasonal peak, or a real attack in the same week will all move your numbers.
- **Small numbers are noise.** A team of nine going from one click to two is not a trend, and presenting it as one destroys your credibility with anyone numerate.
- **Never publish individual results, and never build a leaderboard of failure.** Team-level and cohort-level only. A public list of who clicked buys you one quarter of compliance and permanent silence afterward.

**Reporting upward.** One page, monthly or quarterly. Lead with the answer, the way lesson 03's explanations do: what changed, what it means, what you need. Three or four numbers with their trend, one paragraph of narrative that says what the numbers do *not* prove, one concrete decision you are asking for. The strongest single sentence available to you is a real one, so earn it: "of the four credential-harvesting campaigns that reached inboxes this quarter, three were first detected by an employee report, at an average of nine minutes." That is awareness working as a detection control, in a form a director can act on.

Be equally direct about what awareness cannot do. If a lure is good enough, people click — you included. When your numbers show that, the correct recommendation is not more training; it is a technical or process control: phishing-resistant authentication, mandatory out-of-band verification for payment changes, a dual-authorization threshold. **A mature awareness function recommends controls that make its own metric less load-bearing.** Managers notice when you argue against your own budget's importance, and it is the fastest route to being believed.

## Practice

**Part 1 — Design and deliver a session.** Choose one audience from Merrow Fields Logistics in lesson 04 — the depot shift, the finance team, or the executive group — and one behavior. Produce:

- A session plan on one page: audience, the single behavior, the local hook, the lever you will name, the practice activity with the two described interactions you will use, the ask, and your timings for each segment adding to no more than fifteen minutes.
- Any handout or card, at most one side.
- **A recording of yourself delivering it**, to a real listener if you can get one, of ten to fifteen minutes. It must include the practice activity — talking through what the activity would be does not count.

Then write a half-page self-critique: where you used undefined jargon, where you used fear, where you talked instead of letting them work, and what you would cut to save two minutes.

**Part 2 — Answer the hard questions.** Write your answer, as you would say it aloud, to each of these. Two or three sentences each.

1. "What if I report something and it turns out to be nothing? Am I wasting your time?"
2. "I got an email that looked exactly like a real one from our supplier. How was I supposed to know?"
3. "Why are you testing us? Don't you trust us?"
4. "I clicked something last week and didn't tell anyone. Is that bad?"
5. "We have MFA. Doesn't that solve this?"
6. "Honestly, we don't have time for this."

For question 4, note in one extra line what you would do operationally in the next five minutes.

**Part 3 — Build a scorecard.** Design the one-page quarterly scorecard for the Merrow Fields program. Include six to eight metrics, and for each: its definition including the exact denominator, its data source, its collection frequency, whether it is leading or lagging, and the decision it supports. Add a short narrative section template. Then write a paragraph naming the two metrics you deliberately excluded and why.

**Part 4 — Critique a bad dashboard.** A manager presents this quarterly summary and asks you to review it before it goes to the board:

```text
Q3 Security Awareness Results
- Training completion: 97% (target 95%) - GREEN
- Phishing simulation click rate: 4% (Q2: 11%) - improvement of 64%
- Top 10 repeat clickers identified and forwarded to line managers
- Awareness emails sent: 14
- Reported emails: 620 (of which 580 were not malicious - 94% false positives)
```

Write a review identifying at least five problems. For each, state the problem, why it misleads, and the replacement metric or wording you would use. At least one of your findings must concern the ethics of what is being reported rather than its accuracy. Finish with the three-sentence summary you would actually put at the top of the corrected page.

**Deliverable:** the session plan, the handout, the recording, the self-critique, the six answers, the scorecard, and the dashboard review, submitted together.
