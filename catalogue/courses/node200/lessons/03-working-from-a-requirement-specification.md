---
lesson_id: node200-03
course_id: node200
pathway: software-developer
title: Working from a Requirement Specification
order: 3
kind: lesson
competency_ids:
  - D3-S1-C01
objectives:
  - Work from a Software Requirement Specification to record what must be built
---

## Why the document exists

Everything you have built so far, you also specified. You decided what the events board should do, so when a question came up — should a past event still be listed? — you answered it yourself and moved on. On a team, you will not be the one answering. A client, a product manager, or a senior engineer decides what gets built, and the decision arrives as a document: a **Software Requirement Specification**, an SRS.

The point of an SRS is to make "done" checkable by someone other than the author of the code. Without one, a feature is finished when the developer feels it is, and the conversation at the end of the sprint is two people describing different products from memory. With one, there is a numbered list, and each line is either satisfied or not.

Your job as an apprentice is rarely to write the SRS. It is to **read it correctly, record what it requires in a form you can work from, notice where it does not actually say what it appears to say, and ask about the gaps before you build.** That is the whole of this lesson, and it is a genuine skill: a specification is a piece of technical prose that must be read the way you read a legal document or a protocol RFC — slowly, literally, and with an eye for what is missing.

Everything in this lesson operates on the events board service you restructured in lesson 02. You are not writing code today. You are producing the artifacts that decide what code gets written for the rest of the course.

## The anatomy of a specification

Specifications vary in size from a two-page feature brief to a hundred-page contract document, but the sections are broadly standard, and knowing what belongs in each one tells you where to look for an answer — and lets you notice when a section is missing entirely.

**Purpose and scope.** What problem this software solves and, crucially, what it explicitly does not cover. The out-of-scope list is the most under-read paragraph in any specification and the one that saves the most time.

**Definitions and glossary.** The terms the document uses, defined. If the glossary says a "registration" is a person's claim on a seat and a "confirmation" is the email sent afterwards, then those words mean exactly that for the whole document — and should mean the same in your code, your table names, and your commit messages.

**Actors and roles.** Who uses the system: a visitor, a registered attendee, an organizer, an administrator. Every functional requirement should say which actor performs it.

**Functional requirements.** What the system must do, one behaviour per numbered requirement. These are the lines you will implement.

**Non-functional requirements.** How well it must do it: response time, availability, capacity, accessibility, data retention, browser support, language support. These constrain the design as hard as the functional ones do and are far more often missed, because you cannot see them by using the feature once.

**Constraints and assumptions.** The environment you must work inside — a required database engine, a company authentication provider, a regulatory rule — and what the author took as given.

**Acceptance criteria.** How each requirement will be demonstrated. Sometimes a separate section, often attached to each requirement, occasionally absent — and if absent, that is your first question.

Two distinctions inside those sections matter more than the section names.

The first is **functional versus non-functional**, because they are verified differently. "An organizer can cancel an event" is verified by doing it once. "The event list responds in under 400 milliseconds with 10,000 events in the database" cannot be verified by doing it once at all; it requires a populated database and a measurement. Non-functional requirements that arrive late are expensive because they invalidate designs, not just code.

The second is **requirement versus wish**, and it lives in the verbs. Specifications written with care use a controlled vocabulary borrowed from protocol documents: **must** or **shall** is mandatory, **should** is strongly recommended but may be traded away with a reason, **may** is optional. If the document uses those words consistently, take them literally — "the system should log failed logins" and "the system must log failed logins" are different amounts of work with different consequences. If the document uses them loosely, mixing "will", "needs to", "would be nice", and "must" in one paragraph, then the vocabulary carries no information and you must ask which lines are mandatory. That question is never unwelcome.

## Reading one properly

Here is an extract from an SRS for the events board. Read it the way you would read it at work, then read the analysis that follows.

```text
3.4 Event Registration

3.4.1  A signed-in attendee shall be able to register for a published event
       from the event detail page.
3.4.2  An attendee shall not be able to register more than once for the same
       event.
3.4.3  Registration shall close when the event reaches capacity.
3.4.4  The event detail page shall show the number of places remaining.
3.4.5  An attendee should receive a confirmation email after registering.
3.4.6  An organizer shall be able to view the list of attendees registered
       for their own events.
3.4.7  Registration data shall be retained for 24 months after the event
       date and then deleted.

4.2 Performance

4.2.1  The event detail page shall render in under 800ms at the 95th
       percentile with 5,000 registrations on the event.
```

That reads like a complete feature. It is not, and the gaps are typical.

**3.4.1** says "published event" — a word the extract never defines. Is "published" a state an event moves into, meaning there is a draft state and a transition and probably a permission governing it? Or does it loosely mean "any event that exists"? That single adjective is either zero work or half a day of work, and you cannot tell. It also says "from the event detail page", which is a user-interface constraint smuggled into a functional requirement; ask whether registering through the API without visiting that page is permitted or forbidden.

**3.4.2** is testable and clear. Note what it does *not* say: nothing about whether a cancelled registration can be replaced by a new one. If an attendee registers, cancels, and registers again, has the requirement been violated? A literal reading says yes. That is almost certainly not intended.

**3.4.3** says registration closes at capacity, and says nothing about what an attendee who tries anyway should see. It also says nothing about a waitlist. Do not invent one; note that the behaviour at capacity is specified only as "closed" and ask what the attendee is told.

**3.4.4** interacts with **4.2.1** in a way that is easy to miss. (First, the term in 4.2.1: "under 800ms at the 95th percentile", often written **p95**, means that if you sort a batch of measured response times, 95% of them must be under 800ms. The slowest 5% are allowed to be slower. It is stricter than an average, because a few very slow requests cannot hide behind many fast ones.) "Places remaining" means counting registrations on every page render, and 4.2.1 caps that page at 800 milliseconds with 5,000 registrations on it. Together they are a design constraint — a counted column or an index, not a naive count of a large table on each request. Neither requirement says so; the pair does. Reading requirements in isolation is how performance requirements get discovered on launch day.

**3.4.5** is the only "should" in the list. It is therefore the one thing here that could be deferred, and it is also the largest piece of infrastructure in the section, because sending email means a mail provider, credentials, a template, a queue for retries, and a decision about what happens when delivery fails. Flag the mismatch between its priority word and its cost — that is exactly the kind of observation a senior engineer wants from you early.

**3.4.6** contains "their own events", which is an authorization rule. It implies that an organizer must not see attendees for someone else's event, though the document never states the prohibition. Prohibitions are frequently implied and rarely written; write them down explicitly when you record the requirement, and confirm them.

**3.4.7** is a data retention rule, and it is the requirement most likely to be skipped, because nothing in the user interface reveals it. It needs a scheduled job that does not yet exist. Retention rules also carry a legal weight — "and then deleted" may mean actually deleted, not flagged as hidden.

Across the whole extract, notice what is absent: nothing says whether an attendee can cancel a registration. There is no requirement for it, and there is a retention rule that assumes registrations persist. Silence is not permission and it is not prohibition — it is a question. The most valuable thing a careful reader produces is a short list of the things the document does not say.

### The questions worth asking

You will not get answers to twenty questions. Ask the ones that change what you build, and phrase each so it can be answered in a sentence. Group them by cost:

- **Blocking** — you cannot start without an answer. "Does 'published' mean a distinct event state with its own transition, or any existing event?"
- **Shapes the design** — you can start, but a wrong guess is expensive to unwind. "Should 'places remaining' be a maintained counter, given 4.2.1?"
- **Fills a gap** — safe to proceed with a stated assumption. "3.4.2 does not mention cancelled registrations; I will assume a cancelled registration does not block re-registering, unless told otherwise."

Always propose an answer alongside the question. "Should X do A or B? I would default to A because …" gets a decision in one message; an open-ended question gets a meeting. And record the answers where the whole team can find them — a decision that lives only in a direct message is a decision that will be relitigated in three weeks.

## Recording requirements so you can work from them

An SRS is written for a reader. What you need to build from is a **requirements register**: the same content restructured so each line has an identity, a state, and an owner. Producing that register accurately, without adding to or losing anything from the source, is the core of this competency.

Keep it in the repository, next to the code it governs, in a file such as `docs/requirements/events-registration.md`.

```markdown
# Requirements register — Event Registration (SRS v1.2, section 3.4)

| ID | Source | Actor | Requirement | Priority | Verified by | Status |
| --- | --- | --- | --- | --- | --- | --- |
| R-01 | 3.4.1 | Attendee | Register for a published event | Must | AC-01 | Blocked |
| R-02 | 3.4.2 | Attendee | Cannot register twice for one event | Must | AC-02 | Ready |
| R-03 | 3.4.3 | System | Registration closes at capacity | Must | AC-03 | Ready |
| R-04 | 3.4.4 | Visitor | Detail page shows places remaining | Must | AC-04 | Ready |
| R-05 | 3.4.5 | Attendee | Confirmation email after registering | Should | AC-05 | Deferred |
| R-06 | 3.4.6 | Organizer | View attendees for own events only | Must | AC-06 | Ready |
| R-07 | 3.4.7 | System | Delete registration data 24 months after event | Must | AC-07 | Ready |
| R-08 | 4.2.1 | System | Detail page under 800ms p95 at 5,000 registrations | Must | AC-08 | Ready |
```

Six rules keep a register trustworthy.

**Every row cites its source.** The `Source` column is what lets a reviewer check your register against the specification line by line. A row with no source is something you invented, and it must be marked as such.

**One behaviour per row.** If a specification line contains an "and" joining two behaviours, split it into two rows that both cite the same source line. A row you can only half-satisfy cannot have a status.

**Do not rewrite meaning.** Compress the wording, never the content. If 3.4.6 says "their own events", your row says "own events only" — not "events they manage", which is a different and larger claim.

**Implied prohibitions get their own rows.** Add R-06a, "An organizer cannot view attendees for events they do not own", sourced as "3.4.6, implied", and confirm it. Implied rows are exactly where security defects are born.

**Record what is missing.** Keep an open-questions table below the register, with the question, who was asked, when, and the answer once it arrives.

**Record your assumptions.** Every gap you decided to proceed past gets a line: what you assumed, why, and what it would cost to change. An assumptions log is how a wrong guess gets caught in review instead of in production.

```markdown
## Open questions

| # | Question | Blocks | Asked | Answer |
| --- | --- | --- | --- | --- |
| Q1 | Does "published" mean a distinct event state? | R-01 | 2026-03-04, K. Osei | pending |
| Q2 | What does an attendee see when the event is full? | R-03 | 2026-03-04, K. Osei | "Full — registration closed" banner, 409 from API |

## Assumptions

| # | Assumption | Affects | Cost if wrong |
| --- | --- | --- | --- |
| A1 | A cancelled registration does not block re-registration | R-02 | Low — one condition in the service |
| A2 | Retention deletion is a nightly job, not real-time | R-07 | Low — job schedule only |
| A3 | "Places remaining" may be computed from a counter column | R-04, R-08 | Medium — migration and backfill |
```

## Acceptance criteria: the definition of done

A requirement states what must be true. An **acceptance criterion** states how you will show it. Writing them is what converts a specification into something that can be signed off, and doing it before you code is what stops "done" from drifting.

The most reliable format names a starting state, an action, and an observable outcome:

```text
AC-02  (R-02, no double registration)
  Given an attendee already registered for event E
  When they submit a registration for event E again
  Then no second registration is created
  And the API responds 409 with an error naming the existing registration
  And the detail page shows "You are registered" rather than a register button

AC-03  (R-03, capacity)
  Given event E has capacity 50 and 50 confirmed registrations
  When an attendee submits a registration for E
  Then no registration is created
  And the API responds 409
  And the response body states that the event is full

AC-08  (R-08, performance)
  Given event E has 5,000 registrations
  When the detail page is requested 200 times
  Then the 95th percentile response time is under 800ms
  Measured with: autocannon against a seeded local database
```

Three things to notice. Each criterion names its requirement, so the link is not a matter of memory. Each outcome is **observable** — a status code, a row count, a rendered string, a measured number — because "the system handles it correctly" cannot be checked by anyone but its author. And AC-08 states its measurement method, because a performance criterion without one is an argument waiting to happen. (`autocannon` is an npm command-line tool that fires many HTTP requests at a URL and reports latency percentiles. Any load tool that reports p95 will do, as long as the criterion names which one.)

Criteria phrased this way translate almost mechanically into the tests you will write in lesson 07: the "given" becomes fixture setup, the "when" becomes the call, the "then" becomes the assertions. That is not a coincidence — it is the reason to write them this way.

## Traceability: from a line in a document to a line in the repository

**Traceability** is the ability to answer two questions at any time: for this requirement, where is it implemented and what proves it works; and for this piece of code, which requirement asked for it. Both come up constantly — the first when a reviewer asks whether the feature is complete, the second when someone wants to delete code that looks unused.

A traceability matrix is a table, kept beside the register:

```markdown
| ID | Implemented in | Verified by | Status |
| --- | --- | --- | --- |
| R-02 | services/registrations.service.js: register() | test/registrations.service.test.js "rejects duplicate" | Done |
| R-03 | services/registrations.service.js: register() | test/registrations.api.test.js "409 when full" | Done |
| R-04 | routes/events.routes.js: detail handler, views/events/detail.ejs | test/events.api.test.js "shows places remaining" | In progress |
| R-06 | routes/organizers.routes.js: attendee list | test/organizers.api.test.js "403 for other organizer" | Not started |
| R-07 | jobs/purge-registrations.js | test/purge.test.js | Not started |
```

Keeping it current costs a minute per merged change and pays for itself the first time someone asks "is 3.4 finished?" — a question you can now answer with a table rather than an opinion. Two lightweight habits make it nearly free: put the requirement id in the commit message or pull request title (`R-03: close registration at capacity`), and put it in the test name (`test("R-03: rejects registration when full")`). Then the matrix can be reconstructed with a grep even if it goes stale.

Traceability is also what makes a change request cheap to assess. When someone asks for a waitlist, you look at R-03's row and can immediately say which service function, which route, and which tests are affected — instead of guessing.

## When the specification changes

It will. A requirement is a decision made at a point in time by people who are still learning what they want, and specifications are revised mid-build routinely. What must not happen is a silent revision.

Handle it the same way every time. **Confirm the change in writing** — verbal changes evaporate, and the person who told you will remember it differently. **Record which requirement ids are affected**, and update the register rows rather than editing history invisibly; note the SRS version each row came from. **Assess the impact against your work plan** from lesson 02, in rows: which modules change, which tests change, what is now wasted. **Report the cost before agreeing** — not to resist the change, but because whoever asked for it usually does not know what it costs, and cannot make a sensible trade without that number. Then **re-baseline**: the new version becomes the thing you build against, and the old assumption gets marked superseded rather than deleted, so the reason it changed survives.

The apprentice-level failure mode here is agreeing to a change in a hallway conversation, absorbing the extra work quietly, and then missing a date without an explanation anyone can follow. The change was fine. The silence was the problem.

## Practice

You will work from the SRS extract in this lesson, treating it as the real thing. No application code is written in this exercise; the deliverables are documents in your repository under `docs/requirements/`.

1. Re-read section 3.4 and 4.2 above and mark every sentence as functional or non-functional, and every requirement as mandatory, recommended, or optional based on its verb. Record any line where the verb does not make the priority clear.
2. Build the full requirements register as a table with the columns from this lesson: ID, Source, Actor, Requirement, Priority, Verified by, Status. Include one row per behaviour — split any line containing two behaviours — and cite the SRS clause on every row.
3. Add at least two rows for **implied** requirements the extract never states outright (start with the organizer prohibition in 3.4.6), sourced as "implied" and marked as needing confirmation.
4. Write an open-questions table with at least five questions, each classified as blocking, design-shaping, or gap-filling, and each carrying your proposed default answer. Order them so the blocking ones come first.
5. Write an assumptions log with at least three assumptions, each with the requirement it affects and a low/medium/high cost if it turns out to be wrong.
6. Write acceptance criteria for R-01 through R-04 in the given/when/then format, with observable outcomes including the exact status codes. For R-08, state the measurement method and the data volume the measurement requires.
7. Produce a traceability matrix for all your requirement ids. Fill the "implemented in" column with the module paths from your lesson 02 structure where the work *would* go — routes, services, repositories — even though nothing is built yet. Mark every status "Not started".
8. One line in your register cannot be built as written because the extract does not contain enough information. Identify it, write a two-sentence note explaining precisely what is missing and what you would need to be told, and mark its status "Blocked".
9. A change arrives: "Attendees must be able to cancel a registration up to 24 hours before the event starts." Add the new requirement rows, then write an impact note listing the affected register rows, the modules from your work plan that change, and one sentence on whether R-02 and R-07 are affected by it.
10. Swap registers with a peer and review theirs against the extract, checking three things: does every row cite a source clause, does any row state more than the specification actually says, and is any clause in the extract missing from the register entirely. Record the findings as review comments and fix your own.

**Deliverable:** a committed `docs/requirements/events-registration.md` containing the register, open questions, assumptions, acceptance criteria, and traceability matrix, plus the change-impact note, and a peer review recorded against it.

## Check your understanding

1. An SRS line reads "The system should log failed logins." Another reads "The system must log failed logins." What is the practical difference for your work plan?
2. Requirement 3.4.6 says organizers can view attendees "for their own events". What row do you add to your register that the SRS never states, and how do you mark its source?
3. Why is "the system handles duplicate registrations correctly" not an acceptable acceptance criterion? Rewrite it so someone else could check it.
4. A product manager tells you in the hallway that attendees should also be able to cancel. What four things do you do before you change any code?

**Answers**

1. "Must" is mandatory and cannot ship without it. "Should" is strongly recommended but can be traded away with a stated reason, so it can be scheduled later or deferred if its cost is high. That only holds if the document uses the words consistently; if it doesn't, ask.
2. An implied prohibition, such as "An organizer cannot view attendees for events they do not own", sourced as "3.4.6, implied" and marked as needing confirmation.
3. "Correctly" can only be judged by the author. Example rewrite: "Given an attendee already registered for event E, when they register for E again, then no second row is created and the API responds 409 naming the existing registration."
4. Confirm the change in writing; record which requirement ids it affects (new rows, SRS version noted); assess the impact against the work plan; report the cost before agreeing, then re-baseline and mark the superseded assumption rather than deleting it.
