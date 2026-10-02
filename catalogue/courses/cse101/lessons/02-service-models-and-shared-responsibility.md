---
lesson_id: cse101-02
course_id: cse101
pathway: cloud-support-engineer
title: Service Models and Shared Responsibility
order: 2
kind: lesson
competency_ids:
  - D2-S1-C01
objectives:
  - Distinguish IaaS, PaaS, and SaaS by what the provider operates and what the
    customer remains responsible for
---

## What "cloud" actually names

Strip away the marketing and cloud computing is a rental arrangement with five specific properties. Those five properties are worth knowing precisely, because they are what separates a cloud provider from a company that will sell you a server in a rack.

**On-demand self-service.** You get the resource by asking a machine, not a person. No purchase order, no ticket, no sales call. You call an API — or click a console button that calls the API for you — and a few seconds or minutes later the thing exists. The absence of a human in that loop is the whole point: it is what makes an experiment cheap.

**Broad network access.** The resource is reachable over the network by standard clients: a browser, a command line, an SDK. You do not need to be in a particular building or on a particular cable.

**Resource pooling.** The provider owns a very large pile of hardware and hands slices of it to many customers at once. You do not know, and normally cannot find out, which physical server your workload landed on. This is called *multi-tenancy*, and it is the reason cloud is cheaper than owning: the provider is amortizing one machine across many customers whose demand peaks at different times.

**Rapid elasticity.** You can get much more of the resource quickly, and — this is the half people forget — give it back just as quickly. A system that can double in five minutes but takes a year to shrink is not elastic; it is just large.

**Measured service.** Consumption is metered and billed by unit: seconds of compute, gigabyte-months of storage, gigabytes transferred, requests served. You can see the meter. Somebody will eventually ask you to explain it.

Every one of those five turns up again in this course. Elasticity is why autoscaling exists. Measured service is why lesson 07 is about money. Resource pooling is why the security conversation in lesson 06 is about identity rather than locked doors. But the property that shapes your daily work as a support engineer is the first one, on-demand self-service, because it has a consequence nobody advertises: *if you can create it yourself, you own what you created.* The provider will run the platform flawlessly and still let you configure your way into an outage. Knowing exactly where their job stops and yours starts is the single most useful thing in this lesson.

### Where it runs: deployment models

Before the service models, one smaller piece of vocabulary. *Deployment model* answers "whose hardware, shared with whom":

- **Public cloud** — the provider's hardware, pooled across unrelated customers. This is what people mean by default, and what this course teaches.
- **Private cloud** — cloud-style self-service and metering, but on hardware dedicated to one organization, whether in their own building or carved out at a provider. Chosen for regulatory, latency, or contractual reasons more often than technical ones.
- **Hybrid** — some workloads in public cloud, some on-premises, connected and administered together. Extremely common in real companies, because the mainframe is still running payroll and nobody is moving it.
- **Multi-cloud** — more than one public provider in use at once, usually for redundancy, negotiating leverage, or because two departments each picked their favorite.

Deployment model and service model are independent axes. You can run an infrastructure-style service in a private cloud, and you can buy software-as-a-service that runs in a hybrid arrangement. Do not let anyone collapse the two.

## The stack, layer by layer

Every running application sits on a stack of layers. From the ground up:

| Layer | What it is |
| --- | --- |
| Facility | Building, power, cooling, physical access control |
| Hardware | Servers, disks, switches, cables |
| Virtualization | The hypervisor that slices hardware into virtual machines |
| Operating system | Kernel, drivers, system packages, OS patches |
| Runtime and middleware | Language runtime, web server, database engine, libraries |
| Application | The code your organization writes or buys |
| Configuration | Settings, network rules, permissions, secrets, backups |
| Data | The records, files, and content that actually matter |
| Identity | Who the users are and what each of them may do |

Owning a server in your own building means owning all nine layers. Every service model is a decision about how many of those layers you hand to somebody else. That is the entire idea, and once you see it this way the three-letter acronyms stop being memorization.

## IaaS, PaaS, SaaS

**Infrastructure as a Service (IaaS)** rents you the bottom three layers. The provider runs the facility, the hardware, and the virtualization. You get a virtual machine with an operating system on it, and from the operating system upward everything is yours: patching the OS, installing the runtime, deploying the app, configuring the firewall, arranging the backups. IaaS is the most control and the most work. Virtual machines, virtual disks, virtual networks, and load balancers are the classic IaaS products.

**Platform as a Service (PaaS)** rents you everything up through the runtime. You hand the provider your application — source code, or a container image, or a database schema — and the platform runs it. You do not choose the operating system, you do not patch it, you often cannot log into the machine at all. What remains yours is the application, its configuration, its data, and the identities that reach it. Managed application hosting, managed databases, managed message queues, and serverless function platforms are all PaaS in this sense.

**Software as a Service (SaaS)** rents you the finished product. The provider writes the application, runs it, updates it, and stores the data. Your remaining responsibilities are narrow but real: your data, your configuration of the product, and your users' identities and permissions. Email, chat, CRM, ticketing, payroll, and the source-control host your team uses are SaaS.

Here is the same idea as a table. "P" is the provider, "C" is the customer.

| Layer | On-premises | IaaS | PaaS | SaaS |
| --- | --- | --- | --- | --- |
| Facility | C | P | P | P |
| Hardware | C | P | P | P |
| Virtualization | C | P | P | P |
| Operating system | C | C | P | P |
| Runtime / middleware | C | C | P | P |
| Application | C | C | C | P |
| Configuration | C | C | C | C |
| Data | C | C | C | C |
| Identity and access | C | C | C | C |

![Where the responsibility boundary between provider and customer sits under IaaS, PaaS, and SaaS, layer by layer from the physical facility up to the data](./img/shared-responsibility-line.png)

Read the bottom three rows of that table again. Configuration, data, and identity are customer responsibilities in **every column**, including SaaS. There is no service model in which the provider becomes responsible for who you gave access to, or whether the setting you flipped was wise, or whether the data you uploaded should have been uploaded. That column of C's is where the overwhelming majority of real-world cloud incidents live.

### The line moves per service, not per company

A common beginner error is to say "we're a PaaS shop." Almost nobody is. A single company routinely consumes all three models at once, and often within one application: the marketing site on a managed hosting platform (PaaS), a legacy reporting tool on a virtual machine because it needs a specific OS build (IaaS), and the help desk on a purchased ticketing product (SaaS).

So the boundary is not a company-level fact. **It is a per-service fact, and you determine it by asking what the provider operates.** When a customer says "our database went down," your first job is to establish whether that is a database engine they installed on a virtual machine they rent — in which case the engine, its version, its configuration, its storage sizing, and its backups are all theirs — or a managed database service, in which case the engine and the host are the provider's and the schema, the queries, the connection limits, and the access grants are theirs. Same symptom, completely different investigations.

## The shared responsibility model in practice

Providers describe this with a phrase worth memorizing because all three major ones use some version of it: the provider is responsible for the security **of** the cloud, and the customer is responsible for security **in** the cloud. The provider guarantees that the building is guarded, the hypervisor isolates tenants, the disks are wiped between customers, and the physical network is sound. You guarantee that your virtual machine is patched, your permissions are narrow, your storage is not world-readable, and your credentials are not in a public repository.

Two nuances make this useful rather than decorative.

**The line is contractual, not just technical.** It is written down. Every major provider publishes a shared responsibility document, and every managed service publishes a service level agreement stating what the provider promises — typically an availability percentage, with a service credit as the remedy if they miss it. When a customer asks "what are you going to do about my four hours of downtime," the honest answer often lives in that document, and you should have read it before the conversation rather than during it.

**Responsibility is not the same as capability.** The provider is responsible for the hypervisor, but you are the one who has to notice that your instance was migrated. You are responsible for OS patching on IaaS, but the provider may offer a patch-management service that does it for you — and using it does not transfer the responsibility, it only automates the work. Ask "who is accountable when this is wrong?" not "who typed the command?"

### Worked example 1: the vulnerable library

A widely used logging library is found to have a remote code execution flaw. Three of your customers ask who fixes it.

- **Customer A** runs the application on rented virtual machines. The library is inside their application's dependencies, on an OS they patch. This is entirely theirs: rebuild the application with the fixed version and redeploy. The provider has no part in it beyond keeping the machines running.
- **Customer B** runs the same application on a managed application platform. The library is still inside *their* application bundle, so it is still theirs. The platform being managed does not reach up into their code. What the provider does own is the platform's own use of the library, if any — and they will publish a bulletin saying so.
- **Customer C** uses a purchased SaaS product that happens to be built with that library. This one is the provider's: it is their application. The customer's job is to read the vendor's advisory, confirm remediation, and check whether any of their own data was exposed.

Same vulnerability, three different owners, and the deciding factor every time is *which layer the flawed code sits in and who operates that layer*.

### Worked example 2: the exposed storage bucket

A customer's object storage container is readable by anyone on the internet, and a journalist has found it. Who is responsible?

The customer, in all three service models, without exception. Storage permissions are configuration, and configuration never crosses the line. The provider's part is that the storage service enforced exactly the access policy it was given; it did what it was told. Providers now default new storage to private and put warnings in the console precisely because this failure is so common — but a default is a guardrail, not a transfer of responsibility.

This is the case worth internalizing, because it is the most frequent serious cloud incident in the industry and it is a hundred percent preventable at the configuration layer. Lesson 06 is about how.

### Worked example 3: the regional outage

A provider's region has a two-hour failure and the customer's application is down. Availability of the region is the provider's responsibility, and they will publish a post-incident report and possibly issue service credits. But whether *the customer's application* survived a single region failing is an architecture decision the customer made — how many availability zones they deployed to, whether they had a failover region, whether their backups were stored somewhere else. The provider owes them the region's uptime commitment. Nobody owes them resilience they did not design and pay for.

The support conversation here is delicate and it is the same one every time: acknowledge the provider's fault plainly, then separate the two questions — "what went wrong on their side" and "what would have to change on ours to survive the next one." Lesson 09 is about running that conversation well.

### Worked example 4: the leaked credential

A developer commits an access key to a public repository. Within minutes, unknown parties launch expensive compute in the customer's account.

Every part of this is the customer's. Credential hygiene sits in the identity layer, and the identity layer never crosses the line in any service model. The provider's part is narrow and worth knowing anyway: they operate automated scanning that detects certain leaked credentials on public code hosts and will often quarantine the key and notify the account owner. That is a courtesy safety net, not a transfer of responsibility, and it catches only some cases.

The response has three parts, in this order: revoke the credential, assess what it touched using the audit trail, then negotiate about the charges — providers will sometimes waive obviously fraudulent usage as a one-time gesture, and will not do so repeatedly. Prevention is lesson 06's material. The reason this example belongs *here* is the ordering: knowing instantly that this is a customer-side incident is what lets you start revoking in the first minute instead of opening a provider case and waiting for someone to tell you it is yours.

### Placing an unfamiliar service on the line

New services appear constantly, and most of them do not announce which model they belong to. Marketing pages describe products at very different points on the stack as "fully managed." You need a way to place one yourself, in about ninety seconds, from its documentation.

Three questions do it:

1. **Can I get a shell on the machine?** If yes, the operating system is yours, and so is everything above it. That is IaaS, regardless of what the product page calls itself.
2. **Do I supply code, or only configuration?** Supplying code — a container image, a source repository, a function, a schema — means the application layer is yours and the runtime is theirs. That is PaaS. Supplying only settings and data means the application is theirs too. That is SaaS.
3. **Who is named in the patch notes?** When the provider publishes a security bulletin, does it say "no customer action required" or "customers should update"? That sentence is the responsibility line written down by the people who own it.

Two refinements to expect. First, the line is a spectrum rather than three boxes, and there is a large middle ground. A managed container service where you control the image and the resource limits but not the host is meaningfully more IaaS-like than a platform that builds your source code for you, even though both get called PaaS. Naming the exact layer is more useful than naming the acronym, and it is what you should write in a ticket.

Second, **the same product can sit at different points depending on how it is used**. A database sold both as "we run the engine, you get a connection string" and as "we install the engine on an instance you can log into" is two different responsibility arrangements under one brand name. Establish which variant is actually deployed before you answer a question about it — an assumption here produces a confident wrong answer, which is worse than no answer.

## Using the line as a triage tool

Here is the practical routine. When a ticket arrives, before you touch anything:

1. **Name the service precisely.** Not "the database" — the specific product, and whether it is managed or self-installed.
2. **Locate the failing layer.** Is the symptom in the facility, the hypervisor, the OS, the runtime, the app, the configuration, the data, or the identity layer?
3. **Read the line for that service.** Provider side or customer side?
4. **If provider side:** check the provider's status page and open a support case with the account, region, resource identifier, and timestamps. Then tell the customer what you did and when you will next update them.
5. **If customer side:** it is yours to investigate. Say so clearly and start.
6. **If genuinely ambiguous:** treat it as yours until proven otherwise, while opening the provider case in parallel. Waiting for a vendor to confirm the problem is theirs is not an investigation.

Step 6 matters more than it looks. Escalating everything to the provider makes you slow and makes your customer's outage longer. Escalating nothing makes you the person who spent six hours debugging a platform incident that was on the status page the whole time. The line is what lets you choose correctly and quickly.

### What the line changes about your daily work

Under IaaS you spend your time on operating systems: patch levels, disk fill-ups, service restarts, kernel versions, host firewalls. Under PaaS most of that vanishes and is replaced by configuration and quota work: environment variables, build settings, connection limits, plan tiers, and the platform's own opinions about how an app should behave. Under SaaS you are almost entirely in the identity and configuration layers — provisioning users, adjusting roles, integrating with the customer's login system, and explaining product behavior that you cannot change.

None of the three is easier than the others. They are different jobs. What makes them tractable is knowing, at any given moment, which one you are doing.

## Practice

Work through all four parts. Parts 1 and 2 are the graded core; parts 3 and 4 are what turn the model into a habit.

**Part 1 — Classify twelve services.** For each item below, write down (a) the service model — IaaS, PaaS, or SaaS — and (b) one sentence naming the highest layer the *customer* still operates. There is at least one item that is arguable; for that one, write two sentences explaining what additional fact would settle it.

1. A rented virtual machine with a stock Linux image.
2. A managed relational database where you get a connection string and no shell.
3. A company-wide email and calendar product.
4. A serverless function platform that runs code you upload on each incoming request.
5. A virtual private network appliance you install yourself onto a rented virtual machine.
6. A managed container service that runs an image you build and pushes it behind a URL.
7. An object storage service you write files into over HTTP.
8. A hosted source-control and pull-request product.
9. A managed message queue.
10. A virtual desktop product that streams a full Windows desktop to a browser.
11. A managed search service where you define an index and send documents.
12. A payroll product your finance team logs into.

**Part 2 — Build a responsibility matrix.** A customer runs a small online store: a web front end on a managed application platform, a product database on a managed database service, product images in object storage, an internal analytics tool on a virtual machine they administer, and a purchased help-desk product. Produce a single table whose rows are the nine stack layers from this lesson and whose columns are those five components. Fill every cell with `Provider` or `Customer`. Then answer, in one sentence each, using only your table:

- Who patches the operating system under the analytics tool, and who patches the one under the web front end?
- If the product images become publicly listable, who is accountable?
- If the help-desk product is unavailable for three hours, what is the customer's actual remedy?
- Which single layer is the customer's responsibility in all five columns, and why does that matter for the store's risk?

**Part 3 — Read a real agreement.** Pick any one managed service from any one major provider, find its published shared responsibility documentation and its service level agreement, and write no more than 200 words covering: the availability percentage promised, what the remedy is when it is missed, one responsibility the document assigns to the customer that surprised you, and one thing the document explicitly excludes from the promise. Cite the document by name and date. Do not editorialize about the provider — this is a reading exercise, and the same exercise on a different provider should produce a structurally identical answer.

**Part 4 — Triage drill.** For each of these three tickets, apply the six-step routine from this lesson and write the resulting one-paragraph first response to the customer. The response must name the failing layer, state plainly whose side of the line it falls on, and say what happens next.

1. "Our site has been returning 503 for twenty minutes. We host it on a managed application platform. We deployed a new version forty minutes ago."
2. "The reporting server is out of disk space. It's a VM we rent from you."
3. "Someone deleted a folder in our file-sharing product and we need it back. It was gone before we noticed, sometime last week."

**Deliverable:** one document containing the classification list, the responsibility matrix, the 200-word reading note, and the three ticket responses. A reviewer should be able to disagree with a cell in your matrix and find your reasoning stated somewhere in the document.
