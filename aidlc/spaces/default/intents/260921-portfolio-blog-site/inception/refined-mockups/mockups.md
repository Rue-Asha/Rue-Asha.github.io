# Refined Mockups — Personal Portfolio & Blog Site

Mid-to-high fidelity. The frames below are the rough wireframes with the visual
direction applied: every one is annotated with the tokens from
`design-system-mapping.md` rather than described in adjectives.

**What changed from the rough wireframes, and what did not.** The layouts,
the page inventory, the global shell, the metadata rail, the two-ends "All
posts" link, and the five screen states are unchanged — Ideation carried only
the *visual style* into this stage as a directive, and reopening the layouts was
explicitly out of its scope. What is new is colour, type, spacing, and the two
registers.

## Sources

- [desc] Initial description: "I want to build a Github.io Blog site to present my work and make blog posts about things I currently learning or I find to be interesting. For UX/UI I want you to use Mobbin"
- [scope] Workflow-selected scope: `feature`.
- [upstream] `ideation/rough-mockups/wireframes.md` — the frames, the responsive table, and the accessibility notes these mockups dress
- [upstream] `ideation/rough-mockups/user-flow.md` — the four flows and the keyboard flow every frame must still support
- [upstream] `inception/requirements-analysis/requirements.md` — FR2 to FR5 (what each page must carry) and NFR1 to NFR8 (how it must behave)
- [upstream] `inception/practices-discovery/team-practices.md` — the keyboard walkthrough that verifies these frames, and the declined automated scan
- [Q1]–[Q9] `refined-mockups-questions.md`
- [mobbin] Mobbin references listed in `refined-mockups-questions.md` § Mobbin references consulted

---

## The Two Registers

Everything below is one of two things, and knowing which resolves most detail
questions without asking.

| | Editorial register | Technical register |
|---|---|---|
| Where | Post, Project | Home, Writing, Projects, About, 404, and the shell on every page |
| Surface | `--surface-reading` `#17181B` | `--surface-shell` `#0F1012` |
| Titles | Serif 600 | Sans 600 |
| Body | Sans 17px / 1.7 | Sans 16px / 1.5 |
| Spacing | Generous — 48px sections, 24px paragraphs | Compact — 16px row padding, hairline rules |
| Feel | A sheet you read on | A spec sheet you scan |

The registers share one palette, one accent, one focus ring, one hairline. They
differ in surface, in title face, and in air. That is deliberately the smallest
set of differences that reads as two registers — any more and the site reads as
two sites [Q1].

---

## Global Shell

Present on every page, in the technical register regardless of which register
the page body uses.

```
+--------------------------------------------------------------+
|  [skip to content]                                           |  <- visible only on focus
|                                                              |
|  Rue Asha                       Writing   Projects   About   |  <- header
|  ------------------------------------------------------------|  <- --rule hairline
|                                                              |
|                      [ page content ]                        |  <- main
|                                                              |
|  ------------------------------------------------------------|
|  (c) 2026   ·   GitHub   ·   email                           |  <- footer
+--------------------------------------------------------------+
```

<!-- Text fallback: a full-width bar holding the name on the left and three
navigation links on the right, separated from the page content by a hairline
rule; the page content sits below; a second hairline separates a footer holding
a copyright line and two links. A skip-to-content link sits above everything and
is invisible until it receives keyboard focus. -->

| Element | Treatment |
|---|---|
| Skip link | Off-screen until focused; on focus it appears at the top-left on `--surface-shell` with the `--focus-ring`, sans 14px, `--text` |
| Name "Rue Asha" | Sans 600 16px, `--text`, links to Home. Plain text, not a wordmark — nothing here is a logo |
| Nav links | Sans 400 15px, `--text-muted`; the current page is `--text` with a 1px `--accent` underline offset 4px |
| Header rule | `--border-hairline` full width |
| Footer | Mono 13px `--text-muted`; links take `--accent` on hover and focus, underlined always |
| Padding | `--space-5` (24px) vertical, page margin horizontal |

**Accessibility.** `<header>` holds a `<nav>`; `<main>` wraps the content;
`<footer>` is `contentinfo`. The skip link is the first focusable element on
every page. The current page is marked by `aria-current="page"` as well as by
the accent underline, so the marking is not colour-only.

---

## Home — technical register

Both halves on one page, structurally equal, as the wireframes required.

```
+--------------------------------------------------------------+
|  Rue Asha                       Writing   Projects   About   |
|  ------------------------------------------------------------|
|                                                              |
|   Rue Asha                                serif 40 / h1      |
|   One or two sentences: what I do and what I write about.    |
|   sans 17 muted                                              |
|   GitHub  ·  email                             mono 13       |
|                                                              |
|   ------------------------------------------------------     |
|                                                              |
|   Writing                              All posts    h2 / mono|
|   ------------------------------------------------------     |
|   Post title one                            12 MAR 2026      |
|   One line about what this post is.                          |
|   ------------------------------------------------------     |
|   Post title two                            28 FEB 2026      |
|   One line about what this post is.                          |
|                                                              |
|   ------------------------------------------------------     |
|                                                              |
|   Projects                          All projects    h2 / mono|
|   ------------------------------------------------------     |
|   Project name                                               |
|   One line about what it does.                               |
|   TypeScript · Postgres                      repo →          |
|   ------------------------------------------------------     |
|   Project name                                               |
|   One line about what it does.                               |
|   Go · Docker                                repo →          |
|                                                              |
|  ------------------------------------------------------------|
|  (c) 2026   ·   GitHub   ·   email                           |
+--------------------------------------------------------------+
```

<!-- Text fallback: the name as a large serif heading, a one-or-two-sentence
intro in muted sans, and two small links. A hairline separates that from a
Writing section: a heading with an "All posts" link at the right, then post rows
each showing a title, a date, and a one-line summary, separated by hairlines. A
second hairline separates an identical Projects section whose rows show a name,
a one-line summary, a tools list, and a repository link. -->

**The one place the serif appears in the technical register** is the `h1` — the
name. It is the site's signature and the only editorial note on an otherwise
structural page. Everything below it is sans and mono.

**Equal weight is carried structurally**, as the wireframes specified and this
styling must not undo: "Writing" and "Projects" use the same `--type-section`,
the same hairline treatment, the same `--type-meta` "All X" affordance, the same
row rhythm. Neither section gets a larger face, an image, or a colour the other
lacks.

**Empty state (both sections empty — launch-day worst case).** Each section
keeps its heading and rule, and shows one muted sentence in place of rows:
"Nothing published yet." for Writing, "Nothing here yet." for Projects, each
followed by a link to the other section. The page must not look broken with zero
of both (`requirements.md` FR4.6).

---

## Writing — technical register

```
+--------------------------------------------------------------+
|  Rue Asha                       Writing   Projects   About   |
|  ------------------------------------------------------------|
|                                                              |
|   Writing                                sans 28 / h1        |
|                                                              |
|   ------------------------------------------------------     |
|   Post title one                            12 MAR 2026      |
|   One line about what this post is.                          |
|   ------------------------------------------------------     |
|   Post title two                            28 FEB 2026      |
|   One line about what this post is.                          |
|   ------------------------------------------------------     |
|   Post title three                          04 FEB 2026      |
|   One line about what this post is.                          |
|   ------------------------------------------------------     |
|                                                              |
|  ------------------------------------------------------------|
```

<!-- Text fallback: the word Writing as a sans page heading, then a list of post
rows separated by hairline rules; each row carries a title on the left, a date on
the right in monospace, and a one-line summary beneath the title. -->

| Element | Treatment |
|---|---|
| Row | Whole row is one link (`requirements.md` FR2.3). `--space-4` vertical padding, `--border-hairline` beneath |
| Title | `--type-list`, sans 600, `--text` |
| Date | `--type-meta`, mono, `--text-muted`, right-aligned, uppercase month, in a `<time datetime>` element |
| Summary | `--type-summary`, muted, on its own line beneath the title |
| Hover | Row background lifts to `--surface-reading` — the same one step a reading page is lifted, so the affordance means "this leads to a page" |
| Focus | `--focus-ring` on the row, drawn outside the row's bounds by the 2px offset so it is never clipped by the hairline |

Hover and focus are deliberately different [Q6]: the tint is a mouse affordance,
the ring is a keyboard position, and a keyboard user who sees only a tint has to
guess where they are.

**Empty state.** Heading, then "Nothing published yet." in `--text-muted`, then
a link to Projects. No bare heading over nothing.

---

## Post — editorial register

The page the site exists for. Surface lifts, serif arrives, air opens.

```
+--------------------------------------------------------------+
|  Rue Asha                       Writing   Projects   About   |   shell
|  ------------------------------------------------------------|
|                                                              |   #17181B
|          ← ALL POSTS                            mono 13      |
|                                                              |
|          Post title                       serif 40 / h1      |
|          One line about what this post is.  sans 17 muted    |
|          12 MARCH 2026                          mono 13      |
|          --------------------------------      hairline      |
|                                                              |
|          Body text in a single narrow column, capped at      |
|          66ch, sans 17 on 1.7 leading, so the measure        |
|          stays comfortable on a wide screen.                 |
|                                                              |
|          A heading inside the post        serif 26 / h2      |
|                                                              |
|          More body text.                                     |
|                                                              |
|          +--------------------------------+                  |
|          |  code block, mono 14           |   recessed well  |
|          |  #0F1012, 1px rule, 4px radius |                  |
|          +--------------------------------+                  |
|                                                              |
|          --------------------------------                    |
|          ← ALL POSTS                                         |
|                                                              |
|  ------------------------------------------------------------|
```

<!-- Text fallback: a back-link reading "All posts" sits above a large serif
post title, a muted one-line summary, and a date in monospace, separated from the
body by a hairline. The body is a single narrow column of text containing serif
subheadings and recessed code blocks. A hairline and a second "All posts"
back-link close the page. -->

| Element | Treatment |
|---|---|
| Page surface | `--surface-reading`, the lifted step [Q8] |
| Title | `--type-post-title`, serif 600, `--text` |
| Dek | `--type-reading`, `--text-muted` |
| Date | `--type-meta`, mono, muted, `<time datetime>`, full month name |
| Title rule | `--border-hairline` beneath the title block, `--space-6` below it |
| Body | `--type-reading`, max 66ch, paragraphs `--space-5` apart |
| Body headings | serif 600, never skipping a level, `--space-7` above and `--space-4` below |
| Links in body | `--accent`, underlined with a 2px offset so descenders stay legible |
| Code block | `--surface-well`, `--border-hairline`, `--radius`, `--type-code`, overflow scrolls horizontally and is keyboard-reachable |
| Images | Full column width, `--radius`, alt text mandatory |
| "All posts" | `--type-meta`, mono, uppercase, `--accent` on hover and focus, at both top and end (`requirements.md` FR2.8) |

**Partial state.** A very long title wraps rather than truncates — the serif is
set with `text-wrap: balance` where supported, and nothing depends on a fixed
title height.

---

## Projects — technical register

```
+--------------------------------------------------------------+
|   Projects                               sans 28 / h1        |
|                                                              |
|   ------------------------------------------------------     |
|   Project name                                               |
|   One or two lines about what it does and why it exists.     |
|   TYPESCRIPT · POSTGRES · DOCKER            repo ↗           |
|   ------------------------------------------------------     |
|   Project name                                               |
|   One or two lines about what it does and why it exists.     |
|   GO · SQLITE                               repo ↗           |
|   ------------------------------------------------------     |
```

<!-- Text fallback: the word Projects as a sans page heading, then rows separated
by hairlines; each row carries a project name, a one-or-two-line summary, a list
of tools in monospace, and a repository link at the right marked as outbound. -->

**Two link targets per row, and they must not be confusable**
(`requirements.md` FR3.5). The project name occupies the row's main hit area and
leads to the project page; the repository link sits in its own right-hand cell
with `--space-4` of clear space around it, carries the `↗` outbound mark, and is
the only place in the row where the accent appears. Their focus rings are drawn
separately, so tabbing through a row visibly stops twice.

The repository link's accessible name is "Repository for `<project name>`", not
"repo" (`requirements.md` FR3.6) — a screen reader user navigating by link list
otherwise gets a column of identical entries.

**Tools** are `--type-meta` mono, uppercase, separated by a middle dot. This is
the technical register at its most literal, and it is the one place monospace
does structural rather than decorative work in a list.

---

## Project — editorial register with a technical rail

The one frame where both registers appear at once, which is the whole reason the
direction was chosen.

```
+--------------------------------------------------------------+
|  ← ALL PROJECTS                                              |
|                                                              |
|  +---------------+   Project name              serif 40 / h1 |
|  | YEAR          |   One or two lines about what it does.    |
|  | 2026          |                                           |
|  | TYPE          |   ------------------------------------    |
|  | CLI           |                                           |
|  | TOOLS         |   Whatever depth the write-up needs:      |
|  | TypeScript    |   what the problem was, how it works,     |
|  | Postgres      |   what went wrong, what you would do      |
|  | REPO          |   differently.                            |
|  | github ↗      |                                           |
|  | LIVE          |   A heading inside the write-up   serif 26|
|  | site ↗        |                                           |
|  +---------------+   More prose, code blocks, screenshots.   |
|      (rail)                                                  |
|                                                              |
|  ------------------------------------------------------      |
|  ← ALL PROJECTS                                              |
+--------------------------------------------------------------+
```

<!-- Text fallback: a back-link reading "All projects" above a two-column layout.
The left column is a narrow rail listing label-and-value pairs for year, type,
tools, repository, and live URL. The right column holds the project name as a
large serif heading, a short summary, a hairline, and then the write-up with
serif subheadings. A hairline and a second "All projects" link close the page. -->

| Element | Treatment |
|---|---|
| Page surface | `--surface-reading` |
| Rail | `<dl>`, 200px wide, `--space-5` from the body, no background or border — separated by space alone, so it does not become a card |
| Rail labels | `--type-rail-label`, mono, uppercase, letterspaced, muted |
| Rail values | `--type-rail-value`, sans, `--text` |
| Rail links | `--accent`, `↗` outbound mark, accessible names "Repository for `<project>`" and "Live site for `<project>`" |
| Body | As the Post body — same measure, same headings, same code wells |

**The rail is space-separated, not boxed.** A bordered or tinted rail would
introduce a third surface and, with it, a third column in the contrast table for
no gain. Space does the separating; the mono labels do the signalling.

**A project with no live URL omits that rail row entirely** — no empty label, no
dash (`requirements.md` FR3.4). The rail simply has one fewer pair.

**Long write-up variant.** The wireframes noted that a contents rail could be
added beneath the metadata when a write-up runs long. It is not built at launch
and nothing here depends on it; the rail's `<dl>` sits in a container that can
take a sibling list later without the layout being redrawn.

---

## About — technical register

```
+--------------------------------------------------------------+
|          About                             sans 28 / h1      |
|                                                              |
|          A few paragraphs: who you are, what you             |
|          work on, what you are currently learning.           |
|                                                              |
|          Elsewhere                         sans 18 / h2      |
|          GitHub  ·  email  ·  other profiles                 |
|                                                              |
+--------------------------------------------------------------+
```

<!-- Text fallback: the word About as a sans page heading, a few paragraphs of
prose, then a subheading reading Elsewhere followed by a row of links. -->

About is **its own page at `/about`**, settled at Requirements Analysis from the
approved scope boundary (`requirements.md` FR4.1) — this closes the wireframes'
internal contradiction, which drew About both inline with Home and as its own
frame.

It sits in the technical register rather than the editorial one. It is short,
it is scanned rather than read, and the links are the point. Body text uses
`--type-reading` at the reading measure so the prose is still comfortable, but
the surface stays `--surface-shell`.

Links carry their destination in the link text, not in surrounding prose.

---

## 404 — technical register

```
+--------------------------------------------------------------+
|  Rue Asha                       Writing   Projects   About   |
|  ------------------------------------------------------------|
|                                                              |
|          Not found                         sans 28 / h1      |
|                                                              |
|          That page does not exist.         sans 17 muted     |
|                                                              |
|          Writing  ·  Projects                                |
|                                                              |
|  ------------------------------------------------------------|
|  (c) 2026   ·   GitHub   ·   email                           |
+--------------------------------------------------------------+
```

<!-- Text fallback: the full site shell around a page heading reading Not found,
a single muted sentence, and two links to Writing and Projects. -->

Carries the full shell, one plain sentence, and routes to both sections
(`requirements.md` FR4.4). No illustration, no oversized numeral — the site has
no decorative vocabulary and inventing one here would be the only place it
appears.

---

## Screen States

Carried from the wireframes, now with treatments. The five-state rule is
satisfied and the inapplicable state is still marked rather than invented.

| State | Where | Treatment |
|---|---|---|
| Empty | Writing, Projects, Home sections | Heading and rule retained; one muted sentence; a link to the other section |
| Loading | **Not applicable** | Pages are served complete (`requirements.md` NFR2). There is no fetch to show progress for, and no skeleton tokens exist in the system |
| Populated | Every page | The frames above |
| Error | 404 only | The frame above |
| Partial | Post and Project bodies, list rows | Long titles wrap rather than truncate; a project with no live URL omits that rail row; a list with one entry still shows its hairlines and reads as a list |

---

## Responsive

The desktop layout is the resolved one; the phone layout is its contraction
(`requirements.md` NFR6). One breakpoint does the work.

| Page | Desktop (≥720px) | Phone (<720px) |
|---|---|---|
| Shell | Name left, three links right, one row | Same, wrapping to a second row if the width demands it; no hamburger at three links |
| Home | Single column, container capped at 1100px | Same structure, page margin `--space-4` |
| Writing / Projects | Title and date on one row, summary beneath | Date moves beneath the title; the whole row remains one hit target |
| Post | 66ch column centred in the page | Column fills the width inside the page margin |
| Project | Rail beside the body | Rail stacks above the body, labels and values on one line each |
| Type | Scale above | `--type-post-title` drops to 32px; everything else unchanged |

The breakpoint is at **720px** because that is where the 66ch reading column plus
its page margins stops fitting — content dictating the breakpoint rather than a
device name. It is the only one required; a second at 1100px is simply the
container cap and changes no layout.

**Touch targets.** Every list row clears 44px at phone width with room
(`requirements.md` NFR7): 16px padding top and bottom around a 24px title line
is 56px before the summary line is counted. The compact scale may not be
tightened past this.
