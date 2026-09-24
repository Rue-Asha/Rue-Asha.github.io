# Business Rules — U6 Launch Content

**Not applicable. This unit introduces no business rule.**

```yaml
# Source of truth for this unit's business rules. It is empty, and that is the
# resolution Units Generation instructed, not an unfinished file:
# unit-of-work.md § U6 states this unit "contains no code, no branching, and
# no transformation", so there is no decision here for the system to make.
#
# The rules this unit's FILES are subject to are authored in U1 and U2 and are
# tabulated below with their authoring unit. They are listed, never
# re-declared: a second numbered statement of a rule can drift from the first,
# and a reader would have no way to tell which governs. Each BRx.y named below
# is also recorded in traceability.json § reverse as N/A with its owning unit,
# so the derived-orphan check can tell a borrowed reference from an
# unexplained rule of our own.
rules: []
```

A business rule is a decision the system makes. U6's deliverable is prose, and
prose makes no decisions: the rules its files are subject to were all authored
earlier, by the units that built the machinery reading them. There is nothing
here for a developer to implement and nothing for a check to enforce that is not
already enforced.

`inception/units-generation/unit-of-work.md` § U6 instructed this outcome
directly, and the reason is worth keeping in view: inventing rules for a unit
that has none would mean restating U1's, U2's and U3's under new numbers, giving
this project two statements of each rule that can drift apart.

## Sources

- [upstream] `inception/units-generation/unit-of-work.md` § U6 — the boundary
  ("content files only") and the instruction to record this as not applicable
- [upstream] `inception/units-generation/unit-of-work-story-map.md` § U6 — U6
  delivers no functional or non-functional requirement, and the blocking check
  set still applies to its files
- [upstream] `inception/requirements-analysis/requirements.md` — FR1.5, FR2.5,
  FR3.3, NFR8, NFR9, which constrain this unit's files without being delivered
  by it
- [upstream] `inception/domain-design/components.md` — `ContentSource`,
  `PostCatalog` and `ProjectCatalog`, which consume this unit's files exactly as
  they consume any others; no component changes
- [upstream] `construction/u1-publishable-site-shell/functional-design/rules.md`
  and `construction/u2-blog/functional-design/functional-spec.md` — where the
  rules that govern this unit's files actually live

The declared `contract-summary` input is absent: Contract Design is SKIP in this
scope.

## The rules that govern this unit's files, and where they live

None of these is authored here. They are listed so the unit's obligations are
concrete, and each points at its authoritative home.

| Rule | What it requires of a launch file | Authored in |
|---|---|---|
| BR1.2 | The file is `index.md` inside its own item directory | U1 |
| BR1.4 | The directory name is the slug: lowercase, kebab-case, ASCII | U1 |
| BR1.5 | No two items of the same kind share a slug | U1 |
| BR1.6 | `draft: true` and only that marks a draft | U1 |
| BR2.1–BR2.3 | A post carries `title`, a one-line summary, and a strict ISO date | U1 |
| BR3.1–BR3.4 | A project carries its six required fields, correctly shaped | U1 |
| BR4.2–BR4.4 | A missing or malformed field fails the build naming file and field, and nothing is written | U1 |
| BR8.1 | Images carry alt text — an authoring rule, not checked by the build | U2 |
| BR8.2 | A labelled code fence naming an unknown language fails the build | U2 |

**The one obligation that is easy to miss** is not in this table because it is not
a business rule: `team-practices.md` § Testing Posture requires the three
blocking checks to pass before the push for content commits as well as code
commits. A content commit is exempt from branching, not from checking.
