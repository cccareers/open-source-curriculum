---
lesson_id: sn330-09
course_id: sn330
pathway: servicenow-implementation-specialist
title: Integrating HRSD with HRIS and Payroll
order: 9
kind: lesson
competency_ids:
  - D4-S1-C05
  - D8-S1-C02
  - D8-S1-C04
objectives:
  - Integrate HRSD with an HRIS or payroll system using import sets, transform maps, and error handling
---

## Who owns the truth

Everything you have built so far depends on employee data being correct. HR criteria read work country and employment type. Assignment rules read region. Approvals read the manager relationship. Lifecycle events read start dates. Access controls read who someone is and who they report to. All of that comes from somewhere, and in almost every organization that somewhere is the **HRIS** — the core human resources information system of record.

The first and most consequential decision in this lesson is therefore a governance decision, not a technical one:

**The HRIS owns worker master data. ServiceNow consumes it.**

Employee number, legal name, employment status, employment type, hire and termination dates, position, department, work location, and the manager relationship are *read* into ServiceNow and *not authored* there. HRSD owns what it creates: cases, tasks, knowledge, portal content, lifecycle event records, and the service configuration.

The failure mode when this line is blurred is slow and expensive. An agent corrects a work location on the HR profile because it is wrong and a case is misrouting. It is right for a week. Then the nightly feed overwrites it, or worse, does not overwrite it and the two systems disagree permanently. Now nobody knows which is true, criteria evaluate inconsistently, and the eventual fix is a data reconciliation project.

Write the ownership statement into the design document, field by field, and make the HR profile form read-only for imported fields. That single configuration decision prevents most of the integration pain an implementation will otherwise experience.

## The integration patterns, and choosing one

Three patterns dominate HRIS integration.

**Scheduled file-based feed.** The HRIS drops a delimited file — CSV, usually — onto SFTP on a schedule, and ServiceNow imports it. Unglamorous, extremely common, and the right answer far more often than implementers expect. It is easy to reprocess, easy to audit (you have the file), robust to outages, and it does not require the HRIS vendor to build anything.

**Scheduled API pull.** ServiceNow calls the HRIS API on a schedule and loads the results. Better freshness, more moving parts, and dependent on API rate limits and pagination behavior.

**Event-driven push.** The HRIS calls ServiceNow when something changes. Near-real-time, and appropriate for the events where latency genuinely matters — a termination, most obviously, because a delayed termination is an access-control problem.

Most mature implementations use a **hybrid**: a nightly full or delta file feed as the reliable baseline that guarantees eventual consistency, plus event-driven notification for the handful of urgent events. That combination is worth arguing for, because event-driven-only integrations have no self-healing mechanism — a missed event is missed forever until someone notices the data is wrong.

This lesson builds the file-based path, because it is the one that exercises import sets, transform maps, and error handling — the skills that transfer to every other pattern, since an API pull lands in exactly the same staging and transform machinery.

## Import set anatomy

The platform's import pipeline has four stages and a staging table between the first two. Understanding the separation is what makes debugging tractable.

**Data source** describes where the data comes from: an attached file, an SFTP or FTP location, a JDBC connection, or a REST endpoint. It defines the format, the delimiter, the header row, and the credentials.

**Import set table** is the staging table. Every column arrives as a string; nothing is validated, nothing is coerced, nothing is rejected. Each run creates an import set record, and each row of the file creates an import set row linked to it. This is deliberate: the raw data is preserved exactly as it arrived, so that when a transform fails you can see what the source actually sent rather than what you assumed.

**Transform map** describes how staging columns become target-table fields. It carries the field maps, the coalesce configuration, and the transform scripts.

**Target table** is where the data lands: the user table, the HR profile table, department, location, group.

Two properties of this pipeline are worth internalizing.

**The staging table is your evidence.** When someone asks why an employee's department is wrong, the import set row shows exactly what the file contained on that date. Retain import set rows long enough to answer such questions, and clean them up on a schedule so the tables do not grow without bound.

**A transform can be re-run.** If a transform map was wrong, you fix the map and re-transform the existing import set rather than asking the HRIS to resend. This is one of the strongest arguments for the pattern.

## Field mapping and coalescing

The **coalesce** field is the identity decision, and it is where integrations most often go permanently wrong.

Coalesce tells the transform how to decide whether an incoming row is a new record or an update to an existing one. If the coalesce value matches an existing target record, that record is updated. If not, a new one is inserted.

**Coalesce on the employee number.** It is issued by the HRIS, it is stable across name changes, marriage, department moves, and email domain migrations, and it is unique. Nothing else on a worker record has all three properties.

**Do not coalesce on email.** Email changes, is sometimes absent for pre-hires and for frontline workers, and is occasionally reused. Coalescing on email produces duplicate users and, when reused, produces one user record containing two people's data — which is a privacy incident, not a data-quality issue.

**Do not coalesce on name.** This should not need saying, and yet.

Where a single field is not sufficient — commonly in multi-company instances where employee numbers are unique per legal entity rather than globally — use **multi-field coalesce**: company plus employee number. Every field marked as a coalesce field participates, and all must match.

Beyond identity, mapping falls into three kinds:

**Direct field maps.** Source column to target field, unchanged. The majority.

**Reference field maps.** The source sends a department code or a manager's employee number; the target field is a reference to a record. The transform must resolve the code to a sys_id. Configure this with the reference mapping options where the lookup is simple, and with a script where it is not. Resolution failures here are the single largest category of import error, which is why the next section exists.

**Scripted maps.** Value translation, formatting, defaulting, and conditional logic. Keep these short and put anything reusable in a mapping table rather than in the script.

### Value translation belongs in data

The HRIS says `FT`, `PT`, `TMP`, `CONTR`. Your instance uses `Full time`, `Part time`, `Temporary`, `Contractor`. Do not write that as a chain of conditions in a transform script. Create a small translation table — source system, source value, target value — and look it up. When the HRIS adds a new employment type next year, HR updates a row instead of raising a change request against a script, and the unmapped value produces a clean, reportable error instead of a silent blank.

## Ordering and the manager problem

A worker feed cannot be loaded in one pass, and understanding why teaches the general principle.

Employee A's record references their manager, employee B. If B is imported after A, the manager reference on A cannot resolve — B does not exist yet. Naive implementations lose the manager relationship on some fraction of records every run, which quietly breaks approvals and manager access.

The standard resolution is a **two-pass import**: pass one creates or updates every worker with all non-relational fields and leaves the manager reference alone; pass two, over the same import set, resolves and sets the manager reference now that every worker exists. Implement pass two as a second transform map on the same staging table, or as an onComplete step.

The same ordering logic applies across entities. Load reference data first — companies, locations, departments, cost centers — then workers, then relationships. Encode the order in the scheduled job rather than trusting that the files happen to arrive in a helpful sequence.

## Deltas, full loads, and terminations

**Delta feeds** send only changed records. They are smaller and faster, and they have one serious weakness: you cannot detect a record that was deleted or that stopped being sent. If the HRIS drops a worker from the feed, a delta-only integration will keep that user active forever.

**Full feeds** send everything each run. Heavier, but they let you reconcile: anyone in ServiceNow, sourced from this feed, who was not in today's file is either terminated or a data problem, and either way you want to know.

A pragmatic pattern is a nightly delta with a weekly or monthly full reconciliation.

**Terminations deserve their own treatment.** Never delete a user record. Deleting breaks every historical case, task, approval, and audit entry that references them, and it destroys the record of who did what. Instead, set the record inactive, stamp the termination date, and let the offboarding lifecycle event handle access revocation.

Handle these termination-adjacent cases explicitly:

- **Rehires.** The same person returning, coalescing onto the existing record. Reactivate rather than creating a duplicate — which is another argument for a stable employee number.
- **Future-dated terminations.** The HRIS knows on the 1st that someone leaves on the 30th. Do not deactivate on receipt; store the date and act on it. Conversely, do not ignore it — the offboarding lifecycle event should start.
- **Retroactive corrections.** The HRIS sometimes corrects history. Decide whether your import honors backdated changes or flags them.

## Validation and error handling

This is the part of an integration that separates a build that survives contact with production from one that does not. Assume the feed will contain bad rows, because it will.

**Validate in the transform, before the write.** An `onBefore` transform script is the natural place: it can inspect the incoming row, correct what is safely correctable, and reject what is not by setting `ignore = true`, which skips the row without failing the whole run. (`ignore` is a variable the transform engine provides to the script; assigning it inside the wrapper function, as below, still sets the engine's variable. Rows already written earlier in the run are not rolled back.)

What to validate on a worker feed:

- Required identifiers present and non-blank — employee number above all.
- Dates parse, and are sane. A hire date in 1899 or 2213 is a source defect, not a record to load.
- Enumerated values resolve through the translation table; an unmapped value is an error, never a silent default.
- References resolve — department, location, company. Decide per field whether an unresolvable reference is a reject or a load-with-blank-and-report.
- Sanity thresholds at the *run* level, covered below.

Here is a worked `onBefore` script for a worker feed. It shows validation, translation, safe correction, rejection, and structured error capture together.

```javascript
(function transformRow(source, target, map, log, isUpdate) {
  // Runs onBefore for each row of the nightly worker feed.
  // Contract: reject bad rows loudly; never write a half-correct worker record.

  var errors = [];

  // --- 1. Identity is non-negotiable -------------------------------------
  var empNo = (source.u_employee_number || '').toString().trim();
  if (!empNo) {
    errors.push('Missing employee_number');
  }

  // --- 2. Date validation ------------------------------------------------
  var hireRaw = (source.u_hire_date || '').toString().trim();
  if (hireRaw) {
    var hire = new GlideDateTime();
    // Source sends ISO yyyy-MM-dd; anything else is a source defect.
    if (!/^\d{4}-\d{2}-\d{2}$/.test(hireRaw)) {
      errors.push('Unparseable hire_date: ' + hireRaw);
    } else {
      hire.setDisplayValueInternal(hireRaw + ' 00:00:00');
      target.u_hire_date = hire.getDate();
    }
  }

  // --- 3. Enumerated value translation via a mapping table ---------------
  var srcType = (source.u_employment_type || '').toString().trim().toUpperCase();
  if (srcType) {
    var xlat = new GlideRecord('u_hris_value_map');
    xlat.addQuery('source_system', 'HRIS');
    xlat.addQuery('field_name', 'employment_type');
    xlat.addQuery('source_value', srcType);
    xlat.setLimit(1);
    xlat.query();
    if (xlat.next()) {
      target.u_employment_type = xlat.getValue('target_value');
    } else {
      errors.push('Unmapped employment_type: ' + srcType);
    }
  }

  // --- 4. Reference resolution: load-with-blank, but report --------------
  var deptCode = (source.u_department_code || '').toString().trim();
  if (deptCode) {
    var dept = new GlideRecord('cmn_department');
    dept.addQuery('u_source_code', deptCode);
    dept.setLimit(1);
    dept.query();
    if (dept.next()) {
      target.department = dept.getUniqueValue();
    } else {
      // Not fatal: the worker is still usable, but routing may be wrong.
      logFeedIssue(empNo, 'warning', 'Unresolved department code: ' + deptCode);
    }
  }

  // --- 5. Manager is deliberately NOT set here --------------------------
  // Resolved in the second pass, once every worker in this run exists.

  // --- 6. Reject or proceed ---------------------------------------------
  if (errors.length > 0) {
    logFeedIssue(empNo || '(no id)', 'error', errors.join('; '));
    ignore = true; // skip this row; the run continues
    return;
  }

  function logFeedIssue(id, severity, message) {
    var iss = new GlideRecord('u_hris_feed_issue');
    iss.initialize();
    iss.setValue('import_set_row', source.getUniqueValue());
    iss.setValue('employee_number', id);
    iss.setValue('severity', severity);
    iss.setValue('message', message);
    iss.insert();
  }
})(source, target, map, log, action === 'update');
```

Four things in that script are the transferable lessons, independent of the specific fields.

**Collect errors rather than returning on the first one.** A row with three problems should report three, not one per nightly run for three nights.

**Distinguish reject from warn.** A missing employee number is fatal. An unresolvable department is not — the worker record is still better to have than not — but it must be reported, because it will cause misrouting.

**Write errors somewhere queryable.** Import set row status and the transform log tell you a row failed; a purpose-built issue table lets you report "every unmapped employment type this month," hand HR a list they can fix at source, and trend the error rate. This is the difference between an integration you operate and one you firefight.

**Never silently default.** `employment_type` defaulting to full time when the source value is unrecognized creates a worker who is eligible for benefits they should not be offered. Blank and reported beats wrong and quiet, every time.

### Run-level controls

Row validation is not enough. Add checks at the level of the whole run:

**Threshold abort.** If more than a few percent of rows error, something systemic happened — a column order change, a truncated file, an encoding change. Halt the run and alert rather than loading a partially corrupt population.

**Empty and short file detection.** A zero-byte or unexpectedly small file usually means the extract failed on the HRIS side. Do not process it; alert. A full feed that suddenly contains 200 rows instead of 12,000 must never be allowed to reconcile 11,800 people into inactive.

**Did-it-run-at-all monitoring.** The most dangerous integration failure is the one that stops running. Alert on the *absence* of a successful run, not only on failures.

**Reconciliation report.** After each run: rows received, inserted, updated, skipped, errored, plus counts by error type. Route it to a named owner. An integration nobody watches is an integration nobody knows is broken.

## Idempotency and reruns

Design so that running the same file twice is harmless. Coalescing on a stable key gets you most of the way: the second run updates records to the values they already hold. Take care with anything that is *not* an update — if your transform creates a case, a task, or a lifecycle event on insert, a rerun could create it twice. Guard those actions with an explicit existence check rather than relying on the run never being repeated. It will be repeated; that is how you will fix the first attempt.

## The payroll direction

Payroll integration differs from HRIS integration in direction and in scope, and the scope boundary matters.

**HRSD does not process payroll.** It does not calculate gross-to-net, it does not run pay cycles, and it does not hold payroll results. Payroll processing lives in the payroll system. What HRSD does is: raise, route, and track the *cases* that concern pay, and hand off the *events* that affect pay.

Two directions of traffic follow.

**Inbound, minimal.** Enough payroll context to work a case — pay group, pay frequency, pay cycle calendar. Enough to tell an employee "your correction will appear in the pay run on the 25th." Not the pay results themselves; pay detail belongs in the payroll system's own portal, and pulling it into ServiceNow imports both a large privacy liability and a synchronization problem you gain nothing from.

**Outbound, event-shaped.** When an HR process produces something payroll must act on — a new hire's start, a termination date, a leave of absence with a pay impact, a change to work location that affects tax jurisdiction — HRSD hands off a structured event. In a file-based world this is an outbound extract on the payroll cutoff schedule; in an API world it is a call. Either way, three properties are required:

- **A confirmed handoff.** Fire-and-forget on a payroll-affecting event is unacceptable. Record acknowledgement, and raise a task when it does not arrive.
- **Cutoff awareness.** Payroll has deadlines. An event submitted after cutoff lands in the next cycle, and the employee should be told that rather than discovering it.
- **An audit trail.** What was sent, when, by which case, and what came back. Pay disputes are investigated months later.

A useful outbound payload shape, kept deliberately thin:

```json
{
  "event_type": "leave_of_absence_start",
  "source_case": "HRC0010042",
  "employee_number": "10045892",
  "effective_date": "2026-03-03",
  "end_date": "2026-05-26",
  "pay_impact": "unpaid",
  "submitted_at": "2026-02-11T09:14:00Z",
  "submitted_by_system": "ServiceNow HRSD"
}
```

Note what is absent: no name, no medical reason, no free text. The payroll system needs the employee number, the dates, and the pay treatment. Everything else is sensitive data you would be transmitting for no operational benefit — the minimization principle from the previous lesson, applied to an interface.

## Practice

Work in a development instance. You will need a sample worker file; construct one of about fifty rows including deliberate defects.

1. **Write the ownership contract.** Produce a field-level table for the HR profile and user record with columns: field, owning system, update frequency, and what happens if someone edits it in ServiceNow. Then configure at least three imported fields as read-only on the form and confirm an HR agent cannot change them.

2. **Build the sample file.** Create a CSV with at least fifty worker rows. Include, deliberately: two rows with a blank employee number, three with an unmapped employment type code, two with an unparseable hire date, four whose department code does not exist, five whose manager appears later in the file than they do, and one duplicate employee number. Keep a key of what you planted.

3. **Load it raw.** Create the data source and import the file into a staging table without any transform. Inspect the staging rows and confirm your defects are present exactly as written, unmodified. Note the import set record and how you would find this run again in three months.

4. **Build the transform map.** Map the columns to the user and HR profile fields. Set coalesce on employee number. Write one paragraph explaining why not email, referencing what would happen in your test data if you had.

5. **Build the value translation table.** Create the mapping table for employment type and populate it for the valid codes only. Confirm the unmapped codes in your file produce reported errors rather than blanks or defaults.

6. **Write the onBefore validation script.** Implement validation covering identity, dates, enumerations, and references, adapting the worked example. It must collect multiple errors per row, distinguish reject from warn, and write to an issue table you create.

7. **Run and reconcile.** Transform the import set and produce a reconciliation summary: received, inserted, updated, skipped, errored, and a breakdown by error type. Compare it against the key from step 2. Every planted defect must appear; anything that did not is a gap in your validation — find it.

8. **Solve the manager problem.** Implement the second pass that resolves manager references, and prove it works on the five rows where the manager appeared later in the file. Show the before and after state for at least one of those records.

9. **Prove idempotency.** Run the same file a second time. Confirm no duplicate users were created and that update counts, not insert counts, moved. If anything was created twice, fix it and explain what was not idempotent.

10. **Handle a termination and a rehire.** Add a row that terminates an existing worker with a future date, and a row that returns a previously inactive worker. Confirm the first does not deactivate immediately and the second reactivates rather than duplicating. Describe how the offboarding lifecycle event would be triggered.

11. **Add run-level protection.** Implement a threshold abort and a short-file guard. Then feed the integration a truncated file of five rows and confirm it refused to process and alerted someone. Record what the alert said.

12. **Design the payroll handoff.** For one payroll-affecting HR process from your build, specify the outbound event: its trigger, its payload fields, how acknowledgement is confirmed, what happens when it is not acknowledged, and how cutoff timing is communicated to the employee. Justify every field you included by naming what payroll does with it, and name two fields you deliberately excluded.

## Check your understanding

1. Why coalesce on employee number and never on email?
2. Employee A's manager B appears later in the file. What goes wrong in a single-pass import, and what fixes it?
3. A full feed arrives with 200 rows instead of 12,000. What must your integration do?
4. An unmapped employment type arrives. Default it to full time, or report it?

*Answers:* (1) Employee numbers are stable and unique; email changes, may be missing, and can be reused, which merges two people into one record. (2) A's manager reference cannot resolve because B does not exist yet; use a second pass to set managers after all workers exist. (3) Refuse to process and alert; never reconcile the missing people to inactive. (4) Report it; a silent default can make someone eligible for benefits they should not have.
