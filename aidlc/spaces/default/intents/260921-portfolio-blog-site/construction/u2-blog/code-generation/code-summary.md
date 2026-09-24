# Code Summary — U2 Blog

> **Two passes.** The first pass built this unit and its gate was green. The
> second pass exists because `project.md` § Corrections added a rule after that
> gate — consult the design reference before Plan Approval for any unit that
> renders UI — and no unit had been checked against it. § Second pass records
> what that check found, the one correction it produced, and the re-run gate.
> The first pass's narrative below is unchanged except for the marked correction
> under § Key implementation decisions.

The post half of the site is complete. All seven of this unit's business rules
(BR8.1 to BR8.7) are implemented or verified, the feed exists, and the full local
gate passes: 13 test files, 109 tests, 96.15% line coverage against an 80% floor,
and all three blocking checks green.

The headline is how little new code this took. U1 built the Writing list, the post
page and the code-block colouring at skeleton depth, and this unit's own reading
of those templates against BR8.4 to BR8.7 found them already correct —
`src/page-renderer/pages.ts` was **not modified at all**. What U2 actually
contributes is the feed, the fail-the-build-on-an-unknown-fence-language rule, and
the tests that turn "already correct" from an assertion into a fact.

## Sources

- [upstream] `u2-blog/functional-design/functional-spec.md` — W1 to W5, the
  screen-state machine, BR8.1 to BR8.7
- [upstream] `u2-blog/functional-design/frontend-components.md` — the template
  hierarchy and the one-link-per-row commitment
- [upstream] `inception/units-generation/unit-of-work.md` § U2 — the boundary and
  its nine deliverables
- [upstream] `inception/requirements-analysis/requirements.md` — FR2.1–FR2.9,
  FR4.3, FR5.1, NFR2, NFR3, NFR7, NFR12, constraint C4
- [upstream] `inception/domain-design/components.md`, `decisions.md` — ADR-003 is
  why `ContentTransforms` stays pure and `MarkupRenderer` is one boundary
- [upstream] `inception/refined-mockups/mockups.md` § Writing, § Post, § Global
  Shell; `interaction-spec.md` § Code Block
- [upstream] `u1-publishable-site-shell/functional-design/rules.md`,
  `entities.md` — BR1.x to BR7.x, consumed and not redefined
- [Q1] `code-generation-questions.md` — the feed path and its discovery

## What changed

**Four source files, all modified in place.**

| File | Change |
|---|---|
| `src/markup-renderer.ts` | `isKnownFenceLanguage`, `unknownFenceLanguages`; the silent fallback for a labelled-but-unknown language removed |
| `src/content-transforms.ts` | `FEED_OUTPUT_PATH`, `FeedPost`, `buildAtomFeed` |
| `src/site-builder.ts` | `fenceLanguageErrors` in the validate phase; the feed built, written and recorded |
| `src/page-renderer/shell.ts` | the feed autodiscovery link in every page head |

`src/page-renderer/pages.ts` is unchanged. `postRow` already wrapped title, date
and summary in one anchor (BR8.6); `renderWriting` already emitted one row per
post with all three values (BR8.5); `renderPost` already carried all four values
(BR8.7) and both "All posts" links (BR8.4); `emptyState` already kept the heading
and routed to Projects (W5). Eight tests now hold those properties in place.

**Four test files and three fixture trees**, under `tests/u2/`: 27 tests across
`markup-renderer` (8), `feed` (7), `page-renderer` (8) and `integration` (4).

**Three configuration entries**: `tests/u2/fixtures/` excluded from Prettier and
ESLint (fixtures carry deliberately broken content — formatting or linting them
would repair the faults they exist to prove), and the `test` script widened to
run both units' suites.

## Key implementation decisions

**The fence check runs in the validate phase, not in the renderer.** BR8.2's
`applies_to` names `MarkupRenderer`, and putting the failure there would have been
wrong. `SiteBuilder` runs load → validate → render → write (BR4.1) and aborts on
any field error before rendering, so a fence fault raised during rendering could
only ever surface in a run where no front-matter error existed. A post with both a
missing date and a typo'd fence label would report the date, be fixed, rebuilt,
and only then report the fence — two fix cycles for one broken file, which
contradicts BR4.2's "report every field error". `MarkupRenderer` exports the
predicate; `SiteBuilder` calls it where every other field error is collected. The
rule is unchanged; only where it fires moved.

**`buildAtomFeed` takes the post's site path rather than deriving it.** The plan
sketched `buildAtomFeed(site, posts, updatedAt)` over `Post`, which would have
required importing `postPath` from `page-renderer/shell.ts` — a module that
already imports `content-transforms.ts`. That is a cycle. The module exports
`FeedPost { title, summary, date, path }` instead and `SiteBuilder` maps
`postPath(post.slug)` in. `postPath` stays the one definition of where a post
lives, and `ContentTransforms` stays pure and route-free (ADR-003). This is a
deviation from the plan's signature and nothing else.

**`renderCode` throws on a labelled unknown language rather than falling back.**
By the time rendering runs, validation has already failed the build on that label,
so reaching that branch means validation was bypassed — an invariant violation,
not an authoring fault, and a silent fallback there would hide it. Two plain paths
remain: the unlabelled fence (a choice), and a grammar that resolves then fails to
tokenize (unreachable; it is the one uncovered line in the file).

**Fence labels are case-normalised before resolution** — `isKnownFenceLanguage("TS")`
is true. Shiki's grammar ids are lowercase, so without this a fence written
` ```TS ` would fail the build. BR8.2 exists to catch a *misspelled* label, and
case is not a misspelling; failing on it would stop the site publishing over a
capital letter. The normalised label is also what reaches the tokenizer and what
lands in the `language-*` class.

**Shiki's aliases are part of "a language the highlighter knows"** (U2CA3). Its
`bundledLanguages` carries aliases alongside canonical ids — 104 of its 346 keys
are aliases — so ` ```js ` and ` ```ts ` resolve as known. This is BR8.2's PRIMARY
`known_language_resolution` route, and it means the configured-label FALLBACK the
rule allows stays unused.

**Unknown labels are deduped per body.** Three fences carrying the same typo are
one authoring mistake. BR4.2's "report every error" is about not hiding *distinct*
faults behind the first one, not about counting occurrences.

**The fence scan uses the Markdown parser, not a regular expression.** A ``` inside
an indented block, a code span, or a blockquote is not a fence, and a regex scan
that failed the build on one would stop the site publishing over prose that was
never a code block.

**The feed's `updated` is the newest declared post date** (U2CA1), falling back to
the injected `buildDate` only when there are no posts. Reading a clock would
rewrite `feed.xml` on every build — telling every subscriber something changed
when nothing did — and would make the suite time-dependent.
`tests/u2/feed.test.ts` asserts byte-identical output across two calls, which is
what makes "no clock" a tested property rather than a convention.

**Drafts are absent from the feed by construction, not by a second rule.** The
ordered post list `PostCatalog` yields never contains a draft (BR1.7), so
`buildAtomFeed` has nothing to exclude. FR5.1's "no draft" requirement needs no
check of its own, which is the point of excluding drafts once at the boundary.

**The autodiscovery link is the feed's only automated verification** (U2CA4).
`/feed.xml` appears in every page head, and check 3 resolves every internal `href`
in the built output — so a feed that failed to write is a blocking failure on
every page of the site rather than a silent absence. No visible footer link was
added: `mockups.md` § Global Shell draws the footer as a copyright line and two
contact links, with no feed link among them, and adding to an approved layout is
not this unit's to do [Q1, answer A].

> **Corrected in the second pass.** This paragraph previously said § Global Shell
> draws the footer "as the copyright line alone". That was false when it was
> written: § Global Shell draws `(c) 2026 · GitHub · email` and its Element table
> specifies a footer link treatment. The claim originated as a code comment in
> `src/page-renderer/shell.ts`, U5 raised it as a finding, and U1's own second
> pass has since deleted the comment and emitted the two contact links — so a
> reader comparing this summary to the built footer would otherwise conclude the
> summary describes a different site. **The decision is unaffected and stands**:
> the feed gets no visible footer link. Only the stated reason was wrong.

**BR8.2 reaches project bodies too** (U2CA2). `MarkupRenderer` is one shared
boundary (ADR-003) and the rule's trigger is "rendering a fenced code block", not
"rendering a post". Splitting the behaviour by kind would put two answers behind
one rule; U3 inherits it rather than re-deciding it.

## Deviations from the plan

**One U1 test asserted behaviour this unit was approved to reverse.**
`tests/u1/markup-renderer.test.ts` carried *"falls back to plain escaped code for
an unknown or absent fence language"* — the old behaviour, which is [Q2] option A.
Functional Design chose option D and BR8.2 makes a labelled unknown language a
build failure. The test was narrowed to its still-valid half (*"renders an
unlabelled fence as plain escaped code, silently"*) with a comment naming BR8.2
and pointing at where the other half now lives. U1's test count is unchanged at
82. Leaving it would have meant U1's suite enforcing a decision U2 was approved to
reverse.

**The plan's `buildAtomFeed` signature changed**, for the module-cycle reason
above. Behaviour is exactly what the plan specified.

## Test coverage

Methodology was **test-after**, as the approved Testing Contract fixes: each
function or template was implemented or verified, then its tests were written and
run before it was treated as done.

**First-pass measurement**, kept as the historical record. The current figures
are in § Second pass — the numbers moved because U1's own second pass added
three tests to `tests/u1` afterwards, not because anything in U2 changed.

```
npx vitest run tests/u1 tests/u2 --coverage
Test Files  13 passed (13)
Tests       109 passed (109)
Lines       96.15% (525/546)   Floor: 80%   PASS
Statements  95.05% (558/587)
Branches    87.20% (300/344)
Functions   97.39% (112/115)
```

No threshold was relaxed, `vitest.config.ts` was not touched, and no
`coverage.exclude` entry was added.

| File | Tests | Covers |
|---|---|---|
| `tests/u2/markup-renderer.test.ts` | 8 | BR8.1, BR8.2, FR2.6, FR2.7, NFR2, NFR3 |
| `tests/u2/feed.test.ts` | 7 | BR8.3, FR5.1, W4 |
| `tests/u2/page-renderer.test.ts` | 8 | BR8.4–BR8.7, FR2.1, FR2.3, FR2.4, FR2.8, FR2.9, FR4.3 |
| `tests/u2/integration.test.ts` | 4 | W1–W5, BR4.4, BR4.5, NFR9 |

The full gate passes: `tsc --noEmit`, `eslint .`, `prettier --check .`,
`vitest run tests/u1 tests/u2 --coverage`, and `bin/check.ts` all exit zero. U1's
9 files and 82 tests are still green, which matters because this unit changed code
U1's suite exercises.

## Open items, carried rather than closed

**The unit-scoped command exits 1, and that is a reporting artefact rather than a
coverage gap.** `npx vitest run tests/u2 --coverage` — the command
`unit-test-instructions.md` names — reports 71.42% lines and fails the threshold,
because the Vitest threshold is global over `src/**` and U2's 27 tests alone do
not exercise `ProjectCatalog`, most of `ContentSource`, or U1's error paths. The
authoritative measurement against the 80% floor is the combined run's **96.15%**.
Nothing was adjusted to make the unit-scoped form pass. **Flagged for Build and
Test**: either the per-unit command drops `--coverage` and the floor is measured
once across the suite, or the threshold moves off the global config — a decision
that affects every later unit and belongs where all of them are in view.

**The feed appears in `sitemap.xml`.** BR5.11 says the sitemap carries an entry
for every page in `pagesWritten` except itself, and W4 step 5 puts the feed in
`pagesWritten`. Followed literally rather than quietly narrowed — the same choice
U1 made for `/404.html`. Both are one condition of the same one-line change in
`buildSitemap` if Build and Test decides BR5.11 means pages only. Verified in the
real `dist/sitemap.xml`.

**The keyboard walkthrough has not been run** on the Writing and Post page types.
It is manual, it is the only verification behind the mandated WCAG 2.1 AA rule,
and it runs at Build and Test — then again after U5 applies the styling.

**`U2OQ1` is not closed.** A deleted slug reused by a different post makes a
subscriber inherit the old entry's identity, because entry identity is the
canonical URL (BR8.3). It depends on U1's `FA1`, which records deletion behaviour
as undecided, and carries to Build and Test with it rather than being resolved by
inventing a tombstone here.

**BR8.1 has no enforcement and that is deliberate.** A missing image alt is
detected by nothing in this system — not the build, not a scanner (the automated
accessibility scan was offered at Practices Discovery and declined), and not the
keyboard walkthrough, which covers focus and tab order. The rule is recorded as an
authoring rule; the rendering path passes `alt` through unchanged in all three
states and three tests hold that pass-through in place. Changing this means
changing the accessibility checklist first and the rule second.

**Not this unit's, and untouched**: styling (U5), launch content (U6), the
project-page work (U3). No dependency was added; the lockfile is unchanged.

---

# Second pass

**This pass wrote no application code.** Its `source-manifest.json` carries an
empty `writes` array, which is the honest manifest for a pass that changed no
source — not a reporting shortcut. The only file it changed is this one.

## Why it ran

`project.md` § Corrections, learned after the first pass's gate closed:

> Consult Mobbin before Plan Approval for any Code Generation unit that renders
> UI, and name in the plan which page types were checked and against which
> references.

No unit had been checked against that rule, and U2 owns two page types. The plan
was re-entered, the consultation ran, and § Mobbin consultation in
`code-generation-plan.md` records it. This section records what came out of it.

## What the design-reference check confirmed

Two page types checked. Writing, against Greptile, Cursor, Better Stack,
Tailscale and Linear; Post, against TIDAL, Upwork, FARFETCH, IKEA and Eventbrite.

- **The Writing row shape is right.** Title left, monospace right-aligned date,
  one-line summary beneath, hairline between rows, whole row one link. Greptile
  is the closest match in register. `postRow` emits exactly that, and the order
  inside the single anchor reads correctly aloud: title, date, summary.
- **The Post page's opening block is right, in the same order.** Back-link,
  serif title, muted dek as a distinct quieter line, monospace date, hairline,
  narrow body column. TIDAL's essay pages are that order verbatim; Upwork and
  FARFETCH both put the date beneath the title rather than above it.
- **The code block's keyboard reachability is already correct.** Checked because
  this is exactly the thing that gets deferred to a stylesheet that cannot
  deliver it: `interaction-spec.md` § Code Block requires the scroll container to
  be keyboard-focusable, which is markup, not style.

## Finding for the human — deliberately not applied

**Every reference index in the set carries a per-row category or tag, and this
site's rows carry none.** Cursor shows `Research · Sep 12, 2025`, Better Stack
shows `Blog · Better Stack`, Greptile runs a whole tag rail with counts. The
absence here is deliberate rather than an oversight — topic search and tagging
are recorded as deferred, not excluded — so adopting tags is a scope decision and
not a code one.

**The same two-column question applies to Writing as to Home.** Greptile puts the
date in a narrow left rail with title and summary in a wider right column;
`mockups.md` draws a single column with the date right-aligned. If that rail is
wanted it is one Refined Mockups change covering Home, Writing and Projects
together, which is the argument for deciding it once rather than per unit.

Neither was applied. The check produces a finding for the human to weigh; it does
not override an approved design decision by itself.

## What the verification found (Steps 1 and 2)

Both steps read the approved artifacts directly rather than this plan's
description of them, and found **everything on disk correct**. Nothing was
changed.

| Checked | Against | Result |
|---|---|---|
| `postRow` wraps title, `<time datetime>` and summary in exactly one anchor | BR8.6, `mockups.md` § Writing | Correct |
| `renderWriting` emits one row per post carrying all three values | BR8.5 | Correct |
| `renderPost` carries title, dek, date, body in that order | BR8.7, `mockups.md` § Post | Correct |
| `renderPost` emits exactly two "All posts" links, before and after the body | BR8.4 | Correct |
| Empty Writing keeps its heading and routes to Projects | W5 | Correct |
| Row date is the abbreviated uppercase month, post date the full one | `mockups.md` § Writing (`12 MAR 2026`), § Post (`12 MARCH 2026`) | Correct — `formatDisplayDate` defaults to `MONTHS_SHORT` and `renderPost` passes `"long"` |
| `<pre class="code-block" tabindex="0">` still emitted | `interaction-spec.md` § Code Block, overflow state | Correct (`src/markup-renderer.ts`) |
| Rendered output carries no `<script>`, no inline `style`, no off-origin URL | NFR2, NFR3 | Correct, held by `tests/u2/markup-renderer.test.ts` |

The date distinction is called out because it is a formatting decision made in
`formatDisplayDate`, not something a stylesheet can make later. A single format
used in both places would have been invisible to every other check here.

## The one correction

The false footer claim under § Key implementation decisions, corrected in place
and marked there. It asserted that `mockups.md` § Global Shell draws the footer
"as the copyright line alone"; § Global Shell draws `(c) 2026 · GitHub · email`
and its Element table specifies a footer link treatment. The claim began as a
code comment in `src/page-renderer/shell.ts`, U5 raised it as a finding, and
U1's second pass has since deleted the comment and emitted the two contact
links. **The decision it was offered in support of is unaffected**: the feed
still gets no visible footer link, because the approved footer draws a copyright
line and two contact links and no feed link. Only the reason was wrong, and it
is corrected here so the falsehood does not survive into a third artifact.

`code-generation-plan.md` was not edited beyond ticking its step checkboxes —
the correction is already in its § Mobbin consultation, and editing an approved
plan invalidates its own approval.

## The gate, re-run

Split by whether a command writes into the workspace, per the plan's § How this
pass is reviewed. The first four write nothing and the reviewer runs them itself;
the last two write `coverage/`, `dist/` and `.build/`, so their output is
recorded here verbatim and their directories were removed before the review was
requested.

**Run by the reviewer — verbatim output not recorded, all exit 0:**

```
npx tsc --noEmit                      exit 0
npx eslint .                          exit 0
npx prettier --check .                exit 0   All matched files use Prettier code style!
npx vitest run tests/u1 tests/u2      exit 0   13 files, 112 tests passed
```

**Recorded rather than re-run — `npx vitest run tests/u1 tests/u2 --coverage`, exit 0:**

```
 Test Files  13 passed (13)
      Tests  112 passed (112)

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
  shell.ts         |     100 |    91.66 |     100 |     100 | 292
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 95.18% ( 573/602 )
Branches     : 87.28% ( 302/346 )
Functions   : 97.5% ( 117/120 )
Lines        : 96.25% ( 540/561 )
================================================================================
```

**Recorded rather than re-run — `node --import tsx bin/check.ts`, exit 0:**

```
1. The site builds ......................... pass
2. Every content file produced a page ...... pass
3. Internal links resolve .................. pass

All three checks passed.
```

### The coverage figure, read against both bars

| Measurement | Lines | Verdict |
|---|---|---|
| This pass | **96.25%** (540/561) | Against the inherited 80% floor: **PASS** |
| First pass | 96.15% (525/546) | Marginally up, and not because of anything U2 did |

The movement is U1's: its own second pass added three tests to `tests/u1`, taking
that suite from 82 to 85. `tests/u2` is unchanged at 4 files and 27 tests, and
U2's own instrumented code is unchanged. **No threshold was relaxed**:
`vitest.config.ts` still reads `thresholds: { lines: 80 }` with
`include: ["src/**"]` and no `exclude` key at all, and it was not touched by
either pass.

**One reading artefact worth naming.** `src/page-renderer/pages.ts` does not
appear in the text table above — the reporter elided its row — but it is in the
run and at 100% (27/27 instrumented lines), confirmed from
`coverage/coverage-summary.json` before that directory was removed. The
directory aggregate is the giveaway: `src/page-renderer` reports 95.45% branch
while its only listed file reports 91.66%, so a second file is contributing.
Recorded because a reviewer reading only the table would reasonably conclude the
file this unit spent two steps verifying was never instrumented.

## Deviations in this pass

**None in code**, because no code changed.

**One in the record**: `source-manifest.json` was rewritten from the first pass's
19 entries to an empty `writes` array. That is the contract for this pass — the
manifest states what *this* pass touched, and the answer is nothing. It is not a
claim that the first pass's files were never written; that record is above, under
§ What changed.

**`traceability.json` is byte-identical to the first pass, deliberately.** It was
re-validated rather than rewritten: all 21 `upstream_ids` have a coverage row, all
21 rows are `OK`, and every row whose target is a path names a file that still
exists. No ID, target or status changed this pass, because no code changed.
Rewriting the file to look freshly produced would have put a new mtime behind
identical content and told a reader something had been re-derived when nothing
had.

## Still open, carried unchanged

Every item under § Open items, carried rather than closed still stands, verified
against this pass's build rather than assumed:

- **The unit-scoped command's coverage exit** remains a reporting artefact of a
  global threshold, not a coverage gap. Nothing was adjusted to make it pass.
- **The feed still appears in `sitemap.xml`**, alongside `/404.html`, confirmed
  in this pass's real `dist/sitemap.xml` before Step 6 removed it. Both remain
  one condition of the same one-line change to `buildSitemap` if Build and Test
  decides BR5.11 means pages only.
- **The keyboard walkthrough has still not been run** on the Writing and Post
  page types. It is manual, it is the only verification behind the mandated
  WCAG 2.1 AA rule, and it runs at Build and Test — then again after U5 lands.
- **`U2OQ1` is still open**, carried to Build and Test with U1's `FA1`.
- **BR8.1 still has no enforcement**, and that is still deliberate.
