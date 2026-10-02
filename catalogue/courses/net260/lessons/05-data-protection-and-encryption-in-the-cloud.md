---
lesson_id: net260-05
course_id: net260
pathway: cybersecurity-support-technician
title: Data Protection and Encryption in the Cloud
order: 5
kind: lesson
competency_ids:
  - D2-S1-C05
  - D6-S1-C01
objectives:
  - Choose encryption and key management options that meet a stated data
    protection requirement in the cloud
---

## Encryption is easy now, which is the problem

Ten years ago the hard part of encryption was doing it at all. Today every major cloud provider encrypts data at rest by default, terminates TLS for you, and offers a managed key service that handles generation, storage, and rotation. Turning encryption on is a checkbox.

Which means the skill has moved. The question is no longer "is it encrypted" — the answer is almost always yes, and almost always irrelevant. The question is:

**Encrypted against whom, with a key controlled by whom, and what specific threat does that stop?**

The bucket incident from lesson 02 is the canonical illustration. Fourteen thousand records were exposed from a bucket that had server-side encryption enabled the entire time. The encryption worked flawlessly. It protected against someone physically stealing a disk out of a data center — a threat that did not occur — and did nothing at all about an anonymous authorized read, because the service dutifully decrypted every object before serving it.

So this lesson is about matching a control to a stated requirement. You will be handed sentences like "customer records must be encrypted at rest with keys the company controls" or "we must be able to prove data was destroyed" and asked which option satisfies them. Getting that mapping right, and being able to say what each option does *not* cover, is the competency.

## The three states, and what each control actually defends

```text
STATE            CONTROL                    DEFENDS AGAINST
At rest          Storage/disk encryption    Physical media theft; disk disposal;
                                            provider staff with hardware access
In transit       TLS, IPsec                 Network interception; a compromised
                                            intermediate hop; a private circuit
                                            that is private but not confidential
In use           Confidential computing,    Another tenant or a privileged host
                 enclaves                   process reading memory
```

Read the right-hand column carefully, because it is the part that gets skipped. At-rest encryption defends against someone getting the *bytes on the media*. It does not defend against anything that comes through the service's authorized path — a leaked credential, a public ACL, an over-permissive policy, an application bug. Those are lessons 03, 04, and 08, and no amount of key management substitutes for them.

Say this out loud when someone offers encryption as an answer: *at-rest encryption stops disk theft, not credential theft.* It will make you right in a lot of meetings.

In-transit encryption is the one people underestimate in the cloud, because "it's all internal" feels true and usually is not. Traffic between two subnets of your virtual network is carried on provider infrastructure. Traffic over a dedicated interconnect is private but, as lesson 04 said, not encrypted by default. And most damaging in practice: an internal service that speaks plain HTTP is one misrouted request or one compromised neighbor away from leaking credentials in a header. Enforce TLS everywhere and enforce it *in policy*, not in intention:

```json
{
  "Sid": "DenyUnencryptedTransport",
  "Effect": "Deny",
  "Principal": "*",
  "Action": "s3:*",
  "Resource": ["arn:aws:s3:::clinic-intake", "arn:aws:s3:::clinic-intake/*"],
  "Condition": { "Bool": { "aws:SecureTransport": "false" } }
}
```

That is a resource policy that makes plain HTTP structurally impossible against that bucket. Recall the evaluation order from lesson 03: an explicit deny wins over every allow, at every scope. This is the pattern to reach for whenever a requirement says "must" rather than "should."

Encryption in use is still specialized. Know the term — confidential computing, memory encrypted while processing, available on all three providers — know that it addresses the "can the provider's own operators see my data while it runs" question, and know that it is chosen for specific regulated workloads rather than by default.

## Key management: the actual decision

Every provider has a managed key service — AWS KMS, Azure Key Vault and Managed HSM, Google Cloud KMS — and every one offers the same ladder of control. This ladder is what you map requirements onto.

```text
TIER 1  PROVIDER-MANAGED KEYS  (sometimes "service-managed", "Google-managed")
  Provider generates, stores, rotates, and uses the key. You never see it and
  cannot audit its individual use.
  On by default, zero cost, zero operational burden.
  Satisfies: "data must be encrypted at rest."
  Does not satisfy: any requirement containing "we control", "we can revoke",
  or "we can prove destruction".

TIER 2  CUSTOMER-MANAGED KEYS  (CMK / CMEK)
  The key is a resource in YOUR account. You set its policy, its rotation
  schedule, and you can disable or schedule deletion of it. Every use is
  logged as an API call in your audit log.
  Small cost, small operational burden, one large sharp edge (below).
  Satisfies: "we control the keys", "we can revoke access to the data",
  "we need an audit trail of key use", "separation of duties between the
  data owner and the key owner".

TIER 3  CUSTOMER-SUPPLIED / EXTERNAL / HOLD-YOUR-OWN KEYS
  The key material originates outside the provider and is imported, or is
  held in your own HSM or an external key manager and referenced.
  Real operational burden: you own availability. Lose it, lose the data.
  Satisfies: "key material must never be generated by the provider",
  "the key must reside in our HSM", regulatory requirements naming key
  custody explicitly.

TIER 4  CLIENT-SIDE ENCRYPTION
  Your application encrypts before the data ever reaches the cloud service.
  The provider stores ciphertext it cannot read at all.
  Highest burden: you own key distribution, rotation, and every consequence
  for search, indexing, and processing.
  Satisfies: "the provider must not be able to read this data", the strongest
  form of the requirement, and the only tier that survives a compelled
  disclosure to the provider.
```

Two structural facts make the middle tiers work.

**Envelope encryption** is how all of this scales. The managed key service does not encrypt your gigabytes directly. It generates a data key, the data key encrypts your data, and the *data key* is encrypted by the key-service key and stored alongside the ciphertext. To read the data, the service asks the key service to decrypt the data key. Consequences you can use: encryption of a huge object costs one small key-service call; rotating the top-level key does not require re-encrypting your data; and **every decrypt is a logged API call**, which is where key-use auditing comes from.

**The sharp edge of customer-managed keys** is that a key policy is a second, independent authorization gate. A principal with full read permission on a bucket and no permission on the key gets an access-denied error, and the error message often points at the storage service rather than the key. This is either your worst afternoon or your best control, depending on whether you planned it. Deliberately splitting the two — the data team can read the bucket, the security team owns the key policy, and neither can act alone on the most sensitive dataset — is a legitimate separation-of-duties design that no other mechanism gives you as cleanly.

And the corollary that makes CMK powerful: **disabling the key makes the data unreadable everywhere, immediately, including in every backup and every replica.** That is the "we can revoke" requirement, and provider-managed keys cannot deliver it.

## Cryptographic shredding, and why deletion is hard in the cloud

A requirement that reads "we must be able to prove that customer data was destroyed" is genuinely difficult to satisfy in a cloud environment. Your data exists in the primary store, in snapshots, in automated backups, in a cross-region replica, in a data warehouse extract, and possibly in a log. Deleting all of it and *proving* you did is a project.

Cryptographic shredding sidesteps the problem. If a dataset is encrypted with a customer-managed key used for nothing else, then destroying that key renders every copy of that dataset unreadable simultaneously, including copies you have forgotten about. The evidence is clean: a scheduled key deletion, a timestamp, and an audit log entry.

This drives a design rule with a name: **key scoping determines your blast radius and your shredding granularity.** One key for the entire account means one revocation switch for everything, which is useless. A key per data classification, per environment, and per tenant where tenancy matters gives you a revocation and destruction control at exactly the granularity your requirements are written in. Cost is per key and per operation, so this is a real trade-off, but it is one to make deliberately rather than by default.

```text
KEY SCOPING — clinic-prod
  key/clinic-prod-phi        PHI records, DB + backups + exports
  key/clinic-prod-general    Non-sensitive application data
  key/clinic-prod-logs       Audit log archive (policy: SecOps only)
  key/clinic-nonprod         All non-production data (never touches PHI)

  Rationale: PHI is separately revocable and separately shreddable. The log
  key is deliberately outside Platform's control so a compromised platform
  identity cannot destroy the evidence trail.
```

Read the last line again — that is a key policy doing a job that no amount of network or IAM configuration does as well, and it will matter in lesson 07.

## Where the data actually lives

Before you can protect data you have to find it, and cloud environments sprawl. Inventory before control:

- **Object storage.** The most common home for a leak, and where public-access settings matter most. Every provider now has an account-level block on public access; enabling it at the top and denying its modification is one of the highest-value guardrails available.
- **Databases, managed and self-hosted.** Encryption at rest, TLS enforced for connections, and the question of whether particular columns need field-level encryption on top.
- **Backups and snapshots.** Consistently the forgotten copy. A snapshot of an encrypted volume is encrypted; a snapshot *shared* with another account carries the data with it. Check who your snapshots are shared with — it is a real finding and an easy one to miss.
- **Logs.** Applications log request bodies, and request bodies contain records. This is one of the most common accidental data stores in existence, and it usually has broader read access than the database it came from.
- **Analytics extracts and non-production copies.** Production data copied into a staging environment to "make testing realistic" now lives in an environment with weaker controls and looser access. If it must exist, it must be masked, tokenized, or synthetic.
- **The endpoint.** Someone exported a CSV to their laptop. That is out of your reach technically but belongs in your data-flow diagram, because it is where a surprising number of incidents end.

Layer classification over that inventory — the scheme comes from cyb150 and is not retaught here — and use provider data discovery tooling to check yourself. Every provider offers a scanner that samples storage and reports likely sensitive content by pattern. Its most useful output is not the count; it is the location you did not know about.

Then enforce classification with tags, and make the tags load-bearing:

```yaml
tags:
  data-classification: restricted
  data-owner: records-manager
  retention: 7y
  contains-phi: "true"
```

Tags that only decorate a console are worthless. Tags become a control when a policy reads them: deny creation of any `restricted` resource that is not encrypted with the designated key, alert on any `restricted` bucket whose public-access block is removed, block any `contains-phi` snapshot from being shared outside the account. That connection — tag drives policy — is what makes a classification scheme operational rather than aspirational.

## Choosing, worked three times

Here is the shape of the reasoning you are being assessed on. Requirement in, decision plus justification plus residual risk out.

```text
REQUIREMENT 1
"Patient records must be encrypted at rest and we must be able to prove to an
auditor exactly who decrypted them and when."

Decision: Customer-managed key, dedicated to PHI, used by the database, its
automated backups, and the export bucket. Key policy grants Decrypt only to
the application workload identity and two named break-glass principals.
Key-service audit logging enabled and routed to the log archive.

Why: The "prove who decrypted and when" clause is the deciding phrase. Only a
customer-managed key produces a per-use audit record; provider-managed keys
give you no visibility into individual key use.

Residual risk: The key log shows the workload identity decrypting, not the end
user behind the request. Attribution to a person requires correlating with the
application's own access log. Record this — do not let it be discovered later.
```

```text
REQUIREMENT 2
"Our contract says we must be able to render a departing customer's data
unrecoverable within 30 days of termination, across all copies."

Decision: Per-tenant customer-managed key. All of that tenant's data — primary,
replica, backups, warehouse extract — encrypted only with their key. On
termination, schedule key deletion; evidence is the deletion record plus a
verification read that fails.

Why: Enumerating and deleting every physical copy in 30 days is not reliably
provable. Destroying the single key is, and it covers copies you forgot.

Residual risk: Any copy encrypted with a DIFFERENT key survives. This design
only works if the per-tenant key discipline is enforced at creation time by
policy, so add a deny rule on creating tenant-scoped resources with any other
key. Also: check that no plaintext extract exists in logs.
```

```text
REQUIREMENT 3
"Regulator requires that the cloud provider itself cannot read this dataset."

Decision: Client-side encryption. The application encrypts before upload; the
provider stores ciphertext only. Keys held in the organization's own HSM.

Why: Every server-side option, including customer-managed keys, involves the
provider's service performing the decryption. Customer-managed keys mean you
control authorization to the key, not that the provider is technically unable
to decrypt. If the requirement says "cannot", tier 4 is the only honest answer.

Costs to state up front: no server-side search or indexing on encrypted fields,
no provider-side data discovery scanning, application complexity, and total
ownership of key availability. Losing the key loses the data with no recourse.

Residual risk: Metadata — object names, sizes, timestamps, access patterns —
is still visible to the provider. Say so.
```

Notice the common structure: identify the deciding phrase in the requirement, pick the lowest tier that genuinely satisfies it, and write down what it still does not cover. Over-engineering has costs that get paid later by someone who did not choose it.

## Practice

All work is performed in your own lab or sandbox account, or against an instructor-provided target, with authorization confirmed before you begin.

**Exercise 1 — Map requirements to tiers.**

For each requirement, state the key management tier you would choose, the single phrase in the requirement that decided it, one thing the choice does *not* cover, and the operational cost you would flag to your manager.

```text
a. "All data at rest must be encrypted." (No further detail.)
b. "The security team, not the application team, must control access to the
    payroll dataset."
c. "We must be able to revoke access to a dataset within one hour, including
    backups."
d. "Key material must be generated in a FIPS-validated HSM we operate."
e. "Analytics staff may query the warehouse but must never see raw card
    numbers."
f. "We must prove destruction of a customer's data on contract termination."
```

**Exercise 2 — Enforce it in policy, not intention.**

Pick one requirement from Exercise 1 and write the enforcement as a fenced policy block: a deny rule that makes the non-compliant state structurally impossible. Then state the exact test you would run to prove the deny works, and the audit log entry you would expect to see when it fires.

**Exercise 3 — Build the envelope.**

In your lab, create a customer-managed key with a policy that grants `Encrypt`/`Decrypt` to exactly one workload identity and key administration to a different principal. Encrypt an object with it. Then, from the workload identity, (a) read the object successfully, (b) disable the key and attempt the read again, and (c) re-enable it. Capture the key-service audit log entries for all three steps and paste the access-denied error verbatim — the wording is worth knowing before you meet it in production.

**Exercise 4 — Find the copies.**

Take one dataset in your lab environment and produce a data-flow inventory: every location the data exists, including backups, snapshots, replicas, extracts, and logs. For each, record the encryption state, the key used, who can read it, and whether it is in scope for the dataset's stated retention. At least one location should surprise you; if none does, you have not looked at the logs.

**Exercise 5 — Design the key hierarchy.**

For the clinic environment used throughout this course — production and non-production, PHI and general data, an audit log archive, and three external customer tenants — design the full set of keys. For each key give its name, what it protects, who holds administrative rights, who holds use rights, its rotation policy, and the specific revocation or shredding event it exists to enable. Then write the two-sentence justification for why you did not simply use one key, in terms your manager would accept, including the cost implication.
