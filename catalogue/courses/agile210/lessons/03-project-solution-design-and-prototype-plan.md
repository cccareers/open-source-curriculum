---
lesson_id: agile210-03
course_id: agile210
pathway: prompt-engineer
title: "Project: Solution Design and Prototype Plan"
order: 3
kind: project
competency_ids:
  - D4-S1-C02
  - D4-S1-C03
objectives:
  - Design the solution and plan the prototype, showing how each component meets
    a stated requirement
---

## Goal

This is stage 2 of 7 of your capstone. One build, seven passes; this pass produces the design.

You have a signed-off solution brief. Turn it into a **solution design and a prototype plan**: a component map, a written trace from every requirement in the brief to the component that satisfies it, an interface design for wherever a human touches the system, and a plan for the fastest possible rough prototype that tests your riskiest assumption before you commit thirteen hours to building the real thing.

Nothing you build in this stage has to work properly. The prototype is disposable on purpose. What has to be right is the design and the evidence that your riskiest assumption survives contact with real input.

## What you inherit from stage 02

Everything here starts from your brief, and you should have it open the whole time:

- **Section 2 (the problem)** and its baseline numbers become the thing your design has to beat.
- **Section 4 (success criteria)** becomes the requirement list your components trace to. Every criterion needs an owning component, or it will not be met.
- **Section 5 (scope boundary)** decides what does not get designed. Resist the urge to design the out-of-scope items "while you're in there".
- **Section 6 (data and access)** becomes the input to stage 04, and any access you have not confirmed yet is now urgent.
- **Section 7 (assumptions and risks)** is the source of the assumption you will prototype against. Pick the one that would hurt most if wrong.

If the brief changed at the stage-02 checkpoint, work from the corrected version and note the change in your design.

## Requirements

Five deliverables. They are listed in build order and the later ones depend on the earlier ones.

### 1. Component map

One diagram plus one table. The diagram can be drawn in any tool, including on paper and photographed — it is not assessed on beauty. It must show:

- Every **trigger** (what starts work: a form submission, a new email, a schedule, a manual run).
- Every **data source** you read from and every **store** you write to.
- Every **AI step**, marked distinctly from deterministic steps.
- Every **integration point** — each API, webhook, or connector crossing a boundary between tools.
- Every **human touchpoint**: where a person supplies input, reviews output, or is notified.
- The **escape hatch** from your brief: where an unhandleable case goes.

![Reference layout for a capstone solution architecture, showing trigger, data layer, AI workflow, store, human review, and monitoring](./img/capstone-solution-architecture.png)

Then the table, one row per component:

| Component | Type | What it does | Tool | Reads | Writes | Fails how |
| --- | --- | --- | --- | --- | --- | --- |
| Invoice intake | Trigger | Watches the accounts inbox for PDF attachments | Automation platform | Mailbox | Raw record | Missed mail if polling stops |
| Field extraction | AI step | Reads the PDF text into strict JSON fields | Model API | Raw record | Extracted record | Malformed JSON, wrong field |
| Totals check | Rule | Verifies line items sum to the stated total | Automation platform | Extracted record | Validation flag | Silently passes a rounded total |

The "fails how" column is the one people skip and the one stage 07 depends on. One realistic failure per component, in plain language.

### 2. Requirement trace

A table proving your design actually covers the brief. One row per requirement — every success criterion from section 4, plus every explicit in-scope item from section 5.

| Req ID | Requirement (from brief) | Component(s) that satisfy it | How it will be evidenced |
| --- | --- | --- | --- |
| SC-1 | Median arrival-to-record time under 5 minutes for 80% of invoices | Intake trigger, extraction, record writer | Timestamp comparison over 25-invoice batch in stage 07 |
| SC-2 | Extraction accuracy above 90% on supplier totals | Field extraction, totals check | Labelled 30-document sample scored in stage 07 |
| SB-3 | Handwritten invoices route to manual handling | Format gate, escape hatch | Deliberate handwritten case escalates in stage 07 |

Three rules for this table:

- **Every requirement gets a row.** A requirement with no component is a hole in the design; find it now, when it is free to fix.
- **Every component appears somewhere.** A component that satisfies no requirement is scope you invented. Delete it or justify it in one sentence.
- **The evidence column names a test, not an intention.** "Will be accurate" is not evidence. "Scored against 30 labelled documents" is.

### 3. Interface design

Wherever a human touches this system, that touchpoint is designed, not improvised. This applies even when the interface is a spreadsheet view or a notification message — most capstone interfaces are, and they are still interfaces.

For each human touchpoint, produce a sketch (wireframe, screenshot mock-up, or annotated drawing) plus a short note covering:

- **Who uses it and in what state of mind.** A reviewer clearing a queue of forty items behaves differently from a manager reading a weekly summary.
- **What decision they make here**, and what information they need in front of them to make it well.
- **How AI involvement is disclosed.** Anything a model generated is labelled as such where the user sees it. This is not decoration; a user who cannot tell which text was generated cannot calibrate their trust in it.
- **How uncertainty is shown.** Confidence, or a flag on checks that failed, surfaced *before* the user acts rather than buried.
- **What the user can do when it is wrong.** Reject, edit, escalate — not just approve. An approve-only interface is a rubber stamp.
- **Accessibility basics.** Readable contrast and text size, meaning never carried by colour alone, labelled fields, keyboard-reachable controls, and plain language over jargon.

Design at minimum: the **review or approval touchpoint**, and the **output touchpoint** where the result reaches whoever consumes it. If your solution has an input form or a chat entry point, design that too.

### 4. Prototype: test your riskiest assumption

Pick the single assumption from section 7 of your brief whose failure would cost you the most, and build the crudest possible thing that tests it. Typically that is one of:

- **"The model can do this reliably enough."** Prototype: take 15 to 20 real inputs, run your candidate prompt by hand, and score the results against what a human would have produced. No automation, no integration — just the prompt and a scoring sheet.
- **"The data is available and clean enough."** Prototype: pull a real export or make a handful of real API calls and look at what actually comes back, including the records that are missing fields.
- **"A person will actually use this."** Prototype: a clickable mock or even a paper sketch, put in front of the real user, with you watching them try to complete one task.

Timebox this to about two hours. The prototype is throwaway and should look like it. Its output is a **finding**, written down: what you tested, on what, what happened, and what you changed in the design because of it.

Run at least **two iterations**. The first version of a prompt or a mock is never the one you learn from; the learning is in what you changed after seeing the first result and what happened when you ran it again. Record both rounds.

### 5. Prototype plan for the remaining stages

One page allocating the rest of the capstone. For each of stages 04 through 08, state what will exist at the end of it, and what the instructor checkpoint should look at. Then two lists:

- **Cut list, in order.** The first three things that come out of scope if you fall behind, decided now.
- **Open questions**, each with who can answer it and by when. Access you are still waiting on goes here, and it should be the first thing you chase.

## Design decisions worth making explicitly

Five decisions shape every capstone design, and leaving any of them implicit is how a design turns out to have been three different designs by stage 05. Make each one deliberately, write it in a sentence with its reason, and put it in the design document where your instructor can challenge it.

**Where the record lives.** Your solution needs one place that holds the state of each piece of work. A relational table, a document store, or a no-code database table are all legitimate; passing values from step to step with nothing persisted is not. Decide now, because the choice determines what your integrations look like and whether stage 07's counts are possible at all.

**Where the AI boundary sits.** Draw a line around the parts of the process that genuinely require reading unstructured input. Everything outside that line is rules. Learners consistently draw this line too wide on the first attempt; when in doubt, shrink it. A capstone with one excellent model step and six reliable rules demonstrates more competence than one with four mediocre model steps.

**Where the human sits.** Not "a human checks the output" but *which state*, *which queue*, *which person*, and *what they are deciding*. If the answer is "the client will look at it sometimes", you have no gate.

**What the trigger is.** Event-driven or scheduled, and what happens if the trigger misses something. Almost every design benefits from a secondary sweep — a scheduled pass that catches records the primary trigger did not see — and it costs ten minutes to add at design time.

**What synchronous means here.** Does a person wait for the result, or does the work happen in the background and notify? This decides how much latency you can tolerate, which decides whether a slow model step is a problem or a non-issue. Get it wrong and you will optimise something nobody was waiting for.

## Worked example: one requirement, traced

Requirements tracing sounds bureaucratic until you watch it catch something. Take a criterion from a brief:

```text
SC-2: Extraction accuracy above 90% on supplier name, invoice number,
      date, and total, measured against a 30-document labelled sample.
```

Trace it honestly and four questions appear immediately, all of which are cheaper to answer now than in stage 07.

*Which component owns it?* The extraction step — but also the totals check, because an arithmetic validation catches a class of extraction error before it reaches a human. Two components, one requirement, and the trace table should say so.

*What does the component need in order to be measurable?* A stored per-field output, not a blob of text. That is a schema decision, and it belongs in the stage-04 data model. Discovering it in stage 07 means re-running everything.

*Where does the labelled sample come from?* Thirty documents, labelled by a human. That is an hour of somebody's time, and it needs booking now. It also means holding thirty real documents back from your own development work — a decision that has to be made before you start building, not after you have tuned against all of them.

*What if it comes in at 84%?* The fallback belongs in the brief's assumptions. Perhaps: narrow scope to the suppliers with consistent layouts, and route the rest to manual handling. Writing that down now converts a future crisis into a planned branch.

One criterion, four design consequences. That is what the trace is for; it is not paperwork, it is the cheapest bug-finding you will do in the whole capstone.

## Common design failures

**The design that is really a tool list.** "Automation platform, a database, and a model API" is not a design. A design says what each component does with which data, and what happens when it fails.

**The undesigned interface.** The build gets a careful component map and the review screen gets "the reviewer will look at the record". Then in stage 08 a real user approves three items without opening the source, because approving was easier than checking. The interface is part of the system's accuracy, not decoration on top of it.

**The optimistic path.** A design with no branch for missing data, low confidence, or an unavailable service. If your map has no arrows leading anywhere except forwards, it is a diagram of the day everything worked.

**The prototype that proves nothing.** Testing the assumption you were already confident about, on inputs you chose, feels productive and buys nothing. Prototype the thing that would hurt.

**The design that cannot be cut.** If every component is load-bearing, you have no cut list, and the first delay becomes a crisis. Design so that the last increment can be dropped without the whole thing collapsing.

## Constraints

- **No new tools.** Build the design out of what you already know: the automation platform, no-code database, model API, and interface tooling from earlier in the pathway. If the design needs something you have never used, that is a design smell — find the version of the design that does not.
- **Design against the brief, not around it.** If the design cannot meet a criterion, do not quietly weaken the criterion. Raise it at the checkpoint and change the brief on the record, with the stakeholder's agreement.
- **A human stays in the loop on anything consequential.** Anything that reaches a person outside your team, or that would be expensive to get wrong, passes a human review touchpoint. Design it as a real state with a queue and an owner.
- **Prefer rules to model calls.** Every step that can be done deterministically should be. Model calls are for genuinely unstructured input. A design with an AI step doing arithmetic will be sent back.
- **This is your build, in your accounts.** Design for what you can actually stand up yourself. Do not design something that requires deploying into a client's live environment.
- **Real data, handled carefully.** Use real inputs, but redact personal data before it goes anywhere in a course build, and flag every personal-data field in the component table now — stage 06 will audit it properly.
- **Six hours.** Roughly one hour on the component map, one on the trace, one and a half on interfaces, two on the prototype, half an hour on the plan. If the prototype overruns, cut the second iteration of it before you cut the trace table.

## Definition of done

Every line must be demonstrable at the checkpoint, not asserted.

**Design**

- The component map shows every trigger, source, store, AI step, integration point, and human touchpoint, and the escape hatch.
- Every component has a named tool and one realistic failure mode.
- No component in the map is missing from the table, and none is in the table but absent from the map.

**Trace**

- Every success criterion and in-scope item from the brief has at least one row.
- Every row names a component that exists in the map.
- Every row's evidence column names a specific test with a sample size or a threshold.
- Any requirement you cannot satisfy is listed explicitly as a gap, with a proposed brief change.

**Interfaces**

- The review touchpoint and the output touchpoint each have a sketch and a design note.
- AI-generated content is visibly labelled at every point a user sees it.
- Uncertainty is visible before the user acts.
- Every review interface offers reject and escalate, not only approve.
- Accessibility basics are addressed in writing: contrast, text size, meaning not carried by colour alone, labelled controls, plain language.

**Prototype**

- The riskiest assumption is named, and it is genuinely the riskiest one.
- The prototype ran on **real** input, not invented examples.
- Two iterations are recorded, with what changed between them and why.
- A written finding states whether the assumption held, with numbers where numbers are possible.
- The design was changed in response to the finding, or the finding explicitly confirmed the design and says so.

**Plan**

- Stages 04 to 08 each have a stated end state.
- The cut list has at least three items, in priority order.
- Every open question has an owner and a date.

## Rubric

Your instructor will score the stage on these five criteria. This is a checkpoint gate, not a grade to negotiate: anything at "not yet" is re-worked before stage 04 starts.

| Criterion | Not yet | Meets | Strong |
| --- | --- | --- | --- |
| Component map | Boxes and arrows with no tools or failure modes named | Complete map plus table with tools and failure modes | Failure modes are specific and clearly informed the design |
| Requirement trace | Requirements missing, or evidence stated as intent | Every requirement traced to a component with a named test | Gaps found and surfaced honestly with proposed brief changes |
| Interface design | Interfaces described in prose only, or approve-only | Sketches with disclosure, uncertainty, reject and escalate, accessibility | Designed from the user's actual working conditions, with evidence from watching one |
| Prototype and iteration | One pass on invented input | Two iterations on real input with a written finding | Finding changed the design in a way you can point at |
| Plan and risk | No cut list, open questions unowned | Stage end states, cut list, owned open questions | Cut list reflects a real judgement about what matters least |

## Hints

**Draw the map before you write anything else.** Ten minutes with a pen will expose more design problems than an hour of prose. When you cannot draw a step, you do not yet understand it.

**Build the trace table backwards.** Start from the brief's criteria, not from your design. Working forwards from the design makes you write requirements that your design happens to satisfy, which is exactly the opposite of the point.

**Choose the prototype target by asking what would hurt most.** If the model turns out not to be accurate enough, everything downstream is wasted; that usually makes prompt quality on real documents the right first prototype. If the data turns out to be unavailable, nothing gets built at all; if access is still unconfirmed, prototype that instead, today.

**Use the ugliest inputs you have.** Prototyping on your three cleanest examples tells you nothing you did not already assume. Deliberately include the truncated one, the one with a missing field, the forwarded one with four replies above it.

**Score the prototype, do not eyeball it.** Even a fifteen-row sheet with a correct/incorrect/partial column and a note per row turns an impression into evidence, and gives you a number you can compare against in stage 07.

**Design the review screen as if you had to work it for a day.** The single biggest quality lever in most capstones is whether the reviewer can see the source and the output side by side. If they have to open another tab to check anything, they will stop checking.

**Say what the system does not know.** Interfaces that show only confident answers train users to trust confident wrong answers. A visible "low confidence, please check" is worth more than three points of accuracy.

**Keep the design one page bigger than you want to.** If the whole design fits comfortably in a paragraph, it is probably underspecified; if it needs six pages, it is probably too big for the hours you have left.

**Let the cut list be uncomfortable.** The point of writing it now is that you are calm now. Whatever you list third is the thing you will fight to keep at hour thirty-five, which is exactly why it should be decided today.

## Checkpoint questions

Your instructor gates stage 04 on this conversation. Prepare answers to all of these; each one is a place designs routinely turn out to be thinner than they looked on paper.

- Point at the component that satisfies your hardest success criterion, and tell me how it will be evidenced.
- Which step could be a rule instead of a model call, and why is it not?
- Show me the branch for missing data, and the branch for low confidence.
- What did the prototype tell you that you did not already believe?
- What did you change because of it?
- Who works the review queue, what do they see, and what can they do besides approve?
- Which of your open questions blocks stage 04 if it is not answered this week?
- If you lose eight hours, what comes off the cut list first, and what does the client lose?

Answers of the form "I'll work that out when I build it" are the reason this checkpoint exists. Work it out now, on paper, where it costs minutes rather than hours.

## Hand in

Submit one document or folder containing:

1. The component map (diagram) and component table.
2. The requirement trace table.
3. Interface sketches with a design note for each touchpoint.
4. The prototype record: what was tested, on what real inputs, both iterations, the scoring sheet, and the written finding.
5. The design change made in response to the finding.
6. The prototype plan: stage end states, cut list, open questions with owners and dates.
7. A one-paragraph note of any change to the brief, with who agreed it.
