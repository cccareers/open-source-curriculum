---
lesson_id: se301-06
course_id: se301
pathway: technical-sales-representative
title: Designing Sales Automation and Workflows
order: 6
kind: lesson
competency_ids:
  - D3-S1-C04
  - D3-S1-C05
objectives:
  - Design an automation or workflow that removes manual steps from a sales process
---

## Automation is a design problem, not a button

You have now seen three automation surfaces with three names — flows and process automation in Salesforce, workflows and sequences in HubSpot, workflows in GoHighLevel. They differ in what they can reach and how they are built. They do not differ at all in what makes an automation good, which is why this lesson is platform-neutral and why the artifact it teaches you to produce — a written specification — is portable across all three.

The reason to write the spec before touching the builder is that automation is unusually unforgiving. A bad report is ignored. A bad automation sends four hundred texts at 2 a.m., or silently stops creating tasks so that a month of follow-up quietly does not happen. Automation executes your reasoning at scale, including the parts you did not think through.

Two boundaries for this lesson. It is about **the mechanics of the system**: what fires, under what conditions, doing what. The *content* of outreach — sequence copy, subject lines, call scripts, how many touches over how many days — belongs to se202 and is assumed here. And it is about configuration-level automation, not integration engineering: webhooks appear as an action, but building the service on the other end is a different job.

## What to automate, and what not to

The candidates worth automating share a shape. **The step is repetitive** — it happens the same way many times a week. **The rule is stateable** — you can express it in one sentence with no "it depends." **The cost of the step is real** — either it takes measurable time or it is regularly forgotten. And **being late is expensive** — response speed to an inbound lead being the clearest case.

Strong candidates, in rough order of return:

- Acknowledging an inbound lead immediately and notifying whoever owns it.
- Assigning ownership by a stated rule instead of by whoever noticed first.
- Creating the follow-up task nobody creates for themselves.
- Reminding people about appointments they booked, and re-engaging the ones who did not show.
- Flagging opportunities that have stopped moving.
- Stamping data the system already knows — source, first-touch date, days in stage — so no human types it.
- Enforcing a required step at a stage boundary.

The things that should stay manual are just as important to name. **Anything requiring judgment about a specific buyer**: whether a deal is genuinely qualified, what a stage change means, whether to walk away. **Anything that must sound like a person and could be wrong**: an automated "just following up on our conversation" to somebody you have never spoken to is worse than silence. **Anything with a serious blast radius**: mass field updates, mass deletion, anything touching money. And **anything you cannot yet describe precisely** — if you cannot write the rule down, you cannot automate it, and the attempt to do it anyway produces the branching monster that nobody dares to turn off.

One further rule, learned expensively by everyone eventually: **do not automate a broken process.** Automation makes a process faster and more consistent, including when it is consistently wrong. Fix the process on paper first.

## The anatomy of an automation

Every builder in every platform assembles the same seven parts. Learn them as concepts and the specific interface becomes a detail.

**1. The trigger** — the event that starts an enrollment. A record created, a field changed to a value, a form submitted, a message received, a date reached, a stage changed, a scheduled time, or a human enrolling the record manually.

**2. Enrollment criteria** — the filter that decides whether a triggered record actually enters. "A deal was updated" is a trigger; "and its stage is Negotiation, and its amount is over $10,000, and its owner is on the enterprise team" is the criteria.

**3. Conditions and branches** — decisions taken *inside* the automation, after enrollment, sending records down different paths.

**4. Actions** — the work: send a message, set a field, create a task, assign an owner, move a stage, notify a human, call a webhook.

**5. Waits** — delays. Either a fixed duration, a wait until a specific time or date, or a wait until a condition becomes true.

**6. Goals and exit conditions** — the reason to stop. The thing the automation was trying to achieve happened, so the record leaves early.

**7. Suppression and re-entry rules** — who must never receive this, and what happens if the trigger fires again for a record already inside.

The two most commonly skipped are the last two, and they cause the two most common disasters: the nurture sequence that keeps emailing someone who already replied, and the welcome message that sends five times because the form was submitted five times.

### Trigger versus condition — the distinction that fixes most bugs

A trigger is an **event**: it happens at a moment and is gone. A condition is a **state**: it is either true or false whenever you ask.

Most automation bugs come from confusing them. "When the deal amount is over $50,000" is not a trigger; it is a state that is already true for two hundred existing deals. If you build it as an enrollment criterion on a broad trigger like *any deal is updated*, then the next bulk edit enrolls all two hundred at once. The correct construction is a trigger on the *event* — the amount field changed — plus a condition on the *state* — and the new value is over $50,000.

Ask of every automation you build: **what exactly is the moment?** If you cannot name a moment, you have a condition looking for a trigger.

## The workflow spec

Before opening any builder, write the specification. It fits on one page, it survives platform changes, it is reviewable by someone who does not know the tool, and it is the document you will thank yourself for when the automation misbehaves in four months.

Every spec has these headings:

| Section | What it records |
| --- | --- |
| **Name** | A convention-following, self-describing name |
| **Purpose** | The manual step being removed, in one sentence |
| **Owner** | The named human responsible for it |
| **Trigger** | The exact event |
| **Enrollment criteria** | Conditions that must be true for the record to enter |
| **Suppression** | Records that must never enter, and why |
| **Re-entry** | What happens if the trigger fires again for a record already enrolled or already completed |
| **Actions** | An ordered list: step, timing, what happens, on which record |
| **Branches** | Conditions and the divergent paths |
| **Exit conditions** | Every reason a record leaves early |
| **Failure handling** | What happens when an action cannot complete |
| **Success measure** | The number that will show whether this worked |
| **Test plan** | The records you will run through it before it goes live |

### Worked spec 1 — inbound lead speed-to-lead

The classic case. Response time to an inbound enquiry is the single most controllable variable in inbound conversion, and it is destroyed by a rep being in a meeting.

**Name:** `INBOUND — Web form — Acknowledge, assign, task`
**Purpose:** Remove the manual steps between a form submission and a rep's first attempt, so that no inbound enquiry waits on somebody noticing an email.
**Owner:** Sales operations, reviewed monthly by the inbound team lead.

**Trigger:** Contact submits the "Request a demo" form.

**Enrollment criteria:**
- Email address is present and is not a known free-mail domain **or** the phone number is present.
- Contact is not already associated with an open opportunity.
- Contact is not tagged `do-not-contact`.

**Suppression:** Existing customers; contacts owned by the partner team; anyone with an active opt-out.

**Re-entry:** Allowed no more than once in 30 days. A second submission inside that window notifies the existing owner instead of restarting the sequence.

**Actions:**

| # | Timing | Action | On |
| --- | --- | --- | --- |
| 1 | Immediately | Set `Lead Source` = Web form; stamp `First Inbound Date` = now | Contact |
| 2 | Immediately | Assign owner by round-robin within the region matching the contact's country | Contact |
| 3 | Immediately | Send acknowledgement email confirming receipt and naming the assigned rep | Contact |
| 4 | Immediately | Notify the assigned owner by internal message with a link to the record | Owner |
| 5 | Immediately | Create task "Call new inbound lead" due in 30 minutes | Owner |
| 6 | +2 hours | Branch: has an activity been logged on this contact? | — |
| 7 | +2 hours (no branch) | Notify the team lead that the lead is unworked | Team lead |
| 8 | +1 business day (no branch) | Create task "Second attempt" | Owner |

**Branches:** At step 6, if any outbound activity has been logged, exit. If not, continue to escalation.

**Exit conditions:** An activity is logged by the owner; the contact replies on any channel; an opportunity is created; the contact opts out.

**Failure handling:** If no owner can be assigned (round-robin pool empty or region unmatched), assign to the inbound queue and notify the team lead. Never leave a record unowned.

**Success measure:** Median minutes from form submission to first logged outbound activity, weekly. Target: under 30 minutes for 80% of leads.

**Test plan:** One matching lead, one suppressed lead (existing customer), one lead with no matching region, and one duplicate submission within 30 days.

### Worked spec 2 — qualification capture and pipeline entry

This is where automation meets pipeline building. The point is not to let the system decide who is qualified — it is to make the framework impossible to skip and the decision visible.

**Name:** `PIPELINE — Qualification complete — Open opportunity`
**Purpose:** Ensure every opportunity entering the pipeline has a recorded qualification, so pipeline growth means qualified pipeline growth.
**Owner:** Sales manager.

**Trigger:** `Qualification Status` field changes to *Qualified*.

**Enrollment criteria:** All four qualification fields are populated — `Business Pain`, `Budget Confirmed`, `Decision Process`, `Target Decision Date` — and `Target Decision Date` is within the next twelve months.

**Suppression:** Contacts already associated with an open opportunity in this pipeline.

**Re-entry:** Once per contact per 90 days.

**Actions:**

| # | Timing | Action | On |
| --- | --- | --- | --- |
| 1 | Immediately | Create an opportunity at stage 1, named by the convention `Company — Product — Term` | Opportunity |
| 2 | Immediately | Copy the four qualification fields onto the opportunity | Opportunity |
| 3 | Immediately | Set close date = `Target Decision Date`; set amount = the indicative value field | Opportunity |
| 4 | Immediately | Set owner = the contact's owner | Opportunity |
| 5 | Immediately | Create task "Confirm qualification with a second stakeholder" due in 3 days | Owner |
| 6 | +7 days | Branch: is a second contact associated with the opportunity? If not, notify the owner | Owner |

**Branches:** If `Budget Confirmed` is *No — estimated only*, add tag `budget-unconfirmed` and route the opportunity into a manager review list rather than blocking it. The framework informs; it does not veto.

**Exit conditions:** Opportunity created and second contact associated; contact disqualified; opportunity closed.

**Failure handling:** If the opportunity cannot be created — missing required field — notify the owner with the specific field named, and do not silently drop the record.

**Success measure:** Percentage of open opportunities with all four qualification fields populated. Target: 100%. Secondary: win rate of opportunities with a confirmed budget versus estimated, reviewed quarterly.

**Test plan:** A fully qualified contact; one missing a field; one with a decision date two years out; one already holding an open opportunity.

### Worked spec 3 — stale opportunity escalation

**Name:** `HYGIENE — Opportunity stalled 14 days — Nudge`
**Purpose:** Surface opportunities that have stopped moving before they become the surprise in a forecast review.
**Owner:** Sales manager.

**Trigger:** Scheduled, daily.

**Enrollment criteria:** Opportunity status is open; days since last activity ≥ 14; stage is not the first stage; amount is over the review threshold.

**Suppression:** Opportunities tagged `on-hold-agreed` with a dated recall in the future.

**Re-entry:** Re-enrolls at 14, 30, and 45 days; at 45 days the notification goes to the manager as well as the owner.

**Actions:**

| # | Timing | Action | On |
| --- | --- | --- | --- |
| 1 | On match | Create task "Stalled deal — update or close" due in 2 days | Owner |
| 2 | On match | Set `Stalled Flag` = true and stamp `Stalled Since` | Opportunity |
| 3 | +2 days | Branch: has the stage, close date, or next step changed, or has an activity been logged? | — |
| 4 | +2 days (no branch) | Notify the manager, include the opportunity on the weekly hygiene report | Manager |

**Exit conditions:** Any activity logged, stage change, close date change, or status change to won/lost.

**Failure handling:** None beyond notification — this automation only reads and flags. Note that it does *not* auto-close anything. Automatically closing a human's deal destroys trust in the system and is almost never worth it.

**Success measure:** Count of open opportunities with no activity in 14+ days, weekly, trending down.

## Encoding a qualification framework

Automation is how a qualification framework stops being a slide in a training deck and becomes a property of the pipeline. Whichever framework your company uses — BANT, MEDDIC, CHAMP, or a house variant — the mechanical work in the CRM is identical, and it is four steps.

**1. Turn each element of the framework into a field.** One field per element, and never free text where a picklist will do. If your framework has an element about the decision process, the field is a dropdown with defined values, not a paragraph. The test of a good qualification field is that two reps looking at the same buyer would choose the same value.

**2. Define what "qualified" means as a rule over those fields.** Not a feeling. A written rule: *a lead is Sales Qualified when a business pain is recorded, a decision date is inside twelve months, at least one contact with buying authority is identified, and a budget is confirmed or credibly estimated.* This rule is what your enrollment criteria implement.

**3. Score fit and engagement separately.** Fit is who they are — industry, size, region, technology, role. It comes from firmographic fields and it barely changes. Engagement is what they have done — form fills, opens, replies, meetings booked, pricing page visits. It changes daily and it should **decay**: an engagement score with no decay eventually says everybody is hot. Keeping the two separate lets you tell the difference between the perfect-fit account that has gone quiet (worth a different play) and the enthusiastic tiny prospect who will never buy (worth nothing).

**4. Attach the score to a routing decision and an SLA.** A score with no consequence is decoration. High fit and high engagement routes to a rep with a 30-minute response commitment. High fit and low engagement goes to nurture with a recall date. Low fit and high engagement gets a check by a human before anyone spends an hour on it. Low fit and low engagement gets nothing.

Two cautions worth more than the whole scoring model. **The framework informs, it does not veto** — an automation that refuses to create an opportunity because one field is unset will be routed around by every rep in the building within a week, usually by entering junk. Flag, route, and require *review*; do not block. And **the disqualification path needs the same rigor as the qualification path**: a reason picklist, a defined destination (recycled to nurture, or genuinely dead), and a recall date where one applies. Pipeline you never build is invisible; pipeline you never close is worse, because it is counted.

## Sequences and workflows are not the same tool

Restating the distinction from lesson 4, because it decides which builder you open.

A **sequence** (or cadence) is one-to-one, rep-driven outreach: enrolled by a person, sent from a person's mailbox, ending when the human responds. Its purpose is that you do not forget touch four. It should feel like it came from you, because it did.

A **workflow** is system automation: enrolled by criteria, acting on records, running whether or not you are at your desk. Its purpose is that the process happens the same way every time.

Using a workflow where a sequence belongs produces mass email that sounds like a person and is not — the most reliable way to burn a domain's reputation and a prospect's goodwill. Using a sequence where a workflow belongs produces a rep doing operations work by hand.

## Testing, rollout, and the failure catalogue

Never ship an automation straight to a live audience.

**Build with the automation inactive** and assemble the whole thing before enabling anything.

**Test with records you control.** Your own email address and phone number, on test contacts clearly named as such. Run the happy path, then the suppression case, then the branch, then the failure case.

**Roll out narrowly.** One rep, or one lead source, or a small percentage, for a week. Read the results before widening.

**Watch the first live day.** Check the enrollment count within the first hour. An automation that has enrolled two thousand records when you expected twenty is telling you something important, and the first hour is when it is cheapest to hear it.

The failure modes that recur, and their fixes:

| Failure | What it looks like | Fix |
| --- | --- | --- |
| Infinite loop | Workflow A updates a field, which triggers workflow B, which updates the first field | Trigger on specific field changes, never "any update"; check what else listens to that field |
| Mass re-enrollment | A bulk import or field migration enrolls thousands at once | Add a date-based criterion, cap enrollment, and pause automations before any bulk change |
| The reply nobody heard | Automation keeps sending after the prospect answered | Reply as a hard exit condition on every outbound automation |
| Duplicate enrollment | Same person, four welcome messages | Explicit re-entry rules |
| Night sending | A wait step lands at 03:00 | Sending windows configured before anything goes live |
| Silent failure | An action fails and nothing happens or is reported | Failure branch with a notification to a human |
| Orphan record | Assignment rule matches nobody | A default owner or queue, always |
| Zombie automation | Built by someone who left; nobody knows what it does | Naming conventions, an owner field, and documentation |

## Governance: making it survivable

Automation is infrastructure, which means it outlives the person who built it.

**Name by convention.** `AREA — Trigger — Outcome` beats "Workflow 7 (new) FINAL". A person scanning a list of sixty automations should be able to tell what each does without opening it.

**Keep the specs.** A folder of one-page specs is the difference between a system that can be maintained and one that can only be feared.

**Name an owner for each.** Not a team — a person.

**Review on a schedule.** Quarterly: what has enrolled zero records in ninety days, what has enrolled far more than expected, what references a field or tag that no longer exists.

**Change deliberately.** Note what you changed, when, and why. Editing a live automation with people mid-sequence has consequences that are hard to reason about after the fact.

**Measure.** Every spec above ends with a success measure, and that is not decoration. Automation you cannot show the value of is automation that will be blamed for the next unrelated problem.

## Practice

Use whichever platform from lessons 3 to 5 you have the best access to. Test on records you control.

**1. Find the manual step worth removing.** For one week — or from memory, honestly — list the repetitive actions in a sales day: data typed that the system already knew, tasks created by hand, follow-ups remembered rather than scheduled, notifications sent manually. Estimate frequency and minutes for each and rank by total time. Choose the top candidate that also passes the "can I state the rule in one sentence?" test.

**2. Write the spec.** Using every heading in the table above, specify that automation. It must include at least one branch, at least two exit conditions, an explicit re-entry rule, a failure-handling path, a success measure, and a test plan with at least four test records — one of which must exercise the suppression case.

**3. Have it reviewed before you build.** Give the spec to a peer and ask them to find one case you have not handled. There is always one. Amend the spec and mark what changed.

**4. Build it inactive, then test it.** Construct it in your platform without enabling it. Run each of your four test records through and record, in a table, the expected outcome versus the actual outcome for each. Where they differ, fix the build or fix the spec, and note which you changed and why.

**5. Design the qualification layer.** Separately, take the qualification framework your organization uses (or BANT if you have none) and produce: one field per element with its type and complete legal values; the written rule that defines *qualified*; a fit/engagement scoring model with at least four fit signals and four engagement signals, including a decay rule; and a routing table mapping each score quadrant to a destination and a response-time commitment.

**6. Write the operating note.** In under 400 words, aimed at the rep who inherits this: what the automation does, what it deliberately does not do, what will make it misbehave, how to turn it off safely, and what number tells you it is working.
