---
lesson_id: react200-06
course_id: react200
pathway: software-developer
title: Planning an Implementation
order: 6
kind: lesson
competency_ids:
  - D3-S1-C02
objectives:
  - Produce an implementation plan for a multi-feature application
---

## What an implementation plan is, and who actually reads it

An implementation plan is a short written document that says how you intend to build something before you build it. It is not a schedule, not a spec, and not a design document in the visual sense. It answers four questions: what am I changing, in what order, what could go wrong, and how will we know it is done.

Three people read it, and knowing who they are tells you what to put in it.

**A senior developer** reads it to catch a wrong approach while it is still cheap to change. Their eye goes straight to the structural decisions — where state lives, what the route tree looks like, what you are touching that other features depend on. If your plan is a task list with no design in it, they cannot help you, and their first real chance to object will be your pull request, after the work is done.

**A project manager** reads it for sequencing and risk. They want to know what lands first, what depends on what, and which unknowns could move the date. They do not want your component names.

**You, in week three**, read it to remember why you decided something. This is the use people underrate. Half the value of writing a plan is that the act of writing forces you to notice the decisions you were about to make by accident.

The plans that fail are the ones that skip the design and go straight to a checklist. "Build the sign-up form. Build the dashboard. Wire up the API." Nobody can review that, because there is nothing in it to disagree with.

## The worked example

You are three lessons into the Community Events Board. A project manager brings this:

> For the autumn volunteer drive we need people to be able to sign up for a shift on an event and manage their own shifts, and we need organizers to see who has signed up for their events. Volunteers keep asking for a way to save a search so they can check it weekly. Designs for the sign-up flow are in Figma; the organizer view is not designed yet. The API team can add endpoints if we tell them what we need. We would like it live before the drive starts in six weeks.

That is a realistic ask: three features of different sizes, one with designs and one without, an external dependency, and a date. Everything below plans exactly this.

## Step 1 — Establish what you are actually building

Before any design, restate the ask in your own words and get it confirmed. Not because you did not understand it, but because the restatement is where the gaps become visible.

Reading the paragraph above carefully, three features are named:

1. A volunteer can claim and release a shift on an event, and see their own shifts in one place.
2. An organizer can see the volunteers signed up for events they own.
3. A volunteer can save a search and return to it.

And at least seven questions are unanswered:

- Does an event have a shift capacity? What happens when it fills while someone is on the page?
- Can a volunteer claim more than one shift on the same event?
- Is there a sign-in already, or is "their own shifts" the first thing that needs identity?
- What makes someone an organizer, and is that flag on the user or per event?
- Does "save a search" mean saved on the server for this account, or in this browser?
- Does an organizer see contact details, or only names? That is a privacy decision, not a UI one.
- What does "live" mean — behind a flag for staff, or open to everyone?

Write the questions down in the plan even before you have answers, with a name and a date next to each. An open question in a document is a tracked risk; an open question in your head is a surprise in week four. Getting these answered is a conversation, and how to run that conversation with a PM, a designer, and QA is the next lesson's subject. Here, the job is to know which questions the plan cannot survive without.

Some questions you can answer yourself by making a **stated assumption**. That is legitimate and often faster than waiting, as long as it is written where a reviewer can object:

> ASSUMPTION: saved searches are stored per browser in `localStorage` for the first release. Server-side saved searches need an account model we do not have. If the PM wants them to follow a user across devices, this becomes a backend dependency and moves out of the six weeks.

That sentence is worth an hour of meeting. It shows the trade-off, it names the cost of the alternative, and it lets someone with more context say "no, it has to be per user" before you build the wrong one.

## Step 2 — Survey the ground before you design

You are planning changes to code that already exists, so the second step is an inventory of what is there. For a React application of this shape, four things are worth writing down.

**The route table as it stands.** Copy it out of `router.jsx` and into your notes. It is the fastest available map of the application's surface.

**What the store owns.** List the slices, their state shape, and the selectors other features already use. Any change to a shape that other features read is a much bigger change than one nobody else touches.

**Where the data comes from.** Which routes have loaders, which endpoints they call, and what those endpoints return. Half your plan will turn out to be shaped by what the API can and cannot do.

**What is shared.** Components used by more than one feature, layouts, the design system. Changing a shared thing is where unintended breakage comes from, so knowing the list is part of knowing the risk.

Half an hour with the codebase produces something like this:

```text
Routes today
  /                      RootLayout > Home
  /events                EventsLayout > EventList        loader: events + venues
  /events/new            EventsLayout > NewEvent         action: create
  /events/:eventId       EventsLayout > EventDetail      loader: one event
  /about                 About

Store today
  shifts.byEventId       claimed shifts, client-only, not persisted anywhere
  preferences            theme, compactList

API today
  GET  /api/events            list, supports ?venue and ?q
  GET  /api/events/:id        one event
  POST /api/events            create
  (no shift endpoints, no user endpoints)

Shared
  RootLayout, EventsLayout, EventCard, RouteError, useNavigation pending bar
```

That inventory has already told you something important: the shifts slice is client-only. There is no shift API and no user concept at all. Feature 1 as written is not a UI task, it is a UI task sitting on top of a backend dependency and an identity question. That is the kind of finding that changes a plan, and you found it in half an hour rather than in week two.

## Step 3 — Design before tasks

Now the part that makes the document reviewable. For a React app with routing and a store, three small artifacts carry nearly all the design.

### The route map

Show the tree you intend to end up with, marking what is new:

```text
/                          RootLayout
  /events                  EventsLayout
    (index)                EventList
    new                    NewEvent
    :eventId               EventDetail          + shift claim panel   [CHANGED]
  /my/shifts               MyShiftsPage                               [NEW]
  /my/searches             SavedSearchesPage                          [NEW]
  /organize                OrganizerLayout                            [NEW]
    (index)                OrganizerEventList                         [NEW]
    :eventId/volunteers    EventVolunteers                            [NEW]
  /about                   About
```

Four new routes, one changed page, one new layout. A reviewer can now ask the useful questions: why is there a `/my` section rather than a profile page, does `/organize` need its own layout or is it a pathless one, is `/organize` access-controlled and if so where.

### The state ownership table

For each piece of data the features need, say who owns it. This is the decision that is most expensive to get wrong and the one most often left implicit.

| Data | Owner | Why |
| --- | --- | --- |
| Event list and detail | Route loader | Belongs to a URL, already works this way |
| Volunteer's own shifts | Store slice `shifts` | Read by the detail page, the nav badge, and `/my/shifts` |
| Shift claim in flight | Store slice `shifts` | Optimistic update, several components show it |
| Volunteers for an event | Route loader on `/organize/:eventId/volunteers` | Belongs to that URL, nothing else reads it |
| Saved searches | Store slice `searches`, persisted to `localStorage` | Read from the list page and `/my/searches` |
| Current filter and query | URL search params | Already there; must stay linkable |

Six rows, and every one of them is a defensible decision a senior developer can check in seconds. Compare that with discovering in code review that you put the event list in Redux and now have two copies of every event.

### The API contract you need

If the API team can add endpoints, tell them exactly what you need, in writing, early — this is a lead-time dependency and it is usually the thing that determines the date.

```text
POST   /api/events/:id/shifts     { role }        -> 201 { eventId, role, claimedAt }
                                                     409 when the event is full
DELETE /api/events/:id/shifts                     -> 204
GET    /api/me/shifts                             -> [ { eventId, role, claimedAt } ]
GET    /api/events/:id/volunteers                 -> [ { name, role, claimedAt } ]
                                                     403 when not the organizer
```

Notice that the 409 and the 403 are in the contract. Error responses are part of a contract, and a plan that only describes the happy path guarantees a week of surprises. The 409 in particular is the answer to "what happens when the event fills while someone is on the page" — a question from step 1 that is now resolved and written down.

### The component inventory

Keep this short, because it is the least valuable of the four and the one people over-invest in. List the new components, and specifically flag any *shared* component you intend to modify:

```text
NEW    ShiftClaimPanel, MyShiftsPage, SavedSearchButton, SavedSearchesPage,
       OrganizerLayout, OrganizerEventList, EventVolunteers, VolunteerTable
CHANGE EventCard  — add a claimed indicator (used by EventList and MyShiftsPage)
CHANGE RootLayout — add nav entries for /my and /organize
```

The two `CHANGE` lines are the whole point of this section. They are where a change to one feature can break another, and naming them is what lets a reviewer say "careful, the card is also used on the home page."

## Step 4 — Slice the work

Now, and only now, the task list. The mistake to avoid is slicing horizontally — "build all the components, then wire all the state, then connect all the API calls." Horizontal slices mean nothing is demonstrable until everything is finished, which means no feedback until it is too late to use.

Slice **vertically**: each increment is a thin path through every layer that produces something a person can look at.

```text
INCREMENT 1 — Claim a shift (3 days)
  Depends on: POST/DELETE shift endpoints
  1.1  Add async thunks claimShift / releaseShift with optimistic update
  1.2  Rework shifts slice for pending + error state
  1.3  Build ShiftClaimPanel, place it on EventDetail
  1.4  Handle 409 (event full) with a visible message and rollback
  Demoable: claim and release a shift on the detail page, with the failure case

INCREMENT 2 — My shifts (2 days)
  Depends on: GET /api/me/shifts, Increment 1
  2.1  Route /my/shifts with a loader hydrating the shifts slice
  2.2  MyShiftsPage listing claimed shifts with a release control
  2.3  Nav badge showing the count
  Demoable: a volunteer can see and manage every shift they hold

INCREMENT 3 — Saved searches (2 days)
  Depends on: nothing
  3.1  searches slice, persisted to localStorage via listener middleware
  3.2  SavedSearchButton on the list page capturing the current search params
  3.3  Route /my/searches restoring a search by navigating to its URL
  Demoable: save a filtered search, close the tab, come back, reapply it

INCREMENT 4 — Organizer view (4 days)
  Depends on: GET /api/events/:id/volunteers, the organizer permission decision
  4.1  OrganizerLayout and route guard
  4.2  OrganizerEventList from a loader
  4.3  EventVolunteers table, with a 403 error element
  Demoable: an organizer sees the volunteers for their own events only
```

Several properties of that list are deliberate.

**Every increment ends in a demo.** If you cannot write the "Demoable" line, the slice is horizontal and needs re-cutting.

**Dependencies are explicit and point outward.** Increments 1, 2, and 4 wait on the API team; increment 3 does not. That single fact is the most useful thing in the plan for a PM, because it says: if the endpoints slip, we build saved searches first and nothing stalls.

**The riskiest work is early.** Increment 1 contains the optimistic update, the rollback, and the conflict case — the parts most likely to be harder than they look. Increment 3 is the safest and is placed where it can absorb a slip. Do not schedule the easy work first because it feels productive; you want bad news in week one, not week five.

**Increment 4 has an unresolved question in it.** The organizer permission decision is still open. Say so in the plan rather than quietly assuming, and note what you will do if it is unanswered by the time you get there.

## Step 5 — Estimates, unknowns, and spikes

Estimate in days, at the increment level, and give a range when you are unsure. `3–5 days` communicates more honestly than `4 days`, and nobody is fooled by the false precision anyway.

Estimate the work you have actually thought about. If you cannot estimate something, that is information: it means you do not know enough yet, and the answer is a **spike** — a strictly time-boxed investigation whose output is knowledge, not shippable code.

```text
SPIKE (half a day, before Increment 4)
  Question: can the existing session tell us whether the current user organizes
  a given event, or does that need a new endpoint?
  Output: two paragraphs in this document and a decision on 4.1
  Time box: half a day. If unanswered, escalate rather than continue.
```

The time box is the part that makes a spike a spike. Without it you have simply started the work.

Keep a short risk list, and write only risks with a consequence and a response. "The API might be late" is not a risk entry. This is:

| Risk | If it happens | Response |
| --- | --- | --- |
| Shift endpoints slip past week 2 | Increments 1, 2, 4 all blocked | Build increment 3 first; stub the endpoints in the dev server so UI work continues |
| Organizer permissions need a backend change | Increment 4 grows by ~3 days | Flagged in the spike; PM decides whether to cut increment 4 from this release |
| Optimistic rollback is confusing to users | Rework of the claim UI | Show the failure state to the designer in increment 1's demo, not at the end |

Each row is actionable. That is the test: if a risk entry does not change what anyone would do, delete it.

## Step 6 — Definition of done

The most common cause of a feature dragging on for an extra week is that nobody wrote down what finished means. Write it per increment, in terms someone else can check:

```text
Increment 1 is done when:
  - A volunteer can claim and release a shift from the detail page
  - The claim shows immediately and reverts with a visible message on failure
  - A full event returns 409 and the UI explains it without a console error
  - The panel is keyboard-operable and the status change is announced to a screen reader
  - The whole flow works after a page refresh
  - Manual test notes are written for QA
  - Merged to main behind the volunteer-drive flag
```

Include the non-functional lines explicitly. Accessibility and refresh-survival are exactly the things that get dropped when a deadline tightens, and the only defense is having written them into "done" while nobody was under pressure. Note that this list says what condition must hold, not who checks it or how it is handed over — that is the next lesson.

## Step 7 — The document

Assemble it in this order. Aim for two to four pages. A ten-page plan does not get read, and an unread plan is worse than none because it creates false confidence that alignment exists.

```text
1. Summary            — three sentences: what we are building and why now
2. Scope              — in scope, out of scope, stated assumptions
3. Open questions     — question, who can answer, by when
4. Current state      — routes, store, API, shared components as they are today
5. Design             — target route map, state ownership table, API contract,
                        component inventory with shared-component changes flagged
6. Increments         — vertical slices, dependencies, tasks, demo per slice
7. Estimates & risks  — ranges, spikes, risk table with responses
8. Definition of done — per increment, checkable by someone else
9. Decision log       — date, decision, reason
```

The **out of scope** line in section 2 is the highest-value sentence in the whole document. "Organizers cannot export volunteer lists to CSV in this release" prevents an argument in week five that no amount of good code prevents.

The **decision log** in section 9 is what turns a plan into a living document. When something changes — and it will — append a line rather than silently editing the design:

```text
2026-09-14  Saved searches stay client-side for release 1.  Server-side needs an
            account model; PM agreed the trade-off.  Revisit after the drive.
2026-09-21  Organizer check moves to the API (403 on the volunteers endpoint)
            rather than a client-side guard.  Outcome of the increment-4 spike;
            a client-side guard is not a security control.
```

Six months later that log is the only surviving record of why the code looks the way it does, and it costs one line to keep.

### Getting it reviewed

Send the plan when the design is drafted and before you write feature code. Say what you want: "Section 5 is where I am least sure — is the state ownership right?" A reviewer given a specific question gives a specific answer; a reviewer given "any thoughts?" gives you a typo fix.

Expect the design to change. A plan that comes back unchanged usually means nobody read it. When it changes, update the document and log the decision — a plan that diverges silently from the code stops being trustworthy within a week, and then nobody reads the next one either.

## Practice

Produce a real implementation plan for the volunteer drive described in this lesson, against the actual Community Events Board code you have been building. The deliverable is a document, but it must be grounded in your code — a plan that would not survive contact with your own repository is not a plan.

1. Create `docs/implementation-plan.md` in your project with the nine sections listed above.
2. Write the summary and scope. The out-of-scope list must have at least four entries, and at least two stated assumptions with the cost of the alternative named.
3. Write the open-questions section with at least six questions, each with a suggested owner and a "needed by" increment. Mark which ones you can proceed without.
4. Do the survey honestly against your own repository: copy your real route table out of `router.jsx`, list your real slices and their shapes, list your real endpoints, and list every component used by more than one route. Do not write it from memory.
5. Draw the target route map, marking every route as unchanged, changed, or new.
6. Write the state ownership table with one row per piece of data across all three features. Every row needs a one-line justification. At least one row must be owned by the URL and at least one by a route loader.
7. Write the API contract you need, including at least two error responses and what the UI does with each.
8. List the components you will add, and separately flag every shared component you will modify along with which other routes use it.
9. Cut the work into three or four vertical increments. Each needs explicit dependencies, a numbered task list, and one sentence describing what can be demonstrated at the end of it. Order them so the riskiest work is first and the least-blocked work can be pulled forward.
10. Add a spike with a question, an output, and a time box. Add a risk table with at least three rows, each having a consequence and a response.
11. Write a definition of done for each increment, including at least one accessibility line and one line about surviving a refresh.
12. Start the decision log with the two decisions you have already made in the document, with today's date and the reasoning.
13. Give the plan to a peer with one specific request: "tell me whether the state ownership table is right." Record their feedback in the decision log, and revise section 5 if they were right.

**Deliverable:** a committed `docs/implementation-plan.md` of two to four pages containing all nine sections, grounded in your repository's real routes, slices, and endpoints, with a peer's review recorded in the decision log.
