---
course_id: sn290
media_id: sn290-a01
type: animation-storyboard
title: "The Column Size Cascade"
target_runtime: "70 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - sn290-04
  - sn290-02
objectives:
  - Lay out a portal that works on a phone and give it navigation a user can follow
  - Assemble a Service Portal from portal records, pages, containers, rows, and columns
competency_ids:
  - D6-S1-C03
  - D6-S1-C01
---

## Concept and misconception it fixes

An `sp_column` has four size fields (extra small, small, the unlabelled medium "Size", large), and an unset size inherits from the next smaller breakpoint. Misconceptions fixed: (1) "Size" is the default for all screens; (2) you must fill in all four fields; (3) columns that add up to more than 12 are an error rather than a wrap.

## Visual language (shapes, colors with color-blind-safe palette, labels)

- A device frame that smoothly resizes: 375 px phone, 768 px small tablet, 1024 px laptop, 1440 px desktop. Width shown as a numeric label at top.
- Twelve faint vertical grid slots behind the content.
- Three columns A, B, C as rectangles labelled with letters (not just colors): A in Okabe-Ito blue (#0072B2), B orange (#E69F00), C bluish green (#009E73), each also with a distinct fill pattern (solid, diagonal, dotted).
- A side panel shows each column's four fields as a small form: `xs`, `sm`, `Size (md)`, `lg`. Set values in bold black; inherited values in grey italics with a small upward arrow.

## Scenes

| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 6 s | Desktop frame at 1440 px. Columns A, B, C each 4 units wide side by side. Field panel: only `Size (md) = 4` set on each. | Fade in. | "Three cards. Someone set Size to 4. Looks great on a desktop." |
| 2 | 8 s | Frame shrinks to 375 px. Columns become three thin slivers; text inside wraps one word per line. | Smooth width shrink. | "Wait. Shrink to a phone... still four units each. Three unreadable slivers." |
| 3 | 8 s | Field panel zooms. Label under "Size": "this is medium, about 992 px and up". The xs and sm fields show grey "(unset)". | Zoom; label pops in. | "The unlabelled Size field is the medium breakpoint, the third of four. Below it, the grid falls back to full width only if you said so." |
| 4 | 10 s | Set `xs = 12` on all three columns (bold). Frame at 375 px: A, B, C stack vertically, full width. The `sm` field fills in grey italics "12" with an arrow up from xs. | Values type in; columns animate to stacked positions. | "Phone first. Set extra small to 12. Now small inherits 12, because the size cascades upward." |
| 5 | 10 s | Frame grows to 768 px: still stacked (sm inherited 12). Grows to 1024 px: snaps to three across (md = 4). Grows to 1440 px: still three across (lg inherited 4). | Continuous resize with snaps at breakpoint lines; a vertical marker flashes at 768 and 992. | "Grow the screen. Small: still stacked. Medium: three across. Large inherits medium. Two fields, four breakpoints handled." |
| 6 | 10 s | New row: content column xs 12 / md 8, sidebar xs 12 / md 4. At 375 px the sidebar lands under the content. | Columns rearrange. | "Main plus sidebar: on a phone the sidebar goes underneath. That is usually right." |
| 7 | 10 s | Set sidebar md to 8 by mistake: 8 + 8 = 16. At 1440 px, the sidebar drops to a new line. A counter "16 / 12" appears beside the row, then "wraps". | Sidebar slides down to a second line. | "Sizes in a row over 12 do not error. They wrap. Choose a wrap; do not discover one." |
| 8 | 8 s | Summary card: "Set xs first. Add a size only where the layout should change. Rows sum to 12 at every breakpoint you set." | Text builds. | "Set the smallest size first, then only the breakpoints where the layout should change." |

## Interaction variant (optional)

A scrubbable web interactive: a slider controls viewport width from 320 to 1600 px; learners can edit the four size fields for each column and watch the layout respond, with the inherited values shown in grey. A built-in challenge: "Make the three cards stack on phones, two-plus-one on tablets, three across on laptops" (answer: xs 12, sm 6, md 4; the third card wraps at small).

## Production notes

- Breakpoint values (768 / 992 / 1200) follow the Bootstrap 3 grid that lesson 4 documents; confirm against the target release before final render (see review.md).
- Keep the device frame centered and the field panel fixed on the right so motion stays in one region (reduces vestibular load); provide a reduced-motion version that cuts between states instead of tweening.
- Do not depend on column color; letters and patterns carry identity.
