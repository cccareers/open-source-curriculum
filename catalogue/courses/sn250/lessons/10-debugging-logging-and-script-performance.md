---
lesson_id: sn250-10
course_id: sn250
pathway: servicenow-implementation-specialist
title: Debugging, Logging, and Script Performance
order: 10
kind: lesson
competency_ids:
  - D7-S1-C01
objectives:
  - Debug a failing script and reduce the cost of an expensive query
---

## Two skills that arrive late and matter most

You have written enough script now to have real failures — not syntax errors, but scripts that run, produce no error, and do the wrong thing. This lesson is about finding out why, and about the second problem that shows up once the code is correct: it works, and it is slow enough that someone has complained.

Neither is a matter of knowing more API. Both are method.

## Debugging as method

The instinct when something does not work is to change something and try again. That instinct is what turns a twenty-minute bug into an afternoon, because after six speculative edits you no longer know what the original behaviour was.

The method instead:

1. **Reproduce it deliberately.** Find the exact record, user, and action that fails. A bug you cannot reproduce on demand cannot be verified as fixed.
2. **State what you expect.** Out loud, or in a comment: "after this save, `assignment_group` should be Network Support." Vagueness here is the reason people debug the wrong thing.
3. **Find where expectation and reality diverge.** Not why — where. Halve the search space with each check.
4. **Only then, explain it.** If you cannot explain the failure, you have not found it, and the "fix" that made it go away will bring it back.
5. **Verify by reversing.** Undo the fix and watch the bug return, then reapply. That is the difference between fixing it and something else having changed.

Most platform bugs are one of a small set. Before reaching for a debugger, check these:

- **A GlideElement used as a boolean.** `if (gr.active)` is always true. Compare `gr.getValue('active') === 'true'`.
- **A `get()` whose return value was not checked.** The record is uninitialised and every field reads empty.
- **A string that should have been a number.** `'10' < '9'` is true, because they are strings.
- **A query returning nothing** because of scope, an ACL, or a condition on a field whose stored value is not what the display shows.
- **A business rule that did not run** because its condition was false — or one that ran twice because an after rule called `update()`.
- **An async listener reading a record that has changed** since the event or rule fired.

## Logging

`gs.info`, `gs.warn`, and `gs.error` write to the system log (`syslog`), which you read in the *All* log list or in your application's log for a scoped app. That is the backbone of server-side debugging, and it is worth using well.

**Tag every line.** A prefix makes a log searchable: `gs.info('[auto-close] examined ' + count)`. Without it you are scrolling.

**Log values, not milestones.** `gs.info('here')` tells you the line ran. `gs.info('[auto-close] state=' + state + ' resolvedAt=' + resolvedAt)` tells you why it did what it did next.

**Serialise objects.** Concatenating an object gives `[object Object]`. Use `JSON.stringify(obj)`.

**Choose the level honestly.** `error` for something that needs attention, `warn` for a recovered problem, `info` for routine narration. If everything is `error`, nothing is.

**Take the debug logging out.** Log lines left in a business rule run on every transaction on that table, forever. Keep the one line that reports the outcome; delete the six that traced the path there. A common compromise is to gate verbose logging behind a system property so it can be switched on when needed:

```javascript
if (gs.getProperty('x_acme.debug', 'false') === 'true') {
  gs.info('[routing] category=' + category + ' priority=' + priority + ' group=' + groupId);
}
```

On the client side the equivalents are the browser console — `console.log` in a client script, visible in developer tools — and `jslog()`, which writes to the platform's own JavaScript log. The browser's **network panel** is just as important: it is how you prove a form is making three synchronous server calls you did not intend.

## The tools

**Scripts - Background** remains the fastest probe on the platform. Any question of the form "what does this actually return?" is answered in thirty seconds by pasting the query in and logging the result. Use it to check assumptions before you debug logic built on them.

**The Script Debugger** is a real breakpoint debugger for server-side script. Open it, select a script, click a line to set a breakpoint, and trigger the code — the debugger pauses there and shows you the call stack, the local variables, and the value of `current` field by field. Step over, step into, and continue behave as you would expect. It is the correct tool the moment you would otherwise add a fourth log line, and it is dramatically faster than log-and-rerun for anything with branching. One limit to know before you rely on it: it pauses only scripts running synchronously in *your own* interactive session — a business rule triggered by your form save, for example. Async business rules, scheduled jobs, script actions, and other users' transactions run on background workers and will not stop at your breakpoints; for those, fall back to tagged log lines.

**Session debug** turns on annotated output for your session only. The ones you will use:

- *Debug Business Rule* — lists every rule that ran for a transaction, in order, with its When and its condition result. This answers "did my rule run?" definitively, and also "what else ran?", which is how you find the other rule that undid your work.
- *Debug Security Rules* — annotates ACL evaluation, showing which rule denied access. When a field is mysteriously read-only or a query returns nothing, this is the tool.
- *Debug Log* — shows log output inline at the bottom of the page as you work.
- *SQL debug* — shows the actual database queries a transaction issued, with timings. Verbose, occasionally invaluable, and the definitive answer to "how many queries did that loop make?".

Turn session debugging off when you are done. It is per-session, but a forgotten SQL debug makes every page you load slower and noisier.

**The transaction log** (`syslog_transaction`) records every transaction with its duration and its SQL time. Sorting it by response time on a sub-production instance after your change is the most honest performance check available: it measures what the user experienced, not what you hoped.

## Performance: where the cost is

Almost all script cost on this platform is database cost. The rules follow from that.

**Do not query inside a loop.** This is the single most expensive mistake, and it is easy to write without noticing:

```javascript
while (gr.next()) {
  var grp = new GlideRecord('sys_user_group');
  grp.get(gr.getValue('assignment_group'));   // one query per row
  gs.info(gr.getValue('number') + ' — ' + grp.getValue('name'));
}
```

A thousand rows means a thousand extra queries. Two fixes: **dot-walk** (`gr.assignment_group.name`) when you need one field, or **cache** the lookups in an object when you need several and the same values repeat. Caching turns a thousand queries into as many as there are distinct groups.

**Do not loop to count.** If the body of your loop only adds to a total, use GlideAggregate — the database does the arithmetic and returns one row.

**Ask for less.** `setLimit()` on anything that does not genuinely need every row. `addQuery` conditions that narrow at the database rather than an `if` inside the loop that discards rows the database already fetched.

**Watch your operators.** A `CONTAINS` query cannot use an index, because it has to look inside every value. `STARTSWITH` and `=` can. A query on an unindexed custom field over a large table is a table scan whatever the operator; if it is a query you will run often, the field needs an index, and that is a conversation with your platform owner rather than a script change.

**Dot-walking is a query.** Cheap once, expensive a thousand times, and expensive in a *chain* — `gr.assignment_group.manager.department.name` is three hops.

**Business rule cost multiplies.** A rule taking 50 milliseconds on a table with 20,000 updates a day is 17 minutes of instance time daily. Put the cheap test in the rule's **condition**, where the platform can skip the script, and move anything that can be late to async.

**Move work off the transaction.** Async business rules, scheduled jobs, and flows all cost the same amount of machine time but none of the user's. An outbound integration call in a before rule is the worst version of this: the user waits for a server you do not control.

**On the client, count round trips.** One synchronous call is a frozen form. Prefer a display rule and `g_scratchpad` at load time and asynchronous GlideAjax after it.

## Where the time actually goes

When a transaction is slow, the cost is in one of four places, and it is worth knowing which before you optimise anything:

**Database time** — the queries themselves. Shown separately in the transaction log, and usually the answer.

**Script time** — your loops and string building. Rarely dominant unless the loop is enormous or is doing work per row that should be done once.

**Business rules on the tables you touch** — every `update()` in your loop runs the full rule set for that record. A sweep over 500 records is 500 transactions' worth of rules. This is the cost people forget, and it is why a script that looks cheap can be very expensive.

**Waiting for something else** — an outbound integration call, most often. No amount of script tuning helps; the fix is to stop waiting, by moving the call off the transaction.

Optimise in that order of likelihood, and measure between each change. The most common wasted afternoon in platform work is micro-optimising a loop that was never the problem while a `CONTAINS` query on an unindexed field sits three lines above it.

## Measuring, not guessing

Time it. A crude timer in a background script is enough to settle most arguments:

```javascript
var start = new GlideDateTime();

// ...the code under test...

var end = new GlideDateTime();
gs.info('[perf] elapsed ms: ' + (end.getNumericValue() - start.getNumericValue()));
```

Run it three times and take the middle number; the first run of anything is slower. Then change one thing and run it again. Changing two things and measuring once tells you nothing about either.

For queries specifically, SQL debug tells you how many statements were issued, which is usually a more actionable number than the elapsed time — "412 queries" points straight at the loop.

## Worked example: 90 seconds to under two

A real shape of script: a report of active incidents with their assignment group name, the group's manager, and a count per group.

```javascript
// BEFORE — correct, and unusably slow
var rows = [];
var counts = {};

var gr = new GlideRecord('incident');
gr.addQuery('active', true);
gr.query();                                   // every active incident, all fields

while (gr.next()) {
  var groupId = gr.getValue('assignment_group');
  if (!groupId) {
    continue;                                 // fetched, then discarded
  }

  var grp = new GlideRecord('sys_user_group'); // query per row
  grp.get(groupId);

  var mgr = new GlideRecord('sys_user');       // second query per row
  mgr.get(grp.getValue('manager'));

  rows.push(gr.getValue('number') + ' | ' + grp.getValue('name') + ' | ' + mgr.getValue('name'));

  if (!counts[groupId]) { counts[groupId] = 0; }
  counts[groupId]++;                           // a loop that only counts
}
```

With 8,000 active incidents across 60 groups, that is one broad query plus roughly 16,000 lookups, and the count could have come from the database.

```javascript
// AFTER
var utils = { groups: {} };

// One cached lookup per distinct group, not per row.
function groupInfo(groupId) {
  if (utils.groups.hasOwnProperty(groupId)) {
    return utils.groups[groupId];
  }
  var grp = new GlideRecord('sys_user_group');
  var info = { name: '', manager: '' };
  if (grp.get(groupId)) {
    info.name = grp.getValue('name');
    info.manager = grp.manager.name.toString();   // one dot-walk, not a second query object
  }
  utils.groups[groupId] = info;
  return info;
}

// Counts come from the database.
var counts = {};
var ga = new GlideAggregate('incident');
ga.addQuery('active', true);
ga.addNotNullQuery('assignment_group');
ga.addAggregate('COUNT', 'assignment_group');
ga.groupBy('assignment_group');
ga.query();
while (ga.next()) {
  counts[ga.getValue('assignment_group')] = parseInt(ga.getAggregate('COUNT', 'assignment_group'), 10);
}

// Rows: narrowed at the database, bounded, and only the fields needed.
var rows = [];
var gr = new GlideRecord('incident');
gr.addQuery('active', true);
gr.addNotNullQuery('assignment_group');
gr.orderByDesc('sys_created_on');
gr.setLimit(500);
gr.query();

while (gr.next()) {
  var info = groupInfo(gr.getValue('assignment_group'));
  rows.push(gr.getValue('number') + ' | ' + info.name + ' | ' + info.manager);
}

gs.info('[report] ' + rows.length + ' rows, ' + Object.keys(counts).length + ' groups');
```

What changed, in order of impact: the counts moved to one aggregate query; the group and manager lookups became one cached query per *distinct* group, around 60 instead of 16,000; the empty-group rows are excluded by the database instead of fetched and skipped; and the row list is bounded. The logic is identical. The query count fell by three orders of magnitude, and that — not the wall-clock number, which depends on the instance — is the measurement that generalises.

## Practice

Work on a sub-production instance with enough data to make timings meaningful.

1. **Reproduce and isolate.** Take any script you wrote earlier in this course and break it deliberately in a way that produces no error — a `get()` whose result is unchecked, or a GlideElement used as a boolean. Hand it to a classmate, or come back to it after a break, and find the fault using only log lines. Write down which log line settled it.

2. **Debug the rule set.** Turn on *Debug Business Rule*, save an incident, and list every rule that ran, in order, with its When value. Identify one rule you did not know about and describe what it does.

3. **Debug security.** Impersonate a user without the `itil` role, open a record they cannot fully see, and use *Debug Security Rules* to name the exact ACL that denied a field. Write the ACL's name and condition in a comment.

4. **Breakpoints.** Use the Script Debugger on a business rule: set a breakpoint, trigger it with a form save, and inspect `current` and `previous` at the pause. Compare the experience to doing the same investigation with log lines and say which you would use for a branching script.

5. **Count the queries.** With SQL debug on, run the "before" script from the worked example against a table with a few hundred rows. Record the number of statements. Run the "after" version and record it again.

6. **Time it.** Using the GlideDateTime timer, measure both versions three times each and report the median. Then explain why the query count is the more reliable number to quote.

7. **Fix a loop.** Find or write a script that queries inside a loop, and rewrite it two ways — once with dot-walking, once with a cache. Measure all three and say when you would choose each.

8. **Aggregate.** Convert a counting loop of your own into GlideAggregate and confirm the totals match exactly.

9. **Client round trips.** Open a form with a client script you wrote in lesson 5, watch the network panel, and count the requests the form makes. Remove one round trip by moving a value to a display rule and `g_scratchpad`, and show the reduced count.

10. **Clean up.** Go back through every script you wrote in this course and remove the debug logging, keeping only outcome lines. Then add one system-property-gated verbose block where you think it will genuinely be needed at 2am.
