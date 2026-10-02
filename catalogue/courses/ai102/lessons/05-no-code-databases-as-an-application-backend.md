---
lesson_id: ai102-05
course_id: ai102
pathway: prompt-engineer
title: No-Code Databases as an Application Backend
order: 5
kind: lesson
competency_ids:
  - D2-S1-C01
objectives:
  - Model records, fields, relations, and views in a no-code database so it can serve as an application backend
---

## From spreadsheet to backend

A no-code database looks like a spreadsheet and behaves like a database, and the gap between those two statements is the entire lesson.

In a spreadsheet, a cell holds whatever you type. A column is a column because the cells beneath each other happen to be similar. Meaning lives in your head and in the header row, and nothing stops row 402 from putting a phone number in the date column. That is fine for analysis by one person and fatal for a system where an automation reads the data at three in the morning.

In a no-code database, a **table** holds **records**, each record has the same **fields**, and each field has a **type** that the platform enforces. A date field holds a date, not the text "next Tuesday." A link field holds a pointer to a record in another table, not a name someone typed twice with different spelling. The database also gives you the two things a spreadsheet cannot: **relations**, so a fact is stored once and referenced everywhere, and an **API**, so other tools can read and write it reliably.

That combination is what makes it a **backend**. Your automation from the previous two lessons was a pipe; this is the tank. It is where you record what has already been processed, where the interface in the next lesson will read and write, and where a human can look when they want to know the current state of anything. When people say a no-code build is "a real system" rather than a demo, this layer is usually what they mean.

Be clear about what it is not. These platforms are not designed for millions of records, complex multi-table transactions, sub-millisecond queries, or heavy concurrent writes. Base size limits, per-table record caps, and API rate limits are real and published; check them against your projected volume during design, not after launch.

## Records, fields, and types

A **record** is one thing: one request, one client, one invoice. Getting the "one thing" right is the first design decision and the one that is expensive to change later. The test is whether you can describe the table's contents with a singular noun and a definite scope. "One row per client request" is a table. "Stuff about clients" is not.

Every table has a **primary field** — the first column, used as the record's label wherever it is referenced from elsewhere. It should be a short, human-readable, reasonably unique identifier: a request title, a client name, an order number. Resist the urge to leave it as "Name" holding nothing useful, because that string is what every linked record chip in every other table will display, and a table of records labelled "Untitled" is unusable.

The field types you will use most:

**Single line text** for short strings. **Long text** for anything with paragraphs — notes, descriptions, model output. **Number** with a specified precision, and **Currency** or **Percent** where the display matters. **Date** and **Date with time**, with an explicit time zone decision. **Single select** for a fixed vocabulary, and this is the type people under-use: statuses, types, and categories belong here, not in free text, because a select is what makes filtering, grouping, and automation conditions reliable. **Multiple select** where more than one applies. **Checkbox** for a genuine boolean. **Email**, **URL**, and **Phone** for their formats and the click-through behaviour they give you free. **Attachment** for files. **User** for a person in your workspace, which is what makes "assigned to me" filters possible. **Created time**, **Last modified time**, and **Created by** as automatic audit fields. And **Link to another record**, which is the whole next section.

Three type decisions that cause trouble when made carelessly:

**Free text where a select belongs.** The moment a human can type the status, you will have `Done`, `done`, `DONE`, and `Complete`, and every downstream filter is wrong. Use a select and make adding a new option a deliberate act.

**A date without a time-zone decision.** A date field that means "the day this is due" behaves differently from one that means "the instant this happened." Decide which, and if it is an instant, be consistent about the zone across the whole base and the automations that write to it.

**Storing a number as text.** Usually happens because an import brought in `"1,240"`. Fix the import, not the downstream arithmetic.

## Relations: link, lookup, rollup

A **link to another record** field creates a relationship between two tables, and the platform maintains it in both directions: linking a Request to a Client automatically gives the Client a field listing its Requests. The link stores a pointer, not a copy — rename the client once and every reference updates.

This is the single feature that separates a database from a sheet, and the rule for using it is simple: **if a fact belongs to a thing, store it on that thing and link to it.** A client's email address belongs to the client. Putting it on every request means twenty copies to update when it changes and nineteen chances to miss one.

Three relationship shapes cover almost everything:

**One-to-many.** One Client has many Requests; each Request has exactly one Client. Create the link field on the many side (Requests) and limit it to a single record. This is the most common shape by a wide margin.

**Many-to-many.** A Request may involve several Staff, and a Staff member works on several Requests. A single link field allowing multiple records handles it, and the reverse field appears automatically on the other table.

**Many-to-many carrying its own data.** The moment the relationship itself has attributes — hours worked, role on the project, date assigned — you need a third table, sometimes called a join table. Records in it represent the relationship: one Assignment record links to one Request and one Staff member and carries `Hours` and `Role`. Recognising this case is the mark of someone who has modelled data before. The symptom that you needed it is a multi-select link field with a parallel comma-separated text field trying to hold the extra detail.

Once records are linked, two derived field types bring data across the link.

A **lookup** field displays a field from the linked record. On Requests, a lookup of `Client Email` through the Client link shows the client's email without duplicating it. It is read-only and always current.

A **rollup** field aggregates a field across *all* linked records. On Clients, a rollup over the Requests link with `COUNT()` gives requests per client; with `SUM(values)` over an Hours field it gives total hours. Rollups are how you get summary numbers without writing any query.

A **formula** field computes from other fields in the same record:

```text
Days Until Due    = DATETIME_DIFF({Due}, TODAY(), 'days')
Is Overdue        = AND({Due} < TODAY(), {Status} != "Complete")
Display Label     = {Request Type} & " — " & {Client Name} & " (" & {Status} & ")"
Age Bucket        = IF({Days Until Due} < 0, "Overdue",
                    IF({Days Until Due} <= 2, "Urgent", "Normal"))
```

Formula, lookup, and rollup fields are computed on read. They cost you nothing to store, they are always consistent, and — importantly for the next lessons — they are generally **read-only to the API**. An automation cannot write to a formula field. If an automation needs to set a value, that value needs to be a real field.

## Designing a schema: a worked example

Take a small internal system: a team receives content requests from clients, assigns them to staff, and records the AI-assisted drafts produced for each. Four tables.

```text
Clients
  Name              single line text   [primary]
  Email             email
  Account Manager   user
  Tier              single select      (Standard | Priority)
  Requests          link -> Requests   [auto reverse]
  Open Requests     rollup             COUNT over Requests where Status != Complete

Requests
  Request Ref       single line text   [primary]  e.g. REQ-2026-0184
  Client            link -> Clients    (single)
  Client Email      lookup             via Client
  Type              single select      (Website copy | Product photos | Social calendar)
  Details           long text
  Due               date
  Status            single select      (New | In progress | In review | Complete | Cancelled)
  Source Row Id     single line text   [external key, unique in practice]
  Created           created time
  Assignments       link -> Assignments
  Drafts            link -> Drafts
  Days Until Due    formula
  Is Overdue        formula

Assignments
  Label             formula            [primary]  {Request Ref} & " / " & {Staff Name}
  Request           link -> Requests   (single)
  Staff             link -> Staff      (single)
  Role              single select      (Lead | Reviewer)
  Hours             number             precision 1

Drafts
  Draft Ref         single line text   [primary]
  Request           link -> Requests   (single)
  Body              long text
  Model Used        single line text
  Generated At      date with time
  Review Status     single select      (Unreviewed | Approved | Rejected)
  Reviewer Notes    long text
```

Read the shape of it. `Assignments` exists because the Request-to-Staff relationship carries `Role` and `Hours`. `Drafts` is a separate table rather than a long-text field on Requests because there can be several drafts per request and each has its own metadata — the moment "there could be more than one" is true, it is a table. `Client Email` is a lookup rather than a copied field. `Source Row Id` exists so an automation can find the record that corresponds to an external event, which is the find-or-create pattern from lesson 03 given a home.

Three design rules generalise from this.

**Every table an automation writes into needs a stable external key.** Without one, the automation cannot tell "create this" from "update that," and duplicates follow. It does not have to be pretty; it has to be stable and unique.

**Denormalise deliberately or not at all.** Copying a value into a second place is occasionally justified — a snapshot of a price at order time genuinely should not change when the price does. Write down why, next to the field. Accidental duplication is a defect; deliberate snapshotting is a design.

**Do not put a workflow in a status field it cannot express.** If your process has two independent dimensions — say, delivery status and payment status — those are two fields, not one select with nine combined options.

## Views

A **view** is a saved configuration of filters, sorts, groupings, visible fields, and row height over one table. The records are the same; the presentation is not. Views are free, non-destructive, and the main way people actually use a base day to day.

The types worth knowing: **grid** (the default spreadsheet-like view), **kanban** (records as cards in columns grouped by a select field — the natural view of a status field), **calendar** (records placed on a date field), **gallery** (cards, useful when attachments matter), and **timeline or Gantt-style** views where the platform provides them.

Two things make views matter more than they first appear.

**Views are the permission surface.** A shared view link exposes exactly the filtered records and visible fields of that view, and nothing else. Sharing a view of open requests with a contractor is safe in a way that sharing the base is not. Personal views, where the platform supports them, let one person filter without disturbing everyone else's screen.

**Views are the query interface for other tools.** Both the interface builder in the next lesson and the automation platforms from lessons 03 and 04 can be pointed at a *view* rather than a table. "Trigger when a record enters this view" is one of the most useful triggers in no-code, because it turns a filter into an event: define a view of `Status = New AND Client Tier = Priority`, and an automation on that view fires exactly for the records you care about, with the condition maintained in the database rather than duplicated in every automation that needs it.

A naming convention pays for itself here. Prefix views by purpose: `[AUTO] New priority requests` for anything an automation depends on, `[UI] Reviewer queue` for anything an interface reads, and plain names for human working views. Then nobody deletes an `[AUTO]` view while tidying up, which is a genuinely common outage.

## Getting existing data in

Almost every real backend starts with data that already exists in a spreadsheet, and the import is where a clean schema meets a decade of human typing. Doing it carelessly produces a database with the shape of a database and the contents of a spreadsheet.

Import in a deliberate order, because relations depend on it. **Load the referenced tables first** — Clients before Requests, Staff before Assignments — so that the link fields have something to point at. Most platforms will create a linked record on the fly when they see an unrecognised name, which sounds convenient and is the main source of the problem below.

**Import into text fields first, then convert.** Bringing a messy column straight into a date or number field either fails or silently drops values. Land it as text, look at what actually arrived, clean it, and change the field type afterwards.

**Expect the link field to create duplicates.** If the source spreadsheet spells a client "Northgate", "Northgate Ltd", and "northgate ", a link field will happily create three client records. Before importing, deduplicate the reference column in the source — group by the name, eyeball the list, and standardise. Ten minutes there prevents an afternoon of merging records that already have children attached.

**Decide what the external key is before the first row lands.** If the source has an id column, map it into your key field. If it does not, generate one during the import — a row number, or a concatenation of two stable columns — because retrofitting a key onto records an automation has already touched is far harder than setting it now.

After the import, run four checks. **Count the rows** in source and destination and account for any difference. **Sort each typed field** ascending and descending and look at the extremes, which is where the bad values sit. **Filter to empty** on every field that should be required. And **check the reference tables** for near-duplicates the link field invented.

The same discipline applies to the ongoing case, where an automation rather than a person is writing. A record created by a workflow with an unmatched link value will create a new parent record just as an import does, so a workflow that writes into a linked field should search for the parent first and dead-letter the case where it does not exist, rather than quietly inventing a client.

## Operating limits and access

Before you commit a design, check four numbers against the platform's current published limits: **records per table**, **total base size including attachments**, **API requests per second**, and **automation runs per month** if you use the built-in ones. All four are plan-dependent and all four are real.

Two of them shape design directly. Attachment storage fills faster than anybody expects, so store large files where files belong and keep a URL in the record. And API rate limits — commonly single-digit requests per second per base — mean a workflow that loops over 500 records with one API call each will be throttled. Batch where the API supports it, and prefer a single filtered query over fetching everything and filtering in the workflow.

On access: give collaborators the least role that lets them do their job, use view sharing rather than base sharing for anyone outside the team, and keep in mind that a personal access token or connection created by one person inherits that person's permissions — a fact that becomes lesson 11's problem the day they leave.

## Practice

Build this in a real no-code database. A free plan is sufficient.

1. **Model the four-table schema from this lesson.** Create Clients, Requests, Assignments, Drafts with the exact field types listed, including the lookup, both formulas, and the rollup. Populate at least 4 clients, 12 requests spread across statuses and due dates, 8 assignments, and 6 drafts.

2. **Justify the join table.** Write two sentences explaining why Assignments exists as a table. Then prove it: try to record that one staff member is Lead on a request at 6 hours and another is Reviewer at 1.5 hours, using only a multi-select link field on Requests. Describe precisely what breaks.

3. **Add a computed layer.** Add a rollup on Clients giving total hours across all assignments on all their requests (you will need to think about the path). Add a formula on Requests producing a one-line label suitable for a chat notification. Add a formula that flags a request as at risk when it is due within three days and not yet in review.

4. **Build four views and name them by convention.** A kanban by Status; a calendar by Due; a grid filtered to `Is Overdue` sorted by Due ascending; and an `[AUTO]`-prefixed view containing only new requests from Priority-tier clients. Share the overdue view as a link and confirm from a private browser window that it exposes only the filtered records and visible fields.

5. **Wire it to lesson 03 or 04.** Point the automation you built earlier at this base: it should find-or-create a Request keyed on `Source Row Id`. Add two rows to the source sheet, one of them a repeat of an existing id, and show from the run history and the table that you have exactly one record per id.

6. **Break it on purpose, then defend it.** Try to have your automation write a value into a formula field and record the error. Then type free text into a field you should have made a select, and write down which of your four views and which automation condition it silently broke. Fix both, and note in one sentence the rule you would give a colleague to prevent each.

7. **Check the limits.** Look up your platform's current record, storage, and API rate limits for the plan you are on, with URLs and the date checked. State the record count at which this schema would need rethinking and which table hits its limit first.
