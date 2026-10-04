---
lesson_id: cse101-04
course_id: cse101
pathway: cloud-support-engineer
title: Working Across Major Cloud Providers
order: 4
kind: lesson
competency_ids:
  - D2-S1-C01
objectives:
  - Compare the core service families of the major cloud providers without
    depending on any one platform
---

## Why this lesson is not a product tour

There are three providers most of the industry runs on: Amazon Web Services, Microsoft Azure, and Google Cloud. Between them they publish something like six hundred distinct services, and the count goes up every quarter. Nobody knows all of them. The people you will think of as cloud experts do not know all of them either; they know about twenty-five services well and possess a reliable method for finding the twenty-sixth.

That method is the actual subject of this lesson. It rests on an observation that survives every rebranding: **the providers sell the same catalog of ideas under different names.** All three sell you a virtual machine, a place to put objects, a managed relational database, a way to run a container, a way to run a function, a permissions system, a metrics and logs service, a content delivery network, a queue. The interesting differences are not in the presence or absence of these families — they are in the account structure, the defaults, the pricing shape, and the vocabulary.

So the skill being built here is deliberately narrow and deliberately transferable: given a requirement, name the *service family* it needs, then look up what that family is called on whichever platform the ticket concerns. A support engineer who can do that is useful on day one at a company running any of the three. A support engineer who memorized one platform's product names is useful at one company until it migrates.

This lesson stays at that orientation level on purpose. Depth in a single platform is a later course; the point here is that you can locate yourself in any of the three consoles and translate between them without panicking.

## The service families

Here is the catalog of ideas, with the corresponding product on each platform. This is a reference table — do not memorize it, but do learn the left column cold, because the left column is what does not change.

| Service family | What it does | AWS | Azure | Google Cloud |
| --- | --- | --- | --- | --- |
| Virtual machines | Rented guest OS on a hypervisor | EC2 | Virtual Machines | Compute Engine |
| Autoscaling VM group | A managed set of identical VMs | Auto Scaling Group | Virtual Machine Scale Set | Managed Instance Group |
| Object storage | Store and retrieve blobs over HTTP | S3 | Blob Storage | Cloud Storage |
| Block storage | A virtual disk attached to one VM | EBS | Managed Disks | Persistent Disk |
| File storage | A shared network filesystem | EFS / FSx | Azure Files | Filestore |
| Archive storage | Cheap, slow, long-retention storage | S3 Glacier tiers | Archive tier | Archive class |
| Container registry | Stores container images | ECR | Container Registry | Artifact Registry |
| Managed Kubernetes | Runs container orchestration for you | EKS | AKS | GKE |
| Serverless containers | Runs a container with no cluster | Fargate / App Runner | Container Apps | Cloud Run |
| Serverless functions | Runs a function per event | Lambda | Functions | Cloud Run functions (formerly Cloud Functions) |
| Managed relational DB | A database engine you do not install | RDS / Aurora | Azure SQL / DB for PostgreSQL | Cloud SQL / AlloyDB |
| Managed NoSQL | Key-value or document store | DynamoDB | Cosmos DB | Firestore / Bigtable |
| Data warehouse | Analytical queries over large data | Redshift | Synapse Analytics | BigQuery |
| Message queue | Decoupled point-to-point messaging | SQS | Queue Storage / Service Bus | Pub/Sub |
| Publish-subscribe | Fan-out messaging | SNS | Event Grid | Pub/Sub |
| Identity and access | Who may do what | IAM | Entra ID + Azure RBAC | Cloud IAM |
| Secrets storage | Encrypted credential storage | Secrets Manager | Key Vault | Secret Manager |
| Key management | Managed encryption keys | KMS | Key Vault | Cloud KMS |
| Monitoring and logs | Metrics, logs, alarms | CloudWatch | Monitor | Cloud Monitoring / Logging |
| Audit trail | Record of every control-plane action | CloudTrail | Activity Log | Cloud Audit Logs |
| Private network | Your own address space | VPC | Virtual Network | VPC |
| Load balancer | Distributes traffic to backends | ELB / ALB | Load Balancer / App Gateway | Cloud Load Balancing |
| DNS | Authoritative name service | Route 53 | Azure DNS | Cloud DNS |
| CDN | Cached delivery at the edge | CloudFront | Front Door / CDN | Cloud CDN |
| Infrastructure as code | Declarative resource definitions | CloudFormation | Bicep / ARM templates | Infrastructure Manager (successor to Deployment Manager) |
| Cost management | Bills, budgets, forecasts | Cost Explorer | Cost Management | Cloud Billing reports |

Two honest caveats about that table. First, the mappings are approximate — several are one-to-many, and product lines get merged, renamed, and retired. Treat it as a starting point for a lookup, never as an authority. Second, a name in the table is not an endorsement; where a provider has three overlapping products in a family, the table names the one you will meet most often.

### Using the table as a translator

The practical use is bidirectional translation, and it comes up constantly in support work. A customer writes: "We need to move our S3-triggered Lambda over to Azure." You do not need Azure expertise to parse that. Object storage triggering a function becomes Blob Storage triggering an Azure Function, and the questions that follow are the same questions in both worlds — what event types fire the trigger, what the payload looks like, what identity the function runs as, what happens on failure, and how retries are bounded.

Do that translation explicitly and out loud in tickets. "On our platform, the equivalent of X is Y" is a sentence that saves whole meetings.

## Where the platforms genuinely differ

If the families are the same everywhere, the differences must be somewhere else. They are, and there are six places worth knowing.

### 1. Account and resource hierarchy

This is the biggest real difference and the one that most often confuses somebody moving between platforms. All three need an answer to "how do I group resources for billing, permission, and isolation purposes," and all three answer differently.

| Concept | AWS | Azure | Google Cloud |
| --- | --- | --- | --- |
| Top of the tree | Organization | Tenant (Entra ID directory) | Organization |
| Grouping layer | Organizational Unit | Management Group | Folder |
| Billing and isolation boundary | Account | Subscription | Project |
| Grouping inside that | *(tags, no native container)* | Resource Group | *(labels, no native container)* |
| Where resources live | An account, in a region | A resource group, in a region | A project, in a region |

The consequences are practical:

- On **AWS**, the account is the strong boundary. Separating production from development means separate accounts, and multi-account setups with dozens of accounts are normal and correct. There is no native folder inside an account, so grouping within one is done with tags and naming conventions.
- On **Azure**, the subscription is the billing and quota boundary, but resource groups do a lot of daily work: a resource group is a lifecycle container, and deleting one deletes everything in it. Azure also splits identity from resource permissions — Entra ID holds the users and groups (and is shared across subscriptions in the tenant), while Azure RBAC grants those identities roles at a scope.
- On **Google Cloud**, the project is the unit of nearly everything: billing, quota, API enablement, and default isolation. A very common surprise is that a service must be *enabled* per project before it can be used at all, which produces an error that reads like a permission problem and is not.

When you join a team, the first thing to learn is not a service. It is this hierarchy as that team actually uses it: how many accounts, subscriptions, or projects there are, what separates them, and which one the thing in your ticket lives in.

### 2. Regions, zones, and edges

All three build the same three-level geography with three different vocabularies.

| Concept | AWS | Azure | Google Cloud |
| --- | --- | --- | --- |
| Geographic area | Region (`us-east-1`) | Region (`eastus`) | Region (`us-east1`) |
| Independent failure domain inside it | Availability Zone | Availability Zone | Zone |
| Paired/related regions | *(no formal pairing)* | Region pairs | *(no formal pairing)* |
| Global cache points | Edge locations | Edge / PoP | Edge PoP |

The rules that follow are the same on all three, and they are what you actually need:

- **A region is a place.** Choosing one is a decision about latency to users, data residency law, service availability (not every service exists in every region), and price — the same instance can differ by 20–30% between regions.
- **Zones are for surviving a failure inside a region.** Zones are separately powered and networked facilities. Spreading across zones is usually cheap or free and is the single highest-value availability decision most small workloads can make.
- **Regions are for surviving a region.** That is a much larger project: data replication, DNS failover, and duplicated infrastructure. Most small businesses should not buy it, and should say so deliberately rather than by accident.
- **Zone identifiers may be shuffled per account.** On at least one platform, the zone labelled `a` is not the same physical facility for two different accounts. Never coordinate with another team by zone letter.

### 3. The four interfaces

Every provider exposes the same four ways in, and the *only* real interface is the third one.

**The console** is a web UI. It is excellent for learning, for looking at things, and for one-off investigation. It is bad for anything you must repeat or prove, because a click path cannot be reviewed, versioned, or handed to a colleague. A runbook step that says "click the blue button" breaks the next time the UI is redesigned, which will be soon.

**The command line** is scriptable and quotable in a ticket. The three CLIs are structurally similar enough to guess at:

```bash
# list virtual machines — same intent, three dialects
aws ec2 describe-instances --region us-east-1
az vm list --resource-group my-rg --output table
gcloud compute instances list --project my-project
```

Note the shape: `aws <service> <verb>`, `az <resource> <verb>`, `gcloud <group> <resource> <verb>`. Note also what each one needs to know about location — a region flag, a resource group, a project. That is the hierarchy from the previous section leaking into every command, which is why learning the hierarchy first pays off immediately.

**The API and SDKs.** Everything else is a client of the REST API. Console clicks and CLI commands both become API calls, which is why the audit trail records them identically and why "I did it in the console so there's no record" is false.

**Infrastructure as code.** Declarative files describing the resources you want, applied by a tool that computes the difference. Each provider has a native tool, and there are provider-agnostic tools that work across all three. For a support engineer the relevance is diagnostic: in an IaC-managed environment, a resource changed by hand will be reverted on the next apply, and "who changed this" is answered by reading a repository's history rather than guessing.

### 4. Identifiers and the "current context"

Two small mechanics account for a surprising share of the friction when you move between platforms, and neither is usually taught.

**How resources are named.** Every platform needs a globally unambiguous way to refer to one resource, and each invented its own string format.

| Platform | Identifier form | Shape |
| --- | --- | --- |
| AWS | Amazon Resource Name (ARN) | `arn:aws:service:region:account-id:resource-type/resource-name` |
| Azure | Resource ID path | `/subscriptions/id/resourceGroups/name/providers/provider/type/name` |
| Google Cloud | Relative resource name | `projects/id/locations/region/service-type/name` |

Read those three side by side and the hierarchy from the previous section reappears in every one of them: the account, the subscription and resource group, the project. That is not a coincidence — the identifier *is* the path through the hierarchy. Once you see that, an unfamiliar identifier stops being noise and starts telling you where the resource lives, which is often the whole answer to "why can I not see it."

**The current context.** Every CLI carries an implicit answer to "which account, which region, which project am I operating in right now," and the most expensive mistakes in cloud support come from that answer being different from what you assumed. Each tool exposes it differently: named profiles with a default, an active subscription that persists across sessions, or a configuration block holding the project and region. The commands to inspect and change it differ, but the discipline does not.

```bash
# who am I, and where am I pointed?
aws sts get-caller-identity
az account show
gcloud config list
```

Make running one of those the first command of any session on an unfamiliar environment, and make it the first line of any runbook that touches production. "I ran it against the wrong account" is not a rare failure; it is a weekly one at organizations with several accounts, and it is entirely preventable by a five-second check.

A related habit: quote the identifier, not the display name, in every ticket. Display names are duplicated across environments — there is a `web-prod` in three subscriptions — while the full identifier is unambiguous by construction.

### 5. Defaults and opinions

Platforms differ less in what is possible than in what happens if you do nothing. New object storage is private by default everywhere now, but the *shape* of the controls differs. Encryption at rest is on by default everywhere, with different key-management defaults. Network egress rules, default disk types, default backup retention, and whether a resource can be deleted while something depends on it all vary.

The operational lesson is short: **verify defaults, never assume them, and re-verify after a platform update.** Defaults are the most quietly changed part of any cloud platform.

### 6. Support, status, and documentation

Every provider sells tiered support, and the tier determines response times and whether you can reach an engineer at all. Know your organization's tier before an incident, not during one.

Every provider publishes a status page — and a per-account health view that is more accurate than the public page, because the public page is conservative and often lags. Check both. A support engineer who says "the provider says everything is fine" while the account health dashboard shows a degraded service in that exact region has looked in the wrong place.

Documentation is worth a paragraph of its own because reading it well is the core skill of this lesson. All three publish, per service: a conceptual overview, a quickstart, an API reference, a quotas-and-limits page, and a pricing page. **The quotas page and the pricing page are the two most under-read documents in cloud computing.** A very large fraction of mysterious failures are quota limits, and a very large fraction of billing surprises are a line item on the pricing page that nobody read. When you meet a new service, read those two pages before the quickstart.

## Portability, lock-in, and choosing

Some things move between providers easily and some do not. Roughly, from most portable to least:

1. **Containers and their images** — an image runs anywhere a compatible kernel and architecture exist. This is the strongest portability story in cloud and a large part of why containers won.
2. **Open-source engines behind managed services** — a PostgreSQL database can be dumped and restored onto another provider's managed PostgreSQL. The engine is portable; the surrounding automation is not.
3. **Object storage contents** — the bytes move fine. The API shape, the permission model, and the lifecycle configuration all have to be rewritten, and the egress fee to move the bytes out can be substantial.
4. **Serverless functions** — the function body is often portable; the triggers, the identity model, the packaging, and the event payload shapes are not.
5. **Proprietary managed services** — a provider-specific data warehouse, a provider-specific NoSQL database, a provider-specific workflow engine. These are the deepest lock-in, and they are also frequently the best tools available. That is the tension.

Lock-in is not automatically a mistake. It is a trade: you accept switching cost in exchange for capability you do not have to build. What is a mistake is accepting it *without noticing*. The healthy version of this conversation is: "This service saves us four months of work and would take three months to replace. That is a trade we are making on purpose, and here is the note in the architecture record saying so."

### How organizations actually choose

Rarely on technical merit alone. The real drivers, in something like their true order of frequency: an existing enterprise agreement or discount; what the founding engineers already knew; which provider the largest customer or partner uses; a specific service that only one provider has; data residency requirements; and only then a genuine feature comparison. Knowing this keeps you from arguing technology at a decision that was made on a contract.

**Multi-cloud** deserves a plain warning. Running the same workload actively on two providers means two of every operational thing — two identity models, two monitoring stacks, two on-call runbooks, two sets of quirks — in exchange for a resilience benefit most organizations never actually exercise. Deliberate multi-cloud for a specific reason is defensible. Accidental multi-cloud, which is what most multi-cloud is, is a cost nobody chose. As a support engineer you will simply inherit whatever exists, and your job is to be the person who can navigate both without treating either as "the weird one."

## Practice

**Part 1 — Build your own Rosetta table, from the docs.** Do not copy the table in this lesson. Using only each provider's official documentation, build a table with a row for each of these ten families and a column per provider: virtual machines, object storage, block storage, serverless functions, managed relational database, container registry, identity and access, monitoring, DNS, and secrets storage. For each cell record the product name **and** a link to its overview page. Then add a final column, "how I found it," naming the search term or documentation index you used. That last column is the deliverable that actually matters.

**Part 2 — Map three hierarchies.** For one workload of your choosing — say, a web application with a database and a storage bucket, run in a development and a production environment — draw how you would organize it in each provider's hierarchy. Name every layer explicitly (organization, OU/management group/folder, account/subscription/project, resource group where applicable). Then answer:

- In each platform, what is the strongest boundary between development and production, and what does "strongest" mean there — billing, permissions, or blast radius?
- On one platform, name a resource that is global rather than regional and explain the consequence for your diagram.

**Part 3 — Translate three tickets.** Rewrite each of these, preserving the technical meaning, into the vocabulary of a different named provider. Then list the questions you would have to ask because the translation is not exact.

1. "Our Lambda triggered by an S3 `ObjectCreated` event is timing out; the IAM role may be missing `s3:GetObject`."
2. "The AKS cluster in `eastus` can't pull from the container registry — I think the resource group's role assignment was removed."
3. "BigQuery costs spiked; someone is running `SELECT *` against the events table without a partition filter."

**Part 4 — Read the two under-read pages.** Pick one service family and one provider. Find that service's quotas-and-limits page and its pricing page. Write no more than 250 words covering: the three limits most likely to surprise a team (with numbers), whether each is a hard limit or an adjustable quota, the units the service is billed in, and one charge on the pricing page that a newcomer would not expect. Then repeat *only the limits half* for the same family on a second provider and note one place the two differ materially.

**Part 5 — CLI orientation drill.** Using the documentation for any two providers' command-line tools, write the equivalent command pairs for: listing all virtual machines in a location; listing storage buckets or containers; showing the identity the CLI is currently authenticated as; and listing the regions available to you. You do not need an account to complete this — the reference documentation gives you the syntax. For each pair, write one sentence on what the command requires you to specify about the hierarchy and why.

**Deliverable:** one document with the Rosetta table (including the "how I found it" column), the three hierarchy maps, the three translated tickets with open questions, the limits-and-pricing note, and the CLI pairs. A reviewer should be able to hand your Rosetta table to a newcomer and have them find a service on a platform you did not cover in class.
