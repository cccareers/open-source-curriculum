---
lesson_id: react100-02
course_id: react100
pathway: software-developer
title: Thinking in Components
order: 2
kind: lesson
competency_ids:
  - D5-S1-C02
objectives:
  - Break an interface into a tree of reusable components
---

## The problem components solve

Open any page you built before this course and count how many times the same block of markup appears. A card, a button, a form row, a nav item. Each copy started identical and then drifted, because you fixed a bug in one and not the other three. That drift is the single most reliable feature of hand-written HTML at scale, and it is not a discipline problem. It is a structure problem: nothing in the file says "these four blocks are the same thing."

React's answer is that an interface is not a document. It is a **tree of components**, where a component is a named, self-contained piece of the screen that owns its own markup. There is exactly one definition of a card. Every card on the page is that definition, rendered again. Fix it once and every card is fixed, because there was only ever one.

This lesson is entirely about the step before you write React: looking at a design and deciding what the pieces are. It is the least code-heavy lesson in the course and one of the two or three that most determines whether the rest of it goes well. A component tree that matches the shape of the problem makes the next six lessons feel obvious. A tree that fights the problem makes every one of them feel like a struggle with the library, when the struggle is actually with a decision you made in an hour like this one.

This is design work, and it is the kind you will do under supervision on a real team: someone hands you a mockup and a rough description, and you are expected to come back with the structure — what the parts are, what each one is responsible for, and how they nest — before anyone commits to building it. Doing that visibly and in writing is the competency this lesson is aimed at.

## A workspace to build in

You need something that runs. Modern React projects are built with Vite, a dev server and bundler that starts in under a second and reloads your changes as you save them. From a terminal, in whatever directory you keep coursework in:

```bash
npm create vite@latest toolshare -- --template react
cd toolshare
npm install
npm run dev
```

Open the URL it prints. You will see a starter page with a counter on it. Look at the tree it created:

```text
toolshare/
├── index.html          # the only HTML file; contains <div id="root"></div>
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx        # finds #root and renders <App /> into it
    ├── App.jsx         # the top of your component tree
    ├── App.css
    └── index.css
```

Two files are worth reading now and then leaving alone. `index.html` has a single empty `<div id="root">` — that is the entire HTML document your app ships, and everything a visitor sees is put inside it by JavaScript. `src/main.jsx` is the three lines that do it:

```jsx
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(<App />);
```

That is the seam between the browser and React. `createRoot` claims that div, and `render` puts your top component into it. From that line down, the structure is yours. Everything else in this lesson happens inside `src/`.

Delete the contents of `App.css` and replace `App.jsx` with something minimal so the starter content is out of your way:

```jsx
export default function App() {
  return <h1>Toolshare</h1>;
}
```

Save it. The browser updates without you reloading. That loop — save, look — is how you will work for the rest of the course.

## What a component is

A React component is a **JavaScript function that returns markup**. That is the whole definition:

```jsx
function ToolCard() {
  return (
    <article className="tool-card">
      <h3>Cordless Drill</h3>
      <p>18V, two batteries, charger included.</p>
      <span>Available</span>
    </article>
  );
}
```

Three rules make that function a component rather than an ordinary function, and all three are enforced:

**Its name starts with a capital letter.** `ToolCard`, not `toolCard`. This is not style — it is how React tells your components apart from HTML tags. Lowercase `<article>` means the HTML element; capitalized `<ToolCard>` means your function. Get it wrong and React will silently try to render an unknown HTML element and you will see nothing.

**It returns markup, or `null`.** That markup-looking syntax is JSX, and the next lesson takes it apart properly. For now, treat it as HTML with a couple of renames: `class` is `className`, and every tag must be closed.

**It returns one root element.** A function cannot return two adjacent tags any more than it can return two values. If you need siblings at the top level, wrap them in a fragment — `<>` and `</>` — which groups them without adding a real element to the page:

```jsx
function ToolMeta() {
  return (
    <>
      <span>Cordless Drill</span>
      <span>Available</span>
    </>
  );
}
```

You use a component by writing it as a tag. This nests `ToolCard` inside `App`:

```jsx
function ToolCard() {
  return (
    <article className="tool-card">
      <h3>Cordless Drill</h3>
    </article>
  );
}

export default function App() {
  return (
    <main>
      <h1>Toolshare</h1>
      <ToolCard />
      <ToolCard />
      <ToolCard />
    </main>
  );
}
```

Three identical cards from one definition. Right now they are literally identical because the text is baked in; making each one show a different tool is what props do, and props are lesson 03. Resist the urge to jump ahead. The skill being built here is deciding *what the boxes are*, and it is much easier to learn while the boxes are empty.

## Taking a design apart

Here is the method, and it is the same one a working developer uses on a real mockup. You will apply it to the Toolshare interface, which is the running example for the whole course: a neighborhood tool-lending library, where members browse tools, filter them, and request one.

Picture the browse screen. Along the top, a bar with the site name and a "My requests" link. Below it, a heading, a search box, and a row of category buttons. Then a grid of cards, each with a photo, a tool name, a short description, an owner name, and an availability badge. At the bottom, a footer with a couple of links.

**Step one: draw boxes around every visually distinct region.** Do it on the mockup itself, on paper or in whatever image tool you have. A box goes around anything that reads as a unit: the whole header, the whole filter bar, the grid, one card inside the grid, the badge inside that card. Boxes will end up inside other boxes. That nesting is the point — it is the tree, and you are just drawing it before you name it.

**Step two: apply the single-responsibility test to each box.** Ask what one job this piece has, and say it in one sentence with no "and" in it. "Shows one tool's summary." "Lets the member narrow the list by category." "Shows whether a tool is currently out." If your sentence needs an "and", you probably drew one box around two components. If two boxes get the same sentence, they are one component that appears twice.

**Step three: name each box.** Names are a real deliverable, not decoration, because a name is what the next person reads first. Good names describe the thing, not its position or its styling: `ToolCard`, not `MiddleBox`; `AvailabilityBadge`, not `GreenLabel`; `FilterBar`, not `TopSection2`. Positional names go stale the first time the design moves, and styling names go stale the first time a designer changes a color.

**Step four: arrange them into a hierarchy** by asking, for each component, "which box is this drawn inside?" That parent-child relationship is the tree.

For Toolshare, that process gives you roughly this:

```text
App
├── SiteHeader
│   └── NavLinks
├── BrowsePage
│   ├── PageHeading
│   ├── FilterBar
│   │   ├── SearchInput
│   │   └── CategoryButton   (one per category)
│   └── ToolGrid
│       └── ToolCard         (one per tool)
│           ├── ToolImage
│           ├── ToolSummary
│           └── AvailabilityBadge
└── SiteFooter
```

![A component tree for the Toolshare browse screen, showing App at the root with header, page, grid, and card components nested beneath it](./img/component-tree.png)

Read that tree back against the screen and check that it is honest. `ToolCard` appears once in the tree and many times on screen — that is normal and it is exactly the reuse you are after. `AvailabilityBadge` is separated from `ToolCard` because a badge is a small, self-contained thing with its own rules about what color it is, and because you can already guess it will show up on a detail screen later. `SearchInput` is its own component for the same reason.

There is no single correct tree, and you should stop looking for one. There are trees that make the next change easy and trees that make it hard, and you can only judge which is which by asking what changes are likely.

## How far to split

The most common beginner mistake is splitting too little: one 400-line component that renders the entire page, with three levels of nested markup and no name for anything inside it. The second most common is splitting too much: a `ToolCardTitle` component whose entire body is `<h3>` and a `Spacer` component that renders an empty div. Both are worse than the middle.

Four signals tell you to split a component out:

**It repeats.** The same markup appears in two places. This is the strongest signal there is, and it is nearly always right.

**Its name is obvious.** If you can name a region in one or two words without hesitating, it is a component. Hesitation usually means the region is not actually a thing.

**It has its own reason to change.** The availability badge changes when the lending rules change. The card layout changes when the designer revisits the grid. Different reasons, different components. This is the same instinct behind single responsibility anywhere else in software design.

**It is getting long.** Once a component's returned markup does not fit on a screen, it is doing too much and the nesting is hiding the structure.

Three signals tell you to leave it alone:

**It has exactly one caller and no name of its own.** A wrapper that exists only because you felt you should split something is pure overhead — one more file to open before you can read the code.

**Splitting it would separate things that always change together.** A card's image and its title are edited in the same breath. Prying them apart means two files open for every change.

**You are guessing at future reuse.** "We might need this elsewhere" is the reasoning behind most abstractions that never get reused and never get deleted. Build it once, concretely. When a second use appears, generalize then — you will know much more.

There is a real cost to a component that does not earn its keep, and it is paid by whoever reads the code next. Every extra hop is another file to open, another name to hold in your head, another indirection between the screen and the markup that made it. Structure is not free, so spend it where it buys something.

## From tree to code

Once the tree is drawn, turning it into a skeleton is mechanical. Give each component a file, and let the folder structure mirror the tree loosely:

```text
src/
├── main.jsx
├── App.jsx
└── components/
    ├── SiteHeader.jsx
    ├── SiteFooter.jsx
    ├── BrowsePage.jsx
    ├── FilterBar.jsx
    ├── SearchInput.jsx
    ├── CategoryButton.jsx
    ├── ToolGrid.jsx
    ├── ToolCard.jsx
    └── AvailabilityBadge.jsx
```

The conventions worth adopting now, because every React codebase you join will use most of them: one component per file; the file is named exactly like the component, in PascalCase; the component is the file's default export; the extension is `.jsx` for any file containing JSX.

Each file follows the same shape — import what it renders, define the function, export it:

```jsx
export default function AvailabilityBadge() {
  return <span className="badge badge--available">Available</span>;
}
```

```jsx
import ToolImage from "./ToolImage.jsx";
import ToolSummary from "./ToolSummary.jsx";
import AvailabilityBadge from "./AvailabilityBadge.jsx";

export default function ToolCard() {
  return (
    <article className="tool-card">
      <ToolImage />
      <ToolSummary />
      <AvailabilityBadge />
    </article>
  );
}
```

```jsx
import ToolCard from "./ToolCard.jsx";

export default function ToolGrid() {
  return (
    <div className="tool-grid">
      <ToolCard />
      <ToolCard />
      <ToolCard />
    </div>
  );
}
```

```jsx
import SiteHeader from "./components/SiteHeader.jsx";
import BrowsePage from "./components/BrowsePage.jsx";
import SiteFooter from "./components/SiteFooter.jsx";

export default function App() {
  return (
    <>
      <SiteHeader />
      <BrowsePage />
      <SiteFooter />
    </>
  );
}
```

Read `App.jsx` out loud: header, page, footer. That is what a good top-level component looks like — a table of contents, not an implementation. You should be able to open any file in this tree and understand what it does without opening a second one.

Notice how little is in each file. That is correct at this stage. The markup is hard-coded and every card is the same. What you have built is the *structure*, and the structure is the thing you can review, argue about, and change cheaply. Once data starts flowing through it in the next lesson, changing the shape of the tree gets more expensive.

One habit to build now: **render early and often.** Do not write nine files and then look. Write `SiteHeader`, render it inside `App`, look at the browser, then write the next one. When something disappears, the cause is in the last thing you typed, and finding it takes seconds instead of a hunt through nine files.

## A second pass: the request screen

One worked example is a demonstration; two is a method. Take a different screen and run the same four steps, because the second one is where you find out whether you learned the process or memorized the answer.

The Toolshare request screen: a back link, the tool's photo and name at the top, then the owner's name and a short "borrowing terms" paragraph, then a form with a pickup date, a return date, a note field and a submit button, and finally a panel listing the dates this tool is already spoken for.

Boxes and responsibilities, in one sentence each with no "and":

- `RequestPage` — arranges the whole request screen.
- `ToolHeader` — identifies which tool is being requested.
- `BorrowingTerms` — states the rules for borrowing this tool.
- `RequestForm` — collects the details of a borrowing request.
- `DateField` — collects one date.
- `NoteField` — collects free text from the member.
- `UnavailableDates` — shows when this tool is already booked.
- `DateRange` — shows one booked period.

Two decisions in that list are worth arguing about, and arguing about them is the exercise.

`DateField` appears twice on this screen — pickup and return — which is the repeat signal, so it is a component. But it is also *just a label and an input*, which is the "does not earn its keep" warning. The tiebreaker is that a date field on a real form is never only a label and an input: it has an error message, a hint about the format, an id linking the label to the input, and a required marker. That is four things you would otherwise duplicate and drift. So it stays.

`ToolHeader` shows a photo and a name, which is most of what `ToolCard` shows. Should it reuse `ToolCard`? Probably not. They look similar today and they have different reasons to change: a card is a target you click in a grid, and a header identifies the page you are already on. Forcing them together means the first design change adds a `variant` prop, and the second adds another. Similar markup is not the same thing as the same component — the test is whether they change for the same reason.

Notice also what did *not* become a component. The back link is one anchor tag and belongs to `RequestPage`. The submit button is one button and belongs to `RequestForm`. Neither repeats, neither has a name of its own, and wrapping either would add a file that says nothing.

## Reading a tree you did not draw

Most of your career is spent in codebases somebody else structured, and the same skill runs backwards. When you join a project, spend your first hour building the tree rather than reading files at random.

Start from the top: find `main.jsx`, follow it to the root component, and write down what that file renders. Then open each of those children and do the same, one level at a time, until you reach components that render only HTML. You will have the tree in twenty minutes, and you will know where to make a change instead of grepping for a piece of text and hoping.

React's devtools extension does the same job from the other direction. Its component panel shows the live tree with every component's name, and its inspector lets you click an element on the page and jump to the component that rendered it. When someone says "the badge on the browse page is wrong", that is how you find which of the four files to open. Install it before you need it.

Two things to notice while you read someone else's tree. Components that appear in many branches — a button, a field, a panel — are the project's shared vocabulary, and you should reuse them rather than writing a fifth variant. And a component with a name like `Wrapper`, `Container`, or `Section2` is usually a sign that whoever wrote it could not say what it was for, which is often exactly where the next bug lives.

## Structure that outlives the mockup

Two more things separate a tree that survives from one that gets rewritten in a month.

**Watch where the data lives, even before you have data.** Look at your tree and ask, for each piece of information on the screen, which component would naturally own it. A tool's name belongs to a card. But the search text belongs to something above both `FilterBar` and `ToolGrid`, because both need it — the filter shows what was typed, the grid shows the result. In this tree, that is `BrowsePage`. You are not writing that code yet; state is lesson 04. But noticing it now is what stops you from drawing a tree where the two components that must share a value are on separate branches with no common parent that makes sense. Sketching where data would live is part of the design step, and it is exactly the kind of thing a reviewer will ask you about.

**Separate layout components from content components.** `ToolGrid` decides how children are arranged; `ToolCard` decides what a tool looks like. Keeping that line clean means you can change the grid to a list without touching a card, and restyle a card without touching the grid. When a component both arranges things and knows what they are, every layout change becomes a content change too.

Finally, write the structure down. On a team, the artifact you hand back after an hour like this is not code — it is a labeled tree, a one-line responsibility for each component, and a short note on anything you deliberately did not split and why. That document is what a senior developer reviews before you build, and it is far cheaper to correct a diagram than a directory. It is also what makes the design reviewable at all: nobody can usefully critique "I'll figure out the components as I go."

## Practice

Work in the `toolshare` project you scaffolded above. Everything is static markup — no props, no state, no data.

1. **Sketch the screen.** On paper or in an image editor, draw the Toolshare browse screen described in this lesson: a site header with a nav link, a page heading, a search box, a row of three category buttons, a grid of six tool cards each with an image placeholder, a name, a one-line description, an owner name and an availability badge, and a footer.

2. **Box and name it.** Draw a box around every distinct region, write a one-sentence responsibility for each with no "and" in it, and give each a PascalCase name that describes the thing rather than its position or color. You should end with between eight and twelve components. If you have fewer than six or more than eighteen, revisit the split signals in this lesson.

3. **Draw the tree.** Produce a labeled hierarchy like the one in this lesson, as text or a diagram. Mark every component that appears more than once on screen.

4. **Build the skeleton.** Create one file per component under `src/components/`, each a default-exported function returning hard-coded markup, and assemble them so `App.jsx` reads as a table of contents. Render six `ToolCard`s in the grid and three `CategoryButton`s in the filter bar. Every card may show identical text — that is expected at this stage.

5. **Check it in the browser.** With `npm run dev` running, confirm the whole screen renders, then open React's browser devtools extension (or the Elements panel) and confirm the rendered tree matches the one you drew.

6. **Defend two decisions.** In a `STRUCTURE.md` file in the project, write a short paragraph on one component you split out and why, and one region you deliberately did *not* split and why. Reference the signals from this lesson by name.

7. **Make one thing break on purpose.** Rename `ToolCard` to `toolCard` in both its definition and its use, save, and look at the browser and console. Write down what you actually saw. Then put the capital back. This is a failure you will cause again, and the fastest way to recognize it later is to have seen it once deliberately.

8. **Take a change request.** A reviewer says availability should also appear in the site header as a count of tools currently out. Do not build it. Instead, write in `STRUCTURE.md` which components would need to change, whether your current tree makes that easy or hard, and what you would restructure if it is hard.

**Deliverable:** the `toolshare` project with a rendering static skeleton of at least eight components, plus `STRUCTURE.md` containing your labeled component tree, the one-line responsibility for each component, and your answers to steps 6 and 8.
