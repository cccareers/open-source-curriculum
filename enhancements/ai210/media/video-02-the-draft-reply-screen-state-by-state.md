---
course_id: ai210
media_id: ai210-v02
type: video-script
title: "The Draft-Reply Screen, State by State"
format: screencast
target_runtime: "9 min"
related_lessons:
  - ai210-04
  - ai210-05
  - ai210-06
objectives:
  - Apply interface patterns that suit AI's probabilistic behavior, including latency, uncertainty, and error states
  - Design AI-powered interfaces for trust, transparency, and accessibility, including disclosure and correction paths
competency_ids:
  - D4-S1-C03
---

## Purpose
After watching, the learner can take one AI-powered screen through every state in the ai210-05 state table, and check the result against the ai210-06 trust and accessibility reviews, including a keyboard-only and a greyscale walkthrough.

## Audience and prerequisites
Apprentices who have written the draft-reply review wireframe description in ai210-04 and read ai210-05. Watch before ai210-05 Practice step 1. Rewatch the second half (from 5:10) before ai210-06 Practice step 5.

## Script
A screencast of a clickable low-fidelity prototype built as linked slides: grey boxes, real labels, no styling. The narrator is off camera. The cursor is enlarged, and keyboard presses appear in a key-cast overlay in the bottom-left. The prototype content is from the course's running example: a support ticket asking about a jacket return, and a drafted reply.

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | The draft-reply review screen, happy path. Draft in an editable field labelled "Drafted for you — check before sending." Three source passages below. Send and Reject side by side. | "This is the draft-reply review screen from the prototyping lesson, on its best day. A ticket came in, the assistant drafted a reply, and the operator checks it and sends. Most teams design only this screen. We're going to design the other eleven." |
| 0:20 | Zoom out to a slide showing the 12-row state table from ai210-05, with each row as a thumbnail. | "The state table lists twelve states the component can be in. Every row that has no design becomes a spinner that never ends, a blank space, or a browser default. Users read all three as 'broken.' Let's click through them." |
| 0:35 | Idle: empty draft panel showing "A draft appears here when you open a ticket. It uses your refund and shipping policies." | "Idle. Before anything happens, tell people what the feature does, in their words, at the point of use. Not in documentation." |
| 0:50 | Click a ticket. Within one frame, the panel border thickens and the text "Drafting…" appears. Key-cast shows "Enter". | "Submitted. Something has to change within about a tenth of a second, as evidence that the request was received, not the result. Without it, people click again." |
| 1:05 | Working, fast: a small activity indicator inside the draft panel only. The original message on the left is still scrollable; the cursor scrolls it to show this. | "Working, fast. The busy state is confined to the draft panel. The operator can still read the customer's message. Don't freeze the whole screen while one region is busy." |
| 1:20 | Working, slow: the panel shows staged text "Reading the refund policy…" then "Checking the order date…", with a Stop button and a "Back to queue — we'll keep this" link. | "Working, slow. When it takes tens of seconds, name the stages in the user's terms, offer Stop, and let the operator leave and come back. One caution: only show stages and progress that are real. A progress bar that moves on a timer, not on actual work, teaches people to distrust every indicator you show them." |
| 1:45 | Streaming: text appears word by word. The label above changes to "Still writing…". Send is visibly inactive: greyed, with the text "Available when the draft is finished". Cursor hovers over it; nothing happens. | "Streaming. Text arrives progressively, which feels faster and lets an operator spot a bad direction early. Two rules. Make it obvious the draft isn't finished. And don't let Send become available until it is." |
| 2:05 | Press Stop mid-stream. The partial draft stays, labelled "Stopped — partial draft". Buttons: Continue, Edit, Regenerate. | "Interrupted. Stop keeps whatever was produced. Having a visible Stop button changes how people feel about starting." |
| 2:20 | Answered, confident: back to the happy-path screen. Zoom in on the label. | "Answered, confident. Even here, it's framed as a draft to check, not a verdict. The label says 'Drafted for you — check before sending,' and the text sits in an editable field." |
| 2:35 | Answered, uncertain: above Send is a note with a warning-triangle icon and the words "Check this: the refund window it quotes comes from the sale-items policy, which was updated last month." The sentence "within 60 days" in the draft has a dotted underline. | "Answered, uncertain. Not '85% confident.' A reason in words, and the specific sentence it's least sure about, marked. Reviewers' attention is scarce, so spend it where the risk is. Here that's the refund window, the one thing this client honours even when it's wrong." |
| 3:00 | Multiple candidates: two drafts side by side, "Formal" and "Brief", each with a "Use this one" button. | "Multiple candidates. Use this only when the task is genuinely ambiguous, like tone. Never offer it when there's one right answer, such as the refund window. Choice for its own sake is a cost." |
| 3:15 | Empty: panel reads "No past replies match this ticket. Write this one yourself; the customer details are already filled in." A blank composer opens with the customer name and order number filled in. | "Empty. The system worked and has nothing to offer. Explain what was searched, and hand the operator the next move with the context already filled in. An empty result is not an error, so don't present it as one." |
| 3:35 | Refused: "The assistant does not draft replies about legal claims. Send this to escalations." Button: "Send to escalations". | "Refused. Say what it won't do, and what to do instead. Vague refusals read as malfunctions and generate support tickets about your support tool." |
| 3:50 | Failed: "Drafting stopped before it finished. Your edits are saved. Try again, or write it yourself." Retry and Write-it-yourself buttons. The cursor shows the operator's earlier edits still in the field. | "Failed. Plain language, no error code as the main message, the operator's input preserved, and Retry available. The worst ending to a wait is 'Something went wrong' and a lost draft." |
| 4:10 | Return to the state table. All 12 thumbnails now filled; tick marks appear row by row. | "Twelve states, each with a design. None of this is styling. All of it came from the state table." |
| 4:25 | Title card: **Part 2 — Can people trust it the right amount?** | "That covers the mechanics. Now the question from ai210-06: does this design help an operator trust the draft *the right amount*?" |
| 4:35 | Disclosure: zoom on the operator label. Then cut to the sent email in a mail client mock-up, with a footer line: "This reply was drafted by an assistant and checked by our support team." | "Disclosure, for two audiences. The operator sees 'Drafted for you' at the point of use. The customer, the recipient, gets a footer that travels with the email and states the actual role: drafted by an assistant, checked by a person. That's accurate here because Send is a human action." |
| 4:55 | Transparency: click one source passage; it expands to show the surrounding policy paragraph, with the line "Sale items: 30 days" highlighted. | "Transparency. What did it look at? One click away, from the draft itself. This turns 'do I believe this?' into 'let me check that line.' And here, the source says thirty days for sale items, which the draft got wrong." |
| 5:10 | Correction: cursor moves to Reject, which sits beside Send at equal size. Click. A one-tap reason list appears: "Wrong policy", "Wrong facts about the order", "Tone", "Other (optional comment)". Select "Wrong policy". The blank composer opens with context kept. | "Correction. Reject sits beside Send, with the same weight and one action. Rejecting asks for a one-tap reason, so the correction is captured as data, and then hands over a route to finish the job without the AI. If rejecting were harder than accepting, the acceptance rate in your logs would mean nothing." |
| 5:35 | Title card: **Keyboard only**. Key-cast overlay prominent. Mouse cursor hidden. | "Now the accessibility checks from ai210-06. First, put the mouse away." |
| 5:40 | Key-cast: Tab, Tab, Tab. A thick, visible focus ring moves: ticket list → original message → draft field → first source → Send → Reject. | "Tab order follows the screen: the ticket, the original message, the draft, the sources, then Send, then Reject. The focus ring is thick and visible on every element. If Reject or Escalate can't be reached by keyboard, a keyboard user has no way to correct the output, which is the most serious version of this failure." |
| 6:05 | Key-cast: Enter on Reject. The reason list opens with focus on the first option; arrow keys move between options; Enter selects. | "Reject opens the reason list and moves focus into it. Arrow keys choose and Enter confirms. Every step can be described, so there's no finding here." |
| 6:20 | Regenerate the draft. While streaming, a small text box on screen reads "Screen reader hears:", followed by "Drafting reply…" and then, at completion, "Draft ready. 4 sentences. 1 item to check." | "When content arrives asynchronously, focus stays where the operator left it. A polite live region announces the milestones, started and finished, not every word. In WCAG, that's success criterion 4.1.3, Status Messages." |
| 6:45 | Title card: **Greyscale**. The prototype desaturates to full greyscale. | "Second check: remove all colour." |
| 6:50 | Greyscale view of the uncertain state. The warning triangle, the words "Check this", and the dotted underline are all still clearly visible. | "In greyscale, the uncertain state still works, because it never relied on colour. It uses an icon, the words 'Check this', a reason, and an underline on the risky sentence. If your confidence signal was a green, amber, or red dot, this is where it disappears." |
| 7:10 | Greyscale view of the streaming state. Send is distinguishable as inactive by its label "Available when the draft is finished", not only by its fill. | "Same for the inactive Send button. The label explains it, not just the grey fill." |
| 7:25 | Split screen: the trust and transparency review checklist from ai210-06, with items ticking. The final question is highlighted: "What in this design would tell someone the output is worth checking?" | "Last, the question to sit with. What in this design would make a careful operator slow down and check? Here, three things: the source panel, the localized 'Check this' note, and a Reject button that's as easy to press as Send. If you can't name anything, you've designed for trust, not for calibration." |
| 7:55 | Return to the happy-path screen, now with the planted refund-window error. | "In ai210-07 you'll put this exact screen in front of operators, with this exact wrong draft, and watch whether they catch it. Don't tell them it's there. The design either does its job or it doesn't." |
| 8:15 | Recap card: **1. Design all twelve states. 2. Say uncertainty in words, about a specific thing. 3. Reject is as easy as accept. 4. Test with no mouse and no colour.** | "Four takeaways. Design all twelve states. Say uncertainty in words, about a specific thing. Make Reject as easy as accepting. And test with no mouse and no colour, at the wireframe stage, when it's cheap." |
| 8:40 | End card: **Your turn: ai210-05 Practice, step 1.** | "Now fill in the state table for your own screen." |
| 8:50 | End. | — |

## On-screen assets and B-roll
- Linked-slide clickable prototype of the draft-reply review screen (grey boxes, system font), with one slide per state. Build it from the ai210-04 wireframe description so it matches the lesson exactly.
- A 12-row state-table slide with thumbnails. When the ai210-05 asset `ai-interaction-states.png` exists, use it here. Until then, animation ai210-a01 is the brief for it.
- Mail-client mock-up showing the recipient disclosure footer.
- Key-cast overlay (any key-display utility). An enlarged cursor, hidden during the keyboard-only section.
- A "Screen reader hears:" caption box. This is a visual stand-in for the live-region announcements. If possible, record real screen-reader output on an HTML version and use that audio instead.
- Greyscale pass: apply a desaturation filter in the editor, not a separate mock-up, so viewers can see it is the same screen.

## Accessibility
- Captions throughout, plus a transcript with every on-screen string written out (state wording, labels, reason options).
- Every visual change is narrated. In particular, the narration states the inactive Send, the dotted underline, and the focus-ring movement out loud.
- The key-cast overlay is large and high-contrast. Each key press is also named in the transcript.
- The focus ring in the prototype is at least 2 px with strong contrast against the grey boxes.
- No content relies on colour. The greyscale section is itself the demonstration.
- No flashing. Streaming text is shown at a normal reading pace.

## Check for understanding
1. **Why is Send inactive during streaming, and what tells a greyscale or screen-reader user that it is inactive?**
   *Answer:* The draft isn't finished, so sending would commit a partial or unchecked output. The label "Available when the draft is finished", and its exposure as a disabled state, tell the user, not the grey fill.
2. **The uncertain state says "Check this: the refund window it quotes comes from the sale-items policy…" rather than "Low confidence". Name two reasons that is better.**
   *Answer:* It gives a reason, not just a level. It points to the specific claim to verify, so attention goes where the risk is. And it is understandable without colour or numeracy. (Any two.)
3. **Which of the five correction parts from ai210-06 did the video show, and which one would you still need to design?**
   *Answer:* It showed Reject, Capture (the one-tap reason), Escape (the blank composer), and Repair (the editable field). Escalate, a named human route to overturn an outcome, was not shown. For the recipient, that means an appeal path with a name, channel, and timeframe.
