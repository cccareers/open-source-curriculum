---
course_id: net260
media_id: net260-a02
type: animation-storyboard
title: "Gates and Detectors: Following One Commit From Laptop to Production"
target_runtime: "110 sec"
suggested_tool: "After Effects"
related_lessons:
  - net260-09
  - net260-10
objectives:
  - Insert automated security checks into a delivery pipeline at the stage where each is effective
  - Deploy an application to a cloud environment using repeatable, reviewed configuration
competency_ids:
  - D6-S1-C04
---

## Concept and misconception it fixes

Misconception: "More checks in the blocking path means more security." The animation follows commits through lesson 09's stages and makes two points visible:

1. Each check sits where it is fast enough to block, or else it becomes a ticket-raising detector after deploy.
2. The artifact that passed the gates in staging is promoted by digest, so production runs exactly what was tested.

A final beat shows what no gate catches: broken access control.

## Visual language

- A horizontal conveyor with stations: pre-commit → PR → build → pre-deploy → deploy → post-deploy, and a branch track to staging and prod.
- The commit is a parcel. Defects ride on it as small icons: a key (secret), a cracked box (vulnerable dependency), an open door (0.0.0.0/0 rule), a crown (container runs as root), a missing wax seal (unsigned image).
- Gates are barriers that can drop. Detectors are cameras that print tickets.
- Each station shows a stopwatch with its typical feedback time (seconds; 1–3 min; 3–10 min; seconds; —; 10–40 min).
- Palette (Okabe-Ito): bluish green #009E73 for pass, vermillion #D55E00 for block, sky blue #56B4E9 for tickets, yellow #F0E442 for a stopwatch that is running. Every icon is also labelled with text.

## Scenes

| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 8 s | A laptop pushes parcel #1 carrying a key icon. The pre-commit station flashes "secret detected (redacted)", but a "skip hook" lever is pulled and it continues. | Lever animation. | "Pre-commit hooks catch secrets in seconds, but a developer can skip them." |
| 2 | 10 s | At the PR station, the full-history secret scan drops the barrier ✗. A side panel shows "Rotate → check audit log → clean history" in order. | Barrier drops. | "So CI scans the full history and blocks. Removing the commit isn't remediation: rotate first, check the logs, then clean history." |
| 3 | 12 s | Parcel #2 carries a cracked box (dependency) and an open door (IaC rule 22 → 0.0.0.0/0). At the PR station, SCA ✗ and the IaC scan ✗; the stopwatch reads "~2 min". | Two barriers drop in sequence. | "Dependency scanning and IaC scanning run on the pull request. The open SSH rule never becomes a real security group; it becomes a failed build." |
| 4 | 12 s | Parcel #3 has a crown (runs as root). The build station builds the image and scans it; the image policy blocks it ✗ ("runs as root; no USER"). | Crown icon flashes. | "At build: build the image, scan it, generate the SBOM. The image policy stops a root container." |
| 5 | 12 s | Clean parcel #4 passes build. A wax seal is stamped on, and the label changes from `:a1b2c3` to `@sha256:7f3c…`. | Seal stamp. | "A clean commit is built, scanned, and then signed. The signature means it came from our pipeline and passed our gates." |
| 6 | 10 s | A rogue parcel without a seal (dropped in by a "stolen registry credential" hand) arrives at pre-deploy. Signature verification ✗. | Hand drops parcel; barrier. | "Someone with stolen registry credentials can push an image, but they can't sign it as our pipeline. Deploy refuses it." |
| 7 | 14 s | The sealed parcel deploys to **staging**. A post-deploy camera (DAST, posture scan) prints a ticket rather than blocking; the stopwatch reads "40 min". | Camera flash, ticket prints. | "After deploy, DAST and posture scans are detectors. They take too long to block every release, so they raise tickets." |
| 8 | 14 s | Promotion: the same parcel, digest label unchanged, moves to **prod** after a 24 h soak and two approvals (two stamps, neither by the author). A ghost "rebuild from source" path is shown greyed out with the label "never tested". | Parcel slides along the branch track. | "Promote the artifact, not the source. Production runs the exact digest that was tested, approved by two people who didn't write it." |
| 9 | 12 s | In production, a person icon (user B) requests `/api/patients/4471`, which belongs to user A, and gets 200 OK. Every gate above shows green ✓. Caption: "No gate can know who owns record 4471." | Quiet beat; gates glow green. | "Every gate passed, and the app still leaks records across accounts. Broken access control is invisible to scanners. That's what assessment, design review, and runtime logging are for." |
| 10 | 6 s | Summary: "Block where it's fast · Ticket where it's slow · Promote by digest · Humans for what tools can't see." | Text stack. | — |

## Interaction variant

A drag-and-drop placement game. Learners place the eleven checks from lesson 09, Exercise 1, onto stations. Feedback shows the stopwatch: a check placed too early fails because it lacks its input (DAST before deploy); one placed too late gives feedback after the damage is done (secret scan after deploy). A second mode lets them toggle "blocking" per station and shows a simulated "gate disabled after N weeks" counter when a slow check blocks.

## Production notes

- Stage names and timings come from lesson 09's table. Keep them in sync if the lesson changes.
- Tool names are not shown on the barriers, only categories, so the animation stays vendor-neutral. An optional caption track can name gitleaks, trivy, checkov, syft, and cosign, as lesson 09 does.
- The final beat reuses the lesson 08 IDOR example (`/api/patients/4471`).
