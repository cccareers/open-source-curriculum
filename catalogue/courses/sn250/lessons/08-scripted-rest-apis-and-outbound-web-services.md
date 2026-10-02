---
lesson_id: sn250-08
course_id: sn250
pathway: servicenow-implementation-specialist
title: Scripted REST APIs and Outbound Web Services
order: 8
kind: lesson
competency_ids:
  - D7-S1-C04
  - D7-S1-C02
  - D8-S1-C03
objectives:
  - Expose a Scripted REST API and call an external REST or SOAP service from the platform
---

## Two directions

An integration goes one of two ways. Either another system calls the platform — **inbound** — or the platform calls another system — **outbound**. This lesson teaches one tool for each: **Scripted REST APIs** for inbound, **RESTMessageV2** and **SOAPMessageV2** for outbound.

That is deliberately the whole scope. Getting a request in and a request out, correctly and safely, is the foundation. The packaged integration content, the mapping of inbound payloads onto tables through transform maps, and the operational monitoring of running integrations each belong to their own course. What you build here is the piece those things sit on.

Before either direction, the vocabulary. A REST call is an HTTP request: a **method** (`GET` read, `POST` create, `PUT` replace, `PATCH` partially update, `DELETE` remove), a **URL**, **headers** (content type, authentication), and usually a **body** in JSON. The response carries a **status code** — `200` fine, `201` created, `400` your request was malformed, `401` you did not authenticate, `403` you authenticated but are not allowed, `404` no such thing, `500` the server broke — and usually a body. Those codes are a contract; using them properly is most of what makes an API pleasant to consume.

## Inbound: do you even need a script?

The platform already exposes every table over REST through the **Table API**. `GET /api/now/table/incident?sysparm_query=active=true&sysparm_limit=10` works today, respects ACLs, and required no development.

Write a Scripted REST API when the Table API is the wrong shape:

- The consumer needs **one call** for something that is three table calls, and you do not want them orchestrating your data model.
- The payload should be **yours**, not the table's — stable field names that survive a schema change, and none of the fields you would rather not publish.
- The request needs **processing**, not storage: validate, transform, route, then respond.
- You want a **narrow surface**. "Create a ticket" is a smaller promise than "write to the incident table".

That last point is the strongest argument. Every field you expose is a field you have promised, and a Scripted REST API lets you promise exactly six.

## Building a Scripted REST API

Create the service record first: a **Name**, an **API ID** (which becomes part of the URL), and it inherits your application scope. The base path is `/api/<scope>/<api_id>`.

Then add **resources**. Each resource has an HTTP method, a relative path, and a script. Paths can carry parameters in braces: `/tickets/{ticket_number}`.

A read resource:

```javascript
(function process(request, response) {

  var number = request.pathParams.ticket_number;

  if (!/^INC\d{7}$/.test(number)) {
    response.setStatus(400);
    response.setBody({ error: 'ticket_number must look like INC0010023' });
    return;
  }

  var gr = new GlideRecordSecure('incident');
  if (!gr.get('number', number)) {
    response.setStatus(404);
    response.setBody({ error: 'No ticket found with that number' });
    return;
  }

  response.setStatus(200);
  response.setBody({
    number:      gr.getValue('number'),
    state:       gr.getDisplayValue('state'),
    priority:    gr.getValue('priority'),
    opened_at:   gr.getValue('opened_at'),
    assigned_to: gr.getDisplayValue('assigned_to'),
    summary:     gr.getValue('short_description')
  });

})(request, response);
```

Four things in that script are the lesson.

**`GlideRecordSecure`, not `GlideRecord`.** An inbound request runs as some user. Using the secure class means the caller sees only what that user is allowed to see — the platform's own ACLs, enforced for free. A plain GlideRecord in a web service is how an integration account with one role ends up able to read everything.

**Validate before you query.** The regular expression is not decoration. Every value in `pathParams`, `queryParams`, and the body arrived from outside and can be anything.

**A hand-built response object.** The consumer gets six named fields, not the incident table. Rename a column next quarter and this API still honours its contract.

**Correct status codes, with a body that explains.** `404` with `{"error": "..."}` tells the caller what to fix. A `200` containing an empty object does not.

A write resource:

```javascript
(function process(request, response) {

  var body = request.body ? request.body.data : null;

  if (!body || !body.summary) {
    response.setStatus(400);
    response.setBody({ error: 'summary is required' });
    return;
  }
  if (String(body.summary).length > 160) {
    response.setStatus(400);
    response.setBody({ error: 'summary must be 160 characters or fewer' });
    return;
  }

  var allowedUrgency = ['1', '2', '3'];
  var urgency = String(body.urgency || '3');
  if (allowedUrgency.indexOf(urgency) === -1) {
    response.setStatus(400);
    response.setBody({ error: 'urgency must be 1, 2 or 3' });
    return;
  }

  var gr = new GlideRecord('incident');
  gr.initialize();
  gr.setValue('short_description', body.summary);
  gr.setValue('urgency', urgency);
  gr.setValue('caller_id', gs.getUserID());
  gr.setValue('contact_type', 'integration');

  var sysId = gr.insert();
  if (!sysId) {
    gs.error('Scripted REST: incident insert refused for ' + gs.getUserName());
    response.setStatus(500);
    response.setBody({ error: 'Could not create the ticket' });
    return;
  }

  response.setStatus(201);
  response.setHeader('Location', gs.getProperty('glide.servlet.uri') +
    'api/x_acme/tickets/tickets/' + gr.getValue('number'));
  response.setBody({ number: gr.getValue('number'), sys_id: sysId });

})(request, response);
```

`request.body.data` is the parsed body — an object for JSON, so you do not parse it yourself. `request.body.dataString` gives you the raw text when you need it. Guard for a missing body: a `POST` with none at all makes `request.body.data` unusable, and reading a property of it throws a `500` that says nothing useful.

Note the allow-list on `urgency`. Validating against a list of permitted values is stronger than checking for values you dislike, because the list of things you did not think of is always longer.

For a structured error there is `response.setError`:

```javascript
var sr = new sn_ws_err.ServiceError();
sr.setStatus(400);
sr.setMessage('Invalid request');
sr.setDetail('urgency must be 1, 2 or 3');
response.setError(sr);
```

### Designing the contract

Before the script, decide what you are promising. Four decisions, all of which are painful to change once a consumer has built against them.

**Resource names are nouns; the method is the verb.** `GET /tickets/{number}` and `POST /tickets`, not `GET /getTicket` and `POST /createTicket`. The HTTP method already says what is happening.

**Decide what happens when the same request arrives twice.** Networks retry. A `POST` that creates a second identical ticket because the first response was lost is a real operational problem. Either accept a client-supplied reference and refuse duplicates, or document that duplicates are the caller's problem — but decide, rather than discover.

**Bound every list response.** A resource returning "all matching tickets" will one day be asked for forty thousand of them. Support a `limit` query parameter with a sane default and a hard maximum, and tell the caller how many there were:

```javascript
var limit = Math.min(parseInt(request.queryParams.limit || '50', 10) || 50, 200);
```

**Name your fields for the consumer, not for the table.** `summary` rather than `short_description`, `state` as a readable label rather than a numeric code. The consumer does not have your data dictionary and should not need it.

Query parameters arrive on `request.queryParams`, and each one is an **array** when the same name appears more than once, so a defensive read is worth the extra line:

```javascript
function firstParam(params, name, fallback) {
  var raw = params[name];
  if (raw === undefined || raw === null || raw === '') {
    return fallback;
  }
  return Array.isArray(raw) ? String(raw[0]) : String(raw);
}
```

### Securing it

Three layers, and you want all three.

1. **Requires authentication** — on by default on the resource. Leave it on. An unauthenticated endpoint is a public endpoint.
2. **Requires ACL authorization**, plus explicit roles on the resource. Give the integration its own service account with the narrowest role that works, not `admin`.
3. **In-script checks** — `gs.hasRole(...)` for anything role-dependent, `GlideRecordSecure` for data access, and validation on every input.

Two more habits. **Version the API** — the resource path supports a version segment, and a consumer pinned to `v1` does not break when you ship `v2`. And **never leak internals**: an exception message in a response body can disclose table names, script names, and instance structure. Log the detail with `gs.error`, return something generic.

### Testing it

The **REST API Explorer** builds and sends requests against your instance, shows the response, and generates sample code. Use it before you tell a consumer the endpoint exists. Test at minimum: the happy path, a missing required field, an unknown record, a malformed parameter, and a call from a user without the role — that last one is the test people skip and the one that finds the real defect.

## Outbound: RESTMessageV2

To call an external service, use `sn_ws.RESTMessageV2`.

```javascript
(function callInventoryService(assetTag) {

  try {
    var r = new sn_ws.RESTMessageV2();
    r.setHttpMethod('GET');
    r.setEndpoint('https://inventory.example.com/api/v1/assets/' + encodeURIComponent(assetTag));
    r.setRequestHeader('Accept', 'application/json');
    r.setHttpTimeout(10000);   // milliseconds — always set one

    var response = r.execute();
    var status = response.getStatusCode();
    var bodyText = response.getBody();

    if (status !== 200) {
      gs.error('Inventory lookup failed for ' + assetTag + ': HTTP ' + status + ' ' + bodyText);
      return null;
    }

    var data = JSON.parse(bodyText);
    return { model: data.model, location: data.location, warranty: data.warranty_end };

  } catch (e) {
    gs.error('Inventory lookup threw for ' + assetTag + ': ' + e.message);
    return null;
  }
})('LAP-00421');
```

The pieces you will always need: `setHttpMethod`, `setEndpoint`, `setRequestHeader`, `setRequestBody` for writes, `execute()`, and on the response `getStatusCode()`, `getBody()`, `getHeaders()`, and `haveError()` / `getErrorMessage()`.

Four rules that separate an integration that survives contact with reality from one that does not:

**Always set a timeout.** Without one, a hung remote service holds a platform thread. If the call is inside a user's save, it holds the user too.

**Check the status code before parsing.** An error response is often HTML, and `JSON.parse` on HTML throws a confusing error that sends people hunting in the wrong place.

**Wrap it in `try`/`catch`.** Network failures throw rather than returning a status.

**Do it asynchronously when you can.** `executeAsync()` returns immediately and the response arrives via the ECC queue. Better still, make the outbound call from an async business rule, a scheduled job, or a flow — never from a before rule, where the user waits for a machine you do not control.

### Failing well

Remote systems fail in ways local code does not, and the difference between a fragile integration and a robust one is entirely in how it handles them.

**Distinguish the failure kinds.** A `4xx` means *your request* was wrong — retrying it unchanged will fail identically, so log it and stop. A `5xx` or a timeout means *the other end* had a problem, and retrying later may well succeed. Treating both the same way either hammers a service with a request it will never accept, or gives up on a blip.

**Retry with a delay, and with a limit.** Never in a loop inside the same transaction; queue the retry for later — a scheduled job that picks up failed rows, or a flow with a wait. Two or three attempts, spaced out, then a record of the failure that a human can see.

**Log what you will need at 2am**: the endpoint, the status code, the identifier of the record you were working on, and the first part of the response body. Not the credentials, and not the whole body if it is large.

**Never let an outbound failure corrupt local state.** If the remote call is meant to mark a record as sent, mark it only after a confirmed success. A record marked sent on a call that timed out is worse than one that is retried unnecessarily.

### Credentials

Do not put credentials in a script. Ever. Not in a variable, not in a property you think is protected, not "temporarily".

The supported path is a **REST Message** record with an authentication profile — basic auth with a credential record, or OAuth with a registered provider — and your script uses the message rather than a raw endpoint:

```javascript
var r = new sn_ws.RESTMessageV2('x_acme.Inventory Service', 'getAsset');
r.setStringParameterNoEscape('asset_tag', assetTag);
var response = r.execute();
```

The REST Message defines the endpoint, the methods, the headers, and the variable substitutions (`${asset_tag}` in the endpoint or body); the credential lives in a credential record the script cannot read. `setStringParameter` escapes the value for XML; `setStringParameterNoEscape` does not, so use the escaping version for anything going into an XML body.

The REST Message record also has a **Preview Script Usage** button that generates working script for a method you have already tested from the record. Build and test the message record first, then generate the script — it is faster than writing it and it starts you from a call that is known to work.

One more piece of the picture: when the target system is inside a customer network rather than on the internet, the call is routed through a **MID Server**, selected on the REST Message or in the script. Nothing about the scripting changes.

## SOAP, and why you still meet it

Plenty of established enterprise systems expose SOAP rather than REST. SOAP is XML over HTTP with a schema — a **WSDL** — describing every operation and every field.

The workflow is: create a **SOAP Message** record, give it the WSDL URL, and let the platform generate the operations and their parameters. Then call it:

```javascript
try {
  var s = new sn_ws.SOAPMessageV2('x_acme.LegacyBilling', 'getInvoice');
  s.setStringParameter('account_number', accountNumber);
  s.setStringParameter('invoice_id', invoiceId);
  s.setHttpTimeout(15000);

  var response = s.execute();
  if (response.getStatusCode() !== 200) {
    gs.error('SOAP getInvoice failed: HTTP ' + response.getStatusCode());
  } else {
    var xml = new XMLDocument2();
    xml.parseXML(response.getBody());
    gs.info('Invoice total: ' + xml.getNodeText('//invoiceTotal'));
  }
} catch (e) {
  gs.error('SOAP getInvoice threw: ' + e.message);
}
```

The differences from REST that will actually bite you: the response is XML, so you parse it with `XMLDocument2` and XPath rather than `JSON.parse`; SOAP faults come back with a `200` status and a fault element in the body, so checking the status code is not enough; and namespaces in the response make XPath expressions fussier than the examples suggest. Everything else — timeouts, credentials in a message record, `try`/`catch`, asynchronous execution — is identical to REST, which is why REST came first in this lesson.

## Worked example: both directions, one requirement

The requirement: *when an incident is categorised as hardware and names an asset, enrich it with warranty data from the inventory system. Separately, let the inventory system open a ticket in the platform when it detects a failure.*

**Outbound half.** A script include, `AcmeInventoryClient`, with one public method `getAsset(assetTag)`: it builds the call from a REST Message record with a credential alias, sets a 10-second timeout, checks the status, parses the body, and returns a plain object or `null`. Every failure is logged with the asset tag and the status code, and nothing throws to the caller. An **async** business rule on `incident` — condition `category is hardware and asset changes` — calls it and writes the warranty date onto the record. Async, because the user should not wait for a remote server, and because a failed enrichment must not fail their save.

**Inbound half.** A Scripted REST API `tickets`, version `v1`, one `POST /tickets` resource. It requires authentication and a custom role held by exactly one integration user. It validates `summary`, `urgency`, and `asset_tag` against an allow-list, creates the incident with `contact_type` set to `integration`, and returns `201` with the number and a `Location` header. Every rejection is a `400` with a message the remote developer can act on, and every unexpected failure is a `500` whose detail exists only in the system log.

Notice the symmetry in the failure handling. Outbound, you assume the other system is slow, unavailable, or lying about its content type. Inbound, you assume the caller sends a field you did not expect, forgets one you require, and is authenticated as someone with fewer rights than they think. Neither assumption is pessimism; both are the normal operating condition of an integration.

## Practice

Work on a sub-production instance. Use a public test API — any service that echoes JSON back to you over HTTPS — for the outbound exercises, and never point coursework at a production endpoint of a real vendor.

1. **Table API baseline.** Using the REST API Explorer, retrieve five active incidents through the Table API with a query and a field list. Save the request. In two sentences, say what a consumer would find awkward about it.

2. **Read resource.** Build a Scripted REST API with a `GET /tickets/{ticket_number}` resource returning six fields, using `GlideRecordSecure`. Test the happy path, a number that does not exist, and a malformed number, and confirm the status codes are `200`, `404`, and `400`.

3. **Write resource.** Add a `POST /tickets` resource that validates a required `summary` and an allow-listed `urgency`, creates the record, and returns `201` with the new number. Test with a valid body, a missing `summary`, an invalid `urgency`, and no body at all. Fix anything that returns a `500`.

4. **Lock it down.** Create a service account with one custom role, grant that role on your resources, and confirm from the REST API Explorer that an unauthorised user gets a `403` rather than data. Then check that your `GET` returns fewer fields for a low-privileged user than for an admin, and explain why.

5. **Outbound GET.** Write a background script using `RESTMessageV2` that calls a public JSON endpoint, sets a timeout, checks the status code before parsing, and logs one field from the response. Then point it at a URL that does not exist and confirm your error handling logs something useful instead of throwing.

6. **REST Message record.** Move exercise 5 into a REST Message record with a named method and a variable substitution, use *Preview Script Usage* to generate the script, and call it from a script include. Note in a comment what moved out of the script.

7. **Asynchronous by design.** Wire the script include from exercise 6 into an async business rule with a narrow condition. Prove with timestamps in the log that the user's save completed before the outbound call did.

8. **Read a WSDL.** Find a public WSDL, create a SOAP Message record from it, and describe two of its operations and their parameters in a comment. If you can call it, parse one value out of the response with `XMLDocument2`; if you cannot, write down how you would detect a SOAP fault that arrived with a `200` status.

9. **Design review.** For an integration that must create a record in the platform every time an external monitoring tool detects an outage, list: the direction, the tool you would use, the authentication approach, three inputs you would validate, and the status code you would return when the same outage is reported twice.
