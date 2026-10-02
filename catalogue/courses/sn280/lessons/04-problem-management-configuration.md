---
lesson_id: sn280-04
course_id: sn280
pathway: servicenow-implementation-specialist
title: Problem Management Configuration
order: 4
kind: lesson
competency_ids:
  - D2-S1-C01
objectives:
  - Configure problem management and connect it to incident and change records
---

## The process that fails quietly

Problem management is the ITSM practice most often bought and least often used. Nothing breaks when it is configured badly. Incidents keep getting logged and closed, dashboards stay green, and nobody notices for a year that the problem backlog has forty records, all in "New," created by a well-meaning process during go-live and never touched again.

That failure mode is a configuration problem before it is a discipline problem. Problem management only works when three things are true on the platform:

1. There is a **clear trigger** — a defined, low-friction way a problem gets created from real evidence.
2. There is a **state model with a decision at every step**, so a record cannot sit in an ambiguous status forever.
3. The **outputs are connected to other records** — a workaround visible on the incidents it helps, a fix that becomes a change, a known error that stops the same investigation happening twice.

Your job in this lesson is to configure all three, and to wire problem into the incident and change records around it.

## What problem management produces

Problem management does not restore service. Incident management does that. Problem management produces three artifacts, and the configuration exists to make them findable:

A **workaround** is a documented way to restore service without fixing the underlying cause. It is the highest-value short-term output, and it is worthless if the service desk cannot find it at the moment an incident is logged. The `workaround` field on `problem` exists precisely so that it can be surfaced on the related incidents.

A **known error** is a problem with a documented root cause, a documented workaround, or both, where the organization has accepted that it will not be fixed immediately. The `known_error` flag marks this. A known error is a decision, not a status — it says "we understand this and we are choosing to live with it for now."

A **permanent fix** is a change. When problem management concludes, its output leaves problem management and becomes a `change_request`. That handoff is the one connection most implementations get wrong.

## The problem state model

The `problem` table uses `problem_state` alongside the inherited `state`. Recent baselines align the two and drive behavior from `state`; verify which your instance uses before configuring, and configure consistently on one of them.

The lifecycle, in the shape the platform models it:

| State | Meaning | Exit decision |
| --- | --- | --- |
| New | Logged, not yet triaged | Is this worth investigating? |
| Assess | Triage: confirm it is a problem, size it, assign it | Accept for investigation, or reject with a reason |
| Root Cause Analysis | Active investigation | Root cause identified, or investigation abandoned |
| Fix in Progress | A fix is being pursued, usually via a change | Fix delivered and verified |
| Resolved | Fix verified, or accepted as a known error permanently | Confirm and close |
| Closed | Terminal | — |

The two fields that make this model honest are `cause_notes` — what the investigation found — and `fix_notes` — what was done about it. Make `cause_notes` mandatory to leave Root Cause Analysis, and make a resolution code mandatory to reach Resolved. Without those, a problem can be closed with no record of what was learned, which defeats the entire practice.

Note the state that gets skipped: **Assess**. Customers routinely ask to remove it, because it feels like an extra click. Push back. Assess is the state where somebody decides whether an investigation is worth the engineering time it will cost, and where a problem gets rejected with a documented reason. An implementation with no rejection path accumulates a backlog nobody prunes, and a backlog nobody prunes is a backlog nobody reads.

## Problem tasks

Investigation work is not done on the problem record. It is done on `problem_task`, which extends `task` and carries a `problem_task_type` distinguishing root cause analysis work from general investigation work.

This split exists for the same reason change tasks exist: the problem record is owned by one person and represents the whole investigation, while the work is done by several people across several teams. A network engineer testing a hypothesis and a database administrator pulling query plans are two tasks, each independently assignable, each with its own state, both rolling up to one problem.

Configure problem tasks so that:

- A problem cannot leave Root Cause Analysis while it has open problem tasks. This is a rule you will typically implement as a condition on the state change; the alternative, letting the problem close over open children, produces orphaned work.
- Problem tasks inherit `assignment_group` sensibly rather than defaulting to the problem's group, because the whole point is cross-team investigation.

## Connecting problem to incident

There are two directions to wire, and they are configured differently.

**Incident to problem: creating a problem from evidence.** The baseline gives agents a "Create Problem" action from an incident, which creates the `problem` record and populates `problem_id` on the incident. This is the low-friction trigger, and it should stay low-friction — do not add a mandatory justification, an approval, or a form the agent has to complete. The Assess state exists to filter quality; the creation step should be nearly free.

The second trigger is **proactive**: someone reviewing incident trends spots a cluster. This is not a platform action, it is a report plus a human. Configure the report — incidents grouped by category and CI over the last ninety days, filtered to closed, sorted by count — and give the problem manager a scheduled delivery of it. A trend report that lands in an inbox weekly generates more real problems than any automated threshold rule.

**Problem to incident: relating the affected incidents.** Once a problem exists, the incidents it explains should point at it via `problem_id`. This gives you the count that justifies the investigation ("this problem explains 340 incidents") and it gives you the propagation path when the problem is solved.

The configuration decisions here:

- **Does resolving a problem resolve its related incidents?** Sometimes the right answer and often not. If the incidents were closed months ago, nothing should happen. If they are open and were held pending the problem, they should be updated. The defensible configuration is: resolving a problem notifies the assignment groups of related open incidents, and optionally auto-resolves those whose `hold_reason` is "Awaiting Problem," which is exactly the signal that they were waiting on this. Never blanket-resolve every related incident — you will close records whose callers still have a broken service.

- **Is the workaround visible on the incident?** It must be. The pattern is to surface the problem's `workaround` on the related incident form, so the agent sees it without navigating. Where the customer also runs Knowledge Management, a known error is often published as a knowledge article instead; that publishing path belongs to the Knowledge course, and the ITSM-side configuration you own is the `known_error` flag and the workaround text.

## Connecting problem to change

This is the handoff that closes the loop, and the one most commonly left unbuilt.

When root cause analysis concludes that a fix is needed, the fix is a change. The platform supports creating a `change_request` from the problem, which sets `rfc` on the problem — the reference to the change that will fix it. Once that link exists you can answer the question executives actually ask: *how many of our recurring problems have a fix scheduled?*

Configure the following:

**The creation path.** A "Create Change" action from the problem record, populating the change's `short_description` and `description` from the problem, and setting the problem's `rfc` reference. The change type should not be forced — a problem fix might be a normal change or, if the fix is routine, a standard one.

**The state coupling.** When the change is created, the problem moves to Fix in Progress. When the change is closed successfully, the problem becomes eligible for Resolved — eligible, not automatically resolved, because someone has to confirm the fix actually worked. Automatic resolution here is the most common over-automation error in problem management: a successfully implemented change is not proof that the incidents stopped.

**The failure path.** If the change fails or is backed out, the problem must not stay in Fix in Progress silently. Notify the problem owner and return the problem to Root Cause Analysis, because the assumed cause may be wrong.

Here is the relationship set in one place:

```text
incident.problem_id  ──▶  problem          "this incident is explained by that problem"
problem.rfc          ──▶  change_request   "this problem will be fixed by that change"
change_request       ──▶  problem          "this change was raised to fix that problem"
problem.known_error  =  true               "we understand it; we are living with it"
problem.workaround   =  text               "here is how to restore service meanwhile"
```

Every one of those is a reference field or a flag on a table, not a document and not a convention. That is what makes the process reportable.

## Reporting that makes the practice survive

Problem management is defunded when nobody can show what it saved. Build three reports at implementation time, not later:

**Incident volume attributable to open problems.** Count of incidents with a `problem_id` pointing to a problem that is not yet resolved. This is the size of the avoidable-work backlog, in the only unit the business understands.

**Problem age by state.** Records sitting in Assess for thirty days are a triage failure. Records sitting in Root Cause Analysis for ninety days are an investigation that has quietly stopped. Both are visible only if you report age by state rather than age overall.

**Known errors with no workaround.** These are the worst records on the instance: acknowledged recurring failures that offer the service desk nothing. Every entry on this list is a small, concrete piece of work with an immediate payoff.

## Worked example: from a cluster to a closed loop

A customer's VPN gateway drops sessions for remote users several times a week. The service desk logs each report as an incident, tells the user to reconnect, and closes it. Weekly volume: about twenty-five incidents.

The configured path:

1. The problem manager's weekly trend report shows twenty-five incidents in ninety days sharing category `Network` and CI `vpn-gw-01`. She creates a problem from one of them; `problem_id` is set on that incident automatically.

2. The problem lands in New. At triage she moves it to Assess, sets impact and assignment group, and uses a bulk list update to set `problem_id` on the other twenty-four incidents. The problem now visibly explains twenty-five incidents.

3. Accepted into Root Cause Analysis. Two problem tasks are created: one for the network team to capture gateway logs, one for the identity team to check session-token lifetimes.

4. The identity task finds it: token lifetime is shorter than the gateway's idle timeout. The workaround — reconnect, which the desk was already doing — is documented in `workaround`, and `known_error` is set to true so the desk can find it. Incidents logged from this point can be resolved in under a minute with a documented answer.

5. `cause_notes` records the finding. A change is created from the problem to align the two timeouts; the problem's `rfc` now points at it and the problem moves to Fix in Progress.

6. The change is implemented and closed successfully. The problem owner waits two weeks, confirms incident volume for that CI has fallen to zero, and resolves the problem with `fix_notes` recording the verification. The known error flag is cleared.

Nothing in that sequence required a script. It required a state model with decisions in it, three reference fields wired correctly, and a report that put the cluster in front of a human.

## Practice

Work in a personal developer instance.

1. **State model.** Document the problem lifecycle on your instance, naming for each state the decision that must be made to leave it. Then configure `cause_notes` as mandatory to leave Root Cause Analysis and a resolution code as mandatory to reach Resolved. Test both.

2. **Rejection path.** Create a problem, move it to Assess, and reject it. Record exactly what fields captured *why* it was rejected. If nothing did, configure a field or reason list that does, and explain in two sentences why an unreasoned rejection is worse than no rejection.

3. **Incident to problem.** Create three incidents that share a category and configuration item. From one, create a problem. Then set `problem_id` on the other two using a list update rather than opening each record. Confirm the problem's related incident list shows all three.

4. **Workaround visibility.** Populate `workaround` on the problem and set `known_error`. Then describe — with the specific fields and the mechanism you would use — how the service desk sees that workaround while working one of the related incidents. Implement it if your instance permits.

5. **Problem tasks.** Create two problem tasks on the problem, assigned to different groups. Attempt to move the problem out of Root Cause Analysis with a task still open, and record what happens. If the platform allows it, write the condition you would add to prevent it.

6. **Problem to change.** Create a change request from the problem. Verify `rfc` is populated on the problem and that the change carries enough context for an approver who has never seen the problem. Then close the change as unsuccessful, and write what you believe should happen to the problem — and what actually happened on your instance.

7. **Reports.** Build the "incident volume attributable to open problems" report described in this lesson. Note the two filter conditions it needs and one way it could be misleading if incidents are not consistently linked.
