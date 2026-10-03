---
lesson_id: sn102-07
course_id: sn102
pathway: servicenow-implementation-specialist
title: A Tour of CSM, HRSD, and GRC
order: 7
kind: lesson
competency_ids:
  - D3-S1-C01
  - D4-S1-C01
objectives:
  - Describe what the CSM, HRSD, and GRC applications do and which business problem each one solves
---

## Same platform, different customer

You have now seen IT Service Management. The natural question is what the rest of the product families are, and the honest answer is that they are the same machinery pointed at a different audience.

Every application in this lesson uses the tables, roles, access control, and automation you have already met. What changes between them is three things: **who the customer is**, **what confidentiality that customer's data demands**, and **what the process is trying to produce**. Keep those three questions in front of you and each application explains itself.

| Application | Who is served | Record | Front door |
| --- | --- | --- | --- |
| ITSM | Employees, about IT | Incident, Change, Request | Employee Center / service desk |
| CSM | External customers | Case | Customer portal, phone, email, chat |
| HRSD | Employees, about HR | HR Case | Employee Center |
| GRC | The organization itself | Risk, Control, Issue, Audit | Internal workspaces |

This lesson is a tour, exactly like the last one. You will learn to recognize each application, name its central record, and say which business problem it solves. You will not configure any of them. Case-management configuration, HR case and knowledge configuration, and risk-framework setup are each substantial courses later in this pathway.

## Customer Service Management

**The problem it solves:** an organization sells something to people outside the company, and those people need help. Their issues arrive through many channels, they cross internal team boundaries, and the company is contractually and reputationally on the hook for how fast they are resolved.

**The central record:** the **case**. It extends `task` through the customer service application's own table, so it inherits number, state, priority, assignment group, and work notes, and adds fields about the outside party.

The reason CSM is not just ITSM with different labels is that **the requester is not an employee**. That single fact reshapes the data model. An incident's caller is a row in `sys_user` inside your own company. A case's requester is a **contact** who belongs to an **account** — an external company you have a relationship with. Accounts can have hierarchies, because a customer may be a parent company with subsidiaries and sites. Cases can be tied to **products**, **assets**, **entitlements**, and **contracts**, because whether someone is entitled to support, and at what service level, is a commercial question with a contract behind it.

A second structural idea is the **interaction**. A case is the unit of work; an interaction is a unit of *contact* — a phone call, a chat session, an inbound email, a message from a social channel. Interactions matter because they do not map one-to-one with cases. One phone call may produce two cases. Three chats may relate to one case. Tracking them separately lets a company answer "how many times did this customer have to reach out?", which is the question that actually predicts customer churn.

Around those two records sit the pieces you would expect: a **customer portal** where contacts raise and follow cases, **omni-channel** routing that puts work in front of the right agent, **Virtual Agent** for automated first contact, a **knowledge base** with articles that may be public or internal, and an agent workspace that shows the case, the contact, the account, and the history in one screen. Cases can spawn **case tasks** for internal teams, which is how a customer-facing agent gets help from engineering without handing the customer over.

The measures CSM is judged on are different from ITSM's, and the difference is instructive: time to first response, case resolution time, self-service deflection, and customer satisfaction.

## HR Service Delivery

**The problem it solves:** employees have questions and needs that are not IT — about pay, benefits, leave, policy, their manager, their own onboarding — and answering them by email to a shared HR mailbox is slow, untraceable, and unsafe.

**The central record:** the **HR case**. Again a `task` descendant, again with its own additions.

Two things make HRSD structurally distinct from everything else on this tour.

The first is **confidentiality**. Some HR cases are ordinary — "how many holiday days do I have left?" Others involve pay disputes, medical accommodation, or a complaint about a manager, and the wrong person seeing one is a serious incident in its own right. HRSD therefore layers additional protection on top of normal access control: **HR services** are categorized, sensitive categories are restricted to specific HR roles, cases can be marked confidential, and case *subject person* is separated from case *opened by* so that a manager can raise a case about an employee without gaining access to that employee's other cases. When you get to the HRSD course, most of the configuration effort is about this. Recognize now that it is the defining constraint.

The second is that HR work is **service-catalog-shaped**. HRSD organizes what it offers into **HR services** — "request an employment verification letter," "report a change of address," "ask about parental leave" — arranged into **COE** (centre of excellence) groupings such as Benefits, Payroll, Employee Relations, and Talent. Each HR service defines who fulfills it, what information is needed, and what the target response time is. An employee never picks a record type; they pick a service, and the platform creates the right case.

**HR knowledge** is a first-class part of the application rather than an afterthought. Policy documents, benefits summaries, and how-to guides live in HR knowledge bases with their own audience restrictions — some articles are for everyone, some for managers only, some for one country's employees because employment law differs. Deflection matters here even more than in IT, because most HR questions genuinely are answered by a policy that already exists.

A third piece to recognize is **lifecycle events**: onboarding, transfer, leave of absence, offboarding. These are the multi-step, multi-department journeys that HRSD exists to coordinate. Onboarding a new employee means HR collects documents, IT provisions accounts and a laptop, facilities issues a badge and a desk, and payroll sets them up — four departments, one date, and a very unhappy new starter if any one of them is missed. In the platform this is a set of activities generated from a template and tracked to completion, and it is the clearest example anywhere of why a single platform underneath HR and IT is worth having.

The employee-facing front door for all of this is **Employee Center**, a portal that presents HR services, IT services, knowledge, and announcements together, so the employee does not have to know which department owns their question.

## Governance, Risk, and Compliance

**The problem it solves:** the organization is subject to regulation, contractual obligations, and its own policies. It must be able to demonstrate — to an auditor, a regulator, or a customer — that it knows what could go wrong, that it has controls in place, that the controls actually work, and that the failures it found were fixed.

GRC is the odd one out on this tour, and it is worth naming why. ITSM, CSM, and HRSD all serve a *person* who wants something. GRC serves the organization. Nobody files a GRC case. The records exist to hold evidence over time.

The main record types:

- **Policy** — a written statement of what the organization requires, with an owner and a review cycle.
- **Risk** — something that could go wrong, scored for likelihood and impact, with an owner and a treatment plan. Risks live in a **risk register**.
- **Control** — a specific safeguard intended to reduce a risk. "Privileged access is reviewed quarterly" is a control.
- **Control test** or attestation — evidence, gathered on a schedule, that the control was actually operating.
- **Issue** — a control that failed a test or a gap someone found, with remediation tasks beneath it.
- **Audit engagement** — a scoped review, with its own tasks and findings.
- **Authority document** and **citation** — the external regulation or standard, broken into the individual requirements a control can be mapped to.

The relationships between these matter more than any single record. An authority document's citations map to controls; controls map to risks; risks map to entities in the business; failed control tests become issues; issues generate remediation work. The value of doing this on a platform rather than in spreadsheets is that one control can satisfy citations in several frameworks at once, so evidence is collected once and reported many times.

GRC also connects back to what you saw in the previous lesson. Change management is itself a control that auditors test. So is access review, which is why the access-control lesson and this one are related. Some organizations run their access certification campaigns directly on the platform for exactly this reason.

## What is genuinely shared

Step back and notice how little each application had to invent.

All of the case-like records extend `task`. All of them use `sys_user`, `sys_user_group`, and roles. All of them are protected by ACLs. All of them use the same knowledge management engine, with different knowledge bases and different audiences. All of them use the same notification engine, the same assignment and SLA machinery, the same reporting, and the same automation tooling you meet in the next lesson. All of them are presented through portals and workspaces built on the same interface layer.

What differs is the **audience model** — internal user, external contact under an account, employee with a confidentiality boundary, or no requester at all — and the **process outcome**: restore service, satisfy a customer, answer an employee, or prove a control works.

That is the whole of the survey. When you are handed an unfamiliar ServiceNow application in three years, these are the two questions to ask first.

## Practice

Use a personal developer instance. Some applications may not be installed on a plain instance; where an application is absent, answer from the lesson and note that you could not observe it. Observe only — do not configure.

1. **Name the record.** For each scenario, state which application owns it and what the central record would be called: (a) a customer of your company reports that the product they bought arrived damaged; (b) an employee asks how to add a newborn to their health insurance; (c) an auditor asks for evidence that privileged accounts were reviewed last quarter; (d) an employee's laptop will not connect to the network; (e) a new employee starts in two weeks and needs a badge, a laptop, and a payroll record; (f) a customer's support contract is about to expire and they have raised a case anyway.

2. **Contrast the requesters.** Write a short table comparing the requester on an incident, a customer service case, and an HR case. For each, state which table the requester record lives in, what else the platform knows about them, and one consequence for access control.

3. **Interaction versus case.** In two or three sentences, explain why CSM tracks interactions separately from cases, and give one business question that can only be answered if you have both.

4. **Confidentiality walkthrough.** Describe, in a short paragraph each, three HR cases that should have different visibility: one that any HR agent may read, one restricted to a specific HR team, and one that only two named people should ever see. For each, say which mechanism from the access-control lesson you would expect the HRSD course to use.

5. **Map a control.** Pick a rule your own household or workplace follows — for example, "the alarm is set every night." Write it as a GRC set: the risk it addresses, the control statement, how you would test the control, what an issue would look like if the test failed, and what the remediation task would be. Five short lines.

6. **Find the shared machinery.** In the instance, open a knowledge base list and note how many knowledge bases exist and who each is for. Then open the group list and identify at least one group that clearly belongs to a non-IT function. Write one paragraph on what this tells you about how much of the platform each application actually reuses.
