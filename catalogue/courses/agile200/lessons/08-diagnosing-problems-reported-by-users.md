---
lesson_id: agile200-08
course_id: agile200
pathway: quality-assurance-software-engineer
title: Diagnosing Problems Reported by Users and Stakeholders
order: 8
kind: lesson
competency_ids:
  - D1-S1-C01
  - D2-S1-C02
  - D2-S1-C03
objectives:
  - Work with users and stakeholders to diagnose reported problems
---

## Why this lesson needs a real person

Every defect you filed in Lesson 07 came from you or a teammate — someone who already understood the system, testing it deliberately. That is valuable, but it is not the same skill as this lesson. A real user does not know your data model, does not know what "expected behavior" was supposed to be, and will describe a problem in their own words, incompletely, sometimes inaccurately. Translating that into something you can actually reproduce and fix is a distinct skill, and it only develops against a real person using your real, currently-imperfect product. This is why this lesson exists at all in a QA capstone, and why an earlier, developer-facing version of this course would not need it: a developer ships to a QA team; a QA engineer is often the first and last line between the product and the person actually using it.

Arrange for at least one real person outside your immediate team — a classmate not working on your project, an instructor, a friend, a community member — to use your capstone application this week and report at least one problem, in their own words, with no coaching from you about what to look for.

## Starting from the org, not just the ticket

Before you can even receive a report well, D1-S1-C01 asks you to understand where you and the reporter sit relative to each other — the basic shape of who reports to whom, who the stakeholder is versus who the end user is, and how a professional handles that conversation. A stakeholder (someone with authority or interest over the project's outcome — an instructor, a client, a product owner) and an end user (someone just trying to use the thing) often want different things from the same conversation: a stakeholder wants to know impact and timeline; a user wants to be heard and to get unblocked. Know which one you're talking to and adjust your tone and questions accordingly, and always communicate professionally — calm, specific, non-defensive — even when the report is blunt or frustrated.

## Turning a vague report into a reproducible one

Real reports rarely arrive as clean steps-to-reproduce. They arrive as "it didn't work" or "the page looked wrong" or "I couldn't finish signing up." Your job is a structured interview, not an interrogation:

1. **Ask what they were trying to do**, not just what went wrong. The goal tells you which path to walk.
2. **Ask what they expected to happen**, in their own terms — this often reveals a usability problem (the product did what it was built to do, but not what a reasonable person expected) rather than a functional bug.
3. **Ask what actually happened**, as specifically as you can get — an exact error message, a screenshot if possible, what they clicked right before.
4. **Ask when and how often** — once, or every time? Right after they did something specific, or seemingly at random?
5. **Walk it with them if you can**, watching over their shoulder (in person or shared screen) rather than only working from their retelling. People routinely skip a step when describing what they did from memory, and that skipped step is often the one that matters.

A useful template for capturing the interview live:

```text
User Report Intake
- Reporter:            <name/role — user or stakeholder>
- What they were doing: <goal>
- What they expected:   <their words>
- What happened:        <their words, plus anything you observed directly>
- Frequency:            <once / sometimes / always>
- My reproduction attempt: <steps you tried, and the result>
```

## From report to diagnosis

Once you have enough detail, try to reproduce the problem yourself in your test environment, following the user's steps exactly. Three outcomes are all normal and each has a different next step:

- **You reproduce it exactly.** File it as a defect (Lesson 07's template), noting it came from a live user report — that provenance matters for priority, since it's confirmed to affect a real person, not just a hypothetical path.
- **You can't reproduce it, but the report is credible.** Note what's different between their environment and yours (different browser, different data, different account state) and try again matching those specifics before concluding anything.
- **It's not a bug — it's a usability or expectation gap.** The software does what it was built to do, but a reasonable user didn't expect that. This is not a lesser finding; it is exactly what D2-S1-C02 asks you to produce: concrete feedback and a recommendation, not just "users are confused." Say what confused them and what you'd change — a mislabeled button, an unclear error, a missing confirmation.

## Recommending a solution, not just reporting a problem

D2-S1-C03 is specifically about collaborating with the reporter to diagnose *and* recommend a solution — not handing a raw problem to a developer and walking away. Once you've diagnosed the issue, write a short recommendation alongside the defect or feedback:

```text
Diagnosis: Password reset email link expires after 5 minutes, but the
email doesn't say so — users who don't click it immediately see a
generic "invalid link" error with no explanation.

Recommendation: Either extend the expiry to a more realistic window
(e.g., 30 minutes) or state the expiry time explicitly in the email
copy and show a specific "this link expired, request a new one" error
instead of a generic failure.
```

This is also the moment to close the loop with the reporter: tell them, in plain language, what you found and what happens next. A user who reports a problem and never hears anything back stops reporting problems.

## Practice

Recruit one real person outside your team to use your capstone application and report at least one problem in their own words. Run the structured interview above, capturing it with the intake template. Attempt to reproduce the issue in your test environment and record the outcome — reproduced, not-yet-reproduced-with-notes, or usability gap. File the result appropriately: a defect record (Lesson 07) if it's a reproducible bug, or a written usability recommendation (using the diagnosis/recommendation format above) if it's not. Close the loop by telling the reporter what you found, in one or two plain sentences.
