---
lesson_id: sn280-06
course_id: sn280
pathway: servicenow-implementation-specialist
title: Customizing Forms, Fields, and Tables for ITSM
order: 6
kind: lesson
competency_ids:
  - D2-S1-C02
objectives:
  - Customize forms, fields, and tables for an ITSM requirement without breaking upgradeability
---

## The only question that matters

A customer says: "We need to record which vendor a hardware incident was escalated to."

Before you touch anything, answer this question: **is there an out-of-box way to record that?** Because there usually is, and the cost of not checking is permanent. Every field you add is a field that has to be maintained, trained, reported on, populated by every integration, and reconciled at every future upgrade. Every out-of-box record you modify is a record that will collide the next time the vendor ships a new version of it.

The discipline that separates a durable ITSM implementation from a fragile one is not skill with the form designer. It is a decision procedure applied before the form designer is opened:

1. **Does the platform already model this?** A vendor is a company record; a third-party escalation may already be expressible through an existing field, a related record, or a work note convention.
2. **If not, can it be added without modifying anything the vendor owns?** A new field on an existing table is far safer than editing an out-of-box field's dictionary entry.
3. **If it must modify something, what will the upgrade do to it?**

That third question is the one this lesson is really about. Everything else follows.

## Configure, customize, and what upgrades do

ServiceNow draws a line between **configuration** — creating your own records, which the vendor never touches — and **customization** — modifying records the vendor ships, which the vendor may update.

When you modify an out-of-box record, the platform records a **customer update** for it. At upgrade time the vendor ships a new version of that record, and the platform now has a conflict: your version and theirs. It resolves it by **skipping** the vendor's change and keeping yours, and it lists the record in the skipped-updates set for a human to review. That review is a real cost — on a heavily customized instance it is days of work per upgrade, performed by someone who has to reconstruct why each change was made.

The practical consequences:

- **A new field you add is safe.** The vendor does not ship a record for it, so there is nothing to conflict with.
- **A new business rule, UI policy, or client script you create is safe.** Same reason.
- **Modifying an out-of-box business rule, UI policy, or script is expensive.** Prefer creating your own alongside it. If the out-of-box one must not run, deactivate it rather than editing it — a deactivated record has a much smaller conflict surface than a rewritten one, and the reason is visible.
- **Modifying an out-of-box form layout or list layout is cheap and normal.** Layout is expected to be customized; it is what forms are for.
- **Adding a choice to an out-of-box choice list is normal. Deleting one is not** — deleted choices come back at upgrade, and existing records still reference them. Deactivate instead of deleting.

Two conventions make this manageable. First, **prefix custom fields**. Fields created through the UI get a `u_` prefix automatically in the global scope; keep it. Anyone reading a form can then tell in a glance what the vendor owns and what you do. Second, **write down why**. The description field on a custom dictionary entry, business rule, or UI policy should name the requirement. Three years later, the person deciding whether a skipped update can be accepted needs that sentence more than they need the code.

## Tables: extend, create, or neither

You have three options when the customer's requirement seems to need a table.

**Add fields to the existing table.** The default answer, and correct far more often than customers expect. If the requirement is "incidents need three more attributes," it is three fields on `incident`, not a new table.

**Extend a table.** Create a table that inherits from an existing one, gaining all its fields and its behavior. The right choice when you have a genuinely distinct type of work that should still be visible as a task — a specialized incident type with its own form, its own state additions, and its own fulfilment process, that must still appear in the service desk's task queue and roll up into task reporting. Extension is powerful and it is also a commitment: every business rule, UI policy, and SLA scoped to the parent will run on your child table too.

Extend `task` when you are modeling *work*. Do not extend `incident` casually — an extended incident inherits the entire incident process, including its states, its SLAs, and its reports, and untangling that later is expensive.

**Create a standalone table.** For reference data that is not work: a list of vendor contract tiers, a lookup of building codes. These extend nothing (or extend the base system table) and stay small.

The anti-pattern to name explicitly: **do not create a parallel table for something the platform already models.** A custom "Service Requests" table because the catalog felt complicated, a custom "Assets" table because the CMDB looked intimidating. These are the customizations that cannot be undone, because within a year every report, integration, and habit depends on them.

## Fields: type, and the dictionary

A field is a **dictionary entry** (`sys_dictionary`), and the type you pick at creation is difficult to change later, because existing data has to be converted. Get it right the first time.

The types that matter in ITSM work:

- **String** with a max length. Use for genuinely free text. Do not use for anything you will report on by grouping.
- **Choice** for a small, stable set of values. Reportable, translatable, and enforceable. Configure whether the field allows values not in the list — usually it should not.
- **Reference** for a pointer to another record. Always prefer this over storing a name as a string: a reference survives a rename, gives you a dot-walk to every attribute of the target, and enforces existence. `u_vendor` as a reference to the company table is right; `u_vendor_name` as a string is a data-quality incident waiting to happen.
- **True/False** for a genuine binary. If there is any chance of a third state, use a choice.
- **Date/Time** rather than string, always. Time-zone handling and duration arithmetic depend on it.
- **Duration** for elapsed time. The platform computes with it correctly; a string does not.
- **List** (a multi-value reference) where a record genuinely relates to several others *and* you do not need per-relationship attributes. If you need attributes on the relationship — a date, a status, a note — use a related table instead.
- **Journal / Journal Input** for the append-only comment and work-note pattern.

Two dictionary features are worth knowing precisely.

**Dictionary attributes** control behavior beyond type: read-only, mandatory at the data layer, whether the field is auditable, the display value for a reference. Setting a field mandatory in the dictionary is stronger than setting it mandatory in a UI policy, because it applies to every write path including imports and web services. That strength is also the reason to be careful: a dictionary-mandatory field will fail an integration that does not know about it.

**Dictionary overrides** let a child table change an inherited field's behavior without altering the parent. If `assigned_to` should be mandatory on your extended table but not on `task` generally, that is a dictionary override on the child, not a change to the parent's dictionary entry. This is one of the cleanest tools in the platform and it is chronically underused.

## Forms: layout, sections, and design

The form is the interface the process actually runs through, and the design criterion is the same as in incident configuration: **the fast path must be the correct path.**

Practical rules for an ITSM form:

**Above the fold matters.** The fields required to triage the record — for an incident: caller, service, category, short description, priority inputs, assignment group — go in the first section, in the order the agent thinks in. Everything else goes below or into a later section.

**Sections are for lifecycle stages, not for categories of data.** A "Resolution Information" section that only matters when the record is being resolved is good design. A "Miscellaneous" section is an admission that nobody decided.

**Use form views rather than one form for everyone.** A view is a named layout of the same table. The service desk, the field engineer, and the mobile user need different fields. Configure views, then use **view rules** to select the view automatically based on conditions — role, device, record type — so nobody has to switch manually. This is far better than one enormous form with UI policies hiding two thirds of it.

**Related lists carry the process connections.** On an incident: child incidents, affected CIs, related problems, related changes, and SLAs. Each related list is a query, so each one costs something to render — include the ones the process uses and remove the ones nobody opens.

**Formatters and annotations** exist for the things a field cannot say. The activity formatter (the record's audit and journal stream) is the single most useful element on any ITSM form; make sure it is present and positioned where people look. A short annotation above a confusing section costs nothing and prevents a category of mis-entry.

**Form templates** pre-populate a set of fields for a recurring record shape. Where a group logs the same kind of incident repeatedly, a template is a better answer than a new field or a new form.

The **form designer** is the drag-and-drop interface for all of this; the older form layout interface does the same thing in list form. Use whichever you prefer — they write the same underlying records.

## Making fields behave: UI policy first, client script last

Two mechanisms change form behavior in the browser. Choose deliberately.

A **UI policy** is declarative: a condition plus a set of actions making fields mandatory, read-only, or visible. It is inspectable by an administrator who is not a developer, it self-documents, and it reverses itself when the condition stops being true — which is behavior you have to write by hand in a script and which everyone forgets.

A **client script** is JavaScript running in the browser on load, on change, on submit, or on cell edit. Necessary when the logic is more than a condition — a lookup, a computed value, a confirmation.

The rule: **if a UI policy can express it, a UI policy must express it.** Reach for a client script only when the requirement genuinely exceeds condition-plus-action. A form with fifteen client scripts is slow and unmaintainable; a form with fifteen UI policies is merely verbose.

When a client script is required, two things are non-negotiable. Never query the server synchronously — use the asynchronous form of `GlideAjax` or `getReference` with a callback, because a synchronous call freezes the browser for every user on every form load. And check for the empty value before acting, because an `onChange` script fires when the field is cleared as well as when it is set.

```javascript
function onChange(control, oldValue, newValue, isLoading, isTemplate) {
  if (isLoading || newValue === '') {
    return;
  }

  // Look up the vendor's support tier without blocking the browser.
  var ga = new GlideAjax('VendorTierAjax');
  ga.addParam('sysparm_name', 'getSupportTier');
  ga.addParam('sysparm_vendor', newValue);
  ga.getXMLAnswer(function (answer) {
    g_form.setValue('u_vendor_support_tier', answer || '');
    if (answer === 'premium') {
      g_form.addInfoMessage('Premium vendor: 4-hour contractual response applies.');
    }
  });
}
```

Note what this script does *not* do: it does not enforce anything. Enforcement that matters must exist on the server as well, because a client script protects the form and nothing else. Server-side rules are the subject of lesson 9; the boundary to hold in your head is that **client-side code is for user experience, server-side code is for correctness.**

A **data policy** is the third member of this family and the one most often forgotten. It enforces mandatory and read-only at the data layer, and it can be configured to apply to imports and web service writes as well as to the form. When the requirement is "this must never be blank, no matter how the record was created," that is a data policy, not a UI policy.

## Lists, and the other half of the interface

Agents spend more time in lists than in forms. Configure them.

**List layout** per table and per view, showing the columns a triager needs to decide what to open — not every column on the table. **List controls** determine which actions are available. **Related list layouts** are configured separately from the parent form's list layout, and defaulting them to whatever the platform ships is a common oversight.

Give the customer's groups sensible saved **filters and modules** rather than expecting each agent to build their own, and remember that a personal list layout change made by an administrator affects only that administrator — to change it for everyone you must edit the list layout for the view, not personalize it.

## Worked example: the vendor escalation requirement

Back to the opening requirement: record which vendor a hardware incident was escalated to, and when.

**Step 1 — check what exists.** The `incident` table has no vendor field in the baseline. Related records exist for third-party work in some implementations; assume here they are not in scope. The customer's vendors already exist as company records.

**Step 2 — decide the shape.** Two fields, not one: `u_escalation_vendor` as a **reference to the company table**, and `u_vendor_escalated_at` as a **date/time**. A single string field holding "Acme, 14th" would be unreportable.

Why a reference: the customer will want "incidents escalated to each vendor, by month," and a reference gives that for free while surviving a company rename.

**Step 3 — constrain the reference.** A reference qualifier limits the choices to companies flagged as vendors, so the agent is not picking from every company record on the instance. This is configuration on the dictionary entry, and it prevents an entire class of bad data.

**Step 4 — form placement.** Both fields go into the existing third-party or resolution section, not into the top section, because they apply to a minority of incidents and the top section is expensive real estate.

**Step 5 — behavior.** A UI policy: when `u_escalation_vendor` is not empty, `u_vendor_escalated_at` becomes mandatory and visible; when it is empty, both are hidden. Two conditions, two actions, no script. The reverse action is automatic, which is exactly what a client script implementation would have got wrong.

**Step 6 — enforcement.** The customer says an escalated incident must never be resolved without an escalation date. That is a **data policy**, because incidents also arrive from an email integration.

**Step 7 — list and reporting.** Add the vendor column to the hardware-team list view. Confirm the field is auditable so the history shows when it was set.

**Step 8 — upgrade posture.** Everything built is a new record: two dictionary entries, one UI policy, one data policy, one reference qualifier, plus layout changes. No out-of-box record was modified. The next upgrade will skip nothing.

That last line is the deliverable. It should be true of most requirements, and when it cannot be true, the exception should be written down with its reason.

## Practice

Work in a personal developer instance, and capture everything in one named update set.

1. **Decision procedure.** For each requirement below, write which of the three options you would take — existing field, new field on an existing table, or new/extended table — and one sentence of justification:
   - "Record the physical asset tag of the device an incident concerns."
   - "Track a specialized security incident type with its own states and its own fulfilment team, visible in the normal task queue."
   - "Maintain a list of approved hardware vendors with contract tiers."
   - "Note whether the caller was satisfied with the resolution."

2. **Fields.** Implement the vendor escalation requirement from the worked example: a reference field constrained by a reference qualifier, and a date/time field. Confirm the qualifier works by opening the reference picker.

3. **Dictionary override.** Extend `task` with a small custom table. On the child only, make `assigned_to` mandatory using a dictionary override. Verify that `task` and the other task-derived tables are unaffected.

4. **Form design.** Build a form view for your custom table with at least two sections and a sensible field order. Add the activity formatter and one related list. Then configure a view rule that selects a different view based on a condition of your choosing, and demonstrate it switching.

5. **UI policy versus client script.** Implement the show/hide/mandatory behavior from the worked example as a UI policy. Then write down, in three or four sentences, what the equivalent client script would have to do — including what happens when the vendor field is cleared — and why the policy is the better choice.

6. **Data policy.** Add a data policy enforcing that the escalation date is present when the vendor is present. Test it from the form, and then test it by inserting a record another way (an import or a background script) to prove it holds on both paths.

7. **Upgradeability audit.** List every record you created or modified in this exercise. Mark each as configuration (new record) or customization (modified vendor record). For anything in the second category, write the sentence you would leave in its description field for whoever reviews skipped updates after the next upgrade. If the second category is empty, say so — that is the target.
