---
course_id: sn290
media_id: sn290-v01
type: video-script
title: "The Widget Data Contract: Server Script to Template and Back"
format: screencast
target_runtime: "9 min"
related_lessons:
  - sn290-03
objectives:
  - Build and clone widgets using HTML, CSS, an AngularJS client controller, and a server script
competency_ids:
  - D6-S1-C02
---

## Purpose

After watching, the learner can trace a value from a widget's server script through `data`, `c.data`, and the template, explain what `c.server.update()` and `c.server.get()` each send, and diagnose which runtime a broken widget is failing in.

## Audience and prerequisites

Learners who completed lesson 2 and have the `dev290` portal. Comfortable with basic JavaScript. Presenter has the `sn290 Open Records` widget from lesson 3 already created, plus an empty widget for the live build.

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | `dev290` home page with the "My open records" card. Presenter clicks Refresh; the list updates. | "One click, and a lot just happened. The browser sent data to the server, a script ran, and the template redrew. By the end of this video you will be able to name every hop." |
| 0:15 | Title card. | "The widget data contract. Lesson three of Service Portal Fundamentals." |
| 0:20 | Filter navigator: **Service Portal > Widgets**. Open `sn290 Open Records` in the widget editor. Show the four panes: HTML Template, CSS - SCSS, Client Script, Server Script. | "A widget is one record with four parts. Template, CSS, client controller, server script. One object connects them, and it is called data." |
| 0:40 | Diagram overlay from lesson 3: server `data.x` arrow to `c.data.x` arrow to `{{c.data.x}}`, return arrow labelled `c.server.update()`. | "The server script runs first, on the instance, before the page is delivered. Whatever it leaves on data is serialized into the page. The client controller wakes up in the browser with that object already on c dot data. The template reads it through c." |
| 1:05 | Create a new widget `sn290 Contract Demo`. Server script pane: type: `(function() { data.serverTime = new GlideDateTime().getDisplayValue(); data.greeting = 'Hello ' + gs.getUserDisplayName(); })();` | "Let's build the smallest possible proof. The server sets two values: the time it ran, and a greeting." |
| 1:35 | Template pane: `<div class="panel panel-default"><div class="panel-body"><p>{{c.data.greeting}}</p><p>Server ran at {{c.data.serverTime}}</p><button type="button" class="btn btn-default" ng-click="c.refresh()">${Refresh}</button></div></div>` | "The template reads both through c dot data. Note the dollar-brace wrapper on Refresh. That marks the label for translation." |
| 2:00 | Client script pane: `api.controller = function() { var c = this; c.refresh = function() { c.server.update(); }; };` Click Save. Preview pane shows greeting and time. | "The controller defines refresh, which calls c dot server dot update. Save, and the preview shows our data." |
| 2:25 | Click Refresh in preview several times; time changes each click. | "Each click: the time changes. That proves the whole server script ran again." |
| 2:40 | Add `gs.info('sn290 contract demo ran, input=' + JSON.stringify(input));` to server script. Save. Click Refresh twice. Open **System Logs > System Log > All** in a new tab filtered by message contains `sn290 contract demo`. Show three entries: first with `input=undefined`, then two with the whole data object as input. | "Let's look from the server's side. On first load, input is undefined. On every update, input is the entire c dot data object that the browser posted back. Everything. That is the first thing to remember about update: it ships the whole object up and re-runs the whole script." |
| 3:25 | Edit client script: add `c.ping = function() { c.server.get({action: 'ping'}).then(function(r) { c.pong = r.data.pong; }); };` Server script: add `if (input && input.action === 'ping') { data.pong = 'pong at ' + new GlideDateTime().getDisplayValue(); }`. Template: add a Ping button and `<p ng-if="c.pong">{{c.pong}}</p>`. | "Now the lighter call. c dot server dot get sends only the object you pass. The server sees it as input, so we branch on input dot action. The response comes back as r dot data, and we pick off what we need." |
| 4:10 | Click Ping. Log shows `input={"action":"ping"}`. | "Look at the log: input is only action ping. Small request, explicit intent." |
| 4:30 | Slide: "Rule 1: Anything on data is visible in the browser." Browser dev tools, Network tab, click the widget request, show response JSON containing `greeting` and `serverTime`. | "Rule one. Anything you put on data is visible in the browser. Here it is in the network panel. If you attach a field the user should not see, you have published it." |
| 5:00 | Slide: "Rule 2: GlideRecord in a widget does not check ACLs for you." Show the acknowledge code from lesson 3 with `rec.canWrite()` and `rec.comments.canWrite()` highlighted. | "Rule two. A plain GlideRecord in a server script does not enforce access controls on its own. When the browser asks you to change a record, check it exists, check the action string, and check record and field write permission before you update, and check that the save succeeded. Use GlideRecordSecure for the read path too." |
| 5:40 | Slide: "Rule 3: Two runtimes." Left column: Server (GlideRecord, gs, $sp, no DOM). Right column: Client (c, spUtil, DOM, no GlideRecord). | "Rule three. Two runtimes. The server has GlideRecord and no DOM. The client has the DOM and no GlideRecord. Query on one side, render on the other." |
| 6:05 | Debug demo: in template add `<pre>{{c.data \| json}}</pre>`. Then misspell `{{c.data.greting}}`. Preview shows a blank paragraph; the pre shows `greeting` exists. | "Debugging starts with one question: which runtime? Dump the data. If the object is right, the server is fine. Here the data has greeting, but the paragraph is blank. Blank is not an error in Angular. It is a spelling problem until proven otherwise." |
| 6:45 | Fix spelling. Then break the server: push a GlideRecord object onto data (`data.rec = gr;`). Dump shows `rec` as an unexpected empty or partial object. | "Second classic: putting a GlideRecord on data. It does not serialize the way you expect. Push plain values, a flat shape." |
| 7:20 | Remove debug lines. Show the `c.server.update` vs `c.server.get` comparison table on a slide: Sends / Re-runs / Use when. | "Summary. Update sends the whole data object and re-runs everything: use it for a full refresh. Get sends only what you pass: use it for actions and lookups. Either way the server script runs, so branch on input explicitly." |
| 8:00 | Back to `dev290` home page; click Refresh on the real card. | "Now you can narrate that Refresh click hop by hop." |
| 8:20 | End card: practice steps 3 and 4 from lesson 3. | "Go prove the round trip yourself, then build the acknowledge action, with the permission check." |

## On-screen assets and B-roll

- Lesson 3 data-flow diagram as an overlay graphic.
- Three rule slides; update-vs-get comparison slide.
- System Log tab pre-filtered; browser dev tools docked at the bottom with enlarged font.

## Accessibility

- Captions; narration reads all code aloud at the level of "the server sets data dot greeting", and the full code is in the transcript.
- Code panes zoomed to at least 18 pt equivalent; high-contrast editor theme.
- Do not rely on log highlighting color; narrate which entry is being discussed.
- All demo controls are real buttons, modelling the course's keyboard guidance.

## Check for understanding

1. A widget's server script runs a record update every time the user clicks Refresh. Why, and how do you stop it? *Answer: `c.server.update()` re-runs the whole server script; branch on an explicit `input.action` so the update runs only for that action.*
2. Your template shows a blank where `{{c.data.count}}` should be, and a JSON dump shows `count: 3`. Which runtime is broken? *Answer: the client side (template or controller); the server produced the data correctly. Check spelling or the binding path.*
3. Why check record and field `canWrite()` in the acknowledge action? *Answer: a plain GlideRecord in a server script does not enforce ACLs, and `input` comes from an untrusted browser.*
