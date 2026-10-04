---
course_id: agile310
project_id: agile310-x02
title: "The Silent Handoff: Runbook, Decision Records, and a Peer Takeover"
kind: supplementary-project
status: draft
hours_estimate: 5
difficulty: core
related_lessons:
  - agile310-06
  - agile310-07
objectives:
  - Collaborate through reviews, working agreements, and handoff documentation
  - Orchestrate, monitor, and harden the pipeline so it survives a bad run
competency_ids:
  - D7-S1-C01
  - D7-S1-C02
  - D1-S1-C03
---

## Scenario

Milestone 3's scenario made real: you are "going on leave" for a week. A peer from another capstone team takes over your pipeline with only your repository, your runbook, and the access you grant. During the takeover the facilitator injects two failures. You may not speak, message, or gesture. Every question your peer has to ask (they write it down instead of asking) counts as a documentation defect. You then fix the documents and run the takeover again with a different peer.

This is a non-coding project: the deliverable is the handoff pack and the evidence that it works, not new pipeline code.

## What you will build / produce

An evidence portfolio in `docs/handoff/` containing:

- The five lesson 7 documents, current with what actually runs: `README.md`, `runbook.md`, `data-dictionary.md`, `architecture.md`, and `decisions/ADR-00N-*.md` (at least three).
- `working-agreements.md` (one page, six items from lesson 7).
- `known-gaps.md` — the honest list of things that have never been tested in anger.
- `takeover-1.md` and `takeover-2.md` — facilitator logs from both takeovers.
- `defects.md` — every question from takeover 1, the document it exposed, and the fix (with a link to the commit or PR).
- `consumer-paragraphs.md` — the three audience paragraphs (analyst, data scientist, software engineer).

## Before you start (prerequisites, starter files or data)

- A capstone pipeline that has completed Milestone 3 (scheduled runs, alerts, run history), or the de210-x01 / agile310-x01 build if you are rehearsing.
- A peer (the "covering engineer") and a facilitator (instructor or a third learner).
- Access for the peer through a group or role (lesson 3), never your personal credentials. Remove it afterwards.

**Takeover script (facilitator):** 60 minutes, three tasks, two injected failures chosen from:

| Failure | How the facilitator injects it | What a good runbook lets the peer do |
|---|---|---|
| Expired/revoked source secret | Rotate the secret value to an invalid one | Recognise auth error class, avoid retrying, find the secret name, escalate to the source owner |
| Failing data test | Insert a duplicate key into a staging input for one window | See the run stopped before publish, read failing rows, fix or quarantine, clear and re-run the window |
| Missed run | Disable the schedule past its window | Notice the missed-run alert, re-enable, trigger the missed window manually |
| Slow stage | Halve warehouse size or remove a partition filter in a branch | Read run history, find the slow stage, compare to median, roll back |

**Tasks for the peer:** (1) Confirm whether last night's data is trustworthy; (2) diagnose and recover from injected failure A; (3) diagnose injected failure B and backfill the affected window(s).

## Milestones

1. **Write the pack.** Bring all five documents to "describes the system as built". Runbook in imperative numbered steps: health check, trigger, backfill, the failure modes you have actually seen (symptom, diagnosis, fix), freshness expectation, owner.
2. **Write three decision records.** One modelling, one reliability, one thing you declined to build. Context, decision, consequences; two paragraphs each.
3. **Write known gaps.** At least three, including any alert that has never fired for real.
4. **Takeover 1.** Silent. The facilitator logs start/end time per task, every written question, and whether each task was completed correctly.
5. **Fix.** For each question, change the right document (one job per document). Record in `defects.md`.
6. **Takeover 2** with a different peer. Compare question count and time per task.
7. **Revoke access** granted for the exercise and record it.

## Acceptance criteria

- [ ] All listed files exist and match the deployed system (a reviewer spot-checks three claims against the repo and run history).
- [ ] Takeover 1 and 2 logs show task outcomes, times, and every question asked.
- [ ] Every takeover-1 question maps to a document change in `defects.md`.
- [ ] Takeover 2 has fewer questions than takeover 1, or the log explains why not.
- [ ] No secret value or sensitive field value appears in any document, log excerpt, or screenshot.
- [ ] Peer access was granted via a role/group and has been revoked.

## Automated checks (coding courses) / Evidence checklist (non-coding)

- [ ] README under two screens: purpose, diagram, prerequisites, deploy/run commands, repo map.
- [ ] Runbook: numbered steps; at least three real failure modes with symptom → diagnosis → fix; backfill procedure with concurrency limit; freshness expectation; owner.
- [ ] Data dictionary: every warehouse table with grain; every fact/dimension column with definition, type, nullability, source.
- [ ] Architecture document updated for deviations from the lesson 2 plan, each with a reason.
- [ ] Three ADRs with context, decision, consequences.
- [ ] Working agreements cover definition of done, branch/review policy, schema-change notice, ownership/response, where decisions live, how quality issues are reported.
- [ ] Known gaps list, honest and specific.
- [ ] Facilitator logs for both takeovers, signed by the facilitator.
- [ ] Defects log with document changes linked.

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Runbook usability | Narrative prose; peer stuck | Peer completes both failure tasks with few questions | Peer completes all tasks in takeover 2 with zero questions |
| Documentation fit | Documents overlap and drift | Each document has one job and matches the system | Data dictionary attached to warehouse catalog, not a side file |
| Honesty | Gaps omitted | Known gaps listed with consequences | Gaps include proposed tests and owners |
| Collaboration | Defensive about questions | Every question treated as a defect and fixed | Consumer paragraphs led to a change a real consumer would notice |

## Stretch goals

- Record a five-minute walkthrough video for the receiving engineer and test whether it reduces questions further.
- Add a "first hour on call" checklist at the top of the runbook.

## Reflection prompts

- Which question from takeover 1 surprised you most, and what assumption did it expose?
- Which document did the peer open first, and does its content match that use?

## Instructor notes (common pitfalls, how to adapt for time)

- The silence rule is the exercise; enforce it, including body language.
- Facilitators should choose failures the learner's runbook claims to cover, plus one it may not.
- Count questions, but also note wrong actions the peer took confidently: those are often worse defects than questions.
- Short on time: one takeover with one failure, then the defects log.
