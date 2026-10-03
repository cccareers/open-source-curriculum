---
course_id: sn301
media_id: sn301-v01
type: video-script
title: "Your First ATF Test: Make It, Break It, Clean It Up"
format: screencast
target_runtime: "8 min"
related_lessons:
  - sn301-03
objectives:
  - Build an ATF test with steps, assertions, and test data that cleans up after itself
competency_ids:
  - D10-S1-C04
---

## Purpose

After watching, the learner can build a server-step ATF test that impersonates a fulfiller, creates its own incident, asserts routing and priority, is made to fail on purpose, and leaves no data behind.

## Audience and prerequisites

Apprentices who have completed sn102 and can navigate a PDI. Test execution is already enabled on the demo instance and the presenter holds the ATF test designer role. A user `atf.fulfiller` with the `itil` role exists. An assignment rule or business rule routes Network-category incidents to the Network group (create one before recording if your PDI does not have it).

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Cold open: Incident list filtered to `short_description STARTSWITH ATF:`, showing zero rows. | "By the end of this video, this list will still be empty. That is the point. We are going to create test incidents, prove something about them, and leave nothing behind." |
| 0:15 | Title card: "Your First ATF Test". | "This is lesson three of ATF Essentials: building your first test." |
| 0:20 | PDI home. Presenter types `Automated Test Framework` in the filter navigator; the application menu expands. | "If you cannot see the Automated Test Framework menu, you are missing the test designer role, not a plugin. Ask your admin." |
| 0:35 | Click **Tests**, then **New**. Name: `ATF: Critical incident routing`. Description: `Proves a P1 Network incident routes to the Network group.` Save. | "A test is one record with an ordered list of steps. Name it for the behavior it proves, so a failure in a list of fifty tells you what broke." |
| 1:00 | Click **Add Test Step**. The step picker opens with categories. Hover over Server, Form, Service Catalog. | "Every step is a shipped step configuration. Server steps run on the instance with no browser. Form and catalog steps drive a real browser through the client test runner. Today we stay on the server, because it is faster and less brittle." |
| 1:25 | Choose **Impersonate**. Set user to `atf.fulfiller`. Submit. | "Step one is almost always Impersonate. If I run this as admin, I pass every ACL and prove nothing about what a fulfiller can do." |
| 1:45 | Add **Create a Record**. Table: Incident. Set fields: Short description `ATF: network outage`, Category `Network`, Impact `1 - High`, Urgency `1 - High`. Submit. | "Step two makes the data. Notice the prefix: ATF colon. If anything ever escapes rollback, a human can spot it in the table instantly." |
| 2:15 | Add **Record Query**. Table: Incident. Condition row 1: Sys ID, is, then click the data pill picker and choose *Step 2: Create a Record > Record*. Condition row 2: Assignment group is Network. Assert: records match the query. | "Step three asserts. I am not typing a sys ID. I am picking the output of step two from this picker. That is what makes the test portable: it will work on the test instance, after a clone, anywhere." |
| 2:55 | Add **Field Values Validation**. Table Incident, record = Step 2 output. Condition: Priority is `1 - Critical`. Submit. Steps list now shows 1 to 4. | "Step four checks priority. One requirement per assertion step. When it fails, the message will tell me exactly which claim broke." |
| 3:20 | Click **Run Test**. Run dialog shows progress; click **Go to Result**. | "Run it." |
| 3:35 | Test result record. Scroll to step results; each shows Success with a short message. Zoom on Record Query step output message. | "Green. Each step result shows its inputs, outputs, and the assertion outcome. Get used to reading this page. It is where you will spend your time when things go red." |
| 4:00 | Back to the test. Open step 3, change Assignment group to `Database`. Save, run again. | "Now the most important habit in this course: make it fail on purpose. I have changed the expected group to the wrong one." |
| 4:20 | Result record shows Failure at step 3. Zoom on the failure message naming the query that did not match. | "Failure, at step three, and step four never ran, because a failing step stops the test. Read the message. Could you find the problem from this message alone? If not, your test needs a better name or a narrower assertion." |
| 4:50 | Change step 3 back to `Network`. Run again; green. | "Change it back. Green again." |
| 5:05 | Open the Incident list with filter `Short description starts with ATF:`. Zero rows. | "And here is the cold open. Two runs, two incidents created, zero left. ATF tracked what the test created and rolled it back, pass or fail." |
| 5:25 | Split screen: left, a bullet list on a slide: "Rollback covers what the test created / Email and REST calls already left / Async work can outlive the test". | "Rollback has edges. An email that was actually sent cannot be unsent. A REST call to another system already happened. And work that runs asynchronously, like a scheduled job or some flows, can run after the test has finished. Test on a sub-production instance where notifications and integrations are safe." |
| 6:00 | Slide: "Never add a delete step to clean up someone else's leftovers." | "If you ever find leftover ATF records, do not add a delete step to sweep them up. Find the test that created them and fix that." |
| 6:20 | Back on the test record, show the Active checkbox and the description. | "Last thing: this test is configuration. It lives on the instance, it travels in update sets, and you own it. Lesson five covers how it moves." |
| 6:40 | Recap slide: Impersonate, Create, Assert, Fail on purpose, Check for leftovers. | "Impersonate. Create your own data. Assert the requirement, one claim at a time. Make it fail on purpose. Check for leftovers. That is a test you can trust." |
| 7:10 | End card with practice prompt from lesson 3. | "Now build the same test on your own PDI, using a category your instance actually routes on. Then try the check questions below." |

## On-screen assets and B-roll

- PDI with a Network assignment rule pre-configured and `atf.fulfiller` user created.
- Three slides: rollback edges, never-delete rule, recap.
- Zoom/callout overlays on the data pill picker and on the failure message.

## Accessibility

- Burned-in captions plus a separate caption file; narration names every field and value typed, so nothing is conveyed by the screen alone.
- Pass/fail is announced verbally and shown by the words "Success" and "Failure" in the result, not by color alone.
- Use browser zoom at 125 percent and a high-contrast cursor highlight; all actions are announced before the click.
- Provide a text transcript including the step outline from lesson 3.

## Check for understanding

1. Why does the test pick the Record Query condition value from step 2's output instead of typing a sys ID? *Answer: so the test does not depend on a record that only exists on one instance; the output is the record the test itself created, on whatever instance it runs.*
2. When step 3 failed, why did step 4 show no result? *Answer: a failing step stops the test; remaining steps are not attempted.*
3. Name one side effect that rollback cannot undo. *Answer: an outbound email that was sent, or a REST call to an external system (also: async work that ran after the test finished).*
