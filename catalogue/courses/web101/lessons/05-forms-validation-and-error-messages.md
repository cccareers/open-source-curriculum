---
lesson_id: web101-05
course_id: web101
pathway: quality-assurance-software-engineer
title: Forms, Validation, and Error Messages
order: 5
kind: lesson
competency_ids:
  - D5-S1-C01
  - D5-S1-C02
objectives:
  - Validate form input and report errors to the user clearly
---

## Forms are where usability and correctness collide

A form is the single most common place a web page asks something of a user, and it is also the single most common place a page fails them: rejecting valid input, accepting invalid input, or accepting/rejecting silently with no explanation at all. Every one of those failure modes is testable, and every one of them is something you, as a QA engineer, will be asked to give concrete usability and functionality feedback on. This lesson connects two of your tagged competencies directly: writing the validation code (a functional concern), and judging whether the error message it produces actually helps the person who triggered it (a usability concern).

## Reading form values

```html
<form id="signup-form">
  <input type="email" id="email" name="email" />
  <input type="password" id="password" name="password" />
  <button type="submit">Sign up</button>
</form>
```

```js
const emailField = document.querySelector("#email");
emailField.value; // the current string in the field, always a string
```

Every form control's `.value` is a string, even `<input type="number">` — a numeric-looking field still hands you `"42"`, not `42`. Code that does math on a form value without converting it first (`Number(field.value)` or `parseInt`) is a real, common defect: `"42" + 1` produces `"421"`, not `43`, because `+` on a string concatenates.

## Built-in HTML validation vs. JavaScript validation

HTML itself provides some validation for free:

```html
<input type="email" required minlength="5" />
<input type="number" min="0" max="120" />
```

`required`, `minlength`/`maxlength`, `min`/`max`, and `type="email"` trigger the browser's native validation when the form is submitted, along with `field.checkValidity()` and `field.validity` in JavaScript if you want to inspect the result programmatically:

```js
const field = document.querySelector("#email");
field.checkValidity();       // boolean
field.validity.valueMissing; // true if required and empty
field.validity.typeMismatch; // true if type="email" and it isn't one
```

Native validation is a good first line of defense, but it is not sufficient on its own: its default error messages are generic, inconsistent across browsers, and impossible to style consistently, and it cannot express rules like "password and confirm-password must match." That's why most real applications layer custom JavaScript validation on top, usually after calling `event.preventDefault()` on submit to take control of the process.

## Writing validation logic

```js
function validateSignupForm(email, password, confirmPassword) {
  const errors = [];

  if (!email.includes("@")) {
    errors.push({ field: "email", message: "Enter a valid email address." });
  }

  if (password.length < 8) {
    errors.push({ field: "password", message: "Password must be at least 8 characters." });
  }

  if (password !== confirmPassword) {
    errors.push({ field: "confirmPassword", message: "Passwords do not match." });
  }

  return errors;
}
```

Notice this function returns a **list** of every problem found, not just the first one. That design choice matters for usability: a user who submits a form with three mistakes and only learns about one, fixes it, resubmits, and learns about the next one, has a measurably worse experience than a user shown all three at once. When you review validation code as a tester, "does it report every error or just the first" is a concrete, answerable question — not a matter of taste.

## Displaying errors so a user (and a screen reader) can find them

Validation logic that never reaches the screen is invisible to the person who needs it. A minimal, honest error-display pattern:

```js
function showErrors(errors) {
  // clear old errors first, including the attributes on fields that are now valid
  document.querySelectorAll(".field-error").forEach((el) => el.remove());
  document.querySelectorAll("[aria-invalid]").forEach((field) => {
    field.removeAttribute("aria-invalid");
    field.removeAttribute("aria-describedby");
  });

  for (const error of errors) {
    const field = document.querySelector(`#${error.field}`);
    const message = document.createElement("span");
    message.className = "field-error";
    message.id = `${error.field}-error`; // the id aria-describedby points at
    message.textContent = error.message;
    message.setAttribute("role", "alert");
    field.insertAdjacentElement("afterend", message);
    field.setAttribute("aria-invalid", "true");
    field.setAttribute("aria-describedby", `${error.field}-error`);
  }
}
```

A few details here are load-bearing, not decorative:

- **Clearing old errors first.** This means removing the old message elements *and* the `aria-invalid`/`aria-describedby` attributes on fields that have since been fixed; otherwise a screen reader keeps calling a corrected field invalid. A validation routine that only ever adds error messages and never removes stale ones will, after a few submit attempts, show contradictory or duplicated messages — a real bug you should specifically test for by submitting a form multiple times with different mistakes each time.
- **`role="alert"`** tells assistive technology to announce the new text immediately, without the user needing to navigate to it. An error message with no `role="alert"` and no visual proximity to its field is a usability defect even if the validation logic behind it is perfectly correct — functionality and accessibility are not the same axis, and a form can fail one while passing the other.
- **`aria-invalid` and `aria-describedby`** connect the field to its error message programmatically (which only works if the message really has the `id` that `aria-describedby` names; a mismatched id is a common, silent defect you can spot in the Elements panel), so a screen reader user gets the same information a sighted user gets from the red text next to the field.

## Testing a validation flow deliberately

A validation routine has a predictable shape, and predictable shapes have predictable test cases. For any validated field, deliberately try:

- the empty value
- the smallest valid value, and one character below it (boundary testing — you'll formalize this technique later in the pathway, but the instinct starts here)
- a value with leading/trailing whitespace only
- a value that's valid by the field's own rule but breaks a cross-field rule (e.g., a strong password that doesn't match confirm-password)
- submitting with the keyboard only (Enter inside the last field) as well as by clicking the submit button — these can trigger different code paths depending on how the form was built

## Practice

Build the signup form above (`email`, `password`, `confirmPassword`, a submit button) with plain HTML.

1. Implement `validateSignupForm` as shown, wire it to the form's `submit` event with `preventDefault()`, and call `showErrors()` with whatever it returns.
2. Submit the form five separate times, each with a different single mistake (empty email, invalid email, short password, mismatched confirmation, and finally all-valid input), and confirm the correct message appears — and disappears on the next attempt — each time.
3. Write down, in two or three sentences, one piece of **usability feedback** you would give the developer about this form as it stands (for example: does the user find out about a mismatched password before or after they've also fixed their email? Is an error message color-only, with nothing that would work for a colorblind user?). This is the kind of concrete, actionable feedback this lesson's tagged competency asks you to be able to give.

## Check your understanding

1. A quantity field holds `"2"` and the code computes `field.value + 1`. What is the result, and what is the fix?
2. A user fixes their email and resubmits, and the screen reader still says "invalid" on the email field. What did the code forget?
3. Why should `validateSignupForm` return all errors instead of the first one?

*Answers:* (1) `"21"`; convert first with `Number(field.value)`. (2) Clearing `aria-invalid` (and `aria-describedby`) from fields that now pass. (3) So the user can fix every problem in one round, instead of discovering them one submit at a time.
