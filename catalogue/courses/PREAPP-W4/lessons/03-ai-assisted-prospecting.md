---
lesson_id: PREAPP-W4-03
course_id: PREAPP-W4
pathway: tech-pre-apprenticeship
title: AI-Assisted Prospecting
order: 3
kind: lesson
competency_ids:
  - D3-S2-C01
  - D3-S2-C02
objectives:
  - Use AI to accelerate research and personalization while critiquing drafts for accuracy and authenticity
  - Catch fabricated details and generic filler in AI drafts before sending
---

## Where AI actually saves you time

Prospecting has two expensive parts: finding out enough about an account to say something worth reading, and then writing the thing. AI can compress both, but not equally, and not in the way most people try to use it.

The mistake is asking a model to "find me prospects" or "tell me about Northwind Logistics." A model asked to recall facts about a specific mid-size company will produce something — and a meaningful share of it will be invented, because generating a plausible sentence and knowing a true fact are not the same operation. You will get a headcount, a funding round, and a plausible-sounding initiative, none of which you can source.

The reliable pattern is the opposite. **You bring the facts; the model does the shaping.** Gather the raw material yourself — the careers page, the about page, a recent post, a press release, the person's profile summary — paste it in, and ask the model to compress, connect, and draft from that. Now every sentence it writes has a source sitting in the prompt, and you can check it.

That single reframe is the whole lesson. Research acceleration means faster reading and faster synthesis of material you supply, not free facts. Personalization means faster drafting from a real hook, not invented flattery.

## A research pass that stays checkable

Work one account at a time, and keep the source material in the prompt.

```text
ROLE: You are a sales development rep researching an account before a
first-touch email.

CONTEXT: Below is text I copied from Northwind Logistics' careers page,
their about page, and a LinkedIn post by their Director of Operations.
[paste the three sources here, labeled SOURCE 1, SOURCE 2, SOURCE 3]

TASK: Summarize what this company appears to be dealing with right now.

OUTPUT FORMAT:
- Exactly 5 bullets
- Each bullet ends with the source number it came from
- Add a final section titled NOT SUPPORTED listing anything you would
  normally assume about a company like this but cannot support from the
  sources above
```

Two things make this prompt work. Requiring a source number per bullet means an unsourceable claim has nowhere to hide — the model either cites or it does not write it. And the NOT SUPPORTED section makes the model's assumptions visible instead of letting them leak into the summary as facts. That section is often the most useful part of the output, because it tells you exactly what your next ten minutes of manual research should target.

Time this pass. Reading three pages and writing five defensible bullets by hand takes most people twelve to fifteen minutes; this pass takes two or three plus the copying. That delta is real, it is measurable, and you will want the number on Thursday.

## Personalizing from a real hook

A personalized message is not one that mentions the company name. It is one that could not have been sent to anyone else. The test is simple: if you swapped in a different company and prospect, would the message still make sense? If yes, it is not personalized, it is mail-merged.

So personalization starts with picking the hook, and picking the hook is your job, not the model's. From your five sourced bullets, choose the one that connects to something you can actually help with. Then hand the model the hook and the constraint:

```text
ROLE: SDR at a warehouse-software company selling to operations leaders.

CONTEXT: Prospect is Dana Ruiz, Director of Operations at Northwind
Logistics. Hook: their careers page lists four open dispatcher roles
(SOURCE 1), and Dana's post describes weekend scheduling coverage as
their current bottleneck (SOURCE 3). Our product reduces manual dispatch
scheduling time. No prior contact.

TASK: Draft a first-touch email opening on the hook.

OUTPUT FORMAT:
- Subject line under 50 characters
- Body under 90 words, plain prose, no bullets
- Closing question answerable in one sentence
- Then a CLAIMS section listing every factual assertion in the draft
- Then a SOURCES section mapping each claim to SOURCE 1, 2, or 3, or to
  UNSOURCED
```

Anything landing in UNSOURCED is your work queue. Verify it or cut it.

## The critique pass, which is not optional

Never send a draft you have only read once. Read it a second time hunting specifically for these four failures. Do this on paper or in a checklist, because a general "does this look okay" read catches almost nothing.

**Fabricated specifics.** Numbers, dates, names, customer references, product capabilities, growth figures. Models produce these fluently and confidently. Ask of each one: which source says this? A number with no source is a fabrication even if it happens to be correct, because you cannot defend it when the prospect replies asking where you got it.

**Overstated inference.** Subtler and more common. Your source says they have four dispatcher openings. The draft says they are "scaling rapidly" or "struggling to keep up." Neither is in the source. Inference dressed as fact is the most likely thing to embarrass you on a call, because the prospect knows the real reason they are hiring and you just told them a wrong one.

**Generic filler.** The sentences that could appear in any email ever sent: "I hope this finds you well," "in today's fast-paced logistics environment," "I wanted to reach out because I think there could be real synergy." Filler is not neutral — it costs you the reader's attention in the exact lines where you had it. Cut every sentence that survives a company swap.

**Voice mismatch.** Read the draft aloud. Models default to a polished register that does not sound like a person who works in your industry. If you would never say "I'd love to explore how we might partner," do not send it. Rewriting the draft in your own words is the last pass and it is always worth the ninety seconds.

Then apply the standing rule: **anything you cannot verify does not go in the message.** Not softened, not hedged. Out.

## The authenticity line

There is a difference between using AI to write faster and using AI to pretend to a familiarity you do not have. Claiming you read someone's article when you skimmed a model's summary of it is a lie that gets found out in the first reply, and a prospect who catches it is gone permanently.

Keep the line clean: AI helps you read faster, organize what you read, and draft in less time. What you claim to know, you know. What you send, you have read line by line and would defend word for word. That standard costs you nothing in speed and is the entire reason anyone will trust your pipeline.

## Practice

All of this runs against your own live accounts today.

1. **Sourced research pass on three real accounts.** For each, gather at least three sources yourself, run the sourced-summary prompt, and produce five bullets plus a NOT SUPPORTED section. Time the first one and record the minutes.
2. **Pick and defend a hook** for each account in one sentence: what the signal is, which source shows it, and why it connects to what you sell.
3. **Draft three personalized messages** using the hook prompt, each with its CLAIMS and SOURCES sections.
4. **Run the four-point critique** on every draft — fabricated specifics, overstated inference, generic filler, voice mismatch. Mark each hit directly on the draft and note the fix.
5. **Verify or cut** every UNSOURCED claim. Log what you verified and where you verified it.
6. **Apply the swap test.** Paste a different company and contact name into each finished message. Any message still making sense goes back for another personalization pass.
7. **Send them.** These are live accounts. Log which went out, and record your total time per finished message versus your pre-AI baseline — you need that number for the project.
