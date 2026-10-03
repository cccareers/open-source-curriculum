---
course_id: sn350
media_id: sn350-v01
type: video-script
title: "One Statement, Two Obligations: From Citation to Generated Controls"
format: hybrid
target_runtime: "8 min"
related_lessons:
  - sn350-03
  - sn350-06
objectives:
  - Model authority documents, citations, policies, and control objectives in the compliance application
  - Scope a compliance or risk program to the right entities using CMDB data
competency_ids:
  - D10-S1-C05
  - D5-S1-C01
  - D5-S1-C05
---

## Purpose

After watching, the learner can trace Northwind Health's privileged access requirement from two authority documents through one policy statement and two control objectives to controls generated from a CMDB-driven entity type, and explain why the policy layer and dynamic scoping keep control counts stable.

## Audience and prerequisites

Learners in lessons 3 to 6. Demo PDI has Policy and Compliance Management activated (record the plugin set used), two small authority documents loaded, and the CMDB demo data.

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Talking head. | "Northwind Health must review privileged access for two reasons: their biggest customer's security addendum, and their financial reporting controls. Two obligations. How many quarterly reviews should a system owner do? One. Here is how the model makes that true." |
| 0:20 | Title card. | "One statement, two obligations." |
| 0:25 | Diagram of the chain: Authority document > Citation, many-to-many arrow to Policy statement > Control objective > (x entity) Control. | "The chain. Authority documents and citations are somebody else's words. Policies and statements are yours. A control objective restates the statement so it can be tested. A control is that objective applied to one entity." |
| 0:55 | PDI: open authority document "Northwind Customer Security Addendum v3"; show citation tree with A.5 > A.5.15. | "The addendum, loaded by import. Citations are hierarchical. A.5.15 sits under A.5, exactly as in the document, because auditors navigate by clause number." |
| 1:20 | Background script: run the lesson 3 orphan check; output "Unresolved citation parents: 0". | "After every load, run the orphan check. Zero unresolved parents. A silent orphan is a requirement nobody can find." |
| 1:40 | Open second authority document "Financial reporting ITGC catalog", citation ITGC-AC-03. | "The second obligation, with its own numbering. We never edit citation text. Citations are quotations." |
| 2:00 | Open policy "Access Management Policy", statement: "Every account with administrative privilege on an in-scope system is reviewed and re-approved by the system owner at least once per calendar quarter." Show the related citations list with both A.5.15 and ITGC-AC-03. | "One policy statement: population, actor, action, frequency. A tester can work from that. Both citations map to it. That mapping is the answer to 'why does this control exist?'" |
| 2:40 | Slide comparing two models: citation-to-control (two controls, two reviews per owner) vs layered (one statement, one review). | "If you map citations straight to controls, every system owner gets two near-identical reviews every quarter. With the policy layer, one review evidences both." |
| 3:10 | Two control objectives: "Quarterly privileged access review: directory-managed infrastructure" and "...: finance application native admin roles". | "Why two objectives? Same statement, different evidence. Directory servers are reviewed from a group export; the finance app from its admin console." |
| 3:35 | Entity type record: table `cmdb_ci_server`, filter: operational, production, not retired, supporting the finance service. Owner field: support group manager. | "Now scope. Not a hand-picked list: a filter over the CMDB. Production, operational, not retired, supporting the finance service. Ownership is derived from the support group manager." |
| 4:10 | Show generated controls list: one per server, named "objective - entity". Count shows 30. | "Attach the objective to the entity type and the application generates one control per server. Nobody typed these." |
| 4:30 | Run lesson 6 scoping health check; output e.g. "total 30, noOwner 3, stale 1". | "Before the first attestation, check usability. Three servers have no derivable owner. That is a permanent ten percent overdue rate unless we fix three records today." |
| 5:00 | Whiteboard: business list (29) vs generated (34 before dedupe): four duplicates, one unknown server. | "Reconcile against what the business believes. Finance said 29; the filter said 34. Four were duplicates from a stale integration. One was a real server nobody remembered. Both findings are wins." |
| 5:40 | Slide: "New edition arrives" with delta steps: load new edition, map editions, re-map statements, analyze new, retire old. | "When the addendum's next edition arrives, load it beside the old one, re-map citations to your statements, and retire the old edition. In a layered model almost no controls change." |
| 6:20 | Slide: "Server joins -> control generated; server retired -> control retired, evidence kept". | "And when a server joins the filter, a control appears. When one is retired, its control retires and the evidence stays. Verify that on your instance; do not assume it." |
| 6:50 | Recap: "Citations are quotations. Statements are yours. Objectives per evidence type. Scope is a query. Reconcile before you attest." | "Citations are quotations. Statements are yours. One objective per kind of evidence. Scope is a query. Reconcile before you attest." |
| 7:30 | End card. | "Lesson 3 practice step 4, then lesson 6 step 3." |

## On-screen assets and B-roll

- Chain diagram (match lesson 3 image style), comparison slide, delta-process slide.
- Demo PDI pre-loaded; blur sys_ids.

## Accessibility

- Captions and transcript; all record names and filter conditions are read aloud.
- Diagrams use labels and arrows; no meaning carried by color.
- Script outputs zoomed and read aloud.

## Check for understanding

1. Why map both citations to one policy statement rather than to separate controls? *Answer: one review evidences both obligations, avoiding duplicate attestations and keeping control counts stable as obligations change.*
2. Why two control objectives for one statement? *Answer: the evidence and procedure differ by asset class (directory export vs application admin console).*
3. What should you do before the first attestation campaign on a dynamic entity type? *Answer: reconcile the population against the business's list and run a scoping health check for missing owners and stale CIs.*
