# Code Generation Questions — U5 Visual Direction

One question. Construction questions are meant to be exceptional rather than
routine, and one is the whole set here because `design-system-mapping.md` is the
design system — every token, every measured contrast figure, and the font face
itself are already decided and approved. What is not decided is a mechanical
question that document had no reason to answer: how the font file physically
enters this repository.

## What was subtracted, and what settled it

| Topic | Settled by |
|---|---|
| Every colour token and its value | `inception/refined-mockups/design-system-mapping.md` § Colour |
| That the palette is dark-only, with no toggle and therefore no JavaScript | § Colour, [Q3] of Refined Mockups |
| The measured contrast table, and that it is the whole contrast verification | § Measured contrast |
| Which font family, which weights, which subset, which licence | § Type § Families — **Source Serif 4**, variable, weights 400 and 600, Latin subset, SIL Open Font License |
| Why a sturdy serif rather than a fine-stroke one | § Type — hairlines thin out on a dark background |
| The body and mono stacks (system, zero bytes) | § Type § Families |
| Every type token, its size, line height and family | § Type § Scale |
| The 66ch measure and the 1100px container | § Type § Measure |
| Every spacing step and where each applies | § Spacing |
| Border, radius, focus-ring and transition tokens | § Borders, radius, and motion |
| That there is exactly one breakpoint, and the phone layout is the desktop layout contracted | BR11.6 |
| That the register is one class on the page root, not a second stylesheet | BR11.3 |
| The 44px floor, as two rules — list rows and standalone links | BR11.8, BR11.1 |
| That styling never reorders focusable elements or removes a focus indicator | BR11.7 |
| What the system deliberately does not contain (no buttons, forms, modals, toasts, skeletons, light palette) | § What this system does not contain |
| Test methodology and ordering | The Testing Contract in `code-generation-plan.md` (resolved, not chosen) |

**U5OQ1 — "which font, specifically?" — is closed by the design system**, which
names Source Serif 4 and gives the reason. This stage confirms that choice
against BR11.2 and BR11.4 rather than reopening it.

**U5OQ2 is explicitly not closable here.** Nothing enforces BR11.5; that is the
accepted consequence of declining the automated accessibility scan, and it is a
Practices Discovery decision rather than a Construction one.

---

## Questions

### Q1 — How does the Source Serif 4 file get into this repository?

BR11.4 says nothing this unit adds may be fetched from another server, and
`team.md` § Deployment says fonts are "copied into this repository and served
from it". Both are satisfied by every option below — the difference is where the
bytes live and what a fresh clone needs.

Two of the three need network access once, to obtain the file. If this machine
cannot reach the network, option C is the fallback and the serif lands later.

- A. **Commit the `.woff2` file directly**, at `src/assets/fonts/`, copied into
  the build output. Roughly 45–70 KB of binary in git, updated by hand if ever.
  A fresh clone has the font without installing anything, and there is no build
  step that could silently stop copying it.
- B. **Add `@fontsource-variable/source-serif-4` to `devDependencies`** and have
  the build copy its `.woff2` into the output. The lockfile is the record, git
  stays free of binaries, and updates come through the same dependency path as
  everything else. Costs one dependency and one build step that must not
  silently fail.
- C. **Ship U5 without the serif for now** — system stacks only, exactly as
  specified for body and code, with the editorial register carried by size and
  spacing rather than by family. Everything else in the design system lands.
  The serif becomes a small follow-up. Removes the only place this unit could
  introduce a third-party request at all.
- X. Other (please specify)

[Answer]: A

**If the file cannot be obtained on this machine**, the fallback is C for this
pass — everything else in the design system lands, and the serif is added by a
small follow-up commit. That is a stated contingency, not a second choice: it is
recorded here so a network failure produces a shipped stylesheet rather than a
blocked unit.

---

## How these were asked

The plan-approval guard refuses every shell command for this stage — including
the `aidlc-log` decision/answer pair — until Plan Approval is explicitly
answered. A logged interview checkpoint therefore cannot exist before Plan
Approval, so the question above was put directly and its answer written here,
exactly as in U1–U4. Plan Approval remains the audited human checkpoint.

---

## Assumptions carried into the plan

| ID | Assumption | Basis |
|---|---|---|
| U5CA1 | Source Serif 4's variable Latin-subset `.woff2` is obtainable under the SIL Open Font License and may be redistributed from this repository. | `design-system-mapping.md` § Type § Families names the licence. |
| U5CA2 | The font is preloaded in the page head and declared with `font-display: swap`, so text renders immediately in the fallback stack. | BR11.2; `design-system-mapping.md` § Type § Families § Cost. |
| U5CA3 | The metric-matched fallback for the serif is the system serif stack (`Georgia, "Times New Roman", serif`), which is the closest widely-available match for a sturdy text serif. | U5A1; no face is named upstream for the fallback. |
| U5CA4 | The stylesheet is authored by hand as one plain CSS file with custom properties, not generated by a preprocessor. | BR11.3 (one stylesheet); no build tooling for CSS exists and adding some is outside this unit. |
| U5CA5 | The register class on the page root uses the `register` field `PageDefinition` already carries, so no template gains a new prop. | BR11.3; U1 established `register: "technical" \| "editorial"`. |

---

---

## Re-entry pass — the Mobbin consultation

The stage gate covering every unit was rejected so that each unit that renders UI
is re-entered with the design reference consulted at build time, which the first
pass did not do. That is now a standing rule:

> Consult Mobbin before Plan Approval for any Code Generation unit that renders
> UI, and name in the plan which page types were checked and against which
> references.
> — `project.md` § Corrections (learned 2026-09-24)

U5 is a `ui` unit and it is the one that decides how every page type looks, so
the check applies with full force. No question above is reopened: [Q1] is
answered, the font landed, and nothing the references turned up touches how the
file enters the repository. What the check produced is recorded in
`code-generation-plan.md` § Mobbin consultation — four corroborations, one change
this pass makes, and one finding left for the author.

**No new question is asked.** The references either agreed with the approved
design or produced a finding, and a finding is weighed at Plan Approval rather
than in a fresh interview round.

---

## Plan Approval

Approve this exact Code Generation plan?

[Approval Fingerprint]: sha256:v3:534d2c85bb80f00a2b611fff26e799bc152ca71b0b72c81a909bf5371ae6cddb
[Planned Source]: e600aaec8ad2e8c228cfd4ab3b5d1681c51e24c7bbbf4a32158283a0b7f299d1

- Approve Plan
- Request Changes

[Answer]: Approve Plan
