# Interaction Specification — Personal Portfolio & Blog Site

Component-level specifications in the format of
`.claude/knowledge/aidlc-design-agent/component-spec-template.md`, adapted in one
way: this site has no components that take props, so the **Props / Inputs** table
is replaced by **Content** — the fields each component renders and where they
come from.

**This site has very little interaction, and that is the specification.** There
are no modals, dropdowns, tabs, accordions, carousels, forms, or inputs
anywhere; the keyboard flow states this directly, and it is why nothing can trap
focus. Every interactive element on the site is a link. Seven components follow.

## Sources

- [desc] Initial description: "I want to build a Github.io Blog site to present my work and make blog posts about things I currently learning or I find to be interesting. For UX/UI I want you to use Mobbin"
- [scope] Workflow-selected scope: `feature`.
- [upstream] `ideation/rough-mockups/wireframes.md` — the frames and per-frame accessibility notes these components implement
- [upstream] `ideation/rough-mockups/user-flow.md` — the four flows and the keyboard flow that fix tab order
- [upstream] `inception/requirements-analysis/requirements.md` — FR2.3, FR2.7, FR2.8, FR3.4, FR3.5, FR3.6, FR4.2, NFR1, NFR2, NFR6, NFR7
- [upstream] `inception/practices-discovery/team-practices.md` — the keyboard walkthrough that verifies each component
- [Q1]–[Q9] `refined-mockups-questions.md`
- [mobbin] Mobbin references listed in `refined-mockups-questions.md` § Mobbin references consulted

Token names below are defined in `design-system-mapping.md`.

---

## Skip Link

| Field | Value |
|---|---|
| Component | Skip to content |
| Description | The first focusable element on every page; jumps past the header to `<main>` |
| Category | navigation |

### States

| State | Description | Trigger |
|---|---|---|
| default | Visually hidden, present in the DOM and in the accessibility tree | page load |
| focus | Appears top-left on `--surface-shell` with `--focus-ring`, sans 14px `--text` | Tab from page load |

Hidden with a clip-path technique, never with `display: none` or
`visibility: hidden` — both remove it from the tab order, which defeats it.

### Content

| Field | Source |
|---|---|
| Label | Static: "Skip to content" |
| Target | `#main`, the page's `<main>` element |

### Responsive

Identical at every width.

### Accessibility

| Requirement | Implementation |
|---|---|
| ARIA role | Native `<a>`; no role needed |
| Keyboard | Tab to focus, Enter to follow; focus lands on `<main>`, which carries `tabindex="-1"` so the jump takes effect |
| Contrast | `--text` on `--surface-shell` — 15.3:1 |
| Screen reader | Announced as "Skip to content, link" |

---

## Global Shell

| Field | Value |
|---|---|
| Component | Header, navigation, and footer |
| Description | The persistent frame on all seven page types |
| Category | navigation |

### States

| State | Description | Trigger |
|---|---|---|
| default | Name left, three nav links right, hairline beneath | page load |
| current page | That nav link takes `--text` plus a 1px `--accent` underline at 4px offset, and `aria-current="page"` | route matches |
| link hover | `--text-muted` → `--text` | mouseover |
| link focus | `--focus-ring` | Tab |

### Content

| Field | Source |
|---|---|
| Name | Static: "Rue Asha", confirmed at Approval & Handoff |
| Nav links | Static: Writing, Projects, About |
| Footer | Copyright year, GitHub link, email link |

### Responsive

| Breakpoint | Behaviour |
|---|---|
| ≥720px | Name left, links right, one row |
| <720px | Same, wrapping to a second row if needed. No hamburger — three links do not earn one |

### Accessibility

| Requirement | Implementation |
|---|---|
| ARIA role | `<header>` (banner), `<nav>`, `<footer>` (contentinfo) |
| Keyboard | Tab order: skip link → name → Writing → Projects → About → main content → footer links |
| Label | `<nav aria-label="Primary">` |
| Contrast | Nav muted 7.4:1, current-page text 15.3:1, accent underline 9.1:1 |
| Non-colour marking | Current page carries `aria-current="page"` as well as the accent underline, so the state is not colour-only |

---

## List Row

The site's single most-used interactive element: one row on the Writing list,
the Projects list, or a Home section.

| Field | Value |
|---|---|
| Component | List row |
| Description | A whole-row link to a post or project |
| Category | navigation |

### States

| State | Description | Trigger |
|---|---|---|
| default | `--surface-shell`, `--border-hairline` beneath, `--space-4` vertical padding | page load |
| hover | Background lifts to `--surface-reading` over 120ms ease-out | mouseover |
| focus | `--focus-ring` (2px `--accent`, 2px offset) drawn outside the row bounds | Tab |
| hover + focus | Both apply; they are visually distinct and do not cancel | — |

Hover and focus are deliberately different treatments [Q6]. The hover tint is a
mouse affordance; the focus ring is a keyboard position. A keyboard user shown
only a tint has to infer where they are, which is the failure this split avoids.

The hover lift is the same one step by which a reading page is lifted, so the
affordance carries meaning rather than decoration: this row leads to a page set
on that surface.

### Content

| Field | Source | Notes |
|---|---|---|
| Title | Post `title` / project `name` | `--type-list`, sans 600, `--text` |
| Date | Post `date` | `--type-meta` mono muted, in `<time datetime>`; posts only |
| Summary | One-line summary | `--type-summary`, muted |
| Tools | Project `tools` | `--type-meta` mono uppercase, middle-dot separated; projects only |
| Repo link | Project `repo` | Separate target — see Outbound Link below; projects only |

### Responsive

| Breakpoint | Behaviour |
|---|---|
| ≥720px | Title left, date right on the same line; summary beneath |
| <720px | Date moves beneath the title; the whole row remains one hit target |

**Minimum height 44px at every width** (`requirements.md` NFR7). 16px padding
each side plus a 24px title line gives 56px before the summary is counted, so
the floor holds with room — but it is a floor, and the compact scale may not be
tightened past it.

### Accessibility

| Requirement | Implementation |
|---|---|
| ARIA role | Native `<a>` wrapping the row's content inside an `<li>`; no role needed |
| Keyboard | Tab to focus, Enter to follow. Exactly one tab stop per row on Writing; two on Projects (title, then repo link) |
| Label | The link's accessible name is the title plus date; the summary is inside the link so it is announced with it |
| Contrast | Title 15.3:1 default and 14.2:1 on hover; muted 7.4:1 and 6.9:1; focus ring 9.1:1 against both |
| Screen reader | Announced as a list of *n* items; each row is one link, so heading navigation and link navigation both work |

---

## Outbound Link

| Field | Value |
|---|---|
| Component | Repository / live-site link |
| Description | A link that leaves this site, marked as such |
| Category | navigation |

### States

| State | Description | Trigger |
|---|---|---|
| default | `--text-muted` with the `↗` mark | page load |
| hover | `--accent` | mouseover |
| focus | `--focus-ring`, drawn separately from the enclosing row's ring | Tab |

### Content

| Field | Source |
|---|---|
| Visible text | "repo" or "site", plus the `↗` mark |
| Accessible name | "Repository for `<project name>`" / "Live site for `<project name>`" |
| Target | Project `repo` / `live` front-matter field |

### Responsive

On a Projects row at <720px the link moves to its own line beneath the tools,
keeping `--space-4` of clear space from the row's main target so neither is hit
by accident.

### Accessibility

| Requirement | Implementation |
|---|---|
| ARIA role | Native `<a>` |
| Keyboard | Its own tab stop, always after the row title |
| Label | `aria-label` supplies the project-qualified name (`requirements.md` FR3.6); a bare "repo" would give a screen-reader link list a column of identical entries |
| Contrast | Muted 7.4:1, accent on hover 9.1:1 |
| Non-colour marking | The `↗` glyph marks it as outbound; colour alone never does |

**When a project has no live URL, the row is omitted entirely** — not rendered
empty, not shown with a dash (`requirements.md` FR3.4).

---

## Reading Page Body

| Field | Value |
|---|---|
| Component | Post / project body |
| Description | The long-form column in the editorial register |
| Category | display |

### States

| State | Description | Trigger |
|---|---|---|
| default | `--surface-reading`, 66ch measure, `--type-reading` | page load |
| link hover / focus | Body links take `--accent`; underline with 2px offset; `--focus-ring` on focus | mouseover / Tab |
| partial | Very long titles wrap rather than truncate | long content |

There is deliberately **no loading state**. Pages are served complete
(`requirements.md` NFR2), so no skeleton, spinner, or placeholder exists
anywhere in this system.

### Content

| Field | Source |
|---|---|
| Title | Post `title` / project `name` — serif 600, `--type-post-title` |
| Dek | One-line summary — `--type-reading` muted |
| Date | Post `date` — `--type-meta` mono, full month name, `<time datetime>` |
| Body | Markdown: headings, links, lists, images with alt text, code blocks (`requirements.md` FR2.6) |

### Responsive

| Breakpoint | Behaviour |
|---|---|
| ≥720px | 66ch column centred in the page |
| <720px | Column fills the width inside a 16px page margin; `--type-post-title` drops to 32px |

### Accessibility

| Requirement | Implementation |
|---|---|
| ARIA role | `<article>` inside `<main>` |
| Keyboard | Links in reading order; no element takes focus out of order |
| Heading order | Title is the only `h1`; body headings start at `h2` and never skip a level |
| Contrast | Body 14.2:1, muted 6.9:1, links 8.5:1 |
| Images | `alt` mandatory; a decorative image uses `alt=""` |

---

## Code Block

| Field | Value |
|---|---|
| Component | Code block |
| Description | A recessed well inside a reading page, coloured at build time |
| Category | display |

### States

| State | Description | Trigger |
|---|---|---|
| default | `--surface-well`, `--border-hairline`, `--radius`, `--type-code` | page load |
| overflow | Scrolls horizontally; the scroll container is keyboard-focusable | content wider than the column |
| focus | `--focus-ring` on the scroll container when it is scrollable | Tab |

### Content

| Field | Source |
|---|---|
| Code | Markdown fenced block |
| Colouring | Applied when the site is built, never in the reader's browser (`requirements.md` FR2.7) |

**The restrained theme** [Q7]: four token colours at most.

| Token class | Treatment |
|---|---|
| Comment | `--text-muted` — the usual contrast failure, and at 6.9:1 it is not one here |
| String | A muted green, verified ≥4.5:1 on `--surface-well` at design review |
| Keyword | A muted blue-violet, verified ≥4.5:1 on `--surface-well` |
| Everything else | `--text`, plain |

No token colour may reuse `--accent`; the accent means "link" everywhere else on
the site and a keyword wearing it would be the only place that stops being true.

### Responsive

Identical at every width; the block scrolls rather than reflows, because
rewrapping code changes its meaning.

### Accessibility

| Requirement | Implementation |
|---|---|
| ARIA role | `<pre><code>`; native semantics, no role |
| Keyboard | A horizontally scrollable block is reachable by Tab and scrollable with arrow keys, so keyboard users are not locked out of code wider than the column |
| Contrast | Every token colour ≥4.5:1 against `--surface-well`, checked by hand — see `accessibility-checklist.md` |
| Non-colour marking | Syntax colour is never the only signal; the code reads correctly in plain monochrome |

---

## Project Metadata Rail

| Field | Value |
|---|---|
| Component | Project rail |
| Description | Label/value pairs beside a project write-up, in the technical register |
| Category | display |

### States

| State | Description | Trigger |
|---|---|---|
| default | 200px wide, space-separated from the body, no border or background | page load |
| link hover / focus | Repo and live rows take `--accent` / `--focus-ring` | mouseover / Tab |
| partial | A project with no live URL omits that pair entirely | missing optional field |

### Content

| Field | Source | Required |
|---|---|---|
| Year | Project `year` | yes |
| Type | Project `type` | yes |
| Tools | Project `tools` | yes |
| Repo | Project `repo` | yes |
| Live | Project `live` | no — row omitted when absent |

### Responsive

| Breakpoint | Behaviour |
|---|---|
| ≥720px | Rail beside the body, in the DOM before it, so tab order matches reading order |
| <720px | Rail stacks above the body; label and value sit on one line each |

Because the rail precedes the body in the DOM, the tab order is correct in both
layouts without any reordering.

### Accessibility

| Requirement | Implementation |
|---|---|
| ARIA role | `<dl>` with `<dt>`/`<dd>` pairs — announced as pairs, not as loose text |
| Keyboard | Only the repo and live rows are focusable; label/value pairs are not interactive |
| Label | Rail links carry project-qualified accessible names, as Outbound Link above |
| Contrast | Labels muted 6.9:1, values 14.2:1, links 8.5:1 |

---

## Interaction Patterns Deliberately Absent

Recorded so Construction does not add any of them by habit, and so a later
reader knows each absence is a decision.

| Pattern | Why it is absent |
|---|---|
| Modal / dialog | Nothing on this site needs confirmation or focused input. The keyboard flow's "no element traps focus" holds because there is nothing to trap it |
| Dropdown / hamburger menu | Three nav links are below the threshold where one earns its complexity |
| Form / input of any kind | No comments, no newsletter, no search, no CMS — all excluded from the initiative |
| Pagination / infinite scroll | Launch content is one or two posts; a flat list is the whole design, and topic navigation is explicitly deferred |
| Theme toggle | Dark only [Q3]. No toggle means no script, and no script is the only JavaScript decision this site has to make |
| Loading / skeleton state | Pages are served complete (`requirements.md` NFR2) |
| Toast / alert / inline validation | Nothing on the site can fail at read time; the only error surface is the 404 page |
