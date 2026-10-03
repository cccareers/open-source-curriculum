---
course_id: ops200
media_id: ops200-v02
type: video-script
title: "Config Belongs to the Environment: One Build, Every Stage"
format: hybrid
target_runtime: "7 min"
related_lessons:
  - ops200-03
objectives:
  - Automate a repeatable build with a task runner and twelve-factor configuration
competency_ids:
  - D2-S1-C03
  - D5-S1-C01
---

## Purpose

After watching, the learner can move configuration out of code into the environment, write a fail-fast config module, and explain why front-end `VITE_` values are public and fixed at build time.

## Audience and prerequisites

Learners starting lesson 03 who have the lesson 02 single-release server running.

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Talking head, then a code editor showing `const DB = "postgres://admin:hunter2@prod-db:5432/events"` at the top of `server.js`. | "Here's a line that's in more real codebases than anyone admits: a production database password, committed, at the top of a file. Today we'll remove it, and you'll see why the fix also makes your deploys more reliable." |
| 0:25 | Slide: "Could this repo be made public tomorrow?" | "The twelve-factor test for configuration is one question: could this repository be made public tomorrow without leaking or breaking anything? If not, whatever would leak is config, and it belongs in the environment, not the code." |
| 0:55 | Diagram: one `dist/` box with arrows to Local, Staging, Production; each environment box has its own env vars. | "The goal is one build, promoted unchanged through every environment. Only the environment differs. If config were compiled in, you'd need a separate build per environment, and passing tests in staging would tell you nothing about production." |
| 1:30 | Editor: create `api/src/config.js` with `required` and `optional` helpers; type it in full. | "Read every value in one module, once, at startup. required throws with the variable's name if it's missing. optional takes a default. PORT gets converted to a number here, once, because environment variables are always strings." |
| 2:30 | Terminal: `unset SESSION_SECRET; node api/src/server.js` prints `Error: Missing required environment variable: SESSION_SECRET` and exits. | "Watch what happens with a missing secret. The process dies in the first second, naming the variable. That's the good outcome. The bad one is a server that starts happily and crashes on the first login, an hour after the deploy that broke it." |
| 3:05 | Editor: `.env` (gitignored) and `.env.example` (committed) side by side. | "Locally, values live in .env, which is never committed. Beside it, .env.example lists every key with no secret values. It's the setup guide for your next teammate and the checklist for configuring a new environment." |
| 3:35 | Terminal: `git check-ignore -v .env .env.example` output showing `.env` ignored, `.env.example` not. | "Prove the gitignore does what you think. check-ignore shows .env is ignored by the .env line, and .env.example is re-included by the exclamation-mark line. Order matters: a negation only works after the pattern it overrides." |
| 4:05 | Switch to the front end: `VITE_API_BASE_URL` in `.env`; then DevTools → Sources showing the built JS containing the literal URL string. | "The front end is different. Vite inlines VITE_ variables into the bundle at build time. Here's the built file in the browser's dev tools: the value is sitting there as plain text. Anything in a VITE_ variable is public." |
| 4:45 | Slide: "VITE_ = public + fixed at build time." | "Two consequences. It's public, so no secrets. And it's fixed at build time, so you can't point the same dist folder at a different API by changing a server variable." |
| 5:10 | Editor: change `fetch(\`${import.meta.env.VITE_API_BASE_URL}/events\`)` to `fetch("/api/events")`. | "This course's fix is the simplest: the API serves the front end from the same origin, so the front end calls a relative path. There's no host to configure at all." |
| 5:40 | Slide: "Leaked a secret? Rotate it." | "One last rule. If a secret is ever committed and pushed, deleting it in the next commit doesn't help. It's in history. Revoke it, issue a new one, update the environment, and tell your team. Fast and honest beats quiet every time." |
| 6:15 | Recap card. | "Config in the environment. One module, read once, fail fast. .env ignored, .env.example committed. Nothing secret on the front end." |
| 6:40 | End card: lesson 03 practice items 6–10. | "Practice items 6 to 10 walk you through all of this on the events board." |

## On-screen assets and B-roll

- Events-board repository at the end of lesson 02.
- The `hunter2` password is obviously fake; show it only in the opening shot.
- Diagram of one artifact flowing to three environments.

## Accessibility

- Captions plus WebVTT; all typed code read aloud.
- Diagram arrows are labeled with environment names; nothing is conveyed by color alone.
- When showing DevTools, zoom in and read the found string aloud.

## Check for understanding

1. Why does the config module throw at startup instead of returning `undefined`? *Answer: so a missing variable fails the deploy immediately, with its name, instead of failing on first use later.*
2. Can a private API key go in `VITE_PAYMENTS_KEY`? *Answer: no. Vite inlines it into the public JavaScript bundle.*
3. What's the difference between `.env` and `.env.example`? *Answer: `.env` holds real local values and is never committed; `.env.example` lists keys without secrets and is committed as documentation.*
