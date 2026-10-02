---
lesson_id: se202-02
course_id: se202
pathway: technical-sales-representative
title: Ideal Customer Profile and Target Lists
order: 2
kind: lesson
competency_ids:
  - D3-S1-C01
objectives:
  - Define an ideal customer profile and build a qualified target list from market signals
---

## Why targeting is the highest-leverage thing you do

Every hour you spend prospecting is spent on somebody. The only question is whether that somebody could ever plausibly buy what you sell. A representative working a sharp list and a representative working a sloppy list make the same number of calls, send the same number of emails, and hear a completely different set of outcomes — because one of them is talking to people with the problem and the other is talking to a random sample of the economy.

This is not a motivational point, it is an arithmetic one. Suppose you can make sixty dials and forty emails in a day. If eight percent of a sharp list will take a meeting when reached and one percent of a random list will, you do not need to work harder to get eight times the results; you need to spend the first three hours of the week deciding who goes on the list. Targeting compounds into everything downstream: your call opener is more relevant, your email subject lines write themselves, your objections get easier because you are no longer arguing with people who genuinely do not have the problem.

The output of this lesson is a written **ideal customer profile** (ICP) and a **target list** built from it — a spreadsheet of named accounts, each one on the list for a reason you can say out loud.

## What an ICP actually is

An ideal customer profile describes the *organization* that gets the most value from your product, fastest, with the least friction. It is a company-level description, not a person-level one. The person-level description — titles, responsibilities, what they care about — is a **buyer persona**, and it lives inside the ICP but is not the same thing.

The common failure is writing an ICP that is really a wish: "mid-market and enterprise companies in North America that value innovation." That excludes nothing. A usable ICP is made of attributes you can actually filter on, and each one has to change who is on your list. Test every line with the question: *if I deleted this attribute, would my list get bigger?* If not, the line is decoration.

Four families of attributes carry most of the weight.

**Firmographics** are the static facts about a company: industry or vertical, employee headcount, revenue band, geography, ownership structure (venture-backed, private-equity-held, public, family-owned), and number of physical locations. These are the coarse filters. They are easy to apply and they are where most reps stop, which is why most lists look the same.

**Technographics** are what the company runs. For technical sales this is often the sharpest filter you have, because your product usually integrates with, replaces, or sits alongside something specific. If your platform only connects to two of the four major cloud data warehouses, then companies running one of those two are a different prospect than companies running the other two. Technographic data comes from job postings, engineering blogs, public integration directories, and prospecting-tool technology tags.

**Operational signals** describe how the business runs in a way that creates your problem: transaction volume, number of field technicians, seasonality, whether they sell through distributors, how many entities they have to consolidate at month-end. These are the attributes closest to actual pain, and they are the hardest to filter on directly — you usually infer them from a proxy. A company with forty-two open technician requisitions has a field-service operation whether or not it says so anywhere.

**Disqualifiers** are the attributes that put a company *off* the list, and a good ICP names them explicitly. Regulated industries you are not certified for. Companies under a certain size where the deal never justifies the implementation. Companies that already own a competitor product on a multi-year contract signed last quarter. Writing disqualifiers down is what turns an ICP from a description into a filter.

### A worked ICP

Here is an ICP for a hypothetical product — a workforce scheduling platform for field service teams. Notice that every line either includes or excludes.

```text
ICP: Field Service Workforce Scheduling Platform

Industry:        Commercial HVAC, plumbing, electrical, and building
                 automation contractors; facilities management firms.
Headcount:       120–1,500 employees.
Field techs:     25+ technicians dispatched daily (this is the real
                 driver; headcount is a proxy for it).
Geography:       US and Canada; multi-branch operators preferred.
Revenue:         $20M–$400M annual.
Technographics:  Runs ServiceTitan, Salesforce Field Service, or a
                 homegrown/spreadsheet dispatch process. NOT already
                 on a modern scheduling suite.
Ownership:       Private-equity-backed roll-ups are a strong fit —
                 they acquire branches and inherit incompatible
                 dispatch processes.
Buying trigger:  Recent acquisition, new VP of Operations, or 10+
                 open technician requisitions.

Disqualify if:   Under 25 field techs (deal too small to implement).
                 Residential-only single-branch operators.
                 Signed with a direct competitor in the last 18 months.
                 Union agreements requiring bespoke scheduling rules
                 we cannot yet model.

Primary persona:   VP of Operations / Director of Field Operations
Secondary persona: Dispatch Manager (daily user, strong influencer)
Economic buyer:    COO or CFO at the $100M+ end
```

Read the disqualifier block again. It is the part that makes the profile expensive to write and valuable to own, because it costs you accounts you would enjoy putting on a list.

### Building the ICP from evidence, not opinion

If your company has existing customers, the ICP is discovered rather than invented. Take your closed-won deals from the last four to six quarters and look for what the good ones share. Three cuts are enough to start:

1. **Fastest to close.** Which accounts moved from first meeting to signature quickest? Short cycles usually mean the pain was already urgent and obvious.
2. **Highest retention or expansion.** Which accounts renewed and bought more? These are the customers where the product genuinely fit, as opposed to where the sales process was excellent.
3. **Closed-lost patterns.** Which deals died in evaluation, and what did they have in common? This is where disqualifiers come from.

Where you have no customer history — a new product, a new segment, your first weeks in a role — build the first ICP from the problem itself. Write down what has to be true operationally for the problem to hurt, then find the observable proxy for each of those conditions. "Dispatchers are re-planning routes by hand every morning" is the condition; "25+ technicians and no modern scheduling suite in the technology stack" is the proxy you can actually filter on.

Treat the first ICP as a hypothesis with a review date. After a hundred conversations you will know which attributes predicted interest and which were noise.

## Market signals and buying triggers

Firmographics tell you *who could* buy. Signals tell you *who might buy now*. Timing is most of outbound, and a signal is any public change that makes your problem newly urgent or newly funded.

Signals worth tracking:

- **Funding and financial events.** A raise, an acquisition, a merger, a new PE owner. Money and mandates arrive together.
- **Leadership changes.** A new VP or director in the function that owns your problem is the single strongest trigger in outbound. New executives are hired to change something, are evaluated on visible early wins, and are not yet attached to the incumbent vendor. The window is roughly their first ninety days.
- **Hiring patterns.** Job postings are the most underused free signal on the internet. They reveal team size, technology stack (listed in the requirements), growth direction, and pain. Twelve open dispatcher roles says something no firmographic filter can.
- **Expansion and location events.** New offices, new branches, entering a new region, a new distribution center.
- **Regulatory or compliance deadlines.** Any date-certain requirement in your buyer's industry creates a queue of companies that must act.
- **Technology changes.** A migration announced on an engineering blog, a competitor's end-of-life announcement, a public integration partnership.
- **Competitor churn.** A customer of a competitor publicly complaining, or a competitor being acquired and sunsetting a product line.

For each signal you decide to use, write down where you will see it and how often you will look. A signal you have no route to observing is not a signal, it is a wish. Most of these are visible in a prospecting platform's news and intent feeds, a professional network's job-change alerts, company career pages, and industry trade press — the mechanics of pulling them are lesson 3's subject.

## From ICP to target list

A target list is the ICP made concrete: named accounts with a reason and a priority. Build it in three passes.

**Pass one — cast the net.** Apply your hard firmographic filters and pull everything that matches. Do not judge yet. If this pass returns twelve accounts your filters are too tight; if it returns forty thousand, they are too loose. For a single rep working a territory, a healthy raw pull is a few hundred to a couple of thousand accounts.

**Pass two — enrich and tier.** Layer in technographics and signals, then sort into tiers.

- **Tier A** — matches the ICP *and* has an active trigger. These get the full treatment: deep research, personalized calls, custom email, multiple contacts per account. Expect 20–40 of these live at once. More than that and you are not doing tier-A work on any of them.
- **Tier B** — matches the ICP with no current trigger. Solid, patient territory. Lighter personalization, worked in batches, revisited on a schedule.
- **Tier C** — plausible but unproven, or edge cases of the profile. Worth a low-effort touch to test whether the ICP boundary is drawn in the right place.

**Pass three — hygiene.** Deduplicate by legal entity, not by name string: "Acme Corp", "Acme Corporation", and "ACME Corp." are one account, and calling all three makes you look like a robot. Merge subsidiaries under their parent if the parent buys centrally, and split them if branches buy independently — get this wrong and two reps call the same buyer. Strip out current customers, open opportunities another rep owns, and anyone on a do-not-contact list. Then check that each remaining row has an owner and a date.

### A target-list row

Your list needs enough columns to act on and few enough that you will actually maintain it.

| Column | Example | Why it's there |
| --- | --- | --- |
| Account | Northwind Mechanical | The entity |
| Tier | A | Determines effort per touch |
| Trigger | New VP Ops hired 3 wks ago | The reason it is tier A |
| Trigger date | 2026-07-06 | Triggers expire; this ages the row |
| Field techs (est.) | ~90 | The operational qualifier |
| Current stack | Homegrown dispatch + spreadsheets | Shapes the pitch |
| Persona contact | Dana Ruiz, VP Operations | Who you are actually calling |
| Source | Job postings + trade press | Lets you audit your own data |
| Status | Not started | Working state |
| Next action / date | Call 1 — 2026-07-29 | Nothing sits without a next step |

Two rules keep a list alive. First, **every row has a next action with a date** — a row with no next step is not a prospect, it is a note. Second, **triggers expire**. A leadership-change trigger is stale after about ninety days; when it ages out, the account drops to tier B rather than sitting in tier A forever pretending to be urgent.

## Sizing and sanity-checking the list

Work backwards from a goal. If you need eight new meetings a month, and roughly one in twelve worked tier-A accounts produces a meeting, you need about a hundred accounts actively worked per month. If each account takes seven to nine touches across calls and email, that is the daily activity your calendar has to hold. If the arithmetic does not close, the fix is a bigger or better list, not a longer day.

Sanity-check the list before you touch it. Pull ten rows at random and, for each one, say the sentence: *"I am calling this company because ___."* If the blank fills with a specific, observable fact, the row is sound. If it fills with "they matched the industry filter," you have a firmographic list, not a targeted one — go back and add signal.

## Practice

Build a real ICP and target list you will use for the rest of this course. Choose one product to sell: your employer's, a product you know well, or the field-service scheduling platform described above.

1. **Write the ICP.** Produce a one-page profile with all five blocks: firmographics, technographics, operational signals, at least three named buying triggers, and at least three explicit disqualifiers. Every line must exclude something. Then run the deletion test on each attribute — remove it and ask whether your list would grow. Delete any line that fails.

2. **Name your personas.** Identify the primary persona, one secondary influencer, and the likely economic buyer. For each, write one sentence about what they are measured on. You will use these in lessons 3 through 5.

3. **Build a 30-account target list** in a spreadsheet using the ten columns in the table above. Source accounts however you can reach: industry associations and member directories, trade publications, public company lists, job boards, conference exhibitor lists. Fill in Tier, Trigger, and Source for every row — a row without a source is not finished.

4. **Tier it.** Assign at least 8 accounts to tier A, and for each one write the specific trigger and its date. If you cannot find eight accounts with a live trigger, that is a finding: either your trigger definitions are too narrow or your market is quieter than you assumed. Write down which you think it is.

5. **Run hygiene.** Deduplicate by legal entity, resolve any parent/subsidiary questions, and note any rows you removed and why.

6. **Defend ten rows.** Pick ten accounts at random and write the sentence "I am calling this company because ___" for each. Bring the three weakest to your cohort or coach and discuss whether they belong on the list at all.
