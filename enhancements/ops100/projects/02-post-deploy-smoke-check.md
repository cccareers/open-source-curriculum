---
course_id: ops100
project_id: ops100-x02
title: "Post-Deploy Smoke Check for Your Public Site"
kind: supplementary-project
status: draft
hours_estimate: 4
difficulty: stretch
related_lessons:
  - ops100-02
  - ops100-07
  - ops100-09
objectives:
  - Deploy a site publicly and verify it behaves as expected
  - Set up a local development environment that mirrors how the project really runs
competency_ids:
  - D4-S1-C03
  - D3-S1-C01
  - D3-S1-C03
  - D2-S1-C04
---

## Scenario

Lesson 09 asks you to re-verify your site against the *public* URL after every deploy. Doing that by hand gets skipped by the third deploy. Your lead asks for a small, zero-dependency Node tool: give it a URL and an expected page title, and it fails loudly if the home page isn't a 200, the title is wrong, expected text is missing, or any internal link is broken. You will run it after every deploy of your lesson 09 site and attach the output to your release notes.

## What you will build / produce

`smoke-check.mjs` (ES module; Node 18+ for the built-in `fetch`) exporting:

- `findInternalLinks(html, pageUrl)`: the sorted, de-duplicated absolute URLs of same-origin links in `<a href="...">`. It resolves relative paths against `pageUrl`, strips `#fragments`, and skips pure-fragment, `mailto:`, `tel:`, `javascript:`, and external links.
- `smokeCheck(siteUrl, { expectTitle, expectText })` returns `{ ok, failures, checkedLinks }`. The failure strings must be exactly:
  - `GET <url> returned <status>` (and stop) when the page isn't 200
  - `title was "<actual>", expected "<expected>"`
  - `page does not contain "<text>"`
  - `broken link <url> returned <status>` for any internal link at 400 or above
- A command-line entry point: `node smoke-check.mjs https://you.github.io/site/ "Team Roster"` prints each failure and a PASS/FAIL line, and exits `0` or `1`.

Also produce `deploy-log.md` with the tool's output for at least two deploys of your lesson 09 site, including one where it caught something.

## Before you start (prerequisites, starter files or data)

- Lessons 02, 07 and 09; Node 18+ (`node --version`); a folder with `package.json` containing `{"type": "module"}`.
- Useful built-ins: `new URL(href, base)` resolves relative links; `url.origin` compares sites; `url.hash = ""` drops fragments; `html.matchAll(/<a\b[^>]*\bhref="([^"]*)"/gi)` finds links (a regex is fine for a smoke check, though it is not a real HTML parser); `import { pathToFileURL } from "node:url";` followed by `process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href` detects "run directly" (including paths with spaces).

## Milestones

1. Implement `findInternalLinks`; run the first two tests with `node --test --test-name-pattern=findInternalLinks smoke-check.test.mjs`.
2. Implement `smokeCheck`; run the full suite. It starts a throwaway local server, so no internet is needed.
3. Add the command-line entry point and run it against your local dev server (lesson 02), then against your public URL.
4. Deliberately break a link on a branch, deploy it (or a preview deploy), and capture the failing output. Fix it, redeploy, and capture the passing output. Record both in `deploy-log.md` with the commit hash of each deploy.
5. Add an `npm run smoke` script and a line to your lesson 09 handoff docs explaining when to run it.

## Acceptance criteria

- [ ] `node --test smoke-check.test.mjs` passes.
- [ ] The CLI exits `1` on any failure and `0` on a clean run (`echo $?`).
- [ ] `deploy-log.md` shows one caught failure and one clean run against the *public* URL, each with a commit hash and timestamp.
- [ ] The handoff docs say how and when to run the check.

## Automated checks (coding courses) / Evidence checklist (non-coding)

Save as `smoke-check.test.mjs` and run `node --test smoke-check.test.mjs`. Verified in this pass: 7 checks are provided; rerun them against your implementation.

```javascript
// Run with: node --test smoke-check.test.mjs   (Node 18+; needs no network)
import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { findInternalLinks, smokeCheck } from "./smoke-check.mjs";

// A tiny fake "deployed site" served from memory on a random local port.
const pages = {
  "/": `<!doctype html><html lang="en"><head><title>Team Roster</title></head><body>
        <h1>Team Roster</h1>
        <a href="/about.html">About</a> <a href="contact.html#form">Contact</a>
        <a href="#roster">Jump</a> <a href="mailto:qa@example.com">Email</a>
        <a href="https://example.org/">External</a></body></html>`,
  "/about.html": "<title>About</title>",
  "/contact.html": "<title>Contact</title>",
  "/broken/": `<title>Team Roster</title><a href="/about.html">About</a> <a href="/missing.html">Missing</a>`,
};
let server, base;
test.before(async () => {
  server = http.createServer((req, res) => {
    const body = pages[req.url];
    res.writeHead(body ? 200 : 404, { "content-type": "text/html" });
    res.end(body ?? "not found");
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(() => server.close());

test("findInternalLinks resolves relative links, drops fragments, skips external and non-http", () => {
  const html = pages["/"];
  assert.deepEqual(findInternalLinks(html, "https://site.test/"), [
    "https://site.test/about.html",
    "https://site.test/contact.html",
  ]);
});

test("findInternalLinks de-duplicates and resolves against a nested page", () => {
  const html = `<a href="a.html">A</a><a href="./a.html#x">A again</a><a href="../up.html">Up</a>`;
  assert.deepEqual(findInternalLinks(html, "https://site.test/docs/index.html"), [
    "https://site.test/docs/a.html",
    "https://site.test/up.html",
  ]);
});

test("a healthy site passes with the expected title and text", async () => {
  const r = await smokeCheck(`${base}/`, { expectTitle: "Team Roster", expectText: ["<h1>Team Roster</h1>"] });
  assert.deepEqual(r.failures, []);
  assert.equal(r.ok, true);
  assert.equal(r.checkedLinks, 2);
});

test("a wrong title is reported with both values", async () => {
  const r = await smokeCheck(`${base}/`, { expectTitle: "Team Roster v2" });
  assert.equal(r.ok, false);
  assert.match(r.failures.join("\n"), /title was "Team Roster", expected "Team Roster v2"/);
});

test("missing expected text is reported", async () => {
  const r = await smokeCheck(`${base}/`, { expectText: ["Release ready", "<h1>Team Roster</h1>"] });
  assert.equal(r.ok, false);
  assert.deepEqual(r.failures, ['page does not contain "Release ready"']);
});

test("a broken internal link is reported with its URL and status", async () => {
  const r = await smokeCheck(`${base}/broken/`, { expectTitle: "Team Roster" });
  assert.equal(r.ok, false);
  assert.deepEqual(r.failures, [`broken link ${base}/missing.html returned 404`]);
});

test("a non-200 home page fails immediately", async () => {
  const r = await smokeCheck(`${base}/nope/`);
  assert.equal(r.ok, false);
  assert.deepEqual(r.failures, [`GET ${base}/nope/ returned 404`]);
});
```

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Link handling | Absolute links only, or external links checked | Relative, nested, fragment and non-http cases handled | Also checks `<img src>` and `<link href>` assets |
| Failure messages | Generic "failed" | Exact, actionable messages with URL and status | Adds response time and flags anything over a threshold |
| Deploy evidence | Run only against localhost | Public URL, two deploys, with commit hashes | Wired into the host's post-deploy hook or a scheduled check |

## Stretch goals

- Crawl one level deeper (links found on linked pages), with a limit so it can't run forever.
- Read expectations from a `smoke.json` file so non-developers can edit them.

## Reflection prompts

- What could still be broken on a site that passes this check? (Think back to lesson 07.)
- Why is it useful that the tool's exit code, not just its printed text, signals failure?

## Instructor notes (common pitfalls, how to adapt for time)

- Pitfalls: forgetting `url.hash = ""` (the same page counted twice); checking external links, which makes the check flaky because of other people's servers; GitHub Pages project sites live under `/<repo>/`, so a root-relative `/about.html` link is a *real* defect that this tool will correctly catch.
- Some hosts return 200 for a custom 404 page; mention it as a known limitation, and check for expected text to catch it.
- Short on time: skip milestone 4's deliberate break and use the test's broken page as the example.
