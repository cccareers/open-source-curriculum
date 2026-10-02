---
lesson_id: web102-03
course_id: web102
pathway: software-developer
title: Source Control for Project Work
order: 3
kind: lesson
competency_ids:
  - D5-S1-C01
objectives:
  - Use a team source-control workflow to manage project work
---

## Why a team has a workflow at all

You can use git alone as a very good undo button. That is not what this lesson is about. On a team, source control is the mechanism by which several people change the same files without destroying each other's work, and by which anybody can answer three questions at any moment: what is on the shared branch right now, who changed this line and why, and what has been reviewed.

That is why teams have a *workflow* — a small set of agreed rules about branches, commits, review, and merging — rather than everybody using git however they like. The rules differ between companies and they are rarely written down completely. Your job as an apprentice is not to invent one and it is definitely not to import the one from your last project. It is to find out what this team does, follow it exactly, and ask when the rules do not cover your situation.

So before your first commit on any project, find the answers to these:

- **Is there a `CONTRIBUTING.md`, a `README` section, or a wiki page describing the workflow?** Read it first. If one exists and you did not follow it, that is on you.
- **What is the shared branch called, and can you push to it directly?** `main` on most projects, `master` or `develop` on older ones. On most teams you cannot push to it and should not want to.
- **How are branches named?** `feature/shift-board`, `mrs/shift-board`, `WEB-214-shift-board` — there is usually a convention, often tied to a ticket number.
- **Do commits need a particular format?** Some teams require a ticket id in the message. Some require a `type:` prefix. Some do not care.
- **How does work get reviewed and merged?** A pull request with one approval is the common answer, but the number of approvals, whether checks must pass, and whether you or the reviewer clicks merge all vary.
- **Merge, squash, or rebase?** Teams have strong preferences here and the repository settings usually enforce them.

Ten minutes of asking beats a week of doing it your own way. Nobody has ever thought less of an apprentice for asking what the branching convention is. Plenty have thought less of one who force-pushed over somebody's afternoon.

## The unit of work is the commit

A commit is a snapshot of the whole project plus a message explaining the change. The mechanics are three commands and you have probably run them:

```bash
git status
git add js/render.js
git commit -m "Render the shift list from the in-memory array"
```

`git status` is the one to run constantly. It tells you what branch you are on, what has changed, and what is staged. Running it before every `add` and every `commit` is the habit that prevents most accidents.

The interesting question is not how to commit but *what* to commit. A commit should be one complete change: the code, the markup, and the style that make one thing true. That definition has two edges and both matter.

**Too big** looks like one commit at the end of the day called "work on shift board" containing the render function, a bug fix, a rename, and a change to `.gitignore`. It cannot be reviewed — a reviewer has to hold four unrelated changes in their head at once — and it cannot be undone, because backing out the bug fix means backing out the render function too.

**Too small** looks like "wip", "wip 2", "fix typo", "fix typo again". Each commit leaves the project in a state that does not work, so the history is useless for finding when something broke.

The test is: *would this commit, on its own, leave the project working and be describable in one sentence?* If yes, commit it. If you find yourself writing "and" in the message, you probably have two commits.

The message matters more than people expect, because it is the only place your reasoning survives. The convention that works nearly everywhere:

```text
Short summary in the imperative, under about 70 characters

Why this change was needed, and anything a reader would find surprising
about how it was done. Wrap the lines. Skip this whole paragraph when the
summary genuinely says everything.
```

Imperative means "Add the empty state", not "Added" or "Adds" — it reads as an instruction the commit carries out, and it matches what git itself generates for merges and reverts.

Some good and bad summaries from real projects:

- `fix` — Worthless. Fixes what?
- `Fixed bug where the list didnt update` — Which list, and why did it not update?
- `Update the rendered list after a shift is released` — Good. Says what is now true.
- `Store claims in localStorage under a versioned key` — Good, and the word "versioned" tells a reader something they would otherwise have to discover.

What you write in the body is where the real value is. Code shows *what*; only the message shows *why*. "Sort by date descending because the coordinator scrolls from the newest shift" is a sentence that will save somebody a bad refactor two years from now.

Two rules that are not negotiable on any team.

**Never commit secrets.** API keys, tokens, passwords, `.env` files. Git history is forever and it is copied to every clone; deleting the file in a later commit does not remove it. If it happens, tell somebody immediately and treat the secret as compromised.

**Never commit generated or machine-local files.** `node_modules/`, build output, `.DS_Store`, editor settings. That is what `.gitignore` is for, and it belongs in the repository from the first commit:

```text
node_modules/
dist/
.env
.DS_Store
*.log
```

The lockfile is the exception people get wrong: `package-lock.json` *is* committed, because it is how everyone gets identical dependency versions.

## Branches, and what they are for

A branch is a movable name pointing at a commit. That is the entire concept — the reason it feels bigger is what teams use it for.

The shared branch, usually `main`, is the version of the project everyone agrees is good. On most teams it is protected: you cannot push to it directly, and changes arrive only through review. Treat it as read-only even when the tooling would let you write.

Your work happens on a branch you create from `main`:

```bash
git switch main
git pull
git switch -c feature/shift-claim
```

Three commands, and the middle one is the one people forget. Branching from a stale `main` means you are building on last week's code and will discover it at merge time.

![A feature branch created from main, receiving three commits, then merging back through a reviewed pull request](./img/branch-and-merge-flow.png)

**One branch per increment.** This is where lesson 02's plan earns its keep: the rows in your work-plan table are your branches. Increment 3 becomes `feature/release-a-shift`, gets two or three commits, gets reviewed, and merges. Then increment 4 branches fresh from the updated `main`.

Branches that live a long time are the main source of pain in this workflow, and the reason is arithmetic: the longer your branch is open, the more `main` moves underneath it, and the more of somebody else's work you have to reconcile with yours. A branch open for a day is usually trivial to merge. A branch open for three weeks is an afternoon of conflicts. Small increments are not just good planning — they are what makes the merge cheap.

Keep the name descriptive and lowercase-hyphenated after whatever prefix the team uses. `feature/shift-claim` tells everyone in the branch list what you are doing. `mikes-branch` and `fix2` tell them nothing, and branch lists on real projects have fifty entries.

Push your branch early, even before it is finished:

```bash
git push -u origin feature/shift-claim
```

The `-u` sets the upstream so later pushes are just `git push`. Pushing early means your work exists somewhere other than one laptop, and it means a teammate can see what you are up to without asking.

## Keeping up with the shared branch

While you work, other people merge things into `main`. You need their changes, and you need to find out about conflicts on your branch rather than in the merge.

Update from `main` at least daily:

```bash
git switch main
git pull
git switch feature/shift-claim
git merge main
```

That brings `main`'s new commits into your branch and creates a merge commit. Some teams prefer that you rebase instead:

```bash
git fetch origin
git rebase origin/main
```

Rebasing replays your commits on top of the current `main`, producing a straight line of history with no merge commits. It reads more cleanly. It also **rewrites your commits**, which leads directly to the one rule you must not break:

**Never rebase or force-push a branch somebody else is working on.** Rewriting history that another person has already pulled means their git and your git now disagree about what happened, and untangling that costs someone an afternoon. On your own unshared feature branch, rebasing is fine and often expected. On `main`, or on a branch you are pairing on, it is not.

Which one your team uses is a team decision, not a personal preference. Ask, then do that.

### When a conflict happens

A conflict means two branches changed the same lines and git will not guess. It is not an error and it is not a sign you did something wrong. Git marks the file:

```text
<<<<<<< HEAD
  shifts.sort((a, b) => a.startsAt - b.startsAt);
=======
  shifts.sort((a, b) => b.startsAt - a.startsAt);
>>>>>>> main
```

The top block is your branch, the bottom is what you are merging in. Your job is to produce the correct final code — which is sometimes one side, sometimes the other, and quite often neither. Delete all three marker lines, leave the code you want, then:

```bash
git add js/render.js
git commit
```

Two failure modes to avoid. First, **do not resolve a conflict by deleting the other person's work because it is in your way.** If you do not understand why their line is there, go ask them; it takes two minutes and they will tell you. Second, **do not leave marker lines in the file.** `<<<<<<<` in committed source is an instantly recognizable sign of a careless merge, and it usually breaks the file outright. After resolving, reload the page and confirm the feature still works before you push — a conflict resolved to something syntactically valid but behaviorally wrong is the worst kind, because nothing complains.

If you get badly lost mid-merge, `git merge --abort` puts everything back the way it was. Knowing that escape hatch exists makes people much braver about attempting the merge.

## Review, and getting your work merged

On nearly every team, work reaches the shared branch through a pull request: you push your branch, open a request to merge it into `main`, somebody reads it, and it merges once approved.

Reviewers are doing you a favor with limited time, so make the request easy to read.

**Keep it small.** A 100-line pull request gets a careful review. A 2,000-line one gets "looks good to me", which is not a review, it is a surrender. This is another reason increments are sized to a day.

**Write a description that answers three questions:** what changed, why, and how the reviewer can check it. Concretely:

```text
Add shift claiming

Increment 2 of PLAN.md. Claiming writes to the in-memory array and re-renders;
persistence is increment 4 and deliberately not here.

To check: serve the folder, click "Claim" on any open shift, confirm the row
moves to the claimed list and the button state updates. Claiming twice quickly
should not produce two rows.

Known gap: the empty state is still the placeholder text, tracked in increment 5.
```

That takes ninety seconds to write and saves the reviewer ten minutes of reverse-engineering. Naming the known gap explicitly is what stops a reviewer from filing it as a defect.

**Review your own diff before anyone else does.** Open the changed-files view and read every line as though a stranger wrote it. You will find leftover `console.log` calls, commented-out code, an accidentally committed file, a variable named `x`. Finding those yourself is free; having a reviewer find them costs you a round trip and some credibility.

**Respond to every comment.** Fix it, or explain why not. "Good catch, fixed in a1b2c3d" and "I left this because the coordinator asked for it — see the assumption in PLAN.md" are both complete responses. Silence is not. Disagreeing with a reviewer is allowed and expected; doing it with a reason is the whole skill.

**Push follow-up commits rather than amending, while review is in progress.** A reviewer who already read your branch needs to see what changed since; rewriting the commits they read makes that impossible. Squashing at merge time, if the team squashes, cleans it up afterwards.

When it merges, delete the branch. Merged branches accumulate, and a branch list full of dead names makes it hard to see the live work.

Then, when you review someone else's: be specific, be kind, and separate "this is wrong" from "I would have done it differently." The second is not a reason to block a merge.

## Reading the history, and undoing things

The history is a tool, not an archive. Four commands cover almost everything you will need on a project this size.

```bash
git log --oneline --graph -20
```

The last twenty commits with the branch structure drawn. The fastest way to understand what has been happening.

```bash
git log --oneline -- js/render.js
```

Every commit that touched one file. When you want to know how a file got the way it is.

```bash
git blame js/render.js
```

Every line annotated with the commit and author that last changed it. The name is unfortunate; the purpose is not blame, it is finding the commit whose message explains a line you do not understand. When you are trying to work out why a piece of code exists, this plus that commit's message is usually the whole answer.

```bash
git show a1b2c3d
```

The full diff of one commit.

For undoing, know the difference between these three, because using the wrong one is how work disappears.

- **`git restore <file>`** throws away uncommitted changes to a file. The changes are not recoverable. Run `git status` first, every time.
- **`git revert <commit>`** creates a *new* commit undoing an old one. Nothing is rewritten, so this is the safe choice for anything already pushed or shared. This is what you use when something merged to `main` turns out to be broken.
- **`git reset`** moves the branch pointer, rewriting history. Useful on your own local unshared commits. Never on a shared branch.

And the safety net worth knowing before you need it: `git reflog` lists every position your branch has been in recently, including ones no longer reachable. Commits that seem lost after a bad reset are usually sitting right there. Very little committed work is genuinely unrecoverable — which is another argument for committing often.

## Practice

Work through a full increment cycle on a repository of your own. If your `PLAN.md` from lesson 02 lives in a repository, use that one; otherwise create a repository containing a single `index.html` that renders a hard-coded list of three shifts.

1. Initialize the repository with a `.gitignore` covering `node_modules/`, `.env`, `.DS_Store`, and log files, and commit it as the first commit with a real message. Push it to a remote you control.
2. Write a `CONTRIBUTING.md` of no more than fifteen lines stating your branch naming convention, your commit message format, whether you merge or rebase, and what must be true before a branch can merge. This is you deciding a workflow so you can practice following one — treat it as binding for the rest of the exercise.
3. Create a branch for one increment from your plan, following your own naming convention. Push it with `-u` before writing any code.
4. Make **at least three separate commits** on that branch, each one a complete change with an imperative summary. At least one must have a body paragraph explaining a decision that is not obvious from the diff.
5. Simulate a conflict deliberately. On `main`, change one line of `index.html` and commit. On your branch, change the same line differently and commit. Merge `main` into your branch, resolve the conflict to the code that is actually correct, verify the page still renders in the browser, and commit the resolution. Then run `git log --oneline --graph -10` and save the output.
6. Open a pull request from your branch into `main` with a description containing the three parts described above: what changed, why, and how to check it. Before requesting review, read your own diff line by line and fix at least one thing you find. Note in the pull request what you caught.
7. Have another apprentice review it and leave at least two comments. Respond to both — fix one and explain the other. Then merge it using the strategy your `CONTRIBUTING.md` specifies, and delete the branch.
8. Break something on purpose: commit an obviously wrong change to `main`, then undo it with `git revert` rather than `git reset`. In one paragraph in `NOTES.md`, explain why `revert` was the right tool given that the commit was already pushed.
9. Use `git blame` on `index.html` to find which commit introduced one specific line, then `git show` that commit and read its message. Write one sentence in `NOTES.md` about whether your own commit message from step 4 was actually useful to your future self.

**Deliverable:** a pushed repository with a committed `.gitignore` and `CONTRIBUTING.md`, one merged and deleted feature branch with at least three well-formed commits, a resolved conflict in the history, a reviewed pull request with your responses to both comments, a revert commit, and a `NOTES.md` holding your `git log --graph` output and the two short write-ups.
