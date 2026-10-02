---
lesson_id: dm301-06
course_id: dm301
pathway: digital-marketer
title: Usability Testing and UX Analysis
order: 6
kind: lesson
competency_ids:
  - D6-S2-C01
objectives:
  - Run a usability test and report what it reveals
---

## The Question Analytics Cannot Answer

You finished lesson 05 with a number: mobile visitors who begin checkout complete it 17.1 percent of the time against desktop's 41.9 percent. You also finished it with an admission — you do not know why, and you wrote down that if the cause turned out to be a shipping-cost surprise rather than form layout, your recommendation was wrong.

GA4 will never tell you. It records that a session reached `begin_checkout` and did not reach `purchase`. It cannot record that the person squinted at a shipping line, said "eleven dollars, seriously," and closed the tab. **Analytics tells you where people stop. Usability testing tells you what stopping felt like.** You need both, and this lesson is about the second.

Usability testing means watching a small number of real people attempt real tasks on your product while they narrate their thinking. It is cheap, it is fast, it is uncomfortable the first three times you run one, and it consistently finds things that no amount of report-reading would have surfaced.

## Which Kind of Test to Run

Four decisions define a study, and each is a trade.

**Moderated or unmoderated.** In a moderated session a facilitator is present, live, and can ask a follow-up question at the moment confusion happens. That follow-up is where most of the value is. Unmoderated tools record participants completing tasks alone, which is cheaper and faster and gives up the ability to ask "what did you expect to happen there?" Run moderated when you do not yet know what the problem is. Run unmoderated when you have a specific, well-scoped question and want more participants.

**Remote or in person.** Remote is now the default and it is fine. In person is worth the trouble when the physical context matters — and for Kestrel it sometimes does, because a real customer might be checking a pack's dimensions while standing in a shop.

**Which device.** Test on the device where the problem lives. Kestrel is 70 percent mobile and the finding is on mobile, so this study is run on participants' **own phones**. A test of a mobile problem run in a desktop browser at a narrow window is not a test of that problem; it removes the thumb, the network, the notifications, and the on-screen keyboard, which are half the reasons mobile checkout is hard.

**Prototype or live site.** A live site gives you real behavior. A prototype lets you test something that does not exist yet. Never take a participant through a real payment on a live site; stop the task before payment details, or use a staging build with a test payment path.

## How Many Participants, Honestly

The well-known claim is that five participants find roughly 85 percent of usability problems, and it is a good working rule. It is also frequently over-claimed, so learn the version with the caveats attached.

The claim holds when the problems are ones a typical participant has a good chance of hitting, when your participants are drawn from a **single, reasonably homogeneous user group**, and when you **test iteratively** — five, fix, five again — rather than treating one round of five as the whole research programme. If Kestrel has two genuinely different audiences, say experienced hikers and first-time gift buyers, then it needs roughly five of each, because a problem that only affects beginners has a low detection probability among experts.

And here is the limit you must never cross. **Five participants cannot quantify anything.** "Three of five failed" is not 60 percent, it is three of five. The ordinary variation on a proportion measured over five observations is so large that the true rate could be almost anything. Any sentence of the form "our usability test shows the checkout has a 40 percent failure rate" is a fabrication, and somebody will act on it.

The honest formulation is: **usability testing tells you that a problem exists and what it is. Analytics tells you how often it happens.** Use the first to generate the explanation and the second to size it. That division of labour is the whole point of running both.

## Recruiting and Screening

Bad recruiting ruins a study before it starts, and the most common bad recruit is a colleague. People who know the product cannot un-know it.

Write a **screener** — three to six questions that establish whether someone is in your audience — and screen against behavior rather than demographics. For Kestrel's mobile checkout study:

1. Have you bought anything from a website using your phone in the last three months?
2. Have you bought outdoor or camping equipment online in the last year?
3. Do you work in marketing, web design, or software development? (An answer of yes is an exclusion.)
4. Which phone will you be using, and what is its approximate age?

Recruit five people who pass. Sources that work at small scale: existing customers who opted in to be contacted, a recruiting panel, a community group, or a public notice with an incentive. Pay people something real for an hour of their attention; unpaid participants skew toward the unusually helpful, and unusually helpful people push through friction that a normal customer would abandon at.

Three obligations, and they are not optional. **Informed consent** before recording anything, in plain language: what you are recording, who will see it, how long you keep it, and that they may stop at any moment. **No real payment details, ever** — you stop the task before payment. And **do not record what you do not need**; a screen recording of a phone can capture notifications, messages, and other people's names, so instruct participants to enable do-not-disturb and be prepared to delete a segment on request.

## Writing Tasks

A task is a **scenario with a goal and no instructions**. The most common beginner error is writing the answer into the task, which turns the session into a demonstration of your own interface.

| Weak task | Why it fails | Better task |
| --- | --- | --- |
| "Click Add to Cart, then click Checkout." | Tests reading, not the design | "You have decided on this jacket. Buy it." |
| "Use the size guide to check the laptop sleeve." | Names the feature, so it cannot be found | "You carry a 15-inch laptop. Work out whether this pack will take it." |
| "Do you like this page?" | Opinion, not behavior | "Show me how you would decide whether this is the right jacket for you." |
| "Find the returns policy in the footer." | Gives the location away | "You have decided the boots do not fit. What happens now?" |

Give each task a **realistic scenario** so the participant has motivation rather than compliance, and a **clear completion condition** so you can tell when it is over. Four to six tasks is right for a 45-minute session. Order them so an early task does not teach the answer to a later one.

Kestrel's study, four tasks, on the participant's own phone:

1. You are hiking for three days in October and need a waterproof jacket. Find one you would actually buy.
2. You already own a Ridgeline 28. Work out whether it will carry a 15-inch laptop.
3. Buy the jacket you chose. Stop when you reach the payment details screen.
4. The boots you ordered last month do not fit. Find out what happens next.

## Facilitating

The facilitator's job is to get out of the way, and it is much harder than it sounds. Five rules.

**Say the discipline out loud at the start.** "I did not design this and you cannot hurt my feelings. We are testing the site, not you. If something is confusing, that is the site's fault and it is exactly what I need to know."

**Ask for think-aloud, and reinstate it gently.** People go quiet when they concentrate, which is precisely when you need them talking. "What are you thinking right now?" is enough. Do not ask "what do you think of that?" — it invites an opinion instead of a narration.

**Never help.** The urge is overwhelming. Sit on your hands. If a participant is genuinely stuck, wait, then ask "what would you do next if I were not here?" Only end the task when they say they would give up — that moment of giving up *is* the finding, and helping destroys it.

**Never explain your design.** The instant you say "actually the size chart is under that tab," the session is over as research.

**Ask afterwards, not during.** Save "what did you expect to happen when you tapped that?" for the moment after the task finishes, or you will change the behavior you are measuring.

Two people run a session well: a facilitator who talks, and a note-taker who does not. If you are alone, record, and take only timestamps live.

## Recording What You See

Capture observations, not conclusions. "P3 tapped the size chart image four times, then pinched, then said 'I can't read this'" is an observation. "The size chart is bad" is a conclusion, and writing it down early stops you noticing that P3's actual problem was zoom rather than content.

Rate every issue for severity, because a list of twenty undifferentiated problems does not help anybody prioritize.

```txt
  4  BLOCKER   Prevents task completion. Fix before anything else.
  3  MAJOR     Task completed, with significant difficulty or a wrong turn.
  2  MINOR     Noticed, briefly annoying, recovered quickly.
  1  COSMETIC  Aesthetic or wording; no measurable behavioral effect.
```

Rate on the **worst observed** effect, not the average, and record how many of the five participants hit it.

## What Kestrel's Study Found

Five participants, own phones, remote moderated, 45 minutes each.

| # | Issue | Task | Hit by | Sev |
| --- | --- | --- | --- | --- |
| F1 | Shipping cost first appears on the third checkout screen. Two participants stopped there; one said "I'd have to think about it" and did not resume | 3 | 4 of 5 | 4 |
| F2 | Guest checkout link sits below the account form and is not visible without scrolling. Three participants believed an account was required | 3 | 3 of 5 | 4 |
| F3 | The size chart opens as a full-width image that will not pinch-zoom; text is unreadable on a phone | 2 | 4 of 5 | 3 |
| F4 | An empty promo-code field prompts a search for a code. Two participants left the checkout to look; one did not return | 3 | 2 of 5 | 3 |
| F5 | The Continue button sits below the fold under a long address form | 3 | 2 of 5 | 2 |
| F6 | Returns information is reachable only from the footer | 4 | 3 of 5 | 2 |
| F7 | Jacket listings do not state whether a hood is detachable, which two participants treated as decisive | 1 | 2 of 5 | 2 |

Now read this against lesson 05, and read it honestly.

Your recommendation there was to prioritize mobile checkout, and you wrote down in advance that **if participants abandoned at the shipping-cost reveal rather than in the form, the interface-layout framing was wrong.** F1 is exactly that. The single most severe finding is not layout at all; it is that the price is not the price until the third screen.

That is what pre-registering a falsification condition buys you. The recommendation was not wrong to point at checkout — it was wrong about the mechanism, and it took five participants and four hours to discover it. Without the pre-registered condition you would very likely have shipped a form redesign, measured no change, and had no idea why.

Two more things this study does that a report alone could not. F2 supplies a specific, cheap, testable change. And F3 explains a number you already had: `size_guide_open` events fire frequently on mobile and are followed by an exit, which looked like disinterest and is actually an unreadable image.

## From Findings to Recommendations

For each finding worth acting on, write four lines: the observation, the interpretation, the recommendation, and the confidence.

```txt
  F1  OBSERVATION      4 of 5 first saw shipping cost on checkout screen 3.
                       2 stopped there. Both said the total was higher than
                       they expected, not that it was too high in itself.
      INTERPRETATION   The problem is surprise, not price. The expectation
                       was set by the product page and broken at checkout.
      RECOMMENDATION   Show delivery cost, or the free-delivery threshold,
                       on the product page and in the cart, before checkout.
      CONFIDENCE       High that the issue is real: 4 of 5, unprompted,
                       consistent language. Unknown how often it happens
                       across all traffic - that is a GA4 question, and the
                       answer is the 1,690 mobile checkouts per period.
```

Note the confidence line. It states what the study can support and hands the sizing question back to the tool that can answer it. Get in the habit; it is the single clearest signal that you understand your own evidence.

## The Report

Six sections, three pages at most, and the findings table carries the weight.

1. **What we tested and why** — the question, in one sentence.
2. **Method** — participants, screening criteria, device, moderated or not, tasks, date. Short.
3. **Findings** — the severity table.
4. **The top three, expanded** — observation, interpretation, recommendation, confidence.
5. **What this study cannot tell you** — the frequency of each issue, whether fixing it will lift conversion, and anything about audiences you did not recruit.
6. **What we recommend next** — ordered, with effort estimates.

Section 5 is not modesty; it is the section that stops a five-person study being quoted as a statistic in a board deck six months from now. Write it before you write section 4, while you are still honest.

One presentational trick that works better than any chart: a **60-second clip** of a participant getting stuck, played at the start of the meeting. Nobody argues with a recording of a real customer failing.

## Practice

Run a complete study. You need five participants, one site, and about six hours. Do not test a site you built yourself if you can avoid it, and never take a participant through a real payment.

**Part 1 — Write the question.** One sentence, tied to a number you have actually seen in analytics, plus a sentence saying what finding would prove your current explanation wrong.

**Part 2 — Write the screener.** Three to six behavioral questions with explicit exclusions. State which audience you are recruiting and, if the site has more than one, which you are deliberately not covering in this round.

**Part 3 — Write four to six tasks.** Scenario form, no feature names, clear completion conditions. Then rewrite each one badly on purpose and label what makes the bad version leading. Order them and justify the order in one sentence.

**Part 4 — Prepare the session.** A consent script covering recording, storage, and the right to stop; an introduction script including the "you cannot hurt my feelings" line; and a note-taking sheet with columns for participant, task, timestamp, observation, and severity.

**Part 5 — Run five sessions.** Record with consent. Afterwards, write down two moments where you wanted to help and did not, and one where you did and what it cost you.

**Part 6 — Analyze.** Build the findings table: issue, task, participants affected, severity. Keep observations and interpretations in separate columns and check that nothing in the observation column is a conclusion.

**Part 7 — Expand the top three** in the four-line format, including a confidence line that names what the study cannot support and which analytics number would size it.

**Part 8 — Write the report.** Six sections, three pages maximum, section 5 written before section 4. Then find the sixty-second clip you would open the meeting with and say in one sentence why that clip.

**Part 9 — Close the loop.** For your most severe finding, name the GA4 metric that would tell you how often it happens across all traffic, and state the number you would expect to see if the finding is as common as the study suggests.
