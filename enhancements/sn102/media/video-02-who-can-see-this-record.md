---
course_id: sn102
media_id: sn102-v02
type: video-script
title: "Who Can See This Record? Groups, Roles, ACLs, and Impersonation"
format: screencast
target_runtime: "8 min"
related_lessons:
  - sn102-05
  - sn102-09
objectives:
  - Explain how users, groups, roles, and access controls determine who can see and change a record
competency_ids:
  - D1-S1-C03
---

## Purpose
After watching, the learner can trace why a given user can or cannot see a record: from user to group to role to ACL, and prove it with impersonation and the security debugger instead of asking the user.

## Audience and prerequisites
Week 2 apprentices who have read sn102 lesson 5 and have a PDI with demo data. No scripting.

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Chat message: "Beth says she can't see INC0010005 anymore. Can you fix it?" | "Here's a ticket you'll get a lot. The wrong move is to start granting roles until Beth is happy. The right move takes five minutes and leaves the access model better than you found it." |
| 0:15 | Diagram: User → Group → Role → ACL → Record, four arrows. | "Access on this platform is a chain. A user belongs to groups. Groups carry roles. Access control rules — ACLs — test for roles and conditions. And the ACL decides about the record. We'll walk the chain from left to right." |
| 0:35 | Navigator: `sys_user.list`, open Beth's record (demo user). Roles related list: columns Role, Inherited. | "Open Beth's user record. The Roles list shows every role she holds, and the Inherited column says whether it came from a group. Inherited true means: don't touch it here, fix the group." |
| 1:00 | Groups related list on Beth: one group. Open it; its Roles list: `itil`. | "Her groups. This one grants itil — the classic fulfiller role. If Beth moved teams last week and lost this group, she lost itil, and that's the whole story." |
| 1:25 | Show `sys_user_role.list` → `itil` → Contains Roles related list. | "Roles can contain other roles. Open itil and you'll see what it brings along. Granting a containing role grants everything inside it." |
| 1:45 | Callout: "Never grant to the person. Grant to the group." | "And if a grant is needed, it goes on the group, not on Beth. One membership change, not an audit of eleven individual grants next year." |
| 2:00 | `sys_security_acl.list`, filter Name starts with `incident`, Operation = read. Show 2–3 rows: `incident` (None) with role itil; one with a condition (caller is me) — exact demo rows vary. | "Now the rules. Access control list, filtered to incident, operation read. Each row has a name — incident, or incident dot a field — an operation, required roles, and maybe a condition or script. Read them as sentences: 'itil can read any incident.' 'Anyone can read an incident where they're the caller.'" |
| 2:35 | Graphic: the five evaluation points from lesson 5 (deny by default, most specific first, all parts of a rule, field AND record, any one rule at a level). | "Five rules explain every surprise. Nothing matched? Denied. Most specific name wins its level. Inside one rule, role and condition and script must all pass. The field and the record must both allow it. And when several rules match at the same level, passing any one is enough." |
| 3:10 | Elevation: user menu > Elevate role > `security_admin` (show dialog only; no edit). | "One practical note: to *change* an ACL you need to elevate to security admin for your session. Today we're only reading, so we won't." |
| 3:25 | Turn on debugging *before* impersonating: System Security > Debugging > Debug Security Rules (module label may vary). | "Before we impersonate, switch on Debug Security Rules — as yourself. The user we're about to become can't reach this module." |
| 3:45 | Avatar > Impersonate User > Beth. Banner shows impersonation. Open `incident.list`: message at bottom "Number of rows removed from this list by Security constraints: …". | "Impersonate Beth. Now everything is evaluated as Beth. Open the incident list. See the message at the bottom: rows removed by security constraints. Beth isn't imagining it." |
| 4:15 | Navigate to INC0010005 directly; access denied page; debug output lists `incident` read ACLs with role check failed. | "Open the incident directly. Denied. And the debug output tells us which rule was evaluated and which part failed: the role check. Beth no longer has itil." |
| 4:45 | End impersonation. Open the group Beth should be in; Group Members > Edit > add Beth (on a PDI only). | "End impersonation. The fix belongs on the group: add Beth back to the team she actually works in — if her manager confirms she should be there. That confirmation is part of the fix." |
| 5:15 | Impersonate Beth again; incident opens; debug shows rule passed. | "Impersonate again. Now the record opens, and the debugger shows the same rule passing. That's proof, not an assertion." |
| 5:40 | Side panel: "UI policy hid the field" vs "ACL denied the field". Show a field hidden on a form but visible in list/export. | "One more trap. If a field disappears from a form, it might be a UI policy — that's presentation, and the value is still readable in a list or export. If an ACL denies it, it's gone everywhere. Never protect data with a UI policy." |
| 6:15 | Switch off Debug Security Rules. | "Switch debugging off when you're done — the annotations make normal work unreadable." |
| 6:30 | Recap chain graphic with check marks. | "User, group, role, rule, record. Read the chain, impersonate, debug, fix it on the group, prove it again." |
| 6:50 | End card: "Try it with your Workshop Support users from the lesson 9 project." | "Your turn: do this with the two users you built in the lesson 9 project, and write down which ACL decided each result." |

## On-screen assets and B-roll
- PDI with demo data; pick a real demo user and incident before recording and adjust the names in narration.
- Do not modify shipped ACLs on camera; only read them.
- Graphics: access chain; five evaluation points; UI policy vs ACL comparison.
- Producer note: Debug Security Rules module location and whether output persists during impersonation should be checked on the recording release (see sn102 review open questions).

## Accessibility
- Captions; impersonation state is announced verbally and shown as on-screen text, not only by the banner colour.
- Debug output zoomed and read aloud; transcript includes the five evaluation rules as a list.

## Check for understanding
1. Beth's itil role shows Inherited = true. Where do you fix her access? — *On the group membership (or the group's roles), not on her user record.*
2. Why switch on Debug Security Rules before impersonating? — *The impersonated user usually cannot reach the module.*
3. A field is missing on the form but appears in an export. What hid it? — *A UI policy or form layout, not an ACL.*
