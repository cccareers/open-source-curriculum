---
lesson_id: sn330-03
course_id: sn330
pathway: servicenow-implementation-specialist
title: HR Case Management Configuration
order: 3
kind: lesson
competency_ids:
  - D4-S1-C01
objectives:
  - Configure HR cases, templates, and assignment so requests reach the right HR team
---

## What a well-configured HR case looks like

An HR case is the unit of HR work. It is created when someone needs something from HR, it carries the context needed to do that work, and it closes when the employee's need is met — not when the agent stops looking at it.

Before configuring anything, it is worth being precise about what "well configured" means, because it is measurable:

- The case arrives at the right team without a human reading it and re-routing it.
- Its initial values — category, service, priority, assignment, due date — are stamped by configuration, not typed by an agent.
- Its work is broken into tasks that different people can do in parallel where the process allows it.
- The employee can see the state and the agent's employee-facing updates without calling anyone.
- Its closure is recorded in a way that a report can distinguish "resolved" from "gave up."

Every configuration object in this lesson exists to move an implementation toward one of those five properties.

## The people on a case

Recall from the architecture lesson that an HR case distinguishes several person references. This is not pedantry; almost every other configuration depends on it.

**Subject person** (frequently labeled "opened for") is who the case is *about*. This drives eligibility, which knowledge is relevant, whose HR profile is in context, and — critically — access control. If a case is about Priya, Priya's manager may have a legitimate claim to see some of it, and Priya herself certainly does.

**Opened by** is who created the record. Often the same as the subject. Often not: an HR agent creating a case from a phone call, a manager submitting for a report, an integration creating cases in bulk.

**Assigned to / assignment group** is who works it.

**Watch list and additional stakeholders** may include people with a legitimate interest — a hiring manager on an onboarding case, for example — but note that adding someone to a watch list should not be a back door around ACLs. Configure notifications and access deliberately rather than letting the watch list become the security model.

A rule to internalize: **when you write any condition, script, or criterion on a case, decide explicitly whether it should evaluate against the subject person or the logged-in user.** Write the answer in a comment. Most defects in HR case configuration are this question answered by accident.

## The case lifecycle

HR cases move through a state model. The exact labels vary by implementation, but a workable baseline looks like this:

**New** — created, not yet picked up. The clock is running.

**In progress** — an agent is working it.

**Awaiting info** — blocked on the employee. This state exists so your SLA can pause; without it, agents are penalized for employees who do not answer.

**Awaiting acceptance / resolved** — HR believes the work is done and has told the employee. The employee can accept or push back.

**Closed complete / closed incomplete** — final. The distinction matters: "closed incomplete" covers withdrawn requests, duplicates, and requests HR could not fulfill, and separating them keeps your fulfillment metrics honest.

Three design cautions:

**Do not invent extra states to represent sub-status.** "Awaiting legal review," "awaiting payroll," and "awaiting background check" are not states of the case; they are open tasks on the case. If you model them as states you will end up with a twenty-state model that no report can summarize and no agent can remember.

**Guard the transitions, do not just list them.** Decide which states an agent can move a case to directly and which require something else to happen first. A case with open mandatory tasks should not be closable; enforce that in configuration rather than in training.

**Auto-close deliberately.** Resolved cases that sit unaccepted need a rule — commonly, auto-close after a set number of days with a notification first. Decide the number with the HR stakeholder and write it down; it will be asked about in every audit.

## HR templates: stamping the case

An **HR template** is a saved set of field values applied to a new case. This is where "the agent should not have to type this" gets implemented.

A useful template typically sets:

- Short description and, where helpful, a starting description skeleton.
- HR service and category.
- Assignment group, and sometimes assigned-to when a service is genuinely owned by one person.
- Priority or impact defaults.
- The activity set or task set to generate.
- Any COE-specific fields that always take the same value for this service.

Templates attach in two main ways. A template linked to an **HR service** is applied whenever a case is created for that service, which is the primary path for self-service requests. A template applied **manually by an agent** covers the phone-call path, where the agent identifies the request type after the conversation starts.

Design guidance that saves rework later:

**One template per service, not one template per permutation.** If the difference between two templates is a single field that depends on the employee's country, that field belongs in a rule or a flow, not in a second template you have to maintain.

**Do not stamp values that will be wrong more than occasionally.** A template that sets priority to high because *this* request is usually urgent will train agents to change it every time, and then they will forget to change it when it matters. Stamp what is reliably true.

**Templates are not a substitute for required fields.** If an agent must capture the employee's last working day, make it mandatory on the form for that service. A blank template field is not a prompt.

## Tasks: breaking the work up

An HR case that needs more than one person, more than one system, or more than one step should generate **HR tasks**. A task carries its own assignment group, its own state, its own due date, and its own short description, and it rolls up to the parent case.

The value of tasks is not bookkeeping. It is three things:

**Parallelism.** Equipment ordering, account provisioning, and badge photography for a new hire have no dependency on each other. As tasks they proceed simultaneously; as case states they proceed one at a time.

**Cross-team work without cross-team access.** A facilities task assigned to the facilities group can be worked by facilities staff who have no read access to the HR case at all. This is the mechanism by which "coordinate across departments" is achieved without leaking HR data — the task carries only what facilities needs.

**Honest completion.** The case cannot be closed while a mandatory task is open, so "closed" starts to mean something.

Configure tasks as reusable **task templates** grouped into an **activity set** or task set attached to the service, so that creating the case creates the right tasks automatically. Set due dates relative to something meaningful — the case's due date, or a lifecycle event's start date — rather than as fixed absolute dates.

A distinction worth being careful about: a task is *internal work*. If what you need is information from the employee, that is either a form variable captured up front, a case comment exchange, or (in a lifecycle event) an employee-facing activity. Assigning an HR task to the employee themselves usually means you have modeled the wrong object.

## Assignment: getting the case to the right team

Assignment is where an implementation is judged. If HR agents spend their mornings re-routing cases, nothing else you configured matters.

There are four mechanisms, and a good implementation uses them in this order of preference.

**1. Assignment by HR service.** The service knows its COE and its owning group. If the employee picked "employment verification letter," the case should already be assigned to the shared services group before anyone looks at it. This should handle the large majority of your volume, and if it does not, your service catalog is too coarse — go back and split it.

**2. Assignment by attribute of the subject person.** Many HR organizations are regionally structured: EMEA cases go to the EMEA team, APAC to the APAC team. Express this as a rule that reads the subject person's HR profile (work country, region, business unit) and selects among the groups for that service. Prefer a small data-driven mapping table — region to group — over a script with a chain of conditions, because HR stakeholders can maintain the table and cannot maintain the script.

**3. Assignment by workload or round robin within a group.** Assigning to a *group* is usually enough; individual assignment can be left to the team's own pull model. Where an implementation genuinely needs individual auto-assignment, use the platform's assignment/allocation capability rather than a home-grown script, and make sure it respects agent availability.

**4. Manual triage.** Reserve this for the genuine general-inquiry bucket. Measure it. If more than a modest fraction of cases land in triage, that fraction is a backlog of missing services.

Two things that are *not* assignment mechanisms, though they get misused as such:

- **Approval routing.** An approver is not an assignee. Keep them separate or your queue metrics become meaningless.
- **The watch list.** Interest is not ownership.

### A note on skills and coverage

Assignment groups need coverage rules: what happens at 2 a.m., during a regional holiday, or when the only person with a given skill is on leave. Configure a fallback group and an escalation, and test them by temporarily emptying a group. An implementation that routes perfectly under normal conditions and silently strands cases on Boxing Day is not finished.

## Service level agreements on HR cases

SLAs on HR cases work like SLAs elsewhere on the platform, with two HRSD-specific considerations.

**Pause conditions must include the awaiting-info state.** HR work is frequently blocked on the employee, and an SLA that keeps running through that measures the employee, not HR.

**Different services deserve different targets, and the targets should come from the HR stakeholder.** A password-style request ("send me my employment letter") might target one business day. A leave-of-absence intake might target five. Do not apply one global HR SLA; it will be simultaneously impossible for one service and meaningless for another.

Attach SLA definitions with conditions keyed on the HR service or the service's category, and set the schedule to the *subject person's* working calendar where your organization is multi-region. A case for an employee in Japan should not be measured against a New York business day.

## Employee-facing communication

An HR case has two comment streams, and the difference between them is the most consequential single field on the form.

**Work notes** are internal. Agents, and only agents with access to the case, see them.

**Additional comments** are employee-facing. They appear in the self-service portal and typically trigger a notification.

Configure the form so that this is impossible to get wrong: label the employee-facing field explicitly ("Visible to employee"), and consider a confirmation on submission for the most sensitive COEs. Train, but do not rely on training — an employee relations agent pasting an investigation note into the wrong box is a serious incident, and the form is your last line of defense.

Beyond the comment stream, configure notifications for the events that actually matter to an employee: case created (with the case number and expected timeframe), case assigned or reassigned only if the employee gains a new contact, information requested, and case resolved. Resist notifying on every state change; the fastest way to make employees ignore HR email is to send them nine of them per case.

Keep sensitive content *out of* notification bodies. A notification should say "there is an update on case HRC0010042" and link to the portal, not restate the content of a medical accommodation request in an email that will sit unencrypted in an inbox. You will revisit this in the privacy lesson.

## Intake channels

Employees do not only arrive through the portal, and each channel needs configuration if the case it produces is going to be as good as a portal-submitted one.

**Portal self-service** is the channel you want, and it is the only one that produces a fully structured case: the employee picked a service, the service stamped a template, the variables captured the details. Everything in this course pushes volume toward this channel.

**Email** arrives as unstructured text. Configure inbound processing so that a reply to an existing case lands as a comment on that case — matching on the case number in the subject — rather than creating a duplicate. New inbound mail should create a case in a general triage queue with a service of "general inquiry," not attempt to guess a specific service from keywords. Guessing produces confidently misrouted cases, which are worse than honestly untriaged ones.

**Phone and walk-up** produce agent-created cases. This is the path that most needs templates: the agent is talking to a person and should be able to pick the service and have everything else fill itself in. Configure the agent-side creation flow so that choosing the HR service is the *first* field, because it drives the rest.

**Manager-initiated on behalf of a report.** Configure this per service — some are legitimate (a manager reporting a team member's leave), some are not (a manager requesting a report's salary letter). The subject person must be set to the report, not the manager, and every downstream criterion must then evaluate against the report.

**System-generated.** Lifecycle events and integrations create cases too. Give them a distinguishable source value so that your reporting can separate employee demand from machine-generated volume; without it, "case volume is up 40 percent" becomes an unanswerable question.

Record the channel on every case. It is one field and it makes an entire class of question — which channel do people actually use, which channel produces the most reassignments, is deflection working — answerable.

## Categorization and reporting

Configuration decisions made for agents also determine what HR can learn from the system, and it is worth designing for that deliberately rather than discovering later that no useful report can be built.

The reporting spine of an HR case implementation is: **HR service** (what was asked for), **COE** (who owns it), **channel** (how it arrived), **state and close code** (how it ended), and the **time fields** (created, assigned, resolved, closed, and SLA elapsed). Get those five right and most questions are answerable.

Two configuration cautions.

**Do not build a deep free-form category tree in parallel with the service list.** If category and service both describe what the request is about, they will drift, agents will pick inconsistently, and neither will be trustworthy. Let the service be the primary classifier and keep category coarse — a small, stable grouping that services roll up into.

**Make close codes mean something and keep them few.** "Resolved," "duplicate," "withdrawn by employee," "not an HR request," "unable to fulfil — policy," and "unable to fulfil — data" is enough for most implementations, and every one of those tells HR something actionable. Twenty close codes produce a distribution nobody can read.

One more field earns its keep: a **reassignment count**. Every reassignment is a routing failure, and the report of "services with the highest reassignment rate" is the shortest path to a better service catalog you will ever get.

## Worked example: employment verification letter

Walk the whole configuration for one service end to end.

**The requirement.** Employees need a letter confirming employment, sometimes with salary, sent to a landlord, a bank, or an embassy. Turnaround expectation: two business days. Handled by HR shared services. Salary disclosure requires the employee's explicit consent.

**HR service record.** COE: HR shared services. Name: "Employment verification letter." Employee-facing description written in plain language. Available for self-service. Available on behalf of: no — a manager should not request a salary letter for a report.

**Intake form.** Variables: recipient name, recipient address or email, whether salary should be included (yes/no), and — shown only when salary is yes — a consent acknowledgement. Deadline date, optional. Note that the consent acknowledgement is a *variable on the request*, which means it is stored with the case and is auditable later. That is deliberate.

**Template.** Stamps: HR service, category "employment records," assignment group "HR Shared Services — Letters," short description "Employment verification letter for {subject person}." Priority left at default.

**Tasks.** One task, "Prepare and send verification letter," assigned to the same group. A second conditional task, "Obtain manager or compensation sign-off," created only when salary is included — configure this as a condition on the activity set rather than as a second service.

**Assignment.** By service, to the letters group. Regional override rule: if the subject person's work country is in the EMEA list, assign to the EMEA letters group instead. Implemented as a mapping table, not a script chain.

**SLA.** Two business days on the subject person's schedule, pausing while the case is awaiting info, with a warning notification at 75 percent elapsed.

**Communication.** Case-created notification confirms receipt and states the two-day expectation. When the letter is sent, the agent uses additional comments to tell the employee, and the case moves to resolved. Auto-close after five days if the employee does not respond.

**Closure.** Closed complete when the letter is delivered. If the employee withdraws, closed incomplete with a close code of "withdrawn by employee" — which keeps your fulfillment rate honest.

Notice what this example did *not* need: no custom table, no client script, and one small mapping table. If your equivalent configuration needs three hundred lines of script, stop and re-examine whether you are fighting the service model.

## Testing an HR case configuration

Test as three different people, every time:

**As the employee.** Submit through self-service. Confirm the case is created against the right subject person, the right service, and the right team; confirm the confirmation notification is comprehensible; confirm the case is visible in the portal and shows a sensible state label.

**As the assigned agent.** Confirm the case arrived pre-populated, that the tasks exist, that the SLA is attached, and that the employee-facing comment field is unmistakably labeled.

**As an agent in a different team.** Confirm they cannot see it if they should not. This is the test most often skipped and most often the source of a production incident.

Add one negative test per configuration: a subject person who matches no regional rule, a request submitted with the optional fields blank, and a case where the employee never replies. Configuration that only works on the happy path is not configured.

## Practice

Work in a development instance with HRSD available. Build in one COE — HR shared services is a good choice — and keep everything on the platform's HR case tables; do not create a new table.

1. **Design three services before building any.** For "employment verification letter," "personal data change," and "general HR question," write a one-page design listing for each: the COE, the owning group, the intake fields, the tasks, the SLA target, and whether it can be requested on behalf of someone else. Get the design onto paper first — the whole point of this exercise is that configuration follows a design.

2. **Build the templates.** Create an HR template for each of the three services, stamping service, category, assignment group, and short description. Deliberately leave priority at its default and write one sentence explaining why.

3. **Build tasks for one service.** For "personal data change," create at least two tasks, one of which is conditional (for example, a payroll notification task that is only created when the change affects banking or address details). Verify by creating two cases — one that should generate the conditional task and one that should not.

4. **Implement regional assignment.** Create a mapping from a subject-person attribute (work country or region on the HR profile) to an assignment group, covering at least two regions plus a fallback. Create three test cases with subject people in different regions, including one that matches no region, and confirm all three land somewhere sensible. Record what happened to the unmatched one.

5. **Attach an SLA and prove the pause works.** Configure an SLA on one service with a pause condition on the awaiting-info state. Create a case, move it to awaiting info, wait, move it back, and record the elapsed-time behavior you observed. If it did not pause, debug it before moving on.

6. **Run the three-person test.** For your finished "employment verification letter" service, execute the employee / assigned agent / other-team agent test described above and write down the result of each. The third test must produce a denial; if it does not, note what you would change and why.

7. **Break something on purpose.** Empty the assignment group your primary rule targets, submit a case, and document exactly what happened — where the case went, whether anyone was notified, and how long it would have sat unnoticed. Then describe in two or three sentences the configuration you would add to prevent that.
