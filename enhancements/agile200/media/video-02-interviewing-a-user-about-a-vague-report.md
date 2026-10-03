---
course_id: agile200
media_id: agile200-v02
type: video-script
title: "\"Signup Didn't Work\": Interviewing a User Until It's Reproducible"
format: hybrid
target_runtime: "7 min"
related_lessons:
  - agile200-08
objectives:
  - Work with users and stakeholders to diagnose reported problems
competency_ids:
  - D1-S1-C01
  - D2-S1-C02
  - D2-S1-C03
---

## Purpose
After watching, the learner can run the five-question structured interview from lesson 08, capture it with the intake template, reproduce the problem (or name it as a usability gap), and close the loop with the reporter.

## Audience and prerequisites
agile200 learners at lesson 08. Two presenters: a QA engineer ("Jordan") and a volunteer user ("Alex", a classmate outside the team). The accounts capstone's signup page is running on the test environment.

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Talking head (narrator). On-screen text: the message "signup didn't work lol" from Alex. | "This is what a real user report looks like. No steps, no error, no browser. It's still the most valuable report you'll get this week, because a real person hit it. Let's watch two ways to handle it." |
| 0:20 | Role-play A (the bad version). Jordan on a video call: "Did you fill in all the fields? Are you sure you typed your email right? It works for me." Alex: "I think so... never mind." | "Version one. Three closed, slightly defensive questions, and 'it works for me'. Alex is now embarrassed and will never report a problem again. We learned nothing." |
| 0:50 | Narrator, with the five interview steps from lesson 08 on screen. | "Version two follows the lesson's structured interview: goal, expectation, what actually happened, frequency, and then watch them do it." |
| 1:05 | Role-play B. Jordan: "Thanks for trying it. What were you trying to do when it went wrong?" Alex: "Make an account so I could save my list." | "Step one: the goal. Not 'what broke', but 'what were you trying to do'. That tells us which path to walk." |
| 1:25 | Jordan: "What did you expect to happen after you pressed the button?" Alex: "Go to my list, or at least see something saying it worked." | "Step two: the expectation, in their words. Hold onto that phrase, 'see something saying it worked'. It'll matter." |
| 1:45 | Jordan: "What happened instead, as exactly as you remember? Any message?" Alex: "The page just sat there. I pressed it again and then it said my email was already taken. But I'd never signed up!" | "Step three: what actually happened. Now we have a real clue: the second press said 'already taken'." |
| 2:10 | Jordan: "Did it happen once, or every time?" Alex: "Just once. I gave up after that." | "Step four: frequency. Once, and they gave up, so we can't assume it's random." |
| 2:25 | Jordan: "Would you mind sharing your screen and trying it again with a new email while I watch?" Shared screen: Alex types an email, presses Sign up. The button shows no change for about 3 seconds. Alex presses again. Message: "Email already registered". | "Step five: watch them do it. And there it is. The first press worked, but nothing on the screen said so for three seconds, so Alex pressed again. The second press hit our duplicate-email check, which is DEF-01's regression guard doing its job." |
| 3:05 | Intake template filled on screen: Reporter: Alex (end user); Doing: create account to save list; Expected: confirmation or redirect; Happened: no feedback for ~3 s, second press says "Email already registered", although the account was created; Frequency: once; My reproduction: reproduced on the test environment with network throttled to "Fast 4G" (DevTools), 3/3 attempts. | "Jordan captures it live with the intake template, then reproduces it alone: throttle the network a bit, press once, wait, press again. Three out of three." |
| 3:40 | Narrator, two cards: "Functional defect?" and "Usability gap?" | "So which is it? Signup works. The duplicate check works. Nothing is broken by the letter of the spec. But a reasonable person did exactly what the UI invited them to do, and ended up confused and convinced the product was broken. That's a usability gap, and lesson 08 says it isn't a lesser finding." |
| 4:10 | Diagnosis/recommendation note on screen: "Diagnosis: the signup button gives no feedback while the request is in flight (~3 s on a slower connection); users press again and see 'Email already registered' for an account that was just created. Recommendation: disable the button and show 'Creating your account…' while the request is pending; on success, redirect to the list with a 'Welcome' message. Add an E2E test that a double press creates one account and shows no error." | "Jordan writes the diagnosis and a concrete recommendation, not 'users are confused'. It says what confused them, why, and what to change, plus a test so it stays fixed." |
| 4:45 | Sprint board: a new ticket "Signup gives feedback while the request is pending" linked to the note, with priority set before Friday's demo. | "It goes on the board, linked to the note, prioritised before the demo, because a demo audience will press that button twice too." |
| 5:05 | Role-play: Jordan messages Alex: "Thanks, that helped a lot. Your account was actually created the first time; the page just didn't tell you. We're adding a 'Creating your account…' message this week. You can log in with that email now." | "And the step everyone forgets: close the loop. Plain language, what we found, what happens next, and what they can do right now." |
| 5:30 | Narrator with a stakeholder variant: the product owner asks "Is signup broken?" On screen: "Stakeholder: impact + timeline. User: heard + unblocked." | "If the product owner asks, the answer is different: impact and timeline. 'Signup works; slow connections can show a misleading error on double-press; fix is scheduled before the demo.' Same facts, different audience." |
| 6:00 | Recap slide: the five questions plus "Reproduce → classify → recommend → close the loop". | "Ask about the goal, the expectation, what happened, how often, and then watch. Then reproduce, decide whether it's a defect or a usability gap, recommend something concrete, and tell the reporter what happened." |
| 6:30 | End card: "Practice: lesson 08". | "Now find your real user. Do it this week, not in week three." |

## On-screen assets and B-roll
- Signup page on the test environment with a deliberately slow response (about 3 s) and no pending state.
- Intake template and diagnosis note graphics; sprint board mock.

## Accessibility
- Captions with speaker labels (Narrator, Jordan, Alex).
- The 3-second wait is announced aloud ("nothing changes on screen for three seconds") as well as shown.
- Throttling setting named in narration and on screen.

## Check for understanding
1. Why is "Did you fill in all the fields?" a weaker first question than "What were you trying to do?" *Answer: It is closed and implies user error; the goal question tells you which path to reproduce and keeps the reporter talking.*
2. Was this a functional defect or a usability gap, and why? *Answer: A usability gap: the system behaved as specified, but gave no feedback, which led a reasonable user to an action that produced a misleading error.*
3. What two things should the reporter hear when you close the loop? *Answer: What you found, and what happens next (plus anything they can do now).*
