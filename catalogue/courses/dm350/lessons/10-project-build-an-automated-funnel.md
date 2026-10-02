---
lesson_id: dm350-10
course_id: dm350
pathway: digital-marketer
title: "Project: Build an Automated Funnel"
order: 10
kind: project
competency_ids:
  - D7-S1-C01
  - D7-S1-C02
  - D5-S1-C01
objectives: []
---

## The Brief

Northlight Bookkeeping is launching a new offer, and you are building the funnel for it.

**The Year-End Close Sprint** is a fixed-price, one-off engagement: $1,200, three weeks, delivered in November and December. A Northlight bookkeeper takes a business's books from wherever they are to closeable, hands back a clean set for the accountant, and writes a one-page note on what to fix in January. It is not the monthly service. It is deliberately a smaller commitment, and Ruth's hope is that a good share of Sprint buyers become monthly clients in the new year.

```txt
THE YEAR-END CLOSE SPRINT

  Price            $1,200, one off
  Delivery         3 weeks, November and December only
  Capacity         30 sprints total - a hard limit; the bookkeepers cannot
                   deliver more without dropping monthly clients
  Gross margin     60%   ($720 gross profit per sprint)
  Strategic value  Ruth expects roughly 1 in 4 sprint buyers to convert to
                   the monthly service in Q1, at the usual $6,435 lifetime
                   gross profit
  Sales process    NO fit call required. This is a buy-now offer with a
                   short form and an invoice. Advisors are not in the path.
  Launch           campaign starts 6 October; last sprint must start 8 December
  Audience         the existing database, plus whatever the capture path
                   brings in during October and November
```

Two features of this offer should shape everything you build. It is **capacity-constrained** — thirty is a real ceiling, and selling forty is a worse outcome than selling twenty-eight. And it is **self-serve** — there is no advisor conversation to rescue a confused prospect, so the funnel has to do the whole job.

## Your Goal

Design and specify a complete automated funnel that sells the Year-End Close Sprint, from first touch to purchase, using Northlight's existing CRM, database, and constraints as established across this course.

You are producing a **specification a competent colleague could build**, not a built system. If you have a CRM to work in, build what you can; the assessed artifact is the written specification either way.

Three capabilities are being demonstrated here, and it is worth knowing which is which as you work. The first is whether you can make a CRM hold the data an offer needs — the properties, the records, the activities, and the discipline that keeps them usable. The second is whether you can design an email campaign that has a goal, a structure, and a single call to action, and defend the target attached to it. The third is whether you can specify automation and personalization that a machine could execute without you standing over it, including everything it must not do.

A submission that produces beautiful copy on top of a data model that cannot support it has failed at the first, however good the writing. A submission with an immaculate workflow diagram and an email that asks for three things has failed at the second. The three are assessed together because in practice they fail together.

## Requirements

Eight deliverables. Each has a defined shape, and each is checkable.

### 1. Data model changes

The CRM as it stands (lesson 02) cannot support this offer. Specify the changes.

- Any new properties needed, in the JSON schema format from lesson 02, with type, options, whether required, and who or what sets each one. Justify each in one sentence; a property with no downstream use in this project does not belong.
- What the existing `lifecycle_stage` values mean for a Sprint buyer who is not a monthly client. Either extend the stage list or explain why you are not, and say what a Sprint buyer's record looks like.
- The one property that tells you, on 15 December, how many of the thirty places are gone. Say what writes it and when.

### 2. The capture path

A complete path map in the eight-step format from lesson 03, for the Sprint landing page.

- The form: every field, its CRM property, and its downstream use. Justify field count against the fact that this is a purchase, not a download.
- Hidden fields carrying source data.
- What happens in the seconds after submit, including which properties are written and what the contact sees.
- One conversion improvement proposal for the Sprint landing page, in the block format from lesson 03: baseline, expected effect with the arithmetic written out, value expressed in sprints and in dollars, the risk the arithmetic hides, and the downstream success metric that decides whether it actually won. Use conservative assumptions and say why you chose them.

### 3. Segments

At least three segments, each written in the full include/exclude logic format from lesson 05, with type (active or static), estimated size drawn from the course's numbers, owner, and review trigger.

At minimum you need a segment that should hear about this offer first, a segment that should hear about it later or differently, and a segment that must not receive it at all. Say why for each.

### 4. The launch campaign

One complete marketing email, plus its brief.

- The brief in the lesson 04 format: goal, one primary action, audience in CRM terms, exclusions, send window, offer, secondary link if any, success metric with a number, guardrails.
- The arithmetic showing your success metric is reachable from the audience size and Northlight's known rates.
- The email itself, written out in full: from name and address, subject, preview text, body, CTA, signature, footer. Under 300 words of body copy.
- Four subject line variants with paired preview text, each with its angle, character count, and risk. Choose one and defend it. At least one must be rejected for a data reason.
- One content block written in three conditional versions — two segment branches and a default that stands alone — per lesson 05.

### 5. The automated workflow

The centrepiece. A full specification in the lesson 06 format, with all seven parts present and labelled: entry criteria, enrollment settings, actions, delays, branches, suppression, and goal plus every exit path.

It must include, at minimum:

- A trigger-based entry with enrollment settings answered deliberately.
- At least two branches, each with a real default path.
- At least three property writes.
- At least one task or notification for a human, with a due time.
- The capacity constraint handled: what the workflow does when the thirtieth sprint is sold, and what it does at twenty-five.
- A defined behaviour for the contact who buys, the contact who does not, and the contact who is still undecided on 8 December when the offer closes.
- Every global suppression rule that applies, stated rather than assumed.

### 6. Consent and data handling

- Which contacts in Northlight's database may lawfully receive this campaign, and which may not, with the reasoning drawn from lesson 09's decision table.
- The consent wording on the Sprint form, written out, and the properties it writes.
- Two rows added to the retention decision table covering Sprint buyers and Sprint enquirers who did not buy.
- One paragraph: what happens if a Sprint buyer asks to be deleted in January.

### 7. Measurement plan

- The funnel table for this offer in the lesson 06 format: stages, expected counts, conversion to next, expected time in stage.
- The four workflow metrics you will report, with targets.
- Whether you will hold out a control group; if yes, its size and what it would prove; if no, why not.
- The one number you would put in front of Ruth on 20 December, and the sentence that goes with it.

### 8. Test plan

A minimum eight-case test plan in the lesson 06 format, covering at least: the happy path, the default branch, a sparse-data contact, a contact who achieves the goal mid-sequence, an unsubscribe mid-sequence, a suppressed contact, the capacity ceiling being reached, and the volume check. State the launch gate.

## Constraints

These are not suggestions. Work inside them or explain, in writing, why you did not.

- **Thirty sprints is a hard ceiling.** A funnel that would plausibly sell fifty is a failed design, not an ambitious one. Say what happens at the ceiling.
- **No fit call in the path.** You may not solve a design problem by handing it to Marisol or Theo. Their capacity is already spent on the monthly service.
- **Use Northlight's real numbers.** List sizes, engagement tiers, rates, and margins are established in lessons 02 through 07. Where you need a number the course has not given you, state it as an assumption, mark it clearly, and choose conservatively.
- **Consent first.** Every segment and every workflow states its consent condition explicitly. A contact with no marketing consent may not receive a marketing email, however good the offer.
- **Frequency discipline.** The monthly newsletter and any live nurture workflows are still running. Your campaign lands on top of them. Show that you have accounted for it.
- **No purchased data, no scraped data, no reactivating the uncleaned conference import.**
- **Deliverability guardrails hold.** Complaints under 0.10 percent, unsubscribes under 0.50 percent, no sends to the dormant tier. If your plan would breach one, redesign it.
- **The offer closes on 8 December.** Nothing may send after that date, and the workflow must handle the closure rather than being switched off by hand.

## Definition of Done

You are done when all of the following are true. Check them one at a time; most of these fail on the first pass.

```txt
  [ ] All eight deliverables are present and in the specified formats
  [ ] Every new property has a type, a setter, and a stated downstream use
  [ ] The capture path has no undefined step and no dead end
  [ ] The conversion proposal shows its arithmetic and names the risk it hides
  [ ] Every segment states its consent condition first and has an owner
  [ ] The campaign email is under 300 words and asks for exactly one thing
  [ ] Four subject variants exist, one rejected on a data ground
  [ ] The conditional block's default branch reads correctly standing alone
  [ ] The workflow specification has all seven anatomy parts, labelled
  [ ] Every branch has a default path; no path ends undefined
  [ ] The capacity ceiling is handled inside the workflow, not by a human
  [ ] The 8 December closure is handled inside the workflow
  [ ] A contact who buys exits immediately and receives nothing further
  [ ] Suppression rules are listed explicitly, not assumed
  [ ] The consent analysis names which contacts are excluded and why
  [ ] The funnel table's numbers multiply through to a defensible sprint count
  [ ] That sprint count is at or under 30
  [ ] The test plan has 8+ cases and a stated launch gate
  [ ] Every assumption you invented is marked as an assumption
  [ ] Someone else could build this without asking you a question
```

That last line is the real standard. Hand the specification to a classmate, let them read it once, and count their questions. Fewer than three, and you are finished.

## Hints

**Start with the arithmetic, not the copy.** Thirty sprints at a plausible conversion rate tells you how many contacts have to enter the funnel, and that number tells you whether your audience is large enough or whether the capture path has to carry more of the load than you assumed. Doing this first saves you from writing a beautiful campaign for an audience that cannot produce thirty sales.

**Work backwards from the ceiling.** Most people design the funnel and then bolt the capacity limit on at the end. Design it in: what the twenty-fifth sale changes, what the thirtieth does, and what the campaign says in each state. "Six places left" is a better email than any urgency you could invent, and it is true.

**The undecided contact on 8 December is the hardest case.** They are engaged, they did not buy, the offer is gone, and they must not receive a reminder about something that no longer exists. Solve it explicitly. It is the single most common gap in submissions.

**Reuse the course's formats rather than inventing your own.** The formats exist because they force the questions that are easy to skip. Any place where your specification reads more loosely than the worked examples in lessons 03 through 06 is a place where you have skipped one.

**Write the default branch first.** Lesson 05's advice, and it applies to the whole project: build for the contact whose data is incomplete, because at a 49 percent fill rate on `business_type` that is half your database. A funnel that only works for well-populated records works for half the people you have.

**Do not add a chatbot, a predictive score, or an AI feature to this project unless you can complete lesson 08's ten-point evaluation for it and reach yes.** Enthusiasm is not an argument, and the default answer is no. If you do include one, the evaluation is part of the submission.

**Sequence the work the way the course was sequenced.** Data model, then capture path, then segments, then campaign, then workflow, then measurement. Every time someone starts with the email because it is the fun part, they discover halfway through the workflow that the campaign promises something the data cannot support, and they rewrite it. The order in lessons 02 through 07 is not arbitrary; it is the order in which the decisions constrain each other.

**Say "no" somewhere in the submission.** A capacity of thirty and a database of 5,900 means most of your audience will not be sold to, and a good specification is explicit about who is being left out and why. A funnel design that targets everyone is a design that has not made a decision.

**Keep a marked assumptions list as you go.** You will need perhaps six numbers the course did not give you — a landing page conversion rate for a paid offer, a purchase rate from email, a monthly-conversion rate in Q1. Every one of them should be visible, conservative, and easy for a reviewer to argue with. A specification whose assumptions are hidden inside its arithmetic cannot be reviewed, and a plan nobody can argue with is a plan nobody can trust.
