---
lesson_id: net260-02
course_id: net260
pathway: cybersecurity-support-technician
title: Cloud Shared Responsibility
order: 2
kind: lesson
competency_ids:
  - D6-S1-C01
objectives:
  - State who is responsible for each layer of a cloud workload under IaaS,
    PaaS, and SaaS, and what that leaves the customer to secure
---

## The question that starts every cloud security conversation

An alert fires. A storage bucket holding scanned intake forms is readable by anyone on the internet. Someone in the room says "isn't that the cloud provider's problem?"

It is not, and the reason it is not is the single most important idea in this course. The provider secured the storage service — the physical disks, the hypervisors, the network fabric, the software that serves the objects, the patching of all of it. What the provider did *not* do is decide who should be allowed to read your objects. That decision was made by someone in your organization, expressed as a configuration, and got it wrong. The provider's system worked perfectly; it faithfully executed a bad instruction.

This split is called the **shared responsibility model**, and every provider publishes a version of it. AWS words it as "security *of* the cloud" versus "security *in* the cloud." Microsoft publishes a shared responsibility table across on-premises, IaaS, PaaS, and SaaS. Google Cloud increasingly uses the phrase "shared fate," which adds the idea that the provider will actively help you get your side right rather than just drawing a line and walking away. The wording differs; the structure does not.

Your job in this lesson is not to memorize a marketing diagram. It is to be able to take a specific workload — this application, on this service, at this company — and say precisely which layers your employer must secure, which the provider handles, and where the boundary sits. Every later lesson in this course is a deep dive into one of the layers that ends up on your side of the line.

## The stack, layer by layer

Start with the layers themselves, from the ground up. This is deliberately more granular than the diagrams on provider marketing pages, because the interesting arguments happen inside layers that those diagrams merge.

```text
LAYER                              WHAT IT MEANS
-------------------------------------------------------------------------
Data                               The records themselves; their classification
Identity and access                Who may call what, and with which credential
Application code and dependencies  Your code, your libraries, your container image
Application configuration          Environment variables, feature flags, secrets handling
Platform / runtime                 Language runtime, web server, database engine
Operating system                   Kernel, packages, OS patching, host agents
Virtualization                     Hypervisor, container runtime isolation
Compute, storage, network hardware Servers, disks, switches, cabling
Physical facility                  Building, power, cooling, guards, door locks
```

Now the rule that governs the whole model:

**The higher up the stack the service is, the more layers the provider takes, and the fewer you keep. The layers you keep are always the top ones — and the top ones are the ones that get you breached.**

That second sentence is the part people miss. Moving to a managed service does not move you toward zero responsibility; it moves you toward a *smaller and sharper* responsibility, concentrated entirely in data, identity, and configuration. Those three are exactly the layers where cloud incidents actually happen.

![Which layers of the stack the provider secures and which the customer secures across on-premises, IaaS, PaaS, and SaaS](./img/shared-responsibility-layers.png)

## Four service models, four boundaries

### On-premises: the baseline

Everything is yours. You bought the building, the racks, the disks, the hypervisor, the operating system, the runtime, the code, and you set the permissions. Nothing about security is subtle here; it is simply all of it, forever. This is the model the rest of the pathway assumed, and it is the comparison point that makes the others legible.

### IaaS: you rent the machine

The provider gives you compute, storage, and network as raw materials — a virtual machine, a virtual disk, a virtual network. Think of an EC2 instance, an Azure virtual machine, a Compute Engine instance.

The provider handles the physical facility, the hardware, and the hypervisor. Everything from the guest operating system upward is yours: the OS is yours to patch, the runtime is yours to install and update, the code is yours, the configuration is yours, the data is yours, and the identity and access policy is yours.

The trap in IaaS is that the machine *looks* managed because you never touched the hardware. It is not. A virtual machine you launched from a provider-published image three years ago is running a three-year-old operating system unless somebody patched it, and nobody patches something they believe is the provider's job. Unpatched IaaS instances are one of the most common findings in a cloud environment, and the excuse is nearly always a misread of this model.

### PaaS: you rent the runtime

The provider gives you a managed platform — a managed database, an app service, a serverless function platform, a managed message queue. Azure SQL Database, AWS Lambda, Google Cloud Run, App Service, RDS.

The provider now also handles the operating system, its patching, and the runtime or engine. You supply code (or a container image), configuration, data, and access policy.

The boundary here is genuinely useful and genuinely misunderstood. If a critical vulnerability lands in the database engine, the provider patches it, usually inside a maintenance window you configure. Good. But if you set the managed database's firewall to allow `0.0.0.0/0`, enabled its public endpoint, and used a weak administrative password, the provider will patch the engine beautifully while the entire database is exposed to the internet. Every one of those three is a *configuration* decision, and configuration never crosses the line.

Serverless makes this sharper still. With a function platform you own almost nothing operationally — no OS, no server, no scaling logic. What you own is: the function's code and its dependencies, the identity the function runs as, the data it touches, and the event sources allowed to trigger it. Four things. Get the function's execution role wrong and you have handed an over-permissioned identity to whatever can invoke it.

### SaaS: you rent the application

The provider gives you a finished product: a mail and collaboration suite, a CRM, a ticketing system, a payroll platform. The provider runs the entire stack including the application code.

What remains yours is small and non-negotiable:

- **Your data.** What you put into it, how it is classified, how long it is kept, and who exports it.
- **Your identities.** Which accounts exist, whether they use multi-factor authentication, which are administrators, what happens when someone leaves.
- **Your tenant configuration.** Sharing defaults, external collaboration settings, third-party app authorizations, audit log retention, conditional access rules.
- **Endpoint and user behavior.** The device the user connects from is still yours to secure.

Most real SaaS incidents are one of exactly four things: an account with no MFA that got phished, an administrator account that should not have been an administrator, a document or link shared publicly by a default setting nobody reviewed, or a third-party integration granted broad access by a user who clicked through a consent screen. Not one of those is a provider failure.

### The comparison, side by side

```text
                        On-prem   IaaS      PaaS      SaaS
Data                    You       You       You       You
Identity and access     You       You       You       You
Application config      You       You       You       You
Application code        You       You       You       Provider
Platform / runtime      You       You       Provider  Provider
Operating system        You       You       Provider  Provider
Virtualization          You       Provider  Provider  Provider
Hardware                You       Provider  Provider  Provider
Physical facility       You       Provider  Provider  Provider
```

Read the top three rows across. They never change. **Data, identity, and configuration are yours in every model, at every provider, forever.** If you remember one thing from this lesson, remember those three rows — and notice that they are also the syllabus for lessons 03 through 07.

## Where the line is genuinely blurry

The table above is the teaching version. Reality has edges, and being useful in a real environment means knowing where they are.

**Encryption is split, and the split is about keys.** Every major provider encrypts data at rest by default with keys it manages. That is the provider's side. The moment your organization has a requirement to control the key — because a contract, a regulator, or a data classification says so — the responsibility for generating, storing, rotating, and eventually destroying that key moves to you. Lesson 05 is entirely about where on that spectrum a given requirement lands.

**Container services split at an unintuitive place.** On a managed container service the provider secures the control plane and often the host nodes. The *image* is yours: your base image, your installed packages, your application, your image's user, its capabilities, and its provenance. A container running as root from an unscanned image on a perfectly patched managed node is your finding, not the provider's. Lesson 06 lives here.

**"Managed" does not mean "configured."** A managed database with public network access enabled is a managed database that is exposed. A managed Kubernetes cluster with an open dashboard is an open dashboard. Managed refers to operations, not to safety.

**Availability and backup are usually less shared than people assume.** The provider guarantees the durability of the storage service. It does not guarantee that you will not delete your own data, or that a ransomware event inside your account cannot encrypt what you stored. Backup configuration, retention, and restore testing sit on your side in every model.

**The customer of a customer.** If your employer builds a product on top of a cloud provider and sells it, your employer is the provider in someone else's shared responsibility model. That obligation is contractual and it is the reason your security questionnaires exist. You met this framing in cyb150; this is where it attaches to infrastructure.

## Why this matters to an incident

Take a real-shaped scenario and walk the model through it.

```text
INCIDENT NOTE — draft
A public bucket containing 14,000 scanned patient intake forms was reported
by an external researcher. The bucket is in the production account. Object
ACLs allow public read. The bucket was created 19 months ago by a contractor
for a one-off migration. Server-side encryption with a provider-managed key
was enabled the whole time. The storage service was fully patched.
```

Walk the layers. Physical, hardware, virtualization, service software: provider, and all fine. Encryption at rest: enabled, provider-managed keys, working exactly as designed — and completely irrelevant, because encryption at rest protects against someone stealing a disk, not against an authorized-looking anonymous read that the service decrypts and serves happily.

Now the customer layers. Data: 14,000 records of a class that should never have been in a general-purpose bucket. Identity and access: a public-read ACL, meaning "everyone" is a valid principal. Configuration: no block-public-access guardrail, no lifecycle policy, no owner, no review in 19 months.

The finding writes itself, and it names your organization at every line. Notice also what the incident is *not*: it is not a vulnerability, there is no CVE, nothing was exploited. Somebody made a configuration choice and no process ever looked at it again. That is the characteristic shape of a cloud incident, and it is why so much of this course is about verifying configuration rather than chasing exploits.

## Reading a responsibility question in the real world

When you are handed a workload and asked "what do we own here," a short, repeatable procedure gets you to a defensible answer.

1. **Name the service precisely.** Not "the database" — "Azure SQL Database, single database, general purpose tier." The model turns on the exact service, because the same workload delivered three ways lands in three different columns.
2. **Locate it in the four models.** Raw VM: IaaS. Managed engine or runtime: PaaS. Finished product with a login page you did not build: SaaS.
3. **Walk the layers from the bottom and stop where it becomes yours.** Say the stopping point out loud.
4. **For every layer above the stop, name the control and the owner.** Not a team in the abstract — a named role.
5. **Check the four edges**: keys, images, backup and restore, and any configuration that exposes a network endpoint.
6. **Write down what you cannot verify.** "The provider says it patches the engine" is an assumption backed by their compliance attestation, and cyb150 taught you where those live. Assumptions belong in the record, not in your head.

A worked answer in the format a reviewer can use:

```text
WORKLOAD RESPONSIBILITY NOTE
Workload:   Appointment reminder service
Components: (a) Managed Postgres, provider-managed instance      -> PaaS
            (b) Container image on managed container runtime     -> PaaS
            (c) One VM running the legacy SMS gateway            -> IaaS
            (d) Vendor scheduling portal used by front desk      -> SaaS

Provider secures: facility, hardware, hypervisor, storage durability,
  Postgres engine patching (a), container host and control plane (b),
  entire stack of the vendor portal (d), default at-rest encryption.

We secure:
  Data          Appointment records = PHI. Classification set, retention 7y.
                Owner: Records Manager.
  Identity      Roles for app, CI, and 3 humans. Postgres has no public
                endpoint; access is by workload identity only.
                Owner: Platform Lead.
  Config        (a) firewall rules, TLS enforcement, backup retention
                (b) image contents, non-root user, no privileged mode
                (c) OS PATCHING IS OURS — this is the one people forget
                (d) tenant settings, MFA, external sharing off, app consent
                Owner: Platform Lead / IT for (d).
  App code      Ours for (a)(b)(c); provider's for (d).

Edges:
  Keys          Provider-managed today. Contract review pending on whether
                PHI requires customer-managed keys. OPEN.
  Images        Base image last rebuilt 4 months ago. No registry scanning
                configured. FINDING.
  Backup        Automated DB backups on. Restore never tested. FINDING.
  Exposure      VM (c) has a public IP with SSH open to any source. FINDING.

Assumptions:  Provider patching of (a),(b),(d) accepted on the basis of
              their current audit attestation; not independently verified.
```

Three findings and an open question, produced in twenty minutes by walking a table. That is the practical value of the model, and it is a large part of what "assisting with cloud security" looks like day to day.

## Practice

All work in this course is performed against your own lab or sandbox account, or an instructor-provided target, with authorization confirmed in writing before you begin. Never point any of these activities at an environment you do not have explicit permission to examine.

**Exercise 1 — Build the responsibility matrix.**

Take the four components below and produce a single table with the nine stack layers as rows and the four components as columns. In each cell write `Provider`, `Us`, or `Split`. Every `Split` cell needs a one-sentence note saying where exactly the split falls.

```text
1. A virtual machine running an in-house Python reporting job
2. A managed object storage bucket holding exported reports
3. A serverless function that emails a report link when a file lands
4. The third-party e-signature SaaS that signs the reports
```

**Exercise 2 — Same workload, three deliveries.**

A team needs to run PostgreSQL. Describe what your organization must secure if it is delivered (a) on a VM you install Postgres onto, (b) as the provider's managed database service, (c) as a database embedded inside a SaaS product you subscribe to. For each, list the three highest-risk items *on your side* and say which one you would check first on day one.

**Exercise 3 — Assign the incident.**

For each event below, state which layer failed, whether it is the provider's or the customer's responsibility, and the one control that would most likely have prevented it. Two of the six are genuinely the provider's; identify which and say how you would know.

```text
a. A storage bucket of customer invoices is world-readable.
b. A guest OS on a VM is exploited via an unpatched kernel CVE from 2023.
c. A managed database engine is exploited via a zero-day the day it is disclosed.
d. A departing employee's SaaS account still works two months later.
e. A hypervisor escape lets one tenant read another tenant's memory.
f. A serverless function's execution role can delete every bucket in the account.
```

**Exercise 4 — Interrogate a marketing claim.**

A vendor tells your manager that their SaaS product is "fully secure and compliant, so there's nothing for your team to do." Write five specific questions you would ask them, each one aimed at a layer the model says is still yours. Then write the one-paragraph summary you would give your manager explaining what your team's actual remaining obligations are.

**Exercise 5 — Write the note for a real workload.**

Pick one workload in your lab environment, or one your instructor assigns, and produce a Workload Responsibility Note in the format shown above. It must include: every component named by exact service, the provider column, the customer column broken into data / identity / configuration / code, all four edges checked, at least one item marked `OPEN` or `FINDING`, and an assumptions section. Keep it to one page — this artifact is only useful if a busy person will actually read it, and you will reuse it as the opening section of the project in lesson 11.

## Check your understanding

1. A managed Postgres instance is exposed to the internet through its public endpoint and a `0.0.0.0/0` firewall rule. The engine is fully patched. Whose finding is it, and which layer failed?
2. Which three rows of the responsibility table never change across on-premises, IaaS, PaaS, and SaaS?
3. The lesson 02 bucket held 14,000 intake forms and had at-rest encryption enabled the whole time. Why didn't the encryption matter?

**Answers:** (1) The customer's: configuration (and identity/access) failed; engine patching is the provider's and was fine. (2) Data, identity and access, and application configuration. (3) At-rest encryption protects against theft of the physical media; the service decrypted and served every object to the anonymous reader the public ACL allowed.
