---
lesson_id: se301-09
course_id: se301
pathway: technical-sales-representative
title: "Project: Configure and Operate a Sales Pipeline"
order: 9
kind: project
competency_ids:
  - D3-S1-C04
  - D3-S1-C05
  - D4-S1-C03
objectives: []
---

## Goal

Stand up a working sales pipeline in a real CRM, populate it with a defined book of leads, qualify and work them through a simulated selling period, keep the data clean while you do it, and finish by producing a forecast you can defend line by line.

You are assessed on four things: whether your configuration reflects a process rather than a set of columns, whether you applied a qualification framework consistently instead of case by case, whether the pipeline you hand over would survive an audit, and whether your forecast is calibrated rather than optimistic. Nobody is grading how pretty the board looks.

## The scenario

You are the first sales hire at **Waypoint Fleet Systems**, which sells a maintenance-scheduling and compliance platform to mid-sized trucking, delivery, and municipal fleet operators.

| Fact | Value |
| --- | --- |
| Product | Annual subscription, priced per vehicle |
| Typical deal size | $12,000–$60,000 annual value |
| Typical sales cycle | 30–75 days |
| Fit profile | Fleets of 40–400 vehicles, US-based, currently managing maintenance on spreadsheets or an in-house system |
| Poor fit | Fleets under 25 vehicles; owner-operators; companies already on a direct competitor within the last 12 months |
| Lead sources | Inbound demo requests, outbound calling, referrals, and trade events |
| Quota, this quarter | $180,000 in new annual value |
| Already closed this quarter | $46,000 |

There is no CRM yet. Everything before you arrived lives in a spreadsheet and one person's memory. That is what you are replacing.

## Requirements

Produce eight deliverables. Seven are documents or exports; one is the configured system itself.

### 1. Platform decision and object map

Pick **one** platform from lessons 3 to 5 and work entirely in it. Any environment you can legitimately access is acceptable: a Salesforce Developer Edition org or Trailhead playground, a free HubSpot portal, or a GoHighLevel sub-account you have rights to. Never use a live production system that real business depends on.

Write half a page covering: which platform, why it suits Waypoint's selling motion, and a mapping table showing where each of the five model objects from lesson 2 lives in your chosen platform — including how you will represent the *organization* and *who is on the deal* if your platform does not model them as first-class records.

### 2. Stage definition table

A complete pipeline definition in the format from lesson 7: four to six stages, and for each one the buyer's state in a sentence, exit criteria as verifiable checkboxes, required fields, and typical duration. Every exit criterion must be a fact about the buyer that a third party could check on the record.

Add the four movement rules you will hold yourself to, and state explicitly how won and lost are recorded on your platform.

### 3. Qualification framework and field dictionary

Choose or adapt a qualification framework and make it operational:

- One field per element of the framework, with its type and, for every picklist, the complete list of legal values.
- The written rule that defines *qualified* for Waypoint — a sentence with no "it depends."
- A fit score using at least four signals drawn from the fit profile above, and an engagement score using at least four behavioural signals, with a stated decay rule.
- A routing table mapping score combinations to a destination and a response-time commitment.
- A disqualification path: reason picklist, destination, and when a recall date is set.

### 4. The configured system

Build it. The pipeline with your stages, the qualification and hygiene fields, whatever required-field enforcement your platform supports, and the saved views you will actually work from — at minimum the four hygiene views from lesson 7 plus one qualification working view.

### 5. The book of leads

Create **20 person records** with realistic names, companies, and contact details, composed as follows. This composition is deliberate: several of these records exist to test your judgment rather than your typing.

| Count | Kind |
| --- | --- |
| 6 | Inbound demo requests, fleets of 40–400 vehicles |
| 7 | Outbound prospects, mixed fit |
| 4 | Referrals from existing customers |
| 3 | Trade event contacts |

Within those 20, the following must be true:

- **4 records are clearly out of fit** — at least one fleet under 25 vehicles, at least one owner-operator, and at least one that moved to a competitor four months ago.
- **2 records are the same human twice**, arriving from different sources with different email addresses and a company name spelled two ways.
- **1 record uses a personal email address** with no company domain.
- **1 record is an existing customer's employee** who submitted a demo request.
- **3 records have a real problem but no budget until next year.**

Use `example.com`-style addresses and phone numbers you control. **No real person may receive anything you send.**

### 6. The simulated selling period

Work the book through the following event feed, which represents six weeks. Record each event in the CRM as it would actually be recorded — the right object, the right fields, the right activity, the right stage move or refusal to move — at the moment it occurs. Do not batch it at the end; the point is to produce a realistic activity history.

| # | Week | Event |
| --- | --- | --- |
| 1 | 1 | Dana Whitfield, Ops Manager at Harlan Freight (140 vehicles), submits a demo request. |
| 2 | 1 | You reach Sam Ortiz at Bellweather Distribution (90 vehicles). Real pain, no budget until next fiscal year. He asks to be contacted in January. |
| 3 | 1 | A customer refers Priya Kohl at Northgate Grocers (60 vehicles). Maintenance costs up 20% year on year. |
| 4 | 2 | Harlan Freight demo happens. Dana confirms the product addresses their compliance reporting problem and names her VP as the approver. Decision expected in about six weeks. Indicative scope: 140 vehicles. |
| 5 | 2 | Two of your out-of-fit records reply asking for pricing. |
| 6 | 2 | Northgate's Priya says she wants it but has no idea what the budget process is and cannot name an approver. |
| 7 | 3 | An event contact, Marcus Bell at Trenton Municipal (220 vehicles), emails asking for a proposal without having had a discovery conversation. |
| 8 | 3 | Harlan Freight's VP joins a call, confirms budget, and asks for a written proposal by the end of week 4. |
| 9 | 4 | You send the Harlan proposal at $54,000. Dana confirms receipt and says it goes to their finance committee, which meets in week 7. |
| 10 | 4 | Northgate's Priya identifies a budget owner and books him onto a call. |
| 11 | 5 | Trenton Municipal goes silent after two attempts. |
| 12 | 5 | A referral, Elena Vargas at Cardinal Courier (75 vehicles), agrees to an evaluation; scope looks like $28,000. |
| 13 | 5 | Bellweather's Sam emails: a truck failure caused a compliance fine and his CFO has released emergency budget. He wants to move now. Scope $34,000. |
| 14 | 6 | Northgate's budget owner confirms funding for next quarter, not this one. |
| 15 | 6 | Cardinal Courier's evaluation goes well; Elena asks for a proposal in week 7. |
| 16 | 6 | Harlan's finance committee is moved back one week. |

At the end of the feed, some deals are open, at least one should be closed lost or abandoned, and at least one qualification decision should have been to *not* open an opportunity at all.

### 7. One automation, specified and tested

Design and build one automation using the full spec format from lesson 6 — name, purpose, owner, trigger, enrollment criteria, suppression, re-entry, ordered actions, branches, exit conditions, failure handling, success measure, test plan.

It must remove a genuine manual step in the Waypoint process, contain at least one branch and at least two exit conditions, and be tested against at least four records including one suppression case. Submit the spec, plus a test log table of expected versus actual outcome for each test record, plus a note of anything you changed after testing.

### 8. Hygiene audit and forecast pack

Run the field-hygiene checklist across your pipeline and record the defect count. Fix everything, then re-run it and record the count again. Submit both, plus a short log of what you corrected.

Then produce the forecast pack: the three-method reconciliation from lesson 8 (category judgment, weighted, and a slippage-adjusted weighted number), the coverage ratio against Waypoint's remaining gap, and the half-page forecast artifact with all eight elements — including the named commit deals and the risks the arithmetic does not show.

## Constraints

- **One platform, all the way through.** Splitting the work across two tools defeats the exercise.
- **No production systems, and no real recipients.** Every email address and phone number must be yours or a documented placeholder. Verify this before you enable any automation.
- **No invented capabilities.** If your platform cannot do something, say so in writing, describe the capability you would want, and implement the closest honest alternative. A deliverable that describes a feature your instance does not have is a fail.
- **No code and no integrations.** Configuration only — fields, pipelines, views, workflows. Apex, custom development, and API work are out of scope for this course.
- **Stage moves follow your own exit criteria.** If a criterion is not met, the deal does not move, even when it would make your pipeline look better. At least one event in the feed is designed to test this.
- **Every open opportunity must have a dated next step and an open activity** at the moment you submit.
- **The forecast must not equal the quota.** If it does, you have worked backwards from the target.
- **Time budget is roughly four hours.** Build the minimum that satisfies the requirements. Twenty leads is twenty leads, not two hundred.

## Definition of done

- [ ] Platform chosen, justified, and the five model objects mapped to it, including how organization and buying-committee roles are represented.
- [ ] Stage definition table complete: 4–6 stages, buyer state, verifiable exit criteria, required fields, durations.
- [ ] The four movement rules are written, and the won/lost mechanism on your platform is stated correctly.
- [ ] Qualification fields exist in the system with complete picklist values; the definition of *qualified* is one unambiguous sentence.
- [ ] Fit and engagement scores are defined separately, with at least four signals each and a stated decay rule.
- [ ] Routing table maps score combinations to destinations and response-time commitments.
- [ ] Disqualification path defined, with reasons and recall rules.
- [ ] 20 person records exist, matching the specified composition, including the duplicate pair, the personal-email record, and the existing-customer employee.
- [ ] The duplicate pair was detected and resolved, and the resolution is documented — including which record survived and why.
- [ ] The out-of-fit records were disqualified with reasons, and no opportunity was opened for any of them.
- [ ] Every event in the feed is recorded on the correct record with the correct activity type and date.
- [ ] At least one event resulted in a deliberate refusal to advance a stage, documented with the criterion that was not met.
- [ ] At least one opportunity is closed lost or abandoned, with a reason and, where applicable, a recall date.
- [ ] Every open opportunity has an amount, a future close date, a stage supported by evidence, a specific dated next step, an open activity, and at least two associated contacts with roles or your documented equivalent.
- [ ] Automation spec is complete against all thirteen headings from lesson 6.
- [ ] The automation is built, tested against four or more records including a suppression case, and the test log shows expected versus actual.
- [ ] Hygiene checklist run twice, with defect counts before and after and a log of corrections.
- [ ] Forecast produced three ways, with the arithmetic shown.
- [ ] Coverage ratio computed against the remaining gap, stated in dollars of pipeline still needed.
- [ ] Forecast artifact contains all eight elements, names the commit deals individually, and states at least two risks not visible in the arithmetic.
- [ ] The forecast is snapshotted and dated.
- [ ] A one-page handover note exists that would let another rep take this book over on Monday.

## Hints

**Configure the process before you configure the tool.** Write the stage table and the qualification rule on paper first. Every hour spent in a builder before that decision is an hour you will spend again.

**The out-of-fit records are the real test.** Four of your twenty leads should never become opportunities, and two of them will ask you for pricing in week 2. Disqualifying a warm reply feels wasteful and is the correct call. Write the reason down; that field is the only thing anyone will learn from.

**Event 7 is a trap.** Marcus Bell asks for a proposal with no discovery. Your exit criteria say what has to be true before Proposal. Moving him there because he asked is exactly the stage inflation lesson 7 is about; the right move is to go backwards to discovery and record why.

**Event 6 is the other trap.** Priya wants the product and cannot name an approver or describe a budget process. That is not qualified under any framework worth using. Keep her as a lead, not an opportunity, until event 10.

**Event 13 rewards good hygiene.** Sam at Bellweather was correctly parked with a recall date in week 1. If you had marked him disqualified with no recall, or left him open and stale, you would have handled his re-entry badly. What you did in week 1 determines whether this is a clean pipeline entry or a scramble.

**Event 16 is a close-date event, not a stage event.** The finance committee moved. Move the close date once, deliberately, to a date you believe — and note the push. Do not touch the stage; nothing about the buyer changed.

**Model the buying committee even if your platform resists.** Harlan Freight has an operations manager, a VP approver, and a finance committee. On a platform without contact roles you still need to record all three and what each is. State your convention and apply it every time.

**Choose an automation that pays for itself in this scenario.** The obvious candidates are inbound acknowledgement and assignment (events 1 and 5), the stale-opportunity nudge that would have caught event 11 two weeks earlier, or the recall-date reminder that makes event 13 a scheduled call rather than luck. Pick the one you can specify most precisely.

**Test the automation with your own contact details before you enable it.** Then check the enrollment count in the first hour. Every automation disaster in this course's failure table began with somebody skipping this step.

**Do the hygiene pass before the forecast, not after.** The forecast is arithmetic on the data. Cleaning up afterwards means you forecast from numbers you already knew were wrong.

**Your quota gap is $134,000** — $180,000 less the $46,000 already closed. Work out your coverage before you write the forecast narrative; it will tell you whether the honest story is "on track" or "short, and here is how much pipeline I need."

**Write the forecast for a skeptic.** Assume the reader will ask "why do you believe that?" about every line. If a commit deal's answer is "it feels good," it is not a commit deal.

**Write the handover note last and honestly.** It should include what you would fix if you had another four hours. Naming your own gaps is worth more than hiding them.
