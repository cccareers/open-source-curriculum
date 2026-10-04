---
course_id: web100
media_id: web100-a01
type: animation-storyboard
title: "Why My 300px Card Is 334px Wide"
target_runtime: "60 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - web100-05
objectives:
  - Apply CSS selectors, the cascade, and the box model to control page layout
competency_ids:
  - D5-S1-C02
---

## Concept and misconception it fixes
Learners assume `width` is the size of the visible box. Under the default `content-box`, padding and border are added outside it. The animation builds a card layer by layer, measures it, then switches to `border-box` and shows the content shrinking while the outer size holds. This also stands in for the missing `img/box-model.png` referenced in lesson 05.

## Visual language (shapes, colors with color-blind-safe palette, labels)
- Okabe-Ito palette with patterns so color is never the only cue: content `#56B4E9` (sky blue, solid), padding `#009E73` (bluish green, diagonal hatch), border `#000000` (solid line), margin `#E69F00` (orange, dotted outline, transparent fill).
- Every layer has a text label and a pixel dimension callout with arrows.
- CSS panel on the left; the active declaration has a ▶ marker.

## Scenes
| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 5s | Empty canvas; CSS panel shows `.card { width: 300px; }`. | A 300px blue rectangle labelled "content 300" draws in with a ruler. | "You asked for a 300-pixel card." |
| 2 | 8s | ▶ on `padding: 16px;`. | Hatched green band grows outward 16px on each side; ruler extends; callouts "16" and "16". | "Padding grows outward: 16 on the left, 16 on the right." |
| 3 | 6s | ▶ on `border: 1px solid #ccc;`. | A 1px black outline appears outside the padding; callouts "1" and "1". | "The border sits outside the padding." |
| 4 | 8s | Total ruler. | Ruler counts up 300 → 332 → 334; the number "334" pulses. | "300 plus 32 plus 2. Your card is 334 pixels wide." |
| 5 | 7s | ▶ on `margin: 24px;`. | Dotted orange outline appears 24px outside; a neighbour card slides to keep its distance; the ruler does NOT change. | "Margin is space around the box, not part of it. The box is still 334." |
| 6 | 10s | CSS panel adds `* { box-sizing: border-box; }`. | The outer ruler locks at 300; the blue content shrinks from 300 to 266 while padding and border stay the same thickness. | "With border-box, 300 means the outside edge. The content shrinks to 266 to make room." |
| 7 | 8s | DevTools-style box model diagram fades in next to the card, numbers matching. | Each layer in the diagram highlights as its layer on the card highlights. | "This is exactly what the DevTools box model pane shows you." |
| 8 | 8s | Summary card. | Two formulas: "content-box: width + padding + border" and "border-box: width = everything inside the margin". | "When the size is wrong, check box-sizing first." |

## Interaction variant (optional)
An HTML page with sliders for width, padding, border, and margin plus a content-box/border-box toggle, showing the live rendered width and a mirrored box model diagram. Learners predict the width before releasing the slider.

## Production notes
- Export a still of scene 7 as `box-model.png` so the editor can fix lesson 05's broken image reference.
- Keep all dimension numbers at least 32px at 1080p.
- Sync the ruler count-up to the narration word "334".
