---
lesson_id: sn360-06
course_id: sn360
pathway: servicenow-implementation-specialist
title: Knowledge and Communities for Self-Service
order: 6
kind: lesson
competency_ids:
  - D6-S1-C04
objectives:
  - Publish customer-facing knowledge with the access controls external users require
---

## Knowledge is an access-control problem wearing a content hat

Internal knowledge management has a simple failure mode: an article nobody finds. Customer-facing knowledge has two, and the second is worse. The article nobody finds costs you a case. The article the wrong customer finds costs you a phone call from their legal department.

That is the frame for this lesson. Writing good articles is a content discipline your customer owns. Making sure the right external people — and only the right external people — can find, read, rate, and sometimes write them is the implementation discipline you own. Everything below is about the second.

## Bases, categories, and where the boundary goes

A **knowledge base** (`kb_knowledge_base`, whose articles live in `kb_knowledge`) is the unit of ownership and, more importantly, the unit of access. Categories organize articles within a base and are a navigation aid; they are not a security boundary in any design you should ship.

The first decision on every CSM engagement is how many knowledge bases you need. The reliable answer is: **one per distinct audience**, plus one internal.

```text
KB: Internal Support           -> agents only; troubleshooting depth, known issues, escalation paths
KB: Customer Self-Service      -> all entitled customers; how-to, configuration, FAQ
KB: Partner Technical          -> partner contacts only; repair procedures, parts, diagnostics
```

Three bases, three access statements, each one a sentence a business stakeholder can confirm. Compare that with a single base carrying an "audience" field and access controls that read it — technically possible, but every article is now one mis-set field away from being published to the world, and no reviewer can see the risk from the article view.

Keep the internal base genuinely internal. Agents will want to link a customer to an internal article "just this once." That is the moment your escalation runbook, with named engineers and a workaround that voids a warranty, becomes a customer-facing document. The correct move is to promote the content into the customer base as a rewritten article, which is exactly what the create-article-from-case flow later in this lesson is for.

## User criteria: the mechanism that decides who reads what

Knowledge access on the platform is governed by **user criteria** records applied to a knowledge base and, when necessary, to individual articles. A user criteria record is a reusable definition of a set of users — by role, group, company, department, location, or, most usefully in CSM, by a script.

Each knowledge base carries four lists:

- **Can read** — who may see and search the articles.
- **Cannot read** — an explicit deny that overrides can-read.
- **Can contribute** — who may author and edit.
- **Cannot contribute** — the matching deny.

Two rules govern their interaction, and they catch people out. **Deny wins**: if a user matches both a can-read and a cannot-read criterion, they are denied. And **can-read on the base is a floor**, with article-level criteria narrowing further — an article can be more restricted than its base but never more open.

For customer-facing bases, the criteria you actually need are rarely role-based. "All users with the customer role" is too broad the moment you have a partner base or per-tier content. Write criteria against the customer data model from lesson 02 and the entitlements from lesson 04:

```javascript
// User criteria: "Contacts of accounts with an active Premium contract"
// Advanced script — returns true when the current user qualifies.
(function() {
  var contact = new GlideRecord('customer_contact');
  if (!contact.get(gs.getUserID())) {
    return false;
  }
  var accountId = contact.getValue('account');
  if (!accountId) {
    return false;
  }
  var contract = new GlideRecord('ast_contract');
  contract.addQuery('account', accountId);
  contract.addQuery('state', 'active');
  contract.addQuery('short_description', 'CONTAINS', 'Premium');
  contract.setLimit(1);
  contract.query();
  return contract.hasNext();
})();
```

Treat that script as a shape, not a copy-paste. In advanced user criteria scripts, the platform supplies a `user_id` variable for the user being evaluated, and its guidance is to use that rather than `gs.getUserID()`, because criteria results are cached and may be evaluated for a user other than the one logged in; check the documentation for your release and switch the lookup to `user_id`. Also confirm the contract table and the tier field your instance actually uses, and prefer matching a tier reference over a string in a description. What matters is the pattern — the criterion asks a question about the *customer relationship*, not about group membership, so it stays true as contracts renew and contacts change.

Two practical warnings. Scripted criteria run on every knowledge query, so keep them cheap and bounded — `setLimit(1)`, no unindexed wildcard queries, no nested loops. And write the deny criteria you need explicitly rather than relying on the absence of an allow; an article that is readable because nothing matched is an article whose access nobody can explain.

## The article lifecycle

An article's life is: drafted, reviewed, published, revisited, retired. The configuration points that matter for customer-facing content are these.

**Templates.** Give authors a structure per article type — a how-to has steps, a known-issue has symptom, cause, workaround, and fix version. Structure is what makes the content searchable and comparable, and it is far easier to enforce at authoring time than to retrofit.

**Approval before publish.** Internal knowledge can often publish on the author's judgment. Customer-facing knowledge should not. Route publication through an approval by someone accountable for what the company says in public — usually a knowledge manager, sometimes product management for anything touching supported configurations. Configure this in the knowledge base's workflow rather than in a business rule, so the approval is visible on the article.

**Review dates and retirement.** Every published customer article gets a valid-to date. When it passes, the article goes to a review state and, if nobody acts, is unpublished. An article describing a product version you no longer ship generates cases rather than deflecting them. Automate the sweep; do not rely on a quarterly cleanup that never happens.

**Versioning.** Keep versioning on for customer bases. When an article changes, you want to be able to answer "what did the customer read on the day they made that change?" That is an ordinary support question and an occasional legal one.

**Feedback.** Article ratings, a useful/not-useful flag, and a comment box give you the only direct quality signal you will get. Route not-useful feedback to a task for the knowledge owner rather than to a report nobody opens. Decide whether customer comments are visible to other customers — usually not, on a corporate knowledge base, because moderation cost exceeds value.

## Turning cases into articles

The best source of customer knowledge is the case queue: a question asked three times is an article. Configure the pipeline rather than hoping.

The flow: an agent resolving a case flags it as a knowledge candidate, which creates a draft article pre-filled from the case's short description, symptom, and resolution notes. The draft lands in the customer-facing base's authoring queue, where a knowledge author *rewrites* it — case notes are written for colleagues and contain customer names, serial numbers, and internal shorthand — and sends it for approval.

Three configuration details make the difference between a working pipeline and a graveyard of half-articles:

- **Pre-fill from the case, but never publish from it.** Automatic publication of case content to an external audience is a data-leak generator.
- **Link the article back to the case**, so you can later measure how many cases each article prevented.
- **Give candidates an owner and a due date.** A knowledge candidate with no assignee is a wish.

Then close the loop with deflection. Lesson 05 put a knowledge search on the create-case form; this is the content it searches. The metric worth watching is articles viewed in a session where no case was created, and it belongs on the dashboard you build in lesson 10.

## Making articles findable

Access control decides what a customer *may* read. Findability decides what they *do* read.

- **Search keywords and meta.** Customers search in their own words, not yours. If your article says "authentication token expiry" and customers say "logged out", the keyword field is where you reconcile that. Harvest the vocabulary from case short descriptions.
- **Titles as questions.** "Why does the controller alarm overnight?" outperforms "Nocturnal alarm behaviour, Model 4400."
- **Attachments and images.** Both are visible to whoever can read the article — attachments inherit the article's access, which is exactly why you must not attach an internal log capture to a customer article.
- **Language.** If the customer base is multilingual, articles carry a language and search honors the user's preference. Plan whether untranslated articles fall back to the source language or disappear; both are defensible, silence is not.
- **Category depth.** Two levels is usually enough. Deep trees are built by the people who own the content and navigated by nobody.

## Who writes it, and who owns it

The configuration is a week. The operating model is the reason knowledge programmes succeed or quietly die, and you will be asked for an opinion, so have one.

**Authoring belongs to the people solving the cases**, with review by someone accountable for the external voice. The alternative — a small documentation team writing everything — produces better prose and a fraction of the coverage, because the team never sees the long tail of real problems. Configure `can contribute` on the customer base to include the agent groups, and make the approval step the quality gate rather than the authoring step.

**Every published article needs a named owner**, stored on the record, not in a convention. The owner receives the review-date notification, the not-useful feedback, and the question when the product changes. Articles without owners are the ones that go stale, and staleness in a customer-facing base is worse than absence: a wrong article is confidently followed.

**Give the work somewhere to live.** A knowledge candidate flagged on a case should become a task in a queue with a due date, visible on the team's board next to their cases. Knowledge work that competes with case work and has no queue loses every time.

**Measure two things and only two at first.** Article coverage of your top ten case drivers — do we have an article for each — and deflection, from lesson 05's create-case search. Both are on the dashboard in lesson 10. Article counts and page views are activity, not outcome; they will be quoted at you, and the honest response is to point at the two numbers that mean something.

## Communities, at awareness depth

A community adds peer-to-peer content to the self-service surface: customers ask questions, other customers and your agents answer, and the answered thread becomes findable content alongside knowledge. It is a separately licensed application, and this course covers it at configuration-awareness depth — enough to scope it in a design workshop, not enough to build it.

What an implementation specialist needs to know:

- **Forums are the access boundary**, in the same way knowledge bases are. A forum has its own visibility rules, and the mistake pattern is identical: one open forum where a partner-only one was intended.
- **Moderation is a staffing commitment, not a feature.** Content posted by customers, visible to customers, needs someone reading it daily. If the customer cannot name that person, do not turn it on.
- **Community content can be searched alongside knowledge** in the portal and by Virtual Agent, which is where most of its value comes from — an answered thread deflects cases just as an article does.
- **The promotion path matters more than the forum.** A recurring community answer should become a knowledge article. Configure that path or the good content stays buried in threads.

When a customer asks for community in the first phase of a CSM programme, the honest advice is usually: publish twenty good articles first, measure deflection, and revisit. A community with no audience is an empty room with your logo on it.

## Practice

1. **Build the base structure.** Create a customer-facing knowledge base and an internal one. Add two categories to each. Confirm that the customer service portal from lesson 05 searches only the customer-facing base.

2. **Write the criteria.** Create a user criterion that resolves to contacts of accounts with an active support contract, and apply it as can-read on the customer base. Impersonate an entitled contact and an unentitled one and confirm the difference in both article view and portal search.

3. **Prove that deny wins.** Add a cannot-read criterion that excludes one specific account, applied to a single article while that account still matches the base's can-read. Confirm the article is invisible to that account and visible to another.

4. **Configure the lifecycle.** Turn on approval-before-publish for the customer base, set a valid-to date on an article, and implement the sweep that moves expired articles to review. Backdate one article and run the sweep.

5. **Build the case-to-article pipeline.** Add the knowledge-candidate flag to the case resolution path, create the draft-article flow pre-filled from the case, and confirm the draft is not published automatically. Link the resulting article back to its source case.

6. **Tune findability.** Take one article and add the keywords a customer would actually type, drawn from three real case short descriptions. Search using the customer's wording before and after and record the difference.

7. **Scope a community.** In half a page, write the design note you would give a customer asking for community in phase one: which forums, who moderates, how content is promoted to knowledge, and what you would require them to commit to before enabling it.

## Check your understanding

1. Why use separate knowledge bases for internal, customer, and partner audiences instead of one base with an audience field?
2. A contact matches the customer base's can-read criterion and an article's cannot-read criterion. What do they see?
3. Why must a draft article created from a case never be published automatically?
4. When a customer asks for a community in phase one, what is the usual advice?

*Answers:* (1) Each base is one access statement a stakeholder can confirm; an audience field makes every article one mis-set value away from public. (2) Not the article; deny wins. (3) Case notes contain customer names, serials, and internal shorthand; publishing them is a data leak. (4) Publish good articles first, measure deflection, then revisit, and only with a named moderator.
