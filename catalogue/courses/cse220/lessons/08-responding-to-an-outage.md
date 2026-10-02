---
lesson_id: cse220-08
course_id: cse220
pathway: cloud-support-engineer
title: Responding to an Outage
order: 8
kind: lesson
competency_ids:
  - D5-S1-C01
  - D6-S1-C02
objectives:
  - Act correctly in the first thirty minutes of a service outage
---

## Why the first thirty minutes are a separate skill

You already know how to isolate a fault. Lesson 07 taught it and the method holds. What changes during an outage is everything around the method: a clock is running, customers are affected, several people are working at once, someone senior is asking for updates, and the natural human response to all of that is to go quiet and start typing.

Going quiet is the single most expensive thing you can do. An incident that is well handled and badly communicated is experienced by everyone outside the response as an incident that is not being handled at all, and that perception generates more interruptions, more escalations, and more people piling in — which slows the actual work further. The loop is real, it is common, and it is preventable.

So this lesson is about the wrapper: declaring, organizing, mitigating, and communicating. The technical work inside is what you already have.

![The phases of an outage from detection through mitigation to resolution and postmortem, with who is doing what in each phase](./img/incident-timeline.png)

## Declare early, and make it cheap

The most common failure in incident response is not declaring. It happens because declaring feels like an admission, or because the responder believes they are two minutes from fixing it — a belief that is very often wrong and always feels true.

Fix this by making declaration cheap. A declaration is not a claim that the situation is catastrophic; it is a statement that a coordinated response has started, and it should cost one message in one channel. If it turns out to be nothing, you close it in ten minutes and nobody minds. A team that treats declaring as embarrassing will systematically declare too late, every time.

Declare when any of these is true: a customer-visible symptom alert has fired and is not clearing; more than one person is working the same problem; you have been investigating alone for more than about ten minutes without a clear cause; a customer has reported an outage you cannot immediately explain; or you are considering an action you would not take on a normal day.

Say it plainly, with the facts you have:

```text
Declaring an incident. Storefront checkout, production.
Symptom: checkout error ratio 22%, started 14:05, ongoing.
Impact: roughly 1 in 4 customers cannot complete a purchase.
Severity: SEV2 (proposed).
I am incident commander. Investigating now, next update 14:25.
```

Five facts and a commitment. That message costs thirty seconds and it is the difference between a coordinated response and six people independently deciding what to do.

## Severity, in plain language

Severity drives who gets involved, how often you communicate, and how much risk you may take to mitigate. Definitions vary by employer; the shape does not. A workable set:

**SEV1 — critical.** The service is unavailable, or a core function is unusable, for most customers. Data is at risk of loss or exposure. Response is immediate and around the clock, senior leadership is informed, updates go out every 15 to 30 minutes.

**SEV2 — major.** A significant function is degraded or unavailable for a meaningful subset of customers. Response is immediate during any hours; updates every 30 to 60 minutes.

**SEV3 — minor.** Degraded performance or a non-core function affected, with a workaround. Business-hours response, updates as things change.

Two rules. **Start high and downgrade.** It is easy to stand people down and hard to summon them late; if you are between two levels, take the higher one and revise in ten minutes. And **severity is about customer impact, not technical drama.** A database failover that nobody noticed is not SEV1. A single misconfigured feature flag that logs out every customer is.

Say the severity out loud in the declaration, and say it again when it changes, because everyone downstream is pacing themselves against it.

## Roles, even in a small team

Roles are about attention, not headcount. One person can hold several, but they must know which they are holding, because the failure they prevent is the one where everyone investigates and nobody talks.

**Incident commander.** Owns the response, not the fix. Decides severity, assigns work, decides what to try, decides when to escalate, and decides when it is over. The commander should be deliberately *less* hands-on than instinct suggests — the moment the commander is deep in a query, nobody is running the incident. This is the hardest habit to build and the most valuable.

**Operations lead.** Does the technical work. Runs the investigation from lesson 07, proposes and applies mitigations, and reports findings up to the commander rather than to the room at large.

**Communications lead.** Owns everything leaving the response: status page, customer-facing updates, internal stakeholder updates, and answering "any news?" so that nobody else has to. In a two-person response this is the commander's second hat, and it must not be the operations lead's.

**Scribe.** Keeps the timeline: every observation, action, and decision, with a timestamp. Feels clerical, and it is the highest-value low-skill role in the incident, because nobody can reconstruct this afterwards from memory and lesson 09's write-up depends entirely on it.

Say who holds what, out loud, in the channel. "I am incident commander, Priya is ops lead, I am also handling comms." When you hand a role over, announce the handover explicitly and confirm the other person accepted it. The commonest coordination failure is a role everyone assumed someone else had.

## Mitigate first, diagnose second

This is the inversion that makes incident response different from troubleshooting, and it is worth stating bluntly: **during an outage, your goal is to stop customer impact, not to understand the problem.** Understanding is tomorrow's job and it is genuinely important — but a correct diagnosis delivered forty minutes after a rollback would have restored service is a bad outcome.

So the first question, once you have a symptom, is not "why?" It is: **what would make this stop, and is it reversible?**

The standard mitigations, roughly in order of how often they work:

**Roll back the recent change.** If a deployment or configuration change preceded the symptom, undo it. You do not need to know which line caused it. Rollback is the highest-value mitigation in existence because it is fast, reversible, and it addresses the most common cause. If your first thought is "but the change probably isn't related," check the timing again.

**Shift traffic away.** Remove the bad instance, drain the affected zone, fail over to the secondary region, route around the broken component.

**Turn the feature off.** A flag that disables the failing path restores everything else.

**Shed load.** Rate-limit, disable the expensive endpoint, turn off the batch job that is competing for the database. Serving 80 percent of customers well is better than serving 100 percent badly.

**Add capacity.** Sometimes right, often a way to buy twenty minutes. It rarely fixes anything and it can make things worse by adding more clients to a saturated dependency, so say out loud that it is a stopgap.

**Restart.** Frequently effective, always evidence-destroying. Before you restart, capture what you will want later: current metrics, recent logs, process state, connection counts, a heap or thread dump if the situation warrants it. Then restart. Do not skip the capture because you are in a hurry — the whole outage will have been for nothing if it recurs next week and you still cannot say why.

Every mitigation has a rule attached: **one change at a time, announced before you make it, with the expected effect stated, and recorded by the scribe.** "I am rolling back to v2.14.0 now. If this is the cause, error ratio should drop within three minutes." Then watch. If it does not do what you predicted, revert it before trying the next thing, or within twenty minutes you will have a production configuration nobody can describe.

And know when to escalate rather than continue. Escalate immediately if the impact is growing rather than shrinking, if you have exhausted the runbook without a hypothesis, if the fix requires access or authority you do not have, if the affected component belongs to another team, or if you are simply out of ideas twenty minutes in. Escalating is not failure — it is the correct use of a larger organization, and the escalation itself has a form and a content that lesson 09 covers in detail. What matters during the outage is the trigger and the speed: decide the criteria in advance, and when one is met, escalate without negotiating with yourself about it.

## Communicating while it is happening

You are communicating with at least three audiences, and they need genuinely different things. Writing one message and sending it to all three fails all three.

**Customers and the public status page.** They need to know that you know, what it affects them doing, whether there is a workaround, and when you will next speak. They do not need causes, component names, or blame. Plain language, no jargon, no speculation.

```text
14:12 — Investigating: some customers are unable to complete checkout.
Browsing and account access are unaffected. We are investigating and
will provide an update by 14:45.

14:38 — Identified: we have identified the cause and are applying a fix.
Checkout is currently failing for a portion of customers. Next update by 15:10.

15:05 — Monitoring: a fix has been applied and checkout is completing
normally. We are monitoring to confirm. Next update by 15:35.

15:35 — Resolved: checkout has been operating normally since 14:58.
Affected orders between 14:05 and 14:58 were not charged. We are
sorry for the disruption.
```

Four states, used consistently: investigating, identified, monitoring, resolved. Say what is *not* affected — it is genuinely reassuring and it reduces the volume of unrelated reports. Give a next-update time and meet it even if the update is "no change, still working, next update at X." A missed update time does more damage than bad news.

**Internal stakeholders** — support managers, account teams, the people fielding customer contacts. They need slightly more: scope, numbers, whether there is a workaround they can offer, and what to tell customers who ask. Give them the customer-facing wording explicitly so that ten people are not improvising ten different explanations.

```text
Internal update 14:38 — Storefront checkout, SEV2.
Impact: ~22% of checkout attempts failing since 14:05. Browsing, accounts,
and order history unaffected. No orders have been charged incorrectly.
Cause: identified as a database query regression in this afternoon's release.
Action: rolling back now, expect recovery within 10 minutes.
For customers: "we're aware of an issue affecting checkout and are working
on it; please try again in a few minutes." Do not promise a specific time.
Next update 15:10 or on recovery.
```

**The response channel itself** — the people doing the work. Here you want the raw material: observations with timestamps, actions before you take them, results, and hypotheses labelled as hypotheses. Keep one channel and keep everything in it. Side conversations in direct messages are where facts go to be lost, and they are the reason the timeline afterwards has a twenty-minute hole in it.

Four language habits worth drilling:

**Separate observation from inference.** "Error ratio is 22 percent" is an observation. "The database is broken" is an inference. Say which you are offering. Inferences stated as facts become the received wisdom of the incident within minutes and are extremely hard to dislodge.

**Never speculate publicly about cause.** Anything you say externally about the cause will be quoted back to you, and early cause hypotheses are wrong about half the time. Externally: impact and status only. Internally: hypotheses clearly labelled.

**Do not promise a resolution time.** You do not know it. Promise a *next update* time, which you control completely.

**No blame, in any channel, ever.** Not "the release broke it," but "the symptom began seven minutes after the release." One is a fact and the other is an accusation, and the accusation is what stops people volunteering information — including the person who has the piece you need.

## Handovers and the long incident

An incident lasting past a few hours needs handover, because tired responders make expensive mistakes, and this is a place where saying "I am fine" is a bad contribution.

A handover is a spoken or written briefing containing: current status and severity; the timeline so far; what has been tried and what happened; the current hypothesis and confidence; what is in flight right now; any changes made to production that have not been reverted; who has been told what and when the next update is due; and open decisions. Then the incoming person restates it back, in their own words, and only then is the handover complete. Announce it in the channel so everyone knows who to talk to.

The same discipline applies at the end. An incident is over when customer impact has stopped *and* someone says so explicitly. Both halves matter — incidents that fade out without a closing statement leave people uncertain for hours whether they are still on. Close it clearly:

```text
Resolving. Checkout error ratio has been at baseline since 14:58.
Rollback to v2.14.0 was the mitigation; the underlying query regression
is not yet fixed and v2.14.1 must not be redeployed.
Total customer impact: 53 minutes, ~4,100 failed checkout attempts.
Follow-up items are being tracked. Postmortem scheduled for Thursday.
Thanks all.
```

Note what that message does: it states the mitigation is not the fix, it flags the trap that would cause a recurrence, it quantifies impact, and it hands off to the after-action work. That handoff — timeline, escalation record, postmortem, and knowledge-base article — is lesson 09.

## Practice

**Exercise 1 — Write your severity definitions.** For the storefront, write SEV1, SEV2, and SEV3 definitions in terms of specific customer-visible symptoms and numbers, not adjectives. Then classify each of these and justify in one sentence: checkout failing for 22 percent of attempts; the entire site returning errors for everyone; order history pages loading in 8 seconds; the nightly reconciliation job not running for two nights; one of six instances unhealthy with the other five keeping up.

**Exercise 2 — The first five minutes.** An alert fires at 14:07: checkout error ratio at 22 percent, sustained. Write, verbatim and in order, everything you would send or do in the first five minutes. Include the declaration message, the role assignments, the first dashboard you open and what you are looking for on it, the first question you ask about recent changes, and the first customer-facing status post. Timestamp each line.

**Exercise 3 — Three audiences, one moment.** It is 14:38. You know the symptom started seven minutes after a release, you have not proven causation, and you are about to roll back. Write three messages for that moment: a public status update, an internal stakeholder update, and a response-channel message. They must be consistent with each other and none may claim more certainty than you have. Then mark every sentence that is an inference rather than an observation.

**Exercise 4 — Choose the mitigation.** For each situation, name the mitigation you would apply first, what you expect to observe within five minutes if it worked, what you would capture before acting, and what you would do if it did not work.

1. Symptom began four minutes after a deployment; one endpoint is failing.
2. One instance of six is failing every request; the load balancer has not removed it.
3. The managed database is at 100 percent CPU with no recent deployment; a large analytics query is running.
4. The external payment provider is timing out on every call and has confirmed an incident on their side.
5. Error ratio is climbing steadily, no change was made, traffic is triple normal because of a marketing email.

**Exercise 5 — Run a tabletop.** With at least two other people, run the checkout incident for thirty minutes in real time. Assign commander, ops lead, and scribe. One person plays a stakeholder who interrupts every six minutes asking for an update. Use real timestamps. Produce, as artifacts: the scribe's timeline, every message sent to each of the three audiences, and the closing statement. Afterwards, review three specific things — was the declaration made within three minutes of the alert, did every promised update time get met, and was any inference presented as a fact?

**Exercise 6 — Practise the handover.** From your tabletop timeline, write the handover briefing you would give at the two-hour mark to a colleague who has just arrived. Give it verbally to someone who was not in the exercise and have them restate it back. Note every fact they got wrong or missed, and fix your briefing template so the next one does not lose it.
