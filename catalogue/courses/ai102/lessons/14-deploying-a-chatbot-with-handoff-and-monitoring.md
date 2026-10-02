---
lesson_id: ai102-14
course_id: ai102
pathway: prompt-engineer
title: Deploying a Chatbot with Handoff and Monitoring
order: 14
kind: lesson
competency_ids:
  - D2-S1-C04
objectives:
  - Deploy a chatbot to a real channel with human handoff and usage monitoring in place
---

## Deployment is a set of commitments

You have a designed bot and a grounded one. Deployment is the step where it stops being yours and becomes the organisation's, and the change is bigger than clicking publish.

Before it goes live, the bot is an artefact you can change at will and whose mistakes cost nothing. After, it is a channel your customers use, which means it carries commitments: that someone is available when it escalates, that its answers are being checked, that a bad one can be stopped in minutes, and that somebody owns it next quarter. A deployment without those commitments is not a launch, it is an exposure.

So the work in this lesson divides into three parts, and the order is deliberate: get it onto a channel, make the human handoff actually work end to end, and put monitoring in place before real people arrive rather than after.

## Choosing and configuring the channel

The channel decides who reaches the bot and in what state, and each one changes the design you inherited from lesson 12.

**A website widget** is the most common. It reaches anonymous visitors, which means you usually do not know who they are — so record lookups need a verification step, and the bot's scope skews toward knowledge questions. Placement matters: on a pricing page the questions are pre-sale, in a customer portal they are support, and the same bot serving both will underperform at each.

**Inside an authenticated product or portal** is the best case, because the signed-in user's identity travels with the conversation. Record questions become answerable without asking anyone to prove who they are, and the bot can be genuinely useful rather than merely informative.

**A messaging channel** — a team chat platform, or a customer-facing messaging app — reaches people where they already are, with the trade-off that formatting is constrained and threading behaviour differs.

**Email** is the channel people forget. A bot that drafts replies in an inbox for a human to approve is often more valuable and much lower risk than a live chat bot, because there is a person between the model and the customer by construction.

Whatever the channel, configure these before publishing:

```text
Placement:        which pages or which inbox
Trigger:          on click only, or proactive after N seconds
Availability:     hours the bot runs, hours humans cover escalations
Identity:         anonymous, verified by email, or authenticated session
Greeting:         the text agreed in the design document
Disclosure:       states clearly that this is an automated assistant
Consent notice:   link to how the conversation is stored and used
Escape hatch:     visible route to a human in the first message
Fallback:         behaviour when the bot service is unreachable
```

Two of those cause trouble when left at defaults. **Proactive triggering** — the widget popping open unprompted — annoys people and inflates your conversation count with sessions nobody wanted, which then distorts every metric you compute. Start with click-to-open. And the **fallback when the bot itself is down** must be something other than a spinning indicator: a plain form, an email address, or a message saying the assistant is unavailable. That failure will happen, and a silent widget makes the whole site look broken.

Set up a **staging deployment** first — a copy of the bot on a non-public page or a test channel, with the same configuration and, where possible, separate credentials per lesson 11. Everything below gets exercised there before any customer sees it.

## Rolling out in stages

Do not go from zero to every visitor. Four stages, with a gate between each.

**Stage 1 — internal only.** Team members only, on a staging page, for at least a week. Ask everyone to try to break it and to log anything embarrassing. This is where you find the answer that quotes an internal document and the greeting with the wrong company name.

**Stage 2 — limited exposure.** A single low-risk page, or a small proportion of visitors, or one segment. Enough traffic to produce real questions, small enough that a bad week is survivable. Watch the refusal log from lesson 13 daily.

**Stage 3 — full deployment on the primary channel**, once the metrics from the previous stage clear the thresholds you set in your design document.

**Stage 4 — additional channels**, one at a time, re-testing at each, because a bot tuned for a web widget will format badly in a messaging app.

Define the gate between stages as numbers, not as a feeling: a minimum number of conversations observed, a hallucination rate of zero on your evaluation set, an escalation path demonstrated end to end with a real agent, a maximum acceptable false-refusal rate, and no unresolved item on the internal embarrassment log. Writing the gates down before stage 1 is what stops a launch date from overruling a quality problem.

Have a **rollback** ready before stage 2: a documented way to disable the bot in under five minutes, tested by actually doing it. Know who is allowed to press it, and make sure that is more than one person and does not require the person on holiday.

## Making handoff real

The design document specified the escalation triggers and the handoff package. Deployment is where those meet an actual human with an actual queue, and that seam is where most chatbot projects fail in a way the demo never revealed.

**Route to somewhere real.** The handoff must land in the system your team already works in — a helpdesk queue, a shared inbox, a chat channel with a rota — not a new place they have to remember to check. A handoff into a channel nobody watches is worse than no handoff, because the customer was told a human was coming.

**Carry the context.** Deliver the package from lesson 12 with the transcript, the detected intent, the escalation reason, the slots already collected, and the customer's identity. The agent should never have to ask a question the bot already asked.

```json
{
  "conversation_id": "conv_01HZ8P2K4M",
  "escalation_reason": "repeated_failure",
  "customer": { "email": "dana@northgate.example", "tier": "Priority" },
  "detected_intent": "cancel_request",
  "slots_collected": { "request_ref": "REQ-2026-0184" },
  "transcript_url": "https://.../conversations/01HZ8P2K4M",
  "waiting_since": "2026-03-04T09:14:22Z",
  "sla_target_minutes": 15
}
```

**Tell the customer what is happening, with a real number.** "I'm passing you to the team" is incomplete. "I'm passing you to the team — someone usually replies within fifteen minutes during office hours" sets an expectation, and the number must be one the team confirms it can meet.

**Handle the out-of-hours case that was designed in lesson 12.** Implement it, do not just document it: outside covered hours the bot takes a message, records it as a ticket in the queue, states when the team is next available, and confirms what will happen. Then test it by setting your system clock or your availability schedule to an out-of-hours window and running a real escalation.

**Decide and implement the ownership switch.** Once a human takes the conversation, the bot must stop replying. Nothing destroys trust faster than an automated message interrupting a live agent. Whatever the mechanism your platform offers — an agent-takeover state, a flag on the conversation — configure it and verify it.

**Instrument the queue itself.** Track time-to-first-human-response, the number of escalations abandoned before an agent replied, and escalations that arrived outside covered hours. Those three numbers tell you whether the handoff promise is real, and they are the ones a customer would care about most.

## Preparing the humans on the other side

The handoff is only half a mechanism; the other half is a person who knows what to do with it. Teams that skip this get a predictable pattern — agents ignore bot escalations because they arrive without context, customers repeat themselves, and within a month the escalation queue is treated as a second-class inbox.

Brief the agents on five things, in about twenty minutes.

**What the bot can and cannot do.** Give them the in-scope and out-of-scope tables from lesson 12 verbatim. An agent who knows the bot never quotes prices can answer "the bot said..." questions confidently, and an agent who does not will assume the worst about anything a customer reports.

**What arrives with an escalation.** Walk them through a real handoff package: where the transcript is, what "escalation reason" means, and which slots the bot already collected. The single sentence that changes behaviour is "you already have their request reference — do not ask for it again."

**How to take over, and what happens to the bot.** Show the takeover action and confirm in front of them that the bot goes silent. Agents who are not sure of this hedge, and hedging reads to the customer as confusion.

**How to report a bad answer, in one click.** A button on the conversation that files the transcript into a review table with a reason. This is your highest-value quality signal — it is a human who has just read the whole conversation telling you exactly where the bot was wrong — and it costs an afternoon to build. Make it one click, because a three-field form gets used twice and then never.

**What to say about the bot.** Agree the line. "That's our automated assistant — it handles common questions and passes anything else to us" is honest, brief, and does not throw the tool under a bus. Agents improvising their own descriptions produce a range from apologetic to defensive, and customers notice.

Finally, close the loop with the agents. Show them, monthly, what changed because of their flags — the content they caused to be rewritten, the intent that got added, the false refusal that got fixed. A feedback mechanism with no visible effect stops being used within about six weeks, and when it stops you lose the only ongoing quality signal that comes from someone who read the whole conversation.

## Monitoring: what to watch and where it comes from

Monitoring is not a dashboard you look at once. It is a small set of numbers with owners, thresholds, and a review cadence, plus alerts for the things that cannot wait for the review.

**The weekly numbers**, from the metric definitions you fixed in lesson 12:

```text
Conversations started                        volume, and the denominator for the rest
Containment rate                             resolved without a human and not abandoned
Escalation rate, split by the six reasons    the breakdown is the diagnosis
Abandonment rate                             left mid-conversation, no resolution
Time to first human response                 the handoff promise, measured
Answer accuracy, human-sampled               20 conversations read and scored
Refusals, by reason code                     the content roadmap from lesson 13
Top unanswered questions                     what to build next
Customer rating                              one tap at conversation end
Cost per conversation                        model tokens plus platform costs
```

The two most informative are the ones that are not headline figures. **Escalation reasons** diagnose the bot: a spike in "explicit request" means people do not trust it; a spike in "repeated failure" means scope or retrieval; a spike in "out of scope" means the greeting is over-promising. And **abandonment** catches the failure that containment hides — a conversation that ended without escalation and without resolution counts as contained under a naive definition and is actually your worst outcome.

Store all of it in the database from lesson 05 rather than only in the chatbot platform's own analytics. One row per conversation with the fields above lets you join to your other data, keep history beyond the platform's retention window, and answer questions the vendor's dashboard cannot.

```text
Conversations
  Conversation Id     single line text  [primary]
  Started At          date with time
  Ended At            date with time
  Channel             single select
  Customer Email      email
  Detected Intent     single select
  Turns               number
  Outcome             single select   (resolved | escalated | abandoned | error)
  Escalation Reason   single select
  Escalated At        date with time
  First Human Reply   date with time
  Rating              number
  Refusal Count       number
  Tokens In           number
  Tokens Out          number
  Flagged For Review  checkbox
  Review Notes        long text
```

Populate it with an automation from lessons 03 or 04, triggered by the platform's conversation-ended webhook per lesson 10, or on a schedule pulling from its API per lesson 09. This is the point in the course where the earlier lessons stop being separate skills.

**Alerts** are for the things that must not wait a week. Wire each to a channel a human reads:

- The bot service is failing or unreachable — immediate.
- Escalations are queued beyond the promised response time — immediate.
- Hourly conversation volume is far above or far below normal; both directions mean something is wrong.
- Any conversation flagged by an agent as a bad answer — same day.
- Any conversation containing risk language — legal, threat, safety — immediate, regardless of what the bot did.
- Model or platform spend has passed a set fraction of the monthly budget — same day.

## The operating loop

After launch, the bot needs a recurring routine or it will decay exactly as the grounded content does.

**Weekly, thirty minutes.** Read twenty sampled conversations end to end — not summaries. Read every refusal and every agent-flagged answer. Update content where content was the problem. Add anything genuinely new to the evaluation set. Record the week's numbers against the previous week.

**Monthly.** Review the top unanswered questions and decide whether each becomes new content, a new intent, or a permanent out-of-scope entry. Re-run the full evaluation set from lesson 13. Check cost against forecast. Confirm every credential in the connection register from lesson 11 is still valid.

**On any change** — new content, a prompt edit, a retrieval setting, a platform update — re-run the evaluation set before it reaches production. Platform-side model updates happen without your involvement, which is why a scheduled re-run matters even in a week when you changed nothing.

Two governance points to settle before launch rather than after. **Privacy**: transcripts contain whatever customers typed, which will include personal data whether or not you asked for it. Decide a retention period, implement deletion, know how you would honour a data request, and disclose the processing in the widget. **Ownership**: name the person accountable for the bot's answers and the team accountable for escalations, in the handover document. A bot with no owner is switched off within a year by someone who cannot find out whether it still works.

## Practice

Deploy the bot you designed in lesson 12 and grounded in lesson 13.

1. **Configure and stage.** Deploy to a non-public staging channel with every setting in this lesson's configuration list explicitly chosen, including the greeting, the disclosure, the consent notice, and a real fallback for when the bot is unavailable. Show the fallback by disabling the bot and loading the page.

2. **Write the rollout gates.** Define numeric gates between all four stages, agreed before you start. Then run stage 1 for real: at least five colleagues, at least twenty conversations, and a log of everything embarrassing they found, with a fix or a decision recorded against each.

3. **Build the handoff end to end.** Escalate into the system your team actually uses, carrying the full package. Have a real person receive it, take over, and reply. Measure time to first human response. Confirm the bot stopped replying once the human took over.

4. **Test out-of-hours.** Set availability so you are outside covered hours, escalate, and show what the customer sees, where the message landed, and what promise was made. Then confirm with whoever covers the queue that the promise is one they can keep.

5. **Test the rollback.** Time yourself disabling the bot completely from a cold start, using only your written instructions. If it takes more than five minutes, or if only you can do it, fix that and re-test with a colleague doing it instead.

6. **Build the conversation log and populate it automatically.** Create the Conversations table, and wire an automation — webhook or scheduled API pull — that writes one complete row per conversation. Run at least thirty conversations through it and show thirty accurate rows, including outcome and escalation reason.

7. **Build the weekly dashboard.** Every metric in this lesson's list, computed from your own table rather than the vendor's analytics, with a named owner and a threshold for each. Include the containment definition that excludes abandonment, and show the difference between the naive and honest figures for your data.

8. **Wire five alerts and prove three.** Implement all six alert conditions, then deliberately trigger the service-failure, queued-escalation, and risk-language alerts and show each arriving in a channel a human reads, with enough information to act on.

9. **Run one full weekly review.** Read twenty conversations, every refusal, and every flagged answer. Produce the review output: content changes made, evaluation-set additions, metric movements against the prior period, and one recommendation. State how long it took.

10. **Write the handover section.** Two pages: what the bot does and does not do, where its content lives and who owns each document, how to change a prompt safely, the rollback procedure, the alert list and who receives them, the connection register entries it depends on, and the named owners for answers and for escalations. Have someone who did not build it follow it to make one small content change.
