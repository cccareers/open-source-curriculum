---
course_id: agile310
media_id: agile310-v01
type: video-script
title: "Lead with the Answer: Restructuring a Capstone Presentation in Ten Minutes"
format: talking-head
target_runtime: "8 min"
related_lessons:
  - agile310-08
objectives:
  - Present the finished pipeline and its findings to a non-engineering audience
competency_ids:
  - D7-S1-C03
  - D7-S1-C01
---

## Purpose

After watching, the learner can restructure a build-order presentation into answer-first (pyramid) order, translate three technical terms into plain consequences, and volunteer caveats before the panel asks.

## Audience and prerequisites

agile310 learners preparing for the final delivery (lesson 8), with a draft slide outline.

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Presenter to camera. On-screen title: "Slide 1: Data Sources". | "Here's how most capstone presentations start: a slide called Data Sources. By slide six, the operations manager on the panel has checked their phone twice. Let's fix that, using the zone cancellations example from lesson 2." |
| 0:25 | Split screen: left, "Build order" list: Sources, Ingestion, Staging, Modelling, Orchestration, Answer. Right: empty. | "This is build order. It's the order you lived through, so it feels natural. But your audience only cares about the last line." |
| 0:45 | Right side fills: "Answer -> Three reasons it holds -> Detail behind each". Label: "Pyramid". | "Flip it. Answer first. Then the three reasons the answer holds. Then the detail behind each reason, only as deep as the room needs." |
| 1:05 | Card: "Write the last slide first: What sentence should the manager repeat tomorrow?" Example: "Late-night cancellations in zones 7, 23 and 41 are three times the city average and rising about half a point a week; those three zones are where to act first." | "Lesson 8's best hint: write the last slide first. What's the one sentence you want the manager to repeat to someone else tomorrow? Here's ours. Every other slide either supports that sentence or gets cut." |
| 1:45 | Slide 1 mock-up: question in large type; the answer below with a single bar chart of the top three zones vs the city average. | "So slide one is the question and the answer, together, inside the first three minutes. One chart. Big numbers. A scale for every number." |
| 2:15 | Bad vs good captions: "3,412 cancellations" vs "3,412 late-night cancellations in 28 days, about one in five late-night requests in these zones". | "A number on its own means nothing. Give it a scale: over what period, out of how many, compared with what." |
| 2:40 | Slide 2 mock-up: "Why you can trust this" with three bullets: "Runs every night on its own: 21 of the last 21 runs succeeded"; "Checked automatically: 14 tests on every run, including totals that must match the source"; "Running it twice never doubles the numbers". | "Reason one is trust, and it's for the analyst. Notice the language. Not 'idempotent'. 'Running it twice never doubles the numbers.' Not 'data tests'. 'Checked automatically, and here's what's checked.'" |
| 3:20 | Jargon translation table on screen: Idempotent -> running it twice does not double the numbers. Partitioned -> filed by date so a query reads only the days it needs. Watermark -> a bookmark of what we have already collected. Retry with backoff -> if the source is busy, wait a little longer each time before trying again. | "Every technical term either gets one plain sentence or gets cut. Here are four you'll probably need." |
| 3:50 | Slide 3 mock-up: "When it breaks": a single run-history row for an actual failure, annotated "Source down 2 hours, recovered on its own, nobody paged". | "Reason two is reliability, and it's for the engineer. Don't describe retry logic. Show one real incident: the source was down, the pipeline recovered, here's the run." |
| 4:25 | Slide 4 mock-up: cost: "About $X per month at today's volume; the biggest cost is the nightly warehouse build; one change cut it by Y%". Placeholder values labelled "use your own measured figures". | "Reason three is cost, and it's for the manager. A real figure, with its basis: per run, per day or per month. And one measured improvement, before and after." |
| 5:00 | Slide 5 mock-up: "What this does not tell you" with two caveats: "Covers March only"; "Cancellations by drivers and riders are combined". | "Then the highest-leverage thirty seconds: caveats, unprompted. A limitation you volunteer reads as rigour. The same limitation pulled out of you by the panel reads as an oversight." |
| 5:35 | Diagram: four boxes, landing -> staging -> warehouse -> serving, each with a one-line plain caption. Timer overlay "2:00 max". | "Architecture gets two minutes and one diagram. Describe each box by what it does for them. 'This is where the raw data lands untouched, so if I make a mistake I can rebuild without going back to the source.'" |
| 6:05 | Demo placeholder: run history view, then the serving query result read aloud. Lower-third: "Live, not screenshots. Fallback recording ready, and say if you use it." | "The demo: open the run history, run the serving query, read the answer aloud. Have a recording ready, and if you use it, say so." |
| 6:35 | Card: the four questions: "How do you know the numbers are right? What happens at 3 a.m.? What would this cost at ten times the data? What would you do differently?" | "Prepare two-sentence answers to the four questions you're afraid of. And when you don't know: 'I don't know, and here's how I'd find out.' That's an acceptable answer. Guessing isn't." |
| 7:10 | Before/after outline side by side. Timer: "20:00 hard stop". | "Same content, new order. Answer, three reasons, caveats, architecture in two minutes, demo, questions. Rehearse it out loud against a timer twice, because reading slides silently takes half the time of saying them." |
| 7:40 | Presenter to camera. | "Now take your own outline, write the last slide first, and reorder everything else behind it." |

## On-screen assets and B-roll

- Slide mock-ups for the zone-cancellations example. All figures marked as illustrative; learners must use their own measured values.
- Jargon translation table as a downloadable one-pager.

## Accessibility

- Captions; slide text is also read aloud.
- Charts use direct labels on bars (zone names and values) rather than a color legend.
- Mock-up slides use at least 24 pt text and high-contrast palettes.

## Check for understanding

1. In what order should the question, the answer, and the architecture appear? *Answer: question and answer first (within three minutes), then the reasons the answer holds, with architecture briefly afterwards.*
2. Rewrite "the pipeline is idempotent" for an operations manager. *Answer: e.g., "If it runs twice by mistake, the numbers don't double."*
3. Why volunteer caveats before questions? *Answer: a limitation you state reads as rigour and protects the headline number from being misread; one extracted by the panel reads as an oversight.*
