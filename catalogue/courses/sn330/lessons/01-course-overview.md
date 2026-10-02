---
lesson_id: sn330-01
course_id: sn330
pathway: servicenow-implementation-specialist
title: Course Overview
order: 1
kind: overview
competency_ids: []
objectives: []
---

## Description

HR Service Delivery is the part of the platform where the work is the most ordinary and the data is the most sensitive. An employee asking for a copy of an employment verification letter and an employee filing a harassment complaint both arrive as HR cases, and the implementation you build has to route the first one to a shared service desk while making sure the second one is invisible to almost everyone. That tension — self-service convenience on one side, hard access boundaries on the other — is what makes HRSD its own discipline rather than a relabeled version of incident management.

In this course you configure a working HR Service Delivery implementation from the data model up. You start with the scoped application structure and the HR service catalog that gives every request a subject, an owner, and a home table. From there you build HR cases with templates and assignment, scope a knowledge base so employees only see policies that apply to them, publish it all through the Employee Center, and then orchestrate the many-moving-parts work — onboarding, offboarding, transfers — as lifecycle events driven by Flow Designer.

The last third of the course is about the parts that keep an implementation out of trouble. You apply access controls and privacy practices against real HR tables and real profile data rather than as an afterthought, and you connect HRSD to an upstream HRIS with import sets, transform maps, and the error handling that a nightly worker feed genuinely needs. You finish by implementing an onboarding service end to end, which is the assembly of everything the earlier lessons taught in isolation.

## Objectives

- Describe HRSD's scoped application structure and how HR services, COEs, and scoped data separation work
- Configure HR cases, templates, and assignment so requests reach the right HR team
- Configure scoped HR knowledge bases so employees see only the articles that apply to them
- Configure the Employee Center so employees can serve themselves without contacting HR directly
- Design a lifecycle event that coordinates onboarding or offboarding activities across departments
- Automate an HR process with Flow Designer, including approvals and notifications
- Apply access controls and data-privacy practices that keep sensitive HR data restricted
- Integrate HRSD with an HRIS or payroll system using import sets, transform maps, and error handling

## Prerequisite Knowledge

- sn102 Introduction to ServiceNow Platform
- sn201 Application Development Fundamentals (ADF)
- sn250 Scripting in ServiceNow
- sn290 Service Portal Fundamentals

## Course Content

1. Course Overview
2. HRSD Architecture and HR Services
3. HR Case Management Configuration
4. HR Knowledge Management
5. Employee Center and HR Portal Configuration
6. Lifecycle Events: Onboarding and Offboarding
7. Automating HR Workflows
8. Data Privacy, Security, and Compliance in HR
9. Integrating HRSD with HRIS and Payroll
10. Project: Implement an HR Onboarding Service
