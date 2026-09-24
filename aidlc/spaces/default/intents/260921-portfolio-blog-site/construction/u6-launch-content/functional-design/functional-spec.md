# Functional Specification — U6 Launch Content

**Not applicable, and this file records that rather than inventing content to
fill the slot.**

U6 contains no code. Its deliverable is one or two written posts and one or two
written project write-ups — prose in Markdown files, using the content model,
templates and rules that U1 to U5 already built and specified. There is no
behaviour to specify, no workflow this unit introduces, no state machine, and no
entity or rule of its own.

`inception/units-generation/unit-of-work.md` § U6 anticipated exactly this and
instructed it: *"No design artifact applies, and that should be recorded rather
than invented. This unit contains no code, no branching, and no transformation —
so there is no functional design to write, no unit test to author, and no
instrumentable line for the coverage floor to measure. Its design stage should
resolve as not applicable with this reason."*

This file, its sibling `entities.md` and `rules.md`, and `traceability.json` are
that resolution. They exist because the stage's artifact contract requires the
files; their content is the reason they are empty.

## Sources

- [upstream] `inception/units-generation/unit-of-work.md` § U6 — the boundary
  ("content files only: no templates, no build code, no styling"), the
  instruction above, and the reason U6 is a unit at all
- [upstream] `inception/units-generation/unit-of-work-story-map.md` § U6 — U6
  delivers **no functional requirement and no non-functional one**, stated there
  rather than papered over with a token mapping
- [upstream] `inception/requirements-analysis/requirements.md` — FR1.5, the
  fail-loudly build these files are subject to; FR2.5 and FR3.3, the field sets
  this unit's files must satisfy; NFR8, which makes their file names permanent;
  and NFR9, the three blocking checks that run before a content commit is pushed.
  None of these five is *delivered* by U6, and all of them *constrain* it — which
  is exactly how `traceability.json` records them, each `N/A` with the unit that
  does deliver it. `rules.md` § Sources names the same five.
- [upstream] `inception/domain-design/components.md` — no component is added,
  changed, or deepened by this unit; `ContentSource`, `PostCatalog` and
  `ProjectCatalog` consume its files exactly as they consume any others

The declared `contract-summary` input is absent: Contract Design is SKIP in this
scope. That absence is by scope design, not a gap in this unit.

---

## Why "not applicable" is the correct answer here

Three tests, each of which this unit fails, and failing all three is what makes
the conclusion sound rather than convenient:

| Test | U6 |
|---|---|
| Does it introduce behaviour a developer must implement? | No. Every behaviour its files exercise was specified by U1, U2 and U3. |
| Does it introduce data that needs a shape, a type, or a constraint? | No. Its files are instances of `Post` and `Project`, whose shape U1 authored. |
| Does it introduce a decision that could be made more than one way? | No. Where a post lives, what fields it needs, how it is ordered and how it is published are all settled. |

A unit that fails all three has no functional design. Writing one anyway would
produce a document restating U1 to U3 under a new heading, which is worse than
nothing: a reader would have two statements of the same rule and no way to know
which is authoritative when they drift.

---

## What this unit is still bound by

Not applicable does not mean unconstrained. Everything below already exists and
applies to U6's files; it is listed so the unit's own definition of done is
concrete rather than assumed.

| Constraint | Where it was decided |
|---|---|
| Every post carries `title`, a one-line summary, and `date` | U1 BR2.1–BR2.3, from FR2.5 |
| Every project carries `name`, summary, `year`, `type`, `tools`, `repo` | U1 BR3.1–BR3.4, from FR3.3 |
| Dates are ISO 8601 calendar dates, strictly parsed | U1 BR2.3 |
| A missing or malformed field fails the build, naming file and field | U1 BR4.2–BR4.4 |
| Content lives at `content/posts/<slug>/index.md` and `content/projects/<slug>/index.md` | U1 BR1.2–BR1.4 |
| The item's directory name is the slug, lowercase kebab-case ASCII, and never changes once live | U1 BR1.4, from NFR8 |
| Images in a post carry alt text — an authoring rule the build does not check | U2 BR8.1 |
| A labelled code fence naming an unknown language fails the build | U2 BR8.2 |
| The three blocking checks pass before the push, for content commits too | `team-practices.md` § Testing Posture, NFR9 |
| Content commits go straight to `main`; no branch, no merge | `team-practices.md` § Way of Working |

**The last two are the ones most likely to be skipped**, because a content commit
feels too small to check. `team-practices.md` states the exemption precisely:
content commits are exempt from branching, not from checking.

---

## How a not-applicable unit is recorded in traceability.json

Worth stating, because the file's shape is not self-explanatory and the next
person to open it will otherwise assume it was left half-finished.

- **`coverage`** lists the five requirements that *constrain* U6's files —
  FR1.5, FR2.5, FR3.3, NFR8, NFR9 — each with status `N/A` and a target saying
  which unit actually delivers it. None of them is delivered by U6; that is
  what `N/A` records. An empty `coverage` array was the previous shape and was
  wrong twice over: it says nothing about the constraints U6's files are
  genuinely subject to, and the traceability check rejects it outright.
- **`reverse`** explains every `BRx.y` this unit's `rules.md` mentions. The
  check derives candidate orphans by scanning `rules.md` for rule IDs, and it
  cannot tell a borrowed reference from a rule this unit authored and forgot to
  map. Each entry names the authoring unit, so the twelve IDs in that table
  read as inherited obligations rather than twelve unexplained rules of ours.

**One check finding remains, and it is not specific to this unit.** The
traceability check also requires a unit's `upstream_ids` to contain *every*
requirement ID in `requirements.md`, not only the ones that bear on that unit.
No unit in this initiative satisfies that — U1 through U5 each carry the same
finding, in proportion to how much of the requirement set they leave to their
siblings. Padding this unit's `upstream_ids` with all thirty-six unrelated
requirement IDs would clear the finding while making the file claim the whole
requirement set, which is false and contradicts
`inception/units-generation/unit-of-work-story-map.md` § U6. So it is left
failing and written down here instead. The check is advisory, so it does not
hold the gate; it is recorded as a known limitation, not as a defect in this
unit's content.

## Assumptions & Open Questions

| ID | Assumption | Invalidated by |
|---|---|---|
| U6A1 | The launch content can be written entirely within the field sets and capabilities U1 to U5 provide, without needing a presentation capability the layout lacks. | A post that wants a callout, a side-by-side image pair, or a diagram wrapper. `team-practices.md` § Code Style already governs that case: it becomes a named reusable include, used by name, never one-off markup pasted into prose — which would make it a change to U2's templates rather than content work. |
| U6A2 | One or two posts and one or two projects is enough that the site does not look empty at launch. This is the approved scope's own figure. | Nothing in this initiative; it is a judgement the author makes on seeing the live site. |

| ID | Open question | Who closes it |
|---|---|---|
| U6OQ1 | None. Units Generation settled this unit's shape and instructed this stage's outcome; nothing was handed here unresolved. Stated explicitly rather than left as an empty heading. | — |
