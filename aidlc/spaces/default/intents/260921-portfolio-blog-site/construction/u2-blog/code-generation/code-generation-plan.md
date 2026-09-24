# Code Generation Plan — U2 Blog

The post half of the site, deepened from the skeleton U1 left. This unit does
**not** start from nothing: U1 built all seven page types at skeleton depth, and
two of the three things U2 delivers are already partly standing. What follows
distinguishes, step by step, what exists and is correct, what exists and must
change, and what does not exist at all.

**This is a second pass over a unit that is already built**, and the reason for
the re-entry is `project.md` § Corrections: the design reference was never
consulted at build time for any unit that renders UI. The first pass's work — the
fence-language rule, the feed, the autodiscovery link, and the verification that
`pages.ts` was already correct — is on disk and green, and none of it is
reopened. What this pass adds is the Mobbin consultation below, one correction it
turned up, and a re-run of the gate under the review procedure in § How this pass
is reviewed.

## Sources

- [upstream] `u2-blog/functional-design/functional-spec.md` — W1 to W5, the
  screen-state machine, and BR8.1 to BR8.7
- [upstream] `u2-blog/functional-design/frontend-components.md` — the template
  hierarchy, the props/branches table, and the one-link-per-row commitment
- [upstream] `inception/units-generation/unit-of-work.md` § U2 — the boundary and
  the nine deliverables
- [upstream] `inception/requirements-analysis/requirements.md` — FR2.1 to FR2.9,
  FR4.3, FR5.1, NFR2, NFR3, NFR7, NFR12, constraint C4
- [upstream] `inception/domain-design/components.md` — `PostCatalog`,
  `MarkupRenderer`, `ContentTransforms`, `PageRenderer`, `SiteBuilder`
- [upstream] `inception/refined-mockups/mockups.md` § Writing, § Post;
  `interaction-spec.md` § Code Block — the row shape and the four-token ceiling
- [upstream] `construction/u1-publishable-site-shell/functional-design/rules.md`,
  `entities.md` — BR1.x to BR7.x and the six entities, consumed not restated
- [upstream] `u1-publishable-site-shell/code-generation/code-summary.md` — the
  stack as built, and the two properties this unit must not break
- [Q1] `code-generation-questions.md` — the feed's path and how it is found

## Mobbin consultation

Run before Plan Approval, per `project.md` § Corrections: *"Consult Mobbin before
Plan Approval for any Code Generation unit that renders UI, and name in the plan
which page types were checked and against which references."*

U2 owns two page types. Both were checked:

| Page type checked | References examined |
|---|---|
| Writing — the post index | Greptile ("All Posts"), Cursor, Better Stack, Tailscale, Linear |
| Post — the article page | TIDAL, Upwork, FARFETCH, IKEA, Eventbrite |

### What the references confirmed

**The Writing row shape is right, and the references are unanimous about why.**
`mockups.md` § Writing draws title on the left, date right-aligned in mono with an
uppercase abbreviated month, one-line summary beneath the title, hairline between
rows, whole row one link. Titan, Better Stack and Greptile all use that
three-part row; Greptile is the closest match in register, setting the date in
mono micro-type against a sans title. The emitted markup — `postRow`'s single
anchor around title, `<time datetime>` and summary — supports it exactly, and the
ordering inside the anchor reads correctly aloud: title, date, summary. **No
change.**

**The Post page's opening block is right, in the same order.** `mockups.md`
§ Post draws back-link → serif title → muted one-line dek → mono date → hairline →
narrow body column. TIDAL's essay pages are that order verbatim, including the
dek set as a distinct quieter line rather than as the first body paragraph, and
Upwork and FARFETCH both put the date in micro-type beneath the title rather than
above it. `renderPost` emits exactly that sequence. **No change.**

**The code block's keyboard reachability is already correct.** `interaction-spec.md`
§ Code Block requires the scroll container to be keyboard-focusable when it
overflows, which is markup rather than style — a stylesheet cannot add
`tabindex`. `markup-renderer.ts` emits `<pre class="code-block" tabindex="0">`.
Checked because this is precisely the kind of thing that gets deferred to a
stylesheet that cannot deliver it. **No change.**

### What the check turned up — one correction

**A false claim about the footer, repeated from U1 and now stale twice over.**
This plan's Step 6 and `code-summary.md` both assert that *"`mockups.md` § Global
Shell draws the footer as the copyright line alone, and adding to an approved
layout is not this unit's to do"*. That assertion was wrong when it was written:
§ Global Shell draws `(c) 2026 · GitHub · email` and its Element table specifies a
footer link treatment. It originated as a code comment in `shell.ts`, U5 raised
it as a finding, and U1's pass has now deleted the comment and emitted the two
links.

The **decision** U2 made is unaffected and stands: the feed gets no visible footer
link, because the approved footer draws a copyright line and two contact links
and no feed link. Only the stated reason was false. Corrected here so the
falsehood does not survive in a third artifact.

### Finding for the human — NOT applied by this plan

**Every reference index in the set carries a per-row category or tag**, and this
site's rows carry none. Cursor shows `Research · Sep 12, 2025`, Better Stack
shows `Blog · Better Stack`, Greptile runs a whole tag rail with counts. The
absence here is deliberate rather than an oversight — topic search and tagging are
recorded as deferred, not excluded — so adopting tags is a scope decision, not a
code one.

**The same two-column question raised against Home applies here.** Greptile puts
the date in a narrow left rail with title and summary in a wider right column;
`mockups.md` draws a single column with the date right-aligned. If that rail is
wanted, it is one Refined Mockups change covering Home, Writing and Projects
together rather than three separate ones — which is the argument for deciding it
once rather than per unit. **This plan does not adopt it.**

## What already exists, and its verdict

Read against the unit's nine deliverables before any step was written, so this
plan changes what needs changing rather than rewriting what does not.

| Deliverable | State after U1 | This plan |
|---|---|---|
| Writing page listing every post with title, summary, date | `renderWriting` + the `postRow` include, complete | Verify against BR8.5 under test; no change expected |
| Ordering by declared date, never mtime | `sortPosts`, tested by U1 | Consumed. Not reimplemented |
| Each row one link target | `postRow` emits one anchor around all three values | Verify against BR8.6 under test; no change expected |
| A page per post with title, summary, date, body | `renderPost`, complete | Verify against BR8.7 under test; no change expected |
| Markdown with headings, links, lists, images, code | `markdown-it` renders all five; only code blocks were tested | Tests for the remaining four, and for alt text passing through unchanged (BR8.1) |
| Build-time colouring, never in the browser | Shiki tokenizer emitting `tok-comment` / `tok-string` / `tok-keyword` + plain — the four-token ceiling, already met | Consumed. Verified under test, not rebuilt |
| "All posts" links top and end | `renderPost` emits both | Verify against BR8.4 under test; no change expected |
| Writing empty state | `emptyState` with the Projects route | Verify against W5 under test; no change expected |
| **The feed** | **Does not exist.** U1 left no stub and no placeholder, deliberately | **Built here** |

Two things exist and are **wrong for this unit**, and both are real work:

1. **An unknown fence language currently renders plain and silently.**
   `renderCode` falls back for any label it has no grammar for, which is [Q2]
   option A. Functional Design chose option D: unlabelled renders plain, a
   *labelled* unknown language fails the build naming file and language (BR8.2).
2. **`buildSitemap` and the build's output set know nothing about a feed.** W4
   step 5 requires the feed to be written and recorded in the build manifest.

## Where the fence check runs, and why it is not in the renderer

BR8.2 says a bad fence label "fails the build". The obvious implementation puts
the failure inside `MarkupRenderer`, which is where the rule's `applies_to`
points — and that implementation is wrong here, for a reason worth stating
because it is not obvious.

`SiteBuilder` runs four phases in fixed order: load, validate, render, write
(BR4.1). Rendering happens after validation has already aborted on any field
error. So a fence error raised during rendering could only ever be reported in a
run where no front-matter error existed — a post with both a missing date *and* a
typo'd fence label would report the date, be fixed, rebuilt, and only then report
the fence. That is two fix cycles for one broken file, and it contradicts BR4.2:
a build reports **every** field error.

So the check runs in the **validate** phase, over each item's raw body, using the
same language registry the renderer uses. `MarkupRenderer` exports the predicate;
`SiteBuilder` calls it where every other field error is collected. The rule is
unchanged — a labelled unknown language fails the build naming file and language
— and it now fails in the same breath as every other fault in the same run. BR4.4
is untouched: validation still aborts before anything is written.

`BR8.2` anticipated the mechanism question and left it to this stage
(`known_language_resolution`: PRIMARY ask the highlighter, FALLBACK declare a set
in configuration). The PRIMARY route is available — Shiki exposes its bundled
grammars and their aliases — so no configured label list is introduced, and the
fallback stays unused.

## Repository layout

No new directories beyond the test tree. Every source change lands in a file U1
created, because the component boundaries `components.md` draws are unchanged and
this unit adds no component.

```
src/markup-renderer.ts        changed  — fence-language predicate; the silent
                                         labelled fallback removed
src/content-transforms.ts     changed  — buildAtomFeed, FEED_OUTPUT_PATH
src/site-builder.ts           changed  — fence errors in the validate phase;
                                         the feed written and recorded
src/page-renderer/shell.ts    changed  — feed autodiscovery link in every head
src/page-renderer/pages.ts    unchanged expected — verified under test
tests/u2/                     new      — four test files and their fixtures
```

## Testable layers

The Testing Contract below names five layers. Three carry work in this unit; two
do not, and are recorded rather than filled.

| Contract layer | Here | Covered by |
|---|---|---|
| Data model / database behaviour | **Not applicable.** The `Post` entity and its field rules were authored and tested by U1; this unit adds no entity and changes no field | — |
| Repository / data access | **Not applicable.** `PostCatalog`'s rules are U1's and are consumed unchanged | — |
| Business logic | Feed construction; the fence-language predicate; the build's error collection | `ContentTransforms`, `MarkupRenderer`, `SiteBuilder` |
| API / endpoint | **Not applicable.** One deployable, static output (`requirements.md` C1); no endpoint exists | — |
| Frontend behaviour | Rendered markup: the Writing rows, the post page, the rendered body, the head link | `PageRenderer`, `MarkupRenderer` |

## Test obligations

Standard strategy, `feature` scope. Both sets apply; neither replaces the other.

- 5–8 tests per component, unit plus integration at key boundaries
- 80% line-coverage floor, enforced as the existing Vitest threshold
- Test-after ordering: implement the function or template first, then write and
  run its tests before the change is treated as done

The floor is inherited from `org.md` by scope and is not this stage's to lower.
No threshold in `vitest.config.ts` may be relaxed and no `coverage.exclude` entry
added to make a step pass; a gap is surfaced instead.

The suite runs as `npx vitest run tests/u1 tests/u2 --coverage`. U1's 82 tests
stay green: this unit changes shared code, and a regression in the shell or the
renderer would land in U1's suite first.

## How this pass is reviewed

The review contract requires the reviewer to run this unit's validation tools.
Two of them — `npx vitest run tests/u1 tests/u2 --coverage` and
`node --import tsx bin/check.ts` — write `coverage/`, `dist/` and `.build/` into
the workspace root. That is the same tree the review receipt is fingerprinted
against, so the reviewer invalidates its own verdict by doing what it was told to
do; U1's first review returned READY and its verdict was refused three times for
exactly that reason.

The split is by whether a command writes into the workspace.

| Command | Writes into the workspace | Who runs it |
|---|---|---|
| `npx tsc --noEmit` | No | The reviewer, itself |
| `npx eslint .` | No | The reviewer, itself |
| `npx prettier --check .` | No | The reviewer, itself |
| `npx vitest run tests/u1 tests/u2` | No | The reviewer, itself |
| `npx vitest run tests/u1 tests/u2 --coverage` | Yes — `coverage/` | Run before the review; output recorded |
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
this scope, so traceability keys on functional requirements and the `BRx.y` rule
IDs rather than `USx.y` story IDs.

**The first pass landed every source change this unit needed** — the fence
predicate and the removed silent fallback in `markup-renderer.ts`, `buildAtomFeed`
and `FEED_OUTPUT_PATH` in `content-transforms.ts`, the validate-phase fence errors
and the feed write in `site-builder.ts`, the autodiscovery link in `shell.ts`, and
27 tests across four files under `tests/u2/`. `pages.ts` was verified and left
alone. This pass verifies that work, applies the one correction the Mobbin check
turned up, and finishes the record. It writes **no new application code**.

### Phase A — Verify what is on disk

- [x] **Step 1** — Verify the Writing row and the Post page against `mockups.md`
  § Writing and § Post by reading those sections themselves, not this plan's
  description of them. Confirm: `postRow` wraps title, `<time datetime>` and
  summary in exactly one anchor (BR8.6); `renderWriting` emits one row per post
  with all three values and none twice (BR8.5); `renderPost` carries title, dek,
  date and body in that order and emits exactly two "All posts" links (BR8.4,
  BR8.7); the empty Writing page keeps its heading and routes to Projects (W5).
  Confirm the Writing row's date uses the abbreviated month form and the post
  page's uses the full one, since that distinction is a formatting decision in
  `formatDisplayDate` and not something a stylesheet can make. If anything is
  wrong, fix it to the mockup; do not redesign it. — *Traces: BR8.4–BR8.7, W5, FR2.1, FR2.3, FR2.4, FR2.8, `mockups.md` § Writing, § Post*

- [x] **Step 2** — Verify `<pre class="code-block" tabindex="0">` is still emitted
  by `markup-renderer.ts`, and that the rendered output still carries no
  `<script>`, no inline `style` attribute and no off-origin URL. The `tabindex` is
  what `interaction-spec.md` § Code Block's overflow state needs and a stylesheet
  cannot supply it. — *Traces: `interaction-spec.md` § Code Block, NFR2, NFR3, FR2.7*

### Phase B — The one correction

- [x] **Step 3** — Correct the false footer claim in
  `<cg-record>/code-summary.md`. It currently states that `mockups.md` § Global
  Shell draws the footer as the copyright line alone; § Global Shell draws
  `(c) 2026 · GitHub · email`. Replace the reason without changing the decision:
  the feed still gets no visible footer link, because the approved footer draws a
  copyright line and two contact links and no feed link. Note that U1's pass has
  since emitted those two links, so a reader comparing the summary to the code
  does not conclude the summary describes a different site. **Do not edit
  `code-generation-plan.md`** — the correction is already in its § Mobbin
  consultation, and editing an approved plan invalidates its own approval. —
  *Traces: `mockups.md` § Global Shell, [Q1]*

### Phase C — The gate, in two halves

- [x] **Step 4** — Run the four checks that write nothing: `npx tsc --noEmit`,
  `npx eslint .`, `npx prettier --check .`,
  `npx vitest run tests/u1 tests/u2`. All must pass, U1's suite included — this
  unit changed shared code, so a regression would land there first. — *Traces: NFR9, NFR12*

- [x] **Step 5** — Run the two that do write, capturing their output verbatim:
  `npx vitest run tests/u1 tests/u2 --coverage`, then
  `node --import tsx bin/check.ts`. Both must pass. Record the measured
  line-coverage figure against the 80% floor and against the first pass's 96.15%,
  and all three site-check results. **Never weaken `thresholds.lines` in
  `vitest.config.ts` and never add a `coverage.exclude` entry**; if coverage falls
  short, write tests and surface the gap. — *Traces: NFR9, NFR12, BR6.1–BR6.5*

- [x] **Step 6** — Remove `dist/`, `coverage/` and `.build/` so the workspace is
  quiet before the review is requested. All three are gitignored build output
  regenerated by the commands above. — *Traces: this plan § How this pass is reviewed*

### Phase D — The record

- [x] **Step 7** — Finish `code-summary.md` for this pass: Step 5's verbatim
  output, the coverage figure against both the floor and the first pass's figure,
  the Step 3 correction, and every deviation. Update `traceability.json`, and
  write `source-manifest.json` listing exactly the application-source paths this
  pass touched — which, if Steps 1 and 2 find everything correct, is **none**. An
  empty `writes` array is the honest manifest for a pass that changed no source;
  do not pad it with paths this pass only read, and never claim a gitignored path.
  — *Traces: stage contract*

## Read literally, flagged once

`BR5.11` says the sitemap carries an entry for every page in
`BuildManifest.pagesWritten` except the sitemap itself. W4 step 5 requires the
feed to be recorded in the manifest, and `pagesWritten` is the only field that
records what a build wrote. Read literally, the feed therefore appears in the
sitemap.

This plan follows the rule literally rather than quietly narrowing it, which is
the same choice U1 made for `/404.html` and recorded for the same reason: a
Construction artifact is the wrong place to reverse an approved rule on taste.
Both items — the 404 page and the feed appearing in the sitemap — are one
condition of the same one-line change to `buildSitemap` if Build and Test decides
the rule is meant to list pages only. Flagged here so the decision is made once,
with both cases in view.

## What this plan does not do

Stated so the boundary is checkable rather than assumed.

- **No styling.** Every treatment in `mockups.md` § Writing and § Post — the
  hairline rules, the right-aligned monospace date, the hover tint, the focus
  ring, the code block's recessed well and its four token colours — is U5's. This
  unit emits the structure and the class names U5 colours, and the two
  commitments `frontend-components.md` § What U5 must not be forced to undo names
  are already honoured by the markup U1 wrote.
- **No content.** Launch content is U6's. The posts exercising the full Markdown
  set live in `tests/u2/fixtures/`, not in `content/`. The one seed post U1 wrote
  is left alone.
- **No project-page work.** `renderProject` and `ProjectCatalog` are U3's. The
  fence-language rule does reach project bodies, because `MarkupRenderer` is one
  shared boundary — recorded as assumption U2CA2 rather than silently scoped.
- **The keyboard walkthrough is not run here.** It is manual, it is the only
  verification behind the mandated WCAG 2.1 AA rule, and it runs on the Writing
  and Post page types at Build and Test — then again after U5 applies the
  styling.
- **Post ordering, draft exclusion, field validation and the slug rule are not
  reimplemented.** They are U1's, they are tested, and U2 consumes them. A
  template that re-sorted would move a tested rule somewhere no test reaches.
- **`U2OQ1` is not closed.** A deleted slug reused by a different post makes a
  subscriber inherit the old entry's identity. It depends on U1's `FA1`, which
  records deletion behaviour as undecided, and it is carried to Build and Test
  with `FA1` rather than resolved by inventing a tombstone here.

## Assumptions carried into the plan

Recorded rather than asked, because each follows from an approved artifact or is
reversible at no cost. Each is labelled so it stays an assumption downstream.

| ID | Assumption | Basis |
|---|---|---|
| U2CA1 | The feed's `updated` value may be the newest post's declared date rather than a build timestamp. | No artifact specifies it, and `ContentTransforms` is pure by contract (ADR-003). A clock read here would make the suite time-dependent, which is the failure U1's injected `buildDate` exists to avoid. |
| U2CA2 | The fence-language rule (BR8.2) applies to project bodies as well as post bodies. | `MarkupRenderer` is one shared boundary (ADR-003) and the rule's trigger is "rendering a fenced code block", not "rendering a post". Splitting the behaviour by kind would put two answers behind one rule. U3 inherits the behaviour rather than re-deciding it. |
| U2CA3 | Shiki's bundled grammar list, including aliases, is the authority for "a language the highlighter knows". | BR8.2 `known_language_resolution` PRIMARY. The configured-label fallback it allows is not introduced, because the PRIMARY route works with the highlighter already in the lockfile. |
| U2CA4 | The feed document is not read by check 3, because check 3 reads `.html` files. Its *discovery link*, emitted into every page head, is checked like any other internal link — so a feed that failed to write would fail check 3 on every page. | `check-runner.ts` `htmlPages`; BR6.3. This is the closest thing to automated verification the feed gets, and it is worth knowing it exists. |

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
