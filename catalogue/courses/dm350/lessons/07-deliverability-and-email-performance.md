---
lesson_id: dm350-07
course_id: dm350
pathway: digital-marketer
title: Deliverability and Email Performance
order: 7
kind: lesson
competency_ids:
  - D5-S1-C03
objectives:
  - Diagnose email deliverability and performance problems and fix them
  - Read open, click, bounce, and unsubscribe metrics correctly
---

## What Happens Between Send and Inbox

You press send. Between that moment and a human reading the email there are three decisions you do not make.

Your **email service provider** hands the message to its sending servers, which connect to the recipient's **mailbox provider** — Google, Microsoft, Yahoo, a corporate mail gateway. That provider decides three things in sequence.

**Accept or reject.** Does this message get taken at all? A rejection here is a **bounce**, and the reason arrives as a status code you can read.

**Inbox or spam.** Having accepted it, where does it go? This is **placement**, and here is the uncomfortable part: your reporting cannot see it. Your platform tells you the message was *delivered*, and delivered means only "not bounced." A message sitting in a spam folder is counted as delivered. Every deliverability problem you will ever have lives in this gap.

**Prominence.** Within the inbox, which tab or category, how far down. Providers sort mail, and promotional sorting is not a failure — but it is a fact you should know about your own sends.

All three decisions turn mostly on **reputation**: the mailbox provider's accumulated opinion of the domain and the IP addresses you send from. Reputation is built from how recipients react to your mail. Do they open it, reply to it, move it out of spam, add you to their contacts? Or do they ignore it, delete it unread, and press the spam button?

This is the single most important idea in the lesson, so it deserves stating flatly: **deliverability is downstream of relevance.** Every technical control below is necessary, and none of them will save mail that people do not want. Authentication proves you are who you say you are. It does not prove you are worth reading.

## The Metrics, With Their Denominators

Half of all email reporting arguments are people quoting the same word with different denominators. Fix that first.

```txt
  Sent                number of addresses the send was attempted to
  Bounces             sent that were not accepted
    hard bounce       permanent: address does not exist, domain does not exist
    soft bounce       temporary: mailbox full, server busy, message too large
  Delivered           sent - bounces            (NOT "reached the inbox")
  Delivery rate       delivered / sent
  Opens               tracked image loads       (see the caveat below)
  Open rate           unique opens / DELIVERED
  Clicks              unique recipients who clicked any tracked link
  Click rate (CTR)    unique clicks / DELIVERED
  Click-to-open (CTOR) unique clicks / unique opens
  Unsubscribe rate    unsubscribes / DELIVERED
  Complaint rate      spam complaints / DELIVERED
  Conversion          the action from the campaign brief / DELIVERED
```

Two of those repay attention.

**Click-to-open** separates two different questions. Click rate over delivered mixes "did the subject earn an open?" with "did the content earn a click?" CTOR isolates the second. A campaign with a poor click rate and an excellent CTOR has a subject line problem. The same campaign with a good open rate and a dismal CTOR has a content or offer problem. You cannot tell these apart from click rate alone.

**Conversion is the only metric in that list that is definitionally about the business.** Lesson 04's brief said twenty fit calls. Every other number here is a means.

## Open Rate Is Not What It Used to Be

An open is recorded when a tiny invisible image in the email is requested from your platform's server. That mechanism has been quietly broken for years.

Apple's Mail Privacy Protection, and similar features elsewhere, pre-fetch images for messages *whether or not the recipient ever looks at them*. Corporate security scanners do the same, clicking links as well to check them for malware. The result is that a meaningful and unknowable share of your recorded opens are machines, and a share of your recorded clicks are too.

Three practical consequences:

**Never automate on opens.** A workflow branch that says "if opened, send X; if not opened, send Y" is now branching partly on which mail client the recipient uses. Lesson 06's day-6 branch was written on "opened or clicked" for exactly this reason — the click carries the signal.

**Use open rate as a trend, not a level.** "Our open rate is 34 percent" means very little. "Our open rate fell from 34 to 19 percent over three sends" means a great deal, because whatever inflation exists is roughly constant across your own sends.

**When you need a real engagement signal, use clicks, replies, and conversions.** They are smaller numbers and they are honest ones.

## Reading a Bad Send

Northlight's October newsletter went badly. Here is the report, with the arithmetic done rather than assumed.

```txt
NORTHLIGHT - October newsletter

  Sent                       7,450
  Hard bounces                 447    447 / 7,450   =  6.00%   ALARM
  Soft bounces                 149    149 / 7,450   =  2.00%   high
  Delivered                  6,854  6,854 / 7,450   = 92.00%   poor
  Unique opens               1,096  1,096 / 6,854   = 15.99%   was 31%
  Unique clicks                 82     82 / 6,854   =  1.20%   was 2.4%
  Click-to-open                 82     82 / 1,096   =  7.48%   roughly normal
  Unsubscribes                  41     41 / 6,854   =  0.60%   was 0.28%
  Spam complaints               24     24 / 6,854   =  0.35%   ALARM

  Same list, September:  sent 5,900, bounce 3.0%, open 31%, complaints 0.09%
```

Now read it like a practitioner. Three facts organize everything.

**The list grew by 1,550 between September and October.** Nobody adds 1,550 contacts to a 5,900-person list organically in a month. Something was imported.

**Hard bounces tripled, to 6 percent.** Hard bounces mean addresses that do not exist. Six percent of a list being fictional is the signature of old, purchased, or scraped data — precisely the uncleaned conference spreadsheet from lesson 02.

**Complaint rate quadrupled, to 0.35 percent.** People press the spam button when they do not recognize the sender. The 1,550 new contacts never opted in to anything.

**And CTOR barely moved.** This is the most useful number in the table, and it is the one people skip. The people who *did* open behaved almost exactly as they did in September. The content was fine. The list was the problem. Without CTOR you might spend a week rewriting copy that was never broken.

The diagnosis writes itself: an uncleaned, unconsented import poisoned a healthy list. The fix is not a better subject line.

```txt
RECOVERY PLAN - October newsletter

  IMMEDIATE  suppress every contact from the October import batch
             (original_source = event, created in October) - 1,550 records
             suppress all 447 hard bounces permanently
             pause all marketing sends for 7 days

  WEEK 1     verify SPF, DKIM and DMARC on the sending domain
             check whether the sending domain or IP appears on any public
             blocklist, and follow each list's own delisting process
             enrol in the mailbox providers' free postmaster tools and
             watch reported complaint rate directly

  WEEK 2-4   resume sending to the ENGAGED tier only (1,180 contacts,
             lesson 05), one email per week, best content, no promotions
             target: bounce under 1%, complaints under 0.05%

  MONTH 2    widen to ACTIVE (a further 1,650) if the targets hold
             run a re-permission campaign to the imported batch: one email,
             explicit opt-in required, no response means permanent suppression

  NEVER      re-import that file without the cleaning from lesson 02
```

That plan costs Northlight a month of marketing email. Recovering a damaged sending reputation always costs more than protecting it did.

## The Thresholds That Matter

Numbers worth committing to memory. Treat them as working thresholds rather than published constants, because mailbox providers set their own and change them.

```txt
  Hard bounce rate      under 2%      over 2% is a list-quality problem
                                      over 5% risks being blocked outright
  Total bounce rate     under 3%
  Spam complaint rate   under 0.10%   this is the working target
                                      0.30% is where major providers act
  Unsubscribe rate      under 0.50%   over 1% means wrong list or wrong content
  Delivery rate         above 98%
  Engagement            no send to anyone with zero engagement in 180 days
```

The complaint threshold deserves emphasis because the numbers are so small that they do not feel real. Three tenths of one percent is three complaints per thousand delivered. On Northlight's October send, twenty-four people out of nearly seven thousand pressed a button, and that was enough to put the entire sending domain at risk. There is no other marketing channel where 0.35 percent of an audience can shut the channel down.

Two corollaries. **Make unsubscribing easy**, because every unsubscribe is a complaint that did not happen, and the exchange rate is enormously in your favour — the unsubscribe costs you one contact, the complaint costs you a fraction of everyone's deliverability. And **suppress hard bounces immediately and permanently**; sending twice to an address that does not exist is the clearest possible signal that you are not maintaining a list.

## Authentication: SPF, DKIM, DMARC

Three DNS records. They do genuinely different jobs and it is worth knowing which is which, because when a deliverability problem lands on your desk, "we have all three" is the first question and "what does DMARC actually check?" is the second.

**SPF — Sender Policy Framework — says which servers are allowed to send for your domain.** You publish a TXT record listing them. When mail arrives, the receiver looks at the domain in the message's envelope sender (the return path, not necessarily what the recipient sees) and asks whether the connecting server is on that domain's list.

```txt
  northlightbooks.com   TXT   "v=spf1 include:_spf.google.com
                               include:servers.example-esp.net ~all"
```

Two things to know about SPF. It authorizes *servers*, not content — it says nothing about whether the message was altered. And it has a hard limit of ten DNS lookups during evaluation; each `include:` costs at least one, so a company that adds every vendor over five years eventually exceeds the limit and SPF silently fails for everything. Audit the record when you add a tool.

**DKIM — DomainKeys Identified Mail — proves the message really came from your domain and was not altered on the way.** Your sending platform signs selected headers and the body with a private key and attaches the signature to the message. You publish the matching public key in DNS under a selector. The receiver fetches the key, verifies the signature, and now knows two things: a holder of your domain's private key authorized this message, and nobody changed it in transit.

```txt
  esp1._domainkey.northlightbooks.com   TXT   "v=DKIM1; k=rsa; p=MIGfMA0GCS..."
```

DKIM survives forwarding in a way SPF does not, which is one reason it carries more weight.

**DMARC — Domain-based Message Authentication, Reporting and Conformance — ties the other two to the address the human actually sees, and tells receivers what to do when they fail.** This is the piece people misunderstand. SPF and DKIM can both pass for a domain that has nothing to do with the `From:` address the recipient reads. DMARC adds **alignment**: it requires that a passing SPF or DKIM result be for a domain that matches the visible `From:` domain. Then it publishes a **policy** — what the receiver should do when alignment fails — and requests **reports** so you can see who is sending as you.

```txt
  _dmarc.northlightbooks.com   TXT   "v=DMARC1; p=none;
                                      rua=mailto:dmarc@northlightbooks.com;
                                      pct=100; adkim=r; aspf=r"
```

The policy values are the decision:

- `p=none` — do nothing, just send me reports. Where you start, so you can find out what is legitimately sending as you before you break it.
- `p=quarantine` — treat failures as suspicious; typically the spam folder.
- `p=reject` — refuse failures outright.

The intended path is `none` for long enough to read the reports and fix every legitimate sender, then `quarantine`, then `reject`. Moving straight to `reject` is how a company discovers, loudly, that its invoicing system was sending from the marketing domain.

For marketing, three practical notes. Major mailbox providers now expect bulk senders to have all three in place, along with one-click unsubscribe support and prompt honouring of opt-outs; these requirements have tightened repeatedly, so check the current guidance from the providers your list actually uses rather than relying on what a course said. Authentication is table stakes, not an advantage: having it right prevents a problem, it does not create a lift. And it is usually not marketing's job to publish these records — it is marketing's job to know they exist, to ask, and to be able to read the answer.

## Sending Identity

**Send from a domain you control**, with a real reply-to address that someone reads. Never send marketing from a free consumer mail provider; DMARC policies at those providers will cause your mail to fail alignment at scale.

**Consider a subdomain for marketing mail** — `mail.northlightbooks.com` or `news.northlightbooks.com`. Reputation attaches substantially to the sending domain, so a subdomain gives marketing sends their own reputation and insulates the invoices and password resets going out from the root domain from whatever marketing does. The cost is that a new subdomain starts with no reputation at all.

**Which means warmup.** A brand-new sending domain or IP has no history, and a sudden 6,000-message send from an unknown source looks exactly like a spam run. Warm up over two to four weeks: start with a few hundred of your most engaged contacts, increase volume gradually, and watch bounce and complaint rates at each step. If they rise, hold the volume rather than pushing through.

**Separate transactional from marketing.** Lesson 04 drew this line for content reasons; here is the operational reason. Password resets and booking confirmations must arrive. If they share a sending reputation with a marketing programme that has a bad month, they will not. Different subdomain, and often a different service entirely.

## List Hygiene and the Cost of Dead Weight

Everything above is preparation. Hygiene is the ongoing work, and it is the part with the largest effect.

**Never buy or rent a list.** The addresses did not consent, they will complain, and purchased lists reliably contain **spam traps** — addresses that exist solely to catch senders who did not collect consent. Hitting one can get a domain blocklisted with no appeal and no warning.

**Use double opt-in where it is affordable.** The subscriber confirms by clicking a link in a confirmation email. It costs you perhaps 20 to 30 percent of raw signups and it eliminates typos, fake addresses, and most malicious signups in one step. For a list like Northlight's, where every contact is a potential $6,435 client, that trade is obviously correct.

**Sunset the dormant.** Lesson 05's engagement ladder is a deliverability control as much as a relevance one. Northlight's 1,650 dormant contacts are 28 percent of every send producing no opens, no clicks, and a rising share of the complaints. Suppressing them raises every rate in the report and, more importantly, raises the share of your mail that mailbox providers see being engaged with — which is the input to the placement decision at the top of this lesson.

**Validate at the point of entry.** Syntax checking on every form, and a verification service before any bulk import. Fixing an address before it is stored costs nothing; a hard bounce costs reputation.

**Watch the postmaster tools.** The major mailbox providers publish free dashboards showing your domain's reputation and reported complaint rate as *they* see it. That is closer to the truth than anything your sending platform can tell you.

## Diagnosing: A Triage Path

When something looks wrong, work down this list. It is ordered by how often the answer is found there.

```txt
  1  Did delivery change?      bounce rate up  ->  LIST PROBLEM
                               look at what was added since the last good send

  2  Did complaints change?    complaints up   ->  CONSENT OR RELEVANCE PROBLEM
                               who are these people and what did they expect?

  3  Did opens fall while CTOR held?
                               ->  PLACEMENT or SUBJECT problem
                               check authentication, blocklists, seed tests

  4  Did opens hold while CTOR fell?
                               ->  CONTENT OR OFFER PROBLEM
                               the email is being seen and is not persuading

  5  Did clicks hold while conversions fell?
                               ->  LANDING PAGE PROBLEM
                               not an email problem at all

  6  Is it one mailbox provider only?
                               ->  break every rate down by recipient domain.
                               A collapse at one provider and normal results
                               elsewhere is nearly always authentication,
                               reputation, or a block at that provider.

  7  Only then, rewrite the copy.
```

Step 6 is the trick worth stealing. Split every metric by recipient domain — one column for each major provider, one for everything else. Problems that look mysterious in the aggregate are usually obvious the moment you see that one provider's open rate went to four percent while everyone else held steady.

And run **seed tests**: send every campaign to a small set of your own accounts across the providers your list actually uses, and open all of them. It is the only direct look you get at placement.

## Turning Metrics Into Changes

The triage path tells you where the problem is. This tells you what to do about it.

**Bounce rate high** → clean the list, suppress bounces permanently, validate at entry, stop importing spreadsheets.

**Complaint rate high** → check consent, make the unsubscribe more visible, reduce frequency, state in the footer why they are receiving this, and segment harder. Complaints are almost always a relevance signal wearing technical clothing.

**Unsubscribe rate high but complaints low** → this is not a crisis. People are leaving politely because the content is not for them. Fix targeting or frequency; be glad they used the door.

**Open rate falling over several sends** → subject lines, sender name consistency, send timing, or placement. Check placement first; it is the expensive one.

**CTOR low** → the offer or the call to action. Read lesson 04's anatomy again: one primary action, stated as what the reader gets.

**Everything healthy, conversions low** → the email did its job. The problem is the page it points at, and the conversion work from lesson 03 is where it gets solved.

Keep one running record — a simple table, one row per send, with sent, bounce, delivered, open, click, CTOR, unsubscribe, complaint, and conversion. Twelve months of that table is worth more than any single report, because deliverability problems announce themselves as trends long before they announce themselves as disasters.

## Practice

1. **Do the arithmetic.** Here is Northlight's next send: sent 4,120; hard bounces 33; soft bounces 21; unique opens 1,268; unique clicks 119; unsubscribes 14; complaints 3. Calculate delivered, delivery rate, hard bounce rate, open rate, click rate, click-to-open, unsubscribe rate, and complaint rate. Compare each against the thresholds in this lesson and write a one-line verdict per metric.

2. **Diagnose a send you have not seen before.** A campaign shows a 2.9 percent open rate at one mailbox provider and 31 percent everywhere else, with normal bounce and complaint rates. Work through the triage path and write, in order, the first four things you would check and what each result would tell you.

3. **Explain the three records.** In your own words, and without looking back, write one sentence each for SPF, DKIM, and DMARC saying what it proves or decides. Then write the sentence you would say to a developer to request that a DMARC record be added at `p=none`, and the one sentence explaining why you would not ask for `p=reject` on day one.

4. **Write the recovery plan.** Assume you have inherited a list of 12,000 contacts with a 7 percent hard bounce rate, a 0.4 percent complaint rate, and no documented consent. Write a four-phase recovery plan in the format used above, with the volume you would send in each phase and the threshold that has to hold before you widen.

5. **Build the tracking sheet.** Create the one-row-per-send table described at the end of this lesson, with columns and formulas, and populate it with the two Northlight sends in this lesson plus the one from exercise 1. Then write the sentence you would put at the top of it telling a future colleague which column to look at first.
