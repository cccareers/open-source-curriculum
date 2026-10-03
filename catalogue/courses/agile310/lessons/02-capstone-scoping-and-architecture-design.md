---
lesson_id: agile310-02
course_id: agile310
pathway: data-engineer
title: Capstone Scoping and Architecture Design
order: 2
kind: lesson
competency_ids:
  - D7-S1-C02
  - D6-S1-C01
objectives:
  - Scope an end-to-end pipeline against a stated business question and document
    the architecture
---

## Capstones fail at the beginning

Nearly every capstone that goes badly went badly in week one, and it almost always fails in one of two ways. Either the scope was never bounded — the learner picked "analyse the whole dataset" and discovered in week four that there was no finish line — or the architecture was never written down, so every decision got made twice, inconsistently, at the moment it became urgent.

Both failures are cheap to prevent and expensive to fix. This lesson is the prevention. By the end of it you will have a scoping and architecture document that your reviewer signs off before you provision a single resource, and that document becomes the contract you are assessed against for the rest of the course.

Two things are being built here at once. The first is the habit of writing down a system's shape before building it, which is the documentation competency this course tags: data models, pipelines, and system architecture, described well enough that somebody else can act on them. The second is the deployment judgement that decides what actually goes into the cloud account — which services, in which layers, with what data flowing between them. The document is the artefact; the judgement is what it records.

## Start from a question, not a dataset

The most common opening move is the wrong one: find an interesting dataset, load it, and look for something to say. It feels productive and it produces pipelines with no acceptance criteria, because there is no way to tell whether the output is right when nobody stated what the output was for.

Invert it. Write the business question first, in one sentence, in the language of somebody who does not work in data. Then find a dataset that can answer it.

A usable question has four properties.

**It names a decision.** "Which three pickup zones have the worst late-night trip cancellation rate, and is it getting worse?" implies somebody will do something about a zone. "Explore taxi trips" implies nothing.

**It has a unit.** Per zone, per day, per product, per customer segment. The unit becomes the grain of your warehouse table in Milestone 2, and if you cannot state it now, you will discover the ambiguity as a duplicate-row bug later.

**It has a time dimension.** Almost every real data question is really "and how is it changing?". A time dimension also forces incremental processing, which is where the interesting engineering lives.

**It is answerable from the data you can legally get.** Check this before you fall in love with the question. Half of good scoping is discovering early that a required column does not exist.

Write the question at the top of your document and do not change it silently. If it needs to change — and sometimes it should — change it in a review, with a note on what you learned that forced the change. That note is worth more to your reviewer than the original question was.

## Choosing a dataset you can finish

Your dataset comes from the program's approved list, and it must be **public or synthetic**. This is not a formality. A training cloud account has weaker controls than a production one, several people can see into it, and it gets torn down at the end of the course. Real customer data does not go into it, ever, under any framing — not anonymised, not "just a sample", not from a previous employer. If you want a dataset the list does not include, propose it in review and get it added; do not import it and apologise later.

Within that constraint, select for finishability.

- **Two sources, not five.** Your ingestion milestone requires more than one source, because joining across sources is where ingestion gets genuinely hard. Three is already ambitious. Five is a way of never starting the modelling.
- **Different shapes, deliberately.** A bulk file drop plus an HTTP API is the ideal pair: one gives you volume and schema drift, the other gives you pagination, rate limits, and authentication. You practised both in de101; here they have to survive being scheduled.
- **Big enough that layout matters, small enough that a run is minutes.** Somewhere in the low gigabytes is the sweet spot. If a full run takes two hours, you will run it five times all course and learn nothing about reliability. If it takes four seconds, partitioning decisions are unmeasurable.
- **A dimension you can join to.** Zones, product categories, regions, calendar attributes. Without at least one conformed dimension, your warehouse layer is a single fact table and the modelling milestone is thin.
- **Known defects, ideally.** Duplicates from retried deliveries, nulls where they should not be, a category column with a long tail. Clean data hides the work.

Record the choice with its licence, its refresh cadence, its approximate volume, and — this is the part people skip — the columns you actually need. A source with two hundred columns of which you need eleven is a much smaller problem than it looks, but only if you say so up front.

## Sizing the work to the hours you have

You have roughly thirty hours of build time across three milestones and a delivery. That is not a lot. Scope is the single lever you control, so use it explicitly.

The technique that works is **writing the non-goals down**. A non-goal is something a reasonable person might expect you to build, that you are deliberately not building, with a one-line reason. Real examples from capstones that finished on time:

- *Not building a dashboard.* The deliverable is a queryable table plus three saved queries; visualisation is out of scope and the presentation uses static charts.
- *Not doing streaming.* The pipeline is batch on a daily schedule. Streaming was assessed in de201; adding it here would take hours from the warehouse model, which is where this capstone's assessment weight sits. (Streaming is genuinely optional in this course. If your question needs sub-hour freshness and you have the hours, propose it — but propose it as a trade, naming what you are dropping.)
- *Not handling late-arriving dimension changes.* Dimensions are overwritten each run rather than versioned; the question does not need point-in-time dimension accuracy.
- *Not supporting multiple environments.* One environment, one account, teardown at the end.

Every non-goal you write is an argument you do not have to have in week five, and a reviewer who sees them knows you are making decisions rather than drifting.

Then map the work onto the three milestones you are actually given. Ingestion lands raw data reliably; transformation models it into the warehouse; orchestration makes the whole thing run unattended and survive failure. Note in your document which piece of your specific pipeline lands in which milestone. If some piece does not fit any of them, that is a strong signal it is a non-goal.

## The layered shape you are going to build

Almost every batch pipeline that works has the same four layers, whatever the provider or the tool names. Adopt them by name — it makes your document readable and your reviews faster.

**Landing (raw).** Exactly what the source sent, unmodified, written once and never edited. Partitioned by ingestion date, with the source's own format preserved where practical. This layer exists so that when you get a transformation wrong — and you will — you can rebuild from truth instead of re-fetching from a source that may no longer have the data.

**Staging (conformed).** Typed, deduplicated, column-renamed, one table per source entity. Still no business logic. This is where a string timestamp becomes a timestamp and where the retried-delivery duplicates disappear.

**Warehouse (modelled).** The dimensional model that answers the question: facts at a stated grain, dimensions joined in, tested. This is the layer analysts query and the layer Milestone 2 is graded on.

**Serving (answers).** The handful of queries or views that produce the numbers in your final presentation. Small, and worth naming separately, because it is the layer that proves the question got answered.

Landing and staging usually live in object storage; warehouse and serving live in a cloud-native warehouse service. That split is the default for a reason: object storage is cheap and format-agnostic, so it absorbs raw volume, while the warehouse charges for structure and speed, so you only put modelled data there.

![Four-layer capstone reference architecture showing sources feeding a landing zone in object storage, then staging, then a warehouse-modelled layer, then serving queries, with an orchestrator spanning all stages](./img/capstone-reference-architecture.png)

## Making it concrete once

The lesson bodies in this course avoid naming a cloud provider, because your program fixes one and the shape does not change. But a design document must be concrete, so here is one worked instantiation — a pipeline answering a question about late-night trip cancellations by zone:

| Layer | Service | Object |
| --- | --- | --- |
| Landing | Object storage bucket | `raw/trips/ingest_date=2026-03-01/part-*.json.gz` |
| Landing | Object storage bucket | `raw/zones/ingest_date=2026-03-01/zones.csv` |
| Staging | Warehouse views over external tables | `stg_trips`, `stg_zones` |
| Warehouse | Warehouse managed tables | `dim_zone`, `dim_date`, `fct_trip_daily` |
| Serving | Warehouse views | `vw_cancellation_rate_by_zone_day` |
| Orchestration | Managed scheduler triggering containerised jobs | one daily run, three tasks |

(An external table only exposes the landed files as they are; staging's typing and deduplication happen in the view, or in a table built from it, which is why the row says views over external tables.)

Write your equivalent table. It takes ten minutes and it converts "we will use cloud storage and a warehouse" into a list of things you can actually create, name consistently, and later tear down. Object naming is worth a moment's thought now: a path that carries the entity and the ingestion date is what makes a partial reprocess possible in Milestone 3.

## What the design document contains

Keep it to two pages. A document nobody reads has no value, and length is the main reason documents go unread. Sections, in this order:

1. **The question.** One sentence, plus the unit and the time grain.
2. **Stakeholder and decision.** Who would act on the answer, and what they would do.
3. **Sources.** Each with format, access method, volume, refresh cadence, licence, and the columns you need.
4. **Architecture.** The layer table above, plus the diagram.
5. **Data model sketch.** Fact tables with their grain stated explicitly, dimensions, and the join keys. One sentence per table is enough at this stage; grain is not optional.
6. **Non-goals.** The list you wrote, with reasons.
7. **Risks.** Three to five, each with a trigger and a response. "Source API rate-limits at 1,000 requests per hour; if backfill exceeds it, chunk by day and run overnight" is a risk entry. "The API might be slow" is not.
8. **Milestone plan.** What lands in Milestone 1, 2, and 3, and what "done" looks like for each in your specific pipeline.
9. **Open questions.** The things you want a reviewer to decide with you.

Two habits make this document useful rather than ceremonial. **State grain everywhere** — every fact table, every output. Most modelling bugs are grain bugs, and they are nearly free to catch on paper. And **date the document and keep it in the repository**, at `docs/design.md`, changed by pull request like code. A design doc that lives in a chat message is a design doc that will disagree with the system by week three.

## Reading a design document critically

You will review a peer's document and they will review yours. Reviewing is a skill and it is mostly a matter of knowing which questions find real problems:

- What is the grain of the largest table, and does the question's unit match it?
- If the pipeline runs twice on the same day, what happens? (If the answer needs a paragraph, there is a design problem.)
- Which layer holds the data if a transformation is wrong and has to be redone?
- What is the biggest single cost in this design, and roughly what is it per run?
- Which requirement, if it turns out to be twice as hard as expected, sinks the timeline? Is it in Milestone 1 or Milestone 3?
- Is there a non-goal here that should really be a goal, or a goal that should be a non-goal?

Ask those six of every document, including your own, and most week-four disasters stop happening.

## Practice

Work on your own capstone; the output of this exercise is the document you will be reviewed on.

1. **Write three candidate questions** for datasets on the approved list. For each, name the decision, the unit, and the time grain in one line. Then delete two — write one sentence explaining why the survivor is the most finishable, not the most interesting.
2. **Do a data feasibility check.** For the surviving question, list the exact columns needed to answer it and confirm each exists in a source you can legally access. If one is missing, either find a proxy and note the compromise, or go back to step one now rather than in week three.
3. **Draft the full design document** against the nine-section outline above. Two pages. State the grain of every table you name.
4. **Write at least four non-goals**, each with a reason, and be explicit about your streaming decision either way.
5. **Draw the architecture diagram.** Boxes for sources, the four layers, and the orchestrator; arrows for data flow; annotate each arrow with the format and the trigger (schedule, event, manual). Hand-drawn and photographed is fine.
6. **Run the six critical questions** against your own document and fix what they expose. Then swap documents with a peer, run them against theirs, and give the feedback as written comments — you will do a lot more of this in lesson 7.
