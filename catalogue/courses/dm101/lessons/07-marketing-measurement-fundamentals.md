---
lesson_id: dm101-07
course_id: dm101
pathway: digital-marketer
title: Marketing Measurement Fundamentals
order: 7
kind: lesson
competency_ids:
  - D6-S1-C02
objectives:
  - Select the right KPIs for a campaign goal and read a basic performance report
  - Trace a conversion back through the channels that contributed to it
---

## Metrics, KPIs, and the difference that matters

Analytics tools will happily hand you two hundred numbers. Almost all of them are **metrics** — anything that can be counted. A **key performance indicator** is the small subset of metrics that tell you whether you are achieving a stated goal, chosen in advance, with a target attached.

The test for whether a number is a KPI is blunt: **if it moved, would anyone do anything differently?** If the answer is no, it is not a KPI for this campaign. It might be a diagnostic — useful for explaining *why* a KPI moved — or it might be a vanity metric, a number that reliably goes up and never changes a decision.

| Kind | Example | Use |
| --- | --- | --- |
| KPI | Cost per booked demo | Judges the campaign; has a target |
| Diagnostic | Click-through rate | Explains where a KPI broke |
| Vanity | Total impressions, follower count | Reports well, decides nothing |

Impressions are not inherently vanity — for a pure brand-awareness campaign, reach *is* the goal. What makes a metric vanity is using it as evidence for a goal it does not measure. This lesson is about choosing correctly and reading honestly. Tool configuration and analytics platform work belong to the analytics course later in this pathway.

## Choosing KPIs from the goal

Work in one direction only: **goal, then KPI, then diagnostics.** Never start from what the tool reports.

| Campaign goal | Primary KPI | Supporting diagnostics |
| --- | --- | --- |
| Make a new audience aware of a product | Reach, or unique reached in the target segment | Frequency, video view-through, brand search volume |
| Get people to consider you | Qualified sessions, guide reads, return visits | Pages per session, scroll depth, time on page |
| Generate leads | Cost per qualified lead | Form starts vs completions, lead-to-qualified rate |
| Generate sales | Revenue, and cost per acquisition (CPA) or return on ad spend (ROAS) | Add-to-cart rate, checkout completion, average order value |
| Retain customers | Repeat purchase rate, churn rate | Email engagement, product usage frequency |
| Grow advocacy | Referral rate, review volume and rating | Net promoter-style survey score, share rate |

Two rules make this stick.

**One primary KPI per campaign.** A campaign with four equally weighted KPIs cannot be judged, because the four will disagree and whoever is presenting will pick the flattering one.

**Set the target before the campaign runs.** "We got 340 leads" is not a result; it is a number. "We got 340 leads against a target of 250, at $41 CPA against a $60 ceiling" is a result. Targets set afterward are always met.

### Definitions people get wrong

Precision here prevents a lot of pointless argument.

- **Impressions** — times an ad or post was displayed. **Reach** — distinct people who saw it. Impressions divided by reach is **frequency**.
- **Sessions** are visits; **users** are people. One user can produce many sessions. Reporting sessions as "customers" is a common inflation.
- **Click-through rate (CTR)** = clicks ÷ impressions.
- **Conversion rate** = conversions ÷ some denominator — *always state the denominator*. Conversions per session, per user, and per click are three different numbers and people quote them interchangeably.
- **Cost per acquisition (CPA)** = spend ÷ conversions.
- **Return on ad spend (ROAS)** = revenue ÷ ad spend. A 4:1 ROAS is not 4:1 profit; it ignores cost of goods, labor, and overhead.
- **Bounce rate / engagement rate** — a session with no meaningful interaction. Interpret with care: a high bounce rate on a page whose only job is to give a phone number is fine.
- **Customer lifetime value (LTV)** — total margin expected from a customer. The number that decides how much a CPA is allowed to be.

That last pair is the most important relationship in performance marketing. A $90 CPA is catastrophic if a customer is worth $60 and excellent if a customer is worth $700. **A CPA has no meaning without an LTV to compare it to.**

## Reading a performance report

Reading a report well is a repeatable procedure, not an intuition.

**Step 1 — Ask what the goal was.** Without it you cannot tell a good report from a bad one.

**Step 2 — Find the primary KPI and compare it to the target.** Everything else is commentary.

**Step 3 — Walk the funnel and find the worst step.** Every campaign is a chain of conversion steps. Locate the step where the biggest proportional drop happens; that is where the leverage is.

**Step 4 — Compare, do not admire.** A number alone means nothing. Compare against target, against the prior period, and against another segment or channel.

**Step 5 — Check the volume behind the rate.** A 12% conversion rate on 17 visitors is not a finding. Small numbers move violently; do not act on a rate computed from a handful of events.

**Step 6 — Ask what would have happened anyway.** Some of the "campaign" conversions would have occurred without it. This is incrementality, and it is why a channel that mostly reaches existing customers can look extraordinary and add little.

### A worked read

A tutoring company ran three channels in one month with a goal of booked trial sessions. Target: 150 trials at a CPA under $70. A trial converts to a paying student 30% of the time, and a paying student is worth $840 in gross margin.

```text
Channel        Spend   Sessions  Trial-page  Trials  CPA    Conv rate
                                 views              (per session)
Paid search   $5,200     4,100      1,230      118  $44.07     2.88%
Paid social   $3,900     9,600        960       26  $150.00    0.27%
Email             $0     2,300        690       61   $0.00     2.65%
Total         $9,100    16,000      2,880      205  $44.39     1.28%
```

**Primary KPI:** 205 trials against a target of 150, at a blended $44 CPA against a $70 ceiling. The campaign hit its goal.

**Worst step:** Paid social. It bought the most sessions of any channel and produced the fewest trials, at more than triple the ceiling CPA. Look one level deeper: 9,600 sessions produced only 960 trial-page views, a 10% rate against paid search's 30%. The problem is not the trial page — it is that paid social traffic mostly never reaches it. That points at targeting or at a landing page that does not match the ad's promise, not at the booking form.

**Is paid social a failure?** Not necessarily, and this is where the earlier lessons matter. Paid social was carrying awareness. To judge it, you need to know whether branded search volume and direct traffic rose during the month, and whether people who first arrived from social converted later through another channel. Judging an awareness channel by last-click trials will always condemn it.

**The economics.** 205 trials × 30% = about 62 paying students × $840 = roughly $52,000 in gross margin against $9,100 of spend. That is the number that justifies the budget, and it also tells you the CPA ceiling was probably set too conservatively — at $840 LTV and 30% trial-to-paid, each trial is worth about $252, so a $70 CPA leaves a very large margin. The most useful recommendation in this report may be "raise the ceiling and buy more volume in paid search."

Note what the report does *not* support: any claim about which single ad, creative, or keyword deserves credit. Aggregate channel numbers cannot answer that.

## User behavior: reading what people did on the page

KPIs tell you whether the outcome happened. Behavior reports tell you why. Four behavior views cover most of what a generalist needs.

**Funnel or path report.** Counts of people at each step: landing page, product page, cart, checkout, purchase. This is where you find the leaking step. Always look at absolute counts as well as rates — a 60% drop on a step 40 people reach is a smaller problem than a 20% drop on a step 9,000 reach.

**Landing page report.** Sessions, engagement, and conversion broken out by the page people arrived on. Two pages receiving equal traffic and converting at 4% and 0.4% is one of the most actionable findings available.

**Segment comparison.** The same funnel split by device, by new versus returning, by source, or by geography. Aggregate numbers hide the finding. A checkout that converts at 4.1% on desktop and 0.6% on mobile is almost always a broken mobile form, and the blended 2.3% tells you nothing.

**Site search and on-page interaction.** What people typed into your search box, where they scrolled to, what they clicked. Repeated internal searches for a term you do not carry, or for a page that exists but is unfindable, is direct product feedback.

The discipline for all four: **look for the biggest gap, then form one hypothesis, then test it.** Behavior data suggests; it does not prove. A page with a 90-second average time on page might be engrossing or confusing, and only a test or a user session will tell you which.

## Tracing a conversion back through channels

A conversion almost never has one cause. A realistic path:

```text
Day 1   Saw a paid social video ad                 (no click)
Day 3   Searched "math tutor for 8th grader",
        clicked an organic blog post
Day 3   Subscribed to the parent newsletter
Day 8   Opened newsletter email 2, clicked through
Day 11  Searched the brand name, clicked the paid brand ad
Day 11  Booked a trial session
```

**Attribution** is the rule you use to assign credit across those touches. The common models:

| Model | Credit goes to | Bias |
| --- | --- | --- |
| Last click | Paid brand ad (day 11) | Overcredits closing channels; makes brand search look miraculous |
| First click | Paid social (day 1) | Overcredits discovery; ignores what closed it |
| Linear | Split evenly across the four channels (paid social, organic search, email, paid search) | Treats a passive impression as equal to the decisive click |
| Time decay | Weighted toward day 11 | Reasonable default; still arbitrary |
| Position-based | 40% first, 40% last, 20% middle | Recognizes discovery and close, undervalues nurture |

The right conclusion is not "use model X." It is: **every model is a convention, so state which one you used, use it consistently, and never compare two reports built on different models.** Most organizational arguments about which channel "works" are really two people quoting different attribution models at each other.

Three practical points:

**Tag your links.** Campaign parameters appended to URLs (a source, a medium, and a campaign name) are how an analytics tool knows an arriving visit came from your newsletter rather than from generic "direct" traffic. Untagged links are the single largest cause of unattributable traffic. Agree a naming convention and use it everywhere. The widely used convention is a set of "UTM" parameters. For example, the button in newsletter email 2 might link to:

```text
https://example-tutoring.com/trial?utm_source=newsletter&utm_medium=email&utm_campaign=parent_nurture_2
```

`utm_source` names who sent the visit (the newsletter), `utm_medium` names the channel type (email), and `utm_campaign` names the specific effort. Keep values lowercase and consistent — `Email`, `email`, and `e-mail` show up as three different channels in most reports.

**Expect gaps.** Cross-device journeys, privacy settings, ad blockers, cookie expiry, and app-to-browser hops all break the chain. A meaningful share of conversions will land in "direct" or "unassigned" and no amount of tooling fully fixes it. Report the gap; do not quietly redistribute it.

**Use holdouts when the stakes are high.** The cleanest way to know whether a channel adds anything is to turn it off for a comparable region or audience for a defined period and compare total conversions, not attributed ones. That measures incrementality, which is what the business actually cares about.

## Benchmarks, and why your own history beats them

New marketers reach for industry benchmarks — "the average email open rate is X," "a good conversion rate is 2%." Use them with care, for three reasons.

**They average incomparable things.** "Ecommerce conversion rate" pools a $9 impulse buy and a $2,400 mattress. The mattress site converting at 0.5% may be outperforming the impulse site converting at 4%.

**Definitions differ across sources.** Conversion per session and conversion per user can differ by a factor of two, and published benchmarks rarely say which they used.

**They cannot tell you whether *you* improved.** That is the only question a campaign report has to answer.

Benchmarks have one legitimate use: a sanity check on an order of magnitude. If your email open rate is 3% and everyone's is around 25%, something is broken — probably deliverability — and that is worth knowing. Beyond that, **your own trailing three to six months, segmented, is the only benchmark that should drive a decision.** Establish it early, write the definitions down, and compare against yourself.

A related discipline: record the **baseline before the campaign starts.** If organic bookings were running at 40 a month and the campaign month produced 62, the campaign's contribution is 22, not 62. Teams that skip the baseline routinely claim credit for demand that already existed, which is how a channel survives three budget cycles without ever having worked.

## How measurement goes wrong

Six failure modes account for most bad marketing analysis. Learn to spot them in other people's reports and, harder, in your own.

**Small numbers read as signal.** A variant that converts 3 of 40 versus 1 of 38 is not a 3x improvement; it is noise. Before acting on a difference, ask how many conversions — not sessions — sit behind it. Dozens of conversions per side is a reasonable floor for taking a result seriously.

**Seasonality mistaken for performance.** December is not October. Compare like periods — this month against the same month last year, or against a control group running at the same time — before congratulating anyone.

**Changing the definition mid-flight.** If "lead" meant a form fill in March and includes chat conversations in April, the April improvement is an accounting change. Write metric definitions down, and date them.

**Correlation presented as cause.** Traffic rose the week the campaign launched, and also the week a competitor had an outage and a trade publication mentioned you. Only a holdout or a controlled test separates those.

**Optimizing a proxy until it stops representing the goal.** Chase click-through rate hard enough and you will get clickbait: more clicks, fewer customers. Whenever you optimize a diagnostic, keep the primary KPI in the same report so you can see if the trade went bad.

**Reporting the number that flatters.** The most common and least technical failure. The defense is procedural: set the target and the metric definition before the campaign runs, and report against them regardless of outcome.

### Reporting to a stakeholder

A report is a decision document, not a data dump. A structure that works, in one page:

```text
1. The goal and the target        (one line)
2. The result against target      (one number, plus or minus)
3. Why                            (the worst step, with its numbers)
4. What I recommend               (one or two actions, each with a cost)
5. What I cannot tell you yet     (and what it would take to find out)
```

Three habits make it credible. **Lead with the answer**, not with methodology. **Show the arithmetic** for any economic claim, so the reader can check it rather than trust it. And **state the uncertainty explicitly** — a report that admits attribution gaps and small-sample limits is trusted more, not less, and it protects you when someone acts on a number you never claimed was precise.

## Practice

**Part 1 — Goal to KPI.** For each of the four campaigns below, name the single primary KPI with a target you would propose, two diagnostics, and one metric you expect a stakeholder to ask for that you would explicitly refuse to judge the campaign by. Justify each refusal in one sentence.

1. A regional gym wants membership signups in January.
2. A B2B software firm wants to be shortlisted by buyers who currently do not know it exists.
3. A charity wants existing monthly donors to increase their gift.
4. A local restaurant wants more takeaway orders on Tuesdays and Wednesdays.

**Part 2 — Read a report.** Using the tutoring table in this lesson, write a one-page report for the owner containing: whether the goal was met and by how much, the single worst step with the numbers that identify it, one recommendation for paid social with the evidence behind it, one recommendation about budget with the LTV arithmetic shown, and one thing you cannot conclude from this data and what you would need in order to conclude it.

**Part 3 — Trace and attribute.** Take the six-touch path in this lesson. Assign credit for one $840 customer under last click, first click, and position-based attribution, showing the dollar figure each channel receives under each model. Then answer: which channel looks worst under last click, what would happen to total trial volume if it were cut on that basis, and what single test would you run to find out before cutting it?
