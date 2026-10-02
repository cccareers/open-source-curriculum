---
lesson_id: cse280-06
course_id: cse280
pathway: cloud-support-engineer
title: "Data Protection: Encryption, Classification, and Residency"
order: 6
kind: lesson
competency_ids:
  - D3-S1-C04
objectives:
  - Protect data with encryption, classification, and residency controls
    appropriate to its sensitivity
---

## You cannot protect what you have not labelled

Lesson 05 governed who can reach the data. This lesson governs what state the data is in, and it starts one step before encryption, because encryption decisions are unanswerable without it.

"Should this be encrypted with a customer-managed key?" has no correct answer in the abstract. It depends on what the data is. So does "can this be copied to a second region", "how long may we keep it", and "does this need to be masked in the support console". Every one of those is a function of the data's sensitivity, and sensitivity is a property somebody has to decide and record.

That is what **data classification** is: a small set of named tiers, a rule for which data goes in which tier, and a set of handling requirements attached to each tier. Once it exists, most data protection questions stop being debates and become lookups.

Keep the tiers few. Organizations that invent seven levels end up with everything in the middle three because nobody can tell them apart. Four is usually right:

| Tier | Meaning | Examples in our scenario | Handling baseline |
| --- | --- | --- | --- |
| Public | Intended for release | Marketing pages, docs, status page | Integrity matters, confidentiality does not |
| Internal | Ordinary business data | Runbooks, architecture diagrams, non-customer metrics | Access limited to staff; encrypted in transit |
| Confidential | Customer data, commercially sensitive | Customer account records, contracts, support tickets | Encrypted in transit and at rest; access by role; logged |
| Restricted | Regulated or high-harm data | Patient names with appointment times, credentials, keys | Everything above, plus customer-managed keys, residency constraints, masked in tooling, minimum retention, access individually justified |

Two rules make a classification scheme survive contact with an engineering team.

**Classify the container by its highest-sensitivity content.** A database holding one restricted column is a restricted database. Teams try to argue otherwise and it never works operationally, because access is granted at the container level.

**Derived data inherits.** The export, the backup, the analytics copy, the test fixture built from real records, the log line containing a patient's phone number, the screenshot in the support ticket — all inherit the classification of the source. This is the rule people break constantly, and it is where regulated data ends up in unregulated places. The nightly export bucket in our scenario is restricted, not internal, because of what is inside it.

Classification only becomes operational when it is attached to resources. Tag them, and make the tag mandatory:

```yaml
tags:
  data-classification: restricted
  data-owner: clinical-platform
  contains-personal-data: "yes"
  retention-policy: appointments-24m
  primary-region: eu-west-1
```

Tags are cheap and they pay for themselves three times: automation can enforce rules per tier, cost and access reporting can be sliced by sensitivity, and — most usefully for this course — you can answer "where is all our restricted data" with a query instead of a meeting. A tag policy that rejects resource creation without a classification tag turns the whole scheme from documentation into a control.

## Encryption in transit

Encryption in transit protects data moving across a network from being read or altered by whoever can see the traffic. In practice this means TLS, and the compliance question is almost never "is TLS available" but "is anything else still possible".

**Enable is not enforce.** A load balancer that accepts both HTTP and HTTPS is not compliant with a requirement to protect data in transit, because the unprotected path still exists. The control is a redirect or an outright rejection of the plaintext listener, plus a way to prove no plaintext listener exists anywhere in scope.

**Set a floor on versions and ciphers.** Providers expose this as a security policy on the load balancer, an API gateway setting, or a minimum TLS version property on a storage account. Pick the current recommended floor rather than the default, which often exists for compatibility with very old clients. Where a specific version is mandated by a framework or a customer contract, take the version from the current document rather than from memory — these floors move, and a value that was correct three years ago is not a safe thing to assert now.

**Internal traffic counts.** The most common gap is traffic between tiers inside the network: application to database, application to cache, service to service. "It's inside the VPC" is not a control statement — it is the flat-network assumption that lesson 04's lateral-movement discussion was about. Managed databases generally support requiring TLS for client connections, and requiring it is a one-line setting that most teams leave at the permissive default.

**Storage endpoints too.** Requiring encrypted transport on a bucket is a policy condition, not a hope:

```json
{
  "Sid": "DenyUnencryptedTransport",
  "Effect": "Deny",
  "Principal": "*",
  "Action": "s3:*",
  "Resource": [
    "arn:aws:s3:::acme-prod-exports",
    "arn:aws:s3:::acme-prod-exports/*"
  ],
  "Condition": { "Bool": { "aws:SecureTransport": "false" } }
}
```

**Third parties are a transit boundary.** In our scenario, patient phone numbers go to an SMS provider. That hop is in scope for the same requirement, and the control includes verifying the endpoint's certificate properly rather than disabling verification because a library complained once.

The test for a transit control is pleasingly mechanical: attempt the plaintext connection and confirm it fails, then confirm the negotiated version and cipher on the encrypted one.

```bash
# Should fail or redirect — never return content over plaintext.
curl -sS -o /dev/null -w '%{http_code}\n' http://api.example.com/health

# Record the negotiated protocol and cipher as evidence.
openssl s_client -connect api.example.com:443 -brief </dev/null 2>&1 | head -20
```

## Encryption at rest, and what it actually proves

Encryption at rest means the stored bytes are unreadable without a key. It protects against a specific and narrow set of threats: disks leaving the building, storage media being improperly decommissioned, raw storage being accessed beneath the service layer, and a snapshot or backup file being obtained by someone who cannot call the service API.

It is important to be precise about what it does **not** protect against, because engineers and customers both over-read it. Encryption at rest does nothing against an attacker with valid credentials to the service. The database decrypts transparently for anyone it authorizes. If a support engineer's account is compromised, encryption at rest is irrelevant to what the attacker can read. This is why lesson 05 exists and why "yes, it's encrypted" is a poor answer to "is my data safe".

State that honestly to customers. "Encrypted at rest with keys we control, and separately, access to the data through the service is restricted to these four roles and logged" is a complete answer. "It's encrypted" invites a follow-up you will not enjoy.

### The key custody ladder

The real decision in encryption at rest is not whether, it is **who holds the key**, and that is the choice frameworks and customers actually care about.

**Provider-managed keys.** The provider creates, stores, rotates, and uses the key. You get encryption with essentially no work and no visibility. Adequate for internal and much confidential data. The limitation is that you cannot produce key-level access logs, you cannot revoke access by destroying the key, and you cannot show a customer a key policy.

**Customer-managed keys.** You create the key in the provider's key management service — AWS KMS, Azure Key Vault or Managed HSM, Google Cloud KMS — and control its policy, its rotation, and its lifecycle. The provider still operates the service and holds the material, but you decide who may use the key, every use is logged, and disabling the key renders the data unreadable. This is the tier most customer contracts mean when they ask for "customer-managed encryption", and it is the right default for restricted data.

**Customer-supplied or externally held keys.** You hold key material outside the provider, or in a dedicated hardware module, and supply or broker it. Maximum control, and a genuine operational burden: lose the key and the data is gone, permanently, with no support ticket that can help. Choose this only when a specific obligation requires it, and never without a tested key recovery procedure.

The mechanism underneath all three is **envelope encryption**, and knowing it prevents a common misconception. The service generates a unique data key per object or volume, encrypts the data with it, then encrypts that data key with your key from the key management service. Your key encrypts keys, not gigabytes. That is why rotating the top-level key is fast and why it does not re-encrypt your data — a point worth knowing before you promise a customer that rotation re-protects historical data. It does not; it changes what protects the data keys going forward.

### Key policy is an access control

The most frequently missed governance point: a customer-managed key has its own policy, and that policy is a second, independent access control on the data. If everyone who can read the database can also administer the key, the key adds process and no separation.

The separation to aim for:

- **Key administrators** may create, disable, schedule deletion of, and change the policy of the key. They may not use it to decrypt data.
- **Key users** may encrypt and decrypt using the key. They may not change its policy or delete it.
- Nobody holds both, and the assignment is reviewed in the access review from lesson 05.

That separation is what makes the key a meaningful boundary, and it is directly checkable — pull the key policy, list the principals in each category, and look for overlap.

Two more key-lifecycle points that show up as findings. **Rotation** should be enabled where the service offers it automatically, and where it does not, it needs a scheduled procedure with evidence that it ran. **Deletion** is irreversible and is protected by a mandatory waiting period on every major provider; treat a scheduled key deletion as a high-severity alert, because it is either a planned decommission or an attack.

### Choosing correctly, as a procedure

Given a dataset, the decision is mechanical once classification exists:

```text
1. What tier is it?                    → sets the baseline from the table
2. Does a contract or framework name
   a specific key custody arrangement? → that wins; take the wording from the
                                          document, not from memory
3. Is it restricted?                   → customer-managed key, with key
                                          admin/user separation
4. Confidential?                       → provider-managed acceptable;
                                          customer-managed if the customer asked
5. Internal or public?                 → provider-managed default is fine
6. Does it leave your control at any
   point (third party, export, backup)? → the copy inherits the tier; apply the
                                          same decision to the copy
7. Record the decision, the reason,
   and who approved it.
```

Step 6 is the one that catches people. In our scenario the nightly export is restricted data sitting in object storage, and it needs the same key custody decision as the database it came from. A team that encrypts the database with a customer-managed key and leaves the export bucket on the provider default has not implemented the control; it has implemented most of it, which in an audit is the same as a finding with a longer explanation.

## Residency, replication, and the border you cross by accident

**Data residency** is the question of which geography your data physically sits in. It arrives from three directions: law, contract, and customer expectation. The legal analysis of whether a given arrangement is permitted is emphatically not yours — this is one of the clearest hand-offs to counsel in the whole course, and the rules for international transfers have changed repeatedly and remain contested.

Your job is factual and it is difficult enough on its own: **say precisely where the data is**. Not "in Europe" — which regions, for which copies, including every derived copy. To answer that you have to enumerate:

- The primary store's region
- Every replica, including read replicas and any multi-region configuration
- Backups and snapshots, and whether backup copies are set to cross regions
- Object storage replication rules
- The log and metrics pipeline, which very often lands in a different region than the workload
- Managed service control planes and any global service that keeps metadata centrally
- Third parties — the SMS provider in our scenario receives a phone number and a message, and their processing location is part of the answer
- Support access paths: if an engineer in another country can view records in a console, that is a consideration, and a customer will ask about it

The enforcement side is more tractable than the discovery side. Every provider offers a way to constrain where resources may be created: organization policy constraints on resource locations in Google Cloud, Azure Policy with allowed-locations, service control policies with a region condition on AWS. That is a preventive control, it is cheap to evidence for a whole period, and it makes an entire class of accident structurally impossible. Applying it belongs in the guardrail set you designed in lesson 05.

Retention and deletion sit next to residency because they answer a similar family of questions and they use the same tags. A retention rule attached to the classification tier — implemented as an object lifecycle policy, a database retention setting, or a log retention configuration — converts a policy sentence into something that happens without anyone remembering. And deletion has the same derived-copy problem as everything else in this lesson: honouring a deletion request means locating the record in the primary store, the replicas, the backups, the exports, the logs, and the analytics copy. If your architecture cannot enumerate them, you cannot make the deletion claim truthfully, and the time to discover that is not the day the request arrives.

Two further controls worth naming briefly, because they change what the other controls have to protect:

**Masking and tokenization** reduce sensitivity at the point of use. A support console that shows the last four digits of a phone number rather than the whole thing has fewer people looking at restricted data, which shrinks the population your access review has to defend. Replacing an identifier with a token in the analytics pipeline can move that whole dataset down a tier. The cheapest data protection control is not having the data.

**Secrets** — keys, credentials, tokens — are restricted by definition, and belong in a secrets manager with access logging and rotation, never in a repository, a container image, an environment variable dump, or a configuration file. The static key in the SMS gateway's config from lesson 05 is simultaneously an identity finding and a data protection one.

## Practice

Work from this data inventory for the patient appointment reminder service. Today's date is the first week of a new quarter.

```text
ASSET                         CONTENTS                          CURRENT STATE
appointments-db               Patient name, phone, appointment  Managed relational DB,
                              time, clinic id                   provider-managed key,
                                                                TLS not required for
                                                                client connections
appointments-db-replica       Full copy, read only              Different region from
                                                                primary, same key setting
acme-prod-exports (bucket)    Nightly full DB export as CSV     Default encryption off,
                                                                bucket policy allows both
                                                                HTTP and HTTPS
app-logs (log group)          Request logs; message body is     Provider-managed key,
                              logged on error, includes phone   retention: never expire
                              number
support-console               Staff view of patient records     Shows full phone number
analytics-warehouse           Copy of appointments, refreshed   Provider-managed key,
                              nightly, used for capacity        no classification tag
                              planning
sms-provider (third party)    Phone number + message text       TLS to their API;
                                                                processing location unknown
marketing-site                Public pages                      Static hosting, HTTPS
ci-artifacts (bucket)         Build outputs; one fixture file   Provider-managed key
                              was seeded from real appointments
```

**Exercise 1 — Classify the inventory (the main artifact, part one).**

Produce a classification table with columns `Asset`, `Tier`, `Why`, `Personal data present?`, `Derived from`. Every asset gets a tier. For every derived copy, name its source and confirm the tier matches — if it does not, that mismatch is a finding you will use in Exercise 3.

**Exercise 2 — Write the encryption and residency decision record (the main artifact, part two).**

For each asset classified confidential or restricted, produce a decision record with these fields: `Asset`, `In transit control`, `At rest control`, `Key custody choice`, `Key admin/user separation`, `Regions where copies exist`, `Retention`, `Decision rationale`, `Decided by`. Use the decision procedure from this lesson and show your reasoning in the rationale field rather than just the outcome. Where a decision would depend on a legal determination, write the question you would send and to whom, and leave the field marked as pending — do not resolve it yourself.

**Exercise 3 — Fix the five worst problems.**

The inventory contains at least five distinct data protection defects. Identify them, rank them by likelihood and impact using the method from lesson 04, and for the top three write the specific change: which setting on which resource, plus the test that proves it. Write at least one of the fixes as a fenced policy or configuration block.

**Exercise 4 — Answer the customer.**

A customer asks two questions in one email: "Is our patient data encrypted, and does any of it leave the country?" Write the reply. It must be specific about in-transit and at-rest arrangements and key custody, must enumerate every copy's location including the third party, must be honest about what encryption at rest does and does not protect against, and must route the legal component of the residency question without stranding the customer. Keep it under 250 words, and mark clearly which sentence you would not send until a colleague confirms a fact.

**Exercise 5 — Trace a deletion.**

The customer's patient exercises a deletion right for one individual. List every place in the inventory that record exists, in the order you would address them, and mark each as: deletable now, deletable on a schedule, or blocked with a reason. Then write the one architectural change that would most reduce the number of places on your list.
