---
lesson_id: se301-02
course_id: se301
pathway: technical-sales-representative
title: How a CRM Models a Sale
order: 2
kind: lesson
competency_ids:
  - D3-S1-C04
objectives:
  - Explain how a CRM models a sale — objects, records, stages, and their relationships
---

## Why the model comes before the tool

If you learn a CRM by memorizing where the buttons are, you have learned one CRM, badly. When your employer switches platforms — and over a career you will use three or four — you start from zero. Worse, you will make the same category of mistake in every one of them, because button-knowledge does not tell you *what a record is for*.

Underneath the interfaces, every serious CRM implements a small, shared model. There are a few kinds of things (people, organizations, sales, work done, things sold), those things relate to each other in defined ways, and the state of a sale is tracked by moving one record through an ordered list of stages. Salesforce, HubSpot, and GoHighLevel all implement that model. They disagree about names, about how strictly they enforce it, and about how much of it exists out of the box — and almost nothing else.

This lesson builds that model deliberately, with no platform in front of you. The three lessons that follow are each the same model wearing a different vocabulary, and you will find them dramatically easier if you can already answer four questions about any system you are handed:

- Where do people live, and where do the organizations they work for live?
- Where does the *sale itself* live, separately from the people?
- How does work — calls, emails, meetings, notes — get attached to those records?
- What does this system call the things I already understand?

## Objects, records, and fields

Three words, used precisely, will save you a great deal of confusion.

An **object** is a *type* of thing the system stores: Contact, Company, Opportunity. It is the table. Objects come in two flavors — **standard objects**, which ship with the platform and which every customer has, and **custom objects**, which an administrator adds for something specific to that business (a "Property," an "Enrollment," a "Vehicle"). As a rep you will spend nearly all of your time in standard objects.

A **record** is one instance of an object: the Contact record for Priya Raman; the Opportunity record for *Calder Logistics — Support Platform Renewal*. Records have a system-generated **record ID** that never changes even when every visible field on the record does. That ID is what makes a record traceable through exports, reports, and integrations. When you export data and rejoin it later, you join on the ID, never on the name — names are edited, duplicated, and misspelled.

A **field** is one attribute on a record: Email, Amount, Close Date, Stage. Fields have **types**, and the type matters more than beginners expect:

| Field type | Holds | Why the type matters |
| --- | --- | --- |
| Text | Free-form characters | Cannot be reliably filtered, grouped, or reported on |
| Picklist / dropdown / enumeration | One value from a fixed list | The only reliable basis for reporting, routing, and automation |
| Number / currency | A quantity | Can be summed and averaged; a currency amount stored as text cannot |
| Date / datetime | A point in time | Enables aging, time-based automation, and period reporting |
| Checkbox / boolean | True or false | Cheap, unambiguous flags |
| Lookup / association / reference | A pointer to another record | This is what makes the model relational instead of a spreadsheet |
| Formula / calculated | A derived value | Always current, never typed by a human, cannot be wrong on entry |

The rule to take away: **anything you will ever want to count, filter, or automate on must not be free text.** "Reason we lost" typed into a notes field is a story. "Closed Lost Reason" as a picklist with eight defined values is data. Most of the pain in a badly-run CRM traces back to somebody storing a category in a text box.

## The five things a CRM tracks

Strip away every platform's marketing and you are left with five kinds of record.

**1. The person.** A human being with a name, an email address, a phone number, a job title. Depending on the platform this is a Lead, a Contact, or both.

**2. The organization.** The company that person works for, holding the firmographics — industry, size, region, website, owner. Called an Account or a Company. In some tools, particularly those built for small-business and consumer selling, this object is optional or absent; the person carries the company name as a field instead.

**3. The sale.** The potential piece of revenue itself: a name, an amount, an expected close date, and a stage. Called an Opportunity or a Deal. This is the single most important object in a sales CRM and the one most often misused.

**4. The work.** Every call, email, meeting, note, and task. Called Activities, Engagements, or simply the timeline. This is the audit trail — the answer to "what has actually happened on this deal."

**5. The thing being sold.** Products, line items, price books, quotes. Present and heavily used in some organizations, ignored entirely in others where the opportunity's Amount field is the whole story.

Everything else — campaigns, tickets, contracts, tasks, custom objects — hangs off those five.

## How the objects relate

![Entity-relationship diagram of the core CRM objects: an Account with many Contacts, Opportunities linked to an Account and to Contacts through a role junction, Activities attached to any record, and line items attached to an Opportunity](./img/crm-object-model.png)

The relationships are what make a CRM more than a contact list, and there are only three shapes to learn.

**One-to-many.** One organization has many people. One organization has many sales. One opportunity has many line items. In field terms, the "many" side carries a lookup field pointing back at the "one" side: each Contact record stores which Account it belongs to. This is why you cannot create the child before the parent exists, and why deleting a parent record is dangerous — the children are orphaned or deleted with it.

**Many-to-many.** A single sale usually involves several people (an economic buyer, a champion, a technical evaluator, a procurement contact), and a single person is usually involved in several sales over time. Neither side is "the one." Relational systems solve this with a **junction** — a small record that exists purely to connect the two and to carry information about the connection. In CRM this junction typically stores a **role**: *Priya Raman is the Champion on the Support Platform Renewal; Dominic Vasquez is the Procurement contact on the same deal.* Platforms name this differently — contact roles, associations with labels, related contacts — but the concept is identical, and it is the mechanism that answers "who is on this deal, and what is each of them to us?"

**Polymorphic attachment.** An activity can attach to almost anything: a call logged against a contact, a note against an account, a task against an opportunity. Most CRMs let a single activity relate to a person *and* to the sale at the same time, which is exactly what you want — the call belongs to Priya, and it moved the renewal forward.

### Reading a real deal through the model

Trace one deal end to end and the model stops being abstract.

1. A form on your website is submitted by *priya.raman@calderlogistics.com*. The system creates a **person** record. There is no sale yet — nobody has said they want to buy anything.
2. You research and call. The call is logged as an **activity** against the person. You learn Calder Logistics is a 2,000-person freight company; either you create the **organization** record or the system matches the email domain to an existing one.
3. Priya confirms there is a real project with a budget owner and a timeline. Now, and *only* now, you create the **sale** record: a name, an amount, an expected close date, and a starting stage. This is the moment the deal enters your pipeline and your forecast.
4. Over the following weeks, calls, emails, and a demo attach as **activities**. Two more people get added to the deal through the **role junction**: the VP of Operations as economic buyer, a procurement manager as the commercial contact.
5. You attach **line items** — 180 seats of the platform plus an implementation package — and the sale's Amount now derives from them rather than being typed.
6. The deal closes. The sale record moves to a closed stage, the close date is set to the day it actually closed, and the organization is flagged as a customer.

Six weeks later, someone asks: *how many deals did we win last quarter in freight, who was the champion on each, and what did we sell them?* Every part of that question is answerable — but only because each fact went into the field designed for it, rather than into a note.

## Leads: the object everyone argues about

The **lead** is the source of most confusion, because different platforms take genuinely different philosophical positions on it.

**The separate-object position.** A lead is an unqualified person who is *not yet* in your customer database proper. They live in a separate holding area with their own status field. When they qualify, you run a **conversion**, which typically creates an organization record, a person record, and optionally a sale record all at once, and marks the lead as converted. The argument for this design: your clean database of real customers and contacts does not get polluted by thousands of unvetted names from list purchases and form fills.

**The one-person-object position.** Every human is the same kind of record from first touch to lifelong customer, and their qualification state is just a **field** on that record — a lifecycle or status property that advances from subscriber to lead to qualified to customer. The argument for this design: a person is a person, there is no data migration moment, and the entire history stays on one record.

Neither is wrong. What matters operationally is that you can answer, in whatever system you are handed:

- Where do brand-new, unvetted names land?
- What field tells me whether this person has been qualified, and what are its legal values?
- What is the specific event that promotes them, and what does that event create?
- Where does an unqualified person go when they are rejected — deleted, marked disqualified, or recycled to marketing?

Get those four answers on day one at a new employer and you will not make the beginner's mistake, which is creating an opportunity for every name that arrives. **An opportunity is not a hope. It is a specific, identified potential purchase with a buyer, a rough amount, and a plausible date.** Everything before that is a lead, and inflating leads into opportunities is the fastest way to destroy the credibility of a forecast — a theme lessons 7 and 8 return to at length.

## Pipelines and stages

A **pipeline** is an ordered list of **stages** that a sale passes through. On the record it is one field. In the interface it is usually a board with a column per stage, which is why people talk about "dragging a deal to the next column" — but the board is a view of a field, nothing more.

Three properties define a stage well.

**A stage is a state of the buyer, not a task on your to-do list.** "Demo scheduled" describes something you did. "Solution validated" describes something the buyer now believes. The second is worth tracking because it predicts the outcome; the first is activity theater. The strongest formulation of a stage is one whose completion the buyer could confirm.

**Every stage needs an exit criterion.** What must be objectively true before this deal moves to the next column? Without stated criteria, every rep in the company interprets the stages differently, and the aggregate pipeline becomes meaningless. Writing those criteria is real work, and lesson 7 walks through a full stage definition table.

**Stages are ordered, and the order encodes probability.** Later stages historically convert at a higher rate than earlier ones. That historical rate is the raw material of the forecast in lesson 8. It also means skipping stages destroys information — if half your deals jump from stage two to closed-won, your stage data cannot tell anyone anything.

Alongside stage, three more fields on the sale record do the heavy lifting:

- **Amount** — the expected value. Whether this is annual, total contract value, or first-year revenue is a company convention you must learn and apply consistently; mixed conventions across a team are silently catastrophic.
- **Close date** — the date you expect the deal to *close*, not the date of the next meeting and not the end of the quarter you would like it in.
- **Probability** — usually derived automatically from the stage, sometimes editable. Treat the default numbers as a starting assumption to be calibrated, not as truth.

Most platforms also support **multiple pipelines** on the same object — new business and renewals, or two product lines with genuinely different sales processes. Use a second pipeline when the *stages* differ. Do not use one when only the product differs; that is what a field is for.

## The activity timeline

Activities are the record of what was done. They come in a small set of types — call, email, meeting, note, task — and they split into two useful groups:

- **Completed activities** are history: this call happened, this email was sent, this meeting occurred. They are the audit trail.
- **Open activities** are the future: this task is due Thursday, this meeting is on Tuesday. They are your work queue.

The distinction matters because a well-run pipeline has a simple invariant: **every open opportunity has at least one open, dated future activity on it.** An opportunity with no next step is not being worked, whatever the stage says. That single rule catches more dying deals than any dashboard.

Two mechanisms make activity capture survivable. **Email and calendar sync** connects your mailbox so that correspondence with known contacts is logged automatically rather than copy-pasted. **Click-to-call and call logging** attaches dialer activity to the record. Every platform in this course offers some version of both. Configure them on day one at any new job; the alternative is logging by hand, which nobody sustains, which is why so many CRMs contain a rich record of the first two weeks of every rep's employment and nothing after.

## The vocabulary map

Same model, different words. Keep this table where you can see it during the next three lessons.

| Concept | Salesforce | HubSpot | GoHighLevel |
| --- | --- | --- | --- |
| Unqualified person | Lead | Contact with an early lifecycle stage | Contact |
| Qualified person | Contact | Contact | Contact |
| Organization | Account | Company | (business/company fields on the contact) |
| The sale | Opportunity | Deal | Opportunity |
| Ordered stages | Sales Process / Stages on the Opportunity | Deal pipeline and deal stages | Pipeline and stages |
| Work log | Activities (Tasks and Events) | Activities on the record timeline | Conversations, tasks, appointments |
| Grouped list of people | Campaign, report, list view | List | Smart list, tag |
| Automation | Flow, process automation | Workflow, sequence | Workflow |
| Saved filtered view | List view / report | Saved view / list | Smart list |

The right column is deliberately sparser than the others. GoHighLevel comes from the small-business and agency world, and it collapses several distinctions that enterprise tools keep separate. That is a design choice, not a deficiency — and noticing *which* distinctions a tool collapses tells you what kind of selling it was built for.

## Configuration you should recognize but not fear

You will not administer a CRM as a rep, but you will constantly hit the edges of how yours was configured, and knowing the names of those edges lets you ask the right question instead of assuming the tool is broken.

- **Required fields** block a save until they are filled. If you cannot save a record, look for the field marked required rather than concluding the system is failing.
- **Validation rules** block a save when a *combination* of values is illegal — for example, closing a deal as won without a signed-contract date. When one fires, it is usually enforcing a policy somebody wrote down; read the message.
- **Picklist values** are controlled centrally. If the value you need is not there, the answer is a request to your administrator, not "Other" plus a note.
- **Record ownership** determines who a record belongs to, drives most reporting, and often drives visibility.
- **Sharing and permissions** decide what you can see and edit. Not seeing a record does not mean it does not exist — which is exactly why duplicates appear.
- **Duplicate rules** warn or block when a record that looks like an existing one is created. Where they exist, respect them; the merge cost later is far higher than the ten seconds of searching now.

The professional habit underneath all of these: **before creating any record, search for it.** Search by email domain, by phone, by company name, and by partial spelling. Most duplicate pollution in a CRM is created by people in a hurry who searched for "Calder Logistics" and not "Calder."

## Practice

Work through all four parts. Parts 1–3 need only paper or a text file; part 4 needs any CRM you can get access to, including a free tier.

**1. Draw the model from memory.** Without looking back at the diagram, sketch the five core objects and the relationships between them. Mark each relationship one-to-many or many-to-many, and mark which side carries the pointer. Then write one sentence explaining why the person-to-sale relationship needs a junction record and the organization-to-person relationship does not.

**2. Model a real deal.** Take a sale you have worked, shadowed, or read about in se101 and write out every record it would produce: one organization, the people with their roles, the sale with its amount/close date/stage, and at least six activities in chronological order. For each activity, state which record(s) it attaches to. Then answer: *at exactly which moment in this story should the sale record have been created, and why not earlier?*

**3. Build a field dictionary.** For the sale record in part 2, list ten fields you would want a rep to fill in. For each one give: field name, field type from the table above, whether it is required, and — for every picklist — the complete list of legal values. At least one field must be a Closed Lost Reason picklist. Then justify in one sentence why each picklist is not a text field.

**4. Translate the vocabulary in a live system.** Get into any CRM instance you can access. Working only from the vocabulary map, find and write down that platform's answer to each of these:

- The object that holds unqualified people, and the field that records their qualification state, including its legal values.
- The object that holds the sale, and the exact names of its stages in order.
- Where the amount, close date, and probability fields live, and whether probability is editable.
- How a second person is added to an existing sale, and whether a role can be recorded for them.
- Whether the amount is typed directly or derived from line items.
- One field on the sale record you do not recognize — then find out what it does and write a one-line definition.

Finish by writing a short paragraph naming one distinction this platform collapses that the model in this lesson keeps separate, and what that tells you about the kind of selling it was designed for.

## Check your understanding

1. Object, record, or field? "Opportunity" / "Close Date" / "Calder Logistics — Support Platform Renewal". *(Answers: object; field; record.)*
2. Why does the person-to-sale relationship need a junction record? *(Answer: it is many-to-many — one deal involves several people and one person can be on several deals — and the junction carries the role each person plays on that deal.)*
3. A rep types "lost on price, maybe timing" into a notes field. What is wrong, and what is the fix? *(Answer: free text cannot be counted or filtered; use a Closed Lost Reason picklist with defined values.)*
