---
lesson_id: sn102-02
course_id: sn102
pathway: servicenow-implementation-specialist
title: Platform Architecture and Core Components
order: 2
kind: lesson
competency_ids:
  - D1-S1-C01
objectives:
  - Describe the ServiceNow platform architecture and how instances, applications, and the core data model fit together
---

## What an instance is

The first word you have to get right is **instance**. When somebody says "log in to ServiceNow," they mean log in to a specific instance, and an instance is a complete, private copy of the platform running for exactly one customer. It has its own web address, its own database, its own users, its own configuration, and its own data. Nothing in your instance is shared with any other customer's instance.

This is different from most cloud software you have used. A typical software-as-a-service product is *multi-tenant*: one running application serves thousands of customers at once, and your data is separated from everyone else's by a customer identifier on every row. ServiceNow uses a **single-tenant** model instead. Each customer gets dedicated application nodes and a dedicated database. The practical consequence for you as an implementer is enormous: because you are not sharing a database with strangers, you are allowed to change the data model itself. You can add tables, add fields, and change behavior in ways a multi-tenant product could never safely permit.

Organizations do not run one instance. They run a small family of them, and each one has a job:

- **Development** — where implementers build. Changes start here.
- **Test** (often called QA or UAT) — where changes are verified against realistic data before anyone depends on them.
- **Production** — the live instance the whole organization uses.

Changes travel in one direction, development to test to production, and they travel as packages rather than as manual re-work. You do not build something twice. Later courses in this pathway cover how those packages are captured and moved; for now, remember the direction of travel and the reason for it. Nobody builds in production.

There is a fourth kind of instance you will meet in this course: the **personal developer instance**. It is a free, individually-assigned instance that ServiceNow provides for learning. It behaves like a real development instance, it hibernates when you stop using it, and it is yours to break. Every hands-on exercise in this pathway assumes you have one.

## The layers of the platform

It helps to picture the platform as four layers stacked on top of each other. Work your way up from the bottom.

**The database** sits at the bottom. Every single thing that exists in ServiceNow is a row in a table, and that is not a figure of speech. An incident is a row. A user is a row. So is a group, a role, a knowledge article, a scheduled job, a form layout, an access rule, and the definition of the incident table itself. There is no separate configuration file store off to one side. Configuration is data.

**The platform services layer** sits above the database and is what makes ServiceNow more than a database with a web page attached. It provides the services every application needs and none of them should have to build: authentication and session handling, access control evaluation, the list and form rendering engine, search and indexing, notification and email handling, scheduled job execution, the automation engines, the import and integration machinery, and reporting. When you build an application on ServiceNow, you inherit all of this rather than writing it.

**The applications layer** sits above the services. IT Service Management, Customer Service Management, HR Service Delivery, Governance, Risk, and Compliance, IT Operations Management, IT Asset Management, and any custom application your organization writes all live here. This is the layer people think they are buying. It is worth understanding that these applications are not separate products bolted together — they are sets of tables, forms, roles, and automation built on the same services layer, which is why an HR case and an IT incident behave so similarly once you look under the hood.

**The interface layer** is what humans touch. There is more than one, deliberately. **Next Experience** is the modern interface framework: it supplies the unified navigation header you see on current instances and the **workspaces**, purpose-built fulfiller screens where agents work queues and records. The **classic platform UI** — lists and forms reached through the application navigator — is still where much configuration work happens and is what most of this course shows you, even when it is displayed inside the Next Experience header. **Employee Center** and other portal experiences are the self-service front door for people who do not work in the platform all day — they see a catalog and their own requests, not a list view. **Mobile apps** and **Virtual Agent** are additional front doors onto the same records.

The same incident record can be viewed in a workspace, in the classic UI, in a portal, and on a phone. It is one record. The interfaces differ; the data and the rules do not. Hold on to that, because new implementers routinely believe a portal has "its own" data. It does not.

## The core data model

Everything is a table, and a small number of core tables carry most of the platform's weight. Learning their technical names now saves you weeks later, because the technical name is what you type into the navigator, use in a URL, and see in configuration screens.

| What it holds | Technical name | Notes |
| --- | --- | --- |
| People | `sys_user` | Every human and service account |
| Groups | `sys_user_group` | Teams that work is assigned to |
| Roles | `sys_user_role` | What a person is permitted to do |
| Companies | `core_company` | Customers, vendors, your own org |
| Locations | `cmn_location` | Sites, buildings, offices |
| Departments | `cmn_department` | Org structure |
| Task (the parent of most work) | `task` | Almost never used directly; extended constantly |
| Configuration items | `cmdb_ci` | The things IT manages |

The one to slow down on is **`task`**. It is the base table for almost every kind of work the platform tracks. It defines the fields that any unit of work needs regardless of what kind of work it is: a number, a short description, a description, a state, a priority, an assignment group, an assigned-to person, an opened-by person, opened and closed timestamps, and a work-notes journal.

Incident, Problem, Change Request, Request Item, HR Case, and Customer Service Case are all **extensions** of `task`. An extension inherits every field its parent defines and then adds its own. `incident` inherits `short_description` and `assignment_group` from `task`, and adds fields that only an incident needs, such as caller and category. `change_request` inherits the same base fields and adds a risk field, a planned start date, and a planned end date.

This single design decision explains a great deal of platform behavior that otherwise looks like coincidence:

- A person's "My Work" list can show incidents, HR cases, and change tasks side by side, because all of them are tasks and all of them have an assigned-to field.
- A rule written against `task` applies to every kind of work at once.
- Reporting on "all open work assigned to my group" is one query, not six.

The other structural table to know is the **Configuration Management Database**, whose base table is `cmdb_ci`. Where `task` describes work, the CMDB describes *things* — servers, applications, databases, network gear, laptops, cloud services — and, just as importantly, the relationships between them. `cmdb_ci` extends into `cmdb_ci_server`, `cmdb_ci_appl`, and dozens of other specific classes in the same way `task` extends into `incident`. When an incident record has a Configuration Item field, that field is a pointer into the CMDB, and that pointer is what lets the platform answer "what else does this outage affect?"

## Applications, scopes, and the update model

An **application** in ServiceNow is a bundle: some tables, some forms and lists, some roles, some automation, and a menu in the navigator. IT Service Management is an application family. So is a fifteen-record thing you build yourself next month in App Engine Studio.

Applications are organized by **scope**. The **global** scope is the shared space where the platform's own core and the older ITSM applications live. A **scoped application** has a namespace of its own, which prevents its records and code from colliding with anything else and controls what other applications may do to it. When you build a new application, it is scoped by default. You do not need to configure scope in this course; you need to recognize the word when you see it in the interface and understand that it is a boundary, not a folder.

Finally, the platform itself is upgraded on a schedule — new versions arrive as families, and customers take them on their own timeline through their sub-production instances first. Because upgrades replace platform records, ServiceNow distinguishes carefully between **configuration** (changes the platform expects you to make, which survive upgrades) and **customization** (changes that overwrite something the vendor ships, which have to be reconciled at every upgrade). Preferring configuration over customization is the single most consequential habit an implementer develops, and every later course in this pathway will come back to it.

## Worked example: reading an outage through the architecture

A payroll application is down. Trace what the architecture is doing.

An employee opens Employee Center — the **interface layer** — and reports that payroll will not load. That creates a row in `incident`, which is a table in the **database** that extends `task`. Because it extends `task`, it arrives with a number, a state, a priority, and an assignment group without ITSM having had to invent any of them.

The **services layer** now does several things without anyone asking. It evaluates access control to decide whether the employee may see the record they just created. It runs the automation that sets the assignment group. It sends a notification. It writes an audit entry.

An analyst in the Payroll Support group opens the record in a workspace — a different **interface**, the same row. They set the Configuration Item field to the payroll application, a record in `cmdb_ci`. Because the CMDB stores relationships, the analyst can now see that the payroll application depends on a specific database server, and that a change was implemented against that server last night. That change is a row in `change_request`, which also extends `task`.

Nothing in that story required a custom integration between four systems. It is one instance, one data model, and one set of services, viewed through several interfaces.

## Practice

Work through these in order. You do not need a personal developer instance for parts 1 and 2; if you already have one, use it for part 3.

1. **Draw the stack from memory.** On a single sheet of paper, draw the four layers (database, platform services, applications, interfaces). Without looking back at the lesson, write at least three concrete examples inside each layer. Then check your sheet against the lesson and mark anything you placed in the wrong layer. Pay particular attention to anything you placed in "applications" that is really a platform service.

2. **Build the task family tree.** Write `task` at the top of a page and draw a branch to each of these: `incident`, `problem`, `change_request`, `sc_req_item`, `sn_hr_core_case`, `sn_customerservice_case`. Beside each branch, write two fields you would expect that record type to need that a generic task would not. Then write, in one sentence, why "show me every piece of work assigned to me" is a single query on this platform.

3. **Name the instances.** For a hypothetical company with development, test, and production instances, write down: which instance an implementer builds a new form in, which instance a business user tests it in, which instance an end user files a real incident in, and what has to happen between the first and the third. Then write one sentence explaining why building directly in production is a problem even when the change is small and obviously correct.

4. **If you have an instance already**, sign in and put `sys_user.list` in the navigator's filter box, then press Enter. You are looking at the core user table as a list of rows. Do the same for `task.list`. Note that the list you get back contains several *different kinds* of record. Write one sentence explaining why.
