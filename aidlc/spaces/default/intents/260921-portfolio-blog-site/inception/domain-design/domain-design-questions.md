# Domain Design — Questions

Six questions about **where the boundaries go**: which pieces of this site are
things you write code for, which are things the build tool already does, and who
owns what.

**What this stage is not deciding.** Deployment topology is Units Generation's
job, and the specific tool names below are illustrations rather than a choice —
naming the product is a later decision. What *is* decided here is the shape:
which capabilities you own as code and which are somebody else's, because that
is exactly what a component boundary is.

**One thing worth saying plainly before the questions.** This site is a build,
not a running system. Nothing executes while a reader is on the page — the
requirements forbid it (`inception/requirements-analysis/requirements.md` NFR2,
NFR3). So every component below is a build-time building block, and the "system"
whose boundaries we are drawing is the thing that turns a folder of Markdown
into a folder of HTML.

## Sources

- [desc] Initial description: "I want to build a Github.io Blog site to present my work and make blog posts about things I currently learning or I find to be interesting. For UX/UI I want you to use Mobbin"
- [scope] Workflow-selected scope: `feature`.
- [upstream] `inception/requirements-analysis/requirements.md` — the FR and NFR set these components must realise, and OQ3, which named this stage as one of the places the generator question closes
- [upstream] `inception/practices-discovery/team-practices.md` — the three blocking checks, the definition of malformed content, what counts as code needing unit tests, and the disqualification of client-side rendering
- [upstream] `inception/refined-mockups/mockups.md`, `inception/refined-mockups/design-system-mapping.md` — the seven page types and the token system the templates realise
- [Q1]–[Q6] this file

The declared `stories` input is absent: User Stories is SKIP in this scope, so
traceability enumerates functional requirements instead. The `architecture` and
`component-inventory` inputs are brownfield-only and this project is greenfield.

---

## Q1 — Do you own the build, or adopt one?

This is the boundary question everything else hangs off. A static-site generator
already does content discovery, Markdown rendering, templating, and output
writing. If you adopt one, those are **external dependencies** and the code you
own is small. If you write your own, they are **components** and you own all of
them.

Weight on the scale: the requirements need build-time syntax colouring, a draft
mechanism, a feed, a sitemap, head metadata, exclusion of `aidlc/` and
`.claude/` from the output, and — the awkward one — a build that **fails loudly**
naming the file and the field when content is malformed. Most generators do the
first six well and the last one badly; they skip or warn.

A. **Adopt a generator.** Content discovery, Markdown, templating, and output
   are its job. You own templates, configuration, and a small number of build
   modules for the things it does not do well. (Eleventy, Astro, Hugo and Jekyll
   are the obvious candidates; which one is a later decision.)
B. **Write the build yourself.** Full control, nothing to fight, and the
   fail-loudly behaviour is yours by construction. Cost: content discovery,
   front-matter parsing, Markdown rendering, templating, and output writing all
   become code you maintain forever, for a site with two posts.
C. **Adopt a generator, but own the content layer.** The generator handles
   templating and output; your own code reads the content directory, validates
   it, and hands the generator a checked model. Cost: one more moving part than
   A, and you have to keep your reader and the generator's in step.
X. Other (please specify)

[Answer]: B. Write the build yourself
**Timestamp:** 2026-09-23T10:24:00Z
**Mode:** guided

---

## Q2 — Where does front-matter validation live?

`requirements.md` FR1.5 is specific: the **build** fails, naming the file and the
field. Not a separate linter that you might forget, and not a warning. The team
practice behind it is blunt — a build that succeeds while silently dropping a
post breaks the site's only mandated publishing rule while reporting green.

Where that check runs decides whether FR1.5 is actually satisfied or merely
approximated.

A. **Inside the build, as a step it cannot skip.** Validation runs as part of
   the generator's own build, and a failure fails the build. Satisfies FR1.5
   literally. Cost: it has to hook into whatever the adopted generator offers,
   which varies by generator and is a real selection criterion.
B. **A separate script run before the build**, wired so the build command runs
   validation first and stops on failure. Simpler to write and generator-
   independent. Cost: "the build" is now two things, and someone invoking the
   generator directly bypasses the check.
C. **A schema the generator enforces natively**, if the chosen generator
   supports typed content collections with required fields. Cost: only some
   generators have this, so it narrows the choice further, and the error message
   is theirs rather than yours.
X. Other (please specify)

[Answer]: A. Inside the build, as a step it cannot skip
**Timestamp:** 2026-09-23T10:24:00Z
**Mode:** guided
**Note:** With Q1 answered B, option A's stated cost — hooking into whatever an
adopted generator offers — does not arise. The build is ours, so validation is
simply one of its steps and cannot be bypassed by invoking something else.

---

## Q3 — One content model, or two?

Posts and projects have different required fields — a post needs title, summary
and date; a project needs name, summary, year, type, tools and repo, with an
optional live URL (`team-practices.md` § Testing Posture). They also render
differently, list differently, and only posts appear in the feed.

But they share a great deal: both are Markdown files with front matter, both
have a slug that is the file name, both are validated the same way, both can be
drafts.

A. **Two entities, `Post` and `Project`**, each owned by its own component, each
   with its own validation rules and its own list and detail templates. Shared
   behaviour (slug derivation, draft filtering, Markdown rendering) lives in a
   component both depend on.
B. **One entity, `ContentItem`, with a `kind` field** (`post` or `project`) and
   a shape that varies by kind. One component owns it; templates branch on kind.
   Fewer moving parts, one validation path.
C. **Two entities that share a common base** — one component owns the common
   shape and the validation machinery, and two thin components own the
   post-specific and project-specific parts. The most structure; the most places
   to look when something is wrong.
X. Other (please specify)

[Answer]: A. Two entities, `Post` and `Project`
**Timestamp:** 2026-09-23T10:24:00Z
**Mode:** guided

---

## Q4 — The three blocking checks: one thing or several?

The affirmed check set is three checks, all blocking, all run on your machine
before the push: the site builds; every non-draft content file produced an
output page; internal links resolve across the built output
(`team-practices.md` § Testing Posture; `requirements.md` NFR9, NFR10).

Check 1 is the build itself. Checks 2 and 3 can only run **after** the build,
because they inspect its output.

A. **One check runner** that runs the build, then runs the output checks against
   what it produced, and reports all failures together. One command to remember,
   one thing to wire into the pre-push habit.
B. **The build, plus a separate output-check command** you run after it. Two
   commands, or one wrapper script that calls both. More separable, easier to
   run one check in isolation while debugging.
C. **Fold what can be folded into the build** — the generator itself reports
   pages written, so check 2 becomes a build-time assertion, and only the link
   check runs afterwards. Fewest separate parts; cost is that check 2's
   behaviour depends on the generator's reporting.
X. Other (please specify)

[Answer]: A. One check runner
**Timestamp:** 2026-09-23T10:26:00Z
**Mode:** guided
**Note:** Presented with option C's wording adjusted for Q1=B — the build that
reports pages written is ours, not a generator's.

---

## Q5 — Where do the small derived functions live?

`team-practices.md` names these explicitly as the code that needs unit tests:
date formatting, excerpt or summary derivation, post sorting, slug generation,
feed and sitemap construction. They are small, pure, and used from several
places — and they are the only code on this site that the 80% line-coverage
floor can actually apply to.

A. **One shared component** owning all of them, depended on by whatever needs
   them. One place to find them, one place to test them, and the coverage floor
   has a single clear target.
B. **Distributed to the component that uses each one** — sorting with the post
   component, feed construction with the syndication component, and so on.
   Cohesive with their use; the tests spread across several components and the
   coverage figure becomes several figures.
C. **Split by nature**: the pure text and date helpers in one shared component,
   and the feed and sitemap builders with syndication, since those produce whole
   documents rather than transforming a value.
X. Other (please specify)

[Answer]: A. One shared component
**Timestamp:** 2026-09-23T10:26:00Z
**Mode:** guided

---

## Q6 — How do the templates decompose?

Seven page types, one global shell, two visual registers, and a rule from
`team-practices.md` § Code Style: when a post needs a presentation capability
the layout does not have, it becomes a **named reusable include** used by name,
never one-off markup pasted into prose.

A. **One rendering component** owning the shell, all seven page templates, and
   the includes. Templates are configuration more than logic, and splitting them
   creates boundaries with nothing behind them.
B. **Shell and page templates separate** — one component owns the global frame,
   head metadata and 404; another owns the seven page bodies. The frame changes
   on a different rhythm from the pages it wraps.
C. **Split by register** — an editorial rendering component for Post and
   Project, a technical one for Home, the lists, About and 404. Matches the
   design's own split. Cost: the shell belongs to neither, and every shared
   include has to pick a side.
X. Other (please specify)

[Answer]: A. One rendering component
**Timestamp:** 2026-09-23T10:26:00Z
**Mode:** guided

---

## Q7 — Follow-up: how does a self-written build reach GitHub Pages?

Raised because Q1's answer (B, write the build yourself) pulls against an
already-affirmed practice rather than against another answer here.

`team-practices.md` § Deployment states a preference plainly: "As long as the
check set runs only on the author's machine, the built-in build remains viable
and is the smallest attack surface available — nothing of ours executes on every
push." `requirements.md` C3 records why that is a real constraint: GitHub's
built-in Pages build runs a **fixed Jekyll build with no user-defined steps**.

A build we wrote cannot run there. So answering Q1 as B forecloses the built-in
build, and the site has to reach Pages some other way. Worth stating that this
is not only a consequence of B: the built-in build survives **only** with Jekyll.
Eleventy, Astro and Hugo would each have needed a workflow too, so Q1=A would
not have preserved it either unless the generator chosen were Jekyll
specifically.

Both options below keep the mandated publishing rule intact — write a file,
commit, push, and the page is live (FR1.1, FR1.2) — but they put the cost in
different places.

A. **Publish through a GitHub Actions workflow in this repository.** A push to
   `main` triggers the workflow; it runs our build and deploys the output to
   Pages. Pages source changes from *branch* to *GitHub Actions*. This activates
   the four controls `team-practices.md` § Deployment already requires of any
   such workflow: top-level `permissions: contents: read` with `pages: write` /
   `id-token: write` on the deploy job alone, every third-party action pinned to
   a full commit SHA, nothing triggering on `pull_request_target`, and no
   build-time fetch outside the lockfile. Cost: our code executes on every push,
   which is exactly the attack surface the affirmed preference wanted to avoid.
   Gain: the check set gets a remote backstop for free, closing the gap
   `team-practices.md` § Deployment names — a push that skipped the local checks.
B. **Build locally and commit the output.** Our build runs on your machine —
   which NFR9 already requires before every push, as check 1 — and its generated
   output is committed alongside the source. The built-in Pages build serves
   those files as-is. Nothing of ours ever executes on GitHub. Cost: generated
   HTML lives in version control, every content commit carries a build diff, and
   a forgotten rebuild publishes stale content silently, with nothing to catch
   it. The commit step grows from `git add post.md` to `git add post.md _site/`.
C. **Reconsider Q1 and adopt Jekyll specifically**, the one generator the
   built-in build runs. Keeps the affirmed preference exactly. Cost: Jekyll is
   the generator least able to fail loudly on malformed content (FR1.5, Q2's
   answer), which is the requirement Q1's framing weighed most heavily, and this
   reopens a question you have already answered.
X. Other (please specify)

[Answer]: A. Publish through a GitHub Actions workflow in this repository
**Timestamp:** 2026-09-23T10:28:00Z
**Mode:** guided

---

## Revision Pass (Q8–Q12)

This stage was re-entered on the **Modify** path after a backward jump. Q1–Q7
above are settled and were not reopened; the five questions below are the whole
of what this pass asked. They were presented in session as "revision Q1–Q5" and
are numbered Q8–Q12 here so the file keeps one continuous sequence.

**Why this pass happened, stated plainly.** The workflow flagged `domain-design`
as directly stale, but **no upstream input changed**:
`inception/requirements-analysis/requirements.md` (last written 11:19) and
`inception/practices-discovery/team-practices.md` (11:00) both predate this
stage's own artifacts (12:19–12:25). What changed is this stage's own artifact —
Functional Design for `u1-publishable-site-shell` wrote back into `components.md`
at 13:16 to fold in `Project.featured` and `SiteMetadata`. That write invalidated
this stage's completion and cascaded the flag to `units-generation` and
`functional-design`. The flag is bookkeeping, not evidence that a boundary is
wrong.

**What is genuinely wrong is narrower and real.** Code Generation has since built
all eight components, and in four specific places the built system knows
something the catalogue does not. Those four are Q9–Q12.

**The cost of a real boundary change, so it was a decision and not a surprise.**
`units-generation`, `functional-design` and `code-generation` are all bound to
this catalogue, and `src/` maps one file per component. Moving a boundary or
changing entity ownership would invalidate implemented, tested code for u1–u5.
Reconciling the catalogue to what exists costs nothing.

**What was deliberately not asked.** Whether to write the build or adopt a
generator ([Q1], ADR-001); where front-matter validation lives ([Q2], ADR-004);
one content model or two ([Q3], ADR-002); how the three blocking checks are
packaged ([Q4], ADR-004); how the templates decompose ([Q6], ADR-006); how a
self-written build reaches GitHub Pages ([Q7], ADR-005); and deployment topology,
which is Units Generation's decision. A short question list here reads as prior
stages having done their work, not as a gap.

---

### Q8 — What is this pass for?

Everything else follows from this. Q9–Q12 are the four places the catalogue and
the built code disagree.

A. **Reconcile only.** Bring the catalogue into agreement with what was built,
   leave every component boundary, dependency edge and entity ownership exactly
   as it is, and re-approve. Nothing downstream is invalidated by the content of
   this change.
B. **Reconcile, and change something specific.** Same as A, plus a boundary,
   responsibility, or ownership change, with the invalidated units named first.
C. **Reopen a decision from the first pass** — one of the seven ADRs. The only
   option that can invalidate the build itself.
D. **Re-approve exactly as-is.** Change nothing, including the four drifts. The
   catalogue stays out of step with the code, knowingly.
X. Other (please specify)

[Answer]: A. Reconcile only
**Timestamp:** 2026-09-23T20:52:00Z
**Mode:** guided

---

### Q9 — Project ordering: the catalogue says there is none, the build has one

`components.md` states of `ProjectCatalog`: *"Projects carry no ordering rule:
nothing upstream declares one, so the catalogue preserves the order it is given
and the decision stays open rather than being invented here."*

That is no longer true of the system. `src/content-transforms.ts` defines
`sortProjects`, ordering featured-first, then year descending, then slug
ascending, and `src/project-catalog.ts` returns `sortProjects(projects)`. The
rule exists, it is total, and `featured` orders rather than selects — so every
project still appears exactly once (FR3.1).

Two things are out of step, not one: the rule itself, and where it lives.
`ContentTransforms` is described as owning six named functions — the list
`team-practices.md` § Testing Posture gives as the code needing unit tests.
Project sorting is a seventh, and it is already there in the code.

A. **Record both.** `ProjectCatalog` owns the ordering rule; `ContentTransforms`
   lists project sorting as a seventh function beside post sorting. Matches the
   code exactly and keeps the coverage target in one place.
B. **Record the rule on `ProjectCatalog` only**, leaving `ContentTransforms` at
   six named functions with project sorting as an unlisted sibling.
C. **Move project sorting into `ProjectCatalog`.** Cohesive with its only user,
   but it moves a pure branching function out from under the single coverage
   target [Q5] chose deliberately — and it is a code change, not a catalogue one.
X. Other (please specify)

[Answer]: A. Record both
**Timestamp:** 2026-09-23T20:52:00Z
**Mode:** guided

---

### Q10 — Static assets and post-adjacent images have no owner in the catalogue

`SiteBuilder`'s recorded responsibilities are *"Writing pages, feed, and sitemap
to the output directory."* The built `src/site-builder.ts` also copies the
stylesheet and the self-hosted font into `assets/`, and copies each post's and
project's adjacent files beside its page.

Three entity attributes carry that and are absent from the catalogue's tables:
`ContentFile.directory` and `ContentFile.assets`, and `Post.sourcePath`.

A. **Fold it into the existing components.** `ContentSource` gains `directory`
   and `assets` on `ContentFile`; `Post` gains `sourcePath`; `SiteBuilder` gains
   asset copying as a responsibility. No new component, no boundary moves — the
   same treatment `Project.featured` and `SiteMetadata` already received.
B. **Introduce an `AssetPipeline` component.** Cleaner single responsibility, but
   a ninth component for roughly forty lines of copying, and it invalidates the
   built `SiteBuilder` for every unit already implemented.
C. **Record it on `SiteBuilder` but leave the entity attributes out.** The shape
   tables stay incomplete, against Functional Design's fold-back precedent.
X. Other (please specify)

[Answer]: A. Fold it into the existing components
**Timestamp:** 2026-09-23T20:52:00Z
**Mode:** guided

---

### Q11 — Third-party libraries are named by role; they now have names

The catalogue lists external dependencies by role only — "Front-matter parser",
"Markdown renderer library", "Syntax highlighter library" — and says explicitly
that *"naming the product is Code Generation's call."* That was right at the
time. Code Generation has now made it: `gray-matter` with `js-yaml` for front
matter, `markdown-it` for Markdown, `shiki` for build-time colouring.

A. **Record the chosen names** beside the roles, noting they were chosen at Code
   Generation, so the catalogue and `package.json` stop diverging.
B. **Keep roles only.** The catalogue stays about boundaries; a reader looks in
   two places to know what `MarkupRenderer` wraps.
C. **Record the names and pin the constraint they satisfy** — that both the
   Markdown renderer and the highlighter must run at build time only, since a
   browser-side highlighter would break NFR2 and NFR3. Makes the reason a future
   swap has to respect explicit rather than implied.
X. Other (please specify)

[Answer]: C. Record the names and pin the constraint they satisfy
**Timestamp:** 2026-09-23T20:54:00Z
**Mode:** guided

---

### Q12 — The "Later additions" annex

`components.md` § Entity Ownership carries a "Later additions" subsection
recording that `Project.featured` and `SiteMetadata` were authored by Functional
Design rather than by this stage, with the reasoning for each. Both are already
folded into the catalogue proper; the annex is provenance on top.

A. **Keep it, and extend it** with whatever Q9–Q11 fold back, so the catalogue
   keeps saying which facts came from downstream and why.
B. **Keep it unchanged**, and record the Q9–Q11 changes as ordinary catalogue
   content, since this stage is authoring them itself this time.
C. **Drop it.** This stage now owns every row; provenance lives in `decisions.md`
   and the audit trail.
X. Other (please specify)

[Answer]: A. Keep it, and extend it
**Timestamp:** 2026-09-23T20:54:00Z
**Mode:** guided

---

### Observation carried out of this stage, not a question for it

`package.json` runs `vitest run tests/u1 tests/u2 --coverage`, while `tests/u3`,
`tests/u4` and `tests/u5` exist and are excluded from that command. That is a
Build and Test concern (NFR12's per-unit coverage measurement), not a
component-boundary one, so no question was spent on it here. Recorded so it is
not lost.

---

## Consolidated Summary Confirmation

**First pass (Q1–Q7) — settled, not reopened.**

- Q1 — The build is ours. Content discovery, front-matter parsing, Markdown
  rendering, templating and output writing are all code we write and maintain.
  No static-site generator is adopted. This closes `requirements.md` OQ3 by
  answering "no generator" rather than by naming one.
- Q2 — Front-matter validation runs inside the build, as a step it cannot skip.
  A missing required field or unparseable date fails the build naming the file
  and the field (FR1.5). Because the build is ours, there is nothing to hook
  into and no way to invoke the build while bypassing the check.
- Q3 — Two entities, `Post` and `Project`, each owned by its own component with
  its own required fields, validation rules, and templates. Shared behaviour
  lives in a component both depend on.
- Q4 — One check runner. It runs the build, then the output checks against what
  the build produced, and reports all three failures together: the site builds,
  every non-draft content file produced a page, internal links resolve
  (NFR9, NFR10).
- Q5 — One shared component owns the small derived functions: date formatting,
  summary derivation, post sorting, slug generation, feed and sitemap
  construction. One place to find them, one place to test them, and the 80%
  line-coverage floor has a single clear target.
- Q6 — One rendering component owns the global shell, all seven page templates,
  and the named reusable includes.
- Q7 — Publishing runs through a GitHub Actions workflow in this repository. A
  push to `main` triggers it; it runs the build and deploys the output to Pages.
  Pages source becomes *GitHub Actions* rather than *branch*. The four controls
  `team-practices.md` § Deployment requires of such a workflow apply, and the
  check set gains a remote backstop. Publishing stays one act: write a file,
  commit, push.

**Revision pass (Q8–Q12) — what this attempt changes.**

- Q8 — Reconcile only. No component boundary, dependency edge, or entity
  ownership changes. Every change below is to what the catalogue *says*, not to
  what the system *is*, so no implemented unit (u1–u5) is invalidated.
- Q9 — Record both halves of the project-ordering drift: `ProjectCatalog` owns
  the ordering rule (featured first, then year descending, then slug ascending),
  and `ContentTransforms` lists project sorting as a seventh function beside post
  sorting. The sentence saying projects carry no ordering rule is removed, since
  the system has one.
- Q10 — Fold static assets into the existing components: `ContentFile` gains
  `directory` and `assets`, `Post` gains `sourcePath`, and `SiteBuilder` gains
  copying the site's own assets and each item's adjacent files as a
  responsibility. No ninth component.
- Q11 — Record the chosen library names beside their roles — `gray-matter` with
  `js-yaml` under `ContentSource`, `markdown-it` and `shiki` under
  `MarkupRenderer` — and pin the constraint they satisfy: both the Markdown
  renderer and the highlighter must run at build time only, because a
  browser-side highlighter would break NFR2 and NFR3.
- Q12 — Keep the "Later additions" annex and extend it with the Q9–Q11
  fold-backs, so the catalogue keeps saying which facts came from downstream and
  why.

- Q13 — Record the two dependency edges `SiteBuilder` → `ContentSource` and
  `SiteBuilder` → `MarkupRenderer`, which the code has and the catalogue never
  declared, and name `FieldError` in prose as the cross-component contract the
  validation boundary passes. Q13 was asked because the Q8 wording said this pass
  changes no dependency edge — meaning no edge in the *system* — while the Q10
  fold-back could not be written consistently without recording two edges the
  system already has.

Two things this pass does **not** do: it does not reopen any of the seven ADRs,
and it does not change a single line of `src/`. Every edge, attribute, rule and
name recorded here already exists in the built system; what changes is only
whether the catalogue says so. A new ADR records the project-ordering rule, which
is the one piece of behaviour the catalogue had left genuinely open.

Does this all look correct before I generate the artifact?

- Looks correct
- Request changes

[Answer]: Looks correct

---

## Q13

**Follow-up: two dependency edges the code has and the catalogue does not.**

Raised while preparing to write the Q10 fold-back, because it pulls against the
wording of the Q8 answer rather than against another answer here.

The Q8 summary said this pass changes "no component boundary, dependency edge, or
entity ownership" — meaning it changes nothing about the **system**. But writing
the Q10 fold-back surfaced two edges the system already has and the catalogue
never recorded:

- **`SiteBuilder` → `ContentSource`.** `src/site-builder.ts` imports `loadContent`
  and `itemsOfKind` directly. It is what loads the content files and hands them to
  the two catalogues, and it is what reads `ContentFile.assets` and
  `ContentFile.directory` to copy each item's images. The catalogue's `SiteBuilder`
  declares `depends_on` PostCatalog, ProjectCatalog, PageRenderer and
  ContentTransforms — not ContentSource — and `ContentSource`'s `dependents` lists
  only the two catalogues.
- **`SiteBuilder` → `MarkupRenderer`.** `src/site-builder.ts` imports from
  `markup-renderer.ts` directly. The catalogue shows `MarkupRenderer` as reached
  only through `PageRenderer`.

This is not optional tidying: `components.md` states its own well-formedness rule
that `depends_on` and `dependents` must be symmetric and that every component
named anywhere is declared. Folding `ContentFile.assets` into `SiteBuilder`'s
responsibility (Q10, answered A) while leaving the edge unrecorded would leave the
catalogue referring to an entity from a component it does not declare a dependency
on — internally inconsistent by its own rule.

A third, smaller thing sits behind the same question. `src/errors.ts` defines
`FieldError`, which every catalogue returns and `SiteBuilder` aggregates to
produce the fail-loudly message (FR1.5). It is a cross-component contract and the
catalogue never names it. `src/types.ts` is a shared declaration file and is an
ordinary TypeScript implementation detail rather than a building block.

A. **Record both edges, and record `FieldError` as a named cross-component
   contract** in the catalogue's prose (not as a component, and not as an entity
   owned by anyone — it is the shape the validation boundary passes). The
   catalogue becomes internally consistent and matches the code. Still no change
   to `src/`.
B. **Record both edges only.** Leave `FieldError` undocumented, on the grounds
   that this stage captures components and entities, not every shared type. The
   symmetry rule is satisfied; the fail-loudly contract stays implicit.
C. **Record neither, and drop the Q10 entity attributes instead**, keeping the
   catalogue's current dependency picture intact and accepting that it does not
   describe the built system. Consistent, but knowingly wrong in a different
   place than before.
X. Other (please specify)

[Answer]: A. Record both edges, and record `FieldError` as a named cross-component contract
**Timestamp:** 2026-09-23T21:00:00Z
**Mode:** guided
