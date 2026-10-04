---
lesson_id: sn290-02
course_id: sn290
pathway: servicenow-implementation-specialist
title: "Service Portal Architecture: Portals, Pages, and Containers"
order: 2
kind: lesson
competency_ids:
  - D6-S1-C01
objectives:
  - Assemble a Service Portal from portal records, pages, containers, rows, and columns
---

## A portal is a stack of records

The first thing to unlearn is the idea that a Service Portal is a file, a template, or a theme you download. It is a stack of records in ordinary platform tables, and every one of them is something you can query, update, export in an update set, and reason about the same way you reason about an incident record. Nothing about a portal is magic. It is data that a rendering engine walks top to bottom.

The stack looks like this, from the outside in:

```text
sp_portal      (the portal itself: URL suffix, homepage, theme, login page)
  └─ sp_page          (one addressable screen; has an ID used in the URL)
       └─ sp_container    (a full-width horizontal band on the page)
            └─ sp_row          (a horizontal group inside the band)
                 └─ sp_column       (a vertical slice of the row, 1–12 units wide)
                      └─ sp_instance     (one widget, placed and configured)
```

![The Service Portal record hierarchy from portal down to widget instance](./img/portal-record-hierarchy.png)

Read that chain out loud a few times, because almost every "I can't find where this comes from" problem in Service Portal work is solved by walking it. A stakeholder says the box on the right of the home page is wrong. The box is an `sp_instance`. That instance lives in an `sp_column`, which lives in an `sp_row`, in an `sp_container`, on an `sp_page` whose ID is in the URL, in the portal whose URL suffix is also in the URL. Six lookups and you are standing on the record that needs to change.

## The portal record

An `sp_portal` record is small and mostly consists of pointers. The fields you will set on nearly every build:

- **URL suffix** — the first path segment of the portal's address. A portal with the suffix `hr` answers at `/hr`. This must be unique across portals; two portals cannot share a suffix.
- **Homepage** — the `sp_page` served when someone hits the portal root with no page ID.
- **Login page** — where an unauthenticated user is sent when they hit something they cannot see.
- **Theme** — the `sp_theme` that supplies the header, the footer, and the CSS variables. Themes are shared objects; two portals can point at the same one, which is a feature until it is a problem.
- **Knowledge base** and **Service catalog** — default scoping for the knowledge and catalog widgets. Lesson 5 covers what these actually constrain.
- **404 page**, **Title**, **Logo**, **Icon** — the rest of the identity.

Because the theme is a pointer and not a copy, the very first move on a real engagement is almost always: duplicate the out-of-box portal record, duplicate its theme, point the copy at the copy. If you skip that and start editing the shared theme, you have quietly changed every portal that references it, including ones other teams own.

## Pages and the URL

A page is addressed by its **ID** field, not its sys_id. That ID is a short, stable, human-readable string, and it appears in the query string:

```text
https://<instance>.service-now.com/sp?id=index
https://<instance>.service-now.com/hr?id=kb_article&sys_id=<article sys_id>
```

The first path segment (`sp`, `hr`) selects the portal; `id` selects the page; everything else is parameters the page's widgets can read. This is why two portals can serve the same page record with different themes and different menus — the page does not belong to a portal, it is merely reachable through one.

Three page fields decide who gets in:

- **Public** — when checked, the page renders for unauthenticated users. Leave it unchecked unless you have a reason; a public page is a public page for everyone on the internet if the instance is internet-facing.
- **Roles** — a comma-separated set of roles required to view the page. An authenticated user without one of them is bounced.
- **Draft** — hides the page from the designer's page picker without deleting it. Useful for staging a redesign.

There is also a **CSS** field on the page record. Styles you put there are scoped to that page only, which is the right home for a one-off rule and the wrong home for anything you will want twice.

## Containers, rows, and columns

Inside a page, layout is a Bootstrap 12-unit grid, expressed as records.

A **container** is a full-width horizontal band. Its important field is the Bootstrap class: `container` gives you a centred, max-width band that leaves gutters on a wide monitor, and `container-fluid` stretches edge to edge. Containers are also where you put a background colour or image, a CSS class you can hook, and — this matters for Lesson 6 — a **semantic tag**, so the band renders as `main`, `header`, `aside`, or `section` instead of an anonymous `div`.

A **row** is a horizontal group inside a container. Rows exist so that columns can wrap: a row is the reset point for the 12 units.

A **column** is a vertical slice, sized in those units. A column with size 6 takes half the row on a normal screen; two of them fill it. Columns carry several size fields — one per breakpoint — and Lesson 4 is entirely about using them well. For now, the rule to hold on to is that the sizes in a row should add up to 12, and if they add up to more, the extras wrap to a new line.

Containers can nest: an `sp_container` can be placed inside a column, giving you a grid inside a grid. Do this sparingly. Three levels of nesting is usually a sign that the page is trying to be two pages.

Here is what a two-column band produces once the engine renders it. You never write this markup by hand — the records generate it — but you must be able to read it when you open the browser inspector:

```html
<div class="container">
  <div class="row">
    <div class="col-md-8">
      <!-- widget instance: announcements -->
    </div>
    <div class="col-md-4">
      <!-- widget instance: my open requests -->
    </div>
  </div>
</div>
```

## Widget instances

An `sp_instance` is not a widget. It is *a placement of* a widget, with its own configuration. The same widget record can appear on forty pages with forty different titles, colours, and option values, and changing one instance changes nothing else.

The fields that matter most:

- **Widget** — the reference to the `sp_widget` being placed.
- **Order** — position within the column, ascending.
- **Title**, **Bootstrap color**, **Size**, **CSS class** — presentation for this placement.
- **Widget parameters / options** — the instance-specific values the widget's server script reads. If the widget declares an option schema, the designer renders a small form for these; otherwise you edit JSON directly.
- **Roles** — the instance is skipped entirely for users without them. This is the cleanest way to show one card to managers and a different card to everyone else without a line of script.

Options arrive in the widget's server script on `options`, which is why a well-built widget is configurable rather than duplicated:

```json
{
  "title": "Open incidents",
  "table": "incident",
  "filter": "active=true^assigned_to=javascript:gs.getUserID()",
  "max_entries": 5
}
```

Lesson 3 covers how a widget declares and consumes those. The architectural point here is the discipline: when a stakeholder asks for "the same list but for changes," the correct answer is a second *instance* with a different option value, not a second widget.

## Themes: where the portal's identity lives

The theme is the fifth kind of record in the stack, and it sits beside the page hierarchy rather than inside it. An `sp_theme` supplies three things to every page the portal serves:

- **A header widget and a footer widget.** These render on every page automatically. That is why the menu, the search box, the logo, and the user avatar are not on any page's container list — they come from the theme.
- **A set of CSS variables.** Colours, fonts, sizes, expressed as named variables rather than literal values.
- **A set of attached style sheets.** Reusable CSS records shared across widgets, in a defined load order.

The variables are the part that matters most for day-to-day work, because they are the difference between a portal you can rebrand in ten minutes and one you have to grep. A theme defines names like a primary brand colour, a body font family, a base font size, and a navbar background; widgets and style sheets reference those names; changing one value propagates everywhere.

```css
/* in a widget's CSS or a theme style sheet */
.sn290-hero {
  background-color: $brand-primary;
  color: $navbar-default-color;
  font-family: $font-family-base;
}
```

The rule that follows is simple and absolute: **a hard-coded colour in widget CSS is a defect.** It will survive every rebrand and quietly break the portal's consistency, and the person who finds it will be you, in a year, with no memory of writing it.

There is a branding editor that exposes the common variables — logo, primary colour, background, typography — as a form rather than as raw CSS. Use it for the standard set, and edit the theme's style sheets directly only for the things it does not expose. Either way you are editing one theme record, which is why cloning the theme before you touch it is the first move on every engagement.

Because the header and footer come from the theme, changing them changes every page at once. That is usually what you want. When it is not — a checkout flow that should hide the main menu, a public page with a minimal header — the answer is a second theme and a second portal record pointing at the same pages, not conditional logic inside the header widget.

## Where does this belong?

New portal developers spend a lot of time deciding where a given change goes, and there are really only four answers. Working through them in order will be right nearly every time:

1. **Is it about identity — a colour, a font, the logo, the header, the footer?** It belongs to the **theme**. It applies to every page.
2. **Is it about which screens exist and who may see them?** It belongs to the **page** — its ID, its roles, its public flag.
3. **Is it about arrangement — what sits beside what, how wide, in what order?** It belongs to the **container, row, and column** records. No script, no CSS, just structure.
4. **Is it about what a specific box shows or does?** It belongs to the **widget instance** if the difference is configuration, and to the **widget** if the difference is behaviour. Lesson 3 draws that line precisely.

Two things you will be tempted to do and should not. Do not put layout in a widget's CSS — a widget that positions itself relative to the page has stolen a job the grid already does, and it will break the moment someone moves it. And do not put page-specific styling in the theme — it will apply to every page, and the person debugging the odd margin on an unrelated screen six months from now will not find it.

## Two ways to build, and when to use each

The **Page Designer** is the drag-and-drop editor. You pick a page, drag containers onto it, split them into rows and columns by dragging the column edges, and drop widgets in. It writes exactly the records described above — there is no second data model behind it. Use it for the first pass on any layout, because moving a column by dragging is faster than editing four order fields.

The **record forms** are the list-view path: open `sp_container`, filter by page, edit. Use these when you need something the designer will not give you — setting a semantic tag, pasting a long option JSON, bulk-reordering, or checking why a row you cannot see is still occupying space. Also use them when you need to *read* a page quickly: a filtered list of instances on a page tells you in five seconds what the designer takes a minute to show.

There is also a configuration landing page that gathers the portal, page, theme, widget, and menu lists in one place along with a branding editor for the logo, colours, and typography of a theme. Start there rather than hunting the tables individually.

## Designing to a need, not to a template

The competency this lesson serves is about configuring a portal *to a need*, and that is a design activity that happens before you touch a record. A workable sequence:

1. **Name the audiences.** "All employees" and "field technicians" want different home pages. If the answer is one audience, you need one portal; if it is genuinely three with different branding and different landing content, that may be three portals against the same widgets.
2. **List the top five tasks.** Not features — tasks. "Report a broken laptop," "check where my request got to," "find the travel policy." Everything above the fold on the home page should serve one of them.
3. **Map tasks to pages.** Most tasks are one page or an existing out-of-box page. Reuse before you build; the catalog, knowledge, ticket, and search pages already exist and are already wired.
4. **Sketch the home page as bands.** Each band is a container. Write down what each band is for in one sentence. A band you cannot describe in one sentence is a band you should delete.
5. **Only then open the designer.**

The most common failure in portal work is skipping steps 1 through 4, building a beautiful home page full of everything, and discovering at UAT that the thing people actually came to do is three clicks down.

## Practice

Work in a personal developer instance. Do not edit the out-of-box portal or its theme.

1. **Clone the baseline.** Copy the out-of-box service portal record. Give the copy the URL suffix `dev290` and the title `Practice Portal`. Copy its theme, rename the copy, and point your new portal at the copied theme. Confirm the original still points at the original.
2. **Create a home page.** Create an `sp_page` with the ID `dev290_home`, unchecked Public, no roles. Set it as the homepage on your portal record. Load `/dev290` and confirm you get an empty page rather than a 404.
3. **Build three bands.** On that page, create three containers in order: a `container-fluid` hero band, a `container` band split into a 12-unit row holding two columns sized 8 and 4, and a third `container` band with three equal columns. Do the first pass in the Page Designer, then open the `sp_container`, `sp_row`, and `sp_column` lists and read back the records you just created. Write down, for one column, the full chain of sys_ids from column up to portal.
4. **Place and configure instances.** Drop any list-style out-of-box widget into your 8-unit column and a second copy of the *same widget* into the 4-unit column. Give the two instances different titles and different option values so they show different data. Confirm you did this with two instances and one widget.
5. **Prove role gating.** Put a fourth instance in the third band and set a role on it that your test user does not have. Impersonate that user, reload, and confirm the instance is absent — not empty, absent.
6. **Break it on purpose.** Change the second band's row so its columns are sized 8 and 8. Reload, observe the wrap, and explain in one sentence why it happened. Set it back.

## Check your understanding

1. A stakeholder says the card on the right of the home page shows the wrong title. Name, in order, the records you walk to reach the one you change.
2. You need "the same list, but for changes." Second widget or second instance? Why?
3. Why do you copy the theme before changing a single colour?
4. A rule that only one page needs is sitting in the theme. What will go wrong, and where should it live?

*Answers:* (1) Portal (URL suffix) → page (the `id` in the URL) → container → row → column → widget instance; the title is on the instance. (2) A second instance with different option values; the difference is data, not behaviour. (3) Themes are shared by reference, so editing the original changes every portal that points at it. (4) It applies to every page and confuses whoever debugs an unrelated screen; put it in the page's CSS field.
