<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations

- 2026-09-23T12:37:16Z — read the design system's silence on standalone-link sizing as a genuine gap rather than an implied default, because NFR7 applies to every interactive target and the interaction spec only derives the figure for list rows.
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->

## Deviations

- 2026-09-23T12:37:16Z — took on a sizing question that a sibling unit's review had raised against that sibling. The reviewer placed ownership there; this unit owns styling, so settling it here avoids the same gap being answered twice differently.
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs

- 2026-09-23T12:37:16Z — applied the minimum-target padding below the breakpoint only. Desktop link targets stay visually as drawn, at the cost of one more breakpoint-conditional rule; the alternative would have made every desktop link taller than the design intended.
- 2026-09-23T12:37:16Z — one stylesheet with a register class rather than a file per register. Accepts that an editorial change touches a file every page loads, in exchange for the register staying the small set of differences the mockups intended rather than hardening into two parallel systems.
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->

## Open questions

- 2026-09-23T12:37:16Z — contrast is verified by hand against the measured table and by nothing else, since the automated accessibility scan was declined. Any colour change re-opens that table; nothing enforces that it is re-opened.
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
