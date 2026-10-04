---
course_id: cyb250
media_id: cyb250-a01
type: animation-storyboard
title: "Anatomy of a Supplier Bank-Detail Change: Where the Process Could Have Stopped It"
target_runtime: "100 sec"
suggested_tool: "After Effects"
related_lessons:
  - cyb250-03
  - cyb250-02
objectives:
  - Analyze a suspicious message, decide what to do with it, and route it to the right people
  - Explain the psychological levers social engineers use and recognize them in a described interaction
competency_ids:
  - D5-S1-C02
  - D5-S1-C04
---

## Concept and misconception it fixes

Misconception: "BEC is a phishing email the filter should have caught." The animation follows a vendor-invoice fraud over two weeks — supplier mailbox compromised, attacker watches the thread, injects a bank change, payment leaves — and shows that every technical check passes because nothing is forged. It then rewinds and shows the three process controls (out-of-band callback to the number in the vendor record, dual authorization, a fast report) that each independently stop it, and how the recall window closes in hours.

## Visual language

- Horizontal timeline in days (Day 1 → Day 14) with a clock inset for the final hours.
- Three swimlanes: **Supplier** (top), **Attacker** (middle, dashed outlines), **Your finance team** (bottom).
- Messages are envelope icons; the attacker's injected message carries a small dashed-edge marker (visible in grayscale).
- Okabe-Ito: blue #0072B2 for legitimate actors, orange #E69F00 for attacker actions, bluish green #009E73 for control checkpoints, vermillion #D55E00 for money leaving. Each also has a text label.
- Money shown as a single £ token moving down a pipe to "Bank" and then "Mule account".

## Scenes

| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 10 s | Day 1. Supplier lane: a sign-in page; attacker lane: a key icon taken. | Key slides from supplier to attacker lane. | "Day one. A supplier's mailbox is compromised — not yours. Theirs." |
| 2 | 12 s | Days 2–9. Attacker lane: an eye icon over a real invoice thread passing between supplier and finance. A hidden mailbox rule icon "filter replies → archive". | Thread envelopes pass back and forth; eye blinks. | "For a week, the attacker just reads. They learn the invoice cycle, the people, the tone. They add a rule so replies get hidden." |
| 3 | 12 s | Day 10. Attacker sends from the **real** supplier address, inside the **real** thread: "Re: May invoices — our bank has changed, new remittance form attached." Lever tags: "Authority", "Urgency: before payment run", "Consistency: same thread". | Injected envelope (dashed marker) slides into the thread. | "Day ten. A message, in the real thread, from the real address: our bank details have changed." |
| 4 | 10 s | Gate icon "Mail checks": SPF ✓, DKIM ✓, DMARC ✓, label "Nothing forged." | Three ticks stamp in. | "Every check passes, because nothing was forged. It really did come from the supplier's mailbox." |
| 5 | 10 s | Day 12. Finance clerk updates vendor record. Day 13, 16:00: payment run; £ token travels to "New bank account". | Token slides; clock inset ticks. | "The record is updated. The payment run goes." |
| 6 | 10 s | Day 14. Genuine supplier emails: "We haven't been paid." Clock inset shows hours since payment; recall window bar shrinking. | Bar drains. | "Then the real supplier chases payment. The recall window is measured in hours, and it has mostly gone." |
| 7 | 6 s | Rewind effect to Day 10. Caption: "Three places it stops." | Fast rewind. | "Rewind. Three places this stops." |
| 8 | 10 s | Checkpoint 1 (green): clerk phones the supplier on the number **in the vendor record**. Supplier: "We haven't changed banks." Injected envelope shatters. | Phone icon from record (not from the email). | "One: call back on the number you already had — not the one in the email or the new form." |
| 9 | 8 s | Checkpoint 2: dual-authorization gate before vendor bank changes go live. | Gate closes. | "Two: a second person must approve any bank change." |
| 10 | 8 s | Checkpoint 3: clerk presses "Report" on Day 10; security sees the hidden mailbox-rule pattern, contacts supplier; route arrow to "Finance leadership + bank + IR, in parallel". | Report pulse travels to security lane. | "Three: a fast report — and, if money has moved, finance and the bank in parallel, immediately." |
| 11 | 4 s | Summary: "No malware. No link. Process is the control." | Fade. | "No malware, no link. Process is the control." |

## Interaction variant

Step-through decision version: at Day 10, the learner chooses (a) pay as requested, (b) reply to the email to confirm, (c) call the number on the new form, (d) call the number in the vendor record. Only (d) succeeds; (b) and (c) show the attacker "confirming" happily. After the payment scene, the learner chooses whom to route to and in what order, with feedback from lesson 03's routing table.

## Production notes

- All names fictional; avoid real bank logos. Use "£" to match the Ardleigh and Merrow Fields UK-style scenarios, or swap currency per locale.
- Do not show realistic lure text beyond the one-line paraphrase in scene 3.
- Keep the attacker visually neutral (an icon, not a hooded figure) — the course avoids fear as a motivator.
