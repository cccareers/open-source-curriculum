---
lesson_id: dm350-05
course_id: dm350
pathway: digital-marketer
title: Segmentation and Personalization
order: 5
kind: lesson
competency_ids:
  - D5-S1-C02
  - D7-S1-C02
objectives:
  - Segment an audience and personalize content for each segment
---

## The Case Against Sending Everyone the Same Thing

Northlight has 5,900 contacts who have opted in to marketing email. The lazy version of last lesson's campaign sends to all 5,900. Let us find out what that costs.

```txt
BLAST - all 5,900 opted-in contacts, one message

  Sent                     5,900
  Delivered                5,723   (97%)
  Clicks                     137   (2.4% of delivered)
  Unsubscribes                16   (0.28% of delivered)
  Complaints                   6   (0.10% of delivered - at the limit)

SEGMENTED - the same offer, sent only where it can land, copy adjusted

  Agencies and studios, not clients      2,500  ->  3.4% ->  85 clicks
  Solo contractors, not clients          1,340  ->  2.9% ->  39 clicks
  Business type unknown or "other"       1,820  ->  NOT SENT
  Existing clients                         240  ->  NOT SENT

  Sent                     3,840
  Delivered                3,725
  Clicks                     124
  Unsubscribes                 6   (0.16%)
  Complaints                   2   (0.05%)
```

Read that carefully, because the obvious conclusion is wrong. Segmentation did **not** produce more clicks — 124 against 137. It produced roughly the same result from 35 percent less sending volume, with a third of the unsubscribes and a third of the complaints.

That is the actual case for segmentation, and it is worth stating plainly because the industry usually oversells it. A well-segmented send often wins modestly on the day. Where it wins enormously is over a year: the 1,820 people you did not email are still there next quarter, still opening things, still capable of becoming clients. The blast spent them. A list is a stock, not a flow, and every irrelevant email you send draws it down. Lesson 07 puts a number on what that drawdown costs in deliverability terms; for now, know that relevance is how you keep the right to keep sending.

## Strategy Before Tooling

Every platform makes segment-building easy, which is why most segmentation is bad. The tool will happily let you build forty lists in an afternoon, and none of that answers the question that actually matters: *what would we say differently, to whom, and why?*

Start there, on paper, with three columns — a group, the thing they need to hear that others do not, and the evidence you have that this is true of them. If you cannot fill the second column, you have found a demographic, not a segment. Northlight's agencies and its solo contractors are a real segment pair because their bookkeeping problems are genuinely different: payroll and project costs on one side, the boundary between personal and business money on the other. Northlight's Oregon and Washington contacts are not a segment pair, because nothing Northlight would say to one differs from what it would say to the other.

The evidence column is the discipline. It forces you to check whether the data supporting a segment actually exists at a usable fill rate before you build a programme on top of it — which is how you find out, in advance rather than at send time, that `business_type` is only populated on half your database.

One more strategic note before the mechanics. Segmentation has a cost that nobody puts on the invoice: every additional segment multiplies the copy, the QA, and the analysis for every future campaign. That cost is paid forever, and it is paid by whoever inherits your work. Pay it where the message genuinely differs, and refuse it everywhere else.

## The Dimensions

A segment is a group of contacts who should receive something different. Five dimensions cover almost every useful segment you will ever build.

**Lifecycle stage.** Where someone is in the relationship. This is the first cut, and it is usually the most important one, because the difference between a subscriber and a client is not a matter of tone — they need entirely different messages.

**Firmographic and demographic.** What the person or company *is*: business type, size band, region, industry. Stable, drawn from properties, and the dimension most dependent on the field discipline from lesson 02. Northlight's `business_type` sits at 49 percent fill, which is why 1,820 contacts above were unmailable on this campaign. Poor data quality is not an abstract problem; it is 1,820 people you cannot talk to.

**Behavioral.** What the person has *done*: pages viewed, assets downloaded, emails clicked, chat conversations, forms submitted. Behavior is the strongest signal of intent and the most perishable.

**Engagement recency.** How recently they interacted with your email at all. This dimension is different in kind from the others: it is about the health of the relationship rather than its content, and it drives who you may keep emailing.

**Declared preference.** What they told you they want, in a preference centre. The most respectful dimension and the most underused. Someone who says "quarterly only" and gets quarterly emails is a subscriber for life.

Northlight's whole opted-in list, cut two ways:

```txt
By lifecycle stage                    By business type
  subscriber          1,980             agency            1,510
  lead                2,730             design_studio        990
  marketing_qualified   310             solo_contractor    1,340
  client                240             other                380
  former_client         180             unknown            1,680
  disqualified          460
  TOTAL               5,900             TOTAL              5,900

By email engagement recency
  clicked or opened in last 30 days   1,180   ENGAGED
  31-90 days                          1,650   ACTIVE
  91-180 days                         1,420   COOLING
  no engagement in 180+ days          1,650   DORMANT  <- 28% of the list
```

That last line is the number a new marketer at Northlight should notice first. More than a quarter of the list has ignored every email for six months. They are not neutral: they suppress the averages, they raise the complaint risk, and lesson 07 will show they actively damage the chance that the other 72 percent see anything at all.

## Writing a Segment as Logic

A segment is a boolean expression over properties and activities. Write it as one, in full, before you build it in a tool. The writing is where you catch the mistakes.

```txt
SEGMENT: Q3 close push - agencies and studios

  INCLUDE all of:
    marketing_consent_status  =  opted_in
    country                   =  United States
    business_type             in (agency, design_studio)
    lifecycle_stage           in (subscriber, lead, marketing_qualified)

  EXCLUDE any of:
    lifecycle_stage           in (client, former_client, disqualified)
    fit call booked           within last 30 days
    member of                 "Do Not Email - manual suppression"
    email hard bounced        ever

  TYPE     active list, rebuilt at send time
  SIZE     2,500
  OWNER    you
  REVIEW   each quarter, or when business_type fill rate changes materially
```

Four habits are visible there and all four are worth copying.

**Include and exclude are separate blocks.** Mixing them into one expression with negations produces logic nobody can audit six months later.

**The exclusions are explicit even when they are redundant.** `lifecycle_stage in (client, ...)` is already excluded by the include block. Writing it anyway means the segment stays correct if someone edits the include list.

**Consent is the first condition, always.** Not the fourth. Put it where it cannot be dropped.

**The segment has an owner and a review date.** Segments rot exactly as fast as the properties under them.

On static versus active, lesson 02 gave you the rule and this is where it bites hardest. This segment is **active**, because between writing it on Thursday and sending on Tuesday, contacts will convert, unsubscribe, and be disqualified, and every one of those changes should be honoured. But if you are running a comparison across two sends — the same people, two treatments — you need a **static** snapshot, or your two groups quietly change underneath you and the comparison means nothing.

## How Small Is Too Small

Two failure modes bracket every segmentation decision.

**Too coarse** is the blast: one message, everybody, nothing lands.

**Too fine** is more common among people who have just learned segmentation. Twelve segments of 80 contacts each, twelve versions of the copy, four hours of work per campaign, and results that cannot be told apart from noise because 80 contacts produce two clicks.

Three questions decide the granularity:

*Would this group actually receive a different message?* If two segments would get identical copy with one word changed, they are one segment. The test is whether the *argument* differs, not the wording.

*Is the group big enough for the result to mean anything?* At Northlight's 2.4 percent click rate, a 200-person segment produces about five clicks. You will never learn anything from five clicks. That does not make small segments wrong — a 40-contact segment of high-value prospects can be worth a hand-written email — it makes *measuring* them wrong. Decide up front whether a segment exists to be optimized or simply to be served.

*Can you maintain it?* Every segment is a standing commitment. Four well-maintained segments beat twelve stale ones every time.

Northlight runs five standing segments. That is the right order of magnitude for a nine-person firm.

## Personalization, Four Levels

Personalization is not the first-name token. The token is the least valuable form of it and the one most likely to break in public. Think in four levels, increasing in effort and in payoff.

**Level 1 — Tokens.** Insert a stored value into copy: first name, company name, business type. Cheap, shallow, brittle.

**Level 2 — Conditional content.** Swap a whole block of the email based on a property or behavior. The agency version argues one thing, the solo-contractor version argues another. This is where real gains live, and it is what the rest of this lesson is mostly about.

**Level 3 — Behavioral relevance.** The content responds to what the person did: they viewed pricing three times, so the email addresses cost directly. This is the boundary where segmentation becomes automation, and lesson 06 takes it from here.

**Level 4 — Individual.** Someone writes an actual email to an actual person. Northlight's advisors do this for high-score contacts, and it converts better than anything on this list. It does not scale, which is precisely why the first three levels exist: to make level 4 affordable for the twenty people a month who deserve it.

Notice what is *not* on the list: inserting someone's name three times in a paragraph. That is not personalization, it is a tell.

## Tokens and Fallbacks

A token is a placeholder replaced at send time with a stored value. Every platform has its own syntax; the concept and the failure mode are identical everywhere.

```txt
Written:   Hi {{ contact.firstname }}, how did Q2 close for {{ company.name }}?

Sam Iyer:  Hi Sam, how did Q2 close for Brightloom Creative?

Row 1,470: Hi , how did Q2 close for ?

Dara:      Hi dara, how did Q2 close for paper kite studio LLC?

Import:    Hi FIRST NAME, how did Q2 close for {{company.name}}?
```

Four outcomes, one of them good. The second is the blank-field failure — 1,470 of Northlight's contacts have no reliable first name, and every one of them would have received "Hi ,". The third is the casing failure, which is what lesson 02's import hygiene was protecting you from. The fourth is the syntax failure, where a typo or a mismatched merge tag ships the raw token, and it is the one that gets screenshotted and shared.

The rules that prevent all four:

**Every token has a fallback, written at the same moment as the token.** `{{ contact.firstname | default: "there" }}` renders "Hi there," which nobody notices. A token without a fallback is a bug you have decided to ship.

**Write the sentence so the fallback reads naturally.** "Hi there," works. "How is business at there?" does not, which means `company.name` should not be in that sentence at all unless you can guarantee the value — and you cannot.

**Never token in a subject line without both a fallback and a fill-rate check.** A broken token in the body is embarrassing; in the subject line it is the first thing every recipient sees, and it is why variant D was rejected last lesson.

**Send yourself a proof for each failure case.** Create test contacts named `Test Full` (all fields populated), `Test Sparse` (only email), and `Test Ugly` (lowercase name, company with an LLC suffix, a name containing an apostrophe). Send every campaign to all three. Ten minutes, and it catches everything above.

## Conditional Content

Conditional blocks are where segmentation and personalization become the same skill. Same campaign, same send, same CTA, different argument — because an eleven-person agency and a solo illustrator do not have the same problem.

The mechanism is a rule around a block of content: *if this property has this value, show this; otherwise show that.* Two things must be true for it to work. There must be a **default branch** that renders when nothing matches, and every branch must be **complete** — a block that assumes a preceding sentence from another branch will read as a non sequitur to half your list.

Here are the two versions Northlight sent. Everything outside the marked block was identical.

```txt
=== VERSION A - business_type in (agency, design_studio) ===

Hi Sam,

Q3 closes on 30 September.

  >>> CONDITIONAL BLOCK - AGENCY <<<
  With eight people on payroll and a dozen active clients, your books have
  two hard parts: project costs that arrive after the invoice went out, and
  contractor payments that look like payroll until someone asks. Both are
  fixable in a week if you start before the quarter closes, and neither is
  fixable in October.
  >>> END <<<

If you want to know which one is costing you more, book a 20-minute call.

  [ Book a 20-minute fit call ]


=== VERSION B - business_type = solo_contractor ===

Hi Dara,

Q3 closes on 30 September.

  >>> CONDITIONAL BLOCK - SOLO <<<
  Working for yourself, the quarter-end problem is almost never bookkeeping
  volume - it is the line between the business and you. Owner draws logged
  as expenses, one card used for both, a home-office number nobody has
  checked since March. It takes an hour to sort now and a painful afternoon
  with your accountant later.
  >>> END <<<

If you want to know whether yours is clean, book a 20-minute call.

  [ Book a 20-minute fit call ]


=== DEFAULT BRANCH - business_type unknown or other ===

  >>> CONDITIONAL BLOCK - DEFAULT <<<
  Most quarter-end pain comes from the same three places: reconciliations
  left until the end, one categorisation rule argued with all quarter, and
  owner money mixed with business money. Any of the three is fixable before
  30 September.
  >>> END <<<
```

Three things to take from that example.

**The default branch is real copy, not a placeholder.** It is written to be true of everybody, and it is what 1,680 unknown-business-type contacts would see if you chose to include them. Writing the default first is a good habit — it forces you to have a message that works without data, which is what you actually have most of the time.

**Each branch stands alone.** Delete the other two and the email still makes sense.

**The differences are substantive.** Not "Hi agency owner" versus "Hi freelancer" — a genuinely different diagnosis of a genuinely different problem. That is what earns the extra hour.

Beyond text blocks, the same mechanism drives **conditional CTAs** (contacts who already downloaded the checklist see the fit-call CTA; everyone else sees the checklist), **dynamic sender** (the email comes from whichever advisor owns the contact), and **send-time selection** (deliver at 10:00 in the recipient's own time zone rather than yours). All three are configuration, not copywriting, and all three are worth setting up once.

## Useful or Creepy

There is a line, and it is not where beginners assume. People are not unsettled by personalization; they are unsettled by personalization that reveals surveillance they did not consent to.

Useful: *You downloaded the Quarterly Close Checklist last month — here is the part most agencies skip.* The person knows they downloaded it. You are referring to a transaction between the two of you.

Creepy: *We noticed you've visited our pricing page four times this week.* Also true, also recorded, and it tells the reader they are being watched at a resolution they did not expect.

The distinguishing question is: **would this person be surprised that you know it?** If yes, the fact is fine to *act* on — by all means let a pricing-page view raise a lead score and route the contact to Marisol — but not to *cite*. Use the signal, don't announce it.

Two other lines worth holding. Do not personalize on anything sensitive, inferred, or embarrassing — financial distress, health, family status — even where you technically hold the data. And do not fake intimacy: "I was thinking about you this morning" from an automated system is worse than no personalization at all, because when the reader works out it was automated, and they will, they retroactively distrust everything else you have sent.

## Letting People Segment Themselves

The dimensions above are all inferred: you decide what someone is from what they did or what a form said. There is a cheaper and more accurate route that most programmes never build, which is to ask.

A **preference centre** is a page, linked from every email footer, where a subscriber sets what they receive. Three things belong on it and a fourth usually does not.

**Topic or subscription type.** Northlight's are the monthly newsletter, the quarterly close campaign, and — for clients — service notices. Someone who wants the quarterly campaign and not the newsletter should be able to say so in one click.

**Frequency.** "Monthly" and "quarterly only" are the two options most people want, and offering the second one rescues a large share of the people who would otherwise leave entirely.

**A genuine, visible unsubscribe-from-everything.** Burying it is counterproductive for the reasons lesson 07 makes concrete; a preference centre that hides the exit converts polite leavers into complainers.

What usually does *not* belong is a long questionnaire about interests. People will not fill it in, and the fields you do get will decay without anyone noticing. Ask for the two or three preferences you will actually honour.

Declared preferences then feed the segmentation model as its highest-confidence dimension. Someone who told you they want quarterly email is more reliably segmented than someone whose business type you inferred from an email domain — and, unlike inference, it improves the relationship in the act of being collected. The reason this dimension is underused is simply that it requires you to honour the answer, including when the answer costs you sends. Honour it anyway; a subscriber who discovers their stated preference was ignored is gone permanently.

## Personalization Beyond the Inbox

Everything in this lesson has assumed email, because email is where the mechanics are most visible. The same segments drive three other surfaces, and using them is nearly free once the segment definitions exist.

**Website content.** A returning known contact can be shown content matched to their business type or lifecycle stage — a client sees service notices rather than a sales pitch. Keep this restrained: aggressive site personalization is where the creepiness line above gets crossed most often, because a visitor does not expect a web page to know them.

**Advertising audiences.** Most ad platforms accept a list of contacts to include or exclude. The exclusion case is the one people forget and the one that pays immediately: stop paying to advertise a free checklist to the 240 people who are already clients.

**Sender and routing.** Which advisor an automated email appears to come from, who gets the notification, who owns the follow-up. Lesson 06 wires this up.

The unifying idea is that a segment is not an email-tool artifact. It is a statement about a group of people that every channel can act on, which is another reason to keep segment definitions written down in one place rather than trapped inside one platform's interface.

## Behavioral Segments and the Engagement Ladder

Engagement recency deserves its own treatment, because it governs whether you may keep sending at all.

```txt
NORTHLIGHT ENGAGEMENT LADDER

  ENGAGED    opened or clicked in the last 30 days          1,180
             treatment: full programme, all campaigns

  ACTIVE     31-90 days                                     1,650
             treatment: full programme

  COOLING    91-180 days                                    1,420
             treatment: reduce to one email per month; best content only

  DORMANT    no engagement in 180+ days                     1,650
             treatment: ONE re-permission email, then suppress from all
             marketing sends. Records are kept; sending stops.

  RULE       a click at any time returns the contact to ENGAGED
```

The dormant treatment is called **sunsetting**, and new marketers resist it because 1,650 contacts feels like an asset. It is not. It is 28 percent of every send going to people who do not read it, dragging your engagement rates down and, as lesson 07 explains in mechanical detail, teaching mailbox providers that your mail is not wanted. Sunsetting a quarter of your list usually *raises* the absolute number of clicks you get from the remainder. Suppression is not deletion — the records stay, they are simply excluded from marketing sends, and a click on the re-permission email brings them back.

## The QA Pass

Before any segmented, personalized send:

```txt
  [ ] Segment counts match expectation; a 10x surprise means broken logic
  [ ] Every segment sums correctly - no contact in two branches at once
  [ ] Contacts matching nothing land in the default branch, and it renders
  [ ] Every token has a fallback, and the sentence reads with the fallback in it
  [ ] Proof sent to Test Full, Test Sparse, Test Ugly - all three read correctly
  [ ] Conditional blocks each read standalone
  [ ] Consent condition present on every segment
  [ ] Suppression list applied last, after all other logic
  [ ] Exclusions cross-checked against the send calendar for collisions
```

The "10x surprise" line has saved more sends than the rest of the list together. If a segment you expected to hold 2,500 contacts holds 5,880, you have almost certainly written `OR` where you meant `AND`, and you are ninety seconds from sending client copy to your entire database.

## Measuring by Segment

Report per segment, never only in aggregate. The aggregate hides everything you would want to act on.

```txt
Q3 close push - results by segment

  Segment            Sent   Deliv.   Open%   Click%   Bookings   Unsub%
  agency/studio     2,500   2,432    34.1%    3.4%        14      0.12%
  solo_contractor   1,340   1,293    29.8%    2.9%         5      0.31%
  ------------------------------------------------------------------
  TOTAL             3,840   3,725    32.6%    3.2%        19      0.19%
```

Nineteen bookings against a target of twenty: the campaign essentially hit its number. But the segment view says something the total does not. Solo contractors unsubscribed at nearly three times the rate of agencies and produced about two-thirds as many bookings per contact (5 per 1,340 against 14 per 2,500). One send is not proof, but if the next campaign shows the same shape, the honest conclusion is that solo contractors are a weaker fit for this offer and should get a different one — or fewer emails — rather than a rewritten paragraph.

Two cautions on reading a table like that. **Small segments produce unstable rates**, so resist drawing conclusions from a 200-contact segment's two-point swing; look at it across several sends before you act. And **compare each segment to its own history, not to the other segments.** Different segments have permanently different baselines — an engaged client list will always out-open a cold prospect list — so a segment that looks weak in the table may be performing better than it ever has. The interesting number is always the change, not the level.

That is the loop this lesson is really teaching: segment, treat differently, measure separately, and let the measurement change the segments. A segmentation scheme that has not changed in two years is not stable, it is unexamined.

## Practice

1. **Build the segment map.** Using Northlight's numbers above, define five standing segments in the full logic format — include block, exclude block, type, size, owner, review trigger. Together they must cover a sensible share of the 5,900 without any contact falling into two segments that would both receive the same campaign. State explicitly which contacts your map does not cover and why that is acceptable.

2. **Write a three-branch conditional email.** Take the client announcement you briefed in lesson 04's practice, or write a new campaign, and produce three complete versions of one content block: two segment branches and a default. Each must stand alone, and the differences must be substantive rather than cosmetic. Then write one sentence per branch explaining what you assumed about that segment.

3. **Break your own tokens.** Write out four renderings of your email's opening line — a full record, a record with only an email address, a record with lowercase and messy values, and a syntax error. Then rewrite the line so that all four are survivable, and give every token a fallback.

4. **Draw the line.** Write five personalization ideas for Northlight using data the CRM genuinely holds. Sort them into useful and creepy, and for each creepy one write the version that *acts* on the signal without citing it.

5. **Argue for sunsetting.** Write the case you would make to Ruth Ferreira for suppressing 1,650 dormant contacts. Use the numbers in this lesson, state the one thing you would lose, and propose the re-permission email you would send first — subject line, preview text, and body — in under 120 words.
