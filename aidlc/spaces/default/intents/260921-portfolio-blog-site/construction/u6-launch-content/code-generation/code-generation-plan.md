# Code Generation Plan — U6 Launch Content

Two Markdown files. No code, no template, no test, and no instrumentable line —
`functional-spec.md` resolved this unit's design as not applicable and gave the
reason, and this plan is the same conclusion carried into Construction rather
than quietly reversed.

What this unit does need is care about the *content model it must satisfy*: a
missing or malformed field fails the build naming the file and the field, and a
published slug can never change. Those are the two ways a content commit goes
wrong, and both are checkable.

**This is the second pass.** The first landed both files. The stage gate was then
rejected so every unit that renders UI could be re-entered with the design
reference consulted at build time — and **this unit is exempt from that check**,
because it renders no UI (see § The Mobbin check does not apply here). What the
re-entry actually produced is a correction: the first pass asserted that this
site has no draft state, which is false, and both files shipped live on that
premise. [Q2] settles what to do about it. Nothing else about the unit changes.

## The Mobbin check does not apply here

`project.md` § Corrections requires a Mobbin consultation before Plan Approval
for any Code Generation unit that renders UI, and exempts a unit that renders
none. **U6 renders none.** It produces two Markdown files: no template, no
component, no stylesheet, no build code, no configuration. `unit-of-work.md` § U6
leaves the unit untagged rather than calling it `ui` for exactly this reason —
none of `service`, `spec`, `ui`, `packaging` or `library` describes written
content.

The page types this content appears on are U1's, U2's and U3's templates styled
by U5, and each was checked against real references during that unit's own
re-entry. Repeating the check here would attribute another unit's design work to
this one and produce findings nobody here can act on.

Recorded rather than silently omitted: an absence with a stated reason is
readable; an absence without one looks like a skipped step.

## The correction this pass carries

`code-generation-questions.md` asserted that **"there is no draft state"** and
that adding one would be a change to U1's content model. That is false.
`src/content-source.ts` implements U1 BR1.6 and BR1.7: an optional boolean
`draft` key is read (`readDraftMark`, line 142), a non-boolean value is a hard
field error rather than a coerced one, and every draft is dropped before anything
downstream sees it (line 321). Required fields are validated before the mark is
read, so a malformed draft is still an error.

The author's [Q1] answer asked for "draft entry ... and later refine them", and
the mechanism to honour that literally was in the codebase the whole time. The
questions file is corrected, and [Q2] answer B settles the outcome: **both pieces
stay published**, because this unit's deliverable is a site that does not look
empty at launch and these are the only substantial content it has. "Draft" means
the prose is a first pass, and that is now a decision with a reason rather than a
consequence of a mechanism believed absent (U6CA7).

## Sources

- [upstream] `construction/u6-launch-content/functional-design/functional-spec.md`
  — the not-applicable resolution, the constraints table, and how a
  not-applicable unit records traceability
- [upstream] `construction/u6-launch-content/functional-design/entities.md` and
  `rules.md` — the inherited content model and the twelve borrowed rule IDs
- [upstream] `inception/units-generation/unit-of-work.md` § U6 — the boundary:
  content files only, no templates, no build code, no styling
- [upstream] `inception/requirements-analysis/requirements.md` — FR1.5, FR2.5,
  FR3.3, NFR8, NFR9, which constrain this unit without being delivered by it
- [Q1] `code-generation-questions.md` — the two named pieces and the draft
  instruction

The declared `contract-summary`, `performance-design`, `security-design` and
`infrastructure-specification` inputs are absent: Contract Design, NFR Design and
Infrastructure Design are all SKIP in this scope.

## What this unit produces

| Path | What |
|---|---|
| `content/projects/homelab/index.md` | Project write-up for the Proxmox homelab, drawn from `/home/Rue/Repos/Homelab-Managment` |
| `content/posts/implementing-a-methodology-paper/index.md` | Post about implementing AI-DLC as a harness, drawn from the author's own notes |

Nothing else. No template, no stylesheet, no build code, no configuration, and
no change to the two content files U1 wrote.

## Both slugs are permanent from the moment they are pushed

NFR8 and U1 BR1.4 make the directory name the URL, and a renamed slug breaks
every link anyone shared with no server-side redirect available on GitHub Pages.

- `homelab` is not a free choice: `/home/Rue/Repos/Homelab-Managment/README.md`
  already links readers to `rue-asha.github.io/projects/homelab/`. Using
  anything else would publish a broken link in a repository that is already
  public.
- `implementing-a-methodology-paper` is chosen for what the post is about rather
  than for the acronym, because acronyms age and the URL cannot be changed.

## Sourcing: what may be written and what may not

Every factual claim in both files traces to something on disk. **Nothing about
the author's experience, opinions or history is invented.**

| File | Source of fact |
|---|---|
| Homelab write-up | `/home/Rue/Repos/Homelab-Managment/README.md` — the service table, the app-per-LXC two-repo model, the Terraform/Ansible split, the `NN_` playbook ordering, the `.envrc`/`ANSIBLE_CONFIG` detail, and the `docs/` notes |
| AI-DLC post | `/home/Rue/Repos/AI-DLC-BLOG-NOTES.md` — the author's own notes, explicitly labelled "raw material for a later post", including the premise, the deviations, the traceability-direction mistake, and the closing honesty about scope |

Where the notes offer several framings, the draft picks one and leaves the rest
for the author. Where a fact is not in either source, it is not written.

## Testable layers, and the coverage floor

| Layer | Applies |
|---|---|
| Data model / database behaviour | No |
| Repository / data access | No |
| Business logic | No |
| API / endpoint | No |
| Frontend behaviour | No |

**No layer applies, so this unit authors no unit test.** That is not a shortcut:
`functional-spec.md` says it outright, and `unit-of-work.md` § U6 instructed it —
"no unit test to author, and no instrumentable line for the coverage floor to
measure".

**Coverage floor: `N/A — no instrumentable lines in this unit`.** `team.md`
§ Testing Posture requires that this be recorded with its reason rather than
reported as a pass, and requires that zero instrumentable lines produce no
measurement rather than a passing one. The reason is that the unit's entire
deliverable is Markdown prose.

**The existing suite must remain green**, and the three blocking checks are this
unit's real verification — check 2 in particular, which exists precisely to catch
a content file that failed to produce a page.

## How this pass is reviewed

The review contract requires the reviewer to run this unit's validation tools,
and one of them writes into the workspace root — the tree the review receipt is
fingerprinted against. A reviewer that runs it invalidates its own verdict by
doing what it was told to do.

| Command | Writes into the workspace | Who runs it |
|---|---|---|
| `npx tsc --noEmit` | No | The reviewer, itself |
| `npx eslint .` | No | The reviewer, itself |
| `npx prettier --check .` | No | The reviewer, itself |
| `npx vitest run tests/u1 tests/u2 tests/u3 tests/u4 tests/u5` | No | The reviewer, itself |
| `node --import tsx bin/check.ts` | Yes — `dist/`, `.build/` | Run at Step A2; output recorded |

Step A2's verbatim output goes into `code-summary.md` and its output directories
are removed at the end of the pass, so the tree is quiet when the review is
requested. The reviewer scrutinises that recorded output rather than re-running
it, and says so in its review.

**What this costs.** The three site-check results reach the reviewer recorded
rather than independently reproduced. For this unit that is the *entire* automated
verification, so the reduction in independence is larger here than elsewhere and
is worth stating plainly. It is accepted because the alternative is a verdict that
can never be recorded, and Build and Test re-runs the whole gate independently
afterwards. No coverage command appears above at all: this unit has no
instrumentable line to measure.

## Plan steps

**Both content files already exist and their prose is not rewritten.** This pass
re-verifies them against the site as it now stands — U5's stylesheet landed after
they were written — and records the correction above. Four steps, then the record.

### Phase A — Verification against the finished site

- [x] **Step A1** — Confirm neither `content/projects/homelab/index.md` nor
      `content/posts/implementing-a-methodology-paper/index.md` carries a `draft`
      key, which is [Q2] answer B. Change nothing else in either file: the prose
      is the author's to refine. — *Traces: U1 BR1.6, BR1.7, [Q2]*

- [x] **Step A2** — `npm run build` then `node --import tsx bin/check.ts`. The
      site builds, **every content file produced a page — including both of
      these** — and every internal link resolves. This is the whole of this
      unit's verification, and check 2 is the one that exists to catch a content
      file the build silently dropped. — *Traces: NFR9, FR1.5*

- [x] **Step A3** — Run the existing suite and the four non-writing checks:
      `npx vitest run tests/u1 tests/u2 tests/u3 tests/u4 tests/u5`,
      `npx tsc --noEmit`, `npx eslint .`, `npx prettier --check .`. All must
      stay green. **No new test is added and `vitest.config.ts` is not touched**
      — there is no instrumentable line in this unit to test. `prettier --check`
      must not want to rewrite either content file; `proseWrap: "preserve"` plus
      the `.prettierignore` entry for the content tree is what prevents it, and
      if it tries, that is a finding about the configuration rather than a reason
      to let it reformat prose. — *Traces: NFR9, `team.md` § Code Style*

- [x] **Step A4** — Confirm both pages appear where they should in the built
      output: the post in the Writing list and on Home, the project in the
      Projects list and on Home, each at its permanent slug. Confirm the Homelab
      project's rail omits the live-URL row rather than rendering it empty
      (U6CA1). — *Traces: FR1.5, FR3.4, NFR8*

### Phase B — The record

- [x] **Step A5** — Update `code-summary.md` for this pass: the verbatim output
      of Steps A2 and A3, the [Q2] correction and its outcome, the Mobbin
      exemption and its reason, and the coverage line recorded as
      `N/A — no instrumentable lines in this unit` with that reason, never as a
      pass. Update `traceability.json` and write `source-manifest.json` claiming
      only paths this pass actually wrote — **if Step A1 changes nothing, the
      `writes` array is empty**, and an empty array is the honest record rather
      than a claim invented to fill it. — *Traces: stage contract*

### Superseded — the first pass's steps

Listed for provenance. **Do not re-execute.** They wrote both files; Phase A
verifies their result.

- [x] **Step 1** — Read `/home/Rue/Repos/Homelab-Managment/README.md` and enough
      of its `docs/` and `terraform/`/`ansible/` layout to write accurately.
- [x] **Step 2** — Write `content/projects/homelab/index.md` with all six
      required fields: `name`, `summary`, `year`, `type`, `tools`, `repo`. Omit
      the optional live URL — a private home network has none, and the rail row
      is omitted rather than rendered empty (U6CA1). Body: what the homelab is,
      the app-per-LXC two-repo model, and the Terraform/Ansible split.
- [x] **Step 3** — Read `/home/Rue/Repos/AI-DLC-BLOG-NOTES.md`.
- [x] **Step 4** — Write
      `content/posts/implementing-a-methodology-paper/index.md` with `title`,
      `summary` and `date`. Body: a first-pass draft in the author's register,
      built from the notes' own arc — implementing a paper as the way to read
      it, the deviations that follow from being one person rather than a room,
      the two layers built faithfully and then removed, and the closing caveat
      about scope.
- [x] **Step 5** — Confirm every code fence in the post names a language the
      highlighter knows, or no language at all. An unknown language fails the
      build (U2 BR8.2), and a draft is exactly where a stray fence label slips
      in.
- [x] **Step 6** — Confirm no image is referenced. If one ever is, it carries
      alt text (U2 BR8.1) — an authoring rule the build does not check.
- [x] **Step 7** — `npm run build` then `npm run check`: the site builds, every
      content file produced a page — **including both new ones** — and every
      internal link resolves. This is the verification for this unit.
- [x] **Step 8** — Run the existing suite: `npx vitest run tests/u1 tests/u2
      tests/u3 tests/u4 tests/u5 --coverage`. It must remain green. No new test
      is added and the threshold is not touched.
- [x] **Step 9** — `npm run format:check`. Prettier is configured with
      `proseWrap: "preserve"` and a `.prettierignore` entry for the content tree,
      so it must not rewrite either file's line breaks. If it tries to, that is a
      finding about the configuration, not a reason to let it reformat prose.
- [x] **Step 10** — Confirm both new pages appear where they should: the post in
      the Writing list and on Home, the project in the Projects list and on Home,
      each at the slug above.
- [x] **Step 11** — Write `code-summary.md`, `source-manifest.json` and
      `traceability.json`, the last recording FR1.5, FR2.5, FR3.3, NFR8 and NFR9
      as `N/A` with the unit that actually delivers each, per
      `functional-spec.md` § How a not-applicable unit is recorded.

## Story-to-code-step traceability

Step numbers are this pass's. Where the obligation was met by the first pass and
only re-verified here, the superseded step is named in brackets.

| Requirement / rule | Plan step | Note |
|---|---|---|
| FR2.5 — a post's field set | Step A2 [first pass 4] | Constrains this unit; delivered by U1 |
| FR3.3 — a project's field set | Step A2 [first pass 2] | Constrains this unit; delivered by U1 |
| FR1.5 — content appears in its list | Step A4 [first pass 10] | Constrains this unit; delivered by U2 and U3 |
| FR3.4 — the live-URL rail row omitted when absent | Step A4 | Constrains this unit; delivered by U3 |
| NFR8 — permanent slugs | Step A4 [first pass 2, 4] | Both slugs chosen once, deliberately; neither changes in this pass |
| NFR9 — the three blocking checks before the push | Steps A2, A3 [first pass 7] | Content commits are exempt from branching, not from checking |
| U1 BR1.6, BR1.7 — the draft mark | Step A1 | The correction this pass carries; [Q2] answer B |
| U2 BR8.1 — image alt text | Step A2 [first pass 6] | |
| U2 BR8.2 — known fence languages | Step A2 [first pass 5] | An unknown fence label fails the build, so A2 covers it |

## What this plan does not do

- **It adds no `draft` field.** Not because none exists — U1 BR1.6 and BR1.7
  provide one, and the first pass was wrong to say otherwise — but because [Q2]
  answer B chose to keep both pieces published. U6CA7 records that as a decision.
  "Draft" here means the prose is a first pass, and the author refines it in
  place.
- **It rewrites nothing U1 wrote.** The existing post and project stay as they
  are.
- **It adds no test and reports no coverage figure for this unit.** Recorded as
  `N/A` with the reason, never as a pass.
- **It invents no fact about the author.** Every claim traces to a file on disk.
- **It touches no template, stylesheet, or build code.** If the prose wants a
  presentation capability the layout lacks, that is a change to U2's templates
  and a separate piece of work (U6A1).

## Assumptions carried into the plan

| ID | Assumption | Basis |
|---|---|---|
| U6CA1 | The Homelab project has no public live URL; the optional field is omitted and its rail row omitted with it. | U1 BR3.4; `wireframes.md` § Project. |
| U6CA2 | The Homelab slug is `homelab`, fixed by the README's existing public link. | NFR8. |
| U6CA3 | The post's slug is `implementing-a-methodology-paper`. | NFR8, U1 BR1.4. |
| U6CA4 | The post's `date` is the date the file is written, ISO 8601. | U1 BR2.3. |
| U6CA5 | Neither file needs a presentation capability the layout lacks. | U6A1. |
| U6CA6 | U1's two content files are untouched. | `unit-of-work.md` § U6. |
| U6CA7 | Neither file carries a `draft` key. The mechanism exists and was deliberately not used, because this unit's deliverable is a site that does not look empty at launch. | [Q2] answer B; U1 BR1.6, BR1.7. |

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
