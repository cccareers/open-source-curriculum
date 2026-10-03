---
course_id: react200
title: "Intermediate ReactJS — Enhancement Review"
reviewed_lessons: 8
status: draft
---

## Summary

react200 is strong: every lesson is built on one consistent running example (the Community Events Board and its autumn volunteer drive), the prose is direct and concrete, and the last three lessons turn the same codebase into planning, coordination, and directed-change practice instead of paperwork. The biggest risks were technical accuracy in the React Router and Redux Toolkit details. Two claims taught the wrong mental model: that an `errorElement` on a layout keeps that layout's own chrome on screen, and that a `status === "idle"` guard stops the StrictMode double fetch. Both are now corrected. The biggest remaining opportunity is executable practice: the course has no tests anywhere (testing is out of scope per `sequencing_rationale`), so the two supplementary projects ship acceptance-test sketches that learners can run.

## Clarity issues

| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| react200-02 | "Redirects, 404s, and the shape of a real route table" | Says the loader "throws a redirect" while the code returns it. | Say "returns", and explain that `redirect()` builds a 302 `Response` that may be returned or thrown. | Applied |
| react200-02 | "Setting up" | Teaches "version 6.4" with no guidance for learners who install React Router 7, which `npm install react-router-dom` now pulls. | Added a short version-check paragraph: v7 keeps the data-router APIs; imports may come from `react-router`. | Applied |
| react200-03 | "Loaders" | `throw new Response("Not Found", { status: 404 })` has no `statusText`, so the `RouteError` heading renders "404 — " with nothing after the dash. | Pass `statusText` and a user-facing message; explain that hand-built `Response` objects do not derive `statusText`. | Applied |
| react200-03 | "Parent loaders and shared data" | `venueLoader` is never defined; `useRouteLoaderData` returns `undefined` outside the matched subtree, and that is not mentioned. `VenuePicker`'s `<select>` has no label. | One-sentence definition and caveat; added a `<label>`. | Applied |
| react200-03 | "Errors that stay inside the layout" | **Technical error.** Claims an `errorElement` on the events layout "leaves the site header and the events heading intact and swaps only the inner panel." In React Router, the catching route renders its `errorElement` *in place of its own `element`*, so `EventsLayout` (and its heading) is replaced. | Stated the rule explicitly, corrected the paragraph and code comment, and added the pathless child-route pattern that does keep the heading. | Applied |
| react200-04 | "Selectors as a public interface" | "A memoized selector caches exactly one result by default" is true for RTK 1.x/Reselect 4 but not for RTK 2.x, which bundles Reselect 5 with `weakMapMemoize`. | Rewrote the caveat to be version-aware and kept the practical advice. | Applied |
| react200-04 | "Reading and writing from components" | No mention of React Redux's development-mode selector stability warning, which learners will see when they reproduce the bug in practice step 7. | One sentence linking the warning to the bug. | Applied |
| react200-04 | "Preparing payloads" | Adding `prepare(eventId, role)` silently breaks the earlier `shiftClaimed({ eventId, role })` call in `ShiftButton`. | Sentence on the signature change, the resulting `"[object Object]"` key, and "grep for callers". | Applied |
| react200-05 | "Dispatching, and what comes back" | **Technical error.** Claims the `status === "idle"` guard prevents the StrictMode double request because "the second effect run sees `loading`". The StrictMode re-run uses the same render's closure, so it still sees `"idle"` and dispatches again. | Explained the closure, and pointed to `condition` (which reads `getState()` at dispatch time) as the real fix. Practice step 4 adjusted to match. | Applied |
| react200-05 | "Not fetching the same thing twice" | Says a condition-cancelled thunk's "returned promise rejects." It resolves with a rejected action (`meta.condition: true`); only `.unwrap()` throws. | Corrected, and connected `condition` to the StrictMode fix. | Applied |
| react200-05 | "Cancelling in-flight work" | "Debounce" used without definition; practice step 8 asks for a 300 ms debounce the lesson never shows. The lesson's `condition` (blocks on `"succeeded"`) would also block every new search. | Defined debounce, added a `useDebouncedValue` hook and its use with abort, and a warning about reusing that `condition`. | Applied |
| react200-05 | "Thunks that are not fetches" | Says replacing the middleware array makes thunks "silently stop working"; it actually throws ("actions must be plain objects"), which practice step 10 asks learners to read. | Corrected the wording. | Applied |
| react200-05 | "Where this meets the router" | `store.dispatch(fetchEvents()).unwrap()` in a loader throws on the second visit if `fetchEvents` has the `condition` from earlier in the lesson. RTK Query hooks live at `@reduxjs/toolkit/query/react`, not `@reduxjs/toolkit/query`. | Added a warning about the condition/unwrap interaction and corrected the import path. | Applied |
| react200-08 | "Orienting in a codebase you did not write" | Version cue only covers `react-router-dom` 6.4; a v7 codebase may depend on `react-router` alone, and a 6.4+ app may still use element routes. | Added the v7 case and "confirm by finding `createBrowserRouter`". | Applied |
| react200-08 | "Change the minimum" | The fixed rejected handler returns early on `meta.aborted` *before* deleting the optimistic entry, so an aborted claim would leave a stale pending row. Harmless today (claims are never aborted), but it is the exact bug class the lesson teaches. | Either delete before the early return, or note why aborts cannot happen for claims. | Proposed |
| react200-03 | "Mutations with actions" | "A successful action revalidates route data" is right, but learners may assume a *validation-error* return skips revalidation. Behavior differs between v6 (revalidates after any action) and v7 (configurable; may skip on 4xx/5xx responses). | Add one version-aware sentence once the target version is confirmed. | Proposed |
| react200-02 – 08 | End of lesson | No "Check your understanding" block in any lesson. | Added a five-question block with answers to lessons 02–08. | Applied |

## Depth and coverage gaps

- **No automated verification anywhere** ("Manage application state in a central store", "Handle asynchronous work and side effects in a state container", "Compose nested routes and layouts around shared data"). Testing is declared out of scope, but the pathway's coding courses are expected to ship learner-runnable tests (CONTRIBUTING.md). Both supplementary projects now include Vitest + React Testing Library sketches using `createMemoryRouter` and a `makeStore()` factory. Consider a short appendix in lesson 04 on exporting `makeStore` so tests are possible.
- **Error-element placement had no worked counter-example** ("Compose nested routes and layouts around shared data"). Now corrected in lesson 03, with a pathless-route example; `video-02` and `animation-02` make it visual.
- **StrictMode and effects** ("Handle asynchronous work and side effects in a state container"). The closure behavior that defeats status guards is a common confusion; now explained in lesson 05, but a short side-by-side demo (guard vs. `condition`) would help.
- **Route protection** ("Add client-side routing to a React application"). Lesson 06 plans an "OrganizerLayout and route guard" and lesson 02 mentions `state: { from: location }`, but no lesson shows a loader-based guard (`redirect("/login")` from a loader). A small worked example in lesson 02's `useLocation` section would close the loop.
- **`useFetcher`** ("Compose nested routes and layouts around shared data"). Claiming a shift from a list row (lesson 08) is the classic use for a fetcher (mutation without navigation); the course routes all mutations through Redux instead. Worth one paragraph contrasting the two so learners recognize it in codebases.
- **Accessibility of route changes** ("Add client-side routing to a React application"). Client-side navigation does not move focus or announce the new page; the course never mentions it. A short note on focusing the main heading after navigation would fit lesson 03's `RootLayout`.
- **Planning and coordination lessons (06, 07)** are thorough; gap is a model "good" artifact. A completed sample `docs/implementation-plan.md` and hand-off note for VOL-114 would let learners calibrate.
- **Directed change (08)** would benefit from a seeded "unfamiliar" repository so learners without a swap partner get a realistic codebase.

## Proposed additional projects

- **Drafted — `projects/01-volunteer-shift-claims.md` (react200-x01):** optimistic claim/release thunks, `/my/shifts`, nav badge, store factory; Vitest + RTL acceptance tests; QA hand-off note.
- **Drafted — `projects/02-venue-directory-section.md` (react200-x02):** nested `/venues` section with a shared section loader, URL filter, pathless error boundary, legacy `/places` redirect; tests against the exported route array.
- Saved searches (Increment 3 of the lesson 06 plan): `searches` slice persisted with listener middleware, restored by navigating to the saved URL. Reinforces store vs. URL ownership.
- Organizer view with a loader-based permission guard and a 403 error element (Increment 4 of the plan), paired with a spike write-up.
- "Legacy codebase" directed change: a provided repository using `connect`, hand-written reducers, and element routes; learner applies a small directive in that idiom without modernizing it.
- Requirements relay role-play pack for lesson 07: PM, UX, and QA role cards with hidden constraints, for a 45-minute in-class exercise.

## Video and animation opportunities

- **Drafted — `media/video-01-optimistic-claim-with-createasyncthunk.md`:** optimistic claim, rollback, and deduplication proven in Redux DevTools (lessons 04–05; screencast). Motion and the DevTools diff make the three lifecycle actions concrete.
- **Drafted — `media/video-02-where-the-error-lands.md`:** loader placement, parallel loading, and error-element placement (lessons 02–03; screencast). Corrects the layout-error misconception on screen.
- **Drafted — `media/animation-01-optimistic-claim-round-trip.md`:** the Redux loop with a thunk beside it, request in parallel with the UI, rollback on 409 (explainer animation).
- **Drafted — `media/animation-02-route-tree-and-error-bubbling.md`:** outlets filling, loaders in parallel vs. effects as a staircase, error climbing the tree (explainer animation).
- History API demystified: `history.pushState` in the console, then the router listening (lesson 02; 3-minute screencast).
- Selector re-render bug: render counter on the badge while unrelated actions fire, before and after `createSelector` (lesson 04; screencast).
- Search race condition: "pot" vs. "potluck" responses on a timeline, fixed by abort plus debounce (lesson 05; explainer animation).
- Vertical vs. horizontal slicing of the volunteer-drive plan (lesson 06; whiteboard).
- Relaying one requirement through PM → UX → QA, showing what is lost at each hop (lesson 07; talking head plus animated overlays).
- Blast-radius grep and test matrix, live on an unfamiliar repo (lesson 08; screencast).

## Assessment ideas

- The "Check your understanding" blocks added to lessons 02–08 can seed a question bank; each has a worked answer.
- **Predict-the-screen items** (lesson 03): show a route table with error elements in different places and a failing URL; learner marks which regions survive.
- **Action-log reading** (lessons 04–05): give a Redux DevTools export and a bug report; learner identifies whether the fault is dispatch, reducer, or selector.
- **Plan review rubric** (lesson 06): score a sample plan on design presence, vertical slicing, risk table actionability, and definition of done.
- **Hand-off note audit** (lesson 07): give a deficient note; learner lists the questions QA would have to ask.
- **Diff review** (lesson 08): give a PR mixing a style rewrite with the directed change; learner splits it into reviewable commits.

## Changes applied in this pass

- `lessons/02-routing-with-react-router.md`, "Setting up": added a paragraph on checking the installed major version and React Router 7's import paths.
- `lessons/02-routing-with-react-router.md`, "Redirects, 404s, and the shape of a real route table": corrected "throws a redirect" to "returns a redirect" and explained what `redirect()` builds.
- `lessons/02-routing-with-react-router.md`, new "Check your understanding" at end: five questions with answers.
- `lessons/03-nested-routes-layouts-and-route-data.md`, "Loaders": detail loader now throws a 404 `Response` with a message and `statusText`; added an explanation of `data` and `statusText`.
- `lessons/03-nested-routes-layouts-and-route-data.md`, "Parent loaders and shared data": defined `venueLoader`, added the `undefined`-outside-subtree caveat, and added a label to `VenuePicker`'s select.
- `lessons/03-nested-routes-layouts-and-route-data.md`, "Errors that stay inside the layout": corrected the error-placement claim, corrected the code comment, stated the "catching route's element is replaced" rule, and added a pathless child-route example.
- `lessons/03-nested-routes-layouts-and-route-data.md`, new "Check your understanding" at end: five questions with answers.
- `lessons/04-state-management-with-redux.md`, "Reading and writing from components": added a sentence on React Redux's dev-mode selector stability warning.
- `lessons/04-state-management-with-redux.md`, "Selectors as a public interface": made the `createSelector` cache-size caveat version-aware (RTK 1.x vs 2.x).
- `lessons/04-state-management-with-redux.md`, "Preparing payloads": noted the action-creator signature change and the need to update existing callers.
- `lessons/04-state-management-with-redux.md`, new "Check your understanding" at end: five questions with answers.
- `lessons/05-async-flows-and-side-effects.md`, "Dispatching, and what comes back": corrected the StrictMode explanation (closure sees `"idle"`; `condition` is the real fix).
- `lessons/05-async-flows-and-side-effects.md`, "Not fetching the same thing twice": corrected what a condition-cancelled thunk's promise does, added the `.unwrap()` caveat, and linked `condition` to the StrictMode fix.
- `lessons/05-async-flows-and-side-effects.md`, "Cancelling in-flight work": defined debounce; added a `useDebouncedValue` hook and its use with abort; warned against reusing the list `condition` for search.
- `lessons/05-async-flows-and-side-effects.md`, "Thunks that are not fetches": replaced "silently stops working" with the actual thrown error.
- `lessons/05-async-flows-and-side-effects.md`, "Where this meets the router": added the `condition` + `.unwrap()` loader caveat; corrected the RTK Query hooks import path to `@reduxjs/toolkit/query/react`.
- `lessons/05-async-flows-and-side-effects.md`, "Practice" step 4: reworded so learners count requests with and without the guard and explain why the guard alone does not stop the dev double request (matches the corrected explanation).
- `lessons/05-async-flows-and-side-effects.md`, new "Check your understanding" at end: five questions with answers.
- `lessons/06-planning-an-implementation.md`, new "Check your understanding" at end: five questions with answers.
- `lessons/07-coordinating-requirements-with-pm-ux-and-qa.md`, new "Check your understanding" at end: five questions with answers.
- `lessons/08-applying-directed-changes-to-an-existing-app.md`, "Orienting in a codebase you did not write": added the React Router 7 / `react-router` dependency case and a check for `createBrowserRouter`.
- `lessons/08-applying-directed-changes-to-an-existing-app.md`, new "Check your understanding" at end: five questions with answers.

No frontmatter, objectives, section order, or `course.json` content was changed.

## Open questions for the course owner

- **Target library versions.** `sequencing_rationale` asks a reviewer to confirm the data-router API and RTK patterns against partner codebases. Recommend pinning versions in lesson 02's setup (for example React Router 7.x and Redux Toolkit 2.x) so behavior notes can be definitive rather than version-aware. Specific version-dependent points: action revalidation defaults (v6 vs v7), import paths (`react-router-dom` vs `react-router`), and Reselect memoization (RTK 1.x vs 2.x).
- **Package import path in v7.** The lessons import from `react-router-dom` throughout. This is believed to still work in v7 (it re-exports `react-router`), but the v7 docs recommend `react-router`; decide whether to switch the course's imports.
- **Vitest + jsdom + data routers.** Some combinations of Node, jsdom, and React Router have raised "Expected signal to be an instance of AbortSignal" when loaders run under `createMemoryRouter`. I could not verify whether this affects current versions. Project x02's tests run loaders; please run the sketch on the pinned versions before release, and if needed switch the test environment (for example to `happy-dom`) or add a documented polyfill.
- **React Redux selector warning text.** Lesson 04 now mentions the development-mode stability check and quotes its gist ("returned a different result when called with the same parameters"); confirm the exact wording against the pinned `react-redux` version.
- **Badge counting pending claims.** Project x01 counts pending claims in the nav badge (they are already shown as claimed). Lesson 08's "When to stop and ask" uses "the selector counts pending claims" as an example of a *bug*. Decide the product rule and make the course consistent.
- **Testing scope.** `sequencing_rationale` puts testing out of scope, while CONTRIBUTING.md asks coding projects to ship learner-runnable tests. The project briefs assume learners can install Vitest and Testing Library from a provided setup; confirm that is acceptable or supply a starter repository with tests pre-wired.
- **Lesson 08 rollback snippet** (`meta.aborted` early return before the delete): proposed fix above; left unapplied because the lesson presents it as the learner's minimal fix and the right answer depends on whether claims can ever be aborted in the partner codebase.
- **Image assets.** `img/route-tree-and-outlets.png` and `img/redux-data-flow.png` are referenced but the `img/` folder does not exist yet. The animation storyboards are designed to share their geometry; the route-tree diagram should reflect the corrected error-placement rule if it shows error elements.
