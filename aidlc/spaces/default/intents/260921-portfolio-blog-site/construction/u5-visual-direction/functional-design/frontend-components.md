# Frontend Components — U5 Visual Direction

This unit adds **no template and no component**. It adds one stylesheet, one font
file, and two head elements, and it changes how every template already emitted by
the other units looks. That is what this file records: what U5 touches, what it
must not touch, and what each earlier unit's markup has to keep providing for the
styling to work.

## Sources

- [upstream] `inception/units-generation/unit-of-work.md` § U5 — the boundary and
  its four constraints, including that nothing is fetched from another server
- [upstream] `inception/units-generation/unit-of-work-story-map.md` § U5 — the
  five non-functional requirements this unit carries, and the absence of any
  functional one
- [upstream] `inception/requirements-analysis/requirements.md` — NFR1, NFR3,
  NFR4, NFR5, NFR6, NFR7
- [upstream] `inception/domain-design/components.md` — `PageRenderer`, which owns
  the markup styled here and the head the font is preloaded in
- [upstream] `inception/refined-mockups/design-system-mapping.md` — the token set
- [upstream] `inception/refined-mockups/mockups.md` — the two registers
- [upstream] `inception/refined-mockups/interaction-spec.md` — per-element states
- [upstream] `construction/u1-publishable-site-shell/functional-design/frontend-components.md`
  — the shell and the seven page templates this unit styles
- [Q1]–[Q3] `functional-design-questions.md`

The declared `contract-summary` input is absent: Contract Design is SKIP in this
scope.

---

## What this unit adds

```
<head>                              (owned by PageRenderer, extended here)
 +- <link rel="preload" as="font">  the self-hosted variable font
 +- <link rel="stylesheet">         the one stylesheet, same origin

repository
 +- the variable font file          Latin subset, copied in, never fetched
 +- the one stylesheet              tokens, base, register rules, responsive
```

Three additions and no fourth. In particular: no icon font, no icon sprite, no
second stylesheet, no inline `<style>` block, and no script of any kind.

---

## The stylesheet's internal shape

Not a component tree — a rule set, in this order:

| Section | Contents |
|---|---|
| Tokens | Every value from `design-system-mapping.md`, declared once in one root block |
| Base | Document, typography defaults, the focus ring, link treatment |
| Shell | Header, navigation, current-page marking, footer, skip link |
| Rows | List rows, their hairlines, and the single hover transition |
| Reading | The editorial register's measure, headings, code blocks, rail |
| Targets | The minimum-target rule for standalone links, below the breakpoint (BR11.1) |
| Responsive | The single breakpoint and the phone contraction |
| Preferences | The reduced-motion rule that sets the transition to `none` |

**The register is one class on the page root** (BR11.3). The Reading section's
rules are scoped by it; everything else applies regardless. There is no second
file and no parallel rule set — the register is the smallest set of differences
that reads as two registers rather than two sites.

---

## What each earlier unit must keep providing

This unit styles markup it does not own. Five contracts the page templates must
keep, stated so a later change to them is visibly a change to this unit too:

| Provided by | What U5 depends on |
|---|---|
| U1 shell | The skip link is the first focusable element, in document order (BR5.2). U5 supplies its visible-on-focus treatment but cannot supply the link or its position. |
| U1 shell | The current page carries `aria-current="page"` as well as any visual mark, so the accent underline is an addition rather than the only signal. |
| U2 rows | Each Writing row is a single element, so one hover transition and one 44px target apply to the whole row. |
| U3 rows | Each Projects row carries two separate target elements **by design, at every width** (U3 BR9.2) — not as a contraction artefact. Below the breakpoint the outbound one takes the standalone-link rule (BR11.1), and the clear space the interaction spec sizes between the two is measured between their enlarged hit areas rather than their text — so the row grows taller and the anti-mis-hit gap is preserved rather than consumed. BR11.6's "a row does not gain a hit target on contraction" clause is scoped so it does not reach these rows; it must never be read as instructing anyone to merge or remove the outbound link's target. |
| U2 code blocks | At most four token classes, none reusing the link accent. U5 colours those classes; it cannot add a fifth. |
| U3 rail | The rail is a sibling of the body, so the phone layout stacks it with one rule rather than restructuring. |

**If any of those changes, this unit's styling is what breaks**, and nothing
automated will say so — the three blocking checks cover the build, page coverage
and internal links, none of which notices a focus ring that stopped applying.

---

## What this unit must not do

Written as prohibitions because each one is a plausible, tempting move:

- **No inline style, anywhere.** U1's policy is `style-src 'self'` with no
  `'unsafe-inline'`; an inline style attribute breaks the page visibly. That is
  the intended behaviour, not a problem to work around by loosening the policy.
- **No third-party request.** No web font service, no icon set, no CDN
  stylesheet, no `@import` of an off-origin URL (BR11.4). This is the unit where
  that rule is most likely to be broken, because adding a font is the usual way
  a third-party request enters a site.
- **No scripted behaviour.** U1's policy forbids executable page code outright.
  Nothing this unit needs is scripted: there is no theme switch, no menu toggle,
  and no motion beyond the one declarative transition the design system already
  defines.
- **No numeric performance budget.** NFR5 forbids introducing one without a new
  decision, and a font is exactly where one usually appears.
- **No new markup.** If the styling needs a wrapper the templates do not emit,
  that is a change to the owning unit's template, agreed as such — not an element
  smuggled in from the stylesheet side.

---

## Interaction flows

U5 introduces no flow. It gives existing flows their visible states, all already
specified per element in `interaction-spec.md`:

| Element | States this unit renders |
|---|---|
| Skip link | Hidden until focused, visible on focus |
| Navigation link | Default, current page, focus |
| List row | Default, hover (the one transition), focus |
| Outbound link | Default, hover, focus, with the outbound affordance |
| Code block | One static state, four token colours, hairline outline, 4px radius |
| Every focusable element | The focus ring, no exceptions |

---

## Form validation

**Not applicable.** This site has no forms, and this unit adds none — the design
system deliberately contains no form tokens
(`design-system-mapping.md` § What this system does not contain).

## API integration points

**None.** The stylesheet and font are static files served from this site's own
origin. Nothing is fetched at build time or at page load from anywhere else.

---

## The walkthrough this unit triggers

`team-practices.md` makes the keyboard walkthrough the verification of the
mandated WCAG rule, and requires it to run on each page type **when that page
type is built, and again after the visual styling is applied**. This unit is the
trigger for the second run, across all seven page types — Home, Writing, Post,
Projects, Project, About, 404.

On each, confirm: the skip link is first and becomes visible on focus, tab order
matches the visual order, every stop has a visible focus outline, and no element
swallows focus. Around five minutes each.

**Tab order is the condition this unit uniquely threatens.** Every other unit
emits markup in document order and gets tab order for free; a stylesheet can move
an element visually without touching its position in the document. This is the
first point in the project where visual order and tab order can diverge, and the
walkthrough is what catches it.
