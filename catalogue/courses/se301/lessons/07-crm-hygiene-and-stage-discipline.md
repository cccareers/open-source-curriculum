---
lesson_id: se301-07
course_id: se301
pathway: technical-sales-representative
title: CRM Hygiene and Stage Discipline
order: 7
kind: lesson
competency_ids:
  - D4-S1-C03
objectives:
  - Apply CRM hygiene rules that keep pipeline data trustworthy
---

## The pipeline nobody believes

There is a specific moment in every badly-run sales organization. A leader is presented with a pipeline number, they look at it for a few seconds, and they say: *"How much of that is real?"* Everybody in the room knows the number is not real. Nobody knows by how much. From that moment the CRM is no longer a system of record — it is a formality, and every decision that should have been made from data gets made from the loudest opinion instead.

That moment is not caused by dishonesty. It is caused by an accumulation of tiny, individually-defensible omissions: a close date left at last quarter's end because updating it felt like admitting defeat; a stage advanced after a good call rather than after a buyer commitment; an amount that was a guess in March and is still a guess in September; four deals that quietly died and were never closed out. None of those is a scandal. Together they are the difference between a pipeline you can forecast from and a list of hopes.

This lesson is the maintenance discipline that prevents it, and it is the direct prerequisite for the next one. A forecast is a calculation performed on this data. If the data is wrong, the arithmetic in lesson 8 is a very precise way of being wrong.

A boundary first: this lesson is about **keeping records accurate and current**. It is not about analyzing what the pipeline data reveals — conversion diagnosis, funnel analytics, and the discipline of reading a sales funnel are se305's subject. Here we are making the data worth analyzing.

## Data decays on its own

CRM data is not wrong because somebody broke it. It is wrong because the world moves and the record does not.

People change jobs constantly, so a meaningful share of your contact records goes stale every year without anyone touching them. Companies merge, rebrand, and get acquired. Phone numbers are reassigned. Deals slip, and the close date that was accurate when entered becomes wrong through the simple passage of time. Someone imports a list and creates three hundred near-duplicates of records you already had. A rep leaves and their entire book becomes ownerless.

The consequence is that hygiene is not a project. It is a **rate**: your data decays continuously, so your correction has to be continuous too. Organizations that treat cleanup as an annual event have bad data for eleven months a year. The habit this lesson builds is small, frequent correction — a few minutes daily, twenty minutes weekly — because that is the only rhythm that matches the rate of decay.

## Stage definitions: the artifact everything else rests on

Ask five reps on the same team what "Proposal" means and you will get five answers. One means a price has been discussed on a call. One means a document was emailed. One means the buyer has confirmed the document is being evaluated. Their aggregate pipeline by stage is meaningless, and so is every conversion rate derived from it.

The fix is a written stage definition with **exit criteria**: the specific, verifiable things that must be true before a deal may move to the next stage. Three properties make an exit criterion good.

**It is about the buyer, not you.** "Sent a proposal" is your action; you can do it to someone who has no intention of buying. "Buyer confirmed the proposal is under formal evaluation and named the approver" is a fact about them.

**It is verifiable.** Somebody else can look at the record and check. A named person, a date, a written confirmation, a completed step. "Good rapport established" is not verifiable and does not belong in a stage definition.

**It is binary.** True or false, no percentages. If a criterion needs a judgment call, either sharpen it or move the judgment to a separate confidence field where it belongs.

### A worked stage definition table

This is for a mid-market B2B software sale of roughly $50k–$250k. Yours will differ — the point is the *shape*, and that every stage has criteria a stranger could audit.

| # | Stage | The buyer's state | Exit criteria — all must be true to advance | Required fields | Typical duration |
| --- | --- | --- | --- | --- | --- |
| 1 | **Qualifying** | Somebody at the account has engaged; fit is not yet established | A business pain is recorded in the pain field; at least one contact with a named role; company meets fit criteria; buyer has agreed to a discovery conversation | Account, primary contact, source, indicative amount | 5–10 days |
| 2 | **Discovery** | The buyer has described a problem worth solving and there is a plausible purchase | Pain quantified in the buyer's own numbers; decision timeline stated by the buyer; budget confirmed or credibly estimated; economic buyer identified by name; second stakeholder engaged | Amount, close date, contact roles ≥ 2, qualification fields complete | 10–20 days |
| 3 | **Solution Validation** | The buyer believes the solution addresses their problem | Demonstration or evaluation completed with the technical evaluator present; buyer has confirmed the solution meets their stated requirements; open technical or security questions logged with owners and dates | Validation date, technical contact, requirements confirmation note | 10–25 days |
| 4 | **Proposal** | A priced, scoped offer is under formal evaluation | Written proposal delivered with scope, price and term; buyer confirmed receipt and that it is being evaluated; approval path and approver named; decision date confirmed by the buyer | Proposal date, quoted amount, approver name, decision date | 7–21 days |
| 5 | **Negotiation** | Commercial and legal terms are being resolved | Buyer has verbally selected you or confirmed you are the recommended vendor; open commercial terms itemized; legal/procurement process started with a named contact | Final amount, term, legal contact, mutual action plan link | 7–30 days |
| 6 | **Closed Won** | Signed | Executed contract or purchase order received; close date set to the day of signature; won reason recorded; handover to delivery scheduled | Signed date, final amount, won reason | — |
| 6 | **Closed Lost** | Not proceeding with you, now | Outcome confirmed by the buyer or the process demonstrably ended; loss reason recorded from the picklist; competitor recorded if displaced; recall date set if revisitable | Loss reason, competitor, recall date | — |

Alongside the table, four movement rules that a team has to agree once and then hold to.

**A stage is not advanced by activity.** Sending the proposal does not put you in Proposal. The buyer confirming they are evaluating it does. This single rule removes most stage inflation.

**Stages may be skipped, but skipping is recorded.** Real deals occasionally jump — an inbound buyer arrives with a signed budget and a deadline. Move the stage, but note why, because a stream of stage skips is a signal that the process no longer matches how you sell.

**Backward movement is legitimate and must not be punished.** A deal that loses its champion is genuinely earlier than it was. A culture where moving a deal back is treated as failure produces a pipeline where everything is in late stages and nothing closes. Move it back, note the reason, and move on.

**Stage never encodes the outcome by itself where the platform separates them.** If your platform has an explicit status field (as GoHighLevel does), a lost deal keeps the stage it reached and gets the lost status. Where won and lost *are* stages, closing out is a stage change. Know which your platform does — you will get this wrong exactly once.

## The three fields that carry the forecast

Stage discipline gets the attention. These three fields do at least as much damage when they slip.

### Close date

The close date is *your genuine expectation of when this deal will close*, and nothing else. It is not the end of the current quarter, not the date of the next meeting, and not the date you would like it to be.

The rules:

- **A close date in the past on an open deal is always a defect.** No exceptions. Either the deal closed and you have not recorded it, or your expectation was wrong and you have not updated it. Both need action today.
- **When it slips, move it once, deliberately, to a date you believe.** Moving it forward a week at a time, five weeks running, is the most common and most corrosive habit in CRM. Each individual move is small; the aggregate is a deal that has been "closing next week" for two months while the forecast counted it every time.
- **Count the pushes.** Where your system tracks it — a push counter field, or field history — a deal that has moved its close date three or more times is not a late deal, it is a deal with an unqualified assumption in it. Treat the third push as a trigger to re-qualify rather than to re-schedule.
- **Date the buyer's process, not your quarter.** If the buyer's board meets on the 12th of next month and approval happens there, the close date follows the board meeting. Pulling it into this quarter because that is when you need it is how a forecast becomes a wish list.

### Amount

- **One convention, applied by everyone.** Annual value, total contract value, or first-year billings — pick one, write it in the field description, and never mix. A pipeline containing both ARR and TCV is not a number.
- **Update it when scope changes**, not only at the end. A deal quoted at 180 seats that has become 90 seats is currently overstating your pipeline by half.
- **Where line items exist, maintain the line items.** The total should be derived, not typed.
- **Suspiciously round numbers are a signal.** A pipeline where a third of the deals are exactly $50,000 is a pipeline of placeholders that were never revisited.

### Next step

A short, dated, specific statement of what happens next: *"Security review call with their IT lead, Thursday 14th, invite sent."* Not "follow up."

The invariant, and it is the highest-yield rule in this lesson: **every open opportunity has a dated next step and a corresponding open activity in the system.** A deal without one is not being worked, whatever its stage says. Build the view that shows deals violating this rule and look at it every week; it will find dying deals faster than any dashboard in the company.

## Closing deals out

The hardest hygiene discipline is admitting a deal is over. Reps leave dead deals open because closing them reduces a visible pipeline number, and because a lost deal feels like a personal verdict. The cost of that avoidance is paid by everybody: an inflated pipeline, a forecast with junk in the denominator, and a company that never learns why it loses.

Make it easier by making the taxonomy honest. A loss reason picklist should distinguish between genuinely different outcomes:

| Loss reason | Means | What the company should learn |
| --- | --- | --- |
| Lost to competitor | They bought something else | Which competitor, and on what basis |
| Lost to in-house build | They solved it themselves | Where our value is thin |
| No decision — priority | Real problem, deprioritized | Timing signal; recall candidate |
| No decision — budget | Wanted it, could not fund it | Pricing or business-case signal |
| No decision — no champion | Our champion left or disengaged | Single-threading failure |
| Not qualified | Should never have entered the pipeline | Qualification failure, upstream |
| Price | Genuinely lost on commercial terms alone | Rare; check it is not a proxy for weak value |
| Went dark | Buyer stopped responding entirely | Engagement failure; often a symptom, not a cause |

Two notes on that table. **"No decision" is the most common outcome in B2B selling and it deserves its own reasons**, because it is a different problem from losing to a competitor and has different fixes. And **"price" is over-reported**: it is the easiest thing for a buyer to say and the least uncomfortable thing for a rep to write down. If half your losses are price, at least some of them are value.

Set a **recall date** on losses that are revisitable — the budget-timing loss is next year's best opportunity, and it will be missed unless a dated task exists.

## Duplicates

Duplicates split history: two records for the same company, each holding half of what you know, and two reps calling the same buyer in the same week.

**Prevent.** Search before you create — by email domain, by phone, by a *shortened* form of the company name. Most duplicates are created by someone searching "Calder Logistics Ltd" and not "Calder." Respect duplicate warnings when the platform raises them.

**Detect.** Run the duplicate detection your platform offers on a schedule. Look for the common generators: bulk imports, form fills with a different email address, company name variants (Inc., Ltd., Group, &/and), and people who changed employer.

**Merge carefully.** Merging is usually irreversible. Before merging: decide which record is the survivor (normally the one with the richest activity history and the most downstream references); check what will happen to related records; note that activity history generally follows the merge but some field values will be discarded; and check whether the record is referenced by an active automation or an integration. Merging is an operations action in most organizations — if you are not sure, escalate rather than experiment.

## The field hygiene checklist

This is the artifact to keep. Work it as a weekly pass over your own records; the frequency column tells you what deserves daily attention.

**Opportunities — every open deal**

- [ ] Close date is in the future. *(Daily — a past close date on an open deal is always a defect.)*
- [ ] Close date reflects the buyer's stated process, not the end of your period. *(Weekly)*
- [ ] Stage matches the written exit criteria; you could show a stranger the evidence. *(Weekly)*
- [ ] Next step is filled, specific, and dated. *(Weekly)*
- [ ] An open activity exists with a date. *(Weekly)*
- [ ] Amount reflects current scope and the team's stated convention. *(Weekly)*
- [ ] At least two contacts are associated, with roles, and one is the economic buyer. *(Weekly)*
- [ ] Activity has been logged in the last 14 days, or there is a documented reason. *(Weekly)*
- [ ] The forecast category or confidence field reflects your actual judgment. *(Weekly)*
- [ ] Deals past the point of realism are closed out, not left open. *(Weekly)*
- [ ] Close-date push count is under three; if not, re-qualify rather than re-schedule. *(Monthly)*

**Contacts and accounts**

- [ ] Email and phone present and correctly formatted. *(On touch)*
- [ ] Bounced emails flagged, not left as valid. *(On touch)*
- [ ] Job title and role current; departures marked rather than deleted. *(Quarterly)*
- [ ] Company associated correctly, especially for personal email addresses. *(On creation)*
- [ ] Lead status or lifecycle stage reflects reality; nobody sits in an in-progress value indefinitely. *(Weekly)*
- [ ] Opt-out and consent flags respected everywhere, no exceptions. *(Always)*
- [ ] No obvious duplicates in your own book. *(Monthly)*

**Closed records**

- [ ] Close date is the date it actually closed, not the date you got around to updating it. *(On close)*
- [ ] Loss reason selected from the picklist, honestly. *(On close)*
- [ ] Competitor recorded where displaced. *(On close)*
- [ ] Recall date set where the loss is revisitable. *(On close)*
- [ ] Won deals handed over with the delivery team notified. *(On close)*

**Your own configuration**

- [ ] Email and calendar sync connected and actually working. *(Monthly)*
- [ ] Your saved views still return what you think they return. *(Monthly)*
- [ ] No automation is firing on records you have taken over manually. *(Monthly)*

## The weekly ritual

Twenty minutes, same slot every week, before your manager's pipeline review rather than after it. Work from four saved views, in this order:

1. **Open deals with a close date in the past.** Fix every one. This view should end the session empty.
2. **Open deals with no next step or no open activity.** For each: schedule the real next step, or close the deal out.
3. **Open deals with no activity in 14+ days.** For each: act, agree a hold with a recall date, or close it out.
4. **Deals whose close date is inside the next 30 days.** For each, check the stage against the exit criteria and confirm the amount against current scope. These are the deals your forecast is about to be built from.

The reason to do it before the review is that hygiene done under questioning is defensive and hygiene done alone is honest. A rep who arrives at a pipeline review with these four views already empty spends the meeting discussing strategy instead of explaining data.

## Bulk cleanup without breaking things

Occasionally you will face a mess too large for record-by-record work — an inherited territory, a bad import. Bulk editing is available in every platform in this course and it deserves respect.

1. **Export first.** Always. The export is your undo.
2. **Scope with a saved view**, and read the record count before doing anything. If the count surprises you, stop.
3. **Pause automation.** A bulk field update is the classic trigger for a mass enrollment that emails thousands of people. This is the single most expensive mistake in this lesson.
4. **Test on ten records**, verify the result, and only then run the rest.
5. **Never bulk-close deals owned by other people** without their agreement. It is data-correct and organizationally catastrophic.
6. **Prefer archiving to deleting.** Deletion cascades in ways you will not predict, and the record you delete is the one somebody needed.
7. **Write down what you did**, when, and how many records were affected.

## Measuring hygiene

Hygiene is a habit, and habits need a number. These are the standard ones; track your own book, weekly, and expect the numbers to be embarrassing at first.

| Measure | Healthy | What a bad number means |
| --- | --- | --- |
| Open deals with a close date in the past | 0 | Nobody is maintaining the pipeline |
| Open deals with no next step | Under 10% | Deals are not being worked |
| Open deals with no activity in 14 days | Under 15% | Silent attrition in progress |
| Average close-date pushes per closed deal | Under 1.5 | Qualification is optimistic |
| Open deals with 2+ contact roles | Over 70% | Single-threading risk across the book |
| Closed-lost deals with a reason recorded | 100% | The company is learning nothing from losses |
| Deals closing this period at a late stage with no next step | 0 | The forecast is about to be wrong |

Two cautions. **Do not confuse the hygiene metric with the sales metric** — 100% of loss reasons recorded says nothing about whether you are winning. And **do not let hygiene metrics become a target that people game**: a team measured only on "no past close dates" will push every date forward a month, which is worse than the disease. Hygiene is inspected by reading a sample of records, not only by counting them.

## Practice

Work in an environment with real or realistic data; if you have no messy dataset, build one by creating fifteen opportunities and deliberately introducing the defects below.

**1. Write your stage definition table.** For a pipeline you own or one you build, produce the full table: stage number, name, the buyer's state in one sentence, exit criteria as a checklist of verifiable statements, required fields, and typical duration. Every criterion must be about the buyer and checkable by someone else. Then hand it to a peer and ask them to stage three of your live deals using only your table. Where you disagree, the criteria are ambiguous — rewrite them.

**2. Audit a pipeline against the checklist.** Take at least fifteen open opportunities and score each line of the opportunity checklist as pass or fail. Produce a table of the results and a total defect count. Identify the three most common defects.

**3. Fix them, and log the work.** Correct every defect: real close dates, honest stages, specific next steps, current amounts, closed-out dead deals with reasons. Keep a log of what you changed and why. For at least three deals, the correct action will be closing them as lost — write one sentence on how it felt to close each one, and what the pipeline number looked like before and after.

**4. Build the four ritual views** in your platform and screenshot each. Run the twenty-minute ritual once, timed, and record what you found and how long it actually took.

**5. Design your loss reason taxonomy.** Produce a picklist of six to ten loss reasons for your business, each with a one-sentence definition and the specific thing your company would learn from it. Justify why "price" is or is not on your list and what you would do to stop it absorbing losses that belong elsewhere.

**6. Write the standard.** One page, aimed at a new rep on your team: the stage definitions, the four movement rules, the close-date rule, the next-step invariant, the closing-out rules, and the weekly ritual. This is the deliverable a manager could actually adopt — write it so they could.
