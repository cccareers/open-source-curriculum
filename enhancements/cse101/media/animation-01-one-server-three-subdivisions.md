---
course_id: cse101
media_id: cse101-a01
type: animation-storyboard
title: "One Server, Three Subdivisions"
target_runtime: "90 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - cse101-03
objectives:
  - Explain how virtualization, containers, and serverless functions divide physical hardware into usable compute
competency_ids:
  - D2-S1-C02
---

## Concept and misconception it fixes
Learners treat VMs, containers, and functions as three unrelated products. The animation shows them as three ways of cutting the **same** physical server, differing in what is shared (hypervisor vs kernel vs everything) and therefore in start time, isolation strength, and idle cost. It also fixes the misconception that a stopped VM costs nothing (its disk keeps billing).

## Visual language (shapes, colors with color-blind-safe palette, labels)
- Physical server: large dark-grey rectangle labelled "1 server: 32 cores, 256 GB".
- Hypervisor: horizontal band, **blue (#0072B2)**, labelled "Hypervisor".
- Guest OS / kernel: **orange (#E69F00)** bands, labelled "Guest OS" or "Host kernel".
- Customer workload: **bluish green (#009E73)** blocks labelled with app names.
- Idle/billing indicator: a small meter icon with "$" that spins when billing; a dashed outline when not.
- Every colour is paired with a label and a distinct texture (solid/striped/dotted) so meaning survives greyscale.
- Clock in top-right shows elapsed start time.

## Scenes
| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 8s | One server with a single green app block occupying a sliver; utilization gauge reads 8%. | Gauge needle wobbles low. | "One server, one app: about eight percent busy, full price." |
| 2 | 8s | Ten app blocks crowd onto the server sharing one orange OS band; red-free warning icons (⚠ triangles) appear between blocks: "port 443 conflict", "lib v2 vs v3". | Blocks jostle; one block crashes and goes grey while the others keep running. Then a second block's memory bar swells until it fills the server, and the whole OS band flickers out. | "Ten apps on one OS: conflicts, crashes, and one app's runaway memory can starve the shared OS and take everyone down." |
| 3 | 14s | Blue hypervisor band slides in above the hardware. Three VM boxes rise, each with its own orange Guest OS band and green app. Clock counts to "45 s" as each boots. | Each VM boots in sequence: firmware → kernel → app light up. | "Virtual machines: the hypervisor pretends to be hardware. Each guest gets its own OS. Strong isolation, tens of seconds to boot." |
| 4 | 8s | One VM is "stopped": its compute block turns dashed, but its attached disk cylinder stays solid with a spinning "$" meter. | Compute meter stops; disk meter keeps spinning. | "Stop a VM and compute billing stops. The disk still exists — and still bills." |
| 5 | 14s | Reset. One orange "Host kernel" band. Eight thin green container blocks sit on it, each wrapped by two outlines: a dotted outline labelled "namespace: what it can see", and a solid outline labelled "cgroup: what it can use". Clock: "0.5 s". | Containers pop in near-instantly. One container's memory bar fills to its cgroup line and the block blinks out; with a small "restart policy: on" tag visible, a new one replaces it: label "OOM kill → restart (if policy set)". | "Containers share one kernel. Namespaces limit what they see; cgroups limit what they use. Start in under a second. Exceed the memory limit and the kernel kills it. Whether it comes back depends on the restart policy you or your orchestrator set." |
| 6 | 16s | Reset. Server is mostly empty and dim. A queue of request dots arrives from the left. For each dot a tiny green function block appears, runs, and vanishes. First block shows a "cold start" spinner (clock: "1.2 s"); following blocks reuse a warm environment (clock: "15 ms"). When the dots stop, the server dims and the "$" meter stops. | Burst of 30 dots → 30 parallel blocks; then silence. | "Functions: the platform adds environments as concurrent requests grow and reuses warm ones when it can. A new one is a cold start; warm ones are fast. No requests, no compute bill — unless you have paid to keep some warm." |
| 7 | 12s | Three columns side by side (VM / Container / Function) with rows animating in: "Shares", "Starts in", "Idle cost", "You patch". Values: Hypervisor / Kernel / Everything; minutes / seconds / ms–s; full / full unless scaled to zero / zero; OS and up / image contents / your code. | Rows type in one at a time. | "Same server, three cuts. Moving right, you share more, start faster, and patch less." |
| 8 | 10s | The three columns tilt to sit on the lesson 02 responsibility stack: VM at IaaS, Container between, Function at PaaS. | Columns slide onto the stack. | "And moving right is moving up the responsibility line." |

## Interaction variant (optional)
Step-through H5P: a slider "Requests per minute" (0 → 10,000) changes how many function blocks appear and shows the idle meter; a toggle "Stop VM" demonstrates scene 4. A final question asks the learner to drag three workloads (nightly report, vendor app with dongle, public API) onto the right column.

## Production notes
- Keep clock values labelled "illustrative"; real numbers vary by platform and runtime.
- Motion Canvas scenes map 1:1 to the table; reuse the server rectangle component across scenes.
- Export 1080p and a GIF of scene 5 for embedding in lesson 03 near the namespaces/cgroups paragraph.
- Narration script above doubles as captions.
