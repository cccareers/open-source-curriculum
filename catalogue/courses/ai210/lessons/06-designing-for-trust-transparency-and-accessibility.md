---
lesson_id: ai210-06
course_id: ai210
pathway: prompt-engineer
title: Designing for Trust, Transparency, and Accessibility
order: 6
kind: lesson
competency_ids:
  - D4-S1-C03
objectives:
  - Design AI-powered interfaces for trust, transparency, and accessibility,
    including disclosure and correction paths
---

## Trust is a quantity to calibrate, not maximize

It is tempting to treat trust as the goal: make the interface feel confident, make users comfortable, get adoption up. That is the wrong target, and pursuing it produces the exact failure the client will remember — a system people believed at the moment it was wrong.

The real target is **calibration**: a user's confidence in an output should track how reliable that output actually is. Both directions of miscalibration cost real money.

- **Over-trust** looks like adoption. Outputs are accepted without reading, source links are never opened, the review step becomes a rubber stamp. It ends the day an error reaches a customer, a regulator, or the press — and because nobody was checking, it will not be the first one.
- **Under-trust** looks like rejection. Users check every output against the original, which takes longer than doing the work themselves, so they quietly stop using the feature while continuing to report that it is fine.

Calibration is a design outcome. It comes from three things a user needs and often is not given: knowing an AI is involved at all, being able to see enough of why to judge this particular output, and having a fast route to disagree with it. Those three — disclosure, transparency, and correction — are the substance of this lesson. The fourth thread, accessibility, runs through all of them, because a disclosure nobody can perceive and an override path nobody can reach are not present in any meaningful sense.

## Disclosure: saying that an AI is involved

Disclosure is the baseline. It is increasingly a regulatory expectation, it is a professional obligation regardless, and it is the precondition for everything else — a user who does not know a machine wrote the text has no reason to apply the scepticism the output deserves.

Design disclosure along four questions.

**Who needs to know?** Usually two audiences, and teams routinely design for only the first. The **operator** works inside your interface. The **recipient** gets the output — the customer receiving the drafted email, the applicant whose document was read, the patient reading a summary. The recipient's disclosure is usually the one with the ethical weight and the one nobody has drafted.

**What are we disclosing?** Be specific about the role the system played, because the range is wide and users cannot guess. "Drafted by an assistant and reviewed by a person" is a different statement from "answered automatically" and from "sorted into a queue by an automated system." Say which one is true.

**Where does it appear?** At the point of use, attached to the output, not in a policy page. If the output travels — an email, a document, an exported report — the disclosure must travel with it, or it does not exist for the person who eventually reads it.

**How prominent?** Proportionate to consequence. A tone suggestion in a text box needs a light, persistent label. An automated decision affecting someone's money, housing, employment, or health needs a prominent statement, plus what to do about it. Let the cost-of-being-wrong answer from your discovery work set the level.

Two failure modes to avoid. The first is **disclosure inflation**: a badge on every element until the badges are wallpaper and nobody reads any of them. The second is **disclosure by dark pattern** — technically present, in grey four-point text under a fold, which is worse than nothing because it manufactures a defense while informing no one.

## Transparency: showing enough of the why

Transparency is not a full explanation of how a model works; no user wants that and few would benefit. It is giving the user what they need to judge *this output, right now*.

What is usually worth showing:

- **What it looked at.** The documents, records, or passages the output drew on, reachable in one action from the output itself. This is the highest-value transparency feature in most systems, because it converts "do I believe this?" into "let me check that line," which is a task a person can actually do.
- **What it did not look at.** Scope boundaries and freshness. "Covers policies up to March; does not include this quarter's updates" prevents a specific, common category of confident error.
- **Why this rather than something else.** For a recommendation or a classification, the two or three factors that drove it, in the user's vocabulary.
- **What it was unsure about.** Which part, not just how much — as covered in the interface patterns lesson, localized to the field or sentence.
- **What happens to the input.** Where it goes, whether it is retained, whether it trains anything, who inside the organization can see it. Say it where the input is entered, not only in a policy document.

Match the grain to the moment. Most users, most of the time, want one line. Some users, at the moment something looks wrong, want everything. Layer it: a short statement always visible, details one action away, full provenance available to whoever needs to audit a decision later. A design that only offers the deep version buries the useful line; a design that only offers the short version cannot survive a challenge.

And keep transparency honest. Do not present a plausible-sounding rationale that was not actually the basis for the output; a fabricated explanation is worse than none, because it produces exactly the confident, uncheckable trust you are trying to avoid.

## Correction paths: designing for being wrong

Every AI-powered system will be wrong. The interface's job is to make the wrongness cheap to discover, cheap to fix, and visible to the people who can improve it.

A complete correction design has five parts.

1. **Reject.** A single, obvious action meaning "this is not right." It should sit beside the accept action, not hidden in a menu, and it must not be more effortful than accepting. If rejecting costs three clicks and accepting costs one, your logs will show a high acceptance rate and it will mean nothing.
2. **Repair.** Edit in place, or regenerate with an adjustment, without losing anything the user already did. Most corrections are small, and a small correction should be a small act.
3. **Escape.** A route to do the task without the AI at all — the blank composer, the manual form, the human queue. Users need to know this exists before they need it; its presence is a large part of why they are willing to try the assisted path.
4. **Escalate.** For anything with consequence, a way to reach a person with the authority to overturn the outcome. For the recipient audience, this is the appeal path, and it needs a name, a channel, and a timeframe — not "contact us."
5. **Capture.** The correction is data. Log what was rejected, what was edited and to what, and the reason if the user offered one. Ask for a reason with a one-tap choice rather than a free-text box; you will get twenty times the response rate, and you can leave an optional comment field for the people who want it.

Two design principles hold the set together. **Never make the correction path the punishment path** — if disagreeing with the system means filling in a form, users will pass a bad output along instead. And **close the loop visibly**: when a correction leads to a change, tell the people who reported it. Nothing kills a feedback mechanism faster than the impression that it goes nowhere.

## Accessibility, at an awareness level

Accessibility here means evaluating your design against a recognized standard rather than against intuition. The Web Content Accessibility Guidelines (WCAG) are the usual reference, organized around four principles: content must be **perceivable**, **operable**, **understandable**, and **robust**. You are not being asked to run a formal audit — that is specialist work with its own tooling and expertise. You are being asked to know the principles, apply them while you design, and be able to say where your prototype stands against them.

AI interfaces raise a set of accessibility issues that conventional screens do not, mostly created by the same three properties from the previous lesson.

**Perceivable.**
- Confidence, status, and disclosure must never be carried by color alone. Words first; color and icon as reinforcement. This is also why the greyscale test in the previous lesson exists.
- Text contrast applies to the low-emphasis text these interfaces are full of — disclaimers, source citations, confidence notes. The content that matters most for calibration is the content most often styled at low contrast. The AA minimum is a contrast ratio of 4.5:1 for normal text and 3:1 for large text; any free contrast checker will measure it.
- If the system generates images, alternative text is part of the output design, not an afterthought.

**Operable.**
- Everything reachable by mouse must be reachable by keyboard, in a sensible order — including stop, regenerate, source expansion, reject, and escalate. Correction paths that are keyboard-inaccessible are the most consequential version of this failure.
- Manage focus deliberately when content appears asynchronously. Output arriving should not steal focus from a user who has moved on, and completion should be announced rather than silently rendered.
- Avoid time limits on review. A person using a screen reader or a switch device may need several times longer to review a draft; a session that expires or an item that auto-sends on a timer excludes them from the task.
- Streaming text is motion. Give a way to stop it, and do not animate it in ways that ignore a reduced-motion preference.

**Understandable.**
- Streaming and progressively updating regions need to be announced to assistive technology as they change, without announcing every character. The usual pattern is a polite live region that announces meaningful milestones — started, finished, failed — with the finished text readable as a whole. (WCAG itself files this requirement under robust — success criterion 4.1.3, Status Messages — so cite it there in your findings; it sits here because it decides whether the change is understood.)
- Plain language is an accessibility property, not a style preference. Error messages, refusals, and confidence statements should be readable by someone who is not a specialist and not a native speaker.
- Labels and instructions must be programmatically associated with their controls, so a screen-reader user gets "Drafted reply, edit text" rather than an unlabelled text box.

**Robust.**
- Use standard, semantic controls wherever possible; a custom control invented for an AI-specific pattern is a control assistive technology has never met.
- State changes — generating, complete, error — should be exposed as state, not implied by a visual change alone.

A workable review checklist for a low-fidelity prototype:

```text
ACCESSIBILITY REVIEW — <screen>            Standard: WCAG, AA target
  [ ] Every status, confidence, and disclosure signal readable in greyscale
  [ ] Low-emphasis text (sources, disclaimers, confidence) meets contrast
  [ ] Full flow operable by keyboard alone, including stop / reject / escalate
  [ ] Focus is not stolen when output arrives; completion is announced
  [ ] Streaming region announced politely, not character by character
  [ ] No time limit on reviewing or accepting an output
  [ ] Motion (streaming, spinners) respects a reduced-motion preference
  [ ] All inputs have persistent, programmatically associated labels
  [ ] Error, refusal, and empty states written in plain language
  [ ] Generated images carry meaningful alternative text
  [ ] Disclosure travels with the output when the output leaves the screen
  Findings: <numbered, with severity and the principle each violates>
```

One item deliberately goes beyond the AA target: respecting a reduced-motion preference corresponds to a Level AAA criterion (2.3.3, Animation from Interactions). It is on the list because streaming text is constant motion in exactly the place users must read closely, and it costs almost nothing to honor at design time.

Run it on the wireframe, before anything is built. Every item on that list is cheap to satisfy at the sketch stage and expensive to retrofit — which is the entire argument for treating accessibility as a design activity rather than a testing one.

## A combined trust review

Before a design leaves your hands, walk it once against these questions:

```text
TRUST AND TRANSPARENCY REVIEW — <screen / flow>
  Disclosure
    [ ] Does the operator know an AI produced this, at the point of use?
    [ ] Does the recipient know? Does the disclosure travel with the output?
    [ ] Is the stated role accurate — drafted, decided, sorted, summarized?
    [ ] Is prominence proportionate to the cost of being wrong?
  Transparency
    [ ] Can a user see what it looked at, in one action?
    [ ] Are scope and freshness limits stated where they matter?
    [ ] Is uncertainty localized rather than a single global score?
    [ ] Is it clear what happens to the data the user puts in?
  Correction
    [ ] Is rejecting no harder than accepting?
    [ ] Can the user repair in place without losing work?
    [ ] Is there a visible route to do the task without the AI?
    [ ] For consequential outcomes: is there a named human escalation path?
    [ ] Are rejections and edits captured, with a low-effort reason?
  Calibration
    [ ] Would a careful user become MORE accurate about when to trust this?
    [ ] What in this design would tell someone the output is worth checking?
```

The last question is the one to sit with. If nothing in your design would ever cause a reasonable user to slow down and check, you have designed for trust rather than for calibration, and the difference will show up in someone else's incident report.

## Practice

Use the screens and state table from the previous lesson.

1. **Write both disclosures.** One for the operator, at the point of use, and one for the recipient, that travels with the output. Each under 30 words, each naming the system's actual role. State how you set the prominence, referencing the cost of being wrong from your requirements document.
2. **Design the transparency layer.** Specify the one-line version always visible and the detail available one action away. Name the sources or factors shown and where they sit on the screen.
3. **Design all five correction parts** — reject, repair, escape, escalate, capture — for your main output. For capture, write the exact one-tap reason options a user will see, and justify why those and not others.
4. **Run the accessibility review checklist** against two of your wireframes. Record every finding with a severity and the principle it violates. Then fix the three worst and describe the change.
5. **Do the greyscale and keyboard walkthroughs.** Describe, step by step, how a user reaches and uses your reject and escalate paths with a keyboard alone. Then describe what your confidence signal communicates with all color removed. Any step you cannot describe is a finding.
6. **Run the trust review** with a partner playing a sceptical reviewer. Their job is to find one place where a user could reasonably over-trust the output and one where they could reasonably under-trust it. Write the design change you would make for each.

## Check your understanding

1. Your logs show 97% of drafts accepted unedited. Is that good news? What would you check?
2. An AI-drafted email goes to a customer. Where must its disclosure appear?
3. List the five parts of a complete correction design.
4. Your confidence signal is a green, amber, or red dot. Which accessibility principle does that fail, and how do you fix it?

Answers: (1) Not necessarily — it may be over-trust; check whether sources are opened, whether rejecting is as easy as accepting, and whether accepted drafts contain errors. (2) In the email itself, so it travels with the output — not only in the operator's interface or a policy page. (3) Reject, repair, escape, escalate, capture. (4) Perceivable — color alone carries meaning; lead with words (a reason), reinforced by an icon and color.
