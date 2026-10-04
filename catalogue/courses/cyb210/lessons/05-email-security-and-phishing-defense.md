---
lesson_id: cyb210-05
course_id: cyb210
pathway: cybersecurity-support-technician
title: Email Security and Phishing Defense
order: 5
kind: lesson
competency_ids:
  - D5-S1-C04
  - D5-S1-C02
objectives:
  - Configure email authentication and filtering to block spoofed, malicious, and unwanted mail
---

## The channel that delivers most of it

Read back through the process tree in lesson 03. The first line was a mail client writing an attachment to disk. That is not a stylistic choice on my part — mail remains the highest-volume initial access channel in the industry, year after year, because it is the one system every organization must leave open to strangers. Your firewall can refuse unsolicited connections. Your mail server cannot refuse unsolicited mail and remain a mail server.

So the endpoint controls from lesson 02 and the patching from lesson 04 are both, in a sense, second lines. The first line is the mail gateway, and it is unusual among security controls in that a competent configuration genuinely eliminates whole categories of attack rather than merely detecting them. An attacker who cannot convincingly spoof your domain cannot run the cheapest and most effective version of business email compromise. That is worth several days of DNS work.

One boundary before we start. This lesson covers the **technical** mail controls — authentication, filtering, attachment and link handling, and the response procedure when something gets through. The **human** side, security awareness training and simulated phishing programmes, is cyb250 and is deliberately not taught here. The two are complements: awareness training with no technical controls asks users to do a job that machines should have done, and technical controls with no awareness programme leaves the residue unaddressed.

## How a message actually identifies itself

Almost every mail security control makes sense once you understand one thing: **a message carries two different "from" addresses, and they need not match.**

When a sending server delivers mail over SMTP, the conversation looks roughly like this:

```text
S: 220 mx.example.org ESMTP
C: EHLO mail.sender-domain.example
C: MAIL FROM:<bounces@sender-domain.example>      <-- envelope sender (RFC 5321)
C: RCPT TO:<jrivera@example.org>
C: DATA
C: From: "Accounts Payable" <ap@yourcompany.example>   <-- header From (RFC 5322)
C: Subject: Updated remittance details
C: ...
C: .
S: 250 OK
```

The **envelope sender** (`MAIL FROM`, sometimes called the return-path or `5321.From`) is what the servers use for delivery and for bounces. The recipient never sees it. The **header From** (`5322.From`) is what the recipient's mail client displays, and it is the only "from" a human ever sees.

Nothing in SMTP requires those two to be related. That gap is the entire spoofing problem, and the three-record stack — SPF, DKIM, DMARC — exists to close it. Understand which of the two each one checks and the whole subject falls into place:

- **SPF** authorizes sending hosts for the **envelope sender's** domain.
- **DKIM** cryptographically signs the message, and the signature carries its own domain (`d=`) which is independent of both from-addresses.
- **DMARC** is the layer that finally makes the **header From** meaningful, by requiring that an SPF or DKIM pass *align* with the domain the user actually sees, and by telling receivers what to do when neither does.

![How a receiving mail server evaluates SPF, DKIM, and DMARC alignment against the envelope sender and the header From address](./img/mail-authentication-flow.png)

## SPF: who may send as your domain

Sender Policy Framework is a DNS TXT record listing the hosts permitted to send mail using your domain in the envelope sender. The receiving server takes the envelope sender's domain, looks up its SPF record, and checks whether the connecting IP address is authorized.

```dns
example.org.  IN  TXT  "v=spf1 ip4:198.51.100.25 include:_spf.mailvendor.example include:mail.crm-vendor.example -all"
```

Reading it left to right: version tag, then a list of **mechanisms** evaluated in order until one matches, then an **all** mechanism that catches everything else.

| Mechanism | Meaning |
| --- | --- |
| `ip4:` / `ip6:` | This literal address or CIDR range is authorized |
| `a` / `mx` | The domain's own A or MX records are authorized |
| `include:` | Import another domain's SPF record — how you authorize a vendor |
| `all` | Matches everything; must be last |

Each mechanism carries a qualifier: `+` pass (the default), `~` softfail, `?` neutral, `-` fail. The one that matters is the qualifier on `all`:

- `-all` — **hard fail.** Anything not listed is not authorized. This is the destination.
- `~all` — **softfail.** Not authorized, but do not reject on that basis alone. This is the safe place to sit while you find the senders you forgot.
- `?all` — neutral. Says nothing. Equivalent to having no policy while looking like you have one.

**Three limits you will hit in practice, all of them worth knowing before you write a record.**

*The ten-lookup limit.* SPF evaluation may perform at most ten DNS lookups. `include:`, `a`, `mx`, `ptr`, `exists`, and `redirect` each consume one, and an `include:` recursively consumes the lookups inside the record it imports. Exceed ten and the result is `permerror`, which most receivers treat as no SPF at all — so an over-stuffed record fails **open**, silently, and usually months after the person who added the seventh vendor has moved on. Count your lookups; use a checker; consolidate or flatten when you approach the limit.

*Forwarding breaks SPF.* When a recipient auto-forwards mail, the forwarding server connects from its own IP address, which is not in your SPF record. SPF fails, legitimately, on a legitimate message. This is why SPF alone is not a sufficient basis for rejection and why DKIM matters.

*One record only.* Two `v=spf1` TXT records on the same name is a `permerror`. Merge, never append a second.

**Also publish a null record on domains that never send mail.** Parked domains, brand-protection registrations, and subdomains are favourite spoofing targets precisely because nobody configured them:

```dns
noreply.example.org.  IN  TXT  "v=spf1 -all"
```

## DKIM: a signature that survives the trip

DomainKeys Identified Mail has the sending server sign selected headers and the message body with a private key. The receiver fetches the public key from DNS and verifies. If it verifies, the message provably came from someone holding that domain's key and was not modified in transit in the signed parts.

The signature arrives as a header:

```text
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=example.org; s=sel2024a;
 h=from:to:subject:date:message-id; bh=6Xk3...=; b=Hn8dQ...=
```

The two fields to read every time are `d=`, the **signing domain**, and `s=`, the **selector**. Together they say where the public key lives:

```dns
sel2024a._domainkey.example.org.  IN  TXT  "v=DKIM1; k=rsa; p=MIIBIjANBgkq...IDAQAB"
```

The selector exists so a domain can have several keys at once — one per sending vendor, and old plus new during a rotation. That is the whole reason for the odd `<selector>._domainkey.<domain>` shape.

Practical guidance: use 2048-bit RSA keys; 1024-bit is still common and no longer a defensible choice for new deployments. Rotate keys on a schedule — publish the new selector, switch signing to it, leave the old public key in DNS for a grace period so in-flight mail still verifies, then remove it. Sign at minimum `From`, `To`, `Subject`, `Date`, and `Message-ID`. And note the property that makes DKIM the load-bearing record: **it survives forwarding**, because the signature travels with the message rather than depending on the connecting IP.

DKIM's own limit: a valid signature proves the message is authentic *for the domain in `d=`*. An attacker can perfectly well send you a message signed by their own domain, with your company in the display name. DKIM passing means nothing on its own. Which brings us to the record that ties it together.

## DMARC: making the visible From mean something

Domain-based Message Authentication, Reporting and Conformance adds the two things that were missing: **alignment** and **policy**.

**Alignment** is the key idea. DMARC passes only if SPF or DKIM passes *and* the passing domain aligns with the domain in the header From — the one the human sees.

- *SPF alignment*: the envelope sender's domain matches the header From domain.
- *DKIM alignment*: the signature's `d=` matches the header From domain.

Alignment is `relaxed` by default, meaning organizational-domain match — `mail.example.org` aligns with `example.org`. Strict (`aspf=s`, `adkim=s`) requires an exact match.

Now the spoofing hole closes. An attacker can pass SPF for their own throwaway domain and can DKIM-sign with their own key, but neither will align with `example.org` in the header From, so DMARC fails, and your published policy tells the receiver what to do about it.

```dns
_dmarc.example.org.  IN  TXT  "v=DMARC1; p=reject; sp=reject; adkim=s; aspf=r; pct=100; rua=mailto:dmarc-agg@example.org; ruf=mailto:dmarc-forensic@example.org; fo=1"
```

| Tag | Meaning |
| --- | --- |
| `p=` | Policy for the domain: `none`, `quarantine`, or `reject` |
| `sp=` | Policy for subdomains; defaults to `p` if omitted |
| `pct=` | Apply the policy to this percentage of failing mail — the rollout dial |
| `adkim=` / `aspf=` | Alignment strictness, `r` relaxed or `s` strict |
| `rua=` | Where to send aggregate reports (daily XML summaries) |
| `ruf=` | Where to send failure reports (per-message, often not sent by receivers) |
| `fo=` | When to generate failure reports |

**`p=none` is not a policy. It is a listening mode.** It asks receivers to report but change nothing. It is the correct first step and a terrible permanent state — a domain sitting at `p=none` for three years has the reporting benefit and none of the protection, and attackers check.

### The rollout ladder

This is the part that separates a working deployment from a broken one. Rushing it will block your own payroll provider's mail on a Friday.

1. **Inventory your senders.** Every system that sends mail as your domain: the mail platform, the CRM, the marketing tool, the ticketing system, the invoicing system, the monitoring alerts, the HR platform, the recruiting tool, the appliance that emails scans from the copier. There will be more than you expect and at least two nobody remembers.
2. **Get SPF and DKIM right for every one of them.** SPF `include:` or IP entries; DKIM selectors published and signing enabled at the vendor. Verify each vendor individually by sending a test and reading the headers.
3. **Publish `p=none` with `rua=`.** Collect aggregate reports for at least two to four weeks. Use a report parser or a hosted service — the raw XML is machine-readable, not human-readable, at any real volume.
4. **Read the reports and find the gaps.** Every source failing alignment is either a sender you forgot (fix it) or a spoofer (good, that is what you are here for). Do not advance until the failing volume is only sources you can explain.
5. **Move to `p=quarantine` with `pct=` low.** Start at `pct=25`, watch, raise to 50, 100. Quarantine means the junk folder, which is recoverable — that is why it is the middle rung.
6. **Move to `p=reject`, again ramping `pct=`.** Rejection is final, so the ramp matters.
7. **Set `sp=reject` and publish null SPF plus `p=reject` DMARC on non-sending domains.** Subdomains and parked domains are where spoofers go once the main domain is protected.
8. **Keep reading the reports.** This is not a project with an end date. New vendors get added by other departments without telling you, and the aggregate report is how you find out.

**ARC (Authenticated Received Chain)** deserves a mention because it is what mailing lists and forwarders use to preserve authentication results across a hop that legitimately modifies a message. If you run mailing lists, understand it before enforcing; if you do not, you mainly need to know why an internal mailing list started failing DMARC the week you enforced.

Two neighbouring records worth publishing once the core three are done: **MTA-STS** (with **TLS-RPT**) tells senders to require verified TLS to your domain, closing downgrade interception; and **BIMI** displays your logo in supporting clients and requires `p=quarantine` or stronger, which makes it a useful lever for getting marketing to fund DMARC enforcement.

## Filtering: everything the three records do not cover

Authentication stops *spoofing of your domain*. It does nothing about a genuine message from a genuine attacker-owned domain, which is how most phishing actually arrives. That is the filter's job, and a competent gateway layers several.

**Connection layer.** Before the message body is even accepted: IP reputation and blocklists, greylisting, rate limiting per sender, and reverse-DNS sanity checks. Cheap, fast, and it discards the bulk commodity volume.

**Sender-authentication policy.** Enforce inbound DMARC. If a sending domain publishes `p=reject` and the message fails, honour it. Organizations that publish strict DMARC outbound and ignore it inbound have done half the work and got a quarter of the benefit.

**Content and attachment policy.** This is where you make the highest-value decision in the whole lesson: **block executable and script attachment types at the gateway, by true file type, not by extension.** There is no legitimate business reason to receive `.exe`, `.scr`, `.js`, `.vbs`, `.hta`, `.iso`, `.img`, `.lnk`, or `.chm` by mail, and each of them has been a mainstream delivery vehicle. Inspect inside archives, and treat a password-protected archive whose password is in the message body as what it is: a deliberate attempt to defeat scanning. Block or quarantine macro-enabled office documents from external senders. Note that attackers rotate container formats constantly as each gets blocked — the specific list ages, the policy of "allow-list the document types the business needs and block the rest" does not.

**Malware scanning and detonation.** Signature and reputation scanning for the commodity volume, plus sandbox detonation of attachments and, where the product supports it, of the pages behind links. The detonation verdict feeds the same behavioral classification you learned in lesson 03.

**URL handling.** Rewrite links so that the click is evaluated at click time rather than at delivery time. This matters because a common technique is to send a benign page and weaponize it hours later, after the message has already passed the filter. Time-of-click checking is one of the few controls that addresses that directly.

**Impersonation detection.** Distinct from spoofing, and increasingly the bigger problem:

- *Display-name impersonation.* Header From reads `"Dana Whitfield, CEO" <dwhitfield.ceo@gmail.example>`. Perfectly authenticated, by a domain the attacker owns. Detect by matching display names against your executive and finance directory.
- *Lookalike domains.* `examp1e.org`, `example-org.com`, `exarnple.org`. Detect by string-distance comparison to your own and your key partners' domains, and by newly-registered-domain scoring.
- *Thread hijacking.* A reply injected into a real conversation, often from a genuinely compromised partner mailbox. This one defeats almost every technical control, which is why the response procedure below exists.

**Recipient-visible signals.** An external-sender banner on every message from outside the organization, and a stronger warning on first-contact senders. Low cost, and it is the control that most often catches display-name impersonation. Keep the banner text short; a banner on every message that says three paragraphs is a banner nobody reads.

**Outbound and internal.** Filter outbound mail too — it catches a compromised mailbox sending to your customers before your customers tell you. And scan internal mail: once one mailbox is compromised, internal messages are the most trusted phishing an attacker can send.

**Post-delivery remediation.** The single most useful modern gateway capability: search all mailboxes for a message by sender, subject, URL, or attachment hash, and remove it from every inbox retroactively. When a campaign is identified an hour after delivery, this is what prevents the other 200 recipients from clicking.

## Worked example: triaging a reported message

A user forwards a suspicious message. You pull the original with full headers. Read from the bottom up — `Received` headers are prepended, so the oldest hop is last.

```text
Authentication-Results: mx.example.org;
        spf=pass (sender IP is 203.0.113.77) smtp.mailfrom=bounce.mailblast-svc[.]example;
        dkim=pass header.d=mailblast-svc[.]example header.s=k1;
        dmarc=fail (p=reject sp=reject dis=quarantine) header.from=example[.]org
Received: from relay07.mailblast-svc[.]example (203.0.113.77) by mx.example.org
        with ESMTPS; Tue, 11 Mar 2025 09:02:14 +0000
Return-Path: <bounce@bounce.mailblast-svc[.]example>
From: "Accounts Payable" <ap@example[.]org>
Reply-To: <ap.finance.dept@mail-secure-portal[.]example>
To: <jrivera@example[.]org>
Subject: URGENT: updated bank details for today's run
```

Work through it:

- **SPF passed.** For `bounce.mailblast-svc.example`, which is the attacker's bulk-mail platform, not your domain. SPF pass is not a trust signal. This is the single most common misreading of mail headers.
- **DKIM passed.** With `d=mailblast-svc.example`. Again, the attacker's own domain, signed with the attacker's own key. Also not a trust signal.
- **DMARC failed**, and it failed for the right reason: neither the SPF domain nor the DKIM domain aligns with `header.from=example.org`. The message claims to be from your own finance function and cannot prove it.
- **`dis=quarantine` despite `p=reject`.** Your inbound policy is overriding the sender's published policy, probably through a local allow-list or a mailing-list exception. That is a configuration finding: your own domain publishes `p=reject`, you received a message failing DMARC for your own domain, and you delivered it to a folder instead of refusing it. Fix that today.
- **`Reply-To` differs from `From`.** Replies go to attacker infrastructure. Combined with a payment-change subject line, this is textbook business email compromise.
- **Urgency plus a financial action.** The social-engineering signature. The technical controls and the human signals point the same direction.

**Verdict:** an unauthenticated impersonation of your own domain attempting fraudulent payment redirection. Now run the response.

## Responding to a phishing or malware campaign

A written procedure, executed in this order, because each step limits the damage the next step's delay would cause.

1. **Acknowledge the reporter.** Within minutes if you can. The reporting rate is your best early-warning sensor, and it collapses if reporting feels like shouting into a void.
2. **Preserve the original.** Full headers, the raw message, the attachment hash if any. Defang indicators in anything you circulate.
3. **Triage the message.** Authentication results, sender infrastructure, links, attachments. If there is an attachment or a payload, hand it to the lesson 03 triage funnel — isolated lab, never your workstation.
4. **Scope it.** Search the mail platform for every message matching the sender, subject, link domain, or attachment hash. How many recipients, how many delivered, how many opened, how many clicked, how many replied. This number decides everything that follows.
5. **Purge.** Retroactively remove the message from every mailbox, delivered and unread alike.
6. **Block the indicators.** Sender domain and address at the gateway; link domains at the mail filter and at DNS or the web proxy; attachment hash at the endpoint agent. Use the pyramid from lesson 03 — expect the domain to be disposable and build a behavioral detection too.
7. **Handle the users who interacted.** This is the part that gets skipped. For anyone who clicked a credential-harvesting link: reset the password **and revoke active sessions and tokens**, because a password reset alone leaves a stolen session cookie working. Check for attacker-created mailbox rules — auto-forwarding to an external address, or a rule that files replies from finance into a hidden folder, is the classic post-compromise persistence in mail and it is invisible to the user. Check for newly registered multi-factor methods. For anyone who opened an attachment: isolate the endpoint and run the containment procedure from lesson 06.
8. **Sweep the estate.** Search endpoint telemetry for the attachment hash, the payload filenames, and the network indicators. Delivery to 200 mailboxes with two executions is a very different incident from delivery to 200 with none.
9. **Close the gap that let it through.** Every campaign that lands is a filter finding. Was the attachment type one you should have been blocking? Was the lookalike domain within string distance of yours? Did your inbound DMARC enforcement not fire? Write the change.
10. **Hand off if it is bigger than a message.** Confirmed credential compromise, confirmed execution, or evidence of lateral movement is an incident, and the full lifecycle — investigation, eradication, recovery, and post-incident reporting — belongs to cyb120's process.

Two measures tell you whether this is working: **time from first delivery to purge**, and the **report-to-click ratio**. Both improve with practice; neither improves by itself.

## Practice

Use a lab or test tenant throughout. Do not modify production DNS. Any file analysis follows lesson 03's isolation rules; **no live malicious samples or live phishing URLs are used in this exercise.**

**Part 1 — Author the authentication stack.** Your fictional organization, `harborridge.example`, sends mail from: its main mail platform (SPF include `_spf.mailhost.example`), a CRM (include `spf.crm-vendor.example`), a marketing platform (include `sendmail.mktg-vendor.example`), an on-premises invoicing server at `198.51.100.40`, and a monitoring appliance at `198.51.100.41`. Write out, as literal DNS records:

1. The SPF record. Count and state the DNS lookups it consumes, and say how close to the limit you are.
2. A DKIM public-key record for one selector, with the fields labelled and the key length you chose.
3. A DMARC record for the **first** rollout step, and the DMARC record for the **final** enforced state. State every tag you changed between them and why.
4. SPF and DMARC records for `parked.harborridge.example`, a domain that must never send mail.

**Part 2 — Plan the rollout.** Write the eight-step rollout as a schedule with dates, an owner per step, the specific evidence you require before advancing to the next step, and the rollback action if enforcement blocks legitimate mail. Name the two sender categories most likely to break and how you would detect each from aggregate reports.

**Part 3 — Read a report.** Given the aggregate-report extract below, state for each source whether it is a forgotten legitimate sender, a forwarding artifact, or a spoofer, and give the remediation for each.

```xml
<record><row><source_ip>198.51.100.40</source_ip><count>412</count>
  <policy_evaluated><disposition>none</disposition><dkim>fail</dkim><spf>pass</spf></policy_evaluated>
</row><identifiers><header_from>harborridge.example</header_from></identifiers></record>
<record><row><source_ip>203.0.113.99</source_ip><count>2740</count>
  <policy_evaluated><disposition>none</disposition><dkim>fail</dkim><spf>fail</spf></policy_evaluated>
</row><identifiers><header_from>harborridge.example</header_from></identifiers></record>
<record><row><source_ip>192.0.2.15</source_ip><count>36</count>
  <policy_evaluated><disposition>none</disposition><dkim>pass</dkim><spf>fail</spf></policy_evaluated>
</row><identifiers><header_from>harborridge.example</header_from></identifiers></record>
```

**Part 4 — Design the filter policy.** Write the inbound filtering policy as a table with columns: control, configuration, what it blocks, and what it will *not* block. Cover at minimum connection-layer reputation, inbound DMARC enforcement, attachment type policy (give your explicit allow list and block list, and state that matching is on true file type), archive and password-protected-archive handling, macro documents from external senders, URL rewriting, display-name impersonation, lookalike-domain detection, external-sender banner, and outbound and internal scanning. For each control, name one realistic false positive and how you would handle it without disabling the control.

**Part 5 — Triage two messages.** Your instructor will supply two sanitized message headers. For each, produce: the authentication verdict with the reasoning for SPF, DKIM, and DMARC separately; whether each pass is a trust signal and why; every indicator, defanged, in a table with its pyramid tier; a one-line verdict; and the first three response steps you would take.

**Part 6 — Write the response runbook.** Turn the ten-step response into a one-page procedure a colleague on their first week could execute, with the specific search you would run at step 4 and the exact list of account actions at step 7. Include the two metrics and where each is measured.

**Deliverable:** one document containing Parts 1 through 6, with every DNS record written out in full rather than described, and every indicator defanged.

## Check your understanding

1. A message shows `spf=pass` for `smtp.mailfrom=bounce.vendor-mailer.example` and `header.from=harborridge.example`, with no DKIM signature. Does DMARC pass? Why or why not?
2. Your SPF record has six `include:` mechanisms, and two of the included records each contain three more `include:`s. How many DNS lookups is that, and what happens to SPF evaluation?
3. Why is `p=none` described as a listening mode rather than a policy, and what must be true before you move to `p=quarantine`?
4. A user clicked a credential-harvesting link and you reset their password. Name two further account actions from the response procedure that the reset alone does not cover.

**Answers:** (1) No — the SPF pass is for `vendor-mailer.example`, which does not align with `harborridge.example`, and there is no DKIM signature to align instead. (2) Twelve lookups (6 + 3 + 3), over the limit of ten, so evaluation returns `permerror` and most receivers treat the domain as having no SPF — it fails open. (3) `p=none` asks receivers to report but change nothing; advance only when aggregate reports show the remaining failing volume comes from sources you can explain (spoofers and known forwarding). (4) Revoke active sessions and tokens; check for attacker-created mailbox rules such as external forwarding; check for newly registered MFA methods.
