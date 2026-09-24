# Functional Design Questions — U6 Launch Content

**No questions. This unit's functional design resolves as not applicable, and
that outcome was instructed upstream rather than decided here.**

`inception/units-generation/unit-of-work.md` § U6 states it directly: the unit
"contains no code, no branching, and no transformation — so there is no
functional design to write, no unit test to author, and no instrumentable line
for the coverage floor to measure. Its design stage should resolve as not
applicable with this reason."

Asking questions here would mean inventing the content that instruction exists to
prevent. The three artifacts this stage produced record the not-applicable
outcome and the obligations U6's files inherit; they introduce nothing of their
own.

## What was subtracted, and what settled it

| Topic | Settled by |
|---|---|
| That U6 contains content files only — no templates, no build code, no styling | `inception/units-generation/unit-of-work.md` § U6 |
| That U6 delivers no functional and no non-functional requirement | `inception/units-generation/unit-of-work-story-map.md` § U6 |
| The `Post` and `Project` entity models this unit's files are instances of | `construction/u1-publishable-site-shell/functional-design/entities.md` |
| Required fields for a post and for a project, and strict date parsing | U1 BR2.1–BR2.3, BR3.1–BR3.4, from FR2.5 and FR3.3 |
| That a missing or malformed field fails the build naming file and field | U1 BR4.2–BR4.4 |
| Where content lives, and that a published slug never changes | U1 BR1.2–BR1.4, from NFR8 |
| Alt text on images, and the unknown-code-fence-language build failure | U2 BR8.1–BR8.2 |
| That the three blocking checks run before the push for content commits too | `inception/practices-discovery/team-practices.md` § Testing Posture |
| That content commits go straight to `main` — no branch, no merge | Same, § Way of Working |
| That a post needing a presentation capability the layout lacks becomes a named reusable include, which makes it U2 template work rather than content work | Same, § Code Style |

---

## Consolidated Summary Confirmation

- **Outcome**: U6's functional design is **not applicable**. The unit fails all
  three applicability tests — it introduces no behaviour to implement, no data
  needing a shape, and no decision that could be made more than one way.
- **Why it is recorded rather than skipped silently**: Units Generation
  instructed this outcome, and the stage's artifact contract requires the files.
  Each file states the reason it is empty rather than restating U1 to U3 under a
  new heading, which would give the project two statements of each rule that can
  drift apart.
- **`functional-spec.md`**: the three applicability tests and how U6 fails each,
  plus a table of the ten constraints U6's files are still bound by with where
  each was decided — flagging that the pre-push checks and the direct-to-`main`
  content path are the two most likely to be skipped, because a content commit
  feels too small to check.
- **`entities.md`**: no entity introduced. `Post` and `Project` remain owned by
  `PostCatalog` and `ProjectCatalog`, defined in U1; a launch file needing a new
  field is a change to U1's model, not a second definition here.
- **`rules.md`**: no business rule introduced. The nine rules governing this
  unit's files are listed with their authoring unit (U1 or U2), so the
  obligations are concrete without being re-authored.
- **Assumptions carried**: U6A1 — the launch content fits within the capabilities
  U1 to U5 provide, invalidated by a post wanting a callout, image pair, or
  diagram wrapper. U6A2 — one or two posts and one or two projects is enough that
  the site does not look empty, which is the approved scope's own figure.
- **Open questions**: none. Nothing was handed to this stage unresolved.

Does this all look correct before I generate the artifact?

- Looks correct
- Request changes

[Answer]: Looks correct
