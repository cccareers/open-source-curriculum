---
lesson_id: agile200-04
course_id: agile200
pathway: quality-assurance-software-engineer
title: Building the Test Environment
order: 4
kind: lesson
competency_ids:
  - D3-S1-C01
  - D3-S1-C03
objectives:
  - Stand up a test environment that represents how the project will really run
---

## Why "it works on my machine" is not a test result

A test environment's whole job is to catch problems before a real user does, and it can only do that if it resembles where the software will actually run. Testing exclusively on your own development machine — your dependencies, your operating system, your data — tells you the software works under conditions almost nobody else will ever have. This lesson is about building a recreation of production close enough to be trustworthy, and installing the tools you'll use to test against it, before any automated test in Lesson 06 has somewhere real to run.

## What "representative" means for a small capstone

You are not standing up a full production infrastructure — that would eat your three weeks before a line of test code exists. "Representative" for a project this size means matching the handful of things that actually cause behavior to differ:

- **Runtime version** — the same language/runtime version (and major dependency versions) you intend to deploy with, not whatever happened to already be installed.
- **Configuration, not hardcoded values** — settings that differ between your machine and anywhere else (database connection strings, API keys, feature flags) come from environment variables or a config file, never hardcoded into the source.
- **A dedicated, seeded dataset** — not your personal scratch data, and not production data if this were a real product. A test environment needs its own small, known dataset so that "the third user in the list is an admin" is a fact you can rely on in a test, not a coincidence of whatever you happened to click around and create.
- **Network topology, if it matters** — if your app calls a real external API, decide now whether tests hit that API for real, hit a local stand-in, or are skipped in this environment. Guessing wrong here silently breaks tests two weeks from now.

## The environment checklist

Use this as your starting template and adapt it to your stack:

```text
Test Environment Checklist
- [ ] Runtime/language version pinned and documented
- [ ] Dependencies installed from a lockfile, not "whatever's newest"
- [ ] Configuration lives in environment variables / config file, not source
- [ ] Database (or equivalent storage) is separate from any personal dev data
- [ ] Seed data script exists and is repeatable (running it twice gives the same result)
- [ ] External services are mocked, stubbed, or explicitly allowed for real calls
- [ ] Environment can be torn down and rebuilt from a documented set of steps
- [ ] A teammate other than you has successfully stood up the environment from your docs
```

That last item is the one teams skip and regret. An environment only you can build is not a test environment — it is a personal habit. If you're working solo, stand-in for "a teammate" by tearing your own environment down completely and rebuilding it from your written steps alone, with no memory shortcuts.

## Installing and configuring the recreation

Work through this in order:

1. **Pin the runtime.** Record the exact version you're targeting (e.g., in a version file or your project's config) so "works in the test environment" means something specific.
2. **Install from a lockfile.** Whatever your language's package manager is, commit its lockfile and install from it — this is what makes "recreation of production" mean something instead of "whatever's on my machine today."
3. **Externalize configuration.** Create a `.env.example` (or equivalent) listing every configuration value the app needs, with placeholder values, and keep real values out of source control.
4. **Write a seed script.** A short script that populates the test database with a small, known set of records — enough to exercise the app's main paths, small enough to read in one sitting.
5. **Document the rebuild.** A short `TESTING.md` or section in your README: the exact commands, in order, to go from a clean checkout to a running, seeded test environment.

```bash
# example rebuild sequence — adapt commands to your stack
git clone <repo> && cd <repo>
cp .env.example .env        # then fill in local values
<package manager> install --frozen-lockfile
<package manager> run db:seed
<package manager> run dev
```

The exact "install exactly what the lockfile says" command differs by package manager: npm uses `npm ci`, Yarn uses `yarn install --frozen-lockfile` (or `--immutable` in newer versions), and pnpm uses `pnpm install --frozen-lockfile`. Check which one your project uses and write the real command into your rebuild steps.

## Installing and maintaining your test tooling

Alongside the application environment, you need the tools that will actually run tests against it — a test runner for unit and integration tests, and, if your project has a user interface, a browser automation library for end-to-end checks. Install both now, even though you will not write substantial test suites until Lesson 06:

- **Test runner** — install it as a project dependency (not globally, so teammates get the same version from the lockfile), and confirm it can discover and run at least one placeholder test.
- **Browser automation library** (if applicable) — install it, and confirm it can launch a browser and load your app's home page against the running test environment.

Maintaining test tooling is not a one-time setup. Across the three weeks, dependency updates, runtime upgrades, or a change to how the app starts up can all break the tooling itself, independent of any test you've written. Treat "can the test runner still run a trivial test" as something you check whenever something in the environment changes, not something you assume stays true.

## Practice

Stand up your capstone's test environment following the checklist above: pinned runtime, lockfile install, externalized configuration, a repeatable seed script, and a documented rebuild sequence. Then do the teardown-and-rebuild test — wipe your local environment and rebuild it using only your written steps, timing how long it takes and noting any step that required knowledge not written down. Finally, install your test runner (and browser automation library, if your project has a UI) and confirm each can execute a single trivial test against the freshly rebuilt environment. Fix your documentation for any gap the rebuild exposed.

## Check your understanding

1. Why must configuration live in environment variables or a config file rather than in the source?
2. What makes a seed script "repeatable"?
3. How do you prove your environment documentation works if you are working solo?

*Answers:* (1) Values differ between environments; hardcoding them means the test environment silently uses the wrong ones (or leaks real credentials). (2) Running it twice gives the same known dataset. (3) Tear the environment down completely and rebuild it using only the written steps, noting anything you had to remember.
