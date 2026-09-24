# Code Generation Questions — U4 About Page

Two questions. Construction questions are meant to be exceptional rather than
routine, and two is the whole set here because U4's design settled everything
structural and left exactly two things open — both of them facts about the
author that no artifact in this workflow contains or could invent.

## What was subtracted, and what settled it

These were not asked, because an approved artifact already answers them:

| Topic | Settled by |
|---|---|
| Where the About prose lives (template, not a content file) | `construction/u4-about-page/functional-design/functional-spec.md` BR10.1, [Q1] |
| Whether `ContentFile.kind` gains a third value | BR10.1 — it does not |
| The page's URL | BR10.3 — `/about` |
| The component shape, its props and its branches | `functional-design/frontend-components.md` § Props and branches; `AboutPage`/`AboutProse`/`ContactLinks` take nothing, `ContactLink` takes `label` and `href` |
| That U4's signature supersedes U1's skeleton `AboutPage` and drops `renderedBody` | `frontend-components.md` § This signature supersedes U1's skeleton `AboutPage` |
| How contact links are emitted (plain outbound links, real accessible names, no widget, no third-party icon) | BR10.2 |
| Head title and description behaviour | U1 BR5.8, W1 step 2 |
| Navigation placement and the one-click route | U1 BR5.7, FR4.5 |
| Test methodology and ordering | The Testing Contract in `code-generation-plan.md` (resolved, not chosen) |
| Responsive and touch-target commitments | `frontend-components.md` § Responsive behaviour, NFR6/NFR7 |

What remains open is only the page's actual content: BR10.3 requires prose
saying who the author is and at least one contact or profile link, and states
that neither may be empty. Both are the author's own facts.

---

## Questions

### Q1 — What should the About page say?

BR10.3 requires prose identifying the author, and says a heading with nothing
beneath it does not satisfy the rule. The site already says, on Home, "I build
things and write about what I am currently learning or find interesting."
About is the longer version of that.

Remember the trade this unit accepted: this prose lives in the template, so
changing it later is a code change on a branch, and the formatter will rewrite
its line breaks (BR10.1, U4A2).

- A. **Draft it from what the site already says.** Two or three short paragraphs
  built from the Home intro and the project currently listed, in the same
  technical register as the rest of the site. You read it at the approval gate
  and change anything that is wrong.
- B. **One short paragraph only.** The minimum that satisfies BR10.3 — who the
  author is and what the site is for, nothing more. Least to maintain.
- C. **You give me the text.** Paste the prose you want and it goes in verbatim.
- X. Other (please specify)

[Answer]: A

### Q2 — Which contact or profile links should the page carry?

BR10.3 requires at least one. BR10.2 requires each to be a plain outbound link
named for its destination — no embedded widget and no third-party icon set,
both of which the content-security policy breaks outright.

This repository is published from the `Rue-Asha` GitHub account, so that profile
is `https://github.com/Rue-Asha`. An email address is a publishing decision
rather than something to infer: an address on a public page is scraped, so it is
only included if you name one.

- A. **GitHub only** — one link to `https://github.com/Rue-Asha`.
- B. **GitHub and an email address** — the GitHub link above plus a `mailto:`
  link to an address you give me.
- C. **GitHub plus other profiles you name** — the GitHub link above plus any
  further destinations you list, no email.
- X. Other (please specify)

[Answer]: B

#### Q2 follow-up — which address?

Asked because B names an email link without naming the address, and an address
on a public page is scraped. The author was offered the address on their account
(`ornab.rahman@c24.de`, a work address) and named a different one instead.

[Answer]: rue.asha@proton.me

---

## How these were asked

The plan-approval guard refuses every shell command for this stage — including
the `aidlc-log` decision/answer pair — until Plan Approval is explicitly
answered. A logged interview checkpoint therefore cannot exist before Plan
Approval, so the questions above were put directly and their answers written
here, exactly as in U1, U2 and U3. Plan Approval remains the audited human
checkpoint, and the plan these answers produce is exactly what its fingerprint
binds.

---

## Assumptions carried into the plan

Recorded rather than asked, because each follows from an approved artifact or is
reversible at no cost.

| ID | Assumption | Basis |
|---|---|---|
| U4CA1 | The drafted prose is a starting point the author edits at the approval gate, not a final editorial statement. Q1 answer A says so explicitly. | Q1, answer A. |
| U4CA2 | The email link is a plain `mailto:` anchor with the address as its visible text, not obscured behind a script. | BR10.2 — plain outbound links, and U1's policy carries `script-src 'none'`, so any script-based obfuscation would not run. |
| U4CA3 | Both links carry accessible names identifying their destination ("Rue Asha on GitHub", the address itself for email) rather than bare labels. | BR10.2. |
| U4CA4 | The two links are separate block-level elements rather than a side-by-side icon row, so each clears the 44px touch minimum. | `frontend-components.md` § Responsive behaviour, NFR7. |

---

## Second pass — the Mobbin re-entry

Everything above is from the first pass. It is answered, still binding, and is
not re-asked — the prose and the two links are settled, and this pass changes
neither what the page says nor what it looks like.

Nothing new was asked. The re-entry has one instruction — consult Mobbin before
Plan Approval for any unit that renders UI, and name in the plan which page types
were checked against which references (`project.md` § Corrections). For this unit
the check did two things, neither of which is an open question:

1. It **corroborated a deviation already on record**. `mockups.md` § About draws
   the elsewhere links as a row; the code emits them stacked, recorded as
   assumption U4CA4 on phone-target grounds. Harvest and the GitHub ReadME
   profile both stack; the one reference that uses a row uses icon buttons, a
   form this site cannot take. The deviation is now corroborated rather than
   merely asserted.
2. It surfaced **one change this unit already owed**: `renderAbout` still carries
   its own literals for the two contact URLs that U1's pass moved into
   `SITE_LINKS`. U1's plan named that as U4's edit precisely so it would not be
   lost between the units, and this pass closes it.

The one pattern the references show that this site does not use — a muted label
before each elsewhere value — is a finding for the approval gate rather than a
question, because it is a § About redraw the human owns.

---

## Plan Approval

Approve this exact Code Generation plan?

[Approval Fingerprint]: sha256:v3:a3c455034f08097864f0cc7f0671c3bfd8c72c36bde6a0fcd8b4ec6eaf01e8d9
[Planned Source]: 5a4cb7eb11c93d339f7101fd659a250c6b4b805f35f1136d8163fde35b01b90d

- Approve Plan
- Request Changes

[Answer]: Approve Plan
