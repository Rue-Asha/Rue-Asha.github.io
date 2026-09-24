# Unit Test Instructions — U6 Launch Content

**This unit authors no unit test, and that is the specified outcome rather than
an omission.** This file records why, what is run instead, and what the coverage
floor resolves to — because "no tests" written without a reason is
indistinguishable from "no tests" written out of haste.

**Second pass.** Nothing below changes. The re-entry adds no test, alters no
command, and touches no threshold — it re-runs exactly these checks against the
site as it now stands, U5's stylesheet included, and records the `draft`-mark
correction the plan carries. One row is added to § What no automated check
covers, because [Q2] made it a live consideration rather than a non-existent one.

## Why there is no test to write

`unit-of-work.md` § U6 instructed it and `functional-spec.md` carried it
forward: U6 contains no code, no branching and no transformation. Its whole
deliverable is two Markdown files that instantiate a content model U1 authored
and U2 and U3 render.

`team.md` § Testing Posture defines what needs a unit test — "a function that
branches or transforms data: date formatting, excerpt or summary derivation,
post sorting, slug generation, feed or sitemap construction" — and adds that
template markup and configuration do not. Prose is further from that line than
either.

A test written here would assert that a file this unit just wrote contains the
fields this unit just put in it. It would pass by construction, forever, and
`construction.md` § Testing Standards forbids exactly that: "Do not generate
tests that always pass regardless of implementation."

## The coverage floor

```
N/A — no instrumentable lines in this unit
```

`team.md` § Testing Posture requires the floor's applicability to be determined
per unit and recorded with its reason, and is explicit that **zero instrumentable
lines produces no measurement, not a pass**. The reason here is that Markdown
prose is not instrumentable code.

This is recorded at Build and Test as the `N/A` above with that reason, never as
a passing figure.

## What is run instead

### The three blocking checks — this unit's real verification

```bash
npm run build
npm run check
```

All three must pass before the push:

| # | Check | What it catches here |
|---|---|---|
| 1 | The site builds | A malformed field, an unparseable date, a fence naming an unknown language |
| 2 | Every content file produced an output page | **The one that matters most for this unit** — a new post or project silently absent from the output |
| 3 | Internal links resolve | A link in the new prose pointing at a page that does not exist |

Check 2 exists for precisely this case. `team.md` calls it "the one that catches
this site's most likely real failure: a build that succeeds while silently
dropping a post". This unit adds two content files, so it is the unit that check
most directly protects.

Check 1 is also what enforces the content model: U1 BR4.2–BR4.4 make a missing
or malformed field a build failure that names the file and the field, so the
build is the field validator and no separate assertion is needed.

### The existing suite stays green

```bash
npx vitest run tests/u1 tests/u2 tests/u3 tests/u4 tests/u5 --coverage
```

No new test, no changed test, and `vitest.config.ts`'s `thresholds.lines: 80` is
not touched. Adding two content files must not move any of it; if it does, that
is a defect in an earlier unit that this unit has surfaced.

### Formatting

```bash
npm run format:check
```

Prettier runs with `proseWrap: "preserve"` and a `.prettierignore` entry for the
content tree, because `team.md` § Code Style forbids the formatter rewriting the
text of a post: where the author broke a line is usually deliberate, and a
formatter rewriting front matter can change how a post is parsed.

**If Prettier tries to reformat either new file, that is a finding about the
configuration, not a reason to let it reformat prose.**

## What no automated check covers

| Not covered | Covered by |
|---|---|
| Whether the prose is accurate | The author, refining the drafts |
| Whether the prose is any good | The author |
| Whether an image has alt text | An authoring rule (U2 BR8.1); the build does not check it. Neither new file references an image |
| Whether an outbound link still resolves | Nothing, by choice — `team.md` makes external links never build-blocking |
| Whether the slugs are the right slugs | Nobody, and they are permanent (NFR8). Both were chosen once, deliberately, and `homelab` is fixed by a link the Homelab README already publishes |
| Whether a piece *should* have been a draft | Nobody. U1 BR1.6/BR1.7 make `draft: true` hide an item, and [Q2] answer B chose not to use it for either file. Nothing checks that choice; adding the key later hides the page, and removing it publishes it |

The last row was believed not to exist until this pass. The one above it is still
the one worth re-reading before the push: every other mistake in this unit is
cheap to fix, and a published slug is not.
