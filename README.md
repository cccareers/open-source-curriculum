# Open Source Curriculum

This repository contains manifests, curriculum guides, and educational artifacts created and maintained by the Creating Coding Careers Organization.

## About
The resources in this repository are designed to support learners on their journey into software development and other technology careers. Our mission is to make quality technical education accessible to everyone through open, community-driven content and to continue to build earn-and-learn pathways via registered apprenticeships.

## What's Inside
- **Curriculum Manifests** — Structured learning paths and course outlines
- **Educational Resources** — Guides, reference materials, and learning aids
- **Community Artifacts** — Shared resources developed by and for our community

## Contributing
We welcome contributions from educators, developers, and learners. If you'd like to contribute, please review our contribution guidelines and submit a pull request.

## License
This work is licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License (CC BY-NC-SA 4.0).

You are free to:
- **Share** — copy and redistribute the material in any medium or format
- **Adapt** — remix, transform, and build upon the material

Under the following terms:
- **Attribution** — You must give appropriate credit, provide a link to the license, and indicate if changes were made
- **NonCommercial** — You may not use the material for commercial purposes
- **ShareAlike** — If you remix, transform, or build upon the material, you must distribute your contributions under the same license

See [LICENSE.md](https://github.com/cccareers/open-source-curriculum/blob/main/LICENSE.md) for the full license text.

---

## Astro website foundation

The Astro/Starlight site is the starting point for the new curriculum website. It currently displays a landing page; course loading and interactive player features remain in the existing Node player below.

```bash
# Use Node.js 22.12+ (or a current LTS release)
npm install
npm run dev:site  # Astro website at http://localhost:4321
npm run build    # Static output in dist/
npm run preview  # Preview the built site
```

`npm start` and `npm run dev` continue to run the existing course player. The player itself uses Node built-ins; Astro dependencies are needed for the new website.

---

## 🎓 Course Player

A modern, fast, zero-dependency course content player and catalog for Markdown (`.md`) and MDX (`.mdx`) curriculum files. Built for students and educators with interactive quizzes, 3D flashcards, H5P interactive learning embeds, responsive video players, and progress tracking.

---

## ✨ Features

- 📖 **GitBook Inspired Aesthetics & Typography**: Clean typography, light and dark themes, collapsible module tree, and smooth transitions.
- ⬅️ ➡️ **Bottom Navigation**: Large **Previous** and **Next** lesson cards at the bottom of every lesson, plus keyboard shortcuts (`Alt + Left` / `Alt + Right`).
- 🎥 **Smart Video Embeds**: Automatically converts YouTube, Vimeo, Loom, and direct `.mp4` / `.webm` video links into responsive players with custom playback speed controls (0.75x – 2x).
- 📄 **Frontmatter & MDX Support**: Full support for YAML frontmatter in both `.md` and `.mdx` files (`title`, `order`, `module`, `duration`, `difficulty`, `tags`, `video`).
- 🧠 **Interactive Quizzes**: `<Quiz />` component with instant feedback, celebration confetti, explanations, and retry capability.
- 🗂️ **Flashcards & Decks**: Single `<Flashcard />` and multi-card `<FlashcardDeck />` with realistic 3D flip animation, hints, and counter.
- 🧪 **H5P Content Embeds**: `<H5P />` component for rich interactive HTML5 educational activities with fullscreen support.
- 📁 **Point to Any Folder**: Run `course-player --dir ./your-folder`, enter a path in the web UI, or select a folder directly in the browser!
- ⚡ **Live Hot Reload**: Changes to markdown files on disk update the browser in real time via Server-Sent Events (SSE).
- 🔍 **Fast Search & Keyboard Shortcuts**: Instant search modal (`⌘K` or `/`), quick jump to any lesson.
- 📊 **Student Progress Tracking**: Check off completed lessons, saved automatically in `localStorage`, with visual progress bar and completion count.
- 🚀 **Zero External Dependencies**: Runs using standard Node.js built-ins (`node:http`, `node:fs`).

---

## 🚀 Quick Start

### 1. Start the Player with Sample Courses

```bash
# Start the server on port 3000
npm start

# Or using Node directly
node server.js
```

Open your browser to [http://localhost:3000](http://localhost:3000).

### 2. Pointing to Your Own Folder

Point the player at any folder of Markdown or MDX files using the CLI:

```bash
# Using CLI binary
./bin/course-player.js --dir /path/to/your/markdown-folder --port 4000

# Or using server.js
node server.js --dir /path/to/your/markdown-folder --port 4000
```

Alternatively, click **"Change Folder"** at the bottom of the sidebar in the web interface to switch folders on the fly!

---

## 📂 Folder Structure Conventions

The player automatically detects both single-course and multi-course structures:

### Multi-Course Organization (Recommended)
```
my-courses/
├── fullstack-web-dev/
│   ├── course.json                       # Optional metadata
│   ├── 01-getting-started/
│   │   ├── 01-welcome.md
│   │   └── 02-setup.mdx
│   └── 02-javascript-core/
│       ├── 01-closures.mdx
│       └── 02-async.mdx
└── python-data-science/
    ├── course.json
    └── 01-basics/
        └── 01-intro.md
```

### Single-Course Organization
```
my-curriculum/
├── 01-intro.md
├── 02-components.mdx
└── 03-advanced.mdx
```

*Note: Lessons are ordered by the `order` property in frontmatter, or by the numeric filename prefix (e.g. `01-`, `02-`).*

---

## 📝 Frontmatter Reference

Add YAML frontmatter at the top of any `.md` or `.mdx` file:

```yaml
---
title: "Lexical Scope and Closures"
description: "Master one of JavaScript's core runtime concepts."
order: 1
module: "JavaScript Deep Dive"
duration: "15 min"
difficulty: "Intermediate"
tags: [javascript, scope, closures]
video: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
---
```

---

## 🧩 Interactive MDX Components

You can embed interactive components directly in any `.mdx` file:

### 1. Multiple-Choice Quiz
```jsx
<Quiz
  question="Which keyword in JavaScript declares a block-scoped variable?"
  options={["var", "let", "global", "function"]}
  answer={1}
  explanation="'let' and 'const' declare block-scoped variables, whereas 'var' is function-scoped."
/>
```

### 2. Single Flashcard
```jsx
<Flashcard
  front="What is a Closure?"
  back="A closure is the combination of a function bundled together with references to its surrounding state (lexical environment)."
  hint="Think about retained scope."
/>
```

### 3. Flashcard Deck
```jsx
<FlashcardDeck
  title="Networking Protocols"
  cards={[
    {
      front: "DNS",
      back: "Domain Name System: Translates human-friendly hostnames into IP addresses.",
      hint: "Internet phonebook"
    },
    {
      front: "HTTPS",
      back: "HTTP secured with Transport Layer Security (TLS) encryption."
    }
  ]}
/>
```

### 4. H5P Content Embed
```jsx
<H5P
  src="https://h5p.org/h5p/embed/615"
  title="Interactive Educational Video"
  height="480px"
/>
```

### 5. Callouts
```jsx
<Callout type="tip" title="Pro Tip">
  Use Alt + Right Arrow to navigate directly to the next lesson!
</Callout>
```
Supported types: `tip`, `note`, `info`, `warning`, `danger`.

### 6. Code Tabs
```jsx
<Tabs>
  <Tab label="JavaScript">
    console.log("Hello from JS");
  </Tab>
  <Tab label="Python">
    print("Hello from Python")
  </Tab>
</Tabs>
```

---

## 🎥 Automatic Video Embeds

Any standalone video URL or markdown video link is automatically rendered as a responsive player:

- **YouTube**: `https://www.youtube.com/watch?v=ID` or `https://youtu.be/ID`
- **Vimeo**: `https://vimeo.com/ID`
- **Loom**: `https://www.loom.com/share/ID`
- **Direct MP4/WebM**: `https://your-domain.com/video.mp4`

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Alt + →` | Go to **Next Lesson** |
| `Alt + ←` | Go to **Previous Lesson** |
| `⌘K` or `/` | Open **Search Modal** |
| `Esc` | Close search or folder dialog |
| `Space` / `Enter` | Flip active flashcard |

---

## 🧪 Testing

Run the full automated test suite (including unit tests for frontmatter, video helper, MDX components, scanner, and server):

```bash
npm test
```
