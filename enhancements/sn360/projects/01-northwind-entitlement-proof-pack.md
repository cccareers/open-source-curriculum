---
course_id: sn360
project_id: sn360-x01
title: "Northwind Entitlement and SLA Proof Pack"
kind: supplementary-project
status: draft
hours_estimate: 5
difficulty: core
related_lessons:
  - sn360-04
  - sn360-02
  - sn360-03
objectives:
  - Configure entitlements and service contracts that drive customer-facing SLAs
  - Model accounts, contacts, consumers, and installed products so cases attach to the right customer
competency_ids:
  - D3-S1-C01
  - D2-S1-C04
---

## Scenario

Northwind Manufacturing (lesson 2's customer: parent account plus Rivergate and Ashcroft plants, contacts Dana, Sunil, and Priya) has escalated: a Rivergate case last month was quoted a 1-business-day Bronze response, but Northwind holds a Gold contract at the parent. Separately, Ashcroft's ruggedized controller has an extended-coverage entitlement nobody can find on cases. Their service director wants a proof pack: for each situation, the case, the entitlement the lookup chose, the SLAs attached, and the evidence that the pause and stop conditions behave as the contract says.

## What you will produce

- The Northwind account tree, contacts, product models, and install base from lesson 2 (rebuilt if needed).
- Gold, Bronze, and an installed-product-specific "Extended Ruggedized" entitlement; one active and one expired service contract.
- Four SLA definitions (Gold and Bronze, response and resolution), with the response SLA stopping on a genuine customer-visible agent reply.
- A no-match path you chose and defended.
- Five verification cases with evidence, plus ATF tests for at least two of them.

## Before you start (prerequisites, starter files or data)

- A PDI with Customer Service Management activated (plugin names vary by release; record what you activated) and your user holding CSM admin rights.
- Update set `NORTHWIND-ENT-001`.
- If you have taken sn301, enable ATF execution on the PDI for milestone 6.

## Milestones

1. **Model check.** Confirm the lesson 2 records exist with the right parents. Add serials `SN-4400-08812` (Model 4400, Rivergate) and `SN-4400-08813` (Model 4400 Ruggedized, Ashcroft).
2. **Contracts and entitlements.** On the Northwind parent: service contract "Northwind Gold 2026" (active) with a Gold entitlement scoped to the account; service contract "Northwind Bronze 2024" (end date in the past) with a Bronze entitlement. On `SN-4400-08813`: an "Extended Ruggedized" entitlement with a 2-hour response.
3. **Lookup order.** Order entitlement lookup most specific first: installed product, product model, contact, account.
4. **SLA definitions.** Build the lesson 4 table, plus a 2-hour response definition for Extended Ruggedized. For the response stop condition, add a flag (for example `u_first_agent_response`) set by a business rule when an agent (not the contact) adds a customer-visible comment; stop on that flag. Do not stop on assignment.
5. **No-match path.** Implement your choice: an "Unentitled" entitlement with a weak SLA, or empty entitlement plus a flag and a commercial triage queue. Write one sentence on why.
6. **Verification cases** (create each from the agent UI *and* repeat one via REST or a background script):
   - **V1** Sunil on `SN-4400-08812` at Rivergate: expect Gold (inherited from parent), Gold response and resolution SLAs.
   - **V2** Priya on `SN-4400-08813` at Ashcroft: expect Extended Ruggedized (specific beats account default).
   - **V3** A contact on a new account "Westbrook Foods" with only an expired contract: expect your no-match path.
   - **V4** Move V1 to Awaiting Info for a measured period (at least 10 minutes), then back to Open: resolution SLA elapsed excludes the pause; response SLA unaffected.
   - **V5** Assign V1 to an agent without commenting: response SLA still running. Then add a customer-visible comment as the agent: response SLA stops.
7. **ATF (if available).** Write at least two tests: V2 (Create a Record for the case as Priya's contact, Record Query asserting entitlement name) and V3 (assert the no-match outcome). Remember tests create their own data and impersonate.
8. **Proof pack.** Assemble the evidence and a one-page summary for the service director.

## Acceptance criteria

- [ ] V1 resolves to the parent's Gold entitlement without duplicating the contract on the child account.
- [ ] V2 resolves to the installed-product entitlement, not account Gold.
- [ ] V3 follows the documented no-match path; no stale Bronze entitlement attaches.
- [ ] V4 shows paused time excluded from resolution SLA business elapsed time.
- [ ] V5 shows the response SLA stops on a customer-visible agent comment, not on assignment.
- [ ] At least one verification repeated outside the agent form with the same result.
- [ ] All configuration captured in the update set.

## Evidence checklist

- [ ] Screenshot of the lookup rule order.
- [ ] For each of V1 to V5: case number, entitlement field, and the Task SLA related list (definition, stage, business elapsed).
- [ ] Output of this background script listing each verification case's entitlement and SLAs. Table and field names follow commonly documented CSM names; confirm `entitlement` on the case and `task_sla` fields on your PDI before running.

```javascript
var nums = ['CS0000001', 'CS0000002', 'CS0000003']; // replace with your V1-V3 numbers
nums.forEach(function (n) {
  var c = new GlideRecord('sn_customerservice_case');
  if (!c.get('number', n)) { gs.info(n + ' not found'); return; }
  gs.info(n + ' | account ' + c.getDisplayValue('account') + ' | entitlement ' + c.getDisplayValue('entitlement'));
  var s = new GlideRecord('task_sla');
  s.addQuery('task', c.getUniqueValue());
  s.query();
  while (s.next()) {
    gs.info('   SLA ' + s.getDisplayValue('sla') + ' | stage ' + s.getDisplayValue('stage') +
            ' | business elapsed ' + s.getDisplayValue('business_duration'));
  }
});
```

- [ ] ATF test results (if built).
- [ ] The service director summary: what was wrong, what you configured, and what Northwind must confirm (start condition, quiet period, no-match path).

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Entitlement design | Contracts duplicated per child account | Parent contract inherited; specific entitlement wins | Lookup order documented with a test per rule |
| SLA conditions | Response stops on assignment or state change | Stops on genuine customer-visible reply; pause on Awaiting Info | Breach warning flows at 50/75% and breach |
| No-match path | Unentitled cases run with no SLA | Explicit, defended path | Customer acknowledgment wording for unentitled cases drafted |
| Verification | Form-only checks | Five cases with SLA evidence, one off-form | ATF tests run green twice from clean start |

## Stretch goals

- Add a 20-case prepaid incident pack to Westbrook Foods that decrements on resolution and excludes duplicates; show the balance after three cases.
- Build the "Request replacement part" catalog item from lesson 4 practice step 6, visible only to Gold contracts.

## Reflection prompts

- Which of the five verifications would a customer notice first if it were wrong?
- Why is "stop the response SLA when the case is assigned" a lie?

## Instructor notes (common pitfalls, how to adapt for time)

- Learners often scope the Extended Ruggedized entitlement to the model rather than the serial; it then covers every ruggedized controller at every customer.
- V4 needs real elapsed time; run it during a break. Schedules matter: on a 24x7 schedule the effect is visible within minutes.
- For a 3-hour version, skip ATF and the expired contract.
