---
course_id: cyb100
media_id: cyb100-v01
type: video-script
title: "Reading a Control in Three Questions"
format: hybrid
target_runtime: "6 min"
related_lessons:
  - cyb100-02
objectives:
  - Explain confidentiality, integrity, and availability, and use them to describe what a security control is protecting
competency_ids:
  - D1-S1-C03
---

## Purpose
After watching, the learner can take any control at Harlow & Finch and state the property and asset it protects, its category and function, and a specific failure mode, without reaching for product names.

## Audience and prerequisites
Apprentices who have read the CIA triad and control category/function sections of cyb100-02. No technical setup.

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Talking head. Lower third: "Reading a control". A sticky note on a whiteboard reads *"The finance share is insecure."* | "Here's a ticket I see every month: 'The finance share is insecure.' That sentence has no information in it. By the end of this video you'll be able to turn any security measure into three sentences someone can actually act on." |
| 0:25 | Whiteboard: three numbered boxes appear. 1 "What property, on what asset?" 2 "Category and function?" 3 "What is the failure mode?" | "The method is three questions. One: what property — confidentiality, integrity, or availability — and on what asset? Two: what category is it — administrative, technical, physical — and what function — preventive, detective, corrective, deterrent, compensating? Three: under what realistic circumstance does it fail? Question three is where the value is." |
| 1:00 | Title card: "Example 1 — Nightly backup of the file server (Harlow & Finch)" | "Let's use Harlow & Finch, the thirty-person accounting firm. First control: a nightly backup of the file server." |
| 1:10 | Box 1 fills: "Availability (and integrity — a known-good version) of client files" | "Property and asset: availability of the client files, and integrity in the sense that a known-good version exists to go back to." |
| 1:25 | Box 2 fills: "Technical · Corrective" | "Category: technical. Function: corrective — it does nothing until something has already gone wrong, and then it puts things back." |
| 1:40 | Box 3 fills, three bullets appear one at a time: "Never restored → unknown if readable"; "Drive attached to server → encrypted with it"; "Runs 1 a.m., accounts write at 2 a.m. → always a day stale" | "Failure mode. Pick the most realistic one and be specific. Nobody has ever restored from it, so nobody knows it's readable. Or the backup drive is permanently connected to the server, so whatever scrambles the server scrambles the backup too. Notice: the backup can succeed every single night and still be worthless." |
| 2:25 | Title card: "Example 2 — RAID on the server's disks" | "Second control, and the most misunderstood one in small offices: RAID — two disks holding identical copies." |
| 2:35 | Boxes fill: "Availability against one disk failing" / "Technical · Preventive" / "Believed to be a backup. It mirrors deletion, corruption, ransomware instantly." | "It protects availability against one disk dying. Technical, preventive. Failure mode: people think it's a backup. It isn't. Delete a folder and RAID deletes it on both disks, perfectly, immediately." |
| 3:05 | Title card: "Example 3 — Quarterly access review" | "Third: a quarterly access review, where managers confirm who still has access to what." |
| 3:15 | Boxes fill: "Confidentiality + integrity of client folders" / "Administrative · Detective" / "400-row spreadsheet approved unread" | "Confidentiality and integrity, by removing permissions that outlived their reason. Administrative, detective — it finds the problem, it doesn't stop it. Failure mode: the manager gets a four-hundred-row spreadsheet and clicks approve. A detective control nobody reads isn't a control. It's a task." |
| 3:50 | Split screen: left "Weak answer: 'Someone might misconfigure it'" (struck through); right "Strong answer: 'The keypad code is written inside the supply cupboard.'" | "Here's how you'll be graded, and how you'll be judged at work. 'Someone might misconfigure it' scores nothing. It's true of every control ever built. A strong failure mode names a who, a when, or a what: the keypad code is written inside the supply cupboard." |
| 4:25 | Talking head. On screen: "Can't answer Q1? → That's a finding." | "One more rule. If you can't answer question one — if nobody can tell you what property a control protects — that's a finding too. Either you don't understand the control, or it has no purpose." |
| 4:50 | Pause card: "Your turn: antivirus reporting to a console nobody has logged into since installation." 10-second countdown. | "Your turn. Pause the video. Antivirus is installed on every workstation, reporting to a console nobody has opened since installation. Answer the three questions." |
| 5:05 | Answer card fills the boxes: "Integrity + availability of workstations (and confidentiality of their data)" / "Technical · Preventive and detective" / "Detective half is dead: alerts go to a console nobody reads" | "Here's a model answer. It protects the workstations' integrity and availability, and the data on them. Technical; preventive when it blocks a file, detective when it alerts. Failure mode: the detective half does nothing at all, because the alerts land in a console nobody reads. Did you name that specific circumstance? Good." |
| 5:40 | Talking head, end card listing the three questions. | "Three questions: property and asset, category and function, failure mode. Use them on every control in the lesson 02 practice, and you'll never write 'insecure' in a ticket again." |

## On-screen assets and B-roll
- Whiteboard template with the three labelled boxes (reused for each example).
- Title cards for each example; weak/strong answer split card; pause/answer cards.
- Optional B-roll: a server cupboard with a door propped open (Harlow & Finch), a hand clicking "Approve all" on a spreadsheet.

## Accessibility
- Burned-in and toggleable captions; all box text is also spoken in full.
- Weak vs. strong answers are distinguished by a strike-through and the words "Weak"/"Strong", not by red/green alone.
- The pause card is read aloud and held for 10 seconds; the transcript includes the full model answer.
- Minimum 24 pt text on whiteboard captures; high-contrast markers.

## Check for understanding
1. A server room badge reader logs every entry. Name its category and function. *Answer: physical (and technical); detective — and deterrent if visible. It does not prevent entry by someone holding the door.*
2. Why is "someone might misconfigure it" not an acceptable failure mode? *Answer: it is true of every control and names no circumstance anyone could check or fix.*
3. RAID protects which property, and why is it not a backup? *Answer: availability against a single disk failure; it copies deletions and corruption to every disk instantly, so it provides no earlier good version.*
