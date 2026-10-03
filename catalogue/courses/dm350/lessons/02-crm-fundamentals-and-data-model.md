---
lesson_id: dm350-02
course_id: dm350
pathway: digital-marketer
title: CRM Fundamentals and the Customer Data Model
order: 2
kind: lesson
competency_ids:
  - D7-S1-C01
objectives:
  - Model contacts, companies, and activities in a CRM so the data stays usable
  - Keep CRM data clean through import, deduplication, and field discipline
---

## The Business You Will Build For

Every lesson in this course uses one company. Learn it now, because from here on the numbers are not decoration — they are the world you are working in, and by lesson 07 you will need to notice when one of them looks wrong.

**Northlight Bookkeeping** does monthly bookkeeping and quarterly close work for small creative agencies, design studios, and independent contractors in the United States. Remote team of nine: the owner, Ruth Ferreira; two client advisors, Marisol Vega and Theo Brandt, who run the intake calls and own the client relationship after signing; five bookkeepers; and you, the only marketer.

```txt
Northlight Bookkeeping - the standing facts

  Plans                 Solo $180/mo | Studio $450/mo | Firm $900/mo
  Average plan          $450/mo
  Gross margin          55%           ($247.50/mo gross profit)
  Average client life   26 months     (lifetime gross profit $6,435)
  Active clients        240
  Website traffic       14,000 sessions/month
  CRM contacts          8,400 total, 5,900 subscribed to marketing email
  Primary offer         "Book a 20-minute fit call" with an advisor
  Lead magnet           "The Quarterly Close Checklist" (PDF)
  Fit call -> client    22% of completed fit calls become clients
```

A scope note before you start. This course teaches the CRM generically, using the object-and-property model that HubSpot-style platforms share, because that model is what transfers between tools. It is not a click-by-click tour of any one product, and the menu you find in front of you at work will differ. What will not differ is the shape of the thing: records, properties, associations, activities, lists, workflows. The sales side of a CRM — pipeline management, forecasting, quota, deal review — is out of scope for this course. So is account management as a relationship skill. When this course says "client relationship management," it means the operational work of keeping the record of the relationship accurate and usable.

## What a CRM Actually Is

Strip away the interface and a CRM is a shared, structured, permanent memory of every interaction between a business and the people it deals with. Three of those words carry weight.

**Shared** means Marisol can see that a contact downloaded the checklist twice and opened four emails before booking, and you can see that Theo's call note says the prospect is switching from a bookkeeper who retired. Neither of you has to ask.

**Structured** means the memory is queryable. "Everyone in California on the Studio plan who has not been emailed in ninety days" is a question you can answer in eleven seconds if the data is structured and cannot answer at all if the same facts are buried in call notes as prose.

**Permanent** means it survives the person. When an advisor leaves, the relationship history stays. This is the single largest argument for CRM discipline and the one that persuades owners: without it, the company's memory walks out the door in a laptop bag.

What a CRM is *not*: it is not an email tool with contacts attached, and it is not a spreadsheet with a nicer skin. The difference is that in a CRM the contact is the center of gravity and everything else — emails, forms, calls, meetings, notes, page views, chat conversations — attaches to it. Every automation you build in lesson 06 reads from and writes to those attached facts. This is why the data model comes first in this course. An automated workflow running on a database where half the contacts have a blank country field is not a marketing program. It is a mistake being made on a schedule.

## The Object Model

A CRM stores **records**. Records come in types, called **objects**. Four matter for marketing work.

**Contacts** are people. One human being, one record, identified by email address. Sam Iyer is a contact.

**Companies** are organizations. Brightloom Creative, the twelve-person agency Sam works at, is a company record. Companies exist so that firmographic facts — employee count, industry, annual revenue, billing country — live in one place instead of being copied onto every person who works there. Copying them is how they drift.

**Activities** (sometimes "engagements") are things that happened at a point in time: an email sent, an email opened, a call logged, a meeting booked, a form submitted, a note written, a chat conversation. Activities are immutable history. They are what makes a contact record a story rather than a snapshot.

**Deals** are potential revenue. Northlight has them, because Marisol and Theo work them, and this course will not teach them. You need to know that the object exists and that marketing automation frequently *reads* deal state — "stop nurturing anyone with an open deal" is a rule you will write in lesson 06 — but managing a pipeline belongs to a sales course, not this one.

Objects connect through **associations**. Sam Iyer (contact) is associated with Brightloom Creative (company). The association is a real link, not a text field that happens to contain the company name. This distinction is worth being fussy about, because a text field called `company` typed in by hand will contain `Brightloom Creative`, `Brightloom`, `brightloom creative`, and `Bright Loom Creative LLC` within a year, and no filter will ever pull them together again.

## Ownership and the Shared Record

Every record has an **owner**: the user responsible for it. At Northlight, marketing-stage contacts are owned by you, and contacts who have spoken to a human are owned by Marisol or Theo. Ownership is not decoration — it decides who gets the task when a contact does something interesting, whose name appears on automated emails when you personalize the sender, and who someone asks when a record looks wrong.

Two mistakes are common. The first is leaving ownership blank, which means notifications go nowhere and every "who is looking after this?" question requires a meeting. The second is treating ownership as privacy: an owner is accountable for a record, not entitled to hide it. In a nine-person firm everyone can see everything, and that is the correct default — the whole value proposition of a CRM is that the memory is shared. Larger organizations restrict visibility for genuine reasons, but restriction should always be a decision someone made deliberately, never an accident of configuration.

Related, and worth deciding early: which system is the **source of truth** for which fact. Northlight's billing system knows what a client pays; the CRM knows what a prospect said they spend. When those two disagree about the same client, the billing system wins, and the CRM's copy is a convenience that must be refreshed or removed. Write down, for each important fact, which system owns it. Every organization that skips this ends up with three answers to "how many clients do we have," and a quarterly argument about which is right.

## Properties Are the Real Schema

A property is a named, typed field on a record. Properties are where CRM projects succeed or fail, because everything downstream — segments, personalization tokens, workflow branches, reports — reads properties. If a property is ambiguous, every downstream use is ambiguous.

The failure is rarely dramatic. Nobody notices the day a free-text field starts collecting four spellings of the same answer. It surfaces months later, when a segment that should hold 1,500 contacts holds 380, and the reason is buried three layers back in a choice somebody made in ten seconds. Treat the schema as the most consequential thing you will design in a CRM, because it is, and because it is the hardest thing to change once workflows, forms, and reports are all reading it.

Properties come in types, and the type is a design decision, not a formality:

- **Single-line text** — free text. Use it only where the value is genuinely unique per record (first name, job title).
- **Dropdown / single select** — one value from a fixed list. This is the workhorse. Anything you will ever filter on should be a dropdown, not text.
- **Multiple checkboxes / multi-select** — several values from a fixed list.
- **Number** — arithmetic works on it. Employee count, lead score.
- **Date picker** — a calendar date. Sortable, and usable in "more than 90 days ago" filters.
- **Single checkbox / boolean** — yes or no. Tempting for consent; usually the wrong shape, as lesson 09 explains, because a bare yes loses *when*, *how*, and *to what*.
- **Calculated** — derived from other properties. Convenient, but remember it is downstream of the fields it reads.

Here is Northlight's contact property schema. This is a real, working set; it is deliberately small, because a schema you can hold in your head is a schema people fill in correctly.

```json
{
  "object": "contact",
  "properties": [
    { "name": "email", "label": "Email", "type": "text", "unique": true, "required": true },
    { "name": "firstname", "label": "First Name", "type": "text", "required": true },
    { "name": "lastname", "label": "Last Name", "type": "text", "required": false },
    { "name": "lifecycle_stage", "label": "Lifecycle Stage", "type": "dropdown",
      "options": ["subscriber", "lead", "marketing_qualified", "sales_qualified",
                  "client", "former_client", "disqualified"],
      "default": "subscriber", "required": true },
    { "name": "original_source", "label": "Original Source", "type": "dropdown",
      "options": ["organic_search", "paid_search", "referral", "podcast",
                  "direct", "email", "chat", "event", "unknown"],
      "required": true, "note": "Set once on creation. Never overwritten." },
    { "name": "first_conversion", "label": "First Conversion Asset", "type": "dropdown",
      "options": ["quarterly_close_checklist", "fit_call_request",
                  "newsletter_signup", "pricing_page_form", "chat_qualified"] },
    { "name": "first_conversion_date", "label": "First Conversion Date", "type": "date" },
    { "name": "business_type", "label": "Business Type", "type": "dropdown",
      "options": ["agency", "design_studio", "solo_contractor", "other", "unknown"],
      "default": "unknown" },
    { "name": "monthly_expenses_band", "label": "Monthly Expenses Band", "type": "dropdown",
      "options": ["under_5k", "5k_25k", "25k_100k", "over_100k", "unknown"],
      "default": "unknown" },
    { "name": "current_bookkeeping", "label": "Current Bookkeeping Method", "type": "dropdown",
      "options": ["diy_spreadsheet", "diy_software", "part_time_bookkeeper",
                  "another_firm", "none", "unknown"] },
    { "name": "state_region", "label": "State / Region", "type": "dropdown" },
    { "name": "country", "label": "Country", "type": "dropdown", "required": true },
    { "name": "lead_score", "label": "Lead Score", "type": "number", "default": 0 },
    { "name": "marketing_consent_status", "label": "Marketing Consent Status",
      "type": "dropdown", "options": ["opted_in", "not_opted_in", "opted_out"],
      "required": true, "note": "See lesson 09. Timestamp and source live in their own fields." },
    { "name": "owner", "label": "Contact Owner", "type": "user_reference" }
  ]
}
```

Notice five choices in that schema and copy all five.

**Everything filterable is a dropdown.** `business_type` could have been free text. It is not, because "agency," "Agency," "creative agency," and "ad agency" would then be four segments instead of one.

**Every dropdown has an `unknown` option.** A blank field and a field that says `unknown` look the same to a human and completely different to a filter. `NOT unknown` is a clean condition; `is known` on a field that is sometimes an empty string is a coin flip.

**`original_source` is write-once.** The whole point of a first-touch source field is that it records the first touch. If a workflow overwrites it when the contact later arrives from a newsletter link, every source report the company has ever run becomes fiction. Write it on creation and lock it.

**Bands, not raw numbers, for self-reported figures.** Nobody types their exact monthly expenses into a form honestly. A four-option band gets answered, and it segments just as well.

**Consent is a status with a history, not a checkbox.** Lesson 09 builds this out properly.

## Field Discipline

A schema does not stay clean on its own. Six rules keep it clean.

**One meaning per field.** If you cannot write a one-sentence definition of a property that two people would agree on, the property is broken. Write those sentences down; the result is a **data dictionary**, and it is the single highest-value document a CRM owner maintains.

**Required means required at creation.** A field that is "required" but can be skipped is a suggestion. Decide which fields the CRM refuses to create a record without — Northlight's are email, first name, country, lifecycle stage, consent status, original source — and enforce them at every entry point: forms, imports, chat, manual creation, API.

**Prefer picking to typing.** Every free-text field is a small future cleanup project.

**Name properties for what they hold, not what you plan to use them for.** `webinar_flag` was set during one campaign in 2023 and now nobody knows what it means. `attended_quarterly_close_webinar_2023_q4` is ugly and still legible three years later.

**Deprecate visibly.** When a property dies, rename it with a `zz_deprecated_` prefix before deleting it, wait a cycle, and see what breaks. Deleting a property that a live workflow reads is a genuinely bad afternoon.

**Audit fill rate.** Fill rate is the share of records where a property has a usable value. Northlight's audit last quarter, over 8,400 contacts:

```txt
Property                    Filled   Fill rate   Verdict
  email                      8,400      100.0%   unique key, enforced
  country                    6,930       82.5%   1,470 blanks - fix
  business_type              4,116       49.0%   below half; segmentation is guesswork
  lifecycle_stage            8,400      100.0%   defaulted, so trivially 100% - see note
  marketing_consent_status   8,400      100.0%   enforced at creation
  monthly_expenses_band      2,352       28.0%   only asked on the fit-call form
```

Read that table the way an experienced person would. `business_type` at 49 percent means any segment built on it silently excludes half the database. `lifecycle_stage` at 100 percent is not good news — it is defaulted, so the real question is how many records are still sitting at the `subscriber` default long after they should have moved, and the answer at Northlight was 3,180. A high fill rate on a defaulted field measures nothing.

## Activities and the Timeline

Properties describe what a contact *is*. Activities record what a contact *did*, and when.

Marketing activities arrive automatically once the CRM's tracking is connected: form submissions, email sends, opens and clicks, page views on tracked pages, chat conversations, ad interactions. Sales-side activities arrive because a human logs them: calls, meetings, and notes. The mix matters, because the automatic ones are reliable and the manual ones are only as good as the team's habit.

The **timeline** is the merged, reverse-chronological view of all of it on one record. Read one before you write anything about a contact. Here is Sam Iyer's, abridged:

```txt
Sam Iyer - sam.iyer@brightloom.co - Brightloom Creative
lifecycle_stage: marketing_qualified | lead_score: 47 | owner: Marisol Vega

  Mar 04  Form submission  "Book a 20-minute fit call"   -> lead_score +25
  Mar 04  Page view        /pricing                       (3rd view this week)
  Mar 02  Email click      "What a clean quarterly close costs you"
  Mar 02  Email open       same
  Feb 26  Email open       "The four numbers your bookkeeper should send you"
  Feb 19  Chat conversation  qualified, business_type set to agency
  Feb 19  Form submission  "The Quarterly Close Checklist" -> contact created
  Feb 19  Page view        /guides/quarterly-close
```

That timeline tells you the shape of the relationship in fifteen seconds: found a guide, chatted, subscribed, read two emails, priced it, asked for a call. Two weeks, eight touches. An advisor opening this record before the call knows what to open with, and a workflow reading the same facts knows the contact no longer needs the introductory nurture email about what a bookkeeper does.

One discipline here: **activities are history and history is not edited.** If a call went differently than the note says, add a note. Do not rewrite the old one. The value of a timeline is that it is trustworthy.

The other discipline is about the manual half. Advisors log calls when logging is easy and skip it when it is not, so the practical question is never "should we log calls?" but "how few keystrokes can it take?" Log from the phone, log from the calendar integration, log a two-line note rather than a memo. A three-sentence note that exists beats a structured call report that does not. And agree on what a note is *for*: the next person's first thirty seconds, not a transcript. "Switching from a bookkeeper who retired, wants to be running clean by Q4, worried about contractor payments" is worth more than four paragraphs of narrative.

One last piece of vocabulary. People sometimes describe the CRM as the *system of record* and the email platform, ad tools, and chat widget as *systems of engagement*. The distinction is useful: engagement systems come and go, and the record has to survive them. That is the practical argument for pushing activity data back into the CRM rather than leaving each tool holding its own private history — when you replace the chat vendor next year, the conversations that mattered should still be on the contact's timeline.

## Lists

A **list** is a saved set of contacts. Every platform has two kinds and confusing them causes real damage.

A **static list** is a snapshot. Membership is decided once, when the list is built or when a contact is manually added, and it does not change afterwards. Use static lists for things that are true at a moment: everyone who attended the March webinar, everyone included in a specific one-off send, a suppression set you are holding fixed for a test.

An **active list** (dynamic, or "smart") is a saved query. Membership is recalculated continuously, so contacts join and leave on their own as their properties change. Use active lists for anything ongoing: all clients in California, all marketing-qualified contacts with no fit call booked, all contacts with no email engagement in 180 days.

The trap: people build an active list for a one-off send, schedule the send, and the list keeps changing between scheduling and sending. The other trap runs the other way — a static list called "Clients" built in January is quietly wrong by March. Ask one question each time: *should membership change after today?* Yes means active, no means static.

## Importing Without Poisoning the Database

The fastest way to ruin a clean CRM is a spreadsheet. Northlight's advisors kept a shared sheet of conference contacts and now want it imported. This is what the file actually looks like.

```csv
Email,First,Last,Company,Phone,Type,Notes,State
Sam.Iyer@Brightloom.co,Sam,Iyer,Brightloom Creative,(415) 555-0134,Agency,met at CreativeCon,CA
sam.iyer@brightloom.co,Samuel,Iyer,Brightloom,4155550134,creative agency,,California
d.okafor@paperkite.studio,Dara,Okafor,Paper Kite Studio,+1 503 555 0188,Studio,wants Q3 start,OR
D.OKAFOR@paperkite.studio,Dara,,Paper Kite Studio LLC,,design studio,dupe?,Oregon
info@millfieldpartners.com,,,Millfield Partners,,Agency,front desk email,NY
jules@,Jules,Renard,Renard Type,,solo,bad email,
t.brandt@northlightbooks.com,Theo,Brandt,Northlight,5035550119,internal,do not import,OR
mvega+test@northlightbooks.com,Test,Record,,,,,
```

Eight rows, and at least seven distinct problems. Work through them before you touch the import button.

**Duplicate emails differing only by case.** Row 1 and row 2 are the same human. Email addresses are case-insensitive in the part that matters for CRM identity, so normalize everything to lowercase *before* import. If you do not, some platforms create two records and others silently merge them with rules you did not choose.

**Conflicting values on the duplicate.** Sam versus Samuel, Brightloom Creative versus Brightloom, `Agency` versus `creative agency`. Someone has to decide which survives. See the merge rules below.

**A second duplicate pair, only visible after normalizing case.** Rows 3 and 4. The second one is emptier than the first, which is typical: later records are usually thinner, and a naive "last write wins" import blanks out good data with nothing.

**Free-text values that must become dropdown values.** `Agency`, `creative agency`, `Studio`, `design studio`, `solo` map onto exactly three of Northlight's `business_type` options. Map them in the spreadsheet, in a column you add yourself, before import — not afterwards in the CRM.

**A role account, not a person.** `info@millfieldpartners.com` has no first or last name and belongs to a front desk. Role addresses inflate your list, damage engagement rates, and are disproportionately likely to mark mail as spam. Do not import them as marketing contacts.

**An invalid address.** `jules@` will hard bounce. Every hard bounce costs you sender reputation, which lesson 07 will show you costs real money. Validate syntax before import and drop the failures into a separate file for someone to chase manually.

**Internal and test records.** Your own colleague and a plus-addressed test record do not belong in a marketing database. They will end up in a segment, receive a customer-only campaign, and someone will screenshot it.

**Two more you cannot see in the file at all.** There is no consent column — nothing in this spreadsheet records whether these people agreed to receive marketing, and lesson 09 explains why importing them into an email-eligible state anyway is the mistake that gets a program shut down. And there is no source column, so `original_source` has to be set for the whole batch at import time (`event`) rather than guessed per row.

The rule that follows from all of this: **an import is a project, not a button.** Clean in the spreadsheet, where you can see everything at once and undo is free. Never clean afterwards in the CRM, where undo does not exist.

## Deduplication and Merging

Deduplication needs a **unique key** — one property that identifies a human. For contacts it is email address, normalized to lowercase. That is not a perfect key (people change jobs and addresses) but it is the only one that is unambiguous, and consistency beats cleverness here.

Companies have no such key, which is why company deduplication is genuinely hard. `Brightloom Creative` and `Brightloom` and `Paper Kite Studio` and `Paper Kite Studio LLC` need matching on domain instead — `brightloom.co`, `paperkite.studio` — which works because a company's web domain is nearly unique and rarely retyped by hand. Match companies on domain and treat the name as a display label.

When two contact records are the same person, you **merge**, and merging is not symmetric. Decide the rules in advance and write them down:

```txt
Northlight merge rules - contacts

  Identity        lowercase email is the key; exact match only
  Surviving ID    the OLDER record survives (it holds original_source and
                  first_conversion_date, which are write-once)
  Property fill   for each property: keep the surviving record's value if it is
                  non-empty; otherwise take the losing record's value
  Never overwrite original_source, first_conversion, first_conversion_date,
                  marketing_consent_status and its timestamp
  Prefer newer    for volatile fields only: job title, phone, state_region
  Activities      ALL activities from both records move to the survivor -
                  history is never dropped in a merge
  Associations    union of both records' company associations
  Irreversible    most platforms cannot un-merge; export both records first
```

Applied to rows 1 and 2 of that CSV: the survivor keeps `Sam` if it was created first, keeps `Brightloom Creative` because it is non-empty, takes nothing from `Samuel`, gets `business_type: agency` from the mapping you did in the spreadsheet, and inherits both records' timeline entries. Losing "Samuel" is fine. Losing the March 4 fit-call form submission would not be.

Prevention beats merging. Three habits prevent most duplicates: make email the enforced unique key on every entry point; use forms that recognize a known visitor and update rather than create; and never let anyone import a file you have not deduplicated first.

## The Hygiene Routine

Data quality decays. Contacts change jobs at something like a quarter to a third of a B2B list per year, which means a list you never touch is meaningfully wrong within eighteen months. Put maintenance on a calendar.

**Weekly**: review records created in the last seven days with required fields blank; look at new duplicates flagged by the platform; check that forms are still writing to the properties you think they are.

**Monthly**: run the fill-rate table above and compare it to last month; review contacts still sitting at the `subscriber` default with recent activity, which means a lifecycle automation is failing; check for unassociated contacts whose email domain matches an existing company.

**Quarterly**: review the data dictionary against reality; deprecate properties nobody has read in two quarters; re-check dropdown option lists for options that were added ad hoc; and hand the marketing-eligible count to whoever is watching deliverability, because that number is the denominator for everything in lesson 07.

None of this is glamorous, and all of it is what separates a CRM that people trust from one where every report ends with someone saying "well, the data's a mess." The data is a mess because nobody scheduled the hour.

## Practice

Work in whatever CRM you have access to; if you have none, do all of it in a spreadsheet, which is where the thinking happens anyway.

1. **Write the data dictionary.** For each of the fifteen properties in Northlight's contact schema above, write one sentence defining exactly what the field holds and who or what sets it. Where the sentence is hard to write, say so and propose a fix. Then add two properties Northlight does not have but lesson 03 will need, with the same one-sentence treatment.

2. **Clean the import.** Take the eight-row CSV above and produce two files: `import-ready.csv`, with normalized lowercase emails, mapped `business_type` values matching the schema's options, a `country` column, an `original_source` column set to `event`, and a `state_region` column using consistent values; and `hold.csv`, with every row you refused to import and a one-line reason for each. Expect `import-ready.csv` to have fewer than five rows. Being ruthless is the correct answer.

3. **Apply the merge rules.** Write out, field by field, what the surviving record looks like for the Sam Iyer pair and the Dara Okafor pair after a merge under Northlight's rules. Note explicitly which values are discarded.

4. **Design three lists.** Write the membership criteria for: everyone eligible for a monthly newsletter send; everyone who downloaded the checklist but never booked a fit call; and everyone who attended the March webinar. For each, state whether it is static or active and defend the choice in one sentence.

5. **Audit a real one.** If you have access to a live CRM, pick any three properties and calculate their fill rate. Then find one property whose high fill rate is an artifact of a default value, as `lifecycle_stage` is above, and write down what you would have to measure instead to learn the truth.
