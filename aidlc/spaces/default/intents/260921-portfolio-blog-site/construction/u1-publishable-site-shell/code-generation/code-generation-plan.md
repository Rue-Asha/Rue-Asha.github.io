# Code Generation Plan — U1 Publishable Site Shell

**This is a second pass over a unit that is already built.** The twenty-six steps
of the first pass landed: the stack, the content model, both catalogues, the
derived functions, the markup renderer, the shell, all seven templates, the
build, the three checks, the fixtures, the tooling configuration and the
publishing workflow are on disk and green. Nothing in that spine is reopened
here.

What this pass does is narrower and was the reason for the re-entry: the markup
this unit emits was written against `refined-mockups/mockups.md` without the
design reference being consulted at build time, and three things the approved
mockups draw are not in the emitted markup. Two of them were already raised as
findings by U5, which could not fix them because they are markup rather than
style. This pass closes all three and re-runs the gate.

**This is the revision of that pass, requested at the gate.** The first attempt
generated all three markup changes and their tests, and the full gate came back
green; the review returned READY. The revision was requested for two reasons,
both recorded verbatim by the human: *"Fix the stale test count and stop the
reviewer writing build output"*. The code on disk is the first attempt's and is
not being rewritten — see § What the first attempt already landed and § How this
pass is reviewed.

## Sources

- [upstream] `construction/u1-publishable-site-shell/functional-design/functional-spec.md` — workflows W1–W7 and the three state machines
- [upstream] `construction/u1-publishable-site-shell/functional-design/rules.md` — BR1.1 to BR7.3, the 44 rules this unit enforces
- [upstream] `construction/u1-publishable-site-shell/functional-design/entities.md` — six entities with their types, constraints, defaults and bounds; § Additions fixes `SiteMetadata`'s purpose as head metadata only
- [upstream] `inception/units-generation/unit-of-work.md` — U1's boundary and the rule that its definition of done is not this stage's to write
- [upstream] `inception/requirements-analysis/requirements.md` — FR1.1 to FR1.7, FR4.2 to FR4.6, FR5.2 to FR5.5, NFR1 to NFR4, NFR8 to NFR12, constraints C1 to C4
- [upstream] `inception/domain-design/decisions.md` — ADR-001 to ADR-007
- [upstream] `inception/refined-mockups/mockups.md` § Global Shell, § Home, § 404 — the layout this pass reconciles the markup against
- [finding] `construction/u5-visual-direction/code-generation/code-summary.md` § Deviations, items 3 and 4 — the 404 message and the footer links, both raised against U1 and left for U1 to act on
- [reference] Mobbin, consulted at plan time — see § Mobbin consultation
- [Q1]–[Q4] `code-generation-questions.md` (first pass; unchanged and still binding)

## Mobbin consultation

Run before Plan Approval, per `project.md` § Corrections: *"Consult Mobbin before
Plan Approval for any Code Generation unit that renders UI, and name in the plan
which page types were checked and against which references."*

U1 renders the global shell and all seven page types at skeleton depth. The three
this unit still owns decisions for — the ones U2 to U5 do not take over — were
checked:

| Page type checked | References examined |
|---|---|
| Global shell — header and navigation | MOUTHWASH Studio, Sana, Clay, Runway, Handshake |
| Global shell — footer | Faculty Department, Shupatto, Garden, Family, Symbolic |
| Home — intro block and the two list sections | OpenAI, Webflow, Claude, Harvest, Titan |
| 404 | Cartesia, FREITAG, Becane, Firecrawl, Savor |

### What the references confirmed, and what they changed

**Header — no change.** Name on the left linking home, a short row of plain text
links on the right, a hairline beneath. Every reference in the set does this and
none of them reaches for a hamburger at three or four links, which is what
`mockups.md` § Responsive already decided. The emitted markup matches.

**Footer — a gap, and the references give the treatment.** Faculty Department
puts the name and copyright line on the left and a small slash-separated set of
text links on the right, all in micro-type; Shupatto does the same with the
links left and the locale right. `mockups.md` § Global Shell draws exactly that
shape — `(c) 2026 · GitHub · email` — and its Element table specifies the
treatment ("Mono 13px `--text-muted`; links take `--accent` on hover and focus,
underlined always"). `shell.ts` emits the copyright line alone, under a code
comment asserting that the mockups draw the copyright alone. **That assertion is
factually wrong**, and it is why U5 wrote a footer link treatment for links that
do not exist. Step 2 closes it.

**Home intro — the same gap, one line lower.** `mockups.md` § Home draws
`GitHub · email` in mono 13 directly beneath the intro sentence. `renderHome`
emits the `h1` and the intro paragraph and stops. Every personal-site reference
in the set carries some equivalent of that contact row in the opening block.
Step 3 closes it.

**404 — a gap in what can be styled.** Cartesia renders the message as a heading
with a distinctly quieter explanatory line beside it and route affordances
beneath; the quiet line is visibly not body prose. `mockups.md` § 404 specifies
"sans 17 muted" for *That page does not exist.* while About's paragraphs are
full-strength body text. Both currently render as a bare `main > p` with no
distinguishing class, so U5 cannot style the difference and both sit at `--text`.
Step 4 adds the class.

### Finding for the human — NOT applied by this plan

**The strongest recurring pattern for "a section of recent items on a personal or
editorial home page" is a two-column split**, and the approved Home is a single
column. OpenAI, Webflow ("Dream big"), the Claude blog index and Titan all put
the section label in a narrow left rail with the rows in a wider column to its
right, hairline-separated, with the "view all" affordance at the end of the
list. At desktop width it reads as more deliberate than a heading sitting on top
of its own rows, and it gives the eye a fixed left edge to return to.

`mockups.md` § Home is explicitly single-column, and § Responsive specifies a
single column at both widths with the phone layout as its contraction. Adopting
the rail would contradict an approved design decision, so **this plan does not
adopt it**. It is recorded here for the approval gate to weigh. Choosing it later
is a Refined Mockups change first and a markup change second, not a code
decision.

## Stack

Unchanged from the first pass and not reopened. Recorded here because the
plan is the developer's whole context.

| Concern | Choice |
|---|---|
| Runtime | Node.js 22 LTS, ESM (`"type": "module"`) |
| Language | TypeScript |
| Build execution | `tsx` to run the build and check entry points; `tsc --noEmit` as the type check |
| Markdown | `markdown-it` |
| Syntax colouring | `shiki` |
| Front matter | `gray-matter` |
| Tests | Vitest, with V8 coverage |
| Formatter | Prettier, defaults accepted |
| Linter | ESLint with `typescript-eslint`, defaults accepted |

No dependency is added, removed or upgraded by this pass. `package.json` and
`package-lock.json` are not touched.

## Files this pass touches

```
src/page-renderer/shell.ts       footer markup + the SITE_LINKS constant
src/page-renderer/pages.ts       Home contact row, 404 message class
tests/u1/page-renderer.test.ts   three added tests
```

No new source file, no new dependency, no configuration change, no content
change. Every other file in the repository layout the first pass established is
left exactly as it is.

## Where the two contact URLs live

The GitHub profile URL and the mailto address are currently hard-coded in
`renderAbout` (U4's page). This pass needs the same two values in the footer and
in Home's intro block, which would make three copies of each.

They go in **one exported module-level constant in `shell.ts`**, `SITE_LINKS`,
beside the `ROUTES`, `OUTPUT_PATHS`, `STYLESHEET_PATH` and `FONT_PATH` constants
that are already the established pattern in this unit. They do **not** go into
`SiteMetadata`: `entities.md` § Additions fixes that entity's purpose as "the
site-level values every page's *head* needs", and a visible footer link is not
head metadata. Widening an approved entity to avoid a module constant would be
the larger change, not the smaller one.

**Cross-unit note, recorded and not acted on here.** `renderAbout` keeps its own
literals after this pass, so two homes for the two URLs still exist. Switching
About to read `SITE_LINKS` is U4's edit to U4's function, and it belongs in U4's
own pass in this attempt. It is named again in § What this plan does not do so
that it cannot be lost between the two units.

## Testable layers

The Testing Contract below names five layers. This pass touches exactly one.

| Contract layer | Touched by this pass |
|---|---|
| Data model / database behaviour | No |
| Repository / data access | No |
| Business logic | No |
| API / endpoint | **Not applicable.** There is exactly one deployable and it is static output (`requirements.md` C1); no endpoint exists to test. Recorded rather than invented. |
| Frontend behaviour | **Yes** — rendered markup: the shell's footer, Home's intro block, the 404 message |

## Test obligations

Standard strategy, `feature` scope. Both sets apply; neither replaces the other.

- 5–8 tests per component, unit plus integration at key boundaries
- 80% line-coverage floor, enforced as a Vitest threshold and run in CI before merge
- Test-after ordering: implement the change, then write and run its tests before
  the change is treated as done

The floor is inherited from `org.md` by scope and is not this stage's to lower.
No threshold in `vitest.config.ts` may be relaxed to make a step pass; a gap is
surfaced instead.

**One stated overshoot.** `tests/u1/page-renderer.test.ts` held **15** tests
before this pass and holds **18** after it — far above the 5–8 band. PageRenderer
is one component covering the shell plus seven templates, and the band is per
component, so it was already by some distance the widest file in the unit.
Cutting an existing test to stay inside the band would remove coverage of an
accessibility or head-metadata rule to satisfy a soft guideline, which is the
wrong trade. Recorded here rather than resolved silently.

The first draft of this plan put those figures at "7–8 today, 10–11 after". They
were never counted — they were carried across from the first pass's per-component
target — and the review caught it. That is the first of the two corrections this
revision was requested for.

## What the first attempt already landed

On disk now, written by the first attempt of this pass and verified green:

| File | Change |
|---|---|
| `src/page-renderer/shell.ts` | The `SiteLink` type, the exported `SITE_LINKS` constant (GitHub profile + mailto), and `renderContactLinks(indent)`; the footer emits the copyright line plus both contact links; the false comment about § Global Shell is gone |
| `src/page-renderer/pages.ts` | `renderHome` emits the contact row beneath the intro from the same constant; `renderNotFound` gives the message `page-note` and the route line `page-routes` |
| `tests/u1/page-renderer.test.ts` | Three added tests plus two slicing helpers (`footerOf`, `homeIntroOf`); 15 → 18 tests |

Two implementation decisions the first attempt made, kept rather than reopened.
The anchors are unclassed and the container carries the styling hook
(`footer-line contact-link`, `home-contact contact-link`), because U5's existing
selector is already `.contact-link a` and an anchor class would be a second way
to say the same thing. And no literal `·` is emitted: a middot welded between two
anchors is read aloud by a screen reader and cannot be respaced, so drawing the
separator is U5's, from those container classes.

This revision does not rewrite any of it. The steps below verify it and finish
the record.

## How this pass is reviewed

This is the second of the two corrections the revision was requested for.

**The problem.** The review contract requires the reviewer to run this unit's
validation tools. Two of them — `npx vitest run tests/u1 --coverage` and
`node --import tsx bin/check.ts` — write `coverage/`, `dist/` and `.build/` into
the workspace root. That is the same tree the review receipt is fingerprinted
against, so the reviewer invalidates the receipt by doing exactly what it was
told to do, and its verdict cannot be recorded. The first attempt hit this, and
the stage diary records an earlier run hitting it too — including the finding
that clearing those directories beforehand does not help, because the reviewer
recreates them mid-review.

**The procedure, from this attempt onward.** The split is by whether a command
writes into the workspace.

| Command | Writes into the workspace | Who runs it |
|---|---|---|
| `npx tsc --noEmit` | No | The reviewer, itself |
| `npx eslint .` | No | The reviewer, itself |
| `npx prettier --check .` | No | The reviewer, itself |
| `npx vitest run tests/u1` | No | The reviewer, itself |
| `npx vitest run tests/u1 --coverage` | Yes — `coverage/` | Run before the review; output recorded |
| `node --import tsx bin/check.ts` | Yes — `dist/`, `.build/` | Run before the review; output recorded |

The two writing commands run first, their verbatim output goes into
`code-summary.md`, and their output directories are removed so the tree is quiet
when the review is requested. The reviewer scrutinises that recorded output
instead of re-running those two, and says so in its review.

**What this costs, stated rather than glossed.** The coverage figure and the
three site-check results reach the reviewer recorded rather than independently
reproduced. That is a real reduction in the review's independence, on two of six
checks. It is accepted because the alternative is a review whose verdict can
never be recorded at all, and because the reviewer can still read
`vitest.config.ts` directly to confirm the 80% threshold was not weakened — which
is the failure mode the coverage check actually exists to catch. Build and Test
re-runs the whole gate independently afterwards.

## Plan steps

Each step names what it implements. User Stories is SKIP in this scope, so
traceability keys on functional requirements, `BRx.y` rule IDs and the approved
mockup sections rather than `USx.y` story IDs.

### Phase A — Verify what is on disk

- [x] **Step 1** — Confirm the three source changes in § What the first attempt
  already landed are present and correct against `mockups.md` § Global Shell,
  § Home and § 404. Read the mockup sections themselves rather than this plan's
  description of them. If any change is missing or wrong, complete it to the
  description in that section; do not redesign it. — *Traces: BR5.1, BR5.6, `mockups.md` § Global Shell, § Home, § 404, FR4.2, FR4.3*

- [x] **Step 2** — Confirm `tests/u1/page-renderer.test.ts` carries the three
  added tests and that they are the three specified: every page's footer carries
  the copyright line and both contact links, each with an accessible name
  identifying its destination; Home's contact row emits the same two URLs as the
  footer, asserted against `SITE_LINKS` so a second hard-coded copy would fail;
  the 404 message carries `page-note` while About's paragraphs do not. Count the
  tests in the file and state the figure. — *Traces: BR5.1, BR5.6*

### Phase B — The gate, in two halves

- [x] **Step 3** — Run the four checks that write nothing into the workspace:
  `npx tsc --noEmit`, `npx eslint .`, `npx prettier --check .`,
  `npx vitest run tests/u1`. All must pass. — *Traces: NFR9, NFR12*

- [x] **Step 4** — Run the two checks that do write, and capture their output
  verbatim: `npx vitest run tests/u1 --coverage`, then
  `node --import tsx bin/check.ts`. Both must pass. Record the measured
  line-coverage figure against the 80% floor and all three site-check results.
  Check 3 matters specifically here: the footer adds two outbound links to every
  page, and check 3 deliberately does not follow external links (BR6.4, NFR11),
  so a pass confirms they did not become an internal-link failure. **Never weaken
  `thresholds.lines` in `vitest.config.ts`**; if coverage falls short, write
  tests and surface the gap. — *Traces: NFR9, NFR11, NFR12, BR6.1–BR6.5*

- [x] **Step 5** — Remove the three generated output directories — `dist/`,
  `coverage/`, `.build/` — so the workspace is quiet before the review is
  requested. All three are gitignored build output regenerated by the commands
  above; nothing is lost. This is the mechanical half of § How this pass is
  reviewed. — *Traces: this plan § How this pass is reviewed*

### Phase C — The record

- [x] **Step 6** — Rewrite `code-summary.md` for this pass. It carries the
  verbatim output captured in Step 4, the counted test figure from Step 2, the
  coverage figure against both the 80% floor and the first attempt's 95.72%,
  what changed and what did not, and every deviation. — *Traces: stage contract*

- [x] **Step 7** — Update `traceability.json`, and write `source-manifest.json`
  listing exactly the three application-source paths this pass touched and
  nothing else. It must not claim a path this pass did not write, and must not
  claim a gitignored path — a gitignored path is refused as source-review
  evidence, which is how `.build/build-manifest.json` broke an earlier
  attempt. — *Traces: stage contract*

## What this plan does not do

Stated so the boundary is checkable rather than assumed.

- **It does not adopt the two-column Home rail.** See § Mobbin consultation. The
  approved single-column Home stands; the finding is for the human at the gate.
- **It does not change U4's About page.** Switching `renderAbout` to read
  `SITE_LINKS` instead of its own literals is U4's edit in U4's pass, and it is
  the one loose end this plan knowingly leaves. Until it happens, the two contact
  URLs have two homes.
- **It does not restyle anything.** Every class this pass adds is a hook; the
  values behind them are U5's, and U5's `site.css` is not edited here.
- **It does not re-run the six walking-skeleton conditions.** They are proved at
  Build and Test against the live site. Assumption CA5 is unchanged.
- **It does not perform the keyboard walkthrough.** The footer adds two focusable
  stops to every page of the site, so the seven walkthroughs `team.md` § Testing
  Posture requires must be re-run after this pass and again after U5's styling.
  That is the author's step and is named at the gate, not ticked here.
- **It does not switch the repository's Pages source.** Assumption CA4 is
  unchanged and still outstanding.
- **The feed is U2's**, and no stub or placeholder is left for it.

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
