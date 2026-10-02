---
lesson_id: ops100-09
course_id: ops100
pathway: quality-assurance-software-engineer
title: Deploy and Verify a Public Site
order: 9
kind: project
competency_ids:
  - D2-S1-C04
  - D3-S1-C01
  - D4-S1-C03
  - D5-S1-C04
objectives:
  - Deploy a site publicly and verify it behaves as expected
---

## Goal

Every skill this course has built — local environment setup, Git and branching, review, and DevTools investigation — exists to support one outcome: shipping a real change to a real, publicly reachable site with confidence that it works. In this project, you will take a small static site through a full cycle: set up a production-like environment locally, make and review a change on a branch, deploy that change to a public host, and verify — using the DevTools skills from lessons 06 and 07 — that the deployed site actually behaves as intended. You will then simulate the QA work that continues after a deploy: tracking a discovered issue through to resolution and confirming its fix, working with input from a design or product perspective along the way.

This is the pathway's only `project`-kind lesson in this course, and it is deliberately cumulative: nothing here is new content, and everything here draws on lessons 02 through 08.

## Requirements

Your finished project must demonstrate all of the following:

1. **A local environment that mirrors production.** Set up a small static site locally (a simple HTML/CSS/JS site, or a static-site generator's build output — your instructor may provide a starter, or you may use one you already have from an earlier course). Confirm it runs correctly locally before touching deployment, using the environment-verification habits from lesson 02 (`node --version`, running the project's build/test scripts, checking any `.env` or config values against what production actually needs).

2. **A change made and reviewed through the Git workflow this course taught.** Make a small, real, visible change to the site (a copy edit, a new section, a fixed layout bug — something you can point to before and after). Do this on a feature branch, with atomic, well-messaged commits (lesson 03), and open a pull request with a description a reviewer could act on (lesson 05). If you're working with a partner or instructor, get an actual review comment on it before merging; if working solo, review it yourself after a break, applying the same standard from lesson 05.

3. **A public deployment.** Deploy the site to a public static-site host (options include, but are not limited to, GitHub Pages, Netlify, Vercel, or Cloudflare Pages — pick whichever your instructor recommends or you already have access to). The result must be a real, internet-reachable URL, not a local server.

4. **Pre- and post-deploy verification (D4-S1-C03).** Before merging your change, run whatever smoke or regression check the project supports — its lint and test scripts at minimum (lesson 02), and a manual pass through the site's core functionality to confirm your change didn't break anything else. After the deploy goes live, repeat that verification against the *public* URL, not just your local copy — a deploy can succeed and still serve something subtly different from what you tested locally (a missing environment variable, a stale cache, a build step that behaves differently in production mode).

5. **A DevTools audit of the live, deployed site (lessons 06–07).** Against the public URL — not localhost — open DevTools and confirm: no unexpected Console errors, no failed Network requests, and a Lighthouse run (Accessibility and Performance) with results you can report on. This step exists because a site can look fine and still be quietly broken underneath, and "quietly broken underneath" is exactly what this course has trained you to catch.

6. **One filed and tracked defect (D2-S1-C01, extended by D2-S1-C04).** Somewhere in this process — in your local testing, in review, or in your live-site audit — you will find at least one real or intentionally-introduced issue. File it as a proper defect report following lesson 08's template. Then track it: fix it (or have someone fix it) on a new branch, verify the fix resolves it using the same method that first found it, and close it out with a note confirming what you checked to verify closure. This closing-the-loop step is what makes it D2-S1-C04 rather than just D2-S1-C01 again — monitoring resolution and confirming an outcome, not just reporting a problem and walking away.

7. **A collaboration note (D5-S1-C04).** Write a short (4–6 sentence) reflection on where this project touched work outside a purely QA lane — for example, a design or content decision you had to interpret, a piece of feedback you'd want to route to a developer versus a designer, or a schedule/scope tradeoff you noticed. If you worked with a partner or instructor at any point (the review in requirement 2 is the minimum), name specifically what cross-functional input you incorporated and how it changed what you shipped.

## Constraints

- The site must be genuinely static (HTML/CSS/JS, or a static build output) — no server-side application logic, database, or backend API is required or expected for this project. Deployment-pipeline authoring, containers, and server administration are out of scope for this course, as stated in the course's sequencing rationale, and are not required here either.
- Use a real public host's free tier; do not pay for hosting to complete this project.
- The change you make and deploy should be small enough to review honestly in one sitting — this project is about proving the *process* end-to-end, not about building something large.
- Do not skip the pre-merge review step even if you're working solo. Reviewing your own PR after stepping away for at least a short break is an acceptable substitute for a partner, but skipping review entirely defeats the purpose of the exercise.

## Definition of done

- [ ] Local environment runs the site correctly, with toolchain versions verified against the project's stated requirements (if any).
- [ ] The change exists on its own branch, with atomic commits carrying clear messages.
- [ ] A pull request was opened with a description stating what changed and how to verify it, and received at least one real review comment before merging.
- [ ] The site is live at a real, public URL.
- [ ] Lint/test scripts (or equivalent smoke checks) were run and passed both before merge and against the live deployment.
- [ ] DevTools Console, Network, and a Lighthouse run were checked against the *public* URL, with results noted (even if everything passed cleanly — say so and show what you checked).
- [ ] At least one defect was filed using the lesson 08 template, tracked to a fix, and explicitly verified closed.
- [ ] A short cross-functional collaboration reflection is written, naming specific input incorporated or specific feedback you'd route to another role.

## Hints

- Start by getting the site deployed *before* you make your change — confirm you can deploy a known-good version first, so that if something breaks later you know it's your change and not your deployment setup.
- Deploy platforms often rebuild automatically on a push to a specific branch (frequently `main`). Read your chosen host's documentation for exactly which branch triggers a deploy before you merge, so your PR merge and your deploy aren't a surprise to each other.
- If your deployed site's DevTools audit turns up nothing at all — no errors, no failed requests, a clean Lighthouse score — that's a legitimate outcome, not a failed project. Report it as a clean pass with the evidence you checked, the same way you'd report a genuine finding. A QA engineer who only writes up bad news is missing half the job.
- If you can't find a real defect anywhere in the process, it's acceptable to introduce a small one deliberately (a broken link, an intentionally mistyped class name, a missing alt attribute) specifically so you can practice filing, tracking, and closing it — say so plainly in your write-up rather than presenting it as something you stumbled on.
- Keep every piece of evidence you gather (screenshots, copied console output, Lighthouse scores) somewhere you can reference it while writing your defect report and collaboration reflection — reconstructing "what did I actually see" after the fact is much harder than capturing it in the moment.
