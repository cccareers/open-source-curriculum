---
lesson_id: ops200-03
course_id: ops200
pathway: software-developer
title: Task Runners and Twelve-Factor Configuration
order: 3
kind: lesson
competency_ids:
  - D2-S1-C03
  - D5-S1-C01
objectives:
  - Automate a repeatable build with a task runner and twelve-factor configuration
---

## One command per job

At the end of the last lesson you could produce an artifact, but only by remembering a sequence: change into `web`, run the build, change into `api`, install without dev dependencies, start the server with the right flags. That sequence lives in your head. It is not documented, it is not testable, and in lesson 04 a machine with no head at all will have to run it.

A **task runner** is the tool that turns those remembered sequences into named commands. There are dedicated ones — Make, Just, Turborepo, Nx — and for a project this size you do not need any of them, because npm already ships one. `npm run` is a task runner, and using it well is the difference between a project a new teammate can build in one command and a project that needs a phone call.

The rule to hold onto: **every routine operation on this repository is one named script, and the names are the same in every project you touch.** A developer joining the team should be able to guess `npm run build` and be right. That predictability is worth more than any clever tooling.

The conventional set is small:

- `install` — handled by npm itself
- `dev` — run locally with live reload
- `build` — produce the artifact
- `start` — run the built artifact the way production runs it
- `test` — run the test suite once and exit
- `lint` — check style and static errors
- `format` — rewrite files to the agreed style

Anything a person does more than twice belongs in that list.

## Composing scripts across the repository

The events board has three `package.json` files: one in `web/`, one in `api/`, and one at the root that ties them together. The root is where a newcomer starts, so the root scripts must cover the whole repository.

The cleanest way to do that is npm **workspaces**. Declare the two packages at the root and npm manages a single `node_modules` and a single lockfile for both:

```json
{
  "name": "events-board",
  "private": true,
  "type": "module",
  "workspaces": ["api", "web"],
  "engines": { "node": ">=20.11.0" },
  "scripts": {
    "dev": "npm-run-all --parallel dev:*",
    "dev:api": "npm run dev --workspace api",
    "dev:web": "npm run dev --workspace web",
    "build": "npm run build --workspace web",
    "start": "npm run start --workspace api",
    "lint": "eslint .",
    "test": "npm run test --workspaces --if-present",
    "verify": "npm-run-all lint test build"
  },
  "devDependencies": {
    "npm-run-all": "^4.1.5"
  }
}
```

Several deliberate choices are in there.

`"private": true` stops you from ever publishing the root package to the npm registry by accident. Every application repository should have it.

`--workspace api` runs a script inside one package from the root, so you never have to change directories. `--workspaces --if-present` runs a script in every package that defines one and quietly skips those that do not, which is what you want for `test` while only one half has tests.

`npm-run-all` gives you two things plain npm scripts lack: `--parallel` for running the API and the front-end dev server at once in a single terminal, and a cross-platform way to chain commands. Plain `&&` works on macOS, Linux, and modern Windows shells, and if your team is all on one platform you can skip the dependency. `concurrently` is the other common choice for the parallel case.

`verify` is the most valuable script in the file. It is the single command that answers "is this repository in a good state" — lint, then test, then build. You run it before pushing. In the next lesson the pipeline runs the same script, which means a green pipeline and a green laptop mean the same thing. When those two diverge, developers stop trusting the pipeline, and a pipeline nobody trusts is worse than none.

Two more npm features are worth knowing.

**Pre and post hooks.** A script named `prebuild` runs automatically before `build`, and `postbuild` after it. Use them sparingly — implicit behavior is hard to debug — but they are the right tool for a mandatory cleanup step:

```json
{
  "scripts": {
    "prebuild": "rm -rf dist",
    "build": "vite build"
  }
}
```

**Argument passing.** Everything after `--` is forwarded to the underlying command:

```bash
npm run test -- --watch
npm run build -- --mode staging
```

## Exit codes are the interface

A script communicates success by its exit code: zero means success, anything else means failure. This is invisible while you are reading terminal output yourself and becomes critical the moment automation is reading instead.

```bash
npm run verify
echo $?
```

If that prints `0`, every step passed. If it prints anything else, something failed and the chain stopped there. `npm-run-all` and `&&` both stop on the first non-zero exit, which is the behavior you want: there is no point building an artifact from code that fails its tests.

The failure mode to watch for is a command that prints an error and exits zero anyway. A test runner invoked incorrectly, a shell pipeline where only the last command's status counts, a script wrapped in something that swallows the result — each produces a pipeline that is green while the code is broken. Whenever you add a step, prove it can fail: break something on purpose, run the script, and check `$?`. A step you have never seen go red is a step you cannot rely on.

## Configuration is everything that changes between environments

The application now builds with one command. The next problem is that the same code has to run in more than one place — your laptop, a staging environment, production — and those places differ. Different ports, different database URLs, different API keys, different log verbosity.

The **twelve-factor** answer is a single rule: *strict separation of config from code, with config supplied by the environment.* Config is anything that varies between deployments. The code is identical everywhere; only the environment differs.

The test for whether something is config: could this repository be made public tomorrow without leaking anything or breaking anything? If a database password is in a committed file, the answer is no, and that value is config.

Notice what this rules out. It rules out a `config/production.js` file selected by an `if` statement, because adding a fourth environment means editing and redeploying code. It rules out a constant at the top of a file that someone edits before deploying, because the artifact you tested is no longer the artifact you shipped. And it directly supports the artifact model from lesson 02: **one build, promoted unchanged through every environment.** If configuration were compiled in, you would need a separate build per environment, and then a passing test in staging would tell you nothing about production.

Locally, environment values live in a `.env` file that is never committed:

```text
PORT=3000
NODE_ENV=development
DATABASE_URL=postgres://localhost:5432/events_dev
SESSION_SECRET=local-development-only-not-a-real-secret
LOG_LEVEL=debug
```

Node reads it with a built-in flag, so you need no library:

```json
{
  "scripts": {
    "dev": "node --env-file=.env --watch src/server.js",
    "start": "node src/server.js"
  }
}
```

Note that `start` has no `--env-file`. In production the platform injects real environment variables into the process directly; there is no file, and there should not be one.

Beside it, committed, sits `.env.example`:

```text
# Copy to .env and fill in. Never commit .env.
PORT=3000
NODE_ENV=development
DATABASE_URL=
SESSION_SECRET=
LOG_LEVEL=debug
```

This file is doing real work. It is the documented list of every variable the application needs, it is the setup instructions for a new teammate, and it is the checklist you use when configuring a new environment. Keys with no secret values; blanks where a real value goes. Every time you add a variable to your `.env`, add the key to `.env.example` in the same commit. A missing entry here is how a deploy fails at 6pm with an error nobody can explain.

## Read config once, and fail fast

Scattering `process.env.WHATEVER` through your codebase makes it impossible to know what the application actually requires, and it defers failure to whenever that line of code first executes — potentially days after deployment.

Read everything in one module, at startup, and refuse to start if something required is missing:

```javascript
// api/src/config.js
import process from "node:process";

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name, fallback) {
  return process.env[name] ?? fallback;
}

export const config = Object.freeze({
  env: optional("NODE_ENV", "development"),
  port: Number(optional("PORT", "3000")),
  databaseUrl: required("DATABASE_URL"),
  sessionSecret: required("SESSION_SECRET"),
  logLevel: optional("LOG_LEVEL", "info"),
});
```

Then import `config` everywhere and `process.env` nowhere else.

Four properties make this worth the twenty lines. It **fails fast**: a missing variable crashes the process on startup, before it accepts a single request, and the message names the variable. It **documents itself**: the module is the complete list of configuration this service has. It **coerces at the boundary**: environment variables are always strings, so `port` becomes a number once, here, rather than being a string that silently breaks a comparison later. And it **centralizes defaults**, so "what happens if `LOG_LEVEL` is unset" has one answer you can read.

Prove the fail-fast behavior once, deliberately: unset `DATABASE_URL` and start the service. A crash with a clear message in the first second of a deploy is a good outcome. A service that starts happily and then throws on the first request that touches a database is a bad one, and the difference is entirely this module.

## Front-end configuration is baked into the artifact

The front end has configuration too — where the API lives, which analytics key to use — and it behaves differently in a way that catches people out.

Vite exposes only variables prefixed with `VITE_`, and it **inlines them into the bundle at build time**:

```text
VITE_API_BASE_URL=http://localhost:3000/api
```

```javascript
const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/events`);
```

Two consequences follow, and both matter.

First, **anything you put in a `VITE_` variable is public.** It is a literal string inside a JavaScript file that anyone can download and read. There is no such thing as a secret in front-end configuration. API keys that must stay private belong on the server, which then proxies the request. The `VITE_` prefix requirement exists precisely so that the rest of your environment — including secrets sitting in the same shell — is never accidentally swept into a browser bundle.

Second, **front-end config is fixed at build time, not run time.** The same `dist/` cannot be pointed at a different API by changing an environment variable on the server, because the value is already compiled in. This is a genuine tension with "build once, deploy everywhere," and there are two honest ways out. The simplest, and the one this course uses, is to make the front end call the API at a relative path — `/api/events` — because the API serves the front end from the same origin, so there is no host to configure at all. The alternative, when the two are genuinely on different hosts, is to serve the runtime values from an endpoint the front end fetches at startup. Choose the relative path when you can.

## The source-control workflow that keeps it honest

Everything above depends on one thing: `.env` never being committed. That is not a technical guarantee, it is a workflow guarantee, and following the team's source-control practice is what supplies it.

Start with `.gitignore`, which is committed and applies to everyone:

```text
node_modules/
dist/
.env
.env.*
!.env.example
*.log
.DS_Store
```

Read the last three lines carefully. `.env.*` catches `.env.local` and `.env.production`. The `!` line re-includes `.env.example`, because that one must be tracked. Order matters — a negation only works after the pattern that excluded the file.

Then the workflow itself. Conventions vary between teams, and part of this competency is finding out which convention applies rather than importing habits from your last project. Ask on day one: what do we branch from, how do we name branches, do we merge or rebase, who reviews, what does a commit message look like. What follows is the common trunk-based shape you will meet most often.

**Branch from `main` for every change.**

```bash
git checkout main
git pull --ff-only
git checkout -b feat/env-driven-config
```

`--ff-only` refuses to create a surprise merge commit when your local `main` has drifted; it fails loudly instead, which is what you want.

**Keep the branch short-lived and the commits small.** A branch open for a week is a merge conflict growing in the dark. One coherent change, reviewed and merged within a day or two, is the target.

**Write commit messages someone can act on.** Many teams use Conventional Commits, where the prefix carries meaning that tooling can read:

```text
feat(api): read configuration from the environment at startup

Adds src/config.js, which validates required variables and coerces PORT
to a number. Every module now imports config instead of touching
process.env directly.

The service intentionally crashes on startup when DATABASE_URL or
SESSION_SECRET is missing, rather than failing on first use.

Refs: EB-142
```

Subject line in the imperative under about seventy characters, blank line, body explaining *why*, and a reference to the tracking issue. The subject says what changed; the body says what a reviewer or a future debugger needs. Lesson 05 builds directly on these messages when it comes to release notes.

**Review your own diff before you commit.** `git diff --staged` before every commit takes ten seconds and catches the debug logging, the commented-out block, and the stray credential.

```bash
git status --short
git diff --staged
```

**Never commit a secret, and if you do, rotate it.** This is the part people get wrong. Removing a secret in a follow-up commit does not help: it is still in the history, and if the branch was pushed it is on a server you do not control. The only correct response is to treat the value as compromised — revoke it, issue a new one, update the environment — and then, separately, clean the history if your team requires it. Say so immediately; a quietly leaked key is far more expensive than an embarrassing message in a channel.

**Push and open a pull request.** The pull request is where the pipeline from lesson 04 attaches, where a reviewer reads your diff, and where the record of the change begins.

```bash
git push -u origin feat/env-driven-config
```

**Leave `main` releasable at all times.** On a trunk-based team, `main` is what deploys. Anything merged into it is a candidate for production within the hour, which is why the branch is protected: no direct pushes, review required, checks must pass. Those rules are not bureaucracy, they are the reason the pipeline is allowed to deploy automatically.

The connection between the two halves of this lesson is worth stating outright. Twelve-factor configuration is what makes the repository safe to share, and the source-control workflow is what keeps it that way. `.env.example` exists because the repository is public to your team; `.gitignore` and diff review exist because a repository is forever. Configure through the environment, and the version-control practice you follow costs you nothing. Configure through committed files, and every review becomes a search for the thing that must not ship.

## Practice

Turn the events board into a repository that a new teammate can set up and build with two commands.

1. Create the root `package.json` with `"private": true`, workspaces for `api` and `web`, and an `engines.node` matching your `.nvmrc`. Run `npm install` from the root and confirm a single lockfile now covers both packages.
2. Add root scripts for `dev`, `build`, `start`, `lint`, `test`, and `verify`. Run each one from a clean clone and fix anything that only works because of state on your machine.
3. Make `dev` start both the API and the front-end dev server in one terminal. Confirm that stopping it stops both.
4. Run `npm run verify`, then `echo $?`. Deliberately introduce a lint error, run it again, and record both exit codes in a `NOTES.md`. Explain in one sentence why the build did not run the second time.
5. Add a `prebuild` script that removes `web/dist`, then prove it ran by creating a junk file in `dist` and rebuilding.
6. Write `api/src/config.js` exactly as described: `required` and `optional` helpers, numeric coercion for `PORT`, and a frozen exported object. Replace every other use of `process.env` in the API with an import from it.
7. Create a local `.env` and a committed `.env.example`. Confirm with `git status --short` that one is tracked and the other is not.
8. Unset a required variable and start the service. Paste the exact error into `NOTES.md` and note how many milliseconds of uptime the process had.
9. Update `.gitignore` to ignore `.env` and `.env.*` while keeping `.env.example`. Prove the negation works by running `git check-ignore -v .env .env.example` and recording the output.
10. Change the front end to fetch `/api/events` as a relative path rather than reading a `VITE_` variable for the host. Rebuild and confirm the app still works when served by the API. Then write two sentences on why an API key could not have been supplied through a `VITE_` variable.
11. Do the whole change on a branch: branch from an up-to-date `main`, commit in at least three small commits with Conventional Commit subjects and a body on the largest one, review `git diff --staged` before each, and open a pull request describing what changed and why.
12. From the pull request diff alone, check that no `.env`, no `dist/`, and no secret value appears. Write down what you looked for.

**Deliverable:** a pull request containing the root task-runner scripts, the config module, `.env.example`, and the updated `.gitignore`, plus a `NOTES.md` holding your exit-code experiment, the fail-fast error message, and your `git check-ignore` output.
