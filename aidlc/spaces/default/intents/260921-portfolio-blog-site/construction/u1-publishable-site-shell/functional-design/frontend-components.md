# Frontend Components — U1 Publishable Site Shell

The template hierarchy this unit emits: the global shell, the seven page types at
skeleton depth, and the fragments they share. Everything below is **build-time
markup structure**, not a client-side component tree — nothing on this site
executes while a reader is on the page, so "props" here means the values a
template is handed at render time and "state" means the small number of render
branches, not runtime state.

That is a load-bearing distinction rather than a pedantic one. `requirements.md`
NFR2 requires every page to be served complete with no loading state, and C6
disqualifies any stack that renders content in the reader's browser. A component
model with runtime state would break both.

## Sources

- [upstream] `inception/units-generation/unit-of-work.md` — U1's boundary:
  "the shell and enough of the page templates to serve one post page and one
  project page", plus the tooling configuration that lands here
- [upstream] `inception/units-generation/unit-of-work-story-map.md` — FR4.2 to
  FR4.6 and FR5.2 to FR5.5 as U1's, and the cross-cutting rows showing which
  parts of the post and project templates U2 and U3 complete
- [upstream] `inception/requirements-analysis/requirements.md` — FR4.2 to FR4.6,
  FR5.3 to FR5.5, NFR1, NFR2, NFR4, NFR6
- [upstream] `inception/domain-design/components.md` — `PageRenderer`, which owns
  every template below, the head metadata, the security policy tag, and the
  accessibility contract of the rendered markup
- [upstream] `inception/domain-design/decisions.md` — ADR-006, the decision that
  one component owns the shell, all seven templates, and the reusable includes
- [upstream] `inception/refined-mockups/mockups.md`,
  `inception/refined-mockups/interaction-spec.md`,
  `inception/refined-mockups/accessibility-checklist.md` — the seven page types,
  the global shell, the two registers, and the screen states
- [Q4], [Q5], [Q6], [Q7] `functional-design-questions.md`

The declared `contract-summary` input is absent: Contract Design is SKIP in this
scope, so there is no cross-unit interface for these templates to satisfy.

---

## Hierarchy

```
BaseDocument
 +- Head
 |   +- TitleTag
 |   +- DescriptionTag
 |   +- CardTags              (Open Graph + Twitter card, no image)
 |   +- SecurityPolicyTag     (the one emitter of the CSP meta tag)
 +- SkipLink                  (first focusable element on every page)
 +- SiteHeader
 |   +- SiteName              (links Home)
 |   +- NavLinks              (Writing, Projects, About; current one marked)
 +- Main                      (the skip link's target)
 |   +- <one page template>
 +- SiteFooter
```

The seven page templates that slot into `Main`:

```
HomePage            IntroBlock + SectionBlock(Writing) + SectionBlock(Projects)
WritingListPage     PageHeading + PostRow* | EmptyState
PostPage            PostHeader + AllPostsLink + RenderedBody + AllPostsLink
ProjectsListPage    PageHeading + ProjectRow* | EmptyState
ProjectPage         ProjectHeader + MetadataRail + RenderedBody
AboutPage           PageHeading + RenderedBody
NotFoundPage        PageHeading + PlainSentence + RouteLinks
```

Shared fragments, each a named reusable include rather than markup pasted into
two templates:

```
PostRow        title, date, summary   -> one link target covering all three
ProjectRow     name, summary, tools, repo link
EmptyState     sentence + a link to the other section
MetadataRail   year, type, tools, repo, live URL (row omitted when absent)
AllPostsLink   "All posts" -> the Writing list
```

---

## What each template is handed, and what it branches on

"Props" are render-time inputs. "Branches" are the only conditionals in the
template — there are deliberately few, and each one is a rule from `rules.md`.

| Template | Props | Branches |
|---|---|---|
| BaseDocument | `title`, `description`, `canonicalUrl`, `siteMetadata`, `currentNav` | none |
| Head | `title`, `description`, `canonicalUrl`, `siteMetadata` | Description falls back to `siteMetadata.fallbackDescription` when the page supplies none (BR5.8) |
| SiteHeader | `currentNav` | The matching nav link carries `aria-current="page"` (BR5.1) |
| HomePage | `siteName`, `intro`, `recentPosts` (≤3), `topProjects` (≤3) | Each section renders `EmptyState` when its list is empty (BR5.5). The intro has no branch: it renders whatever the two lists hold (BR5.12) |
| WritingListPage | `posts` (ordered) | `EmptyState` when empty (BR5.5) |
| PostPage | `post`, `renderedBody` | none |
| ProjectsListPage | `projects` (ordered) | `EmptyState` when empty (BR5.5) |
| ProjectPage | `project`, `renderedBody` | The rail omits its Live row entirely when `liveUrl` is absent (BR3.5) |
| AboutPage | `renderedBody` | none |
| NotFoundPage | — | none |
| IntroBlock | `siteName`, `intro` | none |
| MetadataRail | `project` | The one branch above; every other row is always present |
| PostRow | `post` | none |
| ProjectRow | `project` | none |
| EmptyState | `sentence`, `routeLabel`, `routeHref` | none |

**`recentPosts` and `topProjects` are computed before rendering, not in the
template.** `PostCatalog` and `ProjectCatalog` own the ordering (BR2.4, BR3.7)
and `PageRenderer` takes the first three of each (BR5.3). Sorting inside a
template would put a business rule somewhere no unit test can reach.

**The intro's prose is handed to the template, not written into it.** BR5.12
makes it a site-level editorial value authored once outside `content/`; the Home
template receives it as `intro`, and the name it renders as the page's only `h1`
as `siteName`. Neither is derived from a post or a project, and `IntroBlock`
sits above both `SectionBlock`s in document order, which is where BR5.12 places
it and where the keyboard order (below) then finds it first.

---

## Interaction flows

There is no JavaScript on this site, so every flow below is a navigation or a
keyboard focus movement.

| Flow | Trigger | Result |
|---|---|---|
| Reach any section | A nav link in the header, present on every page | The target list page. Every page type is one click from Home (BR5.7) |
| Open a post | Click anywhere in a Writing list row, including the summary line | The post page. The whole row is one link target |
| Return from a post | Either "All posts" link, at the top and the end of the body | The Writing list |
| Leave for a repository | A project's repo link | An external site; the link carries the outbound affordance |
| Skip the navigation | Tab once on page load, then Enter | Focus moves to `Main`. The skip link becomes visible on focus |
| Hit a dead URL | Any path matching no page | The site's own 404 page (W6 in `functional-spec.md`) |

**Keyboard order is document order.** The templates emit skip link, then header
navigation, then main content, then footer, and nothing reorders them visually,
so tab order follows visual order without a single tabindex value. That is the
cheapest way to satisfy NFR1's tab-order condition and it is a property of the
markup this unit emits, so it cannot be retrofitted by U5.

---

## Form validation

**Not applicable, and the reason is the scope rather than the stage.** This site
has no forms: comments, an email newsletter, an admin interface, and any
authoring path beyond editing files directly are all excluded from the initiative
entirely rather than deferred, and later stages must not leave hooks for them. The
content-security policy this unit emits carries `form-action 'none'` (BR5.10),
which makes the absence enforced rather than merely intended.

Recording this as not applicable with the reason, rather than inventing a
validation section to fill the slot.

## API integration points

**None.** Every component in the catalogue runs at build time, and nothing is
fetched from another server while a reader is viewing a page. The content-security
policy's `default-src 'self'` enforces it, and `script-src 'none'` means there is
nothing on the page that could make a request even if the policy allowed one.

The only integration this unit has is with the file system, at build time, and it
belongs to `SiteBuilder` and `ContentSource` rather than to any template here.

---

## Responsive behaviour this unit must not foreclose

U5 owns the visual treatment, but the markup structure emitted here decides what
U5 can do without rewriting templates. Three structural commitments, each from
`requirements.md` NFR6:

- **The metadata rail is a sibling of the body, not nested inside it**, so the
  phone layout can stack it above the body with a single layout rule.
- **A list row's title, date, and summary are one link element**, so the phone
  layout can move the date beneath the title without splitting the hit target —
  and so the 44px minimum target (NFR7) is met by one element rather than three.
- **The top bar is a plain list of links**, with no disclosure widget, because
  the top bar stays visible at every width with no hamburger.

---

## What this unit builds and a later unit completes

`unit-of-work.md` gives U1 "enough of the page templates to serve one post page
and one project page". The story map's cross-cutting table names exactly what
that leaves to others:

| Template | Built here | Completed by |
|---|---|---|
| PostPage | Structure, head metadata, a minimal rendered body | U2 — the full Markdown element set and the four-token code theme |
| WritingListPage | Structure and the empty state | U2 — the ordered list of real posts |
| ProjectPage | Structure and the metadata rail with its omit rule | U3 — the two distinguishable row targets and accessible link names |
| ProjectsListPage | Structure and the empty state | U3 — the full row content |
| HomePage | The intro, complete; both sections with their equal treatment | U2 and U3 — filling the two sections with real entries |
| AboutPage | Structure only | U4 — the prose and links |
| NotFoundPage | Complete | — |
| All seven | Markup, landmarks, focus order | U5 — the visual treatment and focus ring |

Only `NotFoundPage` is finished here. The rest are real but shallow, which is what
a walking skeleton is.

**The two "All posts" links on the post page are U2's requirement, not U1's.**
`PostPage` above emits `AllPostsLink` at the top and at the end of the body,
which is the whole of FR2.8 — and the story map assigns FR2.8 to U2, not to U1.
The reason U1 emits them anyway is the same one that puts a post template here at
all: the skeleton has to serve one post page a reader can leave, and a link the
template never renders is not something a later unit can style or reposition
without rewriting the template. So U1 provides the structural position; **U2 owns
the requirement**, its acceptance check — load a post, both links present, both
reaching the Writing list — and any change to their wording or placement. This
unit's `traceability.json` does not list FR2.8, because a requirement U1 does not
own is not U1's to claim as covered.

**The keyboard walkthrough runs on all seven page types when this unit is
built**, and again after U5 applies the styling. A page type whose walkthrough has
not been done is not finished — including the 404, which is the one most likely to
be treated as too small to bother with.
