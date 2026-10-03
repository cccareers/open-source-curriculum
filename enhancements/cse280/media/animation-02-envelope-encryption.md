---
course_id: cse280
media_id: cse280-a02
type: animation-storyboard
title: "Envelope Encryption, Key Custody, and What Rotation Really Does"
target_runtime: "80 sec"
suggested_tool: "Manim"
related_lessons:
  - cse280-06
objectives:
  - Protect data with encryption, classification, and residency controls appropriate to its sensitivity
competency_ids:
  - D3-S1-C04
---

## Concept and misconception it fixes
Learners think a customer-managed key encrypts the data directly, that rotating it re-encrypts historical data, and that "encrypted at rest" protects against an attacker with valid service credentials. The animation shows data keys wrapped by a key-encryption key, rotation changing only what wraps new data keys, the admin/user separation on the key policy, and the transparent decrypt path that encryption at rest does not block.

## Visual language (shapes, colors with color-blind-safe palette, labels)
- Data blocks: rectangles labelled "appointments page 1…n".
- Data key: small key icon labelled "DK-1", "DK-2"; key-encryption key: large key icon labelled "CMK (v1)", later "CMK (v2)" inside a vault box "KMS".
- Encrypted state shown by a padlock glyph plus a crosshatch pattern; plaintext by no pattern.
- Principals: two badges "key admin" and "key user", with explicit allowed/denied verbs printed beside each.
- Okabe-Ito colours: #0072B2 (CMK), #E69F00 (data keys), #009E73 (allowed), #D55E00 (denied), always with text.

## Scenes
| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 10s | Database writes a page; service generates DK-1, encrypts page (padlock appears). | DK-1 locks the page. | "The storage service creates a data key for each object or volume and encrypts the data with it." |
| 2 | 10s | DK-1 itself is wrapped by CMK v1 inside the KMS vault; wrapped DK-1 stored beside the page. | DK-1 gets a padlock. | "Then it encrypts that data key with your key in the key management service. Your key encrypts keys, not gigabytes." |
| 3 | 12s | Rotation: CMK v2 appears; old pages keep "DK wrapped by v1"; a new page gets DK-2 wrapped by v2. v1 stays in the vault, labelled "retained to unwrap old keys". | Version tag flips for new writes only. | "Rotate the key: new data keys are wrapped by version two. Old data keys stay wrapped by version one, which is kept. Rotation does not re-encrypt your history." |
| 4 | 12s | Key policy panel: "key admin — create, disable, schedule deletion, edit policy; decrypt ✗" and "key user — encrypt, decrypt; edit policy ✗". A person icon tries to hold both badges; a red ✗ "no overlap". | Badges slide apart. | "The key has its own policy — a second access control. Administrators manage it but can't decrypt. Users decrypt but can't change it. Nobody holds both." |
| 5 | 12s | An attacker icon holding a valid app credential queries the database; the service unwraps and returns plaintext rows. Caption box: "Encryption at rest: not a barrier here". | Rows flow out in plaintext. | "Now the honest part. With valid service credentials, the database decrypts transparently. Encryption at rest protects disks, snapshots, and media — not a stolen login. That's what access control is for." |
| 6 | 10s | Key admin clicks "disable CMK". All wrapped DKs become unusable; pages stay locked; app shows "decrypt failed". Separate panel: "scheduled deletion → high-severity alert". | Padlocks turn solid; alert banner. | "Disable the key and the data is unreadable — a powerful control and a dangerous one. A scheduled key deletion should page someone." |
| 7 | 14s | Export bucket and backup vault appear, each with the same tier tag "restricted" and their own CMK. A provider-managed key on the export is crossed out. | Tag "inherits" arrows. | "And every copy inherits the classification. The nightly export and the backup need the same custody decision as the database they came from." |

## Interaction variant (optional)
Step-through where the learner chooses a principal (admin, user, app, attacker with app credential) and an action (decrypt, rotate, disable, read via service) and sees allowed/denied with the reason.

## Production notes
- Keep provider-neutral labels (KMS / Key Vault / Cloud KMS shown once in a footnote card).
- Scene 5 is the most important correction; give it a held frame.
