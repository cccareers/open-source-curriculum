---
lesson_id: se301-05
course_id: se301
pathway: technical-sales-representative
title: Pipelines and Campaigns in GoHighLevel
order: 5
kind: lesson
competency_ids:
  - D3-S1-C04
objectives:
  - Operate pipelines and campaign automation in GoHighLevel
---

## Where GoHighLevel comes from

The first two platform lessons were enterprise and mid-market tools: strict objects, heavy configuration, an administrator between you and the schema. GoHighLevel comes from a different world — marketing agencies serving small and local businesses — and it is built for a different job: catch an inbound lead fast, reach them on whatever channel they used, book an appointment, and track the sale through a simple pipeline.

That origin explains almost every design decision you will meet. There is one object for people rather than three. Segmentation runs on tags rather than on a rigid schema. Communication channels — SMS, email, social messaging, phone, and calendar booking — are inside the product rather than bolted on. And automation is not an advanced feature reserved for administrators; it is the centre of the product.

Because you are learning it third, the vocabulary map from lesson 2 does most of the translation for you. The remaining work is noticing **which distinctions this platform collapses**, and deciding what you will do to preserve the ones that still matter to your selling.

| Model concept | GoHighLevel |
| --- | --- |
| Person (qualified or not) | **Contact** |
| Organization | Business/company **fields on the contact**; there is no first-class company record in the classic model |
| The sale | **Opportunity**, in a **Pipeline** with **Stages** |
| Segmentation | **Tags** and **Smart Lists** |
| Work log | **Conversations**, **Notes**, **Tasks**, **Appointments**, and the contact activity feed |
| Automation | **Workflows** |
| Lead capture | **Forms**, **Surveys**, **Funnels**, **Chat widget**, **Calendars** |

Feature availability varies by plan and by how the sub-account was set up, and the product changes quickly. Every section below tells you the capability; confirm the specifics in your own sub-account rather than assuming a menu is where a tutorial from two years ago said it was.

## The account structure: agency, sub-accounts, and snapshots

GoHighLevel has a two-level structure that no other platform in this course shares, and misunderstanding it is the most common source of "I can't find the thing."

**The agency (or company) level** sits on top. It holds the master settings, the billing relationship, and the list of clients.

**Sub-accounts** — you will also see the older term *locations* — are the individual businesses. Each has its own contacts, pipelines, calendars, workflows, phone number, and settings. A sub-account is effectively a self-contained CRM. If you work for one business, you live in exactly one sub-account and the agency level is invisible to you. If you work at an agency, you switch between many, and **you must always know which sub-account you are in before you touch anything.** Sending a campaign from the wrong sub-account is a genuinely expensive mistake.

**Snapshots** are packaged configurations — pipelines, workflows, forms, calendars, custom fields — that can be loaded into a sub-account to stand it up quickly. They are why two sub-accounts can look completely different, and why an inherited sub-account may contain dozens of workflows nobody on your team wrote. Before changing anything in a sub-account you did not build, find out whether it came from a snapshot and who maintains it.

## One object for people

Every human is a **Contact**. There is no lead object, no conversion event, and typically no separate company record — the business name, address, and website are fields on the person. A contact carries the standard identifiers (name, phone, email, address), a source, an owner, tags, custom fields, and the entire communication history.

This is a real simplification and it fits the market: when you sell to a plumbing company, the plumbing company *is* one person for practical purposes. It becomes a limitation the moment you sell to organizations with several people involved in one purchase. In that situation, GoHighLevel's own answer is that the **opportunity** is the thing that holds the sale, and you keep the additional humans as separate contacts, connected by convention — a shared tag, a matching company field, a note on the opportunity — rather than by an enforced relationship.

Be clear-eyed about this rather than annoyed by it. If your selling genuinely needs a buying committee modeled with roles, this is the platform's weakest area and you compensate with discipline. If it does not, you have avoided a lot of unnecessary machinery.

### Tags: the power and the hazard

**Tags** are free-form labels attached to contacts, and in GoHighLevel they do work that other platforms give to picklists, lists, campaign membership, and lifecycle stages all at once. Tags drive segmentation, trigger and filter automation, and act as the memory of what has already been done to a person.

They are powerful precisely because they are unconstrained, and that is also the hazard. A sub-account that has been running for a year without a convention typically contains `hot-lead`, `Hot Lead`, `hotlead`, and `HOT` — four tags, one meaning, and every workflow keyed to one of them silently missing the other three.

Adopt a convention on day one and write it down:

- **One case and one separator**, always. Lowercase with hyphens is a fine choice: `source-google-ads`, `status-qualified`, `nurture-90day`.
- **Prefix by purpose**, so tags sort into families: `source-`, `status-`, `interest-`, `campaign-`, `do-not-`.
- **Tags that automation depends on are not decorative.** Removing one can end an enrollment; adding one can start a campaign. Treat the automation-bearing tags as a controlled vocabulary and keep them in a written list.
- **Prefer a custom field to a tag when the value is one-of-many.** Industry, deal size band, and preferred contact method are field values. Tags are best for *has this happened to them* facts.

### Custom fields and smart lists

**Custom fields** add structured data to a contact, with the usual types including dropdowns, numbers, and dates. Everything from lesson 2 applies: if you will filter or report on it, do not store it as text.

**Smart lists** are saved, filtered views of contacts — the daily work surface. Build them once and live in them: *contacts tagged `status-qualified` with no appointment booked*, *contacts created in the last 48 hours with no outbound attempt*, *contacts whose opportunity is open and whose last activity is older than a week*. A rep who works from smart lists is running a process. A rep who scrolls the full contact list is not.

## Opportunities: pipelines, stages, and status

The **Opportunity** is the sale, and it is where this platform meets the model exactly. An opportunity belongs to a contact, sits in one **pipeline** at one **stage**, and carries a value, an owner, and a source. Pipelines are displayed as a board with a column per stage, plus a list view for filtering.

Setting a pipeline up well is the same job as in any other CRM, and lesson 7 covers writing stage exit criteria in full. Two GoHighLevel-specific points matter here.

**Keep the pipeline short.** The board is the interface, and a pipeline with eleven stages is unusable on a screen and unfillable in practice. Four to six stages is the right range for the kind of velocity selling this platform is built for.

**Learn the status field.** In addition to its stage, an opportunity carries a **status** — typically Open, Won, Lost, and Abandoned. This is a real difference from the platforms in lessons 3 and 4, which encode won and lost as *stages*. Here the two are separate: a deal that is lost in the Proposal stage keeps the stage that records how far it got, and the status records the outcome. That is a genuinely useful piece of design — you can answer *where do we lose deals* without a special report — but it creates a discipline requirement:

- A deal you have given up on is **Lost** or **Abandoned**, not left Open in a late stage. Nothing corrupts a pipeline faster.
- Decide as a team what distinguishes Lost (they decided against you, or bought elsewhere) from Abandoned (they stopped responding and were never a decision). Write the distinction down; without it the two are used interchangeably and neither means anything.
- The pipeline's total value only counts what you allow to stay Open. A board full of stale Open opportunities is a number your manager will believe once.

## Conversations: the unified inbox

**Conversations** is GoHighLevel's most distinctive feature for a rep. It brings the channels into one threaded inbox per contact: SMS, email, and — depending on what is connected — Facebook and Instagram messaging, Google Business Profile messages, WhatsApp, and web chat. Calls and voicemails appear alongside them.

For fast inbound selling this is the whole point of the platform. A lead texts, you reply from the same screen you emailed them from, the thread is on the contact record, and the automation can see it.

The operating habits that make it work:

- **Reply on the channel they used.** Someone who texts you wants a text back. Answering an SMS with a formal email reads as evasion.
- **Use templates and snippets for the repetitive parts** and personalize the first line. The efficiency comes from not retyping logistics, not from sending everyone the same message.
- **Watch what automation is saying.** Automated messages appear in the same thread as yours, and nothing damages a conversation faster than a nurture sequence firing at a person you are actively negotiating with. Every automation you build needs a rule that stops it when a human takes over — this is exactly the suppression problem the next lesson formalizes.
- **Assignment and unread state are your queue.** Conversations assigned to you and unanswered are the highest-priority work in the platform, ahead of anything on your task list.

## Calendars and appointments

Booking is native. **Calendars** can be configured for a single person or for a team — round-robin distribution among reps, collective calendars requiring several people, or group booking — with availability rules, buffers, and notice periods.

An appointment carries a **status** that must be maintained: confirmed, showed, no-show, cancelled. This is not administrative trivia. Show rate is the metric that decides whether your booking process is working, and it can only be measured if somebody marks no-shows honestly. It is also the trigger for the most valuable automation on the platform: the reminder sequence that raises show rate, and the recovery sequence that re-books a no-show.

The other reason calendars matter here is that a booked appointment is usually the event that creates an opportunity. Decide explicitly whether your process opens an opportunity at booking or at the meeting itself, and make the automation do it consistently — otherwise half your pipeline is meetings that never happened.

## Campaign automation: workflows

**Workflows** are the automation builder, and in GoHighLevel they are not an advanced add-on — they are how the platform is meant to be used. A workflow is a **trigger**, some **actions**, and the branching and waiting between them.

**Triggers** start an enrollment. The available set is broad and includes things like a form or survey submission, an inbound message, a missed or completed call, an appointment being booked or its status changing, a tag being added or removed, an opportunity's stage or status changing, a contact being created, a birthday or other date field being reached, and manual addition from a list.

**Actions** are what happens next: send an SMS or email, wait for a period or until a condition, add or remove a tag, update a custom field, create or move an opportunity, assign an owner, create a task, book or cancel an appointment, send an internal notification, call a webhook, or create a **manual action** — a queued call or text that a human must actually perform, which is how you keep a person in the loop without losing the automation's structure.

**Branching** with if/else conditions lets one workflow handle several paths, and **goals** or exit conditions let a contact leave the workflow early when the thing you wanted has happened.

Three GoHighLevel-specific behaviours to establish in your own sub-account before you rely on any of this:

1. **Re-entry rules.** Can a contact enter the same workflow twice, and what happens if they are already in it? Getting this wrong is how people receive the same welcome message four times.
2. **Wait steps and timing windows.** A wait step that lands at 3 a.m. will send at 3 a.m. unless the workflow is configured to hold messages inside allowed hours. Set that up before you send anything.
3. **Stop conditions.** What removes a contact from an active workflow — a reply, a booked appointment, a tag, a stage change? Every outbound workflow needs at least one, and the reply case is non-negotiable.

### The legacy vocabulary

Older tutorials and inherited sub-accounts refer to **Campaigns** and **Triggers** as separate features that predate the workflow builder. Their capabilities were folded into Workflows, which is now the surface to build in. If your sub-account still exposes the legacy items — typically because it was created long ago or loaded from an old snapshot — treat them as read-only history, find out what still depends on them before deleting anything, and build new automation as workflows. When a tutorial you are following does not match your screen, this is the first thing to suspect.

## Compliance is a configuration step, not an afterthought

Because outbound SMS, email, and calling are built into this platform, the compliance obligations that other tools push onto a separate vendor land directly on you.

- **SMS sender registration.** Sending application-to-person SMS to US numbers requires registering your brand and campaign (the 10DLC process). Unregistered or misregistered sending gets filtered or blocked by the carriers, and the failure is often silent — messages simply do not arrive. If your texts are "not being received," check registration status before you debug anything else.
- **Email authentication.** Sending from your own domain requires the domain authentication records to be published correctly. Without them, deliverability collapses and you will conclude your copy is bad when your DNS is.
- **Consent and opt-out.** Every outbound program needs a defensible basis for contacting the person and a working opt-out that is honoured immediately and permanently across every workflow. Build the suppression into your automation, not into your intentions.
- **Quiet hours.** Do not text people at night. Configure the sending window; the reputational damage is real and the legal exposure is not theoretical.

None of this is optional polish. On this platform, "the campaign didn't work" is a deliverability problem at least as often as it is a messaging problem.

## Lead capture and reporting

Leads arrive through the platform's own capture surfaces — **forms** and **surveys** embedded in **funnels** or websites, the **chat widget**, inbound calls to the sub-account's number, and calendar bookings. Each of these can be a workflow trigger, which is what makes speed-to-lead achievable: the form submission itself starts the response.

**Reporting** covers pipeline value by stage, conversion between stages, appointment outcomes, call and message activity, and source attribution where the capture surfaces are tagged consistently. The quality of every one of those reports is downstream of your tag convention and your opportunity status discipline. Attribution in particular is worth only as much as the consistency of the source values you set at capture.

Three numbers matter more than the rest on this platform, because they are the ones its design is built to move:

- **Speed to first response** — minutes between a lead arriving and a human or an automation reaching them. This is the metric the whole product exists to improve.
- **Appointment show rate** — booked versus showed. It is the difference between a busy calendar and a working one, and it depends entirely on somebody marking no-shows honestly.
- **Open opportunity value by stage** — meaningful only if lost and abandoned deals are actually being marked as such.

If those three are right and everything else is missing, you have a functioning operation. If they are wrong, no dashboard will save you.

## Working a lead end to end

The same walkthrough as the previous two lessons, in this platform's vocabulary.

1. A prospect submits a form on a funnel page. A **contact** is created; a workflow tags the source, assigns an owner, and sends an acknowledgement within seconds. This is the platform's signature move, and it is the reason the automation lesson follows this one.
2. The acknowledgement arrives on the channel they used. They reply by SMS, and the reply lands in **Conversations** assigned to you, marked unread. That queue is now the top of your work list.
3. You have the qualification conversation in the thread or on a call. What you learn goes into **custom fields** — fleet size, current system, timeline — not into a note, because a note cannot be filtered.
4. When there is a real potential purchase, you create an **opportunity** on the contact, in the right pipeline at the first stage, with a value and an owner. Status is Open. If there is no real purchase, you tag them for nurture with a recall date and create no opportunity.
5. They book a slot through your **calendar** link. The appointment reminder sequence handles itself. After the meeting you set the appointment status honestly — showed, or no-show, which starts the recovery workflow.
6. The opportunity moves stage only when the stage's exit criteria are met. Every message, call, and appointment is on the contact record automatically because the channels are native; the only thing you have to add by hand is the interpretation — what it meant, in a note.
7. If you take over a conversation that automation was running, you make sure the workflow's stop condition actually fired. Check the contact is no longer enrolled rather than assuming.
8. The deal resolves. Won, Lost, or Abandoned — chosen by your written rule — and the stage left as the furthest point it reached, so the board still shows you where deals die.

## Practice

You need access to a GoHighLevel sub-account — an employer's, an agency's, or a trial. Do this work in a sub-account where test data is acceptable, and use your own phone number and email as the test contact so that no real person receives your experiments.

**1. Orient yourself.** Write down: which sub-account you are in and how you confirmed it; whether it was built from a snapshot; how many workflows already exist and whether any are active; and whether the legacy Campaigns/Triggers surfaces are present.

**2. Write a tag convention, then apply it.** Produce a one-page convention covering case, separator, and prefix families, listing at least twelve tags you would use across source, status, and interest. Then audit the existing tags in the sub-account and list every near-duplicate you find. Do not delete anything — note what you would merge and what would break if you did.

**3. Build a pipeline.** Create a pipeline of four to six stages for a sale you understand, with a one-sentence description of each stage written as a statement about the buyer. Create six opportunities across it with realistic values. Deliberately set one to Lost and one to Abandoned in mid-pipeline stages, and write down the rule you used to choose between them.

**4. Build a smart list you would actually work from.** At minimum: contacts with an open opportunity whose last activity is older than seven days. Then build a second one of your own choosing and justify in one sentence the decision it drives.

**5. Build a speed-to-lead workflow.** Trigger: a form submission. Actions must include an immediate acknowledgement to the contact, an internal notification to the owner, creation of an opportunity in the first stage of your pipeline, a status tag, and a follow-up attempt after a delay. It must have at least one stop condition that ends the sequence when the person replies or books, and it must respect a sending window. Test it end to end with yourself as the contact, and record what actually happened at each step versus what you designed.

**6. Break it, then fix it.** Submit the form twice with the same contact. Document what happened: did they enter the workflow twice, did they receive the message twice, was a second opportunity created? Then change the configuration so that the second submission behaves the way you want, and write down which setting you changed.

**7. Compare the platforms.** In 300–400 words, answer: which distinctions from lesson 2's model does GoHighLevel collapse, what does that buy the kind of business it was built for, and what specific discipline would you have to impose by hand to sell a six-person buying committee on this platform?
