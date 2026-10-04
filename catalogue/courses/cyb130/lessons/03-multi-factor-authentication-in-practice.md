---
lesson_id: cyb130-03
course_id: cyb130
pathway: cybersecurity-support-technician
title: Multi-Factor Authentication in Practice
order: 3
kind: lesson
competency_ids:
  - D2-S1-C04
objectives:
  - Select and roll out an MFA method appropriate to a stated user population and risk level
---

## Why a second factor exists

A password is a secret that has to be remembered by a human, typed into whatever screen appears to ask for it, and stored by every service that checks it. Each of those three properties fails in a predictable way. People reuse passwords across services, so one unrelated breach hands an attacker a list of usernames and passwords that may work on your systems. People type passwords into pages that look right, so a convincing login page collects them. Services store passwords badly, as lesson 02 described, so a stolen database becomes a stolen credential set.

None of those failures require any skill against *your* organization. They require patience and a list. That is the point: password-only authentication puts the entire security of an account on a single reusable secret that leaves your control the moment a user types it somewhere.

A second factor changes the arithmetic. Now a working password is not enough; the attacker also needs the physical thing the user holds. That is a fundamentally different problem, and for most attacks it is the end of the road. This is why "enable MFA" appears at or near the top of every security control list published in the last decade, and why cyber-insurance questionnaires now ask about it by name.

Your job in this lesson is not to be convinced — you already are. It is to **choose the right method for a specific population** and **get it deployed without breaking the organization**, because a technically superb MFA rollout that locks out the warehouse on a Monday morning gets switched off by Tuesday.

## The methods, ranked by what they resist

Every method below is stronger than a password alone. They are not equal to each other, and the differences matter when you write a recommendation.

**Email one-time codes.** A code sent to the user's mailbox. Weak, because the mailbox is usually protected by the same password you are trying to reinforce, and it is often reachable from anywhere. Acceptable only as a temporary bridge for a population that has nothing else, and it should be stated as an exception with an end date.

**SMS and voice one-time codes.** A code sent to a phone number. Genuinely useful, and by a wide margin better than nothing — but it is the weakest common possession method, for two reasons a technician should be able to state plainly: a phone number can be moved to a different device by someone who convinces a carrier to do it, and the message can be delivered to a screen that is visible without unlocking the phone. It is also a code the user can be talked into reading aloud. Use it where nothing better is possible, never for administrators, and always with a plan to move off it.

**Time-based one-time password apps (TOTP).** A code generated on the device from a shared seed and the current time, no network needed. Cheap, works offline, works on almost any smartphone, and after enrollment the seed is held only by the device and the authentication service; it is never sent again. Because the service holds a copy, the seed store itself needs protecting as carefully as a password store. Its weakness is that the code is a short string the user reads and types, so it can be typed into the wrong place, and it depends on the phone's clock being roughly right.

**Push approval.** The service sends a prompt to an app on the enrolled device and the user approves. Better usability than typing codes, and the approval carries context. Its weakness is a well-documented one: if the user is prompted repeatedly, someone eventually taps *approve* to make the buzzing stop. The mitigation is **number matching** — the login screen displays a number the user must enter into the app — plus showing the application, location, and time in the prompt, plus rate-limiting and alerting on repeated denials. Never deploy push without number matching if the platform supports it.

**Hardware one-time-password tokens.** A keyfob or card that displays a rotating code. No phone required, no network required, no personal device involved. Ideal for populations without smartphones, for shared-workstation environments, and for anywhere phones are not allowed. The costs are real: unit price, distribution, and replacement when one is lost or its battery dies.

**FIDO2 security keys and passkeys.** A cryptographic credential bound to the specific site it was registered with. The device signs a challenge; nothing reusable is transmitted, and because the credential only works for the domain it was created for, a lookalike login page gets nothing. This is what "phishing-resistant" means in practice, and it is the reason security keys are the recommended method for administrators everywhere. A **passkey** is the same underlying technology stored on a phone or laptop rather than a separate key, often synchronized across a user's devices — convenient, and worth confirming whether that synchronization is acceptable in your environment.

**Smart cards and certificate-based authentication.** A card holding a certificate, unlocked by a PIN. Two factors in one motion, phishing-resistant for the same reason FIDO2 is, and standard in government and clinical environments where the card is also the building badge. It requires a certificate infrastructure and readers, which is a real project rather than a setting.

**Biometrics.** In workforce identity, biometrics almost always appear as the *unlock* for a possession factor rather than as a factor sent to the service. That is a good design: the biometric stays on the device. Where a biometric genuinely is the factor — a palm reader on a door, a fingerprint terminal on a shop floor — remember the two properties from lesson 02: it cannot be reissued, and matching is probabilistic and must be tuned.

### The one-line summary

| Method | Phishing-resistant | Needs a phone | Needs network | Typical fit |
| --- | --- | --- | --- | --- |
| Email code | No | No | Yes | Bridge only, with an end date |
| SMS / voice code | No | Yes | Yes | Last resort; never for admins |
| TOTP app | No | Yes | No | Broad default for office staff |
| Push with number matching | No | Yes | Yes | Broad default where usability matters |
| Hardware OTP token | No | No | No | No-phone and shared-device populations |
| FIDO2 key / passkey | Yes | No | Yes | Administrators, high-risk roles |
| Smart card + PIN | Yes | No | Yes | Card-based environments, clinical, government |

"Phishing-resistant" here means the credential is bound to the site, so it cannot be replayed against a lookalike page. It is the single most useful column in the table when you are deciding what administrators get.

## Choosing for a population, not for yourself

The mistake to avoid is picking the strongest method and mandating it everywhere. Strength is only one of six inputs.

**Risk of the account.** What can this account do? An account that can reset other people's credentials, change group membership, or reach production data is categorically different from an account that reads the staff handbook. Administrative and finance-approval accounts get phishing-resistant methods, full stop. This is the input that should dominate.

**Device reality.** Does the population have a smartphone at work? Are personal phones permitted, and is it reasonable to require one? Warehouse floors, clinical areas, secure facilities, and manufacturing lines frequently answer no, and "just use the app" is not an answer there — it is how a rollout stalls. Hardware tokens exist precisely for this.

**Where they work.** A field technician in a basement has no mobile signal, which rules out SMS and push and leaves TOTP, a hardware token, or a certificate. A frontline worker sharing a terminal with eleven colleagues needs something fast that does not involve unlocking a personal phone eleven times an hour.

**Accessibility.** Some users cannot read a six-digit code quickly, cannot manipulate a small keyfob, or cannot use a fingerprint reader reliably. An accessible alternative is not a favour; in many jurisdictions it is a requirement, and it should be designed in from the start rather than granted as an exception later.

**Cost and logistics.** Hardware costs money to buy, ship, replace, and inventory. Software methods cost licensing and support time. A rollout with no budget line for replacement tokens will quietly convert to SMS within a year.

**Recovery.** Every method needs an answer to "what happens when the user loses it at 07:00 on a Monday." If your answer is "the service desk verifies them and resets," then the strength of your MFA is actually the strength of that verification process. More on this below, because it is where most designs are weakest.

### Worked example: four populations, one organization

Northbay Cold Storage runs three warehouses and a small head office. 240 staff. Here is a defensible allocation and, more importantly, the reasoning that makes it defensible.

| Population | Size | Constraints | Method | Why |
| --- | --- | --- | --- | --- |
| IT administrators, finance approvers | 11 | Company laptops, highest privilege | FIDO2 security key, with a second key as backup | Phishing resistance is non-negotiable for accounts that can grant access or move money; two keys removes the reset path as a weak point |
| Head-office staff | 55 | Company laptops, company phones | Push with number matching, TOTP as alternate | Usability at scale; number matching removes the fatigue problem; TOTP covers anyone declining push |
| Warehouse operators | 160 | Shared terminals, no phones on the floor, gloves | Hardware OTP tokens issued with the shift badge | No personal device required, works with no signal in a cold store, fast at a shared terminal |
| Field service engineers | 14 | Customer sites, often no signal, company laptop | Certificate on the laptop plus a hardware OTP token | Signal cannot be assumed, so anything network-dependent is unusable |

Now the parts of the answer that are easy to forget and that a reviewer will look for:

- **Contractors and temporary staff** get the same method as the population whose work they do, issued against a record with an expiry date. Lesson 05 explains why the expiry matters more than the method.
- **Break-glass accounts** — two emergency administrative accounts, credentials split and held in a physical safe, MFA registered on a hardware key stored with them, excluded from conditional-access rules so a policy error cannot lock everyone out, and alerting on any use. Every environment needs these, and every environment forgets them until the day a misconfigured policy locks out the whole administrator group.
- **Service accounts** are not people and cannot approve a prompt. They are handled with managed identities, certificates, or vaulted secrets rather than MFA. Naming this explicitly in a rollout plan prevents the classic mistake of "we enforced MFA for everyone" followed by every scheduled job failing at midnight.
- **Shared and generic accounts** must be identified before the rollout, not during it. Each one is either converted to named accounts or documented as an exception with an owner and a review date.

## Layering: conditional and risk-based access

Prompting for a second factor on every single action is secure and unusable; prompting once a month is usable and weak. Modern platforms resolve this with policy that varies the requirement by context.

The inputs are the contextual signals from lesson 02: which application is being reached, whether the device is managed and healthy, whether the network is a known corporate range, the location and its plausibility relative to the last sign-in, the sensitivity of the action being attempted, and any risk score the platform calculates.

The outputs are: allow, allow with a second factor, allow only from a managed device, require re-authentication regardless of session age, or block.

Three patterns are worth knowing by name.

**Step-up authentication.** The session is good enough to read the expense queue and not good enough to approve a payment. Approving triggers a fresh factor prompt. This is the right way to protect a handful of dangerous actions without taxing every action.

**Trusted-device or managed-device requirements.** Access to sensitive applications only from a device the organization manages. This converts the device itself into a possession factor and is often more effective than adding another user-facing prompt.

**Session lifetime.** How long a token remains valid before re-authentication is a security control that most people never think about. Long sessions are convenient and mean a stolen session survives longer; short sessions on a shared terminal are a helpdesk generator. Set it deliberately, per population, and write down why.

One caution to carry into the audit project: conditional-access policies accumulate exclusions. Every "temporarily exclude this group" becomes permanent unless someone reviews it. A policy list with six exclusion groups nobody can explain is a finding, and it is a common one.

## Rolling it out without breaking the organization

MFA rollouts fail for organizational reasons far more often than technical ones. A workable sequence:

**1. Inventory first.** Every account, classified as human or service, named or shared, employee or contractor, with its population and its device situation. You cannot design method allocation without this, and building it usually surfaces accounts nobody knew existed.

**2. Fix the exclusions before you start.** Shared accounts converted or documented. Service accounts moved to a non-interactive credential model. Break-glass accounts created, tested, and stored. Doing this after enforcement means doing it during an outage.

**3. Protect administrators first.** The smallest population, the highest risk, the most technically capable users, and the group most able to fix problems they encounter. Enforce phishing-resistant MFA for every administrative account before you touch anyone else. If the project is cancelled after step 3, it will still have delivered most of the risk reduction.

**4. Pilot with a mixed group.** Twenty to forty people spanning every population, deliberately including the least technical users and the hardest physical environment. A pilot of the IT department tells you nothing, because IT can solve its own problems.

**5. Enroll with verified identity.** Enrollment is the moment an attacker would most like to be present, because registering their own device is a durable form of access. Enrollment should happen from a managed device or a corporate network, or in person against photo identification, and every registration event should generate a notification to the user and a log entry to the security team. An MFA deployment with an open self-enrollment page reachable from anywhere is only as strong as the passwords it was meant to replace.

**6. Communicate three times.** Announce, remind a week out, remind the day before. Say what is changing, when, what the user must do, how long it takes, and exactly who to call. Include a screenshot-free written walkthrough that a person can follow over the phone.

**7. Run a grace period, then enforce.** Allow registration for a defined window with reminders, then require it. An indefinite grace period is not a rollout; it is a suggestion.

**8. Prepare the service desk before enforcement.** Written procedures for the four calls they will get: I did not receive a code, I lost my device, I got a new phone, and I am being prompted repeatedly and did not try to log in. That last one is a security event, not a support call, and the desk must know to escalate it rather than help the user make it stop.

**9. Measure.** Registration percentage by population, authentication failures by method, service-desk contacts per hundred users, number of accounts still exempt, and days each exemption has been open. Report weekly during rollout and monthly afterwards.

**10. Review the exceptions.** Every exemption gets an owner, a reason, and an expiry date. The list should shrink. If it grows for two consecutive reviews, escalate it, because an exemption list that only grows is an MFA deployment quietly turning back into password-only.

### Recovery is where designs fail

Consider what happens when a user loses their only factor. If the service desk can restore access after a phone call and two questions from the personnel file, then the real authentication strength of the entire organization is those two questions. This is not hypothetical; it is a recurring pattern in published incident reports, and it is the reason the reset process deserves as much design attention as the method itself.

Reasonable controls, in rough order of effort:

- Issue **two factors at enrollment** where possible — a primary security key and a backup key, or a token plus recovery codes generated in the user's presence and stored where they can reach them. A user who can self-recover never calls.
- Verify identity through a **different channel** than the one being reset: a video call showing photo identification, an in-person visit, or confirmation from a named manager through a channel the requester does not control.
- Require **manager or sponsor approval** for privileged account resets, and never let one person both request and approve.
- **Time-box** any temporary bypass. A temporary access pass that lasts eight hours and can be used once is fine; a permanent exemption granted because someone was travelling is not.
- **Log and alert** on every reset, factor registration, and factor removal, and send the affected user a notification they did not request. An unexpected "a new authentication method was added to your account" message is one of the most useful detections you will ever configure, and it costs nothing.

## Practice

**Part 1 — Allocate methods for a described organization.** Meridian Regional Clinic has 252 staff, 40 visiting specialists, and 18 non-human accounts — 310 identities in total:

- 6 IT staff and 2 clinical-systems administrators, all with company laptops
- 24 back-office staff (billing, scheduling, HR) at desks with company laptops
- 190 clinical staff who share workstations at nursing stations, move between rooms constantly, wear gloves, and are not permitted personal phones in treatment areas
- 40 visiting specialists who work at the clinic two or three days a month, use their own laptops, and are not employees
- 30 facilities and catering staff who use a shared terminal in a back office once or twice a shift
- 18 non-human accounts running scheduled jobs, backups, and an interface to the laboratory system

Produce a table with one row per population and columns for: recommended primary method, recommended alternate, the constraint that decided it, the recovery path when the factor is lost, and one thing that would make you change the recommendation. Then answer:

- Which population is the hardest, and what is the specific property that makes it hard?
- What do you do about the 18 non-human accounts, and why is "enforce MFA" the wrong answer?
- Which two populations would you enforce first, and why those two rather than the largest group?

**Part 2 — Write the conditional-access rules.** For the same clinic, write four policy statements in the structure *when [conditions], require [outcome], because [reason]*. At least one must be a step-up rule for a specific sensitive action, one must involve device state, and one must define session lifetime for a shared workstation. For each, state one legitimate user activity that will be inconvenienced and how you would handle the complaint without weakening the rule.

**Part 3 — Design the recovery process.** Write the service-desk procedure for "I lost my authentication device," as a numbered set of steps a new desk technician could follow. It must cover: how the caller's identity is verified, what differs when the caller holds an administrative account, what is granted and for how long, what is logged, who is notified, and the exact circumstance in which the technician must refuse and escalate instead. Then write the two-sentence rationale you would give a manager who complains that the process is too slow.

**Part 4 — Build the rollout plan.** Produce a one-page plan for the clinic covering: the pre-work that must complete before any enforcement, the order of populations with a rough week number for each, the length of the grace period, the four service-desk procedures you would write, five metrics you would report weekly, and the criteria that would make you pause the rollout. Include the break-glass account design in two or three sentences: how many, how the credentials are protected, where they are stored, what policies they are excluded from, and what happens when one is used.

**Part 5 — Critique a real enrollment flow.** Enroll a second factor on any account you legitimately control, and write up the flow as an assessor would: what identity verification was required before enrollment, whether the enrollment could have been performed by someone who had only the password, whether you were notified that a factor had been added, what recovery options were offered, and whether any of those recovery options are weaker than the factor itself. Finish with the single change that would most improve the flow.

**Deliverable:** one document containing the population table with its three answers, the four policy statements, the recovery procedure with its rationale, the rollout plan, and the enrollment critique.

## Check your understanding

1. Which method should administrators get, and what property decides it? *A FIDO2 security key or passkey (or a smart card). It is phishing-resistant because the credential is bound to the site.*
2. A user reports repeated push prompts they did not start. Is this a support call? *No. It is a security event. Escalate it, and do not help the user make the prompts stop.*
3. Why does the reset process decide the real strength of an MFA deployment? *If the desk restores access after weak verification, an attacker only needs to pass that verification, not the factor.*
