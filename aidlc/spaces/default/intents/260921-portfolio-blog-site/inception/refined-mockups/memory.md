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
- 2026-09-23T09:35:00Z — Read this stage's remit narrowly, as the initiative brief states it: visual style only (colour, type, spacing, feel). Did not reopen layout, page inventory, screen states, the accessibility bar, or the responsive rule, all of which are settled upstream and were explicitly excluded from the reopening.
- 2026-09-23T09:35:00Z — Treated the no-third-party-request rule as the governing constraint on every typography option rather than a footnote. It removes hosted-font services entirely, so each option states its repository cost in font files rather than presenting families as free.

## Tradeoffs
- 2026-09-23T09:35:00Z — Did not ask about responsive breakpoint values despite the stage file listing breakpoints as a topic. NFR6 already fixes the behaviour (desktop resolved, phone contraction, rail stacks, no hamburger) and the guidance is that content dictates breakpoints; a number asked in the abstract would be invented. Recorded as an assumption instead.
- 2026-09-23T09:35:00Z — Spent a question on code-block colouring rather than on interaction patterns generally. This site has almost no interaction — no modals, dropdowns or forms — so the row hover/focus treatment and the code theme are the only two interaction-and-colour decisions with real consequences, and the code theme carries an unchecked contrast obligation.

## Deviations
- 2026-09-23T10:02:00Z — Filled the questions file's [Answer] tags with a positional script rather than editing each tag by hand. It produced two wrong records: Q3 got the letter of the option's position in the interactive prompt (D) instead of its letter in the file (B), because the prompt reordered the options; and Q8 was left blank because the blank-detection test read the following "---" separator as content. The reviewer caught both. The decisions themselves were never in doubt — they are in the audit ledger as exact labels and in the summary the human approved — but the file that is supposed to be the authoritative record was wrong.

## Open questions
- 2026-09-23T10:02:00Z — The syntax-theme token colours (accessibility checklist P6) are the one contrast obligation this stage could not close, because the theme is chosen during Construction. Whether that hand-check actually happens at PU-5 is unverified by anything.

## Interpretations
- 2026-09-23T10:10:00Z — Treated the two critical review findings as record-correction rather than design change: the human's answers were already on the audit ledger as exact labels and in the summary they approved, so fixing the questions file's tags brought the record into line with a decision that had never actually been in doubt. No artifact content changed as a result of R-01 or R-02.
