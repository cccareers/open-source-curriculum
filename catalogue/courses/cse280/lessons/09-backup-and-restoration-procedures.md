---
lesson_id: cse280-09
course_id: cse280
pathway: cloud-support-engineer
title: Backup and Restoration Procedures
order: 9
kind: lesson
competency_ids:
  - D7-S1-C04
objectives:
  - Implement and verify backup and restoration procedures
---

## The only thing a backup is for

There is one sentence to carry out of this lesson: **you do not have a backup, you have a restore.** A backup job that runs successfully every night for two years and has never been restored is not a control. It is an assumption with a green tick next to it.

This is not a rhetorical flourish. The failure mode is common and specific. Backups run; the console shows success; the retention looks generous. Then the day comes, and the restore fails because the backup covered the data volume but not the configuration, or because the encryption key was in the account that was compromised, or because the restore takes eleven hours against a one-hour objective, or because the file is intact and the application cannot read it. Every one of those is discovered at the worst possible moment by teams whose backup dashboard was green throughout.

So the definition of done in this lesson is not "backups are configured". It is **a restore was performed, timed, verified, and written down.** Everything else is preparation for that.

## Four things people call backup

Precision here prevents a whole class of design error, because these have different protective properties.

**Snapshot.** A point-in-time copy of a volume or database, usually stored by the provider, usually incremental, usually in the same account and often the same region. Fast to take, fast to restore, and — critically — typically sharing the fate of the account it lives in. Excellent for corruption recovery, weak against account compromise.

**Backup.** A copy managed by a backup service or process with its own retention, lifecycle, and often its own storage location and access control. This is the thing that survives events that the source does not.

**Replication.** A continuously maintained second copy, discussed in lesson 08. It is not a backup, because it replicates destruction with the same fidelity as it replicates data.

**Archive.** A long-retention, low-cost copy kept for compliance or historical purposes, usually with slow retrieval measured in hours. Retrieval time is the trap: an archive tier can satisfy a seven-year retention obligation and be useless for an operational restore.

A workload usually needs several of these, and the design question is which failure domain each one covers.

## Coverage: the things that are silently not backed up

Ask a team what they back up and they will name the database. Ask what they would need in order to rebuild the service from nothing, and the list is longer. Work through it deliberately, because the gaps are invisible until a restore.

- **The primary database.** Everyone has this.
- **Object storage.** Frequently not backed up at all, on the assumption that durable means safe. Durability protects against hardware failure, not against deletion. Versioning and lifecycle rules are the mechanism here.
- **Infrastructure definition, and its state file.** If your DR strategy is backup-and-restore, the infrastructure code *is* part of the backup. So is the state that maps it to real resources; losing it can leave you unable to manage resources that still exist.
- **Configuration that lives outside code.** The hand-made load balancer from lesson 08, DNS records, provider account settings, guardrail policies.
- **Identity configuration.** Roles, policies, group mappings, federation settings. Rebuilding these from memory during an incident is miserable.
- **Secrets and encryption keys.** And specifically: **a backup encrypted with a key you cannot reach is not a backup.** If the key lives only in the account that was compromised or deleted, you have an unreadable file. Key custody for backups is a separate decision from key custody for the source data.
- **Certificates.**
- **Data in third-party systems** that you depend on operationally — ticketing, code hosting, identity provider. Many are the vendor's responsibility and some are explicitly yours; read the terms rather than assuming.
- **The runbooks.** Stored somewhere reachable when the environment is down.

Write this as an explicit coverage table per workload, with an owner per line. The lines with no owner are the ones that will be missing.

## Designing the backup policy

Five parameters, and each of them is a decision with a compliance consequence.

**Frequency** sets your RPO for the corruption and deletion scenarios. Nightly backups mean up to a day of data loss. If lesson 08's stated RPO is fifteen minutes, nightly snapshots alone cannot meet it — you need continuous or point-in-time recovery, which most managed databases offer as a distinct feature with its own retention window. Frequency is where the RPO promise is either kept or quietly broken.

**Retention** is usually set by an obligation rather than by engineering: a contract, a regulatory retention requirement, or your own policy. Two cautions. Retention has a *maximum* as well as a minimum — data protection regimes expect storage limitation, so "keep everything forever" can itself be a finding, and it also means deletion requests cannot be honoured. And take the specific duration from the current governing document, not from a summary or from memory; retention periods differ by data type and jurisdiction and they change.

A tiered scheme is the normal answer:

```yaml
backup_policy:
  name: appointments-db
  point_in_time_recovery:
    enabled: true
    window_days: 7          # covers corruption and deletion within a week
  scheduled_backups:
    - frequency: hourly
      retention_days: 2
    - frequency: daily
      retention_days: 35
    - frequency: monthly
      retention_months: 12
      storage_class: archive
  copy_to_region: eu-west-2
  copy_to_account: backup-vault-account
  encryption:
    key: cmk-backups            # distinct from the source database key
    key_account: backup-vault-account
  immutability:
    lock: compliance
    lock_days: 35
  tags:
    data-classification: restricted
    retention-policy: appointments-24m
```

**Isolation** is what makes a backup survive the event. The principle is that the backup should not share fate or credentials with the source. In practice: a separate account or subscription, a separate region, and credentials that the production workload does not hold. The classic ransomware pattern is credentials obtained in production being used to delete the backups first; if production cannot delete the backups, that attack does not work.

**Immutability** is the stronger form of the same idea. Object lock, vault lock, and immutable backup features let you make a copy that *nobody* can delete or alter before its retention expires — including an administrator, including you. Providers offer both a governance mode, which privileged users can override, and a compliance mode, which nobody can. Compliance mode is genuinely irreversible, so understand the cost commitment before enabling it. This is one of the highest-value controls in this entire course relative to its effort.

**Encryption** applies with the rules from lesson 06, plus the key-reachability point above. Backups of restricted data inherit the restricted classification, and a backup is one of the most commonly forgotten derived copies.

The traditional guidance was three copies, on two kinds of media, one off-site. The cloud translation is: the live data, a backup in the same region for fast restore, and a copy in a different region *and* a different account, at least one copy immutable. That version defends against the failure domains that actually occur.

## Verification, and why the job status is not it

Backup verification comes in levels, and only the last one counts.

1. **The job reported success.** Weakest possible signal. Tells you a process finished, not what it produced.
2. **The artifact exists and its size is plausible.** Catches truncation and the backup that has been silently producing an empty file since a schema change.
3. **Integrity check passes.** A checksum, or the provider's own validation.
4. **A restore completes.** The data comes back into a usable resource.
5. **The restored data is verified as correct and the restore was timed.** Row counts, spot checks against known records, the application actually starting against it, and a stopwatch against the RTO.

Level 5 is the definition of done. Level 1 is what most dashboards show.

Automate what you can: a scheduled restore into an isolated environment, running a verification query, then tearing the environment down, is a genuinely achievable piece of automation and it turns your strongest evidence into a byproduct of a cron schedule. Where automation is not feasible, schedule the manual test and treat missing it as a finding — which it is, since your own policy will say you do it.

**Restore types** to plan for separately, because they have different procedures and very different timings:

- **Full restore** of a whole database or system, for total loss.
- **Point-in-time restore** to a moment just before a bad migration ran.
- **Item-level restore** of one table, one object, or one record — the most common real request, and the one people have not prepared for. "Restore only this customer's records" is a support ticket, not a disaster, and doing it by restoring the entire database into a temporary instance is a legitimate answer only if you have rehearsed it.
- **Cross-region or cross-account restore**, which exercises the isolation you built and often reveals a missing permission or an unreachable key.

## The restore test record

This is the artifact. Everything above exists to produce it.

```text
RESTORE TEST RECORD
Test ID:        RT-2026-Q3-01
Date:           2026-07-14
Performed by:   S. Begum, Cloud Support
Observed by:    A. Reyes, Platform (independent verifier)
Scope:          appointments-db — full restore, cross-region, cross-account
Objective under test: RTO 60 min (lesson 08 design record BCP-2026-01),
                      RPO 15 min

SOURCE ARTIFACT
  Backup:        daily automated backup, 2026-07-13 02:14 UTC
  Location:      backup-vault-account, region eu-west-2
  Encryption:    cmk-backups (key in backup-vault-account)
  Immutability:  compliance lock, expires 2026-08-17

PROCEDURE FOLLOWED
  Runbook DOC-051 v3. Deviations recorded below.

TIMELINE (UTC)
  09:00  Test declared. Isolated restore environment created.
  09:04  Restore initiated from backup vault to eu-west-2.
  09:41  Restore reported complete by the service.
  09:44  DEVIATION — restored instance unreachable. Runbook step 6 omits
         attaching the restore-test security group. Added manually.
  09:52  Application connected successfully against restored instance.
  10:07  Verification queries complete.
  10:09  Test ended. Environment destroyed 10:22.

MEASURED RESULTS
  Restore duration (initiate → usable):   48 min
  Total elapsed (declare → verified):     67 min
  RTO position:  67 min vs 60 min objective — OBJECTIVE NOT MET
  Data currency: backup taken 2026-07-13 02:14; simulated failure time
                 2026-07-13 08:00 → 5h 46m of data loss from this artifact
                 alone. Point-in-time recovery would cover the gap but was
                 NOT exercised in this test.
  RPO position:  NOT DEMONSTRATED against the 15-minute objective.

VERIFICATION PERFORMED
  Row count appointments:  1,284,551 (source at backup time: 1,284,551) PASS
  Row count patients:        212,904 (source: 212,904) PASS
  Spot check 5 known records by id — all present and field-identical  PASS
  Application startup against restored instance                       PASS
  Scheduled reminder job executed against restored data               PASS
  Referential integrity check (orphaned appointments)                 PASS

FINDINGS ARISING
  RT-01  Runbook DOC-051 step 6 omits network attachment for the restore
         environment. Owner: S. Begum. Due 2026-07-18. Severity Low.
  RT-02  Measured 67 min exceeds the 60-minute RTO. Dominated by the
         48-minute restore itself. Options: more frequent snapshots to
         reduce restore size, or revise the objective. Escalated to the
         business owner. Owner: Clinical Platform. Due 2026-08-01.
         Severity High.
  RT-03  Point-in-time recovery has never been tested; the 15-minute RPO
         claim is therefore unevidenced. Owner: S. Begum. Schedule RT-2026-Q3-02
         before 2026-08-15. Severity High.

EVIDENCE ATTACHED
  evidence/2026-07-14-restore-console-log.txt
  evidence/2026-07-14-verification-queries.sql + output
  evidence/2026-07-14-rowcount-comparison.csv
  Screenshots: restore initiation, completion, application health (all with
  visible UTC timestamps)

Signed: S. Begum, 2026-07-14   Verified: A. Reyes, 2026-07-14
```

Study what that record does. It **failed** — it missed the RTO and did not demonstrate the RPO at all — and it is a far more valuable artifact than a record saying everything passed. It produced three findings that feed straight into lesson 07's remediation process. It caught a runbook defect that would have cost eight minutes during a real event. It has an independent verifier, so nobody is grading their own homework. And it is precise about what was *not* tested, which is the single most important honesty in restore testing: an untested capability that has never been claimed is a gap, but an untested capability that has been claimed is a misrepresentation.

## Practice

The appointment service's current backup arrangement:

```text
appointments-db     Provider automated daily backup, 07:00 UTC, 7-day
                    retention, same account, same region. Point-in-time
                    recovery: available on this engine, not enabled.
                    Backup encryption: same provider-managed key as the
                    database.
acme-prod-exports   Nightly CSV export written to object storage.
                    No versioning. No lifecycle rule. No backup of the
                    bucket. Deleting an object is permanent.
Infrastructure      ~70% in code in platform-repo. State file in an object
                    storage bucket in the production account, no versioning.
                    Load balancer and DNS created by hand, not codified.
Identity config     Not backed up. Roles and policies exist only as
                    deployed state.
Secrets             Regional secrets manager, production account.
                    Not replicated, not exported.
Last restore test   None on record.
```

Stated objectives from lesson 08: RTO 60 minutes, RPO 15 minutes. Retention obligation from the customer addendum: appointment records retained 24 months.

**Exercise 1 — Write the coverage table.**

Produce a table with columns `Asset`, `Backed up? (yes/no/partial)`, `Mechanism`, `Failure domains covered`, `Failure domains NOT covered`, `Owner`. Cover every item in the current arrangement plus every category from the coverage list in this lesson that applies to this service. Any row where the owner is unclear should say so explicitly rather than being left blank — an unowned line is the finding.

**Exercise 2 — Write the backup policy.**

Produce the corrected backup policy as a fenced configuration block, in the style shown, that would actually meet a 15-minute RPO and a 24-month retention obligation. It must address frequency including point-in-time recovery, tiered retention, cross-region and cross-account isolation, key custody that survives loss of the production account, and immutability. For each of the five parameters write a one-sentence justification underneath, and where a duration depends on the governing document, say which document you would confirm it against rather than asserting the number as settled.

**Exercise 3 — Perform and record a restore test (the main artifact).**

Run a real restore. Use whatever you have available: a cloud account under a free tier, a local database with a dump and reload, or a container with a mounted volume — the mechanics matter less than the discipline. Then produce a complete restore test record in the format above, including: the source artifact with its location, encryption, and timestamp; a timeline with real clock times and every deviation from your written procedure noted at the moment it happened; measured duration against a stated objective; at least four distinct verification checks, one of which must be something other than a row count; findings arising with owners and due dates; and the evidence list.

The record must state plainly whether the objective was met. **A restore test record that reports total success on the first attempt is almost always a test that was too easy or a record that is not honest** — if yours passed everything, add a constraint (restore into a different region, restore with a different account's credentials, restore to a point in time rather than the latest backup) and run it again.

**Exercise 4 — Plan the item-level restore.**

A clinic calls: an administrator deleted 40 appointment records for one clinic this morning, and they need them back without disturbing anyone else's data. Write the procedure you would follow, step by step, with the decisions marked: what you restore, where you restore it, how you extract only the affected records, how you verify you have the right ones, how you reinsert them, and what you record. Then state the total time you estimate this takes with your Exercise 2 policy in place, and the one change that would make it dramatically faster.

**Exercise 5 — Verify a classmate's record.**

Trade restore test records. Acting as the independent verifier, answer one question in writing: *from this record alone, could you reproduce the test and get the same result?* Mark every step where the answer is no. Then answer the auditor's question — "does this record prove the stated RPO?" — and say what additional test would be needed if it does not.
