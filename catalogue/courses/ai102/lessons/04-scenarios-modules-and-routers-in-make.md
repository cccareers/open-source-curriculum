---
lesson_id: ai102-04
course_id: ai102
pathway: prompt-engineer
title: Scenarios, Modules, and Routers in Make
order: 4
kind: lesson
competency_ids:
  - D2-S1-C01
  - D2-S1-C02
objectives:
  - Build the same class of automation in Make using scenarios, modules, and routers, and explain the trade-offs against Zapier
---

## A different mental model for the same job

Make solves the same problem as the platform in the previous lesson — an event happens, data moves, something else happens — but it asks you to think about it differently, and the difference is worth understanding before you drag a single module onto the canvas.

The previous lesson's model is a **list**: a trigger at the top, actions stacked beneath it, executed in order. Make's model is a **graph on a canvas**. You place circular **modules** and draw connections between them, and the shape of the automation is visible at a glance. That is not decoration. Because the structure is a graph rather than a list, Make can express things a list cannot without contortion: two branches running from one point, a stream of items flowing through several modules one at a time, a collection of results gathered back together.

The vocabulary maps roughly like this, and you should hold the mapping loosely because the concepts are not identical:

| Concept | Make | Previous lesson |
| --- | --- | --- |
| The whole automation | Scenario | Zap |
| One configured step | Module | Trigger or action step |
| The unit of data flowing through | Bundle | The step's output |
| Choosing between paths | Router with filters | Paths |
| Doing something per item | Iterator (implicit or explicit) | Line items or a loop |
| Billing unit | Operation | Task |
| The run log | Scenario execution history | Zap History |

The single most important idea in Make, and the one with no clean equivalent in the previous lesson, is the **bundle**.

## Bundles: the unit that everything else follows from

A **bundle** is one packet of data. A module receives bundles and emits bundles. If a module emits three bundles, **every module downstream of it runs three times, once per bundle**. Nothing tells you this is happening except the small number badge on the connection line and the operation count on your bill.

This one rule explains most of Make's behaviour. A "Search records" module that finds four matches emits four bundles, so the four modules after it run four times, for sixteen operations. A trigger that picks up two new rows in one polling cycle emits two bundles and the whole scenario runs twice. An **Iterator** module takes one bundle containing an array and emits one bundle per array element — that is its entire job. An **Aggregator** does the reverse: it consumes many bundles and emits one, which is how you get from "five line items" back to "one summary string."

Two practical consequences follow immediately.

**Operation counting is multiplicative, not additive.** In the previous lesson, a five-step automation firing once costs about four tasks. In Make, a five-module scenario where module two emits three bundles costs roughly `1 + 1 + 3 + 3 + 3 = 11` operations. Search modules and iterators are where the multiplication happens, so those are the modules to look at first when a bill surprises you.

**Testing with one item hides everything.** A scenario that works perfectly on a single record and collapses on a batch of four is the standard Make bug, and it is always a bundle-count misunderstanding. Always run at least one test with a multi-item input.

## Building the same automation

Take the intake automation from the previous lesson — a new spreadsheet row becomes a tracked record and a channel notification — and build it here.

**Create the scenario and place the trigger.** Click the plus, search the spreadsheet app, choose **Watch Rows**. Make distinguishes module types by shape and label: a trigger has a clock or lightning icon, a search has a magnifier, an action has an arrow. Configure:

```text
Module 1: Spreadsheet > Watch Rows   [trigger]
  Connection:   ops@example.com
  Spreadsheet:  Client Requests 2026
  Sheet:        Intake
  Table contains headers: Yes
  Row with headers: 1
  Limit:        2
```

The **Limit** field is Make's answer to a question the previous lesson's platform decides for you: how many bundles should one execution pick up at most? Set it low — 1 or 2 — while developing, so a mistake costs two runs rather than two hundred. Raise it for production once the scenario is proven.

Right-click the trigger and choose **Choose where to start** to control which row the scenario considers "next." During development, pointing it at a specific row and re-running is far faster than adding new rows to force a trigger.

**Add the create module.** Connect a second module: your database app, **Create a Record**. The configuration panel is a form, and clicking into any field opens the **mapping panel** — a tree of everything available from every upstream module.

```text
Module 2: Database > Create a Record
  Table:           Requests
  Name:            {{1.`Requester Name`}}
  Email:           {{1.`Requester Email`}}
  Type:            {{1.`Request Type`}}
  Description:     {{1.Details}}
  Due:             {{formatDate(parseDate(1.Deadline; "YYYY-MM-DD"); "YYYY-MM-DD")}}
  Source:          Web intake
  Status:          New
  Source Row Id:   {{1.__ROW_NUMBER__}}
```

Note the mapping syntax. `{{1.Details}}` means "the `Details` property of module 1's bundle." Field names containing spaces are wrapped in backticks. And note that the `Due` field is not a bare mapping but an **expression**: Make ships a large function library — `formatDate`, `parseDate`, `trim`, `upper`, `split`, `join`, `get`, `if`, `ifempty`, `length`, `replace` — usable inline anywhere a value goes. This is the low-code seam, and it removes most of the need for separate formatting steps. Where the previous lesson would add a Formatter action costing a task, Make does it inline for free.

Two expression functions are worth committing to memory now:

```text
{{ifempty(1.Deadline; "no deadline given")}}
{{if(1.`Request Type` = "Website copy"; "COPY"; "OTHER")}}
```

`ifempty` is the antidote to the blank-field failures from the previous lesson, and it costs nothing.

**Add the notification module.** Connect a third module, your chat app, **Create a Message**:

```text
Module 3: Chat > Create a Message
  Connection: workspace-bot
  Channel:    #client-requests
  Text:       New {{1.`Request Type`}} request from {{1.`Requester Name`}}
              Due {{ifempty(1.Deadline; "unspecified")}}
              Record: {{2.id}}
```

**Run once.** The **Run once** button executes the scenario immediately with live data and paints the result onto the canvas: each connection line shows a bundle count badge, and clicking a badge opens the inspector showing the exact input and output of that module for that bundle. This inspector is Make's best feature. You are not reading a log of what happened; you are reading the data as it moved, on the diagram of the thing that moved it.

**Schedule and activate.** Bottom-left of the canvas is the scheduling control. Options include every N minutes, at specific times on specific days, or **immediately** where the app supports a push trigger. Choose an interval that matches the latency requirement rather than the smallest number available: a scenario polling every minute consumes an operation on every empty check on some connectors, and 43,200 checks a month is a real cost for a process nobody notices before lunch. Then toggle the scenario ON.

## Routers, and branching structurally

A **router** is a module that takes one incoming bundle and sends a copy down each of its outbound routes. Placed after a module, it turns a line into a fan.

Add one after module 1 and give it two routes:

```text
Module 1: Watch Rows
   └── Router
        ├── Route A  [filter: Request Type = "Website copy"]
        │     └── Module 2: Create a Record (Copy queue)
        │           └── Module 3: Chat message to #copy
        └── Route B  [fallback route]
              └── Module 4: Create a Record (General queue)
                    └── Module 5: Chat message to #client-requests
```

Three structural facts about routers you need before you design with them.

**Routes execute in order, top to bottom — not in parallel.** The canvas draws them side by side, which reads like concurrency. It is not. Route A completes entirely before Route B begins. If Route A creates something Route B needs, that works; the reverse does not. You can drag routes to reorder them, and the order is meaningful.

**Every route whose filter passes will run.** A router is not a switch statement that stops at the first match. If a bundle satisfies the conditions on three routes, all three run. When you want exactly one route, the conditions must be mutually exclusive — and checking that they are is your job, not the tool's.

**One route can be marked as the fallback.** Right-click a route's filter and set it to be the fallback, and it runs only when no other route's filter passed. Every router should have one. A router where a bundle matches nothing silently ends the run for that bundle, and silent nothing is the hardest defect to notice.

The filter itself sits on the connection line, not in a module, and configuring one opens a small panel:

```text
Filter label: Is website copy
Condition:    {{1.`Request Type`}}   Text: Equal to (case insensitive)   Website copy
AND
              {{1.Deadline}}         Date: Is not empty
```

Label every filter. An unlabelled filter shows as a blank funnel icon on the canvas and you will have to click each one to remember what the diagram means. The deeper discipline around conditions — mutual exclusivity, truth tables, what happens when a step fails inside a route — is lesson 07's subject; here the point is the router's structure and where the filter lives.

Routers are not the only branching device. A filter can sit on any connection line without a router, in which case it simply stops the flow when its condition is false. Use a bare filter when you mean "only continue sometimes" and a router when you mean "do different things depending."

## Iterators and aggregators

The pair that has no simple equivalent in a list-shaped tool.

An **Iterator** takes an array inside one bundle and emits one bundle per element:

```text
Module 2: Iterator
  Array: {{1.attachments}}
```

Downstream of that iterator, every module runs once per attachment, and each run sees `{{2.filename}}`, `{{2.url}}` for its own element. Many modules iterate implicitly — a "search" or "list" module already emits multiple bundles — so add an explicit Iterator only when an array is sitting *inside* a single bundle.

An **Aggregator** consumes the bundles produced since a chosen **source module** and emits one:

```text
Module 5: Text Aggregator
  Source module: Module 2 (Iterator)
  Row separator: New row
  Text: - {{2.filename}} ({{2.size}} bytes)
```

The `Source module` setting is the part people get wrong. It tells the aggregator where the fan-out began, and therefore which bundles to gather. Choose the module that produced the multiple bundles, not the one immediately before the aggregator.

There are several aggregator flavours — Text, Array, JSON, Numeric — and the Array aggregator is how you build a JSON payload out of a set of records to post somewhere in one request. That pattern will matter in lesson 09.

## Blueprints, versions, and working with other people

Two Make features have no close equivalent in the previous lesson's platform, and both belong in the trade-off comparison because they are governance rather than functionality.

**The blueprint.** Every scenario can be exported as a JSON blueprint containing its modules, mappings, filters, and routes — everything except the connections, which stay behind for obvious reasons. That file is the closest thing no-code has to source code. Three uses follow. You can **back it up** before a risky change and restore it if the change goes wrong. You can **clone a scenario into another team or account** by importing the blueprint and re-attaching connections, which is how you promote a tested build from a development workspace to a live one. And you can **diff two versions in a text editor** to see exactly what changed between them, which is the only reliable way to answer "what did somebody edit last Thursday."

Adopt one habit from this: export a blueprint before every significant edit, name it with the date, and keep the last few. It costs ten seconds and it is the difference between a five-minute rollback and an afternoon of reconstruction.

**Version history and the incomplete-executions queue.** Make keeps previous versions of a scenario and lets you restore one. Separately, it maintains a queue of executions that stopped part-way and can be resumed — a surface with no counterpart in a list-shaped platform, and one you must know exists, because a scenario can be quietly accumulating parked runs while appearing to work. Check it during development, and in production make checking it part of a routine rather than something you remember when a customer complains.

On collaboration, both platforms let several people edit, and both have the same underlying hazard: two people editing the same automation at once, with the last save winning. The practical discipline is the same as in any shared document — announce that you are editing, keep edits short, and export first. Make's team and organisation structure lets you separate a development team from a production one, and using that separation is the cheapest available protection against somebody testing against live data.

Add both to the governance axis when you compare the platforms. Exportable structure, restorable versions, and a visible queue of parked runs are real operational advantages, and they matter most in exactly the situation where a no-code build is most valuable: several non-developers maintaining something the business depends on.

## Make against the previous lesson's platform

You have now built the same automation twice, so the comparison is earned rather than theoretical.

**Where Make wins.** The canvas makes structure legible: someone who has never seen your scenario can look at it and see the branches. Inline expressions remove a whole class of formatting steps and the operations they would have cost. Iterators and aggregators make list handling explicit instead of magical. The execution inspector, showing real data on the diagram, is a better debugging surface than a linear log. Fine-grained control over bundle limits, scheduling, and per-module error handling gives you levers when something misbehaves.

**Where the previous lesson's platform wins.** The linear editor is faster to learn and much faster for a genuinely simple job — three steps and no branching is less work there. Its app directory is larger, and the connectors are often more thoroughly built out, with more events per app. Instant triggers are available for more applications. And the list model is harder to get subtly wrong: there is no bundle multiplication to misunderstand, so a beginner's automation costs what a beginner expects.

**On price, refuse to compare the headline numbers.** A task and an operation are different units. The honest comparison is: model your specific workflow on both, count the units it consumes per event on each, multiply by your real monthly volume, and compare the resulting bills. A branch-heavy workflow with searches and iteration consumes many more operations than tasks; a simple linear workflow may consume similar amounts of both. There is no general answer, and anyone offering one is selling something.

**On lock-in, they are similar and both are real.** Both let you export a definition as JSON, and neither export means anything to the other. Assume a move between them is a rebuild, and mitigate by keeping the *design* — the trigger-data-action sentence, the field mapping table, the branch conditions — in a document outside both tools.

**A defensible selection rule.** Prefer the list-shaped platform when the process is linear, the volume is modest, the connectors you need are richer there, and the people maintaining it are non-technical. Prefer Make when the process branches, handles lists, needs inline data manipulation, runs at volume where operation control matters, or when the visible structure is itself valuable because several people will maintain it.

## Practice

You will need the same accounts as the previous lesson, plus a free Make account.

1. **Rebuild the intake automation in Make.** Watch Rows trigger with a limit of 2, a create module carrying the source row identifier, and a chat notification referencing the created record's id. Use `ifempty` for the deadline. Run it once, then activate it on a 15-minute schedule and add two rows. Capture the execution history showing both.

2. **Prove the bundle rule.** Add a search module that you know will return three or more matches, place a chat module after it, and run once. Report the bundle count badge on each connection and the total operations consumed for that run. Then predict, before running, what the count would be if the search returned seven, and verify.

3. **Add a router with three routes.** Route by request type into two specific queues plus a labelled fallback. Give every filter a name. Then deliberately construct a row that satisfies two of your filters, run it, and record what happened. Rewrite the conditions so exactly one route can match, and demonstrate it.

4. **Iterate and aggregate.** Take a bundle containing an array — a multi-line cell you split with `split()`, or a record with several linked items. Add an Iterator, do something per element, then a Text Aggregator with the correct source module that produces a single summary string. Post that string in one chat message. Show the operation count and state where the multiplication happened.

5. **Write the comparison, with your own numbers.** Produce a one-page table comparing your two builds on: modules or steps configured, units consumed per single-row event, units consumed per event when a list of five items is involved, minutes taken to build, and how many clicks it took to find the cause of a deliberately broken field mapping. Every cell must come from your own two builds, not from documentation.

6. **Make a recommendation you can defend.** In 250 words, recommend one of the two platforms for the automation in exercise 3 and one for a hypothetical linear two-step notification running 8,000 times a month. Name the axis that decided each, and state the condition under which you would reverse the recommendation.
