<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->

- 2026-09-24T22:16:43Z — Read this stage's condition ("Skip if CI already exists and is adequate") as not met, and ran the stage rather than skipping it. CI did exist, but "adequate" was false in a specific, checkable way: four of the seven checks this project treats as blocking had no remote enforcement, so a push that skipped the local run could deploy a site whose tests failed. Recorded the four-of-seven figure in the questions file so the judgement is checkable rather than asserted.
- 2026-09-24T22:16:43Z — Subtracted three of the stage file's four reference questions as already settled (CI tool, branch strategy, artifact repositories) and named the artifact that settles each. The fourth, quality gates, was only *partly* settled — `team.md` fixes which checks are blocking but never says which run remotely — so that half became Q1 rather than being dropped along with the rest.
- 2026-09-24T22:16:43Z — Treated the artifact-management half of the CI/CD knowledge as having no subject here rather than inventing naming, versioning, registry and retention conventions for it. There is no container image, no package publication, and no versioned artifact; the build output is uploaded and discarded. Said so in `ci-config.md` instead of leaving the omission unexplained.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

- 2026-09-24T22:16:43Z — Asked a fourth question outside the planned set, to settle a contradiction rather than carry it. [Q3] left dependency alerting off, which contradicts an affirmed `team.md` § Deployment practice. The project's own learned rule is that an unresolved contradiction carried forward costs more than the extra question, so [Q4] chose how to reconcile it: amend `team.md` through the learnings step.
- 2026-09-24T22:16:43Z — [Q4]'s chosen resolution then did not happen: the learnings ritual offered the drafted amendment and the answer was "Nothing to add". Rewrote `quality-gates.md` and `phase-check-construction.md`, both of which already asserted the amendment as done, to record the contradiction as open instead. A record claiming a resolution that did not occur is worse than one naming the gap, and the project's own rule is explicit that a check must never be cleared by writing something untrue.

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->

- 2026-09-24T22:16:43Z — Verified the content carve-out before adding `format:check` to the publish path rather than after. `team.md` § Code Style forbids a style opinion blocking a post, so a formatter on the deploy gate is exactly the ceremony it rules out — unless `content/` is genuinely excluded. Checked `.prettierignore`, `.prettierrc.json` and a real run, and recorded all three in `quality-gates.md`. Had the exclusion not been there, the honest answer to [Q1] would have been B rather than A.
- 2026-09-24T22:16:43Z — Left the coverage floor enforced by `vitest.config.ts` rather than adding a pipeline step that parses a coverage report. Nothing in the pipeline reads a number, so nothing can misread one, and lowering the floor has to appear in a diff of a tracked file.

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->

- 2026-09-24T22:16:43Z — With [Q2] answer C, gates 4-8 run only on `main`. A branch that breaks the suite is now discovered when it lands, and the consequence is a site that quietly does not update. `team.md` § Deployment already names this residual and the mitigation is behavioural — look at the live site after publishing. Worth revisiting if branch work ever becomes frequent enough that the silence bites.
- 2026-09-24T22:16:43Z — The amended workflow has been verified locally (all five commands pass) but has not yet run on the remote, so the new steps are unproven in the Actions environment. The first push to `main` after this stage is what proves them.
