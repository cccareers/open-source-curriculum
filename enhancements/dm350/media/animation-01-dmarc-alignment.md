---
course_id: dm350
media_id: dm350-a01
type: animation-storyboard
title: "SPF, DKIM, and the Domain the Reader Sees"
target_runtime: "90 sec"
suggested_tool: "After Effects"
related_lessons:
  - dm350-07
objectives:
  - Diagnose email deliverability and performance problems and fix them
competency_ids:
  - D5-S1-C03
---

## Concept and misconception it fixes
Misconception: "we have SPF and DKIM, so we are authenticated." Lesson 07 explains that SPF checks the envelope sender's servers, DKIM checks a signature from some domain, and neither by itself says anything about the `From:` address a human reads. DMARC adds **alignment** (a passing SPF or DKIM result must be for the visible From domain) and a **policy**. The animation shows one envelope passing SPF and DKIM for the email platform's domain yet failing DMARC for Northlight, then the fix (custom DKIM signing for northlightbooks.com) making it pass.

## Visual language (shapes, colors with color-blind-safe palette, labels)
- An envelope drawn in three layers: outer "Envelope sender (return path)", a wax seal "DKIM signature d=...", and the letter's header "From: marisol@northlightbooks.com".
- A receiving mail server drawn as a gatehouse with three inspection windows labelled SPF, DKIM, DMARC.
- Results shown as stamped words "PASS" / "FAIL" with a check or cross glyph, plus colour: blue (#0072B2) for pass, orange (#E69F00) for fail. Never colour alone.
- DNS shown as a filing cabinet labelled "DNS (published records)".

## Scenes
| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 0-8s | The envelope travels from "Northlight's email platform" toward the gatehouse. The visible From header is enlarged: `marisol@northlightbooks.com`. | Envelope slides right. | "Every marketing email carries more than one domain. The reader sees only one of them." |
| 2 | 8-20s | SPF window: inspector reads the envelope sender `bounce.example-esp.net`, opens the DNS cabinet drawer for that domain, finds the server listed. Stamp: PASS (for example-esp.net). | Drawer opens; stamp lands. | "SPF asks: is this server allowed to send for the envelope sender's domain? Here, that is the email platform's bounce domain. Pass." |
| 3 | 20-32s | DKIM window: inspector examines the seal `d=example-esp.net`, fetches the public key from DNS, verifies. Stamp: PASS (for example-esp.net). | Key icon travels from cabinet to seal; seal glows briefly. | "DKIM asks: was this signed by a domain's private key, and unchanged in transit? Yes, signed by the platform's domain. Pass." |
| 4 | 32-46s | DMARC window: inspector holds up the From header `northlightbooks.com` beside the two passing domains `example-esp.net`. A "≠" glyph appears between them. Stamp: FAIL (not aligned). | Domains slide side by side; mismatch glyph pulses once. | "DMARC asks the question that matters: did SPF or DKIM pass for the domain the reader actually sees? Neither did. Not aligned. Fail." |
| 5 | 46-56s | DMARC record shown from the cabinet: `p=none`. Envelope continues to inbox but a report envelope flies to `dmarc@northlightbooks.com`. Caption tag: "policy: none = report only". | Report envelope arcs away. | "With policy none, the receiver delivers it anyway but sends Northlight a report. That is the point of starting at none: you find out what is sending as you before you break it." |
| 6 | 56-72s | Fix: in the email platform, "Custom DKIM: northlightbooks.com" toggles on; a new record `esp1._domainkey.northlightbooks.com` is filed in the cabinet. The seal now reads `d=northlightbooks.com`. Replay DMARC window: domains match "=". Stamp: PASS (aligned via DKIM). | Seal re-stamps; "=" glyph replaces "≠". | "The fix is to have the platform sign with Northlight's own domain. Publish its public key under Northlight's DNS. Now DKIM passes for the same domain the reader sees, and DMARC passes." |
| 7 | 72-84s | Policy ladder graphic: none → quarantine → reject, with "read reports, fix every legitimate sender" between steps. | Ladder rungs light in sequence with text. | "Then climb slowly: none while you read the reports, quarantine, then reject, once every legitimate sender, including the invoicing system, is aligned." |
| 8 | 84-90s | Closing card: "Authentication proves who you are. It does not prove you are worth reading." | Hold. | "And remember the lesson's first rule: authentication is table stakes. Relevance is what earns the inbox." |

## Interaction variant (optional)
A step-through where learners set three toggles (SPF include present, DKIM signing domain, DMARC policy) and predict the result for five sample messages, including a forwarded message (SPF breaks, DKIM survives). Feedback explains each outcome in text.

## Production notes
- Use `example-esp.net` as the placeholder platform domain (matches lesson 07's SPF example). Do not depict a real vendor.
- Simplification to disclose in a footnote card: DMARC alignment can be relaxed (organisational domain match) or strict; this animation uses relaxed alignment, which the lesson's sample record (`adkim=r; aspf=r`) specifies.
- Mailbox-provider requirements for bulk senders change; do not put specific provider thresholds on screen.
- Captions burned in; stamps hold for at least 1.5 seconds for readability.
