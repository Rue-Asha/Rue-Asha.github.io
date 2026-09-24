# Functional Design Questions — U5 Visual Direction

Three questions. U5 is a `ui` unit, so it produces the behavioural specification,
its traceability, and its component breakdown. Almost every visual decision this
unit implements was already made at Refined Mockups; the questions below are the
three places where applying those decisions to real pages needs something the
design artifacts do not state.

## What was subtracted, and what settled it

| Topic | Settled by |
|---|---|
| Every colour token, and the surfaces and ink they apply to | `inception/refined-mockups/design-system-mapping.md` § Colour |
| Measured contrast figures for every pairing | Same, § Measured contrast — and any colour change re-opens that table by hand |
| The two type families, the scale, and the measure | Same, § Type |
| The spacing scales | Same, § Spacing |
| The hairline border, the 4px radius on code blocks only, and the focus ring | Same, § Borders, radius, and motion |
| One transition — a 120ms background fade on row hover — and a `prefers-reduced-motion` rule setting it to `none` | Same |
| That there is **no light palette and no theme-switching mechanism** | Same, § What this system does not contain |
| That there are no button, form, modal, toast or loading tokens | Same |
| The two registers — editorial on Post and Project, technical elsewhere | `inception/refined-mockups/mockups.md` § The Two Registers |
| Per-element interaction states, content and accessibility behaviour | `inception/refined-mockups/interaction-spec.md` |
| That fonts, icons, stylesheets and scripts are served from this repository | `requirements.md` NFR3, and U1's content-security policy (BR5.10) |
| That the keyboard walkthrough re-runs on all seven page types after this unit | `inception/practices-discovery/team-practices.md` § Testing Posture |

---

## Q1 — How does a small target reach the 44px minimum at phone width?

`requirements.md` NFR7 requires every list row and interactive target to clear
44px at phone width. A list row gets there by being a big block — the interaction
spec derives it explicitly (16px padding on each side plus a 24px title line).
But this site also has **small standalone targets**: the repository link in a
Projects row, the contact links on About, the "All posts" links on a post page.
`interaction-spec.md` § Outbound Link specifies clear space *between* targets and
says nothing about the height of the target itself.

This came up in review of the projects unit, which owns the two-target row but
not the sizing. This unit does own the sizing, so it settles it here.

A. **A shared minimum-target rule applied to every standalone link**: vertical
   padding sufficient to bring any single-line link to a 44px hit area at phone
   width, without changing how it looks. One rule, applied once, and no target
   can be missed.
B. **Per-element sizing, specified case by case** in this unit's spec — one
   figure for the repo link, one for the contact links, one for "All posts".
   More precise, and three places for a future element to be forgotten.
C. **Only at phone width**, via the single breakpoint: standalone links get the
   padding below the breakpoint and their natural size above it. Desktop pointer
   targets stay visually tight.
D. **A shared rule applied at every width**, not just phone. Simplest to reason
   about; makes desktop link targets taller than the design drew them.

[Answer]: C

X. Other (please specify)

---

## Q2 — What does a reader see if the self-hosted font has not loaded?

U5 adds a self-hosted variable font, Latin subset, preloaded in the page head
(`unit-of-work.md` § U5). A preload is a request, and a request can be slow or
fail — a cold cache on a poor connection, or a corrupted deploy. Nothing upstream
says what the page does in that window, and the two usual answers sit on opposite
sides of a decision this project has already made elsewhere: pages are served
complete, with no loading state (NFR2).

A. **Show the fallback font immediately, then swap when the real font arrives.**
   Text is readable from the first paint. The visible cost is a reflow when the
   swap happens, because the two faces have different metrics.
B. **Show the fallback font immediately and never swap for this page load.** No
   reflow at all; a reader on a slow first visit sees the fallback for the whole
   page and the real font from the next page on.
C. **Hide the text briefly, then show the real font, falling back if it is slow.**
   No reflow in the common case; a reader on a slow connection sees a blank
   space where text should be, which reads as the loading state NFR2 forbids.
D. **Choose a fallback stack whose metrics are close to the real font**, and
   swap. Reflow still happens but is small enough not to be noticed. Requires
   picking the fallback stack deliberately rather than accepting a default.

[Answer]: D

X. Other (please specify)

---

## Q3 — One stylesheet, or more than one?

U1's content-security policy is `style-src 'self'` with no `'unsafe-inline'`
(BR5.10), so every style on this site lives in a file served from this repository
— that much is settled and this question does not reopen it. What is not settled
is how many files there are, and it matters for a reason beyond tidiness: the two
registers mean a Post page and a Projects page want different type treatment, and
whether that is one stylesheet or two decides whether a change to the editorial
register can break the technical one.

A. **One stylesheet for the whole site.** Every page loads the same file; the
   registers are two sets of rules inside it. One request, one cache entry, one
   place to look — and a change to one register is a change to a file every page
   loads.
B. **One base stylesheet plus one per register**, loaded as two files on Post and
   Project pages. Editorial changes cannot touch technical pages. Two requests on
   the reading pages, and a token used by both has to live in the base.
C. **One stylesheet per page type**, seven files. Maximum isolation; six copies
   of every shared rule, or a build step to assemble them, which is a build
   capability this site does not otherwise need.
D. **One stylesheet, with the register expressed as a single class on the page
   root.** As A, but the register distinction is one attribute rather than a
   parallel rule set — the smallest set of differences that reads as two
   registers rather than two sites.

[Answer]: D

X. Other (please specify)

---

## Consolidated Summary Confirmation

- **Q1 — Touch targets**: one shared minimum-target rule applied to every
  standalone link below the single breakpoint, giving any single-line link a 44px
  hit area at phone width without changing how it looks. Above the breakpoint
  links keep their natural size.
- **Q2 — Font loading**: a deliberately chosen fallback stack whose metrics are
  close to the self-hosted font, shown immediately, with a swap when the real
  font arrives. Text is readable from first paint and the reflow is small enough
  not to be noticed.
- **Q3 — Stylesheet**: one stylesheet for the whole site, with the editorial or
  technical register expressed as a single class on the page root rather than a
  parallel rule set.

Does this all look correct before I generate the artifact?

- Looks correct
- Request changes

[Answer]: Looks correct
