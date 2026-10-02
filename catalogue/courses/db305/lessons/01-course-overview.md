---
lesson_id: db305-01
course_id: db305
pathway: prompt-engineer
title: Course Overview
order: 1
kind: overview
competency_ids: []
objectives: []
---

## Description

Every workflow you have built so far ran on whatever data the platform handed you. A form filled in a table, a connector that already existed, a spreadsheet small enough to keep in one tab. This course is about what happens when that stops being true: the data lives behind an API with no prebuilt connector, the spreadsheet has outgrown itself, the model output nobody validated is now sitting in a production record, and the AI step everyone trusts has never had its accuracy measured.

You will work outward from the data itself. First the distinction between structured and unstructured sources and what each one costs you to handle, then APIs as the place the data usually actually lives, then the two storage models you will meet most — relational databases you query with SQL, and document and spreadsheet-style stores you query by filter. You are learning to consume and operate this infrastructure, not to architect it: enough SQL to read and write the queries a workflow issues, enough of the API surface to pull a large dataset reliably, and enough of each storage model to know which one a given job belongs in.

The last third of the course is about running the thing. You will write validation and transformation rules that keep bad data out of storage, deploy a model endpoint on a cloud service with sensible defaults for access and scaling, and instrument a live workflow so its accuracy, latency, and cost are numbers on a dashboard rather than opinions in a meeting. By the end you should be able to take a workflow that works on your machine and make it something an organization can depend on.

## Objectives

- Work with structured and unstructured sources in an AI workflow and choose the right handling for each
- Pull data from an API into a workflow, handling pagination, rate limits, and error responses
- Build an AI workflow that reads from and writes to a SQL database safely
- Build an AI workflow against a NoSQL or spreadsheet-style store and explain when that model is the better fit
- Apply validation, transformation, and storage practices that keep workflow data trustworthy
- Configure and deploy an AI model or endpoint on a cloud service with sane defaults for access and scaling
- Monitor a deployed AI workflow's accuracy, latency, and cost, and act on what the monitoring shows

## Prerequisite Knowledge

- Completion of ai201, or equivalent experience building multi-step AI workflows
- Comfort reading JSON and configuring an HTTP request

## Course Content

1. Course Overview
2. Structured and Unstructured Data for AI
3. APIs as Data Sources
4. AI Workflows over SQL Databases
5. NoSQL and Spreadsheet-Style Data Stores
6. Validation, Transformation, and Storage
7. Deploying AI Models on Cloud Services
8. Monitoring and Optimizing AI Performance
