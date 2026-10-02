---
lesson_id: sn280-11
course_id: sn280
pathway: servicenow-implementation-specialist
title: Integrating ITSM with External Systems
order: 11
kind: lesson
competency_ids:
  - D2-S1-C03
  - D8-S1-C03
  - D8-S1-C05
objectives:
  - Integrate ITSM with an external system and monitor the integration once it is live
---

## ITSM is never the only system

Every ITSM implementation of any size ends up talking to something else. A monitoring platform that should open incidents when it detects a failure. A vendor's ticketing system that must receive escalated incidents and send updates back. An HR system that drives onboarding requests. A CMDB feed from a cloud provider. A telephony system that pops the caller's record.

Each of these is a two-part problem: getting the mechanics right, and keeping the integration healthy after the go-live party. The second part is the one implementations neglect, and it is the reason a monitoring integration that worked perfectly in March is silently dropping half its alerts by September.

## Decide the direction and the trigger first

Before choosing a protocol, answer two questions.

**Direction.** Is ServiceNow the caller (outbound) or the callee (inbound)? Most real integrations are both, and it helps to describe them as a pair of one-directional flows rather than as one bidirectional thing.

**Trigger.** What starts each flow?

- *Event-driven, outbound* — a record changes, ServiceNow calls out. Lowest latency, and it puts the work in your transaction, so it must be asynchronous.
- *Event-driven, inbound* — the external system calls ServiceNow when something happens. The best pattern where the external system supports webhooks, because nothing is polled and nothing is missed between polls.
- *Scheduled, outbound* — ServiceNow polls the external system on a timetable. The fallback when the other side has no webhooks. Simple, and it always has a latency floor equal to the interval.
- *Scheduled, inbound* — the external system pushes a file or a batch on a timetable. Common for HR and finance feeds.

A monitoring integration should be inbound and event-driven. An asset feed from a procurement system is usually inbound and scheduled. A vendor escalation is outbound event-driven with an inbound event-driven update channel. Naming the pattern early prevents the classic mistake of building a five-minute poll where a webhook was available.

## REST, SOAP, and the spokes above them

**REST** is the default for anything modern. Resources addressed by URL, verbs carrying the operation, JSON payloads, HTTP status codes carrying the outcome.

**SOAP** is still real, and you will meet it at customers with older enterprise systems — service management tools, ERP platforms, telecom provisioning systems. It is XML with an envelope, a WSDL describing the contract, operations rather than resources, and faults rather than status codes. ServiceNow consumes it through a SOAP Message record, which imports a WSDL and generates the available operations; you supply the payload and read the response. The mechanics differ from REST, but the surrounding design questions — authentication, retry, correlation, monitoring — are identical, so learn those once and apply them to both.

Above both sits **Integration Hub**, which packages integrations as **spokes** — sets of ready-made flow actions for a specific product or protocol. Where a spoke exists for the system you are integrating with, the sequence is: use the spoke's actions in a flow, configure a connection and credential record, done. No REST message, no response parsing, no auth code.

The order of preference, and it is a strong one:

1. **A spoke, used from a flow.** Configuration, visible, upgrade-safe, with connection and credential handled by the platform.
2. **A generic REST or SOAP step in a flow**, where no spoke exists but the flow gives you the surrounding process.
3. **A REST Message or SOAP Message record**, invoked from a script include. Necessary when the call is not part of a process — inside a business rule, or in reusable logic.
4. **Hand-written HTTP in a script.** Almost never.

Most inherited integrations sit at level 3 or 4 because they predate the spokes. Migrating them is a legitimate improvement, but not a free one.

## Outbound: calling another system

An outbound REST call defined as a REST Message record, invoked from a script include:

```javascript
var VendorEscalation = Class.create();
VendorEscalation.prototype = {

  initialize: function () {},

  escalate: function (incidentGr) {
    var payload = {
      external_ref: incidentGr.getUniqueValue(),
      ticket_number: incidentGr.number.toString(),
      summary: incidentGr.short_description.toString(),
      severity: this._mapPriority(incidentGr.priority.toString()),
      opened_at: incidentGr.opened_at.getDisplayValue()
    };

    var request = new sn_ws.RESTMessageV2('Vendor Ticketing', 'Create Ticket');
    request.setRequestBody(JSON.stringify(payload));
    request.setHttpTimeout(15000);

    try {
      var response = request.execute();
      var status = response.getStatusCode();

      if (status === 201 || status === 200) {
        var body = JSON.parse(response.getBody());
        incidentGr.correlation_id = body.id;
        incidentGr.correlation_display = 'Vendor Ticketing';
        incidentGr.update();
        return true;
      }

      gs.error('Vendor escalation failed for {0}: HTTP {1} {2}',
        incidentGr.number, status, response.getBody());
      return false;

    } catch (ex) {
      gs.error('Vendor escalation threw for {0}: {1}', incidentGr.number, ex.message);
      return false;
    }
  },

  _mapPriority: function (priority) {
    var map = { '1': 'critical', '2': 'high', '3': 'normal', '4': 'low', '5': 'low' };
    return map[priority] || 'normal';
  },

  type: 'VendorEscalation'
};
```

Four things in that code are the difference between a demo and a production integration.

**A timeout is set.** Without one, a hung external system holds a ServiceNow thread. On a synchronous path that is a user staring at a spinner; at volume it is a scheduler exhaustion incident.

**Failures are caught and logged with the record number in the message.** An integration whose failures are invisible is an integration you will hear about from the vendor, not from your instance.

**The response is checked before it is parsed.** Parsing the body of a 500 response throws, and the throw is what appears in the log instead of the actual error.

**`correlation_id` is stored.** This is the field that connects the ServiceNow record to the external system's record, and it is what every subsequent update depends on. An integration with no correlation field can only ever create, never update, and every retry produces a duplicate on the far side.

The call must not run inside the user's save transaction. Invoke it from an **async business rule** or, better, from a **flow**, so a slow vendor never slows the service desk.

## Inbound: being called

Two mechanisms, for two different needs.

**The Table API** is the platform's generic REST interface: create, read, update, and delete records on any table the caller is authorized for. It is available with no development. Use it when the external system is well-behaved, when it is happy to speak in ServiceNow's field names, and when the access can be scoped tightly with an integration user whose roles are minimal.

**A Scripted REST API** is a custom endpoint you define: your own path, your own request and response contracts, your own validation. Use it when you want to decouple the external system from your table structure — which you almost always should, because a partner integrating against your raw `incident` table has just made every future field change a breaking change for them.

```javascript
// Scripted REST resource: POST /api/x_acme/monitoring/alert
(function process(request, response) {

  var body = request.body.data;

  // Validate before touching any table.
  if (!body.alert_id || !body.node || !body.summary) {
    response.setStatus(400);
    return { error: 'alert_id, node and summary are required' };
  }

  // Idempotency: the monitoring tool retries, so the same alert_id may arrive twice.
  var existing = new GlideRecord('incident');
  existing.addQuery('correlation_id', body.alert_id);
  existing.addQuery('state', '!=', 7); // not Closed
  existing.query();

  if (existing.next()) {
    existing.work_notes = 'Repeat alert received from monitoring at ' + new GlideDateTime();
    existing.update();
    response.setStatus(200);
    return { incident: existing.number.toString(), created: false };
  }

  // Resolve the node to a CI so impact, assignment and reporting all work.
  var ci = new GlideRecord('cmdb_ci');
  var ciFound = ci.get('name', body.node);

  var inc = new GlideRecord('incident');
  inc.initialize();
  inc.short_description = body.summary;
  inc.description = body.details || body.summary;
  inc.correlation_id = body.alert_id;
  inc.correlation_display = 'Monitoring';
  inc.contact_type = 'monitoring';
  inc.urgency = (body.severity === 'critical') ? 1 : 3;
  if (ciFound) {
    inc.cmdb_ci = ci.getUniqueValue();
  }
  var sysId = inc.insert();

  response.setStatus(201);
  return { incident: inc.number.toString(), created: true, sys_id: sysId };

})(request, response);
```

The design points generalize to every inbound integration you will build.

**Validate first, and return 400 with a readable message.** The far side's developer has to debug this too.

**Be idempotent.** Networks retry. A monitoring tool that does not get a response in two seconds will send the alert again, and an endpoint that blindly inserts will produce four incidents for one outage. Idempotency keyed on the external identifier is not optional.

**Resolve references rather than storing names.** Looking up the CI here is what makes the incident useful to everything you built in the previous ten lessons. An incident with `cmdb_ci` empty and the hostname buried in the description is an incident outside your process.

**Do not set derived fields.** Urgency is set; priority is not, because the matrix derives it. Same single-derivation-path rule as everywhere else.

**Use a dedicated integration user with minimal roles**, never an administrator account, and never a person's account. Authenticate with OAuth 2.0 where the far side supports it; basic authentication over TLS where it does not; mutual TLS where the customer's security posture requires it. Store credentials in the platform's credential records, never in a script or a system property.

Where the external system lives inside the customer's network and cannot be reached from the instance, the call goes through a **MID Server**, the same component that carries discovery traffic.

## Bulk and file-based data

Not everything is an API call. Feeds of asset data, user data, or CI data commonly arrive as files or as bulk table loads, and the platform's path for these is **import sets and transform maps**.

The pattern: data lands in a staging table, a transform map defines how staging columns become target fields, and a coalesce field decides whether each row is an insert or an update. Field maps can be one-to-one or scripted. Scheduled data imports run the whole thing on a timetable.

The coalesce field is the idempotency mechanism here, and it deserves the same care as `correlation_id`: coalescing on a weak column produces duplicates, exactly as a weak CMDB identification rule does.

For CI data specifically, prefer loading through the platform's identification and reconciliation engine rather than writing directly to CI tables, so your inbound feed obeys the same identification and precedence rules from lesson 10 as everything else.

## Monitoring the integration once it is live

This is the half that gets skipped. An integration is a running system with a failure rate, and it needs the same operational treatment as any other.

**Know where the evidence is.** Outbound REST and SOAP calls are recorded in the outbound HTTP log with their endpoint, status, and duration. Inbound API calls appear in the transaction log with their response time. MID Server traffic passes through the ECC queue, where a growing backlog is the first symptom of a stalled MID Server. Flow execution contexts show which step an integration flow stopped on. Application logs hold whatever your `gs.error` calls wrote — which is why writing them with the record number in the message matters.

**Instrument four things**, and build them at implementation time:

1. **Volume.** Calls per hour, in each direction. A drop to zero is the most common real failure, and it is invisible unless you are watching volume rather than errors — a source that stops calling produces no errors at all.
2. **Error rate.** Non-2xx responses as a proportion of calls, split by status code. A rising 401 rate is a credential expiring; a rising 429 is rate limiting; a rising 500 is the far side's problem and you now have evidence.
3. **Latency.** Response time distribution, and specifically the slow tail. Averages hide the calls that are timing out.
4. **Backlog and staleness.** For scheduled integrations: the age of the newest record received. A feed that last delivered data thirty hours ago on a six-hour schedule is broken, regardless of whether anything logged an error.

Wire at least the second and fourth into an alert that creates an incident, assigned to the team that owns the integration. An integration failure should enter the same ITSM process as any other failure — it is, after all, an unplanned interruption to a service.

## Optimizing an integration that is too slow

When an integration is diagnosed as slow or overloaded, work through these in order.

**Reduce the number of calls.** Batching, where the far side supports it, is usually the biggest single win: one call carrying fifty records beats fifty calls. For polling integrations, query incrementally by a last-modified timestamp instead of pulling the full set every cycle.

**Reduce the size of each payload.** Request only the fields you use. On outbound queries against the Table API pattern, that means an explicit field list and a display-value setting chosen deliberately, because returning display values forces additional resolution work per reference field.

**Move work off the user's path.** Anything synchronous that does not need to be becomes async or moves into a flow. This does not make the integration faster; it makes it stop being the service desk's problem.

**Respect rate limits, and back off.** A 429 handled by immediately retrying makes the situation worse. Exponential backoff with a retry ceiling, and a failure path when the ceiling is hit.

**Reconsider the pattern.** A five-minute poll against a system that supports webhooks is doing 288 calls a day to learn nothing on most of them. Switching direction is often a bigger improvement than any amount of tuning.

**Fix the indexes on your side.** An inbound integration that queries by `correlation_id` on a multi-million-row table needs an index on `correlation_id`. This is frequently the entire explanation for an inbound API that got slower as the instance grew.

## Practice

Work in a personal developer instance, capturing your work in one named update set. Use a public test endpoint or a second developer instance as the external system.

1. **Pattern selection.** For each integration, name the direction, the trigger pattern, and the protocol or spoke you would use, with one sentence of justification: a monitoring tool that must open incidents; a nightly HR feed of new starters; a vendor ticketing system needing two-way updates; a chat tool that should be notified when a major incident is declared.

2. **Inbound.** Build a Scripted REST API that accepts a monitoring alert and creates an incident, including validation, idempotency on an external identifier, and CI resolution by node name. Call it with a valid payload, an invalid payload, and the same valid payload twice. Record the status code and result for each.

3. **Correlation.** Confirm `correlation_id` and `correlation_display` are populated on the created incident, and write two sentences explaining what breaks in the vendor-update direction if they are not.

4. **Outbound.** Build a REST Message and a script include that sends an incident to your external endpoint, storing the returned identifier back on the record. Include a timeout, a status check, and error logging that names the incident.

5. **Async.** Invoke the outbound call from an async business rule or a flow rather than synchronously. Explain in two sentences what a fifteen-second vendor response would have cost the service desk under the synchronous design.

6. **Failure handling.** Point the outbound integration at an endpoint that returns a 500, and then at one that does not respond. Record what your code did in each case, what appeared in the logs, and what the user saw. Fix anything that failed silently.

7. **Monitoring.** Build the four instruments described above for your outbound integration — volume, error rate, latency, and staleness — as reports or as a dashboard. Then define the alert condition for each and state which team the resulting incident is assigned to.

8. **Optimization.** Given a polling integration that pulls 10,000 records every five minutes and uses about 2% of them, write a one-page improvement plan naming at least three specific changes, in the order you would make them, with the expected effect of each and how you would measure it.
