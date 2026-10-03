---
course_id: web100
media_id: web100-v02
type: video-script
title: "Find the Breaking Width, Then Write It Down"
format: screencast
target_runtime: "7 min"
related_lessons:
  - web100-05
  - web100-06
objectives:
  - Build a responsive layout and check it against basic accessibility expectations
  - Inspect a rendered page and describe what is wrong with it in reproducible terms
competency_ids:
  - D2-S1-C02
  - D5-S1-C01
---

## Purpose
After watching, the learner can sweep a page across viewport widths, pin the exact width range of a layout bug, use the box model to explain it, and write a defect report a stranger could reproduce.

## Audience and prerequisites
web100 learners at lesson 06. Chrome DevTools (the device toolbar and box model pane are also present in Firefox under different names).

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Signup page at 1280px: heading, email field and button in a row, three cards. | "Here's the signup page from lesson 06. On a laptop it looks fine. Your job isn't to admire it; it's to find the width where it breaks." |
| 0:15 | Open DevTools, toggle the device toolbar (phone/tablet icon, or Ctrl+Shift+M / Cmd+Shift+M). Choose "Responsive". | "Open the device toolbar and pick Responsive, not a device preset. We want to drag." |
| 0:30 | Drag the width handle slowly from 1280 to 320. Width readout visible. Cards start overflowing around 990px, horizontal scrollbar appears. | "Drag slowly and watch everything at once. There: around 990 pixels a horizontal scrollbar appears. Presets would have jumped right over the moment it started." |
| 1:00 | Nudge with the width field: 1000, 995, 990, 985. Scrollbar appears at 985. | "Type widths to pin it down. Fine at 990, broken at 985. Now we have a number, not a feeling." |
| 1:20 | Select one `.card`. Box model pane: content 300, padding 16 each side, border 1 each side. Computed width 334. | "Why? Select a card and read the box model. Content 300, plus 16 padding on each side, plus a 1-pixel border on each side: 334 pixels. The design said 300." |
| 1:50 | Highlight `.card { width: 300px; }` and the absence of `box-sizing`. | "That's `content-box`, the default: width sets the content only. Three cards at 334 plus the page margin is more than 985 pixels, and nothing lets them wrap." |
| 2:15 | Add `* { box-sizing: border-box; }` and `flex-wrap: wrap` live in the Styles pane. Cards now 300 wide and wrap. | "In DevTools you can test a fix live: border-box, and allow wrapping. The overflow is gone. This isn't the deliverable, it's evidence for your report's likely cause." |
| 2:45 | Revert. Continue dragging to 375. Email field and button squeezed side by side; button overlaps the input's edge. | "Keep sweeping. At phone width the form stays in a row and the button squeezes into the email field." |
| 3:05 | Open the Elements `<head>`; no viewport meta tag. | "And one more thing to check before trusting any phone result: the head. There's no viewport meta tag. On a real phone, this page would be laid out at about 980 pixels and shrunk, and none of our media queries would fire at the phone's real width." |
| 3:30 | Font-size test: Settings > Appearance > Font size set to "Very large" (exact path may vary by Chrome version). Card text clips at the fixed 120px height. | "Text scaling. Bump the browser font size. The cards have a fixed height of 120 pixels, so the text is clipped. That's an accessibility failure you'll never see at default zoom." |
| 4:00 | Select a `p`; color swatch → contrast ratio about 1.9 with a failing marker. | "And contrast: click the paragraph's color swatch. The contrast ratio is about 1.9 to 1. Body text should be at least 4.5 to 1." |
| 4:20 | Editor with a defect report draft. Type it out. | "Now the part that makes this QA work: writing it down so nobody has to redo it." |
| 4:30 | Title: "Signup page: feature cards overflow horizontally below 990px viewport width" | "The title names the page, the element, the behavior, and the width." |
| 4:45 | Steps: "1. Open /signup in Chrome (version noted). 2. Open DevTools device toolbar, Responsive. 3. Set width to 985px." | "Steps a stranger can follow. Exact width, exact tool." |
| 5:00 | Expected: "Cards wrap or stack; no horizontal scrollbar." Actual: "Cards stay in one row; page scrolls horizontally by about 50px." | "Expected versus actual, both concrete." |
| 5:20 | Likely cause: "`.card` has width 300px with default content-box sizing (rendered 334px per box model) and `.card-row` has no flex-wrap." Attach: screenshot of the box model pane. | "Likely cause, with the measurement that supports it. You're not guessing; you're quoting DevTools." |
| 5:50 | Split screen: three more one-line titles for the viewport tag, form overlap, and contrast findings. | "Each separate problem gets its own report. One ticket, one bug, so each can be fixed and verified on its own." |
| 6:20 | Recap slide: "Sweep, don't jump" / "Pin the width" / "Measure with the box model" / "One bug per report". | "Sweep, pin the width, measure, and write one bug per report. Now try it on your own roster page." |

## On-screen assets and B-roll
- The starter `signup.html` and `styles.css` from project web100-x02 (same planted bugs).
- Close-ups of the device toolbar width field and the box model pane.

## Accessibility
- Every number read from DevTools is spoken aloud.
- The overflow is pointed out with an arrow and narration, not only a color highlight.
- Keyboard shortcut for the device toolbar is spoken and shown; captions throughout.
- The browser font-size settings path is marked on screen as "may vary by version".

## Check for understanding
1. Why drag the width instead of clicking device presets? *Answer: Bugs often appear between preset widths; dragging shows exactly where they start.*
2. A box declared `width: 250px; padding: 20px; border: 5px solid` renders 300px wide. Which `box-sizing` is in effect? *Answer: `content-box` (250 + 40 + 10).*
3. What three parts must every reproducible defect report have? *Answer: Steps to reproduce with a specific width or state, expected behavior, actual behavior (plus a specific title).*
