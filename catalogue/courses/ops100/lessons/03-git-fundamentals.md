---
lesson_id: ops100-03
course_id: ops100
pathway: quality-assurance-software-engineer
title: Git Fundamentals for Recording and Recovering Work
order: 3
kind: lesson
competency_ids:
  - D4-S1-C01
objectives:
  - Use Git to record, inspect, and recover work
---

## Git as a record, not a save button

It is tempting to think of Git as a fancier "save" — a way to back up files so you don't lose them. That framing will hold you back. Git's real value is that it keeps a complete, inspectable history of *why* the codebase looks the way it does. Every commit is a claim: "at this point, for this reason, the code changed like this." As a QA engineer, you will spend more time reading that history than writing to it — tracing when a behavior was introduced, understanding what a change was supposed to do before you test whether it actually does it, and following a team's source-code management conventions closely enough that your own commits are just as readable to the next person.

That last point is D4-S1-C01: applying company-specific source-code management best practices. Every team has slightly different conventions — commit message format, branch naming, how much to squash — and following them is not optional politeness. A QA engineer whose commits don't follow the team's conventions makes the history harder for everyone to read, including future-you trying to find when a regression was introduced.

## The three states, and the commit cycle

A file in a Git repository is in one of three states: modified (changed, not yet staged), staged (marked to be included in the next commit), and committed (saved permanently in the project's history). The core cycle looks like this:

```bash
git status                 # what's modified, staged, untracked?
git add <file>              # stage a specific file
git add .                   # stage everything modified/untracked in this directory
git diff                    # see unstaged changes
git diff --staged           # see what's about to be committed
git commit -m "Fix null check on empty cart"
```

Run `git status` constantly — before you stage, before you commit, and any time you're not sure what state your working directory is in. It costs nothing and it is the single most effective habit for avoiding an accidental commit of the wrong files.

### Writing a commit message that earns its keep

A commit message is documentation. "fix bug" tells a reviewer nothing six months from now. A useful message states what changed and, briefly, why:

```text
Fix cart total ignoring quantity for out-of-stock items

Out-of-stock items were being counted at quantity 1 regardless of
the cart's actual quantity field, inflating totals on partial
restocks. Now reads quantity directly before the stock check.
```

Keep the first line short (many teams enforce 50–72 characters) and use it as a summary; use the body for the reasoning a diff alone can't convey. When you review other people's pull requests in lesson 05, you will be reading exactly this kind of message to decide whether a change does what it claims — so it is worth practicing writing one now.

### Atomic commits

Bundle one logical change per commit. A commit that mixes a bug fix, a rename, and an unrelated formatting pass is much harder to review, harder to revert cleanly, and harder to bisect later. If `git status` shows changes to files that have nothing to do with each other, stage and commit them separately with `git add <specific-file>` rather than `git add .`.

## Inspecting history

Reading history well is at least as important as writing to it:

```bash
git log                          # full commit history
git log --oneline                # one line per commit, easier to scan
git log --oneline -- src/cart.ts # history of just one file
git show <commit-hash>           # full diff of a single commit
git blame src/cart.ts            # who last touched each line, and in which commit
```

`git blame` is a QA staple: when a test starts failing and you need to know when a specific line changed and who to ask about it, `git blame` points you at the exact commit — which you can then inspect with `git show` to read the reasoning.

## Undoing things: three tools that are not interchangeable

Git gives you several ways to undo work, and using the wrong one on a shared branch can cause real damage. Know the difference before you reach for any of them.

**`git restore`** discards uncommitted changes in your working directory — use it for a file you haven't staged or committed yet and want to throw away:

```bash
git restore src/cart.ts          # discard uncommitted changes to one file
git restore --staged src/cart.ts # unstage a file without discarding its changes
```

**`git revert`** creates a *new* commit that undoes a previous commit's changes, leaving history intact. This is the safe option for anything already pushed and shared:

```bash
git revert <commit-hash>
```

**`git reset`** moves your branch pointer to an earlier commit, and depending on the flag, can discard commits from history entirely (`--hard`). Because it rewrites history, it is dangerous on any branch other people are also working from:

```bash
git reset --soft <commit-hash>   # move the pointer, keep changes staged
git reset --hard <commit-hash>   # move the pointer, discard changes entirely — use with care
```

As a working rule: on your own local, unshared branch, `reset` is fine. On anything shared or already pushed, prefer `revert` — it preserves the record of what happened instead of erasing it, which matters for anyone auditing the history later.

## Recovering work you thought you lost

Git rarely deletes anything as completely as it looks like it does. `git stash` lets you set aside uncommitted work without committing it, useful when you need to switch tasks mid-change:

```bash
git stash            # shelve current changes
git stash list        # see what's shelved
git stash pop         # reapply the most recent stash and remove it from the list
```

Even a "lost" commit — one orphaned by a hard reset or an accidental branch deletion — is usually still recoverable through the reflog, Git's local log of where your branch pointers have been:

```bash
git reflog
# HEAD@{0} git reset --hard HEAD~1
# HEAD@{1} commit: Fix cart total ignoring quantity
git reset --hard HEAD@{1}    # move back to the commit that looked lost
```

The reflog is local to your machine and expires after a period of disuse, so it is not a substitute for pushing important work — but it is exactly the tool for the moment right after a mistake, when panic is the biggest risk to good judgment. Knowing `git reflog` exists, calmly, before you need it, is what separates "recover in thirty seconds" from "lose an afternoon."

## Practice

1. Initialize a new repository in a scratch directory (`git init`), create a file, and make three separate commits, each with a message that follows the summary-line-plus-body convention shown above.
2. Make an uncommitted change to that file, run `git diff` to view it, then use `git restore` to discard it and confirm with `git status` that your working directory is clean again.
3. Use `git reset --hard` to move your branch back to your first commit, confirm with `git log --oneline` that the later commits are gone, then use `git reflog` to find and recover them with `git reset --hard`.
4. Make one more commit, then undo it with `git revert` instead of `git reset`. Run `git log --oneline` and explain, in a sentence, how the history produced by `revert` differs from what `reset --hard` would have produced.
