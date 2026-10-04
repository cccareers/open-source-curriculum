---
lesson_id: sn330-05
course_id: sn330
pathway: servicenow-implementation-specialist
title: Employee Center and HR Portal Configuration
order: 5
kind: lesson
competency_ids:
  - D4-S1-C02
  - D6-S1-C01
objectives:
  - Configure the Employee Center so employees can serve themselves without contacting HR directly
---

## The self-service surface

Everything you configured in the last three lessons — services, cases, templates, knowledge — is invisible to an employee until it is published on a self-service surface. The **Employee Center** is that surface: a single portal where an employee finds answers, requests things, tracks what they have already requested, and reads what the company wants them to know.

You already know how portals are built. sn290 covered pages, widgets, instances, themes, and the widget lifecycle, and this lesson does not repeat it. What changes in the Employee Center is *how much of that machinery you should touch*. The Employee Center is a configured product, not a blank portal. Its landing page, search, request tracking, and content model are assembled from configuration records, and an implementation that responds to every requirement by cloning a widget and writing client script has chosen a maintenance burden it did not need. The professional skill here is knowing which requirements are configuration and which genuinely need portal development.

A useful default: **configure the taxonomy and content records first, and only reach for widget work when the requirement is about layout or interaction that no configuration record expresses.**

## One portal or many?

The first question a stakeholder will ask is whether HR should have "its own portal." Usually the answer is no, and it is worth being able to say why.

The Employee Center is deliberately cross-departmental. An employee does not think in terms of which department owns their problem; they think "I moved house" or "I am going on leave," and that single life event touches HR, IT, facilities, and payroll. A unified portal lets one search box and one request list cover all of it, and lets you build content around the employee's event rather than around your org chart.

Separate portals create real costs: duplicated branding, duplicated announcements, two places to check for request status, and a navigation decision the employee has to make before they can even search. Reach for a second portal only when the *audience* is genuinely disjoint — a portal for external contingent workers with a different identity provider and a much smaller content set is a legitimate case. "HR wants its own look" is not.

Within one portal, differentiation comes from **targeting**, not from separate sites. That is what the rest of this lesson is about.

## The content model: taxonomy, topics, and content items

The Employee Center organizes content with a taxonomy rather than with hard-coded page links, and this is the single most important thing to understand about it.

A **taxonomy** is a named tree used for a purpose. A typical implementation has one primary taxonomy for browsing ("what employees are looking for") and may have others for specialized navigation.

A **topic** is a node in that tree. Topics nest: "Leave and Time Off" might contain "Parental Leave," "Sick Leave," and "Sabbaticals." Each topic has a name, a description, an icon or image, and its own visibility settings.

A **content item** is a link between a topic and a thing an employee can consume. The thing can be a knowledge article, a catalog item or record producer, an HR service, a quick link to an external system, or a page in the portal. One piece of content can appear under several topics — the parental leave article legitimately belongs under both "Leave and Time Off" and "Life Events: New Child."

Two consequences follow, and both are why the taxonomy is worth designing carefully.

**Navigation is data, not code.** Adding a new HR service to the portal is creating a content item, not editing a page. HR content owners can do it. That is the win.

**Targeting can be applied per topic and per content item.** A topic visible only to managers, or a content item visible only to US employees, is a field on a record. This is how one portal serves populations that need different things.

### Designing the taxonomy

Design it around **employee language and employee events**, not around HR's internal structure. Employees do not know what a COE is, and "Total Rewards" means nothing to most of them.

A workable top level looks like: Pay and Benefits; Leave and Time Off; My Career and Development; Health and Wellbeing; Life Events; Working Here (policies, facilities, IT); New to the Company. Notice that "Life Events" cuts across every COE — moving house, having a child, getting married, a bereavement — and that cross-cutting grouping is exactly what the taxonomy is for.

Three rules of thumb:

- **Keep the top level under about eight items.** A landing page with twenty tiles is a list, and lists are what search is for.
- **Depth of two or three, not five.** If an employee needs four clicks, they will use search instead, and your taxonomy is decoration.
- **Every topic must contain something on day one.** Empty topics teach employees that browsing does not work.

## Targeting content to the right employee

Targeting in the Employee Center works on the same conceptual footing as knowledge user criteria and HR criteria: a named population, applied to a thing.

You will apply targeting to:

**Topics.** A "People Leader" topic visible only to managers. A "Union Representation" topic visible only to represented employees.

**Content items.** The same knowledge article surfaced under a topic can carry its own audience, and a catalog item can be visible only to employees eligible to request it.

**Announcements.** Time-bounded messages on the landing page, targeted so that an announcement about a US benefits enrollment deadline is not shown to employees in Singapore.

**Quick links and cards.** Region-specific external systems — a local payslip provider, a country-specific pension portal — targeted the same way.

Two design cautions carried forward from the knowledge lesson, because they bite here too.

**Fail-closed targeting degrades badly when data is missing.** An employee whose work country is blank matches no country criterion and sees an empty page. Always have an untargeted fallback: a generic topic, a generic "how do I contact HR" content item, or an overview article. Build the fallback before you build the targeting.

**Do not use targeting as a security control for record data.** Hiding a content item stops it appearing in the portal; it does not stop the underlying record being readable if ACLs permit. Targeting is a relevance mechanism. Access control lives in ACLs and user criteria on the data itself, which is the next-but-one lesson.

## Requests: closing the loop

An employee who submits something and then has no idea what happened will call HR, which defeats the entire exercise. The request-tracking experience is therefore not a nice-to-have; it is half the value of the portal.

Configure it so that an employee's request list shows **everything they have asked for**, regardless of which application fulfills it: HR cases across the COEs they can see their own records in, catalog requests, and IT tickets. Employees do not care that one is an HR case and one is a request item.

For each request, the employee should see a state label they understand, when they can expect an answer, the employee-facing comment thread, and a way to add information or withdraw. Two configuration details do most of the work here:

**Translate internal states into employee language.** "Awaiting acceptance" means nothing; "Ready for your review" does. Configure the display labels rather than renaming the underlying states, which would break your reporting and your flows.

**Make the comment stream two-way and obvious.** When HR asks for information, the employee must be able to answer in the portal, and that answer must land in the case as an employee-facing comment. Test this round trip explicitly; it is frequently half-configured.

Also decide what an employee sees about cases where they are the subject but not the requester — a manager-initiated case about them, or an onboarding lifecycle event created before they had an account. Usually they should see it. Confirm the requirement with HR rather than assuming.

## Search

Search is how most employees will actually use the portal, and it is worth configuring rather than accepting.

Make sure search returns **across sources**: knowledge articles, catalog and HR services, topics, and — scoped to the searching employee — their own requests. An employee typing "verification letter" should get the article, the service they can request, and their existing open case for it.

Configure search-time **deflection** on the request path, as covered in the knowledge lesson: matching articles appear before the form is submitted.

Then do the unglamorous work: sit with the search log. Every implementation has a list of high-volume searches with zero results, and it is the highest-value backlog you will ever get for free. Each zero-result term is either missing content, a missing service, or a synonym you have not configured.

## Branding and layout, in proportion

The Employee Center supports theming — colors, logo, fonts, header imagery — through configuration. Do that; it matters for adoption that the portal looks like the company's.

Where implementations go wrong is the next step: cloning core widgets to move a tile three pixels, or rebuilding the landing page from scratch to match a design mock produced by an agency that has never seen the platform. Every cloned widget is a record you now own forever and will hand-merge at every upgrade.

A defensible position to hold in a design workshop:

- **Branding, imagery, and content are yours to change freely.** Configure them.
- **Layout of the standard regions** — which content blocks appear, in what order — is largely configurable. Use those levers before writing code.
- **Genuinely novel interaction** — a bespoke onboarding checklist experience, an interactive benefits comparator — is real portal development, and it belongs in its own widget on its own page, not as a fork of a core one.

Write down which category each requirement falls into during design, and make the stakeholder aware of the cost of the third category. That conversation is part of the implementer's job.

## Forms: catalog items, record producers, and HR services

An employee who clicks a request needs a form, and there are three ways that form can exist. Choosing badly here is a common source of duplicated effort.

**A record producer on the HR case table** is the natural fit for most HR requests. It presents variables to the employee and creates an HR case directly, carrying the variables onto the case. Use it when the outcome is an HR case worked by an HR team — which is most of what you built in lesson 3.

**A catalog item** creates a request and request item in the service catalog's own fulfillment model. Use it when the fulfillment genuinely belongs to another department's process — the equipment order, the desk assignment — or when the request needs the catalog's ordering, quantities, or price mechanics.

**The HR service's own configured intake** ties the presentation to the service record, so the service, the template, the routing, and the form are one coherent unit. Prefer this where the platform offers it, because it keeps you from maintaining a form in one place and a routing rule in another.

Whichever you use, the variable design rules are the same and they matter more in HR than elsewhere:

**Ask the minimum.** Every variable is data you will hold, protect, and eventually have to justify. Revisit the minimization argument from the privacy lesson before adding a field.

**Never ask for what the platform already knows.** Employee number, department, manager, and work location come from the HR profile. Asking the employee to type them produces worse data than the system already has and signals that self-service is a form, not a service.

**Use variable visibility rather than separate forms.** The salary-inclusion consent question that only appears when salary is requested is one form with a condition, not two services.

**Write the labels for employees.** "Subject person" is HR's word. "Who is this request for?" is the employee's.

## Language, accessibility, and the people at the edges

Two populations get forgotten in portal design, and both are large in an HR context.

**Employees who do not work in the implementation language.** Where the organization is multilingual, decide early whether the portal is translated, because it changes how you author everything: topic names, content item labels, announcement text, knowledge articles, and form variables all become translatable content. Retrofitting translation onto a portal built in one language is expensive. Even where full translation is out of scope, know that the decision was made rather than defaulted into.

**Employees without a desk.** A large share of the workforce in logistics, retail, manufacturing, and healthcare has no company laptop and may have no company email. If those employees are in scope, the portal has to work on a phone, on a personal device, possibly on a shared kiosk, and possibly for someone who cannot receive a notification by email. That affects authentication, notification channel, and layout, and it is a requirement to surface in design rather than discover at go-live.

**Accessibility** is not optional for an internal HR system: an employee with a visual impairment must be able to request their own accommodation. Use the platform's standard components, which carry accessible markup, rather than bespoke widgets; keep contrast and font sizing within the theme's accessible range; and make sure any custom interaction you do build is reachable by keyboard. Every cloned widget is also an accessibility regression risk, which is one more reason to prefer configuration.

## Measuring adoption

The portal either reduced HR's inbound contact or it did not, and you should be able to say which.

Watch four things after go-live:

**Case volume by channel.** Portal-submitted cases should rise while email and phone fall. If total volume rises and phone does not fall, you have added a channel rather than moved demand.

**Deflection**, as covered in the knowledge lesson.

**Task completion in the portal.** How many employees who started a request finished it. A high abandonment rate on one form is a form problem — usually too many variables or one confusing one.

**Zero-result searches and unvisited topics.** Topics nobody opens are either badly named or in the wrong place. Renaming a topic to match the words employees actually search for is the cheapest improvement available.

Report these monthly to the HR stakeholder. The portal is the part of the implementation whose value is most visible and most easily proven, and proving it is what funds the next phase.

## Worked example: publishing a leave-of-absence request

The requirement: US full-time employees can request a leave of absence from the portal. The request must be discoverable by browsing and by search, must show the relevant policy before submission, must route to the total rewards COE, and must not be visible to contractors or to employees outside the US.

**The HR service already exists** from the case management lesson, with its COE, template, and assignment. Nothing about publishing changes it — that is the point of separating the service from its presentation.

**Taxonomy placement.** Create or reuse two topics: "Leave and Time Off" and "Life Events." Create a content item for the leave-of-absence service under each, so an employee arriving from either direction finds it.

**Targeting.** Apply an audience to both content items: US work country and full-time employment type. Verify the criterion reads HR profile attributes rather than a hand-maintained group.

**Fallback.** Under "Leave and Time Off," add an untargeted content item pointing at the unrestricted "Types of Leave — Overview" knowledge article, so a UK employee browsing that topic sees something useful rather than an empty shelf.

**Deflection.** Attach the US leave policy article to the service's intake path so it is shown before submission.

**Announcement.** If there is a policy change effective next quarter, publish a targeted, date-bounded announcement to the same population rather than editing the landing page.

**Verification.** Impersonate four users: a US full-time employee (sees the request under both topics, sees the policy on the way in), a US contractor (sees the overview article, does not see the request), a UK full-time employee (same), and a user with no work country set (sees the overview — confirming the fallback works). Then submit as the first user and confirm the case appears in their request list with a comprehensible state, that HR can ask a question, and that the employee can answer from the portal.

Notice again that the entire example was configuration records: topics, content items, audiences, an announcement, and a deflection setting. No widget was harmed.

## Practice

Work in a development instance with the Employee Center available and with the HR services and knowledge you built in lessons 3 and 4. Prepare at least four test users differing by work country, employment type, and manager status.

1. **Design the taxonomy on paper first.** Produce a top level of no more than eight topics with employee-facing names, and expand two of them one level down. For each second-level topic, list the content items you intend to place there and their source (knowledge article, HR service, quick link). Mark which ones will be targeted and to whom.

2. **Build it.** Create the topics and content items for the two branches you expanded. Every topic you create must have at least one content item; delete or defer any that does not.

3. **Publish one HR service end to end.** Take the leave-of-absence or employment-verification service and make it requestable from the portal, discoverable under at least two topics, and preceded by a relevant knowledge article at intake.

4. **Target and prove it.** Apply an audience to at least two content items and one announcement. Then run an impersonation matrix across your four test users: predict what each should see on the landing page and in each topic, then check. Record every mismatch and its cause.

5. **Build the fallback and demonstrate it.** Deliberately create a test user with a missing or unmatched work country. Show that they still land on something useful. If they see an empty topic, fix it and describe what you changed.

6. **Exercise the request round trip.** As an employee, submit a request. As the assigned agent, move the case to awaiting info and ask a question through the employee-facing comment field. As the employee again, answer from the portal. Confirm the answer lands on the case, the state returns to in progress, and the employee sees the updated status. Document any step that did not work out of the box.

7. **Read the search log.** Perform at least ten searches as different test users, including several that you expect to fail. Then open the portal's search log and list the zero-result terms. For three of them, state whether the fix is new content, a new service, or a synonym or keyword change.

8. **Draw the configuration line.** Take three portal requirements — invent them if you like, but make one of them cosmetic, one of them about targeting, and one of them a genuinely novel interaction — and classify each as theme configuration, content configuration, or portal development. For the development one, write two or three sentences on what you would build and what ongoing cost you would be asking the customer to accept.

## Check your understanding

1. HR asks for its own portal "to have its own look." What do you recommend, and why?
2. Adding a new HR service to the Employee Center: page edit or record?
3. A content item is hidden from contractors by targeting. Can a contractor still read the underlying knowledge article?
4. An employee with no work country sees an empty "Leave and Time Off" topic. What was skipped?

*Answers:* (1) One Employee Center with targeting; separate portals duplicate branding, announcements, and request tracking, and force the employee to pick a department first. (2) A content item record in the taxonomy. (3) Possibly, if ACLs and user criteria on the article allow it; targeting is relevance, not access control. (4) An untargeted fallback content item.
