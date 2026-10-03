---
lesson_id: dm350-06
course_id: dm350
pathway: digital-marketer
title: Automation Workflows and Funnels
order: 6
kind: lesson
competency_ids:
  - D7-S1-C02
objectives:
  - Build an automated nurture workflow with entry criteria, branching, and exits
  - Map a funnel from first touch to closed customer
---

## The Funnel, Mapped

Automation is the machinery underneath a funnel, so the funnel has to exist on paper first. A funnel is not a picture of a cone. It is a list of stages, each with a definition, a count, a conversion rate to the next stage, and a typical time spent in it.

```txt
NORTHLIGHT FUNNEL - one month, first touch to closed client

  STAGE                     COUNT    -> NEXT    MEDIAN TIME    OWNED BY
  1  Sessions on site      14,000                    -        marketing
                                       2.1%
  2  Contacts created         287       25.8%     same day     marketing
  3  Marketing qualified       74       90.5%      19 days     marketing
  4  Fit call booked           67       77.6%       4 days     marketing
  5  Fit call completed        52       21.2%       6 days     advisors
  6  New client                11          -       11 days     advisors

  End to end: 0.08% of sessions, 3.8% of contacts, 32 days median
  (measured directly from first conversion to signing; stage medians
  do not add up to an end-to-end median)
```

Every number in that table is a question waiting to be asked.

**Stage 1 to 2 is 2.1 percent.** That is the capture path from lesson 03, and it is the stage where the largest absolute number of people are lost — 13,713 of them. It is also the stage where a one-point improvement is worth the most, which is why the conversion work in lesson 03 matters.

**Stage 2 to 3 is 25.8 percent, and it takes nineteen days.** This is the stage automation owns outright. Seventy-four of 287 contacts become qualified; 213 do not. Some of those 213 will never qualify, and that is correct. But nineteen days is a long time for a contact to be deciding, and what happens during those nineteen days is entirely up to the workflow you are about to build. Today, at Northlight, a contact who downloads the checklist receives one delivery email and then silence. That silence is the largest fixable leak in the funnel.

**Stage 3 to 4 at 90.5 percent** is the suspicious number lesson 03 flagged: if nine of ten qualified contacts book a call, qualification is happening too late to be doing any work.

**Stage 5 to 6 at 21.2 percent** is the advisors' number, not yours. Know it, quote it when you value a lead, and do not try to automate it.

Two rules follow from a funnel table like this and they are the reason it is worth drawing.

**Fix the stage with the largest absolute loss that you can actually influence.** Not the lowest percentage — the largest number of people times your ability to move it.

**Never optimize one stage without watching the next.** Doubling stage 2 by removing every qualifying field simply moves the loss to stage 3, and it costs the advisors their week. The funnel is a system; every local improvement must be checked one stage downstream.

## Where Automation Belongs

An automated workflow is a rule the CRM executes without you: *when this becomes true about a contact, do these things in this order.* It is very good at a narrow set of jobs and very bad outside them.

Automation is right for work that is **repetitive, rule-based, time-sensitive, and low-stakes if slightly wrong**. Sending the third email in a nurture sequence nineteen days after a download is all four. Notifying Marisol within a minute of a fit-call request is all four.

Automation is wrong for work that requires **judgment, or where being wrong is expensive**. Deciding that a contact is sales-qualified requires judgment. Sending an "are you still interested?" email to someone who signed a contract yesterday is cheap to build and expensive to send.

There is also a middle category that catches people out: work that is repetitive but where the *content* has to be right, such as a proposal follow-up. The correct pattern there is to automate the *task* — create a task for the human, with the context attached — rather than the message. Automating a notification is nearly always safer than automating a send.

### What an automation costs

Workflows are described as if they were free after the build. They are not, and knowing the real cost is what stops a team from having forty of them.

There is the **build**, which is the visible cost and usually the smallest. There is the **content**, which is larger: five emails written well is most of a week, and they need rewriting when prices, people, or offers change. There is the **maintenance**, which nobody budgets: every workflow is a standing claim on somebody's attention forever, and the moment nobody owns it, it starts sending things the company no longer means.

And there is the cost that only shows up in an incident — the **blast radius**. A broadcast that goes wrong is wrong once, to a known list, and you can send an apology. A workflow that goes wrong is wrong continuously, to a list that grows daily, often for weeks before anyone notices, because there is no send button to draw attention to it. This asymmetry is why the test plan later in this lesson is longer than the specification of some of the workflows it tests.

The practical rule: before building any workflow, write down what it would cost to do the same job by hand for a month. If the honest answer is "an hour," do it by hand for a month first. You will learn what the workflow should say, and about a third of the time you will discover it should not exist.

## The Anatomy of a Workflow

Seven parts. Every platform names them differently and every platform has all seven.

**Entry criteria** — what puts a contact into the workflow.
**Enrollment settings** — whether contacts already in the database at build time are pulled in, and whether a contact may enter twice.
**Actions** — what the workflow does.
**Delays** — how long it waits between actions.
**Branches** — how the path splits on a condition.
**Suppression** — who is never allowed in, regardless of entry criteria.
**Goal and exit criteria** — what ends the workflow, successfully or otherwise.

Miss any of the seven and you have built a machine with a known defect. The two most commonly missed are suppression and exit criteria, and they are the two that produce the embarrassing failures.

### Entry criteria

Two flavours, and the difference matters more than it looks.

A **trigger-based** entry fires on an event: *submitted the checklist form*, *clicked a link in campaign X*, *lifecycle stage became marketing_qualified*. Trigger entries are precise, they fire once at a knowable moment, and they are what you want for nearly everything.

A **list-based** entry enrols anyone matching a filter: *business_type = agency AND lead_score > 40*. List entries are seductive and dangerous, because the filter is evaluated continuously and any change anywhere in your data can suddenly qualify hundreds of contacts at once. The classic disaster: an author builds a list-based workflow, someone imports 2,000 old contacts on Friday afternoon, and 2,000 people receive a "thanks for downloading!" email about a guide they never downloaded.

The protection is **enrollment settings**. Every platform asks two questions and you must answer both deliberately:

*Enrol existing contacts who already meet the criteria?* Default this to **no** unless you have counted them and want them.

*Allow re-enrollment?* Default to **no**. Re-enrollment is right for a small number of genuinely repeatable workflows — a monthly report request, a re-engagement cycle — and wrong for everything else. A contact who receives your five-email welcome sequence three times will not receive a fourth.

### Actions

The action vocabulary is short and it is the same everywhere:

- **Send an email** — a marketing email, from the workflow, subject to consent and suppression.
- **Set a property value** — the most underrated action in automation. Workflows that write data are how the CRM stays current.
- **Add to / remove from a list** — usually a static list used as a marker.
- **Create a task** — assigned to a user, with a due date. The safest way to automate human work.
- **Send an internal notification** — email or chat to a colleague. Not the same as a task: notifications are noticed and forgotten, tasks persist.
- **Rotate an owner** — assign the contact to a user, round-robin or by rule.
- **Enrol in another workflow** — powerful, and the fastest route to a loop. Use sparingly and never in both directions.
- **Call a webhook** — hand off to another system.

A rule worth adopting: **every workflow that sends email should also set a property.** If nothing else, stamp `last_nurture_email_sent` with the date. Without it, diagnosing a send problem three weeks later means reading logs that may not exist.

### Delays

A **fixed delay** waits a duration: three days, two hours. Simple, and it will happily deliver an email at 03:14 on a Sunday.

A **wait-until delay** waits for a moment: *until 09:00 on the next business day*, *until the contact opens the previous email*, *until 1 October*. Wait-until delays are what make automated email feel human, and every serious workflow uses them.

Two practical rules. Constrain sends to **business hours in the recipient's time zone**, not yours — Northlight's list runs from Portland to Boston, three hours wide, so a 10:00 send scheduled on Boston time lands at 07:00 in Portland, and a 10:00 send from the Portland office lands in Boston after lunch. And be careful with *wait until an event happens*, because if the event never happens the contact waits forever. Always pair an event wait with a maximum duration and a fallback path.

### Branches

A branch splits the path on a condition evaluated at the moment the contact reaches it. Three kinds:

**If/then on a property** — `business_type = agency` sends one email, everyone else another. Deterministic and easy to reason about.

**If/then on behavior** — `clicked the previous email` sends a follow-up, otherwise a different one. This is where nurture becomes responsive.

**Value branch on a range** — `lead_score` under 20, 20 to 39, 40 and above, three paths.

Two disciplines keep branches maintainable. **Every branch has an else path with real content**, for the same reason lesson 05's conditional blocks needed a default. And **branch shallow**: two levels of branching produce four paths, three produce eight, and nobody, including you in six months, can hold eight paths in their head. If you need more, build a second workflow with a clean entry criterion instead.

There is a third discipline that only bites later: **know when the condition is evaluated.** A branch tests the contact's state at the moment they arrive at it, not at the moment they entered the workflow. A contact who entered as a `solo_contractor` and was updated to `agency` on day three takes the agency branch on day six, which is usually what you want and occasionally a surprise. When it matters — when a contact must receive a consistent story regardless of what changes underneath them — stamp the value into a dedicated property at entry and branch on that stamped copy instead. This is the same instinct as lesson 05's static list: sometimes you want the snapshot, not the live value, and you have to say which.

The related question is what a branch does with a *missing* value. Most platforms send an empty property down the else path silently. With `business_type` populated on half of Northlight's database, that means the else path is not an edge case — it is the largest branch in the workflow, and it deserves the best writing in the sequence rather than the leftovers.

### Suppression

Suppression is the global "never, under any circumstances" list, applied on top of every workflow's own logic. Northlight's:

```txt
GLOBAL SUPPRESSION - applied to every marketing workflow

  marketing_consent_status  =  opted_out          hard, permanent
  email hard bounced        =  true               hard, permanent
  member of                 "Do Not Email"        manual, permanent
  lifecycle_stage           =  disqualified       until a human changes it
  engagement tier           =  dormant            until re-permission (lesson 05)
  has an open deal          =  true               while the deal is open
  fit call booked           within last 30 days   temporary
  received 2+ marketing emails in last 7 days     temporary, defer 3 days
```

The bottom four are the interesting ones. Somebody actively in conversation with Marisol should not simultaneously receive a nurture email asking whether they have considered talking to someone at Northlight. And the last rule — a frequency cap — is the only reliable defence against the situation where three separate workflows each individually behave well and collectively bury a contact in nine emails a week. Build the cap once, apply it globally, and enforce it in every workflow.

### Goals and exits

A **goal** is the outcome the workflow exists to produce. Reaching it should remove the contact immediately: continuing to send "have you considered booking a call?" to someone who booked a call an hour ago is the most common and most avoidable automation failure there is.

**Exit criteria** are broader than the goal. A contact leaves the workflow when they achieve the goal, when they become ineligible, when they unsubscribe, or when the sequence simply finishes. Every one of those needs a defined destination — a lifecycle stage, another workflow, or nothing at all. A contact who reaches the end of a nurture sequence without converting is not finished; they are now in the long-term newsletter audience, and something has to put them there.

## The Worked Workflow

Here is the whole thing, written out. This is the deliverable format — a workflow specified this way can be built by anyone in any tool, reviewed before it is built, and audited a year later.

```txt
WORKFLOW: Checklist Nurture v2
OWNER: you        REVIEW: quarterly        BUILT: 12 Sept        STATUS: live
GOAL: fit call booked within 30 days of download
TARGET: lift contacts -> marketing_qualified from 25.8% to 34%

ENTRY CRITERIA (trigger)
  form submission = "The Quarterly Close Checklist"
  AND marketing_consent_status = opted_in

ENROLLMENT SETTINGS
  enrol existing contacts who already match:  NO
  re-enrollment allowed:                      NO
  suppression:                                global list applies

EXIT / GOAL CRITERIA (checked continuously, before every action)
  GOAL   fit call booked                 -> exit, stage = marketing_qualified
  EXIT   unsubscribed or opted out       -> exit, no further action
  EXIT   lifecycle_stage = disqualified  -> exit
  EXIT   lifecycle_stage = client        -> exit
  EXIT   becomes dormant (180d rule)     -> exit to suppression
  END    sequence completes at day 21    -> lifecycle_stage unchanged (no
                                            automatic backwards moves),
                                            add to "Long-term newsletter"

-----------------------------------------------------------------------------
DAY 0    immediately on entry
         ACTION  set original_source if empty; set first_conversion =
                 quarterly_close_checklist; set first_conversion_date = today
         ACTION  set lifecycle_stage = lead  (only if currently subscriber)
         ACTION  send TRANSACTIONAL email "Your Quarterly Close Checklist"
                 - delivery only, no marketing content, sends regardless of
                   marketing consent because they asked for it

DAY 2    wait until 09:00 recipient local time
         BRANCH on business_type
           agency / design_studio  -> EMAIL 1a "The two things agency books
                                      always get wrong"
           solo_contractor         -> EMAIL 1b "Where your money and the
                                      business's money blur"
           other / unknown         -> EMAIL 1c "The three habits of a clean
                                      quarter"   [DEFAULT BRANCH]
         ACTION  set last_nurture_email_sent = today

DAY 5    IF contact viewed /pricing since day 0
           -> ACTION  lead_score +10
           -> ACTION  create task for the contact owner: "Priced us within
                      5 days of download - worth a personal note"
           -> continue in sequence (do NOT exit; this is a signal, not a goal)

DAY 6    wait until 09:00 local
         BRANCH on "opened or clicked EMAIL 1"
           YES -> EMAIL 2a "What a fit call actually looks like"
                  (CTA: book a call - the primary ask of the whole sequence)
           NO  -> EMAIL 2b, same content, new subject line, sent 2 days later
                  (single re-send attempt only; never more than one)

DAY 11   wait until 09:00 local
         EMAIL 3 "What this costs, plainly"
         - links to the pricing page; the honest-money email

DAY 14   BRANCH on lead_score
           >= 40  -> ACTION  lifecycle_stage = marketing_qualified
                     ACTION  rotate owner between Marisol and Theo
                     ACTION  create task, due in 1 business day: "MQL from
                             checklist nurture - review timeline and call"
                     ACTION  internal notification to the assigned owner
                     -> EXIT workflow (handoff; the advisor owns it now)
           20-39  -> continue to day 21
           < 20   -> ACTION  lead_score decay begins
                     -> skip to END

DAY 21   wait until 09:00 local
         EMAIL 4 "Last one from me for a while"
         - the graceful close: one clear CTA, an explicit offer to stop
           hearing from us, and a link to the preference centre
         END of sequence

END      ACTION  add to "Long-term newsletter" static list
         ACTION  set nurture_completed_date = today
         exit
-----------------------------------------------------------------------------

SEQUENCE TOTAL: 5 emails (1 transactional + 4 marketing) over 21 days
FREQUENCY: never more than one marketing email in any 48-hour window
```

Walk through what that specification is doing that a naive sequence would not.

**Day 0 writes data before it sends anything.** The properties lesson 02 insisted on are populated here, by the workflow, so no human forgets.

**The delivery email is marked transactional and separated.** It goes because the person asked for it. The marketing emails start on day 2 and are subject to consent.

**The default branch on day 2 is real.** Contacts with unknown business type — the largest single group in Northlight's data — get a complete, useful email rather than falling through a crack.

**Day 5 is a signal, not a gate.** A pricing-page view raises the score and creates a task for a human, but does not exit the contact from the sequence. Distinguishing "interesting thing happened" from "the goal happened" is a distinction beginners routinely collapse, and collapsing it produces workflows that dump contacts out at the first flicker of interest.

**Day 6's re-send is capped at one.** Re-sending to non-openers is a legitimate technique and it is one email, not a habit.

**Day 14 is the handoff, and it exits.** The workflow's job ends when a human takes over. Automation that keeps running underneath a live sales conversation is the single most common source of "why did our system email my prospect that?"

**Day 21 offers a way out.** The last email of a sequence should make stopping easy. Counter-intuitively this reduces complaints, which lesson 07 shows is worth far more than the handful of unsubscribes it produces.

## The Handoff Workflow

The nurture workflow above hands off internally at day 14. The fit-call request path — Northlight's high-intent offer — needs its own, much shorter workflow, and speed is its entire purpose.

```txt
WORKFLOW: Fit Call Request - Immediate Handoff
ENTRY: form submission = "Book a 20-minute fit call"

  IMMEDIATE  set lifecycle_stage = marketing_qualified
             rotate owner: Marisol / Theo, round robin
             create task for owner, due in 4 business hours, priority high
             internal notification to owner AND to Ruth (visibility)
             remove contact from ALL nurture workflows
             add to "Active conversation" suppression list
  +4 HOURS   IF task still open -> notify Ruth: "SLA breach on <contact>"
  +2 DAYS    IF no call logged and no meeting booked
             -> notify owner, second task, due same day
  +7 DAYS    IF still no contact made
             -> return contact to nurture, set lifecycle_stage = lead,
                notify Ruth with a monthly count of these

EXIT: meeting booked, or contact reached and outcome logged
```

The `+7 DAYS` rule is a return path, and it is what stops a good lead dying quietly in an untouched task list. The escalation at four hours is the SLA from lesson 03, made real by a machine rather than by hoping.

## Lifecycle Stage Automation

One small workflow, easy to get wrong, that keeps the whole database honest:

```txt
WORKFLOW: Lifecycle Stage Maintenance
  subscriber -> lead                on any form submission
  lead -> marketing_qualified       when lead_score >= 40 AND business_type
                                    is not other/unknown
  any -> client                     when a deal is marked won (set by the
                                    advisor, mirrored by automation)
  client -> former_client           when the engagement end date passes
  NEVER automate  -> sales_qualified   (requires a human conversation)
  NEVER automate  -> disqualified      (requires a human judgment)
  NEVER move a stage BACKWARDS automatically, except the fit-call 7-day
        return path above, which is explicit and logged
```

The two "never automate" rules and the no-backwards rule are the guardrails. A lifecycle field that automation can push in both directions will oscillate, and an oscillating lifecycle stage silently re-enrols people into workflows they already finished.

## From Specification to Build

The specification above is the artifact that matters, and it is worth being explicit about why, because the instinct of every learner with a platform open is to start clicking.

A specification can be **reviewed before it costs anything**. Marisol can read it in ten minutes and say "we cannot take twelve calls in one week," which is a cheaper way to discover a capacity problem than launching. A specification is also **portable**: Northlight might change platforms in three years, and a workflow that exists only as boxes in a vendor's interface has to be reverse-engineered by whoever migrates it. And it is **reviewable later**, when the question is not "what does this do?" but "what did we intend?" — a question no interface can answer.

When you do move to the build, work in this order. Create the properties first, because actions that write to fields that do not yet exist fail silently in some platforms. Build the skeleton — entry, delays, exits — before any content, and test that a contact moves through it on a compressed timeline with delays temporarily set to minutes. Then add the emails one at a time, testing after each. Then set the real delays. Then run the test plan. Then turn it on, in the morning, on a day you are at your desk, with the enrolment count watched for the first hour.

Never build a workflow at 5pm on a Friday. This is not a joke about work-life balance; it is that a workflow's first hour is the only cheap moment to catch a runaway enrolment, and nobody is watching it over a weekend.

## Where a Funnel Leaks and Automation Cannot Help

Automation fixes a specific class of leak: the ones caused by nobody doing anything. Silence after a download, a slow response to a request, a lead that dies in a task list. Those are the leaks in Northlight's funnel that lesson 06 is built for, and they are real.

It is worth being equally clear about the leaks a workflow will not fix, because a team that believes automation is a general-purpose remedy will build increasingly elaborate machinery around a problem that lives elsewhere.

**A weak offer.** If the fit call is not attractive, sending five emails about it produces five ignored emails. Automation multiplies whatever the offer already does, in both directions.

**A pricing mismatch.** Northlight's stage 5 to 6 conversion is the advisors' number, and if prospects are consistently balking at price, no nurture sequence written by marketing addresses it.

**Wrong-fit traffic.** A funnel fed by people who could never buy converts badly no matter how well the middle is engineered. That is a capture-path problem from lesson 03, or a channel problem.

**A broken product experience.** Clients who leave after four months are not a marketing automation problem, and building a retention sequence to paper over it is the most expensive form of avoidance available.

The diagnostic question is simple: *if a thoughtful human did this manually, would the outcome be different?* If yes, automate it — you are scaling something that works. If no, you are about to industrialize a failure.

## Governance: Who May Build a Workflow

Automation is powerful enough that access to it should be a deliberate decision, even in a nine-person firm.

Decide **who can create a live workflow**, and keep that list short. Anyone can draft a specification; a smaller group turns one on. In a small company that is one or two people; in a larger one it is a named team, and the point is not gatekeeping for its own sake but that a workflow's blast radius is disproportionate to how easy it is to create.

Decide **what requires a second pair of eyes.** Northlight's rule: anything that sends external email, anything that writes to a lifecycle stage, and anything enrolling more than a hundred contacts in its first week is read by a second person before it goes live. That review takes fifteen minutes and catches the class of error a builder cannot see — the ones that come from knowing what you meant.

Keep an **inventory**: every live workflow, its owner, its entry criteria, its last review date, in one document that is not the platform. Ten minutes a quarter to maintain, and it is the only thing standing between a young marketing operation and the estate of forty half-understood automations that every mature one eventually acquires.

And agree the **change rule**: a live workflow is edited in a copy, tested, and swapped in — never edited underneath the contacts currently moving through it. Editing live is how a contact receives email three twice and email four never.

## Failure Modes

Six ways workflows go wrong. Five of them are preventable at design time.

**The loop.** Workflow A enrols contacts into workflow B; B, at its end, sets a property that satisfies A's entry criteria. Contacts circulate forever. Prevention: never let two workflows enrol into each other, and diagram enrolment relationships if you have more than four workflows.

**The import storm.** A list-based workflow plus a bulk import equals hundreds of wrong emails in one minute. Prevention: trigger-based entry, existing-contact enrolment off, and — the habit worth building — *pause every workflow before any bulk import.*

**The stuck contact.** A contact waits at a wait-until step for an event that will never occur. Prevention: pair every event wait with a maximum duration and a fallback branch. Detection: a monthly review of contacts enrolled longer than the workflow's maximum length.

**The double enrolment.** Re-enrollment left on, or two workflows with overlapping entry criteria. Prevention: re-enrollment off by default, and a written inventory of every workflow's entry criteria so overlaps are visible.

**The zombie.** A workflow built for a campaign that ended eighteen months ago, still live, still sending. Prevention: every workflow has an owner and a review date in its name or description. Detection: quarterly review of all live workflows, with the question "would we build this today?"

**The one you cannot prevent: the wrong content, correctly delivered.** The machine is working perfectly and the email is wrong. This is why the kill switch below exists.

## QA and the Test Plan

Never trust a workflow you have not tried to break.

```txt
TEST PLAN - Checklist Nurture v2

  1  Happy path      test contact, full data, business_type = agency.
                     Verify: correct branch, correct delays, all properties
                     written, correct email order.
  2  Default branch  test contact, business_type = unknown.
                     Verify EMAIL 1c renders and reads standalone.
  3  Sparse data     test contact, email only. Verify every token falls back.
  4  Goal mid-flight Enrol, then book a fit call on day 3.
                     Verify: immediate exit, no further email, stage correct.
  5  Unsubscribe     Enrol, unsubscribe on day 4. Verify: no day 6 email.
  6  Suppression     Enrol a contact who is on the Do Not Email list.
                     Verify: never enrols at all.
  7  Frequency       Enrol into this AND a broadcast in the same 48 hours.
                     Verify: the cap defers one of them.
  8  Re-entry        Submit the form twice. Verify: enrols once.
  9  Timing          Enrol a contact in a different time zone.
                     Verify: sends at 09:00 THEIR time.
 10  Volume          Check the count that will enrol in week one. If it is
                     ten times your estimate, do not launch.

  LAUNCH GATE: all ten pass, plus a 10% holdout for the first 30 days so the
  workflow's effect can be measured against doing nothing.
```

That holdout at the bottom is the difference between believing a workflow works and knowing it. Ten percent of qualifying contacts are deliberately not enrolled for the first month. If the enrolled group reaches `marketing_qualified` at 34 percent and the holdout at 26, the workflow is worth its build cost. If both are at 26, you have learned something far more valuable than a dashboard could tell you.

## Naming, Documentation, and the Kill Switch

Workflows accumulate. In three years Northlight will have forty of them, and their names will be the only documentation anyone reads.

```txt
  [Area] - [Trigger] - [Purpose] - v[N]
  NURT - Checklist download - fit call - v2
  OPS  - MQL threshold - handoff and task - v1
  LIFE - Form submission - stage to lead - v1
  RETN - Client 30 days - onboarding check-in - v1
```

In the description field, five lines: what it does, who owns it, why it exists, what it depends on, and the date it was last reviewed. Nobody enjoys writing this. Everybody who has inherited an undocumented automation estate wishes their predecessor had.

The **kill switch** is a documented, rehearsed procedure for stopping everything: which workflows to pause, in what order, who has permission to do it at 22:00, and how to identify who already received what. Write it before you need it, and make sure at least two people can execute it. The day you need it, you will not be calm.

## Measuring a Workflow

Four numbers, reported monthly:

**Enrolments** — is the entry criterion firing as expected? A sudden change means something upstream broke.

**Goal completion rate** — of contacts who entered, what share reached the goal? This is the workflow's headline number. Northlight's target: 34 percent reaching `marketing_qualified` against the 25.8 percent baseline.

**Drop-off by step** — where do contacts leave? A cliff after email 2 means email 2 is the problem.

**Time to goal** — the median days from entry to goal. Automation's most reliable win is usually speed, not conversion: shortening nineteen days to eleven is a real improvement even if the percentage barely moves, because a contact who decides sooner is a contact your competitor did not reach first.

And one qualitative check that no dashboard reports: **read every email in the sequence, in order, once a quarter, as if you were a contact.** Prices change, people leave, offers are retired, and links rot. A sequence nobody has read since it was built is a slow-motion embarrassment.

## Practice

1. **Map a funnel.** Take any business you know and write its funnel in the table format at the top of this lesson: stages, counts, conversion to next, median time, owner. Estimate the numbers if you must, but write them. Then identify the stage with the largest absolute loss that marketing can influence, and say what you would build there.

2. **Specify a workflow in full.** Write a complete specification, in the worked format above, for a workflow Northlight does not have: a client onboarding sequence that runs for the first 30 days after someone signs. It must include entry criteria, enrollment settings, at least two branches with real default paths, at least one property write, at least one task for a human, suppression, a goal, and every exit path. Aim for four to six emails.

3. **Add the suppression you forgot.** Take your workflow from exercise 2 and list every situation in which one of its emails would be embarrassing or wrong. Turn each into a suppression rule or an exit criterion. Expect to find at least three you missed the first time.

4. **Write the test plan.** Produce a ten-case test plan for your workflow in the format above, including one case designed to prove the default branch works and one designed to prove the goal exits the contact immediately. Then define the launch gate, including whether you would hold out a control group and how large.

5. **Audit a zombie.** Write the five-line description block for Northlight's Checklist Nurture v2 as specified above. Then write the three questions you would ask about any workflow you inherited from someone who has left the company, and say what evidence in the CRM would answer each.
