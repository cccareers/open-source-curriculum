---
lesson_id: ai210-03
course_id: ai210
pathway: prompt-engineer
title: From Needs to Requirements and Success Criteria
order: 3
kind: lesson
competency_ids:
  - D4-S1-C01
  - D4-S1-C05
objectives:
  - Turn discovery findings into written requirements and success criteria a
    build can be judged against
---

## Why the write-up is the real deliverable

Discovery produces understanding, and understanding evaporates. Three weeks later the client remembers agreeing to something slightly different, the person who described the exception cases has moved teams, and you are relying on your own memory of a conversation to defend a design decision. The requirements document exists to freeze the shared understanding in a form both sides can point at.

For AI-powered work the document has a second job that conventional requirements documents do not. A deterministic feature either works or is broken. An AI-powered feature is right most of the time, and "most" has to be negotiated in advance. If nobody writes down what accuracy is good enough, what happens on the failures, and who checks, then the first bad output becomes an argument instead of an expected event. Requirements and success criteria are where you convert a probabilistic system into something a client can accept, reject, or pay for on evidence.

Everything in this document comes from discovery. If you find yourself writing a requirement you cannot trace back to something you heard, stop — you are designing, not documenting, and you should either go back and ask or record it explicitly as an assumption.

## From finding to requirement

A discovery finding is a fact about the world. A requirement is a commitment about the system. Converting one to the other is a small, repeatable move.

| Discovery finding | Requirement it produces |
| --- | --- |
| "Four hundred emails a week, spikes to nine hundred at month end." | The system must handle 900 items in a 5-day week without manual batching. |
| "About one in eight are in French." | The system must detect non-English input and route it to the human queue. |
| "If we quote the wrong price, we honor it." | Any price-bearing output must be reviewed by a human before it reaches a customer. |
| "The data can't leave our tenancy." | All processing must occur within the client's existing cloud tenancy. |
| "Sam signs off on anything customer-facing." | The workflow must include a named approval step before send. |

Two things are worth noticing. Each requirement names something checkable, and none of them names a technology. Deciding *how* the French detection happens is a build decision; deciding *that* it must happen is a requirement. Keeping the two apart is what lets you change your mind about the build later without renegotiating the agreement.

Write requirements in a consistent grammar so that scanning them is fast. Two forms cover almost everything:

```text
FUNCTIONAL (what it does)
  The system must <observable behavior> so that <who> can <outcome>.

QUALITY / CONSTRAINT (how well, and within what limits)
  <Quality attribute> must be <threshold> under <condition>.
```

Then classify each one. A three-tier priority is enough, and it must be honest:

- **Must** — without this, the solution is not usable and should not ship.
- **Should** — significant value, but the first release survives without it.
- **Could** — desirable, explicitly deferred.

If more than about half your requirements are "must," the list has not been prioritized; it has been transcribed. Force the ranking in front of the client, because the ranking is the part they will care about when the schedule tightens.

## Writing success criteria for a probabilistic system

A success criterion is a test the finished thing either passes or fails, agreed in advance, measured on evidence rather than opinion. "The summaries should be good" is not a criterion. Four properties make one usable:

1. **It names what is measured.** Not "accuracy" but "the proportion of extracted invoice totals that match the source document."
2. **It names the threshold.** A number, or a band.
3. **It names the sample.** On what set of items, of what size, drawn how. A criterion measured on the three examples the client happened to send is not a criterion.
4. **It names who judges.** For subjective outputs, the judge and their rubric are part of the criterion.

The threshold conversation is the hard one, and it is a business conversation, not a technical one. The right anchor is the current state, which you already have from discovery. If a human reviewer currently catches 92% of the errors and takes six minutes an item, then a system that is right 90% of the time with a two-minute human check may be a clear win — or may be unacceptable, if the 10% that slip through are the expensive ones. Ask the client to describe the failure they cannot tolerate, then write the criterion around it. Be careful with the comparison itself: a reviewer's catch rate and a system's accuracy rate are different measures, so the criterion must say which one is being judged — usually the error rate that reaches the customer after any human check, because that is the number the business feels.

Distinguish three kinds of criterion, because clients conflate them:

- **Quality criteria** describe how well the AI output performs. Accuracy, completeness, the rate of hallucinated detail, the rate of items the system correctly declines to handle.
- **Experience criteria** describe what using it is like. Time to first useful output, the proportion of outputs a user accepts without editing, the number of steps to correct a wrong answer.
- **Business criteria** describe why the client is paying. Hours returned per week, backlog cleared, response time to a customer, cost per item handled.

Only business criteria survive a change of sponsor. Always write at least one, tie it to a number the client already tracks, and record the baseline for that number today — a target with no baseline cannot be evaluated, and capturing the baseline is a task that quietly gets skipped until it is too late.

Finally, write the **failure criteria** alongside the success ones. What is the maximum acceptable rate of confidently wrong output? What must never happen even once? What is the plan when the system cannot answer at all? Naming these turns a whole class of later surprises into planned behavior, and it is the input the interface design will depend on.

For the support-reply example in the table above, the failure criteria might read:

```text
F1  Never-event: no reply quoting a price or refund term reaches a
    customer without a named human approving it.
F2  Confident error: at most 2% of drafts accepted without edits contain
    a factual error, measured on a 200-item monthly sample, judged by
    the ops lead.
F3  Cannot answer: if no draft can be produced, the item goes to the
    human queue within 1 minute with the customer context attached,
    and the operator is told why.
```

## A requirements and success-criteria template

```text
SOLUTION REQUIREMENTS — <client> / <initiative>
Author:            <you>            Date: <yyyy-mm-dd>
Version:           <n>              Status: draft | agreed
Based on:          discovery session(s) <dates>, participants <names>

1. PROBLEM STATEMENT
   Two or three sentences, in the client's language. What happens today,
   who it costs, and how much.

2. BUSINESS GOAL
   The outcome the client is buying. One sentence, tied to a measure
   they already track.
      Measure: <name>   Baseline today: <value, as of date>   Target: <value>

3. USERS AND AFFECTED PARTIES
   | Who | Role in the workflow | What they need from it |
   Include the people on the receiving end of the output, not only operators.

4. SCOPE
   In scope:      <bulleted, specific>
   Out of scope:  <bulleted, specific — this list is the valuable one>
   Deferred:      <things agreed for later, with the reason>

5. REQUIREMENTS
   | ID | Requirement | Priority | Source (discovery evidence) |
   | R1 | The system must ... so that ... | Must | Session 1, ops walkthrough |

6. QUALITY AND CONSTRAINT REQUIREMENTS
   Data handling, residency, retention, access, review steps,
   availability, throughput at peak, languages, accessibility standard
   to be met.

7. SUCCESS CRITERIA
   | ID | Criterion | Threshold | Measured on | Judged by |
   | S1 | Extracted totals match source | ≥ 98% | 100 sampled invoices | Ops lead |
   | S2 | Time from receipt to draft ready | ≤ 5 min | 2-week live sample | System log |
   | S3 | Hours of manual handling per week | ≤ 6 (from 22) | Weekly timesheet | Finance |

8. FAILURE CRITERIA AND UNACCEPTABLE OUTCOMES
   Never-events, maximum tolerated rate of confident errors, and the
   required behavior when the system cannot produce an answer.

9. ASSUMPTIONS
   Everything we believe but have not verified. Each one is a risk with
   an owner.

10. OPEN QUESTIONS
   | Question | Who can answer | Needed by |

11. AGREEMENT
   Reviewed by <names>, on <date>. Changes to sections 4 and 7 require
   re-agreement.
```

The three sections clients skip and you must not are **out of scope**, **assumptions**, and **failure criteria**. Out of scope is the only defense against a project that grows a little each week. Assumptions are the honest record of what you decided without evidence; every one is a question you chose not to ask, and writing them down makes that choice visible while it is still reversible. Failure criteria are what let you demonstrate later that an imperfect system is performing as agreed.

## Making it align with the business, not just the workflow

A requirements document that describes the workflow perfectly and never mentions why the organization is spending money is a document that gets overruled. The alignment work is small but not optional.

Start from the business goal and work down. For each requirement, be able to answer "which part of the goal does this serve?" Requirements that cannot answer are either misunderstood or genuinely unnecessary, and both outcomes are worth discovering now. Say it explicitly in the document — the `Source` column in the requirements table earns its place by making an unsupported requirement visible at a glance.

Then check the goal against the people who own it. The sponsor's measure and the practitioner's pain are usually related but not identical: the operations lead wants their evenings back, the sponsor wants response times under an hour. A solution that serves one and not the other will be championed by one and undermined by the other. Where they diverge, write both into section 2 and name the trade-off rather than quietly picking a winner.

Finally, get the document read. Not approved in a meeting where nobody opened it — read. Two practices help. Send it with three specific questions attached ("is the peak volume in R4 right?", "is S1's threshold acceptable?", "is anything in the out-of-scope list a surprise?"), because a request to review everything gets no reply and a request to check three facts gets three answers. And walk section 7 line by line out loud with the person who will judge the result. Success criteria are the part everyone nods at and nobody reads, and they are the part the whole engagement is later measured against.

Version the document and record what changed and why. When the design changes in later lessons — and it will, because prototypes and user testing exist precisely to change it — the trail from a requirement to the evidence that revised it is what keeps the client with you rather than surprised by you.

## Practice

Use the discovery notes you produced in the previous lesson. If you do not have your own, use a set from a partner.

1. **Extract findings to requirements.** Build the two-column table: every finding on the left, the requirement it produces on the right. Aim for at least twelve requirements. Any finding that produces no requirement gets a one-line note explaining why.
2. **Prioritize honestly.** Tag each as Must, Should, or Could. If more than half are Must, re-rank until no more than half are, and note which ones you demoted.
3. **Write the full document** using the template. Sections 4, 8, 9, and 10 must not be empty; if you have no assumptions, you have not been honest about what you did not ask.
4. **Write five success criteria** — at least one quality, one experience, and one business criterion. Each must name the measure, the threshold, the sample, and the judge. For the business criterion, state today's baseline and how you would get it if you do not have it.
5. **Write the failure criteria.** Name one never-event, one maximum tolerated rate of confident error, and the required behavior when the system cannot answer.
6. **Run a review with a partner playing the sponsor.** Ask them your three specific questions. Then have them try to argue that a Should is really a Must. Record how the argument resolves, and update the document — including a version note saying what changed and why.

## Check your understanding

1. Rewrite "The system should use a language-detection model" as a requirement. What was wrong with the original?
2. A draft criterion reads "Summaries are accurate at least 95% of the time." Which of the four properties are missing?
3. Why must at least one success criterion be a business criterion with a recorded baseline?
4. Name the three template sections clients most often skip, and what each protects you from.

Answers: (1) "The system must detect non-English input and route it to the human queue" — the original names a technology instead of a checkable behavior. (2) It names a threshold, but not exactly what is measured, the sample, or who judges. (3) Only business criteria survive a change of sponsor, and a target with no baseline cannot be evaluated. (4) Out of scope (scope creep), assumptions (hidden, unverified decisions), and failure criteria (an imperfect system being judged as broken when it is performing as agreed).
