---
lesson_id: web100-04
course_id: web100
pathway: quality-assurance-software-engineer
title: Forms, Labels, and Accessible Inputs
order: 4
kind: lesson
competency_ids:
  - D5-S1-C01
  - D5-S1-C02
objectives:
  - Build form controls that are labelled, keyboard reachable, and straightforward to identify in a test
---

## Forms are where markup quality is tested hardest

Forms are the single highest-stakes piece of markup on most sites: they are how a user submits data, and how a tester exercises the most business logic per element. A form with poor markup is a form that is hard to test, hard to use with a keyboard alone, and often invisible to assistive technology. This lesson builds a form control by control, with an eye on exactly what makes each one labelled, keyboard-reachable, and reliably selectable.

## The `<form>` element and its parts

```html
<form action="/signup" method="post">
  <!-- fields go here -->
  <button type="submit">Create account</button>
</form>
```

`action` is where the data goes, `method` is how (`get` appends to the URL, `post` sends it in the request body — `post` is standard for anything that changes data). A `<button type="submit">` inside a `<form>` submits it; pressing Enter in most text fields does the same thing automatically, for free, as long as the field is inside a real `<form>`. That "submit on Enter" behavior is one of the easiest things to silently lose when a form is built without a real `<form>` element wrapping it.

## Every input needs a real, connected `<label>`

This is the single most important rule in this lesson:

```html
<label for="email">Email address</label>
<input type="email" id="email" name="email" required />
```

The `for` attribute on `<label>` must match the `id` on the input. That connection does three concrete things:

1. Clicking the label text moves focus into (or activates) the input — try clicking "Email address" above and watch the cursor land in the field.
2. A screen reader announces the label when the field receives focus: "Email address, edit text."
3. It gives automated tests a reliable, human-readable way to find the field — `getByLabelText('Email address')` in a testing library, for example — instead of a brittle CSS selector tied to page structure.

Placeholder text is not a substitute for a label:

```html
<!-- Wrong: no label at all -->
<input type="email" placeholder="Email address" />
```

A placeholder disappears the moment the user types, it is not reliably announced by every screen reader, and it gives no connection point for the label-based test lookup above. Placeholder text is fine as a *supplement* — showing an example format, like `placeholder="name@example.com"` — but never as the field's only name.

When a `<label>` can't wrap visible text next to the input (a search box with only an icon, say), use `aria-label` instead:

```html
<input type="search" aria-label="Search the site" placeholder="Search…" />
```

## Input types: let the browser do the validating

HTML5 input types give you free behavior — the right on-screen keyboard on mobile, and baseline validation, without a line of JavaScript:

```html
<label for="email">Email address</label>
<input type="email" id="email" name="email" required />

<label for="qty">Quantity</label>
<input type="number" id="qty" name="qty" min="1" max="10" required />

<label for="dob">Date of birth</label>
<input type="date" id="dob" name="dob" required />
```

- `type="email"` rejects submission of text with no `@`, and pops a `@`-friendly keyboard on mobile.
- `type="number"` with `min`/`max` constrains the range and gives mobile users a numeric keypad.
- `type="date"` gives a native date picker.
- `type="text"` is the fallback for anything else; do not use it for email or number fields just because it is familiar — you lose the built-in validation and the correct mobile keyboard.

`required` marks a field mandatory; the browser blocks submission and shows a native message if it is left empty. As a tester, this native validation is worth knowing well: a required field that submits empty anyway is a real defect, and it is one of the first things to check with keyboard-only submission (Tab to the field, leave it empty, press Enter).

## Grouping related controls

Radio buttons and checkboxes need a shared `name` (for radios, so only one in the group can be selected) and each needs its own connected `<label>`. Group them under `<fieldset>` with a `<legend>` describing the group as a whole:

```html
<fieldset>
  <legend>Preferred contact method</legend>

  <input type="radio" id="contact-email" name="contact" value="email" checked />
  <label for="contact-email">Email</label>

  <input type="radio" id="contact-phone" name="contact" value="phone" />
  <label for="contact-phone">Phone</label>
</fieldset>
```

`<legend>` is to a group of radios/checkboxes what `<label>` is to a single input: without it, a screen reader announces "Email, radio button, 1 of 2" with no indication of what the choice is *for*. A visually obvious heading above the group (`<h3>Preferred contact method</h3>`) does not substitute for a real `<legend>` — the connection is structural, not visual.

Dropdowns follow the same labelling rule as text inputs:

```html
<label for="role">Role</label>
<select id="role" name="role">
  <option value="">Select a role</option>
  <option value="qa">QA Engineer</option>
  <option value="dev">Developer</option>
</select>
```

A `<select>` with no first empty `<option>` forces a default selection on the user, which is itself worth flagging if the form's intent was for the user to actively choose.

## Keyboard reachability: the test every form needs

A sighted mouse user can click any element on the page. A keyboard-only user (and a screen reader user, and many automated end-to-end tests) can only reach elements that are in the natural **tab order** — which, by default, includes every real `<input>`, `<select>`, `<textarea>`, `<button>`, and `<a href="...">`, in document order, for free.

The moment you replace a native control with a styled `<div>` (a custom dropdown, a custom checkbox skin built from a `<div>` and CSS), you lose that tab-order membership unless you explicitly restore it with `tabindex="0"` and re-implement keyboard activation (Enter/Space) and ARIA state by hand. This is one of the most common and most serious defects you will find as a QA engineer: a control that a mouse user cannot tell is broken, but a keyboard-only user cannot reach or operate at all.

The practical test, and one you should run on every form you review from now on: **unplug your mouse, mentally or literally, and Tab through the form from the top.** Every field should receive a visible focus outline, in a sensible order, and every button and link should be reachable and activatable with Enter or Space alone. If a control is skipped, or reachable but silent to a screen reader, or requires a mouse to open (like a custom dropdown that never responds to arrow keys) — that is a specific, reportable defect, not a vague "accessibility issue."

## Error messages that are actually connected to the field

A red asterisk or a message floating near a field is not connected to it unless code says so:

```html
<label for="email">Email address</label>
<input
  type="email"
  id="email"
  name="email"
  required
  aria-describedby="email-error"
  aria-invalid="true"
/>
<p id="email-error" role="alert">Enter a valid email address.</p>
```

`aria-describedby` points at the error message's `id`, so a screen reader announces the error along with the field. `aria-invalid="true"` marks the field as currently failing validation — toggle it off once the field passes. `role="alert"` on the message causes it to be announced immediately when it appears, without the user needing to navigate to it. A form that shows red text near a field with none of these three things attached is, to assistive technology, a form with no visible error at all.

## Practice

Build `contact-form.html`, a real contact/signup form, as a standalone page (or as a new `<section>` inside your running `roster.html`):

1. Wrap the whole thing in a `<form>` with a real `action` and `method`.
2. Add a text input for name and an `email`-typed input for email address, each with a properly connected `<label for>`.
3. Add a `<fieldset>` with a `<legend>` grouping at least two radio buttons for a preference of your choosing (for example, "Preferred contact method").
4. Add a `<select>` with a label, an empty default `<option>`, and at least two real options.
5. Add `required` to at least two fields, and add `aria-describedby` + `role="alert"` error text (statically present in markup, for this exercise) to one of them, as shown above.
6. Add a `<button type="submit">`.
7. Test it: unplug the mouse (or just don't touch it) and Tab from the top of the page through every field and the submit button, in order, confirming each one shows a visible focus outline and that clicking each `<label>` moves focus to its input.
