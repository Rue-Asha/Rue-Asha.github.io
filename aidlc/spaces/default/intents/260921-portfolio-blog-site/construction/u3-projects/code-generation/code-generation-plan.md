# Code Generation Plan — U3 Projects

The projects half of the site, deepened from the skeleton U1 left. Like U2, this
unit does **not** start from nothing — and unlike U2 it turns out to need almost
no new production code at all. U1 built the Projects list, the write-up page and
the metadata rail, and reading them against BR9.1 to BR9.5 shows four of the five
rules already satisfied as written.

So this plan is mostly **verification**: turning "already correct" from an
assertion into tests that hold it correct. Plus one real defect, found by that
reading, which no check in this repository would ever have reported.

## Sources

- [upstream] `u3-projects/functional-design/functional-spec.md` — W1 to W4, the
  screen-state machine, and BR9.1 to BR9.5
- [upstream] `u3-projects/functional-design/frontend-components.md` — the template
  hierarchy, the two-target row, and the three responsive commitments
- [upstream] `inception/units-generation/unit-of-work.md` § U3 — the boundary and
  its seven deliverables
- [upstream] `inception/requirements-analysis/requirements.md` — FR3.1 to FR3.7,
  NFR1, NFR6, NFR7, NFR11
- [upstream] `inception/domain-design/components.md` — `ProjectCatalog` and the
  project-facing parts of `PageRenderer`
- [upstream] `inception/refined-mockups/mockups.md` § Projects, § Project;
  `interaction-spec.md` § Project Metadata Rail, § Outbound Link
- [upstream] `u1-publishable-site-shell/functional-design/rules.md`,
  `entities.md` — BR1.x to BR7.x and the `Project` entity, consumed not restated
- `code-generation-questions.md` — no questions; what was subtracted, and the one
  thing found rather than asked

## Mobbin consultation

Run before Plan Approval, per `project.md` § Corrections: *"Consult Mobbin before
Plan Approval for any Code Generation unit that renders UI, and name in the plan
which page types were checked and against which references."* This is the reason
for the re-entry: the design reference was never consulted at build time for any
unit that renders UI.

U3 owns two page types. Both were checked:

| Page type checked | References examined |
|---|---|
| Projects — the index | Slack ("Tools built by Slack"), Wild, Glide, MOUTHWASH Studio, Oryzo |
| Project — the write-up with its rail | Harvest, Tailscale, Twenty, Dovetail, Ease |

### What the references confirmed

**The index row is the Slack shape, and the emitted markup supports it.**
`mockups.md` § Projects draws name, one-or-two-line summary, a mono uppercase
tools list, and a right-hand `repo ↗`, hairline between rows. Slack's tool index
is that row almost exactly — name as the link, description beneath, a "works
with" list, and links in their own right-hand cell. The two-target rule and the
separate focus stops the mockup insists on are already emitted, and
`aria-label="Repository for <name>"` is on the repo anchor. **No change.**

**The rail is the Harvest shape, and space-separated is the right call.** Harvest's
case-study page puts labelled facts — `Industry | Architecture`, `Team Size | 42
people` — in a narrow left column beside the body, and Tailscale does the same on
the right. `mockups.md` § Project draws a `<dl>` at 200px, mono uppercase
letterspaced labels, sans values, and explicitly **no background or border**;
`renderProject` emits that `<dl>` with the rows in the fixed order and the live
row omitted entirely when absent. Harvest draws hairlines between its rail rows
where the mockup uses space alone — the mockup's reasoning is recorded (a
bordered rail becomes a third surface and a third column in the contrast table)
and it wins. **No change.**

### What the check turned up — one markup gap

**The rail's tools are emitted on one line; the mockup draws them one per line.**
`mockups.md` § Project draws the rail as:

```
| TOOLS         |
| TypeScript    |
| Postgres      |
```

— the label, then each tool on its own line, with no separator between them.
`renderProject` emits `<dd>{tools.join(" · ")}</dd>`: a single `<dd>` with the
tools run together and separated by a literal middle dot.

**This is markup, not style.** A stylesheet cannot break one `<dd>` into one line
per tool; a `<dl>` takes multiple `<dd>` elements under one `<dt>`, and that is
the shape the mockup draws. U5 has no way to reach it, which is why it survives
into a second pass.

It also removes a literal separator glyph welded into content — the same class of
thing U1's review raised against the 404 route line. A screen reader reading a
rail value announces the middle dot or a pause where the mockup intends a list.

**The index row's inline tools stay as they are, and the difference is
deliberate.** § Projects draws `TYPESCRIPT · POSTGRES · DOCKER` inline on one
line, because a list row is a scannable summary; § Project draws them stacked,
because the rail is a reference table. The two are meant to differ, and only the
rail is wrong.

### Finding for the human — NOT applied by this plan

**This site shows no project imagery at all, and most references lead with it.**
Wild, Glide, Linear and MOUTHWASH Studio all put a thumbnail first and let the
name and summary follow it; `mockups.md` § Projects draws a text-only row, and
the site has no `og:image` either. That is consistent with a site that has no
decorative vocabulary, and adding thumbnails is not a code decision: it needs a
new field on the `Project` entity, an asset per project, and a § Projects
redraw. **Recorded for the gate, not applied.**

**The left-rail question raised at Home and Writing reaches the Projects index
too.** If that layout is wanted it is one Refined Mockups change covering all
three lists, not three separate ones. **This plan does not adopt it.**

## What already exists, and its verdict

Read against BR9.1 to BR9.5 and the unit's seven deliverables before any step was
written.

| Rule / deliverable | State after U1 | This plan |
|---|---|---|
| BR9.1 — fixed rail order, live row omitted when absent | `renderProject` emits year, type, tools, repo, then live only when `liveUrl !== undefined` | Verify under test; no change |
| BR9.2 — two targets, repo link named for its project | `projectRow` emits a name link and a separate repo link with `aria-label="Repository for <name>"`, `rel="noopener noreferrer"` and an outbound `↗` | Verify under test; no change |
| BR9.3 — the Projects page uses the same total order as Home | Both read `projectCatalog.projects`, ordered once by `sortProjects` | Verify the **parity** under test; no change |
| BR9.4 — every project once; name, summary, tools, repo link | `projectRow` carries all four; `renderProjects` maps every project | Verify under test; no change |
| BR9.5 — rail beside an author-chosen body | `<article class="project">` holds `<dl class="project-rail">` and `<div class="project-body">` as siblings | Verify under test; no change |
| Empty state with a route to Writing (FR3.7, W3) | `emptyState(EMPTY_PROJECTS, ROUTES.writing, …)` | Verify under test; no change |
| Six required fields, validated fail-loudly | `ProjectCatalog`, tested by U1 (8 tests) | Consumed. Not reimplemented |
| The 44px outbound-link target | **Not this unit's.** `functional-spec.md` settles it in U5 as BR11.1 | Out of scope, deliberately |

**One thing is wrong, and it is a real defect.**

The Projects page emits `<h1>Projects</h1>` and then each row's project name as an
`<h3>`, with no `<h2>` between them. A screen-reader user navigating by heading
hears a level skip that implies a missing section. Home is correct — its section
heading is an `<h2>` and `<h3>` rows sit properly beneath it — which is exactly
why the shared include was written at `h3` and why the Projects page inherited the
wrong level silently.

**Nothing in this repository would have caught it.** `team.md` § Testing Posture
records heading order as one of the things the declined automated accessibility
scan was good at, and states plainly that without the scan it is "a design-review
responsibility and a walkthrough observation, or it is nobody's". It was nobody's.
The keyboard walkthrough covers tab order and focus, not heading levels.

## Where the fix goes, and why not the other way

Two repairs were available and only one of them is right.

**Rejected: add an `<h2>` to the Projects page.** It would silence the skip by
inventing a section heading the mockups do not draw
(`refined-mockups/mockups.md` § Projects shows the page heading and then rows).
Adding invisible-or-invented structure to satisfy a rule is the shape of fix that
looks correct in markup and wrong on the page.

**Taken: give `ProjectRow` its heading level as a prop.** The row is a named
reusable include used in two places at two different depths — `h2` under the
Projects page's `h1`, `h3` under Home's section `h2`. That is what a level prop is
for, and `frontend-components.md` already lists `ProjectRow` with `project` as its
only prop, so adding one is a small, visible extension rather than a redesign. The
same reading applies to `PostRow`, but the Writing list renders post titles as
`<span>` rather than headings, so it has no skip and no change is made there —
U2's markup was reviewed and accepted as it stands.

## Repository layout

One source file changes. No new component, no new module.

```
src/page-renderer/pages.ts   changed  — projectRow takes a heading level;
                                        renderProjects passes 2, renderHome 3
tests/u3/                    new      — three test files and their fixtures
```

## Testable layers

The Testing Contract below names five layers. Two carry work here; three do not,
and are recorded rather than filled.

| Contract layer | Here | Covered by |
|---|---|---|
| Data model / database behaviour | **Not applicable.** The `Project` entity and its field rules are U1's; this unit adds no entity and changes no field | — |
| Repository / data access | **Not applicable as new work.** `ProjectCatalog`'s ordering is U1's and is already unit-tested; BR9.3's contribution is the *parity* between Home and Projects, which is a rendering property | — |
| Business logic | **Not applicable.** This unit adds no derived function. BR9.3 is satisfied by a function that already exists and is already tested | — |
| API / endpoint | **Not applicable.** One deployable, static output (`requirements.md` C1) | — |
| Frontend behaviour | The Projects list, the write-up page, the rail, the empty state, the heading level | `PageRenderer` |

That four of five layers are not applicable is the honest shape of this unit, not
a gap. U3 is a `ui` unit whose data layer was built and tested by U1.

## Test obligations

Standard strategy, `feature` scope. Both sets apply; neither replaces the other.

- 5–8 tests per component, unit plus integration at key boundaries
- 80% line-coverage floor, enforced as the existing Vitest threshold
- Test-after ordering: make the change first, then write and run its tests before
  it is treated as done

The floor is inherited from `org.md` by scope and is not this stage's to lower. No
threshold in `vitest.config.ts` may be relaxed and no `coverage.exclude` entry
added; a gap is surfaced instead.

The suite runs as `npx vitest run tests/u1 tests/u2 tests/u3 --coverage`. U1's 82
and U2's 27 tests stay green — this unit changes a file both suites exercise, and
a regression would land in theirs first.

## How this pass is reviewed

The review contract requires the reviewer to run this unit's validation tools.
Two of them — `npx vitest run tests/u1 tests/u2 tests/u3 --coverage` and
`node --import tsx bin/check.ts` — write `coverage/`, `dist/` and `.build/` into
the workspace root, which is the tree the review receipt is fingerprinted
against. The reviewer therefore invalidates its own verdict by doing what it was
told to do; U1's first review returned READY and its verdict was refused three
times for exactly that reason.

The split is by whether a command writes into the workspace.

| Command | Writes into the workspace | Who runs it |
|---|---|---|
| `npx tsc --noEmit` | No | The reviewer, itself |
| `npx eslint .` | No | The reviewer, itself |
| `npx prettier --check .` | No | The reviewer, itself |
| `npx vitest run tests/u1 tests/u2 tests/u3` | No | The reviewer, itself |
| `npx vitest run tests/u1 tests/u2 tests/u3 --coverage` | Yes — `coverage/` | Run before the review; output recorded |
| `node --import tsx bin/check.ts` | Yes — `dist/`, `.build/` | Run before the review; output recorded |

The two writing commands run first, their verbatim output goes into
`code-summary.md`, and their output directories are removed so the tree is quiet
when the review is requested. The reviewer scrutinises that recorded output
instead of re-running those two, and says so in its review.

**What this costs, stated rather than glossed.** The coverage figure and the
three site-check results reach the reviewer recorded rather than independently
reproduced — a real reduction in independence on two of six checks. It is
accepted because the alternative is a verdict that can never be recorded, and
because the reviewer can still read `vitest.config.ts` directly to confirm the
80% threshold was not weakened. Build and Test re-runs the whole gate
independently afterwards.

## Plan steps

Each step names the requirement or rule it implements. User Stories is SKIP in
this scope, so traceability keys on functional requirements and `BRx.y` rule IDs.

**The first pass landed every change this unit needed** — the heading-level prop
on `projectRow`, the four `data-testid` hooks, and 24 tests across four files
under `tests/u3/` with two fixture trees. This pass verifies that work, closes the
one markup gap the Mobbin check turned up, and finishes the record.

### Phase A — Verify what is on disk

- [x] **Step 1** — Verify the Projects row and the Project rail against
  `mockups.md` § Projects and § Project by reading those sections themselves, not
  this plan's description of them. Confirm: the rail emits year, type, tools,
  repo in that fixed order with live last and omitted entirely when absent
  (BR9.1); a list row carries exactly two anchors, the name and the repo link,
  and neither the summary nor the tools list is one (BR9.2); each outbound link's
  accessible name identifies its project rather than reading "repo" (FR3.6); the
  rail and the body are siblings rather than the rail nested inside the body
  (BR9.5); the Projects page reads `h1` → `h2` with no level skip and Home still
  reads `h2` → `h3`. If anything is wrong, fix it to the mockup; do not redesign
  it. — *Traces: BR9.1, BR9.2, BR9.4, BR9.5, FR3.1, FR3.2, FR3.5, FR3.6, `mockups.md` § Projects, § Project*

### Phase B — The one markup gap

- [x] **Step 2** — In `renderProject` in `src/page-renderer/pages.ts`, emit the
  rail's tools as **one `<dd>` per tool** under the single `TOOLS` `<dt>`, in the
  order `Project.tools` declares, instead of one `<dd>` holding them joined by a
  literal `" · "`. `mockups.md` § Project draws them stacked one per line; a `<dl>`
  takes multiple `<dd>` under one `<dt>`, and a stylesheet cannot split a single
  `<dd>`, which is why U5 could not reach this. Change **only** the rail. The
  Projects index row keeps its inline middle-dot tools list, because § Projects
  deliberately draws that one inline — a scannable summary line rather than a
  reference table. Add no new class; `.project-rail dd` already addresses the
  values. — *Traces: BR9.1, FR3.2, `mockups.md` § Project*

- [x] **Step 3** — Extend `tests/u3/page-renderer.test.ts` with a test that the
  rail emits one `<dd>` per declared tool, in declaration order, under exactly one
  `TOOLS` `<dt>`, and that no rail value contains a literal `·`. Assert the index
  row still emits its tools as a single inline string, so the deliberate
  difference between the two is held rather than assumed. Run
  `npx vitest run tests/u3`. — *Traces: BR9.1, FR3.2, `mockups.md` § Projects, § Project*

### Phase C — The gate, in two halves

- [x] **Step 4** — Run the four checks that write nothing: `npx tsc --noEmit`,
  `npx eslint .`, `npx prettier --check .`,
  `npx vitest run tests/u1 tests/u2 tests/u3`. All must pass, U1's and U2's
  suites included — this unit changes a file both exercise, so a regression lands
  in theirs first. — *Traces: NFR9, NFR12*

- [x] **Step 5** — Run the two that do write, capturing their output verbatim:
  `npx vitest run tests/u1 tests/u2 tests/u3 --coverage`, then
  `node --import tsx bin/check.ts`. Both must pass. Record the measured
  line-coverage figure against the 80% floor and against the first pass's 96.17%,
  and all three site-check results. **Never weaken `thresholds.lines` in
  `vitest.config.ts` and never add a `coverage.exclude` entry.** — *Traces: NFR9, NFR12, BR6.1–BR6.5*

- [x] **Step 6** — Remove `dist/`, `coverage/` and `.build/` so the workspace is
  quiet before the review is requested. All three are gitignored build output
  regenerated by the commands above. — *Traces: this plan § How this pass is reviewed*

### Phase D — The record

- [x] **Step 7** — Update `code-summary.md` for this pass: Step 5's verbatim
  output, the coverage figure against both the floor and the first pass's, the
  rail change and why a stylesheet could not make it, and every deviation. Update
  `traceability.json`, and write `source-manifest.json` listing exactly the
  application-source paths this pass touched — `src/page-renderer/pages.ts` and
  `tests/u3/page-renderer.test.ts` if Step 2 changed anything, and nothing else.
  Never claim a gitignored path. — *Traces: stage contract*

## What this plan does not do

Stated so the boundary is checkable rather than assumed.

- **No styling.** The rail's layout, the outbound affordance's treatment, the
  hover and focus states, and the 44px phone target on the repository link are all
  U5's. `functional-spec.md` § Sizing the second target settles that target
  explicitly as U5 BR11.1, so this unit does not attempt a figure for it.
- **No content.** Launch content is U6's. The projects exercising the rail's
  branches live in `tests/u3/fixtures/`, not in `content/`.
- **No change to `ProjectCatalog`.** Its six required fields, its year bound, its
  URL shape check and its ordering are U1's, are tested, and are consumed. BR9.3
  needs no new code because `sortProjects` already produces the one total order
  both pages read.
- **No external-link checking.** NFR11 forbids it on the publish path, and W4
  records the consequence deliberately: a repository that has been renamed or made
  private produces a dead link nothing here will catch.
- **No `PostRow` change.** The same heading-level reading applies to the Writing
  list, but it renders post titles as `<span>` rather than headings, so there is no
  skip to fix. That markup is U2's and was reviewed as it stands.
- **The keyboard walkthrough is not run here.** It runs on the Projects and
  Project page types at Build and Test — expecting **two** stops per list row, not
  one — and again after U5 applies the styling.
- **`U3OQ1` is not closed.** Nothing detects a repository link that has gone dead.
  It is a deliberate exclusion rather than a gap, and the shape of the optional
  later addition — a scheduled check, never a publish gate — is already recorded
  in `team.md`.

## Assumptions carried into the plan

| ID | Assumption | Basis |
|---|---|---|
| U3CA1 | Making the Projects page's rows `h2` rather than `h3` is a defect fix and not a design change, so it needs no new upstream decision. | `mockups.md` § Projects draws a page heading and rows; it fixes no heading level. `project.md` § Mandated carries the WCAG 2.1 AA bar, and a level skip is a defect against it. The Plan Approval gate is where the fix is accepted. |
| U3CA2 | A heading-order test written as a property over rendered markup is worth more than assertions about specific elements, because U4, U5 and U6 all change these pages afterwards. | `team.md` § Testing Posture records that nothing automated now covers heading order; a property test is the cheapest thing that keeps covering it as the pages change. |
| U3CA3 | `type` needs no controlled vocabulary and the rail renders it as free text. | U3A1–U3A3 of `functional-spec.md`; U1 left `type` free text and no requirement groups or filters by it. |

## Testing Contract

```json
{
  "version": 1,
  "methodology": "test-after",
  "source": "team",
  "ordering": "Implement the page, template, or function first; then, before that change is treated as done and before it is pushed, write and run its checks — the automated site checks (the build succeeds, every content file produced a page, internal links resolve) for a page or template, unit tests for a function, and a keyboard walkthrough for a page type whose layout or styling changed — and require them all to pass.",
  "scope": "feature",
  "test_strategy": "standard",
  "project_type": "greenfield",
  "applicable_notes": [
    {
      "layer": "org",
      "text": "We treat tests as a first-class deliverable in every Bolt. The specific\nmethodology (TDD, BDD, ATDD, or classic test-after) is affirmed at\npractices-discovery and recorded in `team.md` under this heading with explicit\n`Methodology` and `Ordering` fields; Code Generation resolves those fields\nindependently from coverage, tooling, and scope notes.\n\nWhen no posture has been affirmed, our default per scope is:\n- **Methodology**: test-after\n- **Ordering**: implement each applicable testable layer, then write and run\n  that layer's tests.\n- `mvp`, `enterprise`, `feature`, `infra`, `classic` add an 80% line-coverage\n  floor and CI execution before merge.\n- `bugfix`, `security-patch` add a targeted regression for the specific\n  bug/vulnerability and require the existing suite to remain green.\n- `express` uses the Minimal strategy: requirement-driven unit tests (one per\n  requirement, with a happy-path floor per component); existing tests remain\n  green.\n- `poc`, `refactor`, `workshop` add no extra new-test floor and require the\n  existing suite to remain green.\n\nThe active `Test Strategy` still applies in every scope and determines test\nvolume/types. Scope floors are additive; they never reduce or replace the\nselected strategy.\n\nBuild and Test verifies defined coverage floors and affirmed quality targets;\nthey may not be weakened to make a step pass.\n\nAffirm a stricter posture in `team.md` if the team commits to one."
    },
    {
      "layer": "team",
      "text": "- **Methodology**: test-after\n- **Ordering**: Implement the page, template, or function first; then, before that change is treated as done and before it is pushed, write and run its checks — the automated site checks (the build succeeds, every content file produced a page, internal links resolve) for a page or template, unit tests for a function, and a keyboard walkthrough for a page type whose layout or styling changed — and require them all to pass.\n\nSupporting notes, which specialise the two fields above without replacing them.\n\n**The affirmed check set is three checks, all blocking.**\n\n| # | Check | When | Blocking |\n|---|---|---|---|\n| 1 | The site builds | On the author's machine, before the push | Yes |\n| 2 | Every content file produced an output page | On the author's machine, before the push | Yes |\n| 3 | Internal links resolve across the built output | On the author's machine, before the push | Yes |\n\nAny failed check stops the change going live until it is fixed. Check 2 is the\none that catches this site's most likely real failure: a build that succeeds\nwhile silently dropping a post — malformed front matter, an unparseable date, a\nfile in the wrong place. A generator that quietly omits such a file breaks the\nproject's only mandated publishing rule while reporting green, and neither of the\nother two checks would see it.\n\n**Checks run before the push, on the author's machine.** This resolves a real\ncontradiction rather than papering over it. Blocking checks that run after the\npush would mean a post with a dead link never appears and nothing says so — the\nsilent publish failure the user flow and the initiative brief both carried as a\nrisk, arriving through a different door. Running them before the push puts the\nfailure in front of the author at the moment they would have pushed, which keeps\nthe blocking and removes the silence. It is also how we meet `org.md`'s\nbefore-merge requirement (§ Way of Working).\n\n**External links are never build-blocking.** A dead third-party URL is somebody\nelse's outage, and failing the build on it means this site stops publishing\nbecause an unrelated website went down. Internal links are a defect in this\nrepository and block; external links are not checked on the publish path at all.\nA scheduled weekly external-link check was recommended in review and is not part\nof this version — the Projects list and the project rail do carry outbound repo\nlinks, so it stays on the table as a later addition, never as a gate.\n\n**\"Malformed content\" has a definition, so check 2 has a pass/fail criterion.**\n\n| File kind | Required fields | Optional, with a stated behaviour when absent |\n|---|---|---|\n| Post | title, one-line summary, date | — |\n| Project | name, one-line summary, year, type, tools, repo | live URL — the rail row is **omitted**, not rendered empty (`ideation/rough-mockups/wireframes.md` § Project) |\n\nA missing required field is a build failure that names the file and the field. A\nmissing optional field takes the documented omit behaviour, silently and by\ndesign. The build must fail loudly on malformed content rather than skip the\nfile — this is a stack-selection criterion, not a preference, and PU-1 should\nprove it by committing a deliberately broken post and confirming the build fails\nwhile the previously live site stays up.\n\n**Accessibility: the automated scan was offered and declined.** Question 3 of the\ninterview offered a check set including an automated accessibility scan against\nthe WCAG 2.1 AA bar; the author chose the set without it. That is a deliberate\nchoice and it is recorded here with what it costs:\n\n- The WCAG 2.1 AA keyboard and landmark bar remains a **mandated** rule in\n  `project.md`. It now has **no automated verification behind it at all**.\n- The manual keyboard walkthrough (below) covers tab order, visible focus, skip\n  link behaviour, and focus traps — the two things no scanner can check, plus\n  two it checks partially.\n- Nothing now checks the things a scanner is genuinely good at: landmark\n  structure, heading order and level-skipping, one `h1` per page, image alt text,\n  link names, and colour contrast. Colour contrast in particular would have\n  started firing only once the visual direction lands (PU-5); with no scan, it is\n  a design-review responsibility and a walkthrough observation, or it is nobody's.\n- A regression in any of those is invisible until a reader hits it.\n\nThis is the honest cost of the choice, not an argument to revisit it.\n\n**The keyboard walkthrough is the verification of the mandated WCAG rule.** Tab\nthrough each page type **when that page type is built, and again after the visual\nstyling is applied**. Seven page types: Home, Writing, Post, Projects, Project,\nAbout, 404. Around five minutes each, a handful of times across the whole\ninitiative. Confirm on each: the skip-to-content link is first and becomes\nvisible on focus, tab order matches the visual order, every stop has a visible\nfocus outline, and no element swallows focus. A page type whose walkthrough has\nnot been done is not finished.\n\n**The 80% line-coverage floor is inherited from `org.md` by scope and is not ours\nto lower.** Its applicability is **determined per unit at Build and Test** and\nrecorded there: either the measured figure against the floor, or an explicit\n`N/A — no instrumentable lines in this unit` with that reason written down. It is\nnever reported as passing without a measurement behind it — zero instrumentable\nlines produces no measurement, not a pass. Unit tests are not part of the\nthree-check pre-push set above; where instrumentable code exists, its tests and\nthe floor are verified at Build and Test for that unit, before the unit is\ntreated as done.\n\n**What counts as code that needs unit tests**, stated so a Construction agent can\nact on it: a function that branches or transforms data — date formatting, excerpt\nor summary derivation, post sorting, slug generation, feed or sitemap\nconstruction. Template markup and configuration do not.\n\n**A stack that renders content client-side is disqualified.** The mandated rule\n\"serve pages complete, with no loading state\" has a one-line pass/fail test:\n**load any page with JavaScript disabled; if content is missing, the rule is\nbroken.** This is a filter on the stack decision, not something to discover\nduring Construction.\n\n**Test Strategy** is `Standard` (`<record>/aidlc-state.md`), which governs test\nvolume and types. Nothing in this section reduces it, and no check here may be\nweakened to make a step pass."
    }
  ],
  "obligations": {
    "strategy": "standard",
    "strategy_volume": [
      "Five to eight tests per component.",
      "Unit tests plus integration tests for key boundaries.",
      "Add E2E, performance, or security tests when requirements demand them."
    ],
    "scope_floor": [
      "Meet an 80% line-coverage floor.",
      "Run the selected tests in CI before merge."
    ],
    "combination_rule": "Apply every selected-strategy obligation and every scope-floor obligation; neither replaces the other, and a targeted scope regression may add the narrowest necessary test type beyond the strategy default."
  },
  "plan_profile": {
    "methodology": "test-after",
    "runner_step": "Bootstrap the minimal test runner/configuration and record the exact unit-scoped command.",
    "runner_ready_before_first_test": true,
    "testable_layers": [
      "Data model / database behavior",
      "Repository / data access",
      "Business logic",
      "API / endpoint",
      "Frontend behavior"
    ],
    "steps": [
      "Project structure and production configuration skeleton.",
      "Bootstrap the minimal test runner/configuration and record the exact unit-scoped command.",
      "Data model / database behavior - implement.",
      "Data model / database behavior - write and run its tests after implementation.",
      "Repository / data access - implement.",
      "Repository / data access - write and run its tests after implementation.",
      "Business logic - implement.",
      "Business logic - write and run its tests after implementation.",
      "API / endpoint - implement.",
      "API / endpoint - write and run its tests after implementation.",
      "Frontend behavior - implement.",
      "Frontend behavior - write and run its tests after implementation.",
      "Environment/build configuration.",
      "Documentation and traceability."
    ]
  },
  "input_sha256": "sha256:5188224a2fa7daf0942ad35a7e9e65729c16b9c03e0aad630ccc8af084ae1265",
  "contract_sha256": "sha256:ad8836ce366096547cd20574d1d1d59666f1f99ec2231a2f5755c074208644d4"
}
```
