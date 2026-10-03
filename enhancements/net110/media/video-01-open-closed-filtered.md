---
course_id: net110
media_id: net110-v01
type: video-script
title: "Open, Closed, or Filtered? Reading the Handshake in tcpdump"
format: screencast
target_runtime: "7 min"
related_lessons:
  - net110-02
  - net110-04
objectives:
  - Read addressing, ports, and protocol behavior well enough to say what a captured network conversation is doing
competency_ids:
  - D2-S1-C02
---

## Purpose

After watching, the learner can read a short `tcpdump` capture, identify the initiator from the SYN, and say whether a port is open, closed, or filtered — and, if filtered, whether the firewall dropped or rejected — from the packets and from Zeek `conn_state` values.

## Audience and prerequisites

Apprentices on lesson 02, before Exercises 1 and 2. Comfortable opening a terminal; no prior tcpdump use assumed.

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Terminal, two panes: left `client 10.20.30.41`, right `server 10.20.40.15`. Title: "Three answers to one SYN." | "When your machine tries to open a TCP connection, exactly one of three things happens. Telling them apart is how you'll prove every firewall rule you write in this course works. Let's watch all three." |
| 0:20 | Right pane runs `python3 -m http.server 443` (as root, lab VM). Left pane: `sudo tcpdump -i eth0 -n 'host 10.20.40.15 and tcp port 443'`. | "On the server, something listening on 443. On the client, a capture. Minus n means no name lookups, so the capture doesn't generate its own DNS traffic." |
| 0:40 | Third pane: `curl -sk https://10.20.40.15/ -o /dev/null` (it will fail TLS against plain HTTP — that's fine; we only care about the handshake). Capture prints `[S]`, `[S.]`, `[.]`. | "I connect. Three lines. Flags S — that's SYN, from the client, so the client initiated. Flags S-dot — SYN-ACK; in tcpdump, the dot means ACK. Then a bare dot — the ACK that completes the handshake. Outcome one: open. Something is listening and accepted." |
| 1:30 | Highlight the high source port `52318` vs `443`. | "Notice the ports. The client used fifty-two thousand-something — an ephemeral port. The server is on 443. When a tool doesn't label direction, the high random port is almost always the client." |
| 1:50 | Stop the server process. Repeat the curl. Capture shows `[S]` then `[R.]`. Curl prints "Connection refused" instantly. | "Now I stop the service and try again. SYN out — and straight back, R-dot: a reset. The host is up, the path is open, nothing is listening. That's closed. And it failed instantly." |
| 2:25 | Server: `sudo nft add table inet lab; sudo nft add chain inet lab input '{ type filter hook input priority 0; policy accept; }'; sudo nft add rule inet lab input tcp dport 443 drop`. Restart listener. Curl again with `--connect-timeout 10`. Capture: `[S]` repeated at ~1 s, ~2 s, ~4 s gaps; no reply. | "Now the server has a firewall rule that drops 443. Watch. SYN… nothing. SYN again a second later — same sequence number, it's a retransmission. Again after two seconds. Then four. Nothing ever comes back. That's filtered, by a silent drop." |
| 3:20 | On-screen timer overlay showing elapsed ~7 s. | "And the user feels it: the connection hangs until it times out. That's why lesson 04 suggests silent drops at the internet edge, where you want to waste a scanner's time, and rejects inside, where you want your own help desk to see a clean failure." |
| 3:45 | Change rule: `sudo nft flush chain inet lab input; sudo nft add rule inet lab input tcp dport 443 reject with tcp reset`. Curl again. Capture: `[S]`, `[R.]`. | "Switch the rule to reject with a TCP reset. Now it looks exactly like closed — a SYN and an immediate reset. From the client, a reject and a closed port can be indistinguishable. Your evidence that a firewall did it is the rule, its log line, and the fact that the service is running." |
| 4:30 | Split screen: a table — Open: `SYN → SYN-ACK`, Zeek `SF`/`S1`; Closed or rejected: `SYN → RST`, Zeek `REJ`; Dropped: `SYN, SYN, SYN…`, Zeek `S0`. | "Here's the cheat sheet. Open: SYN gets SYN-ACK, and Zeek records SF when it closes normally. Closed or rejected: SYN gets RST, Zeek calls it REJ. Dropped: SYNs with no answer, Zeek calls it S0. If you only have flow records, those state codes are how you see the difference." |
| 5:15 | Lesson 08-style extract on screen: nine `S0` lines from one source to nine servers on 445 within three seconds. | "So read this. Nine S0s, one source, nine different servers, port 445, three seconds. One S0 is a typo. Nine in three seconds is a host sweeping the network. The packets were all stopped — and that's still a finding." |
| 5:50 | Clean up: `sudo nft delete table inet lab`. | "Clean up the lab rule when you're done — a forgotten test rule is how the next ticket starts." |
| 6:05 | Recap card: "Who sent the SYN? What came back? How fast?" | "Three questions for every connection attempt: who sent the SYN, what came back, and how fast. That's enough to narrate it — and to prove your own rules work." |
| 6:30 | End card: "Now: Exercise 2 — closed versus filtered, on purpose." | — |

## On-screen assets and B-roll

- Two lab VMs on a host-only network, addresses from the course plan (`10.20.30.41`, `10.20.40.15`).
- Cheat-sheet table as a reusable slide.
- Command list (text file in description) with every command above.

## Accessibility

- Captions; every flag is spoken in full ("SYN-ACK", "reset") rather than only shown.
- Highlights use boxes and arrows, not color alone; terminal font 20 pt+ at 1080p.
- Timer overlay doubles as a visual cue for the retransmission gaps, which are also narrated.

## Check for understanding

1. You see `[S]` from `10.20.30.41` and `[R.]` from `10.20.50.7` on 3389. Open, closed, or filtered? *Answer: closed (or rejected by a firewall) — the host answered with a reset.*
2. A flow record shows `conn_state=S0` with `orig_bytes=0`. What happened? *Answer: a connection attempt that got no reply — consistent with a silent drop or a host that is down.*
3. Why does lesson 04 prefer reject inside the network? *Answer: users and the help desk get a fast, clear failure instead of a long hang, which is easier to diagnose.*
