---
lesson_id: sn360-05
course_id: sn360
pathway: servicenow-implementation-specialist
title: The Customer Service Portal
order: 5
kind: lesson
competency_ids:
  - D3-S1-C02
  - D6-S1-C01
objectives:
  - Customize the customer service portal so external customers can serve themselves securely
---

## A portal for people who do not work here

You built portals in sn290. The mechanics — portal records, pages, page routes, containers, rows, columns, widget instances, themes — are unchanged here, and this lesson does not reteach them. What changes is the audience, and the audience changes almost every design decision.

An employee portal has a forgiving threat model. Everyone on it already passed your identity checks, already has a `sys_user` record you control, and works for the same company as the data. A customer service portal has none of that. The people on it belong to different companies that must not see each other, they self-register, they arrive from a link in an email at midnight, and some of them are competitors. A widget that leaks one account's case list to another account is not a bug report — it is a breach notification.

So the shape of this lesson is: start from the shipped customer service portal rather than a blank one, customize it through configuration wherever configuration will do, and spend the majority of your care on the access model rather than the layout.

## Start from what ships

CSM installs a customer service portal — a portal record with a URL suffix, a theme, a set of pages, and page routes for the pages a customer needs: a home page, a case list, a case detail view, a create-case form, knowledge, the service catalog, and account and profile pages. The temptation on day one is to create a fresh portal record and rebuild. Do not. The shipped portal encodes months of thinking about external access that you would otherwise rediscover the hard way, and it is maintained across upgrades.

Customize in this order of preference, and only escalate when the tier above genuinely cannot do the job:

1. **Portal record and theme.** Logo, title, colors, the login page, the default homepage route, the `kb_knowledge_base` and catalog the portal points at.
2. **Widget instance options.** Nearly every shipped widget exposes an option schema — how many records to show, which table, which filter, which title, which page to link to. Changing an instance option is upgrade-safe and takes a minute.
3. **Page layout.** Clone the shipped page, rearrange containers and rows, add or remove widget instances, and point the page route at your clone.
4. **A new widget.** Only when no shipped widget produces the behavior. You know how to write one; the discipline here is to make sure you needed to.

A cloned page and a cloned widget both fall out of the upgrade path. That is an acceptable cost, paid deliberately, once. It is not acceptable as a reflex.

## The homepage: designing for deflection

The customer homepage has one job: get the customer to their answer with the fewest steps, and only open a case when the answer does not exist. Every widget on it either serves that job or is decoration.

A homepage that works usually holds five things:

- **Search, prominently.** One field, above the fold, searching knowledge and the catalog together. This is the single highest-value element on the page.
- **Open cases for this user.** Three to five most recent, with state and a link. Customers come back to check status far more often than they come to open something new.
- **A small set of top tasks.** The three or four things this customer base actually does — open a case, request a part, check an entitlement. Not a twenty-item menu.
- **Popular knowledge.** Driven by view counts or a curated featured flag, scoped to what this customer's account may see.
- **A status or announcement area** if the customer has one. Major case communications in lesson 03 land here.

The case list and case detail pages need less invention and more precision. The list needs the columns a customer cares about — number, short description, state, opened date, and, if the account allows account-wide visibility, who opened it. The detail page needs the conversation, the attachments, the ability to add a comment, and an unambiguous control for "this is not fixed" that returns the case to Open per your lesson 03 state model.

One layout decision is worth stating explicitly: **do not show the customer your internal state labels.** `Awaiting Info` reads as bureaucracy. `Waiting for your reply` reads as a request. Map internal state values to customer-facing labels in the widget instance options or in a small field map, and keep the internal values intact for reporting.

## Self-registration and account matching

Customers arrive without accounts. You have three patterns, and picking the wrong one for the customer's risk appetite is a common early mistake.

**Invitation only.** Contacts are created by agents or synchronized from a CRM, and the portal only lets an existing contact set a password. Highest control, most administrative load. Correct for a small number of high-value B2B accounts.

**Self-registration with verification.** The visitor submits name, email, and company. The platform creates a contact in a pending state and either verifies the email domain against a known account or routes the request to someone at the customer's account — typically the primary contact — for approval. This is the workhorse pattern for B2B.

**Open registration.** Anyone may register and immediately gets the customer role. Appropriate for the B2C consumer model, where the person is the customer and there is no account whose data they could over-see.

For B2B, domain matching deserves care. Matching `@northwind.example` to the Northwind account is convenient and wrong at the edges: contractors with personal email addresses, customers whose subsidiaries share a domain, and the person who registers with `northwind-consulting.example` and gets access to a company they do not work for. Use domain matching to *suggest* the account and human approval to *confirm* it, unless the customer explicitly accepts the risk in writing.

Whatever pattern you choose, the registration flow must end with the contact holding the customer role and being linked to exactly one account. A registered user with no account sees an empty portal and files a support ticket about your support portal.

## The access model, which is the actual work

Layout is a day. Access control is the rest of the engagement. Work through it as a sequence of questions.

**What role does a customer hold?** The customer service roles — a base customer role, and an elevated customer administrator role for the contact who manages their own company's users. These are deliberately weak roles. Nothing in your instance should grant table-wide read to a role a stranger can self-register into.

**What may a customer read?** Cases where they are the contact, plus, if their contact role allows, cases belonging to their account or to accounts below it in the hierarchy. That is an access control on the case table conditioned on the logged-in user's contact and account, not a filter in a widget. This is the rule people break most often: a widget query with `account=javascript:gs.getUser()...` looks like it works, and then someone changes the URL parameter on the case detail page and reads a case from a different company. **Filters shape what a page shows; access controls decide what a user may retrieve.** Both, always, and the access control first.

**What may a customer write?** Additional comments and attachments on their own cases; nothing else. Specifically not state, not priority, not assignment. If the business wants the customer to be able to close their own case, implement it as an action that runs a server-side script with a defined effect, not as write access to the state field.

**What must a customer never see?** Work notes. Internal attachments. Other accounts' knowledge. The internal user list — including in reference field lookups and in any "created by" display, since agent names are sometimes deliberately hidden behind a team identity.

**How is this proven?** Impersonation is your test harness. Impersonate a contact from each account and each contact role and walk the whole portal: home, list, detail, create, knowledge, catalog, profile. Then leave the UI and try the API — a customer's session can call the table API, and an access control gap that the portal never exercises is still a gap.

A quick checklist to run before any customer-facing portal goes live:

- Is the guest or anonymous user able to reach any page beyond login, search, and public knowledge?
- Does every page route that takes a `sys_id` parameter enforce access control on the record it loads?
- Are internal-only widgets absent from the portal's pages entirely rather than merely hidden by CSS?
- Do attachments on cases follow the case's own access control?
- Does the portal's knowledge base selection exclude the internal knowledge base?
- Do reference fields on customer-facing forms use qualifiers that hide internal records?

## Case deflection on the create-case page

The most valuable widget on a customer portal is the one that stops a case from being created. On the create-case form, as the customer types a short description, search knowledge and published community content and show the top matches inline. If they open an article and the problem goes away, they leave without filing.

Configure three things:

- **The search scope**: which knowledge bases, and whether resolved cases are included (usually not for external users, since resolved cases contain other customers' details).
- **The trigger**: typically a debounce on the short description field so the search runs after the customer pauses rather than on every keystroke. This is a performance decision as well as a usability one — a search per keystroke against a customer-facing instance is a self-inflicted load test.
- **The measurement**: record deflection events so you can prove the value. An article view that ends without a case is the number that funds your knowledge program in lesson 06.

## The unauthenticated visitor

Somebody will reach your portal without logging in. A prospective customer, an employee of a customer who has never registered, a search engine, or a person who bought your product secondhand. Decide what that visitor gets, because the default answer is decided by whatever you failed to configure.

The public surface is defined by which pages are marked public and by what the guest user role can read. Three defensible postures:

**Login wall.** Only the login and registration pages are public. Simplest to secure, and the correct choice when the product is confidential or the customer base is small and known.

**Public knowledge, private everything else.** A subset of knowledge is readable without a login, along with search over it; cases, catalog, and account pages require authentication. This is the most common posture, and the one that pays for itself, because a public article deflects contact from people who would otherwise have to register first.

**Public case creation.** An unauthenticated visitor may submit a case, typically via a form that captures their email and creates or matches a contact. Powerful and genuinely risky: it is an unauthenticated write endpoint on your instance, so it needs rate limiting, a captcha or equivalent, and a triage queue rather than direct routing. Never let a public form create a case that goes straight into an entitled queue.

Whichever you choose, verify the public surface by opening the portal in a private browser window and clicking everything. It is astonishing how often a page marked public renders a widget that queries a table the guest user can read, and how rarely anyone checks from a logged-out session. Then check what the guest role can retrieve directly rather than through the page — the same lesson as before, one layer down.

If any part of the portal is public, decide about search-engine indexing explicitly. A knowledge base you intended for entitled customers appearing in web search results is a support problem and occasionally a contractual one.

## Rolling it out to people who have your email address

A customer service portal has an adoption problem that an employee portal does not: you cannot mandate it. Your customers currently email a person they like, and that works for them. The technical build is maybe 40% of the outcome.

What actually moves adoption, in rough order of effect:

- **Make the portal the fastest path to a status update.** Most customer contact is chasing, not reporting. If the portal answers "what is happening with my case" in two clicks and email takes four hours, behavior changes without a memo.
- **Put the link in every notification.** Every case email from lesson 03 should land the customer on the case, already signed in where your identity setup allows.
- **Keep email working, but route it through the case.** Turning off the shared mailbox on day one punishes customers for your project plan. Let email create and update cases, and let the portal be better.
- **Pilot with one friendly account.** Ten contacts at one customer, for three weeks, with someone collecting their complaints. You will find the two workflow gaps that no internal review would have caught, and you will find them before four thousand people see them.
- **Watch what people do, not what they say.** Portal page views, cases created by channel, deflection events, and self-registration completion versus abandonment. A registration flow that half your visitors abandon is a defect with a satisfied-looking survey score.

Plan for the support-the-support-portal problem too. When a customer cannot log in, they cannot open a case about not being able to log in. Keep a documented human path — a phone number or an email address monitored by the service desk — and make sure it appears on the login page rather than behind it.

## Multiple audiences, one instance

Real programs quickly need more than one customer-facing surface: customers, partners who service those customers, and sometimes a separate brand. Two approaches, and a rule for choosing.

**One portal, conditional content.** Same portal record and pages; widget instances and menu items are shown or hidden by role or by account attribute. Cheapest to maintain, correct when the audiences see mostly the same things.

**Separate portal records.** Different URL suffix, theme, homepage, and page set, sharing widgets and data underneath. Correct when branding differs, when the navigation is genuinely different, or when a partner needs a workflow customers never see.

The rule: separate portals when the *information architecture* differs; conditional content when only the *contents* differ. Do not clone a portal because the logo is different — that is a theme.

For branding by account within one portal, keep it declarative: an account field for logo and accent color, read by the theme at page load. Anything more ambitious becomes per-customer CSS, and per-customer CSS becomes a support queue of its own.

## Performance, language, and the small things that decide adoption

Customer portals are used on phones, on hotel wifi, by people who will not try twice.

- **Query cost.** Every widget on the homepage is a server call. Five widgets each fetching thirty records with dot-walked reference fields is a slow homepage. Limit rows, select only the fields you display, and prefer one widget returning a combined payload over four widgets returning overlapping ones.
- **Responsive layout.** Test the case list on a narrow screen. A table with seven columns is unusable at 375 pixels wide; decide which two columns survive.
- **Localization.** External customers span languages. Keep user-facing strings translatable rather than hard-coded in widget HTML, and make sure the knowledge base selection honors the user's language preference.
- **Accessibility.** Contrast, focus order, form labels, and alt text are not optional on a page your customer's accessibility policy may audit.
- **Email links.** Every notification you configured in lesson 03 links to the portal. Confirm the link lands on the case detail page for an external user, not on the platform UI, which they cannot open.

## Worked example: Northwind's portal in one pass

Take the shipped customer service portal and produce Northwind's:

1. **Theme and identity.** Clone the shipped theme, set the logo and two brand colors, set the portal title, and point the portal's knowledge base field at the external knowledge base only.
2. **Homepage.** Clone the homepage, keep search and my-cases, replace the generic link list with four top tasks, add featured knowledge, and remove the internal announcement widget.
3. **Case list.** Change the widget instance options to show number, short description, customer-facing status, and opened date, sorted by opened date descending, ten per page.
4. **Case detail.** Add the customer-facing status mapping, ensure the comment box writes `comments` and never `work_notes`, and add a "this is not resolved" action that calls a server script setting the case back to Open and clearing the resolution fields.
5. **Create case.** Add the deflection search above the form, make installed product a required reference limited to the user's own account's install base, and drop every internal field from the form.
6. **Access.** Write the case read access control for own-cases plus account-wide-if-permitted, the write access control for comments and attachments only, and the reference qualifier on the installed product field. Impersonate Dana, Sunil, and Priya from lesson 02 and confirm each sees exactly what the design says.
7. **Registration.** Enable self-registration with domain-suggested account and approval by the account's primary contact.

Steps 1 through 5 take an afternoon. Step 6 takes longer and matters more.

## Practice

1. **Brand and scope the portal.** Clone the shipped customer service portal's theme, apply a logo and color, and point the portal at a customer-facing knowledge base. Confirm an internal article does not appear in portal search.

2. **Customize by options first.** Change the case list widget instance to show a different column set and page size *without* cloning the widget. Note which changes were possible through options and which forced you to clone — this is the boundary you need to know by feel.

3. **Write the access controls.** Implement read access on the case table for external users covering own cases and, conditionally, account cases. Then attempt to open another account's case by editing the `sys_id` in the URL while impersonating a customer. The attempt must fail, and it must fail because of the access control, not because the link is not on the page.

4. **Map the status labels.** Replace internal state labels with customer-facing wording on the list and detail pages, keeping the underlying values unchanged. Verify reporting still groups by the internal value.

5. **Add deflection.** Put a knowledge search on the create-case form that queries as the customer types, scoped to the external knowledge base. Record a deflection event when an article is opened and no case is submitted in that session.

6. **Restrict a reference field.** Make the installed product field on the customer-facing case form show only install base items belonging to the logged-in user's account. Prove the restriction holds when the field is queried directly rather than through the form.

7. **Run the security checklist.** Work through the six-item checklist in this lesson against your portal and write one line per item saying pass, fail, or not applicable, with what you changed for each failure.
