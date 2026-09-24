<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->

- 2026-09-24T21:56:30Z — Step 10 says to check the enumerated `FR`/`NFR` set against the code-generation traceability files. Read literally that reports 17 of 34 functional requirements uncovered, which is false: on this project the chain is `FR` → functional-design → `BR` → code-generation → source, so U1 discharges its `FR` coverage one stage earlier and its code-generation file enumerates 44 `BR` entries and no `FR` entries. Resolved coverage across both levels instead, which gives 46/46. Recorded the reasoning in `cross-unit-traceability.md` so the number is reproducible rather than asserted.
- 2026-09-24T21:56:30Z — Treated `FR1` through `FR5` as group headings rather than requirements. They carry no acceptance criterion of their own and every one of their leaves does, so enumerating them would have manufactured five permanently-uncovered IDs.
- 2026-09-24T21:56:30Z — Read the failure ladder's rung 2 as scoped to root causes in generated source or a code-generation approach, which is what it says. `NFR1`'s root cause is a human procedure that was not performed, so rung 2 produces no swappable-dimension fix and rung 4's no-fix variant is the correct template. Presenting "Retry with fix" would have required inventing a fix, which the protocol forbids in the other direction.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

- 2026-09-24T21:56:30Z — Wrote `performance-test-instructions.md` as an explicit not-applicable with its reason rather than omitting it, even though Standard strategy makes it conditional and `NFR5` rules out a numeric target. An absence with a stated reason is actionable; an absence without one looks like a skipped step.
- 2026-09-24T21:56:30Z — Fixed `package.json`'s `test` script inside this stage rather than routing it back to code-generation. It ran `tests/u1 tests/u2` only, skipping three of five directories while reporting green. Test configuration is explicitly rung 1 of this stage's own remit, and the gap was already on record as u4's review finding R-02.

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->

- 2026-09-24T21:56:30Z — Recorded the fresh-clone ordering check as a weak pass rather than a clean one. Both posts declare the same date, so the two builds agree without the date discriminating. The honest reading is that it confirms nothing timestamp-derived leaked in, and the unit tests with distinct dates are the real evidence.
- 2026-09-24T21:56:30Z — Reported `pages.ts` at 100% line coverage and immediately qualified it: 27 instrumented lines in a file of several hundred, because V8 counts executable lines and a template-literal renderer has few. The figure is true and overstates behavioural coverage; saying only the figure would have been misleading by omission.

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->

- 2026-09-24T21:56:30Z — `NFR1` now has no verification mechanism at all: the automated scanner was declined at practices-discovery and the manual walkthrough was declined here. Every subsequent change to markup or styling is unchecked against the mandated accessibility rule. Worth deciding, outside this workflow, whether the scanner decision should be revisited now that the walkthrough is not happening either.
- 2026-09-24T21:56:30Z — Browser automation was unavailable in this session, so `NFR6` and `NFR7` rest on the author's own browser observation plus a static reading of the stylesheet. If a browser-driving capability becomes available, those two are the cheapest targets to re-verify mechanically.
