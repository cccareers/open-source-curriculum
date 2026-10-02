---
lesson_id: sn201-04
course_id: sn201
pathway: servicenow-implementation-specialist
title: Forms, Views, and UI Policies
order: 4
kind: lesson
competency_ids:
  - D2-S1-C02
  - D7-S1-C01
objectives:
  - Build forms, views, and UI policies that present the right fields to the right user
---

## The form is not the table

Your `work_order` table now has roughly thirty fields, once you count everything inherited from Task. Nobody should ever see thirty fields at once.

A form is a *view* of a table — a curated arrangement of some of its fields, in an order that matches how a person thinks about the work. The table is the truth; the form is an argument about what matters. You can build several forms over the same table for different audiences, and the platform will pick the right one automatically. That capability is the difference between an application people tolerate and one they like.

This lesson covers three layers of that presentation, from static to dynamic:

1. **Form layout and design** — which fields appear, in what order, in which sections.
2. **Views** — alternative layouts of the same table for different audiences.
3. **UI policies** — rules that change the form as the user fills it in.

Everything here is configuration. You will not write a line of script, and that is deliberate: the discipline this lesson teaches is *exhausting the declarative options before reaching for code*. Lesson 5 hands you client scripts, and the first thing you will be told is not to use them for anything you could have done here.

## Laying out a form

Two tools edit the same thing from different angles.

**Form Layout** is the list-based editor: available fields on the left, selected fields on the right, with buttons to move fields, create sections, and add splits. It is fast when you know exactly what you want and are moving eight fields at once.

**Form Designer** is the drag-and-drop editor. It shows the form roughly as it renders, with a field palette beside it, and it lets you create new fields directly from the canvas. It is better for shaping a form you are still designing, and better for anyone who thinks visually.

Either way, the units you are arranging are these:

- **Sections.** Named groups of fields, rendered as tabs or stacked headings. A section is a chapter of the record. Facilities work orders divide naturally into *Request* (what and where), *Assignment* (who and when), and *Closure* (what happened).
- **Columns.** Most sections are two-column. Put paired fields side by side — `impact` beside `urgency`, `scheduled_for` beside `time_on_site` — and give wide fields their own full-width row.
- **Splits.** A split starts a new column layout mid-section, which is how you get a single wide description field above two narrow columns.
- **Annotations.** Static text you can drop into a section to explain a group of fields. Use sparingly; a form full of instructions is usually a form with bad labels.
- **Formatters.** Special elements that render something other than a field — most importantly the **activity formatter**, which shows the journal stream of `work_notes` and `comments` with timestamps and authors.

A layout that works for the facilities form:

```text
Section: Request
  number (read-only)        | state
  short_description  (full width)
  work_type                 | location
  requested_by              | requires_contractor
  description        (full width)

Section: Assignment
  assignment_group          | assigned_to
  priority                  | scheduled_for

Section: Closure
  time_on_site              | close_code
  close_notes        (full width)

Formatter: Activity (filtered)
Related list: Work Order Parts
```

Three things make this layout good rather than merely complete. The identifying fields are at the top, where the eye lands. The sections match the order the record is actually worked in. And closure fields exist on the form but, as you are about to arrange, only appear when they are relevant.

## Related lists

A related list is the other half of the relationship you built in lesson 3. Because `work_order_part` has a reference to `work_order`, the platform can show, on any work order, the list of part-usage rows pointing at it — with inline add, edit, and remove.

Related lists are configured per view, in the same editors as fields, and they are ordered independently of the form body: they always render below it. Two options worth knowing:

- A related list can be **filtered and sorted**, so a "Recent Parts" list can show only rows added this month.
- A related list can be a **defined relationship** rather than a simple reference — a small piece of configuration that computes the related records by query when no direct reference exists. Reach for that only when there is genuinely no reference to follow.

For the facilities app, one related list of work order parts is enough. Add it, then create a part-usage row inline from a work order and confirm it saves with the parent reference already populated.

## Views: several forms over one table

A **view** is a named set of layout records. The unnamed one you have been editing is the *Default view*, and it is what everyone sees unless something says otherwise.

Create additional views when audiences genuinely differ. For facilities, a **Technician** view makes sense: a technician on a phone in a plant room needs `short_description`, `location`, `state`, `work_notes`, and nothing else. The manager's default view keeps priority, costs, and the parts list.

Two mechanisms select a view:

- **Manually**, from the form's context menu, which is how you test.
- **Automatically**, through a **view rule** — a condition evaluated when the form loads that selects a view for matching users or records. A view rule that reads "if the current user has the technician role and not the manager role, use the Technician view" gives every technician the simple form without them choosing anything.

Views change *presentation only*. A field hidden by a view is still on the table, still writable through the API, and still visible to anyone who switches views. **A view is not security.** If a field must not be seen, that is an access control rule, and lesson 7 is where it belongs. Confusing the two is one of the most common and most serious mistakes new builders make.

## UI policies: making the form react

A static form has a ceiling. `close_notes` should be mandatory when the state is Closed Complete and hidden otherwise. `requires_contractor` should reveal a contractor field when ticked. Encoding those rules in a fixed layout is impossible; encoding them in script is unnecessary. This is what **UI policies** are for.

A UI policy has three parts.

**A condition.** Built in the standard condition builder, evaluated against the form's current values as the user types. `State is Closed Complete`. `Requires contractor is true`. `Work type is HVAC and Priority is 1 - Critical`.

**Actions.** One row per field, each setting up to three properties:

| Property | Values | Effect |
| --- | --- | --- |
| Mandatory | True / False / Leave alone | Blocks save until filled |
| Visible | True / False / Leave alone | Shows or hides the field |
| Read only | True / False / Leave alone | Displays but prevents editing |

"Leave alone" is the default and matters more than it looks: it lets two policies touch the same field on different properties without fighting.

**Options.** Three checkboxes carry most of the behaviour:

- **On load** — apply the policy when the form opens, not just when a value changes. Almost always on; without it, an existing closed record opens with the closure fields hidden.
- **Reverse if false** — when the condition stops being true, undo the actions. Usually on. Without it, ticking and then un-ticking `requires_contractor` leaves the contractor field stranded on screen.
- **Order** — the sequence when several policies apply. Lower runs first, and later policies win on conflicts. Leave gaps in your numbering the way you did with state values.

Two worked examples for the facilities form.

**Closure fields.** Condition: `State is one of Closed Complete, Closed Incomplete`. Actions: `close_code` mandatory true, visible true; `close_notes` mandatory true, visible true. Options: On load checked, Reverse if false checked. Result: closure fields are invisible on a new record, appear the moment a technician selects a closed state, and block the save until they are filled.

**Contractor detail.** Condition: `Requires contractor is true`. Action: `contractor_company` visible true, mandatory true. Same options. Result: a field that exists for the ten percent of jobs that need it, and is invisible for the other ninety.

**Locking a worked record.** Condition: `State is Closed Complete`. Actions: `work_type`, `location`, `short_description` read only true. This stops after-the-fact edits to a completed job without needing a single line of code.

## UI policy or data policy?

There is a second, closely related object: the **data policy**. It looks almost identical — a condition and a set of mandatory/read-only actions — with one crucial difference.

A UI policy runs **in the browser, on the form**. It shapes the experience. It does not exist for a record created by an import, a web service call, a flow, or a background script.

A data policy runs **on the server, on every write**, regardless of origin. It is a rule about the data itself.

The practical guidance:

- Use a **UI policy** for anything about presentation — showing, hiding, guiding.
- Use a **data policy** when the constraint must hold no matter how the record arrives. "A closed work order must have a close code" is that kind of rule, because an integration could otherwise create one without.
- It is entirely normal to have both: a data policy for the guarantee, a UI policy for the pleasant version of the same rule on screen.

A data policy can also be configured to *also* apply as a UI policy, which saves duplicating simple rules. Know that the option exists; prefer explicitness while you are learning.

## When configuration is not enough

Some form behaviour genuinely cannot be expressed as a condition and three checkboxes:

- Setting one field's *value* from another's — not showing or hiding it, but calculating it.
- Filtering the choices in a dropdown based on something else on the form.
- Showing a message rather than changing a field.
- Anything that needs data not present on the form.

Those are client script territory, and lesson 5 covers them. Before you go there, apply the rule that experienced builders apply automatically: **a UI policy is faster, safer, easier to read, and survives platform upgrades better than the client script that would replace it.** Every form behaviour you can express declaratively, you should. The best-maintained applications on the platform are not the ones with the cleverest scripts; they are the ones with the fewest.

## Practice

Work on the `Facilities Work Orders` application and the `work_order` table.

1. **Lay out the default form.** Build the three-section layout shown above — Request, Assignment, Closure — using either editor. Add the activity formatter below the last section.

2. **Add the missing fields.** You will need `close_code` (Choice: Repaired, Replaced, No Fault Found, Referred to Contractor) and `close_notes` (String, at least 1000 characters) and `contractor_company` (String). Add them from the form designer so you see how field creation works from the canvas.

3. **Add the related list.** Put Work Order Parts on the form. Create a part usage inline from an existing work order and confirm the parent reference filled in automatically.

4. **Write three UI policies.** Implement the closure-fields, contractor-detail, and lock-when-closed policies described above. Set On load and Reverse if false on each, and number them 100, 200, 300.

5. **Test them properly.** Open a new work order and confirm the closure fields are absent. Set the state to Closed Complete and confirm they appear and block the save. Save the record, reopen it, and confirm the closure fields are still visible — this is the test that catches a missing On load. Then tick and un-tick `requires_contractor` and confirm the contractor field appears and disappears — this is the test that catches a missing Reverse if false.

6. **Build a second view.** Create a `Technician` view of `work_order` showing only `number`, `short_description`, `location`, `state`, `assigned_to`, and `work_notes`, with the activity formatter. Switch to it manually and confirm your UI policies still apply — they follow the field, not the view.

7. **Add a view rule.** Write a view rule that selects the Technician view for users holding your technician role. Impersonate a technician and confirm the simple form loads without them choosing it.

8. **Draw the line.** Write a short data policy making `close_code` mandatory when the state is Closed Complete. Then explain in two or three sentences what that data policy protects against that the equivalent UI policy does not.

9. **Stretch.** Look at your three UI policies and identify any behaviour you were tempted to add but could not express declaratively. Write it down as a one-line requirement. You will implement it in lesson 5, and comparing your instinct then against what the platform actually needed is the point.
