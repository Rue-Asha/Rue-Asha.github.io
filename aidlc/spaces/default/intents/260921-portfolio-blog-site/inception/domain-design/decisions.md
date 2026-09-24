# Architecture Decision Record — Personal Portfolio & Blog Site

The durable decision log for Domain Design. `components.md` § Rationale gives a
one-line justification per component; this file records **why** each significant
choice was made, what it costs, and what was rejected.

Numbering is sequential and never reused. ADR-001 to ADR-007 come from this
stage's first pass, where seven questions were put and each one moved a
boundary; a single-obvious-decomposition run would carry one ADR saying so.
ADR-008 and ADR-009 come from a later revision pass ([Q8]–[Q13]) that moved no
boundary at all — see the note below.

**On the revision pass.** This stage was re-entered after `units-generation`,
`functional-design` and `code-generation` had all run. Nothing upstream had
changed; the trigger was that Functional Design wrote back into `components.md`,
which invalidated this stage's own completion. The pass was scoped to
reconciliation ([Q8]), so no decision below ADR-007 was reopened and no line of
`src/` changed. Only two things there warranted an ADR: a behavioural rule the
first pass had deliberately left open and the build has since answered
(ADR-008), and the policy question of what to do when an implementation knows
something its design does not (ADR-009).

## Sources

- [upstream] `inception/requirements-analysis/requirements.md` — the functional
  and non-functional requirements, constraints C1–C8, assumptions A5 and A6, and
  open question OQ3, which ADR-001 closes.
- [upstream] `inception/practices-discovery/team-practices.md` — the affirmed
  check set and its pre-push timing, the Deployment section's preference for the
  built-in Pages build and the four controls it requires of any workflow in this
  repository, and the Testing Posture section's list of code needing unit tests.
- [upstream] `inception/refined-mockups/mockups.md`,
  `inception/refined-mockups/interaction-spec.md`,
  `inception/refined-mockups/design-system-mapping.md`,
  `inception/refined-mockups/accessibility-checklist.md` — the seven page types,
  the two registers, and the build-time code-colouring contract.
- [Q1]–[Q7] `domain-design-questions.md` — the first pass (ADR-001 to ADR-007).
- [Q8]–[Q13] `domain-design-questions.md` § Revision Pass — the reconciliation
  pass (ADR-008, ADR-009).
- [built] `src/`, `bin/`, `package.json` — the implemented system, consulted as
  evidence of what exists rather than as authority over what should.

The `stories` input is absent because User Stories is SKIP in this scope; the
`architecture` and `component-inventory` inputs are absent because they are
Reverse Engineering outputs and this project is greenfield.

---

## ADR-001: Write the build rather than adopt a static-site generator

### Status
Accepted

### Date
2026-09-23

### Context

`requirements.md` OQ3 asked which generator, and whether it satisfies C6 (no
client-side rendering), A5 (build-time syntax colouring with no client-side
script and no third-party request) and A6 (drafts excluded by a front-matter mark
or folder convention). C8 left the technology entirely open.

Most of what a generator does, this site needs: content discovery, Markdown
rendering, templating, output writing, a feed, a sitemap, head metadata. One
thing it needs is the thing generators do worst — FR1.5 requires the **build** to
fail, naming the file and the missing field, rather than skipping a malformed
file. Stock generators skip or warn. `team-practices.md` § Testing Posture is
blunt about why that matters: a build that succeeds while silently dropping a
post breaks the site's only mandated publishing rule while reporting green, and
none of the other two blocking checks would see it.

Set against that: this is a site with one or two posts and one or two projects at
launch (`requirements.md` A3). Everything written here is maintained forever by
one person.

### Decision

We write the build. Content discovery, front-matter parsing, Markdown rendering,
templating and output writing are components we own (`components.md`:
ContentSource, PostCatalog, ProjectCatalog, MarkupRenderer, PageRenderer,
SiteBuilder). No static-site generator is adopted. This closes OQ3 by answering
"none" rather than by naming one.

### Consequences

**Positive.** FR1.5 is satisfied by construction rather than by fighting a tool —
the failure behaviour is ours to define. A6 becomes trivial: the draft mark is
whatever we say it is. A5's risk disappears in one direction — we choose a
highlighter that runs at build time, so FR2.7 can never end up in conflict with
NFR2 and NFR3. C6's disqualification of client-side rendering is met by a build
that emits complete HTML and no script.

**Negative.** Content discovery, front-matter parsing, Markdown rendering,
templating and output writing are now code maintained forever for a very small
site. That is a real and permanent cost and it was accepted with the trade
stated. There is no upstream community fixing bugs in any of it. A5 is not fully
retired: we still depend on a Markdown library and a highlighter, and choosing
ones that run at build time is Code Generation's obligation, recorded in ADR-003.

**Neutral.** The generator question is closed, but the library questions are not.
No product is named here; Code Generation picks the Markdown renderer,
highlighter and front-matter parser against the constraints above.

### Alternatives Rejected

- **Adopt a generator** ([Q1] option A). Content discovery, Markdown, templating
  and output become somebody else's job and the code we own is small. Rejected
  because the one capability it would not have given us is the one FR1.5 makes
  non-negotiable, and because — see ADR-005 — adopting a generator would not have
  preserved the built-in Pages build either, unless that generator were Jekyll
  specifically.
- **Adopt a generator but own the content layer** ([Q1] option C). Our code reads
  and validates content, the generator templates and writes. Rejected: it keeps
  the generator's constraints while adding a second content model to keep in step
  with it, which is the cost of both options and the benefit of neither.

---

## ADR-002: Two content entities, Post and Project

### Status
Accepted

### Date
2026-09-23

### Context

Posts and projects share a great deal: both are Markdown files with front matter,
both take their slug from the file name, both can be drafts, both are validated
on the same fail-loudly contract. They differ in required fields — a post needs
title, summary and date; a project needs name, summary, year, type, tools and
repo, with an optional live URL (`team-practices.md` § Testing Posture,
`requirements.md` FR2.5 and FR3.3) — and only posts appear in the feed and carry
an ordering rule.

Domain Design requires every entity to have exactly one owning component, so the
shape of the content model decides the shape of the load path.

### Decision

Two entities, `Post` and `Project`, owned by `PostCatalog` and `ProjectCatalog`
respectively. Each owns its own required-field rules. Behaviour genuinely common
to both — file discovery, front-matter separation, draft filtering, slug
derivation — lives in `ContentSource` and `ContentTransforms`, which both
catalogues depend on.

### Consequences

**Positive.** The two field sets change independently, which matches how they
will actually change: adding a field to projects does not touch posts. Ordering
belongs to posts alone and is not a conditional branch inside a shared model.
Validation rules sit next to the entity they describe, which is where a developer
will look for them.

**Negative.** Two validation paths rather than one, and two places to remember
when a rule genuinely does apply to both. Three components in the load path
instead of one.

**Neutral.** `ProjectCatalog` carries no ordering rule, because nothing upstream
declares one. That is left open rather than invented here; it surfaces as a real
question the first time more than a handful of projects exist.

### Alternatives Rejected

- **One `ContentItem` entity with a `kind` field** ([Q3] option B). Fewest moving
  parts, one validation path, templates branch on kind. Rejected at [Q3]: the
  branch-on-kind logic would appear in validation, in listing, in the feed and in
  the templates, which is the same conditional written four times rather than two
  entities written once.
- **Two entities sharing a common base** ([Q3] option C). One component owns the
  common shape and validation machinery; two thin components own the specifics.
  Rejected at [Q3] as the most structure for the least gain — with two kinds, a
  base class is a layer to traverse rather than a saving.

---

## ADR-003: Keep Markdown rendering out of the shared-functions component

### Status
Accepted

### Date
2026-09-23

### Context

[Q3] placed shared behaviour — slug derivation, draft filtering, Markdown
rendering — in a component both content entities depend on. [Q5] placed six named
derived functions in one shared component: date formatting, summary derivation,
post sorting, slug generation, feed construction, sitemap construction. Those six
are exactly the list `team-practices.md` § Testing Posture names as the code
needing unit tests, and `requirements.md` NFR12 inherits an 80% line-coverage
floor that has to apply somewhere measurable.

Markdown rendering appears in the first list and not in the second, so whether it
joins the other six was genuinely open.

### Decision

Two components. `ContentTransforms` holds exactly the six functions [Q5] named,
pure, with no file-system or network access. `MarkupRenderer` holds Markdown
rendering and build-time syntax colouring, and is the one component wrapping
substantial third-party code.

### Consequences

**Positive.** `ContentTransforms` stays pure, so its tests need no fixtures and
its coverage figure means what NFR12 wants it to mean. `MarkupRenderer` isolates
the two external libraries behind one boundary — which matters specifically
because that boundary is where a future browser-side highlighter would break NFR2
and NFR3, and having one place to check is the difference between a constraint
that is verifiable and one that is merely asserted. The two also change for
different reasons: a date-format change and a library upgrade should not touch
the same component.

**Negative.** One more component than [Q5] literally implies, and a developer
looking for "the shared stuff" has two places to look rather than one.

**Neutral.** The split does not reopen [Q5]. All six functions it named stay
together exactly as chosen; the decision only declines to add a seventh thing
that was never on that list.

### Alternatives Rejected

- **One shared component holding both** (`components.md` § Component-boundary
  options, block 1, option A). One import, one place to look. Rejected because
  the component's coverage figure would then mix pure functions with a wrapper
  around two third-party libraries, removing the clean coverage target [Q5] chose
  a single shared component for in the first place.

---

## ADR-004: Validation runs inside the build, and one runner runs all three checks

### Status
Accepted

### Date
2026-09-23

### Context

`requirements.md` FR1.5 requires the build itself to fail, naming the file and
the field, when content is malformed. NFR9 requires three blocking checks — the
site builds; every non-draft content file produced an output page; internal links
resolve — all passing on the author's machine before any push, for content
commits as well as code commits. NFR10 requires check 2 to ignore drafts
entirely. NFR11 forbids external-link checking on the publish path.

Checks 2 and 3 can only run after the build, because they inspect its output. And
`team-practices.md` § Testing Posture is explicit that checks running after the
push would recreate the exact failure they exist to prevent — a post that never
appears with nothing saying so.

### Decision

Validation is a step inside `SiteBuilder` that cannot be skipped: the catalogues
return field errors, the builder aggregates them, names each file and field, and
aborts without writing anything. Separately, one `CheckRunner` runs the build and
then both output checks, reporting all three outcomes together. Check 2 reads
`SiteBuilder`'s `BuildManifest` rather than re-deriving what should have been
produced.

### Consequences

**Positive.** There is no second command to forget and no way to invoke a build
that skips validation, because the build is ours (ADR-001) and validation is one
of its phases. A failed build writes nothing, which is what leaves the previously
live site serving (FR1.7). One runner means the pre-push check and the workflow
backstop (ADR-005) cannot drift apart. Check 2 reading the manifest means it
compares against what the build knows it wrote rather than against a guess.

**Negative.** `SiteBuilder` is a larger component than the others, holding both
orchestration and the failure contract. `CheckRunner` depending on
`BuildManifest` couples the check to the build's output shape; a change to what
the manifest records is a change to the check.

**Neutral.** External links are not checked anywhere on the publish path (NFR11).
`team-practices.md` leaves a scheduled weekly external-link check on the table as
a later addition, never as a gate; nothing here forecloses it and nothing here
implements it.

### Alternatives Rejected

- **A separate validation script run before the build** ([Q2] option B).
  Generator-independent and simple. Rejected: "the build" becomes two things and
  anyone invoking the build directly bypasses the check — the precise failure
  FR1.5 exists to prevent.
- **A schema the generator enforces natively** ([Q2] option C). Moot under
  ADR-001, since no generator is adopted, and rejected on its own terms because
  the error message would be the tool's rather than one naming file and field.
- **Build plus a separate output-check command** ([Q4] option B). More separable
  for debugging. Rejected: two commands to remember in a habit that has to hold
  for content commits made in a hurry.
- **Folding check 2 into the build as a build-time assertion** ([Q4] option C).
  Fewest separate parts. Rejected because it splits the three affirmed checks
  across two places and makes one of them invisible in the check report — the
  runner should say all three passed, not two.

---

## ADR-005: Publish through a GitHub Actions workflow in this repository

### Status
Accepted

### Date
2026-09-23

### Context

`requirements.md` C3 records that GitHub's built-in Pages build runs a fixed
Jekyll build with no user-defined steps. `team-practices.md` § Deployment states a
preference plainly: as long as the check set runs only on the author's machine,
the built-in build remains viable and is the smallest attack surface available —
nothing of ours executes on every push.

ADR-001 forecloses that. A build we wrote cannot run on the built-in build. This
is not a consequence of ADR-001 alone: the built-in build survives **only** with
Jekyll, so adopting Eleventy, Astro or Hugo would have required a workflow too.

The mandated publishing rule is not negotiable in any option: write a file,
commit, push, and the page is live, with no further action by the author
(FR1.1, FR1.2).

### Decision

Publishing runs through a GitHub Actions workflow in this repository. A push to
`main` triggers it; it runs `CheckRunner` and deploys `SiteBuilder`'s output to
Pages. The Pages source changes from *branch* to *GitHub Actions*.

The four controls `team-practices.md` § Deployment requires of any such workflow
apply, and they are requirements on the workflow rather than suggestions:
top-level `permissions: contents: read` with `pages: write` and `id-token: write`
granted on the deploy job alone; every third-party action pinned to a full commit
SHA and never a version tag; nothing triggering on `pull_request_target`; and
nothing fetched at build time that is not in the lockfile. Alongside them: commit
the lockfile, and enable security-only dependency alerts.

### Consequences

**Positive.** The check set finally gets a remote backstop, which closes the gap
`team-practices.md` § Deployment names honestly — a push that skipped the local
checks, or a remote failure the local build did not reproduce. Because
`CheckRunner` is one runner (ADR-004), the backstop runs exactly what the author
runs. Publishing stays one act: push, and the page is live.

**Negative.** Our code now executes on every push, which is exactly the attack
surface the affirmed preference wanted to avoid. This is a deliberate departure
from a stated team preference, taken with the reason recorded, and the four
controls above are what make it proportionate rather than reckless. A compromised
workflow file is now a path to the live site that did not previously exist —
though `team-practices.md` § Deployment already notes that a compromised account
is the realistic defacement path, and the account is protected by a second factor.

**Neutral.** Nothing above changes the component catalogue. The workflow is
deployment configuration, not a logical building block, and it belongs to CI
Pipeline (stage 3.7), which is in scope. Its only job is to run `CheckRunner` and
deploy `SiteBuilder`'s output. Pre-push local checking remains required by NFR9
and is not weakened by having a backstop; the workflow is a second net, not a
replacement.

`requirements.md` OQ2 — how the author learns that publishing failed after a push
— is not closed here, but it is narrowed. A workflow failure is visible in the
repository's Actions view and notified by GitHub's own default, where the
built-in build's failure was not. The smoke check remains the agreed detection,
and OQ2 stays open for Construction.

### Alternatives Rejected

- **Build locally and commit the output** ([Q7] option B). The build runs on the
  author's machine — which NFR9 requires anyway — and its generated output is
  committed for the built-in Pages build to serve. Nothing of ours would ever
  execute on GitHub, preserving the affirmed preference exactly. Rejected: a
  forgotten rebuild publishes stale content silently, with nothing to catch it,
  which is the same class of silent-publishing failure the whole check set exists
  to prevent; and every content commit would carry a generated-output diff.
- **Reconsider ADR-001 and adopt Jekyll specifically** ([Q7] option C), the one
  generator the built-in build runs. Rejected: Jekyll is the weakest of the
  candidates at failing loudly on malformed content, which is the single
  requirement ADR-001 weighed most heavily, so this preserves the deployment
  preference by giving up the reason the build decision was made.

---

## ADR-006: One rendering component owns the shell, all seven templates, and the includes

### Status
Accepted

### Date
2026-09-23

### Context

`inception/refined-mockups/mockups.md` defines seven page types — Home, Writing,
Post, Projects, Project, About, 404 — one global shell present on every page, and
two visual registers. `team-practices.md` § Code Style adds a rule: when a post
needs a presentation capability the layout lacks, it becomes a named reusable
include used by name, never one-off markup pasted into prose.

Templates could be split by role (shell versus pages) or by register (editorial
versus technical, matching the design's own division).

### Decision

One `PageRenderer` component owns the global shell, head metadata, the CSP meta
tag, all seven page templates, their empty states, and the named reusable
includes.

### Consequences

**Positive.** Templates are configuration more than logic, and splitting them
would create boundaries with nothing behind them. The accessibility contract —
skip link first, tab order following visual order, visible focus on every
focusable element, landmark structure (NFR1) — is a property of the rendered
markup as a whole, and keeping it in one component means it has one owner rather
than being a convention several components must each honour. The CSP meta tag
(NFR4) likewise has one emitter.

**Negative.** `PageRenderer` is the largest component in the catalogue, and the
traceability file shows it: most of FR2 through FR5 lands there. A component that
realises that many requirements is a component whose changes are harder to reason
about. This is the honest cost of the decision rather than an argument against
it — the alternative was boundaries drawn where nothing actually divides.

**Neutral.** The two visual registers remain a styling distinction rather than a
structural one, which is what `mockups.md` § The Two Registers already intends:
the smallest set of differences that reads as two registers rather than two sites.

### Alternatives Rejected

- **Shell and page templates separate** ([Q6] option B), on the reasoning that
  the frame changes on a different rhythm from the pages it wraps. Rejected at
  [Q6]: with three navigation links and a footer, the frame will change roughly
  never, so the differing rhythm is theoretical.
- **Split by visual register** ([Q6] option C) — an editorial component for Post
  and Project, a technical one for the rest. Rejected at [Q6]: the shell belongs
  to neither side, and every shared include would have to pick one.

---

## ADR-007: One component owns the content-directory boundary

### Status
Accepted

### Date
2026-09-23

### Context

`requirements.md` FR1.6 requires the AI-DLC workspace (`aidlc/`) and the tooling
directories (`.claude/`) to be excluded from the published output, configured in
the build rather than left to the author remembering. C2 explains why this is
load-bearing rather than tidiness: this repository is both the Pages publish root
and the AI-DLC workspace, and several generators would otherwise serve or render
that whole tree as pages under a real name. The acceptance criterion is concrete —
`GET /aidlc/` and `GET /aidlc/spaces/default/memory/project.md` both return 404
against the live URL.

With two content entities (ADR-002), discovery could reasonably live in each
catalogue.

### Decision

One `ContentSource` component owns file discovery, front-matter separation, draft
filtering and slug derivation. It walks only the content directory and never the
repository root. `PostCatalog` and `ProjectCatalog` own field rules and nothing
else.

### Consequences

**Positive.** The exclusion rule exists in exactly one place, which is the right
number for a rule C2 makes security-shaped. Draft handling (FR1.3, FR1.4) is
likewise stated once and applies identically to both kinds, so a draft is
excluded from pages, lists, the feed and the sitemap by one mechanism.

**Negative.** A third component in the load path, and one more hop between a file
on disk and a validated record.

**Neutral.** `ContentSource` reports an unparseable front-matter block as a field
error naming the file, rather than deciding what to do about it. The
fail-or-continue decision stays with `SiteBuilder` (ADR-004), which is the one
component allowed to abort the build.

### Alternatives Rejected

- **Fold discovery and parsing into the two catalogues** (`components.md`
  § Component-boundary options, block 2, option A). Two components instead of
  three, each self-contained. Rejected because the content-directory boundary
  would then be stated twice, and two copies of a rule that C2 makes load-bearing
  are two places for it to drift apart.

---

## ADR-008: Projects are ordered featured-first, then year descending, then slug ascending

### Status

Accepted

### Date

2026-09-23

### Context

The first pass recorded, of `ProjectCatalog`, that *"projects carry no ordering
rule: nothing upstream declares one, so the catalogue preserves the order it is
given and the decision stays open rather than being invented here."* That was the
right call at the time — inventing a rule no requirement asked for is how a design
acquires decisions nobody made.

Two things have happened since. Functional Design for
`u1-publishable-site-shell` added `Project.featured` so Home could show a subset
of projects without a state in which projects exist and Home's section is empty.
And Code Generation built the ordering: `src/content-transforms.ts` defines
`sortProjects` and `src/project-catalog.ts` returns its result.

So the decision is no longer open — it was made, in code, as a consequence of
`featured` existing. Leaving the catalogue saying otherwise would mean the
design document describes a system that does not exist.

The forces:

- **FR3.1 requires every project to appear exactly once** on the Projects page. An
  ordering rule that could also filter would put that at risk.
- **Determinism across machines.** FR2.2 forbids posts being ordered by file
  modification time, because a fresh clone or a CI checkout resets timestamps and
  the list silently reorders. Projects have the same exposure and deserve the same
  protection, even though no requirement spells it out for them.
- **`featured` is a display concern, not a content one.** FR3.3 names six required
  fields; `featured` is not among them and must not become a seventh.

### Decision

`ProjectCatalog` owns the rule: projects are ordered **featured-first, then by
year descending, then by slug ascending**. The comparison itself lives in
`ContentTransforms` as a seventh pure function beside post sorting.

The rule is **total and never a filter**. `featured` decides position only; a
project with `featured` absent defaults to false and still appears. The slug
tie-break is what makes the order deterministic: two projects from the same year
with the same flag sort by a value that is stable across every clone.

### Consequences

**Positive.** FR3.1 holds by construction rather than by care — no value of
`featured` can remove a project from a list. The order is reproducible on any
machine, closing the same gap FR2.2 closes for posts before anyone hits it.
Home's selected-projects section has a defined source of truth.

**Negative.** `ContentTransforms`' responsibility list is now seven functions
where `team-practices.md` § Testing Posture names six, so the catalogue and that
practice no longer read as a literal match. The practice describes a kind of code
— "a function that branches or transforms data" — and project sorting is squarely
that, so this is a widening rather than a contradiction. Recorded because it is
the sort of small divergence that is easy to miss later.

**Neutral.** Year is stored as a number and sorts descending; the rule says
nothing about projects sharing a year and a flag beyond the slug tie-break, which
is deliberate — alphabetical is arbitrary but stable, and stability is the
property being bought.

### Alternatives Rejected

- **Leave the rule unstated** ([Q9], the status quo). Rejected because the system
  has a rule; not recording it does not make the decision open again, it only
  makes the catalogue wrong.
- **Move project sorting into `ProjectCatalog` itself** ([Q9] option C). Cohesive
  with its only caller. Rejected because it is a pure branching function, and
  moving it out of `ContentTransforms` fragments the single coverage target
  [Q5] chose that component for (NFR12). It would also have been a change to
  `src/`, which the reconciliation scope ([Q8]) excluded.
- **Order by year alone, treating `featured` as Home-only.** Rejected because it
  would give the Projects page and Home two different orders for the same data,
  and the first pass' reason for one `ProjectCatalog` is that project rules should
  have one home.

---

## ADR-009: Reconcile the catalogue to the built system, by question rather than by adoption

### Status

Accepted

### Date

2026-09-23

### Context

This stage was re-entered after the system it describes had been built. Six
specific facts were true of `src/` and absent from `components.md`: the project
ordering rule and its location, `ContentFile.directory` and `ContentFile.assets`,
`Post.sourcePath`, asset copying on `SiteBuilder`, the two dependency edges
`SiteBuilder` → `ContentSource` and `SiteBuilder` → `MarkupRenderer`, and the
chosen library names.

Some of those gaps were the design's own doing and some were not. The library
names were deliberately deferred to Code Generation and simply came due. The
ordering rule was a genuine open decision that got answered elsewhere. The asset
attributes and the two edges were things the implementation needed and nobody
went back to write down.

The question this raises is a policy one, and it will recur every time an
implementation outruns its design: **when the code and the design disagree, which
one is corrected?**

Answering "always the design" makes the design a changelog — it can never be
wrong because it never claims anything the code does not already do, and it
stops being able to constrain the next change. Answering "always the code" is
worse in the other direction: it would have meant reverting working, tested
behaviour to match a document, at real cost and for no gain the requirements ask
for.

### Decision

Each disagreement is **put to the team as a question**, with the cost of both
directions stated, rather than resolved by a standing rule. The reconciliation
scope is agreed first ([Q8]) so that the size of the pass is a decision and not
an accident.

For this pass the answers were uniform — every fact was adopted into the
catalogue and no line of `src/` changed — but that was the outcome of six
questions, not the premise of them. Two were declined on their merits during
authoring and put as options anyway: introducing an `AssetPipeline` component
([Q10] option B) and moving project sorting ([Q9] option C), both of which would
have changed the built system.

Facts adopted from the implementation are recorded in `components.md`
§ Later additions with their origin named, so a reader can always tell which
parts of the catalogue were designed up front and which were folded back.

### Consequences

**Positive.** The catalogue describes the system that exists, which is the only
condition under which it is worth consulting. The provenance table means adopting
a fact never disguises itself as having designed it. The cost of a real boundary
change stayed visible throughout — `units-generation`, `functional-design` and
`code-generation` are all bound to this catalogue, and `src/` maps one file per
component — so the team chose the cheap pass knowing the expensive one was
available.

**Negative.** This is slower than adopting the code wholesale, and it spends
human attention on questions whose answer looks obvious in advance. It also
leaves a document that is part design and part record, with the annex as the only
thing distinguishing them.

**Neutral.** The approach does not scale indefinitely. If a later pass finds
twenty divergences rather than six, the right response is probably to ask why the
design stopped being consulted, not to hold twenty separate votes.

### Alternatives Rejected

- **Adopt every implementation fact automatically**, treating the code as the
  source of truth for the design. Rejected because it removes the design's ability
  to say the implementation is wrong, which is most of what it is for. The
  `AssetPipeline` and project-sorting options are the concrete proof the question
  was real.
- **Change the code to match the catalogue.** Rejected because the catalogue's
  silences were gaps rather than prohibitions: it never forbade asset copying, it
  simply never named an owner for it. Reverting working, tested behaviour to
  satisfy an omission would be cost with no requirement behind it.
- **Record nothing and re-approve as-is** ([Q8] option D). Rejected because the
  drift is already causing harm — `components.md` asserted a `depends_on` /
  `dependents` symmetry rule that its own contents would have broken once the
  asset attributes landed.
