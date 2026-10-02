---
lesson_id: dm101-06
course_id: dm101
pathway: digital-marketer
title: Email Marketing Basics
order: 6
kind: lesson
competency_ids:
  - D5-S1-C01
objectives:
  - Design a basic email lifecycle sequence for a new subscriber
  - Identify the parts of an email campaign that drive opens and clicks
---

## Why email still matters

Email is the only major marketing channel where the audience is genuinely yours. A search ranking can move, a social platform can change what it shows, an ad account can be suspended — but a list of addresses collected with permission is an asset you keep and can export. That is the entire strategic case for email, and it is a strong one.

It comes with a matching constraint: **permission is the whole business model**. A list built without consent produces complaints, damages your ability to reach the inbox at all, and in many jurisdictions is illegal. The legal specifics belong to the privacy lesson; the practical rule for this lesson is simpler — every address on your list should be there because a person deliberately put it there and knew what they were signing up for.

This lesson covers designing a single campaign and designing a short lifecycle sequence for a new subscriber. Advanced automation, branching logic, and CRM-driven segmentation belong to the automation course later in this pathway.

## Anatomy of a campaign

Every email campaign, however small, has the same six parts. Getting them in order prevents the most common failure, which is writing the email before deciding what it is for.

**1. The goal.** One goal, expressed as an action a recipient takes: book a consult, complete a purchase, read a guide, reactivate an account. "Stay top of mind" is not a goal because nothing can be done differently based on it.

**2. The audience segment.** Who gets it and, just as important, who does not. Sending a "complete your first order" email to someone who ordered yesterday is the kind of mistake that costs unsubscribes.

**3. The offer or reason to open.** What is genuinely in it for the reader in this specific message.

**4. The message.** Subject line, preheader, body, and the call to action.

**5. The send.** Timing, sender name and address, and whether it goes to everyone at once.

**6. The measure.** What number tells you it worked, decided *before* the send.

Here is a complete small campaign specified in that order:

```text
Goal:      Book a free 20-minute roof inspection
Segment:   Homeowners in ZIP 30341-30345 who downloaded the
           storm-damage checklist in the last 90 days and have
           not booked        (est. 1,240 recipients)
Offer:     Post-hailstorm inspection, free, this month only
Message:   Subject / preheader / 120-word body / one button
Send:      Tuesday 9:00 local, from "Priya at Ridgeview Roofing"
Measure:   Booked inspections attributed to this send
           (target 25, i.e. 2% of recipients)
```

Note that the measure is bookings, not opens. Opens and clicks are diagnostic — they tell you *where* a campaign broke — but the campaign exists for the bookings.

## What drives opens

Only four things are visible before someone decides to open: the sender name, the subject line, the preheader, and the timing. That is the whole surface area.

**Sender name.** The most underrated variable. A recognizable human or brand name outperforms `noreply@` consistently, because the recipient's first question is "who is this?" `Priya at Ridgeview Roofing` answers it; `info@rvr-mktg-3.com` raises an alarm.

**Subject line.** Practices that hold up:

- **Be specific and concrete.** "Your inspection slot: Thursday or Friday?" beats "Important information about your home."
- **Front-load the meaning.** Mobile inboxes truncate around 35 to 45 characters. Put the point in the first four or five words.
- **Say something true.** "Re:" on an email that is not a reply, or a fake "you have 1 unread message," buys one open and costs the relationship.
- **Do not shout.** All caps, three exclamation points, and "FREE!!!" read as spam to humans and to filters.
- **Curiosity works only when the email pays it off.** A subject that creates a question the body never answers trains people not to open the next one.

**Preheader.** The preview text after the subject. Left unset, it shows whatever the email starts with — often "View this email in your browser," which wastes prime real estate. Use it to extend the subject rather than repeat it.

```text
Subject:    Your roof after Tuesday's hail
Preheader:  Free 20-minute inspection, 6 slots left this week
```

**Timing.** Send-time effects are real but small and audience-specific. Do not spend effort optimizing send time before the message itself is good.

**Reputation, quietly underneath all of it.** If enough recipients mark you as spam, or you mail addresses that no longer exist, mailbox providers start routing you to the spam folder — and an email in the spam folder has a 0% open rate regardless of subject line. Keeping the list clean by removing repeated non-openers and hard bounces, and making unsubscribing easy, protects every future send. An unsubscribe is far cheaper than a spam complaint.

One caution on the metric itself: open rates are measured with a tracking pixel, and privacy features on some mail clients load that pixel automatically or block it entirely. Treat open rate as a rough comparative signal between your own sends, not an exact count.

## What drives clicks

Once opened, five things move the click.

**One clear ask.** An email with a single call to action outperforms one with five competing links. If a message must contain secondary links, make them visually secondary text links, not buttons.

**Short body.** Marketing email is not the place for 600 words. Get to the ask in 60 to 150 words. The email's job is the click; the landing page does the convincing.

**Above-the-fold CTA.** The primary button should be visible without scrolling on a phone. Repeat it at the bottom for longer emails.

**Button copy that says what happens.** "Book my inspection" beats "Submit" and beats "Click here."

**Scannability and accessibility.** Short paragraphs, real text rather than one large image (images are often blocked by default, and an image-only email arrives blank), meaningful alt text, adequate contrast, and a plain-text version.

**Continuity to the landing page.** If the subject promises a free inspection, the landing page must lead with the free inspection. A mismatch here shows up as a high click rate and a terrible conversion rate.

## A worked read of a campaign result

The roofing campaign above sends. Results:

```text
Delivered            1,224   (16 bounced)
Opens                  343   28.0% of delivered
Clicks                  41   3.4% of delivered, 12.0% of openers
Landing page views      40
Booked inspections       6   0.5% of delivered  (target was 2%)
Unsubscribes            11   0.9%
Spam complaints          2
```

Start with the arithmetic, not with opinions. The target of 25 bookings from 1,224 delivered required 2% of recipients to book. Only 41 people ever reached the landing page, so even a perfect landing page could have produced at most 41 bookings — the click step had already capped the outcome near the target with no margin. Then the landing page converted 6 of 40, or 15%.

So there are two breaks, and the subject line is not one of them: a 28% open rate on a warm, recent, local segment is healthy. Rewriting it would be optimizing the one part that is working.

The realistic fix list, in order: (1) the landing page, because it is the worst step — check the booking form on mobile, since a form asking for address, roof age, insurer, and a photo upload before showing a calendar is a plausible culprit, and check that the page leads with "free 20-minute inspection" and a visible calendar; (2) the click rate, because 12% of openers is thin for an offer this relevant — one button above the fold and body copy that leads with "free" rather than with the storm; (3) only then, subject variants. And revise the target: a realistic sequence of 28% open, 20% of openers clicking, and 40% of those booking predicts about 27 bookings, which tells you what each step has to hit for 2% to be reachable at all.

Also note the unsubscribe and complaint numbers. Under 1% unsubscribes on a promotional send to a 90-day-old segment is normal. Two spam complaints on 1,224 is on the edge — worth watching, and worth checking that these recipients genuinely opted in.

## Segmentation at the basic level

Segmentation is sending different messages to different parts of the list. It is the single highest-return improvement available to most email programs, and at this level it does not require sophisticated tooling — three splits cover most of the value.

**By behavior.** What the person did: downloaded a guide, abandoned a cart, bought once, bought five times, has not opened anything in six months. Behavior predicts interest better than any demographic.

**By lifecycle stage.** Prospect, new customer, active customer, lapsed. The same offer reads completely differently to each.

**By engagement.** Recent openers and clickers versus people who have not engaged in months. Mailing the unengaged repeatedly is what damages your sender reputation, so this split protects the whole program.

A concrete illustration. A 4,000-address list sent one identical promotion produces a 22% open rate and 30 sales. The same list split three ways — 900 recent buyers get a "what's new since your last order" message, 2,400 prospects get the introductory offer, and 700 six-month non-openers get a single "still want these emails?" message with an easy unsubscribe — will normally outperform it on sales, and it protects deliverability by giving the unengaged group a clean exit instead of another promotion.

The rule of thumb: **segment when the message would genuinely differ.** Splitting a list six ways and sending the same email to all six is administration, not segmentation.

## A lifecycle sequence for a new subscriber

A **lifecycle sequence** (often called a welcome series) is a small set of emails sent automatically in the days after someone subscribes. It exists because that first week is when a new subscriber is most interested in you and least sure about you.

Design principles:

- **Deliver the promised thing first**, immediately, in email one. If they signed up for a checklist, the checklist is the first thing they see.
- **One job per email.** Do not stack a welcome, a product tour, a discount, and a review request into one message.
- **Escalate the ask.** Early emails give; later emails ask. Requesting a purchase in email one from someone who downloaded a free guide is asking for a decision they cannot yet make.
- **Set the expectation.** Tell them what they will receive and how often, in email one. It reduces later unsubscribes and complaints.
- **Make it stoppable.** A visible unsubscribe in every message, and the sequence should stop or change if the subscriber converts.

A four-email sequence for the roofing company's checklist subscriber:

| # | Day | Job | Subject | Primary CTA |
| --- | --- | --- | --- | --- |
| 1 | 0 | Deliver and set expectations | Your storm-damage checklist is here | Download the checklist |
| 2 | 2 | Be useful, build trust | The 3 kinds of hail damage insurers pay for | Read the 4-minute guide |
| 3 | 5 | Proof | What a $14,000 claim looked like on Dogwood Lane | See the before and after |
| 4 | 9 | The ask | Ready to have someone look at it? | Book a free 20-minute inspection |

Read the shape: give, give, prove, ask. Each email has one job and one button. Email 1 also contains the expectation-setting line — "You'll get three more emails from me over the next week and a half, then about one a month. Unsubscribe any time." — which is honest and measurably reduces complaints.

**Exit rules matter as much as the emails.** If someone books an inspection after email 2, emails 3 and 4 must stop; continuing to pitch a service the person already bought is the single most obvious sign that nobody is minding the system.

**Measuring the sequence.** Judge it end to end, not email by email. If 1,000 people enter the sequence and 34 book an inspection, the sequence converts at 3.4%. Per-email open and click rates then tell you where the drop-off is — a healthy sequence usually shows opens declining gently from email 1 to email 4, and a cliff between two emails is where to investigate.

## Practice

**Part 1 — Specify a campaign.** Choose a business and a single, concrete goal. Write the six-part campaign specification used in this lesson (goal, segment, offer, message, send, measure), then write the actual sender name, subject line, preheader, body under 150 words, and button copy. State the numeric target you would consider success and why that number.

**Part 2 — Diagnose three campaigns.** For each result set, name the part of the campaign that is broken and the first thing you would change. One sentence of justification each.

```text
A   Delivered 8,400   Opens 4.2%   Clicks 0.3% of delivered
    Unsubscribes 0.2%   Complaints 0.9%
B   Delivered 3,100   Opens 41%    Clicks 1.1% of delivered
    Unsubscribes 1.8%  Complaints 0.1%
C   Delivered 2,700   Opens 33%    Clicks 9% of delivered
    Landing page views 240   Purchases 2
```

**Part 3 — Build a sequence.** Design a four- or five-email lifecycle sequence for a new subscriber to a business of your choice. Produce the table (number, day, job, subject, CTA), then write email 1 in full. Below the table, write the exit rules: what stops the sequence, what happens to someone who converts at email 2, and what happens to someone who opens nothing at all.
