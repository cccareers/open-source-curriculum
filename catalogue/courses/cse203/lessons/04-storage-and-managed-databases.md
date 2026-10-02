---
lesson_id: cse203-04
course_id: cse203
pathway: cloud-support-engineer
title: Storage and Managed Databases
order: 4
kind: lesson
competency_ids:
  - D2-S1-C03
objectives:
  - Select cloud storage and managed database services that fit a workload's durability and access needs
---

## Three shapes of storage

Every cloud sells dozens of storage products with unmemorable names. They are all one of three shapes, and knowing which shape a workload needs eliminates most of the catalogue before you read a single price page.

**Block storage** presents raw blocks that an operating system formats with a filesystem and mounts as a disk. This is the volume you attached to an instance in lesson 02. It behaves like a local disk because that is what it is pretending to be: low latency, random reads and writes, and a filesystem on top. The defining constraint is that it is attached to *one* machine at a time and lives in *one* availability zone. Databases, operating system root disks, and anything doing small random writes want block storage.

**Object storage** stores whole objects — a file plus its metadata — retrieved by key over an HTTP API. There is no filesystem, no mounting, and no partial write: you `PUT` an object and you `GET` an object. In exchange you get effectively unlimited capacity, storage priced at a small fraction of block storage, access from anywhere with credentials, and durability guarantees no single disk could offer. AWS calls it S3, Azure calls it Blob Storage, Google Cloud calls it Cloud Storage. Uploads, backups, logs, images, exports, static site assets, and data lakes all belong here.

**File storage** presents a shared filesystem over a network protocol — NFS for Linux, SMB for Windows — that many machines can mount at once. It is more expensive per gigabyte than either of the others, and it exists for one reason: software that expects a POSIX filesystem and needs several machines to see the same files. Legacy applications with a shared upload directory are the archetype. If you are choosing file storage for something new, check first whether object storage would do, because it usually would and it costs a fraction as much.

The mistake to avoid is using block storage as a dumping ground. A 500 GB volume attached to an instance, holding uploaded documents that are read twice a year, costs several times what the same data costs in object storage, cannot be reached by any other machine, cannot survive the loss of its availability zone, and grows into a resize-and-downtime problem. When somebody says "we need a bigger disk", the right first question is what is on it.

## Durability, availability, and what neither of them means

Providers publish two numbers for a storage service and they measure different things.

**Durability** is the probability that an object you stored is still intact. Object storage is typically quoted at eleven nines — 99.999999999% annual durability — which the provider achieves by writing every object to multiple devices across multiple facilities, continuously verifying checksums, and repairing from redundant copies. The number is deliberately absurd: it means that for practical purposes the provider will not lose your data through hardware failure.

**Availability** is the probability the service answers when you ask. It is a much smaller number — commonly 99.9% or 99.99% — because it covers outages, throttling, and control-plane problems. Data can be perfectly durable and temporarily unreachable, and for a customer-facing application those look identical.

Now the part that gets people fired. **Neither number protects you from yourself.** Eleven nines of durability says nothing about a script that deletes the wrong prefix, a ransomware process that encrypts every object it can write to, or an engineer who drops a table. The provider will durably store exactly what you told it to store, including nothing.

What protects you from that is a small set of deliberate features:

- **Versioning.** With versioning on, an overwrite creates a new version and a delete writes a marker rather than removing bytes. Recovering from an accidental deletion becomes a metadata operation. Turn it on for anything you would be sorry to lose, and pair it with a lifecycle rule that expires old versions so the bill does not grow forever.
- **A copy in another account or another region.** Replication that a compromised credential in the source account cannot reach is the difference between an incident and a disaster.
- **Retention locks.** Object lock, immutability policies, or their equivalents make an object undeletable for a stated period — even by an administrator. This is what a regulated backup actually requires.
- **Tested restores.** A backup nobody has restored is a hypothesis. The date of the last successful test restore is a real operational metric and you should be able to state it.

When a customer asks "is our data safe in the cloud", the honest answer is that it is safe from disk failure by default and safe from everything else only to the extent that somebody configured it to be.

## Object storage and data lifecycle management

Object storage organises everything into **buckets** — a container with a globally unique name — holding **objects** identified by a **key**. The key is a flat string. `2026/07/invoices/inv-1042.pdf` looks like a path and the console will draw it as folders, but there are no directories; the slashes are characters in the name and the console is being kind. This matters because listing is a prefix scan, so keys that share a meaningful prefix are cheap to enumerate and keys that scatter randomly are not.

Every object carries **metadata**: content type, size, timestamps, a checksum, and any custom key-value pairs you attach. Content type matters more than people expect — an object served with the wrong type will download instead of display, and this is a routine support ticket.

Access is denied by default. Grant it with an identity policy attached to a role, or a resource policy attached to the bucket, and prefer roles over any long-lived key. For giving somebody time-limited access to one object without any credential at all, use a **pre-signed URL**: a link with an embedded signature and an expiry. It is the correct answer to "can you send me that export" and it beats making a bucket public, which is the single most reported cloud data breach in existence. Every provider now offers an account-level block on public access; leave it on unless you are deliberately hosting a public static site.

### Storage classes

The reason storage costs so little is that you are expected to tell the provider how you intend to use the data. Every provider offers a ladder of **storage classes** trading retrieval cost and speed against storage price:

- **Standard / hot.** Millisecond access, no retrieval fee, highest per-gigabyte price. For data read regularly.
- **Infrequent access / cool.** Roughly half the storage price, plus a per-gigabyte retrieval charge, plus a minimum storage duration — typically 30 days — that you are billed for even if you delete sooner. For data read a few times a year.
- **Archive / cold.** A small fraction of standard storage price, retrieval measured in minutes to hours, a substantial retrieval fee, and a minimum duration of 90 to 180 days. For compliance copies and backups you hope never to read.
- **Deep archive.** Cheapest of all, retrieval in hours, longest minimum. For "the regulator says seven years".
- **Intelligent tiering.** The provider watches access patterns and moves objects between tiers automatically for a small per-object monitoring fee. Worth it when access patterns are genuinely unknown; not worth it for many tiny objects, where the monitoring fee can exceed the saving.

The two traps are both arithmetic. **Minimum storage duration** means archiving an object you delete next week costs more than leaving it in standard. **Retrieval fees** mean a cool-tier object read every day costs more than a standard-tier one — the crossover is roughly at one read per object per month, so if the data is read more often than that, cheaper storage is a false economy.

### Lifecycle policies

**Data lifecycle management** is the practice of deciding, in advance, what happens to data as it ages, and then having the platform enforce it without anybody remembering to. A lifecycle policy is a set of rules attached to a bucket, evaluated daily by the provider, matching objects by prefix or tag and either transitioning them to another class or expiring them entirely.

Here is a policy for application logs, in the JSON shape AWS uses; Azure expresses the same thing as a management policy and Google Cloud as an object lifecycle configuration, with the same three ingredients — a filter, an age, and an action:

```json
{
  "Rules": [
    {
      "ID": "logs-tiering-and-expiry",
      "Status": "Enabled",
      "Filter": { "Prefix": "logs/" },
      "Transitions": [
        { "Days": 30, "StorageClass": "STANDARD_IA" },
        { "Days": 90, "StorageClass": "GLACIER" }
      ],
      "Expiration": { "Days": 400 }
    },
    {
      "ID": "expire-old-versions",
      "Status": "Enabled",
      "Filter": { "Prefix": "" },
      "NoncurrentVersionExpiration": { "NoncurrentDays": 30 }
    },
    {
      "ID": "clean-failed-uploads",
      "Status": "Enabled",
      "Filter": { "Prefix": "" },
      "AbortIncompleteMultipartUpload": { "DaysAfterInitiation": 7 }
    }
  ]
}
```

Read what those three rules buy. Logs stay instantly readable for a month, cheap for two more, archived for a year in case an auditor asks, then deleted — which also means somebody has decided, on the record, that thirteen-month-old logs have no value. Old versions from the versioning you turned on stop accumulating forever. And incomplete multipart uploads, which are invisible in the console and bill as stored data indefinitely, get cleaned up; this last one is a genuinely common source of a mystery line on a bill.

Writing a lifecycle policy forces a conversation nobody has otherwise: how long is this data actually useful, and how long are we obliged to keep it? Those are different questions with different answers, and the second one is a legal question you escalate rather than decide. What you can do is make sure the answer, once given, is enforced by the platform rather than by an intention.

## Block storage, revisited

You attached a volume in lesson 02. Three properties decide whether a volume is the right one.

**Type and performance.** General-purpose SSD is the default and is right for almost everything. Provisioned-IOPS SSD costs considerably more and exists for databases that need a guaranteed floor of random operations per second. Throughput-optimised HDD is cheap per gigabyte and fast for large sequential reads, and terrible at random access. Choose on the access pattern, not on the size.

**Size and performance are often linked.** On several providers, baseline IOPS scales with volume size, so a 20 GB general-purpose volume can be slow purely because it is small. A database that is inexplicably sluggish on a small disk is a real diagnosis.

**Snapshots.** Point-in-time copies, stored in object storage, incremental after the first. They are the backup mechanism for block storage, and they are also how a volume moves between zones or gets restored after a bad change. Snapshots can be scheduled by policy, and they should be, because a manual snapshot regime lasts exactly as long as the person who remembers it.

Volumes can usually be grown while attached, but growing the volume does not grow the filesystem — that is a separate operating-system step, and forgetting it is why "I resized the disk and it is still full" happens.

## Selecting a managed database

The intake for this course names databases, and the scope here is deliberate: **choosing, provisioning, connecting to, and stating the guarantees of** a managed database service. Schema design, query tuning, and SQL are somebody else's course.

A managed database is the provider running the engine for you: they handle installation, patching, backups, replication, and failover; you get an endpoint, a credential, and a set of knobs. The alternative — installing PostgreSQL on the instance you built in lesson 02 — is cheaper on paper and almost always a false economy, because you have just made yourself responsible for backup, restore testing, patching, replication, failover, and being awake at 3 a.m.

**Relational or non-relational.** Choose relational — PostgreSQL, MySQL, SQL Server — when the data has a fixed shape, when relationships between entities matter, and when transactions must be all-or-nothing. That is most business applications. Choose a key-value or document store when the access pattern is a simple lookup by key at very high volume, when the shape of each record varies, and when horizontal scale matters more than joins. Choose it because the access pattern fits, never because it sounds modern.

**Provisioned or serverless capacity.** A provisioned database is an instance you size the way you sized a virtual machine, billed while it runs. A serverless database scales its capacity with load and bills by consumption, which suits spiky or intermittent workloads and development environments that idle overnight. The trade-off is a scale-up delay and a cost model that is harder to predict for steady load.

**Sizing.** Same discipline as lesson 02, with one addition that catches everyone: **connection limits**. A managed database's maximum connections is a function of its instance size, and every application process holds several. A modest database in front of an autoscaling application tier will hit its connection ceiling long before it runs out of CPU, and the symptom — "too many connections" under load — looks nothing like a sizing problem. Connection pooling is the answer, and knowing that the limit exists is the part you own.

Five guarantees you must be able to state for any database you provision, because a customer will ask and because they define what "safe" means for their data:

1. **Backup window and retention.** Automated backups run in a stated window and are kept for a configurable number of days. Know the retention and know that the default is often shorter than the customer assumes.
2. **Point-in-time recovery.** Continuous transaction-log capture lets you restore to any second within the retention window. This is the feature that recovers from a bad `DELETE` at 14:32 — you restore to 14:31, into a *new* instance, and reconcile. Restores never overwrite the running database, which surprises people and is correct.
3. **Failover.** A high-availability deployment keeps a standby in a second availability zone with synchronous replication, and promotes it automatically if the primary fails. Failover takes a minute or two and applications see dropped connections and must reconnect — an application that does not retry will report an outage even though the database recovered. It roughly doubles the cost, and for anything a business depends on it is the correct choice.
4. **Read replicas.** Asynchronous copies used to serve read traffic. They reduce load on the primary and they lag, so a read immediately after a write may return stale data. A replica is a performance feature, not a backup.
5. **Maintenance windows.** The provider patches the engine on a schedule you choose. Choosing it deliberately, and telling the customer, is the difference between planned and unplanned.

**Connectivity.** Everything you built in lesson 03 applies. A managed database belongs in a private or isolated subnet across two zones, with a security group whose only inbound rule permits the database port from the application tier's security group. It should have no public endpoint. Applications reach it by its DNS endpoint name, never by address — the address changes on failover and the name is what follows the promotion.

**Credentials.** The database password does not belong in code, in an environment variable committed to a repository, or in a shared document. Put it in the provider's secrets manager, grant the application's instance role permission to read it, and let the application fetch it at start-up. Where the provider offers identity-based database authentication — a short-lived token in place of a password — prefer it.

## Putting a selection together

A worked scenario. A customer runs a document-processing service: staff upload PDFs, a worker converts them, results are downloaded for about a fortnight, and a copy must be retained for seven years for audit. About 40 GB arrives per month. Metadata about each document — who uploaded it, status, timestamps, a reference to the file — is queried constantly, and the audit team occasionally needs "everything from March 2024" within a working day.

Work it dimension by dimension. The PDFs themselves are whole files written once and read a few times, so object storage, not a volume on the worker. Access is hot for two weeks and effectively never after that, with a legal obligation to retain — so a lifecycle policy transitioning to infrequent access at 30 days and to archive at 90, with no expiry rule at all, because deleting inside a seven-year obligation is a much worse outcome than paying for storage. Retrieval in hours satisfies "within a working day", so deep archive is defensible if the price difference is material. Versioning on, public access blocked, retention lock if the auditor requires immutability.

The metadata is relational, transactional, and small: a managed relational database, modestly sized, with high availability across two zones because the service stops working without it, seven days of automated backups plus point-in-time recovery, in a private subnet reachable only from the worker tier's security group, with the credential in the secrets manager. The worker instances need only a small root volume, because nothing durable lives on them — which is what makes them replaceable, and what makes lesson 07's autoscaling possible.

Notice the shape of the argument. Nothing in it starts from a product name. Each choice comes from a stated property of the data: how it is written, how often it is read, how long it must live, whether it must be consistent, and what happens if it is briefly unavailable. That is the whole selection skill, and it is what you are assessed on.

## Practice

Design and build the storage layer for a stated workload, then prove the lifecycle rules and the recovery path actually work.

The stated workload: a small photo-submission service for a community programme. Members upload images through a web application; staff review them for 30 days; approved images are kept for three years for reporting and are almost never opened after the review period; a database holds one row per submission with member id, status, timestamps, and the object key.

1. Write a one-page selection note **before** building anything. For the images: which storage shape, which classes, at what ages, and why. For the metadata: relational or not, which engine, what size, and what availability posture. State the durability and availability figures your provider publishes for each service you chose, and say in your own words what each figure does *not* cover.
2. Create a bucket with versioning enabled and public access blocked. Upload three images with keys that use a meaningful prefix scheme, and record the scheme you chose and why.
3. Overwrite one image with a different file, then delete another. Recover both from a previous version. Record exactly what you did.
4. Write and apply a lifecycle policy that transitions objects under your images prefix to an infrequent-access class at 30 days and an archive class at 90, expires non-current versions after 30 days, and aborts incomplete multipart uploads after 7 days. Explain in one sentence per rule what it costs you and what it saves.
5. Calculate the monthly storage cost for 500 GB under three policies: everything in standard; your tiered policy at steady state assuming a three-year retention; and everything in archive from day one. Show the arithmetic, include any retrieval or minimum-duration charges you can identify, and state which you would recommend and why the cheapest option is not automatically the answer.
6. Generate a pre-signed URL for one object with a short expiry. Confirm it works, wait for it to expire, and confirm it stops working. Write one sentence on why this is preferable to making the bucket public.
7. Provision a managed relational database in the private subnets of the VPC you built in lesson 03. It must have no public endpoint, a security group permitting the database port only from your application tier's security group, and automated backups enabled.
8. Record its stated guarantees: backup retention in days, whether point-in-time recovery is on and to what granularity, the maintenance window, the maximum connection count for the size you chose, and whether a standby exists in a second zone.
9. Store the database password in your provider's secrets manager. Connect from an application instance without the password appearing in any file, any command history, or any environment variable you set by hand. Describe how the instance was authorised to read the secret.
10. Create a table, insert a handful of rows, and note the time. Wait, then delete some rows deliberately. Restore to a point in time before the deletion into a new instance, confirm the rows are present there, and record how long the restore took. State plainly what you would have to do next to get those rows back into the live database.
11. Attempt to connect to the database from outside the VPC and record the failure. Explain which control stopped you.
12. Tear everything down. Then audit for survivors: snapshots, database backups retained after deletion, old object versions, and the bucket itself. List what remained and what it would have cost per month if you had walked away.

**Deliverable:** the selection note, the lifecycle policy file, the cost comparison with its arithmetic, the recorded database guarantees from step 8, the restore timing and reconciliation plan from step 10, and the teardown audit.
