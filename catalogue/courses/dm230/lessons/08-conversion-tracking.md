---
lesson_id: dm230-08
course_id: dm230
pathway: digital-marketer
title: Conversion Tracking
order: 8
kind: lesson
competency_ids:
  - D3-S1-C03
objectives:
  - Implement conversion tracking and verify that it reports correctly
---

## Why This Lesson Sits Before the Optimization Lessons

Everything you do for the rest of this course runs on conversion data. A smart bidding strategy is a machine that reads your conversion feed and buys more of whatever produced it. An A/B test is a comparison of two conversion rates. A return-on-investment judgment is conversions multiplied by value, divided by spend. All three inherit whatever is wrong with the tracking underneath them, silently and without complaint.

That is the part people underestimate. Bad tracking does not throw an error. It produces a number, the number appears in a column, the column gets averaged into a report, and the report gets sent to a client. A Target CPA campaign fed by a conversion action that fires on page load will bid enthusiastically for traffic that never contacted the business, and it will report a wonderful cost per acquisition while doing it. Nothing in the interface tells you. The only defense is that you built the tracking deliberately and then proved it works.

So treat this lesson as the foundation and treat the deliverable literally: at the end you should be able to hand someone a written definition of what Northgate counts as a conversion, the settings for each conversion action, the code that fires it, and a signed piece of evidence that you tested it and it behaved. Optimization without that is theatre. You will be moving bids and rewriting ads based on a number you have not verified, and you will have no way to tell a real improvement from a measurement artifact.

## Deciding What Counts as a Conversion Before You Touch Any Code

The first mistake is opening the tag manager. The first job is a conversation with the business.

For Northgate Heating and Air, the honest list of things a click can turn into is short:

- A submitted "Book a Visit" form on a service landing page.
- A phone call from the ad or the website that lasts more than 60 seconds.
- A chat conversation on the site where the visitor leaves a name and a callback number.
- A maintenance plan purchased online through the checkout on the plans page.

Notice what is not on that list. A newsletter signup is not a conversion for a contractor whose entire economics are booked jobs. A visit to the contact page is not a conversion. Time on site is not a conversion. Those are activity, and if you feed activity into a bidding algorithm, the algorithm will buy activity.

Notice also that the definitions carry conditions. A call is not a conversion; a call over 60 seconds is. A chat is not a conversion; a chat with contact details is. Those conditions are where the argument with the client happens, and having it now is cheaper than having it in month three when the reported lead count is triple the number of jobs on the board.

Write it down. A conversion definition document is one page and it contains, for each conversion:

1. The plain-language name the business uses ("Book a Visit form").
2. The exact technical event that represents it (form submit success, not button click).
3. The condition that qualifies it (call duration over 60 seconds).
4. The business value in gross profit, and where that number came from.
5. Whether it counts as a primary conversion that bidding optimizes toward, or an observation-only secondary.
6. Who owns it and who to ask when it breaks.

That document is the specification you build against and the artifact you check against later. When the client says "these numbers look wrong," you compare reality to the document rather than to somebody's memory.

## Conversion Actions and Their Settings

A conversion action is a configured record in the ad platform. The settings are few and each one has a consequence you can name.

**Category.** Submit lead form, phone call lead, purchase, and so on. It is largely descriptive, but it drives some reporting groupings and some automated recommendations, so set it honestly.

**Value.** Either a fixed value per conversion, a value passed dynamically from the page, or no value. Covered in detail below. Do not leave this blank if the business outcomes differ in worth.

**Count: one or every.** This is the setting people get wrong most often. "Every" credits every conversion from the same click. "One" credits at most one. For an ecommerce purchase, "every" is correct, because a customer who buys twice from one click really did buy twice. For a lead form, "one" is correct. If Northgate's repair lead form counts "every," one anxious homeowner who submits the form, does not hear back in four minutes, and submits it twice more becomes three conversions from one click. The reported repair-lead count inflates. A Target CPA strategy reads that as "this query produces three leads per click," bids up aggressively, and drives the real cost per lead upward while the reported cost per lead falls. You will be paying more for less and the dashboard will congratulate you.

**Click-through conversion window.** How long after an ad click a conversion can still be credited. A repair lead happens in hours; a 30-day window is fine and costs nothing. A system replacement can take six weeks, so a 30-day window on the Furnace Install conversion action will quietly discard real revenue. Set the window to fit the buying cycle, not to fit a default.

**View-through conversion window.** How long after an ad impression, with no click, a conversion can be credited. View-through is much weaker evidence than a click. Keep it, but do not put it in your primary conversion column, because it will make display and video campaigns look like they are performing when they may be taking credit for demand that already existed.

**Attribution model.** How credit is split when a conversion follows several ad interactions. Data-driven models distribute credit across the path; last-click gives all of it to the final interaction. Last-click systematically under-credits the upper-funnel keyword that started the journey and over-credits the brand keyword that closed it. Whichever you choose, choose one and keep it, because changing the model changes every historical comparison you make.

**Include in "Conversions."** This is the primary/secondary switch and it is the most consequential setting on the page. Only actions in the primary column are optimized toward by smart bidding and reported in the main Conversions column. Everything else is observation-only: visible in reporting, ignored by the bidder.

The rule is simple. Primary means "a true business outcome that the company would pay to get more of." Secondary means "useful to watch." For Northgate, form leads, qualifying calls, qualifying chats, and maintenance plan purchases are primary. Downloads of the furnace sizing guide, clicks on the directions link, and video plays are secondary. If you promote a soft action to primary because it makes the conversion count look healthier, you have not improved anything; you have instructed the algorithm to go buy guide downloads with the client's money.

Here is a workable configuration for Northgate.

| Conversion action | Category | Count | Value | Click window | View window | Primary? |
| --- | --- | --- | --- | --- | --- | --- |
| Book a Visit - Repair | Submit lead form | One | $108 | 30 days | 1 day | Yes |
| Book a Visit - Replacement | Submit lead form | One | $432 | 90 days | 1 day | Yes |
| Qualified Call (60s+) | Phone call lead | One | $108 | 30 days | 1 day | Yes |
| Chat Lead with Callback | Submit lead form | One | $108 | 30 days | 1 day | Yes |
| Maintenance Plan Purchase | Purchase | Every | $95 | 30 days | 1 day | Yes |
| Closed Replacement Job | Purchase | One | $2,400 | 90 days | 1 day | No (observation) |
| Sizing Guide Download | Other | One | none | 30 days | none | No |

The maintenance plan sells for $189 per year with $95 of first-year gross profit: $95 / $189 = 50.26% gross margin. The purchase action therefore carries $95 of gross-profit value, not $189 of revenue. The baseline Maintenance Plans campaign reports repair-type leads worth $108 each; its nine leads are not nine plan purchases. Keep these actions and their campaign goals distinct so one customer's lead and purchase are not accidentally counted as interchangeable acquisitions.

## Implementing the Tag

There are two mainstream ways to get the event onto the page, and you should be able to build either one and explain why you chose it.

The direct approach installs a global site tag on every page and fires an event snippet at the moment of success. The important word is "success." Not on the button, not on the page containing the form, but on the confirmed submission.

```javascript
// Global site tag - goes in <head> on EVERY page of northgateheatingair.com
// Replace AW-XXXXXXXXX with your own Google Ads conversion ID.
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', 'AW-XXXXXXXXX');

// Event snippet - fires ONLY when the form submission actually succeeded.
// Replace AbC-D_efGhIjKlMnOp with your own conversion label.
function reportRepairLead(orderId) {
  gtag('event', 'conversion', {
    send_to: 'AW-XXXXXXXXX/AbC-D_efGhIjKlMnOp',
    value: 108.0,
    currency: 'USD',
    transaction_id: orderId   // unique per lead - this is your de-duplication key
  });
}

// Wire it to the success callback of the form, not to the click handler.
document.querySelector('#book-a-visit-form')
  .addEventListener('submitSuccess', function (e) {
    reportRepairLead(e.detail.leadId);
  });
```

The `transaction_id` is doing real work there. If the same lead ID is sent twice, the platform can discard the duplicate. A conversion snippet without a transaction identifier has no defense against a page refresh.

The tag manager approach keeps the same logic but moves it out of the site code. You install one container on every page, the site pushes a semantic event into the data layer, and a trigger in the container listens for it and fires the conversion tag.

```javascript
// In the site's form success handler - push a semantic event, not a tag.
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: 'ngh_lead_submitted',
  lead_type: 'repair',          // 'repair' | 'replacement' | 'maintenance'
  lead_id: 'NGH-2026-004182',   // unique, used as transaction_id
  lead_value: 108.0,
  currency: 'USD',
  page_service: 'ac-repair'
});

// In the container you then configure:
//   Trigger:  Custom Event, event name equals ngh_lead_submitted
//             AND Data Layer Variable "lead_type" equals repair
//   Tag:      Google Ads Conversion Tracking
//             Conversion ID    = AW-XXXXXXXXX
//             Conversion Label = AbC-D_efGhIjKlMnOp
//             Value            = {{dlv - lead_value}}
//             Currency         = {{dlv - currency}}
//             Transaction ID   = {{dlv - lead_id}}
```

Choose the tag manager approach for Northgate. The reason is not elegance, it is turnaround. Northgate's site is maintained by a part-time contractor. With the container in place, adding a second conversion action, changing a value, or fixing a misfiring trigger is a change you can make and publish in ten minutes without a developer or a deployment. The direct approach is defensible when the site team is fast and the tracking is simple, or when a tag manager is disallowed by policy. Whichever you pick, pick one. The most common cause of double-counted conversions in the field is a hardcoded snippet left behind after a migration to a container.

## Call Tracking

For a contractor, the phone is the main conversion. A tracking setup that only counts form fills will misreport this account badly.

There are two distinct things to measure. **Calls from the ad** happen when someone taps a call asset or a call-only ad without ever reaching the site. The platform can measure these directly, because the call goes through a Google forwarding number and the platform sees the duration. **Calls from the website** happen when someone clicks the ad, lands on the page, and dials the number displayed there. To measure those, the platform swaps the displayed number for a forwarding number when the visitor arrived from an ad, records the call, and passes it back to the click that brought them.

The number swap is the fragile part. If the phone number on the page is rendered as an image, sits inside an iframe, or is injected by a third-party widget after the swap script has run, no swap occurs and the call is invisible. Render phone numbers as real text in a `tel:` link and the swap works.

The 60-second threshold is a quality filter, and you should be honest with yourself about how crude it is. Duration is a proxy for intent, nothing more. A 70-second call can be a wrong number where the caller was polite; a 45-second call can be a homeowner who said "my AC is dead, can you come today" and got booked immediately. What duration does have going for it is that it is objective, available for free, and applied identically to every call, which means it does not drift the way a human tagging leads in a spreadsheet does. Set it, document it, and if the client wants better lead quality signal than that, the answer is offline conversion import, not a longer threshold.

## Enhanced Conversions, Consent, and What You Are Obliged to Do

Browsers restrict cookies, people decline them, and a meaningful share of real conversions therefore never get matched back to the click that caused them. Enhanced conversions address this by sending a hashed version of first-party data the customer already gave you, typically email or phone, alongside the conversion event. The platform hashes the same fields on its side and matches. You never send the raw value.

That mechanism is useful and it is also where the legal and ethical obligations bite. Three rules, plainly.

**Get consent and let the tag know about it.** Consent mode is the mechanism: the tag reads a consent state and adjusts its behavior instead of firing regardless. If a visitor declines analytics or ad storage, the tag must respect it. A consent banner that sets a cookie and then loads every tag anyway is not consent, it is decoration.

**Do not upload data you have no right to upload.** A customer who filled in a repair form gave you their details so a technician could call them. Whether that also covers hashing their email and sending it to an advertising platform depends on your privacy policy and your jurisdiction, and the answer is not automatically yes. Read what your privacy policy actually says. If it does not cover it, either change the policy properly or do not do it.

**Honor opt-outs everywhere, immediately.** If someone unsubscribes or asks for deletion, they must drop out of your conversion uploads, not just your mailing list. That means the export that feeds offline conversion import has to filter on the same suppression list your email system uses.

You will be tempted at some point to send more data than you should, because match rates improve and the numbers look better. Do not. A conversion measurement advantage is not worth a regulatory problem for the client, and you are the person who will be asked to explain it.

## Offline Conversion Import for the Replacement Funnel

Northgate's replacement funnel breaks the standard model. A homeowner clicks a furnace install ad, submits a form, gets a visit, gets a quote, thinks about it, talks to a spouse, and signs three weeks later at the kitchen table. The $2,400 of gross profit exists, but it exists offline and it exists late. Nothing on the website knows it happened.

Offline conversion import is the honest answer, and it has three steps.

**Capture the click identifier.** When someone arrives from a Google Ads click, the landing page URL carries a GCLID parameter. Your landing page must read it and stash it, typically into a hidden field on the form and into a first-party cookie so it survives a visit to a second page.

```javascript
// Capture GCLID on landing, persist for 90 days, attach to the lead form.
(function () {
  var gclid = new URLSearchParams(window.location.search).get('gclid');
  if (gclid) {
    document.cookie = 'ngh_gclid=' + gclid + ';max-age=' + (90 * 86400) + ';path=/;SameSite=Lax';
  }
  var stored = (document.cookie.match(/(?:^|;\s*)ngh_gclid=([^;]+)/) || [])[1];
  var field = document.querySelector('#book-a-visit-form input[name="gclid"]');
  if (stored && field) { field.value = stored; }
})();
```

**Store it with the lead.** The GCLID has to travel into the CRM as a field on the lead record, next to the name and the address, and it has to survive every stage change from "new lead" to "job closed."

**Import the outcome back.** When the job closes, you produce a file with the GCLID, the name of the conversion action, the conversion time, the value and the currency, and upload it. The platform matches the GCLID to the original click and credits the conversion to that click's campaign, ad group and keyword, at the value you supplied.

The result is that a Furnace Install campaign can be bid on the thing that actually matters, closed jobs worth $2,400, rather than on form fills of unknown quality. Two practical cautions. First, the GCLID must be uploaded within the click-through window you configured, which is why the Replacement action above uses 90 days rather than 30. Second, the import is only as clean as the CRM. If a salesperson closes a job in a different record than the one holding the GCLID, the value never gets back to the ad. Offline import is a data hygiene project wearing a marketing hat.

## Assigning Values Instead of Counting Leads as Equal

This is where tracking stops being plumbing and starts being strategy.

Northgate's two lead types are not close in worth. A repair lead is worth 0.60 x $180 = $108 in gross profit. A replacement lead is worth 0.18 x $2,400 = $432. One is four times the other. If both are recorded as "1 conversion, no value," you have deleted that fact from every report and every bidding decision downstream.

Consider what a Maximize Conversions campaign with an $1,800 monthly budget does with that deletion. It optimizes for the count. Forty is more than ten, so given a choice between forty repair leads and ten replacement leads, it takes forty.

Run the arithmetic at the account's real costs. Repair-type traffic in the AC Repair ad group converts at a cost per acquisition of $74.42.

```txt
Count-optimized outcome (no values set)
  Budget                $1,800.00
  CPA on repair leads   $74.42
  Leads bought          $1,800.00 / $74.42 = 24.19  ->  24 leads
  Spend                 24 x $74.42 = $1,786.08
  Gross profit          24 x $108   = $2,592.00
  Contribution          $2,592.00 - $1,786.08 = $805.92

Value-optimized outcome (values set, replacement traffic)
  Budget                $1,800.00
  CPA on replacement    $133.33
  Leads bought          $1,800.00 / $133.33 = 13.50  ->  13 leads
  Spend                 13 x $133.33 = $1,733.29
  Gross profit          13 x $432    = $5,616.00
  Contribution          $5,616.00 - $1,733.29 = $3,882.71

Difference in monthly contribution: $3,882.71 - $805.92 = $3,076.79
Annualized: $3,076.79 x 12 = $36,921.48
```

Look at what the conversion column says while that is happening. The broken setup reports 24 conversions; the correct one reports 13. On a conversion-count report the version that earns $3,077 less per month is winning by 85 percent. That is not a subtle failure mode. That is the report actively arguing for the wrong decision, month after month, with a straight face.

It gets worse when someone averages the two lead values to pick a single target. "Leads are worth $108 or $432, so call it $270 and set a Target CPA of $180." A $180 target is above the $108 break-even for a repair lead, so every repair lead the campaign buys at target loses $72 of gross profit. The campaign will hit its target beautifully and lose money doing it.

The fix is to make the values visible to the system: separate conversion actions with distinct values, or a single action receiving a dynamic value from the data layer, and then a value-based strategy such as Maximize Conversion Value with a target return on ad spend. You will do that bidding work properly later in the course. The point here is that none of it is available to you unless the value is in the conversion feed, and putting it there is a tracking job.

## Attribution Windows and Conversion Lag

Conversions do not arrive when clicks arrive. They trail behind, and the trail is a different length for every product.

Here is the same 30-day click cohort measured three times, at one day, seven days and thirty days after the click.

| Ad group | Clicks | Conv at day 1 | Conv at day 7 | Conv at day 30 | Day 1 as % of final |
| --- | --- | --- | --- | --- | --- |
| Non-brand - AC Repair | 390 | 37 | 42 | 43 | 86% |
| Non-brand - Furnace Install | 178 | 4 | 8 | 12 | 33% |

Now convert those to the number a client would actually be shown.

```txt
AC Repair, $3,200 spend
  Day 1  CPA = $3,200 / 37 = $86.49
  Day 7  CPA = $3,200 / 42 = $76.19
  Day 30 CPA = $3,200 / 43 = $74.42

Furnace Install, $1,600 spend
  Day 1  CPA = $1,600 / 4  = $400.00
  Day 7  CPA = $1,600 / 8  = $200.00
  Day 30 CPA = $1,600 / 12 = $133.33
```

Judged 48 hours after launch, AC Repair looks roughly right and Furnace Install looks like a disaster at three times its true cost. A manager who reacts to the day-one number pauses the replacement campaign, which is the campaign carrying the $432 leads. The reaction is confident, fast, and wrong.

Two habits follow. First, never evaluate a campaign inside its own conversion lag; find out what the lag actually is for this account by looking at the shape above, and wait for it. Second, when you do report, be explicit about the window and never compare a fresh period against a mature one without saying so. "Last 7 days versus the 7 days before" is a comparison of an incomplete number against a complete one, and it makes performance look like it is falling every single week.

## The Verification Routine

This is the real deliverable of the lesson. Installing a tag takes fifteen minutes. Proving it works takes an hour and is the part that separates people who can be trusted with an account from people who cannot.

Run this every time, in order.

1. **Open the tag debugger or preview mode** and connect it to the live site, so you can watch what fires in real time.
2. **Load the landing page and do nothing.** Confirm the conversion event does not fire. If it fires here, stop; nothing else matters until that is fixed.
3. **Submit a genuine test lead** through the real form, with a recognizable test name and a phone number you control.
4. **Confirm the event fired exactly once.** Not zero, not twice. Watch the event list, not just the success message.
5. **Confirm the payload.** The value is 108, the currency is USD, the transaction ID is populated and unique, the lead type is right.
6. **Confirm it landed on the correct conversion action.** A tag can fire perfectly and be pointed at the wrong conversion label, which sends a repair lead into the replacement bucket at four times its value.
7. **Wait for reporting latency and check it appears.** Conversions typically surface within a few hours, not instantly. Know the expected latency before you panic.
8. **Check the attribution.** In a live account with approved spend, check that a real ad-attributed conversion keeps its click attribution. In this course's sandbox, use a test landing-page URL with a dummy `gclid` parameter and verify that it survives into the CRM field; do not click a live ad or expect a fabricated identifier to receive platform attribution.
9. **Refresh the thank-you page and go back to it from history.** Confirm no additional conversion is recorded.
10. **Repeat on a real mobile device**, not a desktop emulator, because mobile is where redirects and cross-domain handoffs break.
11. **Exclude the test data.** Remove the test conversions, or run the whole exercise against a test conversion action and a filtered view, so your QA does not become the client's reporting.

Write the result down. A QA report with the date, the tester, the device, the steps and the observed payloads is a five-minute document that will save you a month-long argument.

## A Catalogue of Tracking Defects

You will meet all of these. Learn the symptom, then the cause.

| Symptom | Likely cause |
| --- | --- |
| Conversion rate near 100%, conversions equal sessions | Tag fires on page load instead of on submission success |
| Every conversion counted exactly twice | Both a container tag and a leftover hardcoded snippet on the page |
| Conversions with no matching CRM lead, spiking on odd days | Thank-you page bookmarked, refreshed, or crawled |
| A handful of leads named "test test" in the client report | QA submissions never excluded from production data |
| Mobile conversion rate near zero, desktop normal | Form redirect fails on mobile so the thank-you page is never reached |
| Repair lead count much higher than jobs booked | Conversion action set to "every" instead of "one" |
| Total conversion value is zero or blank | Value not set, or the value variable is empty in the data layer |
| The same outcome appears in two columns, both under-counted | Duplicate conversion actions splitting one outcome |
| Booking widget conversions all attributed to direct | Cross-domain tracking not configured, GCLID dropped at the third-party domain |
| Phone conversions collapse after a site redesign | Number rendered as an image or injected after the swap script, so no forwarding number is inserted |

Two of these deserve extra attention because they are the expensive ones. Page-load firing is expensive because it does not look broken; it looks like great performance, and smart bidding will chase it hard. Cross-domain GCLID loss is expensive because it does not remove conversions from the account, it just moves them into "unattributed," which quietly makes every campaign look worse than it is and invites you to cut the wrong budget.

## Reconciling the Ad Platform, GA4, and the CRM

Sooner or later a client puts three numbers next to each other and asks why they disagree.

| Source | AC Repair leads, same month | Why it differs |
| --- | --- | --- |
| Google Ads | 43 | Credits the conversion to the click date, within its own click window, using its own attribution model, and only counts Google Ads clicks |
| GA4 | 38 | Session-scoped and reported on the conversion date, uses its own model and lookback, and loses conversions where consent was declined or the session broke |
| Northgate CRM | 47 | Counts every inbound lead from every source, including calls under 60 seconds and duplicate submissions, with no attribution logic at all |

They will never match exactly, and a setup where they match exactly should make you suspicious rather than pleased. Different attribution models, different windows, different date conventions, different definitions of a lead. What you should expect is that they move together and sit within a stable band of each other. A gap that holds steady at 10 to 15 percent is normal. A gap that suddenly doubles is a defect, and now you have a monitor for free.

What do you report to the client? Report the CRM number as the count of leads the business received, because that is the thing the business can verify against its own phone log and its own calendar. Report the ad platform numbers for campaign decisions, because those are the numbers the bidding system is actually using and the ones your optimizations will move. Say out loud, in the report, that the two are measured differently and why. The failure mode here is not having three numbers; it is presenting one of them as if it were the truth and being unable to explain the others when asked.

## A Reusable Tracking Audit Checklist

- Is there a written conversion definition document, and does it match what is configured?
- Does every primary conversion correspond to a real business outcome, not an engagement proxy?
- Is every count setting "one" except for genuine repeat purchases?
- Does every conversion action carry a value, and is the value defensible in gross profit?
- Are the click-through windows long enough for the longest real sales cycle in the account?
- Is exactly one implementation method in use, with no orphaned hardcoded snippets?
- Does every conversion event carry a unique transaction identifier?
- Is call tracking installed, with a documented duration threshold and a text-rendered number?
- Is consent mode configured, and does declining consent actually change tag behavior?
- Is GCLID captured, stored on the lead, and importable back as an offline conversion?
- Has a real test lead been submitted, verified end to end, and then excluded?
- Do the ad platform, analytics and CRM counts sit in a known, stable relationship?

## Practice

You are implementing and QAing conversion tracking for Northgate Heating and Air. Nothing in this exercise spends money. Use a tag debugger, a free tag manager container, and a test page or staging form.

1. **Write the conversion definition document.** One page. For each conversion Northgate cares about, record the business name, the exact technical event, the qualifying condition, the gross-profit value with its derivation, primary or secondary, and the owner. Include at least the repair form lead, the replacement form lead, the qualifying phone call, the chat lead, and the maintenance plan purchase. Where you need a number the lesson did not give you, state the assumption inline.

2. **Specify the conversion actions in a table.** Reproduce the settings table from this lesson with your own choices, and add a final column giving a one-sentence justification for the count setting and the click-through window on each row. You must be able to defend why the replacement action's window is longer than the repair action's.

3. **Write the event snippet.** Produce the working code for the repair lead conversion in both forms: the direct gtag event snippet, and the data layer push plus a written description of the trigger and variable mapping in the container. Mark placeholder identifiers clearly. State which approach you would deploy for Northgate and give the reason in two sentences.

4. **Build it in a sandbox.** Create a test page with a form and a thank-you page, install a container, and wire the trigger so the conversion fires on submission success. Use a test conversion action so nothing pollutes real reporting.

5. **Run the full verification checklist.** Work through all eleven steps from the verification section. Capture evidence as you go: what fired, when, with what payload, and on which device. Include a mobile pass on a real handset.

6. **Find the seeded defects.** Your instructor will supply an evidence pack from a second Northgate container: a debugger event log, a screenshot of a conversion action settings panel, a seven-day conversions report, and a short CRM lead export. At least two defects are present. Identify each one, name the symptom you spotted it by, name the cause, and state the specific fix. Then say what each defect would have done to the account if it had run for a month unnoticed, in dollars where you can.

7. **File the QA report.** One document, no more than two pages, containing: the date and tester, the environment tested, a pass or fail line for every checklist item with the supporting evidence, the defects you found with their fixes, any item you could not verify and why, and a signed statement of whether this tracking is fit to bid on. That last line is the deliverable. Sign it only if you would be comfortable letting a Target CPA campaign spend $6,080 a month on the data behind it.
