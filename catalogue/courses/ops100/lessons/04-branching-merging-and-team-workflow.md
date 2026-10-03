---
lesson_id: ops100-04
course_id: ops100
pathway: quality-assurance-software-engineer
title: Branching, Merging, and Team Workflow
order: 4
kind: lesson
competency_ids:
  - D1-S1-C04
  - D4-S1-C01
objectives:
  - Work on a shared repository using branches, merges, and pull requests
---

## Why branches exist

A branch is a movable pointer to a commit, and creating one costs almost nothing — that cheapness is the whole point. It lets several people work on the same repository at the same time without stepping on each other's uncommitted work. The team's `main` branch stays in a state that's always deployable, while every change in progress lives on its own branch until it's reviewed and ready.

```bash
git branch                       # list local branches
git switch -c fix/cart-quantity  # create and switch to a new branch
git switch main                  # switch back to main
```

(`git switch -c` is the modern equivalent of the older `git checkout -b`; both create a new branch and move you onto it. Either is fine — use whichever your team's documentation shows.)

Name branches so a teammate can guess their purpose without opening them: a short prefix for the kind of work (`fix/`, `feature/`, `chore/`) followed by a few words describing it. This is itself a source-code-management convention — D4-S1-C01 — and a team that agrees on one saves everyone time scanning a branch list.

## Working with a remote

The branches above are local until you push them. A remote — most often a GitHub-style hosted repository — is where the team's shared history actually lives:

```bash
git remote -v                    # see configured remotes (usually "origin")
git fetch origin                 # download new commits without merging them
git pull origin main             # fetch AND merge the remote's main into your current branch
git push origin fix/cart-quantity  # publish your branch so others (and a PR) can see it
```

`git fetch` and `git pull` are not the same operation, and confusing them causes real problems. `fetch` only downloads — it updates your knowledge of the remote without touching your working files, which makes it safe to run any time. `pull` fetches *and* immediately integrates, which can produce a conflict you weren't expecting. (By default it merges; some teams configure `pull.rebase` so it rebases instead. If `git pull` prints a hint about "divergent branches", Git is asking you to choose; follow your team's documented setting.) When you're not sure what a pull will do, `fetch` first and inspect with `git log origin/main --oneline` before merging.

## Merging and merge conflicts

![A feature branch diverging from main, receiving review comments, and merging back after approval](./img/git-branch-merge.png)

When a branch is ready, its changes are integrated back into `main` — usually through a pull request rather than a direct `git merge`, but the underlying mechanics are the same either way. Most merges are automatic: if you and a teammate changed different parts of the codebase, Git combines both sets of changes without asking. A conflict happens when you both changed the *same* lines, and Git needs a human to decide which version — or what combination — is correct.

A conflicted file looks like this:

```text
<<<<<<< HEAD
const shippingCost = calculateShipping(cart, region);
=======
const shippingCost = calculateShippingV2(cart);
>>>>>>> feature/new-shipping-calc
```

Everything between `<<<<<<< HEAD` and `=======` is your current branch's version; everything between `=======` and `>>>>>>> feature/new-shipping-calc` is the incoming branch's version. Resolving a conflict means editing the file down to the single correct version — which might be one side, the other, or a hand-merged combination — deleting the conflict markers entirely, then staging and committing:

```bash
git add src/checkout.ts
git commit -m "Resolve shipping calculation conflict, keep V2"
```

If you start a merge and realize you are not ready to resolve it, `git merge --abort` puts everything back the way it was before the merge began; `git status` always tells you whether you are mid-merge and which files are still conflicted.

Never resolve a conflict by guessing at code you don't understand. If the two versions represent genuinely different approaches to the same problem, that's a signal to talk to whoever wrote the other side before you pick a winner — which is exactly where this lesson's two competencies meet.

## Team workflow and communication

D1-S1-C04 — communicating and collaborating effectively with team members — is not a soft add-on to Git; it is what keeps branches from colliding in the first place. A few habits make shared-repository work far smoother:

- **Say what you're working on before you start**, especially if it touches a file others are likely to also be editing. A one-line message in a team channel ("starting on the cart-quantity fix, touching `cart.ts`") costs seconds and prevents conflicts that cost an hour.
- **Push work-in-progress branches often**, even before they're finished, so teammates can see what exists and avoid duplicating it. A branch nobody can see is a branch nobody can plan around.
- **Pull `main` regularly** into your feature branch rather than letting it drift for a week. The longer a branch diverges from `main`, the larger and harder-to-resolve its eventual conflicts become:

```bash
git switch fix/cart-quantity
git pull origin main    # bring your branch up to date with main regularly
```

- **When a conflict does happen, resolve it together if it's non-trivial.** Two people who each understand half the conflicting change will resolve it correctly far faster — and with less risk of silently reintroducing a bug — than one person guessing alone.

None of this is exclusive to developers. As a QA engineer working from a shared repository — pulling a branch to test it, or reporting a defect against a specific commit — the same discipline applies: know which branch you're on, communicate before you touch something shared, and keep your local copy current.

## Practice

1. Working with a partner (or, if working solo, by cloning your own repository into a second local folder to simulate a second contributor), each create a branch and modify the *same* line of the *same* file in two different ways.
2. Push both branches to the shared remote. Merge the first branch into `main` cleanly, then attempt to merge the second and produce a real conflict.
3. Resolve the conflict by hand, referencing the conflict-marker format shown above, and commit the resolution with a message that states what you kept and why.
4. Write two sentences describing what you (or you and your partner) would have communicated to each other *before* starting, if you'd known in advance the changes would collide — and when in a real team you'd realistically have that information.

## Check your understanding

1. Why is `git fetch` always safe to run, while `git pull` might not be?
2. In a conflict, which side is between `<<<<<<< HEAD` and `=======`?
3. Your feature branch is two weeks behind `main`. What should you have been doing, and what do you do now?

*Answers:* (1) `fetch` only downloads and updates `origin/*`; `pull` also merges (or rebases) into your branch and can produce conflicts. (2) Your current branch's version. (3) Bringing `main` into the branch regularly; now `git fetch`, inspect `git log origin/main --oneline`, merge it in, and resolve conflicts with whoever owns the other side.
