---
lesson_id: dm301-09
course_id: dm301
pathway: digital-marketer
title: "Project: Analytics Audit and CRO Experiment Plan"
order: 9
kind: project
competency_ids:
  - D6-S1-C03
  - D6-S2-C02
  - D6-S2-C03
objectives: []
---

## Goal

Walk the entire arc of this course once, on your own, and produce the two documents a working analyst is actually paid for: an **analytics audit** that says what is true and what cannot be trusted, and a **conversion experiment plan** that turns one finding into a decision somebody can act on.

You are not being marked on finding a large effect. You are being marked on whether your conclusions survive being checked — whether the numbers reconcile, whether the differences you call real are real, whether the ones you call noise are noise, and whether you were honest about the limits of what you measured.

## The Brief

Pick one of two tracks and say at the top of your submission which you chose.

**Track A — a real property.** You have read access to a GA4 property and its Search Console property for the same site. This is the better track and you should take it if you can. Personal sites, a small business you have permission to work with, an employer's property, or a program-supplied sandbox all qualify.

**Track B — the Kestrel Outfitters dataset.** Your instructor supplies the exported 28-day dataset used throughout this course: GA4 sessions, events, and key events by channel, device, and landing page; the Search Console export; the usability findings table; and the heatmap, recording, and survey outputs.

On Track B there is one hard restriction. **You may not build your plan on the mobile checkout finding.** That problem is worked end to end in lessons 05 through 08 and reproducing it demonstrates nothing. Find something else in Kestrel's data — the guides, the cart-to-checkout step, a channel, a landing page, the outlet store, the desktop path, returning versus new visitors — and work it yourself.

Whichever track you take, you are writing for **one named stakeholder** who is not technical. Say at the top who they are and what decision they are trying to make.

## Requirements

### Part 1 — Trust the data before you use it

Produce a data-quality section, one page, covering at minimum:

- Property setup: time zone, currency, data retention, and whether an internal traffic filter exists and is active.
- Key events: which events are marked key, and whether each is genuinely an outcome the business would pay for. Name any that should not be, and any outcome that has no event at all.
- The share of sessions in `Unassigned`, and any `(other)` or `(not set)` rows large enough to affect a conclusion you intend to draw.
- One verification you performed yourself: pick one event that matters, prove what it does and does not fire on, and record the evidence. Track B learners verify against the supplied event definitions and DebugView captures.
- Search Console clicks against GA4 organic sessions for the same window, expressed as a percentage gap, with the sentence you would put in a report so that nobody asks you to reconcile them.

End the section with a plain-language list: **what this data can be trusted for, and what it cannot.**

### Part 2 — Establish the baseline

A one-page scorecard for a **28-day period**, compared to the previous 28 days. It must contain:

- The primary KPI with its **denominator stated explicitly**, and a target with a sentence explaining where the target came from.
- Three to five diagnostics, with counts printed beside every rate.
- A funnel of at least four steps, as step-to-step rates, and the same funnel split by at least one segment.
- An explicit **noise-floor line**: the size of move you will treat as real this period, with the arithmetic that produced it.

### Part 3 — Find three findings, and test them

Three findings, each written in the lesson 05 template with every slot filled: finding, evidence, is it real, so what, decision, expected effect, how we will know, what would make me wrong.

Requirements on the set of three:

- At least one must come from **joining Search Console to GA4** at the landing page.
- At least one must be a difference you subjected to the **standard-error arithmetic**, with the working shown and the number of standard errors stated.
- At least one must be a **decision not to act**, with the threshold that would change that, written in the same format as the others.
- Every finding must name at least one **impostor you ruled out** — calendar shape, definition drift, tracking break, or mix shift — and say how.

### Part 4 — Explain one finding with qualitative evidence

Take the finding you intend to act on and produce evidence about **why**, from at least two of these three sources:

- A **usability test** of at least three participants, with a screener, scenario-form tasks, a consent script, and a findings table carrying severity ratings and the count of participants affected.
- A **behavioral instrument**: a scroll or tap map read on a single device type with at least 200 sessions behind it, or at least ten session recordings watched against a written question and filter defined in advance.
- **User feedback**: a one-question micro-survey with its trigger and timing, or a structured read of support tickets, reviews, or on-site search terms.

Track B learners use the supplied qualitative outputs and must state which populations those outputs cover.

Then write the triangulation table: one row per instrument, one column for what it contributed, and one row or note for anything the instruments **disagree** about.

### Part 5 — The experiment plan

One proposal, in full form: because, we believe, will cause, for which segment, measured by. Plus:

- The **sizing arithmetic** at two levels of success, in orders or leads and in gross profit, with the division visible.
- The **downside**, priced, if the change moves the metric the wrong way and runs unnoticed for two periods.
- The **sample-size arithmetic**: sessions or events needed per variant, and the calendar time at the property's actual traffic. If it exceeds six weeks, redesign the test and show both calculations.
- A **decision method** — split test, ship and monitor, holdout, or refuse — with a justification, and if it is not a split test, the sentence describing what your evidence cannot rule out.
- **Guardrail metrics**, at least three, one of which would catch a rate improved by shrinking its denominator.
- A **pre-registered threshold** with a date on it.

### Part 6 — The stakeholder report

Two pages maximum, for the non-technical person you named. Five sections: the question, the answer, the evidence, what you recommend, and what you cannot tell them yet. Include one table with no more than five columns and no jargon. Formal attribution modeling, if it comes up at all, belongs in the last section and never in your conclusions.

## Constraints

- **Read-only on production.** Do not change a live site, a live campaign, or a property's configuration on a property you do not own. Configuration work goes in a sandbox.
- **No real payment details** in any usability session, ever. Stop the task before payment.
- **Consent and privacy are yours to handle.** Written consent before recording anybody. Form masking on before a recording tool collects a single session. Do not capture personal data you do not need, and delete anything a participant asks you to.
- **No spend.** Nothing in this project requires a budget beyond free tiers and an incentive for participants.
- **Do not quote the intake or a benchmark as evidence.** Your own property's trailing history is the only benchmark that should drive a recommendation.
- **Out of scope, deliberately:** SQL, warehouse exports, formal attribution or marketing-mix modeling, and tag architecture beyond verifying that an event fires. If your question needs one of these, say so in Part 6 and describe what it would take.

## Definition of Done

Your submission is complete when every one of these is true.

1. The track, the stakeholder, and the decision they face are named on the first page.
2. Every rate in every table has its denominator stated, and every rate has a count printed beside it.
3. Your segment tables **sum to the totals** in the standard reports. Any discrepancy is explained, not hidden.
4. The Search Console to GA4 gap is stated as a percentage with at least three reasons and one report-ready sentence.
5. A noise floor is computed with visible arithmetic, and it is applied — at least one number in your data is explicitly classified as within normal variation and not reported as a change.
6. At least one difference is tested with the standard-error arithmetic and its size stated in standard errors.
7. Three findings appear in the full template with every slot filled, including "what would make me wrong."
8. One of the three is a documented decision **not** to act, with a numeric threshold.
9. Each finding names at least one impostor ruled out, and says how.
10. Qualitative evidence comes from at least two independent instruments, with sample sizes stated and no claim quantified from a five-person study.
11. The triangulation table exists and includes at least one disagreement, or an explicit statement of which instrument could have disagreed and was not used.
12. The experiment plan carries sizing arithmetic, a priced downside, sample-size arithmetic with calendar time, a decision method, three guardrails, and a dated pre-registered threshold.
13. The gross-profit effect is computed for the **whole business**, not only the targeted segment, wherever the change costs margin.
14. The stakeholder report is two pages or fewer, has all five sections, and a reader outside marketing can state your recommendation back to you without prompting.
15. Nothing in the report claims something the evidence does not support. If you are unsure about a sentence, cut it or move it to the limitations section.

## Hints

**Do Part 1 before you get interested in anything.** Every apprentice wants to skip the audit and go hunting. The audit is what makes the hunt worth reading, and it is also where a genuine finding often turns up — an outcome with no event behind it is a bigger deal than most conversion rates.

**Pick the boring finding.** A stable, well-evidenced, moderately sized problem beats a dramatic one you cannot reproduce. Graders and clients both value the first far more than the second.

**Segment before you conclude, every time.** The aggregate is a hiding place. Device, channel, landing page, new versus returning. Then check the cell counts and stop splitting when they get small.

**When a percentage impresses you, find the count.** That reflex will catch more errors than any other single habit in this course.

**Watch recordings only after you have written the question and the filter.** Otherwise you will spend three hours and produce an anecdote.

**Write the "what would make me wrong" line before you write the recommendation.** In lesson 06 that discipline is what caught a wrong mechanism behind a right conclusion. It will do the same for you, and it is much harder to write honestly after you have committed to a proposal.

**Give ranges, never single forecasts,** and always name the assumption carrying the most risk. You will be wrong sometimes. A range plus a named assumption is a professional being wrong; a single number is a hostage.

**Test where the base rate is high.** The sample-size arithmetic rewards deep-funnel, narrow-segment experiments enormously. If your test needs five months, you have chosen the wrong step, not the wrong tool.

**Leave the limitations section in.** Every instinct will tell you it weakens the report. It does the opposite, and it is the section that protects you when somebody acts on a number you never claimed was precise.
