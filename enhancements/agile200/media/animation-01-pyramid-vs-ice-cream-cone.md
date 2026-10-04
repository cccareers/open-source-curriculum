---
course_id: agile200
media_id: agile200-a01
type: animation-storyboard
title: "Pyramid vs Ice-Cream Cone: Why the Suite Stops Getting Run"
target_runtime: "75 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - agile200-05
  - agile200-06
objectives:
  - Write a test strategy that matches the project's risk and timeline
competency_ids:
  - D4-S1-C03
  - D4-S1-C04
---

## Concept and misconception it fixes
Learners assume end-to-end tests are "the most realistic, so the best", and plan a suite made mostly of them. The animation runs two suites for the same accounts capstone (signup, login, password reset) across the three sprint weeks: a pyramid (many unit, some integration, few E2E) and an inverted "ice-cream cone". It shows run time per merge, how often each suite actually gets run, and which one catches the DEF-01 duplicate-email regression on the day it is introduced. It also stands in for the lesson's missing `img/test-strategy-levels.png`.

## Visual language (shapes, colors with color-blind-safe palette, labels)
- Test levels as stacked bands with text labels and patterns: unit `#009E73` (bluish green, solid), integration `#56B4E9` (sky blue, diagonal hatch), E2E `#E69F00` (orange, dotted). Band width is proportional to test count, with the count printed inside.
- A stopwatch icon with a run-time readout beside each suite.
- A merge timeline along the bottom (week 1 to week 3) with commit dots; a ✓ or "skipped" label above each dot shows whether the suite ran.
- The DEF-01 regression commit is a dot with a ⚠ glyph and vermillion `#D55E00` outline.

## Scenes
| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 7s | Left: pyramid (60 unit, 12 integration, 4 E2E). Right: cone (5 unit, 8 integration, 40 E2E). | Bands stack up from the bottom on the left and from the top on the right. | "Same capstone, two strategies. Left: many fast unit tests, a few E2E. Right: mostly E2E." |
| 2 | 8s | Stopwatches. | Left counts to "about 40 s"; right counts to "about 12 min" (illustrative numbers, labelled as such). | "Every merge runs the suite. One finishes in under a minute. The other takes twelve." |
| 3 | 12s | Week 1 timeline. | Commit dots appear; both suites show ✓ on every dot. | "Week one, everyone is disciplined. Both suites run on every merge." |
| 4 | 12s | Week 2 timeline, faster commit rate. | Left keeps ✓. On the right, dots start showing "skipped (will run later)" as the stopwatch delay stacks up; a speech bubble: "just merge it, we'll run E2E tonight". | "Week two speeds up. The slow suite starts getting skipped." |
| 5 | 12s | The ⚠ "refactor: simplify signup" commit lands. | Left: the DEF-01 unit test band flashes, ✗ on that dot within seconds; the merge is blocked. Right: the dot shows "skipped"; the ⚠ travels on to the following dots unnoticed until a nightly run two days later lights up ✗. | "A refactor removes the duplicate-email check. The pyramid catches it on that merge. The cone catches it two days and eleven commits later." |
| 6 | 10s | Failure precision. | Left: the failing test name "DEF-01 regression: refuses a duplicate email address" points at one function. Right: three E2E failures point at the whole signup page with a "?" over which commit caused it. | "And when it fails, a unit test points at one function. Three red E2E tests point at a page and a pile of commits." |
| 7 | 8s | Risk table from lesson 05 slides in beside the pyramid; "User login: Unit + integration + E2E" highlights the 4 E2E tests. | The E2E band's four tests each link to one high-impact path. | "E2E still matters: a few, on your highest-impact paths, chosen from your risk table." |
| 8 | 6s | Summary card. | "Many fast tests run on every merge", "A few E2E on the paths that matter most", "A suite nobody runs protects nothing". | "Choose a shape your team will actually run." |

## Interaction variant (optional)
Sliders for the number of tests at each level and a per-test run time; a readout shows suite duration and a "probability the team skips it" bar based on a team-chosen tolerance (for example "we skip anything over 5 minutes"). Learners tune their own strategy and screenshot it into their lesson 05 document.

## Production notes
- All durations are illustrative; label them on screen as "example numbers".
- Reuse the DEF-01 wording and the "refactor: simplify signup" commit message from video agile200-v01 and project agile200-x01.
- Export scene 1 as a still for the missing lesson 05 image if the course owner wants it.
