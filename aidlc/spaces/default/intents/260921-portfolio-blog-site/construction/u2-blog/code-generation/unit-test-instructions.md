# Unit Test Instructions — U2 Blog

Standard test strategy, `feature` scope, test-after ordering. Both obligation
sets apply and neither replaces the other: 5–8 tests per component with
integration at key boundaries, **and** the inherited 80% line-coverage floor.

The runner is already bootstrapped — U1 installed Vitest with V8 coverage and set
`thresholds.lines: 80` in `vitest.config.ts`. Nothing here bootstraps it again;
the exact command below is runnable before the first test of this unit is
written.

## How to run this unit's tests

```
npx vitest run tests/u2 --coverage
```

That is the unit-scoped command. It names this unit's directory explicitly and
runs nothing else, so Build and Test can execute each unit's command without
rerunning the whole suite once per unit.

The unit is not done until the **combined** run is also green, because this unit
changes code U1's suite exercises:

```
npx vitest run tests/u1 tests/u2 --coverage
```

A green `tests/u2` beside a red `tests/u1` is a regression this unit caused, not
a pre-existing failure. Coverage is measured over `src/**`, which is the same
instrumented set U1 measured, so the reported figure is the whole build's — read
it against the 80% floor exactly as U1 did.

## Framework setup

Nothing to install. `vitest`, `@vitest/coverage-v8`, `tsx` and the strict
`tsconfig.json` are in the committed lockfile from U1. Test files are TypeScript
ESM with `.ts` import specifiers, matching the existing suite.

New tests import the existing helpers rather than redefining them:

```ts
import { TEST_SITE, TEST_BUILD_DATE, aPost, expectBuildFailure } from "../u1/helpers.ts";
```

`tests/u2/helpers.ts` holds only what U1's helpers do not already provide — a
fixture-path resolver rooted at `tests/u2/fixtures`, and a small reader for a
built `feed.xml`. Duplicating `TEST_SITE` or `aPost` here would let the two
copies drift, and the CSP string in `TEST_SITE` is deliberately written out so a
drift from BR5.10 fails a test.

## Test files and what each covers

| File | Tests | Covers |
|---|---|---|
| `tests/u2/markup-renderer.test.ts` | 6–8 | BR8.1, BR8.2, FR2.6, FR2.7, NFR2, NFR3 |
| `tests/u2/feed.test.ts` | 6–8 | BR8.3, FR5.1, W4 |
| `tests/u2/page-renderer.test.ts` | 6–8 | BR8.4–BR8.7, FR2.1, FR2.3, FR2.4, FR2.8, FR2.9, FR4.3 |
| `tests/u2/integration.test.ts` | 4–5 | W1–W5, BR4.4, BR4.5, NFR9 |

### `markup-renderer.test.ts`

- Headings, links, and both list kinds render from Markdown.
- An image's `alt` passes through unchanged in all three states — descriptive,
  explicitly empty, and absent — and nothing reports on any of them (BR8.1 is an
  authoring rule the build does not enforce; a test asserting a build failure
  here would silently reverse an approved accessibility position).
- An unlabelled fence renders as a plain code block and contributes no error.
- A fence labelled with a known language emits only `tok-comment`, `tok-string`
  and `tok-keyword` — no fourth class, which is the four-treatment ceiling
  `interaction-spec.md` § Code Block sets.
- An alias label (` ```js `) is known, not an unknown-language error.
- `unknownFenceLanguages` reports a labelled unknown language and reports nothing
  for a known one or for an unlabelled fence.
- Rendered output contains no `<script>`, no inline `style` attribute, and no
  absolute URL to another origin.

### `feed.test.ts`

Pure-function tests. `buildAtomFeed` takes its inputs and returns text; it
touches no file system, no network and no clock.

- Every post in the ordered list appears exactly once, in that order.
- Each entry's `id` is the post's canonical URL built from `baseUrl` (BR8.3).
- Each entry's content is the post's one-line summary; a post whose body carries
  distinctive prose does not put that prose anywhere in the feed.
- A title containing `&`, `<` and `"` is escaped.
- An empty post list yields a well-formed feed with a feed-level `id` and
  `updated` and no entries.
- The feed's `updated` is the newest post's declared date.
- Two calls with identical inputs produce byte-identical output — the assertion
  that no clock is read.

### `page-renderer.test.ts`

- The Writing list emits one row per post carrying title, summary and date, with
  no post twice and none missing (BR8.5).
- Each row contains exactly **one** anchor, wrapping all three values (BR8.6).
  Count the anchors; a row that passes a "the title links" assertion can still
  be three separate links.
- The empty Writing page keeps its heading, shows the sentence, and links to
  Projects (W5, FR2.9).
- A post page carries title, summary, date and body (BR8.7).
- A post page emits exactly **two** "All posts" links, one before the body and
  one after it, both targeting the Writing list (BR8.4). Assert the count and the
  positions, not merely that one exists.
- Home's recent-posts section uses the same row markup as the Writing list
  (FR4.3) — the reason `postRow` is a named include rather than markup written
  twice.
- Every page head carries the feed autodiscovery link.

### `integration.test.ts`

Whole-spine tests against committed fixture trees.

- A site with two published posts and one draft builds; `/feed.xml` is written,
  is recorded in the manifest, and lists both published posts and no draft.
- A post whose body names a fence language the highlighter does not know fails
  the build naming the file and the language, writes nothing at all, and leaves a
  previously written output tree byte-identical (BR8.2, BR4.4, BR4.5).
- A post exercising headings, links, lists, an image and a coloured fence renders
  all five on its page, and no `<script>` appears anywhere in the built output.
- The built site passes all three checks, and the feed's discovery link does not
  break check 3.

## Fixtures

Real content trees on disk under `tests/u2/fixtures/`, for the same reason U1
used them: this build's job is reading files and failing correctly on what it
finds, so a mocked file system would test the mock rather than the rule.

| Fixture | What it carries |
|---|---|
| `feed-site/` | Two published posts with different dates and one draft |
| `unknown-fence/` | One post whose body carries ` ```rustlang ` |
| `rich-post/` | One post exercising headings, links, both list kinds, an image with alt text, an unlabelled fence and a labelled one |

These live in `tests/u2/fixtures/` and never in `content/`. Launch content is
U6's, and the seed post U1 wrote is left alone.

## Mocking and stubbing

Almost none, deliberately.

- **No file-system mock.** Fixtures are real directories; a mock would assert
  against the mock.
- **No clock.** `buildAtomFeed` takes its `updated` value as an argument and
  `buildSite` takes `buildDate`, so no test starts failing on 1 January.
- **No network.** Nothing in this unit reaches one. External URLs in fixture
  bodies are never fetched — NFR11 makes that a property of the system, not of
  the test setup.
- **A temporary output root per test that builds**, via U1's
  `temporaryOutputRoot`. A test run must never leave the author's working tree
  carrying a half-built site, and must never write a build record into a
  committed fixture — pass `manifestPath` explicitly, as U1's tests do.

## Coverage targets

The inherited floor is **80% line coverage**, measured over `src/**` by the
existing Vitest threshold. It is not this unit's to lower: no threshold may be
relaxed and no `coverage.exclude` entry added to make a step pass. If the floor
cannot be met, the gap is surfaced at Build and Test with the measured figure,
never worked around.

Where this unit's new code lives, coverage should be comfortable — `buildAtomFeed`
and `unknownFenceLanguages` are small, pure and branch-light, which is exactly
the shape `team.md` § Testing Posture names as "code that needs unit tests".

## What these tests do not cover, and what does instead

Stated plainly, because "the tests pass" should not be read as more than it is.

- **The keyboard walkthrough.** Tab order, visible focus, the skip link and focus
  traps on the Writing and Post page types are manual, they are the only
  verification behind the mandated WCAG 2.1 AA rule, and they run at Build and
  Test — then again after U5 applies the styling.
- **Colour contrast on the three token classes.** There is no automated
  accessibility scan on this project; the scan was offered at Practices Discovery
  and declined. Contrast is a design-review responsibility when U5 lands.
- **Whether the feed reads well in a real feed reader.** Assumption U2A2. A test
  can assert the document's shape, not whether a one-line summary makes a good
  feed entry.
- **BR8.1, alt text.** No test asserts a build failure for a missing alt,
  because the rule explicitly says the build does not enforce it. Nothing in this
  system detects a missing alt — that is the recorded cost of the declined scan,
  not a gap these tests can close.
