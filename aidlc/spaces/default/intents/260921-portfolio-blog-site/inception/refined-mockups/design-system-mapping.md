# Design System Mapping — Personal Portfolio & Blog Site

There is no existing design system or component library to map onto. This
project is greenfield, no language or framework has been chosen
(`<record>/aidlc-state.md` → Languages, Frameworks, Build System all `Unknown`),
and adopting a third-party system would violate the rule that no page may fetch
anything from another server. **So this document is the system**: the tokens
below are the complete vocabulary every other artifact in this stage refers to,
and Construction implements them directly.

Every value is a proposal grounded in the answers, not a discovered fact. They
are adjustable at the approval gate; what is not adjustable is the set of
obligations each one carries, which is stated alongside it.

## Sources

- [desc] Initial description: "I want to build a Github.io Blog site to present my work and make blog posts about things I currently learning or I find to be interesting. For UX/UI I want you to use Mobbin"
- [scope] Workflow-selected scope: `feature`.
- [upstream] `ideation/rough-mockups/wireframes.md` — the frames and accessibility notes these tokens dress
- [upstream] `ideation/rough-mockups/user-flow.md` — the keyboard flow the focus token must satisfy
- [upstream] `inception/requirements-analysis/requirements.md` — NFR1 (WCAG keyboard/landmark), NFR3 and NFR4 (no third-party resources, CSP), NFR7 (44px touch targets), FR2.7 (build-time code colouring)
- [upstream] `inception/practices-discovery/team-practices.md` — the declined automated scan, which makes every contrast figure below a hand-checked obligation
- [Q1]–[Q9] `refined-mockups-questions.md`
- [mobbin] Mobbin references listed in `refined-mockups-questions.md` § Mobbin references consulted

---

## Colour

Dark only [Q3]. One palette, no light variant, no toggle, no
`prefers-color-scheme` branch — and therefore no JavaScript anywhere on the
site.

### Surfaces

| Token | Value | Where |
|---|---|---|
| `--surface-shell` | `#0F1012` | Header, footer, Home, Writing, Projects, About, 404 |
| `--surface-reading` | `#17181B` | Post and Project pages — the lifted step that carries the editorial register [Q8] |
| `--surface-well` | `#0F1012` | Code blocks inside a reading page: recessed one step, back to the shell value |
| `--rule` | `#2A2C31` | Hairlines between list rows, under title blocks, around code blocks |

The lift between shell and reading is deliberately small. It is meant to read as
paper on a desk, not as a card floating on a page; a larger step would turn the
editorial register into a component.

### Ink

| Token | Value | Use |
|---|---|---|
| `--text` | `#E8E6E1` | Body text, titles, headings |
| `--text-muted` | `#A3A199` | One-line summaries, dates, rail values, footer |
| `--accent` | `#E3A857` | Links and the focus ring, and nothing else [Q4] |

`--text` is deliberately **not** pure white. On a dark background, `#FFFFFF`
body text haloes — the strokes appear to bleed into the background and the text
becomes tiring over a long read, which is exactly this site's main job. The warm
cast also keeps the editorial register from reading as cold.

### Measured contrast

Computed against both surfaces, because the lifted reading surface doubles every
check [Q8]. WCAG 2.1 AA needs 4.5:1 for normal text, 3:1 for large text and for
UI components.

| Pair | On `--surface-shell` | On `--surface-reading` | Needs | Verdict |
|---|---|---|---|---|
| `--text` | 15.3:1 | 14.2:1 | 4.5:1 | Pass |
| `--text-muted` | 7.4:1 | 6.9:1 | 4.5:1 | Pass |
| `--accent` | 9.1:1 | 8.5:1 | 4.5:1 (links) | Pass |
| `--accent` as focus ring | 9.1:1 | 8.5:1 | 3:1 | Pass |
| `--rule` | 1.4:1 | 1.3:1 | none | Decorative only — see below |

`--rule` does not meet any contrast threshold and must never be the only thing
conveying a boundary. It separates rows that are already separated by spacing
and by the row's own hover and focus states; remove it and nothing becomes
ambiguous. This is the "never use colour alone" rule applied honestly rather
than by assertion.

`--text-muted` is used at 13px and 14px in places. Those sizes are normal text,
not large text, so the 4.5:1 threshold applies and 6.9:1 clears it with room. A
paler muted grey would not — this is why the token is `#A3A199` and not
something softer.

**These figures are the whole verification.** The automated accessibility scan
was offered at Practices Discovery and declined, so nothing re-checks them after
this document. Any later change to a colour value re-opens this table by hand.

---

## Type

Editorial register for reading, technical register for structure [Q1]. Exactly
one self-hosted family — the serif [Q2], [Q9].

### Families

| Role | Family | Source | Why |
|---|---|---|---|
| Display / editorial | **Source Serif 4** (variable, weights 400 and 600, Latin subset) | Self-hosted from this repository, SIL Open Font License | Sturdy, moderate stroke contrast, designed for screen text as well as display |
| Body, lists, shell | System sans stack | Reader's OS, zero bytes | `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` |
| Metadata, code | System monospace stack | Reader's OS, zero bytes | `ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace` |

**Why a sturdy serif rather than an elegant one.** Fine-stroke display serifs —
the Didone family, Playfair and its relatives — shimmer and thin out against a
dark background, because the hairlines fall below the rendering weight the
screen can hold. On a dark-only site that is a selection criterion, not a
preference. Source Serif 4, Newsreader, and Literata all satisfy it; Source
Serif 4 is the proposal because its variable file covers both weights needed.

**Cost, stated plainly.** One variable font file, Latin subset, roughly 45–70 KB
in this repository, `font-display: swap`, preloaded in the page head. Two weights
only. Body text and code look different on macOS, Windows, and Android, which is
the accepted trade of the hybrid answer [Q2].

### Scale

Desktop values. Phone values in `interaction-spec.md` § Responsive.

| Token | Value | Family | Where |
|---|---|---|---|
| `--type-post-title` | 40px / 1.2 | serif 600 | Post and Project `h1` |
| `--type-page-title` | 28px / 1.25 | sans 600 | Writing, Projects, About, 404 `h1` |
| `--type-body-heading` | 26px / 1.3 | serif 600 | `h2` inside a post or project body |
| `--type-body-subheading` | 20px / 1.35 | serif 600 | `h3` inside a body |
| `--type-reading` | 17px / 1.7 | sans 400 | Post and Project body text |
| `--type-list` | 16px / 1.5 | sans 400 | List row titles, Home section entries |
| `--type-summary` | 16px / 1.5 | sans 400, muted | One-line summaries |
| `--type-section` | 18px / 1.3 | sans 600 | "Writing" / "Projects" `h2` on Home |
| `--type-meta` | 13px / 1.4, +0.02em | mono 400, muted | Dates, tools, years, "All posts" |
| `--type-rail-label` | 12px / 1.4, +0.06em, uppercase | mono 400, muted | Project rail labels |
| `--type-rail-value` | 14px / 1.5 | sans 400 | Project rail values |
| `--type-code` | 14px / 1.6 | mono 400 | Code blocks and inline code |

**The register split is carried here.** Serif appears only on reading pages and
on titles; every list, every label, and the whole shell is sans and mono. That
is what keeps two registers from becoming two sites [Q1].

### Measure

Reading column is capped at **66ch** (roughly 660–700px at 17px). The page
container caps at **1100px**. On a phone the reading column simply fills the
width inside the page margin.

---

## Spacing

Two scales [Q5], drawn from one set of steps.

`--space-1: 4px` · `--space-2: 8px` · `--space-3: 12px` · `--space-4: 16px` ·
`--space-5: 24px` · `--space-6: 32px` · `--space-7: 48px` · `--space-8: 64px` ·
`--space-9: 96px`

| Context | Rule |
|---|---|
| Reading — between sections | `--space-7` (48px) |
| Reading — between paragraphs | `--space-5` (24px) |
| Reading — title block to body | `--space-6` (32px) |
| Reading — around a code block | `--space-5` (24px) |
| Lists — row padding, vertical | `--space-4` (16px) |
| Lists — between rows | `0`, separated by `--rule` |
| Lists — between sections on Home | `--space-6` (32px) |
| Shell — header and footer padding | `--space-5` (24px) |
| Page margin, phone | `--space-4` (16px) |

**Compact has a floor and it is not negotiable.** A list row at phone width must
remain at or above the 44px touch target (`requirements.md` NFR7). With 16px
vertical padding on each side plus a 24px title line, the row is 56px before its
summary line — so the floor holds with room. It is written down because a later
"tighten the lists" instinct would otherwise silently break a requirement.

---

## Borders, radius, and motion

| Token | Value | Note |
|---|---|---|
| `--border-hairline` | `1px solid var(--rule)` | Row separators, code block outline, title-block underline |
| `--radius` | `4px` | Code blocks only. Nothing else is rounded — the editorial register does not use cards |
| `--focus-ring` | `2px solid var(--accent)`, `outline-offset: 2px` | Every focusable element, no exceptions |
| `--transition` | `background-color 120ms ease-out` | Row hover only |

Motion is almost absent by design. The one transition is under the 300ms
guidance and is a background fade, which does not move anything. The site has no
modals, dropdowns, carousels, or entrance animations, so there is nothing for a
`prefers-reduced-motion` rule to disable — it is still declared, and it sets the
transition to `none`, because that costs two lines and removes the question.

---

## What this system does not contain

Stated so Construction does not look for it: no button component (the site has
no buttons — every interactive element is a link), no form tokens (no inputs
anywhere), no modal or overlay tokens, no toast or alert tokens, no loading or
skeleton tokens (pages are served complete, `requirements.md` NFR2), no light
palette, and no theme-switching mechanism. Each absence traces to a decision
already made rather than to an oversight.
