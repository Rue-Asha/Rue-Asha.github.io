# Code Summary — U5 Visual Direction

One stylesheet, one font file, two head elements, one asset copy in the build.
No template changed, no markup was added, and no behaviour moved. Every page of
the site looks different afterwards, which is the whole deliverable.

**The font landed. The [Q1] contingency did not apply.**

**This file records two passes.** The second pass is written first, because it
is the state of the unit now; the first pass's record follows it unchanged from
§ Files created onward, and every statement in it still holds except the two
declarations named below and the test count, which went from ten to twelve.

---

# Second pass — the design-reference re-entry

The stage gate on the first pass was rejected so every unit that renders UI
could be re-entered with the design reference consulted at build time — the rule
now in `project.md` § Corrections. The consultation is recorded in
`code-generation-plan.md` § Mobbin consultation. It produced four
corroborations, **two changes**, and **one finding left for the author**.

**This pass touched exactly two files**, both already owned by this unit:

| Path | Change |
|---|---|
| `src/assets/styles/site.css` | Two declarations in § 5 Reading |
| `tests/u5/stylesheet.test.ts` | Two tests added — the unit's total goes from ten to twelve |

No template's markup changed, no token value changed, no colour changed, and no
file was created or deleted.

## The two stylesheet changes, and why each was made

**1. A project rail link is underlined at rest, not only on hover.** (Plan Step 1)

`.project-rail a` previously declared `text-decoration: none` and the underline
appeared only under `.project-rail a:hover`. So at rest, in the same column, at
the same size, the only thing separating the value `2026` from the repo link
below it was hue. That is the colour-only signal `design-system-mapping.md`
§ Measured contrast rules out explicitly for `--rule` — *"must never be the only
thing conveying a boundary"* — arriving in a different place. Every reference
examined that puts links in a metadata rail gives them a second signal: Uxcel
boxes them, Behance labels them, Codecademy underlines.

`interaction-spec.md` § Project Metadata Rail specifies the hover and focus
states and is **silent at rest**, so this is additive rather than a
contradiction, and it makes the rail consistent with `.prose a` and
`.contact-link a`, which already underline at rest.

The `.project-rail a:hover` rule is now **removed rather than emptied**: with
`--accent` and the underline both applying at rest, hover had nothing left to
add. That is a deviation from the plan's wording (*"the hover state keeps
whatever it then still needs"*) only in the sense that the answer turned out to
be *nothing*; an empty rule left behind would be dead code. `.prose a` likewise
carries no hover rule, so the file is self-consistent.

**2. `.prose` gains `overflow-wrap: anywhere`.** (Plan Step 2)

`.prose` set no `overflow-wrap`, so a bare URL longer than the 66ch measure
pushed the page wider than the viewport and produced horizontal scrolling on a
phone — which breaks NFR6's *"the phone layout is the desktop layout
contracted"* in the most visible way available. `anywhere` rather than
`break-word` because `break-word` takes the break only after the line has
already overflowed. Nothing else was added: no hyphenation, no `word-break`, no
change to the measure.

**Labelled honestly: this one did not come from the design references.** It was
found while reading the stylesheet, and it is included because it is one
declaration in the file this unit owns, for a defect a reader would hit on the
first post that cites a long URL.

## The two new tests

`tests/u5/stylesheet.test.ts` goes from four tests to six, taking the unit's
total from ten to twelve — the count the approved
`unit-test-instructions.md` § second pass enumerates.

| # | Test | Rule |
|---|---|---|
| 5 | `.project-rail a` carries `text-decoration: underline` and an underline offset in its **own** rule, and the underline is **not** confined to a `:hover` selector | BR11.7, NFR1 |
| 6 | `.prose` declares an `overflow-wrap` value that permits a break | NFR6 |

Test 5 is a regression guard as much as an assertion. Moving the underline back
to `:hover` would restore the colour-only distinction and nothing else in the
suite would notice — the page would still build, still pass all three blocking
checks, and still look almost identical in a screenshot.

Test 6 asserts the declaration, not a rendered width. A layout assertion here
would measure a headless approximation, which § Test obligations rules out; the
real check is loading a post with a long URL at phone width, which is plan
Step 9 and the author's.

## Commands run on this pass, and their results

Step 4 — the four commands that write nothing into the workspace:

| Command | Result |
|---|---|
| `npx vitest run tests/u5` | 3 files, **12 tests**, all pass |
| `npx tsc --noEmit` | Clean, exit 0 |
| `npx eslint .` | Clean, exit 0 |
| `npx prettier --check .` | Clean, exit 0 — after `npx prettier --write tests/u5/stylesheet.test.ts` reflowed one over-long assertion in the new test (see § Deviations) |
| `npx vitest run tests/u1 tests/u2 tests/u3 tests/u4 tests/u5` | 22 files, **160 tests**, all pass |

Step 5 — the two that do write, output verbatim.

`npx vitest run tests/u1 tests/u2 tests/u3 tests/u4 tests/u5 --coverage`:

```
 Test Files  22 passed (22)
      Tests  160 passed (160)

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

Exit 0.

`node --import tsx bin/check.ts`:

```
1. The site builds ......................... pass
2. Every content file produced a page ...... pass
3. Internal links resolve .................. pass

All three checks passed.
```

Exit 0.

**Line coverage measured against the floor: 96.25% lines (540/561) against the
inherited 80% floor — above it by a wide margin.** `vitest.config.ts` still
reads `thresholds: { lines: 80 }`, unchanged and untouched by this pass
(`git diff -- vitest.config.ts` is empty), and no `coverage.exclude` entry was
added.

`site.css` is still not instrumentable — it is not code — so it contributes no
line to that figure. Its verification is the six assertions in
`stylesheet.test.ts`.

Step 6 — `dist/`, `coverage/` and `.build/` were removed after Step 7 had read
the built output, so the workspace is quiet for the review. All three are
gitignored build output regenerated by the commands above.

## Step 7 — the built output, and the `↗` outbound mark

Read from `dist/` before Step 6 removed it.

**The rail link renders underlined at rest.** The shipped
`dist/assets/styles/site.css` carries
`.project-rail a { color: var(--accent); text-decoration: underline; text-underline-offset: 2px; }`
and contains no `.project-rail a:hover` rule at all.

**The `↗` outbound mark is present. There is no finding for U3.** Both rail
rows carry it in `src/page-renderer/pages.ts`: the repo row emits `github ↗`
(line 274) and the live row emits `site ↗` (line 280). In the built output,
`dist/projects/homelab/index.html` and
`dist/projects/rue-asha-github-io/index.html` both render
`<dd><a … data-testid="project-rail-repo-link">github ↗</a></dd>`.

Neither project in the repository's current `content/` tree carries a live URL,
so the live row is **absent from both built pages** — which is the documented
omit behaviour (`wireframes.md` § Project), not a missing mark. The live row's
mark was therefore confirmed in the template rather than in the output. Stated
plainly so nobody reads "confirmed" as stronger than it is.

So `interaction-spec.md` § Outbound Link's *"colour alone never does"* now holds
twice over on a rail link: the `↗` glyph from U3's markup, and the underline
this pass added.

## Steps 8 and 9 remain the author's, and were NOT performed

Their checkboxes are unticked and nothing in this record claims them.

- **Step 8** — the second keyboard walkthrough on all seven page types (Home,
  Writing, Post, Projects, Project, About, 404) after styling: the skip link
  first and visible on focus, a focus ring on every stop, tab order matching
  visual order, nothing swallowing focus.
- **Step 9** — the network panel on every page type, no console policy
  violation, a list row and a standalone link measured at phone width, and the
  measured contrast table re-read against the colours actually shipped.

`traceability.json` records every rule that depends on them as `PARTIAL` with
the step named. Neither change on this pass moves any of them to `OK`: an
underline and a wrap rule are still assertions about a source file, not
observations of a rendered page.

## Deviations on this pass

1. **Step 7 was performed before Step 6, not after.** Step 6 deletes `dist/`
   and Step 7 must read it. Running them in the plan's written order would have
   made Step 7 unperformable. No other consequence.

2. **`npx prettier --write tests/u5/stylesheet.test.ts` was run.** The new
   test 5 contained an assertion line past the print width, so
   `npx prettier --check .` failed on that one file. Prettier reflowed it and
   the check then passed. This is the formatter doing its job on a file this
   pass authored — no rule was relaxed and no other file was touched.

3. **`.project-rail a:hover` was deleted rather than left empty.** The plan says
   the hover state "keeps whatever it then still needs"; with the colour and the
   underline both at rest it needed nothing. Recorded because deleting a rule is
   a larger edit than moving two declarations, even though the rendered result
   is identical.

4. **The finding the Mobbin consultation produced was NOT applied, by design.**
   Every reference puts the project metadata rail on the right; this site puts
   it on the left, because `interaction-spec.md` fixes the rail *before* the
   body in the DOM so tab order matches reading order. Moving it right would
   either desynchronise those two — the exact fault BR11.7 exists to prevent —
   or require U3 to reorder its markup and re-run its walkthrough. It is a
   `mockups.md` § Project redraw and a U3 change, not a U5 one. Recorded for the
   author to weigh.

---

# First pass — the record as written, unchanged

Everything below is the first pass's record. Two statements in it are now
superseded by the second pass above: `.project-rail a`'s underline moved from
hover to rest, and the test count went from ten to twelve.

One renumbering to read past: where the text below says **"plan Steps 12 and
13"**, the current plan calls those the author's **Steps 8 and 9**. They are the
same two pieces of work — the keyboard walkthrough and the network-panel /
phone-width / contrast pass — carried forward live rather than superseded, and
still not performed.

## Files created

| Path | What it is |
|---|---|
| `src/assets/styles/site.css` | The one stylesheet, in the eight sections `frontend-components.md` names, in that order |
| `src/assets/fonts/source-serif-4-latin.woff2` | Source Serif 4, variable weight axis, Latin subset, 50,824 bytes, SIL OFL 1.1 |
| `src/assets/fonts/LICENSE-source-serif-4.txt` | The OFL text, shipped beside the font because the licence requires it to travel with redistribution |
| `tests/u5/helpers.ts` | Stylesheet reader, head-link and URL extractors, one rendered document per page type |
| `tests/u5/head.test.ts` | Four tests on the rendered head |
| `tests/u5/stylesheet.test.ts` | Four tests on the stylesheet source |
| `tests/u5/integration.test.ts` | Two tests against a real build |

## Files modified

| Path | Change |
|---|---|
| `src/page-renderer/shell.ts` | Two head elements — the font preload, then the stylesheet link — plus the two exported path constants they and the tests share. Nothing else in the head changed |
| `src/site-builder.ts` | Copies the generator's own `src/assets/` into the output root in the write phase, after validation |

`.prettierignore` was **not** modified: Prettier has no parser for `.woff2` or
`.txt` and skips both, so `npm run format:check` is clean without an entry. The
plan allowed the edit "if needed"; it was not needed.

## The font

Obtained from the `@fontsource-variable/source-serif-4` package (version 5.3.0,
`license: OFL-1.1`), which redistributes the Google-published family. The
`latin`, `wght`, upright file was taken from it and committed directly at
`src/assets/fonts/source-serif-4-latin.woff2` — which is [Q1] answer A, the
`.woff2` in the repository, no dependency and no build step that could silently
stop copying it. The package itself is **not** a dependency of this project; it
was unpacked once to obtain the file, and nothing in the build or the lockfile
refers to it.

- Family: Source Serif 4, variable along `wght`.
- Declared `font-weight: 400 600` in `@font-face`, which is the range the design
  system uses (§ Type § Families names weights 400 and 600). The file itself
  carries 200–900; the declaration restricts what this site asks of it.
- `unicode-range` is the Latin subset exactly as the package publishes it.
- 50,824 bytes, inside the 45–70 KB the design system predicted. Stated as a
  fact about the file, not as a budget: no ceiling is set anywhere (NFR5).

## Key implementation decisions

**The scale is one custom property per row of § Type § Scale, as a `font`
shorthand value.** `--type-post-title: 600 40px/1.2 var(--font-serif)` carries
weight, size, leading and family in one token, which is the table's own row
rather than three derived variables. Letter spacing cannot ride in that
shorthand, so the two tracked rows carry a companion `-tracking` token.

**Every spacing value in the file is one of the nine `--space-*` steps.** Where
the design system fixes a figure, that figure is used. Where it fixes none — the
padding between a title block and its hairline, the gap between a row title and
its summary — a step from the same scale was chosen rather than a loose number.
The one figure that is not on the scale is the page margin on desktop, which is
`--space-5`; the system fixes only the phone margin (`--space-4`), and desktop
takes the next step up.

**Three colours were chosen here, and they close an item the design system left
open.** `accessibility-checklist.md` item P6 marks the code theme's token
colours "Open — verify at PU-5", and `interaction-spec.md` § Code Block fixes
the constraints: at most four treatments, none reusing `--accent`, each ≥4.5:1
against `--surface-well`. The choices, measured with the sRGB relative-luminance
formula:

| Token class | Value | Against `--surface-well` `#0F1012` |
|---|---|---|
| Comment | `--text-muted` | 7.4:1 |
| String | `#9CBF8A` | 9.3:1 |
| Keyword | `#A6A0D6` | 7.8:1 |
| Everything else | `--text`, plain | 15.3:1 |

The same script reproduces the published table exactly — 15.26, 7.36, 9.07, 1.36
on the shell surface and 14.23, 6.86, 8.46, 1.27 on the reading surface — which
is why the three new figures are quoted with the same confidence. **They have
still only been measured once, by the same party that chose them.** Re-reading
the table against the shipped colours is plan Step 13.

**The register is U1's existing root class, and only the Reading section is
scoped by it.** `.register-editorial main` lifts to `--surface-reading` and opens
the air; the shell above and below stays technical on every page, as the mockups
draw it. There is no second file and no parallel rule set.

**The container is padding, not a wrapper.** `padding-inline: max(var(--page-margin), (100% - var(--container)) / 2)`
on the header, main and footer holds content to 1100px while the header and
footer hairlines still run the full width. A wrapper element would have been new
markup, which this unit does not add.

**The Projects row's hover tint follows its main target, not the row box.** A
Writing row is one link, so the tint is on the link and the row is the hit area.
A Projects row is not a link — it carries two targets by design (U3 BR9.2) — so
the tint fires on `:has(> :is(h2, h3) > a:hover)`. Tinting the whole row on hover
would advertise a hit area the row does not have.

**The minimum-target rule is one rule, switched on by the breakpoint.**
`--target-min-height` is `0` above 720px and `44px` below it, so § 6 declares the
rule once against the element and § 7 only turns its floor on. The padding is
symmetric about the link's own text (BR11.1 rejects the asymmetric alternative
explicitly), and because the surrounding margin sits outside the enlarged box,
the 16px clear space in a Projects row is pushed outward rather than eaten.

## Test coverage

Ten tests, exactly as the approved `unit-test-instructions.md` enumerates: four
on the rendered head, four on the stylesheet source, two against a real build.
Three of the four head tests run across all seven page types rather than on a
sample.

| Command | Result |
|---|---|
| `npx vitest run tests/u5` | 3 files, 10 tests, all pass |
| `npx vitest run tests/u5 --coverage` | Passes; reports 79.31% lines and exits non-zero on the **global** threshold applied to a partial run, which the instructions predict |
| `npx vitest run tests/u1 tests/u2 tests/u3 tests/u4 tests/u5 --coverage` | 22 files, 151 tests, all pass. **Lines 96.22%**, statements 95.14%, branches 87.20%, functions 97.45% — above the 80% floor |
| `npm run typecheck` / `lint` / `format:check` | Clean |
| `npm run build` | 9 pages |
| `npm run check` | All three blocking checks pass |

`vitest.config.ts`'s `thresholds.lines: 80` was not touched.

`site.css` is not instrumentable — it is not code — so its coverage is the
assertions in `stylesheet.test.ts` rather than a percentage. The two files this
unit changed, `shell.ts` and `site-builder.ts`, report 100% and 97.1% lines in
the combined run.

## What is verified, and what is not

`functional-spec.md` says outright that none of BR11.1–BR11.8 is verified by the
pre-push check set. This unit does not pretend otherwise. Automated here: the
right head elements on every page type, no off-origin resource, no inline style
or script, every token at its documented value, one breakpoint, no removed focus
indicator, the row padding derived from the token, and the built output really
carrying both files at the paths the head names.

Not automated, and not claimed: a contrast ratio, a rendered pixel height, a tab
order, a focus trap, the font swapping without blanking, or the phone layout
reading as a contraction. `traceability.json` records those rules as `PARTIAL`
with the walkthrough named, which is what U4 established and the reviewer
confirmed as honest scoping.

**Plan Steps 12 and 13 are the author's and have NOT been performed.** Their
checkboxes are unticked. Step 12 is the second keyboard walkthrough on all seven
page types after styling — the run that catches what a stylesheet uniquely
threatens. Step 13 is the network panel, the phone-width measurement of a list
row and a standalone link, and re-reading the contrast table against the shipped
colours.

## Deviations from the plan, and findings for other units

1. **One file beyond the plan's layout table**:
   `src/assets/fonts/LICENSE-source-serif-4.txt`. The OFL requires its text to
   accompany redistribution of the font, so shipping the `.woff2` without it
   would not be a smaller change — it would be a non-compliant one. It is copied
   into the output with the rest of `src/assets/`, where serving it is harmless
   and arguably correct.

2. **Static assets resolve from the generator's own directory, not from
   `repoRoot`.** The plan says "copy `src/assets/` into the output root". Taken
   literally against `repoRoot`, every fixture build in the test suite would
   have emitted pages linking a stylesheet that was never copied — and check 3
   would have failed across U1–U4. The assets belong to the generator rather
   than to a content tree, so `ASSETS_SOURCE_DIR` is resolved from
   `import.meta.url`. Same output for the real build; correct output for every
   other tree.

3. **Finding for U1 (404 page), not acted on here.** `mockups.md` § 404 marks
   the sentence "That page does not exist." as muted, while About's paragraphs
   are full-strength body text. Both are `main > p` with no distinguishing
   class, so the distinction cannot be styled without a markup change, and this
   unit changes no template. Both currently render at `--text`. The fix, if it
   is wanted, is a class on the 404 sentence in `renderNotFound` — U1's call.

4. **Finding for U1 (footer), not acted on here.** `mockups.md` § Global Shell
   draws a footer carrying a GitHub link and an email link; `shell.ts` emits the
   copyright line alone. The footer is styled as specified (mono 13px muted,
   hairline above), but no link treatment was written for links that do not
   exist. Adding them is a markup change and belongs to whoever owns the footer.

5. **Home's `h1` is the serif 40px token.** `design-system-mapping.md` § Type
   § Scale assigns `--type-post-title` to "Post and Project `h1`" and does not
   list Home's; `mockups.md` § Home annotates it "serif 40 / h1" and says in
   prose that the name is the one place the serif appears in the technical
   register. The existing token is used rather than a new one.
