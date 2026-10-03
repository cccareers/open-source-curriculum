---
course_id: cse101
project_id: cse101-x01
title: "Talbot & Vine Archive Bucket, Emulated"
kind: supplementary-project
status: draft
hours_estimate: 5
difficulty: core
related_lessons:
  - cse101-05
  - cse101-06
objectives:
  - Choose a cloud storage class and lifecycle policy that fits a workload's access pattern
  - Apply least-privilege identity and access management to a cloud account
competency_ids:
  - D2-S1-C03
  - D2-S1-C04
---

## Scenario

Talbot & Vine, the architectural photography studio from lesson 10, has approved the move of its 30 TB image archive to object storage. Before anyone touches a real account, the owner's contractor wants proof that the bucket configuration does what the design says: versioning on, an archive lifecycle that never deletes current originals, cleanup of abandoned multipart uploads, public access blocked, and a thumbnail-generator identity that can read `originals/` and write `previews/` — nothing else.

You will build that configuration on a local cloud emulator, so it costs nothing and cannot leak, and you will write an acceptance script that a reviewer can run to check every requirement in under a minute.

## What you will build / produce

- `lifecycle.json` — lifecycle configuration for the archive bucket in the provider's native format (the emulator speaks the AWS S3 API, so use S3 syntax).
- `thumbnailer-policy.json` — an identity policy for the thumbnail generator.
- `setup.sh` — creates the bucket and applies every setting idempotently.
- `verify.sh` — the acceptance script below, passing.
- `DESIGN-NOTE.md` — one page: the class timeline for one shoot (1 week, 1 month, 6 months, 2 years, 10 years), why there is no expiration on current versions, and the provider-neutral names of each setting on one other platform.
- `teardown.sh` — removes everything and stops the emulator.

## Before you start (prerequisites, starter files or data)

- Docker, Python 3.9+, and `pip install awscli-local` (which installs `awslocal`, a thin wrapper that points the AWS CLI at the emulator). If `awscli-local` pulls in AWS CLI v1 on your system, that is fine for this project.
- `jq` for JSON inspection.
- Start LocalStack: `docker run --rm -d --name localstack -p 4566:4566 localstack/localstack`. Check it is up with `curl -s localhost:4566/_localstack/health | jq .services.s3`.
- No cloud account is required. **Do not** point these scripts at a real account until milestone 6, and only if your instructor allows it.

## Milestones

1. **Bucket and versioning.** `awslocal s3api create-bucket --bucket tv-archive`, then enable versioning and block all public access (`put-public-access-block` with all four flags `true`).
2. **Lifecycle policy.** Write `lifecycle.json` with: a rule on prefix `originals/` transitioning to `STANDARD_IA` at 30 days, `GLACIER_IR` at 365 days, and **no** expiration; a rule on `previews/` that keeps them hot (no transition) because the website serves them; a noncurrent-version rule (transition noncurrent versions to `GLACIER_IR` after 30 days and expire them after 365 days — decide and justify the numbers); and an abort-incomplete-multipart rule at 7 days on the whole bucket. Apply with `put-bucket-lifecycle-configuration`.
3. **Prove versioning protects deletes.** Upload `originals/shoot-0412/IMG_0001.CR3` (any file will do), overwrite it, delete it, list versions, restore the earlier version by copying it over the key, and capture the transcript.
4. **Least-privilege policy.** Write `thumbnailer-policy.json` allowing only `s3:GetObject` on `arn:aws:s3:::tv-archive/originals/*` and `s3:PutObject` on `arn:aws:s3:::tv-archive/previews/*`. No `List`, no `Delete`, no wildcard actions. Create an IAM user or role on the emulator and attach it so the configuration is reviewable.
5. **Acceptance script.** Complete `verify.sh` (sketch below) until it prints `ALL CHECKS PASSED`.
6. **Optional real-account check.** On a personal free-tier account with a budget alert already set at a small amount, run the same `setup.sh` with `aws` instead of `awslocal`, use the provider's policy simulator to show the thumbnailer is denied `DeleteObject`, then run `teardown.sh` and confirm in the billing console that nothing remains.
7. **Teardown.** Run `teardown.sh`; it must empty all versions and delete markers before deleting the bucket, then `docker stop localstack`.

## Acceptance criteria

- [ ] Versioning status is `Enabled`.
- [ ] All four public-access-block settings are `true`.
- [ ] The lifecycle configuration contains a rule for `originals/` with at least two transitions and no `Expiration` on current versions.
- [ ] A noncurrent-version rule and an `AbortIncompleteMultipartUpload` rule exist.
- [ ] After delete, a delete marker is current and prior versions remain listable.
- [ ] The thumbnailer policy contains exactly two statements, no `*` in any action, and resources scoped to the two prefixes.
- [ ] `DESIGN-NOTE.md` contains the five-point class timeline and names each setting on one non-AWS platform.
- [ ] `teardown.sh` leaves no bucket behind (`awslocal s3api list-buckets` shows none).

## Automated checks (coding courses) / Evidence checklist (non-coding)

`verify.sh` — runnable sketch. Each check prints PASS/FAIL and the script exits non-zero on any failure.

```bash
#!/usr/bin/env bash
set -uo pipefail
B=tv-archive
fail=0
check() { if eval "$2" >/dev/null 2>&1; then echo "PASS  $1"; else echo "FAIL  $1"; fail=1; fi; }

check "versioning enabled" \
  '[ "$(awslocal s3api get-bucket-versioning --bucket $B --query Status --output text)" = "Enabled" ]'

check "public access fully blocked" \
  'awslocal s3api get-public-access-block --bucket $B \
     | jq -e ".PublicAccessBlockConfiguration | [.[]] | all"'

LC=$(awslocal s3api get-bucket-lifecycle-configuration --bucket $B)
check "originals rule has >=2 transitions" \
  'echo "$LC" | jq -e "[.Rules[] | select((.Filter.Prefix // .Prefix // \"\") == \"originals/\") | .Transitions | length] | max >= 2"'
check "originals never expire" \
  'echo "$LC" | jq -e "[.Rules[] | select((.Filter.Prefix // .Prefix // \"\") == \"originals/\") | has(\"Expiration\")] | any | not"'
check "noncurrent-version rule present" \
  'echo "$LC" | jq -e "[.Rules[] | has(\"NoncurrentVersionExpiration\") or has(\"NoncurrentVersionTransitions\")] | any"'
check "abort-multipart rule present" \
  'echo "$LC" | jq -e "[.Rules[] | has(\"AbortIncompleteMultipartUpload\")] | any"'

# Versioning behaviour, on a scratch key
K=originals/verify/probe.txt
echo v1 | awslocal s3 cp - s3://$B/$K && echo v2 | awslocal s3 cp - s3://$B/$K && awslocal s3 rm s3://$B/$K
V=$(awslocal s3api list-object-versions --bucket $B --prefix $K)
check "delete marker is current" 'echo "$V" | jq -e "[.DeleteMarkers[] | select(.IsLatest)] | length == 1"'
check "two prior versions survive" 'echo "$V" | jq -e ".Versions | length == 2"'

P=thumbnailer-policy.json
check "policy has exactly 2 statements" 'jq -e ".Statement | length == 2" $P'
check "no wildcard actions" 'jq -e "[.Statement[].Action] | flatten | map(test(\"\\\\*\")) | any | not" $P'
check "resources scoped to prefixes" \
  'jq -e "[.Statement[].Resource] | flatten | sort == [\"arn:aws:s3:::tv-archive/originals/*\",\"arn:aws:s3:::tv-archive/previews/*\"]" $P'

[ $fail -eq 0 ] && echo "ALL CHECKS PASSED" || { echo "SOME CHECKS FAILED"; exit 1; }
```

`teardown.sh` must remove every version and delete marker (for example by piping `list-object-versions` into `delete-objects`) before `delete-bucket`, because a versioned bucket with remaining versions cannot be deleted.

## Rubric
| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Lifecycle fit | Transitions by age alone; expiration on originals | Transitions match the three access phases; originals never expire; cleanup rules present | Timeline table shows the fraction of standard price in each phase and names the retrieval-time trade-off |
| Least privilege | Wildcard action or bucket-wide resource | Two statements, two prefixes, no list/delete | Adds a condition (e.g. require TLS via `aws:SecureTransport`) and explains what it defends |
| Verification | Manual screenshots only | `verify.sh` passes and is idempotent | Adds a negative test (e.g. a policy with `s3:*` makes the script fail) |
| Portability | AWS names only | Each setting named on one other platform | Notes a setting with no direct equivalent and how the other platform achieves it |
| Cost safety | No teardown | Teardown empties versions and deletes bucket | Real-account run evidenced with budget alert and post-teardown billing check |

## Stretch goals
- Add an `ObjectLockEnabledForBucket` variant for a `contracts/` bucket and explain why object lock must be chosen at bucket creation time on this API.
- Write a second policy for a freelancer scoped to `originals/shoot-0412/*` and describe what removes it at contract end.
- Add a request-meter estimate: 400 uploads per shoot delivery, two preview writes each — what does the request line cost per month at illustrative prices?

## Reflection prompts
- Which lifecycle decision would you defend hardest to the owner, and which one are you least sure about?
- The emulator stored your lifecycle rules but never aged an object. What did you have to reason about rather than observe, and how would you verify it on a real account?
- What would a reviewer need to see to trust that the thumbnailer cannot delete originals?

## Instructor notes (common pitfalls, how to adapt for time)
- LocalStack accepts lifecycle configuration but does not run transitions; learners sometimes wait for objects to change class. Say this up front.
- LocalStack community edition does not enforce IAM policies by default, so a denied request cannot be demonstrated offline; milestone 6 or the provider's policy simulator covers enforcement. The acceptance script checks policy *structure* for this reason.
- `Filter.Prefix` vs legacy top-level `Prefix`: the jq checks tolerate both.
- Short on time: skip milestone 6 and the stretch goals; milestones 1–5 and 7 fit in three hours.
