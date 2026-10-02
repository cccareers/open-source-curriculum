---
lesson_id: dm270-07
course_id: dm270
pathway: digital-marketer
title: Measuring Content Performance
order: 7
kind: lesson
competency_ids:
  - D6-S1-C02
  - D6-S1-C03
objectives:
  - Measure content performance and decide what to publish next
  - Choose content KPIs that reflect the goal of the piece
---

## The only question a content report has to answer

Not "how did we do." **What should we publish next, and what should we stop publishing?**

A report that ends in a number is an artefact. A report that ends in a decision is the job. Everything in this lesson is arranged around getting from a table of figures to a defensible change in the plan you built in lesson 02.

**Scope.** dm301 is the analytics course: how the platform is configured, how events and conversions are defined, how to build reports, how user behaviour is read across a whole site, and how conversion-rate experiments are designed. That knowledge is assumed here and not repeated. This lesson applies it to one narrow, high-stakes problem — **evaluating a content library and deciding what to make next.**

## KPIs follow the job of the piece

The most common measurement failure in content is applying one metric to everything. A retention guide judged on conversions looks like a failure; an awareness video judged on revenue looks like a failure; a product comparison judged on time-on-page looks like a failure when a fast, confident decision is exactly what you wanted.

Choose the KPI from the job you gave the piece in its brief. If the brief did not state a job, the piece cannot be measured, and that is a briefing defect, not a measurement one.

| Job of the piece | Primary KPI | Supporting signals | Explicitly not the KPI |
| --- | --- | --- | --- |
| Reach a new audience | New users; saves and shares | Reach, follower growth | Conversions (they have not met you) |
| Answer a question well | Engagement rate; scroll depth to the answer | Return visits, internal search decline | Time on page (a fast answer is a good answer) |
| Move someone toward a purchase | Assisted conversions; next-page rate to product | Engaged sessions, click-through to product | Sessions alone |
| Convert directly | Conversion rate; revenue per session | Form starts, add-to-cart | Pageviews |
| Retain and reactivate | Return-visitor rate; second-season repurchase | Email replies, community activity | New users |
| Enable a partner or sales team | Usage by the team; deals it was sent into | Downloads | Public traffic |

Two disciplines make this stick. **Write the KPI into the brief before production**, so nobody negotiates the standard after seeing the result. And **give each piece one primary KPI.** A piece measured on five things is a piece nobody can fail, which is another way of saying nobody can learn from it.

## Metrics content people misread

**Sessions and users are not the same thing, and neither is a reader.** One person researching raised beds over three evenings is one user and three sessions. Report the one that matches the question: reach questions want users, behaviour questions want sessions.

**Engagement rate is a definition, not a truth.** Most platforms count a session as engaged if it lasts beyond a threshold, views more than one page, or fires a conversion. Know your platform's exact rule before you interpret the number, because a 30% engagement rate on a page whose job is to answer one question in twenty seconds may mean the page worked.

**Average engagement time is skewed by its tail.** A handful of sessions left open in a background tab drag the mean up. Where you can see a distribution or a median, prefer it.

**Scroll depth is only useful against a position.** "48% average scroll" is noise. "Only 38% of readers reach the crop table, which is the whole point of the page" is a finding with an obvious action: move the table up.

**A "view" means something different on every platform.** Three seconds, two seconds with sound, a full impression, a play-through — the definitions differ by platform and change over time. Never compare view counts across platforms as though they were the same unit. Within a platform, **average percentage viewed** and the **retention curve** are far more informative than the view count, because they tell you *where* people left.

**Saves and shares outrank likes.** A save is someone intending to act later; a share is someone spending their own credibility. Both predict value better than a like, and both are usually a fraction of the like count, which makes them look unimportant on a dashboard.

**Watch for pieces with no conversion path at all.** A piece can only convert what it offers. Before concluding that a topic does not convert, check that the page actually contains a next step.

## Behaviour reports worth a content marketer's time

Four reports answer most content questions:

**The landing-page report** — entrances, engagement, and conversions by the page people *arrived on*. This is the content report. A pageviews report tells you what got looked at; a landing-page report tells you what brought people in, which is what your content is for.

**Scroll and section engagement** — where in the page attention stops. Read it against your structure: if the drop is above the answer, the answer is too far down.

**Internal site search** — what people typed into your own search box. It is a free, continuously updating list of content you do not have. Harvest Lane's top internal query was "zone chart," which is how the zone-filtered plant library got built. It is also a diagnostic: a spike in searches for a term you *do* cover means your navigation is failing, not your library.

**The video retention curve** — where viewers dropped. A cliff at three seconds means the hook failed. A cliff at fifteen means the middle sags. A flat curve to the end on a 40-second piece means you could have gone longer.

One report to treat carefully: session paths. They are seductive and noisy, and small samples produce confident-looking nonsense.

## A content performance table, with the arithmetic

Harvest Lane's last 90 days. The seed subscription is $9 a month and the average subscriber stays about 12 months, so one signup is valued at **$108**. Production hours are the true cost, including Elena's and the shoot.

| # | Piece | Sessions | Engaged | Eng. rate | Signups | Signup rate | Value | Hours | Value/hr |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | How Deep Should a Raised Bed Be? | 8,420 | 5,220 | 62.0% | 92 | 1.09% | $9,936 | 11 | $903 |
| 2 | Raised Bed Soil Calculator | 6,110 | 4,700 | 76.9% | 41 | 0.67% | $4,428 | 14 | $316 |
| 3 | Zone 5–8 Planting Calendar *(update)* | 5,340 | 3,150 | 59.0% | 178 | 3.33% | $19,224 | 6 | $3,204 |
| 4 | Where to Put a Raised Bed | 2,180 | 1,290 | 59.2% | 14 | 0.64% | $1,512 | 9 | $168 |
| 5 | What to Start Indoors in February | 3,760 | 2,480 | 66.0% | 96 | 2.55% | $10,368 | 7 | $1,481 |
| 6 | Why Seedlings Get Leggy | 1,940 | 1,420 | 73.2% | 31 | 1.60% | $3,348 | 12 | $279 |
| 7 | 10 Beautiful Garden Design Ideas | 4,900 | 1,470 | 30.0% | 3 | 0.06% | $324 | 5 | $65 |
| 8 | Meet the Harvest Lane Team | 210 | 88 | 41.9% | 0 | 0.00% | $0 | 4 | $0 |
| | **Total** | **32,860** | **19,818** | **60.3%** | **455** | **1.38%** | **$49,140** | **68** | **$723** |

The arithmetic, shown so it can be checked:

```txt
Engagement rate  = engaged sessions ÷ sessions
                   row 1: 5,220 ÷ 8,420      = 0.6200  = 62.0%
                   row 7: 1,470 ÷ 4,900      = 0.3000  = 30.0%

Signup rate      = signups ÷ sessions
                   row 3:   178 ÷ 5,340      = 0.03333 = 3.33%
                   row 7:     3 ÷ 4,900      = 0.00061 = 0.06%

Value            = signups × $108
                   row 3:   178 × 108        = $19,224
                   row 7:     3 × 108        = $324

Value per hour   = value ÷ production hours
                   row 3: 19,224 ÷ 6         = $3,204
                   row 1:  9,936 ÷ 11        = $903
                   row 7:    324 ÷ 5         = $65

Library totals   = 455 signups ÷ 32,860 sessions = 1.38%
                   $49,140 ÷ 68 hours            = $723 per hour
```

Four findings fall straight out of it.

**Traffic and value are almost unrelated.** Row 7 is third by sessions and seventh by value. Its 4,900 sessions produced $324 — less than 1% of the library's value from 15% of its traffic. Its 30.0% engagement rate says the visitors were never the right visitors: it is the only off-pillar piece in the library, written because it seemed like it would do numbers, and it did numbers.

**The cheapest row is the best row.** Row 3 was a six-hour update to a URL that already existed, and it returned $3,204 an hour — more than twice row 5 and ten times row 1. It inherited everything the URL had already earned. Updating beat publishing by a wide margin, which is exactly what lesson 02 claimed and this table now evidences.

**Row 2 engages and does not convert.** 76.9% engagement is the best in the library — the calculator plainly works — and 0.67% is nearly the worst signup rate. Those two facts together are diagnostic: the tool answers the question completely and then stops. There is nothing to do next.

**Row 6 is under-distributed, not underperforming.** 1,940 sessions is small, but 73.2% engagement and a 1.60% signup rate are both above the library average. The rates say the piece works; the volume says almost nobody has seen it. That is a distribution problem wearing a performance costume, and the fix costs nothing to produce.

## Being honest about attribution

Content is systematically undervalued by last-click reporting, because content is usually not the last thing someone touches before buying. A reader who finds the depth guide in January, subscribes to the newsletter in February, and buys a bed in March is credited to email.

Three practical positions:

**Look at assisted conversions, not only last click.** If your platform supports it, the question is how often a piece appeared anywhere in a converting path. If it does not, an honest proxy is comparing conversion rates of users who did and did not touch content at all.

**Prefer consistency over precision.** Any attribution model is wrong in some way. A model you apply consistently still ranks pieces correctly against each other, which is all a publishing decision needs. Changing model mid-quarter destroys that comparability and is a common way to accidentally lie to a stakeholder.

**Say what you cannot measure.** Community answers and partner newsletters are mostly invisible in analytics. The honest report says "these produced 14 tagged sessions, and we believe the credibility effect is larger and unmeasured" rather than either inflating it or dropping it.

And the boring one that saves the most embarrassment: **check the tagging before you interpret anything.** A derivative whose link was published untagged shows as direct traffic, and its channel then looks broken.

## From a finding to a decision

D6-S1-C03 is the whole point of this lesson: a finding that does not change a plan is trivia. Every piece in the report gets exactly one verdict.

| Verdict | When | The action |
| --- | --- | --- |
| **Scale** | Rates above library average, volume low | Distribute harder; build more in this pillar |
| **Fix** | Volume fine, one metric clearly broken | One specific change, then re-measure in 30 days |
| **Refresh** | Was strong, now declining | Update in place; same URL; re-distribute |
| **Merge** | Overlaps a stronger piece | Fold in, redirect to the survivor |
| **Retire** | No pillar, no value, no path to either | Redirect to the nearest useful page |
| **Leave alone** | Working, no cheap improvement available | Do nothing. Write it down as a decision. |

"Leave alone" is a real verdict and is frequently the right one. Fiddling with a working page is how teams spend a quarter and finish flat.

### The three decisions this report forces

**Finding 1: row 7 brings the wrong audience.** 4,900 sessions, 30.0% engagement, three signups.
*Decision:* **Retire.** Redirect it to the "Where to put a raised bed" guide.
*Strategy adjustment:* the ornamental-design exclusion from lesson 02 was correct and was breached once. Add a line to the calendar: **no piece enters a slot without a pillar.** The lesson generalises — this is not "that post failed," it is "our exclusion list works and we stopped enforcing it."
*Expected effect:* traffic falls by roughly 15% and library value falls by 0.7%. Being able to say that in advance is what makes the decision survivable in a meeting with Marcus, who will notice the traffic drop.

**Finding 2: row 2 engages and does not convert.**
*Decision:* **Fix**, one change only. After the calculator returns a volume, add a next step tied to what the reader just told you: their bed size implies a planting area, so offer the zone-filtered planting calendar — the asset with the library's best signup rate at 3.33%.
*Arithmetic for the expectation:* row 2's 6,110 sessions at row 3's 3.33% would be 203 signups. That is a ceiling, not a forecast, because the calculator's visitors are earlier in the journey. Predicting a third of it — about 68 signups, up from 41 — is a defensible target, worth roughly (68 − 41) × $108 = **$2,916 per 90 days** for about two hours of work.
*Re-measure in 30 days.* One change, so the result is readable.

**Finding 3: row 6 is starved of distribution.**
*Decision:* **Scale.** It never got the six-week window from lesson 06; it got one social post.
*Strategy adjustment:* the "When it goes wrong" pillar has the best engagement rates in the library and the least volume, which suggests the pillar is under-invested rather than under-performing. Move one Q2 slot from "Getting it built right" into it, and give row 6 a full distribution window.
*Arithmetic:* holding the 1.60% signup rate, tripling sessions to 5,800 yields about 93 signups against 31 — roughly (93 − 31) × $108 = **$6,696** for distribution effort of about six hours. Rates rarely hold perfectly when volume grows, so treat this as an upper estimate and say so.

Notice the shape of all three: **finding → decision → strategy adjustment → expected effect with arithmetic → when we look again.** A recommendation missing the last two is an opinion.

## Content decay and what to refresh first

Evergreen content decays. Competitors publish, facts age, the piece drifts from what people now ask. Decay is normal and is not a failure; ignoring it is.

Rank refresh candidates by **recoverable value**, not by how stale they feel:

```txt
Recoverable value per month
  = (peak monthly sessions − current monthly sessions)
    × current signup rate
    × $108

Zone 5-8 Planting Calendar
  peak 2,600/mo, now 1,780/mo   gap = 820
  820 × 0.0333 = 27.3 signups
  27.3 × $108  = $2,948 per month recoverable

Where to Put a Raised Bed
  peak 900/mo, now 727/mo       gap = 173
  173 × 0.0064 = 1.1 signups
  1.1 × $108   = $119 per month recoverable
```

Twenty-five times the return for roughly the same effort. Both pieces "feel stale"; only one is worth a slot this quarter. This is also the calculation that justifies the update rows in your editorial calendar to somebody who would rather see new posts.

Two cautions. Seasonality masquerades as decay — Harvest Lane's traffic falls 60% between April and July every year, and reading that as decline would be a serious misreading. Compare to the same period last year, not to last month. And a piece that has been overtaken because someone else simply wrote a better answer needs a genuinely better answer, not a new date on the old one.

## Not fooling yourself

**Small numbers lie.** Below roughly 100 sessions or 30 conversions, a rate is mostly noise. Row 8's 41.9% engagement on 210 sessions is not a finding; it is 88 people.

**Compare like periods.** Month-over-month in a seasonal business is a trap. Use year-over-year, or compare to the same stage of a previous season.

**One change at a time when you intend to learn.** Ship a rewrite, a new image, and a new CTA together and you will never know which one moved.

**Distinguish a rate problem from a volume problem** before acting. High rate and low volume is a distribution job. Low rate and high volume is a content or targeting job. They have opposite fixes, and doing the wrong one is a wasted quarter.

**Watch the denominator.** A conversion rate that improved while traffic collapsed is usually not good news.

**Write the decision down, with the date and the expectation.** In 30 days you will want to know what you predicted, not what you now remember predicting.

## The monthly content report

Keep it to one page. Stakeholders want the decisions; the table is the evidence.

```txt
CONTENT REPORT - Harvest Lane - Q1, 90 days

HEADLINE
  455 seed-subscription signups from content, worth $49,140.
  1.38% of sessions convert. 68 production hours, $723 per hour.

WHAT MOVED
  - The Zone Planting Calendar update returned $3,204/hr - the
    best return in the library, from six hours on an old URL.
  - "When it goes wrong" has our best engagement (73%) and our
    smallest audience. Under-invested, not under-performing.
  - Garden Design Ideas brought 4,900 sessions and $324. Wrong
    audience, off-pillar.

DECISIONS
  1. Retire Garden Design Ideas; redirect. Traffic will fall ~15%
     and value ~0.7%. Deliberate.
  2. Add a next step to the soil calculator. Target 68 signups
     (from 41) in 90 days. Review Apr 30.
  3. Give "Leggy Seedlings" a full distribution window and move
     one Q2 slot into that pillar. Target ~93 signups.

WHAT WE ARE NOT DOING
  - Not refreshing "Where to Put a Raised Bed": $119/mo
    recoverable versus $2,948 for the planting calendar.

CAVEATS
  Last-click attribution understates content's role in bed sales.
  Q1 is our peak season; do not annualise these figures.
```

Three habits make a report like this trusted. It leads with a decision, not a chart. It states what is *not* being done and why, which is the part that shows judgment. And it names its own weaknesses before anyone else does.

## Practice

Use the content library and plan you have built across this course. If your organization does not yet have 90 days of data, use the Harvest Lane figures in this lesson as your dataset for parts 2 to 5, and apply parts 1, 6 and 7 to your own work.

**Part 1 — KPI assignment.** For every piece in your lesson 02 calendar, state the job of the piece and its **one** primary KPI, plus two supporting signals and one metric you explicitly refuse to judge it on. Where a brief did not state a job, say so and fix the brief.

**Part 2 — Build the table.** Produce a performance table with at least six pieces and these columns: sessions, engaged sessions, engagement rate, conversions, conversion rate, value, production hours, value per hour. Compute every derived column yourself and show the arithmetic for at least three rows, as in this lesson. State the value you assign to one conversion and how you arrived at it.

**Part 3 — Four findings.** Write four findings from your table. At least one must contrast a high-traffic, low-value piece with a low-traffic, high-value one. At least one must distinguish a rate problem from a volume problem. Each finding names the numbers it rests on.

**Part 4 — Verdicts.** Give every piece exactly one verdict from the six-row table. At least one must be "leave alone," and you must defend that choice in a sentence.

**Part 5 — Three decisions with arithmetic.** For your three most consequential findings, write the full chain: finding, decision, the strategy adjustment it implies for the plan from lesson 02, the expected effect with the arithmetic shown, and the date you will re-measure. At least one expected effect must be negative or a trade-off you are accepting on purpose.

**Part 6 — Refresh ranking.** Rank at least four pieces by recoverable value per month using the formula in this lesson, showing the arithmetic for each. Then state which one gets a slot in the next quarter's calendar and which explicitly does not, and why the "feels stale" answer differs from the arithmetic answer.

**Part 7 — Behaviour report reading.** Open a real behaviour report you have access to — landing pages, scroll or section engagement, internal site search, or a video retention curve. Write down three specific observations and, for each, the content action it implies. Internal search, if you have it, should produce at least one topic you do not currently cover.

**Part 8 — The one-page report.** Write the monthly report in the format above: headline numbers, what moved, numbered decisions with targets and review dates, what you are deliberately not doing, and caveats. It must fit on one page, and a stakeholder must be able to read only the decisions section and know what changes.

**Deliverable — Content Performance Review.** One document containing: the KPI assignment table, the performance table with worked arithmetic, the four findings, the verdict per piece, the three full decision chains, the refresh ranking with arithmetic, the behaviour-report observations, and the one-page report.
