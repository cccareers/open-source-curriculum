---
course_id: ops200
media_id: ops200-a01
type: animation-storyboard
title: "One Artifact Through the Pipeline"
target_runtime: "90 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - ops200-04
  - ops200-05
objectives:
  - Explain what each stage of a CI/CD pipeline guarantees
  - Document a release so its changes can be traced
competency_ids:
  - D6-S1-C03
  - D4-S1-C03
---

## Concept and misconception it fixes

Learners see a pipeline as "a script that runs my commands on a server." They miss two things: each stage adds a specific guarantee, and the artifact built once is the same bytes that get deployed. That's what makes a running system traceable to a commit. The animation follows one commit from push to `/health`, stamping a guarantee onto it at each stage and showing what goes wrong when a deploy rebuilds instead.

## Visual language (shapes, colors with color-blind-safe palette, labels)

- The commit is a card labeled `b7a4e2d`. The artifact is a box labeled `release-b7a4e2d`.
- Stages are stations on a horizontal track: Checkout → Setup → Install → Lint ∥ Test → Build → Upload → Deploy → Smoke.
- Okabe-Ito palette: passed stage **bluish green #009E73** with a ✓ and the word "pass"; failed stage **vermillion #D55E00** with ✗ and "fail"; skipped **grey #999999** with a dashed outline and "skipped". Guarantee stamps are **sky blue #56B4E9** tags with text.
- Each stage's guarantee appears as a short text tag that sticks to the card.

## Scenes

| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 6s | A developer pushes; card `b7a4e2d` appears on an empty machine labeled "fresh runner: no node_modules, no .env". | Card drops onto the machine. | "Every run starts on a machine that has never seen your project." |
| 2 | 10s | Checkout and Setup stations. | Tags stick: "exactly this commit", "Node from .nvmrc". | "Checkout guarantees exactly this commit. Setup guarantees the declared Node version." |
| 3 | 8s | Install station. | Tag: "dependencies = lockfile". | "npm ci guarantees the dependency tree matches the lockfile." |
| 4 | 10s | Track splits into Lint and Test running side by side, then rejoins. | Both pass; tags "team rules hold" and "covered behavior still works". | "Lint and test run in parallel. Each adds its own guarantee, and build waits for both." |
| 5 | 10s | Build station produces box `release-b7a4e2d`; Upload stores it on a shelf. | Box glows; tag "complete artifact on a clean machine". | "Build creates the artifact once. Upload stores those exact bytes, named after the commit." |
| 6 | 8s | Branch point labeled `if: main && push`. A pull-request card stops here (deploy "skipped"); the main card continues. | PR card greys out with "skipped". | "Pull requests stop here. Only pushes to main go on to deploy." |
| 7 | 10s | Deploy takes the same box from the shelf to a server labeled "production". | The box moves; its label stays visible. | "Deploy takes the same box. The bytes that were tested are the bytes that run." |
| 8 | 10s | Counterfactual inset: a deploy that runs `npm run build` again produces box `release-????` with a question mark. | Inset shakes; label "never verified". | "Rebuild at deploy time and you ship something no stage ever checked." |
| 9 | 8s | Smoke station: `curl --fail /health` returns `{"version":"v1.4.3","commit":"b7a4e2d"}`. | Arrow from the response back to the commit card. | "The running system reports its own commit, and that hash leads back to every record of the release." |
| 10 | 10s | Failure replay: Test station turns red; Build, Upload, Deploy, and Smoke all show "skipped". | Red ✗ on Test, dashed grey downstream. | "If any stage fails, the line stops. Downstream stages are skipped, not failed. Read the first red." |

## Interaction variant (optional)

A clickable track where each station opens a panel naming its guarantee and the incident it prevents (from lesson 04). A toggle lets learners flip "deploy rebuilds" on and watch the traceability arrow in scene 9 break.

## Production notes

- Keep station names identical to the job and step names in lesson 04's YAML so learners recognize them on the real run page.
- The `/health` JSON matches lesson 05 (version from `package.json`, commit from the build-info file).
- Export with captions; provide a static storyboard PNG for the lesson body as an alternative.
