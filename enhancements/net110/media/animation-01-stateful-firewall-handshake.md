---
course_id: net110
media_id: net110-a01
type: animation-storyboard
title: "One SYN Through a Stateful Firewall: Handshake, State Table, First Match"
target_runtime: "110 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - net110-02
  - net110-04
objectives:
  - Read addressing, ports, and protocol behavior well enough to say what a captured network conversation is doing
  - Write and order firewall rules that implement a stated access requirement without opening unintended paths
competency_ids:
  - D2-S1-C02
  - D1-S1-C05
---

## Concept and misconception it fixes

Two misconceptions, one animation. (1) "I need a rule for the return traffic." With a stateful firewall you do not — the connection table admits replies — and adding reverse rules opens new paths (lesson 04, worked example point 1). (2) "My deny rule is in the list, so it works." Rules are evaluated top-down, first match wins; a deny below a broader allow never fires (lesson 04, "First match wins").

## Visual language

- Left: HR laptop `10.20.30.41`. Right: HR app `10.20.40.22`. Middle: firewall drawn as a gate with a **rule list** (cards stacked top to bottom) and a **state table** (ledger) beside it.
- Packets as envelopes labelled with the 5-tuple and flags (`SYN`, `SYN-ACK`, `ACK`, `PSH`, `FIN`). Envelope shape changes per flag (SYN = triangle tab, ACK = round tab) so flags are distinguishable without color.
- Okabe-Ito: blue #0072B2 allowed, vermillion #D55E00 dropped, yellow #F0E442 the rule currently being evaluated, bluish green #009E73 state-table matches. Each state also has a ✓/✗ glyph.

## Scenes

| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 8 s | Laptop emits envelope: `10.20.30.41:52318 → 10.20.40.22:443 TCP SYN`. | Envelope travels to gate. | "The laptop sends a SYN. It's asking to open a connection." |
| 2 | 12 s | Gate checks state table first: no matching entry. Then rule list: rule 10 (`10.20.30.0/24 → 10.20.40.22 tcp/443 allow`) highlights yellow, matches ✓. | Highlight walks down to rule 10, stops. | "No existing state, so the gate walks its rules from the top. Rule 10 matches. Evaluation stops — first match wins." |
| 3 | 10 s | New ledger row appears: `10.20.30.41:52318 ↔ 10.20.40.22:443 TCP SYN_SENT`. Envelope continues to server. | Row writes itself in. | "The firewall writes the conversation into its state table, and forwards the SYN." |
| 4 | 12 s | Server replies `SYN-ACK` (source 443, dest 52318). At the gate: state table row glows green ✓ — rule list is **not** consulted (dimmed). Row updates to `ESTABLISHED` after the ACK. | Reply passes through; rule cards stay grey. | "The reply comes back. There's no rule allowing the server to talk to the laptop — and there doesn't need to be. It matches the state table, so it's allowed." |
| 5 | 10 s | Data `PSH` packets flow both ways quickly; a `FIN` pair closes; row fades with a timer. | Rapid exchange; row removed. | "Data flows, then FIN in both directions, and the entry is removed." |
| 6 | 14 s | New event: the server, unprompted, sends `SYN 10.20.40.22 → 10.20.30.41:445`. No state entry. Rule list walked; nothing matches; final rule `99 deny any any (log)` matches; envelope shatters ✗; a log line prints. | Walk to bottom; drop. | "Now the server tries to start a connection to the laptop. No state, no matching allow — it falls to the default deny, and the deny is logged. That's why you never add 'return traffic' rules: they would let this through." |
| 7 | 16 s | Rule list re-shuffles to show a shadowing bug: `10 allow 10.20.30.0/24 → any tcp/443`, `20 deny 10.20.30.0/24 → 198.51.100.0/24 tcp/443`. Laptop sends SYN to `198.51.100.77:443`. Highlight stops at rule 10 ✓; rule 20 shown with a ghost outline labelled "never reached". | Highlight stops early; rule 20 fades. | "Order matters. Here, the deny for the bad range sits under a broad allow. The packet matches rule 10 and never reaches rule 20. The deny is dead code." |
| 8 | 10 s | Cards swap: deny moves to 10, allow to 20. Same SYN: stops at the deny ✗. | Cards swap with a slide. | "Specific before general. Swap them, and the intent is implemented." |
| 9 | 8 s | UDP DNS query creates a ledger row with a countdown "30 s". Countdown expires; row vanishes. | Timer drains. | "UDP has no connection, so the firewall fakes one with a timer. When it runs out, late replies are dropped." |
| 10 | 10 s | Summary panel: "State table handles replies · First match wins · Default deny, logged". | Three lines appear. | "Replies ride the state table. The first matching rule decides. Everything else hits a logged default deny." |

## Interaction variant

Step-through simulator: learners drag rule cards into an order, choose a packet (from a menu of five 5-tuples including server-initiated and a bad-range destination), and press "Send" to watch the evaluation path. A challenge mode presents lesson 04 Practice Exercise 2's rule set and asks learners to identify which rules can never match before revealing the walk.

## Production notes

- Use the lesson's addressing (`10.20.30.0/24` users, `10.20.40.0/24` servers) and documentation range `198.51.100.0/24`.
- Keep packet travel slow enough (≥1 s per hop) to read the 5-tuple labels; provide a 0.5x speed option in the web version.
- The state-table field names are generic (not `conntrack` output); add an optional caption showing the equivalent `conntrack -L` line for Linux-focused classes.
