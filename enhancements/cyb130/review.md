---
course_id: cyb130
title: "Access Control & Identity Management — Enhancement Review"
reviewed_lessons: 6
status: draft
---

## Summary
cyb130 is precise and practical. It separates the three As cleanly, chooses MFA by population rather than by product, builds roles from jobs with explicit exclusions, and treats privilege creep as a removal problem. The examples (Northbay, Cedar Point, Ashford, Maya Okonkwo, Ravensworth) are strong and evidence-based. The two biggest opportunities are hands-on work and consistency. Learners never run anything, so the effective-permissions and lifecycle ideas stay on paper. Maya Okonkwo also appears in Ashford's HR extract with an unexplained employer change (her lesson 02 start date was out of step too; this pass aligns it to 1 March 2021). This pass adds two runnable projects and fixes three technical or clarity points in the lessons.

## Clarity issues
| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| cyb130-02 | "Identity, account, credential, entitlement" | Maya is "hired March 3", but lesson 05's trace has "Mar 2021" and the HR extract has start date 2021-03-01. | Changed to "hired 1 March 2021". | Applied |
| cyb130-03 | "The methods, ranked..." (TOTP) | "The seed never leaves the device after enrollment" is inaccurate. The authentication service also holds the seed, and that store is a target. | Reworded to say the seed is held by the device and the service, and the service copy needs protecting. | Applied |
| cyb130-04 | "Effective permissions..." | The heading "The union of share and file-system permissions" contradicts the body. The effective result is the *more restrictive* layer, not a union. "The reverse looks fine and is not" doesn't explain why. | Retitled, flagged it as the one non-accumulating mechanism, and explained the local and alternate-share access path. | Applied |
| cyb130-05 | Practice Part 3 | M Okonkwo appears in **Ashford's** HR and directory extracts, but her lesson 02 and 05 history reads as a separate employer (AP to procurement). Learners may wonder whether Ashford is Maya's employer. | Proposed: add one sentence to Part 3 saying Maya's trace took place at Ashford, or rename the Ashford record. Needs an owner decision. | Proposed |
| cyb130-04 / -06 | Currency | Cedar Point and Maya use $; Ashford (£2,000) and Ravensworth Building Society are UK-flavoured. | Proposed: localize consistently (the pathway is a US apprenticeship). | Proposed |
| cyb130-03 | Summary table, "Needs network" | FIDO2 and smart cards are marked "Needs network: Yes". The authenticator itself works offline, and only the sign-in needs the service. Learners may read this as "the key needs connectivity". | Proposed footnote: "the network column refers to delivering the factor, not reaching the service". | Proposed |

## Depth and coverage gaps
- **Effective permissions are never computed** (objective: *Model roles and permissions that grant least privilege for a described organization*). Project x02 lets learners test an allow/deny matrix and watch a separation-of-duties break appear after a careless mover.
- **Lifecycle detection is manual only** (objective: *Trace an identity through joiner, mover, and leaver events and identify where privilege accumulates*). Lesson 05 describes the five detection queries. Project x01 implements them over the lesson's own Ashford data, with acceptance tests.
- **Missing misconception: "MFA on the identity provider covers non-federated apps."** Ravensworth's core banking local user list shows the problem, but lesson 03 never says it outright. A sentence in "Layering: conditional and risk-based access" would help (objective: *Select and roll out an MFA method appropriate to a stated user population and risk level*).
- **Token and session revocation** is in lesson 05's leaver checklist but has no worked example. A short "disabled at 17:00, mail synced at 19:30" vignette would make it concrete.
- **Check your understanding** blocks were missing; added to lessons 02–05.

## Proposed additional projects
- **x01 Ashford Entitlement Drift Finder** (drafted, `projects/01-ashford-entitlement-drift-finder.md`): a Python script over HR, directory, role, add-on, and SoD CSVs that flags orphaned, unowned, dormant, drift, and SoD breaks. Ships with fixtures and a passing acceptance test, verified against a reference solution.
- **x02 Cedar Point Least-Privilege Lab** (drafted, `projects/02-cedar-point-least-privilege-lab.md`): a `--network none` container with POSIX groups standing in for resource groups, an allow/deny matrix test, a mover-without-removal failure, and mover/leaver scripts. Verified in Docker.
- MFA enrollment-flow critique pack: three anonymized enrollment flows for learners to assess with the lesson 03 Part 5 questions. Not drafted.
- Service-desk reset role-play with caller and verifier cards, one of which is a social-engineering attempt using employee number plus date of birth. Not drafted.

## Video and animation opportunities
- **Factor or not?** (cyb130-02): rapid classification drills suit video pacing. Talking head. **Drafted: `media/video-01-factor-or-not.md`.**
- **Choosing MFA for Northbay** (cyb130-03): reasoning through six inputs per population. Whiteboard. **Drafted: `media/video-02-choosing-mfa-for-northbay.md`.**
- **Five years of Maya** (cyb130-05): accumulation over time is invisible in a table. Explainer animation. **Drafted: `media/animation-01-privilege-creep.md`.**
- **Federated login flow** (cyb130-02): redirect, authenticate, signed assertion, session. Animation built on the existing `federated-login-flow.png`. Not drafted.
- **Effective-permissions walk** (cyb130-04): tracing `rmartin` hop by hop to the HR share. Screencast. Not drafted.

## Assessment ideas
- An auto-graded classification quiz of 20 credentials (lesson 02 Part 1), including "not a factor" options.
- MFA-or-not combination items (e.g., password + PIN; smart card + PIN; push without number matching plus password).
- A rubric row for the Ravensworth audit: "the who-can-move-money answer lists every path, including nested groups, core-banking local roles, and admins able to self-grant".
- A short-answer item: give the correct mover order, and say why silence means removal.

## Changes applied in this pass
- `lessons/02-authentication-authorization-and-identity.md`, "Identity, account, credential, entitlement": Maya's hire date aligned to 1 March 2021.
- `lessons/02-authentication-authorization-and-identity.md`, end: added "Check your understanding".
- `lessons/03-multi-factor-authentication-in-practice.md`, "The methods, ranked by what they resist": corrected the TOTP seed statement.
- `lessons/03-multi-factor-authentication-in-practice.md`, end: added "Check your understanding".
- `lessons/04-rbac-and-least-privilege.md`, "Effective permissions, and why they surprise people": fixed the share/file-system "union" wording and explained the reverse case.
- `lessons/04-rbac-and-least-privilege.md`, end: added "Check your understanding".
- `lessons/05-identity-lifecycle-joiners-movers-leavers.md`, end: added "Check your understanding".

## Open questions for the course owner
- Is Maya Okonkwo an Ashford employee? (See the clarity table.) If not, rename the Ashford HR record.
- Should the course standardize on US settings and currency?
- **NIST SP 800-63B.** Lesson 02 says mainstream guidance has moved away from forced rotation and composition rules. That is consistent with 800-63B, but revision 4 was in progress at the time of writing and I did not verify its final status in this pass. Check before citing it by name.
- **Passkey synchronization.** Lesson 03 says to "confirm whether synchronization is acceptable". Do you want to add guidance on synced versus device-bound passkeys for administrators? Vendor support changes quickly, so I did not assert specifics.
- **x02 lab image.** It uses stock `alpine:3` with BusyBox `adduser`, `addgroup`, and `su`, and was verified with Docker 29. Confirm the program's lab policy allows Docker.
