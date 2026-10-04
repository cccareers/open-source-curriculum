---
lesson_id: cse220-09
course_id: cse220
pathway: cloud-support-engineer
title: Documentation, Escalation, and Postmortems
order: 9
kind: lesson
competency_ids:
  - D1-S1-C04
  - D5-S1-C02
  - D5-S1-C04
objectives:
  - Document troubleshooting steps and escalate an unresolved issue to the right team
---

## The part that compounds

Almost everything a support engineer does during an incident is consumed the moment it happens. The queries, the dashboards, the mitigations — all gone once the graph comes back down. What survives is what you wrote: the ticket record, the escalation, the postmortem, and the knowledge-base article.

That written residue is the only part of the job that compounds. An incident resolved and never written up costs you the full price twice, because the next occurrence starts from zero. An incident written up well means the next person recognizes it in ninety seconds. Over a year, the difference between a team that writes and a team that does not is not a matter of tidiness; it is the difference between a queue that gets shorter and one that does not.

This lesson covers four artifacts, in the order they appear: the troubleshooting record you keep *during* the work, the escalation you send when it is not yours to fix, the postmortem you write afterwards, and the knowledge-base article that turns one incident into a permanent answer.

## The troubleshooting record

Write it as you go. Reconstructing it afterwards produces a tidy narrative in which you went straight to the answer, which is useless to everyone including you, because the dead ends were the expensive part and they are exactly what the next person needs to skip.

The record lives in the ticket or the incident channel and it is a running log with one entry per meaningful step:

```text
14:12  Confirmed symptom: checkout 5xx ratio 22% (normal 0.05%), started 14:05.
       Query: storefront-app | filter route="/checkout" | stats by bin(1m)
14:14  Split by instance: all six instances affected equally. NOT a single bad node.
14:16  Split by status: 100% of failures are 500 from the order-write path.
14:18  Downstream check: payment-gateway p95 = 190ms, normal. NOT the payment provider.
14:21  orders-db p95 = 2.9s, was 40ms. DB path confirmed as the location.
14:23  DB CPU 96% (normal 30%), disk reads 5x. Connection pool pinned at 20/20.
14:25  Change check: release v2.14.1 deployed 13:58, seven minutes before onset.
14:27  Slow query log shows new full-scan query shape on `orders`, first seen 14:04.
       HYPOTHESIS: missing index on a query introduced in v2.14.1. Confidence: high.
14:31  Mitigation: rollback to v2.14.0 started. Expect error ratio to fall within 3 min.
14:36  Error ratio 0.06%, DB CPU 32%. Rollback effective. Hypothesis supported.
```

Six properties make that record useful, and each is a habit worth drilling.

**Timestamps on everything**, in one timezone, ideally UTC. Half the value of the record is the ordering.

**The query or command, not a summary of it.** "I checked the logs" is worthless. The literal query is reusable, verifiable, and often becomes a saved query or a runbook step.

**Negative results written down.** The lines beginning "NOT" are as valuable as the positive ones. They are what stops the next responder repeating work you already did, and they are the first thing an escalation target wants.

**Observation and inference kept apart.** Label hypotheses as hypotheses and give them a confidence. A guess that enters the record as a fact will be quoted for months.

**Every action recorded, including the ones that did nothing.** Especially any change to production. The undocumented "quick fix" applied during an incident is the origin of an enormous share of future incidents — as lesson 07's worked example showed, where a hand-applied change during one incident caused the next one three weeks later.

**Written for a stranger.** Expand the acronyms. Name the service. Do not write "the usual thing on the box."

## Escalation

Escalation is not surrender and it is not passing a problem sideways to make it stop being yours. It is routing a problem to the person who can actually solve it, with enough context that they can start work instead of starting over.

Two failure modes, and they are equally common. **Escalating too late** — spending ninety minutes on something a specialist would have recognized in five, while impact continues. **Escalating badly** — a message reading "checkout is broken, please look" that forces the receiving team to redo every diagnostic you already ran.

**When to escalate.** Decide the criteria in advance so the decision is not made under pressure. Escalate when: the component belongs to another team; the fix requires access or authority you do not have; you have worked the runbook to its end without a hypothesis; a time limit you set in advance has passed — twenty or thirty minutes for a high-severity incident is a reasonable default; impact is growing rather than shrinking; or the situation involves data loss, a security concern, or a legal or regulatory dimension, all of which escalate immediately and unconditionally.

**Where to escalate.** To one named owner, not to a broadcast. Get this right by knowing the service catalogue before you need it: which team owns which component, what their intake channel is, and what their severity ladder looks like. Escalating to the wrong team costs you the round trip and, worse, creates a comfortable feeling that it is now handled. If you genuinely do not know the owner, escalate to your own lead to find out rather than guessing — that is a legitimate escalation in itself.

**What the packet contains.** The receiving engineer should be able to act from your message alone, without asking you anything. That is the standard.

```text
ESCALATION — Storefront checkout failures
To: Database Platform team (owner of orders-db)
From: Cloud Support, incident INC-2291
Severity: SEV2, ongoing 47 minutes

IMPACT
~22% of checkout attempts failing since 14:05 UTC. Approximately 4,100
failed attempts so far. Browsing and account functions unaffected.
Mitigation in place: rolled back to v2.14.0 at 14:31; error ratio is now
0.06%. Customers are being served, but v2.14.1 cannot be redeployed.

SYMPTOM
Checkout returns 500 from the order-write path. orders-db query latency
p95 rose from 40ms to 2.9s at 14:04.

WHAT I HAVE RULED OUT
- Single bad instance: all six app instances affected equally.
- Payment provider: p95 190ms, unchanged.
- Application CPU/memory/disk on app tier: all within normal range.
- Network path: no REJECT records app-subnet to db-subnet in flow logs.

EVIDENCE
- orders-db CPU 96% (baseline 30%), disk read throughput 5x baseline.
- App connection pool pinned at 20/20 with non-zero wait count.
- Slow query log shows a new query shape doing a full scan on `orders`,
  first observed 14:04. Query text and plan attached.
- Release v2.14.1 deployed 13:58. Symptom onset 14:05.

HYPOTHESIS
The v2.14.1 query shape has no supporting index on `orders`. Confidence: high.

WHAT I NEED
Confirmation of the missing index and a recommendation: add the index,
or have the application team change the query. Until then v2.14.1 stays
blocked.

REPRODUCTION
Query text, execution plan, and slow-query excerpt attached. Reproduces
on the staging replica.

CONTACT
I am on until 18:00 UTC, in #inc-2291. Handover to <name> after that.
Full timeline in INC-2291.
```

Seven blocks: impact, symptom, ruled out, evidence, hypothesis, ask, and how to reach you. The "what I have ruled out" section is the one that earns you a reputation, and the "what I need" section is the one that gets you an answer — a message with no specific ask gets a specific non-answer.

Two more rules. **State the current mitigation status prominently**, because "customers are broken right now" and "customers are fine but we are running on a rollback" call for completely different urgency from the receiving team. And **stay engaged.** Escalation transfers the fix, not the ownership of customer impact. You remain the incident's owner, you keep communicating, and you follow up. Handing a ticket over and going quiet is the thing that gives escalation its bad reputation.

## The postmortem

Once the incident is closed, the postmortem is where an incident stops being a bad afternoon and becomes an improvement. Write one for every SEV1 and SEV2, and for anything that surprised you regardless of severity.

**Blameless is a mechanic, not a courtesy.** The rule is that the write-up describes what people did and why it made sense to them *at the time*, given what they knew and the tools they had. This is not politeness; it is what makes the document accurate. In a culture where the write-up names a culprit, people stop volunteering the details that make a postmortem worth reading, and you get a document that is diplomatic and useless. Write about systems and conditions: "the deployment pipeline had no index-coverage check" rather than "Sam forgot the index."

The structure that works:

**Summary.** Three or four sentences a busy person can read: what broke, for whom, for how long, what fixed it.

**Impact.** Quantified. Duration of customer impact, number of affected requests or customers, revenue or SLA consequence if known, and what was *not* affected. Vague impact statements make it impossible to prioritize the follow-ups.

**Timeline.** From the earliest contributing event — which is often days before the symptom — through detection, response, mitigation, and resolution. This comes straight from the scribe's log, which is why lesson 08 insists on it.

**Detection.** How did you find out, and how long did it take? If a customer told you before your monitoring did, that is one of the most important findings in the whole document and it belongs in the follow-ups.

**Contributing causes, plural.** Almost nothing has a single root cause. The example incident has at least four: a query shipped without an index; a pipeline with no check for it; a connection pool with no queue-wait alerting, which delayed the diagnosis; and a staging database too small for a full table scan to be slow, so the regression could not show up before release. Keep asking "and what allowed that?" until you reach something you can actually change. Stopping at the first plausible cause is what produces postmortems whose only action item is "be more careful."

**What went well.** Genuinely — the rollback was fast, the dashboard localized it in two queries, comms met every update time. This is not morale management; it identifies the practices worth keeping when someone later proposes changing them.

**What was difficult.** Where did you lose time? Missing telemetry, an out-of-date runbook, unclear ownership, a slow console. These are the highest-value follow-ups because they apply to every future incident, not just this one.

**Action items.** The part that makes the document real. Each one needs an owner by name, a due date, a tracked ticket, and a priority. An action item without an owner is a wish. Distinguish the ones that *prevent* recurrence from the ones that *reduce impact* or *improve detection* — you want at least one of each, because you cannot prevent everything and detection improvements pay off across incidents you have not had yet. Keep the list short enough to actually be done: three real items beat fifteen aspirational ones.

Then review the actions. A postmortem process with no follow-up mechanism produces excellent documents describing the same incident four times.

## The knowledge-base article

The postmortem is about one event. The knowledge-base article is about the *class* of problem, written for the next person who meets it, and it is a different document with a different audience and a different lifespan.

**Write for the person searching in a panic.** They will type the symptom, in the words the error message used, at two in the morning. So the title is the symptom, not the cause: "Checkout returns 500 with order-write timeout" finds readers; "Index coverage in the orders schema" does not. Put the literal error text in the body, verbatim, because that is what people paste into search.

The structure:

```text
TITLE      Symptom as the reader experiences it

APPLIES TO Service, environment, versions, and any condition that
           makes this article the right one — plus what it does NOT cover.

SYMPTOMS   What you observe, including exact error text, which alerts
           fire, and what the dashboard looks like.

DIAGNOSIS  The specific checks that confirm this is that problem, with
           the exact queries and the results that confirm or rule out.

CAUSE      Why it happens, briefly, in enough depth to be adapted.

RESOLUTION Numbered steps. Exact commands. What each step should produce.
           Any step that is destructive, irreversible, or needs approval
           is marked as such.

VERIFY     How you know it worked. A query and an expected result.

IF THIS DOES NOT WORK
           The next two things to try, and who to escalate to.

RELATED    Linked articles, the runbook, the postmortem, the dashboard.

METADATA   Author, last reviewed date, next review date, owner.
```

Six habits that separate an article people use from one they skim past.

**One problem per article.** An article covering "database issues" is found by nobody and helps nobody. Split it.

**Exact commands, copy-pasteable, with expected output.** "Check the connection pool" is not a step. The query, and what a healthy result looks like, is a step.

**Mark the dangerous steps.** If a step drops data, restarts production, or needs a change approval, it says so on its own line, before the command.

**Say what it does not cover.** Preventing a reader from following the wrong article is worth as much as helping them follow the right one.

**Include the failure path.** Most articles stop at the happy path. The reader who is still stuck after step 4 is the reader who most needs the next sentence.

**Date it and own it.** Documentation decays silently — service names change, consoles are redesigned, commands are deprecated. An article with a last-reviewed date lets a reader calibrate their trust. An article with an owner gets reviewed. Set a review cadence, and treat "I followed the article and step 3 no longer exists" as a defect to be fixed in the article immediately, by whoever hit it. That habit — fix the doc while you are standing in front of the problem — is what keeps a knowledge base alive.

A short note on the difference between a **runbook** and a knowledge-base article, because teams conflate them. A runbook is attached to an alert and answers "this fired, what do I do, right now" — terse, procedural, assumed to be read under stress. A knowledge-base article is searched and answers "what is this and how is it handled" — broader, explanatory, assumed to be read by someone who does not yet know what they are looking at. Lesson 06 required a runbook for every page-severity alert; this lesson requires an article for every recurring class of problem. Link them to each other.

## Practice

Use the checkout incident from lesson 08, or a real incident you have worked.

**Exercise 1 — Keep a live record.** Re-run the lesson 07 fault-isolation exercise, or work any real ticket, and keep the troubleshooting record as you go, in the format above. Every entry gets a timestamp, the literal query or command, and the result. Include at least three "NOT" lines. Afterwards, give the record to someone who was not there and ask them to describe what happened; note every place they had to ask a question, and fix those entries.

**Exercise 2 — Write an escalation packet.** Using the seven-block structure, write a complete escalation for the checkout incident to the database platform team. It must be self-contained: a reader with no prior context can act on it without asking you anything. Then write a second version of the same escalation for a *different* recipient — the application team that shipped the release — and note what changed. If nothing changed, one of the two is addressed to the wrong team.

**Exercise 3 — Route five escalations.** For each, name the team you would escalate to, the severity you would assign, the one-sentence ask, and the single most important piece of evidence to include.

1. Flow logs show REJECT records from the app subnet to the database subnet starting at 09:14; no change was made by your team.
2. A customer reports their order data appears in another customer's account.
3. The managed cache service is returning errors and the provider's status page shows no incident.
4. Disk on one instance filled because log rotation has been failing since a hand-applied change three weeks ago.
5. The nightly reconciliation job has not run for two nights and no alert fired.

**Exercise 4 — Write the postmortem.** For the checkout incident, write the full postmortem: summary, quantified impact, timeline from the earliest contributing event, detection with its time-to-detect, at least four contributing causes reached by repeatedly asking what allowed the previous one, what went well, what was difficult, and action items. Every action item gets an owner, a date, and a category of prevent, reduce impact, or improve detection — with at least one of each. Then remove every sentence that names a person as a cause and check that the document still explains what happened.

**Exercise 5 — Write the knowledge-base article.** Turn the same incident into an article using the full structure. The title must be the symptom in the reader's words. Include the exact error text, at least three diagnostic queries with the results that confirm or rule out, numbered resolution steps with expected output, a verification query, and the failure path. Mark any dangerous step.

**Exercise 6 — Test the article.** Give it to someone who has never seen the incident and have them work through it against a reproduction, without your help. Record every point at which they hesitated, guessed, or asked. Revise the article. Then answer in writing: which of your six documentation habits did the test show you had skipped, and what will you change about how you write the next one?
