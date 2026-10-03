---
course_id: cyb130
media_id: cyb130-v02
type: video-script
title: "Choosing MFA for Four Populations at Northbay Cold Storage"
format: whiteboard
target_runtime: "7 min"
related_lessons:
  - cyb130-03
objectives:
  - Select and roll out an MFA method appropriate to a stated user population and risk level
competency_ids:
  - D2-S1-C04
---

## Purpose
After watching, the learner can use the six inputs (account risk, device reality, where they work, accessibility, cost, recovery) to pick a defensible primary and alternate MFA method for a population, and can name the edge accounts a rollout must plan for.

## Audience and prerequisites
cyb130-03, through "Choosing for a population, not for yourself".

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Whiteboard titled "Northbay Cold Storage, 240 staff", with four empty swim lanes. | "The most common MFA mistake is picking the strongest method and mandating it everywhere. That's how a rollout locks out a warehouse on Monday and gets switched off by Tuesday. Let's do it properly for Northbay Cold Storage." |
| 0:25 | Six input labels down the left: Risk · Devices · Where · Accessibility · Cost · Recovery. | "Six inputs. What can the account do? What devices do the people actually have? Where do they work? Can everyone use the method? What does it cost to issue and replace? And what happens when someone loses it at seven on a Monday morning?" |
| 0:55 | Lane 1: "IT admins + finance approvers, 11". Risk marked HIGHEST. | "Lane one: eleven people who can grant access or move money. Risk dominates here. They need a phishing-resistant method, so a FIDO2 security key. And give each person two keys, so a lost key doesn't send them through a weaker reset path." |
| 1:40 | Lane 2: "Head office, 55, company laptop + phone". | "Head office: fifty-five people with company phones. Usability at scale matters, so push approval, but only with number matching. Typing the number on screen into the app defeats prompt fatigue. TOTP is the alternate for anyone who declines push." |
| 2:20 | Lane 3: "Warehouse, 160, shared terminals, no phones, gloves, cold store". Icons: no-phone, glove, snowflake. | "The warehouse is the hard one. A hundred and sixty people on shared terminals, no phones on the floor, gloves on, often no signal. 'Just use the app' isn't an answer. Hardware OTP tokens issued with the shift badge: no personal device, no network, quick at a shared terminal." |
| 3:05 | Lane 4: "Field engineers, 14, customer sites, no signal". | "Field engineers at customer sites with no signal. Anything that needs the network fails exactly when they need it. Use a certificate on the company laptop, unlocked with a PIN or fingerprint on the device, so the pair is possession plus knowledge or inherence and needs no signal. A hardware token is the offline backup for a failed laptop." |
| 3:40 | Margin notes added: Contractors · Break-glass · Service accounts · Shared accounts. | "Now the four things reviewers look for, because people forget them. Contractors get their population's method, against a record with an expiry date. Break-glass: two emergency admin accounts with credentials split in a safe and a hardware key, excluded from conditional access so a bad policy can't lock everyone out, and alerting on any use. Service accounts can't approve prompts, so use managed identities, certificates, or vaulted secrets instead of MFA. Shared accounts get converted or documented before rollout, not during it." |
| 4:50 | Rollout ladder drawn: Inventory → Fix exclusions → Admins first → Mixed pilot → Verified enrollment → Comms ×3 → Grace then enforce → Desk ready → Measure → Review exceptions. | "Then roll it out in order. Admins go first: the smallest group, the highest risk, and the people best able to fix problems. Pilot with a mixed group that includes the warehouse, not just IT. And enroll with verified identity. An open self-enrollment page means the attacker can register their own phone." |
| 5:50 | "Recovery" circled in red with the word "WEAKEST LINK" written beside it. | "Finally, recovery. If the service desk restores access after two questions from the personnel file, your real MFA strength is those two questions. Verify through a different channel, time-box any bypass, and alert the user whenever a new method is added to their account." |
| 6:35 | Completed board. | "That's a defensible allocation: every method is tied to a property of the population. Now do the same for Meridian Regional Clinic in Part 1." |

## On-screen assets and B-roll
- Whiteboard template with swim lanes and the six inputs; icons for no-phone, glove, no-signal.
- Optional B-roll: a security key, a hardware token clipped to a badge, and a shared warehouse terminal.

## Accessibility
- Captions. All whiteboard text is read aloud.
- "WEAKEST LINK" is written in words, not shown by colour alone. Icons have text labels.
- High-contrast markers, filmed straight on with no glare.

## Check for understanding
1. Why do warehouse operators get hardware tokens instead of an app? *No phones on the floor, shared terminals, gloves, and unreliable signal. A token needs no personal device and no network.*
2. What should replace MFA for service accounts? *Managed identities, certificates, or vaulted secrets, with an owner and monitoring.*
3. Why give administrators two security keys? *A lost key then doesn't push them into a weaker reset path.*
