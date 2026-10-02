---
lesson_id: sn250-09
course_id: sn250
pathway: servicenow-implementation-specialist
title: Scheduled Jobs and Event-Driven Automation
order: 9
kind: lesson
competency_ids:
  - D7-S1-C03
objectives:
  - Schedule recurring work and trigger script logic from platform events
---

## Work with nobody watching

Every script you have written so far had a trigger you could point at: a user saved a form, a browser loaded a record, a system called an endpoint. This lesson is about the other half of the platform's automation — work that runs because the clock said so, or because something happened that other code chose to announce.

Two mechanisms, and they answer different questions.

A **scheduled job** answers *"what needs doing periodically?"* — the nightly close of stale records, the weekly report data, the hourly reconciliation. It is a pull: nothing tells the job anything, the job goes and looks.

An **event** answers *"something just happened — who cares?"* One piece of code announces a fact, and any number of independent listeners react to it. It is a push, and the announcer does not know or care who is listening.

Both are the platform's answer to work that must not sit inside a user's transaction, and choosing between them, and between them and the tools you already know, is the judgement in this lesson.

## Scheduled Script Execution

The record type is **Scheduled Script Execution**, on `sysauto_script`. Its fields:

- **Name** — say what it does. `Nightly incident auto-close`, not `Script 3`.
- **Active** — the off switch. Every job you write should be safe to switch off.
- **Run** — `Daily`, `Weekly`, `Monthly`, `Periodically`, `Once`, or `On Demand`.
- **Time** / **Repeat Interval** — when, or how often for a periodic job.
- **Run as** — the user the script runs as. Default is a system account; set it deliberately, because the job's rights and its log attribution both follow it.
- **Conditional** and **Condition** — a script expression that must be truthy for the job to run this time.
- **Run this script** — the code.

`On Demand` deserves a mention: it never runs by itself and gives you an **Execute Now** button. That makes it the right setting while you are building — you get a repeatable run without waiting for midnight, and no chance of a half-finished job firing overnight. Switch it to `Daily` when it is correct.

The wider family lives on `sysauto`: scheduled reports, scheduled data imports, and others. They share the scheduling engine and the same "runs without a user" character. Scripted jobs are this lesson's subject.

## Writing a job that will not hurt you

A scheduled job runs unattended, on production, possibly for years, on more data than you tested with. That imposes five disciplines.

**1. Keep the job thin.** The job record should be a handful of lines calling a script include. Logic in a script include can be run from a background script, called from a flow, and tested with the Automated Test Framework. Logic in a job record can only be tested by running the job.

```javascript
try {
  var result = new AcmeIncidentUtils(7).autoCloseResolved(500);
  gs.info('[nightly-auto-close] closed ' + result.length + ' incidents: ' + result.join(', '));
} catch (e) {
  gs.error('[nightly-auto-close] failed: ' + e.message);
}
```

**2. Bound the work.** `setLimit()` on the query, a cap on the loop, or both. An unbounded job that has been quietly failing for a month meets thirty days of backlog on the night it starts working, and processes all of it at once.

**3. Be idempotent.** Running the job twice should not double anything. The auto-close job above is naturally idempotent — a closed record no longer matches the query. A job that adds a work note every run is not, and a job that increments a counter is actively dangerous. Where the work is not naturally idempotent, mark what you have processed and exclude it in the query.

**4. Log a count, with a tag.** Every run should leave one line saying what it did, prefixed with something greppable. A silent job is indistinguishable from a job that is not running, and you will not notice the difference until someone asks why nothing has been closed since March.

**5. Handle your own errors.** An uncaught exception ends the run wherever it got to, potentially half-done. Catch, log with context, and decide deliberately whether to continue to the next record or stop.

Two more practical points. **Batch large data sets** rather than holding a single query open across a hundred thousand rows — process a bounded slice per run, and let the schedule catch up. And **mind the schedule itself**: jobs stacked at midnight all contend for the same worker threads, and a job whose run takes longer than its interval will overlap with itself. For a periodic job that might, set a flag in a system property at the start and clear it at the end, and skip the run if the flag is already set.

### Time zones

A scheduled job's time is interpreted in the job's own time zone setting, which may not be the instance default and is almost certainly not the user's. Meanwhile `new GlideDateTime()` is UTC internally, `gs.nowDateTime()` renders in the session's time zone, and `gs.daysAgo(n)` produces a value suitable for a query.

The rule that avoids the entire class of bug: **do the arithmetic in GlideDateTime, and only convert to a display string when you are logging it.** A "yesterday" computed by slicing a formatted date string will be wrong twice a year and wrong permanently for someone in another region.

### Knowing whether a job is running

An unattended job that silently stops is the failure mode of this whole category, and it is invisible by design. Three habits make it visible.

**Check the schedule record.** Every scheduled job has a *Next action* value showing when it will next run. A date in the past means the job is stuck or the scheduler is behind; an empty one on an active job means it will never run again.

**Read your own log.** If your job logs one tagged line per run, a filtered search of the system log for that tag is a run history. No line yesterday means no run yesterday.

**Record the outcome somewhere durable when it matters.** For a job whose failure has consequences — a nightly reconciliation, a billing sweep — write a row to a small custom table with the run time and the counts, and report on it. Logs are rotated; a table is not, and a gap in it is obvious at a glance.

The related question is what to do about a job that fails halfway. Decide, deliberately, between *stop on first error* (right when the records are related and a partial run leaves an inconsistent state) and *log and continue* (right when the records are independent and one bad row should not block 249 good ones). The second is more common, and it only works if the error count is in the summary line.

## Events

An event is a named announcement, recorded in the event queue and processed shortly after by a background worker.

The point of events is **decoupling**. When a business rule announces `x_acme.incident.escalated`, it does not know whether one notification, three script actions, and nothing else are listening. Adding a fourth listener later requires no change to the announcer. That is the property that makes events worth the indirection.

### Registering and firing

Register the event first, on `sysevent_register`: a name, the table it relates to, and a description of what `parm1` and `parm2` carry. Registration is what makes the event selectable when configuring a notification, and the description is the only documentation the next person gets.

Use a namespaced, dotted name: `x_acme.incident.escalated`, not `escalated`.

Fire it with `gs.eventQueue`:

```javascript
gs.eventQueue('x_acme.incident.escalated',   // event name
              current,                        // the GlideRecord it concerns
              current.getValue('assigned_to'),// parm1
              current.getValue('number'));    // parm2
```

The arguments are fixed: name, GlideRecord, `parm1`, `parm2`. Both parameters are **strings** — pass a sys_id or a short value, never an object. If you need more than two, pass a sys_id and let the listener query for the rest, or serialise a small JSON string into `parm1` and parse it on the other side, documenting that in the registration.

There is also `gs.eventQueueScheduled(name, record, parm1, parm2, when)`, which queues the event for a future time — a reminder mechanism that needs no scheduled job scanning for things to remind about.

Firing an event is cheap: it inserts a row and returns. The listeners run afterwards, on a background worker, so nothing about a listener's cost lands on the user's transaction.

### Listening: script actions

A **script action** (`sysevent_script_action`) is server-side script bound to an event name. Inside it you get two objects: `event`, the queued event row, and `current`, the GlideRecord the event was fired about.

```javascript
(function runAction(current, event) {

  var assignedTo = event.parm1.toString();
  var number = event.parm2.toString();

  if (!assignedTo) {
    gs.warn('[escalation-action] ' + number + ' escalated with no assignee');
    return;
  }

  var note = new GlideRecord('u_escalation_log');
  note.initialize();
  note.setValue('u_incident', current.getUniqueValue());
  note.setValue('u_assigned_to', assignedTo);
  note.setValue('u_escalated_at', new GlideDateTime());
  note.insert();

})(current, event);
```

Rules for script actions, all learned the hard way:

- **Never assume the record still looks the way it did when the event fired.** Time has passed. Re-read what matters.
- **`current` can be missing** if the record was deleted between the fire and the run. Check `current.isValidRecord()` before using it.
- **Keep them short and delegate** to a script include, for the same testability reason as scheduled jobs.
- **One action per concern.** Three small actions on one event are easier to switch off individually than one action doing three things.

### Listening: notifications

The other listener type needs no code. A notification record can be triggered by an event rather than by a record condition, and it can use `event.parm1` and `event.parm2` in its recipient and message configuration. This is the common case: your rule fires an event, and someone in the service management team configures who gets told, without touching your script.

That division — script announces, configuration decides who cares — is the reason to fire an event instead of sending a notification directly from your script.

### Watching the queue

Events land on `sysevent` with a **state**: `ready`, then `processed`, or `error`. When "the event did not do anything", check in this order:

1. Is there a row in `sysevent` at all? No row means the announcer never ran — go back to your rule's condition.
2. Is the row `processed`? Processed with no effect means the listener ran and did nothing — check the script action's own condition and log.
3. Is the row still `ready`, minutes later? Event processing is backed up, or paused.
4. Is it `error`? The reason is on the record.

That sequence turns a vague failure into a specific one in under a minute, and it is the single most useful thing to know about events.

## Choosing the mechanism

You now have five ways to run work outside a user's immediate transaction. The distinctions:

| Use | When |
| --- | --- |
| **Async business rule** | One known reaction to a record write, always the same, owned by you |
| **Event + script action** | A record write that several independent things might react to, now or later |
| **Event + notification** | Someone needs telling, and who gets told is a configuration decision |
| **Scheduled job** | Nothing announces the work — it is found by looking, on a cadence |
| **Flow (scheduled or record trigger)** | The work is a multi-step process, or needs approvals and waits |

Two anti-patterns worth naming. A scheduled job that polls a table every five minutes looking for records in a state, when a business rule could have announced the change the moment it happened, is a push requirement implemented as a pull — it burns capacity and adds latency. And an event with exactly one listener that will only ever have one listener is indirection with no payoff; an async business rule says the same thing more directly. Use events for the *many possible listeners* case, which is genuinely common, not as a reflex.

## Worked example: a reminder and a sweep

The requirement: *when a change request is approved, remind the assigned engineer 24 hours before the planned start. Separately, every night, close changes that have been in Review for more than seven days and report how many.*

Two different mechanisms, on purpose.

**The reminder is event-driven.** A business rule on `change_request`, condition `state changes to Scheduled`, fires a scheduled event:

```javascript
var startAt = new GlideDateTime(current.getValue('start_date'));
startAt.addSeconds(-86400);

if (startAt.after(new GlideDateTime())) {
  gs.eventQueueScheduled('x_acme.change.starting_soon',
                         current,
                         current.getValue('assigned_to'),
                         current.getValue('number'),
                         startAt);
}
```

An event-triggered notification handles the email. No script action is needed, no scheduled job scans for upcoming changes, and if someone later wants a second listener — a chat message, an entry in a readiness dashboard — they add it without touching this rule. Note the guard: a start date already in the past would otherwise queue an event for a moment that has gone.

**The sweep is scheduled**, because nothing announces "this record has now been sitting still for seven days". A `Daily` job at 02:00, running a script include:

```javascript
try {
  var summary = new AcmeChangeUtils().closeStaleReviews(7, 250);
  gs.info('[nightly-change-sweep] closed ' + summary.closed +
          ', skipped ' + summary.skipped + ', errors ' + summary.errors);
} catch (e) {
  gs.error('[nightly-change-sweep] aborted: ' + e.message);
}
```

The include does the work, bounds itself to 250 records, catches per-record errors so one bad record does not end the run, and returns counts rather than logging them itself. The job logs one tagged line. Both are idempotent: a closed change no longer matches, and a queued reminder for a change that gets rescheduled is handled by the listener re-checking the start date before it acts.

## Practice

Work on a sub-production instance. Build every job as `On Demand` first.

1. **A first job.** Create an `On Demand` scheduled script execution that logs, with a tagged prefix, the count of active incidents by priority using GlideAggregate. Run it with **Execute Now** and find your line in the system log.

2. **Thin the job.** Move that logic into a script include with a method returning an object of counts, and reduce the job to a call, a log line, and error handling. Verify by calling the include from a background script.

3. **Bound and dry-run.** Write a job that closes incidents resolved more than seven days ago. Give the include a `dryRun` parameter defaulting to true and a `limit` parameter, and run it three times: dry run with limit 5, dry run with limit 500, then live with limit 5. Record what each printed.

4. **Idempotence.** Run your live job twice in a row and prove nothing was double-processed. Then deliberately write a non-idempotent variant that appends a work note every run, run it three times, and describe the result in a comment.

5. **Schedule and time zone.** Change the job to `Daily` at a time a few minutes away and confirm it runs. Then set the job's time zone to something several hours from yours and predict, before checking, when the next run will be.

6. **Register and fire.** Register an event `x_acme.incident.escalated` with a description of both parameters. Fire it from a business rule when the escalation field increases, passing the assignee sys_id and the incident number. Confirm the row appears on `sysevent`.

7. **Script action.** Write a script action on that event that logs the number, the assignee's name, and the age of the incident in hours. Include a `current.isValidRecord()` guard. Test it, then delete the incident before the event is processed and confirm your guard holds.

8. **Notification listener.** Add an event-triggered notification on the same event that emails the assignee, using `event.parm2` in the subject. Confirm both listeners fire from one announcement, and write one sentence on why that is the argument for events over a direct notification call.

9. **Scheduled event.** Use `gs.eventQueueScheduled` to queue an event two minutes in the future from a background script. Watch the `sysevent` row change state, and note what it looked like at each stage.

10. **Choose.** For each requirement, pick async business rule, event plus script action, event plus notification, scheduled job, or flow, and justify it in one sentence: emailing an approver when a request is submitted; deleting import staging rows older than 30 days; recalculating a rollup after every child update; telling four different subsystems that a major incident has been declared; reminding someone about a task due tomorrow; escalating anything untouched for 72 hours.
