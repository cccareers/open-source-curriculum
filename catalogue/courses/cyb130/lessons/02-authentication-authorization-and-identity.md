---
lesson_id: cyb130-02
course_id: cyb130
pathway: cybersecurity-support-technician
title: Authentication, Authorization, and Identity
order: 2
kind: lesson
competency_ids:
  - D2-S1-C04
objectives:
  - Distinguish authentication, authorization, and accounting, and name the factor type any given credential belongs to
---

## Three questions, not one

Open any access-related ticket and you will find it is really one of three questions wearing the same clothes:

- **Authentication** — *are you who you claim to be?*
- **Authorization** — *given that you are, what may you do?*
- **Accounting** — *what did you actually do, and can we prove it later?*

Together they are usually written **AAA**. They happen in that order, they are enforced by different mechanisms, and confusing them is the reason a lot of access problems get "fixed" badly.

Here is why the distinction is not academic. A user calls the service desk: "I can log in but I can't open the payroll folder." That is not an authentication problem. Their password worked, their second factor worked, the directory issued them a session — authentication succeeded completely. The failure is authorization: the identity is genuine and simply is not entitled to that resource. If you treat it as an authentication problem you will reset a password that was never broken. If you treat it as an authorization problem you will look at group membership and folder permissions, which is where the answer is.

Now the reverse. A user reports that a shared reporting account "stopped working" after a colleague left. Authentication is the problem — the credential changed. But the deeper problem is accounting: a shared account means the log line for every action says `svc-reports`, and no log in the world can now tell you which human ran the export. Accounting failures are invisible until the day you need them, which is why they get neglected.

Hold onto this framing for the rest of the course. Lesson 03 is entirely about strengthening the first A. Lesson 04 is entirely about the second. Lesson 05 is about what happens to both over time, and the project asks you to check all three against reality.

## Identity, account, credential, entitlement

Four words that get used interchangeably in conversation and must not be in your notes.

An **identity** is the record of a person, a service, or a device that the organization recognizes. Maya Okonkwo, hired March 3, employee number 40881, works in Accounts Payable. There is exactly one of her.

An **account** is a usable login bound to an identity in some system. Maya may have several: a directory account for her workstation and email, a separate named administrative account if she has elevated duties, a login in the ERP system, a badge record in the physical access system. One identity, many accounts. When people say "she still has access," they almost always mean one of her accounts survived somewhere.

A **credential** is the thing that proves control of an account at login time. A password, a certificate, a security key, a fingerprint template registered on a laptop. Credentials are replaceable; identities are not.

An **entitlement** is a specific permission attached to an account: membership in a group, a role assignment, a share permission, a licence, a mailbox delegation. Entitlements are the raw material of lesson 04, and the thing that accumulates in lesson 05.

Two more distinctions worth getting right early.

**Identifier versus authenticator.** A username, an employee number, an email address, and a badge number are *identifiers* — they say who is being claimed, and they are not secret. A password or a key is an *authenticator* — it proves the claim. The failure mode to recognize is a system that treats an identifier as an authenticator. "Confirm your identity with your employee number and date of birth" is not authentication; both values appear on documents that circulate widely inside the organization. This exact pattern is how service desks get talked into resetting credentials for the wrong person, which is why lesson 03 spends real time on the reset process.

**Identification versus authentication.** Identification is the claim ("I am `mokonkwo`"). Authentication is the proof. A door that opens for anyone holding an unencoded badge identifies but does not authenticate.

## Factor types

An authentication **factor** is a category of evidence, not a specific product. There are three, and the classification question shows up constantly in audits, so learn to answer it without hesitating.

**Something you know** — knowledge. Passwords, PINs, passphrases, security questions, a pattern drawn on a screen, an account "secret word" the service desk asks for. Knowledge can be shared, guessed, written on a note, or extracted by convincing someone to say it out loud. It is the weakest category on its own, and it is the one users control least well.

**Something you have** — possession. A phone running an authenticator app, a hardware one-time-password token, a FIDO2 security key, a smart card, a certificate stored in a device's secure hardware, a registered device that receives a push prompt. Possession is stronger because stealing it usually requires being near the person or their device.

**Something you are** — inherence. Fingerprint, face, iris, palm vein, and — more loosely — voice. Biometrics are convenient and non-transferable, and they carry two properties you must state whenever you recommend one: they cannot be reissued if compromised (you cannot change your fingerprint), and they are matched probabilistically, so every deployment has a false-accept and false-reject rate that must be tuned deliberately.

You will also hear **somewhere you are** (network location, GPS, a corporate IP range) and **something you do** (typing rhythm, behavioural patterns). Treat these as *contextual signals*, not factors. They are excellent inputs to a risk decision — you will use them in lesson 03 under conditional access — but on their own they do not prove control of an account, and calling location a "factor" in an audit report will get the report corrected.

### Multi-factor means different categories

The rule is simple and constantly violated: **multi-factor authentication requires evidence from two or more different categories.** A password plus a security question is one factor twice — both are knowledge. A password plus a PIN is one factor twice. A password plus a code from an app on a registered phone is genuine MFA: knowledge plus possession.

Two edge cases you should be able to argue.

A **smart card with a PIN** is genuine MFA in a single motion: the card is possession, the PIN unlocks it, and the PIN alone is useless without the card. This is why smart cards remain standard in government and healthcare environments.

A **phone unlocked with a fingerprint that then approves a push** is a possession factor whose local unlock happens to be biometric. The biometric never leaves the device and is not transmitted anywhere — it is gating the device, not authenticating to the service. Describe it as possession with a biometric unlock, because that is what an auditor needs to know: if the device unlock is weak, the possession factor is weak.

### Classification practice, worked

| Credential | Factor type | Note |
| --- | --- | --- |
| Password | Knowledge | Baseline; never sufficient alone for anything sensitive |
| PIN on a keypad | Knowledge | Short knowledge secret |
| Security question | Knowledge | Answers are often public or guessable |
| Code from an authenticator app | Possession | Proves control of the enrolled device |
| Code delivered by SMS | Possession | Weakest possession method; see lesson 03 |
| Push approval on a registered phone | Possession | Strength depends on whether the prompt requires number matching |
| Hardware OTP token (keyfob) | Possession | No network dependency; good for shared or offline environments |
| FIDO2 security key / passkey | Possession | Bound to the site, so it resists credential-interception attempts |
| Smart card | Possession | Almost always paired with a PIN |
| Client certificate on a laptop | Possession | Identifies the *device*, often used alongside a user factor |
| Fingerprint on a laptop | Inherence | Usually a local unlock, not a factor sent to the service |
| Corporate IP address | Not a factor | Contextual signal |
| Time of day | Not a factor | Contextual signal |
| Employee number | Not a factor | Identifier, not authenticator |

Cover the middle column and work down the list until you can do it cold. This classification is the first thing an access-control audit asks of you.

## Where identity actually lives

Authentication has to check the credential against something. That something is a **directory** — a database of identities, accounts, groups, and their attributes, purpose-built for enormous numbers of reads and comparatively few writes.

Directories are hierarchical. A **domain** or **tenant** is the administrative boundary. Inside it, objects live in containers (organizational units, folders, groups) that exist so policy and delegation can be applied to a branch rather than object by object. Every object has a unique identifier that never changes even if the person's name does — a distinguished name, an object GUID, a subject identifier. Learn to look for that immutable identifier, because names get reused and identifiers do not.

Three access patterns you will meet:

- **Local accounts** live on one machine and are known only to it. Every workstation has some. They are the accounts nobody inventories and nobody deprovisions, and they are a standing audit finding.
- **Directory accounts** live centrally and are recognized by every system joined to the directory. One disable action affects everything joined.
- **Federated accounts** live in one directory but are *trusted* by an application elsewhere, which is the next section.

Ask, for any system you support: is this identity local, directory, or federated? The answer determines what happens when someone leaves, which is the whole of lesson 05.

### Protocols, at the level a technician needs

You do not need to implement these. You need to recognize the name on a ticket and know which of the three As it belongs to.

- **LDAP** — the query and update protocol for a directory. A "simple bind" is an authentication attempt; unencrypted binds put a password on the wire and belong in the bad-practice list below.
- **Kerberos** — ticket-based authentication inside a domain. A user authenticates once, receives a ticket, and presents tickets to services instead of re-sending a password. Clock skew breaks it, which is why "check the time" is a real first step on Kerberos tickets.
- **RADIUS** and its successors — authentication for network access: wireless, VPN, switch ports. It is the classic AAA protocol and does all three As by design.
- **SAML** and **OpenID Connect** — federation protocols for applications, covered below.
- **SCIM** — not authentication at all. It is the provisioning protocol that creates and removes accounts in an application. It belongs to lesson 05, and it is worth knowing now so you do not file it under authentication.

### Federation and single sign-on

Federation is the arrangement where an application trusts a separate system to do authentication on its behalf. Three roles:

- The **user** wants into an application.
- The **service provider** (or relying party) is that application. It holds no password for the user.
- The **identity provider** holds the identity, performs authentication, and issues a signed assertion or token that says "this is Maya, authenticated at 09:14, with a second factor present."

![Federated login flow between user, service provider, and identity provider, showing the redirect to the identity provider and the signed assertion returned to the application](./img/federated-login-flow.png)

The flow, in plain terms: the user requests the application; the application redirects them to the identity provider; the identity provider authenticates them (password, MFA, whatever policy says); the identity provider sends back a signed token; the application validates the signature and creates a local session. The application never sees the password. **SAML** carries this as a signed XML assertion and is common in established enterprise software; **OpenID Connect** carries it as a signed token layered on OAuth 2.0 and is common in newer and mobile applications.

Two related terms people mix up:

**Single sign-on** is the user-facing outcome: authenticate once, reach many applications without re-entering a credential. Federation is one way to achieve it; a Kerberos domain is another.

**Directory synchronization** is different again — copying or projecting accounts from one directory into another so both have a record. Synchronization creates accounts; federation decides who authenticates them. An environment can sync without federating, and the result is two places a password can live, which is a finding worth writing up.

Why federation matters defensively: it collapses authentication to one enforcement point. One MFA policy, one lockout policy, one place to disable an account, one log to review. The trade is concentration — the identity provider becomes the most valuable system in the organization, and its administrators are the highest-privilege people in it. That observation drives most of lesson 04's treatment of privileged roles.

## Credential storage: recognizing bad practice

Cryptographic depth belongs to net110's encryption work. What you need here is the ability to look at how a system stores credentials and say "that is not acceptable," with a reason.

**Plaintext storage.** The system can show you the password, or emails it to you on request, or a database column contains readable passwords. Anyone with read access to that store — a database administrator, a backup operator, an attacker with one query — has every user's credential. If a service can email you your existing password, it stores it recoverably. Finding.

**Reversible encryption.** Better than plaintext and still wrong for user passwords. If the system can decrypt, so can anyone who obtains the key, and keys live near the data that needs them. There are narrow legitimate uses (some legacy authentication protocols require it), and each one should appear on an exceptions register with a named owner rather than being switched on domain-wide because a single application asked.

**Unsalted hashes.** Hashing is one-way, which is right. Without a per-account **salt**, identical passwords produce identical hashes, so one look at the table shows which accounts share a password, and precomputed lookup tables apply to the whole file at once. Salting is not optional.

**Fast hashes.** A general-purpose hash designed for speed is the wrong tool for passwords precisely because it is fast. Password storage wants a deliberately slow, memory-hard function with a tunable work factor. You will not choose the algorithm; you should be able to ask "what function, what work factor, when was it last raised?" and recognize an unsatisfactory answer.

**Credentials in the wrong places.** Passwords in scripts, in scheduled-task definitions, in configuration files, in documentation pages, in ticket bodies, in a spreadsheet on a shared drive named `passwords`. This is the most common real finding you will personally encounter, and it is a routine part of an access-control audit. The remediation belongs to a secrets-management or privileged-access-management tool, which lesson 04 names as the next control up.

**Passwords on the wire.** An unencrypted LDAP bind, an internal web login served over plain HTTP, a legacy protocol that transmits a weak hash. Anything that puts a reusable credential on a network segment where it can be read is a finding regardless of how well it is stored at rest.

Note what is *not* on this list: password composition rules. Current guidance from mainstream standards bodies has moved away from forced periodic rotation and mandatory character classes toward length, screening against known-breached password lists, and MFA. If you find a policy demanding a complex password changed every 30 days with no MFA, the finding is the missing MFA, not the password rules.

## Accounting: the third A

Accounting is the record. It is boring right up until the hour it is the only thing that matters.

A useful authentication log entry answers six questions: **who** (the account, ideally with its immutable identifier), **what** (logon, logon failure, privilege use, group change), **when** (with a synchronized clock and a stated time zone), **where from** (source address, device, application), **how** (which authentication method and whether a second factor was satisfied), and **outcome** (success, failure, and the failure reason).

Three properties make the record trustworthy: logs are forwarded off the originating system so that a compromised host cannot erase its own history; the retention period is longer than your realistic time to discover an incident; and clocks are synchronized so events from different systems can be placed in order. Those three are audit questions in their own right, and you will ask them in the project.

Two accounting failures to name whenever you see them. **Shared accounts** destroy attribution — the log is technically complete and forensically useless. **Unlogged authorization changes** are worse than unlogged logins: knowing that someone was added to the administrators group at 02:40 is often the entire investigation.

## Reading a login flow

Practice tracing where each A happens. A user opens the expense application from a coffee shop:

1. The application sees no session and redirects the browser to the identity provider. *No A yet — this is routing.*
2. The user submits their username and password. *Authentication, factor one, knowledge.*
3. Policy sees an unrecognized network and requires a second factor; the user approves a number-matched push on their enrolled phone. *Authentication, factor two, possession.*
4. The identity provider writes a success event with source address and methods used. *Accounting.*
5. The identity provider issues a signed token containing the user's identifier and group claims.
6. The application validates the signature and reads the claims. *Still authentication — it is verifying the assertion.*
7. The application maps the group claim `expenses-approvers` to the approver role and shows the approval queue. *Authorization.*
8. The user approves a $4,200 expense; the application records the actor, the record, and the timestamp. *Accounting.*
9. The user tries to open the finance administration page and is refused. *Authorization, working correctly.*

Step 9 is the one to remember. A refusal is not a bug report. It is the control doing its job, and the correct response to it is to find out whether the person is entitled — never to widen a permission until the error stops.

## Practice

**Part 1 — Classify twenty credentials.** For each item below, write the factor type (knowledge, possession, inherence, or "not a factor") and one sentence on the main weakness or caveat a technician should state when recommending it.

1. An eight-character password
2. A passphrase of four random words
3. A code from an authenticator app
4. A code sent by SMS
5. A push approval with number matching
6. A push approval without number matching
7. A FIDO2 security key
8. A smart card
9. The PIN that unlocks that smart card
10. A fingerprint reader on a laptop
11. Face recognition on a phone that then approves a push
12. A client certificate issued to a managed laptop
13. A hardware OTP keyfob
14. The answer to "what was your first school?"
15. Connecting from the corporate IP range
16. An employee number
17. A physical building badge
18. A recovery code printed at enrollment
19. A one-time link emailed to the user's corporate mailbox
20. A password manager's master password

Then answer: which three pairs from this list, combined, would **not** qualify as multi-factor authentication, and why?

**Part 2 — Label the As.** Take the nine-step login trace in this lesson and rewrite it for a different scenario: a field technician connects to the corporate VPN from a customer site using a certificate on their laptop plus a code from a hardware token, then attempts to open a network switch's configuration interface and is refused. Produce a numbered trace of at least eight steps, labelling each step as authentication, authorization, accounting, or none, and name the protocol family most likely involved at each authentication step.

**Part 3 — Audit an authentication record.** Below is a sample of authentication log lines from a directory. Working only from what the lines do and do not contain, write six findings and rank them by severity, with one remediation each.

```text
2026-03-14 09:14:02 SUCCESS user=mokonkwo src=203.0.113.44 method=password mfa=yes
2026-03-14 09:15:51 FAILURE user=admin src=198.51.100.9 method=password reason=badpassword
2026-03-14 09:15:53 FAILURE user=admin src=198.51.100.9 method=password reason=badpassword
2026-03-14 09:15:55 FAILURE user=admin src=198.51.100.9 method=password reason=badpassword
2026-03-14 09:16:10 SUCCESS user=admin src=198.51.100.9 method=password mfa=no
2026-03-14 09:41:38 SUCCESS user=svc-reports src=10.20.4.7 method=password mfa=no
2026-03-14 11:02:17 SUCCESS user=svc-reports src=10.20.9.55 method=password mfa=no
2026-03-14 22:47:05 SUCCESS user=mokonkwo src=192.0.2.180 method=password mfa=no
```

Your findings must include at least one about attribution, one about a control that is present for one account and absent for another, and one about something the log format itself fails to record. For each finding, state whether it is primarily an authentication, authorization, or accounting problem.

**Part 4 — Inventory one system.** Pick any system you legitimately administer or study — a lab domain, a personal cloud tenant, a home router, a workstation. Produce a short table listing every account it holds, whether each is local, directory, or federated, what credential types each account can use, whether a second factor is possible for it, and when each last authenticated if the system records that. Finish with two sentences naming the account on that list that would cause the most damage if its credential were exposed, and what specifically limits that damage today.

**Deliverable:** one document containing the classification table with its follow-up answer, the labelled trace, the six ranked log findings, and the system inventory.
