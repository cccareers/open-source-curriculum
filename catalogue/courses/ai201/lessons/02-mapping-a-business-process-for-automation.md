---
lesson_id: ai201-02
course_id: ai201
pathway: prompt-engineer
title: Mapping a Business Process for Automation
order: 2
kind: lesson
competency_ids:
  - D3-S1-C04
objectives:
  - Map an existing business process end to end and identify which steps are worth automating
---

## Why the map comes before the builder

The fastest way to waste a month is to automate a process nobody examined. Every business process accumulates steps that exist because of a system that was retired, a manager who left, or an incident in 2019 that nobody wants to repeat. Automate that process as-is and you get the same waste, running faster, with a machine defending it. Worse, you now own it: the workflow becomes the documentation, and the reasoning behind each step disappears entirely.

Mapping is how you separate the work from the ritual. A good map does three jobs. It shows what actually happens, not what the standard operating procedure claims happens. It attaches numbers to each step, so "this takes forever" becomes "this is 340 hours a year." And it exposes the boundaries — where the process really starts, where it really ends, and which systems own which facts. Only then can you decide what is worth automating, which is a business judgement, not a technical one.

This lesson is entirely about producing that map and the decision that follows from it. You will not build anything in a workflow tool here. The deliverable is a process brief: a step inventory, a baseline measurement, a suitability assessment, and a recommended automation boundary. Everything you build for the rest of the course starts from a document like this one.

## Getting at the real process

People describe their work in summary. Ask an accounts-payable clerk how invoices get processed and you will hear five steps. Watch them for an afternoon and you will count seventeen, because the summary omits every exception, every "and then I check whether it's one of the vendors we pay differently," and every wait.

Use three sources and expect them to disagree.

**Observation.** Sit with the person doing the work and narrate as they go. Do not interrupt to suggest improvements; you are recording, not consulting. Record the exceptions especially — the moments where they say "usually I would, but this one is..." Those branches are where automation projects die.

**Artifacts.** Collect the actual objects the process moves: a real inbound email, a real spreadsheet, a real ticket, a real completed form. Artifacts are evidence. The email you are handed will have an attachment nobody mentioned and a subject line format that turns out to be the routing key.

**Systems.** List every system touched and what it is authoritative for. If two systems both claim to hold "the customer's address," you have found a reconciliation problem that will surface later as a data quality bug in your automation. Write down which one wins.

Interviews with a manager are a fourth source, and the least reliable one for step detail. Managers are the right source for *why* the process exists and what a failure costs, which you need for the suitability judgement. They are the wrong source for what happens at 4:45 on a Friday.

## The step inventory

Record the process as a table, one row per step, in the order the work actually flows. Swimlanes and flowchart notation are useful later for communicating with stakeholders, but a table is what you can measure and sort.

Capture these columns for every step:

| Field | What it records |
| --- | --- |
| `step` | A verb phrase: "Open attachment and read PO number" |
| `actor` | The role doing it, or `system` |
| `system` | Where the work happens (inbox, spreadsheet, ticketing system, ERP) |
| `input` | What must exist for the step to start |
| `output` | What exists afterward that did not before |
| `handling_time` | Touch time in minutes, median |
| `wait_time` | Elapsed time before the next step typically starts |
| `volume` | Occurrences per month |
| `exception_rate` | Share of cases that do not follow this path |
| `decision_rule` | If the step is a decision, the rule as the actor states it |

Here is a fragment of a real-shaped inventory for a vendor-invoice process:

| step | actor | system | handling_time | wait_time | volume | exception_rate |
| --- | --- | --- | --- | --- | --- | --- |
| Receive invoice email | system | shared inbox | 0 | 0 | 900/mo | 0% |
| Open attachment, read vendor and total | clerk | inbox | 2 | 4h | 900/mo | 3% |
| Look up PO number in the finance system | clerk | ERP | 3 | 0 | 900/mo | 12% |
| Re-key vendor, total, PO into tracking sheet | clerk | spreadsheet | 4 | 0 | 900/mo | 1% |
| Route to approver by department | clerk | email | 2 | 26h | 900/mo | 8% |
| Approver reviews and replies | manager | email | 5 | 26h | 900/mo | 15% |
| Mark approved in tracking sheet | clerk | spreadsheet | 1 | 2h | 880/mo | 1% |

Two things jump out of that table, and neither is visible in a flowchart. First, touch time is 17 minutes but elapsed time is over three days — the process is mostly waiting. Second, the single largest touch-time step is *re-keying data that already exists in an email*. That is the classic automation target: high volume, zero judgement, and the information is already structured somewhere upstream.

![Swimlane map of a vendor invoice process showing handoffs between clerk, approver, and systems](./img/process-map-swimlane.png)

## Measuring the baseline

You cannot prove an automation helped if you never measured what it replaced. Capture the baseline before you change anything, and capture it in the units the business already uses.

- **Annual labor hours.** `volume per month x handling time x 12 / 60`. The invoice process above is `900 x 17 x 12 / 60 = 3,060` hours a year. That number is what buys you a project.
- **Cycle time.** Median and 90th percentile elapsed time from first step to last. The median tells you the normal case; the 90th percentile is what customers and vendors complain about.
- **Error and rework rate.** How often does a case come back? Rework is invisible in a step inventory because it looks like the same steps happening twice.
- **Exception volume.** How many cases leave the happy path, and into how many distinct kinds of exception? Three exception types is a design problem; thirty is a signal that the "process" is really several processes wearing a trench coat.
- **Quality bar.** What is a wrong outcome, and what does one cost? A misrouted internal request costs an hour. A wrongly approved payment costs the payment.

Write these down with the date and the sample they came from. When you get to the rollout lesson, this baseline is the only thing that will let you claim an improvement.

## Deciding what is worth automating

Now score each step. Automation suitability is a function of two independent things: how mechanical the step is, and how much it costs you today.

Classify the judgement content of each step into one of four bands:

1. **Deterministic.** The rule is stateable and complete. "If the total is over 5,000, route to the director." Automate with plain logic — no AI needed, and using AI here makes it worse, not better.
2. **Structured interpretation.** The information is present but unstructured: reading a total off an invoice, classifying an email into one of six categories, summarizing a form's free-text field. This is where an AI step earns its place.
3. **Contested judgement.** The decision depends on context the systems do not hold — a relationship, an unwritten exception, a negotiation. Keep the human, but consider automating the *preparation* so the human decides faster with better evidence.
4. **Accountable decision.** Someone must be answerable: approving a payment, terminating a contract, telling a customer no. Never automate the decision. You may automate everything that leads up to it and everything that follows it.

Then plot each step on cost. A useful score is simply `annual hours x (1 + exception_rate)`, which penalizes steps whose exceptions will make them expensive to automate correctly. Rank the steps. Your first automation should be the highest-cost step that sits in band 1 or 2 and whose failure is cheap and visible.

Three anti-patterns to reject explicitly:

- **Automating the wait.** If 90% of cycle time is a queue, a faster clerk step changes nothing. Fix the queue — usually with notification, batching, or an approval threshold change — before you touch the touch time.
- **Automating a step that should be deleted.** The tracking spreadsheet in the example exists because the ERP reports were hard to run. Automating the re-keying preserves a spreadsheet nobody needs. Ask "what if this step simply stopped?" for every row.
- **Automating the accountable decision because it looks like a pattern.** Approvals are highly predictable — the approver says yes 94% of the time. Predictable is not the same as delegable.

## Setting the automation boundary

The last decision in the map is where your workflow starts and stops. State it as a contract:

- **Entry condition.** What event begins a run, and what must be present in it. "An email arrives in `ap@` with at least one PDF attachment."
- **Exit condition.** What state means done. "A row exists in the tracking table with status `approved` or `rejected` and an approver identity."
- **Out of scope.** Named explicitly. "Vendor onboarding, credit memos, and anything in a currency other than USD stay manual in phase one."
- **Human checkpoints.** Which steps require a person, and what that person is shown when they are asked. Every customer-facing or money-moving branch keeps a human review gate, and you name it here so nobody has to argue about it during the build.
- **Escape hatch.** What happens to a case the workflow cannot handle. It must go somewhere a human looks, with the original artifact attached — never silently dropped and never retried forever.

A tight boundary with a named escape hatch beats a broad one every time. You can widen scope after the narrow version has run for a month; you cannot un-launch a workflow that quietly mishandled 8% of cases.

## The process brief

Package everything into one document a stakeholder can approve. Keep it to two pages:

1. **Process name and owner.** One named person who can say yes.
2. **Current-state map.** The step inventory table plus a one-paragraph narrative.
3. **Baseline metrics.** Annual hours, median and 90th-percentile cycle time, error rate, exception count.
4. **Suitability assessment.** Each step banded 1 to 4, with the ranked automation candidates.
5. **Recommended boundary.** Entry, exit, out of scope, human checkpoints, escape hatch.
6. **Expected effect.** The specific metric you expect to move, and by how much. Be conservative and be numeric.
7. **Open questions and assumptions.** Anything you inferred rather than observed, flagged for the process owner to correct.

That brief is the artifact you carry into the next lesson, where the boundary becomes triggers, actions, and state.

## Practice

Choose a real, small business process you can observe directly — an intake form that gets re-typed somewhere, a weekly report someone assembles by hand, a shared inbox that someone sorts each morning. If you have no access to a workplace process, use a personal one with real volume, such as processing receipts for reimbursement.

1. **Observe and inventory.** Shadow the process for at least three real cases, including one that goes wrong. Build the step inventory table with every column listed above. You must have at least eight rows; if you have fewer, you are summarizing, not observing.
2. **Baseline it.** Compute annual labor hours, median cycle time, and 90th-percentile cycle time. Record the sample size and date. State the error rate even if your estimate is rough, and say how you estimated it.
3. **Band every step** 1 through 4 using the judgement classification, and write one sentence justifying each band-3 and band-4 call. For every step you band 1 or 2, note whether it needs an AI step at all — if the rule is stateable, say so and mark it plain logic.
4. **Rank and choose.** Score steps with `annual hours x (1 + exception_rate)`, rank them, and name the single step you would automate first. Defend the choice against the three anti-patterns: is it a wait, should it be deleted, is it an accountable decision?
5. **Write the boundary contract.** Entry condition, exit condition, out of scope, human checkpoints, escape hatch. Be specific enough that another person could tell whether a given case is in or out.
6. **Assemble the two-page brief** and get it in front of the process owner or, failing that, a peer playing that role. Capture their corrections in the open-questions section rather than editing your observations — the disagreement between the observed process and the believed process is itself a finding.
