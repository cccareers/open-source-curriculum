---
lesson_id: se101-04
course_id: se101
pathway: technical-sales-representative
title: From Customer Problem to Product Fit
order: 4
kind: lesson
competency_ids:
  - D1-S1-C02
objectives:
  - Translate a customer's stated problem into a matching software capability
---

## From what they said to what you recommend

You now have a page of notes and a playback the customer confirmed. This lesson is about the step that follows: turning that into a specific, defensible statement of which part of your product addresses which part of their problem — and where it does not.

This is the step where most entry-level representatives fall back on the product tour. The customer describes something painful, and the reflex is to say "oh, we do that" and start listing features. It fails for a reason worth understanding: a feature list forces the customer to do the mapping themselves. They have to hold their problem in mind, watch fourteen capabilities go by, and work out which two are relevant. Most people will not do that work on your behalf. They will nod, thank you, and stop returning calls.

Your job is to do the mapping and show it to them.

## Take the problem apart first

A stated problem is rarely a single thing. Before you can match it to anything, break it into four parts.

**Symptom** — what the customer says is wrong, in their words. "Invoices go out late."

**Mechanism** — how it actually happens, step by step. "Billing waits for signed delivery notes; the notes arrive as photos by text; someone matches them to jobs by hand each Friday."

**Impact** — what it costs, ideally with a number or a name attached. "Average nine days of delay on about £400k of monthly billing, and two or three customer disputes a month about what was delivered."

**Who** — which person carries the pain, and which person carries the consequence. Often not the same person. Here the bookkeeper carries the work; the finance director carries the cash-flow consequence.

The reason to separate these is that products almost never address symptoms. They address mechanisms. "Invoices go out late" is not something software fixes; "delivery notes arrive as unstructured photos and are matched by hand" is. If you cannot describe the mechanism, you are not ready to recommend anything, and the right move is another discovery question rather than a demo.

## Symptom, cause, and the trap underneath

Customers usually arrive with a diagnosis already attached, and it is often wrong. "We need better reporting" frequently means "I don't trust the numbers," which is a data-entry problem, not a reporting problem. "The team needs training" sometimes means "the process changed and nobody told them." If you accept the customer's diagnosis without examining the mechanism, you will sell them something that does not help, which is worse for you than losing the deal — it costs you the renewal and the reference.

A simple discipline: for every stated cause, ask yourself what evidence you have that it is the cause rather than another symptom. If the answer is "the customer said so," keep going.

## Capability, not feature

Match to **capabilities**, not features. The distinction is practical.

A **feature** is a thing the product has: "configurable webhooks," "a mobile app," "role-based permissions."

A **capability** is something the customer can now do that they could not do before: "field staff can capture a signed delivery note on a phone and have it attached to the right job automatically."

Features are vendor language. Capabilities are customer language, and they map cleanly onto mechanisms. When you find yourself saying a feature name, ask "so what?" until you land on something the customer's team can do differently on a Tuesday morning. That is your capability.

## The mapping itself

Write it as a table, one row per element of the problem. This is a working artifact for you, not a slide for them — though the discipline of filling it in is what makes your eventual recommendation short and specific.

| Mechanism (their words) | Impact | Capability that addresses it | Evidence it will |
| --- | --- | --- | --- |
| Delivery notes arrive as text-message photos | 9-day billing delay | Field capture attaches a signed note to the job record at completion | Demo with their own job data |
| Manual Friday matching by one bookkeeper | 6 hours/week, single point of failure | Automatic job-to-note matching, exceptions queued | Pilot on one month of history |
| Disputes about what was delivered | 2–3/month, credit notes issued | Customer-visible signed record on each invoice | Reference customer in same sector |

Three rules for filling this in honestly.

**Every row needs an impact.** If you cannot state what a mechanism costs, you cannot argue for changing it, and you should go back and ask.

**Every row needs evidence.** A claim you cannot demonstrate is a claim the technical evaluator will take apart later.

**Some rows have no capability, and you write that down.** If disputes are partly caused by drivers leaving before the customer signs, no software fixes that. Saying so out loud is one of the fastest ways to earn credibility, and it also protects you: unaddressed gaps that you concealed reappear as objections at exactly the worst moment.

## Saying it back

The output of all this is two or three sentences, not a presentation. A usable shape:

> "The expensive part isn't the invoicing itself — it's that the signed notes arrive as photos and someone has to match them by hand every Friday, which is where the nine days go. The piece of our product that matters to you is field capture: the technician gets the signature on their phone at the job and it lands on the job record immediately, so there's nothing to match. That doesn't help with the disputes where the customer wasn't there to sign — we'd have to handle that separately."

Read that again and count how many features it names. One. It leads with their mechanism, names a single capability, ties it to their number, and volunteers a limit. That is the entire deliverable of this lesson.

## Worked example

**Product capabilities** (a small field-service platform):

1. Mobile job capture with signature and photo
2. Automatic matching of captured evidence to job records
3. Scheduling with technician skills and location
4. Customer notification on job status change
5. Exportable job history

**What the customer said:** "Scheduling is a mess. We're using a whiteboard. We double-book about twice a week, and honestly the bigger issue is that when a customer calls to ask where their technician is, nobody knows."

**Taking it apart.** Symptom: scheduling is a mess. Mechanism: jobs are written on a whiteboard and texted out each morning, so any change after 8am exists only in one person's phone. Impact: two double-bookings a week, each costing a wasted visit; plus an unmeasured volume of "where is my technician" calls that the scheduler personally fields. Who: the scheduler carries both; the owner carries the customer complaints.

**Mapping.** The double-booking maps to capability 3 — a single shared schedule removes the whiteboard-versus-phone divergence. The "where is my technician" calls map to capability 4, not to scheduling at all, and the customer had bundled them together as one problem. That separation is the whole value of the exercise. Capability 1 and 2 look attractive and are genuinely useful to this company, but nothing the customer described requires them, so they stay out of the recommendation.

**What is not addressed.** If a technician runs over on a job, someone still has to decide who takes the next one. The product surfaces the conflict; it does not make the judgment call. Say that.

**The sentence:** "You've actually described two problems. The double-bookings come from the schedule living in two places — that one goes away with a shared schedule. The 'where is my technician' calls are separate, and those are automatic status notifications to the customer. I'd want to fix them in that order."

## Practice

Use this capability list for a document-collection product: (1) request templates, (2) client portal with upload, (3) automatic reminders on a schedule, (4) status dashboard by client, (5) audit trail of who submitted what and when.

1. Here are three customer statements. For each, write out symptom, mechanism, impact, and who — inventing plausible mechanism detail only where you flag it as an assumption to verify.
   - "Tax season is chaos. We chase the same clients four or five times and we still end up filing extensions."
   - "Our partners can never tell me which client files are complete without asking a junior."
   - "A client swore they sent us a document in March. We couldn't prove they hadn't."
2. Build the four-column mapping table for all three. Where no capability applies, write "no fit" and one sentence on how you would say that to the customer.
3. One statement in that list maps most naturally to a capability the customer would never have asked for by name. Identify it and explain why.
4. Write the two-to-three sentence recommendation for the first statement. Then cut it by a third without losing the mechanism, the number, or the limitation.
5. Swap your table with a partner and challenge each other's rows with one question: "what's your evidence it will?"
