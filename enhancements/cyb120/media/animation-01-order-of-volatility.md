---
course_id: cyb120
media_id: cyb120-a01
type: animation-storyboard
title: "What Disappears When You Pull the Plug"
target_runtime: "80 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - cyb120-06
  - cyb120-08
objectives:
  - Collect and analyze host and network artifacts without altering the evidence
  - Choose containment, eradication, and recovery actions that stop an incident without destroying evidence or the business
competency_ids:
  - D3-S1-C02
  - D3-S1-C05
---

## Concept and misconception it fixes
Misconception: "Power it off, that's the safest containment." Powering off a compromised host destroys memory, network state, running processes, and often temporary files, all at once. Network isolation stops the attacker's channel and keeps those layers intact for acquisition. The animation shows the order of volatility as stacked layers and contrasts the two containment choices on WKS-4471.

## Visual language (shapes, colors with color-blind-safe palette, labels)
- Okabe-Ito palette. Eight horizontal layers stacked top (most volatile) to bottom (least): Registers/cache, Memory (RAM), Network state, Processes and system state, Temp/swap, Disk, Central logs, Backups. Each has a text label and an icon. Volatile layers 1–5 are sky blue `#56B4E9`; durable layers 6–8 are blue `#0072B2`.
- "Lost" state: layer turns grey `#999999` with a dotted outline and the word "LOST". This uses pattern and text, not only colour.
- "Collected" state: orange `#E69F00` tick badge plus the word "COLLECTED" and an evidence ID (e.g., E001).
- The attacker channel is a dashed line from the host to a cloud labelled `198.51.100[.]44`.

## Scenes
| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 8 s | WKS-4471 drawn as a tower. The eight layers fade in, top to bottom. A dashed beacon line pulses every 60 s (sped up). | Layers stack; the beacon pulses. | "WKS-4471 is beaconing to attacker infrastructure. Its evidence lives in layers, from gone-in-nanoseconds at the top to lasts-for-years at the bottom." |
| 2 | 10 s | A tooltip on each layer shows what it holds: RAM: "injected code, keys, connections"; Network: "ARP/DNS cache, sockets"; Processes: "tree, command lines". | Tooltips appear in sequence. | "Memory holds what never touches disk: injected code, decryption keys, live connections. Network and process state show which program is talking, and to whom." |
| 3 | 12 s | Branch A, "Pull the plug". A power icon flips off. Layers 1–5 grey out top-down with "LOST". The beacon line stops. | A quick cascade; each layer greys in 0.3 s. | "Option A: pull the plug. The beacon stops, and so does everything in the top five layers. That loss is permanent. You'll never know what was running in memory." |
| 4 | 6 s | Rewind effect back to scene 1. | Reverse scrub. | "Let's try that again." |
| 5 | 12 s | Branch B, "Network-isolate, leave running". A shield icon cuts the beacon line at the network edge; the host stays lit. A small line to "EDR console" stays connected. | The cut animates; the host glows steady. | "Option B: isolate the host through the endpoint agent and leave it powered on. The attacker's channel is cut, but the agent's management channel stays up. Every layer is still there." |
| 6 | 16 s | Acquisition in order: RAM gets a tick "COLLECTED E001 · SHA-256 recorded"; then network state, processes, and temp; then disk "E002 image, hashes MATCH". The clock-offset note "host +0 s vs NTP" pops beside it. | Ticks land top-down in volatility order, each with a hash badge. | "Now collect in order of volatility: memory first, hashed on completion. Then network and process state, then targeted files, then the disk image with both hashes matching. Record the clock offset; every timestamp depends on it." |
| 7 | 10 s | Side-by-side summary. A: 5 layers LOST. B: 8 layers available, 6 collected. A footer reads: "Power off only if destruction is active and outpacing every other option." | Panels slide in. | "Both options stop the beacon. Only one keeps the evidence. Power off is the nuclear option: use it when destruction is active and nothing else is fast enough, and write down why." |
| 8 | 6 s | End card: "Acquire before you eradicate." | Fade. | "And whatever you choose: acquire before you eradicate." |

## Interaction variant (optional)
An H5P branching scenario. At scene 3 the learner picks "Power off", "Isolate", "Block at perimeter only", or "Reimage now". Each branch animates which layers survive and whether the beacon stops. "Block at perimeter only" keeps every layer but shows the attacker noticing (a "!" on the cloud) while the host can still move laterally. "Reimage now" greys out every layer except central logs and backups.

## Production notes
- Use the same host name, IP, and evidence IDs as lessons 05–06 (WKS-4471, 198.51.100[.]44, E001/E002) so the animation reinforces the running case.
- Do not show attacker tooling or code. The threat is a dashed line and a cloud.
- The VO states every layer change so the audio-described version needs no extra track. Captions include "LOST" and "COLLECTED" state words.
- Pairs with cyb120-x02 (custody drill) and lesson 08's "Power off. The nuclear option."
