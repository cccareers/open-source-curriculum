---
lesson_id: dm201-10
course_id: dm201
pathway: digital-marketer
title: Off-Page SEO and Link Acquisition
order: 10
kind: lesson
competency_ids:
  - D1-S1-C02
objectives:
  - Plan an ethical off-page and link acquisition strategy
  - Evaluate the quality of a referring domain
---

## Off-Page SEO and Link Acquisition

Everything you have done so far in this course happens inside your own domain: queries, intent, titles, internal links, crawl fixes. All of that is under your control. Off-page SEO is the opposite. It is the part of your search performance decided by other people, on their websites, for their own reasons.

That loss of control is why off-page work is misunderstood, and why it is the area where apprentices most often get talked into something that damages the site they are supposed to be helping. By the end of this lesson you will be able to plan an ethical off-page and link acquisition strategy, and evaluate the quality of a referring domain with a scorecard you can defend to a manager.

### What "off-page" actually covers

Off-page SEO is not a synonym for link building. Links are the most measurable part, which is why they dominate the conversation, but they are one of several things happening away from your site that shape how search engines and people judge it.

- **Links from other sites.** A hyperlink from another domain to yours. Still the load-bearing off-page signal, and the one this lesson spends most of its time on.
- **Unlinked brand mentions.** Someone writes "we switched from spreadsheets to Meridian Payroll last year" and never links. It is weaker than a link, but it is not nothing, and it is often a link you can go and ask for.
- **Branded search demand.** People typing `meridian payroll` or `meridian payroll pricing` into Google. The hardest off-page signal to fake and the most honest measure of whether the brand is landing. Watch it in Search Console by filtering Performance to queries containing your brand name.
- **Reviews and third-party listings.** Software review sites, marketplace listings, app directories. These matter for the buying decision more than for the algorithm, but they also rank for `meridian payroll review` and shape what a searcher sees when they check you out.
- **Community presence.** Forums, subreddits, Slack and Discord communities, professional associations. Mostly `nofollow` or `ugc` links, low direct SEO value, occasionally the origin of a real relationship.
- **Press and analyst coverage.** A mention in a trade publication or a payroll-industry newsletter.

Hold those six as one system. A company with real customers, real opinions, and a real product accumulates all six at once. A company that only has links has usually bought them, and that shows.

### Why links still function as a signal

The original insight is simple: a link is a person choosing to send their own readers somewhere else. It costs the linking site something — attention, and the risk of looking foolish if the destination is bad. That cost is what makes the signal informative. Anything that removes the cost removes the signal, which is the whole logic behind why bought, swapped, and automated links get devalued.

Search engines do not count links. They weigh them, and the weight depends on things you can reason about:

**Relevance of the linking page.** A link to `meridianpayroll.com/templates/payroll-register-template` from an article on bookkeeping close procedures is topically adjacent. The same link from "top 50 SaaS startups to watch" is not. Relevance is judged at the page level first, then the site level — a payroll article on a general business site can beat an off-topic page on a payroll site.

**Editorial intent.** Did a human place this link because it helped the reader, or did it appear because of a template, a plugin, a sponsorship, or a contributor paid per placement? Footer links, author-bio links, and sidebar "partners" blocks are structural rather than editorial, and are treated accordingly.

**Prominence and placement.** A link in the second paragraph of the body, inside a sentence explaining why to click, is prominent. The 41st item in an unstyled list at the bottom of a resources dump is not. Placement is a reasonable proxy for how much the author cared.

**Surrounding context.** The sentence around the link describes the destination in the linking site's own words. A link earned by publishing useful data tends to be surrounded by a description of that data — the context is doing real work.

**Independence.** Two links from one domain add far less than one link each from two unrelated domains. Referring *domains* is the meaningful unit, not raw link count.

Put those together and you get the rule governing every decision in this lesson: **one link from a genuinely relevant publication, placed editorially inside relevant copy, outweighs a hundred links from directories.** That is not a slogan. It follows from the fact that the directory links cost nobody anything to give.

The corollary, stated plainly because you will meet vendors who depend on you not knowing it: **most easily-obtained links are worth very little, and link volume is a weak proxy for link value.** If a link is available to anyone who fills in a form, it is available to your competitors too, and it carries almost no information about your site.

### The link attributes: `nofollow`, `sponsored`, `ugc`

Three `rel` attribute values matter to you. All three are declarations the linking site makes about the nature of the link.

```html
<a href="https://meridianpayroll.com/pricing" rel="nofollow">Meridian Payroll pricing</a>
<a href="https://meridianpayroll.com/pricing" rel="sponsored">Meridian Payroll pricing</a>
<a href="https://meridianpayroll.com/pricing" rel="ugc">Meridian Payroll pricing</a>
<a href="https://meridianpayroll.com/pricing" rel="sponsored nofollow">Meridian Payroll pricing</a>
```

- **`nofollow`** — the general-purpose "I do not vouch for this destination" declaration. Originally created for comment spam.
- **`sponsored`** — this link exists because of an advertisement, a sponsorship, a paid placement, or another compensation arrangement.
- **`ugc`** — user-generated content: forum posts, comments, community profiles.

Two facts people get wrong.

First, **Google treats these as hints, not commands.** Since 2019 the documented behavior is that Google may still use a `nofollow` link for discovery and may still consider it as a signal. So a `nofollow` link from a major publication is not worthless, and you should never decline coverage because the outlet nofollows everything — plenty of large news sites do.

Second, **the disclosure obligation runs the other way.** If you paid for a link, or gave anything of value for it, that link must carry `rel="sponsored"` or `rel="nofollow"`. That is not optional politeness: undisclosed paid links that pass ranking signals directly violate Google's link spam policies. If a publication offers a "sponsored content package", make sure the links are marked. Refusal tells you what kind of operation you are dealing with.

Check what a page declares without any tooling: load it, view source, find your URL, read the `rel` attribute. Do this before you celebrate a placement, and record it in your log.

### Google's link spam policies, stated plainly

Google publishes a spam policy document. The link-related portion forbids "link schemes" — any links intended to manipulate ranking rather than help readers. The practices that fall inside that definition include:

- **Buying or selling links** that pass ranking signals, whether the payment is money, product, or services.
- **Excessive link exchanges** — "link to me and I'll link to you", run at scale.
- **Private blog networks (PBNs)** — a set of sites you own or control, built to link to your money site.
- **Paid guest-post networks** and large-scale article marketing where the article exists only to carry the link.
- **Automated link building** — software or services that create links programmatically.
- **Widget and footer link injection** — putting a link to your site inside a widget, theme, template, badge, or footer that other sites install, so the link propagates without anyone choosing it.
- **Requiring a link** as a condition of a partnership, a discount, or a review.

None of these is a grey area you can finesse. They are named, published violations. Do not do them, and if someone senior asks you to, say so and put it in writing.

There are two different consequences and they behave very differently.

**Algorithmic devaluation** is the common one. Google's systems recognize the pattern and stop counting the links. Nothing is announced and nothing appears in Search Console. Your rankings simply do not improve, or they drift down as the artificial support is discounted. The money is gone and there is nothing to appeal. This is what happens to the overwhelming majority of link-scheme spend.

**A manual action** is rarer and much louder: a human reviewer at Google has looked at your site and applied a penalty. You find out in Search Console under **Manual Actions**, which normally says "No issues detected". When there is a problem you see the type — for links, typically "Unnatural links to your site" — whether it applies site-wide or to a section, and a short description. Rankings for the affected scope drop hard.

Getting out involves **reconsideration**. Do the cleanup first: identify the offending links, get as many removed as you genuinely can, document every attempt, and disavow the remainder if removal is impossible. Then file a reconsideration request from the Manual Actions report. A person reads it. It must explain what happened, what you did, and what you changed so it does not recur, with evidence. Vague apologies fail. Reviews take days to weeks, and a rejection means another cleanup round. Assume a multi-month recovery and no guarantee rankings return.

Check Manual Actions on any site you inherit. It takes fifteen seconds and it occasionally explains a year of confusing data.

### Anchor text, handled correctly

Anchor text is the visible, clickable words of a link. Write anchors that are **descriptive and natural**. "Meridian's free payroll register template" is a good anchor; "click here" is a wasted one; "best payroll software for small business 2026" on someone else's site is a red flag, because no editor writes that sentence naturally.

Here is the shape of a healthy inbound profile. Internalise the shape, not the percentages, which vary enormously by industry:

| Anchor type | Example | Typical share |
| --- | --- | --- |
| Brand | `Meridian Payroll` | Large |
| Bare URL | `meridianpayroll.com/templates` | Common |
| Natural language / generic | `this payroll template`, `here`, `their pricing page` | Common |
| Partial match | `Meridian's payroll register template` | Moderate |
| Exact commercial match | `payroll software for small business` | Rare |

Now the warning. **Do not engineer anchor ratios.** People will tell you to target a specific percentage mix. That is a bad idea for two independent reasons, either sufficient on its own.

It is **detectable**: a profile where inbound anchors cluster on commercial phrases at rates that never occur in editorial writing is one of the oldest and most reliable spam patterns there is.

It is **pointless**, because you do not control anchor text on other people's sites. Real editors write their own sentences. The only way to control anchors at scale is to write the linking content yourself — which means running a link scheme, which takes you back to the previous section. The healthy ratios above are an *output* of earning links honestly, not an *input* you dial in. The one place you legitimately control anchor text is your own internal links, and lesson 07 owns that method.

### The ethical acquisition plays

The strategic frame: you are not "building links". You are creating reasons for a specific, named person to link to you, then making sure they know it exists. Every play below is a different kind of reason. Treat the return figures as calibrated expectations, not promises.

Before any of it: **fix your internal links first** — the cheapest authority you will ever move is the authority already sitting on your own site, and lesson 07 covers how.

**1. Original research and proprietary data.** You have data nobody else has. Publish it.

- *Effort:* 20–40 hours for a real study, plus promotion.
- *Realistic return:* the highest per-hour link yield available to a small company, but very high variance. A good one earns 15–60 referring domains over 12 months; a bad one earns 2.
- *Meridian example:* Meridian processes payroll for thousands of small businesses. Anonymised and aggregated, that yields the "Small Business Payroll Timing Report" — what share of small employers run semi-monthly versus biweekly, how correction rates vary by company size, how often the first payroll of the year gets amended. No competitor has that, and journalists writing about small-business finance need exactly that kind of citable number. Publish it at `/blog/small-business-payroll-timing-report` with a clear methodology and sample size, and put every chart's underlying number in text so people can quote it.

**2. Genuinely useful free tools and templates.** Meridian already has `/templates/`, and it is under-used.

- *Effort:* 4–10 hours per template that already exists and needs polishing; 30+ hours for an interactive calculator.
- *Realistic return:* slow, compounding, durable. Template pages accumulate links for years because people writing "how to run payroll" need something to link to at step four.
- *Meridian example:* the payroll register template, the new-hire onboarding checklist, a gross-to-net calculator. The link-earning move is not building them — it is making each one *citable*: stable URL, clear title, no email wall in front of the download, and a one-line description an author can paraphrase.

**3. Expert commentary and journalist sourcing.** Reporters need a named human to quote on deadline.

- *Effort:* 2–4 hours a week, ongoing.
- *Realistic return:* out of 40 responses in a quarter, 3–8 published quotes. Some outlets link, some only name you — the unlinked ones become reclamation targets.
- *Meridian example:* Meridian's head of compliance answers queries about payroll tax deadline changes. Speed and specificity win: reply inside two hours with a two-sentence quote a reporter can paste, not a pitch.

**4. Digital PR pitching.** Taking a specific story to a specific journalist.

- *Effort:* 15–30 hours per campaign.
- *Realistic return:* depends entirely on whether the story is real. A newsworthy angle on play 1 produces 5–20 domains; a product announcement produces roughly zero.
- *Meridian example:* pitch the report's most surprising finding — that 31% of small employers amended at least one payroll last year — to small-business and accounting trade press, not general tech media.

**5. Resource-page and broken-link outreach, done honestly.** Find curated resource pages in your topic, find dead links, offer a genuine replacement.

- *Effort:* 6–10 hours to build and check a list of 60 prospects.
- *Realistic return:* low and falling — 1–4 links per 60 prospects. A steady background activity, not a strategy.
- *Meridian example:* a state CPA society's "small business resources" page links to a payroll form that 404s. Tell the page owner which link is dead and offer `/templates/payroll-register-template`. The honest version means you report the dead link whether or not they take your suggestion.

**6. Integration and partner pages.** If your product integrates with anything, the partner usually has a directory.

- *Effort:* 2–5 hours per partner.
- *Realistic return:* small in number, high in relevance and durability.
- *Meridian example:* the accounting platforms, time-tracking apps, and benefits providers Meridian syncs with. Ask for a listing with a description you supply. Never *require* a reciprocal link — that crosses into exchange territory.

**7. Customer case studies.** Your customer often links to the story about them.

- *Effort:* 8–12 hours per study.
- *Realistic return:* 30–50% of featured customers link back, and the link is highly relevant.
- *Meridian example:* a 40-person landscaping company cut payroll close from six hours to forty minutes. Write it up honestly with their numbers and send them the graphics.

**8. Community participation and speaking.** Conference and webinar pages, association directories, podcast show notes.

- *Effort:* 10–20 hours per engagement including prep.
- *Realistic return:* 1–3 links each, often `nofollow`, plus the pipeline that actually justifies the time.
- *Meridian example:* a session on payroll compliance for seasonal workforces at a regional bookkeepers' conference.

**9. Unlinked-mention reclamation.** The cheapest play in the list.

- *Effort:* 3–5 hours a month.
- *Realistic return:* 20–35% conversion, far above any cold-outreach play, because the author already chose to mention you.
- *Meridian example:* search `"Meridian Payroll" -site:meridianpayroll.com`, set an alert, and each month email the authors who mentioned the brand without linking. One sentence: thanks for the mention, here is the URL if it is useful to your readers.

### Evaluating a referring domain: the scorecard

You will be offered opportunities constantly. You need a consistent way to say yes or no that does not depend on your mood or on one vendor number.

Score each dimension 0–3, maximum 21.

| # | Dimension | 0 | 3 |
| --- | --- | --- | --- |
| 1 | **Topical relevance** | Unrelated to payroll, HR, accounting, or small business | Core audience overlaps with Meridian's buyer |
| 2 | **Evidence of a real audience** | No engagement anywhere; no newsletter, no social traction | Active readership, comments, shares, a mailing list |
| 3 | **Editorial standards** | Anonymous or AI-spun copy, no bylines, no corrections | Named authors with credentials, editing, dated updates |
| 4 | **Indexation** | Site or target page not indexed | Site indexed and the specific page appears in Google |
| 5 | **Outbound link patterns** | Every post links out to unrelated commercial sites | Sparse, relevant, editorial outbound links |
| 6 | **Sponsored-post footprint** | "Write for us — $80 per post", casino and CBD posts alongside finance | No paid-post shop; sponsorships disclosed properly |
| 7 | **Likely placement** | Author bio, footer, or a list of 60 links | In-body, in relevant copy, near the top |

**Check indexation yourself.** Search `site:example.com` and paste the specific target URL into Google. A page Google has not indexed cannot pass anything to you. This one check kills a surprising share of "guest post opportunities", because many of those sites are already deindexed.

**Vendor estimates are one input among several.** Backlink-index tools and rank trackers report scores named Domain Rating or Domain Authority, plus estimated monthly traffic. These are **third-party vendor estimates** computed from a crawl the vendor owns. They are not Google signals; Google publishes no such public score. Use them as a rough filter, never as the decision. They are also the easiest number in SEO to inflate deliberately, which is exactly why paid-post sellers advertise them. With no paid suite, the free fallback is a manual read of the site plus your own Search Console Links report, which tells you what kinds of sites already find you linkable.

### The scorecard applied

Six candidates a Meridian apprentice might realistically be looking at. Scores are out of 21.

| Domain | Rel. | Aud. | Edit. | Index | Outb. | Spons. | Place. | Score | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| smallbizbookkeeping.com | 3 | 3 | 3 | 3 | 3 | 3 | 3 | **21** | Pursue first. Payroll-adjacent, named CPA authors, no paid-post shop, would link in-body. Worth 10 hours. |
| statecpasociety.org | 3 | 2 | 3 | 3 | 3 | 3 | 2 | **19** | Pursue. Resource-page placement, so lower prominence, but the relevance and editorial standards are excellent and it is durable. |
| hrleadersmonthly.com | 2 | 3 | 3 | 3 | 2 | 2 | 3 | **18** | Pursue. HR rather than payroll, so relevance is one step out, but real readership and real editing. Good digital-PR target for the timing report. |
| freelancetoolsdaily.com | 2 | 1 | 2 | 3 | 1 | 1 | 2 | **12** | Maybe. Thin audience and heavy outbound linking. Only worth it if the placement is in-body and free. Do not pay. |
| bizgrowthinsights.net | 1 | 0 | 0 | 1 | 0 | 0 | 1 | **3** | **Reject.** "Write for us — $75, do-follow guaranteed, 24-hour turnaround." Payroll posts sit beside crypto and casino posts, bylines are stock-photo personas, and only part of the site is indexed. This is a paid-post shop; buying a do-follow link here is a link spam policy violation and the domain is likely already devalued. |
| paylinkdirectory.info | 1 | 0 | 0 | 0 | 0 | 0 | 0 | **1** | **Reject.** A submission directory: 12,000 outbound links, no editorial layer, and `site:paylinkdirectory.info` returns almost nothing, meaning Google has largely dropped it. Free to submit, which is exactly the problem — zero cost to obtain means zero information conveyed. Skip. |

Rules of thumb: **17+ pursue actively**, **12–16 pursue only if effort is low**, **under 12 decline**. A 0 on relevance or on sponsored-post footprint is an automatic no regardless of total.

### Outreach mechanics

**Finding the right person.** Do not email `info@`. Find the author of the specific page you want to appear on — their byline usually links to a profile with contact details. Failing that, find the editor who commissions the section. The test: can you name the human and cite the specific page of theirs you read? If not, you are not ready to send.

A pitch that works is short, specific, and easy to say yes to.

```txt
Subject: dead link on your small business payroll resources page

Hi Dana,

Your "Payroll basics for new employers" post links to a payroll
register template at forms.oldsite.com that now 404s — it's the
third link under step 4.

We publish a free one at meridianpayroll.com/templates/payroll-register-template.
No email required to download, and it covers semi-monthly and biweekly
schedules. Might be a clean swap.

Either way, wanted you to know about the broken link.

Ben Alvarez
Meridian Payroll
```

Why that works: it names her, it names the specific page and the specific link position, it delivers value before it asks for anything, the ask is a single swap, and it is under 90 words. She can verify every claim in thirty seconds.

Now the version you will be tempted to send.

```txt
Subject: Link Building Opportunity - High Quality Content

Dear Webmaster,

I was browsing your amazing website and I really loved your content!
I noticed you write about business topics. We are a leading provider
of payroll solutions and we have written an amazing article that your
readers would love.

Would you be interested in a guest post? We can also offer a link
exchange or discuss compensation. Our website has a DA of 61.

Please let me know your rates.

Best regards,
Marketing Team
```

Everything is wrong with it. "Dear Webmaster" proves nobody read the site, and "amazing content" with no specifics proves the same. "Business topics" is a mail-merge field. The value proposition is entirely about the sender. It offers a link exchange and payment in one paragraph, volunteering two link spam policy violations to a stranger. It quotes a vendor estimate as if it were a Google signal. And no human signed it.

**Follow-up etiquette.** One follow-up, seven to ten days later, three sentences, adding something new — a second angle, or simply "no problem if not a fit". Then stop. There is no second follow-up; chasing people who ignored you twice costs you the relationship and any future pitch.

**Response-rate arithmetic.** A well-researched campaign to genuinely relevant prospects looks roughly like this:

| Stage | Count | Rate from previous |
| --- | --- | --- |
| Pitches sent | 120 | — |
| Opened | 41 | 34% |
| Replied | 9 | 22% of opens, 7.5% of sent |
| Positive replies | 5 | 56% of replies |
| Links live | 3 | 2.5% of sent |

Three links from 120 pitches. If the campaign took 22 hours including prospecting, that is roughly 7 hours per link. Now ask the question that matters: were those three worth 22 hours, given that one is from smallbizbookkeeping.com and highly relevant? Often yes — but you can now compare it honestly against play 1 or play 9, and you will usually find reclamation and research beat cold outreach per hour. That is the point of doing the arithmetic.

A campaign reporting a 40% link rate is either pitching a tiny list of warm contacts or paying for placements. Ask which.

### Measuring off-page work

Search Console's **Links** report is your primary free measurement tool. It has three sections you should read differently.

- **Top linking sites.** Referring domains ordered by link count. Read it for *composition*, not the total: look for domains you did not expect, and for a single domain contributing thousands of links, which usually means a template or footer placement rather than editorial coverage.
- **Top linked pages.** Which of your URLs attract links. For Meridian this will be dominated by `/templates/` and a few `/blog/` posts — which tells you where to invest.
- **Top linking text.** Your anchor distribution from Google's own data rather than a vendor's crawl. Sanity-check it against the healthy shape above; commercial-phrase clustering you did not create is worth investigating.

Caveats: the report is sampled and lags, its counts do not match any third-party tool and are not meant to, and it shows links Google knows about, not links Google counts.

Alongside it, keep a **referring-domain log**. One row per earned link:

```csv
date_live,domain,url,target_url,play,rel_attribute,placement,score,hours,notes
2026-03-04,smallbizbookkeeping.com,/payroll-basics,/templates/payroll-register-template,broken-link,none,in-body,21,1.5,Dana swapped it same day
2026-03-11,hrleadersmonthly.com,/news/payroll-timing,/blog/payroll-timing-report,digital-pr,none,in-body,18,0.5,quoted the 31% amendment stat
2026-03-19,statecpasociety.org,/resources,/templates/,resource-page,nofollow,list,19,2.0,nofollow but durable and relevant
```

That log does three things a tool cannot: it records the `rel` attribute and placement you verified by hand, it records the hours so you can compute cost per link by play, and it gives you a defensible record of every link you influenced — exactly what you need if a manual action ever arrives.

**What a healthy acquisition rate looks like.** For a company at Meridian's size, 3–8 genuinely relevant new referring domains a month from active work, plus background acquisition from the templates and research. The shape matters more than the number: steady accumulation, varied domains, varied anchors, mostly to content pages rather than `/pricing`. A flat line for six months followed by 300 domains in a week is the pattern that gets sites investigated.

### Disavow

The disavow tool tells Google to ignore specified links to your site. It is almost never the right tool now.

Google's systems already ignore the overwhelming majority of spammy links automatically. Random spam links are normal, they happen to everyone, and they are not hurting you. Disavowing them accomplishes nothing except the risk of accidentally disavowing a good domain and losing a real signal — the tool is blunt and mistakes are silent.

The narrow case where disavow is correct: **you have a manual action for unnatural links**, or you inherited a site where someone demonstrably bought links at scale and removal attempts failed. Then you disavow what you could not remove, document the attempts, and file reconsideration. Outside that case, leave it alone. A "monthly disavow hygiene" retainer is a service sold for a problem that does not exist.

### A 90-day off-page plan for Meridian

Here is what the first quarter looks like. Note that the leading indicator is never "links" — leading indicators are things you can observe in weeks, before any link exists.

| Play | Target | Effort (hrs) | Expected links (90 days) | Leading indicator |
| --- | --- | --- | --- | --- |
| Unlinked-mention reclamation | 40 mentions found, 30 emailed | 12 | 6–9 | Reply rate above 25% by week 3 |
| Publish the payroll timing report | 1 research page + 3 supporting posts | 45 | 8–20 | Report page indexed and impressions rising in Search Console by week 6 |
| Digital PR on the report | 35 pitches to trade press | 20 | 4–8 | 2+ replies within 10 days of first send |
| Template page upgrades | 6 `/templates/` pages made citable | 18 | 3–6 (passive) | Template pages appearing in Top linked pages |
| Integration directory listings | 7 partners | 14 | 4–6 | 4+ listings confirmed by week 8 |
| Customer case studies | 3 studies | 30 | 1–2 | All 3 customers approve publication |
| Broken-link outreach | 60 prospects | 10 | 1–3 | 60 prospects scored by week 4 |
| Journalist sourcing | ongoing, 3 hrs/week | 36 | 2–5 | 15+ responses sent |
| **Total** | — | **185** | **29–59** | — |

Read that table honestly. 185 hours for perhaps 29–59 referring domains, of which maybe a third will score 17+ on the scorecard. That is what real off-page work costs. Anyone promising 50 links for a flat monthly fee is selling something from the forbidden list, and the devaluation section tells you how that ends.

Two closing honesty rules. **Never promise a ranking timeline.** Links take weeks to be discovered, their effect is gradual, and it is confounded with everything else you changed. Give a range with reasons: "if the report earns 15+ relevant domains, I'd expect the cluster's average position to improve over two to four quarters — faster if those pages already sit in positions 11–20, slower if we're behind entrenched competitors." And **report leading indicators weekly, links quarterly.**

## Practice

Build a complete off-page plan for one real site — your employer's, a client's, or a local organisation's, ideally one with a Search Console property you can access.

**Deliverable:** one spreadsheet or document containing (1) a scored prospect table of at least twenty domains, (2) two written pitch drafts, and (3) a 90-day off-page plan table.

1. **Establish the baseline.** Export all three sections of the Search Console Links report: top linking sites, top linked pages, top linking text. Note the referring-domain count and the three pages attracting the most links. Check **Manual Actions** and record what it says.
2. **Read the existing profile.** In three sentences: what kinds of sites already link here, what content earns those links, and whether the anchor distribution matches the healthy shape from this lesson.
3. **Identify linkable assets.** List every page someone outside the company would have a genuine reason to cite — templates, tools, data, guides. If there are none, name the one asset you would build first and why.
4. **Build a prospect list of at least twenty domains.** Source them from the topics your assets serve, from who links to comparable sites, and from partners, associations, and publications in the industry. Record domain, the specific target page on their site, and the named person you would contact.
5. **Score every prospect** on all seven dimensions, 0–3 each, with the total out of 21 and a one-sentence verdict. Include **at least three rejections** with specific reasons, and check indexation with `site:` for every prospect.
6. **Choose two pitches:** your highest-scoring prospect, and one mid-range prospect suiting a different play.
7. **Write both pitches**, under 120 words each. Each must name the person, cite a specific page of theirs, deliver something before it asks, and make exactly one ask. Note the play and your follow-up line.
8. **Draft the 90-day plan table** — play, target, effort in hours, expected links, leading indicator — with at least five plays. Total the hours and state honestly whether that time exists.
9. **Do the arithmetic.** For outreach plays, project pitches sent, expected replies, and expected links using this lesson's rates. State cost per link in hours.
10. **Write a five-sentence honesty note** to your manager: what the plan will and will not do, the realistic range of outcomes, why you cannot promise a timeline, and which practices you will not use and why.
