---
lesson_id: sn360-08
course_id: sn360
pathway: servicenow-implementation-specialist
title: Advanced Work Assignment and Case Routing
order: 8
kind: lesson
competency_ids:
  - D3-S1-C04
objectives:
  - Automate case routing and assignment using matching rules, queues, and agent capacity
---

## The question routing answers

You now have cases with a customer, a lifecycle, an entitlement, a portal that creates them, and a Virtual Agent that escalates them. Every one of those paths ends in the same unanswered question: **who works this, and when do they find out?**

The default answer in most young implementations is a shared queue and a team lead who assigns by hand every morning. That works up to a point, and the point is roughly the moment volume exceeds what one person can triage before lunch. After that, unassigned cases sit, SLAs burn while everyone can see the case and nobody owns it, and the same three senior engineers absorb everything because they are the ones watching the list.

Routing is the automation of that decision. This lesson covers the full range, from the simplest declarative assignment to Advanced Work Assignment, and — more importantly — when each is the right answer.

## The ladder of routing mechanisms

Climb only as high as the problem requires.

**1. Assignment on the record, by rule.** Assignment rules and data lookup rules set the assignment group from case attributes: product line to specialist group, region to regional team, case type to billing. Declarative, transparent, and correct for organizations where a group owns a category and members pull work from the group's list.

**2. Assignment by flow.** A Flow Designer flow triggered on case creation, applying conditions the rule engine cannot express — entitlement tier, install base attributes, whether the account has a named support engineer. Still group-level, still pull-based, but with real logic and a run history you can debug.

**3. Round-robin or load-balanced assignment to individuals.** A flow or script that picks a member of the group by open case count or by rotation. This is where hand-rolled solutions start to hurt: you are now maintaining your own definition of who is available, and it does not know that Maya is on holiday or already handling two chats.

**4. Advanced Work Assignment.** A push model. Work items enter a queue, the engine evaluates who is eligible and who has capacity, and it *offers* the item to a specific agent, who accepts. Availability, capacity, skills, and multi-channel load are the engine's problem rather than yours.

The upgrade to AWA is justified when at least one of these is true: agents handle more than one channel and their attention must be budgeted across them; work must find a *person* rather than a list; capacity limits matter; or skills, not just groups, decide who can take an item. If none of those hold, tiers one and two are the honest answer, and shipping them is not a lesser outcome.

## Getting the routing inputs right

No routing engine can be better than the data it reads. Before configuring any of it, make sure the case knows:

- **Its product context**, from the installed product and its model — the single most useful routing input in CSM, and the reason lesson 02's install base modeling mattered.
- **Its entitlement tier**, from lesson 04. Premium work may go to a different queue or jump the order.
- **Its account relationships.** Accounts with a named support engineer or an assigned account team route differently, and that relationship should be a record, not a comment on the account.
- **Its language and time zone**, from the contact. A German-language case routed to an English-only team is an SLA breach with extra steps.
- **Its channel**, stamped at creation as covered in lesson 03. Chat is synchronous and must be routed in seconds; email is not.

A recurring engagement failure is a routing design that needs a field nobody populates. Before you build the rule, check the fill rate of the field it reads. If installed product is empty on 60% of cases, fix the create-case form first — routing on data that is absent produces a default queue and a confident-looking design that does nothing.

## Advanced Work Assignment, part by part

**Service channels.** A service channel is a type of work: case, chat, messaging, and any custom channel you define. Each channel has its own capacity settings and its own routing behavior, because handling three chats is not the same load as owning three cases. Channel-level settings include how many items an agent may hold, how long an offer stands before it expires, and whether items may be rejected.

**Work item queues.** A queue is defined by a condition over the source table plus an order. "Premium cases for the controller product line" is a queue: condition matching entitlement and product line, ordered by SLA remaining rather than by creation time. Queues are evaluated in order, and the first matching queue takes the item — so queue order encodes your priority policy. Put the specific queues above the general ones, and always define a catch-all queue at the bottom. An item that matches no queue does not route at all, and finding those is an unpleasant morning.

Order inside a queue matters as much as the queue's condition. Ordering by creation time is fair; ordering by SLA time remaining is correct. Fairness and correctness diverge exactly when you are behind, which is when routing matters.

**Assignment eligibility.** Two mechanisms decide who *can* take an item.

- *Group membership* — the agents in the queue's assignment group or groups.
- *Skills* — the item requires skills; agents possess skills at levels. Skill determination rules derive the required skills from the record: a case on a ruggedized controller requires the "Model 4400" skill; a German-language case requires the German skill.

Skill-based routing is powerful and easy to over-model. Start with the smallest skill set that expresses a real difference in who can do the work — usually product family and language. A skill taxonomy with forty entries that nobody maintains routes worse than five groups, because unmaintained skills silently shrink the eligible pool until items stop being assigned at all.

**Capacity and presence.** An agent's capacity is per channel: perhaps three chats and eight cases concurrently. Presence states — available, busy, away, on break — gate offers. Both are configuration, but both are also a conversation with the customer's service leadership, because they encode a workload policy. Set capacity from observed handling behavior, not from an aspiration; capacity set too high recreates the shared-queue problem inside a push model, and set too low leaves work queued while agents sit idle.

**The work item lifecycle.** An item is queued, then *offered* to an eligible agent with capacity, then accepted or rejected or allowed to time out. Configure what happens on each ending:

- **Accepted** — the agent owns it; the case's assigned-to is set, and capacity is consumed until the item is closed or transferred.
- **Rejected** — offer moves to the next eligible agent. Decide whether rejection requires a reason and whether repeated rejection is reported. Silent unlimited rejection is a policy, and usually not the one anyone intended.
- **Timed out** — the offer expires. Set the timeout by channel: seconds for chat, minutes for cases.
- **Nobody eligible** — the important one. Configure an overflow: widen the eligible pool, notify a supervisor, or fall back to group assignment. Work that stalls invisibly in a queue is the failure mode AWA is supposed to prevent.

**Reassignment and transfer.** Agents will need to hand work on: to a specialist, to another region at shift end, back to the queue. Configure transfer so it re-enters routing rather than dropping the item on a named individual, and so capacity is released on the sending side.

**The agent's view.** AWA delivers work into the agent's inbox in the configured workspace. From the implementation side, what you own is that the inbox shows the fields an agent needs to triage in one glance — customer, entitlement tier, SLA remaining, channel, short description — and that accepting an item opens the record ready to work.

## Routing the Virtual Agent handoff

Lesson 07 ended a conversation with a transfer request. That transfer is an AWA work item on the chat or messaging service channel, and it needs its own queue.

Three configuration points:

- **A dedicated queue for live conversations**, ordered by wait time, with a short offer timeout. A chat offer that stands for two minutes is a customer who has already left.
- **Context on the item**, so the accepting agent sees the transcript and the identified account before saying hello.
- **A no-agent-available path.** When the queue is empty of available agents or the request arrives outside support hours, the conversation must not simply wait. Create the case, tell the customer the SLA response commitment, and end. This must use the same schedule as the entitlement, or the bot will promise a response time the contract does not back.

## Escalation, priority, and staying honest

Routing decides *who*. Escalation decides *when the answer changes*.

The mechanisms are ordinary platform ones, applied to case data:

- **Priority** derived from impact and urgency, and in CSM usually influenced by entitlement tier and account. Derive it with a data lookup rule so the derivation is visible and adjustable, not with a hard-coded script.
- **SLA-driven escalation.** The flows attached to the SLA definitions from lesson 04 fire at elapsed thresholds. At 75% they notify the assignment group; at breach they notify a manager and may re-queue the item at higher priority.
- **Major case promotion**, from lesson 03. When fifty cases share a cause, routing fifty items to fifty agents is the wrong outcome. Promotion collapses the work; make sure your queues do not fight it by continuing to offer the children.

One caution about entitlement-driven priority. It is legitimate for a Premium customer to be answered first. It is not legitimate for the priority field to say P1 on a cosmetic issue because the account is large, because then P1 stops meaning anything and your reporting in lesson 10 becomes fiction. Keep severity (how bad is it) and entitlement (what did they buy) as separate inputs, combine them into the queue order, and leave both readable.

## Coverage, shifts, and follow-the-sun

Routing is a function of time as much as of skill. A queue with three eligible agents has zero eligible agents at 2am, and the design has to say what happens then.

**Support hours per team.** Each assignment group works a schedule, and the schedule should be the same one the entitlement uses in lesson 04 wherever the two describe the same promise. Where they differ — a 24x7 contract served by regional teams that each work business hours — the coverage model is the reconciliation, and it has to be explicit.

**Follow-the-sun.** Work moves between regions as shifts end. Two mechanisms: route new work to whichever region is currently open, and hand over in-flight work at shift boundaries. The first is a queue condition against the schedule. The second is a deliberate process — a handover list, or an automated transfer of unresolved items back to the queue — and it is where work is most often lost. Configure the handover; do not leave it to whoever remembers.

**On-call for out-of-hours severity.** Not everything waits until morning. A severe case from a 24x7-entitled customer outside business hours should notify an on-call rotation rather than sit in a queue. Model the rotation as a group with an on-call schedule, and make the trigger condition narrow enough that it is respected — a rotation woken by routine work stops answering.

**Holiday and absence.** Presence handles the day; schedules handle the shift; neither handles two weeks of leave. Either agents set an away state that persists, or the group membership is maintained. Whichever it is, someone owns it, and the design note should say who.

The reliable test for all of this is to pick four moments — Tuesday mid-morning, Friday at shift change, Saturday at 3am, and the customer's national holiday — and walk one case of each severity through each moment. Any combination whose answer is "it waits in the queue until someone notices" is a gap you found before your customer did.

## Rolling routing out without breaking the team

Automating assignment changes how a team works, and a team that loses confidence in the routing will route around it — reassigning to themselves, working from a personal filter, or asking the lead to intervene, which reinstates the bottleneck you removed.

A safe sequence:

1. **Run it in shadow first.** For a week, let the rules compute the assignment and write it to a field or a log without setting it. Compare the computed answer with what the humans actually did and investigate every difference. Some will be routing bugs; the interesting ones are undocumented rules the team applies without realizing.
2. **Enable for one category.** Automate the highest-volume, least-controversial case type first. Get a week of clean operation before adding the next.
3. **Publish what it does.** The team should be able to read, in a sentence per queue, why work arrives where it arrives. Routing that feels arbitrary gets overridden.
4. **Instrument overrides.** Manual reassignment immediately after automatic assignment is your best defect signal. Report on it weekly; a spike in one queue is a rule that is wrong.
5. **Keep an override path, and keep it visible.** Team leads must be able to move work. Removing that authority to protect the design is how the design gets discredited.
6. **Watch the three numbers that indicate health**: time from creation to assignment, work sitting in the catch-all, and offers timing out or being rejected. All three should trend down after the first fortnight. If any of them trends up, stop adding queues and fix what you have.

The change-management point underneath all of this is worth stating plainly: routing configuration encodes a workload policy, and workload policy belongs to the customer's service leadership. Your job is to make the policy explicit, implement it faithfully, and show them the consequences. It is not to decide, in a queue condition, how hard their people work.

## Worked example: Northwind's routing design

The requirement: controller cases go to product specialists; Premium accounts are answered before Bronze; German-language cases go to the Munich team; chats must be answered in under a minute during business hours; nothing may sit unrouted.

The design:

| Layer | Configuration |
| --- | --- |
| Inputs | Installed product mandatory on the portal form; entitlement stamped by lookup; contact language on the case |
| Skills | `Model 4400`, `Model 4400 Ruggedized`, `German`; determination rules derive them from the product model and contact language |
| Channels | Case channel, capacity 8; chat channel, capacity 3, offer timeout 30 seconds |
| Queue 1 | Live chat transfers — condition: channel is chat; order: wait time ascending |
| Queue 2 | Premium controller cases — condition: entitlement tier Premium and product line Controllers; order: SLA time remaining |
| Queue 3 | German-language cases — condition: contact language German; order: SLA time remaining |
| Queue 4 | All controller cases — condition: product line Controllers; order: SLA time remaining |
| Queue 5 | Catch-all — condition: true; order: created ascending; overflow notifies the duty supervisor |
| Escalation | SLA flows notify group at 75%, manager at breach; breach re-queues at the top of its queue |
| No agent | Chat outside hours creates a case and quotes the Bronze or Premium response commitment |

Then read the design back critically, which is the part that separates a working implementation from a plausible one:

- Queue 2 sits above queue 3, so a German-language Premium controller case routes to the Premium queue and may reach an agent who does not read German. Either add German to queue 2's skill requirement, or move queue 3 above it and accept slower Premium handling for German cases. There is no configuration that avoids the choice — surface it and let the customer decide.
- Queue 5's catch-all condition means nothing ever fails to route, which is good, but it also means a badly-conditioned new queue will look like it works while quietly dumping into the catch-all. Report weekly on catch-all volume; a rising number is a routing bug, not a demand signal.
- Chat capacity of three with a thirty-second timeout only works if presence is used honestly. If agents leave themselves available while at lunch, chats will be offered and time out repeatedly, and the customer experiences a minute of silence per cycle. Presence discipline is a training commitment the customer has to make, and it belongs in the go-live plan, not in a config note.

## Practice

1. **Audit the inputs.** Report on the fill rate of installed product, entitlement, and contact language across your existing cases. Fix the highest-impact gap at its source before configuring any routing.

2. **Build tier two first.** Implement group assignment by product line using a data lookup rule or a Flow Designer flow. Confirm a new case from the portal lands in the right group with no human involvement.

3. **Stand up AWA.** Configure a case service channel with a capacity limit, one specific queue and one catch-all, and confirm a new case is offered to an eligible agent. Watch the work item record through queued, offered, and accepted.

4. **Add skills.** Create two product skills and one language skill, write the determination rules that derive them from the case, and assign the skills unevenly across three test agents. Prove that a ruggedized-controller case is only offered to agents holding that skill.

5. **Test the unhappy paths.** For one queue, set every eligible agent to unavailable and observe what happens to a new item. Implement your chosen overflow behavior and re-test. Then let an offer time out and confirm it re-offers rather than disappearing.

6. **Route the chat handoff.** Connect lesson 07's live agent transfer to a chat queue with a short offer timeout, verify the transcript arrives with the item, and implement the out-of-hours path that creates a case quoting the correct SLA.

7. **Interrogate your own design.** Write down two cases whose correct routing your configuration currently gets wrong — as in the Premium-versus-German conflict above — and for each, state the two options and which you would recommend to the customer, with the reason.

## Check your understanding

1. When is Advanced Work Assignment justified over assignment rules or a flow?
2. Two queues both match an item. Which one takes it?
3. Why order a queue by SLA time remaining rather than creation time?
4. Weekly catch-all volume is rising. What does that usually mean?

*Answers:* (1) When agents work multiple channels, work must reach a person rather than a list, capacity matters, or skills decide eligibility. (2) The first matching queue in evaluation order. (3) Fairness and correctness diverge when you are behind; SLA order works the case closest to breach first. (4) A routing bug, often a new queue with a wrong condition, not a demand signal.
