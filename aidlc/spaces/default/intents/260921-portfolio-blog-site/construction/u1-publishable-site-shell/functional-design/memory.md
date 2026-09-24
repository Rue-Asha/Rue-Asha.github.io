<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations

- 2026-09-23T11:01:13Z — read NFR8's "the file name is the URL" as "the item's directory name is the URL" under the chosen directory-per-item layout; the answer to Q2 stated that reading explicitly, so it is a settled interpretation rather than a contradiction with the affirmed practice.
- 2026-09-23T11:01:13Z — treated `featured` on a project as an ORDERING key rather than a selection filter (Q7), so Home can never show its empty state while projects exist.
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->

## Deviations

- 2026-09-23T11:01:13Z — asked a seventh question beyond the six planned. Q4's answer (`featured: true` selects Home's projects) left the launch-day case where no project carries the field, which would have shipped a silent Home/Projects disagreement. The affirmed practice is to resolve a contradiction rather than carry it forward, so the extra question cost less than the unresolved case.
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs

- 2026-09-23T11:01:13Z — chose the strict CSP set without `'unsafe-inline'` for styles. It forecloses inline style attributes for every later unit, U5 in particular; accepted because a policy that permits inline styles cannot actually enforce the no-third-party rule it exists for, and U5's deliverable is an external stylesheet anyway.
- 2026-09-23T11:01:13Z — chose ISO-date-only over accepting a general date parser. Rejected the forgiving parser specifically because its failure mode is silent misordering (day-first vs month-first) rather than a loud build error, which is the failure class this project's whole check set exists to prevent.
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->

## Open questions

- 2026-09-23T11:01:13Z — project ordering beyond `featured` and `year` is still undeclared upstream (ADR-002 left it open deliberately). The year-descending fallback chosen here is this unit's rule, not a project-wide decision; U3 may need to revisit it when more than a handful of projects exist.
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
