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
- 2026-09-23T00:00:00Z — Read the free-text project answer as combining two offered options: a short list entry (summary, tools, repo link) plus a separate in-depth page per project. Wireframed both, and recorded the extra page type as an assumption because the approved scope document names a "projects section" without enumerating page types.
- 2026-09-23T00:00:00Z — Treated the author's publishing workflow as a first-class user flow with its own frame in user-flow.md, not as an implementation note. It was a stated scope requirement, and the site's shape depends on it (no admin UI exists precisely because of it).

## Deviations
- 2026-09-23T00:00:00Z — The wireframing guidance says to wireframe all five screen states. Marked "loading" as not applicable rather than inventing one, since a statically served site has no fetch to show progress for, and recorded the reasoning as an assumption so a runtime-fetch architecture would reintroduce it.

## Tradeoffs
- 2026-09-23T00:00:00Z — Searched Mobbin before writing the questions rather than after, so the post-list question could offer real patterns (typographic list vs card grid) with their actual maintenance cost. Cost an extra round of searches up front; the user chose from evidence instead of from my description.
- 2026-09-23T00:00:00Z — Ran a second Mobbin search mid-stage once the project answer named a page type I had not looked up. Kept the design grounded rather than extrapolating the detail page from the list pattern.

## Open questions
- 2026-09-23T00:00:00Z — The name to display in the header and on Home is unconfirmed; the frames use the repository's author identity as a placeholder. Worth settling before refined mockups fix the type treatment around it.
