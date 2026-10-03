---
lesson_id: sn360-07
course_id: sn360
pathway: servicenow-implementation-specialist
title: Virtual Agent and Conversational Automation
order: 7
kind: lesson
competency_ids:
  - D3-S1-C03
objectives:
  - Build a Virtual Agent topic that resolves a common customer request without a human agent
---

## What a topic is, and what it is not

Virtual Agent is a conversation engine with a designer on top of it. The unit of work is a **topic**: a named, ordered script of prompts, lookups, decisions, and actions that carries a customer from an intent to an outcome. "Check my case status" is a topic. "Request a replacement part" is a topic. "Talk to a human" is a topic.

A topic is not a chatbot in the sense the marketing slide means. It does not converse. It recognizes that the customer wants one of the things you have built, then runs that thing. Almost every failed Virtual Agent implementation failed by inverting that: someone tried to build a bot that could handle anything, shipped a fallback message, and taught an entire customer base that the chat window is a waste of time.

So the working definition for this lesson: **a topic automates one request that a customer makes often, end to end, including the handoff when it cannot finish.** You will build one of those properly. Building the twentieth one is the same skill.

This lesson teaches topic design in the conversational designer. Predictive intent models and generative capabilities are configuration options you should know exist — they change how an utterance is matched to a topic and how free-text responses are composed — but their behavior shifts between releases, and a topic that is well designed works with or without them. Build the topic; select the intelligence options afterward, deliberately, with the customer's data and risk posture in front of you.

## Choosing the first topic

Get this wrong and the rest is wasted. The criteria for a good first topic:

- **High frequency.** Look at case volume by short description or by category. If the top request is 12% of your volume, automating it is worth more than five clever topics at 0.5% each.
- **Structured, not diagnostic.** "Where is my order" has a lookup and an answer. "My controller behaves strangely" does not.
- **Resolvable with data the platform already has**, or with one integration you already trust.
- **Low blast radius when wrong.** Status lookups and knowledge delivery are safe. Issuing credits or cancelling contracts are not first topics.

For Northwind, the case queue says the most common contact is "what is happening with my case", followed by "I need a replacement sensor for a unit under warranty." The first is a lookup and is the topic you build in this lesson's worked example. The second is a good second topic and appears in the practice.

## The anatomy of a topic

Open the conversational designer and a topic has four parts.

**Topic properties.** Name, description, the category it belongs to, the channels it is available on, the roles or conditions that make it available, and its live-agent behavior. Availability conditions matter in CSM: a topic that requires an active support contract should not be offered to a contact who has none, because offering and then refusing is worse than not offering.

**Training phrases, or utterances.** The natural-language examples that route a customer's message to this topic. Ten to fifteen genuinely different phrasings beat fifty variations of the same sentence. Harvest them from real case short descriptions and chat transcripts rather than inventing them at your desk — customers do not say "I would like to inquire as to the status of my case", they say "any update?"

**The conversation flow.** The ordered nodes: user input controls that ask the customer something, bot responses that say something, and utilities that do something.

**Topic variables.** The values the topic carries as it runs. Everything the customer answers, everything you look up, and everything you compute lives here and is referenced downstream.

The node types you will use constantly:

- **Text, boolean, choice, and reference inputs** — ask for a value. The reference input is the most CSM-relevant, because it can present the customer's own cases or their own installed products, scoped by a filter you control.
- **Bot response** — say something. Keep them short; a chat window is not a document.
- **Card and picker responses** — present a record or a set of options in a structured tile rather than as a wall of text.
- **Decision / branch** — split the flow on a condition.
- **Script** — run server-side JavaScript to look something up or compute a value. Use it when a lookup needs logic; keep it small.
- **Action or flow call** — invoke a Flow Designer flow to actually do the work. This is where a topic stops being a conversation and starts being automation.
- **Live agent transfer** — hand off, carrying the transcript and the context.
- **Topic block** — a reusable sub-conversation, called from many topics.

Topic blocks are the piece people discover too late. "Identify the customer and confirm their account" appears in every topic you will ever write. Build it once as a block, call it from everywhere, and fix its bugs in one place.

## Design rules that survive contact with customers

**Never ask for what you can look up.** The customer is authenticated on the portal. You know who they are, which account they belong to, what they own, and which cases are open. Asking "what is your case number?" when the customer has exactly one open case is the fastest way to make a bot feel stupid. Look it up; if there is one, confirm it; if there are several, show a picker; only ask for free text if there are none.

**Confirm before acting, once.** Any topic that writes a record confirms first, in one message, with the specific effect stated: "I'll ship a replacement sensor to the Rivergate plant address on file. Confirm?" Not three confirmations. Not zero.

**Always leave an exit.** Every topic offers a way to reach a human, and every dead end offers it explicitly. A customer trapped in a loop is a customer writing a complaint about your support experience, which is a case with a much worse SLA than the one you were avoiding.

**Fail forward, not silently.** When a lookup returns nothing or an integration errors, say what happened in plain language and offer the next step — create a case with the details already gathered, or transfer. Never end with "Sorry, something went wrong."

**Write like a person with a deadline.** Short sentences. No corporate throat-clearing. No emoji unless the brand demands it. The customer is in a chat window because they are in a hurry.

**Design the greeting and the fallback as carefully as the topics.** The setup topics — greeting, fallback when nothing matches, small talk, live agent request — are where customers form their impression. A fallback that lists what the bot *can* do converts a failed match into a successful conversation; a fallback that apologizes converts it into a case.

## Wiring a topic to the platform

The three ways a topic touches your CSM data:

**Reference inputs with filters.** A reference input on the case table, filtered to cases where the contact is the current user and state is not closed, gives the customer a picker containing only their own open cases. The filter is not security — access controls still apply, and they are the real boundary — but it is what makes the picker useful.

**Scripts for lookups.** Server-side, small, and defensive:

```javascript
// Topic script: find the requesting contact's open cases.
(function execute() {
  var userId = gs.getUserID();
  var cases = [];
  var gr = new GlideRecord('sn_customerservice_case');
  gr.addQuery('contact', userId);
  gr.addQuery('state', 'NOT IN', '3,6,7'); // closed, resolved, cancelled - confirm values in your instance
  gr.orderByDesc('sys_updated_on');
  gr.setLimit(5);
  gr.query();
  while (gr.next()) {
    cases.push({
      number: gr.getValue('number'),
      short_description: gr.getValue('short_description'),
      state: gr.getDisplayValue('state'),
      sys_id: gr.getUniqueValue()
    });
  }
  vaVars.case_count = cases.length;
  vaVars.case_payload = JSON.stringify(cases);
})();
```

Note what that script does and does not do. It limits its result set, it reads display values for anything the customer will see, it writes to topic variables rather than returning a blob the next node has to parse, and it leaves the count available so the next node can branch on none, one, or several. Confirm the state values against your own choice list before using it — hard-coded integers are the most common source of a topic that works in development and does nothing in production.

**Flow calls for actions.** When the topic needs to create a case, order a part, or update a record, call a Flow Designer flow rather than scripting it inline. You get error handling, a run history you can debug, and the same automation reachable from the portal, from email, and from the topic. Pass the topic variables in as flow inputs and read the flow's outputs back into topic variables so the bot can tell the customer what happened.

## Handing off to a human

A handoff is not a failure; an unmanaged handoff is. Configure four things:

- **When.** The customer asks; the topic reaches a dead end; a confidence threshold is not met; or a business condition applies — for example, a Premium-entitled customer asking about an outage may go straight to a person.
- **To whom.** Live chat routing is Advanced Work Assignment, which is lesson 08's subject. What you configure here is which queue the conversation asks for and what context it carries.
- **With what context.** The transcript, the identified contact and account, anything the topic already collected, and the case if one was created. An agent who has to ask the customer to repeat themselves has erased the value of the topic.
- **When nobody is available.** Outside support hours, or when the queue is full, the topic must degrade gracefully: create the case, tell the customer when someone will respond, and end. Configure this against the same schedule as the entitlement from lesson 04, so the promise the bot makes matches the one the contract makes.

## Worked example: "Where is my case?"

The design, node by node.

```text
Topic: Check case status
Utterances: any update on my case / case status / what's happening with my ticket /
            has anyone looked at my case / update please
Availability: authenticated customer contacts on the customer service portal

1  Script       lookup open cases for gs.getUserID() -> vaVars.case_count, case_payload
2  Decision     on vaVars.case_count
   ├─ 0  -> 3a  Bot response: "I don't see any open cases for you."
   │          3b  Boolean input: "Would you like to open one?"
   │              true  -> call topic block "Create a case"
   │              false -> 7 (close)
   ├─ 1  -> 4a  Card response: the single case, with number, summary, status, last update
   │          4b  Branch to 6
   └─ 2+ -> 5a  Picker: up to five cases by number and summary
              5b  Card response for the chosen case
              5c  Branch to 6
6  Bot response  status detail: current state in customer-facing wording, the most recent
                 customer-visible comment, and the response commitment from the case's SLA
   6b Boolean input: "Does that answer your question?"
      true  -> 7
      false -> 8
7  Bot response  "Glad to help." -> end
8  Decision      is a human available on the customer service queue now?
   ├─ yes -> Live agent transfer, carrying transcript + case sys_id
   └─ no  -> Bot response with next-response time from the SLA, add a customer-visible
             comment to the case recording the request, end
```

Read the design decisions in that outline:

- The lookup happens before the first question, so a customer with one open case is shown it immediately and never types a case number.
- The zero-case branch does not dead-end; it offers the adjacent topic.
- Status is reported in customer-facing wording, reusing lesson 05's label mapping, and includes the last customer-visible comment — which is the actual answer to "any update?"
- The SLA from lesson 04 is quoted, so the bot's promise and the contract agree.
- The unhappy path writes a comment onto the case. The agent who picks it up sees that the customer chased it, which affects how they prioritize.
- The exit to a human exists on the only branch where the customer said the answer was insufficient.

Now test it the way it will actually be used. In the conversation simulator, run the topic as a contact with no cases, one case, six cases, and one case that is resolved but not yet closed. Then run it as an unentitled contact and confirm the availability condition keeps the topic hidden. Then type the five utterances your customer actually uses and confirm each routes here rather than to a different topic — utterance overlap between "case status" and "order status" is the classic collision, and it is much easier to fix before both topics are live.

## Channels, and the authenticated context

The same topic can run in more than one place, and the places are not equivalent.

**On the customer service portal, signed in.** The best case. You know the contact, the account, the install base, and the entitlement, so the topic can skip identification entirely and go straight to work. Everything in this lesson's worked example assumes this context.

**On a public page, not signed in.** You know nothing. A topic here can search knowledge, answer general questions, and offer to sign in or register — and that is close to the limit of what it should do. Any topic that reads or writes customer data must require authentication, and the way you enforce that is the topic's availability condition, not a hopeful assumption about where it is embedded.

**On external messaging platforms.** Conversations can be surfaced through messaging channels, which raises two design questions. Identity: the messaging platform's user id has to be mapped to a contact before the conversation can do anything customer-specific, and that mapping is a configuration and consent problem. And presentation: the rich cards and pickers that render nicely in the portal degrade differently on each platform, so a topic designed around a six-item picker may arrive as an unreadable wall of text.

The practical rule is to design the topic for the least capable channel it will run on, and to make identity a precondition rather than a branch. A topic that behaves one way when it knows the customer and another way when it does not is two topics wearing one name, and it will accumulate bugs on the path you test less.

## Choosing the intelligence options deliberately

Virtual Agent can be configured with additional intelligence: a trained model that matches utterances to topics more flexibly than keyword-style matching, and generative capabilities that can summarize a conversation, draft a response, or answer from knowledge in natural language. These are configuration choices, and an implementation specialist should be able to reason about them rather than either avoiding them or switching everything on.

The questions to ask before enabling any of them:

- **Do we have the data to make it work?** A trained intent model needs a meaningful volume of real utterances, correctly labeled. With three hundred conversations and a new deployment, careful training phrases on a small set of topics will outperform a model trained on nothing.
- **What is the failure mode, and who sees it?** A misrouted intent sends the customer to the wrong topic, which is annoying and recoverable. A generated answer that is confidently wrong is published, on your instance, to an external customer, and is far less recoverable. The tolerance for each should be set by the customer's risk owner, not by the implementer.
- **What is the content boundary?** Any capability that answers from your content will answer from whatever content it can see. The knowledge access model from lesson 06 has to hold here too — one entitled customer must not receive an answer synthesized from a partner-only article.
- **How is it reviewed?** If a capability composes customer-facing text, someone has to sample its output regularly and there has to be a way to correct it. "Nobody is checking" is the answer that turns a feature into an incident.
- **Is it available and licensed here?** Intelligence features vary by subscription and shift between releases. Confirm what the customer actually has rather than what a slide showed.

The design advice that holds regardless: **build the topic so it works without the intelligence, then let the intelligence make it better.** A topic whose flow is sound gets more reliable when matching improves. A topic that only functions because a model guesses well is one release from being a support case of its own.

## Measuring whether it worked

Publish, then watch. The numbers worth a dashboard tile in lesson 10:

- **Engagement**: conversations started per day.
- **Containment**: conversations that ended without a live agent transfer and without a case created. This is the number the topic exists to move.
- **Abandonment**: conversations the customer closed mid-flow, and at which node. A single node with a high abandon rate is usually a question you should not be asking.
- **Unmatched utterances**: what customers said that routed to fallback. This is your backlog of future topics, written by your customers, for free.

Review unmatched utterances weekly for the first month. Most of what you will build in months two and three is already sitting in that list.

## Practice

1. **Pick a topic on evidence.** Query your case table and produce the top five short-description clusters by volume. Choose one to automate, and write two sentences on why it meets the frequency, structure, and blast-radius criteria.

2. **Build the case status topic.** Implement the worked example in the conversational designer: the lookup script, the three-way branch on case count, the picker, the card response, and the confirmation. Use your instance's real state values.

3. **Build a reusable block.** Extract "identify the contact and confirm their account" into a topic block and call it from your topic. Confirm the block behaves correctly when called from a second topic.

4. **Add the handoff.** Configure live agent transfer with the transcript and case context, plus the out-of-hours degradation that creates or annotates a case and quotes the SLA next-response time.

5. **Automate a request end to end.** Build a second topic, "Request a replacement part", that identifies the customer's installed product with a filtered reference input, confirms the shipping address, calls a Flow Designer flow to create the request, and reports the resulting number back to the customer. Verify the flow runs with the correct account and that an unentitled contact cannot reach the topic.

6. **Break it deliberately.** Make the lookup script fail — rename a field, or point it at a state value that does not exist — and observe what the customer sees. Then add the error handling that turns that into a clear message and an offered next step.

7. **Test and tune the routing.** Simulate ten real customer utterances, at least three of which should *not* match your topic. Record which ones misrouted, adjust the training phrases, and re-test. Write down the one utterance you could not disambiguate and how you would handle it.

## Check your understanding

1. Which makes a better first topic: "check my case status" or "my controller behaves strangely"? Why?
2. The customer has exactly one open case. What should the topic do before asking anything?
3. Why call a Flow Designer flow rather than writing record updates in a topic script?
4. What is containment, and why is it the number the topic exists to move?

*Answers:* (1) Case status: high frequency, structured, resolvable with platform data, low blast radius; the other is diagnostic. (2) Look it up and show it; never ask for a case number you already know. (3) Flows give error handling, run history, and reuse from the portal and email. (4) Conversations that end without a live agent transfer or a case; it measures requests resolved without a human.
