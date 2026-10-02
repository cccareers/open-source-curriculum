---
lesson_id: cyb250-03
course_id: cyb250
pathway: cybersecurity-support-technician
title: Phishing, Vishing, and Business Email Compromise
order: 3
kind: lesson
competency_ids:
  - D5-S1-C02
  - D5-S1-C04
objectives:
  - Analyze a suspicious message, decide what to do with it, and route it to the right people
---

## From levers to channels

Lesson 02 gave you the pressures. This lesson gives you the delivery mechanisms and, more importantly, the workflow you run when one of them lands in your queue. In a support technician role, reported messages are the highest-volume security work you will do. Most of them are junk. Some of them are the first ten minutes of an incident, and telling the difference quickly — without touching anything you should not touch — is the skill.

Two things to establish before the taxonomy. First, the mail controls you configured in cyb210 are assumed here. SPF, DKIM, DMARC alignment, and gateway filtering are not re-taught; what you need in *this* course is the ability to explain to a non-technical colleague why a message got past controls that are working correctly, because that conversation happens every single time. Second, the measurable output of this work is not "how many people clicked." It is **how many people reported, and how fast**. A message reported at four minutes by one person protects everyone else who received it. Design every part of your process around making that report cheap.

## The taxonomy you will actually use

**Bulk phishing.** High-volume, low-personalization, sent to anyone. Brand impersonation of mail providers, parcel carriers, streaming services, banks. Cheap, and still effective because volume compensates for a low conversion rate.

**Spear phishing.** Targeted at a named individual or a small group, built from reconnaissance. References a real project, a real colleague, a real supplier. This is where the grammar-error heuristic dies for good.

**Whaling.** Spear phishing aimed at executives, or impersonating them. Both directions matter: the executive is a high-value target *and* the most useful identity to borrow.

**Clone phishing.** A copy of a real message the target already received, resent with the link or attachment swapped. Devastating because the target genuinely recognizes it.

**Thread hijacking.** A reply inserted into an existing, real conversation — usually because one participant's mailbox is compromised. Full context, correct history, correct people, correct tone.

**Vishing.** Voice. A phone call applying the same levers, with caller ID spoofed and, increasingly, a cloned voice. Vishing is often the *second* stage: mail establishes the pretext, the call closes it, because a live human handles objections in a way a static message cannot.

**Smishing.** SMS and messaging apps. Short, urgent, usually a link, frequently sent to personal devices where none of your controls apply and where the target is off-guard. Delivery notifications, toll charges, bank alerts, and the "hi, this is the CEO, are you free" opener.

**Quishing.** A QR code carrying the malicious URL. It exists specifically to move the link out of the mail body, where a gateway can rewrite and scan it, and onto a personal phone camera, where nothing can. Posters, invoices, parking signs, and PDF attachments.

**Callback phishing.** A message with no link and no attachment — just an invoice or a subscription renewal notice and a phone number. Nothing for the gateway to detect. The attack happens on the call, where the target is talked into installing remote-access software.

**Adversary-in-the-middle phishing.** The credential page is a live reverse proxy in front of the real service. The target authenticates genuinely, completes the multi-factor challenge genuinely, and the attacker captures the resulting session token. **This is the reason "we have MFA" is no longer an answer.** The defensive implications belong to your identity controls — phishing-resistant authenticators, token binding, session revocation — but you must recognize the pattern in triage, because the exposure question changes completely: a captured session means a password reset alone is insufficient, and sessions must be revoked.

**Business email compromise.** Not a technique so much as an outcome, and the one with the largest financial losses of anything in this lesson. Common forms:

- *Vendor or invoice fraud* — a supplier's bank details are "updated," usually inside a real thread, often after a genuine mailbox compromise at the supplier.
- *Executive fraud* — an urgent, confidential payment request attributed to a senior leader.
- *Payroll diversion* — an employee's direct deposit details changed through the self-service portal or by a request to HR.
- *Gift card fraud* — small-value, high-volume, aimed at junior staff, and often the probe that tests whether an organization will comply at all.
- *Data BEC* — no money moves; the request is for the payroll file, the employee list, or the tax documents, which fund the next round.

BEC frequently involves no malware and no malicious link. That is exactly why technical controls miss it and why process controls — out-of-band verification of every payment change, dual authorization, a callback to a number from the vendor record — carry the defense.

## Triage: the workflow

Run the same sequence every time. Consistency is what makes the work auditable and what keeps you from skipping the step that mattered.

![Decision flow for triaging a reported message from receipt through containment and closure](./img/phishing-triage-flow.png)

**1. Preserve before you touch.** Get the message with headers intact. Forwarding as an attachment (`.eml`/`.msg`) preserves them; a plain forward destroys them. If your organization has a report button that submits the original, that is the preferred path, and getting people to use it is half of lesson 04's job.

**2. Handle safely.** Do not click links or open attachments on a production endpoint. Ever, including "just to see." Use your organization's sanctioned analysis tooling — a detonation sandbox, a URL analysis service, a browser isolation profile. Defang every indicator the moment you write it down: `hxxps://`, `example[.]com`, `user[at]example[.]com`. Defanging is not decoration; it stops a colleague's mail client or ticketing system from turning your evidence into a live link.

**3. Classify.** Which of the categories above is it? What is the terminal action — credentials, payment, execution, disclosure, access? Is it targeted or bulk? Targeted changes the urgency, because targeted implies reconnaissance and implies follow-up.

**4. Establish scope.** This is the step junior technicians skip and the step that matters most. One report means one person noticed, not one person received. Ask your mail platform: how many recipients, how many delivered to inboxes rather than quarantine, how many clicked, how many authenticated afterward. Scope determines everything downstream.

**5. Assess exposure per affected user.** Did anyone enter credentials? Approve an MFA prompt? Open an attachment? Reply with information? Move money or change a record? Each answer routes differently.

**6. Contain.** Purge or quarantine the message tenant-wide, block the sender and infrastructure, reset credentials and — critically — **revoke active sessions and refresh tokens**, review the affected mailbox for attacker-created inbox rules that hide replies, and isolate the endpoint if anything executed. Endpoint containment itself is cyb210's runbook; the handoff belongs here.

**7. Communicate.** To the reporter, to any other recipients if warranted, and to whoever owns the risk. Covered below.

**8. Close the loop.** Feed indicators to the mail team, record the case, and note whether the control gap was technical or procedural. This is where next quarter's awareness content comes from, and it is why you keep the classification consistent.

## Why it got through: the explanation you will give ten times

Someone will forward you a fraudulent message and ask, in a tone somewhere between curiosity and accusation, why the filters did not stop it. You need an answer that is true, short, and does not imply the mail controls are broken. Here are the real reasons, in roughly descending order of how often they apply.

**The sender did not spoof anything.** Most modern phishing comes from a domain the attacker actually owns — a lookalike (`rn` for `m`, a hyphen inserted, a different top-level domain) or a throwaway. It has valid SPF, a valid DKIM signature, and passes DMARC *for its own domain*. Authentication asks "did this domain really send this?" and the honest answer is yes. Authentication was never a truthfulness check.

**The sending account is legitimate and compromised.** A real supplier's real mailbox. Every check passes because nothing is forged. This is the hardest case for technical controls and the reason thread hijacking works so well.

**Your DMARC policy is not enforcing.** A policy of `p=none` publishes a preference and blocks nothing. If your own domain is being spoofed and you are still in monitoring mode, say so plainly and treat it as a finding to raise, not a fact to hide.

**Alignment passed on a domain the user cannot see.** A message can pass SPF on its envelope sender while displaying a completely different name and address to the reader. Users judge the display name, which is free text that anyone can set. Explaining this gap to a colleague — "the check confirmed the delivery envelope, not the name on the front of it" — is usually the single most useful sentence you will say about mail security all week.

**The infrastructure is too new to have a reputation.** Domain registered yesterday, sent from a shared cloud provider with a clean address range, no volume history. Reputation-based filtering needs a history it does not yet have.

**There was nothing to detect.** Callback phishing and BEC often carry no link, no attachment, and no malicious content at all — just text and a phone number.

**A rule or allow-list let it through.** Someone allow-listed a partner domain, or a bulk-mail exception, or a quarantine release from months ago. Worth checking, and worth reporting without blame — allow-lists accumulate for good reasons.

Keep the tone right. The correct framing is: "the technical checks did what they are designed to do, and this message was designed so those checks would pass — that is why your report is the control that caught it." That sentence makes the person who reported it feel useful, which is the behavior you want repeated.

## An annotated artifact

Below is a fictional, defanged header excerpt of the kind you will read in triage. Every domain is invented and every indicator is neutered; this is an object for analysis, not a template.

```text
From: "Priya Raman - Finance Director" <p.raman@nortonfield-group[.]net>
Reply-To: accounts.review@nortonfield-group[.]net
Return-Path: <bounce-8842@mail-relay-04[.]sendhostexample[.]net>
To: j.okafor@nortonfield[.]example
Subject: Re: Q3 supplier reconciliation - action before 17:00
Date: Thu, 12 Sep 2024 16:41:07 +0100
Authentication-Results: mx.nortonfield[.]example;
    spf=pass smtp.mailfrom=mail-relay-04[.]sendhostexample[.]net;
    dkim=pass header.d=nortonfield-group[.]net;
    dmarc=pass header.from=nortonfield-group[.]net
X-Received-Domain-Age: 3 days
```

What to read off it:

- The visible `From` domain is `nortonfield-group[.]net`; the recipient's own domain is `nortonfield[.]example`. **This is a lookalike, not a spoof.** No forgery occurred.
- Everything passes. SPF passes for the relay, DKIM passes for the attacker's own domain, DMARC aligns — with the attacker's domain. This is the "why did it get through" conversation in one block of text.
- `Reply-To` differs from `From`, so replies leave the visible conversation.
- The domain is three days old — the strongest single indicator present, and the one worth building a detection rule around.
- The subject uses `Re:` to imply an existing thread and carries a same-day deadline. Urgency plus authority, exactly as classified in lesson 02.

Your write-up records the terminal action (a payment or reconciliation change), the indicators to block (the domain, the relay, the reply-to address), the scope (how many recipients, how many delivered), and the exposure (did anyone reply, and did any payment record change).

## Routing: who needs to know, and when

Triage without routing is just filing. Every finding has an owner, and the mistake to avoid is holding a case because you are not certain it is real. Escalate on suspicion; downgrade on evidence.

| Finding | Route to | Urgency |
| --- | --- | --- |
| Bulk phish, nobody interacted | Mail/gateway team as indicators; close | Routine |
| Targeted phish, recipients identified, no interaction | Security team; tenant-wide purge; warn recipients | Same day |
| Credentials entered, or MFA prompt approved | Incident response immediately — reset, revoke sessions, hunt for inbox rules | Immediate |
| Attachment or installer executed | Incident response and endpoint containment per the cyb210 runbook | Immediate |
| Payment made or bank details changed | Finance leadership *and* the bank, in parallel, plus incident response | Immediate — recall windows are hours |
| Payroll or bank detail change request for an employee | HR and payroll, with verification through a known channel | Same day |
| Personal data disclosed | Data protection or privacy owner, and legal | Same day; notification clocks may start |
| Your own domain or brand being impersonated externally | Comms and legal; the impersonated third party if it is theirs | Same day |
| Vishing or smishing to personal devices | Security team; warn the population, since your controls do not reach the channel | Same day |

Three notes on the human side of routing. **Tell the reporter what happened.** A one-line reply — "this was a real credential-harvesting attempt, we have removed it from 214 mailboxes, thank you" — is the highest-return communication in the entire awareness program, and it costs you thirty seconds. **Never route a person's mistake as gossip.** The finance clerk who approved the payment needs their manager and the responders, not a wider audience. And **when you warn a population, tell them what to do, not just what happened**: what the message looks like, what to do if they interacted, and where to report.

## Practice

**Part 1 — Triage three reports.** For each fictional report below, produce a triage record with these fields: classification, terminal action, levers used, indicators to block (defanged), the scope questions you would ask your mail platform, the exposure questions you would ask the recipient, containment actions in order, the route from the table above, and a two-sentence "why it got through" explanation written for a non-technical reader.

1. A finance clerk forwards a reply inside a six-message thread with a genuine supplier. The reply says the supplier's bank has changed, attaches a remittance form, and the sender address is the supplier's real domain. The clerk says the next payment run is tomorrow.
2. A warehouse supervisor reports a text on their personal phone claiming a parcel is held pending a small customs fee, with a shortened link. Four colleagues say they received the same message.
3. A user reports that they scanned a QR code on a printed invoice pinned to the staff notice board, were taken to a page that looked like the company sign-in, entered their password, approved a push notification, and then the page showed an error.

For case 3 specifically, state what makes the exposure worse than a plain credential theft and name the two containment steps a password reset alone would miss.

**Part 2 — Write the explanations.** Using the annotated header block in this lesson, write two explanations of why the message was delivered: one of about 60 words for the recipient, and one of about 120 words for a manager who is asking whether the mail filtering needs replacing. The second must be accurate about what authentication does and does not prove, must not blame the recipient, and must end with one concrete improvement you would recommend.

**Part 3 — Build the intake form.** Draft the fields for a suspicious-message report form that a non-technical employee can complete in under 60 seconds on a phone. Justify each field in one line by naming which triage step it feeds, and name three fields you deliberately left out because they slow reporting more than they help. Then write the automatic acknowledgement the reporter receives — under 80 words, thanking them, telling them what happens next, and telling them explicitly what to do if they realize later that they interacted with it.
