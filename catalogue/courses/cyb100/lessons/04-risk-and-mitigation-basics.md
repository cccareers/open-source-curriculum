---
lesson_id: cyb100-04
course_id: cyb100
pathway: cybersecurity-support-technician
title: Risk and Mitigation Basics
order: 4
kind: lesson
competency_ids:
  - D1-S1-C02
objectives:
  - Rate a risk by likelihood and impact and choose a mitigation strategy for it
---

## The problem with a list of findings

At the end of lesson 03 you could produce ten findings about an organization. Handed to a practice manager or a firm's partners, that list produces one of two reactions: paralysis, or the decision to fix whichever item sounded most alarming. Neither is what you want, because neither is a decision about *this* organization's money and time.

Risk is the language that turns findings into decisions. It answers the only two questions a business owner actually has — **how likely is this, and how bad would it be** — and then it forces a choice from a short list of options. This lesson teaches that language, the decision, and what happens when the decision turns out to have been optimistic and an incident occurs anyway.

Note the scope. You are learning to rate a risk sensibly and pick a response you can defend. Formal risk-assessment methodology — the structured registers, quantitative models, and the process by which an organization governs risk over time — is a later course in this pathway and is deliberately not duplicated here.

## What risk actually means

**Risk is the possibility of loss, expressed as the combination of how likely an unwanted event is and how much harm it would cause.**

Three things follow from that definition, and each is a mistake people make.

**Risk requires all three of asset, threat, and vulnerability.** "We have an unpatched server" is a vulnerability, not a risk. "Ransomware" is a threat, not a risk. A risk is a sentence: *a criminal group encrypts the client file server via an unpatched internet-facing service, making seven years of tax records unavailable and possibly disclosed.* If you cannot write the sentence, you do not yet have a risk — you have a fragment. Get in the habit of writing risks as *[threat actor or event] exploits [weakness] affecting [asset], resulting in [harm]*. Vague risks get vague responses.

**Risk is about the future, so every rating is a judgement.** You are not measuring anything. Two competent people will rate the same risk differently, and that is acceptable as long as both can say why. What is not acceptable is a rating with no stated reasoning, because nobody can challenge it or update it later.

**Risk is owned by the business, not by you.** A technician identifies and rates; a manager or owner decides. This matters practically: your job is to make the decision *possible and informed*, not to make it. Writing "I told them and they ignored me" into a report is worse than useless. Writing "the practice manager accepted this risk on 14 March, on the basis that the affected records are also held on paper" is a professional artifact.

## Rating likelihood

Likelihood is how probable the event is within a stated period — usually the next twelve months. State the period, or the word is meaningless.

A five-point scale is normal, and words beat numbers for beginners because they force you to describe a scenario:

| Rating | Meaning |
| --- | --- |
| Rare | No realistic path with current conditions; would need an unusual combination |
| Unlikely | Possible, but requires effort or luck the plausible attacker probably will not spend |
| Possible | Could reasonably happen; similar organizations report it occasionally |
| Likely | Expect it within the year unless something changes |
| Almost certain | Already happening, or the conditions make it near-inevitable |

What should move your rating up:

- **Exposure.** Anything reachable from the internet is attacked continuously and indiscriminately. The same weakness on an internal-only system is materially less likely to be reached.
- **Known and public.** A published defect with a fix available is being scanned for at scale within days. A theoretical weakness nobody has published is not.
- **Ease.** No skill required beats requires-a-specialist, every time.
- **How many people can trigger it.** A weakness that any of 30 staff can set off by clicking is more likely than one requiring administrator access.
- **Frequency of the exposing activity.** Payments made weekly offer more opportunities for payment fraud than payments made twice a year.
- **History.** Has this, or a near miss, already happened here? Two near misses is not "unlikely."

What should *not* move your rating: how frightening the attack sounds, how recently you read about it, and how much you would enjoy fixing it.

## Rating impact

Impact is the harm if the event happens. Rate it against the *worst credible* outcome, not the worst imaginable one and not the average.

Start by asking which of confidentiality, integrity, and availability breaks, and for which asset — the lesson 02 habit. Then translate into the dimensions the business actually feels:

- **Financial** — fraud losses, recovery costs, lost trade during downtime, ransom, contractual penalties.
- **Operational** — how much of the organization stops, and for how long. Anchor availability impact to the longest interruption the business could absorb before the harm becomes serious.
- **Legal and regulatory** — data protection obligations, mandatory notification of affected individuals, professional body requirements, sector rules. Personal data raises impact sharply and predictably.
- **Reputational** — clients leaving, referrals not arriving, coverage. Slow-moving and hard to reverse.
- **Safety** — rare in an office, decisive where it applies. Clinical or industrial systems are a different conversation.

| Rating | Rough meaning |
| --- | --- |
| Negligible | Absorbed in normal work; nobody outside the team notices |
| Minor | A day of disruption or a small cost; no external consequence |
| Moderate | Real cost or several days of disruption; some clients affected; internally visible |
| Major | Serious financial loss, regulatory notification, significant client harm |
| Severe | Threatens the organization's ability to continue operating |

Two refinements that separate a good rating from a lazy one.

**Sensitive data raises impact by category, not by volume alone.** A hundred records containing health information, financial detail, or identity documents can be a higher-impact loss than a hundred thousand records of public company names. Ask what an attacker could *do to the individuals* with the data, not just how many rows there are.

**Duration is part of impact.** A file server unavailable for two hours and the same server unavailable for two weeks are different risks. When you write the risk sentence, put the duration in it.

## Putting them together

Plot the two ratings and read off a priority. A five-by-five is standard; the labels are what matter, not the arithmetic.

| Likelihood \ Impact | Negligible | Minor | Moderate | Major | Severe |
| --- | --- | --- | --- | --- | --- |
| Almost certain | Medium | Medium | High | Critical | Critical |
| Likely | Low | Medium | High | High | Critical |
| Possible | Low | Medium | Medium | High | Critical |
| Unlikely | Low | Low | Medium | Medium | High |
| Rare | Low | Low | Low | Medium | High |

Read the shape rather than the cells. The matrix is deliberately not symmetrical: a severe impact stays at least High even when rare, because organizations do not get a second attempt at an event that ends them. Meanwhile "almost certain, negligible" is a nuisance to be absorbed, not a project.

Use the matrix to *rank*, not to score. Its output is an ordered list of what to deal with first, which is the thing the organization could not produce for itself.

### Inherent and residual risk

**Inherent risk** is the rating with no controls, or with only the controls that already exist. **Residual risk** is what remains after you apply the treatment you are proposing. Both numbers matter, because the difference between them is the argument for spending the money, and the residual figure is what somebody has to accept.

Residual risk is never zero. Any proposal that claims to eliminate a risk is either misdescribing the risk or the control. Multi-factor authentication takes credential-based email compromise from Likely to Unlikely; it does not take it to Rare, because factors can be phished, sessions stolen, and prompts approved by a tired person. Say so. A recommendation that admits its own limits is the one that gets trusted.

## The four responses

Every risk gets exactly one primary treatment decision, from four options. Learn them as a set, because a technician who only knows "reduce" will recommend controls for things that should simply be switched off.

**Reduce (mitigate).** Lower the likelihood, the impact, or both, by applying controls. This is the default and the bulk of the work. Patching, MFA, narrowing permissions, encrypting data, training staff, adding monitoring, tested backups. Note that reduction splits neatly along the two axes: MFA and patching reduce *likelihood*; backups and encryption-at-rest reduce *impact* when the event happens anyway. A good treatment plan for a serious risk usually has one of each, which is defense in depth expressed as a budget.

**Transfer (share).** Move some of the financial consequence to someone else. Cyber insurance is the obvious instrument; contracts with suppliers that assign liability are another; outsourcing a function to a provider who runs it to a defined standard is a third. Two things to be honest about. Transfer almost always moves *money*, not *harm* — insurance does not un-disclose the client records, and your clients will hold you responsible regardless of what your contract with a supplier says. And transfer is usually conditional: insurers ask whether you had MFA and offline backups, and answering wrongly voids the thing you were relying on.

**Avoid.** Stop doing the activity that creates the risk. Retire the unsupported application. Delete the archive of card details you have no reason to keep. Stop accepting payment card numbers over the phone and use a payment link instead. Avoidance is under-used because it feels like retreat, but it is the only response that genuinely takes a risk to zero, and it is frequently the cheapest. Whenever a risk turns on data or a system nobody actually needs, propose avoidance first.

**Accept.** Decide, deliberately and on the record, to live with it. This is a legitimate professional decision when the cost of treatment exceeds the harm, or when the residual after treatment is still what you have to live with. It is legitimate only when it is **explicit, documented, owned by a named person, and given a review date.** Undocumented acceptance is not acceptance; it is neglect wearing a suit.

Two footnotes. There is no separate "ignore" option — ignoring is accepting without any of the four conditions. And responses combine: you might reduce a risk with MFA, transfer part of the residual through insurance, and accept what is left, with a review in twelve months. What you must not do is describe that as three treatments and never say which is the primary one.

### Choosing well

Match the response to the shape of the risk.

- **High likelihood, low impact** — reduce, cheaply, and mostly by automation. These are the ones that grind a team down.
- **Low likelihood, severe impact** — reduce the impact and consider transfer. You cannot make a fire unlikely enough to skip the backups.
- **High likelihood, severe impact** — reduce urgently, and consider avoidance of the activity in the meantime.
- **Low likelihood, low impact** — accept, with a note. Not everything needs a project.

Then apply three tests to whatever you have chosen:

1. **Does the control address the actual weakness?** Antivirus does not fix a shared administrator password. A firewall does not fix a supplier's over-broad access. This sounds obvious and it is the most common error in real recommendations.
2. **Is it proportionate?** The cost of the control — money, time, and the friction it imposes on people — should be smaller than the harm it prevents. A control that makes the job unworkable will be bypassed, and a bypassed control is worse than none because it is also believed in.
3. **Who will operate it, and how would you know it stopped working?** Every control needs an owner and a way of telling that it is still functioning. A control with no owner degrades quietly into a note in a document.

## When the risk happens anyway: incident response

Every accepted, reduced, transferred, and avoided risk still leaves a residue, and some of it will occur. An **incident** is a security event that actually harms, or plausibly threatens, the confidentiality, integrity, or availability of something you care about. Not every event is an incident: a blocked phishing email is an event, a user who typed their password into the phishing site is an incident.

An organization's **incident response plan** is the document that answers, in advance, questions nobody thinks clearly about at 6 p.m. on a Friday. Contributing to one is squarely within an entry-level technician's job.

### The lifecycle

**Preparation.** Everything done before anything happens: the plan itself, the contact list, defined roles, agreed severity levels, logging turned on and retained long enough to be useful, tested backups, and rehearsal. Preparation is where response is actually won.

**Detection and analysis.** Noticing, then working out what is really going on. Confirm it is genuine, establish scope — which systems, which accounts, which data — and assign a severity so everyone knows how hard to run. Start a timeline immediately, with times and time zones.

**Containment.** Stop it spreading and stop it getting worse, before you fix anything. Short-term containment is fast and blunt: disable an account, isolate a machine from the network, block a sender, revoke a session. Longer-term containment is what keeps the business running while you prepare eradication. Containment involves a genuine judgement — pulling a machine off the network may destroy evidence in memory and may tip off an attacker who then moves faster, but a machine still spreading is a machine still spreading. Where sensitive data is being actively taken, stopping the loss usually wins. The decision should be named in the plan rather than improvised, and escalated if the person on duty is not authorized to make it.

**Eradication.** Remove the cause: the malware, the persistence mechanism, the attacker's accounts, the vulnerability that let them in. If you skip the last of those, you are scheduling a repeat.

**Recovery.** Return to normal service, carefully. Restore from backups known to predate the compromise, verify systems are clean before reconnecting them, reset credentials that may have been exposed, and watch the restored systems more closely than usual for a while.

**Lessons learned.** Within a couple of weeks, a blameless review: what happened, what the timeline was, what worked, what did not, and what changes. The output is a small number of assigned actions with dates. A review that produces only a narrative has wasted the incident.

### What a technician actually contributes

You will not write an incident response plan by yourself. You will be asked for the pieces, and these are the ones that fall to you:

- **Contact and escalation details** — who is called, in what order, at 2 a.m., and what the alternative is when they do not answer. Keep a copy *offline*: a contact list stored only on the system that is down is a classic and avoidable failure.
- **Runbook steps for the incidents you can foresee.** "Suspected phishing click": disable the account, reset the password, revoke active sessions, check mailbox rules for anything auto-forwarding, notify the user's manager, record everything with timestamps. Written before it is needed, in numbered steps, and short enough to follow while stressed.
- **Severity definitions** with examples from your own environment, so that "high" means the same thing to everyone.
- **Evidence handling basics.** Preserve rather than tidy: do not delete the suspicious email, do not wipe and rebuild the machine because it is faster, note who did what and when. Take copies of logs before retention expires. Later courses cover forensic handling properly; the entry-level duty is simply not destroying things.
- **Communication drafts** — what to tell staff, and the reminder that if the email system may be compromised, you communicate about it somewhere else.
- **The reporting triggers.** Who decides whether regulators, clients, insurers, or law enforcement must be told, and within what deadline. You are not the decision-maker; you are the person who makes sure the question gets asked in the first hour rather than the first week.

### Protecting sensitive data specifically

When the asset at risk is personal or otherwise sensitive data, three things change. Impact ratings go up, because harm lands on individuals and often triggers notification obligations with short deadlines. Detection matters more relative to prevention, because a quiet, undetected copy is the characteristic failure. And **avoidance becomes disproportionately attractive** — the strongest mitigation for a store of sensitive data you do not need is deleting it on a schedule. When you write mitigation recommendations for a data risk, always check whether the data has to exist at all, and always check whether the backup copies are protected as well as the original.

## Worked example

Three findings from lesson 03's accounting firm, taken through the whole process.

**Risk 1.** *An opportunistic attacker obtains a staff mailbox password through reuse or spraying, and uses the mailbox to send fraudulent payment instructions to clients.*
Likelihood: **Likely** — email is internet-facing, there is no second factor, password reuse is common, and credential attacks are continuous and automated. Impact: **Major** — client financial loss, a professional-conduct problem, notification obligations, and reputational harm to a firm whose product is trust. Rating: **High**.
Response: **Reduce.** Enforce multi-factor authentication on all mailboxes (likelihood), enable alerting on impossible-travel logins and on new auto-forwarding rules (impact, by shortening dwell time). Residual: Unlikely × Major = **Medium**, accepted by the managing partner with a twelve-month review. Note honestly that MFA does not defeat session theft or prompt fatigue.

**Risk 2.** *The reception PC, running an operating system past end of support, is compromised by commodity malware and used to reach the client file server.*
Likelihood: **Possible** — not directly internet-facing, but unpatchable, on a flat network, and used by staff who browse and open attachments. Impact: **Major** — the file server holds seven years of client tax records; both confidentiality and availability are at stake. Rating: **High**.
Response: primarily **Avoid** — replace the appointment-booking software so the machine can be retired, since the vulnerability is not fixable while the machine exists. Interim **Reduce** while procurement happens: remove the machine's access to the client file share, and restrict what it can reach on the network. This is the case where "reduce" alone would have been the weaker answer.

**Risk 3.** *The IT contractor's permanently enabled remote-access account is compromised at the contractor's end and used to reach every system in the firm.*
Likelihood: **Unlikely** for any single year, but the account is standing, powerful, and outside the firm's control. Impact: **Severe** — administrative access to everything, including the path to the backups. Rating: **High**.
Response: **Reduce** — remove standing access in favour of access granted per request and time-limited, require multi-factor authentication on it, and log and review its use. **Transfer** part of the residual by writing security obligations and a breach-notification duty into the contract. Accept what remains, reviewed annually, with the note that supplier risk cannot be reduced to zero while the supplier has any access at all.

Notice that three risks produced three different primary responses. That is what a competent treatment plan looks like.

## Practice

Use your Rowan Veterinary Group findings table from lesson 03. If you did not complete it, rebuild a table of at least eight findings first.

**Part 1 — Write proper risk statements.** Turn eight findings into eight risk sentences in the form *[threat actor or event] exploits [weakness] affecting [asset], resulting in [harm]*. At least one must be a non-human event and at least one must concern sensitive personal data. A finding that will not fit the sentence needs rewriting, not forcing.

**Part 2 — Rate and rank.** For each of the eight, assign a likelihood and an impact using this lesson's scales, with **one sentence of justification for each rating** — sixteen sentences in total, and this is the part that is actually being assessed. Read the priority off the matrix, then present them as a ranked table. If your top-ranked risk is not one that would genuinely worry a practice owner, re-read your impact justifications.

**Part 3 — Choose treatments.** For the top five, state the primary response (reduce, transfer, avoid, accept), the specific action, who would own it, the estimated residual rating, and the review date. At least one must be avoidance and at least one must be documented acceptance, written the way you would want it to read if it were quoted back to you after an incident. For each of the five, apply the three tests from this lesson and note in one sentence how your choice passes them.

**Part 4 — Contribute to the plan.** Rowan has no incident response plan. Draft two pages of it:

1. A **severity table** with three levels, each with two concrete Rowan-specific examples and a stated expectation of who is woken up.
2. A **runbook** for "practice-management system credentials suspected compromised," in numbered steps, covering detection, containment, eradication, recovery, and who must be told at each stage. Include the offline contact list as an explicit item and mark the one step that requires authorization above a technician's level.

**Deliverable:** one document containing the eight risk statements, the rated and ranked table, the five treatment entries, and the two-page plan contribution. A reviewer should be able to challenge any rating and find your one-sentence justification sitting next to it.
