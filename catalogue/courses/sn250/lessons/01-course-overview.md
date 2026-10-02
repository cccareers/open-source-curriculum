---
lesson_id: sn250-01
course_id: sn250
pathway: servicenow-implementation-specialist
title: Course Overview
order: 1
kind: overview
competency_ids: []
objectives: []
---

## Description

Almost everything you have configured on the platform so far has been declarative: you filled in a form, picked a condition, saved a record, and the platform did the rest. This course is where you stop asking the platform to do things for you and start telling it exactly what to do. That means writing code — real JavaScript, running on a real instance, against real records.

You will spend the first stretch of the course on the language itself, because the platform's scripting APIs are unreadable until variables, loops, functions, objects, and arrays are second nature. From there you move onto the server: querying and writing records, choosing the right business rule, and packaging logic you want to reuse. Then you cross to the browser, where the same language behaves differently and the cost of a careless script is a form that takes four seconds to load. The last stretch covers automation that does not start with a user clicking Save — flows, scheduled jobs, events, and services you expose or consume across the network.

Expect to write code every session and to break things. The final lesson on debugging and performance is placed at the end deliberately, because by then you will have written enough script to have genuine failures worth diagnosing. The course closes with a project that asks you to automate one process end to end and defend every tool choice you made along the way.

## Objectives

- Write JavaScript variables, control flow, functions, objects, and arrays that run on the ServiceNow platform
- Query, create, and update records from server-side script using GlideRecord and GlideSystem
- Choose the correct business rule type and timing for a server-side requirement
- Decide between a client script and a UI policy, and write client-side logic that does not slow the form
- Package reusable server logic in a script include and call it from other scripts
- Build a flow with actions and subflows, and judge when a flow is a better choice than a script
- Expose a Scripted REST API and call an external REST or SOAP service from the platform
- Schedule recurring work and trigger script logic from platform events
- Debug a failing script and reduce the cost of an expensive query

## Prerequisite Knowledge

- sn102 Introduction to ServiceNow Platform
- sn201 Application Development Fundamentals (ADF), or equivalent experience building a scoped application

## Course Content

1. Course Overview
2. JavaScript Fundamentals for the Platform
3. Server-Side Scripting with GlideRecord
4. Business Rules and Execution Order
5. Client Scripts, UI Policies, and the Client API
6. Script Includes and Reusable Server Logic
7. Flow Designer, Actions, and Subflows
8. Scripted REST APIs and Outbound Web Services
9. Scheduled Jobs and Event-Driven Automation
10. Debugging, Logging, and Script Performance
11. Project: Automate a Process End to End
