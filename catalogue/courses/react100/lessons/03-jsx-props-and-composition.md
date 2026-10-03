---
lesson_id: react100-03
course_id: react100
pathway: software-developer
title: JSX, Props, and Composition
order: 3
kind: lesson
competency_ids:
  - D2-S1-C04
objectives:
  - Pass data through a component tree with props and composition
---

## JSX is JavaScript wearing a costume

The skeleton you built in the last lesson renders identical cards, because every value is typed into the markup. This lesson is about the two mechanisms that fix that: **props**, which let a parent hand data to a child, and **composition**, which lets a parent hand *markup* to a child. Between them they account for most of what makes a component reusable.

Before either one, you need an accurate picture of what JSX actually is, because most JSX confusion is really confusion about where JavaScript ends and markup begins.

JSX is not HTML and it is not a template language. It is a syntax extension that your build tool compiles into ordinary JavaScript function calls. This:

```jsx
const heading = <h1 className="page-title">Toolshare</h1>;
```

compiles to something equivalent to this:

```javascript
const heading = jsx("h1", { className: "page-title", children: "Toolshare" });
```

You never write that second form, but knowing it exists explains almost everything else. A JSX tag is a **function call that returns a plain object** describing what should be on screen. That object is a value like any other: you can put it in a variable, pass it to a function, return it, or store it in an array. It is not a DOM node and nothing has been rendered yet — it is a description that React will use later to decide what the real DOM should look like.

This is also why the capital letter matters. `jsx("h1", ...)` passes a *string* as the type, which means "the HTML element h1". `jsx(ToolCard, ...)` passes your *function*. The compiler decides which one to emit purely by looking at whether the first character is uppercase.

And it is why the attributes are named the way they are. Those attributes become keys in a plain JavaScript object, and JavaScript already uses `class` as a reserved word, so JSX uses `className`. The same logic gives you `htmlFor` instead of `for`. Multi-word DOM attributes are camelCased: `tabIndex`, `readOnly`, `maxLength`, `autoFocus`. The exceptions are attributes with a dash that are not DOM properties at all — `data-*` and `aria-*` keep their dashes, because they are passed straight through.

## The rules JSX enforces

Six rules cover essentially every syntax error you will hit in your first month.

**Every element must be closed.** `<img>` is a syntax error; `<img />` is correct. So are `<br />`, `<input />`, and `<hr />`. There are no void elements in JSX, only self-closing ones.

**A component returns exactly one root element.** A function returns one value, and JSX is a value. When you need siblings, wrap them in a fragment:

```jsx
function ToolSummary() {
  return (
    <>
      <h3>Cordless Drill</h3>
      <p>18V, two batteries, charger included.</p>
    </>
  );
}
```

A fragment groups without producing an element, so nothing extra appears in the DOM and your CSS grid does not gain a mystery child.

**Wrap multi-line JSX in parentheses after `return`.** JavaScript's automatic semicolon insertion will end a bare `return` on its own line and hand you `undefined`. The opening `(` on the same line as `return` prevents it. Make it a habit and you will never debug it.

**Braces mean "evaluate this JavaScript here."** Inside JSX, `{` opens an expression slot:

```jsx
const toolName = "Cordless Drill";
const batteries = 2;

function ToolSummary() {
  return (
    <div>
      <h3>{toolName}</h3>
      <p>Comes with {batteries} batteries.</p>
      <p>Uppercased: {toolName.toUpperCase()}</p>
      <p>Total items: {batteries + 1}</p>
    </div>
  );
}
```

It is an **expression** slot, not a statement slot. Something that produces a value goes in; `if`, `for`, and `const` do not. If you need a statement, put it above the `return` where you are in ordinary JavaScript.

**Attributes take either a string literal or a brace expression:**

```jsx
<img className="tool-photo" src={photoUrl} alt={toolName} width={320} />
```

`width={320}` passes the number `320`; `width="320"` passes the string `"320"`. Most of the time it makes no visible difference, and occasionally it makes all the difference, so pass the type you mean.

**Comments inside JSX go in braces:** `{/* like this */}`. A bare `//` inside markup will render as text.

Two things JSX does *not* do that people expect. It does not let you write raw HTML — a string containing `<b>` renders as the literal characters `<b>`, not as bold text. That is the escaping guarantee, and it is the reason React apps are not riddled with injection holes: every value you interpolate is treated as text. There is an escape hatch for the rare case where you genuinely have trusted HTML, and it is deliberately named `dangerouslySetInnerHTML` so that nobody uses it by accident. You will not need it in this course.

And it does not give you a way to style with strings. `style` takes an object with camelCased properties: `style={{ marginTop: 8 }}`. Note the doubled braces — the outer pair is the expression slot, the inner pair is the object literal. Prefer a CSS class in almost every case; inline styles are for values computed at runtime.

## What actually renders

Because braces accept any expression, it helps to know exactly what React does with each type of value it finds there. This table is short and it explains a surprising number of "why is nothing showing up" mornings.

- **Strings and numbers** render as text. `{0}` renders a visible zero.
- **`null` and `undefined`** render nothing at all — no element, no whitespace.
- **`true` and `false`** render nothing. This is deliberate and it is what makes several patterns in the next lesson work.
- **Arrays** render each element in order, with no separator. `{[a, b, c]}` is legal.
- **JSX elements** render as themselves.
- **Plain objects** throw. "Objects are not valid as a React child" means you wrote `{tool}` where you meant `{tool.name}`, and it is the most common runtime error a beginner sees.
- **Functions** also throw. Usually you meant to call one, or you passed a component where you meant to render it.

Two consequences worth internalizing now. A value that is legitimately `undefined` — a missing prop — disappears silently rather than erroring, which is why a misspelled prop produces a blank space instead of a message. And because whitespace between elements is collapsed the way it is in HTML, `{" "}` is the idiom for forcing a space between two elements that would otherwise sit flush against each other across a line break.

## Props: passing data down

A prop is an argument to a component. You write it like an HTML attribute, and it arrives as a property on the single object the function receives:

```jsx
function AvailabilityBadge(props) {
  return <span className="badge">{props.status}</span>;
}
```

```jsx
<AvailabilityBadge status="Available" />
```

That object is conventionally called `props`, and reaching through it repeatedly gets noisy fast. Destructure it in the parameter list instead — this is what you will see in essentially every professional codebase:

```jsx
function AvailabilityBadge({ status }) {
  return <span className="badge">{status}</span>;
}
```

Default values come from ordinary JavaScript default parameters:

```jsx
function AvailabilityBadge({ status = "Unknown" }) {
  return <span className="badge">{status}</span>;
}
```

Now the card can take real data. Here is `ToolCard` rewritten to accept props, and `ToolGrid` supplying three different tools:

```jsx
import AvailabilityBadge from "./AvailabilityBadge.jsx";

export default function ToolCard({ name, description, owner, photoUrl, status }) {
  return (
    <article className="tool-card">
      <img className="tool-card__photo" src={photoUrl} alt={name} />
      <h3 className="tool-card__name">{name}</h3>
      <p className="tool-card__description">{description}</p>
      <p className="tool-card__owner">Shared by {owner}</p>
      <AvailabilityBadge status={status} />
    </article>
  );
}
```

```jsx
import ToolCard from "./ToolCard.jsx";

export default function ToolGrid() {
  return (
    <div className="tool-grid">
      <ToolCard
        name="Cordless Drill"
        description="18V, two batteries, charger included."
        owner="Dana"
        photoUrl="/photos/drill.jpg"
        status="Available"
      />
      <ToolCard
        name="Wet/Dry Vacuum"
        description="Six gallon, with hose attachments."
        owner="Marcus"
        photoUrl="/photos/vacuum.jpg"
        status="Out until Friday"
      />
      <ToolCard
        name="Extension Ladder"
        description="Twenty-four foot, aluminum."
        owner="Priya"
        photoUrl="/photos/ladder.jpg"
        status="Available"
      />
    </div>
  );
}
```

One definition, three tools. That is the payoff for last lesson's structural work: because the card was already its own component with a clear responsibility, making it data-driven was a fifteen-minute change.

Writing out three cards by hand is obviously not how you would render a list of two hundred tools; driving that from an array is the next lesson's subject. Keep them explicit for now — it keeps the focus on how the data arrives rather than on how the loop works.

## Props are not just strings

Anything a JavaScript variable can hold, a prop can hold — you just need braces:

```jsx
<ToolCard
  name="Cordless Drill"
  batteryCount={2}
  isAvailable={true}
  tags={["power", "diy"]}
  owner={{ name: "Dana", phone: "555-0143" }}
/>
```

Three shorthands are worth knowing. A boolean prop with no value is `true`, so `<ToolCard isAvailable />` and `<ToolCard isAvailable={true} />` are identical, and the bare form is idiomatic. When an object's property names already match the prop names a component expects, the spread syntax passes every property as its own prop: `<ToolCard {...tool} />` is the same as writing `name={tool.name} description={tool.description}` and so on for every key in `tool`, including ones the component does not use. And nothing stops you from passing a whole object:

```jsx
<ToolCard tool={tool} />
```

```jsx
export default function ToolCard({ tool }) {
  return (
    <article className="tool-card">
      <h3>{tool.name}</h3>
      <p>{tool.description}</p>
    </article>
  );
}
```

Which of those two shapes should you use — one `tool` object, or five separate props? The trade-off is real, so decide it deliberately. Separate props state the component's requirements precisely: reading the signature tells you it needs a name, a description, and an owner, and nothing else. That makes the component reusable with data that is not shaped like your API's tool record. A single object prop is far less typing and survives a new field being added, but it couples the component to that record's shape and hides what it actually reads.

A reasonable rule: pass individual props when the component is a general-purpose piece of UI, and pass the object when the component is explicitly about that domain entity and reads most of its fields. `AvailabilityBadge` takes a `status` string. `ToolCard` taking a `tool` object is defensible. What you should not do is take an object and then pass its fields down individually to seven children, then take those fields and rebuild an object — pick a level and stay at it.

**Props are read-only.** This is a rule, not a style preference, and it is the foundation of everything else. React enforces part of it for you — in development it freezes the props object, so `props.name = "x"` throws an error — but it cannot stop you from reassigning a destructured variable or reaching inside an object prop and changing a field. Those two are on you:

```jsx
function ToolCard({ name }) {
  name = name.toUpperCase(); // legal but pointless: nothing above you sees it
  return <h3>{name}</h3>;
}
```

Reassigning the local variable does nothing to the parent, and mutating an object prop — `tool.status = "Out"` — is worse, because it changes data the parent owns without the parent knowing, and React will not re-render anything. Data flows **one way**: down. A parent gives a child values; a child never reaches back up to change them. When a child needs to cause a change, the parent passes down a function for the child to call, and lesson 04 covers that in full. The important part now is the discipline: derive from props, never write to them.

## Composition: passing markup, not just data

Props solve "this card needs a different name." They solve "this panel needs different contents" badly. If you try, you end up here:

```jsx
<Panel
  title="Filters"
  showSearch={true}
  searchPlaceholder="Search tools"
  showCategories={true}
  categoryStyle="pills"
  footerText="Reset all"
/>
```

Every new requirement adds a prop, every prop adds a branch inside `Panel`, and after six months nobody can say what `Panel` renders without reading all of it. This is configuration, and it does not scale.

Composition is the alternative. Whatever you put *between* a component's opening and closing tags arrives as a prop named `children`:

```jsx
export default function Panel({ title, children }) {
  return (
    <section className="panel">
      <h2 className="panel__title">{title}</h2>
      <div className="panel__body">{children}</div>
    </section>
  );
}
```

```jsx
<Panel title="Filters">
  <SearchInput />
  <CategoryButton label="Power tools" />
  <CategoryButton label="Garden" />
</Panel>
```

`Panel` now owns the frame — the border, the heading, the padding — and knows nothing about filters. Put a photo gallery inside it tomorrow and `Panel` does not change. This is the difference between a component that gets more complicated with every use and one that gets more valuable with every use.

`children` is an ordinary prop with special syntax, and it can hold anything: a string, one element, several elements, or nothing at all.

When a component has more than one hole to fill, pass elements as named props. This is often called a **slot**:

```jsx
export default function PageLayout({ header, sidebar, children }) {
  return (
    <div className="page-layout">
      <header className="page-layout__header">{header}</header>
      <aside className="page-layout__sidebar">{sidebar}</aside>
      <main className="page-layout__main">{children}</main>
    </div>
  );
}
```

```jsx
<PageLayout
  header={<SiteHeader />}
  sidebar={<FilterBar />}
>
  <ToolGrid />
</PageLayout>
```

Note that `<SiteHeader />` in a prop position is just a value — the object JSX compiles to. Elements are data, and being able to pass them around is what makes layouts like this possible.

The third composition pattern is **specialization**: a specific component built by wrapping a general one, rather than by adding a mode flag to it.

```jsx
export default function WarningPanel({ children }) {
  return (
    <Panel title="Heads up">
      <div className="panel--warning">{children}</div>
    </Panel>
  );
}
```

`Panel` gained no props and no branches. When you catch yourself adding a `variant` or `type` prop that switches large chunks of markup, ask whether two components wrapping one shared component would be clearer. Often it is.

## Passing props through, and how far

Sometimes a component's job is to add a little and forward the rest. The spread operator does that:

```jsx
export default function IconButton({ icon, ...rest }) {
  return (
    <button className="icon-button" {...rest}>
      <span className="icon-button__icon">{icon}</span>
    </button>
  );
}
```

```jsx
<IconButton icon="＋" type="submit" aria-label="Add a tool" />
```

`type` and `aria-label` land on the real `<button>` without `IconButton` naming them. This is genuinely useful for thin wrappers around HTML elements, where you cannot enumerate every attribute a caller might need. Use it sparingly anywhere else: `{...props}` scattered through a tree makes it impossible to tell where a value came from, and "just spread everything" is how components end up accepting props nobody knows about.

The other thing you will run into is **prop drilling**: `App` has the member's name, `SiteHeader` needs it, and it travels through three components that do not care. Two honest points about it. First, some drilling is fine — two or three levels of explicit passing is readable and easy to trace, and every alternative costs something. Second, when it becomes genuinely painful, composition usually fixes it before any tool needs to: if the middle component takes `children` instead of taking a prop it only forwards, the value can be passed straight from the component that has it to the component that needs it, skipping the middle entirely. React does have a dedicated mechanism for values many components need at once, and it belongs to react200 along with routing and shared state. Reach for structure first.

## A worked example: a reusable field

Nothing so far has combined props and composition on one component, and that combination is where the design decisions get interesting. Here is a `Field` — the label-plus-input-plus-hint-plus-error unit that every form on every project needs, and the one that beginners most often copy and paste eight times.

The naive version takes a prop for everything:

```jsx
function Field({ label, name, type, value, placeholder, hint, error, required }) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} value={value} placeholder={placeholder} />
      <p className="field__hint">{hint}</p>
      <p className="field__error">{error}</p>
    </div>
  );
}
```

That works until the day someone needs a `<textarea>`, or a select, or a checkbox that puts its label on the right. Then you add a `kind` prop and a branch, and then another, and `Field` slowly becomes the component nobody wants to open.

The composed version splits the responsibility. `Field` owns the *frame* — the label, the hint, the error, the ids that connect them — and the caller supplies the control:

```jsx
/**
 * A labelled form control frame.
 * id (string, required) — must match the control's id
 * label (string, required)
 * hint (string, optional), error (string, optional)
 * children (element, required) — the control itself
 */
export default function Field({ id, label, hint, error, children }) {
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>{label}</label>
      {children}
      <p className="field__hint" id={`${id}-hint`}>{hint}</p>
      <p className="field__error" id={`${id}-error`}>{error}</p>
    </div>
  );
}
```

```jsx
<Field id="pickupDate" label="Pickup date" hint="We deliver on weekdays only.">
  <input id="pickupDate" name="pickupDate" type="date" />
</Field>

<Field id="notes" label="Note for the owner">
  <textarea id="notes" name="notes" rows={4} />
</Field>
```

`Field` gained no branches and now supports every control that exists, including ones nobody has invented yet. That is the general shape of the trade: **props for the values that vary, composition for the parts that vary.** When you notice a prop whose only job is to select between two blocks of markup, that prop wants to be `children`.

Two things in that example are worth copying. The `id` is passed explicitly rather than derived from the label text, because ids must be unique and stable and label text is neither. And the hint and error elements carry ids built from it, so that a caller can point the control's `aria-describedby` at them — the accessibility wiring that lesson 06 builds on. Designing a component so the correct accessible markup is the easy path is a large part of what makes a shared component worth having.

## Stating a component's interface

A component's props are its public interface, and the next developer reads it the way you read a function signature. Three habits keep that interface honest.

**Destructure every prop in the parameter list.** `function ToolCard({ name, owner, status })` is a contract; `function ToolCard(props)` with `props.name` buried forty lines down is a scavenger hunt.

**Name props for meaning, not implementation.** `status` beats `s`; `isAvailable` beats `flag`; `onRetry` beats `fn`. Boolean props read best with an `is`, `has`, or `can` prefix.

**Write down what is required and what has a default.** A short comment above the component listing each prop, its type, and whether it is optional costs three lines and prevents the most common integration bug there is:

```jsx
/**
 * One tool's summary card.
 * name (string, required), description (string, required),
 * owner (string, required), photoUrl (string, optional),
 * status (string, defaults to "Unknown").
 */
export default function ToolCard({ name, description, owner, photoUrl, status = "Unknown" }) {
  // ...
}
```

Larger codebases enforce this with TypeScript or a runtime prop-type checker. Neither is in scope here, and neither replaces the habit of knowing what your component requires before you ship it.

One last debugging note, because you will hit this in the first hour of the lab. When a value does not appear on screen, check three things in order: is the prop spelled the same in both places (`photoURL` in the parent and `photoUrl` in the child is silently `undefined`), did you actually destructure the name you are using, and is the value what you think it is. React's devtools extension shows you every component's live props in a panel, which answers all three faster than a `console.log` — install it now and use it every time instead of guessing.

## The errors you will actually see

Six messages account for most of a beginner's first weeks with JSX and props. Learning to read them is faster than learning to avoid them.

**"Adjacent JSX elements must be wrapped in an enclosing tag."** You returned two sibling elements. Wrap them in a fragment.

**"Objects are not valid as a React child."** You interpolated an object. The message usually names the keys it found, which tells you exactly which object it was — `{tool}` where you meant `{tool.name}`.

**"Unexpected token" pointing at a line that looks fine.** Nearly always an unbalanced brace a few lines above, or a missing `/` on a self-closing tag. Read upward from the reported line, not at it.

**Nothing renders, no error.** Three usual causes: a component name in lowercase, so React rendered an unknown HTML element; a `return` on its own line with the JSX below it; or a value of `undefined` in the braces.

**"Warning: Each child in a list should have a unique key prop."** Lesson 05's subject, and it means what it says.

**"Warning: Invalid DOM property `class`. Did you mean `className`?"** React telling you politely that it knows what you meant and did not do it. The same warning appears for `for`.

When none of those apply, the fastest tool is the devtools component panel: find the component, read its actual props, and compare them to what you believe you passed. Most props bugs stop being mysterious the moment you can see the real values instead of the intended ones.

## Practice

Continue in the `toolshare` project. Still no state and no events; everything is data flowing down.

1. **Make the card data-driven.** Rewrite `ToolCard` to accept `name`, `description`, `owner`, `photoUrl`, and `status` as props, and render three different tools from `ToolGrid` by writing three `ToolCard` elements with different values. Do not use an array or a loop yet.

2. **Give the badge a default.** Rewrite `AvailabilityBadge` to take a `status` prop that defaults to `"Unknown"`, and render one card with no `status` passed to prove the default works.

3. **Pass non-string props.** Add a `batteryCount` number prop and a `isPowerTool` boolean to at least one card, using the bare-attribute shorthand for the boolean, and render the battery count in the card's markup. Then pass `batteryCount="2"` as a string instead and add `{typeof batteryCount}` to the markup to see the difference. Note what you saw, then put the number back.

4. **Build a `Panel` component** that takes `title` and `children` and renders a titled frame. Use it to wrap your `FilterBar` contents, and use it a second time somewhere else with completely different children, to prove it did not need to know what is inside.

5. **Build a `PageLayout` component** that takes a `header` element prop, a `sidebar` element prop, and `children`, and restructure `App.jsx` to use it. `App.jsx` should now read as a layout with three things plugged into it.

6. **Specialize instead of configuring.** Write a `WarningPanel` that reuses `Panel` without adding any prop to `Panel`, and render one on the page reading "Some tools require a deposit."

7. **Break one-way data flow on purpose.** Inside `ToolCard`, assign to a prop (`name = "Changed"`), save, and observe that the parent's data is unaffected. Then try mutating an object prop's field and confirm nothing on screen updates. Write two sentences in `STRUCTURE.md` on why React can get away with not noticing.

8. **Compare the two prop shapes.** Add a second card component, `ToolCardCompact`, that takes a single `tool` object prop instead of five separate ones. Render both on the page from the same data. In `STRUCTURE.md`, write a short paragraph on which shape you would choose for this component and why, referencing the trade-off in this lesson.

9. **Document the interfaces.** Add a comment block above `ToolCard`, `AvailabilityBadge`, and `Panel` listing each prop, its type, and whether it is required or has a default.

10. **Find a bug with devtools.** Deliberately misspell one prop name in the parent only, then use the React devtools component panel — not `console.log` — to locate the component receiving `undefined`. Write down the two-step path you took to find it.

**Deliverable:** a `toolshare` project rendering three distinct tool cards from props, with a reusable `Panel`, a `PageLayout` using element props, and a `WarningPanel` specialization; plus documented prop interfaces and your written answers to steps 7, 8, and 10 in `STRUCTURE.md`.

## Check your understanding

1. What is the difference between `<ToolCard batteryCount="2" />` and `<ToolCard batteryCount={2} />` inside the component?
2. A card shows a blank space where the owner's name should be, and there is no error. Name the three things this lesson says to check, in order.
3. Someone proposes adding `showSearch`, `showCategories`, and `footerText` props to `Panel`. What would you suggest instead, and why?
4. `{tool}` inside a `<p>` crashes the page. What does the error say, and what did the author probably mean to write?

**Answers**

1. The first passes the string `"2"`; the second passes the number `2`. `typeof batteryCount` tells them apart.
2. Is the prop spelled the same in parent and child, did you destructure the name you are using, and is the value what you think it is. The devtools component panel answers all three.
3. Use composition: let `Panel` take `children` so the caller supplies the contents. Every configuration prop adds a branch inside `Panel`; `children` adds none.
4. "Objects are not valid as a React child." They meant a field such as `{tool.name}`.
