---
lesson_id: cyb210-06
course_id: cyb210
pathway: cybersecurity-support-technician
title: "Project: Endpoint Containment Runbook"
order: 6
kind: project
competency_ids:
  - D3-S1-C05
  - D5-S1-C02
  - D5-S1-C01
objectives: []
---

## The goal

Write the runbook your organization would use to contain a compromised endpoint, and prove it works by executing it against a scenario.

The deliverable is a **procedure**, not an essay. The test is whether a colleague on their second week — competent, credentialed, but without your context and without you available — could open your document at 02:40 on a Sunday and contain the host correctly. Everything in the grading follows from that single test.

Containment is the right thing to practise first because it is the step where a technician's decisions have the largest, most irreversible consequences. Isolate too slowly and the attacker moves laterally or finishes encrypting. Isolate carelessly and you destroy the volatile evidence that would have told you what happened. Power the machine off and you have done both. The window in which a good decision is available is measured in minutes, and nobody makes a good decision in minutes by reasoning from first principles. They make it by following a procedure somebody wrote when they had time to think.

Budget four hours: roughly two on writing, one on the dry run, one on revision after the dry run breaks something.

## Scope

**In scope — endpoint containment.** Isolating the host, killing and quarantining, preserving volatile evidence, revoking the compromised identity's access, blocking indicators, deciding whether to reimage or clean, verifying the endpoint is safe to return, and handing off.

**Out of scope — deliberately.** The full incident response lifecycle, formal digital forensics discipline, chain-of-custody law, and post-incident reporting are cyb120's material and follow this course. Your runbook ends at a clean hand-off; it does not attempt to be an incident response plan. Malware analysis beyond behavioral triage is out of scope everywhere in this pathway.

**Safety.** This project involves no malware. Every step you rehearse is either performed against a benign simulated trigger in an isolated lab or walked through as a tabletop. If you exercise any part of it live, do so only on lab virtual machines on an isolated network, with a snapshot taken first. You will not write, modify, or execute malicious code at any point.

## The organization you are writing for

**Northgate Logistics** — 900 employees across a head office, two regional depots, and a large remote workforce.

- **Endpoints.** 780 Windows laptops, 60 Windows servers, 25 Linux servers, 40 macOS laptops in design and marketing. All laptops carry an EDR agent with host isolation, process termination, quarantine, and remote-artifact collection; the Linux servers carry a lighter agent with telemetry and quarantine but **no isolation capability**.
- **Identity.** A single directory service with cloud identity federation. Multi-factor authentication on all cloud applications, not on internal legacy applications.
- **Network.** Head office and depots on a flat internal network per site. Remote workers connect over VPN; some work entirely from cloud applications and connect to the VPN rarely.
- **Operations.** A three-person IT team. One person carries the out-of-hours phone on a weekly rotation. There is no 24/7 security operations centre. The out-of-hours person has EDR console access and directory administrative rights.
- **Business reality.** The depot warehouse management systems run 24/7 and a two-hour outage stops trucks. The finance team closes the month on the last two working days and will resist anything that touches their machines during that window. There is a managed service provider on contract who can be called in, with a four-hour response.

Write for this organization. Generic advice that could describe anyone will not survive the dry run.

## Requirements

Numbered so a reviewer can grade them individually. Each states what the runbook must contain.

**R1 — Trigger and scope definition.** Open with a short section stating exactly what this runbook is for and what it is not for. Define the entry conditions — the specific signals that put a technician into this procedure — and list at least three near-miss situations that should *not* trigger it, with what to do instead. Ambiguity at the front of a runbook is the most expensive kind, because it is where hesitation happens.

**R2 — Severity triage in under five minutes.** A decision aid that takes an alerting technician from "something fired" to a severity level and a containment posture, fast. It must use the observable signals from lessons 02 and 03 — process behavior, persistence, network beaconing, credential access, defense evasion, spread indicators — and it must produce at least three distinct outcomes (for example: monitor, contain now, contain now and escalate immediately). State the criteria explicitly enough that two different technicians reach the same answer.

**R3 — Volatile evidence preservation, before containment changes it.** State exactly what is captured, in what order, and with which tool. Justify the ordering by volatility. At minimum: running process list with command lines and parents, network connections with owning process, logged-on sessions, persistence locations, and the EDR timeline export. State plainly what is lost by powering the machine off and why that is not your first action. If your procedure includes a memory capture, say who is authorized to take one and when it is worth the time; if it does not, say why not.

**R4 — The containment action ladder.** Not one action but a graded set, with the criteria for choosing each. Cover at least: network isolation via the EDR agent, network isolation by other means when the agent cannot do it, process termination, file quarantine, disabling the account, revoking active sessions and tokens, and physical disconnection. For each, state what it stops, what it does not stop, what evidence it destroys, and how it is reversed. **Handle the Linux servers explicitly** — your primary containment action does not exist on them, and a runbook that does not say what to do instead will fail on the night it matters.

**R5 — Identity containment.** Endpoint isolation is only half of containment, and the half people forget. A password reset alone does not stop an attacker holding a valid session token. State the full sequence: disable or reset, revoke sessions and refresh tokens, review and remove attacker-created persistence in identity — mailbox forwarding rules, inbox rules, delegated access, application consents, newly registered multi-factor methods, new device registrations — and re-enrol the user. Say who has the rights to do each of these at 02:40 and what happens if that person is unreachable.

**R6 — Indicator blocking and estate sweep.** After the host is contained, the same payload is probably elsewhere. State what you extract from the contained host, where each indicator type is blocked, and the exact searches you run across the estate to find other affected machines. Reference the pyramid from lesson 03: say which of your blocks you expect to be obsolete within a week and what durable detection you would ask for instead.

**R7 — Remediate or reimage.** A decision rule, not a preference. State the conditions under which the endpoint is cleaned in place and the conditions under which it is rebuilt from a known-good image. At minimum, name the circumstances that make reimaging mandatory. Then give the recovery procedure for the chosen path: what is restored, from where, in what order, and how the user's data is handled given that the data may itself be the delivery vehicle.

**R8 — Verification before return to service.** A checklist proving the endpoint is safe to hand back. It must verify, individually: the persistence artifact is gone, the payload is gone, no outbound connections to the known indicators, the endpoint agent is healthy and current with tamper protection on, patch level is at the current baseline, the account is re-enrolled with fresh credentials and fresh multi-factor, and the user can work. A technician must be able to sign each line.

**R9 — Communication.** Three short templates, each no longer than a paragraph: to the affected user (what happened, what you did to their machine, what they must do, what not to do), to the business owner of an affected system (impact, expected duration, what you need from them), and to the on-call escalation (facts only, in a fixed order, no speculation). State who is notified at each severity level and within what time.

**R10 — Escalation and hand-off.** Define the conditions that convert this from a contained endpoint into a declared incident requiring cyb120's process or the managed service provider. Name at least four. Then specify the hand-off package: what the next responder receives, in what format, so they do not have to re-derive what you already know.

**R11 — A worked pass through the scenario.** Execute your own runbook against the scenario below and record what happened, in the runbook's own format, as an appendix. Timestamps, decisions, and the reasoning at each branch.

## The scenario, for R11

**Sunday, 02:38.** You carry the phone. The EDR console pages on a high-severity detection on `NG-LT-0412`, the laptop of Priya Raman in accounts payable, currently connected over VPN from home.

The timeline shows:

```text
02:31:07  OUTLOOK.EXE                        -> writes  C:\Users\praman\AppData\Local\Temp\Invoice_88214.zip
02:33:55  explorer.exe                       -> extracts Invoice_88214\Invoice_88214.lnk
02:34:02  cmd.exe    (parent: explorer.exe)  /c start /min powershell -w hidden -ep bypass -enc <base64>
02:34:03  powershell.exe (parent: cmd.exe)
02:34:06  DNS query  cdn-assets-delivery[.]example  -> 203.0.113.212
02:34:09  powershell.exe -> writes  C:\Users\praman\AppData\Roaming\WinSyncHost\wsynchost.exe
02:34:11  wsynchost.exe  (parent: powershell.exe)
02:34:12  reg.exe    (parent: wsynchost.exe)  add HKCU\...\Run /v WinSyncHost /d "...wsynchost.exe"
02:34:40  wsynchost.exe -> connection 203.0.113.212:443, 386 bytes
02:35:40  wsynchost.exe -> connection 203.0.113.212:443, 391 bytes
02:36:40  wsynchost.exe -> connection 203.0.113.212:443, 388 bytes
02:37:12  wsynchost.exe -> reads  C:\Users\praman\AppData\Local\<browser>\User Data\Default\Login Data
02:37:50  wsynchost.exe -> attempts SMB connection to NG-SRV-FIN01 (10.20.4.11:445)
```

Additional facts, available if you look for them and easy to miss if your runbook does not tell you to:

- Priya's account is a member of a group with write access to the finance file share on `NG-SRV-FIN01`.
- The mail platform shows the same attachment delivered to **fourteen** mailboxes at 02:29, all in finance and accounts payable. Three have been opened. One other endpoint, `NG-LT-0377`, shows the same `wsynchost.exe` hash written at 02:36 but no beacon yet.
- `NG-SRV-FIN01` is a Windows server with the full EDR agent. `NG-SRV-APP03`, which the finance application depends on, is one of the Linux servers with no isolation capability.
- It is the second-to-last working day of the month. Finance close begins at 07:00.
- Priya is asleep and does not answer her phone.

Your runbook must get a technician through this. If it does not tell them what to do about the fourteen mailboxes, or about `NG-LT-0377`, or about the fact that the user cannot be reached, revise it.

## Constraints

- **Plain procedure, plain language.** Numbered steps, imperative voice, one action per step. If a step needs a paragraph of justification, put the justification in a note beneath it — never in the step.
- **Every step must be executable at 02:40 by someone who did not write it.** Name the tool, name the console, give the actual command or menu path where you can. "Isolate the host" is not a step; "In the EDR console, open the host record, select Actions, then Network Isolation, and confirm; verify the host status shows Isolated before continuing" is.
- **Every irreversible action carries a stated reversal.** If it cannot be reversed, say so in the step.
- **Decisions are rules, not judgment calls.** Wherever the runbook says "decide," there must be criteria next to it.
- **Vendor-neutral.** Write to capabilities — "the EDR console's host isolation action" — not to one product's branding. Your organization will change vendors and the runbook should survive it.
- **No malware, no attack procedure.** The runbook contains only defensive actions. Do not include instructions for executing, building, or obtaining hostile code.
- **Length is not a virtue.** A runbook nobody can navigate under stress has failed regardless of completeness. Use a one-page action summary at the front and detail behind it.

## Definition of done

You are finished when all of the following are true.

1. All eleven requirements are present and individually identifiable in the document.
2. The front page is a **single-page immediate-action summary**: the first five actions, in order, with the criteria for each, readable in under sixty seconds.
3. Every step names a tool or console and states its expected observable result, so the technician knows whether it worked.
4. Every irreversible action states its reversal or states plainly that there is none.
5. The Linux server case, the unreachable-user case, and the second affected endpoint are all handled explicitly by name.
6. The identity containment section includes session and token revocation as a distinct step from password reset, and includes the mailbox-rule check.
7. The R11 appendix contains a timestamped walk-through of the scenario with at least three points where the runbook forced a decision and the criteria that resolved it.
8. **A dry run has been performed by someone else.** Hand your runbook to a peer, give them the scenario and nothing else, and have them work through it while you watch and say nothing. Record every point where they hesitated, asked a question, or did something you did not intend. Then revise. Include their findings and your revisions as a short "dry-run log" at the end — this is a graded section, and a dry-run log with no findings will be read as a dry run that did not happen.
9. Nothing in the document constitutes an attack procedure, and no malicious code appears anywhere in it.

## Hints

**Start from the actions, not from the prose.** List every action the runbook could tell someone to take, put them in the order they would be taken, and only then write around them. Runbooks that start as essays never become procedures.

**Order your evidence capture by volatility.** Memory and network state die first, then running processes and sessions, then temporary files, then disk. Anything you can only collect while the machine is live and connected must precede anything that changes its state. Isolation itself changes network state — decide deliberately whether the connection data is captured before or after, and write down why.

**Isolation is not power-off.** Network isolation via the agent keeps the machine running, keeps memory intact, keeps the process tree observable, and keeps the management channel open so you can still collect and act. Power-off destroys all of that and does not even reliably stop a scheduled task from running at next boot. Your runbook should make powering off a deliberate, justified exception with a named authorizer.

**Attend to the identity half.** Look again at line 02:37:12 in the scenario. Credentials were read. From that moment, every place those credentials are valid is potentially compromised, and the laptop is only one of them. A runbook that isolates the endpoint beautifully and leaves the session tokens live has contained the least mobile part of the problem.

**Beaconing means someone may be watching.** A live command-and-control channel implies an operator who can see what you do. That argues for containing quickly rather than observing at length — and it is also the reason to think about whether your investigative actions are visible from the endpoint.

**The fourteen mailboxes are the real scope.** One alerting endpoint is what you were paged about; it is rarely what you have. Your runbook needs a step that turns "this host" into "every host and mailbox that touched this campaign," and it should reach for the mail-side purge and the estate hash sweep in the same breath as the isolation.

**Reimage is usually the right answer and people avoid it.** If the attacker had code execution and any means to escalate, cleaning in place is a hypothesis about completeness that you cannot prove. Write a rule that makes the safe choice the default and requires a justification for the other one, rather than the reverse.

**Write the timing constraints in.** Finance close starts at 07:00 and the depots run 24/7. A runbook that ignores the business calendar will be overridden by someone senior at the worst moment. Better to have already written what happens when containment collides with the month-end close, including who is allowed to accept that risk.

**Test the sentences you are proudest of.** In a dry run, elegant sentences are usually the ones that turn out to mean two things. The hesitation your peer shows is data; the explanation you are tempted to give them out loud is the sentence that belongs in the document.
