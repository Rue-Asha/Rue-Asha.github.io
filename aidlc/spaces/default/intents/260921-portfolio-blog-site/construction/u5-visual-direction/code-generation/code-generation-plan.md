# Code Generation Plan — U5 Visual Direction

One stylesheet, one font file, two head elements. No template, no component, no
behaviour and no content change — and yet every page in the site looks different
afterwards, which is why this unit is a Must Have rather than a polish pass.

`design-system-mapping.md` **is** the design system. This plan implements it
literally; it invents no token, adjusts no value, and adds nothing the system
says it does not contain.

**This is the second pass.** The first landed the whole unit; the stage gate was
then rejected so every unit that renders UI could be re-entered with the design
reference consulted at build time — the rule now recorded in `project.md`
§ Corrections. § Mobbin consultation below is that check and is the reason this
plan exists in a second version. It produced four corroborations, two small
changes to the stylesheet, and one finding left for the author. The design
artifacts remain the contract; the check did not overrule any of them.

## Sources

- [upstream] `construction/u5-visual-direction/functional-design/functional-spec.md`
  — workflows W1–W3 and rules BR11.1–BR11.8
- [upstream] `construction/u5-visual-direction/functional-design/frontend-components.md`
  — what this unit adds, the stylesheet's internal shape, and the five contracts
  earlier units must keep providing
- [upstream] `inception/refined-mockups/design-system-mapping.md` — every colour,
  type, spacing, border, radius, focus and motion token, and the measured
  contrast table
- [upstream] `inception/refined-mockups/interaction-spec.md` — per-element states
  and responsive behaviour
- [upstream] `inception/refined-mockups/mockups.md` — the two registers
- [upstream] `inception/refined-mockups/accessibility-checklist.md` — the
  walkthrough and what nothing checks
- [upstream] `inception/units-generation/unit-of-work.md` § U5 — the boundary
- [upstream] `inception/requirements-analysis/requirements.md` — NFR1, NFR3,
  NFR4, NFR5, NFR6, NFR7
- [upstream] `construction/u1-publishable-site-shell/functional-design/rules.md` —
  BR5.2 (skip-link position) and BR5.10 (the policy this unit must keep holding)
- [Q1] `code-generation-questions.md` — how the font file enters the repository

The declared `contract-summary`, `entities`, `rules`, `performance-design`,
`security-design` and `infrastructure-specification` inputs are absent: Contract
Design, NFR Requirements, NFR Design and Infrastructure Design are all SKIP in
this scope, and U5 is a `ui` unit that authors no entity model or base rule block
of its own.

## Mobbin consultation

Run before Plan Approval, per `project.md` § Corrections: *"Consult Mobbin before
Plan Approval for any Code Generation unit that renders UI, and name in the plan
which page types were checked and against which references."* This is the reason
for the re-entry — the design reference was never consulted at build time — and
U5 is the unit where it bites hardest, because this is the one that decides how
all seven page types look.

| Page types checked | References examined |
|---|---|
| Home — name, intro, two sections of rows | Linear, Open, Adobe Express (webpage), Polywork, Higgsfield |
| Writing, Projects — hairline-separated rows of title, summary, date | Binance (P2P Blog), Hashnode, Assembly, Codecademy, Digg |
| Post — the reading page | Hashnode (article), Codecademy (dark-mode article), Chronicle, Mistral AI |
| Project — write-up with a metadata rail | Uxcel (Showcase), Behance, Linear (project overview), Skillshare, Airtable |
| About — prose and contact links | Polywork, Codecademy |
| 404 | No dark editorial 404 pattern surfaced worth citing; the page is one sentence and two routes, and the references added nothing |

**The design artifacts are the contract, and this check does not overrule them.**
Everything below is either corroboration, one change the stylesheet owns, or a
finding recorded for the author to weigh.

### What the references corroborated — no change

1. **The small lift between the shell and the reading surface.** Linear's dark
   pages and Binance's dark blog both keep near-black surfaces with a barely
   perceptible step between layers. `#0F1012` → `#17181B` reads as the "paper on
   a desk, not a card floating on a page" the design system argued for, and the
   references show that a larger step is what turns a reading area into a
   component.

2. **The metadata rail's label/value treatment.** Uxcel's showcase (`TOOLS USED`,
   `FROM BRIEF`, `TOPICS`), Behance (`TOOLS`) and Linear's project sidebar all
   set a small uppercase muted label above a plain value. That is
   `--type-rail-label` (12px mono, uppercase, +0.06em, muted) over
   `--type-rail-value` (14px sans, `--text`) exactly. No adjustment.

3. **The list row's field order and weighting.** Binance's dark article list puts
   the title first at full strength, the one-line summary muted beneath, and the
   date last and smallest. That is the row the wireframes drew and the stylesheet
   already builds.

4. **In-prose links underlined at rest.** Codecademy's dark-mode article and
   Polywork both underline links inside running prose rather than relying on
   colour. `.prose a` already does. This is worth recording rather than passing
   over, because `interaction-spec.md` § Reading Page Body lists the underline
   only in its *hover / focus* row, so the at-rest underline in the stylesheet
   could be misread as a deviation. It is not: it is the correct reading of the
   same "never use colour alone" principle the design system applies to `--rule`,
   and the references back it.

### What the check turned up — one change this pass makes

**A project rail link is distinguished from the value beside it by colour alone.**
In `.project-rail`, a `dd` holding a plain value renders `--text` and a `dd`
holding the repo or live link renders `--accent` with `text-decoration: none`;
the underline appears only on hover. So at rest, in the same column, in the same
size, the only thing separating "2026" from a link is hue.

This is the failure mode `design-system-mapping.md` § Measured contrast names
explicitly for `--rule` — "must never be the only thing conveying a boundary" —
arriving in a different place. Every reference that puts links in a metadata rail
gives them a second signal: Uxcel boxes them, Behance labels them, Codecademy
underlines. `interaction-spec.md` § Project Metadata Rail specifies only the
hover and focus states and is silent at rest, so adding the underline at rest is
additive rather than a contradiction — and it makes the rail consistent with
`.prose a` and `.contact-link a`, which already underline.

**It is a stylesheet change with no markup change**, which is exactly the kind of
fix this unit is allowed to make.

### Finding for the author — NOT applied by this plan

**Every reference puts the metadata rail on the right; this site puts it on the
left.** Uxcel, Behance, Linear and Skillshare all run the write-up down the left
and the metadata down a right-hand rail, which lets the body start at the page's
natural reading edge.

`interaction-spec.md` § Project Metadata Rail fixes the opposite, and for a
stated reason: *"Rail beside the body, in the DOM before it, so tab order matches
reading order."* With the rail first in the DOM, the left position is the one
where visual order and tab order agree. Moving it right would either desynchronise
the two — the exact fault BR11.7 exists to prevent — or require U3 to reorder the
markup and re-run its walkthrough.

So the references disagree with an approved decision that has a good reason
behind it, and the cost of following them is real. **Not applied.** Recorded so
the author can weigh it; changing it is a `mockups.md` § Project redraw and a U3
change, not a U5 one.

### One further fix, found while reading the stylesheet — not from Mobbin

**A long unbroken URL in post prose overflows the 66ch column.** `.prose` sets no
`overflow-wrap`, so a bare link longer than the measure pushes the page wider
than the viewport and produces horizontal scrolling on a phone. That breaks NFR6's
"the phone layout is the desktop layout contracted" in the most visible way
available, and it is one declaration in the stylesheet.

Labelled honestly: this did not come from the design references. It is included
because it is a one-line fix in the file this unit owns, for a defect a reader
would hit on the first post that cites a long URL.

## How this pass is reviewed

The review contract requires the reviewer to run this unit's validation tools.
Two of them write into the workspace root — the tree the review receipt is
fingerprinted against — so the reviewer invalidates its own verdict by doing what
it was told to do. U5's first pass hit this: the reviewer returned `READY` and
the verdict could not be recorded, three times.

The split is by whether a command writes into the workspace.

| Command | Writes into the workspace | Who runs it |
|---|---|---|
| `npx tsc --noEmit` | No | The reviewer, itself |
| `npx eslint .` | No | The reviewer, itself |
| `npx prettier --check .` | No | The reviewer, itself |
| `npx vitest run tests/u1 tests/u2 tests/u3 tests/u4 tests/u5` | No | The reviewer, itself |
| `npx vitest run tests/u1 tests/u2 tests/u3 tests/u4 tests/u5 --coverage` | Yes — `coverage/` | Run before the review; output recorded |
| `node --import tsx bin/check.ts` | Yes — `dist/`, `.build/` | Run before the review; output recorded |

The two writing commands run first, their verbatim output goes into
`code-summary.md`, and their output directories are removed so the tree is quiet
when the review is requested. The reviewer scrutinises that recorded output
instead of re-running those two, and says so in its review.

**What this costs, stated rather than glossed.** The coverage figure and the three
site-check results reach the reviewer recorded rather than independently
reproduced — a real reduction in independence on two of six checks. It is accepted
because the alternative is a verdict that can never be recorded, and because the
reviewer can still read `vitest.config.ts` directly to confirm the 80% threshold
was not weakened. Build and Test re-runs the whole gate independently afterwards.

## What already exists, and its verdict

| Thing | State | Verdict |
|---|---|---|
| `PageDefinition.register` (`"editorial" \| "technical"`) | Present since U1 | Unchanged — BR11.3's register class already reads it |
| `<body class="register-${page.register}">` in `shell.ts` | Present at line 207 | Unchanged |
| The content-security policy meta tag | Present, `default-src 'self'; style-src 'self'` with no `'unsafe-inline'` | Unchanged — and it is what makes an inline style break visibly |
| Any stylesheet | None. The site is currently unstyled markup | This unit adds exactly one |
| Any font file or static-asset copying in the build | None | This unit adds both |
| `aria-current="page"` on the current nav item | Present | Unchanged — the accent underline is an addition, never the only signal |

**So the two genuinely new things are a stylesheet and a static-asset copy step**
in the build. Everything else is markup that already exists being given a
treatment.

## The font, and the contingency if it cannot be fetched

[Q1] answer A: the `.woff2` is committed directly at
`src/assets/fonts/source-serif-4-latin.woff2` and copied into the build output.
Source Serif 4, variable, weights 400–600, Latin subset, SIL Open Font License —
the face `design-system-mapping.md` § Type § Families names and justifies.

**If the file cannot be obtained on this machine, the contingency recorded in
[Q1] applies**: everything else in this plan still lands, the serif tokens fall
back to `Georgia, "Times New Roman", serif`, and the font is added by a small
follow-up. A network failure must produce a shipped stylesheet, not a blocked
unit. Whichever way it goes is recorded in `code-summary.md`.

## Repository layout

**This pass touches exactly two files.**

| Path | Change |
|---|---|
| `src/assets/styles/site.css` | Modify — two declarations in § 5 Reading (Steps 1 and 2) |
| `tests/u5/stylesheet.test.ts` | Modify — two tests added (Step 3) |

Everything else the unit owns was landed by the first pass and is not touched
again:

| Path | First pass |
|---|---|
| `src/assets/styles/site.css` | New — the one stylesheet, eight sections |
| `src/assets/fonts/source-serif-4-latin.woff2` | New — the committed font file |
| `src/assets/fonts/LICENSE-source-serif-4.txt` | New — the OFL text, which must travel with the font |
| `src/page-renderer/shell.ts` | Modified — the two head elements |
| `src/site-builder.ts` | Modified — copies `src/assets/` into the output |
| `tests/u5/helpers.ts` | New |
| `tests/u5/head.test.ts` | New — the head elements and the same-origin property |
| `tests/u5/integration.test.ts` | New — the built output |

`site.config.ts` and every page template are read but not modified. **No page
template's markup changes**: if styling appears to need a markup change, that is
a finding for the owning unit, not a change to make here.

## Testable layers

| Layer | Applies | Why |
|---|---|---|
| Data model / database behaviour | No | U5 adds no entity |
| Repository / data access | No | No content is read differently |
| Business logic | No | No function branches or transforms data |
| API / endpoint | No | No API exists |
| Frontend behaviour | **Yes** | The head elements, the stylesheet, and the built output |

Omitted because vacuous, not to reduce the test count.

## Test obligations, and what is honestly untestable here

- **Standard strategy**: five to eight tests per component plus integration at
  key boundaries. **Twelve tests here** — the first pass's ten across head,
  stylesheet and build output, plus the two this pass adds for its two stylesheet
  changes — because this unit touches every page type.
- **Scope floor (`feature`)**: the 80% line-coverage floor, measured at Build and
  Test against the whole suite.
- **Neither may be weakened to make a step pass.**

**`functional-spec.md` states plainly that none of BR11.1–BR11.8 is verified by
the pre-push check set**, and that most have only a human observation behind
them. This plan does not pretend otherwise. What it does is automate the part
that genuinely can be:

| Rule | Automated here | Left to the walkthrough |
|---|---|---|
| BR11.1 | The rule exists in the stylesheet and targets standalone links below the breakpoint | The measured hit area at phone width |
| BR11.2 | `font-display: swap`, the preload element, and the fallback stack are present | Watching a cold-cache load |
| BR11.3 | Exactly one stylesheet link; the register is a root class | — |
| BR11.4 | Every `href`/`src` the site emits is same-origin; no `@import` of an off-origin URL | Reading the network panel on a live page |
| BR11.5 | — | Re-measuring the contrast table by hand. Nothing can automate this; the scan was declined |
| BR11.6 | One breakpoint (exactly one `@media` width query) | Loading each page type at phone width |
| BR11.7 | No `outline: none` without a replacement; no positive `order` on focusable children | Tab order and focus traps on all seven page types |
| BR11.8 | The row rule's padding derives from the tokens rather than a literal | The measured row height at phone width |

A test that asserted a colour contrast ratio or a rendered pixel height would be
asserting against a headless approximation, not against what a reader sees. The
honest position is the table above.

## Plan steps

`test-after`: implement the layer, then write and run its tests.

**The first pass landed the whole unit** — the stylesheet in its eight sections,
the committed font and its licence, the two head elements, the asset copy in the
build, and ten tests across three files. This pass makes two stylesheet changes,
tests them, and re-verifies the rest. The first pass's steps are preserved below
under § Superseded for provenance and are not re-executed.

### Phase A — The two changes, both in `site.css`

- [x] **Step 1** — In `src/assets/styles/site.css` § 5 Reading, give a project
      rail link its underline at rest rather than only on hover. Move the
      `text-decoration: underline; text-underline-offset: 2px;` pair from
      `.project-rail a:hover` onto `.project-rail a`, matching `.prose a` and
      `.contact-link a`. The colour stays `--accent`, the hover state keeps
      whatever it then still needs, and no other rule in the file changes.

      **Nothing about the markup changes** — this is a declaration moving between
      two selectors. The reason is § Mobbin consultation: at rest a rail link is
      separated from the plain value beside it by hue alone, which is the
      colour-only signal the design system rules out elsewhere in the same
      document. — *Traces: BR11.7, NFR1, `design-system-mapping.md` § Measured contrast, `interaction-spec.md` § Project Metadata Rail*

- [x] **Step 2** — In § 5 Reading, add `overflow-wrap: anywhere;` to `.prose` so
      a URL longer than the 66ch measure wraps instead of widening the page.
      Use `anywhere` rather than `break-word` so the break is taken inside the
      reading column rather than after it has already overflowed. **Add nothing
      else** — no hyphenation, no `word-break`, no change to the measure itself.
      — *Traces: NFR6, `interaction-spec.md` § Reading Page Body § Responsive*

### Phase B — The tests for those two changes

- [x] **Step 3** — Extend `tests/u5/stylesheet.test.ts` with two tests, taking
      the total for this unit from ten to twelve:
      1. `.project-rail a` carries `text-decoration: underline` in its own rule
         rather than only under a `:hover` selector — so a later edit that moves
         it back to hover fails rather than quietly reinstating a colour-only
         signal.
      2. `.prose` declares an `overflow-wrap` value that permits a break.

      Both assert against the stylesheet source, which is how every existing test
      in this file works. Neither asserts a rendered pixel width: that would be a
      headless approximation, which § Test obligations rules out. — *Traces: BR11.7, NFR1, NFR6*

- [x] **Step 4** — Run `npx vitest run tests/u5`, then the four checks that write
      nothing: `npx tsc --noEmit`, `npx eslint .`, `npx prettier --check .`,
      `npx vitest run tests/u1 tests/u2 tests/u3 tests/u4 tests/u5`. All must
      pass — this unit's stylesheet is linked from every page every other suite
      renders. — *Traces: NFR9, NFR12*

- [x] **Step 5** — Run the two that do write, capturing their output verbatim:
      `npx vitest run tests/u1 tests/u2 tests/u3 tests/u4 tests/u5 --coverage`,
      then `node --import tsx bin/check.ts`. Both must pass. Record the measured
      line-coverage figure against the 80% floor and all three site-check
      results. **Never weaken `thresholds.lines` in `vitest.config.ts` and never
      add a `coverage.exclude` entry.** — *Traces: NFR9, NFR12*

- [x] **Step 6** — Remove `dist/`, `coverage/` and `.build/` so the workspace is
      quiet before the review is requested. All three are gitignored build output
      regenerated by the commands above. — *Traces: this plan § How this pass is reviewed*

### Phase C — Verification this unit cannot automate, and the record

- [x] **Step 7** — Confirm against the built output that a rail link now renders
      underlined at rest and that the `↗` outbound mark
      (`interaction-spec.md` § Outbound Link, "colour alone never does") is
      present on the rail's repo and live rows. **If the mark is absent, that is
      a finding for U3 and not a change to make here** — the glyph is markup, and
      this unit changes no template. Record it either way. — *Traces: BR11.4, NFR1, `interaction-spec.md` § Outbound Link*

- [ ] **Step 8** — **The second keyboard walkthrough, on all seven page types**
      (Home, Writing, Post, Projects, Project, About, 404), after styling — W2
      steps 1–5. The skip link is first and becomes visible on focus; every
      focusable element shows the focus ring; tab order still matches visual
      order; nothing swallows focus. This is the run that catches what a
      stylesheet uniquely threatens, and it is **performed by the author**. It is
      named here rather than ticked as a developer step, so nobody can mark it
      done on the author's behalf.

- [ ] **Step 9** — W2 steps 6–9, also by the author: load every page type with
      the network panel open and confirm every request is same-origin; confirm
      no console policy violation; measure a list row and a standalone link at
      phone width; re-read the measured contrast table against the colours
      actually shipped.

- [x] **Step 10** — Update `code-summary.md` for this pass: Step 5's verbatim
      output, the coverage figure against the floor, both stylesheet changes and
      why each was made, Step 7's result, and every deviation. Update
      `traceability.json`, and write `source-manifest.json` listing exactly the
      application-source paths this pass touched — `src/assets/styles/site.css`
      and `tests/u5/stylesheet.test.ts`, and nothing else. Never claim a
      gitignored path. — *Traces: stage contract*

### Superseded — the first pass's steps

Listed for provenance. **Do not re-execute.** Phase A above changes two
declarations in what they produced; everything else they landed stands, and
Steps 4 and 5 re-verify it.

- [x] **Step 1 (first pass)** — Verify the runner: `npx vitest run tests/u1` passes.
- [x] **Step 2 (first pass)** — Obtain `source-serif-4-latin.woff2` (variable, weights
      400–600, Latin subset, SIL OFL) and commit it at `src/assets/fonts/`. If it
      cannot be obtained, record that in `code-summary.md` and apply the [Q1]
      contingency. *(It landed; the contingency did not apply.)*
- [x] **Step 3 (first pass)** — Write `src/assets/styles/site.css` in the eight sections
      `frontend-components.md` § The stylesheet's internal shape names, in that
      order: Tokens, Base, Shell, Rows, Reading, Targets, Responsive,
      Preferences. Every token from `design-system-mapping.md`, declared once in
      one `:root` block, with its exact value. The `@font-face` declaration
      carries `font-display: swap` and the Latin `unicode-range`.
- [x] **Step 4 (first pass)** — Add the two head elements in `src/page-renderer/shell.ts`:
      the font preload link, then the stylesheet link. Both same-origin,
      root-relative paths.
- [x] **Step 5 (first pass)** — Add a static-asset copy to `src/site-builder.ts`, running
      in the write phase after validation.
- [x] **Step 6 (first pass)** — `tests/u5/helpers.ts`.
- [x] **Step 7 (first pass)** — `tests/u5/head.test.ts`, four tests.
- [x] **Step 8 (first pass)** — `tests/u5/stylesheet.test.ts`, four tests.
- [x] **Step 9 (first pass)** — `tests/u5/integration.test.ts`, two tests against a real build.
- [x] **Step 10 (first pass)** — The unit-scoped and combined coverage runs.
- [x] **Step 11 (first pass)** — `npm run build`, `npm run check`, `typecheck`, `lint`,
      `format:check`.
- [x] **Step 14 (first pass)** — `code-summary.md`, `source-manifest.json` and
      `traceability.json`.

The first pass's Steps 12 and 13 — the author's walkthrough and network-panel
pass — were never performed. They are **not** superseded; they are carried
forward live as Steps 8 and 9 above.

## Story-to-code-step traceability

Step numbers are this pass's. Where the obligation was met by the first pass and
only re-verified here, the superseded step is named in brackets.

| Requirement / rule | Plan step |
|---|---|
| NFR1 — focus ring, tab order, no trap | Steps 1, 3.1, 7, 8 [first pass 3, 8.4] |
| NFR3, NFR4 — nothing from another server; the policy keeps holding | Steps 4, 9 [first pass 2, 3, 4, 7.3, 7.4, 8.2] |
| NFR6 — one breakpoint, phone as contraction | Steps 2, 3.2, 9 [first pass 3, 8.3] |
| NFR7 — the 44px floor | Step 9 [first pass 3] |
| NFR5 — no numeric performance target introduced | Deliberately nothing; see below |
| BR11.1 | Step 9 [first pass 3] |
| BR11.2 | Step 4 [first pass 2, 3, 4, 7.2] |
| BR11.3 | Step 4 [first pass 3, 4, 7.1] |
| BR11.4 | Steps 4, 7, 9 [first pass 2, 3, 7.3, 7.4, 8.2] |
| BR11.5 | Step 9 — by hand, because nothing else can |
| BR11.6 | Steps 2, 3.2, 9 [first pass 3, 8.3] |
| BR11.7 | Steps 1, 3.1, 8 [first pass 3, 8.4] |
| BR11.8 | Step 9 [first pass 3] |

## What this plan does not do

- **It introduces no numeric performance target.** NFR5 forbids one, and a font
  plus a stylesheet is exactly where a performance budget usually gets invented.
  No byte ceiling, no timing assertion, no budget file.
- **It changes no page template's markup.** If styling seems to need a markup
  change, that is a finding for the owning unit.
- **It adds no JavaScript.** The palette is dark-only with no toggle, so there is
  nothing for a script to do.
- **It adds no second stylesheet and no inline style.** BR11.3, and the policy
  carries no `'unsafe-inline'`.
- **It adds no icon font, icon sprite, or image asset.**
- **It does not adjust a token value.** Every value comes from
  `design-system-mapping.md` exactly; changing one would re-open the measured
  contrast table (BR11.5). Neither change in Phase A touches a colour, a size, a
  spacing step or the measure.
- **It does not move the project rail to the right**, which every design
  reference does. See § Mobbin consultation — the approved decision puts it left
  so that tab order and visual order agree, and overriding that is a `mockups.md`
  redraw and a U3 markup change, not a U5 one.
- **It does not add the `↗` outbound mark** where one may be missing. Step 7
  checks for it and records a finding; the glyph is markup.
- **It does not claim the walkthrough.** Steps 8 and 9 are the author's, and
  `traceability.json` records the rules that depend on them honestly.

## Assumptions carried into the plan

| ID | Assumption | Basis |
|---|---|---|
| U5CA1 | Source Serif 4's variable Latin-subset `.woff2` is obtainable under the SIL OFL and may be redistributed from this repository. | `design-system-mapping.md` § Type § Families. |
| U5CA2 | The font is preloaded and declared `font-display: swap`. | BR11.2. |
| U5CA3 | The serif fallback is the system serif stack (`Georgia, "Times New Roman", serif`). | U5A1; no fallback face is named upstream. |
| U5CA4 | The stylesheet is hand-authored plain CSS with custom properties, no preprocessor. | BR11.3; no CSS tooling exists and adding some is outside this unit. |
| U5CA5 | The register class uses the `register` field `PageDefinition` already carries. | BR11.3; U1 established the field. |
| U5CA6 | Static assets are copied in the build's write phase, after validation, so a content fault still stops the build before anything is written. | U1 BR4.1–BR4.5, the fail-loudly contract. |

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
