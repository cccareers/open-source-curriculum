---
lesson_id: cyb250-04
course_id: cyb250
pathway: cybersecurity-support-technician
title: Building an Awareness Program
order: 4
kind: lesson
competency_ids:
  - D5-S1-C05
  - D4-S1-C03
objectives:
  - Design an awareness curriculum and a reporting procedure that fit a described workforce
---

## What a program is, and what most organizations have instead

Most organizations have a compliance artifact: a forty-minute video assigned every January, a completion percentage in a spreadsheet, and an auditor who is satisfied. It is not useless — it establishes that people were told — but as a control it is close to inert. It teaches once a year, in a format nobody retains, decoupled from the moment of risk, to an audience that shares nothing except an employer.

A program is different in four specific ways, and you should be able to state them in an interview.

1. **It is derived from risk**, not from a content vendor's module list. What you teach comes from what is actually being attempted against your organization and what would hurt if it succeeded.
2. **It is segmented.** A payments clerk, a shift supervisor with no company email, a software engineer, and an executive assistant do not face the same attacks and should not receive the same content.
3. **It is continuous and short.** Repeated small exposures beat one long one, and the distance between teaching and the moment of risk is itself a design variable.
4. **It is measured on behavior, not completion.** Completion measures attendance. Lesson 05 is about the alternative.

Underneath all four is the reporting path, and this is worth stating baldly: **if you can only build one thing, build the reporting procedure.** Awareness content that improves recognition without a fast, cheap, blameless way to act on it produces people who notice attacks and do nothing. The single most valuable behavior in the whole discipline is a human being telling you about a message within minutes.

## Start from the workforce, not the syllabus

Before writing a single module, characterize the population. The questions that change the design:

- **How do people receive work communication?** Everyone with a mailbox is the easy case. Deskless, shift-based, and field workers often have no corporate mailbox at all, and every attack against them arrives on a personal phone where you have no controls and no visibility.
- **Who can move money, change identity records, or grant access?** Finance, payroll, HR, the service desk, and anyone with administrative rights are a small group holding most of the loss potential. They get more, and different, training.
- **Who is publicly visible?** Executives, sales, recruiters, support staff whose addresses are on the website. High reconnaissance surface.
- **What languages, literacy levels, and access needs exist?** Content that only works in one language, or only as a video with no captions, or only on a desktop browser, silently excludes part of the workforce — usually the part with the least support.
- **What are the real constraints?** Shift patterns, seasonal peaks, union or works council agreements, contractor status, regulatory training obligations already competing for the same hour.
- **What is the incident history?** Your own reported-message data, your own near misses, your own losses. This is the most persuasive curriculum input you will ever have and the one most programs ignore.

From that you build an audience matrix. A workable one for a mid-sized organization:

| Audience | Primary exposure | Emphasis | Cadence |
| --- | --- | --- | --- |
| All staff | Bulk phishing, smishing, credential pages | Recognize, verify out of band, report fast | Onboarding, then short monthly touch |
| Finance and procurement | BEC, invoice and vendor fraud | Payment-change verification procedure, dual authorization, callback discipline | Onboarding, then quarterly deep session |
| HR and payroll | Payroll diversion, data BEC | Identity verification for record changes, data request handling | Quarterly |
| Executives and assistants | Whaling, impersonation, deepfake voice | Authority-borrowing, out-of-band norms, delegation rules | Twice yearly, briefed individually |
| Service desk and IT | Vishing, reset and MFA-reset fraud, quid pro quo | Caller verification standard, no-exception reset policy | Quarterly, plus scenario drills |
| Developers and admins | Targeted lures, token and session theft, dependency and repo bait | Phishing-resistant auth, session revocation, code and package hygiene | Twice yearly |
| Deskless and field staff | Smishing, personal-device attacks, physical tailgating | Reporting from a personal phone, badge and door norms | Onboarding, then short in-person at shift briefings |
| Contractors and temps | Everything, with less context | Reporting path, who to trust, scope of access | Day one, mandatory |

Two design notes on that table. **New starters are the highest-risk cohort in any organization** — no relationships, no baseline for what is normal, and strong motivation to be helpful — so onboarding is the single highest-leverage slot you own. And **contractors are routinely excluded from training and routinely targeted**; if your program cannot reach them, say so in writing as a known gap rather than letting it be discovered later.

## Curriculum: what to teach, how often, in what form

**Content, ranked by return.** Given limited attention, teach in this order:

1. **How and when to report** — the mechanism, that speed matters more than certainty, and that reporting a false alarm is a success not an embarrassment.
2. **Verify out of band** — the one habit from lesson 02 that generalizes to every channel and every future technique.
3. **Recognizing pressure** — urgency, authority, fear, and escalating small asks, taught as structure rather than as a list of spelling tells.
4. **Role-specific procedures** — payment-change verification, caller identity verification, record-change verification. These are where the money is.
5. **Credentials and authentication** — password manager use, why an approved MFA prompt you did not trigger is a report-now event, what phishing-resistant means.
6. **Everything else** — physical security and tailgating, data handling, safe use of personal devices, travel and public networks.

**Cadence.** Short and spaced beats long and annual. A defensible baseline: a substantive onboarding session, one five-minute touch per month for everyone, one deeper role-specific session per quarter for high-exposure groups, and an annual policy acknowledgement to satisfy the compliance requirement without pretending it is the program.

**Modality mix.** Vary it, because monotony is what people tune out.

- *Microlearning* — two to five minutes, one behavior, delivered where people already are.
- *Live sessions* — the highest-impact format and the most expensive; save them for role-specific procedures and for question-and-answer, which is where the real gaps surface.
- *Just-in-time nudges* — the external-sender banner, the payment-change reminder that appears in the finance workflow, the warning on first contact with a new domain. Teaching at the moment of risk outperforms teaching in advance by a wide margin, and it is usually the cheapest thing you can build.
- *Scenario walkthroughs* — a real, anonymized incident from your own organization, told as a story. People remember stories about their colleagues and forget generic examples entirely.
- *Champions network* — a named, willing person in each team who answers the small questions and relays what people are actually seeing. This is how you get intelligence out of a population that will not open a ticket.

**Accessibility is a design requirement, not a courtesy.** Captions and transcripts, plain language at a reading level appropriate to the audience, translated material where the workforce is multilingual, content that works on a phone, and no assumption that everyone has a desk or a corporate mailbox.

## The reporting procedure

Treat this as the program's core deliverable. Every design decision has one criterion: **reduce the cost of reporting, in seconds and in social risk.**

**Make the mechanism singular and obvious.** One button in the mail client that submits the original message with headers, and a fallback that works when the button does not: a monitored address, a chat command, a phone number. Publish all of them in one place, and print them on something physical for people with no mailbox.

**Cover every channel.** Mail is the easy case. Your procedure must also tell a person what to do about a text message, a phone call, a QR code on a poster, a chat request, a stranger at a door, and a USB drive in a lobby. If the procedure only mentions email, staff will conclude that the other channels are not your problem.

**Reporting is a duty, and it is never punished.** State both, in the same paragraph, in the policy: staff are required to report, and no one will be disciplined for reporting in good faith, for reporting something harmless, or for reporting their own mistake. Then behave that way without exception, because the first time a person is disciplined for a click, every future report in that department gets slower.

**Acknowledge, always.** An automatic receipt within seconds and a human outcome within a day or two — "this was a real credential-harvesting attempt, we removed it from 214 mailboxes." Unacknowledged reports stop arriving.

**Set and publish response commitments.** Something like: acknowledged automatically on receipt; triaged within one business hour; anything where a person interacted handled immediately; reporter told the outcome within two business days. Commitments you can meet, published so people know what to expect.

**Design for the person who already clicked.** They are frightened, and their instinct is to wait and see. Give them an explicit, separate, unmissable path — "if you entered a password or approved a prompt, call this number now, day or night, you will not be in trouble" — and mean it. Minutes here are worth more than any other minutes in your program.

**Escalation is defined in advance.** Who receives what, at what hour, with what authority to act. Use the routing table from lesson 03 as your starting point and name real roles rather than individuals.

## Writing it down as policy and procedure

An awareness program that lives in a slide deck disappears when its owner changes jobs. It has to exist as governance documents. Policy craft is cyb150's subject; what you need here is the applied shape.

**Where the obligations live.** Typically three documents: an *acceptable use policy* that already exists and gets a short awareness and reporting clause; a *security awareness and training policy* that establishes the program, its scope, its owner, and its mandatory elements; and a *suspicious activity reporting procedure* that is the operational how-to. Keep policy and procedure separate — policy states the requirement and changes rarely, procedure states the steps and changes whenever the tooling does.

**Sections the awareness policy needs.** Purpose; scope, stated explicitly enough to answer whether it covers contractors, temporary staff, and non-mailbox workers; roles and responsibilities; the policy statements themselves; exceptions and how one is obtained; review cadence and owner; and related documents.

**Write statements that are testable.** "All staff shall be security aware" cannot be audited or failed. "All staff shall complete security awareness induction before being granted network access, and shall report suspected social engineering attempts through the mechanisms in the Suspicious Activity Reporting Procedure without delay" can be. A statement that cannot be observed is decoration.

**Put the non-punitive clause in the policy, not in a slide.** It is a commitment the organization makes, and it belongs where commitments are recorded. Pair it with the boundary — good-faith reporting and honest mistakes are protected; deliberately bypassing a control or concealing an incident is a separate matter handled under existing disciplinary process.

**Name the owner and the review date.** An unowned policy is a dead policy. Annual review, or on material change to the threat landscape or the tooling.

## Simulations, and the ethics that make them defensible

A phishing simulation is a legitimate and useful instrument. It is also the part of this work most likely to damage trust if it is run carelessly, and the damage is durable — a workforce that feels tricked by its own security team stops cooperating with it for years. Design the program; do not improvise a campaign.

**Non-negotiable constraints. All of them, every time.**

- **Written authorization before anything is sent.** Named approving executive, documented scope, dates, audiences, and the specific consent to send simulated lures to staff. No verbal approval, no "the security manager said it was fine."
- **Involve HR, legal, and any works council or union representation during design**, not after a complaint. In some jurisdictions employee monitoring and testing carries specific legal obligations; find out before, not after.
- **The existence of the program is announced to everyone.** Individual campaigns are not pre-announced, but the fact that simulations happen, why, and what results are used for is public knowledge and is stated in the policy. There is a large difference between "we test our defenses and you may occasionally receive a simulated message" and an ambush.
- **Results are never punitive.** No discipline, no naming, no leaderboards of failures, no manager notification framed as a performance issue. Results drive content and process changes. This is a written rule, and the moment it is broken the program's data becomes worthless because behavior changes to avoid the test rather than the attack.
- **No lures that exploit personal distress.** No fake layoffs or redundancy notices, no fake bonuses, raises, or payroll errors, no fake medical, benefits, or family emergencies, no fake disciplinary actions, no charitable or disaster appeals, no impersonation of a named real employee, and nothing touching a protected characteristic. The test of a lure is whether you would be comfortable reading it aloud to the affected staff afterwards. If not, do not send it.
- **Data minimization.** Collect what the metric needs and no more. Report aggregate and cohort results; hold individual-level data only as long as it takes to offer support, restrict who can see it, and say in the policy how long it is kept.
- **Exclusions are planned.** People on leave, staff in acute personal circumstances known to HR, and safety-critical roles at safety-critical moments. Have a documented way for a manager to request exclusion without explaining why.
- **Immediate, non-humiliating debrief.** Anyone who interacts lands on a page that says plainly what happened, what the indicators were, what to do if this had been real, and that they are not in trouble. Short, calm, useful. Never a scolding, never a countdown, never a score.
- **Calibrate difficulty deliberately, and interpret honestly.** A sufficiently good lure catches nearly everyone, including you, so a punishing campaign proves only that the exercise was unfair. Run a mix, state the difficulty when you report the numbers, and never compare a hard campaign's click rate against an easy one's as if it were progress.

**Cadence and purpose.** Quarterly is a common rhythm; monthly for high-exposure roles is defensible. What is not defensible is running simulations as the entire program. A simulation is a measurement instrument and a rehearsal of the reporting behavior — it teaches almost nothing on its own, and the follow-up content is where the learning lives.

## Practice

You are designing the program for **Merrow Fields Logistics**: 480 staff across a head office of 90 (finance, HR, IT, sales, management), two depots running three shifts with 310 warehouse and driver staff who have no corporate mailbox and use personal phones, 40 field engineers, and around 40 seasonal contractors hired each autumn. Last year they lost a five-figure sum to a supplier bank-detail change, and the service desk resets roughly 60 passwords a week by phone with no formal caller verification. There is one part-time person available to run awareness and no budget for a content vendor.

**Part 1 — Audience and risk matrix.** Produce a table with one row per audience covering: primary exposure, the two or three behaviors you most need from them, modality, cadence, and how the content physically reaches them. The depot and contractor rows must not assume a mailbox. Add a one-paragraph note explaining which two audiences you would resource first and why, given one part-time person.

**Part 2 — A twelve-month curriculum.** Month by month, for all-staff content plus one high-exposure audience of your choice: topic, format, length, and the single behavior each item targets. Mark which items are new content and which are reused, and keep the total realistic for the staffing described. Then write three sentences justifying your sequence against the incident history given above.

**Part 3 — The reporting procedure.** Write it as a usable document, not a description of one: purpose, scope, what to report, how to report it through every channel including from a personal phone, what happens next with response commitments, the explicit path for someone who has already interacted, escalation with named roles, and the non-punitive statement. Under two pages. Then write the 100-word version that could be printed on a card for the depot notice board.

**Part 4 — Policy statements.** Draft five policy statements for the security awareness and training policy. Each must be testable — an auditor should be able to gather evidence for or against it — and at least one must cover contractors and one must cover the non-punitive commitment. Under each, write one line naming the evidence that would demonstrate compliance.

**Part 5 — Simulation program design.** One page. Cover: objectives and what the results will and will not be used for; who authorizes it and in what form; audiences and exclusions; cadence and difficulty mix; three lure themes you would use for this workforce and three you have ruled out with your reason for each; what the debrief page says; what data you collect, who sees it, and how long you keep it; and how the program's existence is communicated to staff. You are producing a plan for approval — do not write lure content, and do not send anything.

**Deliverable:** one document containing all five parts. Bring to your next session the single design decision you were least sure about and the argument on both sides.
