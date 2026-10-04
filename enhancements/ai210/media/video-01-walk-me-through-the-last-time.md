---
course_id: ai210
media_id: ai210-v01
type: video-script
title: "Walk Me Through the Last Time: A Discovery Conversation, Replayed"
format: hybrid
target_runtime: "8 min"
related_lessons:
  - ai210-02
  - ai210-03
objectives:
  - Run a discovery conversation that surfaces a client's real AI automation needs rather than their first stated request
competency_ids:
  - D4-S1-C01
---

## Purpose
After watching, the learner can recognize the moment in a discovery conversation when a stated request ("we want a chatbot for our support inbox") gives way to an underlying need, and can name the three techniques that got it there: an episode question, following one item, and not proposing.

## Audience and prerequisites
Prompt-engineer apprentices who have read the first half of ai210-02 ("The first request is a symptom, not a specification" through "A discovery question bank"). No design background assumed. Watch before the Practice role-play.

## Script
Two actors on a plain set (a table and two laptops), filmed with two cameras. **Dana** is the apprentice running discovery. **Priya** is the support operations lead at the client, the person who does the work. A narrator (**VO**) speaks over freeze-frames. Lower-thirds show the two-column notes (REQUEST | NEED) building up as the conversation goes on.

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Black. Text: *"We want an AI chatbot for our support inbox."* | VO: "This is how most AI projects start. One sentence, already a solution. Over the next eight minutes, watch it turn into something different, and watch what the person asking the questions does *not* do." |
| 0:15 | Wide shot. Dana and Priya sit down. Lower-third: **Brief (a), ai210-02 Practice**. | VO: "Dana is running discovery. Priya runs the support inbox day to day. The sponsor is not in this session. Dana asked for the practitioner first, because only the person handling the inbox knows what actually happens in it." |
| 0:30 | Dana, to camera-left. | Dana: "Thanks for making time. Today I'm only trying to understand how the inbox works now. I'm not scoping or quoting anything. At the end I'll send you a summary to correct." |
| 0:42 | Priya nods. | Priya: "Sure. Basically we get a lot of repetitive questions and we want a chatbot to answer them." |
| 0:48 | Freeze. Notes panel slides in. REQUEST column: *"chatbot to answer repetitive questions"*. NEED column: empty. | VO: "That's the stated request, so it goes in the left column, verbatim. The right column stays empty. Dana has heard a solution, not a need." |
| 1:00 | Unfreeze. Dana. | Dana: "Can you walk me through the last time one of those came in? Start to finish." |
| 1:05 | Freeze. Caption: **Episode question**. | VO: "The episode question, the most valuable one in the bank. People describe processes the way they should work, and episodes the way they did." |
| 1:15 | Priya, thinking. | Priya: "Okay. Yesterday, around eleven at night, a customer emailed asking whether they could still return a jacket. It arrived Wednesday morning. Marcus picked it up, checked the order system for the delivery date, checked our refund policy page, and replied." |
| 1:35 | Dana. | Dana: "How long did that one take?" |
| 1:38 | Priya. | Priya: "Maybe six minutes? The policy bit is the slow part. We have different windows for sale items, and nobody remembers which." |
| 1:46 | Freeze. NEED column gets a pencil-grey note: *"refund-window lookup is slow + error-prone?"* (marked with a question mark). | VO: "A first clue, written as a question, because it's still Dana's inference. Notice she didn't say 'we could have the AI look that up.' The idea goes in the margin, not into the conversation." |
| 2:00 | Dana. | Dana: "What happens if the reply gets the refund window wrong?" |
| 2:04 | Priya, a beat of hesitation. | Priya: "...We honour it. Whatever we tell them, we honour it. Finance hates that." |
| 2:10 | Freeze. Caption: **Cost of being wrong**. | VO: "That one sentence will shape more of the design than anything else in the session. A wrong answer here costs real money. It's the same finding that becomes a review requirement in ai210-03: 'any price-bearing output must be reviewed by a human before it reaches a customer.'" |
| 2:28 | Dana writes; does not speak for several seconds. Timer graphic counts 1…5 in the corner. | VO: "Now watch Dana wait. Five seconds of silence feels like a long time on camera. The second answer is usually the more honest one." |
| 2:38 | Priya fills the silence. | Priya: "Honestly, the volume isn't really the problem. Most of the questions are easy. It's the ones that land overnight. By morning there are sixty, and the customer's already annoyed." |
| 2:50 | Freeze. NEED column updates: *"Overnight backlog → slow first response; refund-window errors are costly."* | VO: "That's the need, in the client's words, backed by an episode. It isn't 'a chatbot'. It's 'customers wait all night, and we can't afford to get the refund window wrong when we catch up.'" |
| 3:05 | Dana. | Dana: "How many in a normal week? And at the peak?" |
| 3:08 | Priya. | Priya: "About four hundred. At month end, nine hundred, maybe more." |
| 3:12 | Lower-third: **Volume: 400/wk, 900 peak**. | VO: "These are the same figures as the requirements example in ai210-03. 'A few a week' and 'four hundred a day' are different products." |
| 3:20 | Dana. | Dana: "Has anyone tried to fix this before?" |
| 3:22 | Priya. | Priya: "We tried canned replies. People stopped using them because they never quite fit. You'd spend longer fixing the template than writing the reply." |
| 3:32 | Freeze. Caption: **Adoption evidence**. | VO: "That's worth gold. It's evidence about what this team will and won't adopt. Any solution that produces text people must fix before sending has already failed here once." |
| 3:45 | Dana. | Dana: "Who would have to approve a change to how replies go out?" |
| 3:48 | Priya. | Priya: "Sam. Sam signs off on anything customer-facing." |
| 3:52 | Lower-third: **Approver: Sam**. | VO: "One name, and the approval requirement writes itself." |
| 4:00 | Second take begins. Title card: **The same moment, done badly**. | VO: "Now the version most of us run the first time." |
| 4:05 | Dana (take 2), at 2:04's moment. | Priya: "...We honour it. Finance hates that." Dana (take 2, eager): "Oh, that's easy. We could have the AI pull the policy automatically and draft the reply. Would that work?" |
| 4:15 | Priya (take 2), brightening. | Priya: "That sounds great. Can it also do the order lookup? And maybe chat on the website?" |
| 4:22 | Freeze. Both NEED notes fade to grey and a red-outlined label appears: **Discovery ended here**. Icon: stop sign with the text "STOPPED". | VO: "The moment Dana proposed, Priya stopped describing her world and started shopping. The overnight backlog never came up. Neither did the failed canned replies, or Sam. Same client, same five minutes, half the evidence." |
| 4:45 | Back to take 1. Dana. | Dana: "Is there anything you'd want to make sure we *don't* touch?" |
| 4:49 | Priya. | Priya: "Don't make us use another tool. We live in the helpdesk all day." |
| 4:55 | Lower-third: **Constraint: stays inside the helpdesk**. | VO: "A constraint nobody would have written in a brief." |
| 5:02 | Dana. | Dana: "Last one. If this were solved, what's different in ninety days, and how would you know without asking me?" |
| 5:08 | Priya. | Priya: "Morning starts at zero, not sixty. And Finance stops sending me refund-exception reports. We already track first-response time, so that would drop." |
| 5:20 | Freeze. Notes panel full. NEED column final: *"Reduce overnight first-response time without increasing refund-term errors; must live inside the helpdesk; Sam approves customer-facing changes."* Baseline note: *"first-response time: tracked, get current value"*. | VO: "The need is now specific, evidenced, and measurable, and it still names no technology. Dana will write the requirements in ai210-03 from these notes, not from memory." |
| 5:40 | Split screen: REQUEST "chatbot" on the left; NEED summary on the right. | VO: "Compare the two columns. If they had said the same thing, Dana wouldn't have dug far enough. Here the honest product might not be a customer-facing chatbot at all. It might be drafts that operators check and send each morning. That's the draft-reply screen you'll prototype in ai210-04." |
| 6:05 | Dana writing the recap email. Text on screen, typed out. | VO: "Same day, Dana sends this." On screen: *"Hi Priya, thanks for today. Here's what I heard. About 400 support emails a week, up to 900 at month end. The pain is the overnight backlog: about 60 waiting each morning. Refund-window answers are the slow and risky part, because any window you quote is honoured. Canned replies were tried and dropped because they needed too much fixing. Anything new has to work inside the helpdesk, and Sam approves customer-facing changes. Open questions: current first-response time, and how many of the 60 are refund questions. Please correct anything I've got wrong."* |
| 6:50 | Close-up of the last sentence. | VO: "That last line does two jobs. It catches misunderstandings while they're cheap to fix, and it shows Priya you were listening." |
| 7:00 | Recap card, three bullets appear one at a time: **Ask about the last time. / Follow one item. / Don't propose — write it in the margin.** | VO: "Three techniques did most of the work. Ask about the last time, not the usual time. Follow one item from arrival to done. And when you have an idea, write it in the margin and keep asking. You'll still have it in an hour." |
| 7:25 | Final card: **Your turn: ai210-02 Practice, step 1.** | VO: "Now run your own. Pick a brief, have your partner hide three facts, and see how many you can surface without proposing a thing." |
| 7:40 | End. | — |

## On-screen assets and B-roll
- Two-column notes panel (REQUEST | NEED), built as a lower-third overlay that updates at each freeze. Inferences appear in grey with a "?" and become black once evidenced.
- Lower-thirds for each captured fact: volume, cost of being wrong, approver, constraint, baseline.
- Technique captions: "Episode question", "Cost of being wrong", "Adoption evidence".
- A 1–5 silence timer graphic for the 2:28 beat.
- A "STOPPED" label with a stop-sign icon for the bad-take freeze, with text and shape, not colour alone.
- Recap-email text, typed out at reading speed and held for at least 8 seconds.
- B-roll (optional): a helpdesk queue screen with 60 unread items, with customer names blurred or made up.

## Accessibility
- Open captions burned in for both actors and the VO. Speaker names in captions ("DANA:", "PRIYA:", "NARRATOR:").
- Every freeze-frame note is also read aloud by the VO. No information is shown only on screen except the full recap email, which is also provided as text in the lesson page below the video.
- The bad-take marker uses a label, an icon, and an outline as well as red, and stays understandable in greyscale.
- The silence timer is supported by the VO ("Now watch Dana wait"), so screen-reader users get the beat.
- Provide a downloadable transcript with the two-column notes as a table.
- Keep on-screen text at 24 px or larger at 1080p, with high contrast against the background (meeting WCAG AA contrast).

## Check for understanding
1. **At 2:04 Priya says "We honour it." Why did that matter more than the volume figures?**
   *Answer:* It is the cost of being wrong. It decides how much human review the solution needs and becomes a requirement (human review of price-bearing outputs). Volume changes how big the product is. Cost of error changes what kind of product it is.
2. **In the second take, what exactly went wrong, and what should Dana have done instead?**
   *Answer:* She proposed a solution mid-discovery. Priya switched from describing her work to evaluating the idea, so the backlog, the failed canned replies, and the approver were never found. Dana should have written the idea in the margin and asked another episode or consequence question.
3. **Give one piece of evidence from the session that a customer-facing chatbot might be the wrong product.**
   *Answer:* Any of these: canned replies failed because they needed fixing before sending; refund answers are costly when wrong and Sam must approve customer-facing changes; the team wants to stay inside the helpdesk. All point toward drafts that operators review rather than autonomous replies.
