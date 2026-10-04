---
course_id: ai102
media_id: ai102-v01
type: video-script
title: "Webhooks: Answer Fast, Verify, Deduplicate"
format: hybrid
target_runtime: "8 min"
related_lessons:
  - ai102-10
  - ai102-07
objectives:
  - Receive and send events with webhooks, including verifying and shaping an inbound payload
competency_ids:
  - D2-S1-C03
---

## Purpose

After watching, the learner can explain why a webhook receiver must acknowledge fast, verify a signature against the raw body with a timestamp check, and deduplicate on the sender's event id, and can use the ai102-x01 harness to prove all three.

## Audience and prerequisites

Apprentices who have finished lesson 09 (REST from an HTTP step) and are starting lesson 10. They know status codes and JSON bodies. They do not need to write code: the terminal segments only run a provided script.

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Cold open. Whiteboard: two boxes, "Booking system" and "Your scenario". An arrow labelled `POST /hooks/...` goes right. A second, identical arrow follows it. | "Here's a booking that got created once and recorded twice. Nobody clicked anything twice. The sender did exactly what it's supposed to do. In the next eight minutes you'll see why that happens and the three things your receiver needs to do about it." |
| 0:20 | Title card: "Webhooks: Answer Fast, Verify, Deduplicate". | "Webhooks: answer fast, verify, deduplicate." |
| 0:28 | Whiteboard: polling loop ("anything new?" x 5, four "no") next to a single push arrow. | "So far your triggers have mostly asked: anything new? Anything new? Most of the time the answer is no, and you still pay for asking. A webhook flips that around. The source system calls you the moment something happens. It's an ordinary HTTP POST with a JSON body, sent to a URL you gave it. The difference is that now you're the server, so you don't control when it arrives, what's in it, or who sent it." |
| 1:05 | Show the lesson 10 sample payload on screen, with `id`, `type`, and `data.booking.customer.email` highlighted in turn. | "Here's the event we'll use all the way through, from lesson 10. Three things matter. The `id` at the top is the sender's event id, which you'll use to spot duplicates. The `type` tells you what happened. And the data you actually want is nested: the customer's email is at data, booking, customer, email." |
| 1:35 | Sequence diagram builds: Sender -> POST -> Receiver. A stopwatch appears over the sender, counting. Receiver box shows three work items: "call model", "write 3 records", "post message". Stopwatch passes a dashed line labelled "sender timeout". Sender draws a red X, then sends the POST again. | "Problem one is time. The sender waits for your answer, and it doesn't wait long. Typical timeouts are somewhere between a few seconds and half a minute, and the sender's docs tell you the real number. If your scenario calls a model, writes three records, and only then responds, the sender gives up, counts that as a failed delivery, and sends the same event again. You did nothing wrong, but now you have a duplicate." |
| 2:15 | Diagram redraws: Receiver returns `200` immediately; the work items move to a lane labelled "after acknowledgement". | "The fix is to acknowledge first and do the work afterwards. Both platforms in this course already do this by default. They answer as soon as the trigger has captured the request and keep running the rest of the scenario. What you must avoid is putting a custom response at the end of a long chain. Save synchronous responses for the few cases where the sender really needs data back, and keep those to a couple of seconds." |
| 2:45 | Text on screen: `200/204 = accepted`, `4xx = don't retry`, `5xx = please retry`. | "The status you return controls what the sender does next. A 200 or 204 means you've got it. A 4xx means don't bother sending it again, and many senders disable an endpoint after enough of those. A 5xx means try again later." |
| 3:05 | Whiteboard: the catch URL written large. Arrows point to it from "browser history", "support ticket", "screenshot", "proxy log". | "Problem two is trust. Your catch URL is a public endpoint. It ends up in browser history, screenshots, and support tickets. Anyone who has it can post anything, and your scenario will happily create records from it. Keeping the URL obscure doesn't make it secure." |
| 3:30 | Diagram: Sender holds a key icon labelled "shared secret". It feeds `timestamp + "." + raw body` into a box labelled HMAC-SHA256, producing a header `X-Signature: t=1772615520,v1=<64 hex characters>`. Receiver holds the same key and runs the same box; the two outputs are compared with an "=" sign. | "The proper fix is a signature. The sender and you share a secret. For each delivery, the sender runs an HMAC, a keyed hash, over the timestamp and the exact raw body, and puts the result in a header. You run the same calculation with your copy of the secret. If the results match, the body hasn't been changed and it came from someone who holds the secret. Exactly which string gets signed varies by sender, so read their docs. A lot of them use timestamp, a dot, then the body, like this." |
| 4:10 | Two callouts appear: (1) "Raw bytes, before parsing" with a JSON object whose keys reorder and the "=" turns to "≠"; (2) "Reject if older than 5 min" with a clock. | "Two details catch people out. First, sign the raw bytes. If your platform parses the JSON and you re-serialise it, the keys can come out in a different order and the hash won't match. Second, check the timestamp. A valid signature with no time limit can be captured once and replayed forever, so reject anything older than a few minutes." |
| 4:40 | Whiteboard: three rungs of a ladder, bottom to top: "Shared secret header", "HMAC signature", "Callback-fetch". | "If your platform can't compute an HMAC without a code step, you still have options. A shared-secret header is weaker, because the secret travels with every request. Callback-fetch is often the strongest option and the simplest: treat the webhook as a tip-off, take only the id, and GET the real booking from the API using your own credentials. A forged event then just makes you re-read a real record. Whichever you pick, write down the choice and what it does and doesn't guarantee." |
| 5:20 | Diagram: two identical POSTs arrive. A table labelled `ProcessedEvents` appears. First POST: lookup finds nothing, work runs, row `evt_01HZ8P2K4M` added. Second POST: lookup finds it, flow stops at a filter. | "Problem three: duplicates are normal. Webhook delivery is at-least-once, so every event can turn up more than once, whether from a timeout, a retry, or someone clicking resend. The fix is the idempotency pattern from lesson 07, keyed on the sender's event id. Look the id up in a ProcessedEvents table. If it's there, stop. If it isn't, do the work and record the id at the end." |
| 5:55 | A thin sliver highlights both POSTs passing the lookup at the same instant. Caption: "the race". Then the Bookings write gets a key icon labelled `external_ref`. | "There's a small race here. Two copies arriving in the same instant can both pass the lookup. Where that matters, make the write itself keyed, a find-or-create on external_ref, so even the race can only produce one booking." |
| 6:15 | Screen recording: terminal in a large font. Command typed: `node --test harness/receiver.test.mjs`. Output shows 8 passing tests and 1 skipped. Zoom on the lines "forged body is rejected 401", "stale timestamp is rejected 401", "duplicate delivery produces exactly one booking". | "Here's all of that as something you can run. This is the harness from project x01. It starts a local reference receiver and fires six events at it: a genuine one, a duplicate, a forged one, a stale one, an unknown type, and one with the data missing. The forged and stale ones get rejected, the duplicate produces exactly one booking, and the two malformed events go to Exceptions instead of being written." |
| 6:55 | Terminal: `WEBHOOK_SECRET=… node harness/send-events.mjs <catch URL>` (URL blurred). Output shows six lines, all `200`. Cut to a still of a Bookings table with one row and an Exceptions table with two. | "Now point the same events at your own catch URL. Don't be surprised when every response is a 200. Your platform acknowledges on capture, which is exactly what you want. So the proof isn't in the status codes. It's in your tables: one booking, two exceptions, and two runs that stopped at the verification filter." |
| 7:30 | Recap card with three lines: "Ack first, work after." "Verify raw body + timestamp." "Dedupe on event id, key the write." | "Acknowledge first and do the work afterwards. Verify the raw body and the timestamp. Deduplicate on the event id, and key the write. That's a webhook receiver you can actually depend on." |
| 7:50 | End card: "Next: lesson 10 practice, exercises 4 and 5." | "Next, do exercises four and five in lesson 10, using the harness as your test sender." |

## On-screen assets and B-roll

- Whiteboard frames: polling vs push; ack-then-work sequence; HMAC compare; ladder of verification strengths; ProcessedEvents lookup with race sliver.
- The lesson 10 sample payload, typeset, with highlight passes.
- Terminal recordings from the ai102-x01 harness (Node 20+, font size 20+, light theme). Blur the catch URL and never show the real secret; use `test-secret-not-for-production` on screen.
- Do not record vendor UI menus for this video. Platform labels change, and the concepts here don't depend on them.

## Accessibility

- Burned-in captions plus a separate caption file; the narration above is the transcript.
- Every diagram state is also spoken (for example "the second POST stops at the filter"), so nothing depends on seeing the arrow.
- Accept and reject are shown by icon and word (check + "accepted", cross + "rejected"), not by green and red alone.
- Terminal text is at least 20 pt with high contrast; pause on each result line for 2 seconds or more.
- Signature hex strings are never read aloud. Narration calls them "the signature" and shows them in a monospace font.

## Check for understanding

1. Your scenario calls a model before it responds, and the sender's timeout is 10 seconds. What will you see in your tables over a busy day, and what's the fix? *Answer: duplicate records, because the sender retries after timeouts. Acknowledge immediately (platform default) and do the work asynchronously, and deduplicate on the event id anyway.*
2. Why must the HMAC be computed over the raw body rather than the parsed and re-serialised JSON? *Answer: re-serialising can change key order, whitespace, or escaping, which changes the bytes and so the hash. Only the exact bytes the sender signed will match.*
3. Your platform returned `200` to a forged request. Is your verification broken? *Answer: not necessarily. Platforms acknowledge on capture. The evidence is that the run stopped at the verification filter and nothing was written.*
