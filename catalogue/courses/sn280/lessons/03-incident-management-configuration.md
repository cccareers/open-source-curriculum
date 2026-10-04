---
lesson_id: sn280-03
course_id: sn280
pathway: servicenow-implementation-specialist
title: Incident Management Configuration
order: 3
kind: lesson
competency_ids:
  - D2-S1-C01
objectives:
  - Configure incident management including states, priority, assignment, and major incident handling
---

## What you are actually configuring

Incident management is the highest-volume process on most instances, which means every configuration decision you make here is executed thousands of times a week by people under time pressure. That changes the design criteria. A field that takes four seconds to fill costs the service desk an entire working day per thousand incidents. A state model with eleven values will be used as if it had three, and the other eight will be noise in every report built on top of it.

So the goal is not fidelity to a process diagram. The goal is a configuration where the fast path is the correct path: the fields the agent must fill are the fields the process genuinely needs, the priority the record lands on is the priority the business would have assigned, and the record arrives at the right group without anyone thinking about it.

There are four decisions that determine whether an incident implementation succeeds:

1. **The state model** — what the record's lifecycle is and who is allowed to move it.
2. **Priority** — how impact and urgency combine, and who is allowed to override.
3. **Assignment** — how a record gets to a group without human routing.
4. **Major incident handling** — what happens when normal handling is not enough.

Everything else — categories, resolution codes, notifications — hangs off these.

## The incident state model

The `incident` table carries both `state` (inherited from `task`, and the field that actually drives behavior) and `incident_state`, which exists for historical reasons and mirrors it. Configure and report on `state`; leave `incident_state` alone.

The baseline values are:

| Value | Label | Meaning |
| --- | --- | --- |
| 1 | New | Logged, not yet picked up |
| 2 | In Progress | Someone is actively working it |
| 3 | On Hold | Work is blocked; a hold reason is required |
| 6 | Resolved | Service restored; awaiting confirmation or auto-close |
| 7 | Closed | Terminal; the record is read-only |
| 8 | Canceled | Logged in error or duplicate |

Two properties of this model are worth defending against customer pressure. First, **Resolved and Closed are different states for a reason.** Resolved means the technician believes service is restored. Closed means the record is finished and no longer counted as open work. The gap between them is where the caller gets to disagree. If you collapse them, you lose the reopen path and you lose the ability to measure how often "resolved" was wrong. Standard practice is to auto-close resolved incidents after a fixed number of days, driven by a system property rather than hard-coded — the out-of-box property that governs this lives in the incident management properties page, and the value is a business decision, typically three to seven days.

Second, **On Hold requires a reason.** The `hold_reason` field distinguishes "awaiting caller" from "awaiting vendor" from "awaiting problem" from "awaiting change." Those four are operationally different: two of them are the caller's or a third party's clock, and two of them are yours. If you only know that the incident is on hold, you cannot defend an SLA breach, and you cannot tell whether your queue is blocked on your own work or on someone else's. Lesson 8 covers how hold reasons pause SLA clocks; the point here is that the field must be mandatory whenever `state` is On Hold.

When a customer asks for extra states — "Pending Assignment," "Awaiting Parts," "Escalated" — interrogate each one. Usually the requirement is a *reason*, not a state, and belongs in `hold_reason` or in a separate field. "Escalated" in particular is almost always a priority change plus a notification, not a lifecycle stage. Adding it as a state means every report, SLA, and dashboard has to learn about it forever.

The mandatory-field rules that make a state model real are configured as UI policies and data policies, not as prose in a runbook:

- Resolved requires `close_code` and `close_notes`.
- On Hold requires `hold_reason`.
- In Progress requires `assigned_to`.

Use a **data policy** rather than a UI policy where the rule must hold for records arriving through an integration or an import, because UI policies only run in the browser. Data policies can be configured to apply to imported records as well as to the form, which is exactly what you want for "an incident may never be resolved without a close code."

## Impact, urgency, and priority

Priority is derived, not typed. The out-of-box model computes it from two fields:

- **Impact** — how much of the business is affected. A property of the service, not the caller.
- **Urgency** — how quickly it needs to be fixed. A property of the situation.

The default matrix is a 3x3 producing five priority values:

| | Urgency 1 (High) | Urgency 2 (Medium) | Urgency 3 (Low) |
| --- | --- | --- | --- |
| **Impact 1 (High)** | 1 – Critical | 2 – High | 3 – Moderate |
| **Impact 2 (Medium)** | 2 – High | 3 – Moderate | 4 – Low |
| **Impact 3 (Low)** | 3 – Moderate | 4 – Low | 5 – Planning |

The mechanism is a **data lookup definition**. Data lookup rules are records that map input field values to output field values through a lookup table — for incident priority, the table is `dl_u_priority` in the baseline data lookup implementation, and the definition record binds it to the `incident` table with `impact` and `urgency` as matcher fields and `priority` as the setter field. This matters because it means changing the matrix is a **data change, not a code change**. You edit rows in a table. No script is touched, nothing is harder to upgrade, and the business can review the matrix as a spreadsheet-shaped artifact.

Older implementations sometimes compute priority in a business rule or a client script. If you inherit one of those, migrating it to data lookup is almost always worth doing, because the logic becomes inspectable by non-developers.

Two configuration questions come up on every engagement:

**Should agents be allowed to override priority?** The data lookup definition has a flag controlling whether it overwrites an existing value. If overrides are allowed, you get flexibility and you lose the ability to say "priority 1 means these things are true." The common compromise: allow the override, make it auditable, and require a justification field when priority is raised. Then report on override frequency — if a third of priority-1 incidents were manually raised, the matrix is wrong and should be fixed rather than worked around.

**Should impact be derived from the CI?** This is the mature answer and the one worth pushing customers toward. If the affected configuration item is a business service with a criticality attribute, impact can be defaulted from the service rather than guessed by the agent. This makes priority a function of *what broke* rather than *who called*, which is what the business actually means. It also creates a hard dependency on CMDB quality, which is why lesson 10 exists. Design for it, but do not switch it on before the service data is trustworthy.

## Categorization

Category and subcategory exist to route work and to feed problem management with trend data. They do not exist to describe the incident — that is what `short_description` is for.

The practical guidance is aggressive pruning. A category list with sixty values will be filled in wrong. Twelve values that map cleanly to the teams who fix things will be filled in right. Build the category list backwards from two questions: *does this value change who works the incident?* and *would I ever run a report grouped by this value and act on the result?* If neither, delete it.

Subcategory is a dependent field: its choices filter by the selected category, configured through the choice records' `dependent_value` attribute. Get this right or agents will see every subcategory for every category and pick nonsense.

Resolution categorization is a separate list — `close_code` — and it is the field problem management depends on most. "Resolved by workaround" versus "Root cause fixed" versus "Duplicate" versus "User education" is the difference between a problem backlog you can prioritize and one you cannot.

## Assignment

The design rule is: **an incident should arrive at a group without a human deciding where it goes.** Every manual routing hop adds delay and adds a chance of misrouting.

ServiceNow gives you several mechanisms, and choosing correctly matters more than configuring any one of them well.

**Assignment rules** (`sysrule_assignment`) are the declarative option. A rule has a table, a condition, and a target user or group. They run in order by their `order` field, and the first match wins. Use them for the straightforward cases: category equals Network goes to the network team; the caller's location is a specific site and the category is hardware goes to that site's field services group.

**CI-driven assignment** uses the `support_group` field on the configuration item. If the affected CI is populated and its support group is maintained, assignment is a one-line lookup and it stays correct as ownership changes, because it is maintained on the CI rather than in a rule. This is the most durable pattern available and it is another argument for CMDB investment.

**Flow Designer** handles the cases with real logic in them — routing that depends on time of day, on group availability, on a lookup against another table. Lesson 9 covers building these. The guidance here is not to reach for a flow when an assignment rule would do, because the rule is visible in a list and the flow is not.

**Predictive intelligence**, where licensed, trains a classification model on historical incidents to predict assignment group and category. Treat it as an enhancement over a working manual configuration, never as a substitute for one: it learns from your history, so if your history is badly categorized it will faithfully reproduce the mess.

A word on **auto-assignment to an individual**. Resist it. Assigning to a group and letting the group's process pull work is more resilient than pushing work at a named person who may be on leave. Where a customer insists, base it on group membership plus availability, and always leave the group populated so the record does not disappear when the individual is unavailable.

## Major incident management

A major incident is not just a priority-1 incident. It is an incident that has been *declared* major, which triggers a different operating mode: a dedicated communications channel, an incident commander, proactive stakeholder updates, and a post-incident review. The distinction between "high priority" and "declared major" is the whole point — declaration is a human decision with accountability attached.

The platform models this with:

- A `major_incident_state` field on `incident` with values covering proposed, accepted, rejected, and canceled.
- A **Propose as Major Incident** action available to agents, and an **Accept/Reject** decision restricted to a major incident manager role.
- A major incident workbench or overview that gives the commander a single place to see the incident, its children, its communications, and its tasks.
- **Child incidents** related to a parent, so that the fifty callers reporting the same outage are recorded but resolved as a group.

Configure the following deliberately.

**Who can propose and who can accept.** Proposal should be broad — any agent who sees a developing outage. Acceptance should be narrow, held by a named role, because accepting commits the organization to a communications cadence. Never make these the same permission.

**The parent-child model.** When an outage generates duplicate incidents, the correct pattern is to relate them to the major incident as children rather than to close them as duplicates, because the child records preserve who was affected. Resolving the parent should propagate resolution to the children — this is standard behavior worth verifying rather than assuming, and it is one of the places where a business rule or flow may be needed to match the customer's expectation about whether children close automatically.

**Communications.** Major incident handling generates the highest-volume, highest-scrutiny notifications on the instance. Define the audience list, the update interval, and the template before go-live. A common configuration is a scheduled reminder task for the commander at a fixed interval so updates are pushed rather than requested.

**The post-incident review.** The review is not part of incident management. Its output is a problem record, and the trigger is usually a checkbox or a UI action that creates the problem with the major incident attached. Lesson 4 covers what happens once that problem exists; the configuration you own here is the handoff — the incident should not be closable without a decision about whether a problem is warranted.

## Notifications and the noise budget

Every incident configuration produces email, and email volume is the fastest way to lose the service desk's confidence. Apply a budget: for each notification, name the recipient, the decision they will make on receiving it, and the action they will take. If any of the three is missing, do not build the notification.

The defensible baseline set for incident is small: assignment-group notification on assignment, caller notification on resolution, and major incident stakeholder updates. Add a caller notification on state change only if the customer has actually asked for it and understands the volume.

Prefer subscription-based notification for anything optional, so the recipient opts in. And route to a group, not to a list of individuals — an individual leaves the company, a group does not.

## Worked example: configuring a hardware-failure path

A customer's requirement: "When a laptop fails for a user at one of our three offices, the incident should go to that office's field services team automatically, be priority 3 unless the user is an executive, and never sit unassigned for more than an hour."

The configuration, decision by decision:

1. **Category and subcategory.** Category `Hardware`, subcategory `Laptop`. Both already exist in the baseline lists; confirm before adding.

2. **Priority.** Impact defaults to 3 (Low) for a single-user hardware failure; urgency defaults to 3. The data lookup produces priority 5 — which is wrong for this customer, so the matrix row is edited to produce priority 4, and the customer signs off on the matrix as a whole rather than on this one case. The executive exception is *not* a priority override rule; it is an urgency default, set from the caller's VIP flag, and it flows through the same matrix. That keeps one derivation path instead of two.

3. **Assignment.** Three assignment rules, one per office, each conditioned on `category` is Hardware AND `location` is the office, targeting that office's group. Ordered after any more-specific rules. The more durable alternative — support group from the CI — is documented as a phase-two improvement pending asset data quality.

4. **The one-hour rule.** This is not an assignment requirement; it is an escalation requirement, and it belongs to SLA configuration (lesson 8) as a response-time target with an escalation action, not to a business rule that emails someone on a timer.

Notice that three of the four requirements were satisfied by data changes — choice lists, lookup rows, assignment rules — and none required script. That ratio is the mark of a healthy ITSM implementation.

## Practice

Work in a personal developer instance with the ITSM baseline installed.

1. **State model.** Document the current `state` choices on `incident`. Then configure: `hold_reason` mandatory when state is On Hold, and `close_code` plus `close_notes` mandatory when state is Resolved. Implement the resolution rule as a **data policy** and explain in two sentences why a UI policy would be insufficient.

2. **Priority.** Locate the data lookup definition governing incident priority. Change the matrix so that Impact 2 / Urgency 3 produces priority 3 rather than 4. Create a new incident with those values and confirm the result. Then revert the change and confirm the original behavior returns — you should be able to do both without touching a script.

3. **VIP urgency.** Configure urgency to default to 1 (High) when the caller has the VIP flag set, without introducing a second priority-derivation path. Test with a VIP and a non-VIP caller and record the resulting priority for each.

4. **Assignment.** Create two assignment rules that route incidents by category to different groups, and one incident that matches both rules' conditions. Predict which rule wins before you save the incident, then verify. Explain what field decided it.

5. **CI-driven assignment.** Pick a configuration item, set its support group, and describe — in writing, with the specific field names — how you would route incidents by CI support group instead of by category rule. State one advantage and one risk of doing so at this customer.

6. **Major incident.** Major incident handling ships as a separate plugin (Major Incident Management) that may not be active on a personal developer instance; check for the **Propose as Major Incident** action first, and if it is missing, activate the plugin through the developer portal or complete the parent-child half of this exercise and describe the rest. Propose an incident as a major incident, then accept it using an account with the appropriate role. Create two further incidents and relate them as children. Resolve the parent and record exactly what happened to the children. Then write the two-sentence recommendation you would give a customer about whether child incidents should auto-resolve, and why.

7. **Notification audit.** List every notification that fires on the `incident` table in your instance. For each, write the recipient, the decision it supports, and the action it prompts. Nominate at least two for removal and justify each.

## Check your understanding

1. An agent sets Impact 2 and Urgency 1. What priority does the baseline matrix produce, and where would you change that mapping? *2 – High; in the data lookup rows (`dl_u_priority`), as a data change, not a script.*
2. A customer wants a new state "Awaiting Vendor." What do you propose instead, and why? *A hold reason on On Hold; states multiply reporting and SLA logic, reasons do not.*
3. Why make "Resolved requires close code" a data policy rather than only a UI policy? *UI policies run only in the browser; imports and integrations would bypass them.*
4. What is the difference between a priority-1 incident and a major incident? *Major is a declared operating mode, accepted by a named role, with communications and review attached; priority is derived from impact and urgency.*
