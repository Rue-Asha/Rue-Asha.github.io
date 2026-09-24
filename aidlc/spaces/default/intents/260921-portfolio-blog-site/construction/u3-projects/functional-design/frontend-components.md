# Frontend Components — U3 Projects

The project-facing templates and fragments, deepened from the versions U1 left at
skeleton depth. Build-time markup structure, not a client-side component tree.

## Sources

- [upstream] `inception/units-generation/unit-of-work.md` § U3 — the boundary:
  the Projects list, the write-up page, and the metadata rail
- [upstream] `inception/units-generation/unit-of-work-story-map.md` § U3 and
  § Cross-cutting — the seven requirements, and what U1 built minimally here
- [upstream] `inception/requirements-analysis/requirements.md` — FR3.1, FR3.2,
  FR3.4, FR3.5, FR3.6, FR3.7, NFR1, NFR6, NFR7
- [upstream] `inception/domain-design/components.md` — `PageRenderer` owns every
  template below; `ProjectCatalog` supplies the ordered list
- [upstream] `inception/refined-mockups/mockups.md` and `interaction-spec.md` —
  the Projects and Project page shapes, the rail, and the outbound-link affordance
- [upstream] `construction/u1-publishable-site-shell/functional-design/frontend-components.md`
  — the shell and the skeleton versions of these templates
- [Q1] `functional-design-questions.md`

The declared `contract-summary` input is absent: Contract Design is SKIP in this
scope.

---

## Hierarchy

Everything below slots into the `Main` element of U1's `BaseDocument`; the shell,
head metadata and security policy are inherited unchanged.

```
ProjectsListPage
 +- PageHeading
 +- ProjectRow*         (one per project, in BR9.3 order)
 |   +- ProjectNameLink (target 1 — the write-up, on this site)
 |   +- ProjectSummary  (not a link)
 |   +- ToolsList       (not links)
 |   +- RepoLink        (target 2 — off site, named for its project)
 +- EmptyState          (instead of the rows, when no project exists)

ProjectPage
 +- ProjectHeader
 |   +- ProjectName
 |   +- ProjectSummary
 +- MetadataRail        (sibling of the body, not nested in it)
 |   +- RailRow(year)
 |   +- RailRow(type)
 |   +- RailRow(tools)
 |   +- RailRow(repository)
 |   +- RailRow(live)   (omitted entirely when liveUrl is absent)
 +- RenderedBody
```

`ProjectRow` is a named reusable include, used by both the Projects list and
Home's selected-projects section — the same reason `PostRow` is one.

---

## Props and branches

| Template | Props | Branches |
|---|---|---|
| ProjectsListPage | `projects` (ordered) | `EmptyState` replaces the rows when `projects` is empty (U1 BR5.5) |
| ProjectRow | `project` | none |
| ProjectHeader | `project` | none |
| MetadataRail | `project` | The live row is omitted entirely when `liveUrl` is absent (U1 BR3.5, BR9.1) |
| RailRow | `label`, `value` | none |
| RenderedBody | `renderedBody` | none |
| EmptyState | `sentence`, `routeLabel`, `routeHref` | none |

**`projects` arrives already ordered.** The template never sorts. Ordering is
`ProjectCatalog`'s rule (U1 BR3.7, applied to the full list by BR9.3), and it is
one of the functions with a unit test behind it.

**`MetadataRail` has exactly one branch.** Every other rail value comes from a
required field, so only the live row can be absent. That is why BR9.1 can fix the
row order: nothing else can disappear and shift the rest.

---

## Two targets per row, and why the row is not one link

The Writing list makes each row a single link. This list cannot, and the
difference is a requirement rather than a style choice:

- A Projects row has **two destinations** — the write-up here and the repository
  elsewhere (FR3.5). One link would make one of them unreachable from the list.
- The two are **visibly distinguishable**, and the repository link carries the
  outbound affordance so a reader knows before clicking that it leaves the site.
- The repository link's accessible name **identifies its project** (FR3.6). Read
  out of context, a page of links all named "repo" is unusable.
- Consequently a Projects row is **two tab stops**, not one. That is the correct
  count here, and the keyboard walkthrough for this page type should expect it
  rather than flag it.

The summary and the tools list are **not** links. Adding a third target would put
three stops in a row and give a reader no way to predict where each one goes.

---

## Interaction flows

| Flow | Trigger | Result |
|---|---|---|
| Open a write-up | The project name in a row | The project page |
| Go to a repository | The repo link in a row or the rail | Off site, to the repository host |
| Go to a live site | The rail's live row, when present | Off site, to the project's live URL |
| Reach Projects from anywhere | The shell's navigation link | The Projects list (U1 BR5.7) |
| Leave an empty Projects page | The empty state's link | The Writing list |

No flow involves JavaScript. There is no focus management, no disclosure, and
nothing that can trap focus.

---

## Form validation

**Not applicable.** This unit has no forms, and U1's content-security policy
carries `form-action 'none'`, which makes the absence enforced rather than merely
intended.

## API integration points

**None.** Every component runs at build time. The repository and live URLs are
plain outbound links a reader may follow; nothing is fetched from them at build
time or at page load, which is what keeps `default-src 'self'` satisfiable.

---

## Responsive commitments

Three structural choices this unit makes so U5 can style rather than rewrite:

- **The rail is a sibling of the body**, not nested inside it, so the phone
  layout stacks it above the body with one layout rule (NFR6).
- **Each rail row is a label and a value on one line**, so stacking does not
  reflow them into an unreadable block.
- **The two row targets are separate elements** sized independently, so each can
  meet the 44px phone minimum on its own (NFR7). A single wrapping link would
  have made the repo link's target area ambiguous.

  **How the outbound link actually reaches 44px is U5's rule, not this unit's.**
  Separate elements make independent sizing *possible*; they do not supply the
  figure, and the repo link is short text at the meta size, so it does not reach
  44px on its own. `interaction-spec.md` § Outbound Link sizes only the clear
  space between the two targets and states no height for either. The mechanism is
  **U5 BR11.1**: below the single breakpoint, vertical padding sufficient to
  bring any standalone single-line link to a 44px hit area, without changing its
  type size or colour. The 16px clear space the interaction spec requires is
  measured between the two *hit areas*, not their glyph boxes, so the enlarged
  target pushes the gap outward instead of eating it and the row grows taller.
  Recorded here so this commitment is implementable without guessing — the
  structure is U3's, the figure is U5's.

The keyboard walkthrough runs on the Projects and Project page types when this
unit is built, and again after U5 applies the styling. Expect two stops per list
row; a walkthrough that flags this as a defect is reading the Writing list's rule
onto the wrong page.
