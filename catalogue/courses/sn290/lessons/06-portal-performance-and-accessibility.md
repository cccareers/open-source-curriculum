---
lesson_id: sn290-06
course_id: sn290
pathway: servicenow-implementation-specialist
title: Portal Performance and Accessibility
order: 6
kind: lesson
competency_ids:
  - D6-S1-C05
objectives:
  - Diagnose a slow portal page and meet baseline accessibility requirements
---

## Measure before you change anything

A slow portal page has a small number of possible causes, and guessing between them wastes days. The diagnostic order is always the same: find out *where* the time goes before deciding *what* to fix.

Open the browser's developer tools on the slow page, reload with the network panel recording, and sort by duration. You are looking to place the page in one of three buckets:

**The initial document is slow.** The first request — the page itself — takes seconds before anything else starts. The time is being spent on the server, assembling the page. That means a widget's server script, and almost always a query.

**The document is fast but assets are slow.** The page arrives quickly, then dozens of requests for scripts, styles, fonts, and images trickle in. The time is in payload and request count.

**Everything arrives fast and the page still feels slow.** The time is in the browser: rendering, and specifically the AngularJS digest cycle over too much data.

Each bucket has its own fixes, and a fix from the wrong bucket does nothing.

## Server-side: the queries

Every widget instance on a page runs its server script during assembly, in sequence. Ten instances means ten scripts, and the page waits for all of them. This is why a home page with twenty cards is slow no matter how good each card is.

The specific offenders, in the order you will meet them:

**A query with no limit.** A list widget that queries and loops with no `setLimit` runs fine for you, with four records, and takes six seconds for the user with nine hundred.

```javascript
var gr = new GlideRecord('incident');
gr.addActiveQuery();
gr.orderByDesc('sys_updated_on');
gr.setLimit(10);          // never optional
gr.query();
```

**A query inside a loop.** Looping over a hundred records and instantiating a new lookup per row turns one query into a hundred and one. Dot-walk instead — `gr.getDisplayValue('assigned_to.name')` resolves through the reference without a second query — or collect the referenced sys_ids and fetch them in a single query with an `IN` condition.

**Counting by fetching.** If you only need a number, do not retrieve the records. Use an aggregate:

```javascript
var agg = new GlideAggregate('incident');
agg.addActiveQuery();
agg.addAggregate('COUNT');
agg.query();
data.openCount = agg.next() ? parseInt(agg.getAggregate('COUNT'), 10) : 0;
```

**Sending fields nobody renders.** Every property you attach to `data` is serialized into the page. A hundred records with fifteen fields each, when the template shows three, is a payload you paid to build and paid to transmit for no reason. Build the flat, minimal shape.

To find out which script is the problem, enable session debugging for SQL on your own session and reload the page. You get every statement, its duration, and the script that issued it. The slow one is usually obvious and usually a surprise. A cruder but effective alternative is to time your own script:

```javascript
var start = new GlideDateTime().getNumericValue();
// ... the work ...
gs.info('sn290 widget took {0}ms', new GlideDateTime().getNumericValue() - start);
```

Finally, watch the round trips your client controller causes. `c.server.update()` posts the *entire* `data` object up and re-runs the whole server script; `c.server.get({...})` sends only what you pass. If a button only needs one value back, use `get`. And never poll on a timer to detect server-side change — use the record-watch helper, which pushes.

## Asset weight

If the document is fast and the waterfall is long, the fixes are mechanical.

Widget **dependencies** attach external scripts and stylesheets to a widget, and they load whenever an instance of that widget is on the page. A dependency attached to a widget that appears in the header therefore loads on every page in the portal. Audit them: a charting library pulled in for one dashboard card should not be on the home page.

Images are the other half. A logo exported at 2400 pixels wide and displayed at 180 is roughly ninety percent waste. Size images to their display size, and set explicit width and height so the browser can reserve the space instead of reflowing the page when each one lands.

Keep the count of widget instances on the home page honest. Every instance is a server script, usually some markup, and sometimes a dependency. If a band exists because someone asked for it in a workshop two years ago and nobody clicks it, deleting it is a performance fix.

## Browser-side: the digest

AngularJS re-evaluates every watched expression on every digest cycle. An `ng-repeat` over a thousand rows, each with six bindings, is six thousand watchers, and the page will feel sluggish on every interaction — not just on load.

Three habits keep this under control.

**Paginate or limit.** Nobody reads a thousand rows. Show twenty and give them a way to get more.

**Use `track by` on repeats over records**, so Angular reuses DOM nodes instead of rebuilding the list when the data changes:

```html
<li ng-repeat="rec in c.data.records track by rec.sys_id">
  {{rec.number}}
</li>
```

**Use one-time binding for values that never change after first render.** The `::` prefix tells Angular to bind once and then stop watching, which removes the watcher entirely:

```html
<h3>{{::c.data.title}}</h3>
```

A card title, a static label, a field that is read-only for the life of the page — all one-time. Reserve live bindings for values that actually change.

## Accessibility: the baseline

The target here is WCAG 2 Level AA intent. This lesson gives you the working baseline that catches most defects; it is not a formal audit, and a portal that will face a legal accessibility requirement should have one.

**Structure.** Screen reader users navigate by landmarks and headings, not by looking. Use the container record's semantic tag field so bands render as `header`, `main`, `nav`, and `footer` rather than anonymous containers — there should be exactly one main region per page. Then keep headings in order: one top-level heading per page, no skipping from a second level to a fourth, and headings used for structure rather than for making text big. A widget that needs bigger text needs CSS, not a promoted heading.

**Keyboard.** Everything clickable must be reachable and operable by keyboard alone. Tab through the entire page: focus order should follow reading order, focus must always be visible, and nothing may trap it. This is where hand-rolled controls fail — a `div` with a click handler is not focusable and not announced as a control. Use a real `button` or `a`, which come with keyboard behaviour and the correct role for free.

**Names.** Every input needs a programmatic label — a `label` element pointing at the input's id, or an `aria-label` where a visible label genuinely does not fit. Every meaningful image needs alt text describing its purpose; decorative images take an empty `alt` so they are skipped rather than announced. Every link needs text that makes sense read alone: a page with nine links all reading "click here" is unnavigable by a screen reader's link list.

**Colour and contrast.** Body text needs a contrast ratio of at least 4.5 to 1 against its background, and large text at least 3 to 1. Check your theme's variables with a contrast checker once, at the point you set them, and you will never have to check a widget again. Separately: never encode meaning in colour alone. A red dot for "overdue" needs a word or an icon beside it.

**Dynamic content.** Portal widgets change content without reloading, and a screen reader will not notice unless you tell it. Wrap a status or message region in a live region so updates are announced:

```html
<div role="status" aria-live="polite">
  <span ng-if="c.data.message">{{c.data.message}}</span>
</div>
```

Use `ng-if` rather than a CSS-hidden element for content that is not currently relevant, so it is genuinely absent from the accessibility tree instead of hidden visually and still announced.

**Zoom and reflow.** Set the browser to 200 percent and reload. Content must remain readable and usable without horizontal scrolling of the page. This overlaps almost entirely with the responsive work from the previous lesson — a portal that handles a 375-pixel phone usually handles 200 percent zoom.

A practical checking routine, in the order that finds the most defects fastest: run an automated browser accessibility checker to catch contrast and missing-name defects in bulk, then tab through the page by hand, then reload at 200 percent, then turn on a screen reader and try to complete one real task. Automated tools find perhaps a third of real issues; the tab-through finds most of the rest.

## Practice

Use your `dev290` portal and the widget you built in Lesson 3.

1. **Make it slow on purpose.** Remove `setLimit` from your widget's server script and add a lookup inside the record loop. Load the page against a table with a few hundred rows and record the document response time from the network panel.
2. **Diagnose it.** Enable SQL session debugging, reload, and identify the exact statement count and the slowest query. Write down the number of queries before you change anything.
3. **Fix and re-measure.** Restore the limit, replace the in-loop lookup with a dot-walk, and replace any count-by-fetching with an aggregate. Reload with debugging on and record the new statement count and response time. Report both numbers as a before and after.
4. **Trim the browser side.** Convert every binding in your template that never changes to a one-time binding, and add `track by` to your repeat. Note the reduction in watched expressions if your tooling shows it, and the change in how the page feels when you type in a nearby field.
5. **Audit the accessibility baseline.** On your home page, run an automated checker and fix every contrast and missing-name finding it reports. Then set semantic tags on your containers so the page has exactly one main region, a header, and a footer.
6. **Tab through it.** Complete one full task — open the menu, navigate to a page, use your widget's button — with the keyboard only. Fix anything you could not reach, anything where focus was invisible, and any control that turned out to be a non-focusable element with a click handler.
7. **Announce a change.** Add a live region to your widget so the message returned by the acknowledge action is announced. Verify with a screen reader that it is read without stealing focus.
8. **Zoom.** Reload at 200 percent and record any place the page requires horizontal scrolling. Fix at least one.
