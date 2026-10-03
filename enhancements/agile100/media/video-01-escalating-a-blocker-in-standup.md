---
course_id: agile100
media_id: agile100-v01
type: video-script
title: "Escalating a Blocker in Standup: BUG-150 in Under a Minute"
format: hybrid
target_runtime: "6 min"
related_lessons:
  - agile100-06
  - agile100-07
objectives:
  - Collaborate daily with a team and escalate issues clearly
competency_ids:
  - D2-S1-C05
  - D1-S1-C04
  - D2-S1-C01
---

## Purpose

After watching, the learner can turn a raw testing discovery into a four-part standup escalation (impact, reproduction, scope/severity, specific ask) and then into a matching tracker record, instead of a vague "found some issues."

## Audience and prerequisites

QA apprentices who have read Lesson 06 (standups and escalation) and skimmed Lesson 07's defect template. No tools required to follow along. The video uses the course's running storefront example: STORY-108 (search index config fix) merged this morning, and guest checkout is now failing.

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Cold open. Talking head (the presenter, an experienced QA engineer) at a desk. Lower-third: "Escalating a blocker". | "You have ninety seconds in standup, and you just found the worst bug of the sprint. What you say in the first ten seconds decides whether it gets fixed this morning or this afternoon." |
| 0:15 | Cut to screen: a browser on the staging storefront. Presenter logged out (header shows "Sign in"). | "Here's what happened. It's Thursday, about 8:40. STORY-108, the search index fix, merged and deployed this morning. I'm running my regression pass on checkout, because checkout is the one flow we never want to break." |
| 0:30 | Screen: add "Canvas Tote Bag" to cart, click "Checkout", fill the test card number field with the staging test card, click "Place Order". | "I'm logged out, so I'm a guest. I add an item to the cart, go to checkout, enter the staging test card, and click Place Order." |
| 0:45 | Screen: a plain error page reading "500 Internal Server Error". The presenter opens DevTools Network tab; the POST request to `/api/orders` is highlighted with status 500. | "Five hundred. Internal Server Error. In DevTools, the Network tab shows the POST to /api/orders came back with status 500. I check the orders list in the admin view: no order was created." |
| 1:00 | Screen: presenter repeats the steps twice more; on-screen counter "Attempt 2: 500", "Attempt 3: 500". Then logs in as a test customer and checks out successfully: "Order #10482 confirmed". | "I try it twice more. Same result, every time. Then I log in as a test customer and do the same thing. That works. So it's guests only, and it's every guest." |
| 1:20 | Cut to talking head. | "Now, standup is in twenty minutes. Here's the version most of us say the first time." |
| 1:28 | Full-screen text card, labeled "Version A": "Yesterday I did some regression. Today more testing. Oh, and checkout seemed weird, I'll look into it." | "'Yesterday I did some regression. Today more testing. Oh, and checkout seemed weird, I'll look into it.' Every part of that is true. None of it is useful. The bug is at the end, it has no impact, no steps, no scope, and no ask. Someone might follow up after lunch." |
| 1:50 | Full-screen card: the four parts as a numbered list with icons: 1 "Impact" (warning triangle), 2 "Reproduction" (numbered list icon), 3 "Scope and severity" (people icon), 4 "Specific ask" (hand icon). | "Lesson 06 gives you four parts, in order. Impact first. Then reproduction. Then scope and severity. Then the specific thing you need." |
| 2:05 | Card "Version B" builds line by line, each line tagged with its part number. Text: "BLOCKING ISSUE, flagging first: Guest checkout is failing 100% of the time since this morning's deploy." | "Part one, impact, plainly, first. 'Blocking issue, flagging first: guest checkout is failing a hundred percent of the time since this morning's deploy.' Notice I didn't start with what I was doing. I started with what's broken for the business." |
| 2:25 | Line 2: "Steps: logged out, add any item, checkout, Place Order -> 500, no order created." | "Part two, reproduction. 'Logged out, add any item, checkout, Place Order, five hundred, no order created.' Anyone on the call could do that themselves in thirty seconds." |
| 2:40 | Line 3: "Scope: all guests, staging and prod, logged-in customers unaffected. Filed as BUG-150, Critical." | "Part three, scope and severity. 'All guests, staging and prod, logged-in customers are fine. Filed as BUG-150, Critical.' That last part matters: I filed it before standup, so the team has somewhere to put the details." |
| 3:00 | Line 4: "Ask: I need someone with deploy history to confirm which change introduced it. I can pair right after standup." | "Part four, the ask. 'I need someone with deploy history to confirm which change introduced it. I can pair right after standup.' A person, a task, and a time. Not 'someone should look at this.'" |
| 3:20 | Talking head. A timer graphic in the corner reads "0:24". | "Read aloud, that's about twenty-five seconds. It fits in standup, and it's the first thing the team hears." |
| 3:30 | Split screen: left, the Version B escalation; right, the BUG-150 record in a generic tracker with fields Title, Steps, Expected, Actual, Environment, Severity, Priority, Attachments, Linked story. Matching fields highlighted with the same icon as the escalation part. | "Here's the thing to notice. The escalation and the defect record are the same information. Impact becomes the title and severity. Reproduction becomes steps, expected, and actual. Scope becomes environment. The ask becomes the standup's job, not the ticket's. An escalation is just a defect report compressed for a live conversation." |
| 4:00 | Tracker zoom: Attachments field shows "server log: TypeError: Cannot read properties of undefined (reading 'id') at services/checkout.ts:88". Linked story: "STORY-108 (suspected, needs confirmation)". | "I also attached the log line and linked STORY-108, but I wrote 'suspected, needs confirmation.' I don't know yet that the search fix caused this. I'm saying what I know, and labelling what I don't." |
| 4:20 | Talking head. | "Two more rules. First: if something is actively blocking right now, don't wait for standup. Message the right person the moment you've confirmed it, and use standup to confirm status. In this case I confirmed it at 8:45, so I'd post in the team channel then, and repeat it at standup." |
| 4:40 | Card: "Not everything is a blocker." A small table: BUG-150 Critical "escalate"; BUG-151 "Out-of-stock badge delayed >1 min", Low, "routine update". | "Second: not everything gets this voice. BUG-151, the out-of-stock badge running a bit slow, goes in my routine 'yesterday' line and the tracker. If I escalate everything at this volume, the team stops listening when it really matters." |
| 5:00 | Card: "Written standup?" Example Slack-style post with the same four lines. | "Remote team with a written standup? Same four parts. Add a bit more detail, because nobody can ask you a follow-up question until they read it, maybe hours later." |
| 5:20 | Talking head. Recap card: Impact, Reproduction, Scope and severity, Specific ask. | "Impact. Reproduction. Scope and severity. Specific ask. Say it first, say it plainly, and file the record so the details live somewhere. That's how a bug found at 8:40 gets fixed before lunch." |
| 5:45 | End card: "Practice: Lesson 06, admin-delete scenario." | "Now try it yourself with the practice scenario in Lesson 06: the admin who can delete another admin with no confirmation and no audit log." |

## On-screen assets and B-roll

- Staging storefront (any demo shop, or the course's legacy app if the program supplies one) with a deliberately broken guest-checkout path that returns HTTP 500 on `POST /api/orders`.
- Chrome DevTools Network panel open on the failing request (status column visible).
- Text cards for Version A and Version B; four-part icon set (warning triangle, numbered list, people, raised hand).
- Generic tracker mock (avoid a specific vendor's UI so the video does not date): fields exactly as in the Lesson 07 template.
- Corner timer graphic for the read-aloud.

## Accessibility

- Open captions burned in plus a separate `.vtt` caption file; the presenter speaks every on-screen text card aloud, so no information is text-only.
- The four parts are distinguished by number, icon shape, and label, never by color alone.
- Describe the 500 page and DevTools status aloud ("came back with status 500"), so screen-reader users and low-vision viewers get the same evidence.
- Screen recordings at 125% zoom or higher; cursor highlight on; keystrokes shown on screen when a keyboard shortcut is used (for example, F12 or Cmd+Option+I to open DevTools).
- Provide a text transcript with the Version B escalation as copyable text.

## Check for understanding

1. **Your standup update begins: "Yesterday I finished test cases for STORY-101, then I started regression and checkout returned a 500 for guests."** What is wrong with the order, and how would you fix it?
   *Answer:* The blocker is buried after routine status. Lead with impact ("Blocking: guest checkout fails 100% since this morning's deploy"), then repro, scope/severity, and the ask; put routine status after.
2. **Which part of the four-part escalation maps to the defect record's Environment field?**
   *Answer:* Scope and severity (who is affected, which environments, since when). Severity maps to the Severity field; the environments and builds go in Environment.
3. **You find a Low-severity cosmetic bug 10 minutes before standup. Should you use the four-part escalation?**
   *Answer:* No. File it and mention it in your routine update. Reserve escalation language for issues that block work or a release, or the team stops trusting the signal.
