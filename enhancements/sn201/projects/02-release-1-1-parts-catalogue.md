---
course_id: sn201
project_id: sn201-x02
title: "Release 1.1: Parts Catalogue, Seed Data, and a Clean Promotion"
kind: supplementary-project
status: draft
hours_estimate: 5
difficulty: stretch
related_lessons:
  - sn201-03
  - sn201-08
objectives:
  - Move an application between instances using update sets and source control
  - Design an application data model using tables, fields, and table extension
competency_ids:
  - D10-S1-C02
  - D2-S1-C02
---

## Scenario
Facilities Work Orders 1.0 is in test. The facilities manager's first change request: technicians must pick parts from an approved **parts catalogue** with standard costs, and the `part` records must exist on every instance the app is installed on. Lesson 8 told you `part` records do not travel by default. This release fixes that properly, promotes cleanly, and leaves an audit trail a release manager would accept.

## What you will build / produce
- `x_acme_facilities_part` marked so its records are captured (`update_synch=true`), seeded with 8 standard parts plus 1 inactive test part.
- A new field `part_category` (Choice: Electrical, Plumbing, HVAC, General) on `part`, and a reference qualifier on `work_order_part.part` limiting parts to active ones whose category matches the work order's `work_type` (advanced/dynamic qualifier is acceptable; justify).
- Update set `Facilities Work Orders v1.1 — parts catalogue`, application version bumped to 1.1.0.
- A promotion to a second instance (partner's PDI) **or** a documented XML import/preview/commit back onto your own PDI after a controlled back-out (see milestone 6).
- A release note and a back-out plan.

## Before you start (prerequisites, starter files or data)
- Facilities Work Orders app at the end of lesson 8 (data model, parts tables, update set habits). Record any existing parts separately: the verifier below expects exactly the nine drill parts in a clean dataset; otherwise filter its aggregate queries to your recorded drill sys_ids.
- Application picker on Facilities Work Orders; create the named update set *before* any change and confirm it is current.
- If you can pair with another learner, exchange PDI URLs and create a dedicated retrieval account with the roles required by Update Sources (admin is not a read-only role) for each other's **Update Source** (System Update Sets > Update Sources). Otherwise use the XML route.

## Milestones
1. **Plan the release.** Write the release note skeleton first: what changes, what data travels, dependencies (1.0 must be installed), back-out.
2. **Mark the table.** Open the `x_acme_facilities_part` table's collection dictionary entry (the row with no column name) and add attribute `update_synch=true`. Confirm in the update set that the dictionary change was captured.
3. **Seed data.** On a clean drill dataset, create 8 parts (2 per category) with SKU, standard cost, active. Confirm each part record appears as a customer update in your update set. Then create one deliberately *inactive* part.
4. **Field and qualifier.** Add `part_category`; set categories on all parts. On `work_order_part.part`, add a reference qualifier: `javascript:'active=true^part_category=' + current.work_order.work_type` (or a script include if you prefer — justify). Test from a work order with work type HVAC: only active HVAC parts are offered.
5. **Version and audit.** Bump the application version to 1.1.0. Open the update set and audit every customer update: classify each as *table/dictionary*, *choice*, *data (part)*, *qualifier*, *other*. Anything unexpected (a global record, a test incident) must be explained or removed (move it to another set; do not delete the update record blindly).
6. **Promote.**
   - *Two-instance route:* on the target, Retrieve Completed Update Sets from your source; **Preview**; resolve every problem; **Commit**.
   - *Single-instance route:* Complete and **Export to XML**. Then, on your PDI, back out the set (System Update Sets > Local Update Sets > your set > **Back Out**), confirm the field and parts are gone, **Import Update Set from XML**, **Preview**, **Commit**. Record what back-out did and did not reverse (e.g. part records created while the config was live).
7. **Verify on the target.** Run the verification script below on the target instance.
8. **Source control (optional if your release lacks it on PDI).** Commit the application to a Git repository with message "v1.1.0 parts catalogue" and create tag `v1.1.0`.

## Acceptance criteria
- [ ] All 9 part records (8 active + 1 inactive) exist on the target after commit, with the same sys_ids as the source.
- [ ] The qualifier offers only active parts of the matching category.
- [ ] Preview completed with zero unresolved problems; any skipped update is justified in writing.
- [ ] Application version on target reads 1.1.0.
- [ ] Release note covers changes, data, dependencies, verification steps, and back-out.

## Evidence checklist
- [ ] Screenshot: collection dictionary entry with `update_synch=true`.
- [ ] Update set audit table (record, type, classification).
- [ ] Preview problems list (even if empty) and commit confirmation.
- [ ] Back-out evidence (single-instance route): before/after screenshots.
- [ ] Verification script output from the target.
- [ ] Release note and back-out plan (1 page).
- [ ] Optional: repository URL + tag.

### Verification script (target instance, Scripts - Background, app scope)
```javascript
(function () {
  function check(label, ok) { gs.info((ok ? 'PASS ' : 'FAIL ') + label); }
  var app = new GlideRecord('sys_app');
  check('app version 1.1.0', app.get('scope', 'x_acme_facilities') && app.getValue('version') === '1.1.0');

  var parts = new GlideAggregate('x_acme_facilities_part');
  parts.addAggregate('COUNT');
  parts.query();
  parts.next();
  check('9 part records present (found ' + parts.getAggregate('COUNT') + ')', parts.getAggregate('COUNT') === '9');

  var cats = new GlideAggregate('x_acme_facilities_part');
  cats.addQuery('active', true);
  cats.addAggregate('COUNT');
  cats.groupBy('part_category');
  cats.query();
  var n = 0;
  while (cats.next()) { n++; }
  check('4 categories represented among active parts (found ' + n + ')', n === 4);

  var dict = new GlideRecord('sys_dictionary');
  dict.addQuery('name', 'x_acme_facilities_work_order_part');
  dict.addQuery('element', 'part');
  dict.query();
  check('qualifier present on work_order_part.part',
        dict.next() && dict.getValue('reference_qual').indexOf('part_category') !== -1);
})();
```
Adjust the scope name if yours differs from `x_acme_facilities`.

## Rubric
| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Data plan | Part records missing on target | `update_synch` used; all parts travel | Explains why work orders must never be marked the same way |
| Update set hygiene | Unexpected records shipped | Audited, classified, clean | Splits into two sets and batches them with explicit order |
| Promotion | Committed without preview | Preview read, problems resolved | Manufactured and resolved a collision deliberately |
| Back-out | No plan | Plan written and (single-instance) exercised | Lists what back-out cannot reverse and the mitigation |
| Release note | Missing items | Complete | Usable by someone who never saw the app |

## Stretch goals
- Replace the inline qualifier with a script include and an ATF test for it (combine with sn201-x01).
- Publish the app to the instance's application repository (if available) and install it on the target from there.

## Reflection prompts
- Which records in your set were configuration that *looked* like data, and vice versa?
- What would have happened if you had marked `work_order` with `update_synch=true`?
- Was back-out a real safety net? Where would you not rely on it?

## Instructor notes (common pitfalls, how to adapt for time)
- `update_synch` captures records only from the moment it is set; parts created earlier must be re-saved (touch and update) to be captured.
- Dynamic qualifier syntax and the `javascript:` prefix are long-standing but verify on the current release; scoped apps may need the qualifier type set to *Advanced*.
- Version field location (application record) and source control UI moved between Studio and newer tools — not verified on current PDI.
- Back-out on a PDI is safe but learners should export XML first.
- **Time-box:** 3-hour version — skip milestone 8 and use the XML route without back-out.
