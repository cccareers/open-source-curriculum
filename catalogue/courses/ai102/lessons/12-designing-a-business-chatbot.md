---
lesson_id: ai102-12
course_id: ai102
pathway: prompt-engineer
title: Designing a Business Chatbot
order: 12
kind: lesson
competency_ids:
  - D2-S1-C04
objectives:
  - Design a business chatbot's scope, conversation flow, and escalation path before building it
---

## Why this lesson has no building in it

A chatbot is the most demonstrable thing in this course and the most frequently abandoned. The pattern is consistent: someone connects a model to a chat widget in an afternoon, it answers questions impressively in a demo, it goes live, and within a month it is quietly removed. The cause is almost never the model. It is that nobody decided what the bot was for, what it must refuse, what happens when it does not know, or how anyone would tell whether it was working.

Those decisions are design work, and they are cheap to make on paper and expensive to retrofit. So this lesson produces a document, not a bot. The next two lessons build and deploy what this one specifies.

There is a second reason to slow down. A chatbot is the only thing in this course that talks directly to your customers in your organisation's voice, unsupervised, at scale. An automation that fails writes a bad record. A chatbot that fails tells four hundred people something wrong, rudely, in public. The design work is proportionate to that exposure.

## Scope: what it is for and what it must refuse

Start with the **jobs to be done**. Not "answer customer questions" — that is not a scope, it is an aspiration. Name the three to five specific things a person actually arrives wanting, in their words.

The best source is real conversation data: the last two hundred support emails, the chat transcripts, the questions the team answers most often. Sort them by frequency, and you will typically find that a small number of intents cover most of the volume. That distribution is the argument for building anything at all, and it tells you where to spend effort.

For the content agency running through this course, an inventory might show: "where is my draft" (31%), "how do I request something" (18%), "what does this cost / how do I get a quote" (14%), "change or cancel a request" (11%), "billing and invoices" (9%), everything else (17%).

From that, write two lists and make the second one longer than feels comfortable.

**In scope.** For each item, the intent, the evidence it is common, the source of truth for the answer, and what a good answer looks like. If you cannot name a source of truth — a document, a database field, an API — it is not in scope yet, because the next lesson has nothing to ground it in.

**Out of scope, explicitly.** Not "everything else." Name the things people *will* ask that the bot must not answer, with what it should do instead:

```text
OUT OF SCOPE                        BOT BEHAVIOUR
Pricing negotiations / discounts    Hand to account manager, do not quote
Contract or legal questions         Hand to a human, no interpretation
Complaints and refunds              Hand to a human immediately, acknowledge only
Anything about a named individual's Refuse, offer to connect to their manager
  performance
Medical, legal, financial advice    Refuse, state it is out of scope
Competitor comparisons              Refuse politely, offer product information
Personal data about another         Refuse, do not confirm the person exists
  customer
```

The out-of-scope list is where most of the risk lives, and writing it is the highest-value thirty minutes in this lesson. Get it reviewed by whoever owns the risk — a manager, a compliance function, a legal contact — before anyone builds anything.

Then set a **containment target**. Containment is the proportion of conversations the bot resolves without a human. A realistic first target for a narrow scope is somewhere around half, and stating a number matters more than the number itself, because it converts "is the bot good?" from an argument into a measurement. Pair it with a floor: an accuracy or satisfaction level below which you would switch it off regardless of containment, since a bot that resolves everything by giving wrong answers is worse than no bot.

## The conversation flow

Sketch the whole conversation before designing any part of it. Six stages appear in nearly every business chatbot.

![Conversation stages from greeting through intent capture, slot filling, and resolution, with escalation branches leaving from each stage to a human queue](./img/chatbot-conversation-flow.png)

**Greeting and framing.** The first message sets expectations, and it is the cheapest place to prevent disappointment. Say what this is, what it can help with, and that a human is available. Three sentences at most.

> Hi — I'm the Northgate assistant. I can check the status of your requests, explain how to submit a new one, and answer questions about our process. I'm an automated assistant; type "agent" at any point and I'll pass you to the team.

Two deliberate choices there: it states its own limits, and it publishes the escape hatch in the first message. Hiding the route to a human is the fastest way to make people distrust the whole thing.

**Intent capture.** Work out what the person wants. An open question invites natural phrasing and covers cases your buttons do not. Buttons are faster, unambiguous, and cannot be misclassified. Most good designs use both: buttons for the top three intents, plus a free-text option. Decide, and write down, how many attempts you allow before giving up and escalating — two is a reasonable default, three is the maximum anyone tolerates.

**Slot filling.** Gather what the answer requires. To check a draft's status you need a request reference or an email address. Design each slot with: what you are asking for, an example of the format, what to do if the answer does not parse, and how many times to re-ask. Ask for one thing per message. Never ask for something you can look up — if the person is authenticated, you already know their email, and asking for it makes the bot feel like a form.

**Confirmation before action.** Anything that changes state — cancelling a request, updating a date, submitting something — gets an explicit confirmation showing exactly what will happen. This is not politeness; it is the last checkpoint before an automated system does something on a customer's behalf based on a model's interpretation of a sentence.

> Just to confirm: cancel request REQ-2026-0184, "Spring range product copy", due 18 March? Reply **yes** to cancel or **no** to keep it.

**Resolution.** Answer, and then close the loop: say whether that resolved it, and offer the human route if not. A resolution with no check is how a bot records a success for a conversation the customer left in frustration.

**Escalation.** Its own section below, because it is the part most often left as an afterthought.

Two cross-cutting behaviours belong in every flow. **A universal escape**: the words "agent," "human," "person," and "representative" always work, from anywhere, regardless of state — this is not a special case, it is a global rule. And **a global reset**: "start over" returns to intent capture, so a person stuck in a slot-filling loop has a way out that is not closing the tab.

## Escalation: the decision that defines the bot

Escalation is not what happens when the bot fails. It is a designed outcome, chosen as often as it is needed, and a bot with no good escalation is a bot that traps people.

**Define the triggers explicitly.** Six, and each should be implemented as its own condition:

1. **Explicit request.** The person asks for a human, in any of the words listed above. Immediate, no confirmation, no "are you sure I can't help?"
2. **Out-of-scope topic.** The intent matches the out-of-scope list. Immediate.
3. **Repeated failure.** Two consecutive turns where the bot could not understand or could not answer. Counting turns rather than judging quality is what makes this reliable.
4. **Low confidence.** The retrieval or classification confidence falls below your threshold. Prefer escalating to guessing, especially early in a bot's life.
5. **Negative sentiment or risk language.** Frustration, threats, mentions of legal action, complaints, or safety concerns. This should escalate even when the bot could technically answer.
6. **High-value or high-risk context.** A priority-tier customer, a large account, an active complaint. Some conversations should reach a human on principle.

**Design what gets handed over.** The most common complaint about chatbot handoff is being asked to repeat everything. The handoff package should contain, at minimum:

```json
{
  "conversation_id": "conv_01HZ8P2K4M",
  "customer": { "name": "Dana Okafor", "email": "dana@northgate.example", "tier": "Priority" },
  "detected_intent": "cancel_request",
  "escalation_reason": "explicit_request",
  "confidence": 0.42,
  "slots_collected": { "request_ref": "REQ-2026-0184" },
  "transcript": "...full conversation...",
  "suggested_next_step": "Confirm cancellation and check whether work has started",
  "started_at": "2026-03-04T09:12:00Z",
  "channel": "web_widget"
}
```

**Design what happens when no human is available.** This is the case everyone forgets and every real deployment hits at 22:00 on a Saturday. Decide, per channel and per hour: does the bot take a message and promise a response time; does it offer a callback slot; does it point at a self-service route; does it say plainly that the team is closed and when they return? Whichever you choose, the promise must be one the team can keep, because an automated promise of "within an hour" that takes two days is worse than no bot at all.

**Design the return path.** After a human has dealt with it, does the conversation go back to the bot, or is that session now human-owned? Both are defensible; an undecided answer produces the worst experience, where a bot interrupts a live agent conversation.

## Persona, tone, and the rules that constrain it

The bot writes in your organisation's voice, so specify the voice rather than accepting the model's default, which tends toward enthusiastic and over-promising.

Write a short persona: a name if it has one, a stance ("helpful, brief, never salesy"), a reading level, a length target ("two to four sentences; use a list only when steps are involved"), and formatting rules for the channel. Then write the harder half — the list of things it must never do:

```text
NEVER
- Promise a date, a price, or a discount.
- Apologise in a way that admits fault or liability.
- Speculate about why something happened.
- Give an answer not supported by the sources you were given.
- Mention that you are an AI model, a vendor, or a version.
- Repeat personal data back beyond what is needed to answer.
- Continue a conversation the customer has asked to end.
```

That list, plus the out-of-scope table, plus the escalation triggers, is most of what will become the bot's system framing in the next lesson. Writing it here — reviewed, agreed, in a document — is what makes the build step a translation exercise rather than an improvisation.

One more constraint class to decide now: **what personal data the bot may collect, display, and store.** Which fields may it show back to a customer (a request reference, yes; another customer's name, never)? How long are transcripts retained? Is there a disclosure that the conversation is recorded and processed? Do these decisions with whoever owns data protection in your organisation, not alone.

## Success metrics, defined before the build

Choose the metrics now, because a metric chosen after launch is a metric chosen to make the launch look good.

**Containment rate** — conversations resolved without a human, as a proportion of all conversations. Your headline number, and the one to be honest about: a conversation where the customer gave up is not contained, so define it as resolved-and-not-abandoned rather than merely not-escalated.

**Escalation rate by reason.** The breakdown matters more than the total. A high rate of explicit requests suggests distrust; a high rate of repeated failure suggests scope or grounding problems; a high rate of out-of-scope suggests the greeting is over-promising.

**Answer accuracy**, sampled by a human. Twenty conversations a week, read and scored. There is no automated substitute for this in the first months.

**Unanswered question log.** Every question the bot could not handle, collected. This is simultaneously your roadmap and your best evidence of what to build next.

**Time to first response and time to resolution**, compared honestly with what the human channel achieves.

**Customer satisfaction**, from a one-tap rating at the end of a conversation.

**Cost per conversation**, so the business case survives contact with the invoice.

Set a baseline for each *before* launch, from the current human process, or you will have no way to claim an improvement.

## The design document

Everything above assembles into one document, which is the deliverable of this lesson and the input to the next two.

```text
1. Purpose            One paragraph: who it serves, what it does, why now.
2. Jobs to be done    Ranked intents with volume evidence and source of truth.
3. Out of scope       The table, with the required behaviour for each row.
4. Conversation flow  The six stages, with actual message text for each.
5. Slots              Per intent: fields, formats, re-ask limits, fallbacks.
6. Escalation         Six triggers, the handoff package, out-of-hours behaviour,
                      the return path.
7. Persona and rules  Voice, length, formatting, and the NEVER list.
8. Data and privacy   What is collected, shown, stored, retained, disclosed.
9. Channels and hours Where it runs, when, and who covers escalations.
10. Metrics           Definitions, baselines, targets, review cadence.
11. Risks             What could go wrong and the mitigation for each.
12. Out of version 1  What is deliberately deferred, so scope creep is visible.
```

Then do the one thing that catches more defects than any review: **run it as a script with two people.** One plays the customer with a real question from your inventory; the other reads only what the document says the bot would say. Do ten conversations, including three from the out-of-scope list and two where the customer is annoyed. You will find missing slots, dead ends, and at least one place where your bot's designed behaviour is unacceptable — before any of it costs a day of building.

## Practice

Produce a real design document for a real or realistic organisation. Every exercise feeds one section of it.

1. **Do the intent inventory with evidence.** Collect at least 60 real questions from support email, chat logs, an FAQ page, or interviews with the people who answer them. Group them into intents, rank by frequency with actual counts, and name the source of truth for each of your top five. Discard any intent with no source of truth and say why.

2. **Write the out-of-scope table.** At least eight rows, each with the required bot behaviour. Include at least two that are risky rather than merely irrelevant. Have someone who was not involved read it and add two rows you missed.

3. **Write the flow with real words.** All six stages, with the exact text of the greeting, the intent question, one full slot-filling exchange including a failed parse and a re-ask, a confirmation for a state-changing action, a resolution check, and an escalation message. Not descriptions — the sentences the customer will read.

4. **Specify slots for your top two intents.** For each: fields, example formats, parse-failure message, re-ask limit, and what happens at the limit. Then find a real input for each field that your format would reject but a human would accept, and decide what to do about it.

5. **Design escalation completely.** All six triggers with the concrete condition for each, the handoff package as a JSON object, the out-of-hours behaviour with a response-time promise your team confirms it can keep, and an explicit decision on the return path.

6. **Write the persona and the NEVER list.** At least ten NEVER items, of which at least four are specific to your organisation rather than generic. Then write one sentence per item explaining the failure it prevents.

7. **Define metrics with baselines.** For each of the seven metrics, write the definition you will actually compute, the current human-process baseline with its source, the target for month one, and who reviews it. Where you cannot get a baseline, say so rather than inventing one.

8. **Run the ten-conversation script test.** Two people, ten conversations, at least three out of scope and two with an annoyed customer. Log every point where the document did not tell the reader what to say. Revise the document and list the changes.

9. **Write the version-one boundary.** One page naming what is deliberately not in version one and the condition that would move each item in. Then estimate, from your intent inventory, what proportion of real conversations version one can contain — and say whether that justifies building it.
