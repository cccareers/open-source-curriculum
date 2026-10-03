---
course_id: dm301
media_id: dm301-v02
type: video-script
title: "Verifying a Purchase Event, Step by Step"
format: screencast
target_runtime: "9 min"
related_lessons:
  - dm301-02
objectives:
  - Set up a GA4 property and verify that it collects the events a business cares about
competency_ids:
  - D6-S1-C01
---

## Purpose
After watching, a learner can run lesson 02's ten-step verification routine on a test property, recognise a correct `purchase` payload, and spot a double fire and a refresh re-fire from DebugView evidence.

## Audience and prerequisites
Apprentices who have read lesson 02 through "Verifying That It Works" and have a sandbox GA4 property on a test page they own. **Never film on a production property you do not own.**

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Cold open: two numbers side by side, "GA4 revenue $9,900" and "Order system $5,418". | "When these two numbers disagree, most people start arguing about attribution. Usually the answer is simpler: the tag fired when it should not have. Here is how to prove what a tag does, in about an hour." |
| 0:20 | Title: "Verifying a Purchase Event". A sandbox banner: "Test property — not production". | "We are on a sandbox property and a test shop page. Everything here is safe to break." |
| 0:35 | Browser with Tag Assistant connected; a product page that was not modified. Panel shows "Google tag loaded". | "Step one. Connect Tag Assistant preview and open a page you did not touch. Confirm the Google tag loads. If it does not, nothing else in this video matters." |
| 1:05 | Load the checkout page; do nothing. Panel lists `begin_checkout`; no `purchase`. Text: "Step 2: PASS — no purchase on load". | "Step two. Load checkout and do nothing. A purchase event here would mean every visitor who reaches checkout counts as a sale. It does not fire. Pass." |
| 1:40 | Place a test order named "QA Test Order". Confirmation page loads. | "Step three. Place a real test order under a name you will recognise later." |
| 2:00 | Admin → DebugView. Device selector shows the debug device; event stream shows one `purchase`. Click it; parameter panel expands: `transaction_id`, `value 86`, `currency USD`, `items` (1). | "Step four: exactly one purchase. Not zero, not two. Step five: open the payload. Transaction ID present and unique. Value matches the order. Currency set. Items present and not empty." |
| 2:50 | Overlay the correct JSON from lesson 02 beside the DebugView panel; tick each field. | "Compare it to the shape in the lesson: transaction ID, value, currency, items. Those four are what make the Monetization reports work." |
| 3:20 | Refresh the confirmation page. DebugView: no new purchase. Then navigate away and back via browser history: no new purchase. Text: "Step 6: PASS". | "Step six. Refresh, then come back from history. If a second purchase appears, every customer who reloads their receipt doubles your revenue. Nothing new fires. Pass." |
| 3:55 | Phone screen mirrored; repeat the order. DebugView shows the phone device. | "Step seven. Repeat everything on a real phone. Kestrel is seventy percent mobile, and mobile is where redirects and payment handoffs break." |
| 4:35 | Session source panel for the test session shows the campaign from a tagged link used to start the session. | "Step eight. Start the test from a tagged link and check the session's source. If it lands in Direct, something is stripping your campaign parameters." |
| 5:00 | Show the debug filter / test-data exclusion setting. | "Step nine. Keep your QA out of the owner's reports: run behind a debug filter or exclude the test orders." |
| 5:20 | A verification log template filled in: date, tester, device, steps, payload screenshot names, pass/fail. | "Step ten. Write it down. A verification you cannot show someone did not happen." |
| 5:45 | Now break it on purpose: add a second hardcoded purchase snippet to the test confirmation page. Place another test order. DebugView shows two `purchase` events with the same `transaction_id`. Text: "Double fire". | "Now let us break it, because recognising failure is the skill. I have added the old hardcoded snippet back, as if a migration left it behind. Two purchase events, same transaction ID. This is the most common cause of double-counted revenue anywhere." |
| 6:40 | Remove the transaction_id from the snippet; refresh the confirmation page. DebugView shows a purchase with an empty `transaction_id`. Text: "Refresh re-fire — cannot be de-duplicated". | "Second break: a purchase with an empty transaction ID on refresh. GA4 de-duplicates on transaction ID, so an empty one cannot be caught. Your revenue now grows every time someone reloads a receipt." |
| 7:30 | Admin screen: Unwanted referrals list, add `example-payments.com` (placeholder). | "And one admin setting worth checking in the same pass: if your checkout hands off to a payment provider and returns, list that provider as an unwanted referral, or your purchases will be credited to it." |
| 8:05 | Restore the clean setup; re-run steps 3-6 quickly; all pass. | "Fix, then re-run the routine from step three. Do not assume the fix worked." |
| 8:30 | Recap card: "Load ≠ purchase. Exactly one. Payload shape. Refresh. Phone. Source. Exclude QA. Write it down." | "Proving collection takes an hour. It is the hour that makes every report afterwards worth reading." |

## On-screen assets and B-roll
- Sandbox test page with a fake checkout (no real payment provider; the payment domain is a placeholder).
- Lesson 02 payload JSON as an overlay.
- Verification log template (CSV).

## Accessibility
- Captions; parameter names read aloud as they are highlighted.
- PASS/FAIL shown as words beside each step, not only icons or colour.
- Browser zoom at 150% for DebugView panels; phone mirrored at large size.

## Check for understanding
1. Why must `purchase` never fire on the checkout page load? *Answer: every visitor who reaches checkout would be counted as a sale, inflating purchases and revenue.*
2. Two purchase events with the same `transaction_id` appear. What is the likely cause and fix? *Answer: two implementations (hardcoded gtag plus container) both firing; remove one so exactly one implementation remains.*
3. Your test order started from a tagged email link shows as Direct. What does that indicate? *Answer: campaign parameters are being dropped somewhere (redirect, cross-domain handoff), so the session source is wrong.*

## Production note
Admin menu locations in GA4 and Tag Assistant change; record the screencast close to release and add a "UI as of" date in the description rather than narrating menu paths.
