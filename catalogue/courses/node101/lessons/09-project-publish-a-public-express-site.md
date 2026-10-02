---
lesson_id: node101-09
course_id: node101
pathway: software-developer
title: 'Project: Publish a Public Express Site'
order: 9
kind: project
competency_ids:
  - D2-S1-C04
  - D2-S1-C03
objectives:
  - Prepare an Express application to run on a publicly accessible host
---

## The goal

Take the events board you have been building since lesson 02 and put it on the public internet, at an address you can send to somebody who has never touched your laptop.

That is the whole deliverable, and it is deliberately narrow. You are not adding features. You are proving that an application which works on your machine can be prepared to run on a machine you do not control — where the port is assigned to you, the configuration comes from the environment, the filesystem is not yours to keep, and the only way you can see what happened is the logs the host shows you.

There are two judgments being assessed here, and they are different from each other. The first is whether the application actually works when it is somewhere else: the pages render, the API answers, the failures return the right status codes, and nothing leaks. The second is whether you can look at a set of hosting options, work out which one suits this deliverable, set it up, and explain the choice to somebody else. Getting a site live by following one tutorial's click path satisfies the first and not the second. Both are graded.

Budget six hours. If you are four hours in and nothing is deployed, stop, read the hints section, and ask for help — being stuck on a host's build settings is not a test of anything, and pretending otherwise wastes the rest of your day.

## What you start from

The events board as it stands at the end of lesson 08:

- An ESM Express application (`"type": "module"` in `package.json`) started with `node`.
- Events held in an in-memory array. There is no database in this course and you are not adding one.
- Rendered pages at `/` and `/events`, with a detail page at `/events/:id`, using EJS views and static CSS served by `express.static`.
- A JSON API under `/api/events`, including `/api/events/:id`.
- morgan access logging and `express.json` body parsing in the middleware stack.
- A request-id middleware, a 404 handler, and a four-argument error handler that returns HTML or JSON depending on the path and never sends a stack trace to the client.

If any of that is missing or half-finished, fix it before you deploy. Deploying a broken application does not make it easier to debug; it makes it harder, because now you have two environments to be wrong in.

## Requirements

These are numbered so a reviewer can grade against them one at a time. Each one states what must be true, not how to type it.

**R1 — Configuration comes from the environment.** The port the server listens on must be read from `process.env.PORT`, with a local fallback used only when the variable is absent. No port number is hard-coded into the listen call. Any other value that varies between your laptop and the host — the environment name, a base URL, a feature toggle — is read the same way. No credential, token, or key of any kind appears anywhere in the repository's history.

**R2 — The environment contract is documented and committed.** A `.env.example` file is committed listing every environment variable the application reads, with placeholder values and a one-line comment each. The real `.env` is gitignored. A reader must be able to tell from `.env.example` alone what they need to supply to run your app, without grepping the source for `process.env`.

**R3 — The application binds where the host expects.** The server listens on the port the host assigns and on the interface the host requires. If your host documents a specific bind address, follow it; otherwise do not restrict the bind to loopback. On successful start, the application logs one line stating the port and the environment name.

**R4 — There is a documented start script.** `npm start` in `package.json` starts the production server with no additional arguments, no watcher, and no development-only tooling. `package.json` declares an `engines.node` range that matches a Node version your host actually offers. Every package the running application imports at runtime is in `dependencies`, not `devDependencies`. A `package-lock.json` is committed.

**R5 — A health endpoint exists.** `GET /healthz` returns status 200 and a small JSON body containing at least a status field and the process uptime. It requires no authentication, renders no view, touches no template engine, and returns in well under a second. It is not linked from the site navigation. It must keep working when the rest of the app is under load.

**R6 — The rendered site is reachable at the public URL.** From the public address, `/` and `/events` render, and a valid `/events/:id` renders that event's detail page with status 200. The stylesheet and any other static assets load over the public URL with no 404s in the browser network tab, and the pages remain accessible and responsive as built in lesson 06. Verify this in a browser against the public URL, not against localhost.

**R7 — The JSON API is reachable at the public URL.** `GET /api/events` returns a JSON array with an `application/json` content type. `GET /api/events/:id` returns a single event for a valid id. Both must be verified with a command-line client against the public host, and the transcript kept as evidence:

```bash
curl -i https://<your-public-url>/api/events
curl -i https://<your-public-url>/api/events/<a-real-id>
curl -i https://<your-public-url>/healthz
```

**R8 — Error paths return the right status with no leak.** Against the public URL: an unknown page path returns 404 with your rendered error page; an unknown API path returns 404 with your JSON error body; and a route that fails on purpose returns 500 with a generic message. No response body anywhere on the public site contains a stack trace, a filesystem path, or a dependency version. Each error response carries a request id that also appears in the host's logs.

**R9 — Logs are visible in the host's own log view.** Your application writes to standard output and standard error, never to a file. In the host's log interface you must be able to see the startup line, the per-request access lines, and an error line with its stack. Demonstrate that you can find one specific request in that interface by its request id. Capture the evidence — a screenshot or a copied excerpt showing the id in the host's viewer.

**R10 — A written deployment record exists.** A `DEPLOY.md` file in the repository, specified in its own section below. This is where the tooling-selection judgment is graded, and a deployment with no record is not complete.

**R11 — The project runs from a clean clone.** Someone who has never seen your machine can clone the repository, run `npm ci`, copy `.env.example` to `.env`, run `npm start`, and reach a working server locally. The README explains exactly that in ten lines or fewer. If a step only works because of something installed globally on your laptop, either remove the dependency on it or document it explicitly.

**R12 — The public URL is verified from a device that is not yours.** Load the site from a phone on mobile data, or ask a peer on a different network to load it and report back. Record the time of the check and the result in `DEPLOY.md`. A URL that only resolves inside your own network or session is not published.

## Choosing your host and tooling

You pick the host. This brief names no provider, and there is no answer key. The point is that selecting infrastructure for a deliverable is part of the work, and the way you do it is by writing down what this deliverable needs and then checking candidates against it.

Evaluate at least three candidates against criteria like these:

- **Runs a persistent web process.** This is the criterion that eliminates the most options and the one people miss. Your app calls `app.listen` and stays running. A host that only serves static files cannot run it at all, and a host that only runs short-lived functions will run it awkwardly or not at all. Check that the free tier includes a long-running web service, not just static hosting.
- **Node version support.** Can you pin a version, and does the host respect `engines.node`? Which versions are on offer? A host that silently runs an older major than you developed against will fail on syntax you take for granted.
- **Environment variable configuration.** Can you set variables through a dashboard or CLI, without committing them? Can you change one and restart without a redeploy? If the only way to configure the app is a committed file, the host fails R1 by construction.
- **Log access.** Is there a live tail? Is history searchable, and for how long is it retained? Can you filter by a substring, which is what R9's request-id lookup depends on? A host whose logs are write-only is a host you cannot debug on.
- **Custom domain and TLS.** Even if you use the host's default subdomain, check whether attaching your own domain is possible and whether certificates are automatic. That is what tells you if the choice survives past this project.
- **Deploy mechanism.** Connect a git repository, push to a remote, or upload with a CLI? How long does a deploy take, and can you see why one failed?
- **Free-tier behaviour.** Many free tiers sleep an idle service and cold-start it on the next request. Know whether yours does, because it changes how your health check behaves and how the site feels to a first visitor. Note any bandwidth, build-minute, or instance-hour caps.
- **Region.** Where does the process run relative to the people who will load the page?
- **Exit cost.** If this host stops being suitable, how much of your work is host-specific and would have to be redone?

Score your candidates against the criteria that matter for *this* deliverable and pick one. There is no wrong choice that is well argued, and there is a wrong choice that is unargued. A host that fails a criterion you decided did not matter here is fine — say so, and say why.

## The deployment record

`DEPLOY.md` is a real deliverable, not a formality, and it is the artifact that demonstrates the tooling-selection competency. Write it for a teammate who has to redeploy this service next week while you are away. It must contain:

1. **The public URL**, and the date it was last verified.
2. **The candidates you considered** — at least three — and a short comparison against the criteria you chose. A table is fine. Say which criteria you weighted highest for this deliverable and why.
3. **The choice and the trade-off you accepted.** Every free tier costs you something: sleeping instances, a slow build, limited log retention, no custom domain. Name the one you accepted and why it is tolerable here.
4. **The runtime facts.** Node version running in production, how it is pinned, and the start command the host executes.
5. **Every environment variable the deployment sets**, by name and purpose. Values are never written here — placeholders only.
6. **How to view logs**, precisely enough that someone else can follow it without hunting through the dashboard.
7. **How to deploy a change**, from committed code to live, including how long it takes and how you know it succeeded.
8. **How to get back to the previous working version** if a deploy breaks the site — or an explicit note that you have no rollback mechanism and what you would do instead. Being honest here is worth more than inventing a procedure you have not tested.
9. **Known limits of this deployment.** Data lives in memory and is lost on every restart and redeploy; say so plainly, along with anything else a reader would otherwise discover the hard way.

Keep it under two pages. A record nobody reads is as useless as no record.

## Constraints

- **No database and no file persistence.** The in-memory array stays. Data resetting on restart is expected behaviour for this project, not a bug — document it in `DEPLOY.md` and move on. Persistence belongs to a later course.
- **No authentication, accounts, sessions, or login.** Everything on the site is public.
- **No CI/CD pipeline, no containers, no orchestration.** Deploy using the host's own mechanism — connected repository, push, or CLI. Writing a pipeline configuration file is out of scope and will not earn credit.
- **One Express application, one process.** No worker processes, no queues, no second service.
- **No new features.** If you find yourself adding a route that was not in lessons 02 through 08, stop. Fixing something that was already broken is in scope; building something new is not.
- **Free tier only.** Nothing in this project requires a paid plan. If you hit a paywall, that is a signal about the host, not about the requirements.
- **No secrets in git, ever.** If you commit one by accident, treat it as compromised: rotate it, then clean the history. Say what happened in `DEPLOY.md`.
- **Your own repository, with real commits.** The deployment history should show the work, not one commit called "final".

## Out of scope

Named explicitly so you do not spend hours on them: databases and any form of persistent storage; user accounts, login, sessions, and access control; automated test pipelines, build pipelines, and deployment automation; Docker images, registries, and container orchestration; load balancing, autoscaling, CDNs, and performance tuning; monitoring or alerting products beyond the host's own log view. Later courses own each of these. Doing them here will not raise your grade, and it will crowd out the requirements that will.

## Definition of done

Every statement below must be true and independently checkable by someone with only your repository URL and your public URL.

- The public URL loads the events board in a browser on a network that is not yours.
- `/`, `/events`, and a valid `/events/:id` all return 200 and render correctly, with static assets loading and no 404s in the network tab.
- `/api/events` and `/api/events/:id` return correct JSON with an `application/json` content type over the public URL.
- `/healthz` returns 200 with a JSON body, with no view rendering involved.
- An unknown page returns a rendered 404; an unknown API path returns a JSON 404; a deliberately failing route returns 500 with a generic message.
- No response body on the public site contains a stack trace, a filesystem path, or a package version.
- A request id appears in error responses and can be found in the host's log view.
- The host's log view shows the startup line, request lines, and an error line with a stack.
- `process.env.PORT` drives the listen call; no hard-coded port and no secret exists in the repository.
- `.env.example` lists every variable the app reads; `.env` is gitignored.
- `npm start` is the documented start command; `engines.node` matches the deployed runtime; runtime packages are in `dependencies`; `package-lock.json` is committed.
- A clean clone plus `npm ci` plus `npm start` gives a working local server, per a README of ten lines or fewer.
- `DEPLOY.md` contains all nine items listed above, including the candidate comparison and the accepted trade-off.
- The external verification in R12 is recorded with a time and a result.

## How you will be assessed

Two competencies are being observed, and they are marked separately.

The first is building working features to a specification using appropriate methods. That is graded against the requirements above, as evidence: a reviewer will open your public URL, run the commands in R7 and R8, look for the request id in your logs, and check the repository against R1 through R4 and R11. Each requirement is a pass or a fail on what is actually true at the URL you submit — not on what works locally, and not on what you meant to do. Partial credit comes from requirements passed, so a site that is live and slightly incomplete scores far better than a perfect local app that was never deployed.

The second is identifying and setting up appropriate tooling for a deliverable, under supervision. That is graded almost entirely from `DEPLOY.md`. A reviewer is looking for whether your criteria are connected to *this* deliverable rather than copied from a generic list, whether you actually compared alternatives instead of justifying a decision you had already made, whether you can name the trade-off you accepted, and whether another person could operate the deployment from your record alone. Choosing a host a reviewer would not have chosen costs you nothing if the reasoning is sound. Choosing the host a tutorial told you to choose, with no reasoning, costs you the whole competency even if the site is perfect.

Expect to be asked, in review, one question you cannot answer by reading your own document out loud. Something like: what happens to the site if the host restarts your process during a demo, or how would you tell whether a report of a slow page is your app or the free tier cold-starting. Being able to reason about your own deployment is the point of writing the record.

## Hints

**Read the host's Node quickstart before you change a line of code.** Ten minutes there tells you what it expects for the port, the start command, and the Node version, and saves you from guessing at three of them.

**The port is the number one cause of a failed first deploy.** If the host reports that it detected no open port, or the deploy succeeds but the URL times out, you are almost certainly still listening on a hard-coded number, or you bound explicitly to loopback so nothing outside the container can reach you.

**Deploy something trivial first.** Push a commit whose server does nothing but answer `/healthz`, get that green, and only then deploy the real application. This separates "my host configuration is wrong" from "my app is wrong", and those two are miserable to debug at the same time.

**`npm ci` needs a committed lockfile.** Many hosts use `npm ci` by default and will fail the build outright without one.

**Check which packages are in `devDependencies`.** A production install skips them. `nodemon` belongs there; the template engine, the logger, and Express do not. A crash on startup that says a module cannot be found is usually this.

**Use root-relative asset paths.** A stylesheet referenced as `css/site.css` resolves differently on `/events` than on `/events/42`; `/css/site.css` resolves the same everywhere. This is the classic "works on the home page, broken on the detail page" bug.

**Linux filesystems are case-sensitive and your laptop's probably is not.** A view directory called `Views` that you reference as `views` works locally and fails in production with a template-not-found error. The same applies to every import path.

**Log to the standard streams.** If you added file logging at any point, remove it. The host's disk is ephemeral and its log viewer only sees stdout and stderr — R9 depends on this.

**Keep `/healthz` stupid.** No view rendering, no data lookups, no dependency on anything that can be slow. A health check that fails when the app is busy tells the host to restart you at exactly the wrong moment.

**Test against the public URL, not localhost.** Open the browser console and network tab on the deployed site. Mixed content, missing assets, and a wrong content type all show up there and nowhere else.

**When production behaves differently from local, diff the environment, not the code.** Node version, environment variables that exist locally but were never set on the host, `NODE_ENV`, and path casing account for nearly all of it. Your startup log line exists to answer the first two instantly.

**Write `DEPLOY.md` while you deploy, not afterwards.** The details you will need — the exact setting you had to change, the error message that sent you down a wrong path — are gone an hour later, and reconstructing them is how records turn vague.

## What to hand in

Submit these five things together:

1. The repository URL, with `DEPLOY.md`, `README.md`, `.env.example`, and `package-lock.json` committed.
2. The public URL of the running site.
3. The terminal transcript from the R7 and R8 checks, run against the public URL.
4. The log-view evidence from R9, showing one request located by its request id.
5. The external verification note from R12, with the time and the result.
