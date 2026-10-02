---
lesson_id: sn201-08
course_id: sn201
pathway: servicenow-implementation-specialist
title: Update Sets, Source Control, and Deployment
order: 8
kind: lesson
competency_ids:
  - D10-S1-C02
objectives:
  - Move an application between instances using update sets and source control
---

## Your application is on one instance

Everything you have built lives on a single development instance. Nobody in the facilities team can use it, because nobody in the facilities team logs into a developer's instance.

A real ServiceNow customer runs several instances — typically a development instance where builders work, a test instance where changes are validated against realistic data, and a production instance where the business actually operates. Some organisations add more: a separate integration or training instance, or a second development instance per project team. The instances are functionally identical; what differs is the data in them and who is allowed to touch them.

The path a change takes from one to the next is the **promotion path**, and moving your application along it is the last skill this course teaches.

Two mechanisms carry the work: **update sets**, the platform's long-standing change-capture mechanism, and **source control integration**, which puts a scoped application into a Git repository. They are not alternatives so much as tools for different shapes of change, and a mature team uses both.

One boundary to state up front. This lesson teaches you to move an application deliberately and safely between instances. Building an automated delivery pipeline — commit triggers a build, a build runs tests, tests gate a promotion, promotion is recorded against a change request — is release engineering, and it belongs to the deployment and governance courses later in this pathway. What you learn here is the mechanism those pipelines automate, and understanding it by hand first is why the automated version will make sense later.

## What an update set actually is

Recall lesson 2: on this platform, configuration *is* data. A table definition, a business rule, a UI policy, an ACL, a flow — each is a record.

An **update set** is a container that captures those records as you change them. When you have an update set marked as your current one, every configuration change you make is written into it as an update record — an XML payload of the changed configuration record. Moving the update set to another instance and committing it replays those payloads there.

Two properties follow directly and explain most update set behaviour.

**It captures changes, not state.** An update set holds "here is business rule X as of now," not "here is the difference from before." Committing it makes the target's copy of X match the source's copy. If you change a rule five times in one update set, only the final version travels.

**It captures configuration, not data.** This is the single most common surprise. Your `work_order` table definition travels. Your `part` *records* do not. Choice list options do travel, because choices are configuration. User accounts, groups, group memberships, and the three test work orders you created do not.

The practical consequence: an application that depends on reference data — your `part` catalogue, a set of default assignment groups — needs a plan for that data alongside the update set. The usual answers are an export/import of the records as XML, or a small script that creates them if they are missing.

There is a mechanism that changes this for a specific case. Some tables are marked so that their records *are* captured — that is how out-of-box applications ship their seed data — and you can apply the same marking to a table of your own. Use it for genuine configuration data such as your `part` catalogue, and never for transactional data such as work orders.

## The update set workflow

The discipline is short and unforgiving. Follow it every time.

**1. Create a named update set before you build anything.** Name it so a stranger can identify it a year later: `Facilities Work Orders v1.0 — data model and forms`, not `mikes changes` or `test2`. Add a description saying what it contains and what it depends on.

**2. Set it as your current update set.** The header indicator shows which one is current. If it says **Default**, stop — the Default set never leaves the instance, and work captured there is genuinely difficult to recover.

**3. Build.** Everything you configure now lands in the set.

**4. Verify the contents before you close it.** Open the update set and read its list of customer updates. You are looking for two things: everything you expected, and *nothing you did not*. An update set that contains a change to a global business rule you touched while debugging is an update set that will break the target instance.

**5. Mark it Complete.** This closes it to further changes. Anything you build after this point needs a new set.

**6. Move it.** Two routes:

- **Retrieve from the target.** The target instance is configured with an update source pointing at the source instance, and pulls completed sets directly. This is the normal path between instances in the same customer's estate.
- **Export to XML.** Download the set as a file and import it on the target. This is the route between instances that cannot see each other.

**7. Preview on the target.** Never skip this. The preview parses every update, compares it to what is already there, and reports problems *before* anything is written.

**8. Resolve what the preview reports**, then **Commit**.

## Previews, collisions, and skips

The preview raises two kinds of problem.

**Errors** block the commit. The most common is a missing dependency: your update set references a table, field, or role that the target does not have, because it was created in a *different* update set that has not been committed yet. The fix is to commit the sets in the right order — which is why sequencing matters and why numbering your sets helps.

**Collisions** are warnings that the target's copy of a record has been changed locally since the last time it matched. The preview shows you both versions and offers a choice: accept the incoming change and overwrite the target, or skip it and keep what the target has.

Skipping is occasionally correct and usually a trap. A skipped update means the target is now running a configuration that exists nowhere in your source, and the next deployment will collide again. Before skipping anything, find out *why* the target differs. The honest answer is nearly always "somebody made a change directly in production," and the real fix is upstream of your update set.

Two more habits worth building now:

- **Commit into a quiet window** where you can verify afterwards. A commit is not transactional across the whole set; a failure partway leaves a partial state.
- **Know your back-out plan before you commit.** A committed update set can be backed out, which reverses the updates it applied — but back-out cannot undo data changes that business rules made while the new configuration was live. Write down, before you commit, what you would do if it goes wrong.

**Batching** helps when a release is several sets. A batch groups update sets into a parent with an explicit order, and the preview and commit handle the whole batch as a unit, in sequence. If your release is more than two sets, batch it.

## Source control for a scoped application

Update sets are instance-to-instance. Source control is different: it links a **scoped application** to a Git repository, so your application's files live in version control the way any other software would.

The setup, once per application:

1. Create an empty repository in your Git provider and get credentials the instance can use.
2. In the developer studio, link the application to the repository URL with those credentials.
3. Commit. The platform serialises every application file — tables, fields, business rules, client scripts, flows, ACLs, roles — into files in the repository and pushes them.

Once linked, the operations available are the ones you would expect:

- **Commit** — push local changes with a message.
- **Create branch** / **Switch branch** — work on a feature branch, then merge.
- **Apply remote changes** — pull the repository's version of the application onto this instance, overwriting local application files.
- **Stash** — set aside uncommitted local changes.
- **Create tag** — mark a release point.

What this buys you that update sets do not:

- **History.** Who changed this ACL, when, and why, with a message — from the beginning of the application.
- **Branching.** Two builders working on separate features without their changes tangling in one update set.
- **Review.** A pull request in your Git provider, with a diff, before anything reaches a shared instance.
- **A rebuild path.** A new development instance can pull the application from the repository and be current in minutes.

Two cautions. **Applying remote changes overwrites local work** in that application — commit or stash first. And **source control captures application files, not instance configuration outside the application scope**: anything you changed in the global scope, and again any data records, still needs an update set or a data plan.

## Which mechanism for which change

| The change | Move it with |
| --- | --- |
| Everything inside your scoped application | **Source control**, with a tag per release |
| A change to a global table, a global business rule, or system properties | **Update set** |
| Configuration data your application needs to run (a `part` catalogue) | **Update set** with the table marked to capture records, or an XML export |
| Users, groups, and group memberships | Neither — provisioned on each instance, usually from the directory |
| Transactional data (work orders) | Neither — it belongs to its instance |
| An application going to other instances in your organisation from a central place | **Publish to the internal application repository**, then install from there |

That last row is worth a sentence. Publishing a scoped application to your organisation's internal application repository packages it at a version and makes it installable on any instance in the estate, which is much closer to how you would distribute finished software than shipping update sets around. It uses the version number on the application record from lesson 2 — which is the moment that field stops being decorative.

## Release discipline, by hand

Even without a pipeline, these practices separate a controlled deployment from a hopeful one.

**Version deliberately.** Advance the application version on every release, and use a scheme where the number tells you something: a patch for a fix, a minor for new capability, a major for something that breaks how the application is used.

**Write release notes.** Two or three lines: what changed, what it affects, what to check afterwards. Attach them to the release, not to your memory.

**Never build directly on test or production.** The moment somebody fixes something directly in production, every subsequent deployment collides, and you will spend more time reconciling than you saved. If production needs an emergency fix, make it in development and promote it immediately afterwards — even if that means doing both within the hour.

**Deploy through every instance in order.** Development to test to production, with the same artifact each time. A change that reaches production without passing through test has not been tested, whatever anyone says.

**Verify on the target, not on the source.** After a commit, log into the target instance and exercise the application. Open the form, save a record, trigger the flow, impersonate a technician. The preview told you the update *applied*; only you can tell whether it *works*.

## Practice

You need two instances for the full exercise. If you only have one, do steps 1–5 and 8–10, and treat the export file as your deliverable.

1. **Start a clean set.** Create a new update set named `Facilities Work Orders v1.0 — release 1`, with a description listing the tables, rules, flows, and ACLs it should contain. Set it as current and confirm the header shows it.

2. **Make a captured change.** Add a new field to `work_order` — `follow_up_required` (True/False) — and put it on the form. Then open the update set and find both changes in its customer updates list.

3. **Audit the set.** Read every entry in the update set. For each one, say in a word what it is. If anything is there that you did not intend, work out how it got captured — this is the skill the exercise exists to build.

4. **Complete and export.** Mark the set Complete and export it to XML. Open the file in a text editor and find the payload for your new field. You do not need to understand every element; you need to see that it is exactly the record you created.

5. **Prove the data boundary.** Confirm that none of your `part` records are in the update set. Then export those records separately as XML so you have both halves of the deployment.

6. **Import and preview.** On a second instance, import the XML and run the preview. Read every line of the preview output before committing anything.

7. **Commit and verify on the target.** Commit the set, then verify on the target instance itself: open a work order form, confirm the new field renders, run the contractor approval flow end to end, and impersonate a technician to confirm the ACLs came across.

8. **Manufacture a collision.** On the target, change the field's label directly. Back on the source, change the same label differently, capture it in a second update set, and move it. Read what the preview says, choose deliberately, and write down what state the target is in afterwards and why.

9. **Link source control.** Connect the application to an empty Git repository and commit it with a message. Browse the repository and find the file representing one business rule you wrote in lesson 5.

10. **Branch and merge.** Create a branch, make a small change on it, commit, switch back to the main branch, and confirm the change is gone locally. Merge the branch and confirm it returns.

11. **Write the release note.** Produce a short release note for version 1.0 of the application: what it does, what it contains, its dependencies, what data must be loaded separately, and the back-out plan. One page. You will hand a version of this in with the lesson 9 project.
