---
lesson_id: sn290-07
course_id: sn290
pathway: servicenow-implementation-specialist
title: "Project: Build a Branded Service Portal"
order: 7
kind: project
competency_ids:
  - D6-S1-C01
  - D6-S1-C02
  - D6-S1-C03
objectives: []
---

## The brief

Northwind Regional Health runs a 1,400-person operation across one hospital and six clinics. Their staff currently request everything — equipment, access, facilities work, IT help — by emailing a shared mailbox. The service desk manager has asked you to replace that mailbox with a Service Portal.

The people who will use it are not office workers at a desk. A large share are clinical staff who will open the portal on a phone, between patients, standing up, on a hospital wireless network. That constraint shapes every decision in this project.

Build the portal, in your own developer instance, in the time available. You are building the surface: the portal record, its theme, its pages, its layout, its navigation, and at least one widget you wrote yourself.

## Goal

Deliver a working, branded Service Portal named **Northwind Service Center** at the URL suffix `nwsc`, with a home page a stranger can use without instructions, at least one page beyond the home page, a navigation menu, and one custom widget you built and configured.

## Requirements

**The portal and its theme**

- A new `sp_portal` record with the URL suffix `nwsc`, a title, and its own theme. The theme must be a copy — the out-of-box portal, its theme, and its widgets are untouched at the end of this project.
- Branding applied through the theme's CSS variables: a primary colour, a secondary or accent colour, and typography. No hard-coded colour values anywhere in your own widget CSS.
- A logo. Any placeholder image is fine; it must link to the home page.

**The home page**

- Built from at least three containers, each with a single, statable purpose.
- A search entry point above the fold, visually prominent.
- At least four distinct widget instances, of which at least two are placements of the *same* widget configured differently through options.
- Every column sized at both the extra-small and medium breakpoints.

**A second page**

- One further page beyond the home page, addressed by page ID, reachable from the menu. A "my requests" page, a department landing page, or a status page all qualify.
- It must read at least one URL parameter and change what it shows based on it.

**Navigation**

- A menu with at least four top-level items, at least one of which has a dropdown of children.
- Items labelled as user tasks, not as table names.
- At least one item gated by a role, and demonstrably invisible to a user without it.
- Current-location indication, and a route back from any detail view to its list.

**The custom widget**

- One widget you wrote: template, CSS, client controller, and server script.
- It queries data on the server, renders a list or a summary, and has at least one interactive control that causes a client-to-server call.
- It declares an option schema of at least three options, and it is placed twice with different option values.
- Its server script limits its query, sends only the fields the template renders, and validates any input it receives.

## Constraints

- **Nothing out of box is edited.** Clone the portal record, the theme, and any widget you want to change. If a diff of your instance would show a modified out-of-box widget, the project fails this constraint.
- **No family release names, and no assumptions about instance version.** Everything you build must work from the record model and the documented APIs.
- **Phone first.** Every requirement above must hold at 375 pixels wide. A desktop-only portal does not meet the brief.
- **No invented competency scope.** Catalog item construction, knowledge article authoring, workflow, and Flow Designer are out of scope. If your design needs a catalog item or a knowledge article to demonstrate something, create the simplest possible placeholder and move on — the assessment is on the portal.
- **Everything in an update set** named for the project, so the work is transportable.
- **Time budget: two hours.** Scope to fit. A small portal finished and tested beats a large one half-built.

## Definition of done

You are done when every one of these is true and you have checked each one rather than assumed it:

1. Loading `/nwsc` with no page parameter serves your home page.
2. The portal, theme, pages, containers, rows, columns, and instances are all your own records; the out-of-box portal still renders unchanged at its own URL with its own theme.
3. At 375 pixels, the home page stacks into a sensible reading order, nothing requires horizontal scrolling, the menu toggle is reachable and tappable, and no content sits under the header.
4. At 1440 pixels, the home page uses the width without stretching body text across the whole monitor.
5. Your custom widget renders in two instances with visibly different data, and the difference is achieved through options rather than through two widget records.
6. The interactive control on your widget performs its server call, the server validates the input before acting, and the result is reflected in the UI without a full page reload.
7. Changing one colour variable on your theme visibly changes your custom widget, proving nothing was hard-coded.
8. Impersonating a user without the gated role: the gated menu item is absent, and navigating directly to anything it pointed to does not expose restricted content.
9. Your second page changes its content when its URL parameter changes.
10. Tabbing from the top of the home page reaches the search box, the menu, and every control in your widget, with visible focus throughout.
11. Every image has alt text, every input has a label, and the page has one main region.
12. The home page's document response completes in a time you have measured and recorded, and you can name the slowest server script on the page.
13. All of it is captured in one update set.

## What to hand in

- The update set, exported.
- A one-page written note covering: the three-to-five user tasks you designed the home page around; why each container exists; the clone-versus-option decision you made for your widget; the two measurements from item 12; and one thing you would fix with another four hours.

## Hints

- **Spend the first fifteen minutes not building.** List the audiences, list the top five tasks, sketch the home page as named bands. Every minute here saves three in the designer.
- **Clone first, before anything else.** Copying the portal and theme takes two minutes at the start and is unrecoverable pain to retrofit after you have built ten pages against the shared theme.
- **Reuse the out-of-box pages.** The knowledge, catalog, ticket, search, and form pages exist and are already wired. Building your own versions of them is the most common way to run out of time on this project.
- **Set extra-small sizes as you go**, not at the end. Retrofitting breakpoints across twenty columns is tedious; setting two fields per column while you are already in the record costs nothing.
- **Use the Page Designer for the first pass and the record lists for the second.** Drag to lay out, then open `sp_container` and `sp_column` to set semantic tags, breakpoints, and option JSON.
- **Build the widget's server script first and log its output** before you write a line of template. A widget that is broken in both halves at once is much harder to debug than one half at a time.
- **Impersonate early and often.** The gated-item requirement is easy to satisfy and easy to satisfy *wrongly*; the direct-URL check is what separates the two.
- **Test on a real phone if you can get one on the instance.** The device toolbar in a desktop browser is a good approximation and a poor substitute — it does not reproduce thumb reach, tap accuracy, or a slow network.
