---
lesson_id: PREAPP-W5-04
course_id: PREAPP-W5
pathway: tech-pre-apprenticeship
title: Version Control & Shipping
order: 4
kind: project
competency_ids:
  - D4-S3-C01
  - D4-S3-C02
objectives:
  - Use Git fundamentals and publish working code to GitHub with a plain-language README
  - Write a README a non-expert can use to understand and run the project
---

## Goal

Put the pipeline script you built this week under version control, publish it to GitHub as a public repository, and write a README that a non-programmer can read start to finish and use to run your script themselves.

This is the Week 5 milestone. When it is done you own a public artifact with your name on it — a URL you can put in a message to an employer, which is exactly what you have been doing for four weeks with everything else. The code being small is not the point. The point is that it exists, it runs, it is explained, and its history shows a person working in deliberate steps.

## What you are shipping

One repository containing:

- `pipeline.ts` (or `contacts.ts`) — the working script from Lessons 02 and 03.
- `README.md` — the plain-language guide described below.
- `contacts.sample.csv` — a small **fake** contact file, five rows, so anyone can run your script without your real data.
- `.gitignore` — listing at minimum your real `contacts.csv`, any `.env` file, and `node_modules`.

## Requirements

**1. A repository with real history.** Initialize Git in your project folder and build the repository up in at least **five separate commits**, each one a single coherent change with a message that says what changed and why. Not one commit called "stuff". A commit is a saved snapshot of the whole project at a moment, plus a message explaining the move — it is a checkpoint you can return to and a sentence your future teammate reads.

**2. Published to GitHub.** Create an empty public repository on GitHub named `pipeline-tools` (or better — name it for what it does), connect it as the remote, and push. Your work is visible at a public URL.

**3. Nothing private in the history.** No API tokens, no real contact names, no employer emails. Commit `contacts.sample.csv` with invented people; keep the real export out via `.gitignore`.

**4. A README a non-expert can use.** Written for a career-services colleague who has never opened a terminal. It must contain, in this order:

- **What this does** — two or three sentences, no jargon. What problem it solves for you.
- **What you need** — the runtime (Bun or Node) with a link, and the input file it expects.
- **How to run it** — the exact commands, copy-pasteable, in a fenced code block.
- **What you get** — describe the output, and show a few lines of real example output.
- **What it does not do** — the honest limits. Your CSV parser and commas is a fine example.

**5. The repository runs from a clean clone.** Someone who clones it, installs nothing but the runtime, and follows your README gets output on the first try.

## Constraints

- Command line and Git only for the version-control work. No GitHub Desktop or editor buttons this week — you need the commands in your hands.
- The script must be the one you actually wrote. A downloaded example is not the assignment.
- The README is Markdown, in the repository root, and is under roughly 400 words. Longer is not clearer.
- Keep the repository public. A private repository cannot be shown to an employer.
- Sample data must be obviously invented. No real person appears in this repository.

## Definition of done

You are done when every one of these is true, checked with your apprentice partner before you show your instructor:

- [ ] `git log --oneline` shows five or more commits with messages a stranger could follow.
- [ ] `git status` reports a clean working tree with nothing left to commit.
- [ ] The GitHub repository page loads at a public URL and shows your README rendered.
- [ ] `git log -p | grep -i token` finds nothing — no credential ever entered the history.
- [ ] Your real `contacts.csv` does not appear in the repository file list.
- [ ] Your partner clones the repository into a fresh folder, follows only the README, and gets working output without asking you a single question.
- [ ] You can explain out loud, without notes, what `init`, `add`, `commit`, and `push` each do and in what order.

That last item is assessed by conversation, not by file. If your partner has to fill in a step for you, run through it again.

## Hints

**The core sequence.** Learn it as one motion — you will run it thousands of times in an apprenticeship:

```bash
git init
git add pipeline.ts
git commit -m "Add contact pipeline script"
```

`init` creates the repository — an empty history in a hidden `.git` folder. `add` stages a file: you are choosing what goes into the *next* snapshot. `commit` takes the snapshot and attaches your message. Staging is separate from committing on purpose, so one commit can be exactly the change you mean and nothing else.

**Then connect it to GitHub.** Create the empty repository on github.com first, without a README, then:

```bash
git remote add origin https://github.com/YOURNAME/pipeline-tools.git
git branch -M main
git push -u origin main
```

`remote add origin` records where "the copy on the internet" lives. `push` sends your commits there. The `-u` on the first push remembers the destination, so later pushes are just `git push`.

**Write the `.gitignore` before your first commit.** Once a secret is committed, deleting it later does not remove it from the history — you would start the repository over. Create the file first:

```text
node_modules/
.env
contacts.csv
```

**Commit as you work, not at the end.** Good five-commit shape: add the `.gitignore`, add the script's fetch and parse steps, add the transform, add the sample CSV, add the README. Run `git status` before every commit to see exactly what you are about to save, and `git log --oneline` after to watch the history grow.

**Message style.** Present tense, says what the change does: `Add follow-up queue transform`, not `changes` or `fixed it`. If your message needs the word "and", it is probably two commits.

**Write the README last, then test it against a human.** Hand your laptop to your partner, open a fresh terminal, and have them follow it literally. Every place they hesitate is a missing step. That hesitation is the actual assignment — code that only its author can run is not shipped.

**If you get stuck on authentication**, GitHub will ask for a personal access token rather than your password. Your instructor has the setup path; ask early rather than losing an hour of lab time to it.
