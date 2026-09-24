# Code Generation Questions — U2 Blog

One question. Construction questions are meant to be exceptional rather than
routine, and this count is low because the approved upstream artifacts settle
almost everything this unit does — including both questions Functional Design
already asked and answered.

## What was subtracted, and what settled it

These were not asked, because an approved artifact already answers them:

| Topic | Settled by |
|---|---|
| Runtime, language, Markdown renderer, highlighter, front-matter parser, formatter, linter, test runner | U1 `code-generation-questions.md` [Q1], [Q2]; the stack is chosen and in the lockfile |
| Feed format and how much of a post travels in it | `u2-blog/functional-design/functional-design-questions.md` [Q1] — Atom, summary only |
| What happens when a code fence names an unknown language | Same file, [Q2] — an unlabelled fence renders plain and silently; a labelled unknown one fails the build naming file and language (BR8.2) |
| The Writing row's content, its ordering and that the whole row is one link | BR8.5, BR8.6; U1 BR2.4; `requirements.md` FR2.1, FR2.2, FR2.3 |
| The post page's four values and both "All posts" links | BR8.4, BR8.7; `requirements.md` FR2.4, FR2.8 |
| The Writing empty state and its route to Projects | `requirements.md` FR2.9; U1 BR5.5 |
| The four-token code theme and that no token reuses the link accent | `inception/refined-mockups/interaction-spec.md` § Code Block |
| That colouring happens at build time and nothing runs in the reader's browser | `requirements.md` FR2.7, NFR2, NFR3 |
| Test methodology, ordering, volume and the coverage floor | The Testing Contract in `code-generation-plan.md` (resolved, not chosen) |
| Every markup treatment — colour, spacing, measure, focus ring | U5's unit. This one emits structure and class names only |

What remains genuinely open is the one thing no upstream artifact names: **where
the feed lives**. `requirements.md` FR5.1 requires a feed and does not give it a
URL; `mockups.md` draws no subscribe affordance on any page type; and
`functional-spec.md` assumption U2A3 records that the path "never changes once
published" and that a moved feed URL silently unsubscribes every reader. That
makes it the one decision in this unit with the same irreversible cost NFR8
attaches to a post slug — so it is asked rather than assumed.

---

## Questions

### Q1 — Where does the feed live, and how does a reader find it?

Two parts, decided together because the second depends on the first.

**The path** is permanent in the way a post slug is permanent. GitHub Pages has
no server-side redirects (constraint C4), so a feed that moves cannot be
forwarded — every existing subscriber simply stops receiving posts, and with
analytics excluded from this initiative entirely, nothing would ever tell you it
happened.

**Discovery** has two independent mechanisms. An autodiscovery `<link
rel="alternate" type="application/atom+xml">` in every page head is how feed
readers find a feed when someone pastes the site's URL into one; it is invisible
and costs nothing. A *visible* link is how a person finds it by looking. The
mockups draw the footer as the copyright line alone
(`refined-mockups/mockups.md` § Global Shell), so a visible link is an addition
to an approved layout rather than something it already carries — which is why it
is offered here rather than assumed either way.

- A. **`/feed.xml`, autodiscovery link in every page head, no visible link.** The
  conventional path and the conventional mechanism. A reader who pastes
  `rue-asha.github.io` into a feed reader gets subscribed; the approved layout is
  unchanged. Someone hunting for the feed by eye finds nothing.
- B. **`/feed.xml`, autodiscovery link, plus a visible "Feed" link in the site
  footer.** Both mechanisms. Costs one addition to the global shell that
  `mockups.md` does not draw, on every page of the site.
- C. **`/atom.xml`, autodiscovery link, no visible link.** As A, with the format
  named in the URL. Honest about what the file is; slightly less recognised than
  `/feed.xml`, which readers of every format use.
- D. **`/writing/feed.xml`, autodiscovery link, no visible link.** Puts the feed
  under the section it syndicates, and leaves the root free if a second feed is
  ever wanted. Nothing in scope plans one, so this buys an option that may never
  be exercised.
- X. Other (please specify)

[Answer]: A

---

## How these were asked

The plan-approval guard refuses every shell command for this stage — including
the `aidlc-log` decision/answer pair — until Plan Approval is explicitly
answered. A logged interview checkpoint therefore cannot exist before Plan
Approval, so the question above was put directly and its answer written here.
Plan Approval remains the audited human checkpoint, and the plan this answer
produces is exactly what its fingerprint binds. This is the same route U1 took,
recorded for the same reason.

---

## Second pass — the Mobbin re-entry

The question above is from the first pass. It is answered, still binding, and is
not re-asked: the feed's path and how it is discovered are settled and this pass
changes neither.

Nothing new was asked. The re-entry has one instruction — consult Mobbin before
Plan Approval for any unit that renders UI, and name in the plan which page types
were checked against which references (`project.md` § Corrections). For this unit
the check confirmed both page types against the approved mockups and turned up one
correction: a false claim about the footer, repeated from U1 into this unit's plan
and summary. A correction to a factual error is not an open question, and the two
patterns the references show that this site does not use — per-row tags, and a
left-rail date column — are findings for the approval gate rather than questions,
because both are scope or design decisions the human owns.

---

## Plan Approval

Approve this exact Code Generation plan?

[Approval Fingerprint]: sha256:v3:f8b9979213593da60a4ccfb2932f1e8c503d50f5267871f6bf6a385f97b1ceb3
[Planned Source]: 3c5325f786f1ead6d4ef307ba6c679ae6768f009a6b5163a93f5f7f5ff0874d1

- Approve Plan
- Request Changes

[Answer]: Approve Plan
