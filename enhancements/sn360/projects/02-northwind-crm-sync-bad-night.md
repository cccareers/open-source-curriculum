---
course_id: sn360
project_id: sn360-x02
title: "Northwind CRM Contact Sync: Surviving a Bad Night"
kind: supplementary-project
status: draft
hours_estimate: 6
difficulty: stretch
related_lessons:
  - sn360-09
  - sn360-02
objectives:
  - Integrate CSM with a CRM or support tool and handle synchronization failures safely
competency_ids:
  - D3-S1-C05
  - D8-S1-C01
  - D8-S1-C04
---

## Scenario

Northwind Manufacturing's CRM is the system of record for accounts and contacts (lesson 9's contract table). Last week the CRM's webhook delivered every update twice, a new Eastfield contact arrived before her account existed, and an outage meant twelve contact changes never arrived at all. Nobody noticed for four days. You will build the inbound contact resource, an error table, a replay path, and a daily reconciliation, then run the six "ugly cases" from lesson 9 and prove each produces a defined, observable outcome.

## What you will produce

- External-id fields on `customer_account` and `customer_contact`.
- A Scripted REST resource that validates and idempotently upserts contacts (lesson 9 pattern).
- An integration error table, a replay action, and an alert threshold.
- A reconciliation job comparing a "CRM extract" table against local contacts.
- A bad-night log covering six scenarios.

## Before you start (prerequisites, starter files or data)

- PDI with CSM activated. Update set `NORTHWIND-CRM-001`. Use a clean PDI fixture population, rebuilding lesson 2's Northwind Manufacturing account tree as needed. U1 tests contact insertion, so start without Dana's earlier lesson contact rather than creating a second copy of the same person.
- Add `u_external_id` (string, unique) to `customer_account` and `customer_contact`. Set `CRM-ACCT-88123` on Northwind Manufacturing, `CRM-ACCT-88124` on Rivergate, `CRM-ACCT-88125` on Ashcroft.
- Create `u_crm_contact_extract` (fields `external_id`, `email`, `account_external_id`, `last_modified`) to simulate the CRM's nightly full extract, and `u_integration_error` (fields `integration`, `payload` (string, 4000), `http_status` integer, `error`, `retry_count` integer, `state` choice: open / replayed / abandoned).
- Seed four additional synthetic contacts through the handler and create matching extract rows before the ugly cases: `CRM-CON-40922` through `CRM-CON-40925`, all under `CRM-ACCT-88123`, with unique `.example` emails. U1 creates Dana Whitfield (`CRM-CON-40921`) on that parent account as the fifth fixture contact; then include her in the extract. Use 40922 for U5 and 40923–40925 for U6. Reconciliation must be scoped to this CRM integration's external IDs, so unrelated demo contacts are not reported as deleted.
- Example valid payload for Dana (change external_id, email, first_name, and last_name for the four additional fixture contacts): `{"external_id":"CRM-CON-40921","email":"dana@northwind.example","first_name":"Dana","last_name":"Whitfield","account_external_id":"CRM-ACCT-88123"}`.
- Use only synthetic data in the error table; restrict payload read access to the integration operators and define retention. Verify actual dictionary names of all custom fields (Global fields normally gain a `u_` prefix), and adapt the query examples accordingly.
- You will call the resource with **System Web Services > REST API Explorer** or any HTTP client using a dedicated integration user with only the roles the resource requires.

## Milestones

1. **Build the resource** `POST /api/x_nw_crm/contacts` (or global scope equivalent) from the lesson 9 handler. Extend it: on any rejection, also insert a `u_integration_error` row with the raw payload and status 422; set `retry_count` 0.
2. **Use a dedicated account.** Create `svc.northwind.crm` with only the roles needed; require authentication and a resource ACL for a dedicated CRM integration role (authentication alone admits any authenticated caller); confirm an unauthenticated call is refused.
3. **Run the six ugly cases** and log each:
   - **U1 Duplicate delivery:** post the same valid payload for Dana three times. Expect one contact; responses 201, 200, 200.
   - **U2 Child before parent:** post a contact for `CRM-ACCT-99999` (not yet known). Expect 422 with "account ... is not known", an error row, and **no** account auto-created.
   - **U3 Missing field:** post without `email`. Expect 422 naming the field, no contact/account written, and an error row. Also test an absent body and non-string email; both must reject without throwing.
   - **U4 CRM unavailable (outbound simulation):** if you build the outbound case summary flow, point its connection alias at an unreachable URL and close a case; expect retries with backoff, an error row, and an alert at your threshold. If you skip outbound, simulate by inserting five error rows within an hour and confirm the alert fires.
   - **U5 Deleted in CRM:** remove a contact from `u_crm_contact_extract` and run reconciliation; expect the contact reported (and, per your agreed policy, flagged or deactivated, never deleted).
   - **U6 Missed changes:** change three emails in the extract table without posting webhooks; reconciliation must report all three as drift.
4. **Replay.** Create account `CRM-ACCT-99999` ("Northwind - Eastfield Plant") as a child of Northwind Manufacturing, then replay U2's error row with a UI action or a small scheduled flow that re-posts the stored payload to the same handler logic. Expect the contact created and the error row marked replayed.
5. **Alerting.** A scheduled job or flow that counts `u_integration_error` rows created in the last hour and notifies an integration group at five or more.
6. **Reconciliation.** Daily scheduled job comparing extract to local contacts by external id: missing locally, missing in CRM, and email drift. Write a summary record or notification, not just a log line.
7. **Bad-night log** and a one-page runbook for the on-call integration analyst.

## Acceptance criteria

- [ ] U1 yields exactly one contact.
- [ ] U2 and U3 return 422 with specific reasons, write nothing to contacts or accounts, and create error rows.
- [ ] Replay of U2 succeeds after the account exists, without a developer running a background script.
- [ ] The alert fires at the configured threshold and names the integration.
- [ ] Reconciliation reports U5 and all three U6 drifts.
- [ ] No contact or account was ever matched on name or email alone.
- [ ] The resource refuses unauthenticated calls and runs under a least-privilege account.

## Evidence checklist

- [ ] Resource script and its ACL / authentication settings.
- [ ] REST API Explorer (or client) request/response captures for U1 to U3 and the replay.
- [ ] Output of this check after U1 (one row expected):

```javascript
var c = new GlideRecord('customer_contact');
c.addQuery('u_external_id', 'CRM-CON-40921'); // Dana's external id in your payload
c.query();
gs.info('Contacts with this external id: ' + c.getRowCount());
var e = new GlideAggregate('u_integration_error');
e.addAggregate('COUNT');
e.groupBy('state');
e.query();
while (e.next()) gs.info('Errors ' + e.getValue('state') + ': ' + e.getAggregate('COUNT'));
```

- [ ] Alert notification screenshot.
- [ ] Reconciliation summary output for U5 and U6.
- [ ] Bad-night log: scenario, expected, observed, evidence, fix applied.
- [ ] Runbook (one page): how to read the error table, replay a record, replay a window, and when to escalate to the CRM team.

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Idempotency | Duplicates on redelivery | External-id keyed upsert; one contact | Also idempotent outbound via `correlation_id` |
| Rejection | 500 errors or coerced writes | 422 with actionable reasons; nothing written | Error rows categorized for trend reporting |
| Recovery | Failures only in logs | Error table, replay, alert threshold | Replay a window, not just a record |
| Reconciliation | None | Daily drift report | Checksums on the fields that matter, with owner and SLA for drift |
| Security | Admin account or unauthenticated | Dedicated least-privilege account | Credential rotation owner documented |

## Stretch goals

- Build the outbound case summary flow with Integration Hub (lesson 9 payload) against a request-bin style test endpoint, storing the returned id on `correlation_id`.
- Add a portal self-registration path that creates the contact in the "CRM" (the extract table) rather than locally, honoring the system-of-record contract.

## Reflection prompts

- Which ugly case would have been invisible without reconciliation?
- Why is auto-creating the missing account in U2 worse than rejecting the contact?

## Instructor notes (common pitfalls, how to adapt for time)

- Learners often test as admin through REST API Explorer; require the integration account for at least U1 to U3.
- `customer_contact` inserts may trigger welcome notifications on some configurations; disable outbound email on the PDI or check the email log.
- Scoped vs global: a scoped resource needs cross-scope access to `customer_contact`; record what you granted.
- For a 3-hour version, skip U4, the alert, and the runbook.
