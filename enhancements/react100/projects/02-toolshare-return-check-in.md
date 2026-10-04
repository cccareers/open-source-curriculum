---
course_id: react100
project_id: react100-x02
title: "Toolshare Return Check-In Form"
kind: supplementary-project
status: draft
hours_estimate: 10
difficulty: core
related_lessons:
  - react100-06
  - react100-07
  - react100-08
objectives:
  - Build forms with controlled inputs
  - Load and display remote data from a component
  - Build interfaces that are accessible and responsive
competency_ids:
  - D2-S1-C04
  - D5-S1-C04
  - D6-S1-C01
---

## Scenario

Toolshare now has a small API, and tools come back to the library shed on Saturday mornings. Right now Priya, the volunteer on shed duty, writes returns on a clipboard: which tool, what day, and whether anything is broken. Owners only find out about damage when they next try to use the tool. The board wants a check-in form Priya can fill in on her phone, standing in the shed, often with one hand. It has to work with a screen reader, because one of the regular shed volunteers uses VoiceOver.

You are building that form as one component. It loads the list of tools that are currently out, collects the return details, validates them, and posts the return to the API.

## What you will build / produce

A `ReturnForm` component that:

- loads the tools currently checked out from `GET {apiBase}/tools?status=out`, with loading, error (with retry), empty, and success states;
- collects the tool, the return date, the condition, damage details (only when the condition is "Needs repair"), and an optional note, all as controlled inputs in one state object;
- validates on blur and on submit, with messages that say what to do, wired to fields with `aria-invalid` and `aria-describedby`;
- shows an error summary that receives focus on a failed submit;
- posts the return as JSON to `POST {apiBase}/returns`, with an in-flight state, a double-submit guard, a success message, and a failure message that keeps the member's answers;
- is single-column and comfortably tappable at 360 pixels, and reflows at 400 percent zoom;
- passes the supplied acceptance tests.

## Before you start (prerequisites, starter files or data)

- Lessons 06 to 08 completed.
- Node.js 20 or later.
- Use your project from `react100-x01`, or scaffold a fresh one, and set up Vitest exactly as described in that brief (`vitest`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, the `test` block in `vite.config.js`, and `src/test/setup.js`).
- An API. Your instructor will give you a base URL for the practice Toolshare API. If there is none, run a mock: any JSON mock server that serves `GET /api/tools?status=out` and accepts `POST /api/returns` will do. The automated tests do not need a server; they replace `fetch` with a fake.

### Data shapes

`GET {apiBase}/tools?status=out` returns:

```json
[
  { "id": "t-1", "name": "Cordless Drill", "borrower": "Marcus" },
  { "id": "t-3", "name": "Extension Ladder", "borrower": "Dana" }
]
```

`POST {apiBase}/returns` takes a JSON body with exactly these keys, and replies with any 2xx status on success:

```json
{
  "toolId": "t-1",
  "returnedOn": "2026-10-03",
  "condition": "good",
  "damageDetails": "",
  "notes": "Left the charger in the bag."
}
```

### The interface contract

The tests depend on these names, roles, and messages.

| Element | Requirement |
|---|---|
| Component | `src/components/ReturnForm.jsx`, default export `ReturnForm`, prop `apiBase` defaulting to `"/api"`. |
| Loading | `role="status"` reading `Loading tools that are out…` |
| Load error | `role="alert"` reading `We could not load the tools that are out.` and a `Try again` button that refetches. |
| Empty | `No tools are currently checked out.` |
| Tool | `<select>` labelled `Tool`, first option value `""`, then one option per tool with the tool's `id` as value and `name` as text. |
| Return date | `<input type="date">` labelled `Returned on`, initially today's date in the member's timezone. |
| Condition | `<fieldset>` with `<legend>Condition</legend>`, radios labelled `Good` (value `good`) and `Needs repair` (value `needs-repair`). None selected at first. |
| Damage | `<textarea>` labelled `What needs repair?`, rendered only when the condition is `needs-repair`, and cleared when it is hidden. |
| Notes | `<textarea>` labelled `Notes for the owner`, described by a hint reading `N of 500 characters used`. |
| Submit | `<button type="submit">` reading `Record return`, or `Recording…` and disabled while the request is in flight. |
| Field errors | Shown once the field is touched or a submit was attempted; attached with `aria-invalid="true"` and `aria-describedby`. |
| Error summary | On a failed submit, an element with `role="alert"` and `tabIndex={-1}` listing each message, which receives focus. |
| Success | `role="status"` reading `Return recorded for <tool name>.`; the form resets. |
| Submit failure | `role="alert"` reading `We could not record the return. Your answers are still here — try again.`; values are kept. |

Validation messages, exactly:

| Field | Rule | Message |
|---|---|---|
| `toolId` | required | `Choose the tool being returned.` |
| `returnedOn` | required | `Enter the return date.` |
| `returnedOn` | not after today | `The return date cannot be in the future.` |
| `condition` | required | `Choose the tool's condition.` |
| `damageDetails` | required when visible | `Describe what needs repair.` |
| `notes` | 500 characters or fewer | `Notes must be 500 characters or fewer.` |

## Milestones

1. **Load the list (2 hours).** One `useEffect` with an `AbortController` or `ignore` flag, a single `status` string, a `response.ok` check, and all four states. Add `Try again` by making the request depend on a `reloadCount` state you increment.
2. **Controlled fields (2 hours).** One `values` object, one `handleChange` keyed by `name`, a checkbox-safe branch even though you have no checkbox yet, and an initial object with a defined value for every field. Compute today's date as a local `"YYYY-MM-DD"` string (see lesson 06).
3. **Validation (2 hours).** A pure `validate(values)` outside the component. `touched` state, `submitAttempted` state, `showError` computed during render.
4. **Accessibility wiring (1.5 hours).** Labels, fieldset and legend, `aria-invalid`, `aria-describedby` (combine the hint and error ids for the notes field), the error summary with focus via `flushSync`.
5. **Submit (1.5 hours).** POST with JSON, in-flight state, guard at the top of the handler, success and failure branches.
6. **Responsive pass and tests (1 hour).** Check 360 pixels and 400 percent zoom, then run the tests.

## Acceptance criteria

- [ ] Every field is controlled with a defined initial value of the right type; the console shows no controlled/uncontrolled warnings.
- [ ] The load effect checks `response.ok`, uses one `status` value, and cannot write state after it is cleaned up.
- [ ] Loading, error-with-retry, empty, and loaded states all render distinct, actionable markup.
- [ ] Validation runs on blur and on submit; messages match the table; errors clear as soon as the field is fixed.
- [ ] Every field has a visible `<label>`; the radios are in a `<fieldset>` with a `<legend>`; no placeholder acts as a label.
- [ ] Errors are attached with `aria-invalid` and `aria-describedby`; the notes hint is attached with `aria-describedby`.
- [ ] A failed submit moves focus to the error summary.
- [ ] One click, a double click, or Enter twice produces exactly one POST.
- [ ] A failed POST keeps every value the member entered.
- [ ] At 360 pixels wide: one column, no horizontal scrolling, controls at least 44 pixels tall, `font: inherit` on controls.
- [ ] At 400 percent zoom: no clipping, overlap, or horizontal scrolling.
- [ ] Focus is visible on every control; the whole form can be completed by keyboard.
- [ ] All tests in `src/components/ReturnForm.test.jsx` pass.

## Automated checks (coding courses) / Evidence checklist (non-coding)

Save as `src/components/ReturnForm.test.jsx`, then run:

```bash
npx vitest run
```

```jsx
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, within, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReturnForm from "./ReturnForm.jsx";

const OUT_TOOLS = [
  { id: "t-1", name: "Cordless Drill", borrower: "Marcus" },
  { id: "t-3", name: "Extension Ladder", borrower: "Dana" },
];

const LIST_URL = "/api/tools?status=out";
const RETURNS_URL = "/api/returns";

function jsonResponse(body, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

function todayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

// Replaces fetch with a fake that answers by "METHOD url".
function mockFetch(handlers) {
  const fake = vi.fn((url, options = {}) => {
    const key = `${options.method ?? "GET"} ${url}`;
    const handler = handlers[key];
    if (!handler) return Promise.reject(new TypeError(`Unexpected request: ${key}`));
    return handler(options);
  });
  vi.stubGlobal("fetch", fake);
  return fake;
}

function postCalls(fake) {
  return fake.mock.calls.filter(([, options]) => options?.method === "POST");
}

async function renderLoaded(extraHandlers = {}) {
  const fake = mockFetch({
    [`GET ${LIST_URL}`]: async () => jsonResponse(OUT_TOOLS),
    ...extraHandlers,
  });
  render(<ReturnForm />);
  await screen.findByRole("combobox", { name: "Tool" });
  return fake;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("loading the tools that are out", () => {
  it("shows a loading status, then one option per tool", async () => {
    mockFetch({ [`GET ${LIST_URL}`]: async () => jsonResponse(OUT_TOOLS) });
    render(<ReturnForm />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading tools that are out…");
    const select = await screen.findByRole("combobox", { name: "Tool" });
    expect(within(select).getByRole("option", { name: "Cordless Drill" })).toHaveValue("t-1");
    expect(within(select).getByRole("option", { name: "Extension Ladder" })).toHaveValue("t-3");
  });

  it("treats an HTTP error as an error and lets the member retry", async () => {
    const user = userEvent.setup();
    let calls = 0;
    mockFetch({
      [`GET ${LIST_URL}`]: async () => {
        calls += 1;
        return calls === 1 ? jsonResponse({ message: "down" }, 500) : jsonResponse(OUT_TOOLS);
      },
    });
    render(<ReturnForm />);
    expect(await screen.findByRole("alert")).toHaveTextContent("We could not load the tools that are out.");
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByRole("combobox", { name: "Tool" })).toBeInTheDocument();
  });

  it("shows an empty state when nothing is checked out", async () => {
    mockFetch({ [`GET ${LIST_URL}`]: async () => jsonResponse([]) });
    render(<ReturnForm />);
    expect(await screen.findByText("No tools are currently checked out.")).toBeInTheDocument();
  });
});

describe("controlled fields and validation", () => {
  it("starts with today's date and no condition chosen", async () => {
    await renderLoaded();
    expect(screen.getByLabelText("Returned on")).toHaveValue(todayString());
    expect(screen.getByRole("radio", { name: "Good" })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: "Needs repair" })).not.toBeChecked();
    expect(screen.getByRole("group", { name: "Condition" })).toBeInTheDocument();
  });

  it("shows a field error only after the field is left", async () => {
    const user = userEvent.setup();
    await renderLoaded();
    expect(screen.queryByText("Choose the tool being returned.")).not.toBeInTheDocument();
    await user.click(screen.getByRole("combobox", { name: "Tool" }));
    await user.tab();
    const select = screen.getByRole("combobox", { name: "Tool" });
    expect(select).toHaveAttribute("aria-invalid", "true");
    expect(select).toHaveAccessibleDescription("Choose the tool being returned.");
  });

  it("rejects a future return date", async () => {
    await renderLoaded();
    const date = screen.getByLabelText("Returned on");
    fireEvent.change(date, { target: { value: "2999-01-01" } });
    fireEvent.blur(date);
    expect(date).toHaveAccessibleDescription("The return date cannot be in the future.");
  });

  it("blocks an empty submit, sends nothing, and focuses the error summary", async () => {
    const user = userEvent.setup();
    const fake = await renderLoaded();
    await user.click(screen.getByRole("button", { name: "Record return" }));
    const summary = screen.getByRole("alert");
    expect(summary).toHaveFocus();
    expect(summary).toHaveTextContent("Choose the tool being returned.");
    expect(summary).toHaveTextContent("Choose the tool's condition.");
    expect(postCalls(fake)).toHaveLength(0);
  });

  it("asks for damage details only when the tool needs repair, and clears them when hidden", async () => {
    const user = userEvent.setup();
    const fake = await renderLoaded({ [`POST ${RETURNS_URL}`]: async () => jsonResponse({ id: "r-9" }, 201) });
    await user.selectOptions(screen.getByRole("combobox", { name: "Tool" }), "t-1");
    expect(screen.queryByLabelText("What needs repair?")).not.toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "Needs repair" }));
    await user.type(screen.getByLabelText("What needs repair?"), "Chuck sticks");
    await user.click(screen.getByRole("radio", { name: "Good" }));
    expect(screen.queryByLabelText("What needs repair?")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Record return" }));
    await waitFor(() => expect(postCalls(fake)).toHaveLength(1));
    expect(JSON.parse(postCalls(fake)[0][1].body).damageDetails).toBe("");
  });

  it("requires damage details when the field is visible", async () => {
    const user = userEvent.setup();
    const fake = await renderLoaded();
    await user.selectOptions(screen.getByRole("combobox", { name: "Tool" }), "t-1");
    await user.click(screen.getByRole("radio", { name: "Needs repair" }));
    await user.click(screen.getByRole("button", { name: "Record return" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Describe what needs repair.");
    expect(postCalls(fake)).toHaveLength(0);
  });

  it("counts note characters and describes the field with the count", async () => {
    const user = userEvent.setup();
    await renderLoaded();
    const notes = screen.getByLabelText("Notes for the owner");
    await user.type(notes, "Hello");
    expect(screen.getByText("5 of 500 characters used")).toBeInTheDocument();
    expect(notes).toHaveAccessibleDescription(expect.stringContaining("5 of 500 characters used"));
  });
});

describe("submitting a return", () => {
  it("posts JSON once, shows an in-flight state, then confirms and resets", async () => {
    const user = userEvent.setup();
    let finish;
    const fake = await renderLoaded({
      [`POST ${RETURNS_URL}`]: () => new Promise((resolve) => { finish = resolve; }),
    });

    await user.selectOptions(screen.getByRole("combobox", { name: "Tool" }), "t-1");
    await user.click(screen.getByRole("radio", { name: "Good" }));
    await user.type(screen.getByLabelText("Notes for the owner"), "Left the charger in the bag.");

    const form = screen.getByRole("button", { name: "Record return" }).closest("form");
    fireEvent.submit(form);
    fireEvent.submit(form); // a second submit while the first is in flight

    const button = screen.getByRole("button", { name: "Recording…" });
    expect(button).toBeDisabled();
    expect(postCalls(fake)).toHaveLength(1);

    const [url, options] = postCalls(fake)[0];
    expect(url).toBe(RETURNS_URL);
    expect(options.headers).toMatchObject({ "Content-Type": "application/json" });
    expect(JSON.parse(options.body)).toEqual({
      toolId: "t-1",
      returnedOn: todayString(),
      condition: "good",
      damageDetails: "",
      notes: "Left the charger in the bag.",
    });

    finish(jsonResponse({ id: "r-10" }, 201));
    expect(await screen.findByRole("status")).toHaveTextContent("Return recorded for Cordless Drill.");
    expect(screen.getByRole("combobox", { name: "Tool" })).toHaveValue("");
    expect(screen.getByLabelText("Notes for the owner")).toHaveValue("");
  });

  it("keeps the member's answers when the server rejects the return", async () => {
    const user = userEvent.setup();
    await renderLoaded({ [`POST ${RETURNS_URL}`]: async () => jsonResponse({ message: "nope" }, 500) });
    await user.selectOptions(screen.getByRole("combobox", { name: "Tool" }), "t-3");
    await user.click(screen.getByRole("radio", { name: "Good" }));
    await user.click(screen.getByRole("button", { name: "Record return" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We could not record the return. Your answers are still here — try again."
    );
    expect(screen.getByRole("combobox", { name: "Tool" })).toHaveValue("t-3");
    expect(screen.getByRole("radio", { name: "Good" })).toBeChecked();
    expect(screen.getByRole("button", { name: "Record return" })).toBeEnabled();
  });
});
```

What the tests cannot check — record evidence for each in `A11Y.md`:

- [ ] Screenshot at 360 pixels wide, and at 400 percent zoom, showing no horizontal scrollbar.
- [ ] An axe DevTools or Lighthouse scan of the form in each state (loading, error, loaded, error summary showing), with no critical issues.
- [ ] A keyboard-only run: Tab order, arrow keys between radios, Enter to submit, focus visible at every stop.
- [ ] A screen-reader check (VoiceOver, NVDA, Narrator, or TalkBack): the field error is read when you focus the field, and the summary is announced when it appears.
- [ ] A contrast check of the error text and focus ring against their backgrounds (4.5:1 for text, 3:1 for the focus indicator).

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Controlled form | Mix of controlled and uncontrolled; several handlers duplicated | One state object, one `name`-driven handler, defined initial values | Dependent behavior (damage field) handled with no extra state, by calculation during render |
| Remote data | Missing `response.ok` check or a state branch; booleans that can contradict | Single `status`; all four states; cleanup prevents stale writes | Retry implemented by a dependency change rather than calling the effect's function directly; can explain why |
| Validation | Errors on every keystroke, or only on submit; vague messages | Blur and submit timing; messages match the table; clear as fixed | `validate` is pure and imported from its own file; edge cases (spaces only, exactly 500 characters) handled |
| Accessibility | Placeholder labels; errors not attached; focus lost on failure | Labels, fieldset, `aria-invalid`, `aria-describedby`, focused summary, visible focus | Evidence checklist complete with screen-reader notes and a written issue report for one defect found and fixed |
| Responsive | Fixed widths; horizontal scrolling on a phone | Single column at 360px; 44px targets; reflows at 400% | Breakpoints in `rem` chosen from content; submit button never covered by the on-screen keyboard |

## Stretch goals

- Save a draft of the form to `localStorage` while Priya types, and offer to restore it on reload.
- After a successful return, remove that tool from the select without refetching, then refetch in the background to confirm.
- Add an `eslint-plugin-jsx-a11y` run to `npm run lint` and fix what it reports.

## Reflection prompts

1. Where did you first put the "today" calculation, and what bug would a `new Date(value) > new Date()` comparison have caused for Priya on a Saturday morning?
2. Your load effect and your submit handler both talk to the server. Why is one an effect and the other not?
3. Which accessibility check found something the automated tests and the axe scan both missed?
4. If the board asks for a photo of the damage, what changes about your "every field is controlled" rule?

## Instructor notes (common pitfalls, how to adapt for time)

- **Suite verified.** On 2026-10-02 this suite was run against a reference implementation using React 19.3, Vitest 5.0.3, and jsdom, and every test passed. It also fails if the error summary is focused without `flushSync`, or if the submit handler has no in-flight guard. Pin versions in the starter if you need reproducible results.
- **Testing is not a react100 outcome.** As in `react100-x01`, the suite is an acceptance check learners run, not something they are assessed on writing.
- **Error summary focus fails on the first submit** if learners call `focus()` straight after setting state. The test "blocks an empty submit…" catches this. Point them to the `flushSync` pattern in lesson 06.
- **Two `role="alert"` elements at once.** If a learner leaves the load-error alert mounted, or renders the submit-failure alert alongside the summary, `getByRole("alert")` finds several and the tests fail. That is a real usability problem too: two interrupting announcements. Only one alert should be on screen at a time.
- **Double submit.** Disabling the button is not enough for `fireEvent.submit`; the handler needs `if (status === "submitting") return;`.
- **`aria-describedby` on the notes field** has to list both the hint id and, when shown, the error id, separated by a space. Learners often overwrite one with the other.
- **Short on time (6 hours):** drop the damage field and its two tests, and supply the load effect from lesson 07.
- **Extended (14 hours):** add the stretch goals and pair learners to run each other's screen-reader check.
