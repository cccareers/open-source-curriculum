---
lesson_id: cse101-05
course_id: cse101
pathway: cloud-support-engineer
title: Cloud Storage and the Data Lifecycle
order: 5
kind: lesson
competency_ids:
  - D2-S1-C03
objectives:
  - Choose a cloud storage class and lifecycle policy that fits a workload's
    access pattern
---

## Three shapes of storage

Cloud storage is not one product. It is three fundamentally different things that beginners conflate, and choosing wrong is expensive in a way that is hard to undo later. The distinction is about *what the storage looks like to the thing using it*.

**Block storage** presents a raw disk. The consumer is an operating system, which puts a filesystem on it and treats it exactly like a physical drive: read and write arbitrary 512-byte or 4 KB blocks at arbitrary offsets. It is attached to one machine at a time, it exists in one availability zone, and it is meaningless without a machine to attach it to. Databases, operating system disks, and anything doing small random writes want block storage.

**File storage** presents a shared filesystem — directories, paths, permissions, and a protocol like NFS or SMB. Many machines mount the same filesystem at the same time and see each other's changes. It is what you reach for when an application was written assuming a filesystem and you cannot change that assumption, or when several machines genuinely need to share files.

**Object storage** presents neither. There is no filesystem, no directories, and no partial writes. There is a flat namespace of containers — called buckets or containers depending on the platform — and inside each one, objects identified by a key. You `PUT` a whole object and `GET` a whole object, over HTTP. It scales without limit, costs a fraction of the others, and is where the overwhelming majority of cloud data actually lives.

| | Block | File | Object |
| --- | --- | --- | --- |
| Interface | Raw device, via OS | NFS / SMB filesystem | HTTP API |
| Unit | Block | File | Object (whole) |
| Partial update | Yes | Yes | No — rewrite the object |
| Attached to | One instance (usually) | Many instances | Nothing; reached over network |
| Scope | One availability zone | Regional | Regional or multi-regional |
| Practical size limit | Tens of TB per volume | Petabyte range | Effectively unlimited |
| Relative cost per GB | Highest | High | Lowest |
| Latency | Sub-millisecond | Low milliseconds | Tens of milliseconds |
| Typical use | Database files, OS disks | Shared app directories, lift-and-shift | Backups, media, logs, static sites, data lakes |

The single most common architecture mistake in small cloud deployments is putting user uploads on a virtual machine's block volume. It works, right up until you need a second machine, or the machine dies, or the volume fills at 3 a.m. Objects belong in object storage; the cure is to move them there and the cure gets harder every month you wait.

### Object storage, in more detail

Because object storage is where the tiering and lifecycle decisions live, it is worth being precise about how it behaves.

An object has a **key**, some **bytes**, and **metadata**. The key looks like a path — `2026/07/invoices/inv-4482.pdf` — but the slashes are just characters. There are no directories; the console renders a folder tree by grouping on prefixes as a convenience. This matters because listing is a prefix scan: a well-chosen key prefix makes "all of July's invoices" a cheap listing, and a badly chosen one makes it a scan of everything.

Metadata comes in two kinds. System metadata is the content type, size, timestamps, encryption state, and storage class. User metadata is arbitrary key-value pairs you attach. Reading metadata is cheap and does not transfer the object body, which makes a `HEAD`-style request the right tool for "does this exist and how big is it."

Writes are **atomic on the whole object**. There is no appending and no editing byte 400. Uploading a new version of a key replaces it wholesale, and a failed upload leaves the previous object intact. Large uploads use a multipart mechanism — split, upload parts in parallel, then commit. An abandoned multipart upload leaves parts that you are *billed for and cannot see in a normal listing*, which is a genuinely common source of mystery charges. Lifecycle rules can clean them up, and should.

**Versioning**, when enabled, keeps every previous version of a key instead of discarding it. A delete becomes a marker rather than an erasure. This is the best protection against accidental deletion and application bugs that exists, and it has a cost consequence people forget: you are now paying for every version ever written, forever, unless a lifecycle rule expires the old ones. Versioning without a noncurrent-version rule is a bill that only goes up.

**Consistency** on all three major platforms is now strongly consistent for reads after writes: once a `PUT` returns success, a subsequent `GET` returns the new bytes. Older documentation and older engineers will tell you about eventual consistency and the elaborate workarounds it required. That history is worth knowing so you can recognize obsolete advice.

### Block storage, in more detail

A cloud block volume is not a disk in the chassis; it is a network-attached volume that the hypervisor presents to the guest as a local disk. That has three consequences.

It **survives its instance**. Detach a volume from a terminated instance and attach it to a new one, and the data is there — provided you did not check the box that deletes it with the instance, which is often the default for the root volume and often not for the others. Know which.

Its **performance is a purchased quantity**. You buy IOPS and throughput, sometimes bundled with capacity and sometimes provisioned separately. Volume types range from spinning-disk-backed for cheap sequential work, through general-purpose SSD, to high-IOPS SSD for demanding databases. Undersized volume performance shows up as inexplicable application slowness with idle CPU — a classic misdiagnosis.

It is **zonal**. A volume lives in one availability zone and can only attach to an instance in that zone. Moving to another zone means a snapshot and a restore.

**Snapshots** are point-in-time copies, stored in the background on object storage, and usually incremental — the first is full, the rest capture changes. A snapshot of a running database is *crash-consistent*, not *application-consistent*: it looks to the database exactly like the power was cut. Well-built databases recover from that, but the reliable pattern is to quiesce or use the database's own backup mechanism.

### File storage, in more detail

Managed file storage gives many instances one mount point. It is priced well above object storage per gigabyte and frequently comes in performance tiers of its own, sometimes billed on provisioned throughput. Reach for it when an application demands a POSIX filesystem across several machines and rewriting it is not on the table — a shared upload directory for a legacy content management system is the canonical case. Do not reach for it as a default. A great deal of managed file storage in the world is object storage that lost an argument.

## Storage classes: paying for the access pattern

Within object storage, providers sell several **storage classes** (also called tiers). They store the same bytes with the same durability. What differs is the price ratio between *keeping* data and *reading* it.

The rule underneath all of it: **classes trade storage price against access price.** Colder classes cost less per gigabyte-month and more per read, plus they add minimum durations and retrieval delays.

| Tier concept | Access pattern | Retrieval time | Min. storage duration | AWS | Azure | Google Cloud |
| --- | --- | --- | --- | --- | --- | --- |
| Hot / standard | Frequent, latency-sensitive | Immediate | None | S3 Standard | Hot | Standard |
| Infrequent access | Read maybe monthly | Immediate | ~30 days | S3 Standard-IA | Cool | Nearline |
| Cold | Read a few times a year | Immediate | ~90 days | S3 Glacier Instant Retrieval | Cold | Coldline |
| Archive | Rarely; compliance retention | Minutes to hours | ~180 days | S3 Glacier Deep Archive | Archive | Archive |
| Intelligent / automatic | Unknown or changing | Immediate | Varies | S3 Intelligent-Tiering | *(lifecycle-based)* | Autoclass |

Names and exact numbers change; look them up for the platform in front of you. The *shape* has been stable for a decade.

Three cost mechanics decide most real tiering decisions, and all three are easy to miss:

**Minimum storage duration.** Store an object in a 30-day-minimum class and delete it after 5 days, and you are billed as though you kept it 30. Tiering data that gets deleted quickly makes the bill go up.

**Retrieval charges.** Colder classes charge per gigabyte retrieved, sometimes substantially. A cold archive read once by accident — a backup verification script, a full-text indexer, an over-eager analytics job — can produce a retrieval charge larger than a year of storage.

**Per-object overhead.** Several classes bill a minimum object size (commonly 128 KB) and add a small per-object metadata charge. Ten million 2 KB objects in an archive class can cost more than in standard. Tiering is for *big* cold things.

The practical result is a decision rule you can apply in one line: **tier by size and access frequency together, never by age alone.** Old and large and untouched is a tiering candidate. Old and tiny is not, whatever the age says.

## Durability, availability, and the things people confuse with backup

**Durability** is the probability the bytes still exist. Object storage is typically advertised at eleven nines — 99.999999999% annual durability — achieved by writing redundant copies or erasure-coded fragments across multiple facilities. In practice, provider-side data loss is not a risk you plan around.

**Availability** is the probability you can reach the bytes right now. Advertised at something like three to four nines and materially lower for colder classes. Durable and unavailable is a real state, and it is the one an outage produces.

**Neither is backup.** Durability protects against disk failure. It offers nothing at all against the three things that actually destroy data: someone deleting it, an application corrupting it, and ransomware encrypting it. The provider will replicate your deletion with the same eleven nines of reliability.

So the layers that do protect you:

- **Versioning** — keeps prior versions of an overwritten or deleted object.
- **Soft delete / retention windows** — a grace period before deletes become permanent.
- **Object lock / immutability** — an object cannot be deleted or altered until a date passes, sometimes not even by an administrator. This is what actually stops ransomware and a compromised admin account.
- **Replication to another location** — same-region for availability, cross-region for regional disaster and sometimes for latency or residency.
- **Backups in a separate account or subscription** — because the credential that can delete production should not be able to delete the backups. This is a permissions design, and lesson 06 is where it is built.

Two numbers govern how much of this you buy. **RPO** — recovery point objective — is how much data you can afford to lose, measured in time; it sets backup frequency. **RTO** — recovery time objective — is how long you can afford to be down; it sets how the restore works and whether you can afford an archive tier's retrieval delay. An hourly backup gives an RPO of one hour. A backup in a class that takes twelve hours to retrieve gives an RTO of at least twelve hours, no matter what your plan says.

And the rule that outranks the rest: **a backup you have never restored is not a backup.** Restore drills, on a schedule, with the time recorded.

## Lifecycle policies

A **lifecycle policy** is a set of rules the storage service evaluates on your objects, usually once a day, without you running anything. Rules select objects by prefix, by tag, by age, and by version state, and then take an action: transition to another class, expire (delete), or abort incomplete multipart uploads.

Each platform's syntax differs; the structure does not. Here is a representative policy for application logs, written in the shape most platforms use:

```json
{
  "rules": [
    {
      "id": "logs-tiering",
      "status": "Enabled",
      "filter": { "prefix": "logs/" },
      "transitions": [
        { "days": 30, "storage_class": "INFREQUENT_ACCESS" },
        { "days": 90, "storage_class": "ARCHIVE" }
      ],
      "expiration": { "days": 2555 }
    },
    {
      "id": "expire-old-versions",
      "status": "Enabled",
      "filter": { "prefix": "" },
      "noncurrent_version_expiration": { "noncurrent_days": 90 }
    },
    {
      "id": "clean-failed-uploads",
      "status": "Enabled",
      "filter": { "prefix": "" },
      "abort_incomplete_multipart_upload": { "days_after_initiation": 7 }
    }
  ]
}
```

Read what those three rules are each doing. The first says logs are read often for a month, occasionally for two more, and after that exist only because an auditor may ask — then they are deleted at seven years. The second stops versioning from accumulating forever. The third sweeps up abandoned uploads nobody can see.

Rules to follow when you write one:

- **Transitions only go colder.** Moving back to a hotter class is a copy operation you perform deliberately, not a lifecycle action.
- **Respect minimum durations.** A transition at day 30 into a class with a 30-day minimum, followed by another transition at day 45, means you pay the first class's full minimum anyway.
- **Expiration is permanent.** With versioning on, expiration of a current version creates a delete marker and the old version lingers until its own rule fires. Reason about both rules together or you will be surprised in either direction.
- **Add the incomplete-upload rule to every bucket.** It costs nothing and it silently prevents a category of billing mystery.
- **Deploy to one prefix first.** Lifecycle rules act on everything matching, quietly, at scale. A too-broad filter is a data-loss event with no warning dialog.

### The data lifecycle, end to end

Lifecycle *policies* are the automation. The **data lifecycle** is the larger thing they automate, and a design that only thinks about tiering has usually skipped the two ends, which are the parts that get organizations in trouble.

**1. Creation and classification.** At the moment data is written, two facts should already be decided: what kind of data this is (public marketing asset, internal document, customer record, regulated record) and how long it must be kept. Encoding that in the key prefix or in object tags at write time is nearly free. Reconstructing it two years later across four million objects is a project. This is the single highest-leverage habit in data management and it costs one design conversation.

**2. Active use.** Hot class, versioning on, access scoped narrowly. The data is read often and correctness matters more than storage price.

**3. Declining access.** The transition window. Reads drop but have not stopped. This is where infrequent-access and cold classes earn their keep, and where the retrieval-cost arithmetic decides how far you go.

**4. Retention.** The data is no longer used but may not be deleted, because a contract, a regulation, or a business commitment says so. Archive class, plus — where the requirement is legal rather than merely cautious — immutability so that no credential can shorten the retention.

**5. Disposal.** The step almost everyone omits. Data you no longer need and are not required to keep is pure liability: it costs money every month and it is one misconfiguration away from being a breach. Deleting it on schedule is a security control, not just a cost control. Expiration rules are how you make disposal happen without anybody having to remember.

Two mechanisms attach to the retention step and are worth knowing by name. A **retention period** says an object cannot be deleted before a date. A **legal hold** suspends deletion indefinitely, regardless of any policy, until it is explicitly lifted — used when litigation or an investigation is anticipated. A legal hold overrides lifecycle expiration, which is exactly the behaviour you want and exactly the behaviour that surprises the person wondering why their expiry rule is not firing.

One organizational note, because it decides whether any of this works: **somebody must own the retention schedule**, and it is not the storage service. Retention periods come from legal, finance, and contractual obligations. The engineer's job is to implement a schedule accurately and to refuse to invent one. "How long do we keep this?" answered with "seven years, probably" is how a company ends up with either a compliance finding or a decade of data it is paying to protect for no reason.

### Worked example: three workloads, three answers

**Security camera footage from a small retail chain.** 400 GB per month arrives. Regulation and insurance require two years of retention. Footage is reviewed only when there is an incident — a few times a year, always within the last two weeks.

Hot for 14 days covers the review window. Then straight to archive; the retrieval delay is acceptable because pulling footage for a claim is not a real-time task. Expire at 730 days. Files are large, so per-object overhead is irrelevant. This is close to the ideal tiering candidate: big, cold, and legally required to exist.

**A photo-sharing application's user uploads.** Objects average 3 MB. New photos are viewed heavily for a week, occasionally for a few months, and almost never after a year — but a user can open any photo at any time and expects it to load immediately.

Hot for 30 days, then infrequent access, then a cold class that still has immediate retrieval. **Not** archive, at any age: archive's retrieval delay would show a user a spinner for hours, which is a product failure rather than a cost saving. This is the case where the retrieval-time column outranks the price column. Automatic tiering is a strong option here precisely because the per-object access pattern is unpredictable.

**Nightly database exports for a 40-person company.** One 12 GB compressed file per night. Restores happen from the last few days; older exports exist for audit.

Hot for 7 days, cold for 90, archive to one year, expire at one year — plus versioning and object lock so a compromised credential cannot destroy the backups. RPO here is 24 hours by construction; if the business cannot lose a day of orders, the answer is not a lifecycle policy, it is more frequent backups. Say that out loud when you present the design.

### Where storage costs actually come from

Four meters, and beginners watch only the first:

1. **Storage** — gigabyte-months, per class.
2. **Requests** — per thousand or per ten thousand operations. Writes cost more than reads. An application that lists a bucket in a loop can spend real money on requests while storing almost nothing.
3. **Retrieval** — per gigabyte pulled out of a cold class.
4. **Data transfer out** — egress to the internet or to another region. Within a region and within a zone it is usually free; out to the internet it is usually the largest single line item on a media-heavy bill.

That fourth meter is why serving images directly from object storage to a global audience is often more expensive than putting a content delivery network in front of it, and it is the number one reason a storage bill does not match a storage estimate. Lesson 07 puts numbers on all four.

## Practice

**Part 1 — Classify eight workloads.** For each, name the storage shape (block, file, or object) and, if object, the initial storage class. Justify each in one sentence naming the deciding property.

1. The data files of a transactional PostgreSQL database.
2. Compiled release artifacts, downloaded a few times per release, kept for five years.
3. A shared `/uploads` directory for three web servers running an application you cannot modify.
4. Raw sensor readings, 50 GB/day, queried by analysts for the current quarter and retained seven years.
5. The boot disk of a virtual machine.
6. A static marketing website's images and stylesheets.
7. Legal contracts that must be provably unaltered for ten years.
8. A scratch directory for a video encoding job that is deleted when the job finishes.

**Part 2 — Write a lifecycle policy.** For workload 4 above, write a complete lifecycle policy in the JSON structure used in this lesson. It must include at least two transitions, an expiration, a noncurrent-version rule, and an incomplete-upload rule. Below the policy, write a short table showing, for a single object, which class it is in during each period of its life and roughly what fraction of the standard price you are paying in each. Then answer: what would break if the analysts started re-running quarterly reports over the full seven years?

**Part 3 — Cost arithmetic.** Using the real published prices of any one provider (cite the page and the date), compute the monthly storage cost of the camera-footage workload from this lesson under two designs: everything in the hot class for two years, versus the tiered design described. Show the steady-state accumulated volume in each class and the resulting monthly figure. Then compute what a single full retrieval of one year of footage would cost under the tiered design, and state in one sentence how that changes your recommendation — or does not.

**Part 4 — Design the protection layers.** For the nightly-database-export workload, write a one-page protection design covering: versioning, retention or immutability, where the copies live, who can delete them, RPO, RTO, and the restore drill schedule. For each choice, name the specific failure it defends against. Include one failure your design explicitly does not defend against, and say why that is an acceptable decision to hand to a business owner.

**Part 5 — Hands-on, on any platform.** Using free-tier resources or a local object-storage emulator, do all of the following and capture the commands and outputs:

1. Create a bucket or container and enable versioning.
2. Upload a file, overwrite it with different contents, and list all versions.
3. Delete the object, then list again and show that a delete marker exists and the prior version does not.
4. Restore the previous version and confirm the contents.
5. Apply a lifecycle rule that expires noncurrent versions after one day, and show the configuration as the service reports it back.
6. Read the storage class of one object with a metadata-only request and show that no object body was transferred.

**Deliverable:** one document containing the eight classifications, the lifecycle policy with its class timeline, the cost arithmetic with cited prices, the protection design, and the transcript from part 5.
