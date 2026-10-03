---
course_id: dm301
project_id: dm301-x01
title: "Kestrel Track B Dataset: Outlet Store and Desktop Cart Audit"
kind: supplementary-project
status: draft
hours_estimate: 8
difficulty: core
related_lessons:
  - dm301-09
  - dm301-03
  - dm301-05
  - dm301-07
objectives:
  - Turn an analytics finding into a specific marketing decision
  - Separate a real signal from normal variation
  - Use heatmaps, session recordings, and user feedback to locate experience problems
competency_ids:
  - D6-S1-C03
  - D6-S2-C03
---

## Scenario

Lesson 09's Track B says "your instructor supplies the exported 28-day dataset" and forbids building on the mobile checkout finding. This brief **is** that supply: Kestrel Outfitters exports for the same 28-day baseline used all course (46,200 sessions, 612 purchases), cut along dimensions the lessons did not work. Your stakeholder is **Dana Kowalski, the outlet store manager**, who is not technical and wants to know whether the website is sending local customers to her store and, if not, what one change she should ask the web contractor for.

Two genuine findings are planted in the data, along with one data-quality defect and one noise trap. Nobody will tell you which is which.

## What you will produce
The full lesson 09 submission (Parts 1-6) on this dataset, scoped to the outlet store goal and anything else you find. Every requirement and Definition of Done line in lesson 09 applies.

## Before you start

All files cover the same 28 days ending 5 April. Copy each block into its own sheet.

**`ko_property_config.txt`**
```txt
Time zone: America/Denver   Currency: USD   Data retention: 2 months
Internal traffic filter: defined (office IP range), state = Testing
Key events: purchase, find_store, add_to_cart
newsletter_signup: collected as an event, NOT marked key
Unwanted referrals: (none listed)
```

**`ko_new_returning.csv`**
```csv
user_type,sessions,purchases,revenue
new,29800,268,23048
returning,16400,344,29584
```

**`ko_cart_to_checkout_by_device.csv`** (sessions with each event)
```csv
device,add_to_cart,begin_checkout
mobile,3380,1690
desktop,1540,720
tablet,200,70
```

**`ko_outlet.csv`** (outlet store goal: 220 `find_store` events from within 40 miles per 28 days)
```csv
metric,value
find_store events (all),148
find_store events from users within 40 miles,96
sessions landing on /pages/outlet-store,1240
  of which from organic search,980
  of which from internal site navigation,40
site search: "outlet",310
site search: "store hours",120
site search: "location",85
site search exits after a zero-result page (all terms above),320
pages linking to /pages/outlet-store,footer only
```

**`ko_site_search_results.csv`**
```csv
search_term,searches,results_returned,search_exit_rate
outlet,310,0,0.64
store hours,120,0,0.61
location,85,0,0.58
rain jacket,890,42,0.11
daypack,640,18,0.09
```

**`ko_channel_prior.csv`** (for the referral question Dana has heard about)
```csv
channel,sessions_this_period,purchases_this_period,sessions_prior,purchases_prior
Referral,2100,15,2260,19
Email,4900,108,4720,101
```

**`ko_qualitative.txt`**
```txt
Unmoderated test, 3 participants (local, own phones), task: "You live in
town and want to try boots on before buying. Find out if you can."
  P1: searched "outlet", got "No results", went to Google, found the page.
  P2: opened the menu, scanned twice, gave up after 70 seconds.
  P3: scrolled to the footer, found "Store", opened it, said "oh, it's
      the outlet, I thought Store meant the online shop."
Tap map, /collections/hiking-boots, mobile, 2,310 sessions: 4.1% of taps on
  the static text "Try them on in Boulder" in the hero banner (not a link).
Exit survey on /pages/outlet-store, 41 responses: 17 "hours not clear",
  11 "is parking available", 13 other.
```

## Milestones
1. **Part 1 audit** using `ko_property_config.txt`: list every setting you would change and why. Pay attention to the key-event list.
2. **Baseline scorecard** for the outlet goal with counts beside rates and a noise-floor line.
3. **Three findings** in the lesson 05 template: one action, one documented decision not to act, and at least one tested with the standard-error arithmetic.
4. **Qualitative explanation** of the finding you act on, using at least two of the supplied instruments, with the populations stated.
5. **Experiment plan** with sizing, downside, decision method, guardrails, pre-registration.
6. **Two-page report** for Dana.

## Acceptance criteria
- [ ] Segment tables sum to 46,200 sessions and 612 purchases where they should.
- [ ] `find_store` is identified as a key event that should not be one (lesson 02), and `newsletter_signup` as an outcome missing key-event status.
- [ ] The internal traffic filter in "Testing" state and 2-month retention are flagged with consequences.
- [ ] The referral change (19 → 15 purchases) is classified as noise with the small-count reasoning, not as a finding.
- [ ] The desktop vs mobile cart-to-checkout gap is tested: about 2.1 standard errors, so marginal, and reported as such.
- [ ] The outlet finding cites the zero-result searches, the footer-only link, and at least one qualitative instrument.
- [ ] The three-participant test is not quantified as a rate.
- [ ] The report to Dana has no more than five columns in its one table and no jargon.

## Evidence checklist
- Audit page, scorecard, three finding templates, triangulation table, experiment plan, two-page report, assumptions list.

## Rubric
| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Data trust | Skips the config file | Flags key-event, filter and retention issues | Explains how each would distort a specific number in this dataset |
| Signal vs noise | Calls the referral drop a decline | Small counts refused; SE test shown for one difference | Explains what more data would settle the marginal desktop gap |
| Finding to decision | "Improve the outlet page" | One specific change (e.g. synonyms in site search plus a header link), owner, date, threshold | Names a guardrail and the result that would make them wrong |
| Qualitative use | Quotes P2 as "67% failed" | Uses instruments to explain mechanism, counts as counts | Notes the disagreement between "hours not clear" and findability |
| Stakeholder report | Analyst language | Dana could repeat the recommendation | Includes what cannot be known yet (in-store visits are invisible to GA4) |

## Stretch goals
- Write the measurement plan for in-store visits that GA4 cannot see (e.g. a "saw it on the website" question at the outlet till) and say what it could and could not prove.
- Size the returning-vs-new gap and explain why it is not by itself a decision.

## Reflection prompts
- Which number did you want to act on first, and what stopped you?
- What did the three-person test tell you that 320 search exits could not?

## Instructor notes
Planted items: (1) **Outlet findability** — 515 searches for "outlet", "store hours" and "location" return zero results, 320 exit; the page is linked only from the footer and labelled "Store"; P1-P3 and the 4.1% tap rate on non-link "Try them on in Boulder" text all point the same way. Cheap, evidenced fix: add search synonyms and a header/banner link; measure `find_store` from within 40 miles against the 220 target (currently 96, a count, so judge over two periods). (2) **Desktop cart-to-checkout** 46.75% vs mobile 50.0%: SE ≈ 1.53pp, difference 3.25pp ≈ 2.1 SE — marginal; correct answer is "not yet a finding; watch two more periods". Noise trap: referral purchases 19 → 15. Data defects: `find_store` and `add_to_cart` marked key; `newsletter_signup` not key; filter in Testing; retention 2 months. Returning vs new (2.10% vs 0.90%) is real (about 9.6 SE) but is not a decision on its own — a good submission says so. Time zone America/Denver is plausible for Boulder; do not penalise either way.
