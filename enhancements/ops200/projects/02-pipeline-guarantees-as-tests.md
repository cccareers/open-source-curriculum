---
course_id: ops200
project_id: ops200-x02
title: "Pipeline Guarantees as Tests"
kind: supplementary-project
status: draft
hours_estimate: 4
difficulty: core
related_lessons:
  - ops200-04
objectives:
  - Explain what each stage of a CI/CD pipeline guarantees
competency_ids:
  - D6-S1-C03
---

## Scenario

Three weeks after the events board pipeline went live, a teammate "temporarily" swapped `npm ci` for `npm install` to get past a lockfile error, and someone else pasted a deploy token straight into a `run:` line while debugging. Neither change was caught in review, because nobody reads YAML carefully. Your lead's request: "If lesson 04 says each stage guarantees something, prove it. Write tests that fail when a guarantee is removed from the workflow file, and run them in the pipeline itself."

## What you will build / produce

- A `.github/workflows/ci.yml` with parallel lint and test jobs, a build job that uploads a SHA-named artifact, and a gated deploy job with a smoke test (lesson 04).
- `test/pipeline-policy.test.js` (provided) passing, and running as part of `npm test` so the pipeline checks itself.
- `GUARANTEES.md`: a table with one row per test, listing the guarantee it protects, the lesson 04 stage it belongs to, and the incident it would have prevented.

## Before you start (prerequisites, starter files or data)

- Your events-board repository with the lesson 04 workflow.
- Install the YAML parser as a dev dependency at the root: `npm install --save-dev yaml`.
- `"test": "node --test"` (or your existing test command, as long as it picks up `test/*.test.js`).

## Milestones

1. **Run the provided tests against your current workflow** and record which fail. Most learners fail two or three on the first run, usually the timeout, concurrency, or secrets tests.
2. **Fix the workflow, not the tests.** For each failure, change `ci.yml` and write one sentence in `GUARANTEES.md` on what was missing.
3. **Prove every test can fail.** For each test, make the smallest edit to `ci.yml` that breaks it, run the suite, and record the failure message. Restore the file. (Lesson 03: "a step you have never seen go red is a step you cannot rely on.")
4. **Add one test of your own** for a guarantee the suite doesn't cover yet, for example "the build job `needs` both lint and test", or "no job uses `pull_request_target`".
5. **Push it.** Confirm the pipeline runs the policy tests, then open a pull request that removes `timeout-minutes` from one job and screenshot the red check.

## Acceptance criteria

- [ ] All provided tests pass, plus at least one test you wrote.
- [ ] `GUARANTEES.md` has a row per test, with the guarantee, the stage, and an example incident.
- [ ] Evidence (pasted output) that each test was seen failing at least once.
- [ ] The policy tests run inside the pipeline, and a deliberately broken workflow makes the pull request red.

## Automated checks (coding courses)

Save as `test/pipeline-policy.test.js`:

```javascript
// test/pipeline-policy.test.js — acceptance tests for ops200-x02 (Pipeline Guarantees as Tests)
// Reads .github/workflows/ci.yml and checks that each guarantee from lesson 04 is actually encoded.
// Run from the repository root: node --test
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parse } from "yaml";

const wf = parse(readFileSync(".github/workflows/ci.yml", "utf8"));
const jobs = Object.entries(wf.jobs ?? {});
const allSteps = jobs.flatMap(([, job]) => job.steps ?? []);
const runText = (job) => (job.steps ?? []).map((s) => s.run ?? "").join("\n");
const findJob = (pred) => jobs.find(([, job]) => pred(job));
const asList = (v) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);

test("runs on pull requests and on pushes to main", () => {
  assert.ok(wf.on && "pull_request" in wf.on, "missing pull_request trigger");
  assert.ok(asList(wf.on.push?.branches).includes("main"), "missing push trigger for main");
});

test("installs from the lockfile with npm ci, never npm install", () => {
  const scripts = jobs.map(([, job]) => runText(job)).join("\n");
  assert.match(scripts, /\bnpm ci\b/, "no npm ci step found");
  assert.doesNotMatch(scripts, /\bnpm (install|i)\b(?!\S)/, "npm install found in the pipeline");
});

test("every setup-node step reads the version from .nvmrc", () => {
  const setups = allSteps.filter((s) => String(s.uses ?? "").startsWith("actions/setup-node"));
  assert.ok(setups.length > 0, "no setup-node step");
  for (const s of setups) assert.equal(s.with?.["node-version-file"], ".nvmrc");
});

test("every job has a timeout", () => {
  for (const [name, job] of jobs) assert.ok(job["timeout-minutes"] > 0, `job ${name} has no timeout-minutes`);
});

test("the artifact is uploaded with the commit SHA in its name", () => {
  const upload = allSteps.find((s) => String(s.uses ?? "").startsWith("actions/upload-artifact"));
  assert.ok(upload, "no upload-artifact step");
  assert.match(String(upload.with?.name), /\$\{\{\s*github\.sha\s*\}\}/);
});

test("deploy depends on build, is gated to pushes on main, and uses the artifact rather than rebuilding", () => {
  const found = findJob((job) => job.environment === "production" || job.environment?.name === "production");
  assert.ok(found, "no job attached to the production environment");
  const [name, deploy] = found;
  assert.ok(asList(deploy.needs).length > 0, `${name} must declare needs:`);
  assert.match(String(deploy.if), /refs\/heads\/main/, `${name} must be gated to main`);
  assert.match(String(deploy.if), /push/, `${name} must only run on push events`);
  assert.ok((deploy.steps ?? []).some((s) => String(s.uses ?? "").startsWith("actions/download-artifact")), `${name} must download the artifact`);
  assert.doesNotMatch(runText(deploy), /npm run build/, `${name} must not rebuild`);
});

test("secrets reach commands through env:, never interpolated into run:", () => {
  for (const s of allSteps) {
    assert.doesNotMatch(s.run ?? "", /\$\{\{\s*secrets\./, `step "${s.name ?? s.run}" puts a secret straight into a command`);
  }
});

test("deploy ends with a smoke test that fails on HTTP errors", () => {
  const [, deploy] = findJob((job) => job.environment === "production" || job.environment?.name === "production");
  assert.match(runText(deploy), /curl[^\n]*(--fail\b|-f\b)/, "deploy needs a curl --fail smoke test");
});

test("runs on main are never cancelled mid-deploy", () => {
  const cancel = wf.concurrency?.["cancel-in-progress"];
  assert.notEqual(cancel, true, "unconditional cancel-in-progress can kill a deploy on main; cancel only pull_request runs");
});
```

```bash
npm install --save-dev yaml
npm test
```

These tests read the workflow as data; they don't run it. They check that the file *encodes* each guarantee, which is exactly what a reviewer skimming YAML misses. They can't tell you the steps work, which is why the pipeline itself still has to run.

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Workflow | Some provided tests still fail | All provided tests pass | Pipeline time and per-job timings recorded before and after changes |
| Proving failure | Tests only seen passing | Each test shown failing with a minimal edit | Explains a case where a test could pass while the guarantee is still broken |
| Own test | None | One meaningful new test | New test catches a real risk spotted in your own workflow history |
| Explanation | List of test names | `GUARANTEES.md` maps tests to stages and incidents | A teammate who didn't take ops200 can explain the pipeline's guarantees from the doc alone |

## Stretch goals

- Check that every third-party action is pinned to a full commit SHA rather than a tag, and write a paragraph on the trade-off (supply-chain safety vs. update effort).
- Add a scheduled nightly workflow for `npm audit --audit-level=high` (lesson 06) and a test that it exists.

## Reflection prompts

- Which guarantee from lesson 04 can't be expressed as a test on the YAML file at all? How would you protect it?
- The secrets test bans `${{ secrets.X }}` in `run:`. Why is passing it through `env:` safer, even though GitHub masks secret values in logs?
- Is a policy test a substitute for branch protection? Why not?

## Instructor notes (common pitfalls, how to adapt for time)

- The concurrency test expects `cancel-in-progress` to be conditional (for example `${{ github.event_name == 'pull_request' }}`) or absent. Lesson 04's first example uses an unconditional `true`, which is fine until the workflow deploys. This pass added a note about it to lesson 04.
- Learners sometimes satisfy the `npm ci` test by renaming steps. The test reads `run:` text, not names, so that won't work, and seeing why is useful.
- The suite was verified against a reference workflow, plus mutations that inline a secret, set unconditional cancel, and use `npm install`; each produced the expected failure.
- Shorter session (2 hours): milestones 1–3 only.
