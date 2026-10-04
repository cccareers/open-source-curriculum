---
lesson_id: ai210-07
course_id: ai210
pathway: prompt-engineer
title: "Feedback Loops: Testing Prototypes with Users"
order: 7
kind: lesson
competency_ids:
  - D4-S1-C04
objectives:
  - Plan and run a usability session on an AI prototype and turn the feedback
    into specific changes
---

## What a usability session is for

A usability session answers one question: can a person do the real task with this thing, and where do they get stuck? It is not a demo, not a sales call, and not a satisfaction survey. Five people attempting a genuine task while you keep quiet will teach you more than fifty opinions.

Two habits make the difference between a session that produces changes and one that produces a warm feeling. The first is that you watch behavior rather than collect preferences — what someone did is evidence, what someone says they would do is a prediction, and the two disagree constantly. The second is that you go in expecting to be wrong. A session run to confirm a design will confirm it, because a moderator who wants a design to succeed will unconsciously rescue every participant who struggles.

Testing an AI-powered prototype adds a complication worth planning around. The thing being evaluated is partly the interface and partly the output quality, and participants will happily conflate them. Someone who says "this is useless" may mean the layout is confusing or may mean this particular summary was wrong. Keeping those apart is the moderator's job, and it starts with what you put in front of them.

## Planning the session

**Start from a question, not a screen.** Write down the two or three things you genuinely do not know. "Do operators open the sources before sending?" "Do people notice when the draft is wrong?" "Is the reject path discoverable?" A session with clear questions has a clear analysis; a session run to "get feedback" produces a pile of impressions.

**Recruit the people who will actually use it.** Five to eight participants from the real user group finds the large majority of significant problems. Colleagues who have never done the work will find layout problems and miss every domain problem, which is the category that matters. If you can only get colleagues, say so in the write-up, because it changes what the findings are worth. Where your design has a second audience — the person receiving the AI-produced output — test with them separately; their questions are different and usually harder.

**Design tasks, not instructions.** A task gives a person a goal and a situation and lets them find their own way. An instruction tells them where to click and tests nothing.

| Instruction (tests nothing) | Task (tests something) |
| --- | --- |
| "Click Generate, then review the draft, then click Send." | "Three tickets came in overnight. Clear them the way you would on a normal morning." |
| "Notice the confidence indicator." | "One of these needs a second look before it goes out. Handle them as you see fit." |
| "Try the reject button." | "This reply is wrong about our refund window. Do whatever you'd normally do." |

**Seed the prototype with real content, including a bad output.** A prototype full of placeholder text tests nothing about trust. Load it with genuine examples from your content prototype, and deliberately include at least one output that is subtly wrong — plausible, fluent, and incorrect on a detail a domain expert should catch. Whether participants notice is often the single most valuable finding of the session, and you cannot get it by asking.

**Decide what you will record** and get consent for it. Note-taking is enough for low-fidelity work; a second person taking notes while you moderate is better than recording plus a solo moderator, because a note-taker forces you to have decided in advance what counts as a finding.

## A moderator script

Scripts keep sessions comparable across participants and keep you from improvising your way into leading questions. Adapt this one.

```text
USABILITY SESSION — <prototype> — 45 minutes
Question(s) this session answers:
  1. Do participants check the sources before accepting a draft?
  2. Is the reject path found without prompting?
  3. Does anyone catch the incorrect draft in task 3?

INTRO (5 min)
  "Thanks for the time. I'm testing a rough prototype, not you — there
   are no wrong moves here, and nothing you do can break it."
  "It's deliberately unfinished. Some things won't work, and that's fine."
  "An assistant produced some of the content you'll see. It's sometimes
   wrong, the same as it would be in real use."
  "Please think out loud — what you're looking at, what you expect, what
   surprises you."
  "I'll mostly stay quiet. If you ask me something I might turn it back
   to you — that's not me being unhelpful, it's me not wanting to lead."
  Consent to notes / recording. Any questions before we start?

WARM-UP (5 min)
  "Talk me through how you handle this work today."
  "Roughly how many of these do you deal with in a week?"

TASK 1 — routine path (10 min)
  "Three tickets came in overnight. Clear them as you would normally."
  Watch for: does the source panel get opened? At what point is Send hit?
  Prompts if stuck: "What are you expecting to happen?"
                    "What would you do if I weren't here?"

TASK 2 — uncertainty (10 min)
  "This one the system has flagged. Handle it however you think is right."
  Watch for: is the flag noticed unprompted? Is the reason read? What
  changes in their behavior, if anything?

TASK 3 — the planted error (10 min)
  "Here's the next one." (Draft states the wrong refund window.)
  Watch for: caught or not; how long before it's caught; what they do
  next; whether they use reject or just edit and send.
  Do NOT hint. If they send it, let them.

DEBRIEF (5 min)
  "What was the hardest part of that?"
  "Was there a point where you weren't sure what would happen next?"
  "Task 3 had a mistake in the draft — did you spot it? What would have
   helped you spot it sooner?"
  "If you used this every day, what would annoy you by Wednesday?"
  "Would you want a colleague to use this? Why?"
  "Anything I should have asked and didn't?"

CLOSE
  Thanks. What happens next with their input, and by when.
```

Four moderator habits matter more than the script. **Ask what, not whether**: "what did you expect to happen?" rather than "was that confusing?" **Redirect questions**: when a participant asks "should I click that?", answer "what would you do if I weren't here?" **Wait**: silence while someone struggles is data, and rescuing them destroys it. And **note the pause, not just the click** — hesitation, re-reading, and the cursor hovering somewhere twice are the observable signs of a design problem that participants rarely articulate.

## From observations to changes

Raw notes are not findings. The analysis is a three-step compression, done the same day while the sessions are fresh.

**Step one: list observations.** One line each, factual, no interpretation. "P3 sent task 3 without opening sources." "P1 clicked Regenerate twice, then edited manually." "P4 asked where the reply came from." Include how many participants each was seen in.

**Step two: group and diagnose.** Cluster observations that share a cause, then write what you think the cause is, marked as your inference rather than as fact. Three participants sending the planted error is one finding — "the confidence flag does not change reading behavior" — not three.

**Step three: assign severity and decide.** Severity comes from consequence and frequency together, judged against the failure criteria you wrote in your requirements document.

| # | Finding | Evidence | Severity | Change | Owner | Retest? |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Wrong refund window sent without check | 3 of 5 sent task 3 unedited; none opened sources first | Critical | Move sources above Send; state the specific claim to verify in the confidence note | You | Yes |
| 2 | Reject path not found | 4 of 5 edited a bad draft manually rather than rejecting | Major | Place Reject beside Send with equal weight; label it plainly | You | Yes |
| 3 | Regenerate feels random | 2 of 5 clicked it twice with no adjustment, then gave up | Major | Attach adjustment options — shorter, more formal, focus on policy | You | Next round |
| 4 | Confidence wording unclear | 2 of 5 read "medium confidence" aloud and asked what it meant | Minor | Replace level with a specific reason sentence | You | No |
| 5 | Wants keyboard shortcuts | 1 of 5 asked | Enhancement | Log for later; not a design change now | — | No |

Three rules keep this table honest. **Every row needs evidence**, expressed as counts rather than adjectives. **Not every finding gets a change** — row 5 is a real request that is out of scope, and saying so explicitly is better than quietly dropping it. And **severity is not popularity**: row 1 was reported by nobody. Participants who sent the wrong reply were satisfied with the experience. The most serious finding in most AI usability sessions is the one nobody complains about, because it is the one they did not notice.

Then re-test the changes. A round that produces changes but never checks them has confirmed nothing; the fix for a comprehension problem frequently creates a new one. Fold the retest into your next iteration round and record it in the same log you have been keeping since prototyping.

## Feedback after the session ends

Sessions are a snapshot; a shipped feature needs a channel that keeps producing evidence. The correction-capture you designed in the previous lesson is the backbone of it — every rejection with a reason is a small usability finding arriving for free. Two additions make it usable: a lightweight in-context way to report a bad output at the moment it happens, and a regular habit of reading what comes in rather than only counting it. A tally of thumbs-down tells you a rate; the twenty most recent comments tell you what to change.

Close the loop out loud. Tell participants what changed because of them, and tell users when a reported problem is fixed. People contribute feedback in proportion to their belief that it matters, and that belief is built entirely from evidence that it has mattered before.

## Practice

Use the prototype you have been iterating, updated with the trust and accessibility changes from the previous lesson. The three sessions asked for below are a practice minimum, not the five to eight recommended above; treat findings from three participants as directional, and say so in your write-up.

1. **Write the session plan.** Name the three questions the session will answer. Name your participant group and say honestly how close it is to the real users.
2. **Write three tasks** in task form, not instruction form. At least one must involve an output that is subtly wrong. Prepare the actual seeded content — real examples, plus your planted error.
3. **Write your moderator script** using the template, including your own prompts and debrief questions.
4. **Run at least three sessions**, 30 minutes each, with a note-taker if you can get one. Moderate them the same way each time. Do not rescue anyone.
5. **Do the three-step analysis.** Produce the observation list, then the findings-to-changes table with evidence counts, severities, and decisions. At least one row must be a finding no participant reported.
6. **Make the two highest-severity changes** to the prototype, then re-test them with one new participant on the same tasks. Record in your iteration log whether the change worked, made no difference, or created a new problem.
7. **Write the loop-closing note** — under 150 words, to your participants: what you saw, what you changed because of them, and what you did not change and why.

## Check your understanding

1. Rewrite "Click the Reject button if the draft is wrong" as a task.
2. Why plant a subtly wrong output in the prototype instead of asking participants whether they would catch errors?
3. Three participants sent the planted error without checking. Is that one finding or three? How severe?
4. A participant asks, "Should I click that?" What do you say?

Answers: (1) Something like "This reply is wrong about our refund window. Do whatever you'd normally do." (2) What people do is evidence; what they say they would do is a prediction, and the two disagree. (3) One finding with three observations as evidence — likely critical, judged against your failure criteria, even though nobody complained. (4) "What would you do if I weren't here?"
