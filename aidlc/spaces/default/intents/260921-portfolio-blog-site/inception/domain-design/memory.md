<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->

## Interpretations
- 2026-09-23T10:20:00Z — Read "component" for this system as a build-time building block rather than a runtime service. Nothing executes while a reader is on the page (NFR2, NFR3), so the system whose boundaries are being drawn is the thing that turns a folder of Markdown into a folder of HTML, and databases/generators/third-party libraries are external dependencies rather than components.
- 2026-09-23T10:20:00Z — Treated "adopt a generator or write the build" as a component-boundary question rather than a tech-stack question the stage is forbidden to answer. Which capabilities are ours versus somebody else's IS the boundary; the specific product stays open for Code Generation, which is how requirements OQ3 was written.

- 2026-09-23T10:35:00Z — Read Q3's "shared behaviour (slug derivation, draft filtering, Markdown rendering)" and Q5's "one shared component" as compatible rather than conflicting. Q5 named six functions and Markdown rendering was not among them, so keeping MarkupRenderer separate honours Q5 exactly while declining to add a seventh thing to it. Presented as a component-boundary option block so the team can overturn it at the gate.
- 2026-09-23T10:35:00Z — Treated the GitHub Actions publishing workflow as deployment configuration rather than a component, and handed it to CI Pipeline (3.7) with its obligations recorded in ADR-005. The stage's own definition says components are code you write, not infrastructure you deploy, and the workflow's only job is to invoke CheckRunner and deploy SiteBuilder's output.

## Deviations
- 2026-09-23T10:35:00Z — Asked a seventh question when the Standard depth range is 5-8 and six were already authored, because Q1's answer (write the build) pulled against an affirmed practice in team-practices.md § Deployment rather than against another answer. Carrying that contradiction into Units Generation would have cost more than the extra question.
- 2026-09-23T10:35:00Z — The consolidated-summary decision brief helper failed with "aidlc-review-brief.ts does not export main(argv)". Presented the summary inline, said plainly that the helper had failed, and recorded the confirmation through the ordinary decision/answer pair.

## Tradeoffs
- 2026-09-23T10:20:00Z — Spent a whole question on where front-matter validation runs. It looks like an implementation detail but FR1.5 requires the build itself to fail loudly, and that is precisely the thing stock generators do badly — so the answer is both a boundary decision and a constraint on which generator can be chosen later.
- 2026-09-23T10:35:00Z — Accepted that PageRenderer realises most of FR2 through FR5 rather than splitting it, because Q6 chose one rendering component and the alternatives drew boundaries with nothing behind them. Stated the cost openly in the Rationale and in ADR-006 instead of hiding it, since the traceability file makes the concentration visible anyway.
- 2026-09-23T10:35:00Z — Left project ordering undefined in ProjectCatalog. Nothing upstream declares one and inventing a rule here would have been a requirement smuggled in under a design decision.

## Open questions
- 2026-09-23T10:35:00Z — Project ordering: no upstream artifact states how the Projects list is ordered. It becomes a real question the first time there are more than a handful of projects, and Functional Design or the author can settle it.
- 2026-09-23T10:35:00Z — requirements.md OQ2 (how the author learns publishing failed after a push) is narrowed but not closed by ADR-005: a workflow failure is at least visible in the Actions view and notified by GitHub's default, where the built-in build's failure was not. It still belongs to Construction.

## Interpretations

- 2026-09-23T20:59:25Z — Read the stale-stage flag as bookkeeping rather than as a design fault, and said so before asking what to change. The flag fired because Functional Design wrote back into `components.md`, not because any upstream input moved; both `requirements.md` and `team-practices.md` predate this stage's own artifacts. Stating that first changed what was worth asking — the user had chosen Modify expecting something to fix.
- 2026-09-23T20:59:25Z — Scoped the Modify question set by diffing the catalogue against the built system rather than by re-asking the stage's topic areas. Six divergences fell out of that diff and became the whole question set; re-running the original boundary questions would have produced noise against seven already-settled ADRs.

## Deviations

- 2026-09-23T20:59:25Z — Asked a follow-up (Q13) after the consolidated summary had already been confirmed, then re-took the confirmation. Writing the Q10 fold-back surfaced two dependency edges the code has and the catalogue lacks, and the confirmed summary's own wording said this pass changed no dependency edge. Adding them silently would have contradicted the confirmed text; adding them without asking would have been a decision the user never made.
- 2026-09-23T20:59:25Z — Started the revision Q&A in a separate `domain-design-revision-questions.md`, then consolidated it into the canonical `domain-design-questions.md` and deleted the separate file before the confirmation checkpoint. Two competing question files for one stage is a trap for every later reader and for the reviewer dispatch, which is handed one Q&A path.

## Tradeoffs

- 2026-09-23T20:59:25Z — Chose to adopt implementation facts into the design rather than revert working code, but routed each one through a question rather than a standing rule (ADR-009). Slower, and the answers looked obvious in advance; the justification is that two of the six options on the table would have changed `src/`, so the questions were real rather than ceremonial.
- 2026-09-23T20:59:25Z — Recorded project sorting as a seventh `ContentTransforms` function, widening `team-practices.md` § Testing Posture's list of six. Kept the coverage target whole, at the cost that the catalogue and that practice no longer read as a literal match. Recorded in ADR-008 rather than left to be noticed.

## Open questions

- 2026-09-23T20:59:25Z — `package.json` runs `vitest run tests/u1 tests/u2 --coverage` while `tests/u3`, `tests/u4` and `tests/u5` exist and are excluded. That is NFR12's per-unit coverage measurement, owned by Build and Test, not a component-boundary question. Carried out of this stage rather than acted on.
- 2026-09-23T20:59:25Z — The decision-brief helper fails with `aidlc-review-brief.ts does not export main(argv)`, so both summary checkpoints were presented inline. Worth confirming whether the same failure will hit the reviewer-backed gate brief.
