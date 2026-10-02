---
lesson_id: sn280-07
course_id: sn280
pathway: servicenow-implementation-specialist
title: Service Catalog and Request Management
order: 7
kind: lesson
competency_ids:
  - D2-S1-C04
  - D2-S1-C01
objectives:
  - Build catalog items, variables, and order guides that produce correct request and task records
---

## A catalog item is a contract in two directions

The service catalog is where non-IT people meet the platform, and it is judged on two entirely different criteria at once.

The requester judges it on whether they can get what they need without knowing how IT is organized. They do not know that a laptop involves procurement, asset management, and desktop support. They know they need a laptop.

The fulfiller judges it on whether the request that arrives contains everything needed to do the work without a follow-up conversation. A request that says "new laptop" and nothing else is worse than a phone call, because now there is a record with a clock on it and still no information.

A catalog item is the artifact that satisfies both: a simple front door that produces a complete, structured, routable back end. Everything in this lesson is in service of that translation.

## The request data model

Four tables, and the relationships between them are the thing to internalize.

```text
sc_cat_item      the catalog item — the thing being offered
      │  ordered
      ▼
sc_request       REQ — the order. One per checkout, may contain several items.
      │  contains
      ▼
sc_req_item      RITM — one per item ordered. This is the unit of fulfilment.
      │  generates
      ▼
sc_task          SCTASK — the individual pieces of work that fulfil the RITM.
```

`sc_request`, `sc_req_item`, and `sc_task` all extend `task`, which is why fulfilment work appears in the same queues as incident and change work.

Where implementations go wrong is attaching things to the wrong level:

- **Approvals** normally belong on the RITM, not the REQ, because a single order may contain one item needing approval and one not. Approving a whole shopping cart because one line item was expensive is a bad experience and a governance mistake.
- **SLAs** attach to the RITM, because that is the unit the requester experiences as "my request." Lesson 8 covers the mechanics.
- **Fulfilment work** lives on SCTASK. If your item generates no tasks and expects the fulfiller to work directly on the RITM, you have lost the ability to route pieces of the work to different teams — which is the whole reason the level exists.
- **Reporting on "how long did requests take"** must be based on RITM, not REQ, or a single slow item makes an entire multi-item order look slow.

The **stage** field on the RITM is what the requester sees as progress. It is derived from the fulfilment process, not typed by anyone, and configuring it to reflect reality — Waiting for Approval, Fulfilment, Completed — is what stops the "what's happening with my request" emails.

## Catalogs, categories, and finding things

Above the item sit two organizing records.

A **catalog** (`sc_catalog`) is a whole storefront. Most implementations need exactly one for IT, and possibly separate ones for HR or facilities if those groups run their own. Do not create catalogs per department; that is what categories are for.

A **category** (`sc_category`) groups items within a catalog and can nest. Categories are navigation, and navigation is where catalogs fail. The rule: **categories should reflect what the requester is trying to do, not how IT is organized.** "Hardware," "Software," "Access," and "Onboarding" work because a requester can place their need in one. "Infrastructure Services" and "End User Compute" do not, because they are org-chart names.

Keep the tree shallow — two levels at most. Anything deeper is a search problem, and search is how most people find items anyway. Which means the item's **name and short description are load-bearing**: name items the way requesters describe them, not the way IT catalogs them. "Request a laptop," not "EUC Hardware Provisioning Standard Build."

**User criteria** control who can see and order an item. Configure availability by criteria — role, group, department, location, company — rather than building separate items per audience. An item visible to contractors and a near-identical item visible to employees is two items to maintain forever; one item with criteria is one.

## Variables: the questions that make the request complete

**Variables** (`item_option_new`) are the questions on the item. They are the single highest-leverage part of catalog design, because every field of information you fail to capture becomes a follow-up email that stops the clock.

The types you will use most:

| Type | Use for |
| --- | --- |
| Single Line Text | Short free text; avoid where a choice would do |
| Multi Line Text | Justifications, descriptions |
| Select Box | A fixed set of options |
| Lookup Select Box | Options drawn from a table, so the list stays current |
| Reference | A pointer to a real record — a user, a CI, a location |
| Checkbox | A genuine binary |
| Date / Date Time | Needed-by dates, start dates |
| Multiple Choice | Radio-style, when all options should be visible at once |
| List Collector | Several records from a table |
| Container Start / Split / End | Layout, to group questions visually |
| Label | Instructional text, not an input |
| Macro | An embedded widget, for the rare case a variable type cannot express |

Two design rules matter more than the type list.

**Prefer reference and lookup variables over text.** "Which application?" as a reference to a business service gives you a real CI on the request, which means the fulfiller knows what to touch and the reporting can group by service. As free text you get forty spellings of the same application name.

**Ask only what changes the work.** Every question has a cost paid by every requester. If a question's answer never alters what the fulfiller does or who does it, delete it. The most common offender is a "business justification" field on items that are approved automatically — nobody reads it, and it exists because someone assumed a form needed one.

**Variable sets** are reusable groups of variables shared across items. The onboarding questions — start date, manager, location, department — appear on a dozen items, and they should be one variable set referenced by all of them. When the customer adds a question next year, they add it once. Variable sets can also be **shared with a mapping**, so an order guide can pass answers between items.

**Catalog client scripts and catalog UI policies** are the catalog's equivalents of the form mechanisms from the previous lesson, and the same rule applies: if a catalog UI policy can express it, use the policy. Show the "which building?" question only when the delivery method is "desk delivery"; make the justification mandatory only when the requested quantity exceeds one. Conditions and actions, not script.

## Record producers, and when to use one

A **record producer** is a catalog-shaped front end that creates a record on *any* table rather than an RITM. The canonical use is "Report an issue" — a friendly form in the catalog that creates an `incident`, mapping variables to incident fields.

The distinction to be precise about:

- **Catalog item** → produces a REQ / RITM / SCTASK chain. Use when the thing is a *request for something*, fulfilled through the request process.
- **Record producer** → produces one record on a target table. Use when the thing being created is genuinely an incident, a problem, a change, or a record on a custom table.

Getting this wrong is common and consequential. A password reset offered as a catalog item creates a request for a service that was interrupted — which pollutes request metrics with incident work, exactly the conflation lesson 2 warned about. Conversely, a laptop order implemented as a record producer creating an incident is the same error mirrored.

A record producer's script maps variables onto the produced record's fields. Keep it thin — mapping and nothing else:

```javascript
// Record producer script: create an incident from the reported-issue form.
current.caller_id = producer.affected_user || gs.getUserID();
current.category = producer.issue_category;
current.subcategory = producer.issue_subcategory;
current.short_description = producer.summary;
current.description = producer.details;
current.cmdb_ci = producer.affected_service;

// Urgency comes from the user's answer; impact stays derived from the service
// so the priority matrix keeps a single derivation path.
current.urgency = producer.how_urgent;
```

Note what it does not do: it does not set priority, because priority is derived by the data lookup you configured in lesson 3. A record producer that sets priority directly is a second derivation path, and second derivation paths always diverge.

## Order guides

An **order guide** solves the case where one human intention produces several items. "Onboard a new employee" is not a request for a laptop; it is a request for a laptop, a phone, an email account, building access, and three application accounts, and the requester should answer the questions once.

An order guide has three parts:

**Questions asked once.** Defined as variables on the guide itself — usually a shared variable set — covering who the request is for, their start date, location, and role.

**A rule base** that decides which items are included. Rules are conditions on the guide's variables: if the role is "field engineer," include the ruggedized laptop and the vehicle kit; if the location is a specific site, include the badge item for that site. Configure these as **inclusion rules on each item**, so adding an item later means adding one rule rather than editing a central script.

**Variable mapping** so answers given on the guide populate the corresponding variables on each included item. This is the part that makes the guide feel like one form instead of five, and it is configured on the guide's item entries.

The result of submitting an order guide is **one REQ containing several RITMs**, each with its own approvals, its own fulfilment tasks, and its own stage. That is exactly right: the requester tracks one order, and each piece is worked independently by the team that owns it.

Two cautions. An order guide with a rule base of thirty conditions is a maintenance liability — at that point the customer's onboarding variability probably needs role-based bundles rather than per-attribute rules. And the guide must be honest about what it *cannot* order: if a role occasionally needs something outside the guide, provide a "additional items needed" path rather than letting the requester discover the gap on day one.

## Fulfilment: turning an RITM into work

An RITM does nothing on its own. Something has to generate the tasks, order them, and move the stage. That something is a **flow** attached to the catalog item — built in Flow Designer, which lesson 9 covers in depth. What you own here is the *design* of the fulfilment, which the flow then implements.

Design questions to answer for every item before you build anything:

**How many tasks, and to which groups?** A laptop request might be: procurement checks stock, desktop support images the machine, the asset team records it, the requester collects it. Four tasks, three groups, and one of them is conditional on stock.

**What is sequential and what is parallel?** Ordering the hardware and creating the accounts do not depend on each other and should run at the same time. Imaging cannot start before the hardware exists. Sequencing wrongly is the most common cause of requests taking twice as long as they should.

**What is the approval, and where does it sit?** On the RITM, before fulfilment starts, so you do not procure something that gets rejected. Approval sources are the requester's manager (dot-walked from the user record, never picked), the budget owner, or the item's owner group — chosen by rule.

**What happens when a task fails or is rejected?** The RITM must not sit in Fulfilment forever. Define the closure path for rejection and the notification path for failure.

**What closes the RITM?** Normally the completion of the last task. Configure the stage transitions to match, so the requester's view of progress is accurate rather than aspirational.

## Worked example: a software access request

Requirement: "Users request access to a licensed application. The app owner approves. If we have spare licenses, the identity team grants access. If not, procurement buys one first."

**Item design.** One catalog item, "Request application access," in the Access category, visible to all employees.

**Variables.** Four, all earning their place:
- `application` — a **lookup select box** or reference against the customer's list of licensable applications. Not free text.
- `access_level` — a select box whose options are filtered by the chosen application, using a catalog client script. Read-only until an application is chosen.
- `access_for` — a reference to a user, defaulting to the requester, so managers can request on behalf of staff.
- `business_justification` — multi-line text, mandatory **only** when the access level is one of the elevated options. A catalog UI policy, not a script.

**Approval.** On the RITM. The approver is the application's owner, dot-walked from the application record — so onboarding a new application does not require touching the catalog item. If `access_for` is not the requester, the requester's manager approves as well.

**Fulfilment.** After approval, the flow checks the application's available license count. If licenses are available: one task to the identity team to grant access. If not: a task to procurement to purchase, then the identity task. Sequential, because the second genuinely depends on the first.

**Stage.** Waiting for Approval → Fulfilment → Completed, driven by the flow rather than set by fulfillers.

**What was deliberately not built.** No separate item per application — one item with a lookup variable, so a new application is a data row. No priority field on the item — requests are not incidents and do not carry incident priority. No free-text application name. No justification field on standard access levels.

**How you would know it worked.** Two measures: the proportion of RITMs closed without a fulfiller having to contact the requester for missing information, and the proportion of access requests still arriving by email after go-live. The first measures whether the variables were right; the second measures whether the item was findable.

## Practice

Work in a personal developer instance, capturing your work in one named update set.

1. **Model.** Order any baseline catalog item. Then locate the resulting REQ, RITM, and SCTASK records and draw the relationships between them, naming the field on each record that points to its parent. State which record you would attach an approval to, and why.

2. **Categories.** Review the categories in your instance's service catalog. Rewrite the category list as you would propose it to a customer, using requester language, at no more than two levels. Justify one category you removed.

3. **Build the item.** Implement the software access request from the worked example, with all four variables and the correct types. The application variable must be a lookup or reference against a table, not free text.

4. **Catalog UI policy.** Make `business_justification` mandatory and visible only for elevated access levels, using a catalog UI policy. Test by switching the access level back and forth, including clearing it.

5. **Catalog client script.** Filter the `access_level` options based on the chosen application. Confirm the script does no synchronous server call.

6. **Variable set.** Extract the "who is this for" questions into a variable set and use it on two different items. Then add a new question to the set and confirm it appears on both.

7. **Record producer.** Build a "Report an issue" record producer that creates an incident, mapping at least four variables onto incident fields. Verify that priority is still derived by the matrix rather than set by your script. Then write two sentences on how you would explain to a customer why password resets belong here and not in the catalog as an item.

8. **Order guide.** Build an onboarding order guide that asks the starter's details once and includes at least three items, with at least one item included conditionally by a rule. Submit it and verify that you get one REQ with several RITMs, and that answers from the guide populated the item variables.

9. **Fulfilment design.** For your access request item, write the fulfilment design as a specification a flow author could build from: every task, its assignment group, its ordering, its condition, the approval and its source, the failure path, and the stage transitions. Do not build the flow — you will build one in the next lesson.
