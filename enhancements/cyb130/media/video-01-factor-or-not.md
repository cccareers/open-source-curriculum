---
course_id: cyb130
media_id: cyb130-v01
type: video-script
title: "Factor or Not? Classifying Credentials in Under a Minute"
format: talking-head
target_runtime: "5 min"
related_lessons:
  - cyb130-02
objectives:
  - Distinguish authentication, authorization, and accounting, and name the factor type any given credential belongs to
competency_ids:
  - D2-S1-C04
---

## Purpose
After watching, the learner can sort a ticket into authentication, authorization, or accounting, classify any credential as knowledge, possession, inherence, or "not a factor", and tell whether a combination is genuine MFA.

## Audience and prerequisites
Learners starting cyb130-02. No setup needed.

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Presenter at a desk. Ticket on screen: "I can log in but I can't open the payroll folder." | "Here's a ticket: 'I can log in but I can't open payroll.' What's broken? If you said 'reset her password', you just fixed something that wasn't broken." |
| 0:15 | Three labels appear: Authentication · Authorization · Accounting. | "Every access ticket is one of three questions. Authentication: are you who you say? Authorization: given that you are, what may you do? Accounting: what did you do, and can we prove it? She logged in, so authentication worked. This is authorization: group membership and folder permissions." |
| 0:50 | Second ticket: "The shared svc-reports login stopped working after Sam left." | "Second ticket. A shared reporting login stopped working when someone left. Authentication broke because the password changed. The real problem is accounting: every action in the log says svc-reports, so nobody can tell which person ran the export." |
| 1:20 | Three columns: Know · Have · Are. | "Now factors. There are three categories of evidence: something you know, something you have, something you are. A factor is a category, not a product." |
| 1:40 | Rapid-fire cards, each flips to its answer: Password → Know. Authenticator app code → Have. SMS code → Have (weakest). FIDO2 key → Have (phishing-resistant). Fingerprint on laptop → Are (local unlock). | "Rapid fire. Password: know. Code from an authenticator app: have. It proves you control the enrolled phone. SMS code: also have, and the weakest kind. Security key: have, and bound to the real site. Fingerprint on a laptop: are. But it usually unlocks the device locally and is never sent to the service." |
| 2:30 | Cards: Corporate IP → NOT A FACTOR (context). Employee number → NOT A FACTOR (identifier). | "Two traps. A corporate IP range isn't a factor. It's a contextual signal, useful for policy but not proof. An employee number isn't a factor. It's an identifier, printed on half the documents in the building. If a service desk 'verifies' you with employee number and date of birth, that isn't authentication." |
| 3:05 | Equation cards: Password + security question = ✗ "Know + Know". Password + app code = ✓ "Know + Have". Smart card + PIN = ✓ "Have + Know". | "Multi-factor means different categories. Password plus security question? Two knowledge factors. That's one factor used twice. Password plus app code: knowledge plus possession, genuine MFA. Smart card plus PIN: possession unlocked by knowledge, MFA in one motion." |
| 3:40 | Phone with face unlock approving a push. Caption: "Possession, with a biometric unlock". | "Edge case: you unlock your phone with your face, then approve a push. Describe that as possession with a biometric unlock. Your face never leaves the phone. If the phone's unlock is weak, the possession factor is weak." |
| 4:10 | Pause card: "Classify: hardware OTP keyfob; recovery code printed at enrollment; one-time link emailed to corporate mailbox." | "Pause and classify these three." |
| 4:25 | Answers revealed. | "Keyfob: possession. Printed recovery code: knowledge in practice, because it's a secret you can read out. Treat it as strongly as a password. Emailed link: it proves access to the mailbox, which is usually protected by the same password, so it adds little. Lesson 03 covers why." |
| 4:50 | End card. | "Three As, three factor categories, and 'not a factor' for context and identifiers. Do Part 1 of the practice now and time yourself." |

## On-screen assets and B-roll
- Ticket mock-ups, flip cards for each credential, equation cards for combinations.
- Optional B-roll: a security key, a hardware OTP token, and a smart card on a desk.

## Accessibility
- Captions throughout. Every card's text is spoken.
- Ticks and crosses are paired with the words "MFA" or "not MFA" and the category names, so colour is never the only cue.
- The pause card is held for 10 seconds and read aloud.

## Check for understanding
1. "I can log in but the expense app says I can't approve." Which A? *Authorization.*
2. Is a PIN plus a password MFA? *No. Both are knowledge.*
3. Why is an employee number not an authenticator? *It's an identifier that isn't secret. It says who is being claimed but proves nothing.*
