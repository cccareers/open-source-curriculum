---
lesson_id: sn201-03
course_id: sn201
pathway: servicenow-implementation-specialist
title: Designing the Application Data Model
order: 3
kind: lesson
competency_ids:
  - D2-S1-C02
  - D1-S1-C01
objectives:
  - Design an application data model using tables, fields, and table extension
---

## Start from the sentences people say

Your application is an empty scope. Before you create a single table, spend twenty minutes listening to how the business describes its own work, because the nouns in those sentences are your tables and the adjectives are your fields.

The facilities team describes their work like this:

> "Someone reports that something is broken at a location. We log it, decide how urgent it is, assign it to a technician, they go fix it, and we close it out with a note about what they did. Sometimes a job needs parts, and sometimes one report turns into several separate jobs."

Underline the nouns: *someone*, *something broken*, *location*, *technician*, *job*, *parts*. Now sort them.

- **Someone** and **technician** are people. The platform already has a table for people — `sys_user`. You do not build it; you point at it.
- **Location** is a place. The platform has `cmn_location` out of the box. Again, point at it rather than rebuilding it, unless the business has a genuinely different concept of location.
- **Job** — the thing being tracked, assigned, and closed — is the heart of the application. That is your primary table: `work_order`.
- **Parts** are a list of items consumed by a job. That is a second table, related to the first.
- **Something broken** is a description on the job, not a table of its own — at least until someone asks to report on it, at which point it becomes a choice field or a reference to an asset.

That last decision is the one beginners get wrong most often, in both directions. The test is simple: **if you need to store facts about it, or select the same value repeatedly and report on it, it wants to be a record. If it is free text a human reads once, it is a field.**

## Extending a base table

You could create `work_order` as a standalone table. Do not. The platform ships a base table called **Task** that models exactly this shape — something assigned to someone, with a state, a number, a description, work notes, and a lifecycle. Incident, Problem, Change Request, and Catalog Task are all extensions of Task.

**Table extension** is inheritance. Your table gets every field, and every behaviour, of its parent. Extending Task hands you, at no cost:

| Inherited field | What it gives you |
| --- | --- |
| `number` | Auto-generated, prefixed record identifier |
| `short_description` | The one-line summary shown in lists and notifications |
| `description` | The long form of the request |
| `state` | The lifecycle field, with choices you tailor |
| `assigned_to` | Reference to `sys_user` |
| `assignment_group` | Reference to `sys_user_group` |
| `priority`, `impact`, `urgency` | The standard priority triple |
| `opened_by`, `opened_at`, `closed_by`, `closed_at` | Audit stamps, maintained for you |
| `work_notes`, `comments` | Journal fields with an activity stream |
| `parent` | A self-referencing link for breaking one job into several |

Notice how many of those the facilities team asked for without naming them. "One report turns into several separate jobs" is `parent`. "A note about what they did" is `work_notes`. Extension is not a shortcut; it is alignment with how the rest of the platform already models work, which is what lets service level agreements, assignment rules, notifications, and reporting treat your records the way they treat an incident.

Two cautions.

**Extending is a commitment.** You inherit the parent's fields *and* its business rules, and future platform updates to the parent reach your table. That is usually what you want. It is not what you want if your entity is only superficially task-shaped.

**Do not extend Task for reference data.** A table of part types is not a task. It is a simple lookup table with a name and maybe a cost — create it standalone, with no parent.

## Choosing field types deliberately

Every field has a type, and the type is a decision about behaviour, not just storage.

- **String** — free text, with a maximum length you set. The default of 40 characters is small; a comment field wants far more. Use String only where a human writes prose.
- **Choice** — a fixed set of options stored as a value with a separate label. Use it when the set is small, stable, and you will report on it. Never use a String field where a Choice belongs; you will end up with "In Progress", "in progress", and "In progess" in the same column.
- **Reference** — a pointer to a record in another table, stored as that record's identifier and displayed as its display value. This is the single most valuable field type on the platform.
- **True/False** — a checkbox. Beware of building three checkboxes where one Choice field belongs.
- **Date/Time** and **Date** — stored in a canonical time zone and rendered in the user's. Never store a date in a String field.
- **Integer**, **Decimal**, **Currency** — numeric. Currency carries a currency code with the amount.
- **Journal Input** — appends timestamped, attributed entries rather than overwriting. This is what `work_notes` and `comments` are.
- **Duration** — an elapsed time, not a timestamp. "How long the job took" is a Duration.

Two field-type mistakes account for most bad data models: storing a reference as free text ("the technician's name typed in"), and storing a status as free text. Both destroy your ability to report, and both are almost impossible to clean up after a year of data.

## Reference fields and dot-walking

A reference field stores a pointer. `assigned_to` on your work order does not store "Dana Ruiz" — it stores the identifier of Dana's `sys_user` record and *displays* her name. That indirection is what makes the platform relational.

The payoff is **dot-walking**: from a work order you can reach any field on the referenced record without writing a join. On a form, in a list, in a report, in a condition builder, and in script, `assigned_to.department` is a legal path. Two hops work too: `assigned_to.manager.email`.

```javascript
// Server-side, on a work order record.
// One field access; the platform resolves the reference for you.
var techEmail = current.assigned_to.email;
var techDept  = current.assigned_to.department.name;
```

Dot-walking is why "point at the existing table" beats "copy the values into my table." If you had stored the technician's email as a String on the work order, it would be stale the day she changed it. Because you stored a reference, it is correct forever.

Two properties of a reference field deserve attention when you create one:

- **Reference qualifier** — a filter limiting which records may be selected. A technician field should not offer every one of the company's 8,000 users; qualify it to members of the facilities group.
- **Cascade rule** — what happens to your record when the referenced record is deleted. The safe default for most application references is to leave your record intact and clear the pointer, not to delete your record.

## Relationships beyond one-to-many

A reference field gives you a many-to-one relationship: many work orders point at one technician. Two other shapes come up constantly.

**One-to-many, owned.** A work order consumes several parts, and a part-usage row means nothing outside its work order. Model this as a second table with a reference field back to the work order — `work_order_part` with a `work_order` reference. On the form this appears as a **related list**, which you will configure in lesson 4.

**Many-to-many.** A work order might be tagged with several skills, and each skill applies to many work orders. Neither side owns the other. The platform's answer is a **many-to-many table**, a small join table holding one reference to each side. You create it explicitly and the platform renders it as a related list on both forms.

Resist the temptation to fake many-to-many with a comma-separated String or with `skill_1`, `skill_2`, `skill_3`. Both are unreportable and both break the day someone needs a fourth.

## Choice fields and state values

`state` is inherited from Task with a default set of choices. Tailor it to the facilities process — but tailor it carefully, because state drives everything downstream.

Good practice for state choices:

- **Keep the list short.** Five or six states covers almost every process. Every extra state is a decision someone has to make correctly.
- **Use numeric values with gaps.** Store `10`, `20`, `30` rather than `1`, `2`, `3`, so you can insert a state later without renumbering. The *label* is what users see; the *value* is what your conditions and scripts compare.
- **Order deliberately.** The sequence controls the order in the dropdown, which is the order people read the process in.
- **Have exactly one terminal state per outcome.** "Closed Complete" and "Closed Incomplete" is fine. Three flavours of "Done" is not.

A workable facilities state model:

| Label | Value | Meaning |
| --- | --- | --- |
| New | 10 | Logged, not yet triaged |
| Assigned | 20 | A technician owns it |
| In Progress | 30 | Work has started |
| On Hold | 40 | Blocked, waiting on parts or access |
| Closed Complete | 60 | Work done |
| Closed Incomplete | 70 | Cancelled or not actionable |

Write these values down. Lessons 5, 6, and 7 all reference them.

## Field-level settings that save you later

When you create a field, the dictionary entry behind it exposes settings that are far easier to set now than to retrofit.

- **Mandatory** — the platform refuses to save without a value. Use it only for fields that are genuinely required at *every* stage; a field required only at closure belongs in a UI policy, which lesson 4 covers.
- **Default value** — a literal, or a dynamic value such as the current user. A sensible default removes a decision from every single record.
- **Max length** — set it to something realistic. Too small truncates data silently in imports.
- **Read only** — protects a field the system maintains.
- **Display** — exactly one field per table is the display value, the label shown wherever the record is referenced. On a task extension this is normally `number`; consider whether `short_description` reads better for your users.
- **Attributes** — things like making a field unique, or hiding it from the record's history.

## The facilities data model, assembled

Putting all of it together:

- **`work_order`**, extending Task. Inherits number, state, assignment, descriptions, journals, parent. Adds: `location` (Reference to `cmn_location`, mandatory), `work_type` (Choice: Electrical, Plumbing, HVAC, Structural, Other), `requested_by` (Reference to `sys_user`, default to the current user), `scheduled_for` (Date/Time), `time_on_site` (Duration), `requires_contractor` (True/False).
- **`work_order_part`**, standalone. Fields: `work_order` (Reference to `work_order`, mandatory), `part` (Reference to `part`), `quantity` (Integer, default 1), `unit_cost` (Currency).
- **`part`**, standalone reference data. Fields: `name` (String, display), `sku` (String, unique), `standard_cost` (Currency), `active` (True/False, default true).

Three tables, one extension, four references. That is a complete application data model, and everything else in this course is built on top of it.

## Reviewing a data model before you build on it

Before moving to forms, walk this checklist. Each failed item costs an order of magnitude more to fix after there is data in the table.

1. Does every table represent exactly one kind of thing, nameable in the singular?
2. Is every repeated value either a Choice or a Reference — never free text?
3. Does every reference point at the table that genuinely owns that concept, rather than a copy you made?
4. Have you extended Task exactly where the entity is task-shaped, and nowhere else?
5. Does each table have a display field that a human will recognise in a reference lookup?
6. Are state values numeric, gapped, and few?
7. Can you name the report the business will ask for, and does your model answer it without a script?

Question seven is the honest one. "Which work types take longest in which locations?" is answerable in a report only if work type is a Choice, location is a Reference, and duration is a Duration. If any one of those is a String, the model has already failed and no amount of clever scripting will rescue it.

## Practice

Continue in the `Facilities Work Orders` application from lesson 2. Confirm the application picker is on your scope before you create anything.

1. **Build the primary table.** Create `work_order` as an extension of Task. Verify after saving that it inherited `number`, `state`, `assigned_to`, and `work_notes` — open the table's field list and find them rather than trusting that it worked.

2. **Add the application-specific fields.** Add `location`, `work_type`, `requested_by`, `scheduled_for`, `time_on_site`, and `requires_contractor` with the types listed above. Make `location` mandatory and default `requested_by` to the current user.

3. **Tailor state.** Replace the inherited state choices with the six-state model in this lesson, using the numeric values given. Confirm the dropdown reads in process order.

4. **Build the supporting tables.** Create `part` as a standalone table with `name` as its display field, and `work_order_part` with a mandatory reference back to `work_order`. Create three part records so you have data to select.

5. **Qualify a reference.** Add a reference qualifier to `assigned_to` (or to a new `assigned_technician` field, if you prefer to leave the inherited one alone) so it only offers members of a facilities group you create. Test it by opening the lookup and confirming the list is shorter than the full user table.

6. **Prove dot-walking works.** Create one work order record with a technician assigned. Then build a list view of `work_order` that shows the technician's *department* as a column, without adding a department field to your table.

7. **Write the model down.** Produce a one-page description of your data model: each table, its parent (if any), its fields with types, and each relationship in a sentence — "a work order has many work order parts; each part usage points at one part." Keep it. You will hand a version of this in with the lesson 9 project.

8. **Stretch.** Add a many-to-many relationship between `work_order` and a new `skill` table, then confirm it appears as a related list on both sides. Then articulate, in two sentences, why this could not have been a Choice field.
