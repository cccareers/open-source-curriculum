---
course_id: cyb120
media_id: cyb120-v02
type: video-script
title: "Hash at Every Hand-off: Chain of Custody You Can Prove"
format: screencast
target_runtime: "6 min"
related_lessons:
  - cyb120-05
  - cyb120-06
objectives:
  - Document an incident timeline and preserve evidence so that it survives later review
  - Collect and analyze host and network artifacts without altering the evidence
competency_ids:
  - D3-S1-C01
  - D3-S1-C02
---

## Purpose
After watching, the learner can hash an evidence item at acquisition, verify it after each copy and transfer, record the custody entry, and correctly document an integrity failure.

## Audience and prerequisites
cyb120-05 "Evidence: what makes it survive review". A Linux terminal in a lab VM or container; synthetic files only.

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Terminal in lab VM. Prompt shows `analyst@lab`. Folder `IR-2026-0031/`. | "Chain of custody sounds like paperwork. It's actually mathematics, plus a signature. Let's prove it with a file, a hash, and one changed byte. Everything here is a synthetic export in my own lab VM." |
| 0:20 | `ls -l` shows `proxy_export_2026-03-10.log`. | "This is our evidence item: an exported proxy log for IR-2026-0031. We name it, then hash it, before anything else." |
| 0:35 | `mv proxy_export_2026-03-10.log IR-2026-0031-E004_proxy.log` then `sha256sum IR-2026-0031-E004_proxy.log` → hash displayed. | "Rename to the case convention — case ID, evidence number, source. Then SHA-256. This value is the item's fingerprint, taken at acquisition. A hash taken an hour later only proves nothing changed since then." |
| 1:05 | Editor: evidence_log.csv row being typed with id, description, source, collected_utc, collector, tool+version (`sha256sum (GNU coreutils) 9.4`), hash, location, holder. | "Record it in two places: the evidence log and the case timeline, with the UTC time and who computed it. Note the tool and its version — if that version is later found buggy, someone can find every finding it touched." |
| 1:40 | `chmod a-w IR-2026-0031-E004_proxy.log`; `cp IR-2026-0031-E004_proxy.log /evidence-store/`; `sha256sum /evidence-store/IR-2026-0031-E004_proxy.log` → same hash; both hashes shown stacked with a bracket "MATCH". | "Protect the original, then copy it to the evidence store and hash again. Same value, so same bytes. Storage does silently corrupt; a verification you didn't do is one you can't claim." |
| 2:20 | custody.csv: three rows typed: Okafor→Okafor acquisition; Okafor→Aguilar store, hash verified yes; Aguilar→Park analysis, verified yes. | "Custody: each transfer has both names, a UTC time, a purpose and location, and 'hash verified on receipt'. That last column turns a claim about people into a claim about mathematics. The rule is continuity: whoever releases it must be whoever last received it." |
| 3:05 | `cp` to `work/`; `sha256sum work/...` matches. | "Analysis happens on a working copy, verified first. Now let's see what failure looks like." |
| 3:20 | `printf 'X' \| dd of=work/IR-2026-0031-E004_proxy.log bs=1 seek=100 conv=notrunc` then `sha256sum` → completely different hash; diff shown with a bracket "MISMATCH". | "I'm deliberately changing one byte of the working copy. Rehash. The hash isn't slightly different — it's completely different. One byte or one gigabyte, the hash can't tell you how much changed, only that something did." |
| 4:00 | Timeline entry typed: `10:42:10Z [OBS ] Working copy work/IR-2026-0031-E004_proxy.log SHA-256 no longer matches E004 (expected 3f1c...; got 9ab2...). Original in evidence store re-verified: MATCH. Working copy discarded; new copy made and verified. Analyst: L. Park.` | "Here's how you document it, as if it happened unexpectedly. Observation, not panic. Then the three checks: does the original still verify? Does the evidence-store copy still verify? What touched the working copy? If the original verifies, make a fresh working copy and carry on. If the *original* fails, stop and escalate." |
| 4:50 | Split: "Gap in custody" example (row with blank receiver) struck through. | "And the custody failure that loses cases isn't a mismatch; it's a gap. 'Left it on Dana's desk' — an hour nobody can account for. A reviewer can set the item aside, and everything it supported goes with it." |
| 5:20 | Recap card: Hash at acquisition · Verify every copy and receipt · Both names, UTC, purpose · Work on copies · Correct forward. | "Hash at acquisition. Verify every copy and every receipt. Both names, UTC, purpose. Work on copies. Never delete — correct forward. Do lesson 05's Exercise 4 now with your own file." |

## On-screen assets and B-roll
- Lab terminal with large font; evidence_log.csv and custody.csv templates (same columns as project cyb120-x02).
- MATCH/MISMATCH bracket overlays.

## Accessibility
- Captions; every command and hash prefix read aloud ("hash ending c-c-2-4-a").
- MATCH/MISMATCH shown as words plus bracket shape, not colour.
- Terminal at 20 pt; commands paused for 2 seconds after entry.
- Transcript includes the commands as text.

## Check for understanding
1. What does a matching SHA-256 at receipt prove? *That the bytes are identical to those hashed at acquisition — the item has not changed during custody.*
2. Your working copy's hash no longer matches. What is the first thing you check? *Whether the original (and evidence-store copy) still verifies.*
3. What makes a custody chain "broken" even if all hashes match? *An unaccounted-for gap — any period where nobody can say who held the item or where it was.*
