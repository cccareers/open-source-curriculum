---
course_id: cyb140
media_id: cyb140-v01
type: video-script
title: "Redline a Scope: Can I Send This Packet?"
format: screencast
target_runtime: "6 min"
related_lessons:
  - cyb140-02
objectives:
  - Read and write the authorization and scope documents that make a security test lawful and bounded
competency_ids:
  - D3-S1-C04
---

## Purpose
After watching, the learner can mark up a defective scope, rewrite it so every packet gets an unambiguous yes or no, and say what an assistant does when a target falls outside it.

## Audience and prerequisites
cyb140-02 through "Anatomy of a scope". No tools needed.

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Black screen with white text: "An authorized scan and an unauthorized scan send identical packets." | "Here's the strangest fact in this course. An authorized port scan and an unauthorized one send identical packets. The only difference is a document. So let's learn to read that document like our freedom depends on it, because it does." |
| 0:20 | The defective ACME LOGISTICS scope from the lesson, in a document editor. | "This arrived in an inbox. Read it as an assistant who has to decide, packet by packet, whether you're allowed." |
| 0:35 | "203.0.113.0/24" highlighted. Margin comment: "256 addresses. Who verified ownership?" | "A /24 is two hundred and fifty-six addresses. Nothing here says the client owns all of them, and addresses get reassigned. Comment: ownership verification needed, preferably as an enumerated list." |
| 1:00 | "all acme-logistics.example subdomains" highlighted. Comment: "Unbounded; includes third parties (status page, mail)." | "'All subdomains' is unbounded and changes daily. It usually includes a hosted status page or a mail provider the client doesn't own. You can't authorize testing someone else's server." |
| 1:25 | "the customer portal" and "related infrastructure" highlighted. Comments: "No URL." and "Authorizes nothing and everything. Strike." | "'The customer portal' has no URL. 'Related infrastructure' is the most dangerous phrase in any scope. It means whatever you later wish it meant. Strike it." |
| 1:50 | "Excluded: production systems" highlighted. Comment: "Contradiction. The external range IS production." | "Excluding production while including the external range is self-contradictory. Exclusions must be as specific as inclusions: a list of addresses." |
| 2:10 | Window and Notes lines highlighted. Comments: "No dates, times, or time zone." and "A wish, not a rule; name prohibited techniques." | "'Two weeks starting in October' has no dates, no times, no time zone. 'Please avoid disruption' is a wish. A rule names the prohibited techniques: no denial of service, no data modification." |
| 2:35 | Split screen showing the lesson's rewritten scope. Each line ticks green **and** gets a "✓ testable" label as the narrator reaches it. | "Now the rewrite. An exact range of thirty-nine addresses, thirty-seven once the two exclusions come out, verified against an ownership register. Two exact URLs with base paths. Excluded addresses and third-party names listed. Perspective and roles. A depth ceiling. A window with dates, times, a time zone, and a change-freeze day. Named testers. Source IPs, so defenders can tell us apart from a real attacker." |
| 3:30 | Quiz overlay: "May I send this packet?" (a) 203.0.113.30, port 443, 2025-10-07 11:00 ET. (b) 203.0.113.22. (c) status.acme-logistics.example. (d) 203.0.113.30 on 2025-10-13. | "Quiz time. Pause and answer each one from the rewritten scope." |
| 3:45 | Answers revealed. | "(a) Yes: in range, inside the window. (b) No, it's on the exclusion list: legacy WMS, vendor-managed. (c) No: third party. (d) No: that's the change-freeze day. Every answer came from the document, not from judgement. That's what a good scope looks like." |
| 4:20 | Activity log entry from the lesson: "203.0.113.22 ... on EXCLUSION list. NO FURTHER ACTION. Escalated to K. Bell 10:44 by phone." | "And when something outside scope answers, and it will, this is the professional move. Log it, stop, and escalate. That log line protects the client and protects you." |
| 4:50 | Text card: "An assistant never extends scope. Not by one host. Not verbally." | "One rule to finish. An assistant never extends scope. Not by one host, not 'just to confirm', not because an engineer said it was fine in the corridor. Scope changes are written and signed by whoever signed the original." |
| 5:20 | End card: "Practice: Part 2, find eight defects." | "Your turn: Part 2 of the practice. Find at least eight defects and write your own replacement wording." |

## On-screen assets and B-roll
- The defective and rewritten scope fragments from cyb140-02, shown as an editable document with margin comments.
- Quiz overlay cards.

## Accessibility
- Captions throughout. Every highlighted phrase and margin comment is read aloud.
- Ticks always come with the "testable" label; green is never the only cue.
- Document zoomed to 150%, comments in a large sans-serif font.

## Check for understanding
1. Why is "related infrastructure" unacceptable in a scope? *It has no defensible boundary; it authorizes whatever someone later claims.*
2. An address inside your CIDR answers with a certificate issued to another company. What now? *Treat it as out of scope, stop, log it, and escalate for written ownership confirmation.*
3. Why does a scope list the testers' source IPs? *So defenders can deconflict test traffic from real attacks, and so you can later prove which events were yours.*
