---
lesson_id: sn301-01
course_id: sn301
pathway: servicenow-implementation-specialist
title: Course Overview
order: 1
kind: overview
competency_ids: []
objectives: []
---

## Description

ServiceNow instances change constantly. You push an update set on Tuesday, someone else pushes one on Wednesday, and twice a year the platform itself moves to a new family release underneath everything you built. Every one of those changes can quietly break a form, a flow, or a catalog item that worked yesterday. Clicking through the same twenty screens by hand to find out is slow, boring, and the first thing that gets skipped when a deadline arrives.

This course teaches you to use the Automated Test Framework, the testing tool built into the platform, so that the checking happens for you. You will build a test out of shipped test steps, assert that the results are what you expected, make the test clean up the records it created, and then group tests into suites you can run on a schedule or from a browser with the client test runner.

The course is written for an implementer, not for a QA organization. You will not be asked to design a test strategy, write unit tests, or run load tests. You will be asked to build tests that a working configuration specialist actually maintains, and to place those tests correctly in an update set, UAT, and upgrade cycle. Everything you build should be done on a sub-production instance you are allowed to break.

## Objectives

- Explain what automated testing protects on a platform that changes with every upgrade
- Build an ATF test with steps, assertions, and test data that cleans up after itself
- Organize tests into suites and run them on a schedule with the client test runner
- Fit automated tests into an update set, UAT, and upgrade cycle

## Prerequisite Knowledge

- sn102 Introduction to ServiceNow Platform
- sn201 Application Development Fundamentals (ADF), or equivalent configuration experience

## Course Content

1. Course Overview
2. Why Automated Testing Belongs in Platform Work
3. Building Your First ATF Test
4. Test Suites, Scheduling, and the Client Test Runner
5. Testing Through Change and Upgrade Cycles
6. Project: Regression Suite for a Catalog Item
