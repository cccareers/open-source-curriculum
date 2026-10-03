---
lesson_id: ai102-03
course_id: ai102
pathway: prompt-engineer
title: Your First Automation in Zapier
order: 3
kind: lesson
competency_ids:
  - D2-S1-C01
  - D2-S1-C02
objectives:
  - Build a working multi-step automation in Zapier from a trigger through to a completed action
---

## The trigger-and-action model

A Zapier automation is called a **Zap**, and it has exactly one shape: a single **trigger** followed by an ordered list of **actions**. The trigger says *when* the Zap runs. Each action says *what to do*, in order, top to bottom, one at a time. There is no parallelism and no going backwards. When the last action finishes, that run of the Zap is over and everything it held in memory is discarded.

That last point deserves emphasis because it governs everything you build. A Zap has **no memory between runs**. Run 41 knows nothing about run 40. If your process needs to know what it already did — which applicants it has already contacted, how many times it has retried — that knowledge has to live in a system outside the Zap, which is why lesson 05 puts a database underneath. Treat the Zap as a pipe, not a tank.

Each time the Zap processes one item is a **run**, and Zapier's billing counts the action steps that complete successfully in it, each one a **task**. The trigger itself is free. So, at the time of writing, are Zapier's built-in logic and formatting steps (Filter, Paths, and Formatter). Every other action step that runs costs one task. Check Zapier's current task-usage help page before you budget, because what counts has changed before. A five-step Zap firing 200 times a month is roughly 800 tasks, not 200 and not 1,000. Knowing this shapes design: two Zaps of three steps each cost the same as one Zap of six steps, so split for clarity when clarity helps, and merge when it does not.

## Triggers: instant, polling, and scheduled

Three trigger types cover almost everything.

An **instant trigger** is powered by the source application pushing an event to Zapier the moment it happens. The app directory marks these; when one exists for the event you need, use it. Latency is seconds.

A **polling trigger** is Zapier asking the source app, on a schedule, whether anything new has appeared. The interval depends on your plan — commonly between 1 and 15 minutes. Polling has one behaviour that surprises people: Zapier **deduplicates** results by an id the connector chooses, so an item is processed once even though it appears in several consecutive polls. When you edit an existing record rather than creating one, many polling triggers will not notice at all, because the id has not changed. Read the trigger's description for the phrase "new" versus "new or updated"; they are different triggers and the difference is the whole behaviour.

A **scheduled trigger** fires on a clock — every hour, every weekday at 08:00 — with no source event at all. Use it for digests, sweeps, and reconciliation runs.

There is a fourth you will meet in lesson 10: a **catch hook**, where Zapier gives you a URL and anything that can send an HTTP request becomes a trigger source. Set it aside for now.

One practical rule for polling triggers: **the trigger only sees items created after the Zap is turned on** (plus a small backfill when you first test). Do not expect your new Zap to process the 400 rows already sitting in the sheet. Handle history separately, by hand or with a deliberate one-off run.

## Building the Zap: a worked example

The scenario for this lesson is a request intake. A spreadsheet collects incoming client requests, one per row. When a row appears, we want a formatted record created in a tracking table and a notification sent to a team channel. Three steps: trigger, create, notify.

**Step 1 — Choose and configure the trigger.**

Create a new Zap and pick the spreadsheet app, event **New Spreadsheet Row**. Configure it:

```text
App:        Spreadsheet
Event:      New Spreadsheet Row
Account:    ops@example.com  (a connected account)
Spreadsheet: Client Requests 2026
Worksheet:   Intake
Trigger Column: (leave blank — fire on any new row)
```

The **Trigger Column** option is worth understanding. Left blank, the Zap fires when a new row appears. Set to a column, it fires only when *that* column becomes non-empty, which lets a human control when a half-finished row is ready to process. That is a genuinely useful pattern and costs nothing.

Now click **Test trigger**. Zapier pulls a real recent row and shows it to you as a set of fields:

```json
{
  "id": "row-10453",
  "COL$A": "2026-03-04T09:12:00Z",
  "Requester Name": "Dana Okafor",
  "Requester Email": "dana@northgate.example",
  "Request Type": "Website copy",
  "Details": "Need three product descriptions for the spring range.",
  "Deadline": "2026-03-18"
}
```

Two things to check before moving on. First, **is this the shape you expected** — are all the columns present, and are dates strings or numbers? Second, **is this a representative row**? Testing against your cleanest row and then discovering that half your real data has an empty Deadline is a rite of passage worth skipping. If the sample is unrepresentative, add a deliberately messy row to the sheet and re-test.

**Step 2 — Add the action that creates the record.**

Add an action step, choose your database app, event **Create Record**. Once you select the table, Zapier fetches its fields and gives you a form. Filling that form is **field mapping**: for each destination field you choose either a static value you type, or a piece of data from an earlier step.

```text
Table:            Requests
Name:             {{1. Requester Name}}
Email:            {{1. Requester Email}}
Type:             {{1. Request Type}}
Description:      {{1. Details}}
Due:              {{1. Deadline}}
Source:           Web intake form          <- static
Status:           New                      <- static
Source Row Id:    {{1. Id}}
```

The `{{1. Field}}` notation is how mapped data appears; in the editor you pick it from a dropdown rather than typing it. The leading number is the step it came from, which is why steps are numbered and why reordering steps later is more disruptive than it looks.

Note `Source Row Id`. Carrying the source system's identifier into the destination record costs you nothing now and saves you twice later: it lets you trace a record back to where it came from, and it gives you something to search on so a second run does not create a duplicate. Make it a habit.

Test the step. Zapier will actually create a record — this is not a simulation — so expect real rows in your table during development and plan to clean them up. The test result shows the created record including the id the destination assigned:

```json
{
  "id": "recPQ81mZ0",
  "createdTime": "2026-03-04T09:13:41Z",
  "fields": {
    "Name": "Dana Okafor",
    "Status": "New",
    "Source Row Id": "row-10453"
  }
}
```

**Step 3 — Add the notification action.**

Add a second action: your chat app, event **Send Channel Message**.

```text
Channel:  #client-requests
Message:  New *{{1. Request Type}}* request from {{1. Requester Name}}
          Due {{1. Deadline}}
          {{1. Details}}
          Record: {{2. Id}}
Send as bot: yes
```

This step maps from **two** earlier steps — the trigger for the human-readable content, and step 2 for the record id that only exists after the record was created. That is the ordinary case in a multi-step Zap and the reason order matters: a step can only reference data from steps above it.

Test it, look at the actual message in the actual channel, and fix the formatting. Reading the rendered output rather than the test JSON catches a surprising number of defects — a date rendered as `1741079520` rather than `18 March`, a trailing comma from an empty field, a mention that did not resolve.

**Step 4 — Name it, and turn it on.**

Rename the Zap from its auto-generated title to something a colleague can read in a list of sixty: `Intake sheet -> Requests table + channel notice`. Then publish. From this moment it runs unattended, and every row anyone adds to that sheet costs you tasks.

## Field mapping in practice

Mapping is where beginners lose the most time, so a few specifics.

**Data comes out of connectors as strings more often than you expect.** A date picked up from a spreadsheet is usually a string in whatever format the sheet displayed it. A number may arrive as `"1,240"` with a thousands separator. A checkbox may arrive as `TRUE`, `true`, `Yes`, or `1` depending on the connector. The destination field may reject any of these. When a create step fails with a validation error, the cause is almost always a type mismatch of this kind, not a broken connector.

**The Formatter step is how you fix that.** Zapier's built-in Formatter is an action like any other, though at the time of writing it does not count towards your task usage. Its utilities are grouped by type:

```text
Formatter -> Date / Time -> Format
  Input:      {{1. Deadline}}
  To Format:  YYYY-MM-DD
  From Format: automatic
  To Timezone: Europe/London

Formatter -> Text -> Trim / Titlecase / Truncate / Split
Formatter -> Numbers -> Format Number / Spreadsheet-Style Formula
Formatter -> Utilities -> Lookup Table / Line-item to Text / Pick from List
```

The **Lookup Table** utility deserves a specific mention: it maps one value to another from a list you type in, which is how you translate a source system's vocabulary into a destination's without any branching logic at all.

```text
Formatter -> Utilities -> Lookup Table
  Lookup Key:  {{1. Request Type}}
  Table:
    Website copy      => COPY
    Product photos    => MEDIA
    Social calendar   => SOCIAL
  Fallback:    OTHER
```

Always set a fallback. A lookup with no fallback returns empty for anything unlisted, and empty flows silently into the next step.

**Empty values are the most common production surprise.** In the test row every field was filled. In production, `Deadline` will be blank, and a Formatter date step given an empty input will error and halt the run. When a field is genuinely optional, either give the mapping a default (Zapier's mapping field accepts typed text alongside a mapped token, so `{{1. Deadline}}` can become `{{1. Deadline}} (not specified)` — crude but visible), or handle the condition explicitly, which is lesson 07's subject.

**Line items** are Zapier's representation of a repeating group — the three attachments on an email, the five products in an order. They arrive as parallel arrays and behave differently from ordinary fields: some actions will run once per line item automatically, and others will flatten them into a comma-separated string. Know which one you have before designing around it, and test with two items rather than one, because a single-item list hides every bug.

## Reading the Zap history

Once a Zap is live, **Zap History** is your entire window into what happened. Learn it before you need it.

Each entry is one run, with a status: **Success**, **Stopped** (a condition prevented later steps — normal), **Held**, **Delayed**, or **Error**. Open a run and you see every step with its exact input data and output data. This is the single most useful debugging surface in the product, because almost every defect is visible as a difference between what you thought a step received and what it actually received.

Three habits pay off immediately:

- When something is wrong, **read the failing step's input, not its output**. The error message describes the symptom; the input describes the cause.
- Use the **Replay** option on a failed run once you have fixed the configuration, rather than manufacturing a new trigger event. It re-runs with the original data, which is exactly the case you need to prove fixed.
- Watch the run count in the first few days. A Zap that fires far more often than expected is usually a trigger that fires on update as well as create, and it is burning tasks the entire time.

## Editing a Zap that is already live

The first Zap you build is edited in peace. Every one after that is edited while it is running, and the editor behaves in ways that catch people out.

**Editing a published Zap creates a draft.** Your changes are not live until you publish them, which is a genuine safety net — you can leave a half-finished change overnight without breaking production. It is also a trap, because the running version is still the old one, and "I fixed that" followed by "it is still doing the wrong thing" is almost always an unpublished draft.

**Testing a step in the editor executes it for real.** There is no simulation mode. Testing a "send message" step sends a message; testing a "create record" step creates a record; testing a "delete" step is a decision you make once. While developing, point destructive or noisy steps at a test channel and a test table, and switch them over only when the logic is settled.

**Inserting a step renumbers everything below it.** Mappings usually follow the move, but not always, and the failure is silent: a field that pointed at step 3 now points at a step that holds different data, and the record fills with plausible nonsense. After inserting or reordering, re-test the whole Zap rather than only the new step, and read the *values* in the test output rather than checking that each step went green.

**Turning a Zap off does not clear its queue,** and turning it back on may process what accumulated. When you disable a Zap because it is misbehaving, decide deliberately whether the backlog should run when you re-enable it, and where the source system allows it, clear or mark the pending items first.

Three habits keep a growing collection manageable. **Duplicate before experimenting** — copy the Zap, prefix it `[TEST]`, and break the copy. **Use the version history** where your plan provides it, so "restore what worked yesterday" is a click rather than an archaeology exercise. And **write the Zap's purpose into its description field**, because a list of forty Zaps named after their trigger app tells nobody anything, and the person reading that list in a year may be you.

## Duplicates, and how to not create them

The failure that costs the most trust is the duplicate — three identical records, three identical notifications. Four things cause it, and each has a specific fix.

**The trigger re-fires on the same item.** Usually because the source row is edited after creation and the trigger is a "new or updated" variant. Fix by switching triggers, or by using a Trigger Column so only a deliberate change fires it.

**The Zap is turned on twice**, or an old copy is still live after you duplicated it to experiment. Fix by keeping a naming convention and checking your Zap list; `[TEST]` in the name of every experimental copy is worth the keystrokes.

**A replay re-runs a step that already succeeded.** Replays restart the whole run, so a create step that worked the first time runs again. Fix by making creates conditional on a lookup, below.

**The destination has no uniqueness constraint**, which is the underlying reason all three of the above are visible at all. The general fix is the **find-or-create pattern**: before creating, use a *search* action on a stable key, and use the destination app's "create if it does not exist" option where the connector offers one.

```text
Step 2: Database -> Find Record
  Search Field: Source Row Id
  Search Value: {{1. Id}}
  Create record if none found: yes
    Name:           {{1. Requester Name}}
    Source Row Id:  {{1. Id}}
```

This single option replaces a great deal of defensive logic and makes your Zap **idempotent** — safe to run twice on the same input. Idempotency is the property that separates an automation you can operate from one you have to babysit, and you will meet it again in every remaining lesson of this course.

## Practice

Build these for real in a free workspace. You need a spreadsheet, a no-code database or a second sheet, and a chat or email destination.

1. **Build the three-step Zap from this lesson end to end.** Trigger on a new row, create a record carrying the source row id, and post a readable notification containing the created record's id. Turn it on, add three rows by hand, and confirm three records and three messages. Paste the Zap History summary showing three successful runs.

2. **Make the sample data honest.** Before you finish exercise 1, add one row with an empty optional field, one with a name containing an apostrophe, and one with a date typed in a different format from the others. Re-test the trigger against each. Record what each step received and which step, if any, failed.

3. **Add a Formatter step with a lookup table.** Translate the free-text `Request Type` into a short code with at least three mappings and an explicit fallback. Map the code into a new field on the record. Then add a row with an unlisted type and show that the fallback landed rather than an empty field.

4. **Force a duplicate, then eliminate it.** With your Zap running, edit an existing row's contents and observe whether a second record appears. Then replay a successful run from history and observe again. Convert the create step to a find-or-create keyed on the source row id, repeat both experiments, and show from history that no duplicate is produced either way.

5. **Count the cost.** From your Zap History, count the action steps that executed across your ten test runs. State the tasks consumed per run, project the monthly cost at 40, 400, and 4,000 rows per month, and identify which single step you would remove first if you had to halve it.

6. **Write the handover note.** In under 200 words, describe for a colleague: what the Zap does, what turns it on, what data it writes, what happens if the deadline field is empty, and the first two places to look when someone says "it did not run." Then have someone else read it and tell you which of their questions it did not answer.

## Check your understanding

1. Your Zap has a trigger, a Formatter step, a Create Record step, and a Send Channel Message step, and it runs 300 times a month. Roughly how many tasks is that, and what should you check before quoting it? *Answer: about 600 (two counted action steps x 300), because the trigger is free and Formatter currently does not count. Check Zapier's current task-usage page, because what counts has changed before.*
2. You edited a live Zap, tested it, and it still behaves the old way in production. What is the most likely cause? *Answer: the edit is an unpublished draft. The running version is still the old one until you publish.*
3. Why does carrying `Source Row Id` into the destination record matter for duplicates? *Answer: it gives you a stable key for find-or-create, so a re-fired trigger or a replay finds the existing record instead of creating another. That makes the Zap idempotent.*
