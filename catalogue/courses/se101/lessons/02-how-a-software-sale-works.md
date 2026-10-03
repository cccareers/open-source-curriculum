---
lesson_id: se101-02
course_id: se101
pathway: technical-sales-representative
title: How a Software Sale Works
order: 2
kind: lesson
competency_ids: []
objectives:
  - Describe the stages of a business software sales cycle and the roles
    involved at each stage
---

## Why a sale has a shape at all

When someone buys a coffee, there is no process. They want it, they pay, they leave. When a company buys software, none of that holds. The person who feels the problem usually cannot authorize the spend. The person who authorizes the spend has never seen the product. Somebody in IT has to agree it will not break anything, somebody in finance has to find room in a budget, and somebody in legal has to read the contract. Meanwhile the company is perfectly capable of continuing exactly as it is, which is almost always the cheapest option in the short term.

Because so many people have to agree, a business software purchase moves through recognizable stages. Every company names them slightly differently, and every sales team argues about the boundaries, but the underlying sequence is remarkably stable across the industry. Learning that sequence is the first thing you do as a new representative, for three practical reasons.

First, it tells you where you are. "The customer is interested" is not information. "We have completed discovery and are waiting on a technical review" is information, because it implies what happens next and who has to do it.

Second, it tells you what your job is right now. The behavior that works in an early conversation — broad, curious, low-pressure — is exactly wrong three weeks later when a signed order form is sitting unread in somebody's inbox.

Third, it tells you who else belongs in the room. Most stalled deals are not stalled because the buyer disliked the product. They stalled because a person who had to say yes was never invited.

## The stages

![The stages of a business software sales cycle, from prospecting through renewal, with the handoffs between roles marked](./img/software-sales-cycle-stages.png)

**Prospecting.** Identifying companies that plausibly have the problem you solve, and getting a first conversation. Nothing is qualified yet; this is the search step. Later courses in this pathway cover how prospecting is actually done — here you only need to know it sits at the front.

**Qualification.** A short, honest conversation to establish whether there is a real opportunity: is there a problem worth money, is this person connected to it, is there any timeline, and is your product even in the right category? Both sides benefit from disqualifying fast. A deal that dies in week one costs almost nothing; a deal that dies in month four cost you the whole quarter.

**Discovery.** The core diagnostic stage. You investigate how the problem actually shows up — who it hurts, how often, what it costs, what they have already tried. Lessons 3 and 4 of this course live almost entirely here. Weak discovery is the single most common reason later stages go badly, because everything after this is built on what you learned.

**Demonstration and evaluation.** You show the product doing the specific things discovery told you mattered, and the customer forms a technical judgment. Depending on the product this may be a live walkthrough, a guided trial, a pilot with real data, or a formal security review. Note that it comes *after* discovery. Demonstrating before you know what the customer cares about produces a generic feature tour, which persuades no one.

**Proposal.** You put the recommendation in writing: scope, quantities, term, price, what happens at implementation. The proposal should contain no surprises. Anything a customer reads for the first time in a proposal is a problem you created earlier by not asking.

**Negotiation and approval.** Terms get discussed, procurement and legal get involved, internal approvals get chased. The commercial and legal side of this is a later course; what matters now is recognizing that this stage exists and that it is mostly administrative motion between people you may never speak to directly.

**Close.** Signature, order form, purchase order. The deal becomes revenue.

**Onboarding and renewal.** The customer implements the product, starts using it, and eventually decides whether to buy it again. In subscription software this is not an afterthought — the first sale is typically only a fraction of what the account is worth if it renews and expands.

Deals move backwards. A customer in evaluation who mentions a new stakeholder has effectively sent you back to discovery, and pretending otherwise does not help you.

## Who does what

Roles vary enormously by company size. At a startup one person may do all of this; at a large vendor each row is a separate department.

| Role | Typically owns | Common name |
| --- | --- | --- |
| Sales development representative | Prospecting, first conversation, qualification | SDR / BDR |
| Account executive | Discovery through close; owns the deal | AE |
| Sales engineer | Technical demonstration, evaluation, security questions | SE / solutions consultant |
| Sales manager | Coaching, forecasting, approving unusual terms | Manager |
| Customer success manager | Onboarding, adoption, renewal | CSM |
| Support | Day-to-day problems after go-live | Support |

Note that a technical sales representative role often blends the account executive and sales engineer columns: you carry the relationship *and* answer the technical questions.

The customer has roles too, and naming them is just as important:

- **End user** — feels the problem daily, rarely controls budget.
- **Champion** — wants this to happen and will argue for it internally when you are not in the room.
- **Economic buyer** — can approve the spend. Sometimes appears only once, late.
- **Technical evaluator** — IT or security, judges whether it is safe and supportable.
- **Procurement and legal** — negotiate terms and paper the agreement.

## Handoffs are where deals leak

Every arrow between two roles is a place where context gets dropped. The SDR books a meeting and the account executive arrives without knowing what the prospect actually said. The account executive closes and disappears, and the customer success manager starts by asking questions the customer already answered twice. Customers experience these gaps as "this company doesn't talk to itself," and it costs trust immediately.

The remedy is unglamorous: write down what you learned in the customer's own words, and hand it over before the next person's first conversation, not after.

Here is what that looks like for the deal in the worked example below, sent by the SDR to the account executive before the first discovery call:

> **Dana (Ops Manager), 400-person logistics co.** Replied to hiring-signal note.
> - In her words: dispatchers "rekey every delivery exception into a spreadsheet" and it is "getting out of hand."
> - She does not own budget; her director does. Peak season starts in about five months.
> - Not yet known: how much time the rekeying costs, and whether IT has a say.

Notice that every bullet is either something Dana said or something explicitly marked as unknown. Nothing in it is the SDR's opinion about whether she will buy.

## Worked example: one deal end to end

A 400-person logistics company. An SDR notices they are hiring dispatchers rapidly and sends a note; an operations manager, Dana, replies. **Prospecting done.**

On a 15-minute call Dana says dispatchers are rekeying delivery exceptions into a spreadsheet and it is getting out of hand. She does not own budget; her director does. There is a peak season in five months. **Qualified** — real problem, real timeline, a path to a decision-maker.

Two discovery calls follow, one with Dana and one with two dispatchers. The rekeying costs roughly 90 minutes per dispatcher per day and causes missed customer callbacks. **Discovery done**, with numbers.

The sales engineer demonstrates exception routing using three of the company's own sample records. IT joins to ask about data retention. **Evaluation done.**

A proposal goes to Dana's director for 40 seats on a one-year term with implementation before peak season. Procurement asks for a longer payment window. **Negotiation.** The order form is signed six weeks after the first reply. **Closed**, and a CSM schedules onboarding for the following Monday.

Total elapsed time: about ten weeks, roughly typical for a deal this size. Notice how little of it was persuasion, and how much was arranging the right conversations in the right order.

## Practice

Work from this scenario: a 200-person accounting firm where junior staff manually assemble client document requests by email, and nothing tracks what has been returned. Your product automates client document collection.

1. On one page, draw the stages from prospecting to renewal as a horizontal line. Under each stage write the single question you must be able to answer before you are allowed to move to the next one (for example, under Qualification: "Who can approve the money, and how do I reach them?").
2. For the same scenario, list every role you expect to meet — on your side and the customer's — and write one sentence per role explaining what that person needs from you in order to say yes. You should end up with at least eight rows.
3. Pick two adjacent roles that must hand off to each other. Write the three-bullet handoff note the first would send the second. Then delete the bullets that are your opinion rather than something the customer said, and see what survives.
4. Finally, describe a plausible way this deal moves *backwards* one stage, and what you would do about it.

## Check your understanding

1. A customer in the evaluation stage tells you their new CFO wants to "take a look before anything is signed." Which stage are you now really in, and why? *(Answer: back in discovery for that stakeholder — you do not yet know what the CFO cares about, and moving forward as if you did is how deals stall.)*
2. Why does demonstration come after discovery rather than before it? *(Answer: without discovery you do not know which capabilities matter, so the demo becomes a generic feature tour.)*
3. Name the customer-side role who can approve the spend, and the one who argues for you when you are not in the room. *(Answer: the economic buyer; the champion.)*
