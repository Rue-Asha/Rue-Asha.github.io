# Units of Work — Personal Portfolio & Blog Site

Six independently implementable pieces of this site. Each one is something a
person can look at and judge finished.

**This document describes what the units are, not what order to build them.**
Build order is an economic decision, not a topological one, and it was already
made in Ideation (`ideation/scope-definition/intent-backlog.md` § Build Order).
Delivery Planning is SKIP in this workflow, so no stage re-opens it; that
approved order stands, and the dependency graph in
`unit-of-work-dependency.md` records only what *can* depend on what.

## Sources

- [desc] Initial description: "I want to build a Github.io Blog site to present my work and make blog posts about things I currently learning or I find to be interesting. For UX/UI I want you to use Mobbin"
- [scope] Workflow-selected scope: `feature`.
- [upstream] `inception/domain-design/components.md` — the eight components,
  their entities and their dependency graph. This is what the units group, and
  it remains the answer to "which component owns this file".
- [upstream] `inception/domain-design/decisions.md` — the boundary decisions
  that constrain grouping. ADR-005 in particular places the publishing workflow
  outside the component catalogue, which is why [Q4] had to decide where the
  work lands.
- [upstream] `inception/requirements-analysis/requirements.md` — the functional
  requirements each unit delivers, and constraint C1, which settles the
  deployment model for every unit at once.
- [upstream] `ideation/scope-definition/intent-backlog.md` — the approved
  proto-Units PU-1 to PU-6 that these six units correspond to one-to-one.
- [upstream] `inception/practices-discovery/team-practices.md` — the
  walking-skeleton definition and its six pass/fail conditions, the affirmed
  check set, and the rule that tooling configuration lands in the first unit.
- [Q1]–[Q5] `units-generation-questions.md` — the first pass, which settled the
  six units and their boundaries.
- [Q6]–[Q8] `units-generation-questions.md` § Revision Pass — a reconciliation
  pass run after Domain Design was revised and re-approved. It changed no unit
  boundary, no DAG edge, and no requirement mapping; it corrected U3's
  project-ordering note, which the revised `decisions.md` ADR-008 had made false,
  and recorded the static-asset copying mechanism that no unit had named. The
  component set, the edge block, and all 34 FR mappings were diffed against the
  revised Domain Design and came back unaffected.

The declared `stories` input is absent: User Stories is SKIP in this scope, so
the story map and `traceability.json` key on functional requirements rather than
`USx.y` story IDs.

---

## Unit Index

| Unit ID | Directory | Name | Kind | Complexity | Deployment model |
|---|---|---|---|---|---|
| U1 | `u1-publishable-site-shell` | Publishable site shell | *(untagged)* | L | Embedded |
| U2 | `u2-blog` | Blog | `ui` | M | Embedded |
| U3 | `u3-projects` | Projects | `ui` | M | Embedded |
| U4 | `u4-about-page` | About page | `ui` | S | Embedded |
| U5 | `u5-visual-direction` | Visual direction | `ui` | M | Embedded |
| U6 | `u6-launch-content` | Launch content | *(untagged)* | S | Embedded |

**Every unit is embedded, and that is not a choice this stage made.**
`requirements.md` C1 states that a GitHub Pages user site is one site published
from one repository. There is exactly one deployable, so no unit is standalone
and no unit is shared. Nothing here is independently deployable, which is why
independent *testability* rather than independent deployability is the boundary
criterion used below.

**On the two untagged units.** A unit's kind drives which Construction design
artifacts apply to it, and the stage contract says to omit it only when none
genuinely fits. U1 and U6 are untagged for opposite reasons, both stated so a
Construction agent is not left guessing:

- **U1** genuinely spans build code, page templates, and publishing
  configuration. Tagging it `packaging` would understate the templates;
  `ui` would understate the build. It carries the full design-artifact matrix,
  which is also the right answer for the highest-risk unit in the set.
- **U6** contains no code at all — it is prose in Markdown files. It carries no
  design artifact, and its per-unit design stage should record that as **not
  applicable, with this reason**, rather than inventing content to fill the
  slot. It is untagged rather than mis-tagged because none of `service`,
  `spec`, `ui`, `packaging` or `library` describes written content, and a wrong
  tag would be read as a real classification.

---

## U1 — Publishable site shell

**Directory:** `u1-publishable-site-shell` · **Kind:** untagged · **Complexity:** L

### Boundary

Every one of the eight components in `components.md`, at minimum depth: content
discovery and front-matter parsing, both catalogues with their required-field
rules, the derived functions, Markdown rendering, the shell and enough of the
page templates to serve one post page and one project page, the build with its
fail-loudly validation, and the check runner. Plus the publishing route that
ADR-005 settled and the tooling configuration `team-practices.md` § Code Style
requires.

This is the layer view from [Q1], honoured inside one unit. A walking skeleton
is thin but reaches all the way through, so "all eight components, shallowly" is
what it is.

### Delivers

- The site live at its real public URL, with one post page and one project page
- A committed file becoming a live page with no further action by the author
- `aidlc/` and `.claude/` unreachable as pages on the live site
- The 404 page carrying the global shell and served by Pages for unmatched paths
- The content-security-policy meta tag, with the site working under it
- A build that fails naming the file and the field when content is malformed,
  leaving the previously live site serving
- The asset-copying mechanism: `SiteBuilder` copies the site's own assets into
  the output and copies each post's and project's adjacent files beside that
  item's page, so a relative image link in a body resolves in the built site
  exactly as it does in the source tree. The mechanism is U1's; the assets that
  travel through it belong to U5 and U2 (see those units, and
  `unit-of-work-dependency.md` § Integration points). Copying runs in the write
  phase, after validation, so a content fault still stops the build before
  anything reaches the output.
- The one check runner, running all three blocking checks together
- The GitHub Actions publishing workflow with its four required controls
- Formatter and linter configuration, and the first formatting run

### Implementation notes and constraints

- **Its definition of done is not ours to write.** `team-practices.md`
  § Walking Skeleton states six pass/fail conditions, and this unit is finished
  when all six pass. The fourth is the one most likely to be skipped: break the
  site on purpose, revert the commit, push, and confirm the live site returns to
  its previous state. A rollback nobody has run is a rollback we are guessing at.
- **The workflow is in this unit because the skeleton cannot be live without
  it** [Q4]. Its four controls are not optional and not deferred: top-level
  `permissions: contents: read` with `pages: write` and `id-token: write` on the
  deploy job alone, every third-party action pinned to a full commit SHA,
  nothing triggering on `pull_request_target`, and no build-time fetch outside
  the lockfile. Commit the lockfile. CI Pipeline (3.7) reviews and hardens what
  exists here; it does not build it from nothing.
- **Tooling lands here, not later.** Formatter and linter configuration plus the
  first formatting run belong in this unit so U2 to U6 are written formatted
  from the first line. Retrofitting produces one enormous reformatting commit
  that buries the change that mattered. The formatter never touches post prose.
- **Prove the fail-loudly path before calling it done.** Commit a deliberately
  broken post, confirm the build fails naming the file and the field, and
  confirm the previously live site stays up.
- Slugs are the file names: lowercase, kebab-case, ASCII only, and never changed
  once live.

---

## U2 — Blog

**Directory:** `u2-blog` · **Kind:** `ui` · **Complexity:** M

### Boundary

The post half of the site, deepened from U1's skeleton: the Writing list, the
post page, post-specific field rules and ordering, the feed, and build-time code
colouring. Owns `PostCatalog`'s rules and the post-facing parts of
`PageRenderer`, `ContentTransforms` and `MarkupRenderer`.

### Delivers

- The Writing page listing every published post with title, summary and date
- Ordering by declared front-matter date, newest first, never by file mtime
- Each list row as a single link target covering title, summary and date
- A page per post carrying title, summary, date and body
- Markdown bodies with headings, links, lists, images with alt text, code blocks
- Syntax colouring applied at build time, never in the reader's browser
- "All posts" links at the top and the end of every post page
- The Writing empty state: a plain sentence and a route to Projects
- The feed, containing every published post and no draft

### Implementation notes and constraints

- The four-token colour theme is fixed by
  `refined-mockups/interaction-spec.md` § Code Block, and no token colour may
  reuse the link accent.
- **Images in post bodies reach the built site through U1's copying mechanism.**
  FR2.6 requires images with alt text; the files themselves sit beside the post
  and are copied into the output by `SiteBuilder` (see U1 § Delivers). This unit
  owns how an image is written and rendered, not how its file gets there.
- Unit tests belong to the derived functions this unit touches — sorting,
  summary derivation, date formatting, feed construction — and the inherited
  80% line-coverage floor is measured against them at Build and Test, or
  recorded as `N/A — no instrumentable lines in this unit` with that reason.
- The keyboard walkthrough runs on the Writing and Post page types when they are
  built, and again after U5 applies the styling.

---

## U3 — Projects

**Directory:** `u3-projects` · **Kind:** `ui` · **Complexity:** M

### Boundary

The projects half, deepened from U1's skeleton: the Projects list, the project
write-up page and its metadata rail, and project-specific field rules. Owns
`ProjectCatalog`'s rules and the project-facing parts of `PageRenderer` and
`ContentTransforms` — the latter because project sorting lives there
(`components.md` § ContentTransforms), mirroring U2's ownership of the
post-facing parts of the same component.

**`ContentTransforms`' tests and coverage are measured once, against the whole
component, not split per consuming unit.** That is the reason [Q5] gathered those
functions into one component in the first place: `components.md` § Rationale puts
it as "gathering them gives NFR12's coverage floor one target instead of
several". So this unit touching `ContentTransforms` does not give it a share of
that floor, and a per-unit attribution of `sortProjects`' unit test would
contradict the single-target design. The same holds symmetrically for U2 and
`sortPosts`.

### Delivers

- The Projects page listing every project with name, summary, tools and a
  repository link
- A write-up page per project, with the metadata rail beside a body of
  author-chosen structure and length
- The six required project fields enforced on the fail-loudly contract
- The live-URL rail row omitted entirely when a project declares none
- Project name and repository link as separately distinguishable targets in each
  list row, with the repository link carrying the outbound affordance
- Repository links with accessible names identifying their project, not "repo"
- The Projects empty state: a plain sentence and a route to Writing

### Implementation notes and constraints

- **Project ordering is settled, and this unit owns the rule.** Projects are
  ordered **featured-first, then by year descending, then by slug ascending**
  (`decisions.md` ADR-008), and `ProjectCatalog` — this unit's component — owns
  it. The ordering is total and never a filter: `featured` decides position and
  can never remove a project from a list, so FR3.1's "every project appears
  once" holds whatever the flag says. The slug tie-break is what makes the order
  reproducible across a fresh clone, for the same reason FR2.2 forbids ordering
  posts by file modification time.
- **Where `featured` came from, so a reader of this unit is not left guessing.**
  The field was introduced by U1's Functional Design, not by this unit: Home
  shows a subset of projects (FR4.3, owned by U1), and `featured` is how that
  subset is chosen. It is optional with a `false` default, so it is not a seventh
  required field against FR3.3's six. The field belongs to U1's reason for
  existing; the rule that consumes it belongs here. That split is deliberate and
  no requirement was reassigned to remove it.
- The rail stacks above the body at phone width, labels and values on one line
  each.
- The keyboard walkthrough runs on the Projects and Project page types when
  built, and again after U5.

---

## U4 — About page

**Directory:** `u4-about-page` · **Kind:** `ui` · **Complexity:** S

### Boundary

The About page at its own URL, carrying who the author is and contact or profile
links. The smallest unit in the set.

### Delivers

- `/about` with prose and links, in the technical register
- The page reachable in one click from Home, like every other page type

### Implementation notes and constraints

- This page exists as its own page rather than inline on Home. The wireframes
  drew it both ways; `requirements.md` FR4.1 resolved the contradiction in
  favour of the page, and that resolution is settled rather than reopened here.
- Small enough that its main risk is being treated as trivial and skipping the
  keyboard walkthrough. It gets one, like every other page type.

---

## U5 — Visual direction

**Directory:** `u5-visual-direction` · **Kind:** `ui` · **Complexity:** M

### Boundary

The design system from `refined-mockups/design-system-mapping.md` implemented as
a stylesheet and applied across every page type: colour tokens, the type scale
and its two families, the spacing scales, borders, radius, focus ring, and the
single transition. Plus the self-hosted font file.

### Delivers

- One stylesheet implementing the token system, served from this repository
- The two registers applied — editorial on Post and Project, technical elsewhere
- The focus ring on every focusable element, no exceptions
- The self-hosted variable font, Latin subset, preloaded in the page head
- The phone layout as the contraction of the desktop layout, one breakpoint
- Every list row and interactive target clearing 44px at phone width

### Implementation notes and constraints

- **It depends on the pages existing.** Its deliverable is the treatment
  *applied*, which cannot be verified against pages that have not been built.
  This is a real dependency, not the sequencing preference recorded in the
  backlog — see `unit-of-work-dependency.md` for why the edge is drawn here.
- **Nothing is fetched from another server.** Fonts, icons, stylesheets and
  scripts are copied into this repository. The CSP meta tag from U1 enforces it,
  and this unit is where it would most easily be broken.
- **This unit's assets reach the built site through U1's copying mechanism.**
  The stylesheet and the self-hosted font are authored here and placed where
  `SiteBuilder` looks; U1 owns the copying itself (see U1 § Delivers). So the
  files are this unit's and the mechanism is not, which matters in one concrete
  way: a font that never appears on the live site is as likely to be a path
  mismatch against U1's expectation as a fault in this unit.
- **Contrast is verified by hand or not at all.** The automated accessibility
  scan was offered at Practices Discovery and declined. The contrast figures in
  `design-system-mapping.md` § Measured contrast are the whole verification, and
  any change to a colour value re-opens that table by hand.
- **The keyboard walkthrough re-runs on all seven page types after this unit.**
  That is the second half of the affirmed walkthrough rule, and this unit is the
  trigger for it.

---

## U6 — Launch content

**Directory:** `u6-launch-content` · **Kind:** untagged · **Complexity:** S

### Boundary

One or two posts and one or two projects, written. Content files only: no
templates, no build code, no styling.

### Delivers

- One or two published posts with title, summary, date and body
- One or two published project write-ups with all six required fields
- A site that does not look empty at launch

### Implementation notes and constraints

- **No design artifact applies, and that should be recorded rather than
  invented.** This unit contains no code, no branching, and no transformation —
  so there is no functional design to write, no unit test to author, and no
  instrumentable line for the coverage floor to measure. Its design stage should
  resolve as not applicable with this reason, exactly as an inapplicable screen
  state is marked rather than filled.
- It is a unit at all because the first version is not done without it [Q2], and
  a Must Have with no owner in any plan is how a launch ends up with an empty
  site.
- The blocking check set still applies to these files: the build must succeed,
  each file must produce a page, and internal links must resolve, before the
  push.
- File names are the URLs and never change afterwards.

---

## Coverage

Every functional requirement in `requirements.md` is delivered by exactly one
unit; `unit-of-work-story-map.md` carries the full mapping and
`traceability.json` the machine-readable form. Every unit delivers at least one
requirement, except where noted: U6 delivers no functional requirement, because
its deliverable is content rather than behaviour. That is stated here rather
than papered over with a token mapping.
