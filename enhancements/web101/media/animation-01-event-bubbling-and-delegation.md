---
course_id: web101
media_id: web101-a01
type: animation-storyboard
title: "One Click, Three Phases: Bubbling and Delegation"
target_runtime: "80 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - web101-04
  - web101-07
objectives:
  - Handle user events while keeping interactive behaviour reachable from the keyboard
competency_ids:
  - D5-S1-C01
  - D5-S1-C02
---

## Concept and misconception it fixes
Learners believe a click "happens" only on the element clicked, so delegation looks like magic and they cannot explain why rows added later still work, or why an outer handler fires unexpectedly. The animation shows the event travelling down (capture), hitting the target, and bubbling up to the `ul` where a single delegated listener catches it. It also shows that pressing Enter on a focused `<button>` produces the same `click` journey, and that a `<div>` never receives focus at all. This also stands in for the missing `img/dom-event-flow.png` in lesson 04.

## Visual language (shapes, colors with color-blind-safe palette, labels)
- DOM tree drawn as labelled boxes: `document` → `body` → `ul#todo-list` → three `li` → each with a `button.delete-btn`.
- Event token: a circle with a "click" label. Capture phase: blue `#0072B2` dashed path with ↓ arrows. Bubble phase: orange `#E69F00` solid path with ↑ arrows. Target phase: the token pulses with a ★.
- Listener: an ear icon with the text "listener" attached to `ul`.
- Keyboard focus: a thick black outline plus a "focused" tag.

## Scenes
| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 6s | Tree drawn; ear icon on `ul#todo-list`. | Tree builds top-down. | "One listener on the list. No listeners on the buttons." |
| 2 | 10s | Cursor clicks the Delete button in row 2. | Token travels down `document` → `body` → `ul` → `li` → `button` along the blue dashed path. | "Capture: the event travels down from the document to the button." |
| 3 | 5s | Token on the button. | ★ pulse; label `event.target = button.delete-btn`. | "Target: it arrives at the button you clicked." |
| 4 | 10s | Bubble. | Token climbs the orange path to `li`, then `ul`; the ear icon lights up. | "Bubble: it climbs back up. When it reaches the list, the listener hears it." |
| 5 | 10s | Code card: `if (event.target.matches(".delete-btn")) event.target.closest("li").remove();` | `matches` check shows ✓; `closest("li")` draws an arrow from the button up to row 2's `li`; row 2 fades out. | "The listener asks: was the target a delete button? Then it finds the closest row and removes it." |
| 6 | 10s | A new row 4 is appended. | Row 4 slides in; click its Delete; same down-target-up journey; the ear icon catches it. | "A row added later works too, because the listener lives on the list, not on each button." |
| 7 | 10s | Keyboard: focus outline moves Tab, Tab onto a Delete button; "Enter" key cap appears. | Enter triggers the same token journey. | "Press Enter on a focused button and the browser fires the same click. Keyboard users get delegation for free." |
| 8 | 9s | A `div.toggle` added beside the list. | Tab presses skip over it; the focus outline never lands; a ✗ "not in tab order" label appears. | "A plain div never receives focus, so Enter can never reach it. That's the bug you report." |
| 9 | 10s | Summary. | Three bullets: "Down, target, up", "Listen on the stable parent", "Real buttons get keyboard clicks". | "Down, target, up. Listen on the parent. Use real buttons." |

## Interaction variant (optional)
A step-through HTML demo with "Next phase" buttons and a log panel that prints `capture: ul`, `target: button`, `bubble: li`, `bubble: ul`, letting learners toggle `stopPropagation()` on the `li` and watch the delegated listener stop firing.

## Production notes
- Export scene 4 as a still to replace lesson 04's missing `img/dom-event-flow.png`.
- Phase is shown by path style and arrow direction as well as color.
- Use the lesson's `#todo-list` and `.delete-btn` names exactly.
