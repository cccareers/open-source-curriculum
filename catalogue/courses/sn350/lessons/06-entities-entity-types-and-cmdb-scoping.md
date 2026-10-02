---
lesson_id: sn350-06
course_id: sn350
pathway: servicenow-implementation-specialist
title: Entities, Entity Types, and CMDB Scoping
order: 6
kind: lesson
competency_ids:
  - D5-S1-C01
  - D5-S1-C05
objectives:
  - Scope a compliance or risk program to the right entities using CMDB data
---

## Everything attaches to something

By now you have built a compliance model and a risk register, and both of them have the same unfinished edge: a control objective becomes a control only when it is applied to *something*, and a risk statement becomes a risk only when it is instantiated against *something*. That something is an **entity**.

An entity is whatever the program is about — a server, an application, a business service, a process, a facility, a legal entity, a business unit. An **entity type** is a defined population of entities, usually expressed as a filter, and it is the mechanism that turns one authored objective into a hundred generated controls.

The scoping layer is the most consequential and least glamorous part of a GRC implementation. Get it wrong in the generous direction and you generate controls for systems nobody agreed were in scope, flood owners with attestations, and watch the program collapse under its own notification volume in the first cycle. Get it wrong in the stingy direction and the auditor finds the system you missed, which is worse, because now the program's completeness is in question rather than its efficiency.

And because most entity types resolve against the CMDB, the honest statement of the problem is: **your compliance scope is only as good as your CMDB**. That is why this lesson spends as much time on configuration item modeling and CMDB governance as on the GRC side.

## Modeling the entities: CIs, classes, and relationships

The CMDB stores configuration items in a class hierarchy. A base configuration item class is extended by hardware, application, service, and other branches, each adding fields that only make sense for that kind of thing. Class choice is a modeling decision with downstream consequences for GRC:

- **Class determines the attributes you can filter on.** If in-scope means "hosts cardholder data," you need a field to hold that, and where the field lives determines which classes can carry it. Adding a flag to the base class makes it available everywhere and dilutes it; adding it to a specific class keeps it meaningful but limits your filter's reach.
- **Class determines the population size.** Scoping to a server class gives you hundreds of entities. Scoping to a business service class gives you dozens. The same obligation can often be satisfied at either level, and the level you choose sets the program's cost for years.
- **Class determines who the owner is.** Support group, managed-by, and owned-by fields are populated to different standards on different classes in most real CMDBs. Attestation respondents are usually derived from these, so a class with weak ownership data produces attestations with no valid recipient.

**Relationships** are the second half of the model, and for GRC they matter more than attributes. A relationship record links two CIs with a typed, directional dependency: runs on, depends on, contains, used by. A service is not a row; it is a root record plus the graph beneath it. That graph is what lets you answer the scoping question that actually gets asked in an audit: *which infrastructure supports the in-scope application?*

```javascript
// Walk one level down from a business service to its directly dependent CIs.
// Relationship semantics: 'parent' depends on / contains 'child'.
function directDependencies(serviceSysId) {
  var found = [];
  var rel = new GlideRecord('cmdb_rel_ci');
  rel.addQuery('parent', serviceSysId);
  rel.query();
  while (rel.next()) {
    found.push({
      sys_id: rel.getValue('child'),
      name: rel.child.getDisplayValue(),
      cls: rel.child.sys_class_name.toString(),
      via: rel.type.getDisplayValue()
    });
  }
  return found;
}
```

One level is rarely the answer. Real scoping traverses several hops — application to database to host to hypervisor — and each hop multiplies both the population and the chance of hitting a stale relationship. Two disciplines keep traversal honest: **cap the depth deliberately** and justify the cap, and **filter by relationship type**, because a "used by" edge to a monitoring tool should not drag the monitoring tool into a financial reporting scope.

Where the platform's service mapping capability is in use, prefer the mapped service over a hand-built traversal. A discovered, mapped topology is refreshed and dated; a traversal you wrote is a snapshot of whatever the relationship table contained the day you ran it.

## Entity types: scope as a query, not a list

An entity type is a population definition. Two ways to define it, and the choice is a real decision.

**Static membership** — a hand-picked list of entities. Correct when the population is small, stable, and politically negotiated: eight legal entities, four data centers, the three applications the auditor named. Its failure mode is silence. It never notices a new system, and nobody remembers to update it.

**Dynamic membership** — a filter over a CMDB table. Correct for anything that grows: all production servers supporting a given service, all applications with a data classification of restricted, all CIs related to the finance service. Its failure mode is loud but tractable: a bad filter over-includes visibly.

```text
Entity type:  PCI-scoped application servers
Table:        cmdb_ci_server
Filter:       operational_status = Operational
              AND environment = Production
              AND supported_service IN (Payments, Checkout)
              AND install_status != Retired
Refresh:      nightly
Owner field:  support_group.manager
```

Prefer dynamic, and then handle the two problems dynamic membership creates.

**Joins and leaves.** When a server is built next Tuesday and matches the filter, a control is generated for it. Good — that is the point. But decide what happens to its first attestation period: does a control created mid-quarter get attested this quarter or next? Answer it in the design, because if you do not, the answer becomes "whatever the schedule happened to do," and that is not defensible. When a CI is decommissioned and drops out, the control retires and its historical evidence stays. Verify that behavior in your instance rather than assuming it; the alternative — controls deleted along with their evidence — would be a serious problem.

**Filter drift.** Someone changes a field's usage convention and your population halves overnight without an error anywhere. Monitor population **counts over time**, not just contents. A step change in an entity type's membership is a signal worth an alert, and it is one of the most valuable indicators you can build in Lesson 7.

Do not skip the reconciliation step: hold the generated population up against the list the business believes is in scope, item by item, before the first attestation goes out. Every difference is either a CMDB defect or a scoping misunderstanding, and both are cheap now and expensive after owners have started responding.

## Entities that are not configuration items

Not every obligation attaches to a machine. A privacy-adjacent records retention requirement attaches to a **process**. A physical access control attaches to a **facility**. A financial reporting obligation attaches to a **legal entity**. A policy about code review attaches to a **team** or a development process. All of these are entities, and none of them are CIs in the usual sense.

Three ways they get modeled, in descending order of preference:

**Existing platform records.** Business units, departments, groups, locations, and business applications already exist and are already maintained by someone. Pointing an entity type at one of these inherits its maintenance for free. Check the quality first — a location table with 400 rows, half of them meeting rooms, is not an entity source.

**Extending the CMDB's own non-hardware classes.** Business services, business applications, and process-style classes are legitimate homes for things that are not hardware. This keeps the entity model in one place and lets relationships link a process to the systems that support it, which is exactly the traversal an auditor asks for.

**A purpose-built table.** Correct when nothing else fits — a register of legal entities, say. Accept that you now own its maintenance, so define who updates it and how before you create the first record.

Whichever you choose, the **entity hierarchy** deserves explicit thought, because it determines how results aggregate. If controls exist at the server level and the executive wants posture by business unit, there must be a resolvable path from server to unit — through the service, through the support group, or through an explicit field. Establish that path once and use it consistently; ad hoc paths invented per report are how two dashboards end up disagreeing about the same number.

A related judgment call: **at what level should a control live?** The same obligation can be modeled as one control on a business service or forty controls on its servers. One control is cheap, has a single accountable owner, and gives coarse evidence. Forty give granular evidence and forty attestations. The general rule is to place the control where the *evidence* naturally exists and where a single person can honestly attest to it. If the service owner cannot personally speak to the account list on forty servers, a service-level control is a fiction, and the granularity is not optional.

## CMDB governance, because scope depends on it

Compliance scope inherits every CMDB weakness, so a GRC implementer ends up doing CMDB governance work whether or not it was in the statement of work. The standard framing has three dimensions.

**Completeness.** Are the CIs that exist in the world present in the CMDB, and are their required attributes populated? For GRC the relevant question is narrower and sharper: are the *required-for-scoping* attributes populated on the *in-scope* classes? A CMDB that is 60 percent complete overall but 100 percent complete on environment, operational status, and support group for production servers is entirely adequate for scoping. Measure what you depend on, not everything.

**Correctness.** Do the values reflect reality? Correctness decays continuously. The main defenses are authoritative population from discovery rather than manual entry, and **identification and reconciliation** rules that decide which source may write which attribute so that two integrations do not fight over a field and flip it nightly. Duplicate CIs are the correctness failure with the worst GRC consequence: one physical server represented twice generates two controls, one of which will never be attested because its ownership data is a fragment.

**Compliance**, in the CMDB sense — conformance to the organization's own modeling standards. Are CIs in the right class, named to convention, related with the right relationship types, and owned by a real group? This is the dimension that most directly determines whether a filter can express a scope at all.

Practical governance controls to put in place, several of which you can build with what you already know:

- **Required attributes enforced at write time** for in-scope classes, via a data policy or a business rule, so gaps cannot enter rather than being cleaned up quarterly.
- **Ownership certification** — a periodic confirmation by group managers that they still own the CIs attributed to them. This is structurally identical to the attestation you built in Lesson 4, and it is the highest-value CMDB governance activity for a GRC program, because ownership data drives who gets asked.
- **Staleness detection** — CIs not updated or seen by discovery within a defined window are flagged. A stale CI in a compliance scope is an attestation nobody can answer.
- **Duplicate detection** on the identification keys, with a documented merge process.
- **A named CMDB owner.** Not a committee. Governance without a single accountable owner degrades to reporting about degradation.

```javascript
// Scoping health check: which entities in this population are unusable
// as attestation targets because they lack an owner or are stale?
function scopingGaps(encodedFilter) {
  var stale = new GlideDateTime();
  stale.addDaysUTC(-45);

  var gaps = { noOwner: 0, stale: 0, total: 0 };
  var ci = new GlideRecord('cmdb_ci_server');
  ci.addEncodedQuery(encodedFilter);
  ci.query();
  while (ci.next()) {
    gaps.total++;
    if (!ci.support_group.manager) gaps.noOwner++;
    if (ci.getValue('sys_updated_on') < stale.getValue()) gaps.stale++;
  }
  return gaps;
}
```

Run that before the first attestation campaign, not after. A population where 12 percent of entities have no derivable owner is a campaign that will produce a 12 percent permanent overdue rate, and the program will be judged on that number.

### Worked example: scoping Northwind's access review

The control objective from Lessons 3 and 4 is "quarterly privileged access review, directory-managed infrastructure." Scoping it:

1. **Ask what the obligation actually covers.** The financial reporting regime covers systems that could affect the financial statements. That is a business definition, not a technical one, so it must be agreed with the finance and audit stakeholders before any filter is written.
2. **Find the anchor in the CMDB.** Northwind has a mapped business service for the finance application. That service, not a server list, is the anchor — it survives infrastructure changes.
3. **Traverse, with a cap.** Two hops down from the service, restricted to hosting and dependency relationship types, yields application servers, database servers, and their hypervisor hosts.
4. **Filter the result.** Production only, operational, excluding retired. Development and test hosts are out of scope by agreement, and that agreement is written on the entity type record.
5. **Reconcile.** The generated population is 34 servers. Finance believes there are 29. Investigation finds four duplicates from a stale integration and one server nobody knew still existed and which turns out to be genuinely in scope. Both outcomes are wins: the duplicates get merged, and the unknown server is exactly what the exercise is for.
6. **Check usability.** Three of the 30 remaining servers have no support group manager. Fixing three ownership records costs an hour and removes a permanent gap in every future cycle.
7. **Freeze and document.** The entity type record carries the filter, the traversal rule, the exclusions, the agreement that produced them, and the date. When an auditor asks "how did you determine scope," that record is the answer.

Notice that only step 3 is technical. Scoping is a negotiation with a query at the end of it.

## Practice

Use a developer instance with a populated CMDB. The demo data is enough.

1. **Map a service.** Pick a business service and write the dependency graph two hops down, by hand from the relationship records, capping and filtering by relationship type. State the cap you chose and defend it. Note every relationship you suspect is stale and how you would confirm it.

2. **Build two entity types.** Define the same in-scope population twice: once as a static list and once as a dynamic filter. Compare the memberships. Then describe one realistic organizational change that would make each version wrong, and say which failure you would rather have and why.

3. **Run a scoping health check.** Against your dynamic population, count entities lacking a derivable owner and entities not updated within 45 days. Express both as percentages and state, as a number, the attestation completion rate you would predict for the first cycle if nothing were fixed.

4. **Fix a governance gap.** Choose the single most damaging gap the health check found and implement one control against it — a required-attribute enforcement, an ownership certification, or a staleness flag. Explain in two sentences why you chose that one over the others.

5. **Scope reconciliation.** Take the population your filter generates and produce a written reconciliation against a list you assert the business would give you (invent the business list, including at least one item your filter misses and one it wrongly includes). For each difference, classify it as a CMDB defect or a scoping misunderstanding and name the fix.
