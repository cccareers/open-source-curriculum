---
lesson_id: ai102-06
course_id: ai102
pathway: prompt-engineer
title: Building an Interface on a No-Code Database
order: 6
kind: lesson
competency_ids:
  - D2-S1-C01
objectives:
  - Assemble a working interface on top of a no-code database for a defined user task
---

## Why the raw database is not the interface

You now have a base with four tables, relations, formulas, and views. It is completely usable — by you. Hand it to a client, a field technician, or a reviewer who joined last week, and three things go wrong immediately. They see every field, including the ones that are internal, half-finished, or confusing. They can edit anything, including the fields your automations depend on. And they have to work out, from a grid of thirty columns, which two of them they were supposed to fill in.

An interface fixes all three by inverting the design question. A database is organised around **what the data is**. An interface is organised around **what one person is trying to do**. Those produce different layouts, and the second one is what makes a no-code build usable by people who did not construct it.

The tools for this fall in the third class from lesson 02: interface builders. Two flavours are worth distinguishing. Most no-code databases now include a **built-in interface designer** that reads directly from the base — fastest to build, tightly integrated, but usually limited to people you can invite into the workspace. A **standalone no-code app builder** such as Softr sits on top of the database through its API and is aimed at external users: public pages, self-registration, membership tiers, custom domains. Choose the built-in designer for internal tools and a standalone builder when the audience is outside your workspace or the branding matters. The design method below is identical for both.

Whichever you use, the architecture is unchanged from the previous lesson: **the database remains the single source of truth, and the interface is a view onto it.** No data lives in the interface. If a value is on a screen, it is in a record.

## Start from the user task, not the schema

Before opening any builder, write the task down in one sentence of this form:

> *[Role]* needs to *[verb]* *[object]* so that *[outcome]*, and they will do it *[when and where]*.

For the intake system from the previous lesson:

> A **reviewer** needs to **read the AI-generated draft and approve or reject it** so that **approved copy can be sent to the client**, and they will do it **several times a day, at a desk, between other work**.

That sentence answers design questions you would otherwise guess at. "Several times a day between other work" means the screen must show a queue and let them get through it fast — no navigation to find the next item. "Approve or reject" means two prominent actions and a place for a rejection reason. "At a desk" means the layout can be wide; had it said "on a phone in a van," almost every decision would change.

Now derive three lists from the sentence, in this order. **What must the user see** to make the decision — for a reviewer, the draft body, the original request details, the client, and the due date, and nothing else. **What must the user do** — approve, reject with a note, and hand back to the writer. **What must the user never touch** — the source row id, the model name, the created timestamps, anything an automation writes.

That third list is the one people skip and the one that prevents the most damage. Anything an automation depends on should be invisible or read-only in the interface. A reviewer who helpfully tidies the `Source Row Id` field breaks your idempotency and nobody will connect the two events.

## The three page patterns

Nearly every internal tool is built from three page patterns, combined.

**The list-and-detail page.** A filtered list of records on one side, the selected record's detail on the other. This is the workhorse: a queue, an inbox, a caseload. The list is bound to a view — this is where the `[UI]`-prefixed views from the previous lesson earn their keep — and the detail pane shows chosen fields plus action buttons.

**The form page.** A set of input fields that creates a new record, or updates one. Forms are how data gets in from people who should not see the table at all. Field order, required flags, help text, and default values are all part of the design; a form that asks for information in the order the *database* wants it rather than the order the *person* has it is a form people abandon.

**The dashboard page.** Numbers and charts over a set of records: how many open, how many overdue, throughput this week, split by type. Dashboards answer "how are we doing," not "what should I do next," and mixing the two produces a page that serves neither.

A fourth pattern, the **record detail page reached by link**, matters when you want an automation to notify someone with a URL that opens exactly one record. Most builders give each record page a URL that accepts a record identifier; capturing that pattern lets your chat notification from lesson 03 link straight to the item.

## Building the reviewer queue

Concretely, in a built-in interface designer, over the base from the previous lesson.

**Step 1 — Prepare the view the page will read.** In the Drafts table, create a view named `[UI] Review queue`, filtered to `Review Status = Unreviewed`, sorted by the linked request's due date ascending, with only the relevant fields visible. Doing the filtering in the view rather than the page means one place to change it and one place to check it.

**Step 2 — Create a list-and-detail page bound to that view.**

```text
Page: Review queue
  Data source:   Drafts / [UI] Review queue
  Layout:        List with side detail

  List item shows:
    Primary:   Draft Ref
    Secondary: {Request > Client} — {Request > Type}
    Badge:     {Request > Days Until Due}

  Detail pane fields:
    Body               long text        read-only
    Request Details    lookup           read-only
    Client             lookup           read-only
    Due                lookup           read-only
    Model Used         hidden
    Review Status      single select    editable
    Reviewer Notes     long text        editable
```

Every field is explicitly marked read-only, editable, or hidden. Do this deliberately for every field on every page. The default in most builders is editable, and the default is wrong for most fields.

**Step 3 — Add the actions.** Interface builders expose buttons that either write a value to a field, run an automation, or open another page. Two buttons:

```text
Button: Approve
  Action:   Update record
  Set:      Review Status = "Approved"
  Then:     Go to next record in list

Button: Request changes
  Action:   Open form  ->  collects Reviewer Notes (required)
  Then:     Update record  Review Status = "Rejected"
```

Note that "Request changes" collects the note *before* setting the status, and makes it required. A rejection without a reason is a support ticket for the writer. Sequencing a required input ahead of the state change is a small design act that removes a whole category of follow-up messages.

**Step 4 — Filter by the logged-in user where it applies.** Most builders expose the current user as a variable you can use in a page filter, typically written as a condition like `Assigned To is current user`. This is how one page serves twenty people, each seeing their own work. For a shared review queue you may not want it; for a "my assignments" page it is the entire feature. Test it by logging in as a second user, not by trusting the preview.

**Step 5 — Add the submission form for the other role.** A separate page: a form on the Requests table collecting Client, Type, Details, and Due, with `Status` defaulted to `New` and hidden, and `Source Row Id` hidden entirely. Add help text under Details — one sentence saying what a good request contains — because a form is the cheapest place in the whole system to improve data quality.

**Step 6 — Add a small dashboard.** Three numbers and one chart: unreviewed drafts, overdue requests, drafts approved this week, and a bar chart of requests by type. Put it on its own page. Resist adding a fourth number because it is easy; a dashboard is judged on whether a manager can read it in ten seconds.

## Buttons that start work, not just set fields

An interface that only reads and writes records is a form. The thing that makes it feel like an application is a button that *does something* — sends the approved copy to the client, generates a new draft, notifies the account manager, creates a follow-up request. That is the point where the interface layer meets the automation layer, and there are three ways to wire it.

**Set a field, and let an automation watch for it.** The simplest and most robust. The button writes `Review Status = Approved`; a workflow triggered on a view of newly-approved drafts picks it up within its polling interval and does the work. The interface knows nothing about the automation, which means either can be rebuilt without touching the other. The cost is latency — the user clicks and nothing visibly happens for a minute.

**Call the automation directly.** Most builders can invoke an automation, and most automation platforms can be triggered by the webhook URL from lesson 10. Latency drops to seconds and the user gets feedback. The cost is coupling: the button now depends on a specific workflow existing at a specific URL, and moving or rebuilding that workflow breaks the page.

**Do the work in the interface's own automation feature** where the platform has one. Fine for a single small action — send one email, update one linked record — and a trap for anything larger, because the logic now lives in a third place that your run history does not cover.

Prefer the first for anything asynchronous and the second when the user is waiting. Whichever you pick, three details decide whether it feels finished.

**Confirm before anything irreversible.** A button that emails a client should ask once, showing what will be sent and to whom. A button that changes a status can act immediately.

**Show the state, not just the click.** After the button fires, the record should visibly change — a status chip, a timestamp, a "sent at" field the page displays. Without it the user cannot tell success from a mis-click, and the standard user response to uncertainty is to press the button again.

**Make the double-click harmless.** They will press it again. This is the idempotency problem from the automation side arriving at the interface: the underlying action needs a guard, either a condition that the field has not already been set or the find-or-create pattern downstream. An interface button is one of the most common sources of duplicate work in a no-code build, precisely because a slow response invites a second press.

## Permissions, roles, and the audience question

Every interface builder has some model of who can see what, and the models differ enough that you must check yours rather than assume.

The layers are usually: **who can open the interface at all** (workspace members, invited users, anyone with the link, or authenticated members of a list); **which pages a given group can see**; **which records within a page they can see** (filtered by a field matching the logged-in user, or by a group or role field); and **which fields they can edit**. Configure all four, in that order, and test each by actually signing in as a user in each role.

Two mistakes recur.

**Confusing "hidden" with "not permitted."** A field hidden on a page is often still readable through the underlying data source by a user who has base access. If a field is genuinely sensitive, it must be protected by the data-source permission, not by the page layout. When in doubt, put sensitive fields in a separate table that the interface's users cannot reach at all.

**Giving external people workspace seats.** Built-in interface designers usually require the viewer to be a collaborator, which is both a cost and a permission surface. When your audience is clients or the public, that is the signal to move to a standalone app builder with its own membership model, where users authenticate against a Users table rather than against your workspace.

For a standalone builder, the wiring is worth knowing in outline: you connect it to the database with an API credential, it reads tables and views through that connection, and it maps a signed-in user to a record in a Users table. Page-level and record-level rules are then expressed in terms of that record. The credential it holds is powerful — it can usually read everything the token's permissions allow — which is a lesson 11 problem you should already be anticipating.

## Making it survive contact with users

Four things separate an interface people use from one they route around.

**Empty states.** The first time anyone opens your review queue there will be nothing in it, and a blank panel reads as broken. Most builders let you set an empty-state message; write one that says what will appear here and what to do meanwhile.

**Loading and latency.** An interface reading a large view through an API is slower than the grid you built it from. Reduce fields, filter harder in the view, and avoid pages that load an entire table to display a count — use a rollup field computed in the database instead.

**Labels in the user's language, not the schema's.** Your field is called `Source Row Id` and your user should never see those words. Every builder lets you relabel a field on a page; use it. The same goes for select option names: `WIP` means nothing to a client.

**A path for the exception.** Every process has cases the form cannot express. Give the user somewhere to put them — a free-text "anything else" field, or a visible contact route — because the alternative is that they put the exception into whichever field looks closest and corrupt your data instead.

Then test the way users will use it. Open the interface in a private browser window, signed in as a real test user with a real role, on the device the sentence at the start said they would use. Every interface bug worth finding is invisible from the builder's preview mode.

## Practice

Build on the base from the previous lesson.

1. **Write three task sentences.** One for the reviewer, one for the person submitting a request, and one for the manager. Each in the `[Role] needs to [verb] [object] so that [outcome], and they will do it [when and where]` form. Then, for each, list what they must see, what they must do, and what they must never touch.

2. **Build the reviewer queue.** A list-and-detail page bound to a `[UI]`-prefixed view, with every field explicitly set read-only, editable, or hidden, and the two action buttons including a required rejection note. Process three drafts through it end to end and show the resulting records.

3. **Build the submission form.** Collect only what the submitter can know, with defaults and hidden fields for everything else, help text on at least one field, and validation on the date. Submit two requests through it and confirm they appear in the reviewer's upstream flow with the right status.

4. **Build the dashboard.** Three metrics and one chart, sourced from database rollups and formulas rather than computed in the page. Time how long it takes a colleague to answer "are we behind this week?" from it. If it is over ten seconds, cut something.

5. **Prove the permissions.** Create two test users in different roles. Sign in as each in a private window and record, in a small table, which pages each could open, which records each could see, and which fields each could edit. Then attempt to reach a field you marked hidden through any other route the user has, and report whether hiding it was actually protection.

6. **Break the read-only rule and observe.** Temporarily make `Source Row Id` editable on the reviewer page, change it as the test user, then run the automation from lesson 03 or 04 again with the original source event. Describe exactly what happened and why. Restore the field to hidden and write the one-sentence rule you would put in the handover document.

7. **Fix the four survival details.** Add an empty state to the queue, relabel every schema-flavoured field name for the user's vocabulary, reduce the fields loaded by the queue view and note any speed difference, and add an exception route. List what you changed and which user confusion each change prevents.
