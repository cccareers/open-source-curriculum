---
course_id: cyb100
media_id: cyb100-a01
type: animation-storyboard
title: "RAID Mirrors Your Mistakes"
target_runtime: "70 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - cyb100-02
objectives:
  - Explain confidentiality, integrity, and availability, and use them to describe what a security control is protecting
competency_ids:
  - D1-S1-C03
---

## Concept and misconception it fixes
Misconception: "We have RAID, so we have a backup." RAID (mirroring) protects **availability against a disk failure**; it copies every change, including deletion and corruption, to every disk at once. Any connected, writable copy can receive the same damage. Only a separate, tested copy that the damage cannot write to (disconnected, or immutable so earlier recovery points cannot be altered) lets you return to an earlier good state. The animation makes the invisible timing visible: changes propagate to the mirror in milliseconds and never reach the offline copy.

## Visual language (shapes, colors with color-blind-safe palette, labels)
- Okabe-Ito palette. Healthy file: blue `#0072B2` square with a document glyph. Damaged file: vermillion `#D55E00` square with a jagged "scrambled" glyph **and** a hatched fill (shape cue, not colour alone). Offline copy container: bluish green `#009E73` outline with a padlock and an unplugged-cable icon. Neutral elements: grey `#999999`.
- Containers labelled in text: "Disk A", "Disk B (mirror)", "Offline backup — last night".
- A clock in the top-right labelled "Harlow & Finch, 15:00".

## Scenes
| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 8 s | Server box with Disk A and Disk B side by side, each holding four blue files. Offline backup box sits apart, cable unplugged, also four blue files. | Gentle fade-in; cable icon pulses once to show it is disconnected. | "Harlow & Finch's file server mirrors Disk A to Disk B. Last night, a backup was copied off and disconnected." |
| 2 | 10 s | Disk A is pulled out and turns grey with an "X". Disk B stays lit. A user icon keeps opening files from Disk B. | Disk A slides down and greys; arrow from user to Disk B. | "A disk dies. Nobody notices — Disk B keeps serving files. That is exactly what RAID is for: availability against a hardware failure." |
| 3 | 6 s | Disk A restored. Both disks blue again. | Disk A slides back up. | "Disk replaced. Now, a different problem." |
| 4 | 14 s | Clock ticks to 15:00. Files on Disk A flip one by one to hatched vermillion "scrambled". Each flip sends a thin line to Disk B, where the matching file flips within 0.2 s. | Sequential flips with propagation lines; a millisecond counter beside the lines. | "At three o'clock, the client files are scrambled — by malware, a bad script, or a mistaken bulk edit. The mirror copies every change, instantly. Faithfully. Both disks now hold scrambled files." |
| 5 | 8 s | Propagation line tries to reach the offline box; it stops at the gap with a small "no connection" mark. Offline files remain blue. | Line extends, hits gap, retracts. | "The offline copy isn't connected, so the damage can't reach it." |
| 6 | 12 s | A "Restore" arrow carries four blue files from the offline box to Disk A; a checkmark appears with "hashes match". Small text: "Lost: changes since last night". | Files travel along arrow; checkmark draws. | "Restore from last night, verify the files, and you're back — losing only today's changes. That loss is the number the partners need to know in advance." |
| 7 | 12 s | Split summary. Left card: "RAID / mirror — Availability vs disk failure — Technical, preventive — Fails: copies mistakes". Right card: "Offline backup — Availability + known-good integrity — Technical, corrective — Fails: if never restored, or left connected and writable". | Cards slide in. | "RAID keeps you running when hardware fails. Backups bring you back when data goes wrong. You need both, and the backup only counts if you've tested a restore." |

## Interaction variant (optional)
Scrubbable timeline in H5P "Interactive Video": pause at scene 4 and ask "Which disk can you restore from?" (options: Disk A, Disk B, Offline backup). Wrong answers replay the propagation lines. A second branch lets the learner "leave the backup plugged in" and watch the offline box also turn hatched, then pause on the question "What made the backup fail?"

## Production notes
- Keep propagation fast (≤ 0.2 s) so the "instantly" point lands; slow it only on the first file so the line is visible.
- Do not depict attacker tooling or ransom notes; the cause is deliberately generic ("scrambled").
- Pairs with project cyb100-x01, which reproduces the same sequence with real files; reuse the container labels so learners recognize them.
- Provide an audio-described version: the VO already states every state change; add "the offline copy remains unchanged" explicitly in scene 5.
