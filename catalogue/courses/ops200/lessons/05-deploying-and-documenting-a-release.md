---
lesson_id: ops200-05
course_id: ops200
pathway: software-developer
title: Deploying and Documenting a Release
order: 5
kind: lesson
competency_ids:
  - D4-S1-C03
  - D4-S1-C04
objectives:
  - Document a release so its changes can be traced
---

## From artifact to release

The pipeline can now build a verified artifact and push it to a platform. That is a deploy. A **release** is more than that: it is a deploy that someone can account for afterwards.

The difference shows up on the day something is wrong. Support reports that the events list has been showing the wrong dates since some point on Tuesday. The questions that follow are always the same ones. What is running right now? When did it go out? What changed in it? Who checked it, and what did they check? What is safe to change while we investigate? Can we go back?

If your project can answer those in two minutes, it has releases. If answering means scrolling through commit history guessing at timestamps, it has deploys. The gap between the two is documentation, and this lesson is about writing it — not as paperwork after the fact, but as a set of small artifacts produced along the way.

The chain you are building looks like this: a commit is described by its message, gathered into a pull request that carries the change notes, tagged with a version, built by a pipeline run, recorded in a changelog, summarized in release notes, verified against a test record, and reported by the running application itself. Every link points at the next. Break any one of them and tracing stops there.

![The chain linking a commit to a pull request, a version tag, a pipeline run, release notes, and the version reported by the running application](./img/release-traceability-chain.png)

## Version numbers that mean something

A release needs a name, and the name should carry information. **Semantic versioning** uses three numbers, `MAJOR.MINOR.PATCH`:

- **PATCH** — bug fixes only, no behavior anyone depends on has changed. `1.4.2` to `1.4.3`.
- **MINOR** — new functionality added, existing behavior still works. `1.4.3` to `1.5.0`.
- **MAJOR** — something that previously worked no longer works the same way. `1.5.0` to `2.0.0`.

The promise a version makes is about **compatibility**, and the audience for that promise is whoever depends on you: another team's service calling your API, a front end built against a response shape, a script parsing your output. Bumping the major version is how you tell them to read carefully before upgrading.

npm manages the number and the tag together:

```bash
npm version patch -m "release: v%s"
git push --follow-tags
```

That updates `package.json`, commits the change, and creates an annotated git tag such as `v1.4.3`. `--follow-tags` pushes the tag along with the commit — forget it and the tag stays on your laptop, which is the most common way this chain breaks on its first day.

A tag is the anchor for everything else. It names a specific commit permanently, it gives the changelog a heading, and it gives you a comparison range:

```bash
git log --oneline v1.4.2..v1.4.3
git diff v1.4.2..v1.4.3 --stat
```

Two commands that answer "what is in this release" precisely. Everything below is a human-readable rendering of what those commands already know.

## Making the running system say what it is

Documentation that lives only in a repository leaves one question unanswered: which release is actually running right now? Answer it by baking the identity into the artifact and exposing it.

In the pipeline, pass the commit and version into the build environment:

```yaml
      - name: Build
        env:
          APP_VERSION: ${{ github.ref_name }}
          GIT_SHA: ${{ github.sha }}
          BUILT_AT: ${{ github.event.repository.updated_at }}
        run: npm run build
```

And have the service report them:

```javascript
// api/src/routes/health.js
import process from "node:process";

export function health(req, res) {
  res.json({
    status: "ok",
    version: process.env.APP_VERSION ?? "dev",
    commit: (process.env.GIT_SHA ?? "unknown").slice(0, 7),
    builtAt: process.env.BUILT_AT ?? null,
    uptimeSeconds: Math.round(process.uptime()),
  });
}
```

```bash
curl -s https://events-board.example.com/health
```

```json
{
  "status": "ok",
  "version": "v1.4.3",
  "commit": "b7a4e2d",
  "builtAt": "2026-07-21T14:02:11Z",
  "uptimeSeconds": 4021
}
```

Ten lines of code, and the running system now answers the first question by itself. That commit hash is the key to every other record: it finds the pipeline run, the pull request, the change notes, and the tag. Add the same values to your structured logs and to any error report, and an exception in production arrives already labelled with the build that produced it.

## Change notes a teammate can follow

The pull request is where the substantive record of a change lives, because it is attached to the diff and it is read at the moment someone is deciding whether the change is safe. Writing it well is the core of this lesson.

A commit message says what changed. **Change notes say what a person needs to know in order to work near your change afterwards.** Those are different documents with different readers: the second one is written for the teammate who, three months from now, is debugging something adjacent and has no memory of this week.

Use a template so nothing is left out:

```text
## What changed

Event dates are now stored and returned as ISO 8601 date-only strings
("2026-08-02") instead of full timestamps. `GET /api/events` and
`GET /api/events/:id` both return the new shape.

## Why

Timestamps were being rendered in the browser's local timezone, so a
7pm event in Chicago displayed as the previous day for users east of
UTC. Dates have no time component in this product, so carrying one was
the defect.

## Files and functions touched

- `api/src/events.js` — `toEventDto()` now formats `event.startsAt`
  with `toISODate()`; `parseEventInput()` accepts both shapes during
  the transition.
- `api/src/lib/dates.js` — new `toISODate()` helper.
- `web/src/components/EventCard.jsx` — removed the local `formatDate()`
  wrapper, which was compensating for the old shape.

## Must not be touched

- `event.startsAt` in the database keeps its `timestamptz` column type.
  Only the API representation changed. Do not migrate the column; the
  reporting job in the analytics repo reads it directly and expects a
  timestamp.
- `parseEventInput()` still accepts full timestamps on input. Do not
  remove that branch until the mobile client ships its 2.3 release —
  tracked in EB-198.
- The `/api/events` response is consumed by the partner widget. Adding
  fields is safe; renaming or removing them is not.

## How to verify

1. `curl -s $BASE/api/events | jq '.[0].date'` returns `"2026-08-02"`.
2. Set the browser timezone to UTC+10 and confirm the card shows the
   same date as in UTC-6.
3. `npm test -- events` covers both input shapes.

## Rollback

Revert the merge commit and redeploy the previous tag. No data
migration ran, so there is nothing to undo in the database.

Refs: EB-142
```

Every section earns its place. **What changed** in plain language, because a reviewer reading a diff of forty files needs the summary first. **Why**, because the reason is the thing the diff cannot show and the thing that decides whether a future change is safe. **Files and functions touched** with the specific names, so a search for a symptom lands on this record. **How to verify**, so a reviewer or a tester repeats your checks instead of inventing new ones. And **rollback**, decided while you are calm rather than during an incident.

## The section that saves people: what must not be touched

The "must not be touched" section deserves separate attention, because it is the one most often missing and the one most expensive to omit.

You know things while writing a change that are invisible in the code afterwards. That a function looks redundant but is called by another team. That a column cannot be renamed because a report depends on it. That a compatibility branch exists for a client that has not upgraded yet. That an ordering looks arbitrary but is load-bearing. Nobody reading the file later can infer any of that, and the natural instinct of a competent developer meeting apparently dead code is to delete it.

So write it down, and be specific about three things each time: **what** must stay as it is, **why**, and **when the constraint expires**. That last part matters — a constraint with no end date becomes permanent folklore, and six years later nobody dares touch a line whose reason has long since evaporated. "Until the mobile client ships 2.3, tracked in EB-198" is a constraint someone can eventually retire.

Where the constraint is important enough, back the note with something enforceable: a test that fails if the response field disappears, a comment at the definition pointing at the ticket, a lint rule. A note is a message to a person; a test is a message to the pipeline. Use both for anything that would cause an outage.

## The changelog

The changelog is the project's cumulative record, one entry per release, newest first. Keep it as `CHANGELOG.md` at the repository root, in the widely used Keep a Changelog format:

```markdown
## [Unreleased]

## [1.4.3] - 2026-07-21

### Fixed
- Event dates no longer shift by a day for users in timezones east of
  UTC. Dates are returned as date-only strings. (EB-142)
- The health endpoint reports the build's commit SHA instead of
  "unknown" when deployed from a tag. (EB-151)

### Changed
- `GET /api/events` returns `date` as `YYYY-MM-DD`. The previous
  timestamp form is still accepted on input until the 1.6 release.

## [1.4.2] - 2026-07-14

### Added
- Health endpoint at `/health` reporting version, commit, and uptime.

### Security
- Updated `send` to 0.19.1 to pick up the path traversal fix.
```

The conventions are worth following exactly, because their value comes from being the same everywhere. Newest release at the top. One heading per version with its date. Entries grouped under `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, and `Security`. An `Unreleased` section at the top that you append to as you merge, so cutting a release is renaming a heading rather than reconstructing a week of work from git.

Write entries for the reader, not from the diff. "Fixed a null check in `toEventDto`" describes your code; "event dates no longer shift by a day for users east of UTC" describes what changed for someone using the product. Include the ticket reference so the entry links back to the full change notes.

Anything with a compatibility impact goes under `Changed` with an explicit note about what still works and for how long. That is where a developer integrating with you will look, and it is the difference between a breaking change and a managed one.

## Release notes, and who reads them

Changelog and release notes are related but not the same document, and conflating them produces something that serves neither reader.

The **changelog** is for developers. It is complete, it is technical, it lives in the repository, and it accumulates.

**Release notes** are for the people affected by this particular release — support staff, the product owner, a client, sometimes end users. They cover one release, they lead with impact rather than implementation, and they say what those readers must do.

```markdown
# Events Board v1.4.3 — 21 July 2026

**Summary:** Fixes the date display problem reported by users outside
the central US timezone.

**What is fixed**
- Event dates now show the same day for every visitor regardless of
  their timezone. Previously, visitors east of UTC could see an event
  listed one day earlier than it actually occurs.

**Who is affected:** All users. No action required — the correction
applies automatically on next page load.

**Known limitations:** Cached pages may show the old date for up to
five minutes.

**Deployed:** 2026-07-21 14:02 UTC · commit b7a4e2d · pipeline run #418
```

Short, plain, and specific about impact. The footer is the traceability link: any reader can hand that line to a developer and the developer can find everything.

## Recording integration and test progress

The other half of a defensible release is the record of what was actually verified. "The tests passed" is a claim about automation; a release record is a claim about the whole change, including the parts automation cannot see.

Keep a release checklist with the tag, filled in as you go rather than reconstructed afterwards:

```markdown
# Release record — v1.4.3

Build: pipeline run #418 · commit b7a4e2d · artifact release-b7a4e2d
Target: production · deployed 2026-07-21 14:02 UTC by M. Okafor

## Automated checks
| Check | Result | Notes |
| --- | --- | --- |
| Lint | pass | run #418 |
| Unit tests (142) | pass | 0 skipped |
| Build | pass | web bundle 143 kB, +0.4 kB |
| Accessibility scan | pass | 0 new violations |

## Integration checks
| # | Check | Environment | Result | By | Notes |
| --- | --- | --- | --- | --- | --- |
| 1 | Events list renders with API data | staging | pass | MO | |
| 2 | Date correct in UTC+10 and UTC-6 | staging | pass | MO | reproduced original defect first |
| 3 | Partner widget still parses response | staging | pass | RK | field added, none removed |
| 4 | Mobile client 2.2 posts timestamps | staging | pass | RK | compatibility branch exercised |
| 5 | Health endpoint reports version | production | pass | MO | v1.4.3 / b7a4e2d |
| 6 | Smoke: create, list, open an event | production | pass | MO | |

## Defects found
| ID | Severity | Status | Notes |
| --- | --- | --- | --- |
| EB-203 | low | open, deferred | Empty-state text overlaps at 320px. Pre-existing, unrelated to this change. |

## Outstanding
- Mobile 2.3 must ship before the compatibility branch is removed (EB-198).

## Sign-off
Integration checks complete, one low-severity defect deferred with the
product owner's agreement. Release approved to remain live.
```

Four things make this record useful rather than ceremonial.

**Every row names a build.** Checks against an unnamed build are worthless, because the thing you tested may not be the thing that shipped. The artifact name from lesson 04 and the commit SHA from your health endpoint are what tie the record to reality.

**It distinguishes automated from manual.** The pipeline covers regression; a person covers the things nobody wrote a test for — the timezone case, the partner integration, the visual check. Separating them shows where your real coverage is and where it depends on someone remembering.

**It names who checked.** Not for blame. It is so that a question about check 3 goes to the person who ran it instead of to a group chat.

**Defects are recorded even when deferred.** An issue found and consciously accepted is a decision; an issue found and forgotten is a surprise later. Each one gets an ID, a severity, and an owner, and the deferred ones say who agreed to defer.

Report progress as it happens, not only at the end. On most teams that means a short status in the release channel or ticket as each phase completes — checks passing, deploy started, deploy complete with the version, smoke tests done. A five-line update costs nothing and stops three people from asking whether it went out. If something blocks, say so immediately with what you have tried; a release that is stuck and silent is the single most disruptive state a team can be in.

## Cutting the release

Putting it together, releasing the events board is a short sequence:

```bash
git checkout main && git pull --ff-only
npm run verify

# 1. move Unreleased entries into a dated version heading in CHANGELOG.md
git commit -am "docs: changelog for v1.4.3"

# 2. tag and push
npm version patch -m "release: v%s"
git push --follow-tags

# 3. the pipeline builds, uploads release-<sha>, and deploys

# 4. confirm what is running
curl -s https://events-board.example.com/health

# 5. fill in the release record and publish the release notes
```

Deploy early in the day and early in the week, when the people who understand the change are available. A Friday evening deploy is not brave; it is a decision to debug alone.

## Practice

Cut a documented, traceable release of the events board.

1. Make a small, real change on a branch — the date-handling fix, or any change that alters something a caller can observe.
2. Write the pull request description using the full change-notes template: what changed, why, files and functions touched with names, must not be touched, how to verify, and rollback.
3. In the "must not be touched" section, record at least two genuine constraints from your own codebase. For each, state what, why, and when the constraint expires. Add a test that fails if one of them is violated, and reference that test in the note.
4. Add `APP_VERSION`, `GIT_SHA`, and `BUILT_AT` to the build environment in your pipeline and expose them from `/health`. Deploy and paste the live response into your record.
5. Add an `Unreleased` section to `CHANGELOG.md` and write your entry under the correct heading, phrased for a reader rather than from the diff, with the ticket reference.
6. Cut the version with `npm version` and push with `--follow-tags`. Confirm the tag exists on the remote, then run `git log --oneline` over the range between the previous tag and this one and check that every commit in the range is represented in the changelog.
7. Move the `Unreleased` entries under a dated version heading and commit that as part of the release.
8. Write release notes for a non-developer audience: summary, what changed, who is affected, what they must do, known limitations, and a footer with the date, commit, and pipeline run number.
9. Fill in a release record with automated and integration check tables. Include at least four integration checks that automation does not cover, each naming the environment, the result, and who ran it. One of them must be a check you first ran against the previous build to confirm the defect existed.
10. Record at least one defect you found — even a trivial one — with an ID, a severity, and a decision to fix or defer.
11. Post three short progress updates as you go: checks green, deploy started, deploy verified with the version now live.
12. Practice the rollback path. Redeploy the previous tag, confirm `/health` reports the older version, then roll forward again. Time both and record the numbers in the release record.
13. Hand your release record and change notes to another learner and ask them to answer, using only those documents: what is running in production, what changed in it, what they are not allowed to modify, and how to undo it. Note anything they could not answer and fix the gap.

**Deliverable:** a merged pull request with complete change notes, a tagged release, a `CHANGELOG.md` entry, published release notes, and a filled-in release record covering automated checks, manual integration checks, defects, and a timed rollback rehearsal.
