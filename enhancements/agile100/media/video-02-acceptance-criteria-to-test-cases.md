---
course_id: agile100
media_id: agile100-v02
type: video-script
title: "From Acceptance Criteria to Test Cases: The Wishlist Story"
format: screencast
target_runtime: "7 min"
related_lessons:
  - agile100-04
  - agile100-05
objectives:
  - Turn a user story's acceptance criteria into testable checks
competency_ids:
  - D1-S1-C02
  - D5-S1-C03
---

## Purpose

After watching, the learner can run a set of acceptance criteria through the observable/specific/bounded check, rewrite a weak criterion, and build a traceable test-case table (one row per checkable condition, plus marked QA-added edge cases) in a spreadsheet.

## Audience and prerequisites

QA apprentices who have read Lesson 04. Learners need any spreadsheet tool (Google Sheets, Excel, or LibreOffice Calc). The video uses the course's running wishlist story (STORY-101).

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Cold open: a sticky note on screen reading "The wishlist should work well." A red-pen strike animates through "work well". | "'The wishlist should work well.' That's an acceptance criterion someone actually tried to put into a sprint. In the next seven minutes, you'll turn criteria like this into tests you can actually pass or fail." |
| 0:15 | A plain document showing STORY-101: "As a returning customer / I want to save items to a wishlist / So that I can find them again without re-searching". | "Here's our story, STORY-101. As a returning customer, I want to save items to a wishlist, so that I can find them again without re-searching. Who, what, why. The 'so that' tells us what matters: the item has to actually be findable later." |
| 0:35 | The document scrolls to show three criteria as the PO first wrote them: "AC1: Clicking Add to Wishlist saves the item quickly." "AC2: Duplicates are handled." "AC3: Logged-out users are handled properly." | "This is the refinement draft. Three criteria. Before this story goes into a sprint, we run each one through three questions." |
| 0:50 | Three labelled boxes appear on the right: "1 Observable", "2 Specific", "3 Bounded", each with a short definition. | "Observable: can I watch for the outcome directly, on screen, in a response, in a log? Specific: does it name a value or a state, not an adjective? Bounded: does it cover one scenario, not 'everything'?" |
| 1:10 | AC1 highlighted. Box 2 gets an X icon and the word "quickly" is underlined. | "AC1: 'saves the item quickly.' Observable, sort of. Specific? No. Quickly isn't a number. I'd ask the PO in refinement: how fast is fast enough? They say two seconds." |
| 1:30 | AC1 rewritten live in Given/When/Then: "Given I am logged in and viewing a product page / When I click 'Add to Wishlist' / Then the item appears in my wishlist within 2 seconds / And the button changes to 'Saved'". | "Rewritten: Given I'm logged in and viewing a product page, when I click Add to Wishlist, then the item appears in my wishlist within two seconds, and the button changes to 'Saved'. Now there's a number and a visible state." |
| 1:55 | AC2 highlighted; box 1 and box 2 get X icons; "handled" underlined. Rewrite appears: "Given an item is already in my wishlist / When I click 'Add to Wishlist' again / Then no duplicate entry is created". | "AC2: 'duplicates are handled.' Handled how? That's not observable. The rewrite says exactly what we'll look for: no duplicate entry." |
| 2:15 | AC3 highlighted; X icons on boxes 1 and 2. Rewrite: "Given I am not logged in / When I click 'Add to Wishlist' / Then I am redirected to the login page / And returning after login adds the item automatically". | "AC3: 'handled properly.' Same problem. Rewritten: redirect to login, and after login, the item is added automatically. Notice that's two outcomes. I'll keep it as one criterion because they're one flow, but I'll check both parts separately in my test." |
| 2:40 | Talking-head inset (small, corner). | "That's the refinement half of the job, and it's input on requirements. You're not rewriting the PO's story behind their back. You're proposing rewrites in the meeting and getting agreement." |
| 2:55 | Switch to an empty spreadsheet. Presenter types header row: Test ID, Related AC, Steps, Expected result, Actual result, Pass/Fail. Bolds the row (Ctrl+B / Cmd+B shown on screen), freezes it (View > Freeze > 1 row in Google Sheets). | "Now the mechanical part. Open a spreadsheet. Six columns: Test ID, Related AC, Steps, Expected result, Actual result, Pass/Fail. Bold the header and freeze it so it stays visible as the list grows." |
| 3:20 | Types row TC-01: AC1 / "Log in, view product, click 'Add to Wishlist'" / "Item in wishlist within 2s; button reads 'Saved'". | "One row per checkable condition. TC-01 traces to AC1. Steps: log in, view a product, click Add to Wishlist. Expected: item in wishlist within two seconds, button reads Saved." |
| 3:40 | Types TC-02 (AC2) and TC-03 (AC3) exactly as Lesson 04's table. | "TC-02 for AC2: with the item already saved, click again, no duplicate. TC-03 for AC3: logged out, click, redirected to login, item added after login." |
| 4:00 | Talking-head inset. | "If you stopped here, every test would trace to a criterion. Good. But the criteria describe the happy path. What would a careful tester ask that nobody wrote down?" |
| 4:15 | Presenter types TC-04 with Related AC "Not in AC, added by QA (relates to AC2)", Steps "Double-click 'Add to Wishlist' quickly on an unsaved item", Expected "Exactly one wishlist entry; button reads 'Saved'". | "Double-click. Real users double-click buttons all the time, and it's the most common way duplicates sneak in. TC-04, marked 'Not in AC, added by QA'." |
| 4:40 | TC-05: "Not in AC, added by QA (relates to AC3)" / "While logged out, click Add to Wishlist, then abandon login and return to the product" / "Item is not added; no error shown". | "TC-05. What if a logged-out user gets sent to login and just... leaves? The item shouldn't appear later out of nowhere, and there shouldn't be an error." |
| 5:00 | TC-06: "Not in AC, added by QA (relates to AC1)" / "Throttle network in DevTools to a slow preset, then add an item" / "Item appears within 2s, or PO confirms the 2s limit applies only on normal connections". Presenter opens Chrome DevTools, Network tab, throttling dropdown, briefly shows preset list. | "TC-06. On a slow connection, does two seconds still hold? Honestly, I don't know whether the PO meant two seconds on any connection. So this row is partly a question. In DevTools, the Network tab has a throttling dropdown with slower presets. I run it, and I take the result back to the PO." |
| 5:30 | Presenter selects the three QA-added rows and applies a light fill plus the text tag already in column B. | "I mark these rows so the PO can see at a glance what I added. The text in the Related AC column is the real marker; the fill is just a convenience. If the PO says one isn't worth covering, I delete it. That's how you add rigor without silently growing the story." |
| 5:55 | Full table visible, six rows. Zoom on Related AC column. | "Look at the Related AC column. Every row points back to a criterion or says honestly that it doesn't. That's traceability. When something fails in week two, anyone can see which promise it broke." |
| 6:15 | Talking-head. | "And this spreadsheet isn't busywork. It's the scope section of your sprint test plan in Lesson 05, and the verified-or-not list you'll report in the sprint review in Lesson 08. You write it once and use it three times." |
| 6:35 | End card: the three questions and "One row per checkable condition. Mark what you added." Practice prompt: "Lesson 04: the warehouse clerk out-of-stock story." | "Three questions. One row per checkable condition. Mark what you added. Now try it on the warehouse clerk story in Lesson 04's practice." |

## On-screen assets and B-roll

- STORY-101 text and the three draft criteria (deliberately weak versions written for this video; the lesson shows only the rewritten versions).
- Three labelled question boxes with icons: eye (Observable), ruler (Specific), fence (Bounded).
- A spreadsheet in Google Sheets or Excel; the menu path shown for freezing a row must match the tool actually recorded (Google Sheets: View > Freeze > 1 row; Excel: View > Freeze Panes > Freeze Top Row). Verify against the current UI at recording time.
- Chrome DevTools Network panel throttling dropdown (preset names change between Chrome versions; show the dropdown without reading preset names aloud).

## Accessibility

- Captions plus a downloadable transcript; every on-screen rewrite is read aloud in full.
- Pass/fail and "weak criterion" markers use X and check icons and underlining, not red/green alone.
- QA-added rows are identified by the text in the Related AC column; the fill color is supplementary only.
- Spreadsheet zoomed to at least 150%; keyboard shortcuts displayed on screen when used.
- Provide the finished six-row table as a downloadable CSV so screen-reader users can explore it directly.

## Check for understanding

1. **Which of the three questions does "Errors are handled gracefully" fail, and what's a better version?**
   *Answer:* Observable (and specific). Better: "An invalid email submission shows 'Enter a valid email address' beneath the field, and the form does not submit."
2. **Why does each QA-added row say "Not in AC, added by QA" instead of just being added?**
   *Answer:* So the PO can confirm it's worth covering; unmarked additions silently expand the story's scope.
3. **TC-06 might end in a question to the PO rather than a pass/fail. Why is that a legitimate outcome?**
   *Answer:* The test exposed an ambiguity in the criterion (under what network conditions does 2 seconds apply?). Asking resolves it; guessing would mean testing against your own assumption.
