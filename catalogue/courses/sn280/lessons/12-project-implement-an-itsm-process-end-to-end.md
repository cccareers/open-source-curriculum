---
lesson_id: sn280-12
course_id: sn280
pathway: servicenow-implementation-specialist
title: 'Project: Implement an ITSM Process End to End'
order: 12
kind: project
competency_ids:
  - D2-S1-C01
  - D2-S1-C04
  - D2-S1-C05
  - D10-S1-C01
objectives: []
---

## The scenario

Northwind Regional Health runs a shared IT function for four hospitals and eleven clinics. Their ServiceNow instance was stood up two years ago by a partner who configured incident management and left. Everything else IT does — access requests, equipment, application support escalations — happens by email to a shared inbox, and the service desk manually creates incidents for all of it.

You are the implementation specialist assigned to their next phase. The IT director's brief:

> "Clinical application access is our worst process. A nurse manager requests access for a new clinician, it goes to the shared inbox, someone forwards it to the application team, they forward it to the security team, and sometimes it takes two weeks. Nobody can tell me where a request is. We have no idea how long it actually takes, and when the compliance auditors asked us to prove that access requests are approved by the application owner, we produced a folder of forwarded emails. Fix this one process properly, and show me a plan for the rest."

The compliance officer adds one hard requirement: every grant of clinical application access must have a recorded approval from the application's owner, and for elevated access levels, a second approval from the compliance officer. The audit evidence must be in the record, not in email.

## Goal

Deliver a working, end-to-end clinical application access request process on a ServiceNow developer instance, and the implementation roadmap that puts it in the context of the customer's next twelve months.

You will produce two things: a **configured process** that a person can run a real request through, and a **written implementation plan** that a customer's steering group could approve. Both are required. The configuration without the plan is a demo; the plan without the configuration is a proposal.

## Requirements

### Part 1 — The configured process

**Intake.** A catalog item, "Request clinical application access," in a category a nurse manager would look in, available to staff who need to request on behalf of others. Its variables must capture everything the fulfilment teams need so that no request requires a follow-up conversation: at minimum the application, the access level, the person the access is for, their department, the clinical justification, and the date access is needed by. The application must be selected from a table, not typed. The access level's options must depend on the application chosen.

**Approvals.** The application owner approves every request, sourced from the application record rather than picked by the requester or hard-coded in a flow. Elevated access levels require a second approval from the compliance officer, and this second approval must be requested only when it applies. A rejection at either stage must end the request cleanly, with the rejection reason visible to the requester.

**Fulfilment.** After approval, work is generated as tasks: the application team provisions the account, and the security team records the grant in the access register. These two are sequential — the register entry records what was actually provisioned. Where the requested application is one the customer has flagged as licensed, a license availability check must branch the flow, adding a procurement task when none is available.

**Commitment.** An SLA on the request item measuring the fulfilment commitment the customer has agreed to. Northwind's stated commitment is three business days from approval, measured against their working hours, excluding public holidays. The clock must pause while the request is waiting on the requester for missing information, and must not pause for anything else. A warning must reach the fulfilment group's manager before the commitment is breached, not after.

**Visibility.** The requester must be able to see meaningful progress on the request without contacting anyone, and a service desk agent must be able to answer "where is this request" from the record alone.

**Records.** The process must produce the right record types. Access requests are requests, not incidents. If any part of your design creates an incident, be prepared to justify it.

### Part 2 — The implementation plan

A written plan, three to five pages, that a steering group could approve. It must contain:

**Current state and target state**, stated as the ITIL practices Northwind runs and the ServiceNow tables that will support them. Be specific about what is not currently modelled at all.

**A phased roadmap** covering the next twelve months, with phases sized in weeks. Phase one is the process you built. Every subsequent phase must name what it delivers, why it comes at that point rather than earlier, and what it depends on. At minimum, address where incident improvement, change management, SLAs beyond this one process, CMDB work, and integration work fall — and justify the order.

**Delivery approach.** How the work is sequenced into iterations, what gets demonstrated at the end of each, and who the demo audience is. Define what "done" means for a phase in the customer's terms, not in configuration terms.

**Release management.** How configuration moves from the development instance to production: what is captured and how, what is tested before promotion, and what the production change record contains.

**Risks and dependencies.** At least four, each with the mitigation you propose. At least one must be a data-quality dependency and at least one must be an organizational rather than technical risk.

**Success measures.** Three to five, each measurable from platform data on the day the phase completes. "Improved efficiency" is not a measure; "percentage of access requests fulfilled within the committed three business days" is.

## Constraints

- Everything you build must be **configuration wherever configuration is possible**. Script only where a declarative mechanism genuinely cannot express the requirement, and note each instance with its justification.
- **No hard-coded users or groups** anywhere in the process. Every approver and every assignment must derive from data.
- **One derivation path per value.** Nothing that the platform derives may also be set directly by your automation.
- **One catalog item**, not one per application. A new clinical application must be addable as a data row, without touching the item or the flow.
- All work must be captured in **named update sets**, one per unit of work, each named for what it delivers.
- The instance must remain **upgradeable**: if you modify any out-of-box record, list it and justify it.
- Terminology in the plan must be release-neutral. Do not name a platform release version.

## Definition of done

The configuration is done when all of the following are demonstrably true on your instance:

1. A requester can submit the item and the resulting request item carries every variable answer needed for fulfilment.
2. The application owner's approval is requested automatically, from the application record. Changing the owner on the application record changes who is asked, with no change to the item or the flow.
3. An elevated-access request generates the compliance approval; a standard-access request does not.
4. A rejection at either approval stage ends the request with the reason visible to the requester, and no fulfilment task is created.
5. An approved request generates the provisioning task, then the register task, in that order, and the license branch demonstrably works in both directions.
6. The request item's stage reflects reality at each point, and the flow's execution context shows exactly which step a live request is on.
7. An SLA is attached with the correct schedule, and you can show the planned end time is correct for a request submitted late on a Friday. The pause works for the intended condition and does not fire for others. The warning notification demonstrably fires.
8. The whole path — submit, approve, fulfil, close — has been run at least twice: once on the happy path and once on a path involving a rejection or a failed task.
9. An automated test exists that submits the item and asserts the resulting records, and it fails when you deliberately break the flow.
10. Every artifact is in a named update set, and you can state what in your build would *not* travel in it.

The plan is done when a reader who has never seen your instance could approve or challenge the roadmap on its merits: the phases have reasons, the risks have owners and mitigations, and the success measures could be computed from platform data.

## Hints

**Start with the fulfilment design, not the flow.** Write the tasks, groups, ordering, conditions, approvals, and failure paths as a specification first. Building a flow before you know what it should do is how flows end up as one long script step.

**Derive the approver from the application, and prove it.** The demonstration that separates a good build from an adequate one is changing the owner on an application record and showing the next request goes to the new person. Design for that test.

**The elevated-access second approval is a conditional branch, not a second flow.** Use flow logic, not a duplicate item.

**Nail the SLA's ambiguities in writing before configuring.** "Three business days from approval" hides three decisions: which approval, which schedule, and what pauses the clock. Record your answers — the plan should contain them.

**One item, many applications** means the application is a lookup against a table whose records carry the owner, the license count, and the available access levels. If you find yourself adding a condition per application anywhere, the data model is wrong.

**Check what you build against the record types.** Walk your design and name the table each record lands on. If anything lands on `incident`, ask why.

**Keep the risk register honest.** The real risks at Northwind are that the application ownership data does not exist, that the security team will not accept a task-based workflow, and that the shared inbox will keep receiving requests after go-live. Technical risks are the easy ones to write and rarely the ones that sink a phase.

**Do not build past the brief.** Incident improvement, change management, and CMDB work all belong in the roadmap, not in this build. A project that quietly grows into a full ITSM implementation is a project that ships nothing on time — which is itself one of the things the roadmap exists to prevent.
