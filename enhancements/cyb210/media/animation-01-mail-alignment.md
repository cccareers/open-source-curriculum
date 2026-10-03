---
course_id: cyb210
media_id: cyb210-a01
type: animation-storyboard
title: "Two From Addresses: How SPF, DKIM, and DMARC Alignment Decide"
target_runtime: "90 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - cyb210-05
objectives:
  - Configure email authentication and filtering to block spoofed, malicious, and unwanted mail
competency_ids:
  - D5-S1-C04
---

## Concept and misconception it fixes

Misconception: "SPF pass (or DKIM pass) means the sender is who they say they are." The animation shows that a message carries two from-addresses plus a third domain inside the DKIM signature, that SPF and DKIM each check a domain the user never sees, and that DMARC is the only step that ties a pass to the visible header From.

## Visual language

- **Envelope** drawn as an outer sealed envelope labelled "5321.From (envelope)". **Letter** inside it labelled "5322.From (header — what the human sees)". **Wax seal** on the letter labelled "DKIM d=".
- Domains are text badges. Legitimate `harborridge.example` badges use a solid outline; attacker `mailblast-svc.example` badges use a dashed outline, so the distinction survives grayscale.
- Okabe-Ito palette: blue #0072B2 = pass, vermillion #D55E00 = fail, yellow #F0E442 highlights the "alignment bridge", black/gray for neutral. Every pass/fail also shows a ✓ or ✗ glyph and the word.
- Receiving server drawn as a gate with three inspection booths: SPF, DKIM, DMARC.

## Scenes

| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 8 s | An envelope travels from a sending server toward the Harbor Ridge gate. | Envelope slides left→right. | "Every email carries more than one 'from'." |
| 2 | 10 s | Envelope opens; letter rises out. Labels appear on envelope (`bounce.mailblast-svc.example`), letter (`ap@harborridge.example`), and seal (`d=mailblast-svc.example`). | Labels type on one at a time. | "The envelope sender servers use. The header From you see. And the signing domain inside the DKIM seal. Three domains. They don't have to match." |
| 3 | 12 s | SPF booth: the envelope domain badge is checked against a DNS scroll listing `mailblast-svc` IPs. Sending IP `203.0.113.77` matches. | Scroll unrolls; matching line highlights; ✓ PASS stamp (blue). | "SPF checks the envelope domain's allowed senders. The attacker's mailer is allowed to send for the attacker's domain. Pass." |
| 4 | 12 s | DKIM booth: seal is verified with a public key fetched from `k1._domainkey.mailblast-svc.example`. | Key icon flies from DNS to seal; seal glows; ✓ PASS. | "DKIM verifies the signature for the domain in d=. Also the attacker's. Also pass." |
| 5 | 15 s | DMARC booth: the header From badge `harborridge.example` is placed on a balance. The two passing domains try to "bridge" to it with a yellow alignment bridge. Bridges fail to connect (gap with ✗). | Bridges extend, stop short, crack. ✗ FAIL (vermillion). | "DMARC asks: does either pass belong to the domain the human sees? Neither aligns with harborridge.example. Fail." |
| 6 | 10 s | Policy sign from `_dmarc.harborridge.example`: `p=reject`. Gate drops; message bounces back. | Gate slams; envelope reverses. | "Harbor Ridge published p=reject, so a receiver honouring it refuses the message." |
| 7 | 15 s | Contrast replay: a forwarded legitimate message. SPF booth ✗ (forwarder IP). DKIM booth ✓ with `d=harborridge.example`. Alignment bridge connects to header From ✓. DMARC ✓. | Faster replay of 3–5 with different outcomes. | "Now a legitimate forwarded message. SPF fails because the forwarder's IP isn't listed. DKIM passes for harborridge.example — which aligns. DMARC passes. One aligned pass is enough." |
| 8 | 8 s | Summary card: "SPF ✓ ≠ trust · DKIM ✓ ≠ trust · DMARC ✓ = visible From domain authenticated and aligned (not the person, not the intent)". | Cards stack. | "A pass only means something when it aligns with the From you can see." |

## Interaction variant

Step-through H5P "Course Presentation" or a scrubbable web player: the learner sets three dropdowns (envelope domain, DKIM `d=`, header From) and a policy (`none` / `quarantine` / `reject`), then presses "Deliver" to see each booth's verdict and the final disposition. Include a preset for display-name impersonation (`"Dr. Elena Ortiz" <eortiz.md@freemail.example>`) where everything passes, to show where authentication stops and impersonation detection begins.

## Production notes

- Keep all domains on reserved `.example` names and documentation IP ranges (192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24).
- Reuse the envelope/letter/seal assets for the course asset `mail-authentication-flow.png` so the static diagram and animation match.
- Relaxed vs. strict alignment is deliberately omitted; add a 10-second optional tag scene if the instructor wants to cover `adkim=s`.
