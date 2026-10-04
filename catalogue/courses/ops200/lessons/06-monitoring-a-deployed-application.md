---
lesson_id: ops200-06
course_id: ops200
pathway: software-developer
title: Monitoring a Deployed Application
order: 6
kind: lesson
competency_ids:
  - D6-S1-C01
  - D4-S1-C05
objectives:
  - Monitor a deployed application and report what it reveals
---

## The deploy is not the end of the work

Your smoke test passed, the release notes are published, and the events board is live. Everything you know about its health comes from a single `curl` at 14:02 on the day you shipped.

Between then and now the application has served thousands of requests you never saw. Some of them were slow. A few returned 500s. One visitor using a keyboard could not reach the "add event" button. A dependency picked up a published vulnerability. None of that appears in your terminal, and none of it will reach you unless a user is annoyed enough to complain — which most are not. They just leave.

**Monitoring** is the practice of making a running system continuously observable, so that you learn about problems from your own instruments rather than from your users. This lesson covers the signals worth watching, how to watch accessibility and compliance the same way you watch errors, and — the part that turns monitoring into value — how to report what you find to someone senior in a form they can act on.

Be clear about the boundary of your role. As an apprentice you are not expected to own production, decide alert policy, or run an incident. You are expected to watch attentively, notice when a signal changes, and escalate with enough detail that a senior developer can act without repeating your work. That last skill is worth more than any dashboard.

## Uptime: is it answering at all

The most basic signal is whether the application responds. You already built the endpoint for it in lesson 05:

```bash
curl -s https://events-board.example.com/health
```

```json
{
  "status": "ok",
  "version": "v1.4.3",
  "commit": "b7a4e2d",
  "uptimeSeconds": 4021
}
```

A **health check** is that endpoint, requested on a schedule from somewhere outside your infrastructure. Hosting platforms hit one automatically to decide whether to keep routing traffic to a process; an external uptime monitor — Better Stack, Pingdom, UptimeRobot, or a scheduled pipeline job — hits it from elsewhere on the internet to catch the case where your whole platform is unreachable. A check that runs inside the thing it is checking cannot report that the thing is down.

Two kinds of health check are worth distinguishing. A **liveness** check asks "is this process running", and should be cheap and dependency-free — if it touches a database, a slow database will get your healthy application killed and restarted in a loop. A **readiness** check asks "can this instance serve real traffic", and may check dependencies, because an instance that cannot reach its database should stop receiving requests until it can.

Watch `uptimeSeconds` as well as `status`. A process that keeps reporting an uptime of under sixty seconds is crash-looping: it starts, fails, and gets restarted. Every individual check passes, and the application is badly broken. That is a good early lesson in reading signals — the value of a number over time tells you things the current value cannot.

Better still, monitor a path that exercises real work. A **synthetic check** requests the actual events list and asserts something about the response body, so it catches the case where the process is alive and the feature is broken:

```bash
curl --fail --silent --show-error https://events-board.example.com/api/events \
  | jq -e 'length > 0'
```

## Errors: what is failing, and how often

Uptime is binary and coarse. Most real problems are partial: one route failing, one browser affected, one in fifty requests erroring.

The signal to watch is the **error rate** — errors as a proportion of total requests — rather than the raw count. A hundred errors an hour is catastrophic on a quiet internal tool and unremarkable at a million requests an hour. Watch three sources:

**Server-side 5xx responses.** Every 5xx is your code failing. Lesson 03 of node101 drew the line between 4xx and 5xx, and it pays off here: because your 404s are 404s, a rise in 5xx is unambiguous and worth alerting on. A rise in 4xx is a different signal — often a client integrating incorrectly, a broken link, or someone probing you.

**Unhandled exceptions and rejections.** These can kill a Node process. Log them loudly on the way out rather than letting the process die silently:

```javascript
process.on("unhandledRejection", (reason) => {
  logger.error({ event: "unhandled_rejection", reason: String(reason) });
  process.exit(1);
});
```

Exiting is deliberate. A process that has thrown from somewhere unknown is in an undefined state, and the platform will restart it clean. Since Node 15, an unhandled rejection already crashes the process by default; the handler's job is to make sure a structured log line goes out first. Synchronous throws that nothing catches arrive on a different event, `uncaughtException`, and deserve the same log-then-exit handler. What you must not do is swallow the error and continue.

**Client-side errors.** A JavaScript exception in the browser never reaches your server unless you send it. An error tracking service — Sentry and its equivalents — catches unhandled browser errors, groups them by stack trace, and attaches the release version. This is why lesson 05 baked the commit SHA into the build: an error report that says "first seen in v1.4.3, commit b7a4e2d" has already told you where to look.

Group errors before you count them. One bug hit ten thousand times is one problem, and a list of ten thousand identical lines hides the three other bugs underneath it.

## Performance: how slow, and for whom

Performance signals are the ones people misread most often, because the natural instinct is to look at an average, and averages hide exactly what matters.

Use **percentiles**. The p50 (median) is the typical experience. The p95 is the experience of the slowest one in twenty requests, and the p99 the slowest one in a hundred. A p50 of 90 ms with a p95 of 4 seconds means most requests are fine and one visitor in twenty is having a bad time — an average would have shown a comfortable-looking 300 ms and told you nothing. Watch the p95 and p99; the tail is where users actually suffer.

On the server, measure request duration by route and method, because "the API is slow" is not actionable while "`GET /api/events` p95 went from 120 ms to 2.1 s at 09:40" is.

On the front end, the equivalent measurements are the Core Web Vitals, gathered from real browsers:

- **Largest Contentful Paint** — when the main content became visible. Good is under 2.5 seconds.
- **Interaction to Next Paint** — how quickly the page responds to a click or a keypress. Good is under 200 ms.
- **Cumulative Layout Shift** — how much the layout jumps while loading. Good is under 0.1.

There are two ways to collect these, and you want both. **Synthetic monitoring** runs a scripted browser against your site on a schedule from a fixed location — reproducible, good for catching regressions between releases, but it is one machine on a good connection. **Real user monitoring** reports measurements from actual visitors' browsers, so it reflects real devices and real networks, including the phone on a bad connection that synthetic testing will never simulate. Synthetic tells you the build got slower; real user monitoring tells you who is suffering.

Also watch resource saturation — memory, CPU, and event loop lag on the API. Memory that climbs steadily and never falls is a leak, and it will end in a crash-loop. This is a signal that only means anything as a trend, so look at the week, not the moment.

## Logs you can actually search

Logs are the record you go to once a metric has told you something is wrong. `console.log("here")` is not that record.

Log **structured JSON**, one object per line, with consistent field names:

```javascript
// api/src/logger.js
import process from "node:process";
import { config } from "./config.js";
import { buildInfo } from "./build-info.js";

const levels = { error: 50, warn: 40, info: 30, debug: 20 };
const threshold = levels[config.logLevel] ?? levels.info;

function emit(level, fields) {
  if (levels[level] < threshold) return;
  process.stdout.write(
    JSON.stringify({
      time: new Date().toISOString(),
      level,
      version: buildInfo.version,
      commit: buildInfo.commit.slice(0, 7),
      ...fields,
    }) + "\n",
  );
}

export const logger = {
  error: (fields) => emit("error", fields),
  warn: (fields) => emit("warn", fields),
  info: (fields) => emit("info", fields),
  debug: (fields) => emit("debug", fields),
};
```

```json
{"time":"2026-07-23T09:41:02.184Z","level":"error","version":"v1.4.3","commit":"b7a4e2d","event":"request_failed","requestId":"01J3K8","method":"GET","route":"/api/events/:id","status":500,"durationMs":31,"message":"Cannot read properties of undefined"}
```

Structure is what makes a log searchable. Every aggregation tool can filter on `status >= 500 AND route = "/api/events/:id"` across a JSON field; none of them can do anything useful with a sentence.

Four practices go with it. **Use levels** and set the threshold from configuration, so production can run at `info` and you can raise it to `debug` for an investigation without a code change. **Attach a request id** to every line produced while handling one request, so you can reconstruct a single user's journey out of interleaved output. **Include the version and commit on every line**, which is how you tell "started with the last release" from "has always done this". And **write to stdout**, not to a file — the platform collects stdout and ships it to your log aggregator, and a file on an ephemeral container disappears with the container.

The hard rule: **never log secrets or personal data.** No passwords, tokens, API keys, session cookies, full request bodies, or full email addresses. Logs get copied into search tools, shared in tickets, and retained for months, and everything you log is now in all of those places. Log an event id, not a person.

## Monitoring accessibility and compliance

Accessibility is usually taught as something you check once, near the end of a project. Treated that way it decays, because every release adds markup that nobody re-checked. It behaves far better as a **monitored signal**: measured continuously, tracked as a number over time, with regressions treated like any other defect.

Add an automated scan to the pipeline so a regression fails a pull request:

```yaml
  accessibility:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npm run build
      - run: npx start-server-and-test "npm start" 3000 "npx @lhci/cli autorun"
        env:
          DATABASE_URL: ${{ secrets.CI_DATABASE_URL }}
          SESSION_SECRET: ci-only-not-a-real-secret
```

The `env:` block matters. The config module from lesson 03 refuses to start without `DATABASE_URL` and `SESSION_SECRET`, and the pipeline has no `.env`, so without these values `npm start` crashes and the scan never runs. Point `CI_DATABASE_URL` at a disposable test database, never production.

Lighthouse CI reads its settings from `lighthouserc.json` at the repository root:

```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000/", "http://localhost:3000/events/1"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:performance": ["warn", { "minScore": 0.8 }]
      }
    }
  }
}
```

Lighthouse CI, axe-core, and pa11y all do this job; axe-core is the engine underneath most of them and can also be run inside your component tests. Schedule the same scan nightly against the deployed site, because production has content that staging does not — a real event title with an image and no alternative text will fail there and nowhere else.

The standard these tools measure against is **WCAG 2.2 level AA**, which is what public-sector procurement, most corporate policy, and accessibility law in many jurisdictions require. The violations automated scans catch reliably are the mechanical ones, and they are worth catching: images with no alternative text, form inputs with no associated label, insufficient colour contrast, missing page language, invalid heading order, controls with no accessible name, landmark and duplicate-id problems.

Now the limitation you must understand and must communicate honestly: **automated scanning finds only part of the accessibility problems on a page.** Estimates vary with how you count: roughly a third of WCAG success criteria can be fully tested by machine, and vendor studies of real audits put the share of issues found automatically somewhere between a third and a little over half. A green score is not a compliant site. No tool can tell you that an alternative text says the wrong thing, that a focus order jumps around incoherently, that an error message is announced too late, that a custom control behaves like a button but not for a keyboard, or that a video has no captions. Reporting "the accessibility scan passes" as though it meant "the site is accessible" is a real and common failure, and it is the kind of overstatement a senior developer will correct you on.

So pair the automated signal with manual checks on a schedule — every release for anything you changed, and a fuller pass periodically:

- **Keyboard only.** Unplug the mouse. Can you reach every control with Tab, activate everything with Enter or Space, escape every dialog, and see clearly where focus is at all times? Is anything reachable but invisible, or visible but unreachable?
- **Zoom to 200 percent** and narrow the window to 320 pixels. Does content reflow, or does it clip and require horizontal scrolling?
- **A screen reader on one flow.** VoiceOver on macOS, NVDA on Windows. Listen to the main journey. Does it make sense as speech?
- **Turn off images and colour.** Is any information conveyed by colour alone — a red field with no message, a green dot with no label?

Compliance monitoring runs on the same footing, and shares its tooling with the pipeline you already have:

- **Dependency vulnerabilities.** `npm audit --audit-level=high` as a scheduled job, plus automated update pull requests. A new vulnerability in a package you have not touched is exactly the kind of thing that only continuous monitoring catches.
- **Licence obligations.** A dependency arriving under a licence your organization does not accept is a legal issue, and license-checking tools can gate it in the pipeline.
- **Privacy and consent.** Cookies set before consent, third-party scripts added by someone else, a privacy policy link that has quietly 404ed.
- **Certificate and domain expiry.** Unglamorous, and a certificate expiring at midnight takes the whole site down.
- **Broken links and missing pages**, which a scheduled crawl finds cheaply.

Track all of it as a trend. One number for accessibility violations per page, recorded per release, tells you whether the product is improving or decaying — and a trend line is far more persuasive to a product owner than a one-off complaint.

## Alerts that are worth waking up for

A signal nobody looks at is not monitoring. Neither is a signal that fires so often everybody mutes it.

Alert on **symptoms users feel**, not on every metric you can graph: the site is unreachable, the error rate crossed a threshold, the p95 doubled, the health check has failed three times in a row. Do not alert on a single slow request or a momentary CPU spike.

Give every alert a **threshold and a duration** — "error rate above 2 percent for five minutes" — so a one-off blip does not page anyone. Route alerts by severity: something breaking for all users goes to whoever is on call, a slow degradation goes to a channel someone reads in the morning. And make every alert say what to do; an alert with no next step is just noise with a siren attached.

Then hold the line on alert fatigue. Every alert that fires and turns out not to matter teaches the team to ignore the next one, and that is how a real outage gets ignored for an hour. If an alert has fired five times with no action taken, it is wrong: fix the threshold or delete it. As an apprentice you will not set these policies, but you will be the person who notices that a particular alert is always noise, and saying so is a genuine contribution.

## Reporting what you found

Here is where monitoring turns into value for your team. You have noticed something. Now you have to tell a senior developer in a way that lets them act.

The two failure modes are equally common. Saying too little — "the site seems slow?" — forces the senior to redo all of your investigation. Saying too much, as a wall of unfiltered logs, forces them to do the filtering. What you want is the smallest message containing everything needed to act.

A good report has eight parts:

```text
Subject: [P2] /api/events p95 latency 4.2s since v1.4.3 deploy, ~5% of requests

Impact: Roughly 1 in 20 events-list requests takes over 4 seconds.
Users see a spinner; nothing errors. All users of the main page are
affected. No data loss.

Started: 2026-07-23 09:40 UTC, within 3 minutes of the v1.4.3 deploy
(14:02 the previous day was v1.4.2 and was flat at 120ms).

Build: v1.4.3, commit b7a4e2d, pipeline run #418.

Evidence:
- p95 for GET /api/events: 120ms -> 4.2s at 09:40. Graph: <dashboard link>
- Error rate unchanged at 0.1%. This is slowness, not failure.
- Log sample (3 of ~400 matching lines): <link to log query>
  {"level":"info","route":"/api/events","durationMs":4180,...}

Reproduced: yes. `curl -w '%{time_total}' $BASE/api/events` returns
between 0.1s and 4.3s, roughly 1 request in 20.

Ruled out:
- Not the platform: /health responds in 20ms consistently.
- Not the front end: the slow time is server-side, before first byte.
- Not traffic volume: request rate is flat versus last week.

Suspected cause: v1.4.3 added toISODate() inside the events map. It is
the only change touching that route. I have not confirmed it.

What I need: someone to confirm whether we roll back to v1.4.2 or
investigate forward. Rollback is rehearsed and takes about 4 minutes.
I can run it if you want it. Not blocking anything else on my end.
```

Take those parts one at a time, because each has a job.

**A subject line that stands alone**, with a severity, the symptom, the scope, and when it started. Someone scanning a channel decides from this line alone whether to stop what they are doing.

**Impact in user terms first.** How many people, how badly, and whether anything is being lost. "The p95 is 4.2 seconds" is data; "one in twenty visitors waits four seconds" is impact. Seniors triage on impact.

**When it started, and what changed near then.** Correlating an onset with a deploy is the single most useful thing you can do, and you can do it because lesson 05 made every release traceable.

**The exact build.** Version, commit, pipeline run. Never "the latest".

**Evidence, sampled.** Two or three representative log lines and a link to the full query — never a paste of four hundred lines. Include the graph.

**Whether you reproduced it**, and the exact command. A reproducible problem is a different class of problem from an intermittent report.

**What you ruled out.** This is the part that makes a junior's report genuinely useful, because it saves the senior from repeating your work. Say what you checked and what it showed, and be careful to state facts rather than guesses.

**What you need, and what you can do.** Ask a specific question. Offer the action you are ready to take. And say whether you are blocked, because that changes the urgency.

Two things to be honest about. Separate what you observed from what you suspect, always — "I suspect `toISODate()`, I have not confirmed it" is trustworthy, and a confident wrong diagnosis sends someone down a dead end. And do not fix it quietly first. Reporting an anomaly you cannot yet explain is exactly what you are supposed to do; an apprentice who investigates alone for three hours before mentioning a production problem has made a much bigger mistake than one who reports something that turns out to be nothing.

## Severity and escalation

Severity decides the channel and the urgency, and teams broadly agree on the shape even when the labels differ.

- **P1 — critical.** Site down, data being lost or corrupted, a security exposure. Escalate immediately through whatever your team uses to reach someone right now, at any hour. Do not wait to finish investigating; send what you have and keep investigating.
- **P2 — major.** A core feature is broken or badly degraded for many users, with no workaround. Escalate within the hour, in working hours, to your team channel and your lead directly.
- **P3 — minor.** A feature is degraded, affects some users, or has a workaround. Open a ticket with the same structure and mention it at the next stand-up.
- **P4 — cosmetic.** Small visual or copy problems. Ticket, no interruption.

Two adjustments to that ladder. Anything involving personal data or credentials goes up a level and follows your organization's security process rather than the normal path — do not post a leaked key into a public channel while reporting it. And **when you are unsure of the severity, escalate at the higher one and say you are unsure.** Being told "that is a P3, open a ticket" costs a senior thirty seconds. Sitting on a P1 for an hour costs the business real money, and nobody has ever been criticized for raising a genuine problem promptly.

While something is live, keep the record as you go: what you observed, at what time, what you tried, what changed. That log is what the release record and the follow-up write-up are built from, and it is impossible to reconstruct afterwards from memory.

## Practice

Instrument the deployed events board, make it tell you something, and report it properly.

1. Extend `/health` to report `status`, `version`, `commit`, and `uptimeSeconds`. Set up an external uptime monitor to request it every minute and alert after two consecutive failures.
2. Add a synthetic check that requests `/api/events` and asserts the response contains at least one event. Break the route deliberately in a staging deploy and confirm the check fails while a naive health check still passes. Record both results.
3. Implement the structured logger. Emit one `info` line per request with method, route, status, `durationMs`, and a request id, and one `error` line per failure. Confirm every line is valid JSON and includes the version and commit.
4. Generate at least two hundred requests against your deployed API with a mix of valid and invalid paths. From the logs alone, calculate the request count, the error rate, the p50 and the p95 for one route. Show your working.
5. Deliberately add a 3-second delay to one route, redeploy, and repeat the measurement. Record how the p50 and the p95 each moved, and write one sentence on why an average would have been misleading.
6. Add an `unhandledRejection` handler that logs and exits. Trigger it, and record what your platform did afterwards.
7. Add a Lighthouse CI or axe-core job to your pipeline with an accessibility assertion that fails the build. Then introduce a real violation — an image with no alternative text or a button with no accessible name — and confirm the pull request goes red.
8. Run the four manual accessibility checks on your deployed site: keyboard only, 200 percent zoom at 320 pixels wide, a screen reader on one flow, and colour-only information. Record every problem you find, and mark which ones the automated scan had missed.
9. Run `npm audit --audit-level=high` and add it as a scheduled job. Record what it reports today and what you would do about the worst finding.
10. Write down the alerts you would configure, with a threshold and a duration for each, and the severity you would route them to. For one of them, argue in two sentences why the threshold is not lower.
11. Using the eight-part structure, write a full issue report for the latency regression you created in step 5 — as though you did not already know the cause. Include impact, onset, build, sampled evidence, reproduction, what you ruled out, your suspicion clearly labelled as a suspicion, and what you need.
12. Write a second, three-line report for a P4 cosmetic issue you found in step 8, and explain in one sentence why it does not warrant the long form.
13. Have another learner read only your P2 report and tell you what they would do first. If they have to ask you a question before they can act, the missing answer belongs in the report — add it.

**Deliverable:** a deployed events board with a health endpoint, an external uptime monitor, structured JSON logging, and an accessibility check in the pipeline; a `MONITORING.md` holding your latency measurements, manual accessibility findings, audit results, and proposed alert thresholds; and two written issue reports at different severities.

## Check your understanding

1. Every health check passes, but `uptimeSeconds` never goes above 40. What's happening?
2. The average response time is 300 ms. Why isn't that enough to say the API is fast?
3. Your accessibility job scores 100. Can you report the site as WCAG 2.2 AA compliant? What would you add?
4. You suspect a release caused a slowdown but haven't confirmed it. How should your report phrase that?
5. You aren't sure whether an issue is P1 or P2. What do you do?

*Answers:* (1) The process is crash-looping: it starts, fails, and restarts. Each check catches it alive. (2) An average hides the tail. The p95 or p99 may be several seconds, which means real users are waiting. (3) No. Automated scans miss many issues. Add keyboard-only, zoom/reflow, screen-reader, and color-only checks, and report what was and wasn't tested. (4) Label it as a suspicion, for example "I suspect `toISODate()`; I haven't confirmed it", and keep it separate from observed facts. (5) Escalate at the higher severity and say you're unsure.
