<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-09-23T08:55:47Z — Asked eleven interview questions at Standard depth rather than the usual five to eight. The guidance is a range, not a cap, and two things pushed past it: `team.md` was empty, so nothing asked was a confirmation of an existing habit, and the three blind reviews surfaced two security decisions (account second factor, secret push protection) that cost a minute now and cannot be undone later.
- 2026-09-23T08:55:47Z — Treated security as a sixth practice area even though the stage prose names five sections for `memory/team.md`. The devsecops review's two highest-value items had no home in Way of Working, Walking Skeleton, Testing Posture, Deployment, or Code Style, and dropping them to stay inside the five headings would have lost them. They are integrated into the existing sections rather than given a sixth heading, so the promotion contract is unchanged.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->
- 2026-09-23T08:55:47Z — `aidlc engine review-brief summary` failed with `aidlc-review-brief.ts does not export main(argv)`. Presented the consolidated summary inline and recorded the confirmation through the ordinary decision/answer pair instead of blocking the checkpoint, per the project rule learned at approval-handoff. Said plainly in chat that the helper failed. The `SUMMARY_CONFIRMATION_RECORDED` receipt was emitted normally, so the authorization chain is intact.

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
- 2026-09-23T08:55:47Z — Q4 and Q6 were individually reasonable and jointly broken: blocking every failed check while having no automatic failure signal recreates the silent publish failure that the user flow and the initiative brief both carried as a medium risk. Raised it as a targeted follow-up with four concrete resolutions rather than picking one and noting it. The human chose to move the checks before the push rather than soften the blocking or add a notification.
- 2026-09-23T08:55:47Z — The automated accessibility scan was offered and not chosen; the WCAG 2.1 AA bar is now verified entirely by a manual keyboard walkthrough per page type. That is a real reduction in automated coverage of a rule the record treats as mandated, and it is the human's explicit choice rather than an oversight. Recorded as stated rather than argued back.

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
- 2026-09-23T08:55:47Z — Pre-push checks have a known erosion path: the developer review warned that a solo author learns `--no-verify` once and then believes a dead hook is still running. The chosen answer puts the checks before the push; whether they are enforced by a git hook, a command the author runs, or a remote safety net is a Construction decision that should be made knowing this.
- 2026-09-23T08:55:47Z — Gating the publish on checks forecloses GitHub's built-in Pages branch build, which runs no user-defined steps. The stack and publish-mechanism decision is therefore narrower than Scope Definition assumed when it filed the mechanism as a free Construction choice.
- 2026-09-23T08:55:47Z — The 80% line-coverage floor inherited from `org.md` by the `feature` scope still has no determined scope of application, because no stack is chosen. Whether it measures anything at all is a Build and Test determination, recorded per unit with a reason.
