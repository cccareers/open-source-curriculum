---
lesson_id: cse101-10
course_id: cse101
pathway: cloud-support-engineer
title: "Project: Design a Cloud Solution for a Small Business"
order: 10
kind: project
competency_ids:
  - D2-S1-C01
  - D2-S1-C02
  - D2-S1-C03
  - D2-S1-C04
objectives: []
---

## The goal

Produce a written cloud design for a real small business, complete enough that another engineer could build it from your document and a business owner could approve it without asking you what any of it means.

You are not building anything. The deliverable is a design document, because that is the artifact an entry-level cloud support engineer is most often asked to read, check, and explain — long before anyone hands them a production account. Four judgments are being assessed, and they are the four things this course taught:

- Can you pick the right **compute abstraction** for each part of a workload and say why?
- Can you pick the right **storage shape, class, and lifecycle** for each kind of data?
- Can you design **least-privilege access** for a small team and its automation?
- Can you reason about **platform choice** on stated criteria, without brand loyalty and without depending on any one provider's product names?

Budget two hours. This is a design exercise, not a research project — if you are an hour in and still comparing pricing pages, you are optimizing the wrong thing.

## The client

**Talbot & Vine** is a twenty-person architectural photography studio with two offices. They currently run everything on a server in a storage cupboard in the larger office, which is out of disk space and was last backed up in a way anyone can describe in March. The owner wants to move to the cloud before the cupboard makes the decision for them.

What they have:

- **A public marketing website.** Mostly static pages and a large image gallery. Roughly 30,000 visitors a month, spiking sharply when a project is published in a trade magazine — the last spike was about 12× normal traffic for two days.
- **An internal project-tracking web application.** Custom-built four years ago by a contractor, a standard web framework with a relational database. About 25 GB of data. Used by the twenty staff during business hours, plus about a dozen freelancers who log in occasionally. It is a long-running service; it must respond quickly and it is used all day.
- **An image archive.** 30 TB today, growing about 1 TB per month. Original camera files average 45 MB each. A shoot is worked on intensively for two to three weeks, referenced occasionally for about a year (client revisions, reprints), and after that touched maybe once or twice a decade — but it must never be deleted, because past work is the studio's portfolio and its legal record of what was delivered.
- **A thumbnail and preview generator.** When photos are uploaded, something must produce web-sized previews. Today this is a script that runs on the cupboard server and takes hours. Uploads arrive in bursts — nothing for two days, then 400 files at once when a shoot is delivered.
- **Client proof galleries.** Clients get a link to review a shoot. Roughly 40 active galleries at a time, each viewed a few dozen times over two weeks, then abandoned.

Who touches it:

- **The owner** — wants the monthly number, wants the archive safe, does not want to administer anything.
- **Two senior photographers** — upload, organize, and delete work in the archive.
- **Twelve staff** (photographers, retouchers, admin) — read and write their own projects, read others'.
- **About a dozen freelance retouchers** — need access to *one* project's files at a time, for the duration of a contract, and no more.
- **The contractor** who maintains the project-tracking app — deploys new versions occasionally, needs to read application logs.
- **The bookkeeper** — needs to see the cloud invoice, and nothing else.

What the owner has said, in the owner's words: *"I don't want to be locked into one company. And I want to know what it costs before we start, not after."*

## Requirements

Numbered so a reviewer can grade them one at a time. Each states what your document must contain.

**R1 — A component inventory.** A table listing every component of the solution, what it does, and which of the client's five workloads it serves. A reviewer must be able to check your later sections against this list and find nothing unaccounted for.

**R2 — A compute decision per workload.** For the marketing site, the project-tracking application, the thumbnail generator, and the proof galleries, name the compute abstraction — virtual machine, container, or serverless function — and justify each in no more than three sentences using the workload's actual properties. For each, name the runner-up abstraction and the specific property that ruled it out. At least two different abstractions must appear across your four answers; if all four came out the same, re-read the workload descriptions.

**R3 — A storage decision per data type.** For each distinct body of data — the project-tracking database, the image archive, the web-sized previews, the proof galleries, the marketing site's assets, and the backups — state the storage shape (block, file, or object) and, where it is object storage, the initial storage class. Justify each against its access pattern.

**R4 — A lifecycle policy for the image archive.** Written out in the rule structure from lesson 05: filter, transitions with day thresholds, expiration or explicit non-expiration, a noncurrent-version rule, and an incomplete-upload rule. Below it, a small table showing which class a single shoot's files occupy at 1 week, 1 month, 6 months, 2 years, and 10 years. Then two sentences on what a full archive restore would mean for the studio — how long, and roughly what order of magnitude it would cost.

**R5 — An access model.** A table with one row per role, and columns for: purpose, who holds it, what it may do (three to five permission areas), at least one explicit exclusion, and the credential type and lifetime. You must cover the owner, senior photographers, staff, freelancers, the contractor, the bookkeeper, and at least one non-human identity. The freelancer role is the interesting one — scope it to a single project's files, and say by what mechanism.

**R6 — Three blast-radius answers.** For three of your roles, answer: if this credential were posted publicly right now, what is the worst outcome, and what in your design limits it? At least one must be a non-human identity.

**R7 — A backup and protection design.** For the database and for the image archive separately: what is backed up, how often, where the copies live, who can delete them, the RPO, the RTO, and how a restore is tested. State the one failure your design does not defend against and why that is an acceptable decision to hand to this owner.

**R8 — A platform comparison.** Compare the three major providers against criteria *you* derive from this client's stated needs — not generic criteria copied from a blog. State at least five criteria, score each provider, and make a recommendation. For every service in your design, give the product name on your recommended platform **and** on one other, so the design is demonstrably portable. Then answer the owner's lock-in concern directly, in language the owner would use: what would actually be hard to move later, and what would be easy?

**R9 — A cost sanity check.** Not a full estimate — a one-page table of the five or six largest expected line items with rough monthly figures, plus one sentence each on what drives that number up. Your compute choices in R2 and your storage choices in R3 and R4 must be visible in it; if a decision you made does not show up on the bill, say which line it is hiding in.

**R10 — A one-page summary for the owner.** Plain language, no jargon that is not introduced in the same sentence, leading with the answer. It must cover: what will change, roughly what it will cost monthly, what is safer than the cupboard, what the studio still has to do themselves, and what you need from the owner to proceed. This page must be readable on its own, without the rest of the document.

## Constraints

- **Vendor neutrality is a hard constraint.** Your design's *structure* must be expressed in the service families from lesson 04. Naming products is fine and expected — naming them on only one platform is not, and a design that cannot be read by someone who has never used your recommended provider fails R8.
- **No console click-paths.** Describe what must be true, not which blue button to press.
- **Nothing is built.** No accounts, no deployments, no code. If you find yourself provisioning something, stop.
- **Every number is either cited or labelled an estimate.** A cited price names the page and the date. An estimate says "estimate" and states its assumption.
- **Scope discipline.** Detailed network design, monitoring and alerting architecture, CI/CD pipelines, and regulatory compliance frameworks are out of scope for this course. Where your design touches one, note it in a short "deferred" list with one line on why — do not design it.
- **Two hours.** If you must cut something, cut breadth of research, not R5 or R10.

## Definition of done

Your submission is complete when all of the following are true:

1. All ten requirements are present, each clearly labelled with its requirement number.
2. Every compute and storage decision states the workload property that decided it — not a general merit of the technology.
3. Every role in the access model has at least one explicit exclusion, and no role is "everything."
4. The lifecycle policy is syntactically complete and internally consistent with the class timeline table beneath it.
5. At least two different compute abstractions appear across R2, with the runner-up named for each.
6. Every service named in the design has a named equivalent on at least one other platform.
7. The cost table's line items trace back to specific decisions elsewhere in the document.
8. The owner's page contains no unexplained jargon and states a number.
9. Every figure is cited or explicitly labelled an estimate.
10. A reviewer can disagree with any single decision and find your reasoning for it stated in one place.

## Hints

**Read the workload descriptions for the deciding property.** Each of the five workloads has one sentence that settles its compute abstraction. "Nothing for two days, then 400 files at once" is one. "Used by twenty staff all day, must respond quickly" is another. Find them before you start writing.

**The archive is the interesting storage problem, and age alone is not the answer.** Three access phases are described — intensive, occasional, and almost never — and the files are large, which matters for whether tiering pays. Also note what is *not* said: nothing gives you permission to delete anything, ever. A lifecycle policy with no expiration is a legitimate policy; say so deliberately rather than by omission.

**The freelancer role is the test of whether you understood least privilege.** A dozen people, one project each, for a fixed period, rotating. If your answer is "give them read access to the archive," reread lesson 06. Think about how scope is expressed — a prefix, a tag, a condition, a time bound — and about what removes the access when the contract ends. Something must, and naming that mechanism is the point.

**Non-human identities are easy to forget and easy to over-privilege.** The thumbnail generator is one. It reads an uploaded original and writes a preview. That is two permissions on two prefixes, not access to the archive.

**Derive the platform criteria from the owner's words.** The owner said two things: no lock-in, and know the cost first. Those are criteria. So are the properties of the workloads — archive storage pricing matters enormously here, a 12× traffic spike makes scaling behaviour matter, and "does not want to administer anything" favours managed services over raw instances. Generic criteria like "market share" earn nothing.

**Cost intuition from lesson 07, so your sanity check is not embarrassing.** Thirty terabytes of archive is a meaningful number but probably not your largest line. An always-on database and an always-on application are steadier costs than people expect. Serving a large image gallery to 30,000 visitors makes data transfer out a line worth checking. Something that runs in bursts and idles the rest of the time costs almost nothing as a function and full price as a virtual machine.

**Write R10 last, then check it against the rest.** If the owner's page promises something your design does not contain, the design is wrong or the page is. Either way you found it before a reviewer did.

**One page you did not write is worth adding if you have time:** the list of what you deferred and why. It reads as judgment rather than omission, and it is the difference between a design that ignored monitoring and a design that scoped it.
