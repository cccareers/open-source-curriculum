---
lesson_id: cyb120-09
course_id: cyb120
pathway: cybersecurity-support-technician
title: "Project: Incident Triage and Timeline"
order: 9
kind: project
competency_ids:
  - D3-S1-C01
  - D2-S1-C02
objectives: []
---

## Goal

You are the analyst on shift. Your instructor gives you a log package from a simulated environment — a day's alert queue plus the underlying telemetry — and no answers. By the end of this project you will have produced the first two artifacts of a real case: **a triage record for every alert in the queue**, and **a merged, sourced incident timeline** for whatever turns out to be an incident.

This is the deliverable a real handover depends on. Somebody else has to be able to read your output and continue the case without talking to you. That is the standard you are being held to.

## What you are given

Your instructor supplies a case package containing:

- An alert queue of roughly fifteen to twenty-five alerts spanning one working day, from a mix of detection sources.
- Endpoint telemetry: process creation, file writes, network connections by process.
- Authentication and directory logs.
- Network flow records covering at least thirty days.
- DNS query logs.
- Web proxy logs.
- Mail gateway logs.
- An asset inventory listing hosts, their roles, their owners, and their business criticality.
- A change calendar for the period.

At least one host in the package has a **known clock offset**, documented somewhere in the material. At least one alert is a benign true positive that a careless analyst will misclassify. At least one genuine incident begins *before* the earliest alert that references it. Expect all three; finding them is part of the work.

Nothing in the package is malicious. It is synthetic data describing malicious activity.

## Requirements

### Part 1 — Triage the queue

Produce a triage record for **every** alert in the queue. Each record contains:

1. The alert identifier, time in UTC, rule, and entity.
2. The four triage questions with your answers: is it real, is it authorized, what is the blast radius, what else looks like this. Each answer cites the specific source and query that supports it.
3. The pivot you ran for question four, written out as an actual query or filter expression, and its result — including negative results.
4. The disposition: false positive, benign true positive, suspicious-unresolved, or incident. Use the terms precisely; a benign true positive is not a false positive.
5. The single next action, with an owner.
6. Time spent, to the nearest five minutes.

Before the individual records, include a **clustering analysis**: group the queue by entity and show which alerts belong to the same investigation. State how many distinct investigations the queue actually contains, as opposed to how many alerts it contains.

After the records, include a **worked queue order** — the order in which you would actually have handled the queue — with a three-sentence justification referring to impact and confidence rather than to the tools' severity fields.

### Part 2 — Declare

For every alert cluster you dispose of as an incident, write a formal declaration containing: UTC timestamp, incident type, proposed severity with a one-sentence justification tied to business impact, at least two corroborating observations from independent sources, the current known scope, and the declaring analyst. Keep each declaration under 150 words.

If the package contains more than one incident, declare them separately and say explicitly whether you believe they are related, with your evidence and your confidence.

### Part 3 — Build the timeline

For your primary incident, produce a single merged timeline covering everything you can establish. It must:

- Be in **UTC throughout**, with every conversion applied and a note recording the conversions, including the clock offset you found.
- Have one line per observation, each with time, source, and statement.
- **Cite a retrievable source for every entry** — the log name and the record identifier or query that produces it.
- Tag every entry as observation, inference, response action, or communication.
- Attach a confidence rating to every inference and state what would confirm it.
- Include **negative results** where they define scope — for example, that a search across all servers for a given destination returned nothing over the retained period.
- Name the analyst for each entry (you, throughout, but the field must be there).

Establish, and state explicitly, the **earliest evidence of the incident** — not the earliest alert. If your earliest evidence is at the edge of the available data, say that the true start may be earlier and name the data that would settle it.

### Part 4 — Scope and characterize

Produce:

- An **affected assets and accounts table**: identifier, type, role, status (suspected, confirmed, contained, cleared), owner, and the evidence supporting the status.
- A **characterization** of the intrusion using the tactic-and-technique approach from lesson 04: what the attacker achieved at each stage, with evidence references, and an explicit note of anything you are inferring rather than observing.
- An **indicator list** in the record format from lesson 04, each with type, context, first and last seen, source, confidence, and recommended action.

### Part 5 — Hand it over

Write a **handover note of no more than 400 words** for the analyst taking the next shift. It must state: current status and severity, what is established, what is inferred, what you have already done, what is in flight, the numbered open questions with owners, and what you would do next. This is a real piece of writing, not a summary of your own document — assume the reader has three minutes.

## Constraints

- **All times UTC.** Any entry derived from a host with a clock offset must show the correction applied and reference where you established the offset.
- **No unsourced claims.** If you cannot cite the record, it does not go in the timeline as an observation.
- **Observation and inference must be visually distinguishable** at a glance. A reader must never have to work out which one they are reading.
- **No blame language.** Describe actions and systems, not character or competence.
- **Defang all indicators** in prose: `hxxp://`, brackets around dots in domains and addresses.
- **Do not fabricate.** If the package does not support a claim, write "not established" and name the data source that would establish it. A well-marked gap scores better than a confident guess, and a confident guess that turns out wrong scores worst of all.
- Everything must be **contemporaneous in form**: write it as you work rather than reconstructing it at the end. Your instructor may ask for your working notes alongside the finished record.
- No response actions are performed in this project — there is no environment to act on. Where you would have contained, record the decision you would have made and its reasoning, and mark it clearly as proposed rather than executed.

## Definition of done

You are finished when all of the following are true.

- [ ] Every alert in the queue has a complete triage record with all six elements.
- [ ] The clustering analysis states the number of distinct investigations and shows the grouping.
- [ ] At least one alert is correctly disposed of as a **benign true positive**, with the exception documented and a tuning proposal attached.
- [ ] Every incident has a declaration meeting the format above.
- [ ] The timeline is in UTC, fully sourced, fully tagged, and includes at least three negative results.
- [ ] The clock offset in the package has been found, documented, and applied.
- [ ] The earliest evidence of the incident is stated and is **earlier than the earliest alert** that referenced it, or you have shown why it is not.
- [ ] The affected assets table accounts for every host and account that appears anywhere in your analysis.
- [ ] The characterization maps every stage you can evidence, with inferences marked.
- [ ] The indicator list contains at least six indicators of at least three different types, each with confidence and a recommended action.
- [ ] The handover note is under 400 words and a classmate who has not seen the package can, after reading only that note, state the current status and the next action.
- [ ] A classmate has reviewed your timeline against the source package and found no entry that cannot be retrieved from the cited source.

## Hints

**Read the whole queue before you work any of it.** The clustering is where most of the value is, and you cannot see it one alert at a time. Sorting by entity — host, account, external address — usually collapses the queue by half.

**Do question three early, not last.** Establishing blast radius before you go deep is what stops you spending ninety minutes on a kiosk while a server alert sits unread.

**Pivot on the strongest fact, not the most interesting one.** The strongest fact is usually a hash, an external address or domain, an account name, or a distinctive command line. Search the whole environment for it, over the whole retained period, before you do anything else.

**Build the timeline backwards from your anchor.** You will have one solid point — the first alert. The value is in what came before it. Ask "what would have had to happen for this to be possible?" and then go looking for exactly that.

**Watch for internal spread that is not the attacker.** Users forward things. A second infection whose delivery came from an internal mailbox is a different story from a second infection the attacker caused, and it changes both your containment logic and what you tell people.

**A benign true positive is a finding, not a nuisance.** Getting one of these right — with the exception documented and a tuning proposal attached — demonstrates more judgment than finding the incident, because it requires you to resist the pull of the exciting answer.

**Correlate sizes and times, not just addresses.** An archive created at one time and an upload of the same size shortly after is one of the most consequential correlations available to you, because it moves a case from "possible access" to "probable exfiltration."

**Write the negatives as you go.** You will not remember at the end which searches you ran and found nothing, and those searches are exactly what proves your scope was real.

**When you catch yourself writing "clearly" or "obviously", stop.** Those words almost always precede an inference wearing the costume of an observation. Replace the sentence with the evidence, and then say what you think it means, labelled.
