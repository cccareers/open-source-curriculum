---
lesson_id: sn102-06
course_id: sn102
pathway: servicenow-implementation-specialist
title: A Tour of IT Service Management
order: 6
kind: lesson
competency_ids:
  - D2-S1-C01
objectives:
  - Identify the core ITSM processes and the records each one creates
---

## What this lesson is and is not

This is a tour. By the end of it you should be able to look at a record in an instance and say what process it belongs to, what problem that process exists to solve, and which record type the platform would use for a given situation. You will not configure anything. Setting up incident categorization, change models, approval policies, or service level agreements is implementation work, and it is a whole course later in this pathway. Confusing the two costs people real money: an implementer who can configure a change model but cannot say why an emergency change exists will build the wrong thing correctly.

IT Service Management is the oldest and largest application family on the platform, and it is the one every other application borrows its shape from. Its processes descend from ITIL, a widely-used set of IT service management practices, and the platform's terminology follows ITIL closely enough that the words are worth learning once.

The unifying idea is the one you already met: **every ITSM record is a task**. Incident, problem, change request, request item — all of them extend `task`, so all of them have a number, a state, a priority, an assignment group, an assigned-to person, and work notes. What differs is the fields each adds and the lifecycle each follows.

## Incident Management

**The question it answers:** something is broken; how do we restore service as fast as possible?

**The record:** `incident`, numbered `INC…`.

An incident is an unplanned interruption or reduction in the quality of a service. The email client will not connect. The payroll application is slow. A laptop will not boot. The purpose of incident management is explicitly *restoration*, not explanation. If restarting a service fixes it and nobody knows why, the incident is resolved. The "why" is somebody else's process, and you will meet it next.

Key fields beyond the inherited task ones:

- **Caller** — a reference to `sys_user`, the person affected. This is not the same as Opened by, which is whoever created the record; a service desk agent opening a ticket on someone's behalf produces two different names.
- **Category** and **Subcategory** — what kind of thing this is, used for routing and reporting.
- **Impact** and **Urgency** — how widely it hurts and how quickly it needs attention. The platform derives **Priority** from the two, typically through a matrix, which is why Priority is often read-only.
- **Configuration item** — a reference into the CMDB naming the affected thing.
- **Assignment group** and **Assigned to** — who owns it now.
- **State** — the lifecycle position.
- **Resolution code** and **Resolution notes** — how it ended.

The lifecycle runs roughly New, In Progress, On Hold, Resolved, Closed. Two states carry more meaning than they appear to. **On Hold** usually requires a reason, because "waiting for the customer" and "waiting for a vendor" are different problems for a service desk manager. And **Resolved** is not **Closed**: resolved means the fulfiller believes it is fixed, closed means it has stayed fixed. Most organizations close resolved incidents automatically after a waiting period so the caller has a chance to disagree.

Two mechanisms attach to incidents that are worth recognizing on sight. A **major incident** is a high-impact incident given extra process — a dedicated communication channel, a coordinator, frequent stakeholder updates. And **service level agreements** attach timers to the record; you will see SLA-related fields and a related list showing time remaining against a target. Both are configured, not automatic.

## Problem Management

**The question it answers:** why does this keep happening, and how do we stop it?

**The record:** `problem`, numbered `PRB…`.

A problem is the underlying cause of one or more incidents. Where incident management restores service, problem management removes the reason service keeps failing. The two are deliberately separated because they operate on different clocks: an incident is measured in minutes, a problem in weeks.

Distinctive fields include a **root cause** narrative, a **workaround**, and a related list of the incidents linked to it. Many organizations also use a **known error** state — the cause is understood and a workaround is published, but the permanent fix is not in yet.

The lifecycle is investigative rather than restorative: the problem is assessed, a root-cause analysis is carried out, a fix is identified, and the fix is normally implemented *through a change request* rather than by the problem record itself. That handoff is a good example of processes cooperating rather than overlapping.

The tell that distinguishes them in practice: if the right next action is "get this user working again," it is an incident. If the right next action is "find out why sixty users lost email on Tuesday," it is a problem.

## Change Management

**The question it answers:** we want to alter production; how do we do it without breaking anything?

**The record:** `change_request`, numbered `CHG…`.

Change management governs modifications to the IT environment. Its purpose is to make change safe and traceable, not to make change difficult, though every organization discovers the difference the hard way at least once.

Distinctive fields: **Type**, **Risk**, **Impact**, **Planned start date** and **Planned end date**, **Implementation plan**, **Backout plan**, **Test plan**, and **Configuration item**. Change requests routinely have child **change tasks** — themselves task records — holding the individual steps, and an **Approvers** related list.

Types you will see:

- **Standard** — pre-approved, low risk, well-rehearsed, done from a template. Adding a user to a distribution list. No approval each time, because the *template* was approved.
- **Normal** — the default. It is assessed, scheduled, and approved before implementation, usually by a change advisory board.
- **Emergency** — a change needed immediately, often to resolve a major incident. It follows an expedited approval path and is reviewed after the fact rather than before.

The lifecycle typically runs New, Assess, Authorize, Scheduled, Implement, Review, Closed. Two related concepts appear on or near the record: the **change schedule** or calendar, showing planned changes against time, and **blackout** or **maintenance windows**, which are periods when change is forbidden or expected.

The relationship to the other processes is the most useful thing here. An incident may reveal a problem; the problem's fix is delivered as a change; a badly-executed change causes the next incident. Mature organizations report on that last loop deliberately.

## Request Management

**The question it answers:** I want something that is normal to want; how do I ask for it and how does it get delivered?

**The records:** three of them, and this is where new implementers get confused, so slow down.

- **Request** (`sc_request`, numbered `REQ…`) — the shopping-cart-level envelope. One submission by one person.
- **Requested Item** (`sc_req_item`, numbered `RITM…`) — one line item on that request: one catalog item, with the answers the requester gave. If somebody orders a laptop and a monitor in one submission, there is one REQ and two RITMs.
- **Catalog Task** (`sc_task`, numbered `SCTASK…`) — one unit of fulfillment work under a requested item. Approve the spend, image the laptop, deliver it to the desk: three tasks.

The user-facing side is the **Service Catalog**: a browsable set of **catalog items**, each with a form of **variables** (the questions asked of the requester), grouped into **categories**. Catalog items may be goods, services, or access. **Record producers** are a related idea — a catalog-style form that creates a record on some other table, which is how many organizations let employees report an incident without ever seeing an incident form.

Request management is the process most visible to ordinary employees, and it is the one where automation pays most obviously, because the fulfillment steps are known in advance. The next lesson looks at exactly that.

The tell that distinguishes a request from an incident: an incident means something that should work does not. A request means something is working fine and you would like some of it.

## Two supporting pieces

**Knowledge Management** stores articles in a knowledge base, with a lifecycle of draft, review, publish, and retire. Articles are attached to incidents, surfaced in search and in Virtual Agent, and used for self-service deflection. Records live in a knowledge table rather than under `task`, because an article is not a unit of work.

**The Configuration Management Database** underpins all four processes. Every one of the record types above has a Configuration item field, and populating it consistently is what turns four separate ticket queues into a picture of the environment: which service is failing, which change touched it, which problem it belongs to.

## Worked example: one Tuesday, four record types

At 09:10, a user calls the service desk: the expense system rejects her login. The agent creates an **incident** (INC) with her as caller, category Software, configuration item Expense App. Impact is low, urgency medium, priority derived.

By 09:30 there are forty similar calls. The service desk flags the incident as a **major incident**, and rather than creating forty tickets in isolation the agents link the new incidents to the first one. Communication moves to the major incident channel.

At 09:50, the platform team finds that a certificate on the expense application expired overnight. Restoring service means installing a new certificate on production — and altering production requires a **change request** (CHG). Because service is currently down, it is raised as an **emergency change**, approved on an expedited path, and implemented with two **change tasks**: install certificate, verify login. Service returns at 10:25 and the incidents are resolved.

At 11:00, somebody asks the obvious question: why did a certificate expire without anyone noticing? That is not an incident — service is restored — so a **problem** (PRB) is opened. Its root-cause analysis concludes that certificate expiry is not monitored. The permanent fix, adding monitoring, is delivered as a **normal change** the following week, assessed and scheduled properly.

Meanwhile, at 11:15, a manager decides her team needs access to the expense system's reporting module. Nothing is broken, so this is not an incident. She uses the **Service Catalog**, which creates a **request** (REQ) with one **requested item** (RITM) for reporting access, which generates an approval and one **catalog task** (SCTASK) for the fulfiller who grants it.

Four processes, four record types, one afternoon, and every one of those records is a `task`.

## Practice

Use a personal developer instance with demo data. Everything here is observation and identification; do not change process configuration.

1. **Identify by record.** Open `task.list` and add the **Task type** or **Class** column to the layout so you can see what each row actually is. Find at least one incident, one problem, one change request, and one requested item. For each, write down its number prefix, three fields it has that the others do not, and its current state.

2. **Sort the scenarios.** For each of the following, name the record type the platform should use and give a one-sentence reason: (a) the shared printer on floor two jams every afternoon; (b) a new starter needs an email account; (c) the finance database will be upgraded on Saturday night; (d) a laptop will not charge; (e) the same laptop model has failed to charge for nine people this month; (f) marketing wants a licence for a design tool.

3. **Follow a request end to end.** Find a requested item in the demo data and open it. Identify its parent request, the catalog item that produced it, the variables the requester filled in, and every catalog task beneath it. Draw the four levels as a diagram and label each with its number prefix.

4. **Compare two changes.** Find a standard change and a normal change in the demo data. Put their fields side by side and note every difference you can see, including approvals. Then write two sentences explaining why the standard one needed no approval this time.

5. **Trace the loop.** Find a problem record that has related incidents. Note how many incidents point at it and whether any change request is linked as its fix. If the demo data has no such chain, write the chain you would expect to see for a recurring network outage, naming each record type in order.

6. **Read the boundary.** Pick any incident in the instance and write two short paragraphs: what would have to be true for this to have been a request instead, and what would have to be true for a problem to be opened alongside it. This is the judgment the rest of the pathway builds on.
