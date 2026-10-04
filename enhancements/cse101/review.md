---
course_id: cse101
title: "Introduction to Cloud Computing — Enhancement Review"
reviewed_lessons: 10
status: draft
---

## Summary
A strong, vendor-neutral introduction: every lesson teaches a transferable mental model (the responsibility line, the three compute subdivisions, the service-family Rosetta table, the four storage meters) and ends with substantial graded practice. The biggest opportunity is hands-on practice that is safe and free: lesson 05 permits a local object-storage emulator and lesson 06 a documented example environment, but neither shows how to set one up, lesson 08 has no offline path, and the course has no cost-safety checklist and no automated way for a learner to prove the result. A few provider facts in reference tables have drifted and one practice step (lesson 05, part 5) contradicts the versioning concept it is testing.

## Clarity issues
| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| cse101-05 | "Practice" — Part 5, step 3 | Asked learners to show "the prior version does not" exist after delete on a versioned bucket. With versioning on, prior versions survive; step 4 then asks to restore one, so the step contradicted itself. | Reworded: delete marker becomes current, both prior versions still listed; capture versioned and non-versioned listings. | Applied |
| cse101-05 | "Storage classes" table | Archive minimum duration given as "~180 days"; Google Cloud Archive's minimum is 365 days, and retrieval behaviour differs sharply between providers' archive classes. | Changed cell to "~180–365 days", added a note on retrieval-time variation. | Applied |
| cse101-04 | "The service families" table | Google renamed Cloud Functions to Cloud Run functions; Deployment Manager is being retired in favour of Infrastructure Manager. | Updated both cells with "formerly/successor" wording. | Applied |
| cse101-08 | "Making the application deployable" Dockerfile | `CMD` JSON array hard-coded `0.0.0.0:8080`, breaking the lesson's own rule 1 (port comes from the environment); the `__main__` startup log line never runs under gunicorn, yet the verification section asks learners to find "the startup line". | Shell-form `CMD exec gunicorn --bind "0.0.0.0:${PORT:-8080}" ...` plus a paragraph explaining both points. | Applied |
| cse101-03 | "Images and layers" Dockerfile | Same hard-coded 8080 bind; acceptable here because lesson 03 is about layering, but learners copy it into lesson 08. | Add a one-line comment pointing forward to lesson 08's `${PORT}` form. | Proposed |
| cse101-04 | "The service families" table | Azure Synapse Analytics is increasingly positioned under Microsoft Fabric; "Container Registry" should read "Azure Container Registry" to be searchable. | Verify current naming before editing. | Proposed |
| cse101-06 | "How the three platforms express this" | "Cloud Identity" as Google's identity store is accurate only for organizations not on Google Workspace; Workspace tenants use the same directory. | Add "(or Google Workspace directory)". | Proposed |

## Depth and coverage gaps
- **Hands-on without a bill** (objectives: "Choose a cloud storage class and lifecycle policy that fits a workload's access pattern"; "Apply least-privilege identity and access management to a cloud account"). Lesson 05 allows a local object-storage emulator and lesson 06 a documented example environment, but neither gives setup steps or a way to check the result. LocalStack plus `awslocal` covers versioning, lifecycle configuration and bucket policies offline — drafted as project x01. Note that emulators accept lifecycle rules but do not age objects, so transitions must be reasoned about, not observed.
- **Cost-safety step** ("Deploy a simple application to a cloud environment and verify it is serving traffic"). Lesson 08 has a cleanup section but no pre-deployment budget alert. Add "create a budget alert at a small threshold before step 1" to the deployment sequence table.
- **Worked numeric example for the serverless/container crossover** ("Estimate what a cloud workload costs and explain the business case for running it in the cloud"). Lesson 07 asks for the crossover in practice part 3 but shows no worked version; one fully worked example with illustrative prices would let learners check their method.
- **Misconception: "stopped VM = no cost"** ("Explain how virtualization, containers, and serverless functions divide physical hardware into usable compute"). Mentioned once in lesson 03; worth a short animation (proposed, not drafted).
- **Customer-communication practice with a cost number** ("Explain a cloud concept or a cloud bill to a non-technical customer in plain language"). Lesson 09 is excellent; a scored rubric for the 90-second explanation would make peer review consistent.

## Proposed additional projects
- **x01 — Talbot & Vine Archive Bucket, Emulated** (drafted): versioned bucket, lifecycle policy, least-privilege thumbnail-generator policy on LocalStack, with an automated acceptance script.
- **x02 — Ship hello-cloud and Prove It Serves Traffic** (drafted): containerize lesson 08's app, deploy locally and optionally to a free tier, run a verification script that produces the evidence pack, then tear down.
- Bill-anomaly case file: a synthetic CSV of daily cost lines for a month with one injected anomaly; learner finds the service, meter, resource and start date, then writes the lesson 09 customer update.
- Responsibility-matrix card sort: 30 incident cards placed on the nine-layer stack for IaaS/PaaS/SaaS variants, with an answer key.
- Rosetta table scavenger hunt on a fourth provider (e.g. Oracle Cloud or a regional provider) to test that the method transfers.

## Video and animation opportunities
- **Who owns this failure?** — lesson 02; whiteboard; walking the four worked examples across the nine-layer stack makes the per-service line visible. *Drafted: media/video-01-who-owns-this-failure.md.*
- **Verifying it actually serves traffic** — lesson 08; screencast; the outside-in verification order is procedural and benefits from seeing real `dig`/`curl -iv` output. *Drafted: media/video-02-verify-it-serves-traffic.md.*
- **One server, three subdivisions** — lesson 03; explainer animation; VM vs container vs function boundaries and start times are invisible. *Drafted: media/animation-01-one-server-three-subdivisions.md.*
- **The life of a shoot** — lesson 05; explainer animation; objects moving through classes over ten years, with minimum-duration and retrieval penalties. *Drafted: media/animation-02-life-of-a-shoot.md.*
- Policy evaluation (allow accumulate, guardrail cap, deny wins) — lesson 06; animation; not drafted.
- Reading a bill anomaly by drilling service → meter → resource → day — lesson 07; screencast with a synthetic cost console; not drafted.

## Assessment ideas
- Ten-item classification quiz drawn from lesson 02 part 1 with arguable items flagged and model reasoning.
- Policy-reading items: show a generic policy and a request, learner answers allow/deny and names the rule.
- Estimate audit: give a line-item estimate with three planted errors (missing egress, wrong hours, undated price); learner finds them.
- Rubric for lesson 09 part 4 (90-second explanation): answer-first, one number, analogy with stated limit, no unexplained jargon, listener could restate it.

## Changes applied in this pass
- `05-cloud-storage-and-the-data-lifecycle.md`, "Storage classes" table: archive minimum duration widened to ~180–365 days; added note on provider-specific retrieval behaviour.
- `05-cloud-storage-and-the-data-lifecycle.md`, "Practice" part 5 step 3: corrected the versioning/delete-marker expectation.
- `04-working-across-major-cloud-providers.md`, "The service families" table: Cloud Run functions and Infrastructure Manager naming.
- `08-deploying-your-first-cloud-application.md`, "Making the application deployable": `CMD` now honours `${PORT}`; explained JSON-array vs shell form and where the startup log line comes from under gunicorn.
- `02-service-models-and-shared-responsibility.md`: appended "Check your understanding".
- `06-identity-and-access-management-fundamentals.md`: appended "Check your understanding".
- `07-cloud-economics-and-the-business-case.md`: appended "Check your understanding".

## Open questions for the course owner
- **Unverified provider facts** (check before publishing): Google Deployment Manager retirement date and Infrastructure Manager as successor; Cloud Run functions naming; Google Archive 365-day minimum and Azure Archive rehydration time; whether Azure Synapse should be replaced by Fabric in the table.
- **Pricing**: the illustrative prices in lesson 07 and in project x02's cost note are deliberately round and not quotes. No current free-tier allowance was verified for any provider; projects tell learners to check the free-tier page on the day.
- **LocalStack behaviour**: the community edition supports S3 versioning, lifecycle configuration storage and bucket policies, but does not enforce IAM by default (`ENFORCE_IAM` is a Pro feature in recent versions). Project x01 therefore validates policy *structure* offline and treats enforcement as an optional real-account step. Confirm this matches your tooling stance.
- Should lesson 10's design project gain an optional "build one slice on an emulator" extension, or stay purely written as the course.json rationale intends?
