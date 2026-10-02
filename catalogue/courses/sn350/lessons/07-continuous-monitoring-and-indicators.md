---
lesson_id: sn350-07
course_id: sn350
pathway: servicenow-implementation-specialist
title: Continuous Monitoring and Indicators
order: 7
kind: lesson
competency_ids:
  - D10-S1-C05
  - D9-S1-C03
objectives:
  - Configure indicators that test control effectiveness continuously instead of once a year
---

## The problem with annual testing

A control tested once a year is known to have worked on one day and is assumed to have worked on the other 364. That assumption is how organizations pass an audit in March and suffer the failure the control was supposed to prevent in July. Annual testing also produces the worst possible feedback loop for the people operating the control: they learn about a deficiency eleven months after they introduced it, at which point nobody remembers what changed.

Continuous monitoring replaces the assumption with measurement. An **indicator** is an automated or manual test that runs on a schedule, evaluates one assertion about a control, and returns a result — typically pass or fail, sometimes a value compared to a threshold. Configure enough good indicators and the annual test stops being the control's evidence and becomes a review of evidence that already exists.

There are two distinct meanings of "indicator" in play in a GRC implementation, and confusing them is the most common mistake in this material:

- A **GRC indicator** is a *control test*. Its question is binary: is this control operating as designed right now. Its consumer is the control owner and the compliance practitioner. Its failure produces an issue.
- A **Performance Analytics indicator** is a *measurement over time*. Its question is quantitative: what is this number, how has it moved, and is it heading toward or away from a target. Its consumer is a manager or an executive. Its failure produces a conversation.

You need both, they are configured differently, and a program that builds only one has either no early warning or no accountability. This lesson builds both and is explicit about which is which.

## GRC indicators: control tests that run themselves

An indicator is defined once as a **template** and attached to controls or risks, typically to every control derived from a given control objective. The template carries the test logic, the schedule, and the failure behavior; each attachment produces a stream of dated results against one control.

Three kinds by execution method:

**Automated indicators** evaluate a condition against platform data — a query over a table, a scripted check, or the result of an integration that loaded external data. These are the ones worth building. They cost nothing to run and they cannot be rubber-stamped.

**Manual indicators** ask a person a question on a schedule, usually a much smaller question than an attestation: one item, quick to answer, high frequency. Useful where the evidence genuinely is not on the platform, and a strong candidate for replacement by an integration later.

**Externally sourced indicators** take their result from data pushed in by another system — a scanner, a cloud posture tool, an access governance product. The platform's job is to hold the result, date it, tie it to the control, and act on failure. Design the ingestion contract carefully: a missing push must read as *unknown*, never as *pass*. Silence looking like success is the single most dangerous defect an indicator can have.

### What a good indicator asserts

The discipline is the same as writing a testable policy statement, tightened further. A good indicator is:

**One assertion.** "Change management is effective" is not an indicator. "Zero emergency changes in the last 30 days closed without a retrospective approval" is.

**Deterministic.** Two runs over the same data give the same answer. Anything that depends on who is looking, or on a value that changes while the query is running, produces flapping results and trains everyone to ignore the indicator.

**Against a defined population.** The same population question as scoping: over which entities, over what window. An indicator that silently changes its population when the CMDB changes is measuring two different things across time and its trend is meaningless.

**Explicit about tolerance.** Zero exceptions is a legitimate criterion. So is "fewer than three, all remediated within five business days." What is not legitimate is leaving it to the reader.

**Meaningful when it fails.** Before building it, answer: when this fails, who does what? An indicator whose failure has no owner and no action is telemetry, not a control test, and it should be demoted to a report.

Here is a scripted indicator with those properties, written for the access review control from Lesson 4:

```javascript
// GRC indicator: no privileged account on this entity has been dormant
// beyond the policy threshold. Returns a result object; fail is actionable.
// Population: accounts linked to this control's entity.
// Tolerance:  zero dormant accounts. Window: 90 days.
(function evaluateIndicator(entitySysId) {
  var THRESHOLD_DAYS = 90;
  var cutoff = new GlideDateTime();
  cutoff.addDaysUTC(-THRESHOLD_DAYS);

  var offenders = [];
  var acct = new GlideRecord('u_privileged_account');
  acct.addQuery('ci', entitySysId);
  acct.addQuery('active', true);
  acct.addQuery('last_used_on', '<', cutoff);
  acct.query();
  while (acct.next()) {
    offenders.push(acct.getValue('account_name'));
  }

  return {
    passed: offenders.length === 0,
    value: offenders.length,
    detail: offenders.length === 0
      ? 'No dormant privileged accounts beyond ' + THRESHOLD_DAYS + ' days.'
      : 'Dormant privileged accounts: ' + offenders.join(', '),
    evaluated_on: new GlideDateTime().getDisplayValue()
  };
})(current.entity);
```

Three details in that snippet are worth copying into everything you write. The population is bounded by the control's own entity, so the same template serves every generated control. The `detail` string names the offending records, so the resulting issue is actionable without anybody re-running the query. And the tolerance and window are constants at the top, where a reviewer can see them, rather than buried in the query.

Now consider what the script does **not** do: it does not distinguish "zero dormant accounts" from "zero accounts, because the integration that populates this table stopped running last week." Both produce `passed: true`. Fix it explicitly:

```javascript
// Guard: an empty or stale source population is UNKNOWN, not PASS.
var population = new GlideAggregate('u_privileged_account');
population.addQuery('ci', entitySysId);
population.addAggregate('COUNT');
population.query();
var total = population.next() ? parseInt(population.getAggregate('COUNT'), 10) : 0;

var freshness = new GlideRecord('u_privileged_account_load');
freshness.addQuery('ci', entitySysId);
freshness.orderByDesc('sys_created_on');
freshness.setLimit(1);
freshness.query();
var loadedRecently = freshness.next() &&
  freshness.getValue('sys_created_on') >= cutoffForLoad;

if (total === 0 || !loadedRecently) {
  return { passed: null, value: null,
           detail: 'Source data missing or stale; indicator not evaluated.' };
}
```

Write that guard into every data-driven indicator you build. It is the difference between monitoring and the appearance of monitoring.

### Scheduling, results, and failure

**Frequency** should follow the volatility of what is measured, not the frequency of the underlying obligation. A quarterly attestation obligation can perfectly well be supported by a nightly indicator; the obligation says how often you must formally confirm, not how often you may look. Cheap automated checks run daily. Manual checks run as rarely as tolerable.

**Results** accumulate as dated records against the control. Keep them — the history is what turns an indicator into a trend and lets a reviewer say "this control has failed in 4 of the last 12 weeks," which is a far stronger statement than a current status.

**Failure behavior** is configured, and it has three parts: what constitutes failure (a single fail, or a run of consecutive fails), what it does to the control (state change, effectiveness recalculation, roll-up impact), and what it creates. The normal answer for the last part is an issue, routed to the control owner, carrying the indicator's detail string — which is Lesson 9's subject. Consider requiring **consecutive failures** before raising an issue on noisy indicators; one flap at 3 a.m. that self-resolves does not need a human.

There is a governance dimension here too. Indicators read across the instance, sometimes into data more sensitive than the GRC practitioners are entitled to see. Run them with an appropriately scoped account, keep the result detail free of data the issue's recipients should not read, and remember that an indicator's detail field ends up in an email notification more often than anyone intends.

### Building a coverage strategy rather than a pile

Nobody automates every control, and trying is how continuous monitoring programs stall in month three. Sequence the build by value.

Rank candidate controls on three axes: **the risk they mitigate** (residual band of the linked risk), **the cost of the manual test** (how many person-hours per cycle it currently consumes), and **the availability of platform data** (is the answer already in a table). Build first where all three are favorable — high risk, expensive to test manually, data already present. Those indicators pay for themselves in one cycle and they buy you the credibility to ask for the integration work the harder ones need.

Deliberately decline the ones where the data does not exist and would be expensive to obtain. Writing "no automated test; quarterly manual attestation, evidence from the source system" on a control objective is a legitimate design decision, and it is far better than a fragile indicator held together by an unreliable export.

Track **indicator coverage** as a program metric from day one: the percentage of controls with at least one automated indicator, ideally weighted toward the ones mitigating high residual risk. Unweighted coverage rises fastest by automating the easy, low-value controls, which is exactly the wrong incentive.

### The contract for external results

When an indicator's result comes from outside, the integration is the control, and it needs to be specified like one. Agree six things in writing with the source system's owner:

- **What is being asserted**, in your words, not the tool's marketing language. "No host in this population has a critical vulnerability older than 30 days" is an assertion. "Vulnerability posture" is not.
- **The population and how it maps to your entities.** The external tool has its own asset identifiers. The mapping between those and your CIs is where these integrations fail, and it needs an owner and a reconciliation report, not a one-time spreadsheet.
- **The push cadence, and the maximum acceptable silence.** After which the indicator reads unknown.
- **What a missing entity means.** A host absent from the scanner's output is either not scanned or not in scope, and those are opposite conclusions. If the source cannot distinguish them, your indicator cannot either, and that limitation belongs on the record.
- **Authentication and least privilege.** A dedicated account with a role that permits exactly this write.
- **Who is notified when the integration itself fails**, which is a different question from who is notified when the control fails.

Then build a second indicator that watches the first: has this source pushed within its expected window. Monitoring the monitoring sounds excessive until the first time a quarter's evidence turns out to be an integration that stopped in week two.

## Performance Analytics indicators: measuring the program

The second kind of indicator answers a different question: how is the *program* doing. These are KPIs, and defining meaningful ones is a skill distinct from writing control tests.

A Performance Analytics indicator collects a value on a schedule and stores it as a dated score, building a time series you can trend, break down, forecast, and set targets against. Three types you will use:

- **Automated indicators** count or aggregate records matching a condition on each collection run. "Open compliance issues" or "controls in attest state past due."
- **Formula indicators** compute from other indicators. "Attestation completion rate" is completed divided by issued. Percentages should almost always be formula indicators over two counts, never a single hand-maintained number.
- **Manual indicators** hold values entered by a person, for things the platform genuinely does not know.

**Breakdowns** are what make a KPI usable. The same indicator broken down by business unit, by authority document, by risk category, or by control owner turns "68 percent" into "68 percent overall, 94 percent everywhere except one business unit at 31 percent," which is the version somebody can act on. Define breakdowns at the same time as the indicator; retrofitting them means recollecting history.

### Choosing KPIs that mean something

The test for a KPI is not whether it is measurable but whether a specific person would change a specific decision based on it. Apply four filters:

**Actionable.** Someone owns the number and can move it. "Total number of risks in the register" is not actionable — it goes up when the program improves, because a growing register usually means better identification.

**Leading where possible.** Lagging indicators tell you what already happened; leading indicators tell you what is about to. "Number of audit findings" is lagging. "Percentage of controls with no test result in the last 90 days" is leading, and it predicts the findings.

**Resistant to gaming.** Every published metric is optimized against. Ask how you would make this number look good without doing the work, and if the answer is easy, pair it with a counterweight. "Issues closed" pairs with "issues reopened within 60 days." "Attestation completion rate" pairs with "attestations completed on the due date itself," which detects bulk rubber-stamping.

**Bounded by a target with a rationale.** A KPI with no target is a chart. A target of 100 percent on everything is a target nobody believes. Where the obligation sets the number, use the obligation's number.

A defensible starter set for a compliance and risk program:

```text
KPI                                        Type      Leading?  Target   Pairs with
-----------------------------------------  --------  --------  -------  ---------------------
Attestation completion rate (in window)    formula   leading   95%      Same-day completion %
Controls with no result in 90 days         automated leading   0        Indicator coverage %
Indicator coverage (controls w/ >=1 auto)  formula   leading   70%      Indicator failure rate
Open issues past due                       automated lagging   0        Mean age of open issues
Issue reopen rate within 60 days           formula   lagging   <5%      Issues closed
Risks past their reassessment date         automated leading   0        Risks accepted, expired
Residual risk above appetite               automated lagging   0        Mitigations past due
```

Note the shape of the list: most of the leading indicators measure whether the *program is operating*, and most of the lagging ones measure whether it is *working*. An executive audience wants the second column; the practitioner running the program lives in the first.

### GRC indicator or PA indicator?

Use this test. If the answer's consumer is a control owner who must fix something specific, build a GRC indicator. If the answer's consumer is a manager watching a number move, build a PA indicator. Many concepts want both, at different resolutions: a GRC indicator that fails per-server, and a PA indicator counting how many of those failed this week. That pairing — a per-entity test plus a program-level trend over its results — is the standard shape of a mature monitoring design, and building the second without the first is how programs end up with dashboards nobody can act on.

### Worked example: monitoring Northwind's access control

The quarterly attestation from Lesson 4 stays, because the obligation requires a formal periodic confirmation. Around it:

- **Automated GRC indicator, daily**: no privileged account dormant beyond 90 days on this entity, with the staleness guard. Two consecutive failures raise an issue to the entity owner.
- **Automated GRC indicator, daily**: no account added to the privileged group in the last 24 hours without a corresponding approved change or access request. This is the leading test — it catches the drift the quarterly review would find three months late.
- **Externally sourced GRC indicator, weekly**: the identity platform's own dormant-account report, ingested and compared to the platform's view. Disagreement between two sources is itself a finding.
- **PA indicator**: percentage of in-scope entities with a passing dormancy indicator, collected daily, broken down by support group, target 100 percent, paired with indicator coverage so that a rising pass rate caused by shrinking coverage is visible.
- **What the quarterly attestation now asks**: not "did you review access" but "here are the exceptions the indicators found this quarter and how they were resolved; confirm this is complete." The attestation has become a review of continuous evidence, which is exactly the destination.

## Practice

Use a developer instance. Where the data your indicator needs does not exist, create a small table with a handful of representative rows rather than abandoning the exercise.

1. **Write three assertions.** For one control from Lesson 4, write three candidate indicator assertions. Grade each against the five properties (one assertion, deterministic, defined population, explicit tolerance, meaningful failure). Discard any that fail, and say what it would take to rescue one of the discarded ones.

2. **Build an automated GRC indicator.** Implement your strongest assertion as a scripted indicator attached to a control, including the staleness guard so that missing source data returns unknown rather than pass. Prove the guard works by emptying or ageing the source data and showing the result is not a pass.

3. **Configure failure behavior.** Set the indicator to raise an issue only after two consecutive failures. Demonstrate it: one failure produces no issue, two produce one, and the issue's description contains enough detail to act on without re-running the query.

4. **Define two KPIs.** Write full definitions for two Performance Analytics indicators from the starter table or of your own design. Each definition must state: the exact population and condition, the collection frequency, at least one breakdown, a target with a rationale, and the paired counter-metric that detects gaming. Then state, for each, the specific decision a named role would make differently because of it.

5. **Build one of them.** Implement one KPI as a Performance Analytics indicator with its breakdown, collect at least two data points (adjust data between collections so the series moves), and confirm the breakdown resolves. Then write two sentences explaining why this indicator is *not* a control test and what would go wrong if you tried to use it as one.

6. **Retire something.** Look at your indicator set and identify one you would not build again. State whether it fails on actionability, determinism, or gaming, and what you would build instead.
