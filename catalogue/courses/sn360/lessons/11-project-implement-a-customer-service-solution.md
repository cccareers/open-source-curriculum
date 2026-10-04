---
lesson_id: sn360-11
course_id: sn360
pathway: servicenow-implementation-specialist
title: 'Project: Implement a Customer Service Solution'
order: 11
kind: project
competency_ids:
  - D3-S1-C01
  - D3-S1-C02
  - D3-S1-C04
objectives: []
---

## The brief

Meridian Instruments sells laboratory analyzers to hospitals and research labs. It is a separate fictional business from Meridian Logistics in the HRSD course. This capstone uses a fresh analyzer supplier and its hospital customers; Northwind Manufacturing remains the industrial-controller customer in the worked lessons and supplemental projects. Reuse configuration patterns, but build this client's own accounts, contacts, analyzer models, and installed products. They have bought ServiceNow CSM and you are the implementation specialist on a short first phase. Their current support process is a shared mailbox, a spreadsheet of contracts, and one very tired team lead who assigns everything by hand each morning.

You have their agreement on three outcomes for phase one:

1. Cases follow a defined lifecycle instead of living in a mailbox.
2. Their customers can see and progress their own cases without emailing anyone.
3. Cases reach the right team automatically, and nothing sits unassigned.

Your job is to deliver a working configuration in a personal developer instance that demonstrates all three, and a short handover document that a colleague could pick up.

**What Meridian told you about their business.** Their customers are institutions, not individuals — a hospital is the customer, and several named staff at that hospital contact support. Large hospital groups buy centrally and expect the group's coordinator to see cases raised by any of their sites. Analyzers are serialized and installed on site; the model matters, because the chemistry analyzers and the imaging analyzers are supported by different engineering teams. Cases fall into three recognizable kinds: a fault with an instrument, a question about how to use one, and a request for a consumable or replacement part. Faults reported by a site that is running clinical work are more urgent than the same fault at a research lab, and Meridian's support leadership has agreed that urgency is a property of the case, not of how large the customer is.

## Goal

Deliver a demonstrable CSM configuration for Meridian covering case management, the customer-facing portal, and automated routing — built on the customer data model, and defensible in a design review.

## Requirements

**A. Customer and case foundation**

- Model at least two hospital groups, one with two child sites and one standalone, with a minimum of four contacts distributed across them. At least one contact must have visibility of every case in their group.
- Model two analyzer product models and at least four installed products spread across the sites.
- Configure the three case types Meridian described, with a form that shows the fields each type actually needs and hides the ones it does not.
- Configure the case lifecycle: the states, the legal transitions between them, the conditions on each transition, and terminal behavior. Resolution must require a resolution code and notes. A case must not resolve while dependent work is open. Resolved cases must close automatically after a defined quiet period, with the customer notified before it happens.
- Stamp the origin channel on every case, whatever path created it.

**B. The customer-facing portal**

- Deliver a branded customer service portal built from the shipped one, not from an empty portal record.
- A home page that leads with search, shows the signed-in contact's open cases, and offers no more than four top tasks.
- A case list and case detail experience showing customer-facing status wording, the conversation, attachments, and a control that returns a resolved case to open when the customer says it is not fixed.
- A create-case form that requires the installed product, restricted to the install base of the contact's own account, and that searches knowledge as the customer types.
- Access controls proving that a contact sees their own cases, that a group coordinator sees their group's cases, and that no contact can reach another customer's case — including by manipulating a record id directly rather than through a link.

**C. Automated routing**

- Cases reach an owner with no human triage step. Chemistry analyzer faults and imaging analyzer faults must reach different teams, and questions and part requests must not land in the fault queues.
- Urgency must influence the order in which work is offered or listed, using Meridian's stated rule that urgency belongs to the case rather than to the customer's size.
- Nothing may fail to route. Demonstrate what happens to a case that matches no specific rule or queue, and to work that no eligible person is available for.
- Show the routing working end to end from a case created on the portal, not only from a case created in the platform UI.

**D. Handover**

- A design note of no more than three pages, naming Meridian Instruments and the hospital customers modeled for this build: the customer model, the lifecycle diagram with conditions on the transitions, the routing design, the access model, and a list of every decision you made that Meridian would need to confirm.

## Constraints

- **Configuration over code.** Script only where a declarative mechanism genuinely cannot express the rule, and justify each script in the design note in one sentence.
- **Server-side enforcement.** Every business rule that protects data integrity must hold when the record is written from the portal, from a script, and from a REST call — not only from the agent form.
- **Do not extend the case table.** Case types are configuration, not subclasses.
- **Stay in scope.** Field Service Management, Order Management, and playbooks are out. If a requirement seems to need one, model the boundary and say so in the design note rather than installing another application.
- **Release-neutral.** Build with the platform capabilities taught in this course. Do not depend on a feature whose behavior you cannot demonstrate in your own instance.
- **No customer data invented into a knowledge article or notification.** Anything customer-facing you write must be text you would be comfortable sending.
- **Time-boxed.** This is a phase one. A partial requirement delivered well and documented honestly beats every requirement half-built.

## Definition of done

You are finished when every one of these is demonstrably true in your instance:

1. A contact at a child site can sign in to the portal, create a case against one of their own installed products, and see it in their case list.
2. That case carries the correct account, installed product, case type, and channel with no manual correction.
3. The case is assigned automatically to the team that matches its product and type, and you can show the mechanism that made the decision.
4. A case that matches no specific routing condition still reaches a defined owner, and you can show where it went.
5. The group coordinator can see that case; a contact from the other hospital group cannot, and cannot retrieve it by record id either.
6. An agent cannot resolve the case without a resolution code and notes, and cannot resolve it while a dependent task is open — verified from outside the form as well as inside it.
7. Moving the case to the customer-waiting state requires a customer-visible comment, and the customer sees it on the portal in customer-facing wording.
8. The customer can reopen the resolved case from the portal, and the case returns to an open state with resolution fields cleared.
9. A resolved case left alone closes automatically after the configured period, and the customer received a notification before it happened.
10. The design note exists, is under three pages, identifies Meridian Instruments and its hospital customer population, and lists at least five decisions requiring Meridian's confirmation.

## Hints

**Build in the order the records depend on each other.** Accounts, then contacts, then models, then install base, then cases. Every hour spent on the portal before the data model is right is an hour you will spend again.

**Write the transition table before you configure anything.** Rows are the from-state, columns the to-state, cells the condition. It takes ten minutes and it will show you two transitions your process forgot.

**Test every rule twice.** Once from the form, once from a background script or REST call. The second test is the one that finds client-side validation masquerading as a business rule.

**Impersonation is not optional.** Impersonate all four contacts and walk the entire portal each time. Most access-control defects are invisible from an admin session, which is the only session you will otherwise use.

**Try to break your own access model deliberately.** Take a case id belonging to one group, sign in as the other group's contact, and try to open it directly. If it opens, your filter is doing work your access control should be doing.

**Do not over-engineer routing.** Meridian's requirement is satisfiable with declarative group assignment. Reach for the push-based engine only if you can name a requirement it satisfies that the simpler mechanism cannot — and if you do, configure the no-eligible-agent path before you demonstrate anything.

**Urgency is the trap.** The obvious implementation is to drive priority from the account. Meridian explicitly said urgency belongs to the case. Keep the customer's importance and the case's severity as separate inputs, and be ready to explain the difference in the design review.

**Write the design note as you go.** The decisions you would need Meridian to confirm are obvious at the moment you make them and invisible two days later.

**When something in the brief is ambiguous, do not guess silently.** Choose the reading you can defend, implement it, and record it as a decision requiring confirmation. That habit — visible assumptions rather than hidden ones — is the single most valued thing an implementation specialist does on a real engagement.
