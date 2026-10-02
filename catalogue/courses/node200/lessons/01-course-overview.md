---
lesson_id: node200-01
course_id: node200
pathway: software-developer
title: Course Overview
order: 1
kind: overview
competency_ids: []
objectives: []
---

## Description

You can already stand up an Express server: routes answer, middleware runs in order, a JSON endpoint returns data, and errors come back with a sensible status. That is a working application and it is also, so far, a single file that only you have ever had to change. This course is about what happens next — when the service has to hold real data, admit real users, survive being edited by somebody who did not write it, and keep running after you have gone home.

The work here is mostly about boundaries. You will draw lines between the code that handles a request, the code that decides what should happen, and the code that talks to the database, and then you will keep those lines honest as you add persistence, logins, input validation, and automated tests. Along the way you will start working the way a team works: from a written specification rather than from your own memory, with quality risks named before they bite, with a test suite that proves what you claim, and with defect reports a senior engineer can act on without asking you three follow-up questions.

Everything is built on one running service that grows across the course, using PostgreSQL for storage and Node's built-in test runner for proof. By the end you will be handed a specification you did not write, for a feature you have not built, and asked to extend the service to meet it and demonstrate that it works.

## Objectives

- Structure an Express application into modules with clear responsibilities
- Work from a Software Requirement Specification to record what must be built
- Separate data access from request handling in a service
- Implement authentication and session handling for a web service
- Validate input and assess the quality risks of a feature
- Test a service at unit and integration level and report progress
- Troubleshoot a running service from its logs and symptoms

## Prerequisite Knowledge

- Completed Introduction to Express JS (node101) or equivalent
- Able to run, route, and debug a local Express server
- Completed Relational Databases (db100) or equivalent SQL experience

## Course Content

1. Course Overview
2. Structuring an Express Application
3. Working from a Requirement Specification
4. Persistence and Data Access Layers
5. Authentication and Session Handling
6. Validation, Errors, and Quality Risk
7. Testing and Integration
8. Troubleshooting a Running Service
9. Project: Extend a Service to Spec
