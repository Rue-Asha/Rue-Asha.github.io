# Code Summary — U3 Projects

The projects half of the site, deepened from the skeleton U1 left. As the
approved plan predicted, almost all of the work here was **verification**: four
of this unit's five rules were already satisfied by the templates U1 wrote, and
this unit turns "already correct" into tests that hold it correct while U4, U5
and U6 change the same pages.

**This record covers two passes.** The first landed the heading-level defect fix,
the `data-testid` hooks and 24 tests. The second — a re-entry driven by
`project.md` § Corrections, which requires a Mobbin consultation before Plan
Approval for any Code Generation unit that renders UI — checked the two page
types this unit owns against real references, found one markup gap the design
reference exposed, closed it, and added three tests. One source file changed in
each pass, and only that file.

## Sources

- [upstream] `u3-projects/functional-design/functional-spec.md` — W1 to W4, the
  screen-state machine, and BR9.1 to BR9.5
- [upstream] `u3-projects/functional-design/frontend-components.md` — the
  template hierarchy, the two-target row, the three responsive commitments
- [upstream] `inception/refined-mockups/mockups.md` § Projects, § Project — the
  row shape, the rail's row order and its stacked tools list
- [upstream] `inception/requirements-analysis/requirements.md` — FR3.1 to FR3.7,
  NFR1, NFR6, NFR7, NFR9, NFR11, NFR12
- [upstream] `inception/units-generation/unit-of-work.md` § U3
- [upstream] `u1-publishable-site-shell/functional-design/rules.md`,
  `entities.md` — BR1.x to BR7.x and the `Project` entity, consumed not restated
- `code-generation-plan.md` (approved) and `unit-test-instructions.md`

## Files created and modified

| Path | Change | Pass | What it is |
|---|---|---|---|
| `src/page-renderer/pages.ts` | modified | 1 | `projectRow` takes a heading level; `renderProjects` passes `2`, `renderHome` passes `3`. Four project anchors gained stable `data-testid` hooks |
| `src/page-renderer/pages.ts` | modified | 2 | `renderProject` emits the rail's tools as one `<dd>` per tool instead of one `<dd>` joined by a literal `" · "` |
| `tests/u3/helpers.ts` | created | 1 | The heading-level extractor, the no-skip property, and small markup readers for rows, rails and listed slugs |
| `tests/u3/heading-order.test.ts` | created | 1 | 6 tests — the WCAG heading property on Projects, Home and a write-up page |
| `tests/u3/page-renderer.test.ts` | created, then extended | 1, 2 | 12 tests — BR9.1, BR9.2, BR9.4, BR9.5, the empty state, and (pass 2) the rail's stacked tools against the index row's inline tools |
| `tests/u3/ordering-parity.test.ts` | created | 1 | 4 tests — BR9.3, the parity between Home and the Projects page |
| `tests/u3/integration.test.ts` | created | 1 | 5 tests — the whole spine against committed fixture trees |
| `tests/u3/fixtures/projects-site/…` | created | 1 | One post and three projects: one featured, one with a live URL, one without, three different years |
| `tests/u3/fixtures/no-projects/…` | created | 1 | One post and no projects, so the Projects empty state is reachable in a real build |

## Key implementation decisions

### Pass 2 — the Mobbin check, and the one gap it found

Two page types were checked before Plan Approval: **Projects**, the index
(against Slack's "Tools built by Slack", Wild, Glide, MOUTHWASH Studio, Oryzo),
and **Project**, the write-up with its rail (against Harvest, Tailscale, Twenty,
Dovetail, Ease). The index row confirmed as the Slack shape and the rail as the
Harvest shape, both already emitted correctly. One thing did not match its own
mockup.

**The rail's tools were emitted on one line; `mockups.md` § Project draws them
one per line.** The mockup's rail block reads `TOOLS` / `TypeScript` / `Postgres`
— the label, then each tool on its own line with no separator between them.
`renderProject` emitted `<dd>{tools.join(" · ")}</dd>`: a single `<dd>` with the
tools run together and a literal middle dot between them.

**This was markup, not style, which is why it survived into a second pass.** A
stylesheet cannot break one `<dd>` into one line per tool; a `<dl>` takes several
`<dd>` elements under one `<dt>`, and that is the shape the mockup draws. U5 had
no way to reach it. It also removes a literal separator glyph welded into
content — the same class of thing U1's review raised against the 404 route line:
a screen reader announces the middle dot, or a pause, where the rail means "these
are a list".

**The index row's inline tools were left exactly as they were, and the difference
is deliberate.** § Projects draws `TYPESCRIPT · POSTGRES · DOCKER` inline on one
line because a list row is a scannable summary; § Project draws them stacked
because the rail is a reference table. The two are meant to differ, only the rail
was wrong, and `page-renderer.test.ts` now asserts *both* halves so making them
the same has to be a decision rather than a drift.

### The one defect of pass 1, and where the fix went

The Projects page emitted `<h1>Projects</h1>` and then each row's project name as
an `<h3>`, with nothing at `h2` between them. A screen-reader user navigating by
heading hears a level skip that implies a missing section. Home was correct — its
section heading is an `h2` and `h3` rows sit properly beneath it — which is
exactly why the shared include was written at `h3` and why the Projects page
inherited the wrong level silently.

Nothing in this repository would have caught it. `team.md` § Testing Posture
records heading order as one of the things the declined automated accessibility
scan was good at, and says plainly that without the scan it is "a design-review
responsibility and a walkthrough observation, or it is nobody's". It was
nobody's.

**Taken: `ProjectRow` gets its heading level as a prop.** The row is one reusable
include used at two depths, which is what a level prop is for.
`frontend-components.md` already lists `ProjectRow` with `project` as its only
prop, so this is a small visible extension rather than a redesign.

**Rejected: adding an `<h2>` to the Projects page.** It would silence the skip by
inventing a section heading `refined-mockups/mockups.md` § Projects does not
draw — a fix that looks correct in markup and wrong on the page.

The emitted class names and link structure are unchanged, so U5 styles the same
row at either level.

### `PostRow` was read the same way and deliberately left alone

The same reasoning applies to the Writing list, but it renders post titles as
`<span>` inside a single row-wide link rather than as headings, so it has no skip
to fix. That markup is U2's and was reviewed as it stands.

### The heading tests are properties, not sequences

`firstHeadingSkip` asserts that the first heading is `h1` and that no heading is
more than one level deeper than the one before it, and returns the offending pair
rather than a boolean so a failure reads as a diagnosis. A test asserting the
literal sequence `[1, 2, 2]` would break the first time U5 or U6 adds a
legitimate section; this one keeps working. It is paired with an
exactly-one-`h1` assertion, because the no-skip property alone would be satisfied
by a page whose rows were all `h1`.

**The tests were mutation-checked.** Reverting `renderProjects` to pass `3` was
confirmed to fail `heading-order.test.ts` with `h1 is followed by h3, skipping a
level`, and the fix was restored. A test that passes against the defect it exists
to catch is worth nothing.

### `data-testid` on the four project anchors

`project-row-name-link`, `project-row-repo-link`, `project-rail-repo-link` and
`project-rail-live-link`. Lowercase kebab-case, semantic rather than indexed, and
stable across the heading-level change. They were added only to anchors this unit
owns: `emptyState` is shared with the Writing page, so hooking it would have
changed U2's markup for no benefit to this unit.

### What was consumed rather than reimplemented

`ProjectCatalog`'s six required fields, its year bound, its URL shape check and
`sortProjects` are all U1's, are already unit-tested, and were not touched. BR9.3
needed no new code for exactly that reason: one total order already exists, and
what this unit adds is the test that **both** pages read it.
`ordering-parity.test.ts` deliberately does not re-test `sortProjects`; it passes
a deliberately unsorted declaration list so a template that never ordered
anything cannot pass.

## Test coverage

Test-after ordering throughout, per the approved Testing Contract: in both passes
the change landed first, then its tests were written and run before the change
was treated as done.

| Suite | Tests | Result |
|---|---|---|
| `tests/u1` | 85 | pass |
| `tests/u2` | 27 | pass |
| `tests/u3` | 27 | pass |
| **Combined** | **139** | **pass** |

Per file within `tests/u3`: `heading-order.test.ts` 6, `page-renderer.test.ts`
12, `ordering-parity.test.ts` 4, `integration.test.ts` 5.

Unit-scoped command: `npx vitest run tests/u3 --coverage`. The coverage figure is
read off the combined run, for the reason U2 recorded: the Vitest threshold is
global over `src/**`, so a unit-scoped run reports a number reflecting which
tests ran rather than what this unit covers.

**Measured line coverage: 96.25% (540/561), against the inherited 80% floor** —
up from the first pass's 96.17% (528/549). No threshold was relaxed, no
`coverage.exclude` entry was added, and no lint rule was disabled.

### Pass 2 gate, all green

Four commands write nothing into the workspace and were run directly:

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | pass (exit 0, no output) |
| `npx eslint .` | pass (exit 0, no output) |
| `npx prettier --check .` | pass — "All matched files use Prettier code style!" |
| `npx vitest run tests/u1 tests/u2 tests/u3` | 17 files, 139 tests, all pass |

Two commands write `coverage/`, `dist/` and `.build/` into the workspace root,
which is the tree the review receipt is fingerprinted against. They were run
**before** the review was requested and their output is recorded verbatim here,
so the reviewer scrutinises this record instead of re-running them and
invalidating its own verdict (`code-generation-plan.md` § How this pass is
reviewed).

`npx vitest run tests/u1 tests/u2 tests/u3 --coverage`:

```
 Test Files  17 passed (17)
      Tests  139 passed (139)

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
Functions    : 97.5% ( 117/120 )
Lines        : 96.25% ( 540/561 )
================================================================================
```

`src/page-renderer/pages.ts` — the one file this unit modified — does not appear
as a row because it is at 100% on every metric; the v8 reporter lists only files
with something uncovered, and the `src/page-renderer` group totals 100% lines.

`node --import tsx bin/check.ts`:

```
1. The site builds ......................... pass
2. Every content file produced a page ...... pass
3. Internal links resolve .................. pass

All three checks passed.
```

`dist/`, `coverage/` and `.build/` were removed after those two runs, so the
workspace is quiet at review time. All three are gitignored build output
(`.gitignore` lines 92–94) and are regenerated by the commands above.

**What this costs, stated rather than glossed.** The coverage figure and the three
site-check results reach the reviewer recorded rather than independently
reproduced — a real reduction in independence on two of six checks. It is
accepted because the alternative is a verdict that can never be recorded, and
because the reviewer can still read `vitest.config.ts` directly to confirm
`thresholds.lines: 80` was not weakened. Build and Test re-runs the whole gate
independently afterwards.

### The change was verified in built output, not only in tests

The rail of a real project page in `dist/` was read before `dist/` was removed,
and emits the stacked form:

```html
<dt>Tools</dt>
<dd>Proxmox VE</dd>
<dd>Terraform</dd>
<dd>Ansible</dd>
<dd>LXC</dd>
<dd>systemd</dd>
```

### The whole suite was run too, beyond the plan's three directories

`tests/u4` and `tests/u5` exist on disk, and this pass changes a file they also
exercise. `npx vitest run` over every directory: **22 files, 157 tests, all
pass.** Recorded because a regression in a later unit's suite would be this
unit's to own, and the plan's three-directory command would not have seen it.

## Deviations from the plan

**None material.** Four things worth naming:

- **A styling consequence of the rail change, flagged not fixed.** `site.css`
  carries `.project-rail dd { margin: var(--space-1) 0 var(--space-4); }`, written
  by U5 when one `<dd>` per row was the only shape it saw. With the tools now one
  `<dd>` each, every tool takes a `--space-4` bottom margin, so a five-tool rail
  renders as five widely spaced values rather than the tight stack `mockups.md`
  § Project draws. The approved plan forecloses styling in this unit — "No
  styling", and "Add no new class" — so nothing in `src/assets/styles/site.css`
  was touched. **The correct repair is one U5 rule** (`.project-rail dd + dd`
  tightening the gap, or the group spacing moving onto the `dt`), and it is
  recorded here and in § Assumptions & Open Questions as `U3OQ2` rather than
  applied out of scope. Markup correctness is achieved; the spacing is not, and
  saying so is better than a silent half-fix in someone else's file.
- The plan sized the test files at 3–4, 7–8, 3–4 and 3–4 tests; the delivered
  counts are 6, 12, 4 and 5. `page-renderer.test.ts` exceeds its band by four —
  one from pass 1 (the paired exactly-one-`h1` and empty-state assertions the
  plan's own prose called for) and three from pass 2's rail change, which the
  approved plan's Step 3 specifies directly.
- The plan's repository-layout block named `tests/u3/` as "three test files and
  their fixtures". Four were written: the three named plus `helpers.ts`, which the
  approved `unit-test-instructions.md` § Framework setup specifies by name.
- The plan's combined-run command names `tests/u1 tests/u2 tests/u3`, and the
  figures above are from exactly that command. The full-suite run is reported
  additionally, never in place of it.

## What this unit deliberately did not do

- **No styling.** The rail's layout, the outbound affordance's treatment, and the
  44px phone target on the repository link are U5's; `functional-spec.md`
  § Sizing the second target settles that target as U5 BR11.1. See the rail-spacing
  deviation above.
- **No thumbnails or project imagery.** The Mobbin check found that Wild, Glide,
  Linear and MOUTHWASH Studio all lead a project index row with a thumbnail, and
  this site shows no project imagery anywhere. Adding it is not a code decision —
  it needs a new field on the `Project` entity, an asset per project, and a
  § Projects redraw. Recorded for the human at the gate, not applied.
- **No left-rail index layout.** The same question raised at Home and Writing
  reaches the Projects index; if wanted it is one Refined Mockups change covering
  all three lists, not three separate ones. Not adopted here.
- **No content in `content/`.** Launch content is U6's; the projects exercising
  the rail's branches live in `tests/u3/fixtures/`.
- **No change to `ProjectCatalog` or `sortProjects`.**
- **No external-link checking.** NFR11 forbids it on the publish path, and W4
  records the consequence deliberately.
- **No `PostRow` change**, and no change to the Projects index row's inline tools.
- **The keyboard walkthrough was not run here.** It runs on the Projects and
  Project page types at Build and Test — expecting **two** tab stops per list row,
  which is the design (BR9.2), not a defect — and again after U5.

## Assumptions & Open Questions

The three assumptions the approved plan carried held, and are restated with what
was observed.

| ID | Assumption | Status after implementation |
|---|---|---|
| U3CA1 | Making the Projects rows `h2` is a defect fix, not a design change, so it needs no new upstream decision | Held. No mockup fixes a heading level, and the emitted classes and link structure are unchanged, so U5 is unaffected |
| U3CA2 | A heading-order property test is worth more than assertions about specific elements | Held, and mutation-checked: the property caught the real defect and states which pair skipped |
| U3CA3 | `type` needs no controlled vocabulary and the rail renders it free text | Held. The fixtures use `Web app`, `CLI` and `Library` with no vocabulary behind them |

| ID | Open question | Who closes it |
|---|---|---|
| U3OQ1 | Nothing detects a repository link that has gone dead — renamed, made private, or deleted | Not closable here: a deliberate exclusion under NFR11, not a gap. `team.md` records the shape of the optional later addition — a scheduled check, never a publish gate |
| U3OQ2 | The rail's stacked tools each take `.project-rail dd`'s `--space-4` bottom margin, so a multi-tool rail renders looser than `mockups.md` § Project draws | U5, in `src/assets/styles/site.css`. One rule, and it is a styling change this unit's approved plan forecloses. Verified at Build and Test's keyboard-and-visual pass over the Project page type |
| U3OQ3 | Whether the Projects index should lead each row with a thumbnail, as most of the Mobbin references do | The human, at Refined Mockups. It needs a `Project` entity field and an asset per project, not a code change here |
