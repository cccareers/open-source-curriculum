---
course_id: ops200
title: "Building and Deploying Apps — Enhancement Review"
reviewed_lessons: 6
status: draft
---

## Summary

ops200 is a coherent, practical course. One application (the events board: a Vite front end plus an Express API shipped as one release) carries from build artifact to monitored production, and each lesson's practice is concrete and testable. The serious problems were code that wouldn't work as written: an Express 5-incompatible catch-all route that crashes the server at startup, and a build-identity mechanism that can never reach the running API, so `/health` would report `dev` forever. Both are fixed in place. Smaller issues: a concurrency setting that can cancel deploys, a CI accessibility job that would crash on the course's own fail-fast config, and some setup steps that were missing.

## Clarity issues

| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| ops200-02 | "The API's artifact, and shipping one release" | **Bug:** `app.get("*", ...)` throws `Missing parameter name at index 1: *` at startup on Express 5, which `npm install express` now installs (verified on 5.2.1) | Changed to `app.get(/.*/, ...)`, which works on 4 and 5, with an explanation | Applied |
| ops200-02 | Same | `events` is undefined in the snippet | Added a comment saying where it comes from | Applied |
| ops200-02 | "Making a build reproducible" | The `.nvmrc` contents block wasn't labeled as a file | Labeled | Applied |
| ops200-02 | "What a production build actually produces" | Sample output says `vite v5.4.0`; learners on newer Vite see different text and hashes | Added "your version, hashes, and sizes will differ" | Applied |
| ops200-03 | "Composing scripts across the repository" | `lint` runs `eslint`, which is never installed, so the pipeline fails on a clean machine. `npm-run-all` is unmaintained | Added an install step for ESLint and a note on the `npm-run-all2` fork | Applied |
| ops200-03 | Pre and post hooks | `rm -rf dist` doesn't run in Windows `cmd` | Added a cross-platform alternative | Applied |
| ops200-03 | "The source-control workflow that keeps it honest" | "Read the last three lines" points at the wrong lines (`*.log`, `.DS_Store`) | Changed to "the three `.env` lines" | Applied |
| ops200-04 | "Anatomy of a workflow file" | Unconditional `cancel-in-progress: true` can cancel a deploy on `main` once the workflow deploys | Added a note and the pull-request-only pattern | Applied |
| ops200-04 | Practice item 3 | Asks learners to see test and build steps skipped, but item 1's single `verify` step has no separate steps | Reworded to read inside the `verify` log | Applied |
| ops200-04 | Practice item 10 | "Your locally reachable health endpoint replaced by a public placeholder" is confusing, since runners can't reach your laptop | Gave concrete public 200 and 404 URLs | Applied |
| ops200-05 | "Making the running system say what it is" | **Bug:** sets `APP_VERSION`/`GIT_SHA` as env vars on the build step, but the API isn't bundled, so they never reach the deployed process. `github.ref_name` is `main` on branch pushes, and `repository.updated_at` isn't a build time | Replaced with a pipeline step that writes `build-info.json` into the artifact, plus a `build-info.js` reader. Verified locally | Applied |
| ops200-05 | Practice item 7 | Moving the changelog after tagging contradicts "Cutting the release" | Item 7 now says to do it before `npm version` | Applied |
| ops200-06 | "Logs you can actually search" | Logger read `APP_VERSION`/`GIT_SHA` from env, with the same problem as lesson 05 | Switched to `buildInfo` | Applied |
| ops200-06 | "Errors: what is failing, and how often" | Doesn't mention that Node 15+ already exits on unhandled rejections, or `uncaughtException` | Added both | Applied |
| ops200-06 | "Monitoring accessibility and compliance" | The CI job runs `npm start`, but lesson 03's config refuses to start without `DATABASE_URL`/`SESSION_SECRET`, so the job crashes. The `lighthouserc.json` filename isn't stated | Added the `env:` block, a test-DB note, and the filename | Applied |
| ops200-06 | Same | "Automated scanning finds roughly a third" is stated as fact, but published estimates range from about a third to just over half depending on method | Rewritten as a range with the reason it varies | Applied |

## Depth and coverage gaps

- **No self-checks** in lessons 02–06 (all objectives). Added "Check your understanding" with answers.
- **Produce the build artifacts and assets a website deploys:** there's no test that the single-release server serves assets and fallbacks correctly, and cache headers are explained but never checked. Project ops200-x01 tests this.
- **Automate a repeatable build with a task runner and twelve-factor configuration:** the fail-fast config is demonstrated by hand only. ops200-x01 tests it automatically.
- **Explain what each stage of a CI/CD pipeline guarantees:** the guarantees are stated in prose, and nothing stops a later edit from removing one. Project ops200-x02 turns each guarantee into a test on the workflow file.
- **Explain what each stage of a CI/CD pipeline guarantees:** action pinning (tag vs. full SHA) and supply-chain risk aren't discussed. Offered as an ops200-x02 stretch goal rather than new lesson content.
- **Document a release so its changes can be traced:** no example of automating changelog or release-note drafts from Conventional Commits. Worth a short aside; out of scope for this pass.
- **Monitor a deployed application and report what it reveals:** log-based p50/p95 calculation (practice item 4) has no worked example. A short `jq` or Node snippet would help learners who've never computed a percentile.

## Proposed additional projects

- **ops200-x01 Ship the Events Board as One Traceable Release** (drafted): fail-fast config, build identity, route order, and cache headers. Six `node:test` tests start the real server; verified against a reference, and the suite fails completely on the Express 5 `"*"` bug.
- **ops200-x02 Pipeline Guarantees as Tests** (drafted): policy tests that read `ci.yml` and fail when a guarantee is removed. Verified against a reference workflow and three mutations.
- Not drafted: **Rollback drill**: deploy v1.4.2 → v1.4.3 → roll back on a free-tier platform, timing each step and filling in the release record.
- Not drafted: **Percentiles from logs**: a small CLI that reads JSON log lines and prints count, error rate, p50, and p95 per route, with tests on fixed fixtures.

## Video and animation opportunities

- **Reading a red build: first failure, not last** (ops200-04): screencast. Drafted as `media/video-01-reading-a-red-build.md`.
- **Config belongs to the environment** (ops200-03): hybrid. Drafted as `media/video-02-config-belongs-to-the-environment.md`.
- **One artifact through the pipeline** (ops200-04/05): explainer animation of guarantees accumulating and the same bytes deployed. Drafted as `media/animation-01-one-artifact-through-the-pipeline.md`.
- Not drafted: **Content hashing and caching** (ops200-02): animation of a browser cache holding `index-abc.js` and requesting `index-def.js` after a deploy, while a stale `index.html` breaks.
- Not drafted: **Percentiles vs. averages** (ops200-06): animation of 100 request bars, showing the mean hiding a slow tail.
- Not drafted: **Writing the P2 report** (ops200-06): talking-head walkthrough of the eight-part report.

## Assessment ideas

- "Which stage catches it?" cards: twelve failures (missing dependency, lockfile drift, flaky test, 404 after deploy, and so on). Learners name the stage that catches each, or say none does.
- Release record review: give learners a record with three defects (a check with no build named, a deferred defect with no owner, no rollback). They write the review comments.
- Report triage: three incident reports of different quality. Learners rank them and rewrite the weakest using the eight-part structure.
- Config audit: a repository snapshot with five config smells. Learners find all five.

## Changes applied in this pass

- `02-build-artifacts-and-asset-pipelines.md`, "What a production build actually produces": noted that version, hashes, and sizes will differ.
- `02-build-artifacts-and-asset-pipelines.md`, "Making a build reproducible": labeled the `.nvmrc` block.
- `02-build-artifacts-and-asset-pipelines.md`, "The API's artifact, and shipping one release": Express 4- and 5-compatible catch-all with an explanation; comment on `events`.
- `02-build-artifacts-and-asset-pipelines.md`: added "Check your understanding."
- `03-task-runners-and-twelve-factor-configuration.md`, "Composing scripts across the repository": install ESLint; `npm-run-all2` note.
- `03-task-runners-and-twelve-factor-configuration.md`, pre and post hooks: cross-platform delete note.
- `03-task-runners-and-twelve-factor-configuration.md`, "The source-control workflow that keeps it honest": fixed the reference to the `.env` lines.
- `03-task-runners-and-twelve-factor-configuration.md`: added "Check your understanding."
- `04-ci-cd-pipelines.md`, "Anatomy of a workflow file": warning about cancelling deploys, plus the pull-request-only cancel pattern.
- `04-ci-cd-pipelines.md`, "Practice": clarified items 3 and 10.
- `04-ci-cd-pipelines.md`: added "Check your understanding."
- `05-deploying-and-documenting-a-release.md`, "Making the running system say what it is": replaced env-var build identity with `build-info.json` plus `build-info.js`.
- `05-deploying-and-documenting-a-release.md`, "Practice": item 7 ordering clarified.
- `05-deploying-and-documenting-a-release.md`: added "Check your understanding."
- `06-monitoring-a-deployed-application.md`, "Errors: what is failing, and how often": Node 15+ default and `uncaughtException`.
- `06-monitoring-a-deployed-application.md`, "Logs you can actually search": logger uses `buildInfo`.
- `06-monitoring-a-deployed-application.md`, "Monitoring accessibility and compliance": CI `env:` block, `lighthouserc.json` filename, and a corrected automated-coverage claim.
- `06-monitoring-a-deployed-application.md`: added "Check your understanding."

## Open questions for the course owner

- **Action versions.** Lessons use `actions/checkout@v4`, `setup-node@v4`, and `upload-artifact`/`download-artifact@v4`. Newer major versions of some of these may exist by now. I haven't verified the current tags, so check before publishing and decide whether to pin to SHAs.
- **Express version.** Pin Express 4 or 5 across node101, node200, and ops200. The ops200 fix works on both, but other snippets in the pathway may not.
- **Vite version.** The sample output shows Vite 5. Decide whether to refresh it to the current major or state the pinned version.
- The `platform-cli deploy` command is a placeholder. Name a real free-tier platform (and its health-check behavior) so practice items 9–12 in lesson 04 and the lesson 05 rollback rehearsal can be done for real.
- Lessons reference `./img/build-artifact-anatomy.png`, `./img/pipeline-stages.png`, and `./img/release-traceability-chain.png`; no `img/` folder exists in `ops200/lessons/`.
- Lesson 02 says assets under 4 kB are inlined; that matches Vite's default `assetsInlineLimit` (4096 bytes) as of Vite 5. Re-check if you upgrade.
