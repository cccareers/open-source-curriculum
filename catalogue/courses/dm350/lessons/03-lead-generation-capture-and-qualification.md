---
lesson_id: dm350-03
course_id: dm350
pathway: digital-marketer
title: Lead Generation, Capture, and Qualification
order: 3
kind: lesson
competency_ids:
  - D7-S1-C01
  - D6-S2-C02
objectives:
  - Design a lead capture path and qualify the leads it produces
---

## From Anonymous Visitor to Known Contact

Lesson 02 gave you a place to put people. This lesson is about how people get into it.

Fourteen thousand sessions land on `northlightbooks.com` every month and the overwhelming majority of them leave without Northlight ever learning who they were. That is normal and it is not a failure. The job of lead generation is not to convert everybody; it is to build a path that the small share of people with a real problem can walk down, and to capture enough about them on the way that the next step is useful for both sides.

A **lead capture path** is that walk, written down: where the person comes from, what they land on, what they are asked for, what they get, what the CRM records, and what happens next. Every part of it is a design decision, and every one of those decisions shows up later as either a clean segment or a mess.

Here is Northlight's, as it stands today.

```txt
Northlight lead capture - current state, monthly

  SOURCE                    LANDING                    FORM                 RESULT
  organic search  ------>  /guides/quarterly-close  -> checklist form   ->  217 contacts
    3,100 visits                                        7.0% conversion

  podcast + referral ---->  /fit-call               -> fit call form    ->   48 requests
      940 visits                                        5.1% conversion

  site chat        ------>  any page                -> chatbot capture  ->   22 contacts

  TOTAL NEW CONTACTS PER MONTH                                              287

  Downstream, same month
    Fit calls booked         67   (48 direct + 19 from nurture, lesson 06)
    Fit calls completed      52   (78% show rate)
    New clients              11   (22% of completed calls)
```

Read the last three lines and notice something uncomfortable: 287 new contacts produce 11 clients. That is a 3.8 percent contact-to-client rate, and it is *fine* — that is roughly what a free-guide funnel looks like in a service business. But it means a lead is not worth very much on average, and it means that improving the quality of the 287 is worth as much as improving the count.

## Two Kinds of Offer

Northlight has two offers on the site and they are not variations of one thing. They sit at opposite ends of intent, and confusing them is the most common lead-generation error there is.

**The Quarterly Close Checklist** is a *content offer*. The visitor gets something useful immediately and gives up an email address. Intent is low: wanting a checklist is not wanting a bookkeeper. Volume is high, cost per lead is low, and the average lead is far from buying. Content offers exist to start relationships that automation will develop over weeks — which is exactly what lesson 06 builds.

**Book a 20-minute fit call** is a *high-intent offer*. The visitor is asking to talk to a human about their books. Volume is low, and the average lead is close to buying. High-intent offers exist to be handed to a person quickly.

Two consequences follow. First, the two offers deserve different forms: you may ask a fit-call requester for more information than a checklist downloader, because they have already decided the conversation is worth having. Second, and more importantly, they deserve different *follow-up speed*. A checklist download can wait for a nurture sequence. A fit-call request that sits unanswered for two days is money on the floor, because the person who asked is, at that moment, also asking two other firms.

A third path exists at Northlight — the site chat, which qualifies and captures 22 contacts a month. Lesson 08 covers how it is configured; treat it here as another mouth of the same funnel, feeding the same records and the same rules.

## Not All Sources Are Equal

Northlight's 287 monthly contacts do not arrive from one place, and where they came from predicts how they behave better than almost anything else you could know about them. This is the single strongest argument for the write-once `original_source` property from lesson 02: it is the field that lets you answer "which of our channels produces clients, rather than contacts?"

Organic search brings the most volume and the widest range of intent — someone searching for a checklist and someone searching for "bookkeeper for design studios" arrive on the same site with completely different needs. Referrals from existing clients are far fewer and convert several times better, because trust arrives with them. Podcast listeners land somewhere in between: high affinity, low urgency, and a long lag between first touch and any action, which means judging that channel on a 30-day window will always make it look like a failure.

The practical instruction is not to rank the channels once and defund the losers. It is to **report every downstream stage split by original source**, and to accept different expectations from each. A referral that becomes a client in three weeks and a podcast listener who becomes a client in eight months are both successes; measured on the same clock, one of them looks like waste. Set the measurement window to the channel's actual sales cycle, and be explicit about which channels you are choosing to fund for volume and which for quality.

## Mapping the Capture Path

Write the path out as steps. Every arrow is a place a person can drop out and a place a field can go missing.

```txt
Capture path: The Quarterly Close Checklist

  1  TRAFFIC       organic search on "quarterly close checklist" and similar
                   UTM parameters present on paid and podcast links

  2  LANDING       /guides/quarterly-close
                   one offer, one form, no site nav, no competing CTA

  3  FORM          fields captured -> CRM properties (see next section)
                   hidden fields carry source data into the record

  4  SUBMIT        contact created or updated (email is the key, lesson 02)
                   original_source, first_conversion, first_conversion_date set
                   lifecycle_stage set to "lead" if currently "subscriber"
                   marketing_consent_status set from the explicit checkbox

  5  DELIVERY      thank-you PAGE with the download, not a "check your email"
                   dead end - plus the file emailed as a backup

  6  NEXT STEP     the thank-you page offers the fit call; a small share take it
                   immediately, and they are the best leads of the month

  7  NURTURE       enrollment into the checklist nurture workflow (lesson 06)

  8  QUALIFICATION scoring runs on every property and activity from here on
```

Two details in that map earn their place. Step 5's thank-you *page* matters because a download hidden behind an email confirmation loses people who mistyped, who use a work address with aggressive filtering, or who simply lose interest in ninety seconds. Give them the thing, then email it as well. And step 6 exists because the moment immediately after someone converts is the single highest-intent moment you will ever get from them; an empty thank-you page wastes it.

## Form Design

A form is a negotiation. Every field you add costs you submissions and buys you information. The skill is knowing what each field is *for*, in a specific downstream use, before you add it.

Northlight's checklist form asks for nine fields today. Here is the audit, with the honest column filled in.

```txt
Field                     Used for                                   Verdict
  Email                   the unique key; everything                 keep, required
  First name              personalization token (lesson 05)          keep, required
  Last name               nothing, currently                         cut
  Company                 company association by domain              cut - derive
                                                                     from email domain
  Phone                   nothing; advisors call from the fit call   cut
  Job title               free text, 40% junk, never filtered on     cut
  Business type           segmentation (lesson 05), scoring          keep, dropdown
  Monthly expenses band   scoring; the strongest fit signal          move to fit-call form
  How did you hear        duplicates original_source, worse          cut - use hidden fields
```

Nine fields become three: email, first name, business type. Everything cut is either derivable, unused, or better asked later.

**Derivable** is worth dwelling on. The company does not need to be typed; `sam.iyer@brightloom.co` contains `brightloom.co`, and that domain is a better company key than anything a human types, for exactly the reasons lesson 02 gave. Ask for what you cannot infer.

**Asked later** is **progressive profiling**: a form that, when it recognizes a returning known contact, replaces fields it already has answers for with the next unanswered question. Sam fills in three fields today; the next time he converts, the form asks for his monthly expenses band instead of his name; the time after that, his current bookkeeping method. Over three conversions the CRM learns six things while never showing more than three fields at once. This is the single best technique in form design, and it only works if your property discipline from lesson 02 holds, because the form has to know what it already has.

**Hidden fields** carry the data the visitor should never be asked for: the UTM parameters on the inbound link, the page the form sat on, the referring domain, the campaign id. Map them into properties at submit time. The alternative — a "How did you hear about us?" dropdown — is worse in every way, because people genuinely do not remember.

Two more form rules. Put the **explicit consent checkbox** on the form, unchecked, with its own wording, and store what it said (lesson 09 explains why the wording matters). And write the button label as the thing the person gets: *Send me the checklist*, not *Submit*.

## The Conversion Rate Is Yours to Improve

The checklist landing page converts at 7.0 percent: 217 submissions from 3,100 visits. That number is not fixed, and improving it is a legitimate marketing deliverable with a defensible business case.

You have already learned the mechanics of conversion optimization elsewhere in this pathway — how to form a hypothesis, how to run a test that is not a coin flip, how much traffic a test needs before its result means anything, and how to read the result honestly. This lesson does not re-teach any of that. What it does is put the CRM's data behind the proposal, because that is the part a CRM course owes you.

Here is a change proposal, with the arithmetic written out.

```txt
Proposal: cut the checklist form from 9 fields to 3

  Baseline
    Visits / month                       3,100
    Submissions / month                    217
    Landing page conversion rate          7.0%
    Contact -> client rate                3.8%   (11 clients / 287 contacts)
    Lifetime gross profit per client    $6,435   (lesson 02)

  Expected effect
    Assumed relative lift                  +20%   (cutting 6 fields, 2 of them
                                                   free text; conservative for
                                                   a change of this size)
    New conversion rate                    8.4%
    New submissions / month                 260   (3,100 x 0.084)
    Additional contacts / month             +43

  Value, IF quality holds
    Additional clients / month             +1.6   (43 x 3.8%)
    Additional lifetime gross profit    +$10,300  per month of the change

  The risk this arithmetic hides
    A shorter form may raise the RATE and lower the QUALITY. Business type
    is the only qualifying field left; if the extra 43 are mostly people who
    would never buy, the 3.8% falls and the value evaporates.

  Therefore the success metric is NOT the form conversion rate.
    Measure: contacts created per month AND the share of them reaching
    marketing_qualified within 60 days. The change wins only if both hold.
```

That last block is the whole point, and it is the part that separates a marketer from someone who moves buttons around. Any change that reduces friction raises the number of people who get through the door. Whether it raises the number of people who buy is a different question, answered by different data, on a longer timeline — and the CRM is the only place that answer lives. Propose the change with the lift, but define the win with the downstream number.

Two other changes worth proposing on the same page, in the same format: matching the page's headline to the search query people actually arrive on, and moving the fit-call offer above the fold on the thank-you page rather than below it. Both are cheap. Both are measurable in the CRM within a month.

## Qualification: Fit, Intent, and Stage

Two hundred and eighty-seven contacts a month, eleven clients. Qualification is how you tell which is which without calling all 287.

Every qualification model in existence is some combination of two axes.

**Fit** is whether this person could ever be a good client. For Northlight: are they a US business with real monthly expenses, of a type Northlight serves, without an existing firm they are happy with? Fit is mostly *properties* — it is stable, it comes from forms and from what the company is, and it does not change week to week.

**Intent** is whether they are acting like someone who wants to buy now. Pricing page views, a fit-call request, replying to an email, opening five emails in a fortnight. Intent is mostly *activities* — it spikes, and it decays.

Both are needed. High fit and no intent is a nurture case: keep them warm, do not call them. High intent and no fit is the trap that wastes an advisor's week — a solo freelancer with no expenses who reads everything you publish is a fan, not a client. Only both together is a lead worth a human's time.

The CRM records the answer in `lifecycle_stage`, and those stage definitions have to be written down, in one sentence each, or the field means nothing:

```txt
Northlight lifecycle stages - the definitions everyone agrees to

  subscriber          gave an email address, has not converted on an offer
  lead                converted on any form; nothing known about fit yet
  marketing_qualified lead_score >= 40 AND business_type is not "other"/"unknown"
  sales_qualified     an advisor spoke to them and confirmed fit and timing
  client              signed; owned by an advisor
  former_client       ended the engagement
  disqualified        confirmed not a fit; suppressed from nurture, not deleted
```

Note who moves the stage. Marketing owns the boundary up to `marketing_qualified`, and that boundary is automatic — a workflow sets it, using the rule above. Only a human moves someone to `sales_qualified`, because only a human has had the conversation. Automating a stage that depends on judgment is how a CRM ends up with 900 "sales qualified" contacts nobody has ever spoken to.

## A Lead Scoring Model

Scoring turns fit and intent into one number so a workflow can branch on it. Start crude. A model you can explain in a meeting beats a model you cannot.

```txt
Northlight lead score - v1

  FIT (properties, positive)
    monthly_expenses_band = 25k_100k or over_100k            +20
    monthly_expenses_band = 5k_25k                           +10
    business_type = agency or design_studio                  +10
    business_type = solo_contractor                           +5
    country = United States                                   +5
    current_bookkeeping = diy_spreadsheet or none            +10
    current_bookkeeping = another_firm                        +5

  INTENT (activities, positive)
    submitted the fit call form                              +25
    viewed /pricing                                          +10  (max +20)
    downloaded the checklist                                 +10
    clicked any marketing email                               +3  (max +15)
    replied to a marketing email                             +15

  NEGATIVE
    monthly_expenses_band = under_5k                         -15
    business_type = other                                    -10
    email domain is a known competitor                       -40
    role address (info@, hello@, accounts@)                  -20
    no email engagement in 90 days                           -10
    no email engagement in 180 days                          -25 (cumulative)

  THRESHOLD  marketing_qualified at 40 or above
  DECAY      intent points from a single activity expire after 120 days
```

Four things about that model matter more than the specific numbers.

**Negative scoring is not optional.** A model that can only add points eventually qualifies everybody, because time passes and people click things. Competitors, role addresses, and the disengaged must be able to fall out.

**Decay keeps the score honest.** Without it, a contact who was hot last September is still hot in March, and an advisor will call them and find out otherwise.

**The threshold is a business decision, not a statistical one.** Forty is the number at which Northlight's two advisors can handle the resulting volume. If the model qualifies 90 contacts a month and the advisors can take 60 calls, the threshold moves up — not because 40 was wrong, but because capacity is the real constraint. Say that out loud when you set it.

**Score every contact, but do not let anyone see the score as a verdict.** It is a sorting aid. Marisol should look at the timeline before the call regardless of whether the number says 41 or 78.

## Routing and the Handoff

The moment a contact crosses the threshold, three things must happen, and the CRM must do all three without you:

1. `lifecycle_stage` moves to `marketing_qualified`.
2. The contact is assigned an owner — for Northlight, alternating between Marisol and Theo, or by region if you prefer something explainable.
3. A task is created for that owner with a due date, and a notification is sent.

Then a **service-level agreement** between marketing and the advisors: a fit-call request is contacted within four business hours; any other marketing-qualified contact within two business days. Write it down and report against it monthly, because an SLA nobody measures is a wish. Speed of first contact is one of the few marketing variables with a large, consistently observed effect on whether a conversation ever happens at all.

The handoff also needs a shared definition of what "contacted" means, or the SLA becomes theatre. One unanswered phone call is not contact. Northlight's rule is three attempts across two channels within the SLA window, each logged as an activity — and the logging matters, because an SLA measured on advisors' memories is measured on nothing. This is the point where lesson 02's activity discipline stops being tidiness and starts being the only evidence you have.

The handoff must also run backwards. When an advisor decides a contact is not a fit, they set `lifecycle_stage` to `disqualified` with a reason, which pulls the contact out of nurture. When an advisor speaks to someone who is a fit but is not ready for six months, they set the stage back to `lead` with a "recycle date," and the contact returns to marketing's care instead of dying in a task list. A funnel with no return path silently loses every good lead who had bad timing.

## Measuring Lead Quality, Not Lead Count

Report on the funnel, not on the top of it. Northlight's monthly view:

```txt
                            This month   Rate            Watch
  New contacts                    287
  Reached marketing_qualified      74     25.8% of new   volume for advisors
  Fit calls booked                 67     90.5% of MQL   too high - suspicious
  Fit calls completed              52     77.6% booked   show rate
  New clients                      11     21.2% of held  close rate
  Cost per new contact          $9.40                    paid + content cost
  Cost per new client          $245                      287 x 9.40 / 11
```

The "too high" note is the kind of thing this table exists to surface. If nine out of ten marketing-qualified contacts book a call, the threshold is almost certainly set so high that it is only qualifying people who already asked for a call — which means the scoring model is doing no work. Either lower the threshold and find out whether the extra contacts convert, or admit the model is decorative and simplify it.

The other habit: put a monetary number next to a lead. At Northlight a new client is worth $6,435 in lifetime gross profit, so a marketing-qualified contact is worth about $960 (74 MQLs produce 11 clients, so roughly one in seven, times $6,435), and a new contact of any kind is worth about $245. Those numbers make every argument you will ever have about budget shorter.

## Practice

1. **Map a capture path end to end.** Take Northlight's fit-call offer — not the checklist — and write the eight-step map for it in the format above. Decide which fields the form asks for, given that this visitor has already asked to talk. State which CRM properties each field writes to, and what `lifecycle_stage` should be after submit.

2. **Audit a form you did not design.** Find a real lead form on any company's site. List every field and write, for each one, a specific downstream use or the word "cut." Then rewrite the form with the survivors and say what you would ask on the second conversion via progressive profiling.

3. **Write a conversion change proposal.** Pick one change to Northlight's checklist landing page other than the form-length change worked above. Write it in the same block format: baseline, expected effect with arithmetic, value in clients and lifetime gross profit, the risk the arithmetic hides, and the downstream success metric that decides whether it actually won. Keep the assumed lift conservative and say why you chose it.

4. **Build a scoring model for a different business.** Take any business you know — a gym, a law firm, a software product — and write a v1 score with fit points, intent points, at least three negative rules, a decay rule, and a threshold. Then write the one sentence you would say to defend the threshold to the person who has to handle the resulting volume.

5. **Find the leak.** Using Northlight's funnel table, identify the stage with the largest absolute drop-off and write two hypotheses for it: one that would be fixed by a change to the capture path, and one that would be fixed by a change to what happens after the handoff. Say what data in the CRM would tell you which is right.
