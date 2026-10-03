---
course_id: node101
media_id: node101-v01
type: video-script
title: "Why /events/upcoming Never Fires"
format: screencast
target_runtime: "7 min"
related_lessons:
  - node101-04
objectives:
  - Route requests to handlers using paths, parameters, and methods
competency_ids:
  - D2-S1-C04
---

## Purpose
After watching, the learner can predict which handler Express will call for a given URL, fix a route that another route shadows by reordering it, and convert and validate a route parameter so that bad input gets a `400` and a missing record gets a `404`.

## Audience and prerequisites
Apprentices partway through lesson 04. They have a running events board with `GET /events` and know `curl -i` from lesson 03. Express 4 or 5 both work. Nothing in this video differs between them, except the regex constraint, which is shown as a caution at the end.

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Cold open. Terminal, large font. `curl -s localhost:3000/events/upcoming` prints `{"lookup":"upcoming"}`. The cursor blinks next to it. | "I asked the events board for upcoming events. It told me it looked up an event whose id is the word 'upcoming'. There's a route for upcoming events. I wrote it. It never runs. Let's find out why, and then fix two more bugs hiding in the same five lines." |
| 0:20 | Editor, `src/routes/events.js`, showing exactly: `router.get("/:id", (req, res) => { res.json({ lookup: req.params.id }); });` followed by `router.get("/upcoming", (req, res) => { res.json({ upcoming: true }); });` | "Here's the router. Two GET routes. The first has a parameter, colon id. The second is a fixed path, slash upcoming." |
| 0:35 | Overlay: a numbered list appears beside the code: `1. GET /:id`, `2. GET /upcoming`. An arrow labelled "request: GET /upcoming" moves down the list and stops at 1. Item 1 gets a solid border and the label "match → stop". | "Express keeps your routes in a list, in the order you registered them. For every request it walks from the top and asks two questions: does the method match, and does the path match? The first yes wins, and it stops looking. A colon parameter matches any single segment. The word 'upcoming' is a perfectly good segment. So route one wins, and route two is dead code. Express doesn't score routes by specificity, and it doesn't warn you." |
| 1:10 | Add `console.log("HIT /:id")` and `console.log("HIT /upcoming")` as the first line of each handler. Save. Terminal shows the `node --watch` restart line. Run the curl again. Terminal shows `HIT /:id`. | "When you're not sure which handler ran, don't read the route table. Ask the code. One log line at the top of each candidate, one request, and whichever line prints is your answer. Here it's the id route." |
| 1:35 | Cut and paste the `/upcoming` block above `/:id`. Save. Restart line. Run curl: `{"upcoming":true}`. Log shows `HIT /upcoming`. | "The fix is mechanical. Static segments go before parameters at the same depth. Move upcoming above the id route, and now it gets asked first." |
| 1:55 | Text card: "Rule: literal before parameter, at the same depth." Below it, smaller: "/events and /events/:id don't collide (different depth)." | "Write that rule down. Depth protects you more often than you'd think. Slash events and slash events slash id never collide, because one has a second segment and the other doesn't. The collisions are almost always a literal and a parameter in the same position." |
| 2:15 | Back to editor. Replace the `/:id` handler body with the naive lookup: `const event = events.find((candidate) => candidate.id === req.params.id); if (!event) { return res.status(404).json({ error: "Not found" }); } res.json(event);` The `events` array is visible in a split pane: `{ id: 1, title: "Neighborhood Cleanup", ... }`. | "Bug number two. Here's a real lookup. Find the event whose id equals the parameter. Event 2 is right there in the array." |
| 2:35 | Terminal: `curl -i localhost:3000/events/2`. Output: `HTTP/1.1 404 Not Found` and `{"error":"Not found"}`. | "And it says not found. This is the most common route-parameter bug there is, and it looks like a data problem." |
| 2:45 | Add `console.log(typeof req.params.id, req.params.id);` Request again. Terminal: `string 2`. Overlay highlights `id: 1` in the data (number) and `"2"` in the log (string). | "Log the type. Parameters come out of a URL, and a URL is text. So req.params.id is always a string, the string '2'. Our ids are numbers. Triple-equals compares a number to a string and says no, every single time." |
| 3:10 | Edit: `const id = Number(req.params.id);` at the top; the comparison becomes `candidate.id === id`. Request `/events/2`: `HTTP/1.1 200 OK` with the event JSON. | "Convert once, at the top of the handler, and work with the converted value from then on. Now event 2 comes back." |
| 3:25 | Terminal: `curl -i localhost:3000/events/banana`. Output: `HTTP/1.1 404 Not Found`. | "Bug three is quieter. Ask for event 'banana'. Number of banana is NaN, find never matches NaN, and we fall into the 404 branch. It looks handled, but it's handled by accident, and it tells the client the wrong thing." |
| 3:45 | Edit to the final handler, exactly: `const id = Number(req.params.id); if (!Number.isInteger(id) \|\| id < 1) { return res.status(400).json({ error: "id must be a positive integer" }); } const event = events.find((candidate) => candidate.id === id); if (!event) { return res.status(404).json({ error: \`No event with id ${id}\` }); } res.json(event);` | "Be explicit. If it isn't a positive integer, it isn't an id at all, and that's a 400: fix your request. If it's a valid id and nothing has it, that's a 404: that thing isn't here." |
| 4:15 | Three terminal commands run in sequence, with status lines highlighted: `curl -i localhost:3000/events/2` → `200 OK`; `curl -i localhost:3000/events/banana` → `400 Bad Request`; `curl -i localhost:3000/events/999` → `404 Not Found`. | "Three requests, three different answers. A client, or you reading logs at two in the morning, can act on each of them differently. Collapsing them into one 404 throws that away." |
| 4:40 | Notice the `return` keywords highlighted in yellow and underlined (not color alone). | "Notice the return in front of every early response. Sending a response doesn't stop your function. Without the return, execution would fall through to the next res.json, and Express would throw 'cannot set headers after they are sent.'" |
| 5:00 | Caution card titled "Express 5 note". Shows `router.get("/:id(\\d+)", ...)` struck through, and below it the startup error from Express 5: `TypeError: Unexpected ( at index 4: /:id(\d+)`. | "One caution. Older tutorials, and lesson 04, show a regular expression inside the path, colon id followed by backslash-d-plus in parentheses. On Express 4 that limits the route to digits. On Express 5, which is what npm install express gives you today, that syntax was removed, and your app throws as soon as it starts. Validating inside the handler, the way we just did, works on both versions and gives the client a useful 400." |
| 5:35 | Editor showing the final router top to bottom: `/`, `/upcoming`, `/:id`, with a bracket labelled "most specific → least specific". | "So here's the shape to aim for. Group routes by resource, and order each group from most specific to least: the collection, then the fixed sub-paths like upcoming, then the parameter routes. Convert parameters at the top. Validate before you look anything up. Return on every early exit." |
| 6:05 | Terminal: run the three curls plus `/events/upcoming` one final time. All four status lines visible. | "Four URLs, four handlers or outcomes, every one of them the one we meant." |
| 6:20 | End card: "Try it: Practice step 5 in lesson 04. Register /upcoming after /:id on purpose, record what you get, then fix it." | "Your turn. Lesson 04, practice step 5, asks you to make the ordering mistake on purpose and write down what happened. Do it. Then you'll recognize it the first time it happens by accident." |
| 6:40 | Fade out. | (no narration) |

## On-screen assets and B-roll
- Editor theme with at least 4.5:1 contrast and an 18pt or larger font; terminal at 20pt or larger.
- Starting state: `src/routes/events.js` with the two routes in the wrong order, and `src/data/events.js` with numeric ids 1–3 (the lesson 04 fixture: Neighborhood Cleanup / Rosa Parks Park, Intro to Soldering / Maker Space, Community Potluck / Fellowship Hall).
- The server runs with `npm run dev` (`node --watch`) in a visible split terminal so restart lines are on screen.
- Animated overlay for 0:35: a vertical numbered route list with a moving "request" marker. Reuse the visual language from `animation-01-middleware-pipeline.md` (rounded rectangles, blue `#0072B2` request token).
- The Express 5 error text at 5:00 must be captured from a real Express 5 run on the day of recording. The message format can vary by `path-to-regexp` version; record what your install prints.

## Accessibility
- Burned-in captions plus a separate `.vtt` file. Every command and every printed status line is read aloud or shown in a caption, never only in the terminal.
- The 0:35 overlay states the match result in text ("match → stop"), not only by highlight color.
- Code highlights use underline or border plus color. Return keywords at 4:40 are underlined.
- All edits are typed or pasted visibly, with no hidden keyboard shortcuts. When a shortcut is used (save, cut, paste), the narration or a caption says so.
- Provide a transcript with all code blocks as copyable text.

## Check for understanding
1. Your router registers `GET /:slug` and then `GET /featured`. What does `GET /featured` return, and how do you fix it?
   *Answer:* The `/:slug` handler runs with `req.params.slug === "featured"`, because Express stops at the first match. Register `/featured` above `/:slug`.
2. `events.find((e) => e.id === req.params.id)` returns `undefined` for an id you can see in the data. What's the most likely cause?
   *Answer:* `req.params.id` is a string and the stored ids are numbers. Convert with `Number()` at the top of the handler.
3. Which status should `GET /events/abc` return, and which should `GET /events/999` return when no event 999 exists? Why are they different?
   *Answer:* `400` for `abc` (the request is not a valid id; repeating it will always fail) and `404` for `999` (a valid id that nothing has).
