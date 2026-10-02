---
lesson_id: se301-04
course_id: se301
pathway: technical-sales-representative
title: Contacts, Deals, and Activity in HubSpot
order: 4
kind: lesson
competency_ids:
  - D3-S1-C04
objectives:
  - Manage contacts, deals, and activity in HubSpot
---

## HubSpot's version of the model

HubSpot implements the same model as the last two lessons with one large philosophical difference: **there is no separate lead object.** Every human is a Contact from the first form fill to the tenth renewal, and their qualification state is a *property* on that record rather than a different kind of record.

| Model concept | HubSpot |
| --- | --- |
| Unqualified person | **Contact** with an early lifecycle stage |
| Qualified person | **Contact** with a later lifecycle stage |
| Organization | **Company** |
| The sale | **Deal**, sitting in a **pipeline** |
| Person-to-sale junction | **Association** between contact and deal, optionally **labeled** |
| Work log | Activities on the record **timeline**: notes, emails, calls, meetings, tasks |
| Line items | **Line items** drawn from the **product library** |
| Post-sale request | **Ticket** |

The consequence of collapsing lead and contact is that there is no conversion event and no one-way door. Nothing is created or destroyed when a person qualifies; a property changes. That is genuinely simpler, and it costs you something: the discipline that Salesforce enforces with an object boundary, HubSpot leaves to you and to your portal's configuration.

HubSpot is sold as a set of **hubs** — marketing, sales, service, operations and others — at several tiers, and a meaningful number of the capabilities described below are paid features. This lesson names capabilities at the category level and tells you to check what your portal actually includes. Do that check early; discovering that sequences are not enabled halfway through building a cadence is a bad afternoon.

## Everyone is a contact: the lifecycle stage

**Lifecycle Stage** is the property that answers *how far along the journey to being a customer is this person?* Its default values run roughly:

| Lifecycle stage | Means |
| --- | --- |
| Subscriber | Has given you permission to contact them, nothing more |
| Lead | Has shown some interest — a form fill, a content download |
| Marketing Qualified Lead | Marketing judges them worth sales attention |
| Sales Qualified Lead | Sales has accepted them and judges a real opportunity possible |
| Opportunity | An open deal is associated with them |
| Customer | Has bought |
| Evangelist | Refers and advocates |
| Other | Everything that does not fit — partners, employees, journalists |

Two things about this property trip people up constantly.

**It is designed to move forward only.** Most portals are configured so that lifecycle stage does not automatically move backwards; a customer who fills in a top-of-funnel form should not silently be demoted to Lead. If you need to move a record backwards, that is usually a deliberate manual action, and in some portals it is restricted. Know which your portal does.

**It also exists on the Company record,** and companies and contacts can be configured to sync stages. Whether your portal syncs them is a configuration question with real reporting consequences: an organization can perfectly well be a Customer while a new individual at it is a Subscriber.

Lifecycle stage is a *journey* property. It is not your daily working field, and this is the distinction most new HubSpot users miss.

### Lead status: the daily working field

**Lead Status** is where the actual work is tracked. Its default options typically include values such as New, Open, In Progress, Open Deal, Unqualified, Attempted to Contact, Connected, and Bad Timing — but this is one of the most commonly customized properties in the product, so read yours before assuming.

The division of labor is: **lifecycle stage says where they are in the journey; lead status says what you are doing about it right now.** A person can sit at Sales Qualified Lead for three weeks while lead status moves New → Attempted to Contact → Connected → Bad Timing. Reporting on lifecycle stage tells the company how the funnel is performing. Reporting on lead status tells a manager whether the reps are working.

Both are picklists, and both are only worth anything if they are kept current. Treat lead status the way lesson 3 treated Salesforce's lead status: never leave a person in an in-progress value indefinitely, and always record a negative outcome explicitly rather than by silence.

## Companies and the association graph

The **Company** record holds the organization, and HubSpot will usually associate contacts to companies automatically by email domain — a genuine convenience that comes with a genuine failure mode. Contacts using personal email addresses will not auto-associate, and one company operating several domains ends up as several company records. Get in the habit of confirming the association rather than assuming it happened.

Where HubSpot is more flexible than the strict enterprise model is that its objects form an **association graph** rather than a rigid hierarchy: contacts associate to companies, deals to both, tickets to all three, and quotes and line items to deals. A single deal can carry several contacts and more than one company where that reflects reality.

### Association labels

An association can carry a **label** describing what the relationship *is* — decision maker, billing contact, technical evaluator, champion. This is HubSpot's version of the junction-with-a-role from lesson 2, and it is available in portals where the feature is enabled.

If you have labels, use them, for exactly the reason Salesforce contact roles matter: a deal associated with one unlabeled contact is single-threaded and nobody can see it. If you do not have labels, agree a convention with your team — a "Role" property on the contact, or a note pinned to the deal — and apply it consistently. A convention everybody follows beats a feature nobody uses.

## Deals and pipelines

A **Deal** is the sale. It lives in a **pipeline**, which is an ordered set of **deal stages**, and it is displayed either as a board with a column per stage or as a table you can filter and sort.

The load-bearing fields on a deal record:

- **Deal name** — follow a team convention. *Company — What is being sold — Term* is far more useful in a list of forty deals than "Q3 opportunity."
- **Amount** — same warning as every other platform: know whether your team means annual value, total contract value, or first-year billings, and apply it consistently.
- **Close date** — your genuine expectation of when it closes. It drives every period report.
- **Deal stage** — where the buyer is. Not what you did.
- **Pipeline** — which process this deal follows.
- **Deal owner** — you.
- **Deal type** — new business or existing business, by default.

### Pipelines and stage probability

Each deal stage in a pipeline carries a **probability**, set when the pipeline is configured, and stages are typed so the system knows which ones mean *closed won* and *closed lost*. That typing is what lets HubSpot compute win rates without being told which column means success.

Many portals expose a **weighted amount** derived from amount × stage probability. It is a useful summary and a dangerous one: it is only as good as the probabilities somebody typed into the pipeline settings, which are frequently the defaults nobody revisited. Lesson 8 shows how to calibrate those numbers from your own history rather than inheriting them.

A portal can run **multiple pipelines** — new business, renewals, partner-sourced. Create a second pipeline when the *stages* genuinely differ; use a property when only the category differs. Every extra pipeline is another set of stage definitions your team has to keep honest.

The board view supports dragging a deal between columns, and where required properties are configured on a stage, the drag will prompt you for them. That prompt is not an obstacle; it is the pipeline's exit criteria being enforced at the only moment anyone is paying attention.

## The activity timeline

Every record has a **timeline** of activities, and HubSpot's set is: **notes**, **emails**, **calls**, **meetings**, and **tasks**. Activities associate to records, and an activity logged on a contact can also appear on the associated deal and company — check the association when you log, because an activity attached only to the contact leaves the deal looking dead.

Practical habits:

- **Filter the timeline** by activity type when you are preparing for a call. Reading twelve marketing emails to find the one call summary is a waste of the five minutes you had.
- **Pin the activity that matters.** A pinned note holding the deal's context — the qualification summary, the agreed next step, the reason they nearly said no — is the single highest-value thing on the record for whoever picks it up next.
- **Write notes for a stranger.** Assume you are on holiday and a colleague is covering. "Spoke to Priya, good call" is worthless. "Priya (VP Ops, champion) confirmed budget is approved for FY next year, decision gated on IT security review starting in March; her blocker is claims escalation volume, ~500/month at 45 min each" is a deal you can hand over.

### Email and calendar connection

Connect your mailbox and calendar in your first week. With an inbox connected you can log and track email from your normal mail client, and meetings booked through **meeting links** create the record and the associated contact for you. Portals also provide a forwarding or BCC address so that mail sent from anywhere can be attached to the right record.

Understand what tracking does and does not tell you. An open notification means an image loaded in some mail client. It is a weak signal, occasionally a false one, and it is not a reason to call somebody and say "I saw you opened my email." Use it in aggregate — a sequence step nobody opens is a bad subject line — not as surveillance.

### Tasks and queues

**Tasks** are your future work: a type (call, email, to-do), a due date, an associated record, and a reminder. **Task queues** group tasks so you can work them in sequence rather than clicking back and forth between records — the difference between forty scattered follow-ups and a focused fifty-minute calling block.

The invariant from lesson 2 applies here too, and it is the easiest quality rule to check in HubSpot: **every open deal has an open task with a date on it.** Build a view that shows deals with no upcoming activity and look at it weekly.

## Working the day: views, lists, and boards

Three surfaces, three purposes.

**Saved views** on an object's index page are filtered, named, shareable lists — *my open deals closing this month*, *my SQL contacts with no activity in 14 days*. This is where a HubSpot rep's day should start. Build views by filtering, then save them; re-filtering every morning is a tax you pay forever.

**Lists** (contact-based or company-based) come in two kinds, and the difference matters. An **active list** is a saved query: membership recalculates as records change, so a record that stops matching leaves the list. A **static list** is a snapshot: membership is fixed at creation, and records stay in it. Use active lists for anything ongoing; use static lists when you need a stable population — the people invited to a specific event, the cohort you are measuring.

**The deal board** grouped by stage is your pipeline review surface. Sort it by close date or by last activity, and the deals that need attention surface themselves.

## Sequences and workflows: two different tools

HubSpot has two automation surfaces that beginners conflate, and knowing which is which is the point of this section. The discipline of *designing* automation is the next lesson; what follows is the vocabulary you need to bring to it.

**Sequences** are rep-driven, one-to-one outreach cadences. You enroll an individual contact in a series of scheduled emails and tasks, the emails come from your own mailbox, and enrollment ends automatically when the person replies or books a meeting. Sequences are a personal productivity tool: they exist to stop you forgetting the fourth follow-up. They are not for hundreds of people at a time.

**Workflows** are portal-level automation acting on records: enroll contacts, companies, deals, tickets or quotes on defined triggers, then set properties, create tasks, rotate owners, send internal notifications, branch on conditions, and wait. Workflows are how a process gets enforced rather than remembered.

The rule of thumb: **if a human should appear to have sent it, it is a sequence; if the system should have done it, it is a workflow.** A five-step follow-up cadence after a demo is a sequence. Creating a task for the owner whenever a deal sits in Negotiation for more than fourteen days is a workflow. Both are typically paid features — confirm what your portal has before designing around them.

## Properties and data quality

Fields are called **properties** in HubSpot. They come in the usual types — single-line text, dropdown, radio, multiple checkboxes, number, date, calculation — and the rule from lesson 2 holds without modification: anything you will report on must be a dropdown or a number, never free text.

The data-quality tools worth knowing by name:

- **Required properties** on record creation, so a deal cannot be born without an amount and a close date.
- **Duplicate management**, which surfaces likely duplicate contacts and companies for review and merging. Run it periodically; merging two records is much cheaper than reconciling two histories.
- **Property validation** where available — enforcing formats, minimums, or maximums so a deal amount cannot be entered in cents.
- **Property descriptions.** If you create a property, write its description. A dropdown whose values nobody can define is a dropdown everybody fills in differently.

The portal-hygiene view every rep should own: a saved view filtered to *my open deals where close date is in the past*. It should be empty. It never is, which is exactly why lesson 7 exists.

## Quotes and line items

Where your portal uses them, **line items** attach products from the **product library** to a deal, and the deal amount can be derived from those lines rather than typed. **Quotes** turn those line items into a shareable priced document with its own record, so multiple versions are tracked rather than living in your sent folder.

For a rep the operational consequence is the same as in the previous lesson: when the deal's amount is derived, change the line items, not the total.

## Reports and dashboards

Views answer *what do I work on now*. Reports answer *what is happening*. HubSpot builds reports over the same objects and properties you have been filling in, and the range available to you depends on your portal's tier — from a set of prebuilt sales reports up to a custom report builder that joins objects together.

Three reports are worth building yourself rather than waiting for someone to hand them to you:

- **Deals by stage, summing amount**, filtered to your own deals. Your pipeline, in one picture.
- **Deals closed won and lost by month, with the close reason.** The record of what actually happened, and the only thing that makes a loss useful.
- **Contacts by lifecycle stage over time.** Whether the top of your funnel is filling or draining.

Two mechanical points. Reports built on a property nobody fills in produce a large "unknown" bucket, which is the report telling you about your data discipline rather than your business. And a **dashboard** is a saved arrangement of reports — build one and open it weekly rather than rebuilding filters each time you are curious.

## Working a deal end to end in HubSpot

A compressed walkthrough of the habits above, in sequence.

1. A person submits a demo request form. A contact record is created; the company auto-associates by email domain. Before touching anything, you check whether a company record and any open deals already exist — the equivalent of the account check in the previous lesson, and just as important.
2. You set lead status to Attempted to Contact, log the call attempt, and create a task for the next attempt with a due date. Lifecycle stage stays where marketing put it; that is not yours to advance yet.
3. You connect on the second attempt. Lead status becomes Connected. You log the call with a note written for a stranger: who they are, what hurts, what they said about timing.
4. The conversation establishes a real project, a budget owner, and a decision window. Now the lifecycle stage moves to Sales Qualified Lead and you create a **deal** — named by your team's convention, with an amount in your team's convention, a close date matching the buyer's stated process, and the earliest stage whose exit criteria you have genuinely met.
5. You associate the additional people as you meet them, with labels where you have them: the champion, the economic buyer, the technical evaluator. You pin the qualification note to the deal.
6. Every meeting is logged against both the contact and the deal, and every one ends with the next task created before you close the record. If the buyer's state changed, the stage moves; if only your activity changed, it does not.
7. Line items go on when scope firms up, and the quote is generated from them rather than typed into an email.
8. At close, the stage moves to the closed-won or closed-lost value, the close date is corrected to the real date, and the reason property is filled in honestly. If won, the lifecycle stage becomes Customer and whoever handles onboarding is notified.

Nothing in that sequence is difficult. All of it is skippable, and the difference between a rep whose portal can be forecast from and one whose cannot is entirely in whether they skipped it.

## What to carry across from Salesforce

If you learn HubSpot after Salesforce, four translations do most of the work.

1. **There is no conversion.** Qualification is a property change, so nothing stops you from letting an unqualified person drift into your working views. Your lead status discipline is the only guardrail.
2. **Associations replace lookups and contact roles.** They are more flexible and less enforced. Labels are the closest equivalent of contact roles, where enabled.
3. **Views and lists replace list views and reports** for daily work, and lists have the active/static distinction that trips people up.
4. **Sequences are new.** Salesforce has cadence tooling too, but the sequence-versus-workflow split is sharper here and worth carrying as a mental model into any platform.

## Practice

Sign up for a free HubSpot account if you do not have portal access; the free CRM tier is sufficient for most of what follows. Where an exercise needs a paid feature you do not have, write down what you *would* have built and why — that is the part being assessed.

**1. Audit your portal.** Record: the lifecycle stage values available; the lead status values available and whether they are the defaults; the pipelines that exist and, for each, the stage names in order with their probabilities; which properties are required to create a deal; and whether sequences, workflows, and association labels are enabled for you.

**2. Build a small book of business.** Create three companies and six contacts across them, using realistic firmographics. Deliberately create one contact with a personal email address and confirm what happens to its company association; fix it by hand and note what you did.

**3. Open and work a deal.** Create a deal on one company: a name that follows a stated convention, an amount, a close date, a stage, and at least three associated contacts with distinct labels or a documented convention if labels are unavailable. Then log five activities on it — a call, a meeting, two emails, and a note — with at least one associated to both the contact and the deal. Pin the note that a covering colleague would need.

**4. Prove the association matters.** Log one activity against a contact *without* associating it to the deal. Then open the deal's timeline and describe, in writing, what a manager reviewing that deal would conclude about how actively it is being worked. Fix the association.

**5. Build the three views you will live in.** (a) My open deals closing this month, sorted by close date. (b) My open deals with no scheduled activity. (c) An active list of contacts at lifecycle stage Sales Qualified Lead with no associated open deal. For each, write one sentence on the decision it drives.

**6. Compare the two platforms in writing.** In 300–400 words, take the same imagined deal and describe how it would be recorded in Salesforce and in HubSpot: which records exist, what the qualification moment looks like in each, and where the person-to-deal relationship is stored. Finish with the single biggest risk each model creates for a careless rep.
