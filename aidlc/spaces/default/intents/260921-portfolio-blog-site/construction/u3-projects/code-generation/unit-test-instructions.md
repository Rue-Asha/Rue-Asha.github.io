# Unit Test Instructions — U3 Projects

Standard test strategy, `feature` scope, test-after ordering. Both obligation
sets apply and neither replaces the other: 5–8 tests per component with
integration at key boundaries, **and** the inherited 80% line-coverage floor.

The runner is already bootstrapped — U1 installed Vitest with V8 coverage and set
`thresholds.lines: 80` in `vitest.config.ts`. Nothing here bootstraps it again;
the command below is runnable before the first test of this unit is written.

**This unit is mostly tests.** One source change (a heading level) and three test
files whose job is to hold U1's already-correct templates correct as U4, U5 and
U6 change the same pages. Write them as properties of the rendered markup, not as
assertions about one element in one string, or they will start failing for the
wrong reasons the moment styling lands.

## How to run this unit's tests

```
npx vitest run tests/u3 --coverage
```

That is the unit-scoped command. It names this unit's directory explicitly and
runs nothing else.

The unit is not done until the combined run is also green, because this unit
changes a file both earlier suites exercise:

```
npx vitest run tests/u1 tests/u2 tests/u3 --coverage
```

**Read the coverage figure off the combined run, not the unit-scoped one.** U2
recorded the reason and it applies unchanged here: the Vitest threshold is global
over `src/**`, so a unit-scoped run reports a number that reflects which tests
ran rather than what this unit covers, and it exits 1 on a project whose coverage
is fine. That mismatch is already flagged for Build and Test; do not adjust the
threshold or the instrumented set to make the unit-scoped form pass.

## Framework setup

Nothing to install. Test files are TypeScript ESM with `.ts` import specifiers,
matching the existing suites.

Import the existing helpers rather than redefining them:

```ts
import { TEST_SITE, TEST_BUILD_DATE, aProject, expectBuildFailure } from "../u1/helpers.ts";
```

`tests/u3/helpers.ts` holds only what U1's helpers do not already provide — a
fixture-path resolver rooted at `tests/u3/fixtures`, and a small heading-order
extractor (see below). Duplicating `TEST_SITE` or `aProject` would let the copies
drift.

## The heading-order extractor

Step 2's tests need one shared helper, and it is worth specifying because a weak
version makes the tests worthless:

```ts
/** Every heading level in document order, e.g. [1, 2, 2, 3]. */
export function headingLevels(html: string): number[]
```

Match `<h1>` to `<h6>` opening tags in document order and return their levels.
Then a page has no skip when every level is at most one greater than the previous,
and the first heading is `h1`. Assert that **property**, not a specific sequence —
a test asserting `[1, 2, 2]` breaks the moment U5 or U6 adds a legitimate section,
and a test asserting "no level is skipped" keeps working.

## Test files and what each covers

| File | Tests | Covers |
|---|---|---|
| `tests/u3/heading-order.test.ts` | 3–4 | `project.md` § Mandated (WCAG 2.1 AA), NFR1 |
| `tests/u3/page-renderer.test.ts` | 7–8 | BR9.1, BR9.2, BR9.4, BR9.5, FR3.1–FR3.7 |
| `tests/u3/ordering-parity.test.ts` | 3–4 | BR9.3, U1 BR3.7 |
| `tests/u3/integration.test.ts` | 3–4 | W1–W3, NFR9 |

### `heading-order.test.ts`

- The Projects page emits no heading-level skip.
- Home emits no heading-level skip.
- A project write-up page emits no heading-level skip.
- Every one of those pages emits exactly one `h1`.

Run these against the **full rendered document**, via `renderDocument`, not
against a template's `main` fragment — the shell contributes markup and the
property is about the page a reader actually gets.

### `page-renderer.test.ts`

- The rail emits year, type, tools, repository in that fixed order, live last when
  present (BR9.1). Assert the order of the `<dt>` labels, not just their presence.
- A project with no `liveUrl` emits **no** live row at all — no label, no empty
  value (BR9.1, U1 BR3.5). Assert the rail has four rows, not five with one blank.
- A list row carries exactly **two** anchors (BR9.2). Count them. A row that
  passes "the name links" can still have three targets.
- Neither the summary nor the tools list is a link (BR9.2).
- The repository link's accessible name identifies its project and is never a bare
  "repo" (BR9.2, FR3.6). Assert the project's name appears in the accessible name.
- Every project appears exactly once, each row carrying name, summary, tools and a
  repository link (BR9.4).
- The write-up page emits the rail and the body as **siblings** (BR9.5) — assert
  the rail is not inside the body element, which is the structural commitment U5
  relies on to stack them at phone width.
- The empty Projects page keeps its heading, shows "Nothing here yet." and links to
  Writing (W3, FR3.7).

### `ordering-parity.test.ts`

This is BR9.3's real content: **one order, not two**. `sortProjects` itself is
already tested by U1 — do not re-test it. Test that both pages read it.

- The Projects page lists projects in exactly the order `sortProjects` produces.
- Home's selected-projects section is exactly the first three of that same order.
- Marking a project `featured` moves it on **both** pages, never one.
- `featured` orders and never filters: every project still appears on the Projects
  page whatever its value.

### `integration.test.ts`

Whole-spine tests against committed fixture trees.

- A site with three projects — one featured, one with a `liveUrl`, one without —
  builds and writes a page for each.
- The Projects page and Home agree on order in the built output.
- The rail on the project with no live URL has four rows; the other has five.
- Every project page is reachable from the list, and check 3 passes over the built
  output.

## Fixtures

Real content trees under `tests/u3/fixtures/`, for the same reason U1 and U2 used
them.

| Fixture | What it carries |
|---|---|
| `projects-site/` | Three projects — one `featured: true`, one with `liveUrl`, one without — with different years so ordering is observable |
| `no-projects/` | One post and no projects, so the Projects empty state is reachable in a real build |

These live in `tests/u3/fixtures/` and never in `content/`. Launch content is
U6's.

## Mocking and stubbing

Almost none, deliberately.

- **No file-system mock.** Fixtures are real directories.
- **No clock.** `buildSite` takes `buildDate`; U1's `TEST_BUILD_DATE` is the value
  to pass. BR3.2 bounds a project's `year` at the build year plus one, so a suite
  reading the clock would start failing on 1 January.
- **No network.** Repository and live URLs in fixtures are never fetched — NFR11
  makes that a property of the system, not of the test setup.
- **A temporary output root per test that builds**, via U1's
  `temporaryOutputRoot`, with `manifestPath` passed explicitly so no build record
  is written into a committed fixture.

## Coverage targets

The inherited floor is **80% line coverage**, measured over `src/**`. It is not
this unit's to lower: no threshold relaxed, no `coverage.exclude` added. If the
floor cannot be met, surface the gap at Build and Test with the measured figure.

Expect this unit's own contribution to the figure to be small — it adds one
parameter and no new function. That is the correct outcome for a unit whose work
is verification, and it is not a reason to write tests that inflate a number.

## What these tests do not cover, and what does instead

- **The keyboard walkthrough.** Tab order, visible focus, the skip link and focus
  traps on the Projects and Project page types are manual and run at Build and
  Test, then again after U5. **Expect two tab stops per list row** — that is the
  design (BR9.2), not a defect; a walkthrough that flags it is reading the Writing
  list's rule onto the wrong page.
- **The 44px outbound-link target.** U5's BR11.1, not this unit's, and not
  assertable from markup.
- **Colour contrast and the rail's visual layout.** U5's, and there is no
  automated accessibility scan on this project — the scan was offered at Practices
  Discovery and declined.
- **Whether a repository link still resolves.** Nothing detects a renamed, private
  or deleted repository (U3OQ1, NFR11). A deliberate exclusion, not a gap.
- **Heading order on pages U4 and U6 add or rewrite.** The property test covers
  the pages that exist now; a page type added later needs its own row in that test.
