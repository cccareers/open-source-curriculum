---
lesson_id: sn360-10
course_id: sn360
pathway: servicenow-implementation-specialist
title: Measuring Customer Service Performance
order: 10
kind: lesson
competency_ids:
  - D9-S1-C01
  - D9-S1-C03
  - D9-S1-C04
objectives:
  - Automate the collection of customer service KPIs and present them on a dashboard
---

## Reports answer questions; indicators answer trends

Two different tools, two different jobs, and the confusion between them wastes more implementation time than any other reporting mistake.

A **report** runs a query against live data and shows you the answer right now: how many cases are open, which accounts have the most, who is assigned what. It is always current, it costs a query every time someone opens it, and it can tell you nothing about the past — if you close a case, it vanishes from the open-case report and takes its history with it.

A **Performance Analytics indicator** stores a **score** on a schedule. Every night, a data collection job asks the question and writes the answer down with a date on it. Because the answers are stored, you can see whether the backlog is rising, whether last quarter's staffing change worked, and whether a customer's SLA attainment has drifted since renewal. That history cannot be reconstructed retroactively — an indicator you start collecting in June has no April.

The design rule follows directly. **Anything a manager will ask "is this getting better or worse?" about must be an indicator, and it must be turned on early.** Everything operational — my open cases, unassigned work, what breaches today — is a report or a list.

## Choosing the KPIs

A customer service dashboard with thirty tiles is a dashboard nobody reads. Pick the small set that answers the questions the business actually asks, and be able to defend every one.

Six that earn their place in almost every CSM implementation:

- **SLA attainment**, response and resolution, as a percentage met, broken down by entitlement tier. This is the contractual promise from lesson 04, measured. If you build one indicator, build this one.
- **Case backlog**, the count of open cases at each snapshot. A rising backlog is the earliest warning of an under-resourced team, and it is only visible as a trend.
- **Average and median time to resolve**, by case type. Report the median as well as the mean; a handful of ancient cases makes the mean useless.
- **Reopen rate**, cases moving from Resolved back to Open as a proportion of resolutions. The only cheap quality signal you have, and the reason lesson 03 insisted on keeping Resolved and Closed separate.
- **Self-service deflection**, from lessons 05 through 07: article views without a subsequent case, and Virtual Agent conversations contained without a transfer or case. This is the number that justifies the investment in the whole self-service surface.
- **Customer satisfaction**, from a survey triggered on closure. Track response rate alongside the score; a 4.6 from 3% of customers is not a measurement.

Two more worth having in a B2B implementation: **case volume by account**, which the account team will ask for, and **first-contact resolution**, which is worth building only if you can define it precisely enough to be comparable across teams.

A KPI needs four things to be real: a **definition** anyone can restate, a **source** that is a field you actually populate, a **target** somebody owns, and a **decision** it informs. If you cannot name the decision, do not build the tile.

## Automating the collection

An indicator has three parts, and the automation is in the third.

**The indicator source** defines the population: a table, a filter, and the field the collection reads. "Cases created" is a source with a condition on the case table. Get the filter right at the source, because everything downstream inherits it.

**The indicator** defines the measure: a count, a sum, an average, or a formula over other indicators. SLA attainment is a formula — met divided by total, expressed as a percentage — and formula indicators are the reason you build the components even when nobody asks for them individually.

**The data collection job** runs the collection on a schedule, usually nightly, and writes one score per indicator per breakdown element per day. This is the automation. Configure it and confirm it is running; an indicator with no collection job is a definition, not a measurement.

**Breakdowns** are what make one indicator answer twenty questions. Define a breakdown source on entitlement tier, one on assignment group, one on channel, and one on account, and a single "cases resolved" indicator now supports resolution volume by tier, by team, by channel, and by customer, with no additional collection to configure. Breakdowns multiply the stored scores, so apply them where they will be used rather than to everything by reflex.

Two operational habits. First, **collect history where you can**: many indicators support a historical backfill from existing records at setup, which gives you a trend on day one instead of in three months. Second, **watch the job**. A collection job that silently fails leaves a flat line on a chart that looks like stability, and a flat line nobody questions is the most dangerous artifact in a reporting stack.

## Building the dashboard

Dashboards are audience-specific. One dashboard for three audiences serves none of them.

**The agent view** is operational and mostly reports: my open cases ordered by SLA remaining, cases awaiting my response, my work items from lesson 08. Current data, no history.

**The team lead view** mixes both: today's queue depth and breach risk as reports, backlog trend and SLA attainment trend as indicator charts, unassigned work as a list they can act on.

**The service manager view** is almost entirely trends: SLA attainment by tier over twelve weeks, backlog, reopen rate, deflection, and CSAT, each against its target. Add a breakdown selector for account so a question about one customer does not require a new dashboard.

Layout rules that hold everywhere: the most important number top-left, targets shown on the chart rather than in a caption, absolute counts alongside percentages so a 100% attainment on two cases is visible for what it is, and no tile without an owner. Review the dashboard with its audience after four weeks and delete whatever nobody has used — an unused tile is a query cost and a distraction.

## Worked example: the Northwind service review

The customer wants a monthly service review pack per account. Working backwards from that meeting:

| Question asked in the meeting | Measurement |
| --- | --- |
| Did you meet the contract? | SLA attainment formula indicator, breakdown by account and tier, target 95% |
| Is our volume changing? | Cases created indicator, breakdown by account and channel, twelve-week trend |
| Are things taking longer? | Median time to resolve indicator, breakdown by case type |
| Are you fixing things properly? | Reopen rate formula indicator, target under 5% |
| Is self-service working? | Deflection indicator from portal and Virtual Agent events |
| Are we happy? | CSAT indicator with response rate shown beside it |

Six indicators, four breakdowns, one nightly collection job, one dashboard with an account filter. That is the whole build, and it is achievable inside the two hours this lesson budgets *if* the fields the indicators read are populated — which is the payoff for the channel stamping in lesson 03, the entitlement in lesson 04, and the deflection events in lessons 05 and 07. Measurement is not a phase at the end of a project; it is the reason to be disciplined about data at the start of one.

## Practice

1. **Define three KPIs properly.** For SLA attainment, backlog, and reopen rate, write the definition, the source field, the target, and the decision each one informs. Reject any that you cannot complete.

2. **Build the indicators.** Create the indicator sources and indicators for cases created, cases resolved, and SLAs met, then build SLA attainment as a formula indicator over them.

3. **Add breakdowns.** Configure breakdowns on entitlement tier and on account, and confirm one indicator now answers both "how are we doing overall" and "how are we doing for Northwind."

4. **Automate collection.** Schedule the data collection job nightly, run it manually once, and verify scores were written. Then backfill history where your indicators support it and confirm the trend chart is populated.

5. **Build the manager dashboard.** Assemble the six-tile service manager view with targets displayed on the charts and an account breakdown selector. Include at least one operational report alongside the trends and explain in one sentence why that tile is a report rather than an indicator.

6. **Break the collection.** Disable the collection job for two days, then look at the dashboard. Describe what a viewer would wrongly conclude, and configure the monitoring that would have told them instead.

## Check your understanding

1. A manager asks whether backlog is improving. Report or Performance Analytics indicator?
2. Why show the median time to resolve alongside the mean?
3. SLA attainment reads 100%. What should be beside it on the tile?
4. The collection job silently stopped two days ago. What does the dashboard look like, and what monitoring prevents the wrong conclusion?

*Answers:* (1) An indicator; trends need stored, dated scores. (2) A few very old cases distort the mean. (3) The absolute count, so 100% of two cases is visible for what it is. (4) A flat line that looks like stability; monitor the collection job and alert when it does not run.
