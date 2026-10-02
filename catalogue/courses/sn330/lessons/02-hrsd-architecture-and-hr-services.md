---
lesson_id: sn330-02
course_id: sn330
pathway: servicenow-implementation-specialist
title: HRSD Architecture and HR Services
order: 2
kind: lesson
competency_ids:
  - D4-S1-C01
objectives:
  - Describe HRSD's scoped application structure and how HR services, COEs, and scoped data separation work
---

## Why HRSD is not just another case application

If you have configured incident management, the shape of HR Service Delivery will look familiar for about ten minutes. There is a record that represents a request, it has states, it gets assigned to a group, someone works it, it closes. Then you hit the first HR requirement that has no equivalent in IT — "the employee relations team's cases must not be visible to the HR shared services team, including in reports, lists, and global search" — and the familiar model stops being enough.

Two things drive almost every architectural decision in HRSD:

**HR data is compartmented, not merely permissioned.** In IT, an incident is broadly readable and you restrict a handful of fields. In HR, entire categories of case are readable only by the small team that owns them. A performance improvement plan, an accommodation request, a workplace investigation, an immigration filing, and a payroll correction are all "HR cases," but the population who may read each one is different, and in some jurisdictions that separation is a legal requirement rather than a preference.

**The subject of the record is not the person who created it.** An incident has a caller. An HR case has an *opened for* / subject person, an *opened by*, and often an *on behalf of* manager. Access, notification, and even which knowledge article is relevant all depend on which person you mean. Getting this distinction wrong is the single most common HRSD implementation defect.

Everything below — scoped applications, COEs, HR profiles, HR services, HR criteria — exists to make those two facts configurable rather than something you script your way around.

## The scoped application structure

HRSD ships as a family of scoped applications rather than one monolith. Understanding the split matters because scope determines what code can touch what data, what a plugin upgrade will overwrite, and where your customizations live.

Think of the family in three layers.

**A core layer** holds the things every HR team shares: the base HR case table, the HR profile, HR services, HR criteria, HR tasks, and the configuration records that describe your organization's HR structure. This is the layer other HR applications depend on.

**A set of COE layers** sit on top. Each Center of Excellence — the term HRSD uses for a specialized HR function — gets its own scoped application containing its own case table, which extends the base HR case table. Typical COEs are HR shared services / workforce administration, employee relations, total rewards and benefits, payroll support, talent management, and immigration or global mobility. The point of giving each COE its own scope and its own table is that access control can then be expressed at the table level, which is coarse, reliable, and easy to prove to an auditor, rather than as a pile of conditional ACLs on one shared table.

**Delivery layers** sit alongside: lifecycle events, the employee self-service experience, and the HR integration application. These consume the core layer and are configured, not usually extended.

The practical consequences of this structure are worth stating plainly:

- A case record physically lives in one COE table. Moving a case between COEs is not a field update; it is a transfer that creates a new record in the target table and relates it back. Design your intake so cases land in the right COE the first time.
- Business rules, flows, and scripts written in one scope cannot read or write records in another scope unless cross-scope access has been granted. When your flow "does nothing" in a lower environment, an unrequested cross-scope privilege is a leading suspect.
- Table extension means every COE case inherits the base fields — subject person, HR service, state, assignment group, opened by — so reporting and shared logic still work across COEs *for people who can read those tables*.

![Layered view of the HRSD scoped applications, showing the core HR layer, per-COE case tables extending the base case table, and the delivery applications on top](./img/hrsd-data-model.png)

## Centers of Excellence as a design unit

A COE is not just a label on a case. When you decide "employee relations is a COE," you are deciding at least five things at once:

1. Cases for that function live in a separate table in a separate scope.
2. That table has its own roles and its own ACLs; membership in the general HR agent role grants nothing there.
3. The team has its own assignment groups and its own SLA definitions.
4. Its knowledge content can be restricted to its own audience.
5. Reporting on it is separately governed — a "total HR case volume" report will need explicit handling because a general HR manager cannot read the underlying rows.

That is a lot of machinery, so the design question is: **when does a function deserve its own COE, and when is it just a category of case within an existing one?**

Use the confidentiality test first. If the people who work function A must not be able to read the cases of function B, they belong in different COEs. Full stop — no ACL condition on a shared table is as defensible as a separate table.

If confidentiality is not the issue, ask whether the function has a genuinely different record shape or a different lifecycle. Payroll inquiries need pay-period and pay-run context that a general HR request does not. Immigration cases have visa types, filing deadlines, and dependents. If you would be adding a dozen fields that are empty for everyone else, that is a signal.

If neither test fires, do not create a COE. Use HR services and case categories within an existing COE. Every additional COE multiplies the ACL surface, the reporting workarounds, and the number of places a lifecycle event has to know about.

## The HR profile: HR's own view of a person

The platform already has a user table, and every employee has a record in it. HRSD adds an **HR profile** record that references the user and holds HR-specific attributes: employment type, employment status, hire date, service date, work location, position, and the HR-relevant relationships such as the reporting manager.

New implementers reliably ask why these fields are not simply added to the user table. The answer is access. The user table is broadly readable — it backs reference fields, group membership, approvals, and directory lookups across every application on the instance. Anything you put there is effectively company-wide readable unless you fight the platform with field-level ACLs. Employment status, hire date, and termination reason are not directory data. Putting them on a separate table that only HR roles can read is the cheap, durable control.

Three practical rules follow.

**One profile per employee, keyed on a stable identifier.** Use the employee number from the HRIS, not email, not name. Email changes with marriage and with domain migrations; employee numbers do not. You will rely on this in the integration lesson.

**The profile is downstream of the HRIS, not authored in ServiceNow.** With rare exceptions, HR profile data is imported. Letting agents hand-edit employment status creates a second source of truth that silently diverges from payroll.

**Contingent workers, pre-hires, and alumni need profiles too.** A new hire who has not started yet still needs a profile so their onboarding lifecycle event can be created and their equipment ordered. An offboarded employee needs one so that post-employment cases — final pay questions, verification of employment — remain workable. Model employment *status* rather than deleting anything.

## HR services: the catalog of what HR actually does

The **HR service** record is the center of gravity of an HRSD implementation. It answers "what is this case about?" in a way that the platform can act on, and it is what turns a free-text HR request into a routed, templated, measurable unit of work.

A single HR service record typically carries:

- The COE that owns it, which determines the case table the request lands in.
- The default assignment group, and often the default case template.
- Eligibility, expressed with HR criteria — who is allowed to request this at all.
- The self-service presentation: whether the service appears in the employee-facing catalog, what topic it sits under, and what the employee sees when they open it.
- Fulfillment configuration: the tasks or activity set to create, the SLA that applies, and whether approval is required.
- Whether the service is available to be requested *on behalf of* someone else, which matters enormously for manager-initiated work.

Because so much hangs off it, the granularity of your service list is an architectural decision, not a data-entry decision. Two failure modes bracket the right answer.

Too coarse — a single "HR Inquiry" service — and every case arrives at the same queue with no template, no SLA that means anything, and no way to report on what employees actually need. Agents triage manually, which is the cost you were trying to remove.

Too fine — a service per form variant per country per employee type — and the catalog becomes unbrowsable, the eligibility rules become unmaintainable, and you have thirty near-identical records that all need updating when the policy changes.

The useful heuristic: **create a distinct HR service when the fulfillment differs.** If two requests are worked by the same team, with the same steps, the same SLA, and the same approvals, they are one service with a variable, not two services. If the US version needs a notarized letter and the India version needs a stamped one, and different teams produce them, those are two services — or one service whose activity set branches on a criterion.

## HR criteria: reusable eligibility

**HR criteria** are named, reusable conditions about a person — "US full-time employees," "people managers," "employees in their first ninety days," "employees in the EU." You define the condition once and then attach it wherever eligibility matters: which HR services a person can request, which knowledge articles they see, which announcements and portal content are targeted at them.

Two properties make criteria worth learning properly.

They are **evaluated against the subject person**, not the logged-in user, wherever the platform has a subject. A manager opening a case on behalf of a direct report should see the services that report is eligible for. Verify this in your own implementation; it is easy to assume and easy to get wrong.

They are **composable and centrally maintained**. When the company opens an office in Ireland, you edit one criterion rather than hunting through forty service records. Resist writing the same condition inline in a dozen places — that is exactly the debt criteria exist to prevent.

A short design note on structure: prefer criteria that describe *attributes* ("employment type is full time," "work country is DE") over criteria that name *individuals or groups by hand*. Attribute-based criteria keep working as people join, move, and leave, because the underlying data comes from the HRIS feed.

## Putting the pieces together

Here is the chain a single request travels, which is the mental model to carry into the rest of the course:

An employee opens the self-service portal. **HR criteria** decide which **HR services** they can see. They pick one. The service names a **COE**, which determines which **case table** — in which **scoped application** — the new record is created in. The case records a **subject person**, which resolves to an **HR profile**. The service's **template** stamps the initial values and its **assignment group** puts the case in front of a team. The service's **activity set or tasks** define the work. **ACLs on that scoped table** decide who may ever read it.

Every later lesson is a deeper cut through one link of that chain: cases and templates next, then knowledge, then the portal, then lifecycle events, then automation, then access control, then the HRIS feed that keeps the profile data true.

## A worked structural example

A mid-size employer wants HRSD for four functions: general HR questions and letters, benefits and leave, employee relations investigations, and payroll inquiries.

A defensible structure:

- **HR shared services COE** — general inquiries, employment verification letters, personal-data change requests, policy questions. Broad agent population. This is where the volume lives.
- **Total rewards COE** — benefits enrollment questions, leave of absence, accommodation intake. Separate because leave and accommodation records touch medical information; the shared services team must not read them.
- **Employee relations COE** — investigations, grievances, performance concerns. Strictly separated, small named team, no general HR access at all.
- **Payroll support COE** — pay discrepancy, tax document, garnishment questions. Separate mostly because the record shape and the fulfillment team differ; the confidentiality bar is moderate but real.

Under those four COEs, roughly twenty to thirty HR services, not two hundred. "Employment verification letter" is one service with a variable for the recipient. "Leave of absence" is one service whose activity set branches by country criterion. "Investigation intake" is one service that is deliberately *not* browsable in the general catalog but reachable from a dedicated, always-available entry point.

Notice what is *not* an architectural decision here: none of this required a new table you designed yourself, and none of it required a script. The structure is expressed in configuration records — COEs, services, criteria, templates — which is what makes it reviewable by an HR stakeholder who does not read code.

## Staying upgradeable

HRSD is a product, and it is upgraded. Everything you build sits somewhere on a spectrum from "will survive every upgrade untouched" to "will need hand-merging every time," and knowing where a given change falls is part of the architectural skill.

**Configuration records survive.** HR services, criteria, templates, activity sets, taxonomy topics, knowledge bases, groups, and assignment rules are your data. Upgrades do not touch them. This is why the whole lesson keeps pushing you toward expressing structure as records.

**Additions mostly survive.** A custom field on an HR profile, a new business rule of your own, a new flow, a new ACL — these coexist with the shipped versions.

**Modifications to shipped artifacts do not survive cleanly.** Editing a shipped business rule, script include, or UI policy creates a customization the platform will flag at upgrade and ask a human to reconcile. Every one of these is a recurring tax. Where you need different behavior, prefer adding your own artifact that runs alongside, ordered after the shipped one, over editing the shipped one in place.

Three practical habits follow. Keep your work in a dedicated scope or clearly prefixed set of records so an upgrade review can tell yours from the product's. Record *why* each modification exists, because at upgrade time the question will be whether it is still needed. And before you customize anything shipped, check whether a configuration property already exposes the behavior you want — HRSD exposes a great many, and implementers routinely script around switches that already exist.

The architectural version of this advice: **the further from the base tables your requirement pushes you, the harder you should push back on the requirement.** A design that lives entirely in configuration records will be cheap to own for years. One that forks four shipped scripts will be expensive forever, and the expense lands on whoever inherits it — often you.

## Practice

Work in a personal development instance with HRSD available. Do not build forms or flows yet; this exercise is about structure.

1. **Map the applications.** Using the application navigator and the table configuration, list the HR-related scoped applications on your instance. For at least three of them, record: the application scope, its primary case table, and the base table that case table extends. Write one sentence per application explaining what that scope is for.

2. **Inspect the base case table.** Open the base HR case table's dictionary and identify the fields that carry the person relationships — subject person, opened by, and any manager or on-behalf-of field. For each one, write down which question it answers ("who is this about," "who typed it in," "who asked for it"). Then open one COE case table and list three fields it adds beyond the base.

3. **Design a COE structure.** For the four-function employer described in the worked example above, produce a table with one row per COE and columns for: COE name, why it is separate (confidentiality, record shape, or both), the agent population, and one example service. Then add a fifth candidate function of your own choosing and argue in two sentences either for giving it a COE or for folding it into an existing one.

4. **Draft an HR service.** Pick one service from your design — "employment verification letter" is a good first one — and create the HR service record. Set the COE, the default assignment group, and a short description written for an employee rather than for HR. Do not build fulfillment yet.

5. **Build one HR criterion and prove it works.** Create a criterion for full-time employees in a single country, using HR profile attributes rather than a named list of users. Attach it to the service you just created. Then impersonate two test users — one who matches and one who does not — and confirm the service's visibility differs. Note in one sentence whether the criterion evaluated against the logged-in user or the subject person, and how you verified that.

6. **Write the trade-off up.** In one paragraph, describe a request type at your own employer (or a hypothetical one) that you would *refuse* to give its own HR service, and explain what you would use instead.
