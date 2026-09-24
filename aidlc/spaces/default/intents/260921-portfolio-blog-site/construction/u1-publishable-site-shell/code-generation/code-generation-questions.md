# Code Generation Questions — U1 Publishable Site Shell

Four questions. Construction questions are meant to be exceptional rather than
routine, and this count is low because the approved upstream artifacts already
settled almost everything.

## What was subtracted, and what settled it

These were not asked, because an approved artifact already answers them:

| Topic | Settled by |
|---|---|
| Whether to adopt a static-site generator | `inception/domain-design/decisions.md` ADR-001 — none is adopted; we write the build |
| Component boundaries and which component owns what | `inception/domain-design/components.md`, ADR-002, ADR-003, ADR-006, ADR-007 |
| Every validation rule, its trigger and its failure behaviour | `construction/u1-publishable-site-shell/functional-design/rules.md` (BR1.1–BR7.3) |
| Entity shapes, types, constraints, defaults, bounds | `construction/u1-publishable-site-shell/functional-design/entities.md` |
| Build phase ordering and the fail-loudly contract | ADR-004, BR4.1–BR4.5 |
| That one runner runs all three checks, and what each check does | ADR-004, BR6.1–BR6.5 |
| Publishing route, its trigger, and its four required controls | ADR-005, `inception/units-generation/unit-of-work.md` U1 |
| The exact content-security-policy value | BR5.10 |
| Test methodology and ordering | The Testing Contract in `code-generation-plan.md` (resolved, not chosen) |
| Slug format and that published slugs never change | BR1.4, NFR8 |

What remains genuinely open is the one thing ADR-001 explicitly handed to this
stage — "Code Generation picks the Markdown renderer, highlighter and
front-matter parser" — plus the runtime those choices sit in, the site-level
values `SiteMetadata` requires and no content file carries, and one boundary
question the walking skeleton raises that no upstream artifact answers.

---

## Questions

### Q1 — Which runtime and language should the build be written in?

`aidlc-state.md` records Languages, Frameworks and Build System all as `Unknown`,
and `team.md` § Code Style says the formatter and linter are chosen "at the same
time as the stack". Nothing upstream names one. This choice also decides the test
runner, the formatter, the linter, and what the publishing workflow installs.

Two constraints narrow it, both already fixed: the build must emit complete HTML
with nothing rendered in the reader's browser, and every third-party dependency
must come from a committed lockfile with no build-time fetch.

- A. **Node.js with TypeScript.** Type checking catches a whole class of mistake
  in the validation code, where a field error naming the wrong field is the exact
  failure this build exists to prevent. Tooling is Prettier + ESLint + Vitest —
  the three `team.md` § Code Style already names by example. Costs a compile step
  and a `tsconfig`.
- B. **Node.js with plain JavaScript.** No compile step; the file you edit is the
  file that runs. Same Prettier/ESLint/Vitest tooling. Costs the type checking, on
  a codebase whose whole job is validating loosely-typed front matter.
- C. **Python.** Strong Markdown and YAML ecosystem, and a build script reads
  plainly. Costs: it is a second toolchain in a repository whose lint rule for
  future client-side JavaScript (`team.md` § Code Style) assumes a JS linter is
  present anyway.
- D. **Go.** Single static binary, fastest build, no lockfile-versus-node_modules
  question at all. Costs the most code for templating and Markdown, and the
  furthest distance from the tooling `team.md` describes.
- X. Other (please specify)

[Answer]: A

### Q2 — Which Markdown renderer, syntax highlighter and front-matter parser?

ADR-001 closed the generator question by answering "none", and explicitly left
these three libraries to this stage. The hard constraint is that syntax colouring
runs at build time and emits plain markup — nothing runs in the reader's browser
and nothing is fetched from another server.

`MarkupRenderer` is the one component wrapping substantial third-party code
(ADR-003), so whatever is chosen sits behind that single boundary.

- A. **markdown-it + Shiki + gray-matter.** Shiki colours at build time using the
  same grammars an editor uses, so code blocks look right without a browser-side
  highlighter existing anywhere. markdown-it is stable and plugin-friendly.
  Heaviest of the three in install size.
- B. **marked + highlight.js + gray-matter.** Smallest dependency footprint and
  the fastest build. highlight.js at build time is entirely capable; its output is
  less faithful than Shiki's on some languages.
- C. **unified/remark + rehype-pretty-code + gray-matter.** The most composable,
  and the easiest to extend later for the named reusable includes `team.md`
  § Code Style requires. Most packages to keep in the lockfile and the steepest
  configuration.
- D. **A-but-fewer-dependencies: markdown-it + Shiki, and we parse front matter
  ourselves** against a strict subset (the six field types `entities.md` declares
  and nothing else). Removes one dependency and makes BR1.9's "unparseable is a
  field error naming the file" ours to define exactly. Costs a parser to maintain.
- X. Other (please specify)

[Answer]: A

### Q3 — What are the site's name, base URL and fallback description?

`entities.md` adds `SiteMetadata` as a singleton holding four values no content
file carries. Three of them are yours to choose; the fourth (the
content-security-policy string) is fixed by BR5.10 and is not in question.

The base URL is effectively determined — a GitHub Pages user site published from
`Rue-Asha.github.io` serves at `https://rue-asha.github.io` — but the site name
and the fallback description are editorial, and the fallback is what makes "a
description on every page" true by construction rather than by remembering
(BR5.8).

- A. **Use these**: site name `Rue Asha`, base URL `https://rue-asha.github.io`,
  fallback description `Writing and projects by Rue Asha.`
- B. **Use these, but with a different fallback description** — keep the name and
  URL above and tell me the sentence you want.
- C. **I'll give you all three** — different site name, and I'll confirm the URL.
- X. Other (please specify)

[Answer]: A

### Q4 — How many page types does the skeleton emit?

This is the one genuine boundary question the walking skeleton raises and no
upstream artifact settles. The unit's boundary says "the shell and enough of the
page templates to serve one post page and one project page"
(`functional-design/functional-spec.md`). But BR5.7 puts Writing, Projects and
About in the navigation on every page, and BR6.3 makes an internal link that does
not resolve a blocking check failure. So a nav link to a page that U4 has not
built yet fails check 3 — which means the skeleton either emits those pages or
does not link to them.

Writing and Projects are effectively forced: BR5.5 specifies their empty states,
which cannot exist without the pages. About is the open part — it is U4's unit.

- A. **All seven page types at skeleton depth**, with About carrying one short
  placeholder paragraph that U4 replaces. Every nav link resolves, check 3 passes,
  and the keyboard walkthrough can run on all seven now. The placeholder prose is
  throwaway by design.
- B. **Six page types** — Home, Writing, Post, Projects, Project, 404 — and About
  is left out of the navigation until U4 lands. No placeholder prose is written,
  but the shell changes again when U4 arrives, and the walkthrough re-runs then.
- C. **All seven**, with About emitting the shell and a heading and no prose at
  all. Nothing throwaway is written; the page is visibly unfinished if anyone
  reaches the live site before U4.
- X. Other (please specify)

[Answer]: A

---

## How these were asked

The plan-approval guard refuses every shell command for this stage — including
the `aidlc-log` decision/answer pair — until Plan Approval is explicitly
answered. A logged interview checkpoint therefore cannot exist before Plan
Approval, so the four questions above were put directly and their answers written
here. Plan Approval remains the audited human checkpoint, and the plan these
answers produce is exactly what its fingerprint binds.

---

## Second pass — the Mobbin re-entry

The four questions above are from the first pass. They are answered, still
binding, and are not re-asked: the stack, the libraries, the site-level values
and the seven-page-type boundary are all settled and this pass changes none of
them.

**Nothing new was asked for this pass, and the reason is worth recording.** The
re-entry has one instruction — consult Mobbin before Plan Approval for any unit
that renders UI, and name in the plan which page types were checked against which
references (`project.md` § Corrections). That produced three gaps between the
approved mockups and the emitted markup and one pattern that contradicts an
approved decision. The three gaps are not open questions: `mockups.md` already
decides each of them and the markup simply does not match, so asking would be
asking the author to re-decide something they approved. The one contradiction is
not a question either — it is a finding, and the place a finding is weighed is
the approval gate, not a question file.

The guard behaviour recorded below still applies, so this note is here rather
than in an audited interview checkpoint.

---

## Revision of the second pass

Request Changes was submitted at the gate with this exact reason: *"Fix the stale
test count and stop the reviewer writing build output"*.

Both corrections are in the revised plan and the revised instructions rather than
deferred into the steps, because an approved plan cannot be edited afterwards
without invalidating its own approval — the plan a revision hands the developer
has to be correct at the moment it is approved.

1. **The stale test count.** The first draft said `page-renderer.test.ts` held
   7–8 tests and would reach 10–11. Neither figure was counted; both were carried
   across from the first pass's per-component target. The file held 15 and now
   holds 18. Corrected in the plan § Test obligations and in
   `unit-test-instructions.md`, in both the prose and the table, each with a note
   saying what the earlier figures were and why they were wrong.
2. **The reviewer writing build output.** Recorded as a new plan section, § How
   this pass is reviewed, with the command split, the procedure, and an honest
   statement of what the change costs the review's independence.

No question was re-asked. The four first-pass questions are unchanged and still
binding, and the revision reopened nothing they settled.

---

## Plan Approval

Approve this exact Code Generation plan?

[Approval Fingerprint]: sha256:v3:b8926fac6e7b10d8cbc1e84908ee7c14be5b472221f155de72b0e05fbe071780
[Planned Source]: 3c5325f786f1ead6d4ef307ba6c679ae6768f009a6b5163a93f5f7f5ff0874d1

- Approve Plan
- Request Changes

[Answer]: Approve Plan

---

## Assumptions carried into the plan

Recorded rather than asked, because each follows from an approved artifact or is
reversible at no cost. Each is labelled so it stays an assumption downstream.

| ID | Assumption | Basis |
|---|---|---|
| CA1 | The build writes to `dist/` at the repository root, and `dist/` is gitignored. | No upstream artifact names an output directory. `BuildManifest.outputRoot` exists precisely so the name is not hard-coded anywhere else. |
| CA2 | `SiteMetadata` lives in one configuration file at the repository root, outside `content/`. | `functional-design/functional-spec.md` FA4 — the location is this stage's to choose; that it is not content is settled by BR1.1. |
| CA3 | Item assets are copied beside the item's page and referenced with relative links from the body. | `functional-design/functional-spec.md` FA2. |
| CA4 | Switching the repository's Pages source from *branch* to *GitHub Actions* is a manual settings change the author makes once. Code cannot do it. | ADR-005 changes the Pages source; nothing in the repository can set it. |
| CA5 | The six walking-skeleton conditions are proved at Build and Test, not here. This stage produces the code and the deliberately-broken-post fixture; condition 4 (break it, revert, confirm) is exercised against the live site. | `unit-of-work.md` U1 — "its definition of done is not ours to write". |
