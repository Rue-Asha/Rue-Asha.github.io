# Accessibility Checklist — Personal Portfolio & Blog Site

Target: **WCAG 2.1 Level AA**, mandated for every page of this site
(`inception/requirements-analysis/requirements.md` NFR1 and
`aidlc/spaces/default/memory/project.md` § Mandated).

**Read this first: what verifies each item.** The automated accessibility scan
was offered at Practices Discovery and declined
(`inception/practices-discovery/team-practices.md` § Testing Posture). The
manual keyboard walkthrough is the only standing verification this site has.
Every item below therefore names its verifier explicitly, and the items whose
verifier is "design review, by hand, once" are the ones that will silently rot
if nobody does them — the checklist says so rather than implying coverage it
does not have.

## Sources

- [desc] Initial description: "I want to build a Github.io Blog site to present my work and make blog posts about things I currently learning or I find to be interesting. For UX/UI I want you to use Mobbin"
- [scope] Workflow-selected scope: `feature`.
- [upstream] `ideation/rough-mockups/wireframes.md` — the per-frame accessibility notes this checklist consolidates
- [upstream] `ideation/rough-mockups/user-flow.md` — § Keyboard Flow, which fixes the tab order every page is checked against
- [upstream] `inception/requirements-analysis/requirements.md` — NFR1 (the AA bar), NFR2, NFR6, NFR7
- [upstream] `inception/practices-discovery/team-practices.md` — the declined scan and the seven-page-type keyboard walkthrough
- [Q1]–[Q9] `refined-mockups-questions.md`
- [mobbin] Mobbin references listed in `refined-mockups-questions.md` § Mobbin references consulted

---

## 1. Perceivable

| # | Check | Verifier | Status |
|---|---|---|---|
| P1 | Every non-decorative image carries descriptive `alt`; decorative images carry `alt=""` | Author, at write time | Per post |
| P2 | Body text meets 4.5:1 on both surfaces | Design review — **measured**: 15.3:1 shell, 14.2:1 reading | Pass |
| P3 | Muted text (summaries, dates, rail values) meets 4.5:1 — it is normal-size text, so the 3:1 large-text allowance does not apply | Design review — **measured**: 7.4:1 shell, 6.9:1 reading | Pass |
| P4 | Link accent meets 4.5:1 on both surfaces | Design review — **measured**: 9.1:1 shell, 8.5:1 reading | Pass |
| P5 | Focus ring meets 3:1 against its surroundings | Design review — **measured**: 9.1:1 / 8.5:1 | Pass |
| P6 | Every code-theme token colour meets 4.5:1 against `--surface-well` | Design review, by hand, when the theme is chosen | **Open — verify at PU-5** |
| P7 | Nothing conveys meaning by colour alone: the current nav item also carries `aria-current`, outbound links also carry `↗`, code reads correctly in monochrome | Design review | Pass by design |
| P8 | Hairline rules are decorative only — they meet no contrast threshold (1.4:1) and nothing depends on seeing them | Design review | Pass by design |
| P9 | Body text is not pure white, to avoid halation on dark | Design review — `--text` is `#E8E6E1` | Pass |
| P10 | No media: no video, no audio, no autoplay, nothing flashing | Site has none | Not applicable |

**P6 is the one open item on this page, and it is open by construction**: the
syntax theme's colours are chosen during Construction (PU-5), not here. The
constraint is recorded in `interaction-spec.md` § Code Block — at most four token
colours, none of them `--accent`, each ≥4.5:1 on `--surface-well`.

---

## 2. Operable

| # | Check | Verifier | Status |
|---|---|---|---|
| O1 | Every function is reachable by keyboard alone | Keyboard walkthrough, all seven page types | Per page type |
| O2 | The skip-to-content link is the first focusable element and becomes visible on focus | Keyboard walkthrough | Per page type |
| O3 | Tab order follows visual order | Keyboard walkthrough | Per page type |
| O4 | Every focusable element shows a visible focus indicator — 2px accent outline at 2px offset, never `outline: none` | Keyboard walkthrough | Per page type |
| O5 | No element traps focus | Keyboard walkthrough — holds trivially: no modal, dropdown, or other focus-capturing component exists | Pass by design |
| O6 | Hover and focus are visually distinct on list rows, so a keyboard user is not left inferring position from a mouse affordance | Keyboard walkthrough | Pass by design |
| O7 | Touch targets are at least 44×44px at phone width | Design review — list rows compute to ≥56px; see `design-system-mapping.md` § Spacing | Pass |
| O8 | Adjacent targets in a Projects row (title, repository link) are separated by `--space-4` (16px) and take separate focus stops. WCAG's floor is 8px; 16px is this design's committed value and is what a later edit must preserve | Keyboard walkthrough | Pass by design |
| O9 | A horizontally scrollable code block is keyboard-reachable and arrow-scrollable | Keyboard walkthrough on a Post with a wide code block | Per page type |
| O10 | No time limits, no auto-updating content | Site has none | Not applicable |

### The keyboard walkthrough

The verification of the mandated rule, per the affirmed practice. Run it on each
page type **when that page type is built, and again after the visual styling is
applied**. Seven page types: Home, Writing, Post, Projects, Project, About, 404.
About five minutes each.

Expected tab order on every page:

```
Tab 1   -> Skip to content
Tab 2   -> Rue Asha (home link)
Tab 3   -> Writing
Tab 4   -> Projects
Tab 5   -> About
Tab 6+  -> Main content links, in reading order
Last    -> Footer links
```

On each page confirm all four:

- [ ] The skip link is first and becomes visible when focused
- [ ] Tab order matches the visual order
- [ ] Every stop has a visible focus outline
- [ ] No element swallows focus

A page type whose walkthrough has not been done is not finished.

---

## 3. Understandable

| # | Check | Verifier | Status |
|---|---|---|---|
| U1 | `<html lang="en">` is declared on every page | Design review, once | Pass by design |
| U2 | Navigation is identical on every page and in the same position | Design review | Pass by design |
| U3 | Repeated components are identified consistently — the same nav labels, the same "All posts" wording at both ends of a post | Design review | Pass by design |
| U4 | No unexpected context change on focus or input | Site has no inputs and no scripted focus handling | Pass by design |
| U5 | Link text carries its destination; no "click here", no bare "repo" | Design review; `requirements.md` FR3.6 mandates the project-qualified accessible name | Pass by design |
| U6 | The 404 explains what happened in plain language and offers a route onward | Design review | Pass by design |
| U7 | Error identification, form labels, input instructions | No forms exist anywhere on the site | Not applicable |

---

## 4. Robust

| # | Check | Verifier | Status |
|---|---|---|---|
| R1 | Valid, well-formed HTML with correct nesting | Build check | Per build |
| R2 | Exactly one `h1` per page — the page title or post title | Design review per template; **not automatically checked** | **Gap — see below** |
| R3 | Heading levels never skip; body headings start at `h2` | Author at write time; **not automatically checked** | **Gap — see below** |
| R4 | Landmarks present and unique: one `banner`, one `nav`, one `main`, one `contentinfo` | Design review per template | Pass by design |
| R5 | Native elements preferred over ARIA: links are `<a>`, the rail is a `<dl>`, code is `<pre><code>`, lists are `<ul>`/`<li>` | Design review | Pass by design |
| R6 | ARIA used only where native HTML cannot express it — `aria-current` on the active nav link, `aria-label` on outbound links | Design review | Pass by design |
| R7 | `<time datetime>` on every displayed date, so the date is unambiguous to assistive technology | Design review per template | Pass by design |

---

## What nothing checks, stated honestly

This is the cost of declining the automated scan, carried forward from
`team-practices.md` § Testing Posture and made concrete against this design.

| Unchecked | Why it matters here | Mitigation, such as it is |
|---|---|---|
| Heading order and level-skipping (R2, R3) | A post body is author-written Markdown; a `###` used where `##` belongs produces a skipped level and nothing says so | Author habit, plus one design-review pass per template |
| One `h1` per page | Two `h1`s is a plausible template slip, invisible to a sighted reader | Design review per template |
| Image alt text (P1) | Written per post, forever; the build does not require it | Author habit |
| Link accessible names (U5) | The mandated project-qualified names are a template concern, checked once; a new link type added later is not | Design review when a template changes |
| Colour contrast (P2–P6) | Measured once, here. Any later change to a colour value silently re-opens it | This document's measured table is the record; changing a token means re-deriving it |
| Landmark structure (R4) | Checked once per template, never again | Design review when a template changes |

**A regression in any of these is invisible until a reader hits it.** That is
the accepted trade, not an argument to revisit it — but it is why the measured
contrast table in this document and in `design-system-mapping.md` is written
down rather than assumed, and why P6 is flagged as open rather than quietly
inherited.

---

## Testing approach for this site

The general five-step approach in the design knowledge base assumes an automated
scanner as step 1. This site has none, so the approach is:

1. **Keyboard testing** — the walkthrough above, per page type, twice (at build
   and after styling). This is the standing verification.
2. **Zoom testing** — verify at 200% browser zoom that the reading column, the
   list rows, and the project rail all reflow without clipping or horizontal
   page scroll. Once per page type, alongside the second walkthrough.
3. **Screen reader spot-check** — one pass over a Post and a Project with
   VoiceOver or NVDA, confirming the rail is announced as label/value pairs, the
   list is announced as a list, and outbound links announce their project.
4. **Monochrome check** — view one page of each register with colour removed and
   confirm nothing became ambiguous. This is the cheap substitute for the
   colour-blindness simulation a scanner would have run.
