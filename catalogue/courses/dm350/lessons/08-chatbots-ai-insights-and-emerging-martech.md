---
lesson_id: dm350-08
course_id: dm350
pathway: digital-marketer
title: Chatbots, AI Insights, and Emerging Martech
order: 8
kind: lesson
competency_ids:
  - D7-S1-C03
objectives:
  - Apply an AI-driven or conversational martech capability to a marketing task
---

## Scope: Configuring, Not Building

Northlight's site has a chat widget in the bottom-right corner. It produces 22 contacts a month, which is about eight percent of the funnel from lesson 03. Ruth wants it to do more, and she has asked you to sort it out.

You are not going to write any code. The distinction this lesson holds to is the one your job will hold to: a marketer **configures** a chatbot — designs its conversation, decides where it appears, writes its words, maps what it captures into CRM properties, sets its escalation rules, and measures it — while an engineer or a vendor **builds** the thing that runs. The same split applies to every emerging tool in this lesson. Your skill is not implementation. It is knowing what a capability is for, what it needs to work, where it fails, and how to tell whether it earned its cost.

That skill matters more than any particular tool, because the tools change every eighteen months and the questions do not.

## What a Site Chatbot Is For

A chat widget does one of four jobs. Decide which before you configure anything, because the four want different designs.

**Route.** Get the visitor to the right place or person faster than the navigation would. Cheap, useful, boring, and usually the highest-value job on a small site.

**Qualify and capture.** Ask a few questions, decide whether this visitor is a fit, and create a CRM contact with those answers already filled in. This is what Northlight's bot is for.

**Book.** Put a meeting on an advisor's calendar without an email exchange.

**Deflect.** Answer a common question so a human does not have to. Genuinely valuable for support-heavy businesses; at Northlight, mostly a distraction.

What a chatbot is *not* for: pretending to be a person, replacing a sales conversation, or being the site's primary navigation. And there is a version that actively costs you money — the bot that pops up over the content three seconds after arrival, on every page, asking "Hi! How can I help you today? 👋". That bot interrupts people who came to read something, and the measurable result is usually fewer conversions, not more.

## Where the Bot Sits in the Funnel

A chat widget is not a separate channel with its own goals. It is a third mouth on the funnel from lesson 03, and it should feed exactly the same machinery.

That means three things concretely. Everything it learns is written to the **same properties** the forms write to, so a contact captured by chat is indistinguishable, to every segment and workflow you have built, from one captured by a form. Its contacts enter the **same nurture workflows**, subject to the same suppression. And its conversations land on the **same timeline**, so that when Marisol opens a record before a call, the chat transcript is sitting there alongside the email history.

The alternative — which is what most companies actually have — is a chat tool with its own contact database, its own notion of a lead, and a weekly export somebody pastes into a spreadsheet. That arrangement produces duplicate records, a second version of the truth, and conversations invisible to the people who need them. Whether a chat tool writes cleanly into your CRM is therefore a more important selection criterion than anything about its conversational abilities, and it is the question to ask first in any demo.

The other placement decision is where chat sits relative to the forms. At Northlight the bot is deliberately absent from the checklist thank-you page and the blog, because on those pages it interrupts something that is already working. It appears on pricing and services, where a visitor is deciding and a question is likely. Chat is a supplement to the capture path, not a replacement for it.

## Rule-Based or Model-Backed

Two architectures, and the choice is a real one.

A **rule-based** bot follows a decision tree you wrote. It asks a question, offers buttons, and branches on the answer. Its behavior is entirely predictable, it never invents anything, it is fast to configure, and it is limited to conversations you anticipated. If the visitor types something outside the tree, it either offers the buttons again or hands off.

A **model-backed** bot uses a language model to interpret free text and generate replies, usually grounded in a set of documents you supply — your pricing page, your service descriptions, your guides. It handles questions you did not anticipate and it phrases things fluently. It can also produce a confident, well-written answer that is wrong, and it will do so in your brand's voice, in writing, to a prospect.

For Northlight the right answer is a hybrid, and this is the pattern to remember: **rule-based for anything that touches money, commitments, or data capture; model-backed, if at all, only for answering questions from a fixed set of documents, with an escalation path when it is unsure.** A bot that quotes a price it inferred has cost you either a client or a margin, and you will not find out which for weeks.

## Designing the Conversation

Write the whole script before you touch a builder. Every branch, every fallback, every field it writes. This is the deliverable.

```txt
BOT: Northlight site assistant - v3
GOAL: qualify visitors and book fit calls; capture the rest as contacts
TYPE: rule-based tree with buttons; free text only at the email step

TARGETING
  Show on:    /pricing, /services, /fit-call, /guides/*
  Do not show on:  homepage, blog posts, careers, the checklist thank-you page
  Trigger:    after 20 seconds OR at 50% scroll depth, whichever first
  Frequency:  once per visitor per 7 days; never re-open if dismissed
  Hours:      always available; behaviour differs (see HANDOFF)

-----------------------------------------------------------------------------
OPEN
  "Hi - I can help you work out whether Northlight is a fit, or get you
   straight to a person. Which is more useful?"
     [ Am I a fit? ]   [ Talk to someone ]   [ Just looking ]

BRANCH "Just looking"
  "No problem. The Quarterly Close Checklist is the most useful thing we
   publish - it is free and there is no call attached."
     [ Send me the checklist ] -> EMAIL CAPTURE, then END
     [ No thanks ]             -> "I'll get out of your way." END

BRANCH "Talk to someone"
  -> HANDOFF (see below)

BRANCH "Am I a fit?"
  Q1  "What kind of business is it?"
      [ Agency ]  [ Design studio ]  [ Solo / freelance ]  [ Something else ]
      -> writes contact.business_type

  Q2  "Roughly what do you spend in a month, all in?"
      [ Under $5k ]  [ $5k-25k ]  [ $25k-100k ]  [ Over $100k ]
      -> writes contact.monthly_expenses_band

  Q3  "Who does the books now?"
      [ Me, in a spreadsheet ]  [ Me, in software ]
      [ A part-time bookkeeper ]  [ Another firm ]  [ Nobody ]
      -> writes contact.current_bookkeeping

  SCORE  apply the lesson 03 model to the three answers

  IF score >= 40
     "Based on that, yes - this is exactly what we do. The next step is a
      20-minute call with Marisol or Theo. They will look at your last
      quarter and tell you plainly whether you need us."
       [ Book a time ] -> calendar, then EMAIL CAPTURE, then END
       [ Email me instead ] -> EMAIL CAPTURE, then END

  IF score 20-39
     "Probably, but it depends on a couple of things a person should ask
      rather than me. Want me to send the checklist and have someone follow
      up next week?"
       [ Yes ] -> EMAIL CAPTURE, enrol in nurture (lesson 06), END

  IF score < 20  (under $5k/month, or "something else")
     "Honestly, at that size a bookkeeper is usually not worth the money
      yet. The checklist covers what to do yourself until it is."
       [ Send the checklist ] -> EMAIL CAPTURE, END
       [ No thanks ]          -> END
     -> writes lifecycle_stage = subscriber, NOT lead

EMAIL CAPTURE
  "What is the best email for that?"
  free text; validate syntax; on failure ask once more, then hand off
  CONSENT LINE, shown in full, not behind a link:
    "We'll email you the checklist and occasional quarter-end advice.
     Unsubscribe any time. [ I agree ]  [ Just the checklist, no emails ]"
  -> writes email, marketing_consent_status, consent_source = chat,
     consent_timestamp, original_source (if empty), first_conversion

HANDOFF
  Business hours (Mon-Fri 09:00-17:00 Pacific):
    route to the available advisor; if nobody accepts in 60 seconds,
    "Everyone is on a call. Leave your email and Marisol will reply today."
  Outside hours:
    "The team is offline until 09:00 Pacific. Leave your email and a line
     about what you need, and you will hear back first thing."
  -> creates a task for the advisor, due 4 business hours (lesson 06 SLA)

FALLBACK (free text the tree does not understand, twice in a row)
  "I am a fairly simple assistant and I am not following. Would you like
   me to get a person?"     [ Yes, a person ]   [ Start over ]

END OF EVERY PATH
  full transcript logged as an activity on the contact record
-----------------------------------------------------------------------------
```

Several choices in that script are the lesson.

**The bot disqualifies people.** The under-$5k branch tells a visitor not to buy. This feels wrong to a marketer and is obviously right to a business: those visitors were never going to become clients, an advisor's time is Northlight's scarcest resource, and a person told honestly that they are not ready remembers it and comes back in two years.

**It captures into the exact properties from lesson 02.** Not into a free-text transcript that someone reads later. The three buttons write three dropdown values that lesson 05's segments and lesson 06's branches read directly. This is the whole reason the schema was built with dropdowns.

**Consent wording is shown in full and offers a genuine no.** "Just the checklist, no emails" is a real option that sets `marketing_consent_status` to `not_opted_in`. Lesson 09 explains why this matters; note here that the bot is a consent capture point exactly like a form, and is often the one people forget to audit.

**Every path ends somewhere defined.** No dead ends, no loops back to the opening question.

**The fallback admits what it is.** "I am a fairly simple assistant" costs nothing and buys patience.

**Three questions, not seven.** The same discipline as form design in lesson 03: each question must earn its place with a specific downstream use.

## Writing for a Bot

Bot copy is its own craft and it is closer to interface writing than to marketing writing. Six rules cover it.

**Short.** Two lines per message, maximum. Long paragraphs in a small chat window are skipped entirely, and unlike an email nobody scrolls back.

**One question at a time.** A message containing two questions gets one answer, and you will not know which.

**Buttons over free text wherever possible.** Buttons are faster for the visitor and they write clean dropdown values rather than prose you have to interpret. Save free text for the things only free text can capture — an email address, a description of a problem.

**Say what happens next.** "I'll pass this to Marisol, who usually replies within the hour" sets an expectation that the handoff can meet. Vagueness at the handoff is where trust is lost.

**No exclamation marks, no emoji cheer, no simulated enthusiasm.** A bot performing delight is uncanny; a bot being useful is not. This matters more the more serious the subject, and money is serious.

**Sound like the business, at the register the business uses.** Northlight's bot says "Honestly, at that size a bookkeeper is usually not worth the money yet" because that is what Marisol would say. A bot that speaks in a voice nobody at the company uses is a tell that the visitor is talking to a bought widget rather than to this firm.

Then read the whole script aloud, top to bottom, taking both parts. Every awkward line is a line a visitor will abandon.

## Guardrails

Whether your bot is a decision tree or a model, these are non-negotiable and they are the marketer's responsibility.

**Disclose that it is not a person.** Not buried in a tooltip. The visitor should never be able to be surprised. A bot with a human name and a stock-photo avatar is a small deception that becomes a large one at the moment of discovery.

**A human is always reachable.** Every path has an escape to a person, and the escape is offered rather than hidden behind three refusals.

**Scope what it may speak about.** For a model-backed bot, ground it in a specific, small, current set of documents and instruct it to answer only from them. Then test it against the topics it must refuse.

**Never let a bot quote a price, promise a delivery date, or give tax, legal, or financial advice.** For Northlight this is not fussiness — a bot that answers "can I deduct my home office?" has given tax advice on behalf of a bookkeeping firm. The rule is a hard refusal with a routing offer: *"That one needs a person - want me to have an advisor answer it?"*

**Do not collect sensitive data in chat.** No bank details, no tax identifiers, no health or financial specifics. If a visitor volunteers something sensitive, the transcript now contains it, and lesson 09's retention rules now apply to your chat logs.

**Log everything, and treat transcripts as records.** They are personal data, they sit on the contact timeline, and they are in scope for a deletion request.

**Test the failure paths before the happy path.** Type nonsense. Type a question about pricing. Type "I want to cancel my account." Type an angry sentence. Ask it something it cannot know. What it does then is what your brand actually sounds like on a bad day.

## Measuring the Bot

Four numbers, monthly.

```txt
NORTHLIGHT BOT - v2 baseline, monthly

  Widget shown                    4,900   (sessions on targeted pages)
  Conversations opened              640   13.1% of shown
  Conversations completed a path    310   48.4% of opened
  Contacts captured                  22    7.1% of completed - LOW
  Fit calls booked from chat          6    27.3% of captured
  Escalations to a human             41
  Escalations answered in SLA        29    70.7% - below the 4-hour promise

  v3 target: contacts captured 45+, escalations answered in SLA above 90%
```

Read that the way you read a funnel. The bot is opened often enough and finishes conversations at a reasonable rate, but 310 completed conversations produce only 22 contacts — most people are getting to the end without giving an email address. That points at the capture step, not the opening. And the 70.7 percent SLA figure is worse than it looks: a visitor who asks to speak to a human is the highest-intent visitor on the site, and three in ten of them (12 of 41) are being let down.

Note what is *not* on that list: "conversations." A vendor dashboard will show you a large conversation count and call it engagement. Conversations are an input. Contacts, bookings, and answered escalations are outcomes.

## AI-Driven Insights

Beyond chat, the martech stack now offers a set of model-driven capabilities. Five are common enough to be worth knowing, and each has a specific requirement without which it does not work.

**Predictive lead scoring.** A model trained on your historical contacts learns which attributes and behaviors preceded a purchase, and scores new contacts accordingly. *Requires:* a few hundred conversions at minimum, and clean, consistently populated properties. Northlight closes 11 clients a month with a database of 8,400 and a 49 percent fill rate on its most important field — it does not have the data for this yet, and the honest recommendation is the transparent rules model from lesson 03. A predictive score trained on 130 conversions and half-empty fields will produce a confident number derived from noise, and because it is opaque, nobody will be able to see that it is wrong.

**Send-time optimization.** The platform learns when each contact tends to engage and delivers at that time. *Requires:* enough send history per contact. Low risk, modest gain, usually worth switching on and forgetting.

**Subject line and copy assistance.** A model proposes variants. *Requires:* an editor. Useful for breaking a blank page, unreliable for judging what will work, and prone to a bland house style that makes every brand sound like every other brand.

**Summarization.** Condensing call notes, chat transcripts, or a long timeline into a paragraph an advisor can read before a call. *Requires:* the source material to be in the CRM in the first place. This is the most underrated item on the list — it is low-risk, immediately useful, and it makes the discipline from lesson 02 pay off.

**Anomaly detection.** Alerting when a metric moves outside its usual range. *Requires:* enough history to know what usual is. Genuinely helpful for the trend-watching that lesson 07 asks for.

Three rules cut across all five.

**Garbage in, confident garbage out.** Every one of these is a function of your data. A model does not repair a 49 percent fill rate; it launders it into a number that looks authoritative.

**A human edits anything a customer will see.** Not "reviews." Edits. Read every generated sentence and change the ones that are not true or not yours.

**Be able to explain any number that changes what a human does.** If a predictive score routes a contact to Marisol, and nobody can say why it was 82, then the day it starts routing badly you will have no way to find out. A transparent rules model that is slightly less accurate and completely explainable is often the better business decision.

Two failure modes deserve naming, because they are specific to this class of tool rather than to software generally.

**Fabrication.** A language model will produce fluent, plausible, confidently phrased text that is simply untrue — a price that does not exist, a service you do not offer, a policy nobody wrote. It does not signal uncertainty the way a person would, and its wrongness reads exactly like its rightness. This is why grounding a model in a fixed set of documents, and instructing it to refuse rather than guess, is not a refinement; it is the whole safety design. And it is why every customer-facing sentence gets human eyes before it ships.

**Learned bias.** A model trained on your historical conversions learns your history, including the parts you would not defend. If Northlight's past clients skewed towards one kind of business because of who happened to hear a podcast, a predictive score will quietly encode that as fit and will steer advisors away from prospects who look different. The model is not making a judgment; it is repeating one. The mitigations are to check scored outcomes against actual outcomes across groups, to keep a human decision in the loop wherever the model routes people, and to be suspicious of any system whose recommendations you cannot interrogate. In some contexts — credit, housing, employment — this stops being a marketing quality concern and becomes a legal one, which is another instance of the rule from lesson 09: when it might be a legal question, ask someone qualified rather than deciding at your desk.

## Evaluating a New Tool

You will be sent tools. Ruth will forward something from a newsletter roughly monthly. Have a rubric, so that the answer is a judgment rather than an enthusiasm.

```txt
TOOL EVALUATION - one page, every time

  1  JOB          What job is this doing, and who does it today?
                  If the answer is "nobody does it," ask whether it needs doing.
  2  EVIDENCE     What would change in our numbers if it worked? Name the
                  metric and the size of change that would justify the cost.
  3  DATA IN      What does it need from us? Does that data exist, and at
                  what fill rate?
  4  DATA OUT     Does it write back into the CRM, or does it create a second
                  copy of the truth somewhere else? A second copy is a cost.
  5  INTEGRATION  Native, or does someone have to maintain a connection?
                  Who is that someone?
  6  PRIVACY      What personal data leaves our systems? Where does it go?
                  Is it used to train anyone else's model? (Lesson 09.)
  7  COST         Licence, plus the hours to configure, plus the hours per
                  month to run. The third number is the one people omit.
  8  OWNER        Who owns this in six months? If the answer is "we'll see,"
                  the answer is no.
  9  EXIT         If we stop paying, what do we lose and can we export it?
 10  TRIAL        What is the smallest test that would tell us, and what
                  result would make us say no?

  DEFAULT ANSWER: no. A tool has to beat the default, not merely be interesting.
```

Item 10 is where most evaluations go wrong: teams design a trial that can only succeed. Write down, before the trial starts, the result that would make you decline. If you cannot name one, you are not running a trial, you are running an onboarding.

And a word about the newness itself. "Emerging" is a description of the market, not a recommendation. The right posture is neither dismissal nor enthusiasm; it is the same posture you would take to any spend — what job, what evidence, what does it cost to run, who owns it. The marketers who came out of the last three technology waves well were the ones who could answer those four questions quickly, not the ones who adopted first.

## Practice

1. **Write a bot script.** Design a chatbot for a business that is not Northlight — a dental practice, a gym, a software product, whatever you know. Produce the full script in the format above: targeting rules, an opening with no more than three options, at least two qualifying questions that write to named CRM properties, a scored branch that includes a genuine disqualification path, an email capture step with consent wording written out, business-hours and after-hours handoff behaviour, and a fallback. Every path must end somewhere defined.

2. **Try to break it.** Write ten things a real visitor might type or click that your script does not handle — including one hostile message, one question about price, one request for advice you must refuse, and one person who is already a customer with a problem. For each, write what the bot should do. Then fix the script.

3. **Fix Northlight's capture rate.** Using the bot measurement table, write three specific changes to the v3 script above that would plausibly move contacts captured from 22 to 45, and one change that would move the escalation SLA above 90 percent. For each, state what you would measure to know whether it worked, and over what period.

4. **Say no to a tool.** Find a real martech product and complete the ten-point evaluation for Northlight. Answer every item honestly, including the cost of the hours per month. Reach a recommendation, and if it is yes, write the smallest trial and the result that would make you decline.

5. **Draw the line on the model.** Write the instructions you would give a model-backed assistant on Northlight's site: what it may answer, what documents it may draw on, exactly what it must refuse, what it should say when unsure, and what it must never collect. Keep it under 200 words, because an instruction nobody can hold in their head will not be followed by the person configuring the tool either.
