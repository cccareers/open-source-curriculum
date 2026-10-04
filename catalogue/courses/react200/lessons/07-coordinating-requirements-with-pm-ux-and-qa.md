---
lesson_id: react200-07
course_id: react200
pathway: software-developer
title: Coordinating Requirements with PM, UX, and QA
order: 7
kind: lesson
competency_ids:
  - D3-S1-C04
objectives:
  - Relay requirements between a project manager, UX, and QA
---

## You are in the middle of the chain

An apprentice developer's day is not only typing. On the volunteer-drive work from the last lesson, information arrives from a project manager, is refined with a designer, becomes code, and then has to be handed to QA so someone can prove it works. You sit in the middle of that chain, and the accuracy of what passes through you is part of the job.

This is easy to underrate because nothing dramatic happens when you do it badly. There is no error message for "the designer thought the empty state came in this release." The failure shows up a week later as rework, a missed edge case in production, or a QA engineer testing a flow that no longer exists.

Here is the concrete version. The PM writes:

> Volunteers should be able to claim a shift on an event.

You build the claim button, optimistically. The designer never sees the failure state, so nothing was designed for it and you invent a red line of text. QA is told "shift claiming is ready to test" and tests the happy path, because nobody mentioned that a full event returns a 409. It ships. During the drive, three events fill up, and volunteers see a claim appear and then silently vanish with a red line they do not read. The code was correct. Every line of it did what it was written to do. The requirement was never relayed completely, and that is a defect you caused.

Your responsibility is not to decide what the product should do. It is to make sure that what was decided reaches the people who need it, accurately, in the form each of them can use — and to notice, out loud, when something has not been decided at all.

## Turning an ask into criteria

Requirements arrive informally. A ticket, a message, a sentence at standup. Your first move is always to convert the ask into **acceptance criteria**: statements that are unambiguously true or false about the running application.

The ask:

> Volunteers should be able to claim a shift on an event.

Criteria written from it:

```text
AC1  On an event detail page, a signed-in volunteer who holds no shift on that
     event sees a "Claim a shift" control.
AC2  Activating it shows the shift as claimed immediately, before the server responds.
AC3  If the server rejects the claim, the claim is removed and the volunteer is
     told why, in a message that persists until dismissed or navigated away from.
AC4  A volunteer who already holds a shift on the event sees "Release this shift"
     instead, and activating it removes the shift.
AC5  Claimed state survives a page refresh.
AC6  The control is reachable and operable by keyboard, and the change of state
     is announced to a screen reader.
AC7  A volunteer who is not signed in sees the control but is prompted to sign in
     when they activate it.
```

Notice what happened while writing those. AC3 forced the question "told why, how, and for how long?" AC7 did not exist in the ask at all — writing the criteria is what surfaced it. That is the point of the exercise. Criteria are not paperwork after the decision; they are the instrument that finds the decisions nobody made.

Three properties make a criterion useful:

**Observable.** "The claim feels instant" is not testable. "The claimed state renders before the network request resolves" is.

**Independent of implementation.** Say what the user can do, not that a thunk dispatches optimistically. The implementation is yours to choose and will change; the criterion should survive it.

**Single-outcome.** One criterion, one fact. If it needs an "and", it is probably two.

When you write criteria, send them back to the PM with a specific question — "AC7 is not in the ticket; is that in scope or a follow-up?" — rather than assuming. Two minutes of their time, and the ambiguity is resolved in writing where QA can also see it.

### Requirement, implementation, or preference

A large part of relaying accurately is knowing what kind of statement you are relaying. Three things arrive in the same tone of voice:

- **A requirement** — "an organizer must not see volunteers for events they do not own." Non-negotiable. If you cannot meet it, escalate; do not quietly ship a partial version.
- **An implementation detail** — "use a modal for the confirmation." Usually a preference dressed as a requirement, and usually negotiable. Ask what it is protecting: often the real requirement is "the volunteer should not claim a shift by accident," which a modal is one solution to.
- **A preference** — "I'd like the button on the right." Cheap to honor, no need to debate, but do not let it displace a requirement in your priority order.

The failure mode is treating all three as equally binding, which makes your estimate wrong, or treating all three as equally optional, which makes you ship something that violates a real constraint. When you cannot tell which one you are looking at, ask: "is that a hard requirement or a starting suggestion?" People answer that question honestly and are usually glad to be asked.

## Working with UX

Designers hand you the intended state. Applications spend a surprising amount of their life in the other ones, and if you do not ask, you will invent them yourself — badly, at 5pm, under pressure.

Every screen you build in this course has states a static design does not show:

- **Loading**, and specifically loading while the previous page is still visible — the router's `useNavigation` pending state. What should the old content look like while the new one arrives? Faded, replaced by a skeleton, or unchanged with a bar at the top?
- **Empty**, distinct from loading. "You have no shifts yet" needs words and usually a next action.
- **Error**, in at least two flavors: the request failed and can be retried, and the request is not permitted and cannot.
- **Optimistic-pending** — the state you invented in lesson 05, where a claim shows as taken but is not confirmed. This one genuinely does not exist in most designers' vocabulary, and you have to raise it.
- **Partial data** — a title of ninety characters, a venue name with no line break, a list with six hundred rows.
- **Small screens and keyboard operation** — where does focus go after the modal closes, and does the table scroll or reflow at 375 pixels wide?

Bring these as a short list, not as an open question. "Here are the six states this screen can be in; I have designs for two. Can we cover the other four?" is a five-minute conversation. "What should happen if it fails?" invites a shrug.

Two habits make design hand-off go well.

**Annotate a screenshot rather than describing in words.** Screenshot your running app, draw on it, and ask about the specific spot. Written descriptions of layout are ambiguous in both directions.

**Confirm what is a token and what is a one-off.** "This heading is 22 pixels" is either a new scale step for the whole product or a mistake in this one frame. Asking takes ten seconds and prevents a design system slowly accumulating fourteen font sizes.

And when the design cannot be built as drawn — the responsive behavior does not work, the interaction fights the router, the contrast fails — say so early with the reason and an alternative. "The volunteer table cannot reflow into cards below 480 pixels without losing the role column; here are two options" is a collaboration. Silently shipping something different is not, and the designer will find out at review.

## Working with QA

QA is testing something they did not build. Everything they need that you do not give them, they have to guess or ask for, and both cost more than writing it down once.

A hand-off note is short and has six parts. For increment 1 of the volunteer drive:

```text
WHAT CHANGED
  Volunteers can claim and release a shift from an event detail page.
  Ticket VOL-114. Behind the `volunteer-drive` flag, on staging.

HOW TO REACH IT
  https://staging.example.org/events/12  (enable the flag in Settings > Labs)
  Sign in as volunteer@example.org / see the shared credentials doc.

WHAT SHOULD NOW BE TRUE
  AC1–AC7 from the ticket. The two worth reading twice:
  - the claim appears before the server responds (AC2)
  - a rejected claim reverts and explains itself (AC3)

EDGE CASES I ALREADY TESTED
  - Event at capacity returns 409; claim reverts with "That shift is no longer
    available." Reproduce with event 12, which is seeded full.
  - Double-click on the claim button sends one request.
  - Refresh after claiming keeps the shift (AC5).
  - Keyboard only: tab to the control, space to activate, status announced.

EDGE CASES I HAVE NOT TESTED
  - Two browsers claiming the last spot at the same moment.
  - Slow network: I tested on Slow 3G but not with a request that never resolves.
  - Screen reader on iOS.

WHAT I DID NOT TOUCH
  Event creation, search and filtering, the venue picker, and the About page.
  If any of those changed behavior, that is a regression and I want to know.
```

Four of those sections are the ones apprentices leave out, and each is worth its two lines.

**"How to reach it"** with a real URL and real credentials removes an entire round trip. This is where routing pays off in an unglamorous way: because every state of your app has an address, you can hand QA a link to the exact screen rather than a paragraph of navigation instructions.

**"Edge cases I have not tested"** feels like an admission and is the opposite. It focuses expensive human attention on the gaps. Concealing it does not make the gaps go away, it just means nobody looks there.

**"What I did not touch"** gives QA a regression boundary, and it is the sentence that catches the accidental breakage — you modified a shared card component, and the home page uses it too.

**Seeded, reproducible test data.** "Event 12 is seeded full" turns an unreproducible edge case into a one-click check. If a case cannot be reached without effort, build the seed data and say so.

When QA files a bug, two habits matter. Reproduce it yourself before responding — half of "cannot reproduce" is an environment difference worth finding. And when it is genuinely not a bug but a requirement nobody wrote down, do not close it as invalid; take it back to the PM, because a disagreement between QA and the code is usually a gap in the requirement, not a mistake by QA.

## Keeping the three in sync

The three groups will not naturally hear the same thing, and you are frequently the only person in all three conversations. Four practices do most of the work.

**One artifact, not three.** Put the criteria in the ticket, the design links in the ticket, and the hand-off note in the ticket. A decision agreed in a direct message and recorded nowhere will be re-litigated. If a decision does happen in a call or a chat, write it into the ticket immediately and say you have done so.

**Say the change out loud in both directions.** When the designer changes the empty-state copy, tell QA. When QA finds that the 409 message is wrong, tell the PM if it changes what the user is promised. The information does not route itself, and "I assumed they knew" is the epitaph of most miscommunication.

**Never resolve an ambiguity silently.** You will be blocked, the person who can answer is unavailable, and you have to keep moving. The pattern that works is a written provisional decision:

> No word yet on whether an organizer sees volunteer email addresses. I am building the table with name and role only, since that is the smaller change and adding a column later is easy. If emails are required, say so before Thursday and it is half a day.

That is not asking permission, and it is not a silent assumption. It states the decision, the reasoning, the cost of the alternative, and a deadline. People respond to it because responding is cheap.

**Report status in terms of the criteria, not the code.** "AC1 through AC5 pass on staging; AC6 is blocked on the focus-order question with UX; AC7 needs the sign-in redirect and is a day away." That sentence is useful to all three audiences at once. "I'm about 80% done" is useful to nobody, including you.

### Traceability

When a feature is more than a couple of criteria, keep a small table mapping each requirement to where it is satisfied and how it is checked. It fits in the ticket, it takes ten minutes, and it is what lets anyone answer "is this covered?" without reading the diff.

| Requirement | Criterion | Implemented in | Verified by |
| --- | --- | --- | --- |
| Volunteers can claim a shift | AC1, AC2 | `ShiftClaimPanel`, `claimShift` thunk | QA case VOL-114-1 |
| Failures are explained and reverted | AC3 | `claimShift.rejected` handler | QA case VOL-114-4, seeded event 12 |
| Claims survive refresh | AC5 | `/my/shifts` loader hydration | QA case VOL-114-6 |
| Accessible operation | AC6 | `ShiftClaimPanel` live region | Manual keyboard and screen-reader pass |

The value shows up when the PM asks in week five whether anyone checked the failure path. The answer is a row, not an archaeology exercise.

### Running a three-way clarification

Sometimes a question genuinely needs the PM, the designer, and QA in the same conversation — usually because it involves a trade-off between what is promised, what is drawn, and what can be verified. Keep it to fifteen minutes and do three things: state the question in one sentence, state the options with their costs, and leave with a decision and an owner. Then write the decision into the ticket within the hour, while everyone still agrees on what was said.

The commonest mistake in these is arriving with a problem instead of options. "What should we do about full events?" spends twenty minutes discovering the problem. "Full events return a 409; we can grey out the control using capacity from the list endpoint, or let the claim fail and revert. The first needs an API field and is a day; the second is already built. Which?" gets a decision in three minutes.

## Practice

These exercises need other people. Use classmates, your cohort's instructor, or apprentices on another team, and assign the roles explicitly. Work against the volunteer-drive plan you wrote in the previous lesson and the code you have been building.

1. Take this ask verbatim: *"Organizers need to see who signed up for their events."* Write at least seven acceptance criteria from it. Each must be observable, implementation-independent, and single-outcome. At least two must cover something the sentence does not mention.
2. Mark each criterion as requirement, implementation detail, or preference, and write one sentence justifying each classification.
3. Have someone play the PM. Send them your criteria with two specific questions attached. Record their answers in the ticket, not in chat. Note in `NOTES.md` any criterion their answers changed.
4. For the volunteers table screen, write the state inventory: list every state it can be in, including loading, empty, both error flavors, partial or overlong data, and small-screen behavior. Mark which ones a static design would have covered.
5. Have someone play the designer. Bring them an annotated screenshot of your running app and the state inventory, and ask about the states with no design. Time the conversation and record how long it took.
6. Write a hand-off note for the organizer view using all six sections from this lesson. It must include a real URL to the exact screen, real test credentials or a note on where to get them, at least three edge cases you tested, at least two you did not, and an explicit list of what you did not touch.
7. Give the note to someone playing QA who has not seen your code. Have them test only from your note. Record every question they had to ask you — each one is a gap in the note. Revise it.
8. Have your QA tester file one bug against your app. Reproduce it yourself, then reply with one of three outcomes: confirmed and fixed, cannot reproduce with the environment differences you checked, or a requirement gap that needs the PM. Do not close anything as invalid.
9. Write a traceability table with one row per requirement, naming the component or thunk that implements it and the check that verifies it. At least one row must be verified by a manual accessibility pass.
10. Practice the provisional-decision pattern in writing: pick a genuinely open question from your implementation plan and write the four-part message — decision, reasoning, cost of the alternative, deadline. Send it and record the response time.
11. Write a status update for the organizer view in terms of criteria, naming what passes, what is blocked and on whom, and what remains. Keep it under sixty words.

**Deliverable:** a committed `docs/vol-114-handoff.md` containing your acceptance criteria with classifications, the state inventory, the six-section hand-off note as revised after your QA run, the traceability table, and a short `NOTES.md` section recording which questions your first draft failed to answer.

## Check your understanding

1. Rewrite "The claim feels instant" as an observable, implementation-independent, single-outcome criterion.
2. A PM says "use a modal for the confirmation." Is that a requirement, an implementation detail, or a preference, and what question do you ask to find the real requirement?
3. Name four screen states a static design usually does not show, and the one that is specific to optimistic updates.
4. Which section of a QA hand-off note gives QA a regression boundary, and why does it matter when you changed a shared component?
5. You are blocked on whether organizers see volunteer emails and the PM is out until Thursday. What are the four parts of the message you send?

**Answers:** (1) "The claimed state renders before the claim request completes." (2) Usually an implementation detail; ask what it is protecting (for example, "volunteers must not claim a shift by accident"). (3) Any four of loading, empty, retryable error, not-permitted error, partial or overlong data, small-screen and keyboard behavior; optimistic-pending is the one specific to optimistic updates. (4) "What I did not touch"; it tells QA where any behavior change is a regression, which is how breakage in other users of a shared component (such as `EventCard` on Home) gets caught. (5) The provisional decision, the reasoning, the cost of the alternative, and a deadline for objections.
