---
lesson_id: sn350-08
course_id: sn350
pathway: servicenow-implementation-specialist
title: Automating Policy and Risk Workflows
order: 8
kind: lesson
competency_ids:
  - D2-S1-C05
  - D7-S1-C02
objectives:
  - Automate policy review, risk acceptance, and attestation campaigns with Flow Designer
---

## Which tool, and why it matters here

A GRC program has three or four recurring human loops — review a policy, approve an acceptance, launch and chase a campaign, escalate an overdue remediation — and every one of them is the kind of work that decays the moment it depends on somebody remembering. Automating them is not a convenience; the automation *is* the control. An annual policy review that happens because a flow raised a task is evidence. An annual policy review that happens because the compliance manager is conscientious is a dependency on one person's calendar.

Before building anything, choose the mechanism deliberately. The platform gives you several and they are not interchangeable.

```text
Mechanism            Runs when                        Best for
-------------------  -------------------------------  --------------------------------
Business Rule        Before/after a record is         Data integrity on one record:
                     inserted, updated, deleted,      defaulting, validation, stamping,
                     or queried. Server-side,         restricting a query. Fast, tightly
                     synchronous with the write.      scoped, no human steps.
Flow Designer        A record event, a schedule,      Multi-step processes with waits,
                     an inbound call, or manual       approvals, tasks, notifications,
                     invocation.                      and integrations. The default for
                                                      anything a person participates in.
Subflow / Action     Called by a flow.                Reuse. One acceptance-approval
                                                      subflow serving several flows.
Scheduled Job        A clock.                         Periodic sweeps over many records
                                                      where no per-record event exists.
                                                      Often better expressed as a
                                                      scheduled flow.
Scripted REST API    An external system calls in.     Publishing GRC data outward or
                                                      accepting evidence inward on a
                                                      contract you define.
```

Two rules settle most arguments. **If a human waits, it is a flow.** Business rules are synchronous with a database write and cannot pause for an approval; anything that models "and then someone decides" belongs in Flow Designer. **If it must be true before the record is saved, it is a business rule.** Flows run after the fact, so a flow cannot stop a bad save — it can only correct it, visibly and late.

The older Workflow Editor still exists and you will meet it in inherited instances. For new build in a GRC implementation, use Flow Designer: it is where the current action ecosystem lives, its execution history is far more legible to an auditor, and legibility is not a minor consideration in a compliance context. Migrate an existing workflow when you are already changing it substantially, not as a side quest.

## Anatomy of a flow, with GRC-specific concerns

A flow is a trigger, some data lookups, some logic, and actions. The GRC-specific concerns sit around the edges.

**Trigger choice.** Record-based triggers fire per record and are the right choice for "when a risk acceptance is approved." Scheduled triggers fire on a clock and are right for "every night, find policies due for review." Resist the temptation to make everything record-based with a wait — a flow instance parked for eleven months waiting on a date is a fragile thing to carry across upgrades and instance clones. Sweep on a schedule instead, and let the sweep be idempotent.

**Idempotency.** A scheduled sweep will, sooner or later, run twice: someone reruns it, a clone replays it, a failure retries it. Every sweep must be safe to run twice. The usual technique is a guard condition that excludes records already processed — "policies with a review date within 30 days **and no open review task**" rather than just the first half. Write the guard into the query, not into a script step, so it is visible on the flow's face.

**Run-as and scope.** Flows execute as a user, and GRC data is access-controlled. A flow that runs as the initiating user will behave differently for a practitioner than for an executive; a flow that runs as system sails past every ACL. Choose deliberately and document the choice. Cross-scope calls between a global flow and a scoped IRM application need explicit privileges — a feature, because it forces the reach to be declared.

**Error handling.** A flow that fails silently in a compliance process is worse than no flow, because the process is now assumed to be running. Every flow that matters gets an explicit failure path: catch the error, create a record somebody sees, and notify a monitored group — never an individual who might be on leave. Then build the indicator from Lesson 7 that watches for flows that have not run.

**Notification hygiene.** GRC automation is notification-heavy, and notification volume is the most common reason a program loses the business's goodwill. Batch where possible, digest where you can, and never send a chase notification more often than a human could plausibly act on it.

## Flow one: the annual policy review

The obligation is simple — policies are reviewed at a defined interval — and the failure mode is universal: everybody forgets until an auditor asks.

```text
Trigger    Scheduled, daily, 06:00 instance time

Look up    Policies where:
             state = Published
             AND next_review_date <= today + 30 days
             AND no active review task exists      <- idempotency guard

For each   1. Create review task, assigned to policy owner,
              due = next_review_date
           2. Notify owner (single notification; chasing is a separate flow)
           3. Wait for task completion
           4. Branch on the owner's outcome:
                "No change"  -> set next_review_date = today + review_interval
                                stamp reviewed_by, reviewed_on; state stays Published
                "Revise"     -> set state = Review; request approval from
                                the policy approver group
                                On approve  -> state = Published, new version,
                                               dates stamped, notify affected
                                               control owners
                                On reject   -> return task to owner with comments
                "Retire"     -> require a replacement policy reference or a
                                documented rationale, then approval, then
                                state = Retired (never delete)

Error      Any step failure -> create an operational issue assigned to the
           GRC administration group, with the policy and step recorded
```

Three design points. The review task is created at a fixed lead time so the owner has room; a task due the day the policy expires guarantees lateness. The "no change" branch still stamps a reviewer and a date, because "we reviewed it and changed nothing" is a legitimate outcome that must produce evidence — a policy with an unchanged body and no review record is indistinguishable from a policy nobody looked at. And retirement demands either a replacement or a rationale, which prevents the quiet disappearance of an obligation.

Chasing overdue reviews belongs in a **separate** scheduled flow rather than inside this one, so escalation logic can change without touching the review process, and so a single sweep sends one digest per manager instead of one notification per policy.

## Flow two: risk acceptance and its expiry

From Lesson 5: an acceptance needs an authority proportionate to the band, a rationale, a compensating measure where one exists, and an expiry date. Automation enforces all four and — the part that matters most — brings it back when it expires.

```text
Trigger    Record created on the risk acceptance table

Validate   Rationale present; expiry date present and within the maximum
           allowed for the risk's band; compensating measure present or
           explicitly waived with a reason.
           Fail -> return to requester, do not proceed.

Approve    Approver derived from the risk's residual band:
             Critical  -> executive risk committee
             High      -> business unit executive
             Moderate  -> department head
             Low       -> practitioner review only
           Approval is sequential where the band demands more than one.

On approve Set risk state = Accepted; stamp approver, date, expiry;
           write the acceptance reference onto the risk;
           schedule nothing (the expiry sweep handles it).

On reject  Risk returns to its previous state with the rejection comments;
           notify the risk owner that a response is still required.
```

And the sweep, deliberately separate:

```text
Trigger    Scheduled, daily

Look up    Accepted risks where expiry <= today + 30
             AND no open re-decision task           <- idempotency guard

For each   Create a re-decision task for the risk owner.
           On expiry with no decision: set risk state back to its
           pre-acceptance state, clear the acceptance, and notify both
           the owner and the original approver.
```

That last behavior is the one worth arguing for with a customer. The default many organizations want is a grace period, or a notification only. The correct default is that the acceptance **lapses**: an expired acceptance that keeps suppressing a risk is a permanent exception created by inattention, which is precisely the governance failure the expiry date exists to prevent.

Because the same approval-by-band pattern recurs — policy exceptions, control waivers, acceptance — build it once as a **subflow** taking the band and the record as inputs and returning an outcome. Reuse here is not just tidiness: it means the escalation matrix is defined in one place, and when the committee structure changes you edit one thing.

## Flow three: launching and chasing an attestation campaign

Lesson 4 left you launching campaigns by hand. Automating it:

```text
Trigger    Scheduled, on the first working day of each attestation period

Resolve    The campaign's control population from the entity type
           (see Lesson 6) as of today.

Pre-check  For each entity: is there a derivable respondent?
             No  -> add to an exceptions list, do NOT issue an attestation
           Publish the exceptions list as one task to the GRC admin group
           before anything is sent.

Generate   Optional: run the evidence report per entity and attach it to
           the attestation, so the respondent confirms rather than assembles.

Issue      Create attestations with the period's due date.
           One consolidated notification per respondent, not per attestation.

Chase      Separate scheduled flow: at due minus 5 days, one digest to
           respondents with outstanding items; at due plus 1, one digest
           to their managers; at due plus 10, raise an issue per outstanding
           attestation.

Close      At period end: mark unanswered attestations as such (never as
           passed), recompute control effectiveness, publish completion
           statistics to the KPI indicator from Lesson 7.
```

The pre-check step is the one that separates a campaign that works from one that generates a support queue. Sending a hundred attestations of which twelve have no valid recipient means twelve permanent overdue items and a completion rate that never reaches its target for reasons unrelated to compliance. Find them first, fix the ownership data, then send.

## Where a business rule is the right answer

Flows do not cover everything. Data integrity on a single record, enforced at write time, is a business rule.

```javascript
// Before-update business rule on the policy table.
// Condition: state changes to Published.
// Purpose: a published policy must have an owner, an approved review
//          interval, and at least one statement. Enforced at write time,
//          because a flow could only correct this after it was already true.
(function executeRule(current, previous) {

  var problems = [];

  if (!current.owner) {
    problems.push('a named policy owner');
  }
  if (!current.review_interval_months ||
      parseInt(current.review_interval_months, 10) <= 0) {
    problems.push('a review interval greater than zero');
  }

  // Table and field names here are illustrative; check the policy statement
  // table name and its reference to the policy on your release.
  var stmt = new GlideAggregate('sn_policy_statement');
  stmt.addQuery('policy', current.getUniqueValue());
  stmt.addQuery('active', true);
  stmt.addAggregate('COUNT');
  stmt.query();
  var statementCount = stmt.next()
    ? parseInt(stmt.getAggregate('COUNT'), 10) : 0;
  if (statementCount === 0) {
    problems.push('at least one active policy statement');
  }

  if (problems.length) {
    gs.addErrorMessage('Cannot publish: this policy needs ' +
                       problems.join(', ') + '.');
    current.setAbortAction(true);
    return;
  }

  // Derive the next review date from the interval at publication time.
  var next = new GlideDateTime(current.getValue('sys_updated_on'));
  next.addMonthsLocalTime(parseInt(current.review_interval_months, 10));
  current.setValue('next_review_date', next.getDate());

})(current, previous);
```

Two things to notice. The rule aborts rather than corrects, because publication is the moment the obligation becomes real and a half-formed published policy is a compliance defect, not a data quality one. And it derives `next_review_date` at publication rather than trusting a hand-entered value, which is what makes Flow One's sweep reliable — automation downstream is only as good as the field it queries.

## Reaching outside: Scripted REST APIs

Sooner or later a GRC program has to exchange data with something else: an external audit portal wants control status, a scanning platform wants to push findings, a corporate intranet wants to display the current policy set. A Scripted REST API is the right tool when you need a **contract you define** — specific resources, specific shapes, specific authentication — rather than raw table access.

```javascript
// Scripted REST resource: GET /api/x_nw_grc/controls/{entity_id}/status
// Returns the current effectiveness of every control on one entity.
// Read-only, scoped, and it never exposes evidence text.
(function process(request, response) {

  var entityId = request.pathParams.entity_id;
  if (!entityId) {
    response.setStatus(400);
    return response.setBody({ error: 'entity_id is required' });
  }

  var out = [];
  var ctl = new GlideRecord('sn_compliance_control');
  ctl.addQuery('entity', entityId);
  ctl.addQuery('active', true);
  ctl.query();
  while (ctl.next()) {
    out.push({
      control_id:  ctl.getValue('number'),
      name:        ctl.getValue('name'),
      objective:   ctl.control_objective.getDisplayValue(),
      state:       ctl.getValue('state'),
      result:      ctl.getValue('compliance_result'),
      last_tested: ctl.getValue('last_test_date')
    });
  }

  response.setStatus(200);
  response.setBody({ entity_id: entityId, count: out.length, controls: out });

})(request, response);
```

The API design decisions that matter more than the code: it is read-only, so a compromised consumer cannot alter compliance state; it returns statuses and dates but no evidence text or attachment content, because the consumer's entitlement to see that has not been established; it takes an explicit entity rather than allowing an unbounded query; and it runs under a dedicated integration account with a role that grants exactly this read and nothing else. Use a Scripted REST API when you need that shaping. When an external system genuinely just needs filtered table access under existing ACLs, the platform's standard table API with a properly restricted role is less code and less to maintain — choosing it is a legitimate answer to "which tool," not a cop-out.

## Practice

Use a developer instance with the IRM applications available. Reuse the policies, risks, and controls you built in earlier lessons.

1. **Choose the tool, five times.** For each of these, name the mechanism and justify it in one sentence: (a) prevent a control from being retired while it has an open issue; (b) notify a risk owner 30 days before an acceptance expires; (c) let an external scanner push a nightly finding count per entity; (d) default a control's owner from its entity's support group when the control is generated; (e) require a second approval when a risk's residual band is Critical. At least one of your five answers should be a business rule and at least one a scripted REST API.

2. **Build the policy review flow.** Implement Flow One, at minimum: the scheduled sweep with its idempotency guard, task creation, and the "no change" branch stamping a reviewer and date. Then prove the guard by running the sweep twice and showing that the second run creates nothing.

3. **Build the acceptance subflow.** Implement approval-by-band as a reusable subflow taking the record and the band as inputs, and call it from a risk acceptance flow. Demonstrate two different bands routing to two different approvers.

4. **Implement the publication business rule.** Adapt the rule above to your instance's tables, then try to publish a policy with no statements and confirm the abort message names the specific missing item. Explain in two sentences why a flow could not have enforced this.

5. **Expose one API.** Build a read-only Scripted REST resource returning control status for one entity. Call it with a valid entity, a missing parameter, and an account lacking the integration role, and record what each returns. Then list two fields you deliberately excluded from the payload and why.

6. **Make a failure visible.** Add an explicit error path to one of your flows that creates a record and notifies a group. Force it to fail, and confirm the failure is visible somewhere a human actually looks — not only in the flow's execution log.

## Check your understanding

1. "Prevent a policy being published without an owner." Business rule or flow, and why?
2. Your nightly policy review sweep ran twice after a clone. What stops it creating duplicate review tasks?
3. An acceptance expires and nobody acts. What should the sweep do by default?
4. When is the standard table API a better answer than a Scripted REST API?

*Answers:* (1) A before business rule; it must stop the save, and flows run after the fact. (2) An idempotency guard in the lookup condition: "and no active review task exists." (3) Let the acceptance lapse: return the risk to its pre-acceptance state and notify owner and approver. (4) When the consumer just needs filtered table access under existing ACLs with a properly restricted role, and no custom contract or shaping is needed.
