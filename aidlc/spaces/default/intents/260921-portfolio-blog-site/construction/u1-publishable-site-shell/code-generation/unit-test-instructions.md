# Unit Test Instructions — U1 Publishable Site Shell

## Framework and configuration

Vitest, running TypeScript directly, with V8 coverage. Chosen alongside the stack
at [Q1] rather than tuned; defaults are accepted except the coverage threshold,
which is set to the inherited floor.

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      reporter: ['text', 'json-summary'],
      thresholds: { lines: 80 },
    },
  },
})
```

The `thresholds.lines: 80` value is the coverage floor inherited from `org.md` by
the `feature` scope. It is not this unit's to lower, and it is never reduced to
make a run pass. If the measured figure falls short, the gap is reported and more
tests are written.

Test files live under `tests/u1/`, one per component plus one integration file.
Later units use their own `tests/u<n>/` directory, so every unit's command stays
scoped to that unit alone.

## How to run this unit's tests

The exact command, scoped to U1 only:

```bash
npx vitest run tests/u1 --coverage
```

This command is runnable from Step 2 of the plan onward, before any test exists —
it reports zero tests rather than failing. That is what makes the test-after
ordering executable: each layer is implemented, then its tests are written and
this command is run before the layer is treated as done.

Without coverage, for a faster inner loop:

```bash
npx vitest run tests/u1
```

A single file, while working on one component:

```bash
npx vitest run tests/u1/content-source.test.ts
```

Never run a bare project-wide `npx vitest run`. Build and Test executes every
unit's recorded command, so an unscoped command would rerun the whole suite once
per unit.

## Coverage target

80% line coverage across `src/**`, enforced by the threshold above and verified
at Build and Test. Template markup and configuration are not excluded from
measurement; they are simply thin, and the branching code that carries the real
risk — discovery, validation, ordering, the fail-loudly contract, the check run —
is where the tests concentrate.

`team.md` § Testing Posture names what needs unit tests: functions that branch or
transform data — date formatting, summary derivation, post sorting, slug
generation, sitemap construction. Template markup and configuration do not.
`tests/u1/page-renderer.test.ts` exists anyway, because the accessibility and
head-metadata rules (BR5.1, BR5.2, BR5.8 to BR5.10) are properties of rendered
markup and there is no other way to check them.

## Test scope per component

Standard strategy: 5 to 8 tests per component, plus integration at key
boundaries.

`page-renderer.test.ts` is the one file far above the band: it held **15** tests
before the second pass and holds **18** after it. PageRenderer is a single
component covering the shell plus seven templates, so it was already by some
distance the widest file here, and the second pass adds three: the footer's two
contact links, Home's contact row, and the class that distinguishes the 404
message from body prose. Cutting an existing test to stay inside a soft guideline
would drop coverage of an accessibility or head-metadata rule. The overshoot is
deliberate and is recorded in the plan as well as here.

An earlier draft of this file and of the plan both put the figures at "7–8 today,
10–11 after". Those numbers were never counted — they were carried across from
the first pass's per-component target — and the review caught it. The figures
above are counted from the file.

| File | Component | Tests | Covers |
|---|---|---|---|
| `tests/u1/content-source.test.ts` | ContentSource | 5–8 | BR1.1–BR1.9 |
| `tests/u1/post-catalog.test.ts` | PostCatalog | 5–8 | BR2.1–BR2.4 |
| `tests/u1/project-catalog.test.ts` | ProjectCatalog | 5–8 | BR3.1–BR3.7 |
| `tests/u1/content-transforms.test.ts` | ContentTransforms | 5–8 | BR5.11, the pure derived functions |
| `tests/u1/markup-renderer.test.ts` | MarkupRenderer | 5 | NFR2, NFR3 |
| `tests/u1/page-renderer.test.ts` | PageRenderer | 18 (was 15) | BR5.1–BR5.10, the footer links, Home's contact row, the 404 message class |
| `tests/u1/site-builder.test.ts` | SiteBuilder | 6–8 | BR4.1–BR4.5 |
| `tests/u1/check-runner.test.ts` | CheckRunner | 6–8 | BR6.1–BR6.5 |
| `tests/u1/integration.test.ts` | Spine | 3–4 | W1, W2, W4, W7 |

## Mocking and stubbing

Prefer real fixtures on disk over mocks. This build's whole job is reading files
and failing correctly on what it finds, so a mocked file system would test the
mock rather than the rule.

- **ContentSource, SiteBuilder, CheckRunner**: run against fixture content trees
  under `tests/u1/fixtures/`, writing output to a temporary directory created per
  test and removed afterwards. Never write to the real `dist/`.
- **PostCatalog, ProjectCatalog, ContentTransforms**: pure inputs, no mocks at
  all. These are the functions the coverage floor is really measuring.
- **MarkupRenderer**: real `markdown-it` and real `shiki`. Stubbing them would
  hide the one thing these tests are for — that colouring happened at build time
  and the output contains no script and no external URL.
- **PageRenderer**: real render calls against constructed entity values; assert
  on the emitted markup as a string.
- **The build's own year** (BR3.2 bounds `year` at the build year plus one) is
  injected rather than read from the clock, so the suite does not start failing
  on 1 January.

## Test data

`tests/u1/fixtures/` holds small purpose-built content trees, each named for what
it proves:

| Fixture | Contains |
|---|---|
| `valid-site/` | One post and one project, both complete; the happy path |
| `broken-post/` | A post missing `date` and a post with `date: Sept 23, 2026` |
| `broken-project/` | A project missing three of its six required fields |
| `duplicate-slugs/` | Two posts sharing a slug |
| `with-draft/` | One published post and one carrying `draft: true` |
| `dead-link/` | A post linking to a page that does not exist, and one linking to an unreachable external URL |
| `with-assets/` | A post directory carrying an image beside its `index.md` |

Fixtures are committed, small, and readable. A fixture whose failure message
would not tell you which rule broke is a fixture that needs renaming.

## What is not tested here

- **The six walking-skeleton conditions.** They are proved against the live site
  at Build and Test, not by this suite. `unit-of-work.md` is explicit that U1's
  definition of done is not Code Generation's to write.
- **The keyboard walkthrough.** It is manual, it is the only verification behind
  the mandated WCAG 2.1 AA rule, and it runs on each of the seven page types when
  built and again after U5 applies the styling. `tests/u1/page-renderer.test.ts`
  checks the markup order the walkthrough depends on; it does not replace it.
  The second pass adds two focusable stops to the end of every page — the footer's
  GitHub and email links — and two more to Home's intro block, so the seven
  walkthroughs are due again after it lands.
- **External link reachability.** Never checked on the publish path (BR6.4,
  NFR11), and therefore never asserted here either.
