---
lesson_id: cse101-09
course_id: cse101
pathway: cloud-support-engineer
title: Explaining Cloud Concepts to Customers
order: 9
kind: lesson
competency_ids:
  - D5-S1-C01
objectives:
  - Explain a cloud concept or a cloud bill to a non-technical customer in plain
    language
---

## The skill that decides how your work is received

Everything in the previous seven lessons can be done correctly and still land badly. A customer whose outage you resolved in twenty minutes will remember the four hours of silence beforehand. A cost optimization that saved a client $200 a month will be resented if the first they heard about it was an unexplained change to their invoice. A perfectly accurate explanation delivered in vocabulary the listener does not have is not an explanation — it is a performance.

Communication is not the soft part of support engineering. It is most of the job, measured in hours. And it is a *technical* skill, in the sense that it has a method, it can be done well or badly for identifiable reasons, and it improves with deliberate practice rather than with time served.

The thing that makes it hard is a specific and unavoidable trap. Once you understand how something works, you cannot easily remember not understanding it. Words like *instance*, *bucket*, *provisioned*, *region*, *scaling*, and *tier* stop sounding like jargon to you long before they stop sounding like jargon to everyone else. You will use them without noticing, and the person listening will nod, because asking feels like admitting incompetence. The nod does not mean understanding, and treating it as though it does is how a support engineer ends up surprised by an angry email a week later.

## Start with the audience, not the topic

Before writing a sentence, answer three questions.

**Who is this person, and what decision do they need to make?** An explanation exists to enable a decision, not to transfer knowledge. The right depth is the minimum that supports the decision. The same incident produces four different correct explanations:

| Audience | What they need | What to lead with |
| --- | --- | --- |
| Business owner / executive | Impact, duration, cost, risk of recurrence | What it means for their business, in money and time |
| Finance or office manager | What changed on the invoice, and whether it repeats | The number, then the cause |
| Their developer or IT contact | Root cause and technical detail, so they can act | The mechanism, precisely |
| Your own internal team | Reproduction, evidence, what you have ruled out | Facts and timestamps |

**What do they already know?** Ask rather than assume, and ask in a way that is not a quiz. "How much of the setup have you worked with directly?" gets you a useful answer. "Do you know what a virtual machine is?" gets you a defensive one.

**How much time do they have, and in what medium?** A written ticket update, a two-minute phone answer, and a scheduled thirty-minute review are three different artifacts. Writing the thirty-minute version into a ticket wastes everyone's time; giving the two-minute version in a review looks evasive.

## Method: answer first, then explain

The structure that works nearly always, borrowed from journalism and used across professional communication:

1. **The answer or the headline**, in one sentence. What happened, what it means, or what you need.
2. **The consequence** — what it means for them specifically.
3. **The explanation**, only as deep as the decision requires.
4. **The action** — what you are doing, what you need from them, and by when.

Most untrained technical explanation inverts this. It builds chronologically toward a conclusion, so the listener spends four paragraphs not knowing whether they should be worried. Put the conclusion first. The person who wants the mechanism will keep reading; the person who wanted only the answer already has it.

### Plain language, concretely

**Translate the jargon.** Not "avoid technical terms" — introduce them, once, in plain words, then use them consistently. Randomly alternating between the plain phrase and the technical one is worse than either.

| Instead of | Say |
| --- | --- |
| We'll provision another instance | We'll add another server |
| Your objects are in the archive tier | Those files are in low-cost long-term storage, which takes a few hours to retrieve |
| The container was OOM-killed | The application ran out of memory and was shut down automatically |
| We need to right-size the database | The database is bigger than it needs to be, so we can move to a smaller one and pay less |
| There's high egress on the account | People are downloading a lot of data, and the provider charges for data leaving their network |
| IAM misconfiguration | The permissions were set wider than they should have been |
| It's a shared responsibility issue | The provider handles the hardware; the settings on our side are ours to fix |
| We'll enable a lifecycle policy | We'll set files to move to cheaper storage automatically as they get older |

**Use numbers rather than adjectives.** "Slow" means nothing. "Pages were taking eight seconds instead of the usual half second" means something and can be verified. "Expensive" is an opinion; "$310 more than last month" is a fact.

**Use analogies carefully, and say where they break.** Analogies are how new concepts attach to existing ones, and every analogy is wrong somewhere. Name the limit yourself before it misleads:

- *Storage tiers are like a filing system: the current folder on your desk, the cabinet down the hall, and the offsite warehouse.* Where it breaks: retrieving from the warehouse costs money each time, not just delay.
- *Scaling is like opening extra checkout lanes when a queue builds.* Where it breaks: the lanes take a minute to open, so a sudden rush still causes a wait.
- *Shared responsibility is like renting an apartment: the landlord maintains the building, you lock your own door.* Where it breaks: the landlord can prove exactly who entered and when, which is your audit log.

The analogy people reach for most — "the cloud is just someone else's computer" — is accurate and unhelpful, because it implies a single machine and hides both pooling and elasticity. Prefer "renting capacity in a very large shared facility, and paying for what you use."

**Cut hedges and filler.** "It seems like there might potentially be an issue with the configuration" says less than "the configuration is wrong" and sounds evasive. Be direct about what you know, and equally direct about what you do not: "I don't know yet; I'll know within the hour."

## Explaining a bill

Billing conversations are their own category, and they have a distinctive property: the customer usually does not dispute the technology. They dispute the number. Defending the technology is therefore answering a question nobody asked.

The structure that works:

1. **State the change plainly.** "Your bill went from $2,100 to $5,800 — an increase of $3,700."
2. **Name the single largest driver first.** Not all seven contributors. One, with its number: "$3,200 of that is data transfer — customers downloading files from your site."
3. **Explain the mechanism in one sentence** without the meter's official name: "The provider charges for data leaving their network, and last month your traffic roughly tripled after the product launch."
4. **Say whether it will repeat.** This is the question they actually have, and the one most engineers forget to answer.
5. **Give options with numbers and trade-offs**, not a recommendation dressed as the only choice: "We can leave it — expect around $5,000 a month at this traffic. Or we can add a caching layer, which costs about $200 a month and should cut the transfer charge roughly in half. That takes about a day to set up."
6. **Say what you need from them**, and by when.

Two things to avoid absolutely. Do not present a cost increase caused by a mistake as though it were normal growth — say plainly that it was a misconfiguration, what it was, and what stops it happening again. And do not read the invoice line by line. Nobody wants the whole meter list; they want the one line that moved.

### Worked rewrites

**Original:** "The spike is due to elevated egress on the S3 bucket, likely from the CDN misconfiguration where cache-control headers weren't set, resulting in origin fetches for every request."

**Rewritten for a business owner:** "Your bill went up about $900 last month, and it was our mistake. The system that's meant to keep copies of your images close to your customers wasn't holding on to them, so every single view fetched the original again and the provider charged for each one. It's fixed as of Tuesday. You should see next month's bill drop back to roughly the usual $1,400, and I'll confirm the actual number when it's issued on the 3rd."

**Original:** "We need to migrate the workload off the t-series burstable instances because you've exhausted your CPU credits, which is causing the throttling you're seeing."

**Rewritten:** "The server type you're on is designed for occasional bursts of activity rather than steady use — it gives you a limited allowance of extra speed, and you've been using more than the allowance, so it's being slowed down deliberately. That's why the system has felt sluggish since about Thursday. Moving to a server built for steady use costs about $30 more a month and removes the problem. I'd recommend doing it this week; it takes around fifteen minutes and a short restart."

**Original:** "It's a shared responsibility model issue — the provider's SLA doesn't cover configuration errors on the customer side."

**Rewritten:** "This one is on our side rather than the provider's. They guarantee the hardware and the platform, and those were fine — the setting that controlled who could reach the file was wrong, and we set it. I'm not going to be able to claim anything back from them for it. Here's what I've changed so it can't be set that way again."

Notice what the rewrites have in common: the answer is first, there are numbers, the mechanism gets one sentence, fault is stated plainly without either defensiveness or grovelling, and every one ends with what happens next.

## Incident updates

During an outage, communication *is* the service, because it is the only part of it the customer can see. The rules are simple and almost never followed.

**Send the first update before you have the answer.** Silence is read as absence. A message at eight minutes saying "we're aware and investigating" is worth more than a complete diagnosis at ninety.

**Every update has four parts:** what we know, what the impact is, what we are doing, and when the next update will come. Then send the next update at that time even if nothing has changed — *especially* if nothing has changed, and say so.

**Do not speculate about cause in public.** "It looks like the database" becomes "they said it was the database" and then has to be retracted. Report what is confirmed.

**Do not blame the provider before it is established, and do not hide it after.** Both are credibility losses, in opposite directions.

A usable template:

```text
Subject: [Investigating] Checkout unavailable — update 2

What we know: Checkout has been returning errors for some customers since
14:05. Browsing and account login are unaffected.

Impact: Customers cannot complete purchases. Roughly 40% of attempts are
failing; the rest succeed.

What we're doing: We've identified the failing component and are rolling
back this morning's release. Rollback is in progress.

Next update: 15:15, or sooner if it is resolved.
```

Afterwards, the follow-up covers what happened, why, what was done, and what changes so it does not recur — in plain language, without blaming a named person, and with a real commitment rather than "we'll be more careful."

## Handling frustration, and confirming understanding

An angry customer is usually not angry at you. They are angry that something they depend on failed and they could not do anything about it. Acknowledge that directly and once — "this has clearly cost you a chunk of your day, and I'm sorry" — then move to substance. Repeated apology reads as stalling. Never argue about whether the frustration is proportionate.

Watch for the three signals that you have lost someone: they go quiet, they agree too quickly, or they repeat a question you believe you answered. All three mean the same thing — try a different explanation, not the same one louder.

Then confirm understanding, and do it by asking them to state it rather than asking whether they got it. "Does that make sense?" reliably produces "yes." Instead: "So that we're aligned before I go — how would you describe this to your team?" What comes back tells you exactly which part did not land, and you fix that part rather than repeating all of it.

Finally, write it down. Anything agreed verbally goes into a written summary the same day: what was decided, what it costs, who does what, by when. Memory diverges within a week, and the written version is what protects both of you.

## Practice

**Part 1 — Rewrite six explanations.** Rewrite each of the following for a named non-technical audience. Each rewrite is at most 120 words, leads with the answer, contains at least one number, states any fault plainly, and ends with a next step. Below each, list the jargon you removed and what you replaced it with.

1. "The lifecycle policy transitioned the objects to archive and the retrieval is going to take 8–12 hours with a per-GB restore fee."
2. "You're being throttled because you hit the API rate limit on the account; we'll need to request a quota increase."
3. "The instance was terminated because it was running on spot capacity and got reclaimed."
4. "We over-provisioned the database on IOPS; right-sizing will save about 40% on that line item."
5. "The bucket had public list permissions enabled, so the file index was reachable without authentication."
6. "The region had an availability zone failure; your workload wasn't multi-AZ, so there was no failover."

**Part 2 — Explain a bill.** Using the anomaly from lesson 07 — a bill moving from $2,100 to $5,800 — write two explanations of the same facts. Assume the cause was a scaling rule that scaled up and never scaled back down, running an extra six servers for eighteen days.

- **Version A**, 150 words, for the business owner: answer first, one driver, will-it-repeat, two options with numbers, next step.
- **Version B**, 150 words, for their technical contact: mechanism, evidence, remediation, and what monitoring is being added.

Then write three sentences on what you included in one and deliberately left out of the other, and why.

**Part 3 — Run an incident.** For a two-hour outage of a customer's public website caused by an expired TLS certificate, write the complete communication sequence:

1. The first update, sent at 8 minutes, before you know the cause.
2. A holding update at 35 minutes where nothing has changed.
3. The resolution message.
4. A follow-up summary for the business owner, under 250 words, covering what happened, why, what was done, and what changes.

Each of the first three must contain all four parts of an update. The follow-up must name a specific preventive change, not a promise to be careful.

**Part 4 — Explain out loud.** Pick one concept from this course: the shared responsibility line, the difference between a virtual machine and a serverless function, storage tiers, or least privilege. Record yourself explaining it in **90 seconds or less** to a listener with no technical background. Then play it to an actual non-technical person and ask them to explain it back to you. Write down: what they got wrong, which sentence of yours caused it, and your revised version of that sentence. Submit the recording, the transcript, and the revision.

**Part 5 — Deliver bad news.** Write the message telling a customer that files they deleted three weeks ago are unrecoverable, because versioning was never enabled on their storage — a setting your team recommended and they declined on cost grounds. Under 200 words. It must be honest about the history without being accusatory, clear that recovery is not possible, specific about what protection you now recommend and what it costs, and it must not hide behind passive voice. Then write two sentences on the hardest word choice you made and why.

**Deliverable:** one document containing the six rewrites with their jargon lists, both bill explanations with the comparison note, the four-part incident sequence, the recording plus transcript plus revision, and the bad-news message with its note.
