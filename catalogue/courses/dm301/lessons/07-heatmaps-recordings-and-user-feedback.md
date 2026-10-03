---
lesson_id: dm301-07
course_id: dm301
pathway: digital-marketer
title: Heatmaps, Recordings, and User Feedback
order: 7
kind: lesson
competency_ids:
  - D6-S2-C03
objectives:
  - Use heatmaps, session recordings, and user feedback to locate experience
    problems
---

## Three Instruments, Three Different Questions

This is an introduction. Behavioral analytics tooling is a specialism, and two hours buys you competence with the instruments rather than mastery of them. What you should leave with is the ability to pick the right one for a question, read its output without over-claiming, and combine it with the numbers you already have.

Everything here is taught **as a category**. Heatmap and session-recording products are bought from several vendors, they differ in detail, and the ones your program licenses may not be the ones you meet in your first job. The concepts transfer; the menus do not. Where this lesson says "the tool," find the equivalent in whatever you have.

| Instrument | Answers | Does not answer |
| --- | --- | --- |
| Heatmaps | Where attention and taps land, in aggregate | Why, or what any individual wanted |
| Session recordings | What one person's experience actually looked like | How common that experience is |
| User feedback | What people say the problem is, in their words | What they actually did |

Note what is missing from every row: **how often**. That remains a GA4 question. The pattern from lesson 06 holds here too — these instruments generate explanations, and analytics sizes them.

## Heatmaps

A heatmap aggregates many sessions on one page into one picture. Three kinds are worth knowing.

**Click and tap maps** show where people press. Their most valuable output is not the hot area; it is taps on things that are not interactive. Repeated taps on a static image mean people expect it to do something, and that is a design defect stated in behavior rather than opinion.

**Scroll maps** show what proportion of visitors reached each depth. Here is Kestrel's product page for the Ridgeline 28, mobile only, 1,240 sessions:

```txt
  Ridgeline 28 product page - mobile scroll depth (1,240 sessions)

  Hero image and price            100%
  Add to cart button               94%
  Short description                88%
  Specification list               62%
  Size and capacity chart          62%
  Customer reviews                 38%
  Shipping and returns accordion   21%
```

Read it carefully. Ninety-four percent reach the add-to-cart button, which is fine. Only 38 percent reach the reviews, on a product where reviews are the main reassurance. And **21 percent reach the shipping accordion** — which is where the delivery cost lives, on the page where lesson 06's most severe finding said the expectation gets set. Two independent instruments have now landed on the same place.

**Move or attention maps** approximate where people look by tracking cursor position or viewport dwell. Treat these as the weakest of the three. Cursor position is a poor proxy for gaze on desktop and close to meaningless on touch devices, and vendors present them with a confidence the underlying signal does not support.

Four ways a heatmap misleads, and you must be able to name them.

**Responsive layouts get averaged.** If the tool aggregates a phone layout and a desktop layout into one image, the resulting map describes a page that nobody saw. Always segment by device or viewport before reading anything.

**Dynamic content moves.** On a page where a banner appears for some visitors, the hot spot at a fixed coordinate is two different elements.

**Sample size still applies.** A tap map built from 40 sessions is decoration. A few hundred sessions per segment is a reasonable floor for a page-level pattern.

**It tells you what, never why.** A hot spot is a fact about fingers, not about intent. Somebody tapping repeatedly might be enthusiastic or might be waiting for something that never happens.

## Session Recordings

A recording plays back one visitor's session: pages, movements, taps, scrolls, form interactions, and rage-clicking. It is the most seductive instrument in this lesson and the easiest to waste a day on.

The rule that makes it useful: **never watch recordings without a question and a filter.** Watching a random hour is entertainment. Instead, segment first, then watch.

Kestrel's review was scoped like this: mobile sessions, from the last 14 days, that fired `begin_checkout` and did not fire `purchase`. Twenty recordings, watched with a single question — where does the session end, and what was on screen when it ended?

```txt
  20 mobile sessions: reached checkout, did not purchase

  Ended on the shipping and totals screen        11
  Ended on the account or guest choice            4
  Left to search for a promo code, never back     2
  Ended mid-address entry (keyboard visible)      2
  Ended for no visible reason                     1
```

Eleven of twenty ending on the screen where the total first appears is the same finding as F1 from the usability test and the same finding as the 21 percent scroll depth. Three instruments, three methods, one answer. That convergence is what should move a decision, not any one of them alone.

And be precise about what twenty recordings support. It is **not** "55 percent of abandoners leave at the totals screen." It is "of twenty sessions selected on one filter, eleven ended there, and the pattern is consistent enough to be worth sizing properly." The sizing comes from GA4: 1,690 mobile checkouts and 289 completions per 28 days.

Two more practical points. Watch at normal speed for the first few — the pauses are the data, and skipping them removes the hesitation you are looking for. And **privacy is your responsibility here**, not the vendor's. Recording tools must mask form input by default. Addresses, phone numbers, and anything resembling payment details must never enter a recording, your consent notice must disclose that session recording happens, and declining consent must actually stop the recorder rather than merely hiding a banner.

## User Feedback

The third instrument asks people directly. Four sources, in increasing order of how much work they take.

**On-site micro-surveys.** One question, triggered by context. Kestrel put a single question on checkout exit intent and collected 84 responses over 14 days: *"What almost stopped you from ordering today?"*

```txt
  84 responses, checkout exit-intent survey, 14 days

  Delivery cost or delivery time          38
  Wanted to compare with another site     14
  Unsure about sizing or fit              12
  Wanted to think about it                 9
  Payment method not offered               7
  Other or unreadable                      4
```

**Post-purchase surveys** reach people who succeeded, which makes them the wrong audience for abandonment questions and the right one for "what nearly stopped you."

**Support tickets and on-site search terms.** Free, already collected, and almost always ignored. Repeated site searches for a term you do not stock, or for a page that exists but cannot be found, are direct product feedback with no survey required.

**Reviews and unsolicited comments**, read for recurring language rather than sentiment.

Three rules for asking.

**One question, at the right moment.** A five-question survey on exit gets abandoned by the people who were already abandoning.

**Do not lead.** "Was our delivery cost too high?" produces a yes. "What almost stopped you from ordering today?" produces the seven mentions of an unavailable payment method that you would never have guessed.

**Remember who answers.** Survey respondents are self-selected, skewed toward the annoyed and the enthusiastic. Eighty-four responses out of thousands of sessions is a source of hypotheses, not a distribution of causes.

## Triangulating

Kestrel's case is now five instruments deep, and this is the shape a real investigation takes.

| Instrument | What it contributed |
| --- | --- |
| GA4 | Mobile checkout completion 17.1% against desktop 41.9%, over 1,690 mobile checkouts. The size |
| Usability test | 4 of 5 met the shipping cost first on checkout screen 3; 2 stopped there. The mechanism |
| Scroll map | Only 21% of mobile product-page visitors reach the shipping accordion. The cause upstream |
| Recordings | 11 of 20 abandoned sessions ended on the totals screen. Confirmation, and a second issue at the guest-checkout choice |
| Exit survey | 38 of 84 named delivery cost or time, unprompted. The customer's own words |

Three principles for combining evidence.

**Quantitative locates, qualitative explains.** Find where in the numbers; find why by watching and asking. Reversing this order is how people spend a week watching recordings of a problem that affects nine sessions a month.

**Convergence is the signal.** One instrument saying something is a hypothesis. Four independent instruments saying it is a finding you can put your name on.

**Disagreement is information, not noise.** If the survey says price and the recordings say the address form, you have two problems, or one of your instruments is sampling a different population. Say which you think it is and why.

What Kestrel now has is a specific, evidenced statement: *mobile visitors form a price expectation on a product page where 79 percent never see the delivery cost, and it is corrected at the last possible moment.* That is a sentence somebody can act on, and lesson 08 is where you turn it into a proposal.

## Practice

Use a site you have permission to instrument. A free tier of any heatmap and recording tool is sufficient; the vendor does not matter. If you cannot instrument a site, use a public demo or a recorded dataset your instructor supplies and say so.

**Part 1 — Instrument one page.** Install a heatmap and recording tool on a single high-traffic page. Confirm form masking is on and that the consent notice mentions recording. Write two sentences on what you had to configure to make it privacy-safe.

**Part 2 — Read a scroll map.** Collect at least 200 sessions on one device type. Produce the depth table. Identify one element that fewer than half of visitors reach, and say whether that element matters — some things below the fold are correctly below the fold.

**Part 3 — Read a tap map.** Find one non-interactive element receiving taps. State what you think people expected, and what change you would make.

**Part 4 — Watch with a question.** Write the question and the filter **first**. Watch at least ten sessions matching it. Log where each ended and what was on screen. Then write the one sentence your ten recordings actually support, and the tempting sentence they do not.

**Part 5 — Ask one question.** Write a one-question micro-survey, with the trigger and timing. Then write two leading versions of the same question and explain what each would have produced instead.

**Part 6 — Triangulate.** Build the four-row evidence table for one problem: the analytics number that sizes it, the qualitative evidence that explains it, and one place where two instruments disagree. If nothing disagrees, say which instrument you have not yet used that could disagree.

**Part 7 — Write the over-claim list.** Three sentences you could truthfully write from your evidence, and three that a stakeholder would probably say instead. For each of the second three, name the specific reason the evidence does not support it.
