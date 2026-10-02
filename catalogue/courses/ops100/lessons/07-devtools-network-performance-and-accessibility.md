---
lesson_id: ops100-07
course_id: ops100
pathway: quality-assurance-software-engineer
title: DevTools Network, Performance, and Accessibility Audits
order: 7
kind: lesson
competency_ids:
  - D2-S1-C02
  - D3-S1-C02
  - D5-S1-C01
objectives:
  - Audit a page's network activity, performance, and accessibility from the browser
---

## From debugging a page to auditing one

Lesson 06 used DevTools to isolate a specific breakdown someone had already noticed. This lesson turns the same instrument toward a broader question: how is this page doing overall, even when nothing has obviously broken yet? Auditing network activity, performance, and accessibility is proactive QA work — catching problems before a user files a complaint about them, and giving developers the kind of usability and functionality feedback that only comes from actually measuring a page rather than eyeballing it.

## Network: what's actually being requested, and how it went

Open the Network panel and reload the page (with "Preserve log" off, so you see a clean run) to see every request the page makes: HTML, CSS, JavaScript, images, fonts, and any API calls, each with a status code, size, and timing.

```text
Name              Status   Type   Size    Time
/api/cart         200      xhr    1.2 kB  84 ms
/api/products      404      xhr    212 B   41 ms
logo.svg           200      img    3.4 kB  12 ms
```

A `404` on an API call the page depends on is exactly the kind of finding config-and-logs debugging from lesson 06 would eventually surface too, but Network shows it immediately and in context: which request failed, what it was asking for, and how long it took to fail. Click any request to see its full detail — request headers, response headers, and the response body itself, which is often the fastest way to confirm whether a bug is a frontend misuse of correct data or a backend problem returning wrong data in the first place.

Two columns matter beyond pass/fail:

- **Size** — a request returning far more data than a page actually uses (an API returning a whole user record when the page only displays a name) is a real, reportable inefficiency, not just a curiosity.
- **Time** — a single slow request is often the actual cause of a page that "feels slow," even when every other request is fast. The waterfall view at the bottom of the Network panel shows requests laid out over time, making a bottleneck visually obvious: one long bar sitting alone while everything else finishes quickly.

Throttling (available from a dropdown near the top of the panel, usually labeled "No throttling" by default) lets you simulate a slower connection — useful because a page that loads instantly on your fast office connection may behave very differently for a real user on mobile data, and a QA engineer's job includes testing conditions the developer's own machine never experiences.

## Performance: where the time actually goes

The Performance panel records everything the browser does while loading or interacting with a page — script execution, rendering, layout — and lays it out on a timeline. Click "Record," interact with the page (or just let it load), then stop the recording to see the result.

The most useful view for a first pass is the flame chart's widest, longest bars — they represent whatever took the most time, and clicking one shows exactly which function was running and how long it held the main thread. A page that feels janky when you scroll or click is very often losing time to one specific function doing more work than it needs to, and Performance is how you find which one, rather than guessing.

You don't need to become a performance engineer to use this productively as a QA engineer. The useful QA-level questions are simpler:

- Does anything block the page for a noticeably long stretch (a long, unbroken bar) before it becomes interactive?
- Does scrolling or a common interaction cause visible dropped frames?
- Is a specific action — opening a modal, filtering a list — surprisingly slow compared to how simple it looks to a user?

Reporting "clicking 'Apply Filters' takes about 1.8 seconds and the Performance panel shows a 1.4-second script execution during that click" is far more useful to a developer than "filtering feels slow" — it hands them a starting point instead of a vague impression.

## Lighthouse: a structured audit in one click

The Lighthouse panel (or the Lighthouse tab within DevTools) runs an automated audit across several categories — Performance, Accessibility, Best Practices, and SEO — and returns a scored report with specific, named issues. Run it against a page and read past the top-line score straight into the individual findings; the score is a summary, but each finding underneath it names a concrete, fixable issue:

```text
Accessibility: 82

  Buttons do not have an accessible name
    → <button class="icon-btn"></button> — 1 element affected

  Background and foreground colors do not have a
  sufficient contrast ratio
    → .promo-banner text — contrast ratio 2.1, needs 4.5
```

Each finding names the exact element and the exact rule it fails, which makes Lighthouse output close to audit-ready as-is. This connects directly to D5-S1-C01 — contributing to accessible and responsive design. You are not building the fix yourself in this course, but understanding *what* Lighthouse checks and *why* each check matters (a button with no accessible name is unusable to anyone on a screen reader; insufficient contrast is unreadable to anyone with low vision or in bright light) is what lets you contribute useful, specific input to whoever does build the fix, rather than a vague "make it more accessible."

Run Lighthouse in both mobile and desktop modes (a toggle in the panel) — a page can pass comfortably on desktop and fail meaningfully on mobile, since mobile emulation applies a slower simulated network and CPU by default, closer to a real-world low-end device.

## Turning what you found into feedback a developer can use

D2-S1-C02 is providing feedback and recommendations to developers on software usability and functionality — and the difference between feedback that gets acted on and feedback that gets ignored is almost always specificity. Compare:

```text
Weak: "The page feels slow and some things are hard to read."

Strong: "On the /checkout page, the 'Apply Promo Code' button
takes 1.8s to respond (Performance panel: 1.4s script execution
during the click). Separately, Lighthouse flags the promo banner's
text at a 2.1:1 contrast ratio against its background, below the
4.5:1 minimum — likely unreadable in bright light or for anyone
with low vision."
```

The strong version names the page, the exact interaction, the measured number, and the tool that produced it. A developer can act on it immediately, without first having to reproduce your steps just to figure out what you meant. That translation — from "something feels off" to "here is the specific, measured thing, and here is where I found it" — is the core skill this lesson is building, and it's the same skill lesson 08 will formalize into a full defect report.

## Practice

1. Pick any public website and open its Network panel with the page reloading. Identify the single largest request by size and the single slowest request by time. Note whether they're the same request or different ones.
2. Turn on network throttling set to a slow mobile profile, reload the same page, and describe in one or two sentences how the experience changed.
3. Run a Lighthouse audit (Accessibility and Performance categories) against the same page. Pick two specific findings — not the overall score — and rewrite each as a piece of feedback to a developer, following the "weak vs strong" pattern shown above: name the exact element or interaction, the measurement or rule, and why it matters to a real user.
4. Use the Performance panel to record a common interaction on the page (a click, a scroll, opening a menu). Identify the longest single bar in the resulting flame chart and note what function or activity it represents.
