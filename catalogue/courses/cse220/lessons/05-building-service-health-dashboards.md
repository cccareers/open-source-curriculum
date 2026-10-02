---
lesson_id: cse220-05
course_id: cse220
pathway: cloud-support-engineer
title: Building Service Health Dashboards
order: 5
kind: lesson
competency_ids:
  - D6-S1-C03
objectives:
  - Build a dashboard that answers whether a service is healthy at a glance
---

## A dashboard is an answer, not an archive

Open almost any team's monitoring folder and you will find thirty dashboards, most of them built during one incident by one person and never opened since. They contain every metric the platform offered, in the order the console listed them, with default titles and no axis labels. During the next incident nobody opens them, because reading them takes longer than writing a fresh query.

That is the failure mode this lesson exists to prevent. A dashboard is not a place to put metrics. It is a **prepared answer to a specific question, for a specific reader, under specific conditions** — and the conditions that matter most are the ones you are in when you actually need it: a page has fired, you have been awake for ninety seconds, and you need to know whether this is real and where to look next.

So the first question is never "what should I put on it." It is **who opens this, and what are they deciding?**

## Three audiences, three dashboards

Most services need three, and trying to serve all three readers from one screen produces something that serves none of them.

**The triage dashboard.** Reader: whoever was just paged, or a support engineer picking up a ticket. Decision: is the service actually unhealthy, how bad, since when, and which layer do I look at next? This is the one you open first, every time, and it is the one this lesson is mostly about. It must fit on one screen with no scrolling, must be readable in under thirty seconds, and must be identical for every service so that a person who has never worked on this service can still read it.

**The service-owner dashboard.** Reader: the team that owns the service, during normal working hours. Decision: is anything trending toward a problem, did the last release change anything, where is capacity heading? This one can be long, detailed, and full of cause signals. Scrolling is fine. It is read deliberately, not in a panic.

**The status or executive view.** Reader: a support manager, an account team, occasionally customers. Decision: are we up, and is it affecting customers? Very few numbers, plain language, no jargon, no per-instance detail. Often this is a status page rather than a dashboard, and lesson 08 covers what goes on it during an outage.

Build the triage dashboard first. If you only ever build one, build that one.

## The layout that works

There is a reliable structure for a triage dashboard, and it follows the symptom-and-cause split from lesson 02. Read it top to bottom and the reading order matches the diagnostic order.

**Row 1 — Is it healthy?** Three to five large single-value panels showing the current state of your symptom signals against their expected range. Error ratio. Latency at p95 or p99. Traffic. Availability of the primary user journey. These should be readable from across a room. If someone can answer "is it healthy" without moving their eyes below row 1, the dashboard is doing its job.

**Row 2 — How did it get here?** The same symptom signals as time series, over a window wide enough to show the change point — typically six hours by default, with a comparison to the same period a week earlier where the tooling allows. This row answers "since when" and "is this new."

**Row 3 — Which dependency?** Latency and error rate for every downstream call, measured from your side. One panel per dependency, or one panel with a series per dependency. This is where roughly half of all triage questions terminate.

**Row 4 — Which resource?** Saturation signals: CPU with its `iowait` and `steal` split, memory available, disk queue depth and free space, connection pool in use against capacity, queue depth. Cause signals, deliberately below the symptoms.

**Row 5 — What changed, and where do I go next?** Deployment and configuration-change events, plus links: to the runbook, to the log query that shows recent errors, to the service-owner dashboard, to the dependency's own dashboard, and to whatever ticket queue this service uses.

That last row is the one people leave off, and it is the one that saves the most time. A triage dashboard that ends without telling you where to go next has stopped halfway.

## Panel design that survives an incident

**Choose the mark for the question.** A time series answers "how has this changed" and is your default. A single stat answers "what is it right now." A stacked area answers "what is the composition of this total" — good for status classes, bad for comparing individual series. A heatmap answers "how is this distribution shaped over time" and is the right, underused choice for latency. A table answers "which of these many things is worst" and is right for a top-ten list. A gauge with a dial answers almost nothing and consumes a lot of space; skip it.

**Percentiles, not averages, every time.** Put p50 and p99 on the same panel so the gap between them is visible; that gap is the tail, and its widening is diagnostic on its own. If your tooling supports a latency heatmap, use it — it shows a bimodal distribution instantly, which no percentile line can.

**Ratios, not counts, for errors.** A count of errors rises with traffic and looks alarming at peak for no reason. Plot the fraction, and put the raw count on the service-owner dashboard if anyone wants it.

**Give every axis a unit and a sensible zero.** Seconds, milliseconds, bytes, percent, requests per second — set it explicitly. Error ratio axes should be forced to a fixed range such as 0 to 5 percent, because an auto-scaled axis makes a 0.01 percent error rate look like a catastrophe. Latency axes should generally start at zero so the eye reads magnitude correctly, though a log scale is legitimate when the range spans orders of magnitude. Say which you chose.

**Mark the expected range.** A number with no context is not information. Draw the threshold line on the panel — the same number the alert uses, which you will derive in lesson 06 — so that "is this bad" is a visual question rather than a recall question. Colour is for state, not decoration: green, amber, red, meaning normal, degraded, breached. Nothing else on the dashboard should be red.

**Overlay deployments.** Every panel that can carry annotations should show release markers. "The graph changed shape at the vertical line labelled v2.14.1" is a complete diagnosis about a third of the time and it costs one configuration setting.

**Title every panel with the question it answers.** Not "CPUUtilization" but "CPU by instance — is any node saturated?" The reader is stressed and skimming; a title that states the question converts a panel into a sentence.

**No dual y-axes.** Two different units on one panel invites a visual correlation that may not exist. Two panels, aligned in time, are better and honest.

**Handle no-data explicitly.** Decide what a panel shows when the series is absent, and make it visibly different from zero. On a triage dashboard, a missing series must not look calm. This is where the heartbeat metric from lesson 03 earns its keep: one panel showing collection freshness, so you know whether you are looking at health or at silence.

## Variables and the reuse problem

Building one dashboard per service does not scale past about five services, and it guarantees drift: each one ends up laid out slightly differently, so the reader has to re-learn the screen every time.

The fix is **template variables**. Build one triage dashboard whose panels query by variable — service, environment, region, and time window — and select the target from dropdowns at the top. This works because you standardized resource labels in lesson 03. It is the direct payoff for that discipline, and it is worth mentioning to whoever resisted it.

The result is that every service in your estate has an identical triage screen. A support engineer paged about a service they have never touched can read it immediately, because the shape is familiar and only the name in the dropdown changed. That property — familiarity under stress — is worth more than any individual panel.

Keep dashboards in version control as code where your tooling allows, review changes like any other change, and put the dashboard definition next to the service it describes. A dashboard edited live by five people during three incidents becomes unreadable within a quarter.

## Time ranges and comparison

Default the triage dashboard to a window that contains both the incident and enough normality to see the change: six hours is a good default, one hour is too narrow to show a baseline, and twenty-four hours flattens short events into invisibility.

Offer, and use, a **week-over-week comparison** on the symptom panels. Traffic and latency have strong daily and weekly shapes, and "higher than an hour ago" is often meaningless where "higher than the same time last Tuesday" is decisive. Where the tooling cannot overlay a previous period, at least make the time picker obvious so the reader can jump.

Beware the aggregation the time range implies. Most tools silently coarsen the bucket as the window widens; at twenty-four hours you may be looking at five-minute or fifteen-minute rollups, and a three-minute outage will be a barely visible dimple. When you narrow the window and the spike gets dramatically taller, that is not the tool lying to you — it is resolution, and knowing it prevents a lot of confusion.

## Drill-down: the dashboard is a starting point

The triage dashboard's job ends when it has told you where to look. The transition to lesson 04's query work should take one click, not a fresh act of memory.

Make every panel a launching point. Link the error-ratio panel to the saved log query that lists recent error classes for that service. Link the dependency panel to that dependency's own triage dashboard. Link the resource row to the per-instance view. Where your tooling supports it, pass the current time range and variable selections through the link, so the target opens on the same window you were already looking at — losing the time range is a small annoyance that costs a surprising amount of attention during an incident.

And put the runbook link in row 5, in text, large. A dashboard that shows a red panel with no path to "what do I do about this" has done half a job.

## Where dashboards live in the major clouds

| Concept | Amazon CloudWatch | Azure Monitor | Google Cloud Monitoring |
| --- | --- | --- | --- |
| Dashboard object | CloudWatch dashboard | Azure dashboard, or a Workbook | Cloud Monitoring dashboard |
| Richer query-driven report | Logs Insights saved query on a widget | Workbook with parameters and sections | Dashboard with log and metric widgets |
| Template variables | Dashboard variables | Workbook parameters | Dashboard filters and labels |
| Definition as code | Dashboard body JSON | Workbook JSON or ARM template | Dashboard JSON via API |
| Deploy or change annotations | Annotations on a widget | Workbook time-range annotations | Events overlaid on charts |
| Cross-service rollup | Automatic dashboards per service | Workbook across workspaces | Dashboard groups and scopes |

All three give you a saved layout of chart widgets, a query per widget, some form of parameterization, and a JSON representation you can keep in a repository. Find those four things on any platform and you can build the layout above.

## What not to build

**The wall of every metric.** Sixty panels means no panel is read. If a panel has not been looked at during an incident in six months, delete it — the information is still in the metric store and a query away.

**The vanity dashboard.** A big screen in the office showing request counts going up. Harmless, but do not confuse it with an operational tool, and never let it be the one that is maintained.

**The duplicate.** Three near-identical dashboards for the same service, differing in which one has the panel you need. Consolidate ruthlessly; ambiguity about which screen to open costs real minutes.

**The dashboard as alert.** A screen nobody is watching at 03:00 detects nothing. Dashboards are pull; a human comes to them already worried. Alerts are push; they create the worry. Lesson 06 covers the harder half.

**The unowned dashboard.** Every dashboard should name an owner and a review date in a text panel. Unowned dashboards decay silently as label names, service names, and metric names change under them, and a dashboard that is quietly querying a metric that no longer exists shows a comfortable flat line.

## Practice

Continue with the storefront and the signal inventory from lesson 02.

**Exercise 1 — Specify the triage dashboard.** Produce a written specification, not a screenshot. For each panel: the row it sits in, its title phrased as a question, the mark type, the exact query in the pipeline or PromQL-style syntax from lesson 04, the unit and axis range, the threshold line if any, and one sentence on the decision it supports. You must have five rows following the structure above, no more than fourteen panels total, and everything must fit one screen. Justify anything you cut.

**Exercise 2 — Build it.** In whatever monitoring tool you have available — a cloud console, a self-hosted stack, or a local sandbox — build the dashboard to your specification. Then export its definition as JSON and save it alongside the specification. If you have no tool available, produce a full-page annotated sketch with every panel labelled to the same level of detail.

**Exercise 3 — The thirty-second test.** Give the dashboard to someone who does not know the service. Ask them, without help, to answer: is it healthy right now; if not, since when; and which layer would they look at next? Time them. Record what they looked at first, what they misread, and what they asked you about. Fix the dashboard based on what you observed, not on what you meant. Record the changes you made.

**Exercise 4 — Read it under three faults.** Describe what your dashboard would show, panel by panel, in each of these situations, and whether a reader could correctly distinguish them within thirty seconds:

1. The payment provider is timing out on 30 percent of calls; everything else is normal.
2. One of six instances has a full disk and is failing every request routed to it.
3. The monitoring agent stopped shipping data forty minutes ago and the service is completely fine.

If situation 3 looks the same as "healthy," fix that before doing anything else.

**Exercise 5 — Make it reusable.** Convert your dashboard to use template variables for service, environment, and region. List every query you had to change and every resource label the change depends on. Then state what would break if one team deployed a workload using `env` instead of `environment`, and how you would detect it.

**Exercise 6 — Add the exits.** Add row 5: deployment annotations, the runbook link, the saved error-log query link, one link per dependency dashboard, and an owner-and-review-date text panel. Confirm that each link carries the current time range through, and note any that do not.

Keep the specification and the exported definition. Lesson 06 puts thresholds on the same signals, and the project in lesson 10 requires this dashboard to be the first thing you open.
