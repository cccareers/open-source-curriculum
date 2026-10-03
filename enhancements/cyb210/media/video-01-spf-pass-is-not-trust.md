---
course_id: cyb210
media_id: cyb210-v01
type: video-script
title: "SPF Passed, So It's Safe? Reading Authentication-Results Like an Analyst"
format: screencast
target_runtime: "7 min"
related_lessons:
  - cyb210-05
objectives:
  - Configure email authentication and filtering to block spoofed, malicious, and unwanted mail
competency_ids:
  - D5-S1-C04
  - D5-S1-C02
---

## Purpose

After watching, the learner can read an `Authentication-Results` header, say which "from" address each of SPF, DKIM, and DMARC actually checked, and explain why an SPF or DKIM pass on its own is not a trust signal.

## Audience and prerequisites

Cybersecurity support technician apprentices midway through lesson 05. They have read the SMTP envelope vs. header From section. No mail-server administration experience assumed.

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Cold open: an inbox row, sender "Accounts Payable", subject "URGENT: updated bank details for today's run". A green "SPF: PASS" badge is overlaid. | "This message passed SPF. It also passed DKIM. And it is a fraud attempt against your own finance team. In the next seven minutes you'll learn to see why in about thirty seconds." |
| 0:20 | Title card: "Two From addresses". Split screen: left "Envelope (RFC 5321) — servers see it", right "Header (RFC 5322) — humans see it". | "Every message carries two from-addresses. The envelope sender, MAIL FROM, is what servers use for delivery and bounces. The header From is what your mail client displays. Nothing in SMTP forces them to match. That gap is the whole spoofing problem." |
| 0:50 | Screencast: a terminal showing the SMTP transcript from lesson 05, with `MAIL FROM:<bounces@sender-domain.example>` and `From: "Accounts Payable" <ap@yourcompany.example>` highlighted in two different outline styles (solid box vs. dashed box). | "Here's the conversation. MAIL FROM says bounces at sender-domain. The From header, further down inside DATA, says accounts payable at your company. Same message, two different claims." |
| 1:20 | Diagram: three labelled arrows. SPF → envelope domain. DKIM → `d=` domain. DMARC → header From, with a bridge labelled "alignment". | "Three records, three different things checked. SPF asks: is this sending IP allowed to use the envelope sender's domain? DKIM asks: does the signature verify for the domain in its own d-equals tag? And DMARC asks the only question a human cares about: does either of those passes line up with the domain I actually see?" |
| 2:00 | Screencast: open the raw source of the message (in a webmail "Show original" view or a text editor). Scroll to `Authentication-Results`. | "Let's read the real header. In most clients this is 'Show original' or 'View source'. Find the Authentication-Results line your own server added. Ignore any Authentication-Results lines from servers you don't control — anyone can write that header." |
| 2:25 | Header on screen, lines appearing one at a time: `spf=pass (sender IP is 203.0.113.77) smtp.mailfrom=bounce.mailblast-svc[.]example` | "SPF: pass. But look at smtp.mailfrom. The domain that passed is bounce dot mailblast-svc — the attacker's bulk mailer. SPF just told us the attacker's mailer is allowed to send for the attacker's domain. True, and useless." |
| 2:55 | Next line: `dkim=pass header.d=mailblast-svc[.]example header.s=k1` | "DKIM: pass, with d equals mailblast-svc. The message was signed by the attacker's key for the attacker's domain. Again: authentic, for the wrong domain." |
| 3:20 | Next line: `dmarc=fail (p=reject sp=reject dis=quarantine) header.from=example[.]org`. The header.from value pulses. | "And DMARC fails. Header From is example dot org — our domain. Neither the SPF domain nor the DKIM domain aligns with it. This is the one result that speaks to the address the clerk saw." |
| 3:50 | Zoom on `dis=quarantine` next to `p=reject`. A caution icon with the text "Policy not honoured". | "One more detail most people skip. Our domain publishes p equals reject. The disposition says quarantine. That means our own inbound configuration overrode our own policy — usually an allow-list or a mailing-list exception. That's a configuration finding. Write it down and fix it today." |
| 4:20 | Back to the full header. Highlight `Reply-To: <ap.finance.dept@mail-secure-portal[.]example>`. | "Now the human signals. Reply-To points somewhere else entirely, so a reply goes straight to the attacker. Add a payment-change subject and urgency, and this is textbook business email compromise." |
| 4:50 | Checklist card builds: 1. Find *your* server's Authentication-Results. 2. For each pass, ask "pass for which domain?" 3. Compare to header.from. 4. Check disposition vs. policy. 5. Check Reply-To and Return-Path. | "Here's the habit. Find your own server's results. For every pass, ask: pass for which domain? Compare that domain to header From. Check the disposition against the published policy. Then look at Reply-To and Return-Path." |
| 5:30 | Counter-example on screen: forwarded message, `spf=fail`, `dkim=pass header.d=harborridge.example`, `dmarc=pass`. | "Quick contrast. Here SPF fails — because a university forwarded the message from its own IP. But DKIM passes for harborridge dot example, which matches header From, so DMARC passes. This is legitimate mail, and it's exactly why you never reject on SPF alone." |
| 6:10 | Summary card: "SPF pass ≠ trust. DKIM pass ≠ trust. DMARC alignment = the visible From is proven." | "So: SPF pass is not trust. DKIM pass is not trust. DMARC pass means the address the human saw was proven by one of them. And when all three pass for a lookalike or freemail domain, that's a job for impersonation detection and the external-sender banner — not for authentication." |
| 6:45 | End card: "Next: Practice Part 3 — read the aggregate report." | "Pause here and do Practice Part 3. You'll see these same patterns, summarised across thousands of messages." |

## On-screen assets and B-roll

- SMTP transcript and header from lesson 05 (all domains defanged as shown; the reserved `.example` domains are safe).
- Diagram asset `mail-authentication-flow.png` from course.json assets, or a re-drawn version matching the animation `cyb210-a01`.
- A sandbox webmail account in a test tenant for the "Show original" capture; blur the tenant name.

## Accessibility

- Burned-in captions plus a separate caption file; narration reads every highlighted value aloud, so nothing is conveyed by highlight alone.
- Pass/fail states use text labels and icons (check/cross) in addition to color; recommended palette is Okabe-Ito blue (#0072B2) for pass and vermillion (#D55E00) for fail.
- Terminal font at least 20 pt at 1080p; zoom transitions held for 2 seconds minimum.
- A text transcript with the header lines as copyable (defanged) text.

## Check for understanding

1. A message shows `spf=pass smtp.mailfrom=harborridge.example`, `dkim=none`, `dmarc=pass header.from=harborridge.example`. Which mechanism produced the DMARC pass? *Answer: SPF, because the envelope domain aligns with the header From domain.*
2. Why can't a valid DKIM signature for `newsletter-tool.example` make DMARC pass for `harborridge.example`? *Answer: the `d=` domain does not align with the header From domain; DMARC requires alignment.*
3. You see `p=reject` and `dis=none` on a failing message. What do you investigate? *Answer: a local override (allow-list, transport rule, or mailing-list exception) on your own inbound gateway that is not honouring the published policy.*
