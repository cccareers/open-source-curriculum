---
lesson_id: agile100-03
course_id: agile100
pathway: quality-assurance-software-engineer
title: Reading a Legacy Codebase and Its Documentation
order: 3
kind: lesson
competency_ids:
  - D3-S1-C02
  - D4-S1-C01
  - D4-S1-C02
objectives:
  - Orient yourself in an unfamiliar legacy codebase and its documentation
---

## Why this comes before backlog work

You cannot write a testable check against code you've never opened, and you cannot trust documentation you've never verified. Before this course's sprint asks you to turn acceptance criteria into checks (Lesson 04) or plan testing against a delivery date (Lesson 05), you need to be able to orient yourself in a codebase someone else wrote — quickly, and without breaking anything. That's this lesson's whole job.

"Legacy" here doesn't mean bad. It means: existing, already running, written by people who aren't necessarily in the room to explain it. Almost every real QA job is on a legacy codebase within your first week, because almost no team is greenfield forever.

## A repeatable orientation pass

When you're dropped into an unfamiliar repository, work through these steps in order rather than reading files at random:

1. **Read the README first, skeptically.** It tells you what the project *claims* to be — setup steps, how to run it, what it depends on. Note anything that looks stale (a Node version that predates the `package.json`, a script name that no longer exists).

2. **Get it running locally.** Follow the README's setup instructions exactly as written. Where they fail, that's your first real finding: the documentation is wrong, incomplete, or the environment has drifted. Write down every deviation — you'll need it later.

3. **Map the directory structure.** Most JavaScript/Node projects follow a recognizable shape:

```text
src/            application code
  routes/       or controllers/ or api/  — entry points
  models/       or db/            — data layer
  services/     or lib/           — business logic
test/           or __tests__/     — existing tests, if any
docs/           architecture notes, ADRs, if any
package.json    dependencies and npm scripts
```

Not every project matches this exactly, but knowing the *shape* to look for tells you where to start reading. `package.json`'s `scripts` block, in particular, tells you what the previous developers considered the important commands — `test`, `build`, `lint`, `start`.

4. **Trace one request or one feature, end to end.** Pick something small and observable — a single API endpoint, a single page load — and follow it from entry point to response. This is more useful than reading files in isolation, because it shows you how the pieces actually connect, not just what each file contains.

5. **Read the git history for the area you're working in.** `git log --oneline -- path/to/file` and `git blame path/to/file` tell you who touched this code, how recently, and — often, from commit messages — why. A file with 200 commits and a dozen contributors carries more risk than one with three commits from a single author last month.

## Using logs, config, and code to locate a breakdown (D3-S1-C02)

Orientation isn't only about understanding intent — it's also about diagnosing when something's broken, using the tools already in the codebase:

- **Configuration files** (`.env.example`, `config/*.json`, `docker-compose.yml`) tell you what the running system expects to exist — database URLs, API keys, feature flags, ports. A surprising number of "it doesn't work on my machine" bugs are a missing or mismatched config value, not a code defect.
- **Logs** are your window into what actually happened, not what should have happened. When you can't reproduce a bug from the description alone, the log line right before the failure — a stack trace, a rejected request, a timeout — usually narrows the search from "somewhere in the app" to a specific function.
- **Code**, once config and logs have narrowed the search, is where you confirm the actual cause: read the function that logged the error, read what calls it, and read what it depends on.

Work in that order — config, then logs, then code — because it's cheapest first. Checking a config value takes seconds; stepping through code with a debugger takes minutes. Don't skip straight to reading code just because it feels more "technical."

**Worked example.** A teammate reports: "the search page returns zero results for everything, even terms that used to work." Orientation pass:

1. Config: check `.env` — is `SEARCH_INDEX_URL` pointed at the right host? (Found: it's pointed at a decommissioned staging index.)
2. Logs: confirm — the app log shows repeated `ECONNREFUSED` to that host on every search request.
3. Code: only now open `services/search.ts` to confirm it reads that variable at startup and doesn't retry against a fallback.

Three steps, ten minutes, root cause identified — because config was checked before code.

## Source-control best practices you inherit on day one (D4-S1-C01)

Every team has its own source-control conventions, and following them — not inventing your own — is part of professional competence, not a stylistic preference:

- **Branch naming**: many teams use a pattern like `type/short-description` (`fix/search-index-url`, `feature/defect-export`). Check `git branch -a` or the team's contributing doc for the pattern in use before you create your first branch.
- **Commit messages**: look at recent history for the house style. Some teams want a ticket ID in every message (`QA-142: fix search index URL`); some use conventional-commit prefixes (`fix:`, `test:`).
- **Never commit directly to the main/trunk branch.** Work in a branch, open a pull request, and let review and CI run before it merges — even for a one-line config fix.
- **Small, reviewable commits.** A commit that touches forty files with no clear theme is nearly impossible to review or to revert cleanly if it turns out wrong.

You don't get to skip these because you're "just testing" — a QA engineer who files a defect from a scratch branch, or commits a test fixture straight to main, creates the same mess a developer would.

## Reviewing documentation for accuracy — and flagging where it's wrong (D4-S1-C02)

Documentation review isn't proofreading. You're checking three things:

- **Technical accuracy** — does the documented behavior match what the code actually does? (This is where step 2 above — trying the setup steps yourself — pays off directly.)
- **Compliance** — does it match required practice (e.g., a documented "run tests before merging" step that nobody's CI actually enforces is a compliance gap worth flagging, not just an accuracy gap).
- **Completeness** — is anything missing that a new person would need? A setup guide that never mentions a required environment variable will cost the next person the same hour it just cost you.

When you find a documentation gap, don't just work around it silently and move on — that guarantees the next person hits the same wall. Record it: what the doc said, what actually happened, and what should be corrected. A short note like this is enough:

```text
Doc: README.md, "Local Setup" section
Claim: "npm run dev starts the app on port 3000"
Actual: app starts on port 4000 (see src/config/server.ts, PORT default)
Impact: new developer/QA wastes time hitting the wrong port
Suggested fix: update README, or read PORT from .env.example consistently
```

That record is exactly what you'll be doing for defects starting in Lesson 07 — the format habit starts here.

## Practice

Pick any small-to-medium open-source JavaScript or Node repository you have access to (or one from a prior course, like your web101/node100/ops100 project work). Spend no more than 45 minutes on the following, then write up your findings:

1. Follow its README setup instructions exactly. Note every place they fail or are unclear.
2. Trace one feature or one API endpoint from entry point to output, and sketch the files involved.
3. Run `git log --oneline -10 -- <a file central to that feature>` and summarize what the recent history tells you about how actively — and by whom — that file is maintained.
4. Write one documentation-gap note in the format shown above, for the most significant thing the README got wrong or left out.
