---
lesson_id: react100-06
course_id: react100
pathway: software-developer
title: Forms and Controlled Inputs
order: 6
kind: lesson
competency_ids:
  - D2-S1-C04
  - D5-S1-C04
objectives:
  - Build forms with controlled inputs
---

## Two sources of truth, and why you only want one

A form is where React's model meets a part of the browser that already has its own memory. A text input remembers what was typed whether you asked it to or not. A checkbox knows whether it is checked. A select knows which option is chosen. That memory lives in the DOM, and it is invisible to React.

So a form gives you two possible answers to "what did the user enter": the DOM's, and your state's. When those two disagree — and they will — you get bugs that are miserable to trace, because the screen shows one value and your code reads another.

The standard React answer is to eliminate the disagreement by making state the only source of truth. An input renders the value that state holds, and every keystroke updates state. The DOM stops being a place data lives and becomes a place data is displayed, exactly like every other element you render. That is a **controlled input**, and it is the pattern this lesson builds everything from.

This lesson also covers the accessibility rules that apply to forms, and it covers them here rather than in lesson 08 for a specific reason: forms are where inaccessible markup does the most damage. A decorative element with a missing label is a nuisance. A form field with a missing label is unusable, and it is the most common serious accessibility defect on the web. Building forms correctly the first time is much cheaper than auditing them later.

## The shape of a controlled input

```jsx
import { useState } from "react";

export default function SearchBox() {
  const [query, setQuery] = useState("");

  return (
    <input
      type="search"
      value={query}
      onChange={(event) => setQuery(event.target.value)}
    />
  );
}
```

Two props do all the work, and they are a matched pair.

`value={query}` tells the input what to display. It is not an initial value or a default — it is the value, on every render. If state says the text is "drill", the input shows "drill" no matter what the user did.

`onChange` fires on every keystroke — not on blur, as the native DOM `change` event does — and hands you an event whose `target` is the input element. `event.target.value` is always a **string**, including for `type="number"` and `type="date"`. If you need a number, convert at the boundary with `Number(...)` and decide what to do with the empty string, which converts to `0` and will surprise you.

Remove `onChange` and keep `value` and the field becomes read-only: every keystroke re-renders with the unchanged state value, so nothing you type appears. React warns about exactly this ("You provided a `value` prop to a form field without an `onChange` handler"), and it is the first form bug nearly everyone hits.

The mirror-image mistake is `value={undefined}`. Initialize text state to `""`, never to `undefined` or `null`, or React treats the field as uncontrolled at first and then switches when a value arrives, and warns that a component is "changing an uncontrolled input to be controlled." The fix is always the same: give every field a defined initial value of the right type — `""` for text, `false` for a checkbox, `[]` for a multi-select.

## Every input type you will need

The pattern varies slightly by element, and the variations are worth having in one place.

**Text, email, search, password, number, date, and every other text-like type** use `value` and `event.target.value`:

```jsx
<input
  type="email"
  value={email}
  onChange={(event) => setEmail(event.target.value)}
/>
```

**Textarea** uses `value` too. In HTML the content goes between the tags; in React it does not:

```jsx
<textarea
  value={notes}
  onChange={(event) => setNotes(event.target.value)}
  rows={4}
/>
```

**Select** also uses `value` on the element itself, not `selected` on an option:

```jsx
<select value={category} onChange={(event) => setCategory(event.target.value)}>
  <option value="">Choose a category</option>
  <option value="power">Power tools</option>
  <option value="garden">Garden</option>
  <option value="ladders">Ladders</option>
</select>
```

Give the placeholder option an empty `value` so "nothing selected" is a value your validation can test for.

**Checkbox** uses `checked` and `event.target.checked`, because its state is boolean:

```jsx
<input
  type="checkbox"
  checked={needsDelivery}
  onChange={(event) => setNeedsDelivery(event.target.checked)}
/>
```

Reading `event.target.value` on a checkbox gives you the string `"on"`, which is never what you want.

**A group of checkboxes** producing an array uses the immutable update patterns from lesson 04:

```jsx
function toggleDay(day, isChecked) {
  setDays((previous) =>
    isChecked ? [...previous, day] : previous.filter((d) => d !== day)
  );
}
```

**Radios** share a `name` and each compares its own value to the state:

```jsx
<input
  type="radio"
  name="pickup"
  value="porch"
  checked={pickup === "porch"}
  onChange={(event) => setPickup(event.target.value)}
/>
```

**File inputs cannot be controlled.** A file input's value is read-only for security reasons — no page may set which file you are uploading. Read `event.target.files` in the handler and store what you need in state. This is the one legitimate uncontrolled field in most forms.

## One handler for a whole form

A form with eight fields does not want eight `useState` calls and eight nearly identical handlers. Hold the fields in one object and let the input's `name` attribute select the key:

```jsx
import { useState } from "react";

const EMPTY_REQUEST = {
  toolId: "",
  memberName: "",
  email: "",
  pickupDate: "",
  notes: "",
  agreesToTerms: false,
};

export default function RequestForm({ tools, onSubmitRequest }) {
  const [values, setValues] = useState(EMPTY_REQUEST);

  function handleChange(event) {
    const { name, type, value, checked } = event.target;
    setValues((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  return (
    <form>
      <input name="memberName" value={values.memberName} onChange={handleChange} />
      <input name="email" type="email" value={values.email} onChange={handleChange} />
      <textarea name="notes" value={values.notes} onChange={handleChange} />
      <input
        name="agreesToTerms"
        type="checkbox"
        checked={values.agreesToTerms}
        onChange={handleChange}
      />
    </form>
  );
}
```

The computed key `[name]` is what makes one handler serve every field, and the `type === "checkbox"` branch is what makes it serve checkboxes too. Note that `name` here is doing real work and is not optional — a field with no `name` writes to `values[undefined]` and silently corrupts the object.

This is the point where the state-design rules from lesson 04 pay off. These fields change together, are submitted together, and are cleared together, so one object is right. Keep `errors` and `status` as separate state, because they change for different reasons.

## Submitting

A `<form>` element with an `onSubmit` handler is the correct container, and it is not optional. Wiring a bare `<button onClick={...}>` outside a form breaks pressing Enter in a text field, breaks browser autofill, and breaks the way assistive technology announces the group.

```jsx
function handleSubmit(event) {
  event.preventDefault();
  const nextErrors = validate(values);
  setErrors(nextErrors);
  if (Object.keys(nextErrors).length > 0) return;
  onSubmitRequest(values);
  setValues(EMPTY_REQUEST);
}
```

```jsx
<form onSubmit={handleSubmit} noValidate>
  {/* fields */}
  <button type="submit">Request this tool</button>
</form>
```

`event.preventDefault()` stops the browser's default submit, which would serialize the form and navigate the page — destroying your entire application state in the process. Forget it and your page appears to reload for no reason. It is the single most common mistake in React forms.

Three details in that markup. `type="submit"` on the button is what makes Enter work from any field; a button inside a form with no explicit type defaults to `submit`, but stating it removes all doubt, and any button in a form that is *not* submitting needs `type="button"` or it will submit. `noValidate` turns off the browser's own validation bubbles so your messages are the only ones — do this once you are handling validation yourself, so the user does not get two competing sets of errors. And the form never navigates; you call a function the parent passed down, exactly the "data down, actions up" pattern from lesson 04.

## Validation people can act on

Validation has three questions: what is invalid, when do you say so, and how do you say it.

**What.** Write a pure function that takes the values and returns an object of messages keyed by field name. Keeping it outside the component makes it readable and testable:

```jsx
// Today's date as "YYYY-MM-DD" in the member's own timezone.
function todayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function validate(values) {
  const errors = {};
  if (!values.memberName.trim()) {
    errors.memberName = "Enter your name.";
  }
  if (!values.email.includes("@")) {
    errors.email = "Enter an email address, including the @ sign.";
  }
  if (!values.pickupDate) {
    errors.pickupDate = "Choose a pickup date.";
  } else if (values.pickupDate < todayString()) {
    errors.pickupDate = "Choose a date that is not in the past.";
  }
  if (!values.agreesToTerms) {
    errors.agreesToTerms = "You must agree to the borrowing terms.";
  }
  return errors;
}
```

The date check compares two `"YYYY-MM-DD"` strings rather than two `Date` objects, and that is deliberate. A date input's value has no time or timezone. `new Date("2026-10-02")` reads it as midnight UTC, which in the Americas is the evening of the day before, and comparing that with `new Date()` (right now, including the time) rejects today as "in the past". Strings in this format sort in date order, so a plain `<` is both correct and simpler.

**When.** Validating on every keystroke tells someone their email is invalid while they are still typing the first letter, which is hostile. Validating only on submit means they fill in six fields before learning the second one was wrong. The pattern that works is: validate on submit for everything, and additionally validate a field once the user has *left* it, tracking which fields have been touched:

```jsx
const [touched, setTouched] = useState({});

function handleBlur(event) {
  setTouched((previous) => ({ ...previous, [event.target.name]: true }));
}
```

Then show a field's error only when `touched[name]` is true or a submit has been attempted. Once a field has an error showing, re-validating on change is welcome, because the message disappears as soon as it is fixed.

**How.** The message must say what is wrong and what to do. "Invalid input" fails both tests. "Enter an email address, including the @ sign" passes both. Never rely on color alone — a red border is invisible to a colorblind user and to a screen reader — and never put the message so far from the field that the connection is a guess.

## The markup that makes a form usable

This is where the accessibility competency lands. These rules are not extras; they are the difference between a form that works for everyone and one that works for people using a mouse and a good pair of eyes.

**Every field has a real label, associated by id.** Not a placeholder, not a paragraph above it, not an `aria-label` you added because you did not want a visible label. A `<label>` with `htmlFor` pointing at the input's `id` gives a screen reader something to announce, and it makes the label text a click target, which matters enormously on a phone.

```jsx
<label htmlFor="memberName">Your name</label>
<input id="memberName" name="memberName" value={values.memberName} onChange={handleChange} />
```

Remember `htmlFor`, not `for`. Ids must be unique on the page, so if a form component might render twice, generate a prefix with React's `useId` hook and build the ids from it.

**Placeholders are not labels.** A placeholder disappears the moment someone types, so it is useless as a reminder; it is low-contrast by default; and it is unreliably announced. Use it for an example of the format — "555-0143" — and never as the field's name.

**Wire errors to their field with `aria-describedby` and `aria-invalid`.** `showError` below is the rule from the validation section, computed during render: show the message once the field has been touched or a submit has been attempted, and only if there is a message to show.

```jsx
const showError = Boolean((touched.email || submitAttempted) && errors.email);
```

```jsx
<label htmlFor="email">Email address</label>
<input
  id="email"
  name="email"
  type="email"
  value={values.email}
  onChange={handleChange}
  onBlur={handleBlur}
  aria-invalid={showError ? true : undefined}
  aria-describedby={showError ? "email-error" : undefined}
/>
{showError && (
  <p className="field-error" id="email-error">
    {errors.email}
  </p>
)}
```

`aria-invalid` tells assistive technology the field is in an error state; `aria-describedby` makes the message part of what gets read when the field receives focus. Without them, a screen reader user tabs into a field, hears "Email address, edit text", and has no idea an error message is sitting underneath. Pass `undefined` rather than `false` when there is no error so the attribute is omitted entirely.

**Group related controls in a `<fieldset>` with a `<legend>`.** A set of radios has a question — "Where should the tool be picked up?" — and only the legend can carry it. Without it, each radio is announced with its own label and no context.

```jsx
<fieldset>
  <legend>Pickup method</legend>
  <label htmlFor="pickup-porch">Leave on the porch</label>
  <input id="pickup-porch" type="radio" name="pickup" value="porch"
    checked={values.pickup === "porch"} onChange={handleChange} />
  <label htmlFor="pickup-person">Hand off in person</label>
  <input id="pickup-person" type="radio" name="pickup" value="person"
    checked={values.pickup === "person"} onChange={handleChange} />
</fieldset>
```

**On a failed submit, tell the user in one place and move focus there.** A long form that fails validation below the fold looks like a button that did nothing. Render an error summary at the top of the form, listing each problem as a link to the field, and move focus to it on submit:

```jsx
import { useRef, useState } from "react";
import { flushSync } from "react-dom";

// inside RequestForm:
const summaryRef = useRef(null);
const [submitAttempted, setSubmitAttempted] = useState(false);

function handleSubmit(event) {
  event.preventDefault();
  const nextErrors = validate(values);
  flushSync(() => {
    setErrors(nextErrors);
    setSubmitAttempted(true);
  });
  if (Object.keys(nextErrors).length > 0) {
    summaryRef.current?.focus();
    return;
  }
  onSubmitRequest(values);
}
```

The `flushSync` wrapper matters. State updates normally wait until your handler finishes, so on the *first* failed submit the summary has not been rendered yet when you call `focus()`, `summaryRef.current` is still `null`, and nothing happens. `flushSync` tells React to apply those two updates and render immediately, so the summary exists in the DOM by the next line. Use it sparingly — it is for exactly this case, where you need the DOM updated before you touch it.

```jsx
{submitAttempted && Object.keys(errors).length > 0 && (
  <div className="error-summary" role="alert" tabIndex={-1} ref={summaryRef}>
    <h3>There are {Object.keys(errors).length} problems with this form</h3>
    <ul>
      {Object.entries(errors).map(([field, message]) => (
        <li key={field}>
          <a href={`#${field}`}>{message}</a>
        </li>
      ))}
    </ul>
  </div>
)}
```

`role="alert"` makes a screen reader announce the summary when it appears. `tabIndex={-1}` makes a non-interactive element focusable programmatically without adding it to the tab order. `useRef` gives you a stable handle on a DOM node — you have not met it before; it is a hook that returns a mutable box whose `.current` React fills in with the element when the `ref` prop is attached. That is all you need from it here.

**Use the right input types and autocomplete hints.** `type="email"` and `type="tel"` bring up the right keyboard on a phone. `autoComplete="email"`, `autoComplete="name"`, and `autoComplete="tel"` let a browser fill fields for someone who finds typing difficult. These are two attributes that cost nothing and measurably help.

**Everything must work from the keyboard.** Tab through your form from the top. Every field must be reachable in a sensible order, the focused element must be visibly outlined, the submit must fire from Enter, and nothing may trap focus. If you removed the focus outline in CSS because it looked untidy, put it back — `:focus-visible` lets you style it well without removing it.

## Fields that depend on each other

Controlled inputs pay off most when one field's behavior depends on another's value, because state already holds everything and the answer is an ordinary calculation during render.

**Conditional fields.** A "needs delivery" checkbox reveals an address field:

```jsx
{values.needsDelivery && (
  <div className="form-row">
    <label htmlFor="deliveryAddress">Delivery address</label>
    <textarea
      id="deliveryAddress"
      name="deliveryAddress"
      value={values.deliveryAddress}
      onChange={handleChange}
      rows={3}
    />
  </div>
)}
```

Two rules for conditional fields. Validate a hidden field only when it is visible, or you will block submission on an error nobody can see. And decide deliberately whether hiding it clears its value — usually yes, so a stale address is not submitted with a request that no longer needs delivery.

**Dependent options.** A second select whose options come from the first select's value is just a lookup during render:

```jsx
const SUBCATEGORIES = {
  power: ["Drills", "Saws", "Sanders"],
  garden: ["Mowers", "Trimmers", "Spreaders"],
  ladders: ["Step", "Extension"],
};

const options = SUBCATEGORIES[values.category] ?? [];
```

When the first select changes, the second's current value may no longer be valid, so clear it in the same update rather than leaving a value the user cannot see in the list.

**Cross-field validation.** Some rules involve two fields and belong in the same `validate` function, keyed to the field the user should fix:

```jsx
if (values.returnDate && values.pickupDate && values.returnDate < values.pickupDate) {
  errors.returnDate = "The return date must be on or after the pickup date.";
}
```

Attach the message to the field the person can act on. An error on the pickup date that says "these dates are inconsistent" leaves them guessing which one to change.

**Live derived feedback.** Because every keystroke updates state, anything computed from it is free: a character counter, a running total, a preview of the request summary.

```jsx
<p id="notes-hint" className="hint">
  {values.notes.length} of 500 characters used
</p>
```

Point the textarea's `aria-describedby` at that hint so the count is available to a screen reader user too, and use a soft limit — showing the overage — rather than silently truncating what someone typed. A field that discards characters without saying so is the kind of defect that reaches production because nobody tests past the limit.

This is the concrete argument for controlled inputs. Every one of these features is a one-line calculation when state holds the values, and a DOM query with a manual sync when it does not.

## Layout that survives a small screen

The responsive half of the accessibility competency is mostly about not fighting the browser.

Let fields be fluid rather than fixed: `width: 100%` on the input with a `max-width` on its container gives you a form that fits a 360-pixel phone and does not stretch absurdly on a monitor. Stack label above field on narrow screens and consider two columns only at a breakpoint where they genuinely fit:

```css
.form-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-block-end: 1rem;
}

.form-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}

@media (min-width: 40rem) {
  .form-grid {
    grid-template-columns: 1fr 1fr;
  }
}

input,
select,
textarea {
  width: 100%;
  font: inherit;
  min-height: 2.75rem;
}
```

Three specifics worth knowing. `font: inherit` on form controls is necessary because browsers give them a smaller default font, and on iOS an input with a font size under 16 pixels causes the page to zoom when it is focused. A minimum height around 44 pixels for anything tappable is the widely used touch-target guideline. And sizing breakpoints in `rem` rather than pixels means the layout responds to a user who has increased their default font size.

Never disable zoom, and never place a submit button where a mobile keyboard will cover it — a sticky footer button on a long form is a real improvement.

## Submitting state and double submits

Once a form talks to a server, a submit takes time, and a user who gets no feedback will click again. Track a status and disable while in flight:

```jsx
const [status, setStatus] = useState("idle"); // "idle" | "submitting" | "error" | "success"
```

```jsx
<button type="submit" disabled={status === "submitting"}>
  {status === "submitting" ? "Sending request…" : "Request this tool"}
</button>
```

Disabling the button is a courtesy, not a guarantee — check the status at the top of your handler and return early if a submit is already running. On success, decide deliberately whether to clear the form (right for "add another") or leave the values in place (right for "edit"). Clearing is `setValues(EMPTY_REQUEST)`, which is why the initial object is a named constant rather than an inline literal.

## Checking a form the way it will actually be used

A form that works when you fill it in correctly with a mouse has not been tested. Run this list before you call one done; it takes about ten minutes and it catches nearly everything.

**Submit it empty.** Every required field should report, the first error should be findable, and nothing should be sent.

**Submit it with one field wrong.** The message should name the fix, and correcting the field should clear it without another submit.

**Complete it using only the keyboard**, starting from the address bar. Tab reaches every control in a sensible order, focus is visible at every stop, arrow keys move between radios, Space toggles the checkbox, and Enter submits from a text field.

**Paste into every field.** Paste does not fire a key event, and a handler wired to `onKeyUp` instead of `onChange` will silently miss it. Controlled inputs get this right for free, which is one more reason to use them.

**Use the browser's autofill.** Autofill sets values without the events you expect. If your state does not update, your fields are missing `name` or `autoComplete` attributes.

**Type the pathological values.** An empty string of spaces in a required name field, a 400-character note, an email with no domain, a date in 1900, an emoji, a name with an apostrophe. Each of these has broken a real form.

**Double-click submit.** You should get one request, not two.

**Reload mid-fill.** Know what happens and whether that is acceptable for this form. For a long form, it usually is not, and a warning or a draft saved to storage is the answer.

**Check it at 360 pixels and at 200 percent zoom**, with the on-screen keyboard open if you can. The submit button must be reachable.

Write the list of what you checked into the pull request. A reviewer who can see what you verified reviews the code; one who cannot re-verifies everything by hand or, more often, does not.

## Uncontrolled inputs, briefly

The alternative is to let the DOM hold the value and read it only at submit time, with `defaultValue` instead of `value` and a ref to reach the element:

```jsx
const nameRef = useRef(null);

<input defaultValue="" ref={nameRef} />
```

It is less code for a form you never inspect between renders, and it is the right call for a file input, which cannot be controlled. It is the wrong call for anything with live validation, a character counter, a field that depends on another field, or a value you need to display elsewhere — which is most forms. Prefer controlled; know that uncontrolled exists so you recognize it in someone else's code.

Large applications reach for a form library once forms get big. Learn the mechanics by hand first: every library is a wrapper over exactly what this lesson describes, and you cannot debug the wrapper without knowing what it wraps.

## Practice

Continue in the `toolshare` project. Build a borrow-request form on the tool detail view.

1. **Build the fields.** Create `RequestForm` with a single state object holding `memberName`, `email`, `pickupDate`, `pickupMethod` (radio: porch or in person), `needsDelivery` (checkbox), `category` (select), `notes` (textarea), and `agreesToTerms` (checkbox). Use one `handleChange` driven by the `name` attribute, with a checkbox branch.

2. **Prove the read-only trap.** Remove `onChange` from one field, try to type, read the console warning, and record it in `STRUCTURE.md`. Restore it. Then initialize one field to `undefined`, type in it, read the "uncontrolled to controlled" warning, and record that too.

3. **Submit correctly.** Wrap everything in a `<form>` with `onSubmit`, call `preventDefault`, and log the values object. Then remove `preventDefault`, submit, and watch the page reload and your app state vanish. Put it back.

4. **Validate.** Write a pure `validate(values)` function outside the component covering: name required, email contains an `@`, pickup date required and not in the past, category chosen, and terms agreed. Show errors on submit and on blur per field, and clear each error as soon as it is fixed.

5. **Label everything.** Give every field a visible `<label>` with `htmlFor` matching the input's `id`. Then use only the keyboard and a browser's accessibility inspector to confirm each field announces its label. No placeholder may serve as a label.

6. **Wire up the error semantics.** Add `aria-invalid` and `aria-describedby` to every field that can show an error, with the message element carrying the matching id. Confirm in the accessibility inspector that the description is attached.

7. **Group the radios.** Put the pickup-method radios in a `<fieldset>` with a `<legend>`, and confirm the group's question is exposed alongside each option.

8. **Add an error summary.** Render a summary at the top of the form after a failed submit, with `role="alert"`, one entry per error, each linking to its field, and move focus to it on submit failure using a ref and `tabIndex={-1}`.

9. **Do a keyboard pass.** From the address bar, Tab through the entire form. Confirm the order is sensible, focus is always visible, radios move with arrow keys, and Enter submits from a text field. Fix anything that fails and list what you fixed.

10. **Make it responsive.** Style the form so it is single-column and comfortably tappable at 360 pixels wide, and two columns above a `rem`-based breakpoint. Set `font: inherit` and a minimum height on controls. Check both widths in the browser's device toolbar and at 200 percent browser zoom.

11. **Add a submitting state.** Introduce a `status` state, simulate a two-second submit with a timer, disable the button and change its label while submitting, and guard against a second submit. Confirm you cannot create two requests by clicking quickly.

12. **Compare uncontrolled.** Build a small second form with `defaultValue` and a ref that reads the value on submit. Write a paragraph in `STRUCTURE.md` on which approach you would choose for the request form and why, naming one thing the uncontrolled version cannot do.

**Deliverable:** a `toolshare` project with a fully controlled, validated, keyboard-operable request form that meets every labeling and error-association rule above and works at 360 pixels wide; plus the recorded warnings and written comparisons in `STRUCTURE.md`.

## Check your understanding

1. An input has `value={values.notes}` and no `onChange`. What happens when you type, and what does React warn?
2. A quantity field uses `type="number"`. What type is `event.target.value`, and what does `Number("")` return?
3. You forgot `event.preventDefault()` in `handleSubmit`. Describe what the member sees.
4. A screen reader user tabs into the email field and hears "Email address, edit text" even though an error is showing beneath it. Which two attributes are missing?
5. Why is the error summary focus wrapped in `flushSync`?

**Answers**

1. Nothing you type appears; the field is effectively read-only. React warns that you provided a `value` prop without an `onChange` handler.
2. A string. `Number("")` is `0`, so decide explicitly what an empty field means.
3. The browser submits the form natively and reloads the page, wiping all application state.
4. `aria-invalid` and `aria-describedby` pointing at the error message's `id`.
5. On the first failed submit the summary is not in the DOM until React renders. `flushSync` forces that render before `focus()` runs.
