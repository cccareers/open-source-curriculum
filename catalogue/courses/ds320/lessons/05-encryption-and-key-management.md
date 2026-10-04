---
lesson_id: ds320-05
course_id: ds320
pathway: data-engineer
title: Encryption and Key Management
order: 5
kind: lesson
competency_ids:
  - D5-S1-C01
objectives:
  - Apply encryption in transit and at rest, and manage the keys that make it meaningful
---

## What encryption is actually for

Encryption is a control with a narrow, specific job: it makes data unreadable to anyone who obtains the bytes without also obtaining the key. Everything useful about it follows from that sentence, and so does everything it cannot do.

It defends against a stolen backup tape, a decommissioned disk sold on, a misconfigured storage bucket read by a stranger, a network path you do not control, and a database file copied out of a compromised host. It does **not** defend against an authorized user querying data they should not see, a stolen session, an over-privileged service account, or a pipeline that writes a Confidential column into an Internal mart. Those are access-control failures, and the previous lesson is where they are addressed. A team that answers every privacy question with "but it's encrypted" has confused two controls that fail in completely different ways.

The practical consequence is that **encryption's value is entirely determined by key management**. Data encrypted with a key that every principal in the account may use is, for access-control purposes, not encrypted at all. So this lesson spends more time on keys than on ciphers.

One boundary, stated up front: you are not going to implement cryptographic primitives. Do not write your own cipher, your own mode of operation, your own random number generator, or your own key derivation. Do not invent a scheme because a library felt awkward. The engineering skill being taught here is *configuring and operating* vetted implementations — TLS, provider-managed storage encryption, and a managed key management service (KMS) — correctly. That is where real defects live, and it is a much better use of your time.

## Encryption in transit

Every network hop that carries Confidential or Restricted data uses TLS. Modern practice is TLS 1.2 at minimum, TLS 1.3 preferred, with certificate validation enabled. The failure mode is almost never a weak cipher; it is **validation quietly turned off** because a certificate error was in the way of a deadline.

For a relational connection, the setting that matters is the verification mode. In PostgreSQL, the connection parameter `sslmode` has several values, and only two of them are worth using in production:

```text
disable     no TLS at all
require     encrypts, but does NOT verify the server — vulnerable to interception
verify-ca   encrypts and verifies the certificate chain
verify-full encrypts, verifies the chain, and checks the hostname matches
```

(Two more values, `allow` and `prefer`, also exist. `prefer` is the libpq default: it tries TLS and silently falls back to plaintext if the server does not offer it, which is why leaving `sslmode` unset is itself a finding.)

`require` is the trap. It encrypts, so a packet capture looks reassuring, but it accepts any certificate, which means an attacker positioned in the path can terminate the connection and read everything. Use `verify-full` and supply the certificate authority bundle:

```text
postgresql://pipeline@warehouse.internal:5432/warehouse
  ?sslmode=verify-full&sslrootcert=/etc/ssl/certs/internal-ca.pem
```

Then make the requirement mutual rather than optional. A server that permits plaintext will eventually receive a plaintext connection from a client someone configured in a hurry. In PostgreSQL that means `ssl = on` plus `hostssl` entries in `pg_hba.conf` and no `host` entries for anything above Internal.

The same discipline extends beyond the database:

- **Object storage.** Deny non-TLS requests at the bucket policy level rather than trusting every client. The condition you wrote in the previous lesson's practice is exactly this control.
- **Internal service-to-service traffic.** Traffic inside a private network is still traffic; a flat internal network is one compromised host away from being a public one. Encrypt internal hops carrying Confidential data too.
- **Load balancer termination.** If TLS terminates at the edge and the hop from the balancer to the application is plaintext, you have encrypted the internet and left the data center open. Re-encrypt the internal leg or terminate at the application.
- **File transfer and extracts.** SFTP or HTTPS, never plain FTP. An emailed CSV of customer records is unencrypted transit with a permanent copy at the far end.
- **Certificate expiry.** Expired certificates cause outages, and outages cause people to disable verification. Automate renewal and alert well before expiry — this is a security control disguised as an availability concern.

## Encryption at rest

At rest, you choose a layer, and each layer defends a different boundary.

**Full-disk or volume encryption** protects against physical media loss and is table stakes; on managed cloud storage it is typically on by default and invisible.

**Service-managed encryption** is the provider encrypting your storage bucket, managed database, or warehouse with keys it holds and rotates. This is the sensible default for Internal data. Its limitation is that you have no independent control over key access — everything permitted to use the service can read the plaintext.

**Customer-managed keys (CMK)** are keys you create in a KMS, whose usage policy you write. This is the meaningful step up, and it is what handling rules for Confidential and Restricted data normally require. Two capabilities come with it. First, key usage is **logged**, so you get an independent record of what decrypted what. Second, key usage is **authorizable separately from data access**, so a principal that can list objects but is denied `Decrypt` on the key gets ciphertext. That separation is the whole reason customer-managed keys are worth the operational cost.

**Application-level or column-level encryption** means your code encrypts specific values before they are stored, so the database never sees plaintext. Reserve it for a small number of genuinely Restricted fields, because the costs are real: you cannot index or range-query an encrypted column, joins on it work only with deterministic encryption (which leaks equality and therefore frequency), sorting is gone, and every consumer needs the key. A common, more workable pattern is **tokenization**: replace the sensitive value with a surrogate token, keep the mapping in one small, tightly controlled vault, and let the rest of the platform join on the token safely.

**Client-side encryption** is where the client encrypts before the object reaches storage, so the provider never holds plaintext. Strongest separation, highest operational burden, and worth it mainly when your threat model includes the provider itself.

Choose per classification, not per system. A workable default set: Internal uses service-managed keys; Confidential uses a customer-managed key with rotation and a restrictive key policy; Restricted uses a dedicated customer-managed key plus tokenization or column encryption for the specific fields, with key use alerted on.

## Envelope encryption and the KMS

Managed key services do not encrypt your data directly — they would be a bottleneck and your data would have to travel to them. They use **envelope encryption**, and understanding the flow is the core mental model of this lesson.

A **data encryption key (DEK)** is a symmetric key that encrypts the actual data. A **key encryption key (KEK)**, held in the KMS and never released in plaintext, encrypts the DEK. The encrypted DEK is stored next to the ciphertext. To read the data you send the encrypted DEK to the KMS, prove you are permitted to use the KEK, receive the plaintext DEK, decrypt locally, and discard the DEK from memory.

![Envelope encryption flow showing a data key generated under a key-encryption key, used locally, and stored as ciphertext beside the data](./img/envelope-encryption.png)

The properties this buys you are worth listing because they explain the whole design:

- Bulk data never travels to the KMS; only small keys do.
- The KEK never leaves the service's protected boundary.
- Rotating the KEK is cheap: re-encrypt the DEKs, not the data.
- Every use of the KEK is an authorization decision and a log line — a per-object audit trail of decryption.

Concretely, using AWS KMS as the example provider:

```bash
# 1. Ask the KMS for a data key. You get the plaintext DEK and the wrapped DEK.
aws kms generate-data-key \
  --key-id alias/warehouse-confidential \
  --key-spec AES_256 \
  --encryption-context '{"dataset":"crm_contacts","classification":"confidential"}' \
  --output json > datakey.json

# 2. Encrypt locally with the plaintext DEK, then destroy it.
#    Store only the wrapped DEK (CiphertextBlob) beside the ciphertext.

# 3. To read later, unwrap the DEK — the same encryption context is required.
aws kms decrypt \
  --ciphertext-blob fileb://wrapped-dek.bin \
  --encryption-context '{"dataset":"crm_contacts","classification":"confidential"}' \
  --output json
```

The **encryption context** is the underused feature here. It is authenticated additional data: the same context must be supplied to decrypt, and it appears in the KMS audit log. Populating it with dataset and classification gives you a log you can actually query — "who decrypted anything classified confidential last week?" — and prevents a wrapped key from being used against a different dataset.

## Key policies, rotation, and the operational reality

**Key policy is access control for plaintext.** Write it with the same least-privilege discipline as lesson 4, and remember it is a *separate* decision from data access. A key policy for a Confidential dataset typically allows: the pipeline service account to `GenerateDataKey` and `Decrypt`; the analytics warehouse role to `Decrypt` only; a small named administrator group to manage the key but explicitly **not** to use it; and nobody else. That last split is separation of duties expressed in cryptography — the person who can delete the key cannot read the data, and the person who can read the data cannot delete the key.

**Rotation** means retiring a key from new encryption and bringing in a successor. Distinguish two things people conflate:

- *Automatic KEK rotation* — the KMS generates new key material on a schedule (commonly annual) while keeping old material to decrypt existing DEKs. Nothing in your data changes; the key identifier stays the same. Turn it on; it is nearly free.
- *Re-encryption* — actually rewriting data under a new key. Expensive, and required only when a key is suspected compromised, when a compliance regime demands it, or when you are migrating between key hierarchies. Plan it as a backfill job with progress tracking, not as a maintenance-window heroic.

Rotate **credentials** on a schedule too — the service account keys and database passwords that reach the data. Those live in a secrets manager, which is a different service from the KMS and answers a different question: a secrets manager stores and distributes credentials, while a KMS holds keys and performs cryptographic operations without releasing them. Do not store data keys in the secrets manager, and do not store database passwords as KMS keys.

**Deletion via crypto-shredding.** Recall the deletion problem from lesson 3 — immutable files, archives, snapshots. If a dataset is encrypted with a key dedicated to a tenant, a time period, or a subject group, then destroying that key renders the data unrecoverable without touching a single byte of it. This is the standard answer for erasure in append-only stores, and it is only available if you designed the key hierarchy for it up front. Two cautions: your legal and privacy functions must accept crypto-shredding as erasure (they usually do, and it is their call, not yours), and key deletion in a managed KMS is deliberately slow — a pending-deletion window of days — precisely because it is irreversible.

**Availability is a security property.** A key that is unavailable is a total outage of the data it protects. Practical consequences: replicate or provide multi-region keys before you need cross-region restore, understand that a snapshot restored into another region needs a key reachable from that region, and never let key administration concentrate on one person's credentials.

**Backups inherit, but verify.** Snapshots and replicas of an encrypted store are normally encrypted too — but an export to object storage may not be, and a `pg_dump` written to a laptop certainly is not. Extracts and exports are where encrypted platforms leak. Check every path out of the system, not just the system.

**Log key usage, and alert on the unusual.** KMS logs are the highest-signal security telemetry a data platform produces, because they record intent to read plaintext. A sudden burst of `Decrypt` calls against a Restricted key by a principal that normally makes ten a day is the alert you want. You will assemble these into evidence in the next lesson.

## Practice

Continue with the `sales_ops` warehouse and the `acme-warehouse` bucket. Use a real cloud account with a free-tier or sandbox KMS if you have one; if not, complete the design deliverables in full and write the commands you would run.

1. **Fix transit.** Configure a PostgreSQL connection from your pipeline using `sslmode=verify-full` with an explicit root certificate. Then demonstrate the difference: connect once with `require` against a server presenting a certificate your client does not trust, and once with `verify-full`, and record both outcomes. Write two sentences on why the first connection is dangerous despite being encrypted.

2. **Design the key hierarchy.** Produce a table with one row per key: key alias, what it protects, classification, who may use it, who may administer it, rotation setting, and whether it must be available in a second region. Cover at least the warehouse Confidential data, the object-storage curated prefix, and one Restricted field.

3. **Write a key policy** for the Confidential warehouse key that allows the pipeline service account to generate data keys and decrypt, allows the analytics role to decrypt only, allows a named administrator group to manage but not use the key, and denies everyone else. Then state in one sentence which lesson 4 control this policy is deliberately duplicating, and why duplication is correct here.

4. **Envelope-encrypt a file.** Take a sample extract, generate a data key with an encryption context naming the dataset and classification, encrypt the file locally, store the wrapped key beside the ciphertext, then decrypt it back. Now attempt the decrypt with a *different* encryption context and record the failure. Explain what that failure protects against.

5. **Write a rotation runbook** for the Confidential key covering both cases: routine automatic rotation (what changes, what does not, what you verify afterwards) and suspected compromise (how you identify affected data, the order of re-encryption, how you avoid an availability gap, and how you prove completion). Include a rollback step.

6. **Design a crypto-shredding scheme** for the 90-day Parquet landing zone so that a single subject's data can be rendered unrecoverable without rewriting other partitions. State the key granularity you chose, its cost, and the one question you must ask privacy before relying on it as erasure.
