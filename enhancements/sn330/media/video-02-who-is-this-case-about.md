---
course_id: sn330
media_id: sn330-v02
type: video-script
title: "Who Is This Case About? Subject Person, Opened By, and the Viewer"
format: hybrid
target_runtime: "6 min"
related_lessons:
  - sn330-02
  - sn330-03
  - sn330-04
objectives:
  - Describe HRSD's scoped application structure and how HR services, COEs, and scoped data separation work
  - Configure HR cases, templates, and assignment so requests reach the right HR team
competency_ids:
  - D4-S1-C01
---

## Purpose

After watching, the learner can say, for any HR condition, criterion, or rule, whether it should evaluate against the subject person, the person who opened the case, or the person viewing it, and can test which one it actually uses.

## Audience and prerequisites

Learners in lessons 2 to 4. A PDI with HRSD core is helpful for the demo segment but the concepts stand alone.

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Talking head. | "Priya works in Pune. Her manager, Tom, is in London. Tom opens an HR case on Priya's behalf. Which country's leave policy applies? Which team should get the case? And whose services should Tom see on the form?" |
| 0:20 | Title card. | "Who is this case about? The single most common HRSD defect." |
| 0:25 | Diagram: an HR case card with three labelled arrows: Subject person -> Priya; Opened by -> Tom; Assigned to -> India HR team. | "An HR case has a subject person: who it is about. An opened-by: who typed it. And an assignee: who works it. Incident management has a caller. HR has all three, and they are often different people." |
| 1:00 | Column chart-free table: Rule / Should read. Rows: Regional assignment -> Subject (Priya, India). HR criteria on service eligibility -> Subject. Knowledge user criteria -> Viewer (whoever is reading). Notification to the requester -> Opened by. SLA schedule -> Subject's working calendar. | "Walk through the rules. Regional assignment reads the subject: Priya, India. Service eligibility with HR criteria should evaluate against the subject wherever there is one. Knowledge user criteria are different: they evaluate for whoever is reading. The SLA schedule should follow the subject's working calendar, not New York's." |
| 1:50 | Highlight knowledge row with a box and the word "different". | "That knowledge difference has a real consequence. If Tom searches knowledge for Priya, he sees articles for Tom, a UK manager, not for Priya. That is why manager guidance belongs in the manager knowledge base." |
| 2:15 | Screen: PDI, an HR case form; point to the subject person ("Opened for") field and the Opened by field. | "On the form, find both fields. Labels vary; subject person is often shown as 'Opened for'." |
| 2:35 | Screen: a before business rule script with the comment "all person-based logic reads the SUBJECT person, not the caller". | "When you write a rule, write the answer in a comment. This rule copies region from the subject's HR profile. Not gs dot getUserID, which would be Tom." |
| 3:00 | Side-by-side code: wrong `profile.addQuery('user', gs.getUserID());` vs right `profile.addQuery('user', current.subject_person);` | "Here is the bug in one line. On the left, the rule reads the logged-in user. It works perfectly in testing, because testers create cases for themselves. On the right, it reads the subject." |
| 3:30 | Test plan slide: "Create case as Priya for Priya. Create case as Tom for Priya. Compare region, assignment group, visible services." | "So test it the way it fails. Create one case as Priya for herself. Create one as Tom for Priya. If anything differs, region, group, visible services, you have found a rule reading the wrong person." |
| 4:00 | Diagram: COE tables as separate locked boxes (Shared services, Employee relations, Total rewards) all extending a base HR case box. | "One more reason this matters: access. Subject-person self-access lets Priya read her own case. That is a separate rule from requester access for Tom, and both are separate from what a manager may see. Lesson eight makes you write each one down." |
| 4:40 | Talking head. | "On a well-built implementation, every condition answers 'which person?' on purpose. On a broken one, the question was answered by accident, usually as 'whoever is logged in'." |
| 5:10 | Recap slide: "Subject = about. Opened by = typed it. Viewer = reading now. Write which one in a comment. Test with an on-behalf-of case." | "Subject, opened by, viewer. Pick deliberately, comment it, and test with an on-behalf-of case." |
| 5:40 | End card. | "Try lesson 2, practice step 5: prove whether your criterion evaluated against the logged-in user or the subject." |

## On-screen assets and B-roll

- Case card diagram with three labelled arrows; COE locked-box diagram (reuse from lesson 2 image style).
- Code comparison slide.
- PDI HR case form (blur any non-synthetic names).

## Accessibility

- Captions and transcript; the rule table is narrated row by row.
- "Wrong" and "right" code panes are labelled with words, not just red and green.
- Personas are introduced by name and role verbally before appearing in diagrams.

## Check for understanding

1. Tom opens a case on behalf of Priya. Which person should regional assignment read? *Answer: Priya, the subject person.*
2. Why does Tom not see Priya's country-specific knowledge article when he searches? *Answer: knowledge user criteria evaluate against the viewer (Tom), not the case subject.*
3. Why do subject-versus-caller bugs often pass testing? *Answer: testers usually create cases for themselves, so subject and caller are the same person.*
