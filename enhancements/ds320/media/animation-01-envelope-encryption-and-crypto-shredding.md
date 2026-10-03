---
course_id: ds320
media_id: ds320-a01
type: animation-storyboard
title: "Envelopes, Keys, and Shredding: How a KMS Protects Data It Never Sees"
target_runtime: "90 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - ds320-05
objectives:
  - Apply encryption in transit and at rest, and manage the keys that make it meaningful
competency_ids:
  - D5-S1-C01
---

## Concept and misconception it fixes

Misconceptions: (1) "the KMS encrypts our data" — it encrypts small data keys; bulk data never travels to it; (2) "rotation means re-encrypting everything" — automatic KEK rotation re-wraps nothing and changes no data; (3) "deleting a person's data from immutable files is impossible" — with a dedicated key per partition or subject group, destroying the key renders the data unrecoverable (crypto-shredding), subject to privacy/legal accepting it as erasure.

## Visual language (shapes, colors with color-blind-safe palette, labels)

- KMS: a vault icon with a thick border labelled "KMS (boundary)"; the KEK is a gold key (#E69F00) that never leaves it.
- DEK: a small blue key (#0072B2); wrapped DEK: the blue key inside an envelope icon.
- Data: a stack of Parquet file icons; ciphertext shown with a padlock glyph and scrambled text texture.
- Permissions: a checklist card labelled "key policy" with ticks and crosses (shapes, not color alone).
- Audit log: a scrolling list in the corner, each entry "Decrypt | principal | context".

## Scenes

| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 10s | Pipeline service on the left, `crm_contacts` extract file, KMS vault on the right. | Pipeline sends a small request arrow to the vault labelled `GenerateDataKey, context={dataset: crm_contacts, classification: confidential}`. | "To encrypt a file, the pipeline asks the KMS for a data key, naming the dataset and classification as encryption context." |
| 2 | 10s | Vault returns two items: a plain blue DEK and the same DEK sealed in an envelope (wrapped by the gold KEK). Gold key stays inside. | Items slide out; gold key glows but stays. | "It gets back a plaintext data key and a wrapped copy. The key-encryption key never leaves the KMS." |
| 3 | 10s | Pipeline uses the plain DEK to encrypt the file locally; file becomes ciphertext. Plain DEK dissolves. Envelope is stapled to the file. | Encrypt animation; DEK fades to dust. | "The file is encrypted locally with the data key, the plaintext key is discarded, and the wrapped key is stored beside the ciphertext." |
| 4 | 10s | A stranger icon copies the file from a misconfigured bucket. It holds ciphertext and an envelope it cannot open. | Stranger tries envelope; it stays sealed. | "Steal the file and you get ciphertext plus an envelope only the KMS can open." |
| 5 | 12s | Analytics role sends the envelope plus correct context to the KMS. Key policy card ticks `analytics: Decrypt`. DEK returns; file decrypts. Audit log adds a line. | Tick animation; log line appears. | "An authorized reader sends the envelope with the same context. The key policy allows Decrypt, the KMS returns the data key, and the call is logged." |
| 6 | 8s | Same reader sends the envelope with context `dataset: web_events`. Request bounces with an X. Log line "DENIED". | Bounce animation. | "Wrong context, no key. A wrapped key can't be replayed against a different dataset." |
| 7 | 8s | Key admin icon tries Decrypt; policy shows `admin: manage ✓, use ✗`. Bounce. | Cross mark on "use". | "Administrators can manage the key but not use it. Readers can use it but not delete it. Separation of duties, in cryptography." |
| 8 | 10s | Rotation: inside the vault, a new gold key appears beside the old one; old one is labelled "decrypt only". Files and envelopes outside do not move. | Second gold key fades in; nothing outside changes. | "Automatic rotation adds new key material for new encryption and keeps the old for existing envelopes. No data is rewritten." |
| 9 | 12s | Landing zone as daily partitions, each with its own key (blue, green, purple outlines with labels `2026-07-01`...). A deletion request covers subject group in partition `2026-07-03`. Its key is scheduled for deletion; a countdown "pending deletion: 7-30 days" appears; then the key shatters. Files remain but are permanently ciphertext. | Countdown, then shatter. | "Crypto-shredding: if a partition has its own key, destroying the key makes that data unrecoverable without rewriting a byte. Managed KMSs make deletion deliberately slow, because it's irreversible. And whether this counts as erasure is privacy's call, not yours." |

## Interaction variant (optional)

A step-through with buttons for each principal (pipeline, analyst, admin, stranger) and a context dropdown; the learner predicts allow/deny before clicking, then sees the audit log line. Ends with a "design your key granularity" slider (one key per dataset / per day / per subject group) showing the trade-off between shredding precision and key count.

## Production notes

- Use the exact alias and context from lesson 5 (`alias/warehouse-confidential`, `{"dataset":"crm_contacts","classification":"confidential"}`) so learners can match the animation to the CLI commands.
- The pending-deletion window varies by provider (for example, AWS KMS allows 7-30 days); keep the on-screen label generic or verify before naming a provider.
- No step should imply learners write their own cryptography; scene 3's "encrypt locally" should show a library icon labelled "vetted library".
