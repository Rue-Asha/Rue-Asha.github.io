# Rough Wireframes — Personal Portfolio & Blog Site

Low fidelity. Boxes and labels only; no colour, type scale, or spacing values.
Those belong to Refined Mockups, not here.

## Sources

- [desc] Initial description: "I want to build a Github.io Blog site to present my work and make blog posts about things I currently learning or I find to be interesting. For UX/UI I want you to use Mobbin"
- [scope] Workflow-selected scope: `feature`.
- [upstream] `ideation/intent-capture/intent-statement.md`, `ideation/scope-definition/scope-document.md`, `ideation/scope-definition/intent-backlog.md`
- [mobbin] Mobbin references, listed in `rough-mockups-questions.md` under "Mobbin references consulted", consulted per the initial description's UX/UI direction [desc]

---

## Information Architecture

Five page types. Flat — nothing is more than one click from home. [Q1], [Q3]

```
Home  ──┬── Writing (post list)  ──── Post
        ├── Projects (project list) ── Project
        └── About
```

| Page | Purpose | Source |
|---|---|---|
| Home | Intro, then recent posts and selected projects together | [Q1] |
| Writing | The full typographic list of posts | [Q2] |
| Post | One post, read end to end | [Q7], [Q8] |
| Projects | The full list of projects with summary, tools, repo link | [Q6] |
| Project | One project's in-depth write-up | [Q6] |
| About | Who you are, with contact and profile links | [upstream] |

About is reachable from the top bar but carries no children, so it is drawn
inline with Home below rather than given its own frame.

---

## Global Shell

Present on every page. [Q3]

```
+--------------------------------------------------------------+
|  RUE ASHA                        Writing   Projects   About   |   <- header
+--------------------------------------------------------------+
|                                                              |
|                      [ page content ]                        |   <- main
|                                                              |
+--------------------------------------------------------------+
|  (c) year  ·  GitHub  ·  email                               |   <- footer
+--------------------------------------------------------------+
```

Name on the left is the home link. Two or three links on the right, current
page marked. [Q3]

**Accessibility note:** `<header>` landmark holds a `<nav>`; page title is the
only `h1` on each page; `<main>` wraps content; `<footer>` is `contentinfo`. A
skip-to-content link is the first focusable element. Keyboard entry point is
the skip link, then the name, then the nav links in visual order. [Q5]

---

## Home

Reference pattern: intro above writing, as in the Intercom author page and the
GitHub ReadME profile. [mobbin] Both halves appear on one page with neither
visually dominant. [Q1], [upstream]

```
+--------------------------------------------------------------+
|  RUE ASHA                        Writing   Projects   About   |
+--------------------------------------------------------------+
|                                                              |
|   Rue Asha                                        (h1)       |
|   One or two sentences: what I do and what I write about.    |
|   GitHub  ·  email                                           |
|                                                              |
|   ----------------------------------------------------       |
|                                                              |
|   Writing                                  All posts >  (h2) |
|                                                              |
|   Post title one                              12 Mar 2026    |
|   One line about what this post is.                          |
|   ----------------------------------------------------       |
|   Post title two                              28 Feb 2026    |
|   One line about what this post is.                          |
|                                                              |
|   ----------------------------------------------------       |
|                                                              |
|   Projects                               All projects > (h2) |
|                                                              |
|   Project name                                               |
|   One line about what it does.                               |
|   TypeScript · Postgres            repo >                    |
|   ----------------------------------------------------       |
|   Project name                                               |
|   One line about what it does.                               |
|   Go · Docker                      repo >                    |
|                                                              |
+--------------------------------------------------------------+
|  (c) year  ·  GitHub  ·  email                               |
+--------------------------------------------------------------+
```

Equal weight is carried structurally: both sections use the same heading
level, the same rule treatment, and the same "All X >" affordance. Neither
gets a larger type treatment or an image the other lacks. [Q1], [upstream]

**Accessibility note:** `h1` is the name; "Writing" and "Projects" are `h2`;
each entry title is `h3`. Landmarks: `header`, `main`, `footer`. Keyboard
entry point is the skip link, then the first nav link. Dates use a
`<time datetime>` element so they are unambiguous to assistive technology.
[Q5]

---

## Writing (post list)

Reference pattern: the typographic list used by OpenAI's Recent Highlights,
Webflow's index, and Hex. No per-post image. [mobbin], [Q2]

```
+--------------------------------------------------------------+
|  RUE ASHA                        Writing   Projects   About   |
+--------------------------------------------------------------+
|                                                              |
|   Writing                                            (h1)    |
|                                                              |
|   Post title one                              12 Mar 2026    |
|   One line about what this post is.                          |
|   ----------------------------------------------------       |
|   Post title two                              28 Feb 2026    |
|   One line about what this post is.                          |
|   ----------------------------------------------------       |
|   Post title three                            04 Feb 2026    |
|   One line about what this post is.                          |
|                                                              |
+--------------------------------------------------------------+
```

The whole row is the link target, not just the title — a larger, easier hit
area that also satisfies the 44px touch-target minimum once this contracts to
a phone. [Q4], [Q5]

**Accessibility note:** `h1` is "Writing"; each post title is an `h2` inside a
list item, so the list is navigable by heading and by list. Landmarks:
`header`, `main`, `footer`. Keyboard entry point is the skip link, then the
first post row. [Q5]

### Empty state

With no posts published, the list must not render as a bare heading over
nothing. [upstream]

```
|   Writing                                            (h1)    |
|                                                              |
|   Nothing published yet.                                     |
|   Projects >                                                 |
```

---

## Post

Reference pattern: Substack's reading page — narrow measure, title, one-line
dek, date. [mobbin], [Q7], [Q8]

```
+--------------------------------------------------------------+
|  RUE ASHA                        Writing   Projects   About   |
+--------------------------------------------------------------+
|                                                              |
|          < All posts                                         |
|                                                              |
|          Post title                                  (h1)    |
|          One line about what this post is.                   |
|          12 Mar 2026                                         |
|          --------------------------------------              |
|                                                              |
|          Body text in a single narrow column,                |
|          comfortable to read across a wide                   |
|          screen without the line length running              |
|          away.                                               |
|                                                              |
|          ## A heading inside the post           (h2)         |
|                                                              |
|          More body text.                                     |
|                                                              |
|              +----------------------------+                  |
|              |  code block / image        |                  |
|              +----------------------------+                  |
|                                                              |
|          --------------------------------------              |
|          < All posts                                         |
|                                                              |
+--------------------------------------------------------------+
```

"All posts" appears at the top and again at the end — the end one is the
useful one after a long read, the top one orients on arrival. No related-post
links: deferred until there are posts worth surfacing. [Q8]

The content column is narrower than the page even on desktop. Desktop-first
here means the measure is chosen for the wide screen and the column simply
fills the width on a phone. [Q4]

**Accessibility note:** post title is the `h1`; headings inside the body start
at `h2` and never skip a level. Landmarks: `header`, `main`, `footer`. Images
in the body carry alt text; code blocks are `<pre><code>` and are reachable by
keyboard scroll when they overflow. Keyboard entry point is the skip link,
then the top "All posts" link. [Q5]

---

## Projects (project list)

Each entry carries the summary, the tools, and the repo link. The entry title
links through to the project's own page. [Q6]

```
+--------------------------------------------------------------+
|  RUE ASHA                        Writing   Projects   About   |
+--------------------------------------------------------------+
|                                                              |
|   Projects                                           (h1)    |
|                                                              |
|   Project name                                               |
|   One or two lines about what it does and why it exists.     |
|   TypeScript · Postgres · Docker            repo >           |
|   ----------------------------------------------------       |
|   Project name                                               |
|   One or two lines about what it does and why it exists.     |
|   Go · SQLite                               repo >           |
|                                                              |
+--------------------------------------------------------------+
```

Two link targets per row: the title goes to the project page, "repo >" goes
out to the repository. They must be visually distinguishable so neither is
hit by accident — the repo link is separated to the right and carries an
external-link affordance. [Q6], [Q5]

**Accessibility note:** `h1` is "Projects"; each project name is an `h2` inside
a list item. The repo link needs an accessible name that includes the project
("Repository for <project name>") rather than a bare "repo", since screen
reader users may navigate by link list. Landmarks as above. [Q5]

---

## Project (in-depth page)

Reference pattern: basement.studio's fixed metadata rail beside the write-up,
with Tailscale's case study as the same idea in a right-hand column. [mobbin],
[Q6]

```
+--------------------------------------------------------------+
|  RUE ASHA                        Writing   Projects   About   |
+--------------------------------------------------------------+
|                                                              |
|  < All projects                                              |
|                                                              |
|  +-------------+  Project name                        (h1)   |
|  | Year  2026  |  One or two lines about what it does.       |
|  | Type  CLI   |                                             |
|  | Tools TS    |  ------------------------------------       |
|  |       PG    |                                             |
|  | Repo  >     |  Whatever depth the write-up needs:         |
|  | Live  >     |  what the problem was, how it works,        |
|  +-------------+  what went wrong, what you would do         |
|      (rail)       differently. Structure is yours to         |
|                   choose per project.                        |
|                                                              |
|                   ## A heading inside the write-up    (h2)   |
|                                                              |
|                   More prose, code blocks, screenshots       |
|                   as the project warrants.                   |
|                                                              |
|  ------------------------------------------------------      |
|  < All projects                                              |
|                                                              |
+--------------------------------------------------------------+
```

The rail holds the facts that are the same for every project; the body holds
whatever that project deserves. This is what lets the write-up vary in depth
without the list of projects becoming inconsistent — the scannable part is
always in the same place. [Q6]

On a phone the rail stacks above the body rather than beside it. [Q4]

**Accessibility note:** project name is the `h1`; write-up headings start at
`h2`. The rail is a description list (`<dl>`) so label/value pairs are
announced as pairs, not as loose text. It sits in the DOM before the body so
tab order matches the visual reading order on desktop and the stacked order on
mobile. Landmarks as above. [Q5]

### Long write-up variant

When a project write-up runs long, borrow the contents rail from Obvious:
the metadata rail gains a list of the page's own `h2` headings beneath it.
[mobbin] Not required at launch; noted so the layout does not have to be
redrawn later.

---

## About

```
+--------------------------------------------------------------+
|  RUE ASHA                        Writing   Projects   About   |
+--------------------------------------------------------------+
|                                                              |
|          About                                       (h1)    |
|                                                              |
|          A few paragraphs: who you are, what you             |
|          work on, what you are currently learning.           |
|                                                              |
|          Elsewhere                                   (h2)    |
|          GitHub  ·  email  ·  other profiles                 |
|                                                              |
+--------------------------------------------------------------+
```

**Accessibility note:** `h1` is "About"; "Elsewhere" is an `h2`. Links carry
their destination in the link text, not in surrounding prose. Landmarks as
above. [Q5]

---

## Responsive Behaviour

Desktop is the resolved layout; the phone layout is the contraction of it.
[Q4]

| Page | Desktop | Phone |
|---|---|---|
| Global shell | Name left, links right on one row | Name left, links right, wrapping to a second row if needed; no hamburger at three links |
| Home | Single column, full width for lists | Same structure, narrower |
| Writing / Projects | Title and date on one row, summary beneath | Date moves beneath the title; whole row stays one hit target |
| Post | Narrow measure centred in a wide page | Column fills the width with page margins |
| Project | Metadata rail beside the body | Rail stacks above the body |

Three navigation links is below the threshold where a hamburger earns its
complexity, so the top bar stays visible at every width. [Q3]

---

## Screen States

Wireframed per the five-state rule; states that cannot occur on a static site
are marked as such rather than invented. [Q2], [upstream]

| State | Where it applies | Treatment |
|---|---|---|
| Empty | Writing and Projects lists | Plain sentence plus a route to the other section — drawn above for Writing; Projects mirrors it |
| Loading | Not applicable | Pages are served complete; there is no fetch to show progress for |
| Populated | All pages | The frames above |
| Error | 404 only | A page carrying the global shell, a plain sentence, and links to Writing and Projects |
| Partial | Post and Project bodies | Very long titles wrap rather than truncate; a project with no live URL simply omits that rail row rather than showing an empty one |

The absence of a loading state is a consequence of how the site is published
rather than a design choice, and is recorded under assumptions below.

---

## Assumptions & Open Questions

- [assumption] The per-project in-depth page is read as an elaboration of the
  scope document's "a section presenting what you have built" [upstream]
  rather than an addition to scope. The answer names it directly [Q6], but the
  scope document does not enumerate page types, so this reading has not been
  separately confirmed against the approved boundary.
- [assumption] "Loading state not applicable" assumes pages are served as
  complete documents. That follows from the commit-and-it-appears publishing
  workflow [upstream] but is not yet an architectural decision, and a build
  that fetches content at runtime would reintroduce the state.
- [assumption] The name shown in the header and on Home is written as
  "Rue Asha" in these frames because it is the repository's author identity.
  No answer establishes what name should appear on the site, and it has not
  been confirmed.
- [assumption] The reader pain carried forward from the intent statement
  remains unconfirmed [upstream]. These frames are laid out from the stated
  capabilities rather than from evidence about what a recruiter or developer
  struggles to find, so the information hierarchy is a reasoned proposal, not
  a validated one.
