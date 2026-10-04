---
lesson_id: dm230-04
course_id: dm230
pathway: digital-marketer
title: Keywords, Match Types, and Negatives
order: 4
kind: lesson
competency_ids:
  - D3-S1-C01
  - D1-S1-C01
objectives:
  - Select keywords and match types, and use negatives to protect budget
  - Mine a search terms report for new keywords and new negatives
---

## Paid keyword research is a different job than SEO keyword research

In dm201 you built keyword research for organic search. The economics of that work are patient: you pick a term, you invest in a page, and if the page ranks you collect traffic for months at no marginal cost per visit. That patience changes the math, because a high-volume informational query with weak commercial intent can still be worth an organic page. The cost of being wrong is a few hours of writing.

Paid search removes the patience and the free traffic. Three things change, and they change everything about how you choose terms.

First, **you buy intent, not information**. Every click is a purchase. Northgate Heating and Air pays $8.20 for the average click in the AC Repair ad group whether the searcher is a homeowner whose system died at 4pm in July or a high school student writing a paper on refrigerants. The auction does not refund you for the second one.

Second, **cost is immediate and the feedback loop is short**. An organic mistake costs you time. A paid mistake costs you money today, and at $200 a day it costs it fast. A broad match keyword left unattended over a weekend can burn $400 with nothing to show. That is roughly 3.7 repair leads of gross profit gone, at $108 a lead.

Third, **commercial intent beats volume, and it is not close**. In organic, volume is a reasonable first-pass filter because you are not paying per visit. In paid, volume is the last thing you look at. A term with 5,400 monthly searches and a 0.4% conversion rate is worse than a term with 320 monthly searches and a 20% conversion rate, at almost any bid, because you pay for all 5,400 chances and convert almost none of them.

That third point is the money pit, and it is the single most common way new accounts lose money. The pattern looks like this. You find `how to fix air conditioner` in the planner. It has 5,400 monthly searches in the Columbus metro. Competition is Low. Top-of-page bids are $0.90 to $3.60, which feels like a bargain next to $8.20. You add it. You get 200 clicks in a month at $2.20 average, which is $440 of spend. Those searchers wanted a YouTube video, not a truck in their driveway, so you convert maybe one of them: 200 x 0.005 = 1 lead. Your cost per acquisition on that keyword is $440. Your break-even is $108. You just lost $332 buying cheap clicks.

Cheap clicks are not the same as cheap leads. Write that on the wall.

### The two numbers that gate every keyword decision

Before you evaluate a single term, compute the two ceilings that come out of Northgate's unit economics.

```txt
Repair lead gross profit          = 0.60 booked x $180 gross profit = $108
Target CPA (repair)               = $60
AC Repair ad group conv. rate     = 11%

Maximum CPC at target CPA  = target CPA x conversion rate
                           = $60 x 0.11
                           = $6.60

Break-even CPC             = lead value x conversion rate
                           = $108 x 0.11
                           = $11.88

Current AC Repair avg CPC  = $8.20
Current AC Repair CPA      = $3,200 / 43 = $74.42
```

Read that carefully, because it frames the whole lesson. At an 11% conversion rate, Northgate can pay up to $11.88 per click before a repair lead stops making money, and up to $6.60 per click to hit the $60 target. The account is currently paying $8.20. That is profitable but off target, which is exactly the situation most real accounts live in.

The important consequence is that **the ceiling moves with the conversion rate**, not with your enthusiasm for the keyword. A term that converts at 20% supports a $12.00 click at the $60 target ($60 x 0.20) and a $21.60 click at break-even. A term that converts at 3% supports a $1.80 click at target. So when you look at a keyword, the question is never "can I afford $9?" It is "what is this term's conversion rate likely to be, and what CPC does that support?"

## Building the seed list

Seed lists are not brainstormed out of nothing. For a local service business there are four reliable wells to draw from, and you should work all four before you touch a keyword tool. **Services** are what the business sells, in the words the business uses. **Symptoms** are what the customer types before they know the name of the service. **Brands** are manufacturer names, competitor names, and the business's own name. **Geography** is the city, the suburbs, and the "near me" phrasing that stands in for all of them.

The symptom well is the one beginners skip, and it is often the most profitable. A homeowner at 4pm in July does not search `residential air conditioning diagnostic service`. They search `ac not blowing cold air`. That query has high commercial intent even though it contains no commercial word at all.

```txt
NORTHGATE HEATING & AIR - SEED LIST (v1, pre-planner)

SERVICES
  ac repair
  air conditioning repair
  emergency ac repair
  same day ac repair
  hvac repair
  furnace repair
  heating repair
  ac installation
  air conditioner replacement
  new hvac system
  furnace install
  hvac maintenance plan
  ac tune up
  annual furnace inspection

SYMPTOMS (customer language, no service word)
  ac not blowing cold air
  ac not cooling
  ac running but not cooling
  ac frozen coil
  ac leaking water
  ac making loud noise
  ac smells musty
  furnace blowing cold air
  furnace won't turn on
  no heat in house
  thermostat not working
  ac tripping breaker

BRANDS
  northgate heating and air        (own brand - separate campaign)
  northgate hvac columbus          (own brand)
  trane ac repair                  (only if authorized servicer)
  carrier furnace repair           (only if authorized servicer)
  lennox ac service                (only if authorized servicer)
  [competitor names]               (decision below - do not add yet)

GEOGRAPHY (modifier layer, combined with services + symptoms)
  columbus
  columbus ohio
  westerville
  dublin ohio
  grove city ohio
  hilliard
  gahanna
  worthington
  near me
```

Two notes on that list. Manufacturer brand terms only belong in the account if Northgate is genuinely an authorized servicer for that brand, because claiming otherwise is both a policy problem and a trust problem. And the geography layer is a *modifier* layer: you do not need `ac repair westerville`, `air conditioning repair westerville`, `ac service westerville` as three separate keywords on day one. Start with the service terms and let the search terms report tell you which geo combinations people actually type.

## Reading Keyword Planner output honestly

Keyword Planner gives you three columns that matter: average monthly searches, competition, and the top-of-page bid range. Every one of them is easy to misread.

Average monthly searches is a rounded, bucketed estimate averaged over twelve months. For a seasonal business like Northgate that averaging is actively misleading. `ac repair` averaged over a year hides the fact that half the annual volume lands in six weeks. Competition is not a measure of how hard the auction is; it is a measure of how many advertisers have bid on the term relative to all terms, and it says nothing about whether those advertisers are making money. Low competition on an informational term means nobody wants it, not that you found an edge.

The top-of-page bid range is the most useful column and the most abused. The low end is roughly what advertisers pay to sit at the bottom of the top-of-page block; the high end is roughly what the aggressive ones pay. It is a range of *observed* bids, not a recommendation, and it is not a promise about your CPC, which depends on quality signals (covered in lesson 02).

Here is a planner pull for the Columbus metro, and the honest read on each row.

| Keyword | Monthly searches | Competition | Top-of-page bid | Buy? |
| --- | --- | --- | --- | --- |
| ac repair | 2,900 | High | $6.80 - $18.40 | Yes, exact + phrase, capped |
| ac repair near me | 1,600 | High | $7.20 - $19.60 | Yes, exact |
| air conditioning repair | 1,300 | High | $6.40 - $17.10 | Yes, phrase |
| emergency ac repair | 320 | High | $8.90 - $24.00 | Yes, bid up |
| ac repair columbus ohio | 480 | High | $7.10 - $18.90 | Yes, exact |
| hvac repair | 1,900 | High | $5.60 - $14.30 | Yes, phrase, tight negatives |
| hvac near me | 880 | High | $5.90 - $15.40 | Test, phrase only |
| ac not cooling | 2,400 | Low | $1.40 - $5.20 | Test, capped at $3.00 |
| air conditioner installation cost | 720 | Medium | $3.80 - $11.20 | Different ad group |
| hvac companies columbus | 390 | High | $6.90 - $17.60 | Test, low bid |
| how to fix air conditioner | 5,400 | Low | $0.90 - $3.60 | No |
| hvac technician salary | 1,300 | Low | $0.60 - $2.10 | No, and negative it |

Now the reasoning, tied to the two ceilings.

`emergency ac repair` has the smallest volume on the list at 320 and the highest bid range at up to $24.00, and it is the best keyword in the table. An emergency searcher converts at roughly double the ad group average. Assume 20%. Max CPC at the $60 target is $60 x 0.20 = $12.00, and break-even is $108 x 0.20 = $21.60. So a $12 click on this term costs the same per *lead* as a $6.60 click on a 11%-converting term. Small volume, expensive clicks, excellent economics.

`how to fix air conditioner` has the largest volume on the list and the cheapest clicks, and it is the worst keyword in the table. Worked above: about $440 of spend for one lead. The cheap bid range is the market telling you that nobody who bids on this term makes money on it. `hvac technician salary` is not a buying decision at all; it is a negative keyword, and it is on the planner list only because the planner suggests semantically adjacent terms without regard to intent.

`ac not cooling` is the genuinely interesting row, and the one that separates a careful buyer from a lazy one. It is a symptom query with 2,400 searches and a $1.40 to $5.20 bid range. Symptom queries convert worse than service queries because they catch some do-it-yourself intent, but they still catch a lot of people who are about to call somebody. Say 5%. Max CPC at target is $60 x 0.05 = $3.00. That fits inside the observed range. So the decision is: buy it, cap the bid at $3.00, wrap it in a heavy negative list, and check the search terms report weekly. If the real conversion rate comes in at 7%, your ceiling rises to $4.20 and you scale it. If it comes in at 2%, your ceiling is $1.20 and you either bid down hard or drop it.

That is the whole method. Estimate a conversion rate, derive a CPC ceiling, compare it to the observed bid range, and set a decision rule for what evidence would change your mind.

## Commercial, informational, and navigational intent

The intent taxonomy you learned for SEO carries over, but the consequences are financial rather than editorial.

**Commercial intent** means the searcher is trying to buy, hire, or book. In Northgate's world: `ac repair columbus`, `emergency ac repair`, `same day hvac repair near me`, `air conditioner installation quote`. These are what you buy, at your full ceiling, on tight match types.

**Informational intent** means the searcher wants to know something. `how does a heat pump work`, `what does seer rating mean`, `why is my ac leaking water`, `average life of an ac unit`. Most of these are money pits in paid search. A few sit on the border, and the border is where the symptom queries live. `why is my ac leaking water` is nominally informational, but a meaningful share of the people typing it will end the day booking a service call. You can buy border terms at a reduced ceiling with strict negatives, and you evaluate them on conversion data, not on how the phrase reads.

**Navigational intent** means the searcher is trying to reach a specific destination. `northgate heating and air`, `northgate hvac phone number`, and every competitor's name. Your own brand terms are the cheapest conversions in the account: Northgate's brand ad group runs a $1.90 CPC against a 28% conversion rate, which is a CPA of $1.90 / 0.28 = $6.79. That is why the brand campaign lives separately (lesson 03) and why it is never allowed to fight non-brand keywords for budget.

The practical rule for a local service business: buy commercial intent at full price, buy border symptom terms at a discounted ceiling with a review date, buy your own brand cheaply, and treat pure informational terms as negatives unless you have conversion data proving otherwise.

## Competitive analysis for paid search

Competitive analysis in SEO tells you what content exists and what it would take to outrank it. In paid, it tells you who is in the auction with you, how often, and how hard they are pushing. The primary instrument is the auction insights report.

Auction insights compares your performance to other domains that entered the same auctions. Four columns carry most of the meaning.

- **Impression share** is your impressions divided by the impressions you were eligible for. It answers "how often did I actually show up?"
- **Overlap rate** is how often another advertiser's ad showed in the same auction where yours also showed. It answers "how often are we in the same room?"
- **Position above rate** is how often the other advertiser's ad appeared in a higher position than yours, *when both of you showed*. It answers "when we are both in the room, who wins?"
- **Top of page rate** is how often that advertiser's ad appeared above the organic results at all.

Here is the same baseline 30-day period for Northgate's AC Repair campaign, using the campaign-level scope of lesson 06.

| Advertiser | Impression share | Overlap rate | Position above rate | Top of page rate |
| --- | --- | --- | --- | --- |
| Northgate (you) | 41% | - | - | 48% |
| Buckeye Comfort Systems | 58% | 71% | 64% | 78% |
| Scioto Mechanical | 41% | 52% | 47% | 66% |
| Capital City HVAC | 22% | 33% | 29% | 52% |
| Olentangy Air Pros | 12% | 18% | 61% | 81% |

Four different stories in one table.

**Buckeye Comfort Systems** is the market leader in this auction. They show in 58% of eligible auctions, they are in the same auction as you 71% of the time, and when you both show they beat you on position roughly two times in three. They are spending more than you and probably ranking better too.

**Scioto Mechanical** is your peer. Overlap 52%, position above 47%. You trade wins. Movement in either direction is meaningful here.

**Capital City** is a smaller spender you generally beat. Not much to do.

**Olentangy** is the interesting one. Their impression share is only 12%, but their position above rate is 61% and their top of page rate is 81%. That profile means selective and expensive: they are not in most auctions, but when they choose to be in one they buy the top slot. That is the signature of a narrow, high-value strategy - a small geography, a short daypart, or a handful of high-intent keywords bid aggressively. If you find where they show up, you have found terms somebody has decided are worth paying up for.

### Turning impression share into money

Impression share is the bridge between competitive data and budget decisions, because it tells you the size of the opportunity you are not buying.

```txt
AC Repair campaign, baseline 30 days
  Clicks                = 390
  CTR                   = 6.4%
  Impressions           = 390 / 0.064 = 6,093.75
  Impression share      = 41%
  Eligible impressions  = 6,093.75 / 0.41 = 14,862.80
  Impressions missed    = 14,862.80 - 6,093.75 = 8,769.05

Cost to capture ALL of it, at current CTR and CPC:
  Extra clicks  = 8,769.05 x 0.064 = 561.22
  Extra spend   = 561.22 x $8.20   = $4,602.00 (rounded at the end)
```

Northgate's entire monthly search budget is $6,080. Closing the campaign's full impression share gap at unchanged CTR and CPC would add about 76% to the account's spend. This is a sizing assumption, not a budget-only forecast: 22 points are lost to budget and 37 to rank, so recovering the full gap also requires better Ad Rank. So the correct conclusion is not "raise bids until impression share is 100%." It is "impression share is a menu, and you buy the best-converting items on it." That means bidding up on `emergency ac repair` and the geo-qualified exacts, and letting Buckeye have the broad, low-intent volume they seem happy to pay for.

### What to do about an aggressive competitor

The instinct is to match their bids. Resist it, because the bid is the one lever where a better-funded competitor always wins. Four better moves:

1. **Segment before you react.** Look at impression share by hour, by day, and by geography. An advertiser at 58% impression share is rarely at 58% everywhere. If Buckeye's share collapses after 6pm, buy the evening. Northgate answers calls from 7am to 9pm, seven days; if Buckeye closes at 6pm, the remaining staffed evening hours and weekends are an opportunity. Do not promise an answered call at 2am.
2. **Compete where your conversion rate is highest.** Your CPC ceiling is set by conversion rate. If your emergency terms convert at 20% and theirs is a general contractor page, you can outbid them on those specific terms and still hit target.
3. **Fix quality signals rather than bids.** A better click-through rate and a tighter landing page lower your actual CPC at the same position (lesson 02 has the mechanism). This is the only lever that makes you *cheaper* rather than just more expensive.
4. **Read their ads and their landing pages.** This is manual work and it pays.

Run the searches yourself - in an incognito window, ideally using the ad preview tool so you do not accumulate impressions against your own account - and write down what each competitor promises. You are looking for positioning gaps: a claim nobody is making that is true of your client. In Northgate's case, suppose all four competitors lead with "Fast, Friendly Service" and a phone number, and none of them state a price, name a response time, or mention weekend coverage. Then "$79 diagnostic, no overtime charges, call 7am–9pm seven days; arrival window confirmed" is a genuine gap, and it is specific enough to be checkable. Also check where their ads land. If a competitor sends `emergency ac repair` traffic to a generic homepage, their conversion rate on that term is worse than yours could be, and that is exactly the term to take from them. Lesson 05 covers how to turn a positioning gap into copy.

## Match types

A keyword is not a query. A keyword is an *instruction about which queries you want to buy*. The match type is the tightness of that instruction. There are three, and what each one actually matches has drifted a long way from the literal names.

**Exact match**, written `[ac repair columbus]`, matches queries with the same *meaning* as the keyword. This is much wider than "the identical words." It includes close variants: misspellings, singular and plural forms, stemming, accents, abbreviations, reordering when the reorder does not change meaning, and the addition or removal of function words like "in", "to", "for", and "a". It also includes same-meaning paraphrases and synonyms, so `[ac repair]` can match `air conditioning repair`. What exact will not do is match a query that adds a new meaningful concept.

**Phrase match**, written `"ac repair columbus"`, matches queries that include the *meaning* of your keyword, with additional words allowed before, after, or sometimes in between. The old rule was "these words in this order"; today it is closer to "this meaning, contained somewhere in the query." Extra concepts are allowed as long as the keyword's meaning is preserved.

**Broad match**, written with no punctuation as `ac repair columbus`, matches queries related to the keyword's topic. It considers the whole query's meaning, other keywords in your ad group, your landing page content, and your account's recent performance. It is the widest instruction and the only one that can match queries containing none of your keyword's words.

Here is the same keyword under all three match types against six realistic queries.

| Query | `ac repair columbus` (broad) | `"ac repair columbus"` (phrase) | `[ac repair columbus]` (exact) | Why |
| --- | --- | --- | --- | --- |
| columbus ac repair | Match | Match | Match | Reordering does not change meaning |
| ac repair in columbus ohio | Match | Match | Match | "in" is a function word; "ohio" is implied by "columbus" |
| air conditioning repair columbus | Match | Match | Match | Same-meaning synonym for "ac repair" |
| emergency ac repair columbus oh | Match | Match | No match | "emergency" adds a meaningful concept exact will not absorb |
| ac repair columbus ga | Match | Match | No match | Phrase contains the keyword meaning; the wrong Columbus is a targeting problem, not a match-type problem |
| hvac companies near columbus | Match | No match | No match | Related topic, but "ac repair" is not present as a meaning |

Three lessons are hiding in that table.

The `ac repair columbus ga` row is the one that surprises people. Phrase match happily serves it, because the query does contain your keyword's meaning plus an extra concept. Match type is not a geographic control. **Location targeting is what keeps you out of Georgia**, and even that has settings you need to get right - the difference between targeting people *in* a location and people showing *interest in* a location decides whether a Georgia searcher can see your ad at all. Fix the setting; do not try to solve it with negatives.

The `emergency ac repair columbus oh` row shows the practical cost of exact-only accounts. Exact match will not catch it, so if `[ac repair columbus]` is your only keyword and you have no phrase or broad coverage, you never see that query at all, and it is one of your best. Exact is precise, not comprehensive.

The `hvac companies near columbus` row shows what broad match buys you and what it risks. Nobody typed "ac repair," yet broad served the ad. Sometimes that query is a good lead. Sometimes the same mechanism serves `hvac technician salary ohio`.

### When broad match is safe and when it is a budget fire

Broad match is safe when three conditions hold at once. Miss any one and it turns expensive.

1. **You are using a smart bidding strategy that reads conversion data.** Broad match hands query selection to the system, so the system needs a signal telling it which queries were worth buying. Manual bidding plus broad match is the worst pairing in paid search: maximum query width, zero feedback. Bidding strategies are lesson 06's subject.
2. **You have enough conversion data for that signal to mean something.** Northgate's AC Repair ad group produced 43 conversions in 30 days. That is enough to steer with. An ad group with four conversions is not, and broad match there is essentially random spending.
3. **Your negative lists are already tight.** Broad match makes your negatives load-bearing. Every category you have not excluded is a category you will buy.

Broad match is a budget fire when the ad group is new and has no conversion history, when the account is on manual CPC, when the negative lists are thin, when the landing page is generic (broad reads your landing page as a relevance signal, so a vague page widens the net), or when a single ad group mixes unrelated services so the system cannot infer what you sell.

The safe sequencing for a new Northgate ad group is: launch on exact and phrase, accumulate 30 to 50 conversions, build the negative lists from the search terms report, move to a conversion-based bid strategy, and only then add a broad match version of your best keyword with a separate budget guardrail. Then keep mining, weekly, forever.

## Negative keywords

Negatives are how you turn a wide instruction into a safe one. They also behave differently from positive keywords in one specific way that trips up nearly everyone.

**Negative keywords do not match close variants.** No misspellings, no plurals, no synonyms, no reordering into the same meaning. A negative blocks the literal terms you typed and nothing else. If you add `-job`, the query `hvac jobs columbus` still runs, because "jobs" is not "job". If you add `-salary`, the query `hvac salarys` still runs. This is deliberate: Google will not silently block traffic you did not explicitly exclude. It means your negative lists have to enumerate the forms.

Within that, the three negative match types work like this.

**Negative broad match**, written `hvac jobs`, blocks a query only if the query contains *all* of the negative's terms, in any order, with other words allowed. `hvac jobs` blocks `hvac jobs columbus` and `columbus hvac jobs near me`. It does not block `hvac careers` or `ac repair jobs`, because those queries do not contain all the words "hvac" and "jobs" together. Note the difference from positive broad match, which is meaning-based and enormous; negative broad match is literal and narrow.

**Negative phrase match**, written `"hvac jobs"`, blocks a query only if it contains those exact terms in that exact order. `"hvac jobs"` blocks `columbus hvac jobs` and `hvac jobs hiring` but not `jobs hvac`.

**Negative exact match**, written `[hvac jobs]`, blocks only the query that is exactly those terms in that order with nothing added. It blocks `hvac jobs` and nothing else.

The practical selection rule: use negative **phrase** for concept blocking, which is most of your list. Use negative **broad** when you want to block a combination of two words that can appear in any order. Use negative **exact** only when a single specific query is a problem but its variations are fine. A common mistake is blanketing everything in negative broad, which is looser than people assume, or blanketing in negative exact, which blocks almost nothing.

One more precision point about one-word negatives. For a single word, negative broad (`-salary`) and negative phrase (`-"salary"`) behave identically: both block any query that contains the word "salary". Negative exact (`-[salary]`) is different — it blocks only the standalone query `salary` and nothing longer. For single-word concept blocking, use phrase (or broad, which is equivalent here), never exact.

### Where negatives live

Negatives can be applied at three levels, and choosing the level correctly is most of the skill.

**Ad group level** negatives are for *sculpting between your own ad groups*. If Northgate has an "AC Repair" ad group and an "AC Installation" ad group, adding `-install`, `-installation`, `-replace`, `-replacement`, and `-new system` as negatives on the repair ad group keeps replacement queries flowing to the ad group with the replacement ad copy and the replacement landing page. This is the only sensible use of ad group negatives. Do not put universal junk here; you will have to maintain it in fifty places.

**Campaign level** negatives are for exclusions that are true of the whole campaign but not the whole account. For Northgate's search campaigns, `-window ac`, `-portable`, `-mini split` (if they do not service them) belong here.

**Shared negative lists** are account-level lists you build once and apply to many campaigns. This is where universal junk lives: employment, education, do-it-yourself, parts, and free. Build two or three lists with clear names, apply them to every search campaign, and maintain them in one place. When you find a new junk pattern in week six, you add it once and every campaign is protected.

A useful convention: one shared list called "Universal Junk" applied everywhere, one called "Employment and Education" applied everywhere, and one called "Competitors" applied only to the campaigns where you have decided not to bid on rivals.

```txt
SHARED NEGATIVE LIST: "Universal Junk - Local Service"
(negative phrase match unless noted)

  EMPLOYMENT / EDUCATION
  "job"          "jobs"          "hiring"       "careers"     "career"
  "salary"       "salaries"      "pay rate"     "wage"        "wages"
  "school"       "schools"       "training"     "class"       "classes"
  "certification"  "apprentice"  "apprenticeship"  "course"   "courses"
  "degree"       "license test"  "exam"

  DO-IT-YOURSELF / INFORMATIONAL
  "diy"          "do it yourself"   "how to"     "how do i"
  "tutorial"     "youtube"          "video"      "guide"
  "step by step"  "instructions"    "manual"     "wiring diagram"

  FREE / NO-BUDGET
  "free"         "cheap"        "cheapest"     "no cost"
  "grant"        "grants"       "assistance program"

  PARTS / RESALE / TRADE
  "parts"        "part"         "capacitor"    "compressor for sale"
  "used"         "refurbished"  "for sale"     "wholesale"
  "supply house"  "distributor"  "bulk"

  IRRELEVANT PRODUCT
  "window ac"    "window air conditioner"   "portable ac"
  "swamp cooler"  "car ac"      "auto ac"     "rv ac"

DO NOT ADD THESE (they look like junk and are not)
  "near me"      - highest-intent local modifier there is; never negative it
  "cost"         - price shoppers still buy; bid them down, do not block them
  "price"        - same
  "emergency"    - your best converting modifier
  "same day"     - high-intent availability within staffed hours
  "reviews"      - late-stage commercial intent, often converts well
```

That last block matters as much as the list above it. New advertisers reflexively negative anything that smells non-transactional, and they end up blocking `near me` because it produced a few odd queries, or `cost` because "those people are just shopping." Price shoppers are still customers. If `hvac repair cost columbus` converts at half the ad group rate, the answer is a lower bid on that keyword, not a negative.

### The competitor name decision

Whether to bid on competitor names is a judgment call with a clear framework. Bidding on `buckeye comfort systems` is legal and permitted, provided your ad copy does not use their trademark (lesson 05 covers the copy rules). The economics are usually poor: your quality signals on their brand term will be weak, so your CPC will be high, and the searcher wanted them specifically, so your conversion rate will be low. If you run it, run it in its own campaign with its own small budget, exact match only, so it can never eat the non-brand budget, and judge it on CPA like anything else.

If you decide *not* to bid on competitors, then competitor names become negatives, and you need them as negatives anyway to stop broad match from wandering in. That is what the "Competitors" shared list is for. Northgate's search terms report below shows exactly why: `reliable heating and air columbus` took four clicks at $9.70 each and converted nothing.

## The search terms report routine

The search terms report shows the actual queries that triggered your ads, as opposed to the keywords you bought. It is the only place where you see what you are really paying for, and mining it is the single highest-return recurring task in a paid search account.

Make it a fixed weekly routine, not a thing you do when something looks wrong.

1. **Set the window.** Last 7 days for a fast-spending account, last 14 to 30 for a slower one. Northgate at $200/day has enough volume for a weekly pass.
2. **Sort by cost, descending.** Not by clicks and not by impressions. Cost is what you are protecting.
3. **Read the top rows until the cost per row drops below about 1% of the period's spend.** For Northgate's AC Repair ad group at $3,200 a month, that is about $32 for a monthly pass. Below that threshold, individual rows are not worth a decision, though patterns still are.
4. **Tag each row with one of four verdicts.** *Promote*: it converted and deserves its own keyword, usually exact. *Negative*: it is irrelevant, so decide the level and match type as you add it. *Leave*: it is relevant and converting acceptably through its existing keyword. *Investigate*: relevant but expensive or non-converting, and you need more data first.
5. **Scan for patterns below the cost threshold.** One click on `hvac school` is not worth a decision by itself; the *category* "education" is, and one click is enough evidence to add the category.
6. **Record what you changed and the date.** When performance moves in three weeks, you need to know what you did.

One asymmetry inside step 4 is important and often missed. **Negatives are a relevance judgment; new keywords are a statistical judgment.** You can add `hvac school columbus` as a negative after a single click, because you know with certainty that Northgate does not sell HVAC training. You cannot promote a query to a new keyword after a single conversion, because one conversion tells you almost nothing about that query's true conversion rate. Rough working rule: promote on 3 or more conversions, or on 20 or more clicks with a conversion rate visibly above the ad group average. Below that, tag it "investigate" and wait.

## Mining a real report

Here is thirty days of search terms for Northgate's Non-brand AC Repair ad group, top 20 rows by cost. The ad group spent $3,200 on 390 clicks and produced 43 conversions; these 20 rows account for 251 clicks, $2,075.00, and 31 conversions, with the rest in a long tail.

| # | Search term | Match type | Clicks | Cost | Conv | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | ac repair columbus | Exact | 41 | $349.60 | 7 | Leave |
| 2 | air conditioner repair near me | Phrase | 36 | $302.40 | 6 | Promote |
| 3 | ac not blowing cold air | Broad | 28 | $221.20 | 3 | Promote |
| 4 | emergency ac repair columbus | Phrase | 22 | $198.00 | 5 | Promote |
| 5 | hvac repair cost columbus | Broad | 18 | $142.20 | 1 | Investigate |
| 6 | same day ac repair columbus ohio | Broad | 14 | $131.60 | 3 | Promote |
| 7 | how to fix ac unit yourself | Broad | 12 | $88.80 | 0 | Negative |
| 8 | ac repair westerville ohio | Broad | 11 | $92.40 | 2 | Promote |
| 9 | why is my ac leaking water | Broad | 9 | $65.70 | 0 | Investigate |
| 10 | air conditioning repair dublin ohio | Broad | 9 | $77.40 | 2 | Promote |
| 11 | ac tune up special | Broad | 8 | $60.00 | 1 | Leave (wrong ad group) |
| 12 | ac repair jobs columbus | Broad | 7 | $51.10 | 0 | Negative |
| 13 | free ac repair estimate | Broad | 6 | $49.80 | 0 | Negative |
| 14 | window ac unit repair | Broad | 6 | $44.40 | 0 | Negative |
| 15 | ac repair grove city ohio | Broad | 6 | $52.20 | 1 | Investigate |
| 16 | ac capacitor replacement part | Broad | 5 | $37.00 | 0 | Negative |
| 17 | reliable heating and air columbus | Phrase | 4 | $38.80 | 0 | Negative |
| 18 | used ac units for sale | Broad | 4 | $28.00 | 0 | Negative |
| 19 | best hvac company columbus ohio | Broad | 3 | $31.50 | 0 | Investigate |
| 20 | hvac school columbus | Broad | 2 | $12.90 | 0 | Negative |

### New exact keywords

Rows 2, 4, and 6 clear the promotion bar outright, with three or more conversions each, and should become exact match keywords in their own right. Rows 8 and 10 do not clear it on their own numbers; the case for them rests on the suburb pattern described below. Rows 2 and 4 are the strongest: `air conditioner repair near me` produced 6 conversions on 36 clicks, a 16.7% conversion rate against the ad group's 11%, at a CPA of $302.40 / 6 = $50.40. That is under the $60 target. Promote it to exact and give it a higher bid ceiling, because its conversion rate supports $60 x 0.167 = $10.02 per click.

`emergency ac repair columbus` did 5 conversions on 22 clicks: 22.7% conversion rate, CPA of $198.00 / 5 = $39.60, and a supported CPC of $60 x 0.227 = $13.62 against an actual CPC of $9.00. This term is underbid. It also deserves its own ad group so the copy can say "open now" during the 7am–9pm staffed schedule and the landing page can lead with the phone number.

Rows 8 and 10, the suburb terms, converted 2 out of 11 and 2 out of 9. That is thin on its own, but they form a pattern with row 15: geo-qualified queries are converting. Promote both to exact and open a "Geo - Suburbs" ad group seeded with Westerville, Dublin, Grove City, Hilliard, Gahanna, and Worthington so the ads can name the suburb.

Row 3, `ac not blowing cold air`, is the symptom-query bet paying off: 3 conversions on 28 clicks is 10.7%, essentially the ad group average, at a CPA of $221.20 / 3 = $73.73. Promote to phrase match, not exact, because you want the variations, and keep the negatives tight around it.

### New negatives, by level

| Search term | Negative to add | Match type | Level |
| --- | --- | --- | --- |
| how to fix ac unit yourself | "how to", "yourself", "diy" | Phrase | Shared list |
| ac repair jobs columbus | "jobs", "job", "hiring" | Phrase | Shared list |
| free ac repair estimate | "free" | Phrase | Shared list |
| window ac unit repair | "window ac", "window air conditioner" | Phrase | Campaign |
| ac capacitor replacement part | "part", "parts", "capacitor" | Phrase | Shared list |
| used ac units for sale | "used", "for sale" | Phrase | Shared list |
| reliable heating and air columbus | "reliable heating" | Phrase | Competitors list |
| hvac school columbus | "school", "training", "certification" | Phrase | Shared list |

Note the pattern: almost none of these go in at the ad group level, and almost all of them are added as *categories* rather than as the literal query. Blocking the exact query `how to fix ac unit yourself` would be nearly useless; blocking the phrase `"how to"` protects every campaign forever. Note also the plural discipline - `"job"` and `"jobs"` are separate entries because negatives do not match close variants.

### Rows that are too thin to act on

Rows 15 and 19 have 6 and 3 clicks. Row 15 converted once, which is a 16.7% rate on a sample of six - meaningless in isolation, though it supports the suburb pattern above. Row 19, `best hvac company columbus ohio`, spent $31.50 with no conversions on 3 clicks. Three clicks with no conversion tells you nothing at all: at an 11% conversion rate, the probability of getting zero conversions in three clicks is about 70%. Leave it. Row 9, `why is my ac leaking water`, is the borderline informational term: 9 clicks, $65.70, no conversions. Also not enough to condemn it. Tag both "investigate," set a reminder, and re-read them at 25 clicks.

Row 5 is the genuinely interesting failure. `hvac repair cost columbus` took 18 clicks and $142.20 for a single conversion. CPA is $142.20, above the $108 break-even. But this is a price-shopping query, not junk, and blocking `"cost"` would also block queries that convert. The right response is to bid it down: at a 1-in-18 observed conversion rate, call it 5.5%, and the supported CPC at target is $60 x 0.055 = $3.30 versus the $7.90 it is currently paying. Move it to its own keyword with a $3.30 cap and a landing page that leads with the $79 diagnostic price.

Row 11 is a routing problem, not a performance problem. `ac tune up special` is a maintenance-plan query being served by the repair ad group. Add `-tune up` and `-maintenance` as ad group negatives on AC Repair so those queries reach the Maintenance Plans campaign, which has the right copy and the right offer.

### The arithmetic of the recovered spend

The seven junk rows verdicted "Negative" - rows 7, 12, 13, 14, 16, 18, and 20 - are queries Northgate should never have bought at all. Row 17, the competitor name, is also verdicted "Negative", but it is left out of this block because excluding it is a strategy decision about competitor bidding rather than junk removal.

```txt
WASTED SPEND, AC REPAIR AD GROUP, 30 DAYS

  how to fix ac unit yourself      12 clicks    $88.80
  ac repair jobs columbus           7 clicks    $51.10
  free ac repair estimate           6 clicks    $49.80
  window ac unit repair             6 clicks    $44.40
  ac capacitor replacement part     5 clicks    $37.00
  used ac units for sale            4 clicks    $28.00
  hvac school columbus              2 clicks    $12.90
                                   ---------   -------
  TOTAL                            42 clicks   $312.00

  Share of ad group spend  = $312.00 / $3,200 = 9.75%

WHAT $312 BUYS ON RELEVANT TERMS
  Clicks at ad group avg CPC   = $312.00 / $8.20 = 38.0 clicks
  Leads at 11% conversion      = 38 x 0.11       = 4.18 leads
  Gross profit at $108/lead    = 4.18 x $108     = $451.44

EFFECT ON REPORTED CPA (spend removed, conversions unchanged)
  Old CPA = $3,200 / 43 = $74.42
  New CPA = $2,888 / 43 = $67.16
  Improvement                  = $7.26 per lead, a 9.8% reduction

EFFECT IF THE $312 IS REDEPLOYED INSTEAD OF CUT
  Conversions = 43 + 4.18 = 47.18
  CPA         = $3,200 / 47.18 = $67.83
  Extra gross profit                = $451.44
  Annualized (12 x $451.44)         = $5,417.28
```

Two honest caveats on that last block. Annualizing a single month is optimistic for a seasonal business, so treat $5,417 as an upper bound rather than a forecast. And the redeployed clicks will not convert at exactly 11%; if the incremental clicks are marginally worse than the average click, the real number is lower. Even so, roughly ten percent of one ad group's spend was being handed to people who were never going to buy anything, and it took twenty rows and one hour to find it. That is the return on the search terms routine.

Note also what did *not* happen: nothing here required raising the budget, changing the bid strategy, or rewriting an ad. The account got about 10% cheaper by subtraction.

## Duplicates, cannibalization, and organization

Two structural problems come out of aggressive keyword expansion, and both are worth catching before they compound.

**Duplicate keywords** are the same keyword and match type appearing in more than one ad group in the same campaign. They do not bid against each other in the auction - Google picks one and suppresses the other - but they do fragment your reporting, split your conversion data across two rows so neither reaches statistical usefulness, and make it impossible to tell which ad copy actually earned the lead. The fix is to run a duplicate check monthly and delete the weaker instance. If you have `[ac repair columbus]` in both the AC Repair ad group and a new Geo - Suburbs ad group, remove it from one.

**Cannibalization** is subtler. It happens when two *different* keywords in different ad groups both match the same query, and the one Google picks is not the one you would pick. If you have `ac repair` on broad in the AC Repair ad group and `[ac repair westerville]` on exact in the suburbs ad group, a search for `ac repair westerville` will normally go to the exact match, which is what you want. But if you have `ac repair` on broad and `"ac repair westerville"` on phrase, the routing is less predictable and depends on Ad Rank. The general behavior is that the more specific match type wins when both are eligible, but you should not rely on it as a design principle. Design instead so that ad groups are separated by concepts, not just by wording, and use ad group negatives to enforce the separation you intend.

That is where this lesson hands off to the structure you built in lesson 03. Your keyword organization *is* your account structure. When the search terms report tells you that suburb queries convert, that is not a keyword decision, it is a new ad group with its own copy and its own landing page. When it tells you that `emergency` converts at double the rate, that is not a bid change, it is a separate ad group so the copy can say "we are open right now" during staffed hours. The general rule: **any group of queries that deserves a different ad or a different landing page deserves a different ad group**. Match types and negatives are the plumbing that routes the query to the right one. Bidding those ad groups against each other correctly is lesson 06.

## Practice

You are building the keyword plan for Northgate's **Furnace Install** ad group and mining the AC Repair search terms report above. Work in Keyword Planner inside a draft or paused Google Ads account, or in the free planning tools. **No campaign may be enabled and no live budget may be spent.**

Furnace Install economics, for your bid math:

```txt
Replacement lead gross profit  = 0.18 close x $2,400 = $432
Target CPA (replacement)       = $180
Ad group conversion rate       = 6.7%
Current avg CPC                = $8.99
Current CPA                    = $1,600 / 12 = $133.33
```

**Part 1 - Keyword plan (deliverable: one spreadsheet tab called `furnace-install-plan`)**

1. Compute and record, at the top of the tab, the maximum CPC at the $180 target CPA and the break-even CPC, using the formula `CPC ceiling = CPA x conversion rate`. Show the multiplication.
2. Build a seed list of at least 30 terms for furnace installation and system replacement, organized under the four headings from this lesson: services, symptoms, brands, geography. Symptoms for this ad group are heating symptoms, not cooling.
3. Run the seed list through Keyword Planner for the Columbus, Ohio metro. Export at least 25 rows with monthly searches, competition, and top-of-page bid range.
4. Produce a final buy list of 12 to 18 keywords. For each row record: keyword, match type, your estimated conversion rate, the CPC ceiling that estimate supports at the $180 target, your starting bid, and a one-sentence rationale. Your starting bid must be at or below your computed ceiling, and you must state where each conversion-rate estimate came from.
5. Include at least two keywords you considered and rejected, with the arithmetic that killed them. At least one rejection must be a high-volume term with weak commercial intent.
6. Mark which keywords, if any, belong in a different ad group and say which one.

**Part 2 - Search terms mining (deliverable: two tabs, `negatives` and `new-keywords`)**

7. Using the 20-row AC Repair search terms report in this lesson, produce a `negatives` tab with one row per negative: negative keyword, match type (broad, phrase, or exact), level (ad group, campaign, or shared list), the shared list name if applicable, and a one-line reason. Add plural and singular forms where needed, and say in a comment why that is necessary.
8. Produce a `new-keywords` tab with one row per promoted term: keyword, match type, destination ad group (existing or new), starting bid, the observed conversion rate and CPA from the report, and the rationale. Only promote terms that clear the bar stated in this lesson, and mark anything you are deferring as "investigate" with the click threshold at which you will re-read it.
9. Add a `wasted-spend` block showing your own version of the arithmetic: total wasted spend, its share of the ad group's $3,200, how many clicks that buys at $8.20, how many leads that is at 11%, and what it is worth at $108 per lead. Show every division.
10. Write a short note, no more than 150 words, naming one row you chose *not* to make a negative even though it did not convert, and explaining why blocking it would cost more than it saves.

**Part 3 - Competitive read (deliverable: half a page in the same file)**

11. Using the auction insights table in this lesson, name which competitor you would attack and which you would concede, and state the specific lever you would pull. Do not answer "raise bids" without also stating what evidence would tell you the bid raise was working.
12. Run four of your Furnace Install commercial-intent queries through the ad preview tool and record what each competitor's ad promises. Name one positioning gap that is true of Northgate and not claimed by anyone else. You will use it in lesson 05.
