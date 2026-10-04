---
course_id: cyb120
project_id: cyb120-x02
title: "Evidence Locker: Custody and Safe-Sample Drill"
kind: supplementary-project
status: draft
hours_estimate: 4
difficulty: warm-up
related_lessons:
  - cyb120-05
  - cyb120-06
  - cyb120-07
objectives:
  - Collect and analyze host and network artifacts without altering the evidence
  - Analyze a suspicious file in an isolated lab environment and extract indicators to hunt with
  - Document an incident timeline and preserve evidence so that it survives later review
competency_ids:
  - D3-S1-C02
  - D3-S1-C03
  - D3-S1-C01
---

## Scenario
Before L. Park lets you near the real IR-2026-0031 sample, she wants proof you can handle evidence without breaking it. You get a disposable "WKS-4471 stand-in" container holding synthetic artifacts (an event-log export, a scheduled-task export, an endpoint download record) and one "suspicious file". The `-X-` evidence IDs identify practice substitutes, separate from real-case E001 memory, E002 disk, E003 packet capture, and E004 proxy logs. The download record models document → script → second-stage executable delivery; the stand-in file is not the real PE sample. The suspicious file is the **EICAR anti-malware test file** — an industry-standard, harmless string that security tools are built to detect as if it were malware. You will acquire, hash, store, transfer, verify, and triage, producing an evidence package that a stranger could rely on.

## Scope and authorization
- Run only on a machine you own, inside a container started with `--network none`. Nothing contacts any network.
- **No real malware is used.** The EICAR file contains no executable payload. Your host antivirus may still quarantine it, which is why it is created *inside* the container's own filesystem and only leaves it inside an archive: password-protected when the prepared lab image supports it, or the documented `.tgz` deviation below.
- Do not copy the EICAR file onto shared drives, tickets, or chat, exactly as you would not with a real sample. Reference it by hash.

## What you will build / produce
1. `evidence/` — original items (read-only) and `IR-2026-0031-X-E00n` naming.
2. `evidence_log.csv` — every item with the lesson 05 fields.
3. `custody.csv` — at least three transfers for one item, including one to a classmate acting as custodian.
4. `static_triage.md` — hashes, true type vs. extension, strings of interest, indicator records (lesson 04 format) across the synthetic artifacts and sample, and a "not established" section.
5. A passing run of `check_locker.sh`.

## Before you start (prerequisites, starter files or data)
Docker, lessons 05–07, and your lesson 07 lab attestation (adapted: the container replaces the VM; verify `--network none` by showing `wget` or `ping` fails).

```sh
mkdir locker && cd locker
docker run --rm -it --network none -v "$PWD":/case -w /case alpine:3 sh
```

Inside the container, build the stand-in host (in `/host`, which is in the container filesystem, outside the host-mounted `/case` volume):

```sh
mkdir -p /host/logs /host/tasks /host/Downloads
printf '2026-03-10T14:02:11Z 4688 WINWORD.EXE -> powershell.exe -nop -w hidden -enc ...\n' > /host/logs/security_export.txt
printf 'OneDriveSyncMaintenance;trigger=logon;action=%%APPDATA%%\\Microsoft\\OneDriveSync\\sync_helper.exe\n' > /host/tasks/tasks_export.txt
printf '2026-03-10T14:02:19Z powershell.exe retrieved hxxp://cdn-updates-cache[.]example/win/upd.ps1\n2026-03-10T14:02:20Z upd.ps1 retrieved second-stage executable to Downloads\\invoice_march.pdf (EICAR stand-in; not the real PE)\n' > /host/logs/endpoint_downloads.txt
# EICAR test string written as a fake "PDF" (harmless; detected by AV by design)
printf '%s' 'X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*' > /host/Downloads/invoice_march.pdf
```

Tools used: `sha256sum`, `md5sum`, `sha1sum`, `od`, and `grep` (BusyBox has no `strings`; use `grep -a -o '[[:print:]]\{6,\}' FILE` instead). Base Alpine cannot create password-protected archives offline. If your instructor's image includes `7z` or `zip`, use `-p infected` / `-P infected`. If it does not, store the sample in a `.tgz` and record "not password-protected" as a documented deviation in `plan.md`. That is what you would do in a real case.

## Milestones
1. **Plan first.** Write `plan.md`: items, order, destination (`/case/evidence`), what you will hash and when, and your expected footprint (e.g., reading files updates access times on some filesystems).
2. **Acquire.** Copy the three text artifacts to `/case/evidence/` with `cp -p`, hash each *immediately*, record in `evidence_log.csv`, then `chmod a-w` the originals. Keep the loose sample under `/host`; hash it there (SHA-256 plus MD5/SHA-1) before the next step.
3. **Package the sample.** Archive `invoice_march.pdf` into `evidence/IR-2026-0031-X-E004.sample.(7z|tgz)`; neuter the name inside notes as `invoice_march.pdf_`. Create the archive directly in `/case/evidence/`, record the archive’s SHA-256 in `evidence_log.csv` and the inner file’s three hashes in `static_triage.md`, then `chmod a-w` the archive. Do not first copy the loose sample into `/case`.
4. **Working copies.** Make `work/` copies, verify hashes match, and analyze only those.
5. **Static triage.** True type (`file` if present, otherwise first bytes with `head -c 16 | od -c`), size, strings of interest, hashes. Conclude in one line what the file *really* is and why the extension is a lie.
6. **Custody.** Transfer IR-2026-0031-X-E002 (the practice task export) three times: you → classmate custodian → you (analysis) → evidence store. Re-hash on every receipt and record `hash_verified=yes`.
7. **Prove integrity breaks.** Change one byte in a *working copy* of E001, re-hash, and write the timeline entry you would write if this happened unexpectedly.
8. Run the checker; fix every failure.

## Acceptance criteria
- [ ] `evidence_log.csv` has, per item: `id,description,source,collected_utc,collector,method_tool_version,sha256,location,holder`, none blank.
- [ ] Every original in `evidence/` still matches its logged SHA-256 at the end.
- [ ] `custody.csv` (`item,utc,released_by,received_by,purpose_location,hash_verified`) is continuous: each `released_by` equals the previous `received_by`, times strictly increase, and every receipt is verified.
- [ ] No unarchived copy of the sample exists anywhere in `/case`, including `/case/work` (keep analysis copies of the sample under `/host/work`).
- [ ] `static_triage.md` includes three hashes, the true-type finding, at least four indicator records across the synthetic artifacts and sample with confidence and action; label EICAR findings as lab-only, and a "not established" section.
- [ ] The one-byte-change timeline entry is present and correctly tagged.

## Automated checks (coding courses) / Evidence checklist (non-coding)
`check_locker.sh` (POSIX `sh`, run inside the container from `/case`):

```sh
#!/bin/sh
fail=0
ok(){ echo "PASS: $1"; }; bad(){ echo "FAIL: $1"; fail=1; }

# 1. Every logged original still verifies
tail -n +2 evidence_log.csv | while IFS=, read id desc src t who tool sha loc holder; do
  f=$(ls evidence/"$id"* 2>/dev/null | head -1)
  [ -n "$f" ] || { echo "FAIL: no file for $id"; continue; }
  [ "$(sha256sum "$f" | cut -d' ' -f1)" = "$sha" ] && echo "PASS: $id hash verifies" || echo "FAIL: $id hash mismatch"
  for v in "$id" "$desc" "$src" "$t" "$who" "$tool" "$sha" "$loc" "$holder"; do [ -n "$v" ] || echo "FAIL: $id has a blank field"; done
done | tee /tmp/ev.out
grep -q FAIL /tmp/ev.out && fail=1

# 2. Originals are read-only (checks permission bits; root can write anyway)
if ls -l evidence | grep '^-' | grep -vq '^-r--r--r--'; then bad "some originals are not chmod a-w"; else ok "originals are read-only"; fi

# 3. Custody continuity
awk -F, 'NR>1{ for(c=1;c<=6;c++) if($c==""){print "FAIL: blank custody field at row "NR; f=1}
               if(n[$1]){ if($3!=prev_rcv[$1]) {print "FAIL: gap - "$1" released by "$3" but last received by "prev_rcv[$1]; f=1}
                          if($2<=prev_t[$1]){print "FAIL: time not increasing at "$2; f=1} }
               if($6!="yes"){print "FAIL: receipt not hash-verified at "$2; f=1}
               prev_rcv[$1]=$4; prev_t[$1]=$2; n[$1]++ }
     END{ for(i in n) if(n[i]>=3) t=1; if(!t){print "FAIL: no item has >= 3 transfers"; f=1}
          if(!f) print "PASS: custody chain continuous and verified"; exit f }' custody.csv || fail=1

# 4. No loose sample anywhere on the shared volume, including work/
#    (matches files whose first bytes are the EICAR prefix, so this script and
#    notes that quote the string do not trip it; archives are compressed)
loose=$(find . -type f ! -name check_locker.sh | while read -r f; do
  [ "$(head -c 9 "$f")" = 'X5O!P%@AP' ] && echo "$f"; done)
if [ -n "$loose" ]; then bad "loose sample found outside archive: $loose"; else ok "sample only present inside archive"; fi

# 5. Triage write-up
for k in "SHA-256" "MD5" "SHA-1" "true type" "Not established"; do
  grep -qi "$k" static_triage.md 2>/dev/null || bad "static_triage.md missing: $k"
done
[ $fail -eq 0 ] && echo "ALL CHECKS PASSED" || echo "SOME CHECKS FAILED"; exit $fail
```

Expected passing output ends with:

```
PASS: custody chain continuous and verified
PASS: sample only present inside archive
ALL CHECKS PASSED
```

Note: if you keep `work/` copies of the sample inside the mounted `/case` volume, your host AV may delete them and check 4 will flag them; keep analysis copies of the sample under `/host/work` instead (working copies of the other artifacts can stay in `/case/work`).

## Rubric
| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Acquisition order and plan | Collected first, planned later | Plan written first; order justified; footprint predicted | Footprint prediction compared with what actually changed |
| Integrity | Hashes recorded once | Hash at acquisition and at every copy/receipt; checker passes | Explains in one paragraph what each hash proves and from when |
| Custody | Gaps or unsigned transfers | Continuous, verified, purpose recorded | Includes disposal/retention entry and a legal-hold note |
| Static triage | Trusts the extension | True type, hashes, strings, indicators with confidence and action | Correct "not established" (no dynamic behavior; EICAR has none) and states why a clean result proves nothing about real samples |
| Safety | Sample left loose | Sample archived, referenced by hash, names neutered and defanged | Attestation shows `--network none` verified, not assumed |

## Stretch goals
- Write a 10-line `hunt.md` using your indicator records against the lesson 06 merged timeline: which hosts would each indicator have found?
- Repeat milestone 2 with `cp` (no `-p`) and compare modification times; write what changed and why it matters.

## Reflection prompts
- Which step did you most want to skip, and what would a reviewer have concluded if you had?
- Your AV deleted a file mid-exercise (if it did). How would you record that in a real case record?

## Instructor notes (common pitfalls, how to adapt for time)
- Running as root in the container makes everything writable; the checker therefore checks the permission bits rather than `-w`.
- Learners often hash the *archive* and forget the inner sample hash; both are needed (the sample's hash is its name in every hunt).
- If policy forbids EICAR, replace it with a text file whose first bytes are `MZ` and extension `.pdf`; the true-type lesson still works.
- 2-hour version: skip milestones 6–7 and check only items 1, 4, and 5.
