# Code Summary — U4 About Page

One function body and three test files. The plan called this the smallest unit
in the set and warned that its real risk is being treated as trivial; what
follows records what was built, what was decided, and the one step that is not
done.

## The third pass — the review repairs

`reviews/review-04.md` returned NOT-READY with four findings. This pass addresses
those and nothing else; the approved plan is unchanged and untouched.

**R-01 (Critical) — the manifest was under-claimed.** `source-manifest.json`
claimed two paths for a unit that verifiably touches more. The plan's Step 7
narrowed it to "this pass"; the stage contract scopes it to the unit, and the
contract wins. The manifest now lists every application-source path this unit
created or modified, each verified present on disk and none of them gitignored:
`src/page-renderer/pages.ts`, `src/page-renderer/shell.ts`,
`tests/u4/about.test.ts`, `tests/u4/helpers.ts`, `tests/u4/integration.test.ts`
and `tests/u4/fixtures/minimal-site/content/posts/a-post/index.md`.
`git check-ignore` was run against all six.

**R-02 (Major) — the deduplication now goes all the way.** Both anchors' visible
text is derived from `SITE_LINKS` rather than typed out again. The second pass's
reasoning examined only `SITE_LINKS.github.label` (`GitHub`), found it wrong for
this page and stopped; it never reached `accessibleName`, which is
`Rue Asha on GitHub` — character for character the string `renderAbout` was
hardcoding. So the `href` duplication closed and the string duplication stood.

The two links read **different fields**, and the asymmetry is now documented
both in the doc comment and inline at the two lines themselves:

| Link | Field read | Why that field |
|---|---|---|
| GitHub | `accessibleName` — `Rue Asha on GitHub` | For this link the string that names the destination *is* the accessible name. `label` is `GitHub`, tuned for the footer's micro-type row and too bare for BR10.2 here. |
| Email | `label` — `rue.asha@proton.me` | The destination *is* the address, so the label is both. `accessibleName` is `Email Rue Asha at …` — the right announcement for the footer, the wrong thing to print in this paragraph, and U4CA2 and BR10.2 fix the address itself as what the reader sees. |

**The rendered HTML did not move.** Both substituted strings are free of
characters `escapeHtml` rewrites, so the two anchor lines are byte-identical to
what shipped before this pass — confirmed by rendering `renderAbout` and matching
both lines against their previous exact text, and by the existing tests that pin
both `href` values and both visible strings, all of which pass unmodified. No
test was adjusted to accommodate the change.

**R-03 (Major) — a false statement removed from source.** `SITE_LINKS`'s doc
comment in `src/page-renderer/shell.ts` still said `renderAbout` carried its own
literals and that the two URLs therefore had two homes. Untrue since the second
pass, and sitting in the exact place a reader checks to learn whether the
duplication is open. It now states the true position — footer, Home's intro row
and About all read the constant, so each URL has one home — and points at
`renderAbout` for the field asymmetry above. Comment text only: `SITE_LINKS`'s
values, `SiteLink` and `renderContactLinks` are untouched. This is a deviation
from the plan; see § Deviations from the plan.

**R-04 (Minor) — escalated rather than noted again.** See § Escalated to Build
and Test.

## The second pass, and why there was one

The unit was re-entered because `project.md` § Corrections now requires the
design reference to be consulted before Plan Approval for any unit that renders
UI, and that had never happened for any unit here. The Mobbin consultation is
recorded in the plan, not repeated here. It produced three outcomes, and exactly
one of them was a code change:

1. **One change, made.** `renderAbout` now reads both contact URLs from
   `SITE_LINKS` in `shell.ts` rather than carrying its own literals. Below.
2. **One deviation, corroborated rather than reversed.** U4CA4 — the two links as
   separate block-level elements rather than the row `mockups.md` § About draws.
   The references set elsewhere entries one per line; the only one that uses a
   row uses icon buttons, which `project.md` § Forbidden rules out. The
   assumption stops being a guess made against the design.
3. **One finding, not applied.** Labelling each elsewhere row (`Website
   liviafalcaru.com`) is a § About redraw, not a code change. It is the human's
   to weigh.

Everything else the first pass delivered was verified against `mockups.md`
§ About and left alone: one `h1`, the `h2` reading `Elsewhere`, three paragraphs
of prose beneath it, both links naming their own destinations, and the two links
as separate block-level elements.

## Files created and modified

| Path | Change | Pass |
|---|---|---|
| `src/page-renderer/pages.ts` | Modified — `renderAbout`'s body and doc comment replaced; `ABOUT_PROSE` added beside it | First |
| `src/page-renderer/pages.ts` | Modified — both contact `href`s now read from `SITE_LINKS`; doc comment records where they come from | Second |
| `tests/u4/helpers.ts` | New — the rendering helper and the markup extractors this unit's tests share | First |
| `tests/u4/about.test.ts` | New — six tests on the rendered markup | First |
| `tests/u4/about.test.ts` | Modified — a seventh test pinning both `href`s to `SITE_LINKS` | Second |
| `tests/u4/integration.test.ts` | New — two tests against a real build | First |
| `tests/u4/fixtures/minimal-site/content/posts/a-post/index.md` | New — one valid post, no projects | First |
| `src/page-renderer/pages.ts` | Modified — both anchors' visible text now derived from `SITE_LINKS` too; the field asymmetry documented | Third |
| `src/page-renderer/shell.ts` | Modified — `SITE_LINKS`'s doc comment corrected; comment text only | Third |

`src/site-builder.ts` and `site.config.ts` were read and left unmodified in every
pass. `src/page-renderer/shell.ts` was read-only through the first two passes and
is modified in the third, for the reason recorded under § Deviations from the
plan. All six paths above are claimed in `source-manifest.json`.

## What the page now emits

```
<h1>About</h1>
<p> … three paragraphs of prose … </p>
<h2>Elsewhere</h2>
<p class="contact-link"><a href="https://github.com/Rue-Asha" rel="noopener noreferrer">Rue Asha on GitHub</a></p>
<p class="contact-link"><a href="mailto:rue.asha@proton.me">rue.asha@proton.me</a></p>
```

**Byte-identical to what the first pass emitted, across all three passes.** The
second pass interpolated the two `href` values from `SITE_LINKS` instead of
typing them into the template; the third did the same for both anchors' visible
text. Nothing else about the markup changed in either — same anchors, same
visible text, same accessible names, same order, same separate block-level
elements. The existing tests, which pin both `href` values and both visible
strings, are the regression check that says so, and they passed unmodified.

The prose is the text the plan drafted at [Q1] answer A, verbatim. The two links
are [Q2] answer B and its follow-up.

## Key implementation decisions

**The prose is a module-level `readonly string[]`, mapped into paragraphs.**
One entry per paragraph, each passed through `escapeHtml` on the same path as
every other template string. It is a constant rather than a parameter because
BR10.1 puts it in the template: nothing reaches this page from outside, so
nothing on it can be absent.

**Both contact links are written out as two literal lines rather than generated
from a table.** A `ContactLink` record with an `external` flag would have
introduced a branch at the leaf, and `frontend-components.md` § Props and
branches gives every one of this page's components `none`. Two literal lines keep
that true — "there is no branch anywhere in the function" is a property a reader
can check by looking, not one that depends on a flag always being set correctly.
The second pass did not change this: it replaced two URL strings with two
interpolations and left the two lines, and the loop over `SITE_LINKS` that would
have made them one line is exactly the branch-at-the-leaf this paragraph rejects.

**Both destinations are read from `SITE_LINKS`, and this was U4's change to
make.** U1 introduced that constant in `shell.ts` for the footer on every page
and for Home's intro row, and recorded in the constant's own doc comment that
`renderAbout` still carried its own copies — naming it as U4's edit to U4's
function specifically so it could not fall between the two units. Until this pass
the site rendered those two URLs in three places, two derived from one constant
and the third typed out separately; the first time one of them changed, About is
the one that would have been missed, and nothing would have said so.

**Since the third pass the visible text comes from the constant as well**, each
link reading the field that actually holds its destination-naming string:
`accessibleName` for GitHub, `label` for email. The second pass stopped at
`label` for both, found it wrong for GitHub, and left that string as a fourth
literal — the half-finished deduplication R-02 caught. The table in § The third
pass records which field each link reads and why, and the same reasoning is in
the function's doc comment and inline beside the two lines.

This is still an interpolation of two strings rather than a call to
`renderContactLinks`: that function emits the footer's labels with its
`aria-label` treatment, which is not what this page renders.

**`rel="noopener noreferrer"` on the GitHub link, nothing on the `mailto:`.**
The attribute is inert on a `mailto:`, and adding it uniformly would have
required the branch the previous paragraph avoids. On the GitHub link it matches
the convention U3's repository and live-site links already established, and
`noreferrer` withholds the referring page from GitHub — consistent with this
project's exclusion of third-party tracking.

**No outbound `↗` marker on either link.** U3's row links carry one, but they
also carry an `aria-label` to repair the bare label underneath it. Here the
visible text *is* the accessible name and already names the destination
(U4CA3), so an arrow would only add a character a screen reader announces. The
design calls these "plain links" three times; they are plain.

**The `siteName` parameter is kept.** This is the plan's one declared deviation
from `frontend-components.md`, which lists `AboutPage` with no props (U4CA5). It
feeds the head `description` string alone — no prose, no link, no branch.
Dropping it would put the site's name in a second place that can drift from
`site.config.ts`.

**Helpers are computed from the markup, not asserted against fixed strings.**
`anchors()` derives an accessible name (its `aria-label` when present, its
visible text otherwise), `mainParagraphs()` is scoped to the `main` landmark so
the footer's copyright line is not mistaken for the page's prose, and
`offOriginResources()` deliberately ignores anchor `href`s — a link the reader
chooses to follow is not a resource their browser fetches while they read. That
distinction is what lets test 6 assert "nothing is fetched from another server"
on a page whose whole point is an off-site link.

**`TEST_SITE`, `TEST_BUILD_DATE` and `temporaryOutputRoot` are imported from
`../u1/helpers.ts`**, following `tests/u2/helpers.ts` and `tests/u3/helpers.ts`.
`firstHeadingSkip`, `countLevelOneHeadings` and `headingLevels` are duplicated
from U3's helpers rather than imported: U3 owns them as its own unit-local
helpers and does not export them across unit boundaries, and reaching into
another unit's suite for them would couple the two. This is noted as a small
duplication rather than hidden — see Concerns.

## Test coverage

The seventh test is the second pass's: it slices the `main` landmark out of the
rendered document, collects the `href` of every anchor in it, and asserts the
sequence equals `[SITE_LINKS.github.href, SITE_LINKS.email.href]` — compared
against the constant, never against a string spelled out in the test, so the test
cannot agree with a stale copy. It also checks the two literals the older tests
in the file pin against the same constant, which stops tests 3 and 4 asserting a
URL the site no longer uses while still passing.

| Command | Result |
|---|---|
| `npx vitest run tests/u4` | 2 files, **9 tests, all pass** (7 unit, 2 integration). With `--coverage` it exits non-zero on the global 80% line threshold applied to a partial run, exactly as `unit-test-instructions.md` predicts. |
| `npx vitest run tests/u1 tests/u2 tests/u3 tests/u4` | 19 files, **148 tests, all pass**. |
| `npx vitest run tests/u1 tests/u2 tests/u3 tests/u4 --coverage` | 19 files, **148 tests, all pass**. Lines **96.25%** (540/561) against the 80% floor. |

Nine tests — seven unit, two integration. The Standard strategy's band is five to
eight tests per component; the seventh unit test sits at its top edge, and the
two integration tests are the strategy's separate "integration tests for key
boundaries" obligation rather than part of that band.

### The gate, verbatim — re-run in full after the third pass

The whole gate was re-run after the repairs. The four that write nothing are in
§ The blocking checks and the toolchain; the two that write into the workspace
are recorded verbatim below, per the plan's § How this pass is reviewed. Both
passed. `dist/`, `coverage/` and `.build/` were then removed (plan Step 6), so
the reviewer reads this record rather than re-running these two and rewriting the
tree its own verdict is fingerprinted against.

`npx vitest run tests/u1 tests/u2 tests/u3 tests/u4 --coverage`:

```
 Test Files  19 passed (19)
      Tests  148 passed (148)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
All files          |   95.18 |    87.28 |    97.5 |   96.25 |
 src               |   94.67 |    86.72 |   96.77 |   95.83 |
  check-runner.ts  |   92.94 |    81.13 |     100 |    94.8 | 51,146-150,232
  ...ent-source.ts |   91.08 |    82.22 |   88.88 |   92.39 | ...88,207,268-275
  ...transforms.ts |     100 |    95.45 |     100 |     100 | 132,237
  errors.ts        |   81.81 |       75 |     100 |   81.81 | 22,27
  ...p-renderer.ts |      96 |    93.75 |     100 |   98.46 | 245
  post-catalog.ts  |   91.66 |     87.5 |     100 |   93.33 | 59,106,129
  ...ct-catalog.ts |   96.73 |     92.2 |     100 |   97.59 | 52,58
  site-builder.ts  |    97.1 |    52.94 |    87.5 |    97.1 | 119,383
 src/page-renderer |     100 |    95.45 |     100 |     100 |
  shell.ts         |     100 |    91.66 |     100 |     100 | 295
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 95.18% ( 573/602 )
Branches     : 87.28% ( 302/346 )
Functions    : 97.5% ( 117/120 )
Lines        : 96.25% ( 540/561 )
================================================================================
```

**Measured line coverage 96.25%, against the 80% floor. Met, with 16.25 points of
margin.** Every figure is unchanged from the second pass's run — the repairs moved
no executable line. The one difference in the table is `shell.ts`'s uncovered line
number, `292` before and `295` now: the same unreached line, displaced by the
three comment lines R-03's correction added above it.

`vitest.config.ts` still carries `thresholds: { lines: 80 }` unchanged and no
`coverage.exclude` entry was added — the floor was not moved to make this pass.

`src/page-renderer/pages.ts` does not appear as its own row above because the
text reporter omits a file at 100% on every metric. It is **100% of lines
(27/27)** in `coverage/coverage-summary.json` from that same run, so `renderAbout`
and `ABOUT_PROSE` are fully covered.

`node --import tsx bin/check.ts`:

```
1. The site builds ......................... pass
2. Every content file produced a page ...... pass
3. Internal links resolve .................. pass

All three checks passed.
```

All three blocking checks pass. Exit status 0.

## The blocking checks and the toolchain

Every row below was re-run after the third pass's repairs and passed.

| Command | Result |
|---|---|
| `npm run build` | pass — 9 pages into `dist/` |
| `npm run check` | pass — all three blocking checks (output above) |
| `npx tsc --noEmit` | clean |
| `npx eslint .` | clean |
| `npx prettier --check .` | clean — "All matched files use Prettier code style!" |

## Deviations from the plan

**One of substance, taken deliberately.** Four things worth recording:

1. **`src/page-renderer/shell.ts` was modified, and the plan says it is not.**
   The plan's repository layout states "Nothing else is touched" and designates
   `shell.ts` read-but-not-modified; the third pass changed its `SITE_LINKS` doc
   comment anyway, to close R-03. The reason, stated plainly: the comment asserted
   something untrue about this codebase's own structure, in the one place a reader
   goes to find out whether the two URLs are still duplicated, and every unit that
   reads `shell.ts` would keep seeing it. A comment-only correction to a false
   statement is a smaller harm than leaving the falsehood in the file. The
   previous pass's reason for not fixing it was the plan's own write-scope
   restriction, which was self-imposed rather than argued — the plan never says
   reading-only was load-bearing to the unit boundary. The change touches comment
   text alone: `SITE_LINKS`'s values, the `SiteLink` interface and
   `renderContactLinks` are byte-unchanged, and `shell.ts` is claimed in
   `source-manifest.json`.
2. **`source-manifest.json` is unit-scoped, not pass-scoped.** The plan's Step 7
   instructs it to list exactly the two paths this pass touched. The stage
   contract requires every application-source path the unit created, modified or
   deleted, and the contract wins over a plan step that contradicts it. The
   manifest now lists six paths.
3. The first pass's Step 4 lists six numbered assertions; its item 5 and its
   placeholder clause are delivered as one test ("emits non-empty paragraphs,
   none of them U1's placeholder") rather than two, which is what the plan's
   own wording describes. The file had exactly six `it` blocks; it now has seven.
4. The keyboard walkthrough is **not done**. It is a manual check performed by
   the author and nothing automated substitutes for it. The dispatch is explicit
   that it must not be performed or claimed here, and it is not.

## Deviations from the design

**U4CA5 — `renderAbout` keeps its `siteName` parameter.** The standing deviation
from `frontend-components.md` § Props and branches, which lists `AboutPage` with
no props. It feeds the head `description` string alone — no prose, no link, no
branch — and dropping it would put the site's name in a second place that can
drift from `site.config.ts`. Unchanged by the second pass.

**U4CA4 — the two links are separate block-level elements, not the row
`mockups.md` § About draws. Now corroborated rather than assumed.** The first
pass recorded this as an assumption resting on NFR7: two links side by side on a
phone cannot each clear the 44px touch minimum without the row wrapping
unpredictably. The Mobbin consultation found the references agree with the code
rather than the mockup — Harvest's bio block and the GitHub ReadME profile both
set elsewhere entries one per line, and the single reference that uses a row uses
circular icon buttons, a form this site cannot take because an icon set is a
third-party asset and `project.md` § Forbidden bars any off-origin resource at
page load. Recorded rather than quietly carried, because a deviation that
survives two passes unexamined is how a design drifts.

**Not applied: labelled elsewhere rows.** Harvest puts a muted label before each
value (`Website liviafalcaru.com`). `mockups.md` § About draws bare links and
BR10.2 requires each link's visible text to name its own destination precisely so
no surrounding prose is needed. Both approaches are coherent; adopting labels
would be a § About redraw and is the human's call, not a code change made here.

## Escalated to Build and Test

**`package.json`'s `test` script measures the coverage floor against a partial
suite, and this is now the third unit to say so.** It reads:

```json
"test": "vitest run tests/u1 tests/u2 --coverage"
```

It has not named `tests/u3` since U3 landed and does not name `tests/u4` either,
so anyone running `npm test` measures the 80% line-coverage floor over a run that
excludes two units' tests — and a partial run is exactly the one that trips the
global threshold for reasons unrelated to a real coverage failure, as
`unit-test-instructions.md` documents. The combined command recorded in this
document is what actually measures the floor; `npm test` does not.

**The exact change:**

```json
"test": "vitest run tests/u1 tests/u2 tests/u3 tests/u4 --coverage"
```

**It is Build and Test's to make, not any single unit's.** `package.json` is
outside every unit's write scope, and the script is the one command that reports a
figure for the *whole* suite — so the defect affects every unit's reported
coverage, not U4's. U3 disclosed it, U4's second pass disclosed it, and a third
per-unit footnote would be the same information arriving in a place that cannot
act on it. Raised here as a named cross-unit item rather than a note. It also
needs extending again as U5 and U6 land, which is an argument for a glob over an
enumeration.

## Concerns handed forward

**Closed: `SITE_LINKS`'s doc comment in `shell.ts`.** The second pass left it
asserting that `renderAbout` still carried its own literals, which had stopped
being true in that same pass. R-03 caught it and the third pass corrected it; the
comment now states that the footer, Home's intro row and About all read the
constant. Recorded as closed so it is not carried forward again — and see
§ Deviations from the plan for the write-scope deviation the fix required.

**Closed: `src/page-renderer/pages.ts`'s module doc comment.** The first pass
flagged it as still describing About's prose as a placeholder. It no longer does;
the word appears nowhere in `src/` as of this pass. Left here as a closed item so
the concern is not carried forward a third time.

**The first About paragraph duplicates `homeIntro` in `site.config.ts` word for
word.** That is the approved [Q1] text and is an editorial choice, but the two
copies can now drift. Cheap to live with; worth knowing about.

**Heading-order helpers exist in two suites.** `firstHeadingSkip`,
`countLevelOneHeadings` and `headingLevels` are now in both
`tests/u3/helpers.ts` and `tests/u4/helpers.ts`. If U5 or U6 needs them a third
time, they have earned a shared test-helper module.

**Nothing automated checks colour contrast, and nothing ever will on this
project.** The automated accessibility scan was declined at Practices Discovery.
For this page type, `tests/u4/about.test.ts` covers heading structure and link
names; everything else in that bar rests on the Step 9 walkthrough, which runs
again after U5's styling.
