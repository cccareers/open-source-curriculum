---
lesson_id: sn280-10
course_id: sn280
pathway: servicenow-implementation-specialist
title: CMDB and Asset Foundations for ITSM
order: 10
kind: lesson
competency_ids:
  - D5-S1-C01
  - D5-S1-C02
  - D5-S1-C03
  - D5-S1-C04
objectives:
  - Model configuration items, relationships, discovery, and asset lifecycle so ITSM processes can rely on the CMDB
---

## Why an ITSM course cares about the CMDB

Several times in this course a configuration decision has been deferred with the words "that depends on CMDB quality." Impact derived from the affected service rather than guessed by an agent. Assignment from the CI's support group rather than from a category rule. Change risk computed from what a change touches. Conflict detection based on which changes affect the same infrastructure. Every one of those is a better implementation than the alternative, and every one is unavailable to a customer whose CMDB is a spreadsheet import from three years ago.

This lesson is the ITSM-facing foundation of the CMDB: enough to model configuration items and relationships correctly, to understand how automated discovery keeps them accurate, to build a dependency map a change manager can act on, and to automate an asset lifecycle. It is deliberately not a Discovery deployment project or a Service Mapping engagement — those are their own bodies of work. What you need here is the modelling judgment and the configuration reasoning that let ITSM processes rely on the data.

The framing question for every decision in this lesson: **what ITSM decision does this record support?** A CMDB built to be complete is a CMDB that is never finished and never trusted. A CMDB built to answer "what does this outage affect" and "what does this change touch" is one that pays for itself in the first month.

## Configuration items and the class hierarchy

A **configuration item** is anything under configuration control that an IT service depends on. The `cmdb_ci` table is the base, and everything else extends it, in a hierarchy that gets more specific as it descends:

```text
cmdb_ci
├── cmdb_ci_hardware
│   ├── cmdb_ci_computer  ──▶ cmdb_ci_server ──▶ cmdb_ci_linux_server, cmdb_ci_win_server…
│   └── cmdb_ci_netgear   ──▶ routers, switches, firewalls…
├── cmdb_ci_appl          ──▶ application software, database instances…
└── cmdb_ci_service
    ├── cmdb_ci_service_discovered   (application services)
    └── business services, technical services…
```

Inheritance works exactly as it does for `task`: a field on `cmdb_ci` exists on every class beneath it, and a query against `cmdb_ci` returns everything.

**Choose the most specific class that is true.** A Linux server recorded as a generic `cmdb_ci` loses every attribute that makes it a server — operating system, CPU, memory, IP — and every downstream capability that expects those attributes. Class choice is not cosmetic; it determines which identification rules apply, which discovery patterns populate it, and which reports it appears in.

**Do not create custom CI classes casually.** The out-of-box hierarchy is deep and covers most infrastructure. A custom class is a commitment: no shipped discovery pattern populates it, no shipped identification rule identifies it, and every future capability that reasons about CI classes will not know about it. Extend only when the customer genuinely has a class of thing the model does not cover, and extend from the most specific existing parent.

The class distinction that matters most for ITSM is the **service** classes:

- A **business service** is what the business buys and complains about: "Payroll," "Customer Ordering." It is the CI that belongs on an executive report and, usually, on an incident.
- A **technical service** or **application service** is a deployable stack — the specific set of application instances, databases, and hosts that deliver a business service in an environment.

Get the vocabulary agreed with the customer early. "Service" means three different things to three different people in most organizations, and an incident tagged with the wrong kind of service is unusable for impact analysis.

## Relationships, and the dependency map

A CI on its own supports very little. The value is in **relationships** — records on `cmdb_rel_ci`, each with a parent CI, a child CI, and a relationship type.

Relationship types are directional and named from both ends: `Depends on::Used by`, `Runs on::Runs`, `Hosted on::Hosts`, `Contains::Contained by`. The direction is the part people get wrong. "Payroll *depends on* payroll-db-01" and "payroll-db-01 *is used by* Payroll" are the same record read from the two ends; entering it backwards inverts every impact calculation built on it.

The relationships that earn their keep in an ITSM implementation:

- **Business service depends on application** — the link that turns an application outage into a business impact statement.
- **Application runs on server** — the link that turns a server change into an application risk.
- **Server hosted on virtual host / in location** — the link that answers "what else is on this hypervisor."
- **Anything depends on a shared component** — the load balancer, the identity provider, the shared database cluster. These are the relationships that make impact analysis surprising, and therefore the ones worth the effort.

![A business service dependency map showing a business service resolving through application services to database and server configuration items, with a shared identity provider affecting several branches](./img/cmdb-service-dependency-map.png)

A **dependency map** is the visualization of these relationships from a chosen starting CI, and it is a real ITSM tool, not a diagram for a slide deck. Three uses:

**Impact analysis during an incident.** Start at the failed component, walk upward, and you have the list of affected business services and therefore of stakeholders to notify. This is how a major incident commander decides who to tell.

**Risk assessment during a change.** Start at the CI being changed and walk upward, and you have the blast radius. This is the CI-derived risk input that lesson 5 deferred.

**Conflict detection.** Two changes on different servers that both support the same business service are a conflict even though they share no CI directly. Only the relationship graph reveals it.

Building a map by hand is legitimate and often the right first step: for a customer's top ten business services, a manually curated map maintained by the service owners is worth more than an automatically generated map of two thousand CIs nobody has validated. Automated service mapping — where the platform traces the connections itself from traffic and configuration — is a larger project and belongs outside this course. What you should be able to do here is model a service's dependencies correctly, whatever the source of the data.

Two modelling cautions. **Depth costs.** Every hop you model is a hop somebody maintains, and a map that goes five levels down to individual libraries is a map that is wrong within a month. Model to the level at which the customer makes decisions. And **avoid cycles**: A depends on B depends on A produces a map that renders badly and an impact calculation that does not terminate cleanly.

## Discovery and reconciliation

Manually maintained CMDBs decay. The half-life is about six months, after which the data is misleading rather than merely incomplete, which is worse — an agent who cannot find a CI will ask; an agent who finds the wrong CI will act.

**Automated discovery** is the answer: the platform scans the network on a schedule, identifies what it finds, and creates or updates CIs. At a conceptual level it works through a **MID Server** — a lightweight application inside the customer's network that the instance instructs, since the instance itself cannot reach private infrastructure — which probes targets and returns data that **patterns** interpret into CI attributes and relationships.

You are not deploying Discovery in this course. What you must understand is what it does to your CMDB, because that is the part that affects every ITSM process you built.

**Identification** is the harder half. When discovery returns a server, the platform must decide whether it is a CI that already exists or a new one. It decides using the **Identification and Reconciliation Engine**, and the rules it applies are configuration you can inspect and adjust.

An **identification rule** for a CI class defines the identifier entries — the attribute sets that uniquely identify an instance of that class — in priority order. For a server, that might be: serial number first; failing that, the combination of name and IP address; failing that, name alone. Each entry can be marked as independent or dependent (identifying the CI only in the context of its parent, which is how a database instance is identified relative to its host).

Get identification wrong and you get **duplicate CIs**, which is the most damaging CMDB failure mode there is. Duplicates split an incident history across two records, break impact analysis silently, and are painful to merge afterward. When a customer's CMDB has three records for the same server, the cause is almost always an identification rule that let a weak attribute act as an identifier — hostname alone, in an environment where hostnames are reused.

**Reconciliation** handles the other half: when two sources disagree about an attribute, which one wins. **Data source precedence** rules say, per CI class and per attribute, which discovery source is authoritative. Discovery might own the operating system version; the HR or procurement system might own the assigned user; the virtualization platform might own the host relationship. Without precedence rules, the last writer wins, and your CMDB oscillates as each source overwrites the others on its own schedule.

Configure precedence deliberately, per attribute, and write it down. "Which system is the source of truth for this field" is a question the customer must answer, not one you should decide for them.

**CMDB health** dashboards measure the result across three dimensions:

- **Completeness** — required attributes populated, required relationships present.
- **Correctness** — duplicates, stale records not seen by discovery in N days, orphan CIs with no relationships.
- **Compliance** — CIs conforming to the class model and to the customer's own required-field policy.

Treat health as the acceptance criterion for the CMDB work, and pick the specific metrics tied to the ITSM capabilities you want: percentage of incidents with a CI populated, percentage of business services with a complete dependency map, duplicate rate on the classes ITSM references. Generic health scores get ignored; a metric attached to a capability the customer asked for does not.

## Assets and the lifecycle

A **configuration item** and an **asset** are two views of the same physical object, and the platform models them as two records for a good reason.

The CI answers *operational* questions: what does it run, what depends on it, what incidents has it had. The asset answers *financial and custodial* questions: what did it cost, who owns it, what is it worth now, when does its warranty end, where is it in its lifecycle. The two are linked, and the split exists because they have different lifecycles — an asset exists from purchase order to disposal, while a CI exists from deployment to decommission, which is a strictly shorter span.

The supporting records:

- **Model** — the product definition ("15-inch laptop, 32GB"), shared across all instances.
- **Model category** — the grouping that determines which asset class and which CI class an item maps to. This is the record that wires assets to CIs; getting it wrong is why some customers have assets with no CIs.
- **Stockroom** — where uninstalled assets live.
- **Transfer order** — the movement of an asset between stockrooms or to a user.

The **asset lifecycle** is expressed through the asset's state and substate, and it is the automation target for this section:

| Stage | State | What happens |
| --- | --- | --- |
| Ordered | On order | Purchase raised; the asset record may exist before the object does |
| Received | In stock | Arrived; in a stockroom; not yet allocated |
| Deployed | In use | Allocated to a user or installed; **the CI now exists and is active** |
| Maintained | In use / In maintenance | Incidents and changes reference the CI throughout this stage |
| Retired | In transit / Retired | Recovered, wiped; the CI is decommissioned |
| Disposed | Disposed | Sold, recycled, or destroyed; the asset record is retained for audit |

**Automating the lifecycle** is what makes it real, and every transition above is a candidate. The transitions that pay back first:

**Received to deployed.** Triggered by the fulfilment of a hardware catalog item: when the SCTASK for "deploy the laptop" closes, a flow updates the asset's state to In use, sets `assigned_to` from the request, moves it out of the stockroom, and ensures the corresponding CI exists and is operational. Without this, deployment is recorded in the request and nowhere else, and the CMDB never learns.

**Deployed to retired.** Triggered by an offboarding request or by a device refresh. The flow creates a recovery task, and on its completion sets the asset to In transit, then Retired, and decommissions the CI. The important part is the CI decommission: a retired laptop whose CI stays operational will still appear in impact analysis and can still be selected on an incident.

**Stock thresholds.** A scheduled flow that checks stockroom quantities against a reorder point and raises a procurement request. This is the automation that keeps the "is a laptop available" branch in your lesson 9 fulfilment flow answerable.

**Warranty and lease expiry.** A scheduled flow that finds assets expiring within a window and creates tasks. Cheap to build, and it is usually the first automation a customer can put a number against.

Build these as flows, for the reasons lesson 9 gave: they wait, they branch, and someone has to be able to see where a given asset's lifecycle transition is stuck.

Two cautions. **Do not automate a transition the customer does not actually perform** — an automated Disposed transition at a customer with no disposal process just produces wrong data faster. And **keep the asset and CI in step**: every lifecycle automation should update both sides, or you will build the classic split where the asset says Retired and the CI says Operational, and the two teams each trust their own record.

## Worked example: making impact analysis work for one service

A customer wants incident impact derived from the affected service instead of guessed by the agent — the deferred improvement from lesson 3. Scoping it to one business service, "Customer Ordering":

1. **Model the service.** Create or verify the business service CI, with an owner, a support group, and a criticality attribute. Criticality is what impact will be derived from, so it must be set by the business, not by IT.

2. **Model one level down.** The application services that deliver it: the ordering web application, the order processing service, the payment integration. Relate each to the business service with `Depends on::Used by`, direction verified by reading the map from both ends.

3. **Model the hosting layer.** Each application service `Runs on` its servers and `Depends on` its database. Stop there — the customer makes decisions at the server level, so mapping individual packages adds maintenance without adding decisions.

4. **Find the shared components.** The identity provider and the shared load balancer appear under three of the four application services. These relationships are the ones that make the map worth having, and they are the ones a manual modelling session most often misses, so ask specifically: "what does this depend on that other services also depend on?"

5. **Set identification and precedence for the classes involved.** Servers identified by serial number first. Discovery authoritative for operating system and hardware attributes; the asset system authoritative for assigned user and location. Written into the design document.

6. **Wire it to ITSM.** Impact on `incident` now defaults from the affected CI's business service criticality, feeding the same priority matrix from lesson 3 rather than creating a second derivation path. Assignment falls back to the CI's support group where no category rule matches. Change risk gains a factor for the number of business services reachable upward from the changed CI.

7. **Measure.** Percentage of incidents on this service with a CI populated; duplicate rate on the server class; number of business services with a validated map. Review monthly with the service owner, who is the only person who can tell you the map is wrong.

Notice that the scope was one service, not the estate. That is the correct shape for CMDB work inside an ITSM programme: prove the capability on the services that matter most, get the ITSM benefit, and expand from a working example rather than from a data-loading project.

## Practice

Work in a personal developer instance, capturing your work in one named update set.

1. **Class model.** Navigate the CI class hierarchy and record the inheritance path from `cmdb_ci` down to a Linux server class. List three attributes that exist on the specific class but not on `cmdb_ci`, and write one sentence on what an ITSM process loses if a server is recorded on the generic class.

2. **Model a service.** Create a business service CI with an owner, a support group, and a criticality. Then create at least two application or technical CIs and at least three infrastructure CIs beneath them.

3. **Relationships.** Relate your CIs into a dependency graph at least three levels deep, using at least two different relationship types. Include one shared component that two branches both depend on. Then view the dependency map from the business service and confirm it renders the structure you intended.

4. **Direction check.** Deliberately create one relationship backwards. View the map, describe exactly what looks wrong, and then state which ITSM calculation would have been silently incorrect if you had not noticed. Fix it.

5. **Identification.** Open the identification rule for the server class. List its identifier entries in priority order and state which attributes each uses. Then describe the specific scenario in which the weakest entry would create a duplicate CI at a customer.

6. **Reconciliation.** Configure a data source precedence rule for one attribute on one class. Write the sentence you would put in the design document naming the system of record for that attribute and the reason.

7. **Asset to CI.** Create a model and model category, then create an asset from it and confirm the linked CI. Record which fields live on the asset, which on the CI, and which appear on both.

8. **Lifecycle automation.** Build a flow that moves an asset from In stock to In use when a deployment task closes, setting the assigned user from the request and ensuring the CI is operational. Test it end to end. Then describe, without building it, the retirement counterpart — including specifically what must happen to the CI.

9. **Health.** Define three CMDB health metrics for this customer, each tied to a named ITSM capability from an earlier lesson. For each, state the query behind it and the threshold at which you would raise it as a risk.
