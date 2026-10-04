---
course_id: ops200
media_id: ops200-v01
type: video-script
title: "Reading a Red Build: First Failure, Not Last"
format: screencast
target_runtime: "6 min"
related_lessons:
  - ops200-04
objectives:
  - Explain what each stage of a CI/CD pipeline guarantees
competency_ids:
  - D6-S1-C03
---

## Purpose

After watching, the learner can open a failed GitHub Actions run, find the first failing step, classify the failure (code, environment, or unrelated), and reproduce it locally the pipeline's way.

## Audience and prerequisites

Learners in lesson 04 who have pushed their first `ci.yml` to the events board repository.

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Pull request page with a red "CI / build (pull_request) Failing" check. | "Your pull request is red. The tempting move is to click 'Re-run jobs' and hope. Don't. A red build is information, and in five minutes you'll be able to read it." |
| 0:20 | Click "Details". The run summary shows jobs: lint ✓, test ✓, build ✗, deploy skipped. | "Open the run. Lint passed, test passed, build failed, and deploy was skipped because it needs build. Skipped isn't a second failure. It's a consequence of the first. Always look for the first red, not the last." |
| 0:50 | Expand the build job. Steps: Check out ✓, Set up Node ✓, Install ✓, Build ✗, Upload skipped. | "Inside the job, same rule. Install passed. Build failed. Expand that step." |
| 1:10 | Step log, scrolled to the top. Highlighted: `[vite]: Rollup failed to resolve import "date-fns" from "src/components/EventCard.jsx".` | "Read from the top of the step, not the bottom. The bottom says 'Process completed with exit code 1', which tells you nothing. The top tells you Rollup couldn't resolve the date-fns import in EventCard." |
| 1:40 | Lower third with three boxes: "Code broken?", "Environment differs?", "Unrelated (network, flaky)?". | "Now classify it. Is the code broken? Does the pipeline's environment differ from yours? Or is it unrelated, like a network timeout? This build worked on my laptop, which points at environment." |
| 2:05 | Terminal: `grep date-fns web/package.json` returns nothing. `ls web/node_modules/date-fns` shows the folder. | "date-fns isn't in package.json, but it's in my node_modules. I installed it weeks ago with a command that didn't save it. My laptop carries state; the pipeline machine has never seen this project before." |
| 2:40 | Terminal: `rm -rf node_modules web/node_modules && npm ci && npm run verify` and the same Rollup error appears. | "Reproduce it the pipeline's way: delete node_modules, npm ci, npm run verify. Same error, locally. Now the pipeline and my laptop agree, so I can fix it with confidence." |
| 3:10 | `npm install date-fns --workspace web`, `git diff` showing package.json and package-lock.json changed. | "Install it properly into the web workspace. The diff shows both package.json and the lockfile changed. That pair is the fix." |
| 3:35 | Commit, push; the run goes green. | "Push. Green. Notice what the pipeline guaranteed: that the source builds on a clean machine. My laptop could never have told me that." |
| 4:00 | Second example: a test job failing with `ETIMEDOUT registry.npmjs.org` during install. | "One more, quickly. This run failed in Install with a timeout reaching the npm registry. Nothing in the diff touches dependencies. That's the 'unrelated' box. Re-running is reasonable here, and if it keeps happening, open an issue." |
| 4:35 | Slide: "Never fix red by disabling the check." Show a crossed-out `continue-on-error: true` and a skipped test. | "What you never do is make it green by switching off the check: adding continue-on-error, skipping the test, deleting the lint rule. That removes a guarantee for everyone, forever, to save you ten minutes." |
| 5:05 | Recap card with four steps. | "First failing job. First failing step. Read from the top. Classify it, then reproduce locally with npm ci. If you're stuck after that, ask; a red build blocking your merge is exactly what your team expects you to raise." |
| 5:40 | End card: lesson 04 practice items 3–5. | "Practice items 3 to 5 make you cause three of these failures on purpose. Do them, and read each one this way." |

## On-screen assets and B-roll

- A fork of the events-board repository with a branch that imports `date-fns` without declaring it.
- Run pages recorded on GitHub; UI labels may change, so narrate concepts (job, step, log) rather than exact button text.
- Callout boxes for the three failure classes.

## Accessibility

- Captions plus WebVTT. Read aloud every log line that's highlighted.
- Pass and fail states are spoken and shown with GitHub's text labels (✓/✗ plus words), not color alone.
- Zoom the browser to 150% so log text is legible.

## Check for understanding

1. A run shows lint ✓, test ✗, build skipped, deploy skipped. How many problems do you have? *Answer: one. Build and deploy were skipped because they depend on test.*
2. Your build passes locally and fails in CI with "cannot resolve import". What's the first thing to check? *Answer: whether the package is declared in `package.json` and the lockfile. It's probably installed only on your machine.*
3. When is re-running a failed job reasonable? *Answer: when the failure is unrelated to the change, such as a network timeout. Investigate if it repeats.*
