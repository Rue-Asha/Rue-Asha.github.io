# Unit Test Instructions — U5 Visual Direction

Twelve tests across three files: four on the rendered head, **six** on the
stylesheet source, two against a real build. The runner, its configuration and
the coverage threshold were bootstrapped by U1; nothing here sets them up again,
and `vitest.config.ts`'s `thresholds.lines: 80` is never adjusted to make a step
pass.

**Second pass.** The first pass wrote ten of these. This pass adds two to
`stylesheet.test.ts`, one for each of the two stylesheet changes § Mobbin
consultation in the plan produced. Nothing already written is changed or removed.

## How to run this unit's tests

```bash
npx vitest run tests/u5 --coverage
```

Runnable before the first test is written — U1 installed vitest and its
configuration. Verify against an existing unit (`npx vitest run tests/u1`) if
the toolchain has not been exercised in this session.

The whole suite, where the 80% line floor is measured:

```bash
npx vitest run tests/u1 tests/u2 tests/u3 tests/u4 tests/u5 --coverage
```

**A `tests/u5`-only run reports coverage below the floor and exits non-zero.**
That is the global threshold applied to a partial run, not a failure of this
unit. Read the per-file rows; the combined command measures the floor.

## What is being tested, and what is honestly not

This unit's eight rules are mostly verified by a human looking at a screen.
`functional-spec.md` says so outright, and this file does not pretend otherwise.
These tests cover the part a script can genuinely settle: that the right
elements are emitted, that nothing off-origin appears, and that the stylesheet
contains the rules it claims to.

**These tests do not assert a contrast ratio, a rendered pixel height, a tab
order, or a focus trap.** Asserting those against a string of HTML or CSS would
measure an approximation and report confidence the site has not earned. The
keyboard walkthrough and the phone-width measurement are the real verification,
and they are plan Steps 12 and 13.

## Shared helpers

`tests/u5/helpers.ts` imports rather than redefines:

- `TEST_SITE`, `TEST_BUILD_DATE`, `temporaryOutputRoot` — from
  `../u1/helpers.ts`. `TEST_SITE` carries the content-security-policy string
  BR5.10 fixes character for character.
- `renderDocument` and the page renderers — from `../../src/page-renderer/`.

It exports:

- `readStylesheet()` — the source of `src/assets/styles/site.css`, read from
  disk. The stylesheet is data to these tests, not a module.
- `headLinks(html)` — every `<link>` in the document head, as
  `{ rel, href, as, type, crossorigin }` records.
- `allUrls(html)` — every `href` and `src` the document emits, each tagged with
  whether it came from an anchor. Anchors are where outbound links legitimately
  appear; everything else must be same-origin.
- `everyPage()` — one rendered document per page type, so a property can be
  asserted across all seven rather than on a sample.

## Test files and what each covers

### `head.test.ts` — four tests

| # | Test | Rule |
|---|---|---|
| 1 | Every page type carries exactly one `<link rel="stylesheet">`, with a root-relative href | BR11.3 |
| 2 | Every page type carries the font preload link, with `as="font"`, `type="font/woff2"` and `crossorigin` | BR11.2 |
| 3 | No page contains a `<style>` block, a `style=` attribute, or a `<script>` of any kind | BR11.4, and the policy's absent `'unsafe-inline'` |
| 4 | Every `href` and `src` outside an anchor is same-origin or document-relative | BR11.4 |

Tests 1, 2 and 4 run across **all seven page types**, not one sample. A
stylesheet link present on six pages and missing on the seventh is exactly the
kind of fault a single-page test misses.

Test 2 is skipped with an explicit reason, not silently, if the [Q1] contingency
applied and no font file landed. A skipped test that says why is honest; a test
quietly deleted is not.

### `stylesheet.test.ts` — six tests

| # | Test | Rule |
|---|---|---|
| 1 | Every token named in `design-system-mapping.md` is declared exactly once in the `:root` block, with its documented value | The design system is implemented literally |
| 2 | No `@import`, and no `url()` pointing at another host | BR11.4 |
| 3 | Exactly one width `@media` query, plus the `prefers-reduced-motion` query which sets the transition to `none` | BR11.6 |
| 4 | `outline: none` never appears without an accompanying indicator, and no `:focus-visible` rule removes the ring | BR11.7 |
| 5 | **New.** `.project-rail a` carries `text-decoration: underline` in its own rule, not only under a `:hover` selector | BR11.7, NFR1 |
| 6 | **New.** `.prose` declares an `overflow-wrap` value that permits a break | NFR6 |

Test 5 is a regression guard as much as an assertion. The underline moving back
to `:hover` would restore a colour-only distinction between a rail link and the
plain value beside it, and nothing else in the suite would notice — the page
would still build, still pass every check, and still look almost identical in a
screenshot.

Test 6 asserts the declaration, not a rendered width. A layout assertion here
would be measuring a headless approximation; the real check is loading a post
with a long URL at phone width, which is plan Step 9.

Test 1 is the one that makes "the design system is the source of truth" checkable
rather than asserted. It lists the token names and values explicitly in the test
file, so a change to either the stylesheet or the design document without the
other is a failing test rather than a silent drift.

Test 3 counts width queries rather than matching a specific breakpoint value, so
changing the breakpoint is allowed and adding a second one is not.

### `integration.test.ts` — two tests

Both build a real site into a temporary output root (`temporaryOutputRoot()`,
which uses the OS temp directory — nothing is written inside the repository).

| # | Test | Rule |
|---|---|---|
| 1 | The stylesheet, and the font file when present, are written into the output at the exact paths the head elements reference | BR11.3, BR11.4 |
| 2 | Every emitted HTML page references both | BR11.3, BR11.2 |

Test 1 is the one that catches a page linking a stylesheet the build forgot to
copy — a fault that leaves every page unstyled in production while every unit
test still passes.

## Fixtures

Reuse an existing fixture rather than adding one: this unit's assertions are
about the head and the output, not about content. The integration tests build
from the repository's own `content/` tree, which the three blocking checks
already exercise.

## Mocking and stubbing

None. The stylesheet is read from disk as text and the build runs for real. A
mocked build would not prove the thing test 1 exists to prove.

## Coverage targets

The files this unit changes are `src/page-renderer/shell.ts` (two head
elements) and `src/site-builder.ts` (the asset copy). Both are exercised by
every existing suite as well as this one, so the combined run carries them well
above the floor. `site.css` is not instrumentable — it is not code — and is
covered by the assertions in `stylesheet.test.ts` instead.

## What these tests do not cover, and what does instead

| Not covered here | Covered by |
|---|---|
| Colour contrast | Nobody, unless the author re-measures the table (BR11.5). The automated scan was declined |
| Tab order, focus traps, focus ring visibility | The keyboard walkthrough on all seven page types, after styling (plan Step 8) |
| Hit areas at phone width | A measurement during the walkthrough (plan Step 9) |
| The phone contraction behaving as a contraction, including a long URL not widening the page | Loading each page type at phone width (plan Step 9) |
| Whether the `↗` outbound mark is present on rail links | Reading the built output (plan Step 7); if absent it is a finding for U3, whose markup owns it |
| That the font actually swaps without hiding text | A cold-cache load, watched by the author |
| That no request goes off-origin on a live page | The network panel, and the reader's browser enforcing the policy |
