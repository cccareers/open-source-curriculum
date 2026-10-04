---
lesson_id: se202-03
course_id: se202
pathway: technical-sales-representative
title: Account Research with Prospecting Tools
order: 3
kind: lesson
competency_ids:
  - D3-S1-C01
  - D3-S1-C05
objectives:
  - Use prospecting tools to research an account and its buying committee before outreach
---

## What prospecting tools are for

A prospecting tool does three jobs and no more: it **finds** companies and people matching criteria, it **enriches** them with contact and firmographic data, and it **alerts** you when something changes. Everything else — the sequences, the dialers, the dashboards — is packaging around those three jobs.

Two products dominate the category and are the ones named in this course's scope, so they are the worked examples here: **Apollo**, a contact-and-company database with search, enrichment, and outreach built on top of it, and **LinkedIn Sales Navigator**, a search-and-alerting layer on top of a professional network where the people themselves maintain their own records.

Learn them as representatives of a category, not as a certification. Interfaces change every quarter; the technique does not. The four transferable skills are: **building a search that narrows on the right axes**, **reading buying signals out of a feed**, **mapping a buying committee**, and **verifying and cleaning what the tool gave you**. A rep who has those four can be productive in any tool in the category within a day.

### How the two categories differ, and why you want both

A **contact database** like Apollo is compiled: it aggregates company and person records from many sources into a searchable store, then sells you access to the records plus the ability to export and act on them. Its strengths are volume, filterability, and direct contact data — work emails, and often direct or mobile phone numbers. Its weakness is decay. Compiled data goes stale: people change jobs, titles get restructured, companies get acquired, and no compiled database learns about that instantly.

A **professional network** like Sales Navigator is self-maintained: the person updates their own profile because it is their public professional identity. That makes it far more current on titles, tenure, and job changes, and it shows you things a database cannot — how someone describes their own responsibilities, what they post about, who they are connected to, whether they were promoted internally or hired from outside. Its weakness is the mirror image: it generally does not hand you an email address or a phone number, and its search is built around people and their employers rather than around exportable rows.

The professional workflow uses them as a pair. **The network tells you who and why. The database tells you how to reach them.** Whichever specific products you end up with, expect that pairing.

## Building a search that narrows on the right axes

Every tool in this category exposes roughly the same filter families. Learn the families and the specific menus stop mattering.

**Company filters:** industry or vertical, employee headcount range, revenue range, headquarters and office locations, company type or ownership, founding year, and often growth rate.

**Person filters:** current job title, seniority level, function or department, years in current role, years at company, and geography.

**Signal filters:** recent job changes, headcount growth, funding events, hiring activity, technologies used, and in some tools intent or research activity.

**Relationship filters** (network products specifically): connection degree, shared connections, shared past employers, people who follow your company page.

### Three habits that separate a good search from a bad one

**Filter on function and seniority, not on title strings.** Titles are chaos. "VP of Operations", "Vice President, Field Operations", "SVP Service Delivery", and "Head of Field Ops" are the same buyer, and a title keyword search finds maybe half of them. Search on *function* (Operations) plus *seniority* (VP and above) and you catch the whole set including the ones nobody thinks to type. Use title keywords to *refine* a function search, not to replace it.

**Exclude aggressively.** Most searches are improved more by exclusion than inclusion. Exclude your existing customers and open opportunities. Exclude geographies you are not licensed or staffed for. Exclude the seniority bands that cannot sponsor a purchase. Exclude industries where your disqualifiers apply. A search with no exclusions is almost always returning junk you will pay for later in wasted dials.

**Narrow on the axis that predicts pain, then check the count.** If your ICP's real driver is operational — number of field technicians, transaction volume, number of entities — find the closest available proxy and make that the load-bearing filter, with firmographics as support. Then watch the result count as you add filters. A single filter that cuts your results by ninety percent is either enormously valuable or a data-coverage artifact; open ten records and check which before you trust it.

### A worked search

Continuing the field-service scheduling example from lesson 2, here is the same search expressed as filter logic, which is how you should write it down regardless of tool:

```text
COMPANY LAYER
  Industry:        Construction / Facilities Services / Mechanical &
                   HVAC contractors
  Headcount:       120–1,500
  Location:        US, Canada
  Exclude:         current customers (upload suppression list),
                   companies < 120 employees,
                   residential-only single-branch operators

PERSON LAYER
  Function:        Operations
  Seniority:       Director, VP, C-level
  Title refine:    "field", "service", "dispatch", "operations"
  Exclude titles:  "Sales Operations", "Revenue Operations",
                   "Business Operations"   <- wrong Operations
  Geography:       matches company location

SIGNAL LAYER (any one qualifies for Tier A)
  Changed jobs in last 90 days
  Company headcount grew > 15% in last 12 months
  Company posted 8+ technician or dispatcher roles in last 60 days
  Funding or acquisition event in last 6 months
```

The `Exclude titles` line is the kind of detail that only comes from doing this once badly. "Operations" as a function sweeps in Sales Operations and RevOps, who have nothing to do with dispatching technicians, and if you do not exclude them they will be twenty percent of your list.

Save the search. Every tool in this category lets you persist a search and re-run it; a saved search that you check weekly turns into a signal feed, because new records that match it are by definition new opportunities.

## Reading buying signals out of a feed

Once the search is saved, the tool becomes a monitoring system. The signals worth wiring up:

**Job changes.** Someone in your persona moving into a new role is the highest-value alert in outbound. Both product categories will surface this: the network product knows immediately because the person updated their own profile, and the database will catch up. Two variants matter. A **new person in a target account** is a fresh buyer with a mandate and no loyalty to the incumbent. An **existing champion moving to a new company** is even better — a person who already knows your product, now at an account you may not have been working. Track your champions the way you track your accounts.

**Hiring activity.** Job postings are a signal and a research document at once. Count them for scale, read them for stack and pain. A posting that lists the software the new hire must know is a free technographic record; a posting that says "help us move off manual dispatch scheduling" is a written confession of the problem you solve.

**Headcount growth.** Steady growth in the department you sell to means process strain. The team that worked at fifteen people breaks at forty.

**Funding, acquisition, and ownership changes.** New capital or a new owner means new mandates and unfrozen budget. Roll-ups in particular inherit incompatible processes across acquired branches, which is a problem shaped exactly like an integration purchase.

**Content and posting activity.** When your persona posts about the problem area, they have told you their priority in their own words — and given you the single best cold-call opener available, because you can quote them.

For each signal, decide the action before you turn the alert on. New VP in a tier-A account → research and call within five business days. Job posting spike → add to tier A and use the postings in the email. Without a defined action, alerts become a notification feed you learn to ignore.

## Mapping the buying committee

Technical sales is almost never a one-person purchase. Before you dial, you should be able to name three to five real people and say what each one wants. This is where you start pre-qualifying the account — the full framework comes in lesson 6, but the committee map is the raw material for it.

The roles to fill:

- **Economic buyer** — controls the budget and can say yes without asking anyone. Usually one level above where you think.
- **Champion** — feels the pain daily, gains professionally if this gets fixed, and will sell internally when you are not in the room.
- **Technical evaluator** — judges whether it works: IT, security, architecture, integrations.
- **End user** — lives in the tool. Rarely decides, frequently vetoes.
- **Blocker** — has a reason to prefer the status quo. Often owns the incumbent system or built the homegrown one.

A filled map for one account looks like this:

```text
ACCOUNT: Northwind Mechanical (~90 field techs, 4 branches)

Champion            Dana Ruiz, VP Operations
                    In role 3 weeks (external hire, from a competitor
                    contractor). Measured on first-time-fix rate and
                    tech utilization. Source: profile + press release.

Economic buyer      Marcus Hale, COO
                    7 years tenure. Signed off on their ERP rollout
                    per a vendor case study. Source: vendor site.

Technical eval.     Priya Nandal, Director of IT
                    Job posting for an integrations engineer lists the
                    ERP and a homegrown dispatch app. Source: careers
                    page.

End user            Ken Ostrowski, Dispatch Manager
                    11 years tenure. Built the current spreadsheet
                    process himself. Source: profile.
                    NOTE: also the most likely blocker — he owns the
                    thing we would replace.

Committee gap       No named finance contact. Unknown who approves
                    software spend above the COO's discretion.
```

Notice the last two lines. A map's value is as much in what is missing as in what is filled — the gap is a question you ask on the first call. And notice that the end user and the blocker are the same person, which is the most common shape in a replacement sale and completely changes how you would run the deal.

Two practical rules. **Multi-thread from the start**: plan to reach three or more people per tier-A account, because single-threaded accounts die when your one contact goes on leave or changes jobs. And **write the source next to every fact**. Six weeks later you will not remember whether "90 technicians" came from a press release or from your own guess, and on a live call the difference matters.

## Verification and list hygiene

Compiled contact data is wrong more often than vendors imply, and every bad record costs you twice: once in wasted effort, and once in deliverability or reputation damage. Build verification into the workflow rather than treating it as cleanup.

**Cross-check the person against the network.** Before you contact anyone from a database export, confirm on the self-maintained network that they still hold that title at that company. This one habit catches the majority of decay, because job changes are the dominant failure mode.

**Read the email confidence indicator and act on it.** Every serious database scores or labels how confident it is in an address. Treat unverified or low-confidence addresses as a separate, lower-priority list — or verify them through a dedicated verification service — rather than mixing them into your main sends. A batch with a high proportion of invalid addresses produces bounces, and sustained bounce rates damage your sending domain's reputation for every message you send afterward, including to prospects whose addresses were fine.

**Sanity-check derived and modeled fields.** Revenue estimates, headcount, and technology tags in compiled databases are often inferred rather than observed. If a number is load-bearing for your qualification, confirm it against a second source: the company's own site, a press release, a job posting, a filing.

**Suppress before you export, not after.** Upload your customer list, open opportunities, and do-not-contact list as suppression lists so they never enter your working file. Cleaning after export means someone eventually calls a customer.

**Deduplicate on export.** The same human often exists twice — once from each source, with two title spellings. Dedupe on email domain plus name, then eyeball the near-matches.

**Re-verify on a schedule.** Contact data decays continuously; a list built four months ago and never touched is meaningfully wrong. Re-run your saved searches monthly and refresh tier-A records before any new campaign.

**Stay inside the rules.** Exported contact data is personal data. Follow your employer's policy and applicable law on consent, opt-out handling, record retention, and honoring do-not-contact requests immediately and permanently. "The tool let me export it" is not a legal basis for anything.

## Practice

Work from the 30-account target list you built in lesson 2.

1. **Write two saved searches** in the filter-logic format used above — one company-layer, one person-layer — including at least three exclusions each and a signal layer with at least three triggers. Write them as text first, then build them in whatever tool you have access to (a free trial tier is fine; if you have no tool, build the search against public job boards and company sites and note where the manual method falls short).

2. **Run the count discipline.** Record the result count after each filter you add, in order. Identify which single filter cut the results most, open ten of the surviving records, and write one paragraph on whether that filter is genuinely selective or is just an artifact of missing data.

3. **Build full buying-committee maps for your three top tier-A accounts.** Use the five roles above. For every person, record name, title, tenure, what they are measured on, and the **source** of each fact. Explicitly name at least one committee gap per account and write the question you would ask to close it.

4. **Verify twenty contacts.** Take twenty records and cross-check each against a self-maintained source. Record how many had a changed title, changed employer, or could not be found at all. Compute your decay rate as a percentage and write down what that rate implies about how often you should refresh.

5. **Clean the list.** Apply suppression, deduplicate, and split your contacts into a verified list and a low-confidence list. Report the counts in each and state which one you would send to first and why.

6. **Set up one alert** — a saved search or a job-change alert on your persona in your tier-A accounts — and write the specific action you will take when it fires, including the timeframe. Bring the alert definition and the action to your next coaching session.

## Check your understanding

1. Why search on function plus seniority rather than title keywords? *(Answer: titles vary wildly for the same buyer; function and seniority catch the whole set, and title keywords should only refine.)*
2. In one sentence each, what does the professional network tell you and what does the contact database tell you? *(Answer: the network tells you who and why — current title, tenure, priorities; the database tells you how to reach them — email and phone.)*
3. Your committee map shows the dispatch manager built the current spreadsheet process. What two roles might he hold at once, and why does it matter? *(Answer: end user and blocker — he owns what you would replace, which changes how you run the deal.)*
