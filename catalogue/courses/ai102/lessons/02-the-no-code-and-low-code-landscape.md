---
lesson_id: ai102-02
course_id: ai102
pathway: prompt-engineer
title: The No-Code and Low-Code Landscape
order: 2
kind: lesson
competency_ids:
  - D2-S1-C01
objectives:
  - Describe the no-code and low-code landscape and choose a class of tool that fits a stated automation need
---

## What "no-code" actually means

No-code and low-code tools are not a category of software so much as a claim about where the work happens. In a coded system, behaviour lives in source files you author, and the platform runs whatever you wrote. In a no-code system, behaviour lives in **configuration** — fields you fill in, steps you drag into an order, conditions you pick from dropdowns — and the platform runs a general-purpose engine against that configuration. The engine is somebody else's code. Your job is to describe the process precisely enough that the engine does the right thing.

The practical difference between "no-code" and "low-code" is narrow and often marketing. A useful working definition: a **no-code** tool expects you never to type an expression more complicated than a field reference, and a **low-code** tool expects you occasionally to write a formula, a JSON body, or a small snippet in a code step. Almost every serious platform is low-code by that definition, because every real process eventually needs a date reformatted or a string trimmed. Do not choose a tool on this label. Choose it on the five axes later in this lesson.

What you gain is speed and legibility. A workflow that would take a developer two days and a code review lands in forty minutes, and a non-developer colleague can open it and read what it does. What you give up is control over the parts the vendor did not anticipate: you cannot patch the engine, you cannot exceed its concurrency, and when it is down, you are down. The competent practitioner is the one who knows which of those trade-offs matter for a given job before starting, rather than discovering them at hour six.

There is one more thing you give up that people notice late: **portability**. Configuration is not code you own in the same way. Most platforms let you export a workflow as JSON, but that JSON only means something to that platform. Migrating between vendors is a rebuild, not a port. That is a cost, not a disqualifier — but it should push you toward learning tool *classes* rather than memorising one vendor's menus, which is exactly how this course is structured.

## The five classes of tool

Almost everything you will meet fits one of five classes. Learning the classes is what makes you portable, because a class has a shape — a data model, a pricing unit, a failure mode — and every product in it inherits that shape.

**1. Workflow automation platforms (integration platforms).** These connect applications: something happens in system A, do something in system B. Zapier and Make are the two this course teaches by name; n8n is a third in the same class with a self-hostable option. The shape is a **trigger followed by an ordered series of steps**. They hold no meaningful data of their own — data passes through them and is gone. They price by execution volume, and they are the default answer whenever the need is "when X happens, do Y."

**2. No-code databases.** A spreadsheet-shaped store with real field types, relations between tables, and an API in front of it. Airtable is the named example; the class also includes several spreadsheet-database hybrids. The shape is **tables of records with typed fields and links**. They are where state lives: the list of requests, the customer records, the log of what your automation has already processed. They also expose views, which are saved queries you can point other tools at.

**3. Interface and app builders.** These put a usable screen on top of a data source so that a human who has never seen your database can do one task. Softr is the named example, and most no-code databases now include an interface builder of their own. The shape is **pages composed of elements bound to a data source, with roles controlling who sees what**. They do not store data and rarely process it; they present it and collect it.

**4. Conversational and chatbot platforms.** These manage a multi-turn conversation with a person over a channel — a website widget, a messaging app — with some combination of scripted flows and model-generated answers, plus an escalation route to a human. The shape is **a conversation session with state, a knowledge source, and a handoff**. Lessons 12 through 14 treat this class at length.

**5. Hosted model APIs and AI middleware.** The model itself, reachable as a service, plus the layers people wrap around it: prompt management, retrieval over your documents, evaluation. In a no-code build this is almost always consumed as a *step inside one of the other four classes* rather than used directly, which is why it is the one class you rarely "choose" — you choose where it plugs in.

The classes compose. A realistic small system is a database (class 2) holding the records, an interface (class 3) for the humans, an automation (class 1) reacting to changes, and a model call (class 5) inside one of the automation's steps. That composition is exactly what your project in lesson 16 asks for.

## The axes that actually differentiate tools

When you compare two products *within* a class, five axes decide it. Ignore feature-count marketing pages; go straight to these.

**Trigger model — how quickly does it notice?** Some triggers are **instant**: the source system pushes an event the moment it happens. Some are **polling**: the platform asks "anything new?" on an interval, typically every 1 to 15 minutes depending on your plan. Polling is not a defect, but it is a latency floor and a cost multiplier, and it silently changes your design — a poll-based automation cannot answer a user waiting on a screen. Check the trigger type for the specific app you need, not the platform in general, because one platform often offers both for different apps.

**Pricing unit — what exactly gets counted?** This is the axis people get wrong most expensively. Zapier bills primarily by **task**, roughly meaning an action step that actually ran. Make bills by **operation**, roughly meaning any module that executed, including searches and iterations. Those units are not comparable, and neither is comparable to a per-seat or per-record price. A ten-step workflow that fires 1,000 times a month is 10,000 units of something; find out which something before you commit. Lesson 15 makes you do this arithmetic properly.

**Branching and data-handling power.** Can the workflow take different paths? Can it loop over a list of twenty items and act on each? Can it collect results back into one bundle? Can it call itself, or call another workflow? These capabilities differ sharply between products in the same class, and a tool that cannot iterate will force you into ugly workarounds the first time an email has three attachments.

**Extensibility — what happens when there is no connector?** Every platform has a list of supported applications, and your tool will eventually not be on it. The escape hatch is a generic HTTP step that lets you call any REST API directly (lesson 09) and a webhook endpoint that lets anything call you (lesson 10). A platform without both is a platform with a hard ceiling. Ask also whether you can save a configured HTTP call as a reusable action, because otherwise you will paste the same headers into fifteen places.

**Governance — who owns it and who can fix it?** Where do credentials live, and whose account authorised them? Can two people edit? Is there a version history and a way back to yesterday's working version? Is there an environment separation between a test build and the live one? These questions feel premature on day one and decide whether the thing survives its author leaving.

Two secondary axes matter in specific situations: **hosting** (a self-hostable tool such as n8n can run inside a network where a cloud service is not permitted, at the price of you operating it), and **data residency and compliance**, which is occasionally the whole decision and is not negotiable when it is.

## A method for choosing

Choosing well is a matter of reading the stated need carefully before opening any tool. Use this sequence.

**Step 1 — Write the need as one sentence in trigger-data-action form.** "When *[event]* happens in *[system]*, take *[data]*, and *[do something]* in *[system]*." If you cannot write that sentence, you do not yet understand the need, and no tool will rescue you. Ambiguity here is the single largest cause of rebuilt automations.

**Step 2 — Ask whether anything must be remembered.** Does the process need to know what it already did, hold a record for later, or accumulate a list somebody will read? If yes, you need a database (class 2) in the design, and the automation platform is not it. Storing state in a workflow tool is the classic beginner error; workflow platforms are pipes, not tanks.

**Step 3 — Ask whether a human needs a screen.** Does someone outside the build need to submit something, review something, or see a status? If yes, you need class 3. If the only humans involved already live in the source systems, you do not, and adding an interface is scope you will regret.

**Step 4 — Ask what the latency requirement really is.** "Real time" in most business processes means "within a few minutes." If it genuinely means "before the user's page finishes loading," you have left the comfortable region of no-code and should say so out loud. Match this to the trigger model from the axes above.

**Step 5 — Estimate volume, then multiply by steps.** Events per month times steps per event equals your pricing unit consumption. Do it now, roughly, on the back of an envelope. A design that is beautiful and costs more than a part-time employee is not a design.

**Step 6 — Check the connectors you need actually exist, one by one.** Open each platform's app directory and search for each system in your sentence. Note for each: does a connector exist, does it support the specific *trigger* you need or only actions, and what authentication does it use. Missing connectors are not fatal — lesson 09 exists for exactly this — but two missing connectors changes the effort estimate materially.

**Step 7 — Only now pick the product,** and prefer the one your organisation already pays for unless an axis above rules it out. Tool sprawl has a real cost in credentials, training, and the day somebody has to debug a system in a product nobody else uses.

## Three worked selections

**Need: "Every time a candidate submits our application form, the recruiter should get a summary in their team chat, and we should keep a record of every applicant."**

Sentence form: when a form submission happens, take the applicant's answers, summarise them and post to chat, and store the record. Step 2 says yes to memory — "keep a record of every applicant" is persistent state, so a no-code database is in the design. Step 3 says no interface is needed *yet*, because recruiters read chat. Latency is minutes. Volume is maybe 200 a month across four steps, so about 800 units — small. Selection: a no-code database for the applicant table, a workflow platform for the automation, a model step inside it for the summary. The form can be the database's own form feature, which removes a connector entirely.

**Need: "Our support inbox gets 300 emails a day. Route each one to the right team and flag the angry ones."**

Sentence form: when an email arrives, take its subject and body, classify it, and apply a label or route it. No persistent state is strictly required — the email system is the store — though a log table will earn its keep for reporting. No interface. Latency should be a couple of minutes. Volume is the story here: 300 a day is 9,000 events a month, and at four steps that is 36,000 pricing units. This is the case where the per-operation versus per-task difference between platforms becomes a real budget decision, and where you should ask whether cheap deterministic rules can handle the obvious 60% before a model sees anything.

**Need: "Field technicians need to log jobs from their phones, and the office needs a live view."**

Sentence form: does not fit cleanly, which is itself the finding. This is not primarily an automation need; it is a data-plus-interface need. Class 2 for the job records with relations to technicians and customers, class 3 for the mobile-friendly submission screen and the office dashboard. An automation platform enters only for the notifications around it. Someone who reaches for a workflow tool first here will build the wrong thing well.

## Where no-code stops

Be able to say, plainly, when the answer is "not with these tools." The honest boundaries are: sustained high volume where per-execution pricing beats a developer's salary; sub-second latency in a user-facing path; complex algorithmic logic that would need dozens of branches; strict regulatory environments that forbid the data leaving your network, unless you self-host; and anything where the product *is* the software rather than the process around it.

Saying this early is a professional strength, not an admission. The alternative is a system that works in the demo, becomes load-bearing, and then cannot be extended in the direction the business wants to go.

## Practice

Work through all four. Write your answers down — a selection you cannot defend in writing is a guess.

1. **Build a comparison table.** Pick two workflow automation platforms and fill in a table with one row per axis from this lesson (trigger model, pricing unit, branching and iteration, extensibility, governance). Every cell must be sourced from the vendor's own current pricing or documentation page, and you must record the URL and the date you checked. Where a claim is ambiguous, write "ambiguous" rather than guessing.

2. **Run the seven-step method on three needs.** For each of the following, produce the trigger-data-action sentence, an answer to each of steps 2 through 6, and a final selection naming the tool *class* for each part of the design.
   - "When someone books a meeting with our sales team, gather what we already know about their company and put a short brief in the salesperson's calendar invite."
   - "Our warehouse team wants to record damaged stock on a tablet and have finance see a running total by supplier."
   - "When a customer's subscription payment fails twice, pause their account and notify their account manager with the last three support tickets attached."

3. **Cost the second need at three volumes.** Take need 2 from exercise 2, count the steps in your design, and compute monthly pricing units at 50, 500, and 5,000 events per month on both platforms from exercise 1. Say at which volume, if any, your recommendation changes, and why.

4. **Find the ceiling.** Write a short paragraph describing one automation need that you would refuse to build with the tools in this lesson. Name the specific axis that rules it out and state what you would recommend instead. Then write the counter-argument — the strongest case someone could make for building it in no-code anyway — and say why you still would not.
