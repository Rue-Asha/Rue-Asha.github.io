<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations

- 2026-09-23T11:22:19Z — read FR5.1's "(RSS or Atom)" as a genuine open choice rather than a preference for the first-named, and put it to the human; Atom was chosen for its stricter date and identity model, which matters because declared dates are this site's ordering key.
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->

## Deviations

- 2026-09-23T11:22:19Z — asked only two questions against a Standard depth range of five to eight. U1 authored the entity model and every business rule this unit would otherwise have needed to decide, and the questions file names each subtracted topic with the artifact that settled it.
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs

- 2026-09-23T11:22:19Z — summary-only feed over full-body. A full-body feed means a reader never loads the site, which for a site whose success bar is qualitative is not obviously a loss; chose summary-only anyway because escaping rendered HTML into feed entries correctly is a recurring source of silent breakage and this unit has no way to check it.
- 2026-09-23T11:22:19Z — split the unknown-code-fence case in two rather than picking one behaviour for both. An unlabelled fence is a deliberate authoring choice and must never block a push; a fence naming a language that does not exist is always a typo, and this project's posture is to make typos loud. One rule would have got one of those two cases wrong.
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->

## Open questions

- 2026-09-23T11:22:19Z — the feed's entry identity across a slug that is deleted and later reused is unspecified. NFR8 forbids changing a live slug but says nothing about reuse after deletion, so a feed reader could show an old entry's title against new content. Carried rather than invented; it touches U1's FA1.
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
