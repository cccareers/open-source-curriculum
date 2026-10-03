---
lesson_id: dm301-05
course_id: dm301
pathway: digital-marketer
title: From Data to Decisions
order: 5
kind: lesson
competency_ids:
  - D6-S1-C03
objectives:
  - Turn an analytics finding into a specific marketing decision
  - Separate a real signal from normal variation
---

## The Distance Between a Number and a Decision

By now you can collect data, choose a KPI, and join two tools. None of that is worth anything until somebody does something differently because of it. This lesson is the hinge of the course: it teaches how to decide whether a number means anything, and then how to convert the ones that do into a decision a person can actually carry out.

Two failures bracket this work, and both are common enough that you will meet them in your first month.

**Acting on noise.** Somebody sees a 12 percent dip, reorganizes a campaign, and the number reverts on its own the following week — which everybody reads as proof the intervention worked. This failure is self-reinforcing and almost impossible to argue with after the fact.

**Not acting on signal.** Somebody sees a 25-point gap in mobile checkout completion, records it in a monthly deck, and nothing happens for three quarters because "we should look into that" is not a decision.

The defense against both is the same: decide in advance what counts as a real move, then insist that every real move produce a named action or an explicit decision not to act.

## Is It a Signal? Three Worked Tests

Lesson 03 gave you the noise floor for one number over time. Now do the harder version: deciding whether a **difference between two things** is real. The arithmetic is one line and you should be able to run it in a meeting.

For a percentage measured over `n` observations, ordinary variation is about the square root of `p(1-p)/n`. To compare two of them, combine:

```txt
  standard error of a difference =
      square root of [ p1(1-p1)/n1  +  p2(1-p2)/n2 ]

  Rule of thumb: a difference smaller than TWO of those is not
  a finding. A difference larger than three is hard to argue with.
```

**Test one: mobile versus desktop checkout completion.** Mobile completes 289 of 1,690 checkouts (17.1 percent); desktop completes 302 of 720 (41.9 percent).

```txt
  mobile   0.171 x 0.829 / 1690 = 0.0000839
  desktop  0.419 x 0.581 /  720 = 0.0003382
  sum                            = 0.0004221
  square root                    = 0.0206  =  2.1 percentage points

  Observed difference            = 24.8 percentage points
  That is about 12 standard errors.
```

Twelve. This is not a close call, and it will not go away next month. It is the single largest fact about Kestrel's website.

**Test two: email versus the site average.** Email converts 108 of 4,900 sessions (2.20 percent) against the site's 1.32 percent.

```txt
  email    0.0220 x 0.978 / 4900 = 0.0000044
  square root                     = 0.0021  =  0.21 percentage points

  Observed difference             = 0.88 percentage points
  About 4 standard errors.
```

Real. But notice what "real" means here: it means the difference is not an accident of sampling. It does **not** mean email is a better channel in the sense a stakeholder will hear. An email list is people who already chose Kestrel, so a high conversion rate is partly a property of the audience rather than a property of the tactic. The number is solid; the interpretation still needs care.

**Test three: organic social versus referral.** Organic social converts 22 of 4,100 (0.54 percent); referral converts 15 of 2,100 (0.71 percent).

```txt
  organic social  0.00537 x 0.9946 / 4100 = 0.00000130
  referral        0.00714 x 0.9929 / 2100 = 0.00000338
  sum                                      = 0.00000468
  square root                              = 0.00216 = 0.22pp

  Observed difference                      = 0.18 percentage points
  Less than one standard error.
```

Nothing. Twenty-two purchases and fifteen purchases are the same number as far as any decision is concerned, and anybody who builds a channel strategy on that ordering is building it on a coin flip. Say so out loud, kindly, in the meeting where it comes up.

## Four Impostors

Even a difference that survives the arithmetic can be caused by something other than what you think. Four impostors account for most wrong diagnoses, and you should walk them every time before writing a conclusion.

**Seasonality and calendar shape.** A 31-day month against a 28-day month manufactures an 11 percent "growth." Kestrel sells rain jackets; a wet fortnight moves the numbers more than any campaign will. Compare 28 days to 28 days, and compare to the same period last year whenever you have it.

**Definition drift.** If "conversion" meant `purchase` in March and somebody marked `add_to_cart` as a key event in April, April's improvement is an accounting change. Any time a number jumps by a factor rather than a few percent, suspect the definition before you suspect the world. Keep a dated changelog of every key-event, filter, and channel-grouping change made to the property; it costs ten minutes a month and it will one day save you a week.

**Tracking breaks.** A tag missing from a template after a release looks exactly like a traffic collapse. The tell is that the loss shows in one tool and not the other, or that Direct or Unassigned rises by roughly what the affected channel lost. Check collection before you check behavior — it is faster and it is more often the answer.

**Mix shift.** This is the subtle one, and it is worth working through slowly, because it can make every part of the business get worse while the headline improves.

```txt
                     Period A                    Period B
              Sessions  CVR  Purch.       Sessions  CVR  Purch.
  Mobile        32,300  0.89%   289         26,000  0.86%   224
  Desktop       12,100  2.50%   302         16,900  2.45%   414
  Tablet         1,800  1.17%    21          1,800  1.17%    21
  ------------------------------------------------------------
  Total         46,200  1.32%   612         44,700  1.47%   659
```

Mobile got worse. Desktop got worse. Tablet was flat. **Every single segment declined and the site-wide conversion rate rose from 1.32 percent to 1.47 percent** — because the mix moved toward desktop, which converts three times better. What actually happened was that a mobile-heavy paid social campaign was paused, removing low-converting sessions from the denominator.

Report the headline alone and you will be congratulated for a decline. The rule is simple: **whenever a blended rate moves, check whether the mix moved.** If the segment shares changed, the blended number is describing the mix and not the performance.

## From Finding to Decision

A finding that does not name an action is a fact, and facts are cheap. Use this template and fill in every slot; the slots you cannot fill are where your thinking is weakest.

```txt
  FINDING          one sentence, with the numbers in it
  EVIDENCE         where it came from, over what window, with counts
  IS IT REAL       the arithmetic, and which impostors you ruled out
  SO WHAT          what it costs or is worth, in money, with the division shown
  DECISION         one specific action, with an owner and a date
  EXPECTED EFFECT  a number, with a range, and the assumption carrying the risk
  HOW WE WILL KNOW the metric, the window, and the threshold set in advance
  WHAT WOULD MAKE ME WRONG
```

That last line is the one apprentices skip and the one that earns you trust. An analyst who states in advance what would falsify their own recommendation is treated very differently from one who does not.

### Decision one: mobile checkout

**Finding.** Mobile visitors who begin checkout complete it 17.1 percent of the time; desktop visitors complete 41.9 percent. Mobile is 70 percent of sessions.

**Evidence.** 28-day period. Mobile: 1,690 `begin_checkout`, 289 `purchase`. Desktop: 720 and 302. The three funnel steps above checkout differ by less than four percentage points between devices, so the problem is located at checkout and not upstream.

**Is it real.** About 12 standard errors, and stable at 17.1 and 17.4 percent across the last two periods. Not a mix shift, because it is computed within each device. Not a tracking break, because `purchase` volume and the order system agree within their usual range.

**So what.**

```txt
  Mobile at 17.1%            1,690 x 0.171 =  289 purchases
  Mobile at 25%              1,690 x 0.250 =  423 purchases
  Gain                                         134 purchases / 28 days
  Gross profit at $36.12     134 x $36.12  =  $4,840 / 28 days
  Annualized (13 periods)                    about $62,900
```

Twenty-five percent is not desktop's 41.9 percent. Mobile checkout genuinely converts lower than desktop everywhere, so closing the whole gap is not a credible target and proposing it would cost you the room.

**Decision.** Make mobile checkout the sole site-work priority for the coming quarter. Before anything is built, run a usability test on mobile checkout and a session-recording review of mobile sessions that reached checkout and did not complete. Owner: you. Date: findings in two weeks.

**Expected effect.** 100 to 150 additional purchases per period if completion reaches 23 to 26 percent (1,690 x 0.23 = 389, 1,690 x 0.26 = 439, against 289 today). The assumption carrying the risk is that the cause is fixable in the interface rather than being payment-method availability, which no amount of layout work will change.

**How we will know.** Mobile checkout completion rate, measured over a full 28-day period after release, against a threshold of 21 percent set now. Guardrail: mobile `begin_checkout` count must not fall, because a "completion rate" can be improved by discouraging people from starting.

**What would make me wrong.** If session recordings show mobile visitors abandoning at the shipping-cost reveal rather than in the form, this is a pricing and merchandising problem and no checkout redesign will move it.

### Decision two: the guides and the email list

**Finding.** Guide pages produce 35 percent of organic clicks and 16 same-session purchases per period, while email converts at 2.20 percent against a 1.32 percent site average.

**Is it real.** The email difference is about 4 standard errors. The guide conversion gap is enormous and stable. The impostor to rule out here is **selection**: email subscribers already chose Kestrel, so their conversion rate is not a promise of what a new subscriber will do.

**So what.** Rather than claim a return, state the mechanism and size it conservatively.

```txt
  Guide sessions per period                       5,800
  Current signups from guides                       396   (6.8%)
  If capture reaches 9%          5,800 x 0.09  =    522
  Additional subscribers                            126 / period

  Value per subscriber is NOT email's 2.20% conversion rate.
  Use Kestrel's measured 90-day value of a new subscriber: $4.10
  126 x $4.10 = about $517 per period

  Say: "roughly $400 to $700 per period, and the weakest number in
  this chain is the $4.10, which comes from one cohort."
```

**Decision.** Add one contextual signup offer to the three highest-traffic guides, matched to the guide's topic. Owner: content. Date: two weeks.

**How we will know.** `newsletter_signup` events with `signup_source` set to the guide, over 28 days, against a threshold of 480. **What would make me wrong:** if total signups do not rise while guide signups do, the offer moved subscribers between pages rather than creating them.

### Decision three: deciding not to act

**Finding.** `/collections/trail-running-shoes` sessions fell 11 percent week over week, from 235 to 210.

**Is it real.** No. Ordinary weekly variation on a count of about 210 is roughly its square root, about 15 sessions, so a 25-session swing is inside the normal range. There were also nine purchases behind that page last week, which cannot support any rate conclusion at all.

**Decision. No action.** Record it as within normal variation and set a threshold: this page gets investigated when four-week sessions fall below 700, or when purchases fall below 20 in a four-week window.

Write this down formally, in the report, in the same format as the other two. **A documented decision not to act is a professional output, not an absence of one.** It also protects you: when somebody asks in six weeks why nobody looked at trail running shoes, the answer is a dated line with arithmetic behind it, rather than a shrug.

## The Decision Memo

Everything above collapses into one page per month. Structure:

```txt
  1. THE HEADLINE      one sentence: what changed and whether it matters
  2. WHAT WE DECIDED   the decisions, each with owner, date, and expected effect
  3. WHY               one short paragraph per decision, with the arithmetic
  4. WHAT WE DID NOT ACT ON   and the threshold that would change that
  5. WHAT WE STILL CANNOT ANSWER   and what it would take
```

Two rules for the writing.

**Never give a bare forecast number.** Give a range, name the assumption carrying the most risk, and say what you would watch to find out early whether the assumption is holding. "134 more orders" is a hostage. "100 to 150 more orders, and the number I am least sure of is whether the cause is in the form or in the shipping cost" is a professional statement that survives being wrong.

**Report the misses first and quickly.** Forecasting is worth exactly what its track record is worth, and the fastest way to build one is to be the person who says "the guide signup change did nothing, here is what I think I got wrong" before anybody asks.

## Practice

Use your own property, or the joined dataset you built in lesson 04.

**Part 1 — Three difference tests.** Find three comparisons in your data: one you expect to be overwhelming, one you expect to be marginal, and one you expect to be noise. Run the standard-error arithmetic on each, show the working, and state the number of standard errors. Then say, for the marginal one, what you would need — more time, more traffic, or a different metric — to settle it.

**Part 2 — Hunt the impostors.** Take one real change in your data and work all four impostors against it in writing: calendar shape, definition drift, tracking break, and mix shift. For mix shift specifically, split the metric by device or channel and check whether the segment shares moved. Show the segment table even when the answer is no.

**Part 3 — Build a Simpson's paradox.** Using your own segment sizes, construct a two-period table in which every segment's conversion rate falls and the blended rate rises. Then write two sentences a stakeholder would find convincing explaining why the headline is misleading.

**Part 4 — Three decisions.** Write three findings up in the full template, every slot filled. One must end in a real action with an owner and a date. One must end in a deliberate decision **not** to act, with the threshold that would change that. One must be a finding you cannot resolve with the tools in this course — say precisely what you would need and why GA4 and Search Console cannot supply it.

**Part 5 — Price one of them.** For your action decision, show the money arithmetic with the division visible, give the expected effect as a range, and name the assumption carrying the most risk. Then price the downside: what it costs per period if the change moves the metric the wrong way and nobody notices for six weeks.

**Part 6 — Write the memo.** One page, five sections, under 500 words. Include the "what we did not act on" section — a memo without one is a memo that has not decided anything.

**Part 7 — Pre-register.** For every decision in your memo, write the metric, the window, and the threshold **before** the change ships. Put a date on the page. Six weeks from now, come back and grade yourself honestly against what you wrote.
