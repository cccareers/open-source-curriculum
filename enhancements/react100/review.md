---
course_id: react100
title: "Beginner React JS — Enhancement Review"
reviewed_lessons: 11
status: draft
---

## Summary

react100 is a strong beginner course built around one running project, the **Toolshare** neighborhood tool library, which carries from the static component skeleton (lesson 02) to the demo (lesson 11). The writing is direct and the practice is realistic. The biggest problems were a handful of code bugs a learner would copy and hit: a date check that rejects today, a focus call on an element that doesn't exist yet, a "newest first" sort that sorts oldest first, and a component (`ToolGrid`) that's referenced but never shown. All of these are fixed in place. The course also had no self-checks and no automated tests learners could run. This pass adds "Check your understanding" blocks and two projects with Vitest + Testing Library suites, each verified against a reference implementation.

*Note: lesson edits and the projects and media were produced in an earlier session. This review was compiled afterwards from that session's edit record.*

## Clarity issues

| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| react100-02 | Project files listing | The Vite template creates `public/`, `src/assets/`, and an ESLint config that the lesson never mentions, which confuses beginners | Added one sentence naming them as safe to ignore for now | Applied |
| react100-02 | Component naming | Vaguely says React "silently" renders an unknown element | States exactly what learners see: nothing renders, plus a console warning about `<toolcard>` | Applied |
| react100-02 | Component tree | The file tree omitted `NavLinks.jsx` and `PageHeading.jsx`, which the lesson uses | Tree completed | Applied |
| react100-03 | "Props are read-only" | Overclaims that React enforces read-only props. It only freezes the props object in development; reassigning a destructured variable or mutating a nested object isn't caught | Rewritten to say exactly what is and isn't enforced | Applied |
| react100-03 | JSX shorthands | Boolean-prop shorthand explanation was ambiguous | Sharpened with an explicit equivalence example | Applied |
| react100-04 | Rules of hooks | Says the linter enforces the rules but not how to run it | Added `npm run lint` and the editor ESLint extension | Applied |
| react100-04 | Lifting state worked example | `ToolGrid` is referenced but never shown, and `App` receives `tools` with no explanation of where they come from | Added the `ToolGrid` component and how to pass `TOOLS` until lesson 07 | Applied |
| react100-05 | Stable keys | `crypto.randomUUID()` works only in secure contexts (`https://` or `localhost`) | Added the caveat | Applied |
| react100-05 | Sorting | **Bug:** the "newest first" comparator `a.addedAt - b.addedAt` sorts oldest first | Fixed to `b.addedAt - a.addedAt`, with an explanation of comparator sign | Applied |
| react100-05 | Conditional rendering pitfalls | Claims an empty string renders visibly "in some layouts" (it doesn't); omits `NaN`, which does render | Corrected | Applied |
| react100-05 | Grouping | "Objects don't keep order" was imprecise | Explained the real rule: integer-like keys sort first | Applied |
| react100-05 | Practice data | Sort-by-date practice needs an `addedAt` field the data spec didn't require | Added `addedAt` to the required fields | Applied |
| react100-06 | Validation | **Bug:** `new Date("YYYY-MM-DD") < new Date()` parses the date as UTC midnight, so today's date is always rejected, and the day boundary shifts by timezone | Replaced with a local `todayString()` and a string comparison | Applied |
| react100-06 | Error association | `showError` is used before it's defined | Defined inline | Applied |
| react100-06 | Focus the error summary | **Bug:** on the first failed submit, `summaryRef.current` is `null` because state hasn't re-rendered yet, so `focus()` does nothing | Wrapped the updates in `flushSync`, with an explanation and a caution (verified by the project 02 test) | Applied |
| react100-07 | Effect timing | "An effect runs after paint" is not always true; for discrete events such as clicks React may flush effects before paint | Qualified the statement | Applied |
| react100-08 | Skip link | Didn't explain what a skip link is for | Added the why | Applied |
| react100-08 | ARIA in React | Wording implied learners must pass strings; React converts booleans | Corrected | Applied |
| react100-08 | `visually-hidden` | The snippet was named but not explained | Explained the clip technique | Applied |
| react100-08 | Target size | 44 by 44 px is presented without context | Clarified as the WCAG AAA target, with AA at 24 by 24 (see Open questions) | Applied |
| react100-11 | API keys | Says "no key in history" but doesn't warn that `VITE_` variables are bundled into client JavaScript | Added the warning and the `import.meta.env` usage | Applied |

## Depth and coverage gaps

- **No self-checks** in lessons 02–10. A "Check your understanding" block with answers was added to each (all objectives).
- **Manage component state and respond to user events:** "state is a snapshot" is explained in prose only, and learners repeatedly misread a count that seems one click behind. Video v01 targets this.
- **Render lists and conditional interfaces correctly:** the index-as-key bug is described but never demonstrated with state attached. Video v02 shows it live; project x01's tests catch it.
- **Load and display remote data from a component:** race conditions are covered in code but are hard to picture. Animation a01 visualizes out-of-order responses.
- **Build forms with controlled inputs:** no guidance on preventing double submits. Project x02 requires and tests it.
- **Build interfaces that are accessible and responsive:** no automated accessibility checks are mentioned. A note on `eslint-plugin-jsx-a11y` (already in many Vite setups) and axe DevTools would help.
- **Present a working React application and the reasoning behind it:** the demo rubric doesn't ask learners to show a test run. Consider adding it.

## Proposed additional projects

- **react100-x01 Toolshare Catalogue Browser** (drafted): search, filter, sort, and empty, loading, and error states over Toolshare data. Vitest + Testing Library suite catches index keys and in-place sort mutation.
- **react100-x02 Toolshare Return Check-In Form** (drafted): a controlled, validated, accessible form with error-summary focus and a double-submit guard. Suite catches a missing `flushSync` and a missing guard.
- Not drafted: **Waitlist badge with polling**: an effect with cleanup that polls availability and stops on unmount.
- Not drafted: **Responsive layout audit**: take a given Toolshare page from 320 px to 1440 px, and log and fix five issues.

## Video and animation opportunities

- **State is a snapshot: why your count is one click behind** (react100-04): screencast. Drafted as `media/video-01-state-is-a-snapshot.md`.
- **The index-key bug, live** (react100-05): screencast. Drafted as `media/video-02-the-index-key-bug.md`.
- **The fetch race** (react100-07): explainer animation of out-of-order responses and the ignore-flag fix. Drafted as `media/animation-01-the-fetch-race.md`.
- Not drafted: **Lifting state up** (react100-04): animation of state moving to the common parent, with props flowing down and callbacks flowing up.
- Not drafted: **Keyboard-only walkthrough** (react100-08): screencast with on-screen focus indicator and screen-reader output.

## Assessment ideas

- Predict-the-render items: given a component and a click sequence, write what's on screen (state snapshots, batching).
- Key bug spotter: three list snippets; identify which one loses state on reorder and why.
- Form accessibility checklist rubric for lesson 06: labels, `aria-describedby`, `aria-invalid`, summary focus, and no color-only errors.
- Demo rubric row for lesson 11: "explains one trade-off they made and what they'd do with more time."

## Changes applied in this pass

- `02-thinking-in-components.md`, project files listing: named the extra template files as safe to ignore.
- `02-thinking-in-components.md`, component naming: described the actual symptom of a lowercase component name.
- `02-thinking-in-components.md`, component tree: added the missing `NavLinks.jsx` and `PageHeading.jsx`.
- `02-thinking-in-components.md`, end: added "Check your understanding."
- `03-jsx-props-and-composition.md`, JSX shorthands: clarified boolean-prop shorthand.
- `03-jsx-props-and-composition.md`, "Props are read-only": corrected what React enforces.
- `03-jsx-props-and-composition.md`, end: added "Check your understanding."
- `04-state-and-event-handling.md`, rules of hooks: how to run the linter.
- `04-state-and-event-handling.md`, lifting state: added the `ToolGrid` component and how `tools` reaches `App`.
- `04-state-and-event-handling.md`, end: added "Check your understanding."
- `05-lists-keys-and-conditional-rendering.md`, keys: `crypto.randomUUID()` secure-context caveat.
- `05-lists-keys-and-conditional-rendering.md`, sorting: fixed the newest-first comparator and explained comparator sign.
- `05-lists-keys-and-conditional-rendering.md`, conditional rendering: corrected the empty-string claim; added `NaN`.
- `05-lists-keys-and-conditional-rendering.md`, grouping: explained object key ordering.
- `05-lists-keys-and-conditional-rendering.md`, practice: added the required `addedAt` field.
- `05-lists-keys-and-conditional-rendering.md`, end: added "Check your understanding," with a worked example of the key bug.
- `06-forms-and-controlled-inputs.md`, validation: fixed the date comparison that rejected today.
- `06-forms-and-controlled-inputs.md`, error association: defined `showError`.
- `06-forms-and-controlled-inputs.md`, error summary focus: added `flushSync` so focus works on the first failed submit.
- `06-forms-and-controlled-inputs.md`, end: added "Check your understanding."
- `07-effects-and-data-fetching.md`, timing note: qualified "effects run after paint."
- `07-effects-and-data-fetching.md`, end: added "Check your understanding."
- `08-accessible-and-responsive-components.md`, skip link: explained its purpose.
- `08-accessible-and-responsive-components.md`, ARIA in React: corrected the boolean and string explanation.
- `08-accessible-and-responsive-components.md`, `visually-hidden`: explained the technique.
- `08-accessible-and-responsive-components.md`, target size: added WCAG context.
- `08-accessible-and-responsive-components.md`, end: added "Check your understanding."
- `09-prototyping-a-feature.md`, end: added "Check your understanding."
- `10-working-from-a-project-plan.md`, end: added "Check your understanding."
- `11-project-build-and-demo-a-react-application.md`, API keys: `VITE_` variables are public in the browser bundle.

## Open questions for the course owner

- Pin versions (React 19, Vite, Vitest, @testing-library/react) in the course or in project starters. The project test suites were verified with current releases, but I didn't record exact versions.
- WCAG target size: 2.5.5 (AAA) is 44 by 44 CSS px; 2.5.8 (AA, WCAG 2.2) is 24 by 24. Confirm which level the course teaches to.
- `flushSync` is the minimal fix for summary focus, but some teams prefer focusing in an effect keyed on a submit counter. Should the course show both?
- Two lessons reference images under `img/`. Confirm they exist in the published build.
- This review was reconstructed from the earlier session's edit record. A quick editorial diff of `catalogue/courses/react100/lessons/` is recommended before promotion.
