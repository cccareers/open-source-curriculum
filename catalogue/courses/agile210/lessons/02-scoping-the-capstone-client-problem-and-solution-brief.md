---
lesson_id: agile210-02
course_id: agile210
pathway: prompt-engineer
title: "Scoping the Capstone: Client Problem and Solution Brief"
order: 2
kind: lesson
competency_ids:
  - D4-S1-C01
  - D4-S1-C05
objectives:
  - Scope a capstone around a real client problem and write a solution brief
    with measurable success criteria
---

## Why this is the lesson and everything else is a brief

This is the only stage of the capstone where you are taught rather than briefed, and the reason is arithmetic. You have forty hours. A capstone that starts building against a vague brief does not fail at hour thirty-eight when the demo goes badly; it failed at hour three, and the next thirty-five hours were spent elaborating the failure. Scoping is the highest-leverage work in the whole course, and it is the work most learners want to skip because it does not look like building.

You already know how to do the individual moves. In ai210 you ran discovery conversations, gathered requirements, and aligned with stakeholders. What is different here is the constraint: you are scoping something *you personally* have to finish, in a fixed budget, alone, with a demonstration at the end. That changes what a good scope looks like. A consultant scoping a six-month engagement can afford ambition. You cannot. Your brief has to be small enough to build twice — because you will effectively build it twice, once badly and once properly — and still be a solution somebody actually wants.

The output of this stage is a **solution brief**: a short document that names the client, the problem, the measurable definition of success, the boundary of what you will and will not build, and the assumptions you are betting on. It is what your instructor signs off at the first checkpoint, and it is what every later stage is judged against. When lesson 07 asks whether the capstone works, "works" means "meets this brief".

## Choosing the problem

You will arrive here with either a real client problem you have brought, or a realistic scenario your instructor assigned. Both are legitimate. A real problem is more motivating and more portfolio-credible; an assigned scenario is usually better-shaped, because someone deliberately made it buildable. What matters is that whichever you have gets qualified before you commit to it.

A capstone-suitable problem has five properties.

**It is a real, repeating piece of work.** Something a person currently does, more than once a week, in a way they can describe to you. If nobody does it today, you have no baseline, no test data, and no way to prove improvement. "We should have an AI assistant" is not a problem; "our office manager spends five hours a week retyping supplier invoices into the accounting sheet" is.

**Its input already exists in a form you can get at.** Emails, form submissions, spreadsheet rows, PDFs, records in an existing tool. If you have to invent the input, you will end up demonstrating on fixtures, and a capstone demonstrated only on data you made up is the weakest possible artifact. Ask for twenty real examples before you commit. If you cannot get twenty, that is a signal about the problem, not about the client's helpfulness.

**Its success is countable.** Time per item, items per week, error rate, response latency, backlog age, percentage requiring rework. If the only success measure anyone can name is "people like it", you will not be able to close the loop in lesson 07.

**It has a defensible AI step.** Somewhere in the process there is genuinely unstructured input — text to read, a document to interpret, a message to draft, a category to infer. If every step could be done with rules and a lookup table, you have an automation project rather than an AI project, and it will not exercise the pathway's prompting competencies. Equally, if the AI step needs to be right every single time with no human able to check, the problem is out of range.

**Failure is cheap and visible.** For a forty-hour build in your own accounts, prefer processes where a bad output means somebody notices and corrects it, not processes that move money, make commitments to customers, or touch records you are not authorized to handle.

Run each candidate through those five before you fall in love with one. Most learners have two or three candidates; the qualifying exercise usually eliminates the most exciting one, which is the point.

## Separating the problem from the requested solution

Clients rarely describe problems. They describe solutions they have already chosen, in the language of a tool they have heard of. "We want a chatbot on the website." "Can you make it summarise everything into a dashboard?" Your first job in the discovery conversation is to walk backwards from the requested solution to the problem it is supposed to solve, because half the time the requested solution does not solve it.

The move is simple and you should practise it until it is automatic: for every solution you are handed, ask what happens today, who it happens to, and what it costs.

| They say | You ask | What you are looking for |
| --- | --- | --- |
| "We want a chatbot." | "Who is asking questions today, and where do those questions go?" | The channel, the volume, the current answerer |
| "It should summarise everything." | "Who reads the summary, and what do they do differently after reading it?" | Whether a decision actually changes |
| "Make it automatic." | "What happens right now when it goes wrong?" | The failure cost, and whether a human gate is required |
| "We need AI on our data." | "Which decision are you making badly because you can't see that data?" | A concrete decision, not a capability |
| "Everyone's doing this." | "If this worked perfectly, what number on your report moves?" | The measurable outcome |

Write the answers down verbatim during the conversation. Paraphrasing in the moment loses the specifics — the exact tool name, the exact volume, the exact exception that "hardly ever happens" and turns out to be a third of the cases.

Two questions are worth asking in every discovery conversation regardless of the domain. The first is **"walk me through the last time you did this"**, which produces a concrete trace instead of an idealised description of the process. The second is **"what makes one of these hard?"**, which surfaces the exception cases that will otherwise ambush you at hour thirty.

## Talking to the people, not just the person

A capstone has more stakeholders than the one who described the problem, and alignment is a competency this course tags explicitly. At minimum, identify three roles:

- **The person who feels the pain.** Usually the one doing the work today. They know the exceptions and they will be your best source of test cases. They are also the person most likely to be nervous about being automated, and how you talk to them matters.
- **The person who decides.** Whoever can say "yes, use that data" or "no, that tool is not approved". If you do not identify them in the first hour, you will discover them at hour twenty-five when you need access to something.
- **The person who inherits it.** Who operates this after you hand it over in lesson 08? Their capability constrains your design more than anything else. A build that only you can run is not a solution.

For an instructor-assigned scenario, your instructor plays all three; ask them explicitly which role they are answering in when you ask a question. That sounds artificial and it is, but it keeps the alignment work honest.

Alignment means one specific thing here: everyone with a stake agrees on the same written statement of what success is, *before* you build. Not an approving nod on a call. A sentence in a document they have read. When you write your brief's success criteria, send them and ask for a correction. The corrections you get back are the whole value of the exercise.

## Writing measurable success criteria

This is where most briefs go soft. "Reduce manual effort" is not a criterion. A criterion has a metric, a baseline, a target, and a measurement method.

Take a criterion apart:

```text
Metric:      Median time from invoice arrival to it appearing in the tracking sheet
Baseline:    41 minutes (sample of 20 invoices, week of 3 March, timed by the office manager)
Target:      Under 5 minutes for at least 80% of invoices
Method:      Timestamp on arrival vs. timestamp on the created row, over a 25-invoice test batch
Owner:       Office manager confirms the sample is representative
```

Four things make that usable. It names *what* is measured in a way two people would measure identically. It records a baseline **with its sample and date**, so improvement is provable rather than asserted. Its target is a threshold with a percentage, not a vague direction. And it states how it will be measured, which forces you to instrument for it while you build rather than scrambling at the end.

Three to five criteria is right for a capstone. Cover at least these dimensions:

- **A speed or effort criterion.** The time or labour the solution saves.
- **A quality criterion.** Accuracy of the AI step against human judgement, on a labelled sample. You know how to evaluate AI output from ai101; this is where that goes.
- **A coverage criterion.** What fraction of real cases the solution handles end to end without escalating. Be realistic: 70% handled cleanly with 30% cleanly escalated is a good result and a much better design than 100% handled badly.
- **A usability or adoption criterion, where it applies.** Whether the person who inherits it can run it from the documentation without asking you.

Beware of the criterion you cannot measure inside the course. "Saves the client £40,000 a year" is not measurable in forty hours. Convert it: measure the per-item saving and show the arithmetic.

## Drawing the boundary

A brief that only says what you will build is half a brief. The out-of-scope list is what protects your forty hours, and it is also the most professionally useful habit in this lesson.

Write three lists.

**In scope.** The specific cases, channels, and outputs you will handle. Be concrete: "invoices from our top eight suppliers, arriving as PDF attachments to the accounts inbox".

**Out of scope, deliberately.** The things a reasonable person might assume are included and are not, each with one line of reasoning. "Handwritten or scanned-photo invoices — extraction quality on photographs is unreliable and this is a forty-hour build; these route to manual handling." An out-of-scope item without a reason reads as an oversight; with a reason it reads as a decision.

**Out of scope, for now.** The obvious next increment. This is the section clients read most carefully, and in lesson 08 it becomes your "what I would build next" slide.

The boundary also needs an **escape hatch**: what happens to a case the solution cannot handle. Every capstone needs one, and naming it in the brief stops you from designing as if every case will be clean.

## The solution brief

Your deliverable for this stage is one document, two to four pages. Use this skeleton — later stages refer to its section names.

```markdown
# Solution brief: <short solution name>

## 1. Client and context
Who they are, what the team does, who I spoke to and in what role.

## 2. The problem
What happens today, step by step. Volume, frequency, who does it,
how long it takes, what goes wrong. Baseline numbers with sample and date.

## 3. Proposed solution, in one paragraph
Plain language a non-technical stakeholder can read. What goes in,
what comes out, where a human stays in the loop.

## 4. Success criteria
Three to five criteria, each with metric, baseline, target, method, owner.

## 5. Scope boundary
In scope / out of scope, deliberately / out of scope, for now.
Plus the escape hatch for unhandleable cases.

## 6. Data and access needed
Which sources, which accounts, who grants access, what personal data
is involved (flagged now, reviewed properly in stage 06).

## 7. Assumptions and risks
What I am betting on, and what I will do if a bet is wrong.

## 8. Effort plan
How the remaining hours are allocated across the stages, and what
gets cut first if I run behind.

## 9. Sign-off
Who agreed to this, when, and what they corrected.
```

Section 7 deserves a note. Every capstone rests on assumptions — that the input format is stable, that the model is accurate enough on real documents, that access will be granted. Write them down as testable bets with a fallback: "Assumption: extraction accuracy on real supplier PDFs is above 85%. Test: run 20 real documents in stage 03. If it fails: narrow to the four suppliers with consistent layouts." An assumption with a fallback is a plan. An assumption without one is a hope.

Section 8 is your defence against overrun. The hours are already allocated for you by the course structure; your job is to say which requirement gets cut if the data layer takes ten hours instead of seven. Decide that now, calmly, rather than at midnight in stage 05.

## Sizing it against the hours you have

Scope is not just what the client wants; it is what fits. You have roughly thirty-five hours of build time left after this stage, split across design, data, workflow, review, hardening, and handover. Two-thirds of that goes to work that is not the interesting part — connecting real sources, validating input, testing, documenting — and learners consistently under-budget exactly that two-thirds.

A useful sizing test: describe the solution as a single sentence of the form *"when X happens, the system does Y, a person checks Z, and the result lands in W."* If you need two sentences and an "and also", you have two capstones.

A second test, more brutal: **could you build a rough, ugly version of the whole thing in one day?** If the honest answer is no, the real version will not fit in the hours either, because the real version costs three or four times the rough one once validation, error handling, review, security remediation, and documentation are included. This is not pessimism; it is the observed ratio, and the stages of this course are structured around it.

If your problem is too big — and most real problems are — do not water it down across the board. Instead, take the **narrowest complete slice**: one request type, one document format, one supplier group, one channel, handled properly from arrival to output. A narrow slice done to a professional standard demonstrates every competency this course assesses. A broad solution with no validation, no monitoring, and no handover documentation demonstrates none of them, however impressive the diagram looks.

Record the slice you chose and the ones you deferred in section 5 of the brief. In stage 08 those deferred slices become your "what I would build next", which is one of the most persuasive parts of a portfolio write-up.

## How capstone scoping actually fails

Five failure modes account for most of it. Recognise yourself in one of them now rather than later.

**The platform.** The brief describes a system with user accounts, roles, a dashboard, and three integrations. It is a product, not a capstone. Cure: cut until one person's one recurring task is fully handled, then stop.

**The demo that only works on the demo.** Scoped around three carefully chosen example inputs. It looks superb in the demonstration and collapses on the fourth real case. Cure: collect twenty real inputs *before* writing the brief, and make sure the ugly ones are in scope or explicitly out.

**The unfalsifiable win.** Success criteria that cannot fail: "improves efficiency", "provides insight". Cure: for each criterion, write the sentence that would prove it *not* met. If you cannot, the criterion is not measurable.

**The solution in search of a problem.** You wanted to build a chatbot, so the brief found somewhere to put one. Cure: the problem statement in section 2 must be writable without naming any technology at all. If it cannot be, you have started from the solution.

**The invisible dependency.** The brief assumes access that nobody has granted — an API key, an export, a system login. Cure: section 6 exists precisely to force this into the open in the first stage, and you should confirm access before the checkpoint, not after.

## Checkpoint

The stage-02 checkpoint is a conversation with your instructor, and you should treat it as a rehearsal for talking to a client about scope. Bring the brief, and expect these questions:

- What is the baseline, how did you measure it, and how many samples?
- Which criterion is most likely to fail, and what do you do when it does?
- Show me three real inputs, including the worst one you have seen.
- What are you deliberately not building, and why?
- Who inherits this, and can they run it?
- If you lose eight hours somewhere, what comes out of the brief?

If you cannot answer all six, the brief is not finished, and no amount of building in stage 03 will fix that.

## Practice

Work through these in order. The output of exercise 4 is your stage-02 deliverable and the input to every later stage, so do not treat these as warm-ups to be skipped.

**1. Qualify three candidates.** Write down three candidate problems — from your client, your own workplace, or your instructor's scenario list. Score each against the five properties from this lesson (real and repeating, input exists, success countable, defensible AI step, failure cheap) as pass, partial, or fail, with one sentence of evidence per cell. Any candidate with two fails is out. If all three survive, pick the one with the most accessible real input, not the most interesting one.

**2. Run a discovery conversation and reconstruct it.** Spend twenty to thirty minutes with your client or instructor. Use "walk me through the last time you did this" as your opening and "what makes one of these hard?" before you close. Afterwards, write a one-page trace of the current process, step by step, with a time estimate against each step and a marker on every step where a judgement call is made. Then list every place your notes say "usually", "normally", or "most of the time" — each one is an exception you have not yet scoped.

**3. Convert a soft goal into a measurable criterion.** Take the vaguest thing your stakeholder said about success and turn it into the five-line metric/baseline/target/method/owner block from this lesson. You will not have the baseline number yet; go and get it, from real observation or a real sample, and record the sample size and the date. Then write the sentence that would prove the criterion *not* met.

**4. Write the solution brief.** All nine sections, two to four pages, using the skeleton above. Do not skip section 7; write at least three assumptions, each with a test and a fallback.

**5. Get it corrected.** Send sections 3, 4, and 5 to your stakeholder — the client, or your instructor in the client role — and ask one question: "Where is this wrong?" Record every correction you get back in section 9, and revise. A brief that comes back with no corrections almost always means it was too vague to disagree with; push for specifics and send it again.

## Check your understanding

1. A stakeholder says success means "people like it". What do you do? *Convert it into a criterion with a metric, a baseline with sample and date, a threshold target, a measurement method, and an owner — for example, the fraction of drafts accepted without edit on a test batch — and write the sentence that would prove it not met.*
2. Your problem statement in section 2 mentions "a chatbot". Why is that a warning sign? *The problem statement should be writable without naming any technology; naming one suggests you started from the solution.*
3. You cannot build a rough version of the whole solution in one day. What should you change? *Narrow to the narrowest complete slice — one request type, format, or channel handled properly end to end — and record the deferred slices as "out of scope, for now".*
