---
lesson_id: se301-03
course_id: se301
pathway: technical-sales-representative
title: Working Leads and Opportunities in Salesforce
order: 3
kind: lesson
competency_ids:
  - D3-S1-C04
objectives:
  - Work leads and opportunities through a Salesforce pipeline correctly
---

## Salesforce's version of the model

Salesforce is the enterprise end of the CRM market, and it takes the strictest position of the three platforms in this course: it keeps every distinction from the last lesson as a separate object, and it enforces them.

| Model concept | Salesforce object |
| --- | --- |
| Unqualified person | **Lead** |
| Qualified person | **Contact** |
| Organization | **Account** |
| The sale | **Opportunity** |
| Person-to-sale junction | **Opportunity Contact Role** |
| Work log | **Task** and **Event** (together, Activities) |
| Line items | **Opportunity Product**, priced from a **Price Book** |
| Grouped outreach | **Campaign** and **Campaign Member** |

Two warnings before the detail. First, **your org is not the vanilla product.** Salesforce is heavily configurable; administrators rename fields, add required ones, restrict picklist values, and hide entire objects. Everything named here is standard, but the exact stage names, the required fields, and which of these objects you are even allowed to see are decisions somebody at your company made. Where this lesson says "check your org," check your org — do not assume.

Second, this lesson is about *operating* Salesforce as a rep and a light-touch configurer. Custom development — Apex, triggers, integration work — is a different discipline and is out of scope here.

## Leads: the holding area

A Lead in Salesforce is a person who has not been qualified yet, sitting in a staging area that is deliberately outside your clean database of Accounts and Contacts. That separation is the whole point: a purchased list of 4,000 names can land in Leads without polluting the Accounts your team relies on.

A Lead record carries the person's details and, unusually, a **Company** field that is required by default even though no Account record exists yet. That field is a piece of text, not a lookup — the organization does not become a real record until conversion. This is worth internalizing, because it explains a very common confusion: *searching Accounts for a company that only exists on a Lead will find nothing.* The company is text on a lead, not an account.

The fields that do real work on a Lead:

- **Lead Status** — the picklist that tracks progress through qualification. Standard values are minimal and almost every org replaces them. This field is the backbone of your daily lead work.
- **Lead Source** — where the person came from. This is one of the very few fields that survives conversion onto the Contact and the Opportunity, which makes it the basis for nearly all source-attribution reporting. Fill it in properly. Every "Unknown" is a hole in the company's understanding of what marketing works.
- **Rating** and any lead score field — an assessment of quality, sometimes manual, sometimes populated by an automated scoring model.
- **Owner** — who is responsible. On a Lead, the owner can be an individual *or* a **Queue**, which is Salesforce's shared-bucket concept: leads sit in the queue until a rep takes ownership.

### Lead status and the disqualification path

A workable status ladder looks something like this. Confirm the exact values in your own org rather than assuming them.

| Status | Means | Rep's next move |
| --- | --- | --- |
| New | Arrived, untouched | Attempt contact within the agreed response window |
| Working | Attempts made, no two-way conversation yet | Continue the attempt cadence |
| Nurturing | Real person, real interest, wrong time | Hand back to marketing nurture with a recall date |
| Qualified | Meets the qualification bar; a real potential purchase exists | Convert |
| Disqualified / Unqualified | Not a fit, not a real person, or no interest | Set a disqualification reason and stop |

Two habits separate professionals here. **Disqualify explicitly and give the reason.** A lead you simply stop touching stays in the pipeline forever, gets re-worked by a colleague in six months, and quietly inflates every top-of-funnel number in the company. A lead marked disqualified with a reason picklist value is data marketing can learn from. **And do not sit in Working forever.** Every org has a definition of how many attempts over how many days constitutes a worked lead. Find yours; when you hit it, decide.

### Assignment: how leads reach you

New leads arrive through a few standard doors, and knowing which one your company uses tells you where to look when a lead you were promised never appears.

- **Web-to-Lead** takes a form submission on your website and creates a Lead record directly.
- **Lead assignment rules** are ordered criteria evaluated on creation (and optionally on later edits) that set the owner — by territory, industry, size, or source.
- **Queues** hold unassigned leads for a team to pull from.
- **Import** brings in list files in bulk, usually by an operations person rather than a rep.
- **Manual creation** is you, typing, after a conference conversation.

## Conversion: the one-way door

**Conversion** is the specific event that promotes a Lead into the real database. Running it typically produces three things at once:

1. An **Account** — either newly created from the Lead's Company text, or matched to an existing Account you select.
2. A **Contact** — either newly created, or matched to an existing Contact.
3. Optionally, an **Opportunity** — a new sale record, which you can decline to create.

The Lead is then marked converted and becomes effectively read-only. **This is not reversible through the interface.** Treat conversion as a commitment, and get two things right before you click it.

**Search for the existing Account and Contact first.** If your company already sells to Calder Logistics, converting a lead into a brand-new "Calder Logistics" account splits that customer's history in two. The conversion step offers to match against existing records; use it, and search with a shortened company name to defeat spelling variations.

**Understand the field-mapping trap.** Standard lead fields map onto their equivalents on Account, Contact, and Opportunity. **Custom** lead fields only carry across if an administrator has configured a mapping for them — and if no mapping exists, the value stays on the converted lead and is invisible on the records you now work. This is one of the most common sources of "where did the information I collected go?" If a custom field on your lead form matters downstream, ask your admin whether it is mapped, and check on a test conversion.

**Decide honestly whether an Opportunity exists.** Do not create one because the conversion screen offers it. An Opportunity means an identified potential purchase with a plausible amount and date. If you have a friendly contact but no project, convert without an Opportunity and create it later when the project is real.

## Accounts and contacts after conversion

After conversion the person lives on a **Contact**, related to an **Account** through the Account Name lookup. The Account is the hub: its record page shows the related contacts, the open and closed opportunities, the cases, and the activity history, which is why an account view is the right place to start before any customer conversation.

Two related capabilities are worth recognizing. Accounts can be arranged into **hierarchies** through a parent-account field, which is how large customers with subsidiaries are modeled. And a contact can be related to *more than one* account where your org has enabled that capability — useful when a person moves employers or advises several. If you need it and it is not there, it is a configuration question.

## The opportunity record

The Opportunity is where your pipeline lives, and four fields carry nearly all of the weight.

**Stage.** The picklist that positions the deal in the pipeline. Which values are available to you depends on the **Sales Process** attached to your record type — an org can run different stage sets for new business and renewals. Stage is not a description of your activity; it is a statement about where the buyer is. Lesson 7 covers writing exit criteria for stages, and lesson 8 covers what stage means to a forecast.

**Amount.** The value of the deal. Your first question at any employer is *what convention does this field use* — annual recurring revenue, total contract value, or first-year billings. All three are defensible; a team where different reps use different ones has an unusable pipeline.

**Close Date.** The date you expect the deal to close. Required. It drives every period report and forecast in the system, and it is the single most abused field in CRM. The end of the current quarter is not a close date; it is a wish.

**Next Step.** A short text field for the immediate next action. Underused, and worth using — combined with an open Task it is the fastest way for anyone (including you, on a Monday morning) to see whether a deal is alive.

Around those sit **Probability**, which auto-populates from the stage and is usually editable; **Type** (new business, renewal, expansion); **Lead Source**, carried over from conversion; and **Owner**.

### Forecast categories

Salesforce adds a field the other platforms in this course treat differently: **Forecast Category**. It groups opportunities into buckets — typically Omitted, Pipeline, Best Case, Commit, and Closed — and it defaults from the stage while remaining independently editable.

The reason it exists is that stage and confidence are not the same thing. Two deals in the same late stage can have very different odds: one has a signed order form waiting on a countersignature, the other has a champion who has gone quiet. The stage cannot express that. The forecast category can: the first is Commit, the second is Best Case at most.

Used well, this field is where your judgment enters the forecast. Used badly — never touched, or set to Commit to look good in a pipeline review — it makes the forecast worse than the raw stage math would have been. Lesson 8 builds a forecast from these categories and shows the arithmetic.

### Contact roles: who is actually on the deal

**Opportunity Contact Roles** are the junction from the last lesson. Each one links a Contact to the Opportunity and records a **Role** — economic buyer, decision maker, evaluator, influencer, executive sponsor — with one contact marked **Primary**.

Reps skip this constantly, and it costs them. An opportunity with one contact role attached is a deal with single-threading risk that nobody can see. Roles make the risk visible, they are what lets your manager ask the useful question in a review, and they are what allows reporting on whether deals with an identified economic buyer close at a higher rate. They also feed campaign influence reporting. Fill them in as you meet people, not the week before close.

### Products, price books, and where Amount comes from

An Opportunity's Amount can be typed directly, or it can be derived. When your org uses **Opportunity Products**, you add line items drawn from a **Price Book** — a named list of products with prices — and the Amount becomes the roll-up of those lines rather than a number you enter. Once products are present, expect the Amount field to stop being directly editable.

For a rep this means: if you cannot edit the Amount, look for line items. And if quantities or discounts change, change the line items rather than trying to force the total.

**Quotes**, where enabled, are a further layer: a formal priced offer generated from the opportunity's line items, with its own record so multiple versions can be tracked and one marked as synced back to the opportunity.

## Recording work: tasks, events, and the timeline

Salesforce splits activities into **Tasks** (something to do or something done — a call, an email, a to-do, with a due date) and **Events** (something on a calendar, with a start and end time).

The mechanic that makes them useful is that an activity carries *two* relationships: one to a person (a Contact or a Lead) and one to a related record (typically the Account or the Opportunity). Set both. An activity attached only to the contact is invisible from the deal, and a manager reviewing the opportunity concludes nothing has happened.

**Logging a call** creates a completed task with your notes. **Email logging** through the available mailbox-integration options attaches correspondence with known contacts automatically. Configure that integration during your first week; every rep who logs email by hand eventually stops.

Two more collaboration surfaces sit on the record. **Chatter** is the internal feed, where @mentioning your solutions engineer on the opportunity keeps the question with the deal rather than in a chat app nobody can search later. **Files and notes** attach documents to the record — the security questionnaire, the signed order form.

## Seeing your pipeline

Three views answer three different questions.

**List views** filter a single object into a saved, named list — *my open opportunities closing this quarter*, *leads assigned to me in New status*. They are your daily work surface. Learn to build one from filters rather than sorting the default list every morning.

**Kanban** displays a list view as columns by a picklist, usually Stage, with drag-to-change. It is the fastest way to review your pipeline and to spot the deal that has been sitting in the same column for two months. Remember that dragging a card just edits the stage field — if the org enforces required fields or validation on stage change, the drag will be blocked, and that is the system doing its job.

**Reports and dashboards** answer questions across objects: opportunities by stage and owner, leads by source with conversion outcome, opportunities with contact roles. Every report is built on a **report type**, which determines which objects and fields are available and whether related records are required or optional. When a field you know exists is not offered in the report builder, the report type is usually the reason.

Learn to build three reports yourself and you will never be dependent on someone else's dashboard: your open pipeline grouped by stage with a sum of Amount, your closed business for the current period, and your leads by status with age.

## Guardrails you will meet

When Salesforce refuses to do something, it is nearly always enforcing a decision somebody made deliberately.

- **Required fields** block the save until filled. The message names the field.
- **Validation rules** block a save when a combination is illegal — a stage of Closed Won with no close reason, a discount above a threshold with no approval flag. Read the error text; it usually contains the policy.
- **Record types** control which picklist values and which page layout you see, and which Sales Process (and therefore which stages) apply. If a colleague has a stage you do not, record type is the first suspect.
- **Duplicate and matching rules** warn or block when a new record resembles an existing one. Take the warning seriously; merging later is slow and lossy.
- **Sharing and visibility** determine which records you can see at all. A record you cannot find may exist and belong to someone else.
- **Approval processes** route a record for sign-off and often lock it while pending. A locked opportunity is usually waiting on a human, not broken.

Where stage history tracking is enabled, the system also retains a history of stage changes and their dates — the raw material for stage-duration analysis. Assume your changes are recorded, because they generally are.

## Working a deal correctly, end to end

A compressed walkthrough of the habits this lesson is really teaching.

1. A lead arrives from a webinar. Before touching it, you check Accounts for the company — a related account already exists, owned by a colleague. You message them. This thirty-second check is the difference between a coordinated approach and two reps calling the same buyer.
2. You call, reach the person, and log the call as a completed task against the lead. You set Lead Status to Working and add a task for the follow-up attempt on Thursday.
3. On the second call they describe a funded project with a decision expected in the next quarter. Status goes to Qualified. You convert, matching the existing Account and creating a new Contact, and you create an Opportunity in the process.
4. You set the Opportunity's Amount using your company's convention, a Close Date that reflects the buyer's stated decision timeline rather than your quarter end, the stage whose exit criteria you have actually met, and a Next Step in plain language.
5. You add contact roles as you meet people: your champion as primary, the VP as economic buyer, and later the procurement manager. You add line items when scope firms up.
6. After each meeting you log the activity against both the contact and the opportunity, update Next Step, and — if the buyer's state genuinely changed — move the stage. You set Forecast Category by judgment rather than by hope.
7. The deal closes. You set the stage to the closed value, correct the Close Date to the day it actually closed, and complete the required close fields. If it is lost, you fill in the loss reason honestly, because in six months that field is the only thing anyone will remember.

## Practice

You need a Salesforce environment. A free Developer Edition org or a Trailhead playground works; so does a sandbox if your employer provides one. Never do exercise work in a production org.

**1. Map your org.** Write down, from the environment itself rather than from this lesson: the exact Lead Status values available to you; the exact Opportunity Stage values in order, with the probability each one defaults to; which fields are required on Opportunity creation; and whether Forecast Category is present and editable. Note any field name that has been customized away from the standard.

**2. Run a lead through to a qualified opportunity.** Create a lead by hand with a realistic company and source. Log two call attempts as tasks, advance the status appropriately, then convert it — deliberately choosing to match an existing account if one is present. Afterwards, open the converted lead and answer in writing: which fields carried across onto the Contact and Opportunity, and which stayed behind?

**3. Build the deal out.** On the resulting opportunity, set Amount, Close Date, Stage, and Next Step; add at least three contact roles with distinct roles and one primary; log a meeting as an event related to both a contact and the opportunity; and add a note recording what the buyer said. If your environment has a price book, add line items and observe what happens to the Amount field.

**4. Break something on purpose.** Try to save an opportunity with an empty required field, and try to drag a deal to a closed stage in Kanban without completing whatever the org requires. Record the exact error messages and, for each, write one sentence describing the business rule the message is enforcing.

**5. Build your daily views.** Create (a) a list view of your open opportunities closing in the current quarter, sorted by close date; (b) a Kanban view of the same list grouped by stage; and (c) a report of opportunities grouped by stage with the Amount summed. Screenshot or export all three.

**6. Write the handover note.** In under 300 words, explain to a new colleague joining your org: where new leads land, what the qualification bar is, what conversion creates, what Amount means here, and the one guardrail most likely to block their first save. This note is the deliverable that proves you understood the org rather than the software.

## Check your understanding

1. You search Accounts for a company you know is in the system and find nothing. What is the likely explanation? *(Answer: the company exists only as text in the Company field of an unconverted Lead.)*
2. After conversion, a custom field you collected on the lead is missing from the Contact. Why? *(Answer: custom lead fields carry across only if an administrator has mapped them.)*
3. Two deals are both in Negotiation. One has a signed order form awaiting countersignature; the other's champion has gone quiet. Which field expresses the difference? *(Answer: Forecast Category — Commit for the first, Best Case at most for the second.)*
