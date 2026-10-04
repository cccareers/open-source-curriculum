---
lesson_id: sn280-05
course_id: sn280
pathway: servicenow-implementation-specialist
title: Change and Release Management
order: 5
kind: lesson
competency_ids:
  - D2-S1-C01
  - D10-S1-C02
objectives:
  - Configure change management with change types, approvals, and a change schedule
---

## Change management is an approval engine with a calendar attached

Incident and problem management produce work. Change management produces a *decision*: yes, this alteration to the environment may proceed, at this time, with these people accountable. Everything you configure in this lesson exists to make that decision fast when the risk is low and careful when the risk is high.

The failure mode is a single approval path applied to everything. When a password-policy update and a core database migration go through the same three-tier CAB, one of two things happens: the CAB becomes a rubber stamp because it is drowning in trivia, or engineers route around it entirely and change the environment without records. Both outcomes destroy the practice. The configuration answer is **change types**, and getting them right is most of the work.

You also own the other half of this lesson: the ServiceNow platform is itself a system that gets changed, and the way *your* development work moves from a sub-production instance to production is a release management problem. Update sets, source control, and pipeline-driven change records are how a ServiceNow team applies its own change discipline to itself. That is the second half of this lesson, and on real engagements it is the half that gets skipped and then hurts.

## The three change types

The `change_request` table's `type` field carries three values in the baseline, and they exist to separate three genuinely different risk profiles.

**Standard change.** Pre-approved. Low risk, well understood, performed repeatedly, with a documented procedure. Adding a user to a distribution list. Applying a vendor patch on the routine cycle. Restarting a service that is known to need periodic restarts. A standard change carries **no approval at execution time**, because the approval happened once, when the change model was authorized.

This is the type customers under-use and the one that delivers the most value. Every routine change moved from Normal to Standard removes an approval cycle from a queue without removing governance — the governance moved earlier, into approving the template. Target getting the highest-volume repeated changes onto standard change models in the first phase of an implementation.

Standard changes are created from **standard change templates**, which are proposal records that go through their own approval and then become available in a catalog of pre-approved change types. Configure the template with the full procedure — implementation plan, test plan, backout plan — so the executing engineer is not improvising.

**Normal change.** The default. Requires assessment and approval before implementation. The approval path is driven by risk, and the schedule is driven by the change calendar. This is where the bulk of your configuration effort goes.

**Emergency change.** A change required immediately to restore service or prevent imminent failure — typically raised during a major incident. The distinguishing configuration is not "no approval," it is **compressed approval**: an authority who can approve in minutes, usually a single named role, with the full documentation completed after the fact. Emergency change must be a measured, reviewed path, and the number one report a customer needs on it is *emergency changes per month by team*, because a rising count means normal change is too slow and people are gaming the type field.

Configure emergency change with two guardrails: a mandatory justification field, and a post-implementation review requirement before closure. Neither slows the change down when it matters; both make abuse visible.

## Change models

Newer implementations express type-specific behavior through **change models** rather than through hard-coded type logic. A change model defines the state flow, the transitions allowed, the conditions on each transition, and the approval behavior for a class of change. The three baseline models correspond to the three types, and you can add your own — for example, a separate model for infrastructure changes that requires a CI to be populated and adds a conflict check that application changes do not need.

The value of the model abstraction is that the state machine becomes **data you can inspect and version**, rather than a web of business rules whose interactions you have to reverse-engineer. When a customer asks "why can't I move this change to Scheduled," the answer is a named transition record with a named condition on it.

Prefer configuring a new model over adding conditional logic to an existing one. Two clean models are easier to maintain and easier to explain than one model with six exceptions.

## Risk assessment

Risk drives approvals, so risk has to be derived rather than asserted. Three mechanisms, in increasing order of maturity:

**Manual selection.** The requester picks a risk value. Fast to configure, worthless as a control, because everyone picks Low. Use only as a temporary state during a phased rollout.

**Risk assessment questionnaire.** A set of questions attached to the change, with weighted answers that compute a risk score, which maps to a risk value. This is the standard approach and it is worth the configuration effort: the questions become the organization's written definition of risk, and the score is defensible in an audit. Keep the questionnaire short — six to eight questions — and make each one something the requester can answer without research. "Does this change affect a service with a 24x7 availability commitment?" is answerable. "What is the expected blast radius?" is not.

**CI-derived risk.** The affected configuration item's criticality and its downstream dependencies feed the risk calculation. This is the most accurate mechanism and it depends entirely on CMDB quality, which lesson 10 addresses. Design the questionnaire so a CI-derived factor can be added to it later without redesigning the whole model.

Whatever mechanism you use, **the risk value must be recomputed when the change is edited**. A change assessed as low risk that later has a production database added to its CI list is no longer low risk, and if the approval already completed you have a governance hole.

## Approvals

The `approval` field on `task` and the `sysapproval_approver` records behind it are the mechanism. The configuration question is who gets asked, and it should be answered by rule rather than by the requester choosing.

Common approval sources, which are usually combined:

- **Group approval by risk.** High-risk normal changes go to the CAB group; moderate and low go to the assignment group's manager. Configure as an approval step conditioned on `risk`.
- **CI owner or support group approval.** Anyone whose service is affected gets a say. This is the approval customers most often want and most often cannot implement, because it requires CI ownership data.
- **Line management approval.** Derived from the requester's `manager` field on `sys_user`, not from a picked value.

Two rules to hold firm on:

**Approvals should be group-based, not person-based**, so a change is not blocked by one person's leave. Where a named individual is genuinely required, configure a delegate.

**Rejection must have a reason and a route.** A rejected change that simply stops is a dead record. Configure rejection to return the change to Assess with the rejection comments visible, so it can be revised and resubmitted rather than recreated.

The **CAB workbench** is the tooling for the meeting itself: an agenda built from changes awaiting authorization in a defined window, attendee tracking, and in-meeting decision recording. Configure the CAB definition with its schedule, its members, and the filter that decides which changes appear on the agenda. The filter is the important part — a CAB agenda that includes every change is the rubber-stamp failure mode again.

## The change schedule

Approval answers *whether*. The schedule answers *when*, and it is enforced by three mechanisms.

**Maintenance windows** are the periods during which change to a given CI or service is permitted. They are `cmn_schedule` records associated with the CI. A change whose planned start falls outside the window on its CI should be flagged.

**Blackout windows** are the inverse — periods during which change is forbidden. Retail organizations freeze in November; finance organizations freeze at quarter close. Configure these as schedules too, and configure the change form to warn when a planned window overlaps one.

**Conflict detection** is the platform's check for collisions: two changes touching the same CI at the same time, a change scheduled outside its CI's maintenance window, a change scheduled inside a blackout, or a change on a CI whose parent service has another change in flight. Conflict detection runs against the planned start and end dates and produces conflict records on the change.

The configuration decision customers ask about: **should a conflict block scheduling, or warn?** Block for blackout violations, which are policy. Warn for CI collisions, which are frequently legitimate — two teams may deliberately batch work into one outage window. A hard block on collisions trains people to lie about their planned dates, which corrupts the calendar you built the whole mechanism to protect.

The **change calendar** view is what makes any of this usable. Configure it with the filters the customer's change manager actually reviews: by service, by team, by risk. A calendar nobody opens is not a control.

## Change tasks

Implementation work lives on `change_task`, which extends `task` and carries a `change_task_type` — planning, implementation, testing, review. The same rationale as problem tasks: the change is one accountable record, the work is many assignable pieces across teams.

Configure change tasks so that the change cannot move to Review while implementation tasks are open, and so that a failed implementation task is visible on the parent rather than silently closed. Where the same set of tasks recurs — a standard change model always generating the same four tasks — generate them from the model rather than expecting the requester to build them by hand.

## Release management on the platform itself

Everything above governs change to the customer's environment. Now the other side: how *your* ServiceNow configuration moves between instances, and how that movement gets the same discipline.

**Update sets** are the platform's native change-capture mechanism. An update set is a collection of customization records — business rules, UI policies, tables, fields, client scripts — captured as you work, exported as XML, and committed on a target instance. The rules that keep them safe:

- **One update set per unit of work.** Named for the story or change it implements, not "Dev Work March." An update set you cannot describe in one sentence is one you cannot review or back out.
- **Set your current update set before you start.** Work captured into the default set is work you will hand-migrate later.
- **Data does not travel.** Update sets capture configuration, not table data. The line is not always where you expect: choice lists and catalog item definitions (including their variables) are captured as configuration, but data lookup rows such as the priority matrix in `dl_u_priority`, groups and group memberships, schedules' holiday entries, and most reference records are data. Check each table before you rely on it, and move data deliberately — by adding the record to the update set from its context menu, or by an XML export and import. Assuming data travels is the most common migration failure.
- **Batch related sets** so dependent changes commit together and in order.
- **Preview before commit, always,** and read the collisions rather than skipping them. A collision means the target instance has a newer version of a record you are about to overwrite.

**Source control** is the more mature path, and for scoped applications it is the right default. A scoped application can be linked to a Git repository, with the application's records serialized as files, committed on branches, and applied to another instance by importing the application from source control at a chosen branch or tag. What this buys you over update sets:

- Real branching, so two developers can work on the same application without one blocking the other.
- Diffs and pull requests, so configuration changes get code review.
- Tags, so a release is an identifiable, reproducible point rather than a set of XML files in someone's downloads folder.

The trade-off is that source control operates at application scope. Global-scope customizations still travel by update set. On most implementations you will use both, and the discipline is to know which artifacts live where.

**Automated testing** belongs in this pipeline. The Automated Test Framework lets you record and script tests against forms, lists, and server-side behavior, and run them as a suite. The release-management value is running the suite on the target instance *before* committing an update set or after applying an application version, so a regression is caught by the pipeline rather than by the service desk. Configure at minimum a smoke suite covering the process paths you built: log an incident, submit a catalog item, approve a change.

**Change records for platform releases.** This is where the two halves of the lesson meet. A ServiceNow deployment to production is a change to the environment, and it should have a `change_request` like any other. The mature configuration creates that change record automatically from the pipeline, populating it with the commit or update-set identifier, the test results, and the affected application — so the approver is reading evidence rather than a promise. Where the customer runs a DevOps toolchain, the platform's DevOps capability can register pipeline steps as change requests and auto-approve those meeting defined policy criteria, turning the change gate into a control that runs at pipeline speed instead of a meeting that runs weekly.

Even without that tooling, insist on the principle: **platform releases go through change management.** An implementation team that exempts itself from the process it is building has no standing to enforce it on anyone else.

## Worked example: a routine patch, moved to standard

A customer applies operating-system patches to forty application servers every month. Today each one is a normal change, each gets CAB review, and the CAB spends half its meeting on them.

The configuration:

1. **Write the procedure.** Implementation plan, test plan, backout plan — the actual runbook the engineers already follow, written down. This is the deliverable the approval is about.

2. **Create a standard change template** carrying that procedure, with `category`, `assignment_group`, and the change tasks pre-populated. Submit it as a standard change proposal.

3. **Approve the template once,** through the CAB. The CAB is now approving a *class* of change, with the procedure in front of it, which is a far better use of its time than approving forty instances of it.

4. **Constrain the scope.** The template applies to application servers on the routine patch cycle. Anything outside that — a server hosting a payment service, an out-of-cycle emergency patch — is explicitly excluded and remains a normal change. Write the exclusion into the template's description so an engineer choosing it knows the boundary.

5. **Schedule.** The patches run inside the existing monthly maintenance window on those CIs, so conflict detection stays meaningful. Blackout periods still apply and still block.

6. **Measure.** Report standard change volume and standard change failure rate monthly. If the failure rate rises, the template is wrong or the scope is too broad, and it goes back to CAB. That review is the governance that replaced the per-instance approval.

The result: forty approvals per month become zero, the CAB gets its meeting back, and governance is stronger than before, because there is now a written, approved, reviewed procedure where previously there were forty individually approved improvisations.

## Practice

Work in a personal developer instance.

1. **Types.** Create one change of each type — standard, normal, emergency — and document, for each, exactly which approvals were requested and at which state. Explain in two sentences what the emergency change did *not* skip.

2. **Standard change template.** Build a standard change template for a routine task of your choosing, including implementation, test, and backout plans, and at least two pre-populated change tasks. Submit it through the proposal path and create a change from it. Confirm the resulting change requires no approval.

3. **Risk questionnaire.** Configure a risk assessment with at least five weighted questions that computes a risk value. Submit two changes with different answers and confirm they land on different risk values. Then write the one question you would add if the CMDB were trustworthy, and why you did not add it today.

4. **Approvals by risk.** Configure the approval path so high-risk normal changes route to a CAB group and lower-risk ones route to the requester's manager. Test both branches. Then reject one change and describe what a requester has to do to get it moving again — if the answer is "create a new change," fix the configuration.

5. **Schedule and conflicts.** Define a maintenance window on a configuration item and a blackout schedule covering a week. Create three changes: one inside the window, one outside it, one inside the blackout. Record what the platform did for each. Then state your recommendation on block-versus-warn for each of the two conditions, with a reason.

6. **Change tasks.** Configure a normal change so it cannot reach Review while an implementation task is open. Test it by trying.

7. **Update set discipline.** Do items 2 through 6 inside a single named update set. Then export it, inspect the XML, and list every artifact you built that did **not** travel in it. For each, write how you would move it to another instance.

8. **Release gate.** Write a one-page plan describing how a change to this ITSM configuration would move from a development instance to production at this customer: what is captured in an update set, what would live in a source-controlled scoped application, what automated tests gate the promotion, and what the production change record contains so that an approver can decide from evidence.
