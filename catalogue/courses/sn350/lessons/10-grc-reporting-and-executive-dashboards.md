---
lesson_id: sn350-10
course_id: sn350
pathway: servicenow-implementation-specialist
title: GRC Reporting and Executive Dashboards
order: 10
kind: lesson
competency_ids:
  - D9-S1-C01
  - D9-S1-C02
  - D9-S1-C05
objectives:
  - Build risk and compliance dashboards that perform well and expose data only to authorized readers
---

## Two audiences, two products

The visible output of a GRC program is a picture, and there are exactly two pictures worth building.

The **operational** view answers "what do I have to do this week." Its audience is practitioners, control owners, and issue owners. It is a working surface: lists more often than charts, filtered to *me*, sorted by urgency, and clickable straight through to the record. Its quality test is whether someone can start work from it without opening another tab.

The **executive** view answers "are we in control, and is it getting better." Its audience is a risk committee, an audit committee, or a CISO. It is a small number of trended numbers with context: posture by obligation, risk by band, movement over the last four quarters. Its quality test is whether a director can leave the meeting with one decision.

The mistake that ruins most GRC dashboards is building one artifact for both. An executive shown a 300-row overdue attestation list disengages; a practitioner shown a quarterly trend line cannot act on it. Build two, and be willing to say no when someone asks to merge them.

## Choosing the right visualization

Report type follows the question, not taste.

```text
Question shape                                Build
--------------------------------------------  --------------------------------
"What do I need to work on?"                  List, filtered to the user,
                                              sorted by due date
"How many, split by one category?"            Bar (horizontal for long labels)
"How is this composed?" (few parts, one       Pie or donut - only with fewer
whole, sums to 100%)                          than about six slices
"How has this moved over time?"               Time series from a Performance
                                              Analytics indicator, not a
                                              report over live records
"Two dimensions at once, spot the hot cell"   Heatmap - the natural form for
                                              likelihood by impact
"One number against a target"                 Single score with target and
                                              trend sparkline
"Where in the distribution is the pain?"      Histogram or aging buckets
```

Two GRC-specific notes. The **risk heat map** is a likelihood-by-impact grid with counts in cells, and it is the one chart every risk committee expects; build it, but pair it with a trend, because a heat map is a snapshot and a snapshot cannot show whether the program is working. And **aging buckets** beat averages for issues: a mean age of 40 days hides the fact that most close in a week and six have been open a year, and it is the six that constitute the finding.

Trend is where reports and Performance Analytics part company. A report reads current records — it can only ever show today. To show that compliance moved from 71 to 88 percent over two quarters you need collected, dated scores, which is what the PA indicators from Lesson 7 produce. If a stakeholder wants history and the indicator does not exist yet, the honest answer is that the trend starts when collection starts, not a reconstruction.

## An operational report set

Start here, because these get used daily and their usage is what keeps the program alive:

- **My open attestations**, filtered to the logged-in user, sorted by due date, with overdue highlighted.
- **My controls with a failing indicator**, current status per control with the failure detail visible in a column.
- **My open issues**, aged into buckets, with severity and due date.
- **Issues past due, by owner**, for the practitioner chasing them — the one place a named list is appropriate.
- **Controls with no test result in 90 days**, the coverage gap that predicts next quarter's findings.

Filter to the current user with a dynamic reference rather than a hard-coded name, so one report serves everybody. That single technique replaces the sprawl of per-team report copies that clogs most instances and makes maintenance impossible.

## An executive report set

Fewer, bigger, trended:

- **Compliance posture by authority document**: percentage of controls effective, one bar per obligation, with the count of untested controls shown separately so the number cannot be inflated by silence.
- **Residual risk distribution**: heat map now, plus a trend of the count of risks above appetite.
- **Exceptions and acceptances outstanding**, with expiry within 90 days called out. This is the slide that prevents quiet permanent waivers.
- **Issue closure performance**: opened versus closed per month, with the reopen rate beside it.
- **Program operation**: attestation completion rate and indicator coverage, the two leading measures from Lesson 7.

Three presentation disciplines. Always show the denominator — "94 percent compliant" over an unstated population is unfalsifiable. Always show untested separately from failed, because merging them lets a program look good by testing less. And put the as-of date on the artifact, since executive material gets screenshotted and forwarded, and an undated compliance number circulating for a month is a liability.

## Making reports fast

GRC tables get large: indicator results and attestation responses accumulate per control per period forever, and a naive report over three years of results will crawl.

**Filter on indexed, selective fields first.** Reference fields and states are indexed; a query that narrows on entity, control, or state before anything else does far less work.

**Avoid leading-wildcard text matching on large tables.** A CONTAINS condition on a description field cannot use an index and forces a scan. If you need it repeatedly, add a proper field and populate it.

**Do not group or filter by a deep dot-walk on a large result set.** Each hop is a join. Where a report constantly dot-walks to the entity's business unit, denormalize that value onto the control at generation time and report on the local field.

**Aggregate at collection, not at read.** This is the biggest available win. A report that counts three years of indicator results every time someone opens a dashboard is doing the same arithmetic thousands of times; a PA indicator computes it once per day and stores a score. Any widget showing history should be reading collected scores.

**Bound the window.** Almost no operational report needs all history. Default to a rolling period and let the reader widen it deliberately.

**Watch the row limits.** A chart truncated at the platform's row cap is not slow, it is *wrong*, and it fails silently. Check the count your report is aggregating over against the limit, and if you are near it, aggregate rather than list.

```javascript
// Diagnostic: how much work is this report actually doing?
// Run before publishing anything on a large GRC table.
var check = new GlideAggregate('sn_grc_indicator_result');
check.addEncodedQuery(REPORT_ENCODED_QUERY);
check.addAggregate('COUNT');
check.query();
var rows = check.next() ? parseInt(check.getAggregate('COUNT'), 10) : 0;

gs.info('Rows scanned by this report: ' + rows);
// Rules of thumb:
//   under ~50k   fine as a live report
//   50k-500k     narrow the window, or move the aggregate to a PA indicator
//   over ~500k   PA indicator only; do not run this live on a dashboard
```

Do this before publishing, not after the complaint. A dashboard that takes twelve seconds to load is a dashboard that gets opened once.

## Exposing the right data to the right readers

GRC reporting is the point where a well-secured implementation most often leaks, because reports feel like presentation rather than access. Five rules.

**Row-level access control still applies to reports.** A report does not bypass table access rules — a reader sees only rows they could read on the list. That is the foundation, and it means the *first* fix for a reporting exposure is almost always a table access rule, not a report setting.

**Sharing a report is not granting access.** Sharing controls who can see the report *definition*. Two people opening the same shared report can legitimately see different numbers, and this surprises people constantly. Test every shared report with a low-privilege account before publishing, and never let a low-privilege reader's empty chart be mistaken for a compliance result of zero.

**Aggregates can leak what rows cannot.** A count of "critical risks in the Payments business unit: 3" reveals something even to a reader who cannot open any of the three, and small-cell aggregates leak more than their authors expect. Where the aggregate itself is sensitive, restrict the widget and the dashboard, not just the underlying rows.

**Performance Analytics scores are collected data, held separately from the records they summarize.** Do not assume record-level access rules automatically constrain who can read a collected score. Treat PA content as its own access surface: restrict who can view sensitive indicators and dashboards explicitly, and think before publishing a widely shared dashboard built on a restricted population.

**Restrict at query time when the rule is complex.** Where "you may see risks for entities your group supports" is the requirement, a before-query business rule that adds the constraint centrally is more reliable than hoping every report author filters correctly.

```javascript
// Before-query business rule on the risk table.
// Non-practitioners see only risks whose entity is supported by one of
// their groups. Practitioners, auditors, and admins are unaffected.
(function executeRule(current, previous) {

  // Role names and the entity-to-support-group path below are illustrative.
  // Use your release's IRM role names, and confirm how the risk's entity
  // resolves to a group before relying on the dot-walk.
  if (gs.hasRole('sn_risk.admin') || gs.hasRole('sn_risk.practitioner') ||
      gs.hasRole('sn_audit.auditor') || gs.hasRole('admin')) {
    return;
  }

  var groups = gs.getUser().getMyGroups();
  var groupList = new global.ArrayUtil().convertArray(groups).join(',');

  if (!groupList) {
    current.addQuery('sys_id', 'NONE');   // deny by default, not allow
    return;
  }

  current.addQuery('entity.support_group', 'IN', groupList);

})(current, previous);
```

The deny-by-default branch is the part to copy. A user with no groups should see nothing, not everything — and a missing else branch here is exactly the kind of defect that only shows up when a contractor with no group membership opens a dashboard.

## Distribution, and where it leaks

Scheduled distribution — a report emailed weekly to a list — is the feature most likely to undo careful access design, for one structural reason: **an emailed report is rendered once, under one identity, and sent to everyone on the list**. The row-level rules that protect the interactive view do not re-evaluate per recipient. A schedule created by an administrator can therefore mail administrator-visible rows to an audience entitled to none of them, and no error appears anywhere.

Three rules keep it safe. Run scheduled distributions under an identity whose visibility is appropriate for the *least* privileged recipient. Prefer sending a link over an attachment where the audience has instance access, so the recipient's own rules apply when they open it. And audit existing schedules periodically: distribution lists accumulate leavers, and a compliance summary landing in a former employee's forwarded mailbox is an incident, not an inconvenience.

The same reasoning applies to exports. Anything leaving the platform loses its access rules permanently, so decide deliberately which reports may be exported at all, and treat a request for a recurring export as a request for an integration with a defined contract rather than as a reporting preference.

## Assembling the dashboard

A dashboard is a composition, and the composition rules are simple: no more than about six widgets on the executive view, the most important number top-left, tabs to separate audiences rather than scrolling, and interactive filters for the dimensions people actually re-slice by — business unit, authority document, risk category. Give every widget a title that states the question it answers rather than the table it queries, and confirm that each one is either actionable or contextual. A widget that is neither is decoration, and decoration is what makes a dashboard slow.

## Practice

Use a developer instance carrying your work from the earlier lessons.

1. **Build the operational set.** Create at least three of the operational reports listed above, each filtered dynamically to the logged-in user. Verify with two different test accounts that each sees only their own items.

2. **Build the executive set.** Create at least three executive reports, including a risk heat map and one trend backed by a Performance Analytics indicator. Every percentage must display its denominator, and untested must be visibly separate from failed.

3. **Measure before you publish.** Run the row-count diagnostic against your two heaviest reports. Record the counts. For any report over the fine threshold, apply at least two optimizations from this lesson and report the before and after load time.

4. **Break a report on purpose.** Build a deliberately slow report — a wildcard text condition and a deep dot-walk group-by over a large table. Time it, then rebuild it correctly and time it again. Write one paragraph on which change mattered most and why.

5. **Secure it.** Implement the before-query rule for one sensitive table, including the deny-by-default branch. Then open your executive dashboard as: an administrator, a practitioner, a control owner in one group, and a user with no groups. Record what each sees. Any difference you did not predict is a finding against your own design — write down the fix.

6. **Defend one number.** Pick one executive widget and write the three sentences you would say if a director asked "where does that number come from, and what would make it wrong?" If you cannot answer the second half, the widget is not ready to publish.

## Check your understanding

1. Two people open the same shared report and see different numbers. Is that a defect?
2. Why does a trend chart need a Performance Analytics indicator rather than a report over live records?
3. A scheduled weekly report is created by an administrator and emailed to all control owners. What can go wrong?
4. What two things must every executive percentage show?

*Answers:* (1) Usually not; sharing a report shares its definition, and each reader still sees only rows they can read. (2) Reports read current records and can only show today; trends need collected, dated scores. (3) It renders once with administrator visibility and sends those rows to everyone on the list. (4) Its denominator, and untested items counted separately from failed ones (plus an as-of date).
