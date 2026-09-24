# Code Generation Plan — U4 About Page

The smallest unit in the set. One template gains real content, and the test
suite gains the coverage that keeps it real.

`unit-of-work.md` warns that this unit's main risk is being treated as trivial
and skipping its keyboard walkthrough. The plan is written against that warning:
the walkthrough is a numbered step, not a footnote.

## Sources

- [upstream] `construction/u4-about-page/functional-design/functional-spec.md` —
  workflows W1–W3, the screen-state table, and BR10.1–BR10.3
- [upstream] `construction/u4-about-page/functional-design/frontend-components.md`
  — the component hierarchy, the props table, and § "This signature supersedes
  U1's skeleton `AboutPage`"
- [upstream] `inception/units-generation/unit-of-work.md` § U4 — the boundary and
  the triviality warning
- [upstream] `inception/requirements-analysis/requirements.md` — FR4.1, FR4.5,
  NFR1, NFR2, NFR6, NFR7
- [Q1], [Q2] `code-generation-questions.md` — the prose direction and the two
  contact links, both facts no artifact contains

The declared `contract-summary`, `entities`, `rules`, `performance-design`,
`security-design` and `infrastructure-specification` inputs are absent: Contract
Design, NFR Requirements, NFR Design and Infrastructure Design are all SKIP in
this scope, and U4 is a `ui` unit that authors no entity model or base rule
block of its own.

## Mobbin consultation

Run before Plan Approval, per `project.md` § Corrections: *"Consult Mobbin before
Plan Approval for any Code Generation unit that renders UI, and name in the plan
which page types were checked and against which references."* This is the reason
for the re-entry: the design reference was never consulted at build time for any
unit that renders UI.

U4 owns one page type:

| Page type checked | References examined |
|---|---|
| About — the personal page and its "Elsewhere" block | Harvest (the Livia Falcaru bio block), GitHub (The ReadME Project), Maze, Bento, TIDAL |

### What the references settled — a recorded deviation, now corroborated

`mockups.md` § About draws the elsewhere block as a **row**:
`GitHub · email · other profiles`. The delivered `renderAbout` emits the two
links as separate block-level elements instead, and the reason was recorded as
assumption **U4CA4**: two links side by side on a phone cannot each clear the
44px touch minimum without the row wrapping unpredictably.

**The references agree with the code, not the mockup.** Harvest's personal bio
block sets its elsewhere entries one per line; the GitHub ReadME profile stacks
location and link in a side rail the same way. The only reference that puts them
in a row is Maze, and it uses circular icon buttons — a form this site cannot
take, because icon sets are third-party assets and `project.md` § Forbidden bars
any off-origin resource at page load.

So U4CA4 stops being an assumption made against the design and becomes a
corroborated decision. Recorded rather than quietly carried, because a deviation
that survives two passes unexamined is how a design drifts.

### What the check turned up — one change this unit already owed

**The two contact URLs still have two homes.** U1's pass introduced
`SITE_LINKS` in `src/page-renderer/shell.ts` — the GitHub profile URL and the
mailto address, one exported constant — and used it for the footer on every page
and for Home's intro row. `renderAbout` still carries its own literals for the
same two values.

U1's plan named this explicitly as the one loose end it knowingly left, and named
it as U4's edit to U4's function so it could not be lost between the units. This
pass closes it. It is not a cosmetic tidy: the site now renders those two URLs in
three places, and two of them are derived from one constant while the third is
typed out separately. The first time one changes, About is the one that gets
missed.

### Finding for the human — NOT applied by this plan

**Harvest labels each elsewhere row** — `Website liviafalcaru.com`,
`Instagram @liviafalcaru` — with a muted label before the value, which makes the
block scannable at a glance. `mockups.md` § About draws bare links, and BR10.2
requires each link's visible text to name its own destination ("Rue Asha on
GitHub", the address itself) precisely so no surrounding prose is needed. The two
approaches solve the same problem differently and the approved one is coherent;
adopting labels would be a § About redraw. **Not applied.**

## What already exists, and its verdict

U1 emitted a placeholder About page so that every navigation link resolved and
check 3 passed while U4 was still ahead ([Q4] of U1). That placeholder is what
this unit replaces.

| Thing | State | Verdict |
|---|---|---|
| `renderAbout` in `src/page-renderer/pages.ts` | One placeholder paragraph and an "Elsewhere" line pointing at Writing and Projects | Replace its body |
| Its wiring in `src/site-builder.ts` | `emit(renderAbout(options.site.siteName))` at line 209 | Unchanged |
| `ROUTES.about` / `OUTPUT_PATHS.about` in `src/page-renderer/shell.ts` | `/about/` and `about/index.html` | Unchanged — BR10.3's path is already correct |
| About in the shell navigation, marked current | Present | Unchanged |
| Head title and per-page description | Present, description derived from `siteName` | Unchanged |
| Tests covering About | None beyond U1's shell-level coverage | This unit adds them |

**So the deliverable is one function body and a test file, not a new page.**
Saying that plainly is the antidote to the triviality risk: the work is small
*and* it is the only thing standing behind FR4.1.

## The one deviation from the design, stated rather than discovered

`frontend-components.md` § Props and branches lists `AboutPage` with **no
props**. The delivered `renderAbout` keeps its single `siteName: string`
parameter.

The parameter does not feed the page's prose, its structure, or any branch — it
feeds only the head `description` string (`Who ${siteName} is, and where else to
find them.`), which U1 established and BR5.8 requires. The design's intent is
that nothing on the page can vary or be absent, and that still holds: the prose
and both links are literals in the template, exactly as BR10.1 requires, and
there is no branch anywhere in the function.

The alternative — dropping the parameter and hard-coding the site name — would
duplicate `site.config.ts`'s `siteName` into a template, which is worse: it
creates a second place the site's name lives and a way for the two to drift.

Recorded here so the reviewer judges it as a decision rather than finding it as
a discrepancy.

## Repository layout

| Path | Change |
|---|---|
| `src/page-renderer/pages.ts` | Modify `renderAbout` only |
| `tests/u4/helpers.ts` | New — the two rendering helpers this unit's tests share |
| `tests/u4/about.test.ts` | New — the page's markup properties |
| `tests/u4/integration.test.ts` | New — BR10.3 against a real build |
| `tests/u4/fixtures/minimal-site/content/posts/a-post/index.md` | New — one valid post, so a build has something to walk |

Nothing else is touched. `site-builder.ts`, `shell.ts` and `site.config.ts` are
read but not modified.

## Testable layers

Of the contract's five layers, exactly one applies.

| Layer | Applies | Why |
|---|---|---|
| Data model / database behaviour | No | U4 adds no entity; BR10.1 keeps the content model at two kinds |
| Repository / data access | No | `ContentSource` never sees About |
| Business logic | No | No function branches or transforms data here |
| API / endpoint | No | No API exists in this system |
| Frontend behaviour | **Yes** | The rendered markup of one page template |

The omitted four are omitted because they are vacuous for this unit, not to
reduce the test count. The contract's methodology is unchanged.

## Test obligations

- **Standard strategy**: five to eight tests per component, plus integration
  tests at key boundaries. One component here (`AboutPage`), so six unit tests
  plus two integration tests.
- **Scope floor (`feature`)**: the 80% line-coverage floor and CI execution
  before merge. Both are verified at Build and Test against the whole suite;
  `renderAbout` is a straight-line function with no branches, so it reaches 100%
  of its own lines from the first test that calls it.
- **Neither may be weakened to make a step pass.**

The `team.md` note that "template markup and configuration do not" need unit
tests is about *functions that branch or transform data* deserving tests, not a
licence to leave a page type untested: the same section requires a keyboard
walkthrough for every page type and the automated site checks for every
template. BR10.3 in particular has nothing automated behind it anywhere else —
`functional-spec.md` says so outright, noting that check 2 matches output pages
against content files and About has no content file by design. The integration
test below is the only thing that would notice About disappearing.

## Plan steps

Ordering follows the contract's `test-after` profile: implement the layer, then
write and run its tests. The runner already exists and is verified before the
first test step.

## How this pass is reviewed

The review contract requires the reviewer to run this unit's validation tools.
Two of them — `npx vitest run tests/u1 tests/u2 tests/u3 tests/u4 --coverage` and
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
| `npx vitest run tests/u1 tests/u2 tests/u3 tests/u4` | No | The reviewer, itself |
| `npx vitest run tests/u1 tests/u2 tests/u3 tests/u4 --coverage` | Yes — `coverage/` | Run before the review; output recorded |
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

### Phase A — The one change, and the verification around it

**The first pass landed the whole page** — the prose, the `h2` Elsewhere, both
contact links, and eight tests across three files under `tests/u4/`. This pass
makes one change and verifies the rest.

- [x] **Step 1** — In `renderAbout` in `src/page-renderer/pages.ts`, read the two
      contact URLs from the exported `SITE_LINKS` constant in
      `src/page-renderer/shell.ts` instead of the literals currently in the
      function. `shell.ts` is already imported here. **The rendered output must
      not change**: the same two anchors, the same visible text (`Rue Asha on
      GitHub` and the address itself), the same accessible names, the same
      separate block-level elements, the same order. Only the source of the two
      URL strings changes.

      `SITE_LINKS` carries the URL and the visible label per link. Where the
      constant's label and About's required visible text differ, About's wins —
      BR10.2 requires the visible text to name the destination, and a footer
      label tuned for a micro-type row is not automatically the right sentence
      for this page. Keep the two anchors' text exactly as they render today and
      take only the `href` values from the constant if that is what the shapes
      allow; if the constant's labels are already correct for both, use them and
      say so. Do not invent a third place for either URL. — *Traces: BR10.2, BR10.3, U1's recorded cross-unit note*

- [x] **Step 2** — Verify the rest of the page against `mockups.md` § About by
      reading that section itself: exactly one `h1`, an `h2` reading `Elsewhere`,
      prose beneath the heading rather than a bare heading (BR10.3), and both
      links present with their destinations in their own visible text (BR10.2).
      Confirm the two links are still separate block-level elements rather than a
      row — the deviation § Mobbin consultation corroborates. If anything is
      wrong, fix it to the mockup; do not redesign it. — *Traces: FR4.1, BR10.1, BR10.2, BR10.3, `mockups.md` § About*

- [x] **Step 3** — Extend `tests/u4/about.test.ts` with a test that the two
      `href` values the page emits are exactly the two `SITE_LINKS` carries,
      compared against the constant rather than against hard-coded strings — so a
      fourth copy of either URL appearing later fails this test. Run
      `npx vitest run tests/u4`. — *Traces: BR10.2, BR10.3*

### Superseded — the first pass's Phase A

- [x] **Step 1 (first pass)** — Verify the runner: `npx vitest run tests/u1` passes before
      anything is written, confirming the exact unit-scoped command works.
- [x] **Step 2 (first pass)** — Replace `renderAbout`'s body in `src/page-renderer/pages.ts`:
      the `h1`, the About prose (three short paragraphs, below), an `h2`
      "Elsewhere", and the two contact links as separate block-level elements.
      Keep the existing `outputPath`, `title`, `description`, `current` and
      `register` fields unchanged. Update the function's doc comment so it no
      longer says "placeholder" and cites BR10.1–BR10.3. Implements FR4.1,
      BR10.1, BR10.2, BR10.3.

The prose, as drafted from the site's own Home intro and its one project
([Q1] answer A — the author edits this at the approval gate):

> I build things and write about what I am currently learning or find
> interesting.
>
> Most of what I make is small, self-contained and built to be understood. This
> site is a folder of Markdown turned into a folder of HTML by a few hundred
> lines of TypeScript, with no database, no server, and nothing running while
> you read it. I would rather write a build than configure one: a build I wrote
> fails loudly, and a build I configured fails quietly.
>
> Writing here is a record of what I was working out at the time rather than
> finished advice. Projects are the things that got far enough to show.

The two links ([Q2] answer B and its follow-up):

| Visible text | Destination |
|---|---|
| `Rue Asha on GitHub` | `https://github.com/Rue-Asha` |
| `rue.asha@proton.me` | `mailto:rue.asha@proton.me` |

Each is its own paragraph, not a side-by-side row, so each clears the 44px phone
minimum on its own (NFR7, `frontend-components.md` § Responsive behaviour). The
email is a plain `mailto:` anchor with the address as its visible text — U1's
policy carries `script-src 'none'`, so any script-based obfuscation would not
run anyway.

### Phase B — The gate, in two halves

- [x] **Step 4** — Run the four checks that write nothing: `npx tsc --noEmit`,
      `npx eslint .`, `npx prettier --check .`,
      `npx vitest run tests/u1 tests/u2 tests/u3 tests/u4`. All must pass, every
      earlier suite included — this unit changes a file all of them exercise. —
      *Traces: NFR9, NFR12*

- [x] **Step 5** — Run the two that do write, capturing their output verbatim:
      `npx vitest run tests/u1 tests/u2 tests/u3 tests/u4 --coverage`, then
      `node --import tsx bin/check.ts`. Both must pass. Record the measured
      line-coverage figure against the 80% floor and all three site-check
      results. **Never weaken `thresholds.lines` in `vitest.config.ts` and never
      add a `coverage.exclude` entry.** — *Traces: NFR9, NFR12, BR6.1–BR6.5*

- [x] **Step 6** — Remove `dist/`, `coverage/` and `.build/` so the workspace is
      quiet before the review is requested. All three are gitignored build output
      regenerated by the commands above. — *Traces: this plan § How this pass is reviewed*

### Phase C — The record

- [x] **Step 7** — Update `code-summary.md` for this pass: Step 5's verbatim
      output, the coverage figure against the floor, the `SITE_LINKS` change and
      why it was U4's to make, the corroborated U4CA4 deviation, and every other
      deviation. Update `traceability.json`, and write `source-manifest.json`
      listing exactly the application-source paths this pass touched —
      `src/page-renderer/pages.ts` and `tests/u4/about.test.ts`, and nothing
      else. Never claim a gitignored path. — *Traces: stage contract*

### Superseded — the first pass's Phase B and C

Listed for provenance. **Do not re-execute.** Phase A above verifies their result.

- [x] **Step 3 (first pass)** — `tests/u4/helpers.ts`: import `TEST_SITE`, `TEST_BUILD_DATE`
      and `temporaryOutputRoot` from `../u1/helpers.ts` rather than redefining
      them, and export a `renderAboutPage()` that renders the full document
      through `renderDocument`, plus the `headingLevels` extractor pattern U3
      established.
- [x] **Step 4 (first pass)** — `tests/u4/about.test.ts`, six tests covering the single
      `h1`, no heading skip, both links with destination-naming accessible names,
      prose beneath the heading, and no off-origin reference outside an ordinary
      link `href`.
- [x] **Step 5 (first pass)** — `tests/u4/integration.test.ts`, two tests against a real
      build: `about/index.html` is written unconditionally, and the written file
      carries both links and the prose.
- [x] **Step 6 (first pass)** — The unit-scoped and combined coverage runs.
- [x] **Step 7 (first pass)** — The three blocking pre-push checks.
- [x] **Step 8 (first pass)** — `typecheck`, `lint`, `format:check`.
- [x] **Step 10 (first pass)** — `code-summary.md`, `source-manifest.json` and
      `traceability.json`.

## Story-to-code-step traceability

| Requirement / rule | Plan step |
|---|---|
| FR4.1 — an About page saying who the author is, with contact links | Steps 2, 4, 5 |
| FR4.5 — reachable in one click from Home | Unchanged from U1; Step 7 check 3 confirms the link still resolves |
| BR10.1 — prose in the template, content model stays at two kinds | Step 2 |
| BR10.2 — plain outbound links with real accessible names | Steps 2, 4.3, 4.4, 4.6 |
| BR10.3 — `/about` exists with prose and at least one link | Steps 2, 4.5, 5.1, 5.2 |
| NFR1, NFR2 — served complete, nothing client-side | Step 5 (the built file contains the content) |
| NFR6, NFR7 — single column, each link its own touch target | Step 2; confirmed visually at Step 9 |
| Mandated WCAG 2.1 AA keyboard bar | Step 9 |

## What this plan does not do

- **No third `ContentFile.kind` and no `content/pages/` directory.** BR10.1.
- **No reusable include for `AboutProse` or `ContactLinks`.** They exist on one
  page; making them reusable would be building a general capability for a single
  use (`frontend-components.md` § Hierarchy).
- **No styling.** The visual direction is U5's. This unit emits structure.
- **No photograph, role list or timeline.** U4A3 records that FR4.1 names only
  prose and links; adding an image would raise an asset question this unit does
  not have.
- **No contact form.** Excluded by the initiative, and U1's policy carries
  `form-action 'none'` so the absence is enforced rather than merely intended.
- **No change to `RenderedBody`**, which still serves Post and Project.
- **The keyboard walkthrough for the About page type is not run here.** It is
  manual and it is the author's, because the automated accessibility scan was
  declined at Practices Discovery and nothing else stands behind the mandated
  WCAG 2.1 AA rule for this page type. Tab through the built page and confirm the
  skip link is first and becomes visible on focus, the navigation follows with
  About marked current, each contact link takes focus in turn with a visible
  outline, tab order matches visual order, and nothing swallows focus. It runs
  again after U5's styling. It is named at the gate rather than ticked as a step,
  so a developer cannot mark it done on the author's behalf.
- **No elsewhere-row labels.** See § Mobbin consultation — a § About redraw, not
  a code change.

## Assumptions carried into the plan

| ID | Assumption | Basis |
|---|---|---|
| U4CA1 | The drafted prose is a starting point the author edits at the approval gate, not a final editorial statement. | [Q1] answer A says so explicitly. |
| U4CA2 | The email link is a plain `mailto:` anchor with the address as its visible text. | BR10.2; U1's `script-src 'none'` rules out script obfuscation. |
| U4CA3 | Both links carry accessible names identifying their destination rather than bare labels. | BR10.2. |
| U4CA4 | The two links are separate block-level elements, not a side-by-side icon row. | `frontend-components.md` § Responsive behaviour, NFR7. |
| U4CA5 | Keeping `renderAbout`'s `siteName` parameter is a documented deviation, not a contract breach, because it feeds only the head description and introduces no branch. | § The one deviation from the design, above. |
| U4CA6 | The keyboard walkthrough is performed by the author, and Step 9 is where the plan asks for it. Nothing automated can substitute. | `team.md` § Testing Posture. |

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
