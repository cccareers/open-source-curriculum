---
lesson_id: ops200-02
course_id: ops200
pathway: software-developer
title: Build Artifacts and Asset Pipelines
order: 2
kind: lesson
competency_ids:
  - D2-S1-C03
objectives:
  - Produce the build artifacts and assets a website deploys
---

## Source is not the deliverable

When you run a React app locally you type `npm run dev`, a development server starts, and a browser tab shows your work. It is easy to conclude that the thing you deploy is the thing you have been running. It is not, and the difference is the subject of this lesson.

The development server is a piece of software that reads your source files on demand, rewrites them just enough for a browser to understand, and holds a websocket open so that saving a file updates the page. It is optimized for one user — you — on a fast local disk. It ships un-minified code, it recompiles constantly, and it exists only while your terminal is open.

What you deploy is an **artifact**: a directory of finished files, produced once, that a web server can hand to anyone with no build tooling present at all. Nothing in it is compiled on demand. It has no dependency on your laptop, your `node_modules`, or your editor. If you can copy it to a USB stick, hand it to someone, and have it work, it is an artifact. If it needs your source tree to run, it is not.

Getting this distinction right early saves you from the two most common deployment failures a new developer causes. The first is deploying the source tree and wondering why the browser cannot load a `.jsx` file — browsers do not understand JSX, they never have, and the dev server was translating it for you. The second is running a dev server in production because it is the command you know, which is slow, insecure, and will fall over under any real traffic.

Throughout this course you are working on the events board application: a front end that lists community events, and an Express API that serves the data behind it. The repository looks like this:

```text
events-board/
├── api/          # Express service (from node101)
│   ├── src/server.js
│   └── package.json
├── web/          # front end (from react100)
│   ├── src/
│   ├── index.html
│   └── package.json
└── package.json  # the root, which you will build out in lesson 03
```

By the end of this lesson both halves will produce a defined artifact, and you will know exactly which files get deployed.

## Choosing a build tool for the deliverable

Before running anything, be deliberate about the tool. The question a working developer answers is not "what is popular," it is "what does this deliverable actually need."

A single HTML page with one small script and no dependencies needs **no build tool at all**. Modern browsers understand ES modules natively; you can write `type="module"` in a script tag, deploy the folder, and be finished. Adding a bundler to that is work with no payoff, and being able to say so is part of the competency.

You need a build step as soon as one of these is true:

- The source is not something a browser can execute — JSX, TypeScript, Sass, anything requiring transpilation.
- You import packages from npm by bare name, which browsers cannot resolve without help.
- The number of modules is large enough that loading them individually costs real time.
- You want production-only transformations: minification, dead-code removal, content hashing for caching.

The events board front end hits all four, so it needs a bundler. **Vite** is the choice here: it uses native ES modules and esbuild in development, so the dev server starts fast, and Rollup for production builds, which produces small, well-split output. It understands JSX, TypeScript, CSS, and static assets out of the box with no configuration. Webpack is the older, more configurable alternative and you will meet it on existing projects; Parcel and esbuild are lighter options. For a new front end in this pathway, use Vite and spend your configuration budget elsewhere.

The API is a different deliverable and the answer is different. Node executes JavaScript directly, there are no browsers to satisfy, and bundling a server usually buys nothing but debugging pain. Its "build" is installing production dependencies from a lockfile. Do not reach for a bundler out of symmetry.

If Vite is not already in the front end, add it:

```bash
cd web
npm install --save-dev vite @vitejs/plugin-react
```

```javascript
// web/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
```

```json
{
  "name": "events-board-web",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

Three commands, three distinct jobs. `vite` is the dev server. `vite build` produces the artifact. `vite preview` serves the artifact you just built on a local port, and it is the command people forget exists — it is how you check a production build before it leaves your machine.

## What a production build actually produces

Run it:

```bash
cd web
npm run build
```

Your version number, hash characters, and sizes will differ. What matters is the shape of the output.

```text
vite v5.4.0 building for production...
✓ 41 modules transformed.
dist/index.html                   0.46 kB │ gzip:  0.30 kB
dist/assets/logo-4f2a91c7.svg     1.21 kB
dist/assets/index-8c1d0f3e.css    5.83 kB │ gzip:  1.72 kB
dist/assets/index-b7a4e2d9.js   142.60 kB │ gzip: 45.91 kB
✓ built in 1.24s
```

That `dist/` directory is the artifact. Look at what happened to your source on the way there.

**Transpilation.** Your JSX became plain JavaScript function calls. Newer syntax was lowered to whatever the browser targets support. No browser ever sees a `.jsx` file.

**Bundling.** Forty-one modules became one JavaScript file. Each `import` was resolved — including bare imports like `react`, which the browser cannot resolve on its own — and the modules were concatenated in dependency order.

**Tree shaking.** Exports nothing imports were dropped. If you import one helper from a utility module, the other twenty do not ship.

**Minification.** Whitespace, comments, and long local variable names were removed. This is why the artifact is unreadable and why the numbers above show two sizes: the raw byte count and the gzipped count, which is what actually crosses the network.

**Content hashing.** `index-b7a4e2d9.js` carries a hash of its own contents in the filename. This is the mechanism that makes caching safe. A server can tell browsers to cache `/assets/index-b7a4e2d9.js` for a year, because if the contents ever change, the filename changes too, and the browser requests a file it has never seen. The one file that must never be cached aggressively is `index.html`, because it is the map: it names the current hashed files, and a stale copy of it points at a release that no longer exists.

**Source maps.** Because the config set `sourcemap: true`, each bundle has a `.map` file beside it that lets browser dev tools show you original source instead of minified output. Ship them or not — shipping makes production stack traces readable, at the cost of exposing your source structure to anyone who looks. For an internal or learning project, ship them.

Look at the generated `dist/index.html` and you will see the whole scheme:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Community Events Board</title>
    <script type="module" crossorigin src="/assets/index-b7a4e2d9.js"></script>
    <link rel="stylesheet" href="/assets/index-8c1d0f3e.css" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

Your source `index.html` referenced `/src/main.jsx`. The built one references a hashed bundle that did not exist ten seconds ago. Vite rewrote the reference as part of the build — that rewriting is exactly what a bundler is for, and it is why you never edit files in `dist/` by hand. They are output. The next build overwrites them without asking.

Check the artifact before you trust it:

```bash
npm run preview
```

That serves `dist/` on `http://localhost:4173`. Open it, click through, watch the network tab. Anything broken here is broken in production, and finding it now costs a minute rather than a deploy.

## Static assets and where they belong

Images, fonts, icons, and downloadable files are assets, and Vite treats them in two different ways depending on where you put them. Getting this wrong produces the classic bug where a picture works locally and 404s once deployed.

**Imported assets** live in `src/` and are referenced from code:

```javascript
import logo from "./assets/logo.svg";

export function Header() {
  return <img src={logo} alt="Community Events Board" width="120" />;
}
```

The import returns a URL string. At build time the file is copied into `dist/assets/` with a content hash and the string becomes that hashed path. Assets smaller than 4 kB are inlined as data URIs instead, saving a request. The advantage of this route is that the build knows about the file: if you delete it, the build fails immediately rather than shipping a broken link.

**Public assets** live in `public/` and are copied to the root of `dist/` untouched — same name, no hash. Reference them by absolute path:

```html
<link rel="icon" href="/favicon.ico" />
```

Use `public/` only for files that must keep an exact name at an exact path: `favicon.ico`, `robots.txt`, `manifest.webmanifest`, a verification file some service demands. Everything else should be imported, because unhashed files are cached badly and unreferenced files rot silently.

CSS is handled the same way as code. Import a stylesheet from a module and it is collected, processed, and emitted as one hashed `.css` file with a link injected into `index.html`. Fonts referenced by `url()` inside that CSS are copied and rewritten alongside it.

One configuration option decides whether any of this resolves at runtime: `base`. It defaults to `/`, which is correct when the site is served from the root of a domain. If your build is served from a subdirectory, every absolute asset path in `index.html` is wrong until you say so:

```javascript
export default defineConfig({
  base: "/events/",
});
```

A page that loads with no styling and a console full of 404s for `/assets/...` is almost always this.

![Which files a production build reads from source and which files it emits into the deployable dist directory](./img/build-artifact-anatomy.png)

## Making a build reproducible

An artifact is only useful if the same input produces the same output on someone else's machine. Three things get you there.

**Install from the lockfile, not the manifest.** `package.json` records ranges like `^18.2.0`; `package-lock.json` records the exact version of every package and every transitive dependency. `npm install` may resolve a range to a newer version and rewrite the lockfile. `npm ci` deletes `node_modules` and installs precisely what the lockfile says, failing if the lockfile and manifest disagree. Use `npm install` when you are deliberately changing dependencies, and `npm ci` everywhere else — especially on any machine that is not yours. Commit the lockfile. A repository without one has no reproducible build.

**Pin the runtime.** Node versions differ in behavior, and a build that works on 22 can fail on 18.

```json
{
  "engines": {
    "node": ">=20.11.0"
  }
}
```

```text
# .nvmrc (one line, at the repository root)
20.11.0
```

The `engines` field documents the requirement, and an `.nvmrc` file holding the version number lets `nvm use` select it. Lesson 04 makes the pipeline read the same value, so there is one answer to "which Node."

**Keep output out of version control.** `dist/` is generated. Committing it produces merge conflicts nobody can resolve, hides the fact that the build is broken, and lets a stale artifact ship. Add it to `.gitignore`:

```text
node_modules/
dist/
*.local
```

The rule is simple: commit the recipe, never the cake. The build is the only thing allowed to create `dist/`, and it should be able to do so from a clean clone.

## The API's artifact, and shipping one release

The Express service in `api/` needs no bundling, but it does need a defined artifact, and defining it is what makes a deploy repeatable. Its artifact is: `src/`, `package.json`, `package-lock.json`, and a `node_modules` produced by a production-only install.

```bash
cd api
npm ci --omit=dev
```

`--omit=dev` skips `devDependencies` — test runners, linters, build tools — which have no business on a server. It is smaller, faster to install, and removes a large amount of code you are not running from the machine that faces the internet.

Anything the service should not ship gets excluded explicitly with an `.npmignore` file or, better, a `files` allowlist in `package.json`, so tests and fixtures stay out of the deployed tree.

That leaves the decision that shapes the rest of the course: the events board deploys as **one release**, not two. The API serves the front end's built files as static assets and handles `/api/*` itself:

```javascript
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const here = path.dirname(fileURLToPath(import.meta.url));
const webDist = path.join(here, "..", "..", "web", "dist");

app.get("/api/events", (req, res) => {
  res.json(events); // the events array your node101 service already serves
});

app.use(express.static(webDist, { maxAge: "1y", index: false }));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(webDist, "index.html"));
});
```

Older tutorials write the catch-all as `app.get("*", ...)`. That works in Express 4 and **crashes at startup in Express 5**, which is what `npm install express` gives you today: `Missing parameter name at index 1: *`. A regular expression, `/.*/`, means "any path" in both versions. (Express 5's own spelling is `"/{*splat}"`.)

Three things are deliberate there. `express.static` comes after the API routes, so a request for `/api/events` is answered by your handler and never treated as a filename. `maxAge: "1y"` is safe precisely because the asset filenames are content-hashed. And the catch-all sends `index.html` for any unmatched path, which is what makes client-side routing work — a visitor who reloads on `/events/12` gets the app shell, and the front end router takes it from there. Note that `index.html` is served by that handler rather than by the static middleware, so it does not inherit the one-year cache.

One release means one version number, one deploy, one thing to roll back. It is the simplest arrangement that works, and simple is worth a great deal when something breaks at five o'clock.

## Practice

Produce a complete, inspectable artifact for both halves of the events board.

1. In `web/`, install Vite if it is not present and write a `vite.config.js` that sets `outDir: "dist"` and `sourcemap: true`. Add `dev`, `build`, and `preview` scripts.
2. Run `npm run build` and paste the full size table into a `BUILD-NOTES.md`. Next to each line write what that file is and whether a browser would request it directly.
3. Run `ls -R dist` and confirm you can name the origin of every file: which source file produced it, or which directory it was copied from.
4. Open `dist/index.html` in an editor. Find the hashed script and stylesheet references and write down what they pointed at in your source `index.html`.
5. Change one character of visible text in a component and rebuild. Compare the new asset filenames to the old ones and explain in `BUILD-NOTES.md` which hashes changed and why the unchanged ones did not.
6. Add a logo file under `src/assets/` and import it into a component; add a `favicon.ico` under `public/`. Rebuild and show, from the contents of `dist/`, how the two were treated differently.
7. Deliberately set `base: "/events/"` in the config, rebuild, run `npm run preview`, and open the site at the root path. Capture the console errors, then set `base` back and record what the symptom of a wrong `base` looks like.
8. Delete `node_modules` and `package-lock.json` in `web/`, run `npm install`, and note whether any version in the new lockfile differs from the old one. Restore the original lockfile, then run `npm ci` and confirm it succeeds. Write one sentence on when you would use each command.
9. Add `engines.node` to both `package.json` files and an `.nvmrc` at the repository root holding the version you are running.
10. Confirm `dist/` and `node_modules/` are both gitignored, and prove it with `git status --short` after a build.
11. In `api/`, run `npm ci --omit=dev` into a clean checkout and record how the installed package count and directory size compare to a full install.
12. Wire the API to serve `web/dist` using `express.static` plus a catch-all for `index.html`, with the API routes registered first. Start only the API — no dev server — and confirm the front end loads, a page reload on a nested route works, and `/api/events` still returns JSON.

**Deliverable:** a `web/dist` produced by `npm run build`, an API that serves it as a single release, and a committed `BUILD-NOTES.md` documenting the artifact contents, the hashing experiment, and your reasoning about install commands.

## Check your understanding

1. You deploy the `web/` folder as it is and the browser reports it can't load `main.jsx`. What did you deploy, and what should you have deployed?
2. Why is it safe to cache `/assets/index-b7a4e2d9.js` for a year but not `index.html`?
3. A logo works in `npm run dev` but 404s after deploying to `https://example.org/events/`. What's the first setting you check?
4. When do you use `npm install`, and when `npm ci`?

*Answers:* (1) You deployed source, which needs the dev server to translate it. Deploy the `dist/` artifact from `npm run build`. (2) The hashed filename changes whenever the contents change, so a cached copy is never stale. `index.html` keeps its name and points at the current hashed files, so a stale copy points at a release that no longer exists. (3) Vite's `base` option, which must be `/events/` for a subdirectory deploy. (4) Use `npm install` only when you're deliberately changing dependencies. Use `npm ci` everywhere else, because it installs exactly what the lockfile says.
