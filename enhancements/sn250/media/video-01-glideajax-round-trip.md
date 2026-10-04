---
course_id: sn250
media_id: sn250-v01
type: video-script
title: "The GlideAjax Round Trip, Done Right"
format: screencast
target_runtime: "8 min"
related_lessons:
  - sn250-05
  - sn250-06
objectives:
  - Decide between a client script and a UI policy, and write client-side logic that does not slow the form
  - Package reusable server logic in a script include and call it from other scripts
competency_ids:
  - D7-S1-C01
  - D7-S1-C04
---

## Purpose
After watching, the learner can build an asynchronous GlideAjax call from an onChange client script to a client-callable script include, verify it with the browser network panel, and explain why the synchronous alternatives freeze the form.

## Audience and prerequisites
Learners who have finished sn250 lessons 3–5. Comfortable with Scripts - Background and the client script record. A PDI with demo incidents; browser developer tools available.

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Incident form. Cursor changes Caller; the whole page visibly freezes for 3 seconds (recorded with network throttling set to "Slow 3G"). | "Watch the cursor. I change the caller and the form freezes — no typing, no scrolling. That's a synchronous server call from a client script. Today we replace it with one that never freezes." |
| 0:20 | Show the offending client script: `var caller = g_form.getReference('caller_id'); if (caller.vip == 'true') {...}` | "Here's the culprit: getReference with no callback. The browser stops and waits for the server to send back the whole user record." |
| 0:40 | Requirement card: "When the caller changes, warn if they already have more than 3 open incidents." | "The real requirement needs data that isn't on the form — a count of the caller's open incidents — and it changes after the form loads. A display rule can't help, because the caller isn't known at load time. That's the case for GlideAjax." |
| 1:00 | System Definition > Script Includes > New. Name `AcmeIncidentAjax`, tick **Client callable**. Accessible from: This application scope only. | "Server side first. New script include, name AcmeIncidentAjax. Tick Client callable — that's what lets the browser reach it." |
| 1:20 | Type the class from lesson 6, method `getOpenCountForCaller`. Highlight `Object.extendsObject(global.AbstractAjaxProcessor, {` and `this.getParameter('sysparm_caller')`. | "It extends AbstractAjaxProcessor — written global dot, because we're in a scoped app. Parameters arrive with getParameter. Everything starting sysparm came from a browser, so treat it as untrusted." |
| 1:50 | Add guard: `if (!/^[0-9a-f]{32}$/.test(callerId)) { return '0'; }` | "So the first line validates it: a sys_id is exactly 32 hex characters. Anything else, we answer zero and stop." |
| 2:10 | GlideAggregate COUNT; `return ga.getAggregate('COUNT');` | "Then a GlideAggregate count — the database does the counting — and we return a string. Only strings survive the trip." |
| 2:30 | Scripts - Background test: since AbstractAjaxProcessor reads request parameters, show a test of the underlying count via a plain GlideAggregate snippet; log 4. | "Quick sanity check of the query in a background script before we touch the browser. Four open incidents for this caller. Good." |
| 2:50 | Client Scripts > New: Table Incident, Type onChange, Field Caller. Code from lesson 5 with `getXMLAnswer(function (answer) {...})`. | "Now the client script. onChange on Caller. First two lines are the guards — isLoading and empty value. Then a GlideAjax pointed at our class name, a sysparm_name saying which method, and the caller's sys_id." |
| 3:20 | Zoom on `ga.getXMLAnswer(function (answer) {`. | "And here's the whole lesson in one line: getXMLAnswer with a function. That function runs later, when the answer arrives. The browser doesn't wait for it." |
| 3:40 | Callback body: `parseInt(answer, 10)`; `showFieldMsg` / `hideFieldMsg`. | "The answer is a string, so parseInt it. More than three, show a warning under the field; otherwise clear any old one." |
| 4:00 | Open DevTools > Network, filter `xmlhttp`. Reload form. 0 requests. | "Prove it. Network panel, filter on xmlhttp. Reload the form. Zero requests — the guard skipped the load." |
| 4:20 | Change caller with throttling on. One request appears, pending; meanwhile the cursor types into Short description smoothly. Then the warning appears. | "Change the caller. One request, pending — and I'm still typing in short description. When it comes back, the warning appears. No freeze." |
| 4:50 | Click the request; Payload tab shows `sysparm_processor=AcmeIncidentAjax`, `sysparm_name=getOpenCountForCaller`, `sysparm_caller=...`; Response tab shows `answer="4"`. | "Click the request. You can see exactly what was sent — processor, method, caller — and what came back. When something goes wrong, this is where you look first." |
| 5:20 | Security demo: in DevTools console, run a crafted GlideAjax with `sysparm_caller` set to `'abc OR 1=1'`; response `0`. | "Remember: anyone logged in can call this, with any parameters — not just your client script. Here I send garbage. The guard answers zero. That validation line is a security control, not tidiness." |
| 5:50 | Side-by-side: getXMLWait version (struck through), getReference without callback (struck through), display rule + g_scratchpad (checked, labelled "known at load time"), GlideAjax async (checked, "depends on user action"). | "So, the ladder from lesson 5. Don't call the server if the value is already on the form. If it's known at load time, use a display rule and the scratchpad. If it depends on what the user does, async GlideAjax. Never getXMLWait. Never getReference without a callback." |
| 6:30 | Extend: method `getCallerSummary` returns `JSON.stringify({openCount, vip, location})`; client parses with `JSON.parse(answer)`. | "Need several values? Return one JSON string and parse it in the callback. One request instead of three." |
| 7:00 | Recap card. | "Client-callable include, validated parameters, a string back, getXMLAnswer with a callback, and the network panel as your proof." |
| 7:30 | End card: "Try it: rewrite the VIP banner with a display rule instead. Count the requests." | "Your turn: build the VIP banner from lesson 5 with a display rule and g_scratchpad, and count the requests on load. Then decide which pattern each requirement deserves." |

## On-screen assets and B-roll
- PDI incident form; Chrome/Edge DevTools with network throttling "Slow 3G" for the freeze demo.
- Code must match lesson 5/6 code with the added sys_id validation line.
- Overlay: the four-rung "how to get server data to a form" ladder.

## Accessibility
- Captions; narrate every code line's purpose; code font ≥ 18 pt.
- The freeze is described in words ("the cursor stops moving for three seconds"), not just shown.
- DevTools panels zoomed to 150%; highlight boxes have text labels.
- Transcript includes full code for both script include and client script.

## Check for understanding
1. Why can't a display business rule supply the open-incident count in this requirement? — *The caller can change after load; the display rule only runs once at load.*
2. What makes the call asynchronous? — *Passing a callback to `getXMLAnswer`; the browser continues while waiting.*
3. Why validate `sysparm_caller` if only your client script calls the method? — *Any authenticated user can call a client-callable include directly with any parameters.*
