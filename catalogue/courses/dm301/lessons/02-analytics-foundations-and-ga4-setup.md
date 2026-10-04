---
lesson_id: dm301-02
course_id: dm301
pathway: digital-marketer
title: Analytics Foundations and GA4 Setup
order: 2
kind: lesson
competency_ids:
  - D6-S1-C01
objectives:
  - Set up a GA4 property and verify that it collects the events a business
    cares about
  - Explain how events, sessions, and users are counted
---

## The Business You Will Measure for the Rest of This Course

Every lesson in this course uses the same company and the same numbers. That is deliberate. Analytics only becomes a skill when the figures stop being illustrations and start being a world you know well enough to notice when something in it is wrong.

**Kestrel Outfitters** sells hiking and camping gear online at `kestreloutfitters.com`. Direct to consumer, one warehouse, one small outlet store, and a guide section called Trail Notes that answers questions like how to pack a daypack. Average order value is **$86.00**, gross margin is **42 percent**, so a completed order is worth **$36.12** in gross profit. The marketing team is two people and you.

Here is the baseline. It is a **28-day period**, and it does not change for the rest of the course. Learn it.

```txt
Kestrel Outfitters - trailing 28 days

  Users                      34,000
  Sessions                   46,200
  Engagement rate               54%
  Purchases (key event)         612
  Revenue                   $52,632      (612 x $86.00)
  Gross profit              $22,105      (612 x $36.12)

  Session conversion rate      1.32%     (612 / 46,200)
  User conversion rate         1.80%     (612 / 34,000)
```

Two conversion rates, same period, same purchases, different denominators. Both are correct. Neither is "the" conversion rate. This is the first thing analytics teaches you and the last thing most people learn.

A scope note before you start. This course uses Google Analytics 4 as the primary tool and Google Search Console as the secondary one. Tag work goes exactly as far as **verifying that an event fires** and no further. SQL, warehouse exports, and formal attribution or marketing-mix modeling are not in this course; when a question needs one of those, the honest answer is "I cannot answer that with these tools," and you will be taught to say so rather than to guess.

## GA4 Is an Event Pipeline, Not a Report Tool

Everything you will ever see in a GA4 report is an aggregation of one thing: **events**. A visitor's browser sends a small labelled packet, GA4 receives it, and every report is a count or a sum over those packets. If the packet never arrives, no report setting will conjure it. Most "analytics problems" are collection problems wearing a reporting costume.

The structure above the events is three layers deep.

**Account.** The organizational container. Kestrel has one.

**Property.** The reporting boundary. One property holds one connected set of data, and it is the level at which you set the time zone, the currency, the data retention period, and the key events.

**Data stream.** A source feeding the property — a web stream, an Android stream, an iOS stream. A web stream issues a **measurement ID** shaped like `G-XXXXXXXXXX`, and that ID is what the tag on the page sends to. Kestrel has one web stream.

Two of these settings are hard to undo, so name them now. **Time zone and currency** are property-level, and correcting them later does not repair historical data — a property created in the wrong time zone carries a permanent seam. **Data retention** for user-level and event-level data defaults to two months on a new property and can be raised to fourteen. Standard reports are unaffected, but Explorations, the flexible analysis surface you will live in from lesson 03 onward, can only reach back as far as retention allows. Raise it to fourteen months on day one. It is a two-click change that is worthless in month six, because it does not restore what was already dropped.

## The Four Kinds of Event

You do not have to invent Kestrel's whole measurement scheme from scratch. GA4 collects a great deal without being asked. The job is knowing which of four categories a given event belongs to, because they differ in how much control you have.

**Automatically collected.** Fired by the tag with no configuration: `first_visit`, `session_start`, `user_engagement`. You cannot switch these off and you do not want to.

**Enhanced measurement.** Browser behaviors the web stream can capture without site code, toggled in the data stream settings: `page_view`, `scroll`, outbound `click`, `view_search_results` for on-site search, video events, `file_download`, and form interaction events. Free, useful, and carrying two traps. The `scroll` event fires **once, at 90 percent depth**, which is a single binary flag and not a scroll-depth report; mistaking one for the other will cost you a finding in lesson 07. And on a single-page application the history-based `page_view` can fire on interactions no visitor would call a page change, inflating page counts and deflating time-per-page.

**Recommended events.** Google publishes exact names and parameter shapes for common business actions, and you must use those exact names to get the matching reports. The ecommerce set is what Kestrel needs: `view_item`, `add_to_cart`, `begin_checkout`, `add_payment_info`, `purchase`, each carrying an `items` array plus `value` and `currency`. Invent `bought_thing` instead of `purchase` and GA4 will store it happily while the entire Monetization section stays empty forever.

**Custom events.** Anything the business cares about with no recommended name. For Kestrel that is `size_guide_open` and `find_store`.

Two limits shape the plan. An event carries up to **25 parameters**, and a property supports up to **50 event-scoped custom dimensions**. Both are more generous than a first measurement plan needs, and both are easy to exhaust with junk — which is the argument for planning before implementing rather than after.

## How Users, Sessions, and Engagement Are Actually Counted

These three definitions set the denominator of almost every number you will ever report. Get them exactly right. Approximate versions produce confident, wrong statements in meetings.

**A user** is, by default, a browser on a device, identified by a first-party cookie holding a client ID. Clear the cookie, switch to a phone, or open a private window, and you are a new user. If the site sets a `user_id` for signed-in visitors — Kestrel does this at checkout — GA4 can stitch those sessions together. The consequence matters: **users is a count of identifiers, not people.** It is inflated by cross-device browsing and deflated by shared devices. GA4 also distinguishes **total users** from **active users**, and the metric labelled "Users" in most standard reports is *active* users, meaning those with an engaged session or a recorded engagement. Two reports that appear to disagree about user counts are usually quoting the two different metrics.

**A session** begins with a `session_start` event and ends after **30 minutes of inactivity**. The timeout is configurable from five minutes to seven hours fifty-five minutes. Two properties of a GA4 session catch out anyone who learned the previous generation of the tool: a GA4 session **does not reset at midnight**, and it **does not reset when the traffic source changes** mid-visit. A session that starts at 11:50pm and runs to 12:20am is one session, counted on the day it started.

**An engaged session** is one that lasted **longer than 10 seconds**, *or* had **two or more page views**, *or* recorded **at least one key event**. Any one of the three qualifies. **Engagement rate is engaged sessions divided by sessions**, and **bounce rate is exactly its inverse** — GA4's bounce rate is one minus engagement rate, which is not the definition the industry used a decade ago. Kestrel's 54 percent engagement rate therefore means a 46 percent bounce rate. Quote whichever one your stakeholder already thinks in, and say which you used.

One more that is easy to misread. **Average engagement time per session** is built from `engagement_time_msec`, which the tag accumulates only while the page is in the foreground. A tab left open behind other windows for an hour contributes almost nothing. This is more honest than the old time-on-page metric, and it means the number looks lower than people expect. Explain that before someone else calls it a decline.

## Key Events, and What Should Not Be One

A **key event** is an ordinary event you have flagged as one the business cares about. Flagging is a property-level toggle. It changes nothing about collection and a great deal about reporting, because key events populate the conversion columns, satisfy the engaged-session test, and become available to advertising platforms.

The discipline is blunt: **a key event is an outcome the business would pay to get more of.** Kestrel's honest list is short.

| Event | Key event? | Why |
| --- | --- | --- |
| `purchase` | Yes | The outcome. Carries revenue |
| `newsletter_signup` | Yes | Email is Kestrel's best-converting channel; a signup has real expected value |
| `begin_checkout` | No | A step, not an outcome. Watch it closely; do not count it as success |
| `add_to_cart` | No | Same, and marking it key inflates the apparent conversion count eightfold |
| `view_item` | No | Browsing |
| `scroll` | No | If scrolling is a key event, every report you produce is decoration |
| `find_store` | No | Useful to the outlet store, not a marketing outcome |

The failure mode here is promotion pressure. Somebody will eventually want `add_to_cart` marked as a key event because the conversion number looks thin. Kestrel had **5,120** sessions with an add to cart against **612** purchases; promoting the first makes the site appear to convert at 11.1 percent rather than 1.32 percent, and every decision made afterwards is made against a number that describes nothing anybody wanted.

## Kestrel's Measurement Plan

Write the plan before you write any code. A measurement plan is a table, and it is the specification that the implementation gets checked against.

| Business question | Event | Key parameters | Key event? |
| --- | --- | --- | --- |
| Did they buy? | `purchase` | `transaction_id`, `value`, `currency`, `items` | Yes |
| Did they start checkout? | `begin_checkout` | `value`, `currency`, `items`, `checkout_variant` | No |
| Did they add to cart? | `add_to_cart` | `value`, `currency`, `items` | No |
| Which products get looked at? | `view_item` | `items` | No |
| Did they join the list? | `newsletter_signup` | `signup_source` | Yes |
| Is sizing confusing? | `size_guide_open` | `item_id`, `page_location` | No |
| Does the outlet page get used? | `find_store` | none | No |

The `signup_source` and `checkout_variant` parameters are what make a report answerable rather than merely present: without them you know how many people signed up, and not one thing about where from. Note the rule that catches everybody once — **a custom parameter is collected immediately but stays invisible in reports until you register it as a custom dimension**, and data collected before registration is not backfilled into that dimension. Register it the same day you ship the event.

## Implementation, As Far As This Course Goes

There are two mainstream ways to get an event onto the page. You need to be able to read both and verify either.

The direct approach puts the Google tag on every page and calls `gtag` at the moment something happens.

```javascript
// The Google tag - in the head of every page on kestreloutfitters.com.
// Replace G-XXXXXXXXXX with the measurement ID from your own web stream.
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', 'G-XXXXXXXXXX');

// Fired on the order confirmation, AFTER the server confirms the order.
// Never on the button click. Never on page load of the checkout page.
gtag('event', 'purchase', {
  transaction_id: 'KO-2026-118420',  // unique; GA4 de-duplicates on this
  value: 86.00,                      // item revenue, excluding shipping and tax
  currency: 'USD',
  shipping: 6.95,
  tax: 5.42,
  items: [
    {
      item_id: 'RID-28-SLA',
      item_name: 'Ridgeline 28 Daypack',
      item_category: 'Packs',
      item_variant: 'Slate',
      price: 86.00,
      quantity: 1
    }
  ]
});
```

The tag-manager approach keeps the same logic and moves the decision out of the site code. The site pushes a semantic message into the data layer; a container listens for it and fires the tag.

```javascript
// In the site's order-confirmation template.
// Clearing the ecommerce object first stops items from a previous push
// leaking into this one - a classic source of phantom revenue.
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({ ecommerce: null });
window.dataLayer.push({
  event: 'purchase',
  ecommerce: {
    transaction_id: 'KO-2026-118420',
    value: 86.00,
    currency: 'USD',
    shipping: 6.95,
    tax: 5.42,
    items: [
      { item_id: 'RID-28-SLA', item_name: 'Ridgeline 28 Daypack',
        item_category: 'Packs', item_variant: 'Slate',
        price: 86.00, quantity: 1 }
    ]
  }
});
```

Which one Kestrel should use is a real decision with a real reason, and the reason is turnaround rather than elegance: the site is maintained by one contractor on a two-week release cycle, so a container that lets you add or repair an event the same afternoon is worth a great deal. Whichever is chosen, **pick exactly one**. A hardcoded snippet left behind after a migration can double-fire. [GA4 deduplicates same-ID web purchases from the same user](https://support.google.com/analytics/answer/12313109?hl=en), so a DebugView double fire alone does not prove doubled reported revenue. Missing or inconsistent IDs can inflate totals; empty-string IDs can collapse distinct purchases. Fix duplicate implementations regardless.

Where this course stops: you are not being asked to design a tagging architecture, build variables and triggers, or debug container scope. You are being asked to read a snippet, say what it will fire and when, and then prove what it actually fired.

## Verifying That It Works

This is the deliverable of the lesson. Installing a tag takes fifteen minutes. Proving it collects what the business cares about takes an hour, and it is the hour that separates people who can be trusted with a property from people who cannot.

Three instruments, used in this order.

**Tag Assistant preview** connects a debug session to the live site and shows tags firing in the browser, before GA4 has processed anything. It answers "did the tag run at all."

**DebugView**, in the admin section, shows the event stream as GA4 received it, with every parameter, for sessions in debug mode. It answers "did the payload arrive intact." A `begin_checkout` should arrive looking like this:

```json
{
  "event_name": "begin_checkout",
  "params": {
    "currency": "USD",
    "value": 86.0,
    "checkout_variant": "express",
    "ga_session_id": "1774386201",
    "engagement_time_msec": 1240,
    "debug_mode": true
  }
}
```

**Realtime** shows the last thirty minutes across all users, unfiltered. It answers "is this live in production for real visitors, not just for me."

The routine, every time, in order:

1. Open Tag Assistant preview against the live site and confirm the Google tag loads on a page you did not touch.
2. Load the checkout page and **do nothing**. Confirm `purchase` does not fire. If it fires here, stop; nothing else matters until that is fixed.
3. Place a genuine test order under a recognizable name.
4. Confirm `purchase` fired **exactly once**. Not zero, not twice.
5. Confirm the payload in DebugView: `transaction_id` populated and unique, `value` matching the order, `currency` set, `items` present and non-empty.
6. Refresh the confirmation page, then return to it from browser history. Confirm no second `purchase`.
7. Repeat the entire pass on a real handset, not a desktop emulator. Kestrel is 70 percent mobile, and mobile is where redirects and third-party checkout handoffs break.
8. Check the traffic source on your test session. If a test order placed after clicking a tagged link lands in Direct, something is dropping the campaign parameters.
9. Exclude the test data afterwards, or run the pass behind a debug filter, so your QA does not become the owner's reporting.
10. Write it down: date, tester, device, steps, observed payloads.

Four admin settings belong in the same pass, because each one silently corrupts data when wrong.

**Internal traffic.** Define your office and home address ranges and activate the filter, or your own browsing becomes a measurable share of a small site's sessions.

**Unwanted referrals.** If Kestrel's checkout hands off to a payment provider and comes back, the return trip starts a new session credited to the payment provider, and your purchases end up attributed to it. Listing that domain as an unwanted referral is the fix, and the symptom to recognize is a payment domain appearing in your top referral sources.

**Cross-domain measurement.** Configure it if the cart lives on a second domain, or every checkout looks like a brand new visitor.

**Consent.** If the site has a consent banner, confirm that declining actually changes tag behavior. A banner that sets a cookie and then loads every tag anyway is decoration, not consent, and that is a legal problem rather than an analytics one.

## What GA4 Cannot Tell You

Carry this list. The fastest way to lose credibility is to be caught asserting something the tool never knew.

**Thresholding.** With Google Signals enabled and small volumes, GA4 withholds rows that could identify an individual. A small segment can silently under-report, with only a notice icon to warn you.

**The `(other)` row.** When a dimension exceeds its cardinality limit, low-volume values collapse into one `(other)` bucket. High-cardinality dimensions such as page paths carrying query strings are the usual cause.

**`(not set)`.** The dimension had no value for those events. It is an absence, not a place, and reporting it as a traffic source is a routine embarrassment.

**Missing sessions.** Ad blockers, declined consent, and visitors who leave before the tag executes are invisible. GA4 undercounts, always, by an amount that varies with your audience.

**Sampling and modeling.** Some Explorations sample at high volumes, and some figures are modeled rather than observed. Read the data-quality indicator on an exploration before you quote it.

None of this makes GA4 unusable. It makes GA4 a **measuring instrument with known error bars**, which is an entirely normal thing to work with, provided you say so out loud before someone else discovers it.

## Practice

You need a GA4 property you are permitted to configure — a personal site, a sandbox property on a test page, or the public demo account for the reading portions. **Do not modify a production property you do not own.**

**Part 1 — Audit the counting definitions.** Without looking back, write down exact definitions for: a session, an engaged session, engagement rate, bounce rate, active users, and average engagement time per session. Then check yourself against the lesson. For each one you got wrong, write one sentence describing the reporting mistake that error would have caused.

**Part 2 — Write a measurement plan.** Kestrel's Trail Notes guide section is not covered by the plan above. Propose three to five events that would let you tell whether a guide contributes to purchases. Give each a name, its parameters, whether it is a recommended or custom event, and whether it is a key event. Justify every "no" in the key-event column in one sentence.

**Part 3 — Build and configure.** In your own property: set the time zone and currency, raise data retention to fourteen months, define and activate an internal traffic filter, and register at least one custom parameter as an event-scoped custom dimension. Capture evidence of each setting.

**Part 4 — Implement one event.** Add a single custom event to a test page — a `size_guide_open` equivalent is ideal — carrying at least two parameters. Either implementation approach is fine. Include your snippet in the write-up with placeholders clearly marked.

**Part 5 — Run the verification routine.** All ten steps, with evidence for each: what fired, when, with what payload, on which device. Then introduce one deliberate failure: make the event fire twice, show what that looks like in DebugView, and describe how you would have caught it a month later in a report, with no debugger available.

**Part 6 — Write the limitations note.** Half a page addressed to Kestrel's owner in plain language: what this property will and will not be able to tell her, and one number she should not expect to reconcile against her order system. Do not use the word "accurate" without saying accurate compared to what.
