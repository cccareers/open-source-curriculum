---
lesson_id: de101-02
course_id: de101
pathway: data-engineer
title: The Data Engineering Role
order: 2
kind: lesson
competency_ids:
  - D7-S1-C01
objectives:
  - Describe what a data engineer does and how the role relates to analysts, scientists, and software engineers
---

## What a data engineer is actually responsible for

A data engineer builds and operates the systems that move data from where it is created to where it is used, and keeps it trustworthy along the way. That sentence hides a lot of work, so it is worth unpacking into the things you will actually be held accountable for.

You are responsible for **availability**. When the sales dashboard is supposed to refresh at 6 a.m. and it did not, that is your pager, not the analyst's. You are responsible for **structure**. When a source system starts sending a column as a string instead of an integer, you are the person who notices before it silently corrupts three months of reporting. You are responsible for **shape**. Raw data almost never arrives in a form anyone can use directly, and the work of turning twelve messy source tables into one clean, well-named model that a stranger can query is engineering work, not clerical work. And you are responsible for **traceability**. When someone asks "where did this number come from?", there has to be an answer.

What you are usually *not* responsible for is deciding what the number should mean. That belongs to the business, mediated by analysts. A recurring failure mode for new data engineers is quietly making a definitional decision — "I'll just exclude cancelled orders from revenue" — inside a transformation where nobody can see it. Definitional decisions belong in the open, agreed with the people who own the definition, and written down.

### The data lifecycle you sit inside

It helps to see the whole chain, because your job is one link in it:

1. **Production.** An application, a sensor, a spreadsheet, or a vendor generates data as a side effect of doing something else. Nobody who built it was thinking about analytics.
2. **Ingestion.** Data is copied out of the source into a place you control, ideally without changing it.
3. **Storage.** It lands somewhere durable and queryable — a database, a warehouse, a file store.
4. **Transformation.** It is cleaned, joined, standardized, and reshaped into models built for consumption.
5. **Serving.** Analysts query it, scientists train on it, applications read it back, executives look at charts built on it.
6. **Observation.** Someone watches all of the above for freshness, volume, and correctness, and raises a hand when it breaks.

Data engineering owns steps 2 through 4 outright, shares 5 and 6, and negotiates hard about 1. Your leverage is highest at the boundaries — the handoff from producers and the handoff to consumers — which is exactly why this lesson is about people as much as pipelines.

## The neighbouring roles

You will spend your career working alongside three roles in particular. Confusing their goals with yours is the fastest way to build the wrong thing.

### Data analysts

Analysts answer business questions with data. Their output is an explanation: a dashboard, a report, a slide that says "churn is up 4 points and here is where." They live in SQL and BI tools, they know the business semantics better than you do, and they are your most frequent customer.

What analysts need from you: **stable, documented, well-named tables with predictable grain and predictable refresh times.** What breaks the relationship: renaming a column without warning, changing a join so a metric shifts silently, or a table that is sometimes fresh at 6 a.m. and sometimes at noon with no notice.

What you need from them: the business definition of every metric they want you to encode, and an honest statement of how fresh the data actually has to be. "Real time" is very often "by the time I get in tomorrow" once you ask what decision the number drives.

### Data scientists

Scientists build models — forecasts, classifiers, recommendations, experiments. They tend to want *more* raw data than analysts, not less, because a cleaned and aggregated table has already thrown away signal they might want.

What scientists need from you: access to data at a fine grain, historically accurate snapshots (what did this record look like *at the time*, not what does it look like now), and reproducibility — the same query run next month should return the same rows for the same period.

What you need from them: a clear statement of which features they need and how far back, and a heads-up when an experiment is about to multiply your query volume by fifty.

The subtle tension here is that analysts pull you toward curated, aggregated models and scientists pull you toward raw, granular ones. You resolve it by serving both: keep an immutable raw layer *and* build curated models on top of it, rather than choosing a side.

### Software engineers

Software engineers own the applications that produce most of your data. They are simultaneously your most important upstream partner and the group least likely to think about you, because their success is measured on the application, not on what you can extract from its database.

What you need from software engineers: **notice before schema changes**, stable identifiers that do not get reused, timestamps that record when a row was created and last updated, and ideally soft deletes or an event log rather than hard deletes that make rows vanish without trace.

What they need from you: not to be a liability. Do not run heavyweight analytical queries against a production database that is serving customers. Do not silently take a dependency on an internal column and then complain when it changes — a dependency nobody agreed to is not a contract, it is a trap you set for yourself.

The healthy version of this relationship is a stated interface: an agreed set of tables, an event stream, or an export, with a written promise about what will and will not change without notice. Getting that promise is a negotiation, and it is one of the highest-value things a junior data engineer can learn to do.

### A quick comparison

| Role | Primary output | Optimizes for | Typical time horizon |
| --- | --- | --- | --- |
| Data engineer | Pipelines and data models | Reliability, correctness, cost | Ongoing, operational |
| Data analyst | Explanations and dashboards | Business insight, clarity | Days to weeks |
| Data scientist | Models and experiments | Predictive accuracy | Weeks to months |
| Software engineer | The application | Product features, uptime | Sprint to sprint |

Notice the column that matters most: everyone else's success is measured by something *other* than your data being right. That asymmetry is why the collaboration skills in this lesson are a competency in their own right and not a soft extra.

## Working effectively across these roles

### Run a real intake

The most expensive mistake in this job is building a pipeline nobody needed, or building the right pipeline against the wrong definition. A short structured intake conversation prevents most of it. Ask, every time:

- **What decision does this data support, and who makes it?** If nobody can name a decision, you have found a request that can wait.
- **What exactly is the metric?** Get to a definition precise enough to write in SQL. "Active customer" needs a window, an activity type, and a treatment for cancellations.
- **What grain do you need?** One row per what — per order, per customer per day, per session?
- **How fresh, honestly?** Daily, hourly, and near-real-time have wildly different costs. Make the cost visible before agreeing.
- **How far back?** Backfilling three years is a different project from starting today.
- **What happens if it is wrong or late?** This tells you how much monitoring the request justifies.
- **What are you doing today instead?** There is usually a spreadsheet. It is the best requirements document you will get.

Write the answers down and send them back for confirmation. That one habit — restating the request in your own words before building — catches misunderstandings while they are still free.

### Make the handoff explicit

Between you and every consumer there is an interface, whether or not anyone named it. Name it. A lightweight agreement covers: which tables are public (and which are internal and may change), the grain of each, the expected refresh schedule, who to contact when it breaks, and how much warning you will give before a breaking change. Analysts will build months of work on any table you expose, so be deliberate about which ones you expose.

The same discipline runs upstream. When you take a dependency on a software team's table, tell them. A one-line message — "we now read `orders.status` nightly; please let us know before its values change" — converts an invisible coupling into a known one.

### Communicate about breakage like an engineer

Things will break. What separates a trusted data engineer from a merely competent one is how the breakage is communicated:

- Tell people **before they tell you**, if at all possible. Monitoring exists so the person who owns the fix hears first.
- Lead with **impact in their language**: "the revenue dashboard is showing yesterday's data and will be short about 4,000 orders until 2 p.m." beats "the incremental load failed on a null key."
- Give a **next update time**, and hit it even if the news is "still working on it."
- Afterwards, say what you changed so it does not recur. Every incident is either a monitoring gap, a contract gap, or a validation gap; naming which one turns an outage into an improvement.

### Speak in shared language

You will move between three vocabularies daily. Analysts say "metric" and "dimension"; scientists say "feature," "label," and "leakage"; software engineers say "service," "schema migration," and "deploy." Learning to translate is not a nicety — it is how you spot that the analyst's "customer" and the application's `customers` table are not the same population. When two groups use one word for two things, write both definitions down side by side and force the difference into the open.

A note on documentation: it is your primary collaboration tool, and it gets a full treatment in the next lesson alongside data modeling. For now, hold on to the principle — anything you agreed to verbally with a stakeholder is not yet real.

## A realistic week

New data engineers often expect the job to be mostly building. In practice a typical week is roughly:

- **Operating** what already exists: checking runs, fixing a failed load, chasing a source that changed. This is the largest slice, and it is real work.
- **Building** new pipelines and models against agreed requests.
- **Answering** questions — "why is this number different from that number?" — which is really investigative work through the lineage of your own systems.
- **Negotiating** with upstream teams and clarifying with downstream ones.

Understanding that split early keeps you from measuring your worth only by new pipelines shipped. Reliability *is* the product.

## Practice

Work through all three. They are deliberately conversational rather than technical, because that is the competency this lesson carries.

**1. Map a data ecosystem.** Pick an organization you know well — a current or former employer, a school, a nonprofit, or a well-understood public service like a city transit agency. Produce a one-page map that lists: at least four systems that produce data, at least three groups that consume it, and the questions each consumer group is trying to answer. For each producer-to-consumer path, note in one sentence what a data engineer would have to build to connect them. Mark the two paths you think are most likely to break and say why.

**2. Write an intake form and use it.** Turn the intake questions from this lesson into a short reusable form (Markdown is fine). Then role-play a real request with a classmate, mentor, or colleague: one of you plays an analyst asking for "a dashboard of monthly active users," the other runs the intake. The requester should deliberately be vague about the metric definition. Afterwards, write the restatement you would send back — the request in your own words, including the exact definition of "active," the grain, the freshness, and the history required. Swap roles and repeat with a data scientist asking for training data instead.

**3. Draft an upstream contract.** Imagine you depend on a software team's `orders` table for a nightly load. Write a one-page agreement, addressed to that team, that states: which columns you read, what you assume about them (nullability, whether identifiers are ever reused, whether rows are ever hard-deleted), what notice you are asking for before a change, and what you will do for them in return so your reads never threaten their production uptime. Keep it under 400 words — if it is longer than that, nobody will read it, which defeats the purpose.
