# Units Generation — Questions

Four questions about **how the work divides**: what an independently buildable
piece of this site is, how many of them there are, whether any two can proceed
without waiting on each other, and where the publishing plumbing lands.

**Four, not the usual five to eight.** Most of what this stage normally asks is
already decided upstream and re-asking it would be noise:

- **Deployment model** is settled by `requirements.md` C1 — a GitHub Pages user
  site is one site published from one repository. There is exactly one
  deployable, so every unit is embedded in the one build. Nothing to choose.
- **Integration points and contracts between units** are settled by
  `inception/domain-design/components.md`, which already declares every
  dependency edge, its interaction, and its style. Contract Design is SKIP in
  this scope, so there is no separate contract layer to design.
- **Build order** is settled by `ideation/scope-definition/intent-backlog.md`
  § Build Order and by `inception/practices-discovery/team-practices.md`
  § Walking Skeleton, which names the shell first and states six pass/fail
  conditions for it. This stage is forbidden from choosing an implementation
  order anyway — it describes what *can* depend on what.

## Sources

- [desc] Initial description: "I want to build a Github.io Blog site to present my work and make blog posts about things I currently learning or I find to be interesting. For UX/UI I want you to use Mobbin"
- [scope] Workflow-selected scope: `feature`.
- [upstream] `inception/domain-design/components.md` — the eight components, their entities, and the dependency graph these units group
- [upstream] `inception/domain-design/decisions.md` — the boundary and ownership decisions that constrain how components may be grouped, especially ADR-005 on the publishing route
- [upstream] `inception/requirements-analysis/requirements.md` — the functional requirements each unit must deliver, and constraint C1
- [upstream] `ideation/scope-definition/intent-backlog.md` — the approved proto-Units PU-1 to PU-6 and their build order
- [upstream] `inception/practices-discovery/team-practices.md` — the walking-skeleton definition and what lands in the first piece of work
- [Q1]–[Q4] this file

The declared `stories` input is absent: User Stories is SKIP in this scope, so
the story map keys on functional requirements instead of `USx.y` story IDs.

---

## Q1 — What is a unit here: a slice of the site, or a layer of the build?

The component catalogue gave us eight horizontal layers — content loading,
cataloguing, transforms, rendering, building, checking. The approved backlog
gave us six vertical slices, PU-1 to PU-6, each of which is something you can
look at when it is done.

These cut across each other. A vertical slice like "the blog" touches almost
every layer shallowly; a horizontal layer like "rendering" serves every slice.

Worth saying plainly: PU-1 is already named as the walking skeleton with six
pass/fail conditions, and a walking skeleton is a vertical slice by definition —
thin, but reaching all the way through. So option A is the one that preserves
what has already been decided.

A. **Mirror the approved proto-Units.** Six units matching PU-1 to PU-6: the
   publishable shell, the blog, projects, about, the visual direction, and
   launch content. Each one is something visibly finished. Cost: most components
   are touched by more than one unit, so "who owns this file" is answered by the
   component catalogue rather than by the unit boundary.
B. **Follow the component layers.** Three or four units — the content layer, the
   rendering layer, the build-and-check layer. Each unit owns its files
   outright. Cost: nothing is visible until nearly all of them are done, which
   is exactly what the walking-skeleton practice exists to prevent, and the
   approved build order stops meaning anything.
C. **A hybrid.** One foundation unit carrying the whole build spine end to end
   (which is PU-1 by another name), then feature units on top of it. Cost: in
   practice this is option A with the first unit described differently, so it
   adds a distinction without a difference.
X. Other (please specify)

[Answer]: B. Follow the component layers
**Timestamp:** 2026-09-23T10:52:00Z
**Mode:** guided
**Note:** This answer conflicts with Q2, Q3 and Q4 as answered, and with the
affirmed walking-skeleton practice. See [Q5], which resolves it. Recorded here
exactly as given rather than silently overwritten.

---

## Q2 — Are all six proto-Units actually units of work?

Two of the six are not code in the way the other four are.

**PU-5, the visual direction.** Refined Mockups already produced the design
system — colour tokens, type scale, spacing, focus ring, the two registers
(`inception/refined-mockups/design-system-mapping.md`). What remains is writing
the stylesheet that implements those tokens and applying it. That is real work
on real files.

**PU-6, launch content.** One or two posts and one or two projects, written.
This is prose in Markdown files, not code. It has no tests, no coverage floor,
and no design artifacts — but the first version is not "done" without it, and
the backlog lists it as Must Have.

A. **Six units, all of them.** PU-5 and PU-6 become units like the others, each
   carrying whatever design and test artifacts genuinely apply and explicitly
   nothing where none do. Keeps the units and the approved backlog in one-to-one
   correspondence, so nothing goes missing between the two documents.
B. **Five units — fold the visual direction into the others.** Each feature unit
   styles its own pages as it builds them. Cost: pulls directly against the
   approved decision to sequence the visual treatment *after* the structural
   work, and risks six partial interpretations of one design system.
C. **Five units — treat launch content as not-a-unit.** Writing posts is what
   the site is for rather than work to build, so it sits outside the unit
   breakdown. Cost: the one thing that makes the site not look empty at launch
   has no owner in any plan, which is how it gets forgotten.
X. Other (please specify)

[Answer]: A. Six units, all of them
**Timestamp:** 2026-09-23T10:52:00Z
**Mode:** guided

---

## Q3 — Should the blog and projects be able to proceed independently?

Topologically, once the shell exists, the blog and the projects section depend
on nothing but it. They touch different entities, different templates, and
different requirements. The approved build order says "PU-2, then PU-3", but
that is a sequencing preference rather than a dependency — nothing in the blog
needs projects to exist first, or the other way round.

This stage records what *can* depend on what. Declaring them independent does
not reorder anything; it records that the order is a choice rather than a
constraint.

A. **Declare them independent siblings.** Both depend on the shell and on
   nothing else. The build order stays exactly as approved; the graph simply
   stops claiming a dependency that is not there. Honest topology, and it leaves
   the option of reordering open if the blog turns out to need more thought.
B. **Chain them as the build order reads.** Projects depends on the blog, so the
   graph and the build order match exactly and there is one path through. Cost:
   it records a constraint that does not exist, and a future reader cannot tell
   a real dependency from a preference.
X. Other (please specify)

[Answer]: A. Declare them independent siblings
**Timestamp:** 2026-09-23T10:52:00Z
**Mode:** guided

---

## Q4 — Where does the publishing plumbing land?

ADR-005 settled that publishing runs through a GitHub Actions workflow in this
repository, with four required controls: explicit permissions, actions pinned to
full commit SHAs, nothing on `pull_request_target`, and no build-time fetch
outside the lockfile.

That workflow is not a component, but it is work, and something has to own it.
There are two candidates and they pull in opposite directions:

- `team-practices.md` § Walking Skeleton says the first piece of work is not
  done until the site is **live at its real public URL**, the undo path has been
  exercised once, and the content-security policy is in place. None of that is
  possible without the workflow. It also says formatter and linter configuration
  land in the first unit, so later units are written formatted from the first
  line.
- CI Pipeline is a separate Construction stage that runs **once, after every
  unit is built** — which is the natural home for pipeline configuration in the
  normal case.

A. **The workflow and Pages configuration belong to the first unit.** The
   skeleton cannot meet its own stated definition of done otherwise. The later
   CI Pipeline stage then hardens and reviews what already exists — the four
   controls, the lockfile, the dependency alerts — rather than building it from
   nothing. Formatter and linter configuration land here too, as the practice
   requires.
B. **The workflow belongs to the CI Pipeline stage.** Pipeline configuration is
   what that stage is for, and the first unit proves the build locally instead.
   Cost: the skeleton's first and fourth conditions — live at the real URL, undo
   path exercised — cannot be met when it is declared done, so either the
   affirmed definition changes or the unit is finished on paper only.
C. **Split it.** A minimal deploy workflow in the first unit so the site goes
   live, with the four controls, the lockfile and the alerts added at CI
   Pipeline. Cost: an unhardened workflow is live in the repository in the
   meantime, and "we will secure it later" is the sentence that precedes not
   securing it.
X. Other (please specify)

[Answer]: A. The workflow and Pages configuration belong to the first unit
**Timestamp:** 2026-09-23T10:52:00Z
**Mode:** guided

---

## Q5 — Follow-up: Q1 conflicts with Q2, Q3 and Q4. Which governs?

Contradiction detection is mandatory and this is a real one, not a wording
mismatch. The four answers cannot all hold at once.

**Side by side.**

| Answer | What it commits to |
|---|---|
| [Q1] = B, follow the component layers | Three or four units named for build layers — content, rendering, build-and-check |
| [Q2] = A, six units, all of them | Six units in one-to-one correspondence with PU-1 to PU-6 |
| [Q3] = A, independent siblings | "The blog" and "projects" exist as two units that can proceed in parallel |
| [Q4] = A, workflow in the first unit | The first unit goes live at the real public URL, so it must contain pages |

**Why they conflict.** Under [Q1] = B there are no six units, so [Q2] cannot be
satisfied. There is no "blog" unit and no "projects" unit, so [Q3] has nothing
to make siblings of. And the first unit would be a build layer with no pages in
it, so it cannot be live at a real URL — which makes [Q4]'s stated reason
unreachable.

**It also pulls against an affirmed practice.**
`team-practices.md` § Walking Skeleton names **PU-1, the publishable site
shell** as the walking skeleton and gives it six pass/fail conditions, the first
of which is "the site is live at its real public URL, with one post page and one
project page". The active scope file declares `skeleton: on`. A horizontal
build-layer unit cannot satisfy that condition at all — not because it is built
badly, but because it contains no pages by construction.

A. **Reconcile: the first unit IS the whole build spine, then vertical units on
   top.** U1 contains all eight components at minimum depth — content loading,
   cataloguing, transforms, rendering, building, checking, plus the workflow —
   which is the layer thinking honoured inside one unit, and it is exactly what
   makes a walking skeleton thin-but-complete. U2 to U6 then deepen specific
   layers for specific slices. [Q2], [Q3] and [Q4] all stand as answered, the
   affirmed skeleton practice holds, and the layer view has a real home rather
   than being overruled.
B. **Vertical wins outright.** [Q1] becomes option A — six units mirroring PU-1
   to PU-6 — and the layer view stays where it already lives, in the component
   catalogue. [Q2], [Q3] and [Q4] stand unchanged. Simplest reading, and the
   difference from option A above is mostly in how U1 is described.
C. **Horizontal wins outright.** [Q1] stands, and [Q2], [Q3] and [Q4] are
   re-answered against three or four layer units. This also means the affirmed
   walking-skeleton practice is set aside for this project, which is a change to
   `team-practices.md` and to the scope's `skeleton: on` stance — a separate
   decision, not something this stage can make quietly on the way past.
X. Other (please specify)

[Answer]: A. Reconcile: the first unit IS the whole build spine, then vertical units on top
**Timestamp:** 2026-09-23T10:55:00Z
**Mode:** guided
**Effect:** [Q2], [Q3] and [Q4] stand exactly as answered. [Q1]'s layer view is
honoured inside U1 rather than overruled: U1 carries every one of the eight
components at minimum depth. The affirmed walking-skeleton practice and the
scope's `skeleton: on` stance are unchanged, and no amendment to
`team-practices.md` is required.

---

## Revision Pass (Q6–Q8)

This stage was re-entered on the **Modify** path after Domain Design was revised
and re-approved. Q1–Q5 above are settled and were not reopened.

**Why this pass is happening.** Domain Design ran a reconciliation pass that
changed no component boundary, no dependency in the system, and no entity's
owner. It recorded six facts the built system already had, and one of them —
ADR-008, the project ordering rule — **contradicts something this stage wrote
down**. That contradiction is the reason for the pass.

**What was diffed, and what came back.** The revised `components.md` and
`decisions.md` were compared against all four artifacts here, and the built
`src/` against both:

| Checked | Result |
|---|---|
| Component set (8) and their boundaries | Unchanged — no unit boundary is affected |
| The unit DAG and its edge block | Unchanged — no new edge, no removed edge, still acyclic |
| `traceability.json` — 34 FRs across U1/U2/U3/U4 | Unchanged — no requirement moved unit |
| U3's claim that project ordering is undefined | **Now false** — Q7 below |
| Static-asset copying, newly owned by `SiteBuilder` (U1) | **Not recorded in any unit** — Q8 below |

**What was deliberately not asked.** Unit boundary strategy ([Q1], [Q5]), which
proto-Units are units ([Q2]), whether the blog and projects are independent
siblings ([Q3]), where the publishing plumbing lands ([Q4]), and the deployment
model — settled by `requirements.md` C1, which makes every unit embedded in one
build and is not a question this stage gets to reopen. Build order is Delivery
Planning's, and Delivery Planning is SKIP in this scope
(`<record>/aidlc-state.md` → Stage Progress), so the approved order in
`ideation/scope-definition/intent-backlog.md` § Build Order stands untouched.

---

### Q6 — What is this pass for?

A. **Reconcile only.** Fix what the Domain Design revision invalidated (Q7, Q8),
   leave every unit boundary, DAG edge, and requirement mapping exactly as it is.
   Nothing downstream is invalidated; u1–u5 are already built against these
   boundaries.
B. **Reconcile, and change a unit boundary I will name.** Same as A, plus a
   boundary or DAG change you describe. I will name the built units it
   invalidates before writing anything.
C. **Re-approve exactly as-is.** Change nothing, including U3's now-incorrect
   ordering note. The unit documents stay knowingly out of step with the design.
X. Other (please specify)

[Answer]: A. Reconcile only
**Timestamp:** 2026-09-23T21:20:00Z
**Mode:** guided

---

### Q7 — U3 says project ordering is undefined; ADR-008 defines it

`unit-of-work.md` U3 § Implementation notes currently reads: *"Project ordering
is undefined and this unit does not invent it. Nothing upstream declares an order
for the Projects list. Functional Design or the author settles it; until then the
catalogue preserves the order it is given."*

That was true when it was written and is not true now. ADR-008 records the rule —
featured-first, then year descending, then slug ascending — and `ProjectCatalog`
owns it in the revised catalogue. The code implements it in
`src/content-transforms.ts`.

There is a second-order question inside this one. `Project.featured` was
introduced by Functional Design **for U1**, because Home shows a subset of
projects (FR4.3, which the story map assigns to U1). But the ordering rule it
feeds belongs to `ProjectCatalog`, which is **U3's** component. So the field and
the rule that consumes it currently sit on opposite sides of a unit boundary.

A. **Record the rule as U3's, and note where the field came from.** U3's notes
   state the ordering rule and cite ADR-008; a line records that `featured` was
   introduced by U1's Functional Design for Home's selected-projects section and
   is consumed by U3's ordering. One owner for the rule, provenance for the field.
B. **Record the rule as U3's and say nothing about the field's origin.** Shorter.
   Cost: a reader of U3 alone cannot tell why `featured` exists or which unit
   introduced it, and the story map's FR4.3 → U1 row does not mention it either.
C. **Move FR4.3's selected-projects concern to U3** so field and rule share a
   unit. Cost: this reassigns a requirement between units, which is a real
   boundary change against already-built code, and it would split FR4.3 — Home's
   intro and recent-posts sections would stay with U1.
X. Other (please specify)

[Answer]: A. Record the rule as U3's, and note where the field came from
**Timestamp:** 2026-09-23T21:20:00Z
**Mode:** guided

---

### Q8 — Static-asset copying has no owner in any unit

The revised `components.md` records that `SiteBuilder` copies the site's own
assets — the stylesheet and the self-hosted font — into the output, and copies
each post's and project's adjacent files beside that item's page.

`SiteBuilder` is U1's component, but U1's § Delivers list does not mention asset
copying at all. Meanwhile the *things being copied* are other units' deliverables:
the stylesheet and font are U5's, and post images are part of U2's FR2.6.

The DAG is unaffected either way — U5 already reaches U1 transitively through U2,
U3 and U4 — so this is about what the unit documents say, not about topology.

A. **Record the mechanism in U1 and the dependency on it in U5 and U2.** U1's
   § Delivers gains the copying mechanism as part of the build spine; U5's and
   U2's notes state that their assets reach the output through it. The
   `unit-of-work-dependency.md` § Integration points table gains a row for it.
B. **Record it in U1 only.** The mechanism is U1's; other units simply put files
   where it looks. Cost: U5's note that "nothing is fetched from another server"
   is the closest thing to an owner today, and a reader of U5 would not learn how
   the font actually reaches the built site.
C. **Leave it unrecorded.** It is implementation detail inside a component the
   catalogue already describes. Cost: the one place a reader looks to find what
   U1 delivers stays silent about a mechanism two other units depend on.
X. Other (please specify)

[Answer]: A. Record the mechanism in U1 and the dependency on it in U5 and U2
**Timestamp:** 2026-09-23T21:20:00Z
**Mode:** guided

---

## Consolidated Summary Confirmation

**First pass (Q1–Q5) — settled, not reopened.**

- Q1 — Answered "follow the component layers". Recorded as given, and resolved
  at [Q5] rather than overwritten.
- Q2 — Six units, all of them. The visual direction and launch content become
  units like the others, each carrying whatever design and test artifacts
  genuinely apply and explicitly nothing where none do.
- Q3 — The blog and projects are independent siblings. Both depend on the shell
  and on nothing else. The approved build order is unchanged; the graph simply
  stops claiming a dependency that does not exist.
- Q4 — The publishing workflow and Pages configuration belong to the first unit,
  because the walking skeleton cannot meet its own stated definition of done
  otherwise. Formatter and linter configuration land there too. CI Pipeline then
  hardens and reviews what already exists rather than building it from nothing.
- Q5 — The conflict between Q1 and the other three is resolved by making the
  first unit the whole build spine: U1 carries all eight components at minimum
  depth, which honours the layer view inside one unit, and U2 to U6 deepen
  specific slices on top. Q2, Q3 and Q4 stand exactly as answered, and the
  affirmed walking-skeleton practice is unchanged.
- Plan — Approved: six units (`u1-publishable-site-shell`, `u2-blog`,
  `u3-projects`, `u4-about-page`, `u5-visual-direction`, `u6-launch-content`);
  U2 to U5 tagged `ui`; U1 and U6 deliberately untagged, U1 because it genuinely
  spans build code, templates and publishing and U6 because it contains no code;
  U2, U3 and U4 mutually independent after U1; U5 depending on U2, U3 and U4;
  U6 depending on U2 and U3. Acyclic. Every unit is embedded in the one build,
  because a GitHub Pages user site is one site from one repository.

**Revision pass (Q6–Q8) — what this attempt changes.**

- Q6 — Reconcile only. No unit boundary, DAG edge, or requirement mapping
  changes. The component set, the edge block, and all 34 FR mappings across
  U1/U2/U3/U4 were diffed against the revised Domain Design and came back
  unaffected, so u1–u5 remain correctly built against these boundaries.
- Q7 — U3's claim that project ordering is undefined is removed and replaced by
  the rule ADR-008 records: featured-first, then year descending, then slug
  ascending, owned by `ProjectCatalog`. A line records that `Project.featured`
  was introduced by U1's Functional Design for Home's selected-projects section
  (FR4.3) and is consumed by U3's ordering, so the field's provenance is legible
  from U3 without reassigning any requirement.
- Q8 — Static-asset copying is recorded in three places: U1's § Delivers gains
  the mechanism as part of the build spine, U5's and U2's notes state that their
  stylesheet, font and post images reach the output through it, and
  `unit-of-work-dependency.md` § Integration points gains a row for it. The DAG
  is unchanged — U5 already reaches U1 transitively through U2, U3 and U4.
- Plan — Approved unchanged: the same six units, the same kinds, the same
  dependency structure, the same sole root and two leaves.

Nothing in this pass reopens Q1–Q5, changes a unit boundary, or touches `src/`.
`traceability.json` needs no change, because no requirement moved unit.

Does this all look correct before I generate the artifact?

- Looks correct
- Request changes

[Answer]: Looks correct
