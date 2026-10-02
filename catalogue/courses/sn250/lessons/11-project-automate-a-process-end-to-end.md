---
lesson_id: sn250-11
course_id: sn250
pathway: servicenow-implementation-specialist
title: "Project: Automate a Process End to End"
order: 11
kind: project
competency_ids:
  - D7-S1-C01
  - D7-S1-C02
  - D7-S1-C03
  - D7-S1-C04
objectives: []
---

## Goal

Automate one complete business process on the ServiceNow platform, using each of the four tool families this course covered — server-side script, client-side script, declarative automation, and scheduled or event-driven work — where each is genuinely the right choice, and be able to defend every choice you made.

The deliverable is a working automation in a scoped application on a sub-production instance, plus a short written design note. You are being assessed on judgement as much as on code: a project that solves everything with business rules is a fail even if every rule works.

## The scenario

Your organisation runs an **equipment loan** process. Staff request a loan of a laptop, projector, or test device for a fixed period. Today it is email and a spreadsheet. You are automating it.

The process, as the business describes it:

1. A requester submits a loan request naming the equipment type, the pickup date, the return date, and a business justification.
2. Requests longer than 14 days need the requester's manager to approve. Shorter ones do not.
3. Once approved (or immediately, if no approval was needed), a fulfilment task is created for the equipment group, carrying the request details.
4. When the fulfilment task is closed, the request moves to Loaned, the actual issue date is stamped, and the requester is notified.
5. Every night, any loan whose return date has passed and which has not been returned is flagged as overdue, and the requester and the equipment group are told. A loan that is already flagged is not flagged again.
6. An external asset system needs to know whenever a loan reaches Loaned or Returned. It exposes a REST endpoint. It also occasionally needs to ask the platform for the current status of a loan by its number.

You may model this on a custom table in your own scoped application, or on an existing task-derived table. Building your own table is cleaner and is recommended.

## Requirements

Your submission must include all of the following, each doing work that genuinely belongs to it.

**A data model.** At least one custom table with the fields the process needs: requester, equipment type, pickup and return dates, state, justification, and whatever your design requires. States must be explicit and named.

**Server-side validation that cannot be bypassed.** A before business rule that rejects a save which violates a rule of the process — for example, a return date on or before the pickup date, or a request whose duration exceeds a maximum. It must reject the save with a message the user can act on, and it must work when the record is created from a background script, not just from a form.

**Field manipulation on save.** A before rule that derives at least one value the user should not type — a computed duration, a default, or a normalised value.

**Client-side form behaviour that does not slow the form.** At least one UI policy that could not sensibly be a script, and at least one client script that could not be a UI policy. Any server data the client needs must arrive through a display business rule and `g_scratchpad`, or through an asynchronous GlideAjax call to a client-callable script include. No synchronous server calls.

**Reusable server logic.** A script include holding the logic that more than one caller needs — at minimum the overdue test and the state transition. Business rules, the scheduled job, and any flow script step call it rather than duplicating it. Public methods must survive being called with `null` and with an invalid sys_id.

**A flow.** The approval, the fulfilment task, the wait for its closure, and the notification are a process, and they belong in Flow Designer. At least one part of it must be extracted into a **subflow** or a **custom action** with declared inputs and outputs, and the flow must be reachable from script as well as from its trigger.

**Scheduled work.** A scheduled script execution implementing the nightly overdue sweep. It must be bounded, idempotent, thin (the logic lives in the script include), and it must log one tagged line reporting counts.

**Event-driven work.** At least one registered event, fired from server script, with two listeners — one script action and one event-triggered notification. Pick a fact that genuinely has more than one interested party, and be ready to explain why an async business rule was not the better answer.

**Both integration directions.** An outbound call to an external service when a loan reaches Loaned, built with `RESTMessageV2`, with credentials in a REST Message record rather than in script, a timeout, a status-code check, and error handling that never fails the user's transaction. And an inbound **Scripted REST API** with a `GET` resource returning a small, hand-built JSON representation of a loan by its number, with correct status codes for found, not found, and malformed input.

**A design note**, one to two pages, covering: your state model; a table of every automation artefact you built, its type, and one sentence on why that type; the three decisions you found hardest and what you rejected; and how you tested each piece.

## Constraints

- **Sub-production instance only**, in a scoped application of your own. Nothing in global.
- **No credentials in script**, at any point, for any reason.
- **No synchronous server calls from a client script**, and no client-side GlideRecord query.
- **No outbound integration call inside a before business rule.**
- **No business rule without a condition.** Every rule must state, on the record, when it should run.
- **No logic duplicated in two places.** If two callers need the same answer, it lives in a script include.
- **No release names anywhere** in your artefacts or notes; write against current platform APIs.
- **Every script include public method guards its inputs.** No exception is acceptable for "it will never be called that way".
- **Debug logging is removed** before submission. Outcome logging stays.
- You may use the external service of your choice for the outbound call, including a public request-echo endpoint. Do not point it at a real vendor's production system.

## Definition of done

You are done when every one of these is true, demonstrated, and you can show the evidence:

1. A loan request can be created from a form and from a background script, and the server-side validation rejects an invalid one in **both** paths.
2. A request longer than 14 days routes through manager approval; a shorter one does not. You can show both runs in the flow's execution details.
3. Closing the fulfilment task moves the request to Loaned, stamps the issue date, and notifies the requester — with no manual step.
4. The nightly job, run twice in a row against the same data, flags each overdue loan exactly once. You can show the two log lines proving it.
5. Your event fires once and both listeners react. You can show the `sysevent` row in state `processed` and the effect of each listener.
6. The outbound call succeeds, and when you point it at an unreachable endpoint the user's transaction still completes and the failure is in the log with the loan number and the status.
7. Your Scripted REST API returns `200` with your JSON for a real loan number, `404` for an unknown one, and `400` for a malformed one — and returns nothing at all to a user without the required role.
8. Every script include public method returns sensibly when called with `null` and with a made-up sys_id. You can show the background script that proves it.
9. Nothing in the client-side behaviour makes a synchronous server call. You can show the browser network panel for a form load and a field change.
10. Your design note explains every artefact, and for at least three of them names the alternative you rejected and why.

## Hints

**Model the states before you build anything.** Write the state list and the legal transitions on paper first. Almost every difficulty in this project traces back to a state model invented while coding.

**Decide the tool for each step before you write it.** Go through the six numbered process steps and label each one: before rule, after rule, async rule, flow, subflow, scheduled job, event, or client script. Do it on paper, in ten minutes, and you will not have to rewrite anything. The decision lists in lessons 4, 7, and 9 exist for exactly this.

**Build the script include first.** The overdue test, the transition, and the payload builder are needed by the rule, the job, the flow, and the API. Writing them first, and testing them from a background script, means everything after is three lines.

**Build the flow with the Test button before you wire the trigger.** A flow that is correct but never fires is a trigger-condition problem, and you want to have already eliminated the flow itself.

**Do the outbound call by hand first.** Get it working in a background script against the endpoint, with a timeout and a status check, before you put it behind a REST Message record and a script include. Then use *Preview Script Usage* on the message record and compare.

**Expect your first inbound API to leak.** Build it, then call it as a user with no roles and see what comes back. `GlideRecordSecure` and an explicit role on the resource are both required; one alone is not enough.

**Prove idempotence deliberately.** Run the nightly job twice with a stopwatch, not once with optimism. The second run is where the design flaw shows.

**Leave the logging in while you build and take it out at the end.** Tag every line with the artefact name so you can find your own output among everything else running on the instance.

**When something does not happen, follow the chain in order**: did the rule's condition pass, did the event row appear, is it `processed`, did the flow trigger, is the flow waiting rather than stuck. Guessing which link broke is slower than checking all five.
