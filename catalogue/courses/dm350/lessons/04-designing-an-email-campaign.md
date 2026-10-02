---
lesson_id: dm350-04
course_id: dm350
pathway: digital-marketer
title: Designing an Email Campaign
order: 4
kind: lesson
competency_ids:
  - D5-S1-C01
objectives:
  - Design an email campaign with a clear goal, structure, and call to action
  - Write subject lines and preview text that set accurate expectations
---

## What a Campaign Is

An email campaign is a planned send, to a defined audience, with one goal and one measurement. Everything in that sentence is load-bearing, and the campaigns that fail usually fail because one of the four words was never pinned down.

There are three shapes you will build, and they are not interchangeable.

A **broadcast** goes once, to a list, at a time you choose. A newsletter, a launch announcement, a quarter-close reminder. Broadcasts are calendar-driven: their timing comes from the business, not from the recipient.

A **sequence** is several emails sent in a fixed order with delays between them, usually triggered by something the recipient did. Sequences are recipient-driven: day one is day one for each person individually. Lesson 06 automates these; this lesson teaches you to write the individual emails they are made of.

A **transactional** email is a response to an action — the checklist download, a booking confirmation, a receipt. Transactional email is a different legal and operational animal: it goes to people regardless of marketing consent because it is the thing they asked for, it must not carry marketing content bolted on, and it usually sends through a different stream to protect it from your marketing reputation. Lesson 09 returns to the consent side. The rule for now: if you find yourself adding a promotional block to a receipt, stop.

This lesson builds a broadcast, because a broadcast is where every skill is visible at once.

## The Program, Not the Email

Before the individual campaign, know the shape of the whole. An email *program* is the set of things a business sends over a year, and a campaign only makes sense inside one. Northlight's program has four elements, and it is deliberately small.

A **monthly newsletter** to everyone opted in, whose job is to keep the relationship warm and the sender familiar. Its measure is not clicks; it is that the next campaign gets opened at all. Newsletters are widely mismanaged because people judge them by campaign metrics and then either kill them or bolt an offer onto them, at which point they stop being newsletters.

A **quarterly campaign** tied to the close, whose job is bookings. That is what this lesson builds.

**Lifecycle sequences** — the checklist nurture, the onboarding series — which run continuously, triggered by what individuals do. Lesson 06 owns these.

**Operational and transactional mail**, which is not marketing and which lives under different rules.

Two things follow from writing the program down. You can see the total load on any one contact, which is the only way to manage frequency honestly. And you can tell which element is failing: a program whose campaigns underperform while the newsletter is unread does not have a campaign problem, it has a relevance problem that predates the campaign by three months.

The other benefit is planning. A four-element program means roughly sixteen marketing sends a year to any one segment. That is a small enough number that each one can be good, which is the entire argument against sending more.

## Start From the Goal

Northlight sends one campaign each quarter, timed to the close. Before a word of copy is written, the campaign gets a brief. The brief is one page and it is not optional — it is what you point at in six weeks when someone asks whether the campaign worked.

```txt
CAMPAIGN BRIEF - Q3 Close Push

  Goal            Book fit calls with agencies and studios who are about to
                  close a quarter badly.
  Primary action  ONE: book a 20-minute fit call.
  Audience        marketing_consent_status = opted_in
                  AND lifecycle_stage in (subscriber, lead, marketing_qualified)
                  AND business_type in (agency, design_studio, solo_contractor)
                  AND country = United States
                  = 3,940 contacts of the 5,900 subscribed
  Excluded        clients, former_clients, disqualified, anyone with a fit call
                  already booked in the last 30 days
  Send window     Tue 8 Sept, 10:00 local time, three weeks before quarter end
  Offer           the fit call itself; no discount, no second offer
  Secondary link  the Quarterly Close Checklist, for people not ready to talk
  Success metric  20 fit calls booked, attributed by UTM within 14 days
  Guardrails      unsubscribe rate under 0.30%, complaint rate under 0.10%
  Owner           you
```

Three things to defend in that brief.

**One primary action.** Not "book a call or download the checklist or read the blog." A reader given three choices makes the easiest one, which is to close the tab. The checklist appears as a small secondary link precisely because it is the consolation prize, and it is styled to look like one.

**A number, not an adjective.** "Twenty fit calls booked within fourteen days" can be checked. "Raise awareness of quarter-end services" cannot, and a goal that cannot be checked is a goal that cannot be improved.

**Exclusions written before the copy.** Sending a "you should get a bookkeeper" campaign to Northlight's existing 240 clients is the sort of mistake that produces a complaint, a screenshot, and a difficult meeting. Write the exclusions into the brief where you cannot forget them.

Is twenty realistic? Do the arithmetic before committing, because a target you invented is worse than no target.

```txt
  Delivered            3,940 x 0.97 =  3,822   (3% bounce, lesson 07)
  Expected click rate                    2.4%   (Northlight's trailing average)
  Clicks                                   92
  Booking page conversion                 22%   (email traffic converts far
                                                 better than cold traffic, which
                                                 runs 5.1% on the same page)
  Fit calls booked                         20
  Completed at 78% show rate               16
  New clients at 22% close                3-4
  Lifetime gross profit at $6,435   $19,000-25,000
```

Twenty is reachable and the campaign is worth roughly twenty thousand dollars in lifetime gross profit. Now you know what it is worth to spend a day writing it well.

## The Anatomy of a Marketing Email

Nine parts, in the order the recipient meets them. The first three do most of the work and get most of the attention in this lesson.

**From name and from address.** The most trusted, least-edited part of an email. `Marisol Vega, Northlight Bookkeeping <marisol@northlightbooks.com>` outperforms `Northlight Marketing <noreply@northlightbooks.com>` for a nine-person firm, because a person is more credible than a department and because `noreply` announces that you do not want to hear back. Keep the from name identical across a program; recipients recognize senders far faster than subjects. Never send marketing from a free-mail address like Gmail, for reasons lesson 07 makes concrete.

**Subject line.** Whether the email is opened at all.

**Preview text** (also called preheader). The grey line the inbox shows after the subject, pulled from the first text in the email unless you set it explicitly. Always set it explicitly. An unset preview text is how "View this email in your browser. Northlight Bookkeeping, 44 Kearny St..." ends up as the second-most-read sentence you wrote.

**The opening line.** The first sentence in the body. It has to pay off the subject immediately. Readers who feel baited leave in the first two seconds, and there is no recovering them.

**The body.** Short paragraphs, one idea each. Written in the inverted pyramid: the point first, the support after, the detail last. Most readers will not reach paragraph four, so nothing that matters may live there.

**The call to action.** One primary, visually obvious, repeated once at most.

**The signature.** A real person, with a role. It supports the from name.

**The footer.** The sending organization's physical postal address, a plain and obvious unsubscribe link, and a link to a preference centre if you have one. This is not decoration; a hidden or hostile unsubscribe converts people who would have quietly left into people who press the spam button, which costs you far more (lesson 07 quantifies it).

**The plain-text alternative.** A version with no HTML, auto-generated by most platforms. Check it. If your plain-text version is empty or says "if you cannot see this email," you have made your mail look more like spam than it needs to.

## Writing the Body

There is a method, and it is not "start typing and see what happens."

**Write the one sentence first.** Before any draft, write the single sentence you would say to this person if you had ten seconds in a lift. For this campaign: *Q3 closes on 30 September, and if your books are a mess it will cost you nine days in October.* Everything in the email either supports that sentence or is cut. If you cannot write the sentence, you do not yet have a campaign — you have a send date.

**Answer the reader's question, not yours.** Yours is "how do I get them to book a call?" Theirs is "why is this in my inbox and what does it want?" The opening line has to answer theirs. Every email that opens with a paragraph about the company — its history, its excitement, its pleasure in announcing — has answered the wrong question, and lost.

**Draft long, then cut hard.** Write everything you might say, then remove sentences until removing another would break the argument. The 180-word email below started at 460. Nothing in the cut half was untrue; it was all merely optional, and optional prose in a marketing email is where readers stop.

**Give something away.** A reader should be better off for having opened it even if they never buy. This is not generosity, it is arithmetic: over a year of sends, the sender whose emails are worth reading gets opened, and the sender whose emails are only ever asks gets filtered. Lesson 07 will show you the mechanical cost of being the second sender.

**Write like a person, in the register the business actually uses.** Northlight is nine people who talk plainly about money; its email should sound like Marisol, not like a brand. Read every draft aloud. Anywhere you would not say the sentence to a client's face, rewrite it. The words that survive that test are almost always shorter.

**Then check the promise.** The subject promised something. Does the body deliver it in the first two sentences? If it delivers it in paragraph three, move it. If it does not deliver it at all, the subject line is a lie and you will pay for it in complaints.

Here is the campaign, written out in full. Read it once as a recipient, then read the notes.

```txt
From:     Marisol Vega, Northlight Bookkeeping <marisol@northlightbooks.com>
Subject:  Three weeks until your books are someone else's problem
Preview:  A 20-minute call now saves the usual October scramble.

Hi Sam,

Q3 closes on 30 September. If your books look like most agencies' books
right now, that means about nine days in October spent reconstructing
what happened in July.

The firms that close cleanly do three things differently, and none of
them are hard:

  - They reconcile monthly, not quarterly, so nothing is older than 30 days.
  - They keep one categorisation rule per expense type and never argue
    with it again.
  - They separate owner draws from payroll before the quarter ends, not
    after their accountant asks.

If you want to know which of the three is costing you the most, book a
20-minute fit call. Theo or I will look at your last quarter with you and
tell you plainly whether you need a bookkeeper or just a better habit.
No deck, no pitch. Half the calls we take end with us saying you are fine.

  [ Book a 20-minute fit call ]

Marisol Vega
Client Advisor, Northlight Bookkeeping

Not ready to talk? The Quarterly Close Checklist covers all three habits:
https://northlightbooks.com/guides/quarterly-close

--
Northlight Bookkeeping, 1120 SW Morrison St, Suite 400, Portland OR 97205
You are receiving this because you downloaded a Northlight guide.
Unsubscribe | Manage your email preferences
```

Now the notes, because the choices are the lesson.

**It is 180 words.** A broadcast asking for a 20-minute commitment does not need 800. Length should match the size of the ask.

**The first line contains the deadline.** The reason to act is in the first sentence, not the fourth paragraph.

**The three bullets give something away for free.** A reader who takes the three habits and never books a call has still had a good experience with Northlight, and will remember it. Marketing email that is only useful if you buy trains people not to open it.

**"Half the calls we take end with us saying you are fine."** This line lowers the perceived cost of the CTA more than any amount of urgency would raise the desire for it. Reducing the risk of saying yes is usually cheaper than increasing the reward.

**The secondary offer is below the signature, in plain text, small.** It is a genuine exit for the not-ready, and it is unmistakably second.

**The footer states why they are receiving it.** That single sentence measurably reduces spam complaints, because most complaints come from people who do not remember signing up.

## Subject Lines and Preview Text

The subject line is the highest-leverage sentence in the campaign, because everything downstream is multiplied by it. It is also the sentence most likely to be written last, in three minutes, badly.

A subject line does one job: it earns the open by telling the truth about what is inside. "Earn" and "truth" are both required. A subject that overpromises buys an open and spends reputation, because the reader who feels tricked is one click from marking the mail as spam, and that click is expensive in a way an unopened email is not.

Six rules that survive contact with reality:

- **Front-load the meaning.** Mobile inboxes show roughly 35 to 45 characters. Whatever matters must be in the first forty.
- **Specific beats clever.** Numbers, dates, and concrete nouns outperform wordplay in almost every test anyone runs.
- **Subject and preview text are one unit of two sentences.** Write them together. The preview should extend the subject, not repeat it.
- **No false urgency, no fake `RE:` or `FWD:`, no fabricated personalization.** These work once.
- **Avoid the shouty register** — all caps, three exclamation marks, "FREE!!!", "ACT NOW". Filters notice, and so do people.
- **Do not put the first name in every subject.** Tokens in subjects lose their effect fast, and they break loudly when the data is dirty. Lesson 05 covers the fallbacks.

Here are the variants written for this campaign, with the reasoning kept honest.

```txt
SUBJECT LINE VARIANTS - Q3 Close Push

  A  Three weeks until your books are someone else's problem        (58 chars)
     Preview: A 20-minute call now saves the usual October scramble.
     Angle: consequence + deadline. Front 40 chars carry the deadline.
     Risk: "someone else's problem" is slightly cute; could read as blame.

  B  Q3 closes 30 September. Are your books ready?                  (44 chars)
     Preview: Twenty minutes with an advisor, and an honest answer.
     Angle: plain, specific, dated. Zero cleverness. Safest option.
     Risk: forgettable in a crowded inbox; low ceiling.

  C  The nine days in October you can still avoid                   (43 chars)
     Preview: Q3 closes 30 September. Here is what clean books cost.
     Angle: curiosity anchored to a real number from the body copy.
     Risk: the number needs the body to make sense; slight bait feel.

  D  Sam, is your Q3 reconciliation done?                           (35 chars)
     Preview: If not, three weeks is enough time to fix it properly.
     Angle: personalized and direct.
     Risk: token failure on 1,470 records with no clean first name.
     REJECTED - see lesson 05 on why a broken token in a subject is worse
     than no token at all.

  CHOSEN FOR SEND: A, with B held as the control for the next quarter.
```

Notice that each variant states its angle and its risk. That discipline stops a subject-line meeting from becoming a preference poll. Notice also that variant D was rejected on a *data* ground, not a taste ground — the fill-rate audit from lesson 02 said 1,470 contacts have no reliable name, and 1,470 emails beginning "Hi ," is a bigger loss than any lift personalization could buy.

**On A/B testing subject lines:** you can test them, and you should, but be honest about the arithmetic. With 3,822 delivered split evenly, each arm gets about 1,911. At a 30 percent open rate that is roughly 573 opens per arm, and a difference of a percentage point or two between arms is well inside the range that random variation produces. You will learn something from a large difference and nothing from a small one. Test the *angle* rather than the wording — consequence versus curiosity is a question worth several campaigns; comma placement is not — and let the same test run for several quarters before you believe it. The pathway's analytics course covers how to size and read a test properly; apply that discipline here rather than declaring a winner on a fifty-open gap.

## The Call to Action

One primary action, stated as a verb the reader performs, describing what they get.

`Book a 20-minute fit call` beats `Learn more` because it says what happens next and how long it takes. `Get the checklist` beats `Download`. `Click here` says nothing at all, and it is also poor practice for anyone using a screen reader.

Make the primary CTA a button *and* a plain link. Buttons are usually images or styled tables and can render badly or not at all; a text link underneath costs nothing and rescues those readers. Both must point at the same URL.

Place it where a reader who has decided can act immediately — after the reason, not at the very bottom — and repeat it at most once. Three buttons for the same action in one email reads as anxiety.

Two further tests before you commit to a CTA. **Does the link go where the button says?** A "Book a 20-minute fit call" button that lands on a services overview page has broken its promise, and the click you worked for is spent on a bounce. The destination should continue the sentence the button started; lesson 03's capture path is the other half of this same design. And **what does the reader have to do next?** If the landing page then asks for nine fields, your CTA is not "book a call," it is "fill in a long form," and it will convert accordingly. The email and the page it points at are one artifact, and testing the email without ever completing the journey yourself is the most common reason a campaign with healthy clicks produces nothing.

## Accessibility Is Not Optional

A meaningful share of your recipients use assistive technology, read on a small screen with large type, or have limited colour vision. Four habits cover most of it, and every one of them also improves the email for everyone else.

**Real text, not text baked into images.** A screen reader cannot read a picture of a sentence, and neither can a reader whose client blocked the image.

**Descriptive alt text on every image**, describing what the image conveys rather than restating the file name. If the image conveys nothing, mark it decorative.

**Sufficient contrast.** Light grey on white is a design trend and an accessibility failure; body text should be genuinely dark against genuinely light. Do not rely on colour alone to carry meaning, because "the link is the blue one" is not information for everybody.

**Meaningful link text.** "Book a 20-minute fit call" read on its own is a complete instruction. "Click here" read on its own is nothing, which is exactly what a screen reader user hears when they list the links in your email.

None of this costs a line of code you were not already writing. It costs the ten minutes it takes to check.

## Rendering Reality

Email clients are not browsers and they do not agree with each other. You do not need to be a developer to avoid the four failures that account for most broken sends.

**Images off.** Many clients block images until the reader allows them. If your email is one big image, those readers see a white rectangle. Keep the message in live text, use images to support it, and write real `alt` text on every image so the blocked version still reads.

**Narrow screens.** A large share of opens happen on a phone. Single-column layouts, a body width around 600 pixels, generous line spacing, and tap targets no smaller than about 44 pixels tall.

**Dark mode.** Many clients invert colours automatically. Logos on white backgrounds turn into white boxes; pure-black text on pure-white blocks can become unreadable. Test one send in dark mode before you trust the template.

**The plain-text version.** Read it before every send. It is what some clients and some filters actually look at.

Then send yourself a **seed test** — the same email to accounts on the three or four mail providers your list actually uses — and open all of them. Ten minutes, every campaign, no exceptions.

## Tagging Links So the Campaign Can Be Measured

Every link in the email carries UTM parameters, so the analytics you learned in the prerequisite course can attribute the resulting sessions and the CRM can attribute the resulting bookings.

```txt
https://northlightbooks.com/fit-call
  ?utm_source=northlight-email
  &utm_medium=email
  &utm_campaign=q3-close-push
  &utm_content=primary-cta
```

Two rules make this useful rather than decorative. **Be rigidly consistent** — `email` and `Email` and `e-mail` are three sources in a report, and once they are in the data they are there forever. And **vary `utm_content` per link position** so you can tell the button click from the footer link click; that difference is often the most interesting number in the whole campaign.

## Cadence and the Calendar

Frequency is a program-level decision, not a per-campaign one. Northlight sends a monthly newsletter to everyone subscribed and one quarterly close campaign to the segment above; someone in that segment therefore receives at most two marketing emails in a month, plus whatever nurture they are enrolled in.

That last clause is the one people forget. A broadcast lands on top of any automation the contact is already in, and a contact receiving three emails in a week from a nine-person bookkeeping firm will unsubscribe from all of them. Lesson 06 introduces suppression for exactly this reason. For now, hold two habits: keep a single shared calendar of every send, and check it before you schedule a broadcast.

On timing itself, be sceptical of the advice you will read. There is a large body of published claims about the best day and hour to send email, most of it derived from aggregate data across industries that have nothing to do with yours, and most of it contradicting the rest of it. What is reliably true is narrower and more useful: send when your audience is at work if you sell to businesses, avoid the moment a working week starts and the moment it ends, be consistent so that recipients learn when to expect you, and — where the tooling allows — deliver in the recipient's own time zone rather than yours. Beyond that, your own send history is better evidence than any benchmark, and it takes a year to accumulate. Start recording it now.

The other half of cadence is what happens when someone wants less rather than none. A **preference centre** — a page where a subscriber chooses which categories they receive, or asks for less frequently — converts a would-be unsubscribe into a subscriber on their own terms. It is a small build and it consistently pays for itself. Lesson 09 covers what the preference centre has to record and why.

## The Pre-Send Checklist

Run this every time. It takes twelve minutes and it has saved more careers than any tool.

```txt
  [ ] Audience list rebuilt today; count matches the brief (+/- a little)
  [ ] Exclusions applied: clients, disqualified, recent bookings, suppression
  [ ] From name and reply-to address correct, and someone is watching replies
  [ ] Subject and preview text set explicitly; both read well truncated at 40
  [ ] Every link clicked in a real preview - including the footer links
  [ ] UTM parameters present, spelled consistently, on every marketing link
  [ ] Personalization tokens have fallbacks (lesson 05)
  [ ] Images have alt text; email is readable with images blocked
  [ ] Plain-text version reads as a real email
  [ ] Unsubscribe link present, visible, and tested end to end
  [ ] Physical postal address present in the footer
  [ ] Seed test sent and opened on desktop, mobile, and dark mode
  [ ] Send time set in the intended time zone
  [ ] Success metric written down where you will see it in 14 days
```

## Practice

1. **Write the brief.** Northlight wants a campaign to its 240 existing clients announcing that quarterly close reports will now include a one-page cash summary. Write the full brief in the format above: goal, single primary action, audience criteria in CRM terms, exclusions, send window, offer, success metric with a number, and guardrails. Then do the arithmetic that shows whether your number is reachable.

2. **Write the email.** Produce the complete email for your brief, in the same plain layout used above: from name and address, subject, preview text, body, CTA, signature, footer. Keep it under 250 words. Mark, in a separate list, the three sentences you think are doing the most work and say why.

3. **Write four subject line variants.** For your campaign, write four subjects with their paired preview text. For each, state the angle in one phrase, the character count, and the risk. Choose one and defend the choice in two sentences. At least one variant must be rejected for a data reason rather than a taste reason.

4. **Break your own email.** Rewrite your email's most important paragraph as it would read with images blocked and no styling. Then write the plain-text version by hand and compare. Fix anything the comparison exposes.

5. **Tag it.** Write the full tagged URL for every link in your email, with a distinct `utm_content` for each position. Then write the one sentence you would send your manager fourteen days after the send, containing the success metric and the actual result — leaving the number blank, so you have to go and find it.
