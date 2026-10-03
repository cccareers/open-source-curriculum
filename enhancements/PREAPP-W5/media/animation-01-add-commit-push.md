---
course_id: PREAPP-W5
media_id: PREAPP-W5-a01
type: animation-storyboard
title: "Where Your Files Go: Add, Commit, Push"
target_runtime: "85 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - PREAPP-W5-04
objectives:
  - Use Git fundamentals and publish working code to GitHub with a plain-language README
competency_ids:
  - D4-S3-C01
---

## Concept and misconception it fixes

Misconceptions: (1) "Saving the file saves it in Git." (2) "If I delete a secret in a later commit, it's gone." The animation shows four places a file can be — working folder, staging area, local history, GitHub — and what each command moves. It ends by showing a committed token staying visible in history after deletion, which is why `.gitignore` comes first.

## Visual language (shapes, colors with color-blind-safe palette, labels)

- Four labeled zones left to right: **Your folder** (desk icon), **Staging** (a tray labeled "next snapshot"), **Local history** (a stack of photo cards, each a commit with its message), **GitHub** (a cloud with your repo URL).
- Files are paper sheets with filenames. A secret file (`.env`) has a key icon and a padlock-shaped badge.
- Palette (Okabe-Ito): blue #0072B2 for normal files, vermillion #D55E00 for secrets (plus key icon), bluish green #009E73 for ignored files (plus a "skip" icon), gray #999999 for zones.

## Scenes

| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 0-8s | Four empty zones appear, labeled. | Zones fade in left to right. | "Git has four places your work can be. Let's follow some files." |
| 2 | 8-16s | `git init` typed in a terminal strip at the bottom. Local history zone gets an empty card box labeled `.git`. | Box drops in. | "`git init` creates an empty history — a hidden `.git` folder." |
| 3 | 16-26s | Your folder holds `pipeline.ts`, `contacts.csv` (real data), `.env` (key icon). `.gitignore` sheet appears listing `contacts.csv` and `.env`. Those two get a "skip" badge. | `.gitignore` slides in; skip badges stamp onto two files. | "Before anything else: `.gitignore`. It tells Git to never pick up your real contacts or your token." |
| 4 | 26-38s | `git add pipeline.ts`. Only `pipeline.ts` slides into Staging. | One sheet moves; others stay. | "`git add` puts a file in the tray for the next snapshot. You choose exactly what goes in." |
| 5 | 38-48s | `git commit -m "Add contact pipeline script"`. Staging tray contents become a photo card in Local history, captioned with the message. | Camera-flash effect; card drops onto stack. | "`git commit` takes the snapshot and pins your message to it. Still only on your laptop." |
| 6 | 48-58s | `git push`. The stack of cards copies up into the GitHub cloud. URL label appears. | Cards fly up. | "`git push` sends your commits to GitHub. Now there's a public URL." |
| 7 | 58-75s | Alternate timeline (label "What if you skipped .gitignore?"): `.env` gets added and committed (card 2). Next, the file is deleted and a card 3 "Remove token" is committed. Camera pans back through the stack: card 2 still shows `.env` with the key visible. The cloud copy has card 2 too. | Rewind effect, then pan across cards; magnifier on card 2. | "Delete it later, and it's still in the history. Every old snapshot is kept — that's the point of Git. Once a secret is pushed, treat it as public: revoke it and start over." |
| 8 | 75-85s | Return to the clean timeline. Summary strip: `add` = choose · `commit` = snapshot · `push` = publish. | Labels fade in under each arrow. | "Choose, snapshot, publish. And ignore secrets before the first commit." |

## Interaction variant (optional)

A step-through where learners drag files between zones and type the matching command; wrong moves (e.g. trying to commit with an empty staging tray) show the real Git message ("nothing added to commit"). A free alternative: the "Learn Git Branching" style sandbox, if the program clears it.

## Production notes

- Show the exact commands from the lesson's Hints, including `git remote add origin` and `git branch -M main` as a brief insert between scenes 5 and 6 if runtime allows.
- Scene 7 VO says "revoke it." The lesson says "start the repository over"; both are true. Revoking (rotating) the token is the more important step, so flag this to the course owner as a possible lesson addition.
- Keep all filenames identical to the lesson (`pipeline.ts`, `contacts.csv`, `contacts.sample.csv`, `.env`).
