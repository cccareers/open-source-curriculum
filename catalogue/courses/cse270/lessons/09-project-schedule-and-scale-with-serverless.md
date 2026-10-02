---
lesson_id: cse270-09
course_id: cse270
pathway: cloud-support-engineer
title: 'Project: Schedule and Scale with Serverless'
order: 9
kind: project
competency_ids:
  - D4-S1-C04
objectives:
  - Trigger operational work from events and schedules using serverless functions
---

## The goal

Deploy a serverless function that runs operational work with no human involved, on both a schedule and a resource event, and show with numbers that it makes the account fit demand more cheaply than leaving things running.

Two triggers, one function, and a cost argument. The cost argument is not decoration — it is half the competency, and a deployment with no measurement behind it does not meet it.

Budget two hours. Expect the permissions to take longer than the code.

## What you build

**A scheduled cost-fitting job.** On a timetable, the function reduces capacity that nobody is using: stopping or scaling down non-production resources in the evening and restoring them in the morning. Two schedules — one down, one up — pointed at the same function with different configuration, or two functions sharing the same logic. Either is acceptable; say which you chose.

**An event-driven check.** A resource-change event triggers the function to evaluate the new or changed resource against the policy from your lesson 05 project and act on just that resource. Not a sweep of the whole account — the event names one thing, and the function handles that one thing.

Both must be idempotent, both must have a dry-run mode, and both must be observable from their logs alone.

## Choosing your target

Against the account you used in cse203, pick resources that are genuinely cheaper when idle and safe to stop. Workable choices: compute instances tagged for development, a non-production instance group or scale set whose minimum size can drop to zero overnight, a managed database instance with an evening stop, or an over-provisioned non-production capacity setting that can be reduced outside working hours.

The requirement is that the resource costs measurably less in its reduced state and that no one is harmed by it being reduced. If you cannot name what stops working while it is down, you have not understood the resource well enough to schedule it.

State your target, the reduced state, and the restored state in your README before you write code.

## Requirements

**R1 — Deployed as a serverless function.** Provider-managed, no server you patch. The runtime version is pinned in the deployment configuration. Dependencies, if any, are packaged with the function and pinned.

**R2 — The handler is thin.** The entry point unpacks the event, reads configuration from environment variables, and calls a plain function that takes ordinary arguments and returns a result. No cloud API call happens inside the handler itself.

**R3 — The logic is runnable locally against a fixture.** At least one captured real event payload is committed under a fixtures directory, along with a way to run the logic against it on your laptop. A reviewer must be able to exercise the decision logic without deploying anything.

**R4 — Two schedules, expressed in UTC.** A scale-down schedule and a restore schedule, both with the expression committed in your deployment configuration and both with a comment stating the local time they correspond to. Demonstrate at least one real firing of each.

**R5 — One resource-event trigger.** A provider event for a resource change invokes the function, which acts only on the resource identified in the event. Demonstrate it by creating or changing one resource and showing the invocation that followed, with the resource id visible in the log.

**R6 — All configuration comes from environment variables.** Target tag or selector, the reduced and restored states, the dry-run flag, and the log level. Nothing about the environment, account, or resource selection is hard-coded in the source.

**R7 — A dry-run mode that is the deployment default.** With `DRY_RUN` true, the function evaluates real resources, logs exactly what it would change with real ids, and changes nothing. The function must be deployable in this mode and left in it for an observation period. Show at least one dry-run invocation before your first real one.

**R8 — Idempotent under duplicate delivery.** Invoking the function twice with the same event, and running a schedule twice in a row, both leave the same end state and report zero changes on the second. Achieve it by reading current state, not by catching an error. Demonstrate both cases.

**R9 — A least-privilege identity.** The function has its own role or identity granted only the actions it uses. Commit the permission list with a one-line justification per action. A broad administrative role fails this requirement outright.

**R10 — No secrets in the package.** No key, token, or connection string in the source, the deployment package, the environment variables, or the logs. The function uses its own identity for cloud access; any genuine secret comes from the provider's secret store.

**R11 — Timeout and concurrency are set deliberately.** A timeout a little above the slowest observed run, not the platform maximum, with the observed duration recorded in the README. A concurrency ceiling if the function calls a rate-limited API. State the reasoning for both.

**R12 — Failures are visible and bounded.** A dead-letter destination is configured. Force a failure with a malformed event, observe the automatic retry, and show the exhausted event arriving at the dead-letter destination. A run that fails partway through logs what it completed and returns a non-success result.

**R13 — Logging is sufficient to reconstruct an unattended run.** Every invocation logs its request id, its parsed configuration including the dry-run state, one line per resource evaluated with the decision made, and a summary with counts. Demonstrate that you can take one invocation from a week's logs and say exactly what it did.

**R14 — Time-remaining awareness.** If the function iterates over resources, it checks the context's remaining time and returns a partial result cleanly rather than being killed mid-operation. Show the code path even if you cannot make it fire.

**R15 — A cost comparison with real numbers.** A short section in the README containing: the resource's cost per hour in its full state; the hours per week the schedule keeps it reduced; the resulting weekly saving; the function's own invocation cost over the same period; and the net. Use your provider's published rates or your own billing data, cite which, and show the arithmetic. Then one paragraph comparing this approach against a reactive autoscaling policy on the same resource, saying what each fits and which one you would keep.

**R16 — A one-page README.** The target and its two states; the two schedules with local-time equivalents; the event trigger; every environment variable by name and purpose; the permission list; how to run the logic locally; how to disable the automation in a hurry; and the cost section from R15.

## Constraints

- **Non-production resources only,** and every action reversible in under a minute by hand. Nothing is deleted.
- **No pipeline deployment.** Deploy from your console or CLI. Automating this deployment is the capstone's problem.
- **No new policy.** Reuse the check from your lesson 05 project for the event-driven path. Inventing a second policy wastes time you need for permissions and cost work.
- **No infrastructure-as-code estate.** You may use your provider's function deployment tooling; you are not provisioning an environment.
- **No monitoring or alerting product.** Logs and the platform's own invocation records are the observability surface here. Dashboards and alert routing belong to a later course.
- **No always-on compensation.** No provisioned concurrency floor, no warming ping, no scheduled keep-alive. If cold starts bother you on a nightly job, that is a signal to re-read the trade-off, not to pay for it.
- **No public HTTP endpoint** unless your event trigger genuinely requires one, and then it must be authenticated.
- **Free tier or existing allocation.** Function invocations at this volume cost close to nothing; if you are approaching a limit, your schedule is firing far too often.

## Definition of done

- The function is deployed, and its runtime version, timeout, memory, and environment variables are visible in its configuration.
- The scale-down schedule has fired for real and its invocation log shows the resources it reduced.
- The restore schedule has fired for real and the resources came back to the stated state.
- A resource change produced an event-triggered invocation whose log names that resource id.
- A committed fixture plus a local run reproduces the decision logic without deploying.
- A dry-run invocation exists showing real ids and zero changes.
- A duplicate invocation and a repeated schedule both report zero changes on the second run.
- The function's identity grants only the actions in your committed list, and the function works with exactly those.
- No credential appears in the source, package, environment, or logs.
- The timeout is justified against an observed duration recorded in the README.
- A malformed event was retried and then landed in the dead-letter destination.
- One invocation chosen at random from the logs can be fully explained from its log lines alone.
- The README contains the cost arithmetic with a cited rate source and the autoscaling comparison paragraph.
- The README states how to disable the automation immediately.

## How you will be assessed

The competency is applying autoscaling and serverless to fit demand and cost, and it is marked in two halves.

The first half is that the automation works unattended. A reviewer will look at the invocation history rather than at a demo: did the schedule actually fire on its own, did the event trigger actually fire from a real resource change, does the log of a single invocation tell the whole story, and does a second invocation change nothing. Anything that required you to click "test" to demonstrate has not shown the property being assessed.

The second half is the cost reasoning. A reviewer will check whether your arithmetic uses real rates, whether the saving is net of the function's own cost, and — most importantly — whether your comparison against a reactive autoscaling policy is about *this* workload rather than a general recital. Saying that a scheduled scale-down suits a development fleet because utilisation cannot predict that the team went home is the reasoning being looked for. Saying that serverless is cheaper is not.

Expect one review question your README does not answer, such as what happens if the restore schedule fails and nobody notices until Monday, or how somebody on call would turn this off at two in the morning.

## Hints

**Log the raw event first, deploy the real logic second.** Ten minutes spent capturing a real payload saves an hour of guessing at field names, and it gives you R3's fixture for free.

**Permissions will be your longest debugging session.** Read the denial message; it names the action. Add that one action and try again. Widening the role to make the error go away is the failure mode this requirement exists to catch.

**Deploy with `DRY_RUN` true and leave it there for a day.** You get real evidence about which resources your selector matches before anything stops. This is also the honest answer to "how do I know it will not stop the wrong thing".

**Cron is in UTC, your evening is not.** Write the local time in a comment next to every expression, and remember that a fixed UTC schedule shifts by an hour relative to local time when daylight saving changes.

**Restore is the schedule that matters.** A scale-down that fails costs money; a restore that fails costs a morning. Test the restore path first and make sure it works from the fully-reduced state.

**The stop and start are not symmetric.** Stopping is usually instant; starting takes time and can fail on capacity. Give the restore schedule enough lead time before people arrive, and make it log the failure loudly.

**Check state before acting, always.** An instance already stopped, a group already at its minimum — both should log "nothing to do" and count as zero. That is R8, and it is also what makes a retry harmless.

**Get the cost numbers before you build.** If the resource costs a trivial amount per hour, you have picked the wrong target and R15 will be an embarrassing paragraph. Check the rate card first.

**Test the malformed event early.** Configuring a dead-letter destination after you already have a poison event retrying is more annoying than doing it up front.

## What to hand in

1. The repository URL with the function source, the fixture, the deployment configuration, the permission list, and the README.
2. Invocation logs for one scale-down firing and one restore firing, both from the schedule rather than a manual test.
3. The invocation log for the event-triggered run, with the resource id visible, and a note on what you changed to cause it.
4. A dry-run log, and the pair of logs showing a duplicate invocation reporting zero changes.
5. The dead-letter evidence for the malformed event, including the retry attempts.
6. The cost section, with your arithmetic and the rate source you used.
