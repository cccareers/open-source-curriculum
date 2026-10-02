---
lesson_id: ai102-01
course_id: ai102
pathway: prompt-engineer
title: Course Overview
order: 1
kind: overview
competency_ids: []
objectives: []
---

## Description

Up to now your prompts have lived in a chat window. You typed, the model answered, you read it, and you decided what to do next. That is a fine place to learn the craft and a terrible place to run a business process, because you are the integration. Every time a request arrives, someone has to notice it, paste it in, judge the output, and put the result somewhere. The prompt may be excellent; the process is still a person doing clerical work at machine speed.

This course removes you from the middle. You will learn to build systems where a real event fires a workflow, data moves between tools on its own, a model does the piece of judgement only a model can do, and the result lands in a place other people can see and act on — all of it assembled from configuration rather than application code. You will work in two named automation platforms, model data in a no-code database, put an interface on top of it, connect tools that have no ready-made integration by calling their APIs directly, and handle events pushed at you by other systems.

The second half turns the same skills toward a product: a business chatbot that knows your organisation's own content, escalates to a human when it should, and reports on how it is doing. Along the way you will treat what you build the way an engineer treats anything that runs unattended — testing it deliberately, knowing what it costs per month, and knowing what it does when a step fails. Everything is hands-on, and the course ends with an integrated build you hand over to someone else.

## Objectives

- Describe the no-code and low-code landscape and choose a class of tool that fits a stated automation need
- Build a working multi-step automation in Zapier from a trigger through to a completed action
- Build the same class of automation in Make using scenarios, modules, and routers, and explain the trade-offs against Zapier
- Model records, fields, relations, and views in a no-code database so it can serve as an application backend
- Assemble a working interface on top of a no-code database for a defined user task
- Add branching, filters, retries, and explicit error paths so an automation behaves predictably when a step fails
- Embed a prompt inside an automation step so the model receives clean input and returns output the next step can consume
- Connect a tool that has no prebuilt integration by calling its REST API from an HTTP step
- Receive and send events with webhooks, including verifying and shaping an inbound payload
- Configure and manage credentials for connected tools without exposing secrets
- Design a business chatbot's scope, conversation flow, and escalation path before building it
- Build a chatbot that answers from your own content rather than from the model's general knowledge
- Deploy a chatbot to a real channel with human handoff and usage monitoring in place
- Test a no-code AI build and account for its running cost, quota limits, and failure modes before handing it over
- Deliver an integrated no-code AI solution that combines a database, an interface, an automation, and an AI step

## Prerequisite Knowledge

- Completion of ai101, or equivalent ability to write and refine a structured prompt
- Comfort with spreadsheets, web applications, and moving data between systems

## Course Content

1. Course Overview
2. The No-Code and Low-Code Landscape
3. Your First Automation in Zapier
4. Scenarios, Modules, and Routers in Make
5. No-Code Databases as an Application Backend
6. Building an Interface on a No-Code Database
7. Logic, Branching, and Error Paths
8. Adding an AI Step to an Automation
9. Connecting Tools with REST APIs
10. Webhooks: Receiving and Sending Events
11. Authentication and Credential Management
12. Designing a Business Chatbot
13. Grounding a Chatbot in Your Own Content
14. Deploying a Chatbot with Handoff and Monitoring
15. Testing, Cost, and Reliability
16. Project: An Integrated No-Code AI Solution
