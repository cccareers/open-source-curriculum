---
course_id: db200
title: "NoSQL Databases — Enhancement Review"
reviewed_lessons: 6
status: draft
---

## Summary

db200 is well written and appropriately opinionated. It teaches judgment ("name the property you're buying"), not product tours, and lesson 06's Trail Pulse project is an excellent capstone. The main weaknesses are a few product-specific claims that are dated or contested (MongoDB's PACELC label, ObjectId layout, driver return shapes), a missing local setup path for transactions, and a domain discontinuity: lesson 02 switches to a shop-order example, while lessons 04–05 use the events board from db100/node101. This pass corrects the claims, adds the setup, ties the examples back to the course thread, and adds self-checks to lessons 02–05.

## Clarity issues

| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| db200-02 | "Document stores" | Says the order "would have been four rows across three tables in your db100 schema", but db100 modeled an events board, not orders | Reworded to describe a relational order schema "built the way you learned in db100" | Applied |
| db200-02 | "Practice" item 1 | Asks for "the orders/…/products schema you built in db100", which learners never built | Item now asks learners to sketch that relational schema first | Applied |
| db200-03 | "The trade you make when nothing is broken" | States "MongoDB is PC/EC by default" as settled fact. Abadi's 2012 paper classed it PA/EC, and behavior depends on read and write concern | Rewrote to present the disagreement and the configuration-dependence | Applied |
| db200-04 | "The method inverts" | Says the events board was the domain "you served over HTTP in node101" but omits db100, where learners modeled it | Added the db100 reference | Applied |
| db200-04 | "Embed or reference" | "If it no longer fits in place, move it on disk" describes the retired MMAPv1 engine; WiredTiger writes a new version of the whole document | Replaced with the whole-document rewrite cost | Applied |
| db200-04 | "Handling change" | "Migrate on read … upgrading each document as it is written" is contradictory | Clarified: read all versions, upgrade on next write | Applied |
| db200-05 | "Documents, `_id`, and BSON" | ObjectId described as timestamp + machine id + counter; current spec is timestamp + per-process random value + counter | Corrected with a note about older docs | Applied |
| db200-05 | "Connecting once, correctly" | `server.js` never calls the rsvps `ensureIndexes`, so the unique index that the RSVP feature depends on never gets created | Added the import and call, with an explanation | Applied |
| db200-05 | "Updating without clobbering" | Code relies on driver 6 `findOneAndUpdate` returning the document; driver 5 returned `{ value }` and many tutorials show that | Added a version note | Applied |
| db200-05 | "The feature: registering an attendee" | Says transactions need a replica set but the lesson's `docker run` starts a standalone server, so learners can't try it | Added single-node replica-set commands and URI | Applied |
| db200-05 | "The route layer" | Express 4 async behavior stated without mentioning Express 5 (now the npm default) | Added one sentence on Express 5 | Applied |

## Depth and coverage gaps

- **No self-checks** in lessons 02–05 (all objectives). Added "Check your understanding" with answers.
- **Build an application feature against a document database:** the lesson's own feature still oversells capacity, because there's no capacity check. A conditional update (`$expr` filter) is the natural next idea. Project db200-x01 and video v01 cover it.
- **Build an application feature against a document database:** no automated tests anywhere in lesson 05, although CONTRIBUTING asks coding projects to ship learner-runnable tests. Project db200-x01 supplies a `node:test` suite against real MongoDB.
- **Explain the consistency and availability trade-offs described by CAP:** quorum arithmetic is explained but never practiced with feedback. Project db200-x02 makes it testable.
- **Model data around an application's access patterns:** the wide-column modeling exercise (practice item 9) has no worked example. A short CQL example for AP5 ("my upcoming events") would help.
- **Compare the NoSQL data-store families and the workloads each suits:** practice item 5 asks for vendor citations, but the lesson gives no guidance on judging documentation age. A sentence on checking the docs version would help.
- **Justify a data-store choice on technical and operational grounds:** lesson 06 has a strong brief but no rubric. See Assessment ideas.

## Proposed additional projects

- **db200-x01 Capacity Limits and a Fair Waitlist** (drafted): atomic conditional updates, fair waitlist numbering, and promotion on cancel. `node:test` suite verified against MongoDB 7; it reliably fails a naive read-then-write implementation.
- **db200-x02 Quorum and Capacity Calculator for Feasibility Reviews** (drafted): tested arithmetic for `W + R > N`, write rates, and storage, feeding the lesson 06 sizing appendix. Tests verified.
- Not drafted: **Postgres `jsonb` bake-off**: implement AP1, AP2, and AP5 against both MongoDB and Postgres `jsonb` with GIN indexes, compare `explain` output, and write a one-page "do we need a second store?" memo.
- Not drafted: **Redis session and rate-limit store**: move Trail Pulse part 4 into Redis with TTLs, with tests for expiry and the fixed-window counter.

## Video and animation opportunities

- **The oversold workshop: atomic updates instead of read-then-write** (db200-05): screencast. Drafted as `media/video-01-the-oversold-workshop.md`.
- **CAP is one choice, not pick two** (db200-03): whiteboard. Drafted as `media/video-02-cap-is-one-choice.md`.
- **Partition, quorum, and the lost update** (db200-03): explainer animation showing CP refusal, AP last-write-wins loss, and quorum overlap. Drafted as `media/animation-01-partition-and-quorum.md`.
- Not drafted: **Embed vs reference, read cost over time** (db200-04): animation of an event document growing as attendees embed, compared with the subset pattern.
- Not drafted: **Reading `explain()`** (db200-05): screencast going from COLLSCAN to IXSCAN with `totalDocsExamined`.

## Assessment ideas

- Lesson 06 rubric: one row per requirement (R1–R9) with Developing, Meets, and Exceeds descriptors. "Exceeds" for R5 means a sensitivity range, not a single number.
- Quorum quick-check: ten `(N, W, R)` triples; mark each strong or not, and give writes and reads tolerated.
- "Which family?" sorting cards drawn from lesson 02's workloads plus three new ones, each needing the property bought and the property given up.
- Code review exercise: give learners a `register` function with a read-then-write race and a spread `req.body` insert. They must find both.

## Changes applied in this pass

- `02-the-nosql-families-and-their-feature-sets.md`, "Document stores": reworded the db100 comparison so it doesn't claim learners built an orders schema.
- `02-the-nosql-families-and-their-feature-sets.md`, "Practice": item 1 now asks learners to sketch the relational order schema first.
- `02-the-nosql-families-and-their-feature-sets.md`: added "Check your understanding."
- `03-cap-theorem-and-consistency-trade-offs.md`, "The trade you make when nothing is broken": replaced the flat "MongoDB is PC/EC" claim with an accurate, configuration-dependent statement.
- `03-cap-theorem-and-consistency-trade-offs.md`: added "Check your understanding."
- `04-modeling-for-access-patterns.md`, "The method inverts": linked the events-board domain back to db100.
- `04-modeling-for-access-patterns.md`, "Embed or reference": replaced the outdated in-place/move-on-disk explanation.
- `04-modeling-for-access-patterns.md`, "Handling change": clarified the migrate-on-read definition.
- `04-modeling-for-access-patterns.md`: added "Check your understanding."
- `05-building-against-a-document-database.md`, "Documents, `_id`, and BSON": corrected the ObjectId byte layout.
- `05-building-against-a-document-database.md`, "Connecting once, correctly": `server.js` now creates the rsvps indexes, with an explanation.
- `05-building-against-a-document-database.md`, "Updating without clobbering": added the driver v6 return-shape note.
- `05-building-against-a-document-database.md`, "The feature: registering an attendee": added single-node replica-set setup for transactions.
- `05-building-against-a-document-database.md`, "The route layer": added the Express 5 note.
- `05-building-against-a-document-database.md`: added "Check your understanding."

## Open questions for the course owner

- Lesson 06's breadcrumb volume (about 2.5 billion points over 18 months) can't be derived from the stated figures without assuming daily hike counts. Is the gap intentional, as a "check the arithmetic" trap, or should the scenario state hikes per day?
- Lessons reference `./img/nosql-families-same-data.png`, `./img/cap-partition-choice.png`, and `./img/embed-vs-reference.png`; no `img/` folder exists in `db200/lessons/`.
- The PACELC labels for MongoDB, DynamoDB, and others vary by source and version. Decide whether the course should drop per-product labels and keep only the per-configuration framing.
- Pin versions in lesson 05 (`mongodb@6`, `mongo:7`, Express 4 or 5) so code and prose stay in step.
- Lesson 05's suggested `docker run ... mongo:7` failed in my environment only because Docker's disk was full; unrelated to the course, but worth a troubleshooting line ("No space left on device" means pruning Docker images).
