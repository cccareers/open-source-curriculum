---
lesson_id: dm230-05
course_id: dm230
pathway: digital-marketer
title: Ad Copy, Assets, and Ad Policy
order: 5
kind: lesson
competency_ids:
  - D2-S1-C03
  - D7-S2-C02
objectives:
  - Write compliant ad copy and assets that match the query and the landing page
  - Check an ad against advertising policy before it runs
---

## The job of a paid search ad

A paid search ad is not brand advertising. Brand advertising creates demand where none existed and gets judged over quarters. A search ad arrives after the demand already exists, into a moment where somebody typed a specific string of words because they have a specific problem right now. Your ad has one job in that moment: **make a promise that answers the query, and be sure the landing page keeps it.**

That framing rules out most of what people write. "Northgate Heating and Air - Central Ohio's Trusted HVAC Partner Since 1994" is a fine thing to put on the side of a truck. As an ad against the query `ac not blowing cold air`, it is nearly worthless, because it answers a question nobody asked. The searcher wants to know whether somebody can come today and roughly what it will cost. An ad that says so will beat an ad that says "trusted partner" every time, and the auction will reward it: a higher click-through rate improves your quality signals, which lowers your actual cost per click at the same position (lesson 02 has the mechanism).

The promise framing also gives you the honest constraint that runs through the rest of this lesson. If the ad says "tech at your door in 90 minutes," a tech has to actually be at the door in 90 minutes. If the ad says "$79 diagnostic," the landing page has to say $79 and the invoice has to say $79. Copy that outruns the business is not clever marketing; it is a refund request, a bad review, and in several categories a policy violation that gets the ad blocked before anyone sees it. Ad copy and ad policy are the same subject approached from two sides, which is why they share a lesson.

## The three-way message match

Message match is the continuity between what the searcher typed, what your ad promised, and what the landing page delivers. Break any one of the three links and you pay for a click you cannot convert.

Here are the two versions side by side, for the query `emergency ac repair columbus` at 8pm on a July night.

```txt
BAD MESSAGE MATCH

  Query:     emergency ac repair columbus

  Ad H1:     Northgate Heating & Air
  Ad H2:     Serving Central Ohio Since 1994
  Ad H3:     Quality You Can Trust
  Ad D1:     Full-service residential and light commercial HVAC. Repair,
             installation, and maintenance for every major brand.
  Final URL: northgateheatingair.com

  Landing:   Homepage. Hero image of a truck. Nav bar with 7 links.
             Phone number in 12px type in the header. No hours shown.
             "Request a Quote" form, 9 fields, below the fold.

  Breaks:    Query said EMERGENCY. Ad said nothing about availability.
             Ad said nothing about tonight. Landing page said nothing
             about tonight. Searcher has to hunt for the phone number
             at 8pm with a hot house. They bounce and call competitor #2.


GOOD MESSAGE MATCH

  Query:     emergency ac repair columbus

  Ad H1:     Emergency AC Repair, Columbus
  Ad H2:     Open Now - Call Until 9pm
  Ad H3:     $79 Diagnostic, No Overtime
  Ad D1:     AC out? Call 7am-9pm, seven days. $79 diagnostic, no overtime.
             Arrival window confirmed.
  Assets:    Call asset (tap to call), Location asset, Sitelinks
  Final URL: northgateheatingair.com/emergency-ac-repair

  Landing:   H1 reads "Emergency AC Repair in Columbus - Open Now".
             Tap-to-call button above the fold, 44px tall.
             "$79 diagnostic, no overtime charges" stated in the first
             screen. 3-field form as the secondary path. Nothing else.

  Holds:     Query -> ad -> page all say the same three things:
             emergency, staffed availability, $79.
```

The bad version is not badly written in a grammar sense. It is badly matched. Its company facts are true, but none of them answers the query. The good version runs during staffed hours and repeats "emergency," "now," and "$79" at all three stages, which is not repetitive to the searcher because they only see each stage once. Repetition across stages reads as confirmation: *yes, you are in the right place.*

Two practical rules follow. First, **the final URL is part of the copy**. If your ad group has one landing page for six unrelated keyword themes, you have already lost the match, and no headline will fix it. That is why keyword organization drives ad group organization (lesson 04) and why deep landing page design gets its own treatment in lesson 09. Second, **write the landing page headline and the ad headline at the same sitting**, so they cannot drift.

## Responsive search ads in practice

A responsive search ad, or RSA, is not a single ad. You supply a pool of headlines and descriptions, and the system assembles combinations at auction time, choosing what to show based on the query and its own performance data.

The mechanics you need to hold in your head:

- **Headlines are limited to 30 characters each**, and you can supply up to 15. Typically two or three headlines appear in a served ad, separated by vertical bars.
- **Descriptions are limited to 90 characters each**, and you can supply up to 4. Typically one or two appear.
- Character counts include spaces and punctuation. There is no soft limit; at 31 characters the field simply will not save.
- Not every headline appears in every ad. Any one of them may be shown alone with two others you did not anticipate.

That last point drives the most important writing rule for RSAs: **every headline has to make sense next to every other headline.** If you write "Book Online in 2 Minutes" and "Call Now for Same-Day Service," the system can serve both together and the ad tells the searcher to do two different things. Write headlines as independent, self-contained claims, not as a sentence chopped into thirds.

### How many to write

Write all 15 headlines and all 4 descriptions unless you have a specific reason not to. The system cannot test what you did not give it, and a pool of 5 headlines produces far fewer viable combinations than a pool of 15. But do not pad the pool with near-duplicates to hit the number. Three headlines that say "Fast Service," "Quick Service," and "Rapid Response" are one headline stored three times; they add no information for the system to learn from. Aim for 15 headlines that cover distinct *angles*: the service, the geography, the speed, the price, the proof, the availability, the offer, the call to action, the brand.

### Pinning, and when it starves the system

Pinning locks a specific asset to a specific position - headline position 1, 2, or 3, or description position 1 or 2. A pinned asset always appears in that slot, and nothing else can.

Pinning is right when something *must* appear or must not appear in a given place. Legitimate cases:

- A regulated disclosure that has to be in every served ad.
- A brand name that legal requires in headline 1.
- A claim that only makes sense first, such as a franchise location name.

Pinning is wrong when it is used as a substitute for judgment. If you pin all three headline positions, you have not built a responsive ad; you have built one static ad with extra steps, and you have thrown away the entire testing mechanism. If you pin two headlines to positions 1 and 2, the system can only vary position 3, so it is testing 13 assets in one slot instead of 15 assets across three. The combinatorial space collapses and learning slows to a crawl.

The middle path most accounts should use: **pin at most one headline, and only when you have a real reason.** If you need to guarantee a price claim appears, an alternative to pinning is to put the price into more than one headline so the odds of it showing are high without locking a slot.

### Asset strength is a weak signal

Google reports an "Ad Strength" rating on RSAs, from Poor through Excellent. Treat it as a checklist prompt, not a performance metric. It rewards quantity of assets, diversity of wording, keyword inclusion in headlines, and low pinning. Those correlate loosely with good practice, but the rating does not know your conversion rate, your margins, or your brand rules. A pinned, disclosure-heavy ad in a regulated category can be rated Poor and be exactly correct. An ad rated Excellent can be full of vague adjectives.

Use Ad Strength this way: if it says Poor, read why, because it usually means you did something structurally lazy like supplying 4 headlines. If it says Average or better, ignore it and look at click-through rate and conversion rate instead.

## Copywriting technique

### Lead with the searcher's problem, not the company

The default failure is writing from the inside out: who we are, how long we have been here, what we value. The searcher does not have a relationship with you yet, and at 8pm with a dead air conditioner they will not be starting one. Open with their situation.

Weak: "Northgate Heating & Air - Serving You Since 1994"
Strong: "AC Not Cooling? We're Open"

The second one is 26 characters, contains the searcher's exact symptom, and answers the only question they have. There is still a place for the brand name, but it is a supporting headline, not the lead.

### Specificity beats adjectives, always

This is the single highest-leverage habit in ad copy. Adjectives are free, which is why every competitor uses them, which is why they carry no information. Numbers and nouns cost something to claim, which is why they persuade.

| Adjective version | Specific version | Why the second wins |
| --- | --- | --- |
| Fast, friendly service | Arrival window confirmed on call | A commitment the reader can plan around |
| Affordable rates | $79 diagnostic, no overtime | Removes the fear of a surprise bill |
| Experienced technicians | Serving central Ohio since 1994 | Verifiable, and locally specific |
| Trusted by homeowners | 4,100 Columbus AC repairs | A count, not a feeling |
| Extended service hours | Open 7am-9pm, seven days | Names the actual hours someone answers |

Run this test on every headline you write: **could a competitor put this exact line in their ad without changing anything?** If yes, it is an adjective, and it is doing nothing. "Fast, friendly service" passes that test for all four of Northgate's competitors. "Open 7am-9pm, seven days" gives the reader a checkable schedule rather than a vague promise.

### Proof

Specificity and proof are cousins. Proof is the reason to believe the promise, and for a local service business it comes in four reliable forms:

- **Tenure.** "Serving central Ohio since 1994." Cheap to state, hard to fake, and locally relevant.
- **Credentials.** "Licensed & insured in Ohio." This one is table stakes for a trade, and it must be true - see the substantiation section below.
- **Volume.** "4,100 Columbus AC repairs." Counts beat superlatives, because a count is checkable and a superlative is not.
- **Ratings.** "4.8 stars, 900+ reviews," if it is accurate and current.

Notice what is not on that list: "#1," "best," "top-rated," "voted the finest." Those are unsubstantiated superlatives, they persuade nobody, and they are a policy problem. More on that shortly.

### The offer and the call to action

An offer is a concrete thing the searcher gets. A call to action is the next physical step. They are different and you need both.

Northgate's service and contact hours are 7am to 9pm, seven days. Schedule availability claims and call assets within those hours; online forms can be submitted overnight, with a callback after reopening. Its annual maintenance plan costs $189 and produces $95 of first-year gross profit.

Northgate's offer is the $79 diagnostic with no overtime charge. It is a good offer because it removes the specific fear that stops people from calling an HVAC contractor at 8pm: that they are about to be gouged for an evening or weekend visit during staffed hours.

The call to action has to match the device and the mindset. On mobile, at 8pm, in an emergency, the call to action is "call," and the tap-to-call asset does most of the work. On desktop, at 2pm, researching a system replacement, the call to action is "get a quote" or "compare systems," because the searcher is not going to call a contractor from their office. Write both. The system will learn which pairs with which query.

### Emergency mindset versus researching mindset

The same business serves two completely different psychological states, and copy that serves one will underperform for the other. This is the strongest argument for separating ad groups by intent.

| | Emergency mindset | Researching mindset |
| --- | --- | --- |
| Typical query | ac not blowing cold air | ac replacement cost columbus |
| Time horizon | Tonight | 2 to 8 weeks |
| Main fear | Nobody will come, and it will cost a fortune | Making an expensive mistake |
| What persuades | Availability, response time, flat pricing | Options, financing, efficiency, warranty |
| Best call to action | Call now | Get a free estimate |
| Northgate ad group | AC Repair | Furnace Install / Replacement |
| Lead value | $108 | $432 |
| Target CPA | $60 | $180 |

Writing "Free In-Home Estimate - Compare 4 System Options" against `ac not blowing cold air` is a mismatch that costs you money at $8.20 a click. Writing "We're Open Now - Call Until 9pm" against `high efficiency furnace cost` is the same mistake in reverse.

## Character-count discipline

Here is a full RSA asset set for Northgate's AC Repair ad group, with the character count of every line. Count characters before you write, not after; the discipline of hitting 26 to 30 characters shapes the sentence, and the shaping is most of the craft.

```txt
NORTHGATE - AC REPAIR AD GROUP - RSA ASSETS
(headline limit 30 chars, description limit 90 chars; counts include spaces)

HEADLINES
 1  AC Repair in Columbus, OH          [25]
 2  Arrival Window Confirmed          [24]
 3  AC Not Cooling? We're Open         [26]
 4  $79 Diagnostic, No Overtime        [27]
 5  Same-Day AC Repair Service         [26]
 6  Licensed & Insured in Ohio         [26]
 7  Open 7am-9pm, Seven Days          [24]
 8  Serving Columbus Since 1994       [27]
 9  Book a Visit Online in 2 Min       [28]
10  Upfront Pricing, No Surprise       [28]
11  4,100 Columbus AC Repairs          [25]
12  Northgate Heating & Air            [23]
13  Fast, Friendly Service             [22]   <- weak, see critique
14  Quality You Can Trust              [21]   <- weak, see critique
15  The #1 AC Company in Ohio          [25]   <- weak AND non-compliant

DESCRIPTIONS
 1  AC out? Call 7am-9pm, seven days. $79 diagnostic. We confirm your arrival window. [81]
 2  Serving central Ohio since 1994. Licensed, insured, upfront pricing. Book online today. [87]
 3  No overtime charges during 7am-9pm service hours, seven days. Call or book online. [82]
 4  We serve Columbus, Westerville, Dublin, and Grove City. Real
    techs, real trucks, today.                                     [87]

PINNING PLAN
  Nothing pinned. No legal or brand requirement forces a position,
  and the $79 price claim already appears in headline 4 and
  description 1, so it will surface often without a pin.
```

### Critique of the three weak headlines

**#13 "Fast, Friendly Service" (22).** Two adjectives and a noun, zero information. It fails the competitor test completely: all four of Northgate's rivals could paste this line into their ads unchanged. It also wastes 8 characters of unused budget - at 22 of 30, there was room to say something. Rewrite: "Open Until 9pm, Seven Days" [26], which is 26 characters and states an availability claim a competitor who closes at 5pm cannot copy.

**#14 "Quality You Can Trust" (21).** Worse, because it is not merely uninformative, it is unfalsifiable. There is no version of the world in which this statement is checkable, which means the reader's brain discards it. Rewrite: "4.8 Stars, 900+ Reviews" [23] - same reassurance function, but it is a number, and a number can be verified on the landing page.

**#15 "The #1 AC Company in Ohio" (25).** This one is not just weak, it is a policy violation. It is an unsubstantiated superlative: there is no named ranking, no source, and no way for a reader to check it. Ads making unverifiable "#1" or "best" claims are routinely disapproved under misrepresentation policy, and even when they slip through they invite a complaint from a competitor. Rewrite: "Rated 4.8 by 900+ Neighbors" [27], which conveys the same social proof and is substantiable, provided the rating is real and shown on the landing page.

## Localization and dynamic insertion

Location words earn their characters in local service ads. "AC Repair in Columbus, OH" outperforms "AC Repair Services" because it answers an unspoken question - do you come to my area? - and because the query usually contains the location too, and matched terms are bolded in the served ad.

Dynamic insertion features let a single asset adapt to the query. **Keyword insertion** substitutes the matched keyword into the headline. **Location insertion** substitutes the user's city or region. **Countdown** inserts a live timer to a promotion end date.

These are useful and they are also the most common source of embarrassing ads. Three rules:

1. **Write a default that stands alone.** Insertion syntax includes a fallback for when the substituted text would exceed the character limit. Write the fallback as if it will always be used, because for long keywords it will.
2. **Read every keyword in the ad group as if it were inserted.** If your ad group contains `ac repair`, keyword insertion produces "AC Repair" and that is fine. If somebody later adds `cheap emergency ac repair columbus ohio near me`, the insertion breaks the limit and you fall back, or worse, it fits and your ad now says "Cheap." Never combine keyword insertion with a loosely governed ad group.
3. **Do not use countdown timers to manufacture urgency.** A countdown to a real promotion end date is legitimate. A countdown that resets every day, or a "only 2 slots left today" claim that is not tied to actual capacity, is fake urgency, and it belongs in the policy section below.

For Northgate, location insertion is the better tool than keyword insertion: the suburbs ad group can run one asset that renders "AC Repair in Westerville" or "AC Repair in Dublin," with the fallback "AC Repair in Central Ohio" [25].

## Assets and extensions

Assets, still widely called extensions, are the extra lines, links, and buttons that attach to your ad. They are free to add, they occupy screen space that would otherwise go to a competitor, and they consistently lift click-through rate. Ignoring them is the most common unforced error in a new account.

| Asset | What it is for | Northgate? |
| --- | --- | --- |
| Sitelinks | 2 to 6 extra links to specific pages, each with description text | Required |
| Callouts | Short non-clickable phrases; benefits and reassurances | Required |
| Structured snippets | A labeled list, such as Services or Brands | Required |
| Call | Tap-to-call button; can report calls as conversions | Required |
| Location | Address, distance, and map link, from a linked business profile | Required |
| Lead form | An in-ad form, so the user never reaches the site | Optional |
| Image | A square or landscape image beside the text ad | Recommended |
| Price | A row of service-and-price cards | Recommended |
| Promotion | A discount or offer with a currency amount or percent | Situational |

For a local service business the first five are not optional. **Call and location are the ones that convert**, because at 8pm on a mobile phone the fastest path to a booked job is a thumb on a phone number. Sitelinks, callouts, and structured snippets are the ones that lift click-through rate by making the ad physically larger.

A caution on lead form assets: they capture leads who never see your site, which is good for volume and bad for lead quality, because the person has not read anything about you. If you use one, expect a lower booking rate than a form on your own page and hold it to a different CPA target.

```txt
NORTHGATE - ASSET SET (AC Repair campaign)

SITELINKS (link text / description line 1 / description line 2)
  Emergency AC Repair    / Call 7am-9pm        / $79 diagnostic fee
  $79 Diagnostic         / Flat rate, no overtime  / Nights and weekends
  Service Areas          / Columbus and suburbs    / 25-mile radius
  Book a Visit           / 3-field form, 2 minutes / Same-day slots
  Maintenance Plans      / $189/year, 2 tune-ups      / Priority scheduling

CALLOUTS (no links, keep each under about 25 characters)
  Licensed & Insured
  No Overtime Charges
  Same-Day Service
  Columbus Since 1994
  Upfront Flat Pricing
  Financing Available

STRUCTURED SNIPPETS
  Header: Services
    AC Repair, Furnace Repair, System Replacement, Maintenance Plans,
    Duct Sealing, Thermostat Install
  Header: Brands
    (only list brands Northgate is an authorized servicer for)

CALL ASSET
  (614) 555-0142, scheduled 7am-9pm, seven days, call conversions on at 60 seconds

LOCATION ASSET
  Linked to the verified business profile, single shop, 25-mile radius

IMAGE ASSET
  Branded truck at a real Columbus home, technician visible, no text
  overlay, square 1:1 and landscape 1.91:1 versions

PRICE ASSET (header: Services)
  Diagnostic Visit       $79   / Flat fee, applied to repair
  AC Tune-Up             $129  / 21-point inspection
  Maintenance Plan       $189/year / Two visits per year

PROMOTION ASSET
  Not used in July. Emergency demand does not need a discount, and a
  promotion here would only cut margin on leads that would convert
  anyway. Revisit for the shoulder season in October.
```

Two things to notice in that set. The structured snippet for Brands is deliberately left conditional, because listing a manufacturer you are not authorized to service is both a trademark problem and a lie. And the promotion asset is deliberately unused, with a reason recorded. Not using an asset is a legitimate decision; not knowing whether you use it is not.

### How assets change the arithmetic

Assets are usually sold as "they improve click-through rate," which is true and useless without a number. Do the number. Suppose the full asset set lifts the AC Repair ad group's click-through rate from 6.4% to 7.6% on the same 6,100 monthly impressions.

```txt
CTR LIFT: 6.4% -> 7.6%, AC REPAIR AD GROUP

  Impressions                = 6,100  (390 clicks / 0.064, rounded)

  Clicks before              = 6,100 x 0.064 = 390.4
  Clicks after               = 6,100 x 0.076 = 463.6
  Extra clicks               = 463.6 - 390.4 = 73.2   (call it 73)

  Extra leads at 11% CVR     = 73 x 0.11     = 8.03 leads
  Gross profit at $108/lead  = 8.03 x $108   = $867.24

  Cost of the extra clicks   = 73 x $8.20    = $598.60
  Net gain                   = $867.24 - $598.60 = $268.64

  Incremental CPA            = $598.60 / 8.03 = $74.55
```

Now read that honestly, because the headline number is not the whole story.

The incremental CPA of $74.55 is **above** Northgate's $60 target and **below** the $108 break-even. So these extra leads make money but they do not hit target, which means they are worth taking only if the budget is not already committed to something better. And it is: Northgate spends a fixed $200 a day. Extra clicks do not appear from nowhere; they either raise spend or they displace other clicks. If the budget stays fixed, the honest way to state the benefit is that a higher click-through rate lets you buy the *same* number of clicks from *fewer* impressions, freeing impression share, and that it improves quality signals, which lowers your actual CPC at the same position. That second effect is the real prize, and it compounds with every other improvement in the account.

One more caution: a click-through rate lift of that size takes weeks of data to confirm, and comparing "before assets" to "after assets" across two different calendar months in a seasonal business is not a valid test. Lesson 10 covers how to design a test that would actually support this claim.

## Ad policy and ethics

Policy and ethics are one topic with two enforcement mechanisms. Policy is enforced by an automated and human review system that can block your ad or suspend your account. Ethics is enforced by your customers, your reviews, and your own standards. Plenty of ads clear policy and are still wrong, and a professional needs both filters.

### Categories that get ads disapproved

You do not need to memorize policy text. You need to know the *categories* so you can spot risk in your own draft before you submit it.

**Misrepresentation.** The largest bucket. It covers unrealistic claims, promises the business cannot keep, offers whose terms are not available on the landing page, and pricing in the ad that does not appear on the site. If the ad says "$29 AC repair" and the site says "$79 diagnostic," that is bait-and-switch pricing and it is a misrepresentation problem, not a copywriting nitpick.

**Unsubstantiated superlatives.** "#1," "best," "top-rated," "the finest in Ohio." A superlative is allowed when it is attributable to a named, verifiable third-party ranking that is visible on the landing page. Absent that, it is a disapproval risk. Counts and ratings are the safe substitute.

**"Guaranteed" and absolute promises.** Guarantees are not automatically banned, but a guarantee that cannot be honored, or whose terms are not stated on the landing page, is misrepresentation. "Guaranteed lowest price in Columbus" from a business that has not surveyed every competitor's price is unsupportable by construction.

**Fake urgency and pressure.** Countdown timers that reset, "only 2 slots left" claims not tied to real capacity, and manufactured scarcity. This is both a policy issue and the clearest ethics issue in the list.

**Trademark use.** You may generally *bid on* a competitor's brand name as a keyword. You generally may **not** use their trademark in your ad text. "Buckeye Comfort Systems Customers Save 20% Here" uses a competitor's mark in the copy and is a standard trademark complaint. The same rule protects Northgate's name from being used in a competitor's copy.

**Restricted claims about health and safety.** Fear-based claims tying a service to illness or death sit in a sensitive area, and for a trade like HVAC this comes up more than you would expect. Carbon monoxide is a real hazard and it is legitimate to offer detection, but "Your Family Could Die Tonight - Call Now" is fear-mongering, and personalized-advertising rules further restrict targeting people based on inferred health conditions.

**Editorial rules.** These are the mechanical ones and they cause a surprising share of disapprovals: excessive capitalization ("FREE ESTIMATE NOW"), repeated punctuation ("Call Now!!!"), gimmicky symbols and spacing, nonstandard spelling, and vague calls to action like "click here." They are easy to avoid and easy to commit at 6pm when you are pasting in a draft.

**Personalized advertising rules.** These restrict advertising that implies knowledge of a user's sensitive characteristics - health status, financial hardship, and similar. "Behind on Your Bills? Get HVAC Financing" implies knowledge of the reader's financial state and is the kind of line that draws a review.

### Disapproved versus merely unethical

These are different failure modes and you need to be able to tell them apart, because only one of them stops you automatically.

**Disapproved (blocked, will not serve).** "Guaranteed Lowest AC Repair Price in Columbus - Or We Pay You $500." This will be rejected under misrepresentation. It makes an absolute price guarantee the business cannot verify, attaches a payout with no stated terms, and neither the guarantee nor the terms appear on the landing page. Nobody sees the ad, so nobody is harmed, and you find out within a day.

**Merely unethical (allowed, will serve, still wrong).** "Free AC Inspection - No Charge, No Obligation," where the inspection genuinely is free and the landing page says so, but every technician is compensated on replacement sales and is instructed to recommend a full system replacement on every visit regardless of what they find. Every word of the ad is literally true. It passes policy review cleanly. It is a lead-generation scheme that uses a free service to create a sales pretext, and it will produce exactly the reviews it deserves.

A second, subtler example of the same class: the ad says "$79 Diagnostic," the landing page says "$79 diagnostic" in the hero, and a footnote in 10px grey at the bottom of the page says "per system; $45 trip charge applies outside I-270." The price is technically findable, so it will likely clear review. It is still designed so that the number the customer remembers is not the number they pay. **The test for the ethical layer is not "is it findable?" It is "will the customer feel misled when the invoice arrives?"**

### Disclosure and substantiation

Every checkable claim in your copy creates an obligation. Before an ad goes live, walk the claims and name the evidence.

- "Licensed & insured in Ohio" - then the license must be current and the certificate of insurance in force. Put the license number on the landing page footer.
- "$79 diagnostic" - then $79 must be findable on the landing page, and any conditions on it must be stated where a normal person will read them, not only in a footnote.
- "Serving central Ohio since 1994" - then the business's operating history must support 1994, not the owner's personal experience across three employers.
- "4,100 Columbus AC repairs" - then somebody has to be able to produce the count from the job management system.
- "Tech at your door in 90 minutes" - then the dispatch data has to support it for the hours the ad runs. If 90 minutes is true from 8am to 6pm and it is really 3 hours overnight, either fix the claim or schedule the ad.
- "4.8 stars, 900+ reviews" - then the rating must be current, from a named platform, and shown on the site.
- Any manufacturer brand name - then Northgate must actually be an authorized servicer for it.

The discipline is simple and it takes ten minutes: for each claim, write down where the proof lives. If you cannot name the source, cut the claim.

### The pre-submission compliance checklist

Run this on every ad before you submit it. It is a lesson-05 deliverable and you will use it in the Practice section.

```txt
AD COMPLIANCE CHECKLIST - run before submitting

 1  Does every headline and description fit the character limit
    (30 / 90) with no truncation? ......................... Y / N
 2  Does the ad answer the query the ad group targets? ..... Y / N
 3  Does every claim in the ad also appear on the final URL
    landing page? ......................................... Y / N
 4  Is every price, discount, or offer in the ad findable on
    the landing page in normal-sized type? ................ Y / N
 5  Are there any superlatives (#1, best, top-rated)? If yes,
    is a named third-party source cited on the page? ...... Y / N
 6  Are there any guarantees? If yes, are the terms on the
    landing page? ......................................... Y / N
 7  Is any urgency claim tied to a real date or real
    capacity? ............................................. Y / N
 8  Does the ad name or imply a competitor's trademark? .... Y / N
 9  Does the ad make a health, safety, or fear claim? If yes,
    is it factual and non-coercive? ....................... Y / N
10  Editorial: excessive caps? repeated punctuation? gimmick
    symbols? vague "click here" CTA? ...................... Y / N
11  Does the ad imply knowledge of the user's health, finances,
    or other sensitive status? ............................ Y / N
12  Substantiation: for each factual claim, is the source
    named and current? .................................... Y / N
13  Would a reasonable customer feel misled by the invoice
    after reading this ad? ................................ Y / N
14  Has the current policy center text been read for any
    category flagged above? ............................... Y / N
```

Item 13 is the ethics item and it is the one no automated review will run for you. Item 14 exists because policy text changes.

### Flag it and fix it

Five Northgate drafts, each with a specific defect, and the corrected rewrite.

```txt
DRAFT 1
  H1: The #1 AC Repair Company in All of Ohio     [over limit, 39]
  Problem: Unsubstantiated superlative. No named ranking, not
           verifiable, and it is 39 characters so it will not save.
  Category: Misrepresentation / unsubstantiated superlative.
  Fix:  H1: Rated 4.8 by 900+ Neighbors           [27]
        Landing page must show the rating, the platform, and the
        review count.

DRAFT 2
  H1: Guaranteed Lowest Price - Or We Pay You $500     [over limit]
  D1: We beat any written estimate in Columbus, guaranteed, or we
      hand you $500 cash on the spot.
  Problem: Absolute price guarantee the business cannot verify, plus
           payout terms that appear nowhere on the site.
  Category: Misrepresentation / unrealistic claim.
  Fix:  H1: Upfront Pricing, No Surprise           [28]
        D1: Flat-rate pricing quoted before we start. You approve
            the number before any work begins.                 [88]

DRAFT 3
  H1: AC Repair From $29 - Call Now!!!             [over limit, 32]
  Landing page says: "$79 diagnostic fee."
  Problem: Two defects. The $29 price does not exist on the landing
           page, which is bait-and-switch pricing. And "!!!" is
           repeated punctuation.
  Category: Misrepresentation (pricing) + editorial.
  Fix:  H1: $79 Diagnostic, No Overtime            [27]
        The number in the ad and the number in the hero of the
        landing page must be the same number.

DRAFT 4
  H1: Buckeye Comfort Systems Customers Save 20%    [over limit]
  Problem: Uses a competitor's trademark in ad text. Bidding on the
           term as a keyword is generally permitted; putting their
           mark in the copy is not, and is a standard complaint.
  Category: Trademark.
  Fix:  H1: Switch to Northgate & Save 20%       [30]
        Keep the competitor keyword in its own campaign if the CPA
        justifies it; keep their name out of the copy.

DRAFT 5
  H1: ONLY 2 SLOTS LEFT TODAY                      [23, all caps]
  D1: ACT NOW BEFORE YOUR FAMILY GETS SICK FROM DIRTY AIR!!    [53]
  Problem: Four defects at once. Excessive capitalization; fake
           urgency not tied to real dispatch capacity; a health
           fear claim; repeated punctuation.
  Category: Editorial + misrepresentation + restricted health claim.
  Fix:  H1: Same-Day Slots Available Now           [28]
        D1: Two same-day windows are open today. Book online in
            2 minutes or call (614) 555-0142.                  [85]
        The slot count must come from the real dispatch board, and
        the copy must come down when the slots are gone.
```

Notice that in four of the five, the fix is *smaller and more specific* than the original. Non-compliant copy is almost always over-claiming copy, and over-claiming is what you do when you have nothing concrete to say. The compliant version is usually the better-performing version too, which is a convenient fact but not the reason to comply.

### Policy text changes; the categories do not

The exact wording of advertising policy, the specific list of restricted terms, and the enforcement thresholds all change, sometimes several times a year, and they differ by country. Nothing in this lesson should be treated as the current rule.

What is durable is the set of categories: misrepresentation, superlatives, guarantees, urgency, trademarks, restricted and sensitive claims, editorial standards, and personalized-advertising limits. Those have been the shape of search advertising policy for a long time and they will still be the shape when the wording changes.

So the professional habit is: **know the categories, then read the actual policy center for any category your ad touches, before launch, every time.** Ten minutes in the policy center is cheaper than a disapproval, and much cheaper than an account suspension, which can arrive with no warning and take days to appeal. If you are working in a regulated vertical - health, finance, legal, gambling, alcohol - assume there is an additional certification or restriction layer and find it before you write a word.

## Practice

You are writing the ad copy for Northgate's **Furnace Install** ad group and auditing a set of drafts. All work happens in a **paused or draft campaign**. Nothing may be enabled and no live budget may be spent.

Context for this ad group: replacement leads are worth $432 in gross profit, the target CPA is $180, the ad group converts at 6.7%, and the average CPC is $8.99. The searcher is in the researching mindset, not the emergency mindset. Assume Northgate offers a free in-home estimate, financing from $89 a month, a 10-year parts warranty on new systems, and installs within 5 business days.

**Part 1 - Write the RSA (deliverable: a text file `furnace-install-rsa.txt`)**

1. Write 15 headlines, each 30 characters or fewer, and print the exact character count next to each in brackets. Count spaces and punctuation. At least 10 must be 24 characters or longer, because unused characters are wasted space.
2. Cover at least eight distinct angles across the 15: service, geography, price or financing, proof, warranty, speed of install, offer, call to action, brand. Do not include two headlines that say the same thing in different words.
3. Write 4 descriptions, each 90 characters or fewer, with exact counts shown.
4. Verify combinability: pick any three headlines at random, five times, and write down whether the resulting ad reads sensibly. Fix any headline that only works in one position.
5. State your pinning plan and justify it in one sentence. If you pin anything, name the specific reason. "It sounds better first" is not a reason.
6. For each of your 15 headlines, apply the competitor test: could Buckeye Comfort Systems paste this line into their ad unchanged? Mark each Y or N. If more than 4 are Y, rewrite until fewer than 4 are.

**Part 2 - Message match and assets (same file)**

7. Write the landing page H1 that this ad set should point to, and show that at least two specific claims appear in the query, the ad, and the page headline.
8. Build a full asset set: 4 sitelinks with descriptions, 6 callouts, one structured snippet set, and a decision on the price and promotion assets. For every asset you choose not to use, record the reason.
9. Do the arithmetic on one asset decision. Assume the asset set lifts the Furnace Install click-through rate from 4.1% to 4.9% on 4,340 impressions. Compute the extra clicks, extra leads at 6.7%, the gross profit at $432 per lead, the cost of the extra clicks at $8.99, and the net. Show every multiplication and state where you rounded. Then write two sentences on why this number is not free money under a fixed daily budget.

**Part 3 - Compliance audit (deliverable: a table `compliance-audit`)**

10. Run all 15 of your headlines and all 4 descriptions through the 14-item compliance checklist in this lesson. Record any item you answered in a way that creates risk, and what you changed.
11. Take the five non-compliant drafts in the "Flag it and fix it" block. For each one, independently write your own correction without copying the one given, and name the policy category in the exact vocabulary of this lesson.
12. Write two additional non-compliant Furnace Install drafts of your own: one that would be **disapproved** and one that is **merely unethical but would serve**. For each, name the category, explain in two sentences why it falls where it does, and write the corrected version.
13. Build a substantiation table for your final ad set: one row per checkable claim, with the claim, where the proof lives, and who at Northgate would have to confirm it. Any claim you cannot source gets cut from the ad set before you call this exercise finished.
