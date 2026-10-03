---
lesson_id: react100-08
course_id: react100
pathway: software-developer
title: Accessible and Responsive Components
order: 8
kind: lesson
competency_ids:
  - D5-S1-C04
  - D6-S1-C01
objectives:
  - Build interfaces that are accessible and responsive
---

## The two questions this lesson answers

Can everyone use what you built, and does it work on the device they have? Those are the same question asked twice, and both are answered by decisions you make while writing components — not by an audit at the end.

Accessibility is usually described through four principles: an interface should be **perceivable** (people can take in the content, whether by sight, sound, or touch), **operable** (they can drive it, including without a mouse), **understandable** (it behaves predictably and explains its errors), and **robust** (it works with the software they use, including screen readers). Those four are the spine of the Web Content Accessibility Guidelines, which is what "accessible" means in practice on nearly every contract you will work under. WCAG has three conformance levels — A, AA, and AAA — and AA is the level almost every organization commits to, including most public-sector work.

Responsiveness is the sibling problem. The same interface has to work at 360 pixels wide on a phone held in one hand, at 1600 pixels on a monitor, and at 320 pixels of effective width when someone zooms to 400 percent because they cannot read small text. That last case is why the two topics belong in one lesson: zoom is an accessibility requirement, and it is satisfied by responsive layout.

React does not make either of these harder, and in one respect it makes them easier: a component is a single place where the correct markup lives, so getting a card or a field right once fixes every instance of it. The flip side is that a component built wrong is wrong everywhere. That leverage cuts both ways, which is why the habits below are worth building now.

## Semantic markup is most of the work

The single highest-value thing you can do is render the element that means what you intend. Browsers and assistive technology already know what a button, a heading, a list, and a navigation region are. Every time you use the right one, you inherit correct behavior for free; every time you use a `<div>`, you have to rebuild that behavior by hand and you will not rebuild all of it.

**Use a button for anything that does something.**

```jsx
{/* wrong: not focusable, no keyboard activation, announced as nothing */}
<div className="btn" onClick={handleRequest}>Request</div>

{/* right */}
<button type="button" className="btn" onClick={handleRequest}>Request</button>
```

A real `<button>` is in the tab order, fires on Enter and Space, is announced as a button, and gets a focus ring. Reproducing that on a div takes `tabIndex`, a keydown handler for two keys, `role="button"`, and CSS — four chances to get it wrong for zero benefit. The rule is simple: **a link goes somewhere, a button does something.** If clicking it changes the URL, use `<a>`; otherwise use `<button>`. And always write `type="button"` on a button that is inside a form and not submitting it, or it will submit.

**Give the page landmarks.** A screen reader user navigates by regions before they read anything:

```jsx
export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to main content</a>
      <header>
        <nav aria-label="Main">{/* nav links */}</nav>
      </header>
      <main id="main">{/* page content */}</main>
      <footer>{/* site footer */}</footer>
    </>
  );
}
```

One `<main>` per page. `<nav>` for navigation groups, with an `aria-label` when there is more than one so they can be told apart. The skip link is a small, standard piece: a link that is the first thing in the tab order, visually hidden until focused, that jumps past the header. Without it, a keyboard user tabs through twelve nav links on every page.

The CSS moves the link off-screen until it receives focus, then brings it back:

```css
.skip-link {
  position: absolute;
  left: 0.5rem;
  top: -10rem;
  padding: 0.5rem 1rem;
  background: #ffffff;
  color: #1a1a1a;
  z-index: 100;
}

.skip-link:focus {
  top: 0.5rem;
}
```

Do not hide it with `display: none` — an element that is not displayed cannot receive focus, so the link would never appear.

**Headings describe structure, not size.** `<h1>` through `<h6>` form an outline that assistive technology exposes as a table of contents. Use exactly one `<h1>` per page, never skip a level going down, and choose the level by position in the outline — then use CSS if you want it to look smaller. A component that hard-codes `<h3>` is a component that cannot be reused at another depth; take the level as a prop if you need to.

**Lists are lists.** A grid of cards is a list of things, so `<ul>` and `<li>` let a screen reader announce "list, ten items". Set `list-style: none` in CSS if you do not want bullets.

**Images need alt text that carries their meaning.** `alt` describes what the image conveys in this context, not what is in the picture. A tool photo in a card whose heading already says "Cordless Drill" adds nothing, so `alt=""` is correct — that marks it decorative and the screen reader skips it. An image that *is* the content needs a real description. Omitting `alt` entirely is different from `alt=""` and much worse: some screen readers read the filename aloud.

**Every control has an accessible name.** For an input that is a `<label>`, as lesson 06 covered. For an icon-only button, the visible glyph is not a name, so supply one:

```jsx
<button type="button" aria-label="Remove from favorites" onClick={handleRemove}>
  <span aria-hidden="true">×</span>
</button>
```

`aria-hidden="true"` on the glyph stops it being read as "multiplication sign", and `aria-label` supplies the name. If the button has visible text, do not add an `aria-label` — it overrides the visible text, and now the words a person sees and the words they hear are different, which breaks voice control.

## The first rule of ARIA

ARIA attributes add semantics that HTML cannot express. They are useful and they are also the most common source of accessibility damage, because a wrong ARIA attribute is worse than none: it actively lies to the software a person depends on.

The first rule of ARIA is **do not use ARIA if a native element will do**. `<button>` beats `<div role="button">` every time. Reach for ARIA when you genuinely need something HTML has no element for, and for the handful of attributes that describe state.

The ones you will actually use:

- `aria-label` — a name for a control that has no visible text.
- `aria-labelledby` / `aria-describedby` — point at the ids of elements that name or describe this one. The form-error wiring from lesson 06 is the standard use.
- `aria-expanded` — on a control that shows and hides something. Must reflect the current state.
- `aria-current="page"` — on the nav link for the page you are on.
- `aria-hidden="true"` — hide something decorative from assistive technology. Never put this on anything focusable; a control that is announced to no one but still tabbable is a trap.
- `aria-live` and the `role="status"` / `role="alert"` shorthands — announce changes, covered below.

Two rules about ARIA state in React that are easy to get wrong. ARIA attributes are always strings in the DOM — `"true"` or `"false"` — and React converts a JavaScript boolean for you, so `aria-expanded={false}` renders `aria-expanded="false"`, which is meaningful and usually correct. But for attributes like `aria-invalid` you often want the attribute absent rather than `"false"`, which means passing `undefined`. And any ARIA state must be driven by the same state variable that drives the visual change, or the two will drift:

```jsx
<button
  type="button"
  aria-expanded={isOpen}
  aria-controls="filter-panel"
  onClick={() => setIsOpen((open) => !open)}
>
  Filters
</button>
{isOpen && <div id="filter-panel">{/* … */}</div>}
```

## Keyboard operation

Every interactive thing must be reachable and usable with a keyboard alone. Test it the direct way: put your mouse down, press Tab from the top of the page, and try to complete a real task.

**Do not remove the focus outline.** `outline: none` with nothing to replace it is the most damaging one-line change in front-end CSS: it makes the page unusable for anyone navigating by keyboard, because they cannot see where they are. If the default ring is ugly, style it:

```css
:focus-visible {
  outline: 3px solid #1b5e9c;
  outline-offset: 2px;
}
```

`:focus-visible` applies when the browser judges that a focus ring is warranted — keyboard navigation, not a mouse click — which is what people usually want when they reach for `outline: none`.

**Tab order follows the DOM.** Keep the source order matching the visual order. CSS that visually reorders content (`order`, `row-reverse`, absolute positioning) leaves the tab order behind and produces focus that jumps around the screen. Never use positive `tabIndex` values to patch it; fix the source order instead. `tabIndex={-1}` is fine and useful — it makes an element focusable by script but not by Tab, which is what the error summary in lesson 06 used.

**Manage focus when the interface changes.** When content appears or disappears in response to an action, focus needs to go somewhere sensible. Open a dialog: move focus into it, keep focus inside it while it is open, and return focus to the button that opened it when it closes. Delete a row: move focus to the next row or to the list heading, because focus left on a removed element falls back to the document body and the user is stranded at the top of the page.

```jsx
const closeButtonRef = useRef(null);

useEffect(() => {
  if (isOpen) closeButtonRef.current?.focus();
}, [isOpen]);
```

**Escape should close things.** Any overlay or popup that opens should close on the Escape key. It is two lines and everyone expects it.

## Announcing what changed

A sighted user sees a new result count appear. A screen reader user, whose focus has not moved, gets nothing — because the software only speaks what is focused or what it is told to speak. **Live regions** are how you tell it.

```jsx
<p role="status">{visible.length} tools match your search.</p>
```

```jsx
{status === "error" && <p role="alert">{error.message}</p>}
```

`role="status"` is a polite announcement, queued until the user pauses. `role="alert"` interrupts, which is right for errors and wrong for everything else — a page that interrupts constantly is a page people turn off.

The one implementation detail that catches people: the live region element must be **present in the DOM before the content changes**. If the whole element is conditionally rendered, some screen readers will not announce it, because it appeared at the same instant as its text. Render the container always and change its contents:

```jsx
{/* more reliable */}
<p role="status" className="visually-hidden">
  {status === "loading" ? "Loading tools" : `${visible.length} tools match`}
</p>
```

The `visually-hidden` class is a standard snippet that hides content visually while leaving it available to assistive technology — clip it to a one-pixel box rather than using `display: none`, which hides it from everyone:

```css
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

## Color, contrast, and motion

**Contrast.** WCAG AA requires a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text and for the visual boundaries of interactive components. Your browser's devtools shows the ratio in the color picker and flags failures, so there is no reason to guess. Placeholder text and light-gray "secondary" labels are where this fails most often.

**Never let color be the only signal.** An availability badge that is green for available and red for out conveys nothing to someone who cannot distinguish them. Add the word, an icon, or a pattern — which you are already doing if your badge has a label.

**Respect reduced motion.** Some people get migraines or nausea from animation, and their operating system exposes that preference:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Target size.** Anything tappable should be at least around 44 by 44 pixels, including the padding. Small icon buttons crammed into a card are the usual failure, and the fix is padding rather than a bigger icon. For the record, WCAG 2.2's AA minimum is smaller — 24 by 24 CSS pixels, with some exceptions — and 44 by 44 is its stricter AAA level. This course uses 44 because it is the comfortable size for a thumb and it clears both.

## Responsive layout

The reliable approach is **mobile-first**: write the narrow layout as the base, then add breakpoints that widen it. This produces simpler CSS than the reverse, because a single column is the natural default of a document and you are adding structure rather than undoing it.

```css
.tool-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}

@media (min-width: 40rem) {
  .tool-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 64rem) {
  .tool-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

Better still, let the grid decide for itself, which removes the breakpoints entirely:

```css
.tool-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
}
```

Four rules make responsive work go smoothly.

**Choose breakpoints from your content, not from device names.** Widen the window slowly and add a breakpoint where the layout starts looking wrong. Chasing specific phone widths is a losing game — there are too many, and they change every year.

**Use `rem` for breakpoints and type.** A breakpoint in pixels ignores a user who has raised their browser's default font size; one in `rem` responds to it.

**Make media flexible.** `img { max-width: 100%; height: auto; display: block; }` in your base stylesheet prevents the single most common overflow bug. Add `width` and `height` attributes to images so the browser reserves the right space and the page does not jump as they load.

**Never produce horizontal scrolling at 320 pixels.** WCAG's reflow requirement is essentially this: content must be usable at 320 pixels of effective width without scrolling in two directions. Fixed widths, long unbroken strings, and wide tables are the usual causes. Set `min-width: 0` on flex and grid children that contain long text — the default `min-width: auto` refuses to shrink below the content and is the reason a stubborn element overflows.

In React specifically, prefer CSS for anything the browser can decide. It is tempting to read `window.innerWidth` into state and render different components above and below a threshold, and occasionally that is genuinely needed — but it costs an effect, a resize listener, and a first render at the wrong size. A media query has none of those problems.

## Testing what you built

Automated tools catch roughly a third of accessibility defects. They are still worth running on every change, because that third is cheap to find and boring to find by hand — but the other two-thirds need a person.

**Run an automated scan.** Install the axe DevTools browser extension, or run Lighthouse's accessibility audit from your browser's devtools. Both give you a list with element references and links to explanations. Fix the criticals before anything else.

**Do a keyboard pass.** Tab from the address bar to the end of the page. Ask: can I reach everything interactive, can I see where I am at all times, does the order make sense, can I complete the main task, can I get out of everything I get into.

**Use the accessibility tree.** Your browser's devtools has an accessibility panel that shows each element's computed role, name, and state. This is the ground truth for "what will a screen reader say about this", and checking it takes seconds.

**Zoom to 200 percent and to 400 percent** and confirm nothing is cut off, overlapping, or requiring horizontal scrolling.

**Try a screen reader.** VoiceOver is built into macOS and iOS, Narrator into Windows, and TalkBack into Android; NVDA is a free Windows download. You do not need to become expert. Turn one on, close your eyes for one task, and you will learn more about your interface in ten minutes than from any checklist.

**Check the things automation cannot see:** whether alt text actually describes the image, whether the heading outline reflects the real structure, whether an error message is useful, whether focus goes somewhere sensible after an action, whether the reading order matches the visual order.

## Keeping it accessible after today

A one-time audit decays. The competency this lesson is aimed at is the *ongoing* one: participating in the monitoring that keeps a product accessible and compliant as it changes, which is a working practice rather than a task.

What that looks like on a team you are joining:

**A check that runs on every change.** At minimum, the linter. Add `eslint-plugin-jsx-a11y` to the project and it flags a missing `alt`, a click handler on a non-interactive element, and a label with no control, while you type. It is not a substitute for testing, but it stops a whole class of defect from ever reaching a review.

**A short manual pass in the definition of done.** Three questions per pull request — does it work by keyboard, does everything have an accessible name, does it reflow at 320 pixels — take two minutes and catch most of what the linter cannot.

**A scheduled scan of the live product.** Whether that is running axe against key pages monthly or a hosted monitoring service, the point is that it happens on a schedule and someone reads the output. New content, third-party embeds, and a designer's tweak to a color token all break things without any code change.

**A written record of findings.** This is the part apprentices are most often asked to own, and it is not busywork. A useful accessibility issue report contains: the page or component, the exact steps to reproduce, what happened and what should have happened, the WCAG success criterion it relates to, who it affects and how badly, and the environment — browser, operating system, and assistive technology with versions. "The filter button isn't accessible" is not actionable. "On the browse page, the Filters toggle cannot be reached by Tab because it is a div with a click handler; keyboard-only users cannot open the filter panel at all; WCAG 2.1.1 Keyboard, Level A; Chrome 126 on Windows 11 with NVDA 2024.2" is a ticket someone can fix.

**A severity judgment, and knowing when to escalate.** Not everything is equal. A blocker prevents a task from being completed at all by some group of users — an unreachable control, a form field with no label, a keyboard trap — and it should stop a release. A serious issue makes a task much harder — poor contrast, a missing live region — and belongs in the next sprint. A minor issue is a friction point worth batching. When you find something you are not sure how to classify or how to fix, escalate it with the evidence rather than sitting on it; on the accessibility side of the work, "I logged it and asked" is the correct behavior of a junior developer, and silence is not.

**Know what is being claimed.** Many organizations publish an accessibility statement or maintain a conformance report, and public-sector work is often legally bound to a specific level. You do not need to write those documents, but you should know which level your team has committed to, because it is the standard your work is measured against.

## Practice

Continue in the `toolshare` project. Every task is on the app you have already built.

1. **Baseline the damage.** Run axe DevTools or Lighthouse against your browse page and your request form, and record every issue with its severity in a new `A11Y.md` file. Do not fix anything yet.

2. **Fix the semantics.** Replace every non-semantic interactive element with a real `<button>` or `<a>`, wrap the card grid in a list, give the page a `<header>`, `<nav>`, `<main>`, and `<footer>`, and check the heading outline has exactly one `<h1>` and no skipped levels.

3. **Add a skip link** as the first focusable element, visually hidden until focused, targeting your `<main>`. Confirm it works with Tab then Enter.

4. **Name every control.** Give each icon-only button an `aria-label` and mark its glyph `aria-hidden`. Audit every image's `alt`: decorative images get `alt=""`, meaningful ones get a real description. Verify each one in the accessibility panel.

5. **Do a keyboard pass** of the whole app and write the result in `A11Y.md`: what you could not reach, where focus disappeared, where the order was wrong. Fix each finding and record the fix.

6. **Style focus properly.** Remove any `outline: none` in your CSS and add a visible `:focus-visible` style with sufficient contrast against every background it appears on.

7. **Wire a disclosure correctly.** Make the filter panel a toggle whose button carries `aria-expanded` and `aria-controls` driven by the same state as the visual change, and make Escape close it and return focus to the toggle.

8. **Announce changes.** Add a live region that reports the number of matching tools after a search, always rendered rather than conditionally rendered, and confirm with a screen reader that it is announced. Make your data-loading error use `role="alert"` and confirm it interrupts.

9. **Check contrast.** Use the devtools color picker on every text and border color in your app. Record any pair below 4.5:1 in `A11Y.md` and fix them. Confirm no state is signaled by color alone.

10. **Make it reflow.** Set the browser to 320 pixels wide and then to 400 percent zoom. Fix every instance of horizontal scrolling, clipping, or overlap. Convert your grid to `auto-fill` with `minmax` and delete any breakpoint you no longer need.

11. **Respect motion and touch.** Add a `prefers-reduced-motion` block, and confirm every tappable target is at least 44 pixels in both dimensions at mobile width.

12. **Install the linter.** Add `eslint-plugin-jsx-a11y` to the project, enable its recommended rules, run the lint, and fix what it reports. Record how many issues it found that your manual pass had missed, and how many it could not have found.

13. **Write two issue reports.** Pick the two worst defects you found and write full reports in `A11Y.md`: component, reproduction steps, actual versus expected, the WCAG criterion, who is affected, severity with justification, and environment details. Then write a short paragraph proposing an ongoing monitoring routine for this project — what runs on every change, what runs on a schedule, who reads the output, and what triggers an escalation.

14. **Re-scan.** Run the automated tool again and record the before and after counts in `A11Y.md`, plus one defect the tool never detected that you found by hand.

**Deliverable:** a `toolshare` project that passes an automated scan with no critical issues, is fully operable by keyboard, reflows without horizontal scrolling at 320 pixels, and announces its dynamic changes; plus `A11Y.md` containing your baseline, your keyboard-pass findings and fixes, two full issue reports, your proposed monitoring routine, and the before-and-after scan results.

## Check your understanding

1. A tool card's "Remove" control is `<div className="btn" onClick={handleRemove}>×</div>`. List what is wrong with it and write the replacement.
2. The tool photo sits in a card whose heading already reads "Cordless Drill". What should its `alt` be, and why?
3. Your result count is rendered as `{searchText && <p role="status">…</p>}`, and a screen reader never announces it. Why, and what is the fix?
4. Why are breakpoints written in `rem` rather than pixels?
5. An automated scan reports zero issues. Name two things it could not have checked.

**Answers**

1. It cannot be focused, does not respond to Enter or Space, has no role, and "×" is not a usable name. Use `<button type="button" aria-label="Remove" onClick={handleRemove}><span aria-hidden="true">×</span></button>`.
2. `alt=""`. The heading already names the tool, so the photo is decorative in this context and a screen reader should skip it.
3. The live region appears at the same moment as its text, so some screen readers miss the change. Render the `role="status"` element always and change only its contents.
4. A `rem` breakpoint responds when a person raises their browser's default font size; a pixel breakpoint ignores it.
5. Any two of: whether alt text actually describes the image, whether the heading outline reflects the real structure, whether error messages are useful, whether focus goes somewhere sensible after an action, whether reading order matches visual order.
