---
lesson_id: dm250-06
course_id: dm250
pathway: digital-marketer
title: Social Media Analytics
order: 6
kind: lesson
competency_ids:
  - D4-S1-C03
objectives:
  - Measure social campaign effectiveness with platform and web analytics
  - Distinguish vanity metrics from metrics tied to business outcomes
---

## Every Metric Belongs to One Link in a Chain

Social measurement gets confusing because platforms hand you forty numbers with no indication of which ones matter. The fix is to stop treating them as a list and start treating them as a **chain**. Every metric measures one link, and a metric is only meaningful in relation to the link before it.

```txt
EXPOSURE      how many people the content reached
   |          reach, impressions, frequency
   v
ATTENTION     how many of them actually consumed it
   |          view time, watch-through rate, carousel completion
   v
RESPONSE      how many did something about it
   |          saves, shares, comments, follows, profile visits
   v
VISIT         how many left the platform for something you own
   |          outbound clicks, sessions by source/medium
   v
OUTCOME       how many did the thing the business needs
              subscriptions, orders, revenue, wholesale enquiries, footfall
```

Two rules fall out of the chain and they resolve most arguments about social reporting.

**A number is only interpretable as a ratio to the link above it.** Ninety-six comments is meaningless. Ninety-six comments on 4,120 reach is extraordinary; ninety-six comments on 400,000 reach is a dead post. Always carry the denominator.

**Losses compound downward.** Every link loses most of the people from the link above. A campaign is rarely failing at one point; it is usually leaking modestly at four, and the compounding makes the outcome look catastrophic. Locating *which* link is leaking is the whole diagnostic skill, and it is impossible if you only look at the top and the bottom.

## Definitions, and the Traps in Them

**Reach and impressions are different, and the difference is the third number.** Reach counts people; impressions count views; frequency is impressions ÷ reach. A July Fernwood Reel drew 51,200 impressions against 38,400 reach:

```txt
Frequency = 51,200 / 38,400 = 1.33
```

Each person saw it about one and a third times. That is healthy for organic. On paid, a frequency climbing past 4 or 5 with flat results is usually the explanation for a campaign that "stopped working."

**"Engagement rate" is three different numbers wearing the same name.** Take the same Reel: 2,940 likes, 61 comments, 42 saves, 88 shares — 3,131 engagements total. Fernwood has 9,850 followers.

```txt
Engagement rate per reach       = 3,131 / 38,400 =  8.15%
Engagement rate per impression  = 3,131 / 51,200 =  6.12%
Engagement rate per follower    = 3,131 /  9,850 = 31.79%
```

Three defensible rates from one post, ranging from 6% to 32%. Agencies quote the follower denominator because it is the flattering one, especially for a post that reached far beyond the follower base. **Pick one denominator, write it down, and never change it mid-year** — otherwise every trend in your reporting is an artifact of the definition.

Per-reach is the right default for content evaluation, because it asks "of the people who saw this, how many responded," which is the actual question.

**Not all engagements are equal.** Sort them by what they cost the person:

```txt
Like        costs nothing, means almost nothing
Comment     costs a few seconds, means something, gameable with "comment YES"
Save        costs nothing but implies future intent - a strong quality signal
Share       costs social credit - the strongest organic signal there is
Follow      a commitment to see more
Profile visit  the person actively went looking for you
```

Lesson 05's promotion gate used saves and shares for exactly this reason. When you compress engagements into one blended rate you throw the quality signal away.

**Follower count is a stock, not a flow.** What matters is net growth *and its source*. 240 new followers in a month where 90 unfollowed is +150 net, and if 200 of the 240 came from one viral Reel about a topic you never post about again, that is not audience growth, it is churn on a delay.

**Follow the attribution windows.** Platform-reported conversions are typically credited within a click window (often seven days) and sometimes a view window (often one day) — meaning someone who *saw* the ad and bought the next day may be counted. Web analytics generally does no such thing. This is not a bug in either tool; it is two tools answering different questions, and knowing which question each answers is most of what separates a competent analyst from a confused one.

## Vanity Metrics, Defined Properly

A vanity metric is not "a metric I dislike." It is a metric with two specific properties: **it can rise while the business is flat**, and **no decision depends on it**. That second test is the sharper one. If you cannot name the decision a number would change, you are looking at decoration.

| Metric | Chain link | Vanity or outcome | The decision it changes |
| --- | --- | --- | --- |
| Follower count | Exposure | Vanity | None on its own. Net growth *by source* informs content mix |
| Impressions | Exposure | Vanity alone | With frequency, it tells you when to refresh creative |
| Reach | Exposure | Diagnostic | Denominator for everything below it |
| Likes | Response | Vanity | None. Cheapest possible signal |
| Comments | Response | Diagnostic | Content themes; community health |
| Saves per 1,000 reached | Response | **Leading indicator** | What to make more of; what to promote |
| Shares per 1,000 reached | Response | **Leading indicator** | What to promote; what has reach potential |
| Profile visits | Response | Diagnostic | Whether the content makes people curious about the brand |
| Outbound link clicks | Visit | Diagnostic | Whether the call to action and the offer work |
| Sessions from social | Visit | **Outcome-adjacent** | Traffic budget; landing page priorities |
| Subscription starts from social | Outcome | **Outcome** | Whether the channel gets more budget |
| Revenue and gross profit from social | Outcome | **Outcome** | Everything |
| Cost per subscription start | Outcome | **Outcome** | Whether to scale, hold, or stop |
| Wholesale enquiries from LinkedIn | Outcome | **Outcome** | Whether LinkedIn keeps its slots |

Vanity metrics are not forbidden. Reach and impressions are *necessary* — they are the denominators. The error is **reporting them as results**. "We reached 118,000 people in July" is a description of a cost, not an achievement.

### The worked case that makes this concrete

Two July posts. One is the kind everybody celebrates; the other pays for the quarter.

```txt
                              Post A: Reel        Post B: Carousel
                              "One morning,       "Sour coffee is not
                               three cafes"        bad coffee"

Reach                              38,400                 4,120
Impressions                        51,200                 4,760
Likes                               2,940                   388
Comments                               61                    96
Saves                                  42                   118
Shares                                 88                    74
Profile visits                        310                   640
Outbound link clicks                   24                   214
Sessions (web analytics)               19                   186
Subscription starts                     0                    11
One-off orders                          1                     6
```

Post A reached 9.3 times as many people (38,400 ÷ 4,120 = 9.32) and collected 7.6 times the likes. Now push both to the bottom of the chain, using Fernwood's economics from lesson 05: lifetime gross profit per subscriber $63.84; gross profit per one-off order $22.08; loaded labour cost $28 per hour.

```txt
POST A
  Gross profit  = (0 x $63.84) + (1 x $22.08)          = $22.08
  Production    = 3.5 h filming, scripting, editing
                = 3.5 x $28                            = $98.00
  Contribution  = $22.08 - $98.00                      = -$75.92
  Gross profit per 1,000 reached = $22.08 / 38.4       = $0.58

POST B
  Gross profit  = (11 x $63.84) + (6 x $22.08)
                = $702.24 + $132.48                    = $834.72
  Production    = 1.0 h copy and card layout
                = 1.0 x $28                            = $28.00
  Contribution  = $834.72 - $28.00                     = $806.72
  Gross profit per 1,000 reached = $834.72 / 4.12      = $202.60
```

Post B produced **37.8 times** the gross profit of Post A ($834.72 ÷ $22.08) from **one ninth** the reach, at **one third and a half** the production cost. Per thousand people reached it was 349 times more valuable ($202.60 ÷ $0.58).

Read the chain to see *why*, because the answer is not "carousels beat Reels." Post A converted 310 profile visits from 38,400 reach — 0.81% — and then 24 outbound clicks from those visits, 7.7%. Post B converted 640 profile visits from 4,120 reach — **15.5%** — and 214 outbound clicks from those, **33.4%**. Post A reached a huge audience with no relationship to the product; Post B reached a small audience of people with a coffee problem it had just named. The failure was at the response link, and it was a **targeting-by-topic** failure, not a format failure.

Two honest caveats, because a good analyst supplies them unprompted. The $63.84 is *lifetime* gross profit realized over seven months, while the $28 is spent today — so Post B's contribution is real but not yet collected. And Post A's 38,400 reach has some brand value that no attribution model will ever credit to it. Neither caveat rescues a 349-fold difference, but both belong in the report.

## Two Data Sources, and Why They Disagree

You need both, and they will never match. Understanding *why* is the difference between a report you can defend and one that falls apart in a meeting.

**Platform analytics** sees everything that happens inside the platform: who was reached, how long they watched, who saved, who clicked. It cannot see what happened on your website unless you install its tracking, and it reports on its own work using its own attribution windows. It is the only source for exposure, attention, and response.

**Web analytics** sees everything that happens on your site: sessions, source and medium, pages, conversions, revenue. It cannot see reach, watch time, or saves. It usually credits the last non-direct click and cannot see anyone who was influenced without clicking.

The join between them is **UTM parameters** — tags appended to the links you post so your web analytics can attribute the session correctly. Without them, a chunk of social traffic lands in "direct" and the channel gets no credit for revenue it created.

A convention for the Fernwood calendar. Lowercase, no spaces, and a controlled vocabulary for `utm_medium` so the channel reports group properly:

```txt
?utm_source=instagram&utm_medium=social_organic&utm_campaign=brew_better_q3&utm_content=jul06_carousel_sour
?utm_source=instagram&utm_medium=social_organic&utm_campaign=brew_better_q3&utm_content=jul08_story_link
?utm_source=facebook&utm_medium=social_organic&utm_campaign=grind_clinic_jul&utm_content=jul10_event_link
?utm_source=linkedin&utm_medium=social_organic&utm_campaign=wholesale_q3&utm_content=jul16_doc_checklist
?utm_source=instagram&utm_medium=paid_social&utm_campaign=q3_overlay&utm_content=asset2_reel_twoclicks_rung1
?utm_source=instagram&utm_medium=paid_social&utm_campaign=q3_overlay&utm_content=asset3_carousel_sour_rung5

RULES
- utm_medium is a closed list: social_organic | paid_social | email | referral
- utm_source is the platform, never the format
- utm_campaign matches the pillar or the paid plan, so reports roll up
- utm_content identifies the specific post, dated, so a row is traceable
- NEVER put UTMs on internal links between your own pages - it restarts
  the session and destroys the original attribution
```

**Expect the two sources to disagree, and quantify the gap.** Fernwood's July:

```txt
Platform-reported outbound link clicks              731
Web analytics sessions from social                  588
Gap                                            143 (19.6%)

Plausible causes, in rough order of size:
  people who tapped and left before the page loaded
  browser tracking prevention and ad blockers
  in-app browser handoffs that drop the parameters
  the platform counting a click on any part of the post
  untagged links posted without UTMs
```

A ~20% gap between reported clicks and landed sessions is ordinary. A 60% gap is a tracking defect and needs investigating before any conclusion is drawn from either number.

The conversion counts diverge for a different reason:

```txt
Platform-reported conversions (7-day click, 1-day view)     47
Web analytics orders, last non-direct click                 41
```

Neither is wrong. The platform is answering "how many buyers had contact with our ads recently"; web analytics is answering "how many sessions that arrived from social ended in a purchase." **Report both, label the window on each, and never average them.**

**And measure the part neither tool sees.** People discover brands through screenshots, group chats, and word of mouth — traffic that lands as "direct" no matter how good your tagging is. The cheap correction is a one-question, optional field at checkout: *How did you first hear about us?* Fernwood's July:

```txt
Total July DTC orders                                       214
  Self-reported "Instagram" or "TikTok"                63  (29.4%)
  Web analytics attributed to social, last non-direct   41  (19.2%)
```

Self-reported attribution is imprecise and biased toward memorable channels. It is still the only evidence Fernwood has that social's real contribution is meaningfully larger than the 41 orders web analytics credits it with, and a report that omits it systematically undersells the channel.

## The Monthly Report

The report exists to drive three decisions: what to make more of, where to move budget, and whether the channel is worth its cost. Anything that serves none of those is decoration.

```txt
FERNWOOD SOCIAL REPORT - JULY                    Prepared by Tomas, 2 Aug

                                    Jun        Jul     Change
EXPOSURE
  Posts published                    13         14        +1
  Reach                          71,300    118,400      +66%
  Followers, net                 +9,610     +9,850      +240 net (+2.5%)
RESPONSE
  Median saves per 1,000 reached   10.9        9.4      -14%
  Median shares per 1,000 reached   6.3        7.1      +13%
  Profile visits                  2,180      3,940      +81%
VISIT
  Outbound link clicks              486        731      +50%
  Sessions from social              402        588      +46%
OUTCOME
  DTC orders from social             27         41      +52%
  of which subscription starts       21         34      +62%
  Wholesale enquiries, LinkedIn       2          3        +1

RATIOS
  Profile visits / reach       3,940 / 118,400  =  3.33%   (Jun 3.06%)
  Link clicks / profile visits   731 /   3,940  = 18.55%   (Jun 22.29%)
  Sessions / link clicks         588 /     731  = 80.44%   (Jun 82.72%)
  Orders / sessions               41 /     588  =  6.97%   (Jun 6.72%)
  Orders / reach                  41 / 118,400  =  0.035%  (Jun 0.038%)

MONEY
  Gross profit
    34 subscription starts x $63.84             = $2,170.56
     7 one-off orders x $22.08                  =   $154.56
                                                  ---------
                                                  $2,325.12
  Cost
    Labour 12 h/wk x 4.3 wks x $28              = $1,444.80
    Paid social                                 = $1,200.00
                                                  ---------
                                                  $2,644.80
  Contribution                                  =  -$319.68
  Note: the $2,170.56 is lifetime gross profit realized over ~7 months;
  the cost is incurred this month. On a first-month cash basis, July's
  subscription revenue is 34 x $19 x 0.48 = $310.08.
```

Three things about the format. **It carries denominators**, so nobody has to ask. **It reports the ratios between adjacent chain links**, which is where diagnosis happens. And **it puts labour in the cost line**, because 51.6 hours a month is the largest thing social costs Fernwood and leaving it out makes every channel look free.

## Baselines Beat Month-Over-Month

Comparing to last month is the single most common source of false conclusions in social reporting, because one viral post moves every exposure metric for the whole month.

Two better habits. Compare against a **rolling median of the last six months**, which is resistant to exactly that distortion. And **compare like with like**: the median post's saves per thousand is a fairer read of content quality than a total that one outlier dominates.

Then be honest about small numbers. Fernwood's wholesale enquiries went from 2 to 3. That is a 50% increase and it is nothing — with counts that small, the difference between 2 and 3 is one person having a slow Tuesday. A working rule for a report: **below about 30 results, report the count and refuse to compute a percentage change.** When you genuinely need to know whether a difference is real, that is a controlled test with a sample-size calculation, which the paid advertising course covers properly. Do not improvise it here.

## Reading July Into Decisions

**Diagnosis 1 — reach is up 66% and orders per reach fell.** Orders rose 52%, so the month was good. But orders per reach slipped from 0.038% to 0.035%, meaning the extra reach converted worse than the baseline reach did. Look at where it came from: the "One morning, three cafés" Reel supplied a large share of July's exposure and produced one order. **Decision:** the pillar mix is fine, but Café Life video is being made for the wrong objective — it reaches people nowhere near Asheville. Either geo-constrain the paid support behind it or judge it on café footfall rather than DTC orders. Do not stop making it; stop counting it in the DTC line.

**Diagnosis 2 — link clicks per profile visit dropped from 22.3% to 18.6%.** Profile visits rose 81% while clicks rose only 50%, so more people arrived at the profile and fewer went further. The leak is between response and visit, and the most likely cause is the profile itself — the bio link still pointed at the homepage all month while the content was about grind size. **Decision:** point the link at the grind guide, add the subscription as a second destination, and re-measure in August. This costs ten minutes and is the highest-value change in the report.

**Diagnosis 3 — contribution is negative $319.68.** Say it plainly and then qualify it correctly. On fully loaded costs including labour, July's social did not pay for itself. The qualification is real: $2,170.56 of that gross profit arrives over seven months, subscriber churn could reduce it, and the self-reported data suggests social influenced roughly 63 orders rather than 41. **Decision:** do not cut the channel on one month of data. Do add subscriber retention to the report — if the seven-month average life is wrong, every number in the money section is wrong — and re-run the contribution line quarterly rather than monthly, since the cost is monthly and the return is not.

Notice that all three decisions are small, specific, and attached to a number. That is what a good report produces. A report that ends "engagement was strong this month" has produced nothing.

## Practice

**Part 1 — Sort the metrics.** Take twelve metrics from a real platform's analytics screen. For each: name the chain link it measures, classify it as vanity, diagnostic, leading indicator, or outcome, and — the hard part — name the specific decision it would change. Any metric for which you cannot name a decision goes in a list titled "not in the report," and you must be willing to defend the list.

**Part 2 — The denominator trap.** For a post with 22,600 reach, 30,100 impressions, 1,840 likes, 44 comments, 61 saves, 39 shares, and an account of 7,400 followers: compute frequency, and compute engagement rate three ways. State which denominator you would standardize on and why, then compute saves and shares per 1,000 reached and say whether this post would clear a gate set at 1.5× medians of 10.9 and 6.3.

**Part 3 — Two posts, one decision.** Using the Post A / Post B data in this lesson, or your own equivalent, produce the full comparison: gross profit, production cost, contribution, and gross profit per 1,000 reached for each. Then walk the chain and identify the specific link at which the weaker post lost, with the ratio that proves it. Finish with one recommendation and one caveat that argues against your own recommendation.

**Part 4 — Build the join.** Write the UTM convention for a four-week calendar: the closed list for `utm_medium`, the rule for `utm_source`, `utm_campaign`, and `utm_content`, and at least six complete tagged URLs covering organic and paid on two platforms. Then explain, in a paragraph a non-technical owner would follow, why the platform's click count and your web analytics session count will not match, roughly how large a gap is normal, and what size of gap would make you stop and investigate.

**Part 5 — Report and decide.** Build a monthly report in the format above for a month of data (real or the Fernwood July figures). It must include exposure, response, visit, and outcome sections; the ratios between adjacent links with the arithmetic shown; a money section including labour cost; and a contribution line. Then write three diagnoses in the form *observation → likely cause → decision*, each naming the ratio that supports it. At least one diagnosis must include a number you would refuse to compute a percentage change on, and say why.
