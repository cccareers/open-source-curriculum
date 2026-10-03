---
course_id: node200
media_id: node200-a02
type: animation-storyboard
title: "One Request Through the Layers"
target_runtime: "75 sec"
suggested_tool: "Excalidraw+screen recording"
related_lessons:
  - node200-02
  - node200-06
objectives:
  - Structure an Express application into modules with clear responsibilities
competency_ids:
  - D5-S1-C02
  - D2-S1-C02
---

## Concept and misconception it fixes

Learners read `app.js` as configuration rather than as an ordered pipeline, and they put rules wherever is convenient. The animation follows one `GET /events/12` request through `createApp()` in registration order: middleware, router, service, repository. Then it follows a failing request that short-circuits to `errorHandler`, so learners can see that order matters and that dependencies only point downward.

## Visual language (shapes, colors with color-blind-safe palette, labels)

- A vertical stack of horizontal bands, each labeled with its file: `morgan`, `express.json`, `express.urlencoded`, `express.static("public")`, `/healthz → healthRouter`, `/events → eventsRouter`, `notFound`, `errorHandler`. These match `src/app.js` from lesson 02, top to bottom.
- To the right, three boxes: `routes/events.routes.js`, `services/events.service.js`, `repositories/events.repository.js`, with downward-only arrows.
- The request is a token labeled `GET /events/12`. A normal request travels a **solid line, blue #0072B2**; an error travels a **dashed line, vermillion #D55E00**, with the text "next(err)". Shape and line style carry the meaning; color is only reinforcement.

## Scenes

| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 8s | Full stack drawn; title "src/app.js runs top to bottom". | Bands draw in, in order. | "createApp registers middleware in order, and every request walks that order." |
| 2 | 12s | Token enters at `morgan`, then passes `express.json`, `urlencoded`, and `static` (no file matches). | Each band ticks as the token passes. | "Logging, body parsing, static files. No public file is named /events/12, so the request keeps going." |
| 3 | 6s | Token skips `/healthz`. | The healthz band dims. | "The path doesn't start with /healthz, so that router is skipped." |
| 4 | 14s | Token enters `/events → eventsRouter`; zoom right into `routes` → `services.getById(12)` → `repositories.findById(12)`. | Arrows light downward only; a label shows "router sees /:id, not /events/:id". | "The router sees a path relative to its mount point. The handler calls the service, and the service calls the repository. Dependencies only point down." |
| 5 | 8s | The response travels back up as a token labeled `200 { id: 12, … }`. | It moves up the same arrows and out. | "The result travels back up and out. No layer reached up into a layer above it." |
| 6 | 15s | Second token, `GET /events/999`. The service throws `NotFoundError`. | The dashed vermillion path jumps straight from the service to `errorHandler`, skipping `notFound`. The label reads "next(err) → error middleware (4 arguments)". | "Now an event that doesn't exist. The service throws a NotFoundError. Express skips every normal handler and jumps to the error handler, which turns it into a 404 response." |
| 7 | 8s | Third token, `GET /nope`, passes every band unmatched and lands on `notFound`. | Solid line to `notFound`. | "A path nothing matches falls through to notFound. That's why notFound and errorHandler are registered last." |
| 8 | 4s | Callout: move `errorHandler` above `/events`. The scene 6 token now goes nowhere and a "request hangs or default HTML error" label appears. | Shake. | "Register them first and they never see the errors. Order is behavior." |

## Interaction variant (optional)

A drag-to-reorder version of the band stack. Learners move `notFound` or `errorHandler` above the routers and replay the three requests to see what breaks. This pairs well with lesson 02's practice item on splitting `server.js` into `createApp()`.

## Production notes

- Band labels must match lesson 02's `src/app.js` listing exactly, including `/healthz`.
- Error handling details (error classes, the 4-argument signature) come from lesson 06. Keep scene 6's label short and link to lesson 06 in the caption.
- Excalidraw keeps the hand-drawn look consistent with other whiteboard media in the pathway. Record with a screen recorder at 1080p and add captions as WebVTT.
