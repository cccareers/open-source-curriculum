---
course_id: dm250
project_id: dm250-x01
title: "Fernwood August Analytics Case File"
kind: supplementary-project
status: draft
hours_estimate: 5
difficulty: core
related_lessons:
  - dm250-05
  - dm250-06
objectives:
  - Measure social campaign effectiveness with platform and web analytics
  - Distinguish vanity metrics from metrics tied to business outcomes
competency_ids:
  - D4-S1-C03
---

## Scenario

It is 2 September. Tomás changed two things in August because of the July report in lesson 06: the Instagram bio link now points at the grind guide with the subscription as a second link, and the July shipping carrier problem was fixed on 4 August. Priya wants to know three things by Friday: did the bio-link change work, which August posts earned their production time, and should the latte-art Reel that "went viral" get paid support in September.

You have the August export. Nothing else exists; do not invent data.

## What you will produce

1. A **per-post rate table** (saves and shares per 1,000 reached, gross profit, gross profit per 1,000 reached, contribution after production labour).
2. The **August monthly report** in the lesson 06 format, with the July column beside it.
3. A **gate decision** for every Instagram post using lesson 05's 1.5x rule against the July medians (9.4 saves and 7.1 shares per 1,000 reached).
4. **Three decisions** in the form observation → ratio → action → reversal condition.
5. A **reply to Priya** about the latte-art Reel, under 120 words.

## Before you start

Economics (from lessons 05 and 06): lifetime gross profit per subscription start **$63.84**; gross profit per one-off order **$22.08**; loaded labour **$28/hour**; social labour **12 h/week x 4.3 weeks**; paid social **$1,200/month**.

**File 1 — `fernwood_aug_posts.csv`** (copy into a spreadsheet; one row per organic post; `sessions`, `sub_starts` and `oneoff_orders` come from web analytics joined on `utm_content`)

```csv
date,platform,format,pillar,hook,reach,impressions,likes,comments,saves,shares,profile_visits,link_clicks,sessions,sub_starts,oneoff_orders,production_hours
2026-08-03,instagram,carousel,Brew Better,Grind size for French press,4380,5010,402,88,131,69,610,198,171,9,4,1.0
2026-08-05,instagram,photo,Cafe Life,New River Arts patio,3120,3540,515,41,19,22,150,12,9,0,0,0.25
2026-08-07,instagram,reel,Brew Better,Bloom: why the first 30 seconds,15900,21300,1880,57,96,141,420,61,47,2,1,3.0
2026-08-10,instagram,carousel,Origin & Roast,What we paid: Huila lot,3460,3950,288,52,74,31,330,96,82,4,2,1.0
2026-08-12,instagram,reel,Cafe Life,Barista latte-art round,41200,55600,4310,92,38,170,360,14,11,0,1,3.5
2026-08-14,facebook,link,Brew Better,Cold brew at home guide,2650,3100,96,23,0,41,40,133,112,3,5,0.5
2026-08-17,instagram,carousel,Brew Better,Water: the ingredient nobody buys,3980,4600,350,74,112,58,540,171,149,8,3,1.0
2026-08-19,linkedin,document,Wholesale,Office coffee checklist v2,1710,2050,64,19,0,9,88,46,40,0,0,1.0
2026-08-21,instagram,photo,Origin & Roast,Huila cupping notes,2890,3210,301,28,26,14,140,22,18,1,0,0.25
2026-08-26,instagram,reel,Brew Better,Dialing in a new bag in 3 cups,12400,16100,1190,63,118,104,505,140,118,6,2,3.0
2026-08-28,facebook,event,Cafe Life,Latte-art night Sept 4,2210,2600,74,31,0,28,55,64,52,0,0,0.5
2026-08-31,linkedin,text,Wholesale,Why we deliver at 7am,1490,1700,52,14,0,6,60,18,15,0,0,0.5
```

**File 2 — `fernwood_aug_summary.txt`**

```txt
Platform-reported outbound link clicks (all organic posts)     975
Web analytics sessions, utm_medium=social_organic              824
Total DTC orders in August (all channels)                      236
  Checkout self-report "Instagram" or "TikTok"                  70
Wholesale enquiries from LinkedIn                                2
Sentiment, August: mentions 410, positive 170, neutral 196, negative 44
July (from lesson 06): reach 118,400; profile visits 3,940; link clicks 731;
  sessions 588; orders 41 (34 subs, 7 one-off); NSS +7.4; negative 23.6%
```

## Milestones

1. **Check the file before you trust it.** Confirm the totals: reach 95,390; link clicks 975; sessions 824; 33 subscription starts; 18 one-off orders. If your sums differ, find the row.
2. **Per-post rates.** Add columns for saves/1k, shares/1k, gross profit, gross profit per 1,000 reached, labour cost, and contribution. Show the formula in each header.
3. **Walk the chain** for August and July: profile visits / reach, clicks / profile visits, sessions / clicks, orders / sessions. Name the link that moved most.
4. **Apply the gate.** Mark each Instagram post eligible, local-only, or not, with the arithmetic.
5. **Build the money section** including labour and paid spend, and state the contribution line with the lifetime-versus-cash caveat.
6. **Write three decisions** and the reply to Priya.

## Acceptance criteria

- [ ] Every derived number is a visible formula traceable to File 1 or File 2.
- [ ] Engagement is expressed per reach, and the denominator is stated once at the top.
- [ ] The bio-link question is answered with the clicks-per-profile-visit ratio for both months, not with total clicks.
- [ ] The latte-art Reel is judged on the chain, with the specific link where it lost named.
- [ ] No percentage change is computed on a count below about 30 (wholesale enquiries, one-off orders by post).
- [ ] Platform clicks vs. web sessions gap is stated as a percentage and judged against the lesson 06 "about 20% is normal" band.
- [ ] The self-reported 70 orders are compared to the 51 attributed orders with one sentence on what cannot be concluded.
- [ ] Sentiment: NSS and negative share for August are computed and compared with July and the +39.2 baseline.

## Evidence checklist

- Spreadsheet with formulas (not pasted values).
- One-page August report in the lesson 06 format.
- Gate table.
- Decisions page and the reply to Priya.

## Rubric
| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Arithmetic and traceability | Several numbers cannot be traced or are wrong | All numbers traceable; at most one minor slip | Includes a reconciliation line proving file totals |
| Chain diagnosis | Reports totals only | Ratios for every adjacent link, weakest link named | Separates a content effect from a mix effect (e.g. one Reel inflating reach) |
| Vanity vs outcome | Leads with reach or likes | Leads with orders and gross profit | Names a decision for every metric kept and lists those dropped |
| Decisions | Vague ("keep posting carousels") | Observation, ratio, action, reversal condition | Expected effect given as a range with the assumption named |
| Honesty about limits | No caveats | Lifetime-vs-cash and small-count caveats present | Also flags what the export cannot show (organic/paid overlap, dark social) |

## Stretch goals

- Re-run the money section on a first-month cash basis (subscription starts x $19 x 48%) and say which version you would show Priya first, and why.
- Propose the September paid overlay for one of the posts that clears the gate, using lesson 05's cell-sizing check.

## Reflection prompts

- Which number in the file did you most want to report, and why did you not lead with it?
- What one extra column would have changed one of your decisions?

## Instructor notes

Answer key highlights: August clicks/profile visits = 975 / 3,298 = 29.6% (July 18.6%), so the bio-link change is the largest movement in the chain. Organic gross profit = 33 x $63.84 + 18 x $22.08 = $2,504.16; minus labour $1,444.80 and paid $1,200 gives a contribution of -$140.64 (July -$319.68). Gate thresholds at 1.5x July medians are 14.1 saves/1k and 10.65 shares/1k. Only the 3 Aug carousel (29.9 / 15.8) and the 17 Aug carousel (28.1 / 14.6) clear both. The 10 Aug carousel (21.4 / 9.0) fails on shares nationally but clears the 1.2x local gate (11.3 / 8.5); every other post fails. The latte-art Reel has the largest reach (41,200) and 0.9 saves/1k; profile visits/reach 0.87% and clicks/profile visits 3.9% — it loses at the response link, the same pattern as July's Post A. Sessions/clicks = 84.5% (gap 15.5%, inside the normal band). August NSS = (170 - 44) / 410 = +30.7, negative share 10.7%: recovering but still below the +39.2 baseline.

Common pitfalls: averaging the two Facebook posts into Instagram medians; computing gate thresholds from August medians instead of July's; calling the latte-art Reel a failure without saying what objective (café footfall) it should be judged on. To shorten to 3 hours, drop the sentiment row and the reply to Priya.
