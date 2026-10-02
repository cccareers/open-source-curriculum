---
lesson_id: ai102-16
course_id: ai102
pathway: prompt-engineer
title: 'Project: An Integrated No-Code AI Solution'
order: 16
kind: project
competency_ids:
  - D2-S1-C01
  - D2-S1-C02
  - D2-S1-C03
  - D2-S1-C04
objectives:
  - Deliver an integrated no-code AI solution that combines a database, an interface, an automation, and an AI step
---

## The goal

Build one working solution that a real team could adopt, combining everything this course has covered: a no-code database holding the state, an interface a non-builder can use, an automation that reacts to events, an AI step that does a piece of judgement, an integration reached through an API or a webhook rather than a prebuilt connector, and a deployed conversational surface with a route to a human.

The word doing the work is **integrated**. Six things that each work in isolation are what you already have after fifteen lessons. A solution is those six arranged so that a person outside the build can use it without being told how, so that a failure in one part is contained rather than corrupting another, and so that somebody who is not you can operate it next quarter.

This is the only assessment in the course that requires all four D2 competencies at once, and it is graded on the seams between them as much as on the parts.

Budget six hours. Roughly: one hour on the design and the data model, two on the automation and the AI step, one on the integration and the interface, one on the conversational surface, and one on testing, cost, and documentation. If you spend the first two hours exploring a new platform you have not used in this course, you will not finish.

## Choose a real problem

Pick a process that genuinely exists — at your workplace, in a volunteer organisation, in a club, in a small business you know. A real problem gives you real awkward data, a real user with opinions, and a real reason for the escalation path to work, and every one of those improves the build.

The shape you are looking for: something arrives, it needs classifying or summarising or drafting, it must be recorded somewhere people can see, a human sometimes needs to intervene, and people ask questions about it.

Workable examples: inbound enquiries triaged, summarised, and tracked to resolution. Grant or funding opportunities captured from an external source, scored against criteria, and queued for review. Volunteer or shift requests matched and confirmed. Incoming CVs summarised against a role and shortlisted by a human. Support tickets classified and routed, with a bot answering the common questions from your own documentation. Event registrations processed, confirmed, and reported on.

Avoid two traps. A problem with no real user is a demo, and it shows in every design decision. And a problem you cannot get any real input data for will force you to invent test data, which is always too clean and hides most of the defects this project is meant to surface.

Write the scope down before building, in the forms this course gave you: the trigger-data-action sentence from lesson 02, the three user-task sentences from lesson 06, and — if your conversational surface is a chatbot — the in-scope and out-of-scope tables from lesson 12. Fifteen minutes here saves an hour of rework.

## Requirements

### The data layer

**R1 — A schema with at least three related tables.** Real relations, not repeated columns. At least one one-to-many relationship, and at least one lookup or rollup field bringing data across a link. Field types are chosen deliberately: selects rather than free text for anything you filter or branch on, dates rather than strings for dates.

**R2 — A stable external key on every table an automation writes to.** The identifier from the source system, stored on the record, so a repeat event finds the existing record instead of creating a second one.

**R3 — At least four named views, following a convention.** An `[AUTO]`-prefixed view that an automation depends on, a `[UI]`-prefixed view an interface reads, and two working views for humans. The convention is documented so nobody deletes a load-bearing view while tidying.

**R4 — An exceptions table and a processed-events table.** The dead-letter destination from lesson 07 with the failure fields, and the idempotency ledger from lesson 10. Both must contain real rows by the end, produced by real failures and real duplicate events.

### The interface

**R5 — An interface serving one clearly stated user task.** Bound to a view, not a raw table. Every field on every page is explicitly set read-only, editable, or hidden, and nothing an automation depends on is editable.

**R6 — At least one page that collects input and one that supports a decision.** A form with defaults, help text, and validation; and a queue or detail view with the actions the decision requires, including a required note on any rejection.

**R7 — A second user role, tested by signing in as that user.** Different pages, different records, or different editable fields. Verified from a private browser session, not from preview mode.

### The automation

**R8 — A multi-step automation running unattended on a real trigger.** Built in either of the two named platforms. It must have run without you present, and the run history must show it.

**R9 — Branching with a documented truth table and a fallback that acts.** The table of input combinations and outcomes exists in your documentation, every row is reachable, and the fallback writes to the exceptions table and notifies a human rather than doing nothing.

**R10 — Every mutating step is idempotent.** Find-or-create, upsert, or a processed-events check. Demonstrated by running the same input twice and producing one outcome.

**R11 — Retries and error paths configured with a stated policy.** Which status codes retry, how many attempts, what backoff, and what happens after the last attempt. Written down and matching what is configured.

### The AI step

**R12 — An AI step with a written input contract and output contract.** What is sent, cleaned how, truncated to what; and the exact output structure with enumerated values, a confidence signal, and an explicit escalation flag.

**R13 — Structured output that the next step consumes without a human reading it.** JSON parsed and written into database fields, with a validation step that catches schema-valid but wrong values and routes them to human review.

**R14 — An evaluation set of at least 20 labelled cases, scored.** Including empty input, oversized input, a genuinely ambiguous case, and at least one prompt-injection attempt. Scores recorded, with a before-and-after for at least one deliberate change.

**R15 — Input treated as untrusted.** Delimited, labelled as data, and never the sole authority for a consequential action.

### The integration

**R16 — One connection made without a prebuilt connector.** Either an outbound REST call from an HTTP step, or an inbound webhook you receive — and if the build's shape allows both, do both. Correct content type, correctly nested body or correctly parsed payload, and status-code branching.

**R17 — Inbound events are verified and shaped.** A shared secret at minimum, a signature or a callback-fetch where the payload drives anything consequential. A shaping step producing the flat object the rest of the workflow maps from.

**R18 — Every credential is in a credential store, with a register.** No secret typed into a header field, a record, a name, or a URL. The connection register from lesson 11 completed for every connection, including owner and rotation date.

### The conversational surface

**R19 — A deployed bot on a real channel, with a scope document behind it.** In-scope intents with evidence, an out-of-scope table with required behaviours, the flow with actual message text, and the persona rules.

**R20 — Grounded answers with citations and a real refusal.** It answers from your own content, cites the source, and refuses with the exact specified sentence when the content does not cover the question. Demonstrated on questions a generic model would happily invent an answer to.

**R21 — A working human handoff.** All the escalation triggers you defined, a handoff package carrying transcript and collected slots, a stated response-time promise, defined out-of-hours behaviour, and the bot ceasing to reply once a human takes over. Exercised end to end with a real person.

### Operation

**R22 — A conversation and run log in your own database.** Not only the vendor's analytics. One row per conversation or per run, with outcome, and populated automatically.

**R23 — Alerts a human receives.** At minimum: a failure alert, an authentication-failure alert, and a no-runs alert proving the absence of activity is detected. All three demonstrated.

**R24 — A completed test table.** Every case from lesson 15's four layers, with expected, actual, and date, all passing on the final state of the build.

**R25 — A cost statement at three volumes.** Platform units measured from a real execution, model tokens computed from your real prompt, fixed plan costs, and the totals at expected, three-times, and ten-times volume, with plan-tier boundaries identified.

**R26 — A handover document with all thirteen sections,** including the failure-mode table with committed recovery times and an honest known-limitations section.

## Constraints

- **Assemble, do not invent.** Everything here has an antecedent in lessons 02 through 15. Learning a new platform for this project is out of scope and will cost you the requirements that are graded.
- **The two named automation platforms only** for R8. You have built in both; use whichever suits the process and justify the choice in one paragraph. Everything else may be any tool in the classes the course covered.
- **No application code.** Expressions, formulas, JSON bodies, and HTTP configuration are in scope. Writing a service, a script, or a custom connector is not.
- **Real data, or realistically messy synthetic data.** If you must synthesise, include the empty fields, the wrong formats, the duplicates, and the very long input, or the project will pass its own tests and fail on contact with a user.
- **No production system of a real organisation without permission.** Use a sandbox, a test account, or your own copy. Nothing in this build sends a message to a real customer.
- **No secret anywhere outside a credential store**, in the build or in what you hand in. If one is exposed at any point, rotate it and record what happened.
- **Free tiers only.** Every requirement here is achievable on free plans. A requirement you cannot meet because of a paid-plan feature is a finding to write up, not a reason to spend money.
- **Personal data is minimised.** Do not index or store personal data you do not need, and state your retention decision.

## Definition of done

A reviewer with your documentation, read access to your platforms, and their own accounts can confirm every item below.

**Data**

- Three or more tables with real relations, at least one lookup or rollup, and select fields wherever the build branches.
- A stable external key on every automation-written table, with no duplicates present after a deliberate repeat.
- Four views following a documented naming convention, at least one of which an automation depends on.
- The exceptions table and processed-events table both contain real rows produced during testing.

**Interface**

- One user task, stated as a sentence, is completed end to end by a person who did not build the interface.
- Every field on every page is explicitly read-only, editable, or hidden; nothing an automation depends on can be edited.
- A second role, signed in separately, sees a demonstrably different surface.

**Automation and AI**

- The run history shows executions that happened without you present.
- Every row of the truth table is reachable, and the fallback produced an exception row and a notification.
- The same input run twice produced one record and one notification.
- The retry policy in the documentation matches what is configured, verified against a forced `429` and a forced `400`.
- Both AI contracts are written down, and the parsed output lands in database fields with validation catching an out-of-enum value.
- The evaluation set has 20 or more labelled cases with recorded scores, a zero hallucination rate on the final configuration, and a before-and-after for one change.
- A prompt-injection attempt is in the set and is handled.

**Integration**

- One connection works with no prebuilt connector, with correct content type and status-code branching demonstrated across at least three status classes.
- An inbound event is verified and rejected when unsigned or mis-signed, and a shaping step produces the flat object.
- No secret appears in any workflow definition, record, name, URL, or hand-in artefact; the connection register is complete.

**Conversational surface**

- The bot is reachable on a real channel with a disclosure and a visible route to a human in the first message.
- Five questions a generic model would answer from general knowledge are refused with the exact sentence and an escalation offer.
- Answers carry citations that actually contain the claim.
- A real person received a handoff with the transcript and collected slots, replied within the stated promise, and the bot stopped replying.
- Out-of-hours behaviour was exercised and makes a promise the team confirms it can keep.

**Operation**

- The run and conversation log is populated automatically and matches the platforms' own records for a sampled day.
- Failure, authentication-failure, and no-runs alerts were each triggered on purpose and each reached a human-readable channel.
- The test table is complete and passing on the final state of the build.
- The cost statement shows its arithmetic, cites rates with dates, and names the plan-tier boundary.
- A person who did not build this followed the handover document, made one configuration change, and re-ran three test cases without asking you a question.

## How you will be assessed

Four competencies are observed here and marked separately.

**Building an application with no-code tools.** Graded from the data model and the interface: whether the schema expresses real relationships or is a spreadsheet with extra steps, whether field types were chosen or accepted, and whether a stranger can complete the stated task without instruction. The clearest signal is what happens when the reviewer types something unexpected into your form.

**Designing and automating workflows with AI and logic.** Graded from the run history and the branch behaviour: whether every path is reachable, whether the fallback acts, whether a repeated input produces one outcome, and whether the AI step's output is consumed structurally rather than parsed out of prose. The evaluation set is the evidence that the prompt is engineered rather than tried.

**Configuring API integrations and webhooks.** Graded almost entirely from the connection made without a prebuilt connector. A reviewer will look at the request configuration, the status-code branching, the verification on anything inbound, and the credential register. An integration that works only on the happy path does not meet this.

**Deploying an AI chatbot for business use.** Graded from the deployed bot and, more heavily, from the handoff. A bot that answers well and escalates into a void does not demonstrate this competency; a bot with a narrow scope, honest refusals, and a handoff that a real person answered does.

Above all four sits the thing the project exists to test: whether this is a **solution** or a **collection**. The difference is visible in about five minutes. A solution has one convention applied everywhere, state in one place, failures collected somewhere a human looks, and documentation written for a stranger. A collection has a database, a workflow, a bot, three naming schemes, two places where the same fact is stored differently, and a document that says "see the individual lessons."

Expect two review questions your documentation does not answer. Something like: which alert would have caught the failure you had on Tuesday, or what a colleague would have to change first to run this for a second team.

## Hints

**Spend the first hour on the data model, not on the automation.** Every later requirement reads or writes it, and changing a schema after three workflows depend on it means touching all three.

**Get one narrow path working end to end before widening.** One trigger, one AI step, one record, one notification. A thin complete slice tells you where the seams are; four half-built layers tell you nothing.

**Write the two AI contracts before the prompt.** R12 exists because the prompt is the easy part. People who start with prose spend the afternoon debugging output shape.

**Build the exceptions table on the first hour, not the last.** Everything you break while building lands in it, which means the rows in R4 accumulate for free and your debugging gets easier immediately.

**Make the create step idempotent before you test anything else.** Otherwise every test run leaves duplicates and you will spend the session cleaning up.

**Choose a bot scope that is embarrassingly narrow.** Three intents answered well and refused honestly scores far better than twelve answered vaguely. R20 is about refusals as much as answers.

**Recruit your handoff human early.** R21 needs a real person to receive an escalation and reply. Discovering at hour five that nobody is available is a bad surprise; asking a classmate at hour one is a message.

**Keep the failures.** The forced `429`, the mis-signed webhook, the out-of-enum category — that evidence is most of the definition of done, and reproducing it later takes longer than screenshotting it now.

**Measure the units from a real execution, not by counting boxes.** R25 is wrong by a factor of three if you count steps on the canvas instead of reading the run's actual consumption.

**Write the handover as you go.** The configuration values, the credential register, and the change log are trivial to record in the moment and painful to reconstruct at the end.

**When the six hours bite, cut scope, not evidence.** A build with two intents, one integration, and a complete test table, cost statement, and handover scores far better than a sprawling one with no evaluation set, no alerts, and a README that says it mostly works.

## What to hand in

1. Links to every component: the base, the interface, the workflows in both platforms if you used both, and the deployed bot.
2. The scope document: the trigger-data-action sentence, the three user-task sentences, the truth table, and the bot's in-scope and out-of-scope tables.
3. Both AI contracts and the final prompt, with a version number.
4. The evaluation set with recorded scores, including the before-and-after for the change you made, and the injection attempt with its result.
5. Run-history evidence of unattended execution, of a repeated input producing one outcome, and of the fallback branch firing.
6. Failure evidence: the forced `429`, the forced `400` or `422`, the rejected unsigned webhook, and the out-of-enum value routed to review.
7. The exceptions table and processed-events table, with real rows and a sentence explaining what produced each.
8. A transcript of a real handoff, with the package the human received and the time to first reply.
9. Five refusal examples from the bot on questions a generic model would have answered.
10. The completed test table, dated, on the final state of the build.
11. The cost statement at three volumes with the arithmetic shown and rates cited.
12. The handover document, all thirteen sections, plus the log of questions your stranger reviewer had to ask you and what you changed as a result.
13. A note naming the one thing you would generalise next so a second team could adopt this, and why you did not do it now.
