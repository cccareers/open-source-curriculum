---
course_id: node200
media_id: node200-v01
type: video-script
title: "When an Async Route Throws - Express 4 vs Express 5"
format: screencast
target_runtime: "7 min"
related_lessons:
  - node200-04
  - node200-08
objectives:
  - Troubleshoot a running service from its logs and symptoms
competency_ids:
  - D6-S1-C02
  - D4-S1-C05
---

## Purpose

After watching, you can predict and recognise what happens when an `async` route handler throws on Express 4 and on Express 5: a crashed process, a hung request, or a clean 500. You can also apply the right fix for the version you are on.

## Audience and prerequisites

Apprentices who have finished lesson 04 (the `try/catch` note) and are starting lesson 08. They know how to run the events board, use `curl -i`, and read a pino log line. No knowledge of the event loop internals is assumed.

## Script

Recording setup: VS Code (light theme, 18pt font) on the left and a terminal on the right at 18pt. Node 22 LTS. Two throwaway folders: `async-demo-4` (Express 4 pinned with `npm install express@4`) and `async-demo-5` (`npm install express@5`). Both have `"type": "module"` in `package.json`.

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Cold open: terminal showing `curl: (52) Empty reply from server`, then the server pane showing a stack trace and the shell prompt returning. | "One bad request just took down the whole events board. Not one user's page, every user's. The code that did it is four lines long, and on a different version of Express it would have been a polite 500. Let's see why." |
| 0:20 | Title card: "When an async route throws". Subtitle: "Express 4 vs Express 5, Node 22". | "This is about one line in lesson 04 that turns into an incident in lesson 08." |
| 0:30 | Editor, `async-demo-4/server.js`. Type it out (code below, block A). Highlight the `throw` line. | "Here's a tiny app on Express 4. One route, `GET /events/:id`. It's async because it would normally await the database, and here it throws, the way a repository throws when Postgres is unreachable. There's an error handler at the bottom, the four-argument kind from node101. The question is whether that handler ever runs." |
| 1:05 | Terminal: `npm ls express` shows `express@4.x`. Then `node server.js` prints `listening on 3000`. | "First habit: check the version. `npm ls express` says 4. Start the server." |
| 1:15 | Second terminal: `curl -i http://localhost:3000/events/1`. Output: `curl: (52) Empty reply from server`. The server pane prints the `Error: database unreachable` stack and exits; prompt returns. Zoom on the returned prompt. | "Now the request. Curl gets no response at all: 'Empty reply from server'. And look at the server: a stack trace, then the shell prompt. The process is gone. Every other user's request was dropped with it." |
| 1:40 | Diagram overlay (simple boxes): `async handler` → `rejected promise` → arrow to `Express 4` with a crossed-out arrow to `error handler`, then arrow to `Node: unhandled rejection` → `process exits`. | "Here's what happened. An async function never throws directly. It returns a promise that rejects. Express 4 calls your handler and ignores what it returns, so nobody is listening to that promise. Since Node 15, an unhandled rejection crashes the process by default. Your error handler never got a chance." |
| 2:15 | Editor: add block B (the `unhandledRejection` listener that only logs) to the top of `server.js`. Restart. Run the same curl. Curl sits with a blinking cursor. Overlay a timer counting up. | "Some codebases try to stop crashes by adding a listener that logs and carries on. Watch what that does. Same request. Now curl just waits. The process survived, but nobody will ever answer this request. It hangs until the client gives up. In production this is the 'silent hang' from lesson 08's field guide: one log line if you're lucky, and a user staring at a spinner." |
| 2:55 | Press Ctrl+C in curl. Editor: delete block B. | "Neither outcome is acceptable. Let's fix it properly. There are two options on Express 4." |
| 3:05 | Editor: wrap the handler body in `try/catch` and call `next(err)` (block C). Restart, curl. Output: `HTTP/1.1 500 Internal Server Error` and `{"error":{"code":"internal_error","message":"Something went wrong"}}`. | "Option one: `try`, `catch`, and pass the error to `next`. Now Express 4 knows about it, the error handler runs, and the client gets a 500 with the generic body from lesson 06. The process is still up. Prove it: same curl again, same 500." |
| 3:35 | Editor: create `async-handler.js` (block D) and rewrap the route with `asyncHandler(...)`, removing the `try/catch`. Restart and curl; same 500. | "Option two, which scales better: write a wrapper once. `asyncHandler` takes your async function, runs it, and attaches `.catch(next)` to the promise. Same result, one line per route, and nobody forgets the `catch`." |
| 4:10 | Switch to `async-demo-5`. `npm ls express` shows `express@5.x`. Editor shows block A unchanged (no try/catch, no wrapper). | "Now Express 5, with the original code: no `try`, no wrapper." |
| 4:25 | `node server.js`, then `curl -i http://localhost:3000/events/1`. Output: `HTTP/1.1 500 Internal Server Error` with the JSON body. Server pane shows the error logged by the handler and keeps running. | "A 500, from our own error handler, and the server is still running. Express 5 looks at what your handler returns. If it's a promise that rejects, Express passes the rejection to `next(err)` for you. That's why lesson 02's handlers can be async without a `try/catch`, but only on 5." |
| 4:55 | Split screen: left "Express 4", right "Express 5", three rows: "Async throw, no catch", "With try/catch or asyncHandler", "Sync throw". Left column shows "Process exits (Node 15+) or hangs", "500 via error handler", "500 via error handler". Right column shows "500 via error handler" for all three. | "Here's the summary. Synchronous throws have always been caught, on both versions. Async throws are the difference. On 4 you must catch them yourself. On 5, Express does it." |
| 5:25 | Editor: `server.js` in the events board with lesson 08's `unhandledRejection` and `uncaughtException` handlers that log at fatal and call `process.exit(1)`. | "So why does lesson 08 still add a process-level handler? Because route handlers aren't the only place promises live. A `setTimeout`, an event listener, or a forgotten `await` can reject anywhere. The last-resort handler doesn't keep the process alive. It makes sure the crash is written to your structured log with a request-independent fatal line, and then exits, so the supervisor restarts a clean process." |
| 6:00 | Terminal: `jq 'select(.level == 60)' app.log` showing one fatal line with `"msg":"unhandled rejection — exiting"`. | "When you see this line in an incident, read it as 'something async was not awaited or not caught', then find which route or timer it came from." |
| 6:20 | Checklist card. | "Three things to take away. One: check your Express major with `npm ls express`. Two: on Express 4, every async handler gets `try/catch` or `asyncHandler`. Three: a process-level rejection handler should log and exit, never log and carry on." |
| 6:45 | End card: "Next: lesson 08, Fault 3 — reproduce this in your own events board." | "In lesson 08's Fault 3 you'll reproduce this on your own service. Note which of the three outcomes you get, and why." |

### Code shown on screen

Block A, `server.js` (identical in both demo folders):

```javascript
import express from "express";

const app = express();

async function findEvent(id) {
  throw new Error("database unreachable");
}

app.get("/events/:id", async (req, res) => {
  const event = await findEvent(req.params.id);
  res.json(event);
});

app.use((err, req, res, _next) => {
  console.error("error handler:", err.message);
  res.status(500).json({ error: { code: "internal_error", message: "Something went wrong" } });
});

app.listen(3000, () => console.log("listening on 3000"));
```

Block B, the anti-pattern (shown, then deleted):

```javascript
process.on("unhandledRejection", (reason) => {
  console.error("unhandled rejection (ignored):", reason.message);
});
```

Block C, the Express 4 fix with `try/catch`:

```javascript
app.get("/events/:id", async (req, res, next) => {
  try {
    const event = await findEvent(req.params.id);
    res.json(event);
  } catch (err) {
    next(err);
  }
});
```

Block D, the Express 4 wrapper:

```javascript
// async-handler.js
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// server.js
import { asyncHandler } from "./async-handler.js";

app.get("/events/:id", asyncHandler(async (req, res) => {
  const event = await findEvent(req.params.id);
  res.json(event);
}));
```

Commands, in order:

```bash
npm ls express
node server.js
curl -i http://localhost:3000/events/1
jq 'select(.level == 60)' app.log
```

## On-screen assets and B-roll

- Two pre-built demo folders (`async-demo-4`, `async-demo-5`) committed to the course assets repo so the recording is reproducible.
- Overlay diagram for 1:40: four labelled boxes and arrows, with the broken path shown as a dashed line plus an "X" label (not colour alone).
- Summary table graphic for 4:55, built as real text (not an image of text) so it can be captioned and read by screen readers in the transcript.
- B-roll is optional: a short clip of a load balancer dashboard showing a replica restarting (generic, no vendor branding).

## Accessibility

- Burned-in captions plus a downloadable `.vtt`. Narration describes every terminal result aloud ("curl gets no response: empty reply from server"), so nothing depends on reading the terminal.
- Terminal and editor at 18pt or larger, high-contrast light theme. The cursor is highlighted during typing.
- The 1:40 diagram distinguishes the failing path by a dashed line and an "X" label as well as colour. The summary table uses the words "exits", "hangs", and "500", not colour coding.
- All interaction is keyboard-driven (no mouse-only menus). The shortcuts used are named aloud the first time.
- The transcript includes all four code blocks as text.

## Check for understanding

1. On Express 4 and Node 22, an async route handler throws and there is no `unhandledRejection` listener. What does the client see, and what happens to the process?
   *Answer:* The client's connection is closed with no response (curl: "Empty reply from server"). The process crashes, because Node 15+ treats an unhandled rejection as fatal by default, and every other in-flight request is dropped.
2. Why is `process.on("unhandledRejection", log)` with no `process.exit` worse than no listener at all?
   *Answer:* It keeps a process in an unknown state alive and turns crashes into requests that hang forever with no response, which are harder to detect and diagnose.
3. Your team upgrades from Express 4 to 5. Do you need to remove `asyncHandler` wrappers?
   *Answer:* No, they still work, because they call `next(err)` themselves. They become redundant, so you can remove them gradually. Keep a test that proves an async throw becomes a 500.
