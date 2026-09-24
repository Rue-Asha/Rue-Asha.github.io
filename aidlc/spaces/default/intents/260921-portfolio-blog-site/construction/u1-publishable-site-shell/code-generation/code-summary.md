# Code Summary — U1 Publishable Site Shell

The walking skeleton is implemented and every component in
`inception/domain-design/components.md` exists at minimum depth, reaching from a
file on disk to a written page. All 44 business rules in
`functional-design/rules.md` are implemented; the full local gate passes.

**This document covers two passes over the same unit, and one revision of the
second.** § The revision describes what the current attempt did and is the
authoritative account of how this unit was verified and handed to review.
§ The second pass describes the three markup changes and is the current state of
the code. Everything from § Stack onward is the first pass's record, amended in
place where a later pass made a statement in it untrue. The earlier accounts are
kept rather than overwritten: they are the only record of how these files came to
exist, and a reviewer comparing the plan against the tree needs all three layers.

This unit's first run resumed an earlier one that stopped part-way through
Step 4. Everything it had written was kept; § Inherited work records what was
found and what changed.

## Sources

- [upstream] `functional-design/rules.md` — BR1.1 to BR7.3
- [upstream] `functional-design/entities.md` — the six entities and their bounds
- [upstream] `functional-design/functional-spec.md` — W1 to W7 and the three state machines
- [upstream] `inception/domain-design/components.md`, `decisions.md` — the eight components and ADR-001 to ADR-007
- [upstream] `inception/requirements-analysis/requirements.md` — FR and NFR statements, constraints C1 to C4
- [upstream] `inception/refined-mockups/mockups.md` — the seven page types and the two registers; § Global Shell, § Home and § 404 are what the second pass reconciled the markup against and what the revision re-verified against
- [finding] `construction/u5-visual-direction/code-generation/code-summary.md` § Deviations, items 3 and 4 — raised against U1, closed by the second pass
- [Q1]–[Q4] and assumptions CA1 to CA5, `code-generation-questions.md`

## The revision

**No line of application code changed in this attempt.** The revision was
requested at the gate for two reasons, both recorded verbatim by the human: *"Fix
the stale test count and stop the reviewer writing build output"*. Neither is a
defect in the emitted markup, so the code on disk is the second pass's, verified
rather than rewritten.

### What was verified, and against what

**The three source changes** (Step 1) were read against
`inception/refined-mockups/mockups.md` itself — § Global Shell lines 48–86,
§ Home lines 89–127, § 404 lines 389–413 — rather than against the plan's
description of them. All three are present and correct:

| Change | Mockup it answers | Verified at |
|---|---|---|
| Footer emits the copyright line and both contact links | § Global Shell draws `(c) 2026 · GitHub · email`; its Element table specifies the treatment | `src/page-renderer/shell.ts`, `renderDocument` |
| Home emits the contact row beneath the intro sentence | § Home draws `GitHub · email` at mono 13 directly under the intro | `src/page-renderer/pages.ts`, `renderHome` |
| The 404 message carries `page-note`, the route line `page-routes` | § 404 specifies "sans 17 muted" for that sentence, against About's body prose | `src/page-renderer/pages.ts`, `renderNotFound` |

The `SiteLink` type, the exported `SITE_LINKS` constant and
`renderContactLinks(indent)` are all in place, and the false comment asserting
that the mockups draw the copyright alone is gone.

**The three added tests** (Step 2) are present and are the three specified: the
footer test asserting the copyright line and both contact links with accessible
names on all seven page types, Home's contact row asserted against `SITE_LINKS`
rather than against re-typed literals, and the 404 `page-note` test paired with
the assertion that About's paragraphs stay unclassed. The two slicing helpers
`footerOf` and `homeIntroOf` are present, with their stated reason — a project's
repository URL begins with the same GitHub profile URL the footer links to, so a
whole-document `toContain` would pass on the wrong evidence.

### The counted test figure

**`tests/u1/page-renderer.test.ts` holds 18 tests.** Counted from the file in
this attempt, not carried forward:

```
$ grep -c "^  it(" tests/u1/page-renderer.test.ts
18
```

4 in `PageRenderer — the shell`, 4 in `PageRenderer — head metadata`, 10 in
`PageRenderer — the page templates`. This is the first correction the revision
was requested for. Both the approved plan and `unit-test-instructions.md`
previously carried "7–8 today, 10–11 after" — figures that were never counted but
carried across from the first pass's per-component target. **Both now state 15 →
18**, and the overshoot against the 5–8 band is recorded in both as deliberate
rather than resolved by deleting a test.

### How this pass was handed to review

This is the second correction. The review contract requires the reviewer to run
this unit's validation tools, and two of them write into the workspace root —
the same tree the review receipt is fingerprinted against. The reviewer therefore
invalidated the receipt by doing exactly what it was told to do, and its verdict
could not be recorded; the first attempt hit this and the stage diary records an
earlier run hitting it too, including the finding that clearing the directories
beforehand does not help because the reviewer recreates them mid-review.

The split adopted from this attempt onward is by whether a command writes:

| Command | Writes | Who runs it |
|---|---|---|
| `npx tsc --noEmit` | No | The reviewer, itself |
| `npx eslint .` | No | The reviewer, itself |
| `npx prettier --check .` | No | The reviewer, itself |
| `npx vitest run tests/u1` | No | The reviewer, itself |
| `npx vitest run tests/u1 --coverage` | `coverage/` | Run here; output recorded verbatim below |
| `node --import tsx bin/check.ts` | `dist/`, `.build/` | Run here; output recorded verbatim below |

After both writing commands ran, `dist/`, `coverage/` and `.build/` were removed
so the tree is quiet when the review is requested. All three are gitignored
(`.gitignore` lines 92–94, confirmed with `git check-ignore -v`) and are
regenerated by `npm run build` and `npm run check`; nothing was lost.

**What this costs, stated rather than glossed.** The coverage figure and the
three site-check results reach the reviewer recorded rather than independently
reproduced — a real reduction in the review's independence on two of six checks.
It is accepted because the alternative is a verdict that can never be recorded at
all, and because the reviewer can still read `vitest.config.ts` directly to
confirm the 80% threshold was not weakened, which is the failure mode the
coverage check exists to catch. Build and Test re-runs the whole gate
independently afterwards.

### What the revision did not do

It changed no source file, added no test, touched no dependency, edited no
configuration, and altered no content. It made no change to `traceability.json`'s
coverage rows, because no rule moved and no rule changed status. It did not
switch `renderAbout` to read `SITE_LINKS` — still U4's edit — did not adopt the
two-column Home rail, ran no walking-skeleton condition, and performed no
keyboard walkthrough.

## The second pass

Three things `mockups.md` draws were not in the markup this unit emitted, because
the markup was written against the mockups without the design reference being
consulted at build time. Two had already been raised as findings by U5, which
could not fix them: they are markup, not style. All three are now closed.

**What changed — three files, no new file, no dependency change.**

| File | Change |
|---|---|
| `src/page-renderer/shell.ts` | The exported `SITE_LINKS` constant and `renderContactLinks`; the footer now emits the copyright line and both contact links; the false comment deleted (below) |
| `src/page-renderer/pages.ts` | Home's contact row beneath the intro; `page-note` and `page-routes` classes on the 404 body |
| `tests/u1/page-renderer.test.ts` | Three added tests, taking the file from 15 to 18 |

**The footer.** `mockups.md` § Global Shell draws `(c) 2026 · GitHub · email` and
its Element table specifies the treatment. `shell.ts` emitted the copyright line
alone, beneath a code comment asserting that the mockups draw the copyright
alone. **That assertion was factually wrong**, and it is why U5 wrote a footer
link treatment for links that did not exist. The comment is deleted and replaced
with what the mockups actually draw. The first pass's stated reason for the
omission — that no upstream artifact supplied the two URLs — had also stopped
being true: U4 hard-coded both into `renderAbout`, so the values existed in this
repository and only needed one home.

**Home's contact row.** `mockups.md` § Home draws `GitHub · email` in mono 13
directly beneath the intro sentence. `renderHome` emitted the `h1` and the intro
paragraph and stopped.

**The 404 message.** `mockups.md` § 404 specifies "sans 17 muted" for *That page
does not exist.* while About's paragraphs are full-strength body text. Both
rendered as a bare, unclassed `main > p`, so U5 could not style the difference
and both sat at `--text`. The sentence now carries `page-note` and the route line
`page-routes`. These are hooks only — no stylesheet was edited, and the values
behind them are U5's.

**Where the two contact URLs live.** One exported module constant, `SITE_LINKS`
in `shell.ts`, beside `ROUTES`, `OUTPUT_PATHS`, `STYLESHEET_PATH` and
`FONT_PATH`. Not in `SiteMetadata`: `entities.md` § Additions fixes that entity's
purpose as the values every page's *head* needs, and a visible footer link is not
head metadata. Both call sites read the constant through one shared
`renderContactLinks`, so the footer and Home cannot drift.

**Two markup decisions worth naming.** Each anchor carries an accessible name
that says where it goes (`Rue Asha on GitHub`, `Email Rue Asha at
rue.asha@proton.me`) and that contains its visible text verbatim, so voice
control can still address the link by what it reads (WCAG 2.5.3); the test
asserts that containment rather than trusting it. And no literal `·` is emitted
between the two anchors — a separator glyph welded between links is read aloud by
a screen reader and cannot be respaced by a stylesheet, so the separator is U5's
to draw from the container classes. The anchors are unclassed and the container
carries the hook, which is the convention U5's stylesheet already follows
(`.contact-link a`).

**What the second pass deliberately did not do.** It did not adopt the
two-column Home rail the Mobbin consultation found to be the stronger pattern —
`mockups.md` § Home is explicitly single-column, and changing that is a Refined
Mockups decision, not a code one; the finding is recorded in the plan for the
human. It did not switch `renderAbout` to read `SITE_LINKS`, which is U4's edit
to U4's function, so **the two URLs still have two homes** until U4's own pass
makes that change. It restyled nothing, ran no walking-skeleton condition, and
performed no keyboard walkthrough.

## Stack

As approved in the plan: Node.js 22 LTS with TypeScript and ESM, `tsx` to run,
`tsc --noEmit` to type-check, `markdown-it` + `shiki` + `gray-matter`, Vitest with
V8 coverage, Prettier and ESLint with defaults accepted.

Two dependency changes were made during implementation and are the only
departures from the plan's dependency list:

| Change | Why |
|---|---|
| **Added `js-yaml`** as a direct dependency | See § The YAML schema below. It was already present transitively through `gray-matter`; it is now declared, because this build depends on a specific schema rather than on whatever `gray-matter` happens to use. |
| **Removed `@types/markdown-it`** | `markdown-it` 15 ships its own type definitions. The separate `@types` package describes version 14 and its `Token` type is structurally incompatible, which produced a real `tsc` error. Removing it is the fix; nothing is untyped as a result. |

Neither the second pass nor the revision touched `package.json` or
`package-lock.json`.

## Files created

**Build source** — `src/types.ts`, `src/errors.ts`, `src/content-source.ts`,
`src/post-catalog.ts`, `src/project-catalog.ts`, `src/content-transforms.ts`,
`src/markup-renderer.ts`, `src/page-renderer/shell.ts`,
`src/page-renderer/pages.ts`, `src/site-builder.ts`, `src/check-runner.ts`.

Module boundaries match the component catalogue one-to-one, and the dependency
graph is acyclic in the direction `components.md` draws it.

**Entry points** — `bin/build.ts`, `bin/check.ts`.

**Configuration** — `package.json`, `package-lock.json`, `tsconfig.json`
(strict), `vitest.config.ts` (`thresholds.lines: 80`), `site.config.ts`,
`eslint.config.js`, `.prettierrc.json`, `.prettierignore`, `.gitignore`
(now also ignoring `coverage/`).

**Content** — one seed post and one seed project, so the skeleton serves a real
post page and a real project page.

**Publishing** — `.github/workflows/publish.yml`.

**Tests** — nine files under `tests/u1/`, plus seven committed fixture trees.

## Key implementation decisions

**The YAML schema is pinned, and BR2.3 depends on it.** YAML's default schema
resolves `2026-03-12` to a date value — and resolves `2026-03-12 10:00:00` to a
date value too. `gray-matter` would therefore have handed `PostCatalog` two
indistinguishable objects and quietly destroyed the rule that a value carrying a
time is rejected. `ContentSource` supplies `gray-matter` with a `js-yaml` engine
pinned to the core schema, so the authored text reaches the strict `YYYY-MM-DD`
check exactly as written. `tests/u1/content-source.test.ts` asserts the date
arrives as a string; without that pin, four of the BR2.3 cases would have passed
for the wrong reason.

**Syntax colouring emits classes, not inline styles, because the CSP forbids
them.** BR5.10 fixes `style-src 'self'` with no `unsafe-inline`, and that blocks
inline `style` attributes as well as `<style>` blocks. Shiki's default output is
inline-styled, so it would have rendered as uncoloured text in a real browser
with nothing saying so. `MarkupRenderer` uses Shiki's tokenizer and classifies
each token by its TextMate scope into three class names — `tok-comment`,
`tok-string`, `tok-keyword` — which with unclassified text is four treatments,
the ceiling `interaction-spec.md` § Code Block sets. Colouring still happens at
build time (FR2.7) and nothing runs in the reader's browser (NFR2, NFR3).
Assumption FA5 is therefore narrowed: the policy is compatible with build-time
colouring, and U5 supplies the colours.

**`escapeHtml` deliberately does not escape the apostrophe.** Every attribute
this site emits is double-quoted, so `'` needs no escaping in any position — and
escaping it would rewrite the content-security-policy value, which BR5.10 fixes
character for character and which is full of single quotes. The emitted policy is
now byte-identical to the rule's text.

**Rendering completes in memory before anything is written.** This is how BR4.4
is guaranteed rather than hoped for: by the time the write phase starts, every
content fault has already been found, so a failed build cannot leave a
half-written tree. On success the output directory is replaced rather than
merged, so a page deleted from `content/` stops being served.

**The build manifest is written outside the output tree**, to
`.build/build-manifest.json`. It is a build record, not a page; writing it into
`dist/` would publish it at a real URL. `CheckRunner` uses the manifest object
`buildSite` returns, so check 2 compares against what the build knows it
produced rather than against a re-derivation (ADR-004). The path is injectable so
a test can build a committed fixture without writing a build record into it.

**Checks 2 and 3 are exposed separately from the runner** as `checkBuiltOutput`.
`runChecks` always rebuilds, so a test that damages the output tree and then calls
`runChecks` would have the damage repaired before the check saw it — the two
tests that matter most here would have asserted nothing. Splitting the two
output-reading checks out makes them testable against a deliberately damaged
tree, and `runChecks` is a thin composition over it.

**A `.nojekyll` file is written into the output.** The published tree is an
artifact, not a Jekyll source. GitHub Pages serves `/404.html` for unmatched
paths with no further configuration, which is what makes BR5.6's page the site's
own rather than the platform's default.

**Raw HTML in post bodies is not rendered** (`markdown-it` with `html: false`).
A post is prose; the reusable-include rule (`team.md` § Code Style) is how a post
gets a capability the layout lacks. This also closes the one genuine
vulnerability class a static site can have.

## Inherited work from the interrupted run

All four pre-existing files were read and judged against the plan steps they
belong to.

| File | Verdict | Change made |
|---|---|---|
| `src/types.ts` | Correct and complete. All six entities match `entities.md`; `Project.body` is carried with its reason stated in the file. | None |
| `src/errors.ts` | Correct. `fieldError` makes omitting path or field impossible rather than merely discouraged, which is the right shape for BR4.3. | None |
| `src/content-transforms.ts` | Correct against Step 10 — the five pure functions, no file-system or network access, and no feed stub *as this unit left the file*. U2 has since added real feed construction to it; see § Later units' changes to the files this unit created. | None to its logic; reformatted by Prettier with everything else |
| `package.json`, `tsconfig.json`, `vitest.config.ts` | Steps 1 and 2 genuinely complete. Scripts present, `strict` on, `thresholds.lines: 80` present, and `npx vitest run tests/u1 --coverage` runnable. | `js-yaml` added, `@types/markdown-it` removed, `@eslint/js` added |

Two problems were found and fixed:

- **`coverage/` was not gitignored.** Added beside `node_modules/` and `dist/`.
- **`tsc --noEmit` had not been re-run** since the new files landed and was
  failing on 13 errors once they did — the `@types/markdown-it` conflict, an
  unnarrowed Shiki language type, and a union-typed catch in two test files. All
  are fixed; the type check is clean.

## Test coverage

Methodology was **test-after** on both passes, as the approved Testing Contract
fixes: each layer was implemented, then its tests were written and run before the
layer was treated as done. The revision added no test, so the contract's ordering
had nothing new to order.

### The revision's gate, in two halves

**The four checks that write nothing** (Step 3), each run separately and its exit
status captured:

| Command | Exit | Result |
|---|---|---|
| `npx tsc --noEmit` | 0 | pass, no output |
| `npx eslint .` | 0 | pass, no findings |
| `npx prettier --check .` | 0 | `All matched files use Prettier code style!` |
| `npx vitest run tests/u1` | 0 | 9 files, 85 tests passed |

**The two checks that write** (Step 4), output verbatim.

`npx vitest run tests/u1 --coverage` — exit 0:

```
 RUN  v5.0.1 /home/Rue/Repos/Rue-Asha.github.io
      Coverage enabled with v8


 Test Files  9 passed (9)
      Tests  85 passed (85)
   Start at  19:38:29
   Duration  757ms (tests 47%, transform 24%, import 22%, worker 6%)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
All files          |   94.51 |    85.83 |    97.5 |   95.72 |
 src               |   93.94 |    85.18 |   96.77 |   95.23 |
  check-runner.ts  |   92.94 |    81.13 |     100 |    94.8 | 51,146-150,232
  ...ent-source.ts |   91.08 |    82.22 |   88.88 |   92.39 | ...88,207,268-275
  ...transforms.ts |     100 |    93.18 |     100 |     100 | 132,237,350
  errors.ts        |   81.81 |       75 |     100 |   81.81 | 22,27
  ...p-renderer.ts |      92 |    85.41 |     100 |   95.38 | 192,230,245
  post-catalog.ts  |   91.66 |     87.5 |     100 |   93.33 | 59,106,129
  ...ct-catalog.ts |   96.73 |     92.2 |     100 |   97.59 | 52,58
  site-builder.ts  |   95.65 |    52.94 |    87.5 |   95.65 | 119,150,383
 src/page-renderer |     100 |    95.45 |     100 |     100 |
  shell.ts         |     100 |    91.66 |     100 |     100 | 292
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 94.51% ( 569/602 )
Branches     : 85.83% ( 297/346 )
Functions    : 97.5% ( 117/120 )
Lines        : 95.72% ( 537/561 )
================================================================================
```

`node --import tsx bin/check.ts` — exit 0:

```
1. The site builds ......................... pass
2. Every content file produced a page ...... pass
3. Internal links resolve .................. pass

All three checks passed.
```

### The coverage figure against both bars

| Bar | Figure | Verdict |
|---|---|---|
| The inherited 80% line-coverage floor (`org.md` by `feature` scope) | **95.72%** (537/561 lines) | **PASS**, 15.72 points clear |
| The first attempt of the second pass — 95.72% (537/561) | **95.72%** (537/561) | **Identical**, to the line |

The two runs agree exactly, which is the expected result of an attempt that
changed no code: same 561 instrumentable lines, same 537 covered, same 85 tests
across the same 9 files. A figure that had moved would itself have been the
finding.

`src/page-renderer` is at 100% of lines. The text reporter's per-file table
above lists only `shell.ts` under that directory; `pages.ts` is covered and is
present in the machine-readable summary at **27/27 lines, 100%** — the text
reporter elided the row, it is not a gap. Recorded because a reviewer reading the
table alone would reasonably ask.

**No threshold was relaxed, lowered or disabled, and no `coverage.exclude` entry
was added**, on any of the three attempts. `vitest.config.ts` still carries
`thresholds: { lines: 80 }` and can be read directly to confirm it.

Check 3 passing remains the specific thing worth recording: the footer added two
outbound links to every page of the site, and check 3 deliberately does not
follow external links (BR6.4, NFR11), so a pass confirms the new links did not
become an internal-link failure.

### The second pass's baseline, kept

The baseline was taken against the untouched tree before any edit, exactly so the
after-figure means something; it was green on all five checks.

| Check | Baseline (before) | After the second pass | After the revision |
|---|---|---|---|
| `npx tsc --noEmit` | pass | pass | pass |
| `npx eslint .` | pass | pass | pass |
| `npx prettier --check .` | pass | pass | pass |
| `npx vitest run tests/u1 --coverage` | 9 files, 82 tests | 9 files, **85 tests** | 9 files, 85 tests |
| **Lines** (floor 80%) | **95.68%** (532/556) | **95.72%** (537/561) — PASS | **95.72%** (537/561) — PASS |
| Statements | 94.47% (564/597) | 94.51% (569/602) | 94.51% (569/602) |
| Branches | 85.75% (295/344) | 85.83% (297/346) | 85.83% (297/346) |
| Functions | 97.45% (115/118) | 97.50% (117/120) | 97.50% (117/120) |
| `node --import tsx bin/check.ts` | all three pass | all three pass | all three pass |

Coverage rose against a larger denominator across the second pass and held
exactly across the revision.

**The three added tests were mutation-checked rather than assumed** during the
second pass. Each of the three changes was reverted in turn and the suite re-run;
each reverted change failed exactly its own test and no other, so none of the
three passes vacuously (`construction.md` § Testing Standards). The
implementation was then restored and the full gate re-run. The revision did not
repeat the mutation check, because it changed neither the tests nor the code they
assert against.

**The whole project suite was run once during the second pass** — 22 files, 154
tests, all passing — because `shell.ts` is shared and a change there can break
another unit's assertions. It did not. That run was a cross-unit safety check,
not this unit's recorded command, which remains
`npx vitest run tests/u1 --coverage`.

These are this unit's own figures, measured against `tests/u1` alone. Later units
add their own suites under `tests/u<n>/` and their own lines to the shared `src/`
modules, so a coverage run over the whole tree reports different numbers against
a larger denominator; each unit's own summary records its own run.

| File | Tests | Covers |
|---|---|---|
| `content-source.test.ts` | 10 | BR1.1–BR1.9 |
| `post-catalog.test.ts` | 13 | BR2.1–BR2.4 |
| `project-catalog.test.ts` | 8 | BR3.1–BR3.7 |
| `content-transforms.test.ts` | 9 | BR5.11, the pure functions |
| `markup-renderer.test.ts` | 5 | NFR2, NFR3, FR2.6, FR2.7 |
| `page-renderer.test.ts` | **18** (counted) | BR5.1–BR5.10, NFR1 markup; the footer links, Home's contact row and the 404 message class (second pass) |
| `site-builder.test.ts` | 10 | BR4.1–BR4.5 |
| `check-runner.test.ts` | 9 | BR6.1–BR6.5 |
| `integration.test.ts` | 3 | W1, W2, W4, W7 |

Nine files, 85 tests. The full gate passes: `tsc --noEmit`, `eslint .`,
`prettier --check .`, `vitest run tests/u1 --coverage`, and `bin/check.ts` all
exit zero.

The fail-loudly contract was additionally proved by hand against the real
repository content during the first pass: two deliberately broken files produced
four errors naming file and field, nothing was written, and the previously built
output was byte-identical afterwards.

## Deviations from the plan, and open items

Everything in this section is a departure by *this* unit from *its own* approved
plan. Code that later units added to the files this unit created is not a
deviation by this unit and is not recorded here; it has its own section at the
end of this document, § Later units' changes to the files this unit created.

**One fixture in `unit-test-instructions.md` cannot exist, and BR1.5 is tested
directly instead.** `duplicate-slugs/` would need two same-kind items sharing a
slug — but a slug *is* its own directory name, so they would have to be the same
directory. The rule is implemented and `findDuplicateSlugs` is exported and
tested at the function level. It is a guard that stays correct if a later change
ever lets a slug be declared rather than derived.

**One fixture was added**: `malformed-structure/`, carrying the four structural
faults no listed fixture covered — a directory with no `index.md`, a directory
name that is not a valid slug, unparseable front matter, and a non-boolean draft
mark. Without it, BR1.2, BR1.4, BR1.9 and BR1.6 had no on-disk case.

**The sitemap includes `/404.html`, which is BR5.11 read literally.** The rule
says the sitemap carries an entry "for every page in `BuildManifest.pagesWritten`
except the sitemap itself", and `entities.md` puts 404 in `pagesWritten`
explicitly. Listing an error page in a sitemap is unusual, and the rule was
followed rather than quietly narrowed on SEO taste. **Flagged for Build and Test**
as a one-line change to `buildSitemap` if the rule is meant to exclude it.

**~~The footer carries the copyright line only.~~ CLOSED by the second pass.**
The first pass recorded this as: "`mockups.md` § Global Shell draws
`(c) 2026 · GitHub · email`, but no upstream artifact supplies a GitHub URL or an
email address, and `SiteMetadata` is closed at four attributes by `entities.md`.
Inventing contact details would have been worse than omitting them." That reason
was sound when written and had stopped being true by the time U5 raised it as a
finding: U4 had hard-coded both URLs into `renderAbout`, so the values existed in
this repository. The footer now carries both links from `SITE_LINKS`, and
`entities.md` was not changed — see § The second pass. What survived past its own
justification was not the omission but the **code comment asserting the mockups
drew the copyright alone**, which was false and is why the gap outlived a review.

**Two deviations opened by the second pass, both still open.**

- **`tests/u1/page-renderer.test.ts` is 18 tests, against a stated band of 5–8
  per component.** PageRenderer is one component covering the shell plus seven
  templates, so it was already the widest file in the unit. Cutting an existing
  test to sit inside a soft guideline would drop coverage of an accessibility or
  head-metadata rule, which is the wrong trade. The stale arithmetic that
  accompanied this deviation — "7–8 today, 10–11 after" in both the plan and
  `unit-test-instructions.md` — **is fixed as of the revision**: both now carry
  the counted 15 → 18, and both record the overshoot as deliberate. The
  overshoot itself remains a live deviation; only the wrong numbers describing it
  are gone.
- **Two homes for the two contact URLs**, `SITE_LINKS` and `renderAbout`'s
  literals, until U4's pass switches About to read the constant. Named in the
  plan as a knowingly-left loose end, and repeated here so it cannot be lost
  between the two units.

**One deviation opened by the revision.**

- **Two of the six review checks reach the reviewer recorded rather than
  re-run.** The coverage run and the site-check run write into the workspace and
  therefore invalidate the review receipt if the reviewer performs them, so their
  verbatim output is recorded above and the reviewer scrutinises that instead.
  This is a real reduction in review independence, accepted for the reason given
  in § How this pass was handed to review, and it is a standing property of how
  this unit is reviewed rather than a one-time exception. Build and Test re-runs
  the whole gate independently.

**Home's intro sentence lives in `site.config.ts`**, beside the other editorial
values, rather than inside a template — so changing it is not a code change. It is
not part of `SiteMetadata` and does not extend that entity.

**Sequencing departure, no scope change.** `site.config.ts` and the seed content
(plan Step 22) were written at Steps 5 and 17 respectively, because the Step 5
BR1.1 test asserts against the real repository root and `bin/build.ts` imports the
configuration. Content is identical to what Step 22 specified.

**Carried, unchanged, and still open:**

- **CA4** — the repository's Pages source must be switched from *branch* to
  *GitHub Actions* by hand before anything publishes. No code here can do it.
- **CA5** — the six walking-skeleton conditions are proved at Build and Test
  against the live site, not here. Condition 4 (break it, revert, confirm) in
  particular is untested against the real deployment.
- **FA1 / OQ2** — a removed item's URL becoming a 404, and how the author learns
  that publishing failed after a push. Both are carried forward untouched.
- **The keyboard walkthrough** on all seven page types has not been run. It is the
  only verification behind the mandated WCAG 2.1 AA rule, it is manual, and it
  runs again after U5 applies the styling. **The second pass made this more
  pressing, not less**: the footer adds two focusable stops to the end of every
  page of the site, and Home's contact row adds two more to its intro block, so
  the seven walkthroughs are due again on this markup and again after U5's
  styling lands. The revision changed no markup and so added no new stop, but it
  discharged none of the seven walkthroughs either.
- **The sitemap question** (`/404.html`, and now `feed.xml`) is unchanged by
  either later pass and still flagged for Build and Test.
- **The two-column Home rail**, found by the Mobbin consultation to be the
  stronger pattern for a personal home page's recent-items sections and not
  adopted because `mockups.md` § Home is explicitly single-column. It is a
  Refined Mockups decision first and a markup change second, and it sits with the
  human at the gate.

## Later units' changes to the files this unit created

Added at review iteration 2, because a reviewer reading this document against
today's working tree will find code in `src/` that this document and the plan
both say is not here. It is not here *as this unit's work*; it arrived
afterwards. This section says who wrote what, so the question does not have to be
re-answered each time someone reads U1's records against a moved tree.

**Everything above describes this unit's output as of 2026-09-23 18:29**, when
this file was first written. Five later units have since edited the shared
modules this unit created. They did not fork them; this site is one deployable
with one source tree — constraint C1 settles the deployment model for every unit
at once (`unit-of-work.md` § Sources), and this unit's boundary is "all eight
components, shallowly" — so a later unit deepening a component edits the file
that component already lives in.

| File this unit created | Later unit | What it added |
|---|---|---|
| `src/content-transforms.ts` | U2 | `FEED_OUTPUT_PATH`, `FeedPost`, `buildAtomFeed` (BR8.3, FR5.1, W4) |
| `src/site-builder.ts` | U2 | `fenceLanguageErrors` in the validate phase (BR8.2); the feed built, written and recorded in the manifest, and therefore present in the sitemap |
| `src/markup-renderer.ts` | U2 | the labelled-unknown-language path BR8.2 reverses |
| `src/page-renderer/shell.ts` | U2, U5 | the feed autodiscovery link; the stylesheet and font links |
| `src/page-renderer/pages.ts` | U3, U4 | the Projects and Project pages; the About page |
| `src/site-builder.ts`, `src/assets/` | U5 | the stylesheet and font assets and their copy step |
| `content/` | U6 | a second post and a second project |

**The plan's statement is still true, and so is this document's.**
`code-generation-plan.md` Step 10 and its line "The feed is U2's, and no stub or
placeholder is left for it" describe what this unit built, and they were accurate
when written and remain accurate about this unit's output. The § Inherited work
row reading "no feed stub" is a verdict on the file as *this* unit left it. None
of that is superseded; what the entry above adds is the fact that the file no
longer looks that way, which is a different claim.

**The evidence, so this can be checked rather than believed.**
`<record>/construction/u2-blog/code-generation/source-manifest.json` claims
`src/content-transforms.ts`, `src/site-builder.ts`, `src/markup-renderer.ts` and
`src/page-renderer/shell.ts` among its own writes, and U2's `code-summary.md`
records `FEED_OUTPUT_PATH`/`FeedPost`/`buildAtomFeed`, the fence-language check,
and the feed's appearance in the sitemap as U2's contributions. U2's artifacts
are dated 19:15–19:16 on 2026-09-23; this unit's are dated 18:27–18:29. The
feed's tests are U2's too — `tests/u2/feed.test.ts`, seven tests — and there are
none in `tests/u1`.

**No later unit believes it still owns unbuilt work.** The work
`unit-of-work.md` § U2 assigns to U2 ("the feed", "feed construction") was built
by U2, traced in U2's own `traceability.json`, and tested in U2's own suite.
There is no duplicate implementation and no unit whose plan expects to build a
feed that already exists.

**The behaviour is correct as built.** This is a bookkeeping question about whose
record says what, not a functional one. The build produces a well-formed Atom
feed at `/feed.xml` carrying every published post and no draft, linked for
autodiscovery from every page head; `tests/u2/feed.test.ts` asserts entry
identity, summary-not-body, escaping, the empty-feed case and byte-identical
output across two calls, and the whole suite is green.

**`traceability.json` is deliberately unchanged in its coverage rows.** BR8.2 and
BR8.3 are not this unit's rules: this unit's `functional-design/rules.md` runs
BR1.1 to BR7.3 and contains neither, and both are defined and traced in
`u2-blog`. Adding them to this unit's coverage set would claim rules this unit
does not own and would duplicate U2's entries, which is the failure mode the rule
about settling a gap in the unit that owns it exists to prevent (`project.md`
§ Corrections). The one BR5.11 consequence that *is* this unit's — the sitemap
now listing `feed.xml` alongside `/404.html` — is the same literal reading
already flagged for Build and Test in § Deviations above, with one more instance
rather than a new question.
