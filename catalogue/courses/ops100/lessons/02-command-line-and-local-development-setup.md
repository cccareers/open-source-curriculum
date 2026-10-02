---
lesson_id: ops100-02
course_id: ops100
pathway: quality-assurance-software-engineer
title: Command Line and Local Development Setup
order: 2
kind: lesson
competency_ids:
  - D3-S1-C01
  - D3-S1-C03
objectives:
  - Set up a local development environment that mirrors how the project really runs
---

## Why a QA engineer needs a real shell

Every lesson after this one assumes you can operate a POSIX-style shell (bash or zsh on macOS/Linux, or a Linux-compatible shell like WSL on Windows) with confidence. A QA engineer who cannot navigate a filesystem, run a script, or read an error from the command line is stuck depending on someone else to reproduce a bug for them. That is not sustainable — you will spend a large share of your working life recreating a report's exact conditions on your own machine.

Start with the commands you will use constantly:

```bash
pwd                     # print the current directory
ls -la                  # list files, including hidden dotfiles
cd project-name         # change directory
mkdir scratch && cd $_  # make a directory and move into it
cat README.md           # print a file's contents
```

Two habits matter more than any individual command. First, always know which directory you are in before you run something destructive — `pwd` is free, a mistaken `rm` is not. Second, read command output before scrolling past it; the line that tells you why a command failed is almost always right there, not buried in a stack trace three screens up.

## Installing and verifying your toolchain

A "local development environment that mirrors how the project really runs" means installing the same runtime, package manager, and supporting tools the team actually uses in production — not whatever happens to be preinstalled on your machine. For a typical modern web project that means Node.js, a package manager (npm, which ships with Node, or an alternative like pnpm), Git, and a current version of Chrome.

Install Node via your platform's package manager or, better, a version manager so you can match whatever version a project specifies:

```bash
# macOS, via Homebrew
brew install node

# or a version manager, which lets you switch per project
nvm install --lts
nvm use --lts
```

Once installed, verify every tool you depend on. This is not busywork — a mismatched Node version is one of the most common causes of "works on my machine" bug reports that turn out not to be bugs at all:

```bash
node --version
npm --version
git --version
```

Many projects pin an expected version in a file like `.nvmrc` or the `engines` field of `package.json`:

```json
{
  "engines": {
    "node": ">=20.0.0"
  }
}
```

Check for one of these before you assume your globally installed version is close enough. "Close enough" is exactly the kind of assumption that produces a defect report you file against your own setup instead of the software.

## Cloning a project and running it locally

Once your toolchain matches the project's expectations, get the code and stand it up:

```bash
git clone https://github.com/example-org/example-project.git
cd example-project
npm install
npm run dev
```

`npm install` reads `package.json` and downloads every dependency the project declares, recording the exact versions it resolved in `package-lock.json`. Never hand-edit that lockfile, and never skip `npm install` after pulling changes — a teammate may have added a dependency your local `node_modules` does not have yet, and the failure that produces (a missing-module error at startup) looks nothing like the dependency problem it actually is.

`npm run dev` starts whatever the project defines as its development server, usually on a local port such as `http://localhost:5173` or `http://localhost:3000`. Open that URL in Chrome and confirm the page loads before you touch anything else — a broken local setup is the single most common reason a learner (or a professional) reports a defect that does not exist.

## Configuring environment variables to mirror production

Real projects rarely run with zero configuration. API base URLs, feature flags, and credentials for services the app depends on are usually supplied as environment variables, often loaded from a `.env` file that is deliberately excluded from version control:

```bash
# .env.example — checked into the repo as a template
API_BASE_URL=https://api.example.com
FEATURE_FLAG_NEW_CHECKOUT=false
```

```bash
cp .env.example .env
# then edit .env with values appropriate to your local setup
```

This is the core of D3-S1-C01: installing and configuring a recreation of the production environment, under supervision, so you can test software the way it will actually run. If a defect only appears when a particular feature flag is on, or only against a staging API rather than a mock, your local environment has to be able to reproduce that condition — otherwise you cannot confirm a fix, only guess at one. When you are unsure which values are safe to use locally, ask a supervisor or teammate rather than inventing credentials; this is exactly the kind of setup step where "under supervision" matters.

## Installing and using test tooling

D3-S1-C03 — installing, maintaining, and using software testing programs — starts here too. Most projects ship with test and quality tooling already declared in `package.json`, and part of setting up your environment correctly is confirming you can run it:

```bash
npm run lint      # static analysis: catches likely bugs and style violations
npm run test      # runs the project's automated test suite
npm run build     # produces a production-style build, useful for catching build-only errors
```

Run all three before you assume your environment is ready. A clean `npm run dev` tells you the app starts; it does not tell you the test suite passes or that the linter is happy. If `npm run test` fails immediately after a fresh clone and install, that is valuable information — it might mean a missing environment variable, a Node version mismatch, or a genuine problem in the codebase — and distinguishing between those three is a core QA skill you will practice for the rest of this course.

Keep your tooling current deliberately. When the project updates a dependency or a Node version requirement, re-run `npm install` and re-verify with `node --version` rather than assuming your existing setup still matches. An environment that quietly drifts out of sync with the team's is one of the most common invisible causes of both false-positive and false-negative test results.

## Practice

1. From a terminal, create a new directory called `env-check`, move into it, and run `node --version`, `npm --version`, and `git --version`, saving the output of each to a file called `versions.txt` using `>` (for the first) and `>>` (to append the rest).
2. Clone any small public repository that includes a `package.json` (ask your instructor for one if you don't have a preference). Run `npm install`, then `npm run dev` (or the equivalent start script), and confirm in Chrome that the page loads.
3. Locate the project's `.env.example` or configuration documentation. Write two sentences explaining what would happen to your local setup if you skipped that configuration step entirely, based on what the file's variables appear to control.
4. Run the project's lint and test scripts (`npm run lint`, `npm run test`). If either fails, copy the first error line into a note and explain, in one sentence, whether you think it is an environment problem or a code problem — and what you would check next to find out.
