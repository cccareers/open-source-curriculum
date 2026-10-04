---
lesson_id: node101-02
course_id: node101
pathway: software-developer
title: The Node Runtime and npm
order: 2
kind: lesson
competency_ids:
  - D2-S1-C03
objectives:
  - Set up a Node and Express project with the tooling a server needs
---

## What the Node runtime actually is

You have been running JavaScript in a browser. The browser is a *host*: it owns a JavaScript engine, and around that engine it wraps a pile of things the engine itself knows nothing about — a document tree, a window, click events, `localStorage`, a rendering pipeline. When you write `document.querySelector`, none of that comes from JavaScript the language. It comes from the host.

Node is a different host for the same engine. It takes V8, the engine Chrome uses, and wraps it in a completely different set of capabilities: reading and writing files, opening network sockets, spawning other programs, reading environment variables, listening for incoming HTTP connections. There is no document, no window, no DOM, no `alert`. If you type `document.title` into Node you get a `ReferenceError`, and that error is not a bug — the object was never there to begin with.

This is the single most useful mental model to carry into the rest of the course: **the language is the same, the surroundings are not.** Your `map`, `filter`, `async`/`await`, template literals, destructuring, classes, and `try`/`catch` all behave exactly as they do in the browser. What changes is what you can reach for. Instead of `window` you have `globalThis` and `process`. Instead of the DOM you have modules like `node:fs` (files), `node:path` (path manipulation), `node:os` (machine information), and `node:http` (the network server Express is built on top of). Those built-in modules are Node's standard library, and they ship with the runtime — you do not install them.

A second difference matters even more for a server, and it catches almost everyone the first time. In the browser, your code runs once per person, on their machine, in their tab. Their variables are theirs. On a server, one Node process handles requests from *everybody*. A variable you declare at the top of a module is shared across every request that process serves. That is exactly what makes an in-memory array a workable store for the events board you are about to build — every visitor sees the same list, because there is only one list. It is also why a variable named something like `currentUser` at module scope is a serious bug: the second visitor overwrites the first.

The third difference is how Node handles waiting. A server spends most of its life waiting — on disk, on the network, on another service. Node does not use a thread per request. It runs your JavaScript on a single thread and hands slow work off to the operating system, then picks up the results later through callbacks, promises, and `async`/`await`. The practical consequence is that **any long synchronous loop you write blocks every other request in the process**. A tight `while` loop that runs for two seconds is not slow for one visitor; it is two seconds of total deafness for all of them. You will not hit this in this course, but knowing the shape of it now explains why so much of the Node ecosystem is asynchronous.

Finally, Node is versioned software with a real release cadence, and the version you run determines which language and runtime features exist. Top-level `await`, the built-in `fetch`, and the `node --watch` flag you will use later in this course all arrived in specific versions. "It works on my machine" is very often "my machine has a newer Node than yours." That is why the next section is about pinning a version rather than just installing one.

## Installing Node and pinning a version

Node publishes two tracks. Even-numbered releases (20, 22, 24) become **LTS** — long term support — and get bug and security fixes for years. Odd-numbered releases are short-lived proving grounds for new features. For anything you intend to hand to another person, run an LTS version. For this course, any current LTS is fine, and everything shown here assumes Node 20 or newer. Check the release schedule on nodejs.org before you pick: Node 20 reached end-of-life in April 2026, which means it no longer gets security fixes, so choose 22 or 24 for new work. Pinning an end-of-life line is pinning a version nobody will patch.

You can install Node from the installer on nodejs.org, and that works. It is not what most working developers do, because it gives you exactly one Node on the whole machine. The moment you have two projects that need different versions — and you will, faster than you expect — a single global install becomes a problem you have to solve by uninstalling and reinstalling. Use a version manager instead. `nvm`, `fnm`, `Volta`, and `mise` all do the same core job: keep several Node versions side by side and switch between them per project.

With `nvm` the flow looks like this:

```bash
nvm install --lts
nvm use --lts
node -v
npm -v
```

`node -v` prints something like `v22.11.0`. `npm -v` prints the version of npm, which ships bundled with Node — you do not install npm separately.

Installing a version is half the job. **Pinning** it is the other half, and it is the part beginners skip. Pinning means recording, in the repository, which Node version this project expects, so that a teammate, a grader, or a deployment host does not silently run something else. There are two records worth writing, and they do different things.

The first is a `.nvmrc` file at the project root containing nothing but the version:

```text
22
```

Anyone with `nvm` can then run `nvm use` in the project directory and land on the right version. `fnm` and `mise` read the same file. It is a convenience for humans, and it is not enforced.

The second is the `engines` field in `package.json`:

```json
{
  "engines": {
    "node": ">=20.11.0"
  }
}
```

This one travels with the package. npm warns when the running Node does not satisfy it, and — more importantly — most managed hosting platforms read `engines` to decide which Node to install for you when they build your app. If you have ever seen a project work locally and crash on deploy with a syntax error on a perfectly valid line, this field is usually the missing piece: the host was running a Node several major versions older than yours.

What breaks when you skip pinning is rarely dramatic and always annoying. A feature you rely on is missing on the other machine. A dependency refuses to install because it declares an `engines` range yours does not satisfy. A build that has passed for months fails the week the host bumps its default. All of it is preventable by writing the version down once.

## Initializing the events board project

Everything in this course is built on one running example: a small **community events board**. It lists events, lets you look one up, and eventually serves both a web page and a JSON feed. There is no database anywhere in this course — the events live in an in-memory array, which means they reset every time the process restarts. That is a deliberate limitation, and persistence is the subject of a later course. Right now the goal is a project skeleton that runs.

Start it:

```bash
mkdir events-board
cd events-board
git init
npm init -y
```

`npm init` creates `package.json`, the file that makes a directory a *package* rather than a loose pile of scripts. The `-y` flag accepts every default instead of asking you questions; you are going to edit the answers anyway. Open what it wrote and edit it into this:

```json
{
  "name": "events-board",
  "version": "0.1.0",
  "description": "A small community events board served with Express.",
  "private": true,
  "type": "module",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js"
  },
  "engines": {
    "node": ">=20.11.0"
  },
  "license": "UNLICENSED"
}
```

Field by field, because each one is doing a job:

- **`name`** and **`version`** are what npm would publish under. They must be present. `version` follows semver, which the next section covers; starting at `0.1.0` signals "not stable yet," which is honest.
- **`private: true`** tells npm to refuse to publish this package to the public registry. For an application — as opposed to a library you want other people to install — this is the correct setting, and it prevents an accidental `npm publish` from putting your code on the internet.
- **`description`** is free text. Write a real one; it is the first thing a reviewer reads.
- **`main`** names the entry point. For an application it is mostly documentation, since you start the app through a script, but keep it accurate.
- **`scripts`** are named commands, covered below.
- **`engines`** is the version pin from the previous section.
- **`license`** matters more than it looks. `UNLICENSED` on a private project is a clear statement that nobody has permission to reuse it. Leaving the `npm init` default of `ISC` on work you do not intend to give away is sloppy.

Now the field that changes how every file in the project is read: `"type": "module"`.

Node has two module systems. **CommonJS** is the original one, and it looks like this:

```javascript
// CommonJS
const express = require("express");

function listEvents() {
  return [];
}

module.exports = { listEvents };
```

**ES modules** (ESM) are the standard JavaScript module system, the same one you have used in the browser:

```javascript
// ES modules
import express from "express";

export function listEvents() {
  return [];
}
```

Node decides which system a `.js` file uses by looking at the nearest `package.json`. With `"type": "module"`, `.js` files are ES modules. Without it (or with `"type": "commonjs"`), they are CommonJS. You can always override per file with an explicit extension: `.mjs` is always an ES module, `.cjs` is always CommonJS.

**This course uses ESM.** Set `"type": "module"` and leave it. The reasons are practical: it is the module syntax you already know from browser JavaScript, it is what the language standard specifies, it supports top-level `await` (useful for startup work), and every current tutorial and library documentation you will read is drifting toward it. CommonJS is not deprecated and you will absolutely meet it in older codebases — being able to read `require` is a real skill — but there is no reason to start a new 2020s project on it.

Switching to ESM changes three things you will trip over on day one:

1. **Relative imports need the file extension.** `import { events } from "./data.js"` works; `import { events } from "./data"` throws `ERR_MODULE_NOT_FOUND`. Browsers have always required this; CommonJS let you be lazy, ESM does not. Imports of *packages* (`import express from "express"`) do not take an extension, because the package resolves through `node_modules`.
2. **`require` does not exist**, and neither does `module.exports`. Mixing the two in one file is the most common beginner error in a fresh Node project, and the error message (`require is not defined in ES module scope`) is at least honest about it.
3. **`__dirname` and `__filename` are gone.** When you need the current file's directory in ESM, derive it:

   ```javascript
   import { dirname } from "node:path";
   import { fileURLToPath } from "node:url";

   const __dirname = dirname(fileURLToPath(import.meta.url));
   ```

   You will need this in a later lesson when the app serves files from disk. Note the `node:` prefix on built-in modules — it is optional but explicit, and it removes any doubt about whether you are importing Node's `path` or somebody's package named `path`.

Write the skeleton entry point so there is something to run. Create `src/server.js`:

```javascript
import process from "node:process";

const events = [
  { id: 1, title: "Neighborhood Cleanup", date: "2026-08-02" },
  { id: 2, title: "Intro to Soldering", date: "2026-08-09" },
  { id: 3, title: "Community Potluck", date: "2026-08-16" },
];

console.log(`events-board starting on Node ${process.version}`);
console.log(`${events.length} events loaded`);
```

Then run it:

```bash
node src/server.js
```

You should see two lines and the process should exit immediately. That last part is worth noticing: a Node process ends when it has no more work scheduled. This script has none, so it stops. A server keeps running precisely because listening on a port *is* scheduled work — that is next lesson's business.

Finally, before you commit anything, write `.gitignore`:

```text
node_modules/
.env
*.log
.DS_Store
```

`node_modules/` is the important line and it is not optional. That directory can hold tens of thousands of files, it is entirely reproducible from `package.json` plus the lockfile, and committing it makes every future diff unreadable. `.env` keeps secrets out of the repository — you will add real environment configuration later, and the habit needs to exist before the secret does.

## Dependencies, semver, and the lockfile

Install the framework this course is about:

```bash
npm install express
```

Three things just happened. `express` was added to `dependencies` in `package.json`. The package and everything it depends on was downloaded into `node_modules/`. And a file called `package-lock.json` was written or updated.

`package.json` now contains something like:

```json
{
  "dependencies": {
    "express": "^4.21.2"
  }
}
```

**Which Express you got.** The `^4.21.2` above is from Express 4. Express 5 has been the default release on npm since early 2025, so a fresh `npm install express` almost certainly gives you `^5.x` instead. Check with `npm ls express`. Nearly everything in this course works the same on both. Where they differ (path patterns, what `req.body` is when nothing parsed it, how async errors are caught), the lesson says so. If you want your project to match these samples exactly, install the older major on purpose with `npm install express@4`. Either way, know which one you are on, because "which version" is the first question anyone will ask when you report a bug.

**Dependencies versus devDependencies.** A `dependency` is something the application needs *at runtime, in production*. Express is one: without it, the server cannot start. A `devDependency` is something only you and your teammates need while working — test runners, linters, formatters, restart watchers. Install those with `--save-dev`:

```bash
npm install --save-dev nodemon
```

The distinction is not cosmetic. Production installs commonly run `npm ci --omit=dev`, which skips `devDependencies` entirely to get a smaller, faster, less exposed install. If you put Express in `devDependencies` by mistake, your app installs cleanly on your laptop and crashes on the host with `Cannot find package 'express'`. If you put a linter in `dependencies`, you ship a few megabytes of tooling nobody will ever run. Ask one question when installing: *does the running server need this to serve a request?* Yes means `dependencies`, no means `devDependencies`.

**Semver.** The `4.21.2` is a semantic version: `MAJOR.MINOR.PATCH`. The contract the publisher is making is that a PATCH bump fixes bugs without changing behavior you rely on, a MINOR bump adds features without breaking existing ones, and a MAJOR bump is allowed to break you. The leading character is the *range*, and it decides how much drift you accept:

- `^4.21.2` — caret. Accepts any `4.x.y` at or above `4.21.2`. Minor and patch updates allowed, major not. This is npm's default and the right choice most of the time.
- `~4.21.2` — tilde. Accepts `4.21.z` only. Patch updates allowed, minor not. Use when you have been burned by a minor release.
- `4.21.2` — exact. Nothing but that version.

The subtle part: **the range in `package.json` is resolved at install time.** Two people running `npm install` on the same `package.json` six months apart can end up with different versions of Express, both of them satisfying `^4.21.2`. That is the exact mechanism behind "it works on my machine."

**The lockfile solves that.** `package-lock.json` records the resolved version of every package in the tree — your direct dependencies and their dependencies, all the way down — along with integrity hashes. It is a snapshot of a known-working install.

Two commands read it differently, and knowing which to use is a genuinely useful piece of professional knowledge:

- `npm install` treats the lockfile as a starting point. It may update it if `package.json` allows a newer version.
- `npm ci` treats the lockfile as law. It deletes `node_modules`, installs exactly what the lockfile says, and fails loudly if the lockfile and `package.json` disagree. It is faster and it is reproducible, which is why it is what continuous integration and deployment hosts run.

So: **commit `package-lock.json`.** Never commit `node_modules/`. The lockfile is the reproducibility guarantee; the directory is just a cache you can rebuild from it. If your `node_modules` gets into a strange state, deleting it and running `npm ci` is a legitimate and quick fix.

A few commands that pay for themselves:

```bash
npm ls express        # what version is actually installed, and who asked for it
npm outdated          # what has newer releases available
npm audit             # known vulnerabilities in the installed tree
```

Run `npm outdated` before you start a piece of work, not the day before a deadline. Upgrading a major version is a task; discovering you need to is not something you want to do under time pressure.

## npm scripts and npx

`package.json` has a `scripts` object, and it is the project's command interface. Fill it in:

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "node --watch src/server.js"
  }
}
```

Run them with `npm run <name>`:

```bash
npm run dev
```

`start` and `test` are special-cased so that `npm start` works without `run`; everything else needs `npm run`. Typing `npm run` with no arguments lists every script defined, which makes `package.json` self-documenting for anyone who clones the repository.

The reason to use scripts rather than remembering commands is not typing convenience, it is agreement. When every project in a team responds to `npm start`, `npm run dev`, and `npm test`, nobody has to read a README to get moving, and a deployment host can run `npm start` without knowing anything about your file layout.

Scripts also get one capability a plain shell does not: npm puts `node_modules/.bin` on the `PATH` before running them. That means a script can invoke a locally installed tool by bare name — `"dev": "nodemon src/server.js"` finds the `nodemon` binary in your project's `node_modules`, even though it is not installed globally. Type `nodemon` in your terminal directly and you will likely get `command not found`, which confuses people constantly.

**`npx`** is the other half of that idea. It runs a package's binary without permanently installing it:

```bash
npx cowsay "server up"
```

If the package is already in `node_modules`, `npx` uses it. If not, it downloads it into a temporary cache, runs it, and moves on. This is how you should run one-off scaffolding tools — the kind you use once and never again. It is not how you should run something your project depends on every day; that belongs in `devDependencies` and a script, so the version is pinned and recorded.

One more piece of syntax you will need: to pass arguments through a script to the underlying command, separate them with `--`.

```bash
npm run dev -- --port 4000
```

Without the `--`, npm consumes the flags itself.

## Choosing tooling for a deliverable

Everything so far has been mechanics. This section is the judgment, and it is the competency this lesson is actually assessed on: given a deliverable in a work plan, can you help pick the tools and languages to produce it, and explain the pick to whoever is supervising you?

The failure mode is not usually picking a *bad* tool. It is picking without criteria — copying whatever the last tutorial used — and then being unable to answer "why this one?" in review. Here is a set of criteria worth applying every time, roughly in order of weight:

1. **Fit to the actual requirement.** Not the impressive requirement, the real one. Read the deliverable and list what it must do. Anything the tool gives you beyond that list is cost, not value.
2. **Constraints you do not control.** What does the team already use? What can the host run? What is the deadline? A technically superior choice that nobody on the team can maintain is a worse choice.
3. **Maturity and maintenance.** When was the last release? Are issues answered? How many other projects depend on it? A package with a thousand weekly downloads and no commit in three years is a liability regardless of how elegant its API is.
4. **Footprint.** How many transitive dependencies does it drag in? Every one is code you did not read, running on your server. `npm ls --all` will show you what you actually agreed to.
5. **Documentation.** If you cannot solve a basic problem from the official docs in ten minutes, you will not solve a hard one at 2am.
6. **License.** Check it before you build on it, not after. MIT and Apache-2.0 are permissive and safe for most work; anything unusual is a question for a supervisor, not a decision for you.
7. **Cost of reversal.** How hard is it to remove later? A small library used behind one function of your own is nearly free to swap. A framework that dictates your file layout is not.

Now apply that to this project's first real decision: **what serves the events board's HTTP?**

The requirement is a small service that answers requests at a handful of paths, returns both HTML and JSON, and runs on a managed host. Four candidates:

- **`node:http`**, the built-in module. Zero dependencies, no install, complete control. It also means you write your own path matching, your own method dispatch, your own body parsing, and your own error handling. That is educational, and it is a lot of code to maintain for no differentiating value.
- **Express.** Enormous adoption, an ecosystem of compatible middleware for nearly everything, a decade of Stack Overflow answers, a tiny API surface you can hold in your head. Not the fastest benchmark number in the field.
- **Fastify.** Faster, with schema-based validation built in and a more modern plugin model. Smaller ecosystem, fewer beginner-level answers when you get stuck.
- **Koa.** Lean and elegant, deliberately minimal. Almost everything is a separate package you have to choose, which is a burden when you are learning.

For this deliverable, **Express** wins on criteria 2, 3, and 5: it is what the apprenticeship's other work uses, it is overwhelmingly documented, and its ecosystem means the middleware you will need in later lessons already exists and is battle-tested. It loses on raw throughput, which does not matter at all for a community events board that will serve a handful of requests per minute. That last sentence is the important part of the argument — you named a real weakness and explained why the deliverable does not care.

The same reasoning applies to the small choices. For a dev restart loop, `nodemon` is the long-standing answer, but Node now ships `--watch` built in. Criterion 4 says prefer the one that adds no dependency, so this course uses `node --watch` and mentions `nodemon` because you will see it in every older project. And the general rule underneath criterion 4: **do not add a package for something the standard library already does.** Formatting a date, joining a path, generating a random id, reading a file — Node does all of these. A dependency added for four lines of convenience is four lines of convenience and one more thing to patch forever.

The last part of the competency is "under supervision," and that has a concrete meaning: **write the decision down and get it checked.** A four-line note in the README naming the choice, the alternatives, and the deciding criterion turns an invisible assumption into something a reviewer can agree or disagree with in thirty seconds. Do that now, while the reasoning is fresh, because in three weeks you will remember the choice and not the reason.

## Practice

Build the project skeleton the rest of the course runs on. When you finish, `npm start` should run without error on a fresh clone.

1. Install an LTS Node version through a version manager and confirm it with `node -v` and `npm -v`.
2. Create an `events-board` directory, run `git init`, and run `npm init -y`.
3. Edit `package.json` so it has: an accurate `name`, `version` `0.1.0`, a real one-sentence `description`, `"private": true`, `"type": "module"`, `"main": "src/server.js"`, an `engines.node` range matching the version you installed, and `"license": "UNLICENSED"`.
4. Add a `.nvmrc` containing your major Node version.
5. Write `.gitignore` covering `node_modules/`, `.env`, `*.log`, and `.DS_Store`. Commit before installing anything, and confirm with `git status` that `node_modules/` never appears once you do.
6. Run `npm install express`, then `npm install --save-dev nodemon`. Open `package.json` and confirm Express landed in `dependencies` and nodemon in `devDependencies`. If either is in the wrong place, move it and explain in one sentence why.
7. Create `src/server.js` that imports Express, defines an in-memory `events` array with at least three events (each with `id`, `title`, and `date`), and logs the Node version, the number of events loaded, and `typeof express`. Do not define any routes yet — that is the next lesson.
8. Add `"start": "node src/server.js"` and `"dev": "node --watch src/server.js"` to `scripts`. Verify `npm start` prints your three lines. Run `npm run dev`, edit the array, and watch it restart.
9. Delete `node_modules/` entirely, run `npm ci`, and confirm the app still starts. If `npm ci` errors, read the message — it is telling you `package.json` and `package-lock.json` disagree.
10. Run `npm ls express` and `npm outdated` and record what they report.
11. Write a `## Tooling decisions` section in `README.md`, no more than 150 words, that names your Node version and why it is pinned, why this project uses Express rather than `node:http` or Fastify, why it uses ESM rather than CommonJS, and one criterion from this lesson that decided each.

**Deliverable:** a committed repository containing `package.json`, `package-lock.json`, `.nvmrc`, `.gitignore`, `src/server.js`, and `README.md`, with no `node_modules/` in version control, that runs on a fresh `npm ci && npm start`.

## Check your understanding

1. You type `document.title` into a Node script and get a `ReferenceError`. Is Node broken?
   *No. `document` belongs to the browser host, not to JavaScript. Node is a different host for the same engine and never had a DOM.*
2. A teammate's fresh clone crashes on the host with `Cannot find package 'express'`, but works on their laptop. What is the most likely cause?
   *Express is in `devDependencies`. Production installs such as `npm ci --omit=dev` skip that section.*
3. What is the difference between `.nvmrc` and `engines.node`?
   *`.nvmrc` is a convenience a version manager reads so humans land on the right Node. `engines.node` travels with the package: npm warns on a mismatch, and most hosts read it to choose a runtime.*
4. Why commit `package-lock.json` but never `node_modules/`?
   *The lockfile records the exact resolved tree, so `npm ci` can rebuild the same install anywhere. `node_modules/` is just a cache of that tree, and committing it makes every diff unreadable.*
