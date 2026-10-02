---
lesson_id: cse270-01
course_id: cse270
pathway: cloud-support-engineer
title: Course Overview
order: 1
kind: overview
competency_ids: []
objectives: []
---

## Description

You have already provisioned cloud resources by hand. You have opened a console, filled in a form, waited for a green tick, and done it again the next week for the next environment. This course is about the moment that stops being reasonable — when the same fifteen clicks have to happen forty times, at three in the morning, correctly, and nobody wants to be the person doing them.

The work here is writing code, but not application code. Everything you write is operational glue: a Bash script that rotates a log bucket, a Python script that pages through an API and tells you which instances nobody has tagged, a pipeline that turns a merged pull request into a deployed change, a function that wakes up on a schedule and scales something down before the weekend bill arrives. Small programs, real consequences.

Because the consequences are real, safety is the thread running through every part of this course. A script that works once is easy. A script that is safe to hand to a colleague, safe to run twice by accident, and safe to let a scheduler run unattended is a different piece of work — and it is the difference you are being taught to see. Expect to write a dry-run flag before you write the destructive command it protects, every time.

## Objectives

- Write Bash scripts that automate repetitive cloud operations tasks safely
- Write Python scripts that query and manage cloud resources through a provider CLI or SDK
- Automate a deployment with a continuous integration and delivery pipeline
- Trigger operational work from events and schedules using serverless functions
- Combine scripting, pipelines, and infrastructure code into a reusable operations toolkit

## Prerequisite Knowledge

- Completed Introduction to Cloud Computing (cse101) or equivalent working knowledge of cloud service models
- Completed Cloud Infrastructure Deployment & Management (cse203) or equivalent experience provisioning cloud resources
- Able to read and modify simple code in any language, and to use git branches and pull requests

## Course Content

1. Course Overview
2. Shell Scripting for Cloud Operations
3. Project: Automate a Routine Task with Bash
4. Python for Cloud Automation
5. Project: Inventory Cloud Resources with Python
6. Continuous Integration and Delivery Pipelines
7. Project: Build a Deployment Pipeline
8. Event-Driven Automation with Serverless Functions
9. Project: Schedule and Scale with Serverless
10. Project: Automated Operations Toolkit
