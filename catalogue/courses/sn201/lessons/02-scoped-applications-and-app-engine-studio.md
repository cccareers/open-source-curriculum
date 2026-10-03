---
lesson_id: sn201-02
course_id: sn201
pathway: servicenow-implementation-specialist
title: Scoped Applications and App Engine Studio
order: 2
kind: lesson
competency_ids:
  - D1-S1-C01
objectives:
  - Scope a custom application and create it with App Engine Studio
---

## An application is a boundary, not a folder

In sn102 you moved around an instance that already had applications in it — Incident, Problem, Change, Knowledge. You opened their tables, filtered their lists, and edited their records. You never had to ask where one application stopped and the next began, because someone else had already drawn those lines.

Now you are drawing them. On the ServiceNow platform an application is not a folder you drop things into for tidiness. It is an enforced boundary with a name the platform knows about, called an **application scope**. Every table, form, business rule, flow, role, and script you create while that scope is active is stamped with it, and the platform uses that stamp at runtime to decide what your code may touch and who may touch your code.

This is the single most important idea in the course, so it is worth being precise about what the boundary buys you.

**A private namespace.** A scoped application gets a scope identifier that begins with a vendor prefix, conventionally `x_` followed by a short company code — something like `x_acme_facilities`. Every table you create inside it is named with that prefix, so your `work_order` table is really `x_acme_facilities_work_order`. If another team on the same instance also builds a work order table, theirs is `x_beta_wo_work_order` and the two never collide. Names in the global scope have no such protection, which is exactly why two vendors dropping a `u_work_order` table onto the same instance used to be a genuine problem.

**Runtime protection.** Code running inside your scope cannot silently reach into another application's data. If a business rule in `x_acme_facilities` wants to write to the Incident table, that access has to be allowed — the platform records the intent and an administrator can permit or deny it. The reverse is also true: you decide whether other applications may read or write your tables, or call your script includes. You are not just organising your work; you are declaring an API surface.

**A unit of movement.** Because everything carries the scope stamp, the platform can answer the question "what files make up this application?" precisely. That answer is what makes it possible to publish the application, capture it in an update set, or commit it to a source control repository — which is the subject of lesson 8. An application whose parts are scattered across the global scope has no such answer, and moving it becomes an archaeology exercise.

**A unit of versioning.** The application record holds a version number. When you publish, that version travels with the code, so an instance can tell you it is running version 1.2.0 of your facilities app rather than "some tables somebody made."

## Global scope and why you are not using it

The **global** scope is the platform's original, unpartitioned space. Most of the out-of-box ITSM tables live there, and for years customisations were dropped there too. Global code can generally reach anything, which sounds convenient until you inherit an instance where a hundred undocumented global business rules all touch the same table.

For new development the default is scoped, and this course builds scoped throughout. You will still *interact* with global tables — your application will reference `sys_user`, and in the project you will read from a global ITSM table — but your own artifacts live behind your own prefix.

There is one practical consequence to internalise now: **the scope you are in when you click "New" determines where the record lands.** The application picker in the platform header shows your current scope. Creating a table while the picker says "Global" produces a global table even if you intended it for your app, and moving it afterwards is painful. Check the picker. Then check it again.

## Two front doors: App Engine Studio and the developer studio

The platform gives you two ways into application development, and they are views over the same underlying records rather than competing products.

**App Engine Studio** is the guided, low-code front door. It walks you through creating the application, then presents your app as a set of building blocks — Data, Experience, Logic and Automation, Security — with wizards behind each one. Creating a table in App Engine Studio means answering questions about the data you want to store; the wizard writes the table, its fields, and a sensible default form for you. It is the right starting point for this course and for most straightforward business applications.

**The developer studio** (often just called Studio) is the file-oriented view. It shows the application as a list of application files grouped by type — tables, business rules, client scripts, UI policies, script includes — with a code editor and a search that spans the whole application. When you need to see everything at once, rename a field, or read the exact script on a business rule, this is the faster tool.

You will move between them constantly, and that is normal. A useful habit: create with App Engine Studio, inspect and refine in the developer studio. Nothing you do in one is invisible to the other, because both are editing the same application file records.

## Creating the application

The running example for this course is a facilities team at a mid-sized company. Today they take repair requests by email, track them in a shared spreadsheet, and lose about one in ten. They want requests captured in one place, assigned to a technician, moved through a small set of states, and closed with a record of what was done.

Here is the creation flow, step by step.

1. Open App Engine Studio and start a new application. Choose to build from scratch rather than from a template — templates are useful later, but you learn more from an empty application.
2. Give it a **name** (`Facilities Work Orders`) and a **description** written for a human being, not a placeholder. This description appears wherever the app is listed, including on the instance where someone else installs it.
3. Accept or set the **scope identifier**. The platform proposes one from your vendor prefix and the app name — `x_acme_facilities` in our example. You can shorten it, but you cannot change it after creation without recreating the application, so read it once carefully. Keep it short: every table name you create inherits it.
4. Set the **application menu** name if prompted. This is the label users see in the navigator.
5. Save. The platform creates the application record, switches your application picker to the new scope, and hands you an empty app.

At this point the application exists, contains nothing, and is already a real, movable unit. Confirm three things before you go further:

- The application picker in the header reads `Facilities Work Orders`.
- The application record shows the scope you expect.
- The version is `1.0.0`.

## What the application record actually holds

Open the application in the developer studio and look at its properties. A handful of fields matter to you now.

| Field | What it controls |
| --- | --- |
| Name | Display label everywhere the app is listed |
| Scope | The immutable namespace prefix for every file in the app |
| Version | The published version string, advanced when you publish |
| Active | Whether the app's artifacts run at all |
| Runtime access tracking | Whether cross-scope calls are logged, enforced, or unrestricted |
| Menu | The application menu shown in the navigator |
| Logo | Optional image shown in App Engine Studio |

**Runtime access tracking** is the one people skip past. It governs calls your application's code makes *out* to resources in other scopes — your business rule reading `sys_user` or writing to Incident. In its enforcing setting, each such cross-scope call must have an explicit, approved access record (a cross-scope privilege) before it succeeds; in tracking mode the platform records the call and allows it, so you can discover dependencies before you enforce them. Calls coming *into* your application from other scopes are governed separately, by each table's application access settings, which lesson 7 covers. During development, tracking is a gentle default. Before you hand the application to anyone else, look at what got logged and decide deliberately what stays open.

## Application files: everything you build is a record

This is worth stating plainly because it explains why the rest of the course works the way it does. On this platform, configuration *is* data. A table definition is a record in a table of table definitions. A business rule is a record. A form layout is a record. A role is a record. Collectively these are **application files**, and each one carries the scope of the application that owns it.

Two consequences follow, and both matter immediately.

First, "what is in my application?" is a query, not a guess. The developer studio's file list is exactly that query, filtered to your scope.

First-time builders often expect to find their work on a filesystem somewhere. There is no filesystem. There is a table, and your work is rows in it.

Second, because application files are records, they can be captured, exported, versioned, and shipped by the same machinery that moves any other record. That is the whole basis of update sets in lesson 8.

## Drawing the boundary: what belongs in one application?

The hardest part of scoping is not the mechanics — it is deciding what the application *is*. Two rules of thumb carry most cases.

**Group by the process, not by the department.** If facilities and IT both raise work orders but follow genuinely different processes with different states and different approvers, those are two applications, or one application with a clear extension point. If they follow the same process and only the assignment group differs, that is one application with a field on it.

**Ask what ships together.** If two pieces of functionality would always be installed, upgraded, and retired at the same moment, they belong in the same application. If one could plausibly go to a customer without the other, that is a seam.

For the facilities example the boundary is easy: everything about capturing, assigning, and closing a facilities work order is in scope. The company's employee directory is not — that is `sys_user`, a platform table you reference rather than own. Reporting dashboards that combine facilities data with IT data are not either; they consume your data across the boundary rather than living inside it.

## Naming, before you have anything to name

Set your conventions now, while the application is empty and changing them is free.

- **Tables**: singular, lowercase, underscore-separated, describing one row. `work_order`, not `work_orders` or `WorkOrders`. The scope prefix is added for you.
- **Fields**: describe the value, not the widget. `assigned_technician`, not `tech_dropdown`.
- **Roles**: `<scope>.<role>` is generated for you; the part you choose should name a job, not a permission — `technician` and `facilities_manager`, not `can_edit`.
- **Labels**: written for the end user, in their language. The label is what appears on the form; the name is what appears in script. They do not have to match, and often should not.

Consistency here pays for itself in lesson 4, when you start building forms and every field label you chose badly is suddenly visible to a hundred people.

## Practice

Work in a personal development instance. Everything below is done in one sitting and becomes the foundation for every later lesson, so keep it.

1. **Create the application.** Using App Engine Studio, create a scoped application named `Facilities Work Orders` with a description of at least two sentences explaining what the app does and who uses it. Accept a scope identifier you are happy to live with, and record it in your notes.

2. **Verify the scope.** Confirm the application picker shows your new app. Then deliberately switch the picker to Global, switch back, and note where the indicator lives — you will need to check it reflexively for the rest of the course.

3. **Read the application record.** Open the app in the developer studio and write down its scope, version, and runtime access tracking setting. Change nothing yet.

4. **Draw the boundary on paper.** List six things a facilities team might want from software: for example, raising a repair request, tracking a technician's certifications, ordering parts, booking a meeting room, reporting on repair costs, and paying an external contractor. For each one, decide whether it belongs *inside* this application, *outside* it, or *at the boundary* (your app reads or writes something another application owns). Write one sentence of justification per item. There is no single right answer; the reasoning is the exercise.

5. **Set your conventions.** Write a short naming convention note for the application covering tables, fields, and roles, with one example of each. You will follow it in lesson 3.

6. **Stretch.** Find one out-of-box scoped application on your instance that you did not build. Open its application record and identify its scope prefix and version. Then find one artifact — any table or business rule — and confirm from the record itself which application owns it.
