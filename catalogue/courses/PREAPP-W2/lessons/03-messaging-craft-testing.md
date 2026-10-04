---
lesson_id: PREAPP-W2-03
course_id: PREAPP-W2
pathway: tech-pre-apprenticeship
title: Messaging Craft & Testing
order: 3
kind: lesson
competency_ids:
  - D1-S3-C01
  - D1-S3-C02
objectives:
  - A/B test message variants against real reply data and adapt tone and ask by audience
  - Adapt tone, length, and the size of the ask to the recipient and relationship stage
---

## Stop rewriting from feel

Every cohort hits the same wall in Week 2. Replies are thin, so someone rewrites their message. Replies stay thin, so they rewrite it again. By Thursday they have had four different messages in flight, no idea which one performed, and a strong opinion about all of them anyway.

That is not iteration, it is churn. Iteration means changing one thing on purpose, measuring what happened, and keeping the winner. This lesson gives you two tools for that: a structured way to test message variants against the replies you actually get, and a framework for adapting tone and ask so that "which message works" becomes "which message works *for this audience*."

You have the raw material now. Lesson 02 left you with a tiered list and a specific hook on every A-tier contact. This lesson turns that into sends.

## The four parts of a message worth testing

Before you can change one thing at a time, you need to know what the things are. Every outreach message you send this week has four moving parts:

1. **The subject or opening line.** The only thing they are guaranteed to read.
2. **The personalization.** Your hook, stated specifically enough that it could not have been sent to anyone else.
3. **The credibility line.** One sentence on who you are and why you are in their inbox — the program, what you are training in, what you have built.
4. **The ask.** What you want them to do next, sized to the relationship.

A message missing any of these underperforms in a predictable way. No hook reads as a template. No credibility line reads as a stranger with no context. No clear ask leaves a polite person with nothing to say back, and polite people with nothing to say back say nothing.

Here is a baseline that has all four, short enough for a LinkedIn message:

```text
Hi Dana — saw the apprentice-track analyst role your team posted last week.

I'm a pre-apprentice with Creating Coding Careers, two weeks into a tech
training program; last week I set up a CRM pipeline and ran outreach to 50+
contacts at regional employers.

Not asking about the role — I'd like 20 minutes to hear how your team actually
uses analysts day to day. Would Thursday or Friday afternoon work?
```

Four parts, roughly 65 words, one concrete ask with two options attached. Notice the credibility line claims only what is true *this week*. Do not borrow a project or a skill you have not done yet; your credibility line grows as the program does, and in Week 5 it can name the script you shipped. That is your control. Everything you test this week is measured against something like it.

## Running an A/B test you can actually read

An **A/B test** is simple in principle: two versions of a message, one deliberate difference between them, sent to comparable prospects, with replies tracked per version. The discipline is in the details.

**Change exactly one variable.** If variant B has a different opening line *and* a shorter ask, a difference in replies tells you nothing about either. Pick one: the opening, the length, the ask size, the presence of a credibility detail, the send time. One.

**Hold the audience comparable.** Do not send variant A to your A-tier and variant B to your C-tier. Split within the same tier. Alternate as you work down the list — A, B, A, B — so that the order you happen to work your list in does not become the experiment.

**Define the metric before you send.** Reply rate is the honest one at this stage: replies received divided by messages delivered. Count *any* human reply, including "not right now," as a reply. Connection acceptances are a weaker signal and a different metric — track them separately, do not blend them.

**Log per message, in the CRM, at send time.** Add a `variant` field with value A or B. If you tag variants after the fact from memory, you have not run a test, you have written a story.

Run one test per two-day block. Sending 15 A and 15 B over Monday and Tuesday, then reading the results Wednesday morning, is a realistic cadence for this lab.

## Reading small numbers honestly

Here is where most novice testing goes wrong, and where you are going to be held to a higher standard.

Suppose you send 15 A and 15 B. A gets 3 replies, B gets 1. A "wins" 20% to 6.7% — a 3x improvement! Post it on LinkedIn!

No. With numbers that small, two extra replies is well within what pure chance produces. Move one reply from A to B and the gap nearly closes. You have not measured a difference in your writing; you have measured which fifteen people happened to check their messages that week.

Real statistical significance at these reply rates needs hundreds of sends per variant. You will not have that this week, and possibly not this program. So the honest posture is:

- **Small samples give you a direction, not a verdict.** Fifteen versus fifteen can suggest something. It cannot prove it.
- **Look for large, repeated gaps.** A 3-to-1 difference once is noise. The same variant winning across three consecutive tests, in different accounts, on different days, is a pattern worth acting on.
- **Zero replies on both is still data** — about your list or your ask, not about your subject line.
- **Never report a result as more certain than it is.** "B outperformed A, 4 replies to 1, on 20 sends each — directional, running it again this week" is a professional sentence. "B is 4x better" is not, and a hiring manager who reads data for a living will notice.

Keep a running experiment log so patterns can accumulate. One row per test:

```text
Test 01 | Mon-Tue | Variable: opening line (role-hook vs post-hook)
         A: 20 sent, 3 replies (15.0%)   B: 20 sent, 5 replies (25.0%)
         Read: directional, favors post-hook. Small sample. Re-run Wed-Thu.
Test 02 | Wed-Thu | Variable: opening line (repeat of Test 01)
         A: 18 sent, 2 replies (11.1%)   B: 18 sent, 5 replies (27.8%)
         Read: same direction twice. Adopting post-hook as new control.
```

That log is the artifact. Two tests pointing the same way is how a novice earns the right to change their control message — not one lucky Tuesday.

## Adapting tone, length, and the size of the ask

The second half of message craft is that there is no single best message, because you are writing to different people at different stages of knowing you. Two dimensions govern the adaptation.

**Seniority.** The more senior the recipient, the shorter the message and the smaller the ask. A VP of Engineering has a triaged inbox and eleven minutes of slack in their day; three sentences and a specific twenty-minute request respects that. A senior developer two years into their job has more room and often more genuine interest in talking to a career-changer — you can be warmer, longer, more specific about the technical work. A recruiter sits in between and responds best to clarity about what you are and what stage you are at, because their job is routing.

**Relationship stage.** A first cold message earns one small ask. A second message after they accepted your connection but did not reply can reference the acceptance and repeat the ask once, differently. A message after a warm referral from a colleague opens with the referrer's name and can ask for more, because you arrived with borrowed trust. A follow-up after they already replied is a scheduling message, not a pitch — Lesson 04 covers those.

The variable that moves most across both dimensions is **ask size**. Roughly, in ascending order: react to a post; accept a connection; answer one specific question in the thread; take a 15-20 minute call; make an introduction; review your portfolio. Cold outreach to a senior stranger belongs at the small end. Asking a director you have never spoken to for a portfolio review and a referral is a message that gets no reply and teaches you nothing about your subject line.

Formality matters too, and it is regional and cultural as much as hierarchical. Match the register you can observe in how they write publicly. "Hi Dana" fits most of tech; "Dear Ms. Okafor" reads as odd on LinkedIn and correct in a formal email to a public-sector partner. Read the room before you write.

What must never change with audience: the specificity of your hook, the honesty of your credibility line, and the presence of a clear next step. Those three are craft, not tone.

## Practice

Run these against your live A-tier list from Lesson 02. Your sends this block are what produce the replies you will book in Lesson 04.

1. **Write the control.** Draft message variant A using all four parts, under 100 words, with a real hook from your CRM. Read it out loud; if a sentence would be strange to say in person, rewrite it.
2. **Build variant B.** Change exactly one variable and write it down in your log before sending: which part changed, and what you expect to happen. Everything else stays identical.
3. **Add the tracking field.** Create a `variant` field in your CRM and a `reply_received` field with a date. Backfill nothing; tag at send time only.
4. **Run Test 01.** Send 15-20 of each variant over a two-day block, alternating A/B as you work down the tier, all within the same tier. Log every send.
5. **Read the results in the lab.** Compute reply rate per variant. Write your read in one sentence, in the format `direction + numbers + "small sample" + next action`. Then defend it to a peer whose job is to argue you are over-reading the data.
6. **Re-run the same test.** Run Test 02 with the same variable on fresh contacts. Adopt a new control only if the direction repeats.
7. **Write the audience ladder.** Take your best-performing message and produce three versions of it: one for a senior manager or director, one for a peer-level practitioner, one for a recruiter. Vary tone, length, and ask size — and annotate what you changed in each and why.
8. **Write a warm-referral variant.** Draft the message you will send when one mapped contact refers you to a colleague. You will need it this week; multi-threaded accounts produce referrals.
