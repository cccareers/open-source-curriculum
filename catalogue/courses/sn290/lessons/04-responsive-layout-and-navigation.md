---
lesson_id: sn290-04
course_id: sn290
pathway: servicenow-implementation-specialist
title: Responsive Layout and Navigation
order: 4
kind: lesson
competency_ids:
  - D6-S1-C03
objectives:
  - Lay out a portal that works on a phone and give it navigation a user can follow
---

## Breakpoints are the whole of responsive layout

Service Portal's grid is a twelve-unit Bootstrap grid with four breakpoints, and an `sp_column` record carries a size field for each one:

| Field | Applies from | Typical device |
| --- | --- | --- |
| Size (extra small) | 0px up | phone, portrait |
| Size (small) | ~768px up | phone landscape, small tablet |
| Size | ~992px up | tablet landscape, small laptop |
| Size (large) | ~1200px up | desktop |

The unlabelled **Size** field is the medium breakpoint. That naming trips people up, because it looks like the default and behaves like the third of four.

The rule that makes all of this simple is **the size cascades upward**. A column with extra-small set to 12 and medium set to 6 is full width on a phone, still full width on a small tablet — because small was never set and inherits from extra small — and half width from a laptop up. You do not need to fill in all four. You need to fill in the smallest one and then each width where the layout should actually change.

That gives the working method: **design for the phone first, then add breakpoints where the phone layout starts to look silly on a wide screen.** Going the other way — building at desktop width and then patching the phone — produces a portal where every column is 4 units wide and the phone shows three unreadable slivers side by side.

Concretely, for a common three-card band:

```text
Column A: xs = 12, md = 4
Column B: xs = 12, md = 4
Column C: xs = 12, md = 4
```

Stacked on a phone, three across on a laptop. For a main-plus-sidebar page:

```text
Content column:  xs = 12, md = 8
Sidebar column:  xs = 12, md = 4
```

On the phone the sidebar lands *under* the content, which is almost always right — the sidebar is secondary. If it must come first on a small screen because it holds the search box, do not fight it with CSS ordering; move the search into its own container above the band. Reordering a grid with `push` and `pull` classes is a maintenance liability, and a container is free.

Two grid habits worth forming. **Keep every row summing to 12 at every breakpoint you set.** If extra small sums to 24 you have deliberately chosen a two-line wrap, which is fine, but choose it rather than discover it. And **let the row do the wrapping** — a row is the reset point for the twelve units, so if a band has six cards, one row of six is better than three rows of two, because the single row reflows to two, three, or six across on its own.

At the container level, the choice is `container` versus `container-fluid`. Use `container` for reading content — it caps the line length on a wide monitor, which is the single cheapest legibility win available. Use `container-fluid` for hero bands, full-bleed images, and dense dashboards. Below the small breakpoint the two render nearly identically, so the decision is entirely about the desktop.

Resist the urge to solve small screens by hiding things. Bootstrap's visibility classes will let you drop a column below a breakpoint, and occasionally that is right — a decorative image, a "related links" rail that duplicates the footer. But a phone user who cannot reach a function that a desktop user can is not on a responsive portal, they are on a worse portal. Reflow before you hide, and if you must hide, hide the presentation and keep the function.

Widget content has to cooperate too. Inside your own widgets:

```css
.sn290-card {
  img,
  table {
    max-width: 100%;
  }

  .sn290-scroll {
    overflow-x: auto;
  }
}
```

Wide tables are the usual offender. A table with eight columns cannot become readable on a 375-pixel screen by shrinking; wrap it in a horizontally scrolling container so it stays usable, or send fewer fields from the server script at small widths and show a card list instead.

Finally, touch. A control that is comfortable to click with a mouse can be genuinely hard to hit with a thumb. Give interactive elements a target of roughly 44 by 44 pixels and enough spacing that adjacent actions cannot be confused. Hover-only affordances — a menu that opens on hover, an action that appears only on row hover — have no equivalent on a touch screen and must have a tap-accessible path.

## Navigation people can follow

Service Portal navigation is records again. A **menu** record holds ordered **menu items**, and a theme's header widget renders the menu that the portal record points at.

Menu items come in a few types, and choosing correctly matters more than it looks:

- **Link to a portal page** — an internal page ID. Use this for anything inside the portal so the link survives a URL-suffix change.
- **Link to a URL** — external destinations, or platform UI pages outside the portal.
- **Knowledge base / catalog category** — resolves to the right portal page with the right parameter already attached, which is better than hand-building a query string.
- **Header / divider** — structural items inside a dropdown, not clickable.
- **Nested items** — a menu item with children renders as a dropdown.

Each item can carry **roles**, and an item the user cannot use disappears rather than failing on click. Use this instead of a landing page that says "you do not have access."

Three principles carry almost all of the design work.

**Label by task, not by system.** A menu that reads *Incident*, *Request*, *Knowledge* is a menu written by the people who built the tables. *Report a problem*, *Order something*, *Find an answer* is a menu written for the person who arrived with a broken laptop. Use the words your users use, which means you have to have asked them.

**Two levels, no more.** One row of top-level items, each with at most one dropdown under it. Three-level menus are unusable on a phone and only marginally usable with a mouse. If your content will not fit in two levels, the answer is a landing page with categories, not a third level.

**Always answer "where am I?" and "how do I get back?"** Mark the current section in the menu. Put a breadcrumb on any page more than one step from the home page. Every detail page — an article, a catalog item, a ticket — needs a visible route back to its list, and the browser back button is not that route, because a user who arrived from search never saw the list.

Two more things belong to navigation rather than layout. **Search must be reachable from every page**, because search is how most people navigate a portal regardless of what you built the menu for; it belongs in the header, which means it is in the theme and therefore on every page automatically. And **the logo goes home** — a portal logo that is not a link to the home page violates an expectation so universal that users will not report it, they will just get stuck.

On small screens, the header menu collapses to a toggle. Check three things when you test it: that the toggle is reachable and large enough to tap, that the expanded menu scrolls if it is taller than the screen, and that a fixed header is not sitting on top of your first container. That last one is a real bug with a boring fix — the theme applies top padding to the content area for the header's height, and a custom header of a different height needs that padding adjusted to match.

## Practice

Continue in your `dev290` portal.

1. **Set the four sizes deliberately.** Take the three-column band from Lesson 2 and set extra small to 12 and medium to 4 on each column. Then take the 8/4 band and set both columns to 12 at extra small. Reload at a narrow window width and confirm everything stacks in a sensible reading order.
2. **Test at the real widths.** Using your browser's device toolbar, check the home page at 375, 768, 1024, and 1440 pixels. Write down one thing that is wrong at each width and fix at least two of them.
3. **Handle a wide table.** Add a widget whose template renders a table with at least seven columns. Make it usable at 375 pixels — by scrolling, by reflowing to cards, or by sending fewer columns — and say which approach you chose and why.
4. **Build a real menu.** Create a menu with four top-level items labelled as user tasks, one of which has a dropdown of three children. Point at least one item at a portal page by page ID rather than by URL. Attach the menu to your portal and confirm it renders.
5. **Gate an item.** Add a fifth item restricted to a role your test user lacks. Impersonate that user and confirm the item is not rendered at all.
6. **Check the phone header.** At 375 pixels, open the collapsed menu, tap through to a second-level item, and confirm you land on the right page, that the current item is marked, and that nothing is hidden under a fixed header.

## Check your understanding

1. A column has extra small = 12 and Size = 6. How wide is it at 800 pixels, and why?
2. Three cards are three slivers on a phone. Which field was probably the only one set?
3. Your menu has three levels. What should replace the third level?
4. Why should an internal menu item link by page ID rather than by URL?

*Answers:* (1) Full width; small is unset so it inherits extra small (12), and the medium size of 6 only applies from about 992 pixels. (2) The unlabelled Size (medium) field. (3) A landing page with categories. (4) A page-ID link survives a URL-suffix change and resolves within whichever portal the user is in.
