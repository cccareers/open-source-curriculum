---
course_id: cyb100
project_id: cyb100-x01
title: "Harlow & Finch: The Backup That Wasn't"
kind: supplementary-project
status: draft
hours_estimate: 3
difficulty: warm-up
related_lessons:
  - cyb100-02
  - cyb100-04
objectives:
  - Explain confidentiality, integrity, and availability, and use them to describe what a security control is protecting
  - Rate a risk by likelihood and impact and choose a mitigation strategy for it
competency_ids:
  - D1-S1-C03
  - D1-S1-C02
---

## Scenario
Harlow & Finch, the 30-person accounting firm from lessons 02 and 03, tells you their client files are "fully protected": the file server mirrors itself to a second disk every few minutes, and a nightly job copies the folder to the cloud. Nobody has ever restored anything. The managing partner asks you a fair question: *"If someone wiped or scrambled the client folder at 3 p.m., what would we actually get back?"*

You will answer that question by building a tiny, disposable model of their setup on your own machine, breaking it on purpose, and recording what each control did. This is the lesson 02 failure-mode reading ("RAID is not a backup"; "the backup can be running perfectly every night and still be worthless") turned into evidence you produced yourself.

## Scope and authorization
- Run this **only on a machine you own**, inside a disposable container or a scratch folder. It touches nothing but files the exercise creates.
- The container is started with `--network none`: nothing in this project talks to any network.
- The "damage" step overwrites dummy text files with the word `SCRAMBLED`. It is not malware, simulates no attacker tooling, and must not be pointed at real data. Never run the damage script on a work machine, a shared drive, or any folder you did not create for this lab.

## What you will build / produce
1. A lab folder containing a fake client share, a mirror (modelling RAID 1 / continuous sync), and dated offline snapshots (modelling a backup that is disconnected after it runs).
2. A **restore log** (`restore-log.md`) recording, for each control, what it protected, what happened when the share was damaged, and what you restored.
3. A short **control reading** of both controls using the lesson 02 three-question method, plus one risk statement rated with lesson 04's scales, with inherent and residual ratings.

## Before you start (prerequisites, starter files or data)
- Lessons 02 and 04 completed.
- Either Docker (any recent version) **or** a Linux/macOS terminal with `bash`, `cp`, `tar`, and `sha256sum` (macOS: use `shasum -a 256`; the check script handles both).
- Start the disposable container from an empty folder:

```bash
mkdir hf-lab && cd hf-lab
docker run --rm -it --network none -v "$PWD":/lab -w /lab alpine:3 sh
```

Every script below is POSIX `sh`, so the stock Alpine shell is enough; nothing needs to be installed.

Create the starter files:

```sh
mkdir -p share mirror snapshots
for c in adams-tax-2023 baker-tax-2023 chen-payroll-q2 diaz-vat-return; do
  printf 'Client: %s\nPrepared by Harlow & Finch\nBalance: %s\n' "$c" "$RANDOM" > "share/$c.txt"
done
if command -v sha256sum >/dev/null 2>&1; then H="sha256sum"; else H="shasum -a 256"; fi
( cd share && $H *.txt ) > baseline.sha256
```

Model scripts (save each as a file):

```sh
# mirror.sh  — models RAID 1 / continuous sync: whatever the share is, the mirror becomes
rm -rf mirror && cp -a share mirror

# snapshot.sh — models a nightly backup that is disconnected after it runs
stamp=$(date -u +%Y%m%dT%H%M%SZ)
tar -czf "snapshots/share-$stamp.tgz" -C share .
echo "snapshot written: snapshots/share-$stamp.tgz"

# damage.sh — LAB ONLY: overwrites the dummy files to model scrambled data
for f in share/*.txt; do echo SCRAMBLED > "$f"; done
```

## Milestones
1. **Baseline.** Create the files, run `sh snapshot.sh` once, then `sh mirror.sh`. Record in `restore-log.md` the time (UTC) and the number of files.
2. **Predict.** Before breaking anything, write one sentence per control predicting what it will give you back after the damage. This prediction is graded for honesty, not correctness.
3. **Break it.** Run `sh damage.sh`, then `sh mirror.sh` (the sync runs on its own schedule in real life; you are playing the schedule). Inspect `mirror/`. Record what the mirror now holds.
4. **Restore.** Create `restored/` and extract the most recent snapshot into it (`mkdir restored && tar -xzf snapshots/<file>.tgz -C restored`). Record the command and time.
5. **Verify.** Run the acceptance check below. A restore is only "done" when the hashes match the baseline.
6. **Model the worst case.** Run `sh snapshot.sh` *after* the damage (the backup job "succeeds" on scrambled data). Explain in the log which snapshot you must restore from and why "the last backup succeeded" was not the right question.
7. **Read and rate.** Write the three-question reading for the mirror and for the snapshot, then one risk statement in the lesson 04 form with likelihood, impact, inherent and residual priority, and a primary response.

## Acceptance criteria
- [ ] `restore-log.md` has a UTC timestamp for baseline, damage, and restore.
- [ ] Predictions are recorded *before* the damage step and left unedited.
- [ ] The restored files hash-match `baseline.sha256` (the check script passes).
- [ ] The log states, in one sentence each, which CIA property each control protects and its specific failure mode.
- [ ] The risk statement follows *[threat actor or event] exploits [weakness] affecting [asset], resulting in [harm]* and has a justification sentence for each rating.
- [ ] The log names the snapshot chosen in milestone 6 and explains the choice.

## Automated checks (coding courses) / Evidence checklist (non-coding)
Save as `check.sh` in the lab folder and run `sh check.sh`:

```sh
#!/bin/sh
# Acceptance check for cyb100-x01. Exit 0 = pass.
fail=0
if command -v sha256sum >/dev/null 2>&1; then H="sha256sum"; else H="shasum -a 256"; fi

[ -s baseline.sha256 ] || { echo "FAIL: baseline.sha256 missing or empty"; exit 1; }
[ -d restored ] || { echo "FAIL: restored/ missing - you have not restored yet"; exit 1; }

( cd restored && $H -c ../baseline.sha256 >/dev/null 2>&1 ) \
  && echo "PASS: restored files match baseline hashes" \
  || { echo "FAIL: restored files do not match baseline"; fail=1; }

if grep -q SCRAMBLED mirror/*.txt 2>/dev/null; then
  echo "PASS: mirror shows propagated damage (expected - mirror is not a backup)"
else
  echo "WARN: mirror is clean - did you run mirror.sh after damage.sh?"
fi

n=$(ls snapshots/*.tgz 2>/dev/null | wc -l | tr -d ' ')
[ "$n" -ge 2 ] && echo "PASS: $n snapshots present (pre- and post-damage)" \
  || { echo "FAIL: need at least 2 snapshots (milestone 6)"; fail=1; }

for k in "Prediction" "Baseline" "Damage" "Restore" "Confidentiality\|Integrity\|Availability" "Likelihood" "Impact" "Residual"; do
  grep -qi "$k" restore-log.md 2>/dev/null || { echo "FAIL: restore-log.md missing section/term: $k"; fail=1; }
done
grep -Eq '[0-9]{8}T[0-9]{6}Z|[0-9]{2}:[0-9]{2}.*UTC' restore-log.md 2>/dev/null \
  || { echo "FAIL: no UTC timestamps found in restore-log.md"; fail=1; }

[ $fail -eq 0 ] && echo "ALL CHECKS PASSED" || echo "SOME CHECKS FAILED"
exit $fail
```

Expected output on a completed lab:

```
PASS: restored files match baseline hashes
PASS: mirror shows propagated damage (expected - mirror is not a backup)
PASS: 2 snapshots present (pre- and post-damage)
ALL CHECKS PASSED
```

The script checks mechanics only. The quality of the control readings and the risk statement is assessed with the rubric.

## Rubric
| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Control reading (property, category, function) | Property or function misnamed for one control | Both controls correctly read: mirror = technical, preventive, availability against disk failure; snapshot = technical, corrective, availability and integrity | Also notes the mirror *damages* integrity recovery by propagating changes, and that a snapshot reachable from the server is not offline |
| Failure mode | Generic ("could fail") | Specific circumstance for each, evidenced by the lab | Adds a realistic Harlow & Finch circumstance not modelled in the lab (same admin credentials, cloud sync of scrambled files) |
| Restore evidence | Restore attempted, not verified | Hash-verified restore with timestamps | Measures restore duration and states it as an availability figure the partners could plan with |
| Risk rating | Ratings without justification | Each rating justified in one sentence; matrix read correctly | Inherent vs residual explained, naming which axis the treatment moves |
| Treatment | "Buy better backup" | Reduce: scheduled, tested restores to an offline/immutable copy, with an owner and review date | Considers transfer (insurance conditions on tested backups) and states the residual that is accepted |

## Stretch goals
- Keep seven daily snapshots and write a one-line retention rule; explain the trade-off between retention length and the confidentiality of a growing pile of old data (lesson 02's triad tension table).
- Time the restore of 1,000 generated files and express it as "the share can be back within N minutes, losing at most the changes since the last snapshot".

## Reflection prompts
- Which of your predictions in milestone 2 was wrong, and what assumption produced it?
- The partners will hear "we have RAID and cloud backup". Write the two sentences you would say to them instead.
- Where in Kestrel Property Management (lesson 06) does the same failure pattern appear?

## Instructor notes (common pitfalls, how to adapt for time)
- The most common error is restoring from the *newest* snapshot after milestone 6 and getting scrambled files; let it happen — it is the lesson.
- Learners without Docker can do the whole lab in a scratch folder; stress that `damage.sh` only touches `share/`.
- For a 60-minute version, provide the scripts pre-made and skip milestone 6.
- Do not extend this into ransomware simulation; the point is control failure, not attacker technique.
