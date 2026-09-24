# Entity Model — U6 Launch Content

**Not applicable. This unit introduces no entity.**

```yaml
# Source of truth for this unit's entity set. It is empty, and that is the
# resolution Units Generation instructed, not an unfinished file:
# unit-of-work.md § U6 states this unit "contains no code, no branching, and
# no transformation", so it introduces no entity of its own.
#
# The entities this unit's files are INSTANCES of are declared in full at
# construction/u1-publishable-site-shell/functional-design/entities.md.
# Restating them here would give the project two definitions of one model,
# which can drift; the table below points at the authoritative one instead.
entities: []
constraints: []
relationships: []
```

U6's deliverable is written content: one or two posts and one or two project
write-ups. Its files are *instances* of entities that already exist — `Post` and
`Project`, both authored in full by U1 — not new entities, and not extensions of
existing ones. Nothing here has a shape, a type, a constraint, or a relationship
that `construction/u1-publishable-site-shell/functional-design/entities.md` does
not already define.

`inception/units-generation/unit-of-work.md` § U6 instructed this outcome: the
unit "contains no code, no branching, and no transformation", so "its design
stage should resolve as not applicable with this reason, exactly as an
inapplicable screen state is marked rather than filled."

Writing an entity model here would mean restating U1's `Post` and `Project` under
a second heading. Two statements of one model is worse than one, because they can
drift and a reader has no way to tell which is authoritative.

## Sources

- [upstream] `inception/units-generation/unit-of-work.md` § U6 — the boundary and
  the instruction to record this as not applicable
- [upstream] `inception/units-generation/unit-of-work-story-map.md` § U6 — U6
  delivers no functional or non-functional requirement
- [upstream] `inception/requirements-analysis/requirements.md` — FR2.5 and FR3.3,
  whose field sets this unit's files must satisfy as instances
- [upstream] `inception/domain-design/components.md` — § Entity Ownership, which
  assigns `Post` to `PostCatalog` and `Project` to `ProjectCatalog`; U6 changes
  neither and adds no third owner
- [upstream] `construction/u1-publishable-site-shell/functional-design/entities.md`
  — the authoritative model this unit's files are instances of

The declared `contract-summary` input is absent: Contract Design is SKIP in this
scope.

## Where the model actually lives

| Entity | Owning component | Authoritative definition |
|---|---|---|
| Post | PostCatalog | `construction/u1-publishable-site-shell/functional-design/entities.md` |
| Project | ProjectCatalog | Same |

If a launch post or project needs a field that model does not carry, that is a
change to U1's entity model — agreed and written there — not a second definition
added here.
