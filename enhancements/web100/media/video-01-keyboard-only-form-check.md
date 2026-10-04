---
course_id: web100
media_id: web100-v01
type: video-script
title: "The Keyboard-Only Form Check"
format: screencast
target_runtime: "6 min"
related_lessons:
  - web100-04
objectives:
  - Build form controls that are labelled, keyboard reachable, and straightforward to identify in a test
competency_ids:
  - D5-S1-C01
  - D5-S1-C02
---

## Purpose
After watching, the learner can run a keyboard-only pass on a form, recognise the three most common failures (unlabelled field, div-based control, disconnected error), and fix each in markup.

## Audience and prerequisites
web100 learners at lesson 04. Chrome or Firefox with DevTools; a keyboard.

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Browser showing a contact form: Name, Email, "Preferred contact method" radios, a "Role" dropdown, a blue "Send" box. | "This form looks finished. Let's test it the way a keyboard-only user, and most automated end-to-end tests, will experience it. Hands off the mouse." |
| 0:15 | Press Tab. Focus ring appears on Name. On-screen key overlay shows "Tab". | "Tab. Focus lands on the first field and I can see the outline. Good so far." |
| 0:25 | Tab again. Focus jumps past Email straight to the first radio. | "Tab again, and we skipped Email entirely. Let's find out why." |
| 0:35 | Open DevTools Elements, select the email field: `<div class="input" contenteditable>` with a grey "Email" span. | "The email 'field' is a `div` made editable, with a span pretending to be a placeholder. It isn't an input, so it isn't in the tab order, it isn't announced as a text field, and it won't submit with the form." |
| 1:05 | Edit HTML in DevTools to: `<label for="email">Email address</label>` `<input type="email" id="email" name="email" required />`. Reload a fixed copy. Tab: focus lands on Email. | "Fix: a real input with a real label. `for` matches `id`. Now it's in the tab order, it validates email format, and a test can find it with `getByLabelText('Email address')`." |
| 1:40 | Click the words "Email address". Cursor lands in the input. | "Quick check that the label is connected: click the label text. The cursor jumps into the field. If it doesn't, the `for` and `id` don't match." |
| 1:55 | Tab to the radios. Press arrow keys; selection moves between Email and Phone. | "Radios: Tab enters the group, arrow keys move between options. That's native behavior you get for free." |
| 2:10 | DevTools Accessibility pane on a radio: name "Email", role "radio", no group name. | "But the accessibility pane says this radio is just 'Email, radio'. Email what? The question 'Preferred contact method' is a heading sitting above the group, not connected to it." |
| 2:30 | Wrap in `<fieldset><legend>Preferred contact method</legend>…</fieldset>`. Accessibility pane now shows the group name. | "A `fieldset` with a `legend` gives the whole group its name. A visual heading can't do that; the connection has to be structural." |
| 2:55 | Tab to "Role" select; press Down arrow; options change. | "The dropdown is a native `select` with a label. Arrow keys work. Nothing to fix." |
| 3:05 | Tab. Focus goes to the browser address bar; the "Send" box was never focused. | "Tab again and we leave the page. We never reached Send." |
| 3:15 | Elements: `<div class="btn" onclick="send()">Send</div>`. | "Send is a `div` with a click handler. A mouse user would never know. A keyboard user can't submit this form at all. That's a high-severity defect." |
| 3:30 | Replace with `<button type="submit">Send</button>`. Tab reaches it; press Enter; the browser shows the native "Please fill out this field" bubble on Name. | "A real `button` of type submit: focusable, activates on Enter and Space, announced as a button, and it triggers the browser's built-in `required` validation." |
| 4:05 | Fill Name; type `not-an-email` in Email; press Enter. Native message about a missing "@". | "Because Email is `type="email"`, the browser blocks this submission too. That's validation you didn't have to write." |
| 4:25 | Show an error paragraph in the markup: `<p id="email-error" role="alert">Enter a valid email address.</p>` and add `aria-describedby="email-error" aria-invalid="true"` to the input. Accessibility pane shows the description on the input. | "For custom error messages, connect them: `aria-describedby` points at the message, `aria-invalid` marks the field as failing, `role="alert"` announces it when it appears. In web101 you'll add and remove these with JavaScript at the right moment." |
| 5:05 | Checklist slide: "Every field reached by Tab, in order" / "Visible focus outline" / "Label click focuses field" / "Groups have a legend" / "Submit with Enter" / "Errors connected". | "That's the keyboard pass. Run it on every form you test, and when something fails, report the exact element and the exact key you pressed." |
| 5:35 | Example defect title on screen: "Contact form: Send control is a div and cannot be reached or activated with the keyboard". | "Like this. One element, one behavior, one clear consequence." |

## On-screen assets and B-roll
- Broken and fixed versions of `contact-form.html` (div email, heading-only radio group, div button).
- Key-press overlay (for example, a keycast tool) so Tab, arrows, and Enter are visible.
- Checklist slide.

## Accessibility
- Key presses are both shown in an overlay and spoken ("Tab", "Down arrow").
- Focus outlines are made thicker in the demo stylesheet (3px, high contrast) so they are visible in compressed video.
- Captions and transcript; DevTools text zoomed to at least 150%.

## Check for understanding
1. Clicking a label does not move the cursor into its field. What do you check? *Answer: That the label's `for` exactly matches the input's `id` (and the id is unique).*
2. Why can't a heading above a set of radio buttons replace a `legend`? *Answer: The heading is not programmatically connected to the group, so the group has no accessible name.*
3. A "Send" control works with a mouse but not with Enter. Name the likely markup and the fix. *Answer: A `div` with an `onclick`; replace it with `<button type="submit">`.*
