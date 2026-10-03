---
course_id: agile100
project_id: agile100-x02
title: "The Search Index Outage: Orient, Diagnose, Escalate, Record"
kind: supplementary-project
status: draft
hours_estimate: 4
difficulty: core
related_lessons:
  - agile100-03
  - agile100-06
  - agile100-07
objectives:
  - Orient yourself in an unfamiliar legacy codebase and its documentation
  - Collaborate daily with a team and escalate issues clearly
  - Track defects from discovery through verified closure
competency_ids:
  - D3-S1-C02
  - D4-S1-C01
  - D4-S1-C02
  - D2-S1-C05
  - D1-S1-C04
  - D2-S1-C01
  - D3-S1-C05
---

## Scenario

It's your first morning on the storefront team. Nobody has touched the legacy repository's setup docs in a year. A teammate posts in the team channel: "the search page returns zero results for everything, even terms that used to work." This is the same incident from Lesson 03's worked example, and it will become STORY-108 (search index config fix) in the sprint you've followed through the course.

You have three jobs before tomorrow's standup:

1. Orient yourself in the repo and find out why search is failing, working config, then logs, then code.
2. Record every place the documentation is wrong, and back each finding with a small automated check so it can't silently regress.
3. Escalate the outage at standup and file the defect, checking the known-defects list first.

This is a role-play plus a small runnable check. Work in pairs: one person is the QA engineer, the other plays the developer and team lead at standup (swap roles for a second run if time allows).

## What you will produce

1. `orientation-notes.md`: setup deviations, a directory sketch, and a config-to-logs-to-code trace of the search failure.
2. `doc-gaps.md`: at least three documentation-gap notes in the Lesson 03 format (Doc / Claim / Actual / Impact / Suggested fix).
3. `test/orientation.test.mjs`: the automated checks below, failing on the starter repo and passing after your fix branch.
4. A pull request (or, without a remote, a branch plus a written PR description) named per the team convention `fix/search-index-url`, with a commit message like `QA-142: point SEARCH_INDEX_URL at live index; document env vars`.
5. `standup-escalation.md`: your four-part escalation script, plus a note from your partner on whether they could act on it without asking a follow-up question.
6. `defect.md`: the defect record (Lesson 07 template), plus a one-line known-defects search log ("searched for: search, index, zero results; found: ...").

## Before you start

- Node.js 18 or newer (`node --version`). The checks use only the built-in `node:test` runner; no packages to install.
- Create the starter repo exactly as below (your instructor may supply it as a zip instead).

`package.json`

```json
{
  "name": "storefront-legacy",
  "version": "1.4.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "node src/server.js",
    "test": "node --test"
  }
}
```

`README.md`

```markdown
# Storefront (legacy)

## Local Setup

1. Copy `.env.example` to `.env`.
2. Run `npm run dev`. The app starts on port 3000.
3. Search uses the index at `SEARCH_INDEX_URL`.
```

`.env.example`

```text
PORT=4000
SEARCH_INDEX_URL=http://search-staging-old.internal:9200
```

`src/config.js`

```js
export const config = {
  port: Number(process.env.PORT ?? 4000),
  searchIndexUrl: process.env.SEARCH_INDEX_URL,
  checkoutTimeoutMs: Number(process.env.CHECKOUT_TIMEOUT_MS ?? 5000),
};
```

`logs/app.log` (excerpt supplied by the teammate)

```text
2026-03-12T08:41:07Z ERROR search: request failed host=search-staging-old.internal:9200 code=ECONNREFUSED
2026-03-12T08:41:09Z ERROR search: request failed host=search-staging-old.internal:9200 code=ECONNREFUSED
2026-03-12T08:41:15Z INFO  search: returned 0 results q="tote bag"
```

Team facts (from the lead): the live staging index is `search-staging.internal:9200`; `search-staging-old.internal` was decommissioned last month. `src/server.js` is intentionally not supplied: you're reviewing config and docs, not running the server.

## Milestones

1. **Orientation pass (45 min).** Read the README skeptically and compare it with `package.json` and `.env.example`. Sketch the directory. Note every deviation.
2. **Config, then logs, then code (30 min).** Write the three-step trace from Lesson 03 for this failure: which config value is wrong, which log line confirms it, and what the code does with it. Time-stamp each step.
3. **Doc-gap notes (30 min).** Write at least three notes. There are at least three real gaps in the starter repo: the README port, the stale index URL, and a variable the config reads that `.env.example` never mentions.
4. **Automated checks (45 min).** Add the test file below. Run `npm test` on the starter repo and confirm all three checks fail for the reasons you documented. Then fix the README and `.env.example` on your branch and confirm all three pass.
5. **Standup role-play (20 min).** Deliver your escalation aloud in under 45 seconds. Your partner, playing the lead, may ask one question only. If they had to ask, revise and redeliver.
6. **Defect record (20 min).** Search the known-defects list (your instructor supplies it, or use the Lesson 07 tracking table) before filing. File the defect, then log its lifecycle through Verified once your branch's checks pass.

## Automated checks

Save as `test/orientation.test.mjs` and run `npm test` from the repo root.

```js
// Orientation checks for the legacy storefront. Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const readme = readFileSync('README.md', 'utf8');
const envExample = readFileSync('.env.example', 'utf8');
const configSrc = readFileSync('src/config.js', 'utf8');

// Every process.env.NAME the config reads
const envVarsUsed = [...configSrc.matchAll(/process\.env\.([A-Z0-9_]+)/g)].map((m) => m[1]);
// Every NAME=value line in .env.example
const envVarsDocumented = new Map(
  envExample
    .split('\n')
    .filter((line) => /^[A-Z0-9_]+=/.test(line))
    .map((line) => {
      const i = line.indexOf('=');
      return [line.slice(0, i), line.slice(i + 1).trim()];
    }),
);

test('.env.example documents every variable the config reads', () => {
  const missing = envVarsUsed.filter((name) => !envVarsDocumented.has(name));
  assert.deepEqual(missing, [], `Undocumented env vars: ${missing.join(', ')}`);
});

test('README port matches the port the app actually uses', () => {
  const claimed = readme.match(/starts on port (\d+)/)?.[1];
  const actual = envVarsDocumented.get('PORT') ?? configSrc.match(/PORT \?\? (\d+)/)?.[1];
  assert.equal(claimed, actual, `README says ${claimed}, app uses ${actual}`);
});

test('SEARCH_INDEX_URL does not point at a decommissioned host', () => {
  const decommissioned = ['search-staging-old.internal'];
  const url = envVarsDocumented.get('SEARCH_INDEX_URL');
  assert.ok(url, 'SEARCH_INDEX_URL is not documented in .env.example');
  const host = new URL(url).hostname;
  assert.ok(!decommissioned.includes(host), `${host} is on the decommissioned list`);
});
```

Expected results (verified on Node 24):

- Starter repo: 3 failing, with messages `Undocumented env vars: CHECKOUT_TIMEOUT_MS`, `README says 3000, app uses 4000`, and `search-staging-old.internal is on the decommissioned list`.
- After fixing the README port to 4000, pointing `SEARCH_INDEX_URL` at `http://search-staging.internal:9200`, and adding `CHECKOUT_TIMEOUT_MS=5000` to `.env.example`: 3 passing.

Use `npm test` (or plain `node --test`, which discovers `*.test.mjs` files automatically) rather than `node --test test/`: on Node 24 a bare directory argument is treated as a module path and fails.

## Acceptance criteria

- [ ] The trace checks config before logs before code, and each step names the exact file, value, or log line.
- [ ] At least three doc-gap notes, each with all five fields.
- [ ] `npm test` fails 3 of 3 on the starter and passes 3 of 3 on your branch (screenshot or pasted output for both).
- [ ] Branch name and commit message follow the convention given above; no change is made directly on `main`.
- [ ] The escalation leads with impact and ends with a specific ask naming a person or role and a time.
- [ ] The defect record has every Lesson 07 field, separate severity and priority, and a known-defects search noted before filing.

## Evidence checklist

- [ ] `orientation-notes.md`, `doc-gaps.md`, `standup-escalation.md`, `defect.md`
- [ ] `test/orientation.test.mjs` and both test runs' output
- [ ] Branch or PR link, or `git log --oneline` output from your branch
- [ ] Partner's one-line feedback on the escalation

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Diagnosis order | Jumps to code first | Config, then logs, then code, with evidence at each step | Also notes what else the log rules out (e.g., the query itself is fine; the host is unreachable) |
| Documentation review | One gap found | Three gaps with complete notes | Flags a compliance gap too (e.g., README says nothing about running `npm test` before merging) |
| Automated checks | Checks don't run, or pass on the starter | Fail-then-pass demonstrated | Adds a fourth meaningful check (e.g., README mentions every npm script it tells you to run) |
| Source-control discipline | Commits on `main` | Branch + PR + conventional message | PR description links the defect and the doc-gap notes |
| Escalation | Vague or buried | Four parts in order; partner needed no follow-up | Under 30 seconds and names who's affected (every shopper using search) |
| Defect and known-defects hygiene | Filed without searching | Searched, filed, lifecycle to Verified | Links a related past defect and records why it is or isn't a duplicate |

## Stretch goals

- Add a check that fails if the README tells the reader to run an npm script that doesn't exist in `package.json`.
- Write the PR description as if the reviewer has never seen the incident.
- Turn your three doc-gap notes into a single README patch and ask your partner to follow it from scratch.

## Reflection prompts

- How long would this have taken if you had started by reading `src/` file by file?
- Which doc gap would have cost the *next* new hire the most time, and why?
- Your automated check hard-codes a decommissioned host list. Who should own that list, and where should it live?

## Instructor notes

- **Common pitfalls:** learners "fix" the outage locally in `.env` and never update `.env.example` or the README, so the next person hits the same wall; learners escalate with "search is weird" and only reach the impact after the partner asks.
- **Why a test on docs?** It makes the Lesson 03 habit stick: a doc-gap note that's backed by a check can't quietly drift again. Point out that this is a regression check on documentation (Lesson 05 vocabulary).
- **Adapting for time:** for a 90-minute session, supply the test file pre-written and skip milestone 6.
- **Adapting for a real legacy app:** if your program supplies a real codebase, replace the starter files with its README and config, and have learners write one check per real gap they find.
