---
course_id: cse280
project_id: cse280-x02
title: "Restore Drill in a Box: Timed, Verified, and Honestly Recorded"
kind: supplementary-project
status: draft
hours_estimate: 5
difficulty: core
related_lessons:
  - cse280-08
  - cse280-09
  - cse280-10
objectives:
  - Implement and verify backup and restoration procedures
  - Design a cloud architecture that meets a stated recovery time and recovery point objective
competency_ids:
  - D7-S1-C04
  - D7-S1-C03
---

## Scenario

Lesson 09's practice asks for a real restore "using whatever you have available". This project gives every learner the same thing to restore, at zero cost: the appointment service's database in a local PostgreSQL container, seeded with 12 clinics, 20,000 patients, and 120,000 appointments. You will take an encrypted backup to a separate "vault" directory with a key that lives outside the database container, simulate the lesson 09 incident (an administrator deletes one clinic's appointments), restore into a **new** container, verify the restore against a manifest captured at backup time, time it against an RTO, and write the restore test record. Then you will make the drill harder — because a drill that passes first time was too easy.

## What you will build / produce

- `seed.sql`, `manifest.sh`, `verify.sh`, `drill.sh` (starters below; you extend them).
- `RESTORE-TEST-RECORD.md` — lesson 09 format: source artifact, timeline with real clock times, deviations, measured results against RTO and RPO, at least four verification checks, findings arising, evidence list, signatures.
- `ITEM-RESTORE.md` — the lesson 09 exercise 4 procedure (restore only clinic 3's deleted appointments into the live database), executed and verified.
- `RPO-NOTE.md` — what RPO this drill actually demonstrates, and what it would take to demonstrate 15 minutes (WAL archiving / point-in-time recovery).

## Before you start (prerequisites, starter files or data)

- Docker, Bash, `openssl`, `shasum` (or `sha256sum`). About 1 GB RAM free; the containers keep data in `tmpfs`, so nothing persists on your disk and teardown is complete by design.
- The key files (`drill.key` for encryption, `drill.mac.key` for the integrity tag) stand in for keys held in a separate backup account. They are generated locally, never committed (add both to `.gitignore`), and are **not** real secrets.

`seed.sql`:

```sql
CREATE TABLE clinics (id int PRIMARY KEY, name text NOT NULL);
CREATE TABLE patients (id int PRIMARY KEY, name text NOT NULL, phone text NOT NULL);
CREATE TABLE appointments (
  id int PRIMARY KEY,
  patient_id int NOT NULL REFERENCES patients(id),
  clinic_id int NOT NULL REFERENCES clinics(id),
  starts_at timestamptz NOT NULL);
INSERT INTO clinics SELECT g, 'Clinic ' || g FROM generate_series(1, 12) g;
INSERT INTO patients SELECT g, 'Patient ' || g, '+1555' || lpad(g::text, 7, '0') FROM generate_series(1, 20000) g;
INSERT INTO appointments
  SELECT g, 1 + (g * 7919) % 20000, 1 + g % 12, timestamptz '2026-07-01 08:00+00' + (g % 2000) * interval '15 minutes'
  FROM generate_series(1, 120000) g;
```

`manifest.sh` (facts recorded at backup time — the yardstick for verification):

```bash
#!/usr/bin/env bash
# usage: manifest.sh <container> > manifest.txt  — record facts about the source at backup time
set -euo pipefail
C=${1:?container}
q() { local v; v=$(docker exec "$C" psql -U postgres -d clinic -Atc "$1"); [[ -n "$v" ]] || { echo "empty result for: $1" >&2; exit 1; }; echo "$v"; }
for t in clinics patients appointments; do v=$(q "SELECT count(*) FROM $t"); echo "count_$t=$v"; done
v=$(q "SELECT md5(string_agg(id||':'||patient_id||':'||clinic_id||':'||starts_at, ',' ORDER BY id)) FROM appointments")
echo "checksum_appointments=$v"
for id in 1 4242 19999; do v=$(q "SELECT phone FROM patients WHERE id=$id"); echo "spot_$id=$v"; done
```

`verify.sh` (exits non-zero unless every fact matches):

```bash
#!/usr/bin/env bash
# usage: verify.sh <container> <expected-manifest.txt>  — compares a restored DB with the manifest taken at backup time
set -euo pipefail
C=${1:?container}; M=${2:?manifest}
q() { docker exec "$C" psql -U postgres -d clinic -Atc "$1"; }
fail=0
check() { if [[ "$2" == "$3" ]]; then echo "PASS  $1 ($2)"; else echo "FAIL  $1: got '$2' expected '$3'"; fail=1; fi; }
while IFS='=' read -r key want; do
  case "$key" in
    count_*) got=$(q "SELECT count(*) FROM ${key#count_}") ;;
    checksum_appointments) got=$(q "SELECT md5(string_agg(id||':'||patient_id||':'||clinic_id||':'||starts_at, ',' ORDER BY id)) FROM appointments") ;;
    spot_*) got=$(q "SELECT phone FROM patients WHERE id=${key#spot_}") ;;
    *) continue ;;
  esac
  check "$key" "$got" "$want"
done < "$M"
orph=$(q "SELECT count(*) FROM appointments a LEFT JOIN patients p ON p.id=a.patient_id WHERE p.id IS NULL")
check "orphaned_appointments" "$orph" "0"
[[ $fail -eq 0 ]] && echo "RESTORE VERIFIED" || { echo "RESTORE NOT VERIFIED"; exit 1; }
```

`drill.sh` (end to end; prints a timestamped timeline you copy into the record):

```bash
#!/usr/bin/env bash
# Full drill: seed → manifest → encrypted backup to ./vault → simulated loss → restore to a NEW container → verify → teardown.
set -euo pipefail
KEY_FILE=${KEY_FILE:-./drill.key}           # stands in for a key held outside the "production" account
MAC_KEY_FILE=${MAC_KEY_FILE:-./drill.mac.key} # separate key for the integrity tag
[[ -f "$KEY_FILE" ]] || openssl rand -hex 32 > "$KEY_FILE"
[[ -f "$MAC_KEY_FILE" ]] || openssl rand -hex 32 > "$MAC_KEY_FILE"
ts() { date -u +%H:%M:%S; }
# openssl enc does not authenticate what it decrypts, so tag the ciphertext with a keyed HMAC.
# A plain checksum can be recomputed by anyone who can write to the vault; this tag cannot.
mac() { openssl dgst -sha256 -mac HMAC -macopt hexkey:"$(cat "$MAC_KEY_FILE")" -r "$1" | cut -d' ' -f1; }
pg() { docker run -d --name "$1" --tmpfs /var/lib/postgresql/data:rw,size=512m \
         -e POSTGRES_PASSWORD=drill -e TZ=UTC postgres:16 >/dev/null
       for _ in $(seq 1 60); do docker exec "$1" pg_isready -U postgres -q 2>/dev/null && break; sleep 1; done
       sleep 2; docker exec "$1" createdb -U postgres clinic; }
cleanup() { docker rm -f rd-src rd-restore >/dev/null 2>&1 || true; }
trap cleanup EXIT
cleanup
echo "$(ts) seed source";             pg rd-src; docker exec -i rd-src psql -q -U postgres -d clinic < seed.sql
echo "$(ts) manifest";                ./manifest.sh rd-src > manifest.txt
echo "$(ts) backup";                  mkdir -p vault
docker exec rd-src pg_dump -U postgres -Fc clinic \
  | openssl enc -aes-256-cbc -pbkdf2 -salt -pass file:"$KEY_FILE" -out vault/clinic.dump.enc
( cd vault && shasum -a 256 clinic.dump.enc > clinic.dump.enc.sha256 )
mac vault/clinic.dump.enc > vault/clinic.dump.enc.hmac
echo "$(ts) SIMULATED LOSS: delete clinic 3 appointments"
docker exec rd-src psql -q -U postgres -d clinic -c "DELETE FROM appointments WHERE clinic_id=3"
T0=$(date +%s); echo "$(ts) restore declared"
pg rd-restore
( cd vault && shasum -a 256 -c clinic.dump.enc.sha256 )
[[ "$(mac vault/clinic.dump.enc)" == "$(cat vault/clinic.dump.enc.hmac)" ]] \
  || { echo "$(ts) HMAC mismatch: backup altered or wrong key; refusing to restore" >&2; exit 1; }
openssl enc -d -aes-256-cbc -pbkdf2 -pass file:"$KEY_FILE" -in vault/clinic.dump.enc \
  | docker exec -i rd-restore pg_restore -U postgres -d clinic
echo "$(ts) restore complete; verifying"
./verify.sh rd-restore manifest.txt
echo "$(ts) elapsed declare→verified: $(( $(date +%s) - T0 ))s"
```

## Milestones

1. **Run the baseline drill.** `./drill.sh`. It should end with `RESTORE VERIFIED` and an elapsed time. Copy the timeline into your record. (Authoring run: 4 seconds from declare to verified, which is exactly why milestone 3 exists.)
2. **Write the record honestly**: the RPO this demonstrates is "time since the dump" — say so, and mark the 15-minute RPO as NOT DEMONSTRATED.
3. **Make it harder — at least two of:** (a) pause the script **after** writing the backup and its HMAC, move `drill.key` aside, then resume the restore and record what happens (removing it before a full run only generates a new key and a new backup, so does not test recovery of an existing backup) (this is lesson 09's "a backup encrypted with a key you cannot reach is not a backup"); (b) corrupt one byte of `vault/clinic.dump.enc` and show the checksum step stops the restore — then corrupt it again, recompute the `.sha256` file as an attacker with vault access could, and show the HMAC check still stops it; (c) add a scheduled-job check to `verify.sh` (e.g. "appointments in the next hour for clinic 1" returns the expected count) — a check that is not a row count; (d) scale `seed.sql` up 10× and measure again against a 60-second "RTO" you set before running.
4. **Item-level restore.** Restore the backup into a scratch container, extract only `clinic_id = 3` rows, reinsert them into `rd-src` (the "live" database) without touching other rows, and verify with the manifest. Record every decision point. (Modify `drill.sh` so the trap does not remove `rd-src` until you are done.)
5. **Findings arising.** At least two, with owner, due date, and severity — e.g. "runbook omits key retrieval step", "RPO unevidenced".
6. **RPO note.** One page: what continuous archiving would add, how you would test a point-in-time restore to the minute before the deletion, and what evidence that test would produce. Do not claim it unless you ran it.
7. **Teardown.** Confirm `docker ps -a --filter name=rd-` is empty and delete `vault/`, `drill.key`, and `drill.mac.key` unless your instructor wants the encrypted artifact.

## Acceptance criteria

- [ ] `drill.sh` ends with `RESTORE VERIFIED` and an elapsed time.
- [ ] At least two milestone-3 variations run, including one that **fails**, with the failure recorded rather than hidden.
- [ ] The record states plainly whether the RTO objective was met and that the RPO objective was or was not demonstrated.
- [ ] At least four verification checks, one not a row count.
- [ ] Item-level restore returns exactly clinic 3's 10,000 deleted appointments and nothing else (verify against the manifest).
- [ ] Independent verifier named (a classmate) who re-ran the drill from your record alone.
- [ ] Teardown evidence attached.

## Automated checks (coding courses) / Evidence checklist (non-coding)

- `./drill.sh` exit code 0, with `RESTORE VERIFIED` in its output followed by the `elapsed declare→verified` line (automated).
- `./verify.sh rd-src manifest.txt` **fails** on `count_appointments` and `checksum_appointments` after the simulated loss and **passes** after your item-level restore (automated; run both and attach output).
- Evidence list in the record: timeline transcript, `manifest.txt`, `vault/clinic.dump.enc.sha256`, verification output, teardown output — each filename prefixed with the drill date.

## Rubric
| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Restore | Restored into the source container | Restored into a new container from the encrypted vault copy | Restore without the key shown to fail, and key-recovery procedure written |
| Verification | Row counts only | Manifest checks incl. checksum, spot checks, referential integrity, a functional query | Verification automated and wired into the drill's exit code |
| Honesty | Reports total success | States objective met/not met and RPO not demonstrated | Quantifies the gap and proposes the test that would close it |
| Item restore | Full restore over live data | Clinic 3 rows only, verified | Procedure timed and turned into a runbook with RECORD lines |

## Stretch goals
- Enable WAL archiving in the source container and perform a true point-in-time restore to one minute before the deletion; update `RPO-NOTE.md` with measured evidence.
- Replace `openssl enc` plus the HMAC with `age` and compare the operational story. Note what `age` does and does not authenticate: anyone holding the recipient's public key can produce a valid file, so a keyed tag or a signature is still needed to prove *who* wrote the backup.
- Run the drill from a scheduled job and keep a month of restore records — lesson 09's "automate the strongest evidence".

## Reflection prompts
- Which variation surprised you most, and which real-world failure does it stand in for?
- What could an auditor still not conclude from your record?
- If the business owner asked "can we promise 15 minutes?", what would you answer today?

## Instructor notes (common pitfalls, how to adapt for time)
- Docker Desktop with a nearly full virtual disk cannot start Postgres with a normal volume; the `--tmpfs` data directory in `drill.sh` avoids that and guarantees clean teardown.
- `pg_dump -Fc` output is binary; it must be piped, not captured into a shell variable.
- The deletion removes exactly 10,000 rows (120,000 appointments spread across 12 clinics).
- The full drill was executed during authoring on Postgres 16 and verified (8/8 checks passing). The HMAC integrity step was added after that run and tested on its own (tag matches, single-byte tamper refused); re-run the full drill once before release.
- Short on time: milestones 1–3 and 7 only.
