---
lesson_id: PREAPP-W4-04
course_id: PREAPP-W4
pathway: tech-pre-apprenticeship
title: Build an Automation
order: 4
kind: project
competency_ids:
  - D3-S3-C01
  - D3-S3-C02
objectives:
  - Design and build a working automation with a measurable time-saved estimate
  - Select an automation candidate by frequency, time cost, and repeatability
---

## Goal

Find one repetitive step in your own weekly workflow, design an automation for it, build it so it actually runs, and demo it to the cohort with a defensible estimate of the time it saves. This is the Week 4 milestone. A slide describing an automation you did not build does not count; neither does a working automation you cannot put a number on.

The automation must come from your real workflow — the pipeline you are working this week, not a hypothetical one.

## Requirements

**1. A candidate selected on evidence.** Submit a short written case for the step you chose, covering three things:

- **Frequency** — how many times per week you actually do it. Count, do not estimate from memory.
- **Time cost** — how long one repetition takes. Time yourself doing it at least twice.
- **Repeatability** — whether the step follows the same rules every time. A step where you make a fresh judgment call each pass is a poor candidate; a step where you make the same decision by the same rule is a good one.

You must show at least two candidates you considered and one sentence on why you rejected the other.

**2. A written design before you build.** Your design names three parts:

- **Trigger** — what starts it. A time of day, a new row, a new message, a manual click.
- **Steps** — the ordered actions, each one small enough to describe in a single sentence.
- **Output** — what exists when it finishes, and where it lands.

Write this down before you open any tool. A design you cannot write in ten lines is not yet a design.

**3. A working build.** It has to run end to end, on your real inputs, in front of the room. Tooling is your choice — a saved prompt plus a template, a spreadsheet formula, a scheduled script, a no-code workflow builder, a keyboard macro, a document generator. The program is not prescribing a vendor and does not care which you pick. It cares that it runs.

**4. A time-saved estimate you can defend.** Show the arithmetic:

```text
time saved per week
  = frequency per week
  x (minutes before - minutes after)
  - weekly upkeep minutes
```

Use measured before-and-after numbers, not guesses. If setup took ninety minutes, say so and state how many weeks until it pays back.

**5. A live demo to the cohort.** Five minutes: the problem, the design, the run, the number. Expect questions on the number.

## Constraints

- **Your own workflow only.** Not a teammate's, not a generic sales process.
- **Real data, real run.** The demo executes live on real inputs. A recording or a screenshot of a past run does not satisfy the requirement.
- **Measured, not remembered.** Before-and-after timings come from a timer you ran this week. "Feels like about twenty minutes" is not a measurement.
- **Nothing sends unreviewed.** If your automation drafts outreach, a human reads every message before it goes out. Auto-sending AI-generated messages to live prospects is out of bounds this week, without exception.
- **No fabricated content in outputs.** Everything from Lesson 03 still applies inside an automation. Automating a step does not relax the accuracy standard; it multiplies whatever standard you set.
- **Handle your data carefully.** Do not paste anything confidential into a tool the program has not cleared with you.
- **One step, done fully.** A narrow automation that runs beats an ambitious one that half-runs. Scope down until it works, then stop.
- **Build it yourself.** You may use Claude or ChatGPT to help you design, draft, or troubleshoot — you have to understand and be able to explain every part of what you ship.

## Definition of done

You are finished when all of these are true:

- [ ] Two or more candidates were considered, with frequency, time cost, and repeatability recorded for the one you chose and a stated reason for rejecting the other.
- [ ] A written design exists naming the trigger, the ordered steps, and the output.
- [ ] The automation runs end to end on real inputs without you fixing it mid-run.
- [ ] You have timed the manual version and the automated version, at least twice each.
- [ ] The time-saved calculation is written out with its inputs shown, including weekly upkeep and setup payback.
- [ ] You demoed it live to the cohort in five minutes and answered questions on the number.
- [ ] You can name one thing the automation cannot handle and what you would do about it next.

## Hints

**Find the candidate by watching your week, not by brainstorming.** For one day, note every task you do more than twice. The best candidates are boring and invisible: reformatting the same research into the same template, retyping contact details into a tracker, rewriting the same five-line follow-up, building the same daily list.

**Prompts you reuse are automations waiting to happen.** Check the prompt library you started in Lesson 02. Any prompt you have run more than three times this week is already a repeatable step — turning it into a saved template with fill-in slots, or into a scripted call, is often the entire project.

**Watch for the judgment trap.** Steps where you decide something fresh each time resist automation. But look closely: often the step is ninety percent mechanical with one real decision inside it. Automate the mechanical part and leave the decision to yourself. A half-automated step with a human checkpoint is a legitimate and often better answer.

**Time it before you touch it.** You cannot compute a saving without a before number, and reconstructing one after the fact is guesswork that will not survive questions. Run a timer today.

**Be conservative with the estimate.** Subtract upkeep. Include the time you spend checking the output — because you will be checking the output. A modest number you can defend line by line beats an impressive one that collapses under one question, and the room will ask.

**Test it on the ugly case.** Run it on your messiest real input, not your cleanest. Automations break on blank fields, odd formatting, and long names. Finding that in practice is better than finding it in the demo.

**Keep a note of what broke.** The one thing your automation cannot handle is a required part of your demo, and naming it honestly reads as competence, not failure.
