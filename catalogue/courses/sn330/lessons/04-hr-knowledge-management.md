---
lesson_id: sn330-04
course_id: sn330
pathway: servicenow-implementation-specialist
title: HR Knowledge Management
order: 4
kind: lesson
competency_ids:
  - D4-S1-C01
  - D6-S1-C04
objectives:
  - Configure scoped HR knowledge bases so employees see only the articles that apply to them
---

## Knowledge is the cheapest HR case

The single largest lever on HR case volume is not faster agents. It is employees finding the answer without opening a case at all. A parental leave policy article that reaches the right employee removes a case that would otherwise take an agent fifteen minutes and the employee two days of waiting.

But HR knowledge has a constraint that IT knowledge does not: **most HR policy is conditional on who you are.** Leave entitlement differs by country. Benefits differ by employment type. Manager guidance is not for everyone. Union-represented employees have different terms. An HR knowledge base that shows every article to every employee is not merely noisy — it is actively wrong, and in some cases it creates a compliance exposure by publishing terms to people they do not apply to.

So the design goal for HR knowledge is not "publish everything and let search sort it out." It is: **every employee sees a small, correct, complete set of articles for their situation, and cannot see the others.** That goal drives every configuration choice in this lesson.

## The knowledge structure

Three objects form the hierarchy.

A **knowledge base** is a container with an owner, a set of managers, a workflow for publishing, and — most importantly — an audience. Knowledge bases are the coarsest unit of access control.

A **category** organizes articles within a base, and can nest. Categories are a browsing aid and a secondary access-control unit.

An **article** is the content itself, with a lifecycle, a version, an author, a review date, and its own optional access restrictions.

The first architectural decision is **how many HR knowledge bases to create**, and the answer is driven by audience, not by topic.

Create a separate knowledge base when the *audience* differs fundamentally:

- **Employee HR knowledge** — policies, benefits, how-to guidance. Audience: all employees. This is the big one and the one wired into self-service.
- **Manager HR knowledge** — how to run a performance conversation, how to approve leave, how to initiate a termination. Audience: people managers only. Separate base, because the entire body of content is manager-only and a base-level restriction is simpler and more provable than restricting a hundred articles individually.
- **HR agent knowledge** — internal procedures, escalation matrices, script guidance, system how-tos. Audience: HR agents. Never employee-visible.
- Optionally, **COE-restricted knowledge** where a COE such as employee relations maintains investigation procedures that even other HR agents should not read.

Do *not* create a knowledge base per country, per business unit, or per topic. Those distinctions are what categories and user criteria are for, and a base-per-country structure produces an unnavigable portal and duplicated content that drifts out of sync.

## User criteria: who sees what

**User criteria** are the mechanism that makes conditional knowledge work. A user criteria record defines a population — by role, group, department, location, company, or a custom advanced condition — and can then be applied at three levels.

At the **knowledge base** level, criteria control who can read the base at all and who can contribute to it. This is your first line: the manager base gets a "people managers" read criterion, and no employee outside that population will see any of its content anywhere, including in search results.

At the **category** level, criteria narrow further within a base. A "Leave and Time Off" category inside the employee base might be visible to everyone, while a "Union Agreements" category is visible only to represented employees.

At the **article** level, criteria handle the genuinely article-specific cases — the US 401(k) article, the UK pension article, the German works council article — where three articles share a category but each applies to one population.

Each level supports both **can read** and **cannot read** lists, and this is where implementers most often go wrong, so be precise:

**Cannot read wins.** If a user matches both a can-read and a cannot-read criterion, they are denied. This is deliberate and it is the right default, but it means a broad exclusion criterion applied carelessly will silently hide content from people who should see it.

**Empty can-read means everyone** (within whatever the parent already allowed). Knowledge-base defaults for an empty list have differed across releases and properties, so confirm this on your instance by testing a new, unrestricted base as a non-HR user before relying on it. An article with no criteria in a base restricted to managers is visible to managers, not to everyone. Restrictions compound down the hierarchy; they do not reset.

**Criteria are evaluated for the reader.** Unlike HR criteria on services, which frequently evaluate against the subject person, user criteria on knowledge evaluate against whoever is looking. This is usually what you want, and it is also why a manager searching on behalf of a report will not see the report's country-specific article — a real limitation to design around, generally by writing manager-facing guidance in the manager base rather than expecting managers to browse employee content.

There is one more important interaction: **HR criteria and user criteria are different objects.** HR criteria describe a population in HR terms and are the natural fit for HR services and HR content targeting; user criteria are the platform-wide knowledge mechanism. Many implementations use HR criteria for services and portal content and user criteria for knowledge, and where the same population is needed in both places, they define it twice. Keep the two definitions synchronized, and document that they are twins, or you will spend an afternoon wondering why an employee can request a service but cannot read its policy article.

### A worked criteria design

Requirement: publish parental leave policy. The company operates in the US, the UK, and India, with materially different entitlements, and has a separate manager-facing guide on handling a leave request.

A clean design:

- Base: **Employee HR Knowledge**, readable by all employees.
- Category: **Leave and Time Off**, no additional restriction.
- Three articles: "Parental Leave — United States," "Parental Leave — United Kingdom," "Parental Leave — India." Each carries a can-read user criterion matching the employee's work country.
- One further article, "Parental Leave — Overview," with no criteria, explaining that entitlement depends on work location and linking to the three. This is the safety net for anyone whose location data is missing or who works somewhere not yet covered.
- Base: **Manager HR Knowledge**, readable by a "people managers" criterion. Article: "Supporting an Employee Through Parental Leave."

Now test it. Impersonate a US employee: two articles visible. A UK manager: three — the overview, the UK article, and the manager guide. A contractor in a country with no article: the overview only, which is exactly the graceful degradation you want and the reason the overview exists.

The overview-article pattern is worth adopting generally. Criteria-restricted content fails closed, which is correct for security and terrible for user experience when the underlying data is incomplete. An unrestricted overview article turns "nothing found" into "here is who to ask."

## The article lifecycle

An HR article passes through **draft**, **review**, **published**, and eventually **retired**. Configure the publish workflow on the knowledge base so that:

- HR policy content requires review by a named owner before publishing. HR policy that goes live unreviewed is a legal problem, not a content-quality problem.
- Agent procedure content can use a lighter workflow. Not everything needs two approvers.

Two lifecycle fields do most of the work of keeping an HR knowledge base from rotting:

**Valid to / scheduled retirement.** Content tied to an annual cycle — open enrollment, holiday calendars, bonus timelines — should expire on a date rather than lingering into the next year with last year's numbers. Set it at authoring time.

**Review date and owner.** Every policy article should name a human owner and a review interval. Configure a scheduled job or flow that creates a review task for the owner when the date passes. An HR knowledge base with no review cadence is a knowledge base that will confidently tell an employee the wrong thing in eighteen months.

When an article is retired, prefer retirement over deletion: retirement preserves version history, which matters when an employee asks what the policy said at the time they made a decision.

**Versioning** deserves the same treatment. Enable it on HR policy bases. The question "what did our leave policy say in March?" is one you will eventually be asked by someone whose job it is to ask.

## Structuring articles employees will actually read

Configuration is only half of knowledge management; the other half is content shape, and an implementer should set the standards even if HR writes the words.

**Article templates.** Create templates for the recurring shapes: a policy article (summary, who it applies to, entitlement, how to request, exceptions, who to contact), a how-to article (what you need before starting, numbered steps, what happens next), and an FAQ. Templates make a hundred articles by six authors feel like one voice, and they force the "who it applies to" section, which is the section employees most need.

**Reusable content blocks.** Where the same paragraph appears across many articles — a standard escalation contact, a legal disclaimer, a benefits enrollment deadline — use the knowledge block capability so the text lives in one record and every article that embeds it updates together. This is the difference between updating one block and editing forty articles when a deadline moves.

**Write the title as the employee's question.** "Parental Leave — United States" is a filing label; "How much parental leave do I get in the US?" is what someone types into search. Where the platform supports both a title and search keywords or meta, use the formal title and load the questions into keywords.

**Keep articles short and link rather than nest.** A twelve-screen policy article is one nobody reads to the section that answers them.

## Connecting knowledge to cases and to search

Knowledge earns its keep at three touchpoints, and each needs configuration.

**Search-time deflection.** When an employee types a request in the self-service portal, matching knowledge articles should be surfaced *before* the case is submitted. Configure this on the intake path for your high-volume services. Measure it: the platform records whether an article was viewed and whether the case was abandoned afterward, and that number is the honest report on whether your knowledge base works.

**Agent-side search.** Agents working a case should be able to search knowledge from the case itself and attach or paste an article link into an employee-facing comment. Configure contextual search so the top results are driven by the case's HR service and short description rather than requiring the agent to retype the question.

**Knowledge from cases.** When an agent answers a question that is not in the knowledge base, they should be able to flag it — either by creating a draft article from the case or by raising a knowledge gap task to the content owner. Configure this path and then actually monitor the queue; an unmonitored gap queue is a promise you broke.

Also configure the **feedback loop**: article ratings, "was this helpful," and comments. Route negative feedback to the article owner as a task. Ratings that nobody reads are decoration.

## Governance: who writes and who owns

A knowledge base is a product with an operating model, and the implementation must express that model in configuration or it will not survive contact with a busy HR team.

Four roles need to exist, and each maps to something you configure.

**Authors** write drafts. Grant contribution through a can-contribute user criterion on the base, and grant it to the people who actually know the policy — the benefits specialist, the payroll lead — rather than routing all authoring through one overwhelmed knowledge manager.

**Owners** are accountable for a specific article's accuracy. This is a field on the article, and it is the field that makes the review cycle work. An owner who is a group rather than a person is an owner who is nobody; name individuals and update them when people move.

**Approvers** gate publication. Configure them on the base's publish workflow. Keep the chain short — one approver for most content, two only where legal or compliance genuinely requires it. A three-approver workflow produces a knowledge base whose content is permanently three weeks out of date.

**Knowledge managers** own the base itself: the category structure, the templates, the criteria, and the health of the whole. One per base.

Then configure the two feedback loops that keep the model running: the review-date task described above, and a knowledge-gap queue fed from cases. Both need a named owner and a place in someone's week. An implementation that ships the tables without the operating model has shipped half the work.

### Migrating existing content

Most implementations inherit a shared drive full of policy documents. Resist bulk-importing it. A five-hundred-document dump produces a knowledge base with no criteria, no owners, no review dates, and a search experience that makes employees give up.

A workable approach: take the top twenty search terms or the top twenty case drivers, write those articles properly with templates, criteria, and owners, and launch with those. Add content in response to measured demand — the zero-result search log and the knowledge-gap queue — rather than in response to what happens to exist in a folder. Eighty good articles that answer the questions people actually ask beat five hundred that do not.

## Measuring whether it works

Knowledge is the one part of an HRSD implementation with a genuinely honest scoreboard, so use it.

**Deflection rate** — the proportion of self-service sessions where an employee viewed an article and did not go on to open a case. This is the headline number and the one to report to the stakeholder who funded the work.

**Zero-result searches** — the backlog of content you are missing, free, updated daily.

**Article views against case volume by service** — where cases are high and article views are low, either the article does not exist or it is not findable. Both are fixable.

**Article usefulness ratings and comments**, routed to the owner as a task rather than pooling unread.

**Stale-content count** — articles past their review date. This is the health metric; when it climbs, the operating model has stopped running, and no amount of new content will compensate.

Report these on a schedule to the knowledge managers. The metric that changes behavior is the one someone is asked about monthly.

## What not to put in HR knowledge

A short but important list, because these mistakes are expensive.

**Individual employee information.** Knowledge is policy and procedure. The moment an article contains a named employee's circumstances, you have created a record with the wrong access model.

**Content that should be a service.** If an article's core content is "email this address with these five details," that is a request form you have not built yet. Articles that instruct employees to work around the absence of a service are a design smell.

**Region-specific terms in an unrestricted article.** The most common real defect: someone writes "employees receive twenty days of annual leave" in a global article, and it is true in one country. Either restrict it or qualify it in the text.

**Anything you cannot commit to reviewing.** Every article is a maintenance liability. A base of eighty accurate articles beats one of four hundred where a quarter are stale, because employees who get burned twice stop searching and start opening cases.

## Practice

Work in a development instance with HRSD and knowledge management available. Use at least three test users whose HR profiles differ by work country and by manager status.

1. **Design the base structure.** Write down the HR knowledge bases you will create, and for each one: its audience, its owner, its publish workflow, and the user criteria that will control read access. Justify in one sentence per base why it is a separate base rather than a category.

2. **Build two bases.** Create an employee HR knowledge base readable by all employees, and a manager HR knowledge base restricted with a "people managers" user criterion. Confirm the manager base is genuinely invisible to a non-manager — check the portal, the knowledge homepage, *and* global search, not just the direct URL.

3. **Build the parental leave set.** Reproduce the worked example: one unrestricted overview article and at least two country-restricted articles in a "Leave and Time Off" category, plus one manager-facing article in the manager base. Use a criterion based on the HR profile or user work location, not a hand-listed group of users.

4. **Run an impersonation matrix.** Build a table with your test users as rows and your articles as columns, predict each cell before testing, then impersonate each user and fill in what they actually saw. Any cell where prediction and reality differ is the finding — investigate and record the cause.

5. **Test the deny precedence.** Add a cannot-read criterion to one article that overlaps a user who also matches its can-read criterion. Confirm the user is denied, and write one sentence stating the precedence rule you just demonstrated.

6. **Create an article template and a reusable block.** Build a policy article template with a mandatory "who this applies to" section, and a reusable content block for a standard HR contact line. Use both in one new article, then change the block's text and confirm the article reflects the change without being edited.

7. **Configure the lifecycle.** On one time-sensitive article, set a valid-to date and an owner with a review date. Describe — in two or three sentences — the scheduled job or flow you would build to turn an overdue review date into a task for the owner, including what it should do when the owner is no longer with the company.

8. **Wire up deflection.** For one high-volume service you built in the previous lesson, configure knowledge results to appear during intake. Submit a request as an employee and record whether the relevant article surfaced. If it did not, adjust keywords or the article's category and try again until it does.

## Check your understanding

1. You need different parental leave terms for three countries. New knowledge base per country, or something else?
2. A UK manager searches for the India parental leave article on behalf of a report and cannot find it. Is that a defect?
3. Why publish an unrestricted "Overview" article alongside country-restricted ones?
4. A user matches both a can-read and a cannot-read criterion on an article. What do they see?

*Answers:* (1) One employee base and category, with country-restricted articles using user criteria; bases are for fundamentally different audiences. (2) No; knowledge user criteria evaluate against the reader, so manager guidance belongs in the manager base. (3) Restricted content fails closed, so the overview catches anyone with missing or unmatched data. (4) Nothing; cannot-read wins.
