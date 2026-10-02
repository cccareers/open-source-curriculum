---
lesson_id: web102-05
course_id: web102
pathway: software-developer
title: Debugging and Fixing Reported Issues
order: 5
kind: lesson
competency_ids:
  - D4-S1-C02
  - D4-S1-C05
objectives:
  - Track a reported defect from report through fix to verification
  - Report a defect with enough detail for someone else to reproduce it
---

## A defect is a piece of tracked work, not an interruption

When you build something alone, a bug is a thing you noticed and fixed in the same ten minutes. On a team it is different, and the difference is the whole subject of this lesson. Somebody who is not you — a coordinator, a tester, a support agent, another developer — hit a problem on a machine you cannot see, wrote down what happened, and now that report is a unit of work with a life of its own. It gets recorded, assessed, assigned, worked, fixed, verified by somebody other than the person who fixed it, and closed.

That sequence is not bureaucracy. It exists because three failures are common and expensive: fixing something that was never actually broken, marking something fixed that is still broken for the reporter, and the same defect being reported four times because nobody could tell it was already known.

The states a defect moves through look roughly like this, whatever your team calls them.

![The states a reported defect moves through: reported, triaged, reproduced, in progress, fixed, verified, closed, with a path back from failed verification](./img/defect-lifecycle.png)

- **Reported.** Someone wrote it down. It exists.
- **Triaged.** Someone assessed how bad it is and who should look at it.
- **Reproduced.** Someone made it happen deliberately. Until this point, nobody actually knows what the defect is.
- **In progress.** Somebody owns it and is working.
- **Fixed.** A change exists that the developer believes resolves it.
- **Verified.** Somebody else confirmed it against the original report.
- **Closed.** Done, with the record intact.

The two arrows people forget are the ones that go backwards: from *reproduced* back to *reported* when it cannot be reproduced and needs more information, and from *verified* back to *in progress* when the fix does not hold. A defect that fails verification is normal. A defect closed without verification is a defect you will meet again, usually in front of a customer.

Your responsibility as an apprentice covers two things. The first is spotting problems and reporting them so that somebody senior can act without having to interview you. The second is taking a report you were assigned and driving it to verified closure. Both are graded in this course and both are mostly about communication, not cleverness.

## Reproducing it comes first

Before you change one character of code, make the problem happen on purpose. This is the step people skip because they think they already know what is wrong, and skipping it is the single largest source of wasted debugging time.

Reproducing gives you four things you cannot get any other way. It proves the defect is real. It gives you the exact conditions, which are almost never all of the conditions in the report. It gives you a test you can run after the fix to prove the fix worked. And it stops you fixing something that was never broken — a startling share of reports turn out to be a stale cached page, a browser extension, an old build, or a misunderstanding of what the feature does.

Work the report into a recipe you can run at will:

1. **Start from a clean state.** Fresh browser profile or a private window, cache disabled in the network panel, extensions off. A surprising number of "bugs" are one extension.
2. **Follow the reported steps literally**, including details that look irrelevant. If the report says the shift was claimed *twice*, do it twice.
3. **If it does not reproduce, change one variable at a time.** Different browser. Narrower window. Slower connection, using the network panel's throttling. Different stored data. The variable that makes it appear is a large part of the diagnosis and belongs in the report.
4. **Then narrow it.** Remove steps until removing another one makes the problem disappear. The shortest sequence that still fails is the reproduction you want.

Sometimes you genuinely cannot reproduce it. That is a legitimate outcome and it is *not* a licence to close the report. Move it back to the reporter with specifics: here is exactly what I tried, here is what I saw instead, here is what I need from you — the browser and version, a screenshot of the console, the time it happened, whether it happens every time or occasionally. "Cannot reproduce" with no detail attached reads as "I did not try", and it makes the reporter reluctant to report the next one, which is a real cost.

Pay particular attention to whether it is **always or sometimes**. An intermittent defect usually involves timing, ordering, or leftover state, and the reproduction is worth more effort because nobody else has managed it either.

## Writing a report somebody else can act on

Now the other direction: you found something. Whether you write it up well determines whether it gets fixed or sits in a list for three months.

A report that works has these parts, and each one exists because of a specific failure that happens without it.

**A title that identifies the defect, not the area.** "Shift board bug" is not a title. "Releasing a claimed shift leaves the claimed count unchanged until reload" is — a reader scanning a list of forty knows whether this is theirs, and knows whether the one they are about to file is a duplicate.

**Environment.** Browser and version, operating system, device and screen size if it might matter, the URL, and which version of the code — a commit hash, a branch, or a deploy timestamp. The most common cause of a fix that does not fix anything is the developer testing on a different version than the reporter used.

**Numbered steps to reproduce.** Starting from a defined state, in the second person, with the exact values used. Not "add some shifts" — "claim the shift titled 'Food bank sorting' with the name `Ana`". Somebody must be able to follow these without asking you a single question.

**Expected result.** One sentence saying what should have happened, and where that expectation comes from: the specification, the acceptance criteria, or how the rest of the page behaves. This is the part that separates a defect from a feature request, and getting it wrong costs a developer half a day arguing about a thing that was never promised.

**Actual result.** What happened instead, precisely. "Doesn't work" tells nobody anything. "The claimed count stays at 3. Reloading the page shows 2, which is correct."

**Evidence.** A screenshot with the problem visible, the console output copied as text rather than as a picture of text, the failing network request from the network panel, the relevant `localStorage` value. Attach what you have; a stack trace is worth more than three paragraphs of description.

**Frequency and scope.** Every time, or one time in five? All browsers or one? Every shift or only past ones? This is triage information and it is usually the reporter who is best placed to know.

**Impact.** What the person using the page cannot do because of this. Not your guess at how hard the fix is — what the effect on a real user is. That is what someone senior needs to prioritize.

Here is a report that meets the bar:

```text
Title: Releasing a claimed shift does not decrease the claimed count until reload

Environment: Chrome 141, macOS 15, 1440x900. Local static server,
main @ 4f2a1c9.

Steps:
1. Serve the project and open http://localhost:3000.
2. Claim "Food bank sorting" with the name Ana.
3. Claim "Van loading" with the name Ben. Counts show open 6, claimed 2.
4. Release "Food bank sorting".

Expected: The counts update to open 7, claimed 1, as they do after a claim.

Actual: The row returns to the open style correctly, but the counts stay at
open 6, claimed 2. Reloading shows open 7, claimed 1, so the stored state is
correct and only the displayed count is wrong.

Frequency: Every time, 5 of 5 attempts. Also reproduces in Firefox 143.

Impact: A coordinator reading the counts after releasing a shift sees the wrong
number of unfilled shifts, which is the number they use to decide whether to
call more volunteers.

Evidence: console clean, no errors. Screenshot attached showing counts after
step 4.
```

Notice what that report does for the developer before they have opened an editor. It tells them the stored state is right and the display is wrong, which eliminates the entire persistence layer. It gives them a commit hash. It tells them it is not browser-specific. Ten minutes of the reporter's care saves an hour of somebody else's guessing — and writing it that way is exactly what the framework means by reporting an issue clearly to a senior team member.

Two things to keep out of a report. Do not write a diagnosis as though it were an observation — "the render function doesn't update the count" is a hypothesis, and if it is wrong it sends the developer to the wrong file; put it in a clearly-labelled "possible cause" line at the end instead. And do not report a bundle of problems in one item. One defect per report, always, because they get fixed by different people at different times and closed independently.

## Severity, priority, and knowing when to escalate

**Severity** is how bad the effect is: data is lost, the page is unusable, a feature is degraded, something looks wrong. **Priority** is how soon it will be worked on. They are different, and they are decided by different people — you can usually assess severity from the report, while priority is a business decision made by someone with the whole picture.

Your job is to describe the impact accurately and let priority be set by whoever sets it. What you must not do is quietly promote your own defect because it annoys you, or quietly sit on one because you would rather finish what you are doing. Two situations always warrant telling somebody immediately rather than filing and moving on: anything where a user's data is being lost or corrupted, and anything that exposes information that should not be visible. Neither waits for a triage meeting.

The other judgment worth practicing is when to ask for help. A reasonable rule while you are an apprentice: if you have been stuck on the same defect for ninety minutes with no new information, ask. Bring what you have — the reproduction, what you ruled out, your current hypothesis and why you doubt it. That is a two-minute conversation and it is what senior people are there for. Silently burning a day is not diligence.

## Finding the cause

Now the actual debugging, which is a search, not an inspiration. You have a reproduction; you are looking for the smallest place where reality and your expectation diverge.

The method is old and it works: form a hypothesis specific enough to be wrong, design the cheapest observation that would disprove it, run it, and let the answer move you. What you are avoiding is the flailing loop of changing something plausible, reloading, and hoping — which occasionally works and teaches you nothing about why.

The browser's developer tools are how you make the observations. Open them with F12 or Command-Option-I. Six panels matter.

**Console.** Errors and your own logging. Read the *first* error, not the last — later ones are usually consequences. Click the file and line reference in the stack trace to jump to the code. And read the error text literally: `Cannot read properties of null (reading 'addEventListener')` means the thing before the dot was `null`, so your selector matched nothing, and the usual cause is a script that ran before the element existed.

`console.log` is fine and everybody uses it, but three of its relatives are better in specific cases:

```javascript
console.table(shifts);                 // array of objects as a readable grid
console.log({ shifts, filter, now });  // labels each value with its name
console.count("render");               // how many times did this run?
console.trace("who called render");    // the call stack that got here
```

`console.table` on your state array answers "is the data what I think it is" in one glance. `console.count` inside a render function catches the whole class of bugs where something runs twice, or zero times, and you assumed once.

**Sources**, for breakpoints. This is the tool that separates people who guess from people who look. Open your file in the Sources panel, click a line number to set a breakpoint, and reload or trigger the action. Execution stops there and you can inspect every variable in scope — hover a name to see its value, or use the Scope pane. Step over one line at a time, step into a function call, or resume.

A breakpoint beats `console.log` whenever you do not yet know which value is wrong, because you get all of them at once instead of guessing which to print, and you can look at the call stack to see how you got there. Two variants worth knowing: a **conditional breakpoint** (right-click the line number, add a condition like `shift.id === "s4"`) stops only on the case you care about instead of eight times; and an **event listener breakpoint** stops on any click without you needing to know which handler runs, which is how you find the handler when you cannot find it by reading.

**Elements**, for what the page actually contains. Inspect the row that looks wrong and read the real markup — the attributes, the classes, whether `disabled` is actually there. Half of "the style is not applying" is answered in the Styles pane, which shows you every rule that matched and strikes through the ones that lost. Half of "my click handler does not fire" is answered by noticing the element you inspected is not the one you thought.

**Network**, for requests. You will use this properly in the next project, but two settings are worth turning on now: **disable cache while devtools is open**, which eliminates the most common false bug report, and **throttling**, which lets you reproduce the problems that only appear when a response is slow.

**Application**, for stored state. The Local Storage view shows exactly what your page saved, as raw text. When persistence misbehaves, look here before you look at your code — you will immediately see whether you are storing the wrong shape, storing a stale value, or storing nothing at all. You can edit and delete entries here, which is how you test the corrupt-data path from R6 of the last project.

**Console's live expressions and the paused scope** let you experiment. With execution paused at a breakpoint, you can type an expression into the console and it evaluates in that scope. Testing a fix as an expression before you write it into a file is the fastest loop there is.

Three strategies for when the tools are not enough on their own.

**Bisect the code.** If a page of code produces a wrong result, put a breakpoint or a log halfway through and check whether the value is already wrong there. Whichever half contains the divergence, repeat. Four or five rounds narrows any file to a line.

**Bisect the history.** If it worked last week and does not now, the change that broke it is in the commits between. `git log --oneline` the range, check out a commit in the middle, and test. This is why the small, working-state commits from lesson 03 pay off — bisecting a history of eight-hour commits tells you almost nothing.

**Reduce the case.** Strip the reproduction down: fewer shifts, no CSS, one handler. When the defect survives to a twenty-line page, the cause is usually visible. When it disappears, whatever you just removed is involved.

And keep notes as you go. Not for anybody else — for you, twenty minutes from now, when you cannot remember whether you already ruled out the past-shift path. A running list of "tried X, saw Y" is the difference between converging and going in circles.

## Fixing it without making it worse

You found the cause. Three rules before you change anything.

**Fix the cause, not the symptom.** If the count is wrong because the count is computed from a stale copy of the state, recomputing it in one extra place makes this report go away and leaves the same defect waiting in three others. Ask what *else* is wrong for the same reason, and say so in the fix.

**Make the smallest change that fixes it.** A defect fix is not the moment to rename things, reformat the file, or restructure the module. A reviewer must be able to see the fix; a two-line fix inside a 300-line reformat is invisible, and if the fix is wrong nobody can revert it cleanly. If you find things that genuinely should be improved, file them separately.

**Know what you must not break.** Every fix touches code other things depend on. Before changing a shared function, find its callers — a search across the project for its name takes ten seconds — and check that your change is safe for all of them. When a piece of behavior must stay exactly as it is because something else relies on it, write that down: a comment on the function saying what depends on it, and a line in the fix description. Keeping notes about which behavior must remain unchanged is a real part of the job, and the reason is that the next person to touch this file has no way to know otherwise.

Then commit the fix on its own branch with a message that says what was wrong, not just what you changed:

```text
Recompute the shift counts after a release

The release handler mutated the state array and re-rendered the list, but the
count elements were updated only inside the claim handler, so releasing left
stale numbers on screen until a reload.

Counts are now derived inside render() from the state array, so any future
state change updates them without a new call site. Reported in issue 14.

Note: render() must stay the only writer of the count elements — the claim
handler no longer sets them.
```

That message is doing four jobs: it says what was wrong, what changed, why it is structured that way, and what a future editor must not undo. It also links the report, so that in a year `git log` and the issue tracker still agree.

## Verifying, and closing it properly

A fix is not done when it compiles. It is done when the original report has been walked, step by step, and the actual result now matches the expected result.

Verify against the report, not against your memory of the report. Open it, follow the numbered steps exactly, in the environment it named. Then do three more things:

- **Test the neighbours.** The claim path, the filters, and persistence all touch the same state. Run through them once. A fix that breaks something adjacent is a **regression**, and shipping one is worse than the original defect because it damages trust in the fix.
- **Test the boundaries.** Zero shifts, one shift, all shifts claimed, all past. Defects cluster at the edges, and the edge next to the one you fixed is often broken the same way.
- **Confirm it fails without your fix.** Stash or revert the change, reproduce the defect once more, restore the fix. This proves the fix is what resolved it rather than something unrelated you did while investigating. It takes a minute and it catches an embarrassing mistake.

Then hand it to somebody else. **The person who fixed a defect does not verify it** — that is the rule everywhere, and the reason is that you will unconsciously perform the steps the way you know works. Verification by the reporter, a tester, or another developer is what makes "closed" mean something.

Close it with a record that will still make sense in a year:

- What the cause actually was, in one or two sentences.
- The commit or pull request that fixed it.
- How it was verified, by whom, on what.
- Anything left over — a related problem you found and filed separately, a limit of the fix, behavior you deliberately did not change.

If verification fails, it goes back to in progress with the new observation attached. That is a normal event, not a failure of process. What is not acceptable is closing it because the sprint is ending.

Finally, when something was worth learning from, say so out loud. "The counts were updated in two places and one was missed" is a small observation that stops the next three defects. That is the whole point of tracking the work rather than just fixing it.

## Practice

Do this in a pair. Each of you needs the shift board from project 04, or another apprentice's copy of it.

**Part 1 — Break it deliberately.** Take your partner's project, create a branch, and introduce **three** defects, one from each category below. Make them realistic — a plausible mistake, not a deleted function. Commit each on its own so they can be restored later, and tell your partner nothing beyond "there are three".

- A defect that produces a visible error in the console.
- A defect that produces no error at all — a wrong value, a stale display, a condition that is inverted.
- A defect that only appears under a specific condition: a particular filter, an empty list, a past shift, a corrupted `localStorage` value, or a second click before the first finished.

**Part 2 — Report.** Swap. Find all three defects in the copy you were given and write a report for each in `ISSUES.md`, using every section from this lesson: title, environment, numbered steps with exact values, expected, actual, frequency and scope, impact, evidence. Number them so they can be referenced.

**Part 3 — Get reported to.** Read the three reports your partner wrote about your project. For each one, before doing anything else, follow the steps literally and confirm you can reproduce it. If you cannot, do not guess — write a specific request for more information under the report and have your partner answer it. Record the reproduction result on each report.

**Part 4 — Diagnose with the tools, not by reading.** For each of the three defects, find the cause using developer tools, and record in `ISSUES.md` which tool gave you the answer and what you observed. Across the three you must use at least: one breakpoint in the Sources panel with a note of a variable value you inspected at the pause, one conditional breakpoint or event listener breakpoint, and one inspection of the Application panel's local storage. Record your hypotheses too, including at least one that turned out to be wrong and how you disproved it.

**Part 5 — Fix.** One branch per defect, one commit each, each message following the shape in this lesson: what was wrong, what changed, why, and any behavior that must now remain unchanged. Keep each diff minimal.

**Part 6 — Verify and close.** Walk each original report's steps against your fix and record the actual result. Test the neighbouring behavior and the boundaries, and confirm each defect reappears when you temporarily revert the fix. Then hand all three back to your partner to verify against their own reports; they mark each verified or failed. Any failure goes back to you and around again. Close each report with the cause, the commit, the verifier's name, and anything left over.

**Deliverable:** an `ISSUES.md` containing three complete reports, each showing the full trail — reported, reproduced, diagnosed with the tool and observation named, fixed with a commit reference, verified by your partner, and closed with a cause statement — plus three fix branches merged into `main`, and one short paragraph naming the defect that took you longest and the specific observation that finally broke it open.
