---
course_id: node101
title: "Introduction to Express JS — Enhancement Review"
reviewed_lessons: 9
status: draft
---

## Summary
node101 is strong: every lesson is concrete, written in a consistent direct voice, built on one running example (the in-memory community events board), and the practice sections are real work with real deliverables. The biggest problem is version drift. Lesson 02 shows `"express": "^4.21.2"`, but `npm install express` has installed Express 5 since early 2025 (verified: it installs 5.2.1 today). Several code samples and claims are Express 4-only and break or mislead on 5: the inline regex route parameter throws at startup, `req.body` is `undefined` (not `{}`) when a parser skips a request, the default query parser no longer nests bracketed keys, and middleware no longer lacks a promise contract. The second biggest problem is that the event data model drifts between lessons, from `{ id: number, date, venue }` (02–04) to `{ location, startsAt }` (06) to `{ id: "e-104", ..., capacity }` (07), and several snippets compare `e.id === req.params.id`, which the course itself teaches is always false for numeric ids. There are also small undefined helpers (`formatDate`, `nextId`, `logger`). This pass fixes the clear errors in place, adds "Check your understanding" blocks to lessons 02–08, and lists the remaining consistency decisions as open questions.

## Clarity issues
| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| node101-02 | "Installing Node and pinning a version" | The text says "any current LTS is fine... Node 20 or newer". Node 20 reached end-of-life in April 2026, so a learner following it today could pin an unsupported runtime. | Added a sentence recommending 22 or 24 and explaining why an EOL line is a bad pin. | Applied |
| node101-02 | "Dependencies, semver, and the lockfile" | The `^4.21.2` sample suggests learners will get Express 4. `npm install express` gives 5.x. The course never says which major it targets. | Added a note: you will most likely get 5.x, the lessons call out where 4 and 5 differ, and `npm install express@4` is the way to match the samples exactly. | Applied |
| node101-03 | "Shaping the response" | `res.sendStatus(204)` is described as sending the body `No Content`. A 204 never carries a body; Node strips it. | Corrected the example to use `403` and added a 204 caveat. | Applied |
| node101-03 | "A dev loop, and testing what you built" | The sample `curl -i` output shows `Content-Length: 34` for a 30-byte body, and it still shows `X-Powered-By` after the lesson told you to disable it. | Corrected to 30 / `W/"1e-..."` and added a sentence explaining that the header disappears once `app.disable("x-powered-by")` is in place. | Applied |
| node101-03 | "Choosing a port from the environment" + Practice step 10 | Step 10 says to stop with Ctrl+C and watch the `SIGTERM` message print. Ctrl+C sends `SIGINT`, so the message never prints and the learner thinks the handler is broken. | Explained SIGINT vs SIGTERM after the code. Step 10 now uses `kill -TERM <pid>` and offers a `SIGINT` handler as an alternative. | Applied |
| node101-04 | "Route parameters" | The `"/events/:id(\\d+)"` regex constraint throws `Unexpected ( at index 11` at startup on Express 5 (verified). | Added an Express 5 note: inline regex parameters were removed, so validate in the handler. | Applied |
| node101-04 | "Query strings and `req.query`" | "By default Express parses `?filter[venue]=Maker` into `{ filter: { venue: "Maker" } }`" is true only on Express 4. On 5 the default "simple" parser gives `{ "filter[venue]": "Maker" }` (verified). | Added a version qualifier. | Applied |
| node101-05 | "What a middleware function actually is" | "no promise contract that Express awaits, and no automatic error catching" is Express 4-only. Express 5 forwards rejected promises to `next(err)`. | Qualified it for Express 4 and pointed to lesson 08. | Applied |
| node101-05 | "Order is the whole design" | The lesson says `app.js`, but lesson 04 built `src/server.js`. Learners wonder whether they missed a file. | Added one sentence: `app.js` means your entry file. | Applied |
| node101-05 | "Middleware you do not have to write" | Says a mismatched content type leaves `req.body` as `{}`. That is true on Express 4 only; on Express 5 it is `undefined` (verified). Practice step 4 also does not warn that `curl -d` adds `Content-Type: application/x-www-form-urlencoded` on its own, so with `urlencoded` mounted the JSON string becomes a form key. | Added a version qualifier and a curl tip (`-H "Content-Type:"` removes the header). | Applied |
| node101-05 | "Mounting: paths, routers, and scope" | The router sample compares `e.id === req.params.id` with numeric ids (always false, the exact bug lesson 04 warns about), and `events` is never imported. | Added the import and changed the comparison to `Number(req.params.id)`. | Applied |
| node101-06 | "Serving a public directory" | Says to put `public/` next to the entry file and run `node app.js`. With lesson 04's `src/server.js`, `__dirname` is `src/`, so `public/` at the project root 404s. | Added a note on where `public/` must live relative to `__dirname`. | Applied |
| node101-06 | "Rendering with a template engine" | The templates switch to `event.location` / `event.startsAt` without saying so. Learners' data still has `venue` / `date`. | Added a short "the event shape grows here" step. | Applied |
| node101-06 | "Rendering with a template engine" | The detail route compares `e.id === req.params.id`, which fails for numeric ids. | Changed to `String(e.id) === req.params.id`, which works for both id styles, and explained why. | Applied |
| node101-06 | "Accessible and responsive templates" | `formatDate(...)` is called but never defined, so the template throws `ReferenceError`. | Added an `app.locals.formatDate` definition using `Intl.DateTimeFormat`. | Applied |
| node101-07 | "Designing the resource before you write a route" | The id changes from a number to `"e-104"` with no migration step. | Added a sentence telling learners to convert existing fixture ids. | Applied |
| node101-07 | "Reading and writing JSON in Express" | `nextId` is used but never declared. | Added the declaration line with a comment. | Applied |
| node101-07 | "Who else calls this, and CORS" | CORS is mounted on `/events` (the HTML pages), but the API lives at `/api/v1/events`, and practice step 9 says `/api/v1`. | Changed the mount path to `/api/v1/events`. | Applied |
| node101-08 | "When a handler fails" | Says "the detail route from lesson 04, unchanged", but lesson 04's version validates and 404s. This one has the check removed on purpose. | Reworded to say the check was deliberately removed. | Applied |
| node101-08 | "Errors Express cannot see" | Says an unhandled rejection leaves "the browser spinning until it times out" and then also says it terminates the process. On current Node (verified: Express 4 + Node 24), the process exits immediately and the client gets an empty reply. The hang only happens if something swallows the rejection. | Rewrote the sentence to describe both outcomes accurately. | Applied |
| node101-08 | "The error handler and where it sits" | The assembled `app.js` uses `express.static("public")`, a relative path that lesson 06 says never to use. It also imports `{ eventsRouter }` as a named export, while lesson 04 exports it as default. | Used the absolute path and the default import. | Applied |
| node101-08 | "Expected failures and real ones" | `logger` is used before it is defined, and the reader isn't told where it comes from. | Added an import line pointing to the logger module built later in the lesson. | Applied |
| node101-09 | R5, R7 | R5 asks for `/healthz`, but lesson 03 built `/health`. R7 asks `/api/events` to return "a JSON array", but lesson 07 built `/api/v1/events` returning a `{ data, meta }` envelope. | Clarified R5 (rename or alias) and R7 (whichever path you mounted; the lesson 07 envelope satisfies it). | Applied |

## Depth and coverage gaps
- **Automated testing is never shown** (all objectives). Every verification step uses `curl` and reading output by eye. The repo's CONTRIBUTING.md asks coding projects to ship a learner-runnable test suite. Both supplementary projects split `createApp()` from `listen()` and use `node:test` + `supertest`. A short sidebar in lesson 03 or 07 showing that split would make the capstone testable. (Maps to "Serve HTTP responses from an Express application" and "Build a JSON API that other clients can consume".)
- **Express 4 vs 5 is handled in one paragraph of lesson 08 only.** A single "which Express am I on, and what changes" reference table (path syntax, `req.body` default, query parser, async errors, `urlencoded` `extended` default, removed `res.redirect(url, status)` order) would prevent most version confusion. (Maps to "Set up a Node and Express project with the tooling a server needs".)
- **Data model drift.** The course should pick one canonical event shape and introduce changes to it on purpose. A fixture file per lesson (or a "your data now looks like this" box at the top of 06 and 07) would fix this. See open questions.
- **PUT is in the API table but never implemented** (lesson 07). Practice step 1 asks learners to document a replace endpoint, but no step builds it. A worked PUT example covering the "full replacement, missing fields become null" rule would close the gap. (Maps to "Build a JSON API that other clients can consume".)
- **No POST handler for the HTML form** (lesson 06 builds `new-event.ejs`, which posts to `/events`, but no lesson writes the handler or the 303 redirect that lesson 04 promises). (Maps to "Serve static assets and rendered views to a browser".)
- **Error handler for body-parser failures.** Lesson 08 notes a malformed JSON body is a 400, but never shows that `express.json()` sets `err.status = 400` and `err.type = "entity.parse.failed"`. Showing this would let learners see why their handler's `err.status ?? 500` already does the right thing. (Maps to "Handle and log errors so failures are diagnosable".)
- **Graceful shutdown** is introduced in lesson 03 but never revisited in lesson 09, where hosts actually send `SIGTERM`. Add one line to the lesson 09 hints. (Maps to "Prepare an Express application to run on a publicly accessible host".)
- **Misconception worth naming in 05:** "middleware runs after the route" (the `res.on("finish")` explanation covers this, but the animation in `media/` makes it visible).

## Proposed additional projects
- **Drafted — `projects/01-event-rsvp-api.md` (node101-x01):** nested RSVP sub-resource on the events API, with capacity limits, 201/204/400/404/409, a consistent error shape, and request ids. Ships an 11-test `node:test` + `supertest` suite, verified passing against Express 5.2.1 and Express 4.
- **Drafted — `projects/02-venue-pages-and-maintenance-mode.md` (node101-x02):** rendered venue index and detail pages with partials, escaping, and static CSS, plus a request-id middleware and a configurable maintenance-mode gate that exempts `/healthz`. Ships a 7-test suite, verified passing on Express 5 and 4.
- Not drafted — **Events CSV export**: `GET /api/v1/events.csv` with `res.type("text/csv")`, `Content-Disposition`, and correct quoting. Reinforces "Serve HTTP responses from an Express application".
- Not drafted — **Bug hunt kit**: a pre-broken events board with five planted faults (route order, missing `next()`, three-arg error handler, relative static path, `devDependencies` mistake). Learners find each from logs and write lesson-08-style issue reports. Reinforces "Handle and log errors so failures are diagnosable".
- Not drafted — **Deploy rehearsal**: deploy the trivial `/healthz`-only app to two different free hosts and compare them on the lesson 09 criteria before the real capstone. Reinforces "Prepare an Express application to run on a publicly accessible host".

## Video and animation opportunities
- **Drafted — `media/video-01-route-order-and-params.md`**: lesson 04, screencast. Shows `/events/upcoming` being swallowed by `/:id`, string-vs-number params, and the 400/404 split. Motion helps because the failure is silent: you have to watch the wrong handler fire.
- **Drafted — `media/video-02-async-errors-express-4-vs-5.md`**: lessons 08 and 05, screencast. Runs the same async handler on Express 4 (hang, then crash) and Express 5 (500), then fixes both with `asyncRoute`. Seeing the hang beats reading about it.
- **Drafted — `media/animation-01-middleware-pipeline.md`**: lessons 05 and 08, explainer animation. A request token travels the stack, shows the three exits (next / respond / hang), `res.on("finish")` firing after the response, and `next(err)` jumping to the four-argument handler. This is the course's `middleware-pipeline.png` and `express-error-flow.png` brought to life.
- Not drafted — **"What actually travels"** (lesson 03, whiteboard): a raw HTTP request and response drawn as text blocks, with each part highlighted as the narration names it.
- Not drafted — **Static vs rendered** (lesson 06, explainer animation): two requests race, one short-circuits at `express.static`, the other goes through the router and template engine. Includes the shadowing case where a file in `public/` intercepts `/events`.
- Not drafted — **Deploy walkthrough** (lesson 09, talking head + screencast): reading a host's log view and finding one request by its id. Must stay host-neutral or be produced per host.

## Assessment ideas
- **Status-code sorting drill** (lessons 03, 04, 07, 08): 15 scenario cards ("id is `banana`", "event 999 does not exist", "template references an undefined variable", "DELETE succeeded"). Learners assign a status and a one-line justification. Auto-gradable.
- **Pipeline ordering puzzle** (lesson 05): give six shuffled `app.use` lines and three symptoms; learners reorder them and explain which symptom each move fixes.
- **Predict-the-output** (lesson 04): five route tables plus five URLs; learners predict which handler fires before running the code.
- **Error report rubric** (lesson 08): score the report on observed/expected, timezone, request id, reproduction, ruled-out list, and fact-vs-guess separation (0–2 each).
- **DEPLOY.md peer review checklist** (lesson 09): the nine required items as a checklist, plus "could I redeploy this from the record alone?".
- **Automated capstone smoke test**: a small `supertest`-style script pointed at the learner's public URL (through `fetch`) that checks R5–R8, so reviewers grade consistently.

## Changes applied in this pass
- `02-the-node-runtime-and-npm.md`, "Installing Node and pinning a version": added a sentence noting Node 20 reached end-of-life in April 2026, so learners should choose 22 or 24.
- `02-the-node-runtime-and-npm.md`, "Dependencies, semver, and the lockfile": added a note that `npm install express` now installs Express 5, that later lessons flag 4/5 differences, and how to install 4 to match the samples exactly.
- `02-the-node-runtime-and-npm.md`, end of file: added "Check your understanding" (4 questions with answers).
- `03-serving-http-with-express.md`, "Shaping the response": corrected the `res.sendStatus` example (204 never carries a body).
- `03-serving-http-with-express.md`, "Choosing a port from the environment": added an explanation that Ctrl+C sends `SIGINT`, not `SIGTERM`, and how to send `SIGTERM` locally.
- `03-serving-http-with-express.md`, "A dev loop, and testing what you built": corrected `Content-Length`/`ETag` in the sample output and explained why `X-Powered-By` appears there.
- `03-serving-http-with-express.md`, "Practice" step 10: now sends `SIGTERM` with `kill -TERM`, or registers a `SIGINT` handler, so the shutdown message actually prints.
- `03-serving-http-with-express.md`, end of file: added "Check your understanding".
- `04-routing-and-route-parameters.md`, "Route parameters": added an Express 5 note that inline regex parameters were removed and now throw at startup.
- `04-routing-and-route-parameters.md`, "Query strings and `req.query`": qualified bracketed-key nesting as Express 4 behavior and showed the Express 5 result.
- `04-routing-and-route-parameters.md`, end of file: added "Check your understanding".
- `05-middleware-and-the-request-pipeline.md`, "What a middleware function actually is": qualified "no promise contract / no automatic error catching" as Express 4 behavior.
- `05-middleware-and-the-request-pipeline.md`, "Order is the whole design": clarified that `app.js` means your entry file (`src/server.js` if you followed lesson 04).
- `05-middleware-and-the-request-pipeline.md`, "Middleware you do not have to write": noted `req.body` is `undefined` on Express 5 when a parser skips, and added a curl tip about the default `Content-Type` that `-d` sends.
- `05-middleware-and-the-request-pipeline.md`, "Mounting: paths, routers, and scope": added the missing `events` import and fixed the string-vs-number id comparison.
- `05-middleware-and-the-request-pipeline.md`, end of file: added "Check your understanding".
- `06-static-assets-and-rendered-views.md`, "Serving a public directory": added a note on where `public/` must live when the entry file is `src/server.js`.
- `06-static-assets-and-rendered-views.md`, "Rendering with a template engine": added the missing step that migrates events to `location`/`startsAt`, and made the detail-route id comparison work for numeric and string ids.
- `06-static-assets-and-rendered-views.md`, "Accessible and responsive templates": defined the `formatDate` helper on `app.locals` with `Intl.DateTimeFormat` and an explicit `timeZone`, and defined `app.locals`.
- `06-static-assets-and-rendered-views.md`, end of file: added "Check your understanding".
- `07-building-a-json-api.md`, "Designing the resource before you write a route": added a step converting fixture ids to strings and adding `capacity`.
- `07-building-a-json-api.md`, "Reading and writing JSON in Express": declared `nextId`.
- `07-building-a-json-api.md`, "Who else calls this, and CORS": mounted CORS on `/api/v1/events`, matching the API path and practice step 9.
- `07-building-a-json-api.md`, end of file: added "Check your understanding".
- `08-error-handling-and-logging.md`, "When a handler fails": clarified that the sample is lesson 04's route with its check deliberately removed.
- `08-error-handling-and-logging.md`, "The error handler and where it sits": used an absolute static path and the default router import, matching lessons 04 and 06.
- `08-error-handling-and-logging.md`, "Errors Express cannot see": corrected what an unhandled rejection does on current Node (process exits, client gets an empty reply; it hangs only if the rejection is swallowed).
- `08-error-handling-and-logging.md`, "Expected failures and real ones": added the `logger` import line and a file-path comment (`middleware/errors.js`).
- `08-error-handling-and-logging.md`, "Logs you can actually use": added a `// lib/logger.js` file-path comment so the import above resolves.
- `08-error-handling-and-logging.md`, end of file: added "Check your understanding".
- `09-project-publish-a-public-express-site.md`, "Requirements" R5 and R7: reconciled `/health` vs `/healthz`, `/api/events` vs `/api/v1/events`, and "JSON array" vs the `{ data, meta }` envelope.

## Open questions for the course owner
- **Which Express major does the course target?** These edits keep the course version-neutral and flag the differences. If you choose Express 5, the `^4.21.2` sample in lesson 02 and the lesson 08 paragraph on the async gap should be rewritten around 5, with 4 as the legacy note. If you choose Express 4, every install command should say `npm install express@4`.
- **Canonical event shape.** Should the course settle on `{ id: "e-101", title, location, startsAt, capacity }` from lesson 02 onward? That would remove the mid-course migration steps added in lessons 06 and 07. The supplementary projects already use this shape.
- **API path.** Lesson 07 teaches `/api/v1/events`; lessons 08 and 09 say `/api/events`. These edits make lesson 09 accept either. Pick one and update lesson 08's mount line and practice step 5.
- **Health path.** `/health` (lesson 03) vs `/healthz` (lesson 09). Pick one.
- **Node LTS dates.** I stated that Node 20 reached end-of-life in April 2026. Please confirm against the Node.js release schedule before publishing, and decide whether `engines` in the lesson 02 sample should move from `>=20.11.0` to `>=22`.
- **`node --env-file`** (lesson 03) and **`node --watch`** (lessons 02/03): both are stable on current LTS lines as far as I know, but I did not confirm the exact versions where each left experimental status. If the course states minimums, verify them.
- **morgan token with a custom format** (lesson 08): `morgan.token("id", ...)` must run before any request is logged. The lesson shows the two pieces in separate snippets. Consider stating that the token registration goes above `app.use(morgan(...))`.
- **Images referenced but absent.** Lessons 03, 05, and 08 reference `./img/*.png` assets listed in `course.json` `assets`. I did not check whether they exist in the player build.
- **Time zone in `formatDate`** (lesson 06): the example uses `America/New_York` as a placeholder. Set it to the community the board actually serves.
- **Supplementary projects use HTTP 409** for "event full" (x01). It isn't taught in the core lessons; the brief defines it. Confirm that's acceptable, or switch to 400 with an `event_full` code.
