---
lesson_id: dm101-08
course_id: dm101
pathway: digital-marketer
title: Privacy, Ethics, and Advertising Policy
order: 8
kind: lesson
competency_ids:
  - D7-S2-C01
  - D7-S2-C02
objectives:
  - Apply data-privacy and advertising-policy requirements to a marketing plan
  - Identify an unethical or non-compliant marketing practice and propose a
    correction
---

## Why this sits in the entry course

Every channel in this course collects data about people or makes claims to them. A subscriber list is personal data. A retargeting audience is personal data. A headline is a claim someone can be held to. The rules governing all of that are not a specialist add-on; they are a constraint on the plan itself, and a plan built without them gets rebuilt expensively later.

Three bodies of rules apply to almost any campaign:

1. **Data-privacy law** — what you may collect about a person, why, and what they can demand you do with it.
2. **Advertising and consumer-protection law** — what you may claim, and how offers and endorsements must be disclosed.
3. **Platform advertising policies** — the private rules of whichever ad system you buy from, which are often stricter than the law and are enforced by removing your account.

**This lesson is professional orientation, not legal advice.** It teaches you to recognize a problem and to know when to stop and ask. Regulations and platform policies change; verify the current text before acting on anything with real consequences.

## Data privacy: the two regimes to know

### GDPR — the European model

The General Data Protection Regulation governs the processing of personal data of people in the EU and EEA. Its reach follows the person, not the company: an organization anywhere can fall under it by marketing to or monitoring people in the EU.

**Personal data** is broad — any information relating to an identified or identifiable person. Names and emails obviously, but also cookie identifiers, advertising IDs, and IP addresses, which is why "we only collect anonymous analytics" is usually wrong.

Six ideas do most of the work in a marketing context:

- **You need a lawful basis for every processing activity.** The two that matter to marketers are **consent** and **legitimate interests**. Consent under GDPR must be freely given, specific, informed, and unambiguous — an affirmative action. A pre-ticked box, a bundled "by continuing you agree," or a cookie banner with no real reject option does not meet the standard, and consent must be as easy to withdraw as to give.
- **Purpose limitation.** Data collected for one stated purpose cannot quietly be reused for another. A list collected to deliver a webinar recording is not a general marketing list.
- **Data minimization.** Collect what you need for the stated purpose and no more. Every extra form field is a liability as well as a conversion cost.
- **Individual rights.** People can request access to their data, correction, erasure, portability, and can object to direct marketing. **The objection to direct marketing is absolute** — there is no balancing test.
- **Vendors are your responsibility.** If you send data to an email platform, ad network, or analytics tool, you need a contract governing that processing, and you remain accountable for it.
- **Breaches are reportable**, generally to the supervisory authority within 72 hours of becoming aware, and to affected individuals when the risk to them is high.

Penalties are structured to be material — the upper tier runs to the greater of a substantial fixed ceiling or a percentage of worldwide annual turnover.

### CCPA/CPRA — the California model

California's privacy law, as amended, is built on a different default. Where GDPR asks permission first, California generally lets a business collect and then gives the consumer rights to see and stop it.

- **It applies to businesses meeting thresholds** on revenue, volume of consumers' personal information handled, or share of revenue derived from selling or sharing it. Many small businesses fall outside it — but you must check, and other US states now have comparable laws of their own.
- **Core rights:** to know what is collected and disclosed, to delete, to correct, to opt out of the **sale or sharing** of personal information, and to limit the use of **sensitive** personal information.
- **"Sale" and "sharing" are broader than money changing hands.** Passing identifiers to an ad platform to build a cross-context behavioral advertising audience can qualify, which is exactly why the opt-out link exists.
- **A conspicuous opt-out mechanism** must be provided, and businesses are expected to honor opt-out preference signals a browser sends automatically.
- **Non-discrimination:** you may not degrade service or price because someone exercised a right. Genuine, disclosed loyalty programs are treated separately.
- **Minors** get stronger protection: opt-in consent is required for the sale or sharing of data about consumers under 16, and for under-13s that consent comes from a parent.

### The practical difference

| | GDPR | CCPA/CPRA |
| --- | --- | --- |
| Default | Opt in before processing | Collect, then honor opt out |
| Email marketing | Consent generally required | Opt out plus federal email rules |
| Trigger | Marketing to or monitoring people in the EU/EEA | Business thresholds, California residents |
| Signature control | Consent records and lawful basis | "Do not sell or share" mechanism |

If you operate in both places, the workable engineering answer is usually to build to the stricter standard once rather than maintain two systems — but that is a business decision with real cost, and it belongs to the plan, not to an afterthought.

### And for email specifically

In the US, commercial email is also governed by federal rules that require accurate sender and subject information, a physical postal address, a clear unsubscribe mechanism, and honoring opt-outs promptly. Note that "opt-out honored promptly" is a legal floor, not a good practice — process them immediately.

## Ethical marketing and advertising policy

### Truth and substantiation

The baseline principle of consumer-protection law in most markets: advertising must be truthful, must not be misleading, and **claims must be substantiated before they are made.** You need the evidence in hand at the time you publish, not after a regulator asks.

Applied to the copywriting lesson: "Saves you four hours a week" is an excellent headline *if you have data supporting four hours*. Without it, it is the same sentence and a compliance problem. Health, safety, financial, and earnings claims carry the highest bar.

Practices that reliably cross the line:

- **Deceptive pricing.** A "was $199, now $99" where nothing was ever sold at $199. A "free trial" that silently begins billing.
- **Hidden material terms.** Conditions that change the deal, buried in small print or a linked page.
- **Fake urgency and fake scarcity.** A countdown timer that resets, "only 2 left" generated at random.
- **Manufactured or incentivized reviews** presented as organic, and suppressing negative reviews while displaying positive ones.
- **Undisclosed endorsements.** When someone is paid, gifted, or otherwise materially connected to the brand, that connection must be disclosed clearly and conspicuously — in the post itself, not buried in a hashtag block or behind "more."
- **Ads dressed as editorial.** Sponsored content must be identifiable as advertising.
- **Dark patterns in subscriptions.** Easy to start, deliberately hard to cancel, negative-option renewals without clear consent.

### Platform advertising policies

Ad platforms enforce their own rules, and they are frequently stricter than the law. Common categories:

- **Prohibited content** — illegal products, weapons, certain supplements, deceptive claims, and so on.
- **Restricted categories** — alcohol, gambling, financial services, pharmaceuticals, political advertising: typically allowed only with certification, geographic limits, or age gating.
- **Special ad categories** — housing, employment, and credit, where platforms restrict targeting by age, gender, ZIP code, and related attributes to avoid discriminatory delivery. This is a legal issue wearing a platform-policy uniform, and getting it wrong is serious.
- **Sensitive-attribute targeting** — inferring or targeting on health conditions, sexual orientation, religion, or race is broadly prohibited.
- **Personal-attribute language** — copy that implies you know something private about the reader ("Struggling with your diabetes?") is disallowed on most platforms even when the targeting is legitimate.
- **Data-use rules** for uploaded customer lists, including that you had the right to use the data this way.

Enforcement is not a fine; it is a disabled ad account, often with the campaign live and the deadline near. Read the policy of the platform you are actually buying on, before the creative is built.

## Applying it: three scenarios

**Scenario 1 — The conference badge scan.** A company scans 600 badges at a trade show in Berlin and imports them into its email platform as a marketing list. Attendees consented to the *organizer's* badge scanning to receive event information.

What is wrong: no lawful basis for marketing from this company, consent was for a different purpose (purpose limitation), and the people were never informed of this use. What to do instead: send at most a single permission-seeking message where a lawful basis genuinely supports it, or — safer and more effective — collect an explicit, separate opt-in at the booth stating who will email them and about what, and record it.

**Scenario 2 — The influencer post.** A skincare brand sends free product plus $500 to a creator, who posts a review ending with 22 hashtags including `#sp` in the middle. The caption says the product "eliminates acne in 7 days."

Two problems. The material connection is not clearly and conspicuously disclosed — an ambiguous abbreviation buried in a hashtag pile does not work; it needs a plain statement such as "Paid partnership with [brand]" at the start of the caption. And "eliminates acne in 7 days" is an unsubstantiated health claim likely to breach both consumer-protection law and platform policy. The correction: a plain up-front disclosure, and copy limited to what evidence supports — for example, a subjective experience statement, or a specific claim tied to a study you can produce on request.

**Scenario 3 — The retargeting list.** A US retailer uploads its full customer email list to an ad platform to build a lookalike audience. The privacy policy says data is used "to improve our services." Some customers are California residents; some are in the EU.

Problems: the disclosed purpose does not cover disclosing identifiers to an ad platform, this is very likely "sharing" under California law and requires an opt-out mechanism that is honored, EU customers require a lawful basis that "improve our services" does not establish, and the platform's own data-use terms require that you had the right to upload. The correction: update the notice to describe advertising use specifically, implement and honor the opt-out plus preference signals, exclude EU-based contacts absent a valid basis, and suppress anyone who has objected or opted out before uploading.

### A pre-flight checklist

Run this before any campaign ships:

```text
[ ] Every list has a documented source and consent or lawful basis
[ ] Opt-outs, objections, and deletion requests are suppressed before send
[ ] The privacy notice describes what we are actually doing, in plain words
[ ] Every factual claim has evidence on file today
[ ] Prices, terms, renewals, and cancellation are stated where the offer is
[ ] Paid endorsements are disclosed clearly, up front, in the post
[ ] Targeting avoids sensitive attributes; special categories use the
    restricted setup
[ ] Vendors handling this data are under contract
[ ] We know who to escalate to, and we have escalated anything uncertain
```

The last line is the professional one. Recognizing that a plan touches health data, children, credit, or a jurisdiction you do not know — and stopping to ask before shipping — is the competency. Nobody expects a marketer to be a lawyer; everybody expects a marketer to notice.

## Practice

**Part 1 — Flag and correct.** For each of the following, state (a) which rule area it implicates — privacy, advertising claim, disclosure, or platform policy, (b) specifically what is wrong, and (c) a concrete corrected version. Write the corrected copy or process, not just a description of it.

1. A landing page headline reads "Join 50,000+ happy customers." The company has 3,400 customers and 50,000 newsletter subscribers.
2. A signup form pre-ticks "Yes, send me partner offers" and the partner list is not shown.
3. An apartment-listing company targets its ads by ZIP code and excludes viewers over 50.
4. A software company's "cancel anytime" plan requires a phone call during business hours in one time zone to cancel.
5. A customer emails asking what data a retailer holds on her and asks for it to be deleted; the marketing manager forwards it to the email platform's support desk and takes no other action.
6. A weight-loss ad reads "Struggling to lose the last 20 pounds? Our program works where others failed."

**Part 2 — Fix a plan.** Take the channel plan you wrote in the landscape lesson, or the email sequence from the email lesson, and audit it against the pre-flight checklist. Produce a table with three columns: checklist item, current state in your plan, action required. For at least two items, write the actual corrected asset — the consent line under a form, the disclosure sentence, the revised claim.

**Part 3 — Escalation memo.** A colleague proposes buying a list of 12,000 email addresses of "verified small-business owners" from a broker who will not name the collection source, and sending a promotional sequence to it. Write a short memo to that colleague: the specific risks under each of the three rule areas, what you would need to see before proceeding, and one lawful alternative that achieves the same business goal.
