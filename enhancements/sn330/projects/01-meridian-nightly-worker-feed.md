---
course_id: sn330
project_id: sn330-x01
title: "Meridian Logistics Nightly Worker Feed"
kind: supplementary-project
status: draft
hours_estimate: 6
difficulty: core
related_lessons:
  - sn330-09
  - sn330-02
objectives:
  - Integrate HRSD with an HRIS or payroll system using import sets, transform maps, and error handling
competency_ids:
  - D4-S1-C05
  - D8-S1-C02
  - D8-S1-C04
---

## Scenario

Meridian Logistics (the employer from the course project: about 4,000 employees in the US, UK, and India) is replacing a weekly spreadsheet upload with a nightly worker file from its HRIS. Last month's manual upload created 31 duplicate users because someone coalesced on email, and three new hires lost their manager relationship, which stalled their leave approvals. The HR operations lead wants an integration that rejects bad rows loudly, never duplicates a person, resolves managers reliably, and produces a reconciliation summary every morning.

This project can be done on a Personal Developer Instance (PDI) **with or without** the HRSD plugins: the core build targets `sys_user` and `cmn_department`. If HRSD is active on your PDI, extend the target to the HR profile as a stretch goal.

## What you will produce

- A data source, staging table, two transform maps (worker pass, manager pass), a value translation table, and a feed issue table.
- A per-row validation script and run-level guards.
- A reconciliation summary for three runs: the planted-defect file, the same file again (idempotency), and a truncated file (guard).
- A one-page operations note for whoever watches the feed.

## Before you start (prerequisites, starter files or data)

- PDI with admin access. Create and select an update set `MERIDIAN-HRIS-001`.
- Create three departments in `cmn_department` with a custom field `u_source_code`: `OPS` (Operations), `FIN` (Finance), `HRS` (Human Resources).
- Create the two custom tables from lesson 9: `u_hris_value_map` (fields: `source_system`, `field_name`, `source_value`, `target_value`) and `u_hris_feed_issue` (fields: `import_set_row` reference, `employee_number`, `severity` choice of error/warning, `message`). Populate `u_hris_value_map` for `FT`, `PT`, `TMP` only (deliberately leave `CONTR` unmapped).
- Add custom fields to `sys_user` for `u_employee_number` (string, unique), `u_employment_type`, and `u_hire_date` (date), or use your HR profile equivalents if HRSD is active.
- Save this starter file as `meridian_workers.csv` (12 rows shown; extend to 50 following the same patterns, and keep a key of every planted defect):

```csv
employee_number,first_name,last_name,email,employment_type,hire_date,department_code,manager_employee_number
10000001,Ana,Ruiz,ana.ruiz@meridian.example,FT,2019-04-01,OPS,
10000002,Ben,Okafor,ben.okafor@meridian.example,FT,2020-06-15,OPS,10000001
10000010,Chen,Li,chen.li@meridian.example,PT,2023-01-09,FIN,10000011
10000011,Dana,Shah,dana.shah@meridian.example,FT,2018-02-20,FIN,10000001
,Eve,Blank,eve.blank@meridian.example,FT,2024-03-04,OPS,10000001
10000012,Femi,Adeyemi,femi.adeyemi@meridian.example,CONTR,2024-05-06,OPS,10000002
10000013,Gita,Rao,gita.rao@meridian.example,FT,03/07/2024,HRS,10000011
10000014,Hal,Moss,hal.moss@meridian.example,FT,2024-02-01,LOG,10000002
10000015,Ivy,Nash,ana.ruiz@meridian.example,FT,2024-02-12,OPS,10000002
10000016,Jon,Park,jon.park@meridian.example,TMP,2213-01-01,OPS,10000002
10000002,Ben,Okafor-Smith,ben.os@meridian.example,FT,2020-06-15,OPS,10000001
10000017,Kai,Lund,kai.lund@meridian.example,FT,2024-06-03,FIN,10000018
```

Planted defects in the starter (find them all in your summary): blank employee number (row 5); unmapped type `CONTR` (row 6); non-ISO date (row 7); unknown department `LOG` (row 8, warning only); email reused by a different person (row 9, must *not* merge into Ana); far-future hire date (row 10); duplicate employee number with a name change (row 11, should update Ben, not create a second Ben); manager who does not exist in the file (row 12, warning in pass two); and a manager who appears *after* their report (row 3's manager 10000011 is on row 4).

## Milestones

1. **Ownership contract.** Fill in the field-level table from lesson 9 practice step 1 for the eight columns: owning system, update frequency, what happens if edited in ServiceNow.
2. **Load raw.** Create the data source (File, CSV, header row 1) and load without transforming. Confirm every defect is present unmodified in the staging rows.
3. **Pass one transform map** (staging to `sys_user`): coalesce on `u_employee_number` only. Map names, email, department (via the script), type (via translation table), hire date (via the script). Do **not** map the manager. Use the per-row validation script from lesson 9, extended with a hire-date sanity window (for example, not before 1950, not more than 365 days in the future).
4. **Pass two transform map** on the same staging table: coalesce on `u_employee_number`, map only `manager`, resolving `manager_employee_number` to a `sys_user` sys_id with a script; log a warning to `u_hris_feed_issue` when unresolved. Run it after pass one.
5. **Run-level guards.** In an `onStart` script on pass one, count the staging rows for this import set; if fewer than a configured minimum (for the drill, 10), log an error and stop the run (set `ignore = true` for every row, or abort per your release's supported mechanism, and record which you used). Add a threshold abort in `onComplete`: if errors exceed 10 percent of rows, create a high-severity issue.
6. **Run the planted file, then run it again.** The second run must produce zero inserts.
7. **Run a truncated file** (the first five rows only) and confirm the short-file guard refuses it and reports.
8. **Reconciliation summary** using the script below, then write the operations note.

## Acceptance criteria

- [ ] No user record is coalesced on email or name; row 9 creates a separate user (or is rejected) and never overwrites Ana Ruiz.
- [ ] Row 11 updates Ben Okafor's existing record (last name and email change), proving employee-number identity.
- [ ] Every planted error appears in `u_hris_feed_issue` with the right severity, and rows with multiple problems report all of them.
- [ ] `CONTR` produces an error, not a blank or a default.
- [ ] Chen Li's manager resolves to Dana Shah after pass two, even though Dana appears later in the file.
- [ ] The second run of the same file inserts nothing.
- [ ] The truncated file is refused and the refusal is visible to a human.
- [ ] No user record was deleted at any point.

## Evidence checklist

- [ ] Ownership contract table.
- [ ] Screenshot of staging rows for the planted defects, before transform.
- [ ] Both transform maps (screenshots of field maps and coalesce flags) and the full validation script.
- [ ] Output of this reconciliation script (System Definition > Scripts - Background), run after each of the three runs. Replace the import set number.

```javascript
var SET = 'ISET0010001'; // your import set number
var rows = new GlideAggregate('sys_import_set_row');
rows.addQuery('sys_import_set.number', SET);
rows.addAggregate('COUNT');
rows.groupBy('sys_import_state');
rows.query();
while (rows.next()) {
  gs.info('Row state ' + rows.getDisplayValue('sys_import_state') + ': ' + rows.getAggregate('COUNT'));
}
var iss = new GlideAggregate('u_hris_feed_issue');
iss.addQuery('import_set_row.sys_import_set.number', SET);
iss.addAggregate('COUNT');
iss.groupBy('severity');
iss.query();
while (iss.next()) {
  gs.info('Issues ' + iss.getValue('severity') + ': ' + iss.getAggregate('COUNT'));
}
var dup = new GlideAggregate('sys_user');
dup.addNotNullQuery('u_employee_number');
dup.addAggregate('COUNT', 'u_employee_number');
dup.groupBy('u_employee_number');
dup.addHaving('COUNT', '>', '1');
dup.query();
var d = 0;
while (dup.next()) { d++; gs.info('DUPLICATE employee number: ' + dup.getValue('u_employee_number')); }
gs.info('Duplicate employee numbers: ' + d);
var chen = new GlideRecord('sys_user');
if (chen.get('u_employee_number', '10000010')) {
  gs.info('Chen Li manager: ' + chen.getDisplayValue('manager'));
}
```

  The import-set row state field name (`sys_import_state`) is the commonly used one; confirm it on your release by opening an import set row.
- [ ] Reconciliation summary table: run, received, inserted, updated, ignored, errors by type, warnings by type.
- [ ] Defect key versus summary comparison, with any planted defect your validation missed and how you fixed it.
- [ ] Operations note: who reads the summary, what thresholds trigger action, how to re-transform after fixing a map, and how a termination row will be handled (inactive plus termination date, never delete).

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Identity | Coalesce includes email or name | Coalesce on employee number only; duplicates impossible | Explains multi-field coalesce for a second legal entity |
| Validation | Stops at first error or silently defaults | Collects all errors, rejects vs warns correctly, writes to issue table | Validation rules driven by data (thresholds, date window) rather than hard-coded |
| Relationships | Manager lost for late-appearing managers | Two-pass resolution proven | Unresolvable managers reported with the employee number of the missing manager |
| Run-level controls | None | Short-file and threshold guards demonstrated | Also alerts on absence of a successful run |
| Operability | No summary | Summary for all three runs | Note lets a new analyst operate the feed unaided |

## Stretch goals

- If HRSD is active on your PDI, add a third map to the HR profile table and make the imported fields read-only on the profile form.
- Add an ATF test (see sn301) with a server step that inserts a staging row with a blank employee number, runs the transform, and asserts a `u_hris_feed_issue` error exists. Note any limitations you hit with transforms inside ATF rollback.
- Add a future-dated termination row and a rehire row (lesson 9 practice step 10).

## Reflection prompts

- Which planted defect would have caused the most damage if it had loaded silently, and why?
- What would happen to Meridian's leave approvals if pass two silently failed for a month?

## Instructor notes (common pitfalls, how to adapt for time)

- Learners often leave email as a secondary coalesce "for safety". Row 9 is designed to catch that: it would merge Ivy into Ana.
- Ensure learners understand that `ignore = true` skips a row; it does not roll back rows already written.
- Abort mechanisms in `onStart` vary across releases (setting `ignore`, or `error = true`); have learners record which one they used and verify its effect.
- For a 3-hour version, provide the custom tables and translation data pre-built in an update set.
