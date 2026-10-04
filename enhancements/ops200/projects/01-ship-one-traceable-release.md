---
course_id: ops200
project_id: ops200-x01
title: "Ship the Events Board as One Traceable Release"
kind: supplementary-project
status: draft
hours_estimate: 6
difficulty: core
related_lessons:
  - ops200-02
  - ops200-03
  - ops200-05
objectives:
  - Produce the build artifacts and assets a website deploys
  - Automate a repeatable build with a task runner and twelve-factor configuration
  - Document a release so its changes can be traced
competency_ids:
  - D2-S1-C03
  - D5-S1-C01
  - D4-S1-C03
---

## Scenario

The events board's last deploy went out on a Friday afternoon. A teammate copied `web/` instead of `web/dist`, the API started even though `SESSION_SECRET` was missing (it crashed on the first login), and when support asked "what version is live?" nobody could answer. Your lead asks you to make the single-release server from lesson 02 trustworthy. It should refuse to start without its configuration, serve the front-end artifact with correct caching, never let the app shell swallow API errors, and report exactly which build is running.

## What you will build / produce

- `api/src/config.js`: the fail-fast config module from lesson 03, plus an optional `WEB_DIST` path so the artifact location is configuration, not a hard-coded path.
- `api/src/build-info.js` and the pipeline step that writes `api/src/build-info.json` (lesson 05).
- `api/src/server.js`: health, `/api/events`, a JSON 404 for unknown `/api` paths, static assets with a one-year cache, and an app-shell fallback that isn't cached for a year.
- `test/release.test.js` (provided) passing.
- `RELEASE-CHECK.md`: one paragraph per test explaining which deploy failure it prevents.

## Before you start (prerequisites, starter files or data)

- The events-board repository from lessons 02–03 (root workspaces, `api/`, `web/`), Node 20.11 or later.
- Express installed in the API workspace. These tests were verified on Express 5. If you're on Express 4, everything works the same except that Express 5 rejects the `"*"` catch-all.
- `"test": "node --test"` in the root `package.json`, and `api/src/build-info.json` added to `.gitignore`.
- The server must start with `node api/src/server.js` from the repository root and listen on `PORT`.

## Milestones

1. **Config contract.** `SESSION_SECRET` and `DATABASE_URL` are required; `PORT` and `WEB_DIST` are optional, with `WEB_DIST` defaulting to `web/dist`. The process must exit non-zero, naming the missing variable, before it listens.
2. **Build identity.** Add `build-info.js` with safe defaults and expose `version`, a 7-character `commit`, `builtAt`, and `uptimeSeconds` from `/health`.
3. **Route order.** Health and API routes first. Then a catch-all `404` JSON response for anything else under `/api`. Then static assets. Then the app-shell fallback.
4. **Caching.** Static assets get `maxAge: "1y"`. Both the fallback and direct `/index.html` requests set `Cache-Control: no-cache` on the shell (use `setHeaders` on the static middleware; `index: false` alone does not protect the direct URL). Explain in `RELEASE-CHECK.md` why each is correct.
5. **Run the tests**, then add the "Record build identity" step to your pipeline's build job and confirm the deployed `/health` reports the real version and commit.
6. **Write `RELEASE-CHECK.md`.**

## Acceptance criteria

- [ ] `npm test` passes all seven tests from the repository root.
- [ ] Starting the server with `SESSION_SECRET` unset exits within a second, with a message naming the variable.
- [ ] `curl -s <deployed>/health` shows a version matching `package.json` and the commit of the pipeline run that built it.
- [ ] `curl -sI <deployed>/assets/<hashed file>` shows `max-age=31536000`; `curl -sI <deployed>/events/12` doesn't.
- [ ] `api/src/build-info.json` is gitignored and never committed.

## Automated checks (coding courses)

Save as `test/release.test.js`. The tests start your real server as a child process, with a temporary fake `dist/` and a temporary `build-info.json`. Any `build-info.json` you already have is backed up and restored.

```javascript
// test/release.test.js — acceptance tests for ops200-x01 (Ship the Events Board as One Release)
// Run from the repository root: node --test
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync, renameSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const SERVER = path.resolve("api/src/server.js");
const BUILD_INFO = path.resolve("api/src/build-info.json");
const PORT = 3907;
const BASE = `http://localhost:${PORT}`;

// A fake front-end artifact, so these tests don't depend on a Vite build.
const dist = mkdtempSync(path.join(tmpdir(), "web-dist-"));
mkdirSync(path.join(dist, "assets"));
writeFileSync(path.join(dist, "index.html"), '<!doctype html><title>Community Events Board</title><div id="root"></div>');
writeFileSync(path.join(dist, "assets", "index-b7a4e2d9.js"), "console.log('app');");

function start(env) {
  const child = spawn(process.execPath, [SERVER], {
    env: { PATH: process.env.PATH, ...env },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  child.stdout.on("data", (d) => (output += d));
  child.stderr.on("data", (d) => (output += d));
  const exited = new Promise((resolve) => child.on("exit", (code) => resolve(code)));
  return { child, exited, output: () => output };
}

async function waitForServer() {
  for (let i = 0; i < 50; i++) {
    try { await fetch(`${BASE}/health`); return; } catch { await new Promise((r) => setTimeout(r, 100)); }
  }
  throw new Error("server did not start within 5 seconds");
}

let server;
let savedBuildInfo = null;

before(async () => {
  if (existsSync(BUILD_INFO)) { savedBuildInfo = BUILD_INFO + ".bak"; renameSync(BUILD_INFO, savedBuildInfo); }
  writeFileSync(BUILD_INFO, JSON.stringify({ version: "v9.9.9", commit: "abc1234def5678", builtAt: "2026-07-21T14:02:11Z" }));
  server = start({ PORT: String(PORT), SESSION_SECRET: "test-only", DATABASE_URL: "postgres://unused", WEB_DIST: dist });
  await waitForServer();
});

after(() => {
  server?.child.kill();
  rmSync(BUILD_INFO, { force: true });
  if (savedBuildInfo) renameSync(savedBuildInfo, BUILD_INFO);
  rmSync(dist, { recursive: true, force: true });
});

test("fails fast with a named variable when required config is missing", async () => {
  const { exited, output } = start({ PORT: String(PORT + 1), WEB_DIST: dist });
  const timeout = new Promise((r) => setTimeout(() => r("still running"), 3000));
  const code = await Promise.race([exited, timeout]);
  assert.notEqual(code, "still running", "server must exit, not keep running, when config is missing");
  assert.notEqual(code, 0, "exit code must be non-zero");
  assert.match(output(), /SESSION_SECRET|DATABASE_URL/, "error must name the missing variable");
});

test("/health reports the build identity from build-info.json", async () => {
  const res = await fetch(`${BASE}/health`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, "ok");
  assert.equal(body.version, "v9.9.9");
  assert.equal(body.commit, "abc1234", "commit is shortened to 7 characters");
  assert.equal(typeof body.uptimeSeconds, "number");
});

test("API routes answer JSON and are not swallowed by the front-end fallback", async () => {
  const res = await fetch(`${BASE}/api/events`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get("content-type"), /application\/json/);
  assert.ok(Array.isArray(await res.json()));
});

test("unknown /api paths return 404, not the app shell", async () => {
  const res = await fetch(`${BASE}/api/does-not-exist`);
  assert.equal(res.status, 404);
  assert.doesNotMatch(await res.text(), /<div id="root">/);
});

test("hashed assets are served with a long cache lifetime", async () => {
  const res = await fetch(`${BASE}/assets/index-b7a4e2d9.js`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get("cache-control") ?? "", /max-age=31536000/);
});

test("direct index.html requests revalidate the shell", async () => {
  const res = await fetch(`${BASE}/index.html`);
  assert.equal(res.status, 200);
  assert.match(await res.text(), /<div id="root">/);
  assert.match(res.headers.get("cache-control") ?? "", /(?:^|[, ])no-cache(?:$|[, ])/);
});

test("deep links get the app shell, and the shell is not cached for a year", async () => {
  const res = await fetch(`${BASE}/events/12`);
  assert.equal(res.status, 200);
  assert.match(await res.text(), /<div id="root">/);
  assert.doesNotMatch(res.headers.get("cache-control") ?? "", /max-age=31536000/);
});
```

```bash
npm test
```

If every test fails at once, the server probably never started. Run `SESSION_SECRET=x DATABASE_URL=x node api/src/server.js` by hand and read the error. The most common cause on Express 5 is `Missing parameter name at index 1: *` from an `app.get("*", ...)` catch-all; use `app.get(/.*/, ...)` instead.

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Configuration | Values hard-coded or read from `process.env` all over the code | One frozen config module; fails fast with named variables | `.env.example` updated in the same commit, with comments explaining each key |
| Artifact serving | Deep links 404 or API errors return HTML | All seven tests pass | Explains each `Cache-Control` choice in terms of content hashing |
| Traceability | `/health` reports `dev` in production | Deployed `/health` matches `package.json` and the run's commit | Release record links the `/health` output to the pipeline run and tag |
| Communication | No write-up | `RELEASE-CHECK.md` maps each test to a failure it prevents | Write-up includes the Friday incident's timeline and which test would have caught each step |

## Stretch goals

- Add `uncaughtException` and `unhandledRejection` handlers that write one structured log line and exit (lesson 06), with a test that triggers one and checks the exit code.
- Serve a `/version.json` from the front-end build too, and add a test that the API's and front end's commits match.

## Reflection prompts

- Why is `WEB_DIST` configuration rather than code, by the twelve-factor test from lesson 03?
- Which test would have caught the Friday "copied `web/` instead of `web/dist`" mistake, and which wouldn't?
- Why does the build identity travel as a file instead of an environment variable on the build step?

## Instructor notes (common pitfalls, how to adapt for time)

- Learners on Express 5 who copy older tutorials hit the `"*"` crash, and every test fails. A reference run confirmed that swapping in `app.get("*")` takes the suite from 7 passing to 0. Good teaching moment: read the first error, not the last.
- Placing `express.static` before the `/api` 404 handler still passes, but placing the app-shell fallback before `/api` routes fails tests 3 and 4.
- If learners' config uses `??` for optional values, an empty `PORT=` becomes `Number("") = 0` and the server binds a random port. Worth a discussion.
- Shorter session (3 hours): provide `build-info.js` and skip milestone 5's pipeline step.
- Verified on Node 24 and Express 5.2 against a reference implementation.
