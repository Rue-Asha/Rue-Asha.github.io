# Integration Test Instructions

Test Strategy is `Standard` (`aidlc-state.md`), which calls for unit tests plus
integration tests at key boundaries. Unit tests are covered per unit by Code
Generation; this file covers the cross-unit boundaries.

## What the boundaries are

This system is one deployable with no network calls, no database, and no
external services, so "integration" here means the seams between units rather
than between processes. Four seams carry real risk:

| Seam | Units | Why it can break |
|---|---|---|
| Content boundary → catalogues | U1 → U2, U3 | `content-source.ts` decides what is a post, what is a project, and what is a draft. Both catalogues consume its output; a change to the boundary silently changes both lists. |
| Catalogues → page renderer | U2, U3 → U1 | Ordering, summary derivation and slug construction are computed once and rendered in several places. Home and Writing must agree on post order; Home and Projects must agree on project order. |
| Renderer → site builder | U1 → all | Every page type must be emitted, and every emitted page must appear in the manifest, the sitemap, and (for posts) the feed. |
| Stylesheet → markup | U5 → U1, U2, U3, U4 | The stylesheet targets classes the templates emit. A renamed class breaks presentation with no build error. |

## How to run them

The integration tests live alongside the unit tests, one `integration.test.ts`
per unit directory, and run with the same command:

```sh
npm test
```

which is `vitest run --coverage` across every `tests/**/*.test.ts`. To run only
the integration files:

```sh
npx vitest run tests/u1/integration.test.ts tests/u2/integration.test.ts tests/u3/integration.test.ts tests/u4/integration.test.ts tests/u5/integration.test.ts
```

## Test data

Each unit carries its own fixture corpus under `tests/u<n>/fixtures/`, built as
a miniature `content/` tree. The fixtures deliberately include malformed and
draft content — `broken-post`, `broken-project`, `malformed-structure`,
`with-draft`, `dead-link` — so the failure paths are exercised rather than
assumed. Helpers in each unit's `helpers.ts` build a site from a named fixture
and return the output for assertion.

Fixtures are never shared between units by import. A unit that needs a corpus
carries its own, so changing one unit's fixture cannot silently change another
unit's expectations.

## Coverage expectation

Standard strategy: five to eight tests per component, plus the 80% line floor
inherited from `org.md` by scope. The floor is measured over `src/**` on the
combined run, not per unit directory — a unit-scoped run reports coverage of
the whole source tree against only that unit's tests and will read low.

## Ordering parity

`tests/u3/ordering-parity.test.ts` exists specifically because Home and the
list pages derive their ordering independently. If one is changed and the other
is not, that test fails rather than the two views quietly disagreeing in
production.
