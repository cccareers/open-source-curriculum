---
lesson_id: sn290-05
course_id: sn290
pathway: servicenow-implementation-specialist
title: Knowledge Base and Catalog in the Portal
order: 5
kind: lesson
competency_ids:
  - D6-S1-C04
objectives:
  - Surface the Knowledge Base and Service Catalog through the portal with the correct permissions
---

## What the portal is actually for

Every portal you build has the same underlying business case: let people solve their own problem, and if they cannot, let them ask for help in a structured way. Those two paths are Knowledge and the Service Catalog. Everything else on the page is decoration around them.

This lesson is about surfacing them *through the portal* — which records the portal reads, which pages render them, and which permission model decides what each user sees. Designing the knowledge taxonomy itself, running the article lifecycle, and building catalog items with variables and workflows are separate disciplines covered elsewhere in this pathway. Here, you are the person who makes what those teams produce appear correctly, to the right people, in a portal.

## The Knowledge record chain

Knowledge is three tables deep:

```text
kb_knowledge_base     one library — "IT", "HR", "Facilities"
  └─ kb_category           a section within it; categories can nest
       └─ kb_knowledge          the article itself
```

An article belongs to exactly one knowledge base and, usually, one category. A knowledge base carries its own default workflow, its own owners, and — critically for you — its own read permissions.

Nesting categories is allowed and is usually overdone. Two levels is comfortable to browse in a portal; three is a maze. If a knowledge base needs four levels to be organised, it probably wanted to be two knowledge bases.

The portal reads this chain through a small set of pages that already exist out of the box:

- a **knowledge home** page, which lists knowledge bases and their top categories
- a **category** page, which takes a category sys_id as a parameter and lists its articles and child categories
- an **article view** page, which takes an article sys_id and renders the body, attachments, and feedback controls
- a **search results** page, shared with the rest of portal search

You reach them the same way you reach anything: a page ID and a parameter.

```text
/dev290?id=kb
/dev290?id=kb_category&kb_category=<category sys_id>
/dev290?id=kb_article&sys_id=<article sys_id>
```

Reuse these before you build. They are already wired to the widgets that handle article rendering, versioning, attachments, "was this helpful", and view counts. The common customisation is not replacing them, it is changing which widgets sit on them and in what order.

## Pointing the portal at the right knowledge

The `sp_portal` record has a **Knowledge base** field. Setting it scopes the portal's knowledge widgets and typeahead search to that one library. Leave it empty and the portal offers everything the user can read across every knowledge base.

That single field is the difference between a departmental portal and a general one. An HR portal with the field set to the HR knowledge base will never surprise an employee with a server runbook. A single company-wide portal usually leaves it empty and relies on permissions to do the filtering.

The widgets themselves take options on top of that. The category and article-list widgets typically accept a knowledge base, a starting category, a maximum article count, and whether to show article counts per category. As always: configure the instance, do not clone the widget.

## Permissions: the part that gets audited

Portal knowledge permissions are layered, and the layers apply in order. If any layer says no, the user gets no.

**Layer 1 — can the user see the page?** An `sp_page` with roles set, or with Public unchecked on a portal that allows anonymous access, is gated before knowledge is consulted at all.

**Layer 2 — can the user read the knowledge base?** Each knowledge base carries read and contribute permissions expressed as **user criteria** records. A user criteria record is a reusable named bundle of conditions — roles, groups, departments, companies, locations, or explicit users — and a knowledge base has four related lists that consume them:

- **Can read** — grant. A user matching any of these criteria may read.
- **Cannot read** — deny. A user matching any of these may not, and this wins over any grant.
- **Can contribute** — who may author or edit.
- **Cannot contribute** — the corresponding deny.

**Layer 3 — can the user read this particular article?** The same four related lists exist on the article record, so an individual article can be narrowed beyond its knowledge base. An article inherits the base's permissions unless it defines its own.

**Layer 4 — ACLs.** The ordinary platform access controls still apply underneath everything.

Four working rules follow from that model.

*Deny beats allow, always.* A user in both a "Can read" criterion and a "Cannot read" criterion is denied. This is the intended behaviour and the intended use: grant broadly, then carve out exceptions.

*Criteria are reusable objects, not one-off conditions.* Build a criterion called "All employees" or "Finance department" once and attach it to twelve knowledge bases. Building a new criterion per attachment is how a permission model becomes unmaintainable in a year.

*An empty "Can read" list is not "nobody" — check what your instance does before assuming.* Test it rather than reasoning about it, because the answer determines whether a newly created knowledge base is invisible or wide open.

*Permission failures are silent by design.* An article the user cannot read is simply absent from lists and from search results. That is correct behaviour — the alternative leaks the existence of the article — but it means the only way to verify permissions is to impersonate.

There is one more field that reaches past all of this: an article can be flagged as valid for **public** consumption on a portal that serves unauthenticated users. Treat that flag with the seriousness it deserves. On an internet-facing instance, it publishes the article to the world.

## Surfacing the Service Catalog

The catalog has its own record chain and its own set of out-of-box portal pages:

```text
sc_catalog        a catalog — "Service Catalog", "HR Catalog"
  └─ sc_category       a category within it, nestable
       └─ sc_cat_item       an item, record producer, or order guide
```

The portal pages mirror the knowledge ones: a catalog home, a category page, an item page that renders the item's variables as a form, a cart or checkout page, and a request confirmation page. The `sp_portal` record's **Service catalog** field scopes the portal's catalog widgets the same way the knowledge field scopes knowledge.

Catalog visibility uses the same user criteria mechanism, exposed on categories and items as **Available for** and **Not available for**. The semantics match: deny wins, criteria are reusable, and an item a user is not entitled to simply does not appear.

The item page is where portal work and catalog work meet. The variables, their types, their default values, and the UI policies that show and hide them are all defined on the catalog item and belong to catalog administration. What belongs to you is the page around them: whether the item page shows a description panel, related knowledge, a price, an attachment control, and what the user sees after submitting. Do not solve a catalog problem — a missing variable, a wrong default — by scripting around it in a portal widget. Send it back to the item.

## What the article page actually renders

The article view page is the one knowledge screen users spend real time on, and it is worth knowing what the widgets on it are doing, because "the article looks wrong in the portal" is a ticket you will get.

The article body is stored as HTML on the article record and rendered into the page. That has two consequences. Content pasted from a word processor arrives carrying inline styles and font tags that will fight your theme, so the fix for an article that ignores your typography is almost always in the article, not in your CSS. And any markup in the body is markup on your page — an article with a stray unclosed tag can break the layout of the panel around it.

Only **published** articles appear. An article in draft, in review, or retired is invisible to a reader regardless of permissions, which is a common source of "the article exists but I cannot find it." Check the state before you check the criteria.

The page also renders, depending on which widget instances you place: attachments, the article's version or last-reviewed date, view count, a rating control, a "was this helpful" prompt with a comment box, and related articles. Each is an instance you can remove — and each removal costs something. The date and version tell a reader whether to trust what they are reading. The feedback controls are the only measurement the knowledge team has.

One portal-specific detail: an article that links to another article should link by portal URL, not by a platform record link. A link into the back-end interface drops the reader out of the portal, and on a phone it drops them somewhere unusable.

## The catalog flow, end to end

The catalog is not one page but a short sequence, and the portal renders each step:

```text
catalog home  →  category  →  item (variables form)  →  cart / checkout  →  request confirmation
                                                              ↓
                                                        my requests
```

Two configuration decisions in that flow belong to you rather than to catalog administration.

**Cart or direct order.** Some catalogs let a user accumulate several items and check out once; others submit each item immediately. The behaviour is driven by the catalog's own settings, but the *portal* has to match it — a portal that shows a cart icon on a catalog configured for immediate ordering confuses everybody.

**Where the user lands after submitting.** The confirmation should tell them what happened, give them the request number, and offer a route to track it. A confirmation page that is a dead end generates the exact follow-up call the portal was meant to prevent.

Finally, make sure a "my requests" or ticket-list page is reachable from the header on every page. The second most common reason a person opens a service portal — after asking for something — is checking on something they already asked for.

## Search, and why it is the real navigation

Most portal users do not browse. They type. The portal's search box is backed by **search sources**, and the portal record has a related list of them. Each source describes one place to look and how to display what it finds:

- an identifier and a display name for the result group
- a data-fetch script that returns the results
- a template or widget that renders each result
- whether the source participates in typeahead
- the page to send the user to when they click a result

Out of the box you get sources for knowledge and for the catalog. The high-value additions on a real build are usually a source for the user's own open requests and a source for one or two key tables the business searches by name.

Two things to get right. **Search must respect the same permissions as browsing** — a data-fetch script that queries with elevated rights, or that skips the knowledge permission check, will happily show a user the title and snippet of an article they are not allowed to open. Query as the user. And **typeahead is not free**: every keystroke past the trigger length is a server call, so keep typeahead sources few, limited, and cheap.

## Designing for deflection

The reason organisations fund portals is deflection: a question answered by an article costs a fraction of the same question answered by a person. A few layout decisions do most of that work, and they cost nothing.

**Search goes above the fold and it goes first.** Not in a corner of the header on the home page — a large, obvious, centred search box is the standard pattern because it works.

**Feature the small number of articles that matter.** Password reset, VPN, onboarding, expenses. A "top articles" band pinned to the home page deflects more volume than a beautifully organised eight-level taxonomy nobody browses.

**Put knowledge next to the catalog item, and the catalog item next to the article.** Someone reading "My laptop is slow" should be one click from ordering a replacement. Someone on the laptop request item should see the troubleshooting article first. Both are related-content widget placements, and both are the highest-return thirty minutes of configuration in the whole build.

**Keep the feedback loop wired.** The article view page's rating and "was this helpful" controls feed the knowledge team's improvement backlog. Removing them because they clutter the page removes the only signal anyone has about whether the knowledge base is working.

## Testing what you built

Permissions are unverifiable by inspection. The only reliable method is impersonation, and it needs to be systematic:

1. Build a small matrix — three or four test users, each in different groups or departments, plus one user with no special membership at all.
2. For each user, check four things: what the knowledge home page lists, whether a restricted article opens by direct URL, what the catalog category page lists, and what search returns for a term that appears in a restricted article.
3. The direct-URL check is the one people skip and the one that finds real defects. Hiding a link is not a permission.
4. Repeat the whole matrix after any change to a user criterion, because criteria are shared and a change made for one knowledge base applies everywhere it is attached.

## Practice

Continue in your `dev290` portal. Use a personal developer instance so you can create test users freely.

1. **Create a scoped library.** Create a knowledge base named `SN290 Practice`, two categories under it, and four short articles spread across them. Publish them.
2. **Wire it to the portal.** Set your portal record's Knowledge base field to the new base. Add the knowledge category widget to your home page and confirm your two categories appear. Navigate to a category page and then to an article page, and note the page ID and parameter in the URL at each step.
3. **Build the permission model.** Create two user criteria: one matching a group your test user belongs to, one matching a department they do not. Put the first on the knowledge base's Can read list. Confirm your test user can read. Then put the second criterion's members on Can read as well and confirm nothing changes for your user.
4. **Prove that deny wins.** Add a criterion to one *article's* Cannot read list that matches your test user. Impersonate them and confirm the article is missing from the category listing, missing from search results, and inaccessible by direct URL. Record all three results.
5. **Surface the catalog.** Add a catalog category widget to your home page scoped to one catalog category. Restrict one item in that category with a Not available for criterion matching your test user, and confirm the item disappears from both the category page and search for them.
6. **Connect the two paths.** Place a related-knowledge widget on a catalog item page, or a related-catalog widget on an article page, so a user can move between "read about it" and "request it" in one click. Explain in two sentences which direction you chose and why it fits the task.
7. **Run the matrix.** Build the four-check impersonation matrix described above for two users, and write down every cell. If any direct-URL check succeeds where the listing hid the record, fix it before you call the exercise done.
