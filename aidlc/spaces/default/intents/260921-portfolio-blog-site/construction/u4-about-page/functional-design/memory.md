<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations

- 2026-09-23T12:28:17Z — read the absence of an About content kind as a genuine structural gap rather than an oversight: `ContentFile.kind` is exactly post and project, and About has prose, so something had to give. Put it to the human rather than quietly adding a third kind.
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->

## Deviations

- 2026-09-23T12:28:17Z — asked one question for a unit with one functional requirement. `unit-of-work.md` warns this unit's main risk is being treated as trivial; the answer is to ask the one thing that is actually undecided, not to pad the count.
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs

- 2026-09-23T12:28:17Z — About's prose lives in its template rather than in a content file. Keeps the content model at two kinds and adds no general page capability for one page, which is what the scope's exclusions argue for; the cost is that editing About is a code change on the branch path rather than a content commit direct to main, and the formatter will rewrite that prose.
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->

## Open questions

- 2026-09-23T12:28:17Z — nothing settles how often About changes. If it turns out to change like content rather than like code, the template choice is the wrong one and a third kind becomes worth its cost. Recorded so a later reader can tell a decision from an accident.
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
