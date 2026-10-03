---
course_id: node101
media_id: node101-v02
type: video-script
title: "The Async Error Gap: Express 4 vs Express 5"
format: screencast
target_runtime: "8 min"
related_lessons:
  - node101-08
  - node101-05
objectives:
  - Handle and log errors so failures are diagnosable
competency_ids:
  - D4-S1-C05
---

## Purpose
After watching, the learner can tell which Express major version a project runs, predict what happens when an `async` handler rejects on each version, and make every async route forward its errors to the error handler in a way that works on both.

## Audience and prerequisites
Apprentices working through lesson 08. They have a four-argument error handler and a not-found middleware registered at the bottom of the stack, and they know `next` from lesson 05.

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Cold open. Two terminals side by side, labelled "express 4" (left) and "express 5" (right). In each, the same command: `curl -i localhost:3000/events/1`. Left prints `curl: (52) Empty reply from server`, and its server pane shows a stack trace ending in `Node.js v24...` and the process exits. Right prints `HTTP/1.1 500 Internal Server Error`. | "Same code. Same request. On the left, the server crashed and the client got nothing at all. On the right, a 500. The only difference is the major version of Express. By the end of this video you'll know why, and you'll have one pattern that's safe on both." |
| 0:25 | Left editor, `package.json`, cursor on `"express": "^4.21.2"`. Then terminal: `npm ls express` prints `└── express@4.21.2`. Right terminal: `npm ls express` prints `└── express@5.2.1`. | "First, find out which one you have. Don't trust your memory, and don't trust a tutorial. Run npm ls express. If you ran npm install express any time since early 2025, you very likely have 5. Lesson 02's package.json shows 4. Both are out there in real codebases." |
| 0:50 | Editor, `src/server.js` (identical on both sides): `const loadEvent = async (id) => { throw new Error(\`lookup failed for ${id}\`); };` then `app.get("/events/:id", async (req, res) => { const event = await loadEvent(req.params.id); res.json(event); });` | "Here's the handler. loadEvent stands in for anything slow that can fail: a file read, a call to another service. It's async, and it rejects." |
| 1:10 | Overlay: the handler is drawn as a box returning a token labelled "Promise (rejected)". On the Express 4 side an arrow from Express to the token says "return value ignored", and the token falls off-screen. | "An async function always returns a promise. When it fails, that promise rejects. Express 4 calls your handler and ignores what it returns. It never looks at the promise, so it never learns that anything failed." |
| 1:35 | Left server pane, highlight the line `Error: lookup failed for 1` and the final `Node.js v24.18.0`. Left prompt is back, so the process has exited. | "So the rejection is unhandled. On current Node versions, an unhandled rejection terminates the process by default. One bad request just took the whole events board down for everybody. The client was mid-request when the process died, so curl reports an empty reply." |
| 2:00 | Text card: "If something else swallows the rejection (a global `unhandledRejection` listener, an older Node), the process stays up and the request **hangs** instead. Neither outcome sends a response." | "And if something in your app swallows unhandled rejections, the process survives, but the request just hangs until the browser gives up. Crash or hang, the client never gets a proper answer, and your error handler never runs." |
| 2:25 | Right side: overlay shows Express 5 attaching `.catch(next)` to the returned promise; the token travels to a box labelled "error handler (err, req, res, next)". Right server pane shows the error line written by the learner's error handler. | "Express 5 changed this. When a handler or middleware returns a promise, Express 5 waits on it, and if it rejects, Express calls next with the error for you. Your four-argument error handler runs, the client gets a 500, and the log has the stack." |
| 2:50 | Text card: "Express 5: rejected promises → `next(err)` automatically. Express 4: you must do it." | "That's the whole difference. Now, the fix that works on both." |
| 3:00 | Left editor. Rewrite to the explicit form, exactly: `app.get("/events/:id", async (req, res, next) => { try { const event = await loadEvent(req.params.id); if (!event) { const err = new Error(\`No event with id ${req.params.id}\`); err.status = 404; return next(err); } res.json(event); } catch (err) { next(err); } });` | "Option one: be explicit. Take next as the third argument, wrap the body in try/catch, and pass anything that goes wrong to next. While we're here, notice the expected failure: no event means a 404. We build an error, tag it with a status, and forward it. Both failures leave by the same door." |
| 3:35 | Left terminal: restart, `curl -i localhost:3000/events/1` → `HTTP/1.1 500 Internal Server Error` with the JSON error body `{"error":{"status":500,"message":"Something went wrong on our end.","requestId":"..."}}`. Server pane: one structured JSON error line with `requestId` and `stack`. | "Express 4, same request. A 500, a generic message for the client, and the full stack in our log, tagged with the request id. That's the trade from lesson 08: nothing useful to a stranger, everything useful to you." |
| 4:00 | New file `src/lib/async-route.js`: `export function asyncRoute(handler) { return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next); }` | "Wrapping every handler in try/catch gets old, and people skip boring repetition. Option two: one small helper. It calls your handler, wraps whatever comes back in Promise.resolve so it works even for non-async handlers, and sends any rejection to next." |
| 4:30 | Route rewritten: `app.get("/events/:id", asyncRoute(async (req, res) => { const event = await loadEvent(req.params.id); if (!event) throw Object.assign(new Error("Event not found"), { status: 404 }); res.json(event); }));` | "Now a plain throw inside an async handler does what most people assumed it did all along. It reaches your error handler." |
| 4:50 | Both terminals run the request. Both show `HTTP/1.1 500 Internal Server Error` with the same JSON body. | "Express 4 on the left, Express 5 on the right, identical behavior. On 5 the wrapper is redundant but harmless. On 4 it's the difference between a 500 and a dead process." |
| 5:10 | Editor: change `loadEvent` to return `undefined` for id 99. Run `curl -i localhost:3000/events/99` on both → `HTTP/1.1 404 Not Found`. | "And the expected failure: id 99 doesn't exist, the handler throws an error tagged 404, and both versions return a 404 through the same handler. One exit path, one log format." |
| 5:30 | Text card "Two traps" with two numbered items. | "Two traps to finish." |
| 5:35 | Editor: an error handler written as `app.use((err, req, res) => { ... })`, three parameters. A banner reads "3 params = ordinary middleware". Request → Express's default HTML 500 page appears. | "Trap one. Express decides a function is an error handler by counting its declared parameters. Drop the unused fourth one to quiet a linter, and it silently becomes ordinary middleware. Your errors fall through to Express's default page. Keep all four, even if you never touch next." |
| 6:05 | Editor: handler calls `res.json(event)` and then a later line calls `next(err)`. Server pane: `Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client`. | "Trap two. Once you've sent a response, never call next with an error. The headers are already on the wire. Decide first, respond once. Your error handler's headersSent guard is there for the case where this happens anyway." |
| 6:35 | Final checklist card: "1. `npm ls express`. 2. Every async route: `asyncRoute(...)` or try/catch + `next(err)`. 3. Error handler: 4 params, registered last. 4. Expected failures: tag `err.status`." | "So: know your version. Make every async route forward its errors, with the helper or with try/catch. Keep your error handler at four parameters and at the bottom of the stack. Tag the failures you expect with the status they deserve." |
| 7:05 | End card: "Lesson 08, practice step 6: Prove the async gap." | "Lesson 08, practice step 6, asks you to prove this gap on your own machine. Write down which version you're on and what you saw. That note is exactly the kind of evidence a good bug report is built from." |
| 7:25 | Fade out. | (no narration) |

## On-screen assets and B-roll
- Two scratch projects prepared in advance: one with `npm install express@4`, one with `npm install express@5`. Both have the lesson 08 `requestId`, `notFound`, and `errorHandler` middleware, and the structured `logger`.
- Run on a current LTS Node. Record the exact Node version shown at 1:35 and keep it in the transcript. The "unhandled rejections terminate the process" default has been in place since Node 15.
- The opening output (`curl: (52) Empty reply from server` and the stack trace followed by the Node version line) was verified on Express 4 + Node 24 while drafting this script. Re-capture it live on recording day rather than mocking it up.
- Overlays at 1:10 and 2:25: promise token in orange `#E69F00`, error path in vermillion `#D55E00` with a dashed outline, handler boxes in blue `#0072B2` (Okabe-Ito palette).

## Accessibility
- Captions and transcript. Every terminal result is spoken ("curl reports empty reply", "five hundred", "four oh four").
- The left/right comparison is labelled in text ("express 4", "express 5") on every frame. Never rely on position or color alone.
- Dashed versus solid lines distinguish the error path from the normal path in the overlays, in addition to color.
- No flashing. The process crash is shown by the prompt returning, and narrated.
- Code is shown at 18pt or larger, and every snippet appears in the transcript as copyable text.

## Check for understanding
1. On Express 4, an `async` handler awaits a function that rejects, and there is no `try`/`catch`. On current Node, what does the client see and what happens to the server?
   *Answer:* The rejection is unhandled. Node terminates the process by default, so the client gets no response (curl reports an empty reply), and every other visitor loses the service too. If something swallows the rejection, the request hangs instead.
2. Why is `asyncRoute` still worth using on Express 5?
   *Answer:* It makes the code correct regardless of which major version the project is installed on, and it's harmless on 5. A habit that works on both is safer than one that depends on what `npm install` gave you.
3. You wrote `app.use((err, req, res) => { ... })` and your custom error page never appears. Why?
   *Answer:* Express identifies error handlers by four declared parameters. With three, it is ordinary middleware and never receives errors. Add `next` back as the fourth parameter.
