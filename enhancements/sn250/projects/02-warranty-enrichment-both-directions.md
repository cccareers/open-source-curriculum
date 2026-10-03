---
course_id: sn250
project_id: sn250-x02
title: "Warranty Enrichment, Both Directions"
kind: supplementary-project
status: draft
hours_estimate: 8
difficulty: stretch
related_lessons:
  - sn250-08
  - sn250-09
  - sn250-10
objectives:
  - Expose a Scripted REST API and call an external REST or SOAP service from the platform
  - Schedule recurring work and trigger script logic from platform events
  - Debug a failing script and reduce the cost of an expensive query
competency_ids:
  - D7-S1-C04
  - D7-S1-C02
  - D8-S1-C03
  - D7-S1-C03
  - D7-S1-C01
---

## Scenario
This is lesson 8's worked example, built for real. When a hardware incident names an asset tag, Acme wants the inventory system's warranty data on the record. The inventory system is not yours, so you will stand in for it with a public JSON echo service. When an incident is enriched, two independent parties care (the asset team's log and the assignee's email) — so you will announce it with an event. Failed calls must retry later, not in the user's save. And the asset team wants to read an incident's enrichment status through a narrow API of yours.

## What you will build / produce
In scope `x_acme_inv` (or your own):
1. **REST Message** `Inventory Service` with method `getAsset`, endpoint `https://postman-echo.com/get?asset_tag=${asset_tag}` (any HTTPS echo returning JSON will do — see Instructor notes), timeout 10 s.
2. **Script include `AcmeInventoryClient`** with `getAsset(assetTag)` returning a plain object `{ok, status, warranty_end, raw}` and never throwing.
3. Fields on incident (global, created deliberately and documented): `u_asset_tag` (String 40), `u_warranty_end` (Date), `u_enrich_status` (Choice: pending, done, failed), `u_enrich_attempts` (Integer).
4. **Async business rule** on incident, condition `category is hardware AND u_asset_tag changes AND u_asset_tag is not empty`, calling the client, writing results, and firing `x_acme_inv.incident.enriched` on success.
5. **Event registration** + **script action** (writes an audit log line / row) + **event notification** (to assigned_to).
6. **Scheduled job** `Retry failed warranty enrichment` (On Demand while building, then every 15 min): bounded (25), idempotent, max 3 attempts, one tagged log line.
7. **Scripted REST API** `GET /api/x_acme_inv/v1/enrichment/{number}` returning `{number, asset_tag, warranty_end, status, attempts}` with 200/400/404 and role `x_acme_inv.reader`.
8. Tests: ATF REST test + server-side test; background PASS/FAIL verifier; SQL-debug evidence for one optimized query.

## Before you start (prerequisites, starter files or data)
- PDI, admin. Outbound internet from a PDI is normally allowed; confirm by testing the REST Message from its record (**Test** related link).
- `sn_atf.runner.enabled = true`.
- A test user with only `x_acme_inv.reader` (and `snc_platform_rest_api_access` if your release requires it for REST — verify) and one with no roles.

## Milestones
1. **Outbound by hand.** Background script with `sn_ws.RESTMessageV2`, `setHttpTimeout(10000)`, status check before `JSON.parse`. Log the echoed `args.asset_tag`.
2. **Move it into a REST Message record + include.** Use *Preview Script Usage* and copy the exact constructor arguments. The include maps the echo's `args.asset_tag` to a fake warranty date (e.g. today + 365 days) so the flow has a value to write — document this as a stub.
3. **Async rule + event.** Implement; fire `gs.eventQueue('x_acme_inv.incident.enriched', current, current.getValue('assigned_to'), current.getValue('u_asset_tag'))` on success only. Re-read the incident inside the rule before writing (`previous` is null; the record may have changed).
4. **Two listeners.** Script action (guard `current.isValidRecord()`), and an email notification triggered by the event with `event.parm2` in the subject.
5. **Failure path.** Temporarily change the REST Message endpoint to `https://postman-echo.com/status/500` (or an unresolvable host). Save a hardware incident with a tag: user save is instant; `u_enrich_status = failed`; error logged with incident number and status; no event fired.
6. **Retry job.** Query `u_enrich_status=failed^u_enrich_attempts<3`, `setLimit(25)`; increment attempts *before* the call; mark done/failed after; log `[warranty-retry] tried N, ok X, failed Y, gave_up Z`. Restore the endpoint; Execute Now; failed records become done; a second Execute Now does nothing (idempotence).
7. **Inbound API.** Build the resource with `GlideRecordSecure`, regex validation of `INC\d{7}`, explicit role on the resource, and `response.setBody()`.
8. **Performance.** Write a naive report script that loops over hardware incidents and does a `new GlideRecord('sys_user')` per row to print the assignee's manager; count statements with SQL debug (System Diagnostics > Session Debug > Debug SQL); fix with dot-walk or cache; count again.
9. **Tests and verifier.**

### ATF tests
- **REST (inbound):** *Create a REST Request* → GET `/api/x_acme_inv/v1/enrichment/INC0000000` (not found) → *Assert Status Code* 404; GET with `abc` → 400; GET with a real number created in an earlier *Record Insert* step → 200 → *Assert JSON Response Payload Element* `status` exists. Run the request as the reader user (basic auth in the step) — step names vary by release.
- **Server:** *Run Server Side Script*: `new AcmeInventoryClient().getAsset(null)` returns `{ok:false}` without throwing; `getAsset('LAP-00421').ok === true` while the endpoint is healthy.

### Background verifier
```javascript
(function () {
  var pass = 0, fail = 0;
  function check(label, ok) { ok ? pass++ : fail++; gs.info((ok ? 'PASS ' : 'FAIL ') + label); }

  var c = new AcmeInventoryClient();
  var nullRes = c.getAsset(null);
  check('null input handled', nullRes && nullRes.ok === false);

  var live = c.getAsset('LAP-00421');
  check('live call ok (status ' + (live && live.status) + ')', live && live.ok === true);

  var reg = new GlideRecord('sysevent_register');
  check('event registered', reg.get('event_name', 'x_acme_inv.incident.enriched'));

  var sa = new GlideRecord('sysevent_script_action');
  sa.addQuery('event_name', 'x_acme_inv.incident.enriched');
  sa.addActiveQuery();
  sa.query();
  check('active script action', sa.hasNext());

  var job = new GlideRecord('sysauto_script');
  check('retry job exists', job.get('name', 'Retry failed warranty enrichment'));

  var stuck = new GlideAggregate('incident');
  stuck.addQuery('u_enrich_status', 'failed');
  stuck.addQuery('u_enrich_attempts', '<', 3);
  stuck.addAggregate('COUNT');
  stuck.query();
  stuck.next();
  gs.info('INFO failed-but-retryable incidents: ' + stuck.getAggregate('COUNT'));

  var ev = new GlideAggregate('sysevent');
  ev.addQuery('name', 'x_acme_inv.incident.enriched');
  ev.addQuery('state', 'processed');
  ev.addAggregate('COUNT');
  ev.query();
  ev.next();
  check('at least one processed enrichment event', parseInt(ev.getAggregate('COUNT'), 10) >= 1);

  gs.info('RESULT ' + pass + ' passed, ' + fail + ' failed');
})();
```

## Acceptance criteria
- [ ] No credentials or endpoints in scripts (endpoint lives on the REST Message).
- [ ] Outbound call only in async rule / job, never in before/after rules; user save time unaffected by a failing endpoint.
- [ ] One event, two listeners, both demonstrably fired from one announcement.
- [ ] Retry job bounded, idempotent, gives up after 3 attempts, logs one tagged line.
- [ ] Inbound API: 200/400/404 correct; no-role user receives 403 (or no data); response is hand-built.
- [ ] SQL statement count reduced by at least 5x in milestone 8.
- [ ] Verifier `RESULT n passed, 0 failed`; ATF tests pass.

## Evidence checklist
- [ ] REST Message record and *Test* result; outbound HTTP log entries (System Logs > Outbound HTTP Requests) for success and failure.
- [ ] Transaction timing of a save with the failing endpoint (transaction log or browser timing).
- [ ] `sysevent` row in state processed + script action log line + `sys_email` entry.
- [ ] Two retry-job log lines (first run does work, second does nothing).
- [ ] REST API Explorer screenshots for 200/400/404/403.
- [ ] SQL debug statement counts before/after.
- [ ] ATF results and verifier output.

## Rubric
| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Outbound robustness | No timeout or parses before status check | Timeout, status check, try/catch, logs with record number | Distinguishes 4xx (no retry) from 5xx/timeout (retry) |
| Timing choices | Call in user transaction | Async rule + job | Explains why event over async rule for listeners |
| Inbound contract | Table API passthrough or leaks fields | Validated, versioned, secured, hand-built body | Documents idempotence/limits as in lesson 8 |
| Debugging/perf | No measurement | Before/after statement counts | Uses Script Debugger or Debug Business Rule evidence to explain a defect found |
| Tests | None | ATF + verifier pass | Negative cases for every resource and the include |

## Stretch goals
- Replace the echo with a second PDI's Scripted REST endpoint acting as "inventory".
- Use `gs.eventQueueScheduled` to schedule a warranty-expiry reminder 30 days before `u_warranty_end`.
- Add exponential backoff (next attempt time field) to the retry job.

## Reflection prompts
- What did the user experience when the endpoint failed, and why?
- Which listener would you add next, and what would you have had to change in the rule to add it? (Answer should be: nothing.)
- Which of your queries was most expensive before optimizing, and how did you find out?

## Instructor notes (common pitfalls, how to adapt for time)
- **Echo service availability**: `postman-echo.com` has been a stable public echo; it is a third party and may change. Alternatives: `httpbin.org`, or a second PDI. Not verified for every network.
- Fields on `incident` are global-scope customizations; in a scoped app learners will hit cross-scope access when writing them. That is a teaching moment — have them record the cross-scope privilege. Alternatively create the fields in global via a separate update set and note it.
- Scoped REST Message naming in the constructor varies; always copy from *Preview Script Usage*.
- ATF REST step names and auth options vary by release.
- **Time-box:** 4-hour version — skip milestones 6 and 8 and the REST ATF test.
