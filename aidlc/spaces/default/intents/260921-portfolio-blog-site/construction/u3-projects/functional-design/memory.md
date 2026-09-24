<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations

- 2026-09-23T12:20:38Z — treated the Projects page ordering as still genuinely open even though U1 had already defined a total project order, because U1 defined it to serve Home's top-three and `unit-of-work.md` names ordering as this unit's to settle. Putting it to the human confirmed one rule site-wide rather than inheriting U1's by default.
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->

## Deviations

- 2026-09-23T12:20:38Z — asked one question against a Standard depth range of five to eight. Requirements settled the six required fields, the omitted live-URL row, the two row targets, accessible repo link names and the empty state; U1 settled the entity and its validation. The questions file names each subtracted topic with the artifact that settled it.
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs

- 2026-09-23T12:20:38Z — one ordering rule for Home and the Projects page, rather than letting `featured` affect Home only. The cost is that marking a project featured silently reorders the full list too, which an author may not expect; accepted because two orderings for one collection is the kind of thing nobody remembers six months later.
- 2026-09-23T12:20:38Z — carried U1's BR8-series numbering forward for this unit's new rules rather than opening a fresh series per unit. Keeps one readable rule set across the construction record; the cost is that a reader must know which unit authored a given BR number.
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->

## Open questions

- 2026-09-23T12:20:38Z — `type` is free text with no enumeration (U1), so a future decision to group or filter the Projects list by type would need a vocabulary that does not exist yet. Recorded rather than pre-empted: no requirement asks for grouping today.
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
