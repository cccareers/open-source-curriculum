---
lesson_id: sn250-03
course_id: sn250
pathway: servicenow-implementation-specialist
title: Server-Side Scripting with GlideRecord
order: 3
kind: lesson
competency_ids:
  - D7-S1-C01
  - D7-S1-C04
objectives:
  - Query, create, and update records from server-side script using GlideRecord and GlideSystem
---

## The two APIs you will use every day

Server-side script on this platform is ordinary JavaScript plus a small set of platform objects. Two of them do most of the work.

**GlideRecord** is the database. Every table you can see in a list, you can query, insert, update, and delete with a GlideRecord object. It is the platform's object-relational layer, and learning it well is the single highest-leverage thing in this course.

**GlideSystem**, always available as the variable `gs`, is the instance itself: who is logged in, what time it is, what a system property says, where to write a log line, how to show the user a message.

Everything in this lesson runs on the server. Practise in Scripts - Background on a sub-production instance, and read the whole script before you click Run — an insert or delete in a background script happens immediately, to real data, with no confirmation and no undo.

## The shape of a query

Every GlideRecord query has the same four steps: name a table, add conditions, run the query, walk the results.

```javascript
var gr = new GlideRecord('incident');
gr.addQuery('active', true);
gr.addQuery('priority', '1');
gr.query();

while (gr.next()) {
  gs.info(gr.getValue('number') + ' — ' + gr.getValue('short_description'));
}
```

Line by line:

- `new GlideRecord('incident')` creates a record object bound to a table. Nothing has touched the database yet.
- `addQuery(field, value)` adds an AND condition. Add as many as you need; they combine with AND.
- `query()` sends the query to the database.
- `next()` advances to the next matching row and returns `false` when there are none left, which is what makes it work as a `while` condition.

Between `query()` and the first `next()`, the GlideRecord is positioned *before* the first row. That is why the loop reads `while (gr.next())` and not `do ... while`.

## Finding the right table and field name

`new GlideRecord('incident')` needs the table's **name**, not its label, and `getValue('short_description')` needs the field's **column name**, not the label on the form. `Assigned to` is `assigned_to`, `Configuration item` is `cmdb_ci`, and `Number` on one table is not necessarily the same column on another. Guessing wastes more time than looking.

Four reliable ways to look them up:

- **Hover over the field label on a form** and open the information popup, or right-click the label and choose to show the field's dictionary entry. It gives you the column name and the type.
- **The URL of a list** contains the table name: a list at `incident_list.do` is the `incident` table.
- **Show XML** on a record (from the context menu) dumps every column and its stored value. This is the fastest way to see what a reference field or a choice field *actually* contains, as opposed to what the form displays.
- **The dictionary itself** — `sys_dictionary` lists every field of every table, and `sys_db_object` lists the tables. Both are queryable from a script, which is how a generic utility discovers whether a column exists.

Table **hierarchy** matters as much as naming. `incident` extends `task`, so an incident record has every `task` column plus its own, and a query against `task` returns incidents, change requests, and everything else derived from it. Two consequences for scripting: a field you can see on the incident form may be defined on `task` and shared with every sibling table, and a script querying `task` must not assume every row is an incident. `gr.getRecordClassName()` tells you which table a row actually came from.

## Conditions

`addQuery` takes an operator as an optional middle argument:

```javascript
var gr = new GlideRecord('incident');
gr.addQuery('priority', '<=', '2');            // operator form
gr.addQuery('state', '!=', '7');
gr.addQuery('assignment_group', '!=', '');     // not empty
gr.addQuery('category', 'IN', 'network,hardware');
gr.addNotNullQuery('assigned_to');
gr.orderByDesc('sys_created_on');
gr.setLimit(50);
gr.query();
```

Useful operators are `=`, `!=`, `>`, `>=`, `<`, `<=`, `IN`, `NOT IN`, `STARTSWITH`, `ENDSWITH`, `CONTAINS`, and `DOES NOT CONTAIN`. `addNotNullQuery(field)` and `addNullQuery(field)` are clearer than comparing to an empty string. `orderBy(field)` and `orderByDesc(field)` sort. `setLimit(n)` caps the rows returned and should be on any query you are testing interactively.

OR conditions need a handle on the first condition:

```javascript
var gr = new GlideRecord('incident');
var qc = gr.addQuery('priority', '1');
qc.addOrCondition('priority', '2');
gr.addQuery('active', true);
gr.query();
```

That reads as `(priority = 1 OR priority = 2) AND active = true`. The AND conditions stay outside the OR group, which is almost always what you want.

For anything complicated, use an **encoded query**. Build the filter in a list view, right-click the breadcrumb, copy the query, and paste it:

```javascript
var gr = new GlideRecord('incident');
gr.addEncodedQuery('active=true^priority<=2^assignment_groupISNOTEMPTY');
gr.query();
```

`addEncodedQuery` is the fastest path from "I can see the right rows in a list" to "my script returns the right rows", and it is far less error-prone than translating a filter by hand. Its downside is readability: a fifteen-clause encoded string is opaque to the next person, so leave a comment saying in English what it selects.

## Reading field values

There are two ways to read a field and they are not equivalent.

```javascript
gs.info(gr.getValue('short_description')); // a string, or null when empty
gs.info(gr.short_description);             // a GlideElement object
```

`getValue()` returns a plain string — that is what you want in nearly every case, because a plain string compares, concatenates, and logs predictably. Direct field access returns a **GlideElement**, an object that happens to render as its value when concatenated into a string. GlideElements are why `if (gr.active)` is a bug: the object is always truthy, even when the field is false. Compare the value, not the element.

```javascript
if (gr.getValue('active') === 'true') { /* correct */ }
if (gr.active) { /* always true — wrong */ }
```

Two GlideElement methods are worth knowing, because `getValue` cannot do them:

- `gr.getDisplayValue('assigned_to')` returns what a user sees — the display name for a reference field, the label for a choice — where `getValue` returns the stored value (a sys_id, a choice key).
- `gr.assigned_to.getRefRecord()` returns a GlideRecord for the referenced record when you need several fields from it.

For a single field from a referenced record, **dot-walk** instead:

```javascript
gs.info(gr.getValue('number') + ' assigned to ' + gr.assigned_to.name +
        ' in ' + gr.assignment_group.manager.name);
```

Dot-walking issues a query behind the scenes, so it is cheap for one or two hops and expensive inside a long loop. Lesson 10 comes back to that.

Empty fields deserve one warning. `getValue` on an empty field returns `null`, not `''`, so `getValue('x').trim()` throws on an empty field. Guard first, or use `gr.getValue('x') || ''`.

## Fetching one record

When you know the sys_id, or when a single field identifies the record, skip the loop. `get()` queries and positions the record in one call, returning `true` on a hit.

```javascript
var gr = new GlideRecord('incident');
if (gr.get('9c573169c611228700193229fff72400')) {
  gs.info('Found ' + gr.getValue('number'));
} else {
  gs.info('No such incident');
}

var byNumber = new GlideRecord('incident');
if (byNumber.get('number', 'INC0010023')) {
  gs.info(byNumber.getValue('short_description'));
}
```

Always test the return value. A `get()` that missed leaves the record uninitialised, and the next line that reads a field will either throw or quietly give you nothing.

## sys_ids and reference fields

Every record on the platform has a **sys_id**: a 32-character hexadecimal string that is its identity, unique across the whole instance and never reused. `gr.getUniqueValue()` returns it, and `gr.getValue('sys_id')` returns the same thing.

A **reference field** stores a sys_id pointing at a row in another table. That is the whole mechanism, and it explains three things that otherwise seem inconsistent:

```javascript
gr.getValue('assigned_to');        // '62826bf03710200044e0bfc8bcbe5df1' — the stored sys_id
gr.getDisplayValue('assigned_to'); // 'Abel Tuter' — the referenced record's display field
gr.assigned_to.name;               // 'Abel Tuter' — dot-walked from the reference
```

- Comparing a reference field to a name never works: the stored value is a sys_id.
- Setting a reference field means setting a sys_id: `gr.setValue('assigned_to', userSysId)`.
- Filtering on a reference in a query means the sys_id too, unless you dot-walk the condition: `gr.addQuery('assigned_to.name', 'Abel Tuter')` is legal and does the join for you.

Hard-coding a sys_id in a script works and is occasionally the pragmatic choice, but it breaks the moment the script is moved to another instance where that record has a different id. Prefer looking the record up by a stable natural key — a group name, a user name, a property value — and cache the result if you need it more than once.

`getDisplayValue()` with no arguments returns the display value of the record you are on, which for most tables is its number or name. It is the right thing to put in a log line.

Two more useful record-level calls: `gr.isValidRecord()` tells you whether the object is actually positioned on a row — essential after a `get()` you did not check, and in any function that receives a GlideRecord from a caller — and `gr.isValidField('u_something')` tells you whether a field exists before you read it, which matters for a script that runs across a table hierarchy where not every child has the same columns.

## Creating records

```javascript
var task = new GlideRecord('incident');
task.initialize();
task.setValue('short_description', 'Printer offline on floor 3');
task.setValue('category', 'hardware');
task.setValue('urgency', '2');
task.setValue('caller_id', gs.getUserID());
var newId = task.insert();

if (newId) {
  gs.info('Created ' + task.getValue('number') + ' (' + newId + ')');
} else {
  gs.error('Insert failed — check mandatory fields and ACLs');
}
```

`initialize()` prepares a new empty record with field defaults applied. `insert()` writes it and returns the new sys_id, or `null` if the insert was refused. Use `setValue(field, value)` rather than assigning to the field directly: it is explicit, and it avoids the GlideElement confusion described above.

Two related calls: `newRecord()` is `initialize()` plus a generated sys_id, useful when you need the id before the insert; and inserting inside a loop over another query is a common and expensive pattern — build what you can, then insert once per iteration, never once per field.

## Updating records

```javascript
var gr = new GlideRecord('incident');
gr.addEncodedQuery('active=true^priority=1^assignment_groupISEMPTY');
gr.query();

while (gr.next()) {
  gr.setValue('assignment_group', '287ee6fea9fe198100ada7950d0b1b73');
  gr.setValue('work_notes', 'Auto-routed by triage script.');
  gr.update();
}
```

`update()` saves the current record and returns its sys_id. Called inside the loop, it updates every matching record one at a time — and every one of those saves runs the table's business rules, which is usually correct and occasionally catastrophic.

`updateMultiple()` updates every record matching the query in a single database operation:

```javascript
var gr = new GlideRecord('incident');
gr.addQuery('assignment_group', 'a1b2c3');
gr.setValue('assignment_group', 'd4e5f6');
gr.updateMultiple();
```

It is far faster and it does **not** run business rules on the affected records. That is exactly why it is dangerous: notifications will not fire, calculated fields will not recalculate, audit expectations will not be met. Reach for it only when you have decided, deliberately, that skipping that logic is correct.

`setWorkflow(false)` suppresses business rules and notifications on a normal `update()` or `insert()`. It exists for data-repair scripts and migrations. Using it to silence a business rule you find inconvenient is how instances end up with data that no rule has ever validated. If you use it, say why in a comment on the line above.

## Deleting records

```javascript
var gr = new GlideRecord('u_import_staging');
gr.addQuery('u_processed', true);
gr.addQuery('sys_created_on', '<', gs.daysAgo(30));
gr.query();
gs.info('About to delete ' + gr.getRowCount() + ' rows');
// gr.deleteMultiple();
```

Write the count first, run it, read the number, and only then uncomment the delete. `deleteRecord()` deletes the current row inside a loop; `deleteMultiple()` deletes everything the query matched without running business rules. There is no undo on either.

## Counting without looping

If all you need is a number or a group total, do not walk rows. **GlideAggregate** asks the database to do the arithmetic and returns one row per group.

```javascript
var ga = new GlideAggregate('incident');
ga.addQuery('active', true);
ga.addAggregate('COUNT', 'priority');
ga.groupBy('priority');
ga.query();

while (ga.next()) {
  gs.info('Priority ' + ga.getValue('priority') + ': ' + ga.getAggregate('COUNT', 'priority'));
}
```

A plain total is even shorter:

```javascript
var ga = new GlideAggregate('incident');
ga.addQuery('active', true);
ga.addAggregate('COUNT');
ga.query();
ga.next();
gs.info('Open incidents: ' + ga.getAggregate('COUNT'));
```

`COUNT`, `SUM`, `AVG`, `MIN`, and `MAX` are all available. The rule of thumb: if your loop body only increments a counter or adds to a total, you wanted GlideAggregate.

`getRowCount()` on a GlideRecord also gives you a count, but only after the query has fetched the rows, so it is not a substitute for aggregation on a large table.

## Journal fields, choices, and display values

A few field types do not behave like a plain string, and each has caught out someone on their first sweep script.

**Journal fields** — `work_notes`, `comments`, `additional_comments` — are append-only. Setting one adds an entry; it does not overwrite the history, and reading it with `getValue` does not give you what the form shows. To read the entries, query the journal itself:

```javascript
var journal = new GlideRecord('sys_journal_field');
journal.addQuery('element_id', gr.getUniqueValue());
journal.addQuery('element', 'work_notes');
journal.orderByDesc('sys_created_on');
journal.setLimit(5);
journal.query();
while (journal.next()) {
  gs.info(journal.getValue('sys_created_by') + ': ' + journal.getValue('value'));
}
```

Writing is the easy direction — `gr.setValue('work_notes', 'Routed automatically.')` followed by `update()` appends one entry. A script that writes a work note on every run of a nightly job produces a record with three hundred identical entries, which is a good reason to think about idempotence early.

**Choice fields** store a value and display a label. `getValue('state')` gives you `'6'`; `getDisplayValue('state')` gives you `'Resolved'`. Scripts compare the value; humans read the label. Writing `if (gr.getValue('state') === 'Resolved')` is a condition that can never be true, and it fails silently.

**`setDisplayValue()`** goes the other way: it accepts the label or display name and resolves it to the stored value. It is convenient and it is a query, so it belongs outside loops. For choice fields it is also fragile — labels get renamed, values do not.

Finally, **`setValue` versus direct assignment**. `gr.short_description = 'text'` works, because the GlideElement accepts the assignment. `gr.setValue('short_description', 'text')` is explicit, works with a field name held in a variable, and does not tempt anyone into treating the field as a plain property elsewhere in the script. Prefer it.

## GlideSystem

`gs` is the instance. The calls you will use constantly:

```javascript
gs.info('routine message');
gs.warn('something to look at');
gs.error('something broke: ' + e.message);

gs.getUserID();                 // sys_id of the current user
gs.getUserName();               // user_name of the current user
gs.getUser().getFullName();     // the user object
gs.hasRole('itil');             // role check — returns true for admin

gs.nowDateTime();               // current date/time as a display string (global scope only;
                                // in a scoped app use new GlideDateTime().getDisplayValue())
gs.daysAgo(7);                  // a date/time 7 days back, query-ready
gs.beginningOfLastMonth();      // one of a family of relative-date helpers

gs.getProperty('glide.servlet.uri');       // read a system property
gs.getProperty('x_acme.retry_limit', '3'); // with a default

gs.addInfoMessage('Saved and routed.');    // banner to the current user
gs.addErrorMessage('Could not route: no group.');
```

Three notes. Log through `gs.info` / `gs.warn` / `gs.error` rather than any ad-hoc mechanism, so your output lands in the system log where lesson 10 will teach you to find it. In a scoped application the logging calls are still `gs.info`, but the entries are tagged with your scope. And `gs.addInfoMessage` only makes sense when a user is on the other end of the transaction — in a scheduled job there is nobody to show it to.

For date arithmetic beyond the relative helpers, use **GlideDateTime**:

```javascript
var gdt = new GlideDateTime();          // now, in UTC
gdt.addDays(3);
gs.info(gdt.getDisplayValue());

var due = new GlideDateTime(gr.getValue('due_date'));
var created = new GlideDateTime(gr.getValue('sys_created_on'));
var diff = GlideDateTime.subtract(created, due);   // a GlideDuration
gs.info('Duration: ' + diff.getDisplayValue());
```

Store and compare date/time values in this object form. Comparing date strings lexically works only by accident of format and fails the moment a time zone gets involved.

## Scope, security, and what a script is allowed to do

Two things constrain a server script beyond its own logic.

**Application scope.** A script in a scoped application can only reach tables and APIs that their owning scope has made accessible. Cross-scope access is a decision the other application's developer records, not something your script can override. If a query returns nothing from a background script but the list shows rows, check scope before you check your conditions.

**Access control.** A plain GlideRecord runs with the rights of the running script, which in a business rule means the running user's rights are *not* automatically applied — server script generally bypasses ACLs. When you specifically want a query to respect the current user's read access — anything that will hand results back to a user, particularly through a web service — use **GlideRecordSecure**, which has the same API and enforces ACLs row by row.

```javascript
var gr = new GlideRecordSecure('incident');
gr.addQuery('active', true);
gr.query();
```

`gr.canRead()`, `canWrite()`, and `canDelete()` let you check rights on a normal GlideRecord without switching classes.

## Choosing the right call

Four shapes cover nearly every server-side data need, and picking the wrong one is the difference between a script that runs in 40 milliseconds and one that runs in 40 seconds.

| You need | Use |
| --- | --- |
| One record, identified by sys_id or a unique field | `get()`, and check the return |
| A set of records you will act on individually | `query()` and a `while (next())` loop, with `setLimit` |
| A count, a total, an average, or a per-group breakdown | `GlideAggregate` |
| The same blanket change on many records, and you are certain about skipping business rules | `updateMultiple()` |

Three anti-patterns to recognise in your own code, because you will write all of them:

**A query inside a loop.** If the body of your `while (gr.next())` constructs another GlideRecord, you have multiplied one query by the number of rows. Dot-walk instead, or look the values up once into an object and read from that.

**A loop that only counts.** `count++` in the body means GlideAggregate would have done the whole thing in one statement.

**Fetching rows to throw them away.** An `if` at the top of the loop that `continue`s past most of the rows is a condition that belonged in `addQuery`, where the database can apply it.

Lesson 10 returns to all three with measurements. For now, notice them.

## Worked example: an escalation sweep

This script finds open, high-priority incidents that have not been updated in three days, escalates them, records why, and prints a summary. It uses every idea in this lesson.

```javascript
(function escalateStaleIncidents(dryRun) {
  var STALE_DAYS = 3;
  var escalated = 0;
  var skipped = 0;
  var touched = [];

  var gr = new GlideRecord('incident');
  gr.addQuery('active', true);
  gr.addQuery('priority', '<=', '2');
  gr.addQuery('sys_updated_on', '<', gs.daysAgo(STALE_DAYS));
  gr.addNotNullQuery('assignment_group');
  gr.orderBy('sys_updated_on');
  gr.setLimit(200);
  gr.query();

  while (gr.next()) {
    var number = gr.getValue('number');
    var currentEscalation = parseInt(gr.getValue('escalation') || '0', 10);

    if (currentEscalation >= 2) {
      skipped++;
      continue;
    }

    if (!dryRun) {
      gr.setValue('escalation', String(currentEscalation + 1));
      gr.setValue('work_notes',
        'Escalated automatically: no update in ' + STALE_DAYS + ' days (as of ' +
        gs.nowDateTime() + ').');
      if (gr.update()) {
        escalated++;
        touched.push(number);
      } else {
        gs.error('Escalation update failed for ' + number);
      }
    } else {
      escalated++;
      touched.push(number);
    }
  }

  gs.info((dryRun ? '[DRY RUN] ' : '') + 'Escalated ' + escalated +
          ', skipped ' + skipped + ' already at max escalation.');
  if (touched.length) {
    gs.info('Records: ' + touched.join(', '));
  }
})(true);
```

Things to notice, because they are the habits worth copying. The whole thing is an immediately-invoked function, so no variable leaks into the shared background-script namespace. It takes a `dryRun` flag and defaults to `true`, so running it by accident does nothing. `setLimit` bounds the damage. `getValue('escalation') || '0'` survives an empty field, and `parseInt` with a radix survives the string. The `update()` return value is checked instead of assumed. And it logs a count *and* the record numbers, so the change is auditable after the fact.

## Practice

Use a sub-production instance and Scripts - Background. Start every write script as a dry run that only logs, then flip the flag once the log looks right.

1. **First query.** Print the number and short description of the ten most recently created active incidents, most recent first. Use `setLimit` and `orderByDesc`.

2. **Operators and OR.** Query incidents that are active AND (priority is 1 OR the category is `network`), created in the last 30 days. Print the row count. Then build the same filter in the incident list, copy the encoded query, and write a second version with `addEncodedQuery`. Confirm both return the same count.

3. **getValue versus dot-walk.** For one incident, print `getValue('assigned_to')`, `getDisplayValue('assigned_to')`, and `gr.assigned_to.email`. Write a comment explaining what each returned and when you would use it. Then demonstrate the `if (gr.active)` bug: find an inactive incident and show that the naive check reports it as active.

4. **Create.** Write a script that inserts three incidents with distinct short descriptions and a category you choose, checking the return of `insert()` each time and logging the generated numbers. Then find them again with a single query and print them.

5. **Update safely.** Write a script that finds the three incidents you just created and sets their `work_notes`. Run it first with the update line commented out and a `gs.info` in its place; confirm the log lists exactly the three records; then enable the update.

6. **Aggregate instead of loop.** Produce a count of active incidents grouped by `assignment_group`, printing the group display name and the count, ordered by count descending. Then write the same report with a `while (gr.next())` loop and a counter object, and note in a comment which one you would ship and why.

7. **Dates.** For every incident opened in the last seven days, compute the elapsed time between `opened_at` and now using GlideDateTime, and print the number in hours. Handle the case where `opened_at` is empty without throwing.

8. **References without hard-coding.** Write a script that assigns an incident to a group found by name rather than by a pasted sys_id, logging a warning and changing nothing if the group does not exist. Then show the difference between `getValue`, `getDisplayValue`, and a dot-walk on the field you just set.

9. **Journal and choice fields.** Add a work note to a record twice from a script and read back the last three journal entries from `sys_journal_field`. Then write a condition comparing `state` to `'Resolved'` as a string, show that it never matches, and fix it.

10. **Security.** Run the same query with `GlideRecord` and with `GlideRecordSecure` as a user without the `itil` role. Scripts - Background is admin-only, so you cannot simply impersonate and use it; instead build a short Automated Test Framework test with an *Impersonate* step followed by a *Run Server Side Script* step that logs both counts (or have a colleague with a non-admin test user run it through a Fix Script you share). Report the two row counts and explain the difference in one sentence.
