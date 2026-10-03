# Tech Pre-Apprenticeship: How the Supplementary Projects Chain (W1-W8)

**The problem it solves.** Week 7 asks participants to build the Outreach Portfolio from eight weeks of evidence: dated reflections from each rotation, weekly pipeline numbers, before/after artifacts. Week 8 asks them to defend every number in front of employer partners. But Weeks 1-6 never explicitly tell learners to capture that evidence as they go. Learners end up rebuilding it from memory in Week 7, and memory inflates.

**The spine: one evidence ledger.** Each week's supplementary project adds to one file the participant owns, stored in a personal account from day one. The file has three tabs:

1. **Weekly numbers**: one row per week. The columns are fixed in Week 1, and later weeks only add columns.
2. **Artifacts**: one caption card per artifact (Artifact / Skill / Context / Result / My part), the exact format W7-03 requires.
3. **Reflections**: one dated paragraph per week answering *hard, boring, surprising*, plus a rotation-specific "would I want this seat?" question. This fills the gap W7-02 assumes is already covered.

| Week | Project | Adds to the ledger | Feeds forward to |
|---|---|---|---|
| W1 | `PREAPP-W1-x01` Evidence Ledger: Week 1 Baseline | Creates the ledger; baseline funnel ("reached at least" counts); before/after first touch; alignment check | The baseline every later week is compared against, and the "arc" in the W7 metrics story |
| W2 | `PREAPP-W2-x01` Priority Account Dossier | A/B experiment log; mapped account; booking/interview outcome | Interview intelligence for the W7 fit matrix; the "turn" (a named change) for the metrics story |
| W3 | `PREAPP-W3-x01` Call Review and Funnel Brief | Qualification counts; weakest stage; call review | **Technical Sales artifact**; funnel table format reused by W5 |
| W4 | `PREAPP-W4-x01` Automation Runbook and Accuracy Audit | Minutes saved per week; audit accuracy % | **AI artifact**; a runbook step that W5 can replace with code |
| W5 | `PREAPP-W5-x01` Funnel Report Script (`bun test`, 6 tests) | The funnel computed by script from the CRM export | **Software artifact**; regenerates the weekly numbers for W7 in one command |
| W6 | `PREAPP-W6-x01` Demo Day Campaign Tracker and Results Card | Invitations, reply rate, Demo Day yes count; prediction vs. actual | **Digital Marketing artifact**; drives Demo Day turnout; results card becomes a W8 evidence slide |
| W7 | `PREAPP-W7-x01` From Ledger to Portfolio: Claim-to-Evidence Audit | Week 7 row; artifact index | Fit matrix and metrics story sourced from the ledger; a claim register that verifies application, resume, LinkedIn, and portfolio |
| W8 | `PREAPP-W8-x01` Demo Day Evidence Pack and Thirty-Day Hand-off | Final row | Stage numbers drawn only from the verified register; Demo Day leads seeded into the 30-day plan; ledger archived with the CRM export |

**Design rules that keep the chain coherent**

- **One counting rule throughout.** Funnel stages are counted as "reached at least this stage," never as the CRM's current-stage totals. This was added to W1-02 and W3-04 in this pass, and it is enforced by the W5 tests.
- **Every project ends with the same three ledger moves**: a numbers row, at least one caption card, and a dated reflection. A participant who completes even half the projects reaches Week 7 with real, contemporaneous evidence.
- **One artifact per rotation** comes from the W3-W6 projects, which meets W7-03's "every rotation represented" requirement without extra work.
- **Honesty is built in.** Every project requires at least one result that did not work. W7 and W8 need this for the portfolio's "what failed" requirement and for credibility with employer partners.
- **Ownership from day one.** The ledger starts in a personal account, so the W8 export is a verification step, not a migration.
- **Skippable but recoverable.** Each project's instructor notes say how a participant who missed earlier links can still finish (for example, W7 builds the claim register straight from the CRM, repo, and analytics). Missing weeks are labeled, never backfilled from memory.

**Objectives.** No new outcomes are introduced. Every project cites only its own course's existing objectives (copied verbatim from `course.json`) and existing competency IDs. The arc changes how evidence is captured, not what is learned.
