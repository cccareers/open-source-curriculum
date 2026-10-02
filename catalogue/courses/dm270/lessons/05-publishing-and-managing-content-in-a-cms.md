---
lesson_id: dm270-05
course_id: dm270
pathway: digital-marketer
title: Publishing and Managing Content in a CMS
order: 5
kind: lesson
competency_ids:
  - D2-S1-C02
objectives:
  - Publish, structure, and maintain content in a CMS
  - Use taxonomies, templates, and metadata to keep a content library usable
---

## The problem this lesson solves

Anyone can publish one post. The skill is publishing the two-hundredth post into a library that is still navigable, still maintainable, and still findable — by readers, by your colleagues, and by you in eighteen months when someone asks "do we have anything on frost dates?"

Almost every content library that becomes unusable became unusable the same way: nobody decided the structure, so the structure was decided one post at a time by whoever was publishing that afternoon. Categories accumulated. Tags multiplied. Images landed as `IMG_4471.jpg` with no alt text. Three posts answered the same question and none of them was the good one.

This lesson is about deciding the structure on purpose and then maintaining it.

**Scope.** dm201 lesson 09 covered the SEO-facing side of publishing — the fields that produce a title element, a meta description, a canonical, a robots directive, and how to prove what actually shipped by reading the source. That work is assumed and not repeated here. This lesson covers the **content model, the taxonomy, the templates, the media library, the editorial workflow, and the maintenance loop** — the structural decisions that make a library survive.

The CMS is taught generically. The worked example uses WordPress-style vocabulary — posts, custom post types, taxonomies, templates, the media library — because it is the vocabulary most widely shared, and every concept maps onto other systems with different labels. Whatever system your organization uses, learn the mapping in your first week.

## The three layers underneath every CMS

**The content model** is the definition of what kinds of things exist and what fields each kind has. A "guide" has a title, a body, an author, a reviewed-by, a difficulty. A "plant" has a name, a botanical name, a sowing depth, a hardiness zone range. This layer is data.

**The templates** are the code that turns a record into a page. They decide which fields appear, in what order, wrapped in what markup. You usually do not own this layer — a theme author, an agency, or your engineering team does — and knowing where its boundary sits is what stops you from promising something you cannot deliver.

**The editorial workflow** is who can do what, in which order, and what states a piece passes through on the way to being live. This layer is people, and it is the one most often left entirely undesigned.

A marketer who understands all three can be productive in an unfamiliar CMS in an afternoon. A marketer who only knows one product's menus starts over every time they change jobs.

## Designing the content model

Start from the question: **what kinds of things do we publish, and are they actually different?** Two things are different kinds if they have different fields, different templates, or different lifecycles.

Harvest Lane began with everything as a blog post — 63 of them, including twelve plant profiles and four "recipes" that were really seasonal guides. Everything looked the same, nothing could be filtered, and the plant profiles were unusable because a reader who wants to know how deep to sow beetroot does not want a 900-word essay.

Modelled properly:

```yaml
content_types:

  post:
    purpose: Timely writing - seasonal notes, announcements
    fields: [title, body, author, published_date, featured_image]
    taxonomies: [topic]
    lifecycle: Ages out. Reviewed yearly, retired freely.

  guide:
    purpose: The evergreen pillar content. The main asset.
    fields:
      - title
      - body
      - summary_answer        # the 40-word answer, shown up top
      - author
      - reviewed_by           # SME name; renders as a byline note
      - last_reviewed         # date, rendered visibly
      - difficulty            # beginner | some experience
      - featured_image
      - related_plants        # relation -> plant
    taxonomies: [topic, season, skill_level]
    lifecycle: Updated in place forever. Never retired casually.

  plant:
    purpose: Reference records. Structured, scannable, filterable.
    fields:
      - common_name
      - botanical_name
      - sow_depth_inches      # number, not prose
      - min_bed_depth_inches  # number
      - days_to_harvest       # number
      - sun_requirement       # full | partial
      - hardiness_zones       # range: 3-10
      - sowing_window         # relation -> season
      - body                  # short notes only, 150 words max
    taxonomies: [season, zone, plant_family]
    lifecycle: Corrected, not rewritten. Owned by Elena.

  landing_page:
    purpose: Product and campaign pages
    fields: [title, body, hero_image, primary_cta]
    taxonomies: []
    lifecycle: Owned by the commercial side.
```

The important move is on the `plant` type. `sow_depth_inches: 0.5` as a **number in a field** can be sorted, filtered, compared, rendered into a table on the guide page, and corrected in one place. The same fact buried in a sentence in a body field ("sow about half an inch deep") is invisible to the system. That is the whole argument for structured content: **anything you will want to reuse, filter, or compare belongs in a field, not in prose.**

The counter-discipline matters too. Every field you add is a field someone must fill in on every record forever. A model with 30 fields per type gets half-completed and then lies to you. Add a field when you can name the place it will be used.

Two fields in the `guide` type are worth noticing because they are unusual: `reviewed_by` and `last_reviewed`. They exist because Harvest Lane's credibility rests on Elena, and because a visible review date is both an honest signal to readers and the mechanism that drives the maintenance loop at the end of this lesson.

## Taxonomies: the part that goes wrong

A **taxonomy** is a controlled way of classifying records. In WordPress vocabulary, categories and tags are two built-in taxonomies and you can create your own; every CMS has an equivalent, sometimes called collections, labels, or reference lists.

The distinction that matters is not "category versus tag." It is **planned versus freeform**.

- A **planned taxonomy** has a fixed, small set of terms that you decided in advance. Adding a term is a decision someone makes on purpose.
- A **freeform taxonomy** lets any author type any term. It grows without limit, and it always ends the same way: one writer types "raised beds," another "raised bed," a third "Raised Beds," and you now have three terms with two posts each and a navigation system that lies.

Harvest Lane's audit found 147 tags across 63 posts. Eighty-one of them were used exactly once.

Design taxonomies to answer the question **"how will someone want to filter this library?"** — not "what is this post about," which is what the body is for.

| Taxonomy | Applies to | Terms | Rule |
| --- | --- | --- | --- |
| **Topic** | post, guide | 4 terms, one per content pillar | Exactly one per record. Never more. |
| **Season** | guide, plant | Early spring, Late spring, Summer, Autumn, Winter | One or more. Fixed list; only Elena adds terms. |
| **Skill level** | guide | Beginner, Some experience | Exactly one. |
| **Zone** | plant | 3–10 | Numeric range. Drives the zone filter. |
| **Plant family** | plant | 9 terms (nightshade, brassica, legume…) | Elena owns. Drives crop-rotation guidance. |

Three governance rules keep this from decaying:

1. **Every taxonomy has an owner** and a written list of legal terms. If a term is not on the list, it does not get created; the request goes to the owner.
2. **A term must earn its existence.** A useful rule of thumb: no term stays unless at least five records will carry it. One-record terms produce empty-feeling archive pages and split your library.
3. **Turn off what you will not govern.** If nobody will own freeform tags, disable them. An unmanaged taxonomy is worse than no taxonomy, because the site's navigation now makes a promise it cannot keep.

**What happens on the front end.** In most systems every taxonomy term automatically generates an archive page listing its records — `/topic/getting-the-soil-right/`, `/season/early-spring/`. That is a feature when the term is planned and populated, because the archive becomes a genuine hub someone can browse. It is a liability when the term has one record. How those archives should be handled for search engines is dm201's subject; the point here is that **creating a term creates a page**, and most people creating terms do not know that.

## Templates, and the boundary you do not own

A template turns a record into HTML. Practically, three things follow.

**What you type is not necessarily what renders.** A field may be truncated, ignored, or wrapped in markup you did not choose. The only proof is to publish one record and look at the live page. Do this once per content type when you join, and write down what you find.

**Adding a field does not make it appear.** New fields in the content model are invisible until someone edits the template to render them. Harvest Lane's `last_reviewed` field sat filled and unrendered for two months because nobody made that request. When you propose a model change, propose the template change in the same breath.

**Reusable blocks are your lever inside the template.** Most systems let an editor save a block of content — a callout, a "reviewed by Elena" box, a soil-calculator embed — and reuse it across records, editing it once in one place. Use them for anything that appears on more than five pages. The alternative is copy-paste, and copy-paste means the day the calculator's link changes you edit 31 posts and miss four.

Work with whoever owns the template by bringing them a specification, not a vibe. "The guide template should render `last_reviewed` under the byline as 'Reviewed by {reviewed_by}, {last_reviewed}'" is a ten-minute ticket. "Can we make guides feel more trustworthy?" is a meeting.

## The media library

The media library is the fastest-decaying part of any CMS, because uploading is frictionless and organising is not.

**Name the file before you upload.** `raised-bed-12in-depth-cross-section.jpg` is searchable in the library. `IMG_4471.jpg` is not, and in six months you will re-upload a photo you already have. Name it at the desktop, because most systems keep the upload filename forever.

**Write alt text in the upload dialog, not later.** Every CMS has the field right there. Filling it at upload takes eight seconds; auditing 400 images for missing alt text takes a week. If the image is decorative, set alt to empty deliberately — an empty alt is a decision, a missing alt is a defect that makes a screen reader read the filename aloud.

**Know the difference between alt text and a caption.** The caption is visible to everyone and adds context ("Elena's propagation bench in February"). The alt text describes what the image communicates for someone who cannot see it. They are different sentences with different jobs, and putting the caption in both fields means screen reader users hear it twice.

**Resize before uploading.** A 4,000-pixel photo straight from a camera makes the page slow for every visitor forever. Export at roughly twice the largest size it will display, and keep it under a few hundred kilobytes.

**Have a findability strategy.** Most libraries support folders, or tags on media, or at minimum a naming convention with a shared prefix per project (`leggy-seedlings-*`). Pick one and write it down.

**Delete nothing casually.** Deleting a media item breaks it on every page that used it, usually silently. Check usage first; most systems will tell you where a file is attached.

## Metadata that keeps a library maintainable

Beyond the fields readers see, a working library carries internal metadata that readers never see. These are the fields that make maintenance possible instead of heroic:

| Internal field | Why it exists |
| --- | --- |
| **Pillar** | Any record with no pillar is a strategy leak. Reviewed quarterly. |
| **Owner** | A named person, not "marketing." Unowned content never gets updated. |
| **Source / SME** | Who verified the facts. Needed when a fact changes. |
| **Review by (date)** | Drives the maintenance queue. Every guide has one. |
| **Replaces / replaced by** | The audit trail for merges and redirects. |
| **Assets used** | Which video, which graphic — so a reshoot updates everything. |

Not every CMS gives you custom fields for editorial metadata, and if yours does not, a spreadsheet keyed by URL is a perfectly respectable substitute. The failure is not the tool; it is not recording it at all.

## Editorial workflow

Statuses and permissions exist so that work-in-progress cannot become live by accident and so everyone knows whose turn it is.

| Status | Meaning | Who moves it forward |
| --- | --- | --- |
| Draft | Being written | Writer |
| SME review | Facts being checked | Elena — initials in the doc |
| Copy edit | Six-pass edit from lesson 03 | You |
| Ready to publish | Everything done, awaiting date | You |
| Scheduled | Date set, will go live automatically | System |
| Published | Live | — |
| Needs update | Live but flagged by the review queue | Owner |

Four practical notes.

**Roles should match the workflow.** Give the writer permission to draft and edit their own work but not to publish; give the SME comment access; keep publishing with the person accountable for the checklist. Every accidental publish traces back to a role that was broader than the job.

**Use scheduling, and check the time zone.** The most common publishing incident in any team is a post that went live at 3am because the site runs on a different clock than the person setting the date.

**Revisions are a safety net, and they are not infinite.** Most systems keep a version history; know how to restore one before you need to. Know also that many hosts prune old revisions, so a piece you may need to roll back should be exported.

**Preview is not proof.** Preview renders in a context that is not always identical to the live template. Check the live URL after publishing — on a phone.

## Accessibility inside the editor

Most accessibility failures on a content site are created in the editor, by a marketer, in about four seconds. All of them are avoidable there.

**Use real heading blocks in order.** Do not bold a paragraph and increase its size to make it look like a heading. To a sighted reader those are identical; to someone navigating by headings the second one does not exist.

```html
<!-- Looks like a heading. Is not one. -->
<p><strong>How deep for carrots</strong></p>

<!-- Is one. Appears in the heading navigation. -->
<h3>How deep for carrots</h3>
```

Keep the order sequential — H2, then H3 under it, never H2 straight to H4 because H4 looked better. If the heading levels are the wrong size visually, that is a CSS request, not a reason to break the structure.

**Use the table block, with header cells.** A table pasted as a screenshot is unreadable to a screen reader, unselectable, and unusable on a phone. A real table needs its header row marked as headers, so a screen reader can announce "Crop: carrot, Minimum depth: 12 inches" instead of reading a grid of loose numbers.

**Write link text that stands alone**, as in lesson 03. This is an editor behaviour: the temptation to type "click here" is strongest when you are pasting a link at the end of a paragraph in a hurry.

**Do not set every link to open in a new tab.** It takes control away from the reader and breaks the back button; when you do it for a genuine reason, say so in the link text.

**Fill the alt field.** Yes, again. It is the single highest-frequency accessibility defect in every content library that has ever been audited.

**Check contrast when the editor lets you pick colours.** Block editors that offer a colour palette will happily let you put light grey text on white.

**Embedded video needs its captions and its transcript.** The transcript from lesson 04 goes on the page under the embed, as text.

## The publishing checklist

This is the structural checklist. Run it alongside the SEO field checks from dm201 lesson 09, not instead of them.

**Before publishing**

1. Correct content type selected — a guide entered as a post gets the wrong template, the wrong fields, and the wrong lifecycle.
2. All required fields for the type completed, including the summary answer.
3. `reviewed_by` and `last_reviewed` filled; SME has signed off on every number.
4. Exactly one Topic term; Season and Skill level from the fixed lists. No new terms invented in the publish flow.
5. Headings are real heading blocks, sequential, and the skim path reads coherently.
6. Every image: named descriptively, sized sensibly, alt text written or deliberately empty.
7. Tables are table blocks with header cells — not screenshots.
8. Link text stands alone; internal links point to live URLs.
9. Reusable blocks used for anything shared across pages.
10. Internal metadata filled: pillar, owner, review-by date, assets used.
11. Preview at phone width.

**After publishing**

12. Load the live URL on a phone and confirm the fields you filled actually rendered.
13. Confirm the piece appears on the archive pages of its taxonomy terms.
14. Add inbound internal links from the related existing pages, so it is not an orphan.
15. Add the review-by date to the maintenance queue.

Item 14 matters more than it looks. A new page that nothing links to is reachable only by people who already know it exists, which is nobody.

## Maintaining the library

Publishing is the beginning of a piece's life. Four recurring jobs keep the library from rotting.

**The quarterly inventory.** Export every URL with its type, taxonomy terms, owner, publish date, and review date. Most systems export this natively; a spreadsheet is fine. Read it once a quarter. You are looking for records with no pillar, no owner, an overdue review date, or a taxonomy term used only once.

**The review queue.** Every guide has a review-by date. When it comes up, the owner decides: still correct (bump the date), needs an update (schedule it into a calendar slot as in lesson 02), or superseded (merge). This is the mechanism that stops "we should update that" from being a feeling.

**Merges and retirements.** When two records answer the same question, pick the stronger URL, fold the good material in, and redirect the weaker one to it. Record the move in the `replaces` field. Never leave two half-answers standing — you split your readers, and you double the maintenance forever. When a record serves no pillar and has no audience, retire it and redirect it to the nearest useful page rather than deleting it into a dead end.

**Link and media hygiene.** Run a broken-link check quarterly; internal links break silently every time someone changes a slug. Check for orphan media — files uploaded and never used — and for pages that nothing links to.

One honest note on effort. This maintenance loop is roughly a day per quarter for a library the size of Harvest Lane's, and it is the first thing cut when a quarter gets busy. Put it in the calendar as a slot with an owner, exactly like a publishing slot, or it will not happen.

## When the CMS will not do what you need

Sometimes the system genuinely cannot do the thing. A platform may not support custom content types, or custom taxonomies, or a per-record field you need. Three responses, in order of preference: **change the plan** to fit what the system does well; **request the build** with a written specification and a business reason; or **track it outside the CMS** in a spreadsheet keyed by URL until it can be built.

What you should not do is fake it inside the body field — encoding structure in prose conventions that only you understand, so that the day you leave, the library becomes unreadable. If a structure matters, it belongs in a field, in a taxonomy, or in a documented external record.

## Practice

Work in a real CMS you can publish to: your employer's, a client's, or a free personal site you create for the purpose. Use the brand and content plan from lessons 02 to 04.

**Part 1 — Map the three layers.** In your chosen system, find and document: where content types are defined (or that they are not supported), where taxonomies are managed, who owns the templates, and what workflow statuses and roles exist. One page, with the system's own vocabulary mapped to the terms in this lesson.

**Part 2 — Content model.** Design a content model for your brand in the YAML format used above: at least three content types, each with its purpose, fields, taxonomies, and lifecycle. At least three fields must be structured data (a number, a date, a fixed choice, or a relation) rather than free text, and for each of those write one sentence naming where that field will be reused.

**Part 3 — Taxonomy design and governance.** Design your taxonomies in the five-column table format. For each: the terms, which content types it applies to, whether one or many terms per record, and the named owner. Then write the governance rules, including what happens when someone wants a new term. If your site has existing tags, count them, count how many are used only once, and write the consolidation plan.

**Part 4 — Prove the template boundary.** Publish one throwaway test record. Note anything you typed that did not render, or rendered differently. Write down one field you would need to request from whoever owns the template, phrased as a specification a developer could implement without asking you a question. Delete the test record.

**Part 5 — Publish for real.** Publish the piece you wrote in lesson 03, with the video from lesson 04 embedded and its transcript below it. Work the fifteen-point checklist and record a pass or fail with evidence on each item. Every image gets a descriptive filename and alt text (or a deliberate empty alt, noted as deliberate). Every table is a table block with header cells.

**Part 6 — Reusable block.** Create one reusable block that will appear on at least three records, and use it on at least two. Say in one sentence what breaks if it is copy-pasted instead.

**Part 7 — Accessibility audit of the editor output.** On your published page, verify: heading levels sequential with no faked headings, alt text present or deliberately empty on every image, tables as real tables with headers, link text that works out of context, no unnecessary new-tab links, sufficient contrast on any coloured text. Record every defect found and fixed.

**Part 8 — Inventory and maintenance plan.** Export or build an inventory of every URL on the site with type, taxonomy terms, owner, publish date, and review-by date. Identify: records with no pillar, terms used only once, and the three oldest records. Then write a maintenance plan naming the quarterly cadence, the owner, and the specific first three actions — including at least one merge, with the URL that survives, the URLs that redirect to it, and why.

**Deliverable — Content Library Pack.** One document containing: the three-layer map, the YAML content model with the reuse justifications, the taxonomy table and governance rules, the template-boundary findings and the field specification, the published URL with the completed fifteen-point checklist, the accessibility audit, the inventory, and the maintenance plan.
