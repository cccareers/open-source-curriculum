---
course_id: cse101
media_id: cse101-v01
type: video-script
title: "Who Owns This Failure? Reading the Responsibility Line"
format: whiteboard
target_runtime: "7 min"
related_lessons:
  - cse101-02
objectives:
  - Distinguish IaaS, PaaS, and SaaS by what the provider operates and what the customer remains responsible for
competency_ids:
  - D2-S1-C01
---

## Purpose
After watching, the learner can take an incident, place the failing component on the nine-layer stack, and state in one sentence whose side of the line it falls on for that specific service.

## Audience and prerequisites
Cloud Support Engineer apprentices in week one. Assumes the learner has read the first half of lesson 02 (the five properties and the stack table). No account needed.

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Cold open: a ticket on screen — "Our database went down. What are YOU doing about it?" | "A customer sends you this. Before you open a single console, there's one question that decides the next two hours: whose problem is this? Not whose fault — whose job." |
| 0:20 | Presenter draws a tall column of nine boxes, bottom to top: Facility, Hardware, Virtualization, Operating system, Runtime, Application, Configuration, Data, Identity. | "Every running application sits on a stack like this. If you own a server in your building, you own all nine boxes. Every cloud service model is a decision about how many of these you hand to someone else." |
| 0:50 | Draws a horizontal line above Virtualization, labels the column "IaaS". Shades boxes below the line in a dotted pattern labelled "Provider". | "Infrastructure as a service: the provider runs the building, the hardware, and the hypervisor. You get a virtual machine. From the operating system up — patching, runtime, your app, your firewall rules, your backups — it's yours." |
| 1:20 | Second column; line drawn above Runtime. Label "PaaS". | "Platform as a service moves the line up. You hand over code or a container image, and the platform runs it. You don't patch the OS. Often you can't even log into it. What's left for you: the application, its configuration, its data, and who can reach it." |
| 1:45 | Third column; line drawn above Application. Label "SaaS". | "Software as a service: the provider wrote the app and runs it. You still own three things." |
| 2:00 | Presenter circles the top three boxes — Configuration, Data, Identity — across all three columns with a thick solid outline. | "These three. Configuration, data, identity. They're yours in every column. There is no service model where the provider becomes responsible for who you gave access to, or what you uploaded, or the setting you flipped. That's where most real cloud incidents live." |
| 2:30 | Back to the ticket. Presenter writes two branches: "Engine on a VM they rent" and "Managed database service". | "So back to 'our database went down.' First: what exactly is the database? If it's an engine they installed on a rented VM, the engine, its version, its disk, its backups are all theirs. If it's a managed database, the engine and the host are the provider's — but the connection limits, the queries, and the access grants are still theirs. Same sentence from the customer. Two completely different investigations." |
| 3:15 | Case card 1: "Logging library has a remote-code flaw." Three customers A/B/C as icons on IaaS/PaaS/SaaS columns; an arrow points to the Application box. | "Here's a harder one. A popular logging library has a security flaw. Customer A runs their app on VMs: the library is inside their application. Theirs. Customer B runs the same app on a managed platform: the library is still inside their application bundle. Still theirs — the platform doesn't reach into their code. Customer C uses a SaaS product built with that library: now it's the provider's application, so it's the provider's fix. The customer's job is to read the advisory and check their data." |
| 4:10 | Presenter writes the rule large: "Which layer is the flawed thing in? Who operates that layer for THIS service?" | "Same vulnerability, three owners. The deciding question is always the same: which layer is the broken thing in, and who operates that layer for this particular service?" |
| 4:30 | Case card 2: "Storage bucket readable by the whole internet." Arrow to Configuration. | "Exposed storage bucket. Customer, in every model, every time. Permissions are configuration. The provider enforced exactly the policy it was given." |
| 4:50 | Case card 3: "Region down for two hours." Split the card: left half "Region availability → Provider", right half "Did the app survive one region failing? → Customer's architecture". | "A whole region fails for two hours. The region's availability is the provider's promise, and they owe what the service level agreement says — usually a credit. But whether the customer's application survived losing one region is a design the customer chose and paid for, or didn't." |
| 5:30 | Six numbered steps appear as a checklist: Name the service precisely; Locate the failing layer; Read the line; Provider side → status page + support case; Customer side → investigate now; Ambiguous → treat as yours, open provider case in parallel. | "Here's the routine to use on every ticket. Name the service precisely. Locate the failing layer. Read the line for that service. If it's the provider's side, check their status page and open a case with the resource ID and timestamps. If it's yours, say so and start. If you're not sure — treat it as yours and open the provider case in parallel. Waiting for a vendor to tell you it's yours is not an investigation." |
| 6:20 | Recap frame: the three columns, the solid outline around the top three boxes. | "Three columns, one line that moves per service, and three boxes that never move. Learn to read that line in ninety seconds and you'll start every ticket in the right place." |
| 6:45 | End card: "Try it: lesson 02, Practice Part 4." | "Now try the triage drill in lesson 02. Three tickets, one line each." |

## On-screen assets and B-roll
- Whiteboard or digital whiteboard (Excalidraw) with the nine-box stack pre-drawn in light grey so the presenter traces over it.
- Three case cards (ticket-styled rectangles) prepared as overlays.
- The lesson's `shared-responsibility-line.png` diagram can be shown for two seconds at 2:00 as a reference.

## Accessibility
- Burned-in captions plus a sidecar caption file.
- Provider vs customer is shown by **pattern** (dotted fill = provider, plain = customer) and by text labels, not by colour alone.
- Narration names every box as it is drawn, so the content is complete audio-only.
- Provide the six-step routine as a downloadable text checklist.

## Check for understanding
1. A customer's SaaS ticketing product shows another customer's tickets to their users. Whose layer failed? *Answer: the provider's application layer (tenant isolation inside their app) — the customer's job is to report it, assess exposure, and read the advisory.*
2. A VM's disk fills with logs. Which column, which layer, whose job? *Answer: IaaS, operating system layer, the customer's.*
3. Why should an ambiguous ticket be treated as yours while the provider case is open? *Answer: Waiting for the vendor extends the outage; investigating in parallel loses nothing if it turns out to be theirs.*
