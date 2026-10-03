---
course_id: node101
media_id: node101-a01
type: animation-storyboard
title: "One Request Through the Events Board Pipeline"
target_runtime: "90 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - node101-05
  - node101-08
objectives:
  - Compose middleware to handle cross-cutting request concerns
  - Handle and log errors so failures are diagnosable
competency_ids:
  - D2-S1-C04
  - D5-S1-C02
  - D4-S1-C05
---

## Concept and misconception it fixes
Express middleware is one ordered list. A request walks it strictly forward, one `next()` at a time, and every function does exactly one of three things: calls `next()`, sends a response, or does neither and hangs the request. The animation fixes three misconceptions learners carry out of lessons 05 and 08:

1. **"Middleware runs after the route."** It doesn't. Code that needs to run after the response (the request timer) registers a `res.on("finish")` listener on the way *down*, and that listener fires later.
2. **"Forgetting `next()` skips my middleware."** It hangs the request.
3. **"An error goes to the next middleware."** `next(err)` skips every remaining ordinary middleware and jumps to the first four-argument function below it.

It animates the course's planned `middleware-pipeline.png` and `express-error-flow.png` assets (listed in `course.json` `assets`), using the events board's actual stack from lessons 05 and 08.

## Visual language (shapes, colors with color-blind-safe palette, labels)
- **Palette: Okabe-Ito**, which is safe for protanopia, deuteranopia, and tritanopia. Every color meaning is doubled by a shape or line style, so the animation also works in grayscale.
  - Request token: blue `#0072B2`, a filled circle with the label `GET /events/2` or `POST /events`.
  - Ordinary middleware stage: rounded rectangle, outline `#000000`, fill `#F0F0F0`, with the function name in monospace (`requestId`, `requestTimer`, `express.json()`, `eventsRouter`, `notFound`).
  - Error-handler stage: **hexagon** (distinct shape), outline vermillion `#D55E00`, labelled `errorHandler(err, req, res, next)`.
  - Error token: vermillion `#D55E00` **diamond**, with a dashed trail.
  - Response: bluish green `#009E73` **arrow-shaped** token travelling back up a return lane on the left, labelled with its status (`200`, `401`, `500`).
  - Listener/after-response marker: orange `#E69F00` **bell icon** attached to the `requestTimer` stage.
  - Hang state: the token turns into an outline-only circle with a growing clock icon and the text "waiting... no response".
- **Layout:** stages stacked vertically top to bottom in registration order, numbered 1–6 on the left. A "client" box sits at the top. Down-arrows between stages are labelled `next()`.
- **Typography:** sans-serif for captions at 32px or larger at 1080p; monospace for code names.
- A code strip along the bottom always shows the `app.use(...)` line for the highlighted stage.

## Scenes
| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 0:00–0:08 | Client box at top. Six stages fade in one by one: `1 requestId`, `2 requestTimer`, `3 express.json()`, `4 eventsRouter (/events)`, `5 notFound`, `6 errorHandler` (hexagon). The code strip shows the matching `app.use` lines in the same order. | Stages drop in top to bottom in the order the lines are "executed" in the code strip. | "When your app starts, each app.use adds one entry to a list, in the order the lines run. This list is built once, not per request." |
| 2 | 0:08–0:18 | Blue token `GET /events/2` leaves the client and enters stage 1. A tag `req.id = 7c1f…` attaches to the token. The response-header chip `x-request-id` is pinned to the return lane. | Token pauses inside stage 1, the tag snaps on, and the token moves down the `next()` arrow. | "A request walks the list from the top. requestId attaches an id to the request and calls next." |
| 3 | 0:18–0:30 | Stage 2 `requestTimer`: an orange bell icon detaches and hangs at the side of the return lane, labelled `res.on("finish")`. A small stopwatch starts on the token. | Bell slides out to the left lane and stays there. Token continues down. | "requestTimer starts a clock and leaves a listener behind: when the response finishes, ring this bell. Then it calls next. It does not wait." |
| 4 | 0:30–0:40 | Stage 3 `express.json()`: a label "no body to parse → next()". Stage 4 `eventsRouter`: the token enters and an inner mini-list appears (`GET /`, `GET /upcoming`, `GET /:id`). The token matches `/:id`. | Token checks each inner route; non-matches shake once with a "✕"; `/:id` gets a "✓". | "The parser has nothing to do for a GET and passes it on. The router is its own little list, and the first match wins." |
| 5 | 0:40–0:50 | The handler sends: a green arrow token `200` launches up the return lane. As it passes the bell, the bell rings (icon wiggles, three short lines), and a log line types out in the code strip: `GET /events/2 200 3.1ms id=7c1f…`. Stages 5 and 6 dim with the label "never reached". | Green arrow travels up to the client. Bell animation fires *after* the arrow leaves stage 4. | "The handler responds, so the walk is over. Nothing below it runs. As the response finishes, the bell rings and the timer logs. That's how code runs 'after' a route: it was set up on the way down." |
| 6 | 0:50–1:02 | Reset. New token `POST /events`, a bad key. A gate stage `requireApiKey` slides in between 3 and 4 (inside the router, labelled `router.use`). The gate sends a green `401` arrow up. In a split-frame variant, the same gate with its `return next()` line struck out shows the token stuck: outline circle, clock icon, "waiting... no response". | Left half: 401 arrow goes up. Right half: token stalls, and the clock hand sweeps. | "A gate can stop a request by responding: 401, and nothing below runs. But if a middleware neither responds nor calls next, the request doesn't skip ahead. It hangs." |
| 7 | 1:02–1:15 | Reset. Token `GET /events/99`. Inside the router the handler throws. The token turns into a vermillion diamond, labelled `next(err)`. It **jumps** past stage 5 `notFound` along a dashed curved path (stage 5 shows "skipped: 3 params") and lands in the hexagon `errorHandler`. A log line appears: `{"level":"info","status":404,"requestId":"…"}`. A green `404` arrow goes up. | Dashed arc animation. Skipped stage briefly outlines and dims. | "Call next with an error and Express skips every ordinary middleware below, straight to the first four-parameter handler. One place decides the status, logs it with the request id, and responds." |
| 8 | 1:15–1:30 | Summary frame: the full stack with three legend chips: "→ next(): keep going", "↑ response: stop here", "◇ next(err): jump to the hexagon". At the bottom: "Order is the design." | Legend chips pop in one at a time. | "Three moves: continue, respond, or jump to the error handler. Everything about your app's behavior follows from the order of these lines." |

## Interaction variant (optional)
- **Step-through (H5P "Course Presentation" or a small Motion Canvas player with scene markers):** learners press Next to advance the token one stage at a time. Before each step, a prompt asks "What does this stage do: next, respond, or hang?" and the learner chooses an answer.
- **Reorder challenge:** learners drag the stage cards into a new order, for example `express.json()` below the router or `errorHandler` at the top. The token then replays with consequences such as `req.body is undefined` or "errorHandler never fires". This maps directly to lesson 05 practice step 8 and lesson 08 practice step 4.
- **Scrubbable timeline:** a slider over scene 5 that shows the response arrow and the bell, so learners can see that the bell fires after the response leaves the handler.

## Production notes
- Build each stage as a reusable component with props `{ name, shape, codeLine }` so the reorder variant is data-driven.
- Keep timing generous. Each token move should take at least 0.6 s, and pause at least 1 s on each caption, so screen-reader users with audio description are not rushed.
- Audio description track: describe the token's movement in words for scenes 5–7 ("the error token jumps over notFound and lands on the error handler").
- Test the frames with a color-blindness simulator (for example, the Chrome DevTools "Emulate vision deficiencies" panel) and in grayscale. Shapes and dashes must carry every meaning on their own.
- No flashing or rapid strobing. The bell "ring" stays below 3 flashes per second.
- Export: MP4 (1080p, captions as a separate `.vtt`) and a still-frame PNG of scene 8 to use as `middleware-pipeline.png`. Scene 7's still can serve as `express-error-flow.png`.
- The log-line format shown in scenes 5 and 7 should match the lesson 08 structured logger (`time`, `level`, `requestId`, ...). Update it if the lesson's logger changes.
