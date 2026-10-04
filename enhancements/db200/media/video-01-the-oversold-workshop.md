---
course_id: db200
media_id: db200-v01
type: video-script
title: "The Oversold Workshop: Atomic Updates Instead of Read-Then-Write"
format: screencast
target_runtime: "6 min"
related_lessons:
  - db200-05
objectives:
  - Build an application feature against a document database
competency_ids:
  - D2-S1-C04
---

## Purpose

After watching, the learner can replace a read-modify-write sequence with a single conditional `findOneAndUpdate` so that concurrent requests can't oversell a capacity-limited event.

## Audience and prerequisites

Learners in lesson 05 who have `src/db.js` and the `rsvps` repository working against a local MongoDB.

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Photo-style slide: a Maker Space sign reading "Capacity 40", a sign-in sheet with 46 names. | "The Maker Space holds 40 people. Forty-six showed up with confirmations for Intro to Soldering. Nobody hacked anything. The code did exactly what it was written to do. Let's find out why." |
| 0:20 | Editor showing the naive code: `const ev = await events.findOne({ _id }); if (ev.attendeeCount < ev.capacity) { await events.updateOne({ _id }, { $inc: { attendeeCount: 1 } }); }` | "Here's the first version most of us write. Read the event. If there's room, increment the count. Two steps, and that gap between them is the whole bug." |
| 0:50 | Split timeline graphic: Request A and Request B both read `attendeeCount: 39`, both pass the check, both increment. Final count 41. | "Two requests arrive in the same millisecond. Both read 39. Both see one seat left. Both increment. Forty-one confirmed for forty seats. Under real load this happens many times over." |
| 1:30 | Terminal: run a script firing 25 concurrent `register` calls at an event with `capacity: 2`; output `confirmed: 7`. | "Let's prove it. Twenty-five registrations at once for two seats. Seven confirmed. That's your oversell, reproduced on your laptop." |
| 2:00 | Editor: replace with `const seat = await events.findOneAndUpdate({ _id: eventId, $expr: { $lt: ["$attendeeCount", "$capacity"] } }, { $inc: { attendeeCount: 1 } }, { returnDocument: "after" });` | "The fix is to put the check inside the update. This filter matches the event only while attendeeCount is less than capacity. The server evaluates the filter and applies the increment as one atomic operation on that one document. There's no gap for another request to slip into." |
| 2:45 | Highlight `$expr`. Caption: "$expr lets a filter compare two fields of the same document". | "`$expr` is what lets a filter compare two fields in the same document, attendeeCount against capacity. A normal filter can only compare a field with a constant." |
| 3:05 | Highlight `if (!seat)` branch returning waitlisted. | "If the update matched nothing, findOneAndUpdate returns null. That means the event was full, and this request goes to the waitlist instead." |
| 3:25 | Terminal: rerun the 25-way script; `confirmed: 2, waitlisted: 23`. Run it twice more, same result. | "Run it again. Two confirmed, twenty-three waitlisted. Again. Same. That's the test you want: the same answer every time under concurrency." |
| 3:55 | Side-by-side: lesson 05's `$inc` on attendeeCount vs. the unique `{ eventId, userId }` index. | "You've now seen three ways to let the database settle a race. The unique index stops duplicate RSVPs. `$inc` stops lost updates on a counter. A conditional update stops you exceeding a limit. All three work because a single-document operation in MongoDB is atomic." |
| 4:30 | Callout: "Still two writes: RSVP insert + seat update." | "Be honest about what's left. Registering still writes the RSVP and the event separately. A crash between them leaves them out of step. Name that exposure in your design notes, and decide on a transaction, a reconciliation job, or accepting it." |
| 5:10 | Recap card. | "Whenever you catch yourself reading a value, deciding in JavaScript, and writing it back, ask whether the decision can move into the update's filter. Usually it can." |
| 5:30 | End card: "Project db200-x01: Capacity Limits and a Fair Waitlist." | "The supplementary project has the 25-way test ready for you. Make it pass." |

## On-screen assets and B-roll

- Local `mongo:7` container; event fixture `{ _id: "evt_test_soldering", capacity: 2, attendeeCount: 0, waitlistSeq: 0 }`.
- A small `race.js` script that calls `register` 25 times via `Promise.all` and prints the counts. The naive version's confirmed count varies by run; narrate whatever number appears.
- Animated timeline for the two-request interleaving.

## Accessibility

- Captions plus WebVTT; all code read aloud on first appearance.
- The timeline uses labels "Request A" and "Request B" and different line styles (solid and dashed), not color alone.
- Spoken results ("two confirmed, twenty-three waitlisted"), not only shown in the terminal.

## Check for understanding

1. Why does checking `attendeeCount < capacity` in JavaScript fail under concurrency? *Answer: two requests can both read the old value before either writes, so both pass the check.*
2. What does `findOneAndUpdate` return when the conditional filter matches nothing, and what does that mean here? *Answer: `null`, meaning the event was already full.*
3. Why can't a unique index enforce "at most 40 attendees"? *Answer: a unique index prevents duplicate key values. It can't count documents or compare against a limit.*
