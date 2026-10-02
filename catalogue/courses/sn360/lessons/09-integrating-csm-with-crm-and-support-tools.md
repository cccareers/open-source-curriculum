---
lesson_id: sn360-09
course_id: sn360
pathway: servicenow-implementation-specialist
title: Integrating CSM with CRM and Support Tools
order: 9
kind: lesson
competency_ids:
  - D3-S1-C05
  - D8-S1-C01
  - D8-S1-C04
objectives:
  - Integrate CSM with a CRM or support tool and handle synchronization failures safely
---

## CSM is never the only system

Every CSM implementation you will work on sits in a landscape. The CRM already holds accounts and contacts and thinks it owns them. The ERP holds orders, shipments, and the entitlement dates you need. A telephony platform holds the calls. Sometimes a legacy ticketing tool is still running for one region. Your case is one record in a chain that spans four systems and three vendors.

Two failure modes dominate. The first is **duplication**: two systems both create contacts, and within a month a customer has three records and their case history is split across all of them. The second is **silent divergence**: the integration errors at three in the morning, nothing retries, nobody is told, and the two systems drift apart until a customer notices that the contract you cancelled is still charging them.

This lesson is about avoiding both. The tooling — Integration Hub, Flow Designer, connection and credential aliases, transform maps — is the easy part. The design decisions in the first two sections are the part that determines whether the integration survives its first bad week.

## Decide the contract before you build anything

**Which system is the system of record for each entity?** Not "for the integration" — per entity. Write it as a table and get it signed off, because every other decision follows from it.

| Entity | System of record | Direction | Consequence |
| --- | --- | --- | --- |
| Account | CRM | CRM to ServiceNow | Accounts are read-only in ServiceNow; no agent may create one |
| Contact | CRM | CRM to ServiceNow | Portal self-registration must create a CRM contact, not a local one |
| Installed product | ERP | ERP to ServiceNow | Nightly batch is acceptable; install base is not edited locally |
| Case | ServiceNow | ServiceNow to CRM | The CRM sees a summary, not a second case |
| Contract / entitlement | CRM | CRM to ServiceNow | Renewals happen in the CRM; ServiceNow reflects them |

The consequence column is the one people skip and the one that matters. "Accounts are read-only in ServiceNow" is not a sentence in a design document; it is an access control you have to write, a form your agents will complain about, and a support process for the case where a customer's address is wrong and the fix is in another team's system.

**Then decide the shape of the flow.** Four axes:

- **Direction** — one-way or bidirectional. Bidirectional sync of the same field from both sides needs a conflict rule, and "last write wins" is a rule, not an absence of one. Prefer one-way per field wherever the business allows.
- **Trigger** — real time on change, near real time via event, or scheduled batch. Real time for anything a human is waiting on; batch for reference data.
- **Push or pull** — does the other system call you, or do you call it? Push from the source is timelier; pull is easier to restart after an outage because you control the cursor.
- **Granularity** — record at a time or bulk. A nightly install base load of 40,000 rows is a bulk job; a case status update is a single call.

**And decide identity.** Every synchronized record needs a stable foreign key stored on both sides. On the platform, the `correlation_id` field on task-extended tables exists for exactly this, with `correlation_display` naming the external system. For accounts and contacts, add an explicit external-id field. Never match on name or email alone: names change, emails are reused, and a match on display value is a merge waiting to happen.

## Building the integration with Integration Hub

Integration Hub gives Flow Designer the ability to call outward. The pieces:

- A **spoke** is a packaged set of actions for a specific product. When a spoke exists for the system you are integrating with, use it — the authentication, pagination, and error semantics are already handled.
- An **action** is one callable unit — create a contact, get an account — with typed inputs and outputs, usable in any flow. When no spoke fits, you build custom actions from REST steps.
- A **connection and credential alias** decouples the endpoint and credentials from the action. This is what lets the same flow run against development, test, and production without editing a step. Configure aliases from day one; retrofitting them after the URLs are hard-coded into six actions is a bad afternoon.
- A **MID Server** is required when the target system is inside a network the instance cannot reach directly. Know it exists and factor it into the design; an on-premises legacy tool almost always needs one.

Authentication is configuration, not code: prefer OAuth 2.0 with a credential record over basic auth, store nothing in a script, and confirm who owns the rotation of the credential before go-live.

For inbound traffic, the choices are:

- **Scripted REST API** — the external system calls a resource you define. Best when the payload needs interpretation or when you must respond synchronously with a result.
- **Import set with a transform map** — the external system posts rows, or you pull them, and they land in a staging table before being transformed into the target table. Best for bulk reference data, because the staging row survives to be inspected when the transform rejects it.

That last property is worth stating plainly: **an import set gives you the failed record; a direct write gives you a log line.** For anything loading volume, prefer the staging pattern.

## Data integrity: validation, transformation, error handling

An integration that writes bad data is worse than one that fails, because failure is visible. Three layers of defense.

**Validate at the boundary.** Check the payload before you write anything. Required fields present, types correct, references resolvable, enumerated values within the allowed set. Reject the record with a specific reason rather than coercing it into something writable.

```javascript
// Scripted REST resource: validate an inbound contact before writing.
(function process(request, response) {
  var body = request.body.data;
  var errors = [];

  if (!body.external_id) { errors.push('external_id is required'); }
  if (!body.email || body.email.indexOf('@') < 0) { errors.push('a valid email is required'); }
  if (!body.account_external_id) { errors.push('account_external_id is required'); }

  var account = new GlideRecord('customer_account');
  account.addQuery('u_external_id', body.account_external_id);
  account.setLimit(1);
  account.query();
  if (!account.next()) {
    errors.push('account ' + body.account_external_id + ' is not known to this instance');
  }

  if (errors.length) {
    response.setStatus(422);
    response.setBody({ status: 'rejected', errors: errors });
    return;
  }

  // Idempotent upsert, keyed on the external id - never on name or email.
  var contact = new GlideRecord('customer_contact');
  contact.addQuery('u_external_id', body.external_id);
  contact.setLimit(1);
  contact.query();
  var isNew = !contact.next();
  if (isNew) { contact.initialize(); }

  contact.setValue('u_external_id', body.external_id);
  contact.setValue('email', body.email);
  contact.setValue('first_name', body.first_name || '');
  contact.setValue('last_name', body.last_name || '');
  contact.setValue('account', account.getUniqueValue());
  var sysId = isNew ? contact.insert() : (contact.update(), contact.getUniqueValue());

  response.setStatus(isNew ? 201 : 200);
  response.setBody({ status: 'ok', sys_id: sysId, created: isNew });
})(request, response);
```

Three properties of that handler are the point of the example. It **rejects with a reason** — a 422 listing what was wrong, which is a message the other team can act on, unlike a 500. It is **idempotent**: the same message delivered twice produces one contact, because the query is keyed on the external id. And it **resolves references rather than inventing them**: an unknown account is a rejection, not a newly created account, because auto-creating parents from a child payload is how a clean account list becomes a landfill.

**Transform deliberately.** In a transform map, coalesce on the external id field so re-runs update instead of duplicating. Use field maps for the straightforward columns and scripted maps only where a genuine translation is needed — state code to choice value, date format, currency. Use `ignore = true` in an `onBefore` script to skip a row rather than writing a half-record. Where a reference cannot be resolved, decide once whether the correct behavior is skip-and-report or create-a-placeholder, and apply it consistently.

**Handle errors as a designed path.** For each integration, answer five questions and configure the answer:

1. **Retry?** Transient failures — timeouts, 429, 503 — retry with exponential backoff and a cap. Permanent failures — 400, 401, 422 — must never retry, because retrying a rejected payload just multiplies the log noise.
2. **Where does a failed record go?** A dedicated error table or the import set staging row, holding the payload, the timestamp, the error, and the retry count. Something a human can query, fix, and replay.
3. **Who is told, and when?** A single failure is a log entry. Ten in an hour, or any failure of a job that runs once daily, is an alert to a named group. Configure the threshold, not just the logging.
4. **How is it replayed?** A supported way to re-run one record and to re-run a window. If replay requires a developer with a background script, replay will not happen at three in the morning.
5. **How do you know you are still in sync?** A reconciliation job. Once a day, count records on both sides and compare a checksum of the fields that matter; report the drift. This is the control that catches the failure modes nobody predicted, and it is the one most often skipped.

Flow Designer supports much of this natively: error handling on actions, a flow that catches and writes to your error table, and a scheduled flow for retries and reconciliation. Use those rather than a script that swallows exceptions.

## Worked example: Northwind's CRM sync

The requirement: the CRM owns accounts and contacts; ServiceNow owns cases; the account team wants case activity visible in the CRM.

**Inbound, contacts and accounts.** The CRM emits a webhook on create and update. It calls a scripted REST resource like the one above. Rejections return 422 with reasons; the CRM team's integration dashboard shows them. Nightly, a scheduled flow pulls the full account list via an Integration Hub action and reconciles: accounts present in the CRM but absent locally are reported, not silently created, because a missing account usually means a rejected webhook worth investigating.

**Inbound, install base.** A nightly file from the ERP loads into an import set. The transform coalesces on serial number, resolves the account by external id, and skips with a reported reason where it cannot. Rows that skip stay in the staging table and appear on a daily exception report.

**Outbound, case summary.** A flow triggered on case creation and on case closure calls an Integration Hub action to write a summary object to the CRM's activity timeline. The flow stores the CRM activity id back on the case's `correlation_id`, so updates address the existing record rather than creating a second one.

```json
{
  "external_case_id": "CS0012345",
  "account_external_id": "CRM-ACCT-88123",
  "contact_external_id": "CRM-CON-40921",
  "subject": "Controller alarms overnight at Rivergate",
  "status": "resolved",
  "opened_at": "2026-03-11T22:14:07Z",
  "closed_at": "2026-03-13T09:02:44Z",
  "entitlement": "Gold",
  "resolution_code": "Configuration corrected"
}
```

Notice what the payload does *not* contain: work notes, agent names, attachments, and internal diagnostics. Decide field by field what crosses the boundary. An integration is a disclosure, and "we sent everything because it was easier" is not a defensible answer when the receiving system has a different audience.

**Failure handling.** Outbound failures write to an integration error table with the payload and the response, retry three times with backoff, and alert the integration group at five failures in an hour. A daily reconciliation compares case counts closed yesterday against activities created in the CRM and reports any difference.

**Testing.** Before go-live, test the ugly cases specifically: a webhook delivered twice, a contact whose account has not arrived yet, a payload missing a required field, the CRM returning 500 for ten minutes, a contact deleted in the CRM, and a case closed while the CRM is unreachable. Each of those should produce a defined, observable outcome. If any of them produces a stack trace in the system log and nothing else, the integration is not finished.

## Migrating off the old tool

Most CSM implementations replace something, and the replaced system holds history. Migration is an integration with a deadline and no second chance, so it gets its own design rather than being appended to the sync work.

**Decide how much history moves.** The instinct is "everything." The better question is what anyone will actually do with it. Three tiers, in descending order of cost:

- **Open cases must move.** They are live work; the team cannot run two systems.
- **Recently closed cases usually should move** — enough for a customer to see their last few months and for agents to recognize a repeat problem. Six to twelve months is typical.
- **Older history is often better archived than migrated.** A read-only export, searchable, referenced by case number, satisfies most of the need at a fraction of the cost and without polluting your reporting with records that have no entitlement, no channel, and no resolution code.

**Map the closed-case fields honestly.** A migrated case has no task SLA, no entitlement, and often no installed product. If you write it into the case table alongside native cases, every metric in lesson 10 is now measuring a mixture of two things. Either stamp migrated records with a flag every report filters on, or accept a visible discontinuity in the trend and document the date.

**Rehearse the cutover.** A full-volume trial load into a sub-production instance, timed. You need to know whether the load takes two hours or fourteen before you agree a weekend window. Count records at both ends, and reconcile before declaring success.

**Plan the freeze and the fallback.** There is a window where the old system is read-only and the new one is not yet live. Write down what happens to a case raised during that window, who is watching, and what the decision point is for rolling back. A cutover plan without a documented abort criterion is optimism with a timeline.

**Keep the old identifiers.** Store the legacy case number on the migrated record and make it searchable. Customers and agents will quote it for years, and matching on it is a five-minute configuration during migration and an archaeology project afterwards.

## Practice

1. **Write the contract.** Produce the system-of-record table for a CSM-plus-CRM landscape, including the consequence column. For at least one entity, name the access control or process change the consequence forces.

2. **Build the inbound resource.** Implement a scripted REST resource that upserts contacts keyed on an external id, validating required fields and resolving the account. Prove idempotency by posting the same payload three times and confirming one contact exists.

3. **Prove the rejection path.** Post a payload with an unknown account and one with a malformed email. Confirm each returns 422 with a specific, actionable message and writes nothing.

4. **Load the install base.** Import a CSV of installed products through an import set and transform map, coalescing on serial number. Include three deliberately bad rows — unknown account, missing serial, duplicate serial — and confirm each is skipped with a readable reason that survives in the staging table.

5. **Build the outbound flow.** Using an Integration Hub action against any test endpoint, send the case summary payload on case closure and store the returned id on the case. Then make the endpoint fail and implement retry with backoff plus an error record.

6. **Alert and reconcile.** Configure the alert threshold for repeated failures and a daily reconciliation job that compares record counts on both sides and reports the drift. Introduce a deliberate divergence and confirm the job finds it.

7. **Rehearse a bad night.** Take the six ugly cases listed above, run each against your integration, and write one line per case describing the observed behavior. Fix anything whose only output was a log entry.
