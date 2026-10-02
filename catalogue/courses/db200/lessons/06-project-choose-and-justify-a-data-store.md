---
lesson_id: db200-06
course_id: db200
pathway: software-developer
title: 'Project: Choose and Justify a Data Store'
order: 6
kind: project
competency_ids:
  - D3-S1-C03
  - D5-S1-C02
objectives:
  - Justify a data-store choice on technical and operational grounds
---

## Goal

Produce a written data-store recommendation that a tech lead could act on without asking you a follow-up question.

You are not building an application this time. The deliverable is a decision document: a recommendation for one workload, defended on technical, operational, and economic grounds, with a data-model sketch showing that the store you picked can actually serve the queries the product needs. This is the artifact a working developer contributes to a feasibility review, and producing a good one is a harder and more valuable skill than writing another CRUD route.

Your document will be read by three people with different questions. The tech lead wants to know whether it works and what breaks. The engineering manager wants to know who runs it and what happens at 3am. The finance partner wants to know what it costs this year and next. Write for all three.

## The scenario

**Trailhead** is a five-year-old company selling a mobile app for hikers. It has 400,000 registered users, about 45,000 of whom open the app in a given week. Everything currently lives in a single PostgreSQL instance with one read replica, which the team is happy with and does not want to abandon without cause.

Product has approved a feature called **Trail Pulse** for the next two quarters. It has four parts:

**1. Live location breadcrumbs.** While a hike is in progress, the app posts the user's coordinates every 30 seconds. A hike averages four hours. Roughly 3,000 hikes run concurrently on a Saturday morning, with a long tail of a few hundred on weekdays. Breadcrumbs are read back in exactly two ways: the hiker's own map replay after the hike, and a "share my progress" page a friend can refresh while the hike is running. Breadcrumbs older than 18 months are deleted. Estimated volume is about 2.5 billion points over that window.

**2. Trail conditions feed.** Users post short reports on a trail — mud, snow, a downed tree, a closed bridge — with optional photos, tags, and a severity. Roughly 9,000 posts a day. Reports display on the trail page newest-first, and are also surfaced on the app home screen for trails the user follows. Report format changes often; product has already asked for two new fields since the spec was written, and expects more.

**3. "Hikers like you" suggestions.** Suggest trails based on trails completed by people who have completed several of the same trails as you, out to three degrees of connection. Product wants this refreshed nightly, not live. Around 400,000 users and 12,000 trails, with about 6 million completion records.

**4. Session and rate-limit state.** The mobile app's auth tokens and per-device rate-limit counters, currently rows in Postgres that are updated on nearly every API call. The team believes this is the reason the primary's write load has doubled in a year.

Additional facts you must account for:

- The team is four backend developers. One has run a MongoDB replica set at a previous job. Nobody has operated Cassandra, Neo4j, or a Kafka cluster.
- There is no dedicated operations or platform team. The four developers share an on-call rotation.
- Infrastructure runs on a single cloud provider in one region. Managed services from that provider are pre-approved by procurement; anything else needs a security review that takes about six weeks.
- The current database bill is approximately $1,400 a month. Finance has approved an additional $2,500 a month for Trail Pulse and will consider more with justification.
- Legal requires that trail-condition reports be deleteable within 30 days of a user request, and that hike breadcrumb data be exportable per user.
- The company has had two customer-visible incidents in the last year, both database-related. Leadership is risk-averse about anything described as "eventually consistent" and you will need to address that directly rather than around it.

## Requirements

**R1 — Access-pattern inventory.** For each of the four parts, list the access patterns using the four-column form from lesson 04: what is asked, what must come back together, estimated frequency, and read or write. Derive the frequencies from the numbers in the scenario and show the arithmetic — a reviewer must be able to check your reasoning, and "high volume" is not a number.

**R2 — A recommendation per part.** For each of the four parts, name one store and the family it belongs to. "Keep it in Postgres" is a legitimate and sometimes correct recommendation, and at least one part of this scenario is a trap in which it is the right answer. State clearly whether each part is a new store or the existing one.

**R3 — Technical justification.** For each recommendation, address:
- Which access patterns the store makes cheap, and which it makes expensive.
- The consistency requirement for each write path, stated at a rung from lesson 03's spectrum rather than as "consistent" or "not."
- What happens during a partition or a node loss, and whether that behavior is acceptable for this workload.
- What data the new store owns and how it stays coherent with what remains in Postgres.

**R4 — Operational justification.** For each recommendation, address:
- Who runs it, and whether it is a managed service or self-operated.
- What the on-call engineer sees when it fails, and what they are expected to do. Be specific: name the failure and name the response.
- The skills gap against the team described above, and how you would close it.
- How data gets in during migration, and what the rollback plan is if the new store does not work out.

**R5 — Economic justification.** For each recommendation, address:
- An estimated monthly cost at current volume and at three times current volume, with the sizing assumptions that produce the number. Use published pricing from the vendor and cite the page.
- The engineering time to build and migrate, in developer-weeks.
- The ongoing operational cost in developer time per month.
- Whether the total lands inside the $2,500 budget, and if not, what you are asking for and what it buys.

**R6 — Data-model sketch.** For the two parts you consider highest-risk, produce a real model, not a description: the collections, tables, or key patterns; at least one realistic example record per collection with plausible values; the partition or primary key with the reasoning behind it; the index list with the access pattern each index serves; and every embed-versus-reference or duplication decision with its one-sentence justification. Then walk each access pattern from R1 through your model and state the round trips it costs.

**R7 — The rejected alternative.** For each of your four recommendations, name the strongest alternative you did not choose and give the specific reason. "It was slower" is not a reason; "it needs a three-node cluster nobody on this team can operate, for a workload that peaks at 100 writes per second" is.

**R8 — Risk register.** List the five risks you consider most serious across the whole proposal. For each, give the impact, the likelihood, and the mitigation. Include at least one risk that your own recommendation introduces — a proposal with no downsides has not been thought through.

**R9 — A one-page executive summary.** Written first in the document, written last in practice. It must state what you recommend, what it costs, what the biggest risk is, and what decision you are asking for, and it must be readable by the finance partner. If a reader stops after page one, they should still be able to approve or reject the proposal.

## Constraints

- The recommendation must be implementable by four developers sharing an on-call rotation. A design requiring a platform team you do not have is not feasible, however elegant.
- You may introduce at most **two** new data stores. Every additional store is another thing to back up, monitor, upgrade, secure, and page someone about, and this constraint exists to force that cost into your reasoning.
- Postgres stays. It is the system of record for users, trails, and completions, and you are not proposing to move that.
- Every cost figure must trace to a cited vendor pricing page and stated sizing assumptions. An uncited number is treated as absent.
- No vendor marketing claims. If a benefit appears in your document, it must come from documentation, a benchmark you can point to, or your own stated reasoning.
- Address the leadership concern about eventual consistency explicitly, in plain language, somewhere the executive summary points to. Do not argue that they are wrong to worry; show them where the risk exists in your proposal and where it does not.
- Length target: 6 to 10 pages including the model sketches. A document nobody finishes is a document that does not persuade.

## Definition of done

Your submission is complete when all of the following are true.

- A single document — `trail-pulse-recommendation.md` — contains the executive summary, the four recommendations, the justifications for R3 through R5, the model sketches, the rejected alternatives, and the risk register, in that order.
- Every one of the four parts of Trail Pulse has an explicit recommendation, including any you propose leaving in Postgres.
- Every recommendation is defended on all three feasibility dimensions. A part defended only technically is incomplete.
- Every cost figure has a citation and a stated assumption behind it.
- The model sketches contain example records with realistic values, an index list, and a round-trip count per access pattern.
- At most two new stores are introduced, and the document says so explicitly.
- The eventual-consistency concern is addressed in named plain language.
- A colleague who has not read the scenario can read your executive summary and correctly state what you are recommending and what it costs.
- You have presented the recommendation aloud in under ten minutes, taken at least three questions, and recorded in the document what you would change based on them.

## Hints

**Do the arithmetic before you have an opinion.** Breadcrumbs at one point per 30 seconds, four hours per hike, 3,000 concurrent hikes gives you a write rate. Compute it. That number will decide part 1 more honestly than any reasoning about families, and it may well be smaller than your instinct expects — a great many "we need a distributed store" conclusions dissolve when someone finally divides.

**Look for the traps.** One part of this scenario has modest volume and a shape Postgres handles natively; recommending a new store for it costs the company money and buys nothing. Another has a shape that looks like a graph problem and may not be one, because the refresh is nightly and a batch job over 6 million rows is not a real-time traversal. Read the frequency column before you read the shape.

**Postgres extensions count as staying in Postgres.** A `jsonb` column with a GIN index, a `TIMESTAMPTZ` partitioned table, or a recursive query are all things the team already runs and already knows how to back up. Weigh them properly rather than treating "no new store" as the boring option.

**The team's skills are a technical fact, not a soft consideration.** A store nobody has operated has a real, quantifiable cost: slower incident response, a longer build, and a bus factor of one. Put it in the document as a cost, in weeks, not as a caveat at the end.

**Separate what must be consistent from what must be fast.** Very little in this scenario needs linearizable reads. Say so per operation, and you will find the argument writes itself.

**Deletion and export requirements are design inputs, not compliance paperwork.** A store where deleting one user's data means rewriting a partition is a different proposal from one with a per-user key. Work the legal requirements into the model sketch in R6 rather than mentioning them at the end.

**Write the executive summary last and the risk register honestly.** The fastest way to lose a technical audience is a proposal with no acknowledged downside. The fastest way to win one is to name your own proposal's weakest point before anyone else does, and say what you would do about it.
